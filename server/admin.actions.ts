"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getAdminSession, ASSIGNABLE_ROLES, type AssignableRole } from "@/server/admin.service";
import { STATUS_META, isShipmentStatus, type ShipmentStatus } from "@/lib/shipment-status";
import { notifyStatusChange } from "@/lib/notifications";
import type { ActionResult } from "@/server/auth.actions";

const PAYMENT_METHODS = ["PAY_ON_DELIVERY", "CASH", "CARD_ON_DELIVERY", "INVOICE"] as const;
type PaymentMethod = (typeof PAYMENT_METHODS)[number];

function revalidateShipment(shipmentId: string, trackingNumber: string) {
  revalidatePath(`/ops/shipments/${shipmentId}`);
  revalidatePath(`/account/shipments/${shipmentId}`);
  revalidatePath(`/track/${trackingNumber}`);
  revalidatePath("/ops");
}

/**
 * ADMIN only: jump a shipment to ANY status, bypassing the state machine. This
 * is deliberately broader than the staff advance action — recorded as a public
 * OPS event with an explicit "admin override" note.
 */
export async function forceShipmentStatusAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult & { newStatus?: ShipmentStatus }> {
  const session = await getAdminSession();
  if (!session) return { ok: false, error: "Administrator access required." };

  const shipmentId = String(formData.get("shipmentId") ?? "");
  const rawStatus = String(formData.get("statusCode") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  const isPublic = formData.get("isPublic") === "on";

  if (!shipmentId) return { ok: false, error: "Missing shipment." };
  if (!isShipmentStatus(rawStatus)) return { ok: false, error: "Choose a valid status." };
  const to = rawStatus as ShipmentStatus;

  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    select: { id: true, status: true, trackingNumber: true },
  });
  if (!shipment) return { ok: false, error: "Shipment not found." };

  const from = shipment.status as ShipmentStatus;
  const isStatusChange = to !== from;

  const created = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const event = await tx.trackingEvent.create({
      data: {
        shipmentId,
        statusCode: to,
        note: note || `Admin override: ${STATUS_META[from].label} → ${STATUS_META[to].label}.`,
        isPublic,
        source: "OPS",
        recordedById: session.user.id,
      },
    });
    await tx.shipment.update({ where: { id: shipmentId }, data: { status: to } });
    return event;
  });

  if (isStatusChange || isPublic) {
    notifyStatusChange({ shipmentId, eventId: created.id }).catch(() => {});
  }

  revalidateShipment(shipmentId, shipment.trackingNumber);
  return { ok: true };
}

/** ADMIN only: overwrite the commercial details of any shipment. */
export async function updateShipmentAdminAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await getAdminSession();
  if (!session) return { ok: false, error: "Administrator access required." };

  const shipmentId = String(formData.get("shipmentId") ?? "");
  const priceRaw = String(formData.get("price") ?? "").trim();
  const paymentMethod = String(formData.get("paymentMethod") ?? "");
  const serviceLevelId = String(formData.get("serviceLevelId") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!shipmentId) return { ok: false, error: "Missing shipment." };

  const fieldErrors: Record<string, string> = {};
  const price = Number(priceRaw);
  if (!Number.isFinite(price) || price < 0) fieldErrors.price = "Enter a valid price.";
  if (!(PAYMENT_METHODS as readonly string[]).includes(paymentMethod)) {
    fieldErrors.paymentMethod = "Choose a payment method.";
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "Please fix the highlighted fields", fieldErrors };
  }

  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    select: { id: true, trackingNumber: true },
  });
  if (!shipment) return { ok: false, error: "Shipment not found." };

  const level = serviceLevelId
    ? await prisma.serviceLevel.findUnique({ where: { id: serviceLevelId }, select: { id: true } })
    : null;
  if (serviceLevelId && !level) return { ok: false, error: "Unknown service level." };

  await prisma.shipment.update({
    where: { id: shipmentId },
    data: {
      price: new Prisma.Decimal(price.toFixed(2)),
      paymentMethod: paymentMethod as PaymentMethod,
      notes: notes || null,
      ...(level ? { serviceLevelId: level.id } : {}),
    },
  });

  revalidateShipment(shipment.id, shipment.trackingNumber);
  return { ok: true };
}

/** ADMIN only: permanently delete a shipment (parcels + events cascade). */
export async function deleteShipmentAction(formData: FormData): Promise<ActionResult> {
  const session = await getAdminSession();
  if (!session) return { ok: false, error: "Administrator access required." };

  const shipmentId = String(formData.get("shipmentId") ?? "");
  if (!shipmentId) return { ok: false, error: "Missing shipment." };

  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    select: { id: true, trackingNumber: true },
  });
  if (!shipment) return { ok: false, error: "Shipment not found." };

  await prisma.shipment.delete({ where: { id: shipmentId } });

  revalidatePath("/ops");
  revalidatePath(`/track/${shipment.trackingNumber}`);
  return { ok: true };
}

/**
 * ADMIN only: change a user's role. Guards against an admin removing their own
 * admin rights (which would lock them out of the console).
 */
export async function setUserRoleAction(formData: FormData): Promise<ActionResult> {
  const session = await getAdminSession();
  if (!session) return { ok: false, error: "Administrator access required." };

  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "");
  if (!userId) return { ok: false, error: "Missing user." };
  if (!(ASSIGNABLE_ROLES as readonly string[]).includes(role)) return { ok: false, error: "Choose a valid role." };

  if (userId === session.user.id && role !== "ADMIN") {
    return { ok: false, error: "You cannot remove your own admin access." };
  }

  const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!target) return { ok: false, error: "User not found." };

  await prisma.user.update({ where: { id: userId }, data: { role: role as AssignableRole } });
  revalidatePath("/ops/admin");
  return { ok: true };
}
