import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardList, LogIn } from "lucide-react";
import { auth } from "@/lib/auth";
import { getOpsSession } from "@/server/ops.service";

const LINKS = [{ href: "/ops", label: "Shipment queue", icon: ClipboardList }];

export default async function OpsLayout({ children }: { children: React.ReactNode }) {
  // Role gate: signed-in customers are sent back to their dashboard; signed-out
  // users are sent to login. Operators (STAFF/ADMIN) proceed.
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!(await getOpsSession())) redirect("/account");

  return (
    <div className="container-page py-10">
      <div className="mb-6 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-md bg-accent text-accent-foreground">
          <LogIn className="h-4 w-4" />
        </span>
        <div>
          <h1 className="text-lg font-bold tracking-tight">Operations</h1>
          <p className="text-xs text-muted-foreground">Back office · advance shipments and record tracking events.</p>
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
