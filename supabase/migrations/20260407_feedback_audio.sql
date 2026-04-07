-- Add audio_url column to feedback table
ALTER TABLE public.feedback
  ADD COLUMN IF NOT EXISTS audio_url TEXT;

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
