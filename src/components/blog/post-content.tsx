import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

interface PostContentProps {
  content: string;
}

export function PostContent({ content }: PostContentProps) {
  return (
    <div className="prose-minimal">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'wrap' }],
        ]}
        components={{
          // Render code blocks with inline styles for syntax highlighting
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
