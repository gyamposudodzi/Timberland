import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Check, Globe, Package, Truck } from "lucide-react";
import { TrackForm } from "@/components/tracking/track-form";
import { FaqAccordion } from "@/components/home/faq-accordion";
import { Button } from "@/components/ui/button";

const SERVICES = [
  {
    icon: Package,
    title: "Parcel & express",
    body: "For the everyday essentials and the can't-wait deliveries.",
    meta: "Domestic & international",
    href: "/pricing",
  },
  {
    icon: Truck,
    title: "Freight & pallets",
    body: "Big on cargo. Light on complexity. Flexible LTL and full truckload options.",
    meta: "LTL · FTL · Business freight",
    href: "/pricing#freight",
  },
  {
    icon: Globe,
    title: "International shipping",
    body: "Take your business further, with guidance from pickup to customs.",
    meta: "Cross-border delivery",
    href: "/quote",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Book it your way",
    body: "Choose your service, add your delivery details, and see your quote upfront.",
  },
  {
    num: "02",
    title: "We'll take it from here",
    body: "Schedule a pickup or drop off your shipment at a convenient location.",
  },
  {
    num: "03",
    title: "Stay in the know",
    body: "Track every milestone and keep your customers updated along the way.",
  },
];

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="container-page grid items-center gap-12 py-14 md:grid-cols-12 md:py-20">
        <div className="md:col-span-6 space-y-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Small parcels. Big possibilities.
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-forest sm:text-5xl lg:text-[54px] lg:leading-[1.08]">
            From your door.
            <br />
            To what&apos;s next.
          </h1>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground">
            Express parcels, reliable freight, and a simpler way to ship. Whatever moves your world, we help you move it.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <Link href="/account/new-shipment">
              <Button variant="primary" size="lg" className="rounded-lg px-5">
                Start shipping <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest hover:text-success transition-colors"
            >
              Explore our services <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            Clear pricing · Door-to-door pickup · Real-time tracking
          </p>
        </div>

        <div className="md:col-span-6">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
            <Image
              src="/images/hero-van.jpg"
              alt="Parcel Logistics courier and delivery van"
              width={900}
              height={680}
              priority
              className="h-[340px] w-full object-cover sm:h-[420px]"
            />
            <div className="absolute bottom-4 left-4 rounded-xl bg-white/95 px-4 py-3 shadow-md backdrop-blur">
              <p className="text-sm font-semibold text-forest">A better way to deliver.</p>
              <p className="text-xs text-muted-foreground">From the first mile to the last.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dark tracking bar */}
      <section className="bg-forest text-white">
        <div className="container-page flex flex-col gap-5 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Good things are on the way.</h2>
            <p className="mt-1 text-sm text-[#9DAFA1]">Know exactly where your delivery stands.</p>
          </div>
          <div className="w-full md:max-w-lg">
            <TrackForm variant="dark" buttonLabel="Track shipment" />
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="container-page py-16 md:py-20">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Built around your delivery
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-forest">
              Every size. Every next step.
            </h2>
          </div>
          <Link
            href="/quote"
            className="inline-flex items-center gap-1 text-sm font-medium text-forest hover:text-success transition-colors"
          >
            Find your shipping solution <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {SERVICES.map((s) => (
            <div
              key={s.title}
              className="flex flex-col justify-between rounded-2xl border border-border bg-muted/60 p-7 transition-colors hover:bg-muted"
            >
              <div>
                <div className="mb-5 grid h-10 w-10 place-items-center rounded-xl bg-white border border-border text-forest">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-forest">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
              <div className="mt-8 space-y-3">
                <p className="text-xs font-medium text-muted-foreground">{s.meta}</p>
                <Link
                  href={s.href}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-forest hover:text-success transition-colors"
                >
                  Explore service <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3-step flow */}
      <section className="border-y border-border bg-muted/70 py-16 md:py-20">
        <div className="container-page">
          <h2 className="text-3xl font-bold tracking-tight text-forest">
            Less admin. More momentum.
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.num} className="space-y-2.5">
                <p className="font-mono text-2xl font-light text-[#9DAFA1]">{step.num}</p>
                <h3 className="text-base font-semibold text-forest">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workspace preview + value prop */}
      <section className="container-page grid items-center gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-6">
          <div className="rounded-2xl border border-border bg-secondary/70 p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-forest">Your business, in motion.</p>
              <Link href="/account" aria-label="Open workspace" className="text-forest hover:text-success">
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border bg-white p-4">
                <p className="text-2xl font-bold text-forest">24</p>
                <p className="mt-1 text-xs text-muted-foreground">In transit</p>
              </div>
              <div className="rounded-xl border border-border bg-white p-4">
                <p className="text-2xl font-bold text-forest">101</p>
                <p className="mt-1 text-xs text-muted-foreground">Delivered</p>
              </div>
              <div className="rounded-xl border border-border bg-white p-4">
                <p className="text-2xl font-bold text-forest">98.2%</p>
                <p className="mt-1 text-xs text-muted-foreground">On-time delivery</p>
              </div>
            </div>
            <div className="mt-3 rounded-xl border border-border bg-white p-4">
              <div className="flex items-center justify-between text-xs font-medium text-forest">
                <span className="font-mono font-semibold">PCL 8294 7201</span>
                <span>Chicago &rarr; Brooklyn</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 text-success font-medium">
                  <span className="h-2 w-2 rounded-full bg-success" /> Out for delivery
                </span>
                <span>Arriving today</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-6 space-y-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            For the way you do business
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-forest sm:text-4xl">
            One workspace.
            <br />
            Endless possibilities.
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Make shipping the simple part of running your business. Manage deliveries, addresses, invoices, and your team in one place.
          </p>
          <ul className="space-y-2 text-sm text-forest">
            <li className="flex items-center gap-2.5">
              <Check className="h-4 w-4 text-success" /> Parcel and freight, side by side
            </li>
            <li className="flex items-center gap-2.5">
              <Check className="h-4 w-4 text-success" /> Saved addresses and reusable shipment details
            </li>
            <li className="flex items-center gap-2.5">
              <Check className="h-4 w-4 text-success" /> Clear invoices and delivery updates
            </li>
          </ul>
          <div className="pt-2">
            <Link href="/signup">
              <Button variant="lime" size="lg">
                Create a business account <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-page border-t border-border py-16 md:py-20">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5 space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-forest">
              A little clarity,
              <br />
              a lot less guesswork.
            </h2>
            <p className="text-sm text-muted-foreground">A few things you might be wondering.</p>
            <Link
              href="/help"
              className="inline-flex items-center gap-1 pt-2 text-sm font-semibold text-forest hover:text-success transition-colors"
            >
              Visit the help center <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="md:col-span-7">
            <FaqAccordion />
          </div>
        </div>
      </section>

      {/* Lime CTA banner */}
      <section className="bg-lime text-forest">
        <div className="container-page flex flex-col items-start justify-between gap-6 py-12 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Your next delivery starts here.
            </h2>
            <p className="mt-1 text-sm text-forest/80">
              A single parcel or your next big order. Let&apos;s move it.
            </p>
          </div>
          <Link href="/account/new-shipment">
            <Button variant="primary" size="lg">
              Start shipping <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
