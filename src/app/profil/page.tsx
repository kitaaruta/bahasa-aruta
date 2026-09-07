'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth, getHighestRole, getRoleBorderColor, UserRole } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { CONTRIBUTORS_DATA } from '@/data/contributors';
import { DictionaryWord } from '@/data/arutDictionary';

interface ResolvedProfile {
  id: string;
  name: string;
  honorificTitle?: string;
  email?: string;
  roles: UserRole[];
  badge: string;
  origin: string;
  avatar: string;
  bio?: string;
  wordsContributed: number;
  wordsVerified: number;
  isAdatElder: boolean;
  isVerified: boolean;
  verifiedByAdminName?: string;
  verifiedAt?: string;
  badges: string[];
  isLiveUser: boolean;
}

function PublicProfileContent() {
  const searchParams = useSearchParams();
  const profileId = searchParams.get('id');
  const profileName = searchParams.get('name');

  const { user, allUsers, allDictionaryWords } = useAuth();
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'submitted' | 'verified'>('submitted');
  const [searchWordQuery, setSearchWordQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Audio player helper
  const handlePlayAudio = (wordId: string, url: string) => {
    try {
      const audio = new Audio(url);
      setPlayingAudioId(wordId);
      audio.play().catch(() => setPlayingAudioId(null));
      audio.onended = () => setPlayingAudioId(null);
      audio.onerror = () => setPlayingAudioId(null);
    } catch {
      setPlayingAudioId(null);
    }
  };

  // Unified list of all contributors and platform users
  const mergedContributorsList = useMemo(() => {
    const list = [...CONTRIBUTORS_DATA];
    allUsers.forEach((u) => {
      const existing = list.find(
        (c) => c.name.toLowerCase() === u.name.toLowerCase() || c.id === u.id
      );
      if (existing) {
        existing.wordsContributed = Math.max(existing.wordsContributed, u.wordsSubmittedCount);
        existing.wordsVerified = Math.max(existing.wordsVerified, u.wordsVerifiedCount);
        if (u.isVerified !== undefined) existing.isVerified = u.isVerified;
        if (u.verifiedByAdminName) existing.verifiedByAdminName = u.verifiedByAdminName;
      } else {
        list.push({
          id: u.id,
          name: u.name,
          role: u.roles.includes('verifier')
            ? 'Penutur Asli / Tetua Adat'
            : 'Pengumpul Kosakata',
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

  // Resolve which profile to display
  const currentProfile: ResolvedProfile = useMemo(() => {
    // 1. By Query ID
    if (profileId) {
      const foundUser = allUsers.find((u) => u.id === profileId);
      if (foundUser) {
        return {
          id: foundUser.id,
          name: foundUser.name,
          honorificTitle: foundUser.honorificTitle || '',
          email: foundUser.email,
          roles: foundUser.roles,
          badge: foundUser.badge,
          origin: foundUser.origin,
          avatar: foundUser.avatar,
          bio: foundUser.bio,
          wordsContributed: foundUser.wordsSubmittedCount,
          wordsVerified: foundUser.wordsVerifiedCount,
          isAdatElder: foundUser.roles.includes('verifier'),
          isVerified: foundUser.isVerified || false,
          verifiedByAdminName: foundUser.verifiedByAdminName,
          verifiedAt: foundUser.verifiedAt,
          badges: [foundUser.badge, foundUser.roles.includes('verifier') ? 'Tetua Adat' : 'Pelestari Arut'],
          isLiveUser: true,
        };
      }

      const foundContrib = CONTRIBUTORS_DATA.find((c) => c.id === profileId);
      if (foundContrib) {
        return {
          id: foundContrib.id,
          name: foundContrib.name,
          honorificTitle: foundContrib.role,
          roles: foundContrib.isAdatElder ? ['verifier', 'contributor'] : ['contributor'],
          badge: foundContrib.role,
          origin: foundContrib.origin,
          avatar: foundContrib.avatar,
          bio: foundContrib.bio,
          wordsContributed: foundContrib.wordsContributed,
          wordsVerified: foundContrib.wordsVerified,
          isAdatElder: !!foundContrib.isAdatElder,
          isVerified: foundContrib.isVerified !== undefined ? foundContrib.isVerified : !!foundContrib.isAdatElder,
          verifiedByAdminName: foundContrib.verifiedByAdminName || (foundContrib.isAdatElder ? 'Superadmin Master (TEN)' : undefined),
          verifiedAt: foundContrib.verifiedAt || 'Januari 2024',
          badges: foundContrib.badges,
          isLiveUser: false,
        };
      }
    }

    // 2. By Query Name
    if (profileName) {
      const q = profileName.toLowerCase().trim();
      const foundUser = allUsers.find((u) => u.name.toLowerCase().includes(q));
      if (foundUser) {
        return {
          id: foundUser.id,
          name: foundUser.name,
          honorificTitle: foundUser.honorificTitle || '',
          email: foundUser.email,
          roles: foundUser.roles,
          badge: foundUser.badge,
          origin: foundUser.origin,
          avatar: foundUser.avatar,
          bio: foundUser.bio,
          wordsContributed: foundUser.wordsSubmittedCount,
          wordsVerified: foundUser.wordsVerifiedCount,
          isAdatElder: foundUser.roles.includes('verifier'),
          isVerified: foundUser.isVerified || false,
          verifiedByAdminName: foundUser.verifiedByAdminName,
          verifiedAt: foundUser.verifiedAt,
          badges: [foundUser.badge],
          isLiveUser: true,
        };
      }
    }

    // 3. If visitor is logged in, default to their profile
    if (user) {
      return {
        id: user.id,
        name: user.name,
        honorificTitle: user.honorificTitle || '',
        email: user.email,
        roles: user.roles,
        badge: user.badge,
        origin: user.origin,
        avatar: user.avatar,
        bio: user.bio,
        wordsContributed: user.wordsSubmittedCount,
        wordsVerified: user.wordsVerifiedCount,
        isAdatElder: user.roles.includes('verifier'),
        isVerified: user.isVerified || false,
        verifiedByAdminName: user.verifiedByAdminName,
        verifiedAt: user.verifiedAt,
        badges: [user.badge, ...user.roles.map((r) => r.toUpperCase())],
        isLiveUser: true,
      };
    }

    // 4. Default: Senior Damang Adat Arut Utara
    const defaultElder = CONTRIBUTORS_DATA[0];
    return {
      id: defaultElder.id,
      name: defaultElder.name,
      honorificTitle: defaultElder.role,
      roles: ['verifier', 'contributor'],
      badge: defaultElder.role,
      origin: defaultElder.origin,
      avatar: defaultElder.avatar,
      bio: defaultElder.bio,
      wordsContributed: defaultElder.wordsContributed,
      wordsVerified: defaultElder.wordsVerified,
      isAdatElder: true,
      isVerified: true,
      verifiedByAdminName: 'Superadmin Master (TEN)',
      verifiedAt: '10 Januari 2024',
      badges: defaultElder.badges,
      isLiveUser: false,
    };
  }, [profileId, profileName, allUsers, user]);

  const isOwnProfile = user && currentProfile && (user.id === currentProfile.id || user.name.toLowerCase() === currentProfile.name.toLowerCase());
  const highestRole = currentProfile ? getHighestRole(currentProfile.roles || ['contributor']) : 'contributor';
  const highestRoleColor = getRoleBorderColor(highestRole);

  // Filter words published in dictionary
  const contributedWordsInDictionary = useMemo(() => {
    if (!currentProfile) return [];
    const profNameLower = currentProfile.name.toLowerCase();
    const profFirstName = profNameLower.split(' ')[0];

    return allDictionaryWords.filter((w) => {
      if (w.submitterName && (w.submitterName.toLowerCase() === profNameLower || w.submitterName.toLowerCase().includes(profFirstName))) {
        return true;
      }
      return false;
    });
  }, [currentProfile, allDictionaryWords]);

  const verifiedWordsInDictionary = useMemo(() => {
    if (!currentProfile) return [];
    const profNameLower = currentProfile.name.toLowerCase();
    const profFirstName = profNameLower.split(' ')[0];

    return allDictionaryWords.filter((w) => {
      if (w.verifiedByName && (w.verifiedByName.toLowerCase() === profNameLower || w.verifiedByName.toLowerCase().includes(profFirstName))) {
        return true;
      }
      return false;
    });
  }, [currentProfile, allDictionaryWords]);

  // Audio contribution count
  const audioContributionsCount = useMemo(() => {
    return contributedWordsInDictionary.filter(w => !!w.audioUrl).length;
  }, [contributedWordsInDictionary]);

  // Handle Share Profile
  const handleCopyShare = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/profil?id=${currentProfile.id}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  // Filtered list by search
  const displayedWords = useMemo(() => {
    const list = activeTab === 'submitted' ? contributedWordsInDictionary : verifiedWordsInDictionary;
    if (!searchWordQuery.trim()) return list;
    const q = searchWordQuery.toLowerCase().trim();
    return list.filter((w) =>
      w.wordArut.toLowerCase().includes(q) ||
      w.wordId.toLowerCase().includes(q) ||
      w.meaning.toLowerCase().includes(q)
    );
  }, [activeTab, contributedWordsInDictionary, verifiedWordsInDictionary, searchWordQuery]);

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Top Header Bar & Breadcrumb */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '14px 20px' }}>
        <div className="container" style={{ maxWidth: '1120px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
            <Link
              href="/kontributor"
              style={{ color: '#0d9488', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>←</span>
              <span>Daftar Kontributor</span>
            </Link>
            <span style={{ color: '#cbd5e1' }}>/</span>
            <span style={{ color: '#64748b' }}>Profil Publik</span>
            <span style={{ color: '#cbd5e1' }}>/</span>
            <span style={{ color: '#0f172a', fontWeight: 750 }}>{currentProfile.name}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={handleCopyShare}
              style={{
                background: copiedLink ? '#ecfdf5' : '#f1f5f9',
                color: copiedLink ? '#059669' : '#334155',
                border: `1px solid ${copiedLink ? '#a7f3d0' : '#cbd5e1'}`,
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{copiedLink ? '✓' : '🔗'}</span>
              <span>{copiedLink ? 'Tautan Tersalin!' : 'Bagikan Profil'}</span>
            </button>

            <Link
              href="/kamus"
              style={{
                background: '#ffffff',
                color: '#0f766e',
                border: '1px solid #99f6e4',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>📖</span>
              <span>Buka Kamus</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="container" style={{ maxWidth: '1120px', padding: '24px 16px' }}>
        {/* Banner if viewing own profile */}
        {isOwnProfile && (
          <div
            style={{
              background: '#f0fdf4',
              border: '1.5px solid #86efac',
              borderRadius: '10px',
              padding: '12px 18px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.2rem' }}>👁️</span>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 750, color: '#166534' }}>
                  Pratinjau Publik Profil Anda
                </div>
                <div style={{ fontSize: '0.775rem', color: '#15803d' }}>
                  Halaman ini menampilkan identitas dan kontribusi Anda kepada publik dan pengunjung kamus.
                </div>
              </div>
            </div>

            <Link
              href="/portal?area=akun"
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                padding: '7px 16px',
                background: '#059669',
                color: '#ffffff',
                borderRadius: '6px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>⚙️ Kelola My Akun di Portal</span>
              <span>➔</span>
            </Link>
          </div>
        )}

        {/* 2-COLUMN PROFILE LAYOUT */}
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: IDENTITY, VERIFICATION & CULTURAL INFO      */}
          {/* ======================================================== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Primary Profile Card */}
            <div style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
            }}>
              {/* Header motif backdrop */}
              <div style={{
                height: '88px',
                background: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0.15,
                  backgroundImage: `radial-gradient(circle at 12px 12px, #ffffff 1.5px, transparent 0)`,
                  backgroundSize: '16px 16px'
                }} />
              </div>

              {/* Avatar & Name Section */}
              <div style={{ padding: '0 20px 20px', marginTop: '-46px', textAlign: 'center' }}>
                {/* Avatar with Verified Checkmark overlay */}
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '12px' }}>
                  <div style={{
                    width: '92px',
                    height: '92px',
                    borderRadius: '50%',
                    background: '#f8fafc',
                    color: highestRoleColor,
                    border: '4px solid #ffffff',
                    boxShadow: `0 0 0 3px ${highestRoleColor}, 0 6px 16px rgba(0,0,0,0.12)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.2rem',
                    fontWeight: 800,
                    margin: '0 auto'
                  }}>
                    {currentProfile.avatar}
                  </div>

                  {/* Verified Checkmark Badge Icon */}
                  {currentProfile.isVerified && (
                    <div
                      title={`Akun Terverifikasi Resmi (${currentProfile.verifiedByAdminName || 'Admin'})`}
                      style={{
                        position: 'absolute',
                        bottom: '2px',
                        right: '2px',
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: '#059669',
                        color: '#ffffff',
                        border: '2.5px solid #ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.85rem',
                        fontWeight: 900,
                        boxShadow: '0 2px 6px rgba(5,150,105,0.4)'
                      }}
                    >
                      ✓
                    </div>
                  )}
                </div>

                {/* Name */}
                <h1 style={{ fontSize: '1.35rem', fontWeight: 850, color: '#0f172a', margin: '0 0 6px 0', lineHeight: 1.3 }}>
                  {currentProfile.name}
                </h1>

                {/* Honorific Title (Gelar Adat / Kehormatan) */}
                {currentProfile.honorificTitle && (
                  <div style={{ marginBottom: '10px' }}>
                    <span style={{
                      display: 'inline-block',
                      background: '#fef3c7',
                      color: '#92400e',
                      border: '1px solid #fde68a',
                      padding: '3px 12px',
                      borderRadius: '16px',
                      fontSize: '0.78rem',
                      fontWeight: 750
                    }}>
                      👑 {currentProfile.honorificTitle}
                    </span>
                  </div>
                )}

                {/* Origin / Village */}
                <div style={{ fontSize: '0.825rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '14px' }}>
                  <span>📍</span>
                  <span>{currentProfile.origin}</span>
                </div>

                {/* VERIFICATION BADGE & PROVENANCE BOX */}
                <div style={{
                  background: currentProfile.isVerified ? '#f0fdf4' : '#fffbeb',
                  border: `1px solid ${currentProfile.isVerified ? '#bbf7d0' : '#fde68a'}`,
                  borderRadius: '10px',
                  padding: '10px 14px',
                  textAlign: 'left',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '1rem' }}>{currentProfile.isVerified ? '🛡️' : '⏳'}</span>
                    <strong style={{
                      fontSize: '0.8rem',
                      color: currentProfile.isVerified ? '#166534' : '#92400e'
                    }}>
                      {currentProfile.isVerified ? 'Akun Terverifikasi Resmi' : 'Status: Menunggu Verifikasi'}
                    </strong>
                  </div>
                  {currentProfile.isVerified ? (
                    <div style={{ fontSize: '0.725rem', color: '#15803d', lineHeight: 1.45 }}>
                      <div>Tervalidasi oleh <strong>{currentProfile.verifiedByAdminName || 'Admin Operasional'}</strong>.</div>
                      {currentProfile.verifiedAt && (
                        <div style={{ color: '#16a34a', marginTop: '2px' }}>Tanggal sah: {currentProfile.verifiedAt}</div>
                      )}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.725rem', color: '#b45309', lineHeight: 1.45 }}>
                      Akun kontributor aktif. Dokumen penutur sedang dalam proses peninjauan admin.
                    </div>
                  )}
                </div>

                {/* Platform Roles */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', textAlign: 'left' }}>
                  <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                    Peran Aktif Sistem
                  </label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {currentProfile.roles.map((r) => (
                      <span
                        key={r}
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 750,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: r === 'superadmin' ? '#FEF3C7' : r === 'admin' ? '#CCFBF1' : r === 'verifier' ? '#EDE9FE' : '#D1FAE5',
                          color: r === 'superadmin' ? '#92400e' : r === 'admin' ? '#0f766e' : r === 'verifier' ? '#6b21a8' : '#047857',
                          border: `1px solid ${getRoleBorderColor(r)}40`,
                        }}
                      >
                        {r === 'superadmin' ? '👑 Superadmin' : r === 'admin' ? '🛡️ Admin' : r === 'verifier' ? '📜 Verifikator' : '🌿 Kontributor'}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Cultural Bio Quote */}
                {currentProfile.bio && (
                  <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '14px', paddingTop: '14px', textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                      Catatan / Biografi Penutur
                    </label>
                    <p style={{
                      margin: 0,
                      fontSize: '0.825rem',
                      color: '#475569',
                      lineHeight: 1.55,
                      fontStyle: 'italic',
                      background: '#f8fafc',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      borderLeft: `3px solid ${highestRoleColor}`
                    }}>
                      "{currentProfile.bio}"
                    </p>
                  </div>
                )}

                {/* Recognition Badges */}
                {currentProfile.badges && currentProfile.badges.length > 0 && (
                  <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '14px', paddingTop: '14px', textAlign: 'left' }}>
                    <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                      🎖️ Lencana Kehormatan
                    </label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {currentProfile.badges.map((b) => (
                        <span
                          key={b}
                          style={{
                            background: '#f1f5f9',
                            color: '#334155',
                            border: '1px solid #e2e8f0',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.72rem',
                            fontWeight: 650
                          }}
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Action Navigation Card */}
            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 750, color: '#0f172a', marginBottom: '10px' }}>
                🤝 Komunitas Pelestari Arut
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 12px 0' }}>
                Bergabunglah mendokumentasikan tuturan, riam sungai, dan pepatah tetua Dayak Arut agar lestari abadi.
              </p>
              <Link
                href="/kontributor"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                👥 Lihat Semua Kontributor ({mergedContributorsList.length})
              </Link>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: CONTRIBUTIONS, STATS & VOCABULARY SHOWCASE  */}
          {/* ======================================================== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Top 3 Metric Highlight Tiles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '18px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
              }}>
                <div style={{ fontSize: '0.775rem', fontWeight: 650, color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>✍️</span>
                  <span>Kosakata Disumbang</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 850, color: '#0f172a', marginTop: '4px' }}>
                  {currentProfile.wordsContributed || contributedWordsInDictionary.length}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                  Istilah Dayak Arut
                </div>
              </div>

              <div style={{
                background: '#ffffff',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '18px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
              }}>
                <div style={{ fontSize: '0.775rem', fontWeight: 650, color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🛡️</span>
                  <span>Lolos Uji Sah Adat</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 850, color: '#15803d', marginTop: '4px' }}>
                  {currentProfile.wordsVerified || verifiedWordsInDictionary.length}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#16a34a', marginTop: '2px' }}>
                  Terbit resmi di kamus
                </div>
              </div>

              <div style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                padding: '18px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
              }}>
                <div style={{ fontSize: '0.775rem', fontWeight: 650, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🎙️</span>
                  <span>Audio Lafal Penutur</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 850, color: '#0284c7', marginTop: '4px' }}>
                  {audioContributionsCount > 0 ? audioContributionsCount : 'Aktif'}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  Rekaman suara asli
                </div>
              </div>
            </div>

            {/* Main Showcase Section */}
            <div style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
            }}>
              {/* Header with Tabs and Search */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
                {/* Clean Tab Switcher */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('submitted')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 750,
                      cursor: 'pointer',
                      border: 'none',
                      background: activeTab === 'submitted' ? '#0d9488' : '#f1f5f9',
                      color: activeTab === 'submitted' ? '#ffffff' : '#475569',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    📚 Kosakata Kontribusi ({contributedWordsInDictionary.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('verified')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 750,
                      cursor: 'pointer',
                      border: 'none',
                      background: activeTab === 'verified' ? '#0d9488' : '#f1f5f9',
                      color: activeTab === 'verified' ? '#ffffff' : '#475569',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    🛡️ Telaah / Pengesahan ({verifiedWordsInDictionary.length})
                  </button>
                </div>

                {/* Search Bar */}
                <div style={{ maxWidth: '280px', width: '100%' }}>
                  <input
                    type="text"
                    placeholder="Cari kata dalam koleksi ini..."
                    value={searchWordQuery}
                    onChange={(e) => setSearchWordQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.825rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* VOCABULARY CARDS LIST */}
              {displayedWords.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                  {displayedWords.map((word) => (
                    <div
                      key={word.id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '18px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                        transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                      }}
                    >
                      <div>
                        {/* Word Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                          <div>
                            <strong style={{ fontSize: '1.25rem', color: '#0f766e' }}>{word.wordArut}</strong>
                            <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '8px' }}>/{word.phonetic}/</span>
                          </div>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: '#e0f2fe',
                            color: '#0369a1'
                          }}>
                            {word.category}
                          </span>
                        </div>

                        {/* Meaning / Indonesian */}
                        <div style={{ fontSize: '0.925rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                          = {word.wordId} {word.wordEn && word.wordEn !== word.wordId ? `• (${word.wordEn})` : ''}
                        </div>

                        {/* Description */}
                        <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.5, margin: '0 0 10px 0' }}>
                          {word.meaning}
                        </p>

                        {/* Native Speaker Voice Audio Player */}
                        {word.audioUrl && (
                          <div style={{ marginBottom: '10px' }}>
                            <button
                              type="button"
                              onClick={() => handlePlayAudio(word.id, word.audioUrl!)}
                              style={{
                                background: playingAudioId === word.id ? '#059669' : '#ecfdf5',
                                color: playingAudioId === word.id ? '#ffffff' : '#047857',
                                border: '1px solid #a7f3d0',
                                borderRadius: '20px',
                                padding: '4px 12px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              <span>{playingAudioId === word.id ? '🔊' : '🎙️'}</span>
                              <span>{playingAudioId === word.id ? 'Memutar Suara...' : 'Dengar Pelafalan Penutur Asli'}</span>
                            </button>
                          </div>
                        )}

                        {/* Example sentence */}
                        {word.exampleArut && (
                          <div style={{
                            background: '#f8fafc',
                            borderLeft: '3px solid #0d9488',
                            padding: '8px 12px',
                            borderRadius: '0 6px 6px 0',
                            fontSize: '0.8rem',
                            marginBottom: '10px'
                          }}>
                            <div style={{ fontWeight: 650, color: '#0f172a', fontStyle: 'italic' }}>"{word.exampleArut}"</div>
                            <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px' }}>{word.exampleId}</div>
                          </div>
                        )}

                        {/* Provenance note */}
                        {word.adminNotes && (
                          <div style={{
                            fontSize: '0.725rem',
                            color: '#0f766e',
                            background: '#f0fdfa',
                            border: '1px solid #ccfbf1',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            marginBottom: '10px',
                            lineHeight: 1.45
                          }}>
                            💬 <strong>Catatan Pengesahan Adat:</strong> {word.adminNotes}
                          </div>
                        )}
                      </div>

                      {/* Card Footer */}
                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.725rem', color: '#64748b' }}>
                          📍 Dialek: {word.dialect || 'Arut Utara'}
                        </span>

                        <Link
                          href={`/kamus?q=${encodeURIComponent(word.wordArut)}`}
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#0d9488',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          <span>Buka di Kamus</span>
                          <span>↗</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '48px 20px', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📖</div>
                  <div style={{ fontWeight: 750, color: '#1e293b', fontSize: '0.95rem' }}>
                    {searchWordQuery
                      ? 'Tidak ada kosakata yang cocok dengan pencarian Anda.'
                      : activeTab === 'submitted'
                      ? 'Kosakata kontributor ini sedang dalam proses verifikasi dan digitalisasi tetua adat.'
                      : 'Belum ada riwayat pengesahan yang dicatat untuk profil ini.'}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', maxWidth: '420px', margin: '4px auto 16px' }}>
                    Semua kosakata yang diajukan akan melalui kurasi kemurnian tutur Dayak Arut sebelum terbit ke kamus publik.
                  </p>
                  <Link
                    href="/kamus"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#0d9488',
                      color: '#ffffff',
                      padding: '8px 18px',
                      borderRadius: '8px',
                      fontSize: '0.825rem',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    <span>Jelajahi Kamus Publik Basa Arut</span>
                    <span>➔</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Other Contributors Showcase */}
            <div style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              padding: '20px 24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    👥 Penutur & Pegiat Dayak Arut Lainnya
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0 0' }}>
                    Kenali para tokoh adat, pemuda, dan relawan penyelamat tutur leluhur.
                  </p>
                </div>

                <Link href="/kontributor" style={{ fontSize: '0.8rem', fontWeight: 750, color: '#0d9488', textDecoration: 'none' }}>
                  Lihat Semua ➔
                </Link>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                {mergedContributorsList
                  .filter((c) => c.id !== currentProfile.id && c.name !== currentProfile.name)
                  .slice(0, 4)
                  .map((c) => (
                    <Link
                      key={c.id}
                      href={`/profil?id=${c.id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 14px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: '#ccfbf1',
                          color: '#0f766e',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          flexShrink: 0,
                          border: '1.5px solid #99f6e4'
                        }}
                      >
                        {c.avatar}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: 750, fontSize: '0.825rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>{c.name}</span>
                          {c.isVerified && <span style={{ color: '#059669', fontSize: '0.75rem' }}>✓</span>}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          📍 {c.origin}
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default function PublicProfilePage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
          <div style={{ textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>👤</div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>Memuat Profil Publik Basa Arut...</div>
          </div>
        </div>
      }
    >
      <PublicProfileContent />
    </Suspense>
  );
}
