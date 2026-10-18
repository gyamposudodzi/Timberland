---
kind: error_handling
name: Next.js App Router Error Handling and Server Action Result Pattern
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
    - lib/validation.ts
    - lib/notifications.ts
    - lib/rate-limit.ts
---

## Approach

The Timberland Courier Delivery Platform uses Next.js App Router conventions for error presentation, combined with a lightweight result-object pattern in server actions. There is no custom error-class hierarchy, no centralized error-reporting SDK wired in yet, and no `try/catch`-based exception propagation across the stack.

### UI-level error boundaries (App Router)

Three file-system routes define user-facing error surfaces:

- `app/error.tsx` — per-route client error boundary. It logs the thrown `Error` to `console.error`, renders a friendly "Something went wrong" page, shows the Next.js-generated `error.digest` as a reference id, and offers a `reset()` button to re-render the route.
- `app/global-error.tsx` — root-level fallback when the entire app tree fails; it wraps `<html>/<body>` and provides a reload button.
- `app/not-found.tsx` — 404 handler rendered via Next.js's `not-found` convention, with links back to home and `/track`.

All three are minimal: they do not forward errors to Sentry or any external reporter. The comment in `app/error.tsx` explicitly marks this as a TODO: "wire to an error reporter (Sentry etc.) in prod."

### Middleware

`middleware.ts` delegates authentication to NextAuth via `NextAuth(authConfig)` and only guards the `/account/:path*` subtree. It does not implement its own error handling; auth failures are handled by NextAuth's built-in redirect behavior.

### Server action result pattern

Server actions in `server/auth.actions.ts` and `server/shipment.actions.ts` return a shared `ActionResult` interface:

```ts
export interface ActionResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}
```

Validation errors from Zod (`lib/validation.ts`) are converted into `{ ok: false, error, fieldErrors }` rather than being thrown. Examples:

- `signupAction`: returns `{ ok: false, error: "Please fix the highlighted fields", fieldErrors }` on schema failure, and `{ ok: false, error: "An account with that email already exists." }` for duplicate users.
- `createShipmentAction`: returns `{ ok: false, error: "Invalid parcel data." }` on JSON parse failure, `{ ok: false, error: "Selected service is unavailable." }` when a service level is missing, and similar user-facing messages for other business-rule violations.

This is the dominant error-propagation strategy at the application boundary: **return structured results instead of throwing**.

### Thrown errors

Where exceptions are used, they are narrow:

- `server/shipment.actions.ts:createWithUniqueTracking` retries up to 5 tracking-number candidates and catches Prisma unique-constraint errors by inspecting `err.code === "P2002"`. If all attempts collide, it throws `new Error("Could not allocate a tracking number. Please try again.")`.
- `server/auth.actions.ts:loginAction` wraps `signIn(...)` in `try/catch` and re-throws if the caught error has a `digest` starting with `NEXT_REDIRECT` (NextAuth's internal redirect signal), otherwise returning `{ ok: false, error: "Invalid email or password." }`.
- `lib/notifications.ts:notifyStatusChange` catches email delivery failures and persists them as a `NotificationLog` row with `status: "FAILED"` and the error message, then swallows the exception so the caller is unaffected.
- In `server/shipment.actions.ts`, the confirmation notification is fired-and-forget: `.catch(() => {})` silently drops errors.

There are no custom error classes, no sentinel error constants, and no global error interceptor.

### Validation layer

All user input is validated through Zod schemas in `lib/validation.ts` (`signupSchema`, `loginSchema`, `trackingNumberSchema`, `addressSchema`, `parcelSchema`, `shipmentSchema`, `quoteSchema`, `notificationPrefsSchema`). Validation failures produce Zod `ZodError` objects whose `.issues` are mapped to `fieldErrors` records consumed by the form components. This is the single source of truth for input validation errors.

### Rate limiting

`lib/rate-limit.ts` implements a fixed-window in-memory rate limiter returning a `RateLimitResult { allowed, remaining, retryAfterSec }`. It is designed as a drop-in replacement for a shared store (Redis/Upstash) but currently has no callers visible in the scanned files.

## Key Files

- `app/error.tsx` — per-route error boundary
- `app/global-error.tsx` — root error boundary
- `app/not-found.tsx` — 404 page
- `middleware.ts` — NextAuth edge middleware (auth-gating only)
- `server/auth.actions.ts` — `ActionResult` definition + login/signup error handling
- `server/shipment.actions.ts` — Prisma P2002 collision retry + fire-and-forget notification swallowing
- `lib/validation.ts` — Zod schemas producing field-level validation errors
- `lib/notifications.ts` — fire-and-forget error logging to `NotificationLog`
- `lib/rate-limit.ts` — structured rate-limit result type

## Conventions Observed

1. **User-facing errors in server actions are returned as `{ ok: false, error, fieldErrors? }`**, not thrown. This is enforced by the `ActionResult` interface and the shape of every exported action in `server/auth.actions.ts` and `server/shipment.actions.ts`.
2. **Input validation goes exclusively through Zod schemas in `lib/validation.ts`**; business logic branches off `parsed.success` rather than using `throw` for invalid input.
3. **Database constraint collisions are detected by inspecting `err.code === "P2002"`** (Prisma error code) and retried, not surfaced to the user.
4. **Side-effect calls (email notifications) are fire-and-forget**: failures are logged to `NotificationLog` with `status: "FAILED"` and swallowed via `.catch(() => {})` so they cannot break the primary flow.
5. **NextAuth redirect signals (`NEXT_REDIRECT` digest) are re-thrown** so Next.js can perform the redirect; all other `signIn` errors become user-friendly strings.
6. **UI error pages render `error.digest` as a reference id** but do not forward it to any external telemetry service — the comment in `app/error.tsx` documents this as future work.
7. **No custom error class hierarchy exists** — there are no `class X extends Error` definitions and no sentinel error constants anywhere in the repository.