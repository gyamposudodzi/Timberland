"use server";

import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashPassword, randomToken, hashToken } from "@/lib/crypto";
import { env } from "@/lib/env";
import { sendBasicEmail } from "@/lib/notifications";
import { SHIPMENT_STATUSES } from "@/lib/shipment-status";
import { signupSchema, requestResetSchema, resetPasswordSchema, type SignupInput } from "@/lib/validation";

export interface ActionResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

/** Reset-request result; `devLink` is only present when SMTP is disabled (dev/CI). */
export interface ResetRequestResult extends ActionResult {
  devLink?: string;
}

const RESET_TTL_MS = 60 * 60 * 1000; // reset links are valid for 1 hour

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

/**
 * Starts a password reset. Always reports success for a well-formed email so
 * the response cannot be used to enumerate which accounts exist. When SMTP is
 * disabled (dev/CI) the raw link is returned so the flow stays testable.
 */
export async function requestPasswordResetAction(
  _prev: ResetRequestResult | null,
  formData: FormData,
): Promise<ResetRequestResult> {
  const parsed = requestResetSchema.safeParse({ email: String(formData.get("email") ?? "") });
  if (!parsed.success) {
    return { ok: false, error: "Enter a valid email address.", fieldErrors: { email: "Enter a valid email" } };
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  let devLink: string | undefined;
  if (user) {
    const token = randomToken();
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: hashToken(token), resetTokenAt: new Date() },
    });
    const link = `${env.appUrl}/reset-password?token=${token}`;
    if (env.emailEnabled) {
      await sendBasicEmail(
        user.email,
        "Reset your Timberland password",
        `<p>Use this link to reset your password. It expires in 1 hour:</p><p><a href="${link}">${link}</a></p><p>If you didn't request this, you can ignore this email.</p>`,
      );
    } else {
      // No mail transport configured — surface the link directly (dev/CI only).
      devLink = link;
    }
  }

  // Uniform response regardless of whether the account exists.
  return { ok: true, devLink };
}

/** Completes a password reset using a valid, unexpired, single-use token. */
export async function resetPasswordAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse({
    token: String(formData.get("token") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirm: String(formData.get("confirm") ?? ""),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] ??= issue.message;
    }
    return { ok: false, error: "Please fix the highlighted fields", fieldErrors };
  }

  const { token, password } = parsed.data;
  const user = await prisma.user.findFirst({
    where: { resetToken: hashToken(token), resetTokenAt: { gte: new Date(Date.now() - RESET_TTL_MS) } },
  });
  if (!user) {
    return { ok: false, error: "This reset link is invalid or has expired. Please request a new one." };
  }

  const passwordHash = await hashPassword(password);
  // Consume the token (single use) and treat the reset as proof of email control.
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenAt: null, emailVerified: true },
  });

  return { ok: true };
}
