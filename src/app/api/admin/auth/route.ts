import { NextRequest } from 'next/server';
import { ADMIN_USERNAME, ADMIN_PASSWORD, SESSION_COOKIE_NAME, getSessionSecret } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const response = Response.json({ success: true });
    response.headers.set(
      'Set-Cookie',
      `${SESSION_COOKIE_NAME}=${getSessionSecret()}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`
    );

    return response;
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
}
