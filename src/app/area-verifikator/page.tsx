'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth, getHighestRole, getRoleBorderColor } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function AreaVerifikatorPage() {
  const {
    user,
    isLoggedIn,
    hasRole,
    loginDemo,
    moderatedWords,
    approveWord,
    rejectWord,
    requestRevision
  } = useAuth();
  const { language } = useLanguage();

  const isVerifier = hasRole('verifier') || hasRole('admin') || hasRole('superadmin');
  const isAdmin = hasRole('admin') || hasRole('superadmin');

  const [activeTab, setActiveTab] = useState<'pending' | 'history' | 'guidelines'>('pending');

  // Search & Filter for History
  const [searchHistoryQuery, setSearchHistoryQuery] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'all' | 'approved' | 'rejected' | 'revision'>('all');

  // Toast notification
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Action modal for revision or rejection
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: 'revision' | 'rejection';
    wordId: string;
    wordName: string;
    noteText: string;
  }>({
    isOpen: false,
    type: 'revision',
    wordId: '',
    wordName: '',
    noteText: ''
  });

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  // Pending words queue
  const pendingWords = useMemo(() => {
    return moderatedWords.filter(w => w.status === 'pending');
  }, [moderatedWords]);

  // Verified words history
  const verifiedHistory = useMemo(() => {
    return moderatedWords.filter(w => {
      if (w.status === 'pending') return false;
      if (historyStatusFilter !== 'all' && w.status !== historyStatusFilter) return false;
      if (searchHistoryQuery.trim()) {
        const q = searchHistoryQuery.toLowerCase().trim();
        const matchArut = w.wordArut.toLowerCase().includes(q);
        const matchId = w.wordId.toLowerCase().includes(q);
        const matchEn = w.wordEn?.toLowerCase().includes(q);
        const matchNotes = w.adminNotes?.toLowerCase().includes(q);
        if (!matchArut && !matchId && !matchEn && !matchNotes) return false;
      }
      return true;
    });
  }, [moderatedWords, historyStatusFilter, searchHistoryQuery]);

  const handleActionNoteSubmit = () => {
    if (!actionModal.wordId) return;
    if (actionModal.type === 'revision') {
      requestRevision(actionModal.wordId, actionModal.noteText);
      triggerToast(`Catatan revisi dikirimkan untuk "${actionModal.wordName}"`);
    } else {
      rejectWord(actionModal.wordId, actionModal.noteText);
      triggerToast(`Kosakata "${actionModal.wordName}" ditolak dengan catatan.`);
    }
    setActionModal({ isOpen: false, type: 'revision', wordId: '', wordName: '', noteText: '' });
  };

  // Role Guard: Only Verifier, Admin, or Superadmin
  if (!isLoggedIn || !user || !isVerifier) {
    return (
      <div className="container" style={{ padding: '60px 16px', maxWidth: '560px' }}>
        <div className="card-box" style={{ textAlign: 'center', padding: '36px 20px', border: '1.5px solid #7C3AED' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📜 🔒</div>
          <div className="hero-tag" style={{ background: '#EDE9FE', color: '#5B21B6', marginBottom: '12px' }}>
            Akses Terbatas: Wewenang Verifikator Adat Diperlukan
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Area Verifikator Adat
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '22px' }}>
            {language === 'en'
              ? 'This workspace is restricted to certified language verifiers, elders, and linguists to assess incoming vocabulary submissions.'
              : 'Ruang kerja ini dikhususkan bagi Tetua Adat (Damang/Mantir) dan Verifikator Bahasa untuk menelaah kesahihan kosakata Dayak Arut.'}
          </p>

          <div style={{ background: 'var(--bg-subtle)', padding: '14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', textAlign: 'left' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              ⚡ Coba Masuk dengan Akun Verifikator Demo:
            </div>
            <button
              type="button"
              onClick={() => loginDemo('elder')}
              className="btn btn-primary btn-sm"
              style={{ width: '100%', justifyContent: 'space-between', background: '#7C3AED', borderColor: '#7C3AED' }}
            >
              <span>📜 Damang Adat Arut Utara</span>
              <span>Masuk Sebagai Verifikator →</span>
            </button>
          </div>

          <Link href="/area-kontributor" className="btn btn-outline" style={{ width: '100%' }}>
            Kembali ke Area Kontributor
          </Link>
        </div>
      </div>
    );
  }

  const highestRole = getHighestRole(user.roles);
  const highestRoleColor = getRoleBorderColor(highestRole);

  return (
    <div className="container" style={{ paddingBottom: '60px' }}>
      {showToast && (
        <div className="toast-notice">
          <span>✓</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Dashboard Verifikator */}
      <div style={{ margin: '24px 0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              border: `3px solid ${highestRoleColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              fontWeight: 800,
              background: '#F5F3FF',
              color: '#6D28D9',
              boxShadow: '0 0 0 2px rgba(124, 58, 237, 0.2), 0 4px 12px rgba(124, 58, 237, 0.2)',
              flexShrink: 0
            }}
          >
            {user.avatar}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.3rem' }}>📜</span>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {language === 'en' ? 'Customary Verifier Area' : 'Area Verifikator Adat'}
              </h1>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: '#EDE9FE',
                  color: '#5B21B6',
                  border: '1px solid #DDD6FE'
                }}
              >
                VERIFIKATOR ADAT
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {user.name} • Penelaahan Kesahihan Dialek, Ejaan Fonetik, dan Istilah Adat
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {isAdmin && (
            <Link href="/area-admin" className="btn btn-outline btn-sm" style={{ borderColor: '#0D9488', color: '#0F766E' }}>
              🛡️ Area Admin
            </Link>
          )}
          <Link href="/area-kontributor" className="btn btn-outline btn-sm">
            🌿 Area Kontributor
          </Link>
          <Link href="/kamus" className="btn btn-outline btn-sm">
            📖 Kamus Publik
          </Link>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="tab-bar-ergonomic" style={{ marginBottom: '22px' }}>
        <button
          type="button"
          className={`tab-btn-ergonomic ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          ⏳ {language === 'en' ? 'Incoming Submissions' : 'Antrean Usulan Masuk'}
          {pendingWords.length > 0 && (
            <span
              style={{
                marginLeft: '6px',
                background: '#DC2626',
                color: '#FFFFFF',
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '1px 6px',
                borderRadius: '10px'
              }}
            >
              {pendingWords.length}
            </span>
          )}
        </button>

        <button
          type="button"
          className={`tab-btn-ergonomic ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📜 {language === 'en' ? 'Decisions History' : 'Riwayat Keputusan Verifikasi'}
        </button>

        <button
          type="button"
          className={`tab-btn-ergonomic ${activeTab === 'guidelines' ? 'active' : ''}`}
          onClick={() => setActiveTab('guidelines')}
        >
          📖 {language === 'en' ? 'Customary Principles' : 'Pedoman Kesakralan & Dialek'}
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: ANTREAN USULAN MASUK                               */}
      {/* ======================================================== */}
      {activeTab === 'pending' && (
        <div className="card-box" style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1.5px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                ⏳ Usulan Kosakata Baru Butuh Telaah
              </h2>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                Periksa kesesuaian dialek dan ejaan. Anda berwenang menyetujui, meminta revisi, atau menolak usulan.
              </p>
            </div>

            <span className="badge" style={{ background: '#FEF3C7', color: '#92400E', fontWeight: 750 }}>
              {pendingWords.length} Usulan Menunggu Keputusan
            </span>
          </div>

          {pendingWords.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {pendingWords.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #7C3AED',
                    borderRadius: 'var(--radius-sm)',
                    padding: '18px',
                    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.08)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '1.3rem', color: 'var(--text-primary)' }}>{item.wordArut}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/{item.phonetic}/</span>
                        <span className="badge">{item.category}</span>
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 650, color: 'var(--text-primary)', marginTop: '2px' }}>
                        🇮🇩 {item.wordId} • 🇬🇧 <em>{item.wordEn}</em>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span className="badge" style={{ background: '#FEF3C7', color: '#92400E', fontWeight: 700 }}>
                        MENUNGGU VERIFIKASI
                      </span>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Diajukan oleh: <strong>{item.submitterName}</strong> • {item.submittedAt}
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '8px' }}>
                    <strong>Makna & Konteks Adat:</strong> {item.meaning}
                    {item.meaningEn && <span> • <em>En: {item.meaningEn}</em></span>}
                  </p>

                  {item.exampleArut && (
                    <div className="word-example" style={{ marginBottom: '10px' }}>
                      <div className="word-example-arut">"{item.exampleArut}"</div>
                      <div className="word-example-id">{item.exampleId}</div>
                    </div>
                  )}

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    📍 Ragam Dialek: <strong>{item.dialect}</strong>
                  </div>

                  {/* Verifier Decisions Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                      Keputusan Verifikator Adat:
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          approveWord(item.id);
                          triggerToast(`✓ Kosakata "${item.wordArut}" disahkan dan disetujui tayang di Kamus!`);
                        }}
                        className="btn btn-sm"
                        style={{ background: '#7C3AED', color: '#FFFFFF', fontWeight: 700 }}
                      >
                        ✓ Sahkan & Publikasikan
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActionModal({
                            isOpen: true,
                            type: 'revision',
                            wordId: item.id,
                            wordName: item.wordArut,
                            noteText: 'Mohon sesuaikan lafal fonetik atau sertakan contoh kalimat yang lebih lazim.'
                          });
                        }}
                        className="btn btn-outline btn-sm"
                        style={{ borderColor: '#D97706', color: '#B45309' }}
                      >
                        ✏️ Minta Revisi
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActionModal({
                            isOpen: true,
                            type: 'rejection',
                            wordId: item.id,
                            wordName: item.wordArut,
                            noteText: 'Istilah ini bukan kosakata Dayak Arut atau bertentangan dengan pakem adat.'
                          });
                        }}
                        className="btn btn-outline btn-sm"
                        style={{ borderColor: '#EF4444', color: '#DC2626' }}
                      >
                        ✕ Tolak
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎉</div>
              <p style={{ fontSize: '0.95rem', fontWeight: 650, color: 'var(--text-primary)' }}>
                Semua Usulan Kosakata Telah Selesai Ditelaah!
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Tidak ada entri baru yang menunggu keputusan verifikasi adat saat ini.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: RIWAYAT KEPUTUSAN VERIFIKASI                       */}
      {/* ======================================================== */}
      {activeTab === 'history' && (
        <div className="card-box" style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1.5px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                📜 Riwayat Keputusan Verifikasi Adat
              </h2>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                Rekam jejak seluruh telaah kosakata yang telah disahkan, diminta revisi, atau ditolak.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                type="button"
                className={`btn btn-sm ${historyStatusFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setHistoryStatusFilter('all')}
              >
                Semua
              </button>
              <button
                type="button"
                className={`btn btn-sm ${historyStatusFilter === 'approved' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setHistoryStatusFilter('approved')}
              >
                Disetujui
              </button>
              <button
                type="button"
                className={`btn btn-sm ${historyStatusFilter === 'revision' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setHistoryStatusFilter('revision')}
              >
                Revisi
              </button>
              <button
                type="button"
                className={`btn btn-sm ${historyStatusFilter === 'rejected' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setHistoryStatusFilter('rejected')}
              >
                Ditolak
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Cari dalam arsip verifikasi..."
              value={searchHistoryQuery}
              onChange={(e) => setSearchHistoryQuery(e.target.value)}
            />
          </div>

          {verifiedHistory.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {verifiedHistory.map((item) => {
                const isApp = item.status === 'approved';
                const isRej = item.status === 'rejected';

                return (
                  <div
                    key={item.id}
                    style={{
                      background: isApp ? '#F0FDF4' : isRej ? '#FEF2F2' : '#FFFBEB',
                      border: `1.5px solid ${isApp ? '#86EFAC' : isRej ? '#FECACA' : '#FDE68A'}`,
                      borderRadius: 'var(--radius-sm)',
                      padding: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{item.wordArut}</strong>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/{item.phonetic}/</span>
                          <span className="badge">{item.category}</span>
                        </div>
                        <div style={{ fontSize: '0.925rem', fontWeight: 650, color: 'var(--text-primary)', marginTop: '2px' }}>
                          🇮🇩 {item.wordId} • 🇬🇧 {item.wordEn}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span
                          className="badge"
                          style={{
                            background: isApp ? '#DCFCE7' : isRej ? '#FEE2E2' : '#FEF3C7',
                            color: isApp ? '#166534' : isRej ? '#991B1B' : '#92400E',
                            fontWeight: 750
                          }}
                        >
                          {isApp ? '✓ DISAHKAN' : isRej ? '✕ DITOLAK' : '✏️ PERLU REVISI'}
                        </span>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Pengusul: <strong>{item.submitterName}</strong>
                        </div>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '8px' }}>
                      {item.meaning}
                    </p>

                    {item.adminNotes && (
                      <div
                        style={{
                          background: 'rgba(255,255,255,0.7)',
                          borderLeft: `3px solid ${isApp ? '#166534' : isRej ? '#991B1B' : '#D97706'}`,
                          padding: '8px 12px',
                          borderRadius: '0 4px 4px 0',
                          fontSize: '0.8rem',
                          color: 'var(--text-primary)',
                          marginBottom: '8px'
                        }}
                      >
                        <strong>Catatan Verifikator:</strong> {item.adminNotes}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                      <span>Keputusan: <strong>{item.verifiedBy}</strong></span>
                      <span>Waktu: {item.verifiedAt || item.submittedAt}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
              Tidak ada data riwayat verifikasi yang sesuai kriteria filter.
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: PEDOMAN KESAKRALAN & DIALEK                        */}
      {/* ======================================================== */}
      {activeTab === 'guidelines' && (
        <div className="card-box" style={{ maxWidth: '960px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px' }}>
            📖 Pedoman Verifikasi Adat & Ortografi Dayak Arut
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 750, color: '#5B21B6', marginBottom: '6px' }}>
                1. Ragam Dialek Arut Hulu vs Arut Hilir
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Perhatikan perbedaan vokal dan konsonan sengau antara penutur hulu (seperti di Pangkut, Sukarame, Sambi) dengan penutur hilir (seperti di Mendawai dan Pandau). Kedua ragam dialek sama-sama otentik dan perlu dicantumkan ragam dialeknya pada setiap kata.
              </p>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 750, color: '#5B21B6', marginBottom: '6px' }}>
                2. Istilah Sakral (*Tata Pemali*)
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Kosakata yang berkaitan dengan nama-nama roh leluhur (*pali*), hewan tabu, atau upacara perladangan tertentu harus dipastikan penjelasannya menghormati pakem adat dan tidak menimbulkan salah tafsir bagi generasi muda.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {actionModal.isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            className="card-box"
            style={{
              width: '100%',
              maxWidth: '480px',
              background: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
            }}
          >
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              {actionModal.type === 'revision' ? '✏️ Minta Revisi Usulan Kosakata' : '✕ Tolak Usulan Kosakata'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Kosakata: <strong>"{actionModal.wordName}"</strong>
            </p>

            <div className="form-group">
              <label className="form-label">
                {actionModal.type === 'revision' ? 'Catatan Masukan Verifikator Adat:' : 'Alasan Penolakan Adat:'}
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                value={actionModal.noteText}
                onChange={(e) => setActionModal({ ...actionModal, noteText: e.target.value })}
                placeholder="Tuliskan alasan adat atau masukan perbaikan ejaan/contoh..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '14px' }}>
              <button
                type="button"
                onClick={() => setActionModal({ isOpen: false, type: 'revision', wordId: '', wordName: '', noteText: '' })}
                className="btn btn-outline btn-sm"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleActionNoteSubmit}
                className="btn btn-sm"
                style={{
                  background: actionModal.type === 'revision' ? '#D97706' : '#DC2626',
                  color: '#FFFFFF',
                  fontWeight: 750
                }}
              >
                {actionModal.type === 'revision' ? 'Kirim Catatan Revisi' : 'Konfirmasi Penolakan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
