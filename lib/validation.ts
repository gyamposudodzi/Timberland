import { z } from "zod";
import { isValidTrackingNumber } from "@/lib/tracking-number";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long");

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{6,20}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const trackingNumberSchema = z
  .string()
  .trim()
  .min(1, "Enter a tracking number")
  .refine((v) => isValidTrackingNumber(v), { message: "That tracking number looks invalid" });

export const trackingLookupSchema = z.object({
  trackingNumber: trackingNumberSchema,
  // Optional light verification to reduce enumeration of guest lookups.
  verification: z.string().trim().max(60).optional().or(z.literal("")),
});

export const addressSchema = z.object({
  label: z.string().trim().max(60).optional().or(z.literal("")),
  contactName: z.string().trim().min(1, "Contact name is required").max(120),
  phone: z.string().trim().regex(/^[0-9+\-\s()]{6,20}$/, "Enter a valid phone number"),
  line1: z.string().trim().min(1, "Address is required").max(160),
  line2: z.string().trim().max(160).optional().or(z.literal("")),
  city: z.string().trim().min(1, "City is required").max(80),
  region: z.string().trim().max(80).optional().or(z.literal("")),
  postalCode: z.string().trim().min(2, "Postal code is required").max(16),
  country: z.string().trim().min(2).max(2).default("US"),
});

export const parcelSchema = z.object({
  description: z.string().trim().min(1, "Describe the contents").max(200),
  weightKg: z.coerce.number().positive("Weight must be greater than 0").max(2000),
  pieces: z.coerce.number().int().min(1).max(50).default(1),
  lengthCm: z.coerce.number().positive().optional(),
  widthCm: z.coerce.number().positive().optional(),
  heightCm: z.coerce.number().positive().optional(),
  declaredValue: z.coerce.number().min(0).optional(),
});

export const shipmentSchema = z.object({
  serviceLevelCode: z.string().trim().min(1, "Choose a service level"),
  pickupDate: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  sender: addressSchema,
  recipient: addressSchema,
  parcels: z.array(parcelSchema).min(1, "Add at least one parcel").max(20),
});

export const quoteSchema = z.object({
  serviceLevelCode: z.string().trim().min(1, "Choose a service level"),
  originPostalCode: z.string().trim().min(2, "Origin postal code is required"),
  destinationPostalCode: z.string().trim().min(2, "Destination postal code is required"),
  weightKg: z.coerce.number().positive("Weight must be greater than 0").max(2000),
  pieces: z.coerce.number().int().min(1).max(50).default(1),
});

export const notificationPrefsSchema = z.object({
  enabled: z.coerce.boolean().default(true),
  events: z.array(z.string()).default([]),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type ShipmentInput = z.infer<typeof shipmentSchema>;
export type QuoteInput = z.infer<typeof quoteSchema>;
