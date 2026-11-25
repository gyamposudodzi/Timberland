import type { Metadata } from "next";
import { LegalShell } from "@/components/layout/legal-shell";

export const metadata: Metadata = { title: "Privacy policy" };

const SECTIONS = [
  { id: "about", label: "01 About this policy" },
  { id: "collect", label: "02 Information we collect" },
  { id: "use", label: "03 How we use information" },
  { id: "sharing", label: "04 Sharing with service partners" },
  { id: "cookies", label: "05 Cookies & your choices" },
  { id: "security", label: "06 Keeping information safe" },
  { id: "retention", label: "07 Retention & international transfers" },
  { id: "rights", label: "08 Your privacy rights" },
  { id: "contact", label: "09 Updates & getting in touch" },
];

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy policy"
      subtitle="Your information matters. Here's how it is handled."
      meta="Effective · November 2026"
      sections={SECTIONS}
      footerPrompt="Looking for our terms & conditions?"
      footerLinkLabel="Read terms & conditions"
      footerLinkHref="/terms"
    >
      <section id="about" className="scroll-mt-24 space-y-2.5">
        <h2 className="text-xl font-bold text-forest">01 About this policy</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          This policy explains how Skynet Freight collects, uses, and protects personal information across our website, customer workspace, shipping services, and support channels.
        </p>
      </section>

      <section id="collect" className="scroll-mt-24 space-y-2.5">
        <h2 className="text-xl font-bold text-forest">02 Information we collect</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Account details may include your name, business name, email address, phone number, and shipping preferences. Shipment records include sender and recipient addresses, package descriptions, tracking events, and delivery instructions.
        </p>
      </section>

      <section id="use" className="scroll-mt-24 space-y-2.5">
        <h2 className="text-xl font-bold text-forest">03 How we use information</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          We use your information to manage accounts, arrange collection and delivery, provide live tracking updates, process billing, respond to support requests, and protect platform security.
        </p>
      </section>

      <section id="sharing" className="scroll-mt-24 space-y-2.5">
        <h2 className="text-xl font-bold text-forest">04 Sharing with service partners</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          To complete deliveries, necessary shipment information is shared with collection and delivery couriers, customs agents, recipients, and payment or infrastructure providers acting on our behalf.
        </p>
      </section>

      <section id="cookies" className="scroll-mt-24 space-y-2.5">
        <h2 className="text-xl font-bold text-forest">05 Cookies &amp; your choices</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Essential cookies support authentication, session security, and core workspace functionality. You can manage browser cookie preferences at any time.
        </p>
      </section>

      <section id="security" className="scroll-mt-24 space-y-2.5">
        <h2 className="text-xl font-bold text-forest">06 Keeping information safe</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          We apply technical and organizational safeguards—including encrypted transport, hashed passwords, and role-based access controls—to protect your data.
        </p>
      </section>

      <section id="retention" className="scroll-mt-24 space-y-2.5">
        <h2 className="text-xl font-bold text-forest">07 Retention &amp; international transfers</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Information is retained only as long as needed for service delivery, financial records, legal compliance, and claims handling.
        </p>
      </section>

      <section id="rights" className="scroll-mt-24 space-y-2.5">
        <h2 className="text-xl font-bold text-forest">08 Your privacy rights</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Depending on your jurisdiction, you may request access, correction, deletion, or export of your personal information. You can update profile details directly in Account settings.
        </p>
      </section>

      <section id="contact" className="scroll-mt-24 space-y-2.5">
        <h2 className="text-xl font-bold text-forest">09 Updates &amp; getting in touch</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Material updates to this policy will be posted here with an updated effective date. Contact our support team via the Help center for privacy enquiries.
        </p>
      </section>
    </LegalShell>
  );
}
