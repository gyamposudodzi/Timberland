import "server-only";
import { prisma } from "@/lib/db";
import { computeQuote, type ParcelInput, type QuoteBreakdown } from "@/lib/pricing";
import { matchZoneCode } from "@/lib/zones";

export interface PricedQuote {
  breakdown: QuoteBreakdown;
  currency: string;
  etaDays: number;
  zoneName: string;
  serviceLevelName: string;
  serviceLevelCode: string;
}

/**
 * Resolve a rate rule for a destination postal code + service level and compute
 * the full quote via the pure pricing engine.
 */
export async function estimateQuote(params: {
  destinationPostalCode: string;
  serviceLevelCode: string;
  parcels: ParcelInput[];
}): Promise<PricedQuote> {
  const zoneCode = matchZoneCode(params.destinationPostalCode);

  const zone = await prisma.serviceZone.findUnique({ where: { code: zoneCode } });
  const serviceLevel = await prisma.serviceLevel.findUnique({
    where: { code: params.serviceLevelCode },
  });

  if (!zone || !serviceLevel) {
    throw new Error("Pricing configuration is incomplete for the selected route.");
  }

  const rule = await prisma.rateRule.findUnique({
    where: { zoneId_serviceLevelId: { zoneId: zone.id, serviceLevelId: serviceLevel.id } },
  });
  if (!rule) {
    throw new Error(`No rate configured for zone ${zone.code} / ${serviceLevel.code}.`);
  }

  const breakdown = computeQuote(
    {
      zoneBasePrice: Number(zone.basePrice),
      perKg: Number(rule.perKg),
      perPiece: Number(rule.perPiece),
      minPrice: Number(rule.minPrice),
      serviceMultiplier: Number(serviceLevel.priceMultiplier),
    },
    params.parcels,
  );

  return {
    breakdown,
    currency: zone.currency,
    etaDays: serviceLevel.slaDays,
    zoneName: zone.name,
    serviceLevelName: serviceLevel.name,
    serviceLevelCode: serviceLevel.code,
  };
}

/** All active service levels for UI dropdowns. */
export function listServiceLevels() {
  return prisma.serviceLevel.findMany({
    where: { active: true },
    orderBy: { slaDays: "asc" },
  });
}
