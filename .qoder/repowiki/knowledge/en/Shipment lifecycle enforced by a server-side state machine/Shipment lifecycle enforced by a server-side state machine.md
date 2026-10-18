---
kind: design
name: Shipment lifecycle enforced by a server-side state machine
source: session
category: adr
---

# Shipment lifecycle enforced by a server-side state machine

_Source: coding plans from commit period 3d4cd9b → f630ba2 — records intent at planning time; the implementation may lag or differ._

**Status:** accepted

## Context
Shipment status transitions (CREATED → CONFIRMED → PICKED_UP → IN_TRANSIT → AT_HUB → OUT_FOR_DELIVERY → DELIVERED, plus EXCEPTION/RETURNED/CANCELLED) must never be mutated directly by clients.

## Decision drivers
- data integrity
- auditability
- future back-office/driver consistency

## Considered options
- **Prisma enum + server-side transition guards in server actions** — pros: Single source of truth; invalid transitions rejected before DB write; cons: All mutations must go through the guarded actions
- **Client-driven status updates via REST PATCH** — pros: Flexible; cons: Easy to bypass; unsafe for v1
- **Event-sourced log only, derive status from last event** — pros: Full history; cons: Over-engineered for v1; complicates queries

## Decision
Store `status` as a Prisma enum and enforce allowed transitions inside server actions (and the future back-office action). Each change is recorded as a `TrackingEvent` row with `recordedBy`, so the timeline doubles as an audit trail.

## Consequences
Status is always consistent with its event log. Adding new states means updating the enum, the guard table, and the migration. Guest-facing timelines filter on `isPublic`.