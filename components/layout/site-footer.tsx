import Link from "next/link";
import { ParcelLogo } from "@/components/brand/parcel-logo";

export function SiteFooter() {
  return (
    <footer className="bg-forest text-white">
      <div className="container-page py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <ParcelLogo variant="dark" />
            <p className="text-sm text-[#9DAFA1]">Moving the things that move you.</p>
            <p className="text-xs text-[#73807B]">Parcels. Freight. Possibilities.</p>
          </div>

          <div className="space-y-2.5 text-sm">
            <p className="font-semibold text-white">Ship with Skynet Freight</p>
            <ul className="space-y-2 text-[#9DAFA1]">
              <li><Link href="/pricing" className="hover:text-lime transition-colors">Parcel &amp; express</Link></li>
              <li><Link href="/pricing#freight" className="hover:text-lime transition-colors">Freight solutions</Link></li>
              <li><Link href="/track" className="hover:text-lime transition-colors">Track a shipment</Link></li>
              <li><Link href="/quote" className="hover:text-lime transition-colors">Get a quote</Link></li>
            </ul>
          </div>

          <div className="space-y-2.5 text-sm">
            <p className="font-semibold text-white">Your account</p>
            <ul className="space-y-2 text-[#9DAFA1]">
              <li><Link href="/login" className="hover:text-lime transition-colors">Sign in</Link></li>
              <li><Link href="/signup" className="hover:text-lime transition-colors">Create account</Link></li>
              <li><Link href="/account/shipments" className="hover:text-lime transition-colors">My shipments</Link></li>
              <li><Link href="/account/billing" className="hover:text-lime transition-colors">Billing &amp; invoices</Link></li>
            </ul>
          </div>

          <div className="space-y-2.5 text-sm">
            <p className="font-semibold text-white">Here to help</p>
            <ul className="space-y-2 text-[#9DAFA1]">
              <li><Link href="/help" className="hover:text-lime transition-colors">Help center</Link></li>
              <li><Link href="/help#contact" className="hover:text-lime transition-colors">Contact support</Link></li>
              <li><Link href="/terms" className="hover:text-lime transition-colors">Terms &amp; conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-lime transition-colors">Privacy policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-xs text-[#73807B] sm:flex-row sm:items-center">
          <p>&copy; {new Date().getFullYear()} Skynet Freight. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>United States · English</span>
            <Link href="/privacy#cookies" className="hover:text-white transition-colors">
              Cookie preferences
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
