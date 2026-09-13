import { NextRequest, NextResponse } from 'next/server';
import { ArutaSsoService } from '@/lib/auth/sso-service';
import { generateRandomState, OAUTH_STATE_COOKIE_NAME } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const state = generateRandomState();
    const redirectUri = ArutaSsoService.getRedirectUri(request.url);
    const authUrl = ArutaSsoService.generateAuthorizationUrl(state, redirectUri);

    const response = NextResponse.json({
      success: true,
      authUrl,
      state,
    });

    // Simpan CSRF state di HttpOnly Cookie (berlaku 15 menit)
    response.cookies.set({
      name: OAUTH_STATE_COOKIE_NAME,
      value: state,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60, // 15 menit
    });

    return response;
  } catch (error: any) {
    console.error('Error generating authorization URL:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menghasilkan URL otorisasi SSO' },
      { status: 500 }
    );
  }
}
