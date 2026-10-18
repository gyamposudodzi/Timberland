import "server-only";
import { prisma } from "@/lib/db";

/** Summary rows for the customer dashboard. */
export function listMyShipments(userId: string) {
  return prisma.shipment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
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
  });
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
