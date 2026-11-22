import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Shield } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";

export const metadata = { title: "Account settings" };

export default async function AccountSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true, emailVerified: true, role: true },
  });
  if (!user) notFound();

  const [firstName = "", ...restName] = (user.name ?? "").split(" ");
  const lastName = restName.join(" ");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-forest sm:text-3xl">
          Account settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your details, preferences, and peace of mind.
        </p>
      </div>

      {/* Sub-navigation tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-lg bg-forest px-4 py-2 text-xs font-semibold text-white">
          Profile &amp; business
        </span>
        <Link
          href="/forgot-password"
          className="rounded-lg border border-border bg-white px-4 py-2 text-xs font-medium text-muted-foreground hover:text-forest"
        >
          Security
        </Link>
        <Link
          href="/account/notifications"
          className="rounded-lg border border-border bg-white px-4 py-2 text-xs font-medium text-muted-foreground hover:text-forest"
        >
          Notifications
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left main column */}
        <div className="space-y-6 lg:col-span-8">
          <div className="rounded-2xl border border-border bg-white p-6 space-y-5">
            <h2 className="text-base font-bold text-forest">Personal information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" htmlFor="firstName">
                <Input id="firstName" defaultValue={firstName} readOnly />
              </Field>
              <Field label="Last name" htmlFor="lastName">
                <Input id="lastName" defaultValue={lastName} readOnly />
              </Field>
              <Field label="Email address" htmlFor="email">
                <Input id="email" defaultValue={user.email} readOnly />
              </Field>
              <Field label="Phone number" htmlFor="phone">
                <Input id="phone" defaultValue={user.phone ?? ""} placeholder="Not set" readOnly />
              </Field>
            </div>
            {user.emailVerified && (
              <p className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
                <CheckCircle2 className="h-3.5 w-3.5" /> Email verified
              </p>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6 lg:col-span-4">
          <div className="rounded-2xl border border-border bg-white p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-forest" />
              <h2 className="text-base font-bold text-forest">Keep your account secure</h2>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Update your password or request a secure reset link anytime.
            </p>
            <Link href="/forgot-password" className="block">
              <Button variant="lime" size="md" className="w-full">
                Change password <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 space-y-3">
            <h2 className="text-base font-bold text-forest">Delivery alerts</h2>
            <p className="text-xs text-muted-foreground">
              Choose which shipment milestones trigger email updates.
            </p>
            <Link
              href="/account/notifications"
              className="inline-flex items-center gap-1 text-xs font-semibold text-success hover:underline"
            >
              Manage notification preferences <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
