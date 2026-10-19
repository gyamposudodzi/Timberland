---
kind: design
name: Single Next.js App Router monolith with Prisma + Auth.js
source: session
category: adr
---

# Single Next.js App Router monolith with Prisma + Auth.js

_Source: coding plans from commit period 4a8c5e0 → 0c4ba8b — records intent at planning time; the implementation may lag or differ._

## Context
Greenfield courier web app needs SEO-friendly public pages (track, quote, marketing) plus authenticated customer flows and JSON APIs. The team is a single codebase.

## Decision drivers
- single deployable unit
- SEO for public routes
- fast auth via server components
- typed DB access

## Considered options
- **Separate SPA frontend + REST API backend** _(rejected)_ — pros: clear separation of concerns; cons: two deployables, CORS/cookie complexity, slower iteration for v1
- **Next.js App Router + Prisma + Auth.js** — pros: server components + server actions cover both public pages and APIs; migrations + typed client; middleware guards routes; cons: full-stack coupling in one repo

## Decision
Build the whole v1 as one Next.js App Router application using TypeScript, Tailwind/shadcn/ui, Prisma over PostgreSQL, and Auth.js for session-based auth with optional Google OAuth.

## Consequences
Public and customer routes live side-by-side under `app/` route groups; all DB access goes through Prisma from server components/actions. PostGIS is deferred until geospatial routing is needed.