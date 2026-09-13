'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { ArutaSsoButton } from '@/components/ArutaSsoButton';
import { OnboardingModal } from '@/components/OnboardingModal';

export default function MasukPage() {
  const router = useRouter();
  const { user, isLoggedIn, loginWithArutaSession, completeOnboarding, logout, regions } = useAuth();
  const { language } = useLanguage();

  // Aruta SSO & Onboarding States
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [pendingSsoUser, setPendingSsoUser] = useState<any>(null);
  const [ssoSuspendedMessage, setSsoSuspendedMessage] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Active regions list from Admin
  const activeRegions = regions && regions.length > 0
    ? regions.filter((r) => r.status === 'active')
    : [];

  const handleSsoSuccess = (ssoUser: any, needsOnboarding: boolean) => {
    loginWithArutaSession(ssoUser);
    setGeneralError(null);
    setSsoSuspendedMessage(null);

    // Jika akun baru belum melengkapi data desa tutur di Bahasa Aruta
    if (needsOnboarding || !ssoUser.origin) {
      setPendingSsoUser(ssoUser);
      setShowOnboarding(true);
    } else {
      router.push('/portal');
    }
  };

  const handleSsoError = (err: string) => {
    if (err.toLowerCase().includes('ditangguhkan') || err.toLowerCase().includes('suspended')) {
      setSsoSuspendedMessage(
        'Akun Anda sedang ditangguhkan oleh Administrator Aruta SSO. Akses otentikasi ditolak.'
      );
    } else {
      setGeneralError(err);
    }
  };

  // Tampilan jika pengguna telah memiliki sesi aktif
  if (isLoggedIn && user) {
    return (
      <div className="container" style={{ padding: '60px 20px', maxWidth: '520px' }}>
        <div className="card-box" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #0F766E 0%, #065F46 100%)',
              color: '#FFFFFF',
              boxShadow: '0 8px 16px rgba(15, 118, 110, 0.25)',
              overflow: 'hidden',
            }}
          >
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              user.avatar
            )}
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(13, 148, 136, 0.12)',
              color: '#0F766E',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '8px',
            }}
          >
            ✓ Terhubung Aruta SSO
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>
            {user.name}
          </h2>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            {user.email}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            📍 {user.origin || 'Asal tutur belum disetel'}
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '6px',
              flexWrap: 'wrap',
              marginBottom: '24px',
            }}
          >
            {user.roles.map((r) => (
              <span
                key={r}
                className="badge"
                style={{
                  background: r === 'superadmin' ? '#FEF3C7' : r === 'admin' ? '#CCFBF1' : '#E0F2FE',
                  color: r === 'superadmin' ? '#92400E' : r === 'admin' ? '#115E59' : '#0369A1',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  padding: '4px 10px',
                  borderRadius: '6px',
                }}
              >
                {r.toUpperCase()}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link href="/portal" className="btn btn-primary" style={{ padding: '12px', fontWeight: 750 }}>
              {language === 'en' ? 'Open Portal Console →' : 'Buka Konsol Portal Bahasa →'}
            </Link>
            <button
              type="button"
              onClick={logout}
              className="btn btn-outline"
              style={{ padding: '10px', fontSize: '0.875rem' }}
            >
              {language === 'en' ? 'Sign Out from Aruta SSO' : 'Keluar Sesi Akun'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Tampilan halaman login utama via Aruta SSO
  return (
    <div className="container" style={{ padding: '48px 16px 72px', maxWidth: '580px' }}>
      {/* Header Halaman */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div
          className="logo-symbol"
          style={{
            margin: '0 auto 12px',
            width: '46px',
            height: '46px',
            fontSize: '1.25rem',
          }}
        >
          BA
        </div>
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 850,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin: '0 0 6px',
          }}
        >
          {language === 'en' ? 'Basa Arut Authentication' : 'Autentikasi Basa Arut'}
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
          {language === 'en'
            ? 'Access contributor and management consoles via centralized Aruta SSO'
            : 'Pusat otentikasi tunggal ekosistem digital Aruta.id untuk pelestarian bahasa Dayak Arut'}
        </p>
      </div>

      {/* Kartu Utama Aruta SSO */}
      <div
        className="card-box"
        style={{
          padding: '32px 28px',
          borderRadius: '20px',
          boxShadow: '0 12px 35px -8px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* Banner Badge */}
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(13, 148, 136, 0.1)',
              color: '#0F766E',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '6px 14px',
              borderRadius: '24px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L4 5.5V11.5C4 16.5 7.5 21.2 12 22.5C16.5 21.2 20 16.5 20 11.5V5.5L12 2Z" />
            </svg>
            Aruta Single Sign-On (SSO)
          </div>
        </div>

        {/* Notifikasi Akun Ditangguhkan */}
        {ssoSuspendedMessage && (
          <div
            style={{
              marginBottom: '20px',
              padding: '14px 16px',
              borderRadius: '12px',
              background: '#FEF2F2',
              border: '1.5px solid #EF4444',
              color: '#991B1B',
              fontSize: '0.875rem',
              lineHeight: 1.5,
              textAlign: 'left',
            }}
          >
            <div style={{ fontWeight: 750, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🚫</span>
              <span>Akses Masuk Ditolak</span>
            </div>
            <p style={{ margin: '6px 0 0', fontSize: '0.825rem' }}>{ssoSuspendedMessage}</p>
            <div style={{ marginTop: '8px', fontSize: '0.78rem' }}>
              Silakan hubungi tim administrator di{' '}
              <a
                href="https://accounts.aruta.id"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#B91C1C', textDecoration: 'underline', fontWeight: 700 }}
              >
                accounts.aruta.id
              </a>{' '}
              untuk memulihkan status keaktifan akun Anda.
            </div>
          </div>
        )}

        {/* Notifikasi Kesalahan Umum */}
        {generalError && (
          <div
            style={{
              marginBottom: '20px',
              padding: '12px 14px',
              borderRadius: '10px',
              background: '#FFFBEB',
              border: '1px solid #F59E0B',
              color: '#92400E',
              fontSize: '0.85rem',
              lineHeight: 1.5,
            }}
          >
            ⚠️ {generalError}
          </div>
        )}

        {/* Informasi Utama & Tombol SSO */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: '0 0 8px',
            }}
          >
            {language === 'en' ? 'Sign In or Create Account' : 'Masuk atau Daftar Akun Baru'}
          </h2>
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              margin: '0 auto 20px',
              maxWidth: '440px',
            }}
          >
            {language === 'en'
              ? 'Login and registration are fully managed through Aruta SSO. One single account connects you to all Aruta.id platforms.'
              : 'Seluruh proses login maupun pendaftaran akun baru dikelola secara terpusat melalui Aruta SSO. Anda cukup memiliki satu akun untuk terhubung ke seluruh platform Aruta.id.'}
          </p>

          {/* Tombol Masuk/Daftar dengan Akun Aruta */}
          <ArutaSsoButton
            onSuccess={handleSsoSuccess}
            onError={handleSsoError}
            label={language === 'en' ? 'Sign In / Register with Aruta Account' : 'Masuk/Daftar Akun Aruta'}
            style={{ padding: '14px 22px', fontSize: '1rem' }}
          />
        </div>

        {/* Poin Keuntungan SSO */}
        <div
          style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>🛡️</span>
            <div>
              <div style={{ fontSize: '0.825rem', fontWeight: 750, color: 'var(--text-primary)' }}>
                Identitas Tunggal Aman & Terenkripsi
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Aplikasi ini tidak menyimpan kata sandi Anda. Seluruh otentikasi dijamin oleh Aruta Identity Provider.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>🌱</span>
            <div>
              <div style={{ fontSize: '0.825rem', fontWeight: 750, color: 'var(--text-primary)' }}>
                Onboarding Otomatis Kontributor Bahasa
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Setelah akun Aruta Anda terhubung, Anda dapat melengkapi asal desa penutur untuk mulai mengusulkan kosakata Dayak Arut.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>🌐</span>
            <div>
              <div style={{ fontSize: '0.825rem', fontWeight: 750, color: 'var(--text-primary)' }}>
                Sinkronisasi Lintas Ekosistem Aruta.id
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Satu profil untuk portal bahasa, riset kebudayaan, data geospasial, dan repositori komunitas.
              </div>
            </div>
          </div>
        </div>

        {/* Bantuan Pembuatan Akun Baru */}
        <div
          style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px dashed var(--border-color)',
            textAlign: 'center',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
          }}
        >
          Belum memiliki akun Aruta? Klik tombol di atas, lalu pilih opsi{' '}
          <strong style={{ color: '#0F766E' }}>"Daftar Akun Baru"</strong> di jendela otentikasi Aruta SSO.
        </div>
      </div>

      {/* Modal Onboarding Kontributor (Tampil otomatis saat akun baru selesai login) */}
      <OnboardingModal
        isOpen={showOnboarding}
        user={pendingSsoUser}
        regions={activeRegions}
        onComplete={(updatedUser) => {
          completeOnboarding(updatedUser);
          setShowOnboarding(false);
          router.push('/portal');
        }}
      />
    </div>
  );
}
