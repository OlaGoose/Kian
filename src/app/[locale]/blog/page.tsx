import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { BackLink } from '@/components/layout/back-link';
import { SiteHeader } from '@/components/layout/site-header';
import { localizedText } from '@/lib/localized-content';
import { formatDate } from '@/lib/utils';
import { buildPageMetadata } from '@/lib/seo';
import { buildItemListLd } from '@/lib/structured-data';
import { SITE_URL } from '@/lib/constants';
import type { PostPreview } from '@/types';

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });
  const siteT = await getTranslations({ locale, namespace: 'site' });

  return buildPageMetadata({
    locale,
    path: 'blog',
    title: t('title'),
    description: t('description'),
    siteName: siteT('name'),
  });
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });
  const siteT = await getTranslations({ locale, namespace: 'site' });
  const prefix = locale === 'zh' ? '/zh' : '';

  const supabase = await createClient();
  const { data: posts } = await supabase
    .from('posts')
    .select(
      'id, slug, title_en, title_zh, excerpt_en, excerpt_zh, published_at, tags, reading_time_minutes, cover_image'
    )
    .eq('published', true)
    .order('published_at', { ascending: false });

  const getTitle = (post: PostPreview) =>
    localizedText(locale, post.title_en, post.title_zh);
  const getExcerpt = (post: PostPreview) =>
    localizedText(locale, post.excerpt_en, post.excerpt_zh);

  const blogUrl = `${SITE_URL}${prefix}/blog`;

  const blogListLd = buildItemListLd({
    name: t('title'),
    url: blogUrl,
    items:
      (posts as PostPreview[])?.map((post, i) => ({
        position: i + 1,
        name: getTitle(post),
        url: `${SITE_URL}${prefix}/blog/${post.slug}`,
        description: getExcerpt(post),
      })) ?? [],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListLd) }}
      />
      <div className="min-h-screen bg-white dark:bg-[#050505]">
      <main className="w-full mt-0 md:mt-16">
        <div className="max-w-[640px] mx-auto px-6 pt-10 pb-20 md:pt-0">
        <SiteHeader name={siteT('name')} />

        <section>
          <h1 className="text-[22px] md:text-[30px] font-medium leading-tight mb-2">
            {t('title')}
          </h1>
          <p className="text-copy text-neutral-500 dark:text-neutral-500 mb-10">
            {t('description')}
          </p>

          {!posts || posts.length === 0 ? (
            <p className="text-copy text-neutral-500 dark:text-neutral-500">{t('empty')}</p>
          ) : (
            <ul className="space-y-8">
              {(posts as PostPreview[]).map((post) => (
                <li key={post.id}>
                  <Link
                    href={`${prefix}/blog/${post.slug}`}
                    className="group block"
                    aria-label={getTitle(post)}
                  >
                    <article>
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <h2 className="text-copy font-medium text-neutral-900 dark:text-neutral-100 group-hover:opacity-70 transition-opacity leading-snug">
                          {getTitle(post)}
                        </h2>
                        <span className="text-[12px] md:text-[14px] text-neutral-400 dark:text-neutral-600 whitespace-nowrap mt-0.5 flex-shrink-0">
                          {post.reading_time_minutes}m
                        </span>
                      </div>

                      {getExcerpt(post) && (
                        <p className="text-[14px] md:text-[17px] leading-relaxed text-neutral-500 dark:text-neutral-500 mb-2">
                          {getExcerpt(post)}
                        </p>
                      )}

                      <div className="flex items-center gap-4">
                        {post.published_at && (
                          <time
                            dateTime={post.published_at}
                            className="text-[12px] md:text-[14px] text-neutral-400 dark:text-neutral-600"
                          >
                            {formatDate(post.published_at, locale)}
                          </time>
                        )}
                        {post.tags.length > 0 && (
                          <div className="flex items-center gap-2">
                            {post.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-[11px] md:text-[13px] uppercase tracking-wider text-neutral-400 dark:text-neutral-600"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  </Link>
                  <div className="mt-8 h-[1px] bg-neutral-100 dark:bg-neutral-900" />
                </li>
              ))}
            </ul>
          )}
        </section>
        </div>
      </main>

    </div>
    </>
  );
}
