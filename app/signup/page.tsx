import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <AuthShell
      topPrompt="Already have an account?"
      topLinkLabel="Sign in"
      topLinkHref="/login"
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-forest">
            Let&apos;s get you moving.
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Create your free account. Ship when you&apos;re ready.
          </p>
        </div>

        <SignupForm />

        <p className="text-xs text-muted-foreground">
          Already shipping with us?{" "}
          <Link href="/login" className="font-semibold text-forest hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
