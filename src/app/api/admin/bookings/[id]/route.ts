import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminSession } from '@/lib/admin-auth';

type Props = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Props) {
  const authed = await getAdminSession();
  if (!authed) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { status, admin_note } = body;

    if (!['confirmed', 'rejected', 'pending'].includes(status)) {
      return Response.json({ error: 'Invalid status' }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('bookings')
      .update({ status, admin_note: admin_note ?? null } as never)
      .eq('id', id);

    if (error) {
      console.error('Booking update error:', error);
      return Response.json({ error: 'Failed to update booking' }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}
