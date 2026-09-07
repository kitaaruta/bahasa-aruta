'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

interface RoleCard {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  audience: string;
  description: string;
  features: string[];
}

const REGISTRATION_ROLES: RoleCard[] = [
  {
    id: 'contributor',
    name: '🌿 Kontributor Penutur & Relawan',
    badge: 'Paling Dianjurkan',
    badgeColor: '#059669',
    audience: 'Penutur Asli, Warga Kampung Arut, Generasi Muda, & Relawan Budaya',
    description: 'Bagi Anda yang ingin mendokumentasikan tutur keseharian, mengusulkan leksikon kata baru, melengkapi fonetik ejaan, dan kalimat contoh adat.',
    features: ['Mengusulkan kosakata Dayak Arut baru', 'Melacak status kurasi usulan mandiri', 'Menyimpan riwayat kontribusi leksikon']
  },
  {
    id: 'elder_candidate',
    name: '📜 Calon Verifikator / Tetua Adat',
    badge: 'Otoritas Adat',
    badgeColor: '#7C3AED',
    audience: 'Damang Adat, Mantir Adat, Sesepuh Kampung, & Tokoh Kebudayaan Dayak',
    description: 'Bagi tokoh adat yang memiliki otoritas menelaah kesahihan arti leksikon, kaidah tutur asli, serta dialek leluhur (Wewenang akhir diverifikasi Admin).',
    features: ['Pengajuan hak telaah tutur adat', 'Konsultasi etimologi leksikon Arut', 'Akses modul telaah bersama kedamangan']
  },
  {
    id: 'researcher',
    name: '🎓 Peneliti & Akademisi Linguistik',
    badge: 'Akademik & Riset',
    badgeColor: '#0D9488',
    audience: 'Dosen, Mahasiswa, Linguis, Antropolog, & Peneliti Bahasa Daerah',
    description: 'Bagi pengkaji bahasa Austronesia yang membutuhkan akses korpus leksikografi Dayak Arut untuk riset ilmiah dan publikasi pelestarian.',
    features: ['Akses basis data leksikon & dialek', 'Kajian fonetik & perbandingan rumpun', 'Pengajuan usulan berbasis telaah literatur']
  },
  {
    id: 'reader',
    name: '👥 Pembaca & Pelajar Umum',
    badge: 'Pengguna Umum',
    badgeColor: '#0284C7',
    audience: 'Pelajar, Mahasiswa Umum, Perantau Kobar, & Masyarakat Luas',
    description: 'Bagi siapa pun yang ingin mempelajari kosakata Dayak Arut, mencari padanan arti di kamus, dan menyimpan leksikon favorit.',
    features: ['Pencarian leksikon kamus lengkap', 'Alat bantu terjemahan bahasa', 'Fitur simpan daftar kosakata favorit']
  }
];

