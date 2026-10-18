import { describe, it, expect } from "vitest";
import { canTransition, isTerminal, isCompleted, nextStatuses, STATUS_META, SHIPMENT_STATUSES } from "@/lib/shipment-status";

describe("shipment state machine", () => {
  it("allows the happy path", () => {
    expect(canTransition("CREATED", "CONFIRMED")).toBe(true);
    expect(canTransition("CONFIRMED", "PICKED_UP")).toBe(true);
    expect(canTransition("PICKED_UP", "IN_TRANSIT")).toBe(true);
    expect(canTransition("OUT_FOR_DELIVERY", "DELIVERED")).toBe(true);
  });

  it("rejects skipping ahead", () => {
    expect(canTransition("CREATED", "DELIVERED")).toBe(false);
    expect(canTransition("PICKED_UP", "DELIVERED")).toBe(false);
  });

  it("treats RETURNED and CANCELLED as terminal", () => {
    expect(isTerminal("RETURNED")).toBe(true);
    expect(isTerminal("CANCELLED")).toBe(true);
    expect(nextStatuses("CANCELLED")).toHaveLength(0);
  });

  it("recovers from EXCEPTION", () => {
    expect(canTransition("EXCEPTION", "OUT_FOR_DELIVERY")).toBe(true);
    expect(canTransition("CONFIRMED", "EXCEPTION")).toBe(true);
  });

  it("has complete metadata for every status", () => {
    for (const s of SHIPMENT_STATUSES) {
      expect(STATUS_META[s]).toBeDefined();
      expect(STATUS_META[s].label.length).toBeGreaterThan(0);
    }
  });

  it("isCompleted covers closed states", () => {
    expect(isCompleted("DELIVERED")).toBe(true);
    expect(isCompleted("IN_TRANSIT")).toBe(false);
  });
});
