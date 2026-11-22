import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Globe, Package, Truck } from "lucide-react";
import { prisma } from "@/lib/db";
import { listServiceLevels } from "@/lib/rating";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Shipping services & pricing",
  description: "Transparent, zone-based delivery pricing.",
};

export default async function PricingPage() {
  const [zones, levels] = await Promise.all([
    prisma.serviceZone.findMany({ where: { active: true }, orderBy: { basePrice: "asc" } }),
    listServiceLevels(),
  ]);

  return (
    <div className="bg-white">
      <section className="border-b border-border bg-muted/70 py-12">
        <div className="container-page max-w-5xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            PARCEL / SHIPPING SERVICES
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-forest sm:text-4xl">
            Every size. Transparent pricing.
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Your rate combines a delivery zone base fee with a per-kilogram and per-piece charge, adjusted by the service level you choose. No hidden fees.
          </p>
        </div>
      </section>

      <section className="container-page max-w-5xl py-12 space-y-12">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-forest">Service levels</h2>
          <p className="mt-1 text-sm text-muted-foreground">Pick the delivery speed that fits your schedule.</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            {levels.map((l) => (
              <Card key={l.id} className="flex flex-col justify-between bg-muted/40">
                <CardHeader>
                  <div className="mb-3 grid h-9 w-9 place-items-center rounded-lg border border-border bg-white text-forest">
                    <Package className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-forest">{l.name}</CardTitle>
                  <CardDescription>{l.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-muted-foreground">
                  <p className="text-lg font-bold text-forest">
                    {l.slaDays === 0 ? "Same day" : `${l.slaDays} business day${l.slaDays > 1 ? "s" : ""}`}
                  </p>
                  <p>Price multiplier: &times;{Number(l.priceMultiplier)}</p>
                  <Link
                    href={`/quote?service=${l.code}`}
                    className="inline-flex items-center gap-1 pt-2 text-xs font-semibold text-forest hover:text-success"
                  >
                    Quote {l.name.toLowerCase()} <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold tracking-tight text-forest">Delivery zones</h2>
          <p className="mt-1 text-sm text-muted-foreground">Base fee per shipment by destination coverage.</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            {zones.map((z) => (
              <Card key={z.id}>
                <CardHeader>
                  <CardTitle className="text-base text-forest">{z.name}</CardTitle>
                  <CardDescription>Base fee per shipment</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-forest tabular-nums">
                    {formatCurrency(Number(z.basePrice), z.currency)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div id="freight" className="scroll-mt-24 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-muted/60 p-6 space-y-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-white text-forest">
              <Truck className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-forest">Freight &amp; pallets</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Need LTL or full truckload capacity? Select Freight when creating a shipment in your workspace to book multi-pallet cargo.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/60 p-6 space-y-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-white text-forest">
              <Globe className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-forest">Business invoicing</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Consolidate monthly shipments with clear billing statements and saved sender/recipient addresses in one workspace.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-lime text-forest">
        <div className="container-page max-w-5xl flex flex-col items-start justify-between gap-4 py-10 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Calculate your exact rate.</h2>
            <p className="mt-1 text-sm text-forest/80">
              Weight and piece rates vary by zone. Get an instant quote in seconds.
            </p>
          </div>
          <Link href="/quote">
            <Button variant="primary" size="lg">
              Get a quote <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
