import { randomInt } from "crypto";

/**
 * Public tracking number generation + validation.
 *
 * Format: `TB` + 8 base32 characters + 1 check character (11 chars total),
 * e.g. `TB7K3M9QXR4T`. Uses Crockford's Base32 alphabet (no I, L, O, U) so the
 * codes are unambiguous when read aloud or typed. Codes are random (not
 * sequential) to resist enumeration by guests.
 */

const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford Base32
const PREFIX = "TB";
const BODY_LENGTH = 8;

function randomChar(): string {
  return ALPHABET[randomInt(0, ALPHABET.length)];
}

/** Compute a deterministic check character from the body. */
function checkChar(body: string): string {
  let sum = 0;
  for (let i = 0; i < body.length; i++) {
    sum = (sum + ALPHABET.indexOf(body[i]) * (i + 1)) % ALPHABET.length;
  }
  return ALPHABET[sum];
}

export interface TrackingNumberOptions {
  /** Injectable randomness (defaults to crypto) — useful for tests. */
  rand?: () => string;
}

/** Generate a new tracking number. Does NOT guarantee DB uniqueness on its
 * own — callers should retry on a unique-constraint violation. */
export function generateTrackingNumber(opts: TrackingNumberOptions = {}): string {
  const pick = opts.rand ?? randomChar;
  let body = "";
  for (let i = 0; i < BODY_LENGTH; i++) body += pick();
  return `${PREFIX}${body}${checkChar(body)}`;
}

/** Normalize user input: uppercase, strip spaces and dashes. */
export function normalizeTrackingNumber(input: string): string {
  return input.toUpperCase().replace(/[\s-]/g, "");
}

export function isValidTrackingNumber(input: string): boolean {
  const code = normalizeTrackingNumber(input);
  if (code.length !== PREFIX.length + BODY_LENGTH + 1) return false;
  if (!code.startsWith(PREFIX)) return false;
  const body = code.slice(PREFIX.length, PREFIX.length + BODY_LENGTH);
  const check = code.slice(-1);
  if (![...body].every((c) => ALPHABET.includes(c))) return false;
  return checkChar(body) === check;
}
