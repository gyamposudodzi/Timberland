import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <AuthShell
      topPrompt="Already have an account?"
      topLinkLabel="Sign in"
      topLinkHref="/login"
    >
      <div className="space-y-6">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-forest">
          <KeyRound className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-forest">
            Choose a new password
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {token
              ? "Pick a new password for your Skynet Freight account."
              : "This reset link is missing its token."}
          </p>
        </div>

        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The link may be malformed. Request a fresh reset link to continue.
            </p>
            <Link href="/forgot-password" className="block">
              <Button variant="outline" className="w-full">
                Request a new link
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AuthShell>
  );
}
