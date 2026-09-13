import { NextRequest, NextResponse } from 'next/server';
import { ArutaSsoService } from '@/lib/auth/sso-service';
import {
  signSession,
  ArutaSessionUser,
  SESSION_COOKIE_NAME,
  OAUTH_STATE_COOKIE_NAME,
  SESSION_MAX_AGE,
} from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, state } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, message: 'Authorization code wajib disertakan.' },
        { status: 400 }
      );
    }

    // 1. Validasi CSRF state parameter
    const storedState = request.cookies.get(OAUTH_STATE_COOKIE_NAME)?.value;
    if (storedState && state && storedState !== state) {
      return NextResponse.json(
        {
          success: false,
          message: 'Sesi otentikasi kedaluwarsa atau tidak sah (CSRF State Mismatch). Silakan ulangi proses masuk.',
        },
        { status: 403 }
      );
    }

    // 2. Pertukaran kode otorisasi ke access token di Aruta SSO
    const redirectUri = ArutaSsoService.getRedirectUri(request.url);
    const tokenData = await ArutaSsoService.exchangeCodeForToken(code, redirectUri);

    if (!tokenData.access_token) {
      throw new Error(tokenData.error_description || 'Access token tidak ditemukan dalam respons Aruta SSO.');
    }

    // 3. Mengambil profil pengguna dari endpoint Userinfo
    const userInfo = await ArutaSsoService.getUserProfile(tokenData.access_token);

    // 4. Validasi status keaktifan akun (WAJIB tolak jika bukan 'active')
    if (userInfo.status !== 'active') {
      return NextResponse.json(
        {
          success: false,
          message: 'Akun Anda sedang ditangguhkan oleh Administrator Aruta SSO. Silakan hubungi tim administrasi pusat di accounts.aruta.id.',
          isSuspended: true,
        },
        { status: 403 }
      );
    }

    // 5. Pemetaan peran Aruta SSO ke peran sistem Bahasa Aruta
    const roleMapping = ArutaSsoService.mapSsoRoleToAppRoles(userInfo.role);

    // Initial avatar initials if no picture
    const initials = (userInfo.name || 'Aruta User')
      .split(' ')
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    // 6. Buat objek sesi pengguna
    const sessionUser: ArutaSessionUser = {
      sub: userInfo.sub,
      name: userInfo.name,
      username: userInfo.username || userInfo.email.split('@')[0],
      email: userInfo.email,
      picture: userInfo.picture || userInfo.avatar || '',
      ssoRole: userInfo.role || 'Member',
      roles: roleMapping.roles,
      primaryRole: roleMapping.primaryRole,
      status: userInfo.status,
      company: userInfo.company,
      title: userInfo.title,
      origin: '', // Kosong = memerlukan onboarding untuk memilih desa asal penutur
      honorificTitle: '',
      bio: '',
      badge: roleMapping.badge,
      isOnboarded: false,
      accessToken: tokenData.access_token,
      expiresAt: Date.now() + (tokenData.expires_in ? tokenData.expires_in * 1000 : SESSION_MAX_AGE * 1000),
    };

    // 7. Tandatangani sesi dengan HMAC-SHA256
    const sessionToken = await signSession(sessionUser);

    const response = NextResponse.json({
      success: true,
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
      needsOnboarding: !sessionUser.isOnboarded,
    });

    // 8. Tanamkan HttpOnly Session Cookie yang aman
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });

    // Hapus cookie state CSRF yang sudah terpakai
    response.cookies.delete(OAUTH_STATE_COOKIE_NAME);

    return response;
  } catch (error: any) {
    console.error('Error exchanging OAuth code:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Terjadi kesalahan saat memproses otentikasi SSO.',
      },
      { status: 500 }
    );
  }
}
