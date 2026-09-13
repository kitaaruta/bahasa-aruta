import { NextRequest, NextResponse } from 'next/server';
import {
  verifySession,
  signSession,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
} from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, message: 'Sesi autentikasi tidak ditemukan. Silakan masuk kembali.' },
        { status: 401 }
      );
    }

    const sessionUser = await verifySession(sessionCookie);
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, message: 'Sesi tidak valid atau telah berakhir.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { origin, honorificTitle, bio, roleChoice } = body;

    if (!origin || !origin.trim()) {
      return NextResponse.json(
        { success: false, message: 'Wilayah/Desa asal penutur wajib dipilih untuk verifikasi dialek leksikon.' },
        { status: 400 }
      );
    }

    // Update profil sesi
    sessionUser.origin = origin.trim();
    if (honorificTitle !== undefined) sessionUser.honorificTitle = honorificTitle.trim();
    if (bio !== undefined) sessionUser.bio = bio.trim();
    sessionUser.isOnboarded = true;

    // Jika pengguna mengajukan role spesifik saat onboarding
    if (roleChoice === 'verifier' && !sessionUser.roles.includes('admin') && !sessionUser.roles.includes('superadmin')) {
      if (!sessionUser.roles.includes('verifier')) {
        sessionUser.roles.push('verifier');
      }
      sessionUser.badge = 'Calon Verifikator / Tetua Adat';
    }

    // Tanda tangani ulang session token
    const newSessionToken = await signSession(sessionUser);

    const initials = (sessionUser.name || 'Aruta User')
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const response = NextResponse.json({
      success: true,
      message: 'Profil kontributor berhasil diperbarui.',
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
        isOnboarded: true,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: newSessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });

    return response;
  } catch (error: any) {
    console.error('Error during onboarding update:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menyimpan data onboarding.' },
      { status: 500 }
    );
  }
}
