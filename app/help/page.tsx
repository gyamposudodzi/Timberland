import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Help center" };

const FAQ = [
  { q: "Do I need an account to track a shipment?", a: "No. Anyone with a tracking number can see the public status and history. An account adds shipment history, saved addresses and email alerts." },
  { q: "How is my price calculated?", a: "Zone base fee, plus a per-kilogram and per-piece charge, multiplied by your chosen service level. A minimum charge may apply on short routes." },
  { q: "When do I pay?", a: "By default, payment is on delivery. Business invoicing and prepaid options are available for account holders." },
  { q: "What if there is a delivery problem?", a: "We log an Exception update and notify you. Sign in to see details and next steps on the shipment page." },
];

export default function HelpPage() {
  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="text-3xl font-bold tracking-tight">Help center</h1>
      <p className="mt-2 text-muted-foreground">Answers to common questions. Need a person? Email support@timberland.example.</p>

      <div className="mt-8 space-y-4">
        {FAQ.map((item) => (
          <Card key={item.q}>
            <CardHeader>
              <CardTitle className="text-base">{item.q}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{item.a}</CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Link href="/track" className="text-sm font-medium text-primary hover:underline">
          Track a shipment →
        </Link>
      </div>
    </div>
  );
}
