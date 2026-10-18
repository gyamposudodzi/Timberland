import { auth } from "@/lib/auth";
import { getSavedAddresses } from "@/server/account.service";
import { AddressBook, type SavedAddress } from "@/components/account/address-book";

export const metadata = { title: "Addresses" };

export default async function AddressesPage() {
  const session = await auth();
  const rows = session?.user?.id ? await getSavedAddresses(session.user.id) : [];

  const addresses: SavedAddress[] = rows.map((a) => ({
    id: a.id,
    label: a.label,
    contactName: a.contactName,
    phone: a.phone,
    line1: a.line1,
    line2: a.line2,
    city: a.city,
    region: a.region,
    postalCode: a.postalCode,
    country: a.country,
    zoneName: a.zone?.name ?? null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Saved addresses</h1>
      </div>
      <AddressBook addresses={addresses} />
    </div>
  );
}
