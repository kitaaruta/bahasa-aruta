'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth, UserRole, getHighestRole, getRoleBorderColor } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function AreaAdminPage() {
  const {
    user,
    isLoggedIn,
    hasRole,
    loginDemo,
    allUsers,
    updateUserRoles,
    moderatedWords
  } = useAuth();
  const { language } = useLanguage();

  const isAdmin = hasRole('admin') || hasRole('superadmin');
  const isSuperadmin = hasRole('superadmin');

  const [activeTab, setActiveTab] = useState<'users' | 'operations' | 'support'>('users');
  const [searchUserQuery, setSearchUserQuery] = useState('');

  // Toast notification
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  // Role Guard: Only Admin or Superadmin
  if (!isLoggedIn || !user || !isAdmin) {
    return (
      <div className="container" style={{ padding: '60px 16px', maxWidth: '560px' }}>
        <div className="card-box" style={{ textAlign: 'center', padding: '36px 20px', border: '1.5px solid #0D9488' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🛡️ 🔒</div>
          <div className="hero-tag" style={{ background: '#CCFBF1', color: '#115E59', marginBottom: '12px' }}>
            Akses Terbatas: Wewenang Admin Diperlukan
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Area Admin Platform
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '22px' }}>
            {language === 'en'
              ? 'This workspace is restricted to platform administrators to manage accounts, promote verifiers, and supervise operations.'
              : 'Ruang kerja ini khusus bagi Admin Platform untuk menyetujui akun baru, mempromosikan peran di bawah admin, serta mengelola operasional harian.'}
          </p>

          <div style={{ background: 'var(--bg-subtle)', padding: '14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', textAlign: 'left' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              ⚡ Coba Masuk dengan Akun Admin Demo:
            </div>
            <button
              type="button"
              onClick={() => loginDemo('admin')}
              className="btn btn-primary btn-sm"
              style={{ width: '100%', justifyContent: 'space-between', background: '#0D9488', borderColor: '#0D9488' }}
            >
              <span>🛡️ Admin Operasional</span>
              <span>Masuk Sebagai Admin →</span>
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

  // Filtered users
  const filteredUsers = allUsers.filter(u => {
    if (!searchUserQuery.trim()) return true;
    const q = searchUserQuery.toLowerCase().trim();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.origin.toLowerCase().includes(q);
  });

  // Admin handles promotion to roles below admin: only contributor & verifier!
  const handleAdminRoleToggle = (targetUserId: string, currentRoles: UserRole[], toggledRole: UserRole) => {
    // Security restriction: Admin cannot grant admin or superadmin!
    if ((toggledRole === 'admin' || toggledRole === 'superadmin') && !isSuperadmin) {
      alert('Wewenang terbatas: Hanya Superadmin Master yang berhak mempromosikan akun ke peran Admin atau Superadmin.');
      return;
    }

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
    triggerToast(`Peran akun berhasil disesuaikan oleh Admin!`);
  };

  const pendingCount = moderatedWords.filter(w => w.status === 'pending').length;
  const approvedCount = moderatedWords.filter(w => w.status === 'approved').length;

  return (
    <div className="container" style={{ paddingBottom: '60px' }}>
      {showToast && (
        <div className="toast-notice">
          <span>✓</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Dashboard Admin */}
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
              background: '#F0FDFA',
              color: '#0F766E',
              boxShadow: '0 0 0 2px rgba(13, 148, 136, 0.2), 0 4px 12px rgba(13, 148, 136, 0.2)',
              flexShrink: 0
            }}
          >
            {user.avatar}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.3rem' }}>🛡️</span>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {language === 'en' ? 'Admin Operations Console' : 'Area Admin Platform'}
              </h1>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: '#CCFBF1',
                  color: '#115E59',
                  border: '1px solid #99F6E4'
                }}
              >
                ADMIN OPERASIONAL
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {user.name} • Manajemen Akun Baru, Promosi Verifikator, & Koordinasi Operasional
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {isSuperadmin && (
            <Link href="/area-superadmin" className="btn btn-outline btn-sm" style={{ borderColor: '#F59E0B', color: '#B45309' }}>
              👑 Area Superadmin
            </Link>
          )}
          <Link href="/area-verifikator" className="btn btn-outline btn-sm" style={{ borderColor: '#7C3AED', color: '#6D28D9' }}>
            📜 Area Verifikator
          </Link>
          <Link href="/area-kontributor" className="btn btn-outline btn-sm">
            🌿 Area Kontributor
          </Link>
        </div>
      </div>

      {/* Admin Tab Bar */}
      <div className="tab-bar-ergonomic" style={{ marginBottom: '22px' }}>
        <button
          type="button"
          className={`tab-btn-ergonomic ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 {language === 'en' ? 'Manage Accounts & Roles' : 'Kelola Akun & Promosi Peran'}
        </button>

        <button
          type="button"
          className={`tab-btn-ergonomic ${activeTab === 'operations' ? 'active' : ''}`}
          onClick={() => setActiveTab('operations')}
        >
          📊 {language === 'en' ? 'Operations Supervision' : 'Pemantauan Operasional'}
        </button>

        <button
          type="button"
          className={`tab-btn-ergonomic ${activeTab === 'support' ? 'active' : ''}`}
          onClick={() => setActiveTab('support')}
        >
          💬 {language === 'en' ? 'Community Support' : 'Koordinasi Komunitas'}
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: KELOLA AKUN & PROMOSI PERAN (Dibawah Admin)        */}
      {/* ======================================================== */}
      {activeTab === 'users' && (
        <div className="card-box" style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ borderBottom: '1.5px solid var(--border-color)', paddingBottom: '14px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              👥 Manajemen Akun & Persetujuan Keanggotaan
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Sebagai Admin, Anda dapat mempromosikan anggota menjadi <strong>Kontributor</strong> atau <strong>Verifikator Adat</strong>.
              <br />
              <span style={{ color: '#0F766E', fontWeight: 650 }}>
                🔒 Catatan Wewenang: Promosi ke peran Admin atau Superadmin hanya dapat dilakukan oleh Superadmin Master.
              </span>
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Cari pengguna (nama, email, asal daerah)..."
              value={searchUserQuery}
              onChange={(e) => setSearchUserQuery(e.target.value)}
            />
          </div>

          <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1.5px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 14px' }}>Nama Pengguna</th>
                  <th style={{ padding: '12px 14px' }}>Email</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>🌿 Kontributor</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>📜 Verifikator</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center', color: 'var(--text-muted)' }}>🛡️ Admin</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center', color: 'var(--text-muted)' }}>👑 Superadmin</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const hasKontributor = u.roles.includes('contributor');
                  const hasVerifikator = u.roles.includes('verifier');
                  const hasAdminRole = u.roles.includes('admin');
                  const hasSuperadminRole = u.roles.includes('superadmin');

                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              border: `2px solid ${getRoleBorderColor(getHighestRole(u.roles))}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '0.75rem',
                              background: 'var(--bg-card)'
                            }}
                          >
                            {u.avatar}
                          </div>
                          <div>
                            <strong>{u.name}</strong>
                            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>📍 {u.origin}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>{u.email}</td>

                      {/* 1. Kontributor Toggle (Admin can edit) */}
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={hasKontributor}
                          onChange={() => handleAdminRoleToggle(u.id, u.roles, 'contributor')}
                          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#059669' }}
                          title="Beri / Cabut peran Kontributor"
                        />
                      </td>

                      {/* 2. Verifikator Toggle (Admin can promote) */}
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={hasVerifikator}
                          onChange={() => handleAdminRoleToggle(u.id, u.roles, 'verifier')}
                          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#7C3AED' }}
                          title="Promosikan menjadi Verifikator Adat"
                        />
                      </td>

                      {/* 3. Admin Toggle (Locked for regular admin, only superadmin can edit) */}
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={hasAdminRole}
                          disabled={!isSuperadmin}
                          onChange={() => isSuperadmin && handleAdminRoleToggle(u.id, u.roles, 'admin')}
                          style={{
                            width: '18px',
                            height: '18px',
                            cursor: isSuperadmin ? 'pointer' : 'not-allowed',
                            accentColor: '#0D9488',
                            opacity: isSuperadmin ? 1 : 0.45
                          }}
                          title={isSuperadmin ? 'Ubah peran Admin' : 'Terkunci: Wewenang Superadmin Master'}
                        />
                        {!isSuperadmin && <span style={{ fontSize: '0.65rem', display: 'block', color: 'var(--text-muted)' }}>🔒 Master</span>}
                      </td>

                      {/* 4. Superadmin Toggle (Locked for regular admin) */}
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={hasSuperadminRole}
                          disabled={!isSuperadmin}
                          onChange={() => isSuperadmin && handleAdminRoleToggle(u.id, u.roles, 'superadmin')}
                          style={{
                            width: '18px',
                            height: '18px',
                            cursor: isSuperadmin ? 'pointer' : 'not-allowed',
                            accentColor: '#1C1917',
                            opacity: isSuperadmin ? 1 : 0.45
                          }}
                          title={isSuperadmin ? 'Ubah peran Superadmin' : 'Terkunci: Wewenang Superadmin Master'}
                        />
                        {!isSuperadmin && <span style={{ fontSize: '0.65rem', display: 'block', color: 'var(--text-muted)' }}>🔒 Master</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '14px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            🛡️ <strong>Tanggung Jawab Admin:</strong> Pastikan akun yang dipromosikan sebagai <em>Verifikator Adat</em> merupakan tetua adat, damang, mantir, atau pengkaji linguistik yang memiliki rekam jejak memahami dialek Dayak Arut.
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PEMANTAUAN OPERASIONAL PLATFORM                    */}
      {/* ======================================================== */}
      {activeTab === 'operations' && (
        <div className="card-box" style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ borderBottom: '1.5px solid var(--border-color)', paddingBottom: '14px', marginBottom: '18px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              📊 Pemantauan Kelancaran Operasional Platform
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Membantu kelancaran arus telaah kosakata antara kontributor umum dan verifikator adat.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '22px' }}>
            <div style={{ background: '#FFFBEB', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid #FDE68A' }}>
              <div style={{ fontSize: '0.8rem', color: '#92400E', fontWeight: 650 }}>Antrean Butuh Verifikasi</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#B45309', marginTop: '4px' }}>
                {pendingCount} Istilah
              </div>
              <div style={{ fontSize: '0.725rem', color: '#92400E', marginTop: '4px' }}>
                Sedang ditelaah oleh verifikator
              </div>
            </div>

            <div style={{ background: '#F0FDF4', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid #BBF7D0' }}>
              <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 650 }}>Kosakata Berhasil Terbit</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#14532D', marginTop: '4px' }}>
                {approvedCount} Istilah
              </div>
              <div style={{ fontSize: '0.725rem', color: '#15803D', marginTop: '4px' }}>
                Aktif di kamus & penerjemah
              </div>
            </div>

            <div style={{ background: '#F5F3FF', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid #DDD6FE' }}>
              <div style={{ fontSize: '0.8rem', color: '#5B21B6', fontWeight: 650 }}>Total Anggota Terdaftar</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#4C1D95', marginTop: '4px' }}>
                {allUsers.length} Pengguna
              </div>
              <div style={{ fontSize: '0.725rem', color: '#6D28D9', marginTop: '4px' }}>
                Kontributor & Verifikator aktif
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '18px', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                Ingin Membantu Menelaah Kosakata Masuk?
              </strong>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Sebagai Admin, Anda dapat langsung membuka antrean kurasi di Area Verifikator.
              </div>
            </div>
            <Link href="/area-verifikator" className="btn btn-primary btn-sm" style={{ background: '#7C3AED', borderColor: '#7C3AED' }}>
              📜 Buka Area Verifikator →
            </Link>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: KOORDINASI KOMUNITAS                              */}
      {/* ======================================================== */}
      {activeTab === 'support' && (
        <div className="card-box" style={{ maxWidth: '960px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px' }}>
            💬 Koordinasi Operasional & Layanan Komunitas
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 750, color: '#0F766E', marginBottom: '6px' }}>
                1. Penanganan Usulan Bermasalah
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Jika kontributor melaporkan kesalahan arti atau ejaan pada kosakata yang sudah terlanjur terbit, Admin dapat mengkoordinasikan koreksi dengan Verifikator Adat terkait.
              </p>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 750, color: '#0F766E', marginBottom: '6px' }}>
                2. Onboarding Kontributor Baru
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Admin bertanggung jawab menyambut relawan pemuda dan pegiat budaya yang baru mendaftar, memberikan bimbingan pengisian fonetik dan dialek lokal.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
