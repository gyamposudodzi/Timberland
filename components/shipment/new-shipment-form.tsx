"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { createShipmentAction } from "@/server/shipment.actions";
import { estimateQuoteAction } from "@/server/quote.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/lib/utils";

interface AddressValue {
  contactName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}

interface SavedAddressValue extends AddressValue {
  id: string;
  label: string | null;
}

interface ParcelValue {
  description: string;
  weightKg: string;
  pieces: string;
  declaredValue: string;
}

const EMPTY_ADDRESS: AddressValue = {
  contactName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  region: "",
  postalCode: "",
  country: "US",
};

const EMPTY_PARCEL: ParcelValue = { description: "", weightKg: "1", pieces: "1", declaredValue: "" };

function AddressFields({
  idPrefix,
  value,
  onChange,
  addresses,
}: {
  idPrefix: string;
  value: AddressValue;
  onChange: (v: AddressValue) => void;
  addresses: SavedAddressValue[];
}) {
  const [pick, setPick] = useState("");
  const set = (k: keyof AddressValue) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [k]: e.target.value });

  function applyPick(e: React.ChangeEvent<HTMLSelectElement>) {
    const a = addresses.find((x) => x.id === e.target.value);
    setPick("");
    if (!a) return;
    onChange({
      contactName: a.contactName,
      phone: a.phone,
      line1: a.line1,
      line2: a.line2,
      city: a.city,
      region: a.region,
      postalCode: a.postalCode,
      country: a.country,
    });
  }

  return (
    <div>
      {addresses.length > 0 && (
        <Field label="Copy from saved" htmlFor={`${idPrefix}-saved`} className="mb-4">
          <Select id={`${idPrefix}-saved`} value={pick} onChange={applyPick}>
            <option value="">Select a saved address…</option>
            {addresses.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label ? `${a.label} — ` : ""}
                {a.contactName}, {a.city}
              </option>
            ))}
          </Select>
        </Field>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Contact name" htmlFor={`${idPrefix}-contactName`} required>
        <Input id={`${idPrefix}-contactName`} value={value.contactName} onChange={set("contactName")} />
      </Field>
      <Field label="Phone" htmlFor={`${idPrefix}-phone`} required>
        <Input id={`${idPrefix}-phone`} value={value.phone} onChange={set("phone")} placeholder="+1 555 0100" />
      </Field>
      <Field label="Address line 1" htmlFor={`${idPrefix}-line1`} className="sm:col-span-2" required>
        <Input id={`${idPrefix}-line1`} value={value.line1} onChange={set("line1")} />
      </Field>
      <Field label="Address line 2" htmlFor={`${idPrefix}-line2`} className="sm:col-span-2">
        <Input id={`${idPrefix}-line2`} value={value.line2} onChange={set("line2")} />
      </Field>
      <Field label="City" htmlFor={`${idPrefix}-city`} required>
        <Input id={`${idPrefix}-city`} value={value.city} onChange={set("city")} />
      </Field>
      <Field label="Region / State" htmlFor={`${idPrefix}-region`}>
        <Input id={`${idPrefix}-region`} value={value.region} onChange={set("region")} />
      </Field>
      <Field label="Postal code" htmlFor={`${idPrefix}-postalCode`} required>
        <Input id={`${idPrefix}-postalCode`} value={value.postalCode} onChange={set("postalCode")} />
      </Field>
      <Field label="Country" htmlFor={`${idPrefix}-country`} required>
        <Input id={`${idPrefix}-country`} value={value.country} onChange={set("country")} maxLength={2} />
      </Field>
      </div>
    </div>
  );
}

