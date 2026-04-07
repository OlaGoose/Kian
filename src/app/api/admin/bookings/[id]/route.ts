import { NextRequest } from 'next/server';
import { createServiceClient, MissingServiceRoleKeyError } from '@/lib/supabase/service';
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

    const supabase = createServiceClient();
    const { error } = await supabase
      .from('bookings')
      .update({ status, admin_note: admin_note ?? null })
      .eq('id', id);

    if (error) {
      console.error('Booking update error:', error);
      return Response.json({ error: 'Failed to update booking' }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (e) {
    if (e instanceof MissingServiceRoleKeyError) {
      return Response.json({ error: e.message }, { status: 503 });
    }
    console.error('[admin/bookings/patch]', e);
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}
