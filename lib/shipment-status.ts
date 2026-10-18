/**
 * Shipment lifecycle state machine.
 *
 * Mirrors the Prisma `ShipmentStatus` enum. Transitions are validated here so
 * the same rules can be enforced from server actions, the future back office,
 * and unit tests.
 */

export const SHIPMENT_STATUSES = [
  "CREATED",
  "CONFIRMED",
  "PICKED_UP",
  "IN_TRANSIT",
  "AT_HUB",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "EXCEPTION",
  "RETURNED",
  "CANCELLED",
] as const;

export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

export function isShipmentStatus(value: string): value is ShipmentStatus {
  return (SHIPMENT_STATUSES as readonly string[]).includes(value);
}

/** Linear happy-path progression. */
const FORWARD: Record<ShipmentStatus, ShipmentStatus[]> = {
  CREATED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PICKED_UP", "CANCELLED", "EXCEPTION"],
  PICKED_UP: ["IN_TRANSIT", "EXCEPTION"],
  IN_TRANSIT: ["AT_HUB", "OUT_FOR_DELIVERY", "EXCEPTION"],
  AT_HUB: ["IN_TRANSIT", "OUT_FOR_DELIVERY", "EXCEPTION"],
  OUT_FOR_DELIVERY: ["DELIVERED", "EXCEPTION"],
  DELIVERED: ["RETURNED"],
  EXCEPTION: ["IN_TRANSIT", "OUT_FOR_DELIVERY", "RETURNED", "CANCELLED", "DELIVERED"],
  RETURNED: [],
  CANCELLED: [],
};

/** States from which no further movement is allowed. */
const TERMINAL: ShipmentStatus[] = ["RETURNED", "CANCELLED"];

export function nextStatuses(from: ShipmentStatus): ShipmentStatus[] {
  return FORWARD[from] ?? [];
}

export function canTransition(from: ShipmentStatus, to: ShipmentStatus): boolean {
  return nextStatuses(from).includes(to);
}

export function isTerminal(status: ShipmentStatus): boolean {
  return TERMINAL.includes(status);
}

/** Statuses that are considered "delivered / closed" for progress rendering. */
export function isCompleted(status: ShipmentStatus): boolean {
  return status === "DELIVERED" || status === "RETURNED" || status === "CANCELLED";
}

export const STATUS_META: Record<
  ShipmentStatus,
  { label: string; description: string; tone: "neutral" | "active" | "success" | "warning" | "danger" }
> = {
  CREATED: { label: "Order received", description: "Your shipment request has been created.", tone: "neutral" },
  CONFIRMED: { label: "Confirmed", description: "Pickup has been scheduled and confirmed.", tone: "active" },
  PICKED_UP: { label: "Picked up", description: "A courier collected the parcel(s).", tone: "active" },
  IN_TRANSIT: { label: "In transit", description: "The shipment is moving between facilities.", tone: "active" },
  AT_HUB: { label: "At hub", description: "The shipment is being processed at a hub.", tone: "active" },
  OUT_FOR_DELIVERY: { label: "Out for delivery", description: "The parcel is on the delivery vehicle.", tone: "active" },
  DELIVERED: { label: "Delivered", description: "The shipment was delivered successfully.", tone: "success" },
  EXCEPTION: { label: "Exception", description: "There is an issue holding the shipment.", tone: "warning" },
  RETURNED: { label: "Returned", description: "The shipment was returned to the sender.", tone: "danger" },
  CANCELLED: { label: "Cancelled", description: "The shipment was cancelled.", tone: "danger" },
};
