import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { createBuildClient } from '@/lib/supabase/build';
import { BackLink } from '@/components/layout/back-link';
import { PostContent } from '@/components/blog/post-content';
import { FeedbackButton } from '@/components/feedback/feedback-button';
import { localizedText } from '@/lib/localized-content';
import { formatDate } from '@/lib/utils';
import { getAlternates } from '@/lib/metadata';
import { buildBlogPostingLd } from '@/lib/structured-data';
import { SITE_URL, TWITTER_CREATOR } from '@/lib/constants';
import type { Tables } from '@/lib/supabase/database.types';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  // Use build client (no cookies) since this runs outside a request scope
  const supabase = createBuildClient();
  const { data: posts } = await supabase
    .from('posts')
    .select('slug')
    .eq('published', true);

  if (!posts) return [];

  return (posts as Pick<Tables<'posts'>, 'slug'>[]).flatMap((post) => [
    { locale: 'en', slug: post.slug },
    { locale: 'zh', slug: post.slug },
  ]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const siteT = await getTranslations({ locale, namespace: 'site' });

  const { data: rawPost } = await supabase
    .from('posts')
    .select('title_en, title_zh, excerpt_en, excerpt_zh, published_at, updated_at, tags, cover_image')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  const post = rawPost as Pick<Tables<'posts'>, 'title_en' | 'title_zh' | 'excerpt_en' | 'excerpt_zh' | 'published_at' | 'updated_at' | 'tags' | 'cover_image'> | null;

  if (!post) return { title: 'Not Found' };

  const title = localizedText(locale, post.title_en, post.title_zh);
  const description = localizedText(locale, post.excerpt_en, post.excerpt_zh);
  const alternates = getAlternates(locale, `blog/${slug}`);
  const ogImage = post.cover_image
    ? [{ url: post.cover_image, width: 1200, height: 630, alt: title }]
    : [{ url: `/api/og?title=${encodeURIComponent(title)}`, width: 1200, height: 630, alt: title }];

  return {
    title,
    description,
    alternates,
    openGraph: {
      type: 'article',
      title: `${title} — ${siteT('name')}`,
      description,
      url: alternates.canonical,
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      tags: post.tags,
      images: ogImage,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: TWITTER_CREATOR,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });
  const siteT = await getTranslations({ locale, namespace: 'site' });
  const prefix = locale === 'zh' ? '/zh' : '';

  const supabase = await createClient();
  const { data: rawPostData } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  const post = rawPostData as Tables<'posts'> | null;
  if (!post) notFound();

  const title = localizedText(locale, post.title_en, post.title_zh);
  const content = localizedText(locale, post.content_en, post.content_zh);
  const postUrl = locale === 'zh'
    ? `${SITE_URL}/zh/blog/${slug}`
    : `${SITE_URL}/blog/${slug}`;

  const jsonLd = buildBlogPostingLd({
    title,
    description: localizedText(locale, post.excerpt_en, post.excerpt_zh),
    url: postUrl,
    authorName: siteT('name'),
    publishedAt: post.published_at,
    updatedAt: post.updated_at,
    image: post.cover_image ?? `${SITE_URL}/api/og?title=${encodeURIComponent(title)}`,
    tags: post.tags,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-white dark:bg-[#050505]">
        <main className="w-full mt-0 md:mt-16">
          <div className="max-w-[640px] mx-auto px-6 pt-10 pb-20 md:pt-0">
            <BackLink href={`${prefix}/blog`} label={t('backToBlog')} />

            <article>
              <header className="mb-10">
                <h1 className="text-[22px] md:text-[30px] font-medium leading-snug mb-4">
                  {title}
                </h1>

                <div className="flex items-center gap-4 text-neutral-400 dark:text-neutral-600">
                  {post.published_at && (
                    <time
                      dateTime={post.published_at}
                      className="text-[12px] md:text-[14px]"
                    >
                      {t('publishedOn')} {formatDate(post.published_at, locale)}
                    </time>
                  )}
                  <span className="text-[12px] md:text-[14px]">
                    {t('minuteRead', { count: post.reading_time_minutes })}
                  </span>
                </div>

                {post.tags.length > 0 && (
                  <div className="flex items-center gap-3 mt-4">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] md:text-[13px] uppercase tracking-wider text-neutral-400 dark:text-neutral-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </header>

              <div className="h-[1px] bg-neutral-100 dark:bg-neutral-900 mb-10" />

              <PostContent content={content} />
            </article>
          </div>
        </main>

        <FeedbackButton />
      </div>
    </>
  );
}
