# Minimalist Personal Portfolio

A minimal, SEO-optimized personal website built with Next.js 15 + Supabase. Features a blog system, projects showcase, AI chat assistant, and multilingual support (EN/ZH).

## Tech Stack

- **Framework**: Next.js 15 (App Router, SSG/SSR)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS v4
- **i18n**: next-intl (English + Chinese, URL-based routing)
- **AI**: Google Gemini 2.0 Flash (streaming)
- **Animation**: Motion (Framer Motion)

## Features

| Feature | Details |
|---|---|
| SEO | Dynamic metadata, Open Graph images, sitemap.xml, robots.txt, JSON-LD |
| GEO | `llms.txt` for AI crawler optimization |
| i18n | URL-based routing (`/` = EN, `/zh/` = ZH), hreflang tags |
| Blog | Markdown content stored in Supabase, ISR |
| Projects | Product showcase with tech stack + links |
| AI Chat | Server-side Gemini API with streaming (SSE) |
| Feedback | Text/voice feedback stored in Supabase |
| Booking | Schedule/contact modal |
| Performance | SSG pages, Edge middleware, image optimization |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in Supabase SQL Editor:
   ```sql
   -- Copy and run: supabase/migrations/001_initial_schema.sql
   ```
3. (Optional) Run seed data:
   ```sql
   -- Copy and run: supabase/seed.sql
   ```

### 3. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 4. Customize your content

- `src/lib/constants.ts` — Your name, site URL, social links
- `messages/en.json` + `messages/zh.json` — Bio text, navigation labels
- Supabase dashboard — Add blog posts and projects

### 5. Run the development server

```bash
npm run dev
```

## Project Structure

```
src/
├── app/
│   ├── [locale]/         # All locale-aware pages
│   │   ├── layout.tsx    # HTML shell + i18n provider
│   │   ├── page.tsx      # Home page
│   │   ├── blog/         # Blog list + post detail
│   │   ├── projects/     # Projects showcase
│   │   └── chat/         # AI chat
│   ├── api/
│   │   ├── chat/         # Gemini API (streaming SSE)
│   │   ├── feedback/     # Feedback submission
│   │   └── og/           # Dynamic OG image generation
│   ├── sitemap.ts        # Dynamic sitemap (ISR hourly)
│   └── robots.ts         # robots.txt (includes AI crawlers)
├── components/           # React components
├── i18n/                 # next-intl configuration
├── lib/supabase/         # Supabase clients (server/browser/build)
├── middleware.ts         # next-intl locale routing middleware
└── types/                # TypeScript types
messages/                 # Translation files (en.json, zh.json)
supabase/
├── migrations/           # Database schema SQL
└── seed.sql              # Sample data
public/
└── llms.txt              # GEO: AI crawler-friendly site summary
```

## Deployment

Deploy on [Vercel](https://vercel.com) for the best experience:

```bash
vercel deploy
```

Set the environment variables in your Vercel project settings.
