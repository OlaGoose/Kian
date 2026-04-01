import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SiteHeader } from '@/components/layout/site-header';
import { buildPageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const siteT = await getTranslations({ locale, namespace: 'site' });
  const title = locale === 'zh' ? '关于' : 'About';
  const description =
    locale === 'zh'
      ? '关于我的背景、经验和正在构建的方向。'
      : 'Background, experience, and what I am building.';

  return buildPageMetadata({
    locale,
    path: 'about',
    title,
    description,
    siteName: siteT('name'),
  });
}

export default async function AboutPage({ params }: Props) {
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
              {isZh ? '关于' : 'About'}
            </h1>
            <p className="text-copy text-neutral-500 dark:text-neutral-500 mb-8">
              {isZh
                ? '一个更完整的个人简介页，用来解释我是谁、做过什么、以及下一步要做什么。'
                : 'A longer profile page describing who I am, what I have built, and what I am focused on next.'}
            </p>

            <div className="space-y-6 text-copy">
              <p>
                {isZh
                  ? '我专注于把产品思维和工程能力结合，持续构建简洁、可靠、且长期可维护的数字产品。'
                  : 'I focus on combining product thinking with engineering discipline to build software that is simple, reliable, and sustainable.'}
              </p>
              <p>
                {isZh
                  ? '这个页面建议补充：真实姓名、核心头衔、过往履历节点，以及你愿意公开的联系方式。'
                  : 'This page should include your real name, role, selected milestones, and public contact points.'}
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
