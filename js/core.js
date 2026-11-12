/* =========================================================
   LMS BAT — Core: ikon, util, komponen UI, chart, lokasi presensi, halaman bersama
   ========================================================= */

/* ---------- Ikon (gaya garis, 24x24) ---------- */
const ICONS = {
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/>',
  clipboard: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="m9 14 2 2 4-4"/>',
  chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
  layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  settings: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>',
  bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  menu: '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  checkCircle: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  xCircle: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  right: '<polyline points="9 18 15 12 9 6"/>',
  left: '<polyline points="15 18 9 12 15 6"/>',
  arrowRight: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  alert: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  clip: '<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
  camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
  refresh: '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
  activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  more: '<circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/><circle cx="5" cy="12" r="1.5"/>',
  send: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
  video: '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  slides: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  trendDown: '<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>',
  trending: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
  scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  expand: '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>',
  history: '<path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><polyline points="12 7 12 12 15 14"/>',
  sparkle: '<path d="M12 3l1.9 5.8L20 10.7l-6.1 1.9L12 18.5l-1.9-5.9L4 10.7l6.1-1.9z"/>',
  swap: '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
  userPlus: '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>',
  locate: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.5"/><line x1="12" y1="1" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="23"/><line x1="1" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="23" y2="12"/>',
  key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>',
};
const icon = (n, s = 18) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;

/* Tanda sementara: bohlam putih di atas biru keabu-abuan. Ganti dengan berkas logo resmi BAT bila sudah tersedia. */
const LOGO = (s = 38) => `<svg width="${s}" height="${s}" viewBox="0 0 48 48" role="img" aria-label="Logo BAT">
  <rect width="48" height="48" rx="9" fill="#6485a3"/>
  <path fill="#fff" d="M24 9.5a10.5 10.5 0 0 0-6.4 18.8c1.3 1 2.1 2.4 2.1 4v.9h8.6v-.9c0-1.6.8-3 2.1-4A10.5 10.5 0 0 0 24 9.5z"/>
  <rect x="19.7" y="35.2" width="8.6" height="2.4" rx="1.2" fill="#fff"/><rect x="21.4" y="39" width="5.2" height="2.2" rx="1.1" fill="#fff"/>
</svg>`;

/* ---------- Util ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad2 = n => String(n).padStart(2, '0');
const todayStr = () => DB.T;
const nowHM = () => { const d = new Date(); return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };
const stamp = () => `${todayStr()} ${nowHM()}`;
const toMin = hm => { const [h, m] = hm.split(':').map(Number); return h * 60 + m; };
const parseYMD = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const fmtDate = (s, o) => parseYMD(s).toLocaleDateString('id-ID', o || { weekday: 'long', day: 'numeric', month: 'long' });
const fmtShort = s => fmtDate(s, { day: 'numeric', month: 'short' });
const fmtDay = s => fmtDate(s, { weekday: 'short', day: 'numeric', month: 'short' });
const fmtLong = s => fmtDate(s, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const fmtStamp = st => { if (!st) return '—'; const [d, t] = st.split(' '); return `${fmtShort(d)}, ${t}`; };
const dayDiff = s => Math.round((parseYMD(s) - parseYMD(todayStr())) / 864e5);
const relDay = s => { const n = dayDiff(s); if (n === 0) return 'Hari ini'; if (n === 1) return 'Besok'; if (n === -1) return 'Kemarin'; return n > 0 ? `${n} hari lagi` : `${-n} hari lalu`; };
const relStamp = st => { const [d, t] = st.split(' '); const n = dayDiff(d); return n === 0 ? `Hari ini, ${t}` : n === -1 ? `Kemarin, ${t}` : fmtStamp(st); };
const hashStr = s => { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const initials = n => n.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
const firstName = n => n.split(' ')[0];
const avatar = (name, cls = '') => `<span class="avatar ${cls}" style="--h:${hashStr(name) % 360}" title="${esc(name)}">${initials(name)}</span>`;
/* Deret bulatan lembar jawaban: H · T · I · A, satu terisi sesuai status presensi */
const ATT_LETTER = { hadir: 'H', terlambat: 'T', izin: 'I', alpa: 'A' };
const attMark = status => {
  const m = ATT[status];
  return `<span class="att-mark ${m ? 'att-' + status : ''}"><span class="bub-row" aria-hidden="true">${Object.keys(ATT_LETTER).map(k => `<i class="${k === status ? 'on' : ''}">${ATT_LETTER[k]}</i>`).join('')}</span><b>${m ? m.label : 'Belum'}</b></span>`;
};
/* Penanda naik/turun dengan ikon garis, bukan glif */
const trendMark = d => `<span class="trend">${icon(d >= 0 ? 'trending' : 'trendDown', 14)}${d >= 0 ? '+' : ''}${d}</span>`;
const badge = (t, tone = 'neutral', cls = '') => `<span class="badge b-${tone} ${cls}">${t}</span>`;
/* tag Kelompok Kelas (nama) dan tag Mata Pelajaran (kode) */
const tag = g => g ? `<span class="tag" style="--c:${g.color}">${esc(g.name)}</span>` : '';
const stag = s => s ? `<span class="tag" style="--c:${s.color}" title="${esc(s.name)}">${esc(s.code)}</span>` : '';
const avg = arr => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
const greeting = () => { const h = new Date().getHours(); return h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 18 ? 'Selamat sore' : 'Selamat malam'; };
const progress = (pct, color) => `<div class="progress"><span style="width:${Math.max(0, Math.min(100, pct))}%;${color ? `--c:${color}` : ''}"></span></div>`;
const progRow = (pct, color) => `<div class="prog-row">${progress(pct, color)}<b>${pct}%</b></div>`;
const toneByPct = p => p >= 90 ? 'var(--success)' : p >= 80 ? 'var(--primary)' : p >= 70 ? 'var(--warning)' : 'var(--danger)';

/* ---------- Meta status ---------- */
const ATT = {
  hadir: { label: 'Hadir', tone: 'success', color: 'var(--success)' },
  terlambat: { label: 'Terlambat', tone: 'warning', color: 'var(--warning)' },
  izin: { label: 'Izin', tone: 'info', color: 'var(--info)' },
  alpa: { label: 'Tidak hadir', tone: 'danger', color: 'var(--danger)' },
};
const LEAVE = {
  wali: { label: 'Menunggu verifikasi Wali Kelas', short: 'Menunggu Wali Kelas', tone: 'warning' },
  kurikulum: { label: 'Menunggu persetujuan Kurikulum', short: 'Menunggu Kurikulum', tone: 'info' },
  disetujui: { label: 'Disetujui', short: 'Disetujui', tone: 'success' },
  ditolak: { label: 'Ditolak · tidak hadir', short: 'Ditolak', tone: 'danger' },
  kedaluwarsa: { label: 'Tidak ditindak sampai sesi selesai · tidak hadir', short: 'Kedaluwarsa', tone: 'neutral' },
};
const TASK = {
  belum: { label: 'Belum dikumpul', tone: 'warning' },
  dikumpul: { label: 'Dikumpul', tone: 'info' },
  dinilai: { label: 'Dinilai', tone: 'success' },
};
const MAT_ICON = { PDF: 'file', PPT: 'slides', Video: 'video', Link: 'link' };
const MAT_COLOR = { PDF: '#b3321f', PPT: '#a85a0c', Video: '#5b4aa8', Link: '#1f5f99' };

