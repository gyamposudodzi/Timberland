import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { TrackForm } from "@/components/tracking/track-form";

export const metadata: Metadata = { title: "Track a shipment" };

export default function TrackIndexPage() {
  return (
    <div className="bg-white">
      <section className="border-b border-border bg-muted/70 py-14">
        <div className="container-page max-w-4xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Every mile, in view
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-forest sm:text-4xl">
            Follow your delivery.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            From pickup to your doorstep. See the latest on your shipment.
          </p>
          <div className="mt-6 max-w-2xl">
            <TrackForm buttonLabel="Track shipment" />
          </div>
        </div>
      </section>

      <section className="container-page max-w-4xl py-12">
        <div className="rounded-xl border border-border bg-muted/60 px-6 py-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-forest">
              Have an account? Manage deliveries, addresses, and notifications in your workspace.
            </p>
            <p className="text-xs text-muted-foreground">
              Guest tracking works with any valid Parcel tracking number.
            </p>
          </div>
          <Link
            href="/account"
            className="inline-flex items-center gap-1 text-sm font-semibold text-forest hover:text-success transition-colors shrink-0"
          >
            Go to workspace <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
