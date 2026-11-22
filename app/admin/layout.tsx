import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ClipboardList, ShieldCheck, Users } from "lucide-react";
import { getAdminSession } from "@/server/admin.service";
import { auth, signOut } from "@/lib/auth";
import { ParcelLogo } from "@/components/brand/parcel-logo";
import { UserMenu } from "@/components/layout/user-menu";

const LINKS = [
  { href: "/admin", label: "Shipment queue", icon: ClipboardList },
  { href: "/admin/users", label: "Accounts", icon: Users },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const adminSession = await getAdminSession();
  if (!adminSession) {
    const current = await auth();
    redirect(current?.user ? "/account" : "/login");
  }

  return (
    <div className="flex min-h-screen bg-muted/50">
      <aside className="hidden w-64 shrink-0 flex-col justify-between bg-forest text-white lg:flex">
        <div className="p-5 space-y-6">
          <div className="px-1">
            <ParcelLogo variant="dark" href="/" />
          </div>

          <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-forest-muted/80 px-3.5 py-2.5">
            <ShieldCheck className="h-4 w-4 text-lime shrink-0" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9DAFA1]">
                Operations
              </p>
              <p className="text-sm font-medium text-white">Admin back office</p>
            </div>
          </div>

          <nav className="space-y-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-[#B6C7C0] transition-colors hover:bg-white/5 hover:text-white"
              >
                <l.icon className="h-4 w-4 shrink-0" />
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-5 border-t border-white/10">
          <Link
            href="/account"
            className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm text-[#B6C7C0] transition-colors hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Customer workspace
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white/95 px-6 backdrop-blur">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Admin</span>
            <span>/</span>
            <span className="font-medium text-forest">Back office</span>
          </div>
          <UserMenu
            name={adminSession.user?.name ?? ""}
            email={adminSession.user?.email ?? null}
            role={adminSession.user?.role ?? null}
            userId={adminSession.user?.id ?? ""}
            signOutAction={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          />
        </header>
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
