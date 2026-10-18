import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="container-page flex justify-center py-16">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Sign in to manage your shipments and alerts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <LoginForm authError={authError} />
            <p className="text-right text-sm">
              <Link href="/forgot-password" className="text-muted-foreground hover:text-foreground hover:underline">
                Forgot password?
              </Link>
            </p>
            <p className="text-center text-sm text-muted-foreground">
              New to Timberland?{" "}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Create an account
              </Link>
            </p>
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Just tracking a parcel?{" "}
          <Link href="/track" className="text-primary hover:underline">
            Track without an account
          </Link>
        </p>
      </div>
    </div>
  );
}
