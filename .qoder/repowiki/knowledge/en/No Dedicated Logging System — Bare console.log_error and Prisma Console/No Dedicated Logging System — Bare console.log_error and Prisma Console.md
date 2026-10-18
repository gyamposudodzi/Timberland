---
kind: logging_system
name: No Dedicated Logging System — Bare console.log/error and Prisma Console
category: logging_system
scope:
    - '**'
source_files:
    - app/error.tsx
    - prisma/seed.ts
    - server/auth.actions.ts
    - server/quote.actions.ts
    - server/shipment.actions.ts
    - server/ops.actions.ts
    - package.json
---

## What system/approach is used

The Timberland monorepo has **no dedicated logging framework or logger abstraction**. There is no `log/` or `logging/` directory, no logger initialization file, and no third-party logging dependency (no Winston, Pino, Bunyan, log4js, Sentry, etc.) in `package.json`. All output goes through:

- Node.js `console.log` / `console.error` for informational and error output.
- Next.js built-in request/response logging (the dev server prints HTTP requests/responses automatically).
- Prisma's default console logging via `prisma db seed` / `prisma migrate`.

The only place that logs an application error object is `app/error.tsx`, which calls `console.error(error)` on the client side with a comment: `// Surface to the console; wire to an error reporter (Sentry etc.) in prod.` — indicating the intent to add an error-reporting sink later, but none exists yet.

## Key files and packages

- `app/error.tsx` — the sole place where an application error is logged (`console.error`).
- `prisma/seed.ts` — uses `console.log` to print seed results and `console.error(e)` for seeding failures.
- `server/*.ts` — server actions/services use `try/catch` blocks but do not log caught exceptions; they rethrow or swallow them (see conventions below).
- `package.json` — confirms no logging library is declared as a dependency.

## Architecture and conventions

1. **No structured logging.** Log messages are plain strings interpolated into `console.log`; there are no log levels, no contextual fields, no JSON-formatted records.
2. **Error swallowing without logging.** Several async notification calls intentionally suppress errors by chaining `.catch(() => {})` rather than logging them:
   - `server/ops.actions.ts:L79`: `notifyStatusChange({ shipmentId, eventId: event.id }).catch(() => {});`
   - `server/shipment.actions.ts:L141`: `notifyStatusChange({ shipmentId: createdEvent.shipmentId, eventId: createdEvent.id }).catch(() => {});`
3. **Caught exceptions are rethrown, not logged.** In `server/auth.actions.ts`, `server/quote.actions.ts`, and `server/shipment.actions.ts`, `catch (err) { throw err; }` rethrows the original error after optional cleanup — the caller (Next.js server action runtime) surfaces it, but no log line is emitted at the catch site.
4. **Client-side error reporting is a TODO.** The comment in `app/error.tsx` explicitly marks wiring an error reporter (e.g. Sentry) as future work.
5. **Prisma seed script** is the only other place that emits user-facing console output, printing login credentials and tracking numbers after seeding.

## Conventions and constraints

- **Observed convention:** Application code does not import or configure any logger; all diagnostics go through `console.*`.
- **Observed convention:** Error paths in server actions either rethrow the exception or silently swallow it (notification fire-and-forget calls), with no intermediate log statement.
- **Rule enforced by absence of dependencies:** No logging library is installed; adding one requires an explicit `npm install` and configuration step — there is no pre-existing logger API to call.
- **Rule stated in code:** `app/error.tsx` documents the plan to "wire to an error reporter (Sentry etc.) in prod", making the current `console.error` a temporary placeholder.