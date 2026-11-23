"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Package, Plus, Trash2, Truck } from "lucide-react";
import { createShipmentAction } from "@/server/shipment.actions";
import { estimateQuoteAction } from "@/server/quote.actions";
import { saveAddressAction } from "@/server/account.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency, cn } from "@/lib/utils";

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

export interface SavedAddressValue extends AddressValue {
  id: string;
  label: string | null;
}

interface ParcelValue {
  description: string;
  weightKg: string;
  lengthCm: string;
  widthCm: string;
  heightCm: string;
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

const EMPTY_PARCEL: ParcelValue = {
  description: "General parcel",
  weightKg: "1",
  lengthCm: "40",
  widthCm: "30",
  heightCm: "25",
  pieces: "1",
  declaredValue: "",
};

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
    <div className="space-y-4">
      {addresses.length > 0 && (
        <Field label="Choose saved address" htmlFor={`${idPrefix}-saved`}>
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
        <Field label="Full name" htmlFor={`${idPrefix}-contactName`} required>
          <Input id={`${idPrefix}-contactName`} value={value.contactName} onChange={set("contactName")} placeholder="Alex Morgan" />
        </Field>
        <Field label="Phone" htmlFor={`${idPrefix}-phone`} required>
          <Input id={`${idPrefix}-phone`} value={value.phone} onChange={set("phone")} placeholder="+1 555 0100" />
        </Field>
        <Field label="Street address" htmlFor={`${idPrefix}-line1`} className="sm:col-span-2" required>
          <Input id={`${idPrefix}-line1`} value={value.line1} onChange={set("line1")} placeholder="240 W Lake Street" />
        </Field>
        <Field label="Address line 2" htmlFor={`${idPrefix}-line2`} className="sm:col-span-2">
          <Input id={`${idPrefix}-line2`} value={value.line2} onChange={set("line2")} placeholder="Suite, floor, or unit (optional)" />
        </Field>
        <div className="grid grid-cols-2 gap-3 sm:col-span-2 sm:grid-cols-4">
          <Field label="City" htmlFor={`${idPrefix}-city`} className="col-span-2 sm:col-span-1" required>
            <Input id={`${idPrefix}-city`} value={value.city} onChange={set("city")} placeholder="Chicago" />
          </Field>
          <Field label="State / Region" htmlFor={`${idPrefix}-region`}>
            <Input id={`${idPrefix}-region`} value={value.region} onChange={set("region")} placeholder="IL" />
          </Field>
          <Field label="ZIP code" htmlFor={`${idPrefix}-postalCode`} required>
            <Input id={`${idPrefix}-postalCode`} value={value.postalCode} onChange={set("postalCode")} placeholder="60606" />
          </Field>
          <Field label="Country" htmlFor={`${idPrefix}-country`} required>
            <Input id={`${idPrefix}-country`} value={value.country} onChange={set("country")} maxLength={2} />
          </Field>
        </div>
      </div>
    </div>
  );
}

export function NewShipmentForm({
  services,
  defaultSender,
  defaultRecipient,
  savedAddresses,
}: {
  services: { code: string; name: string; slaDays: number }[];
  defaultSender: AddressValue | null;
  defaultRecipient?: AddressValue | null;
  savedAddresses: SavedAddressValue[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [cargoType, setCargoType] = useState<"parcel" | "freight">("parcel");
  const [error, setError] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<{ total: number; currency: string } | null>(null);

  const [service, setService] = useState(services[0]?.code ?? "STANDARD");
  const [pickupDate, setPickupDate] = useState("");
  const [notes, setNotes] = useState("");
  const [sender, setSender] = useState<AddressValue>(defaultSender ?? EMPTY_ADDRESS);
  const [recipient, setRecipient] = useState<AddressValue>(defaultRecipient ?? EMPTY_ADDRESS);
  const [saveRecipient, setSaveRecipient] = useState(false);
  const [recipientLabel, setRecipientLabel] = useState("");
  const [parcels, setParcels] = useState<ParcelValue[]>([{ ...EMPTY_PARCEL }]);

  const totals = useMemo(() => {
    const weightKg = parcels.reduce((s, p) => s + (Number(p.weightKg) || 0), 0);
    const pieces = parcels.reduce((s, p) => s + (Number(p.pieces) || 0), 0);
    return { weightKg, pieces };
  }, [parcels]);

  function setParcel(i: number, patch: Partial<ParcelValue>) {
    setParcels((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }

  function validateStep1(): string | null {
    if (!sender.contactName.trim() || !sender.phone.trim() || !sender.line1.trim() || !sender.city.trim() || !sender.postalCode.trim()) {
      return "Please complete all required sender address fields.";
    }
    if (!recipient.contactName.trim() || !recipient.phone.trim() || !recipient.line1.trim() || !recipient.city.trim() || !recipient.postalCode.trim()) {
      return "Please complete all required recipient address fields.";
    }
    if (parcels.some((p) => !(Number(p.weightKg) > 0) || !(Number(p.pieces) >= 1) || !p.description.trim())) {
      return "Each package needs a description, positive weight, and at least 1 piece.";
    }
    return null;
  }

  function fetchEstimate(selectedService: string) {
    startTransition(async () => {
      const res = await estimateQuoteAction({
        serviceLevelCode: selectedService,
        originPostalCode: sender.postalCode,
        destinationPostalCode: recipient.postalCode,
        weightKg: String(totals.weightKg || 1),
        pieces: String(totals.pieces || 1),
      });
      if (res.ok) setEstimate({ total: res.quote.total, currency: res.quote.currency });
    });
  }

  function goToStep2() {
    const msg = validateStep1();
    if (msg) {
      setError(msg);
      return;
    }
    setError(null);
    setStep(2);
    fetchEstimate(service);
  }

  function submit() {
    setError(null);
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
      if (!res.ok || !res.shipmentId) {
        setError(res.error ?? "Could not create the shipment.");
        return;
      }
      if (saveRecipient) {
        const fd = new FormData();
        fd.set("label", recipientLabel);
        fd.set("contactName", recipient.contactName);
        fd.set("phone", recipient.phone);
        fd.set("line1", recipient.line1);
        fd.set("line2", recipient.line2);
        fd.set("city", recipient.city);
        fd.set("region", recipient.region);
        fd.set("postalCode", recipient.postalCode);
        fd.set("country", recipient.country);
        await saveAddressAction(null, fd).catch(() => undefined);
      }
      router.push(`/account/shipments/${res.shipmentId}`);
    });
  }

  const activeService = services.find((s) => s.code === service);
  const firstParcel = parcels[0];

  return (
    <div className="space-y-6">
      {/* 3-step indicator */}
      <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-border bg-white px-6 py-4">
        {[
          { num: 1 as const, label: "Shipment details" },
          { num: 2 as const, label: "Service & pickup" },
          { num: 3 as const, label: "Review & pay" },
        ].map((s) => {
          const isCurrent = step === s.num;
          const isDone = step > s.num;
          return (
            <button
              key={s.num}
              type="button"
              onClick={() => {
                if (s.num < step) setStep(s.num);
              }}
              className={cn(
                "flex items-center gap-2.5 text-sm transition-colors",
                isCurrent ? "font-semibold text-forest" : isDone ? "font-medium text-success cursor-pointer" : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "grid h-6 w-6 place-items-center rounded-full text-xs font-bold",
                  isCurrent
                    ? "bg-lime text-forest"
                    : isDone
                      ? "bg-sage text-success"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : s.num}
              </span>
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left main form column */}
        <div className="space-y-6 lg:col-span-8">
          {step === 1 && (
            <>
              {/* Cargo type */}
              <div className="rounded-2xl border border-border bg-white p-6">
                <h2 className="text-base font-bold text-forest">What are you shipping?</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setCargoType("parcel")}
                    className={cn(
                      "rounded-xl border p-4 text-left transition-colors cursor-pointer",
                      cargoType === "parcel" ? "border-success bg-sage/60" : "border-border hover:bg-muted/50",
                    )}
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-forest">
                      <Package className="h-4 w-4" /> Parcel
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Boxes, envelopes &amp; small packages
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCargoType("freight")}
                    className={cn(
                      "rounded-xl border p-4 text-left transition-colors cursor-pointer",
                      cargoType === "freight" ? "border-success bg-sage/60" : "border-border hover:bg-muted/50",
                    )}
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold text-forest">
                      <Truck className="h-4 w-4" /> Freight
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Pallets, large cargo &amp; full loads
                    </p>
                  </button>
                </div>
              </div>

              {/* Ship from */}
              <div className="rounded-2xl border border-border bg-white p-6">
                <div className="mb-4">
                  <h2 className="text-base font-bold text-forest">Ship from</h2>
                  <p className="text-xs text-muted-foreground">Sender details</p>
                </div>
                <AddressFields idPrefix="sender" value={sender} onChange={setSender} addresses={savedAddresses} />
              </div>

              {/* Ship to */}
              <div className="rounded-2xl border border-border bg-white p-6">
                <div className="mb-4">
                  <h2 className="text-base font-bold text-forest">Ship to</h2>
                  <p className="text-xs text-muted-foreground">Recipient details</p>
                </div>
                <AddressFields idPrefix="recipient" value={recipient} onChange={setRecipient} addresses={savedAddresses} />
                <div className="mt-4 border-t border-border pt-4">
                  <label htmlFor="saveRecipient" className="inline-flex items-center gap-2 text-xs font-medium text-forest cursor-pointer">
                    <input
                      id="saveRecipient"
                      type="checkbox"
                      checked={saveRecipient}
                      onChange={(e) => setSaveRecipient(e.target.checked)}
                      className="h-4 w-4 rounded border-border accent-forest"
                    />
                    Save recipient to address book
                  </label>
                  {saveRecipient && (
                    <div className="mt-3 max-w-xs">
                      <Field label="Address label" htmlFor="recipientLabel">
                        <Input
                          id="recipientLabel"
                          value={recipientLabel}
                          onChange={(e) => setRecipientLabel(e.target.value)}
                          placeholder="e.g. Northside Goods"
                        />
                      </Field>
                    </div>
                  )}
                </div>
              </div>

              {/* Package details */}
              <div className="rounded-2xl border border-border bg-white p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-forest">Package details</h2>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setParcels((p) => [...p, { ...EMPTY_PARCEL }])}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add package
                  </Button>
                </div>

                {parcels.map((p, i) => (
                  <div key={i} className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-forest">Package {i + 1}</span>
                      {parcels.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setParcels((prev) => prev.filter((_, idx) => idx !== i))}
                          className="text-xs text-destructive hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      )}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Contents description" htmlFor={`p-${i}-desc`} className="sm:col-span-2" required>
                        <Input
                          id={`p-${i}-desc`}
                          value={p.description}
                          onChange={(e) => setParcel(i, { description: e.target.value })}
                          placeholder="Apparel, electronics, samples…"
                        />
                      </Field>
                      <Field label="Weight (kg)" htmlFor={`p-${i}-weight`} required>
                        <Input
                          id={`p-${i}-weight`}
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={p.weightKg}
                          onChange={(e) => setParcel(i, { weightKg: e.target.value })}
                        />
                      </Field>
                      <Field label="Pieces" htmlFor={`p-${i}-pieces`} required>
                        <Input
                          id={`p-${i}-pieces`}
                          type="number"
                          min="1"
                          value={p.pieces}
                          onChange={(e) => setParcel(i, { pieces: e.target.value })}
                        />
                      </Field>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Field label="Length (cm)" htmlFor={`p-${i}-len`}>
                        <Input
                          id={`p-${i}-len`}
                          type="number"
                          value={p.lengthCm}
                          onChange={(e) => setParcel(i, { lengthCm: e.target.value })}
                        />
                      </Field>
                      <Field label="Width (cm)" htmlFor={`p-${i}-wid`}>
                        <Input
                          id={`p-${i}-wid`}
                          type="number"
                          value={p.widthCm}
                          onChange={(e) => setParcel(i, { widthCm: e.target.value })}
                        />
                      </Field>
                      <Field label="Height (cm)" htmlFor={`p-${i}-hgt`}>
                        <Input
                          id={`p-${i}-hgt`}
                          type="number"
                          value={p.heightCm}
                          onChange={(e) => setParcel(i, { heightCm: e.target.value })}
                        />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <Link
                  href="/help#contact"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-forest"
                >
                  Need a hand? Contact shipping support <ArrowUpRight className="h-3 w-3" />
                </Link>
                <Button type="button" variant="lime" size="lg" onClick={goToStep2}>
                  Continue to service <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="rounded-2xl border border-border bg-white p-6 space-y-6">
              <div>
                <h2 className="text-base font-bold text-forest">Service &amp; pickup</h2>
                <p className="text-xs text-muted-foreground">Choose your delivery speed and optional pickup window.</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {services.map((s) => {
                  const active = service === s.code;
                  return (
                    <button
                      key={s.code}
                      type="button"
                      onClick={() => {
                        setService(s.code);
                        fetchEstimate(s.code);
                      }}
                      className={cn(
                        "rounded-xl border p-4 text-left transition-colors cursor-pointer",
                        active ? "border-success bg-sage/60" : "border-border hover:bg-muted/50",
                      )}
                    >
                      <p className="text-sm font-semibold text-forest">{s.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {s.slaDays === 0 ? "Same-day delivery" : `${s.slaDays} business day${s.slaDays > 1 ? "s" : ""}`}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Preferred pickup date" htmlFor="pickupDate" hint="Optional — leave blank for next available slot.">
                  <Input
                    id="pickupDate"
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                  />
                </Field>
                <Field label="Delivery instructions" htmlFor="notes">
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Gate code, loading dock, or leave-at-door instructions"
                    className="min-h-10"
                  />
                </Field>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button type="button" variant="lime" size="lg" onClick={() => setStep(3)}>
                  Review &amp; pay <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="rounded-2xl border border-border bg-white p-6 space-y-6">
              <div>
                <h2 className="text-base font-bold text-forest">Review &amp; confirm</h2>
                <p className="text-xs text-muted-foreground">
                  Confirm your shipment details. Payment is collected on delivery by default.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-muted/40 p-4 text-xs space-y-1">
                  <p className="font-semibold uppercase tracking-wider text-muted-foreground">From</p>
                  <p className="font-semibold text-forest">{sender.contactName}</p>
                  <p className="text-muted-foreground">{sender.line1}</p>
                  <p className="text-muted-foreground">
                    {sender.city}{sender.region ? `, ${sender.region}` : ""} {sender.postalCode} · {sender.country}
                  </p>
                  <p className="text-muted-foreground">{sender.phone}</p>
                </div>

                <div className="rounded-xl border border-border bg-muted/40 p-4 text-xs space-y-1">
                  <p className="font-semibold uppercase tracking-wider text-muted-foreground">To</p>
                  <p className="font-semibold text-forest">{recipient.contactName}</p>
                  <p className="text-muted-foreground">{recipient.line1}</p>
                  <p className="text-muted-foreground">
                    {recipient.city}{recipient.region ? `, ${recipient.region}` : ""} {recipient.postalCode} · {recipient.country}
                  </p>
                  <p className="text-muted-foreground">{recipient.phone}</p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-sage/40 p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-forest">
                    {activeService?.name ?? service} · {totals.pieces} {totals.pieces === 1 ? "piece" : "pieces"} · {totals.weightKg.toFixed(1)} kg
                  </p>
                  <p className="text-xs text-muted-foreground">Payment on delivery</p>
                </div>
                <p className="text-xl font-bold text-forest tabular-nums">
                  {estimate ? formatCurrency(estimate.total, estimate.currency) : "Calculated at booking"}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <Button type="button" variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button type="button" variant="lime" size="lg" onClick={submit} disabled={pending}>
                  {pending && <Spinner />} Confirm &amp; book shipment <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Sticky right summary card */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 rounded-2xl border border-border bg-white p-6 space-y-5">
            <h3 className="text-base font-bold text-forest">Your shipment</h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold uppercase tracking-wider text-muted-foreground">From</span>
                <span className="font-medium text-forest">
                  {sender.city ? `${sender.city}${sender.region ? `, ${sender.region}` : ""} ${sender.postalCode}` : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold uppercase tracking-wider text-muted-foreground">To</span>
                <span className="font-medium text-forest">
                  {recipient.city ? `${recipient.city}${recipient.region ? `, ${recipient.region}` : ""} ${recipient.postalCode}` : "—"}
                </span>
              </div>
            </div>

            <dl className="space-y-2.5 border-t border-border pt-4 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Type</dt>
                <dd className="font-semibold text-forest capitalize">{cargoType}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Packages</dt>
                <dd className="font-semibold text-forest">{totals.pieces} {totals.pieces === 1 ? "parcel" : "parcels"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total weight</dt>
                <dd className="font-semibold text-forest">{totals.weightKg.toFixed(1)} kg</dd>
              </div>
              {firstParcel && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Dimensions</dt>
                  <dd className="font-semibold text-forest">
                    {firstParcel.lengthCm || "—"} &times; {firstParcel.widthCm || "—"} &times; {firstParcel.heightCm || "—"} cm
                  </dd>
                </div>
              )}
              {estimate && (
                <div className="flex justify-between border-t border-border pt-2.5 text-sm">
                  <dt className="font-semibold text-forest">Estimated total</dt>
                  <dd className="font-bold text-forest tabular-nums">
                    {formatCurrency(estimate.total, estimate.currency)}
                  </dd>
                </div>
              )}
            </dl>

            <div className="rounded-xl border border-border bg-muted/70 p-4 text-xs">
              <p className="font-semibold text-forest">Find the right delivery option</p>
              <p className="mt-1 leading-relaxed text-muted-foreground">
                Available services, pickup times, and a full price breakdown appear in Step 2.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
