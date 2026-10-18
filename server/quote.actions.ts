"use server";

import { estimateQuote } from "@/lib/rating";
import { quoteSchema } from "@/lib/validation";

export interface QuoteView {
  total: number;
  currency: string;
  etaDays: number;
  zoneName: string;
  serviceLevelName: string;
  breakdown: {
    zoneBase: number;
    weightTotalKg: number;
    weightCharge: number;
    piecesTotal: number;
    pieceCharge: number;
    subtotalBeforeService: number;
    serviceMultiplier: number;
    afterService: number;
    minPriceApplied: boolean;
  };
}

export type QuoteResult = { ok: true; quote: QuoteView } | { ok: false; error: string };

export async function estimateQuoteAction(input: unknown): Promise<QuoteResult> {
  const parsed = quoteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid quote request." };
  }
  const { serviceLevelCode, destinationPostalCode, weightKg, pieces } = parsed.data;

  try {
    const priced = await estimateQuote({
      destinationPostalCode,
      serviceLevelCode,
      parcels: [{ weightKg, pieces }],
    });
    return {
      ok: true,
      quote: {
        total: priced.breakdown.total,
        currency: priced.currency,
        etaDays: priced.etaDays,
        zoneName: priced.zoneName,
        serviceLevelName: priced.serviceLevelName,
        breakdown: {
          zoneBase: priced.breakdown.zoneBase,
          weightTotalKg: priced.breakdown.weightTotalKg,
          weightCharge: priced.breakdown.weightCharge,
          piecesTotal: priced.breakdown.piecesTotal,
          pieceCharge: priced.breakdown.pieceCharge,
          subtotalBeforeService: priced.breakdown.subtotalBeforeService,
          serviceMultiplier: priced.breakdown.serviceMultiplier,
          afterService: priced.breakdown.afterService,
          minPriceApplied: priced.breakdown.minPriceApplied,
        },
      },
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Could not price this route." };
  }
}
