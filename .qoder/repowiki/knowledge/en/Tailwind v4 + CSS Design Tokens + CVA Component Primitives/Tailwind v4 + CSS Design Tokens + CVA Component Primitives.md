---
kind: frontend_style
name: Tailwind v4 + CSS Design Tokens + CVA Component Primitives
category: frontend_style
scope:
    - '**'
source_files:
    - app/globals.css
    - components/ui/button.tsx
    - components/ui/card.tsx
    - components/ui/alert.tsx
    - components/ui/badge.tsx
    - components/ui/field.tsx
    - components/ui/input.tsx
    - components/ui/select.tsx
    - components/ui/textarea.tsx
    - components/ui/label.tsx
    - components/ui/spinner.tsx
    - package.json
---

## Approach

The app uses **Tailwind CSS v4** (via `@tailwindcss/turbopack`) with a light-first, forest-green primary palette defined as CSS custom properties and exposed through Tailwind's `@theme inline` directive. UI primitives live in `components/ui/` and are composed using **class-variance-authority (cva)** for variant-driven components and **clsx + tailwind-merge** via a shared `cn()` helper from `lib/utils.ts`. There is no separate `tailwind.config.*` file — configuration is done entirely inside `app/globals.css`.

## Key Files

- `app/globals.css` — single source of design tokens, dark-mode overrides, theme mapping, base styles, and the `container-page` utility.
- `components/ui/*` — primitive components (`button`, `card`, `alert`, `badge`, `input`, `select`, `textarea`, `field`, `label`, `spinner`).
- `package.json` — declares `tailwindcss ^4`, `class-variance-authority ^0.7.1`, `clsx ^2.1.1`, `tailwind-merge ^3.7.0`, `lucide-react ^1.59.0`.
- `next.config.ts` / `eslint.config.mjs` — Next.js + ESLint config (no Tailwind-specific overrides observed).

## Architecture & Conventions

### Design Tokens
All colors, fonts, and radii are declared as CSS variables under `:root` (light) and `.dark` (dark), then mapped into Tailwind's theme namespace via `@theme inline`:

- Semantic color tokens: `--background`, `--foreground`, `--card`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--success`, `--warning`, `--border`, `--input`, `--ring`.
- Typography: `--font-sans` → `var(--font-geist-sans)`, `--font-mono` → `var(--font-geist-mono)`.
- Radius scale: `--radius-lg: 0.75rem`, `--radius-md: 0.5rem`, `--radius-sm: 0.375rem`.

This gives both a light and dark palette without any JS theme provider; toggling the `.dark` class on `<html>` switches all semantic tokens.

### Primitive Components
Each component in `components/ui/` follows one of two patterns:

1. **Variant-based (cva):** `button.tsx`, `alert.tsx`, `badge.tsx` define a `cva(...)` with `variant` and/or `size` keys, then merge with user `className` via `cn(...)`. Example from `button.tsx`:
   ```ts
   const buttonVariants = cva(
     "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ...",
     { variants: { variant: { primary, secondary, outline, ghost, destructive, accent }, size: { sm, md, lg, icon } } }
   );
   ```
2. **Composition-based:** `card.tsx` exports `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` — each a thin wrapper around a `<div>`/`<h3>`/`<p>` that applies a fixed Tailwind class string merged with `cn(className)`.

All components accept an optional `className` prop and forward it through `cn(...)`, so consumers can override or extend styles.

### Utility Layer
`cn` (from `@/lib/utils`) wraps `clsx` + `tailwind-merge`; every component spreads `className={cn(base, className)}`. This is the only place where arbitrary Tailwind classes should be concatenated — page-level components also use `cn` directly (e.g. `app/ops/page.tsx`, `components/tracking/tracking-timeline.tsx`).

### Global Styles
- `* { border-color: var(--border); }` applies the tokenized border color globally.
- `body` sets background, foreground, and font family from tokens.
- A single utility class `.container-page` (in `@layer utilities`) provides a centered content container (`max-width: 80rem`, `padding-inline: 1rem`).

### Icons
Icons come from `lucide-react` (declared in dependencies). No icon wrapper component was found — icons are imported and rendered directly by feature components.

### Responsive Strategy
No custom breakpoints or media queries were observed. Responsiveness is achieved purely through Tailwind's responsive prefixes (e.g. `sm:`, `md:`) applied in JSX class strings across pages and components.

## Conventions Observed

- All visual values go through CSS custom properties in `app/globals.css`; raw hex literals are not used in component classes (they appear only in the token definitions).
- Variantful components use `cva` + `VariantProps<typeof ...>` typed props (see `button.tsx`).
- Every component merges its own base classes with incoming `className` via `cn` — never concatenates strings manually.
- Dark mode is handled by the `.dark` selector block mirroring every `:root` token.
- The `@theme inline` block is the single point where CSS variables are exposed as Tailwind theme values (`--color-*`, `--font-*`, `--radius-*`).
- Feature pages compose primitives from `components/ui/` rather than writing ad-hoc styled blocks.
- No SCSS/Sass, PostCSS plugins, CSS-in-JS, or external UI kit (shadcn-style) beyond these hand-written primitives.