"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { matchZoneCode } from "@/lib/zones";
import { addressSchema } from "@/lib/validation";
import type { ActionResult } from "@/server/auth.actions";

async function resolveZoneId(postalCode: string): Promise<string | null> {
  const zone = await prisma.serviceZone.findUnique({ where: { code: matchZoneCode(postalCode) } });
  return zone?.id ?? null;
}

function parseAddressForm(formData: FormData) {
  return {
    label: String(formData.get("label") ?? ""),
    contactName: String(formData.get("contactName") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    line1: String(formData.get("line1") ?? ""),
    line2: String(formData.get("line2") ?? ""),
    city: String(formData.get("city") ?? ""),
    region: String(formData.get("region") ?? ""),
    postalCode: String(formData.get("postalCode") ?? ""),
    country: String(formData.get("country") ?? "US"),
  };
}

/** Create or update a saved address. Presence of an `id` decides which. */
export async function saveAddressAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Please sign in to manage addresses." };
  const userId = session.user.id;
  const id = String(formData.get("id") ?? "");

  const parsed = addressSchema.safeParse(parseAddressForm(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] ??= issue.message;
    }
    return { ok: false, error: "Please fix the highlighted fields", fieldErrors };
  }

  const d = parsed.data;
  const zoneId = await resolveZoneId(d.postalCode);
  const payload = {
    label: d.label || null,
    contactName: d.contactName,
    phone: d.phone,
    line1: d.line1,
    line2: d.line2 || null,
    city: d.city,
    region: d.region || null,
    postalCode: d.postalCode,
    country: d.country,
    zoneId,
  };

  if (id) {
    // Ownership-scoped: a mismatched id updates 0 rows (treated as not found).
    const res = await prisma.address.updateMany({ where: { id, userId }, data: payload });
    if (res.count === 0) return { ok: false, error: "Address not found." };
  } else {
    await prisma.address.create({ data: { ...payload, userId } });
  }

  revalidatePath("/account/addresses");
  return { ok: true };
}

/** Delete a saved address, scoped to the caller. */
export async function deleteAddressAction(formData: FormData): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Please sign in to manage addresses." };
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing address id." };

  await prisma.address.deleteMany({ where: { id, userId: session.user.id } });
  revalidatePath("/account/addresses");
  revalidatePath("/account");
  return { ok: true };
}
