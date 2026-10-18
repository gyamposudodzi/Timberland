-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'STAFF', 'ADMIN');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('CREATED', 'CONFIRMED', 'PICKED_UP', 'IN_TRANSIT', 'AT_HUB', 'OUT_FOR_DELIVERY', 'DELIVERED', 'EXCEPTION', 'RETURNED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PAY_ON_DELIVERY', 'CASH', 'CARD_ON_DELIVERY', 'INVOICE');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL');

-- CreateEnum
CREATE TYPE "NotificationLogStatus" AS ENUM ('SENT', 'FAILED', 'SKIPPED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "passwordHash" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifyToken" TEXT,
    "verifyTokenAt" TIMESTAMP(3),
    "resetToken" TEXT,
    "resetTokenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceZone" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "basePrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceLevel" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slaDays" INTEGER NOT NULL DEFAULT 3,
    "priceMultiplier" DECIMAL(6,2) NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateRule" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "serviceLevelId" TEXT NOT NULL,
    "perKg" DECIMAL(8,2) NOT NULL,
    "perPiece" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "minPrice" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "RateRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "label" TEXT,
    "contactName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "city" TEXT NOT NULL,
    "region" TEXT,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'US',
    "zoneId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL,
    "trackingNumber" TEXT NOT NULL,
    "userId" TEXT,
    "status" "ShipmentStatus" NOT NULL DEFAULT 'CREATED',
    "serviceLevelId" TEXT NOT NULL,
    "senderAddressId" TEXT NOT NULL,
    "recipientAddressId" TEXT NOT NULL,
    "pickupDate" TIMESTAMP(3),
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'PAY_ON_DELIVERY',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parcel" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "weightKg" DECIMAL(8,3) NOT NULL,
    "lengthCm" DECIMAL(8,2),
    "widthCm" DECIMAL(8,2),
    "heightCm" DECIMAL(8,2),
    "pieces" INTEGER NOT NULL DEFAULT 1,
    "declaredValue" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Parcel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackingEvent" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "statusCode" "ShipmentStatus" NOT NULL,
    "location" TEXT,
    "note" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "source" TEXT NOT NULL DEFAULT 'SYSTEM',
    "recordedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrackingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'EMAIL',
    "events" TEXT[],
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "shipmentId" TEXT,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'EMAIL',
    "event" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" "NotificationLogStatus" NOT NULL DEFAULT 'SKIPPED',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceZone_code_key" ON "ServiceZone"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceLevel_code_key" ON "ServiceLevel"("code");

-- CreateIndex
CREATE UNIQUE INDEX "RateRule_zoneId_serviceLevelId_key" ON "RateRule"("zoneId", "serviceLevelId");

-- CreateIndex
CREATE INDEX "Address_userId_idx" ON "Address"("userId");

-- CreateIndex
CREATE INDEX "Address_postalCode_idx" ON "Address"("postalCode");

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_trackingNumber_key" ON "Shipment"("trackingNumber");

-- CreateIndex
CREATE INDEX "Shipment_userId_idx" ON "Shipment"("userId");

-- CreateIndex
CREATE INDEX "Shipment_status_idx" ON "Shipment"("status");

-- CreateIndex
CREATE INDEX "Shipment_createdAt_idx" ON "Shipment"("createdAt");

-- CreateIndex
CREATE INDEX "Parcel_shipmentId_idx" ON "Parcel"("shipmentId");

-- CreateIndex
CREATE INDEX "TrackingEvent_shipmentId_idx" ON "TrackingEvent"("shipmentId");

-- CreateIndex
CREATE INDEX "TrackingEvent_shipmentId_isPublic_idx" ON "TrackingEvent"("shipmentId", "isPublic");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_channel_key" ON "NotificationPreference"("userId", "channel");

-- CreateIndex
CREATE INDEX "NotificationLog_shipmentId_idx" ON "NotificationLog"("shipmentId");

-- CreateIndex
CREATE INDEX "NotificationLog_userId_idx" ON "NotificationLog"("userId");

-- AddForeignKey
ALTER TABLE "RateRule" ADD CONSTRAINT "RateRule_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "ServiceZone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RateRule" ADD CONSTRAINT "RateRule_serviceLevelId_fkey" FOREIGN KEY ("serviceLevelId") REFERENCES "ServiceLevel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "ServiceZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_serviceLevelId_fkey" FOREIGN KEY ("serviceLevelId") REFERENCES "ServiceLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_senderAddressId_fkey" FOREIGN KEY ("senderAddressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_recipientAddressId_fkey" FOREIGN KEY ("recipientAddressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parcel" ADD CONSTRAINT "Parcel_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackingEvent" ADD CONSTRAINT "TrackingEvent_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackingEvent" ADD CONSTRAINT "TrackingEvent_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
