import { SITE_URL, SOCIAL_LINKS } from '@/lib/constants';

type PersonLdOptions = {
  name: string;
  alternateName?: string;
  description?: string;
  image?: string;
  jobTitle?: string;
  worksFor?: { name: string; url?: string };
  alumniOf?: Array<{ name: string; url?: string }>;
  knowsAbout?: string[];
  address?: { locality: string; country: string };
  hasOccupation?: { name: string; location?: string; description?: string };
};

export function buildPersonLd({
  name,
  alternateName,
  description,
  image,
  jobTitle,
  worksFor,
  alumniOf,
  knowsAbout,
  address,
  hasOccupation,
}: PersonLdOptions) {
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
    ...(alternateName && { alternateName }),
    url: SITE_URL,
    ...(description && { description }),
    ...(image && { image }),
    ...(jobTitle && { jobTitle }),
    ...(worksFor && {
      worksFor: {
        '@type': 'Organization',
        name: worksFor.name,
        ...(worksFor.url && { url: worksFor.url }),
      },
    }),
    ...(alumniOf &&
      alumniOf.length > 0 && {
        alumniOf: alumniOf.map((org) => ({
          '@type': 'Organization',
          name: org.name,
          ...(org.url && { url: org.url }),
        })),
      }),
    ...(knowsAbout && knowsAbout.length > 0 && { knowsAbout }),
    ...(sameAs.length > 0 && { sameAs }),
    ...(address && {
      address: {
        '@type': 'PostalAddress',
        addressLocality: address.locality,
        addressCountry: address.country,
      },
    }),
    ...(hasOccupation && {
      hasOccupation: {
        '@type': 'Occupation',
        name: hasOccupation.name,
        ...(hasOccupation.location && {
          occupationLocation: { '@type': 'City', name: hasOccupation.location },
        }),
        ...(hasOccupation.description && { description: hasOccupation.description }),
      },
    }),
  };
}

type ProfilePageLdOptions = {
  url: string;
  name: string;
  description: string;
  person: object;
};

export function buildProfilePageLd({ url, name, description, person }: ProfilePageLdOptions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url,
    name,
    description,
    mainEntity: person,
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

type FaqItem = {
  question: string;
  answer: string;
};

export function buildFaqPageLd(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
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
