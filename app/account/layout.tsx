import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { getMyShipmentSummary } from "@/server/account.service";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const summary = await getMyShipmentSummary(session.user.id);
  const workspaceName = session.user.name?.trim() || session.user.email || "Personal Workspace";

  return (
    <div className="flex min-h-screen bg-muted/50">
      <AppSidebar
        workspaceName={workspaceName}
        activeCount={summary.active}
        isAdmin={session.user.role === "ADMIN"}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar
          userName={session.user.name ?? ""}
          userEmail={session.user.email ?? null}
          userRole={session.user.role ?? null}
          userId={session.user.id}
          signOutAction={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        />
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
