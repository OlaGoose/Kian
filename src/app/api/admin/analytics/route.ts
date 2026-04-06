import { type NextRequest } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { fetchGAReport } from '@/lib/ga-data';

export async function GET(req: NextRequest) {
  const isAdmin = await getAdminSession();
  if (!isAdmin) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const days = parseInt(req.nextUrl.searchParams.get('days') ?? '28', 10);
  const validDays = [7, 28, 90].includes(days) ? days : 28;

  try {
    const report = await fetchGAReport(validDays);
    return Response.json(report);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
