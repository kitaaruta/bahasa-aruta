'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { DictionaryWord, ARUT_DICTIONARY } from '@/data/arutDictionary';
import { kvService } from '@/services/kvService';

export type UserRole = 'superadmin' | 'admin' | 'verifier' | 'contributor' | 'supporter';

export interface ContributorUser {
  id: string;
  name: string;
  honorificTitle?: string;
  villageId?: string;
  email: string;
  roles: UserRole[]; // One account can have multiple roles
  primaryRole: UserRole;
  origin: string;
  avatar: string;
  picture?: string;
  bio?: string;
  badge: string;
  wordsSubmittedCount: number;
  wordsVerifiedCount: number;
  isVerified?: boolean;
  verifiedByAdminName?: string;
  verifiedAt?: string;
  verifiedByRole?: UserRole;
  isOnboarded?: boolean;
  username?: string;
  status?: string;
}

export const getHighestRole = (roles: UserRole[] = []): UserRole => {
  if (roles.includes('superadmin')) return 'superadmin';
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('verifier')) return 'verifier';
  return 'contributor';
};

export const getRoleLevel = (role: UserRole): number => {
  switch (role) {
    case 'superadmin':
      return 4;
    case 'admin':
      return 3;
    case 'verifier':
      return 2;
    case 'contributor':
      return 1;
    case 'supporter':
    default:
      return 0;
  }
};

export const getUserHighestRoleLevel = (roles: UserRole[] = []): number => {
  if (!roles || roles.length === 0) return 1;
  return Math.max(...roles.map(getRoleLevel));
};

/**
 * Business Rule:
 * 1. Admin can verify accounts with roles strictly below admin (verifier, contributor, supporter).
 * 2. Role admin can ONLY be verified by Superadmin.
 * 3. Superadmin cannot be verified by other users.
 */
export const canVerifyTargetUser = (
  actorRoles: UserRole[] = [],
  targetRoles: UserRole[] = []
): { canVerify: boolean; reason?: string } => {
  const isSuperadmin = actorRoles.includes('superadmin');
  const isAdmin = actorRoles.includes('admin');

  if (!isSuperadmin && !isAdmin) {
    return { canVerify: false, reason: 'Hanya Admin atau Superadmin yang memiliki hak verifikasi akun.' };
  }

  const targetHasSuperadmin = targetRoles.includes('superadmin');
  const targetHasAdmin = targetRoles.includes('admin');

  if (targetHasSuperadmin) {
    return { canVerify: false, reason: 'Akun Superadmin adalah pengelola sistem tertinggi dan tidak dapat diverifikasi pihak lain.' };
  }

  if (targetHasAdmin) {
    if (isSuperadmin) {
      return { canVerify: true };
    }
    return { canVerify: false, reason: 'Akun dengan role Admin hanya bisa diverifikasi oleh Superadmin.' };
  }

  // Target role is below admin (verifier, contributor, etc.) -> both admin and superadmin can verify
  return { canVerify: true };
};

export const getRoleBorderColor = (role: UserRole): string => {
  switch (role) {
    case 'superadmin':
      return '#F59E0B'; // Gold Amber
    case 'admin':
      return '#0D9488'; // Deep Teal
    case 'verifier':
      return '#7C3AED'; // Royal Purple
    case 'contributor':
    default:
      return '#059669'; // Emerald Forest
  }
};

export interface ModeratedWordEntry extends DictionaryWord {
  submitterName: string;
  submitterRole: string;
  status: 'approved' | 'pending' | 'rejected' | 'revision';
  submittedAt: string;
  adminNotes?: string;
  verificationNote?: string;
  verifiedAt?: string;
  verifiedByName?: string;
  verifiedByVerifierName?: string;
}

export interface RegionVillage {
  id: string;
  name: string;
  subdistrict: string;
  regency: string;
  description: string;
  isIndigenousArut: boolean;
  status: 'active' | 'archived';
  createdAt: string;
}

