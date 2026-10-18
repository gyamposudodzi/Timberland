import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { auth } from "@/lib/auth";
import { listMyShipments, getMyShipmentSummary } from "@/server/account.service";
import { SHIPMENT_STATUSES, STATUS_META, type ShipmentStatus } from "@/lib/shipment-status";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusPill } from "@/components/tracking/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function buildQuery(params: Record<string, string | undefined>): string {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) usp.set(k, v);
  const s = usp.toString();
  return s ? `?${s}` : "";
}

export default async function AccountDashboard({
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

  const cards = [
    { label: "Total", value: summary.total, href: "/account" },
    { label: "In progress", value: summary.active, href: "/account?status=ACTIVE" },
    { label: "Delivered", value: summary.delivered, href: "/account?status=DELIVERED" },
  ];

  // Only surface status chips the customer actually has, plus All / In progress.
  const statusChips = SHIPMENT_STATUSES.filter((s) => summary.byStatus[s] > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your shipments</h1>
          <p className="text-sm text-muted-foreground">Welcome back, {session.user.name ?? "there"}.</p>
        </div>
        <Link href="/account/new-shipment">
          <Button>
            <Plus className="h-4 w-4" /> New shipment
          </Button>
        </Link>
      </div>

      {summary.total === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No shipments yet</CardTitle>
            <p className="text-sm text-muted-foreground">Create your first shipment to get started.</p>
          </CardHeader>
          <CardContent>
            <Link href="/account/new-shipment">
              <Button>Create a shipment</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {cards.map((c) => (
              <Link key={c.label} href={c.href}>
                <Card className="transition-colors hover:border-primary/40 hover:bg-muted/40">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">{c.label}</p>
                    <p className="text-3xl font-bold">{c.value}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Search */}
          <form className="flex items-center gap-3" action="/account">
            {status ? <input type="hidden" name="status" value={status} /> : null}
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={q}
                placeholder="Search tracking number…"
                className="pl-9 font-mono"
                aria-label="Search tracking number"
              />
            </div>
            <Button type="submit" size="sm" className="h-10">
              Search
            </Button>
            {q ? (
              <Link href={`/account${buildQuery({ status })}`} className="text-sm text-muted-foreground hover:text-foreground">
                Clear
              </Link>
            ) : null}
          </form>

          {/* Status filter chips */}
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/account${buildQuery({ q })}`}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                !status ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              All · {summary.total}
            </Link>
            <Link
              href={`/account${buildQuery({ q, status: "ACTIVE" })}`}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                status === "ACTIVE" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              In progress · {summary.active}
            </Link>
            {statusChips.map((s) => (
              <Link
                key={s}
                href={`/account${buildQuery({ q, status: s })}`}
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
                {status ? ` · filtered by ${status === "ACTIVE" ? "In progress" : STATUS_META[status as ShipmentStatus]?.label ?? status}` : ""}
                {q ? ` · “${q}”` : ""}
              </p>
              <Card>
                <CardContent className="p-0">
                  <ul className="divide-y divide-border">
                    {result.shipments.map((s) => (
                      <li key={s.id}>
                        <Link
                          href={`/account/shipments/${s.id}`}
                          className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 transition-colors hover:bg-muted/50"
                        >
                          <div className="min-w-0">
                            <p className="font-mono text-sm font-medium">{s.trackingNumber}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {s.serviceLevel.name} · to {s.recipientAddress.city}, {s.recipientAddress.country}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <StatusPill status={s.status as ShipmentStatus} />
                            <span className="text-sm font-medium">{formatCurrency(Number(s.price), s.currency)}</span>
                            <span className="hidden text-xs text-muted-foreground sm:inline">{formatDate(s.createdAt)}</span>
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
                        href={`/account${buildQuery({ q, status, page: String(result.page - 1) })}`}
                        className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
                      >
                        Previous
                      </Link>
                    ) : null}
                    {result.page < result.pageCount ? (
                      <Link
                        href={`/account${buildQuery({ q, status, page: String(result.page + 1) })}`}
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
        </>
      )}
    </div>
  );
}
