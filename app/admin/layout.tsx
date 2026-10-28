import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardList, LogIn, Users } from "lucide-react";
import { getAdminSession } from "@/server/admin.service";
import { auth } from "@/lib/auth";

const LINKS = [
  { href: "/admin", label: "Shipment queue", icon: ClipboardList },
  { href: "/admin/users", label: "Accounts", icon: Users },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // ADMIN-only gate: signed-out users go to login; non-admins go to their dashboard.
  if (!(await getAdminSession())) {
    const current = await auth();
    redirect(current?.user ? "/account" : "/login");
  }

  return (
    <div className="container-page py-10">
      <div className="mb-6 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-md bg-accent text-accent-foreground">
          <LogIn className="h-4 w-4" />
        </span>
        <div>
          <h1 className="text-lg font-bold tracking-tight">Admin</h1>
          <p className="text-xs text-muted-foreground">Back office · full control over shipments and accounts.</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <aside>
          <nav className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <l.icon className="h-4 w-4" />
                {l.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
