import Link from "next/link";
import { notFound } from "next/navigation";
import { getShipmentForOps } from "@/server/ops.service";
import { STATUS_META, nextStatuses, type ShipmentStatus } from "@/lib/shipment-status";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusPill } from "@/components/tracking/status-pill";
import { TrackingTimeline } from "@/components/tracking/tracking-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdvanceStatusForm } from "@/components/ops/advance-status-form";

export const metadata = { title: "Shipment — Operations" };

export default async function OpsShipmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const shipment = await getShipmentForOps(id);
  if (!shipment) notFound();

  const status = shipment.status as ShipmentStatus;
  const allowed = nextStatuses(status);
  const meta = STATUS_META[status];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-2xl font-bold tracking-tight">{shipment.trackingNumber}</h1>
            <StatusPill status={status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {meta.label} · {meta.description}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/track/${shipment.trackingNumber}`}>
            <Button variant="outline" size="sm">
              Public view
            </Button>
          </Link>
          <Link href="/ops">
            <Button variant="ghost" size="sm">
              Back to queue
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tracking history</CardTitle>
            <CardDescription>Every event — public and internal — newest first.</CardDescription>
          </CardHeader>
          <CardContent>
            <TrackingTimeline
              events={shipment.trackingEvents.map((e) => {
                const m = STATUS_META[e.statusCode as ShipmentStatus];
                return {
                  statusCode: e.statusCode as ShipmentStatus,
                  label: `${m.label}${e.isPublic ? "" : " · internal"}`,
                  description: e.note ?? m.description,
                  location: e.location,
                  occurredAt: e.occurredAt,
                };
              })}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Record an update</CardTitle>
              <CardDescription>Advances status through the validated state machine.</CardDescription>
            </CardHeader>
            <CardContent>
              <AdvanceStatusForm shipmentId={shipment.id} currentStatus={status} allowed={allowed} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer</span>
                <span className="font-medium">{shipment.user?.email ?? "guest"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium">{shipment.serviceLevel.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">{formatDate(shipment.createdAt)}</span>
              </div>
              {shipment.pickupDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pickup</span>
                  <span className="font-medium">{formatDate(shipment.pickupDate)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment</span>
                <Badge tone="neutral">{shipment.paymentMethod.replace(/_/g, " ")}</Badge>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="font-medium">Total</span>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(Number(shipment.price), shipment.currency)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Route</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">From</p>
                <p className="mt-1 font-medium">{shipment.senderAddress.contactName}</p>
                <p className="text-muted-foreground">{shipment.senderAddress.line1}</p>
                <p className="text-muted-foreground">
                  {shipment.senderAddress.city}
                  {shipment.senderAddress.region ? `, ${shipment.senderAddress.region}` : ""}{" "}
                  {shipment.senderAddress.postalCode}
                </p>
                <p className="mt-1">{shipment.senderAddress.phone}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">To</p>
                <p className="mt-1 font-medium">{shipment.recipientAddress.contactName}</p>
                <p className="text-muted-foreground">{shipment.recipientAddress.line1}</p>
                <p className="text-muted-foreground">
                  {shipment.recipientAddress.city}
                  {shipment.recipientAddress.region ? `, ${shipment.recipientAddress.region}` : ""}{" "}
                  {shipment.recipientAddress.postalCode}
                </p>
                <p className="mt-1">{shipment.recipientAddress.phone}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">Last updated {formatDateTime(shipment.updatedAt)}.</p>
    </div>
  );
}
