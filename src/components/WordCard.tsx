'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DictionaryWord } from '@/data/arutDictionary';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

interface WordCardProps {
  word: DictionaryWord;
}

export const WordCard: React.FC<WordCardProps> = ({ word }) => {
  const { isFavorite, toggleFavorite } = useAuth();
  const { language } = useLanguage();
  const favorited = isFavorite(word.id);

  // Detail Modal State (Titik Tiga)
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Native Speaker Audio Player State
  const [isPlayingNativeAudio, setIsPlayingNativeAudio] = useState(false);

  // Existing TTS Voice
  const speakWord = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word.wordArut);
      utterance.lang = 'id-ID';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Play Native Speaker Audio (if available)
  const playNativeSpeakerAudio = () => {
    if (!word.audioUrl) return;
    try {
      const audio = new Audio(word.audioUrl);
      setIsPlayingNativeAudio(true);
      audio.play().catch(() => setIsPlayingNativeAudio(false));
      audio.onended = () => setIsPlayingNativeAudio(false);
      audio.onerror = () => setIsPlayingNativeAudio(false);
    } catch {
      setIsPlayingNativeAudio(false);
    }
  };

  const handleCopyWordLink = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/kamus?q=${encodeURIComponent(word.wordArut)}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const verifierName = word.verifiedByName || word.verifiedBy;

  return (
    <div className="word-card" style={{ position: 'relative' }}>
      <div>
        <div className="word-header">
          <div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="badge">
                {word.category}
              </span>
              {word.usageField && (
                <span style={{ fontSize: '0.675rem', fontWeight: 600, padding: '2px 7px', borderRadius: '12px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
                  {word.usageField}
                </span>
              )}
            </div>
            <div className="word-title" style={{ marginTop: '6px' }}>{word.wordArut}</div>
          </div>

          {/* Action buttons: TTS, Favorite, and 3-Dots Detail */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {/* Native Speaker Voice Icon Button if present */}
            {word.audioUrl && (
              <button
                type="button"
                onClick={playNativeSpeakerAudio}
                title="Dengar Rekaman Suara Penutur Asli"
                className="icon-btn"
                style={{
                  padding: '4px 6px',
                  background: isPlayingNativeAudio ? '#10b981' : '#ecfdf5',
                  color: isPlayingNativeAudio ? '#ffffff' : '#059669',
                  border: '1px solid #a7f3d0',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px'
                }}
              >
                <span>{isPlayingNativeAudio ? '🔊' : '🎙️'}</span>
              </button>
            )}

            {/* TTS Voice button (biarkan tetap ada) */}
            <button
              type="button"
              onClick={speakWord}
              title="Pelafalan Otomatis (TTS)"
              className="icon-btn"
              style={{ padding: '4px' }}
            >
              🔊
            </button>

            {/* Favorite button */}
            <button
              type="button"
              onClick={() => toggleFavorite(word.id)}
              title={favorited ? 'Hapus dari Favorit' : 'Simpan ke Favorit'}
              className="icon-btn"
              style={{ padding: '4px', fontSize: '0.9rem' }}
            >
              {favorited ? '★' : '☆'}
            </button>

            {/* 3-DOTS DETAIL BUTTON */}
            <button
              type="button"
              onClick={() => setShowDetailModal(true)}
              title="Lihat Detail & Jejak Verifikasi Lengkap"
              className="icon-btn"
              style={{
                padding: '4px 7px',
                fontSize: '1.05rem',
                fontWeight: 800,
                color: '#475569',
                borderRadius: '6px',
                lineHeight: 1
              }}
            >
              ⋮
            </button>
          </div>
        </div>

        <div className="word-phonetic">/{word.phonetic}/</div>

        <div className="word-meaning-block">
          <div className="word-meaning-id">
            {word.wordId}
          </div>
          {word.wordEn && (
            <div className="word-meaning-en">
              {word.wordEn}
            </div>
          )}
        </div>

        <div className="word-desc">
          {language === 'en' ? (word.meaningEn || word.meaning) : word.meaning}
        </div>
      </div>

      <div>
        {word.exampleArut && (
          <div className="word-example">
            <div className="word-example-arut">"{word.exampleArut}"</div>
            <div className="word-example-id">{word.exampleId}</div>
            {word.exampleEn && (
              <div className="word-example-en"><em>En: {word.exampleEn}</em></div>
            )}
          </div>
        )}

        {/* Footer Ringkas */}
        <div className="word-footer" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px', paddingTop: '8px', borderTop: '1px solid var(--border-light, #f1f5f9)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', fontSize: '0.75rem', color: '#64748b' }}>
            <span>📍 {word.dialect || 'Arut Umum'}</span>
            
            {/* Native Speaker Voice indicator badge */}
            {word.audioUrl && (
              <span
                onClick={playNativeSpeakerAudio}
                style={{
                  cursor: 'pointer',
                  fontSize: '0.675rem',
                  fontWeight: 700,
                  color: '#059669',
                  background: '#ecfdf5',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  border: '1px solid #a7f3d0'
                }}
              >
                {isPlayingNativeAudio ? '🔊 Memutar Suara...' : '🎙️ Ada Suara Penutur'}
              </span>
            )}
          </div>

          {/* VERIFIER BADGE: DIBIKIN RINGKAS SESUAI PERMINTAAN USER */}
          {verifierName && (
            <div style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '4px 8px',
              borderRadius: '6px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              fontSize: '0.72rem',
              color: '#166534'
            }}>
              <span style={{ fontWeight: 650, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>🛡️</span>
                <span>Diverifikasi oleh: <strong>{verifierName}</strong></span>
              </span>
              
              <button
                type="button"
                onClick={() => setShowDetailModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0f766e',
                  fontSize: '0.675rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '0 2px',
                  textDecoration: 'underline'
                }}
              >
                Detail ➔
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL TITIK TIGA: DETAIL LENGKAP KOSAKATA & VERIFIKASI    */}
      {/* ========================================================= */}
      {showDetailModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
          onClick={() => setShowDetailModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              maxWidth: '520px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid #e2e8f0',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 850, color: '#0f172a', margin: 0 }}>
                    {word.wordArut}
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>/{word.phonetic}/</span>
                  <span className="badge">{word.category}</span>
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 650, color: 'var(--color-primary)', marginTop: '2px' }}>
                  = {word.wordId} {word.wordEn && word.wordEn !== word.wordId ? `• (${word.wordEn})` : ''}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* Makna & Contoh */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                Penjelasan Makna:
              </div>
              <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.55, margin: 0 }}>
                {word.meaning}
              </p>
              {word.exampleArut && (
                <div style={{ marginTop: '10px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #0d9488', fontSize: '0.825rem' }}>
                  <div style={{ fontStyle: 'italic', fontWeight: 650, color: '#0f172a' }}>"{word.exampleArut}"</div>
                  <div style={{ color: '#64748b', marginTop: '2px' }}>{word.exampleId}</div>
                </div>
              )}
            </div>

            {/* Suara Penutur Asli jika ada */}
            {word.audioUrl && (
              <div style={{ padding: '12px 14px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 750, color: '#065f46' }}>
                    🎙️ Rekaman Suara Penutur Asli
                  </div>
                  <div style={{ fontSize: '0.725rem', color: '#047857', marginTop: '1px' }}>
                    Penutur: {word.audioSpeaker || word.sourceSpeaker || 'Penutur Dayak Arut'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={playNativeSpeakerAudio}
                  style={{
                    background: isPlayingNativeAudio ? '#10b981' : '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 14px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>{isPlayingNativeAudio ? '🔊' : '▶'}</span>
                  <span>{isPlayingNativeAudio ? 'Putar...' : 'Putar Audio'}</span>
                </button>
              </div>
            )}

            {/* Detail Verifikasi Adat */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '14px', marginBottom: '14px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#166534', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🛡️</span>
                <span>Informasi Pengesahan & Verifikasi Adat</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px', fontSize: '0.8rem', color: '#14532d' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span>Verifikator:</span>
                  <Link
                    href={`/profil?name=${encodeURIComponent(word.verifiedByName || word.verifiedBy || 'Damang')}`}
                    style={{ fontWeight: 800, color: '#065f46', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <span>{word.verifiedByName || word.verifiedBy || 'Tim Adat Arut'}</span>
                    <span style={{ color: '#059669', fontSize: '0.75rem' }}>✓</span>
                    <span style={{ fontSize: '0.7rem', color: '#0d9488' }}>↗</span>
                  </Link>
                  {word.verifierRole && <span style={{ fontSize: '0.75rem', color: '#047857' }}>({word.verifierRole})</span>}
                </div>
                {word.verifiedAt && (
                  <div>
                    Waktu Verifikasi: <span>{word.verifiedAt}</span>
                  </div>
                )}
                {word.adminNotes && (
                  <div style={{ marginTop: '4px', padding: '6px 10px', background: '#ffffff', borderRadius: '6px', border: '1px solid #dcfce7', fontStyle: 'italic' }}>
                    💬 <strong>Catatan Kurasi:</strong> "{word.adminNotes}"
                  </div>
                )}
              </div>
            </div>

            {/* Detail Usulan & Wilayah */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px', fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
              <div>📍 <strong>Asal Dialek / Wilayah:</strong> {word.dialect || 'Arut Umum'}</div>
              {word.usageField && <div>🏷️ <strong>Ranah Penggunaan:</strong> {word.usageField}</div>}
              {word.sourceSpeaker && <div>🗣️ <strong>Narasumber Tutur:</strong> {word.sourceSpeaker}</div>}
              {word.submitterName && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span>✍️ <strong>Pengusul Kosakata:</strong></span>
                  <Link
                    href={`/profil?name=${encodeURIComponent(word.submitterName)}`}
                    style={{ color: '#0369a1', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                  >
                    <span>{word.submitterName}</span>
                    <span style={{ fontSize: '0.7rem' }}>↗</span>
                  </Link>
                </div>
              )}
              {word.culturalContext && <div>📜 <strong>Konteks Budaya:</strong> {word.culturalContext}</div>}
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
              <button
                type="button"
                onClick={handleCopyWordLink}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 650,
                  color: '#334155',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <span>{copiedLink ? '✓' : '🔗'}</span>
                <span>{copiedLink ? 'Tautan Disalin!' : 'Bagikan Kata'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                style={{
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '7px 18px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
