import { Env, PagesFunction, jsonResponse } from '../../_types';

function generateRandomState(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const state = generateRandomState();

    const baseUrl = (env.ARUTA_SSO_BASE_URL || env.NEXT_PUBLIC_ARUTA_SSO_BASE_URL || 'https://accounts.aruta.id').replace(/\/+$/, '');
    const clientId = env.ARUTA_CLIENT_ID || env.NEXT_PUBLIC_ARUTA_CLIENT_ID || 'aruta_app_ue8mu3';

    let redirectUri = 'https://bahasa.aruta.id/auth/callback';
    if (env.NEXT_PUBLIC_APP_URL) {
      redirectUri = `${env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, '')}/auth/callback`;
    } else {
      const url = new URL(request.url);
      redirectUri = `${url.origin}/auth/callback`;
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid profile email',
      state: state,
    });

    const authUrl = `${baseUrl}/oauth/authorize?${params.toString()}`;

    const headers = new Headers({
      'Content-Type': 'application/json',
      'Set-Cookie': `aruta_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=900; Secure`,
    });

    return new Response(JSON.stringify({ success: true, authUrl, state }), {
      status: 200,
      headers,
    });
  } catch (err: any) {
    return jsonResponse({ success: false, message: err.message }, 500);
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return jsonResponse({ ok: true });
};
