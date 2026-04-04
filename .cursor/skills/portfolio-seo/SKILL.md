---
name: portfolio-seo
description: SEO best practices for this Next.js 15 minimalist portfolio with next-intl bilingual (en/zh) routing. Covers generateMetadata patterns, hreflang alternates, OG image via /api/og, JSON-LD structured data, sitemap with alternates, robots.txt, RSS feed, and page-level SEO checklist. Use when adding or editing any page's metadata, structured data, sitemap entries, or SEO configuration.
---

# Portfolio — SEO Best Practices

## Metadata Architecture

```
Root layout.tsx          → metadataBase + RSS alternate
[locale]/layout.tsx      → title template, site description, OG, Twitter
[locale]/*/page.tsx      → page-specific title, description, canonical, hreflang
```

## Standard Page Metadata

Use `buildPageMetadata` from `src/lib/seo.ts` for all inner pages:

```typescript
import { buildPageMetadata } from '@/lib/seo.ts';
import { getTranslations } from 'next-intl/server';
import { SITE_NAME } from '@/lib/constants';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });
  return buildPageMetadata({
    locale,
    path: 'blog',           // locale-agnostic path segment(s)
    title: t('title'),
    description: t('description'),
    siteName: SITE_NAME,
  });
}
```

`buildPageMetadata` automatically generates:
- `alternates.canonical` (respects `localePrefix: 'as-needed'`)
- `alternates.languages` with `en`, `zh`, `x-default` (→ English URL)
- `openGraph` with image from `/api/og?title=...`
- `twitter.card: 'summary_large_image'`

## hreflang / Alternates

`getAlternates(locale, path?)` in `src/lib/metadata.ts`:

```typescript
// English: SITE_URL/blog/my-post (no /en prefix)
// Chinese: SITE_URL/zh/blog/my-post
// x-default → English URL

getAlternates('en', 'blog/my-post')
// → canonical: "https://site.com/blog/my-post"
// → languages: { en: ".../blog/my-post", zh: ".../zh/blog/my-post", "x-default": "..." }
```

Always include `x-default` pointing to the English URL.

## OG Image

All pages use the dynamic OG endpoint:
```
/api/og?title=<encoded-page-title>
```
Image size: 1200×630. Never use static OG images for pages that have titles.

## Locale Layout Metadata

```typescript
// [locale]/layout.tsx — sets site-wide defaults
openGraph: {
  locale: locale === 'zh' ? 'zh_CN' : 'en_US',
  url: SITE_URL,
  // ...
}
```

## Structured Data (JSON-LD)

Builders live in `src/lib/structured-data.ts`. Inject in server components:

```typescript
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema()) }}
/>
```

| Page | Schema type |
|------|------------|
| Home | `Person` + `WebSite` |
| Blog list | `ItemList` + `CollectionPage` |
| Blog post | `BlogPosting` |
| Projects | `SoftwareApplication` list |

Always add a new schema builder to `structured-data.ts` rather than inlining JSON.

## Sitemap

`src/app/sitemap.ts` — `export const revalidate = 3600`.

Every URL entry needs `alternates.languages`:
```typescript
{
  url: `${SITE_URL}/blog/${slug}`,
  lastModified: new Date(post.updated_at),
  changeFrequency: 'monthly',
  priority: 0.7,
  alternates: {
    languages: {
      en: `${SITE_URL}/blog/${slug}`,
      zh: `${SITE_URL}/zh/blog/${slug}`,
      'x-default': `${SITE_URL}/blog/${slug}`,
    },
  },
}
```

**Priority guide:**
| Page | Priority |
|------|---------|
| Home | 1.0 |
| Blog list, Projects | 0.8 |
| Snippets, Notes, About | 0.65–0.7 |
| Individual blog posts | 0.7 |
| Individual snippets/notes | 0.55–0.6 |
| Less-visited pages | 0.6 |

Use `createBuildClient()` (not `createClient()`) in sitemap — it runs at build time, not in a request context.

## Robots.txt

`src/app/robots.ts` — disallow `/api/` and `/_next/`. Add per-bot rules for AI crawlers if needed. Never block the sitemap URL.

## RSS Feed

`src/app/feed.xml/route.ts` — English-only channel, `revalidate = 3600`. Root `layout.tsx` declares the `<link rel="alternate" type="application/rss+xml">` alternate.

## Indexing Control

```typescript
// Pages that should NOT be indexed:
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};
// Examples: /chat, /api/*, admin pages
```

## New Page SEO Checklist

- [ ] `generateMetadata` using `buildPageMetadata` with correct `path`
- [ ] Bilingual title/description via `getTranslations`
- [ ] Structured data `<script>` if content-rich
- [ ] Entry added to `sitemap.ts` with `alternates.languages`
- [ ] `revalidate` set on list/dynamic pages
- [ ] `robots: { index: false }` if private/utility page
