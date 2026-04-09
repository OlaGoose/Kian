import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SiteHeader } from '@/components/layout/site-header';
import { CustomLink } from '@/components/ui/custom-link';
import { AboutActions } from '@/components/about/about-actions';
import { buildPageMetadata } from '@/lib/seo';
import { buildPersonLd, buildProfilePageLd } from '@/lib/structured-data';
import { SITE_URL, SOCIAL_LINKS } from '@/lib/constants';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const siteT = await getTranslations({ locale, namespace: 'site' });
  const t = await getTranslations({ locale, namespace: 'about' });

  return buildPageMetadata({
    locale,
    path: 'about',
    title: t('metaTitle'),
    description: t('metaDescription'),
    siteName: siteT('name'),
  });
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const siteT = await getTranslations({ locale, namespace: 'site' });
  const t = await getTranslations({ locale, namespace: 'about' });

  const aboutUrl = locale === 'zh' ? `${SITE_URL}/zh/about` : `${SITE_URL}/about`;

  const sameAs = [SOCIAL_LINKS.twitter, SOCIAL_LINKS.github, SOCIAL_LINKS.linkedin].filter(Boolean);

  const personLd = buildPersonLd({
    name: siteT('name'),
    alternateName: locale === 'zh' ? 'Kian Xu' : '许元凯',
    description: t('metaDescription'),
    jobTitle: t('jobTitle'),
    worksFor: {
      name: locale === 'zh' ? '独立采购 Agent' : 'Independent Sourcing Agent',
    },
    alumniOf: [
      { name: locale === 'zh' ? '平安科技' : 'Ping An Technology', url: 'https://group.pingan.com/' },
      { name: locale === 'zh' ? '顺丰国际' : 'S.F. International', url: 'https://www.sf-express.com/' },
      { name: 'PLAUD', url: 'https://www.plaud.ai/' },
    ],
    knowsAbout:
      locale === 'zh'
        ? ['B2B 科技产品采购', '硬件采购', '供应链管理', '深圳电子产业', '传感器采购', '跨境电商', 'SEO', '前端开发', 'Next.js', 'TypeScript']
        : ['B2B Tech Product Sourcing', 'Hardware Procurement', 'Supply Chain Management', 'Shenzhen Electronics', 'Sensor Sourcing', 'Cross-border E-commerce', 'SEO', 'Frontend Development', 'Next.js', 'TypeScript'],
    address: { locality: 'Shenzhen', country: 'CN' },
    hasOccupation: {
      name: t('jobTitle'),
      location: 'Shenzhen',
      description: t('occupationDescription'),
    },
  });

  const profilePageLd = buildProfilePageLd({
    url: aboutUrl,
    name: t('metaTitle'),
    description: t('metaDescription'),
    person: { ...personLd, sameAs },
  });

  const experiences = [
    {
      company: t('exp1Company'),
      role: t('exp1Role'),
      detail: t('exp1Detail'),
      url: 'https://group.pingan.com/',
    },
    {
      company: t('exp2Company'),
      role: t('exp2Role'),
      detail: t('exp2Detail'),
      url: 'https://www.sf-express.com/',
    },
    {
      company: t('exp3Company'),
      role: t('exp3Role'),
      detail: t('exp3Detail'),
      url: 'https://www.plaud.ai/',
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageLd) }}
      />
      <div className="min-h-screen bg-white dark:bg-[#050505]">
        <main className="w-full mt-0 md:mt-16">
          <div className="max-w-[640px] mx-auto px-6 pt-10 pb-20 md:pt-0">
            <SiteHeader name={siteT('name')} />

            <h1 className="text-[22px] md:text-[30px] font-medium leading-tight mb-2">
              {t('heading')}
            </h1>
            <p className="text-[13px] md:text-[15px] leading-relaxed text-neutral-500 dark:text-neutral-500 mb-8">
              {t('intro')}
            </p>

            <div className="space-y-6 text-copy">
              <p>{t('body1')}</p>
              <p>{t('body2')}</p>
              <p>{t('body3')}</p>
            </div>

            <p className="text-[11px] md:text-[13px] uppercase tracking-wider text-neutral-400 dark:text-neutral-600 mt-10 mb-5">
              {t('experienceLabel')}
            </p>

            <div className="space-y-6">
              {experiences.map(({ company, role, detail, url }) => (
                <div key={company} className="border-l-2 border-neutral-100 dark:border-neutral-900 pl-4">
                  <p className="text-copy font-medium">
                    <CustomLink href={url} external>{company}</CustomLink>
                  </p>
                  <p className="text-[13px] md:text-[14px] text-neutral-500 dark:text-neutral-500 mt-0.5 font-sans">
                    {role}
                  </p>
                  <p className="text-[13px] md:text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-400 mt-2">
                    {detail}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-10 border-t border-neutral-100 dark:border-neutral-900">
              <p className="text-[11px] md:text-[13px] uppercase tracking-wider text-neutral-400 dark:text-neutral-600 mb-4">
                {t('contactLabel')}
              </p>
              <p className="text-copy mb-6">{t('contactText')}</p>
              <AboutActions />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
