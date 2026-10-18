---
kind: configuration_system
name: Environment & Runtime Configuration via lib/env.ts
category: configuration_system
scope:
    - '**'
source_files:
    - lib/env.ts
    - .env.example
    - prisma/schema.prisma
    - docker-compose.yml
    - lib/auth.config.ts
    - lib/db.ts
    - next.config.ts
---

## Approach

The app uses a **single, typed environment-access module** (`lib/env.ts`) as the sole entry point for all runtime configuration. There is no config file loader, YAML/JSON config store, or feature-flag framework — configuration comes exclusively from `process.env` (Next.js env vars), with defaults and validation centralized in one place.

## Key Files

- `lib/env.ts` — the only place that reads `process.env`; exports an `env` object plus an `Env` TypeScript type.
- `.env.example` — documents every required and optional variable; used by developers to bootstrap their local `.env`.
- `prisma/schema.prisma` — declares `datasource db { url = env("DATABASE_URL") }`, so Prisma also reads `DATABASE_URL` directly at migration/build time.
- `docker-compose.yml` — defines the Postgres container and its `POSTGRES_*` env vars (the runtime counterpart of `DATABASE_URL`).
- `next.config.ts` — Next.js build-time config (Turbopack + Tailwind v4 rules); not part of runtime env loading.
- `lib/auth.config.ts` — edge-safe NextAuth config merged later; does not import `lib/env.ts` on purpose (see convention below).
- `lib/db.ts` — Prisma client instantiation; reads `NODE_ENV` directly to toggle log levels.

## Architecture & Conventions

1. **Single source of truth for env access.** All env reads go through helpers in `lib/env.ts`:
   - `str(name, fallback?)` — throws `Error('Missing required environment variable: <name>')` when the var is undefined or empty string, unless a fallback is provided.
   - `optionalStr(name)` — returns `undefined` for missing/empty values.
   - The exported `env` object groups related variables into getters (`databaseUrl`, `authSecret`, `appUrl`, `defaultCurrency`, `smtp`, `google`, plus boolean flags `emailEnabled`, `googleEnabled`).

2. **Required vs optional distinction is explicit.** Required vars (`DATABASE_URL`, `AUTH_SECRET`) use `str()` with no fallback → startup failure if absent. Optional vars (`SMTP_*`, `EMAIL_FROM`, `AUTH_GOOGLE_*`) use `optionalStr()` and are gated behind computed booleans (`emailEnabled`, `googleEnabled`). Consumers check these flags before using the corresponding subsystems.

3. **Server-only boundary.** `lib/env.ts` starts with `import "server-only"`, enforcing that env access happens only on the server side (not in client bundles). This prevents accidental leakage of secrets like `AUTH_SECRET` or `SMTP_PASSWORD` to the browser.

4. **Edge-safe auth config separation.** `lib/auth.config.ts` explicitly avoids importing anything Node-only (including `lib/env.ts`) because it is consumed by `middleware.ts` (edge runtime) and merged into the full config in `lib/auth.ts`. Auth providers' credentials are read elsewhere in the Node-side auth setup.

5. **Prisma reads DATABASE_URL independently.** `prisma/schema.prisma` calls `env("DATABASE_URL")` directly, so Prisma CLI commands (`prisma migrate`, `prisma db seed`) resolve the DB URL without going through `lib/env.ts`.

6. **Docker Compose mirrors .env.example.** The Postgres service in `docker-compose.yml` sets `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` to match the default `DATABASE_URL` shown in `.env.example`, making local dev self-contained.

7. **Build-time vs runtime split.** `next.config.ts` holds Next.js/Tailwind build-time settings; runtime application configuration lives only in `lib/env.ts` + `.env*`. There is no separate runtime config file format.

## Conventions & Constraints

- Every env variable must be declared in `.env.example` (documented with comments indicating whether it is required or optional).
- New env variables should be added as getters on the `env` object in `lib/env.ts` rather than read directly from `process.env` elsewhere — this keeps the external surface explicit and testable (stated intent in the module's JSDoc comment).
- Required variables throw at access time if missing; there is no silent fallback for `DATABASE_URL` or `AUTH_SECRET`.
- Optional subsystems (SMTP email, Google OAuth) are disabled when their credential set is incomplete — consumers must check `env.emailEnabled` / `env.googleEnabled` before invoking them.
- `lib/env.ts` is guarded by `server-only`; importing it in client components will fail at build time.
- `lib/auth.config.ts` must not import Node-only modules (including `lib/env.ts`) because it runs in the Next.js Edge runtime; this is enforced by the module's own documentation comment.