import { Env, PagesFunction, jsonResponse } from '../_types';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const kv = context.env?.Bahasa_KV;
    if (!kv) {
      return jsonResponse({
        success: false,
        error: 'Bahasa_KV namespace tidak ditemukan pada binding Cloudflare',
        data: []
      }, 503);
    }

    const data = await kv.get('arut_words', 'json');
    return jsonResponse({
      success: true,
      data: data || [],
    });
  } catch (err: any) {
    return jsonResponse({
      success: false,
      error: err.message || 'Gagal membaca kosakata dari Bahasa_KV',
    }, 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const kv = context.env?.Bahasa_KV;
    if (!kv) {
      return jsonResponse({
        success: false,
        error: 'Bahasa_KV namespace tidak ditemukan pada binding Cloudflare'
      }, 503);
    }

    const body = await context.request.json() as any;
    if (!body || !body.words) {
      return jsonResponse({ success: false, error: 'Payload harus memiliki field "words"' }, 400);
    }

    await kv.put('arut_words', JSON.stringify(body.words));

    return jsonResponse({
      success: true,
      message: 'Kosakata berhasil diperbarui di Bahasa_KV',
      count: body.words.length,
    });
  } catch (err: any) {
    return jsonResponse({
      success: false,
      error: err.message || 'Gagal menyimpan kosakata ke Bahasa_KV',
    }, 500);
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return jsonResponse({ ok: true });
};
