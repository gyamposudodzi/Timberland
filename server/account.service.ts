import "server-only";
import { prisma } from "@/lib/db";
import { SHIPMENT_STATUSES, isCompleted, type ShipmentStatus } from "@/lib/shipment-status";

const NON_TERMINAL = SHIPMENT_STATUSES.filter((s) => !isCompleted(s));

export interface MyShipmentQuery {
  q?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

/** Translate the UI status token into a Prisma `where` fragment. */
function statusWhere(status?: string) {
  if (!status) return {};
  if (status === "ACTIVE") return { status: { in: NON_TERMINAL as unknown as ShipmentStatus[] } };
  if ((SHIPMENT_STATUSES as readonly string[]).includes(status)) return { status: status as ShipmentStatus };
  return {};
}

/** Summary rows for the customer dashboard, searchable + paginated. */
export async function listMyShipments(userId: string, { q, status, page = 1, pageSize = 8 }: MyShipmentQuery = {}) {
  const where = {
    userId,
    ...statusWhere(status),
    ...(q && q.trim() ? { trackingNumber: { contains: q.trim().toUpperCase() } } : {}),
  };

  const safePage = Math.max(1, Math.floor(page) || 1);
  const take = Math.min(50, Math.max(1, Math.floor(pageSize) || 8));

  const [total, shipments] = await prisma.$transaction([
    prisma.shipment.count({ where }),
    prisma.shipment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * take,
      take,
      select: {
        id: true,
        trackingNumber: true,
        status: true,
        price: true,
        currency: true,
        createdAt: true,
        pickupDate: true,
        serviceLevel: { select: { name: true, code: true } },
        recipientAddress: { select: { city: true, country: true } },
      },
    }),
  ]);

  return {
    shipments,
    total,
    page: safePage,
    pageSize: take,
    pageCount: Math.max(1, Math.ceil(total / take)),
  };
}

export interface MyShipmentSummary {
  total: number;
  active: number;
  delivered: number;
  exception: number;
  byStatus: Record<ShipmentStatus, number>;
}

/** At-a-glance counts scoped to the customer, independent of the current filter. */
export async function getMyShipmentSummary(userId: string): Promise<MyShipmentSummary> {
  const grouped = await prisma.shipment.groupBy({
    by: ["status"],
    where: { userId },
    _count: { _all: true },
  });

  const byStatus = {} as Record<ShipmentStatus, number>;
  for (const s of SHIPMENT_STATUSES) byStatus[s] = 0;
  let total = 0;
  for (const row of grouped) {
    const status = row.status as ShipmentStatus;
    byStatus[status] = row._count._all;
    total += row._count._all;
  }

  const active = NON_TERMINAL.reduce((sum, s) => sum + byStatus[s], 0);

  return { total, active, delivered: byStatus.DELIVERED, exception: byStatus.EXCEPTION, byStatus };
}

/**
 * Full shipment detail. Ownership is enforced here: a shipment that does not
 * belong to `userId` returns null (the caller renders a 404).
 */
export function getMyShipment(userId: string, shipmentId: string) {
  return prisma.shipment.findFirst({
    where: { id: shipmentId, userId },
    include: {
      serviceLevel: true,
      senderAddress: true,
      recipientAddress: true,
      parcels: true,
      trackingEvents: { orderBy: { occurredAt: "desc" } },
    },
  });
}

export function getMyShipmentCount(userId: string) {
  return prisma.shipment.count({ where: { userId } });
}

export function getSavedAddresses(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { zone: { select: { name: true, code: true } } },
  });
}
