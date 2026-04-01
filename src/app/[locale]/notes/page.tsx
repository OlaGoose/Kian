import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { SiteHeader } from '@/components/layout/site-header';
import { buildPageMetadata } from '@/lib/seo';
import { NOTES } from '@/lib/notes';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const siteT = await getTranslations({ locale, namespace: 'site' });
  const title = locale === 'zh' ? '数字花园' : 'Notes';
  const description =
    locale === 'zh'
      ? '碎片化思考与进行中的想法，作为博客之外的知识生长区。'
      : 'Short-form notes and work-in-progress ideas that grow over time.';

  return buildPageMetadata({
    locale,
    path: 'notes',
    title,
    description,
    siteName: siteT('name'),
  });
}

export default async function NotesPage({ params }: Props) {
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
              {isZh ? '数字花园' : 'Notes'}
            </h1>
            <p className="text-copy text-neutral-500 dark:text-neutral-500 mb-10">
              {isZh
                ? '相比长文，这里记录生长中的想法与实验。'
                : 'Unlike long-form posts, this section captures ideas while they are still evolving.'}
            </p>

            <ul className="space-y-5">
              {NOTES.map((note) => (
                <li key={note.slug} className="flex items-center justify-between gap-4">
                  <Link
                    href={`${prefix}/notes/${note.slug}`}
                    className="text-copy text-neutral-900 dark:text-neutral-100 hover:opacity-70 transition-opacity"
                  >
                    {note.slug}
                  </Link>
                  <span className="text-[11px] md:text-[13px] uppercase tracking-wider text-neutral-400 dark:text-neutral-600">
                    {note.status}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
