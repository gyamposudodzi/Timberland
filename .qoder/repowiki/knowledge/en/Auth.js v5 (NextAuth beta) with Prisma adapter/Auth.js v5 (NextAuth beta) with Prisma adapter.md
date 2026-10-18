---
kind: external_dependency
name: Auth.js v5 (NextAuth beta) with Prisma adapter
slug: authjs-nextauth
category: external_dependency
category_hints:
    - auth_protocol
scope:
    - '**'
source_files:
    - lib/auth.config.ts
    - lib/auth.ts
    - app/api/auth/[...nextauth]/route.ts
    - types/next-auth.d.ts
---

### Authentication
- Credentials-based sign-in/sign-up flow; Google OAuth is wired as an optional provider (disabled unless `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` are set).
- Secrets: `AUTH_SECRET` (32-byte base64, generated via `openssl rand -base64 32`), `AUTH_TRUST_HOST=true` for local dev.
- Route handler lives at `app/api/auth/[...nextauth]/route.ts`; middleware enforces login for `/account*`.
- Types augmented via `types/next-auth.d.ts`.
- Verify exact provider config against Auth.js v5 docs.