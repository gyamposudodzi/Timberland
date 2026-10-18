---
kind: configuration_system
name: Environment-Based Configuration via Centralized `lib/env.ts`
category: configuration_system
scope:
    - '**'
source_files:
    - lib/env.ts
    - .env.example
    - lib/auth.config.ts
    - lib/db.ts
    - next.config.ts
---

## Approach

The application uses a plain **Node `process.env`-based configuration system** with a single typed accessor module. There is no runtime config file loader, YAML/JSON config parser, or feature-flag library — all settings come from environment variables (`.env*` files, Docker Compose, platform env).

## Key Files

- `lib/env.ts` — the sole configuration entry point; exports an `env` object with getters for every setting.
- `.env.example` — documents every required and optional variable with comments.
- `lib/auth.config.ts` — NextAuth v5 config merged into the app; kept edge-safe (no Node-only imports) and consumed by `middleware.ts` and `lib/auth.ts`.
- `next.config.ts` — Next.js build-time config (Turbopack + Tailwind v4); not runtime configuration.
- `docker-compose.yml` — provides `DATABASE_URL` to the DB service (application env is supplied by the host/platform).
- `prisma/schema.prisma` / `prisma/migrations/` — database schema and migrations are versioned in code, not external config.

## Architecture & Conventions

1. **Single source of truth**: All env reads go through `lib/env.ts`, which re-exports a single `env` object. Consumers import it via `import { env } from "@/lib/env"` (observed in `lib/auth.ts`, `lib/notifications.ts`, `server/auth.actions.ts`).
2. **Strict vs optional variables**: Two helper functions enforce the contract:
   - `str(name, fallback?)` — throws `Missing required environment variable: <name>` if the var is undefined or empty string; supports an optional default fallback.
   - `optionalStr(name)` — returns `undefined` when unset/empty.
3. **Grouped accessors**: Related vars are grouped under nested getters (`env.smtp`, `env.google`) with derived booleans (`emailEnabled`, `googleEnabled`) that gate optional features.
4. **Server-only boundary**: The module starts with `import "server-only"`, so it cannot be imported from client-side code — this enforces that secrets never leak to the browser bundle.
5. **Typed surface**: The module also exports `Env = typeof env`, giving consumers full TypeScript inference over available configuration keys.
6. **Feature flags via presence**: Optional capabilities (SMTP email, Google OAuth) are enabled purely by the presence of their credentials — there is no explicit boolean flag variable.
7. **NextAuth separation**: `lib/auth.config.ts` holds the edge-safe part of NextAuth config (session strategy, pages, callbacks). It does NOT read env directly; the full provider setup happens in `lib/auth.ts` after importing `env`.
8. **Prisma connection**: Database URL is read at runtime by Prisma itself via `DATABASE_URL`; `lib/db.ts` only controls logging verbosity based on `NODE_ENV`.

## Conventions & Constraints

- **All env access goes through `lib/env.ts`** — direct `process.env.X` reads outside this module are not used for application configuration (verified by grep across `.ts` files).
- **Required variables throw at load time** — missing `DATABASE_URL`, `AUTH_SECRET`, etc. cause an immediate error rather than failing later, as enforced by the `str()` helper.
- **Client-bundle protection** — `lib/env.ts` is guarded by `server-only`; importing it from a client component will fail at build/runtime.
- **Optional features gated by credential presence** — SMTP is disabled unless `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASSWORD` are all set; Google OAuth is disabled unless both `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are set.
- **Public vs secret naming**: Variables prefixed `NEXT_PUBLIC_` (`NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_DEFAULT_CURRENCY`) are intentionally exposed to the browser; secrets have no such prefix.
- **Defaults are provided inline** in `lib/env.ts` for non-secret values (e.g. `appUrl` defaults to `http://localhost:3000`, `defaultCurrency` to `USD`, SMTP port to `587`, `EMAIL_FROM` to `Timberland <no-reply@timberland.example>`).
- **No runtime config files** — there is no code that loads JSON/YAML/TOML config at runtime; configuration is exclusively env-driven.