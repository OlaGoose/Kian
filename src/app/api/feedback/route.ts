import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
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
        type: type === 'voice' ? 'voice' : 'text',
        page_path: page_path ?? null,
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
