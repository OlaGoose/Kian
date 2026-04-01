import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { BackLink } from '@/components/layout/back-link';
import { buildPageMetadata } from '@/lib/seo';
import { getSnippetBySlug, SNIPPETS } from '@/lib/snippets';

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return SNIPPETS.flatMap((snippet) => [
    { locale: 'en', slug: snippet.slug },
    { locale: 'zh', slug: snippet.slug },
  ]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const siteT = await getTranslations({ locale, namespace: 'site' });
  const snippet = getSnippetBySlug(slug);

  if (!snippet) {
    return { title: 'Not Found' };
  }

  const title = locale === 'zh' ? snippet.titleZh : snippet.title;
  const description = locale === 'zh' ? snippet.summaryZh : snippet.summary;
  return buildPageMetadata({
    locale,
    path: `snippets/${slug}`,
    title,
    description,
    siteName: siteT('name'),
  });
}

export default async function SnippetDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const snippet = getSnippetBySlug(slug);

  if (!snippet) {
    notFound();
  }

  const isZh = locale === 'zh';
  const prefix = isZh ? '/zh' : '';

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505]">
      <main className="w-full mt-0 md:mt-16">
        <div className="max-w-[640px] mx-auto px-6 pt-10 pb-20 md:pt-0">
          <BackLink href={`${prefix}/snippets`} label={isZh ? '返回片段列表' : 'All snippets'} />

          <article>
            <header className="mb-8">
              <h1 className="text-[22px] md:text-[30px] font-medium leading-snug mb-2">
                {isZh ? snippet.titleZh : snippet.title}
              </h1>
              <p className="text-copy text-neutral-500 dark:text-neutral-500">
                {isZh ? snippet.summaryZh : snippet.summary}
              </p>
            </header>

            <div className="h-[1px] bg-neutral-100 dark:bg-neutral-900 mb-8" />

            <section className="text-copy space-y-5">
              <p>
                {isZh
                  ? '该片段用于承载问题导向的技术内容。你可以在此补充核心思路、边界条件与可复用代码。'
                  : 'This route is designed for problem-first technical content. Add context, edge cases, and reusable code here.'}
              </p>
              <p className="text-[12px] md:text-[14px] text-neutral-400 dark:text-neutral-600 uppercase tracking-wider">
                {snippet.language}
              </p>
            </section>
          </article>
        </div>
      </main>
    </div>
  );
}
