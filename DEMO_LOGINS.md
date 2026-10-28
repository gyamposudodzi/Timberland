# Timberland — Demo Logins

Seed accounts created by `npm run db:seed`. Passwords are bcrypt-hashed in the
database; these are the plaintext demo values. **Local/demo only — never use in
production.**

There are only **two roles**: `CUSTOMER` (a normal user) and `ADMIN` (full
control). There is no separate staff/back-office role.

## Admin (full control)

| Name      | Email                      | Password    | Can do                                                                                                             |
| --------- | -------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------ |
| Ada Admin | `admin@timberland.example` | `admin1234` | Everything a customer can do, **plus** the back office at **`/admin`**: run the shipment queue, advance status, force any status (bypasses the state machine), edit price/payment/service/notes on any shipment, delete any shipment, and change account roles at **`/admin/users`**. |

## User / customer

| Name          | Email                      | Password    | Can do                                                                                          |
| ------------- | -------------------------- | ----------- | ----------------------------------------------------------------------------------------------- |
| Demo Customer | `demo@timberland.example`  | `demo1234`  | Customer dashboard, new shipments, address book, notifications. Owns the seeded shipments A/B/C and saved addresses. |
| Reset Target  | `reset@timberland.example` | `reset1234` | Dedicated customer for the password-reset demo/e2e. No shipments.                               |

## Sign-in URLs

- Customers and admins all sign in at **`/login`**.
- Only an Admin sees the **Admin** item in the account menu → **`/admin`** (shipment queue).
- The account/role console is at **`/admin/users`**.
- Customers are redirected away from `/admin` (they have no back-office access).

## Guest tracking (no login)

| Tracking | Status           |
| -------- | ---------------- |
| A        | Delivered        |
| B        | Out for delivery |
| C        | Created          |

Tracking numbers are regenerated on each seed run — copy them from the `npm run
db:seed` console output (printed as `Track A/B/C`).
