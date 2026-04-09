import GithubSlugger from 'github-slugger';

export type MarkdownTocItem = {
  id: string;
  text: string;
};

export function stripEmbeddedFaqMarkdown(markdown: string, locale: string): string {
  const pattern =
    locale === 'zh'
      ? /\n\n---\n\n## 常见问题\n\n[\s\S]*$/u
      : /\n\n---\n\n## Frequently Asked Questions\n\n[\s\S]*$/u;
  return markdown.replace(pattern, '').trimEnd();
}

export function extractMarkdownToc(markdown: string, maxDepth = 2): MarkdownTocItem[] {
  if (maxDepth !== 2) return [];
  const slugger = new GithubSlugger();
  const lines = markdown.split('\n');
  const items: MarkdownTocItem[] = [];

  for (const line of lines) {
    const match = /^## (.+)$/.exec(line);
    if (!match) continue;
    const text = match[1].trim();
    if (!text) continue;
    items.push({ id: slugger.slug(text), text });
  }

  return items;
}
