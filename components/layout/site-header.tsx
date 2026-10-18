import Link from "next/link";
import { Package } from "lucide-react";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

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
              {user.role === "STAFF" || user.role === "ADMIN" ? (
                <Link href="/ops" className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline">
                  Ops
                </Link>
              ) : null}
              <Link href="/account" className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline">
                {user.name ?? "Account"}
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button variant="outline" size="sm" type="submit">
                  Sign out
                </Button>
              </form>
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
