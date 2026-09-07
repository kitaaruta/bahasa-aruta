'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

export const Footer: React.FC = () => {
  const { t, language } = useLanguage();
  const pathname = usePathname();

  // Return null on /portal or /dashboard to provide full-viewport enterprise layout
  if (pathname && (pathname.startsWith('/portal') || pathname.startsWith('/dashboard'))) {
    return null;
  }

  return (
    <footer className="footer-wrap">
      <div className="container">
        <div className="footer-grid">
          {/* Brand & Mission */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div className="logo-symbol" style={{ width: '30px', height: '30px', fontSize: '0.85rem' }}>BA</div>
              <span style={{ fontWeight: 750, fontSize: '1.05rem', color: 'var(--text-primary)' }}>Basa Arut</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '400px', marginBottom: '12px' }}>
              {t('footer.desc')}
            </p>
            <div style={{ display: 'inline-block', padding: '3px 8px', background: 'var(--bg-subtle)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              🌿 {t('footer.initiative')}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
              {t('footer.features')}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li><Link href="/terjemahan" className="nav-link" style={{ padding: 0 }}>{t('nav.translate')}</Link></li>
              <li><Link href="/kamus" className="nav-link" style={{ padding: 0 }}>{t('nav.dictionary')}</Link></li>
              <li><Link href="/kontributor" className="nav-link" style={{ padding: 0 }}>{t('nav.contributors')}</Link></li>
              <li><Link href="/donasi" className="nav-link" style={{ padding: 0 }}>{t('nav.donate')}</Link></li>
              <li><Link href="/portal" className="nav-link" style={{ padding: 0 }}>{t('nav.portal')}</Link></li>
            </ul>
          </div>

          {/* Cultural & Region Info */}
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
              {t('footer.regions')}
            </h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '10px' }}>
              {t('footer.regionsDesc')}
            </p>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {language === 'en'
                ? 'Supported by indigenous elder councils, DAD, and volunteer youth preservers.'
                : 'Didukung oleh partisipasi tetua adat, dewan adat Dayak (DAD), dan relawan pemuda pelestari.'}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} <strong>Basa Arut</strong> • {language === 'en' ? 'Dayak Arut Indigenous Preservation' : 'Pelestarian Bahasa & Budaya Dayak Arut'}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span>{language === 'en' ? 'Open Cultural Archive' : 'Lisensi Terbuka Budaya Adat'}</span>
            <span>•</span>
            <span>v0.1</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
