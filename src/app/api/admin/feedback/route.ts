import { createClient } from '@/lib/supabase/server';
import { getAdminSession } from '@/lib/admin-auth';

export async function GET() {
  const authed = await getAdminSession();
  if (!authed) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Feedback fetch error:', error);
      return Response.json({ error: 'Failed to fetch feedback' }, { status: 500 });
    }

    return Response.json({ feedback: data ?? [] });
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}
