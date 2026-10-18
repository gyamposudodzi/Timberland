import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getMyShipment } from "@/server/account.service";
import { STATUS_META, type ShipmentStatus } from "@/lib/shipment-status";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusPill } from "@/components/tracking/status-pill";
import { TrackingTimeline } from "@/components/tracking/tracking-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function AddressBlock({ title, a }: { title: string; a: NonNullable<Awaited<ReturnType<typeof getMyShipment>>>["senderAddress"] }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
      <p className="mt-1 font-medium">{a.contactName}</p>
      <p className="text-sm text-muted-foreground">{a.line1}</p>
      {a.line2 && <p className="text-sm text-muted-foreground">{a.line2}</p>}
      <p className="text-sm text-muted-foreground">
        {a.city}
        {a.region ? `, ${a.region}` : ""} {a.postalCode}
      </p>
      <p className="text-sm text-muted-foreground">{a.country}</p>
      <p className="mt-1 text-sm">{a.phone}</p>
    </div>
  );
}

export default async function ShipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) notFound();

  const shipment = await getMyShipment(session.user.id, id);
  if (!shipment) notFound();

  const meta = STATUS_META[shipment.status as ShipmentStatus];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-2xl font-bold tracking-tight">{shipment.trackingNumber}</h1>
            <StatusPill status={shipment.status as ShipmentStatus} />
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
          <Link href="/account">
            <Button variant="ghost" size="sm">
              Back
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tracking history</CardTitle>
            <CardDescription>All updates, including internal notes.</CardDescription>
          </CardHeader>
          <CardContent>
            <TrackingTimeline
              events={shipment.trackingEvents.map((e) => {
                const m = STATUS_META[e.statusCode as ShipmentStatus];
                return {
                  statusCode: e.statusCode as ShipmentStatus,
                  label: m.label,
                  description: e.note,
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
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
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
            <CardContent className="grid grid-cols-2 gap-6">
              <AddressBlock title="From" a={shipment.senderAddress} />
              <AddressBlock title="To" a={shipment.recipientAddress} />
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pieces</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {shipment.parcels.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <div>
                  <p className="font-medium">{p.description}</p>
                  <p className="text-muted-foreground">
                    {p.pieces} piece{p.pieces > 1 ? "s" : ""} · {Number(p.weightKg).toFixed(2)} kg
                  </p>
                </div>
                {p.declaredValue != null && (
                  <span className="text-muted-foreground">
                    Declared: {formatCurrency(Number(p.declaredValue), shipment.currency)}
                  </span>
                )}
              </li>
            ))}
          </ul>
          {shipment.notes && (
            <p className="mt-4 rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Notes: </span>
              {shipment.notes}
            </p>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Last updated {formatDateTime(shipment.updatedAt)}.
      </p>
    </div>
  );
}
