---
kind: frontend_style
name: Tailwind v4 + CSS Variables Design Tokens with CVA Component Primitives
category: frontend_style
scope:
    - '**'
source_files:
    - app/globals.css
    - app/layout.tsx
    - components/ui/button.tsx
    - components/ui/card.tsx
    - components/ui/alert.tsx
    - components/ui/badge.tsx
    - components/ui/input.tsx
    - components/ui/select.tsx
    - components/ui/textarea.tsx
    - components/ui/field.tsx
    - components/ui/label.tsx
    - components/ui/spinner.tsx
---

## Approach

The Timberland Courier Delivery Platform uses **Tailwind CSS v4** (with `@tailwindcss/turbopack`) as its styling engine, combined with a **CSS custom properties design-token system** and a small internal component library built on **Class Variance Authority (CVA)** and `clsx`/`tailwind-merge`. There is no separate Tailwind config file — configuration lives in the single `app/globals.css` via the Tailwind v4 `@theme inline` directive.

## Key Files

- `app/globals.css` — only stylesheet; declares all design tokens, theme mapping, base styles, and one utility layer.
- `app/layout.tsx` — root layout that injects Geist Sans/Mono fonts as CSS variables (`--font-geist-sans`, `--font-geist-mono`) consumed by the theme.
- `components/ui/*` — shared primitive components (`button.tsx`, `card.tsx`, `alert.tsx`, `badge.tsx`, `field.tsx`, `input.tsx`, `label.tsx`, `select.tsx`, `spinner.tsx`, `textarea.tsx`).
- `package.json` — dependencies: `tailwindcss ^4`, `@tailwindcss/turbopack ^4`, `class-variance-authority ^0.7.1`, `clsx ^2.1.1`, `tailwind-merge ^3.7.0`, `lucide-react ^1.59.0`.

## Architecture & Conventions

### Design Tokens (CSS Custom Properties)

All colors, radii, and font families are defined as CSS variables under `:root` (light mode) and `.dark` (dark mode), covering:

- Semantic roles: `background`, `foreground`, `card`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `success`, `warning`, `border`, `input`, `ring`.
- Each semantic color has an associated `-foreground` variant for text-on-color usage.
- Radii are exposed as `--radius-lg` (0.75rem), `--radius-md` (0.5rem), `--radius-sm` (0.375rem).
- Fonts are exposed as `--font-sans` and `--font-mono`, sourced from the Geist variable fonts loaded in `app/layout.tsx`.

These variables are mapped into Tailwind's theme namespace via `@theme inline` using the `--color-*` convention (e.g. `--color-primary: var(--primary)`), so they can be used directly as Tailwind utilities like `bg-primary`, `text-muted-foreground`, `rounded-lg`, etc.

### Dark Mode

Dark mode is implemented through the `.dark` class selector on the document root. Components toggle it by adding/removing the `dark` class on `<html>` or `<body>`. The token pairs in `:root` vs `.dark` provide a light-first palette with forest-green primary (`#1f6f4a`) and amber accent (`#c88a2e`).

### Component Library Pattern

Shared UI primitives live under `components/ui/` and follow a consistent pattern:

1. **Primitive components** use Tailwind utility classes directly (e.g. `Card` composes `rounded-lg border border-border bg-card text-card-foreground shadow-sm`).
2. **Variants are declared with CVA** (`class-variance-authority`) — see `button.tsx` which defines `variant` (`primary`, `secondary`, `outline`, `ghost`, `destructive`, `accent`) and `size` (`sm`, `md`, `lg`, `icon`) variants, with defaults `variant="primary"` and `size="md"`.
3. **Class merging**: every component accepts a `className` prop and merges it via `cn(...)` (from `@/lib/utils`, which re-exports `clsx` + `tailwind-merge`) so callers can override or extend styles safely.
4. **Accessibility hooks**: buttons include `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1`, disabled states use `disabled:pointer-events-none disabled:opacity-50`, and components expose proper React ref forwarding where applicable.

### Typography & Base Styles

- Font loading uses Next.js `next/font/google` to load `Geist` and `Geist_Mono` as CSS variables, then referenced via `--font-sans` / `--font-mono` in the Tailwind theme.
- Global base styles set `body` background/foreground from tokens, apply `antialiased`, and use a flex column layout.
- A global `* { border-color: var(--border); }` rule applies the border token universally.
- One custom utility class `.container-page` is defined in `@layer utilities` providing a centered page container (`max-width: 80rem`, `padding-inline: 1rem`).

### Iconography

Icons come from `lucide-react`; there is no custom icon component layer — icons are imported and rendered inline within components.

### Responsive Strategy

Responsive behavior is expressed entirely through Tailwind's responsive prefixes (e.g. `sm:`, `md:`, `lg:`) applied directly in component className strings. No media-query-based CSS exists outside of the token/theme declarations.

## Conventions & Constraints

- **Single source of truth for colors/radii/fonts**: new visual tokens must be added as CSS custom properties in `:root` and `.dark` in `app/globals.css`, then mapped through `@theme inline` — not as ad-hoc hex values scattered across components.
- **Component classes go through `cn()`**: every component that accepts a `className` prop merges it via `cn()` rather than string concatenation, ensuring deterministic Tailwind class resolution.
- **Variant-driven styling**: multi-state UI elements (buttons, badges, alerts) declare their variants with CVA rather than conditional className branches inside JSX.
- **Semantic color tokens over literal colors**: components reference tokens like `bg-primary`, `text-muted-foreground`, `border-border` instead of hard-coded hex values, enabling dark-mode swaps and brand consistency.
- **Light-first palette**: the default `:root` defines the light theme; `.dark` overrides are additive. New tokens should therefore define both light and dark values.
- **No Tailwind config file**: all Tailwind configuration is done inline via `@theme` in `globals.css` (Tailwind v4 style). Adding a `tailwind.config.*` file would break this convention.