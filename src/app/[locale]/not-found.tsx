import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function NotFound() {
  return (
    <div className="min-h-screen font-serif bg-white dark:bg-[#050505] flex items-center justify-center">
      <div className="max-w-[640px] mx-auto px-6 text-center">
        <h1 className="text-[60px] md:text-[82px] font-bold text-neutral-200 dark:text-neutral-800 leading-none mb-4">
          404
        </h1>
        <p className="text-copy text-neutral-500 mb-8">
          This page doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="text-[13px] md:text-[15px] font-sans text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors underline underline-offset-4"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
