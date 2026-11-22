import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Check } from "lucide-react";
import type { ReactNode } from "react";
import { ParcelLogo } from "@/components/brand/parcel-logo";

interface AuthShellProps {
  topPrompt: string;
  topLinkLabel: string;
  topLinkHref: string;
  children: ReactNode;
}

export function AuthShell({
  topPrompt,
  topLinkLabel,
  topLinkHref,
  children,
}: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Top minimal bar */}
      <header className="mx-auto flex h-18 w-full max-w-6xl items-center justify-between px-6">
        <ParcelLogo variant="light" />
        <p className="text-xs text-muted-foreground">
          {topPrompt}{" "}
          <Link
            href={topLinkHref}
            className="inline-flex items-center gap-0.5 font-semibold text-forest hover:text-success transition-colors"
          >
            {topLinkLabel} <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </p>
      </header>

      {/* Main split content */}
      <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-6 py-8 lg:grid-cols-12">
        {/* Left dark green brand panel */}
        <div className="hidden rounded-2xl bg-forest p-8 text-white lg:col-span-6 lg:block">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9DAFA1]">
            Parcel · Your shipping partner
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight leading-tight">
            Your next chapter.
            <br />
            Delivered.
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#B6C7C0]">
            From first orders to bigger possibilities, keep everything moving with one simple workspace.
          </p>

          <div className="mt-6 overflow-hidden rounded-xl border border-white/10">
            <Image
              src="/images/hero-van.jpg"
              alt="Parcel delivery van and courier"
              width={640}
              height={400}
              className="h-56 w-full object-cover"
            />
          </div>

          <ul className="mt-6 space-y-2.5 text-sm text-[#D6E2DC]">
            <li className="flex items-center gap-2.5">
              <Check className="h-4 w-4 text-lime" /> Parcel and freight in one place
            </li>
            <li className="flex items-center gap-2.5">
              <Check className="h-4 w-4 text-lime" /> Real-time visibility, less guesswork
            </li>
            <li className="flex items-center gap-2.5">
              <Check className="h-4 w-4 text-lime" /> Saved addresses and simple billing
            </li>
          </ul>
        </div>

        {/* Right form area */}
        <div className="mx-auto w-full max-w-md lg:col-span-6">{children}</div>
      </div>

      {/* Bottom minimal bar */}
      <footer className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-3 px-6 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
        <p>&copy; {new Date().getFullYear()} Parcel Logistics</p>
        <div className="flex items-center gap-5">
          <Link href="/terms" className="hover:text-forest transition-colors">
            Terms &amp; conditions
          </Link>
          <Link href="/privacy" className="hover:text-forest transition-colors">
            Privacy policy
          </Link>
          <Link href="/help" className="hover:text-forest transition-colors">
            Help center
          </Link>
        </div>
      </footer>
    </div>
  );
}
