---
kind: external_dependency
name: Playwright for end-to-end tests
slug: playwright
category: external_dependency
category_hints:
    - framework_behavior
scope:
    - '**'
source_files:
    - playwright.config.ts
    - tests/e2e/
    - .github/workflows/ci.yml
---

### E2E test runner
- Specs live under `tests/e2e/` (`*.spec.ts`); Vitest only picks up `*.test.ts`, so the two suites do not collide.
- Tests assert guest tracking (valid + masked PII + unknown code), auth redirect/login/signup/sign-out, and full create-shipment → dashboard flow.
- CI job: spins up Postgres service, runs migrations + seed, builds the app, then executes Playwright against the running server on port 3000.