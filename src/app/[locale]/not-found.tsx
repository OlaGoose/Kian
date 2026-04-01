import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { localizedText } from '@/lib/localized-content';
import type { PostPreview } from '@/types';

export default async function NotFound() {
  const locale = await getLocale();
  const isZh = locale === 'zh';
  const prefix = isZh ? '/zh' : '';
  const supabase = await createClient();
  const { data: rawPosts } = await supabase
    .from('posts')
    .select('id, slug, title_en, title_zh, excerpt_en, excerpt_zh')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(3);

  const posts = (rawPosts as PostPreview[] | null) ?? [];

  return (
    <div className="min-h-screen font-serif bg-white dark:bg-[#050505] flex items-center justify-center">
      <div className="max-w-[640px] mx-auto px-6">
        <h1 className="text-[60px] md:text-[82px] font-bold text-neutral-200 dark:text-neutral-800 leading-none mb-4 text-center">
          404
        </h1>
        <p className="text-copy text-neutral-500 mb-4 text-center">
          {isZh ? '你访问的页面不存在。' : 'This page does not exist.'}
        </p>
        <p className="text-[14px] md:text-[16px] text-neutral-500 dark:text-neutral-500 mb-8 text-center">
          {isZh ? '你可以先从这三篇文章开始：' : 'Try these featured entries instead:'}
        </p>

        {posts.length > 0 && (
          <ul className="space-y-4 mb-10">
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`${prefix}/blog/${post.slug}`}
                  className="transition-colors underline decoration-neutral-500 decoration-1 underline-offset-[2.5px] hover:decoration-neutral-400 dark:hover:decoration-neutral-600 text-copy"
                >
                  {localizedText(locale, post.title_en, post.title_zh)}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <Link
          href={prefix || '/'}
          className="text-[13px] md:text-[15px] font-sans text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors underline underline-offset-4 block text-center"
        >
          {isZh ? '返回首页' : 'Go home'}
        </Link>
      </div>
    </div>
  );
}
