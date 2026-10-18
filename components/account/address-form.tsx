"use client";

import { useEffect, useRef, useActionState } from "react";
import { useRouter } from "next/navigation";
import { saveAddressAction } from "@/server/account.actions";
import type { ActionResult } from "@/server/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

export interface AddressValues {
  id?: string;
  label?: string | null;
  contactName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  region?: string | null;
  postalCode: string;
  country: string;
}

export function AddressForm({ address, onDone }: { address?: AddressValues; onDone?: () => void }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(saveAddressAction, null);
  const fe = state?.fieldErrors ?? {};
  const handled = useRef(false);

  useEffect(() => {
    if (state?.ok && !handled.current) {
      handled.current = true;
      router.refresh();
      onDone?.();
    }
    if (!state?.ok) handled.current = false;
  }, [state, router, onDone]);

  const isEdit = !!address?.id;

  return (
    <form action={formAction} className="space-y-4">
      {isEdit && <input type="hidden" name="id" value={address?.id} />}

      {state && !state.ok && <Alert variant="error">{state.error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Label" htmlFor="label" error={fe.label} hint="Optional — e.g. Home, Office.">
          <Input id="label" name="label" defaultValue={address?.label ?? ""} placeholder="Home" />
        </Field>
        <Field label="Contact name" htmlFor="contactName" error={fe.contactName} required>
          <Input id="contactName" name="contactName" defaultValue={address?.contactName ?? ""} required />
        </Field>
        <Field label="Phone" htmlFor="phone" error={fe.phone} required>
          <Input id="phone" name="phone" defaultValue={address?.phone ?? ""} required autoComplete="tel" />
        </Field>
        <Field label="Country" htmlFor="country" error={fe.country} required>
          <Input id="country" name="country" defaultValue={address?.country ?? "US"} required maxLength={2} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Address line 1" htmlFor="line1" error={fe.line1} required>
            <Input id="line1" name="line1" defaultValue={address?.line1 ?? ""} required />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Address line 2" htmlFor="line2" error={fe.line2}>
            <Input id="line2" name="line2" defaultValue={address?.line2 ?? ""} />
          </Field>
        </div>
        <Field label="City" htmlFor="city" error={fe.city} required>
          <Input id="city" name="city" defaultValue={address?.city ?? ""} required />
        </Field>
        <Field label="Region / state" htmlFor="region" error={fe.region}>
          <Input id="region" name="region" defaultValue={address?.region ?? ""} />
        </Field>
        <Field label="Postal code" htmlFor="postalCode" error={fe.postalCode} required>
          <Input id="postalCode" name="postalCode" defaultValue={address?.postalCode ?? ""} required />
        </Field>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending && <Spinner />} {isEdit ? "Save changes" : "Add address"}
        </Button>
        {onDone && (
          <Button type="button" variant="ghost" onClick={onDone} disabled={pending}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
