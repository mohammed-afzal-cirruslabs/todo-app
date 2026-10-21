# DESIGN.md — Todo App Visual Direction

## Direction

**"Vercel-calm"** — the same quiet confidence as Linear and Vercel's own dashboard.
Clean white card on a barely-off-white canvas, a single indigo accent used sparingly,
generous whitespace, Inter for type. Nothing competes for attention; the todos do.

---

## Typeface

| Role | Family | Weight | Size token |
|---|---|---|---|
| App title | Inter | 400 | `--text-3xl` (48 px) |
| Body / input | Inter | 400 | `--text-base` (16 px) |
| Footer labels | Inter | 400 | `--text-sm` (13 px) |
| Filter chips | Inter | 500 | `--text-sm` (13 px) |

Letter-spacing on the title: `--tracking-wider` (0.2 em), lowercase.
No other typeface is introduced. System-ui is the fallback only.

---

## Colour palette

All values live in `src/tokens.css`. Never write a literal hex in a component.

### Light
| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#f8f9fb` | Page canvas |
| `--color-surface` | `#ffffff` | Main card |
| `--color-surface-hover` | `#f3f4f6` | Row hover |
| `--color-border` | `rgba(0,0,0,0.09)` | Dividers |
| `--color-accent` | `#6366f1` | Primary action, focus ring, active filter |
| `--color-accent-hover` | `#4f46e5` | Button hover |
| `--color-accent-subtle` | `#eef2ff` | Checkbox checked fill |
| `--color-danger` | `#ef4444` | Delete hover |
| `--color-text-primary` | `#111827` | Body text (≥ 4.5:1) |
| `--color-text-secondary` | `#6b7280` | Captions, placeholders |
| `--color-text-muted` | `#9ca3af` | Completed todo text |

### Dark (auto via `prefers-color-scheme: dark`)
Surfaces go darker (`#0f1117` / `#1a1d27`), accent lightens to `#818cf8`,
text inverts to `#f1f5f9`. Depth comes from lighter surfaces, not heavier shadows.

---

## Spacing scale (4 px base)

`--space-1` (4) · `--space-2` (8) · `--space-3` (12) · `--space-4` (16) ·
`--space-5` (20) · `--space-6` (24) · `--space-8` (32) · `--space-10` (40) · `--space-12` (48)

No ad-hoc values. If a gap isn't in the scale, pick the nearest step.

---

## Radii

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 4 px | Filter chips, delete button, focus ring |
| `--radius-md` | 10 px | Main card |
| `--radius-full` | 9999 px | Custom checkbox ring |

---

## Elevation

| Token | Use |
|---|---|
| `--shadow-sm` | Subtle inset / pressed state |
| `--shadow-md` | Main card (default) |
| `--shadow-lg` | Dropdown / modal (reserve) |

---

## Motion

Single duration/easing pair for all transitions:
`var(--duration-base)` (150 ms) `var(--ease-out)`.
Fast interactions (hover opacity): `var(--duration-fast)` (100 ms).
Honour `prefers-reduced-motion: reduce` — set `--duration-base: 0ms` in that query.

---

## Component specifications

### Input row
- Full-width flex row, `border-bottom: 1px solid var(--color-border)`
- Text input: `flex: 1`, `padding: var(--space-4) var(--space-5)`, no border, no outline — focus goes on the **row** (outline on `.todo-input-form:focus-within`)
- Add button: `height: var(--control-lg)` (44 px), `padding: 0 var(--space-6)`, `background: var(--color-accent)`, `color: var(--color-text-on-accent)`, `border-radius: 0` (flush with card edge), hover → `var(--color-accent-hover)`
- Disabled state: `opacity: 0.4`, `cursor: not-allowed`

### Todo list rows
- `padding: var(--space-3) var(--space-5)` — 12 px top/bottom, 20 px sides
- `gap: var(--space-3)` between checkbox and text
- Hover: `background: var(--color-surface-hover)` — use the token, not `#fafafa`
- Divider: `border-bottom: 1px solid var(--color-border)` except last child

### Custom checkbox
Replace `accent-color` with a fully custom control:
- 18 × 18 px `appearance: none` circle (`border-radius: var(--radius-full)`)
- Unchecked: `border: 2px solid var(--color-border)` (thickened to `rgba(0,0,0,0.2)`)
- Checked: `background: var(--color-accent)`, `border-color: var(--color-accent)`, white SVG tick via `background-image`
- Focus: `outline: 2px solid var(--color-border-focus)`, `outline-offset: 2px`

### Completed state
- Text: `text-decoration: line-through`, `color: var(--color-text-muted)`
- Checkbox: checked style above — the strikethrough + muted colour is the full signal

### Delete affordance
- `opacity: 0` at rest, `opacity: 1` on `.todo-item:hover` (100 ms)
- Icon: `✕` character at `--text-sm`, `color: var(--color-text-secondary)`
- Hover: `color: var(--color-danger)`
- Touch: always visible on pointer: coarse (mobile) — add `@media (pointer: coarse) { .todo-item__delete { opacity: 1 } }`
- Hit area: `padding: var(--space-2) var(--space-2)`, `border-radius: var(--radius-sm)`

### Footer / filter bar
- `padding: var(--space-3) var(--space-5)`, `font-size: var(--text-sm)`
- Filter chips: `border: 1px solid transparent`, `border-radius: var(--radius-sm)`, `padding: var(--space-1) var(--space-3)`
- Active chip: `border-color: var(--color-accent)`, `color: var(--color-accent)`, `background: var(--color-accent-subtle)`
- "Clear completed": `color: var(--color-text-secondary)`, hover → `var(--color-danger)`

### Empty state
- `padding: var(--space-10) var(--space-5)`, centred, `color: var(--color-text-secondary)`, `font-size: var(--text-base)`
- Text: "No todos yet — add one above ↑"

### Focus ring (global rule)
```css
:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```
No default browser ring anywhere. Every interactive element has this.

---

## What is NOT in scope here

- Animations beyond hover/transition
- Drag-to-reorder
- Persistence / backend
- Any icon library (✕ is a character; a lucide `X` icon is an acceptable upgrade)

---

## Reference

Palette and density modelled on [Linear](https://linear.app) and [Vercel dashboard](https://vercel.com/dashboard).
Typeface: Inter (Google Fonts, `wght@400;500;600`).
