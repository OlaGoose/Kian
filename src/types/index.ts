import type { Database } from '@/lib/supabase/database.types';

export type Post = Database['public']['Tables']['posts']['Row'];
export type Project = Database['public']['Tables']['projects']['Row'];
export type Feedback = Database['public']['Tables']['feedback']['Row'];

export type PostPreview = Pick<
  Post,
  | 'id'
  | 'slug'
  | 'title_en'
  | 'title_zh'
  | 'excerpt_en'
  | 'excerpt_zh'
  | 'published_at'
  | 'tags'
  | 'reading_time_minutes'
  | 'cover_image'
>;

export type Locale = 'en' | 'zh';

export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}
