import { Env, PagesFunction, jsonResponse } from '../../_types';

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function signSessionToken(payload: any, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret) as unknown as BufferSource,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const payloadString = JSON.stringify(payload);
  const encodedPayload = base64UrlEncode(enc.encode(payloadString));
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    enc.encode(encodedPayload) as unknown as BufferSource
  );
  const encodedSignature = base64UrlEncode(new Uint8Array(signature));

  return `${encodedPayload}.${encodedSignature}`;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const body = (await request.json()) as any;
    const { code, state } = body || {};

    if (!code) {
      return jsonResponse({ success: false, message: 'Authorization code wajib disertakan.' }, 400);
    }

    // Periksa cookie CSRF state
    const cookieHeader = request.headers.get('Cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map((c) => {
        const [k, ...v] = c.trim().split('=');
        return [k, v.join('=')];
      })
    );

    const storedState = cookies['aruta_oauth_state'];
    if (storedState && state && storedState !== state) {
      return jsonResponse(
        { success: false, message: 'Sesi otentikasi kedaluwarsa atau tidak sah (CSRF mismatch).' },
        403
      );
    }

    const baseUrl = (env.ARUTA_SSO_BASE_URL || 'https://accounts.aruta.id').replace(/\/+$/, '');
    const clientId = env.ARUTA_CLIENT_ID || 'aruta_app_ue8mu3';
    const clientSecret = env.ARUTA_CLIENT_SECRET || '';

    let redirectUri = 'https://bahasa.aruta.id/auth/callback';
    if (env.NEXT_PUBLIC_APP_URL) {
      redirectUri = `${env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, '')}/auth/callback`;
    } else {
      const url = new URL(request.url);
      redirectUri = `${url.origin}/auth/callback`;
    }

    // Tukar code ke access token
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const tokenRes = await fetch(`${baseUrl}/api/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: tokenParams.toString(),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      return jsonResponse({ success: false, message: `Gagal menukar token (${tokenRes.status}): ${err}` }, 400);
    }

    const tokenData = (await tokenRes.json()) as any;

    // Ambil userinfo
    const userRes = await fetch(`${baseUrl}/api/oauth/userinfo`, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/json',
      },
    });

    if (!userRes.ok) {
      return jsonResponse({ success: false, message: 'Gagal mengambil userinfo dari Aruta SSO.' }, 400);
    }

    const userInfo = (await userRes.json()) as any;

    if (userInfo.status !== 'active') {
      return jsonResponse(
        {
          success: false,
          message: 'Akun Anda sedang ditangguhkan oleh Administrator Aruta SSO.',
          isSuspended: true,
        },
        403
      );
    }

    const ssoRole = (userInfo.role || 'Member').toLowerCase();
    let roles: string[] = ['contributor'];
    let primaryRole = 'contributor';
    let badge = 'Kontributor Aruta';

    if (ssoRole === 'superadmin' || ssoRole === 'developer') {
      roles = ['superadmin', 'admin', 'verifier', 'contributor'];
      primaryRole = 'superadmin';
      badge = 'Superadmin Ekosistem Aruta';
    } else if (ssoRole === 'admin') {
      roles = ['admin', 'verifier', 'contributor'];
      primaryRole = 'admin';
      badge = 'Admin Aruta SSO';
    } else if (ssoRole === 'verifier') {
      roles = ['verifier', 'contributor'];
      primaryRole = 'verifier';
      badge = 'Verifikator / Tetua Adat';
    }

    const initials = (userInfo.name || 'Aruta User')
      .split(' ')
      .map((p: string) => p[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const sessionUser = {
      sub: userInfo.sub,
      name: userInfo.name,
      username: userInfo.username || userInfo.email.split('@')[0],
      email: userInfo.email,
      picture: userInfo.picture || userInfo.avatar || '',
      ssoRole: userInfo.role || 'Member',
      roles,
      primaryRole,
      status: userInfo.status,
      origin: '',
      honorificTitle: '',
      bio: '',
      badge,
      isOnboarded: false,
      accessToken: tokenData.access_token,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };

    const sessionSecret = env.SESSION_SECRET || env.ARUTA_CLIENT_SECRET || 'aruta_default_session_secret_change_in_prod';
    const sessionToken = await signSessionToken(sessionUser, sessionSecret);

    const headers = new Headers({
      'Content-Type': 'application/json',
      'Set-Cookie': `aruta_session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800; Secure`,
    });

    return new Response(
      JSON.stringify({
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
          status: sessionUser.status,
          isOnboarded: sessionUser.isOnboarded,
        },
        needsOnboarding: true,
      }),
      { status: 200, headers }
    );
  } catch (err: any) {
    return jsonResponse({ success: false, message: err.message }, 500);
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return jsonResponse({ ok: true });
};
