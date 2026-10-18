"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { generateTrackingNumber } from "@/lib/tracking-number";
import { matchZoneCode } from "@/lib/zones";
import { estimateQuote } from "@/lib/rating";
import { shipmentSchema } from "@/lib/validation";
import type { ParcelInput } from "@/lib/pricing";
import { notifyStatusChange } from "@/lib/notifications";
import type { ActionResult } from "@/server/auth.actions";

async function resolveZoneId(postalCode: string): Promise<string | null> {
  const zone = await prisma.serviceZone.findUnique({ where: { code: matchZoneCode(postalCode) } });
  return zone?.id ?? null;
}

function newTrackingNumberCandidates(n: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < n; i++) out.push(generateTrackingNumber());
  return out;
}

async function createWithUniqueTracking(
  data: Omit<Prisma.ShipmentUncheckedCreateInput, "trackingNumber">,
): Promise<{ id: string; trackingNumber: string }> {
  // Retry on the rare unique-constraint collision.
  for (const trackingNumber of newTrackingNumberCandidates(5)) {
    try {
      const created = await prisma.shipment.create({
        data: { ...data, trackingNumber },
        select: { id: true, trackingNumber: true },
      });
      return created;
    } catch (err) {
      const isUnique =
        typeof err === "object" && err !== null && "code" in err && (err as { code?: string }).code === "P2002";
      if (!isUnique) throw err;
    }
  }
  throw new Error("Could not allocate a tracking number. Please try again.");
}

export async function createShipmentAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult & { trackingNumber?: string; shipmentId?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You must be signed in to create a shipment." };
  }
  const userId = session.user.id;

  let parcelsInput: unknown = [];
  try {
    parcelsInput = JSON.parse(String(formData.get("parcelsJson") ?? "[]"));
  } catch {
    return { ok: false, error: "Invalid parcel data." };
  }

  const payload = {
    serviceLevelCode: String(formData.get("serviceLevelCode") ?? ""),
    pickupDate: String(formData.get("pickupDate") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    sender: JSON.parse(String(formData.get("senderJson") ?? "{}")),
    recipient: JSON.parse(String(formData.get("recipientJson") ?? "{}")),
    parcels: parcelsInput,
  };

  const parsed = shipmentSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please review the shipment details." };
  }
  const data = parsed.data;

  const serviceLevel = await prisma.serviceLevel.findUnique({ where: { code: data.serviceLevelCode } });
  if (!serviceLevel) return { ok: false, error: "Selected service is unavailable." };

  const parcelInputs: ParcelInput[] = data.parcels.map((p) => ({ weightKg: p.weightKg, pieces: p.pieces }));
  const quote = await estimateQuote({
    destinationPostalCode: data.recipient.postalCode,
    serviceLevelCode: data.serviceLevelCode,
    parcels: parcelInputs,
  });

  const senderZoneId = await resolveZoneId(data.sender.postalCode);
  const recipientZoneId = await resolveZoneId(data.recipient.postalCode);

  const [senderAddress, recipientAddress] = await prisma.$transaction([
    prisma.address.create({
      data: { userId, ...data.sender, line2: data.sender.line2 || null, region: data.sender.region || null, zoneId: senderZoneId },
    }),
    prisma.address.create({
      data: { userId, ...data.recipient, line2: data.recipient.line2 || null, region: data.recipient.region || null, zoneId: recipientZoneId },
    }),
  ]);

  const shipment = await createWithUniqueTracking({
    userId,
    status: "CREATED",
    serviceLevelId: serviceLevel.id,
    senderAddressId: senderAddress.id,
    recipientAddressId: recipientAddress.id,
    pickupDate: data.pickupDate ? new Date(data.pickupDate) : null,
    price: quote.breakdown.total,
    currency: quote.currency,
    notes: data.notes || null,
    parcels: {
      create: data.parcels.map((p) => ({
        description: p.description,
        weightKg: p.weightKg,
        pieces: p.pieces,
        lengthCm: p.lengthCm ?? null,
        widthCm: p.widthCm ?? null,
        heightCm: p.heightCm ?? null,
        declaredValue: p.declaredValue ?? null,
      })),
    },
    trackingEvents: {
      create: [
        {
          statusCode: "CREATED",
          location: `${data.sender.city}, ${data.sender.country}`,
          note: "Order received. Awaiting pickup confirmation.",
          isPublic: true,
          source: "CUSTOMER",
          recordedById: userId,
          occurredAt: new Date(),
        },
      ],
    },
  });

  // Fire-and-forget the confirmation notification (logs a failure silently).
  const createdEvent = await prisma.trackingEvent.findFirst({
    where: { shipment: { trackingNumber: shipment.trackingNumber }, statusCode: "CREATED" },
    orderBy: { occurredAt: "desc" },
  });
  if (createdEvent) {
    notifyStatusChange({ shipmentId: createdEvent.shipmentId, eventId: createdEvent.id }).catch(() => {});
  }

  return { ok: true, trackingNumber: shipment.trackingNumber, shipmentId: shipment.id };
}
