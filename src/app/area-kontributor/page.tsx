'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth, UserRole, getHighestRole, getRoleBorderColor, ModeratedWordEntry } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { DictionaryWord } from '@/data/arutDictionary';

export default function AreaKontributorPage() {
  const {
    user,
    isLoggedIn,
    loginDemo,
    logout,
    hasRole,
    contributedWords,
    addWord,
    moderatedWords,
    approveWord,
    rejectWord,
    requestRevision,
    allUsers,
    updateUserRoles
  } = useAuth();
  const { language } = useLanguage();

  const isSuperadmin = hasRole('superadmin');
  const isAdmin = hasRole('admin') || isSuperadmin;
  const isVerifier = hasRole('verifier') || isAdmin;

  // Submenu Tabs:
  // 1. 'daftar' = Daftar Kosakata
  // 2. 'need_verify' = Butuh Verifikasi
  // 3. 'history_verify' = Riwayat Verifikasi
  // 4. 'pedoman' = Pedoman Adat
  const [activeTab, setActiveTab] = useState<'daftar' | 'need_verify' | 'history_verify' | 'pedoman'>('daftar');

  // Modal State for Tambah Kosakata
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [wordArut, setWordArut] = useState('');
  const [wordId, setWordId] = useState('');
  const [wordEn, setWordEn] = useState('');
  const [category, setCategory] = useState<DictionaryWord['category']>('Nomina');
  const [phonetic, setPhonetic] = useState('');
  const [meaning, setMeaning] = useState('');
  const [meaningEn, setMeaningEn] = useState('');
  const [exampleArut, setExampleArut] = useState('');
  const [exampleId, setExampleId] = useState('');
  const [exampleEn, setExampleEn] = useState('');
  const [dialect, setDialect] = useState('Pangkut, Arut Utara');

  // Toast notifications
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Action Note Modal (for Revision or Rejection)
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

  // Search & Filters in Daftar Kosakata
  const [searchDaftarQuery, setSearchDaftarQuery] = useState('');
  const [daftarCategoryFilter, setDaftarCategoryFilter] = useState('all');

  // Search & Filters in Riwayat Verifikasi
  const [searchHistoryQuery, setSearchHistoryQuery] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'all' | 'approved' | 'rejected' | 'revision'>('all');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3500);
  };

  // Pending words for Butuh Verifikasi tab
  const pendingWords = useMemo(() => {
    return moderatedWords.filter(w => w.status === 'pending');
  }, [moderatedWords]);

  // Processed words for Riwayat Verifikasi tab
  const historyVerifiedWords = useMemo(() => {
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

  // Words list for Daftar Kosakata tab
  const filteredDaftarWords = useMemo(() => {
    return contributedWords.filter(item => {
      if (searchDaftarQuery.trim()) {
        const q = searchDaftarQuery.toLowerCase().trim();
        const matchArut = item.wordArut.toLowerCase().includes(q);
        const matchId = item.wordId.toLowerCase().includes(q);
        const matchEn = item.wordEn?.toLowerCase().includes(q);
        if (!matchArut && !matchId && !matchEn) return false;
      }
      if (daftarCategoryFilter !== 'all' && item.category !== daftarCategoryFilter) {
        return false;
      }
      return true;
    });
  }, [contributedWords, searchDaftarQuery, daftarCategoryFilter]);

  // Handle Form Submission inside Modal
  const handleSubmitWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wordArut.trim() || !wordId.trim() || !meaning.trim()) {
      alert(language === 'en' ? 'Please fill in the Dayak Arut word, Indonesian meaning, and definition.' : 'Mohon lengkapi kata Arut, arti Indonesia, dan penjelasan makna.');
      return;
    }

    addWord({
      wordArut: wordArut.trim(),
      wordId: wordId.trim(),
      wordEn: wordEn.trim() || wordId.trim(),
      category,
      phonetic: phonetic.trim() || wordArut.toLowerCase().split('').join('-'),
      meaning: meaning.trim(),
      meaningEn: meaningEn.trim() || meaning.trim(),
      exampleArut: exampleArut.trim(),
      exampleId: exampleId.trim(),
      exampleEn: exampleEn.trim() || exampleId.trim(),
      dialect,
    });

    // Reset Form
    setWordArut('');
    setWordId('');
    setWordEn('');
    setPhonetic('');
    setMeaning('');
    setMeaningEn('');
    setExampleArut('');
    setExampleId('');
    setExampleEn('');

    setIsAddModalOpen(false);
    triggerToast(language === 'en' ? 'Word submitted to verification queue!' : 'Kosakata berhasil diajukan dan masuk ke antrean Butuh Verifikasi!');
  };

  // Handle Role Toggle (Superadmin)
  const handleRoleToggle = (targetUserId: string, currentRoles: UserRole[], toggledRole: UserRole) => {
    let newRoles: UserRole[];
    if (currentRoles.includes(toggledRole)) {
      if (currentRoles.length === 1) {
        alert('Setiap pengguna harus memiliki minimal 1 peran aktif.');
        return;
      }
      newRoles = currentRoles.filter(r => r !== toggledRole);
    } else {
      newRoles = [...currentRoles, toggledRole];
    }
    updateUserRoles(targetUserId, newRoles);
    triggerToast(language === 'en' ? 'User roles updated!' : 'Peran pengguna berhasil diperbarui!');
  };

  // Submit Revision / Rejection Note
  const handleActionNoteSubmit = () => {
    if (!actionModal.wordId) return;
    if (actionModal.type === 'revision') {
      requestRevision(actionModal.wordId, actionModal.noteText);
      triggerToast(`Permintaan revisi dikirimkan untuk "${actionModal.wordName}"`);
    } else {
      rejectWord(actionModal.wordId, actionModal.noteText);
      triggerToast(`Kosakata "${actionModal.wordName}" ditolak dengan catatan.`);
    }
    setActionModal({ isOpen: false, type: 'revision', wordId: '', wordName: '', noteText: '' });
  };

  const highestRole = user ? getHighestRole(user.roles) : 'contributor';
  const highestRoleColor = getRoleBorderColor(highestRole);

  if (!isLoggedIn || !user) {
    return (
      <div className="container" style={{ padding: '40px 16px 60px', maxWidth: '560px' }}>
        <div className="card-box" style={{ textAlign: 'center', padding: '36px 20px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔒</div>
          <div className="hero-tag" style={{ marginBottom: '10px' }}>
            {language === 'en' ? 'Contributor & Management Area' : 'Akses Area Kontributor & Pengelola'}
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
            {language === 'en' ? 'Basa Arut Workspace Console' : 'Pusat Kerja & Konsol Pelestari'}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '20px' }}>
            {language === 'en'
              ? 'Please sign in to access the vocabulary registry, verification queue, and editorial history.'
              : 'Silakan masuk untuk mengakses daftar kosakata, antrean butuh verifikasi, dan riwayat verifikasi platform.'}
          </p>

          <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '14px', marginBottom: '18px', textAlign: 'left' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              ⚡ Coba Langsung dengan Akun Demo:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
              <button
                type="button"
                onClick={() => loginDemo('superadmin')}
                className="btn btn-primary btn-sm"
                style={{ justifyContent: 'space-between' }}
              >
                <span>👑 TEN (Superadmin)</span>
                <span>Masuk →</span>
              </button>
              <button
                type="button"
                onClick={() => loginDemo('admin')}
                className="btn btn-outline btn-sm"
                style={{ justifyContent: 'space-between', borderColor: '#0D9488', color: '#0F766E' }}
              >
                <span>🛡️ Admin Platform</span>
                <span>Masuk →</span>
              </button>
            </div>
          </div>

          <Link href="/masuk" className="btn btn-outline" style={{ width: '100%' }}>
            {language === 'en' ? 'Register / Sign In' : 'Masuk / Daftar Akun'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: '60px' }}>
      {showSuccessToast && (
        <div className="toast-notice">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Profile Info Bar */}
      <div style={{ margin: '24px 0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Avatar with Highest Role Border */}
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              border: `3px solid ${highestRoleColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.15rem',
              fontWeight: 800,
              background: 'var(--bg-card)',
              color: highestRoleColor,
              boxShadow: `0 0 0 2px rgba(0,0,0,0.05), 0 3px 10px ${highestRoleColor}30`,
              flexShrink: 0
            }}
          >
            {user.avatar}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {user.name}
              </h1>
              {user.roles.map(r => (
                <span
                  key={r}
                  style={{
                    fontSize: '0.675rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: r === 'superadmin' ? '#FEF3C7' : r === 'admin' ? '#CCFBF1' : r === 'verifier' ? '#EDE9FE' : '#D1FAE5',
                    color: r === 'superadmin' ? '#92400E' : r === 'admin' ? '#115E59' : r === 'verifier' ? '#5B21B6' : '#065F46',
                    border: `1px solid ${getRoleBorderColor(r)}40`
                  }}
                >
                  {r.toUpperCase()}
                </span>
              ))}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              📍 {user.origin} • ID: {user.id}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link href="/akun" className="btn btn-outline btn-sm">
            👤 {language === 'en' ? 'My Account' : 'My Akun'}
          </Link>
          <Link href="/kamus" className="btn btn-outline btn-sm">
            📖 {language === 'en' ? 'Dictionary' : 'Kamus Publik'}
          </Link>
        </div>
      </div>

      {/* Shortcut banner for Verifier / Admin / Superadmin */}
      {(isVerifier || isAdmin || isSuperadmin) && (
        <div style={{ background: '#F0FDFA', border: '1.5px solid #99F6E4', borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 750, color: '#115E59' }}>
              🛡️ Akses Area Pengelolaan Khusus Aktif
            </div>
            <div style={{ fontSize: '0.775rem', color: '#0F766E', marginTop: '2px' }}>
              Akun Anda memiliki wewenang khusus untuk verifikasi adat, operasional admin, atau kendali superadmin.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {isVerifier && (
              <Link href="/area-verifikator" className="btn btn-sm" style={{ background: '#7C3AED', color: '#FFFFFF', fontWeight: 700 }}>
                📜 Area Verifikator →
              </Link>
            )}
            {isAdmin && (
              <Link href="/area-admin" className="btn btn-sm" style={{ background: '#0D9488', color: '#FFFFFF', fontWeight: 700 }}>
                🛡️ Area Admin →
              </Link>
            )}
            {isSuperadmin && (
              <Link href="/area-superadmin" className="btn btn-sm" style={{ background: '#1C1917', color: '#F59E0B', fontWeight: 700 }}>
                👑 Area Superadmin →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Submenu Ergonomic Tab Bar */}
      <div className="tab-bar-ergonomic" style={{ marginBottom: '22px' }}>
        {/* SUBMENU 1: DAFTAR KOSAKATA */}
        <button
          type="button"
          className={`tab-btn-ergonomic ${activeTab === 'daftar' ? 'active' : ''}`}
          onClick={() => setActiveTab('daftar')}
        >
          📚 {language === 'en' ? `Vocabulary Registry (${contributedWords.length})` : `Daftar Kosakata (${contributedWords.length})`}
        </button>

        {/* SUBMENU 2: BUTUH VERIFIKASI */}
        <button
          type="button"
          className={`tab-btn-ergonomic ${activeTab === 'need_verify' ? 'active' : ''}`}
          onClick={() => setActiveTab('need_verify')}
          style={{ position: 'relative' }}
        >
          ⏳ {language === 'en' ? 'Needs Verification' : 'Butuh Verifikasi'}
          {pendingWords.length > 0 && (
            <span
              style={{
                marginLeft: '6px',
                background: '#EF4444',
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

        {/* SUBMENU 3: RIWAYAT VERIFIKASI */}
        <button
          type="button"
          className={`tab-btn-ergonomic ${activeTab === 'history_verify' ? 'active' : ''}`}
          onClick={() => setActiveTab('history_verify')}
        >
          📜 {language === 'en' ? 'Verification History' : 'Riwayat Verifikasi'}
        </button>

        {/* SUBMENU 4: PEDOMAN ADAT */}
        <button
          type="button"
          className={`tab-btn-ergonomic ${activeTab === 'pedoman' ? 'active' : ''}`}
          onClick={() => setActiveTab('pedoman')}
        >
          📖 {language === 'en' ? 'Customary Guidelines' : 'Pedoman Adat'}
        </button>
      </div>

      {/* ======================================================== */}
      {/* SUBMENU 1: DAFTAR KOSAKATA                                */}
      {/* ======================================================== */}
      {activeTab === 'daftar' && (
        <div className="card-box" style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1.5px solid var(--border-color)', paddingBottom: '14px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                📚 {language === 'en' ? 'Vocabulary Registry' : 'Daftar Kosakata Platform'}
              </h2>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                {language === 'en'
                  ? 'Browse preserved vocabulary and propose new Dayak Arut terms via modal form'
                  : 'Kelola repositori kosakata Dayak Arut dan ajukan istilah baru melalui formulir modal'}
              </p>
            </div>

            {/* Prominent Action Button: Buka Modal Tambah Kosakata */}
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                fontWeight: 750,
                fontSize: '0.9rem',
                boxShadow: '0 3px 8px rgba(15, 118, 110, 0.25)'
              }}
            >
              <span>➕</span>
              <span>{language === 'en' ? 'Propose New Vocabulary' : 'Tambah / Ajukan Kosakata Baru'}</span>
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '18px' }}>
            <input
              type="text"
              className="form-input"
              placeholder={language === 'en' ? 'Search vocabulary (Arut, ID, EN)...' : 'Cari kosakata (Arut, ID, EN)...'}
              value={searchDaftarQuery}
              onChange={(e) => setSearchDaftarQuery(e.target.value)}
              style={{ flexGrow: 1, minWidth: '220px' }}
            />

            <select
              className="form-select"
              value={daftarCategoryFilter}
              onChange={(e) => setDaftarCategoryFilter(e.target.value)}
              style={{ width: 'auto', minWidth: '160px' }}
            >
              <option value="all">Semua Kategori</option>
              <option value="Nomina">Nomina (Benda)</option>
              <option value="Verba">Verba (Kerja)</option>
              <option value="Adjektiva">Adjektiva (Sifat)</option>
              <option value="Ungkapan Adat">Ungkapan Adat</option>
            </select>
          </div>

          {/* Vocabulary Cards List */}
          {filteredDaftarWords.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredDaftarWords.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '16px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>{item.wordArut}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/{item.phonetic}/</span>
                        <span className="badge">{item.category}</span>
                      </div>
                      <div style={{ fontSize: '0.925rem', fontWeight: 650, color: 'var(--text-primary)', marginTop: '3px' }}>
                        🇮🇩 {item.wordId} {item.wordEn && item.wordEn !== item.wordId ? `• 🇬🇧 ${item.wordEn}` : ''}
                      </div>
                    </div>

                    <span
                      className="badge"
                      style={{
                        background: item.verifiedBy?.includes('Disetujui') ? '#DCFCE7' : item.verifiedBy?.includes('Ditolak') ? '#FEE2E2' : '#FEF3C7',
                        color: item.verifiedBy?.includes('Disetujui') ? '#166534' : item.verifiedBy?.includes('Ditolak') ? '#991B1B' : '#92400E',
                        fontWeight: 700
                      }}
                    >
                      {item.verifiedBy || 'Dalam Proses'}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '8px' }}>
                    {language === 'en' && item.meaningEn ? item.meaningEn : item.meaning}
                  </p>

                  {item.exampleArut && (
                    <div className="word-example" style={{ marginBottom: '8px' }}>
                      <div className="word-example-arut">"{item.exampleArut}"</div>
                      <div className="word-example-id">{item.exampleId}</div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                    <span>📍 Dialek: {item.dialect}</span>
                    <span>Tercatat: {item.dateAdded || 'Baru saja'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '0.925rem', marginBottom: '10px' }}>
                {language === 'en' ? 'No vocabulary found matching filter.' : 'Belum ada kosakata yang cocok dengan pencarian.'}
              </p>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="btn btn-outline btn-sm"
              >
                ➕ {language === 'en' ? 'Propose First Word' : 'Ajukan Kata Sekarang'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBMENU 2: BUTUH VERIFIKASI                               */}
      {/* ======================================================== */}
      {activeTab === 'need_verify' && (
        <div className="card-box" style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1.5px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.25rem' }}>⏳</span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {language === 'en' ? 'Vocabulary Needing Verification' : 'Kosakata Butuh Verifikasi'}
                </h2>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                {language === 'en'
                  ? 'Review incoming vocabulary submissions: verify, request revisions, or reject inappropriate entries.'
                  : 'Tempat memverifikasi, meminta revisi, atau melakukan penolakan usulan kosakata baru dari para kontributor.'}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="badge" style={{ background: '#FEF3C7', color: '#92400E', fontWeight: 750 }}>
                {pendingWords.length} Usulan Belum Diverifikasi
              </span>
            </div>
          </div>

          {pendingWords.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {pendingWords.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #F59E0B',
                    borderRadius: 'var(--radius-sm)',
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.08)'
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
                        Pengusul: <strong>{item.submitterName}</strong> • {item.submittedAt}
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '8px' }}>
                    <strong>Makna:</strong> {item.meaning}
                    {item.meaningEn && <span> • <em>En: {item.meaningEn}</em></span>}
                  </p>

                  {item.exampleArut && (
                    <div className="word-example" style={{ marginBottom: '10px' }}>
                      <div className="word-example-arut">"{item.exampleArut}"</div>
                      <div className="word-example-id">{item.exampleId}</div>
                    </div>
                  )}

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    📍 Dialek: {item.dialect}
                  </div>

                  {/* Verification Actions Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                      Tindakan kurasi untuk akun berwenang (Admin/Verifikator/Superadmin):
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {/* Tombol Setujui */}
                      <button
                        type="button"
                        onClick={() => {
                          approveWord(item.id);
                          triggerToast(`✓ Kosakata "${item.wordArut}" berhasil diverifikasi dan disetujui!`);
                        }}
                        className="btn btn-sm"
                        style={{ background: '#0F766E', color: '#FFFFFF', fontWeight: 700 }}
                      >
                        ✓ Setujui & Publikasikan
                      </button>

                      {/* Tombol Minta Revisi */}
                      <button
                        type="button"
                        onClick={() => {
                          setActionModal({
                            isOpen: true,
                            type: 'revision',
                            wordId: item.id,
                            wordName: item.wordArut,
                            noteText: 'Mohon sertakan fonetik atau contoh kalimat dalam percakapan sehari-hari.'
                          });
                        }}
                        className="btn btn-outline btn-sm"
                        style={{ borderColor: '#D97706', color: '#B45309' }}
                      >
                        ✏️ Minta Revisi
                      </button>

                      {/* Tombol Tolak */}
                      <button
                        type="button"
                        onClick={() => {
                          setActionModal({
                            isOpen: true,
                            type: 'rejection',
                            wordId: item.id,
                            wordName: item.wordArut,
                            noteText: 'Kata ini bukan kosakata asli Dayak Arut atau bertentangan dengan kaidah adat.'
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
                {language === 'en' ? 'All words are verified!' : 'Semua Kosakata Baru Telah Diverifikasi!'}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Tidak ada entri yang tertunda di antrean Butuh Verifikasi saat ini.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBMENU 3: RIWAYAT VERIFIKASI                             */}
      {/* ======================================================== */}
      {activeTab === 'history_verify' && (
        <div className="card-box" style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1.5px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.25rem' }}>📜</span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {language === 'en' ? 'Verification History' : 'Riwayat Verifikasi Platform'}
                </h2>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                {language === 'en'
                  ? 'Archive of vocabulary decisions: approved into dictionary, requested for revision, or rejected.'
                  : 'Rekam jejak keputusan kosakata: yang telah disetujui masuk kamus, diminta perbaikan, maupun ditolak.'}
              </p>
            </div>

            {/* Filter Status Buttons */}
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

          {/* Search History */}
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Cari dalam riwayat verifikasi (kata, arti, atau catatan kurator)..."
              value={searchHistoryQuery}
              onChange={(e) => setSearchHistoryQuery(e.target.value)}
            />
          </div>

          {historyVerifiedWords.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {historyVerifiedWords.map((item) => {
                const isApp = item.status === 'approved';
                const isRej = item.status === 'rejected';
                const isRev = item.status === 'revision';

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
                          {isApp ? '✓ DISETUJUI' : isRej ? '✕ DITOLAK' : '✏️ PERLU REVISI'}
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
              Tidak ada data riwayat verifikasi yang sesuai dengan kriteria filter.
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* SUBMENU 4: PEDOMAN ADAT & DOKUMENTASI BAHASA              */}
      {/* ======================================================== */}
      {activeTab === 'pedoman' && (
        <div className="card-box" style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ borderBottom: '1.5px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.25rem' }}>📖</span>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {language === 'en' ? 'Customary Principles & Language Preservation Guide' : 'Pedoman Adat & Dokumentasi Bahasa Dayak Arut'}
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Panduan etika pencatatan kosakata, fonetik lisan, dan perlindungan istilah sakral (*tata pemali*) bagi para relawan pelestari.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: 'var(--bg-subtle)', padding: '18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 750, color: 'var(--text-primary)', marginBottom: '8px' }}>
                1. Otentisitas Penutur Asli (*Native Speaker Integrity*)
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Setiap kosakata yang diajukan diutamakan bersumber langsung dari percakapan lisan penutur di DAS Arut (Pangkut, Sukarame, Gandis, Pandau, Riam, hingga Mendawai). Catat konteks situasi tuturan (misal: saat berladang, memancing di riam, atau upacara ritual).
              </p>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: '18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 750, color: 'var(--text-primary)', marginBottom: '8px' }}>
                2. Hierarki Validasi & Perlindungan Istilah Sakral
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Kosakata yang berhubungan dengan mantra adat, pantang-larang (*pamali*), dan hukum adat Kedamangan Arut Utara wajib melalui persetujuan Verifikator Adat (*Damang/Mantir*) dan Admin sebelum ditampilkan secara luas ke publik.
              </p>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: '18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 750, color: 'var(--text-primary)', marginBottom: '8px' }}>
                3. Tingkatan Wewenang Platform
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Platform memisahkan wewenang ke dalam 3 ruang kerja: <strong>Area Kontributor</strong> (pengajuan & inventaris kata), <strong>Area Admin</strong> (moderasi kurasi & telaah kata), dan <strong>Area Superadmin</strong> (master penugasan peran & audit sistem).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: TAMBAH / AJUKAN KOSAKATA BARU                     */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            overflowY: 'auto'
          }}
        >
          <div
            className="card-box"
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              padding: '24px',
              animation: 'dropdownFade 0.2s ease-out'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid var(--border-color)', paddingBottom: '14px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>➕</span>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {language === 'en' ? 'Propose New Dayak Arut Vocabulary' : 'Ajukan Kosakata Dayak Arut Baru'}
                  </h3>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Usulan akan dikurasi di antrean <strong>Butuh Verifikasi</strong> sebelum tayang di Kamus
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.4rem',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '4px 8px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitWord}>
              <div className="form-group">
                <label className="form-label">{language === 'en' ? 'Dayak Arut Word:*' : 'Kosakata Dayak Arut:*'}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Kuman, Pahari, Pambelum, Kahati..."
                  value={wordArut}
                  onChange={(e) => setWordArut(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">{language === 'en' ? 'Category / Word Class:' : 'Kelas Kata / Kategori:'}</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                  >
                    <option value="Nomina">Nomina (Kata Benda)</option>
                    <option value="Verba">Verba (Kata Kerja)</option>
                    <option value="Adjektiva">Adjektiva (Kata Sifat)</option>
                    <option value="Pronomina">Pronomina (Kata Ganti)</option>
                    <option value="Numeralia">Numeralia (Bilangan)</option>
                    <option value="Sapaan">Sapaan & Kesantunan</option>
                    <option value="Ungkapan Adat">Ungkapan Adat / Pantang</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{language === 'en' ? 'Phonetic Spelling:' : 'Ejaan Fonetik (Pelafalan):'}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: ku-man"
                    value={phonetic}
                    onChange={(e) => setPhonetic(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">🇮🇩 {language === 'en' ? 'Indonesian Meaning:*' : 'Arti Bahasa Indonesia:*'}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Makan / Santap"
                    value={wordId}
                    onChange={(e) => setWordId(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">🇬🇧 {language === 'en' ? 'English Meaning:' : 'Arti Bahasa Inggris:'}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Eat / Dine"
                    value={wordEn}
                    onChange={(e) => setWordEn(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{language === 'en' ? 'Dialect / Cultural Region:' : 'Ragam Dialek / Daerah Tutur:'}</label>
                <select
                  className="form-select"
                  value={dialect}
                  onChange={(e) => setDialect(e.target.value)}
                >
                  <option value="Pangkut, Arut Utara">Pangkut (Arut Utara - Hulu)</option>
                  <option value="Sukarame, Arut Utara">Sukarame (Arut Utara)</option>
                  <option value="Sambi, Arut Utara">Sambi (Arut Utara)</option>
                  <option value="Pandau, Arut Utara">Pandau (Arut Utara)</option>
                  <option value="Arut Hilir / Mendawai">Arut Hilir / Mendawai (Pangkalan Bun)</option>
                  <option value="Arut Umum">Arut Umum (Dipahami Seluruh DAS Arut)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{language === 'en' ? 'Cultural Context / Meaning Explanation:*' : 'Penjelasan Makna & Konteks Adat:*'}</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Jelaskan nuansa rasa bahasa, konteks pemakaian (misal upacara adat atau percakapan keluarga)..."
                  value={meaning}
                  onChange={(e) => setMeaning(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{language === 'en' ? 'Example Sentence in Dayak Arut:' : 'Contoh Kalimat Dayak Arut:'}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Ayo itah kuman hinje-hinje melai huma."
                  value={exampleArut}
                  onChange={(e) => setExampleArut(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">🇮🇩 {language === 'en' ? 'Sentence Meaning (Indonesian):' : 'Arti Kalimat (Indonesia):'}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Ayo kita makan bersama-sama di rumah."
                    value={exampleId}
                    onChange={(e) => setExampleId(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">🇬🇧 {language === 'en' ? 'Sentence Meaning (English):' : 'Arti Kalimat (Inggris):'}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Let us eat together at home."
                    value={exampleEn}
                    onChange={(e) => setExampleEn(e.target.value)}
                  />
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn btn-outline"
                >
                  {language === 'en' ? 'Cancel' : 'Batal'}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ minWidth: '160px' }}
                >
                  ✓ {language === 'en' ? 'Submit Vocabulary' : 'Kirim Usulan Kosakata'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: INPUT CATATAN REVISI / PENOLAKAN                  */}
      {/* ======================================================== */}
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
              {actionModal.type === 'revision' ? '✏️ Minta Revisi Kosakata' : '✕ Tolak Usulan Kosakata'}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Untuk kosakata: <strong>"{actionModal.wordName}"</strong>
            </p>

            <div className="form-group">
              <label className="form-label">
                {actionModal.type === 'revision' ? 'Catatan Masukan / Hal yang Perlu Dilengkapi:' : 'Alasan Penolakan:'}
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                value={actionModal.noteText}
                onChange={(e) => setActionModal({ ...actionModal, noteText: e.target.value })}
                placeholder="Tuliskan catatan penjelasan untuk pengusul kata..."
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
                  fontWeight: 700
                }}
              >
                {actionModal.type === 'revision' ? 'Kirim Permintaan Revisi' : 'Konfirmasi Penolakan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
