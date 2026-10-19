---
kind: design
name: PostgreSQL + Prisma as the sole persistence layer, deferring PostGIS
source: session
category: adr
---

# PostgreSQL + Prisma as the sole persistence layer, deferring PostGIS

_Source: coding plans from commit period 0c4ba8b → 70b9c6b — records intent at planning time; the implementation may lag or differ._

**Status:** accepted

## Context
Shipments, addresses, events, and users have clear relational structure. True geospatial routing is not needed in v1 because pricing is zone-based.

## Decision drivers
- relational fit
- typed client + migrations
- operational simplicity
- defer geospatial until needed

## Considered options
- **PostgreSQL + Prisma ORM** — pros: migrations, typed queries, strong fit for shipments/addresses/events, managed Postgres on Vercel ecosystem; cons: PostGIS features unavailable until explicitly added
- **MongoDB or a document store** _(rejected)_ — pros: flexible schema for evolving domain; cons: loss of referential integrity for shipments/addresses/events; no built-in migrations
- **PostgreSQL with PostGIS from day one** _(rejected)_ — pros: ready for GPS/distance routing; cons: unnecessary complexity for v1's zone-based pricing; adds operational overhead

## Decision
Use PostgreSQL with Prisma for all persistence; defer PostGIS until actual geospatial routing is required.

## Consequences
Schema evolves through Prisma migrations with type-safe clients. Adding location/routing later requires extending the schema and introducing PostGIS extensions.