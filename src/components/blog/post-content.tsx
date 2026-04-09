import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

interface PostContentProps {
  content: string;
}

export function PostContent({ content }: PostContentProps) {
  return (
    <div className="prose-minimal prose-article">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'wrap' }],
        ]}
        components={{
          table({ children }) {
            return (
              <div className="not-prose my-8 overflow-x-auto rounded-[2px] border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-[#0a0a0a]">
                <table className="w-full min-w-[520px] border-collapse text-left text-[13px] md:min-w-0 md:text-[14px]">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return (
              <thead className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/50">
                {children}
              </thead>
            );
          },
          tbody({ children }) {
            return (
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900 [&>tr:last-child>td]:border-b-0">
                {children}
              </tbody>
            );
          },
          tr({ children }) {
            return <tr>{children}</tr>;
          },
          th({ children }) {
            return (
              <th className="px-4 py-3 align-top font-sans text-[11px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-600">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="border-b border-neutral-100 px-4 py-3 align-top text-neutral-800 dark:border-neutral-900 dark:text-neutral-200">
                {children}
              </td>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote className="not-prose my-8 border-l-2 border-neutral-300 py-0.5 pl-5 italic dark:border-neutral-600 [&_p]:mb-3 [&_p]:text-[16px] [&_p]:leading-[1.75] [&_p]:text-neutral-800 [&_p]:font-normal [&_strong]:font-medium [&_strong]:not-italic [&_ul]:mb-3 [&_ul]:mt-0 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_ul]:text-[15px] [&_ul]:not-italic [&_p:last-child]:mb-0 [&_ul:last-child]:mb-0 md:[&_p]:text-[17px] md:[&_ul]:text-[16px] dark:[&_p]:text-neutral-200 dark:[&_ul]:text-neutral-300">
                {children}
              </blockquote>
            );
          },
          code({ className, children, ...props }) {
            const isBlock = className?.startsWith('language-');
            const codeString = String(children).replace(/\n$/, '');

            if (isBlock) {
              return (
                <pre>
                  <code className={className} {...props}>
                    {codeString}
                  </code>
                </pre>
              );
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          // Open external links in new tab
          a({ href, children, ...props }) {
            const isExternal = href?.startsWith('http');
            return (
              <a
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                {...props}
              >
                {children}
              </a>
            );
          },
          // Custom list items (remove default bullet)
          li({ children }) {
            return <li>{children}</li>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