export const INITIAL_REGIONS: RegionVillage[] = [
  {
    id: 'reg-01',
    name: 'Kelurahan Pangkut',
    subdistrict: 'Kecamatan Arut Utara',
    regency: 'Kabupaten Kotawaringin Barat',
    description: 'Pusat pemerintahan kecamatan dan kedamangan adat Dayak Arut.',
    isIndigenousArut: true,
    status: 'active',
    createdAt: '2026-01-01'
  },
  {
    id: 'reg-02',
    name: 'Desa Sambi',
    subdistrict: 'Kecamatan Arut Utara',
    regency: 'Kabupaten Kotawaringin Barat',
    description: 'Wilayah penutur hulu Sungai Arut dengan leksikon tradisional yang kaya.',
    isIndigenousArut: true,
    status: 'active',
    createdAt: '2026-01-01'
  },
  {
    id: 'reg-03',
    name: 'Desa Gandis',
    subdistrict: 'Kecamatan Arut Utara',
    regency: 'Kabupaten Kotawaringin Barat',
    description: 'Komunitas adat Arut hilir dengan kekhasan tutur dialek sungai.',
    isIndigenousArut: true,
    status: 'active',
    createdAt: '2026-01-01'
  },
  {
    id: 'reg-04',
    name: 'Desa Kerabu',
    subdistrict: 'Kecamatan Arut Utara',
    regency: 'Kabupaten Kotawaringin Barat',
    description: 'Komunitas adat Dayak Arut dengan tradisi lisan rimba dan perladangan.',
    isIndigenousArut: true,
    status: 'active',
    createdAt: '2026-01-01'
  },
  {
    id: 'reg-05',
    name: 'Desa Pandau',
    subdistrict: 'Kecamatan Arut Utara',
    regency: 'Kabupaten Kotawaringin Barat',
    description: 'Wilayah bantaran sungai dengan kearifan navigasi riam dan perahu.',
    isIndigenousArut: true,
    status: 'active',
    createdAt: '2026-01-01'
  },
  {
    id: 'reg-06',
    name: 'Desa Penyombaan',
    subdistrict: 'Kecamatan Arut Utara',
    regency: 'Kabupaten Kotawaringin Barat',
    description: 'Wilayah adat dengan istilah flora hutan ulin dan ritual adat.',
    isIndigenousArut: true,
    status: 'active',
    createdAt: '2026-01-01'
  },
  {
    id: 'reg-07',
    name: 'Desa Riam',
    subdistrict: 'Kecamatan Arut Utara',
    regency: 'Kabupaten Kotawaringin Barat',
    description: 'Kawasan riam air deras dengan kosakata geografi sungai yang spesifik.',
    isIndigenousArut: true,
    status: 'active',
    createdAt: '2026-01-01'
  },
  {
    id: 'reg-08',
    name: 'Desa Sukarami',
    subdistrict: 'Kecamatan Arut Utara',
    regency: 'Kabupaten Kotawaringin Barat',
    description: 'Komunitas penutur aktif dan gerakan generasi muda pelestari bahasa.',
    isIndigenousArut: true,
    status: 'active',
    createdAt: '2026-01-01'
  },
  {
    id: 'reg-09',
    name: 'Pangkalan Bun',
    subdistrict: 'Kecamatan Arut Selatan',
    regency: 'Kabupaten Kotawaringin Barat',
    description: 'Ibukota kabupaten, pusat arsip sejarah, dan simpul riset kebudayaan.',
    isIndigenousArut: false,
    status: 'active',
    createdAt: '2026-01-01'
  },
  {
    id: 'reg-10',
    name: 'Luar Daerah / Diaspora / Umum',
    subdistrict: 'Nasional / Internasional',
    regency: 'Lintas Wilayah',
    description: 'Masyarakat umum, perantau, peneliti, akademisi, dan pemerhati bahasa Dayak.',
    isIndigenousArut: false,
    status: 'active',
    createdAt: '2026-01-01'
  }
];

export interface RegisterData {
  name: string;
  email: string;
  password?: string;
  origin: string;
  role: string;
  motivation: string;
}

