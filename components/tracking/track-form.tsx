"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Client-safe normalization (uppercase, strip spaces/dashes). Full format
// validation happens on the server.
function normalize(value: string): string {
  return value.toUpperCase().replace(/[\s-]/g, "");
}

export function TrackForm({ defaultValue = "", compact = false }: { defaultValue?: string; compact?: boolean }) {
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
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter tracking number (e.g. TBTQ1HX8SKQ)"
          className="pl-9 font-mono"
          aria-label="Tracking number"
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      <Button type="submit" size={compact ? "sm" : "md"} className={compact ? "" : "sm:w-auto"}>
        Track
      </Button>
    </form>
  );
}
