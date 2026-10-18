import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="container-page flex justify-center py-16">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Choose a new password</CardTitle>
            <CardDescription>
              {token ? "Pick a new password for your account." : "This reset link is missing its token."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {token ? (
              <ResetPasswordForm token={token} />
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  The link may be malformed. Request a fresh reset link to continue.
                </p>
                <Link href="/forgot-password" className="block">
                  <Button variant="outline" className="w-full">
                    Request a new link
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
