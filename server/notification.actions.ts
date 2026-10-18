"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notificationPrefsSchema } from "@/lib/validation";
import type { ActionResult } from "@/server/auth.actions";

export async function updateNotificationPrefsAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };

  const parsed = notificationPrefsSchema.safeParse({
    enabled: formData.get("enabled") === "on",
    events: formData.getAll("events").map(String),
  });
  if (!parsed.success) return { ok: false, error: "Invalid preferences." };

  await prisma.notificationPreference.upsert({
    where: { userId_channel: { userId: session.user.id, channel: "EMAIL" } },
    create: { userId: session.user.id, channel: "EMAIL", enabled: parsed.data.enabled, events: parsed.data.events },
    update: { enabled: parsed.data.enabled, events: parsed.data.events },
  });

  return { ok: true };
}
