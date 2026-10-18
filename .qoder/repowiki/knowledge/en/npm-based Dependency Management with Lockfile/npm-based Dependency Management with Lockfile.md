---
kind: dependency_management
name: npm-based Dependency Management with Lockfile
category: dependency_management
scope:
    - '**'
source_files:
    - package.json
    - package-lock.json
    - next.config.ts
---

## System Overview

This Next.js project uses **npm** as its package manager. Dependencies are declared in `package.json` and resolved/locked via `package-lock.json`. There is no vendoring, private registry configuration, or custom dependency resolution strategy beyond npm defaults.

## Key Files

- `package.json` — declares runtime dependencies, devDependencies, scripts, and the Prisma seed entry point.
- `package-lock.json` — npm lockfile pinning exact transitive dependency versions for reproducible installs.
- `next.config.ts` — configures Tailwind v4 via Turbopack (`@tailwindcss/turbopack` loader rule).
- `tsconfig.json`, `eslint.config.mjs`, `vitest.config.ts`, `playwright.config.ts` — tooling configs that depend on devDependencies but do not alter dependency resolution.

## Approach and Conventions

### Package Manager
- npm is used (evidenced by `package-lock.json`). No yarn/pnpm lockfiles exist.
- The `build` script runs `prisma generate && next build`, so Prisma client generation is part of the build pipeline.
- Scripts cover development (`dev`), building (`build`), serving (`start`), linting (`lint`), typechecking (`typecheck`), unit testing (`test` / `test:watch`), E2E testing (`test:e2e` / `test:e2e:ui`), and database operations (`db:*`).

### Version Pinning Strategy
- Runtime dependencies use caret ranges (`^`) to allow compatible minor/patch updates (e.g. `"next": "16.4.2"`, `"react": "19.3.0"`, `"zod": "^4.6.7"`).
- DevDependencies also use caret ranges (e.g. `"@types/node": "^22.20.5"`, `"eslint": "^9"`, `"vitest": "^5.0.5"`).
- Some packages are pinned exactly (no caret): `next` at `16.4.2` and `eslint-config-next` at `16.4.2`, ensuring the Next.js app and its ESLint config stay in lockstep.
- React and ReactDOM are pinned exactly at `19.3.0` to avoid peer-dependency mismatches.

### Dependency Categories
- **Runtime**: Next.js 16, React 19, Prisma client, NextAuth v5 beta, Zod v4, bcryptjs, nodemailer, lucide-react, class-variance-authority, clsx, tailwind-merge, plus `client-only` and `server-only` markers for server/client boundaries.
- **Dev**: Playwright, Prisma CLI, TypeScript, Vitest, ESLint + Next preset, Tailwind CSS v4, tsx (for Prisma seeding), Node types, React types, Nodemailer types, BcryptJS types.

### Tooling Integration
- Prisma is integrated both as a runtime dependency (`@prisma/client`) and a dev dependency (`prisma`), with the schema under `prisma/schema.prisma` and migrations under `prisma/migrations/`.
- Tailwind CSS v4 is configured via `@tailwindcss/turbopack` in `next.config.ts` rather than the legacy PostCSS setup.
- The Prisma seed file is registered in `package.json` under `prisma.seed = "tsx prisma/seed.ts"`, using `tsx` from devDependencies to run TypeScript directly.

### No Private Registries or Vendoring
- No `.npmrc`, `yarn.lock`, `pnpm-lock.yaml`, `vendor/`, or `node_modules/` committed to the repo (only `package-lock.json` is present).
- No `GOPRIVATE`, `registry`, or private registry URL configuration was found.
- All third-party packages come from the default npm registry.

### Constraints Enforced by Tooling
- `tsc --noEmit` (via `npm run typecheck`) enforces TypeScript compilation against the declared `typescript` version.
- `eslint` (via `npm run lint`) enforces code quality rules defined in `eslint.config.mjs` and `eslint-config-next`.
- `vitest` runs unit tests; `playwright test` runs E2E tests — both driven by their respective devDependencies.