"use client";

import { useEffect, useRef, useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { addTrackingEventAction, type AdvanceResult } from "@/server/ops.actions";
import { STATUS_META, type ShipmentStatus } from "@/lib/shipment-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

interface Props {
  shipmentId: string;
  currentStatus: ShipmentStatus;
  allowed: ShipmentStatus[];
}

export function AdvanceStatusForm({ shipmentId, currentStatus, allowed }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<AdvanceResult | null, FormData>(
    addTrackingEventAction,
    null,
  );
  const [status, setStatus] = useState<ShipmentStatus>(allowed[0] ?? currentStatus);
  const refreshed = useRef(false);

  // After a successful write, let the server re-render the (now-changed) queue.
  useEffect(() => {
    if (state?.ok && !refreshed.current) {
      refreshed.current = true;
      router.refresh();
    }
    if (!state?.ok) refreshed.current = false;
  }, [state, router]);

  if (allowed.length === 0) {
    return (
      <Alert variant="warning">
        This shipment is in a terminal state ({STATUS_META[currentStatus].label}) and can no longer be advanced.
      </Alert>
    );
  }

  const defaultNote = STATUS_META[status]?.description ?? "";

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="shipmentId" value={shipmentId} />

      {state && !state.ok && <Alert variant="error">{state.error}</Alert>}
      {state?.ok && (
        <Alert variant="success">Update recorded — shipment is now “{STATUS_META[state.newStatus ?? currentStatus].label}”.</Alert>
      )}

      <Field label="New status" htmlFor="statusCode" required>
        <select
          id="statusCode"
          name="statusCode"
          className="flex h-10 w-full appearance-none rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={status}
          onChange={(e) => setStatus(e.target.value as ShipmentStatus)}
        >
          {allowed.map((s) => (
            <option key={s} value={s}>
              {STATUS_META[s].label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Location" htmlFor="location" hint="Where the scan/update happened (optional).">
        <Input id="location" name="location" placeholder="e.g. Bend Hub, US" />
      </Field>

      <Field label="Note" htmlFor="note" hint={`Shown on the timeline. Default: “${defaultNote}”`}>
        <Textarea id="note" name="note" placeholder={defaultNote} />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPublic" defaultChecked className="h-4 w-4 rounded border-input" />
        Visible to guests on the public tracking page
      </label>

      <Button type="submit" disabled={pending}>
        {pending && <Spinner />} Record update
      </Button>
    </form>
  );
}
