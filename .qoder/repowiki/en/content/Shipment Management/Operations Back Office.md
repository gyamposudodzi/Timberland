# Operations Back Office

<cite>
**Referenced Files in This Document**
- [ops/page.tsx](file://app/ops/page.tsx)
- [ops/layout.tsx](file://app/ops/layout.tsx)
- [ops/shipments/[id]/page.tsx](file://app/ops/shipments/[id]/page.tsx)
- [server/ops.actions.ts](file://server/ops.actions.ts)
- [server/ops.service.ts](file://server/ops.service.ts)
- [components/ops/advance-status-form.tsx](file://components/ops/advance-status-form.tsx)
- [components/ops/internal-note-form.tsx](file://components/ops/internal-note-form.tsx)
- [lib/shipment-status.ts](file://lib/shipment-status.ts)
- [lib/notifications.ts](file://lib/notifications.ts)
- [prisma/schema.prisma](file://prisma/schema.prisma)
- [middleware.ts](file://middleware.ts)
</cite>

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
The Operations Back Office is the staff-facing area where authorized operators manage shipments, advance their lifecycle status through a validated state machine, and record both public tracking events and internal notes. It provides:
- A paginated shipment queue with search and status filters.
- A detailed shipment view showing full history, addresses, pricing, and operational controls.
- Server-side validation for all state transitions.
- Optional customer notifications when meaningful updates occur.

This document explains how the UI, server actions, services, data model, and notification system work together to provide a secure and auditable operations workflow.

## Project Structure
The Operations Back Office spans Next.js App Router pages, server-only service functions, server actions, client-side forms, shared business logic, and the Prisma schema.

```mermaid
graph TB
subgraph "Next.js Pages"
OPS_PAGE["app/ops/page.tsx"]
OPS_LAYOUT["app/ops/layout.tsx"]
OPS_SHIPMENT["app/ops/shipments/[id]/page.tsx"]
end
subgraph "Server Layer"
OPS_SERVICE["server/ops.service.ts"]
OPS_ACTIONS["server/ops.actions.ts"]
end
subgraph "Client Components"
ADVANCE_FORM["components/ops/advance-status-form.tsx"]
NOTE_FORM["components/ops/internal-note-form.tsx"]
end
subgraph "Domain & Data"
STATUS_LIB["lib/shipment-status.ts"]
NOTIFICATIONS["lib/notifications.ts"]
SCHEMA["prisma/schema.prisma"]
end
OPS_LAYOUT --> OPS_SERVICE
OPS_PAGE --> OPS_SERVICE
OPS_SHIPMENT --> OPS_SERVICE
OPS_SHIPMENT --> ADVANCE_FORM
OPS_SHIPMENT --> NOTE_FORM
ADVANCE_FORM --> OPS_ACTIONS
NOTE_FORM --> OPS_ACTIONS
OPS_ACTIONS --> STATUS_LIB
OPS_ACTIONS --> NOTIFICATIONS
OPS_SERVICE --> STATUS_LIB
OPS_SERVICE --> SCHEMA
OPS_ACTIONS --> SCHEMA
```

**Diagram sources**
- [ops/page.tsx:1-200](file://app/ops/page.tsx#L1-L200)
- [ops/layout.tsx:1-48](file://app/ops/layout.tsx#L1-L48)
- [ops/shipments/[id]/page.tsx:1-166](file://app/ops/shipments/[id]/page.tsx#L1-L166)
- [server/ops.service.ts:1-163](file://server/ops.service.ts#L1-L163)
- [server/ops.actions.ts:1-91](file://server/ops.actions.ts#L1-L91)
- [components/ops/advance-status-form.tsx:1-92](file://components/ops/advance-status-form.tsx#L1-L92)
- [components/ops/internal-note-form.tsx:1-57](file://components/ops/internal-note-form.tsx#L1-L57)
- [lib/shipment-status.ts:1-77](file://lib/shipment-status.ts#L1-L77)
- [lib/notifications.ts:1-114](file://lib/notifications.ts#L1-L114)
- [prisma/schema.prisma:1-261](file://prisma/schema.prisma#L1-L261)

**Section sources**
- [ops/page.tsx:1-200](file://app/ops/page.tsx#L1-L200)
- [ops/layout.tsx:1-48](file://app/ops/layout.tsx#L1-L48)
- [ops/shipments/[id]/page.tsx:1-166](file://app/ops/shipments/[id]/page.tsx#L1-L166)
- [server/ops.service.ts:1-163](file://server/ops.service.ts#L1-L163)
- [server/ops.actions.ts:1-91](file://server/ops.actions.ts#L1-L91)
- [components/ops/advance-status-form.tsx:1-92](file://components/ops/advance-status-form.tsx#L1-L92)
- [components/ops/internal-note-form.tsx:1-57](file://components/ops/internal-note-form.tsx#L1-L57)
- [lib/shipment-status.ts:1-77](file://lib/shipment-status.ts#L1-L77)
- [lib/notifications.ts:1-114](file://lib/notifications.ts#L1-L114)
- [prisma/schema.prisma:1-261](file://prisma/schema.prisma#L1-L261)

## Core Components
- Operations layout enforces operator access by checking session role before rendering back-office content.
- Operations queue page lists shipments across all customers with search and status filtering, plus summary cards.
- Shipment detail page shows full history, addresses, pricing, and allows operators to advance status or add internal notes.
- Server actions validate authorization, enforce the state machine, persist tracking events, update shipment status, and trigger revalidation.
- Service layer provides read helpers for listing, summarizing, and fetching full shipment details for operators.
- Status library defines allowed states, transitions, terminal/completed checks, and human-readable metadata.
- Notification helper sends emails on meaningful updates while honoring user preferences and logging outcomes.

**Section sources**
- [ops/layout.tsx:1-48](file://app/ops/layout.tsx#L1-L48)
- [ops/page.tsx:1-200](file://app/ops/page.tsx#L1-L200)
- [ops/shipments/[id]/page.tsx:1-166](file://app/ops/shipments/[id]/page.tsx#L1-L166)
- [server/ops.actions.ts:1-91](file://server/ops.actions.ts#L1-L91)
- [server/ops.service.ts:1-163](file://server/ops.service.ts#L1-L163)
- [lib/shipment-status.ts:1-77](file://lib/shipment-status.ts#L1-L77)
- [lib/notifications.ts:1-114](file://lib/notifications.ts#L1-L114)

## Architecture Overview
The Operations Back Office follows a layered architecture:
- Presentation layer: Next.js pages render queues and details.
- Client components: Forms collect operator input and call server actions.
- Server actions: Validate inputs, enforce roles and state transitions, write to the database, and invalidate caches.
- Services: Encapsulate read queries and role-gated access checks.
- Domain logic: Centralized state machine and metadata.
- Notifications: Asynchronous email delivery with preference handling and logging.

```mermaid
sequenceDiagram
participant Operator as "Operator Browser"
participant OpsLayout as "Ops Layout"
participant OpsService as "ops.service.ts"
participant OpsPage as "Ops Page"
participant OpsShipment as "Shipment Detail Page"
participant AdvanceForm as "AdvanceStatusForm"
participant NoteForm as "InternalNoteForm"
participant OpsActions as "ops.actions.ts"
participant DB as "PostgreSQL"
participant Notify as "notifications.ts"
Operator->>OpsLayout : Visit /ops
OpsLayout->>OpsService : getOpsSession()
OpsService-->>OpsLayout : Session or redirect
OpsLayout-->>Operator : Render sidebar + children
Operator->>OpsPage : Load /ops (search/status/pagination)
OpsPage->>OpsService : getStatusSummary()
OpsPage->>OpsService : listShipmentsForOps(q, status, page)
OpsService->>DB : Query shipments and counts
DB-->>OpsService : Results
OpsService-->>OpsPage : Summary + list
OpsPage-->>Operator : Queue UI
Operator->>OpsShipment : Open /ops/shipments/ : id
OpsShipment->>OpsService : getShipmentForOps(id)
OpsService->>DB : Fetch shipment + events
DB-->>OpsService : Full shipment
OpsService-->>OpsShipment : Shipment
OpsShipment-->>Operator : Timeline + details
Operator->>AdvanceForm : Submit new status
AdvanceForm->>OpsActions : addTrackingEventAction(formData)
OpsActions->>OpsActions : Validate role + status transition
OpsActions->>DB : Create TrackingEvent + Update Shipment
DB-->>OpsActions : Persisted records
OpsActions->>Notify : notifyStatusChange()
Notify->>DB : Read preferences + log outcome
OpsActions-->>AdvanceForm : Success result
AdvanceForm-->>Operator : Refresh UI
Operator->>NoteForm : Submit internal note
NoteForm->>OpsActions : addTrackingEventAction(formData)
OpsActions->>DB : Create internal event (no status change)
OpsActions-->>NoteForm : Success result
NoteForm-->>Operator : Refresh UI
```

**Diagram sources**
- [ops/layout.tsx:1-48](file://app/ops/layout.tsx#L1-L48)
- [ops/page.tsx:1-200](file://app/ops/page.tsx#L1-L200)
- [ops/shipments/[id]/page.tsx:1-166](file://app/ops/shipments/[id]/page.tsx#L1-L166)
- [server/ops.service.ts:1-163](file://server/ops.service.ts#L1-L163)
- [server/ops.actions.ts:1-91](file://server/ops.actions.ts#L1-L91)
- [lib/notifications.ts:1-114](file://lib/notifications.ts#L1-L114)

## Detailed Component Analysis

### Operations Layout and Access Control
The layout ensures only authenticated operators can access the back office:
- It reads the current session and redirects unauthenticated users to login.
- It calls a role check that requires STAFF or ADMIN; otherwise it redirects to the customer account area.
- It renders a minimal sidebar navigation for the operations queue.

```mermaid
flowchart TD
Start(["Visit /ops"]) --> AuthCheck["Read session via auth()"]
AuthCheck --> HasUser{"Has user?"}
HasUser --> |No| RedirectLogin["Redirect to /login"]
HasUser --> |Yes| RoleCheck["getOpsSession()"]
RoleCheck --> IsOperator{"Role is STAFF or ADMIN?"}
IsOperator --> |No| RedirectAccount["Redirect to /account"]
IsOperator --> |Yes| RenderOps["Render ops layout + children"]
```

**Diagram sources**
- [ops/layout.tsx:1-48](file://app/ops/layout.tsx#L1-L48)
- [server/ops.service.ts:11-19](file://server/ops.service.ts#L11-L19)

**Section sources**
- [ops/layout.tsx:1-48](file://app/ops/layout.tsx#L1-L48)
- [server/ops.service.ts:11-19](file://server/ops.service.ts#L11-L19)

### Operations Queue Page
The queue page provides:
- Summary cards for active, exceptions, delivered, and total shipments.
- Search by tracking number.
- Status filter chips using the centralized status definitions.
- Paginated results with links to individual shipment details.

Key behaviors:
- Reads query parameters for search, status, and page.
- Calls service functions to fetch summary and list data concurrently.
- Renders empty-state messaging when no results match.
- Builds pagination links preserving existing filters.

```mermaid
flowchart TD
Entry(["Load /ops"]) --> ParseParams["Parse q, status, page"]
ParseParams --> FetchData["Fetch summary + listShipmentsForOps()"]
FetchData --> BuildCards["Build summary cards"]
BuildCards --> RenderSearch["Render search form"]
RenderSearch --> RenderFilters["Render status chips"]
RenderFilters --> HasResults{"Any shipments?"}
HasResults --> |No| EmptyState["Show 'No shipments match'"]
HasResults --> |Yes| RenderList["Render shipment rows"]
RenderList --> Pagination["Render previous/next links"]
EmptyState --> End(["End"])
Pagination --> End
```

**Diagram sources**
- [ops/page.tsx:1-200](file://app/ops/page.tsx#L1-L200)
- [server/ops.service.ts:46-103](file://server/ops.service.ts#L46-L103)
- [lib/shipment-status.ts:9-20](file://lib/shipment-status.ts#L9-L20)

**Section sources**
- [ops/page.tsx:1-200](file://app/ops/page.tsx#L1-L200)
- [server/ops.service.ts:46-103](file://server/ops.service.ts#L46-L103)

### Shipment Detail Page
The detail page displays:
- Current status with label and description.
- Full tracking timeline including internal events.
- Operational controls: advance status and add internal note.
- Customer, service level, dates, payment method, total price.
- Sender and recipient addresses.

It computes allowed next statuses from the state machine and passes them to the advance form.

```mermaid
flowchart TD
Open(["Open /ops/shipments/:id"]) --> LoadShipment["getShipmentForOps(id)"]
LoadShipment --> Exists{"Shipment found?"}
Exists --> |No| NotFound["notFound()"]
Exists --> |Yes| ComputeAllowed["Compute allowed next statuses"]
ComputeAllowed --> RenderTimeline["Render tracking timeline"]
RenderTimeline --> RenderControls["Render advance + note forms"]
RenderControls --> RenderDetails["Render customer/service/pricing/details"]
RenderDetails --> RenderAddresses["Render route addresses"]
RenderAddresses --> End(["End"])
```

**Diagram sources**
- [ops/shipments/[id]/page.tsx:1-166](file://app/ops/shipments/[id]/page.tsx#L1-L166)
- [server/ops.service.ts:146-162](file://server/ops.service.ts#L146-L162)
- [lib/shipment-status.ts:45-51](file://lib/shipment-status.ts#L45-L51)

**Section sources**
- [ops/shipments/[id]/page.tsx:1-166](file://app/ops/shipments/[id]/page.tsx#L1-L166)
- [server/ops.service.ts:146-162](file://server/ops.service.ts#L146-L162)
- [lib/shipment-status.ts:45-51](file://lib/shipment-status.ts#L45-L51)

### Server Actions: Advancing Status and Recording Notes
The server action centralizes:
- Authorization check for operators.
- Input parsing and validation.
- State transition validation against the state machine.
- Atomic persistence of tracking events and shipment updates.
- Conditional customer notifications.
- Cache invalidation for relevant routes.

```mermaid
flowchart TD
Start(["addTrackingEventAction(formData)"]) --> CheckAuth["getOpsSession()"]
CheckAuth --> Authorized{"Authorized?"}
Authorized --> |No| ReturnError["Return error: not authorized"]
Authorized --> |Yes| ParseFields["Parse shipmentId, statusCode, location, note, isPublic"]
ParseFields --> ValidateInputs{"Valid inputs?"}
ValidateInputs --> |No| ReturnInvalid["Return error: missing or invalid fields"]
ValidateInputs --> |Yes| LoadShipment["Load shipment by id"]
LoadShipment --> Found{"Shipment exists?"}
Found --> |No| ReturnNotFound["Return error: not found"]
Found --> |Yes| CheckTransition["canTransition(from, to)"]
CheckTransition --> ValidTransition{"Valid transition?"}
ValidTransition --> |No| ReturnIllegal["Return error: illegal transition"]
ValidTransition --> |Yes| Transaction["Prisma transaction:<br/>Create TrackingEvent<br/>Update Shipment status"]
Transaction --> NotifyCheck{"Status changed OR isPublic?"}
NotifyCheck --> |Yes| Notify["notifyStatusChange()"]
NotifyCheck --> |No| SkipNotify["Skip notification"]
Notify --> Revalidate["revalidatePath(...)"]
SkipNotify --> Revalidate
Revalidate --> ReturnSuccess["Return ok + newStatus"]
```

**Diagram sources**
- [server/ops.actions.ts:1-91](file://server/ops.actions.ts#L1-L91)
- [lib/shipment-status.ts:45-51](file://lib/shipment-status.ts#L45-L51)
- [lib/notifications.ts:49-108](file://lib/notifications.ts#L49-L108)

**Section sources**
- [server/ops.actions.ts:1-91](file://server/ops.actions.ts#L1-L91)
- [lib/shipment-status.ts:45-51](file://lib/shipment-status.ts#L45-L51)
- [lib/notifications.ts:49-108](file://lib/notifications.ts#L49-L108)

### Client Forms: Advance Status and Internal Note
- AdvanceStatusForm:
  - Uses useActionState to submit to the server action.
  - Displays allowed statuses based on the current state.
  - Shows success/error alerts and refreshes the page after success.
  - Supports optional location and note, and toggling public visibility.
- InternalNoteForm:
  - Submits the same server action but keeps the current status unchanged.
  - Records an internal-only note without notifying customers.

```mermaid
classDiagram
class AdvanceStatusForm {
+shipmentId : string
+currentStatus : ShipmentStatus
+allowed : ShipmentStatus[]
+formAction()
+handleStatusChange()
+handleSubmit()
}
class InternalNoteForm {
+shipmentId : string
+currentStatus : ShipmentStatus
+formAction()
+handleSubmit()
}
class AddTrackingEventAction {
+addTrackingEventAction(formData)
}
AdvanceStatusForm --> AddTrackingEventAction : "submits"
InternalNoteForm --> AddTrackingEventAction : "submits"
```

**Diagram sources**
- [components/ops/advance-status-form.tsx:1-92](file://components/ops/advance-status-form.tsx#L1-L92)
- [components/ops/internal-note-form.tsx:1-57](file://components/ops/internal-note-form.tsx#L1-L57)
- [server/ops.actions.ts:1-91](file://server/ops.actions.ts#L1-L91)

**Section sources**
- [components/ops/advance-status-form.tsx:1-92](file://components/ops/advance-status-form.tsx#L1-L92)
- [components/ops/internal-note-form.tsx:1-57](file://components/ops/internal-note-form.tsx#L1-L57)
- [server/ops.actions.ts:1-91](file://server/ops.actions.ts#L1-L91)

### Data Model and Relationships
The Operations Back Office primarily interacts with:
- Shipment: core entity with status, addresses, pricing, and timestamps.
- TrackingEvent: audit trail of status changes and notes, including source and visibility flags.
- User: owner of shipments and recorder of events.
- ServiceLevel: shipping tier used in the detail view.
- Address: sender and recipient locations.

```mermaid
erDiagram
USER {
string id PK
string email UK
string name
enum role
datetime createdAt
datetime updatedAt
}
SHIPMENT {
string id PK
string trackingNumber UK
enum status
string serviceLevelId FK
string senderAddressId FK
string recipientAddressId FK
datetime pickupDate
decimal price
string currency
enum paymentMethod
text notes
datetime createdAt
datetime updatedAt
}
TRACKING_EVENT {
string id PK
string shipmentId FK
enum statusCode
string location
text note
datetime occurredAt
boolean isPublic
string source
string recordedById FK
datetime createdAt
}
SERVICE_LEVEL {
string id PK
string code UK
string name
int slaDays
decimal priceMultiplier
boolean active
datetime createdAt
datetime updatedAt
}
ADDRESS {
string id PK
string contactName
string phone
string line1
string line2
string city
string region
string postalCode
string country
datetime createdAt
datetime updatedAt
}
USER ||--o{ SHIPMENT : owns
USER ||--o{ TRACKING_EVENT : records
SHIPMENT ||--o{ TRACKING_EVENT : has_events
SHIPMENT }o--|| SERVICE_LEVEL : uses
SHIPMENT }o--|| ADDRESS : sender
SHIPMENT }o--|| ADDRESS : recipient
```

**Diagram sources**
- [prisma/schema.prisma:57-78](file://prisma/schema.prisma#L57-L78)
- [prisma/schema.prisma:98-111](file://prisma/schema.prisma#L98-L111)
- [prisma/schema.prisma:131-154](file://prisma/schema.prisma#L131-L154)
- [prisma/schema.prisma:160-186](file://prisma/schema.prisma#L160-L186)
- [prisma/schema.prisma:209-226](file://prisma/schema.prisma#L209-L226)

**Section sources**
- [prisma/schema.prisma:57-78](file://prisma/schema.prisma#L57-L78)
- [prisma/schema.prisma:98-111](file://prisma/schema.prisma#L98-L111)
- [prisma/schema.prisma:131-154](file://prisma/schema.prisma#L131-L154)
- [prisma/schema.prisma:160-186](file://prisma/schema.prisma#L160-L186)
- [prisma/schema.prisma:209-226](file://prisma/schema.prisma#L209-L226)

## Dependency Analysis
The Operations Back Office depends on:
- Authentication and session utilities for role-based access control.
- Prisma client for database queries and transactions.
- Shared status library for consistent state machine rules.
- Notification subsystem for customer communications.

```mermaid
graph LR
OPS_LAYOUT["ops/layout.tsx"] --> AUTH["auth()"]
OPS_LAYOUT --> OPS_SERVICE["ops.service.ts::getOpsSession()"]
OPS_PAGE["ops/page.tsx"] --> OPS_SERVICE
OPS_SHIPMENT["ops/shipments/[id]/page.tsx"] --> OPS_SERVICE
OPS_ACTIONS["ops.actions.ts"] --> STATUS_LIB["shipment-status.ts"]
OPS_ACTIONS --> NOTIFICATIONS["notifications.ts"]
OPS_SERVICE --> STATUS_LIB
OPS_SERVICE --> PRISMA["Prisma Client"]
OPS_ACTIONS --> PRISMA
```

**Diagram sources**
- [ops/layout.tsx:1-48](file://app/ops/layout.tsx#L1-L48)
- [ops/page.tsx:1-200](file://app/ops/page.tsx#L1-L200)
- [ops/shipments/[id]/page.tsx:1-166](file://app/ops/shipments/[id]/page.tsx#L1-L166)
- [server/ops.actions.ts:1-91](file://server/ops.actions.ts#L1-L91)
- [server/ops.service.ts:1-163](file://server/ops.service.ts#L1-L163)
- [lib/shipment-status.ts:1-77](file://lib/shipment-status.ts#L1-L77)
- [lib/notifications.ts:1-114](file://lib/notifications.ts#L1-L114)

**Section sources**
- [ops/layout.tsx:1-48](file://app/ops/layout.tsx#L1-L48)
- [ops/page.tsx:1-200](file://app/ops/page.tsx#L1-L200)
- [ops/shipments/[id]/page.tsx:1-166](file://app/ops/shipments/[id]/page.tsx#L1-L166)
- [server/ops.actions.ts:1-91](file://server/ops.actions.ts#L1-L91)
- [server/ops.service.ts:1-163](file://server/ops.service.ts#L1-L163)
- [lib/shipment-status.ts:1-77](file://lib/shipment-status.ts#L1-L77)
- [lib/notifications.ts:1-114](file://lib/notifications.ts#L1-L114)

## Performance Considerations
- Concurrent reads: The queue page fetches summary and list data in parallel to reduce latency.
- Efficient queries: The service layer uses grouped aggregation for summaries and selective field projection for listings.
- Pagination limits: Page size is bounded to prevent excessive payloads.
- Transactions: Writes are wrapped in a single transaction to ensure consistency between event creation and shipment updates.
- Selective notifications: Notifications are only sent for meaningful updates or public events, reducing unnecessary I/O.
- Cache invalidation: Targeted revalidation minimizes unnecessary refetches across related routes.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and resolutions:
- Unauthorized access to operations:
  - Ensure the user has STAFF or ADMIN role.
  - Verify session initialization and middleware configuration.
- Illegal status transitions:
  - Confirm the requested target status is allowed from the current status according to the state machine.
  - Review the error message returned by the server action.
- Missing shipment:
  - Verify the shipment ID exists and is accessible.
- No notifications received:
  - Check user notification preferences for the relevant event type.
  - Inspect notification logs for skipped or failed deliveries.
  - Validate SMTP configuration and environment variables.
- UI does not reflect updates:
  - Ensure server action returns success and triggers revalidation.
  - Confirm client component refresh behavior after successful submission.

**Section sources**
- [ops/layout.tsx:1-48](file://app/ops/layout.tsx#L1-L48)
- [server/ops.actions.ts:26-90](file://server/ops.actions.ts#L26-L90)
- [lib/notifications.ts:49-108](file://lib/notifications.ts#L49-L108)
- [middleware.ts:1-14](file://middleware.ts#L1-L14)

## Conclusion
The Operations Back Office provides a secure, auditable, and user-friendly interface for managing shipments. It enforces strict role-based access, validates all state transitions, and integrates with a notification system to keep customers informed. The separation of concerns between pages, server actions, services, and domain logic makes the system maintainable and testable.

[No sources needed since this section summarizes without analyzing specific files]