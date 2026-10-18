"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteAddressAction } from "@/server/account.actions";
import { AddressForm, type AddressValues } from "@/components/account/address-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface SavedAddress extends AddressValues {
  id: string;
  zoneName: string | null;
}

export function AddressBook({ addresses }: { addresses: SavedAddress[] }) {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "new" | "edit">("idle");
  const [editing, setEditing] = useState<SavedAddress | null>(null);
  const [pending, startDelete] = useTransition();

  const openNew = () => {
    setEditing(null);
    setMode("new");
  };
  const openEdit = (a: SavedAddress) => {
    setEditing(a);
    setMode("edit");
  };
  const close = () => {
    setMode("idle");
    setEditing(null);
  };

  const remove = (id: string) => {
    startDelete(async () => {
      const fd = new FormData();
      fd.set("id", id);
      await deleteAddressAction(fd);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Addresses from your recent shipments and any you save here. The sender is pre-filled for new bookings.
        </p>
        {mode === "idle" && (
          <Button onClick={openNew} size="sm">
            Add address
          </Button>
        )}
      </div>

      {mode !== "idle" && (
        <Card>
          <CardHeader>
            <CardTitle>{mode === "edit" ? "Edit address" : "New address"}</CardTitle>
          </CardHeader>
          <CardContent>
            <AddressForm key={editing?.id ?? "new"} address={editing ?? undefined} onDone={close} />
          </CardContent>
        </Card>
      )}

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">No saved addresses yet.</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <div key={a.id} data-testid="address-card">
              <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base">{a.label ?? a.contactName}</CardTitle>
                  {a.zoneName && <Badge tone="neutral">{a.zoneName}</Badge>}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">{a.contactName}</p>
                    <p>{a.line1}</p>
                    {a.line2 && <p>{a.line2}</p>}
                    <p>
                      {a.city}
                      {a.region ? `, ${a.region}` : ""} {a.postalCode}
                    </p>
                    <p>{a.country}</p>
                    <p className="mt-1">{a.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(a)} disabled={pending}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => remove(a.id)} disabled={pending}>
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
