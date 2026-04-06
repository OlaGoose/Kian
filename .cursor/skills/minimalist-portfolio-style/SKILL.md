---
name: minimalist-portfolio-style
description: Design system and UI conventions for this minimalist personal portfolio (Next.js 15 + Tailwind v4). Defines typography, color palette, spacing, component patterns, and interaction standards. Use when building, editing, or reviewing any component, page, or style in this project, or when the user asks about colors, fonts, layout, hover effects, button styles, modals, links, or visual consistency.
---

# Minimalist Portfolio — UI Style Guide

Inspired by [leerob.com](https://leerob.com). The aesthetic is text-first, serif-driven, nearly colorless — content over decoration.

## Typography

**Font:** STIX Two Text (serif) — applied globally to `html, body` via CSS. All text is serif by default; `font-sans` overrides only for UI chrome (labels, tags, monospace code).

| Role | Class |
|------|-------|
| Page H1 | `text-xl md:text-2xl font-medium leading-[3.25rem]` |
| Section H2 (inner pages) | `text-xl md:text-2xl font-medium leading-[3.25rem] mb-1` |
| Body / prose | `text-copy` (16px mobile → 17px desktop ≥768px, line-height 1.7) |
| Sub-heading / label | `text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-600` |
| Meta text (dates, read time) | `text-[12px] text-neutral-400 dark:text-neutral-600` |
| Description / muted | `text-[13px] md:text-[15px] leading-relaxed text-neutral-500 dark:text-neutral-500` |
| Code inline | `text-[13px] bg-neutral-100 dark:bg-neutral-900 px-1.5 py-0.5 rounded-[2px] font-mono` |

## Color Palette

All colors are Tailwind neutral-scale + semantic:

| Token | Light | Dark |
|-------|-------|------|
| Background | `bg-white` | `bg-[#050505]` |
| Panel / card bg | `bg-white` | `bg-[#0a0a0a]` |
| Primary text | `text-neutral-900` | `text-neutral-100` |
| Secondary text | `text-neutral-500` | `text-neutral-500` |
| Muted / disabled | `text-neutral-400` | `text-neutral-600` |
| Border hairline | `border-neutral-100` | `border-neutral-900` |
| Border normal | `border-neutral-200` | `border-neutral-800` |
| Selection | `bg-neutral-200` | `bg-neutral-800` |
| Status: live | `text-emerald-600` | `text-emerald-500` |
| Status: wip | `text-amber-600` | `text-amber-500` |
| Status: archived | `text-neutral-400` | `text-neutral-400` |

## List Bullets

For `ul.text-copy` lists (home page writing list and similar), bullets are pure CSS — **no extra HTML elements needed in JSX**:

```css
ul.text-copy li {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem; /* 8px between bullet and text */
}
ul.text-copy li::before {
  content: '';
  flex-shrink: 0;
  width: 5px;
  height: 5px;
  margin-top: 0.63em; /* centers 5px square within the first text line */
  @apply bg-neutral-400;
}
.dark ul.text-copy li::before {
  @apply bg-neutral-600;
}
```

JSX: `<li>` should have **no** `pl-*` or flex classes — CSS handles everything. Use `<ul className="text-copy pl-0 space-y-1">` and bare `<li>` children.

## Links

All body links use this exact style (matches leerob.com):

```
transition-colors underline decoration-neutral-500 decoration-1 underline-offset-[2.5px] hover:decoration-neutral-400 dark:hover:decoration-neutral-600
```

Use `<CustomLink>` component for all internal/external prose links. Never use `font-bold` on links.

## Layout

- **Page container:** `w-full mt-0 md:mt-16` on `<main>`, then `max-w-[640px] mx-auto px-6 pt-10 pb-20 md:pt-0` on inner wrapper
- **No top padding on desktop** — `mt-16` from `<main>` provides the whitespace
- **Max content width:** 640px
- **Horizontal padding:** `px-6` (24px each side)

## Page Structure (Home)

```
H1 (name)                [calendar icon] [locale]
p.text-copy my-5  ...bio paragraph...
p.text-copy my-5  ...bio paragraph...
p.text-copy my-5  writing title
ul.text-copy.pl-0.space-y-1
  li.pl-1  <link>post title</link>
p.text-copy my-5  ...footer paragraph...
div.mt-12  [social icon row]
```

## Page Structure (Inner pages: blog, projects)

```
SiteHeader: [name link]   [blog] [projects]  [locale]
H1 + description (muted)
content...
```

`SiteHeader` uses `mb-8` and name styled as `text-copy font-medium`.

## Components

### Buttons — Primary
```
py-2.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black text-[12px] font-medium uppercase tracking-wider hover:opacity-80 transition-all active:scale-[0.99] disabled:opacity-25 rounded-[2px]
```

### Buttons — Ghost / Icon
```
text-neutral-400 dark:text-neutral-600 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors
```

### Inputs / Textareas
```
bg-white dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-[2px] p-3.5 text-[14px] focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors placeholder:text-neutral-400 dark:placeholder:text-neutral-600
```

### Modals
- **Desktop:** fixed, centered (`inset-0 flex items-center justify-center`), `max-w-[480px]`, `p-8`
- **Mobile:** bottom sheet (`items-end`), full-width, `rounded-t-[4px]`, drag handle
- Backdrop: `bg-black/5 dark:bg-black/30` (no blur on backdrop for performance)
- Animation: `y: 24 → 0`, `opacity: 0 → 1`, ease `[0.16, 1, 0.3, 1]`

### Dividers
```
h-[1px] bg-neutral-100 dark:bg-neutral-900
```

### Back link
```
text-[13px] text-neutral-500 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors
```
Format: `← Label` (plain text arrow, no icon component)

### Social icon row
```
mt-12 flex items-center gap-5 text-neutral-400 dark:text-neutral-600
```
Icons at `w-[17px] h-[17px] strokeWidth={1.5}`.

## Border Radius

Always `rounded-[2px]` — near-zero radius, barely visible. Never use `rounded-md` or larger in this project.

## Interactions

| Pattern | Class |
|---------|-------|
| Opacity dim on hover (name/heading links) | `hover:opacity-70 transition-opacity` |
| Color shift on hover (icon/nav) | `hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors` |
| Press feedback (buttons) | `active:scale-95` or `active:scale-[0.99]` |
| Disabled state | `disabled:opacity-25` |

## Dark Mode

All colors use Tailwind's `dark:` variant. Background is `#050505` (near black, not pure `#000000`). Panel bg is `#0a0a0a`. The palette is intentionally asymmetric: light mode uses `neutral-400` as muted, dark uses `neutral-600`.

## Animation

Minimal. Use `motion` (Framer Motion) only for:
- Modal open/close: `opacity` + `y` translate
- Dropdown menus: `opacity` + small `y`
- Audio progress bar: spring

No entrance animations on page content (no fade-in on mount for text/lists).