/* ---------- Query helper (akses data dummy) ---------- */
const Q = {
  grp: id => DB.groups.find(g => g.id === id),
  subj: id => DB.subjects.find(s => s.id === id),
  student: id => DB.students.find(s => s.id === id),
  session: id => DB.sessions.find(s => s.id === id),
  staffByName: n => DB.staff.find(s => s.name === n),
  tutors: () => DB.staff.filter(s => s.role === 'tutor'),
  walis: () => DB.staff.filter(s => s.role === 'wali'),
  /* Pelajar nonaktif tidak dihitung sebagai anggota aktif kelompok */
  isActive: s => s.active !== false,
  activeStudents: () => DB.students.filter(s => s.active !== false),
  studentsOf: gid => DB.students.filter(s => s.groupId === gid && s.active !== false),
  studentsIn: gids => DB.students.filter(s => gids.includes(s.groupId) && s.active !== false),
  sessionsOf: gids => DB.sessions.filter(s => gids.includes(s.groupId)),
  me: () => Q.student(App.user.studentId),
  isUpcoming: s => s.date > todayStr() || (s.date === todayStr() && s.end > nowHM()),
  state(s) {
    const t = todayStr(), n = nowHM();
    if (s.date < t || (s.date === t && s.end <= n)) return { key: 'selesai', label: 'Selesai', tone: 'neutral' };
    if (s.date === t && s.start <= n) return { key: 'live', label: 'Berlangsung', tone: 'danger' };
    if (s.date === t) return { key: 'today', label: 'Hari ini', tone: 'accent' };
    return { key: 'soon', label: relDay(s.date), tone: 'primary' };
  },
  nextSession: gids => Q.sessionsOf(gids).find(Q.isUpcoming),
  todaySessions: gids => Q.sessionsOf(gids).filter(s => s.date === todayStr()),
  attOf: sid => DB.attendance[sid] || (DB.attendance[sid] = {}),
  attStats(studentId) {
    const rec = DB.attendance[studentId];
    const st = Q.student(studentId);
    const c = { hadir: 0, terlambat: 0, izin: 0, alpa: 0 };
    if (rec && Object.keys(rec).length) {
      Object.entries(rec).forEach(([sid, r]) => { const s = Q.session(sid); if (s && s.date <= todayStr()) c[r.status]++; });
    } else if (st.att != null) {
      const total = 24, present = Math.round(st.att / 100 * total);
      c.terlambat = Math.min(2, present); c.hadir = present - c.terlambat;
      c.izin = Math.min(1, total - present); c.alpa = total - present - c.izin;
    }
    const total = c.hadir + c.terlambat + c.izin + c.alpa;
    return { ...c, total, pct: total ? Math.round((c.hadir + c.terlambat) / total * 100) : 0, score: attScore(c) };
  },
  myTasks: sid => { const s = Q.student(sid || App.user.studentId || 'p1'); return DB.assignments.filter(a => a.my && a.groupIds.includes(s.groupId)); },
  taskAvg(studentId) {
    if (studentId === 'p1') { const g = Q.myTasks('p1').filter(a => a.my.status === 'dinilai'); return g.length ? avg(g.map(a => a.my.score)) : 0; }
    return Q.student(studentId).avg;
  },
  lastTO(studentId) {
    if (studentId === 'p1') return Q.toAvg(DB.tryouts[DB.tryouts.length - 1]);
    const h = Q.student(studentId).toHist; return h[h.length - 1];
  },
  toAvg: t => avg(Object.values(t.scores)),

  /* --- Hak akses & cakupan data --- */
  canPlace: () => App.has('kurikulum'),            // Kurikulum & Administrator: ubah penempatan pelajar, tutor, Wali Kelas
  seeAll: () => App.has('kurikulum', 'ketua'),     // Kurikulum, Ketua BAT, Administrator melihat seluruh data
  waliGroupIds: () => App.isAdmin ? DB.groups.map(g => g.id) : DB.groups.filter(g => g.wali === App.user.name).map(g => g.id),
  teachGroupIds: () => [...new Set(DB.sessions.filter(s => s.tutor === App.user.name).map(s => s.groupId))],
  myGroups() {
    if (Q.seeAll()) return DB.groups;
    const ids = new Set([...(App.has('wali') ? Q.waliGroupIds() : []), ...(App.has('tutor') ? Q.teachGroupIds() : [])]);
    return DB.groups.filter(g => ids.has(g.id));
  },
  myGroupIds: () => Q.myGroups().map(g => g.id),
  scopeSessions() {
    if (Q.seeAll()) return DB.sessions;
    const w = App.has('wali') ? Q.waliGroupIds() : [];
    return DB.sessions.filter(s => s.tutor === App.user.name || w.includes(s.groupId));
  },
  scopeStudents: () => Q.seeAll() ? Q.activeStudents() : Q.studentsIn(Q.myGroupIds()),
  teachesGroup: g => DB.sessions.some(s => s.groupId === g.id && s.tutor === App.user.name),
  canRunSession: s => App.has('kurikulum') || s.tutor === App.user.name,
  subjectsOfGroup(gid) { const ids = new Set(DB.sessions.filter(s => s.groupId === gid).map(s => s.subjectId)); return DB.subjects.filter(s => ids.has(s.id)); },
  groupsOfSubject(sid) { const ids = new Set(DB.sessions.filter(s => s.subjectId === sid).map(s => s.groupId)); return DB.groups.filter(g => ids.has(g.id)); },
  tutorsOf: (gid, sid) => [...new Set(DB.sessions.filter(s => s.groupId === gid && s.subjectId === sid).map(s => s.tutor))],
  /* Tutor pengampu dideklarasikan di Mata Pelajaran (staff.subjects) */
  tutorsOfSubject: sid => Q.tutors().filter(t => t.subjects.includes(sid)).map(t => t.name),
  mySubjects() {
    if (Q.seeAll()) return DB.subjects;
    const ids = new Set();
    if (App.has('tutor')) {
      const me = Q.staffByName(App.user.name);
      (me ? me.subjects : []).forEach(i => ids.add(i));
      DB.sessions.filter(s => s.tutor === App.user.name).forEach(s => ids.add(s.subjectId));
    }
    if (App.has('wali')) Q.waliGroupIds().forEach(g => Q.subjectsOfGroup(g).forEach(s => ids.add(s.id)));
    return DB.subjects.filter(s => ids.has(s.id));
  },
  myAssignments() {
    if (Q.seeAll()) return DB.assignments;
    const sub = Q.mySubjects().map(s => s.id), tg = Q.teachGroupIds(), wg = App.has('wali') ? Q.waliGroupIds() : [];
    return DB.assignments.filter(a => (App.has('tutor') && sub.includes(a.subjectId) && a.groupIds.some(x => tg.includes(x))) || a.groupIds.some(x => wg.includes(x)));
  },
  announcementsFor: gids => DB.announcements.filter(a => a.scope === 'umum' || gids.includes(a.groupId)).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.date.localeCompare(a.date)),
  waliOf: st => (Q.grp(st.groupId) || {}).wali || '-',
  assignTotal: a => Q.studentsIn(a.groupIds).length,
};

/* Skor presensi: Hadir = 1, Terlambat = 0,5, Tidak hadir = 0.
   Izin yang disetujui tidak dihitung (dikeluarkan dari pembagi). Hasil skala 0–100. */
const ATT_POINT = { hadir: 1, terlambat: 0.5, alpa: 0 };
const attScore = c => { const base = c.hadir + c.terlambat + c.alpa; return base ? Math.round((c.hadir + 0.5 * c.terlambat) / base * 100) : 0; };
const fmtPoint = st => st in ATT_POINT ? String(ATT_POINT[st]).replace('.', ',') : '—';

/* ---------- Lokasi presensi ---------- */
/* Titik lokasi sesi: dicocokkan dari nama tempat sesi; fallback ke titik pertama */
const placeOf = s => DB.places.find(p => s.location.toLowerCase().includes(p.match.toLowerCase())) || DB.places[0];
/* Jarak dua koordinat (meter), rumus haversine */
function distanceM(a, b) {
  const R = 6371000, rad = x => x * Math.PI / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

/* Rekap presensi per sesi (dummy deterministik) */
const _recap = {};
/* Rekap dasar (dummy deterministik) untuk sesi lampau yang belum punya data presensi riil */
function baseRecap(s) {
  if (_recap[s.id]) return _recap[s.id];
  const n = Q.studentsOf(s.groupId).length;
  let h = hashStr(s.id + 'r');
  const r = () => { h = (Math.imul(h, 1103515245) + 12345) >>> 0; return h / 4294967296; };
  const alpa = Math.floor(r() * 1.6), izin = Math.floor(r() * 2.2), terlambat = Math.floor(r() * 3);
  const hadir = Math.max(0, n - alpa - izin - terlambat);
  return (_recap[s.id] = { hadir, terlambat, izin, alpa, total: n, pct: n ? Math.round((hadir + terlambat) / n * 100) : 0 });
}

/* Rekap presensi per sesi: memakai data presensi riil (room dibuka/ditutup atau ada edit), selain itu rekap dasar */
function sessionRecap(s) {
  const rm = DB.rooms[s.id];
  if (typeof Room !== 'undefined' && (DB.attEdits[s.id] || (rm && (rm.open || rm.closed)))) {
    const t = Room.tally(Room.roster(s));
    return { hadir: t.hadir, terlambat: t.terlambat, izin: t.izin, alpa: t.alpa, total: t.total, pct: t.total ? Math.round(t.present / t.total * 100) : 0 };
  }
  return baseRecap(s);
}

/* ---------- Penimpaan presensi: edit panitia, izin ditolak, izin kedaluwarsa ---------- */
function setAttOverride(sessionId, studentId, status, by, note, via) {
  const s = Q.session(sessionId);
  const old = (DB.attEdits[sessionId] || {})[studentId];
  const rec = (DB.attendance[studentId] || {})[sessionId];
  const time = ['hadir', 'terlambat'].includes(status) ? ((old && old.time) || (rec && rec.time) || s.start) : null;
  (DB.attEdits[sessionId] = DB.attEdits[sessionId] || {})[studentId] = { status, time, by, note, via: via || `Diedit oleh ${by}`, at: stamp() };
  if (DB.attendance[studentId]) DB.attendance[studentId][sessionId] = { status, time };
}

/* ---------- Perizinan: arsip & kedaluwarsa ---------- */
/* Pengajuan untuk sesi yang sudah lewat tidak lagi aktif (diarsipkan) */
const leaveEnded = l => { const s = Q.session(l.sessionId); return !s || Q.state(s).key === 'selesai'; };
/* Pengajuan yang belum ditindak sampai jam pelajaran selesai → kedaluwarsa, pelajar dianggap Tidak hadir */
function processLeaveExpiry() {
  DB.leaves.forEach(l => {
    if (!['wali', 'kurikulum'].includes(l.status) || !leaveEnded(l)) return;
    const st = Q.student(l.studentId);
    l.status = 'kedaluwarsa'; l.expiredAt = stamp();
    if (!st) return;
    setAttOverride(l.sessionId, l.studentId, 'alpa', 'Sistem', 'Izin tidak ditindak sampai jam pelajaran selesai', 'Izin tidak ditindak → tidak hadir');
    DB.audit.unshift({ who: 'Sistem', at: stamp(), what: `Izin ${st.name} kedaluwarsa (tidak ditindak sampai sesi selesai) → Tidak hadir` });
    if (st.id === 'p1') DB.notifications.pelajar.unshift({ title: 'Izin kedaluwarsa', text: 'Pengajuan izinmu tidak ditindak sampai sesi selesai, sehingga tercatat Tidak hadir.', at: stamp(), unread: true, icon: 'clipboard' });
  });
}

/* Kehadiran agregat sekumpulan sesi:
   Σ pelajar hadir (hadir + terlambat) seluruh sesi / Σ pelajar yang seharusnya hadir di sesi-sesi tsb */
function aggAttendance(sessions) {
  let present = 0, expected = 0;
  sessions.forEach(s => { const r = sessionRecap(s); present += r.hadir + r.terlambat; expected += r.total; });
  return { present, expected, sessions: sessions.length, pct: expected ? Math.round(present / expected * 100) : null };
}
/* Ringkasan kehadiran per hari untuk n hari terakhir (tidak termasuk hari ini) */
function dailyAttendance(sessions, n = 7) {
  return Array.from({ length: n }, (_, i) => {
    const date = DB.D(i - n);
    return { date, ...aggAttendance(sessions.filter(s => s.date === date)) };
  });
}

/* Cek bentrok jadwal: tutor atau kelompok yang sama pada waktu yang beririsan */
function findConflicts({ groupId, tutor, date, start, end, excludeId }) {
  if (!date || !start || !end || toMin(end) <= toMin(start)) return { tutor: [], group: [], sameDay: [] };
  const sameDay = DB.sessions.filter(s => s.date === date && s.id !== excludeId && (s.tutor === tutor || s.groupId === groupId));
  const overlap = s => toMin(s.start) < toMin(end) && toMin(start) < toMin(s.end);
  return {
    tutor: sameDay.filter(s => s.tutor === tutor && overlap(s)),
    group: sameDay.filter(s => s.groupId === groupId && overlap(s)),
    sameDay,
  };
}

/* ---------- Cleanup (timer, kamera) saat pindah halaman ---------- */
const Cleanup = {
  fns: [],
  add(f) { this.fns.push(f); },
  run() { this.fns.forEach(f => { try { f(); } catch (e) { /* abaikan */ } }); this.fns = []; },
};

/* ---------- Toast ---------- */
function toast(msg, type = 'success') {
  const map = { success: ['checkCircle', 't-success'], error: ['alert', 't-danger'], info: ['bell', 't-primary'], warning: ['alert', 't-warning'] };
  const [ic, tone] = map[type] || map.info;
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.innerHTML = `<span class="t-ic ${tone}">${icon(ic, 16)}</span><span>${msg}</span>`;
  $('#toast-root').appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 260); }, 3200);
}

