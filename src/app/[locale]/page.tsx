import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { HomeClient } from '@/components/home/home-client';
import { getAlternates } from '@/lib/metadata';
import { buildPersonLd, buildWebSiteLd } from '@/lib/structured-data';
import type { PostPreview } from '@/types';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'site' });

  return {
    title: { absolute: t('name') },
    description: t('description'),
    alternates: getAlternates(locale),
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'site' });

  // Fetch featured/recent posts from Supabase
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from('posts')
    .select(
      'id, slug, title_en, title_zh, excerpt_en, excerpt_zh, published_at, tags, reading_time_minutes, cover_image'
    )
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(6);

  const personLd = buildPersonLd({ name: t('name'), description: t('description') });
  const websiteLd = buildWebSiteLd({ name: t('name'), description: t('description') });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />
      <HomeClient
        name={t('name')}
        posts={(posts as PostPreview[]) ?? []}
      />
    </>
  );
}
