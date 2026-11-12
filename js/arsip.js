/* =========================================================
   LMS BAT — Tahun ajaran & arsip
   - Setiap tahun ajaran punya data operasional sendiri (DB.YEAR_KEYS).
   - Kurikulum, Ketua BAT, dan Administrator memulai tahun ajaran baru:
     data tahun berjalan dibekukan menjadi arsip, tahun baru mulai kosong.
   - Arsip dapat dibuka seluruh panitia, hanya untuk dilihat (tanpa tambah/ubah/hapus).
   - Pelajar hanya melihat tahun ajaran aktif.
   ========================================================= */
const TA = {
  _live: null,                                    // data tahun aktif yang disimpan selama arsip dibuka
  get active() { return DB.years.find(y => y.status === 'aktif'); },
  get viewing() { return DB.years.find(y => y.id === DB.viewYear); },
  get isArchive() { return DB.viewYear !== this.active.id; },
  /* Kurikulum ke atas: Kurikulum, Ketua BAT, Administrator */
  canRoll() { return App.isPanitia && App.has('kurikulum', 'ketua'); },
  nextLabel(id) { const y = Number(String(id).split('/')[1]); return y ? `${y}/${y + 1}` : ''; },
  sorted() { return DB.years.slice().sort((a, b) => b.start.localeCompare(a.start)); },

  pick() { const o = {}; DB.YEAR_KEYS.forEach(k => { o[k] = DB[k]; }); return o; },
  load(data, T) {
    DB.YEAR_KEYS.forEach(k => { DB[k] = data[k]; });
    DB.T = T;
    // cache & state halaman yang memegang id dari tahun sebelumnya
    Object.keys(_recap).forEach(k => delete _recap[k]);
    Object.assign(JadwalState, { weekOffset: 0, sel: null, grp: 'all', subj: 'all', tutor: 'all' });
    if (typeof PresensiPan !== 'undefined') PresensiPan.sessionId = null;
    if (typeof MateriState !== 'undefined') MateriState.grp = 'all';
    if (typeof LapState !== 'undefined') LapState.grp = 'all';
    if (typeof PelajarMgmt !== 'undefined') Object.assign(PelajarMgmt, { q: '', grp: 'all' });
  },
  view(id) {
    if (id === DB.viewYear) return;
    const y = DB.years.find(x => x.id === id); if (!y) return;
    if (!this.isArchive) this._live = { data: this.pick(), T: DB.T };
    if (y.status === 'aktif') { this.load(this._live.data, this._live.T); this._live = null; }
    else this.load(y.data, y.T);
    DB.viewYear = id;
  },
  backToActive() { this.view(this.active.id); },

  /* Ringkasan yang ikut diarsipkan & pekerjaan yang masih menggantung */
  summary() {
    const pendLeave = DB.leaves.filter(l => ['wali', 'kurikulum'].includes(l.status)).length;
    const pendCorr = DB.corrections.filter(k => k.status === 'pending').length;
    const ungraded = DB.assignments.reduce((n, a) => n + Math.max(0, (a.submitted || 0) - (a.graded || 0)), 0);
    const upcoming = DB.sessions.filter(Q.isUpcoming).length;
    return { counts: DB.countsOf(this.pick()), pendLeave, pendCorr, ungraded, upcoming };
  },

  /* Pergantian tahun ajaran. Tidak bisa dibatalkan. */
  rollover({ name, copyGroups, carryIds }) {
    const old = this.active, by = App.user.name, at = stamp(), T = DB.T, now = nowHM();
    const cur = this.pick();
    const groups = copyGroups ? cur.groups.map(g => ({ ...g })) : [];
    const keepGroup = new Set(groups.map(g => g.id));
    const students = cur.students.filter(s => carryIds.includes(s.id) && keepGroup.has(s.groupId))
      .map(s => ({ ...s, joined: T, att: null, avg: 0, toHist: [0, 0, 0, 0] }));
    const archived = DB.finalizeYear(cur, { keep: s => s.date < T || (s.date === T && s.end <= now), closeDate: T, at, by });
    Object.assign(old, { status: 'arsip', end: T, closedAt: at, closedBy: by, T, data: archived, counts: DB.countsOf(archived) });
    DB.years.push({ id: name, status: 'aktif', start: T, end: '', closedAt: '', closedBy: '', T: null, data: null, counts: null });
    this.load({
      groups, students, sessions: [], attendance: Object.fromEntries(students.map(s => [s.id, {}])), assignments: [], materials: [],
      rooms: {}, attEdits: {}, leaves: [], corrections: [], announcements: [], tryouts: [], notes: [], activity: [],
      audit: [{ who: by, at, what: `Memulai tahun ajaran ${name}. Data ${old.id} diarsipkan (hanya baca).` }],
    }, T);
    DB.viewYear = name; this._live = null;
    DB.notifications.panitia.unshift({ title: `Tahun ajaran ${name} dimulai`, text: `Data ${old.id} tersimpan di arsip dan hanya dapat dilihat.`, at, unread: true, icon: 'archive' });
  },
};

