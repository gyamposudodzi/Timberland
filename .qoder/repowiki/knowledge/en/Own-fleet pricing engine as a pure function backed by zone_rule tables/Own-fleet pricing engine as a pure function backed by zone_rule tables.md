---
kind: design
name: Own-fleet pricing engine as a pure function backed by zone/rule tables
source: session
category: adr
---

# Own-fleet pricing engine as a pure function backed by zone/rule tables

_Source: coding plans from commit period 0c4ba8b → 70b9c6b — records intent at planning time; the implementation may lag or differ._

**Status:** accepted

## Context
Rates are computed from internal rules (zone + weight + service level), not third-party carrier APIs. The same logic must power both the `/quote` calculator and live shipment creation.

## Decision drivers
- deterministic pricing
- testability
- reuse across UI and mutation paths
- no external dependency

## Considered options
- **Pure `quote({ zoneId, serviceLevel, parcels[] })` function in `lib/pricing`, fed by `ServiceZone`/`RateRule`/`ServiceLevel` tables** — pros: unit-testable, reusable by `/quote` and shipment creation, easy to audit and change; cons: pricing changes require a data migration or seed update rather than a hotfixable config file
- **Server-side pricing API endpoint called from the client quote form** _(rejected)_ — pros: centralized business logic; cons: adds network hop on every keystroke, harder to unit test, duplicates validation

## Decision
Implement pricing as a pure function in `lib/pricing` that reads `ServiceZone`/`RateRule`/`ServiceLevel` rows and returns `{ price, breakdown, etaDays }`; call it from both the `/quote` page and the shipment creation server action.

## Consequences
Pricing is deterministic and fully testable. Changes to rates or SLAs are data-driven and versioned through Prisma migrations/seed. No external pricing API means v1 has no real-time carrier rate sync.