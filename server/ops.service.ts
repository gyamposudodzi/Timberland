import "server-only";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * Back-office (non-GUI in spirit, thin UI for v1) read helpers.
 * Access is gated by staff/admin role — enforced here for reads and again in
 * the server actions for writes.
 */

export const OPS_ROLES = ["STAFF", "ADMIN"] as const;

/** Returns the session only when the signed-in user may operate the back office. */
export async function getOpsSession() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user?.id || !role || !(OPS_ROLES as readonly string[]).includes(role)) return null;
  return session;
}

export interface OpsListFilters {
  q?: string;
  status?: string;
}

/** Shipments across all customers, for the ops queue. */
export function listShipmentsForOps({ q, status }: OpsListFilters = {}) {
  return prisma.shipment.findMany({
    where: {
      // Optional status filter; ignore anything not a valid enum value.
      ...(status && /^[A-Z_]+$/.test(status) ? { status: status as never } : {}),
      ...(q && q.trim()
        ? { trackingNumber: { contains: q.trim().toUpperCase() } }
        : {}),
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    take: 100,
    select: {
      id: true,
      trackingNumber: true,
      status: true,
      updatedAt: true,
      createdAt: true,
      price: true,
      currency: true,
      serviceLevel: { select: { name: true } },
      recipientAddress: { select: { city: true, country: true } },
      user: { select: { email: true, name: true } },
    },
  });
}

/** Full shipment detail (including internal, non-public events) for operators. */
export function getShipmentForOps(shipmentId: string) {
  return prisma.shipment.findUnique({
    where: { id: shipmentId },
    include: {
      serviceLevel: true,
      senderAddress: true,
      recipientAddress: true,
      parcels: true,
      user: { select: { name: true, email: true } },
      trackingEvents: {
        orderBy: { occurredAt: "desc" },
        include: { recordedBy: { select: { name: true, email: true } } },
      },
    },
  });
}
