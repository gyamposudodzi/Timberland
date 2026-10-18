import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/crypto";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Verify email" };

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  let verified = false;
  let message = "This verification link is invalid or has expired.";

  if (token) {
    const user = await prisma.user.findFirst({ where: { verifyToken: hashToken(token) } });
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true, verifyToken: null, verifyTokenAt: null },
      });
      verified = true;
      message = "Your email is confirmed. You can now manage shipments and alerts.";
    }
  } else {
    message = "No verification token was provided.";
  }

  return (
    <div className="container-page flex justify-center py-16">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>{verified ? "Email verified" : "Verification failed"}</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {verified && (
              <Link href="/login">
                <Button className="w-full">Go to sign in</Button>
              </Link>
            )}
            {!verified && (
              <Link href="/signup">
                <Button variant="outline" className="w-full">
                  Create a new account
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
