import { ChevronDown } from 'lucide-react';
import type { PostFaqItem } from '@/lib/post-faq';

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
        className="mb-2 text-xl font-medium leading-snug text-neutral-900 dark:text-neutral-100 md:text-2xl md:leading-[3.25rem]"
      >
        {title}
      </h2>
      <p className="mb-8 font-sans text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-500 md:text-[15px]">
        {description}
      </p>
      <div className="divide-y divide-neutral-200 border-y border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
        {items.map((item, index) => (
          <details key={`${index}-${item.question.slice(0, 48)}`} className="group">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-4 font-sans text-[15px] font-medium text-neutral-900 outline-none transition-colors hover:text-neutral-600 focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 dark:text-neutral-100 dark:hover:text-neutral-300 dark:focus-visible:ring-neutral-600 dark:focus-visible:ring-offset-[#050505] [&::-webkit-details-marker]:hidden">
              <span className="min-w-0 flex-1 pr-2">{item.question}</span>
              <ChevronDown
                aria-hidden
                className="mt-0.5 h-[17px] w-[17px] shrink-0 text-neutral-400 transition-transform duration-200 group-open:rotate-180 dark:text-neutral-600"
                strokeWidth={1.5}
              />
            </summary>
            <div className="pb-4 pl-0 font-sans text-[14px] leading-[1.75] text-neutral-600 dark:text-neutral-400 md:text-[15px]">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