interface AuthContextType {
  user: ContributorUser | null;
  isLoggedIn: boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  login: (email: string) => boolean;
  loginDemo: (demoId: 'superadmin' | 'admin' | 'elder' | 'volunteer') => void;
  loginWithArutaSession: (userData: any) => void;
  completeOnboarding: (updatedUser: any) => void;
  register: (data: RegisterData) => boolean;
  logout: () => Promise<void>;
  contributedWords: DictionaryWord[];
  allDictionaryWords: DictionaryWord[];
  addWord: (newWord: Omit<DictionaryWord, 'id'>) => void;
  resubmitWord: (wordId: string, updatedData: Partial<DictionaryWord>) => void;
  bulkAddWords: (words: Array<Omit<DictionaryWord, 'id'>>) => number;
  favorites: string[];
  toggleFavorite: (wordId: string) => void;
  isFavorite: (wordId: string) => boolean;
  // Superadmin & Admin functionalities
  allUsers: ContributorUser[];
  updateUserRoles: (userId: string, newRoles: UserRole[]) => void;
  verifyUserAccount: (targetUserId: string, verifierUser?: ContributorUser | null) => { success: boolean; message: string };
  unverifyUserAccount: (targetUserId: string, actorUser?: ContributorUser | null) => { success: boolean; message: string };
  moderatedWords: ModeratedWordEntry[];
  approveWord: (wordId: string, notes?: string) => void;
  rejectWord: (wordId: string, reason?: string) => void;
  requestRevision: (wordId: string, notes?: string) => void;
  // Kelola Desa / Wilayah
  regions: RegionVillage[];
  addRegion: (data: Omit<RegionVillage, 'id' | 'createdAt'>) => void;
  updateRegion: (id: string, data: Partial<RegionVillage>) => void;
  deleteRegion: (id: string) => void;
  // Pengelolaan Profil Pengguna
  updateUserProfile: (data: Partial<ContributorUser>) => void;
  // Cloudflare Bahasa_KV status
  isKvConnected: boolean | null;
  refreshKvData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INITIAL_DEMO_USERS: Record<string, ContributorUser> = {
  superadmin: {
    id: 'usr-superadmin',
    name: 'Superadmin Master (TEN)',
    email: 'superadmin@aruta.id',
    roles: ['superadmin', 'admin', 'verifier', 'contributor'],
    primaryRole: 'superadmin',
    origin: 'Pangkalan Bun, Kobar',
    avatar: 'SM',
    bio: 'Master pengelola tertinggi platform digital pelestarian Basa Arut.',
    badge: 'Superadmin Master',
    wordsSubmittedCount: 520,
    wordsVerifiedCount: 780,
    isVerified: true,
    verifiedByAdminName: 'Sistem Pusat Aruta (Root Founder)',
    verifiedAt: '1 Januari 2026',
    verifiedByRole: 'superadmin'
  },
  admin: {
    id: 'usr-admin',
    name: 'Admin Operasional (Basa Arut)',
    email: 'admin@aruta.id',
    roles: ['admin', 'contributor'],
    primaryRole: 'admin',
    origin: 'Kelurahan Mendawai, Kobar',
    avatar: 'AD',
    bio: 'Pengelola harian dan moderator kurasi kosakata komunitas pelestari.',
    badge: 'Admin Platform',
    wordsSubmittedCount: 160,
    wordsVerifiedCount: 310,
    isVerified: true,
    verifiedByAdminName: 'Superadmin Master (TEN)',
    verifiedAt: '5 Januari 2026',
    verifiedByRole: 'superadmin'
  },
  elder: {
    id: 'usr-elder',
    name: 'Damang Adat Arut Utara',
    email: 'damang.arut@kobar.id',
    roles: ['verifier', 'contributor'],
    primaryRole: 'verifier',
    origin: 'Pangkut, Kobar',
    avatar: 'DA',
    bio: 'Penjaga warisan tutur lisan dan pemangku hukum adat Kedamangan Arut Utara.',
    badge: 'Tetua Adat / Verifikator',
    wordsSubmittedCount: 340,
    wordsVerifiedCount: 512,
    isVerified: true,
    verifiedByAdminName: 'Admin Operasional (Basa Arut)',
    verifiedAt: '10 Januari 2026',
    verifiedByRole: 'admin'
  },
  volunteer: {
    id: 'usr-volunteer',
    name: 'Rian Pratama',
    email: 'rian.pratama@relawan-arut.org',
    roles: ['contributor'],
    primaryRole: 'contributor',
    origin: 'Desa Gandis, Arut Utara',
    avatar: 'RP',
    bio: 'Penggiat digitalisasi ungkapan bahasa daerah dan dokumentasi audio generasi muda.',
    badge: 'Relawan Pemuda',
    wordsSubmittedCount: 98,
    wordsVerifiedCount: 45,
    isVerified: false
  }
};

const INITIAL_MODERATION_QUEUE: ModeratedWordEntry[] = [
  {
    id: 'mw-201',
    wordArut: 'Mangaju',
    wordId: 'Berjalan Menuju Hulu Sungai',
    wordEn: 'Journey Upriver',
    category: 'Verba',
    phonetic: 'ma-nga-ju',
    meaning: 'Mengayuh perahu atau berjalan menuju arah hulu Sungai Arut.',
    meaningEn: 'Navigating a boat or walking towards the upriver stream.',
    exampleArut: 'Ewen mangaju manuju riam Penyombaan.',
    exampleId: 'Mereka berlayar ke hulu menuju jeram Penyombaan.',
    exampleEn: 'They journeyed upriver towards the Penyombaan rapids.',
    dialect: 'Pangkut, Arut Utara',
    submitterName: 'Rian Pratama',
    submitterRole: 'Relawan Pemuda',
    status: 'pending',
    submittedAt: 'Hari ini, 09:30',
    verifiedBy: 'Menunggu Moderasi Admin'
  },
  {
    id: 'mw-202',
    wordArut: 'Kumbang Himba',
    wordId: 'Bunga Rimba Langka',
    wordEn: 'Rare Forest Orchid',
    category: 'Nomina',
    phonetic: 'kum-bang him-ba',
    meaning: 'Anggrek hutan atau kembang liar yang tumbuh di dahan pohon ulin tua.',
    meaningEn: 'Wild orchid blossoming on ancient ironwood tree branches.',
    exampleArut: 'Harum bau kumbang himba tuh pas andau hanjewu.',
    exampleId: 'Wangi harum bunga rimba ini saat pagi hari.',
    exampleEn: 'Fragrant is this jungle flower in the morning air.',
    dialect: 'Arut Utara',
    submitterName: 'Ny. Darniati Balan',
    submitterRole: 'Pengumpul Kosakata',
    status: 'pending',
    submittedAt: 'Kemarin, 16:45',
    verifiedBy: 'Menunggu Moderasi Admin'
  },
  {
    id: 'mw-203',
    wordArut: 'Pambelum',
    wordId: 'Kehidupan / Nafkah Hidup',
    wordEn: 'Livelihood / Life',
    category: 'Nomina',
    phonetic: 'pam-be-lum',
    meaning: 'Seluruh urusan yang berkenaan dengan cara hidup dan mencari rezeki di tanah leluhur.',
    meaningEn: 'Matters regarding traditional way of living and seeking sustenance.',
    exampleArut: 'Ikei manggawi pambelum melai lewu Arut.',
    exampleId: 'Kami mencari nafkah kehidupan di kampung Arut.',
    exampleEn: 'We seek our livelihood in Arut village.',
    dialect: 'Arut Umum',
    submitterName: 'Damang Adat Arut Utara',
    submitterRole: 'Tetua Adat',
    status: 'approved',
    submittedAt: '2 Hari lalu',
    verifiedBy: '✓ Disetujui Superadmin'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ContributorUser | null>(null);
  const [allUsers, setAllUsers] = useState<ContributorUser[]>(Object.values(INITIAL_DEMO_USERS));
  const [contributedWords, setContributedWords] = useState<DictionaryWord[]>([]);
  const [moderatedWords, setModeratedWords] = useState<ModeratedWordEntry[]>(INITIAL_MODERATION_QUEUE);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [regions, setRegions] = useState<RegionVillage[]>(INITIAL_REGIONS);
  const [isKvConnected, setIsKvConnected] = useState<boolean | null>(null);

  const refreshKvData = useCallback(async () => {
    try {
      const health = await kvService.checkHealth();
      if (health && health.kvConnected) {
        setIsKvConnected(true);
        const [remoteQueue, remoteWords] = await Promise.all([
          kvService.getModerationQueue(),
          kvService.getWords(),
        ]);
        if (remoteQueue && Array.isArray(remoteQueue) && remoteQueue.length > 0) {
          setModeratedWords(remoteQueue);
          if (typeof window !== 'undefined') {
            localStorage.setItem('arut_mod_queue', JSON.stringify(remoteQueue));
          }
        }
        if (remoteWords && Array.isArray(remoteWords) && remoteWords.length > 0) {
          setContributedWords(remoteWords);
          if (typeof window !== 'undefined') {
            localStorage.setItem('arut_user_contributions', JSON.stringify(remoteWords));
          }
        }
      } else {
        setIsKvConnected(false);
      }
    } catch {
      setIsKvConnected(false);
    }
  }, []);

  // Load state from localStorage and then attempt KV sync
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('arut_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }

      const savedUsersList = localStorage.getItem('arut_all_users');
      if (savedUsersList) {
        setAllUsers(JSON.parse(savedUsersList));
      }

      const savedQueue = localStorage.getItem('arut_mod_queue');
      if (savedQueue) {
        setModeratedWords(JSON.parse(savedQueue));
      }

      const savedContributions = localStorage.getItem('arut_user_contributions');
      if (savedContributions) {
        setContributedWords(JSON.parse(savedContributions));
      } else {
        setContributedWords([
          {
            id: 'cw-101',
            wordArut: 'Pambelum',
            wordId: 'Kehidupan / Nafkah Hidup',
            wordEn: 'Livelihood / Life',
            category: 'Nomina',
            phonetic: 'pam-be-lum',
            meaning: 'Seluruh urusan yang berkenaan dengan cara hidup dan mencari rezeki di tanah leluhur.',
            meaningEn: 'Matters regarding traditional way of living and seeking sustenance.',
            exampleArut: 'Ikei manggawi pambelum melai lewu Arut.',
            exampleId: 'Kami mencari nafkah kehidupan di kampung Arut.',
            exampleEn: 'We seek our livelihood in Arut village.',
            dialect: 'Arut Umum',
            verifiedBy: '✓ Disetujui Tim Adat',
            dateAdded: '2 Hari lalu'
          }
        ]);
      }

      const savedFavs = localStorage.getItem('arut_favorites');
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }

      const savedRegions = localStorage.getItem('arut_regions');
      if (savedRegions) {
        try {
          setRegions(JSON.parse(savedRegions));
        } catch (e) {
          console.error('Error parsing arut_regions', e);
        }
      }
      // Periksa sesi aktif dari cookie HttpOnly Aruta SSO
      fetch('/api/auth/session')
        .then(async (res) => {
          if (!res.ok) return null;
          const text = await res.text();
          try {
            return text ? JSON.parse(text) : null;
          } catch {
            return null;
          }
        })
        .then((data) => {
          if (data && data.authenticated && data.user) {
            setUser((prev) => ({
              ...(prev || {}),
              ...data.user,
            }));
            if (typeof window !== 'undefined') {
              localStorage.setItem('arut_user', JSON.stringify(data.user));
            }
          }
        })
        .catch((err) => {
          console.debug('Session check bypassed or offline:', err);
        });
    } catch (e) {
      console.error('Error reading localStorage', e);
    }

    // Sync with Bahasa_KV if online
    refreshKvData();
  }, [refreshKvData]);

  // Multi-Role Checkers
  const hasRole = (role: UserRole): boolean => {
    if (!user) return false;
    return user.roles.includes(role);
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.some(r => user.roles.includes(r));
  };

  const login = (email: string) => {
    const matched = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    const currentUser: ContributorUser = matched || {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0],
      email,
      roles: ['contributor'],
      primaryRole: 'contributor',
      origin: 'Kotawaringin Barat',
      avatar: email.substring(0, 2).toUpperCase(),
      badge: 'Kontributor Bahasa',
      wordsSubmittedCount: 0,
      wordsVerifiedCount: 0,
    };

    setUser(currentUser);
    if (!allUsers.some(u => u.id === currentUser.id)) {
      const updatedList = [...allUsers, currentUser];
      setAllUsers(updatedList);
      if (typeof window !== 'undefined') {
        localStorage.setItem('arut_all_users', JSON.stringify(updatedList));
      }
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('arut_user', JSON.stringify(currentUser));
    }
    return true;
  };

  const loginDemo = (demoId: 'superadmin' | 'admin' | 'elder' | 'volunteer') => {
    const selected = INITIAL_DEMO_USERS[demoId];
    if (selected) {
      setUser(selected);
      if (typeof window !== 'undefined') {
        localStorage.setItem('arut_user', JSON.stringify(selected));
      }
    }
  };

  const register = (data: RegisterData) => {
    const initials = data.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'KT';
    const newUser: ContributorUser = {
      id: `usr-${Date.now()}`,
      name: data.name,
      email: data.email,
      roles: ['contributor'],
      primaryRole: 'contributor',
      origin: data.origin || 'Arut, Kobar',
      avatar: initials,
      bio: data.motivation,
      badge: 'Relawan Terdaftar',
      wordsSubmittedCount: 0,
      wordsVerifiedCount: 0,
    };
    setUser(newUser);
    const updatedUsers = [...allUsers, newUser];
    setAllUsers(updatedUsers);
    if (typeof window !== 'undefined') {
      localStorage.setItem('arut_user', JSON.stringify(newUser));
      localStorage.setItem('arut_all_users', JSON.stringify(updatedUsers));
    }
    return true;
  };

  const loginWithArutaSession = (userData: any) => {
    const ssoUser: ContributorUser = {
      id: userData.id || userData.sub || `usr-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      roles: userData.roles || ['contributor'],
      primaryRole: userData.primaryRole || 'contributor',
      origin: userData.origin || 'Kelurahan Pangkut',
      avatar: userData.avatar || userData.picture || (userData.name ? userData.name.substring(0, 2).toUpperCase() : 'AU'),
      picture: userData.picture,
      badge: userData.badge || 'Kontributor Aruta',
      bio: userData.bio || '',
      honorificTitle: userData.honorificTitle || '',
      wordsSubmittedCount: 0,
      wordsVerifiedCount: 0,
      isVerified: userData.primaryRole === 'admin' || userData.primaryRole === 'superadmin',
      isOnboarded: userData.isOnboarded || false,
      username: userData.username,
      status: userData.status || 'active',
    };

    setUser(ssoUser);
    setAllUsers((prev) => {
      const exists = prev.some((u) => u.id === ssoUser.id);
      const updated = exists ? prev.map((u) => (u.id === ssoUser.id ? { ...u, ...ssoUser } : u)) : [...prev, ssoUser];
      if (typeof window !== 'undefined') {
        localStorage.setItem('arut_all_users', JSON.stringify(updated));
        localStorage.setItem('arut_user', JSON.stringify(ssoUser));
      }
      return updated;
    });
  };

  const completeOnboarding = (updatedUserData: any) => {
    setUser((prev) => {
      if (!prev) return null;
      const merged: ContributorUser = {
        ...prev,
        ...updatedUserData,
        isOnboarded: true,
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('arut_user', JSON.stringify(merged));
      }
      return merged;
    });

    setAllUsers((prev) => {
      const next = prev.map((u) => (u.id === updatedUserData.id ? { ...u, ...updatedUserData, isOnboarded: true } : u));
      if (typeof window !== 'undefined') {
        localStorage.setItem('arut_all_users', JSON.stringify(next));
      }
      return next;
    });
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.warn('Gagal memanggil logout API (non-blocking):', err);
    }
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('arut_user');
    }
  };

  // Add word & dispatch to global moderation queue
  const addWord = (newWordData: Omit<DictionaryWord, 'id'>) => {
    const wordId = `cw-${Date.now()}`;
    const wordWithId: DictionaryWord = {
      ...newWordData,
      id: wordId,
      verifiedBy: 'Menunggu Moderasi Tim Adat',
      dateAdded: 'Baru saja'
    };

    const updated = [wordWithId, ...contributedWords];
    setContributedWords(updated);

    // Also push to platform moderation queue for Admin/Superadmin
    const modEntry: ModeratedWordEntry = {
      ...wordWithId,
      submitterName: user?.name || 'Kontributor',
      submitterRole: user?.badge || 'Kontributor',
      status: 'pending',
      submittedAt: 'Baru saja',
    };
    const updatedQueue = [modEntry, ...moderatedWords];
    setModeratedWords(updatedQueue);

    if (typeof window !== 'undefined') {
      localStorage.setItem('arut_user_contributions', JSON.stringify(updated));
      localStorage.setItem('arut_mod_queue', JSON.stringify(updatedQueue));
    }

    // Background sync to Bahasa_KV
    kvService.submitWord(modEntry).catch(() => {});

    if (user) {
      const updatedUser = {
        ...user,
        wordsSubmittedCount: user.wordsSubmittedCount + 1
      };
      setUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('arut_user', JSON.stringify(updatedUser));
      }
    }
  };

  const resubmitWord = (wordId: string, updatedData: Partial<DictionaryWord>) => {
    const updatedContribs = contributedWords.map(cw => {
      if (cw.id === wordId) {
        return {
          ...cw,
          ...updatedData,
          verifiedBy: 'Menunggu Peninjauan Ulang Verifikator',
          dateAdded: 'Diperbaiki baru saja'
        };
      }
      return cw;
    });
    setContributedWords(updatedContribs);

    const updatedQueue = moderatedWords.map(mw => {
      if (mw.id === wordId) {
        return {
          ...mw,
          ...updatedData,
          status: 'pending' as const,
          submittedAt: 'Diperbaiki baru saja',
          verifiedBy: 'Menunggu Peninjauan Ulang Verifikator',
          adminNotes: undefined
        };
      }
      return mw;
    });
    setModeratedWords(updatedQueue);

    if (typeof window !== 'undefined') {
      localStorage.setItem('arut_user_contributions', JSON.stringify(updatedContribs));
      localStorage.setItem('arut_mod_queue', JSON.stringify(updatedQueue));
    }
  };

  const bulkAddWords = (words: Array<Omit<DictionaryWord, 'id'>>): number => {
    if (!words || words.length === 0) return 0;
    const now = Date.now();
    const newItems: DictionaryWord[] = words.map((w, idx) => ({
      ...w,
      id: `cw-${now}-${idx}`,
      verifiedBy: 'Menunggu Moderasi Tim Adat',
      dateAdded: 'Impor Massal'
    }));

    const newModEntries: ModeratedWordEntry[] = newItems.map(item => ({
      ...item,
      submitterName: user?.name || 'Kontributor',
      submitterRole: user?.badge || 'Kontributor',
      status: 'pending' as const,
      submittedAt: 'Impor Massal'
    }));

    const updatedContribs = [...newItems, ...contributedWords];
    const updatedQueue = [...newModEntries, ...moderatedWords];

    setContributedWords(updatedContribs);
    setModeratedWords(updatedQueue);

    if (typeof window !== 'undefined') {
      localStorage.setItem('arut_user_contributions', JSON.stringify(updatedContribs));
      localStorage.setItem('arut_mod_queue', JSON.stringify(updatedQueue));
    }

    if (user) {
      const updatedUser = {
        ...user,
        wordsSubmittedCount: user.wordsSubmittedCount + words.length
      };
      setUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('arut_user', JSON.stringify(updatedUser));
      }
    }

    return words.length;
  };

  // Admin & Superadmin moderation actions with full verifier provenance recording
  const approveWord = (wordId: string, notes?: string) => {
    const verifierName = user?.name || 'Damang Adat Arut Utara';
    const verifierRole = user?.badge || (user?.roles.includes('verifier') ? 'Tetua Adat / Verifikator' : 'Admin Platform');
    const verifiedTime = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    const verifierTitle = `✓ Disetujui oleh ${verifierName} (${verifierRole})`;
    const finalNotes = notes || 'Lolos verifikasi kesahihan dialek & tutur asli Dayak Arut.';

    const updated = moderatedWords.map(w => {
      if (w.id === wordId) {
        return {
          ...w,
          status: 'approved' as const,
          verifiedBy: verifierTitle,
          verifiedByName: verifierName,
          verifierRole: verifierRole,
          verifiedAt: verifiedTime,
          adminNotes: finalNotes
        };
      }
      return w;
    });
    setModeratedWords(updated);

    // Sync in contributedWords
    const updatedContribs = contributedWords.map(cw => {
      if (cw.id === wordId || (cw.wordArut === moderatedWords.find(m => m.id === wordId)?.wordArut)) {
        return {
          ...cw,
          verifiedBy: verifierTitle,
          verifiedByName: verifierName,
          verifierRole: verifierRole,
          verifiedAt: verifiedTime,
          adminNotes: finalNotes
        };
      }
      return cw;
    });
    setContributedWords(updatedContribs);

    if (user) {
      const updatedUser = {
        ...user,
        wordsVerifiedCount: user.wordsVerifiedCount + 1
      };
      setUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('arut_user', JSON.stringify(updatedUser));
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('arut_mod_queue', JSON.stringify(updated));
      localStorage.setItem('arut_user_contributions', JSON.stringify(updatedContribs));
    }

    // Sync to Bahasa_KV
    kvService.updateWordStatus(wordId, 'approve', finalNotes, verifierTitle).catch(() => {});
  };

  const rejectWord = (wordId: string, reason?: string) => {
    const verifierName = user?.name || 'Damang Adat Arut Utara';
    const verifierRole = user?.badge || (user?.roles.includes('verifier') ? 'Tetua Adat / Verifikator' : 'Admin Platform');
    const verifiedTime = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    const verifierTitle = `✕ Ditolak (${reason || 'Tidak Sesuai Tutur Asli'})`;
    const finalReason = reason || 'Kosakata belum memenuhi kaidah dialek Arut.';

    const updated = moderatedWords.map(w => {
      if (w.id === wordId) {
        return {
          ...w,
          status: 'rejected' as const,
          verifiedBy: verifierTitle,
          verifiedByName: verifierName,
          verifierRole: verifierRole,
          verifiedAt: verifiedTime,
          adminNotes: finalReason
        };
      }
      return w;
    });
    setModeratedWords(updated);

    // Sync in contributedWords
    const updatedContribs = contributedWords.map(cw => {
      if (cw.id === wordId || (cw.wordArut === moderatedWords.find(m => m.id === wordId)?.wordArut)) {
        return {
          ...cw,
          verifiedBy: verifierTitle,
          verifiedByName: verifierName,
          verifierRole: verifierRole,
          verifiedAt: verifiedTime,
          adminNotes: finalReason
        };
      }
      return cw;
    });
    setContributedWords(updatedContribs);

    if (typeof window !== 'undefined') {
      localStorage.setItem('arut_mod_queue', JSON.stringify(updated));
      localStorage.setItem('arut_user_contributions', JSON.stringify(updatedContribs));
    }

    // Sync to Bahasa_KV
    kvService.updateWordStatus(wordId, 'reject', finalReason).catch(() => {});
  };

  const requestRevision = (wordId: string, notes?: string) => {
    const verifierName = user?.name || 'Damang Adat Arut Utara';
    const verifierRole = user?.badge || (user?.roles.includes('verifier') ? 'Tetua Adat / Verifikator' : 'Admin Platform');
    const verifiedTime = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    const finalNotes = notes || 'Mohon sertakan fonetik atau contoh kalimat yang lazim digunakan penutur asli.';
    const verifierTitle = `✏️ Perlu Revisi (${finalNotes})`;

    const updated = moderatedWords.map(w => {
      if (w.id === wordId) {
        return {
          ...w,
          status: 'revision' as const,
          verifiedBy: verifierTitle,
          verifiedByName: verifierName,
          verifierRole: verifierRole,
          verifiedAt: verifiedTime,
          adminNotes: finalNotes
        };
      }
      return w;
    });
    setModeratedWords(updated);

    // Sync in contributedWords
    const updatedContribs = contributedWords.map(cw => {
      if (cw.id === wordId || (cw.wordArut === moderatedWords.find(m => m.id === wordId)?.wordArut)) {
        return {
          ...cw,
          verifiedBy: verifierTitle,
          verifiedByName: verifierName,
          verifierRole: verifierRole,
          verifiedAt: verifiedTime,
          adminNotes: finalNotes
        };
      }
      return cw;
    });
    setContributedWords(updatedContribs);

    if (typeof window !== 'undefined') {
      localStorage.setItem('arut_mod_queue', JSON.stringify(updated));
      localStorage.setItem('arut_user_contributions', JSON.stringify(updatedContribs));
    }

    // Sync to Bahasa_KV
    kvService.updateWordStatus(wordId, 'revision', finalNotes).catch(() => {});
  };

  // Combined master dictionary of baseline + all verified community words
  const allDictionaryWords = useMemo(() => {
    const combined: DictionaryWord[] = [...ARUT_DICTIONARY];

    // Merge approved words from moderation queue
    moderatedWords.filter(m => m.status === 'approved').forEach(mw => {
      const idx = combined.findIndex(w => w.id === mw.id || w.wordArut.toLowerCase() === mw.wordArut.toLowerCase());
      if (idx >= 0) {
        combined[idx] = { ...combined[idx], ...mw };
      } else {
        combined.unshift(mw);
      }
    });

    // Merge approved words from contributedWords
    contributedWords.forEach(cw => {
      if (cw.verifiedBy && (cw.verifiedBy.includes('Disetujui') || cw.verifiedBy.includes('✓'))) {
        const idx = combined.findIndex(w => w.id === cw.id || w.wordArut.toLowerCase() === cw.wordArut.toLowerCase());
        if (idx >= 0) {
          combined[idx] = { ...combined[idx], ...cw };
        } else {
          combined.unshift(cw);
        }
      }
    });

    return combined;
  }, [moderatedWords, contributedWords]);

  // Superadmin Role Assignment
  const updateUserRoles = (userId: string, newRoles: UserRole[]) => {
    const updated = allUsers.map(u => {
      if (u.id === userId) {
        // compute highest primary role
        let highest: UserRole = 'contributor';
        if (newRoles.includes('superadmin')) highest = 'superadmin';
        else if (newRoles.includes('admin')) highest = 'admin';
        else if (newRoles.includes('verifier')) highest = 'verifier';

        return {
          ...u,
          roles: newRoles,
          primaryRole: highest,
          badge: highest === 'superadmin' ? 'Superadmin Master' : highest === 'admin' ? 'Admin Platform' : highest === 'verifier' ? 'Tetua Adat' : 'Kontributor'
        };
      }
      return u;
    });
    setAllUsers(updated);

    // If updating current logged-in user
    if (user && user.id === userId) {
      const updatedSelf = updated.find(u => u.id === userId);
      if (updatedSelf) {
        setUser(updatedSelf);
        if (typeof window !== 'undefined') {
          localStorage.setItem('arut_user', JSON.stringify(updatedSelf));
        }
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('arut_all_users', JSON.stringify(updated));
    }
  };

  const toggleFavorite = (wordId: string) => {
    setFavorites(prev => {
      const next = prev.includes(wordId) ? prev.filter(id => id !== wordId) : [...prev, wordId];
      if (typeof window !== 'undefined') {
        localStorage.setItem('arut_favorites', JSON.stringify(next));
      }
      return next;
    });
  };

  const isFavorite = (wordId: string) => favorites.includes(wordId);

  // Kelola Desa / Domisili / Wilayah Tutur
  const addRegion = (data: Omit<RegionVillage, 'id' | 'createdAt'>) => {
    const newReg: RegionVillage = {
      ...data,
      id: `reg-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    const updated = [newReg, ...regions];
    setRegions(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('arut_regions', JSON.stringify(updated));
    }
  };

  const updateRegion = (id: string, data: Partial<RegionVillage>) => {
    const updated = regions.map(r => r.id === id ? { ...r, ...data } : r);
    setRegions(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('arut_regions', JSON.stringify(updated));
    }
  };

  const deleteRegion = (id: string) => {
    const updated = regions.filter(r => r.id !== id);
    setRegions(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('arut_regions', JSON.stringify(updated));
    }
  };

  const updateUserProfile = (data: Partial<ContributorUser>) => {
    if (!user) return;
    const updatedUser: ContributorUser = { ...user, ...data };
    setUser(updatedUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('arut_user', JSON.stringify(updatedUser));
    }

    setAllUsers(prev => {
      const next = prev.map(u => u.id === user.id ? { ...u, ...data } : u);
      if (typeof window !== 'undefined') {
        localStorage.setItem('arut_all_users', JSON.stringify(next));
      }
      return next;
    });
  };

  // Verifikasi Akun Berjenjang
  // Aturan: Admin memverifikasi role di bawahnya (verifier, contributor). Role admin hanya bisa diverifikasi oleh superadmin.
  const verifyUserAccount = (targetUserId: string, verifierUser?: ContributorUser | null) => {
    const actor = verifierUser || user;
    if (!actor) {
      return { success: false, message: 'Harap masuk ke akun admin/superadmin terlebih dahulu.' };
    }

    const targetUser = allUsers.find(u => u.id === targetUserId);
    if (!targetUser) {
      return { success: false, message: 'Akun target tidak ditemukan.' };
    }

    const check = canVerifyTargetUser(actor.roles, targetUser.roles);
    if (!check.canVerify) {
      return { success: false, message: check.reason || 'Anda tidak memiliki hak untuk memverifikasi akun ini.' };
    }

    const nowFormatted = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const updated = allUsers.map(u => {
      if (u.id === targetUserId) {
        return {
          ...u,
          isVerified: true,
          verifiedByAdminName: actor.name,
          verifiedAt: nowFormatted,
          verifiedByRole: getHighestRole(actor.roles)
        };
      }
      return u;
    });

    setAllUsers(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('arut_all_users', JSON.stringify(updated));
    }

    if (user && user.id === targetUserId) {
      const updatedSelf = updated.find(u => u.id === targetUserId);
      if (updatedSelf) {
        setUser(updatedSelf);
        if (typeof window !== 'undefined') {
          localStorage.setItem('arut_user', JSON.stringify(updatedSelf));
        }
      }
    }

    return {
      success: true,
      message: `✓ Akun "${targetUser.name}" berhasil diverifikasi oleh ${actor.name}!`
    };
  };

  const unverifyUserAccount = (targetUserId: string, actorUser?: ContributorUser | null) => {
    const actor = actorUser || user;
    if (!actor) {
      return { success: false, message: 'Harap masuk ke akun admin/superadmin terlebih dahulu.' };
    }

    const targetUser = allUsers.find(u => u.id === targetUserId);
    if (!targetUser) {
      return { success: false, message: 'Akun target tidak ditemukan.' };
    }

    const check = canVerifyTargetUser(actor.roles, targetUser.roles);
    if (!check.canVerify) {
      return { success: false, message: check.reason || 'Anda tidak memiliki hak untuk mencabut verifikasi akun ini.' };
    }

    const updated = allUsers.map(u => {
      if (u.id === targetUserId) {
        return {
          ...u,
          isVerified: false,
          verifiedByAdminName: undefined,
          verifiedAt: undefined,
          verifiedByRole: undefined
        };
      }
      return u;
    });

    setAllUsers(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('arut_all_users', JSON.stringify(updated));
    }

    if (user && user.id === targetUserId) {
      const updatedSelf = updated.find(u => u.id === targetUserId);
      if (updatedSelf) {
        setUser(updatedSelf);
        if (typeof window !== 'undefined') {
          localStorage.setItem('arut_user', JSON.stringify(updatedSelf));
        }
      }
    }

    return {
      success: true,
      message: `Status verifikasi akun "${targetUser.name}" telah dicabut.`
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        hasRole,
        hasAnyRole,
        login,
        loginDemo,
        loginWithArutaSession,
        completeOnboarding,
        register,
        logout,
        contributedWords,
        allDictionaryWords,
        addWord,
        resubmitWord,
        bulkAddWords,
        favorites,
        toggleFavorite,
        isFavorite,
        allUsers,
        updateUserRoles,
        verifyUserAccount,
        unverifyUserAccount,
        moderatedWords,
        approveWord,
        rejectWord,
        requestRevision,
        regions,
        addRegion,
        updateRegion,
        deleteRegion,
        updateUserProfile,
        isKvConnected,
        refreshKvData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
