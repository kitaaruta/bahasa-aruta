'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CONTRIBUTORS_DATA } from '@/data/contributors';
import { useLanguage } from '@/context/LanguageContext';

export default function KontributorPage() {
  const { t, language } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<string>('Semua');

  const roles = [
    'Semua',
    'Penutur Asli / Tetua Adat',
    'Pengumpul Kosakata',
    'Verifikator Linguistik',
    'Relawan Pemuda Pelestari',
    'Peneliti Kebudayaan'
  ];

  const filteredContributors = selectedRole === 'Semua'
    ? CONTRIBUTORS_DATA
    : CONTRIBUTORS_DATA.filter(c => c.role === selectedRole);

  const totalContributed = CONTRIBUTORS_DATA.reduce((acc, c) => acc + c.wordsContributed, 0);
  const totalVerified = CONTRIBUTORS_DATA.reduce((acc, c) => acc + c.wordsVerified, 0);

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
          <div key={c.id} className="contributor-card">
            <div className="contrib-header">
              <div className="contrib-avatar">{c.avatar}</div>
              <div>
                <div className="contrib-name">{c.name}</div>
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

            <div className="badge-row">
              {c.badges.map((b) => (
                <span key={b} className="badge-pill">
                  {b}
                </span>
              ))}
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