/* ---------- Modal ---------- */
function openModal({ title, sub = '', body = '', footer = '', size = '', onMount }) {
  const root = $('#modal-root');
  root.innerHTML = `<div class="modal-backdrop"><div class="modal ${size}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <div class="modal-head"><div><h3>${title}</h3>${sub ? `<p class="muted">${sub}</p>` : ''}</div><button class="icon-btn" data-close aria-label="Tutup">${icon('x')}</button></div>
    <div class="modal-body">${body}</div>
    ${footer ? `<div class="modal-foot">${footer}</div>` : ''}
  </div></div>`;
  const bd = root.firstElementChild;
  bd.addEventListener('click', e => { if (e.target === bd || e.target.closest('[data-close]')) closeModal(); });
  requestAnimationFrame(() => bd.classList.add('show'));
  const m = bd.querySelector('.modal');
  if (onMount) onMount(m);
  const first = m.querySelector('input:not([type=hidden]):not([type=file]):not([type=checkbox]):not([type=radio]), select, textarea');
  if (first) setTimeout(() => first.focus(), 60);
  return m;
}
function closeModal(instant) {
  const bd = $('#modal-root .modal-backdrop');
  if (!bd) return;
  if (instant) { bd.remove(); return; }
  bd.classList.remove('show');
  setTimeout(() => bd.remove(), 200);
}
/* Tandai field tidak valid (dipakai semua form) */
function fieldErr(el, msg) {
  const f = el.closest('.field'); if (!f) return;
  f.classList.toggle('invalid', !!msg);
  const er = f.querySelector('.field-err'); if (er) er.textContent = msg || '';
}

/* ---------- Komponen kecil ---------- */
const statCard = (ic, val, label, tone = 'primary', sub = '') =>
  `<div class="stat"><div class="stat-ic t-${tone}">${icon(ic, 20)}</div><div class="stat-body"><div class="stat-val">${val}</div><div class="stat-label">${label}</div>${sub ? `<div class="stat-sub">${sub}</div>` : ''}</div></div>`;
const emptyState = (ic, title, text = '', action = '') =>
  `<div class="empty"><div class="empty-ic">${icon(ic, 24)}</div><b>${title}</b>${text ? `<p>${text}</p>` : ''}${action}</div>`;
const DAY_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function bindTabs(root) {
  $$('[data-tabs]', root).forEach(group => {
    group.addEventListener('click', e => {
      const t = e.target.closest('.tab[data-tab]');
      if (!t || !group.contains(t)) return;
      const scope = group.closest('[data-tab-scope]') || root;
      $$('.tab', group).forEach(x => x.classList.toggle('active', x === t));
      $$('.tab-pane', scope).forEach(p => p.classList.toggle('active', p.dataset.pane === t.dataset.tab));
      if (group.dataset.tabs) TabMemory[group.dataset.tabs] = t.dataset.tab;
    });
  });
}
/* Ingat tab terakhir per halaman agar tidak kembali ke tab pertama setelah aksi */
const TabMemory = {};
const tabCls = (key, id, first) => (TabMemory[key] ? TabMemory[key] === id : first) ? 'active' : '';

function bindDropzone(dz, onFile) {
  const input = dz.querySelector('input[type=file]');
  const set = f => { if (!f) return; dz.classList.add('has-file'); dz.querySelector('b').textContent = f.name; dz.querySelector('small').textContent = `${(f.size / 1024).toFixed(0)} KB · klik untuk mengganti`; onFile && onFile(f); };
  input.addEventListener('change', () => set(input.files[0]));
  ['dragenter', 'dragover'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add('drag'); }));
  ['dragleave', 'drop'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove('drag'); }));
  dz.addEventListener('drop', e => set(e.dataTransfer.files[0]));
}
const dropzone = (id, hint = 'PDF, JPG, PNG · maks. 10 MB') =>
  `<label class="dropzone" id="${id}">${icon('upload', 24)}<b>Klik atau seret berkas ke sini</b><small>${hint}</small><input type="file"></label>`;

/* ---------- Chart ---------- */
function donut(segs, { size = 150, stroke = 16, label = '', sub = '' } = {}) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const total = segs.reduce((a, s) => a + s.value, 0) || 1;
  let off = 0;
  const arcs = segs.filter(s => s.value > 0).map(s => {
    const len = s.value / total * c;
    const el = `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${s.color}" stroke-width="${stroke}" stroke-dasharray="${len.toFixed(2)} ${(c - len).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}"><title>${s.label}: ${s.value}</title></circle>`;
    off += len; return el;
  }).join('');
  return `<div class="donut" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform:rotate(-90deg)"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--surface-3)" stroke-width="${stroke}"/>${arcs}</svg><div class="donut-center"><b>${label}</b><span>${sub}</span></div></div>`;
}
const legend = segs => `<div class="legend">${segs.map(s => `<div style="--c:${s.color}"><i>${s.letter || ''}</i><span>${s.label}</span><b>${s.value}</b></div>`).join('')}</div>`;

let _chartId = 0;
function lineChart(data, { min = 0, max = 100, color = '#2f4d6a', h = 230, w = 640, steps = 4, suffix = '' } = {}) {
  const id = 'lg' + (++_chartId);
  const pad = { l: 40, r: 18, t: 18, b: 32 };
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const x = i => pad.l + (data.length === 1 ? iw / 2 : i * iw / (data.length - 1));
  const y = v => pad.t + ih - (v - min) / (max - min) * ih;
  let grid = '';
  for (let i = 0; i <= steps; i++) {
    const v = min + (max - min) * i / steps;
    grid += `<line class="grid-line" x1="${pad.l}" x2="${w - pad.r}" y1="${y(v)}" y2="${y(v)}"/><text x="${pad.l - 10}" y="${y(v) + 4}" text-anchor="end">${Math.round(v)}</text>`;
  }
  const pts = data.map((d, i) => [x(i), y(d.value)]);
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = `${line} L${pts[pts.length - 1][0]} ${pad.t + ih} L${pts[0][0]} ${pad.t + ih} Z`;
  const dots = data.map((d, i) => `<circle class="pt" cx="${pts[i][0]}" cy="${pts[i][1]}" r="4.5" fill="#ffffff" stroke="${color}" stroke-width="2.5"><title>${d.label}: ${d.value}${suffix}</title></circle>`).join('');
  const labels = data.map((d, i) => `<text x="${pts[i][0]}" y="${h - 8}" text-anchor="${data.length > 1 && i === 0 ? 'start' : data.length > 1 && i === data.length - 1 ? 'end' : 'middle'}">${d.label}</text>`).join('');
  const vals = data.map((d, i) => `<text x="${pts[i][0] + (i === 0 && data.length > 1 ? 4 : 0)}" y="${pts[i][1] - 12}" text-anchor="${data.length > 1 && i === 0 ? 'start' : data.length > 1 && i === data.length - 1 ? 'end' : 'middle'}" style="fill:var(--text-2);font-weight:700">${d.value}</text>`).join('');
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".14"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>${grid}<path d="${area}" fill="url(#${id})"/><path d="${line}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>${dots}${vals}${labels}</svg>`;
}
function barChart(data, { max, suffix = '' } = {}) {
  const m = max || Math.max(...data.map(d => d.value || 0), 1);
  // value null = tidak ada data (ditampilkan "—")
  return `<div class="bars">${data.map(d => {
    const txt = d.value == null ? '—' : d.value + suffix;
    return `<div class="bar" title="${esc(d.title || d.label)}: ${txt}"><div class="bar-col" style="height:${d.value == null ? 0 : Math.max(3, d.value / m * 100)}%;--c:${d.value == null ? 'var(--surface-3)' : d.color || 'var(--primary)'}"><em>${txt}</em></div><span>${esc(d.label)}</span></div>`;
  }).join('')}</div>`;
}

