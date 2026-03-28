import { getRequestConfig } from 'next-intl/server';
import en from '../../messages/en.json';
import zh from '../../messages/zh.json';
import { routing } from './routing';

const messagesByLocale = {
  en,
  zh,
} as const;

type AppLocale = keyof typeof messagesByLocale;

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as AppLocale)) {
    locale = routing.defaultLocale;
  }

  const resolved = locale as AppLocale;

  return {
    locale,
    messages: messagesByLocale[resolved],
  };
});
