---
kind: external_dependency
name: Next.js 16 App Router framework
slug: nextjs
category: external_dependency
category_hints:
    - framework_behavior
scope:
    - '**'
source_files:
    - next.config.ts
    - middleware.ts
    - app/layout.tsx
---

### Timberland courier webapp runtime
- Framework: Next.js 16.4 (App Router, `app/` directory), React 19.
- Rendering strategy: standard Next rendering (not strict `cacheComponents` mode) because data-driven auth routes must render on demand; production build compiles 18 routes including `/robots.txt`, `/sitemap.xml`, error/loading boundaries.
- Middleware: `middleware.ts` guards `/account*` routes and redirects unauthenticated users — subject to a future deprecation where the convention is renamed to `proxy` (`npx @next/codemod middleware-to-proxy`).
- Build pipeline: `prisma generate && next build`; dev via `next dev`.
- Verify exact behavior against Next.js 16 docs.