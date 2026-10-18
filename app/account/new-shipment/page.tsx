import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { listServiceLevels } from "@/lib/rating";
import { NewShipmentForm } from "@/components/shipment/new-shipment-form";

export const metadata = { title: "New shipment" };

export default async function NewShipmentPage() {
  const session = await auth();
  const [services, latestAddress, user] = await Promise.all([
    listServiceLevels(),
    session?.user?.id
      ? prisma.address.findFirst({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" } })
      : Promise.resolve(null),
    session?.user?.id ? prisma.user.findUnique({ where: { id: session.user.id } }) : Promise.resolve(null),
  ]);

  const defaultSender = latestAddress
    ? {
        contactName: latestAddress.contactName,
        phone: latestAddress.phone,
        line1: latestAddress.line1,
        line2: latestAddress.line2 ?? "",
        city: latestAddress.city,
        region: latestAddress.region ?? "",
        postalCode: latestAddress.postalCode,
        country: latestAddress.country,
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
      />
    </div>
  );
}
