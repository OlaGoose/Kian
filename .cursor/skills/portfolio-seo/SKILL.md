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
import { buildPageMetadata } from '@/lib/seo';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });
  const siteT = await getTranslations({ locale, namespace: 'site' });
  return buildPageMetadata({
    locale,
    path: 'blog',           // locale-agnostic path segment(s)
    title: t('title'),
    description: t('description'),
    siteName: siteT('name'),
  });
}
```

`buildPageMetadata` automatically generates:
- `alternates.canonical` (respects `localePrefix: 'as-needed'`)
- `alternates.languages` with `en`, `zh-Hans`, `zh`, `x-default` (→ English URL)
- `openGraph` with image from `/api/og?title=...`
- `twitter.card: 'summary_large_image'`

For thin/utility pages, spread and override `robots`:
```typescript
return {
  ...buildPageMetadata({ locale, path, title, description, siteName }),
  robots: { index: false, follow: true },
};
```

## hreflang / Alternates

`getAlternates(locale, path?)` in `src/lib/metadata.ts`:

```typescript
// English: SITE_URL/blog/my-post (no /en prefix — localePrefix: 'as-needed')
// Chinese: SITE_URL/zh/blog/my-post
// x-default → English URL

getAlternates('en', 'blog/my-post')
// → canonical: "https://site.com/blog/my-post"
// → languages: {
//     en: ".../blog/my-post",
//     "zh-Hans": ".../zh/blog/my-post",   ← BCP 47 Simplified Chinese
//     zh: ".../zh/blog/my-post",
//     "x-default": ".../blog/my-post",
//   }
```

**Rules:**
- Always include `x-default` pointing to the English URL.
- Always include both `zh-Hans` AND `zh` — the BCP 47 tag reduces SEO tool false positives.
- The Chinese page's `x-default` correctly points to the English URL; this is per Google guidelines, not a conflict.
- Semrush may flag `zh` pages as "hreflang conflict" because canonical ≠ x-default — this is a **known false positive**; the implementation is correct.

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
  dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaObject) }}
/>
```

| Page | Schema type |
|------|------------|
| Home | `Person` + `WebSite` |
| Blog list | `ItemList` + `CollectionPage` |
| Blog post | `BlogPosting` |
| Projects | `SoftwareApplication` list (`ItemList` wrapper) |
| About | `ProfilePage` + `Person` |

Always add a new schema builder to `structured-data.ts` rather than inlining JSON.

### Schema validation rules (avoid invalid structured data)

- **URLs must be absolute.** Schema.org rejects relative paths like `/projects/ozon-catalog`. Use the `toAbsoluteUrl` helper in `buildSoftwareAppListLd` as a reference pattern.
- **`Person` entities must have `name`.** All `author`, `publisher`, `creator` nodes need `name: SITE_NAME` — not just `url`.
- **`author` is a `CreativeWork` property.** Do NOT add `author` to `ItemList`, `WebSite`, or other non-`CreativeWork` types — it is non-standard and may trigger validation warnings.
- **`WebSite.inLanguage` should be a string** (`'en'`), not an array. The `WebSite` schema describes the canonical (English) version of the site.
- **Do NOT add `potentialAction: SearchAction`** unless a working search endpoint exists at the specified URL. Pointing it at a non-functional route is invalid and can be penalized.
- **`SoftwareApplication.operatingSystem`** should be `'Web'` for browser-based tools.

## Sitemap

`src/app/sitemap.ts` — `export const revalidate = 3600`.

Use the `sitemapAlternates(path?)` helper (defined at the top of sitemap.ts) to generate consistent alternates. **Never hardcode language URLs inline** — always use the helper to keep sitemap and page HTML alternates in sync.

