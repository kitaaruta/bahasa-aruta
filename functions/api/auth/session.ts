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
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes));

    if (payload.expiresAt && Date.now() > payload.expiresAt) return null;
    if (payload.status !== 'active') return null;

    return payload;
  } catch {
    return null;
  }
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
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
      return jsonResponse({ authenticated: false, user: null });
    }

    const secret = env.SESSION_SECRET || env.ARUTA_CLIENT_SECRET || 'aruta_default_session_secret_change_in_prod';
    const sessionUser = await verifySessionToken(token, secret);

    if (!sessionUser) {
      const headers = new Headers({
        'Content-Type': 'application/json',
        'Set-Cookie': 'aruta_session=; Path=/; HttpOnly; Max-Age=0',
      });
      return new Response(JSON.stringify({ authenticated: false, user: null }), {
        status: 200,
        headers,
      });
    }

    const initials = (sessionUser.name || 'Aruta User')
      .split(' ')
      .map((p: string) => p[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    return jsonResponse({
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
  } catch (err: any) {
    return jsonResponse({ authenticated: false, user: null });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return jsonResponse({ ok: true });
};
