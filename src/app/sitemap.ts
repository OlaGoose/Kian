import type { MetadataRoute } from 'next';
import { createBuildClient } from '@/lib/supabase/build';
import { SITE_URL } from '@/lib/constants';
import type { Tables } from '@/lib/supabase/database.types';
import { SNIPPETS } from '@/lib/snippets';
import { NOTES } from '@/lib/notes';

export const revalidate = 3600; // Regenerate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createBuildClient();

  // Fetch published posts
  const { data: rawPosts } = await supabase
    .from('posts')
    .select('slug, updated_at')
    .eq('published', true)
    .order('updated_at', { ascending: false });

  const posts = rawPosts as Pick<Tables<'posts'>, 'slug' | 'updated_at'>[] | null;

  // Fetch projects
  const { data: rawProjects } = await supabase
    .from('projects')
    .select('slug, created_at');

  const projects = rawProjects as Pick<Tables<'projects'>, 'slug' | 'created_at'>[] | null;

  const latestProjectDate = projects?.length
    ? new Date(Math.max(...projects.map((p) => new Date(p.created_at).getTime())))
    : new Date();

  const latestPostDate = posts?.[0]?.updated_at ? new Date(posts[0].updated_at) : new Date();
  const contentLastModified =
    latestPostDate.getTime() > latestProjectDate.getTime()
      ? latestPostDate
      : latestProjectDate;

  const staticPages = [
    {
      url: SITE_URL,
      lastModified: contentLastModified,
      changeFrequency: 'monthly' as const,
      priority: 1,
      alternates: {
        languages: { en: SITE_URL, zh: `${SITE_URL}/zh`, 'x-default': SITE_URL },
      },
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: latestPostDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: {
        languages: {
          en: `${SITE_URL}/blog`,
          zh: `${SITE_URL}/zh/blog`,
          'x-default': `${SITE_URL}/blog`,
        },
      },
    },
    {
      url: `${SITE_URL}/projects`,
      lastModified: latestProjectDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      alternates: {
        languages: {
          en: `${SITE_URL}/projects`,
          zh: `${SITE_URL}/zh/projects`,
          'x-default': `${SITE_URL}/projects`,
        },
      },
    },
    {
      url: `${SITE_URL}/projects/ozon-catalog`,
      lastModified: latestProjectDate,
      changeFrequency: 'monthly' as const,
      priority: 0.65,
      alternates: {
        languages: {
          en: `${SITE_URL}/projects/ozon-catalog`,
          zh: `${SITE_URL}/zh/projects/ozon-catalog`,
          'x-default': `${SITE_URL}/projects/ozon-catalog`,
        },
      },
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: contentLastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: {
        languages: {
          en: `${SITE_URL}/about`,
          zh: `${SITE_URL}/zh/about`,
          'x-default': `${SITE_URL}/about`,
        },
      },
    },
    {
      url: `${SITE_URL}/snippets`,
      lastModified: contentLastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      alternates: {
        languages: {
          en: `${SITE_URL}/snippets`,
          zh: `${SITE_URL}/zh/snippets`,
          'x-default': `${SITE_URL}/snippets`,
        },
      },
    },
    {
      url: `${SITE_URL}/uses`,
      lastModified: contentLastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      alternates: {
        languages: {
          en: `${SITE_URL}/uses`,
          zh: `${SITE_URL}/zh/uses`,
          'x-default': `${SITE_URL}/uses`,
        },
      },
    },
    {
      url: `${SITE_URL}/guestbook`,
      lastModified: contentLastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
      alternates: {
        languages: {
          en: `${SITE_URL}/guestbook`,
          zh: `${SITE_URL}/zh/guestbook`,
          'x-default': `${SITE_URL}/guestbook`,
        },
      },
    },
    {
      url: `${SITE_URL}/newsletter`,
      lastModified: contentLastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      alternates: {
        languages: {
          en: `${SITE_URL}/newsletter`,
          zh: `${SITE_URL}/zh/newsletter`,
          'x-default': `${SITE_URL}/newsletter`,
        },
      },
    },
    {
      url: `${SITE_URL}/notes`,
      lastModified: contentLastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.65,
      alternates: {
        languages: {
          en: `${SITE_URL}/notes`,
          zh: `${SITE_URL}/zh/notes`,
          'x-default': `${SITE_URL}/notes`,
        },
      },
    },
  ];

  const postPages =
    posts?.flatMap((post) => [
      {
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: new Date(post.updated_at),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
        alternates: {
          languages: {
            en: `${SITE_URL}/blog/${post.slug}`,
            zh: `${SITE_URL}/zh/blog/${post.slug}`,
            'x-default': `${SITE_URL}/blog/${post.slug}`,
          },
        },
      },
    ]) ?? [];

  const snippetPages = SNIPPETS.map((snippet) => ({
    url: `${SITE_URL}/snippets/${snippet.slug}`,
    lastModified: contentLastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
    alternates: {
      languages: {
        en: `${SITE_URL}/snippets/${snippet.slug}`,
        zh: `${SITE_URL}/zh/snippets/${snippet.slug}`,
        'x-default': `${SITE_URL}/snippets/${snippet.slug}`,
      },
    },
  }));

  const notePages = NOTES.map((note) => ({
    url: `${SITE_URL}/notes/${note.slug}`,
    lastModified: contentLastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.55,
    alternates: {
      languages: {
        en: `${SITE_URL}/notes/${note.slug}`,
        zh: `${SITE_URL}/zh/notes/${note.slug}`,
        'x-default': `${SITE_URL}/notes/${note.slug}`,
      },
    },
  }));

  return [...staticPages, ...postPages, ...snippetPages, ...notePages];
}
