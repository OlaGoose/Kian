import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { BackLink } from '@/components/layout/back-link';
import { SiteHeader } from '@/components/layout/site-header';
import { FeedbackButton } from '@/components/feedback/feedback-button';
import { localizedText } from '@/lib/localized-content';
import { formatDate } from '@/lib/utils';
import { getAlternates } from '@/lib/metadata';
import type { PostPreview } from '@/types';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });
  const siteT = await getTranslations({ locale, namespace: 'site' });
  const alternates = getAlternates(locale, 'blog');

  return {
    title: t('title'),
    description: t('description'),
    alternates,
    openGraph: {
      title: `${t('title')} — ${siteT('name')}`,
      description: t('description'),
      url: alternates.canonical,
    },
  };
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

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505]">
      <main className="w-full mt-0 md:mt-16">
        <div className="max-w-[640px] mx-auto px-6 pt-10 pb-20 md:pt-0">
        <SiteHeader name={siteT('name')} />

        <section>
          <h1 className="text-[22px] md:text-[28px] font-medium leading-tight mb-2">
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
                        <span className="text-[12px] text-neutral-400 dark:text-neutral-600 whitespace-nowrap mt-0.5 flex-shrink-0">
                          {post.reading_time_minutes}m
                        </span>
                      </div>

                      {getExcerpt(post) && (
                        <p className="text-[14px] md:text-[15px] leading-relaxed text-neutral-500 dark:text-neutral-500 mb-2">
                          {getExcerpt(post)}
                        </p>
                      )}

                      <div className="flex items-center gap-4">
                        {post.published_at && (
                          <time
                            dateTime={post.published_at}
                            className="text-[12px] text-neutral-400 dark:text-neutral-600"
                          >
                            {formatDate(post.published_at, locale)}
                          </time>
                        )}
                        {post.tags.length > 0 && (
                          <div className="flex items-center gap-2">
                            {post.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-600"
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

      <FeedbackButton />
    </div>
  );
}
