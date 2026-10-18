---
kind: external_dependency
name: Nodemailer for transactional emails
slug: nodemailer
category: external_dependency
category_hints:
    - framework_behavior
scope:
    - '**'
source_files:
    - lib/notifications.ts
    - .env.example
---

### Email transport
- Transport: Nodemailer with SMTP configuration (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM`).
- Fallback: when SMTP env vars are unset, the module falls back to a console transport (no mail sent).
- Optional feature — not required for core shipping/tracking flows.
- Verify exact transporter options against Nodemailer docs.