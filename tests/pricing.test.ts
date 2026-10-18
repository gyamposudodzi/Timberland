import { describe, it, expect } from "vitest";
import { computeQuote, round2 } from "@/lib/pricing";

const baseRate = {
  zoneBasePrice: 9,
  perKg: 1.4,
  perPiece: 1,
  minPrice: 12,
  serviceMultiplier: 1,
};

describe("computeQuote", () => {
  it("sums zone base + weight + piece charges", () => {
    const q = computeQuote(baseRate, [{ weightKg: 3, pieces: 1 }]);
    // 9 + 1.4*3 (4.20) + 1*1 = 14.20, above min
    expect(q.weightCharge).toBe(4.2);
    expect(q.pieceCharge).toBe(1);
    expect(q.subtotalBeforeService).toBe(14.2);
    expect(q.total).toBe(14.2);
    expect(q.minPriceApplied).toBe(false);
  });

  it("applies the minimum price floor", () => {
    const q = computeQuote(baseRate, [{ weightKg: 0.1, pieces: 1 }]);
    // 9 + 0.14 + 1 = 10.14 < min 12
    expect(q.subtotalBeforeService).toBe(10.14);
    expect(q.total).toBe(12);
    expect(q.minPriceApplied).toBe(true);
  });

  it("applies the service multiplier", () => {
    const q = computeQuote({ ...baseRate, serviceMultiplier: 1.75 }, [{ weightKg: 3, pieces: 1 }]);
    // 14.20 * 1.75 = 24.85
    expect(q.afterService).toBe(24.85);
    expect(q.total).toBe(24.85);
  });

  it("aggregates multiple parcels", () => {
    const q = computeQuote(baseRate, [
      { weightKg: 2, pieces: 1 },
      { weightKg: 5, pieces: 3 },
    ]);
    expect(q.weightTotalKg).toBe(7);
    expect(q.piecesTotal).toBe(4);
    expect(q.weightCharge).toBe(9.8);
    expect(q.pieceCharge).toBe(4);
  });

  it("treats non-positive or invalid values as zero", () => {
    const q = computeQuote(baseRate, [{ weightKg: -5, pieces: 0 }, { weightKg: Number.NaN, pieces: 1 }]);
    expect(q.weightTotalKg).toBe(0);
    expect(q.piecesTotal).toBe(1);
  });

  it("round2 rounds half-up without float drift", () => {
    expect(round2(1.005)).toBe(1.01);
    expect(round2(2.675)).toBe(2.68);
  });
});
