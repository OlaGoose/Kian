import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { SiteHeader } from '@/components/layout/site-header';
import { buildPageMetadata } from '@/lib/seo';
import { SNIPPETS } from '@/lib/snippets';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const siteT = await getTranslations({ locale, namespace: 'site' });
  const title = locale === 'zh' ? '代码片段' : 'Snippets';
  const description =
    locale === 'zh'
      ? '面向问题解决的短代码片段与实现笔记。'
      : 'Short, problem-oriented code snippets and implementation notes.';

  return buildPageMetadata({
    locale,
    path: 'snippets',
    title,
    description,
    siteName: siteT('name'),
  });
}

export default async function SnippetsPage({ params }: Props) {
  const { locale } = await params;
  const siteT = await getTranslations({ locale, namespace: 'site' });
  const isZh = locale === 'zh';
  const prefix = isZh ? '/zh' : '';

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505]">
      <main className="w-full mt-0 md:mt-16">
        <div className="max-w-[640px] mx-auto px-6 pt-10 pb-20 md:pt-0">
          <SiteHeader name={siteT('name')} />

          <section>
            <h1 className="text-[22px] md:text-[30px] font-medium leading-tight mb-2">
              {isZh ? '代码片段' : 'Snippets'}
            </h1>
            <p className="text-copy text-neutral-500 dark:text-neutral-500 mb-10">
              {isZh
                ? '每一条都围绕一个可搜索的问题命名，方便长期积累与 SEO。'
                : 'Each snippet is named after a searchable problem for long-term discoverability.'}
            </p>

            <ul className="space-y-8">
              {SNIPPETS.map((snippet) => (
                <li key={snippet.slug}>
                  <Link
                    href={`${prefix}/snippets/${snippet.slug}`}
                    className="group block"
                    aria-label={isZh ? snippet.titleZh : snippet.title}
                  >
                    <h2 className="text-copy font-medium text-neutral-900 dark:text-neutral-100 group-hover:opacity-70 transition-opacity">
                      {isZh ? snippet.titleZh : snippet.title}
                    </h2>
                    <p className="text-[14px] md:text-[17px] leading-relaxed text-neutral-500 dark:text-neutral-500 mt-1">
                      {isZh ? snippet.summaryZh : snippet.summary}
                    </p>
                  </Link>
                  <div className="mt-6 h-[1px] bg-neutral-100 dark:bg-neutral-900" />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
