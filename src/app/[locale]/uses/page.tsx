import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SiteHeader } from '@/components/layout/site-header';
import { buildPageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const siteT = await getTranslations({ locale, namespace: 'site' });
  const title = locale === 'zh' ? '我的工具' : 'Uses';
  const description =
    locale === 'zh'
      ? '我日常使用的硬件、软件和开发工具清单。'
      : 'Hardware, software, and tools I use daily.';

  return {
    ...buildPageMetadata({
      locale,
      path: 'uses',
      title,
      description,
      siteName: siteT('name'),
    }),
    robots: { index: false, follow: true },
  };
}

const TOOL_SECTIONS = [
  {
    id: 'hardware',
    en: 'Hardware',
    zh: '硬件',
    items: ['Laptop', 'Monitor', 'Keyboard', 'Audio'],
  },
  {
    id: 'software',
    en: 'Software',
    zh: '软件',
    items: ['Editor', 'Terminal', 'Browser', 'Productivity'],
  },
];

export default async function UsesPage({ params }: Props) {
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
              {isZh ? '我的工具' : 'Uses'}
            </h1>
            <p className="text-copy text-neutral-500 dark:text-neutral-500 mb-10">
              {isZh
                ? '持续更新我的工作台与软件栈，用于建立可复现的创作与开发环境。'
                : 'A living list of tools and setup I rely on for building and writing.'}
            </p>

            <div className="space-y-10">
              {TOOL_SECTIONS.map((section) => (
                <section key={section.id}>
                  <h2 className="text-[11px] md:text-[13px] uppercase tracking-wider text-neutral-400 dark:text-neutral-600 mb-4">
                    {isZh ? section.zh : section.en}
                  </h2>
                  <ul className="space-y-3">
                    {section.items.map((item) => (
                      <li key={item} className="text-copy">
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
