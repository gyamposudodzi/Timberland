import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

const AUTH_ERRORS: Record<string, string> = {
  CredentialsSignIn: "Invalid email or password.",
  OAuthAccountNotLinked: "That email is already linked to a different sign-in method.",
  default: "Something went wrong signing you in. Please try again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const authError = sp.error ? AUTH_ERRORS[sp.error] ?? AUTH_ERRORS.default : undefined;

  return (
    <AuthShell
      topPrompt="New to Parcel?"
      topLinkLabel="Create an account"
      topLinkHref="/signup"
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-forest">Welcome back.</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Sign in to your Parcel account and keep things moving.
          </p>
        </div>

        <LoginForm authError={authError} />

        <p className="text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-forest hover:underline">
            Create one for free
          </Link>
        </p>

        <div className="rounded-xl border border-border bg-muted/70 px-4 py-3 text-xs text-muted-foreground">
          Your shipments. Your details. Safely in one place.
        </div>
      </div>
    </AuthShell>
  );
}
