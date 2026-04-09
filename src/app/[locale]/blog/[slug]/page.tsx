import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { createBuildClient } from '@/lib/supabase/build';
import { BackLink } from '@/components/layout/back-link';
import { PostContent } from '@/components/blog/post-content';
import { localizedText } from '@/lib/localized-content';
import { formatDate } from '@/lib/utils';
import { getAlternates } from '@/lib/metadata';
import { buildBlogPostingLd, buildFaqPageLd } from '@/lib/structured-data';
import { extractMarkdownToc, stripEmbeddedFaqMarkdown } from '@/lib/blog-markdown';
import { parsePostFaqJson } from '@/lib/post-faq';
import { BlogPostToc } from '@/components/blog/blog-post-toc';
import { FaqSection } from '@/components/blog/faq-section';
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
  const excerpt = localizedText(locale, post.excerpt_en, post.excerpt_zh);
  const localizedBody = localizedText(locale, post.content_en, post.content_zh);
  const faqItems = parsePostFaqJson(locale === 'zh' ? post.faq_zh : post.faq_en);
  const bodyMarkdown = faqItems
    ? stripEmbeddedFaqMarkdown(localizedBody, locale)
    : localizedBody;
  const tocItems = extractMarkdownToc(bodyMarkdown);
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

  const faqLd = faqItems && faqItems.length > 0 ? buildFaqPageLd(faqItems) : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}

      <div className="min-h-screen bg-white dark:bg-[#050505]">
        <main className="w-full mt-0 md:mt-16">
          <div className="mx-auto max-w-[720px] px-6 pb-20 pt-10 md:pt-0">
            <BackLink href={`${prefix}/blog`} label={t('backToBlog')} />

            <article>
              <header className="mb-10 border-b border-neutral-100 pb-10 dark:border-neutral-900">
                <h1 className="mb-4 text-[24px] font-medium leading-snug tracking-[-0.02em] text-neutral-900 dark:text-neutral-100 md:text-[30px] md:leading-[1.22]">
                  {title}
                </h1>

                {excerpt && (
                  <p className="mb-6 max-w-[600px] text-[16px] font-light leading-[1.75] text-neutral-600 dark:text-neutral-400 md:text-[17px]">
                    {excerpt}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-[12px] tracking-wide text-neutral-400 dark:text-neutral-600 md:text-[13px]">
                  {post.published_at && (
                    <>
                      <time dateTime={post.published_at}>
                        {t('publishedOn')} {formatDate(post.published_at, locale)}
                      </time>
                      <span className="text-neutral-300 dark:text-neutral-700" aria-hidden>
                        ·
                      </span>
                    </>
                  )}
                  <span>{t('minuteRead', { count: post.reading_time_minutes })}</span>
                  <span className="text-neutral-300 dark:text-neutral-700" aria-hidden>
                    ·
                  </span>
                  <span>{siteT('name')}</span>
                </div>
              </header>

              <BlogPostToc items={tocItems} label={t('tableOfContents')} />

              <PostContent content={bodyMarkdown} />

              {faqItems && (
                <FaqSection
                  headingId="article-faq"
                  title={t('faqTitle')}
                  description={t('faqDescription')}
                  items={faqItems}
                />
              )}

              {post.tags.length > 0 && (
                <footer className="mt-14 border-t border-neutral-100 pt-10 dark:border-neutral-900">
                  <p className="mb-3 font-sans text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-600">
                    {t('topics')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-[2px] border border-neutral-200 bg-neutral-50 px-3 py-1.5 font-sans text-[12px] text-neutral-600 dark:border-neutral-800 dark:bg-[#0a0a0a] dark:text-neutral-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </footer>
              )}
            </article>
          </div>
        </main>

      </div>
    </>
  );
}
