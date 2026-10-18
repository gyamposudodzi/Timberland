---
kind: design
name: Own-fleet pricing engine as a pure function driven by ServiceZone + RateRule tables
source: session
category: adr
---

# Own-fleet pricing engine as a pure function driven by ServiceZone + RateRule tables

_Source: coding plans from commit period 3d4cd9b → f630ba2 — records intent at planning time; the implementation may lag or differ._

**Status:** accepted

## Context
v1 has no carrier APIs; rates must be computed from internal zones, weight, pieces, and service level, and reused by both the public quote page and shipment creation.

## Decision drivers
- own-fleet pricing rules
- testability
- reuse across UI and mutation paths

## Considered options
- **Pure `quote()` function in `lib/pricing` reading zone/rate tables** — pros: Deterministic, unit-testable, reusable by `/quote` and shipment creation; cons: Requires DB reads at quote time; not cached out of the box
- **Hard-coded rate constants or per-request external API call** — pros: Simple / flexible respectively; cons: Hard-coding is brittle; external API contradicts 'own-fleet' scope
- **Server-side stateful pricing service** — pros: Can add caching; cons: Unnecessary complexity for v1's single-node deployment

## Decision
Implement a pure `quote({ zoneId, serviceLevel, parcels[] }) => { price, breakdown, etaDays }` that applies zone base + perKg*weight + perPiece*pieces, multiplies by service-level factor, and floors at `minPrice`. It lives in `lib/pricing` with Vitest unit tests and is called from both the `/quote` page and the create-shipment flow.

## Consequences
Pricing logic is centralized and testable. Zone/rule changes require Prisma migrations. Caching can be added later if quote traffic grows.