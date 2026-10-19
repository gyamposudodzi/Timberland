import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { listServiceLevels } from "@/lib/rating";
import { getSavedAddresses } from "@/server/account.service";
import { NewShipmentForm } from "@/components/shipment/new-shipment-form";

export const metadata = { title: "New shipment" };

export default async function NewShipmentPage() {
  const session = await auth();
  const [services, saved, user] = await Promise.all([
    listServiceLevels(),
    session?.user?.id ? getSavedAddresses(session.user.id) : Promise.resolve([]),
    session?.user?.id ? prisma.user.findUnique({ where: { id: session.user.id } }) : Promise.resolve(null),
  ]);

  const savedAddresses = saved.map((a) => ({
    id: a.id,
    label: a.label,
    contactName: a.contactName,
    phone: a.phone,
    line1: a.line1,
    line2: a.line2 ?? "",
    city: a.city,
    region: a.region ?? "",
    postalCode: a.postalCode,
    country: a.country,
  }));

  // Most recent saved address (or account details) seeds the sender.
  const latest = saved[0];
  const defaultSender = latest
    ? {
        contactName: latest.contactName,
        phone: latest.phone,
        line1: latest.line1,
        line2: latest.line2 ?? "",
        city: latest.city,
        region: latest.region ?? "",
        postalCode: latest.postalCode,
        country: latest.country,
      }
    : user
      ? {
          contactName: user.name ?? "",
          phone: user.phone ?? "",
          line1: "",
          line2: "",
          city: "",
          region: "",
          postalCode: "",
          country: "US",
        }
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New shipment</h1>
        <p className="text-sm text-muted-foreground">Prices are confirmed before pickup. Payment on delivery.</p>
      </div>
      <NewShipmentForm
        services={services.map((s) => ({ code: s.code, name: s.name, slaDays: s.slaDays }))}
        defaultSender={defaultSender}
        savedAddresses={savedAddresses}
      />
    </div>
  );
}
