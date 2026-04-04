import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { BackLink } from '@/components/layout/back-link';
import { FeedbackButton } from '@/components/feedback/feedback-button';
import { OzonCatalogClient } from '@/components/projects/ozon-catalog-client';
import { buildPageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ozonCatalog' });
  const siteT = await getTranslations({ locale, namespace: 'site' });
  return buildPageMetadata({
    locale,
    path: 'projects/ozon-catalog',
    title: t('meta.title'),
    description: t('meta.description'),
    siteName: siteT('name'),
  });
}

export default async function OzonCatalogPage({ params }: Props) {
  const { locale } = await params;
  const prefix = locale === 'zh' ? '/zh' : '';
  const t = await getTranslations({ locale, namespace: 'ozonCatalog' });

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505]">
      <main className="w-full mt-0 md:mt-16">
        <div className="mx-auto w-full max-w-[640px] px-6 pt-10 pb-20 md:pt-0 lg:max-w-6xl xl:max-w-7xl">
          <BackLink href={`${prefix}/projects`} label={t('back')} />

          <header className="mb-8">
            <h1 className="text-[22px] md:text-[30px] font-medium leading-snug mb-2">
              {t('meta.title')}
            </h1>
            <p className="text-copy text-neutral-500 dark:text-neutral-500">{t('intro')}</p>
          </header>

          <OzonCatalogClient />
        </div>
      </main>

      <FeedbackButton />
    </div>
  );
}
