import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

const AUDIO_BUCKET = 'feedback-audio';
const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

async function tryUploadAudio(audioFile: File): Promise<string | null> {
  try {
    const supabase = createServiceClient();
    const ext = audioFile.name.split('.').pop() ?? 'webm';
    const filename = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const arrayBuffer = await audioFile.arrayBuffer();

    const { error } = await supabase.storage
      .from(AUDIO_BUCKET)
      .upload(filename, arrayBuffer, {
        contentType: audioFile.type || 'audio/webm',
        upsert: false,
      });

    if (error) {
      console.error('[feedback] audio upload error:', error.message);
      return null;
    }

    const { data } = supabase.storage.from(AUDIO_BUCKET).getPublicUrl(filename);
    return data?.publicUrl ?? null;
  } catch (err) {
    console.error('[feedback] upload threw:', err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') ?? '';

  if (contentType.includes('multipart/form-data')) {
    try {
      const formData = await req.formData();
      const audioFile = formData.get('audio') as File | null;
      const page_path = (formData.get('page_path') as string | null) ?? null;

      if (!audioFile || audioFile.size === 0) {
        return Response.json({ error: 'Audio file is required' }, { status: 400 });
      }
      if (audioFile.size > MAX_AUDIO_BYTES) {
        return Response.json({ error: 'Audio file too large (max 10 MB)' }, { status: 400 });
      }

      const audio_url = await tryUploadAudio(audioFile);

      const supabase = await createClient();

      const { error } = await supabase
        .from('feedback')
        .insert([{ content: null, type: 'voice' as const, page_path, audio_url }]);

      if (error) {
        if (error.message?.includes('audio_url')) {
          const { error: retryError } = await supabase
            .from('feedback')
            .insert([{ content: null, type: 'voice' as const, page_path }]);
          if (retryError) {
            console.error('[feedback] retry insert error:', retryError.message);
            return Response.json({ error: 'Failed to save feedback' }, { status: 500 });
          }
          console.warn('[feedback] audio_url column missing — saved without URL. Run migration: supabase/migrations/20260407_feedback_audio.sql');
        } else {
          console.error('[feedback] insert error:', error.message);
          return Response.json({ error: 'Failed to save feedback' }, { status: 500 });
        }
      }

      return Response.json({ success: true, audio_url }, { status: 201 });
    } catch (err) {
      console.error('[feedback] multipart handler threw:', err);
      return Response.json({ error: 'Failed to process audio' }, { status: 500 });
    }
  }

  try {
    const body = await req.json();
    const { content, type = 'text', page_path } = body;

    if (typeof content !== 'string' || content.trim().length === 0) {
      return Response.json({ error: 'Content is required' }, { status: 400 });
    }
    if (content.length > 5000) {
      return Response.json({ error: 'Content too long' }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.from('feedback').insert([
      {
        content: content.trim(),
        type: (type === 'voice' ? 'voice' : 'text') as 'text' | 'voice',
        page_path: page_path ?? null,
      },
    ]);

    if (error) {
      console.error('[feedback] text insert error:', error.message);
      return Response.json({ error: 'Failed to save feedback' }, { status: 500 });
    }

    return Response.json({ success: true }, { status: 201 });
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}
