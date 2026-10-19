---
kind: dependency_management
name: npm Dependency Management with Lockfile and CI Pinning
category: dependency_management
scope:
    - '**'
source_files:
    - package.json
    - package-lock.json
    - .github/workflows/ci.yml
---

## Approach

This Next.js monorepo uses **npm** as its package manager. Dependencies are declared in the root `package.json` and resolved/locked via `package-lock.json`. There is no vendoring, no private registry configuration (no `.npmrc`, no `GOPRIVATE` equivalent), and no workspace/multi-package setup — a single flat dependency graph.

## Key Files

- `package.json` — declares runtime dependencies (`next`, `react`, `@prisma/client`, `next-auth`, `zod`, `nodemailer`, etc.) and dev/test tooling (`vitest`, `playwright`, `eslint`, `prisma`, `tsx`).
- `package-lock.json` — deterministic lockfile committed to the repo; used by `npm ci` in CI for reproducible installs.
- `.github/workflows/ci.yml` — CI pipeline that pins Node.js to version 22 and runs `npm ci` for dependency installation.
- `docker-compose.yml` — defines the PostgreSQL service consumed at runtime but does not manage JS dependencies.

## Versioning Conventions Observed

- Runtime dependencies use caret ranges (e.g. `^6.19.3`, `^5.0.0-beta.32`, `^4`) allowing minor/patch updates within the semver range.
- Some peer/runtime packages are pinned exactly: `next` is `16.4.2`, `react` and `react-dom` are `19.3.0`, and `eslint-config-next` matches the Next.js version exactly.
- DevDependencies also use caret ranges broadly (`^5`, `^4`, `^22.x`), including major-version wildcards for TypeScript (`^5`), Tailwind (`^4`), and Prisma (`^6.19.3`).
- The project is marked `"private": true`, preventing accidental publication to npm.

## CI Integration

The GitHub Actions workflow (`.github/workflows/ci.yml`):
- Uses `actions/setup-node@v4` with `node-version: 22` and `cache: npm`.
- Installs dependencies via `npm ci` (not `npm install`), enforcing the lockfile for deterministic builds.
- Runs `npx prisma generate` before typecheck/lint/tests, and `npx prisma migrate deploy && npm run db:seed` before e2e tests.
- Installs Playwright browsers explicitly via `npx playwright install --with-deps chromium`.

## Constraints & Rules

- Deterministic installs are enforced in CI through `npm ci`, which requires `package-lock.json` to be present and up-to-date.
- No private registries or scoped authentication are configured; all packages resolve from the public npm registry.
- No vendored third-party code exists under `node_modules` or elsewhere in the tree.
- The build script `build` runs `prisma generate && next build`, coupling Prisma client generation into the dependency lifecycle.
- Database schema and migrations live under `prisma/schema.prisma` and `prisma/migrations/`, managed by Prisma CLI rather than npm scripts alone.