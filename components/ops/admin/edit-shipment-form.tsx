"use client";

import { useEffect, useRef, useActionState } from "react";
import { useRouter } from "next/navigation";
import { updateShipmentAdminAction } from "@/server/admin.actions";
import type { ActionResult } from "@/server/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

const PAYMENT_METHODS: { value: string; label: string }[] = [
  { value: "PAY_ON_DELIVERY", label: "Pay on delivery" },
  { value: "CASH", label: "Cash" },
  { value: "CARD_ON_DELIVERY", label: "Card on delivery" },
  { value: "INVOICE", label: "Invoice" },
];

export interface EditableShipment {
  price: number;
  currency: string;
  paymentMethod: string;
  notes: string | null;
  serviceLevelId: string;
}

export function EditShipmentForm({
  shipmentId,
  current,
  serviceLevels,
}: {
  shipmentId: string;
  current: EditableShipment;
  serviceLevels: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(updateShipmentAdminAction, null);
  const refreshed = useRef(false);

  useEffect(() => {
    if (state?.ok && !refreshed.current) {
      refreshed.current = true;
      router.refresh();
    }
    if (!state?.ok) refreshed.current = false;
  }, [state, router]);

  const err = (k: string) => state && !state.ok ? state.fieldErrors?.[k] : undefined;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="shipmentId" value={shipmentId} />
      {state && !state.ok && <Alert variant="error">{state.error}</Alert>}
      {state?.ok && <Alert variant="success">Shipment details updated.</Alert>}

      <Field label="Price" htmlFor="admin-price" required error={err("price")}>
        <Input
          id="admin-price"
          name="price"
          type="number"
          step="0.01"
          min="0"
          defaultValue={current.price}
        />
      </Field>

      <Field label="Payment method" htmlFor="admin-payment" required error={err("paymentMethod")}>
        <Select id="admin-payment" name="paymentMethod" defaultValue={current.paymentMethod}>
          {PAYMENT_METHODS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Service level" htmlFor="admin-service" hint={`${current.currency} pricing follows the selected service.`}>
        <Select id="admin-service" name="serviceLevelId" defaultValue={current.serviceLevelId}>
          {serviceLevels.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Notes" htmlFor="admin-notes">
        <Textarea id="admin-notes" name="notes" defaultValue={current.notes ?? ""} />
      </Field>

      <Button type="submit" disabled={pending}>
        {pending && <Spinner />} Save changes
      </Button>
    </form>
  );
}
