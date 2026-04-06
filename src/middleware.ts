import createIntlMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { routing } from '@/i18n/routing';
import { SESSION_COOKIE_NAME, getSessionSecret } from '@/lib/admin-auth';

const intlMiddleware = createIntlMiddleware(routing);

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin')) {
    const session = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const isAuthed = session === getSessionSecret();

    if (pathname === '/admin' || pathname === '/admin/') {
      if (isAuthed) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      }
      return NextResponse.next();
    }

    if (!isAuthed) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }

    return NextResponse.next();
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/admin/:path*'],
};
