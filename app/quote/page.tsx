import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { QuoteCalculator } from "@/components/quote/quote-calculator";
import { listServiceLevels } from "@/lib/rating";

export const metadata: Metadata = {
  title: "Get a quote",
  description: "Estimate your delivery price with transparent zone-based pricing.",
};

export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const [services, sp] = await Promise.all([listServiceLevels(), searchParams]);
  const options = services.map((s) => ({ code: s.code, name: s.name, slaDays: s.slaDays }));

  return (
    <div className="bg-white">
      <section className="border-b border-border bg-muted/70 py-12">
        <div className="container-page max-w-5xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            PARCEL / INSTANT QUOTE
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-forest sm:text-4xl">
            Get a quote
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Instant, transparent estimate based on delivery zone, total weight, and service level. The final price is confirmed at booking.
          </p>
        </div>
      </section>

      <section className="container-page max-w-5xl py-10 space-y-8">
        <QuoteCalculator services={options} defaultService={sp.service} />

        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-border bg-muted/70 px-6 py-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-forest">Ready to book this route?</p>
            <p className="text-xs text-muted-foreground">
              Sign in or create a free account to lock in your rate and schedule pickup.
            </p>
          </div>
          <Link
            href="/account/new-shipment"
            className="inline-flex items-center gap-1 text-sm font-semibold text-forest hover:text-success transition-colors"
          >
            Create a shipment <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
