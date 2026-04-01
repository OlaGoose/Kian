import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SiteHeader } from '@/components/layout/site-header';
import { CustomLink } from '@/components/ui/custom-link';
import { SOCIAL_LINKS } from '@/lib/constants';
import { buildPageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const siteT = await getTranslations({ locale, namespace: 'site' });
  const title = locale === 'zh' ? '订阅' : 'Newsletter';
  const description =
    locale === 'zh' ? '接收我最新的文章、笔记与项目更新。' : 'Get updates on new writing, notes, and projects.';

  return buildPageMetadata({
    locale,
    path: 'newsletter',
    title,
    description,
    siteName: siteT('name'),
  });
}

export default async function NewsletterPage({ params }: Props) {
  const { locale } = await params;
  const siteT = await getTranslations({ locale, namespace: 'site' });
  const isZh = locale === 'zh';

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505]">
      <main className="w-full mt-0 md:mt-16">
        <div className="max-w-[640px] mx-auto px-6 pt-10 pb-20 md:pt-0">
          <SiteHeader name={siteT('name')} />

          <section>
            <h1 className="text-[22px] md:text-[30px] font-medium leading-tight mb-2">
              {isZh ? '订阅' : 'Newsletter'}
            </h1>
            <p className="text-copy text-neutral-500 dark:text-neutral-500 mb-8">
              {isZh
                ? '当前使用轻量占位方式。你可以后续接入 ConvertKit、Beehiiv 或自建订阅 API。'
                : 'This is a lightweight placeholder route. You can connect ConvertKit, Beehiiv, or a custom API later.'}
            </p>
            <p className="text-copy">
              {isZh ? '先通过邮箱联系：' : 'For now, subscribe via email request: '}
              <CustomLink href={SOCIAL_LINKS.email} external>
                {SOCIAL_LINKS.email.replace('mailto:', '')}
              </CustomLink>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
