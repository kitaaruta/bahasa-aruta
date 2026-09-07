export interface DictionaryWord {
  id: string;
  wordArut: string;
  wordId: string;
  wordEn: string;
  category: 'Nomina' | 'Verba' | 'Adjektiva' | 'Pronomina' | 'Numeralia' | 'Adverbia' | 'Sapaan' | 'Ungkapan Adat';
  phonetic: string;
  meaning: string;
  meaningEn: string;
  exampleArut: string;
  exampleId: string;
  exampleEn: string;
  dialect?: string;
  synonyms?: string[];
  verifiedBy?: string;
  dateAdded?: string;
}

export interface CommonPhrase {
  id: string;
  arut: string;
  indonesia: string;
  english: string;
  category: 'Sapaan' | 'Sehari-hari' | 'Pertanyaan' | 'Keluarga' | 'Alam';
  context: string;
}

export const ARUT_DICTIONARY: DictionaryWord[] = [
  // Sapaan & Pronomina
  {
    id: 'w-001',
    wordArut: 'Ulun',
    wordId: 'Saya / Aku',
    wordEn: 'I / Me',
    category: 'Pronomina',
    phonetic: 'u-lun',
    meaning: 'Kata ganti orang pertama tunggal; saya, hamba, aku.',
    meaningEn: 'First-person singular pronoun; I, me.',
    exampleArut: 'Ulun handak tulak mandai sungei Arut.',
    exampleId: 'Saya mau pergi ke hulu Sungai Arut.',
    exampleEn: 'I want to travel up the Arut River.',
    dialect: 'Kobar / Arut Umum',
    verifiedBy: 'Damang Adat Arut Utara'
  },
  {
    id: 'w-002',
    wordArut: 'Ikam',
    wordId: 'Kamu / Anda',
    wordEn: 'You',
    category: 'Pronomina',
    phonetic: 'i-kam',
    meaning: 'Kata ganti orang kedua tunggal; kamu, engkau.',
    meaningEn: 'Second-person singular pronoun; you.',
    exampleArut: 'Narai gawian ikam andau tuh?',
    exampleId: 'Apa pekerjaanmu hari ini?',
    exampleEn: 'What are you doing today?',
    dialect: 'Arut Hilir / Mendawai',
    verifiedBy: 'Tetua Adat Pangkut'
  },
  {
    id: 'w-003',
    wordArut: 'Kulai',
    wordId: 'Kamu (Dialek Hulu)',
    wordEn: 'You (Upstream Dialect)',
    category: 'Pronomina',
    phonetic: 'ko-lai',
    meaning: 'Bentuk sapaan akrab untuk orang kedua tunggal di hulu Arut & Tomun.',
    meaningEn: 'Familiar second-person pronoun commonly used in upstream Arut and Tomun.',
    exampleArut: 'Kulai kemuno andau tuh?',
    exampleId: 'Kamu mau ke mana hari ini?',
    exampleEn: 'Where are you going today?',
    dialect: 'Arut Hulu / Tomun',
    verifiedBy: 'Lembaga Adat Dayak Tomun-Arut'
  },
  {
    id: 'w-004',
    wordArut: 'Ikei',
    wordId: 'Kami',
    wordEn: 'We / Us (Exclusive)',
    category: 'Pronomina',
    phonetic: 'i-kei',
    meaning: 'Kata ganti orang pertama jamak (tidak termasuk lawan bicara); kami.',
    meaningEn: 'First-person plural pronoun excluding the listener; we, us.',
    exampleArut: 'Ikei mandir bahaum bara lewu Sambi.',
    exampleId: 'Kami datang bermusyawarah dari desa Sambi.',
    exampleEn: 'We came from Sambi village to discuss in council.',
    dialect: 'Arut Utara',
    verifiedBy: 'Tetua Adat Pangkut'
  },
  {
    id: 'w-005',
    wordArut: 'Ewen',
    wordId: 'Mereka',
    wordEn: 'They / Them',
    category: 'Pronomina',
    phonetic: 'e-wen',
    meaning: 'Kata ganti orang ketiga jamak; mereka.',
    meaningEn: 'Third-person plural pronoun; they, them.',
    exampleArut: 'Ewen uras bagawi melai petak pahalawan.',
    exampleId: 'Mereka semua bekerja di ladang kebun.',
    exampleEn: 'They all work in the agricultural field.',
    dialect: 'Arut Umum',
    verifiedBy: 'Balai Pelestari Basa Arut'
  },
  {
    id: 'w-006',
    wordArut: 'Tabe',
    wordId: 'Salam / Permisi / Halo',
    wordEn: 'Greeting / Hello / Excuse Me',
    category: 'Sapaan',
    phonetic: 'ta-be',
    meaning: 'Ungkapan salam hormat, permisi, atau sapaan selamat saat berjumpa.',
    meaningEn: 'Traditional respectful greeting, hello, or polite gesture.',
    exampleArut: 'Tabe salamat andau parak huma.',
    exampleId: 'Salam selamat siang menjelang rumah.',
    exampleEn: 'Warm greetings approaching the house.',
    dialect: 'Kobar / Arut',
    verifiedBy: 'Damang Adat Arut Utara'
  },
  {
    id: 'w-007',
    wordArut: 'Narai',
    wordId: 'Apa',
    wordEn: 'What',
    category: 'Pronomina',
    phonetic: 'na-rai',
    meaning: 'Kata tanya untuk menanyakan benda, perihal, atau keadaan.',
    meaningEn: 'Interrogative pronoun; what.',
    exampleArut: 'Narai dacing kuman andau tuh?',
    exampleId: 'Apa lauk makan hari ini?',
    exampleEn: 'What is the side dish for today?',
    dialect: 'Arut Umum',
    verifiedBy: 'Tetua Adat Pangkut'
  },
  {
    id: 'w-008',
    wordArut: 'Kueh',
    wordId: 'Mana / Ke mana',
    wordEn: 'Where',
    category: 'Adverbia',
    phonetic: 'ku-eh',
    meaning: 'Kata tanya penunjuk arah atau tempat; mana.',
    meaningEn: 'Interrogative adverb of place or direction; where.',
    exampleArut: 'Kueh aka melai huma kai?',
    exampleId: 'Di mana letak rumah kakek?',
    exampleEn: 'Where is grandfather’s house located?',
    dialect: 'Arut Umum',
    verifiedBy: 'Tetua Adat Pangkut'
  },
  {
    id: 'w-009',
    wordArut: 'Eweh',
    wordId: 'Siapa',
    wordEn: 'Who',
    category: 'Pronomina',
    phonetic: 'e-weh',
    meaning: 'Kata tanya untuk menanyakan orang atau identitas diri.',
    meaningEn: 'Interrogative pronoun; who.',
    exampleArut: 'Eweh aran ulun gantau te?',
    exampleId: 'Siapa nama orang di sebelah kanan itu?',
    exampleEn: 'Who is the person standing on the right?',
    dialect: 'Arut Umum',
    verifiedBy: 'Balai Pelestari Basa Arut'
  },

  // Verba (Kata Kerja)
  {
    id: 'w-010',
    wordArut: 'Kuman',
    wordId: 'Makan',
    wordEn: 'Eat / Dine',
    category: 'Verba',
    phonetic: 'ku-man',
    meaning: 'Memasukkan makanan ke dalam mulut dan mengunyahnya.',
    meaningEn: 'To ingest food, eat, dine.',
    exampleArut: 'Ayo itah kuman beheso manuk bakar.',
    exampleId: 'Ayo kita makan bersama ayam bakar.',
    exampleEn: 'Let us eat grilled chicken together.',
    dialect: 'Arut Umum',
    verifiedBy: 'Damang Adat Arut Utara'
  },
  {
    id: 'w-011',
    wordArut: 'Mihup',
    wordId: 'Minum',
    wordEn: 'Drink',
    category: 'Verba',
    phonetic: 'mi-hup',
    meaning: 'Memasukkan cairan ke dalam tubuh lewat mulut; minum.',
    meaningEn: 'To drink fluids or water.',
    exampleArut: 'Mihup danum herang sakira segar asai himba.',
    exampleId: 'Minum air jernih agar terasa segar.',
    exampleEn: 'Drink fresh water to feel revived.',
    dialect: 'Arut Umum',
    verifiedBy: 'Tetua Adat Pangkut'
  },
  {
    id: 'w-012',
    wordArut: 'Guring',
    wordId: 'Tidur',
    wordEn: 'Sleep',
    category: 'Verba',
    phonetic: 'gu-ring',
    meaning: 'Mengistirahatkan badan dan pikiran; tidur terlelap.',
    meaningEn: 'To rest, sleep, slumber.',
    exampleArut: 'Anak kurik te guring nyenyak huang tilam.',
    exampleId: 'Anak kecil itu tidur nyenyak di atas kasur.',
    exampleEn: 'The young child sleeps soundly on the mattress.',
    dialect: 'Arut & Melayu Kobar',
    verifiedBy: 'Tetua Adat Pangkut'
  },
  {
    id: 'w-013',
    wordArut: 'Bagawi',
    wordId: 'Bekerja',
    wordEn: 'Work / Labor',
    category: 'Verba',
    phonetic: 'ba-ga-wi',
    meaning: 'Melakukan suatu kegiatan usaha, berladang, atau bertugas mencari nafkah.',
    meaningEn: 'To perform work, occupational duty, or agricultural labor.',
    exampleArut: 'Bapa bagawi manggetah melai lewu Pandau.',
    exampleId: 'Ayah bekerja menyadap karet di desa Pandau.',
    exampleEn: 'Father is working tapping rubber in Pandau village.',
    dialect: 'Arut Utara',
    verifiedBy: 'Damang Adat Arut Utara'
  },
  {
    id: 'w-014',
    wordArut: 'Tulak',
    wordId: 'Pergi / Berangkat',
    wordEn: 'Depart / Leave / Go',
    category: 'Verba',
    phonetic: 'tu-lak',
    meaning: 'Bergerak meninggalkan suatu tempat menuju tempat lain; berangkat.',
    meaningEn: 'To set off, depart, or leave a place.',
    exampleArut: 'Ikei tulak manuju Pangkalan Bun jumat tuh.',
    exampleId: 'Kami berangkat menuju Pangkalan Bun hari jumat ini.',
    exampleEn: 'We depart for Pangkalan Bun this Friday.',
    dialect: 'Arut Umum',
    verifiedBy: 'Balai Pelestari Basa Arut'
  },
  {
    id: 'w-015',
    wordArut: 'Bulik',
    wordId: 'Pulang',
    wordEn: 'Return Home / Go Back',
    category: 'Verba',
    phonetic: 'bu-lik',
    meaning: 'Kembali ke tempat asal, ke rumah, atau ke kampung halaman.',
    meaningEn: 'To return home or go back to one’s village.',
    exampleArut: 'Andau nahau, saat itah bulik manuju huma.',
    exampleId: 'Hari sudah sore, saatnya kita pulang menuju rumah.',
    exampleEn: 'Evening has arrived, it is time to return home.',
    dialect: 'Arut & Tomun',
    verifiedBy: 'Tetua Adat Pangkut'
  },
  {
    id: 'w-016',
    wordArut: 'Bahaum',
    wordId: 'Bermusyawarah / Rapat Adat',
    wordEn: 'Deliberate / Customary Council',
    category: 'Verba',
    phonetic: 'ba-ha-um',
    meaning: 'Berkumpul untuk membicarakan mufakat, adat, dan keputusan desa bersama.',
    meaningEn: 'To gather for customary consensus and communal deliberation.',
    exampleArut: 'Warga bahaum melai balai adat menyambut pesta panen.',
    exampleId: 'Warga bermusyawarah di balai adat menyambut pesta panen.',
    exampleEn: 'Villagers deliberate in the customary hall for the harvest festival.',
    dialect: 'Arut Utara',
    verifiedBy: 'Damang Adat Arut Utara'
  },
  {
    id: 'w-017',
    wordArut: 'Bekunyung',
    wordId: 'Berenang',
    wordEn: 'Swim',
    category: 'Verba',
    phonetic: 'be-kun-yung',
    meaning: 'Menggerakkan badan melintasi air sungai.',
    meaningEn: 'To swim in river waters.',
    exampleArut: 'Kukuh anak ramaja bekunyung melai riam batang Arut.',
    exampleId: 'Ramai anak remaja berenang di riam batang sungai Arut.',
    exampleEn: 'Many teenagers swim in the rapids of the Arut River.',
    dialect: 'Pangkut / Arut Utara',
    verifiedBy: 'Tetua Adat Pangkut'
  },
  {
    id: 'w-018',
    wordArut: 'Mandir',
    wordId: 'Bicara / Mengobrol',
    wordEn: 'Speak / Talk / Converse',
    category: 'Verba',
    phonetic: 'man-dir',
    meaning: 'Mengeluarkan suara bermakna; berbincang atau bertutur kata.',
    meaningEn: 'To talk, converse, or speak.',
    exampleArut: 'Ela mandir garatak amun ulun bakas bahaum.',
    exampleId: 'Jangan bicara sembarangan jika orang tua sedang bermusyawarah.',
    exampleEn: 'Do not speak carelessly while elders are in council.',
    dialect: 'Arut Hulu',
    verifiedBy: 'Lembaga Adat Dayak Tomun-Arut'
  },
  {
    id: 'w-019',
    wordArut: 'Manggetah',
    wordId: 'Menyadap Karet',
    wordEn: 'Tap Rubber',
    category: 'Verba',
    phonetic: 'mang-ge-tah',
    meaning: 'Aktivitas khas masyarakat Arut menoreh pohon karet di kebun saat fajar.',
    meaningEn: 'The traditional dawn activity of harvesting rubber latex from trees.',
    exampleArut: 'Sawa bapa tulak manggetah sahengkeh andau.',
    exampleId: 'Istri dan ayah berangkat menyadap karet sebelum fajar.',
    exampleEn: 'Parents set out to tap rubber before dawn.',
    dialect: 'Kobar / Arut',
    verifiedBy: 'Tetua Adat Pangkut'
  },

  // Nomina (Kata Benda, Alam, Keluarga)
  {
    id: 'w-020',
    wordArut: 'Danum',
    wordId: 'Air',
    wordEn: 'Water',
    category: 'Nomina',
    phonetic: 'da-num',
    meaning: 'Zat cair yang jernih, vital untuk kehidupan; air tawar sungai.',
    meaningEn: 'Clear liquid vital for life; river water.',
    exampleArut: 'Danum sungei Arut tuh manetes bara buluh gunung.',
    exampleId: 'Air sungai Arut ini menetes dari hulu pegunungan.',
    exampleEn: 'The water of the Arut River cascades from the mountain ridge.',
    dialect: 'Arut Umum',
    verifiedBy: 'Balai Pelestari Basa Arut'
  },
  {
    id: 'w-021',
    wordArut: 'Banyu',
    wordId: 'Air (Muara)',
    wordEn: 'Water (Downstream)',
    category: 'Nomina',
    phonetic: 'ban-yu',
    meaning: 'Sebutan air yang lazim juga digunakan di kawasan muara sungai Arut.',
    meaningEn: 'Term for water widely spoken in the downstream Arut delta.',
    exampleArut: 'Banyu sungei lagi pasang dalam.',
    exampleId: 'Air sungai sedang pasang tinggi.',
    exampleEn: 'The river water is currently at high tide.',
    dialect: 'Arut Hilir / Kobar',
    verifiedBy: 'Balai Pelestari Basa Arut'
  },
  {
    id: 'w-022',
    wordArut: 'Huma',
    wordId: 'Rumah',
    wordEn: 'House / Home',
    category: 'Nomina',
    phonetic: 'hu-ma',
    meaning: 'Tempat tinggal atau kediaman keluarga; rumah tradisional Dayak.',
    meaningEn: 'Dwelling, household, traditional Dayak home.',
    exampleArut: 'Huma betang tuh ampin tege sapuluh pintu.',
    exampleId: 'Rumah betang ini tampaknya mempunyai sepuluh pintu.',
    exampleEn: 'This longhouse appears to have ten distinct chambers.',
    dialect: 'Arut Utara / Ngaju',
    verifiedBy: 'Damang Adat Arut Utara'
  },
  {
    id: 'w-023',
    wordArut: 'Lewu',
    wordId: 'Desa / Kampung',
    wordEn: 'Village / Homeland',
    category: 'Nomina',
    phonetic: 'le-wu',
    meaning: 'Wilayah pemukiman adat, desa, atau tanah kelahiran.',
    meaningEn: 'Indigenous village settlement or native land.',
    exampleArut: 'Lewu Pangkut te lewu bakas pelestari adat Arut.',
    exampleId: 'Desa Pangkut adalah desa bersejarah pelestari adat Arut.',
    exampleEn: 'Pangkut is a historic village safeguarding Arut customs.',
    dialect: 'Arut Utara',
    verifiedBy: 'Tetua Adat Pangkut'
  },
  {
    id: 'w-024',
    wordArut: 'Sungei',
    wordId: 'Sungai',
    wordEn: 'River',
    category: 'Nomina',
    phonetic: 'sun-gei',
    meaning: 'Aliran air besar alami; urat nadi kehidupan masyarakat suku Arut.',
    meaningEn: 'Natural flowing watercourse; lifeline of the Arut community.',
    exampleArut: 'Sungei Arut mambagi lewu manjadi kalintuk kabungasan.',
    exampleId: 'Sungai Arut membelah kampung menjadi pemandangan yang elok.',
    exampleEn: 'The Arut River embraces the village into scenic beauty.',
    dialect: 'Arut Umum',
    verifiedBy: 'Balai Pelestari Basa Arut'
  },
  {
    id: 'w-025',
    wordArut: 'Kai',
    wordId: 'Kakek',
    wordEn: 'Grandfather',
    category: 'Nomina',
    phonetic: 'ka-i',
    meaning: 'Ayah dari ayah atau ibu; kakek, datuk tua.',
    meaningEn: 'Paternal or maternal grandfather; elder patriarch.',
    exampleArut: 'Kai ulun pintar mangalola obat bara himba.',
    exampleId: 'Kakek saya pandai meracik obat dari hutan rimba.',
    exampleEn: 'My grandfather is skilled in crafting jungle herbal remedies.',
    dialect: 'Kobar / Arut',
    verifiedBy: 'Tetua Adat Pangkut'
  },
  {
    id: 'w-026',
    wordArut: 'Nea',
    wordId: 'Nenek',
    wordEn: 'Grandmother',
    category: 'Nomina',
    phonetic: 'ne-a',
    meaning: 'Ibu dari ayah atau ibu; nenek perempuan.',
    meaningEn: 'Paternal or maternal grandmother; matriarch.',
    exampleArut: 'Nea rancak manjawet anyaman purun melai serambi.',
    exampleId: 'Nenek sering menganyam anyaman rumput purun di serambi.',
    exampleEn: 'Grandmother often weaves purun grass mats on the porch.',
    dialect: 'Kobar / Arut',
    verifiedBy: 'Tetua Adat Pangkut'
  },
  {
    id: 'w-027',
    wordArut: 'Himba',
    wordId: 'Hutan / Rimba Belantara',
    wordEn: 'Jungle / Rainforest',
    category: 'Nomina',
    phonetic: 'him-ba',
    meaning: 'Hutan alam tropis lebat yang dijaga sebagai wilayah adat.',
    meaningEn: 'Dense tropical rainforest protected as customary forest.',
    exampleArut: 'Ela marusak himba kahati, tege pantang adat keturunan.',
    exampleId: 'Jangan merusak hutan rimba, ada pantangan adat warisan leluhur.',
    exampleEn: 'Do not harm the virgin forest, for ancestral taboos protect it.',
    dialect: 'Arut Utara',
    verifiedBy: 'Damang Adat Arut Utara'
  },
  {
    id: 'w-028',
    wordArut: 'Lalongapan',
    wordId: 'Jendela',
    wordEn: 'Window',
    category: 'Nomina',
    phonetic: 'la-long-a-pan',
    meaning: 'Lubang angin atau jendela pada dinding rumah kayu.',
    meaningEn: 'Window or air aperture on wooden timber house.',
    exampleArut: 'Buka lalongapan sakira angin dingin masuk huang huma.',
    exampleId: 'Buka jendela agar angin sejuk masuk ke dalam rumah.',
    exampleEn: 'Open the window so cool breeze flows into the home.',
    dialect: 'Arut & Melayu Kobar',
    verifiedBy: 'Balai Pelestari Basa Arut'
  },
  {
    id: 'w-029',
    wordArut: 'Pinggan',
    wordId: 'Piring',
    wordEn: 'Plate / Dish',
    category: 'Nomina',
    phonetic: 'ping-gan',
    meaning: 'Alas datar untuk menyajikan nasi atau hidangan makanan.',
    meaningEn: 'Dining plate or dish.',
    exampleArut: 'Andau tuh cuci pinggan limbah kuman.',
    exampleId: 'Hari ini cuci piring sesudah makan.',
    exampleEn: 'Wash the plates clean after dining today.',
    dialect: 'Kobar / Arut',
    verifiedBy: 'Tetua Adat Pangkut'
  },
  {
    id: 'w-030',
    wordArut: 'Manuk',
    wordId: 'Ayam',
    wordEn: 'Chicken / Fowl',
    category: 'Nomina',
    phonetic: 'ma-nuk',
    meaning: 'Unggas ternak atau ayam hutan.',
    meaningEn: 'Domestic chicken or forest fowl.',
    exampleArut: 'Manuk jalu bakukuk manandai andau hanjewu.',
    exampleId: 'Ayam jantan berkokok menandai hari fajar menyingsing.',
    exampleEn: 'The rooster crows heralding the dawn.',
    dialect: 'Arut Umum',
    verifiedBy: 'Balai Pelestari Basa Arut'
  },
  {
    id: 'w-031',
    wordArut: 'Lauk',
    wordId: 'Ikan',
    wordEn: 'Fish',
    category: 'Nomina',
    phonetic: 'la-uk',
    meaning: 'Ikan air tawar khas sungai Arut seperti baung, patin, jelawat.',
    meaningEn: 'Freshwater fish indigenous to the Arut River.',
    exampleArut: 'Mama mampauli lauk baung basar bara jala.',
    exampleId: 'Paman membawa pulang ikan baung besar dari jala.',
    exampleEn: 'Uncle brings home a large catfish caught in his casting net.',
    dialect: 'Arut & Kobar',
    verifiedBy: 'Tetua Adat Pangkut'
  },

  // Adjektiva (Kata Sifat)
  {
    id: 'w-032',
    wordArut: 'Bahalap',
    wordId: 'Bagus / Indah / Baik',
    wordEn: 'Beautiful / Good / Fine',
    category: 'Adjektiva',
    phonetic: 'ba-ha-lap',
    meaning: 'Elok, mempesona, baik budi pekerti, berkualitas luhur.',
    meaningEn: 'Beautiful, admirable, fine, virtuous.',
    exampleArut: 'Bahalap toto rupa huma betang Arut tuh.',
    exampleId: 'Sangat indah wujud rumah betang Arut ini.',
    exampleEn: 'This Arut longhouse looks exceedingly beautiful.',
    dialect: 'Arut Utara / Ngaju',
    verifiedBy: 'Damang Adat Arut Utara'
  },
  {
    id: 'w-033',
    wordArut: 'Sega',
    wordId: 'Gagah / Cantik (Dialek Tomun)',
    wordEn: 'Handsome / Splendid / Valiant',
    category: 'Adjektiva',
    phonetic: 'se-ga',
    meaning: 'Tampan, cantik, gagah, atau perkasa.',
    meaningEn: 'Handsome, splendid, or valiant.',
    exampleArut: 'Sega toto bujang lewu te mamakai pakaian adat.',
    exampleId: 'Gagah sekali pemuda desa itu mengenakan pakaian adat.',
    exampleEn: 'That village youth looks truly handsome in traditional regalia.',
    dialect: 'Arut Hulu / Tomun',
    verifiedBy: 'Lembaga Adat Dayak Tomun-Arut'
  },
  {
    id: 'w-034',
    wordArut: 'Hanjewu',
    wordId: 'Pagi / Fajar',
    wordEn: 'Morning / Dawn',
    category: 'Adverbia',
    phonetic: 'han-je-wu',
    meaning: 'Waktu dini hari setelah terbitnya fajar.',
    meaningEn: 'Morning time, daybreak, dawn.',
    exampleArut: 'Salamat hanjewu gasan samandai warga Arut.',
    exampleId: 'Selamat pagi untuk segenap warga Arut.',
    exampleEn: 'Good morning to all the residents of Arut.',
    dialect: 'Arut Umum',
    verifiedBy: 'Balai Pelestari Basa Arut'
  },
  {
    id: 'w-035',
    wordArut: 'Halemei',
    wordId: 'Sore / Petang',
    wordEn: 'Afternoon / Evening',
    category: 'Adverbia',
    phonetic: 'ha-le-mei',
    meaning: 'Waktu matahari condong ke barat; petang menjelang senja.',
    meaningEn: 'Late afternoon, dusk.',
    exampleArut: 'Itah mandui melai jambatan batang amun halemei.',
    exampleId: 'Kita mandi di pelabuhan kayu sungai jika sore tiba.',
    exampleEn: 'We bathe at the wooden river jetty in the afternoon.',
    dialect: 'Arut Umum',
    verifiedBy: 'Tetua Adat Pangkut'
  },
  {
    id: 'w-036',
    wordArut: 'Hamalem',
    wordId: 'Malam Hari',
    wordEn: 'Night',
    category: 'Adverbia',
    phonetic: 'ha-ma-lem',
    meaning: 'Waktu sesudah matahari tenggelam; malam.',
    meaningEn: 'Night, darkness of nighttime.',
    exampleArut: 'Sungei Arut sunyi hening amun hamalem dapit.',
    exampleId: 'Sungai Arut sunyi hening ketika malam gelap tiba.',
    exampleEn: 'The Arut River falls serene as night arrives.',
    dialect: 'Arut Umum',
    verifiedBy: 'Balai Pelestari Basa Arut'
  },
  {
    id: 'w-037',
    wordArut: 'Poning',
    wordId: 'Pusing / Sakit Kepala',
    wordEn: 'Dizzy / Headache',
    category: 'Adjektiva',
    phonetic: 'po-ning',
    meaning: 'Kondisi kepala berputar atau pening.',
    meaningEn: 'Dizziness, lightheadedness, or headache.',
    exampleArut: 'Poning takolok ulun amun kalinduan andau bapanas.',
    exampleId: 'Pusing kepala saya jika kelamaan diterpa terik matahari.',
    exampleEn: 'My head aches after prolonged exposure to the heat.',
    dialect: 'Kobar / Arut',
    verifiedBy: 'Tetua Adat Pangkut'
  },
  {
    id: 'w-038',
    wordArut: 'Karas',
    wordId: 'Keras / Kuat',
    wordEn: 'Hard / Resilient / Strong',
    category: 'Adjektiva',
    phonetic: 'ka-ras',
    meaning: 'Kuat daya tahannya, kokoh, padat.',
    meaningEn: 'Sturdy, dense, durable, iron-like.',
    exampleArut: 'Kayu ulin melai himba Arut te karas toto.',
    exampleId: 'Kayu besi/ulin di hutan Arut sangat kuat dan keras.',
    exampleEn: 'Ironwood in the Arut forest is remarkably resilient.',
    dialect: 'Arut Umum',
    verifiedBy: 'Damang Adat Arut Utara'
  },
  {
    id: 'w-039',
    wordArut: 'Handap',
    wordId: 'Pendek',
    wordEn: 'Short',
    category: 'Adjektiva',
    phonetic: 'han-dap',
    meaning: 'Tidak panjang atau tidak tinggi; singkat ukuran fisiknya.',
    meaningEn: 'Short in height or stature.',
    exampleArut: 'Pagar kayu te handap ih, kawa dilumpati.',
    exampleId: 'Pagar kayu itu pendek saja, bisa dilompati.',
    exampleEn: 'That wooden fence is quite short, easy to leap over.',
    dialect: 'Arut Umum',
    verifiedBy: 'Balai Pelestari Basa Arut'
  },
  {
    id: 'w-040',
    wordArut: 'Gantung',
    wordId: 'Tinggi',
    wordEn: 'Tall / High',
    category: 'Adjektiva',
    phonetic: 'gan-tung',
    meaning: 'Berjarak jauh dari permukaan tanah; jangkung, tinggi.',
    meaningEn: 'Tall, lofty, soaring high.',
    exampleArut: 'Batang tapang te gantung manembus langit himba.',
    exampleId: 'Pohon tualang/tapang itu tinggi menembus langit rimba.',
    exampleEn: 'The tapang tree soars high piercing the forest canopy.',
    dialect: 'Arut Umum',
    verifiedBy: 'Damang Adat Arut Utara'
  },

  // Numeralia (Angka & Bilangan)
  {
    id: 'w-041',
    wordArut: 'Ije',
    wordId: 'Satu',
    wordEn: 'One',
    category: 'Numeralia',
    phonetic: 'i-je',
    meaning: 'Bilangan cacah pertama; satu, tunggal.',
    meaningEn: 'The number one; unity.',
    exampleArut: 'Ije lewu ije pambelum, itah musti badamai.',
    exampleId: 'Satu kampung satu kehidupan, kita harus berdamai.',
    exampleEn: 'One village one community, we must live in peace.',
    dialect: 'Arut & Ngaju',
    verifiedBy: 'Damang Adat Arut Utara'
  },
  {
    id: 'w-042',
    wordArut: 'Due',
    wordId: 'Dua',
    wordEn: 'Two',
    category: 'Numeralia',
    phonetic: 'du-e',
    meaning: 'Bilangan setelah satu; dua.',
    meaningEn: 'The number two.',
    exampleArut: 'Due buah jukung bajalan bairingan.',
    exampleId: 'Dua buah perahu dayung berjalan beriringan.',
    exampleEn: 'Two wooden canoes paddle in tandem.',
    dialect: 'Arut Umum',
    verifiedBy: 'Tetua Adat Pangkut'
  },
  {
    id: 'w-043',
    wordArut: 'Telo',
    wordId: 'Tiga',
    wordEn: 'Three',
    category: 'Numeralia',
    phonetic: 'te-lo',
    meaning: 'Bilangan sesudah dua; tiga.',
    meaningEn: 'The number three.',
    exampleArut: 'Telo andau ikei mangadep upacara adat.',
    exampleId: 'Tiga hari kami mengikuti upacara adat.',
    exampleEn: 'For three days we observe the customary rite.',
    dialect: 'Arut Umum',
    verifiedBy: 'Tetua Adat Pangkut'
  },
  {
    id: 'w-044',
    wordArut: 'Epat',
    wordId: 'Empat',
    wordEn: 'Four',
    category: 'Numeralia',
    phonetic: 'e-pat',
    meaning: 'Bilangan setelah tiga; empat.',
    meaningEn: 'The number four.',
    exampleArut: 'Epat penjuru mata angin mangalilingi lewu.',
    exampleId: 'Empat penjuru mata angin mengelilingi kampung.',
    exampleEn: 'Four cardinal directions cradle the native settlement.',
    dialect: 'Arut Umum',
    verifiedBy: 'Balai Pelestari Basa Arut'
  },
  {
    id: 'w-045',
    wordArut: 'Lime',
    wordId: 'Lima',
    wordEn: 'Five',
    category: 'Numeralia',
    phonetic: 'li-me',
    meaning: 'Bilangan lima.',
    meaningEn: 'The number five.',
    exampleArut: 'Lime ije kawan bagawi gotong royong.',
    exampleId: 'Lima orang berkawan bergotong royong.',
    exampleEn: 'Five comrades labor in mutual cooperation.',
    dialect: 'Arut Umum',
    verifiedBy: 'Tetua Adat Pangkut'
  },
  {
    id: 'w-046',
    wordArut: 'Jahawen',
    wordId: 'Enam',
    wordEn: 'Six',
    category: 'Numeralia',
    phonetic: 'ja-ha-wen',
    meaning: 'Bilangan enam.',
    meaningEn: 'The number six.',
    exampleArut: 'Jahawen buku kamus basa Arut tersusun.',
    exampleId: 'Enam jilid kamus bahasa Arut telah tersusun.',
    exampleEn: 'Six volumes of the Arut vocabulary are compiled.',
    dialect: 'Arut & Ngaju',
    verifiedBy: 'Balai Pelestari Basa Arut'
  },
  {
    id: 'w-047',
    wordArut: 'Uju',
    wordId: 'Tujuh',
    wordEn: 'Seven',
    category: 'Numeralia',
    phonetic: 'u-ju',
    meaning: 'Bilangan tujuh.',
    meaningEn: 'The number seven.',
    exampleArut: 'Uju riam dilewati jukung manuju hulu.',
    exampleId: 'Tujuh riam jeram dilewati perahu menuju hulu.',
    exampleEn: 'Seven rapids were traversed by the canoe upstream.',
    dialect: 'Arut & Ngaju',
    verifiedBy: 'Damang Adat Arut Utara'
  },
  {
    id: 'w-048',
    wordArut: 'Hanya',
    wordId: 'Delapan',
    wordEn: 'Eight',
    category: 'Numeralia',
    phonetic: 'han-ya',
    meaning: 'Bilangan delapan.',
    meaningEn: 'The number eight.',
    exampleArut: 'Hanya pikul getah karet terkumpul bulan tuh.',
    exampleId: 'Delapan pikul getah karet terkumpul bulan ini.',
    exampleEn: 'Eight pikuls of rubber latex were harvested this month.',
    dialect: 'Arut & Ngaju',
    verifiedBy: 'Tetua Adat Pangkut'
  },
  {
    id: 'w-049',
    wordArut: 'Jalatien',
    wordId: 'Sembilan',
    wordEn: 'Nine',
    category: 'Numeralia',
    phonetic: 'ja-la-ti-en',
    meaning: 'Bilangan sembilan.',
    meaningEn: 'The number nine.',
    exampleArut: 'Jalatien pintu lewu bahaum di balai.',
    exampleId: 'Sembilan rukun kampung bermusyawarah di balai.',
    exampleEn: 'Nine neighborhood elders gather for counsel.',
    dialect: 'Arut & Ngaju',
    verifiedBy: 'Balai Pelestari Basa Arut'
  },
  {
    id: 'w-050',
    wordArut: 'Sapulu',
    wordId: 'Sepuluh',
    wordEn: 'Ten',
    category: 'Numeralia',
    phonetic: 'sa-pu-lu',
    meaning: 'Bilangan sepuluh.',
    meaningEn: 'The number ten.',
    exampleArut: 'Sapulu ikung relawan mudha mendaftar jadi kontributor.',
    exampleId: 'Sepuluh orang relawan muda mendaftar jadi kontributor.',
    exampleEn: 'Ten young fellows registered as language contributors.',
    dialect: 'Arut Umum',
    verifiedBy: 'Tetua Adat Pangkut'
  },

  // Ungkapan Adat & Frasa Khusus
  {
    id: 'w-051',
    wordArut: 'Pali',
    wordId: 'Pantangan / Pamali Adat',
    wordEn: 'Customary Taboo / Sacred Ban',
    category: 'Ungkapan Adat',
    phonetic: 'pa-li',
    meaning: 'Larangan adat leluhur yang pantang dilanggar demi menjaga keharmonisan alam.',
    meaningEn: 'Ancestral customary taboo strictly forbidden to preserve ecological balance.',
    exampleArut: 'Pali manabang kayu keramat melai pinggir riam.',
    exampleId: 'Pantangan adat menebang pohon keramat di tepi jeram air.',
    exampleEn: 'It is a sacred taboo to fell ancestral trees along river rapids.',
    dialect: 'Arut Utara / Adat',
    verifiedBy: 'Damang Adat Arut Utara'
  },
  {
    id: 'w-052',
    wordArut: 'Tarima Kasih',
    wordId: 'Terima Kasih',
    wordEn: 'Thank You',
    category: 'Sapaan',
    phonetic: 'ta-ri-ma ka-sih',
    meaning: 'Ungkapan rasa syukur dan penghargaan atas pertolongan atau kebaikan orang.',
    meaningEn: 'Expression of gratitude, thank you.',
    exampleArut: 'Tarima kasih toto atas bantuan ikam samandai.',
    exampleId: 'Terima kasih banyak atas pertolongan kalian semua.',
    exampleEn: 'Thank you very much for all your generous assistance.',
    dialect: 'Arut Umum',
    verifiedBy: 'Balai Pelestari Basa Arut'
  },
  {
    id: 'w-053',
    wordArut: 'Belum Bahalap',
    wordId: 'Hidup Rukun & Damai',
    wordEn: 'Peaceful & Harmonious Living',
    category: 'Ungkapan Adat',
    phonetic: 'be-lum ba-ha-lap',
    meaning: 'Falsafah hidup berdampingan secara damai, sejahtera, dan saling menghormati.',
    meaningEn: 'Indigenous philosophy of living in harmony, prosperity, and mutual respect.',
    exampleArut: 'Masyarakat Arut manggenggam teguh pambelum bahalap.',
    exampleId: 'Masyarakat Dayak Arut memegang teguh pedoman hidup rukun dan damai.',
    exampleEn: 'The Dayak Arut community upholds peaceful harmony as their guiding creed.',
    dialect: 'Falsafah Adat Arut',
    verifiedBy: 'Damang Adat Arut Utara'
  }
];

