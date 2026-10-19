---
kind: design
name: Single Next.js App Router monolith over SPA + separate API
source: session
category: adr
---

# Single Next.js App Router monolith over SPA + separate API

_Source: coding plans from commit period 0c4ba8b → 70b9c6b — records intent at planning time; the implementation may lag or differ._

**Status:** accepted

## Context
v1 needs SEO-friendly public pages (track, quote, marketing) and fast auth for a single team/codebase. A separate SPA+API would add deployment/infra complexity without clear benefit at this scale.

## Decision drivers
- single deployable unit
- SEO for public pages
- fast auth via server components
- small team

## Considered options
- **Next.js App Router monolith (server components + server actions + route handlers)** — pros: one codebase, SSR/SEO out of the box, shared types between UI and APIs, minimal infra; cons: mixes frontend and backend in one repo; harder to scale independently later
- **Separate SPA + REST/GraphQL API** _(rejected)_ — pros: frontend/backend can scale and be staffed independently; cons: extra deployment surface, CORS/auth cookie handling, no SSR for public pages

## Decision
Use Next.js App Router with TypeScript as the full-stack app; server components/pages serve public routes, server actions handle mutations, route handlers expose JSON APIs.

## Consequences
Frontend and backend share one deployable unit and Prisma client. If traffic or team size grows, splitting is possible but will require extracting the API layer and moving stateful logic.