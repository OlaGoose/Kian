import { SITE_NAME, SITE_URL, SOCIAL_LINKS } from '@/lib/constants';
import { createBuildClient } from '@/lib/supabase/build';
import type { Tables } from '@/lib/supabase/database.types';

export const revalidate = 3600;

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export async function GET() {
  const supabase = createBuildClient();
  const { data: rawPosts } = await supabase
    .from('posts')
    .select('slug, title_en, excerpt_en, updated_at, published_at')
    .eq('published', true)
    .order('published_at', { ascending: false });

  const posts =
    (rawPosts as Pick<
      Tables<'posts'>,
      'slug' | 'title_en' | 'excerpt_en' | 'updated_at' | 'published_at'
    >[] | null) ?? [];

  const authorEmail = SOCIAL_LINKS.email.replace('mailto:', '');

  const items = posts
    .map((post) => {
      const title = escapeXml(post.title_en);
      const description = escapeXml(post.excerpt_en ?? '');
      const link = `${SITE_URL}/blog/${post.slug}`;
      const pubDate = new Date(post.published_at ?? post.updated_at).toUTCString();
      const updatedAt = new Date(post.updated_at).toISOString();

      return `
  <item>
    <title>${title}</title>
    <description>${description}</description>
    <link>${link}</link>
    <guid isPermaLink="true">${link}</guid>
    <pubDate>${pubDate}</pubDate>
    <dc:date>${updatedAt}</dc:date>
    <author>${escapeXml(authorEmail)} (${escapeXml(SITE_NAME)})</author>
  </item>`;
    })
    .join('\n');

  const latestUpdatedAt = posts[0]?.updated_at
    ? new Date(posts[0].updated_at).toUTCString()
    : new Date().toUTCString();

  const ogImage = `${SITE_URL}/api/og?title=${encodeURIComponent(SITE_NAME)}`;

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
  <title>${escapeXml(SITE_NAME)}</title>
  <description>Latest writing from ${escapeXml(SITE_NAME)}</description>
  <link>${SITE_URL}</link>
  <language>en-us</language>
  <lastBuildDate>${latestUpdatedAt}</lastBuildDate>
  <managingEditor>${escapeXml(authorEmail)} (${escapeXml(SITE_NAME)})</managingEditor>
  <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
  <image>
    <url>${ogImage}</url>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
  </image>
${items}
</channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