export function NewShipmentForm({
  services,
  defaultSender,
  savedAddresses,
}: {
  services: { code: string; name: string; slaDays: number }[];
  defaultSender: AddressValue | null;
  savedAddresses: SavedAddressValue[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<{ total: number; currency: string } | null>(null);

  const [service, setService] = useState(services[0]?.code ?? "STANDARD");
  const [pickupDate, setPickupDate] = useState("");
  const [notes, setNotes] = useState("");
  const [sender, setSender] = useState<AddressValue>(defaultSender ?? EMPTY_ADDRESS);
  const [recipient, setRecipient] = useState<AddressValue>(EMPTY_ADDRESS);
  const [parcels, setParcels] = useState<ParcelValue[]>([{ ...EMPTY_PARCEL }]);

  const totals = useMemo(() => {
    const weightKg = parcels.reduce((s, p) => s + (Number(p.weightKg) || 0), 0);
    const pieces = parcels.reduce((s, p) => s + (Number(p.pieces) || 0), 0);
    return { weightKg, pieces };
  }, [parcels]);

  function setParcel(i: number, patch: Partial<ParcelValue>) {
    setParcels((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }

  function recalcEstimate() {
    setError(null);
    startTransition(async () => {
      const res = await estimateQuoteAction({
        serviceLevelCode: service,
        originPostalCode: sender.postalCode,
        destinationPostalCode: recipient.postalCode,
        weightKg: String(totals.weightKg || 0),
        pieces: String(totals.pieces || 1),
      });
      if (res.ok) setEstimate({ total: res.quote.total, currency: res.quote.currency });
      else {
        setEstimate(null);
        setError(res.error);
      }
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEstimate(null);
    const formData = new FormData();
    formData.set("serviceLevelCode", service);
    formData.set("pickupDate", pickupDate);
    formData.set("notes", notes);
    formData.set("senderJson", JSON.stringify(sender));
    formData.set("recipientJson", JSON.stringify(recipient));
    formData.set(
      "parcelsJson",
      JSON.stringify(
        parcels.map((p) => ({
          description: p.description,
          weightKg: p.weightKg,
          pieces: p.pieces,
          declaredValue: p.declaredValue === "" ? undefined : p.declaredValue,
        })),
      ),
    );

    startTransition(async () => {
      const res = await createShipmentAction(null, formData);
      if (res.ok && res.shipmentId) router.push(`/account/shipments/${res.shipmentId}`);
      else setError(res.error ?? "Could not create the shipment.");
    });
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      {error && <Alert variant="error">{error}</Alert>}

      <section className="grid gap-4 sm:grid-cols-3">
        <Field label="Service" htmlFor="service" required>
          <Select id="service" value={service} onChange={(e) => setService(e.target.value)}>
            {services.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name} ({s.slaDays === 0 ? "same day" : `${s.slaDays}d`})
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Pickup date" htmlFor="pickupDate">
          <Input id="pickupDate" type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
        </Field>
        <div className="flex items-end">
          <Button type="button" variant="outline" onClick={recalcEstimate} disabled={pending}>
            {pending && <Spinner />} Estimate
          </Button>
        </div>
      </section>

      <section className="rounded-lg border border-border p-5">
        <h2 className="mb-4 text-lg font-semibold">From (sender)</h2>
        <AddressFields idPrefix="sender" value={sender} onChange={setSender} addresses={savedAddresses} />
      </section>

      <section className="rounded-lg border border-border p-5">
        <h2 className="mb-4 text-lg font-semibold">To (recipient)</h2>
        <AddressFields idPrefix="recipient" value={recipient} onChange={setRecipient} addresses={savedAddresses} />
      </section>

      <section className="rounded-lg border border-border p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Parcels</h2>
          <Button type="button" variant="secondary" size="sm" onClick={() => setParcels((p) => [...p, { ...EMPTY_PARCEL }])}>
            <Plus className="h-4 w-4" /> Add parcel
          </Button>
        </div>
        <div className="space-y-4">
          {parcels.map((p, i) => (
            <div key={i} className="grid gap-4 rounded-md bg-muted/40 p-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Contents" htmlFor={`p-${i}-desc`} required className="sm:col-span-2 lg:col-span-1">
                <Input id={`p-${i}-desc`} value={p.description} onChange={(e) => setParcel(i, { description: e.target.value })} />
              </Field>
              <Field label="Weight (kg)" htmlFor={`p-${i}-w`} required>
                <Input id={`p-${i}-w`} type="number" step="0.01" min="0.01" value={p.weightKg} onChange={(e) => setParcel(i, { weightKg: e.target.value })} />
              </Field>
              <Field label="Pieces" htmlFor={`p-${i}-pc`} required>
                <Input id={`p-${i}-pc`} type="number" min="1" max="50" value={p.pieces} onChange={(e) => setParcel(i, { pieces: e.target.value })} />
              </Field>
              <Field label="Declared value" htmlFor={`p-${i}-dv`}>
                <div className="flex items-end gap-2">
                  <Input id={`p-${i}-dv`} type="number" min="0" step="0.01" value={p.declaredValue} onChange={(e) => setParcel(i, { declaredValue: e.target.value })} placeholder="Optional" />
                  {parcels.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" aria-label="Remove parcel" onClick={() => setParcels((prev) => prev.filter((_, idx) => idx !== i))}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </Field>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Totals: {totals.pieces} piece(s), {totals.weightKg.toFixed(2)} kg.
          {estimate && (
            <>
              {" "}Estimated price:{" "}
              <span className="font-semibold text-primary">{formatCurrency(estimate.total, estimate.currency)}</span>
            </>
          )}
        </p>
      </section>

      <Field label="Notes" htmlFor="notes" hint="Delivery instructions, access codes, etc.">
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending && <Spinner />} Create shipment
        </Button>
        <Button type="button" size="lg" variant="ghost" onClick={() => router.push("/account")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