/* ---------- Lini masa izin ---------- */
function leaveTimeline(l) {
  const st = Q.student(l.studentId), s = Q.session(l.sessionId);
  const wali = s ? Q.grp(s.groupId).wali : '-';
  const items = [{ cls: 'done', title: 'Pengajuan dikirim', meta: `${st.name} · ${fmtStamp(l.createdAt)}${l.file ? ' · lampiran: ' + esc(l.file) : ''}` }];
  const alpa = meta => ({ cls: 'rejected', title: 'Status presensi: Tidak hadir', meta });
  if (l.status === 'wali') {
    items.push({ cls: 'current', title: 'Keputusan Wali Kelas (terima / tolak)', meta: `Menunggu ${wali}` });
    items.push({ cls: '', title: 'Keputusan Kurikulum', meta: 'Hanya bila diterima Wali Kelas' });
  } else if (l.status === 'kedaluwarsa' && !l.waliBy) {
    items.push({ cls: 'rejected', title: 'Tidak ditindak Wali Kelas', meta: `Sesi selesai tanpa keputusan · ${fmtStamp(l.expiredAt)}` });
    items.push(alpa('Otomatis'));
  } else {
    const waliNo = l.waliDecision === 'ditolak';
    items.push({ cls: waliNo ? 'rejected' : 'done', title: waliNo ? 'Ditolak Wali Kelas' : 'Diterima Wali Kelas', meta: `${l.waliBy} · ${fmtStamp(l.waliAt)}`, note: l.waliNote });
    if (waliNo) items.push(alpa('Otomatis (izin ditolak Wali Kelas)'));
    else if (l.status === 'kurikulum') items.push({ cls: 'current', title: 'Keputusan Kurikulum', meta: 'Sedang ditinjau' });
    else if (l.status === 'kedaluwarsa') { items.push({ cls: 'rejected', title: 'Tidak diputuskan Kurikulum', meta: `Sesi selesai tanpa keputusan · ${fmtStamp(l.expiredAt)}` }); items.push(alpa('Otomatis')); }
    else {
      const ok = l.status === 'disetujui';
      items.push({ cls: ok ? 'done' : 'rejected', title: ok ? 'Disetujui Kurikulum' : 'Ditolak Kurikulum', meta: `${l.decisionBy} · ${fmtStamp(l.decisionAt)}`, note: l.decisionNote });
      items.push(ok ? { cls: 'done', title: 'Status presensi diperbarui', meta: 'Otomatis menjadi “Izin”' } : alpa('Otomatis (izin ditolak Kurikulum)'));
    }
  }
  return `<div class="timeline">${items.map(i => `<div class="tl ${i.cls}"><b>${i.title}</b><span>${i.meta}</span>${i.note ? `<p class="tl-note">“${esc(i.note)}”</p>` : ''}</div>`).join('')}</div>`;
}

/* ---------- Pengumuman ---------- */
const annItem = a => {
  const g = a.groupId ? Q.grp(a.groupId) : null;
  return `<div class="ann"><div class="ann-top">${a.pinned ? badge('Disematkan', 'accent') : ''}${g ? tag(g) : badge('Umum', 'primary', 'no-dot')}<span class="muted small">${relDay(a.date)} · ${esc(a.by)}</span></div><b>${esc(a.title)}</b><p>${esc(a.body)}</p></div>`;
};

/* ---------- Ringkasan kehadiran (donut + legenda) ---------- */
function attSummary(st, size = 150) {
  const segs = [
    { label: 'Hadir', letter: 'H', value: st.hadir, color: ATT.hadir.color },
    { label: 'Terlambat', letter: 'T', value: st.terlambat, color: ATT.terlambat.color },
    { label: 'Izin', letter: 'I', value: st.izin, color: ATT.izin.color },
    { label: 'Tidak hadir', letter: 'A', value: st.alpa, color: ATT.alpa.color },
  ];
  return `<div class="donut-wrap">${donut(segs, { size, label: st.pct + '%', sub: 'kehadiran' })}${legend(segs)}</div>`;
}

/* Tautan ke Room Pertemuan asal materi/tugas */
const meetLink = sid => { const s = sid && Q.session(sid); return s ? ` · <a href="#/sesi/${s.id}" style="color:var(--primary);font-weight:700">Pertemuan ${fmtShort(s.date)}</a>` : ''; };

/* Baris sesi ringkas (dipakai di banyak halaman) */
const sessRow = (s, opts = {}) => {
  const st = Q.state(s), sb = Q.subj(s.subjectId), g = Q.grp(s.groupId);
  // Setiap sesi = Room Pertemuan; sesi lampau terbuka sebagai arsip
  return `<a class="item clickable" href="#/sesi/${s.id}"><div class="item-ic" style="--c:${sb.color}">${icon('calendar', 18)}</div><div class="item-body"><div class="item-title">${esc(s.topic)}</div><div class="item-sub">${opts.showGroup ? esc(g.name) + ' · ' : ''}${esc(sb.code)} · ${fmtDay(s.date)} · ${s.start}–${s.end} · ${esc(s.tutor)}</div></div><div class="item-side">${s.changed ? badge('Berubah', 'warning') : ''}${badge(st.key === 'selesai' ? 'Arsip' : st.label, st.tone)}</div></a>`;
};

/* ---------- Modal koreksi presensi (pelajar) ---------- */
function openCorrection(sessionId) {
  const s = Q.session(sessionId), sb = Q.subj(s.subjectId), me = Q.me();
  const r = Q.attOf(me.id)[sessionId];
  openModal({
    title: 'Ajukan koreksi presensi',
    sub: `${sb.code} · ${s.topic} · ${fmtDay(s.date)}`,
    body: `
      <div class="alert alert-info">${icon('alert', 16)}<span>Status tercatat saat ini: <b>${r ? ATT[r.status].label : 'Belum presensi'}</b>${r && r.time ? ` (${r.time} WIB)` : ''}. Koreksi akan diproses tutor sesi atau Kurikulum.</span></div>
      <label class="field"><span>Jenis kendala</span><select id="k-type"><option>Lupa presensi</option><option>Kendala GPS / lokasi</option><option>Kesalahan pencatatan</option></select></label>
      <label class="field"><span>Keterangan</span><textarea id="k-note" placeholder="Ceritakan singkat kendala yang kamu alami…"></textarea><small class="field-err"></small></label>
      <div class="field"><span>Bukti pendukung (opsional)</span>${dropzone('k-file', 'Foto / tangkapan layar')}</div>`,
    footer: `<button class="btn btn-ghost" data-close>Batal</button><button class="btn btn-primary" id="k-send">${icon('send', 16)} Kirim koreksi</button>`,
    onMount(m) {
      bindDropzone($('#k-file', m));
      $('#k-send', m).addEventListener('click', () => {
        const note = $('#k-note', m).value.trim();
        if (note.length < 8) return fieldErr($('#k-note', m), 'Keterangan minimal 8 karakter.');
        DB.corrections.unshift({ id: 'k' + Date.now(), studentId: me.id, sessionId, type: $('#k-type', m).value, note, at: stamp(), status: 'pending' });
        closeModal(); toast('Pengajuan koreksi terkirim ke panitia.'); App.refresh();
      });
    },
  });
}

/* =========================================================
   HALAMAN BERSAMA (Pelajar & Panitia)
   ========================================================= */
const Shared = {};

