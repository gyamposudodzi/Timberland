"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
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
  const [accountType, setAccountType] = useState<"business" | "personal">("business");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const fullName = `${firstName} ${lastName}`.trim();

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="name" value={fullName} />
      {state && !state.ok && <Alert variant="error">{state.error}</Alert>}

      {/* Business vs Personal toggle */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setAccountType("business")}
          className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
            accountType === "business"
              ? "border-success bg-sage text-forest"
              : "border-border bg-white text-muted-foreground hover:bg-muted"
          }`}
        >
          <span
            className={`grid h-4 w-4 place-items-center rounded-full border ${
              accountType === "business" ? "border-forest" : "border-muted-foreground"
            }`}
          >
            {accountType === "business" && <span className="h-2 w-2 rounded-full bg-forest" />}
          </span>
          Business
        </button>
        <button
          type="button"
          onClick={() => setAccountType("personal")}
          className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
            accountType === "personal"
              ? "border-success bg-sage text-forest"
              : "border-border bg-white text-muted-foreground hover:bg-muted"
          }`}
        >
          <span
            className={`grid h-4 w-4 place-items-center rounded-full border ${
              accountType === "personal" ? "border-forest" : "border-muted-foreground"
            }`}
          >
            {accountType === "personal" && <span className="h-2 w-2 rounded-full bg-forest" />}
          </span>
          Personal
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="First name" htmlFor="firstName" error={fe.name} required>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
            autoComplete="given-name"
            required
            className="h-11"
          />
        </Field>
        <Field label="Last name" htmlFor="lastName" required>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
            autoComplete="family-name"
            required
            className="h-11"
          />
        </Field>
      </div>

      {accountType === "business" && (
        <Field label="Business name" htmlFor="businessName">
          <Input
            id="businessName"
            name="businessName"
            placeholder="Your business name"
            className="h-11"
          />
        </Field>
      )}

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

      <Field label="Password" htmlFor="password" error={fe.password} hint="At least 8 characters." required>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            placeholder="Create a password"
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

      <label className="flex items-start gap-2.5 text-xs text-muted-foreground cursor-pointer">
        <input type="checkbox" required className="mt-0.5 h-4 w-4 rounded border-border accent-forest" />
        <span>
          I agree to the{" "}
          <Link href="/terms" className="font-medium text-forest hover:underline">
            Terms &amp; Conditions
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-medium text-forest hover:underline">
            Privacy Policy
          </Link>
          .
        </span>
      </label>

      <Button type="submit" variant="lime" size="lg" className="w-full" disabled={pending}>
        {pending && <Spinner />} Create account <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}
