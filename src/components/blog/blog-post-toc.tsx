import type { MarkdownTocItem } from '@/lib/blog-markdown';

type BlogPostTocProps = {
  items: MarkdownTocItem[];
  label: string;
};

export function BlogPostToc({ items, label }: BlogPostTocProps) {
  if (items.length < 2) return null;

  return (
    <nav
      aria-label={label}
      className="mb-10 rounded-[2px] border border-neutral-200 bg-neutral-50/80 p-5 dark:border-neutral-800 dark:bg-[#0a0a0a]/80"
    >
      <p className="mb-3 font-sans text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-600">
        {label}
      </p>
      <ol className="list-decimal space-y-2 pl-5 font-sans text-[13px] md:text-[14px] text-neutral-600 dark:text-neutral-400 marker:text-neutral-400 dark:marker:text-neutral-600">
        {items.map((item) => (
          <li key={item.id} className="pl-1">
            <a
              href={`#${item.id}`}
              className="text-neutral-700 no-underline transition-colors hover:text-neutral-900 hover:underline dark:text-neutral-300 dark:hover:text-neutral-100"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
