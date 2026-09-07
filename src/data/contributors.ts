export interface Contributor {
  id: string;
  name: string;
  role: 'Penutur Asli / Tetua Adat' | 'Pengumpul Kosakata' | 'Verifikator Linguistik' | 'Relawan Pemuda Pelestari' | 'Peneliti Kebudayaan';
  origin: string;
  avatar: string;
  bio: string;
  wordsContributed: number;
  wordsVerified: number;
  badges: string[];
  joinedDate: string;
  isAdatElder?: boolean;
  isVerified?: boolean;
  verifiedByAdminName?: string;
  verifiedAt?: string;
}

export const CONTRIBUTORS_DATA: Contributor[] = [
  {
    id: 'c-01',
    name: 'Damang Adat Arut Utara',
    role: 'Penutur Asli / Tetua Adat',
    origin: 'Pangkut, Kotawaringin Barat',
    avatar: 'DA',
    bio: 'Tokoh adat dan pemangku hukum adat Kedamangan Arut Utara yang menjaga keaslian tutur lisan dan pepatah leluhur Dayak Arut.',
    wordsContributed: 340,
    wordsVerified: 512,
    badges: ['Penjaga Tutur', 'Verifikator Utama', 'Tetua Adat'],
    joinedDate: 'Januari 2024',
    isAdatElder: true,
    isVerified: true,
    verifiedByAdminName: 'Superadmin Master (TEN)',
    verifiedAt: '10 Januari 2024'
  },
  {
    id: 'c-02',
    name: 'Mardanus Rangkap',
    role: 'Penutur Asli / Tetua Adat',
    origin: 'Desa Sambi, Arut Utara',
    avatar: 'MR',
    bio: 'Penutur asli generasi ketiga yang aktif mendokumentasikan nyanyian tutur perahu jeram dan istilah kearifan hutan adat.',
    wordsContributed: 215,
    wordsVerified: 180,
    badges: ['Peneroka Kata', 'Penjaga Tutur'],
    joinedDate: 'Maret 2024',
    isAdatElder: true
  },
  {
    id: 'c-03',
    name: 'Ny. Darniati Balan',
    role: 'Pengumpul Kosakata',
    origin: 'Kelurahan Mendawai, Kobar',
    avatar: 'DB',
    bio: 'Pendidik seni budaya daerah yang memimpin pengumpulan leksikon nama-nama tumbuhan obat, perkakas dapur, dan istilah anyaman purun.',
    wordsContributed: 184,
    wordsVerified: 92,
    badges: ['Leksikograf Budaya', 'Pendidik Arut'],
    joinedDate: 'Mei 2024'
  },
  {
    id: 'c-04',
    name: 'Hendra Saputra, S.Pd.',
    role: 'Verifikator Linguistik',
    origin: 'Pangkalan Bun',
    avatar: 'HS',
    bio: 'Pegiat literasi bahasa daerah Kalimantan Tengah berfokus pada standardisasi ejaan fonetik Dayak Arut dan rumpun Melayik-Ngaju.',
    wordsContributed: 142,
    wordsVerified: 280,
    badges: ['Verifikator Utama', 'Ahli Fonetik'],
    joinedDate: 'Februari 2024'
  },
  {
    id: 'c-05',
    name: 'Rian Pratama',
    role: 'Relawan Pemuda Pelestari',
    origin: 'Desa Gandis, Arut Utara',
    avatar: 'RP',
    bio: 'Mahasiswa perantau asal Arut yang mendigitalisasi ungkapan populer anak muda Arut dan membuat konten edukasi audio.',
    wordsContributed: 98,
    wordsVerified: 45,
    badges: ['Relawan Tangguh', 'Pelopor Digital'],
    joinedDate: 'Juli 2024'
  },
  {
    id: 'c-06',
    name: 'Yurike Anjani',
    role: 'Peneliti Kebudayaan',
    origin: 'Sukamandang',
    avatar: 'YA',
    bio: 'Riset hubungan dialektal antara penutur Sungai Arut dengan Dayak Tomun Lamandau dan dialek Pangkalan Bun tempo dulu.',
    wordsContributed: 110,
    wordsVerified: 65,
    badges: ['Peneliti Lapangan', 'Peneroka Kata'],
    joinedDate: 'Agustus 2024'
  }
];
