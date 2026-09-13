'use client';

import React, { useState } from 'react';
import { INITIAL_REGIONS, RegionVillage } from '@/context/AuthContext';

interface OnboardingModalProps {
  isOpen: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  } | null;
  onComplete: (updatedUser: any) => void;
  regions?: RegionVillage[];
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  user,
  onComplete,
  regions = INITIAL_REGIONS,
}) => {
  const [selectedOrigin, setSelectedOrigin] = useState('Kelurahan Pangkut');
  const [honorificTitle, setHonorificTitle] = useState('');
  const [roleChoice, setRoleChoice] = useState('contributor');
  const [bio, setBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrigin) {
      setErrorMsg('Harap pilih desa atau wilayah asal tutur Anda.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: selectedOrigin,
          honorificTitle,
          bio,
          roleChoice,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal menyimpan profil onboarding.');
      }

      onComplete(data.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        style={{
          background: 'var(--bg-card, #FFFFFF)',
          color: 'var(--text-primary, #0F172A)',
          borderRadius: '20px',
          maxWidth: '560px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border-color, #E2E8F0)',
          overflow: 'hidden',
        }}
      >
        {/* Header Onboarding */}
        <div
          style={{
            padding: '24px 28px 20px',
            background: 'linear-gradient(135deg, #0F766E 0%, #065F46 100%)',
            color: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                Selamat Datang di Basa Arut!
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.825rem', opacity: 0.9 }}>
                Akun Aruta SSO Anda: <strong>{user.name}</strong> ({user.email})
              </p>
            </div>
          </div>
          <p style={{ margin: '10px 0 0', fontSize: '0.85rem', lineHeight: 1.5, opacity: 0.92 }}>
            Satu langkah lagi untuk melengkapi profil kontributor pelestarian bahasa Dayak Arut.
          </p>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px 28px' }}>
          {errorMsg && (
            <div
              style={{
                marginBottom: '16px',
                padding: '10px 14px',
                borderRadius: '8px',
                background: '#FEF2F2',
                border: '1px solid #F87171',
                color: '#991B1B',
                fontSize: '0.85rem',
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* Wilayah / Desa Asal */}
          <div style={{ marginBottom: '18px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 700,
                marginBottom: '6px',
                color: 'var(--text-primary, #0F172A)',
              }}
            >
              Wilayah / Desa Asal Penutur <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <p style={{ margin: '0 0 8px', fontSize: '0.775rem', color: 'var(--text-muted, #64748B)' }}>
              Digunakan untuk pengelompokan dialek leksikon dan verifikasi kearifan tutur lokal.
            </p>
            <select
              value={selectedOrigin}
              onChange={(e) => setSelectedOrigin(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1.5px solid var(--border-color, #CBD5E1)',
                background: 'var(--bg-card, #FFFFFF)',
                color: 'var(--text-primary, #0F172A)',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            >
              {regions.map((reg) => (
                <option key={reg.id} value={reg.name}>
                  {reg.name} ({reg.subdistrict})
                </option>
              ))}
            </select>
          </div>

          {/* Pilihan Fokus Kontribusi */}
          <div style={{ marginBottom: '18px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 700,
                marginBottom: '6px',
                color: 'var(--text-primary, #0F172A)',
              }}
            >
              Fokus Peran di Platform
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setRoleChoice('contributor')}
                style={{
                  textAlign: 'left',
                  padding: '12px',
                  borderRadius: '10px',
                  border: roleChoice === 'contributor' ? '2px solid #0D9488' : '1.5px solid var(--border-color, #CBD5E1)',
                  background: roleChoice === 'contributor' ? 'rgba(13, 148, 136, 0.08)' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0F766E' }}>
                  🌿 Relawan Penutur
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748B)', marginTop: '2px' }}>
                  Mengusulkan kata & ejaan lisan
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRoleChoice('verifier')}
                style={{
                  textAlign: 'left',
                  padding: '12px',
                  borderRadius: '10px',
                  border: roleChoice === 'verifier' ? '2px solid #7C3AED' : '1.5px solid var(--border-color, #CBD5E1)',
                  background: roleChoice === 'verifier' ? 'rgba(124, 58, 237, 0.08)' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#7C3AED' }}>
                  📜 Calon Verifikator Adat
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748B)', marginTop: '2px' }}>
                  Damang / Mantir / Sesepuh
                </div>
              </button>
            </div>
          </div>

          {/* Gelar Adat / Honorific (Opsional) */}
          <div style={{ marginBottom: '18px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 700,
                marginBottom: '6px',
                color: 'var(--text-primary, #0F172A)',
              }}
            >
              Gelar / Panggilan Adat <span style={{ fontWeight: 400, color: 'var(--text-muted, #64748B)' }}>(Opsional)</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Mantir Adat, Damang Kepala Adat, Relawan Muda..."
              value={honorificTitle}
              onChange={(e) => setHonorificTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1.5px solid var(--border-color, #CBD5E1)',
                background: 'var(--bg-card, #FFFFFF)',
                color: 'var(--text-primary, #0F172A)',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Motivasi / Bio Singkat */}
          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 700,
                marginBottom: '6px',
                color: 'var(--text-primary, #0F172A)',
              }}
            >
              Latar Belakang / Motivasi Pelestarian <span style={{ fontWeight: 400, color: 'var(--text-muted, #64748B)' }}>(Opsional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Ceritakan minat Anda dalam mendokumentasikan tutur Dayak Arut..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1.5px solid var(--border-color, #CBD5E1)',
                background: 'var(--bg-card, #FFFFFF)',
                color: 'var(--text-primary, #0F172A)',
                fontSize: '0.875rem',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Tombol Simpan */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #0F766E 0%, #065F46 100%)',
              color: '#FFFFFF',
              fontSize: '0.95rem',
              fontWeight: 750,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {isSubmitting ? (
              <span>Menyimpan Profil...</span>
            ) : (
              <span>Lengkapi Profil & Masuk ke Portal →</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
