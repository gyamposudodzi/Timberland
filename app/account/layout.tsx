import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, PlusCircle, MapPin, Bell } from "lucide-react";
import { auth } from "@/lib/auth";

const LINKS = [
  { href: "/account", label: "Dashboard", icon: LayoutDashboard },
  { href: "/account/new-shipment", label: "New shipment", icon: PlusCircle },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/notifications", label: "Notifications", icon: Bell },
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="container-page py-10">
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
