import { SITE_URL, SOCIAL_LINKS } from '@/lib/constants';

type PersonLdOptions = {
  name: string;
  description?: string;
  image?: string;
};

export function buildPersonLd({ name, description, image }: PersonLdOptions) {
  const sameAs = [
    SOCIAL_LINKS.twitter,
    SOCIAL_LINKS.github,
    SOCIAL_LINKS.linkedin,
    SOCIAL_LINKS.youtube,
  ].filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    url: SITE_URL,
    ...(description && { description }),
    ...(image && { image }),
    ...(sameAs.length > 0 && { sameAs }),
  };
}

type WebSiteLdOptions = {
  name: string;
  description: string;
};

export function buildWebSiteLd({ name, description }: WebSiteLdOptions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: SITE_URL,
    name,
    description,
    inLanguage: ['en', 'zh'],
  };
}

type BlogPostingLdOptions = {
  title: string;
  description: string | null;
  url: string;
  authorName: string;
  publishedAt: string | null;
  updatedAt: string;
  image?: string | null;
  tags?: string[];
};

export function buildBlogPostingLd({
  title,
  description,
  url,
  authorName,
  publishedAt,
  updatedAt,
  image,
  tags,
}: BlogPostingLdOptions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    ...(description && { description }),
    url,
    ...(publishedAt && { datePublished: publishedAt }),
    dateModified: updatedAt,
    author: {
      '@type': 'Person',
      name: authorName,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Person',
      name: authorName,
      url: SITE_URL,
    },
    ...(image && { image }),
    ...(tags && tags.length > 0 && { keywords: tags.join(', ') }),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };
}

type ItemListLdOptions = {
  name: string;
  url: string;
  items: Array<{
    position: number;
    name: string;
    url: string;
    description?: string | null;
  }>;
};

export function buildItemListLd({ name, url, items }: ItemListLdOptions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    url,
    numberOfItems: items.length,
    itemListElement: items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      url: item.url,
      name: item.name,
      ...(item.description && { description: item.description }),
    })),
  };
}

type CollectionPageLdOptions = {
  name: string;
  description: string;
  url: string;
};

export function buildCollectionPageLd({ name, description, url }: CollectionPageLdOptions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    author: {
      '@type': 'Person',
      url: SITE_URL,
    },
  };
}

export function buildSoftwareAppListLd({
  name,
  items,
}: {
  name: string;
  items: Array<{
    position: number;
    name: string;
    description: string | null;
    url: string | null;
  }>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    itemListElement: items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      item: {
        '@type': 'SoftwareApplication',
        name: item.name,
        ...(item.description && { description: item.description }),
        ...(item.url && { url: item.url }),
        applicationCategory: 'WebApplication',
        author: {
          '@type': 'Person',
          url: SITE_URL,
        },
      },
    })),
  };
}
