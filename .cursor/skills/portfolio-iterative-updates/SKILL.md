---
name: portfolio-iterative-updates
description: Iterative update workflow for this Next.js 15 minimalist portfolio. Covers the step-by-step process for safely adding features, editing content, refactoring, and updating dependencies. Defines what to check before/after every change to maintain consistency across UI style, routing, SEO, i18n, and TypeScript. Use when adding new pages or components, updating existing features, refactoring, or when asked how to make a change without breaking existing patterns.
---

# Portfolio — Iterative Update Best Practices

## Before Every Change

1. **Read the relevant skill** for the area being touched:
   - UI/style → `minimalist-portfolio-style`
   - Architecture/data → `portfolio-architecture`
   - Routing/locale → `portfolio-routing`
   - SEO/metadata → `portfolio-seo`
   - TypeScript/naming → `portfolio-code-patterns`

2. **Read the existing file** before editing — never edit blind.

3. **Check linter errors** after edits with ReadLints on changed files.

## Change Workflows

### Adding a New Page

```
1. Create src/app/[locale]/<route>/page.tsx (async server component)
2. Add generateMetadata using buildPageMetadata from @/lib/seo.ts
3. Add bilingual strings to messages/en.json + messages/zh.json
4. If interactive: create src/components/<domain>/<route>-client.tsx
5. Add to src/app/sitemap.ts with alternates.languages
6. Add to SiteHeader nav if it should be in navigation
7. Verify: check route at both / and /zh/ in browser
```

### Adding a New Component

```
1. Place in src/components/<domain>/component-name.tsx
2. Use named export (PascalCase)
3. Props typed inline or in src/types/index.ts if reused
4. Apply styles from minimalist-portfolio-style skill exactly
5. Run ReadLints on the new file
```

### Editing Content / Copy

```
1. For UI strings: edit messages/en.json AND messages/zh.json together
2. For DB content: update *_en and *_zh columns
3. For static content (notes): edit src/lib/notes.ts
4. Never hardcode visible strings in JSX
```

### Adding a Supabase Table or Column

```
1. Update src/lib/supabase/database.types.ts
2. Add derived types in src/types/index.ts if needed
3. Use createClient() in server components, createBuildClient() in build-time code
4. Never query Supabase from a client component
```

### Updating SEO for Existing Page

```
1. Ensure generateMetadata uses buildPageMetadata
2. Check alternates.languages is correct for the path
3. Verify the page has an entry in sitemap.ts
4. Add/update JSON-LD if content type changed
```

### Refactoring

```
1. Read all files involved before starting
2. Change one file at a time, run linter after each
3. Do not change naming conventions (kebab-case files, PascalCase exports)
4. Do not change the localePrefix convention
5. Do not add new state management libraries
```

## Consistency Checklist (Run After Any Substantial Change)

- [ ] All visible text goes through `t()` (no hardcoded English in JSX)
- [ ] Both `en.json` and `zh.json` updated if strings added
- [ ] New page has `generateMetadata` with `buildPageMetadata`
- [ ] New page has entry in `sitemap.ts` with `alternates.languages`
- [ ] Components use design tokens from `minimalist-portfolio-style`
- [ ] No `rounded-md` or larger — only `rounded-[2px]`
- [ ] No hardcoded domain or URL — use `SITE_URL` from constants
- [ ] Supabase client used matches context (server vs build)
- [ ] No `'use client'` on page or layout unless absolutely required
- [ ] TypeScript: no implicit `any`, params properly awaited
- [ ] Linter: ReadLints shows no new errors on changed files

## What NOT to Do

| Anti-pattern | Why |
|-------------|-----|
| Hardcode English strings in JSX | Breaks i18n |
| Use `next/link` for locale navigation in new code | Use `@/i18n/navigation` `Link` |
| Add `tailwind.config.ts` | Project uses Tailwind v4 CSS-based config |
| Call Supabase from a client component | Security + SSR boundary violation |
| Add `rounded-md` or larger | Breaks the minimal border-radius aesthetic |
| Use `createClient()` in sitemap/generateStaticParams | Must use `createBuildClient()` |
| Forget `x-default` in hreflang | Google hreflang best practice |
| Add global state library | Unnecessary complexity for this project |
| Add comments explaining what code does | Only explain non-obvious why |
| Use default exports for components | Named exports only (except page.tsx/layout.tsx) |

## Dependency Update Process

```
1. Check if update is major (breaking) or minor/patch
2. For Next.js / React / next-intl: test locale routing + metadata thoroughly
3. For Tailwind v4: check globals.css theme tokens still work
4. For Supabase: regenerate database.types.ts after schema changes
5. Run next build locally before committing
```

## Testing a Change Locally

```bash
npm run dev     # Development server

# Verify:
# - English route: http://localhost:3000/<route>
# - Chinese route: http://localhost:3000/zh/<route>
# - OG image: http://localhost:3000/api/og?title=Test
# - Sitemap: http://localhost:3000/sitemap.xml
```

`npm run build` before deploying any SEO or routing changes.
