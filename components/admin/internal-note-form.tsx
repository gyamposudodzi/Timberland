"use client";

import { useRef, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addTrackingEventAction, type AdvanceResult } from "@/server/admin.actions";
import type { ShipmentStatus } from "@/lib/shipment-status";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

/**
 * Appends an internal-only tracking note without changing the shipment status.
 * It reuses addTrackingEventAction with statusCode = current (a no-op transition)
 * and isPublic left unchecked.
 */
export function InternalNoteForm({
  shipmentId,
  currentStatus,
}: {
  shipmentId: string;
  currentStatus: ShipmentStatus;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<AdvanceResult | null, FormData>(
    addTrackingEventAction,
    null,
  );
  const refreshed = useRef(false);

  useEffect(() => {
    if (state?.ok && !refreshed.current) {
      refreshed.current = true;
      router.refresh();
    }
    if (!state?.ok) refreshed.current = false;
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="shipmentId" value={shipmentId} />
      <input type="hidden" name="statusCode" value={currentStatus} />

      {state && !state.ok && <Alert variant="error">{state.error}</Alert>}

      <Field label="Internal note" htmlFor="internalNote" hint="Admin-only — never shown to customers or guests.">
        <Textarea id="internalNote" name="note" required placeholder="e.g. Recipient called, redelivery tomorrow." className="min-h-16" />
      </Field>

      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending && <Spinner />} Add note
      </Button>
    </form>
  );
}
