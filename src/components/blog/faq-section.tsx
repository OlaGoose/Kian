'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { PostFaqItem } from '@/lib/post-faq';

type FaqItemProps = PostFaqItem;

function FaqItem({ question, answer }: FaqItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-neutral-200 dark:border-neutral-800">
      <button
        type="button"
        className="flex w-full cursor-pointer items-start justify-between gap-4 py-4 text-left font-sans text-[15px] font-medium text-neutral-900 outline-none transition-colors hover:text-neutral-600 focus-visible:rounded-[2px] focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 dark:text-neutral-100 dark:hover:text-neutral-300 dark:focus-visible:ring-neutral-600 dark:focus-visible:ring-offset-[#050505]"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span className="min-w-0 flex-1 pr-2">{question}</span>
        <ChevronDown
          aria-hidden
          className={`mt-0.5 h-[17px] w-[17px] shrink-0 text-neutral-400 transition-transform duration-200 dark:text-neutral-600 ${open ? 'rotate-180' : ''}`}
          strokeWidth={1.5}
        />
      </button>

      {/* CSS grid trick: animates height from 0 → auto smoothly */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <p className="pb-5 font-sans text-[14px] leading-[1.75] text-neutral-600 dark:text-neutral-400 md:text-[15px]">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

type FaqSectionProps = {
  headingId: string;
  title: string;
  description: string;
  items: PostFaqItem[];
};

export function FaqSection({ headingId, title, description, items }: FaqSectionProps) {
  if (items.length === 0) return null;

  return (
    <section
      className="mt-14 border-t border-neutral-200 pt-12 dark:border-neutral-800"
      aria-labelledby={headingId}
    >
      <h2
        id={headingId}
        className="mb-2 text-xl font-medium leading-snug text-neutral-900 dark:text-neutral-100 md:text-2xl"
      >
        {title}
      </h2>
      <p className="mb-8 font-sans text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-500 md:text-[14px]">
        {description}
      </p>
      <div className="border-t border-neutral-200 dark:border-neutral-800">
        {items.map((item, index) => (
          <FaqItem
            key={`${index}-${item.question.slice(0, 40)}`}
            question={item.question}
            answer={item.answer}
          />
        ))}
      </div>
    </section>
  );
}
