'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth, UserRole, getHighestRole, getRoleBorderColor } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function AreaSuperadminPage() {
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

  const isSuperadmin = hasRole('superadmin');

  const [activeTab, setActiveTab] = useState<'roles' | 'finance' | 'system' | 'audit'>('roles');

  // Toast notifications
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Maintenance mode toggle state
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

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

  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(moderatedWords, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `basa_arut_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast('Cadangan basis data kosakata berhasil diunduh (JSON)!');
  };

  // Role Guard: Only Superadmin
  if (!isLoggedIn || !user || !isSuperadmin) {
    return (
      <div className="container" style={{ padding: '60px 16px', maxWidth: '560px' }}>
        <div className="card-box" style={{ textAlign: 'center', padding: '36px 20px', border: '1.5px solid #F59E0B' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>👑 🔒</div>
          <div className="hero-tag" style={{ background: '#FEF3C7', color: '#92400E', marginBottom: '12px' }}>
            Akses Dibatasi: Wewenang Superadmin Master Diperlukan
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Area Superadmin Master
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '22px' }}>
            {language === 'en'
              ? 'This console is strictly reserved for the platform Superadmin Master to manage user privileges, audit donations, and configure system security.'
              : 'Konsol kendali ini memiliki tingkatan wewenang tertinggi untuk mengatur multi-peran pengguna, audit donasi, dan kontrol sistem.'}
          </p>

          <div style={{ background: 'var(--bg-subtle)', padding: '14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', textAlign: 'left' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              ⚡ Coba dengan Akun Demo Superadmin Master:
            </div>
            <button
              type="button"
              onClick={() => loginDemo('superadmin')}
              className="btn btn-primary btn-sm"
              style={{ width: '100%', justifyContent: 'space-between', background: '#1C1917', borderColor: '#1C1917' }}
            >
              <span>👑 TEN (Superadmin Master)</span>
              <span>Masuk Sebagai Master →</span>
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

  // Demo donation audit entries
  const donationRecords = [
    { id: 'don-1', donor: 'Hamba Allah (Kobar)', amount: 2500000, date: '04 Sep 2026', via: 'QRIS Antara', status: 'Terverifikasi Kas' },
    { id: 'don-2', donor: 'Komunitas Dayak Arut Jabodetabek', amount: 5000000, date: '02 Sep 2026', via: 'Transfer Bank Mandiri', status: 'Terverifikasi Kas' },
    { id: 'don-3', donor: 'Prof. Dr. Hendra (Linguis)', amount: 1000000, date: '30 Agu 2026', via: 'Transfer BCA', status: 'Terverifikasi Kas' },
    { id: 'don-4', donor: 'Relawan Muda Pangkut', amount: 350000, date: '28 Agu 2026', via: 'QRIS Antara', status: 'Terverifikasi Kas' },
  ];

  const totalDonationCollected = donationRecords.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="container" style={{ paddingBottom: '60px' }}>
      {showToast && (
        <div className="toast-notice">
          <span>✓</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Dashboard Superadmin */}
      <div style={{ margin: '24px 0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              border: `3.5px solid ${highestRoleColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              fontWeight: 800,
              background: '#FEF3C7',
              color: '#92400E',
              boxShadow: '0 0 0 3px rgba(245, 158, 11, 0.25), 0 4px 14px rgba(245, 158, 11, 0.3)',
              flexShrink: 0
            }}
          >
            {user.avatar}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.3rem' }}>👑</span>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {language === 'en' ? 'Superadmin Master Console' : 'Area Superadmin Master'}
              </h1>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: '#1C1917',
                  color: '#F59E0B',
                  border: '1px solid #78350F'
                }}
              >
                MASTER PLATFORM
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {user.name} • Kendali Wewenang Tertinggi & Konfigurasi Global Platform
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link href="/area-admin" className="btn btn-outline btn-sm" style={{ borderColor: '#0D9488', color: '#0F766E' }}>
            🛡️ Area Admin
          </Link>
          <Link href="/area-verifikator" className="btn btn-outline btn-sm" style={{ borderColor: '#7C3AED', color: '#6D28D9' }}>
            📜 Area Verifikator
          </Link>
          <Link href="/area-kontributor" className="btn btn-outline btn-sm">
            🌿 Area Kontributor
          </Link>
          <Link href="/akun" className="btn btn-outline btn-sm">
            👤 My Akun
          </Link>
        </div>
      </div>

      {/* Superadmin Tab Bar */}
      <div className="tab-bar-ergonomic" style={{ marginBottom: '22px' }}>
        <button
          type="button"
          className={`tab-btn-ergonomic ${activeTab === 'roles' ? 'active' : ''}`}
          onClick={() => setActiveTab('roles')}
        >
          👥 {language === 'en' ? 'User Roles Matrix' : 'Manajemen Multi-Peran Pengguna'}
        </button>

        <button
          type="button"
          className={`tab-btn-ergonomic ${activeTab === 'finance' ? 'active' : ''}`}
          onClick={() => setActiveTab('finance')}
        >
          💰 {language === 'en' ? 'Donation & Finance Audit' : 'Audit Donasi & Keuangan'}
        </button>

        <button
          type="button"
          className={`tab-btn-ergonomic ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          ⚙️ {language === 'en' ? 'System & Backup' : 'Kontrol Sistem & Backup'}
        </button>

        <button
          type="button"
          className={`tab-btn-ergonomic ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          📋 {language === 'en' ? 'Security Audit Log' : 'Log Audit Aktivitas'}
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: MANAJEMEN MULTI-PERAN PENGGUNA                     */}
      {/* ======================================================== */}
      {activeTab === 'roles' && (
        <div className="card-box" style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ borderBottom: '1.5px solid var(--border-color)', paddingBottom: '14px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              👥 Matriks Penugasan Multi-Peran Akun
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Sebagai Superadmin Master, Anda dapat menaikkan, menurunkan, atau menambahkan peran untuk setiap akun pengguna secara instan.
            </p>
          </div>

          <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1.5px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 14px' }}>Nama & Asal Akun</th>
                  <th style={{ padding: '12px 14px' }}>Email</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>👑 Superadmin</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>🛡️ Admin</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>📜 Verifikator</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>🌿 Kontributor</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((u) => (
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

                    {(['superadmin', 'admin', 'verifier', 'contributor'] as UserRole[]).map((r) => {
                      const isChecked = u.roles.includes(r);
                      return (
                        <td key={r} style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleRoleToggle(u.id, u.roles, r)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#1C1917' }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '14px', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            💡 <strong>Catatan Hak Akses:</strong> Perubahan centang peran akan langsung berlaku seketika pada sesi pengguna tanpa perlu membuat ulang akun.
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: AUDIT DONASI & KEUANGAN PRESERVASI                */}
      {/* ======================================================== */}
      {activeTab === 'finance' && (
        <div className="card-box" style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ borderBottom: '1.5px solid var(--border-color)', paddingBottom: '14px', marginBottom: '18px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              💰 Audit Keuangan & Rekap Donasi Pelestarian
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Pemantauan transparansi dana gotong-royong pelestarian bahasa Dayak Arut sesuai prinsip keterbukaan publik.
            </p>
          </div>

          {/* Financial summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '22px' }}>
            <div style={{ background: '#F0FDF4', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid #BBF7D0' }}>
              <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 650 }}>Total Donasi Diterima</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#14532D', marginTop: '4px' }}>
                Rp {totalDonationCollected.toLocaleString('id-ID')}
              </div>
              <div style={{ fontSize: '0.725rem', color: '#15803D', marginTop: '4px' }}>4 Donatur Terverifikasi</div>
            </div>

            <div style={{ background: '#EFF6FF', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid #BFDBFE' }}>
              <div style={{ fontSize: '0.8rem', color: '#1E40AF', fontWeight: 650 }}>Alokasi Honor Tetua Adat (60%)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1E3A8A', marginTop: '4px' }}>
                Rp {(totalDonationCollected * 0.6).toLocaleString('id-ID')}
              </div>
              <div style={{ fontSize: '0.725rem', color: '#2563EB', marginTop: '4px' }}>Dukungan narasumber penutur asli</div>
            </div>

            <div style={{ background: '#FFFBEB', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid #FDE68A' }}>
              <div style={{ fontSize: '0.8rem', color: '#92400E', fontWeight: 650 }}>Alokasi Cloudflare Server (25%)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#78350F', marginTop: '4px' }}>
                Rp {(totalDonationCollected * 0.25).toLocaleString('id-ID')}
              </div>
              <div style={{ fontSize: '0.725rem', color: '#B45309', marginTop: '4px' }}>Hosting domain & infrastruktur edge</div>
            </div>
          </div>

          {/* Donation Log Table */}
          <h3 style={{ fontSize: '1rem', fontWeight: 750, color: 'var(--text-primary)', marginBottom: '10px' }}>
            Rekap Transaksi Masuk Terkini
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1.5px solid var(--border-color)' }}>
                  <th style={{ padding: '10px 12px' }}>Nama Donatur / Instansi</th>
                  <th style={{ padding: '10px 12px' }}>Nominal</th>
                  <th style={{ padding: '10px 12px' }}>Tanggal</th>
                  <th style={{ padding: '10px 12px' }}>Kanal Pembayaran</th>
                  <th style={{ padding: '10px 12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {donationRecords.map(d => (
                  <tr key={d.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 650 }}>{d.donor}</td>
                    <td style={{ padding: '10px 12px', color: '#166534', fontWeight: 700 }}>
                      Rp {d.amount.toLocaleString('id-ID')}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{d.date}</td>
                    <td style={{ padding: '10px 12px' }}>{d.via}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className="badge" style={{ background: '#DCFCE7', color: '#166534', fontWeight: 700 }}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: KONTROL SISTEM & BACKUP DATA                      */}
      {/* ======================================================== */}
      {activeTab === 'system' && (
        <div className="card-box" style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ borderBottom: '1.5px solid var(--border-color)', paddingBottom: '14px', marginBottom: '18px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              ⚙️ Kontrol Sistem & Pencadangan Basis Data
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Pengaturan operasional tingkat server Cloudflare, pemeliharaan situs, dan ekspor arsip data.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {/* Cloudflare Edge Card */}
            <div style={{ background: 'var(--bg-subtle)', padding: '18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>Cloudflare Edge Worker</strong>
                <span className="badge" style={{ background: '#DCFCE7', color: '#166534', fontWeight: 750 }}>
                  ● ONLINE (HEALTHY)
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
                Layanan proxy edge Cloudflare Wrangler menyajikan static assets dari direktori <code>./out</code> dengan latensi ultra rendah.
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Target Port: <strong>8788</strong> • Protokol: HTTP/2 Static Cache
              </div>
            </div>

            {/* Database Backup Card */}
            <div style={{ background: 'var(--bg-subtle)', padding: '18px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>Cadangan Kamus (JSON Export)</strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '8px 0 14px' }}>
                Unduh salinan arsip seluruh kosakata (Arut, ID, EN, fonetik, dan status kurasi) untuk proteksi cadangan luring.
              </p>
              <button
                type="button"
                onClick={handleExportBackup}
                className="btn btn-primary btn-sm"
                style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
              >
                <span>💾</span>
                <span>Unduh Backup Kamus Lengkap (JSON)</span>
              </button>
            </div>
          </div>

          {/* Maintenance Mode Toggle */}
          <div style={{ background: '#FFFBEB', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid #FDE68A', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <strong style={{ fontSize: '0.95rem', color: '#92400E' }}>Mode Pemeliharaan (Maintenance Mode)</strong>
              <div style={{ fontSize: '0.8rem', color: '#B45309', marginTop: '2px' }}>
                Jika diaktifkan, pengunjung umum akan diarahkan ke halaman tunggu sementara perbaikan data dilakukan.
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsMaintenanceMode(!isMaintenanceMode);
                triggerToast(isMaintenanceMode ? 'Mode pemeliharaan dinonaktifkan.' : 'Mode pemeliharaan diaktifkan!');
              }}
              className="btn btn-sm"
              style={{
                background: isMaintenanceMode ? '#DC2626' : '#166534',
                color: '#FFFFFF',
                fontWeight: 750
              }}
            >
              {isMaintenanceMode ? '🔴 Nonaktifkan Maintenance' : '🟢 Status: Normal Operasional'}
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: LOG AUDIT KEAMANAN & AKTIVITAS                    */}
      {/* ======================================================== */}
      {activeTab === 'audit' && (
        <div className="card-box" style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ borderBottom: '1.5px solid var(--border-color)', paddingBottom: '14px', marginBottom: '18px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              📋 Log Audit Aktivitas & Keamanan Platform
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Catatan peristiwa penting (*event stream*) untuk mendeteksi perubahan konfigurasi wewenang dan sesi masuk.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { time: 'Baru saja', event: 'Sesi Superadmin Master aktif', user: user.name, type: 'AUTH' },
              { time: '10 menit lalu', event: 'Verifikasi kosakata "Pambelum" disetujui masuk kamus publik', user: 'Admin Platform', type: 'CURATION' },
              { time: '1 jam lalu', event: 'Penambahan kosakata baru "Mangaju" diajukan ke antrean verifikasi', user: 'Rian Pratama', type: 'SUBMISSION' },
              { time: '2 jam lalu', event: 'Pemberian hak akses verifikator kepada Damang Adat Arut Utara', user: 'TEN (Superadmin)', type: 'SECURITY' },
              { time: 'Kemarin', event: 'Verifikasi mutasi donasi Rp 5.000.000 dari Komunitas Dayak Arut', user: 'Sistem Keuangan', type: 'FINANCE' },
            ].map((log, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-subtle)',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px',
                  fontSize: '0.825rem'
                }}
              >
                <div>
                  <span
                    className="badge"
                    style={{
                      marginRight: '8px',
                      fontSize: '0.675rem',
                      background: log.type === 'SECURITY' ? '#FEF2F2' : log.type === 'CURATION' ? '#F0FDF4' : '#EFF6FF',
                      color: log.type === 'SECURITY' ? '#991B1B' : log.type === 'CURATION' ? '#166534' : '#1E40AF',
                      fontWeight: 750
                    }}
                  >
                    {log.type}
                  </span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{log.event}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>oleh {log.user}</span>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
