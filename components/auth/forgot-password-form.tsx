"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordResetAction, type ResetRequestResult } from "@/server/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<ResetRequestResult | null, FormData>(
    requestPasswordResetAction,
    null,
  );
  const fe = state?.fieldErrors ?? {};

  if (state?.ok) {
    return (
      <div className="space-y-4">
        <Alert variant="success">
          If an account matches that email, a reset link is on its way. It expires in 1 hour.
        </Alert>
        {state.devLink ? (
          <div className="rounded-md border border-dashed border-border bg-muted/40 p-3 text-sm">
            <p className="mb-2 font-medium text-muted-foreground">Dev: no email transport — open the link directly.</p>
            <Link href={state.devLink} className="break-all font-medium text-primary hover:underline">
              {state.devLink}
            </Link>
          </div>
        ) : null}
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state && !state.ok && <Alert variant="error">{state.error}</Alert>}
      <Field label="Email" htmlFor="email" error={fe.email} required>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </Field>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <Spinner />} Send reset link
      </Button>
    </form>
  );
}
