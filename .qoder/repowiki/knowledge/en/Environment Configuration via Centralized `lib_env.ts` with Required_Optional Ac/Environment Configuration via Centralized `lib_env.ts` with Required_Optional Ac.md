---
kind: configuration_system
name: Environment Configuration via Centralized `lib/env.ts` with Required/Optional Accessors
category: configuration_system
scope:
    - '**'
source_files:
    - lib/env.ts
    - .env.example
    - next.config.ts
    - docker-compose.yml
    - lib/auth.config.ts
---

## Approach

The app uses a single, centralized environment loader at `lib/env.ts` that wraps `process.env` behind typed getters. There is no external config library (no zod-env, dotenv, etc.) — configuration is plain Node environment variables consumed only on the server side.

## Key Files

- `lib/env.ts` — the sole source of truth for runtime configuration; exports an `env` object and an `Env` type.
- `.env.example` — documents every supported variable with defaults and comments.
- `next.config.ts` — Next.js build-time configuration (Turbopack + Tailwind v4); not env-driven beyond what Next.js itself reads.
- `docker-compose.yml` — defines the PostgreSQL service and its `POSTGRES_*` environment variables used locally.
- `lib/auth.config.ts` — Edge-safe Auth.js configuration merged into the runtime auth setup in `lib/auth.ts`.

## Architecture and Conventions

1. **Server-only boundary.** `lib/env.ts` starts with `import "server-only"`, ensuring it cannot be imported from client-side code. All env access is intentionally server-side.

2. **Accessor helpers enforce presence.** Two helpers are used:
   - `str(name, fallback?)` — throws `Missing required environment variable: <name>` when the variable is undefined or empty, unless a fallback is provided.
   - `optionalStr(name)` — returns `undefined` for missing/empty values.

3. **Required vs optional variables are explicit per property:**
   - Required (no fallback): `DATABASE_URL`, `AUTH_SECRET`.
   - Optional with defaults: `NEXT_PUBLIC_APP_URL` (`http://localhost:3000`), `NEXT_PUBLIC_DEFAULT_CURRENCY` (`USD`), `SMTP_PORT` (`587`), `EMAIL_FROM` (`Timberland <no-reply@timberland.example>`).
   - Optional booleans derived from groups: `emailEnabled` is true only when `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASSWORD` are all set; `googleEnabled` requires both `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.

4. **Grouped configuration objects.** SMTP settings live under `env.smtp`, Google OAuth under `env.google`, keeping related vars together.

5. **Single import site pattern.** Consumers import `{ env }` from `@/lib/env` — observed in `lib/auth.ts`, `lib/notifcations.ts`, and `server/auth.actions.ts`. No other file reads `process.env` directly.

6. **Type safety.** The exported `Env` type (`export type Env = typeof env`) mirrors the shape of the `env` object, giving callers autocomplete and compile-time guarantees over the configuration surface.

7. **Feature flags as boolean getters.** Capability toggles (`emailEnabled`, `googleEnabled`) are computed properties rather than raw env vars, so consumers check capability instead of inspecting individual SMTP/OAuth keys.

8. **Public vs private split.** Variables prefixed `NEXT_PUBLIC_` (`NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_DEFAULT_CURRENCY`) are intended to be exposed to the browser by Next.js; non-prefixed ones (`DATABASE_URL`, `AUTH_SECRET`, `SMTP_*`, `AUTH_GOOGLE_*`) remain server-only.

9. **Local development via Docker Compose.** `docker-compose.yml` spins up a PostgreSQL container with `POSTGRES_USER=timberland`, `POSTGRES_PASSWORD=timberland`, `POSTGRES_DB=timberland`; `.env.example` points `DATABASE_URL` at `localhost:5432` to match.

## Conventions and Constraints

- **Rule: All environment variables must go through `lib/env.ts`.** Direct `process.env` reads elsewhere would bypass the required-variable checks and the `server-only` guard. This is enforced by the module's `import "server-only"` directive and the documented convention in the file's JSDoc comment: "Keeping every env read in one place makes the app's external surface explicit and testable."
- **Rule: Missing required variables fail fast at access time.** `str()` throws an error immediately when a required var is absent or empty string, rather than propagating undefineds downstream.
- **Rule: Optional features degrade gracefully.** Email and Google OAuth are opt-in; if their credentials are unset, the corresponding `*Enabled` getter returns false and the consuming code can skip that functionality (e.g., notifications falls back to console transport, as noted in the `lib/env.ts` comment).
- **Convention: New env vars should be added as a new accessor on the `env` object**, not scattered across modules, preserving the single-source-of-truth design.