import type { Metadata } from "next";
import { RotateCcw } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      topPrompt="Already have an account?"
      topLinkLabel="Sign in"
      topLinkHref="/login"
    >
      <div className="space-y-6">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-forest">
          <RotateCcw className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-forest">
            Forgot your password?
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            No worries. Enter the email you use for Skynet Freight and we&apos;ll send you a secure reset link.
          </p>
        </div>

        <ForgotPasswordForm />
      </div>
    </AuthShell>
  );
}