/* ---------- Detail Kelompok Kelas (tab Informasi · Anggota · Jadwal · Presensi) ---------- */
Shared.groupDetail = (id, isPanitia, opts = {}) => {
  const g = Q.grp(id);
  if (!g) return `<div class="card">${emptyState('layers', 'Kelompok Kelas tidak ditemukan', '', `<a class="btn btn-ghost" href="#/kelas">Kembali</a>`)}</div>`;
  const members = Q.studentsOf(g.id);
  const sess = Q.sessionsOf([g.id]);
  const upcoming = sess.filter(Q.isUpcoming);
  const past = sess.filter(s => !Q.isUpcoming(s)).reverse();
  const subs = Q.subjectsOfGroup(g.id);
  const anns = DB.announcements.filter(a => a.groupId === g.id);
  const canPlace = isPanitia && Q.canPlace();
  const canPost = isPanitia && (App.has('kurikulum') || Q.teachesGroup(g) || g.wali === App.user.name);
  const me = !isPanitia ? Q.me() : null;
  const rec = me ? Q.attOf(me.id) : {};
  const todaySess = sess.filter(s => s.date === todayStr() && Q.state(s).key !== 'selesai');
  const groupAtt = aggAttendance(past.filter(s => s.date < todayStr()));
  const attPct = isPanitia ? (groupAtt.pct ?? 0) : Q.attStats(me.id).pct;
  const next7 = sess.filter(s => dayDiff(s.date) >= 0 && dayDiff(s.date) < 7).length;
  const next = upcoming[0];

  return `
  <div class="class-hero" style="--c:${g.color}">
    ${isPanitia && opts.solo ? `<span class="back">${icon('layers', 16)} Kelompok Kelas dampinganmu</span>` : isPanitia ? `<a class="back" href="#/kelas">${icon('left', 16)} Semua Kelompok Kelas</a>` : `<span class="back">${icon('layers', 16)} Kelompok Kelas-mu</span>`}
    <h1>${esc(g.name)}</h1>
    <p>Wali Kelas <b>${esc(g.wali)}</b> · ${members.length} pelajar · ${subs.length} mata pelajaran</p>
    <div class="hero-actions">
      ${!isPanitia && todaySess.length ? `<a class="btn btn-primary" href="#/sesi/${todaySess[0].id}">${icon('arrowRight', 16)} Masuk Kelas hari ini</a>` : ''}
      ${canPlace ? `<button class="btn btn-ghost" data-act="edit-group" data-id="${g.id}">${icon('edit', 16)} Ubah kelompok</button><button class="btn btn-ghost" data-act="add-member" data-id="${g.id}">${icon('userPlus', 16)} Tambah anggota</button>` : ''}
      ${canPost ? `<button class="btn btn-ghost" data-act="announce" data-id="${g.id}">${icon('megaphone', 16)} Buat pengumuman</button>` : ''}
    </div>
  </div>

  <div data-tab-scope>
    <div class="tabs" data-tabs="grp">
      <button class="tab ${tabCls('grp', 'info', true)}" data-tab="info">${icon('book', 16)} Informasi</button>
      <button class="tab ${tabCls('grp', 'anggota')}" data-tab="anggota">${icon('users', 16)} Anggota <span class="muted">${members.length}</span></button>
      <button class="tab ${tabCls('grp', 'jadwal')}" data-tab="jadwal">${icon('calendar', 16)} Jadwal</button>
    </div>

    <div class="tab-pane ${tabCls('grp', 'info', true)}" data-pane="info">
      <div class="stats">
        ${statCard('users', members.length, 'Pelajar', 'primary')}
        ${statCard('book', subs.length, 'Mata Pelajaran', 'info')}
        ${statCard('calendar', next7, 'Sesi 7 hari ke depan', 'accent')}
        ${statCard('checkCircle', attPct + '%', isPanitia ? 'Rata-rata kehadiran' : 'Kehadiranmu', 'success')}
      </div>
      <div class="cols cols-1-1">
        <div class="card">
          <div class="card-head"><h3>Ringkasan</h3></div>
          <p class="muted" style="margin-bottom:8px">${esc(g.desc)}</p>
          <div class="kv">
            <div><span>Wali Kelas</span><b>${esc(g.wali)}</b></div>
            <div><span>Jumlah pelajar</span><b>${members.length} pelajar</b></div>
            <div><span>Mata Pelajaran</span><b>${subs.length ? subs.map(stag).join(' ') : '—'}</b></div>
            ${isPanitia ? `<div><span>Kehadiran kelompok</span><b>${groupAtt.pct == null ? '—' : `${groupAtt.pct}% <span class="muted small">(${groupAtt.present}/${groupAtt.expected} kehadiran dari ${groupAtt.sessions} sesi)</span>`}</b></div>` : ''}
            <div><span>Sesi berikutnya</span><b>${next ? `${fmtDay(next.date)}, ${next.start} · ${esc(Q.subj(next.subjectId).code)}` : '—'}</b></div>
          </div>
        </div>
        <div class="card">
          <div class="card-head"><h3>Mata Pelajaran & Tutor</h3><span class="muted small">${subs.length} mapel</span></div>
          <div class="list">${subs.map(sb => {
            const n = sess.filter(s => s.subjectId === sb.id).length;
            return `<div class="item"><div class="item-ic code-ic" style="--c:${sb.color}">${esc(sb.code)}</div><div class="item-body"><div class="item-title">${esc(sb.name)}</div><div class="item-sub">${Q.tutorsOf(g.id, sb.id).map(esc).join(', ')} · ${n} sesi</div></div>${sb.active ? '' : badge('Nonaktif', 'neutral')}</div>`;
          }).join('') || emptyState('book', 'Belum ada mata pelajaran', 'Mapel muncul setelah Kurikulum menambahkan jadwal sesi.')}</div>
        </div>
      </div>
      <div class="card mt">
        <div class="card-head"><h3>${icon('megaphone', 16)} Pengumuman kelompok</h3></div>
        ${anns.length ? anns.map(annItem).join('') : emptyState('megaphone', 'Belum ada pengumuman')}
      </div>
    </div>

    <div class="tab-pane ${tabCls('grp', 'anggota')}" data-pane="anggota">
      <div class="card">
        <div class="card-head"><h3>Wali Kelas</h3></div>
        <div class="item">${avatar(g.wali)}<div class="item-body"><div class="item-title">${esc(g.wali)}</div><div class="item-sub">Pendamping Kelompok Kelas ${esc(g.name)}</div></div>${badge('Wali Kelas', 'accent', 'no-dot')}</div>
        <div class="divider"></div>
        <div class="card-head"><h3>Pelajar (${members.length})</h3>${canPlace ? `<button class="btn btn-sm btn-ghost" data-act="add-member" data-id="${g.id}">${icon('userPlus', 14)} Tambah</button>` : ''}</div>
        ${canPlace ? `<div class="note primary" style="margin:0 0 10px">${icon('alert', 15)}<span>Satu pelajar hanya terdaftar di satu Kelompok Kelas. Gunakan <b>Pindahkan</b> untuk menempatkan pelajar di kelompok lain.</span></div>` : ''}
        <div class="list">
          ${members.map(s => `<div class="item">${avatar(s.name)}<div class="item-body"><div class="item-title">${esc(s.name)}${me && s.id === me.id ? ' <span class="muted">(kamu)</span>' : ''}</div><div class="item-sub">${esc(s.school)} · ${s.status}</div></div>
            ${isPanitia ? `<div class="item-side member-side"><div class="member-att">${progRow(Q.attStats(s.id).pct, toneByPct(Q.attStats(s.id).pct))}</div>${canPlace ? `<button class="btn btn-sm btn-ghost" data-act="move" data-id="${s.id}">${icon('swap', 14)} Pindahkan</button>` : ''}</div>` : ''}</div>`).join('') || emptyState('users', 'Belum ada pelajar', canPlace ? 'Tambahkan pelajar ke kelompok ini.' : '')}
        </div>
      </div>
    </div>

    <div class="tab-pane ${tabCls('grp', 'jadwal')}" data-pane="jadwal">
      <div class="cols cols-1-1">
        <div class="card"><div class="card-head"><h3>Sesi mendatang</h3><a class="link" href="#/jadwal">Kalender ${icon('right', 14)}</a></div><div class="list">${upcoming.slice(0, 8).map(s => sessRow(s)).join('') || emptyState('calendar', 'Tidak ada sesi mendatang')}</div></div>
        <div class="card"><div class="card-head"><h3>Sesi yang telah berlalu</h3><span class="muted small">${past.length} sesi</span></div><div class="list">${past.slice(0, 8).map(s => sessRow(s)).join('') || emptyState('calendar', 'Belum ada sesi')}</div></div>
      </div>
    </div>

  </div>`;
};

/* Aksi pada detail kelompok (dipasang oleh halaman) */
Shared.bindGroupActions = root => {
  bindTabs(root);
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const { act, id } = b.dataset;
    if (act === 'edit-group') Shared.groupForm(id);
    if (act === 'new-group') Shared.groupForm(null);
    if (act === 'add-member') Shared.addMembersModal(id);
    if (act === 'move') Shared.moveStudentModal(id);
    if (act === 'announce') Shared.announceModal(id);
  });
};

/* ---------- Form tambah/ubah Kelompok Kelas (Kurikulum & Administrator) ---------- */
const GROUP_COLORS = ['#3b4f9c', '#0f6f7d', '#a85a0c', '#a0336b', '#17734a', '#1f5f99', '#5f6d16', '#8a4a2b'];
Shared.groupForm = id => {
  const g = id ? Q.grp(id) : null;
  // 1 Wali Kelas = 1 Kelompok Kelas: hanya wali yang belum mendampingi kelompok lain yang bisa dipilih
  const walis = Q.walis().filter(w => !DB.groups.some(x => x !== g && x.wali === w.name));
  const load = name => DB.groups.filter(x => x.wali === name).length;
  openModal({
    title: g ? 'Ubah Kelompok Kelas' : 'Tambah Kelompok Kelas',
    sub: 'Setiap Kelompok Kelas memiliki tepat satu Wali Kelas.',
    body: `<div class="form-grid">
      <label class="field"><span>Nama Kelompok Kelas</span><input id="gf-name" value="${g ? esc(g.name) : ''}" placeholder="cth. Saintek C"><small class="field-err"></small></label>
      <label class="field"><span>Wali Kelas</span><select id="gf-wali">${walis.map(w => `<option value="${esc(w.name)}" ${g && g.wali === w.name ? 'selected' : ''}>${esc(w.name)}</option>`).join('')}</select></label>
      <label class="field"><span>Deskripsi singkat</span><textarea id="gf-desc" maxlength="200" placeholder="Fokus dan sasaran kelompok…">${g ? esc(g.desc) : ''}</textarea></label>
    </div>
    <div class="note info">${icon('shield', 15)}<span>Pilihan Wali Kelas hanya berisi panitia berperan Wali Kelas. Tutor tidak dapat merangkap Wali Kelas. Satu Wali Kelas hanya mendampingi satu kelompok, sehingga hanya wali yang belum memegang kelompok yang tampil.</span></div>`,
    footer: `<button class="btn btn-ghost" data-close>Batal</button><button class="btn btn-primary" id="gf-save">${icon('check', 16)} ${g ? 'Simpan perubahan' : 'Simpan kelompok'}</button>`,
    onMount(m) {
      $('#gf-save', m).addEventListener('click', () => {
        const name = $('#gf-name', m).value.trim();
        const dup = DB.groups.some(x => x !== g && x.name.toLowerCase() === name.toLowerCase());
        fieldErr($('#gf-name', m), !name ? 'Nama kelompok wajib diisi.' : dup ? 'Nama kelompok sudah dipakai.' : '');
        if (!name || dup) return;
        if (!$('#gf-wali', m).value) return toast('Belum ada Wali Kelas yang tersedia. Tambahkan akun Wali Kelas di Pengguna & Peran.', 'error');
        const data = { name, wali: $('#gf-wali', m).value, desc: $('#gf-desc', m).value.trim() || 'Belum ada deskripsi.' };
        if (g) {
          const waliChanged = g.wali !== data.wali;
          Object.assign(g, data);
          DB.activity.unshift({ who: App.user.name, what: 'mengubah Kelompok Kelas', obj: name, at: stamp(), icon: 'layers' });
          closeModal(); toast(waliChanged ? `Kelompok diperbarui. Wali Kelas kini ${esc(data.wali)}.` : 'Kelompok Kelas diperbarui.'); App.refresh();
        } else {
          const ng = { id: 'g' + Date.now(), color: GROUP_COLORS[DB.groups.length % GROUP_COLORS.length], ...data };
          DB.groups.push(ng);
          DB.activity.unshift({ who: App.user.name, what: 'membuat Kelompok Kelas', obj: name, at: stamp(), icon: 'layers' });
          closeModal(); toast(`Kelompok “${esc(name)}” dibuat. Tambahkan anggota dan jadwalnya.`); location.hash = '#/kelas/' + ng.id;
        }
      });
    },
  });
};

