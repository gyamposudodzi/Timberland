---
kind: design
name: Guest tracking via masked public timeline with rate limiting instead of login
source: session
category: adr
---

# Guest tracking via masked public timeline with rate limiting instead of login

_Source: coding plans from commit period 0c4ba8b → 70b9c6b — records intent at planning time; the implementation may lag or differ._

**Status:** accepted

## Context
The core differentiator is allowing anyone to look up a shipment by `trackingNumber` without an account, while preventing PII leakage and enumeration attacks against tracking codes.

## Decision drivers
- zero-friction customer experience
- PII minimization
- anti-enumeration
- rate-limiting abuse protection

## Considered options
- **Public `/track/[trackingNumber]` returning status + public events only, with recipient/sender address masked to city/region and IP-based rate limiting** — pros: no auth barrier, simple endpoint, PII stays hidden, generic errors hide existence of unknown codes; cons: still exposes some metadata (status, ETA); relies on non-sequential tracking numbers and rate limits for security
- **Require login or a secret verification step (postal code / last name) before any lookup** _(rejected)_ — pros: stronger anti-enumeration; cons: adds friction that defeats the guest-tracking promise; complicates the flow

## Decision
Serve a guest tracking page that shows current status, ETA, and `isPublic` events only, masking sender/recipient PII to city/region; protect the endpoint with IP-based rate limiting and return generic errors for unknown codes.

## Consequences
Tracking number format must be non-sequential (`TBR` + base36 + check char) to resist guessing. Any future expansion of the guest response must keep PII out of the public payload.