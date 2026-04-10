import { SITE_URL } from '@/lib/constants';

/**
 * Generates canonical URL and hreflang alternates for a given locale and path.
 * Path should be the locale-agnostic path (e.g. 'blog', 'blog/my-post').
 * Omit path for the home page.
 *
 * Includes `x-default` pointing to the English URL as recommended by Google.
 * Respects the `localePrefix: 'as-needed'` convention: English has no prefix,
 * Chinese uses the `/zh/` prefix.
 */
export function getAlternates(locale: string, path?: string) {
  const suffix = path ? `/${path}` : '';
  const enUrl = `${SITE_URL}${suffix}`;
  const zhUrl = `${SITE_URL}/zh${suffix}`;

  return {
    canonical: locale === 'zh' ? zhUrl : enUrl,
    languages: {
      en: enUrl,
      'zh-Hans': zhUrl,
      zh: zhUrl,
      'x-default': enUrl,
    },
  };
}
