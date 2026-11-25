import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Help center" };

const FAQ = [
  {
    q: "Do I need an account to track a shipment?",
    a: "No. Anyone with a tracking number can view public status and journey updates on the Track a shipment page. An account adds full history, saved addresses, and email alerts.",
  },
  {
    q: "How is my price calculated?",
    a: "Pricing combines a zone base fee with a per-kilogram and per-piece charge, multiplied by your selected service level. A minimum charge may apply on short routes.",
  },
  {
    q: "When do I pay?",
    a: "By default, payment is collected on delivery. Business invoicing and consolidated monthly statements are available for account holders.",
  },
  {
    q: "What if there is a delivery problem?",
    a: "We log an Exception update and notify you immediately. Sign in to see full details and coordinate next steps with our support team.",
  },
];

export default function HelpPage() {
  return (
    <div className="bg-white">
      <section className="border-b border-border bg-muted/70 py-12">
        <div className="container-page max-w-4xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            SKYNET FREIGHT / SUPPORT
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-forest sm:text-4xl">
            Help center
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Answers to common questions. Need a person? Email{" "}
            <span className="font-medium text-forest">support@skynetfreight.com</span>.
          </p>
        </div>
      </section>

      <section className="container-page max-w-4xl py-12 space-y-4">
        {FAQ.map((item) => (
          <Card key={item.q}>
            <CardHeader>
              <CardTitle className="text-base text-forest">{item.q}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-muted-foreground">
              {item.a}
            </CardContent>
          </Card>
        ))}

        <div
          id="contact"
          className="mt-8 flex flex-col justify-between gap-4 rounded-xl border border-border bg-muted/70 p-6 sm:flex-row sm:items-center"
        >
          <div>
            <p className="text-sm font-semibold text-forest">Still need assistance?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Have your tracking number ready and reach out to support@skynetfreight.com.
            </p>
          </div>
          <Link
            href="/track"
            className="inline-flex items-center gap-1 text-sm font-semibold text-forest hover:text-success transition-colors"
          >
            Track a shipment <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
