import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!start || !end) {
      return Response.json({ error: 'start and end params required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('bookings')
      .select('date, time')
      .gte('date', start)
      .lte('date', end)
      .in('status', ['pending', 'confirmed']);

    if (error) {
      console.error('Available slots fetch error:', error);
      return Response.json({ error: 'Failed to fetch availability' }, { status: 500 });
    }

    return Response.json({ booked: data ?? [] });
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}
