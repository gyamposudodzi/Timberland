---
kind: configuration_system
name: Environment-Based Configuration via Centralized `lib/env.ts`
category: configuration_system
scope:
    - '**'
source_files:
    - lib/env.ts
    - .env.example
    - lib/db.ts
    - lib/auth.config.ts
    - next.config.ts
    - playwright.config.ts
    - vitest.config.ts
---

## Approach

The app uses a plain **Node.js environment-variable** configuration strategy with a single typed accessor module. There is no config file parser, YAML/JSON settings loader, or feature-flag library — runtime behavior is driven entirely by `process.env`, validated at import time.

## Key Files

- `lib/env.ts` — the sole configuration entry point; exports an `env` object whose getters wrap `process.env` values with required/optional semantics and type-safe grouping (`databaseUrl`, `authSecret`, `appUrl`, `defaultCurrency`, `smtp`, `google`).
- `.env.example` — documents every supported variable (DATABASE_URL, AUTH_SECRET, NEXT_PUBLIC_* variables, SMTP_*, EMAIL_FROM, AUTH_GOOGLE_*).
- `next.config.ts` — Next.js build-time config (Turbopack + Tailwind v4 rules); no env reads here.
- `playwright.config.ts` / `vitest.config.ts` — test harness configs that read `NEXT_PUBLIC_APP_URL` from env to target the running server.
- `lib/db.ts` — Prisma client instantiation; reads `NODE_ENV` only to tune log levels.
- `lib/auth.config.ts` — Edge-safe NextAuth config merged into the full auth setup in `lib/auth.ts`; deliberately avoids Node-only imports so it can be consumed by `middleware.ts`.

## Architecture & Conventions

1. **Single source of truth**: All env reads go through `lib/env.ts`. Consumers import `{ env } from "@/lib/env"` (used by `lib/auth.ts`, `lib/notifications.ts`, `server/auth.actions.ts`). Direct `process.env` access outside this module is not used for application configuration.

2. **Required vs optional variables**: Two helper functions enforce the contract:
   - `str(name, fallback?)` throws `Missing required environment variable: <name>` if the var is undefined or empty (no fallback provided). Used for `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_DEFAULT_CURRENCY`.
   - `optionalStr(name)` returns `undefined` when missing/empty. Used for `SMTP_HOST/PORT/USER/PASSWORD`, `EMAIL_FROM`, `AUTH_GOOGLE_ID/SECRET`.

3. **Grouped configuration objects**: Related vars are exposed as nested getters returning plain objects (`env.smtp`, `env.google`), keeping consumers decoupled from raw env key names.

4. **Computed flags**: Boolean toggles are derived from groups rather than separate env vars:
   - `env.emailEnabled` = `Boolean(host && user && password)` from `env.smtp`.
   - `env.googleEnabled` = `Boolean(id && secret)` from `env.google`.
   This lets downstream code (e.g., `lib/notifications.ts`) conditionally enable features without reading individual keys.

5. **Server-only boundary**: `lib/env.ts` starts with `import "server-only"`, preventing accidental client-side bundling of secrets. The comment states the intent: "Keeping every env read in one place makes the app's external surface explicit and testable."

6. **Public vs private split**: Variables prefixed `NEXT_PUBLIC_` are intended for the browser bundle (`appUrl`, `defaultCurrency`); non-prefixed ones (`DATABASE_URL`, `AUTH_SECRET`, SMTP creds) are server-only.

7. **Defaults**: Required vars have no defaults (they throw on absence). Optional vars use sensible defaults inside the getter (e.g., `SMTP_PORT` defaults to `587`, `EMAIL_FROM` defaults to `Timberland <no-reply@timberland.example>`).

8. **Test configuration**: E2E tests in `playwright.config.ts` derive `BASE_URL` from `process.env.NEXT_PUBLIC_APP_URL ?? http://localhost:3000` and start the built Next.js server via `npm run build && npm run start`. Unit tests via Vitest (`vitest.config.ts`) run in `node` environment with an `@` path alias pointing to the repo root.

9. **Prisma logging**: `lib/db.ts` reads `process.env.NODE_ENV` directly (not via `env.ts`) to set Prisma log levels — `warn,error` in development, `error` otherwise — and caches the singleton on `globalThis` to avoid connection leaks across hot reloads.

## Conventions & Rules

- **Rule (enforced by code)**: Any required environment variable accessed via `env.str()` that is absent or empty causes a thrown `Error` at import time, failing startup before any request is handled.
- **Rule (enforced by code)**: `lib/env.ts` is guarded by `import "server-only"`; importing it from a client component will fail at build/runtime.
- **Convention**: New configuration should be added as a new getter on the exported `env` object in `lib/env.ts`, using `str()` for required values and `optionalStr()` for optional ones, with grouped objects for related settings.
- **Convention**: Feature toggles are expressed as boolean getters derived from groups (see `emailEnabled`, `googleEnabled`) rather than ad-hoc env checks scattered across modules.
- **Convention**: Optional integrations (SMTP email, Google OAuth) degrade gracefully — the app continues to function without them, as documented in `.env.example` comments and enforced by the `emailEnabled` / `googleEnabled` flags.