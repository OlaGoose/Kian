import type { Json } from '@/lib/supabase/database.types';

export type PostFaqItem = {
  question: string;
  answer: string;
};

export function parsePostFaqJson(raw: Json | null): PostFaqItem[] | null {
  if (!raw || !Array.isArray(raw)) return null;
  const out: PostFaqItem[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const rec = item as Record<string, unknown>;
    if (typeof rec.question !== 'string' || typeof rec.answer !== 'string') continue;
    out.push({ question: rec.question, answer: rec.answer });
  }
  return out.length > 0 ? out : null;
}
