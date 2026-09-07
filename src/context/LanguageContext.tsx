'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type SupportedLanguage = 'id' | 'en';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
}

const UI_TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  id: {
    // Nav
    'nav.translate': 'Terjemahan',
    'nav.dictionary': 'Kamus',
    'nav.contributors': 'Kontributor',
    'nav.donate': 'Donasi',
    'nav.contributorArea': 'Area Kontributor',
    'nav.auth': 'Masuk / Daftar',
    'nav.logout': 'Keluar',
    'brand.subtitle': 'Pelestarian Bahasa & Budaya Dayak Arut',

    // Hero
    'hero.tag': 'Warisan Tutur Adat Kotawaringin Barat',
    'hero.title': 'Pelestarian Digital Bahasa Dayak Arut',
    'hero.desc': 'Mendokumentasikan kearifan lisan, leksikografi, dan dialek masyarakat adat sepanjang Sungai Arut secara terbuka, interaktif, dan terhubung ke dunia internasional.',
    'hero.btnTranslate': 'Mulai Terjemahan',
    'hero.btnDictionary': 'Jelajahi Kamus',
    'hero.btnDonate': 'Dukung Pelestarian',

    // Translator
    'trans.title': 'Penerjemah Tiga Bahasa',
    'trans.subtitle': 'Terjemahan instan Dayak Arut ⇄ Bahasa Indonesia ⇄ English',
    'trans.fullMode': 'Buka Mode Penuh →',
    'trans.sourceLang': 'Bahasa Asal',
    'trans.targetLang': 'Bahasa Tujuan',
    'trans.placeholderArut': 'Ketik kosakata atau kalimat Dayak Arut (contoh: Kenapi habar, Handak tulak mandai)...',
    'trans.placeholderId': 'Ketik kata atau kalimat Bahasa Indonesia (contoh: Apa kabar, Saya mau pergi ke sungai)...',
    'trans.placeholderEn': 'Type words or phrases in English (e.g., How are you, I want to eat together)...',
    'trans.chars': 'karakter',
    'trans.clear': 'Bersihkan',
    'trans.listen': 'Pelafalan',
    'trans.copy': 'Salin',
    'trans.copied': 'Tersalin!',
    'trans.suggest': 'Usul Perbaikan',
    'trans.lexiconFound': 'Leksikon Terverifikasi',
    'trans.tryPhrases': 'Coba Contoh Frasa Sehari-hari (Klik untuk Memuat):',

    // Dictionary
    'dict.title': 'Kamus Bahasa Dayak Arut',
    'dict.tag': 'Direktori Leksikografi Daerah & Global',
    'dict.subtitle': 'Jelajahi perbendaharaan kosakata, makna leksikal dwibahasa (ID & EN), dan contoh penggunaan dalam tutur masyarakat adat.',
    'dict.searchPlaceholder': 'Cari kata dalam Dayak Arut, Bahasa Indonesia, atau English...',
    'dict.allAlphabet': 'Semua',
    'dict.allCategories': 'Semua Kategori',
    'dict.allDialects': 'Semua Dialek',
    'dict.showing': 'Menampilkan',
    'dict.from': 'dari',
    'dict.words': 'kosakata',
    'dict.favoritesOnly': 'Favorit',
    'dict.allWords': 'Semua Kata',
    'dict.notFound': 'Kosakata Tidak Ditemukan',
    'dict.notFoundDesc': 'Kata ini belum tercatat dalam basis leksikon dasar. Anda dapat mengusulkannya ke tetua adat melalui Area Kontributor.',
    'dict.proposeWord': 'Usulkan Kata Ini',

    // Word of the day & Stats
    'home.wordOfDay': 'Kata Hari Ini',
    'home.openInDict': 'Buka di Kamus Lengkap',
    'home.preservationTitle': 'Gotong Royong Penjaga Bahasa Ibu',
    'home.preservationDesc': 'Bahasa Dayak Arut adalah bagian dari kekayaan linguistik Kalimantan Tengah yang hidup di sepanjang Sungai Arut. Akses terbuka bagi peneliti lokal maupun dunia internasional.',
    'home.statWords': 'Kosakata Terdata',
    'home.statContributors': 'Kontributor Adat',
    'home.statAccess': 'Akses Terbuka',
    'home.popularSnippet': 'Cuplikan Kamus Populer',
    'home.popularDesc': 'Leksikon kosakata sehari-hari dan istilah adat Dayak Arut dengan terjemahan Indonesia & Inggris',
    'home.seeAllWords': 'Lihat Semua Kosakata →',
    'home.ctaTitle': 'Mari Bersama Menjaga Tutur Leluhur Arut',
    'home.ctaDesc': 'Setiap donasi dan kontribusi kosakata baru sangat berharga bagi keberlanjutan dokumentasi bahasa daerah untuk generasi masa depan.',
    'home.ctaDonate': 'Salurkan Donasi',
    'home.ctaPropose': 'Ajukan Kata Baru',

    // Contributors
    'contrib.title': 'Daftar Kontributor Bahasa Dayak Arut',
    'contrib.tag': 'Dewan & Penjaga Bahasa',
    'contrib.subtitle': 'Para tetua adat, pegiat literasi, penutur asli, dan relawan pemuda yang mendedikasikan waktu mendokumentasikan serta memvalidasi kosakata bahasa Dayak Arut.',
    'contrib.registered': 'Kontributor Terdaftar',
    'contrib.wordsContributed': 'Kosakata Disumbangkan',
    'contrib.wordsVerified': 'Kosakata Terverifikasi',
    'contrib.joinBtn': 'Gabung Jadi Kontributor',
    'contrib.callTitle': 'Anda Penutur Asli atau Pecinta Bahasa Dayak Arut?',
    'contrib.callDesc': 'Bergabunglah bersama kami untuk mencatat kata-kata yang mulai jarang didengar, istilah adat sungai, dan falsafah leluhur agar tetap lestari.',

    // Donation
    'donate.title': 'Donasi & Dukungan Bahasa Dayak Arut',
    'donate.tag': 'Gotong Royong Pelestarian',
    'donate.subtitle': 'Dukungan Anda membantu riset tutur lisan tetua adat ke desa hulu Sungai Arut, cetak buku saku bahasa untuk sekolah pedalaman, dan operasional pelestarian digital.',
    'donate.selectNominal': 'Pilih Nominal Donasi',
    'donate.freeNominal': 'Atau Masukkan Nominal Bebas (Rp):',
    'donate.paymentMethod': 'Metode Pembayaran:',
    'donate.donorName': 'Nama Donatur / Inisial:',
    'donate.donorEmail': 'Email (Opsional, untuk tanda terima):',
    'donate.donorMsg': 'Pesan / Doa Pelestarian (Opsional):',
    'donate.submitBtn': 'Lanjutkan Donasi',
    'donate.transparency': 'Transparansi Alokasi Donasi',
    'donate.donorWall': 'Dinding Doa Para Donatur',

    // Footer
    'footer.desc': 'Platform digital gotong royong pelestarian bahasa Dayak Arut — mendokumentasikan leksikon, tutur lisan, dan dialek masyarakat adat sepanjang Sungai Arut, Kotawaringin Barat, Kalimantan Tengah.',
    'footer.features': 'Fitur Platform',
    'footer.regions': 'Wilayah Penutur',
    'footer.regionsDesc': 'Dituturkan di Kecamatan Arut Utara (Kelurahan Pangkut, Desa Sambi, Gandis, Pandau, Penyombaan, Sukarami) dan daerah aliran Sungai Arut Kabupaten Kotawaringin Barat.',
    'footer.initiative': 'Inisiatif Terbuka Pelestarian Bahasa Ibu Nusantara'
  },
  en: {
    // Nav
    'nav.translate': 'Translate',
    'nav.dictionary': 'Dictionary',
    'nav.contributors': 'Contributors',
    'nav.donate': 'Donate',
    'nav.contributorArea': 'Contributor Hub',
    'nav.auth': 'Sign In / Register',
    'nav.logout': 'Sign Out',
    'brand.subtitle': 'Dayak Arut Language & Heritage Preservation',

    // Hero
    'hero.tag': 'Indigenous Heritage of Kotawaringin Barat',
    'hero.title': 'Digital Preservation of Dayak Arut Language',
    'hero.desc': 'Documenting oral wisdom, lexicography, and indigenous dialects along the Arut River — openly accessible, interactive, and connected globally.',
    'hero.btnTranslate': 'Start Translating',
    'hero.btnDictionary': 'Explore Dictionary',
    'hero.btnDonate': 'Support the Project',

    // Translator
    'trans.title': 'Trilingual Translator',
    'trans.subtitle': 'Instant translation: Dayak Arut ⇄ Indonesian ⇄ English',
    'trans.fullMode': 'Open Full Screen →',
    'trans.sourceLang': 'Source Language',
    'trans.targetLang': 'Target Language',
    'trans.placeholderArut': 'Type Dayak Arut words or phrases (e.g., Kenapi habar, Handak tulak mandai)...',
    'trans.placeholderId': 'Type words or phrases in Indonesian (e.g., Apa kabar, Saya mau ke sungai)...',
    'trans.placeholderEn': 'Type words or phrases in English (e.g., How are you, I want to eat together)...',
    'trans.chars': 'characters',
    'trans.clear': 'Clear',
    'trans.listen': 'Pronounce',
    'trans.copy': 'Copy',
    'trans.copied': 'Copied!',
    'trans.suggest': 'Suggest Edit',
    'trans.lexiconFound': 'Verified Lexicons',
    'trans.tryPhrases': 'Try Everyday Sample Phrases (Click to Load):',

    // Dictionary
    'dict.title': 'Dayak Arut Dictionary',
    'dict.tag': 'Local & Global Lexicography Directory',
    'dict.subtitle': 'Explore vocabulary, bilingual lexical meanings (ID & EN), and usage examples from indigenous native speakers.',
    'dict.searchPlaceholder': 'Search word in Dayak Arut, Indonesian, or English...',
    'dict.allAlphabet': 'All',
    'dict.allCategories': 'All Categories',
    'dict.allDialects': 'All Dialects',
    'dict.showing': 'Showing',
    'dict.from': 'of',
    'dict.words': 'words',
    'dict.favoritesOnly': 'Favorites',
    'dict.allWords': 'All Words',
    'dict.notFound': 'Word Not Found',
    'dict.notFoundDesc': 'This word has not been documented in the core lexicon yet. You can submit it to the elder council via the Contributor Hub.',
    'dict.proposeWord': 'Propose This Word',

    // Word of the day & Stats
    'home.wordOfDay': 'Word of the Day',
    'home.openInDict': 'View Full Entry in Dictionary',
    'home.preservationTitle': 'Community Language Guardians',
    'home.preservationDesc': 'The Dayak Arut language is an integral linguistic treasure of Central Kalimantan thriving along the Arut River. Open access for local learners and global researchers.',
    'home.statWords': 'Documented Words',
    'home.statContributors': 'Indigenous Elders & Fellows',
    'home.statAccess': 'Open Access',
    'home.popularSnippet': 'Popular Lexicon Entries',
    'home.popularDesc': 'Everyday expressions and cultural terms with Indonesian and English translations',
    'home.seeAllWords': 'View All Vocabulary →',
    'home.ctaTitle': 'Join Us in Preserving Arut Ancestral Heritage',
    'home.ctaDesc': 'Every contribution and donation directly supports field fieldwork, linguistic documentation, and school pocketbooks for future generations.',
    'home.ctaDonate': 'Make a Donation',
    'home.ctaPropose': 'Submit New Word',

    // Contributors
    'contrib.title': 'Dayak Arut Language Contributors',
    'contrib.tag': 'Language Council & Guardians',
    'contrib.subtitle': 'Customary elders, linguists, native speakers, and youth volunteers dedicated to recording and verifying Dayak Arut terms.',
    'contrib.registered': 'Registered Contributors',
    'contrib.wordsContributed': 'Words Submitted',
    'contrib.wordsVerified': 'Verified Words',
    'contrib.joinBtn': 'Join as Contributor',
    'contrib.callTitle': 'Are You a Native Speaker or Cultural Researcher?',
    'contrib.callDesc': 'Join our open collective to document endangered dialects, river expressions, and ancestral philosophies before they fade away.',

    // Donation
    'donate.title': 'Donation & Preservation Support',
    'donate.tag': 'Community Crowdfunding',
    'donate.subtitle': 'Your generosity funds elder fieldwork expeditions across upstream Arut villages, student handbook publishing, and digital preservation servers.',
    'donate.selectNominal': 'Select Donation Amount',
    'donate.freeNominal': 'Or Enter Custom Amount (IDR):',
    'donate.paymentMethod': 'Payment Method:',
    'donate.donorName': 'Donor Name / Alias:',
    'donate.donorEmail': 'Email (Optional, for receipt):',
    'donate.donorMsg': 'Message / Prayer (Optional):',
    'donate.submitBtn': 'Proceed with Donation',
    'donate.transparency': 'Fund Allocation Transparency',
    'donate.donorWall': 'Supporters Prayer Wall',

    // Footer
    'footer.desc': 'A digital collaborative platform preserving the Dayak Arut language — cataloguing lexicons, oral lore, and indigenous expressions along the Arut River, Central Kalimantan.',
    'footer.features': 'Platform Modules',
    'footer.regions': 'Speaker Territory',
    'footer.regionsDesc': 'Spoken across North Arut District (Pangkut, Sambi, Gandis, Pandau, Penyombaan, Sukarami) and along the Arut river basin, Kotawaringin Barat.',
    'footer.initiative': 'Open Initiative for Indonesian Indigenous Language Preservation'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>('id');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('arut_lang') as SupportedLanguage | null;
      if (saved === 'id' || saved === 'en') {
        setLanguageState(saved);
      }
    } catch (e) {
      console.error('Error reading language from storage', e);
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('arut_lang', lang);
    } catch (e) {
      console.error('Error setting language in storage', e);
    }
  };

  const t = (key: string): string => {
    return UI_TRANSLATIONS[language]?.[key] || UI_TRANSLATIONS['id']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
