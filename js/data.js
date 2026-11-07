/* =========================================================
   LMS BAT — Data dummy
   Prototipe antarmuka: TIDAK terhubung database.
   Semua data hidup di memori browser dan kembali ke awal saat halaman dimuat ulang.
   Tanggal dibuat relatif terhadap hari ini agar tampilan selalu terasa "baru".

   Model data:
   - Kelompok Kelas (groups): satu Wali Kelas per kelompok; satu Wali boleh memegang beberapa kelompok.
   - Pelajar (students): tepat satu Kelompok Kelas (groupId).
   - Mata Pelajaran (subjects): materi melekat pada mapel.
   - Sesi/Jadwal (sessions): Kelompok Kelas + Mata Pelajaran + Tutor + tanggal/jam + tempat. Seluruhnya luring.
   - Tugas (assignments): milik satu mapel, ditujukan ke satu atau beberapa Kelompok Kelas.
   - Panitia (staff): Tutor dan Wali Kelas adalah peran terpisah (tidak boleh dirangkap).
   ========================================================= */
const DB = (() => {
  const pad = n => String(n).padStart(2, '0');
  const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const T = ymd(today);
  const D = n => { const d = new Date(today); d.setDate(d.getDate() + n); return ymd(d); };
  const addMin = (hm, m) => { const [h, mm] = hm.split(':').map(Number); const t = h * 60 + mm + m; return `${pad(Math.floor(t / 60))}:${pad(t % 60)}`; };

  // PRNG deterministik agar data dummy konsisten
  let seed = 61126;
  const rand = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const ri = (a, b) => Math.floor(rand() * (b - a + 1)) + a;

  /* ---------- Peran & akun demo ---------- */
  const roles = { tutor: 'Tutor', wali: 'Wali Kelas', kurikulum: 'Kurikulum', ketua: 'Ketua BAT', admin: 'Administrator' };

  const accounts = [
    { email: 'nadia@bat.id', type: 'pelajar', name: 'Nadia Putri Ramadhani', studentId: 'p1', roles: [], label: 'Pelajar' },
    { email: 'dimas@bat.id', type: 'panitia', name: 'Dimas Prasetyo', roles: ['tutor'], label: 'Tutor' },
    { email: 'fajar@bat.id', type: 'panitia', name: 'Fajar Nugroho', roles: ['wali'], label: 'Wali Kelas' },
    { email: 'kurikulum@bat.id', type: 'panitia', name: 'Anindya Kirana', roles: ['kurikulum'], label: 'Kurikulum' },
    { email: 'ketua@bat.id', type: 'panitia', name: 'Bima Satria', roles: ['ketua'], label: 'Ketua BAT' },
    { email: 'admin@bat.id', type: 'panitia', name: 'Teguh Santoso', roles: ['admin'], label: 'Administrator' },
  ];

  /* ---------- Panitia ---------- */
  const staff = [
    { id: 'st1', name: 'Dimas Prasetyo', email: 'dimas@bat.id', role: 'tutor', subjects: ['pk', 'pm'] },
    { id: 'st2', name: 'Laras Kinanti', email: 'laras@bat.id', role: 'tutor', subjects: ['pu', 'pbm'] },
    { id: 'st3', name: 'Salsabila Azzahra', email: 'salsabila@bat.id', role: 'tutor', subjects: ['lbi', 'ppu'] },
    { id: 'st4', name: 'Rizky Maulana', email: 'rizky@bat.id', role: 'tutor', subjects: ['lbe', 'pu'] },
    { id: 'st5', name: 'Hendra Gunawan', email: 'hendra@bat.id', role: 'tutor', subjects: ['pk', 'pm'] },
    { id: 'st6', name: 'Fajar Nugroho', email: 'fajar@bat.id', role: 'wali', subjects: [] },
    { id: 'st7', name: 'Wulan Sari', email: 'wulan@bat.id', role: 'wali', subjects: [] },
    { id: 'st8', name: 'Putri Maharani', email: 'putri.m@bat.id', role: 'wali', subjects: [] },
    { id: 'st9', name: 'Anindya Kirana', email: 'kurikulum@bat.id', role: 'kurikulum', subjects: [] },
    { id: 'st10', name: 'Bima Satria', email: 'ketua@bat.id', role: 'ketua', subjects: [] },
    { id: 'st11', name: 'Teguh Santoso', email: 'admin@bat.id', role: 'admin', subjects: [] },
  ];

  /* ---------- Mata Pelajaran ---------- */
  const subjects = [
    { id: 'pu', code: 'PU', name: 'Penalaran Umum', color: '#34d399', active: true,
      desc: 'Penalaran deduktif, induktif, dan kuantitatif untuk subtes TPS.',
      topics: ['Penalaran Deduktif', 'Penalaran Induktif', 'Silogisme', 'Pola Bilangan', 'Analisis Argumen', 'Pembahasan Soal PU'] },
    { id: 'pk', code: 'PK', name: 'Pengetahuan Kuantitatif', color: '#8b7bff', active: true,
      desc: 'Aljabar, fungsi, limit, turunan, peluang, dan statistika dasar.',
      topics: ['Limit Fungsi', 'Turunan & Aplikasinya', 'Peluang & Kombinatorika', 'Barisan & Deret', 'Pembahasan Soal PK'] },
    { id: 'pm', code: 'PM', name: 'Penalaran Matematika', color: '#60a5fa', active: true,
      desc: 'Penerapan konsep matematika pada masalah kontekstual sehari-hari.',
      topics: ['Integral Dasar', 'Statistika Data', 'Geometri Kontekstual', 'Pemodelan Matematika', 'Pembahasan Soal PM'] },
    { id: 'lbi', code: 'LBI', name: 'Literasi Bahasa Indonesia', color: '#ffb547', active: true,
      desc: 'Pemahaman bacaan, ide pokok, simpulan, dan evaluasi teks berbahasa Indonesia.',
      topics: ['Ide Pokok & Simpulan', 'Teks Argumentasi', 'Kohesi & Koherensi', 'Evaluasi Bacaan', 'Pembahasan Soal LBI'] },
    { id: 'lbe', code: 'LBE', name: 'Literasi Bahasa Inggris', color: '#f472b6', active: true,
      desc: 'Reading comprehension, vocabulary in context, dan inferensi teks berbahasa Inggris.',
      topics: ['Reading Comprehension', 'Vocabulary in Context', 'Main Idea & Inference', 'Pembahasan Soal LBE'] },
    { id: 'pbm', code: 'PBM', name: 'Pemahaman Bacaan & Menulis', color: '#22d3ee', active: true,
      desc: 'Ejaan, tata kalimat, paragraf efektif, dan penyuntingan teks.',
      topics: ['Kalimat Efektif', 'Ejaan & Tanda Baca', 'Paragraf Argumentatif', 'Penyuntingan Teks'] },
    { id: 'ppu', code: 'PPU', name: 'Pengetahuan & Pemahaman Umum', color: '#a3e635', active: true,
      desc: 'Wawasan umum, makna kata, dan hubungan antargagasan dalam teks.',
      topics: ['Makna Kata & Istilah', 'Hubungan Antarparagraf', 'Wawasan Sosial', 'Pembahasan Soal PPU'] },
    { id: 'sbm', code: 'SBM', name: 'Strategi Belajar & Manajemen Waktu', color: '#fb923c', active: false,
      desc: 'Mapel pendukung tentang teknik belajar efektif dan manajemen waktu ujian. Sedang tidak dijadwalkan.',
      topics: ['Teknik Belajar Aktif', 'Manajemen Waktu Ujian'] },
  ];

  /* ---------- Kelompok Kelas ---------- */
  const groups = [
    { id: 'g1', name: 'Saintek A', program: 'SNBT Saintek', color: '#8b7bff', wali: 'Fajar Nugroho', room: 'Ruang 2 · Sekretariat BAT', late: 15,
      desc: 'Kelompok persiapan SNBT Saintek dengan fokus Pengetahuan Kuantitatif, Penalaran Matematika, dan Penalaran Umum.' },
    { id: 'g2', name: 'Saintek B', program: 'SNBT Saintek', color: '#22d3ee', wali: 'Fajar Nugroho', room: 'Ruang 3 · Sekretariat BAT', late: 15,
      desc: 'Kelompok paralel Saintek dengan tambahan Literasi Bahasa Inggris.' },
    { id: 'g3', name: 'Soshum A', program: 'SNBT Soshum', color: '#ffb547', wali: 'Wulan Sari', room: 'Ruang 1 · Sekretariat BAT', late: 15,
      desc: 'Kelompok persiapan SNBT Soshum: literasi, pemahaman bacaan, dan pengetahuan umum.' },
    { id: 'g4', name: 'Gap Year', program: 'Alumni / Gap Year', color: '#f472b6', wali: 'Wulan Sari', room: 'Aula Perpustakaan Kota', late: 15,
      desc: 'Kelompok untuk alumni dan pejuang gap year dengan ritme intensif di pagi hari.' },
  ];

  /* ---------- Pelajar (satu pelajar = satu Kelompok Kelas) ---------- */
  const rawStudents = [
    ['p1', 'Nadia Putri Ramadhani', 'g1', 'SMA N 3 Yogyakarta', 'Kelas 12'],
    ['p2', 'Rania Kusuma Wardani', 'g1', 'SMA N 8 Yogyakarta', 'Kelas 12'],
    ['p3', 'Bagas Aditya Nugroho', 'g1', 'SMA N 1 Bantul', 'Kelas 12'],
    ['p4', 'Fikri Hidayatullah', 'g3', 'MAN 1 Yogyakarta', 'Kelas 12'],
    ['p5', 'Aulia Rahmawati', 'g4', 'Alumni 2025', 'Gap Year'],
    ['p6', 'Yoga Pratama', 'g1', 'SMK N 2 Yogyakarta', 'Kelas 12'],
    ['p7', 'Citra Larasati', 'g3', 'SMA N 6 Yogyakarta', 'Kelas 12'],
    ['p8', 'Hana Safitri', 'g3', 'SMA Muhammadiyah 1', 'Kelas 12'],
    ['p9', 'Raka Dwi Saputra', 'g4', 'Alumni 2025', 'Gap Year'],
    ['p10', 'Intan Permatasari', 'g2', 'SMA N 2 Sleman', 'Kelas 12'],
    ['p11', 'Galih Wicaksono', 'g1', 'SMA N 5 Yogyakarta', 'Kelas 12'],
    ['p12', 'Salma Nabila', 'g3', 'SMA N 7 Yogyakarta', 'Kelas 12'],
    ['p13', 'Arief Rahman', 'g4', 'Alumni 2024', 'Gap Year'],
    ['p14', 'Dewi Anggraini', 'g1', 'SMA Stella Duce 1', 'Kelas 12'],
    ['p15', 'Farhan Maulana', 'g3', 'SMA N 9 Yogyakarta', 'Kelas 12'],
    ['p16', 'Putri Ayu Lestari', 'g4', 'Alumni 2025', 'Gap Year'],
    ['p17', 'Kevin Ardiansyah', 'g2', 'SMA N 4 Yogyakarta', 'Kelas 12'],
    ['p18', 'Lutfi Hakim', 'g2', 'MAN 2 Yogyakarta', 'Kelas 12'],
    ['p19', 'Mega Puspita', 'g3', 'SMA N 11 Yogyakarta', 'Kelas 12'],
    ['p20', 'Nur Aini Fadhilah', 'g2', 'SMA N 1 Sleman', 'Kelas 12'],
    ['p21', 'Okta Ramadhan', 'g4', 'Alumni 2025', 'Gap Year'],
    ['p22', 'Rizal Fahmi', 'g3', 'SMA N 10 Yogyakarta', 'Kelas 12'],
    ['p23', 'Sekar Ayu Pertiwi', 'g2', 'SMA N 2 Yogyakarta', 'Kelas 12'],
    ['p24', 'Tegar Wibowo', 'g4', 'Alumni 2024', 'Gap Year'],
  ];
  const students = rawStudents.map(([id, name, groupId, school, status]) => {
    const base = ri(470, 560);
    return {
      id, name, groupId, school, status,
      email: name.split(' ')[0].toLowerCase() + '@bat.id',
      phone: '08' + ri(1100000000, 1999999999),
      joined: D(-ri(60, 120)),
      att: ri(71, 99),
      avg: ri(68, 94),
      toHist: [base, base + ri(5, 30), base + ri(20, 50), base + ri(30, 75)],
    };
  });

  /* ---------- Sesi (dibangkitkan dari pola mingguan, semua luring) ---------- */
  // [kelompok, hari (0=Min), mulai, selesai, mapel, tutor]
  const pattern = [
    ['g1', 1, '15:30', '17:00', 'pk', 'Dimas Prasetyo'],
    ['g1', 3, '15:30', '17:00', 'pu', 'Laras Kinanti'],
    ['g1', 5, '15:30', '17:00', 'pm', 'Dimas Prasetyo'],
    ['g2', 2, '15:30', '17:00', 'pk', 'Hendra Gunawan'],
    ['g2', 4, '15:30', '17:00', 'lbe', 'Rizky Maulana'],
    ['g2', 6, '09:00', '10:30', 'pm', 'Dimas Prasetyo'],
    ['g3', 1, '13:00', '14:30', 'lbi', 'Salsabila Azzahra'],
    ['g3', 3, '13:00', '14:30', 'pbm', 'Laras Kinanti'],
    ['g3', 5, '13:00', '14:30', 'ppu', 'Salsabila Azzahra'],
    ['g4', 2, '09:00', '11:00', 'lbi', 'Salsabila Azzahra'],
    ['g4', 4, '09:00', '11:00', 'pk', 'Hendra Gunawan'],
    ['g4', 6, '13:00', '15:00', 'pu', 'Rizky Maulana'],
  ];
  const sessions = [];
  const topicIdx = {};
  let sid = 1;
  const gRoom = gid => groups.find(g => g.id === gid).room;
  const subjTopics = id => subjects.find(s => s.id === id).topics;
  for (let off = -28; off <= 20; off++) {
    const date = D(off);
    const dow = new Date(today.getTime() + off * 864e5).getDay();
    pattern.filter(p => p[1] === dow).forEach(([groupId, , start, end, subjectId, tutor]) => {
      const k = groupId + subjectId;
      const i = topicIdx[k] = (topicIdx[k] ?? -1) + 1;
      const tp = subjTopics(subjectId);
      sessions.push({ id: 's' + sid++, groupId, subjectId, tutor, date, start, end, topic: tp[i % tp.length], location: gRoom(groupId), changed: null });
    });
  }
  // Pastikan selalu ada sesi hari ini untuk Saintek A (kebutuhan demo presensi)
  if (!sessions.some(s => s.groupId === 'g1' && s.date === T)) {
    sessions.push({ id: 's' + sid++, groupId: 'g1', subjectId: 'pk', tutor: 'Dimas Prasetyo', date: T, start: '15:30', end: '17:00', topic: 'Sesi Tambahan: Pembahasan Soal PK', location: gRoom('g1'), changed: null });
  }
  const sortSessions = () => sessions.sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  sortSessions();

  // Tandai perubahan jadwal pada sesi mendatang
  const futG2 = sessions.find(s => s.groupId === 'g2' && s.date > T);
  if (futG2) { futG2.start = addMin(futG2.start, 30); futG2.end = addMin(futG2.end, 30); futG2.changed = 'Jam diundur 30 menit karena tutor ada agenda kampus.'; }
  const futG1 = sessions.filter(s => s.groupId === 'g1' && s.date > T)[1];
  if (futG1) { futG1.location = 'Ruang 4 · Sekretariat BAT'; futG1.changed = 'Pindah ke Ruang 4 karena Ruang 2 dipakai rapat panitia.'; }

  const pastOf = (gid, n) => sessions.filter(s => s.groupId === gid && s.date < T).reverse()[n];
  const nextOf = (gid, n) => sessions.filter(s => s.groupId === gid && s.date > T)[n];

  /* ---------- Presensi Nadia (p1) ---------- */
  const attendance = { p1: {} };
  sessions.filter(s => s.groupId === 'g1' && s.date < T).forEach(s => {
    if (rand() < 0.82) attendance.p1[s.id] = { status: 'hadir', time: addMin(s.start, ri(-8, 9)) };
    else attendance.p1[s.id] = { status: 'terlambat', time: addMin(s.start, ri(17, 32)) };
  });
  const sIzin = pastOf('g1', 3), sAlpa = pastOf('g1', 5), sLate = pastOf('g1', 1);
  if (sIzin) attendance.p1[sIzin.id] = { status: 'izin', time: null };
  if (sAlpa) attendance.p1[sAlpa.id] = { status: 'alpa', time: null };
  if (sLate) attendance.p1[sLate.id] = { status: 'terlambat', time: addMin(sLate.start, 22) };

  /* ---------- Tugas (milik mapel, ditujukan ke satu/lebih Kelompok Kelas) ---------- */
  const assignments = [
    { id: 'a1', subjectId: 'pk', groupIds: ['g1', 'g2'], by: 'Dimas Prasetyo', title: 'Latihan Soal Limit Fungsi', desc: 'Kerjakan 15 soal limit fungsi aljabar dan trigonometri. Tulis langkah pengerjaan secara runtut.', deadline: D(-6), time: '23:59', createdAt: D(-12), submitted: 10, graded: 10,
      my: { status: 'dinilai', score: 88, file: 'Nadia_Limit_Fungsi.pdf', submittedAt: `${D(-7)} 20:14`, feedback: 'Langkah pengerjaan sudah rapi. Perhatikan lagi limit tak hingga bentuk akar (no. 12–13), coba kalikan sekawan.' } },
    { id: 'a2', subjectId: 'pu', groupIds: ['g1'], by: 'Laras Kinanti', title: 'Analisis Silogisme (10 Soal)', desc: 'Tentukan simpulan yang sah dari 10 premis dan jelaskan alasannya dengan diagram Venn sederhana.', deadline: D(-3), time: '21:00', createdAt: D(-9), submitted: 6, graded: 6,
      my: { status: 'dinilai', score: 92, file: 'Silogisme_Nadia.pdf', submittedAt: `${D(-4)} 19:40`, feedback: 'Sangat baik! Diagram Venn membantu sekali. Pertahankan ketelitian membaca kuantor “sebagian”.' } },
    { id: 'a3', subjectId: 'pk', groupIds: ['g1'], by: 'Dimas Prasetyo', title: 'Rangkuman Turunan & Aplikasinya', desc: 'Buat rangkuman 2 halaman tentang turunan, nilai stasioner, dan aplikasi maksimum–minimum.', deadline: D(-1), time: '23:59', createdAt: D(-6), submitted: 4, graded: 1,
      my: { status: 'dikumpul', score: null, file: 'Rangkuman_Turunan.pdf', submittedAt: `${D(-2)} 21:05`, feedback: '' } },
    { id: 'a4', subjectId: 'pm', groupIds: ['g1', 'g2'], by: 'Dimas Prasetyo', title: 'Latihan Integral Dasar (20 Soal)', desc: 'Kerjakan 20 soal integral tak tentu & tentu. Unggah foto atau PDF hasil pekerjaan.', deadline: D(1), time: '23:59', createdAt: D(-3), submitted: 3, graded: 0,
      my: { status: 'belum', score: null, file: null, submittedAt: null, feedback: '' } },
    { id: 'a5', subjectId: 'pu', groupIds: ['g1', 'g4'], by: 'Laras Kinanti', title: 'Mini Project: Pola Bilangan', desc: 'Susun 5 soal pola bilangan buatanmu sendiri beserta pembahasannya.', deadline: D(3), time: '21:00', createdAt: D(-2), submitted: 1, graded: 0,
      my: { status: 'belum', score: null, file: null, submittedAt: null, feedback: '' } },
    { id: 'a6', subjectId: 'pm', groupIds: ['g1'], by: 'Dimas Prasetyo', title: 'Problem Set Statistika Data', desc: 'Selesaikan 10 soal statistika: rata-rata, median, modus, dan membaca diagram.', deadline: D(6), time: '23:59', createdAt: D(0), submitted: 0, graded: 0,
      my: { status: 'belum', score: null, file: null, submittedAt: null, feedback: '' } },
    { id: 'a7', subjectId: 'lbi', groupIds: ['g3', 'g4'], by: 'Salsabila Azzahra', title: 'Esai Ide Pokok Bacaan', desc: 'Tentukan ide pokok dari 3 teks bacaan dan tulis simpulan dalam 150 kata.', deadline: D(2), time: '23:59', createdAt: D(-4), submitted: 6, graded: 2 },
    { id: 'a8', subjectId: 'lbe', groupIds: ['g2'], by: 'Rizky Maulana', title: 'Reading Comprehension Set 1', desc: 'Kerjakan 20 soal reading comprehension dan tandai kata kunci pada teks.', deadline: D(4), time: '21:00', createdAt: D(-1), submitted: 3, graded: 0 },
    { id: 'a9', subjectId: 'pbm', groupIds: ['g3'], by: 'Laras Kinanti', title: 'Menulis Paragraf Argumentatif', desc: 'Tulis satu paragraf argumentatif (120–150 kata) dengan tema pendidikan.', deadline: D(5), time: '23:59', createdAt: D(-1), submitted: 2, graded: 0 },
  ];

  /* ---------- Materi (milik mapel) ---------- */
  const materials = [
    { id: 'm1', subjectId: 'pk', title: 'Modul Limit & Turunan', type: 'PDF', size: '2,4 MB', date: D(-14), by: 'Dimas Prasetyo' },
    { id: 'm2', subjectId: 'pk', title: 'Rumus Cepat Peluang', type: 'PDF', size: '860 KB', date: D(-9), by: 'Hendra Gunawan' },
    { id: 'm3', subjectId: 'pm', title: 'Video Pembahasan Integral Dasar', type: 'Video', size: '48 menit', date: D(-2), by: 'Dimas Prasetyo' },
    { id: 'm4', subjectId: 'pm', title: 'Slide Statistika Data', type: 'PPT', size: '5,1 MB', date: D(-4), by: 'Hendra Gunawan' },
    { id: 'm5', subjectId: 'pu', title: 'Cheatsheet Silogisme', type: 'PDF', size: '640 KB', date: D(-11), by: 'Laras Kinanti' },
    { id: 'm6', subjectId: 'pu', title: 'Bank Soal Penalaran Umum', type: 'PDF', size: '3,8 MB', date: D(-6), by: 'Laras Kinanti' },
    { id: 'm7', subjectId: 'pu', title: 'Latihan Interaktif PU', type: 'Link', size: 'Tautan', date: D(-1), by: 'Rizky Maulana' },
    { id: 'm8', subjectId: 'lbi', title: 'Modul Literasi Bahasa Indonesia', type: 'PDF', size: '1,9 MB', date: D(-8), by: 'Salsabila Azzahra' },
    { id: 'm9', subjectId: 'lbe', title: 'Reading Strategy Slides', type: 'PPT', size: '3,2 MB', date: D(-5), by: 'Rizky Maulana' },
    { id: 'm10', subjectId: 'pbm', title: 'Panduan Kalimat Efektif', type: 'PDF', size: '1,1 MB', date: D(-7), by: 'Laras Kinanti' },
    { id: 'm11', subjectId: 'ppu', title: 'Ringkasan Wawasan Umum', type: 'PDF', size: '1,4 MB', date: D(-3), by: 'Salsabila Azzahra' },
  ];

  /* ---------- Perizinan (satu pengajuan = satu sesi, lampiran opsional) ---------- */
  const leaves = [];
  const addLeave = o => leaves.push(Object.assign({ file: null, waliNote: '', waliRec: '', waliBy: '', waliAt: '', decisionNote: '', decisionBy: '', decisionAt: '' }, o));
  const n1 = nextOf('g1', 1), n2 = nextOf('g1', 0), n3 = nextOf('g1', 2), n4 = nextOf('g3', 0), n5 = nextOf('g4', 0), n6 = nextOf('g3', 1);
  if (n1) addLeave({ id: 'L2', studentId: 'p1', sessionId: n1.id, reason: 'Kegiatan sekolah', note: 'Mengikuti lomba debat tingkat provinsi mewakili sekolah.', file: 'Surat_Dispensasi_Sekolah.pdf', createdAt: `${D(0)} 07:42`, status: 'wali' });
  if (sIzin) addLeave({ id: 'L1', studentId: 'p1', sessionId: sIzin.id, reason: 'Sakit', note: 'Demam sejak pagi, sudah periksa ke puskesmas.', file: 'Surat_Keterangan_Dokter.jpg', createdAt: `${sIzin.date} 08:10`, status: 'disetujui',
    waliRec: 'Direkomendasikan', waliNote: 'Sudah konfirmasi dengan Nadia, kondisinya memang sakit.', waliBy: 'Fajar Nugroho', waliAt: `${sIzin.date} 09:02`,
    decisionNote: 'Disetujui. Semoga lekas sembuh!', decisionBy: 'Anindya Kirana', decisionAt: `${sIzin.date} 11:30` });
  if (n2) addLeave({ id: 'L3', studentId: 'p2', sessionId: n2.id, reason: 'Keperluan keluarga', note: 'Menghadiri pernikahan kakak di Klaten.', file: null, createdAt: `${D(-1)} 20:15`, status: 'wali' });
  if (n3) addLeave({ id: 'L4', studentId: 'p3', sessionId: n3.id, reason: 'Kegiatan sekolah', note: 'Ujian praktik kimia dijadwalkan ulang ke sore hari.', file: 'Jadwal_Ujian_Praktik.pdf', createdAt: `${D(-2)} 16:20`, status: 'kurikulum',
    waliRec: 'Direkomendasikan', waliNote: 'Jadwal ujian sudah saya cek ke wali kelas sekolahnya.', waliBy: 'Fajar Nugroho', waliAt: `${D(-1)} 08:05` });
  if (n4) addLeave({ id: 'L5', studentId: 'p4', sessionId: n4.id, reason: 'Lainnya', note: 'Ingin menonton konser bersama teman.', file: null, createdAt: `${D(-3)} 21:44`, status: 'ditolak',
    waliRec: 'Tidak direkomendasikan', waliNote: 'Alasan kurang mendesak, sesi ini materi penting.', waliBy: 'Wulan Sari', waliAt: `${D(-2)} 10:00`,
    decisionNote: 'Ditolak karena bukan alasan mendesak. Silakan tetap hadir ya.', decisionBy: 'Anindya Kirana', decisionAt: `${D(-2)} 15:12` });
  if (n5) addLeave({ id: 'L6', studentId: 'p5', sessionId: n5.id, reason: 'Sakit', note: 'Pemulihan pasca operasi gigi bungsu.', file: 'Surat_Dokter_Gigi.pdf', createdAt: `${D(-1)} 09:30`, status: 'kurikulum',
    waliRec: 'Direkomendasikan', waliNote: 'Surat dokter valid.', waliBy: 'Wulan Sari', waliAt: `${D(-1)} 13:45` });
  if (n6) addLeave({ id: 'L7', studentId: 'p7', sessionId: n6.id, reason: 'Kendala transportasi', note: 'Motor sedang diservis, belum ada tumpangan.', file: null, createdAt: `${D(0)} 06:58`, status: 'wali' });

  /* ---------- Koreksi presensi & audit ---------- */
  const corrections = [];
  const pc1 = pastOf('g1', 0), pc2 = pastOf('g2', 0);
  if (pc1) corrections.push({ id: 'k1', studentId: 'p3', sessionId: pc1.id, type: 'Lupa memindai', note: 'Saya hadir tapi lupa scan karena HP mati.', at: `${pc1.date} 18:20`, status: 'pending' });
  if (pc2) corrections.push({ id: 'k2', studentId: 'p10', sessionId: pc2.id, type: 'Kendala teknis', note: 'Kamera HP tidak bisa membaca QR karena layar retak.', at: `${pc2.date} 18:05`, status: 'pending' });

  const audit = [
    { who: 'Dimas Prasetyo', at: `${D(-1)} 17:05`, what: 'Membuka & menutup sesi presensi Saintek A · PK' },
    { who: 'Anindya Kirana', at: `${D(-2)} 15:12`, what: 'Mengubah status presensi Fikri Hidayatullah → Tidak hadir (izin ditolak)' },
    { who: 'Sistem', at: `${D(-3)} 11:30`, what: 'Status presensi otomatis menjadi “Izin” (pengajuan disetujui)' },
  ];

  /* ---------- Pengumuman ---------- */
  const announcements = [
    { id: 'n1', scope: 'umum', title: 'Pendaftaran Tryout Eksternal #5 dibuka', body: 'Daftarkan dirimu sebelum Minggu. Hasil tryout akan diinput panitia ke laporan perkembanganmu.', date: D(0), by: 'Kurikulum', pinned: true },
    { id: 'n2', scope: 'kelompok', groupId: 'g1', title: 'Perubahan ruang Saintek A', body: 'Salah satu sesi minggu depan pindah ke Ruang 4 karena Ruang 2 dipakai rapat panitia.', date: D(-1), by: 'Fajar Nugroho' },
    { id: 'n4', scope: 'kelompok', groupId: 'g2', title: 'Sesi berikutnya diundur 30 menit', body: 'Sesi terdekat Saintek B dimulai 30 menit lebih lambat dari biasanya.', date: D(-2), by: 'Fajar Nugroho' },
    { id: 'n5', scope: 'umum', title: 'Pengingat: ajukan izin minimal H-1', body: 'Satu pengajuan untuk satu sesi. Diverifikasi Wali Kelas lalu diputuskan Kurikulum.', date: D(-5), by: 'Kurikulum' },
    { id: 'n6', scope: 'kelompok', groupId: 'g3', title: 'Bawa kamus KBBI', body: 'Sesi literasi minggu ini butuh akses KBBI di HP masing-masing.', date: D(-3), by: 'Salsabila Azzahra' },
  ];

  /* ---------- Tryout eksternal Nadia ---------- */
  const tryouts = [
    { id: 'to1', name: 'Tryout Eksternal #1', platform: 'Mitra TO Nasional', date: D(-70), scores: { PU: 498, PPU: 512, PBM: 505, PK: 470, LBI: 520, LBE: 488, PM: 462 } },
    { id: 'to2', name: 'Tryout Eksternal #2', platform: 'Mitra TO Nasional', date: D(-45), scores: { PU: 530, PPU: 525, PBM: 518, PK: 502, LBI: 541, LBE: 510, PM: 495 } },
    { id: 'to3', name: 'Tryout Eksternal #3', platform: 'TO Kampus UGM', date: D(-21), scores: { PU: 552, PPU: 548, PBM: 530, PK: 538, LBI: 560, LBE: 522, PM: 528 } },
    { id: 'to4', name: 'Tryout Eksternal #4', platform: 'Mitra TO Nasional', date: D(-5), scores: { PU: 575, PPU: 560, PBM: 549, PK: 566, LBI: 571, LBE: 540, PM: 561 } },
  ];

  const notes = [
    { by: 'Dimas Prasetyo', role: 'Tutor PK & PM', date: D(-3), text: 'Nadia aktif bertanya dan pemahaman konsep turunannya kuat. Perlu latihan kecepatan di soal Pengetahuan Kuantitatif.' },
    { by: 'Laras Kinanti', role: 'Tutor PU', date: D(-8), text: 'Penalaran deduktif sudah sangat baik. Sesekali terburu-buru membaca soal, coba garis bawahi kata kunci.' },
    { by: 'Fajar Nugroho', role: 'Wali Kelas Saintek A', date: D(-15), text: 'Kehadiran konsisten. Tetap jaga kesehatan menjelang tryout berikutnya ya!' },
  ];

  const activity = [
    { who: 'Rizky Maulana', what: 'mengunggah materi', obj: 'Latihan Interaktif PU', at: `${D(-1)} 20:40`, icon: 'upload' },
    { who: 'Dimas Prasetyo', what: 'menilai pengumpulan', obj: 'Rangkuman Turunan', at: `${D(-1)} 19:12`, icon: 'check' },
    { who: 'Rania Kusuma Wardani', what: 'mengajukan izin untuk', obj: 'Saintek A', at: `${D(-1)} 20:15`, icon: 'clipboard' },
    { who: 'Anindya Kirana', what: 'menambahkan jadwal', obj: 'Gap Year · PU', at: `${D(-2)} 14:00`, icon: 'calendar' },
    { who: 'Salsabila Azzahra', what: 'membuat tugas', obj: 'Esai Ide Pokok Bacaan', at: `${D(-4)} 16:30`, icon: 'file' },
    { who: 'Sistem', what: 'menutup sesi presensi', obj: 'Soshum A · LBI', at: `${D(-2)} 14:30`, icon: 'qr' },
  ];

  const notifications = {
    pelajar: [
      { title: 'Tugas baru: Problem Set Statistika Data', text: 'PM · Tenggat 6 hari lagi', at: `${D(0)} 08:00`, unread: true, icon: 'file' },
      { title: 'Pengajuan izin diterima', text: 'Menunggu verifikasi Wali Kelas Fajar Nugroho', at: `${D(0)} 07:43`, unread: true, icon: 'clipboard' },
      { title: 'Jadwal berubah', text: 'Salah satu sesi Saintek A pindah ke Ruang 4', at: `${D(-1)} 12:10`, unread: true, icon: 'calendar' },
      { title: 'Nilai keluar: Analisis Silogisme', text: 'Kamu mendapat 92. Lihat umpan balik tutor.', at: `${D(-2)} 09:00`, unread: false, icon: 'check' },
    ],
    panitia: [
      { title: '3 pengajuan izin menunggu', text: 'Butuh verifikasi atau keputusan', at: `${D(0)} 07:45`, unread: true, icon: 'clipboard' },
      { title: '2 pengajuan koreksi presensi', text: 'Lupa memindai & kendala teknis', at: `${D(-1)} 21:05`, unread: true, icon: 'qr' },
      { title: 'Tugas belum dinilai', text: 'Rangkuman Turunan & Aplikasinya', at: `${D(-1)} 23:59`, unread: false, icon: 'file' },
    ],
  };

  const settings = { lateTolerance: 15, qrRefresh: 30, leaveDeadline: 'H-1', correctionWindow: 2 };

  return {
    today, T, ymd, D, addMin, sortSessions,
    roles, accounts, staff, subjects, groups, students, sessions, attendance, assignments, materials,
    leaves, corrections, audit, announcements, tryouts, notes, activity, notifications, settings,
  };
})();