```typescript
function sitemapAlternates(path?: string) {
  const suffix = path ? `/${path}` : '';
  const enUrl = `${SITE_URL}${suffix}`;
  const zhUrl = `${SITE_URL}/zh${suffix}`;
  return {
    languages: {
      en: enUrl,
      'zh-Hans': zhUrl,
      zh: zhUrl,
      'x-default': enUrl,
    },
  };
}

// Usage:
{
  url: `${SITE_URL}/blog/${slug}`,
  lastModified: new Date(post.updated_at),
  changeFrequency: 'monthly',
  priority: 0.7,
  alternates: sitemapAlternates(`blog/${slug}`),
}
```

**Priority guide:**
| Page | Priority |
|------|---------|
| Home | 1.0 |
| Blog list, Projects | 0.8 |
| About | 0.7 |
| Notes list, ozon-catalog | 0.65 |
| Individual blog posts | 0.7 |
| Less-visited pages | 0.6 |

**Sitemap inclusion rules:**
- **Include:** Pages with real, indexable content (home, blog, projects, about, notes list, blog posts).
- **Exclude:** Any page that has `robots: { index: false }`. Sending contradictory signals (sitemap + noindex) is noisy; Google respects the noindex but the sitemap entry is wasted.
- **Currently excluded:** `/guestbook`, `/newsletter`, `/uses`, `/notes/[slug]` — all have noindex.

Use `createBuildClient()` (not `createClient()`) in sitemap — it runs at build time without a request context.

## Robots.txt

`src/app/robots.ts`:

```typescript
{
  userAgent: '*',
  allow: '/',
  disallow: ['/api/'],   // ← ONLY /api/. Never add /_next/
}
```

**Critical rule: NEVER disallow `/_next/`.** `/_next/static/` is where Next.js serves all CSS, JS, fonts, and images. Blocking it prevents Google from rendering the page, which causes:
- Core Web Vitals = 0% (Google can't evaluate layout/rendering)
- Mobile-friendliness signals lost
- Hundreds of "blocked resource" warnings in site audit tools

AI crawlers (GPTBot, ClaudeBot, etc.) get individual rules allowing full access to public content — see the `AI_CRAWLERS` array in `robots.ts`.

## RSS Feed

`src/app/feed.xml/route.ts` — English-only channel, `revalidate = 3600`. Root `layout.tsx` declares the `<link rel="alternate" type="application/rss+xml">` alternate.

## Indexing Control

```typescript
// Pages that should NOT be indexed — spread over buildPageMetadata:
return {
  ...buildPageMetadata({ locale, path, title, description, siteName }),
  robots: { index: false, follow: true },
};

// OR for pages that skip buildPageMetadata entirely (e.g. chat):
export const metadata: Metadata = {
  robots: { index: false, follow: true },
  alternates: { canonical: locale === 'zh' ? `${SITE_URL}/zh/chat` : `${SITE_URL}/chat` },
};
```

**When to noindex:**
- Stub/placeholder pages with fewer than ~200 words of real content
- Utility pages that redirect users elsewhere (e.g. guestbook redirecting to feedback button)
- Pages with only a single link and no unique content
- Admin, auth, and API pages

**Currently noindex'd:** `/chat`, `/guestbook`, `/newsletter`, `/uses`, `/notes/[slug]`

## New Page SEO Checklist

- [ ] `generateMetadata` using `buildPageMetadata` with correct `path`
- [ ] Bilingual title/description via `getTranslations`
- [ ] Structured data `<script>` if content-rich (see schema table above)
  - [ ] All `Person` nodes include `name: SITE_NAME`
  - [ ] All URLs in JSON-LD are absolute (use `toAbsoluteUrl` for dynamic/internal paths)
  - [ ] Schema type is appropriate — don't add `author` to non-`CreativeWork` types
- [ ] Entry added to `sitemap.ts` using `sitemapAlternates()` — **only if page is indexable**
- [ ] `revalidate` set on list/dynamic pages
- [ ] If thin content (< ~200 words, stub, utility): add `robots: { index: false, follow: true }` AND remove from sitemap
