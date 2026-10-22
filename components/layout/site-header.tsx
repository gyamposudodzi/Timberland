import Link from "next/link";
import { Bell, Package } from "lucide-react";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/layout/user-menu";

const NAV = [
  { href: "/track", label: "Track" },
  { href: "/quote", label: "Get a quote" },
  { href: "/pricing", label: "Pricing" },
];

export async function SiteHeader() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground">
            <Package className="h-5 w-5" />
          </span>
          <span className="text-lg tracking-tight">Timberland</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/account/notifications"
                aria-label="Notifications"
                className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Bell className="h-5 w-5" />
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
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Create account</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
