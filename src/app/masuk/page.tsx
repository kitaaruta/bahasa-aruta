'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function MasukPage() {
  const router = useRouter();
  const { user, isLoggedIn, login, loginDemo, register, logout } = useAuth();
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerOrigin, setRegisterOrigin] = useState('Kelurahan Pangkut');
  const [registerRole, setRegisterRole] = useState('Pengumpul Kosakata');
  const [registerMotivation, setRegisterMotivation] = useState('');
  const [alertMsg, setAlertMsg] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setAlertMsg(language === 'en' ? 'Please enter your email address.' : 'Silakan masukkan alamat email.');
      return;
    }
    login(loginEmail);
    router.push('/area-kontributor');
  };

  const handleDemoClick = (role: 'superadmin' | 'admin' | 'elder' | 'volunteer') => {
    loginDemo(role);
    router.push('/area-kontributor');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName.trim() || !registerEmail.trim()) {
      setAlertMsg(language === 'en' ? 'Name and email are required.' : 'Nama dan email wajib diisi.');
      return;
    }
    register({
      name: registerName,
      email: registerEmail,
      origin: registerOrigin,
      role: registerRole,
      motivation: registerMotivation
    });
    router.push('/area-kontributor');
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
            <Link href="/area-kontributor" className="btn btn-primary">
              {language === 'en' ? 'Open Workspace / Admin Panel' : 'Masuk ke Area Kerja / Panel Admin'}
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
    <div className="container" style={{ padding: '40px 16px 60px', maxWidth: '540px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div className="logo-symbol" style={{ margin: '0 auto 10px', width: '40px', height: '40px', fontSize: '1.1rem' }}>
          BA
        </div>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          {language === 'en' ? 'Platform Authentication' : 'Akses Platform Basa Arut'}
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          {language === 'en'
            ? 'Access your contributor, elder verifier, admin, or master superadmin console'
            : 'Pilih peran untuk menguji fungsi kontributor, verifikator adat, admin, atau superadmin'}
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
            padding: '8px',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 650,
            fontSize: '0.85rem',
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
            padding: '8px',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 650,
            fontSize: '0.85rem',
            cursor: 'pointer',
            background: activeTab === 'register' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'register' ? 'var(--text-primary)' : 'var(--text-muted)',
            boxShadow: activeTab === 'register' ? 'var(--shadow-sm)' : 'none'
          }}
        >
          {language === 'en' ? 'Register' : 'Daftar Baru'}
        </button>
      </div>

      {/* Form Container */}
      <div className="card-box">
        {alertMsg && (
          <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.825rem', marginBottom: '14px' }}>
            {alertMsg}
          </div>
        )}

        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label">{language === 'en' ? 'Account Email:' : 'Alamat Email Terdaftar:'}</label>
              <input
                type="email"
                className="form-input"
                placeholder="superadmin@aruta.id / admin@aruta.id"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '6px' }}>
              {language === 'en' ? 'Sign In' : 'Masuk ke Platform'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label className="form-label">{language === 'en' ? 'Full Name:' : 'Nama Lengkap:'}</label>
              <input
                type="text"
                className="form-input"
                placeholder="Contoh: Rian Rangkap"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email:</label>
              <input
                type="email"
                className="form-input"
                placeholder="nama@email.com"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{language === 'en' ? 'Origin / Region:' : 'Domisili Wilayah Tutur:'}</label>
              <select
                className="form-select"
                value={registerOrigin}
                onChange={(e) => setRegisterOrigin(e.target.value)}
              >
                <option value="Kelurahan Pangkut">Kelurahan Pangkut (Arut Utara)</option>
                <option value="Desa Sambi">Desa Sambi (Arut Utara)</option>
                <option value="Desa Gandis">Desa Gandis (Arut Utara)</option>
                <option value="Desa Pandau">Desa Pandau (Arut Utara)</option>
                <option value="Kelurahan Mendawai">Kelurahan Mendawai (Pangkalan Bun)</option>
                <option value="Sukamandang">Sukamandang</option>
                <option value="Luar Daerah / Internasional">Luar Daerah / Diaspora Internasional</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{language === 'en' ? 'Initial Role Preference:' : 'Peminatan Peran Awal:'}</label>
              <select
                className="form-select"
                value={registerRole}
                onChange={(e) => setRegisterRole(e.target.value)}
              >
                <option value="Pengumpul Kosakata">Pengumpul Kosakata (Contributor)</option>
                <option value="Relawan Pemuda Pelestari">Relawan Pemuda (Contributor)</option>
                <option value="Penutur Asli / Tetua Adat">Penutur Asli / Tetua Adat (Verifier Candidate)</option>
              </select>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                Peran Admin & Verifikator dapat diberikan kemudian oleh Superadmin.
              </span>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '6px' }}>
              {language === 'en' ? 'Register Account' : 'Daftar Akun Baru'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
