import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <div className="container-page flex justify-center py-16">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>Book shipments, save addresses and get delivery alerts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SignupForm />
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
