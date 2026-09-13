import { NextRequest, NextResponse } from 'next/server';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    const sessionUser = await verifySession(sessionCookie);

    if (!sessionUser) {
      // Cookie tidak valid atau kedaluwarsa -> bersihkan cookie
      const response = NextResponse.json({ authenticated: false, user: null }, { status: 200 });
      response.cookies.delete(SESSION_COOKIE_NAME);
      return response;
    }

    const initials = (sessionUser.name || 'Aruta User')
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    return NextResponse.json({
      authenticated: true,
      user: {
        id: sessionUser.sub,
        name: sessionUser.name,
        username: sessionUser.username,
        email: sessionUser.email,
        picture: sessionUser.picture,
        avatar: sessionUser.picture || initials,
        roles: sessionUser.roles,
        primaryRole: sessionUser.primaryRole,
        badge: sessionUser.badge,
        origin: sessionUser.origin,
        honorificTitle: sessionUser.honorificTitle,
        bio: sessionUser.bio,
        status: sessionUser.status,
        isOnboarded: sessionUser.isOnboarded,
      },
    });
  } catch (error: any) {
    console.error('Error fetching auth session:', error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }
}
