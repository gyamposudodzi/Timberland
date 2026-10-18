---
kind: external_dependency
name: Prisma ORM (v6) over PostgreSQL
slug: prisma
category: external_dependency
category_hints:
    - migration_status
scope:
    - '**'
source_files:
    - prisma/schema.prisma
    - prisma/migrations/
    - lib/db.ts
    - docker-compose.yml
---

### Data layer
- ORM: Prisma 6 (pinned away from v7 due to breaking config/runtime changes). Client generated into node_modules via `prisma generate`.
- Database: PostgreSQL, provisioned through `docker-compose.yml` (`db` service); local dev URL `postgresql://timberland:timberland@localhost:5432/timberland?schema=public`.
- Migration workflow: `prisma migrate dev` for dev, `prisma migrate deploy` for prod; seed via `tsx prisma/seed.ts` (zones, service levels, rates, demo account).
- CI e2e job spins up Postgres as a service, runs migrations + seed before Playwright.