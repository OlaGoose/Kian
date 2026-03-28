import Link from 'next/link';

interface BackLinkProps {
  href: string;
  label: string;
}

export function BackLink({ href, label }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-[13px] md:text-[15px] text-neutral-500 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors mb-10"
    >
      ← {label}
    </Link>
  );
}
