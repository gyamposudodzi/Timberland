import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, CheckCircle2, Package, Plus, Search, Truck } from "lucide-react";
import { auth } from "@/lib/auth";
import { listMyShipments, getMyShipmentSummary } from "@/server/account.service";
import type { ShipmentStatus } from "@/lib/shipment-status";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { StatusPill } from "@/components/tracking/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function buildQuery(params: Record<string, string | undefined>): string {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) usp.set(k, v);
  const s = usp.toString();
  return s ? `?${s}` : "";
}

export default async function MyShipmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) notFound();
  const userId = session.user.id;

  const sp = await searchParams;
  const q = sp.q ?? "";
  const status = sp.status ?? "";
  const page = Number.parseInt(sp.page ?? "1", 10) || 1;

  const [summary, result] = await Promise.all([
    getMyShipmentSummary(userId),
    listMyShipments(userId, { q, status, page, pageSize: 8 }),
  ]);

  const exceptionsCount = summary.byStatus["EXCEPTION"] ?? 0;

  const tabs = [
    { label: "All shipments", count: summary.total, value: "" },
    { label: "In transit", count: summary.active, value: "ACTIVE" },
    { label: "Delivered", count: summary.delivered, value: "DELIVERED" },
    { label: "Exceptions", count: exceptionsCount, value: "EXCEPTION" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-forest sm:text-3xl">
            My shipments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every delivery, organized. Find what you need and keep it moving.
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
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total shipments</span>
            <Package className="h-4 w-4" />
          </div>
          <p className="mt-2 text-3xl font-bold text-forest tabular-nums">{summary.total}</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>In transit</span>
            <Truck className="h-4 w-4" />
          </div>
          <p className="mt-2 text-3xl font-bold text-forest tabular-nums">{summary.active}</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Delivered</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <p className="mt-2 text-3xl font-bold text-forest tabular-nums">{summary.delivered}</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Needs attention</span>
            <AlertTriangle className="h-4 w-4" />
          </div>
          <p className="mt-2 text-3xl font-bold text-forest tabular-nums">
            {String(exceptionsCount).padStart(2, "0")}
          </p>
        </div>
      </div>

      {/* Main table card */}
      <div className="rounded-2xl border border-border bg-white p-6">
        <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 md:flex-row md:items-center">
          <div className="flex flex-wrap items-center gap-6">
            {tabs.map((t) => {
              const active = status === t.value;
              return (
                <Link
                  key={t.label}
                  href={`/account/shipments${buildQuery({ q: q || undefined, status: t.value || undefined })}`}
                  className={cn(
                    "relative pb-2 text-sm transition-colors",
                    active
                      ? "font-semibold text-forest after:absolute after:inset-x-0 after:-bottom-[17px] after:h-0.5 after:bg-forest"
                      : "text-muted-foreground hover:text-forest",
                  )}
                >
                  {t.label}{" "}
                  <span className="ml-1 text-xs text-muted-foreground">{t.count}</span>
                </Link>
              );
            })}
          </div>

          <form className="flex items-center gap-2" action="/account/shipments">
            {status && <input type="hidden" name="status" value={status} />}
            <div className="relative w-56">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={q}
                placeholder="Search tracking ID"
                className="h-9 pl-8 text-xs font-mono"
              />
            </div>
            <Button type="submit" variant="outline" size="sm">
              Search
            </Button>
          </form>
        </div>

        {result.shipments.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-medium text-forest">No shipments match this filter.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try clearing your search or create a new shipment.
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/60 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Tracking ID</th>
                  <th className="px-4 py-3 font-medium">Destination</th>
                  <th className="px-4 py-3 font-medium">Service</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                  <th className="px-4 py-3 text-right font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result.shipments.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs font-semibold text-forest">
                      <Link href={`/account/shipments/${s.id}`} className="hover:underline">
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
                    <td className="px-4 py-3.5 text-xs font-medium text-forest tabular-nums">
                      {formatCurrency(Number(s.price), s.currency)}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      {formatDate(s.createdAt)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/account/shipments/${s.id}`}
                        className="text-xs font-semibold text-success hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {result.pageCount > 1 && (
          <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
            <span>
              Page {result.page} of {result.pageCount} ({result.total} shipments)
            </span>
            <div className="flex items-center gap-2">
              {result.page > 1 && (
                <Link
                  href={`/account/shipments${buildQuery({ q: q || undefined, status: status || undefined, page: String(result.page - 1) })}`}
                >
                  <Button variant="outline" size="sm">
                    Previous
                  </Button>
                </Link>
              )}
              {result.page < result.pageCount && (
                <Link
                  href={`/account/shipments${buildQuery({ q: q || undefined, status: status || undefined, page: String(result.page + 1) })}`}
                >
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom pickup banner */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-secondary/70 px-6 py-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-forest">Have shipments ready to go?</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Save a trip. Arrange a pickup from your business or home.
          </p>
        </div>
        <Link href="/account/new-shipment">
          <Button variant="outline" size="sm" className="bg-white">
            Schedule a pickup
          </Button>
        </Link>
      </div>
    </div>
  );
}
