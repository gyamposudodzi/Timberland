import { Badge } from "@/components/ui/badge";
import { STATUS_META, type ShipmentStatus } from "@/lib/shipment-status";

export function StatusPill({ status }: { status: ShipmentStatus }) {
  const meta = STATUS_META[status];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}
