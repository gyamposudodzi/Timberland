import Link from "next/link";
import { Search } from "lucide-react";
import { listShipmentsForOps, getStatusSummary } from "@/server/ops.service";
import { SHIPMENT_STATUSES, STATUS_META, type ShipmentStatus } from "@/lib/shipment-status";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { StatusPill } from "@/components/tracking/status-pill";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const metadata = { title: "Operations queue" };

function buildQuery(params: Record<string, string | undefined>): string {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) usp.set(k, v);
  const s = usp.toString();
  return s ? `?${s}` : "";
}

const SUMMARY_CARDS: { key: string; label: string; href: string }[] = [
  { key: "active", label: "Active", href: "/ops?status=ACTIVE" },
  { key: "exceptions", label: "Exceptions", href: "/ops?status=EXCEPTION" },
  { key: "delivered", label: "Delivered", href: "/ops?status=DELIVERED" },
  { key: "total", label: "Total", href: "/ops" },
];

export default async function OpsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const status = sp.status ?? "";
  const page = Number.parseInt(sp.page ?? "1", 10) || 1;

  const [summary, result] = await Promise.all([
    getStatusSummary(),
    listShipmentsForOps({ q, status, page, pageSize: 10 }),
  ]);

  const counts: Record<string, number> = {
    active: summary.active,
    exceptions: summary.exceptions,
    delivered: summary.delivered,
    total: summary.total,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Shipment queue</h1>
        <p className="text-sm text-muted-foreground">All shipments across customers, most recently updated first.</p>
      </div>

      {/* At-a-glance summary — quick filters. */}
      <div className="grid gap-4 sm:grid-cols-4">
        {SUMMARY_CARDS.map((c) => (
          <Link key={c.key} href={c.href}>
            <Card className="transition-colors hover:border-primary/40 hover:bg-muted/40">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className="text-3xl font-bold">{counts[c.key]}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Search */}
      <form className="flex items-center gap-3" action="/ops">
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q}
            placeholder="Search tracking number…"
            className="pl-9 font-mono"
            aria-label="Search tracking number"
          />
        </div>
        <button type="submit" className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Search
        </button>
        {q ? (
          <Link href={`/ops${buildQuery({ status })}`} className="text-sm text-muted-foreground hover:text-foreground">
            Clear
          </Link>
        ) : null}
      </form>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/ops${buildQuery({ q })}`}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            !status ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted",
          )}
        >
          All
        </Link>
        <Link
          href={`/ops${buildQuery({ q, status: "ACTIVE" })}`}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            status === "ACTIVE" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted",
          )}
        >
          Active · {summary.active}
        </Link>
        {SHIPMENT_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/ops${buildQuery({ q, status: s })}`}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              status === s ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted",
            )}
          >
            {STATUS_META[s].label} · {summary.byStatus[s]}
          </Link>
        ))}
      </div>

      {result.shipments.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">No shipments match this filter.</CardContent>
        </Card>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            Showing {(result.page - 1) * result.pageSize + 1}–
            {Math.min(result.page * result.pageSize, result.total)} of {result.total}
            {status ? ` · filtered by ${status === "ACTIVE" ? "Active" : STATUS_META[status as ShipmentStatus]?.label ?? status}` : ""}
            {q ? ` · “${q}”` : ""}
          </p>
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-border">
                {result.shipments.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/ops/shipments/${s.id}`}
                      className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="min-w-0">
                        <p className="font-mono text-sm font-medium">{s.trackingNumber}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {s.serviceLevel.name} · to {s.recipientAddress.city}, {s.recipientAddress.country} ·{" "}
                          {s.user?.email ?? "guest"}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <StatusPill status={s.status as ShipmentStatus} />
                        <span className="text-sm font-medium">{formatCurrency(Number(s.price), s.currency)}</span>
                        <span className="hidden text-xs text-muted-foreground sm:inline">
                          updated {formatDateTime(s.updatedAt)}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Pagination */}
          {result.pageCount > 1 ? (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Page {result.page} of {result.pageCount}
              </span>
              <div className="flex gap-2">
                {result.page > 1 ? (
                  <Link
                    href={`/ops${buildQuery({ q, status, page: String(result.page - 1) })}`}
                    className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
                  >
                    Previous
                  </Link>
                ) : null}
                {result.page < result.pageCount ? (
                  <Link
                    href={`/ops${buildQuery({ q, status, page: String(result.page + 1) })}`}
                    className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
                  >
                    Next
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
