import "server-only";
import { prisma } from "@/lib/db";
import { STATUS_META, type ShipmentStatus } from "@/lib/shipment-status";
import { normalizeTrackingNumber } from "@/lib/tracking-number";

export interface PublicTrackingEvent {
  statusCode: ShipmentStatus;
  label: string;
  description: string;
  location: string | null;
  occurredAt: Date;
}

export interface PublicTracking {
  trackingNumber: string;
  status: ShipmentStatus;
  statusLabel: string;
  statusDescription: string;
  tone: "neutral" | "active" | "success" | "warning" | "danger";
  serviceName: string;
  slaDays: number;
  createdAt: Date;
  estimatedDelivery: Date | null;
  deliveredAt: Date | null;
  origin: { city: string; region: string | null; country: string };
  destination: { city: string; region: string | null; country: string };
  pieces: number;
  weightTotalKg: number;
  progressPercent: number;
  events: PublicTrackingEvent[];
}

export type TrackedResult =
  | { status: "ok"; data: PublicTracking }
  | { status: "not_found" }
  | { status: "verification_failed" };

const PROGRESS_ORDER: ShipmentStatus[] = [
  "CREATED",
  "CONFIRMED",
  "PICKED_UP",
  "IN_TRANSIT",
  "AT_HUB",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

function computeProgress(status: ShipmentStatus): number {
  if (status === "DELIVERED") return 100;
  if (status === "RETURNED" || status === "CANCELLED") return 100;
  const idx = PROGRESS_ORDER.indexOf(status);
  if (idx <= 0) return status === "EXCEPTION" ? 60 : idx * 14;
  return Math.round((idx / (PROGRESS_ORDER.length - 1)) * 100);
}

function verifyMatches(verification: string, recipientPostal: string, recipientName: string): boolean {
  const v = verification.trim().toLowerCase();
  if (!v) return true;
  if (recipientPostal.toLowerCase() === v) return true;
  const tokens = recipientName.toLowerCase().split(/\s+/).filter(Boolean);
  return tokens.some((t) => t === v);
}

/**
 * Build the guest-safe tracking view. Never exposes street address, contact
 * name, phone, or price. `verification` (postal code or recipient surname) is
 * optional but, when supplied, must match to further resist enumeration.
 */
export async function getTrackedShipment(
  rawTrackingNumber: string,
  verification?: string,
): Promise<TrackedResult> {
  const trackingNumber = normalizeTrackingNumber(rawTrackingNumber);

  const shipment = await prisma.shipment.findUnique({
    where: { trackingNumber },
    include: {
      serviceLevel: true,
      senderAddress: true,
      recipientAddress: true,
      parcels: { select: { pieces: true, weightKg: true } },
      trackingEvents: {
        where: { isPublic: true },
        orderBy: { occurredAt: "desc" },
      },
    },
  });

  if (!shipment) return { status: "not_found" };

  if (verification && verification.trim()) {
    const ok = verifyMatches(verification, shipment.recipientAddress.postalCode, shipment.recipientAddress.contactName);
    if (!ok) return { status: "verification_failed" };
  }

  const status = shipment.status as ShipmentStatus;
  const meta = STATUS_META[status];

  const deliveredEvent = shipment.trackingEvents.find((e) => e.statusCode === "DELIVERED");
  const estimatedDelivery =
    shipment.pickupDate ?? new Date(shipment.createdAt.getTime() + shipment.serviceLevel.slaDays * 86400000);

  const events: PublicTrackingEvent[] = shipment.trackingEvents.map((e) => {
    const m = STATUS_META[e.statusCode as ShipmentStatus];
    return {
      statusCode: e.statusCode as ShipmentStatus,
      label: m.label,
      description: e.note ?? m.description,
      location: e.location,
      occurredAt: e.occurredAt,
    };
  });

  const weightTotalKg = shipment.parcels.reduce((s, p) => s + Number(p.weightKg), 0);
  const pieces = shipment.parcels.reduce((s, p) => s + p.pieces, 0);

  return {
    status: "ok",
    data: {
      trackingNumber: shipment.trackingNumber,
      status,
      statusLabel: meta.label,
      statusDescription: meta.description,
      tone: meta.tone,
      serviceName: shipment.serviceLevel.name,
      slaDays: shipment.serviceLevel.slaDays,
      createdAt: shipment.createdAt,
      estimatedDelivery,
      deliveredAt: deliveredEvent?.occurredAt ?? null,
      origin: {
        city: shipment.senderAddress.city,
        region: shipment.senderAddress.region,
        country: shipment.senderAddress.country,
      },
      destination: {
        city: shipment.recipientAddress.city,
        region: shipment.recipientAddress.region,
        country: shipment.recipientAddress.country,
      },
      pieces,
      weightTotalKg,
      progressPercent: computeProgress(status),
      events,
    },
  };
}
