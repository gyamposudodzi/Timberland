"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const FAQS = [
  {
    q: "Can I ship without a business account?",
    a: "Yes. Create a free personal account to book, track, and manage your deliveries.",
  },
  {
    q: "What's the difference between parcel and freight?",
    a: "Parcel covers boxes, envelopes, and small packages up to 30 kg per piece. Freight handles pallets, LTL, and full truckload cargo.",
  },
  {
    q: "Can I schedule a pickup?",
    a: "Yes. Choose a pickup window when booking a shipment, or arrange a collection directly from your My Shipments dashboard.",
  },
  {
    q: "How do I track my delivery?",
    a: "Enter your tracking number on the home page or Track a Shipment page—no sign-in required. Account holders also get live dashboard updates and email alerts.",
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <div className="divide-y divide-border border-t border-b border-border">
      {FAQS.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={item.q} className="py-5">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? -1 : idx)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 text-left text-base font-medium text-forest transition-colors hover:text-success cursor-pointer"
            >
              <span>{item.q}</span>
              <span className="shrink-0 text-muted-foreground">
                {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </span>
            </button>
            {isOpen && (
              <p className="mt-2.5 pr-8 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
