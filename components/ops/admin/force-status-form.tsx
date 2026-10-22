"use client";

import { useEffect, useRef, useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { forceShipmentStatusAction } from "@/server/admin.actions";
import { SHIPMENT_STATUSES, STATUS_META, type ShipmentStatus } from "@/lib/shipment-status";
import type { ActionResult } from "@/server/auth.actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

export function ForceStatusForm({ shipmentId, currentStatus }: { shipmentId: string; currentStatus: ShipmentStatus }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(forceShipmentStatusAction, null);
  const [status, setStatus] = useState<ShipmentStatus>(currentStatus);
  const refreshed = useRef(false);

  useEffect(() => {
    if (state?.ok && !refreshed.current) {
      refreshed.current = true;
      router.refresh();
    }
    if (!state?.ok) refreshed.current = false;
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="shipmentId" value={shipmentId} />
      {state && !state.ok && <Alert variant="error">{state.error}</Alert>}
      {state?.ok && (
        <Alert variant="success">Status overridden — shipment is now “{STATUS_META[status].label}”.</Alert>
      )}

      <Field label="Force status" htmlFor="admin-status" required hint="Bypasses the normal state machine (admin only).">
        <select
          id="admin-status"
          name="statusCode"
          className="flex h-10 w-full appearance-none rounded-md border border-input bg-card px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={status}
          onChange={(e) => setStatus(e.target.value as ShipmentStatus)}
        >
          {SHIPMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_META[s].label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Note" htmlFor="admin-note" hint="Recorded on the tracking timeline.">
        <Textarea id="admin-note" name="note" placeholder="Reason for the override…" />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPublic" className="h-4 w-4 rounded border-input" />
        Show this override to guests
      </label>

      <Button type="submit" variant="destructive" disabled={pending}>
        {pending && <Spinner />} Override status
      </Button>
    </form>
  );
}
