import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { STATUS_META, type ShipmentStatus } from "@/lib/shipment-status";
import { NotificationPrefsForm } from "@/components/account/notification-prefs-form";

export const metadata = { title: "Notifications" };

const OPTION_CODES: ShipmentStatus[] = [
  "CONFIRMED",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "EXCEPTION",
  "RETURNED",
];

export default async function NotificationsPage() {
  const session = await auth();
  const pref = session?.user?.id
    ? await prisma.notificationPreference.findFirst({ where: { userId: session.user.id, channel: "EMAIL" } })
    : null;

  const options = OPTION_CODES.map((code) => ({ code, label: STATUS_META[code].label }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-sm text-muted-foreground">Choose which delivery updates we email you.</p>
      </div>
      <NotificationPrefsForm
        initialEnabled={pref?.enabled ?? true}
        initialEvents={pref?.events ?? OPTION_CODES}
        options={options}
      />
    </div>
  );
}
