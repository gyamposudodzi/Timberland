"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { loginAction } from "@/server/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

export function LoginForm({ authError }: { authError?: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(authError ?? null);
  const [showPassword, setShowPassword] = useState(false);

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
      <Field label="Email address" htmlFor="email" required>
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
      <Field label="Password" htmlFor="password" required>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className="h-11 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-forest cursor-pointer"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </Field>

      <div className="flex items-center justify-between text-xs">
        <label className="inline-flex items-center gap-2 text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            defaultChecked
            className="h-4 w-4 rounded border-border accent-forest"
          />
          Keep me signed in
        </label>
        <Link
          href="/forgot-password"
          className="font-semibold text-success hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <Button type="submit" variant="lime" size="lg" className="w-full" disabled={pending}>
        {pending && <Spinner />} Sign in <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}
