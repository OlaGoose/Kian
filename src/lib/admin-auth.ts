export const SESSION_COOKIE_NAME = 'admin_session';

export const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? 'admin';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin2026';

export function getSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? 'admin_dev_secret_change_in_prod';
}

export async function getAdminSession(): Promise<boolean> {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return session === getSessionSecret();
}
