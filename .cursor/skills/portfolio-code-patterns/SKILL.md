---
name: portfolio-code-patterns
description: Code best practices and conventions for this Next.js 15 + TypeScript + Tailwind v4 minimalist portfolio. Covers TypeScript patterns, import aliases, naming conventions, Tailwind v4 usage, no-comments policy, environment variables, bilingual content handling, and code quality rules. Use when writing any new code, reviewing existing code, adding types, using Tailwind classes, handling bilingual content, or when asked about coding conventions in this project.
---

# Portfolio — Code Best Practices

## TypeScript

### Path Alias
Always use `@/*` → `./src/*`:
```typescript
import { SITE_URL } from '@/lib/constants';       // ✅
import { SITE_URL } from '../../lib/constants';   // ❌
```

### Type Locations
- Shared app types → `src/types/index.ts` (barrel export)
- Supabase row types → `src/lib/supabase/database.types.ts` (generated)
- Derive from DB types, don't duplicate:
```typescript
// types/index.ts
export type Post = Database['public']['Tables']['posts']['Row'];
export type PostPreview = Pick<Post, 'id' | 'slug' | 'title_en' | ...>;
```

### Next.js 15 Props Pattern
```typescript
type Props = {
  params: Promise<{ locale: string; slug?: string }>;
};
// Always await — params and searchParams are Promises in Next.js 15
const { locale, slug } = await params;
```

### Supabase Query Typing
After a Supabase query, cast to the known type rather than relying on inferred `any`:
```typescript
const { data: rawPosts } = await supabase.from('posts').select('slug, updated_at');
const posts = rawPosts as Pick<Tables<'posts'>, 'slug' | 'updated_at'>[] | null;
```

## Naming Conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Files | `kebab-case.tsx` / `.ts` | `home-client.tsx` |
| React components | `PascalCase` named export | `export function HomeClient` |
| Utility functions | `camelCase` | `buildPageMetadata` |
| Constants | `UPPER_SNAKE_CASE` | `SITE_URL`, `NOTES` |
| Types/interfaces | `PascalCase` | `PostPreview`, `NavItem` |
| i18n namespaces | dot-notation keys in JSON | `"site.name"` |

## Tailwind v4

This project uses **Tailwind v4** — there is no `tailwind.config.ts`. Theme tokens are in `src/app/globals.css` via `@theme { }`.

```css
/* globals.css — extending theme */
@theme {
  --font-serif: var(--font-serif);
  /* custom tokens here */
}
```

- Never add a `tailwind.config.ts` file.
- Custom tokens → `globals.css` `@theme` block.
- Use `@layer utilities` for one-off utility classes (e.g. `.text-copy`).

## Imports Order (enforced mentally, not by linter)

1. React / Next.js internals
2. Third-party libraries
3. `@/lib/...` utilities
4. `@/components/...`
5. `@/types`
6. Relative (avoid)

## Comments Policy

**Do not add comments that describe what the code does.** Only explain non-obvious *why*:
```typescript
// ✅ Explains non-obvious constraint:
// localePrefix: 'as-needed' — English has no /en prefix in URLs
export const revalidate = 3600; // Regenerate every hour

// ❌ Narrates the obvious:
// Fetch posts from Supabase
const { data } = await supabase.from('posts').select('*');
```

## Bilingual Content

### Database fields
Bilingual DB columns follow `*_en` / `*_zh` naming. Use `localizedText()`:
```typescript
import { localizedText } from '@/lib/localized-content';
const title = localizedText(post.title_en, post.title_zh, locale);
```

### UI strings
Always in `messages/en.json` and `messages/zh.json`. Access via `getTranslations` (server) or `useTranslations` (client):
```typescript
// Server
const t = await getTranslations({ locale, namespace: 'blog' });

// Client
const t = useTranslations('blog');
```

Never hardcode English strings in JSX — all user-visible text goes through `t()`.

## Environment Variables

| Variable | Where used |
|----------|-----------|
| `NEXT_PUBLIC_SITE_URL` | `src/lib/constants.ts` → `SITE_URL` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase clients |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase clients |
| `GEMINI_API_KEY` | `/api/chat` route handler |

Access via `process.env.VARIABLE_NAME`. Never access env vars outside `src/lib/constants.ts` or the specific lib that needs them.

## Component Export Pattern

```typescript
// Named export — never default for components (except page.tsx / layout.tsx)
export function SiteHeader({ locale }: { locale: string }) { ... }

// page.tsx and layout.tsx use default export (Next.js requirement)
export default async function Page({ params }: Props) { ... }
```

## No Barrel Index Files for Components

Don't create `src/components/index.ts` — import directly:
```typescript
import { SiteHeader } from '@/components/layout/site-header';  // ✅
import { SiteHeader } from '@/components';                      // ❌
```

## Icons

Use `lucide-react` at consistent size: `w-[17px] h-[17px] strokeWidth={1.5}` for body-level icons.

## Animations

Use `motion` (imported as `motion/react`) — only for modals, dropdowns, and intentional micro-interactions. Never add entrance animations to static page content.
