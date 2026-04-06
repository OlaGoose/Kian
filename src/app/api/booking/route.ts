import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, message, meeting_type, date, time } = body;

    if (!name || !email || !message || !meeting_type || !date || !time) {
      return Response.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (!['online', 'inperson'].includes(meeting_type)) {
      return Response.json({ error: 'Invalid meeting type' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: existing } = await supabase
      .from('bookings')
      .select('id')
      .eq('date', date)
      .eq('time', time)
      .in('status', ['pending', 'confirmed'])
      .maybeSingle();

    if (existing) {
      return Response.json({ error: 'This slot is no longer available' }, { status: 409 });
    }

    const { error } = await supabase.from('bookings').insert([
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        message: message.trim(),
        meeting_type,
        date,
        time,
        status: 'pending',
      },
    ] as never);

    if (error) {
      console.error('Booking insert error:', error);
      return Response.json({ error: 'Failed to save booking' }, { status: 500 });
    }

    return Response.json({ success: true }, { status: 201 });
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}
