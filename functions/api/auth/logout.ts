import { Env, PagesFunction, jsonResponse } from '../../_types';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { env } = context;

    // Optional token revocation di Aruta SSO
    // Bersihkan cookie sesi
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Set-Cookie': 'aruta_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure',
    });

    return new Response(JSON.stringify({ success: true, message: 'Sesi berhasil diakhiri.' }), {
      status: 200,
      headers,
    });
  } catch (err: any) {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Set-Cookie': 'aruta_session=; Path=/; HttpOnly; Max-Age=0',
    });
    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return jsonResponse({ ok: true });
};
