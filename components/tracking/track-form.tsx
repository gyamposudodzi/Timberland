"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, ArrowUpRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function normalize(value: string): string {
  return value.toUpperCase().replace(/[\s-]/g, "");
}

export function TrackForm({
  defaultValue = "",
  compact = false,
  variant = "light",
  buttonLabel = "Track shipment",
}: {
  defaultValue?: string;
  compact?: boolean;
  variant?: "light" | "dark";
  buttonLabel?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  return (
    <form
      className={compact ? "flex w-full gap-2" : "flex w-full flex-col gap-3 sm:flex-row"}
      onSubmit={(e) => {
        e.preventDefault();
        const code = normalize(value);
        if (!code) return;
        router.push(`/track/${encodeURIComponent(code)}`);
      }}
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter your tracking number"
          className={
            variant === "dark"
              ? "h-11 border-transparent bg-white pl-10 font-mono text-forest placeholder:text-muted-foreground"
              : "h-11 bg-white pl-10 font-mono text-forest"
          }
          aria-label="Tracking number"
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      <Button
        type="submit"
        variant={variant === "dark" ? "lime" : "primary"}
        size={compact ? "sm" : "lg"}
        className={compact ? "" : "h-11 shrink-0 px-5"}
      >
        {buttonLabel}
        {variant === "dark" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
      </Button>
    </form>
  );
}
