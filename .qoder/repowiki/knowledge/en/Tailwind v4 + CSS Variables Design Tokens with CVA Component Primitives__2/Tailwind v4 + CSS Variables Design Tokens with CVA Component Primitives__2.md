---
kind: frontend_style
name: Tailwind v4 + CSS Variables Design Tokens with CVA Component Primitives
category: frontend_style
scope:
    - '**'
source_files:
    - app/globals.css
    - components/ui/button.tsx
    - components/ui/card.tsx
    - components/ui/field.tsx
    - components/ui/input.tsx
    - components/ui/alert.tsx
    - components/ui/badge.tsx
    - components/ui/spinner.tsx
    - package.json
---

## Approach

The app uses **Tailwind CSS v4** (via `@tailwindcss/turbopack`) as the styling engine, with a **light-first CSS custom properties palette** declared in `app/globals.css` and exposed to Tailwind through the `@theme inline` block. Components are built from small primitives under `components/ui/`, composed with utility classes rather than bespoke component styles.

Key packages:
- `tailwindcss` ^4, `@tailwindcss/turbopack` ^4 — Tailwind v4 pipeline
- `class-variance-authority` (`cva`) — variant-driven style composition on primitive components
- `clsx` + `tailwind-merge` — className merging via a shared `cn` helper in `lib/utils.ts`
- `lucide-react` — icon library used throughout the UI

No SCSS/Sass, no CSS-in-JS runtime, no external component library (e.g. shadcn/ui) is vendored — the `components/ui/*` files are hand-written primitives modeled after that pattern.

## Key Files

- `app/globals.css` — single source of design tokens: CSS variables for light/dark palettes, font names, border radii, plus a `container-page` utility class.
- `components/ui/button.tsx` — canonical example of a CVA-based primitive exposing `variant` (`primary|secondary|outline|ghost|destructive|accent`) and `size` (`sm|md|lg|icon`).
- `components/ui/card.tsx` — compound component (`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`) using semantic color tokens (`bg-card`, `text-card-foreground`, `border-border`).
- `components/ui/field.tsx`, `input.tsx`, `label.tsx`, `select.tsx`, `textarea.tsx`, `alert.tsx`, `badge.tsx`, `spinner.tsx` — other primitives following the same token-driven pattern.
- `package.json` — declares the Tailwind v4 dependency stack and the `cn`-related utilities.

## Architecture & Conventions

1. **Design tokens live in CSS variables.** `globals.css` defines a `:root` light palette (forest-green primary `#1f6f4a`, amber accent `#c88a2e`, neutral backgrounds `#f7f8f6`) and a `.dark` override. These variables are re-exported into Tailwind's theme namespace via `@theme inline { --color-* }`, so components reference semantic names like `bg-primary`, `text-muted-foreground`, `border-border` instead of raw hex values.

2. **Dark mode is class-based.** The `.dark` selector toggles the entire palette; there is no JS toggle logic visible in the styled files — consumers add the `dark` class to an ancestor element.

3. **Primitive components use CVA variants.** `button.tsx` demonstrates the pattern: a `cva()` call defines base styles plus `variant` and `size` maps, with `defaultVariants`. Other primitives follow suit, keeping visual decisions declarative and centralized.

4. **className composition via `cn`.** Every primitive spreads a user-supplied `className` through `cn(...)` from `@/lib/utils`, which merges with `clsx` and `tailwind-merge` — allowing callers to override or extend default styles safely.

5. **Semantic color tokens over named colors.** Components never hardcode brand colors; they consume `--color-primary`, `--color-accent`, `--color-destructive`, etc., making them automatically theme-aware.

6. **Typography and spacing are Tailwind utilities.** Fonts are set via `--font-sans: var(--font-geist-sans)` and `--font-mono: var(--font-geist-mono)` in the `@theme` block; radius tokens (`--radius-lg/md/sm`) are also exposed. Spacing, sizing, and layout are expressed with Tailwind utility classes directly in JSX.

7. **Global reset conventions.** A universal `* { border-color: var(--border); }` rule applies the tokenized border color everywhere, and `body` sets background/foreground/font-family from tokens.

8. **Page-level container utility.** A single `.container-page` utility in `@layer utilities` constrains page content to `max-width: 80rem` with centered margins and horizontal padding — reused across pages rather than repeated inline.

9. **Component organization by feature area.** Under `components/`, directories mirror route groups (`account/`, `auth/`, `layout/`, `ops/`, `quote/`, `shipment/`, `tracking/`), while cross-cutting primitives live in `components/ui/`.

## Conventions & Constraints

- **Use semantic Tailwind color tokens** (`bg-primary`, `text-muted-foreground`, `border-border`, `bg-card`, etc.) defined in `globals.css`; do not introduce new ad-hoc hex colors in component JSX.
- **Build new interactive primitives with `cva`** (as in `button.tsx`) when a component has multiple visual variants or sizes; keep variant/sizing maps exhaustive and typed via `VariantProps<typeof ...>`.
- **Merge user classNames through `cn`** from `@/lib/utils` on every exported primitive so callers can override defaults without breaking internal structure.
- **Dark-mode support is opt-in via the `.dark` class** on an ancestor; any new token added to `:root` should also be mirrored in the `.dark` block to maintain the light-first palette.
- **Fonts and radii go through the `@theme inline` block** in `globals.css` so they propagate as Tailwind design tokens (`--font-sans`, `--radius-*`), rather than being referenced as raw CSS variables in components.
- **Global resets belong in `globals.css`**, not per-component styles — the universal `border-color` and `body` rules illustrate this boundary.
- **Page containers use the `.container-page` utility** from `@layer utilities` rather than repeating max-width/margin patterns inline.