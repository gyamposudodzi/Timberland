"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
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
          <div className="rounded-lg border border-dashed border-border bg-muted p-3 text-sm">
            <p className="mb-2 font-medium text-muted-foreground">Dev: no email transport — open the link directly.</p>
            <Link href={state.devLink} className="break-all font-medium text-forest hover:underline">
              {state.devLink}
            </Link>
          </div>
        ) : null}
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-success hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state && !state.ok && <Alert variant="error">{state.error}</Alert>}
      <Field label="Email address" htmlFor="email" error={fe.email} required>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@company.com"
          className="h-11"
        />
      </Field>
      <Button type="submit" variant="lime" size="lg" className="w-full" disabled={pending}>
        {pending && <Spinner />} Send reset link <ArrowRight className="h-4 w-4" />
      </Button>

      <div className="pt-1">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-success hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-muted/70 p-4 text-xs">
        <p className="font-semibold text-forest">A quick note about your reset link</p>
        <p className="mt-1 leading-relaxed text-muted-foreground">
          The link expires after 60 minutes. If you don&apos;t see the email, check your spam folder before requesting another.
        </p>
      </div>

      <p className="text-xs text-muted-foreground">
        Can&apos;t access your email?{" "}
        <Link href="/help#contact" className="inline-flex items-center gap-0.5 font-semibold text-forest hover:underline">
          Contact support <ArrowUpRight className="h-3 w-3" />
        </Link>
      </p>
    </form>
  );
}
