import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rute yang membutuhkan otentikasi akun aktif
const PROTECTED_PREFIXES = [
  '/portal',
  '/area-kontributor',
  '/area-verifikator',
  '/area-admin',
  '/area-superadmin',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cek apakah rute saat ini termasuk yang diproteksi
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isProtected) {
    const sessionCookie = request.cookies.get('aruta_session');

    // Jika tidak ada cookie sesi, arahkan pengguna ke halaman masuk dengan callback URL
    if (!sessionCookie || !sessionCookie.value) {
      const loginUrl = new URL('/masuk', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
