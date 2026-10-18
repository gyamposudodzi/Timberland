"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getOpsSession } from "@/server/ops.service";
import {
  STATUS_META,
  canTransition,
  isShipmentStatus,
  type ShipmentStatus,
} from "@/lib/shipment-status";
import { notifyStatusChange } from "@/lib/notifications";
import type { ActionResult } from "@/server/auth.actions";

export interface AdvanceResult extends ActionResult {
  newStatus?: ShipmentStatus;
  remaining?: ShipmentStatus[];
}

/**
 * Append a tracking event and (unless it is the same status) advance the
 * shipment — validated against the state machine so operators cannot make an
 * illegal jump. Guarded by staff/admin role; recorded as an OPS-sourced event.
 */
export async function addTrackingEventAction(
  _prev: AdvanceResult | null,
  formData: FormData,
): Promise<AdvanceResult> {
  const session = await getOpsSession();
  if (!session) return { ok: false, error: "You are not authorized to update shipments." };

  const shipmentId = String(formData.get("shipmentId") ?? "");
  const rawStatus = String(formData.get("statusCode") ?? "");
  const location = String(formData.get("location") ?? "").trim();
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
  if (isStatusChange && !canTransition(from, to)) {
    return {
      ok: false,
      error: `Illegal transition: ${STATUS_META[from].label} → ${STATUS_META[to].label}.`,
    };
  }

  const event = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const created = await tx.trackingEvent.create({
      data: {
        shipmentId,
        statusCode: to,
        location: location || null,
        note: note || null,
        isPublic,
        source: "OPS",
        recordedById: session.user.id,
      },
    });
    // Always touch the shipment (bumps updatedAt); change status when advancing.
    await tx.shipment.update({
      where: { id: shipmentId },
      data: isStatusChange ? { status: to } : { status: from },
    });
    return created;
  });

  // Fire-and-forget the customer notification (logs failures silently).
  notifyStatusChange({ shipmentId, eventId: event.id }).catch(() => {});

  revalidatePath(`/ops/shipments/${shipmentId}`);
  revalidatePath(`/account/shipments/${shipmentId}`);
  revalidatePath(`/track/${shipment.trackingNumber}`);
  revalidatePath("/ops");

  return { ok: true, newStatus: to };
}
