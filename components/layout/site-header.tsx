import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ParcelLogo } from "@/components/brand/parcel-logo";
import { UserMenu } from "@/components/layout/user-menu";

const NAV = [
  { href: "/pricing", label: "Shipping services" },
  { href: "/track", label: "Track a shipment" },
  { href: "/quote", label: "For business" },
  { href: "/help", label: "Help center" },
];

export async function SiteHeader() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur">
      <div className="container-page flex h-18 items-center justify-between gap-6">
        <ParcelLogo variant="light" />

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-forest"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          {user ? (
            <>
              <Link href="/account">
                <Button variant="lime" size="sm">
                  Workspace <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <UserMenu
                name={user.name ?? ""}
                email={user.email ?? null}
                role={user.role ?? null}
                userId={user.id ?? ""}
                signOutAction={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              />
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-medium text-forest">
                  Sign in
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="lime" size="sm" className="px-4">
                  Create account <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
