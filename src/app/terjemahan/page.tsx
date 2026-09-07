'use client';

import React, { useState } from 'react';
import { TranslatorBox } from '@/components/TranslatorBox';
import { COMMON_PHRASES } from '@/data/arutDictionary';
import { useLanguage } from '@/context/LanguageContext';

export default function TerjemahanPage() {
  const { t, language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const categories = ['Semua', 'Sapaan', 'Sehari-hari', 'Pertanyaan', 'Keluarga', 'Alam'];

  const filteredPhrases = selectedCategory === 'Semua'
    ? COMMON_PHRASES
    : COMMON_PHRASES.filter(p => p.category === selectedCategory);

  return (
    <div className="container" style={{ paddingBottom: '60px' }}>
      {/* Page Header */}
      <div style={{ margin: '28px 0 20px' }}>
        <div className="hero-tag" style={{ marginBottom: '8px' }}>
          {language === 'en' ? 'Trilingual Translation System' : 'Sistem Terjemahan Tiga Bahasa'}
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          {t('trans.title')}
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '680px', marginTop: '4px' }}>
          {language === 'en'
            ? 'Translate instantly between Dayak Arut, Indonesian, and English. Backed by verified native elder lexicography, phonetic guides, and everyday idioms.'
            : 'Terjemahkan secara instan antara Dayak Arut, Bahasa Indonesia, dan Bahasa Inggris. Didukung leksikon terverifikasi tetua adat dan ungkapan percakapan sehari-hari.'}
        </p>
      </div>

      {/* Main Translator Box */}
      <TranslatorBox />

      {/* Everyday Common Phrases */}
      <div className="card-box" style={{ marginTop: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 750, color: 'var(--text-primary)' }}>
              {language === 'en' ? 'Common Dayak Arut Phrases & Dialogues' : 'Percakapan & Ungkapan Lazim Dayak Arut'}
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              {language === 'en'
                ? 'Standard expressions used by native speakers in daily social interactions and communal activities'
                : 'Daftar kalimat umum yang dituturkan masyarakat dalam kehidupan bersosialisasi dan gotong royong'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                style={{ padding: '3px 8px', fontSize: '0.775rem' }}
              >
                {cat === 'Semua' ? (language === 'en' ? 'All' : 'Semua') : cat}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
          {filteredPhrases.map((phrase) => (
            <div
              key={phrase.id}
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span className="badge" style={{ fontSize: '0.65rem' }}>{phrase.category}</span>
                  <button
                    type="button"
                    onClick={() => {
                      if ('speechSynthesis' in window) {
                        const u = new SpeechSynthesisUtterance(phrase.arut);
                        u.lang = 'id-ID';
                        window.speechSynthesis.speak(u);
                      }
                    }}
                    className="icon-btn"
                    title="Pronounce"
                    style={{ padding: '2px 4px' }}
                  >
                    🔊
                  </button>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {phrase.arut}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  🇮🇩 {phrase.indonesia}
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                  🇬🇧 <em>{phrase.english}</em>
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                {language === 'en' ? `Context: ${phrase.context}` : `Konteks: ${phrase.context}`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phonetic Pronunciation Guide */}
      <div className="card-box" style={{ marginTop: '20px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 750, color: 'var(--text-primary)', marginBottom: '10px' }}>
          💡 {language === 'en' ? 'Brief Dayak Arut Phonetic Guide' : 'Pedoman Ringkas Pelafalan Bunyi Dayak Arut'}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', fontSize: '0.825rem' }}>
          <div style={{ background: 'var(--bg-subtle)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Vowels [ e ] & [ é ]</strong>
            <p style={{ color: 'var(--text-secondary)', marginTop: '3px', lineHeight: 1.45 }}>
              {language === 'en'
                ? "Pronounced clearly like the 'e' in 'bed' or 'café' (e.g., ewen, lewu)."
                : "Diucapkan jelas mirip bunyi 'e' pada kata 'bebek' (contoh: ewen, lewu)."}
            </p>
          </div>
          <div style={{ background: 'var(--bg-subtle)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Glottal Final [ k ]</strong>
            <p style={{ color: 'var(--text-secondary)', marginTop: '3px', lineHeight: 1.45 }}>
              {language === 'en'
                ? "Final 'k' is an unreleased glottal stop without aspiration (e.g., bulik, tulak, manuk)."
                : "Huruf 'k' di akhir kata diartikulasikan rapat tanpa desah hembusan (contoh: bulik, tulak, manuk)."}
            </p>
          </div>
          <div style={{ background: 'var(--bg-subtle)', padding: '10px', borderRadius: 'var(--radius-sm)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Upstream Diphthongs</strong>
            <p style={{ color: 'var(--text-secondary)', marginTop: '3px', lineHeight: 1.45 }}>
              {language === 'en'
                ? "Upstream Arut and Tomun dialects feature melodic diphthongs like 'kulai' and 'apou'."
                : "Dialek Arut Hulu & Tomun memiliki ciri khas diftong melodi seperti 'kulai' dan 'apou'."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
