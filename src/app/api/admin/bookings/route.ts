import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminSession } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const authed = await getAdminSession();
  if (!authed) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = req.nextUrl;
    const status = searchParams.get('status');

    const supabase = await createClient();
    let query = supabase
      .from('bookings')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (status && ['pending', 'confirmed', 'rejected'].includes(status)) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Bookings fetch error:', error);
      return Response.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }

    return Response.json({ bookings: data ?? [] });
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}
