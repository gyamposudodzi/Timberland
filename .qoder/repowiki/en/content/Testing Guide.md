# Testing Guide

<cite>
**Referenced Files in This Document**
- [package.json](file://package.json)
- [vitest.config.ts](file://vitest.config.ts)
- [playwright.config.ts](file://playwright.config.ts)
- [ci.yml](file://.github/workflows/ci.yml)
- [pricing.test.ts](file://tests/pricing.test.ts)
- [shipment-status.test.ts](file://tests/shipment-status.test.ts)
- [tracking-number.test.ts](file://tests/tracking-number.test.ts)
- [auth.spec.ts](file://tests/e2e/auth.spec.ts)
- [shipping.spec.ts](file://tests/e2e/shipping.spec.ts)
- [tracking.spec.ts](file://tests/e2e/tracking.spec.ts)
- [helpers.ts](file://tests/e2e/helpers.ts)
- [pricing.ts](file://lib/pricing.ts)
- [shipment-status.ts](file://lib/shipment-status.ts)
- [tracking-number.ts](file://lib/tracking-number.ts)
</cite>

## Update Summary
**Changes Made**
- Enhanced unit testing section with detailed coverage of pricing calculations, shipment status logic, and tracking number utilities
- Expanded E2E testing section with comprehensive authentication, shipping workflow, and tracking test scenarios
- Added detailed mocking strategies and assertion patterns used throughout the test suite
- Updated CI/CD integration section with specific database seeding and Prisma client generation steps
- Enhanced troubleshooting guide with specific debugging techniques for both Vitest and Playwright

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document explains Timberland's comprehensive testing strategy, which uses Vitest for unit tests and Playwright for end-to-end (E2E) tests. The testing suite covers critical business logic including pricing calculations, shipment state management, and tracking number generation, while E2E tests validate complete user flows such as authentication, shipment creation, and package tracking. It covers test organization, naming conventions, patterns, mocking strategies, assertion styles, coverage guidance, CI/CD integration, and debugging techniques. The goal is to help contributors write reliable tests that ensure application reliability across all major features.

## Project Structure
The repository separates unit tests from E2E tests with clear organizational boundaries:
- Unit tests live under `tests/*.test.ts` and use Vitest for fast, isolated testing of pure functions
- E2E tests live under `tests/e2e/*.spec.ts` and use Playwright for browser automation against a real Next.js application
- Configuration files define how each runner discovers and executes tests with appropriate environments

```mermaid
graph TB
subgraph "Unit Tests (Vitest)"
VT["vitest.config.ts"]
TP["pricing.test.ts<br/>Pricing calculation tests"]
TS["shipment-status.test.ts<br/>State machine tests"]
TN["tracking-number.test.ts<br/>Utility function tests"]
end
subgraph "E2E Tests (Playwright)"
PW["playwright.config.ts"]
EA["auth.spec.ts<br/>Authentication flows"]
ES["shipping.spec.ts<br/>Shipping workflows"]
ET["tracking.spec.ts<br/>Tracking functionality"]
EH["helpers.ts<br/>Database helpers"]
end
subgraph "Libraries Under Test"
LP["lib/pricing.ts<br/>Quote engine"]
LS["lib/shipment-status.ts<br/>State machine"]
LN["lib/tracking-number.ts<br/>Code generator"]
end
VT --> TP
VT --> TS
VT --> TN
PW --> EA
PW --> ES
PW --> ET
TP --> LP
TS --> LS
TN --> LN
ET --> EH
```

**Diagram sources**
- [vitest.config.ts:1-15](file://vitest.config.ts#L1-L15)
- [playwright.config.ts:1-32](file://playwright.config.ts#L1-L32)
- [pricing.test.ts:1-60](file://tests/pricing.test.ts#L1-L60)
- [shipment-status.test.ts:1-40](file://tests/shipment-status.test.ts#L1-L40)
- [tracking-number.test.ts:1-29](file://tests/tracking-number.test.ts#L1-L29)
- [auth.spec.ts:1-37](file://tests/e2e/auth.spec.ts#L1-L37)
- [shipping.spec.ts:1-55](file://tests/e2e/shipping.spec.ts#L1-L55)
- [tracking.spec.ts:1-42](file://tests/e2e/tracking.spec.ts#L1-L42)
- [helpers.ts:1-49](file://tests/e2e/helpers.ts#L1-L49)

**Section sources**
- [vitest.config.ts:1-15](file://vitest.config.ts#L1-L15)
- [playwright.config.ts:1-32](file://playwright.config.ts#L1-L32)
- [package.json:5-20](file://package.json#L5-L20)

## Core Components
This section summarizes the core libraries under test and their responsibilities, along with their corresponding test coverage.

- Pricing engine (`lib/pricing.ts`)
  - Pure functions for quote computation and rounding with half-up precision
  - Handles base price, weight/piece charges, service multiplier, minimum price floor, and multi-parcel aggregation
  - Exposes `computeQuote` and `round2` functions
  - **Test Coverage**: Validates summation logic, minimum price enforcement, service multiplier application, multi-parcel aggregation, invalid value handling, and rounding behavior

- Shipment state machine (`lib/shipment-status.ts`)
  - Defines allowed transitions, terminal states, completion semantics, and metadata for UI rendering
  - Implements forward progression, exception recovery, and closed state detection
  - Exposes helpers like `canTransition`, `nextStatuses`, `isTerminal`, `isCompleted`, plus constants
  - **Test Coverage**: Verifies happy path transitions, illegal jump rejection, terminal state handling, exception recovery, metadata completeness, and completion semantics

- Tracking number utilities (`lib/tracking-number.ts`)
  - Generates random, non-sequential codes with check characters using Crockford's Base32 alphabet
  - Normalizes input and validates format with checksum verification
  - Supports injectable randomness via options for deterministic tests
  - **Test Coverage**: Ensures valid code generation, tamper detection, normalization handling, and uniqueness across multiple generations

**Section sources**
- [pricing.ts:1-89](file://lib/pricing.ts#L1-L89)
- [shipment-status.ts:1-77](file://lib/shipment-status.ts#L1-L77)
- [tracking-number.ts:1-57](file://lib/tracking-number.ts#L1-L57)

## Architecture Overview
The testing architecture consists of two complementary runners with distinct responsibilities:

- Vitest runs unit tests against pure modules without requiring a browser or server environment
- Playwright runs E2E tests against a built Next.js application backed by a seeded PostgreSQL database with real authentication and data persistence

```mermaid
sequenceDiagram
participant Dev as "Developer"
participant V as "Vitest"
participant Pw as "Playwright"
participant App as "Next.js App"
participant DB as "PostgreSQL"
Dev->>V : npm test
V-->>Dev : Fast unit test results
Dev->>Pw : npm run test : e2e
Pw->>App : Build + start webServer
Pw->>DB : Use seeded data
Pw->>App : Interact via Chromium browser
App->>DB : Read/write real data
Pw-->>Dev : Comprehensive E2E report
```

**Diagram sources**
- [vitest.config.ts:1-15](file://vitest.config.ts#L1-L15)
- [playwright.config.ts:1-32](file://playwright.config.ts#L1-L32)
- [ci.yml:14-38](file://.github/workflows/ci.yml#L14-L38)
- [ci.yml:40-94](file://.github/workflows/ci.yml#L40-L94)

**Section sources**
- [vitest.config.ts:1-15](file://vitest.config.ts#L1-L15)
- [playwright.config.ts:1-32](file://playwright.config.ts#L1-L32)

## Detailed Component Analysis

### Unit Testing Strategy with Vitest
- Discovery and environment
  - Tests are discovered under `tests/**/*.test.ts` with Node environment configuration
  - Path alias `@` points to project root for clean imports
- Naming conventions
  - File names end with `.test.ts` following Vitest conventions
  - Group tests using `describe` blocks that mirror module responsibilities
  - Individual cases use `it` with descriptive strings explaining expected behavior
- Assertion style
  - Uses Vitest's `expect` API with exact numeric assertions for pricing calculations
  - Boolean checks for state machine rules and validation functions
- Mocking strategy
  - Prefer pure functions and dependency injection where possible
  - For randomness, inject custom functions via options to make tests deterministic
  - Avoid external dependencies in unit tests for speed and reliability

#### Pricing Calculations
- What is tested
  - Summation of zone base, weight, and piece charges with proper rounding
  - Minimum price floor enforcement when calculated totals fall below thresholds
  - Service multiplier application for different service levels
  - Multi-parcel aggregation with weight and piece counting
  - Handling of invalid/non-positive values treated as zero
  - Rounding behavior for half-up precision without float drift
- Patterns
  - Define base rate fixtures once per describe block for reuse
  - Assert intermediate breakdown fields to ensure internal correctness
  - Validate both computed totals and flags indicating whether minimum price was applied

```mermaid
flowchart TD
Start(["Input: rate + parcels"]) --> Clean["Normalize inputs<br/>positive() and round2()"]
Clean --> Aggregate["Aggregate weightTotalKg and piecesTotal"]
Aggregate --> Charges["Compute weightCharge and pieceCharge"]
Charges --> Subtotal["Compute subtotalBeforeService"]
Subtotal --> ApplyService["Apply serviceMultiplier -> afterService"]
ApplyService --> Floor{"afterService < minPrice?"}
Floor --> |Yes| SetMin["Set total = minPrice<br/>minPriceApplied = true"]
Floor --> |No| KeepAfter["Set total = afterService"]
SetMin --> End(["Return QuoteBreakdown"])
KeepAfter --> End
```

**Diagram sources**
- [pricing.ts:40-89](file://lib/pricing.ts#L40-L89)

**Section sources**
- [pricing.test.ts:1-60](file://tests/pricing.test.ts#L1-L60)
- [pricing.ts:1-89](file://lib/pricing.ts#L1-L89)

#### Shipment Status Logic
- What is tested
  - Allowed transitions along the happy path from creation to delivery
  - Rejection of illegal jumps that skip required intermediate states
  - Terminal states (RETURNED, CANCELLED) and recovery from exceptions
  - Metadata completeness for all statuses including labels and descriptions
  - Completion semantics for closed states (DELIVERED, RETURNED, CANCELLED)
- Patterns
  - Use explicit transition pairs to assert `canTransition` behavior
  - Iterate over defined statuses to verify metadata presence and validity
  - Combine multiple helper functions in one test suite to validate entire state machine contract

```mermaid
stateDiagram-v2
[*] --> CREATED
CREATED --> CONFIRMED
CREATED --> CANCELLED
CONFIRMED --> PICKED_UP
CONFIRMED --> EXCEPTION
CONFIRMED --> CANCELLED
PICKED_UP --> IN_TRANSIT
PICKED_UP --> EXCEPTION
IN_TRANSIT --> AT_HUB
IN_TRANSIT --> OUT_FOR_DELIVERY
IN_TRANSIT --> EXCEPTION
AT_HUB --> IN_TRANSIT
AT_HUB --> OUT_FOR_DELIVERY
AT_HUB --> EXCEPTION
OUT_FOR_DELIVERY --> DELIVERED
OUT_FOR_DELIVERY --> EXCEPTION
DELIVERED --> RETURNED
EXCEPTION --> OUT_FOR_DELIVERY
EXCEPTION --> IN_TRANSIT
EXCEPTION --> RETURNED
EXCEPTION --> CANCELLED
EXCEPTION --> DELIVERED
RETURNED --> [*]
CANCELLED --> [*]
```

**Diagram sources**
- [shipment-status.ts:9-40](file://lib/shipment-status.ts#L9-L40)

**Section sources**
- [shipment-status.test.ts:1-40](file://tests/shipment-status.test.ts#L1-L40)
- [shipment-status.ts:1-77](file://lib/shipment-status.ts#L1-L77)

#### Tracking Number Utilities
- What is tested
  - Generation produces valid, well-formed codes with correct length and prefix
  - Tampered codes are rejected through checksum validation
  - Normalization handles case conversion and separator removal
  - Generated codes vary sufficiently to resist enumeration attacks
- Patterns
  - Loop generation to assert length, prefix, and validity across multiple iterations
  - Mutate generated codes to assert validation rejects tampering attempts
  - Normalize mixed-case and spaced inputs to canonical form
  - Use sets to measure uniqueness across many generations ensuring randomness

```mermaid
flowchart TD
Gen(["generateTrackingNumber"]) --> Body["Generate random body chars"]
Body --> Check["Compute checkChar(body)"]
Check --> Code["Prefix + body + check"]
Norm(["normalizeTrackingNumber"]) --> Clean["Uppercase + strip spaces/dashes"]
Valid(["isValidTrackingNumber"]) --> Normalize["Normalize input"]
Normalize --> FormatCheck{"Length, prefix, alphabet OK?"}
FormatCheck --> |No| Invalid["Return false"]
FormatCheck --> |Yes| VerifyCheck{"checkChar matches?"}
VerifyCheck --> |No| Invalid
VerifyCheck --> |Yes| True["Return true"]
```

**Diagram sources**
- [tracking-number.ts:12-56](file://lib/tracking-number.ts#L12-L56)

**Section sources**
- [tracking-number.test.ts:1-29](file://tests/tracking-number.test.ts#L1-L29)
- [tracking-number.ts:1-57](file://lib/tracking-number.ts#L1-L57)

### E2E Testing Strategy with Playwright
- Discovery and execution
  - Tests live under `tests/e2e` with single Chromium project configuration
  - Web server is started automatically by Playwright during test execution
  - Single worker mode to reduce contention on shared database resources
- Environment and data
  - Tests run against a real built app and seeded PostgreSQL database
  - Helpers query the database to obtain real tracking numbers and PII for masking assertions
  - Database connection managed through cached PrismaClient instance
- User flow coverage
  - Authentication: login success/failure, route guards, logout functionality
  - Shipment creation: authenticated flow, redirect handling, dashboard listing, guest visibility constraints
  - Tracking: public status/timeline display, PII masking, not-found handling, home bar navigation

```mermaid
sequenceDiagram
participant Browser as "Playwright Browser"
participant App as "Next.js App"
participant DB as "PostgreSQL"
participant Helper as "helpers.ts"
Browser->>App : Navigate to /login
Browser->>App : Submit credentials
App->>DB : Authenticate user
DB-->>App : Session established
App-->>Browser : Redirect to /account
Browser->>App : Create new shipment
App->>DB : Persist shipment + tracking number
DB-->>App : Confirmation
Browser->>App : Visit /track/{code}
App->>DB : Fetch public info
DB-->>App : Public data only
App-->>Browser : Render masked view
```

**Diagram sources**
- [auth.spec.ts:1-37](file://tests/e2e/auth.spec.ts#L1-L37)
- [shipping.spec.ts:1-55](file://tests/e2e/shipping.spec.ts#L1-L55)
- [tracking.spec.ts:1-42](file://tests/e2e/tracking.spec.ts#L1-L42)
- [helpers.ts:1-49](file://tests/e2e/helpers.ts#L1-L49)
- [playwright.config.ts:1-32](file://playwright.config.ts#L1-L32)

**Section sources**
- [auth.spec.ts:1-37](file://tests/e2e/auth.spec.ts#L1-L37)
- [shipping.spec.ts:1-55](file://tests/e2e/shipping.spec.ts#L1-L55)
- [tracking.spec.ts:1-42](file://tests/e2e/tracking.spec.ts#L1-L42)
- [helpers.ts:1-49](file://tests/e2e/helpers.ts#L1-L49)
- [playwright.config.ts:1-32](file://playwright.config.ts#L1-L32)

## Dependency Analysis
The following diagram shows how tests depend on libraries and configuration, demonstrating the clear separation between unit and E2E testing concerns.

```mermaid
graph LR
VT["vitest.config.ts"] --> PT["pricing.test.ts"]
VT --> ST["shipment-status.test.ts"]
VT --> TT["tracking-number.test.ts"]
PW["playwright.config.ts"] --> EA["auth.spec.ts"]
PW --> ES["shipping.spec.ts"]
PW --> ET["tracking.spec.ts"]
PT --> LP["lib/pricing.ts"]
ST --> LS["lib/shipment-status.ts"]
TT --> LN["lib/tracking-number.ts"]
ET --> EH["tests/e2e/helpers.ts"]
EH --> PRISMA["@prisma/client"]
```

**Diagram sources**
- [vitest.config.ts:1-15](file://vitest.config.ts#L1-L15)
- [playwright.config.ts:1-32](file://playwright.config.ts#L1-L32)
- [pricing.test.ts:1-60](file://tests/pricing.test.ts#L1-L60)
- [shipment-status.test.ts:1-40](file://tests/shipment-status.test.ts#L1-L40)
- [tracking-number.test.ts:1-29](file://tests/tracking-number.test.ts#L1-L29)
- [auth.spec.ts:1-37](file://tests/e2e/auth.spec.ts#L1-L37)
- [shipping.spec.ts:1-55](file://tests/e2e/shipping.spec.ts#L1-L55)
- [tracking.spec.ts:1-42](file://tests/e2e/tracking.spec.ts#L1-L42)
- [helpers.ts:1-49](file://tests/e2e/helpers.ts#L1-L49)

**Section sources**
- [vitest.config.ts:1-15](file://vitest.config.ts#L1-L15)
- [playwright.config.ts:1-32](file://playwright.config.ts#L1-L32)

## Performance Considerations
- Unit tests
  - Keep fixtures small and reuse them within describe blocks for efficiency
  - Avoid heavy computations inside loops; precompute values when possible
  - Prefer deterministic helpers (like injected randomness) to avoid flakiness and improve speed
  - Run tests in parallel naturally since they're isolated and don't share state
- E2E tests
  - Run a single worker to reduce contention on the shared database
  - Use seeded data to minimize setup time and stabilize outcomes
  - Limit screenshots and traces to failures or retries to keep reports manageable
  - Cache database connections through PrismaClient singleton pattern

[No sources needed since this section provides general guidance]

## Troubleshooting Guide

### Running Tests Locally
- Unit tests
  - Run all unit tests: `npm test`
  - Watch mode for development: `npm run test:watch`
- E2E tests
  - Run E2E tests: `npm run test:e2e`
  - Open Playwright UI for interactive debugging: `npm run test:e2e:ui`

**Section sources**
- [package.json:5-20](file://package.json#L5-L20)

### Common Issues and Fixes
- Missing Prisma client
  - Ensure Prisma client is generated before running tests
  - In CI, this is done explicitly; locally, run `npx prisma generate` if you see client-related errors
- Database not seeded
  - E2E tests rely on seeded data. If helpers cannot find expected records, seed the database first with `npm run db:seed`
- Browser or dependencies missing
  - Install Playwright browsers with system dependencies before running E2E tests: `npx playwright install --with-deps chromium`
- Port conflicts
  - Ensure port 3000 is available or configure alternative port in environment variables

**Section sources**
- [ci.yml:28-30](file://.github/workflows/ci.yml#L28-L30)
- [ci.yml:75-82](file://.github/workflows/ci.yml#L75-L82)
- [helpers.ts:23-41](file://tests/e2e/helpers.ts#L23-L41)

### Debugging Failing Tests
- Unit tests
  - Inspect console logs and assertion messages for detailed error information
  - Isolate failing cases by running specific files: `npm test -- tests/pricing.test.ts`
  - Use watch mode to iterate quickly on fixes
- E2E tests
  - Playwright captures screenshots on failure and traces on retry automatically
  - Use HTML report to inspect steps and network activity: `npx playwright show-report`
  - Run tests in UI mode to interactively debug selectors and flows: `npm run test:e2e:ui`
  - Add strategic pauses with `await page.pause()` for manual inspection

**Section sources**
- [playwright.config.ts:17-23](file://playwright.config.ts#L17-L23)

### CI/CD Integration
- Quality job
  - Installs dependencies, generates Prisma client, typechecks, lints, and runs unit tests
  - Runs on Ubuntu latest with Node.js 22 and npm caching
- E2E job
  - Starts PostgreSQL service container with health checks
  - Applies migrations and seeds data before building the application
  - Installs Playwright browsers with system dependencies
  - Runs E2E tests and uploads HTML report on failure for 7 days retention

```mermaid
flowchart TD
Push["Push/Pull Request"] --> Quality["Quality Job"]
Quality --> Typecheck["Typecheck"]
Quality --> Lint["Lint"]
Quality --> UnitTests["Unit Tests"]
UnitTests --> E2EJob["E2E Job"]
E2EJob --> SetupDB["Setup PostgreSQL Service"]
SetupDB --> MigrateSeed["Apply Migrations & Seed Data"]
MigrateSeed --> Build["Build Next.js App"]
Build --> InstallPW["Install Playwright Browsers"]
InstallPW --> RunE2E["Run E2E Tests"]
RunE2E --> Report["Upload HTML Report on Failure"]
```

**Diagram sources**
- [ci.yml:14-38](file://.github/workflows/ci.yml#L14-L38)
- [ci.yml:40-94](file://.github/workflows/ci.yml#L40-L94)

**Section sources**
- [ci.yml:14-38](file://.github/workflows/ci.yml#L14-L38)
- [ci.yml:40-94](file://.github/workflows/ci.yml#L40-L94)

## Conclusion
Timberland's comprehensive testing strategy combines fast, isolated unit tests with robust E2E scenarios to ensure application reliability. Unit tests focus on pure business logic—pricing calculations, state transitions, and utility functions—while E2E tests validate critical user journeys across authentication, shipment creation, and tracking. The testing architecture leverages Vitest for rapid feedback on core algorithms and Playwright for realistic user interaction testing against a real database and application stack. The configuration and CI pipeline ensure consistent execution, meaningful reporting, and stable outcomes across development and production environments. By following the patterns and guidelines outlined here, contributors can extend coverage confidently and maintain high reliability across all application features.