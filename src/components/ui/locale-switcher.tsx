'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { motion, AnimatePresence } from 'motion/react';

const locales = [
  { code: 'en' as const, label: 'English' },
  { code: 'zh' as const, label: '中文' },
];

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('nav');
  const [isOpen, setIsOpen] = useState(false);

  const handleLocaleChange = (newLocale: (typeof locales)[number]['code']) => {
    setIsOpen(false);
    if (newLocale === locale) return;
    const href = pathname === '' ? '/' : pathname;
    router.replace(href, { locale: newLocale });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-neutral-400 dark:text-neutral-600 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        aria-label={t('language')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-[13px] font-medium uppercase tracking-wider">
          {locale}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              aria-hidden
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              role="listbox"
              aria-label={t('language')}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-28 bg-white dark:bg-[#0a0a0a] border border-neutral-100 dark:border-neutral-900 z-20 rounded-[2px]"
            >
              {locales.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  role="option"
                  aria-selected={locale === l.code}
                  onClick={() => handleLocaleChange(l.code)}
                  className={`w-full text-left px-4 py-2 text-[13px] transition-colors ${
                    locale === l.code
                      ? 'text-neutral-900 dark:text-neutral-100 bg-neutral-50 dark:bg-neutral-900'
                      : 'text-neutral-400 dark:text-neutral-600 hover:text-neutral-900 dark:hover:text-neutral-100'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
