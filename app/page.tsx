import Link from "next/link";
import { Truck, Radar, ReceiptText, BellRing, ArrowRight } from "lucide-react";
import { TrackForm } from "@/components/tracking/track-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listServiceLevels } from "@/lib/rating";

const FEATURES = [
  { icon: Radar, title: "Track anything, anytime", body: "Guests can follow a shipment by tracking number — no account required. Sign in for history and alerts." },
  { icon: ReceiptText, title: "Transparent zone pricing", body: "Rates are computed from delivery zone, weight and service level. No surprise fees at the door." },
  { icon: Truck, title: "Own-fleet reliability", body: "Our couriers, our standards. Consistent pickup windows and hand-written delivery proof." },
  { icon: BellRing, title: "Proactive notifications", body: "Email updates at pickup, out-for-delivery, delivery and any exception." },
];

export default async function HomePage() {
  const serviceLevels = await listServiceLevels();

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container-page grid gap-10 py-16 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center">
            <span className="mb-3 w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Own-fleet courier &amp; delivery
            </span>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Delivery you can track. Pricing you can trust.
            </h1>
            <p className="mt-4 max-w-md text-muted-foreground">
              Send parcels across the city or the country with live tracking, honest zone-based rates, and a fleet we run ourselves.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/signup">
                <Button size="lg">Create account</Button>
              </Link>
              <Link href="/quote">
                <Button size="lg" variant="outline">
                  Get a quote <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Track a shipment</CardTitle>
                <CardDescription>Enter your Timberland tracking number to see live status.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <TrackForm />
                <p className="text-xs text-muted-foreground">
                  Tip: try the demo code <span className="font-mono">TBTQ1HX8SKQ</span> — no sign-in needed.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container-page py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <Card key={f.title}>
              <CardHeader>
                <f.icon className="mb-2 h-7 w-7 text-primary" />
                <CardTitle className="text-base">{f.title}</CardTitle>
                <CardDescription>{f.body}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Service levels */}
      <section className="container-page pb-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Choose a service</h2>
            <p className="text-muted-foreground">Pick the speed that fits your parcel.</p>
          </div>
          <Link href="/pricing" className="hidden text-sm text-primary hover:underline sm:inline">
            See pricing
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {serviceLevels.map((lvl) => (
            <Card key={lvl.id}>
              <CardHeader>
                <CardTitle>{lvl.name}</CardTitle>
                <CardDescription>{lvl.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{lvl.slaDays === 0 ? "Today" : `${lvl.slaDays} day${lvl.slaDays > 1 ? "s" : ""}`}</p>
                <p className="text-sm text-muted-foreground">estimated delivery</p>
                <Link href={`/quote?service=${lvl.code}`} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  Quote this service <ArrowRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
