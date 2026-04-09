import Link from 'next/link';
import type { ReactNode } from 'react';

interface CustomLinkProps {
  href: string;
  children: ReactNode;
  external?: boolean;
  className?: string;
  'data-ga-label'?: string;
}

export function CustomLink({ href, children, external = false, className, 'data-ga-label': gaLabel }: CustomLinkProps) {
  const base =
    'transition-colors underline decoration-neutral-500 decoration-1 underline-offset-[2.5px] hover:decoration-neutral-400 dark:hover:decoration-neutral-600';
  const combined = className ? `${base} ${className}` : base;
  const dataAttrs = gaLabel ? { 'data-ga-label': gaLabel } : {};

  if (external || href.startsWith('http') || href.startsWith('mailto:')) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={combined} {...dataAttrs}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={combined} {...dataAttrs}>
      {children}
    </Link>
  );
}
