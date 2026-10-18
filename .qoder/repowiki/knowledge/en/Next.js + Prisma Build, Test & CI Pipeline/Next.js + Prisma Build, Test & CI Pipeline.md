---
kind: build_system
name: Next.js + Prisma Build, Test & CI Pipeline
category: build_system
scope:
    - '**'
source_files:
    - package.json
    - .github/workflows/ci.yml
    - docker-compose.yml
    - playwright.config.ts
    - vitest.config.ts
---

## Build System Overview

The project is a Next.js 16 App Router application. There is no custom Makefile or shell build scripts — the entire build and test pipeline is driven by npm scripts in `package.json`, with GitHub Actions orchestrating CI.

### Toolchain
- **Runtime / framework**: Next.js 16.4.2 (App Router), React 19.3.0
- **Build tooling**: Turbopack via `@tailwindcss/turbopack` (Tailwind v4)
- **Database layer**: Prisma 6.19.3 with PostgreSQL 16 (`postgres:16-alpine`)
- **Unit testing**: Vitest 5.0.5 against `node` environment
- **E2E testing**: Playwright 1.64.1 targeting Chromium only
- **Linting**: ESLint 9 via `eslint-config-next`
- **Type checking**: TypeScript 5 (`tsc --noEmit`)
- **Seeding**: `tsx prisma/seed.ts` declared under `prisma.seed` in `package.json`

### Key npm Scripts (`package.json`)
- `dev` → `next dev`
- `build` → `prisma generate && next build` (Prisma client generation is a required pre-step before the Next.js build)
- `start` → `next start`
- `lint` → `eslint`
- `typecheck` → `tsc --noEmit`
- `test` → `vitest run`; `test:watch` → `vitest`
- `test:e2e` → `playwright test`; `test:e2e:ui` → `playwright test --ui`
- DB lifecycle: `db:generate`, `db:migrate`, `db:deploy`, `db:studio`, `db:seed`, `db:reset`

### CI Pipeline (`.github/workflows/ci.yml`)
Two jobs run on push to `main` and PRs targeting `main`, with concurrency cancellation per branch:

1. **quality** job (runs first):
   - Node 22, `npm ci`
   - `npx prisma generate`
   - `npm run typecheck`, `npm run lint`, `npm test`

2. **e2e** job (depends on `quality`):
   - Spins up a real PostgreSQL service container (`postgres:16-alpine`) with user/password/db `timberland` and a health check using `pg_isready`.
   - Applies migrations via `npx prisma migrate deploy` then seeds via `npm run db:seed`.
   - Runs `npm run build` (which triggers `prisma generate && next build`).
   - Installs Playwright Chromium with deps, runs `npx playwright test`.
   - Uploads `playwright-report/` as an artifact (7-day retention) on failure.

Environment variables for e2e: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST=true`, `NEXT_PUBLIC_APP_URL=http://localhost:3000`, `NEXT_PUBLIC_DEFAULT_CURRENCY=USD`.

### Local Development Database (`docker-compose.yml`)
A single `db` service exposes PostgreSQL 16 Alpine on port 5432 with persistent volume `timberland_pgdata`, matching the credentials used in CI (`timberland`/`timberland`/`timberland`). No application container is defined — the app is expected to run locally via `npm run dev`.

### Test Configuration Conventions
- **Vitest** (`vitest.config.ts`): node environment, includes `tests/**/*.test.ts`, root alias `@` pointing to repo root.
- **Playwright** (`playwright.config.ts`): tests live in `tests/e2e`, single worker, Chromium-only project, HTML reporter. The `webServer` hook runs `npm run build && npm run start` and reuses an existing server outside CI. Traces are captured on first retry; screenshots only on failure. `forbidOnly` is enforced in CI.

### Versioning & Artifacts
- Application version is `0.1.0` in `package.json` and marked `private: true` — there is no published package or Docker image step in CI.
- The only CI artifact produced is the Playwright HTML report.
- No release tags, changelog automation, or container registry publishing is present in this repository.