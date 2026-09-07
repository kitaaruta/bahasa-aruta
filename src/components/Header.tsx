'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, getHighestRole, getRoleBorderColor } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { user, isLoggedIn, logout, hasRole } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const highestRole = user ? getHighestRole(user.roles) : 'contributor';
  const highestRoleColor = getRoleBorderColor(highestRole);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileMenuOpen]);

  const navItems = [
    { label: t('nav.translate'), href: '/terjemahan' },
    { label: t('nav.dictionary'), href: '/kamus' },
    { label: t('nav.contributors'), href: '/kontributor' },
    { label: t('nav.donate'), href: '/donasi' },
    { label: '🏛️ ' + t('nav.portal'), href: '/portal' },
  ];

  const closeMenu = () => setMobileMenuOpen(false);

  // Return null on /portal or /dashboard to provide full-viewport enterprise layout
  if (pathname && (pathname.startsWith('/portal') || pathname.startsWith('/dashboard'))) {
    return null;
  }

  return (
    <header className="header-wrapper">
      <div className="container header-container">
        {/* Brand Logo */}
        <Link href="/" className="logo-brand" onClick={closeMenu}>
          <div className="logo-symbol">
            <span>BA</span>
          </div>
          <div>
            <div className="logo-text-title">
              Basa Arut
            </div>
            <div className="logo-text-sub">{t('brand.subtitle')}</div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="nav-links">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions, Language Toggle, and Auth */}
        <div className="nav-actions">
          {/* Language Switcher */}
          <div className="lang-switcher-wrap" title="Ganti Bahasa / Switch Language">
            <button
              type="button"
              className={`lang-btn ${language === 'id' ? 'active' : ''}`}
              onClick={() => setLanguage('id')}
            >
              ID
            </button>
            <button
              type="button"
              className={`lang-btn ${language === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
            >
              EN
            </button>
          </div>

          {isLoggedIn && user ? (
            <div className="profile-dropdown-container" ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="avatar-role-btn"
                aria-label="Menu Profil Akun"
                title={`${user.name} (${highestRole.toUpperCase()})`}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: 'var(--bg-card)',
                  color: highestRoleColor,
                  border: `2.5px solid ${highestRoleColor}`,
                  boxShadow: highestRole === 'superadmin'
                    ? '0 0 0 2px rgba(245, 158, 11, 0.25), 0 2px 8px rgba(245, 158, 11, 0.3)'
                    : highestRole === 'admin'
                    ? '0 0 0 2px rgba(13, 148, 136, 0.2), 0 2px 6px rgba(13, 148, 136, 0.25)'
                    : highestRole === 'verifier'
                    ? '0 0 0 2px rgba(124, 58, 237, 0.2), 0 2px 6px rgba(124, 58, 237, 0.25)'
                    : '0 0 0 2px rgba(5, 150, 105, 0.2), 0 2px 6px rgba(5, 150, 105, 0.2)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  padding: 0
                }}
              >
                {user.avatar}
              </button>

              {/* Profile Mini Menu Dropdown */}
              {profileMenuOpen && (
                <div
                  className="profile-mini-dropdown"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '240px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
                    zIndex: 1000,
                    overflow: 'hidden',
                    animation: 'dropdownFade 0.15s ease-out'
                  }}
                >
                  {/* Header info in dropdown */}
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          border: `2px solid ${highestRoleColor}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          background: 'var(--bg-card)',
                          color: highestRoleColor,
                          flexShrink: 0
                        }}
                      >
                        {user.avatar}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 750, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user.email}
                        </div>
                      </div>
                    </div>
                    {/* Role Tags */}
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '10px' }}>
                      {user.roles.map(r => (
                        <span
                          key={r}
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: r === 'superadmin' ? '#FEF3C7' : r === 'admin' ? '#CCFBF1' : r === 'verifier' ? '#EDE9FE' : '#D1FAE5',
                            color: r === 'superadmin' ? '#92400E' : r === 'admin' ? '#115E59' : r === 'verifier' ? '#5B21B6' : '#065F46',
                            border: `1px solid ${getRoleBorderColor(r)}40`
                          }}
                        >
                          {r.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Dropdown Navigation Actions */}
                  <div style={{ padding: '6px' }}>
                    <Link
                      href="/portal"
                      onClick={() => setProfileMenuOpen(false)}
                      className="dropdown-item-link"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        textDecoration: 'none',
                        transition: 'background 0.15s'
                      }}
                    >
                      <span>🏛️</span>
                      <span>{language === 'en' ? 'Portal Console' : 'Konsol Portal'}</span>
                    </Link>

                    <Link
                      href="/portal?area=akun"
                      onClick={() => setProfileMenuOpen(false)}
                      className="dropdown-item-link"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        textDecoration: 'none',
                        transition: 'background 0.15s'
                      }}
                    >
                      <span>⚙️</span>
                      <span>{language === 'en' ? 'Manage My Account' : 'Kelola My Akun (Portal)'}</span>
                    </Link>

                    <Link
                      href="/profil"
                      onClick={() => setProfileMenuOpen(false)}
                      className="dropdown-item-link"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        textDecoration: 'none',
                        transition: 'background 0.15s'
                      }}
                    >
                      <span>🌐</span>
                      <span>{language === 'en' ? 'My Public Profile' : 'Profil Publik Saya'}</span>
                    </Link>

                    <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 6px' }} />

                    <div style={{ padding: '4px 12px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {language === 'en' ? 'Workspaces' : 'Portal Kerja'}
                    </div>

                    <Link
                      href="/portal?area=kontributor"
                      onClick={() => setProfileMenuOpen(false)}
                      className="dropdown-item-link"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.825rem',
                        fontWeight: 600,
                        color: '#059669',
                        textDecoration: 'none',
                        transition: 'background 0.15s'
                      }}
                    >
                      <span>🌿</span>
                      <span>{language === 'en' ? 'Contributor Area' : 'Area Kontributor'}</span>
                    </Link>

                    {(hasRole('verifier') || hasRole('admin') || hasRole('superadmin')) && (
                      <Link
                        href="/portal?area=verifikator"
                        onClick={() => setProfileMenuOpen(false)}
                        className="dropdown-item-link"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.825rem',
                          fontWeight: 600,
                          color: '#6D28D9',
                          textDecoration: 'none',
                          transition: 'background 0.15s'
                        }}
                      >
                        <span>📜</span>
                        <span>{language === 'en' ? 'Verifier Area' : 'Area Verifikator'}</span>
                      </Link>
                    )}

                    {(hasRole('admin') || hasRole('superadmin')) && (
                      <Link
                        href="/portal?area=admin"
                        onClick={() => setProfileMenuOpen(false)}
                        className="dropdown-item-link"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.825rem',
                          fontWeight: 600,
                          color: '#0F766E',
                          textDecoration: 'none',
                          transition: 'background 0.15s'
                        }}
                      >
                        <span>🛡️</span>
                        <span>{language === 'en' ? 'Admin Area' : 'Area Admin'}</span>
                      </Link>
                    )}

                    {hasRole('superadmin') && (
                      <Link
                        href="/portal?area=superadmin"
                        onClick={() => setProfileMenuOpen(false)}
                        className="dropdown-item-link"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.825rem',
                          fontWeight: 600,
                          color: '#B45309',
                          textDecoration: 'none',
                          transition: 'background 0.15s'
                        }}
                      >
                        <span>👑</span>
                        <span>{language === 'en' ? 'Superadmin Area' : 'Area Superadmin'}</span>
                      </Link>
                    )}

                    <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 6px' }} />

                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        logout();
                      }}
                      className="dropdown-item-btn"
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#DC2626',
                        background: 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'background 0.15s'
                      }}
                    >
                      <span>🚪</span>
                      <span>{language === 'en' ? 'Sign Out / Logout' : 'Keluar / Logout'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/masuk" className="btn btn-primary btn-sm">
              <span>{t('nav.auth')}</span>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu-drawer">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className={`nav-link ${isActive ? 'active' : ''}`}
                style={{ padding: '10px 14px', fontSize: '0.95rem' }}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
          {isLoggedIn ? (
            <div style={{ marginTop: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
              <Link
                href="/portal?area=akun"
                onClick={closeMenu}
                className="nav-link"
                style={{ padding: '10px 14px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <span>⚙️</span>
                <span>{language === 'en' ? 'Manage My Account' : 'Kelola My Akun (Portal)'}</span>
              </Link>
              <Link
                href="/profil"
                onClick={closeMenu}
                className="nav-link"
                style={{ padding: '10px 14px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <span>🌐</span>
                <span>{language === 'en' ? 'My Public Profile' : 'Profil Publik Saya'}</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  logout();
                }}
                className="btn btn-outline"
                style={{ marginTop: '6px', width: '100%', color: '#DC2626', borderColor: '#FECACA' }}
              >
                🚪 {language === 'en' ? 'Sign Out / Logout' : 'Keluar / Logout'}
              </button>
            </div>
          ) : (
            <Link
              href="/masuk"
              onClick={closeMenu}
              className="btn btn-primary"
              style={{ marginTop: '8px', width: '100%' }}
            >
              {t('nav.auth')}
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
