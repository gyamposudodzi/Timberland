import "server-only";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SHIPMENT_STATUSES, isCompleted, type ShipmentStatus } from "@/lib/shipment-status";

/**
 * Back-office read helpers. Access is gated by staff/admin role — enforced here
 * for reads and again in the server actions for writes.
 */

export const OPS_ROLES = ["STAFF", "ADMIN"] as const;

/** Returns the session only when the signed-in user may operate the back office. */
export async function getOpsSession() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user?.id || !role || !(OPS_ROLES as readonly string[]).includes(role)) return null;
  return session;
}

export interface OpsListQuery {
  q?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface OpsListResult<T> {
  shipments: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

const NON_TERMINAL = SHIPMENT_STATUSES.filter((s) => !isCompleted(s));

/** Translate the UI status token into a Prisma `where` fragment. */
function statusWhere(status?: string) {
  if (!status) return {};
  if (status === "ACTIVE") return { status: { in: NON_TERMINAL as unknown as ShipmentStatus[] } };
  if ((SHIPMENT_STATUSES as readonly string[]).includes(status)) return { status: status as ShipmentStatus };
  return {};
}

/** Shipments across all customers, paginated, for the ops queue. */
export async function listShipmentsForOps({
  q,
  status,
  page = 1,
  pageSize = 10,
}: OpsListQuery = {}): Promise<
  OpsListResult<{
    id: string;
    trackingNumber: string;
    status: ShipmentStatus;
    updatedAt: Date;
    createdAt: Date;
    price: import("@prisma/client").Prisma.Decimal;
    currency: string;
    serviceLevel: { name: string };
    recipientAddress: { city: string; country: string };
    user: { email: string; name: string | null } | null;
  }>
> {
  const where = {
    ...statusWhere(status),
    ...(q && q.trim() ? { trackingNumber: { contains: q.trim().toUpperCase() } } : {}),
  };

  const safePage = Math.max(1, Math.floor(page) || 1);
  const take = Math.min(100, Math.max(1, Math.floor(pageSize) || 10));

  const [total, shipments] = await prisma.$transaction([
    prisma.shipment.count({ where }),
    prisma.shipment.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      skip: (safePage - 1) * take,
      take,
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

export interface StatusCount {
  status: ShipmentStatus;
  count: number;
}

export interface OpsSummary {
  total: number;
  active: number;
  exceptions: number;
  delivered: number;
  byStatus: Record<ShipmentStatus, number>;
}

/** At-a-glance counts for the ops dashboard, independent of the current filter. */
export async function getStatusSummary(): Promise<OpsSummary> {
  const grouped = await prisma.shipment.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  const byStatus = {} as Record<ShipmentStatus, number>;
  for (const s of SHIPMENT_STATUSES) byStatus[s] = 0;
  let total = 0;
  for (const row of grouped) {
    const status = row.status as ShipmentStatus;
    const count = row._count._all;
    byStatus[status] = count;
    total += count;
  }

  const active = NON_TERMINAL.reduce((sum, s) => sum + byStatus[s], 0);

  return {
    total,
    active,
    exceptions: byStatus.EXCEPTION,
    delivered: byStatus.DELIVERED,
    byStatus,
  };
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
