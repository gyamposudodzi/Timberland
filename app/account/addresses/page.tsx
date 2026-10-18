import { auth } from "@/lib/auth";
import { getSavedAddresses } from "@/server/account.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Addresses" };

export default async function AddressesPage() {
  const session = await auth();
  const addresses = session?.user?.id ? await getSavedAddresses(session.user.id) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Saved addresses</h1>
        <p className="text-sm text-muted-foreground">Addresses from your recent shipments. The sender is pre-filled for new bookings.</p>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">No saved addresses yet.</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <Card key={a.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">{a.label ?? a.contactName}</CardTitle>
                {a.zone && <Badge tone="neutral">{a.zone.name}</Badge>}
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{a.contactName}</p>
                <p>{a.line1}</p>
                {a.line2 && <p>{a.line2}</p>}
                <p>
                  {a.city}
                  {a.region ? `, ${a.region}` : ""} {a.postalCode}
                </p>
                <p>{a.country}</p>
                <p className="mt-1">{a.phone}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
