---
kind: error_handling
name: Next.js App Router Error Boundaries, ActionResult Pattern, and Throw-Based Business Errors
category: error_handling
scope:
    - '**'
source_files:
    - app/error.tsx
    - app/global-error.tsx
    - app/not-found.tsx
    - middleware.ts
    - server/auth.actions.ts
    - server/shipment.actions.ts
    - lib/env.ts
    - lib/rating.ts
---

## Approach

The codebase uses Next.js App Router's built-in error boundary system for UI-level errors and a local `ActionResult` pattern for server action failures. There is no custom error class hierarchy, sentinel-error module, or centralized error-reporting SDK wired in yet.

## Key Files

- `app/error.tsx` — per-route client error boundary; logs the error to `console.error`, renders a "Something went wrong" page with a `Try again` button that calls `reset()`, and surfaces `error.digest` as a reference id.
- `app/global-error.tsx` — root-level error boundary (wraps `<html>`/`<body>`); same minimal message plus a `Reload` button.
- `app/not-found.tsx` — custom 404 page rendered when no route matches.
- `middleware.ts` — edge-safe NextAuth middleware guarding `/account/:path*`; unmatched routes pass through untouched.
- `server/auth.actions.ts` — defines the shared `ActionResult` interface (`ok: boolean; error?: string; fieldErrors?: Record<string, string>`) used by all server actions.
- `server/shipment.actions.ts` — example of the `ActionResult` return shape and of throwing domain errors.
- `lib/env.ts` — typed env accessor that throws on missing required variables.
- `lib/rating.ts` — throws descriptive `Error`s for incomplete pricing configuration.

## Architecture and Conventions

1. **UI errors are handled by Next.js boundaries.**
   - Route-level errors surface via `app/error.tsx`. The component receives `Error & { digest?: string }` and a `reset` function. It logs to the console and offers a retry button.
   - Global fallbacks are handled by `app/global-error.tsx`, which re-renders the full document shell.
   - Missing routes render `app/not-found.tsx`, which links back to home and to `/track`.

2. **Server actions return structured results instead of throwing for user-facing failures.**
   - All server actions share the `ActionResult` type from `server/auth.actions.ts`: `{ ok: boolean; error?: string; fieldErrors?: Record<string, string> }`.
   - Validation failures (Zod `safeParse`) map `parsed.error.issues` into `fieldErrors` keyed by field name, then return `{ ok: false, error: "Please fix the highlighted fields", fieldErrors }`.
   - Auth/business failures return `{ ok: false, error: <user-message> }` (e.g., "You must be signed in to create a shipment.", "Selected service is unavailable.").
   - This lets React Server Components display field-level errors without an error boundary.

3. **Unexpected / unrecoverable errors are thrown as plain `Error` objects.**
   - `lib/env.ts` throws `new Error(`Missing required environment variable: ${name}`)` when a required env var is absent.
   - `lib/rating.ts` throws `new Error("Pricing configuration is incomplete...")` and `new Error(`No rate configured for zone ${zone.code} / ${serviceLevel.code}.`)`.
   - `server/shipment.actions.ts` retries up to 5 tracking-number allocations and finally throws `new Error("Could not allocate a tracking number. Please try again.")` after exhausting candidates.
   - These thrown errors bubble to the Next.js error boundary and are surfaced to the user via `app/error.tsx`.

4. **Next.js redirect exceptions are explicitly preserved.**
   - In `loginAction`, the `try/catch` around `signIn` checks `err instanceof Error && "digest" in err && String(err.digest).startsWith("NEXT_REDIRECT")` and re-throws it, so successful logins still redirect rather than returning `{ ok: true }`.

5. **Fire-and-forget side effects swallow errors.**
   - `notifyStatusChange(...).catch(() => {})` is used twice (`ops.actions.ts`, `shipment.actions.ts`) so notification delivery failures do not abort the primary flow.

6. **Middleware-based access control.**
   - `middleware.ts` exposes NextAuth's `auth` as the default export and applies it only to `/account/:path*` via the matcher. Authorization decisions live in `authConfig.authorized` (in `lib/auth.config.ts`).

7. **No custom error taxonomy.**
   - There is no dedicated `errors/` directory, no custom error classes extending `Error`, no error-code enum, and no centralized error-reporting integration (the comment in `app/error.tsx` says "wire to an error reporter (Sentry etc.) in prod").

## Conventions and Constraints

- Server actions return `ActionResult` (or a union extending it) for normal success/failure paths; they throw `Error` only for unexpected/unrecoverable conditions.
- Zod validation failures are converted to `fieldErrors` keyed by field path before being returned, so form components can highlight individual inputs.
- User-visible error messages are short strings embedded directly in the action return value; technical details are not exposed to the client.
- The `error.digest` property from Next.js is logged and displayed as a reference id in both `app/error.tsx` and `app/global-error.tsx`.
- Required environment variables are enforced at import time via `lib/env.ts`; missing values cause an immediate `throw new Error`, failing fast during server startup.
- Authentication redirects are treated as exceptional control flow and re-thrown rather than caught and converted to a result object.