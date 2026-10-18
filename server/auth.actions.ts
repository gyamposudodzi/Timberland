"use server";

import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashPassword, randomToken, hashToken } from "@/lib/crypto";
import { env } from "@/lib/env";
import { sendBasicEmail } from "@/lib/notifications";
import { SHIPMENT_STATUSES } from "@/lib/shipment-status";
import { signupSchema, type SignupInput } from "@/lib/validation";

export interface ActionResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

function formDataToSignup(formData: FormData): SignupInput {
  return {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    password: String(formData.get("password") ?? ""),
  };
}

export async function signupAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(formDataToSignup(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] ??= issue.message;
    }
    return { ok: false, error: "Please fix the highlighted fields", fieldErrors };
  }

  const { name, email, phone, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "An account with that email already exists.", fieldErrors: { email: "Already registered" } };
  }

  const passwordHash = await hashPassword(password);

  // When SMTP is not configured (dev), auto-verify so the flow is testable end
  // to end. In production the user must confirm via the emailed link.
  const autoVerify = !env.emailEnabled;
  const verifyToken = randomToken();

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone: phone || null,
      passwordHash,
      role: "CUSTOMER",
      emailVerified: autoVerify,
      verifyToken: hashToken(verifyToken),
      verifyTokenAt: new Date(),
      notificationPrefs: {
        create: { channel: "EMAIL", events: [...SHIPMENT_STATUSES], enabled: true },
      },
    },
  });

  if (!autoVerify) {
    const link = `${env.appUrl}/verify?token=${verifyToken}`;
    await sendBasicEmail(
      user.email,
      "Confirm your Timberland account",
      `<p>Welcome, ${name || "there"}!</p><p>Please confirm your email: <a href="${link}">${link}</a></p>`,
    );
  }

  // Sign the user in immediately; signIn handles the redirect.
  await signIn("credentials", { email, password, redirectTo: "/account" });
  return { ok: true };
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");
  try {
    await signIn("credentials", { email, password, redirectTo: "/account" });
    return { ok: true };
  } catch (err) {
    // The success path throws a Next redirect — let it bubble up untouched.
    if (err instanceof Error && "digest" in err && String((err as { digest?: string }).digest).startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    return { ok: false, error: "Invalid email or password." };
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
