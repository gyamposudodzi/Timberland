import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms & privacy" };

export default function LegalPage() {
  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="text-3xl font-bold tracking-tight">Terms &amp; privacy</h1>
      <div className="mt-6 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">Terms of service</h2>
          <p className="mt-2">
            Timberland provides courier and delivery services using our own fleet. By booking a shipment you agree to provide
            accurate address and contents information and to pay the quoted amount on delivery. Valuable and restricted items are
            subject to our declared-value limits and prohibited-items list.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">Privacy</h2>
          <p className="mt-2">
            We collect the contact and address details you provide to fulfil deliveries and to send status notifications. Guest
            tracking shows only city-level route information — street addresses, phone numbers and prices are never exposed on
            public tracking pages. You can request export or deletion of your account data at any time.
          </p>
        </section>
        <p className="text-xs">This is a demonstration page and does not constitute legal advice.</p>
      </div>
    </div>
  );
}
