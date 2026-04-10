import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { SiteHeader } from '@/components/layout/site-header';
import { buildPageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const siteT = await getTranslations({ locale, namespace: 'site' });
  const title = locale === 'zh' ? '留言板' : 'Guestbook';
  const description =
    locale === 'zh' ? '欢迎留下你的想法、建议或一句问候。' : 'Leave a message, feedback, or a quick hello.';

  return {
    ...buildPageMetadata({
      locale,
      path: 'guestbook',
      title,
      description,
      siteName: siteT('name'),
    }),
    robots: { index: false, follow: true },
  };
}

export default async function GuestbookPage({ params }: Props) {
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
              {isZh ? '留言板' : 'Guestbook'}
            </h1>
            <p className="text-copy mb-8">
              <Link
                href={prefix || '/'}
                className="transition-colors underline decoration-neutral-500 decoration-1 underline-offset-[2.5px] hover:decoration-neutral-400 dark:hover:decoration-neutral-600"
              >
                {isZh ? '返回首页并点击右下角 Feedback' : 'Go back home and use the feedback button'}
              </Link>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
