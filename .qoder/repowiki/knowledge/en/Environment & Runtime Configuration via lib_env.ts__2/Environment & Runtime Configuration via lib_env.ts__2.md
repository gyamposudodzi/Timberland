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
    - next.config.ts
    - lib/auth.config.ts
---

## Approach

The app uses a single, typed, server-only configuration module (`lib/env.ts`) that reads `process.env` and exposes a strongly-typed object. There is no runtime config file loader (no YAML/JSON/TOML parser); all external configuration comes from environment variables, documented in `.env.example`. Prisma's own schema also reads `DATABASE_URL` directly via its built-in `env()` function.

## Key files

- `lib/env.ts` — the central configuration reader; exported as `env` with getters for every variable.
- `.env.example` — the canonical list of required and optional env vars.
- `prisma/schema.prisma` — reads `DATABASE_URL` via `url = env("DATABASE_URL")`.
- `next.config.ts` — Next.js build/runtime config (Turbopack + Tailwind v4 loader).
- `lib/auth.config.ts` — Edge-safe Auth.js configuration merged at runtime by `lib/auth.ts`.
- `middleware.ts`, `lib/auth.ts`, `server/auth.actions.ts`, `lib/notifications.ts` — consumers of `lib/env`.

## Architecture and conventions

1. **Single source of truth** — Every environment variable is accessed through `lib/env.ts`. Consumers import `{ env } from "@/lib/env"`; direct `process.env` reads are not used elsewhere.
2. **Server-only boundary** — The module starts with `import "server-only"`, so it cannot be imported from client code. This enforces that secrets never leak into the browser bundle.
3. **Typed accessors** — Variables are exposed as getters on an `env` object rather than raw properties, allowing lazy evaluation and type inference. A local helper `str(name, fallback?)` throws if a required var is missing or empty; `optionalStr(name)` returns `string | undefined`.
4. **Required vs optional variables**:
   - Required: `DATABASE_URL`, `AUTH_SECRET` (throw if absent).
   - Optional with defaults: `NEXT_PUBLIC_APP_URL` (`http://localhost:3000`), `NEXT_PUBLIC_DEFAULT_CURRENCY` (`USD`).
   - Optional feature flags grouped as objects: `smtp` (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM`), `google` (`AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`).
5. **Feature-flag pattern** — Each optional group has a companion boolean getter (`emailEnabled`, `googleEnabled`) that checks whether the necessary keys are present. Callers gate functionality on these booleans rather than inspecting individual env vars.
6. **Public vs private vars** — Client-facing values use the `NEXT_PUBLIC_` prefix (e.g. `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_DEFAULT_CURRENCY`); secrets do not.
7. **Prisma integration** — The database URL is read by Prisma directly from `DATABASE_URL` in `schema.prisma`, independent of `lib/env.ts`.
8. **Auth config separation** — `lib/auth.config.ts` holds only Edge-compatible NextAuth configuration (providers array left empty) and is merged with the Node-side provider setup in `lib/auth.ts`, which imports `env` to inject Google OAuth credentials.
9. **Documentation convention** — `.env.example` mirrors the shape of `lib/env.ts`: each section is commented, shows defaults, and documents how to generate secrets (e.g. `openssl rand -base64 32` for `AUTH_SECRET`).

## Conventions and constraints

- All env reads go through `lib/env.ts`; there are no ad-hoc `process.env` accesses in application code (verified by grep across `.ts` files).
- Missing required env vars cause a thrown error at startup time (`Missing required environment variable: <name>`), making misconfiguration fail fast.
- Empty strings are treated the same as missing values by the `str` helper, so callers must explicitly set a value.
- Optional SMTP/Google settings are gated behind `emailEnabled` / `googleEnabled` booleans; when disabled the app degrades gracefully (console transport for email, Google provider omitted).
- `lib/env.ts` is guarded by `server-only`, preventing accidental client-side bundling of secrets.
- `next.config.ts` contains only build-time Next.js options (Turbopack rules for Tailwind v4); no runtime config lives there.