Single Prisma schema (`schema.prisma`) targeting PostgreSQL via `prisma-client-js`, with a flat domain model organized into five logical layers:
- Identity & access: `User` (role CUSTOMER/ADMIN, email verification/reset tokens).
- Pricing engine: `ServiceZone` × `ServiceLevel` → `RateRule` composite key driving per-zone/per-level pricing.
- Location: `Address` linked to both a user and an optional service zone.
- Shipment core: `Shipment` (tracking number, status machine, price/currency/paymentMethod) composed of one or more `Parcel`s; public/internal timeline via `TrackingEvent`.
- Notifications: per-user `NotificationPreference` (channel + event list) plus append-only `NotificationLog` audit trail.

Migrations are versioned under `migrations/` with `migration_lock.toml` pinning the provider to PostgreSQL. The initial migration (`20261018135712_init`) created a three-role enum (CUSTOMER/STAFF/ADMIN); a follow-up migration (`20261022000000_remove_staff_role`) dropped STAFF by rebuilding the Postgres enum type — reflecting the design decision that only two roles exist. The seed script (`seed.ts`) is idempotent: it deletes all rows in referential order before recreating demo zones, levels, rate rules, users (demo customer, admin, reset target), addresses, and three sample shipments with full tracking timelines.