---
kind: design
name: Guest tracking via masked public timeline with rate-limited lookup
source: session
category: adr
---

# Guest tracking via masked public timeline with rate-limited lookup

_Source: coding plans from commit period 4a8c5e0 → 0c4ba8b — records intent at planning time; the implementation may lag or differ._

## Context
The core differentiator is allowing anyone to track a shipment without logging in, while preventing PII leakage and enumeration attacks on tracking numbers.

## Decision drivers
- no-login guest experience
- PII masking
- anti-enumeration
- rate limiting

## Considered options
- **Open tracking endpoint returning full record** _(rejected)_ — pros: simplest implementation; cons: exposes recipient/sender PII and enables brute-force enumeration
- **Masked public view with base36 non-sequential tracking codes, optional postal-code verification, and IP rate-limiting** — pros: guest sees status/timeline only; addresses/phones are truncated to city/region; generic errors hide existence; codes are not guessable; cons: extra validation and masking logic on the server path

## Decision
Serve `/track/[trackingNumber]` with a `TrackingEvent.isPublic` filter so guests see only public events, mask sender/recipient full address and phone (city/region only), generate non-sequential base36 tracking codes (`TBR` prefix + check char), add optional light verification (postal code or last name), and apply IP-based rate limiting with generic errors for unknown codes.

## Consequences
Guest flow is secure by default but requires careful rendering of masked fields; future back-office UI can reuse the same `TrackingEvent` model to append internal-only events.