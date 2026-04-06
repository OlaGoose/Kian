---
name: portfolio-projects
description: Complete workflow for adding, editing, and removing projects in this Next.js 15 minimalist portfolio. Covers STATIC_PROJECTS vs Supabase DB choice, full SEO checklist (generateMetadata, sitemap, JSON-LD, hreflang, OG image), bilingual (en/zh) fields, homepage list sync, sub-route pages, and status badges. Use when adding a new project, updating an existing project's description or status, creating a project-specific sub-page, or when asked about the projects section, project SEO, or project content.
---

# Portfolio — Projects Workflow

## Two Ways to Add a Project

| Method | When to Use |
|--------|------------|
| `STATIC_PROJECTS` in `page.tsx` | Project has its own sub-route (`/projects/<slug>`) built as a Next.js page |
| Supabase `projects` table | Regular project — just a name, description, URL, and optional GitHub link |

For most new projects: **Supabase** is the default. Use `STATIC_PROJECTS` only when you need a dedicated interactive page (like ozon-catalog).

---

## Method A: Supabase Project

### 1. Insert row in Supabase

```sql
INSERT INTO projects (name, slug, description_en, description_zh, url, github_url, tech, status, featured, display_order)
VALUES (
  'My Project',
  'my-project',
  'English description here.',
  '中文描述',
  'https://example.com',
  null,           -- or 'https://github.com/...'
  '{}',           -- tech array, e.g. '{"Next.js","Supabase"}'
  'live',         -- 'live' | 'wip' | 'archived'
  false,          -- true = shown first and larger
  10              -- display_order, lower = earlier
);
```

### 2. Homepage list (optional)

If the project deserves a bullet on the home page, add to `home-client.tsx`:

```tsx
// messages/en.json → home.myProjectName: "My Project Title"
// messages/zh.json → home.myProjectName: "我的项目名"

<li>
  <CustomLink href="https://example.com" external>
    {t('myProjectName')}
  </CustomLink>
</li>
```

No sitemap or metadata changes required — the `/projects` list page already covers DB projects.

---

## Method B: Sub-route Project Page

Use when the project is an **interactive tool** built inside the portfolio (e.g. `/projects/ozon-catalog`).

### 1. Add to `STATIC_PROJECTS` in `src/app/[locale]/projects/page.tsx`

```tsx
{
  id: 'my-project-static',
  name: 'My Project',
  slug: 'my-project',
  description_en: 'English description.',
  description_zh: '中文描述。',
  url: '/projects/my-project',  // internal path — uses <Link> not <a>
  github_url: null,
  tech: [],
  status: 'live',
  featured: false,
  display_order: 10,
  cover_image: null,
  created_at: '2025-01-01T00:00:00Z',
},
```

### 2. Create the page

```
src/app/[locale]/projects/my-project/page.tsx   ← server component
src/components/projects/my-project-client.tsx   ← 'use client' if interactive
```

### 3. generateMetadata (SEO required)

```typescript
import { buildPageMetadata } from '@/lib/seo';
import { getTranslations } from 'next-intl/server';
import { SITE_NAME } from '@/lib/constants';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'myProject' });
  return buildPageMetadata({
    locale,
    path: 'projects/my-project',
    title: t('meta.title'),
    description: t('meta.description'),
    siteName: SITE_NAME,
  });
}
```

`buildPageMetadata` auto-generates: canonical, hreflang (`en`/`zh`/`x-default`), OG image via `/api/og?title=...`, and `twitter.card`.

### 4. Bilingual strings

Add to **both** `messages/en.json` and `messages/zh.json`:

```json
"myProject": {
  "meta": {
    "title": "My Project",
    "description": "One-sentence description for SEO."
  },
  "back": "All projects",
  "intro": "Short intro paragraph."
}
```

### 5. Sitemap entry (SEO required)

In `src/app/sitemap.ts`, add inside `staticPages`:

```typescript
{
  url: `${SITE_URL}/projects/my-project`,
  lastModified: new Date('2025-01-01'),
  changeFrequency: 'monthly' as const,
  priority: 0.65,
  alternates: {
    languages: {
      en: `${SITE_URL}/projects/my-project`,
      zh: `${SITE_URL}/zh/projects/my-project`,
      'x-default': `${SITE_URL}/projects/my-project`,
    },
  },
},
```

Priority guide: featured tool pages → `0.7`, secondary tool pages → `0.65`.

### 6. JSON-LD (optional but recommended for content-rich pages)

Use existing builders from `src/lib/structured-data.ts`:

```tsx
const jsonLd = buildSoftwareAppListLd({ name: t('title'), items: [...] });

return (
  <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    {/* page content */}
  </>
);
```

If no builder fits, add a new one to `structured-data.ts` — never inline JSON-LD in JSX.

### 7. Homepage list (optional)

```tsx
// home-client.tsx
<li>
  <CustomLink href={`${prefix}/projects/my-project`}>
    {t('myProjectName')}
  </CustomLink>
</li>
```

Add `myProjectName` key to `messages/en.json` + `messages/zh.json` under `home`.

---

## Project Field Reference

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Display name, shown as heading |
| `slug` | string | URL-safe, kebab-case, unique |
| `description_en` / `_zh` | string \| null | Used in card and JSON-LD |
| `url` | string \| null | External URL or internal path (`/projects/...`) |
| `github_url` | string \| null | Shows GitHub icon on card |
| `status` | `'live'` \| `'wip'` \| `'archived'` | Drives color badge |
| `featured` | boolean | `true` → larger card, shown first |
| `display_order` | number | Lower = earlier in list |

---

## SEO Checklist for New Sub-route Project

- [ ] `generateMetadata` using `buildPageMetadata` with correct `path`
- [ ] Both `en.json` and `zh.json` have `meta.title` and `meta.description`
- [ ] Entry added to `sitemap.ts` with `alternates.languages` (en, zh, x-default)
- [ ] `STATIC_PROJECTS` entry added to `/projects/page.tsx`
- [ ] JSON-LD added if page has substantial content
- [ ] `revalidate` set if page fetches dynamic data
- [ ] Run `npm run build` to confirm no TS or metadata errors

---

## Editing an Existing Project

- **DB project**: update the Supabase row — `/projects` page revalidates every hour.
- **STATIC_PROJECTS entry**: edit `page.tsx` directly.
- **Sub-route page copy**: edit `messages/en.json` + `messages/zh.json`.
- **Status change** (e.g. wip → live): update `status` field; badge color updates automatically.

---

## Removing a Project

1. Delete the Supabase row, OR remove from `STATIC_PROJECTS`.
2. If it had a sub-route: delete the page directory, remove from `sitemap.ts`, remove JSON-LD call.
3. Remove from homepage list in `home-client.tsx` if present.
4. Remove i18n keys only if no longer referenced anywhere.