/* ---------- Mode arsip: hanya baca ----------
   Tombol yang menambah/mengubah/menghapus disembunyikan dan diblokir, kolom isian dikunci.
   Filter, pencarian, tab, detail, dan unduhan tetap bisa dipakai. */
const RO_ACTIONS = ['[data-act]', '[data-edit]', '[data-add]', '[data-new-subj]', '[data-edit-subj]', '[data-toggle-subj]', '[data-new-mat]',
  '[data-new-task]', '[data-kok]', '[data-kno]', '[data-wali-ok]', '[data-wali-no]', '[data-ok]', '[data-no]', '[data-to]', '[data-new-user]',
  '[data-edit-user]', '[data-pw]', '[data-save-profile]', '[data-add-place]', '[data-here]', '[data-save-sys]', '[data-ann]', '[data-r]',
  '[data-manual]', '[data-edit-att]', '[data-correct]', '[data-do]', '[data-toggle]', '[data-year-new]'].join(',');
const RO_KEEP_FIELDS = '#pm-q, #pm-grp, #mp-q, #jf-grp, #jf-subj, #jf-tutor, input[name="ps"]';
const RO_MODAL_SAVE = 'button[id$="-save"], button[id$="-send"], #del-ok, #ap-del, #ap-regen, #ap-copy, #sd-move, #sd-note, #qz-add, [data-rmq]';

function lockArchive(root) {
  if (!TA.isArchive || !root) return;
  $$('input, select, textarea', root).forEach(el => { if (!el.matches(RO_KEEP_FIELDS)) el.disabled = true; });
}
function lockArchiveModal(m) {
  if (!TA.isArchive || !m) return;
  $$('input, select, textarea', m).forEach(el => { el.disabled = true; });
  $$(`${RO_MODAL_SAVE}, ${RO_ACTIONS}`, m).forEach(el => el.remove());
  const foot = $('.modal-foot', m);
  const note = `<span class="ro-note">${icon('archive', 14)} Arsip ${esc(DB.viewYear)} · hanya baca</span>`;
  if (foot) { foot.insertAdjacentHTML('afterbegin', note); if (!$('button', foot)) foot.insertAdjacentHTML('beforeend', '<button class="btn btn-ghost" data-close>Tutup</button>'); }
  else m.insertAdjacentHTML('beforeend', `<div class="modal-foot">${note}<button class="btn btn-ghost" data-close>Tutup</button></div>`);
}
const roBlocked = () => toast(`Arsip ${esc(DB.viewYear)} hanya bisa dilihat. Kembali ke tahun ajaran aktif untuk mengubah data.`, 'info');
document.addEventListener('click', e => {
  if (!App.user || !TA.isArchive) return;
  const t = e.target.closest(`${RO_ACTIONS}, #modal-root ${RO_MODAL_SAVE.split(', ').join(', #modal-root ')}`);
  if (t && t.closest('#content, #modal-root')) { e.preventDefault(); e.stopImmediatePropagation(); roBlocked(); }
}, true);
document.addEventListener('submit', e => {
  if (App.user && TA.isArchive && e.target.closest('#content, #modal-root')) { e.preventDefault(); e.stopImmediatePropagation(); roBlocked(); }
}, true);

/* ---------- Komponen ---------- */

