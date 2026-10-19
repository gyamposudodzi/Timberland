---
kind: design
name: Server-enforced ShipmentStatus state machine
source: session
category: adr
---

# Server-enforced ShipmentStatus state machine

_Source: coding plans from commit period 4a8c5e0 → 0c4ba8b — records intent at planning time; the implementation may lag or differ._

## Context
Shipment lifecycle transitions (CREATED → CONFIRMED → PICKED_UP → IN_TRANSIT → AT_HUB → OUT_FOR_DELIVERY → DELIVERED, plus EXCEPTION/RETURNED/CANCELLED) must never be bypassed by client input.

## Decision drivers
- data integrity
- auditability
- server-side authority

## Considered options
- **Client-driven status updates via API** _(rejected)_ — pros: flexible front-end; cons: risk of invalid transitions, no enforcement boundary
- **State machine enforced in server actions/server components** — pros: every transition validated before persisting; audit trail via `recordedBy`; cons: all mutation paths must go through the guarded layer

## Decision
Enforce allowed `ShipmentStatus` transitions exclusively in server-side code (server actions / route handlers); clients may only request a new status, which the server validates against the state machine before writing.

## Consequences
Invalid transitions are rejected at the boundary; the same guard protects any future back-office or driver mutations that touch `Shipment.status`.