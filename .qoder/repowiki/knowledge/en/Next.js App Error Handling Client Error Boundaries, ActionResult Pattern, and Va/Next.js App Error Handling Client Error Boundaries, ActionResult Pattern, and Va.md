---
kind: error_handling
name: 'Next.js App Error Handling: Client Error Boundaries, ActionResult Pattern, and Validation-First Errors'
category: error_handling
scope:
    - '**'
source_files:
    - app/error.tsx
    - app/global-error.tsx
    - app/not-found.tsx
    - server/auth.actions.ts
    - server/shipment.actions.ts
    - server/ops.actions.ts
    - server/notification.actions.ts
    - lib/validation.ts
    - middleware.ts
---

## Approach

The codebase uses Next.js App Router error boundaries for UI-level failures and a uniform `ActionResult` shape for server-action (RSC) failures. There is no custom exception hierarchy, no global error-reporting middleware, and no centralized error-code enum — errors are represented as plain `Error` objects or structured result objects.

## Key files

- `app/error.tsx` — per-route client error boundary; logs via `console.error`, shows a user-friendly message with an optional `error.digest` reference, and exposes a `reset()` "Try again" button.
- `app/global-error.tsx` — root-level fallback when the entire tree fails; renders a minimal HTML page with a reload button and the same `digest` reference.
- `app/not-found.tsx` — 404 page rendered by Next.js when no route matches.
- `server/auth.actions.ts` — defines the shared `ActionResult` interface (`ok: boolean; error?: string; fieldErrors?: Record<string, string>`) used by every server action.
- `server/shipment.actions.ts`, `server/ops.actions.ts`, `server/notification.actions.ts` — consume `ActionResult` and extend it (e.g. `AdvanceResult extends ActionResult`).
- `lib/validation.ts` — all input validation lives here via Zod schemas; validation failures never throw but produce typed issues consumed by callers.
- `middleware.ts` — NextAuth edge middleware that guards `/account/:path*`; unauthenticated requests are redirected rather than returning an error response.

## Architecture and conventions

1. **Client-side errors**: Any React component that throws bubbles to `app/error.tsx`. The boundary prints the error to the console (with a comment indicating where to wire Sentry) and displays a generic "Something went wrong" message. A `ref:` line surfaces `error.digest` when available. `app/global-error.tsx` handles unrecoverable cases at the document level.

2. **Server actions return `ActionResult`**: Instead of throwing, server actions resolve to `{ ok: true }` on success or `{ ok: false, error: "...", fieldErrors? }` on failure. This is defined once in `auth.actions.ts` and re-exported/imported across `server/*.actions.ts`. Field-level validation errors from Zod are mapped into `fieldErrors` so forms can highlight individual inputs.

3. **Validation-first, no thrown validation errors**: All user input goes through Zod schemas in `lib/validation.ts`. Callers use `.safeParse()` and convert failures into `ActionResult` fields — they do not throw. This keeps server actions free of try/catch around parsing.

4. **Database / unique-constraint errors are inspected inline**: In `createWithUniqueTracking` (`server/shipment.actions.ts`), Prisma's `P2002` unique-constraint error is detected by inspecting `err.code === "P2002"` and retrying up to 5 times; any other error is re-thrown. After exhausting retries, a user-facing `throw new Error("Could not allocate a tracking number. Please try again.")` is raised.

5. **NextAuth redirect errors are preserved**: `loginAction` wraps `signIn` in try/catch and checks `err.digest?.startsWith("NEXT_REDIRECT")` before re-throwing — this lets Next.js handle its own redirect flow instead of treating it as a login failure.

6. **Fire-and-forget side effects swallow errors**: Calls to `notifyStatusChange` are chained with `.catch(() => {})` in both `shipment.actions.ts` and `ops.actions.ts`, making notification delivery failures non-fatal to the primary operation.

7. **Authorization errors are returned, not thrown**: Both customer and ops server actions check session/role early and return `{ ok: false, error: "You must be signed in…" }` or `{ ok: false, error: "You are not authorized…" }` rather than throwing.

8. **State-machine validation for ops**: `ops.actions.ts` validates status transitions using `canTransition(from, to)` from `lib/shipment-status` and returns a descriptive `Illegal transition: …` error when an invalid jump is attempted.

## Conventions and constraints

- Server actions consistently return the `ActionResult` shape (or an extension like `AdvanceResult`) rather than throwing domain errors — observed across `auth.actions.ts`, `shipment.actions.ts`, `ops.actions.ts`, `notification.actions.ts`.
- Input validation is performed exclusively via Zod schemas in `lib/validation.ts` using `.safeParse()`, and failures are translated into `fieldErrors` for form rendering — no `throw` paths around parsing were found.
- Unhandled exceptions bubble to `app/error.tsx` (per-route) or `app/global-error.tsx` (root); there is no custom error-reporting integration wired yet (the comment in `error.tsx` explicitly says "wire to an error reporter (Sentry etc.) in prod").
- Database constraint violations are handled by pattern-matching `err.code === "P2002"` on the raw Prisma error object — this is a local convention, not enforced by a type.
- NextAuth redirects are treated specially: only errors whose `digest` starts with `NEXT_REDIRECT` are re-thrown; all others are surfaced as login failures.
- External side effects (email notifications) are fire-and-forget and deliberately ignore errors via `.catch(() => {})` so they cannot fail the caller's transaction.