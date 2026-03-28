/**
 * Picks copy for the active locale, falling back to the other language when
 * the preferred field is empty so pages stay readable with partial CMS data.
 */
export function localizedText(
  locale: string,
  en: string | null | undefined,
  zh: string | null | undefined
): string {
  const enVal = en?.trim() ? en : '';
  const zhVal = zh?.trim() ? zh : '';
  if (locale === 'zh') {
    return zhVal || enVal;
  }
  return enVal || zhVal;
}
