-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- POSTS TABLE
-- ============================================================
CREATE TABLE public.posts (
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

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Index for fast slug lookups and listing
CREATE INDEX posts_slug_idx         ON public.posts (slug);
CREATE INDEX posts_published_at_idx ON public.posts (published_at DESC) WHERE published = true;
CREATE INDEX posts_tags_idx         ON public.posts USING GIN (tags);

-- ============================================================
-- PROJECTS TABLE
-- ============================================================
CREATE TABLE public.projects (
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

CREATE INDEX projects_featured_order_idx ON public.projects (featured DESC, display_order ASC);

-- ============================================================
-- FEEDBACK TABLE
-- ============================================================
CREATE TABLE public.feedback (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  content     TEXT,
  type        TEXT        NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'voice')),
  page_path   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ROW LEVEL SECURITY (public read for posts/projects)
-- ============================================================
ALTER TABLE public.posts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback  ENABLE ROW LEVEL SECURITY;

-- Public can read published posts
CREATE POLICY "Public can read published posts"
  ON public.posts FOR SELECT
  USING (published = true);

-- Public can read all projects
CREATE POLICY "Public can read all projects"
  ON public.projects FOR SELECT
  USING (true);

-- Anyone can insert feedback (no auth required for submissions)
CREATE POLICY "Anyone can submit feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (true);
