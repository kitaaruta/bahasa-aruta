import { Env, PagesFunction, jsonResponse } from '../../_types';

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function verifySessionToken(token: string, secret: string): Promise<any | null> {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encodedPayload, encodedSignature] = parts;
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret) as unknown as BufferSource,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBytes = base64UrlDecode(encodedSignature);
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes as unknown as BufferSource,
      enc.encode(encodedPayload) as unknown as BufferSource
    );
    if (!isValid) return null;

    const payloadBytes = base64UrlDecode(encodedPayload);
    return JSON.parse(new TextDecoder().decode(payloadBytes));
  } catch {
    return null;
  }
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
    const cookieHeader = request.headers.get('Cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map((c) => {
        const [k, ...v] = c.trim().split('=');
        return [k, v.join('=')];
      })
    );

    const token = cookies['aruta_session'];
    if (!token) {
      return jsonResponse({ success: false, message: 'Sesi tidak ditemukan.' }, 401);
    }

    const secret = env.SESSION_SECRET || env.ARUTA_CLIENT_SECRET || 'aruta_default_session_secret_change_in_prod';
    const sessionUser = await verifySessionToken(token, secret);
    if (!sessionUser) {
      return jsonResponse({ success: false, message: 'Sesi tidak valid.' }, 401);
    }

    const body = (await request.json()) as any;
    const { origin, honorificTitle, bio, roleChoice } = body || {};

    if (!origin || !origin.trim()) {
      return jsonResponse({ success: false, message: 'Desa/Wilayah asal tutur wajib dipilih.' }, 400);
    }

    sessionUser.origin = origin.trim();
    if (honorificTitle !== undefined) sessionUser.honorificTitle = honorificTitle.trim();
    if (bio !== undefined) sessionUser.bio = bio.trim();
    sessionUser.isOnboarded = true;

    if (roleChoice === 'verifier' && !sessionUser.roles.includes('admin') && !sessionUser.roles.includes('superadmin')) {
      if (!sessionUser.roles.includes('verifier')) {
        sessionUser.roles.push('verifier');
      }
      sessionUser.badge = 'Calon Verifikator / Tetua Adat';
    }

    const newSessionToken = await signSessionToken(sessionUser, secret);

    const initials = (sessionUser.name || 'Aruta User')
      .split(' ')
      .map((p: string) => p[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const headers = new Headers({
      'Content-Type': 'application/json',
      'Set-Cookie': `aruta_session=${newSessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800; Secure`,
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
          honorificTitle: sessionUser.honorificTitle,
          bio: sessionUser.bio,
          status: sessionUser.status,
          isOnboarded: true,
        },
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
