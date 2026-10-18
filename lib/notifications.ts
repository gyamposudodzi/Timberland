import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { STATUS_META, type ShipmentStatus } from "@/lib/shipment-status";
import type { Shipment, TrackingEvent } from "@prisma/client";

let cachedTransport: Transporter | null = null;

function getTransport(): Transporter {
  if (cachedTransport) return cachedTransport;
  const { host, port, user, password } = env.smtp;
  if (env.emailEnabled) {
    cachedTransport = nodemailer.createTransport({
      host,
      port,
      secure: Number(port) === 465,
      auth: { user, pass: password },
    });
  } else {
    // Development fallback: captures mail without sending it.
    cachedTransport = nodemailer.createTransport({ jsonTransport: true });
  }
  return cachedTransport;
}

async function deliver(to: string, subject: string, html: string): Promise<string> {
  const info = await getTransport().sendMail({ from: env.smtp.from, to, subject, html });
  return info.messageId;
}

function statusEmailHtml(shipment: Shipment, event: TrackingEvent): string {
  const meta = STATUS_META[event.statusCode as ShipmentStatus];
  return `
    <div style="font-family:sans-serif;max-width:520px">
      <h2 style="color:#1f6f4a;margin-bottom:4px">Timberland delivery update</h2>
      <p style="color:#5b6660;margin-top:0">Tracking number <strong>${shipment.trackingNumber}</strong></p>
      <p style="font-size:18px"><strong>${meta.label}</strong>${event.location ? ` — ${event.location}` : ""}</p>
      ${event.note ? `<p>${event.note}</p>` : ""}
      <p style="color:#5b6660;font-size:13px">View live details: ${env.appUrl}/track/${shipment.trackingNumber}</p>
    </div>
  `;
}

/**
 * Send tracking-update notifications to the owning customer, honoring their
 * preference and recording a NotificationLog regardless of channel.
 */
export async function notifyStatusChange(input: { shipmentId: string; eventId: string }) {
  const shipment = await prisma.shipment.findUnique({
    where: { id: input.shipmentId },
    include: { user: true },
  });
  const event = await prisma.trackingEvent.findUnique({ where: { id: input.eventId } });
  if (!shipment || !event || !shipment.user) return;

  const user = shipment.user;
  const statusCode = event.statusCode as ShipmentStatus;
  const pref = await prisma.notificationPreference.findFirst({
    where: { userId: user.id, channel: "EMAIL" },
  });

  const wantsThisEvent = !pref || (pref.enabled && pref.events.includes(statusCode));
  const subject = `${STATUS_META[statusCode].label} — ${shipment.trackingNumber}`;

  if (!wantsThisEvent) {
    await prisma.notificationLog.create({
      data: {
        userId: user.id,
        shipmentId: shipment.id,
        channel: "EMAIL",
        event: statusCode,
        to: user.email,
        subject,
        status: "SKIPPED",
      },
    });
    return;
  }

  try {
    await deliver(user.email, subject, statusEmailHtml(shipment, event));
    await prisma.notificationLog.create({
      data: {
        userId: user.id,
        shipmentId: shipment.id,
        channel: "EMAIL",
        event: statusCode,
        to: user.email,
        subject,
        status: env.emailEnabled ? "SENT" : "SKIPPED",
      },
    });
  } catch (err) {
    await prisma.notificationLog.create({
      data: {
        userId: user.id,
        shipmentId: shipment.id,
        channel: "EMAIL",
        event: statusCode,
        to: user.email,
        subject,
        status: "FAILED",
        error: err instanceof Error ? err.message : "unknown",
      },
    });
  }
}

/** Simple transactional email used for signup verification / receipts. */
export async function sendBasicEmail(to: string, subject: string, html: string) {
  await deliver(to, subject, html);
}
