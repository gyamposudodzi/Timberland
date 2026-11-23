import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getTrackedShipment } from "@/server/tracking.service";
import { isValidTrackingNumber } from "@/lib/tracking-number";
import { rateLimit } from "@/lib/rate-limit";
import { STATUS_META } from "@/lib/shipment-status";
import { formatDate, formatDateTime } from "@/lib/utils";
import { StatusPill } from "@/components/tracking/status-pill";
import { TrackingTimeline } from "@/components/tracking/tracking-timeline";
import { TrackForm } from "@/components/tracking/track-form";
import { RouteMap } from "@/components/tracking/route-map";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Shipment status" };

function GenericNotFound({ code }: { code: string }) {
  return (
    <div className="bg-white">
      <section className="border-b border-border bg-muted/70 py-12">
        <div className="container-page max-w-5xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Every mile, in view
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-forest">Follow your delivery.</h1>
          <div className="mt-5 max-w-2xl">
            <TrackForm defaultValue={code} />
          </div>
        </div>
      </section>
      <div className="container-page max-w-5xl py-10">
        <Alert variant="warning">
          We couldn&apos;t find a shipment for <span className="font-mono font-semibold">{code}</span>. Double-check the tracking number and try again.
        </Alert>
      </div>
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

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
  const rl = rateLimit(`track:${ip}`, 40, 60_000);
  if (!rl.allowed) {
    return (
      <div className="container-page max-w-4xl py-12">
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
  const originLabel = `${d.origin.city}${d.origin.region ? `, ${d.origin.region}` : ""}`;
  const destinationLabel = `${d.destination.city}${d.destination.region ? `, ${d.destination.region}` : ""}`;
  const lastUpdated = d.events[0]?.occurredAt ?? d.createdAt;
  const headlineDate = d.deliveredAt
    ? `Delivered ${formatDate(d.deliveredAt)}`
    : d.estimatedDelivery
      ? `Estimated ${formatDate(d.estimatedDelivery)}`
      : meta.label;

  return (
    <div className="bg-white">
      {/* Top search strip */}
      <section className="border-b border-border bg-muted/70 py-10">
        <div className="container-page max-w-6xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Every mile, in view
          </p>
          <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-forest">
            Follow your delivery.
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            From pickup to your doorstep. See the latest on your shipment.
          </p>
          <div className="mt-5 max-w-2xl">
            <TrackForm defaultValue={d.trackingNumber} />
          </div>
        </div>
      </section>

      {/* Tracking details */}
      <section className="container-page max-w-6xl py-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-mono text-2xl font-bold tracking-tight text-forest">
              {d.trackingNumber}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {d.serviceName} · Last updated {formatDateTime(lastUpdated)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/account/notifications">
              <Button variant="outline" size="sm">
                Get delivery updates
              </Button>
            </Link>
            <Link href="/account/shipments">
              <Button variant="lime" size="sm">
                Manage delivery
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          {/* Left: ETA + Map + Route metadata */}
          <div className="rounded-2xl border border-border bg-white p-6 lg:col-span-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-forest">{meta.label}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{headlineDate}</p>
              </div>
              <StatusPill status={d.status} />
            </div>

            <div className="mt-5">
              <RouteMap
                originLabel={originLabel}
                destinationLabel={destinationLabel}
                status={d.status}
                etaLabel={meta.label}
                windowLabel={headlineDate}
              />
            </div>

            <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-border pt-5 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  From
                </dt>
                <dd className="mt-1 font-semibold text-forest">{originLabel}</dd>
                <dd className="text-xs text-muted-foreground">Created {formatDate(d.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  To
                </dt>
                <dd className="mt-1 font-semibold text-forest">{destinationLabel}</dd>
                <dd className="text-xs text-muted-foreground">{d.statusDescription}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Package
                </dt>
                <dd className="mt-1 font-semibold text-forest">
                  {d.pieces} {d.pieces === 1 ? "parcel" : "parcels"} · {d.weightTotalKg.toFixed(1)} kg
                </dd>
                <dd className="text-xs text-muted-foreground">{d.serviceName}</dd>
              </div>
            </dl>
          </div>

          {/* Right: Journey timeline */}
          <div className="rounded-2xl border border-border bg-white p-6 lg:col-span-5">
            <h3 className="text-lg font-bold text-forest">Every step of the journey</h3>
            <div className="mt-6">
              <TrackingTimeline
                currentStatus={d.status}
                events={d.events.map((e) => ({
                  statusCode: e.statusCode,
                  label: e.label,
                  description: e.description,
                  location: e.location,
                  occurredAt: e.occurredAt,
                }))}
              />
            </div>
          </div>
        </div>

        {/* Bottom support bar */}
        <div className="mt-6 flex flex-col justify-between gap-3 rounded-xl border border-border bg-muted/70 px-6 py-4 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            Something not quite right? Our support team can help with your delivery.
          </p>
          <Link
            href="/help#contact"
            className="inline-flex items-center gap-1 text-xs font-semibold text-forest hover:text-success transition-colors"
          >
            Contact support <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
