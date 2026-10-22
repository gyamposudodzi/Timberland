import "server-only";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SHIPMENT_STATUSES, type ShipmentStatus } from "@/lib/shipment-status";

/**
 * Admin-only helpers. ADMIN has full control: unlike STAFF (who may only walk a
 * shipment through the validated state machine), an admin can override status,
 * edit any shipment field, delete shipments, and change user roles. Every write
 * path re-checks the role; these reads gate the admin surfaces.
 */

export const ADMIN_ROLE = "ADMIN" as const;
export const ASSIGNABLE_ROLES = ["CUSTOMER", "STAFF", "ADMIN"] as const;
export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

/** Returns the session only when the signed-in user is an administrator. */
export async function getAdminSession() {
  const session = await auth();
  if (session?.user?.role !== ADMIN_ROLE) return null;
  return session;
}

export interface AdminUserRow {
  id: string;
  email: string;
  name: string | null;
  role: AssignableRole;
  emailVerified: boolean;
  createdAt: Date;
  shipmentCount: number;
}

/** All accounts with their role and shipment volume, for the admin console. */
export async function listUsersForAdmin(): Promise<AdminUserRow[]> {
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      _count: { select: { shipments: true } },
    },
  });

  return users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role as AssignableRole,
    emailVerified: u.emailVerified,
    createdAt: u.createdAt,
    shipmentCount: u._count.shipments,
  }));
}

/** Every status, so an admin override form can offer the full set. */
export const ALL_STATUSES: ShipmentStatus[] = [...SHIPMENT_STATUSES];