const archiveBar = () => {
  const y = TA.viewing;
  return `<div class="archive-bar" role="status">${icon('archive', 18)}<div><b>Arsip ${esc(y.id)} · hanya baca</b><span>Ditutup ${fmtLong(y.closedAt.split(' ')[0])} oleh ${esc(y.closedBy)}. Data tidak dapat ditambah, diubah, atau dihapus.</span></div><button class="btn btn-sm" data-year-back>Kembali ke ${esc(TA.active.id)}</button></div>`;
};

/* Kartu Tahun Ajaran di halaman Pengaturan */
function yearCard() {
  const can = TA.canRoll();
  const rows = TA.sorted().map(y => {
    const c = y.status === 'aktif' && !TA.isArchive ? DB.countsOf(TA.pick()) : y.status === 'aktif' ? DB.countsOf(TA._live.data) : y.counts;
    const meta = y.status === 'aktif' ? `Mulai ${fmtShort(y.start)} · ${c.students} pelajar · ${c.groups} kelompok · ${c.sessions} sesi`
      : `Ditutup ${fmtShort(y.end)} oleh ${esc(firstName(y.closedBy))} · ${c.students} pelajar · ${c.sessions} sesi`;
    const here = y.id === DB.viewYear;
    const btn = here ? `<span class="muted small">Sedang dilihat</span>`
      : `<button class="btn btn-sm btn-ghost" data-year-view="${y.id}">${icon('eye', 14)} ${y.status === 'aktif' ? 'Buka' : 'Lihat arsip'}</button>`;
    return `<div class="year-row ${here ? 'is-here' : ''}"><div class="year-id"><b>${y.id}</b>${y.status === 'aktif' ? badge('Aktif', 'success') : badge('Arsip', 'neutral', 'no-dot')}</div><small>${meta}</small><div class="year-act">${btn}</div></div>`;
  }).join('');
  return `<div class="card">
    <div class="card-head"><h3>${icon('archive', 16)} Tahun ajaran</h3>${can ? '' : badge('Diatur Kurikulum, Ketua, Admin', 'neutral', 'no-dot')}</div>
    <div class="year-list">${rows}</div>
    ${can ? `<button class="btn btn-primary btn-block mt" data-year-new ${TA.isArchive ? 'disabled' : ''}>${icon('plus', 16)} Mulai tahun ajaran baru</button>` : ''}
  </div>`;
}

