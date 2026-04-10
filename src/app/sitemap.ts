import type { MetadataRoute } from 'next';
import { createBuildClient } from '@/lib/supabase/build';
import { SITE_URL } from '@/lib/constants';
import type { Tables } from '@/lib/supabase/database.types';

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
      alternates: sitemapAlternates(),
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: latestPostDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: sitemapAlternates('blog'),
    },
    {
      url: `${SITE_URL}/projects`,
      lastModified: latestProjectDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      alternates: sitemapAlternates('projects'),
    },
    {
      url: `${SITE_URL}/projects/ozon-catalog`,
      lastModified: latestProjectDate,
      changeFrequency: 'monthly' as const,
      priority: 0.65,
      alternates: sitemapAlternates('projects/ozon-catalog'),
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: contentLastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: sitemapAlternates('about'),
    },
    {
      url: `${SITE_URL}/notes`,
      lastModified: contentLastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.65,
      alternates: sitemapAlternates('notes'),
    },
  ];

  const postPages =
    posts?.flatMap((post) => [
      {
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: new Date(post.updated_at),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
        alternates: sitemapAlternates(`blog/${post.slug}`),
      },
    ]) ?? [];

  return [...staticPages, ...postPages];
}
