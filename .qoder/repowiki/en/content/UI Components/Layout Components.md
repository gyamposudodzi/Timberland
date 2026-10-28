# Layout Components

<cite>
**Referenced Files in This Document**
- [site-header.tsx](file://components/layout/site-header.tsx)
- [user-menu.tsx](file://components/layout/user-menu.tsx)
- [site-footer.tsx](file://components/layout/site-footer.tsx)
- [layout.tsx](file://app/layout.tsx)
- [auth.ts](file://lib/auth.ts)
- [auth.config.ts](file://lib/auth.config.ts)
- [middleware.ts](file://middleware.ts)
- [robots.ts](file://app/robots.ts)
- [sitemap.ts](file://app/sitemap.ts)
</cite>

## Update Summary
**Changes Made**
- Updated SiteHeader section to document the new UserMenu component integration
- Added comprehensive UserMenu component documentation
- Enhanced authentication state handling documentation
- Updated responsive behavior descriptions
- Added role-based navigation examples

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
This document explains the layout components SiteHeader, SiteFooter, and the new UserMenu component, focusing on their structure, navigation patterns, responsive behavior, authentication integration, and SEO considerations. It also shows how these components integrate with Next.js App Router and provides guidance for customization and extension.

## Project Structure
The layout components live under a dedicated layout folder and are composed into the root layout:
- SiteHeader: top-of-page navigation and user actions
- UserMenu: interactive dropdown menu for authenticated users with role-based navigation
- SiteFooter: site-wide links and legal information
- Root layout: wraps pages with header, main content, and footer

```mermaid
graph TB
subgraph "App Router"
RootLayout["Root Layout<br/>app/layout.tsx"]
end
subgraph "Layout Components"
Header["SiteHeader<br/>components/layout/site-header.tsx"]
UserMenu["UserMenu<br/>components/layout/user-menu.tsx"]
Footer["SiteFooter<br/>components/layout/site-footer.tsx"]
end
RootLayout --> Header
Header --> UserMenu
RootLayout --> Footer
```

**Diagram sources**
- [layout.tsx:20-30](file://app/layout.tsx#L20-L30)
- [site-header.tsx:13-77](file://components/layout/site-header.tsx#L13-L77)
- [user-menu.tsx:15-99](file://components/layout/user-menu.tsx#L15-L99)
- [site-footer.tsx:3-45](file://components/layout/site-footer.tsx#L3-L45)

**Section sources**
- [layout.tsx:1-31](file://app/layout.tsx#L1-L31)
- [site-header.tsx:1-77](file://components/layout/site-header.tsx#L1-L77)
- [user-menu.tsx:1-99](file://components/layout/user-menu.tsx#L1-L99)
- [site-footer.tsx:1-45](file://components/layout/site-footer.tsx#L1-L45)

## Core Components
- **SiteHeader**
  - Provides branding, primary navigation, and authentication-aware actions
  - Integrates the new UserMenu component for enhanced user interaction
  - Uses server-side session access to render different UI based on login state
  - Implements sticky positioning and responsive visibility for navigation links
- **UserMenu** (New)
  - Interactive dropdown menu showing user profile information
  - Role-based navigation with conditional Ops link for STAFF/ADMIN users
  - Accessible menu with keyboard navigation and screen reader support
  - Client-side state management for open/close interactions
- **SiteFooter**
  - Presents grouped navigation links (Services, Support, Legal) and a copyright notice
  - Uses responsive grid columns to adapt from mobile to desktop layouts

Key responsibilities:
- Consistent site-wide navigation
- Enhanced authentication state display with user context
- Responsive design across breakpoints
- Integration with Next.js routing and metadata
- Role-based access control in navigation

**Section sources**
- [site-header.tsx:13-77](file://components/layout/site-header.tsx#L13-L77)
- [user-menu.tsx:15-99](file://components/layout/user-menu.tsx#L15-L99)
- [site-footer.tsx:3-45](file://components/layout/site-footer.tsx#L3-L45)

## Architecture Overview
The layout components are rendered by the root layout, which is the entry point for all pages in the App Router. The header reads the current session via NextAuth and renders appropriate UI including the new UserMenu component. The footer is static but structured for easy extension.

```mermaid
sequenceDiagram
participant Browser as "Browser"
participant NextJS as "Next.js App Router"
participant Root as "Root Layout"
participant Header as "SiteHeader"
participant UserMenu as "UserMenu"
participant Auth as "NextAuth Session"
participant Footer as "SiteFooter"
Browser->>NextJS : Request page
NextJS->>Root : Render root layout
Root->>Header : Render SiteHeader
Header->>Auth : Read session
Auth-->>Header : Session data
Header->>UserMenu : Pass user props
UserMenu->>UserMenu : Handle client interactions
Header-->>Root : Rendered header
Root->>Footer : Render SiteFooter
Footer-->>Root : Rendered footer
Root-->>NextJS : Completed layout
NextJS-->>Browser : HTML response
```

**Diagram sources**
- [layout.tsx:20-30](file://app/layout.tsx#L20-L30)
- [site-header.tsx:13-77](file://components/layout/site-header.tsx#L13-L77)
- [user-menu.tsx:15-99](file://components/layout/user-menu.tsx#L15-L99)
- [auth.ts:37-42](file://lib/auth.ts#L37-L42)

**Section sources**
- [layout.tsx:20-30](file://app/layout.tsx#L20-L30)
- [site-header.tsx:13-77](file://components/layout/site-header.tsx#L13-L77)
- [user-menu.tsx:15-99](file://components/layout/user-menu.tsx#L15-L99)
- [auth.ts:37-42](file://lib/auth.ts#L37-L42)

## Detailed Component Analysis

### SiteHeader
Structure and behavior:
- Branding link to home
- Primary navigation array that maps to links
- Conditional rendering based on authentication state:
  - Signed-in: show notification bell icon and UserMenu component
  - Signed-out: show sign-in and create account buttons
- Sticky header with backdrop blur and z-index layering
- Responsive navigation: hidden on small screens, visible at medium breakpoint

Navigation pattern:
- Centralized NAV array makes it easy to add or reorder links
- All links use Next.js Link for client-side navigation

Authentication integration:
- Reads session using NextAuth's auth function
- Passes user data (name, email, role, userId) to UserMenu component
- Sign-out handled within UserMenu component via server action

Responsive behavior:
- Navigation links hidden below medium breakpoint
- Account name link hidden below small breakpoint; button remains accessible

SEO considerations:
- Semantic header element improves accessibility and SEO
- Links provide clear anchor text for crawlers

Customization options:
- Add items to the NAV array to extend top-level navigation
- Replace brand icon/text with your logo component
- Adjust breakpoints or visibility classes to change responsive behavior
- Extend conditional logic to show additional authenticated-only links

Mobile responsiveness:
- Current implementation hides the nav on small screens; consider adding a collapsible menu if needed
- Ensure focus management and keyboard navigation when extending with a mobile menu

Extending examples:
- Add a new top-level route by pushing an object to the NAV array
- Show a notification badge next to the notification bell when signed in
- Integrate a theme toggle button in the right-hand controls area

```mermaid
flowchart TD
Start(["Render SiteHeader"]) --> ReadSession["Read session via NextAuth"]
ReadSession --> HasUser{"User present?"}
HasUser --> |Yes| ShowUserMenu["Show notification bell and UserMenu"]
HasUser --> |No| ShowAuthButtons["Show sign-in and create account buttons"]
ShowUserMenu --> RenderNav["Render primary navigation links"]
ShowAuthButtons --> RenderNav
RenderNav --> End(["Return header markup"])
```

**Diagram sources**
- [site-header.tsx:13-77](file://components/layout/site-header.tsx#L13-L77)

**Section sources**
- [site-header.tsx:13-77](file://components/layout/site-header.tsx#L13-L77)
- [auth.ts:37-42](file://lib/auth.ts#L37-L42)

### UserMenu (New Component)
Structure and behavior:
- Interactive dropdown menu triggered by clicking user avatar/name
- Displays user information (name, email) in menu header
- Shows profile link and conditional Ops link for staff/admin users
- Includes sign-out functionality with loading state management
- Fully accessible with proper ARIA attributes and keyboard navigation

Client-side features:
- Dropdown open/close state management
- Click-outside-to-close functionality
- Keyboard navigation support (Escape to close)
- Loading state during sign-out operations
- User initials generation from name/email/ID

Role-based navigation:
- Detects STAFF or ADMIN roles to show Ops link
- Conditional rendering based on user permissions
- Maintains consistent UI regardless of role

Accessibility features:
- Proper ARIA attributes (aria-haspopup, aria-expanded, role="menu")
- Keyboard navigation support
- Screen reader friendly labels
- Focus management

Props interface:
- name: string - User's display name
- email: string | null - User's email address
- role: string | null - User's role for permission checks
- userId: string - Unique user identifier
- signOutAction: () => Promise<void> - Server action for signing out

```mermaid
flowchart TD
Start(["User clicks menu trigger"]) --> ToggleOpen["Toggle dropdown open state"]
ToggleOpen --> IsOpen{"Menu open?"}
IsOpen --> |Yes| ShowMenu["Display dropdown menu"]
IsOpen --> |No| HideMenu["Hide dropdown menu"]
ShowMenu --> CheckRole{"User is STAFF/ADMIN?"}
CheckRole --> |Yes| ShowOps["Show Ops link"]
CheckRole --> |No| SkipOps["Skip Ops link"]
ShowOps --> MenuItems["Profile + Ops + Sign Out"]
SkipOps --> MenuItems
MenuItems --> Actions{"User action?"}
Actions --> |Profile| NavigateProfile["Navigate to /account"]
Actions --> |Ops| NavigateOps["Navigate to /ops"]
Actions --> |Sign Out| HandleSignOut["Handle sign out with loading state"]
```

**Diagram sources**
- [user-menu.tsx:15-99](file://components/layout/user-menu.tsx#L15-L99)

**Section sources**
- [user-menu.tsx:15-99](file://components/layout/user-menu.tsx#L15-L99)

### SiteFooter
Structure and behavior:
- Four-column responsive grid for sections: brand description, services, support, legal
- Each section contains a heading and a list of links
- Copyright line with dynamic year

Navigation pattern:
- Grouped links improve discoverability and crawlability
- Uses semantic lists and headings for better accessibility

Responsive behavior:
- Grid switches from two columns on small screens to four columns on medium and above

SEO considerations:
- Semantic footer and list elements help search engines understand site structure
- Clear link labels aid indexing

Customization options:
- Add new sections by duplicating a column block
- Update copy and links to reflect product changes
- Adjust grid breakpoints to fit more or fewer columns

Extending examples:
- Add a social media links section
- Include a newsletter signup form inside a new column
- Add a "Contact" section with email and phone links

```mermaid
flowchart TD
Start(["Render SiteFooter"]) --> BuildGrid["Build responsive grid"]
BuildGrid --> Sections["Render sections: Services, Support, Legal"]
Sections --> Copyright["Render copyright line"]
Copyright --> End(["Return footer markup"])
```

**Diagram sources**
- [site-footer.tsx:3-45](file://components/layout/site-footer.tsx#L3-L45)

**Section sources**
- [site-footer.tsx:3-45](file://components/layout/site-footer.tsx#L3-L45)

## Dependency Analysis
The layout components depend on:
- Next.js Link for navigation
- NextAuth for session reading and sign-out
- UI primitives for buttons
- CSS utilities for layout and responsiveness
- Lucide React icons for visual elements

```mermaid
graph LR
Header["SiteHeader"] --> NextLink["next/link"]
Header --> NextAuth["NextAuth (auth, signOut)"]
Header --> Button["UI Button"]
Header --> UserMenu["UserMenu"]
UserMenu --> NextLink
UserMenu --> Icons["lucide-react"]
Footer["SiteFooter"] --> NextLink
```

**Diagram sources**
- [site-header.tsx:1-5](file://components/layout/site-header.tsx#L1-L5)
- [user-menu.tsx:1-5](file://components/layout/user-menu.tsx#L1-L5)
- [site-footer.tsx:1-1](file://components/layout/site-footer.tsx#L1-L1)
- [auth.ts:37-42](file://lib/auth.ts#L37-L42)

**Section sources**
- [site-header.tsx:1-5](file://components/layout/site-header.tsx#L1-L5)
- [user-menu.tsx:1-5](file://components/layout/user-menu.tsx#L1-L5)
- [site-footer.tsx:1-1](file://components/layout/site-footer.tsx#L1-L1)
- [auth.ts:37-42](file://lib/auth.ts#L37-L42)

## Performance Considerations
- Server-side session read in SiteHeader avoids unnecessary client hydration for auth state.
- UserMenu uses client-side state management for optimal interactivity without full re-renders.
- Sticky header with backdrop blur may impact performance on low-end devices; test scrolling performance.
- Keep the NAV array small to avoid excessive re-renders when updating navigation.
- Prefer static content in SiteFooter to minimize runtime work.
- UserMenu's click-outside detection uses efficient event listeners with proper cleanup.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and resolutions:
- Header does not reflect logged-in state
  - Verify NextAuth is configured and handlers are mounted.
  - Confirm middleware guards and session strategy are set correctly.
- UserMenu not appearing or not functioning
  - Ensure user props are being passed correctly from SiteHeader.
  - Check that the UserMenu component is properly imported and exported.
- Sign-out does not redirect
  - Ensure the sign-out form calls signOut with redirectTo.
  - Check that the route handler for NextAuth exists and is exported.
- Navigation links not appearing on mobile
  - Current implementation hides the nav below medium breakpoint; add a mobile menu if required.
- Footer links not clickable or broken
  - Validate href values and ensure target routes exist.
- Role-based navigation not working
  - Verify user role is being passed correctly from NextAuth session.
  - Check that role comparison logic in UserMenu matches expected role values.

Relevant configuration points:
- NextAuth setup and providers
- Middleware matcher for protected routes
- Root layout composition
- User role assignment in database schema

**Section sources**
- [auth.ts:37-42](file://lib/auth.ts#L37-L42)
- [auth.config.ts:11-41](file://lib/auth.config.ts#L11-L41)
- [middleware.ts:1-13](file://middleware.ts#L1-L13)
- [site-header.tsx:40-59](file://components/layout/site-header.tsx#L40-L59)
- [user-menu.tsx:20-21](file://components/layout/user-menu.tsx#L20-L21)

## Conclusion
SiteHeader, UserMenu, and SiteFooter provide a consistent, responsive foundation for site-wide navigation and branding. They integrate cleanly with Next.js App Router and NextAuth, offering a solid base for customization. The new UserMenu component enhances the user experience with interactive dropdown functionality, role-based navigation, and improved accessibility. Use the provided patterns to extend navigation, adjust responsive behavior, and maintain strong SEO through semantic markup and clear link structures.

[No sources needed since this section summarizes without analyzing specific files]

## Appendices

### SEO Configuration
- Global metadata is defined in the root layout, including title templates and description.
- Robots rules disallow sensitive routes and point to the sitemap.
- Sitemap includes public marketing and utility pages.

**Section sources**
- [layout.tsx:10-18](file://app/layout.tsx#L10-L18)
- [robots.ts:1-16](file://app/robots.ts#L1-L16)
- [sitemap.ts:1-16](file://app/sitemap.ts#L1-L16)