/* Modal pergantian tahun ajaran */
function openRolloverModal() {
  if (!TA.canRoll()) return toast('Hanya Kurikulum, Ketua BAT, dan Administrator yang dapat memulai tahun ajaran baru.', 'error');
  if (TA.isArchive) return toast('Kembali ke tahun ajaran aktif terlebih dahulu.', 'info');
  const cur = TA.active, next = TA.nextLabel(cur.id), sm = TA.summary(), c = sm.counts;
  const pend = [
    sm.pendLeave && `${sm.pendLeave} pengajuan izin masih menunggu → ditutup sebagai kedaluwarsa`,
    sm.pendCorr && `${sm.pendCorr} koreksi presensi masih menunggu → ditutup`,
    sm.ungraded && `${sm.ungraded} pengumpulan tugas belum dinilai → diarsipkan apa adanya`,
    sm.upcoming && `${sm.upcoming} sesi terjadwal setelah hari ini → tidak ikut diarsipkan`,
  ].filter(Boolean);
  const carry = DB.students.filter(Q.isActive);
  openModal({
    title: 'Mulai tahun ajaran baru',
    sub: `Data ${cur.id} dibekukan menjadi arsip yang hanya bisa dilihat. Tahun ajaran baru dimulai dengan data kosong.`,
    size: 'lg',
    body: `
      <div class="roll-grid">
        <div class="roll-col">
          <p class="roll-h">Diarsipkan dari ${cur.id}</p>
          <div class="roll-counts">${[[c.students, 'pelajar'], [c.groups, 'kelompok kelas'], [c.sessions, 'sesi & presensi'], [c.tasks, 'tugas & kuis'], [c.materials, 'materi'], [c.leaves, 'pengajuan izin']]
            .map(([n, l]) => `<div><b>${n}</b><span>${l}</span></div>`).join('')}</div>
          <p class="roll-h">Tetap dipakai di tahun baru</p>
          <p class="muted small">Akun panitia, mata pelajaran, pengaturan presensi, dan titik lokasi.</p>
          ${pend.length ? `<div class="alert alert-warning mt">${icon('alert', 16)}<div><b>Masih ada yang belum selesai</b><ul class="roll-pend">${pend.map(p => `<li>${p}</li>`).join('')}</ul></div></div>` : ''}
        </div>
        <div class="roll-col">
          <label class="field"><span>Nama tahun ajaran baru</span><input id="ry-name" value="${next}"><small class="field-err"></small></label>
          <label class="check roll-opt"><input type="checkbox" id="ry-groups" checked><span><b>Salin Kelompok Kelas</b><small>Nama, deskripsi, dan Wali Kelas disalin tanpa anggota.</small></span></label>
          <label class="check roll-opt"><input type="checkbox" id="ry-carry"><span><b>Lanjutkan sebagian pelajar</b><small>Misalnya pelajar gap year yang ikut lagi. Riwayatnya tetap di arsip ${cur.id}.</small></span></label>
          <div class="roll-carry hidden" id="ry-carry-list">${carry.map(s => `<label class="check"><input type="checkbox" value="${s.id}" ${Q.grp(s.groupId) && Q.grp(s.groupId).name === 'Gap Year' ? 'checked' : ''}><span>${esc(s.name)} <small class="muted">${esc((Q.grp(s.groupId) || {}).name || '')}</small></span></label>`).join('')}</div>
          <label class="field mt"><span>Ketik <b>${cur.id}</b> untuk konfirmasi</span><input id="ry-confirm" autocomplete="off" placeholder="${cur.id}"></label>
        </div>
      </div>`,
    footer: `<button class="btn btn-ghost" data-close>Batal</button><button class="btn btn-danger" id="ry-go" disabled>${icon('archive', 16)} Arsipkan ${cur.id} & mulai</button>`,
    onMount(m) {
      const go = $('#ry-go', m), name = $('#ry-name', m), conf = $('#ry-confirm', m), carryBox = $('#ry-carry', m), list = $('#ry-carry-list', m), grp = $('#ry-groups', m);
      const sync = () => {
        go.disabled = conf.value.trim() !== cur.id;
        go.innerHTML = `${icon('archive', 16)} Arsipkan ${cur.id} & mulai ${esc(name.value.trim() || 'tahun baru')}`;
        list.classList.toggle('hidden', !carryBox.checked);
        carryBox.disabled = !grp.checked; if (!grp.checked) { carryBox.checked = false; list.classList.add('hidden'); }
      };
      [name, conf].forEach(el => el.addEventListener('input', sync));
      [carryBox, grp].forEach(el => el.addEventListener('change', sync));
      sync();
      go.addEventListener('click', () => {
        const nm = name.value.trim();
        if (!/^\d{4}\/\d{4}$/.test(nm)) return fieldErr(name, 'Gunakan format 2027/2028.');
        if (DB.years.some(y => y.id === nm)) return fieldErr(name, 'Tahun ajaran ini sudah ada.');
        fieldErr(name);
        const carryIds = carryBox.checked ? $$('input:checked', list).map(i => i.value) : [];
        TA.rollover({ name: nm, copyGroups: grp.checked, carryIds });
        closeModal(true);
        buildShell(); location.hash = '#/dashboard'; render();
        toast(`Tahun ajaran ${nm} dimulai. Data ${cur.id} tersimpan di arsip.`);
      });
    },
  });
}

/* Tombol tahun ajaran (banner arsip & tab Tahun ajaran di Pengaturan) */
document.addEventListener('click', e => {
  const v = e.target.closest('[data-year-view]'), back = e.target.closest('[data-year-back]'), nw = e.target.closest('[data-year-new]');
  if (nw && !TA.isArchive) return openRolloverModal();
  if (!v && !back) return;
  TA.view(back ? TA.active.id : v.dataset.yearView);
  buildShell(); render(true);
  toast(TA.isArchive ? `Membuka arsip ${DB.viewYear} (hanya baca).` : `Kembali ke tahun ajaran aktif ${DB.viewYear}.`, 'info');
});
