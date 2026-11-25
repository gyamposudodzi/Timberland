import type { Metadata } from "next";
import { LegalShell } from "@/components/layout/legal-shell";

export const metadata: Metadata = { title: "Terms & conditions" };

const SECTIONS = [
  { id: "using-skynet-freight", label: "01 Using Skynet Freight" },
  { id: "account", label: "02 Your account & responsibilities" },
  { id: "bookings", label: "03 Bookings, quotes & payment" },
  { id: "packaging", label: "04 Packaging & restricted goods" },
  { id: "transit", label: "05 Collection, transit & delivery" },
  { id: "international", label: "06 International shipping & customs" },
  { id: "claims", label: "07 Loss, damage & claims" },
  { id: "cancellations", label: "08 Changes, cancellation & suspension" },
  { id: "rights", label: "09 Your rights & applicable rules" },
  { id: "updates", label: "10 Updates & contact" },
];

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms & conditions"
      subtitle="The details behind every delivery. Clear, considered, and easy to find."
      meta="Effective · November 2026"
      sections={SECTIONS}
      footerPrompt="Looking for our privacy policy?"
      footerLinkLabel="Read privacy policy"
      footerLinkHref="/privacy"
    >
      <section id="using-skynet-freight" className="scroll-mt-24 space-y-2.5">
        <h2 className="text-xl font-bold text-forest">01 Using Skynet Freight</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          These terms govern your use of the Skynet Freight website, customer workspace, and parcel and freight booking services. When you create an account or book a shipment, you agree to the terms presented at that time alongside any service-specific conditions.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Please review your booking details before confirming a shipment. If you are booking on behalf of a business, you confirm that you are authorized to act on its behalf.
        </p>
      </section>

      <section id="account" className="scroll-mt-24 space-y-2.5">
        <h2 className="text-xl font-bold text-forest">02 Your account &amp; responsibilities</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Provide accurate contact, billing, sender, and recipient information, and keep your account details up to date. You are responsible for safeguarding your sign-in credentials and for activity under your account.
        </p>
      </section>

      <section id="bookings" className="scroll-mt-24 space-y-2.5">
        <h2 className="text-xl font-bold text-forest">03 Bookings, quotes &amp; payment</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Quotes are calculated from your declared dimensions, weight, origin, destination zone, and service level. Final charges may be adjusted if verified shipment weights or dimensions differ or if additional services are requested.
        </p>
      </section>

      <section id="packaging" className="scroll-mt-24 space-y-2.5">
        <h2 className="text-xl font-bold text-forest">04 Packaging &amp; restricted goods</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Senders are responsible for suitable packaging, secure sealing, legible labels, and truthful content descriptions. Prohibited, hazardous, or regulated goods may require prior approval or may not be accepted for carriage.
        </p>
      </section>

      <section id="transit" className="scroll-mt-24 space-y-2.5">
        <h2 className="text-xl font-bold text-forest">05 Collection, transit &amp; delivery</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Collection windows and estimated delivery dates depend on the selected service and route. Weather, traffic, access restrictions, or customs inspections may affect transit times. Delivery estimates are not guaranteed unless explicitly stated.
        </p>
      </section>

      <section id="international" className="scroll-mt-24 space-y-2.5">
        <h2 className="text-xl font-bold text-forest">06 International shipping &amp; customs</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          For cross-border shipments, accurate customs declarations and commercial documentation are required. Duties, taxes, and clearance charges depend on destination regulations and the agreed terms of the booking.
        </p>
      </section>

      <section id="claims" className="scroll-mt-24 space-y-2.5">
        <h2 className="text-xl font-bold text-forest">07 Loss, damage &amp; claims</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Inspect deliveries upon arrival and retain packaging and supporting records if an issue occurs. Contact support with your tracking number, description of the issue, and supporting photos or proof of value.
        </p>
      </section>

      <section id="cancellations" className="scroll-mt-24 space-y-2.5">
        <h2 className="text-xl font-bold text-forest">08 Changes, cancellation &amp; suspension</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          You may request a booking change or cancellation through your workspace or support before transit begins. Availability and applicable charges depend on whether collection has occurred.
        </p>
      </section>

      <section id="rights" className="scroll-mt-24 space-y-2.5">
        <h2 className="text-xl font-bold text-forest">09 Your rights &amp; applicable rules</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Nothing in these terms excludes statutory consumer rights or mandatory transport rules that cannot lawfully be excluded.
        </p>
      </section>

      <section id="updates" className="scroll-mt-24 space-y-2.5">
        <h2 className="text-xl font-bold text-forest">10 Updates &amp; contact</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Material updates to these terms will be communicated before taking effect where required. The version accepted at booking governs that shipment.
        </p>
      </section>
    </LegalShell>
  );
}
