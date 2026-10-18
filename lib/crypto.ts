import "server-only";

import { randomBytes, createHash } from "crypto";
import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string | null): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(plain, hash);
}

/** URL-safe random token for email verification / password reset. */
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/**
 * Hash a token before persisting it, so a leaked DB row cannot be replayed.
 * Returns a hex digest.
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
