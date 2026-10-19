---
kind: build_system
name: Next.js Monorepo Build, Test & CI Pipeline
category: build_system
scope:
    - '**'
source_files:
    - package.json
    - .github/workflows/ci.yml
    - next.config.ts
    - docker-compose.yml
    - prisma/schema.prisma
    - vitest.config.ts
    - playwright.config.ts
---

## Build System Overview

This project is a Next.js 16 application with Prisma for database access. The build and test pipeline is defined entirely through npm scripts in `package.json`, GitHub Actions for CI, and a local `docker-compose.yml` for the PostgreSQL dependency.

## Key Files

- `package.json` — all build/test/lint/typecheck/db scripts; declares dependencies on Next 16.4.2, Prisma 6.19.3, Vitest 5.x, Playwright, TypeScript 5, ESLint 9, Tailwind v4 via `@tailwindcss/turbopack`.
- `.github/workflows/ci.yml` — single CI workflow running on push/PR to `main`.
- `next.config.ts` — configures Turbopack + Tailwind v4 CSS loader.
- `prisma/schema.prisma` + `prisma/migrations/` — schema and migration history (seeded via `tsx prisma/seed.ts`).
- `docker-compose.yml` — local PostgreSQL 16 service (`timberland-db`) used by dev and e2e runs.
- `vitest.config.ts` — unit test runner configuration.
- `playwright.config.ts` — E2E test configuration.

## Build Scripts (from `package.json`)

| Script | Command | Purpose |
|---|---|---|
| `dev` | `next dev` | Development server |
| `build` | `prisma generate && next build` | Generates Prisma client then builds the Next.js app |
| `start` | `next start` | Production server |
| `lint` | `eslint` | Linting via ESLint 9 |
| `typecheck` | `tsc --noEmit` | TypeScript type checking |
| `test` | `vitest run` | Unit tests |
| `test:watch` | `vitest` | Watch mode |
| `test:e2e` | `playwright test` | E2E tests |
| `test:e2e:ui` | `playwright test --ui` | Playwright UI mode |
| `db:generate` | `prisma generate` | Generate Prisma client |
| `db:migrate` | `prisma migrate dev` | Dev migrations |
| `db:deploy` | `prisma migrate deploy` | Apply migrations in production |
| `db:studio` | `prisma studio` | DB GUI |
| `db:seed` | `prisma db seed` | Seed via `tsx prisma/seed.ts` |
| `db:reset` | `prisma migrate reset` | Reset DB state |

Prisma seeding is configured under the `prisma.seed` field pointing at `tsx prisma/seed.ts`.

## CI Pipeline (`.github/workflows/ci.yml`)

Two jobs run on every push/PR to `main`:

1. **quality** — checks out code, sets up Node 22 with npm cache, installs deps (`npm ci`), generates Prisma client, then runs `npm run typecheck`, `npm run lint`, and `npm test` (Vitest).
2. **e2e** — depends on `quality`; spins up a `postgres:16-alpine` service container (user/password/db = `timberland`); applies migrations (`npx prisma migrate deploy`) and seeds (`npm run db:seed`); runs `npm run build`; installs Playwright Chromium browsers; runs `npx playwright test`; uploads the `playwright-report/` artifact on failure (7-day retention).

Concurrency is scoped per `github.ref` with `cancel-in-progress: true`.

Environment variables required by the e2e job are set inline in the workflow:
- `DATABASE_URL=postgresql://timberland:timberland@localhost:5432/timberland?schema=public`
- `AUTH_SECRET=ci-only-secret-please-replace-000000`
- `AUTH_TRUST_HOST=true`
- `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- `NEXT_PUBLIC_DEFAULT_CURRENCY=USD`

## Local Development Stack

`docker-compose.yml` defines a single `db` service using `postgres:16-alpine`, exposing port 5432, with a named volume `timberland_pgdata` for persistence and a healthcheck using `pg_isready -U timberland -d timberland`.

The app's runtime environment is driven by `.env.example` (referenced but not shown here) and consumed via `lib/env.ts`.

## Build Conventions Observed

- Dependency installation uses `npm ci` in CI (lockfile-driven, reproducible).
- Prisma client generation is a mandatory step before both the local `build` script and the CI quality job.
- The build order in CI is strict: typecheck → lint → unit tests → (if passed) e2e with a real Postgres service.
- No Dockerfile or image build exists in this repo; deployment is assumed to be via Vercel/Next.js hosting given the Next.js project structure.
- Versioning is pinned at the package level (`package.json` version `0.1.0`, private) with no separate changelog or release automation in the repository.
- Tailwind v4 is integrated through `@tailwindcss/turbopack` and configured in `next.config.ts` under `turbopack.rules["*.css"]`.
- Tests are split into two layers: Vitest for unit logic (`tests/*.test.ts`) and Playwright for browser-based flows under `tests/e2e/`.