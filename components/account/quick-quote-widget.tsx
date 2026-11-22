"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Globe, MapPin, Package, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuickQuoteWidget() {
  const router = useRouter();
  const [mode, setMode] = useState<"parcel" | "freight">("parcel");
  const [fromZip, setFromZip] = useState("");
  const [toZip, setToZip] = useState("");

  return (
    <div className="flex flex-col justify-between rounded-2xl bg-forest p-6 text-white">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Let&apos;s get it there.</h2>
            <p className="mt-1 text-xs text-[#9DAFA1]">
              A small parcel or a full load. We&apos;ve got you.
            </p>
          </div>
          <Globe className="h-5 w-5 shrink-0 text-[#9DAFA1]" />
        </div>

        {/* Parcel / Freight toggle */}
        <div className="grid grid-cols-2 rounded-xl bg-forest-deep p-1">
          <button
            type="button"
            onClick={() => setMode("parcel")}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-colors cursor-pointer ${
              mode === "parcel" ? "bg-lime text-forest" : "text-[#9DAFA1] hover:text-white"
            }`}
          >
            <Package className="h-3.5 w-3.5" /> Parcel
          </button>
          <button
            type="button"
            onClick={() => setMode("freight")}
            className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-colors cursor-pointer ${
              mode === "freight" ? "bg-lime text-forest" : "text-[#9DAFA1] hover:text-white"
            }`}
          >
            <Truck className="h-3.5 w-3.5" /> Freight
          </button>
        </div>

        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const usp = new URLSearchParams();
            if (toZip.trim()) usp.set("postal", toZip.trim());
            if (mode === "freight") usp.set("type", "freight");
            router.push(`/quote${usp.toString() ? `?${usp.toString()}` : ""}`);
          }}
        >
          <div>
            <label className="mb-1 block text-[11px] font-medium text-[#B6C7C0]">
              Ship from
            </label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={fromZip}
                onChange={(e) => setFromZip(e.target.value)}
                placeholder="City or ZIP code"
                className="h-10 w-full rounded-lg bg-white pl-9 pr-3 text-xs text-forest placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-lime"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium text-[#B6C7C0]">
              Ship to
            </label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={toZip}
                onChange={(e) => setToZip(e.target.value)}
                placeholder="City or ZIP code"
                className="h-10 w-full rounded-lg bg-white pl-9 pr-3 text-xs text-forest placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-lime"
              />
            </div>
          </div>

          <Button type="submit" variant="lime" size="lg" className="mt-1 w-full">
            Get a quote <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-[#9DAFA1]">
        <Check className="h-3 w-3 text-lime" /> Transparent rates. No hidden fees.
      </p>
    </div>
  );
}
