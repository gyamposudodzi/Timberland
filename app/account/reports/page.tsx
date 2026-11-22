import Link from "next/link";
import { notFound } from "next/navigation";
import { BarChart3, CheckCircle2, Clock, Package } from "lucide-react";
import { auth } from "@/lib/auth";
import { getMyShipmentSummary } from "@/server/account.service";
import { SHIPMENT_STATUSES, STATUS_META } from "@/lib/shipment-status";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Reports" };

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const summary = await getMyShipmentSummary(session.user.id);
  const completionRate =
    summary.total > 0 ? Math.round((summary.delivered / summary.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-forest sm:text-3xl">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Delivery performance and volume breakdown across your workspace.
          </p>
        </div>
        <Link href="/account/shipments">
          <Button variant="outline" size="sm">
            View all shipments
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total volume</span>
            <Package className="h-4 w-4" />
          </div>
          <p className="mt-2 text-3xl font-bold text-forest tabular-nums">{summary.total}</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>In progress</span>
            <Clock className="h-4 w-4" />
          </div>
          <p className="mt-2 text-3xl font-bold text-forest tabular-nums">{summary.active}</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Delivery completion</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <p className="mt-2 text-3xl font-bold text-forest tabular-nums">{completionRate}%</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6 space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-forest" />
          <h2 className="text-base font-bold text-forest">Shipments by status</h2>
        </div>

        <div className="space-y-3">
          {SHIPMENT_STATUSES.map((st) => {
            const count = summary.byStatus[st] ?? 0;
            const pct = summary.total > 0 ? Math.round((count / summary.total) * 100) : 0;
            return (
              <div key={st} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-forest">{STATUS_META[st].label}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {count} ({pct}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-forest transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
