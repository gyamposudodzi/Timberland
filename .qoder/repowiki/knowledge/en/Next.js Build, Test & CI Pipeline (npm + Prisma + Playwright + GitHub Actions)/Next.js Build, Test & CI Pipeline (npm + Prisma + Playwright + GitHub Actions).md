---
kind: build_system
name: Next.js Build, Test & CI Pipeline (npm + Prisma + Playwright + GitHub Actions)
category: build_system
scope:
    - '**'
source_files:
    - package.json
    - .github/workflows/ci.yml
    - playwright.config.ts
    - vitest.config.ts
    - docker-compose.yml
---

## Build System Overview

This is a Next.js 16 application. The build system is centered on `package.json` scripts, with Prisma for database schema management, Vitest for unit tests, Playwright for end-to-end tests, and GitHub Actions for CI.

### Toolchain
- **Runtime / framework**: Node.js 22 (enforced by CI), Next.js 16.4.2, React 19.
- **Build**: `next build` (Turbopack via `@tailwindcss/turbopack`).
- **Database**: Prisma 6 (`prisma generate`, `prisma migrate deploy`, `prisma db seed` via `tsx prisma/seed.ts`).
- **Unit testing**: Vitest 5 in `node` environment, test files under `tests/**/*.test.ts`.
- **E2E testing**: Playwright 1.64 against a real built server + seeded PostgreSQL.
- **Linting**: ESLint 9 via `eslint-config-next`.
- **Type checking**: `tsc --noEmit`.
- **Containerization**: Docker Compose only for the PostgreSQL dependency; no application Dockerfile exists.

### Key Scripts (`package.json`)
| Script | Command | Purpose |
|---|---|---|
| `dev` | `next dev` | Development server |
| `build` | `prisma generate && next build` | Generates Prisma client then builds the app |
| `start` | `next start` | Production server |
| `lint` | `eslint` | Linting |
| `typecheck` | `tsc --noEmit` | Type checking |
| `test` | `vitest run` | Unit tests |
| `test:watch` | `vitest` | Watch mode |
| `test:e2e` | `playwright test` | E2E tests |
| `test:e2e:ui` | `playwright test --ui` | Interactive E2E UI |
| `db:generate` | `prisma generate` | Generate Prisma client |
| `db:migrate` | `prisma migrate dev` | Dev migration |
| `db:deploy` | `prisma migrate deploy` | Prod migration |
| `db:studio` | `prisma studio` | DB GUI |
| `db:seed` | `prisma db seed` | Seed data |
| `db:reset` | `prisma migrate reset` | Reset DB |

Prisma seeding is configured via the `prisma.seed` field pointing at `tsx prisma/seed.ts`, so seed scripts are TypeScript.

### CI Pipeline (`.github/workflows/ci.yml`)
Two jobs run on push/PR to `main`, with concurrency cancellation per branch:

1. **`quality` job** — runs on `ubuntu-latest` with Node 22:
   - `npm ci`
   - `npx prisma generate`
   - `npm run typecheck`
   - `npm run lint`
   - `npm test`

2. **`e2e` job** — depends on `quality`, spins up a `postgres:16-alpine` service container with user/password/db `timberland`, then:
   - `npm ci`
   - `npx prisma migrate deploy && npm run db:seed`
   - `npm run build`
   - `npx playwright install --with-deps chromium`
   - `npx playwright test`
   - Uploads `playwright-report/` as artifact on failure (7-day retention).

Environment variables set for e2e: `DATABASE_URL=postgresql://timberland:timberland@localhost:5432/timberland?schema=public`, `AUTH_SECRET=ci-only-secret-please-replace-000000`, `AUTH_TRUST_HOST=true`, `NEXT_PUBLIC_APP_URL=http://localhost:3000`, `NEXT_PUBLIC_DEFAULT_CURRENCY=USD`.

### Local E2E Execution
`playwright.config.ts` defines a `webServer` that auto-runs `npm run build && npm run start` before tests, listening on port 3000. In CI it uses `reuseExistingServer: false`; locally it reuses an existing server. Tests run single-worker (`workers: 1`, `fullyParallel: false`) against Chromium only. Screenshots are captured only on failure; traces are recorded on first retry.

### Database Setup
- `docker-compose.yml` provisions a local `postgres:16-alpine` service named `timberland-db` on port 5432 with persistent volume `timberland_pgdata` and a healthcheck using `pg_isready -U timberland -d timberland`.
- No application Dockerfile or multi-stage build exists — the app is not containerized itself.

### Versioning
The package version is hardcoded as `"0.1.0"` in `package.json` with `"private": true`. There is no automated release script, changelog tooling, or tag-based publish flow visible.

### Conventions Observed
- Prisma client generation is always run before building (`prisma generate` is part of the `build` script and the CI quality job).
- E2E tests require a running Postgres instance (local via docker-compose, CI via GitHub Actions service container) and a seeded database.
- All CI steps use `npm ci` (not `npm install`) for reproducible installs.
- Node version is pinned to 22 in CI via `actions/setup-node`.
- E2E tests target a built-and-started Next.js server rather than a mock.