import { DictionaryWord } from '@/data/arutDictionary';
import { ModeratedWordEntry, ContributorUser } from '@/context/AuthContext';

export interface KvHealthStatus {
  status: string;
  kvConnected: boolean;
  bindingName: string;
  expectedNamespaceId: string;
  message: string;
}

export const kvService = {
  /**
   * Cek apakah Cloudflare Bahasa_KV terhubung
   */
  async checkHealth(): Promise<KvHealthStatus | null> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  /**
   * Ambil daftar kosakata yang tersimpan di Bahasa_KV
   */
  async getWords(): Promise<DictionaryWord[] | null> {
    try {
      const res = await fetch('/api/words');
      if (!res.ok) return null;
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  },

  /**
   * Simpan daftar kosakata ke Bahasa_KV
   */
  async saveWords(words: DictionaryWord[]): Promise<boolean> {
    try {
      const res = await fetch('/api/words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ words }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Ambil antrean moderasi dari Bahasa_KV
   */
  async getModerationQueue(): Promise<ModeratedWordEntry[] | null> {
    try {
      const res = await fetch('/api/moderation');
      if (!res.ok) return null;
      const json = await res.json();
      return json.success ? json.data : null;
    } catch {
      return null;
    }
  },

  /**
   * Simpan antrean moderasi utuh ke Bahasa_KV
   */
  async saveModerationQueue(queue: ModeratedWordEntry[]): Promise<boolean> {
    try {
      const res = await fetch('/api/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queue }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Mengajukan satu usulan kata baru ke antrean moderasi Bahasa_KV
   */
  async submitWord(word: Partial<ModeratedWordEntry>): Promise<boolean> {
    try {
      const res = await fetch('/api/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit', word }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Verifikasi kata (approve / reject / revision) di Bahasa_KV
   */
  async updateWordStatus(
    wordId: string,
    action: 'approve' | 'reject' | 'revision',
    notes?: string,
    verifiedBy?: string
  ): Promise<boolean> {
    try {
      const res = await fetch('/api/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, wordId, notes, verifiedBy }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};
