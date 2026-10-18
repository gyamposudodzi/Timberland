import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-card">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="font-semibold">Timberland</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Own-fleet courier and delivery. Reliable pickup, transparent pricing, and live tracking for every parcel.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Services</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link href="/pricing" className="hover:text-foreground">Standard delivery</Link></li>
            <li><Link href="/pricing" className="hover:text-foreground">Express &amp; same-day</Link></li>
            <li><Link href="/quote" className="hover:text-foreground">Get a quote</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Support</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link href="/track" className="hover:text-foreground">Track a shipment</Link></li>
            <li><Link href="/help" className="hover:text-foreground">Help center</Link></li>
            <li><Link href="/login" className="hover:text-foreground">Sign in</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Legal</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link href="/legal" className="hover:text-foreground">Terms</Link></li>
            <li><Link href="/legal" className="hover:text-foreground">Privacy</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-page py-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Timberland Logistics. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
