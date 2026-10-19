---
kind: design
name: Own-fleet pricing engine as a pure function backed by zone/rule tables
source: session
category: adr
---

# Own-fleet pricing engine as a pure function backed by zone/rule tables

_Source: coding plans from commit period 4a8c5e0 → 0c4ba8b — records intent at planning time; the implementation may lag or differ._

## Context
Rates must be computed from internal business rules (zone + weight + service level) rather than calling third-party carrier APIs.

## Decision drivers
- deterministic pricing
- testability
- own-fleet control
- reusability across quote and creation

## Considered options
- **Hard-coded rates in route handlers** — pros: quick start; cons: not testable, duplicated between quote and create flows
- **Third-party carrier rate API integration** _(rejected)_ — pros: real-time market rates; cons: out of scope for own-fleet v1, adds external dependency and latency
- **Pure `quote()` function in `lib/pricing` reading `ServiceZone`/`RateRule`/`ServiceLevel`** — pros: unit-testable, reused by `/quote` and shipment creation, formula = base + perKg*weight + perPiece*pieces with SLA multiplier and minPrice floor; cons: requires data entry of zones and rules

## Decision
Implement a pure `quote({ zoneId, serviceLevel, parcels[] }) => { price, breakdown, etaDays }` function in `lib/pricing`, driven by `ServiceZone`, `RateRule`, and `ServiceLevel` tables, with unit tests covering edge cases.

## Consequences
Pricing changes are configuration-driven and verifiable via tests; the same function powers both the public quote calculator and the backend when creating a shipment.