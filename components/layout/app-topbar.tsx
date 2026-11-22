"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, Menu, Search, X } from "lucide-react";
import { UserMenu } from "@/components/layout/user-menu";
import { ParcelLogo } from "@/components/brand/parcel-logo";

const LABELS: Record<string, string> = {
  "/account": "Overview",
  "/account/shipments": "My shipments",
  "/account/new-shipment": "Create shipment",
  "/account/addresses": "Address book",
  "/account/billing": "Billing & invoices",
  "/account/reports": "Reports",
  "/account/settings": "Account settings",
  "/account/notifications": "Notifications",
};

interface AppTopbarProps {
  userName: string;
  userEmail: string | null;
  userRole: string | null;
  userId: string;
  signOutAction: () => Promise<void>;
}

export function AppTopbar({
  userName,
  userEmail,
  userRole,
  userId,
  signOutAction,
}: AppTopbarProps) {
  const pathname = usePathname() ?? "/account";
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const pageLabel =
    LABELS[pathname] ??
    (pathname.startsWith("/account/shipments/") ? "Shipment details" : "Workspace");

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation"
            className="grid h-9 w-9 place-items-center rounded-lg border border-border text-forest lg:hidden cursor-pointer"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Workspace</span>
            <span>/</span>
            <span className="font-medium text-forest">{pageLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <form
            className="hidden sm:block"
            onSubmit={(e) => {
              e.preventDefault();
              const q = search.trim();
              router.push(q ? `/account/shipments?q=${encodeURIComponent(q)}` : "/account/shipments");
            }}
          >
            <div className="relative w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search shipments, tracking…"
                aria-label="Quick search shipments"
                className="h-9 w-full rounded-lg border border-border bg-muted/60 pl-8 pr-3 text-xs text-forest placeholder:text-muted-foreground focus:border-ring focus:bg-white focus:outline-none"
              />
            </div>
          </form>

          <Link
            href="/account/notifications"
            aria-label="Notifications"
            className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-forest"
          >
            <Bell className="h-4 w-4" />
          </Link>

          <UserMenu
            name={userName}
            email={userEmail}
            role={userRole}
            userId={userId}
            signOutAction={signOutAction}
          />
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileOpen && (
        <div className="border-t border-border bg-forest p-4 text-white lg:hidden">
          <div className="mb-3">
            <ParcelLogo variant="dark" href="/" />
          </div>
          <nav className="grid grid-cols-2 gap-2 text-sm">
            {[
              { href: "/account", label: "Overview" },
              { href: "/account/shipments", label: "Shipments" },
              { href: "/account/new-shipment", label: "Create shipment" },
              { href: "/account/addresses", label: "Address book" },
              { href: "/account/billing", label: "Billing & invoices" },
              { href: "/account/reports", label: "Reports" },
              { href: "/account/settings", label: "Settings" },
              { href: "/track", label: "Track" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-[#B6C7C0] hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
