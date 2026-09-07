'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { CONTRIBUTORS_DATA, Contributor } from '@/data/contributors';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

export default function KontributorPage() {
  const { t, language } = useLanguage();
  const { allUsers } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>('Semua');

  const roles = [
    'Semua',
    'Penutur Asli / Tetua Adat',
    'Pengumpul Kosakata',
    'Verifikator Linguistik',
    'Relawan Pemuda Pelestari',
    'Peneliti Kebudayaan'
  ];

  // Merge live platform users with baseline contributors
  const mergedContributors = useMemo(() => {
    const list: Contributor[] = [...CONTRIBUTORS_DATA];
    allUsers.forEach(u => {
      const existing = list.find(c => c.name.toLowerCase() === u.name.toLowerCase() || c.id === u.id);
      if (existing) {
        existing.wordsContributed = Math.max(existing.wordsContributed, u.wordsSubmittedCount);
        existing.wordsVerified = Math.max(existing.wordsVerified, u.wordsVerifiedCount);
        if (u.isVerified !== undefined) existing.isVerified = u.isVerified;
        if (u.verifiedByAdminName) existing.verifiedByAdminName = u.verifiedByAdminName;
      } else {
        list.push({
          id: u.id,
          name: u.name,
          role: u.roles.includes('verifier') ? 'Penutur Asli / Tetua Adat' : 'Pengumpul Kosakata',
          origin: u.origin || 'Kotawaringin Barat',
          avatar: u.avatar || u.name.substring(0, 2).toUpperCase(),
          bio: u.bio || `Relawan pelestari bahasa Dayak Arut asal ${u.origin || 'Kotawaringin Barat'}.`,
          wordsContributed: u.wordsSubmittedCount,
          wordsVerified: u.wordsVerifiedCount,
          badges: [u.badge || 'Kontributor'],
          joinedDate: '2026',
          isAdatElder: u.roles.includes('verifier'),
          isVerified: u.isVerified || false,
          verifiedByAdminName: u.verifiedByAdminName
        });
      }
    });
    return list;
  }, [allUsers]);

  const filteredContributors = selectedRole === 'Semua'
    ? mergedContributors
    : mergedContributors.filter(c => c.role === selectedRole);

  const totalContributed = mergedContributors.reduce((acc, c) => acc + c.wordsContributed, 0);
  const totalVerified = mergedContributors.reduce((acc, c) => acc + c.wordsVerified, 0);

  return (
    <div className="container" style={{ paddingBottom: '60px' }}>
      {/* Page Header */}
      <div style={{ margin: '28px 0 20px' }}>
        <div className="hero-tag" style={{ marginBottom: '8px' }}>
          {t('contrib.tag')}
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          {t('contrib.title')}
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '720px', marginTop: '4px' }}>
          {t('contrib.subtitle')}
        </p>
      </div>

      {/* Summary Highlight Box */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <div className="card-box" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {CONTRIBUTORS_DATA.length}
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {t('contrib.registered')}
          </div>
        </div>

        <div className="card-box" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {totalContributed}
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {t('contrib.wordsContributed')}
          </div>
        </div>

        <div className="card-box" style={{ padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {totalVerified}
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {t('contrib.wordsVerified')}
          </div>
        </div>

        <div className="card-box" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Link href="/masuk" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
            {t('contrib.joinBtn')}
          </Link>
        </div>
      </div>

      {/* Filter Roles */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '20px' }}>
        {roles.map((role) => (
          <button
            key={role}
            type="button"
            className={`category-pill ${selectedRole === role ? 'active' : ''}`}
            onClick={() => setSelectedRole(role)}
          >
            {role === 'Semua' ? (language === 'en' ? 'All Roles' : 'Semua') : role}
          </button>
        ))}
      </div>

      {/* Contributors Grid */}
      <div className="contributors-grid">
        {filteredContributors.map((c) => (
          <div key={c.id} className="contributor-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="contrib-header">
                <Link
                  href={`/profil?id=${c.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                  title={`Buka profil publik ${c.name}`}
                >
                  <div className="contrib-avatar" style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}>
                    {c.avatar}
                  </div>
                </Link>
                <div>
                  <Link
                    href={`/profil?id=${c.id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                    title={`Buka profil publik ${c.name}`}
                  >
                    <div className="contrib-name" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{c.name}</span>
                      {c.isVerified && (
                        <span
                          title={`Akun Terverifikasi Resmi (${c.verifiedByAdminName || 'Admin'})`}
                          style={{
                            background: '#dcfce7',
                            color: '#166534',
                            border: '1px solid #bbf7d0',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                            fontWeight: 800
                          }}
                        >
                          ✓
                        </span>
                      )}
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>↗</span>
                    </div>
                  </Link>
                  <div className="contrib-role">{c.role}</div>
                  <div className="contrib-origin">📍 {c.origin}</div>
                </div>
              </div>

              <p className="contrib-bio">{c.bio}</p>

              <div className="contrib-stats">
                <div>
                  <div className="contrib-stat-number">{c.wordsContributed}</div>
                  <div className="contrib-stat-label">{language === 'en' ? 'Submitted' : 'Kata Ditulis'}</div>
                </div>
                <div>
                  <div className="contrib-stat-number">
                    {c.wordsVerified}
                  </div>
                  <div className="contrib-stat-label">{language === 'en' ? 'Verified' : 'Terverifikasi'}</div>
                </div>
              </div>

              <div className="badge-row" style={{ marginBottom: '16px' }}>
                {c.badges.map((b) => (
                  <span key={b} className="badge-pill">
                    {b}
                  </span>
                ))}
              </div>
            </div>

            {/* Link Aksi Profil Publik */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', marginTop: 'auto' }}>
              <Link
                href={`/profil?id=${c.id}`}
                className="btn btn-outline btn-sm"
                style={{ width: '100%', justifyContent: 'center', fontSize: '0.78rem' }}
              >
                👤 {language === 'en' ? 'View Public Profile' : 'Lihat Profil Publik'} ➔
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Join Invitation Box */}
      <div className="card-box" style={{ marginTop: '36px', textAlign: 'center', padding: '28px 20px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 750, color: 'var(--text-primary)', marginBottom: '6px' }}>
          {t('contrib.callTitle')}
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '560px', margin: '0 auto 16px', lineHeight: 1.5 }}>
          {t('contrib.callDesc')}
        </p>
        <Link href="/masuk" className="btn btn-primary">
          {t('contrib.joinBtn')}
        </Link>
      </div>
    </div>
  );
}
