export type SnippetItem = {
  slug: string;
  title: string;
  titleZh: string;
  summary: string;
  summaryZh: string;
  language: string;
};

export const SNIPPETS: SnippetItem[] = [
  {
    slug: 'tailwind-center-div',
    title: 'Tailwind: center a div reliably',
    titleZh: 'Tailwind：稳定地让 div 居中',
    summary: 'Patterns for centering blocks in both simple and nested layouts.',
    summaryZh: '在简单与嵌套布局中都适用的居中模式。',
    language: 'css',
  },
  {
    slug: 'react-custom-hook-template',
    title: 'React custom hook template',
    titleZh: 'React 自定义 Hook 模板',
    summary: 'A clean baseline for reusable hooks with stable typing.',
    summaryZh: '一个可复用、类型稳定的 Hook 基础模板。',
    language: 'ts',
  },
];

export function getSnippetBySlug(slug: string) {
  return SNIPPETS.find((item) => item.slug === slug);
}
