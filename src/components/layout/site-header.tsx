'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Calendar, FolderKanban } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { LocaleSwitcher } from '@/components/ui/locale-switcher';
import { BookingModal } from '@/components/booking/booking-modal';
import { FEATURES } from '@/lib/constants';

interface SiteHeaderProps {
  name: string;
}

export function SiteHeader({ name }: SiteHeaderProps) {
  const locale = useLocale();
  const t = useTranslations('nav');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const prefix = locale === 'zh' ? '/zh' : '';

  return (
    <>
      <div className="flex justify-between items-baseline mb-8">
        <Link
          href={prefix || '/'}
          className="text-copy font-medium text-neutral-900 dark:text-neutral-100 hover:opacity-70 transition-opacity"
        >
          {name}
        </Link>

        <div className="flex items-center gap-5">
          <nav className="flex items-center gap-5">
            <Link
              href={`${prefix}/blog`}
              className="inline-flex text-neutral-500 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              <BookOpen className="w-[15px] h-[15px] shrink-0" strokeWidth={1.5} aria-hidden />
              <span className="sr-only">{t('blog')}</span>
            </Link>
            <Link
              href={`${prefix}/projects`}
              className="inline-flex text-neutral-500 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              <FolderKanban className="w-[15px] h-[15px] shrink-0" strokeWidth={1.5} aria-hidden />
              <span className="sr-only">{t('projects')}</span>
            </Link>
          </nav>
          {FEATURES.booking && (
            <button
              onClick={() => setIsBookingOpen(true)}
              className="text-neutral-400 dark:text-neutral-600 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              aria-label={t('scheduleLabel')}
            >
              <Calendar className="w-[15px] h-[15px]" strokeWidth={1.5} />
            </button>
          )}
          <LocaleSwitcher />
        </div>
      </div>

      {FEATURES.booking && (
        <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
      )}
    </>
  );
}
