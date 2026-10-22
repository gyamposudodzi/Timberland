# Timberland — Demo Logins

Seed accounts created by `npm run db:seed`. Passwords are bcrypt-hashed in the
database; these are the plaintext demo values. **Local/demo only — never use in
production.**

## Admin (full control)

| Name       | Email                     | Password     | Can do                                                        |
| ---------- | ------------------------- | ------------ | ------------------------------------------------------------ |
| Ada Admin  | `admin@timberland.example`| `admin1234`  | Everything Staff can do, **plus**: force any shipment status (bypasses the state machine), edit price/payment/service/notes on any shipment, delete any shipment, and change account roles in the **Admin console** (`/ops/admin`). |

## User / customer

| Name          | Email                      | Password    | Can do                                                          |
| ------------- | -------------------------- | ----------- | -------------------------------------------------------------- |
| Demo Customer | `demo@timberland.example`  | `demo1234`  | Customer dashboard, new shipments, address book, notifications. Owns the seeded shipments A/B/C and saved addresses. |
| Reset Target  | `reset@timberland.example` | `reset1234` | Dedicated customer for the password-reset demo/e2e. No shipments. |

## Staff / back office (limited)

| Name      | Email                    | Password  | Can do                                                                 |
| --------- | ------------------------ | --------- | --------------------------------------------------------------------- |
| Ops Staff | `ops@timberland.example` | `ops1234` | Operations queue (`/ops`): advance shipments **through the valid state machine** and add internal notes. No admin console, no status override/edit/delete. |

## Sign-in URLs

- Customers & staff/admin all sign in at **`/login`**.
- After signing in, Staff/Admin see an **Ops** item in the account menu → `/ops`.
- Only Admin additionally sees the **Admin console** link in the ops sidebar → `/ops/admin`.

## Guest tracking (no login)

| Tracking | Status           |
| -------- | ---------------- |
| A        | Delivered        |
| B        | Out for delivery |
| C        | Created          |

Tracking numbers are regenerated on each seed run — copy them from the `npm run
db:seed` console output (printed as `Track A/B/C`).
