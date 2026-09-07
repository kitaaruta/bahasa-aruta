'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth, UserRole, getHighestRole, getRoleBorderColor, ModeratedWordEntry, RegionVillage, canVerifyTargetUser } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { DictionaryWord, ARUT_DICTIONARY } from '@/data/arutDictionary';

type DashboardArea = 'overview' | 'kontributor' | 'verifikator' | 'admin' | 'superadmin' | 'akun';

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    user,
    isLoggedIn,
    loginDemo,
    logout,
    hasRole,
    contributedWords,
    addWord,
    resubmitWord,
    bulkAddWords,
    moderatedWords,
    approveWord,
    rejectWord,
    requestRevision,
    allUsers,
    updateUserRoles,
    verifyUserAccount,
    unverifyUserAccount,
    regions,
    addRegion,
    updateRegion,
    deleteRegion,
    updateUserProfile,
    isKvConnected,
    refreshKvData
  } = useAuth();
  const { language } = useLanguage();

  // Role Checks
  const isSuperadmin = hasRole('superadmin');
  const isAdmin = hasRole('admin') || isSuperadmin;
  const isVerifier = hasRole('verifier') || isAdmin;

  // Active Area from URL or default to 'overview' (like Dashboard in screenshot)
  const initialArea = (searchParams.get('area') as DashboardArea) || 'overview';
  const [activeArea, setActiveArea] = useState<DashboardArea>(
    ['overview', 'kontributor', 'verifikator', 'admin', 'superadmin', 'akun'].includes(initialArea) ? initialArea : 'overview'
  );

  useEffect(() => {
    const areaParam = searchParams.get('area') as DashboardArea;
    if (areaParam && ['overview', 'kontributor', 'verifikator', 'admin', 'superadmin', 'akun'].includes(areaParam)) {
      setActiveArea(areaParam);
    }
  }, [searchParams]);

  const switchArea = (area: DashboardArea) => {
    setActiveArea(area);
    const url = new URL(window.location.href);
    if (area === 'overview') {
      url.searchParams.delete('area');
    } else {
      url.searchParams.set('area', area);
    }
    window.history.pushState({}, '', url.toString());
  };

  // Auto-login to superadmin demo if no user session is present yet
  useEffect(() => {
    if (!isLoggedIn && !user) {
      loginDemo('superadmin');
    }
  }, [isLoggedIn, user, loginDemo]);

  // Toast notice
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  // Collapsible Sidebar State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('arut_sidebar_collapsed');
      if (saved !== null) {
        setIsSidebarCollapsed(saved === 'true');
      }
    } catch {}
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('arut_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Overview Time Filter Tab
  const [overviewTimeRange, setOverviewTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('year');
  const [trendYear, setTrendYear] = useState<'2023' | '2024' | '2025' | '2026'>('2026');

  // Search in Header
  const [globalSearch, setGlobalSearch] = useState('');

  // Profile Dropdown state
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // -------------------------------------------------------------
  // STATES: AREA KONTRIBUTOR
  // -------------------------------------------------------------
  const [contribTab, setContribTab] = useState<'daftar' | 'my_submissions' | 'drafts' | 'pedoman'>('daftar');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkInputText, setBulkInputText] = useState('');
  const [editingRevisionWord, setEditingRevisionWord] = useState<ModeratedWordEntry | null>(null);
  const [mySubmissionsStatusFilter, setMySubmissionsStatusFilter] = useState<'all' | 'pending' | 'revision' | 'approved' | 'rejected'>('all');

  // Offline Drafts Storage
  const [savedDrafts, setSavedDrafts] = useState<Array<any>>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const d = localStorage.getItem('arut_word_drafts');
      return d ? JSON.parse(d) : [];
    } catch {
      return [];
    }
  });

  const [formMode, setFormMode] = useState<'guided' | 'quick'>('guided');
  const [formStep, setFormStep] = useState<1 | 2 | 3>(1);
  const [formError, setFormError] = useState('');

  // Core Word Fields
  const [wordArut, setWordArut] = useState('');
  const [wordId, setWordId] = useState('');
  const [wordEn, setWordEn] = useState('');
  const [category, setCategory] = useState<DictionaryWord['category']>('Nomina');
  const [phonetic, setPhonetic] = useState('');
  const [meaning, setMeaning] = useState('');
  const [meaningEn, setMeaningEn] = useState('');
  const [exampleArut, setExampleArut] = useState('');
  const [exampleId, setExampleId] = useState('');
  const [exampleEn, setExampleEn] = useState('');
  
  // Enriched Cultural & Dialect Fields
  const [selectedVillageId, setSelectedVillageId] = useState('reg-01');
  const [customVillageText, setCustomVillageText] = useState('');
  const [usageField, setUsageField] = useState('💬 Tutur Sehari-hari');
  const [sourceSpeaker, setSourceSpeaker] = useState('Penutur Asli Mandiri');
  const [culturalContext, setCulturalContext] = useState('');
  const [synonymsInput, setSynonymsInput] = useState('');

  const [searchDaftarQuery, setSearchDaftarQuery] = useState('');
  const [daftarCategoryFilter, setDaftarCategoryFilter] = useState('all');

  // Active villages from admin master
  const activeRegions = useMemo(() => regions.filter(r => r.status === 'active'), [regions]);

  // Default village based on user's saved villageId or origin
  const userDefaultVillageId = useMemo(() => {
    if (user?.villageId) return user.villageId;
    if (user?.origin) {
      const match = regions.find(r => user.origin.toLowerCase().includes(r.name.toLowerCase()));
      if (match) return match.id;
    }
    return regions[0]?.id || 'reg-01';
  }, [user, regions]);

  // Set default village for word submission whenever user changes
  useEffect(() => {
    if (userDefaultVillageId) {
      setSelectedVillageId(userDefaultVillageId);
    }
  }, [userDefaultVillageId]);

  const effectiveDialectName = useMemo(() => {
    if (selectedVillageId === 'custom') {
      return customVillageText.trim() || 'Wilayah Tutur Khusus';
    }
    const found = regions.find(r => r.id === selectedVillageId);
    return found ? `${found.name} (${found.subdistrict})` : 'Kelurahan Pangkut (Kecamatan Arut Utara)';
  }, [selectedVillageId, customVillageText, regions]);

  // Audio recording & upload states for new word submission
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string>('');
  const [mediaRecorderObj, setMediaRecorderObj] = useState<MediaRecorder | null>(null);
  const recordingTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const startVoiceRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        triggerToast('⚠️ Browser Anda tidak mendukung perekaman mikrofon langsung.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setRecordedAudioUrl(reader.result as string);
          triggerToast('✓ Rekaman suara penutur berhasil tersimpan!');
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorderObj(recorder);
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch {
      triggerToast('⚠️ Gagal mengakses mikrofon. Pastikan izin mikrofon diaktifkan.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderObj && isRecording) {
      mediaRecorderObj.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
  };

  const resetVoiceAudio = () => {
    if (isRecording && mediaRecorderObj) {
      try { mediaRecorderObj.stop(); } catch {}
    }
    setIsRecording(false);
    setRecordedAudioUrl('');
    setRecordingSeconds(0);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
  };

  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) {
      triggerToast('⚠️ Ukuran berkas audio maksimal 6MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setRecordedAudioUrl(reader.result as string);
      triggerToast('✓ Berkas audio penutur berhasil dimuat!');
    };
    reader.readAsDataURL(file);
  };

  // Helper: auto-generate phonetic syllables
  const handleAutoPhonetic = () => {
    if (!wordArut.trim()) return;
    const clean = wordArut.trim().toLowerCase();
    const formatted = clean
      .replace(/(ng|ny|kh|sy|[bcdfghjklmnpqrstvwxyz])([aeiouéèê])/g, '-$1$2')
      .replace(/^-/, '')
      .replace(/--+/g, '-');
    setPhonetic(formatted || clean);
  };

  // Helper: insert special Dayak Arut character
  const insertSpecialChar = (char: string) => {
    setWordArut(prev => prev + char);
  };

  const resetWordForm = () => {
    setWordArut('');
    setWordId('');
    setWordEn('');
    setCategory('Nomina');
    setPhonetic('');
    setMeaning('');
    setMeaningEn('');
    setExampleArut('');
    setExampleId('');
    setExampleEn('');
    setSelectedVillageId(userDefaultVillageId);
    setCustomVillageText('');
    setUsageField('💬 Tutur Sehari-hari');
    setSourceSpeaker(user?.name ? `${user.name}${user.honorificTitle ? ` (${user.honorificTitle})` : ''}` : 'Penutur Asli Mandiri');
    setCulturalContext('');
    setSynonymsInput('');
    setFormStep(1);
    setFormError('');
    setEditingRevisionWord(null);
    resetVoiceAudio();
  };

  const handleStartRevision = (word: ModeratedWordEntry) => {
    setEditingRevisionWord(word);
    setWordArut(word.wordArut);
    setWordId(word.wordId);
    setWordEn(word.wordEn || '');
    setCategory(word.category);
    setPhonetic(word.phonetic || '');
    setMeaning(word.meaning);
    setMeaningEn(word.meaningEn || '');
    setExampleArut(word.exampleArut || '');
    setExampleId(word.exampleId || '');
    setUsageField(word.usageField || '💬 Tutur Sehari-hari');
    setCulturalContext(word.culturalContext || '');
    setSynonymsInput(word.synonyms?.join(', ') || '');
    setRecordedAudioUrl(word.audioUrl || '');
    setFormStep(1);
    setFormError('');
    setIsAddModalOpen(true);
    triggerToast(`Membuka mode perbaikan untuk kata "${word.wordArut}"`);
  };

  const handleSaveDraft = () => {
    if (!wordArut.trim() && !wordId.trim()) {
      setFormError('Mohon isi minimal Kata Dayak Arut atau Arti sebelum menyimpan draf.');
      return;
    }
    const draftId = `draft-${Date.now()}`;
    const newDraft = {
      id: draftId,
      savedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      wordArut: wordArut.trim(),
      wordId: wordId.trim(),
      wordEn: wordEn.trim(),
      category,
      phonetic: phonetic.trim(),
      meaning: meaning.trim(),
      exampleArut: exampleArut.trim(),
      exampleId: exampleId.trim(),
      selectedVillageId,
      usageField,
      culturalContext: culturalContext.trim(),
      audioUrl: recordedAudioUrl
    };
    const updated = [newDraft, ...savedDrafts];
    setSavedDrafts(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('arut_word_drafts', JSON.stringify(updated));
    }
    resetWordForm();
    setIsAddModalOpen(false);
    triggerToast('💾 Draf kosakata berhasil disimpan sementara!');
  };

  const handleOpenDraft = (draft: any) => {
    setWordArut(draft.wordArut || '');
    setWordId(draft.wordId || '');
    setWordEn(draft.wordEn || '');
    setCategory(draft.category || 'Nomina');
    setPhonetic(draft.phonetic || '');
    setMeaning(draft.meaning || '');
    setExampleArut(draft.exampleArut || '');
    setExampleId(draft.exampleId || '');
    setSelectedVillageId(draft.selectedVillageId || userDefaultVillageId);
    setUsageField(draft.usageField || '💬 Tutur Sehari-hari');
    setCulturalContext(draft.culturalContext || '');
    setRecordedAudioUrl(draft.audioUrl || '');
    setEditingRevisionWord(null);
    setFormStep(1);
    setFormError('');
    setIsAddModalOpen(true);
    triggerToast(`Membuka draf "${draft.wordArut || 'Tanpa Judul'}"`);
  };

  const handleDeleteDraft = (draftId: string) => {
    const updated = savedDrafts.filter(d => d.id !== draftId);
    setSavedDrafts(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('arut_word_drafts', JSON.stringify(updated));
    }
    triggerToast('Draf berhasil dihapus.');
  };

  const handleBulkImportSubmit = () => {
    if (!bulkInputText.trim()) return;
    const lines = bulkInputText.trim().split('\n');
    const parsedWords: Array<Omit<DictionaryWord, 'id'>> = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const parts = trimmed.split(/[,;\t|]/).map(p => p.trim());
      if (parts.length >= 2) {
        parsedWords.push({
          wordArut: parts[0],
          wordId: parts[1],
          wordEn: parts[1],
          category: (parts[2] as any) || 'Nomina',
          phonetic: parts[0].toLowerCase().split('').join('-'),
          meaning: parts[1],
          meaningEn: parts[1],
          exampleArut: '',
          exampleId: '',
          exampleEn: '',
          dialect: parts[3] || effectiveDialectName,
          usageField: '💬 Tutur Sehari-hari',
          sourceSpeaker: user?.name ? `${user.name}${user.honorificTitle ? ` (${user.honorificTitle})` : ''}` : 'Kontributor'
        });
      }
    }
    if (parsedWords.length === 0) {
      triggerToast('⚠️ Format tidak sesuai. Pastikan ada kata dan artinya dipisah koma atau titik koma.');
      return;
    }
    const count = bulkAddWords(parsedWords);
    setBulkInputText('');
    setIsBulkModalOpen(false);
    triggerToast(`✓ Berhasil mengimpor ${count} kosakata ke antrean verifikasi!`);
  };

  const handleAddWordSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!wordArut.trim()) {
      setFormError('Mohon masukkan Kata Dayak Arut terlebih dahulu.');
      setFormStep(1);
      return;
    }
    if (!wordId.trim()) {
      setFormError('Mohon masukkan Arti / Terjemahan Bahasa Indonesia.');
      setFormStep(1);
      return;
    }
    if (!meaning.trim()) {
      setFormError('Mohon isi penjelasan makna atau konteks pemakaian kata.');
      if (formMode === 'guided') setFormStep(2);
      return;
    }

    setFormError('');
    const finalPhonetic = phonetic.trim() || wordArut.trim().toLowerCase().split('').join('-');

    if (editingRevisionWord) {
      resubmitWord(editingRevisionWord.id, {
        wordArut: wordArut.trim(),
        wordId: wordId.trim(),
        wordEn: wordEn.trim() || wordId.trim(),
        category,
        phonetic: finalPhonetic,
        meaning: meaning.trim(),
        meaningEn: meaningEn.trim() || meaning.trim(),
        exampleArut: exampleArut.trim(),
        exampleId: exampleId.trim(),
        exampleEn: exampleEn.trim() || exampleId.trim(),
        dialect: effectiveDialectName,
        usageField,
        sourceSpeaker,
        culturalContext: culturalContext.trim(),
        synonyms: synonymsInput ? synonymsInput.split(',').map(s => s.trim()).filter(Boolean) : [],
        audioUrl: recordedAudioUrl || undefined,
        audioSpeaker: user?.name ? `${user.name}${user.honorificTitle ? ` (${user.honorificTitle})` : ''}` : undefined,
      });
      setEditingRevisionWord(null);
      resetWordForm();
      setIsAddModalOpen(false);
      triggerToast('✓ Kosakata hasil perbaikan berhasil diajukan ulang ke antrean verifikator!');
      return;
    }

    addWord({
      wordArut: wordArut.trim(),
      wordId: wordId.trim(),
      wordEn: wordEn.trim() || wordId.trim(),
      category,
      phonetic: finalPhonetic,
      meaning: meaning.trim(),
      meaningEn: meaningEn.trim() || meaning.trim(),
      exampleArut: exampleArut.trim(),
      exampleId: exampleId.trim(),
      exampleEn: exampleEn.trim() || exampleId.trim(),
      dialect: effectiveDialectName,
      usageField,
      sourceSpeaker,
      culturalContext: culturalContext.trim(),
      synonyms: synonymsInput ? synonymsInput.split(',').map(s => s.trim()).filter(Boolean) : [],
      audioUrl: recordedAudioUrl || undefined,
      audioSpeaker: user?.name ? `${user.name}${user.honorificTitle ? ` (${user.honorificTitle})` : ''}` : undefined,
    });

    resetWordForm();
    setIsAddModalOpen(false);
    triggerToast(language === 'en' ? 'Word submitted to verification queue!' : 'Kosakata berhasil diajukan dan masuk ke antrean verifikasi!');
  };

  // Combine public dictionary + approved words
  const allDictionaryWords = useMemo(() => {
    const combined = [...ARUT_DICTIONARY];
    contributedWords.forEach(cw => {
      if (!combined.some(w => w.id === cw.id || w.wordArut.toLowerCase() === cw.wordArut.toLowerCase())) {
        combined.unshift(cw);
      }
    });
    return combined;
  }, [contributedWords]);

  // Real-time Duplicate & Similarity Checker
  const duplicateMatch = useMemo(() => {
    if (!wordArut.trim() || wordArut.trim().length < 2) return null;
    const clean = wordArut.trim().toLowerCase();

    if (editingRevisionWord && editingRevisionWord.wordArut.toLowerCase() === clean) {
      return null;
    }

    const inDict = allDictionaryWords.find(w => w.wordArut.toLowerCase() === clean);
    if (inDict) {
      return {
        type: 'dictionary' as const,
        message: `Kata "${inDict.wordArut}" sudah terdaftar resmi di Kamus (= ${inDict.wordId}). Anda dapat melanjutkan bila ini variasi dialek kampung lain.`
      };
    }

    const inQueue = moderatedWords.find(w => w.wordArut.toLowerCase() === clean && w.status === 'pending');
    if (inQueue) {
      return {
        type: 'queue' as const,
        message: `Kata "${inQueue.wordArut}" saat ini sedang dalam antrean verifikasi oleh ${inQueue.submitterName}.`
      };
    }

    const similar = allDictionaryWords
      .filter(w => w.wordArut.toLowerCase().startsWith(clean) && w.wordArut.toLowerCase() !== clean)
      .slice(0, 3);
    if (similar.length > 0) {
      return {
        type: 'similar' as const,
        message: `Kata serupa yang telah terbit: ${similar.map(s => s.wordArut).join(', ')}`
      };
    }

    return null;
  }, [wordArut, allDictionaryWords, moderatedWords, editingRevisionWord]);

  // Submissions filtered by current contributor
  const contributorSubmissions = useMemo(() => {
    return moderatedWords.filter(w => {
      if (user?.roles.includes('superadmin') || user?.roles.includes('admin')) {
        return true;
      }
      return w.submitterName.toLowerCase() === user?.name.toLowerCase() ||
             w.submitterName.toLowerCase().includes(user?.name.toLowerCase() || '___');
    });
  }, [moderatedWords, user]);

  const filteredMySubmissions = useMemo(() => {
    if (mySubmissionsStatusFilter === 'all') return contributorSubmissions;
    return contributorSubmissions.filter(w => w.status === mySubmissionsStatusFilter);
  }, [contributorSubmissions, mySubmissionsStatusFilter]);

  // Contributor metric summary stats
  const contribStats = useMemo(() => {
    return {
      total: contributorSubmissions.length,
      pending: contributorSubmissions.filter(w => w.status === 'pending').length,
      revision: contributorSubmissions.filter(w => w.status === 'revision').length,
      approved: contributorSubmissions.filter(w => w.status === 'approved').length,
      drafts: savedDrafts.length
    };
  }, [contributorSubmissions, savedDrafts]);

  const filteredDaftarWords = useMemo(() => {
    return allDictionaryWords.filter(w => {
      if (daftarCategoryFilter !== 'all' && w.category !== daftarCategoryFilter) return false;
      const q = (searchDaftarQuery || globalSearch).toLowerCase().trim();
      if (q) {
        const matchArut = w.wordArut.toLowerCase().includes(q);
        const matchId = w.wordId.toLowerCase().includes(q);
        const matchEn = w.wordEn?.toLowerCase().includes(q);
        const matchMeaning = w.meaning.toLowerCase().includes(q);
        return matchArut || matchId || matchEn || matchMeaning;
      }
      return true;
    });
  }, [allDictionaryWords, daftarCategoryFilter, searchDaftarQuery, globalSearch]);

  // -------------------------------------------------------------
  // STATES: AREA VERIFIKATOR
  // -------------------------------------------------------------
  const [verifierTab, setVerifierTab] = useState<'pending' | 'history' | 'guidelines'>('pending');
  const [searchHistoryQuery, setSearchHistoryQuery] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'all' | 'approved' | 'rejected' | 'revision'>('all');
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: 'revision' | 'rejection' | 'approval';
    wordId: string;
    wordName: string;
    noteText: string;
  }>({
    isOpen: false,
    type: 'approval',
    wordId: '',
    wordName: '',
    noteText: ''
  });

  const pendingWords = useMemo(() => {
    return moderatedWords.filter(w => w.status === 'pending');
  }, [moderatedWords]);

  const verifiedHistory = useMemo(() => {
    return moderatedWords.filter(w => {
      if (w.status === 'pending') return false;
      if (historyStatusFilter !== 'all' && w.status !== historyStatusFilter) return false;
      if (searchHistoryQuery.trim()) {
        const q = searchHistoryQuery.toLowerCase().trim();
        const matchArut = w.wordArut.toLowerCase().includes(q);
        const matchId = w.wordId.toLowerCase().includes(q);
        const matchNotes = w.adminNotes?.toLowerCase().includes(q);
        const matchVerifier = w.verifiedByName?.toLowerCase().includes(q) || w.verifiedBy?.toLowerCase().includes(q);
        return matchArut || matchId || matchNotes || matchVerifier;
      }
      return true;
    });
  }, [moderatedWords, historyStatusFilter, searchHistoryQuery]);

  const handleActionNoteSubmit = () => {
    if (!actionModal.wordId) return;
    if (actionModal.type === 'approval') {
      approveWord(actionModal.wordId, actionModal.noteText || 'Lolos verifikasi kesahihan dialek & tutur asli Dayak Arut.');
      triggerToast(language === 'en' ? `Word "${actionModal.wordName}" approved and published to dictionary!` : `Kosakata "${actionModal.wordName}" berhasil disahkan & terbit ke kamus!`);
    } else if (actionModal.type === 'revision') {
      requestRevision(actionModal.wordId, actionModal.noteText);
      triggerToast(language === 'en' ? 'Revision request sent to submitter.' : 'Permintaan revisi berhasil dikirim ke pengusul kata.');
    } else {
      rejectWord(actionModal.wordId, actionModal.noteText);
      triggerToast(language === 'en' ? 'Word rejected from database.' : 'Kosakata ditolak dan dicatat pada riwayat verifikasi.');
    }
    setActionModal({ isOpen: false, type: 'approval', wordId: '', wordName: '', noteText: '' });
  };

  // -------------------------------------------------------------
  // STATES: AREA ADMIN (Pengguna & Kelola Wilayah / Desa)
  // -------------------------------------------------------------
  const [adminTab, setAdminTab] = useState<'users' | 'regions'>('users');
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [searchRegionQuery, setSearchRegionQuery] = useState('');
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [editingRegionId, setEditingRegionId] = useState<string | null>(null);

  // Form Fields for Region
  const [regionName, setRegionName] = useState('');
  const [regionSubdistrict, setRegionSubdistrict] = useState('Kecamatan Arut Utara');
  const [regionRegency, setRegionRegency] = useState('Kabupaten Kotawaringin Barat');
  const [regionDesc, setRegionDesc] = useState('');
  const [regionIsIndigenous, setRegionIsIndigenous] = useState(true);

  const openAddRegionModal = () => {
    setEditingRegionId(null);
    setRegionName('');
    setRegionSubdistrict('Kecamatan Arut Utara');
    setRegionRegency('Kabupaten Kotawaringin Barat');
    setRegionDesc('');
    setRegionIsIndigenous(true);
    setIsRegionModalOpen(true);
  };

  const openEditRegionModal = (r: RegionVillage) => {
    setEditingRegionId(r.id);
    setRegionName(r.name);
    setRegionSubdistrict(r.subdistrict);
    setRegionRegency(r.regency);
    setRegionDesc(r.description);
    setRegionIsIndigenous(r.isIndigenousArut);
    setIsRegionModalOpen(true);
  };

  const handleSaveRegion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regionName.trim()) {
      alert('Nama desa/wilayah wajib diisi.');
      return;
    }
    if (editingRegionId) {
      updateRegion(editingRegionId, {
        name: regionName.trim(),
        subdistrict: regionSubdistrict.trim(),
        regency: regionRegency.trim(),
        description: regionDesc.trim(),
        isIndigenousArut: regionIsIndigenous
      });
      triggerToast(`Wilayah "${regionName}" berhasil diperbarui!`);
    } else {
      addRegion({
        name: regionName.trim(),
        subdistrict: regionSubdistrict.trim(),
        regency: regionRegency.trim(),
        description: regionDesc.trim(),
        isIndigenousArut: regionIsIndigenous,
        status: 'active'
      });
      triggerToast(`Desa/Wilayah "${regionName}" berhasil ditambahkan!`);
    }
    setIsRegionModalOpen(false);
  };

  const handleDeleteRegion = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus wilayah "${name}" dari daftar?`)) {
      deleteRegion(id);
      triggerToast(`Wilayah "${name}" dihapus.`);
    }
  };

  const filteredRegions = useMemo(() => {
    if (!regions) return [];
    const q = searchRegionQuery.toLowerCase().trim();
    if (!q) return regions;
    return regions.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.subdistrict.toLowerCase().includes(q) ||
      r.regency.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q)
    );
  }, [regions, searchRegionQuery]);

  const filteredAdminUsers = useMemo(() => {
    if (!searchUserQuery.trim()) return allUsers;
    const q = searchUserQuery.toLowerCase().trim();
    return allUsers.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.origin.toLowerCase().includes(q));
  }, [allUsers, searchUserQuery]);

  // -------------------------------------------------------------
  // STATES: AREA SUPERADMIN
  // -------------------------------------------------------------
  const [superTab, setSuperTab] = useState<'roles' | 'finance' | 'system'>('roles');
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  const handleRoleToggle = (targetUserId: string, currentRoles: UserRole[], toggledRole: UserRole) => {
    let newRoles: UserRole[];
    if (currentRoles.includes(toggledRole)) {
      if (currentRoles.length === 1) {
        alert('Setiap pengguna harus memiliki minimal 1 peran aktif.');
        return;
      }
      newRoles = currentRoles.filter(r => r !== toggledRole);
    } else {
      newRoles = [...currentRoles, toggledRole];
    }
    updateUserRoles(targetUserId, newRoles);
    triggerToast(language === 'en' ? 'User roles updated!' : 'Peran pengguna berhasil diperbarui!');
  };

  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(moderatedWords, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `basa_arut_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast('Cadangan basis data kosakata berhasil diunduh (JSON)!');
  };

  // -------------------------------------------------------------
  // STATES & HANDLERS: MY AKUN (PENGELOLAAN PROFIL SENDIRI)
  // -------------------------------------------------------------
  const [myAkunActiveTab, setMyAkunActiveTab] = useState<'profile' | 'security' | 'roles' | 'submissions' | 'verifications'>('profile');
  const [profileNameInput, setProfileNameInput] = useState(user?.name || '');
  const [profileTitleInput, setProfileTitleInput] = useState(user?.honorificTitle || '');
  const [profileAvatarInput, setProfileAvatarInput] = useState(user?.avatar || '');
  const [profileOriginInput, setProfileOriginInput] = useState(user?.origin || '');
  const [profileBioInput, setProfileBioInput] = useState(user?.bio || '');
  const [profileVillageSelect, setProfileVillageSelect] = useState('reg-01');
  const [profileCustomVillage, setProfileCustomVillage] = useState('');

  // Password fields
  const [oldPasswordInput, setOldPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');

  // Portfolio view in My Akun
  const [myPortfolioTab, setMyPortfolioTab] = useState<'submitted' | 'verified'>('submitted');
  const [myPortfolioSearch, setMyPortfolioSearch] = useState('');

  useEffect(() => {
    if (user) {
      setProfileNameInput(user.name);
      setProfileTitleInput(user.honorificTitle || '');
      setProfileAvatarInput(user.avatar);
      setProfileOriginInput(user.origin);
      setProfileBioInput(user.bio || '');
      if (user.villageId) {
        setProfileVillageSelect(user.villageId);
      } else {
        const found = regions.find(r => user.origin.toLowerCase().includes(r.name.toLowerCase()));
        if (found) setProfileVillageSelect(found.id);
      }
    }
  }, [user, regions]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileNameInput.trim()) {
      triggerToast('Nama lengkap tidak boleh kosong');
      return;
    }

    let finalOrigin = profileOriginInput;
    if (profileVillageSelect === 'custom') {
      finalOrigin = profileCustomVillage.trim() || profileOriginInput;
    } else {
      const foundReg = regions.find(r => r.id === profileVillageSelect);
      if (foundReg) {
        finalOrigin = `${foundReg.name}, ${foundReg.subdistrict}`;
      }
    }

    updateUserProfile({
      name: profileNameInput.trim(),
      honorificTitle: profileTitleInput.trim(),
      villageId: profileVillageSelect,
      avatar: profileAvatarInput.trim().toUpperCase() || profileNameInput.substring(0, 2).toUpperCase(),
      origin: finalOrigin,
      bio: profileBioInput.trim(),
    });

    triggerToast('✓ Profil dan domisili akun Anda berhasil diperbarui!');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasswordInput || newPasswordInput.length < 6) {
      triggerToast('⚠️ Kata sandi baru minimal 6 karakter');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      triggerToast('⚠️ Konfirmasi kata sandi tidak cocok');
      return;
    }
    setOldPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    triggerToast('✓ Kata sandi berhasil diperbarui dengan aman!');
  };

  // Words submitted by current user
  const userSubmissions = useMemo(() => {
    if (!user) return [];
    const list = moderatedWords.filter(
      w => w.submitterName.toLowerCase() === user.name.toLowerCase() ||
           w.submitterName.toLowerCase().includes(user.name.split(' ')[0].toLowerCase())
    );
    const baseList = list.length > 0 ? list : contributedWords.map(cw => ({
      ...cw,
      submitterName: user.name,
      submitterRole: user.badge,
      status: (cw.verifiedBy?.includes('Disetujui') ? 'approved' : 'pending') as any,
      submittedAt: cw.dateAdded || 'Tercatat',
    }));

    if (!myPortfolioSearch.trim()) return baseList;
    const q = myPortfolioSearch.toLowerCase().trim();
    return baseList.filter(item =>
      item.wordArut.toLowerCase().includes(q) ||
      item.wordId.toLowerCase().includes(q) ||
      item.meaning.toLowerCase().includes(q)
    );
  }, [user, moderatedWords, contributedWords, myPortfolioSearch]);

  // Words verified by current user
  const userVerifications = useMemo(() => {
    if (!user) return [];
    const verifiedList = moderatedWords.filter(w => w.status !== 'pending');
    if (!myPortfolioSearch.trim()) return verifiedList;
    const q = myPortfolioSearch.toLowerCase().trim();
    return verifiedList.filter(item =>
      item.wordArut.toLowerCase().includes(q) ||
      item.wordId.toLowerCase().includes(q) ||
      item.adminNotes?.toLowerCase().includes(q) ||
      item.verifiedBy?.toLowerCase().includes(q)
    );
  }, [user, moderatedWords, myPortfolioSearch]);

  // If not logged in, prompt sign in with demo accounts
  if (!isLoggedIn || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5', padding: '24px' }}>
        <div style={{ maxWidth: '560px', width: '100%', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', padding: '36px 32px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '12px', background: '#001529', color: '#1890ff', fontSize: '1.8rem', fontWeight: 800, marginBottom: '16px' }}>
            BA
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
            Portal Dashboard Basa Arut
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6, marginBottom: '24px' }}>
            Pusat kerja terpadu untuk Kontributor Bahasa, Verifikator Tutur Adat, Administrator Platform, dan Superadmin Master.
          </p>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '20px', textAlign: 'left' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '10px' }}>
              ⚡ Masuk Cepat Akun Demo (Uji Coba Langsung):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => loginDemo('superadmin')}
                style={{ padding: '10px 12px', background: '#001529', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span>👑 Superadmin</span>
                <span>Masuk →</span>
              </button>
              <button
                type="button"
                onClick={() => loginDemo('admin')}
                style={{ padding: '10px 12px', background: '#f0fdfa', color: '#0f766e', border: '1px solid #0d9488', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span>🛡️ Admin</span>
                <span>Masuk →</span>
              </button>
              <button
                type="button"
                onClick={() => loginDemo('elder')}
                style={{ padding: '10px 12px', background: '#f5f3ff', color: '#6d28d9', border: '1px solid #7c3aed', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span>📜 Damang Adat</span>
                <span>Masuk →</span>
              </button>
              <button
                type="button"
                onClick={() => loginDemo('volunteer')}
                style={{ padding: '10px 12px', background: '#ecfdf5', color: '#047857', border: '1px solid #059669', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span>🌿 Kontributor</span>
                <span>Masuk →</span>
              </button>
            </div>
          </div>

          <Link
            href="/masuk"
            style={{ display: 'block', padding: '10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#334155', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}
          >
            {language === 'en' ? 'Register or Sign In with Email' : 'Masuk atau Daftar dengan Email'}
          </Link>
        </div>
      </div>
    );
  }

  const highestRole = getHighestRole(user.roles);
  const highestRoleColor = getRoleBorderColor(highestRole);

  return (
    <div style={{
      height: '100vh',
      maxHeight: '100vh',
      display: 'flex',
      background: '#f0f2f5',
      color: '#1e293b',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Toast Notification */}
      {showToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          background: '#001529',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 9999,
          fontSize: '0.875rem',
          fontWeight: 600
        }}>
          <span style={{ color: '#52c41a', fontSize: '1rem' }}>✓</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. LEFT SIDEBAR (Sticky side menu, stays in place)        */}
      {/* ========================================================= */}
      <aside style={{
        width: isSidebarCollapsed ? '72px' : '240px',
        minWidth: isSidebarCollapsed ? '72px' : '240px',
        background: '#001529',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        height: '100vh',
        zIndex: 100,
        overflowY: 'auto',
        overflowX: 'hidden',
        flexShrink: 0
      }}>
        {/* Sidebar Brand Header */}
        <div style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
          padding: isSidebarCollapsed ? '0' : '0 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          gap: '12px'
        }}>
          {/* Logo Mark */}
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #1890ff 0%, #0050b3 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 850,
            fontSize: '1rem',
            letterSpacing: '0.5px',
            flexShrink: 0
          }}>
            BA
          </div>
          {!isSidebarCollapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.2px', whiteSpace: 'nowrap' }}>
                Basa Arut
              </div>
              <div style={{ fontSize: '0.625rem', color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase', fontWeight: 600 }}>
                Enterprise Portal
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Menu Navigation */}
        <nav style={{ padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {/* 1. Portal (Overview & Statistik) */}
          <button
            type="button"
            onClick={() => switchArea('overview')}
            title="Portal: Ringkasan & Statistik"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              gap: '12px',
              width: '100%',
              padding: isSidebarCollapsed ? '12px 0' : '10px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeArea === 'overview' ? '#1890ff' : 'transparent',
              color: activeArea === 'overview' ? '#ffffff' : '#94a3b8',
              fontWeight: activeArea === 'overview' ? 650 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
              boxShadow: activeArea === 'overview' ? '0 2px 8px rgba(24, 144, 255, 0.35)' : 'none'
            }}
          >
            <span style={{ fontSize: '1.15rem' }}>⊞</span>
            {!isSidebarCollapsed && <span>Portal</span>}
          </button>

          {/* 2. Area Kontributor */}
          <button
            type="button"
            onClick={() => switchArea('kontributor')}
            title="Area Kontributor: Usulan & Kosakata"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
              width: '100%',
              padding: isSidebarCollapsed ? '12px 0' : '10px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeArea === 'kontributor' ? '#1890ff' : 'transparent',
              color: activeArea === 'kontributor' ? '#ffffff' : '#94a3b8',
              fontWeight: activeArea === 'kontributor' ? 650 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
              boxShadow: activeArea === 'kontributor' ? '0 2px 8px rgba(24, 144, 255, 0.35)' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.15rem' }}>🌿</span>
              {!isSidebarCollapsed && <span>Area Kontributor</span>}
            </div>
            {!isSidebarCollapsed && (
              <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.15)', color: '#ffffff' }}>
                {contributedWords.length}
              </span>
            )}
          </button>

          {/* 3. Area Verifikator */}
          <button
            type="button"
            onClick={() => switchArea('verifikator')}
            title="Area Verifikator: Validasi Tutur Adat"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
              width: '100%',
              padding: isSidebarCollapsed ? '12px 0' : '10px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeArea === 'verifikator' ? '#1890ff' : 'transparent',
              color: activeArea === 'verifikator' ? '#ffffff' : '#94a3b8',
              fontWeight: activeArea === 'verifikator' ? 650 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
              boxShadow: activeArea === 'verifikator' ? '0 2px 8px rgba(24, 144, 255, 0.35)' : 'none',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.15rem' }}>📜</span>
              {!isSidebarCollapsed && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Area Verifikator</span>
                  {!isVerifier && <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>🔒</span>}
                </div>
              )}
            </div>
            {!isSidebarCollapsed ? (
              pendingWords.length > 0 ? (
                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', background: '#faad14', color: '#000000' }}>
                  {pendingWords.length}
                </span>
              ) : null
            ) : (
              pendingWords.length > 0 && (
                <span style={{ position: 'absolute', top: '8px', right: '14px', width: '8px', height: '8px', borderRadius: '50%', background: '#faad14' }} />
              )
            )}
          </button>

          {/* 4. Area Admin */}
          <button
            type="button"
            onClick={() => switchArea('admin')}
            title="Area Admin: Pengguna & Operasional"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
              width: '100%',
              padding: isSidebarCollapsed ? '12px 0' : '10px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeArea === 'admin' ? '#1890ff' : 'transparent',
              color: activeArea === 'admin' ? '#ffffff' : '#94a3b8',
              fontWeight: activeArea === 'admin' ? 650 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
              boxShadow: activeArea === 'admin' ? '0 2px 8px rgba(24, 144, 255, 0.35)' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.15rem' }}>🛡️</span>
              {!isSidebarCollapsed && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Area Admin</span>
                  {!isAdmin && <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>🔒</span>}
                </div>
              )}
            </div>
            {!isSidebarCollapsed && (
              <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.15)', color: '#ffffff' }}>
                {allUsers.length}
              </span>
            )}
          </button>

          {/* 5. Area Superadmin */}
          <button
            type="button"
            onClick={() => switchArea('superadmin')}
            title="Area Superadmin: Kontrol Sistem & Multi-Peran"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
              width: '100%',
              padding: isSidebarCollapsed ? '12px 0' : '10px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeArea === 'superadmin' ? '#1890ff' : 'transparent',
              color: activeArea === 'superadmin' ? '#ffffff' : '#94a3b8',
              fontWeight: activeArea === 'superadmin' ? 650 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
              boxShadow: activeArea === 'superadmin' ? '0 2px 8px rgba(24, 144, 255, 0.35)' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.15rem' }}>👑</span>
              {!isSidebarCollapsed && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Area Superadmin</span>
                  {!isSuperadmin && <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>🔒</span>}
                </div>
              )}
            </div>
            {!isSidebarCollapsed && (
              <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.15)', color: '#ffffff' }}>
                MASTER
              </span>
            )}
          </button>

          {/* 6. My Akun (Kelola Akun Sendiri) */}
          <button
            type="button"
            onClick={() => switchArea('akun')}
            title="My Akun: Kelola Profil & Kata Sandi"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
              width: '100%',
              padding: isSidebarCollapsed ? '12px 0' : '10px 14px',
              borderRadius: '6px',
              border: 'none',
              background: activeArea === 'akun' ? '#1890ff' : 'transparent',
              color: activeArea === 'akun' ? '#ffffff' : '#94a3b8',
              fontWeight: activeArea === 'akun' ? 650 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
              boxShadow: activeArea === 'akun' ? '0 2px 8px rgba(24, 144, 255, 0.35)' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.15rem' }}>👤</span>
              {!isSidebarCollapsed && <span>My Akun</span>}
            </div>
            {!isSidebarCollapsed && (
              <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.15)', color: '#ffffff' }}>
                PROFIL
              </span>
            )}
          </button>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '14px 4px' }} />

          {/* Direct Link: Kamus Publik */}
          <Link
            href="/kamus"
            title="Buka Kamus Publik"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              gap: '12px',
              padding: isSidebarCollapsed ? '10px 0' : '8px 14px',
              borderRadius: '6px',
              color: '#94a3b8',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: 500,
              transition: 'all 0.15s ease'
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>📖</span>
            {!isSidebarCollapsed && <span>Kamus Publik</span>}
          </Link>

          {/* Direct Link: Web Publik */}
          <Link
            href="/"
            title="Kembali ke Web Beranda"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              gap: '12px',
              padding: isSidebarCollapsed ? '10px 0' : '8px 14px',
              borderRadius: '6px',
              color: '#94a3b8',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: 500,
              transition: 'all 0.15s ease'
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>🌐</span>
            {!isSidebarCollapsed && <span>Lihat Web Beranda</span>}
          </Link>
        </nav>

        {/* Sidebar Footer: Role Quick Switch & Status */}
        <div style={{
          padding: isSidebarCollapsed ? '12px 6px' : '14px 16px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(0,0,0,0.2)'
        }}>
          {!isSidebarCollapsed ? (
            <div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                ⚡ Akun Demo Instan:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '12px' }}>
                <button
                  type="button"
                  onClick={() => { loginDemo('superadmin'); triggerToast('Beralih ke TEN (Superadmin Master)'); }}
                  style={{ padding: '4px 6px', background: '#002140', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#e2e8f0', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
                >
                  👑 TEN
                </button>
                <button
                  type="button"
                  onClick={() => { loginDemo('admin'); triggerToast('Beralih ke Admin Platform'); }}
                  style={{ padding: '4px 6px', background: '#002140', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#e2e8f0', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
                >
                  🛡️ Admin
                </button>
                <button
                  type="button"
                  onClick={() => { loginDemo('elder'); triggerToast('Beralih ke Damang Adat Arut Utara'); }}
                  style={{ padding: '4px 6px', background: '#002140', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#e2e8f0', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
                >
                  📜 Damang
                </button>
                <button
                  type="button"
                  onClick={() => { loginDemo('volunteer'); triggerToast('Beralih ke Relawan Kontributor'); }}
                  style={{ padding: '4px 6px', background: '#002140', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#e2e8f0', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
                >
                  🌿 Relawan
                </button>
              </div>

              {/* KV Cloudflare Status Pill */}
              <div style={{
                fontSize: '0.675rem',
                color: isKvConnected ? '#4ade80' : '#fbbf24',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 8px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '4px'
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: isKvConnected ? '#4ade80' : '#fbbf24' }} />
                <span>{isKvConnected ? 'Bahasa_KV Terhubung' : 'Mode Offline / Lokal'}</span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={toggleSidebar}
                title="Perluas Sidebar"
                style={{ width: '36px', height: '36px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ▶
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN APPLICATION CANVAS (Independent Content Scroll)    */}
      {/* ========================================================= */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        minWidth: 0,
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
        {/* TOP HEADER BAR (Sticky at Top) */}
        <header style={{
          height: '64px',
          minHeight: '64px',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 90,
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          flexShrink: 0
        }}>
          {/* Left: Hamburger toggle + Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              type="button"
              onClick={toggleSidebar}
              title="Perluas / Perkecil Menu"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.25rem',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '6px',
                transition: 'background 0.15s ease'
              }}
            >
              ☰
            </button>

            <div style={{ fontSize: '0.875rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ cursor: 'pointer' }} onClick={() => switchArea('overview')}>Portal Basa Arut</span>
              <span>/</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>
                {activeArea === 'overview'
                  ? 'Ringkasan Portal'
                  : activeArea === 'kontributor'
                  ? 'Area Kontributor'
                  : activeArea === 'verifikator'
                  ? 'Area Verifikator'
                  : activeArea === 'admin'
                  ? 'Area Admin'
                  : 'Area Superadmin'}
              </span>
            </div>
          </div>

          {/* Right: Search, Notifications, User Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '10px', color: '#94a3b8', fontSize: '0.85rem' }}>🔍</span>
              <input
                type="text"
                placeholder="Cari kosakata, arti..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                style={{
                  padding: '6px 12px 6px 32px',
                  borderRadius: '16px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: '0.825rem',
                  outline: 'none',
                  width: '200px',
                  transition: 'width 0.2s ease, border-color 0.2s ease'
                }}
                onFocus={(e) => (e.target.style.width = '260px')}
                onBlur={(e) => (e.target.style.width = '200px')}
              />
            </div>

            {/* Help Icon */}
            <button
              type="button"
              onClick={() => alert('Panduan Portal Basa Arut: Gunakan menu sebelah kiri untuk navigasi antar area kerja peranan Anda. Pertanyaan atau bantuan teknis dapat menghubungi tim kurasi di Arut Utara.')}
              title="Bantuan & Petunjuk Penggunaan"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 700
              }}
            >
              ?
            </button>

            {/* Notification Bell with Badge */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => switchArea('verifikator')}
                title={`${pendingWords.length} kosakata butuh verifikasi`}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  border: 'none',
                  background: '#f1f5f9',
                  color: '#475569',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                🔔
              </button>
              {pendingWords.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  borderRadius: '10px',
                  padding: '1px 5px',
                  minWidth: '16px',
                  textAlign: 'center',
                  border: '1.5px solid #ffffff'
                }}>
                  {pendingWords.length}
                </span>
              )}
            </div>

            {/* User Avatar + Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#001529',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid ${highestRoleColor}`
                }}>
                  {user.avatar || 'U'}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                    {user.name.split(' ')[0]}
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>▾</span>
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '44px',
                  width: '220px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  padding: '8px 0',
                  zIndex: 200
                }}>
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{user.email}</div>
                    <span style={{
                      display: 'inline-block',
                      marginTop: '4px',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      background: '#f1f5f9',
                      color: highestRoleColor
                    }}>
                      {highestRole.toUpperCase()}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { switchArea('akun'); setIsProfileOpen(false); }}
                    style={{ width: '100%', textAlign: 'left', padding: '8px 16px', fontSize: '0.85rem', color: '#334155', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <span>⚙️</span>
                    <span>Kelola My Akun</span>
                  </button>
                  <Link
                    href={`/akun?id=${user.id}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.85rem', color: '#0d9488', textDecoration: 'none' }}
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <span>🌐</span>
                    <span>Lihat Profil Publik</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => { logout(); setIsProfileOpen(false); }}
                    style={{ width: '100%', textAlign: 'left', padding: '8px 16px', fontSize: '0.85rem', color: '#dc2626', background: 'transparent', border: 'none', cursor: 'pointer', borderTop: '1px solid #f1f5f9' }}
                  >
                    🚪 Keluar (Sign Out)
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT SCROLLER */}
        <main style={{ padding: '20px 24px 60px 24px', flex: 1, minWidth: 0 }}>
          {/* ========================================================= */}
          {/* 1. DASHBOARD OVERVIEW: STATISTIK & METRIK (Hanya di Menu Dashboard) */}
          {/* ========================================================= */}
          {activeArea === 'overview' && (
            <div>
              {/* TOP 4 KPI CARDS (Matches Screenshot: Total Sales, Visits, */}
              {/* Payments, Operation Effect)                               */}
              <section style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                gap: '16px',
                marginBottom: '20px'
              }}>
            {/* Card 1: Total Kosakata (like Total Sales) */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '18px 20px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.85rem', marginBottom: '6px' }}>
                  <span>Total Kosakata Leksikon</span>
                  <span title="Total kosakata Dayak Arut yang telah terverifikasi dalam basis data" style={{ cursor: 'help' }}>ⓘ</span>
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                  {allDictionaryWords.length.toLocaleString('id-ID')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.75rem', marginTop: '10px', color: '#64748b' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Rasio Minggu <strong>13%</strong> <span style={{ color: '#10b981' }}>▲</span>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Rasio Hari <strong>10%</strong> <span style={{ color: '#ef4444' }}>▼</span>
                  </span>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '14px', paddingTop: '10px', fontSize: '0.75rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                <span>Penambahan Hari Ini:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>18 Kosakata</span>
              </div>
            </div>

            {/* Card 2: Antrean Verifikasi with SVG Wave (like Visits in screenshot) */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '18px 20px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.85rem', marginBottom: '6px' }}>
                  <span>Antrean Verifikasi Adat</span>
                  <span title="Kosakata yang menanti telaah Damang Adat" style={{ cursor: 'help' }}>ⓘ</span>
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                  {pendingWords.length.toLocaleString('id-ID')} Kata
                </div>
                {/* SVG Wave Flow Chart (teal/orange layers like screenshot) */}
                <div style={{ height: '46px', marginTop: '4px' }}>
                  <svg viewBox="0 0 200 50" style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                    <defs>
                      <linearGradient id="waveOrange" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#f97316" stopOpacity="0.1" />
                      </linearGradient>
                      <linearGradient id="waveCyan" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.85" />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
                      </linearGradient>
                    </defs>
                    <path d="M 0,38 Q 30,15 60,35 T 120,20 T 170,30 T 200,10 L 200,50 L 0,50 Z" fill="url(#waveOrange)" />
                    <path d="M 0,44 Q 30,22 60,12 T 120,28 T 170,14 T 200,20 L 200,50 L 0,50 Z" fill="url(#waveCyan)" />
                    <path d="M 0,44 Q 30,22 60,12 T 120,28 T 170,14 T 200,20" fill="none" stroke="#0891b2" strokeWidth="2" />
                  </svg>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '10px', paddingTop: '10px', fontSize: '0.75rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                <span>Rata-rata Respon:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>1.8 Hari Kerja</span>
              </div>
            </div>

            {/* Card 3: Penutur & Relawan with SVG Bar Chart (like Payments in screenshot) */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '18px 20px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.85rem', marginBottom: '6px' }}>
                  <span>Penutur & Relawan Aktif</span>
                  <span title="Relawan komunitas dan tetua penutur terdaftar" style={{ cursor: 'help' }}>ⓘ</span>
                </div>
                <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                  {allUsers.length} Penutur
                </div>
                {/* SVG Mini Bar Chart (Sky Blue bars like screenshot) */}
                <div style={{ height: '46px', marginTop: '4px' }}>
                  <svg viewBox="0 0 160 46" style={{ width: '100%', height: '100%' }}>
                    <rect x="8" y="22" width="14" height="24" rx="2" fill="#1890ff" />
                    <rect x="32" y="8" width="14" height="38" rx="2" fill="#1890ff" />
                    <rect x="56" y="14" width="14" height="32" rx="2" fill="#1890ff" />
                    <rect x="80" y="28" width="14" height="18" rx="2" fill="#1890ff" />
                    <rect x="104" y="20" width="14" height="26" rx="2" fill="#1890ff" />
                    <rect x="128" y="6" width="14" height="40" rx="2" fill="#1890ff" />
                  </svg>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '10px', paddingTop: '10px', fontSize: '0.75rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                <span>Tingkat Validitas Usulan:</span>
                <span style={{ fontWeight: 700, color: '#10b981' }}>92% Kesahihan</span>
              </div>
            </div>

            {/* Card 4: Operation Effect / Standar Adat (like Operation Effect 88% in screenshot) */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '18px 20px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.85rem', marginBottom: '6px' }}>
                  <span>Efektivitas Preservasi</span>
                  <span title="Cakupan fonetik dan kelengkapan leksikon adat" style={{ cursor: 'help' }}>ⓘ</span>
                </div>
                <div style={{ textAlign: 'center', padding: '6px 0' }}>
                  <div style={{ fontSize: '2.2rem', fontWeight: 850, color: '#1e293b' }}>
                    94%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                    Standar Tutur Damang Pangkut
                  </div>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '10px', paddingTop: '10px', fontSize: '0.75rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                <span>Status Basis Data:</span>
                <span style={{ fontWeight: 700, color: '#0284c7' }}>Siap Rilis Publik</span>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* TAB & FILTER BAR (Matches Screenshot: Sales/Visits tabs    */}
          {/* on left, All day/week/month/year & date range on right)   */}
          {/* ========================================================= */}
          {/* TAB & FILTER BAR (Matches Screenshot: Title on left, Time filters on right) */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px 8px 0 0',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            borderBottom: '1px solid #f1f5f9'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                📈 Tren Pendokumentasian & Statistik Leksikon Dayak Arut
              </span>
            </div>

            {/* Right: Time Range Buttons & Date Range (like screenshot) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {(['day', 'week', 'month', 'year'] as const).map(range => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setOverviewTimeRange(range)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: '4px 8px',
                      fontSize: '0.8rem',
                      fontWeight: overviewTimeRange === range ? 700 : 500,
                      color: overviewTimeRange === range ? '#1890ff' : '#64748b',
                      cursor: 'pointer'
                    }}
                  >
                    {range === 'day' ? 'Hari Ini' : range === 'week' ? 'Minggu Ini' : range === 'month' ? 'Bulan Ini' : 'Tahun Ini'}
                  </button>
                ))}
              </div>

              {/* Date Range Badge */}
              <div style={{
                padding: '4px 10px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '0.75rem',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span>2026-01-01 ~ 2026-12-31</span>
                <span>📅</span>
              </div>
            </div>
          </div>

          {/* OVERVIEW CONTENT CONTAINER */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderTop: 'none',
            borderRadius: '0 0 8px 8px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 7fr) minmax(0, 3fr)',
                  gap: '32px',
                  alignItems: 'start'
                }}>
                  {/* Left (70%): Store Sales Trend equivalent (Bar Chart) */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        Tren Pendokumentasian Kosakata Dayak Arut
                      </h3>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {(['2023', '2024', '2025', '2026'] as const).map(yr => (
                          <button
                            key={yr}
                            type="button"
                            onClick={() => setTrendYear(yr)}
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              border: '1px solid',
                              borderColor: trendYear === yr ? '#1890ff' : '#e2e8f0',
                              background: trendYear === yr ? '#e6f7ff' : '#ffffff',
                              color: trendYear === yr ? '#1890ff' : '#64748b',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            {yr}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* SVG Bar Chart with Horizontal Grid Lines (like screenshot) */}
                    <div style={{ position: 'relative', height: '240px', width: '100%', marginTop: '16px' }}>
                      <svg viewBox="0 0 600 240" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                        {/* Grid Lines */}
                        <line x1="40" y1="20" x2="590" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1="40" y1="60" x2="590" y2="60" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1="40" y1="100" x2="590" y2="100" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1="40" y1="140" x2="590" y2="140" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1="40" y1="180" x2="590" y2="180" stroke="#e2e8f0" strokeWidth="1" />

                        {/* Y-Axis Labels */}
                        <text x="30" y="24" fontSize="11" fill="#94a3b8" textAnchor="end">60</text>
                        <text x="30" y="64" fontSize="11" fill="#94a3b8" textAnchor="end">50</text>
                        <text x="30" y="104" fontSize="11" fill="#94a3b8" textAnchor="end">35</text>
                        <text x="30" y="144" fontSize="11" fill="#94a3b8" textAnchor="end">20</text>
                        <text x="30" y="184" fontSize="11" fill="#94a3b8" textAnchor="end">0</text>

                        {/* Year 2023 Bars */}
                        <rect x="80" y="70" width="22" height="110" fill="#93c5fd" rx="2" />
                        <rect x="106" y="90" width="22" height="90" fill="#2563eb" rx="2" />
                        <rect x="132" y="120" width="22" height="60" fill="#93c5fd" rx="2" />
                        <text x="117" y="200" fontSize="11" fill="#64748b" textAnchor="middle">2023</text>

                        {/* Year 2024 Bars */}
                        <rect x="210" y="150" width="22" height="30" fill="#93c5fd" rx="2" />
                        <rect x="236" y="130" width="22" height="50" fill="#2563eb" rx="2" />
                        <rect x="262" y="115" width="22" height="65" fill="#93c5fd" rx="2" />
                        <text x="247" y="200" fontSize="11" fill="#64748b" textAnchor="middle">2024</text>

                        {/* Year 2025 Bars */}
                        <rect x="340" y="125" width="22" height="55" fill="#93c5fd" rx="2" />
                        <rect x="366" y="35" width="22" height="145" fill="#2563eb" rx="2" />
                        <rect x="392" y="75" width="22" height="105" fill="#93c5fd" rx="2" />
                        <text x="377" y="200" fontSize="11" fill="#64748b" textAnchor="middle">2025</text>

                        {/* Year 2026 Bars */}
                        <rect x="470" y="145" width="22" height="35" fill="#93c5fd" rx="2" />
                        <rect x="496" y="85" width="22" height="95" fill="#2563eb" rx="2" />
                        <rect x="522" y="65" width="22" height="115" fill="#93c5fd" rx="2" />
                        <text x="507" y="200" fontSize="11" fill="#64748b" textAnchor="middle">2026</text>
                      </svg>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '14px', fontSize: '0.75rem', color: '#64748b' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: 12, height: 12, borderRadius: 2, background: '#93c5fd' }} />
                        <span>Kosakata Leksikon Umum</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: 12, height: 12, borderRadius: 2, background: '#2563eb' }} />
                        <span>Tutur Adat & Istilah Budaya</span>
                      </div>
                    </div>
                  </div>

                  {/* Right (30%): Sales Ranking equivalent (Leaderboard 1-7) */}
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                      Peringkat Penutur & Relawan
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        { rank: 1, name: 'Damang Adat Pangkut', words: '432,641', isDark: true },
                        { rank: 2, name: 'TEN (Superadmin Master)', words: '388,190', isDark: true },
                        { rank: 3, name: 'Tetua Sambi (Verifikator)', words: '294,402', isDark: true },
                        { rank: 4, name: 'Relawan Rian (Pangkut)', words: '182,510', isDark: false },
                        { rank: 5, name: 'Penutur Adat Penyombaan', words: '145,220', isDark: false },
                        { rank: 6, name: 'Komunitas Bahasa Gandis', words: '112,080', isDark: false },
                        { rank: 7, name: 'Generasi Muda Sukarami', words: '96,400', isDark: false },
                      ].map((item) => (
                        <div key={item.rank} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              background: item.isDark ? '#001529' : '#f1f5f9',
                              color: item.isDark ? '#ffffff' : '#475569',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.725rem',
                              fontWeight: 700
                            }}>
                              {item.rank}
                            </span>
                            <span style={{ color: '#334155', fontWeight: 500 }}>{item.name}</span>
                          </div>
                          <span style={{ fontWeight: 600, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                            {item.words}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Row in Overview: Quick Workspaces Shortcuts */}
                <div style={{ marginTop: '36px', paddingTop: '24px', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                    ⚡ Akses Langsung Modul Kerja:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    <div
                      onClick={() => switchArea('kontributor')}
                      style={{ padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', transition: 'border-color 0.15s ease' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#047857' }}>
                        <span>🌿</span>
                        <span>Usulkan Kosakata Baru</span>
                      </div>
                      <p style={{ fontSize: '0.775rem', color: '#64748b', margin: '6px 0 0' }}>
                        Tambahkan kata Dayak Arut baru, terjemahan, fonetik, dan dialek.
                      </p>
                    </div>

                    <div
                      onClick={() => switchArea('verifikator')}
                      style={{ padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', transition: 'border-color 0.15s ease' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#6d28d9' }}>
                        <span>📜</span>
                        <span>Verifikasi Tutur Adat</span>
                      </div>
                      <p style={{ fontSize: '0.775rem', color: '#64748b', margin: '6px 0 0' }}>
                        {pendingWords.length} kosakata menanti penelaahan kesahihan leksikon.
                      </p>
                    </div>

                    <div
                      onClick={() => switchArea('admin')}
                      style={{ padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', transition: 'border-color 0.15s ease' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f766e' }}>
                        <span>🛡️</span>
                        <span>Kelola Pengguna & Peran</span>
                      </div>
                      <p style={{ fontSize: '0.775rem', color: '#64748b', margin: '6px 0 0' }}>
                        Atur peran kontributor, verifikator, dan operasional platform.
                      </p>
                    </div>

                    <div
                      onClick={() => switchArea('superadmin')}
                      style={{ padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', transition: 'border-color 0.15s ease' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#b45309' }}>
                        <span>👑</span>
                        <span>Kontrol Cloudflare KV</span>
                      </div>
                      <p style={{ fontSize: '0.775rem', color: '#64748b', margin: '6px 0 0' }}>
                        Koneksi KV: <code>eddaaf1689e54ba0a11941ca0d5a1191</code>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

          {/* ========================================================= */}
          {/* 2. AREA KONTRIBUTOR VIEW (Luas, Bersih, Tanpa Statistik)  */}
          {/* ========================================================= */}
          {activeArea === 'kontributor' && (
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      🌿 Area Kerja Kontributor
                    </h2>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px', margin: 0 }}>
                      Kelola dan usulkan kosakata Dayak Arut untuk diverifikasi oleh tetua adat dan verifikator Kedamangan.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setIsBulkModalOpen(true)}
                      style={{
                        background: '#f8fafc',
                        color: '#334155',
                        border: '1px solid #cbd5e1',
                        padding: '8px 14px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>📥</span>
                      <span>Impor Massal (CSV)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { resetWordForm(); setIsAddModalOpen(true); }}
                      style={{
                        background: '#1890ff',
                        color: '#ffffff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(24,144,255,0.3)'
                      }}
                    >
                      <span>➕</span>
                      <span>Ajukan Kosakata Baru</span>
                    </button>
                  </div>
                </div>

                {/* 1. KOTAK METRIK STATUS KONTRIBUTOR (4 TILES) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '18px' }}>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                      📋
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Total Usulan Anda</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>{contribStats.total} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#94a3b8' }}>kata</span></div>
                    </div>
                  </div>

                  <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                      ⏳
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 600 }}>Menunggu Verifikasi</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#b45309' }}>{contribStats.pending} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#d97706' }}>kata</span></div>
                    </div>
                  </div>

                  <div style={{ background: contribStats.revision > 0 ? '#fff1f2' : '#f8fafc', border: contribStats.revision > 0 ? '1.5px solid #fecdd3' : '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: contribStats.revision > 0 ? '#ffe4e6' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                      {contribStats.revision > 0 ? '⚡' : '📝'}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.75rem', color: contribStats.revision > 0 ? '#be123c' : '#64748b', fontWeight: 700 }}>Perlu Revisi</span>
                        {contribStats.revision > 0 && (
                          <span style={{ fontSize: '0.65rem', background: '#e11d48', color: '#ffffff', padding: '1px 5px', borderRadius: '10px', fontWeight: 800 }}>Tindakan</span>
                        )}
                      </div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: contribStats.revision > 0 ? '#e11d48' : '#0f172a' }}>{contribStats.revision} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#94a3b8' }}>kata</span></div>
                    </div>
                  </div>

                  <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                      ✓
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>Lolos Masuk Kamus</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#059669' }}>{contribStats.approved} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#10b981' }}>terbit</span></div>
                    </div>
                  </div>
                </div>

                {/* THEMATIC QUESTS BANNER */}
                <div style={{ background: 'linear-gradient(90deg, #f0fdf4 0%, #ecfeff 100%)', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 16px', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.3rem' }}>🎯</span>
                    <div>
                      <div style={{ fontSize: '0.825rem', fontWeight: 750, color: '#0f766e' }}>
                        Misi Tematik Komunitas Minggu Ini
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                        Bantu lengkapi kosakata ranah budaya berikut untuk percepatan dokumentasi:
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {[
                      { label: '🛶 Sungai & Riam', field: '🛶 Sungai & Arut' },
                      { label: '🌳 Rimba & Satwa', field: '🌳 Rimba & Satwa' },
                      { label: '🌾 Ladang & Padi', field: '🌾 Pertanian & Ladang' },
                      { label: '🍲 Kuliner & Ramuan', field: '🍲 Kuliner & Ramuan' },
                      { label: '📜 Adat & Ritual', field: '📜 Adat & Ritual' },
                    ].map(q => (
                      <button
                        key={q.label}
                        type="button"
                        onClick={() => {
                          resetWordForm();
                          setUsageField(q.field);
                          setIsAddModalOpen(true);
                          triggerToast(`Membuka form pengusulan untuk ranah "${q.field}"`);
                        }}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '16px',
                          padding: '4px 10px',
                          fontSize: '0.725rem',
                          fontWeight: 700,
                          color: '#0f766e',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        + {q.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submenu Tabs */}
                <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '18px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setContribTab('daftar')}
                    style={{
                      padding: '8px 16px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: contribTab === 'daftar' ? '#1890ff' : '#64748b',
                      borderBottom: contribTab === 'daftar' ? '2.5px solid #1890ff' : '2.5px solid transparent',
                      background: 'transparent',
                      borderLeft: 'none', borderRight: 'none', borderTop: 'none', cursor: 'pointer'
                    }}
                  >
                    📚 Daftar Kosakata ({filteredDaftarWords.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setContribTab('my_submissions')}
                    style={{
                      padding: '8px 16px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: contribTab === 'my_submissions' ? '#1890ff' : '#64748b',
                      borderBottom: contribTab === 'my_submissions' ? '2.5px solid #1890ff' : '2.5px solid transparent',
                      background: 'transparent',
                      borderLeft: 'none', borderRight: 'none', borderTop: 'none', cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>📝 Usulan Saya ({contributorSubmissions.length})</span>
                    {contribStats.revision > 0 && (
                      <span style={{ fontSize: '0.65rem', background: '#e11d48', color: '#ffffff', padding: '1px 6px', borderRadius: '10px', fontWeight: 800 }}>
                        {contribStats.revision} Revisi
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setContribTab('drafts')}
                    style={{
                      padding: '8px 16px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: contribTab === 'drafts' ? '#1890ff' : '#64748b',
                      borderBottom: contribTab === 'drafts' ? '2.5px solid #1890ff' : '2.5px solid transparent',
                      background: 'transparent',
                      borderLeft: 'none', borderRight: 'none', borderTop: 'none', cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>💾 Draf Tersimpan ({savedDrafts.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setContribTab('pedoman')}
                    style={{
                      padding: '8px 16px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: contribTab === 'pedoman' ? '#1890ff' : '#64748b',
                      borderBottom: contribTab === 'pedoman' ? '2.5px solid #1890ff' : '2.5px solid transparent',
                      background: 'transparent',
                      borderLeft: 'none', borderRight: 'none', borderTop: 'none', cursor: 'pointer'
                    }}
                  >
                    📜 Pedoman Ejaan & Fonetik
                  </button>
                </div>

                {/* Contributor: Daftar Kosakata Tab */}
                {contribTab === 'daftar' && (
                  <div>
                    {/* Filter row */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        placeholder="Cari leksikon Arut / Indonesia..."
                        value={searchDaftarQuery}
                        onChange={(e) => setSearchDaftarQuery(e.target.value)}
                        style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', minWidth: '240px', flex: 1 }}
                      />
                      <select
                        value={daftarCategoryFilter}
                        onChange={(e) => setDaftarCategoryFilter(e.target.value)}
                        style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', background: '#ffffff' }}
                      >
                        <option value="all">Semua Kelas Kata</option>
                        <option value="Nomina">Nomina (Kata Benda)</option>
                        <option value="Verba">Verba (Kata Kerja)</option>
                        <option value="Adjektiva">Adjektiva (Kata Sifat)</option>
                        <option value="Pronomina">Pronomina (Kata Ganti)</option>
                        <option value="Numeralia">Numeralia (Kata Bilangan)</option>
                        <option value="Adverbia">Adverbia (Keterangan)</option>
                      </select>
                    </div>

                    {/* Table View for High Readability & Ergonomics */}
                    <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                            <th style={{ padding: '10px 14px' }}>Kata Dayak Arut</th>
                            <th style={{ padding: '10px 14px' }}>Arti Indonesia</th>
                            <th style={{ padding: '10px 14px' }}>Kelas Kata</th>
                            <th style={{ padding: '10px 14px' }}>Fonetik</th>
                            <th style={{ padding: '10px 14px' }}>Penjelasan Makna</th>
                            <th style={{ padding: '10px 14px' }}>Dialek Wilayah</th>
                            <th style={{ padding: '10px 14px' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredDaftarWords.slice(0, 50).map((w, idx) => (
                            <tr key={w.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                              <td style={{ padding: '10px 14px', fontWeight: 750, color: '#0f172a' }}>{w.wordArut}</td>
                              <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1890ff' }}>{w.wordId}</td>
                              <td style={{ padding: '10px 14px' }}>
                                <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#f1f5f9', fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                                  {w.category}
                                </span>
                              </td>
                              <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: '#64748b' }}>[{w.phonetic}]</td>
                              <td style={{ padding: '10px 14px', color: '#475569', maxWidth: '300px' }}>{w.meaning}</td>
                              <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '0.8rem' }}>{w.dialect || 'Arut'}</td>
                              <td style={{ padding: '10px 14px' }}>
                                <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.75rem' }}>✓ Terverifikasi</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Contributor: Pengajuan Saya Tab */}
                {contribTab === 'my_submissions' && (
                  <div>
                    {/* Status Filter Pills */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Status:</span>
                      {[
                        { id: 'all', label: 'Semua', count: contributorSubmissions.length },
                        { id: 'pending', label: '⏳ Menunggu Verifikasi', count: contribStats.pending },
                        { id: 'revision', label: '⚡ Perlu Revisi', count: contribStats.revision },
                        { id: 'approved', label: '✓ Disetujui / Terbit', count: contribStats.approved }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setMySubmissionsStatusFilter(tab.id as any)}
                          style={{
                            padding: '4px 12px',
                            borderRadius: '16px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            border: mySubmissionsStatusFilter === tab.id ? '1.5px solid #1890ff' : '1px solid #e2e8f0',
                            background: mySubmissionsStatusFilter === tab.id ? '#eff6ff' : '#ffffff',
                            color: mySubmissionsStatusFilter === tab.id ? '#1d4ed8' : '#475569'
                          }}
                        >
                          {tab.label} ({tab.count})
                        </button>
                      ))}
                    </div>

                    {filteredMySubmissions.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                        <p style={{ color: '#64748b', margin: '0 0 12px' }}>Tidak ada usulan dalam filter ini.</p>
                        <button
                          type="button"
                          onClick={() => { resetWordForm(); setIsAddModalOpen(true); }}
                          style={{ background: '#1890ff', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                        >
                          ➕ Ajukan Kata Sekarang
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                        {filteredMySubmissions.map((cw) => {
                          const isRevision = cw.status === 'revision';
                          const isApproved = cw.status === 'approved';
                          const isPending = cw.status === 'pending';
                          return (
                            <div
                              key={cw.id}
                              style={{
                                padding: '18px',
                                border: isRevision ? '1.5px solid #fecdd3' : '1px solid #e2e8f0',
                                borderRadius: '10px',
                                background: isRevision ? '#fffdfa' : '#ffffff',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                gap: '14px'
                              }}
                            >
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '8px' }}>
                                  <div>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{cw.wordArut}</span>
                                    {cw.phonetic && (
                                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', marginLeft: '6px' }}>
                                        /{cw.phonetic}/
                                      </span>
                                    )}
                                  </div>
                                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', whiteSpace: 'nowrap' }}>
                                    {cw.category}
                                  </span>
                                </div>

                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                                  {cw.dialect && (
                                    <span style={{ fontSize: '0.675rem', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', background: '#f1f5f9', color: '#475569' }}>
                                      📍 {cw.dialect}
                                    </span>
                                  )}
                                  {cw.usageField && (
                                    <span style={{ fontSize: '0.675rem', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', background: '#fef3c7', color: '#b45309' }}>
                                      {cw.usageField}
                                    </span>
                                  )}
                                  {cw.audioUrl && (
                                    <span style={{ fontSize: '0.675rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                                      🎙️ Ada Suara
                                    </span>
                                  )}
                                </div>

                                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1890ff', marginBottom: '6px' }}>
                                  {cw.wordId}
                                </div>
                                <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.5, margin: '0 0 10px 0' }}>
                                  {cw.meaning}
                                </p>

                                {cw.exampleArut && (
                                  <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', borderLeft: '3px solid #1890ff', fontSize: '0.75rem', marginBottom: '10px' }}>
                                    <div style={{ fontStyle: 'italic', color: '#334155' }}>"{cw.exampleArut}"</div>
                                    {cw.exampleId && <div style={{ color: '#64748b', marginTop: '2px' }}>Arti: {cw.exampleId}</div>}
                                  </div>
                                )}

                                {/* CATATAN REVISI VERIFIKATOR */}
                                {isRevision && (
                                  <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px', padding: '10px 12px', margin: '8px 0', fontSize: '0.775rem' }}>
                                    <div style={{ fontWeight: 800, color: '#be123c', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                                      <span>⚠️</span>
                                      <span>Catatan Perbaikan Verifikator:</span>
                                    </div>
                                    <p style={{ margin: 0, color: '#881337', fontStyle: 'italic', lineHeight: 1.45 }}>
                                      "{cw.verificationNote || 'Mohon perbaiki suku kata fonetik atau contoh kalimat tutur adat agar sesuai standar.'}"
                                    </p>
                                    <div style={{ marginTop: '6px', fontSize: '0.7rem', color: '#9f1239' }}>
                                      Verifikator: <strong>{cw.verifiedByVerifierName || 'Tetua Adat Kedamangan'}</strong>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div>
                                {isRevision && (
                                  <button
                                    type="button"
                                    onClick={() => handleStartRevision(cw)}
                                    style={{
                                      width: '100%',
                                      background: '#e11d48',
                                      color: '#ffffff',
                                      border: 'none',
                                      padding: '8px 12px',
                                      borderRadius: '6px',
                                      fontSize: '0.8rem',
                                      fontWeight: 800,
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '6px',
                                      marginBottom: '10px',
                                      boxShadow: '0 2px 5px rgba(225,29,72,0.3)'
                                    }}
                                  >
                                    <span>✏️</span>
                                    <span>Perbaiki & Ajukan Ulang</span>
                                  </button>
                                )}

                                <div style={{ paddingTop: '10px', borderTop: '1px solid #f1f5f9', fontSize: '0.725rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ color: '#94a3b8' }}>{cw.submittedAt || 'Baru diajukan'}</span>
                                  <span style={{
                                    fontWeight: 750,
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    background: isApproved ? '#ecfdf5' : isRevision ? '#fff1f2' : isPending ? '#fffbeb' : '#f1f5f9',
                                    color: isApproved ? '#059669' : isRevision ? '#e11d48' : isPending ? '#b45309' : '#475569',
                                    border: `1px solid ${isApproved ? '#a7f3d0' : isRevision ? '#fecdd3' : isPending ? '#fef3c7' : '#e2e8f0'}`
                                  }}>
                                    {isApproved ? '✓ Disetujui Adat' : isRevision ? '⚡ Perlu Revisi' : isPending ? '⏳ Menunggu Verifikasi' : cw.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Contributor: Tab Draf Tersimpan */}
                {contribTab === 'drafts' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <p style={{ fontSize: '0.825rem', color: '#64748b', margin: 0 }}>
                        Draf tersimpan secara lokal di peramban Anda. Anda dapat melanjutkan pengisian kapan saja sebelum mengajukannya ke verifikator.
                      </p>
                      <button
                        type="button"
                        onClick={() => { resetWordForm(); setIsAddModalOpen(true); }}
                        style={{
                          background: '#0d9488',
                          color: '#ffffff',
                          border: 'none',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        + Draf Baru
                      </button>
                    </div>

                    {savedDrafts.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💾</div>
                        <h4 style={{ margin: '0 0 6px', fontSize: '0.95rem', fontWeight: 700, color: '#334155' }}>Tidak ada draf tersimpan</h4>
                        <p style={{ color: '#64748b', fontSize: '0.8rem', margin: '0 0 16px' }}>
                          Gunakan tombol "Simpan Sebagai Draf" saat mengisi formulir kosakata jika belum memiliki data lengkap.
                        </p>
                        <button
                          type="button"
                          onClick={() => { resetWordForm(); setIsAddModalOpen(true); }}
                          style={{ background: '#1890ff', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                        >
                          Tulis Kosakata Sekarang
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                        {savedDrafts.map(draft => (
                          <div
                            key={draft.id}
                            style={{
                              padding: '16px',
                              border: '1px solid #cbd5e1',
                              borderRadius: '8px',
                              background: '#ffffff',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              gap: '12px'
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                                  {draft.wordArut || '(Kosakata Belum Dinamai)'}
                                </span>
                                <span style={{ fontSize: '0.675rem', padding: '2px 6px', borderRadius: '4px', background: '#f1f5f9', color: '#475569', fontWeight: 600 }}>
                                  {draft.category || 'Nomina'}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1890ff', marginBottom: '6px' }}>
                                {draft.wordId || '(Belum ada arti)'}
                              </div>
                              {draft.meaning && (
                                <p style={{ fontSize: '0.775rem', color: '#64748b', margin: 0, lineClamp: 2, overflow: 'hidden' }}>
                                  {draft.meaning}
                                </p>
                              )}
                              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '8px' }}>
                                Disimpan: {draft.savedAt}
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                              <button
                                type="button"
                                onClick={() => handleOpenDraft(draft)}
                                style={{
                                  flex: 1,
                                  background: '#0d9488',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  fontSize: '0.775rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                ✏️ Lanjutkan
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteDraft(draft.id)}
                                style={{
                                  background: '#fee2e2',
                                  color: '#b91c1c',
                                  border: 'none',
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  fontSize: '0.775rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                🗑️ Hapus
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Contributor: Pedoman */}
                {contribTab === 'pedoman' && (
                  <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
                      📜 Panduan Penulisan & Pelafalan Dayak Arut
                    </h3>
                    <ul style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.8, paddingLeft: '20px', margin: 0 }}>
                      <li><strong>Ejaan Fonetik</strong>: Gunakan huruf latin standar. Vokal pepet dan taling diberi keterangan fonetik jika ada perbedaan artikulasi.</li>
                      <li><strong>Konteks Sungai & Riam</strong>: Banyak kosakata khas yang berhubungan dengan perahu, arus air, tanaman bantaran sungai, dan nama jeram (riam).</li>
                      <li><strong>Contoh Kalimat Asli</strong>: Setiap kosakata sebaiknya menyertakan contoh kalimat yang sering dituturkan dalam percakapan sehari-hari atau ritual adat.</li>
                      <li><strong>Dialek Lokal</strong>: Cantumkan asal kampung tutur (contoh: Kelurahan Pangkut, Desa Sambi, Gandis, Pandau, Penyombaan).</li>
                    </ul>
                  </div>
                )}
              </div>
            )}

          {/* ========================================================= */}
          {/* 3. AREA VERIFIKATOR VIEW (Luas, Bersih, Tanpa Statistik)  */}
          {/* ========================================================= */}
          {activeArea === 'verifikator' && (
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
                {!isVerifier ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', border: '1.5px solid #7c3aed', borderRadius: '8px', background: '#f5f3ff' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📜 🔒</div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4c1d95', marginBottom: '8px' }}>
                      Wewenang Verifikator Diperlukan
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#6d28d9', maxWidth: '480px', margin: '0 auto 20px', lineHeight: 1.55 }}>
                      Halaman ini dikhususkan bagi Tetua Adat dan Verifikator Kedamangan Arut untuk memvalidasi leksikon usulan kontributor.
                    </p>
                    <button
                      type="button"
                      onClick={() => { loginDemo('elder'); triggerToast('Beralih ke Damang Adat Arut Utara'); }}
                      style={{ background: '#7c3aed', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Masuk Sebagai Damang Adat (Verifikator) →
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
                      <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#5b21b6', margin: 0 }}>
                          📜 Area Verifikator & Majelis Adat
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px', margin: 0 }}>
                          Tinjau keaslian tutur lisan, fonetik, dan makna kata yang diajukan oleh relawan.
                        </p>
                      </div>
                    </div>

                    {/* Submenu Tabs */}
                    <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '18px' }}>
                      <button
                        type="button"
                        onClick={() => setVerifierTab('pending')}
                        style={{
                          padding: '8px 16px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: verifierTab === 'pending' ? '#7c3aed' : '#64748b',
                          borderBottom: verifierTab === 'pending' ? '2.5px solid #7c3aed' : '2.5px solid transparent',
                          background: 'transparent',
                          borderLeft: 'none', borderRight: 'none', borderTop: 'none', cursor: 'pointer'
                        }}
                      >
                        ⏳ Butuh Verifikasi ({pendingWords.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setVerifierTab('history')}
                        style={{
                          padding: '8px 16px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: verifierTab === 'history' ? '#7c3aed' : '#64748b',
                          borderBottom: verifierTab === 'history' ? '2.5px solid #7c3aed' : '2.5px solid transparent',
                          background: 'transparent',
                          borderLeft: 'none', borderRight: 'none', borderTop: 'none', cursor: 'pointer'
                        }}
                      >
                        🗂️ Riwayat Keputusan ({verifiedHistory.length})
                      </button>
                    </div>

                    {/* Pending Words */}
                    {verifierTab === 'pending' && (
                      <div>
                        {pendingWords.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '36px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '2rem' }}>🎉</span>
                            <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: '8px 0 4px', color: '#0f172a' }}>Antrean Kosong</h4>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Semua usulan kosakata Dayak Arut telah diverifikasi.</p>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {pendingWords.map((pw) => (
                              <div key={pw.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '18px', background: '#ffffff' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <span style={{ fontSize: '1.3rem', fontWeight: 850, color: '#0f172a' }}>{pw.wordArut}</span>
                                      <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: '#f1f5f9', fontWeight: 700, color: '#475569' }}>
                                        {pw.category}
                                      </span>
                                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>[{pw.phonetic}]</span>
                                    </div>
                                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1890ff', marginTop: '4px' }}>
                                      Arti: {pw.wordId} {pw.wordEn && <span style={{ color: '#64748b', fontWeight: 400 }}>({pw.wordEn})</span>}
                                    </div>
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'right' }}>
                                    <div>Diajukan oleh: <strong>{pw.submitterName || 'Relawan'}</strong></div>
                                    <div>Dialek: <strong>{pw.dialect || 'Arut Utara'}</strong></div>
                                  </div>
                                </div>

                                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', fontSize: '0.85rem', color: '#334155', marginBottom: '14px', lineHeight: 1.5 }}>
                                  <strong>Makna & Konteks:</strong> {pw.meaning}
                                  {pw.exampleArut && (
                                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1', fontStyle: 'italic', color: '#64748b' }}>
                                      "{pw.exampleArut}" → {pw.exampleId}
                                    </div>
                                  )}
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
                                  <button
                                    type="button"
                                    onClick={() => setActionModal({ isOpen: true, type: 'rejection', wordId: pw.id, wordName: pw.wordArut, noteText: '' })}
                                    style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #ef4444', background: '#ffffff', color: '#dc2626', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                                  >
                                    ✕ Tolak
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setActionModal({ isOpen: true, type: 'revision', wordId: pw.id, wordName: pw.wordArut, noteText: '' })}
                                    style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #d97706', background: '#ffffff', color: '#b45309', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                                  >
                                    ↺ Minta Revisi Dialek
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setActionModal({ isOpen: true, type: 'approval', wordId: pw.id, wordName: pw.wordArut, noteText: '' })}
                                    style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #10b981', background: '#f0fdf4', color: '#059669', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                                    title="Tulis catatan adat resmi pengesahan"
                                  >
                                    📝 Setujui + Catatan Adat
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => { approveWord(pw.id); triggerToast(`Kosakata "${pw.wordArut}" berhasil disetujui masuk kamus!`); }}
                                    style={{ padding: '6px 16px', borderRadius: '6px', border: 'none', background: '#10b981', color: '#ffffff', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 4px rgba(16,185,129,0.3)' }}
                                  >
                                    ✓ Sahkan Masuk Kamus
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* History Tab */}
                    {verifierTab === 'history' && (
                      <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                              <th style={{ padding: '10px 14px' }}>Kata Arut</th>
                              <th style={{ padding: '10px 14px' }}>Arti</th>
                              <th style={{ padding: '10px 14px' }}>Pengusul</th>
                              <th style={{ padding: '10px 14px' }}>Status</th>
                              <th style={{ padding: '10px 14px' }}>Verifikator Penelaah</th>
                              <th style={{ padding: '10px 14px' }}>Waktu Telaah</th>
                              <th style={{ padding: '10px 14px' }}>Catatan Keputusan</th>
                            </tr>
                          </thead>
                          <tbody>
                            {verifiedHistory.map((h, idx) => (
                              <tr key={h.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                                <td style={{ padding: '10px 14px', fontWeight: 750, color: '#0f172a' }}>{h.wordArut}</td>
                                <td style={{ padding: '10px 14px', color: '#1890ff', fontWeight: 600 }}>{h.wordId}</td>
                                <td style={{ padding: '10px 14px', color: '#64748b' }}>{h.submitterName || 'Relawan'}</td>
                                <td style={{ padding: '10px 14px' }}>
                                  <span style={{
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    background: h.status === 'approved' ? '#ecfdf5' : h.status === 'rejected' ? '#fef2f2' : '#fffbeb',
                                    color: h.status === 'approved' ? '#059669' : h.status === 'rejected' ? '#dc2626' : '#b45309'
                                  }}>
                                    {h.status === 'approved' ? '✓ Disetujui' : h.status === 'rejected' ? '✕ Ditolak' : '↺ Butuh Revisi'}
                                  </span>
                                </td>
                                <td style={{ padding: '10px 14px' }}>
                                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.8rem' }}>
                                    {h.verifiedByName || h.verifiedBy?.replace(/^✓\s*Disetujui\s*oleh\s*/i, '') || 'Damang Adat Arut'}
                                  </div>
                                  {h.verifierRole && (
                                    <div style={{ fontSize: '0.7rem', color: '#7c3aed', fontWeight: 600 }}>
                                      {h.verifierRole}
                                    </div>
                                  )}
                                </td>
                                <td style={{ padding: '10px 14px', fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                                  {h.verifiedAt || 'Terverifikasi'}
                                </td>
                                <td style={{ padding: '10px 14px', color: '#334155', fontStyle: h.adminNotes ? 'italic' : 'normal' }}>
                                  {h.adminNotes || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          {/* ========================================================= */}
          {/* 4. AREA ADMIN VIEW (Luas, Bersih, Tanpa Statistik)        */}
          {/* ========================================================= */}
          {activeArea === 'admin' && (
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
                {!isAdmin ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', border: '1.5px solid #0d9488', borderRadius: '8px', background: '#f0fdfa' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🛡️ 🔒</div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#134e4a', marginBottom: '8px' }}>
                      Wewenang Administrator Diperlukan
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#0f766e', maxWidth: '480px', margin: '0 auto 20px', lineHeight: 1.55 }}>
                      Manajemen akun pengguna dan promosi peran verifikator hanya dapat diakses oleh Admin Platform.
                    </p>
                    <button
                      type="button"
                      onClick={() => { loginDemo('admin'); triggerToast('Beralih ke Admin Platform'); }}
                      style={{ background: '#0d9488', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Masuk Sebagai Admin Platform →
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
                      <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f766e', margin: 0 }}>
                          🛡️ Area Administrator Platform
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px', margin: 0 }}>
                          Kelola akun penutur, promosi verifikator, serta master data desa/wilayah tutur resmi Dayak Arut.
                        </p>
                      </div>
                      {adminTab === 'regions' && (
                        <button
                          type="button"
                          onClick={openAddRegionModal}
                          style={{
                            background: '#0d9488',
                            color: '#ffffff',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 6px rgba(13,148,136,0.3)'
                          }}
                        >
                          <span>➕</span>
                          <span>Tambah Desa / Wilayah Baru</span>
                        </button>
                      )}
                    </div>

                    {/* Admin Submenu Tabs */}
                    <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '18px' }}>
                      <button
                        type="button"
                        onClick={() => setAdminTab('users')}
                        style={{
                          padding: '8px 16px',
                          border: 'none',
                          borderBottom: adminTab === 'users' ? '2px solid #0d9488' : '2px solid transparent',
                          background: 'transparent',
                          color: adminTab === 'users' ? '#0d9488' : '#64748b',
                          fontWeight: adminTab === 'users' ? 700 : 500,
                          fontSize: '0.875rem',
                          cursor: 'pointer'
                        }}
                      >
                        👥 Pengguna & Wewenang ({allUsers.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdminTab('regions')}
                        style={{
                          padding: '8px 16px',
                          border: 'none',
                          borderBottom: adminTab === 'regions' ? '2px solid #0d9488' : '2px solid transparent',
                          background: 'transparent',
                          color: adminTab === 'regions' ? '#0d9488' : '#64748b',
                          fontWeight: adminTab === 'regions' ? 700 : 500,
                          fontSize: '0.875rem',
                          cursor: 'pointer'
                        }}
                      >
                        📍 Kelola Desa & Wilayah Tutur ({regions.length})
                      </button>
                    </div>

                    {/* TAB 1: USERS & ROLES */}
                    {adminTab === 'users' && (
                      <div>
                        {/* Filter User */}
                        <div style={{ marginBottom: '14px' }}>
                          <input
                            type="text"
                            placeholder="Cari nama pengguna, email, atau asal daerah..."
                            value={searchUserQuery}
                            onChange={(e) => setSearchUserQuery(e.target.value)}
                            style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', width: '100%', maxWidth: '400px' }}
                          />
                        </div>

                        {/* Users Table */}
                        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                            <thead>
                              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                                <th style={{ padding: '10px 14px' }}>Pengguna</th>
                                <th style={{ padding: '10px 14px' }}>Asal Wilayah</th>
                                <th style={{ padding: '10px 14px' }}>Peran Aktif</th>
                                <th style={{ padding: '10px 14px' }}>Status Verifikasi</th>
                                <th style={{ padding: '10px 14px' }}>Aksi Verifikasi Akun</th>
                                <th style={{ padding: '10px 14px' }}>Kelola Peran</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredAdminUsers.map((u, idx) => {
                                const verifyCheck = canVerifyTargetUser(user?.roles || [], u.roles);
                                const isTargetAdmin = u.roles.includes('admin');
                                const isTargetSuperadmin = u.roles.includes('superadmin');

                                return (
                                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                                    <td style={{ padding: '10px 14px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{
                                          width: '32px',
                                          height: '32px',
                                          borderRadius: '50%',
                                          background: '#eff6ff',
                                          color: '#1d4ed8',
                                          fontWeight: 800,
                                          fontSize: '0.75rem',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          border: `1.5px solid ${getRoleBorderColor(getHighestRole(u.roles))}`
                                        }}>
                                          {u.avatar || u.name.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span style={{ fontWeight: 750, color: '#0f172a' }}>{u.name}</span>
                                            {u.isVerified && (
                                              <span title={`Akun Terverifikasi Resmi (${u.verifiedByAdminName || 'Admin'})`} style={{ color: '#059669', fontSize: '0.85rem' }}>✓</span>
                                            )}
                                          </div>
                                          {u.honorificTitle && (
                                            <div style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 650 }}>
                                              👑 {u.honorificTitle}
                                            </div>
                                          )}
                                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                            {u.email} • <Link href={`/profil?id=${u.id}`} target="_blank" style={{ color: '#2563eb', textDecoration: 'none' }}>Lihat Profil ↗</Link>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td style={{ padding: '10px 14px', color: '#64748b' }}>{u.origin || '-'}</td>
                                    <td style={{ padding: '10px 14px' }}>
                                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                        {u.roles.map(r => (
                                          <span key={r} style={{
                                            padding: '2px 7px',
                                            borderRadius: '4px',
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                            background: r === 'superadmin' ? '#fef3c7' : r === 'admin' ? '#ccfbf1' : r === 'verifier' ? '#ede9fe' : '#f1f5f9',
                                            color: r === 'superadmin' ? '#92400e' : r === 'admin' ? '#0f766e' : r === 'verifier' ? '#6b21a8' : '#334155'
                                          }}>
                                            {r}
                                          </span>
                                        ))}
                                      </div>
                                    </td>
                                    <td style={{ padding: '10px 14px' }}>
                                      {u.isVerified ? (
                                        <div>
                                          <span style={{
                                            background: '#dcfce7',
                                            color: '#166534',
                                            border: '1px solid #bbf7d0',
                                            padding: '3px 8px',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            fontWeight: 750,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                          }}>
                                            <span>✓</span>
                                            <span>Terverifikasi</span>
                                          </span>
                                          <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '3px' }}>
                                            Oleh: {u.verifiedByAdminName || 'Admin'}
                                          </div>
                                        </div>
                                      ) : (
                                        <span style={{
                                          background: '#fef3c7',
                                          color: '#92400e',
                                          border: '1px solid #fde68a',
                                          padding: '3px 8px',
                                          borderRadius: '12px',
                                          fontSize: '0.725rem',
                                          fontWeight: 650
                                        }}>
                                          ⏳ Belum Terverifikasi
                                        </span>
                                      )}
                                    </td>
                                    <td style={{ padding: '10px 14px' }}>
                                      {isTargetSuperadmin ? (
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                          👑 Akun Superadmin
                                        </span>
                                      ) : isTargetAdmin && !isSuperadmin ? (
                                        <span
                                          style={{
                                            fontSize: '0.725rem',
                                            color: '#b45309',
                                            background: '#fffbeb',
                                            border: '1px solid #fde68a',
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                          }}
                                          title="Hanya Superadmin yang berwenang memverifikasi akun role Admin"
                                        >
                                          <span>🔒</span>
                                          <span>Butuh Superadmin</span>
                                        </span>
                                      ) : verifyCheck.canVerify ? (
                                        u.isVerified ? (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const res = unverifyUserAccount(u.id);
                                              triggerToast(res.message);
                                            }}
                                            style={{
                                              padding: '4px 10px',
                                              borderRadius: '6px',
                                              border: '1px solid #fca5a5',
                                              background: '#fef2f2',
                                              color: '#b91c1c',
                                              fontSize: '0.75rem',
                                              fontWeight: 650,
                                              cursor: 'pointer'
                                            }}
                                          >
                                            Cabut Verifikasi
                                          </button>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const res = verifyUserAccount(u.id);
                                              triggerToast(res.message);
                                            }}
                                            style={{
                                              padding: '5px 12px',
                                              borderRadius: '6px',
                                              border: 'none',
                                              background: '#059669',
                                              color: '#ffffff',
                                              fontSize: '0.75rem',
                                              fontWeight: 750,
                                              cursor: 'pointer',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '4px',
                                              boxShadow: '0 1px 3px rgba(5,150,105,0.3)'
                                            }}
                                          >
                                            <span>✓</span>
                                            <span>Verifikasi Akun</span>
                                          </button>
                                        )
                                      ) : (
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>-</span>
                                      )}
                                    </td>
                                    <td style={{ padding: '10px 14px' }}>
                                      {u.roles.includes('verifier') ? (
                                        <button
                                          type="button"
                                          onClick={() => handleRoleToggle(u.id, u.roles, 'verifier')}
                                          style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '0.75rem', cursor: 'pointer' }}
                                        >
                                          Cabut Verifikator
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => handleRoleToggle(u.id, u.roles, 'verifier')}
                                          style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: '#7c3aed', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                        >
                                          Promosikan Verifikator
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* TAB 2: KELOLA DESA / DOMISILI / WILAYAH */}
                    {adminTab === 'regions' && (
                      <div>
                        {/* Sinkronisasi Notice Alert */}
                        <div style={{
                          background: '#f0fdfa',
                          border: '1px solid #99f6e4',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          marginBottom: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          flexWrap: 'wrap'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '1.25rem' }}>📍</span>
                            <div style={{ fontSize: '0.85rem', color: '#115e59' }}>
                              <strong>Sinkronisasi Form Pendaftaran Aktif:</strong> Setiap desa yang aktif di sini langsung menjadi opsi domisili di halaman pendaftaran akun baru pengunjung (<code>/masuk</code>).
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
                            <span style={{ padding: '2px 8px', background: '#ccfbf1', color: '#0f766e', borderRadius: '12px' }}>
                              Total: {regions.length} Wilayah
                            </span>
                            <span style={{ padding: '2px 8px', background: '#ecfdf5', color: '#047857', borderRadius: '12px' }}>
                              🌿 Adat Arut: {regions.filter(r => r.isIndigenousArut).length} Desa
                            </span>
                          </div>
                        </div>

                        {/* Filter Region */}
                        <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                          <input
                            type="text"
                            placeholder="Cari nama desa, kecamatan, atau karakteristik tutur..."
                            value={searchRegionQuery}
                            onChange={(e) => setSearchRegionQuery(e.target.value)}
                            style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', width: '100%', maxWidth: '400px' }}
                          />
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            Menampilkan <strong>{filteredRegions.length}</strong> dari {regions.length} wilayah
                          </span>
                        </div>

                        {/* Regions Table */}
                        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                            <thead>
                              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                                <th style={{ padding: '10px 14px' }}>Nama Desa / Kelurahan</th>
                                <th style={{ padding: '10px 14px' }}>Kecamatan & Kabupaten</th>
                                <th style={{ padding: '10px 14px' }}>Kategori Wilayah</th>
                                <th style={{ padding: '10px 14px' }}>Karakteristik & Deskripsi Budaya</th>
                                <th style={{ padding: '10px 14px', textAlign: 'center' }}>Aksi</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredRegions.map((r, idx) => (
                                <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                                  <td style={{ padding: '12px 14px', fontWeight: 750, color: '#0f172a' }}>
                                    {r.name}
                                  </td>
                                  <td style={{ padding: '12px 14px', color: '#475569' }}>
                                    <div>{r.subdistrict}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{r.regency}</div>
                                  </td>
                                  <td style={{ padding: '12px 14px' }}>
                                    <span style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      padding: '3px 8px',
                                      borderRadius: '4px',
                                      fontSize: '0.75rem',
                                      fontWeight: 700,
                                      background: r.isIndigenousArut ? '#ecfdf5' : '#f1f5f9',
                                      color: r.isIndigenousArut ? '#047857' : '#475569',
                                      border: r.isIndigenousArut ? '1px solid #a7f3d0' : '1px solid #e2e8f0'
                                    }}>
                                      {r.isIndigenousArut ? '🌿 Wilayah Adat Arut' : '🌐 Domisili Umum'}
                                    </span>
                                  </td>
                                  <td style={{ padding: '12px 14px', color: '#64748b', maxWidth: '320px', lineHeight: 1.5 }}>
                                    {r.description || '-'}
                                  </td>
                                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                                      <button
                                        type="button"
                                        onClick={() => openEditRegionModal(r)}
                                        style={{
                                          padding: '5px 10px',
                                          borderRadius: '4px',
                                          border: '1px solid #cbd5e1',
                                          background: '#ffffff',
                                          fontSize: '0.75rem',
                                          fontWeight: 650,
                                          cursor: 'pointer',
                                          color: '#0f766e'
                                        }}
                                        title="Ubah data desa"
                                      >
                                        ✏️ Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteRegion(r.id, r.name)}
                                        style={{
                                          padding: '5px 8px',
                                          borderRadius: '4px',
                                          border: '1px solid #fecaca',
                                          background: '#fef2f2',
                                          fontSize: '0.75rem',
                                          fontWeight: 650,
                                          cursor: 'pointer',
                                          color: '#dc2626'
                                        }}
                                        title="Hapus desa"
                                      >
                                        🗑️
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              {filteredRegions.length === 0 && (
                                <tr>
                                  <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                                    Tidak ada desa atau wilayah yang cocok dengan pencarian "{searchRegionQuery}".
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          {/* ========================================================= */}
          {/* 5. AREA SUPERADMIN VIEW (Luas, Bersih, Tanpa Statistik)   */}
          {/* ========================================================= */}
          {activeArea === 'superadmin' && (
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
                {!isSuperadmin ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', border: '1.5px solid #f59e0b', borderRadius: '8px', background: '#fffbeb' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>👑 🔒</div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#78350f', marginBottom: '8px' }}>
                      Akses Khusus Superadmin Master (TEN)
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#92400e', maxWidth: '480px', margin: '0 auto 20px', lineHeight: 1.55 }}>
                      Kontrol multi-peran, Cloudflare KV real-time, audit donasi, dan pencadangan basis data memerlukan izin Superadmin.
                    </p>
                    <button
                      type="button"
                      onClick={() => { loginDemo('superadmin'); triggerToast('Beralih ke Superadmin Master (TEN)'); }}
                      style={{ background: '#f59e0b', color: '#000000', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}
                    >
                      Masuk Sebagai TEN (Superadmin Master) →
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
                      <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#b45309', margin: 0 }}>
                          👑 Area Superadmin Master
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px', margin: 0 }}>
                          Matriks multi-peran, integrasi Cloudflare KV, dan pemeliharaan platform.
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={handleExportBackup}
                          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          📥 Unduh Cadangan JSON
                        </button>
                        <button
                          type="button"
                          onClick={() => refreshKvData()}
                          style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: '#1890ff', color: '#ffffff', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          🔄 Sinkronisasi KV
                        </button>
                      </div>
                    </div>

                    {/* KV Connection Card */}
                    <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.1rem' }}>☁️</span>
                          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>Cloudflare Bahasa_KV Status</span>
                        </div>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: isKvConnected ? '#ecfdf5' : '#fffbeb',
                          color: isKvConnected ? '#059669' : '#b45309',
                          border: `1px solid ${isKvConnected ? '#6ee7b7' : '#fde68a'}`
                        }}>
                          {isKvConnected ? '● Terhubung Aktif' : '● Mode Lokal (Fallback)'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.6 }}>
                        <div>Namespace ID: <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>eddaaf1689e54ba0a11941ca0d5a1191</code></div>
                        <div>Status Deploy: Siap dideploy ke Cloudflare Pages Functions melalui GitHub Actions.</div>
                      </div>
                    </div>

                    {/* Submenu Tabs */}
                    <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '18px' }}>
                      <button
                        type="button"
                        onClick={() => setSuperTab('roles')}
                        style={{
                          padding: '8px 16px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: superTab === 'roles' ? '#b45309' : '#64748b',
                          borderBottom: superTab === 'roles' ? '2.5px solid #b45309' : '2.5px solid transparent',
                          background: 'transparent',
                          borderLeft: 'none', borderRight: 'none', borderTop: 'none', cursor: 'pointer'
                        }}
                      >
                        👥 Matriks Multi-Peran
                      </button>
                      <button
                        type="button"
                        onClick={() => setSuperTab('finance')}
                        style={{
                          padding: '8px 16px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: superTab === 'finance' ? '#b45309' : '#64748b',
                          borderBottom: superTab === 'finance' ? '2.5px solid #b45309' : '2.5px solid transparent',
                          background: 'transparent',
                          borderLeft: 'none', borderRight: 'none', borderTop: 'none', cursor: 'pointer'
                        }}
                      >
                        💰 Audit Donasi Budaya
                      </button>
                      <button
                        type="button"
                        onClick={() => setSuperTab('system')}
                        style={{
                          padding: '8px 16px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          color: superTab === 'system' ? '#b45309' : '#64748b',
                          borderBottom: superTab === 'system' ? '2.5px solid #b45309' : '2.5px solid transparent',
                          background: 'transparent',
                          borderLeft: 'none', borderRight: 'none', borderTop: 'none', cursor: 'pointer'
                        }}
                      >
                        ⚙️ Kontrol Sistem & Log
                      </button>
                    </div>

                    {/* Superadmin Roles Matrix */}
                    {superTab === 'roles' && (
                      <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                              <th style={{ padding: '10px 14px' }}>Nama Akun & Email</th>
                              <th style={{ padding: '10px 14px', textAlign: 'center' }}>Kontributor</th>
                              <th style={{ padding: '10px 14px', textAlign: 'center' }}>Verifikator</th>
                              <th style={{ padding: '10px 14px', textAlign: 'center' }}>Admin</th>
                              <th style={{ padding: '10px 14px', textAlign: 'center' }}>Superadmin</th>
                              <th style={{ padding: '10px 14px', textAlign: 'center' }}>Status Verifikasi</th>
                              <th style={{ padding: '10px 14px', textAlign: 'center' }}>Aksi Verifikasi Superadmin</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allUsers.map((u, idx) => (
                              <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                                <td style={{ padding: '10px 14px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontWeight: 750, color: '#0f172a' }}>{u.name}</span>
                                    {u.honorificTitle && (
                                      <span style={{ fontSize: '0.72rem', color: '#b45309', background: '#fef3c7', padding: '1px 6px', borderRadius: '4px' }}>
                                        👑 {u.honorificTitle}
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                    {u.email} • <Link href={`/profil?id=${u.id}`} target="_blank" style={{ color: '#2563eb', textDecoration: 'none' }}>Profil Publik ↗</Link>
                                  </div>
                                </td>
                                {(['contributor', 'verifier', 'admin', 'superadmin'] as UserRole[]).map(r => (
                                  <td key={r} style={{ padding: '10px 14px', textAlign: 'center' }}>
                                    <input
                                      type="checkbox"
                                      checked={u.roles.includes(r)}
                                      onChange={() => handleRoleToggle(u.id, u.roles, r)}
                                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                    />
                                  </td>
                                ))}
                                <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                                  {u.isVerified ? (
                                    <span style={{
                                      background: '#dcfce7',
                                      color: '#166534',
                                      border: '1px solid #bbf7d0',
                                      padding: '3px 8px',
                                      borderRadius: '12px',
                                      fontSize: '0.72rem',
                                      fontWeight: 750,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}>
                                      <span>✓</span>
                                      <span>Terverifikasi</span>
                                    </span>
                                  ) : (
                                    <span style={{
                                      background: '#fef3c7',
                                      color: '#92400e',
                                      border: '1px solid #fde68a',
                                      padding: '3px 8px',
                                      borderRadius: '12px',
                                      fontSize: '0.72rem',
                                      fontWeight: 650
                                    }}>
                                      Belum Verifikasi
                                    </span>
                                  )}
                                </td>
                                <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                                  {u.roles.includes('superadmin') ? (
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Superadmin Root</span>
                                  ) : u.isVerified ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const res = unverifyUserAccount(u.id);
                                        triggerToast(res.message);
                                      }}
                                      style={{
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        border: '1px solid #fca5a5',
                                        background: '#fef2f2',
                                        color: '#b91c1c',
                                        fontSize: '0.725rem',
                                        fontWeight: 650,
                                        cursor: 'pointer'
                                      }}
                                    >
                                      Cabut
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const res = verifyUserAccount(u.id);
                                        triggerToast(res.message);
                                      }}
                                      style={{
                                        padding: '4px 12px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: '#059669',
                                        color: '#ffffff',
                                        fontSize: '0.725rem',
                                        fontWeight: 750,
                                        cursor: 'pointer',
                                        boxShadow: '0 1px 3px rgba(5,150,105,0.3)'
                                      }}
                                    >
                                      ✓ Sahkan
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Superadmin Finance Tab */}
                    {superTab === 'finance' && (
                      <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                          <span style={{ fontWeight: 800, color: '#0f172a' }}>Total Dana Gotong Royong Terkumpul</span>
                          <span style={{ fontSize: '1.15rem', fontWeight: 850, color: '#059669' }}>Rp 28.500.000</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
                          Alokasi: 45% Honorarium Tetua Penutur Adat, 30% Rekaman Audio Lapangan & Riset Dialek, 25% Server & Domain Digital.
                        </p>
                      </div>
                    )}

                    {/* Superadmin System Tab */}
                    {superTab === 'system' && (
                      <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>Log Aktivitas Platform</h4>
                        <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div>[2026-09-07 16:20] Cloudflare KV connection ping OK (Latensi: 42ms)</div>
                          <div>[2026-09-07 15:45] Kosakata baru "Riam Mengkikit" diajukan oleh Relawan Pangkut</div>
                          <div>[2026-09-07 14:10] Damang Adat menyetujui 5 istilah adat perkawinan</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          {/* ========================================================= */}
          {/* 6. AREA MY AKUN (KELOLA PROFIL, KREDENSIAL & PORTOFOLIO)  */}
          {/* ========================================================= */}
          {activeArea === 'akun' && (
            <div>
              {/* Header Workspace */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '20px 24px',
                marginBottom: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.4rem' }}>👤</span>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      My Akun — Pengelolaan Profil & Portofolio Pribadi
                    </h2>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px', margin: 0 }}>
                    Kelola identitas diri, gelar adat, domisili tutur, kata sandi, dan pantau seluruh riwayat kosakata Anda.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <Link
                    href={`/profil?id=${user.id}`}
                    target="_blank"
                    style={{
                      background: '#f0fdf4',
                      color: '#15803d',
                      border: '1px solid #bbf7d0',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>🌐</span>
                    <span>Lihat Profil Publik Saya ↗</span>
                  </Link>
                </div>
              </div>

              {/* TAB-TAB MENU MY AKUN */}
              <div style={{
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                paddingBottom: '2px',
                marginBottom: '20px',
                borderBottom: '1px solid #e2e8f0'
              }}>
                {[
                  { id: 'profile' as const, label: '📝 Profil & Gelar Adat' },
                  { id: 'security' as const, label: '🔒 Keamanan & Sandi' },
                  { id: 'roles' as const, label: '🛡️ Hak Akses & Peran' },
                  { id: 'submissions' as const, label: `✍️ Usulan Kosakata (${userSubmissions.length})` },
                  { id: 'verifications' as const, label: `📜 Riwayat Verifikasi (${userVerifications.length})` },
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setMyAkunActiveTab(tab.id)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '8px 8px 0 0',
                      border: 'none',
                      borderBottom: myAkunActiveTab === tab.id ? '2.5px solid #1890ff' : '2.5px solid transparent',
                      background: myAkunActiveTab === tab.id ? '#ffffff' : 'transparent',
                      color: myAkunActiveTab === tab.id ? '#1890ff' : '#64748b',
                      fontWeight: myAkunActiveTab === tab.id ? 750 : 600,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: PROFIL & GELAR ADAT */}
              {myAkunActiveTab === 'profile' && (
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', maxWidth: '800px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📝</span>
                    <span>Data Diri & Gelar Adat</span>
                  </h3>

                  <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Form Terpisah: Nama Lengkap & Gelar Adat */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                          Nama Lengkap: <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: Ardianto"
                          value={profileNameInput}
                          onChange={(e) => setProfileNameInput(e.target.value)}
                          style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.875rem' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                          Gelar Adat / Akademik / Kehormatan (Opsional):
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: Damang Kepala Adat, Tetua Tutur, S.Pd."
                          value={profileTitleInput}
                          onChange={(e) => setProfileTitleInput(e.target.value)}
                          style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.875rem' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                          Email Terdaftar:
                        </label>
                        <input
                          type="email"
                          disabled
                          value={user.email}
                          style={{ width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.85rem', background: '#f8fafc', color: '#64748b' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                          Inisial / Emoji Avatar:
                        </label>
                        <input
                          type="text"
                          maxLength={4}
                          value={profileAvatarInput}
                          onChange={(e) => setProfileAvatarInput(e.target.value)}
                          placeholder="Contoh: SM, DA, atau 🌿"
                          style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        Desa Asal / Domisili Tutur Adat:
                      </label>
                      <select
                        value={profileVillageSelect}
                        onChange={(e) => setProfileVillageSelect(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', background: '#ffffff' }}
                      >
                        {regions.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.name} ({r.subdistrict}) {r.isIndigenousArut ? '🌿' : ''}
                          </option>
                        ))}
                        <option value="custom">➕ Domisili / Kampung Adat Lainnya...</option>
                      </select>
                      <span style={{ fontSize: '0.725rem', color: '#0d9488', marginTop: '4px', display: 'block' }}>
                        💡 Desa domisili ini akan otomatis menjadi pilihan default saat Anda mengajukan kosakata baru.
                      </span>
                    </div>

                    {profileVillageSelect === 'custom' && (
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0f766e', marginBottom: '4px' }}>
                          Ketikkan Nama Desa / Wilayah Domisili Anda:
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: Desa Sambi, Arut Utara"
                          value={profileCustomVillage}
                          onChange={(e) => setProfileCustomVillage(e.target.value)}
                          style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #0d9488', borderRadius: '6px', fontSize: '0.85rem' }}
                        />
                      </div>
                    )}

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        Biografi Singkat / Komitmen Pelestarian:
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Tuliskan komitmen atau bidang kebudayaan Dayak Arut yang Anda tekuni..."
                        value={profileBioInput}
                        onChange={(e) => setProfileBioInput(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', lineHeight: 1.5 }}
                      />
                    </div>

                    <button
                      type="submit"
                      style={{
                        padding: '10px 22px',
                        background: '#1890ff',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(24,144,255,0.3)',
                        alignSelf: 'flex-start',
                        marginTop: '6px'
                      }}
                    >
                      💾 Simpan Perubahan Profil
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: KEAMANAN & KATA SANDI */}
              {myAkunActiveTab === 'security' && (
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', maxWidth: '600px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🔒</span>
                    <span>Keamanan & Kata Sandi</span>
                  </h3>

                  <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        Kata Sandi Baru:
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Minimal 6 karakter"
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        Konfirmasi Kata Sandi Baru:
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Ketik ulang kata sandi baru"
                        value={confirmPasswordInput}
                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}
                      />
                    </div>

                    <button
                      type="submit"
                      style={{
                        padding: '10px 20px',
                        background: '#0f172a',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        alignSelf: 'flex-start',
                        marginTop: '6px'
                      }}
                    >
                      🔒 Perbarui Kata Sandi
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: HAK AKSES & PERAN */}
              {myAkunActiveTab === 'roles' && (
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', maxWidth: '750px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🛡️</span>
                    <span>Status Hak Akses & Peran Akun</span>
                  </h3>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {user.roles.map(r => (
                      <span
                        key={r}
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 750,
                          padding: '6px 14px',
                          borderRadius: '6px',
                          background: r === 'superadmin' ? '#FEF3C7' : r === 'admin' ? '#CCFBF1' : r === 'verifier' ? '#EDE9FE' : '#D1FAE5',
                          color: r === 'superadmin' ? '#92400E' : r === 'admin' ? '#115E59' : r === 'verifier' ? '#5B21B6' : '#065F46',
                          border: `1px solid ${getRoleBorderColor(r)}40`
                        }}
                      >
                        {r === 'superadmin' ? '👑 SUPERADMIN MASTER' : r === 'admin' ? '🛡️ ADMIN PLATFORM' : r === 'verifier' ? '📜 VERIFIKATOR ADAT' : '🌿 KONTRIBUTOR'}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: '#475569', lineHeight: 1.55 }}>
                    <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <strong>🌿 Kontributor:</strong> Dapat mengusulkan kosakata Dayak Arut baru, fonetik, dialek kampung, dan rekaman suara tutur asli.
                    </div>
                    {hasRole('verifier') && (
                      <div style={{ padding: '12px 14px', background: '#f5f3ff', borderRadius: '8px', border: '1px solid #e9d5ff', color: '#5b21b6' }}>
                        <strong>📜 Verifikator Adat:</strong> Berwenang menelaah, mengoreksi, dan mengesahkan usulan kosakata masyarakat agar terbit di kamus publik.
                      </div>
                    )}
                    {hasRole('admin') && (
                      <div style={{ padding: '12px 14px', background: '#f0fdfa', borderRadius: '8px', border: '1px solid #ccfbf1', color: '#115e59' }}>
                        <strong>🛡️ Admin:</strong> Berwenang mengelola pengguna, menetapkan peran, dan menambah master desa/wilayah domisili.
                      </div>
                    )}
                    {hasRole('superadmin') && (
                      <div style={{ padding: '12px 14px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a', color: '#92400e' }}>
                        <strong>👑 Superadmin Master:</strong> Akses penuh ke seluruh konfigurasi sistem, audit log, dan sinkronisasi Cloudflare KV.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: USULAN KOSAKATA SAYA */}
              {myAkunActiveTab === 'submissions' && (
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        Riwayat Kosakata yang Anda Usulkan ({userSubmissions.length})
                      </h3>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px', margin: 0 }}>
                        Pantau status penelaahan adat atas setiap kosakata yang Anda sumbangkan.
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Cari dalam usulan Anda..."
                        value={myPortfolioSearch}
                        onChange={(e) => setMyPortfolioSearch(e.target.value)}
                        style={{ padding: '7px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.825rem', width: '220px' }}
                      />

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedVillageId(userDefaultVillageId);
                          setIsAddModalOpen(true);
                        }}
                        style={{
                          padding: '7px 14px',
                          background: '#1890ff',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.825rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        ➕ Ajukan Kosakata Baru
                      </button>
                    </div>
                  </div>

                  {userSubmissions.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {userSubmissions.map((item) => {
                        const isApproved = item.status === 'approved' || (item as any).verifiedBy?.includes('Disetujui');
                        const isRejected = item.status === 'rejected' || (item as any).verifiedBy?.includes('Ditolak');

                        return (
                          <div
                            key={item.id}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              padding: '14px 18px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '12px'
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <strong style={{ fontSize: '1.15rem', color: '#0f172a' }}>{item.wordArut}</strong>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>/{item.phonetic}/</span>
                                <span style={{ fontSize: '0.7rem', padding: '1px 6px', background: '#e2e8f0', borderRadius: '4px', color: '#334155' }}>{item.category}</span>
                                {item.audioUrl && (
                                  <span style={{ fontSize: '0.675rem', color: '#059669', background: '#ecfdf5', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                    🎙️ Ada Audio
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '0.85rem', color: '#334155', marginTop: '3px' }}>
                                = {item.wordId} {item.wordEn ? `• (${item.wordEn})` : ''}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '3px' }}>
                                📍 Dialek: {item.dialect || 'Arut Utara'} • Tercatat: {(item as any).submittedAt || (item as any).dateAdded || 'Baru saja'}
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 750,
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  background: isApproved ? '#dcfce7' : isRejected ? '#fee2e2' : '#fef3c7',
                                  color: isApproved ? '#166534' : isRejected ? '#991b1b' : '#92400e',
                                  border: `1px solid ${isApproved ? '#bbf7d0' : isRejected ? '#fecaca' : '#fde68a'}`
                                }}
                              >
                                {isApproved ? '✓ Disetujui & Terbit di Kamus' : isRejected ? '✕ Ditolak' : '⏳ Menunggu Telaah Adat'}
                              </span>

                              {isApproved && (
                                <Link
                                  href={`/kamus?q=${encodeURIComponent(item.wordArut)}`}
                                  target="_blank"
                                  style={{
                                    fontSize: '0.75rem',
                                    padding: '5px 12px',
                                    background: '#ffffff',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    color: '#0284c7',
                                    textDecoration: 'none',
                                    fontWeight: 650
                                  }}
                                >
                                  Buka di Kamus ↗
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '36px', color: '#64748b', background: '#f8fafc', borderRadius: '8px' }}>
                      <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>🌿</div>
                      <div style={{ fontWeight: 600 }}>Belum ada usulan kosakata yang dicatat atas nama akun ini.</div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedVillageId(userDefaultVillageId);
                          setIsAddModalOpen(true);
                        }}
                        style={{ marginTop: '10px', padding: '6px 14px', background: '#1890ff', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 650, cursor: 'pointer' }}
                      >
                        ➕ Ajukan Kosakata Baru
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: RIWAYAT VERIFIKASI SAYA */}
              {myAkunActiveTab === 'verifications' && (
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        Riwayat Verifikasi & Kurasi Anda ({userVerifications.length})
                      </h3>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px', margin: 0 }}>
                        Arsip kosakata yang telah Anda periksa dan sahkan status adatnya.
                      </p>
                    </div>

                    <div style={{ maxWidth: '240px', width: '100%' }}>
                      <input
                        type="text"
                        placeholder="Cari dalam arsip verifikasi..."
                        value={myPortfolioSearch}
                        onChange={(e) => setMyPortfolioSearch(e.target.value)}
                        style={{ width: '100%', padding: '7px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.825rem' }}
                      />
                    </div>
                  </div>

                  {userVerifications.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {userVerifications.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            background: item.status === 'approved' ? '#f0fdf4' : item.status === 'rejected' ? '#fef2f2' : '#fffbeb',
                            border: `1px solid ${item.status === 'approved' ? '#bbf7d0' : item.status === 'rejected' ? '#fecaca' : '#fde68a'}`,
                            borderRadius: '8px',
                            padding: '14px 18px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '12px'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <strong style={{ fontSize: '1.15rem', color: '#0f172a' }}>{item.wordArut}</strong>
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>/{item.phonetic}/</span>
                              <span style={{ fontSize: '0.7rem', padding: '1px 6px', background: 'rgba(0,0,0,0.06)', borderRadius: '4px' }}>{item.category}</span>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#334155', marginTop: '3px' }}>
                              = {item.wordId} {item.wordEn ? `• (${item.wordEn})` : ''}
                            </div>
                            {item.adminNotes && (
                              <div style={{ fontSize: '0.75rem', color: '#047857', marginTop: '4px', fontStyle: 'italic' }}>
                                Catatan Telaah: "{item.adminNotes}"
                              </div>
                            )}
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 750,
                                padding: '4px 10px',
                                borderRadius: '6px',
                                background: item.status === 'approved' ? '#dcfce7' : item.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                                color: item.status === 'approved' ? '#166534' : item.status === 'rejected' ? '#991b1b' : '#92400e'
                              }}
                            >
                              {item.status === 'approved' ? '✓ Telah Disahkan' : item.status === 'rejected' ? '✕ Ditolak' : '↺ Perlu Revisi'}
                            </span>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                              Pengusul: {item.submitterName}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '36px', color: '#64748b', background: '#f8fafc', borderRadius: '8px' }}>
                      <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>📜</div>
                      <div style={{ fontWeight: 600 }}>Belum ada riwayat verifikasi kosakata yang dicatat atas nama akun ini.</div>
                    </div>
                  )}
                </div>
              )}

              {/* Sesi Keluar */}
              <div style={{ marginTop: '24px', textAlign: 'right' }}>
                <button
                  type="button"
                  onClick={logout}
                  style={{
                    padding: '8px 18px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
                    color: '#dc2626',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  🚪 Keluar dari Akun (Sign Out)
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================= */}
      {/* MODAL: ADD WORD (KONTRIBUTOR)                             */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', maxWidth: '920px', width: '100%', maxHeight: '92vh', overflowY: 'auto', padding: '24px 28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0' }}>
            
            {/* MODAL HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '18px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.4rem' }}>🌿</span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Usulkan Kosakata Dayak Arut Baru
                  </h3>
                </div>
                <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '4px 0 0 0' }}>
                  Bantu selamatkan dan dokumentasikan khazanah bahasa Dayak Arut. Usulan akan ditinjau oleh Tetua Adat.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Mode Switcher */}
                <button
                  type="button"
                  onClick={() => setFormMode(prev => prev === 'guided' ? 'quick' : 'guided')}
                  title="Ganti tampilan formulir"
                  style={{
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: formMode === 'guided' ? '#eff6ff' : '#f0fdf4',
                    color: formMode === 'guided' ? '#1d4ed8' : '#15803d',
                    border: `1px solid ${formMode === 'guided' ? '#bfdbfe' : '#bbf7d0'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  {formMode === 'guided' ? '⚡ Beralih ke Mode Ringkas' : '📖 Beralih ke Mode Terpandu (3 Langkah)'}
                </button>

                <button
                  type="button"
                  onClick={() => { resetWordForm(); setIsAddModalOpen(false); }}
                  style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#94a3b8', lineHeight: 1, padding: '4px' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* REVISION MODE BANNER */}
            {editingRevisionWord && (
              <div style={{ padding: '12px 16px', background: '#fff1f2', border: '1.5px solid #fecdd3', borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#be123c', fontSize: '0.85rem' }}>
                  <span>✏️ Mode Perbaikan Kosakata Usulan</span>
                  <span style={{ fontSize: '0.7rem', background: '#e11d48', color: '#ffffff', padding: '2px 7px', borderRadius: '10px' }}>Perlu Revisi</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#881337', marginTop: '4px', lineHeight: 1.45 }}>
                  Anda sedang menyempurnakan kata <strong>"{editingRevisionWord.wordArut}"</strong>. Catatan dari Verifikator Adat:
                  <div style={{ marginTop: '4px', padding: '6px 10px', background: '#ffffff', borderRadius: '6px', border: '1px solid #fecdd3', fontStyle: 'italic', fontWeight: 600 }}>
                    "{editingRevisionWord.verificationNote || 'Mohon perbaiki suku kata fonetik atau makna konteks tutur.'}"
                  </div>
                </div>
              </div>
            )}

            {/* ERROR BANNER */}
            {formError && (
              <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '0.825rem', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>⚠️ {formError}</span>
                <button type="button" onClick={() => setFormError('')} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 700 }}>✕</button>
              </div>
            )}

            {/* STEPPER PROGRESS (When Guided Mode) */}
            {formMode === 'guided' && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                {[
                  { step: 1 as const, label: '1. Kata & Arti Inti', desc: 'Identitas leksikon & wilayah' },
                  { step: 2 as const, label: '2. Pelafalan & Budaya', desc: 'Fonetik & ranah pemakaian' },
                  { step: 3 as const, label: '3. Contoh & Sumber Adat', desc: 'Contoh tutur & informan' }
                ].map(item => (
                  <button
                    key={item.step}
                    type="button"
                    onClick={() => setFormStep(item.step)}
                    style={{
                      flex: 1,
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: formStep === item.step ? '1.5px solid #1890ff' : '1px solid #e2e8f0',
                      background: formStep === item.step ? '#f0f9ff' : '#ffffff',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: '0.8rem', fontWeight: 750, color: formStep === item.step ? '#0284c7' : '#334155' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* TWO-COLUMN WORKSPACE: FORM INPUTS + LIVE CARD PREVIEW */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 0.95fr)', gap: '24px', alignItems: 'start' }}>
              
              {/* LEFT COLUMN: FORM INPUTS */}
              <div>
                <form onSubmit={handleAddWordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  {/* === STEP 1 (Or All in Quick Mode): IDENTITAS KATA === */}
                  {(formMode === 'quick' || formStep === 1) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* Special Dayak Arut Character Toolbar */}
                      <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                        <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>✨ Karakter Khas Basa Arut (klik untuk menyisipkan):</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {[
                            { char: 'é', label: 'é (taling)' },
                            { char: 'è', label: 'è (berat)' },
                            { char: 'ê', label: 'ê (pepet)' },
                            { char: '’', label: '’ (glotal/hentak)' },
                            { char: 'ng', label: 'ng' },
                            { char: 'ny', label: 'ny' }
                          ].map(item => (
                            <button
                              key={item.char}
                              type="button"
                              onClick={() => insertSpecialChar(item.char)}
                              title={`Tambahkan ${item.label} ke kata`}
                              style={{
                                padding: '3px 8px',
                                background: '#ffffff',
                                border: '1px solid #cbd5e1',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: '#1e293b',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              + {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Kata Dayak Arut */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 750, color: '#0f172a', marginBottom: '4px' }}>
                          Kata Dayak Arut <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={wordArut}
                          onChange={(e) => setWordArut(e.target.value)}
                          placeholder="Contoh: Monen, Pambelum, Ta’an"
                          style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 600 }}
                        />
                        <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px', display: 'block' }}>
                          Tuliskan bentuk dasar kata dalam ejaan Dayak Arut asli.
                        </span>

                        {/* LIVE DUPLICATE & SIMILARITY CHECKER */}
                        {duplicateMatch && (
                          <div style={{
                            marginTop: '8px',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            fontSize: '0.775rem',
                            lineHeight: 1.45,
                            background: duplicateMatch.type === 'dictionary' ? '#fffbeb' : duplicateMatch.type === 'queue' ? '#eff6ff' : '#f8fafc',
                            border: `1px solid ${duplicateMatch.type === 'dictionary' ? '#fde68a' : duplicateMatch.type === 'queue' ? '#bfdbfe' : '#e2e8f0'}`,
                            color: duplicateMatch.type === 'dictionary' ? '#92400e' : duplicateMatch.type === 'queue' ? '#1e40af' : '#475569',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px'
                          }}>
                            <span style={{ fontSize: '1rem' }}>{duplicateMatch.type === 'dictionary' ? '⚠️' : duplicateMatch.type === 'queue' ? '⏳' : '💡'}</span>
                            <div>
                              <strong>{duplicateMatch.type === 'dictionary' ? 'Sudah Ada di Kamus: ' : duplicateMatch.type === 'queue' ? 'Sedang Diverifikasi: ' : 'Kosakata Serupa: '}</strong>
                              <span>{duplicateMatch.message}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Arti Bahasa Indonesia */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 750, color: '#0f172a', marginBottom: '4px' }}>
                          Arti / Padanan Bahasa Indonesia <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={wordId}
                          onChange={(e) => setWordId(e.target.value)}
                          placeholder="Contoh: Menyeberangi sungai dengan perahu"
                          style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem' }}
                        />
                      </div>

                      {/* Kelas Kata & Asal Desa Tutur */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                            Kelas Kata <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as any)}
                            style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.825rem', background: '#ffffff' }}
                          >
                            <option value="Nomina">Nomina (Kata Benda)</option>
                            <option value="Verba">Verba (Kata Kerja)</option>
                            <option value="Adjektiva">Adjektiva (Kata Sifat)</option>
                            <option value="Pronomina">Pronomina (Kata Ganti)</option>
                            <option value="Numeralia">Numeralia (Kata Bilangan)</option>
                            <option value="Adverbia">Adverbia (Keterangan)</option>
                            <option value="Sapaan">Sapaan (Kekerabatan/Adat)</option>
                            <option value="Ungkapan Adat">Ungkapan Adat / Pepatah</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                            Asal Wilayah / Desa Tutur <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <select
                            value={selectedVillageId}
                            onChange={(e) => setSelectedVillageId(e.target.value)}
                            style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.825rem', background: '#ffffff' }}
                          >
                            {activeRegions.map(reg => (
                              <option key={reg.id} value={reg.id}>
                                {reg.name} {reg.isIndigenousArut ? '(🌿 Adat Asli)' : ''}
                              </option>
                            ))}
                            <option value="custom">➕ Wilayah / Kampung Adat Lainnya...</option>
                          </select>
                        </div>
                      </div>

                      {/* Custom Village Text if picked */}
                      {selectedVillageId === 'custom' && (
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0f766e', marginBottom: '4px' }}>
                            Tuliskan Nama Desa / Wilayah Tutur Adat:
                          </label>
                          <input
                            type="text"
                            placeholder="Contoh: Desa Batang Kawa / Kampung Adat Hilir"
                            value={customVillageText}
                            onChange={(e) => setCustomVillageText(e.target.value)}
                            style={{ width: '100%', padding: '7px 10px', border: '1.5px solid #0d9488', borderRadius: '6px', fontSize: '0.825rem' }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* === STEP 2 (Or in Quick Mode): PELAFALAN & RANAH BUDAYA === */}
                  {(formMode === 'quick' || formStep === 2) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* Ejaan Fonetik with Auto Button */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                            Ejaan Fonetik / Suku Kata
                          </label>
                          <button
                            type="button"
                            onClick={handleAutoPhonetic}
                            style={{
                              background: '#f0fdf4',
                              color: '#16a34a',
                              border: '1px solid #bbf7d0',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.725rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            ✨ Buat Fonetik Otomatis
                          </button>
                        </div>
                        <input
                          type="text"
                          value={phonetic}
                          onChange={(e) => setPhonetic(e.target.value)}
                          placeholder="Contoh: mo-nen, pam-be-lum"
                          style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}
                        />
                        <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px', display: 'block' }}>
                          Gunakan tanda hubung (-) untuk memisahkan suku kata pengucapan.
                        </span>
                      </div>

                      {/* Ranah Budaya (Pill Chips) */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                          Ranah Budaya / Konteks Pemakaian:
                        </label>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {[
                            '💬 Tutur Sehari-hari',
                            '🌾 Pertanian & Ladang',
                            '🛶 Sungai & Arut',
                            '🌳 Rimba & Satwa',
                            '📜 Adat & Ritual',
                            '👨‍👩‍👧 Hubungan Kekerabatan',
                            '🍲 Kuliner & Ramuan'
                          ].map(pill => (
                            <button
                              key={pill}
                              type="button"
                              onClick={() => setUsageField(pill)}
                              style={{
                                padding: '4px 10px',
                                borderRadius: '16px',
                                fontSize: '0.75rem',
                                fontWeight: 650,
                                cursor: 'pointer',
                                border: usageField === pill ? '1.5px solid #1890ff' : '1px solid #e2e8f0',
                                background: usageField === pill ? '#eff6ff' : '#ffffff',
                                color: usageField === pill ? '#1d4ed8' : '#475569',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {pill}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Penjelasan Makna & Konteks Budaya */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 750, color: '#0f172a', marginBottom: '4px' }}>
                          Penjelasan Makna & Konteks Budaya <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <textarea
                          rows={3}
                          required
                          value={meaning}
                          onChange={(e) => setMeaning(e.target.value)}
                          placeholder="Jelaskan arti kata lebih dalam, kapan kata ini biasa diucapkan, atau latar belakang budayanya..."
                          style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', lineHeight: 1.45 }}
                        />
                      </div>

                      {/* Terjemahan Bahasa Inggris (Opsional) */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                          Terjemahan Bahasa Inggris (English Translation - Opsional)
                        </label>
                        <input
                          type="text"
                          value={wordEn}
                          onChange={(e) => setWordEn(e.target.value)}
                          placeholder="Contoh: Crossing the river (Boleh dikosongkan)"
                          style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.825rem' }}
                        />
                      </div>
                    </div>
                  )}

                  {/* === STEP 3 (Or in Quick Mode): CONTOH TUTUR & SUMBER INFORMAN === */}
                  {(formMode === 'quick' || formStep === 3) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                            Contoh Tutur Kalimat Arut
                          </label>
                          <input
                            type="text"
                            value={exampleArut}
                            onChange={(e) => setExampleArut(e.target.value)}
                            placeholder="Contoh: Ulun handak tulak mandai..."
                            style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.825rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                            Arti Kalimat Contoh (Indonesia)
                          </label>
                          <input
                            type="text"
                            value={exampleId}
                            onChange={(e) => setExampleId(e.target.value)}
                            placeholder="Contoh: Saya mau pergi ke hulu..."
                            style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.825rem' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                            Sumber / Informan Tutur
                          </label>
                          <select
                            value={sourceSpeaker}
                            onChange={(e) => setSourceSpeaker(e.target.value)}
                            style={{ width: '100%', padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.825rem', background: '#ffffff' }}
                          >
                            <option value="Penutur Asli Mandiri">Penutur Asli Mandiri (Diri Sendiri)</option>
                            <option value="Tetua Adat / Tokoh Kampung">Tetua Adat / Damang / Mantir (Lisan)</option>
                            <option value="Orang Tua / Keluarga">Orang Tua / Warisan Lisan Keluarga</option>
                            <option value="Wawancara Lapangan">Wawancara Lapangan / Observasi</option>
                            <option value="Naskah / Arsip Tradisional">Naskah / Catatan Arsip Tradisional</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                            Sinonim / Kata Terkait (Opsional)
                          </label>
                          <input
                            type="text"
                            value={synonymsInput}
                            onChange={(e) => setSynonymsInput(e.target.value)}
                            placeholder="Pisahkan dengan koma"
                            style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.825rem' }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                          Catatan Khusus untuk Verifikator / Tetua Adat (Opsional)
                        </label>
                        <input
                          type="text"
                          value={culturalContext}
                          onChange={(e) => setCulturalContext(e.target.value)}
                          placeholder="Catatan variasi bunyi kampung atau saran penulisan..."
                          style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.825rem' }}
                        />
                      </div>

                      {/* FITUR REKAM / UNGGAH SUARA PENUTUR ASLI */}
                      <div style={{
                        background: recordedAudioUrl ? '#f0fdf4' : isRecording ? '#fef2f2' : '#f8fafc',
                        border: `1.5px dashed ${recordedAudioUrl ? '#86efac' : isRecording ? '#f87171' : '#cbd5e1'}`,
                        borderRadius: '10px',
                        padding: '14px',
                        transition: 'all 0.2s ease'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.825rem', fontWeight: 750, color: '#0f172a' }}>
                            <span>🎙️</span>
                            <span>Suara Pelafalan Penutur Asli</span>
                            <span style={{ fontSize: '0.72rem', fontWeight: 500, color: '#64748b', background: '#e2e8f0', padding: '2px 7px', borderRadius: '10px' }}>
                              Fleksibel / Opsional
                            </span>
                          </label>
                          {recordedAudioUrl && (
                            <button
                              type="button"
                              onClick={resetVoiceAudio}
                              style={{
                                border: 'none',
                                background: '#fee2e2',
                                color: '#b91c1c',
                                padding: '3px 9px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              🔄 Rekam Ulang / Hapus
                            </button>
                          )}
                        </div>

                        <p style={{ margin: '0 0 10px 0', fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>
                          Rekam langsung lafal kata oleh penutur Dayak Arut atau unggah berkas audio (.mp3, .wav, .m4a). Suara ini dapat diputar di kartu kamus untuk memperkaya pelafalan autentik penutur asli.
                        </p>

                        {/* CASE 1: SEDANG MEREKAM */}
                        {isRecording ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fee2e2', padding: '10px 14px', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{
                                display: 'inline-block',
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: '#ef4444',
                                animation: 'pulse 1s infinite'
                              }} />
                              <span style={{ fontSize: '0.85rem', fontWeight: 750, color: '#991b1b' }}>
                                Sedang Merekam... ({Math.floor(recordingSeconds / 60).toString().padStart(2, '0')}:{(recordingSeconds % 60).toString().padStart(2, '0')})
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={stopVoiceRecording}
                              style={{
                                background: '#dc2626',
                                color: '#ffffff',
                                border: 'none',
                                padding: '6px 14px',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              ⏹️ Selesai & Simpan
                            </button>
                          </div>
                        ) : recordedAudioUrl ? (
                          /* CASE 2: SUDAH ADA REKAMAN / TERUNGGAH (PREVIEW) */
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#166534', fontWeight: 650 }}>
                              <span>✅ Suara siap dilampirkan:</span>
                              <span style={{ color: '#047857', fontStyle: 'italic' }}>
                                Dituturkan oleh {user?.name || 'Kontributor'}{user?.honorificTitle ? ` (${user.honorificTitle})` : ''}
                              </span>
                            </div>
                            <audio
                              controls
                              src={recordedAudioUrl}
                              style={{ width: '100%', height: '36px' }}
                            />
                          </div>
                        ) : (
                          /* CASE 3: BELUM ADA AUDIO (TOMBOL REKAM / UNGGAH) */
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              onClick={startVoiceRecording}
                              style={{
                                flex: 1,
                                minWidth: '160px',
                                background: '#fef2f2',
                                border: '1.5px solid #fca5a5',
                                color: '#b91c1c',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                transition: 'background 0.15s ease'
                              }}
                            >
                              <span>🎙️</span>
                              <span>Mulai Rekam Suara</span>
                            </button>

                            <label
                              style={{
                                flex: 1,
                                minWidth: '160px',
                                background: '#f8fafc',
                                border: '1.5px solid #cbd5e1',
                                color: '#334155',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                textAlign: 'center'
                              }}
                            >
                              <span>📁</span>
                              <span>Unggah Berkas Audio</span>
                              <input
                                type="file"
                                accept="audio/*"
                                onChange={handleAudioFileUpload}
                                style={{ display: 'none' }}
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* FORM NAVIGATION BUTTONS */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => { resetWordForm(); setIsAddModalOpen(false); }}
                        style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '0.85rem', cursor: 'pointer', color: '#475569' }}
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveDraft}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '6px',
                          border: '1px solid #0d9488',
                          background: '#f0fdfa',
                          color: '#0f766e',
                          fontWeight: 700,
                          fontSize: '0.825rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <span>💾</span>
                        <span>Simpan Draf</span>
                      </button>
                    </div>

                    {formMode === 'guided' ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {formStep === 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (!wordArut.trim()) { setFormError('Mohon isi Kata Dayak Arut.'); return; }
                              if (!wordId.trim()) { setFormError('Mohon isi Arti Bahasa Indonesia.'); return; }
                              setFormError('');
                              if (!phonetic) handleAutoPhonetic();
                              setFormStep(2);
                            }}
                            style={{ padding: '8px 18px', borderRadius: '6px', border: 'none', background: '#1890ff', color: '#ffffff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                          >
                            Lanjut: Pelafalan & Budaya ➔
                          </button>
                        )}

                        {formStep === 2 && (
                          <>
                            <button
                              type="button"
                              onClick={() => setFormStep(1)}
                              style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '0.85rem', cursor: 'pointer' }}
                            >
                              ⬅ Kembali
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (!meaning.trim()) { setFormError('Mohon isi penjelasan makna kata.'); return; }
                                setFormError('');
                                setFormStep(3);
                              }}
                              style={{ padding: '8px 18px', borderRadius: '6px', border: 'none', background: '#1890ff', color: '#ffffff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                            >
                              Lanjut: Contoh & Sumber ➔
                            </button>
                          </>
                        )}

                        {formStep === 3 && (
                          <>
                            <button
                              type="button"
                              onClick={() => setFormStep(2)}
                              style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '0.85rem', cursor: 'pointer' }}
                            >
                              ⬅ Kembali
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddWordSubmit()}
                              style={{
                                padding: '9px 20px',
                                borderRadius: '6px',
                                border: 'none',
                                background: editingRevisionWord ? '#e11d48' : '#059669',
                                color: '#ffffff',
                                fontWeight: 750,
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                boxShadow: editingRevisionWord ? '0 2px 6px rgba(225,29,72,0.3)' : '0 2px 6px rgba(5,150,105,0.3)'
                              }}
                            >
                              {editingRevisionWord ? '🚀 Kirim Ulang Hasil Perbaikan' : '✨ Kirim Usulan Kosakata'}
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <button
                        type="submit"
                        style={{
                          padding: '9px 20px',
                          borderRadius: '6px',
                          border: 'none',
                          background: editingRevisionWord ? '#e11d48' : '#059669',
                          color: '#ffffff',
                          fontWeight: 750,
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          boxShadow: editingRevisionWord ? '0 2px 6px rgba(225,29,72,0.3)' : '0 2px 6px rgba(5,150,105,0.3)'
                        }}
                      >
                        {editingRevisionWord ? '🚀 Kirim Ulang Hasil Perbaikan' : '✨ Kirim Usulan Kosakata'}
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* RIGHT COLUMN: LIVE DICTIONARY CARD PREVIEW */}
              <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>👁️ Pratinjau Tampilan Kamus</span>
                  </div>
                  <span style={{ fontSize: '0.675rem', color: '#64748b' }}>Pembaruan real-time</span>
                </div>

                {/* THE CARD PREVIEW */}
                <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '18px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                  {/* Badges row */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#ecfdf5', color: '#059669', fontSize: '0.7rem', fontWeight: 700, border: '1px solid #a7f3d0' }}>
                      {category}
                    </span>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#f1f5f9', color: '#475569', fontSize: '0.675rem', fontWeight: 600 }}>
                      📍 {effectiveDialectName}
                    </span>
                    {usageField && (
                      <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#fef3c7', color: '#b45309', fontSize: '0.675rem', fontWeight: 600 }}>
                        {usageField}
                      </span>
                    )}
                  </div>

                  {/* Word title & Phonetic & Audio */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '6px' }}>
                    <div>
                      <span style={{ fontSize: '1.45rem', fontWeight: 850, color: '#0f172a', letterSpacing: '-0.3px' }}>
                        {wordArut.trim() || 'Kosakata Arut'}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic', marginLeft: '8px' }}>
                        /{phonetic.trim() || 'fo-ne-tik'}/
                      </span>
                    </div>
                    <button
                      type="button"
                      title="Dengarkan simulasi pengucapan"
                      onClick={() => {
                        if ('speechSynthesis' in window && wordArut.trim()) {
                          const u = new SpeechSynthesisUtterance(wordArut.trim());
                          u.lang = 'id-ID';
                          u.rate = 0.85;
                          window.speechSynthesis.speak(u);
                        }
                      }}
                      style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}
                    >
                      🔊
                    </button>
                  </div>

                  {/* Indonesian & English definitions */}
                  <div style={{ marginTop: '8px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1890ff' }}>
                      {wordId.trim() || 'Arti / terjemahan bahasa Indonesia'}
                    </div>
                    {wordEn.trim() && (
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                        {wordEn.trim()}
                      </div>
                    )}
                  </div>

                  {/* Explanation meaning */}
                  <p style={{ fontSize: '0.8rem', color: '#334155', lineHeight: 1.5, margin: '10px 0' }}>
                    {meaning.trim() || 'Penjelasan makna dan konteks kultural kata ini dalam pergaulan masyarakat Dayak Arut.'}
                  </p>

                  {/* Example sentences */}
                  {exampleArut.trim() ? (
                    <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', borderLeft: '3px solid #1890ff', fontSize: '0.775rem', marginBottom: '12px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontStyle: 'italic' }}>
                        "{exampleArut.trim()}"
                      </div>
                      {exampleId.trim() && (
                        <div style={{ color: '#64748b', marginTop: '3px' }}>
                          Arti: {exampleId.trim()}
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* Submitter & Source footer */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: '#94a3b8', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                    <span>Pengusul: <strong>{user?.name || 'Kontributor'}</strong></span>
                    <span>Sumber: <strong>{sourceSpeaker}</strong></span>
                  </div>
                </div>

                {/* Helpful Tips Card */}
                <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '0.75rem', color: '#1e40af', lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>💡 Tips Verifikasi Cepat:</div>
                  Kosakata yang menyertakan <strong>asal desa tutur</strong>, <strong>pemenggalan fonetik</strong>, dan <strong>contoh kalimat tutur</strong> memiliki kemungkinan disetujui lebih cepat oleh Damang Adat.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: IMPOR MASSAL KOSAKATA (CSV / TEKS)                */}
      {/* ========================================================= */}
      {isBulkModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '10px', maxWidth: '640px', width: '100%', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.3rem' }}>📥</span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Impor Massal Kosakata (CSV / Teks)
                  </h3>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>
                  Masukkan banyak kosakata sekaligus untuk diajukan ke antrean verifikasi tetua adat.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', marginBottom: '14px', fontSize: '0.775rem', color: '#475569' }}>
              <div style={{ fontWeight: 750, color: '#0f172a', marginBottom: '4px' }}>Format per baris (Pemisah Koma atau Titik Koma):</div>
              <code>Kata Arut, Arti Indonesia, Kelas Kata, Wilayah Asal</code>
              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '0.725rem' }}>Contoh: <em>Bantilung, Duduk bersila santai, Verba, Pangkut</em></span>
                <button
                  type="button"
                  onClick={() => {
                    setBulkInputText(
`Bantilung, Duduk bersila santai di beranda, Verba, Pangkut
Keleh, Sangat baik atau elok, Adjektiva, Sambi
Nyaruk, Mengarungi riam deras, Verba, Batang Kawa
Pambelum, Jiwa kehidupan dan nafas, Nomina, Arut`
                    );
                  }}
                  style={{ background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', borderRadius: '4px', padding: '3px 8px', fontSize: '0.725rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  📋 Muat Contoh Data
                </button>
              </div>
            </div>

            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Daftar Kosakata:
            </label>
            <textarea
              rows={8}
              value={bulkInputText}
              onChange={(e) => setBulkInputText(e.target.value)}
              placeholder={`Bantilung, Duduk bersila santai, Verba, Pangkut\nKeleh, Sangat baik, Adjektiva, Sambi\nNyaruk, Mengarungi riam, Verba, Sukamara`}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.825rem', fontFamily: 'monospace', lineHeight: 1.5, marginBottom: '14px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '0.85rem', cursor: 'pointer', color: '#475569' }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleBulkImportSubmit}
                style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', background: '#1890ff', color: '#ffffff', fontWeight: 750, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 6px rgba(24,144,255,0.3)' }}
              >
                📥 Impor Kosakata Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: VERIFIKATOR ACTION NOTE (APPROVAL / REVISION / REJECTION) */}
      {/* ========================================================= */}
      {actionModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '10px', maxWidth: '500px', width: '100%', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: 800,
              color: actionModal.type === 'approval' ? '#059669' : actionModal.type === 'revision' ? '#b45309' : '#dc2626',
              margin: '0 0 6px'
            }}>
              {actionModal.type === 'approval'
                ? '✓ Sahkan & Terbitkan Kosakata ke Kamus'
                : actionModal.type === 'revision'
                ? '↺ Permintaan Revisi Dialek / Fonetik'
                : '✕ Alasan Penolakan Kosakata'}
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', marginBottom: '14px', fontSize: '0.8rem', color: '#475569' }}>
              <span>Kosakata: <strong>{actionModal.wordName}</strong></span>
              <span>•</span>
              <span>Verifikator: <strong>{user?.name || 'Damang Adat'}</strong></span>
            </div>

            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              {actionModal.type === 'approval'
                ? 'Catatan Pengesahan Adat (Opsional / Rekomendasi):'
                : actionModal.type === 'revision'
                ? 'Koreksi yang Diperlukan oleh Pengusul:'
                : 'Alasan Penolakan:'}
            </label>
            <textarea
              rows={4}
              placeholder={
                actionModal.type === 'approval'
                  ? 'Contoh: Kosakata ini sah dan lazim dituturkan di hulu Arut. Lolos verifikasi kaidah tutur adat...'
                  : actionModal.type === 'revision'
                  ? 'Jelaskan koreksi ejaan atau pelafalan yang dibutuhkan...'
                  : 'Jelaskan alasan penolakan (misal: bukan kosakata Dayak Arut)...'
              }
              value={actionModal.noteText}
              onChange={(e) => setActionModal({ ...actionModal, noteText: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '14px', lineHeight: 1.5 }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setActionModal({ isOpen: false, type: 'approval', wordId: '', wordName: '', noteText: '' })}
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleActionNoteSubmit}
                style={{
                  padding: '8px 18px',
                  borderRadius: '6px',
                  border: 'none',
                  background: actionModal.type === 'approval' ? '#059669' : actionModal.type === 'revision' ? '#f59e0b' : '#ef4444',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: actionModal.type === 'approval' ? '0 2px 6px rgba(5,150,105,0.3)' : 'none'
                }}
              >
                {actionModal.type === 'approval' ? '✓ Sahkan Sekarang' : 'Kirim Keputusan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: TAMBAH / EDIT DESA & WILAYAH TUTUR (ADMIN)         */}
      {/* ========================================================= */}
      {isRegionModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '8px', maxWidth: '500px', width: '100%', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f766e', margin: 0 }}>
                {editingRegionId ? '✏️ Edit Data Desa & Wilayah' : '📍 Tambah Desa & Wilayah Tutur Baru'}
              </h3>
              <button type="button" onClick={() => setIsRegionModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
            </div>
            <form onSubmit={handleSaveRegion} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Nama Desa / Kelurahan / Wilayah *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Desa Sambi / Kelurahan Pangkut"
                  value={regionName}
                  onChange={(e) => setRegionName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Kecamatan *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kecamatan Arut Utara"
                    value={regionSubdistrict}
                    onChange={(e) => setRegionSubdistrict(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Kabupaten *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kabupaten Kotawaringin Barat"
                    value={regionRegency}
                    onChange={(e) => setRegionRegency(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Karakteristik Tutur & Keterangan Budaya:
                </label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan kekhasan tutur leksikon, dialek, atau latar belakang kampung adat ini..."
                  value={regionDesc}
                  onChange={(e) => setRegionDesc(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: '#f0fdfa', borderRadius: '6px', border: '1px solid #ccfbf1' }}>
                <input
                  type="checkbox"
                  id="indigenousCheck"
                  checked={regionIsIndigenous}
                  onChange={(e) => setRegionIsIndigenous(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#0d9488', cursor: 'pointer' }}
                />
                <label htmlFor="indigenousCheck" style={{ fontSize: '0.8rem', fontWeight: 650, color: '#134e4a', cursor: 'pointer' }}>
                  🌿 Merupakan Wilayah Tutur Adat Dayak Arut Asli
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsRegionModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#0d9488',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(13,148,136,0.3)'
                  }}
                >
                  {editingRegionId ? 'Simpan Perubahan' : 'Tambahkan Wilayah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
        <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⚡</div>
          Memuat Dashboard Basa Arut...
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
