import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

interface LegalSectionLink {
  id: string;
  label: string;
}

interface LegalShellProps {
  eyebrow?: string;
  title: string;
  subtitle: string;
  meta: string;
  sections: LegalSectionLink[];
  footerPrompt: string;
  footerLinkLabel: string;
  footerLinkHref: string;
  children: ReactNode;
}

export function LegalShell({
  eyebrow = "SKYNET FREIGHT / LEGAL",
  title,
  subtitle,
  meta,
  sections,
  footerPrompt,
  footerLinkLabel,
  footerLinkHref,
  children,
}: LegalShellProps) {
  return (
    <div className="bg-white">
      <section className="border-b border-border bg-muted/70 py-12">
        <div className="container-page max-w-6xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-forest sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <p className="mt-4 text-xs text-muted-foreground">{meta}</p>
        </div>
      </section>

      <section className="container-page max-w-6xl py-12">
        <div className="grid gap-12 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  On this page
                </p>
                <nav className="mt-3 space-y-2">
                  {sections.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className="block text-sm text-muted-foreground transition-colors hover:text-forest"
                    >
                      {s.label}
                    </a>
                  ))}
                </nav>
              </div>

              <div className="rounded-xl border border-border bg-muted/70 p-5">
                <p className="text-sm font-semibold text-forest">Need a little clarity?</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Our team can help you find the right information.
                </p>
                <Link
                  href="/help"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-forest hover:text-success transition-colors"
                >
                  Visit help center <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </aside>

          <div className="lg:col-span-8 space-y-10">
            {children}

            <div className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-muted/70 px-6 py-4 sm:flex-row sm:items-center">
              <p className="text-sm font-medium text-forest">{footerPrompt}</p>
              <Link
                href={footerLinkHref}
                className="inline-flex items-center gap-1 text-sm font-semibold text-forest hover:text-success transition-colors"
              >
                {footerLinkLabel} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
