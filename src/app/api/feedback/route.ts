import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

const AUDIO_BUCKET = 'feedback-audio';
const MAX_AUDIO_BYTES = 10 * 1024 * 1024; // 10 MB

async function uploadAudio(audioFile: File): Promise<string | null> {
  const supabase = createServiceClient();
  const ext = audioFile.name.split('.').pop() ?? 'webm';
  const filename = `${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const arrayBuffer = await audioFile.arrayBuffer();
  const { error } = await supabase.storage
    .from(AUDIO_BUCKET)
    .upload(filename, arrayBuffer, { contentType: audioFile.type || 'audio/webm', upsert: false });

  if (error) {
    console.error('Audio upload error:', error);
    return null;
  }

  const { data } = supabase.storage.from(AUDIO_BUCKET).getPublicUrl(filename);
  return data?.publicUrl ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') ?? '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const audioFile = formData.get('audio') as File | null;
      const page_path = (formData.get('page_path') as string | null) ?? null;

      if (!audioFile || audioFile.size === 0) {
        return Response.json({ error: 'Audio file is required' }, { status: 400 });
      }

      if (audioFile.size > MAX_AUDIO_BYTES) {
        return Response.json({ error: 'Audio file too large (max 10 MB)' }, { status: 400 });
      }

      const audio_url = await uploadAudio(audioFile);

      const supabase = await createClient();
      const { error } = await supabase.from('feedback').insert([
        {
          content: null,
          type: 'voice',
          page_path,
          audio_url,
        },
      ] as never);

      if (error) {
        console.error('Feedback insert error:', error);
        return Response.json({ error: 'Failed to save feedback' }, { status: 500 });
      }

      return Response.json({ success: true }, { status: 201 });
    }

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
        type: type === 'voice' ? 'voice' : 'text',
        page_path: page_path ?? null,
        audio_url: null,
      },
    ] as never);

    if (error) {
      console.error('Feedback insert error:', error);
      return Response.json({ error: 'Failed to save feedback' }, { status: 500 });
    }

    return Response.json({ success: true }, { status: 201 });
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}
