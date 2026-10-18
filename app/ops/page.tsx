import Link from "next/link";
import { Search } from "lucide-react";
import { listShipmentsForOps } from "@/server/ops.service";
import { SHIPMENT_STATUSES, type ShipmentStatus } from "@/lib/shipment-status";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { StatusPill } from "@/components/tracking/status-pill";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const metadata = { title: "Operations queue" };

export default async function OpsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q = "", status = "" } = await searchParams;
  const shipments = await listShipmentsForOps({ q, status });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Shipment queue</h2>
        <p className="text-sm text-muted-foreground">All shipments across customers, most recently updated first.</p>
      </div>

      <form className="flex flex-wrap items-center gap-3" action="/ops">
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
        <select
          name="status"
          defaultValue={status}
          aria-label="Filter by status"
          className="h-10 rounded-md border border-input bg-card px-3 text-sm shadow-sm"
        >
          <option value="">All statuses</option>
          {SHIPMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <button type="submit" className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Filter
        </button>
      </form>

      {shipments.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">No shipments match this filter.</CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {shipments.map((s) => (
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
      )}
    </div>
  );
}
