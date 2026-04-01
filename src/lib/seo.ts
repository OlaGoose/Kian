import type { Metadata } from 'next';
import { getAlternates } from '@/lib/metadata';

type BuildPageMetadataInput = {
  locale: string;
  path: string;
  title: string;
  description: string;
  siteName: string;
};

export function buildPageMetadata({
  locale,
  path,
  title,
  description,
  siteName,
}: BuildPageMetadataInput): Metadata {
  const alternates = getAlternates(locale, path);
  const ogImage = `/api/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    alternates,
    openGraph: {
      title: `${title} — ${siteName}`,
      description,
      url: alternates.canonical,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}
