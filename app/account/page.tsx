import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowRight, CheckCircle2, Package, Plus, Truck } from "lucide-react";
import { auth } from "@/lib/auth";
import { listMyShipments, getMyShipmentSummary } from "@/server/account.service";
import { STATUS_META, type ShipmentStatus } from "@/lib/shipment-status";
import { formatDate } from "@/lib/utils";
import { StatusPill } from "@/components/tracking/status-pill";
import { RouteMap } from "@/components/tracking/route-map";
import { QuickQuoteWidget } from "@/components/account/quick-quote-widget";
import { Button } from "@/components/ui/button";

export default async function AccountDashboard() {
  const session = await auth();
  if (!session?.user?.id) notFound();
  const userId = session.user.id;

  const [summary, result] = await Promise.all([
    getMyShipmentSummary(userId),
    listMyShipments(userId, { page: 1, pageSize: 5 }),
  ]);

  const exceptionsCount = summary.byStatus["EXCEPTION"] ?? 0;
  const spotlight = result.shipments[0];

  const kpis = [
    {
      label: "Total shipments",
      value: summary.total,
      sub: "All-time bookings",
      icon: Package,
      href: "/account/shipments",
    },
    {
      label: "In transit",
      value: summary.active,
      sub: "Active on the network",
      icon: Truck,
      href: "/account/shipments?status=ACTIVE",
    },
    {
      label: "Delivered",
      value: summary.delivered,
      sub: summary.total > 0 ? `${Math.round((summary.delivered / summary.total) * 100)}% completed` : "0% completed",
      icon: CheckCircle2,
      href: "/account/shipments?status=DELIVERED",
    },
    {
      label: "Needs attention",
      value: String(exceptionsCount).padStart(2, "0"),
      sub: exceptionsCount > 0 ? `${exceptionsCount} exception${exceptionsCount > 1 ? "s" : ""}` : "All clear",
      icon: AlertTriangle,
      href: "/account/shipments?status=EXCEPTION",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-forest sm:text-3xl">
            Your shipments. All in one place.
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, {session.user.name?.split(" ")[0] ?? "there"}. Let&apos;s keep your business moving.
          </p>
        </div>
        <Link href="/account/new-shipment">
          <Button variant="lime" size="md">
            <Plus className="h-4 w-4" /> Create shipment
          </Button>
        </Link>
      </div>

      {/* 4 KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className="rounded-2xl border border-border bg-white p-5 transition-colors hover:border-ring/50"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-3xl font-bold tracking-tight text-forest tabular-nums">
              {kpi.value}
            </p>
            <p className="mt-1 text-xs text-success">{kpi.sub}</p>
          </Link>
        ))}
      </div>

      {/* Spotlight Map + Quick Quote */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="rounded-2xl border border-border bg-white p-6 lg:col-span-8">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-forest">Shipment spotlight</h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" /> Live
              </span>
            </div>
            {spotlight && (
              <Link
                href={`/account/shipments/${spotlight.id}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-forest hover:text-success"
              >
                View details <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          {spotlight ? (
            <>
              <RouteMap
                originLabel={`${spotlight.senderAddress.city}, ${spotlight.senderAddress.country}`}
                destinationLabel={`${spotlight.recipientAddress.city}, ${spotlight.recipientAddress.country}`}
                status={spotlight.status as ShipmentStatus}
                etaLabel={STATUS_META[spotlight.status as ShipmentStatus].label}
                windowLabel={formatDate(spotlight.createdAt)}
                compact
              />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-forest">
                    {spotlight.trackingNumber}
                  </span>
                  <span className="text-muted-foreground">· {spotlight.serviceLevel.name}</span>
                </div>
                <StatusPill status={spotlight.status as ShipmentStatus} />
              </div>
            </>
          ) : (
            <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 p-6 text-center">
              <p className="text-sm font-semibold text-forest">No active shipments yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Book your first parcel or freight shipment to see live route tracking here.
              </p>
              <Link href="/account/new-shipment" className="mt-4">
                <Button variant="lime" size="sm">
                  <Plus className="h-3.5 w-3.5" /> Create shipment
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="lg:col-span-4">
          <QuickQuoteWidget />
        </div>
      </div>

      {/* Recent shipments table */}
      <div className="rounded-2xl border border-border bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-forest">Recent shipments</h2>
            <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              {summary.total}
            </span>
          </div>
          <Link
            href="/account/shipments"
            className="inline-flex items-center gap-1 text-xs font-semibold text-forest hover:text-success"
          >
            View all shipments <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {result.shipments.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No shipments found yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/60 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Tracking ID</th>
                  <th className="px-4 py-3 font-medium">Destination</th>
                  <th className="px-4 py-3 font-medium">Service</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result.shipments.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/account/shipments/${s.id}`}
                        className="font-mono text-xs font-semibold text-forest hover:underline"
                      >
                        {s.trackingNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-forest">
                      {s.recipientAddress.city}, {s.recipientAddress.country}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      {s.serviceLevel.name}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusPill status={s.status as ShipmentStatus} />
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      {formatDate(s.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
