---
kind: external_dependency
name: PostgreSQL (dev container)
slug: postgresql
category: external_dependency
category_hints:
    - client_constraint
scope:
    - '**'
source_files:
    - docker-compose.yml
    - .env.example
---

### Database platform
- Dev instance launched via `docker compose up -d db`; connection string defined in `.env.example` as `postgresql://timberland:timberland@localhost:5432/timberland?schema=public`.
- Used exclusively by Prisma; no direct driver code beyond the Prisma client.
- CI e2e job declares it as a service.