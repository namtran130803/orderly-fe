---
name: tailwind-styling
description: Use when writing or editing Tailwind CSS v4 styles in this project. Project uses CSS custom properties (variables) defined in index.css with Tailwind arbitrary value syntax.
---

# Tailwind CSS v4 Styling Conventions

## Color variables (defined in `:root` in `index.css`)

Use arbitrary value syntax: `text-(--color-*)`, `bg-(--color-bg-*)`, `border-(--color-border-*)`

| Variable | Usage | Example |
|---|---|---|
| `--color-primary: #007aff` | Primary accent, links, icons | `text-(--color-primary)` |
| `--color-success: #34c759` | Success states | `text-(--color-success)` |
| `--color-danger: #ff3b30` | Delete, errors | `text-(--color-danger)` |
| `--color-warning: #ff9500` | Edit, warnings | `text-(--color-warning)` |
| `--color-info: #5856d6` | Info | `text-(--color-info)` |
| `--color-bg-main: #f7f7f7` | Page background | `bg-(--color-bg-main)` |
| `--color-bg-surface: #ffffff` | Card/surface background | `bg-(--color-bg-surface)` |
| `--color-bg-active: #f9fafb` | Active/hover state | `bg-(--color-bg-active)` |
| `--color-border-main: #e5e5ea` | Primary borders | `border-(--color-border-main)` |
| `--color-border-subtle: #f2f2f7` | Subtle borders | `border-(--color-border-subtle)` |
| `--color-text-main: #000000` | Primary text | `text-(--color-text-main)` |
| `--color-text-secondary: #8e8e93` | Secondary text | `text-(--color-text-secondary)` |
| `--color-text-muted: #c7c7cc` | Muted/placeholder | `text-(--color-text-muted)` |

## Layout

- Max-width container: `max-w-[390px]` (mobile-first, centered)
- Full-width borders with `border-y` and `border-(--color-border-main)`
- Dividers: `divide-y divide-(--color-border-main)`
- No rounded corners, no shadows (flat design)
- Font: `Inter`, size 14px base

## Common patterns

- Surface cards: `bg-(--color-bg-surface) border-y border-(--color-border-main) divide-y divide-(--color-border-main)`
- Form rows: `flex px-4 py-3 items-center gap-2`
- Header: `bg-(--color-bg-surface) h-15 px-4 flex items-center justify-between gap-2 border-b border-(--color-border-main)`
- Loading spinner: `size-10 border-2 border-(--color-primary) border-t-transparent rounded-full animate-spin`
- Active press effect (applied globally): `button:active, a:active { opacity: 0.5; }`
- Empty state: `flex flex-col items-center justify-center h-full text-(--color-text-muted)`
