---
kind: business_term
name: Business Glossary
category: business_term
scope:
    - '**'
---

### Timberland
- Definition：Internal codename for the courier and delivery web application being built in this repository; used as the product name in the README, domain email address (`demo@timberland.example`, `no-reply@timberland.example`), and Docker DB user/database names.
- Aliases：timberland

### own-fleet logistics
- Definition：Business model decision that the company operates its own drivers and computes rates via internal rules; there are no third-party carrier API integrations (FedEx/UPS/DHL-style tracking is simulated from internally recorded shipment events).
- Aliases：own fleet

### guest tracking
- Definition：Public-facing tracking capability that allows anyone to look up a shipment by tracking number without logging in; the view intentionally masks sensitive recipient PII (name, street, phone, postal code) while still showing city/region and status timeline.
- Aliases：guest track

### tracking number
- Definition：Unique identifier generated for each shipment, validated and normalized by `lib/tracking-number.ts`; used both as the public lookup key and as the route segment under `/track/[trackingNumber]`.
- Aliases：tracking number

### zone
- Definition：Postal-code-based geographic grouping used by the pricing engine to determine shipping cost tiers; zones are seeded into the database along with service levels and rates.
- Aliases：zone

### service level
- Definition：A named shipping option (e.g., standard, express) associated with a zone and rate; exposed to the quote calculator and rendered on the home page as available options.
- Aliases：service level

### create-data
- Definition：Prisma input type variant used when inserting records with scalar foreign-key values directly (as opposed to object relations); referenced in the PRisma schema to accept raw IDs during seeding and form submissions.
- Aliases：createData
