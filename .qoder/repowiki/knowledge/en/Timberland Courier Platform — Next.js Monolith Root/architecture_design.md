The root is a single Next.js 16 application; child modules are organized by concern rather than layer:
- `app_routes` declares file-system routes (public landing, guest tracking, authenticated account dashboard) that consume components from `components` and call server actions from `server_actions`.
- `server_actions` provides server-only APIs backed by Prisma (`prisma_schema`) and shared domain logic in `lib` (pricing engine, shipment state machine, tracking numbers, email).
- `middleware.ts` wraps NextAuth v5 with an edge-safe matcher on `/account/:path*`, gating the authenticated customer area defined in `app_routes`.
- `next.config.ts` enables Tailwind v4 via Turbopack for all CSS consumed by components and pages.
- `tsconfig.json` sets the `@/*` path alias so every child resolves shared modules uniformly.
- `docker-compose.yml` provisions PostgreSQL 16, which `prisma_schema` migrates against before the dev server starts.
- `tests` covers unit flows (Vitest) and browser E2E flows (Playwright) over the same route/action surface exposed to users.