export default function MasukPage() {
  const router = useRouter();
  const { user, isLoggedIn, login, loginDemo, register, logout, regions } = useAuth();
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register Form States
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registerOrigin, setRegisterOrigin] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('contributor');
  const [registerMotivation, setRegisterMotivation] = useState('');
  const [alertMsg, setAlertMsg] = useState('');

  // Active regions list from Admin
  const activeRegions = regions && regions.length > 0
    ? regions.filter(r => r.status === 'active')
    : [];

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setAlertMsg(language === 'en' ? 'Please enter your email address.' : 'Silakan masukkan alamat email.');
      return;
    }
    if (!loginPassword.trim()) {
      setAlertMsg('Silakan masukkan kata sandi akun Anda.');
      return;
    }
    login(loginEmail);
    router.push('/portal');
  };

  const handleDemoClick = (role: 'superadmin' | 'admin' | 'elder' | 'volunteer') => {
    loginDemo(role);
    router.push('/portal');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName.trim() || !registerEmail.trim()) {
      setAlertMsg('Nama lengkap dan alamat email wajib diisi.');
      return;
    }
    if (!registerPassword || registerPassword.length < 6) {
      setAlertMsg('Kata sandi wajib diisi minimal 6 karakter.');
      return;
    }
    if (registerPassword !== registerConfirmPassword) {
      setAlertMsg('Konfirmasi kata sandi tidak cocok. Mohon periksa kembali.');
      return;
    }

    const chosenRole = REGISTRATION_ROLES.find(r => r.id === selectedRoleId);
    const chosenOrigin = registerOrigin || (activeRegions[0]?.name || 'Kelurahan Pangkut');

    register({
      name: registerName.trim(),
      email: registerEmail.trim(),
      password: registerPassword,
      origin: chosenOrigin,
      role: chosenRole ? chosenRole.name : 'Kontributor Bahasa',
      motivation: registerMotivation.trim() || 'Pelestarian Basa Arut'
    });
    router.push('/portal');
  };

  if (isLoggedIn && user) {
    return (
      <div className="container" style={{ padding: '60px 20px', maxWidth: '540px' }}>
        <div className="card-box" style={{ textAlign: 'center', padding: '36px 20px' }}>
          <div className="avatar-badge" style={{ width: '56px', height: '56px', fontSize: '1.25rem', margin: '0 auto 12px' }}>
            {user.avatar}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 650, textTransform: 'uppercase' }}>
            {language === 'en' ? 'Currently Signed In As' : 'Anda Sedang Masuk Sebagai'}
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {user.name}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            📍 {user.origin}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {user.roles.map(r => (
              <span key={r} className="badge" style={{ background: r === 'superadmin' ? '#1C1917' : 'var(--bg-subtle)', color: r === 'superadmin' ? '#FFFFFF' : 'var(--text-primary)' }}>
                {r.toUpperCase()}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link href="/portal" className="btn btn-primary">
              {language === 'en' ? 'Open Portal Console' : 'Masuk ke Konsol Portal'}
            </Link>
            <button type="button" onClick={logout} className="btn btn-outline">
              {language === 'en' ? 'Sign Out' : 'Keluar Sesi'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 16px 60px', maxWidth: '640px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div className="logo-symbol" style={{ margin: '0 auto 10px', width: '42px', height: '42px', fontSize: '1.15rem' }}>
          BA
        </div>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          {language === 'en' ? 'Platform Authentication' : 'Akses Portal Basa Arut'}
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          {language === 'en'
            ? 'Access your contributor, elder verifier, admin, or master superadmin console'
            : 'Masuk dengan akun terdaftar atau buat akun kontributor baru untuk melestarikan bahasa Dayak Arut'}
        </p>
      </div>

      {/* Quick Demo Access - Multi-Role Showcase */}
      <div style={{ background: 'var(--bg-subtle)', border: '1.5px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '20px' }}>
        <div style={{ fontSize: '0.775rem', fontWeight: 750, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
          <span>⚡ {language === 'en' ? 'Quick Demo Login (1-Click):' : 'Akses Cepat Demo Berbagai Peran:'}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Multi-Role Ready</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Superadmin */}
          <button
            type="button"
            onClick={() => handleDemoClick('superadmin')}
            className="btn btn-outline btn-sm"
            style={{ justifyContent: 'space-between', textAlign: 'left', background: '#FFFFFF', border: '1.5px solid #1C1917' }}
          >
            <div>
              <div>👑 <strong>Superadmin Master (TEN)</strong></div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Roles: superadmin • admin • verifier • contributor</div>
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Masuk →</span>
          </button>

          {/* Admin */}
          <button
            type="button"
            onClick={() => handleDemoClick('admin')}
            className="btn btn-outline btn-sm"
            style={{ justifyContent: 'space-between', textAlign: 'left', background: '#FFFFFF' }}
          >
            <div>
              <div>🛡️ <strong>Admin Platform (Pengelola)</strong></div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Roles: admin • contributor</div>
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Masuk →</span>
          </button>

          {/* Elder Verifier */}
          <button
            type="button"
            onClick={() => handleDemoClick('elder')}
            className="btn btn-outline btn-sm"
            style={{ justifyContent: 'space-between', textAlign: 'left', background: '#FFFFFF' }}
          >
            <div>
              <div>📜 <strong>Damang Adat Arut Utara</strong></div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Roles: verifier • contributor</div>
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Masuk →</span>
          </button>

          {/* Volunteer */}
          <button
            type="button"
            onClick={() => handleDemoClick('volunteer')}
            className="btn btn-outline btn-sm"
            style={{ justifyContent: 'space-between', textAlign: 'left', background: '#FFFFFF' }}
          >
            <div>
              <div>🌿 <strong>Rian Pratama (Relawan Pemuda)</strong></div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Roles: contributor</div>
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Masuk →</span>
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', background: 'var(--bg-subtle)', padding: '3px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
        <button
          type="button"
          onClick={() => { setActiveTab('login'); setAlertMsg(''); }}
          style={{
            padding: '10px',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            background: activeTab === 'login' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'login' ? 'var(--text-primary)' : 'var(--text-muted)',
            boxShadow: activeTab === 'login' ? 'var(--shadow-sm)' : 'none'
          }}
        >
          {language === 'en' ? 'Email Login' : 'Masuk via Email'}
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('register'); setAlertMsg(''); }}
          style={{
            padding: '10px',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            background: activeTab === 'register' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'register' ? 'var(--text-primary)' : 'var(--text-muted)',
            boxShadow: activeTab === 'register' ? 'var(--shadow-sm)' : 'none'
          }}
        >
          {language === 'en' ? 'Register' : 'Daftar Akun Baru'}
        </button>
      </div>

      {/* Form Container */}
      <div className="card-box" style={{ padding: '24px' }}>
        {alertMsg && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '16px' }}>
            ⚠️ {alertMsg}
          </div>
        )}

        {activeTab === 'login' ? (
          /* ========================================================= */
          /* FORM MASUK (LOGIN)                                        */
          /* ========================================================= */
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 700, marginBottom: '6px' }}>
                {language === 'en' ? 'Account Email:' : 'Alamat Email Terdaftar *'}
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="nama@email.com / admin@aruta.id"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                style={{ padding: '9px 12px', fontSize: '0.9rem' }}
              />
            </div>

            {/* Password Field Setelah Email */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 700, marginBottom: '6px' }}>
                {language === 'en' ? 'Password:' : 'Kata Sandi / Password *'}
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Masukkan kata sandi..."
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  style={{ padding: '9px 40px 9px 12px', width: '100%', fontSize: '0.9rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    color: '#64748b',
                    padding: '4px'
                  }}
                  title={showLoginPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showLoginPassword ? '👁️' : '🔒'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px', marginTop: '6px', fontWeight: 700 }}>
              {language === 'en' ? 'Sign In to Portal' : 'Masuk ke Portal Basa Arut →'}
            </button>
          </form>
        ) : (
          /* ========================================================= */
          /* FORM DAFTAR BARU (REGISTER)                               */
          /* ========================================================= */
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 1. Nama Lengkap */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 700, marginBottom: '4px' }}>
                {language === 'en' ? 'Full Name:' : 'Nama Lengkap *'}
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Contoh: Rian Pratama"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                required
                style={{ padding: '9px 12px', fontSize: '0.9rem' }}
              />
            </div>

            {/* 2. Email */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 700, marginBottom: '4px' }}>
                {language === 'en' ? 'Email Address:' : 'Alamat Email Aktif *'}
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="nama@email.com"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                required
                style={{ padding: '9px 12px', fontSize: '0.9rem' }}
              />
            </div>

            {/* 3. Password Field Setelah Email */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, marginBottom: '4px' }}>
                  {language === 'en' ? 'Password *' : 'Kata Sandi *'}
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Min. 6 karakter"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    minLength={6}
                    style={{ padding: '9px 36px 9px 12px', width: '100%', fontSize: '0.875rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      color: '#64748b'
                    }}
                    title={showRegisterPassword ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    {showRegisterPassword ? '👁️' : '🔒'}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 700, marginBottom: '4px' }}>
                  {language === 'en' ? 'Confirm Password *' : 'Ulangi Kata Sandi *'}
                </label>
                <input
                  type={showRegisterPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Ulangi kata sandi"
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  required
                  style={{ padding: '9px 12px', width: '100%', fontSize: '0.875rem' }}
                />
              </div>
            </div>

            {/* 4. Domisili / Wilayah Tutur (Sinkron dengan Daftar Desa dari Admin) */}
            <div className="form-group" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>
                  {language === 'en' ? 'Origin / Region:' : 'Asal Domisili / Desa Tutur *'}
                </label>
                <span style={{ fontSize: '0.7rem', color: '#0d9488', fontWeight: 600 }}>
                  ✓ Sinkron Data Wilayah Resmi
                </span>
              </div>
              <select
                className="form-select"
                value={registerOrigin}
                onChange={(e) => setRegisterOrigin(e.target.value)}
                style={{ padding: '9px 12px', fontSize: '0.875rem', width: '100%', background: '#ffffff' }}
              >
                {activeRegions.map(reg => (
                  <option key={reg.id} value={reg.name}>
                    {reg.name} — {reg.subdistrict} ({reg.isIndigenousArut ? '🌿 Adat Arut' : '🌐 Umum'})
                  </option>
                ))}
              </select>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Dikelola oleh Administrator Kedamangan Dayak Arut.
              </span>
            </div>

            {/* 5. Role / Peran Awal & Peruntukannya (Penjelasan Detail untuk Calon Pendaftar) */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 750, fontSize: '0.9rem', marginBottom: '6px' }}>
                🎯 Pilihan Peran Awal & Peruntukannya:
              </label>
              <p style={{ fontSize: '0.775rem', color: '#64748b', margin: '0 0 10px 0', lineHeight: 1.5 }}>
                Pilih peran yang paling sesuai dengan latar belakang dan tujuan Anda, agar fungsi kerja di portal tepat sasaran:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {REGISTRATION_ROLES.map(role => {
                  const isSelected = selectedRoleId === role.id;
                  return (
                    <div
                      key={role.id}
                      onClick={() => setSelectedRoleId(role.id)}
                      style={{
                        border: isSelected ? `2px solid ${role.badgeColor}` : '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '12px 14px',
                        background: isSelected ? '#f8fafc' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 2px 6px rgba(0,0,0,0.04)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="radio"
                            name="roleSelection"
                            checked={isSelected}
                            onChange={() => setSelectedRoleId(role.id)}
                            style={{ accentColor: role.badgeColor, cursor: 'pointer' }}
                          />
                          <strong style={{ fontSize: '0.875rem', color: isSelected ? '#0f172a' : '#334155' }}>
                            {role.name}
                          </strong>
                        </div>
                        <span style={{
                          fontSize: '0.675rem',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontWeight: 700,
                          background: isSelected ? role.badgeColor : '#f1f5f9',
                          color: isSelected ? '#ffffff' : '#64748b'
                        }}>
                          {role.badge}
                        </span>
                      </div>

                      {/* Peruntukan Untuk Siapa */}
                      <div style={{ fontSize: '0.775rem', color: role.badgeColor, fontWeight: 700, margin: '2px 0 4px 22px' }}>
                        👤 Peruntukan: <span style={{ fontWeight: 600, color: '#334155' }}>{role.audience}</span>
                      </div>

                      {/* Penjelasan Ringkas */}
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '22px', lineHeight: 1.5 }}>
                        {role.description}
                      </div>

                      {/* Fitur Akses Utama */}
                      {isSelected && (
                        <div style={{ marginLeft: '22px', marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed #e2e8f0', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {role.features.map((feat, idx) => (
                            <span key={idx} style={{ fontSize: '0.675rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '1px 6px', color: '#475569' }}>
                              ✓ {feat}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '8px', display: 'block' }}>
                💡 Catatan: Wewenang khusus Administrator atau Verifikator Tetua Adat dapat dinaikkan kapan saja oleh Superadmin Master setelah akun aktif.
              </span>
            </div>

            {/* 6. Motivasi / Catatan Singkat */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 700, marginBottom: '4px' }}>
                Motivasi / Pengalaman Budaya (Opsional):
              </label>
              <textarea
                rows={2}
                className="form-input"
                placeholder="Ceritakan singkat motivasi Anda (misal: penutur tutur riam, mahasiswa linguistik UPR, relawan Pangkut)..."
                value={registerMotivation}
                onChange={(e) => setRegisterMotivation(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px', marginTop: '4px', fontWeight: 700 }}>
              {language === 'en' ? 'Register Account' : 'Daftarkan Akun & Buka Portal →'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