/* ---------- Pindahkan satu pelajar ke kelompok lain ---------- */
Shared.moveStudentModal = sid => {
  const s = Q.student(sid), cur = Q.grp(s.groupId);
  const others = DB.groups.filter(g => g.id !== s.groupId);
  openModal({
    title: 'Pindahkan pelajar', sub: s.name,
    body: `<div class="kv">
        <div><span>Kelompok saat ini</span><b>${tag(cur)}</b></div>
        <div><span>Wali Kelas saat ini</span><b>${esc(cur.wali)}</b></div>
      </div>
      <label class="field"><span>Pindahkan ke Kelompok Kelas</span><select id="mv-to">${others.map(g => `<option value="${g.id}">${esc(g.name)} — Wali: ${esc(g.wali)} · ${Q.studentsOf(g.id).length} pelajar</option>`).join('')}</select></label>
      <label class="field"><span>Alasan pemindahan (opsional)</span><textarea id="mv-note" placeholder="cth. Menyesuaikan jalur Saintek/Soshum…" style="min-height:70px"></textarea></label>
      <div class="note primary">${icon('alert', 15)}<span>Pelajar hanya terdaftar di satu Kelompok Kelas. Setelah dipindah, jadwal, tugas, dan Wali Kelas mengikuti kelompok baru. Riwayat presensi lama tetap tersimpan.</span></div>`,
    footer: `<button class="btn btn-ghost" data-close>Batal</button><button class="btn btn-primary" id="mv-save">${icon('swap', 16)} Pindahkan</button>`,
    onMount(m) {
      $('#mv-save', m).addEventListener('click', () => {
        const to = Q.grp($('#mv-to', m).value);
        s.groupId = to.id;
        DB.audit.unshift({ who: App.user.name, at: stamp(), what: `Memindahkan ${s.name}: ${cur.name} → ${to.name}` });
        DB.activity.unshift({ who: App.user.name, what: 'memindahkan pelajar ke', obj: to.name, at: stamp(), icon: 'users' });
        closeModal(); toast(`${esc(s.name)} dipindahkan ke ${esc(to.name)}.`); App.refresh();
      });
    },
  });
};

/* ---------- Tambah anggota: pelajar dari kelompok lain dipindah ke kelompok ini ---------- */
Shared.addMembersModal = gid => {
  const g = Q.grp(gid);
  const list = Q.activeStudents().filter(s => s.groupId !== gid);
  openModal({
    title: 'Tambah anggota', sub: `Kelompok Kelas ${g.name}`,
    body: `<div class="note primary" style="margin:0">${icon('alert', 15)}<span>Pelajar yang dipilih akan <b>dipindahkan</b> dari kelompoknya saat ini, karena satu pelajar hanya boleh di satu Kelompok Kelas.</span></div>
      <div class="search">${icon('search', 16)}<input class="input" id="am-q" placeholder="Cari pelajar…"></div>
      <div class="list" id="am-list" style="max-height:340px;overflow:auto">${list.map(s => `<label class="item clickable" data-name="${esc(s.name.toLowerCase())}"><input type="checkbox" value="${s.id}" style="accent-color:var(--primary);width:18px;height:18px;flex-shrink:0">${avatar(s.name, 'sm')}<div class="item-body"><div class="item-title">${esc(s.name)}</div><div class="item-sub">${esc(s.school)}</div></div><div class="item-side">${tag(Q.grp(s.groupId))}</div></label>`).join('') || emptyState('users', 'Semua pelajar sudah ada di kelompok ini')}</div>`,
    footer: `<button class="btn btn-ghost" data-close>Batal</button><button class="btn btn-primary" id="am-save">${icon('userPlus', 16)} Tambahkan</button>`,
    onMount(m) {
      $('#am-q', m).addEventListener('input', e => { const q = e.target.value.toLowerCase(); $$('#am-list .item', m).forEach(i => i.classList.toggle('hidden', !i.dataset.name.includes(q))); });
      $('#am-save', m).addEventListener('click', () => {
        const picked = $$('#am-list input:checked', m).map(i => Q.student(i.value));
        if (!picked.length) return toast('Pilih minimal satu pelajar.', 'error');
        picked.forEach(s => { DB.audit.unshift({ who: App.user.name, at: stamp(), what: `Memindahkan ${s.name}: ${Q.grp(s.groupId).name} → ${g.name}` }); s.groupId = gid; });
        closeModal(); toast(`${picked.length} pelajar ditambahkan ke ${esc(g.name)}.`); App.refresh();
      });
    },
  });
};

Shared.announceModal = gid => {
  const g = gid ? Q.grp(gid) : null;
  openModal({
    title: 'Buat pengumuman', sub: g ? `Pengumuman untuk Kelompok Kelas ${g.name}` : 'Pengumuman',
    body: `${!g ? `<label class="field"><span>Cakupan</span><select id="an-scope">${App.has('kurikulum', 'ketua') ? '<option value="umum">Umum (seluruh komunitas BAT)</option>' : ''}${Q.myGroups().map(k => `<option value="${k.id}">Kelompok Kelas ${esc(k.name)}</option>`).join('')}</select></label>` : ''}
      <label class="field"><span>Judul</span><input id="an-title" placeholder="Judul pengumuman"><small class="field-err"></small></label>
      <label class="field"><span>Isi</span><textarea id="an-body" placeholder="Tulis pengumuman…"></textarea></label>
      <label class="check"><input type="checkbox" id="an-notif" checked> Kirim notifikasi ke pelajar</label>`,
    footer: `<button class="btn btn-ghost" data-close>Batal</button><button class="btn btn-primary" id="an-save">${icon('send', 16)} Terbitkan</button>`,
    onMount(m) {
      $('#an-save', m).addEventListener('click', () => {
        const title = $('#an-title', m).value.trim();
        if (!title) return fieldErr($('#an-title', m), 'Judul wajib diisi.');
        const scopeVal = g ? g.id : $('#an-scope', m).value;
        DB.announcements.unshift({ id: 'n' + Date.now(), scope: scopeVal === 'umum' ? 'umum' : 'kelompok', groupId: scopeVal === 'umum' ? null : scopeVal, title, body: $('#an-body', m).value.trim() || '-', date: todayStr(), by: App.user.name });
        closeModal(); toast('Pengumuman diterbitkan.'); App.refresh();
      });
    },
  });
};

/* ---------- Jadwal / Manajemen Jadwal ---------- */
const JadwalState = { weekOffset: 0, sel: null, grp: 'all', subj: 'all', tutor: 'all' };
const mondayOf = offsetWeeks => { const d = parseYMD(todayStr()); const dow = (d.getDay() + 6) % 7; d.setDate(d.getDate() - dow + offsetWeeks * 7); return d; };

