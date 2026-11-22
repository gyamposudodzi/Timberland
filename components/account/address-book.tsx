"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus, Search, Trash2 } from "lucide-react";
import { deleteAddressAction } from "@/server/account.actions";
import { AddressForm, type AddressValues } from "@/components/account/address-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface SavedAddress extends AddressValues {
  id: string;
  zoneName: string | null;
}

export function AddressBook({ addresses }: { addresses: SavedAddress[] }) {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "new" | "edit">("idle");
  const [editing, setEditing] = useState<SavedAddress | null>(null);
  const [query, setQuery] = useState("");
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return addresses;
    return addresses.filter(
      (a) =>
        (a.label ?? "").toLowerCase().includes(q) ||
        a.contactName.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.line1.toLowerCase().includes(q),
    );
  }, [addresses, query]);

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-forest sm:text-3xl">
            Address book
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your regular stops, ready when you are.
          </p>
        </div>
        {mode === "idle" && (
          <Button variant="lime" onClick={openNew}>
            <Plus className="h-4 w-4" /> Add address
          </Button>
        )}
      </div>

      {/* Filter & search bar */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="inline-flex items-center gap-2">
          <span className="rounded-lg bg-forest px-3.5 py-1.5 text-xs font-semibold text-white">
            All addresses <span className="ml-1 text-lime">{addresses.length}</span>
          </span>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, label, or city"
            className="h-9 pl-8 text-xs"
          />
        </div>
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

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {addresses.length === 0 ? "No saved addresses yet." : "No addresses match your search."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((a, idx) => (
            <div
              key={a.id}
              data-testid="address-card"
              className={`flex flex-col justify-between rounded-2xl border bg-white p-5 transition-colors ${
                idx === 0 ? "border-success/60" : "border-border"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <Badge tone={idx === 0 ? "success" : "neutral"}>
                    {idx === 0 ? "Default stop" : a.zoneName ?? "Saved"}
                  </Badge>
                  <button
                    type="button"
                    onClick={() => remove(a.id)}
                    disabled={pending}
                    aria-label="Delete address"
                    className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-destructive cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <h3 className="mt-3 text-base font-bold text-forest">
                  {a.label || a.contactName}
                </h3>
                <p className="text-xs text-muted-foreground">{a.contactName}</p>

                <div className="mt-3 space-y-0.5 text-xs text-forest/90">
                  <p>{a.line1}</p>
                  {a.line2 && <p>{a.line2}</p>}
                  <p>
                    {a.city}
                    {a.region ? `, ${a.region}` : ""} {a.postalCode}
                  </p>
                  <p>{a.country}</p>
                </div>
                <p className="mt-2.5 text-xs text-muted-foreground">{a.phone}</p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-border pt-3 text-xs">
                <button
                  type="button"
                  onClick={() => openEdit(a)}
                  disabled={pending}
                  className="font-semibold text-success hover:underline cursor-pointer"
                >
                  Edit address
                </button>
                <Link
                  href={`/account/new-shipment?to=${encodeURIComponent(a.id)}`}
                  className="inline-flex items-center gap-1 font-semibold text-forest hover:text-success"
                >
                  Ship here <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
