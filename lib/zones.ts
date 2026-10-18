/**
 * Own-fleet coverage: maps a postal code to a service-zone code.
 *
 * This is intentionally a small static table for v1 so public quotes work
 * without full coverage data. Rate rules themselves live in the database and
 * are keyed by the zone `code`. When real coverage data arrives, replace this
 * with a DB-backed lookup (`ZoneCoverage`).
 */

export const ZONE_CODES = ["METRO", "REGION", "REMOTE"] as const;
export type ZoneCode = (typeof ZONE_CODES)[number];

export const DEFAULT_ZONE_CODE: ZoneCode = "REGION";

/** Digit-prefix ranges used for the v1 demo coverage model. */
const PREFIX_MAP: Record<string, ZoneCode> = {
  "0": "METRO",
  "1": "METRO",
  "2": "REGION",
  "3": "REGION",
  "4": "REGION",
  "5": "REMOTE",
  "6": "REMOTE",
  "7": "REMOTE",
  "8": "REMOTE",
  "9": "REMOTE",
};

export function matchZoneCode(postalCode: string): ZoneCode {
  const clean = postalCode.trim();
  if (!clean) return DEFAULT_ZONE_CODE;
  const first = clean[0];
  return PREFIX_MAP[first] ?? DEFAULT_ZONE_CODE;
}
