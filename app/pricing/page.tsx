import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { listServiceLevels } from "@/lib/rating";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Transparent, zone-based delivery pricing.",
};

export default async function PricingPage() {
  const [zones, levels] = await Promise.all([
    prisma.serviceZone.findMany({ where: { active: true }, orderBy: { basePrice: "asc" } }),
    listServiceLevels(),
  ]);

  return (
    <div className="container-page max-w-5xl py-12">
      <h1 className="text-3xl font-bold tracking-tight">Pricing</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Your price is a zone base fee plus a per-kilogram and per-piece charge, adjusted by the service you choose. No hidden
        fees.
      </p>

      <h2 className="mt-10 text-xl font-semibold">Delivery zones</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {zones.map((z) => (
          <Card key={z.id}>
            <CardHeader>
              <CardTitle>{z.name}</CardTitle>
              <CardDescription>Base fee per shipment</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{formatCurrency(Number(z.basePrice), z.currency)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="mt-10 text-xl font-semibold">Service levels</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {levels.map((l) => (
          <Card key={l.id}>
            <CardHeader>
              <CardTitle>{l.name}</CardTitle>
              <CardDescription>{l.description}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                ETA: {l.slaDays === 0 ? "same day" : `${l.slaDays} day${l.slaDays > 1 ? "s" : ""}`}
              </p>
              <p>Price factor: ×{Number(l.priceMultiplier)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 rounded-lg border border-border bg-muted/40 p-6">
        <p className="text-sm text-muted-foreground">Weight and piece rates vary by zone. Get an exact estimate in seconds.</p>
        <Link href="/quote" className="mt-3 inline-block">
          <Button>Get a quote</Button>
        </Link>
      </div>
    </div>
  );
}
