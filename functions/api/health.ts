import { Env, PagesFunction, jsonResponse } from '../_types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const isKvBound = Boolean(context.env && context.env.Bahasa_KV);

  return jsonResponse({
    status: 'ok',
    kvConnected: isKvBound,
    bindingName: 'Bahasa_KV',
    expectedNamespaceId: 'eddaaf1689e54ba0a11941ca0d5a1191',
    message: isKvBound
      ? 'Bahasa_KV namespace berhasil terhubung!'
      : 'Bahasa_KV belum terikat pada environment Cloudflare. Pastikan binding Bahasa_KV diatur di Cloudflare Pages Dashboard.',
    timestamp: new Date().toISOString(),
  });
};

export const onRequestOptions: PagesFunction = async () => {
  return jsonResponse({ ok: true });
};
