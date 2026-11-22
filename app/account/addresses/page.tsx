import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getSavedAddresses } from "@/server/account.service";
import { AddressBook } from "@/components/account/address-book";

export const metadata = { title: "Address book" };

export default async function AddressesPage() {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const saved = await getSavedAddresses(session.user.id);
  const items = saved.map((a) => ({
    id: a.id,
    label: a.label ?? "",
    contactName: a.contactName,
    phone: a.phone,
    line1: a.line1,
    line2: a.line2 ?? "",
    city: a.city,
    region: a.region ?? "",
    postalCode: a.postalCode,
    country: a.country,
    zoneName: a.zone?.name ?? null,
  }));

  return <AddressBook addresses={items} />;
}
