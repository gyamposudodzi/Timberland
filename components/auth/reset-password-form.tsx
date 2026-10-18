"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPasswordAction, type ActionResult } from "@/server/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(resetPasswordAction, null);
  const fe = state?.fieldErrors ?? {};

  if (state?.ok) {
    return (
      <div className="space-y-4">
        <Alert variant="success">Your password has been updated. You can sign in now.</Alert>
        <Link href="/login" className="block">
          <Button className="w-full">Go to sign in</Button>
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      {state && !state.ok && !state.fieldErrors && <Alert variant="error">{state.error}</Alert>}
      <Field label="New password" htmlFor="password" error={fe.password} hint="At least 8 characters." required>
        <Input id="password" name="password" type="password" autoComplete="new-password" required />
      </Field>
      <Field label="Confirm password" htmlFor="confirm" error={fe.confirm} required>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
      </Field>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <Spinner />} Update password
      </Button>
    </form>
  );
}
