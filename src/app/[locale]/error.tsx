'use client';

import { useEffect } from 'react';

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] flex items-center justify-center px-6">
      <div className="max-w-[640px] w-full">
        <p className="text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-600 mb-4">
          Error
        </p>
        <h1 className="text-[22px] md:text-[30px] font-medium text-neutral-900 dark:text-neutral-100 mb-3">
          Something went wrong
        </h1>
        <p className="text-[14px] md:text-[17px] leading-relaxed text-neutral-500 mb-8">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="py-2.5 px-5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black text-[12px] font-medium uppercase tracking-wider hover:opacity-80 transition-all active:scale-[0.99] rounded-[2px]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
