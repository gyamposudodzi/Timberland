"use client";

import { useState, useTransition } from "react";
import { loginAction } from "@/server/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

export function LoginForm({ authError }: { authError?: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(authError ?? null);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
          const res = await loginAction(formData);
          if (!res.ok) setError(res.error ?? "Unable to sign in.");
        });
      }}
    >
      {error && <Alert variant="error">{error}</Alert>}
      <Field label="Email" htmlFor="email" required>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </Field>
      <Field label="Password" htmlFor="password" required>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <Spinner />} Sign in
      </Button>
    </form>
  );
}
