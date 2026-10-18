"use client";

import { useActionState } from "react";
import { signupAction, type ActionResult } from "@/server/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

const initialState: ActionResult | null = null;

export function SignupForm() {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(signupAction, initialState);
  const fe = state?.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-4">
      {state && !state.ok && !state.fieldErrors && <Alert variant="error">{state.error}</Alert>}
      {state && !state.ok && state.fieldErrors && <Alert variant="error">{state.error}</Alert>}
      <Field label="Full name" htmlFor="name" error={fe.name} required>
        <Input id="name" name="name" autoComplete="name" required />
      </Field>
      <Field label="Email" htmlFor="email" error={fe.email} required>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </Field>
      <Field label="Phone" htmlFor="phone" error={fe.phone} hint="Optional — used for delivery contact.">
        <Input id="phone" name="phone" autoComplete="tel" />
      </Field>
      <Field label="Password" htmlFor="password" error={fe.password} hint="At least 8 characters." required>
        <Input id="password" name="password" type="password" autoComplete="new-password" required />
      </Field>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <Spinner />} Create account
      </Button>
    </form>
  );
}
