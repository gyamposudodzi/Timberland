---
kind: build_system
name: Next.js Build, Test & CI Pipeline
category: build_system
scope:
    - '**'
source_files:
    - package.json
    - .github/workflows/ci.yml
    - next.config.ts
    - vitest.config.ts
    - playwright.config.ts
    - docker-compose.yml
---

# Build System

## Approach
The project is a Next.js 16 application. There is no custom Makefile or shell build script — the entire build and test pipeline is driven by npm scripts in `package.json`, Prisma CLI commands, and GitHub Actions.

## Key Files
- `package.json` — defines all build/test/lint/typecheck/db scripts; pins Next.js 16.4.2, React 19.3.0, Prisma ^6.19.3, Vitest ^5.0.5, Playwright ^1.64.1.
- `.github/workflows/ci.yml` — single CI workflow with two jobs (`quality`, `e2e`).
- `next.config.ts` — enables Turbopack with Tailwind v4 via `@tailwindcss/turbopack` loader for CSS rules.
- `vitest.config.ts` — unit-test runner config (node environment, `tests/**/*.test.ts`, `@` alias to repo root).
- `playwright.config.ts` — E2E runner config (single Chromium project, webServer auto-builds + starts the app, traces on first retry, screenshots on failure).
- `docker-compose.yml` — local PostgreSQL service only (`postgres:16-alpine`, user/password/db = `timberland`, healthcheck via `pg_isready`).
- `prisma/schema.prisma` + `prisma/migrations/` — database schema and migrations managed by Prisma.

## Build Flow

### Local development
- `npm run dev` → `next dev`
- `npm run db:migrate` → `prisma migrate dev` (development migration)
- `npm run db:seed` → `tsx prisma/seed.ts` (via `prisma.seed` field)
- `npm run db:studio` → `prisma studio`
- `npm run db:reset` → `prisma migrate reset`

### Production build
- `npm run build` runs `prisma generate && next build` — Prisma client generation is a required step before the Next.js build.
- `npm run start` runs `next start`.
- `npm run typecheck` runs `tsc --noEmit`.
- `npm run lint` runs ESLint via `eslint.config.mjs`.

### Unit tests
- `npm run test` → `vitest run`
- `npm run test:watch` → `vitest`
- Tests live under `tests/*.test.ts` and run against the Node runtime (not jsdom).

### E2E tests
- `npm run test:e2e` → `playwright test`
- `npm run test:e2e:ui` → `playwright test --ui`
- Playwright's `webServer` hook builds and starts the app (`npm run build && npm run start`) automatically unless `CI=true`, in which case it reuses an existing server.
- Browser binaries are installed via `npx playwright install --with-deps chromium`.

## CI Pipeline (`.github/workflows/ci.yml`)
Two parallel stages, both on `ubuntu-latest` with Node 22 and cached npm:

1. **quality** job:
   - Checkout → setup Node 22 → `npm ci` → `npx prisma generate` → `npm run typecheck` → `npm run lint` → `npm test`.
   - Fails fast if any of these steps fail.

2. **e2e** job (depends on `quality`):
   - Spins up a `postgres:16-alpine` service container (user/password/db = `timberland`, health-checked via `pg_isready`).
   - Sets env vars: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST=true`, `NEXT_PUBLIC_APP_URL=http://localhost:3000`, `NEXT_PUBLIC_DEFAULT_CURRENCY=USD`.
   - Runs `npx prisma migrate deploy && npm run db:seed` to prepare the DB.
   - Runs `npm run build` (full production build).
   - Installs Playwright Chromium browsers.
   - Runs `npx playwright test`.
   - Uploads `playwright-report/` as artifact (7-day retention) on failure.

Concurrency is scoped per `github.ref` with `cancel-in-progress: true`.

## Docker
Only a Postgres service is defined in `docker-compose.yml`; there is no `Dockerfile` for the application itself. The compose file exposes port 5432 and persists data in the `timberland_pgdata` volume.

## Conventions & Constraints
- The `build` script always runs `prisma generate` before `next build`; skipping this step will cause the build to fail because the generated Prisma Client is not present.
- CI uses `npm ci` (locked dependency install), not `npm install`.
- The Node version is pinned to 22 in both CI and the project toolchain.
- Database access in tests and CI requires `DATABASE_URL` pointing at a running PostgreSQL instance; locally this is provided by `docker-compose up db`.
- E2E tests require the app to be built and running on `NEXT_PUBLIC_APP_URL` (default `http://localhost:3000`); Playwright's `webServer` handles this automatically except in CI where the workflow performs the build and seed steps explicitly.
- Prisma migrations are applied with `prisma migrate deploy` in CI (non-interactive, production mode) and `prisma migrate dev` locally.
- The app is marked `"private": true` in `package.json`, so it is not published to npm.