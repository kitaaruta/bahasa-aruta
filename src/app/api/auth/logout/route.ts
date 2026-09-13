import { NextRequest, NextResponse } from 'next/server';
import { verifySession, SESSION_COOKIE_NAME } from '@/lib/auth/session';
import { ArutaSsoService } from '@/lib/auth/sso-service';

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (sessionCookie) {
      const sessionUser = await verifySession(sessionCookie);
      if (sessionUser?.accessToken) {
        // Panggil endpoint revocaton di Aruta SSO (non-blocking jika ada gangguan jaringan)
        await ArutaSsoService.revokeToken(sessionUser.accessToken);
      }
    }

    const response = NextResponse.json({
      success: true,
      message: 'Sesi berhasil diakhiri dan token telah dicabut.',
    });

    // Bersihkan cookie sesi
    response.cookies.delete(SESSION_COOKIE_NAME);

    return response;
  } catch (error: any) {
    console.error('Error logging out:', error);
    const response = NextResponse.json(
      { success: true, message: 'Sesi lokal dibersihkan.' },
      { status: 200 }
    );
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }
}
