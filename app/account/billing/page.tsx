import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, CreditCard, Download } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Billing & invoices" };

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const shipments = await prisma.shipment.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      trackingNumber: true,
      price: true,
      currency: true,
      paymentMethod: true,
      status: true,
      createdAt: true,
      serviceLevel: { select: { name: true } },
    },
  });

  const totalSpend = shipments.reduce((sum, s) => sum + Number(s.price), 0);
  const unpaidShipments = shipments.filter(
    (s) => s.status !== "DELIVERED" && s.status !== "CANCELLED" && s.status !== "RETURNED",
  );
  const unpaidTotal = unpaidShipments.reduce((sum, s) => sum + Number(s.price), 0);
  const currency = shipments[0]?.currency ?? "USD";

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-forest sm:text-3xl">
            Billing &amp; invoices
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Clear costs. Easy payments. Everything accounted for.
          </p>
        </div>
        <Link href="/account/shipments">
          <Button variant="lime" size="md">
            <Download className="h-4 w-4" /> View shipments
          </Button>
        </Link>
      </div>

      {/* 3 KPI cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-white p-6">
          <p className="text-xs font-medium text-muted-foreground">Total shipping spend</p>
          <p className="mt-2 text-3xl font-bold text-forest tabular-nums">
            {formatCurrency(totalSpend, currency)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Across {shipments.length} recent bookings</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-6">
          <p className="text-xs font-medium text-muted-foreground">Pending / pay on delivery</p>
          <p className="mt-2 text-3xl font-bold text-forest tabular-nums">
            {formatCurrency(unpaidTotal, currency)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {unpaidShipments.length} active shipment{unpaidShipments.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-6">
          <p className="text-xs font-medium text-muted-foreground">Default payment method</p>
          <p className="mt-2 text-2xl font-bold text-forest">Pay on delivery</p>
          <p className="mt-1 text-xs text-muted-foreground">Invoicing &amp; cash supported</p>
        </div>
      </div>

      {/* Payment method + Billing details */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-6 space-y-4">
          <h2 className="text-base font-bold text-forest">Payment method</h2>
          <div className="flex items-center gap-4">
            <div className="grid h-11 w-14 place-items-center rounded-lg border border-border bg-muted text-forest">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-forest">Pay on delivery / Business invoice</p>
              <p className="text-xs text-muted-foreground">Default settlement for new shipments</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Charges are confirmed upfront before dispatch and settled upon delivery or monthly invoice.
          </p>
          <Link
            href="/account/settings"
            className="inline-flex items-center gap-1 text-xs font-semibold text-success hover:underline"
          >
            Update preferences <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6 space-y-4">
          <h2 className="text-base font-bold text-forest">Billing details</h2>
          <div className="text-xs space-y-1">
            <p className="text-sm font-semibold text-forest">
              {session.user.name || "Account holder"}
            </p>
            <p className="text-muted-foreground">{session.user.email}</p>
          </div>
          <Link
            href="/account/settings"
            className="inline-flex items-center gap-1 text-xs font-semibold text-success hover:underline"
          >
            Edit billing details <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Invoice / Shipment ledger */}
      <div className="rounded-2xl border border-border bg-white p-6">
        <h2 className="text-base font-bold text-forest">Shipment charges</h2>
        {shipments.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No shipment charges yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/60 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Reference</th>
                  <th className="px-4 py-3 font-medium">Issued</th>
                  <th className="px-4 py-3 font-medium">Service</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Settlement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {shipments.map((s) => {
                  const settled = s.status === "DELIVERED";
                  return (
                    <tr key={s.id} className="hover:bg-muted/40">
                      <td className="px-4 py-3.5 font-mono text-xs font-semibold text-forest">
                        <Link href={`/account/shipments/${s.id}`} className="hover:underline">
                          {s.trackingNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        {formatDate(s.createdAt)}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-forest">{s.serviceLevel.name}</td>
                      <td className="px-4 py-3.5 text-xs font-semibold text-forest tabular-nums">
                        {formatCurrency(Number(s.price), s.currency)}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge tone={settled ? "success" : "warning"}>
                          {settled ? "Settled" : "Pending"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Questions about a charge?{" "}
        <Link href="/help#contact" className="inline-flex items-center gap-0.5 font-semibold text-forest hover:underline">
          Contact billing support <ArrowUpRight className="h-3 w-3" />
        </Link>
      </p>
    </div>
  );
}
