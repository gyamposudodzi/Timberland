---
kind: design
name: Guest tracking via public trackingNumber with masked PII and rate limiting
source: session
category: adr
---

# Guest tracking via public trackingNumber with masked PII and rate limiting

_Source: coding plans from commit period 3d4cd9b → f630ba2 — records intent at planning time; the implementation may lag or differ._

**Status:** accepted

## Context
The app must let anyone look up a shipment without logging in, while preventing enumeration of tracking numbers and leaking recipient/sender PII. Authenticated customers see full details only for their own shipments.

## Decision drivers
- no-login guest experience
- PII protection
- anti-enumeration
- server-side ownership enforcement

## Considered options
- **Public lookup by opaque trackingNumber (TBR + base36 + check char)** — pros: No auth required; non-sequential reduces guessing; single endpoint serves both guest and customer views; cons: Must mask addresses/phones on the public path; needs IP-based rate limiting
- **Require login for all tracking** — pros: Simpler authorization, no masking needed; cons: Breaks the core differentiator — guests cannot track parcels
- **Return full data and mask client-side** — pros: Easier implementation; cons: PII leaks over the wire; client can bypass masking

## Decision
Use a server-generated, non-sequential `trackingNumber` as the public key. The `/track/[trackingNumber]` route returns status, ETA, and only events where `isPublic=true`, with sender/recipient fields reduced to city/region. Guest endpoints are rate-limited by IP and return generic errors for unknown codes; authenticated users query by `userId = session.user.id`.

## Consequences
Tracking is fast and SEO-friendly but requires careful masking in every public query. Enumeration resistance depends on the base36+check format plus rate limiting. Future back-office/driver apps reuse the same model via the `isPublic` flag.