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

    const data = await kv.get('arut_moderation_queue', 'json');
    return jsonResponse({
      success: true,
      data: data || [],
    });
  } catch (err: any) {
    return jsonResponse({
      success: false,
      error: err.message || 'Gagal membaca antrean moderasi dari Bahasa_KV',
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
    if (!body) {
      return jsonResponse({ success: false, error: 'Payload tidak boleh kosong' }, 400);
    }

    // If whole queue is passed
    if (Array.isArray(body.queue)) {
      await kv.put('arut_moderation_queue', JSON.stringify(body.queue));
      return jsonResponse({
        success: true,
        message: 'Antrean moderasi berhasil diperbarui di Bahasa_KV',
      });
    }

    // If single submission is passed
    if (body.action === 'submit' && body.word) {
      const existingQueue: any[] = (await kv.get('arut_moderation_queue', 'json')) || [];
      const newEntry = {
        ...body.word,
        id: `mw-${Date.now()}`,
        status: 'pending',
        submittedAt: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        }),
      };
      existingQueue.unshift(newEntry);
      await kv.put('arut_moderation_queue', JSON.stringify(existingQueue));

      return jsonResponse({
        success: true,
        message: 'Usulan kata berhasil disimpan ke antrean Bahasa_KV',
        entry: newEntry,
      });
    }

    // If action is approve/reject/revision
    if (['approve', 'reject', 'revision'].includes(body.action) && body.wordId) {
      const existingQueue: any[] = (await kv.get('arut_moderation_queue', 'json')) || [];
      let updatedWord: any = null;

      const updatedQueue = existingQueue.map((item) => {
        if (item.id === body.wordId) {
          updatedWord = {
            ...item,
            status: body.action === 'approve' ? 'approved' : body.action === 'reject' ? 'rejected' : 'revision',
            verifiedBy: body.verifiedBy || '✓ Disetujui Verifikator',
            adminNotes: body.notes || item.adminNotes,
            verifiedAt: new Date().toLocaleDateString('id-ID'),
          };
          return updatedWord;
        }
        return item;
      });

      await kv.put('arut_moderation_queue', JSON.stringify(updatedQueue));

      // If approved, also append to approved words list in KV
      if (body.action === 'approve' && updatedWord) {
        const approvedWords: any[] = (await kv.get('arut_words', 'json')) || [];
        const isAlreadyAdded = approvedWords.some(w => w.id === updatedWord.id);
        if (!isAlreadyAdded) {
          approvedWords.unshift(updatedWord);
          await kv.put('arut_words', JSON.stringify(approvedWords));
        }
      }

      return jsonResponse({
        success: true,
        message: `Status kata ${body.wordId} berhasil diubah ke ${body.action} di Bahasa_KV`,
        word: updatedWord,
      });
    }

    return jsonResponse({ success: false, error: 'Aksi atau format tidak dikenali' }, 400);
  } catch (err: any) {
    return jsonResponse({
      success: false,
      error: err.message || 'Gagal memproses aksi moderasi di Bahasa_KV',
    }, 500);
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return jsonResponse({ ok: true });
};
