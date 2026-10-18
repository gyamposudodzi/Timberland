import { describe, it, expect } from "vitest";
import { generateTrackingNumber, isValidTrackingNumber, normalizeTrackingNumber } from "@/lib/tracking-number";

describe("tracking numbers", () => {
  it("generates valid, well-formed codes", () => {
    for (let i = 0; i < 50; i++) {
      const code = generateTrackingNumber();
      expect(code.startsWith("TB")).toBe(true);
      expect(code.length).toBe(11);
      expect(isValidTrackingNumber(code)).toBe(true);
    }
  });

  it("rejects tampered codes", () => {
    const code = generateTrackingNumber();
    const tampered = code.slice(0, -1) + (code.endsWith("A") ? "B" : "A");
    expect(isValidTrackingNumber(tampered)).toBe(false);
  });

  it("normalizes case and separators", () => {
    expect(normalizeTrackingNumber(" tb7k-3m9q xr4t ")).toBe("TB7K3M9QXR4T");
  });

  it("produces varied codes (not sequential)", () => {
    const set = new Set(Array.from({ length: 200 }, () => generateTrackingNumber()));
    expect(set.size).toBeGreaterThan(150);
  });
});
