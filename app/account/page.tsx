import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { listMyShipments } from "@/server/account.service";
import { type ShipmentStatus } from "@/lib/shipment-status";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusPill } from "@/components/tracking/status-pill";
import { Button } from "@/components/ui/button";

export default async function AccountDashboard() {
  const session = await auth();
  if (!session?.user?.id) notFound();
  const shipments = await listMyShipments(session.user.id);

  const active = shipments.filter((s) => !["DELIVERED", "CANCELLED", "RETURNED"].includes(s.status)).length;
  const delivered = shipments.filter((s) => s.status === "DELIVERED").length;

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

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-3xl font-bold">{shipments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">In progress</p>
            <p className="text-3xl font-bold">{active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Delivered</p>
            <p className="text-3xl font-bold">{delivered}</p>
          </CardContent>
        </Card>
      </div>

      {shipments.length === 0 ? (
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
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {shipments.map((s) => (
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
      )}
    </div>
  );
}
