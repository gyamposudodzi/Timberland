"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { updateProfileAction } from "@/server/account.actions";
import type { ActionResult } from "@/server/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

interface ProfileFormProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  emailVerified: boolean;
}

export function ProfileForm({
  firstName,
  lastName,
  email,
  phone,
  emailVerified,
}: ProfileFormProps) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    updateProfileAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-5">
      {state && !state.ok && <Alert variant="error">{state.error}</Alert>}
      {state?.ok && <Alert variant="success">Your profile changes have been saved.</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name" htmlFor="firstName" error={state?.fieldErrors?.firstName} required>
          <Input id="firstName" name="firstName" defaultValue={firstName} required />
        </Field>
        <Field label="Last name" htmlFor="lastName">
          <Input id="lastName" name="lastName" defaultValue={lastName} />
        </Field>
        <Field label="Email address" htmlFor="email" hint="Sign-in email cannot be changed here.">
          <Input id="email" defaultValue={email} readOnly className="bg-muted/60 text-muted-foreground" />
        </Field>
        <Field label="Phone number" htmlFor="phone">
          <Input id="phone" name="phone" defaultValue={phone} placeholder="+1 555 0100" />
        </Field>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
        <div>
          {emailVerified && (
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
              <CheckCircle2 className="h-3.5 w-3.5" /> Email verified
            </p>
          )}
        </div>
        <Button type="submit" variant="lime" size="md" disabled={pending}>
          {pending && <Spinner />} Save changes
        </Button>
      </div>
    </form>
  );
}
