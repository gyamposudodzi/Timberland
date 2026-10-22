import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { getAdminSession, listUsersForAdmin } from "@/server/admin.service";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoleSelect } from "@/components/ops/admin/role-select";

export const metadata = { title: "Admin — Operations" };

const ROLE_TONE: Record<string, "neutral" | "active" | "warning"> = {
  CUSTOMER: "neutral",
  STAFF: "active",
  ADMIN: "warning",
};

export default async function AdminPage() {
  // Page-level ADMIN gate. STAFF reach /ops via the layout but not this console;
  // a non-admin is bounced back to the shipment queue.
  const session = await getAdminSession();
  if (!session) redirect("/ops");

  const users = await listUsersForAdmin();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Admin console</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Full control: manage account roles and, from any shipment, override status or edit details.
          </p>
        </div>
        <Link href="/ops">
          <Button variant="ghost" size="sm">
            Back to queue
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
          <CardDescription>{users.length} user(s). Changing a role takes effect on the user&rsquo;s next request.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-2 pr-4 font-medium">User</th>
                <th className="py-2 pr-4 font-medium">Joined</th>
                <th className="py-2 pr-4 font-medium">Shipments</th>
                <th className="py-2 pr-4 font-medium">Role</th>
                <th className="py-2 font-medium">Set role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  data-testid="user-row"
                  className="border-b border-border/60 last:border-0"
                >
                  <td className="py-3 pr-4">
                    <p className="font-medium">{u.name ?? "—"}</p>
                    <p className="text-muted-foreground">{u.email}</p>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">{formatDate(u.createdAt)}</td>
                  <td className="py-3 pr-4">{u.shipmentCount}</td>
                  <td className="py-3 pr-4">
                    <Badge tone={ROLE_TONE[u.role] ?? "neutral"}>{u.role}</Badge>
                  </td>
                  <td className="py-3">
                    <RoleSelect userId={u.id} role={u.role} isSelf={u.id === session.user.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
