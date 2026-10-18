import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { MapPin, Truck } from "lucide-react";
import { getTrackedShipment } from "@/server/tracking.service";
import { isValidTrackingNumber } from "@/lib/tracking-number";
import { rateLimit } from "@/lib/rate-limit";
import { STATUS_META } from "@/lib/shipment-status";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusPill } from "@/components/tracking/status-pill";
import { TrackingTimeline } from "@/components/tracking/tracking-timeline";
import { TrackForm } from "@/components/tracking/track-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Shipment status" };

function Progress({ percent }: { percent: number }) {
  return (
    <div className="mt-4">
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{percent}% complete</p>
    </div>
  );
}

function GenericNotFound({ code }: { code: string }) {
  return (
    <div className="container-page max-w-3xl py-12">
      <Alert variant="warning">
        We couldn’t find a shipment for <span className="font-mono">{code}</span>. Double-check the tracking number and try again.
      </Alert>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Try another tracking number</CardTitle>
        </CardHeader>
        <CardContent>
          <TrackForm />
        </CardContent>
      </Card>
    </div>
  );
}

export default async function TrackDetailPage({
  params,
}: {
  params: Promise<{ trackingNumber: string }>;
}) {
  const { trackingNumber } = await params;
  const code = decodeURIComponent(trackingNumber);

  // Blunt guest enumeration: rate-limit by client IP.
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
  const rl = rateLimit(`track:${ip}`, 40, 60_000);
  if (!rl.allowed) {
    return (
      <div className="container-page max-w-3xl py-12">
        <Alert variant="error">Too many tracking requests. Please wait a minute and try again.</Alert>
      </div>
    );
  }

  if (!isValidTrackingNumber(code)) {
    return <GenericNotFound code={code} />;
  }

  const result = await getTrackedShipment(code);

  if (result.status !== "ok") {
    return <GenericNotFound code={code} />;
  }

  const d = result.data;
  const meta = STATUS_META[d.status];

  return (
    <div className="container-page max-w-3xl py-12">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Tracking number</p>
        <h1 className="font-mono text-2xl font-bold tracking-tight">{d.trackingNumber}</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>{meta.label}</CardTitle>
            <CardDescription>{d.statusDescription}</CardDescription>
          </div>
          <StatusPill status={d.status} />
        </CardHeader>
        <CardContent>
          <Progress percent={d.progressPercent} />

          <div className="mt-6 flex items-center gap-3 text-sm">
            <div className="flex flex-1 items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">From</p>
                <p className="font-medium">
                  {d.origin.city}
                  {d.origin.region ? `, ${d.origin.region}` : ""}
                </p>
              </div>
            </div>
            <Truck className="h-5 w-5 text-muted-foreground" />
            <div className="flex flex-1 items-center gap-2">
              <MapPin className="h-4 w-4 text-accent" />
              <div>
                <p className="text-xs text-muted-foreground">To</p>
                <p className="font-medium">
                  {d.destination.city}
                  {d.destination.region ? `, ${d.destination.region}` : ""}
                </p>
              </div>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Service</dt>
              <dd className="font-medium">{d.serviceName}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{d.deliveredAt ? "Delivered" : "Estimated delivery"}</dt>
              <dd className="font-medium">
                {d.deliveredAt ? formatDate(d.deliveredAt) : d.estimatedDelivery ? formatDate(d.estimatedDelivery) : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Pieces</dt>
              <dd className="font-medium">{d.pieces}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Total weight</dt>
              <dd className="font-medium">{d.weightTotalKg.toFixed(2)} kg</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Tracking history</CardTitle>
          <CardDescription>Latest public updates, newest first.</CardDescription>
        </CardHeader>
        <CardContent>
          <TrackingTimeline
            events={d.events.map((e) => ({
              statusCode: e.statusCode,
              label: e.label,
              description: e.description,
              location: e.location,
              occurredAt: e.occurredAt,
            }))}
          />
        </CardContent>
      </Card>

      <div className="mt-6 rounded-lg border border-border bg-muted/40 p-5">
        <p className="text-sm text-muted-foreground">
          Last update {formatDateTime(d.events[0]?.occurredAt ?? d.createdAt)}. For full address details, proof of delivery and email
          alerts,{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            create a free account
          </Link>
          .
        </p>
        <Link href="/track" className="mt-3 inline-block">
          <Button variant="outline" size="sm">
            Track another shipment
          </Button>
        </Link>
      </div>
    </div>
  );
}