Shared.jadwal = isPanitia => ({
  title: isPanitia ? 'Manajemen Jadwal' : 'Jadwal',
  render() {
    const groups = isPanitia ? Q.myGroups() : [Q.grp(Q.me().groupId)];
    if (JadwalState.grp !== 'all' && !groups.find(g => g.id === JadwalState.grp)) JadwalState.grp = 'all';
    const gids = JadwalState.grp === 'all' ? groups.map(g => g.id) : [JadwalState.grp];
    const mon = mondayOf(JadwalState.weekOffset);
    const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(mon); d.setDate(d.getDate() + i); return DB.ymd(d); });
    if (!JadwalState.sel || !days.includes(JadwalState.sel)) JadwalState.sel = days.includes(todayStr()) ? todayStr() : days[0];
    const base = Q.sessionsOf(groups.map(g => g.id));
    const sess = base.filter(s => gids.includes(s.groupId) && (JadwalState.subj === 'all' || s.subjectId === JadwalState.subj) && (JadwalState.tutor === 'all' || s.tutor === JadwalState.tutor));
    const daySess = sess.filter(s => s.date === JadwalState.sel);
    const weekSess = sess.filter(s => days.includes(s.date));
    const changes = sess.filter(s => s.changed && Q.isUpcoming(s));
    const canEdit = isPanitia && Q.canPlace();
    const subjOpts = DB.subjects.filter(sb => base.some(s => s.subjectId === sb.id));
    const tutorOpts = [...new Set(base.map(s => s.tutor))].sort();
    const weekLabel = `${fmtDate(days[0], { day: 'numeric', month: 'short' })} – ${fmtDate(days[6], { day: 'numeric', month: 'short', year: 'numeric' })}`;
    // rekap minggu ini: per tutor (Kurikulum) atau per mapel (lainnya)
    const recapBy = canEdit ? 'tutor' : 'subjectId';
    const recap = Object.entries(weekSess.reduce((a, s) => { a[s[recapBy]] = (a[s[recapBy]] || 0) + 1; return a; }, {})).sort((a, b) => b[1] - a[1]);

    return `
    <div class="page-head">
      <div><h1>${isPanitia ? 'Manajemen Jadwal' : 'Jadwal'}</h1><p>${isPanitia ? 'Setiap sesi terdiri dari Kelompok Kelas, Mata Pelajaran, Tutor, waktu, dan tempat. Seluruh sesi dilaksanakan luring.' : 'Jadwal sesi Kelompok Kelas-mu lengkap dengan mata pelajaran, tutor, dan tempat.'}</p></div>
      ${canEdit ? `<div class="actions"><button class="btn btn-primary" data-act="add-sess">${icon('plus', 16)} Tambah sesi</button></div>` : ''}
    </div>
    ${isPanitia && !canEdit ? `<div class="alert alert-primary" style="margin-bottom:16px">${icon('shield', 16)}<span>Jadwal dan penempatan tutor disusun oleh Kurikulum. Hubungi Kurikulum bila perlu perubahan.</span></div>` : ''}
    ${isPanitia ? `<div class="toolbar">
      ${groups.length > 1 ? `<select id="jf-grp" aria-label="Filter Kelompok Kelas"><option value="all">Semua Kelompok Kelas</option>${groups.map(g => `<option value="${g.id}" ${JadwalState.grp === g.id ? 'selected' : ''}>${esc(g.name)}</option>`).join('')}</select>` : ''}
      <select id="jf-subj" aria-label="Filter Mata Pelajaran"><option value="all">Semua Mata Pelajaran</option>${subjOpts.map(sb => `<option value="${sb.id}" ${JadwalState.subj === sb.id ? 'selected' : ''}>${esc(sb.code)} · ${esc(sb.name)}</option>`).join('')}</select>
      ${tutorOpts.length > 1 ? `<select id="jf-tutor" aria-label="Filter Tutor"><option value="all">Semua Tutor</option>${tutorOpts.map(t => `<option ${JadwalState.tutor === t ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>` : ''}
    </div>` : ''}
    <div class="cols cols-2-1">
      <div class="card">
        <div class="week-nav">
          <button class="icon-btn" data-week="-1" aria-label="Minggu sebelumnya">${icon('left')}</button>
          <div style="text-align:center"><b>${weekLabel}</b>${JadwalState.weekOffset !== 0 ? `<div><button class="link small" style="color:var(--primary);font-weight:700" data-week="0">Kembali ke minggu ini</button></div>` : '<div class="muted small">Minggu ini</div>'}</div>
          <button class="icon-btn" data-week="1" aria-label="Minggu berikutnya">${icon('right')}</button>
        </div>
        <div class="week">
          ${days.map(d => {
            const ds = sess.filter(s => s.date === d);
            return `<button class="day ${d === JadwalState.sel ? 'active' : ''} ${d === todayStr() ? 'today' : ''} ${d < todayStr() ? 'past' : ''}" data-day="${d}"><small>${fmtDate(d, { weekday: 'short' })}</small><b>${parseYMD(d).getDate()}</b><span class="dots">${ds.slice(0, 4).map(s => `<i style="--c:${Q.subj(s.subjectId).color}"></i>`).join('')}</span></button>`;
          }).join('')}
        </div>
        <div class="card-head"><h3>${fmtDate(JadwalState.sel)}</h3>${badge(`${daySess.length} sesi`, 'neutral', 'no-dot')}</div>
        <div class="agenda">
          ${daySess.length ? daySess.map(s => {
            const g = Q.grp(s.groupId), sb = Q.subj(s.subjectId), st = Q.state(s);
            const mine = isPanitia && s.tutor === App.user.name;
            return `<div class="agenda-item ${st.key === 'selesai' ? 'is-past' : ''}" style="--c:${sb.color}">
              <div class="agenda-time"><b>${s.start}</b><span>${s.end}</span></div>
              <div class="agenda-card">
                <div class="agenda-top">${stag(sb)}${isPanitia ? tag(g) : ''}${badge(st.label, st.tone)}${s.changed ? badge('Jadwal berubah', 'warning') : ''}${mine ? badge('Sesi saya', 'primary', 'no-dot') : ''}</div>
                <h4>${esc(s.topic)}</h4>
                <div class="meta-row"><span>${icon('book', 14)} ${esc(sb.name)}</span><span>${icon('pin', 14)} ${esc(s.location)}</span><span>${icon('user', 14)} ${esc(s.tutor)}</span></div>
                ${s.changed ? `<div class="note warning">${icon('alert', 15)} <span>${esc(s.changed)}</span></div>` : ''}
                <div class="agenda-actions">
                  ${st.key === 'selesai' ? `<a class="btn btn-sm btn-ghost" href="#/sesi/${s.id}">${icon('history', 14)} Buka arsip pertemuan</a>`
                    : s.date === todayStr() ? `<a class="btn btn-sm btn-primary" href="#/sesi/${s.id}">${icon('arrowRight', 14)} Masuk Kelas</a>`
                    : `<a class="btn btn-sm btn-ghost" href="#/sesi/${s.id}">${icon('eye', 14)} Lihat room</a>`}
                  ${!isPanitia && st.key !== 'selesai' ? `<a class="btn btn-sm btn-ghost" href="#/izin">Ajukan izin</a>` : ''}
                  ${canEdit && st.key !== 'selesai' ? `<button class="btn btn-sm btn-ghost" data-edit="${s.id}">${icon('edit', 14)} Ubah sesi</button>` : ''}
                </div>
              </div>
            </div>`;
          }).join('') : emptyState('calendar', 'Tidak ada sesi', 'Tidak ada sesi pada hari ini. Pilih hari lain di atas.', canEdit ? `<button class="btn btn-sm btn-primary" data-act="add-sess">${icon('plus', 14)} Tambah sesi di tanggal ini</button>` : '')}
        </div>
      </div>
      <div>
        <div class="card">
          <div class="card-head"><h3>${icon('alert', 16)} Perubahan jadwal</h3></div>
          ${changes.length ? changes.map(s => `<div class="ann"><div class="ann-top">${stag(Q.subj(s.subjectId))}${tag(Q.grp(s.groupId))}<span class="muted small">${fmtDay(s.date)}, ${s.start}</span></div><b>${esc(s.topic)}</b><p>${esc(s.changed)}</p></div>`).join('') : emptyState('checkCircle', 'Tidak ada perubahan', 'Semua jadwal berjalan sesuai rencana.')}
        </div>
        <div class="card mt">
          <div class="card-head"><h3>${canEdit ? 'Beban tutor minggu ini' : 'Sesi minggu ini per mapel'}</h3>${badge(`${weekSess.length} sesi`, 'neutral', 'no-dot')}</div>
          <div class="list">${recap.map(([k, n]) => {
            if (recapBy === 'tutor') return `<div class="item">${avatar(k, 'sm')}<div class="item-body"><div class="item-title">${esc(k)}</div><div class="item-sub">${[...new Set(weekSess.filter(s => s.tutor === k).map(s => Q.subj(s.subjectId).code))].join(', ')}</div></div>${badge(n + ' sesi', 'primary', 'no-dot')}</div>`;
            const sb = Q.subj(k); return `<div class="item"><div class="item-ic code-ic" style="--c:${sb.color}">${esc(sb.code)}</div><div class="item-body"><div class="item-title">${esc(sb.name)}</div></div>${badge(n + ' sesi', 'primary', 'no-dot')}</div>`;
          }).join('') || emptyState('calendar', 'Belum ada sesi minggu ini')}</div>
        </div>
      </div>
    </div>`;
  },
  mount(root) {
    root.addEventListener('change', e => {
      const map = { 'jf-grp': 'grp', 'jf-subj': 'subj', 'jf-tutor': 'tutor' };
      if (map[e.target.id]) { JadwalState[map[e.target.id]] = e.target.value; App.refresh(); }
    });
    root.addEventListener('click', e => {
      const t = e.target;
      const day = t.closest('[data-day]'); if (day) { JadwalState.sel = day.dataset.day; return App.refresh(); }
      const wk = t.closest('[data-week]');
      if (wk) { const v = Number(wk.dataset.week); JadwalState.weekOffset = v === 0 ? 0 : JadwalState.weekOffset + v; JadwalState.sel = null; return App.refresh(); }
      const ed = t.closest('[data-edit]'); if (ed) return Shared.sessionModal(ed.dataset.edit);
      if (t.closest('[data-act="add-sess"]')) return Shared.sessionModal(null);
    });
  },
});

/* ---------- Form sesi (tambah/ubah) dengan cek bentrok langsung ---------- */
Shared.sessionModal = sessionId => {
  const s = sessionId ? Q.session(sessionId) : null;
  const groups = DB.groups;
  const subs = DB.subjects.filter(x => x.active || (s && x.id === s.subjectId));
  const g0 = s ? s.groupId : (JadwalState.grp !== 'all' ? JadwalState.grp : groups[0].id);
  const gSubs = Q.subjectsOfGroup(g0);
  const sub0 = s ? s.subjectId : (JadwalState.subj !== 'all' ? JadwalState.subj : (gSubs[0] || subs[0]).id);
  // Hanya tutor yang dideklarasikan mengampu mapel (diatur di Manajemen Kelas › Mata Pelajaran)
  const tutorOptions = (sid, cur) => {
    const able = Q.tutors().filter(t => t.subjects.includes(sid));
    if (!able.length) return '<option value="">Belum ada tutor pengampu</option>';
    return able.map(t => `<option value="${esc(t.name)}" ${t.name === cur ? 'selected' : ''}>${esc(t.name)}</option>`).join('');
  };
  // Tempat default: lokasi yang paling sering dipakai kelompok tsb (kosong untuk kelompok baru)
  const lastLoc = gid => {
    const n = {}; DB.sessions.filter(x => x.groupId === gid).forEach(x => { n[x.location] = (n[x.location] || 0) + 1; });
    return Object.entries(n).sort((a, b) => b[1] - a[1]).map(e => e[0])[0] || '';
  };
  openModal({
    title: s ? 'Ubah sesi' : 'Tambah sesi',
    sub: s ? `${Q.grp(s.groupId).name} · ${Q.subj(s.subjectId).code} · ${s.topic}` : 'Sesi baru otomatis muncul di jadwal pelajar Kelompok Kelas terkait.',
    size: 'lg',
    body: `<div class="form-grid two">
      <label class="field"><span>Kelompok Kelas</span><select id="sm-grp">${groups.map(g => `<option value="${g.id}" ${g.id === g0 ? 'selected' : ''}>${esc(g.name)} · ${Q.studentsOf(g.id).length} pelajar</option>`).join('')}</select></label>
      <label class="field"><span>Mata Pelajaran</span><select id="sm-subj">${subs.map(x => `<option value="${x.id}" ${x.id === sub0 ? 'selected' : ''}>${esc(x.code)} · ${esc(x.name)}</option>`).join('')}</select></label>
      <label class="field span-2"><span>Tutor</span><select id="sm-tutor">${tutorOptions(sub0, s ? s.tutor : '')}</select></label>
      <label class="field span-2"><span>Topik sesi</span><input id="sm-topic" value="${s ? esc(s.topic) : ''}" placeholder="cth. Pembahasan Soal Peluang"><small class="field-err"></small></label>
      <label class="field"><span>Tanggal</span><input type="date" id="sm-date" value="${s ? s.date : JadwalState.sel || todayStr()}"></label>
      <div class="time-pair">
        <label class="field"><span>Mulai</span><input type="time" id="sm-start" value="${s ? s.start : '15:30'}"></label>
        <label class="field"><span>Selesai</span><input type="time" id="sm-end" value="${s ? s.end : '17:00'}"></label>
      </div>
      <label class="field span-2"><span>Tempat</span><input id="sm-loc" value="${esc(s ? s.location : lastLoc(g0))}" placeholder="cth. Ruang 2 · Sekretariat BAT"><small class="field-err"></small></label>
      ${s ? `<label class="field span-2"><span>Alasan perubahan</span><textarea id="sm-reason" placeholder="Alasan ini akan ditampilkan ke pelajar" style="min-height:70px"></textarea><small class="field-err"></small></label>` : ''}
    </div>
    <div id="sm-check" aria-live="polite"></div>
    <label class="check"><input type="checkbox" checked> Kirim notifikasi otomatis ke pelajar</label>`,
    footer: `<button class="btn btn-ghost" data-close>Batal</button><button class="btn btn-primary" id="sm-save">${icon('check', 16)} Simpan sesi</button>`,
    onMount(m) {
      const v = id => $(id, m).value;
      let lastRoom = lastLoc(g0);
      const check = () => {
        const q = { groupId: v('#sm-grp'), tutor: v('#sm-tutor'), date: v('#sm-date'), start: v('#sm-start'), end: v('#sm-end'), excludeId: s ? s.id : null };
        const box = $('#sm-check', m), save = $('#sm-save', m);
        if (!q.tutor) {
          box.innerHTML = `<div class="alert alert-warning">${icon('alert', 16)}<span>Belum ada tutor yang mengampu <b>${esc(Q.subj(v('#sm-subj')).code)}</b>. Atur tutor pengampu di <a href="#/kelas/mapel" style="text-decoration:underline">Manajemen Kelas › Mata Pelajaran</a>.</span></div>`;
          save.disabled = true; return;
        }
        if (!q.date || !q.start || !q.end || toMin(q.end) <= toMin(q.start)) {
          box.innerHTML = `<div class="alert alert-warning">${icon('alert', 16)}<span>Lengkapi tanggal, lalu pastikan jam selesai setelah jam mulai.</span></div>`;
          save.disabled = true; return;
        }
        const c = findConflicts(q);
        const gName = Q.grp(q.groupId).name;
        if (c.tutor.length || c.group.length) {
          box.innerHTML = `<div class="conflict-box">
            <div class="cb-head">${icon('alert', 16)} Jadwal bentrok pada ${fmtDay(q.date)}</div>
            <ul>
              ${c.tutor.map(x => `<li>${icon('user', 14)}<span>Tutor <b>${esc(q.tutor)}</b> sudah mengajar <b>${esc(Q.grp(x.groupId).name)} · ${esc(Q.subj(x.subjectId).code)}</b> ${x.start}–${x.end}.</span></li>`).join('')}
              ${c.group.filter(x => !c.tutor.includes(x)).map(x => `<li>${icon('layers', 14)}<span>Kelompok <b>${esc(gName)}</b> sudah memiliki sesi <b>${esc(Q.subj(x.subjectId).code)}</b> ${x.start}–${x.end} bersama ${esc(x.tutor)}.</span></li>`).join('')}
            </ul>
            <small>Ubah tanggal, jam, atau tutor agar sesi dapat disimpan.</small>
          </div>`;
          save.disabled = true;
        } else {
          box.innerHTML = `<div class="note success">${icon('checkCircle', 15)}<span>Tidak ada bentrok. Tutor dan Kelompok Kelas tersedia pada ${fmtDay(q.date)}, ${q.start}–${q.end}.${c.sameDay.length ? `<br><span class="muted" style="font-weight:500">Sesi lain di hari yang sama: ${c.sameDay.map(x => `${esc(Q.grp(x.groupId).name)} ${esc(Q.subj(x.subjectId).code)} ${x.start}–${x.end} (${esc(x.tutor)})`).join('; ')}</span>` : ''}</span></div>`;
          save.disabled = false;
        }
      };
      $('#sm-grp', m).addEventListener('change', () => {
        const room = lastLoc(v('#sm-grp')), loc = $('#sm-loc', m);
        if (!loc.value.trim() || loc.value === lastRoom) loc.value = room;
        lastRoom = room; check();
      });
      $('#sm-subj', m).addEventListener('change', () => { const cur = v('#sm-tutor'); $('#sm-tutor', m).innerHTML = tutorOptions(v('#sm-subj'), cur); check(); });
      ['#sm-tutor', '#sm-date', '#sm-start', '#sm-end'].forEach(id => { $(id, m).addEventListener('change', check); $(id, m).addEventListener('input', check); });
      check();
      $('#sm-save', m).addEventListener('click', () => {
        const topic = v('#sm-topic').trim(), loc = v('#sm-loc').trim();
        fieldErr($('#sm-topic', m), topic ? '' : 'Topik wajib diisi.');
        fieldErr($('#sm-loc', m), loc ? '' : 'Tempat wajib diisi.');
        let reason = '';
        if (s) { reason = v('#sm-reason').trim(); fieldErr($('#sm-reason', m), reason ? '' : 'Tuliskan alasan perubahan.'); }
        if (!topic || !loc || (s && !reason)) return;
        if (!v('#sm-tutor')) return toast('Pilih tutor pengampu terlebih dahulu.', 'error');
        const data = { groupId: v('#sm-grp'), subjectId: v('#sm-subj'), tutor: v('#sm-tutor'), topic, date: v('#sm-date'), start: v('#sm-start'), end: v('#sm-end'), location: loc };
        const c = findConflicts({ ...data, excludeId: s ? s.id : null });
        if (c.tutor.length || c.group.length) return toast('Jadwal masih bentrok. Ubah waktu atau tutor.', 'error');
        if (s) {
          Object.assign(s, data, { changed: reason });
          toast('Sesi diperbarui. Notifikasi perubahan dikirim ke pelajar.');
        } else {
          DB.sessions.push({ id: 's' + Date.now(), ...data, changed: null });
          DB.activity.unshift({ who: App.user.name, what: 'menambahkan sesi', obj: `${Q.grp(data.groupId).name} · ${Q.subj(data.subjectId).code}`, at: stamp(), icon: 'calendar' });
          toast(`Sesi ditambahkan ke jadwal ${esc(Q.grp(data.groupId).name)}. Room pertemuan otomatis dibuat.`);
        }
        DB.sortSessions();
        JadwalState.sel = data.date;
        JadwalState.weekOffset = Math.floor((dayDiff(data.date) + (parseYMD(todayStr()).getDay() + 6) % 7) / 7);
        closeModal(); App.refresh();
      });
    },
  });
};
