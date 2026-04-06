---
name: portfolio-architecture
description: Architecture best practices for this Next.js 15 + Supabase + next-intl minimalist portfolio. Covers directory structure, component boundaries (server vs client), data fetching patterns, Supabase client selection, state management, and file organization. Use when adding new pages, components, API routes, or data models; when deciding where logic should live; or when asked about project structure, data fetching, or component splitting.
---

# Portfolio — Architecture Best Practices

## Directory Structure

```
src/
  app/                    # Next.js App Router — routes only
    [locale]/             # All user-facing pages under locale segment
    api/                  # Route Handlers (no locale needed)
    sitemap.ts, robots.ts, manifest.ts, feed.xml/  # Special file routes
    layout.tsx            # Root layout (metadataBase, RSS alternate only)
    globals.css           # Tailwind + theme tokens
  components/             # UI, grouped by domain
    blog/ chat/ feedback/ home/ layout/ ui/ booking/
  lib/                    # Shared utilities, not UI
    constants.ts          # SITE_URL, site metadata
    metadata.ts           # getAlternates()
    seo.ts                # buildPageMetadata()
    structured-data.ts    # JSON-LD builders
    supabase/
      server.ts           # SSR cookie-aware client (server components)
      build.ts            # Plain anon client (generateStaticParams, sitemap)
    localized-content.ts  # localizedText() bilingual helper
    notes.ts                # Static file-based notes content
  i18n/
    routing.ts            # defineRouting config (single source of truth)
    request.ts            # next-intl plugin entry
    navigation.ts         # Locale-aware Link, redirect, useRouter exports
  types/
    index.ts              # All shared types (barrel)
messages/                 # i18n JSON catalogs: en.json, zh.json
```

## Component Boundaries: Server vs Client

**Default: Server Component.** Pages fetch data and pass it down as props.

**Pattern for interactive pages:**
```
src/app/[locale]/home/page.tsx       ← async server component
  → fetches from Supabase
  → renders <HomeClient posts={posts} locale={locale} />

src/components/home/home-client.tsx  ← 'use client'
  → receives typed props, handles interactivity
```

**Rules:**
- Keep `'use client'` at the leaf. Never hoist it to layout or page unless unavoidable.
- Never call Supabase from a client component — use server component or API route.
- API route handlers in `src/app/api/` are the bridge for client-initiated mutations.

## Supabase Client Selection

| Context | Client | File |
|---------|--------|------|
| Server component / route handler (runtime) | `createClient()` | `src/lib/supabase/server.ts` |
| `generateStaticParams`, `sitemap.ts`, `feed.xml` | `createBuildClient()` | `src/lib/supabase/build.ts` |
| Client component | **Never** — use API route | — |

## Data Fetching

- **Server components**: `async` function, `await supabase.from(...)` directly.
- **ISR**: `export const revalidate = 3600` on list pages, sitemap, feed.
- **Static generation**: `generateStaticParams` with `createBuildClient` for blog slugs × locales.
- **Client mutations**: `fetch('/api/feedback', { method: 'POST', body: JSON.stringify(...) })`.
- **Static content** (notes): imported arrays from `src/lib/notes.ts` — no DB needed.

## State Management

No global state library. Keep it simple:
- **Server**: request-scoped (Supabase queries per render).
- **Client**: `useState` / `useReducer` local to the component.
- No Zustand, Redux, Jotai, or Context unless absolutely required by a feature.

## Component File Conventions

| Thing | Convention |
|-------|-----------|
| File name | `kebab-case.tsx` |
| Component name | `PascalCase` named export |
| Domain grouping | `src/components/<domain>/component-name.tsx` |
| Shared primitives | `src/components/ui/` |
| Page-specific client | `src/components/<domain>/<page>-client.tsx` |

## Adding a New Page Checklist

1. Create `src/app/[locale]/<route>/page.tsx` (async server component).
2. Add `generateMetadata` using `buildPageMetadata` from `src/lib/seo.ts`.
3. If interactive: create `src/components/<domain>/<route>-client.tsx` as `'use client'`.
4. Add the route to `src/app/sitemap.ts` with proper `alternates.languages`.
5. Add bilingual content to `messages/en.json` and `messages/zh.json`.
6. Add structured data (`src/lib/structured-data.ts`) if content-rich.

## Key Constants

All site-level config lives in `src/lib/constants.ts` — `SITE_URL`, author info, social links. Never hardcode the domain elsewhere.
