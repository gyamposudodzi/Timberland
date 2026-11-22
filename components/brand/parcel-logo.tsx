import Link from "next/link";
import { cn } from "@/lib/utils";

interface ParcelLogoProps {
  variant?: "light" | "dark";
  className?: string;
  href?: string;
}

export function ParcelLogo({ variant = "light", className, href = "/" }: ParcelLogoProps) {
  const inner = (
    <span className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-lime text-forest shadow-xs">
        <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" aria-hidden="true">
          <path
            d="M12 3L4.5 7.25v9.5L12 21l7.5-4.25v-9.5L12 3Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M4.5 7.25L12 11.5l7.5-4.25M12 11.5V21" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      </span>
      <span
        className={cn(
          "text-xl font-bold tracking-tight",
          variant === "dark" ? "text-white" : "text-forest",
        )}
      >
        parcel
      </span>
      <span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden="true" />
    </span>
  );

  if (!href) return inner;
  return (
    <Link href={href} aria-label="Parcel Logistics — home" className="inline-flex items-center">
      {inner}
    </Link>
  );
}