export const COMMON_PHRASES: CommonPhrase[] = [
  {
    id: 'p-01',
    arut: 'Tabe, kenapi habar ikam?',
    indonesia: 'Halo / Salam, bagaimana kabarmu?',
    english: 'Hello, how are you doing?',
    category: 'Sapaan',
    context: 'Sapaan hangat saat bertemu kenalan atau kerabat.'
  },
  {
    id: 'p-02',
    arut: 'Habar bahalap, tarima kasih.',
    indonesia: 'Kabar baik, terima kasih.',
    english: 'I am doing well, thank you.',
    category: 'Sapaan',
    context: 'Jawaban santun atas pertanyaan kabar.'
  },
  {
    id: 'p-03',
    arut: 'Handak tulak mandai sungei Arut.',
    indonesia: 'Mau pergi ke hulu Sungai Arut.',
    english: 'Going upstream along the Arut River.',
    category: 'Sehari-hari',
    context: 'Arah perjalanan aktivitas menyusuri perairan sungai.'
  },
  {
    id: 'p-04',
    arut: 'Ayo itah kuman manuk bakar beheso.',
    indonesia: 'Ayo kita makan ayam bakar bersama-sama.',
    english: 'Let us eat grilled chicken together.',
    category: 'Sehari-hari',
    context: 'Ajakan makan bersama keluarga atau tamu.'
  },
  {
    id: 'p-05',
    arut: 'Kueh aka lewu Pangkut?',
    indonesia: 'Di mana letak desa Pangkut?',
    english: 'Where is Pangkut village located?',
    category: 'Pertanyaan',
    context: 'Menanyakan arah atau tempat tujuan.'
  },
  {
    id: 'p-06',
    arut: 'Narai gawian ikam andau tuh?',
    indonesia: 'Apa yang sedang kamu kerjakan hari ini?',
    english: 'What are you working on today?',
    category: 'Pertanyaan',
    context: 'Menanyakan kegiatan atau pekerjaan sehari-hari.'
  },
  {
    id: 'p-07',
    arut: 'Bahaum melai balai adat lewu.',
    indonesia: 'Bermusyawarah di balai adat kampung.',
    english: 'Meeting for council deliberation in the village hall.',
    category: 'Keluarga',
    context: 'Kegiatan musyawarah adat desa.'
  },
  {
    id: 'p-08',
    arut: 'Ela marusak himba lewu itah.',
    indonesia: 'Jangan merusak hutan rimba kampung kita.',
    english: 'Do not desecrate the sacred rainforest of our land.',
    category: 'Alam',
    context: 'Pesan kearifan lokal menjaga kelestarian alam Arut.'
  },
  {
    id: 'p-09',
    arut: 'Danum sungei Arut tuh herang toto.',
    indonesia: 'Air sungai Arut ini sangat jernih.',
    english: 'The water of the Arut River is remarkably pure.',
    category: 'Alam',
    context: 'Mengagumi kejernihan air hulu sungai.'
  }
];

