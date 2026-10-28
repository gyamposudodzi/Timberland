Components are organized by feature area under `components/` with a clear layering:
- `ui/` — framework-agnostic base primitives (Button, Input, Select, Textarea, Field, Alert, Badge, Card, Spinner) built on Tailwind + class-variance-authority; these have no business logic and are consumed everywhere.
- `layout/` — application chrome (`SiteHeader`, `SiteFooter`, `UserMenu`) that composes primitives and integrates with Next.js routing and the auth session via `@/lib/auth`.
- Feature folders (`auth/`, `account/`, `tracking/`, `quote/`, `shipment/`, `ops/`) — page-level or route-scoped form components that compose `ui/*` primitives and call server actions from `@/server/*`.
- `ops/admin/` is a nested sub-area for role-restricted admin workflows, keeping admin-only components separate from customer-facing ones.

Dependency direction is strictly inward: feature components depend on `ui/*` and `@/server/*` actions; `ui/*` has no dependency on any feature folder. Server integration uses Next.js Server Actions (`useActionState`, `useTransition`, `"use client"` directives), while layout components can be async Server Components that read sessions directly.