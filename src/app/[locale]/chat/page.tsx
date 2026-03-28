import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ChatInterface } from '@/components/chat/chat-interface';
import { SITE_URL } from '@/lib/constants';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'chat' });
  const siteT = await getTranslations({ locale, namespace: 'site' });

  return {
    title: t('title'),
    description: siteT('description'),
    // Prevent AI chat from being indexed (not useful for search)
    robots: { index: false, follow: true },
    alternates: {
      canonical: locale === 'zh' ? `${SITE_URL}/zh/chat` : `${SITE_URL}/chat`,
    },
  };
}

export default async function ChatPage({ params }: Props) {
  const { locale } = await params;
  const siteT = await getTranslations({ locale, namespace: 'site' });

  return <ChatInterface siteName={siteT('name')} />;
}
