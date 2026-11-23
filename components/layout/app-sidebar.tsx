"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Package,
  MapPin,
  CreditCard,
  BarChart3,
  Settings,
  HelpCircle,
  Search,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { ParcelLogo } from "@/components/brand/parcel-logo";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  workspaceName?: string;
  activeCount?: number;
  isAdmin?: boolean;
}

export function AppSidebar({ activeCount = 0, isAdmin = false }: AppSidebarProps) {
  const pathname = usePathname() ?? "/account";

  const navItems = [
    { href: "/account", label: "Overview", icon: LayoutGrid, exact: true },
    {
      href: "/account/shipments",
      label: "Shipments",
      icon: Package,
      badge: activeCount > 0 ? activeCount : undefined,
    },
    { href: "/track", label: "Track a shipment", icon: Search },
    { href: "/account/addresses", label: "Address book", icon: MapPin },
    { href: "/account/billing", label: "Billing & invoices", icon: CreditCard },
    { href: "/account/reports", label: "Reports", icon: BarChart3 },
    ...(isAdmin ? [{ href: "/admin", label: "Admin queue", icon: ShieldCheck }] : []),
  ];

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside className="hidden w-64 shrink-0 flex-col justify-between bg-forest text-white lg:flex">
      <div className="p-5 space-y-5">
        <div className="px-1">
          <ParcelLogo variant="dark" href="/" />
        </div>

        {/* Primary nav */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-lime font-semibold text-forest"
                    : "text-[#B6C7C0] hover:bg-white/5 hover:text-white",
                )}
              >
                <span className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </span>
                {item.badge !== undefined && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                      active ? "bg-forest/10 text-forest" : "bg-white/10 text-white",
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="p-5 space-y-4">
        <div className="rounded-xl border border-white/10 bg-forest-muted/70 p-4">
          <div className="mb-2 grid h-7 w-7 place-items-center rounded-full border border-lime/40 text-lime">
            <HelpCircle className="h-4 w-4" />
          </div>
          <p className="text-xs font-semibold text-white">A little shipping help?</p>
          <p className="mt-0.5 text-[11px] text-[#9DAFA1]">Our team is one click away.</p>
          <Link
            href="/help#contact"
            className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-lime hover:underline"
          >
            Contact support <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="space-y-1 border-t border-white/10 pt-3">
          <Link
            href="/account/settings"
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2 text-sm transition-colors",
              isActive("/account/settings")
                ? "bg-lime font-semibold text-forest"
                : "text-[#B6C7C0] hover:bg-white/5 hover:text-white",
            )}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <Link
            href="/help"
            className="flex items-center gap-3 rounded-xl px-3.5 py-2 text-sm text-[#B6C7C0] transition-colors hover:bg-white/5 hover:text-white"
          >
            <HelpCircle className="h-4 w-4" />
            Help center
          </Link>
        </div>

        <p className="px-2 text-[11px] text-[#73807B]">
          &copy; {new Date().getFullYear()} Skynet Freight
        </p>
      </div>
    </aside>
  );
}
