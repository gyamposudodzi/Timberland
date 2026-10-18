import type { Metadata } from "next";
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
    <div className="container-page max-w-5xl py-12">
      <h1 className="text-3xl font-bold tracking-tight">Get a quote</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Instant, transparent estimate based on delivery zone, total weight and service level. The final price is confirmed at
        booking.
      </p>
      <div className="mt-8">
        <QuoteCalculator services={options} defaultService={sp.service} />
      </div>
    </div>
  );
}
