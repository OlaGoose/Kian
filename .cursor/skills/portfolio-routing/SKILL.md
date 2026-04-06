---
name: portfolio-routing
description: Routing best practices for this Next.js 15 App Router + next-intl portfolio. Covers locale segment structure, i18n URL conventions (localePrefix as-needed), correct use of next-intl navigation vs next/link, generateStaticParams, dynamic params typing, middleware, and non-locale special routes. Use when adding or editing routes, navigation links, locale switching, redirects, or middleware.
---

# Portfolio — Routing Best Practices

## Route Structure

```
src/app/
  layout.tsx                    # Root shell (metadataBase only, no <html>)
  [locale]/
    layout.tsx                  # <html lang={locale}>, font, NextIntlClientProvider
    page.tsx                    # Home
    blog/
      page.tsx                  # Blog list
      [slug]/page.tsx           # Blog post
    projects/page.tsx
    notes/[slug]/page.tsx
    ...
  api/                          # No [locale] — never locale-prefixed
  sitemap.ts                    # Special file routes — no [locale]
  robots.ts
  manifest.ts
  feed.xml/route.ts
  icon.tsx / apple-icon.tsx
```

## URL Convention (localePrefix: 'as-needed')

| Locale | URL shape |
|--------|-----------|
| English (default) | `/blog/my-post` (no prefix) |
| Chinese | `/zh/blog/my-post` |

**Important**: `localePrefix: 'as-needed'` means English URLs **never** have `/en`. Always generate English URLs without prefix and Chinese URLs with `/zh/`.

## Navigation Links — Which to Use

**Prefer `next-intl`'s navigation exports for locale-aware links:**

```typescript
// src/i18n/navigation.ts exports these — always import from there:
import { Link, redirect, usePathname, useRouter } from '@/i18n/navigation';
```

**Acceptable shortcut for manual locale-prefixed links** (existing pattern):
```typescript
const prefix = locale === 'zh' ? '/zh' : '';
<Link href={`${prefix}/blog/${slug}`}>...</Link>  // next/link
```

Prefer the next-intl `Link` when building new navigation. Do not mix both patterns in the same file.

## Locale Layout — Required Pattern

```typescript
// src/app/[locale]/layout.tsx
export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;  // Next.js 15: params is a Promise
  if (!routing.locales.includes(locale as 'en' | 'zh')) notFound();
  const messages = await getMessages();
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={stix.variable}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

## Dynamic Params — Next.js 15 Typing

```typescript
// params and searchParams are Promises in Next.js 15
type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page({ params }: Props) {
  const { locale, slug } = await params;  // must await
}
```

## generateStaticParams for Dynamic Routes

```typescript
// src/app/[locale]/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const supabase = createBuildClient();  // use build client, not server client
  const { data: posts } = await supabase
    .from('posts').select('slug').eq('published', true);

  return routing.locales.flatMap((locale) =>
    (posts ?? []).map((post) => ({ locale, slug: post.slug }))
  );
}
```

## Middleware

```typescript
// src/middleware.ts — minimal, delegates to next-intl
export default createMiddleware(routing);
export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
```

Never add auth or heavy logic to middleware — keep it locale-routing only.

## Special (Non-Locale) Routes

These live directly under `src/app/` and are **never** locale-prefixed:

| File | URL |
|------|-----|
| `sitemap.ts` | `/sitemap.xml` |
| `robots.ts` | `/robots.txt` |
| `manifest.ts` | `/manifest.webmanifest` |
| `feed.xml/route.ts` | `/feed.xml` |
| `icon.tsx` | `/icon` |
| `apple-icon.tsx` | `/apple-icon` |
| `api/og/route.tsx` | `/api/og` |

## Indexing Control

Pages that should not be indexed (e.g. `/chat`):
```typescript
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};
```

## Locale Source of Truth

`src/i18n/routing.ts` is the single source of truth for locales:
```typescript
export const routing = defineRouting({
  locales: ['en', 'zh'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});
```

Import `routing.locales` wherever a locale list is needed — never hardcode `['en', 'zh']` elsewhere.
