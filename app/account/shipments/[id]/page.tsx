import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { getMyShipment } from "@/server/account.service";
import { STATUS_META, type ShipmentStatus } from "@/lib/shipment-status";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusPill } from "@/components/tracking/status-pill";
import { TrackingTimeline } from "@/components/tracking/tracking-timeline";
import { RouteMap } from "@/components/tracking/route-map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function AddressBlock({
  title,
  a,
}: {
  title: string;
  a: NonNullable<Awaited<ReturnType<typeof getMyShipment>>>["senderAddress"];
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <p className="mt-1 text-sm font-semibold text-forest">{a.contactName}</p>
      <p className="text-xs text-muted-foreground">{a.line1}</p>
      {a.line2 && <p className="text-xs text-muted-foreground">{a.line2}</p>}
      <p className="text-xs text-muted-foreground">
        {a.city}
        {a.region ? `, ${a.region}` : ""} {a.postalCode}
      </p>
      <p className="text-xs text-muted-foreground">{a.country}</p>
      <p className="mt-1 text-xs text-forest/80">{a.phone}</p>
    </div>
  );
}

export default async function ShipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) notFound();

  const shipment = await getMyShipment(session.user.id, id);
  if (!shipment) notFound();

  const meta = STATUS_META[shipment.status as ShipmentStatus];
  const originLabel = `${shipment.senderAddress.city}${shipment.senderAddress.region ? `, ${shipment.senderAddress.region}` : ""}`;
  const destinationLabel = `${shipment.recipientAddress.city}${shipment.recipientAddress.region ? `, ${shipment.recipientAddress.region}` : ""}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-2xl font-bold tracking-tight text-forest">
              {shipment.trackingNumber}
            </h1>
            <StatusPill status={shipment.status as ShipmentStatus} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {meta.label} · {meta.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/account/shipments">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-3.5 w-3.5" /> My shipments
            </Button>
          </Link>
          <Link href={`/track/${shipment.trackingNumber}`}>
            <Button variant="lime" size="sm">
              Public tracking <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-2xl border border-border bg-white p-6">
            <RouteMap
              originLabel={originLabel}
              destinationLabel={destinationLabel}
              status={shipment.status as ShipmentStatus}
              etaLabel={meta.label}
              windowLabel={formatDate(shipment.updatedAt)}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tracking history</CardTitle>
              <CardDescription>All updates, including internal notes.</CardDescription>
            </CardHeader>
            <CardContent>
              <TrackingTimeline
                currentStatus={shipment.status as ShipmentStatus}
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
        </div>

        <div className="space-y-6 lg:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium text-forest">{shipment.serviceLevel.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium text-forest">{formatDate(shipment.createdAt)}</span>
              </div>
              {shipment.pickupDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pickup</span>
                  <span className="font-medium text-forest">{formatDate(shipment.pickupDate)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment</span>
                <Badge tone="neutral">{shipment.paymentMethod.replace(/_/g, " ")}</Badge>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="font-semibold text-forest">Total</span>
                <span className="text-lg font-bold text-forest tabular-nums">
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

          <Card>
            <CardHeader>
              <CardTitle>Pieces</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-border">
                {shipment.parcels.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                    <div>
                      <p className="font-medium text-forest">{p.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.pieces} piece{p.pieces > 1 ? "s" : ""} · {Number(p.weightKg).toFixed(2)} kg
                      </p>
                    </div>
                    {p.declaredValue != null && (
                      <span className="text-xs text-muted-foreground">
                        Declared: {formatCurrency(Number(p.declaredValue), shipment.currency)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              {shipment.notes && (
                <p className="mt-4 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
                  <span className="font-semibold text-forest">Notes: </span>
                  {shipment.notes}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Last updated {formatDateTime(shipment.updatedAt)}.
      </p>
    </div>
  );
}
