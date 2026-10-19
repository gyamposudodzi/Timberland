---
kind: error_handling
name: Next.js App Router Error Boundaries + Typed ActionResult Pattern
category: error_handling
scope:
    - '**'
source_files:
    - app/error.tsx
    - app/global-error.tsx
    - app/not-found.tsx
    - middleware.ts
    - server/auth.actions.ts
    - server/quote.actions.ts
    - server/shipment.actions.ts
    - lib/validation.ts
---

## Approach

The codebase uses Next.js App Router error boundaries for UI-level errors and a typed `ActionResult` / discriminated-union return pattern for server actions, with Zod-driven input validation as the primary guardrail. There is no custom error class hierarchy, no centralized error middleware, and no structured error-code system.

## Key Files

- `app/error.tsx` — per-route client error boundary; logs via `console.error`, shows a generic "Something went wrong" page, and exposes `error.digest` as a reference id.
- `app/global-error.tsx` — root-level fallback when the entire tree fails; renders a minimal HTML shell with a reload button.
- `app/not-found.tsx` — 404 page rendered by Next's built-in not-found mechanism.
- `middleware.ts` — NextAuth edge middleware that only guards `/account/*`; unmatched routes pass through untouched (no auth-related error handling here).
- `server/auth.actions.ts` — defines the shared `ActionResult` interface (`ok: boolean; error?: string; fieldErrors?: Record<string,string>`), used by all server actions.
- `server/quote.actions.ts` — defines a local discriminated union `QuoteResult = { ok: true; quote } | { ok: false; error }`.
- `lib/validation.ts` — central Zod schemas (`signupSchema`, `loginSchema`, `shipmentSchema`, `quoteSchema`, etc.) consumed by every action for input validation.

## Architecture & Conventions

1. **Server actions never throw user-facing errors.** They return a typed result object with `ok: true/false`. Validation failures map Zod issues into `fieldErrors` keyed by field name so the form can highlight them (see `auth.actions.ts` signup/login/reset flows). Business failures return `{ ok: false, error: <string> }`.

2. **Only unexpected/internal failures bubble up as thrown `Error`s.** Examples:
   - `createWithUniqueTracking` retries on Prisma unique-constraint `P2002` and throws a plain `Error("Could not allocate a tracking number. Please try again.")` after exhausting candidates.
   - `loginAction` wraps `signIn` in try/catch and re-throws if the caught error has a `digest` starting with `NEXT_REDIRECT` (Next's internal redirect signal); otherwise it returns `{ ok: false, error: "Invalid email or password." }`.

3. **Fire-and-forget side effects swallow failures silently.** Calls like `notifyStatusChange(...).catch(() => {})` are intentionally fire-and-forget; notification delivery failure does not affect the shipment creation outcome.

4. **Input validation is centralized in Zod schemas** under `lib/validation.ts`. Every server action validates its `FormData`/input against the relevant schema before touching the database. Invalid input yields a structured `{ ok: false, fieldErrors }` response rather than throwing.

5. **UI error surfaces are Next.js conventions:**
   - `app/error.tsx` catches route-level errors and calls `reset()` to retry.
   - `app/global-error.tsx` catches app-wide errors and offers a hard reload.
   - `app/not-found.tsx` handles 404s.
   - The comment in `error.tsx` explicitly says "wire to an error reporter (Sentry etc.) in prod", indicating error reporting is planned but not yet implemented.

6. **No custom error types or sentinel values.** Errors are either plain `Error` instances (thrown) or strings inside `ActionResult.error` fields. There are no classes extending `Error`, no error codes, and no `errors/` directory.

7. **Middleware does not perform error handling.** It only enforces authentication via NextAuth's `authorized` callback and lets unauthenticated requests be handled by the route/page logic.

## Conventions & Constraints

- Server actions return a typed result object (`ActionResult` or a local discriminated union like `QuoteResult`) instead of throwing for expected business failures — enforced by the shape of every exported action function.
- Input validation goes through Zod `.safeParse()` first; invalid data produces `{ ok: false, fieldErrors }` with messages derived from schema constraints — enforced by the consistent pattern across `auth.actions.ts`, `shipment.actions.ts`, and `quote.actions.ts`.
- Database-level uniqueness collisions are detected by checking `err.code === "P2002"` and retried — observed in `createWithUniqueTracking`.
- Redirects from NextAuth (`NEXT_REDIRECT` digest) are preserved and re-thrown rather than converted to a user error — enforced in `loginAction`'s catch block.
- Fire-and-forget async work (e.g., notifications) attaches `.catch(() => {})` to avoid surfacing non-critical failures to the caller — observed in `ops.actions.ts` and `shipment.actions.ts`.
- Route-level errors surface `error.digest` as a human-readable reference id in both `app/error.tsx` and `app/global-error.tsx`.