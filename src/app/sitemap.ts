import type { MetadataRoute } from 'next';
import { createBuildClient } from '@/lib/supabase/build';
import { SITE_URL } from '@/lib/constants';
import type { Tables } from '@/lib/supabase/database.types';

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

  const staticPages = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 1,
      alternates: {
        languages: { en: SITE_URL, zh: `${SITE_URL}/zh`, 'x-default': SITE_URL },
      },
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
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
      lastModified: new Date(),
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

  return [...staticPages, ...postPages];
}
