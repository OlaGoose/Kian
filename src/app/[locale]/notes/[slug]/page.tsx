import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { BackLink } from '@/components/layout/back-link';
import { buildPageMetadata } from '@/lib/seo';
import { getNoteBySlug, NOTES } from '@/lib/notes';

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return NOTES.flatMap((note) => [
    { locale: 'en', slug: note.slug },
    { locale: 'zh', slug: note.slug },
  ]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const siteT = await getTranslations({ locale, namespace: 'site' });
  const note = getNoteBySlug(slug);

  if (!note) return { title: 'Not Found' };

  const title = locale === 'zh' ? `笔记：${slug}` : `Note: ${slug}`;
  const description =
    locale === 'zh' ? '数字花园中的过程化记录。' : 'A process-focused entry in the digital garden.';
  return {
    ...buildPageMetadata({
      locale,
      path: `notes/${slug}`,
      title,
      description,
      siteName: siteT('name'),
    }),
    robots: { index: false, follow: true },
  };
}

export default async function NoteDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const note = getNoteBySlug(slug);

  if (!note) notFound();

  const isZh = locale === 'zh';
  const prefix = isZh ? '/zh' : '';

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505]">
      <main className="w-full mt-0 md:mt-16">
        <div className="max-w-[640px] mx-auto px-6 pt-10 pb-20 md:pt-0">
          <BackLink href={`${prefix}/notes`} label={isZh ? '返回笔记' : 'All notes'} />
          <article>
            <h1 className="text-[22px] md:text-[30px] font-medium leading-snug mb-3">
              {isZh ? `笔记：${slug}` : `Note: ${slug}`}
            </h1>
            <p className="text-copy text-neutral-500 dark:text-neutral-500">
              {isZh
                ? '这是一个过程化笔记路由，用于承载尚未成熟但值得公开的思考。'
                : 'This route is meant for in-progress ideas that are useful before they become a full blog post.'}
            </p>
          </article>
        </div>
      </main>
    </div>
  );
}
