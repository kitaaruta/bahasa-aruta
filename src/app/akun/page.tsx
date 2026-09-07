'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth, getHighestRole, getRoleBorderColor } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function MyAkunPage() {
  const { user, isLoggedIn, logout, contributedWords, moderatedWords } = useAuth();
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'submitted' | 'verified'>('submitted');
  const [searchSubmittedQuery, setSearchSubmittedQuery] = useState('');
  const [searchVerifiedQuery, setSearchVerifiedQuery] = useState('');

  const highestRole = user ? getHighestRole(user.roles) : 'contributor';
  const highestRoleColor = getRoleBorderColor(highestRole);

  // Filter words submitted by this user
  const mySubmittedWords = useMemo(() => {
    if (!user) return [];
    // Include contributedWords and any matched submitter in moderatedWords
    const list = moderatedWords.filter(
      w => w.submitterName.toLowerCase() === user.name.toLowerCase() ||
           w.submitterName.toLowerCase().includes(user.name.split(' ')[0].toLowerCase())
    );

    // If empty, fallback to contributedWords
    const baseList = list.length > 0 ? list : contributedWords.map(cw => ({
      ...cw,
      submitterName: user.name,
      submitterRole: user.badge,
      status: (cw.verifiedBy?.includes('Disetujui') ? 'approved' : 'pending') as any,
      submittedAt: cw.dateAdded || 'Tercatat',
    }));

    if (!searchSubmittedQuery.trim()) return baseList;
    const q = searchSubmittedQuery.toLowerCase().trim();
    return baseList.filter(item =>
      item.wordArut.toLowerCase().includes(q) ||
      item.wordId.toLowerCase().includes(q) ||
      item.wordEn?.toLowerCase().includes(q)
    );
  }, [user, moderatedWords, contributedWords, searchSubmittedQuery]);

  // Filter words verified by this user (or verified in system for verifier/admin/superadmin)
  const myVerifiedWords = useMemo(() => {
    if (!user) return [];
    const verifiedList = moderatedWords.filter(w => w.status !== 'pending');

    if (!searchVerifiedQuery.trim()) return verifiedList;
    const q = searchVerifiedQuery.toLowerCase().trim();
    return verifiedList.filter(item =>
      item.wordArut.toLowerCase().includes(q) ||
      item.wordId.toLowerCase().includes(q) ||
      item.adminNotes?.toLowerCase().includes(q) ||
      item.verifiedBy?.toLowerCase().includes(q)
    );
  }, [user, moderatedWords, searchVerifiedQuery]);

  if (!isLoggedIn || !user) {
    return (
      <div className="container" style={{ padding: '60px 16px', maxWidth: '540px' }}>
        <div className="card-box" style={{ textAlign: 'center', padding: '36px 20px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔒</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            {language === 'en' ? 'Sign In Required' : 'Silakan Masuk ke Akun Anda'}
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '22px', lineHeight: 1.5 }}>
            {language === 'en'
              ? 'Please log in to view your profile details, submitted vocabulary, and verification portfolio.'
              : 'Anda perlu masuk untuk melihat detail profil, rekam jejak usulan kosakata, dan riwayat verifikasi Anda.'}
          </p>
          <Link href="/masuk" className="btn btn-primary" style={{ width: '100%' }}>
            {language === 'en' ? 'Sign In to Account' : 'Masuk ke Akun'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '32px 16px 60px', maxWidth: '960px' }}>
      {/* Profile Overview Card */}
      <div
        className="card-box"
        style={{
          padding: '24px',
          marginBottom: '24px',
          background: '#FFFFFF',
          border: '1.5px solid var(--border-color)',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            {/* Avatar with Highest Role Color Border */}
            <div
              style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                border: `3.5px solid ${highestRoleColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                fontWeight: 800,
                background: 'var(--bg-card)',
                color: highestRoleColor,
                boxShadow: `0 0 0 4px rgba(0,0,0,0.04), 0 4px 14px ${highestRoleColor}35`,
                flexShrink: 0
              }}
            >
              {user.avatar}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {user.name}
                </h1>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                ✉️ {user.email} • 📍 {user.origin}
              </p>
              {user.bio && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic', maxWidth: '600px' }}>
                  "{user.bio}"
                </p>
              )}

              {/* Multi-role badges */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                {user.roles.map(r => (
                  <span
                    key={r}
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 750,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: r === 'superadmin' ? '#FEF3C7' : r === 'admin' ? '#CCFBF1' : r === 'verifier' ? '#EDE9FE' : '#D1FAE5',
                      color: r === 'superadmin' ? '#92400E' : r === 'admin' ? '#115E59' : r === 'verifier' ? '#5B21B6' : '#065F46',
                      border: `1px solid ${getRoleBorderColor(r)}40`
                    }}
                  >
                    {r === 'superadmin' ? '👑 SUPERADMIN' : r === 'admin' ? '🛡️ ADMIN' : r === 'verifier' ? '📜 VERIFIKATOR' : '🌿 KONTRIBUTOR'}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Link href="/area-kontributor" className="btn btn-primary btn-sm">
              ⚙️ {language === 'en' ? 'Workspace Console' : 'Area Kontributor'}
            </Link>
            <button
              type="button"
              onClick={logout}
              className="btn btn-outline btn-sm"
              style={{ color: '#DC2626', borderColor: '#FECACA' }}
            >
              🚪 {language === 'en' ? 'Sign Out' : 'Keluar'}
            </button>
          </div>
        </div>

        {/* Account Statistics Ribbon */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '12px',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-color)'
          }}
        >
          <div style={{ background: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>✍️ Kosakata Diajukan</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              {user.wordsSubmittedCount || mySubmittedWords.length} Istilah
            </div>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🛡️ Kosakata Diverifikasi</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F766E', marginTop: '2px' }}>
              {user.wordsVerifiedCount || myVerifiedWords.length} Istilah
            </div>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>🌟 Tingkat Akses Akun</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: highestRoleColor, marginTop: '5px' }}>
              {user.badge}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Selection: Riwayat Diajukan vs Riwayat Diverifikasi */}
      <div className="tab-bar-ergonomic" style={{ marginBottom: '20px' }}>
        <button
          type="button"
          className={`tab-btn-ergonomic ${activeTab === 'submitted' ? 'active' : ''}`}
          onClick={() => setActiveTab('submitted')}
        >
          ✍️ {language === 'en' ? `Submitted Words (${mySubmittedWords.length})` : `Riwayat Kosakata Diajukan (${mySubmittedWords.length})`}
        </button>

        <button
          type="button"
          className={`tab-btn-ergonomic ${activeTab === 'verified' ? 'active' : ''}`}
          onClick={() => setActiveTab('verified')}
        >
          🛡️ {language === 'en' ? `Verified Words (${myVerifiedWords.length})` : `Riwayat Kosakata Diverifikasi (${myVerifiedWords.length})`}
        </button>
      </div>

      {/* TAB 1: RIWAYAT KOSAKATA DIAJUKAN */}
      {activeTab === 'submitted' && (
        <div className="card-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 750, color: 'var(--text-primary)' }}>
                {language === 'en' ? 'Vocabulary Submitted by You' : 'Kosakata yang Pernah Anda Ajukan'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {language === 'en' ? 'Track status of your proposed Dayak Arut vocabulary' : 'Pantau status kurasi setiap kosakata yang Anda usulkan'}
              </p>
            </div>

            <Link href="/area-kontributor" className="btn btn-primary btn-sm">
              ➕ {language === 'en' ? 'Submit New' : 'Ajukan Kata Baru'}
            </Link>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Cari dalam riwayat usulan Anda..."
              value={searchSubmittedQuery}
              onChange={(e) => setSearchSubmittedQuery(e.target.value)}
            />
          </div>

          {mySubmittedWords.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {mySubmittedWords.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '16px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{item.wordArut}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/{item.phonetic}/</span>
                        <span className="badge">{item.category}</span>
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 650, color: 'var(--text-primary)', marginTop: '2px' }}>
                        = {item.wordId} {item.wordEn && item.wordEn !== item.wordId ? `• (${item.wordEn})` : ''}
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
                      {item.verifiedBy || 'Menunggu Verifikasi'}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '8px' }}>
                    {item.meaning}
                  </p>

                  {item.exampleArut && (
                    <div className="word-example" style={{ marginBottom: '8px' }}>
                      <div className="word-example-arut">"{item.exampleArut}"</div>
                      <div className="word-example-id">{item.exampleId}</div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                    <span>📍 Dialek: {item.dialect}</span>
                    <span>Tercatat: {item.submittedAt || (item as any).dateAdded || 'Baru saja'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
              Belum ada usulan kosakata yang dicatat atas nama akun ini.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RIWAYAT KOSAKATA DIVERIFIKASI */}
      {activeTab === 'verified' && (
        <div className="card-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 750, color: 'var(--text-primary)' }}>
                {language === 'en' ? 'Vocabulary Verified Record' : 'Rekam Jejak Verifikasi Kosakata'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {language === 'en' ? 'Portfolio of words examined and verified for cultural authenticity' : 'Arsip kosakata yang telah melalui proses kurasi dan telaah adat'}
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Cari kosakata dalam arsip verifikasi..."
              value={searchVerifiedQuery}
              onChange={(e) => setSearchVerifiedQuery(e.target.value)}
            />
          </div>

          {myVerifiedWords.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {myVerifiedWords.map((item) => {
                const isApproved = item.status === 'approved';
                const isRejected = item.status === 'rejected';

                return (
                  <div
                    key={item.id}
                    style={{
                      background: isApproved ? '#F0FDF4' : isRejected ? '#FEF2F2' : '#FFFBEB',
                      border: `1.5px solid ${isApproved ? '#86EFAC' : isRejected ? '#FECACA' : '#FDE68A'}`,
                      borderRadius: 'var(--radius-sm)',
                      padding: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{item.wordArut}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/{item.phonetic}/</span>
                          <span className="badge">{item.category}</span>
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 650, color: 'var(--text-primary)', marginTop: '2px' }}>
                          🇮🇩 {item.wordId} • 🇬🇧 {item.wordEn}
                        </div>
                      </div>

                      <span
                        className="badge"
                        style={{
                          background: isApproved ? '#DCFCE7' : isRejected ? '#FEE2E2' : '#FEF3C7',
                          color: isApproved ? '#166534' : isRejected ? '#991B1B' : '#92400E',
                          fontWeight: 750
                        }}
                      >
                        {isApproved ? '✓ TERVERIFIKASI / DISETUJUI' : isRejected ? '✕ DITOLAK' : '✏️ PERLU REVISI'}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '8px' }}>
                      {item.meaning}
                    </p>

                    {item.adminNotes && (
                      <div
                        style={{
                          background: 'rgba(255,255,255,0.7)',
                          borderLeft: `3px solid ${isApproved ? '#166534' : isRejected ? '#991B1B' : '#D97706'}`,
                          padding: '6px 10px',
                          borderRadius: '0 4px 4px 0',
                          fontSize: '0.8rem',
                          color: 'var(--text-primary)',
                          marginBottom: '8px'
                        }}
                      >
                        <strong>Catatan Kurasi:</strong> {item.adminNotes}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                      <span>Keputusan: <strong>{item.verifiedBy}</strong></span>
                      <span>Pengusul: {item.submitterName} ({item.submittedAt})</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
              Belum ada riwayat verifikasi kosakata.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