export type LangCode = 'arut' | 'id' | 'en';

// Helper functions for 3-way translation lookup
export function translateText(
  text: string,
  fromLang: LangCode,
  toLang: LangCode
): {
  translatedText: string;
  matchedWords: DictionaryWord[];
  notes: string[];
} {
  const trimmed = text.trim();
  if (!trimmed || fromLang === toLang) {
    return { translatedText: trimmed, matchedWords: [], notes: [] };
  }

  const lowerText = trimmed.toLowerCase();

  // 1. Direct match with common phrases
  for (const phrase of COMMON_PHRASES) {
    let sourceText = '';
    if (fromLang === 'arut') sourceText = phrase.arut.toLowerCase();
    else if (fromLang === 'id') sourceText = phrase.indonesia.toLowerCase();
    else if (fromLang === 'en') sourceText = phrase.english.toLowerCase();

    if (sourceText === lowerText || lowerText.includes(sourceText) || sourceText.includes(lowerText)) {
      let targetText = '';
      if (toLang === 'arut') targetText = phrase.arut;
      else if (toLang === 'id') targetText = phrase.indonesia;
      else if (toLang === 'en') targetText = phrase.english;

      return {
        translatedText: targetText,
        matchedWords: [],
        notes: [`Matched conversation expression (${phrase.category}): "${phrase.context}"`]
      };
    }
  }

  // 2. Tokenized word-by-word translation
  const tokens = trimmed.split(/([\s,.;:!?]+)/);
  const matchedWords: DictionaryWord[] = [];
  const notes: string[] = [];

  const translatedWords = tokens.map(token => {
    if (/^[\s,.;:!?]+$/.test(token)) return token;

    const clean = token.toLowerCase().replace(/[^a-zA-Z0-9'-]/g, '');
    if (!clean) return token;

    let found: DictionaryWord | undefined;

    if (fromLang === 'arut') {
      found = ARUT_DICTIONARY.find(w => w.wordArut.toLowerCase() === clean);
    } else if (fromLang === 'id') {
      found = ARUT_DICTIONARY.find(w => {
        const parts = w.wordId.toLowerCase().split(/[\s/,;]+/);
        return parts.includes(clean) || w.wordId.toLowerCase() === clean;
      });
    } else if (fromLang === 'en') {
      found = ARUT_DICTIONARY.find(w => {
        const parts = w.wordEn.toLowerCase().split(/[\s/,;]+/);
        return parts.includes(clean) || w.wordEn.toLowerCase() === clean;
      });
    }

    if (found) {
      if (!matchedWords.some(m => m.id === found!.id)) {
        matchedWords.push(found);
      }

      if (toLang === 'arut') {
        return found.wordArut;
      } else if (toLang === 'id') {
        return found.wordId.split('/')[0].trim();
      } else if (toLang === 'en') {
        return found.wordEn.split('/')[0].trim();
      }
    }

    return token;
  });

  if (matchedWords.length === 0) {
    notes.push(
      fromLang === 'en'
        ? 'No exact match in core baseline lexicon. You can propose this word in the Contributor Hub.'
        : 'Belum ada padanan persis dalam database leksikal dasar. Anda dapat mengusulkannya di Area Kontributor.'
    );
  } else {
    notes.push(
      fromLang === 'en'
        ? `Successfully translated ${matchedWords.length} lexicon terms using verified Dayak Arut corpus.`
        : `Berhasil menerjemahkan ${matchedWords.length} leksikon kosakata terverifikasi.`
    );
  }

  return {
    translatedText: translatedWords.join(''),
    matchedWords,
    notes
  };
}
