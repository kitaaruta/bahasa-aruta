'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DictionaryWord } from '@/data/arutDictionary';

export type UserRole = 'superadmin' | 'admin' | 'verifier' | 'contributor' | 'supporter';

export interface ContributorUser {
  id: string;
  name: string;
  email: string;
  roles: UserRole[]; // One account can have multiple roles
  primaryRole: UserRole;
  origin: string;
  avatar: string;
  bio?: string;
  badge: string;
  wordsSubmittedCount: number;
  wordsVerifiedCount: number;
}

export const getHighestRole = (roles: UserRole[] = []): UserRole => {
  if (roles.includes('superadmin')) return 'superadmin';
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('verifier')) return 'verifier';
  return 'contributor';
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
  verifiedAt?: string;
  verifiedByName?: string;
}

interface RegisterData {
  name: string;
  email: string;
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
  register: (data: RegisterData) => boolean;
  logout: () => void;
  contributedWords: DictionaryWord[];
  addWord: (newWord: Omit<DictionaryWord, 'id'>) => void;
  favorites: string[];
  toggleFavorite: (wordId: string) => void;
  isFavorite: (wordId: string) => boolean;
  // Superadmin & Admin functionalities
  allUsers: ContributorUser[];
  updateUserRoles: (userId: string, newRoles: UserRole[]) => void;
  moderatedWords: ModeratedWordEntry[];
  approveWord: (wordId: string, notes?: string) => void;
  rejectWord: (wordId: string, reason?: string) => void;
  requestRevision: (wordId: string, notes?: string) => void;
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

  // Load state from localStorage
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
    } catch (e) {
      console.error('Error reading localStorage', e);
    }
  }, []);

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

  const logout = () => {
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

  // Admin & Superadmin moderation actions
  const approveWord = (wordId: string, notes?: string) => {
    const verifierTitle = user?.name ? `✓ Disetujui oleh ${user.name}` : '✓ Disetujui Tim Adat & Admin';
    const updated = moderatedWords.map(w => {
      if (w.id === wordId) {
        return {
          ...w,
          status: 'approved' as const,
          verifiedBy: verifierTitle,
          verifiedByName: user?.name || 'Admin Basa Arut',
          verifiedAt: 'Hari ini, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          adminNotes: notes || w.adminNotes || 'Lolos verifikasi kesahihan dialek Arut.'
        };
      }
      return w;
    });
    setModeratedWords(updated);

    // Sync in contributedWords if present
    setContributedWords(prev => prev.map(cw => {
      if (cw.id === wordId || (cw.wordArut === moderatedWords.find(m => m.id === wordId)?.wordArut)) {
        return { ...cw, verifiedBy: verifierTitle };
      }
      return cw;
    }));

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
    }
  };

  const rejectWord = (wordId: string, reason?: string) => {
    const verifierTitle = `✕ Ditolak (${reason || 'Tidak Sesuai Tutur Asli'})`;
    const updated = moderatedWords.map(w => {
      if (w.id === wordId) {
        return {
          ...w,
          status: 'rejected' as const,
          verifiedBy: verifierTitle,
          verifiedByName: user?.name || 'Admin Basa Arut',
          verifiedAt: 'Hari ini, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          adminNotes: reason || 'Kosa kata belum memenuhi kaidah dialek Arut.'
        };
      }
      return w;
    });
    setModeratedWords(updated);

    // Sync in contributedWords if present
    setContributedWords(prev => prev.map(cw => {
      if (cw.id === wordId || (cw.wordArut === moderatedWords.find(m => m.id === wordId)?.wordArut)) {
        return { ...cw, verifiedBy: verifierTitle };
      }
      return cw;
    }));

    if (typeof window !== 'undefined') {
      localStorage.setItem('arut_mod_queue', JSON.stringify(updated));
    }
  };

  const requestRevision = (wordId: string, notes?: string) => {
    const verifierTitle = `✏️ Perlu Revisi (${notes || 'Lengkapi Contoh Kalimat'})`;
    const updated = moderatedWords.map(w => {
      if (w.id === wordId) {
        return {
          ...w,
          status: 'revision' as const,
          verifiedBy: verifierTitle,
          verifiedByName: user?.name || 'Admin Basa Arut',
          verifiedAt: 'Hari ini',
          adminNotes: notes || 'Mohon sertakan fonetik atau contoh kalimat yang lazim digunakan penutur asli.'
        };
      }
      return w;
    });
    setModeratedWords(updated);

    // Sync in contributedWords if present
    setContributedWords(prev => prev.map(cw => {
      if (cw.id === wordId || (cw.wordArut === moderatedWords.find(m => m.id === wordId)?.wordArut)) {
        return { ...cw, verifiedBy: verifierTitle };
      }
      return cw;
    }));

    if (typeof window !== 'undefined') {
      localStorage.setItem('arut_mod_queue', JSON.stringify(updated));
    }
  };

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

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        hasRole,
        hasAnyRole,
        login,
        loginDemo,
        register,
        logout,
        contributedWords,
        addWord,
        favorites,
        toggleFavorite,
        isFavorite,
        allUsers,
        updateUserRoles,
        moderatedWords,
        approveWord,
        rejectWord,
        requestRevision,
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
