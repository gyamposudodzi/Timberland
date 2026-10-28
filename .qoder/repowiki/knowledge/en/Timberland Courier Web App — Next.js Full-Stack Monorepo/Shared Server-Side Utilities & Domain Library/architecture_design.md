Flat collection of single-purpose modules under `lib/` consumed by Next.js API routes and server components. Internal layering:
- Runtime bootstrap: `db.ts` exports a singleton `PrismaClient` reused across hot-reloads; `env.ts` is the single typed entry point to `process.env`, guarded by `server-only`.
- Auth: split into `auth.config.ts` (Edge-safe `NextAuthConfig` with JWT/session callbacks) and `auth.ts` (Node runtime that wires Credentials + optional Google provider via `next-auth`).
- Security primitives: `crypto.ts` wraps bcrypt hashing/verification and token generation/hashing.
- Input contracts: `validation.ts` defines Zod schemas per feature (signup, login, address, parcel, shipment, quote, notification prefs) and re-exports inferred TS types.
- Domain engines (pure, no DB/framework): `pricing.ts` computes quotes from zone/service rates; `zones.ts` maps postal-code prefixes to METRO/REGION/REMOTE codes; `tracking-number.ts` generates and validates Crockford Base32 tracking codes with a check character.
- Cross-cutting services: `notifications.ts` sends transactional emails via nodemailer (SMTP or jsonTransport fallback), honoring user preferences and logging every attempt; `rate-limit.ts` provides an in-memory fixed-window limiter designed to be swappable for Redis/Upstash.
- UI helpers: `utils.ts` exposes `cn` (clsx + tailwind-merge) and `Intl.NumberFormat`/`DateTimeFormat` formatters.
Dependency direction is one-way: domain engines depend only on stdlib; services depend on `env`/`db`; nothing in this module imports from page/route handlers.