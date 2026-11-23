import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ParcelLogoProps {
  variant?: "light" | "dark";
  className?: string;
  href?: string;
}

export function ParcelLogo({ variant = "light", className, href = "/" }: ParcelLogoProps) {
  const isDark = variant === "dark";
  const src = isDark ? "/images/skynet-logo-dark.png" : "/images/skynet-logo-light.png";

  const inner = (
    <span className={cn("inline-flex items-center select-none", className)}>
      <Image
        src={src}
        alt="Skynet Freight"
        width={517}
        height={154}
        priority
        className="h-8.5 w-auto object-contain"
      />
    </span>
  );

  if (!href) return inner;
  return (
    <Link href={href} aria-label="Skynet Freight — home" className="inline-flex items-center">
      {inner}
    </Link>
  );
}
