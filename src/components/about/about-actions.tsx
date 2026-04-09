'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { BookingModal } from '@/components/booking/booking-modal';
import { SOCIAL_LINKS, FEATURES } from '@/lib/constants';

export function AboutActions() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const t = useTranslations('about');

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {FEATURES.booking && (
          <button
            onClick={() => setIsBookingOpen(true)}
            className="py-2.5 px-5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black text-[12px] font-sans font-medium uppercase tracking-wider hover:opacity-80 transition-all active:scale-[0.99] rounded-[2px]"
          >
            {t('bookCta')}
          </button>
        )}
        <a
          href={SOCIAL_LINKS.email}
          className="py-2.5 px-5 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 text-[12px] font-sans font-medium uppercase tracking-wider hover:border-neutral-400 dark:hover:border-neutral-600 transition-all active:scale-[0.99] rounded-[2px]"
        >
          {t('emailCta')}
        </a>
      </div>
      {FEATURES.booking && (
        <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
      )}
    </>
  );
}
