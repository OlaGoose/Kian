-- ============================================================
-- FULL SETUP: Schema + Seed Data
-- Run this once against your Supabase project via the SQL editor
-- or: psql $DATABASE_URL -f supabase/setup.sql
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- POSTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.posts (
  id                   UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title_en             TEXT        NOT NULL,
  title_zh             TEXT,
  slug                 TEXT        NOT NULL UNIQUE,
  content_en           TEXT,
  content_zh           TEXT,
  excerpt_en           TEXT,
  excerpt_zh           TEXT,
  published            BOOLEAN     NOT NULL DEFAULT false,
  published_at         TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  tags                 TEXT[]      NOT NULL DEFAULT '{}',
  cover_image          TEXT,
  reading_time_minutes INTEGER     NOT NULL DEFAULT 5
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS posts_updated_at ON public.posts;
CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS posts_slug_idx         ON public.posts (slug);
CREATE INDEX IF NOT EXISTS posts_published_at_idx ON public.posts (published_at DESC) WHERE published = true;
CREATE INDEX IF NOT EXISTS posts_tags_idx         ON public.posts USING GIN (tags);

-- ============================================================
-- PROJECTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name            TEXT        NOT NULL,
  slug            TEXT        NOT NULL UNIQUE,
  description_en  TEXT,
  description_zh  TEXT,
  url             TEXT,
  github_url      TEXT,
  tech            TEXT[]      NOT NULL DEFAULT '{}',
  status          TEXT        NOT NULL DEFAULT 'live' CHECK (status IN ('live', 'archived', 'wip')),
  featured        BOOLEAN     NOT NULL DEFAULT false,
  display_order   INTEGER     NOT NULL DEFAULT 0,
  cover_image     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS projects_featured_order_idx ON public.projects (featured DESC, display_order ASC);

-- ============================================================
-- FEEDBACK TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.feedback (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  content     TEXT,
  type        TEXT        NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'voice')),
  page_path   TEXT,
  audio_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Storage bucket for voice feedback audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('feedback-audio', 'feedback-audio', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can upload feedback audio" ON storage.objects;
CREATE POLICY "Public can upload feedback audio"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'feedback-audio');

DROP POLICY IF EXISTS "Public can read feedback audio" ON storage.objects;
CREATE POLICY "Public can read feedback audio"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'feedback-audio');

-- ============================================================
-- BOOKINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT        NOT NULL,
  email        TEXT        NOT NULL,
  message      TEXT        NOT NULL,
  meeting_type TEXT        NOT NULL DEFAULT 'online' CHECK (meeting_type IN ('online', 'inperson')),
  date         DATE        NOT NULL,
  time         TEXT        NOT NULL,
  status       TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  admin_note   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bookings_date_time_idx ON public.bookings (date, time);
CREATE INDEX IF NOT EXISTS bookings_status_idx    ON public.bookings (status);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.posts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published posts" ON public.posts;
CREATE POLICY "Public can read published posts"
  ON public.posts FOR SELECT
  USING (published = true);

DROP POLICY IF EXISTS "Public can read all projects" ON public.projects;
CREATE POLICY "Public can read all projects"
  ON public.projects FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedback;
CREATE POLICY "Anyone can submit feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read feedback" ON public.feedback;
CREATE POLICY "Anyone can read feedback"
  ON public.feedback FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anyone can submit bookings" ON public.bookings;
CREATE POLICY "Anyone can submit bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can read booking slots" ON public.bookings;
CREATE POLICY "Anyone can read booking slots"
  ON public.bookings FOR SELECT
  USING (true);

-- Admin routes use the service_role key which bypasses RLS entirely.
-- This UPDATE policy is kept as a fallback but is not required when service_role is used.
DROP POLICY IF EXISTS "Service role can update bookings" ON public.bookings;
CREATE POLICY "Service role can update bookings"
  ON public.bookings FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- SEED DATA
-- ============================================================
INSERT INTO public.posts (
  title_en, title_zh, slug,
  content_en, content_zh,
  excerpt_en, excerpt_zh,
  published, published_at, tags, reading_time_minutes
) VALUES
(
  'How Does Image Compression Work?',
  '图像压缩是如何工作的？',
  'how-image-compression-works',
  E'# Image Compression\n\nImage compression reduces file size while preserving visual quality.\n\n## Lossy vs Lossless\n\n**Lossless** compression (PNG, WebP lossless) preserves every pixel exactly. Files are smaller, but there''s a limit to how small they can get.\n\n**Lossy** compression (JPEG, WebP, AVIF) discards information that humans are unlikely to notice. This allows much smaller files.\n\n## How JPEG Works\n\n1. Convert RGB to YCbCr color space\n2. Downsample chroma channels (humans are less sensitive to color than luminance)\n3. Apply Discrete Cosine Transform (DCT) to 8×8 pixel blocks\n4. Quantize the coefficients\n5. Entropy encode the result\n\n## Modern Formats\n\nAVIF and WebP offer significantly better compression than JPEG at equivalent quality.',
  E'# 图像压缩\n\n图像压缩在保持视觉质量的同时减小文件大小。\n\n## 有损与无损\n\n**无损**压缩（PNG、WebP 无损）完整保留每个像素。文件更小，但有压缩极限。\n\n**有损**压缩（JPEG、WebP、AVIF）丢弃人类不太可能注意到的信息，从而实现更小的文件。\n\n## JPEG 的工作原理\n\n1. 将 RGB 转换为 YCbCr 色彩空间\n2. 对色度通道进行降采样（人眼对颜色比亮度更不敏感）\n3. 对 8×8 像素块应用离散余弦变换（DCT）\n4. 对系数进行量化\n5. 对结果进行熵编码\n\n## 现代格式\n\nAVIF 和 WebP 在同等质量下比 JPEG 提供更好的压缩率。',
  'A deep dive into how image compression algorithms work under the hood.',
  '深入探讨图像压缩算法的底层原理。',
  true, now() - interval '15 days', ARRAY['technology', 'explainer'], 6
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.projects (
  name, slug,
  description_en, description_zh,
  url, github_url,
  tech, status, featured, display_order
) VALUES
(
  'Your Product Name',
  'your-product',
  'A brief description of your main product. What problem does it solve? Who is it for?',
  '你的主要产品描述。它解决什么问题？目标用户是谁？',
  'https://yourproduct.com',
  NULL,
  ARRAY['Next.js', 'TypeScript', 'Supabase'],
  'live', true, 1
),
(
  'Another Project',
  'another-project',
  'Another thing you built. Keep it concise.',
  '另一个你构建的项目，简洁描述即可。',
  'https://anotherproject.com',
  'https://github.com/yourusername/another-project',
  ARRAY['React', 'Node.js'],
  'live', false, 2
),
(
  'Ozon category directory',
  'ozon-catalog',
  'Browse Ozon''s official category tree with search, deep links to marketplaces (Ozon, Wildberries, Yandex Wordstat, Google, TikTok, VK, 1688, and more), and one-tap copy for Russian and English keywords.',
  '浏览 Ozon 官方商品分类树：支持中英俄搜索、多平台深度链接（Ozon、Wildberries、Yandex Wordstat、Google、TikTok、VK、1688 等）以及俄文/英文关键词一键复制。',
  '/projects/ozon-catalog',
  NULL,
  ARRAY['Next.js', 'TypeScript'],
  'live', false, 3
)
ON CONFLICT (slug) DO NOTHING;
