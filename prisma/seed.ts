import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateTrackingNumber } from "../lib/tracking-number";

const prisma = new PrismaClient();

async function main() {
  // Idempotent reset (children first).
  await prisma.notificationLog.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.trackingEvent.deleteMany();
  await prisma.parcel.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.address.deleteMany();
  await prisma.rateRule.deleteMany();
  await prisma.serviceLevel.deleteMany();
  await prisma.serviceZone.deleteMany();
  await prisma.user.deleteMany();

  // Zones
  const metro = await prisma.serviceZone.create({ data: { code: "METRO", name: "Metro / same city", basePrice: 5, currency: "USD" } });
  const region = await prisma.serviceZone.create({ data: { code: "REGION", name: "Regional", basePrice: 9, currency: "USD" } });
  const remote = await prisma.serviceZone.create({ data: { code: "REMOTE", name: "Remote / extended", basePrice: 15, currency: "USD" } });

  // Service levels
  const standard = await prisma.serviceLevel.create({ data: { code: "STANDARD", name: "Standard", description: "Ground delivery in 2–4 days.", slaDays: 3, priceMultiplier: 1 } });
  const express = await prisma.serviceLevel.create({ data: { code: "EXPRESS", name: "Express", description: "Priority handling, next working day.", slaDays: 1, priceMultiplier: 1.75 } });
  const sameDay = await prisma.serviceLevel.create({ data: { code: "SAME_DAY", name: "Same Day", description: "Collected and delivered today.", slaDays: 0, priceMultiplier: 2.5 } });

  // Rate rules: zone x service level
  const zones = [metro, region, remote];
  const levels = [standard, express, sameDay];
  const perKgByZone = { METRO: 0.8, REGION: 1.4, REMOTE: 2.2 } as Record<string, number>;
  const minByZone = { METRO: 6, REGION: 12, REMOTE: 20 } as Record<string, number>;
  for (const z of zones) {
    for (const l of levels) {
      await prisma.rateRule.create({
        data: {
          zoneId: z.id,
          serviceLevelId: l.id,
          perKg: perKgByZone[z.code],
          perPiece: 1,
          minPrice: minByZone[z.code] * (l.code === "STANDARD" ? 1 : l.code === "EXPRESS" ? 1.3 : 1.6),
        },
      });
    }
  }

  // Demo customer
  const demoHash = await bcrypt.hash("demo1234", 12);
  const demo = await prisma.user.create({
    data: {
      email: "demo@timberland.example",
      name: "Demo Customer",
      phone: "+1 555 0100",
      passwordHash: demoHash,
      role: "CUSTOMER",
      emailVerified: true,
      notificationPrefs: { create: { channel: "EMAIL", events: ["PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED", "EXCEPTION"], enabled: true } },
    },
  });

  // Back-office operator (role-gated access to /ops).
  const opsHash = await bcrypt.hash("ops1234", 12);
  await prisma.user.create({
    data: {
      email: "ops@timberland.example",
      name: "Ops Staff",
      phone: "+1 555 0001",
      passwordHash: opsHash,
      role: "STAFF",
      emailVerified: true,
    },
  });

  // Administrator — full control (status override, edit/delete any shipment, manage roles).
  const adminHash = await bcrypt.hash("admin1234", 12);
  await prisma.user.create({
    data: {
      email: "admin@timberland.example",
      name: "Ada Admin",
      phone: "+1 555 0000",
      passwordHash: adminHash,
      role: "ADMIN",
      emailVerified: true,
    },
  });

  // Dedicated account for the password-reset e2e (no other test logs in here).
  const resetHash = await bcrypt.hash("reset1234", 12);
  await prisma.user.create({
    data: {
      email: "reset@timberland.example",
      name: "Reset Target",
      phone: "+1 555 0002",
      passwordHash: resetHash,
      role: "CUSTOMER",
      emailVerified: true,
    },
  });

  const sender = await prisma.address.create({
    data: { userId: demo.id, label: "Home", contactName: "Demo Customer", phone: "+1 555 0100", line1: "12 Orchard Lane", city: "Portland", region: "OR", postalCode: "11201", country: "US", zoneId: metro.id },
  });

  const mkRecipient = (name: string, city: string, postal: string, zoneId: string) =>
    prisma.address.create({ data: { userId: demo.id, contactName: name, phone: "+1 555 0200", line1: "44 Market St", city, postalCode: postal, country: "US", zoneId } });

  const r1 = await mkRecipient("Ada Lovelace", "Bend", "22301", region.id);
  const r2 = await mkRecipient("Grace Hopper", "Pasco", "52101", remote.id);
  const r3 = await mkRecipient("Alan Turing", "Seattle", "10001", metro.id);

  const now = Date.now();
  const day = 86400000;

  // Shipment A: delivered (public)
  const tnA = generateTrackingNumber();
  await prisma.shipment.create({
    data: {
      trackingNumber: tnA,
      userId: demo.id,
      status: "DELIVERED",
      serviceLevelId: standard.id,
      senderAddressId: sender.id,
      recipientAddressId: r1.id,
      pickupDate: new Date(now - 5 * day),
      price: 21.4,
      currency: "USD",
      parcels: { create: [{ description: "Books and documents", weightKg: 3.5, pieces: 1 }] },
      trackingEvents: {
        create: [
          { statusCode: "CREATED", location: "Portland, US", occurredAt: new Date(now - 5 * day), isPublic: true, source: "SYSTEM" },
          { statusCode: "PICKED_UP", location: "Portland, US", occurredAt: new Date(now - 4 * day), isPublic: true, source: "DRIVER" },
          { statusCode: "IN_TRANSIT", location: "Bend Hub, US", occurredAt: new Date(now - 3 * day), isPublic: true, source: "SYSTEM" },
          { statusCode: "OUT_FOR_DELIVERY", location: "Bend, US", occurredAt: new Date(now - 2 * day), isPublic: true, source: "DRIVER" },
          { statusCode: "DELIVERED", location: "Bend, US", note: "Left with resident", occurredAt: new Date(now - 2 * day + 6 * 3600000), isPublic: true, source: "DRIVER" },
        ],
      },
    },
  });

  // Shipment B: out for delivery
  const tnB = generateTrackingNumber();
  await prisma.shipment.create({
    data: {
      trackingNumber: tnB,
      userId: demo.id,
      status: "OUT_FOR_DELIVERY",
      serviceLevelId: express.id,
      senderAddressId: sender.id,
      recipientAddressId: r2.id,
      pickupDate: new Date(now - day),
      price: 46.9,
      currency: "USD",
      parcels: { create: [{ description: "Fragile electronics", weightKg: 2.1, pieces: 2, declaredValue: 320 }] },
      trackingEvents: {
        create: [
          { statusCode: "CREATED", location: "Portland, US", occurredAt: new Date(now - day), isPublic: true, source: "SYSTEM" },
          { statusCode: "PICKED_UP", location: "Portland, US", occurredAt: new Date(now - day + 3 * 3600000), isPublic: true, source: "DRIVER" },
          { statusCode: "IN_TRANSIT", location: "Pasco, US", occurredAt: new Date(now - 6 * 3600000), isPublic: true, source: "SYSTEM" },
          { statusCode: "OUT_FOR_DELIVERY", location: "Pasco, US", occurredAt: new Date(now - 2 * 3600000), isPublic: true, source: "DRIVER" },
        ],
      },
    },
  });

  // Shipment C: created (guest trackable, minimal timeline)
  const tnC = generateTrackingNumber();
  await prisma.shipment.create({
    data: {
      trackingNumber: tnC,
      userId: demo.id,
      status: "CREATED",
      serviceLevelId: standard.id,
      senderAddressId: sender.id,
      recipientAddressId: r3.id,
      pickupDate: new Date(now + day),
      price: 12.2,
      currency: "USD",
      parcels: { create: [{ description: "Sample parcel", weightKg: 1, pieces: 1 }] },
      trackingEvents: {
        create: [{ statusCode: "CREATED", location: "Portland, US", note: "Awaiting pickup", occurredAt: new Date(now), isPublic: true, source: "SYSTEM" }],
      },
    },
  });

  console.log("Seeded Timberland demo data.");
  console.log("  Login:    demo@timberland.example  /  demo1234");
  console.log("  Ops:      ops@timberland.example   /  ops1234");
  console.log("  Admin:    admin@timberland.example /  admin1234");
  console.log(`  Track A (delivered):        ${tnA}`);
  console.log(`  Track B (out for delivery): ${tnB}`);
  console.log(`  Track C (created):          ${tnC}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
