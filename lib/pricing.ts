/**
 * Own-fleet rate / quote engine.
 *
 * This is a pure module (no database, no framework) so it can be unit tested
 * directly. The values are plain numbers; the caller is responsible for
 * converting Prisma `Decimal` fields to numbers via `Number(...)`.
 */

export interface RateInput {
  /** Fixed base price charged for entering the delivery zone. */
  zoneBasePrice: number;
  /** Price per kilogram of total weight. */
  perKg: number;
  /** Price per parcel piece. */
  perPiece: number;
  /** Hard floor for the shipment price in this zone / service level. */
  minPrice: number;
  /** Multiplier applied by the selected service level (e.g. express = 1.5). */
  serviceMultiplier: number;
}

export interface ParcelInput {
  weightKg: number;
  pieces: number;
}

export interface QuoteBreakdown {
  zoneBase: number;
  weightTotalKg: number;
  weightCharge: number;
  piecesTotal: number;
  pieceCharge: number;
  subtotalBeforeService: number;
  serviceMultiplier: number;
  afterService: number;
  minPriceApplied: boolean;
  total: number;
}

/** Round to 2 decimals without the classic float drift (half-up). */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function positive(value: number, fallback = 0): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

/**
 * Compute a shipment quote.
 * total = max(minPrice, (zoneBase + perKg*weight + perPiece*pieces) * serviceMultiplier)
 */
export function computeQuote(
  rate: RateInput,
  parcels: ParcelInput[],
): QuoteBreakdown {
  const zoneBase = round2(positive(rate.zoneBasePrice));
  const perKg = positive(rate.perKg);
  const perPiece = positive(rate.perPiece);
  const minPrice = round2(positive(rate.minPrice));
  const serviceMultiplier = rate.serviceMultiplier > 0 ? rate.serviceMultiplier : 1;

  const weightTotalKg = parcels.reduce((sum, p) => sum + positive(p.weightKg), 0);
  const piecesTotal = parcels.reduce((sum, p) => sum + Math.max(0, Math.floor(p.pieces)), 0);

  const weightCharge = round2(perKg * weightTotalKg);
  const pieceCharge = round2(perPiece * piecesTotal);

  const subtotalBeforeService = round2(zoneBase + weightCharge + pieceCharge);
  const afterServiceRaw = subtotalBeforeService * serviceMultiplier;
  const afterService = round2(afterServiceRaw);

  const minPriceApplied = afterService < minPrice;
  const total = round2(Math.max(afterService, minPrice));

  return {
    zoneBase,
    weightTotalKg,
    weightCharge,
    piecesTotal,
    pieceCharge,
    subtotalBeforeService,
    serviceMultiplier,
    afterService,
    minPriceApplied,
    total,
  };
}
