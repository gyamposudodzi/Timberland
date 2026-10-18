"use client";

import { useActionState } from "react";
import { updateNotificationPrefsAction } from "@/server/notification.actions";
import type { ActionResult } from "@/server/auth.actions";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";

export interface EventOption {
  code: string;
  label: string;
}

export function NotificationPrefsForm({
  initialEnabled,
  initialEvents,
  options,
}: {
  initialEnabled: boolean;
  initialEvents: string[];
  options: EventOption[];
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    updateNotificationPrefsAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-4">
      {state?.ok && <Alert variant="success">Preferences saved.</Alert>}
      {state && !state.ok && <Alert variant="error">{state.error}</Alert>}

      <Card>
        <CardContent className="space-y-4 pt-6">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" name="enabled" defaultChecked={initialEnabled} className="h-4 w-4 rounded" />
            Email me about delivery updates
          </label>
          <div className="grid gap-2 sm:grid-cols-2">
            {options.map((o) => (
              <label key={o.code} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  name="events"
                  value={o.code}
                  defaultChecked={initialEvents.includes(o.code)}
                  className="h-4 w-4 rounded"
                />
                {o.label}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={pending}>
        {pending && <Spinner />} Save preferences
      </Button>
    </form>
  );
}
