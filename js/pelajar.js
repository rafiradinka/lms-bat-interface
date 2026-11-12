/* =========================================================
   LMS BAT — Halaman Pelajar
   Beranda · Kelompok Kelas · Jadwal · Materi & Tugas · Presensi · Izin · Laporan · Profil
   ========================================================= */
const PelajarPages = {};

/* ---------- Beranda ---------- */
PelajarPages.beranda = {
  title: 'Beranda',
  render() {
    const me = Q.me(), g = Q.grp(me.groupId);
    const next = Q.nextSession([me.groupId]);
    const st = Q.attStats(me.id);
    const tasks = Q.myTasks();
    const pending = tasks.filter(a => a.my.status === 'belum').sort((a, b) => a.deadline.localeCompare(b.deadline));
    const graded = tasks.filter(a => a.my.status === 'dinilai');
    const lastTO = DB.tryouts[DB.tryouts.length - 1];
    const prevTO = DB.tryouts[DB.tryouts.length - 2];
    const anns = Q.announcementsFor([me.groupId]).slice(0, 4);
    const rec = Q.attOf(me.id);
    const week = Q.sessionsOf([me.groupId]).filter(s => Q.isUpcoming(s) && dayDiff(s.date) < 7).slice(0, 4);

    let hero = '';
    if (next) {
      const sb = Q.subj(next.subjectId), s = Q.state(next), done = rec[next.id];
      hero = `<section class="hero-card">
        <div class="hero-top">${badge(s.key === 'live' ? 'Sedang berlangsung' : 'Sesi terdekat · ' + relDay(next.date), s.key === 'live' ? 'danger' : 'accent')}${stag(sb)}${tag(g)}${next.changed ? badge('Jadwal berubah', 'warning') : ''}</div>
        <h2>${esc(next.topic)}</h2>
        <div class="meta-row"><span>${icon('book', 15)} ${esc(sb.name)}</span><span>${icon('clock', 15)} ${fmtDay(next.date)} · ${next.start}–${next.end} WIB</span><span>${icon('pin', 15)} ${esc(next.location)}</span><span>${icon('user', 15)} ${esc(next.tutor)}</span></div>
        <div class="hero-actions">
          ${next.date === todayStr() ? `<a class="btn btn-primary btn-lg" href="#/sesi/${next.id}">${icon('arrowRight', 18)} Masuk Kelas</a>`
          : `<a class="btn btn-primary" href="#/sesi/${next.id}">${icon('eye', 16)} Lihat room pertemuan</a>`}
          ${done ? `<span class="btn btn-success" style="pointer-events:none">${icon('checkCircle', 16)} Sudah presensi · ${ATT[done.status].label}</span>` : ''}
          <a class="btn btn-outline" href="#/izin">Tidak bisa hadir?</a>
        </div>
      </section>`;
    }

    return `
    <div class="page-head">
      <div><p class="eyebrow">${fmtLong(todayStr())}</p><h1>${greeting()}, ${esc(firstName(me.name))}!</h1><p>Kelompok Kelas <b>${esc(g.name)}</b> · Wali Kelas ${esc(g.wali)}. BAT?! Show The Way~</p></div>
    </div>
    ${hero}
    <div class="stats">
      ${statCard('checkCircle', st.pct + '%', 'Kehadiran', 'success', `${st.hadir + st.terlambat} dari ${st.total} sesi`)}
      ${statCard('file', pending.length, 'Tugas tertunda', 'warning', pending[0] ? `Terdekat ${relDay(pending[0].deadline).toLowerCase()}` : 'Semua beres!')}
      ${statCard('target', Q.taskAvg(me.id) || '–', 'Rata-rata nilai', 'primary', `${graded.length} tugas dinilai`)}
      ${statCard('trending', Q.toAvg(lastTO), 'Skor tryout terakhir', 'accent', `${Q.toAvg(lastTO) - Q.toAvg(prevTO) >= 0 ? '+' : ''}${Q.toAvg(lastTO) - Q.toAvg(prevTO)} dari sebelumnya`)}
    </div>
    <div class="cols cols-3-2">
      <div class="card">
        <div class="card-head"><h3>${icon('file', 16)} Tugas belum dikumpulkan</h3><a class="link" href="#/tugas">Materi dan Tugas ${icon('right', 14)}</a></div>
        <div class="list">
          ${pending.length ? pending.map(a => {
            const sb = Q.subj(a.subjectId), dd = dayDiff(a.deadline);
            return `<a class="item clickable" href="#/tugas/${sb.id}"><div class="item-ic code-ic" style="--c:${sb.color}">${esc(sb.code)}</div><div class="item-body"><div class="item-title">${esc(a.title)}</div><div class="item-sub">${esc(sb.name)} · Tenggat ${fmtDay(a.deadline)}, ${a.time}</div></div>${badge(relDay(a.deadline), dd <= 1 ? 'danger' : dd <= 3 ? 'warning' : 'neutral')}</a>`;
          }).join('') : emptyState('checkCircle', 'Tidak ada tugas tertunda', 'Kerja bagus! Semua tugas sudah dikumpulkan.')}
        </div>
      </div>
      <div class="card">
        <div class="card-head"><h3>${icon('megaphone', 16)} Pengumuman</h3></div>
        ${anns.map(annItem).join('') || emptyState('megaphone', 'Belum ada pengumuman')}
      </div>
    </div>
    <div class="cols cols-3-2">
      <div class="card">
        <div class="card-head"><h3>${icon('trending', 16)} Ringkasan nilai tugas</h3><a class="link" href="#/laporan">Laporan lengkap ${icon('right', 14)}</a></div>
        ${graded.length ? lineChart(graded.map(a => ({ label: a.title.split(' ').slice(0, 2).join(' '), value: a.my.score })), { min: 50, max: 100, h: 340 }) : emptyState('chart', 'Belum ada nilai')}
      </div>
      <div class="card">
        <div class="card-head"><h3>${icon('calendar', 16)} Sesi 7 hari ke depan</h3><a class="link" href="#/jadwal">Jadwal ${icon('right', 14)}</a></div>
        <div class="list">${week.map(s => sessRow(s)).join('') || emptyState('calendar', 'Tidak ada sesi minggu ini')}</div>
        <div class="divider"></div>
        <div class="card-head" style="margin-bottom:6px"><h3>Kehadiranmu</h3></div>
        ${attSummary(st, 120)}
      </div>
    </div>`;
  },
};

/* ---------- Kelompok Kelas (satu-satunya kelompok pelajar) ---------- */
PelajarPages.kelas = {
  title: 'Kelompok Kelas',
  render() { return Shared.groupDetail(Q.me().groupId, false); },
  mount(root) { Shared.bindGroupActions(root); },
};
PelajarPages.jadwal = Shared.jadwal(false);

/* ---------- Materi & Tugas (dikelompokkan per Mata Pelajaran) ---------- */
const TugasState = { filter: 'semua' };
const mySubjectsPel = () => {
  const me = Q.me();
  const ids = new Set([...Q.subjectsOfGroup(me.groupId).map(s => s.id), ...Q.myTasks().map(a => a.subjectId)]);
  return DB.subjects.filter(s => ids.has(s.id));
};
PelajarPages.tugas = {
  title: sid => sid && Q.subj(sid) ? Q.subj(sid).name : 'Materi dan Tugas',
  render(sid) {
    if (sid && TabMemory._ptugas !== sid) { TabMemory._ptugas = sid; delete TabMemory.ptugas; }
    return sid ? this.detail(sid) : this.overview();
  },
  overview() {
    const tasks = Q.myTasks(), subs = mySubjectsPel();
    const pending = tasks.filter(a => a.my.status === 'belum').sort((a, b) => a.deadline.localeCompare(b.deadline));
    return `
    <div class="page-head"><div><h1>Materi dan Tugas</h1><p>Pilih mata pelajaran untuk membuka materi dan tugasnya. Kumpulkan tugas sebelum tenggat dan lihat nilai serta umpan balik tutor.</p></div></div>
    <div class="stats">
      ${statCard('clock', pending.length, 'Belum dikumpul', 'warning')}
      ${statCard('upload', tasks.filter(a => a.my.status === 'dikumpul').length, 'Menunggu nilai', 'info')}
      ${statCard('checkCircle', tasks.filter(a => a.my.status === 'dinilai').length, 'Sudah dinilai', 'success')}
      ${statCard('book', subs.length, 'Mata Pelajaran', 'primary')}
    </div>
    ${pending.length ? `<div class="card" style="margin-bottom:16px"><div class="card-head"><h3>${icon('alert', 16)} Tenggat terdekat</h3></div><div class="list">
      ${pending.slice(0, 4).map(a => { const sb = Q.subj(a.subjectId), dd = dayDiff(a.deadline); return `<div class="item"><div class="item-ic code-ic" style="--c:${sb.color}">${esc(sb.code)}</div><div class="item-body"><div class="item-title">${esc(a.title)}</div><div class="item-sub">${fmtDay(a.deadline)}, ${a.time} · <b class="${dd <= 1 ? 'text-danger' : dd <= 3 ? 'text-warning' : ''}">${relDay(a.deadline)}</b></div></div><button class="btn btn-sm btn-primary" data-submit="${a.id}" aria-label="Kumpulkan ${esc(a.title)}">${icon('upload', 14)} Kumpulkan</button></div>`; }).join('')}
    </div></div>` : ''}
    <div class="grid-cards">${subs.map(sb => {
      const ms = DB.materials.filter(m => m.subjectId === sb.id), ts = tasks.filter(a => a.subjectId === sb.id), belum = ts.filter(a => a.my.status === 'belum').length;
      return `<a class="class-card" href="#/tugas/${sb.id}" style="--c:${sb.color}">
        <div class="class-cover"><span class="badge no-dot">${esc(sb.code)}</span><h3>${esc(sb.name)}</h3><p>${esc(sb.desc)}</p></div>
        <div class="class-body">
          <div class="class-people"><div class="person">${avatar(Q.tutorsOf(Q.me().groupId, sb.id)[0] || 'Tutor', 'sm')}<div><small>Tutor</small><b>${Q.tutorsOf(Q.me().groupId, sb.id).map(esc).join(', ') || '—'}</b></div></div></div>
          <div>${belum ? badge(`${belum} tugas belum dikumpul`, 'warning') : badge('Tugas beres', 'success')}</div>
          <div class="class-foot"><span>${icon('file', 14)} ${ms.length} materi</span><span>${icon('clipboard', 14)} ${ts.length} tugas</span></div>
        </div>
      </a>`;
    }).join('')}</div>`;
  },
  detail(sid) {
    const sb = Q.subj(sid);
    if (!sb || !mySubjectsPel().includes(sb)) return `<div class="card">${emptyState('book', 'Mata pelajaran tidak ditemukan', '', `<a class="btn btn-ghost" href="#/tugas">Kembali</a>`)}</div>`;
    const tasks = Q.myTasks().filter(a => a.subjectId === sid);
    const mats = DB.materials.filter(m => m.subjectId === sid).sort((a, b) => b.date.localeCompare(a.date));
    const count = k => k === 'semua' ? tasks.length : tasks.filter(a => a.my.status === k).length;
    return `
    <div class="class-hero" style="--c:${sb.color}">
      <a class="back" href="#/tugas">${icon('left', 16)} Semua mata pelajaran</a>
      <h1>${esc(sb.name)} <span class="muted" style="font-weight:700">· ${esc(sb.code)}</span></h1>
      <p>${esc(sb.desc)}</p>
      <div class="meta-row" style="margin-top:10px"><span>${icon('user', 14)} ${Q.tutorsOf(Q.me().groupId, sid).map(esc).join(', ') || '—'}</span></div>
    </div>
    <div data-tab-scope>
      <div class="tabs" data-tabs="ptugas" style="max-width:max-content">
        <button class="tab ${tabCls('ptugas', 'tugas', true)}" data-tab="tugas">${icon('clipboard', 16)} Tugas <span class="muted">${tasks.length}</span></button>
        <button class="tab ${tabCls('ptugas', 'materi')}" data-tab="materi">${icon('file', 16)} Materi <span class="muted">${mats.length}</span></button>
      </div>
      <div class="tab-pane ${tabCls('ptugas', 'tugas', true)}" data-pane="tugas">
        <div class="chips" style="margin-bottom:16px">
          ${['semua', 'belum', 'dikumpul', 'dinilai'].map(k => `<button class="chip ${TugasState.filter === k ? 'active' : ''}" data-filter="${k}">${k === 'semua' ? 'Semua' : TASK[k].label}<span class="cnt">${count(k)}</span></button>`).join('')}
        </div>
        <div id="task-list">${this.list(sid)}</div>
      </div>
      <div class="tab-pane ${tabCls('ptugas', 'materi')}" data-pane="materi">
        <div class="card"><div class="list">${mats.map(m => `<div class="item"><div class="item-ic" style="--c:${MAT_COLOR[m.type]}">${icon(MAT_ICON[m.type], 18)}</div><div class="item-body"><div class="item-title">${esc(m.title)}</div><div class="item-sub">${m.type} · ${m.size} · ${esc(m.by)} · ${fmtShort(m.date)}${meetLink(m.sessionId)}</div></div><button class="btn btn-sm btn-ghost" data-dl="${esc(m.title)}">${icon(m.type === 'Link' ? 'link' : 'download', 14)} ${m.type === 'Link' ? 'Buka' : 'Unduh'}</button></div>`).join('') || emptyState('book', 'Belum ada materi')}</div></div>
      </div>
    </div>`;
  },
  list(sid) {
    const tasks = Q.myTasks().filter(a => a.subjectId === sid && (TugasState.filter === 'semua' || a.my.status === TugasState.filter))
      .sort((a, b) => (a.my.status === 'belum' ? 0 : 1) - (b.my.status === 'belum' ? 0 : 1) || a.deadline.localeCompare(b.deadline));
    if (!tasks.length) return `<div class="card">${emptyState('file', 'Tidak ada tugas', 'Tidak ada tugas pada kategori ini.')}</div>`;
    return tasks.map(a => {
      const m = TASK[a.my.status], dd = dayDiff(a.deadline);
      const overdue = a.my.status === 'belum' && dd < 0;
      return `<div class="task">
        <div class="task-main">
          <div class="task-top">${stag(Q.subj(a.subjectId))}${a.kind === 'kuis' ? badge('Kuis', 'accent', 'no-dot') : ''}${badge(m.label, m.tone)}${a.my.status === 'belum' && dd <= 1 && dd >= 0 ? badge('Segera', 'danger') : ''}</div>
          <h4>${esc(a.title)}</h4>
          <p>${esc(a.desc)}</p>
          <div class="meta-row"><span>${icon('clock', 14)} Tenggat ${fmtDay(a.deadline)}, ${a.time}</span>${a.my.status === 'belum' ? `<span class="${overdue ? 'text-danger' : ''}">${relDay(a.deadline)}</span>` : a.my.submittedAt ? `<span>${icon('upload', 14)} Dikumpul ${fmtStamp(a.my.submittedAt)}</span>` : ''}<span>${icon('user', 14)} ${esc(a.by)}</span>${a.sessionId && Q.session(a.sessionId) ? `<a href="#/sesi/${a.sessionId}" style="color:var(--primary);font-weight:700">${icon('layers', 14)} Pertemuan ${fmtShort(Q.session(a.sessionId).date)}</a>` : ''}</div>
        </div>
        <div class="task-side">
          ${a.my.status === 'dinilai' ? `<div class="score"><b>${a.my.score}</b><span>/100</span></div>` : ''}
          ${a.my.status === 'belum' ? `<button class="btn btn-primary btn-sm" data-submit="${a.id}">${icon(a.kind === 'kuis' ? 'target' : 'upload', 14)} ${a.kind === 'kuis' ? 'Kerjakan kuis' : 'Kumpulkan'}</button>`
          : `<button class="btn btn-ghost btn-sm" data-view="${a.id}">${icon('eye', 14)} ${a.my.status === 'dinilai' ? 'Lihat nilai' : 'Lihat pengumpulan'}</button>`}
        </div>
      </div>`;
    }).join('');
  },
  mount(root, sid) {
    bindTabs(root);
    root.addEventListener('click', e => {
      const f = e.target.closest('[data-filter]');
      if (f) { TugasState.filter = f.dataset.filter; $$('[data-filter]', root).forEach(x => x.classList.toggle('active', x === f)); $('#task-list', root).innerHTML = this.list(sid); return; }
      const byId = id => DB.assignments.find(x => x.id === id);
      const s = e.target.closest('[data-submit]'); if (s) { const a = byId(s.dataset.submit); return a.kind === 'kuis' ? Room.quizModal(a) : this.submitModal(a.id); }
      const v = e.target.closest('[data-view]'); if (v) { const a = byId(v.dataset.view); return a.kind === 'kuis' ? Room.quizResult(a) : this.viewModal(a.id); }
      const d = e.target.closest('[data-dl]'); if (d) toast(`Membuka “${d.dataset.dl}” (demo)`, 'info');
    });
  },
  submitModal(id) {
    const a = DB.assignments.find(x => x.id === id), sb = Q.subj(a.subjectId);
    let file = null;
    openModal({
      title: 'Kumpulkan tugas', sub: `${sb.code} · ${a.title}`,
      body: `<div class="feedback">${esc(a.desc)}</div>
        <div class="meta-row"><span>${icon('clock', 14)} Tenggat ${fmtDay(a.deadline)}, ${a.time} (${relDay(a.deadline)})</span></div>
        <div class="field"><span>Berkas tugas</span>${dropzone('sub-file', 'PDF, DOCX, JPG, PNG · maks. 10 MB')}<small class="field-err" id="sub-err"></small></div>
        <label class="field"><span>Catatan untuk tutor (opsional)</span><textarea id="sub-note" placeholder="cth. Nomor 7 saya masih ragu caranya…"></textarea></label>`,
      footer: `<button class="btn btn-ghost" data-close>Batal</button><button class="btn btn-primary" id="sub-send">${icon('send', 16)} Kumpulkan</button>`,
      onMount(m) {
        bindDropzone($('#sub-file', m), f => { file = f; $('#sub-err', m).textContent = ''; });
        $('#sub-send', m).addEventListener('click', e => {
          if (!file) { $('#sub-err', m).textContent = 'Pilih berkas tugas terlebih dahulu.'; return; }
          const btn = e.currentTarget; btn.classList.add('loading');
          setTimeout(() => {
            Object.assign(a.my, { status: 'dikumpul', file: file.name, submittedAt: stamp(), note: $('#sub-note', m).value.trim() });
            a.submitted = Math.min(a.submitted + 1, Q.assignTotal(a));
            if (a.subs) delete a.subs;
            closeModal(); toast('Tugas berhasil dikumpulkan! Tutor akan segera menilai.'); App.refresh();
          }, 700);
        });
      },
    });
  },
  viewModal(id) {
    const a = DB.assignments.find(x => x.id === id), sb = Q.subj(a.subjectId);
    openModal({
      title: a.title, sub: `${sb.code} · ${TASK[a.my.status].label}`,
      body: `${a.my.status === 'dinilai' ? `<div class="score-big"><b>${a.my.score}</b><div class="muted small" style="margin-top:6px">dari 100</div></div>
        <div><div class="field"><span>Umpan balik tutor</span></div><div class="feedback" style="margin-top:6px">${esc(a.my.feedback)}</div></div>` : `<div class="alert alert-info">${icon('clock', 16)}<span>Tugasmu sudah diterima dan sedang menunggu penilaian tutor.</span></div>`}
        <div class="kv">
          <div><span>Berkas</span><b><span class="file-chip">${icon('clip', 14)}<span>${esc(a.my.file)}</span></span></b></div>
          <div><span>Waktu pengumpulan</span><b>${fmtStamp(a.my.submittedAt)}</b></div>
          <div><span>Tenggat</span><b>${fmtDay(a.deadline)}, ${a.time}</b></div>
          <div><span>Tutor</span><b>${esc(a.by)}</b></div>
        </div>`,
      footer: `<button class="btn btn-ghost" data-close>Tutup</button>`,
    });
  },
};

/* ---------- Presensi (riwayat saja; presensi dilakukan di room pertemuan dengan tombol lokasi) ---------- */
const PresensiPel = { filter: 'semua' };
PelajarPages.presensi = {
  title: 'Presensi',
  render() {
    const me = Q.me();
    const st = Q.attStats(me.id);
    const todays = Q.todaySessions([me.groupId]).filter(s => Q.state(s).key !== 'selesai');
    return `
    <div class="page-head"><div><h1>Riwayat Presensi</h1><p>Rekap kehadiranmu di setiap pertemuan. Presensi dilakukan di <b>room pertemuan</b> dengan tombol lokasi setelah tutor membuka presensi.</p></div></div>
    ${todays.length ? `<div class="note primary" style="margin:0 0 16px">${icon('locate', 15)}<span>Ada sesi hari ini: ${todays.map(s => `<a href="#/sesi/${s.id}" style="text-decoration:underline;font-weight:700">${esc(Q.subj(s.subjectId).code)} · ${s.start}</a>`).join(', ')}. Masuk ke room untuk presensi.</span></div>` : ''}
    <div class="stats">
      ${statCard('checkCircle', st.pct + '%', 'Kehadiran', 'success', `${st.hadir + st.terlambat} dari ${st.total} sesi`)}
      ${statCard('xCircle', st.alpa, 'Tidak hadir', 'danger')}
      ${statCard('clock', st.terlambat, 'Terlambat', 'warning')}
      ${statCard('clipboard', st.izin, 'Izin disetujui', 'info')}
    </div>
    <div class="cols cols-3-2">
      <div class="card">
        <div class="card-head"><h3>${icon('history', 16)} Riwayat kehadiran</h3>
          <div class="chips">${['semua', 'hadir', 'terlambat', 'izin', 'alpa'].map(k => `<button class="chip ${PresensiPel.filter === k ? 'active' : ''}" data-f="${k}">${k === 'semua' ? 'Semua' : ATT[k].label}</button>`).join('')}</div>
        </div>
        <div id="att-hist">${this.history(me)}</div>
      </div>
      <div class="card">
        <div class="card-head"><h3>Ringkasan</h3></div>
        ${attSummary(st)}
        <div class="divider"></div>
        <div class="kv">
          <div><span>${badge('Hadir', 'success')}</span><b class="small muted" style="font-weight:500">Presensi dalam ${DB.settings.lateTolerance} menit pertama sejak dibuka</b></div>
          <div><span>${badge('Terlambat', 'warning')}</span><b class="small muted" style="font-weight:500">Presensi setelah ${DB.settings.lateTolerance} menit pertama, sampai jam pelajaran selesai</b></div>
          <div><span>${badge('Izin', 'info')}</span><b class="small muted" style="font-weight:500">Pengajuan izin disetujui Wali Kelas dan Kurikulum</b></div>
          <div><span>${badge('Tidak hadir', 'danger')}</span><b class="small muted" style="font-weight:500">Tidak presensi sampai jam selesai, atau izin ditolak / tidak ditindak</b></div>
        </div>
      </div>
    </div>`;
  },
  history(me) {
    const rec = Q.attOf(me.id);
    const rows = DB.sessions.filter(s => rec[s.id] && s.date <= todayStr())
      .filter(s => PresensiPel.filter === 'semua' || rec[s.id].status === PresensiPel.filter).reverse();
    if (!rows.length) return emptyState('history', 'Belum ada data', 'Tidak ada riwayat pada kategori ini.');
    return `<div class="table-wrap"><table class="att-table"><thead><tr><th>Tanggal</th><th>Mapel</th><th>Topik</th><th>Waktu</th><th>Status</th><th></th></tr></thead><tbody>
      ${rows.map(s => {
        const r = rec[s.id], m = ATT[r.status];
        const corr = DB.corrections.find(k => k.studentId === me.id && k.sessionId === s.id);
        const act = corr ? badge(corr.status === 'pending' ? 'Koreksi diproses' : corr.status === 'approved' ? 'Koreksi disetujui' : 'Koreksi ditolak', corr.status === 'pending' ? 'neutral' : corr.status === 'approved' ? 'success' : 'danger')
          : ['alpa', 'terlambat'].includes(r.status) ? `<button class="btn btn-sm btn-ghost" data-correct="${s.id}">Ajukan koreksi</button>` : '';
        return `<tr><td><b>${fmtDay(s.date)}</b></td><td>${stag(Q.subj(s.subjectId))}</td><td><a class="ellipsis" href="#/sesi/${s.id}" style="color:inherit">${esc(s.topic)}</a></td><td>${r.time ? r.time + ' WIB' : '—'}</td><td>${attMark(r.status)}</td><td style="text-align:right">${act}</td></tr>`;
      }).join('')}
    </tbody></table></div>`;
  },
  mount(root) {
    const me = Q.me();
    root.addEventListener('click', e => {
      const f = e.target.closest('[data-f]');
      if (f) { PresensiPel.filter = f.dataset.f; $$('[data-f]', root).forEach(x => x.classList.toggle('active', x === f)); $('#att-hist', root).innerHTML = this.history(me); return; }
      const k = e.target.closest('[data-correct]'); if (k) return openCorrection(k.dataset.correct);
    });
  },
};

/* ---------- Izin (satu pengajuan = satu sesi, lampiran opsional) ---------- */
const IzinState = { step: 1, sessionId: null, reason: '', note: '', file: '' };
const REASONS = ['Sakit', 'Keperluan keluarga', 'Kegiatan sekolah', 'Kendala transportasi', 'Lainnya'];
PelajarPages.izin = {
  title: 'Izin',
  render() {
    const me = Q.me();
    const allL = DB.leaves.filter(l => l.studentId === me.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    // Hanya pengajuan untuk sesi yang belum lewat yang aktif; sesi yang sudah lewat masuk arsip
    const mine = allL.filter(l => !leaveEnded(l)), arsip = allL.filter(leaveEnded);
    const wali = Q.waliOf(me);
    const steps = ['Pilih satu sesi', 'Alasan', 'Lampiran & kirim'];
    return `
    <div class="page-head"><div><h1>Pengajuan Izin</h1><p>Satu pengajuan berlaku untuk <b>satu sesi</b> dan wajib menyertakan <b>lampiran bukti</b>. Jika disetujui, status presensi sesi tersebut otomatis menjadi “Izin”. Jika ditolak atau tidak ditindak sampai sesi selesai, tercatat <b>Tidak hadir</b>.</p></div></div>
    <div class="flow">
      <span class="flow-step"><i>1</i> Pelajar mengisi formulir</span><span class="arrow">${icon('arrowRight', 14)}</span>
      <span class="flow-step"><i>2</i> Wali Kelas terima / tolak</span><span class="arrow">${icon('arrowRight', 14)}</span>
      <span class="flow-step"><i>3</i> Kurikulum memutuskan (bila diterima)</span><span class="arrow">${icon('arrowRight', 14)}</span>
      <span class="flow-step"><i>${icon('check', 12)}</i> Presensi diperbarui</span>
    </div>
    <div class="cols cols-3-2">
      <div class="card">
        <div class="card-head"><h3>Formulir izin</h3><span class="muted small">Langkah ${IzinState.step} dari 3</span></div>
        <div class="stepper">${steps.map((s, i) => `<div class="step ${i + 1 < IzinState.step ? 'done' : i + 1 === IzinState.step ? 'active' : ''}"><div class="bar-line"></div><span>${s}</span></div>`).join('')}</div>
        ${this.step(me, wali)}
      </div>
      <div class="card">
        <div class="card-head"><h3>${icon('history', 16)} Riwayat pengajuan</h3>${badge(mine.length + ' pengajuan', 'neutral', 'no-dot')}</div>
        ${mine.length ? mine.map((l, i) => this.leaveCard(l, i === 0)).join('') : emptyState('clipboard', 'Belum ada pengajuan aktif', 'Pengajuan untuk sesi yang belum lewat akan muncul di sini.')}
        ${arsip.length ? `<details class="mt"><summary class="small" style="cursor:pointer;font-weight:700">${icon('history', 14)} Arsip (${arsip.length}) · sesi sudah lewat</summary><div style="margin-top:10px">${arsip.map(l => this.leaveCard(l, false)).join('')}</div></details>` : ''}
      </div>
    </div>`;
  },
  leaveCard(l, open) {
    const s = Q.session(l.sessionId), sb = Q.subj(s.subjectId), m = LEAVE[l.status];
    return `<div class="leave-card">
      <div class="leave-head"><div><b>${esc(sb.code)} · ${esc(s.topic)}</b><span>${fmtDay(s.date)}, ${s.start}–${s.end}</span></div>${badge(m.short, m.tone)}</div>
      <p class="leave-reason"><b>${esc(l.reason)}</b> — ${esc(l.note)}</p>
      ${l.file ? `<span class="file-chip">${icon('clip', 14)}<span>${esc(l.file)}</span></span>` : ''}
      ${['ditolak', 'kedaluwarsa'].includes(l.status) ? `<div class="note warning" style="margin-top:8px">${icon('alert', 15)}<span>Presensi sesi ini tercatat <b>Tidak hadir</b>.</span></div>` : ''}
      <details ${open ? 'open' : ''}><summary>${icon('activity', 14)} Lini masa verifikasi</summary>${leaveTimeline(l)}</details>
    </div>`;
  },
  step(me, wali) {
    const S = IzinState;
    const used = DB.leaves.filter(l => l.studentId === me.id && l.status !== 'ditolak').map(l => l.sessionId);
    if (S.step === 1) {
      const options = Q.sessionsOf([me.groupId]).filter(s => Q.isUpcoming(s) && !used.includes(s.id)).slice(0, 10);
      return `<p class="muted small" style="margin-bottom:12px">Pilih <b>satu</b> sesi yang tidak dapat kamu hadiri. Ajukan paling lambat <b>${DB.settings.leaveDeadline}</b> sebelum sesi dimulai. Butuh izin untuk beberapa sesi? Ajukan satu per satu.</p>
        <div class="radio-list">${options.map(s => { const sb = Q.subj(s.subjectId); return `<label class="radio-card ${S.sessionId === s.id ? 'active' : ''}"><input type="radio" name="iz-sess" value="${s.id}" ${S.sessionId === s.id ? 'checked' : ''}><span class="pick-bar" style="--c:${sb.color}"></span><div class="pick-body"><b>${esc(sb.code)} · ${esc(s.topic)}</b><span>${fmtDay(s.date)} · ${s.start}–${s.end} · ${esc(s.tutor)}</span></div>${badge(relDay(s.date), dayDiff(s.date) <= 0 ? 'accent' : 'neutral', 'no-dot')}</label>`; }).join('') || emptyState('calendar', 'Tidak ada sesi yang bisa diajukan')}</div>
        <div class="step-actions"><span></span><button class="btn btn-primary" data-izin="next">Lanjut ${icon('arrowRight', 16)}</button></div>`;
    }
    if (S.step === 2) {
      return `<div class="field"><span>Alasan izin</span><div class="reason-grid">${REASONS.map(r => `<button type="button" class="chip ${S.reason === r ? 'active' : ''}" data-reason="${r}">${r}</button>`).join('')}</div></div>
        <label class="field mt"><span>Keterangan tambahan</span><textarea id="iz-note" placeholder="Jelaskan alasanmu secara singkat dan jelas…" maxlength="400">${esc(S.note)}</textarea><small class="muted small" style="text-align:right"><span id="iz-count">${S.note.length}</span>/400</small></label>
        <div class="step-actions"><button class="btn btn-ghost" data-izin="back">${icon('left', 16)} Kembali</button><button class="btn btn-primary" data-izin="next">Lanjut ${icon('arrowRight', 16)}</button></div>`;
    }
    const s = Q.session(S.sessionId), sb = Q.subj(s.subjectId);
    return `<div class="field" id="iz-file-field"><span>Lampiran bukti <span class="text-danger">(wajib)</span></span>${dropzone('iz-file', 'Surat dokter, surat dispensasi, undangan, dll.')}<small class="field-err" id="iz-file-err"></small></div>
      <div class="card mt" style="background:var(--surface-2)">
        <div class="card-head" style="margin-bottom:6px"><h3>Ringkasan pengajuan</h3></div>
        <div class="kv">
          <div><span>Kelompok Kelas</span><b>${esc(Q.grp(me.groupId).name)}</b></div>
          <div><span>Mata Pelajaran</span><b>${esc(sb.name)}</b></div>
          <div><span>Sesi</span><b>${esc(s.topic)}</b></div>
          <div><span>Tanggal</span><b>${fmtDay(s.date)}, ${s.start}–${s.end}</b></div>
          <div><span>Alasan</span><b>${esc(S.reason)}</b></div>
          <div><span>Keterangan</span><b style="max-width:60%">${esc(S.note)}</b></div>
          <div><span>Lampiran</span><b>${S.file ? esc(S.file) : '<span class="text-danger">Belum dilampirkan</span>'}</b></div>
        </div>
      </div>
      <div class="note primary">${icon('shield', 15)}<span>Pengajuan diputuskan dulu oleh Wali Kelas <b>${esc(wali)}</b>. Jika diterima, diteruskan ke Kurikulum untuk keputusan akhir. Jika ditolak atau tidak ditindak sampai sesi selesai, kamu tercatat <b>Tidak hadir</b>.</span></div>
      <div class="step-actions"><button class="btn btn-ghost" data-izin="back">${icon('left', 16)} Kembali</button><button class="btn btn-primary" data-izin="submit">${icon('send', 16)} Kirim pengajuan</button></div>`;
  },
  mount(root) {
    const me = Q.me();
    const dz = $('#iz-file', root);
    if (dz) {
      if (IzinState.file) { dz.classList.add('has-file'); dz.querySelector('b').textContent = IzinState.file; }
      bindDropzone(dz, f => { IzinState.file = f.name; App.refresh(); });
    }
    root.addEventListener('change', e => { if (e.target.name === 'iz-sess') { IzinState.sessionId = e.target.value; $$('.radio-card', root).forEach(r => r.classList.toggle('active', r.contains(e.target))); } });
    root.addEventListener('input', e => { if (e.target.id === 'iz-note') { IzinState.note = e.target.value; $('#iz-count', root).textContent = e.target.value.length; } });
    root.addEventListener('click', e => {
      const r = e.target.closest('[data-reason]');
      if (r) { IzinState.reason = r.dataset.reason; $$('[data-reason]', root).forEach(x => x.classList.toggle('active', x === r)); return; }
      const b = e.target.closest('[data-izin]'); if (!b) return;
      const act = b.dataset.izin;
      if (act === 'back') { IzinState.step--; return App.refresh(); }
      if (act === 'next') {
        if (IzinState.step === 1 && !IzinState.sessionId) return toast('Pilih satu sesi yang ingin diajukan izin.', 'error');
        if (IzinState.step === 2) {
          if (!IzinState.reason) return toast('Pilih alasan izin terlebih dahulu.', 'error');
          if (IzinState.note.trim().length < 10) return toast('Keterangan minimal 10 karakter.', 'error');
        }
        IzinState.step++; return App.refresh();
      }
      if (act === 'submit') {
        if (!IzinState.file) { $('#iz-file-field', root).classList.add('invalid'); $('#iz-file-err', root).textContent = 'Lampiran bukti wajib diunggah.'; return toast('Lampirkan bukti izin terlebih dahulu.', 'error'); }
        b.classList.add('loading');
        setTimeout(() => {
          DB.leaves.push({ id: 'L' + Date.now(), studentId: me.id, sessionId: IzinState.sessionId, reason: IzinState.reason, note: IzinState.note.trim(), file: IzinState.file, createdAt: stamp(), status: 'wali', waliDecision: '', expiredAt: '',
            waliNote: '', waliRec: '', waliBy: '', waliAt: '', decisionNote: '', decisionBy: '', decisionAt: '' });
          DB.notifications.panitia.unshift({ title: 'Pengajuan izin baru', text: `${me.name} · ${IzinState.reason}`, at: stamp(), unread: true, icon: 'clipboard' });
          Object.assign(IzinState, { step: 1, sessionId: null, reason: '', note: '', file: '' });
          toast(`Pengajuan terkirim ke Wali Kelas (${esc(Q.waliOf(me))}).`);
          App.refresh();
        }, 700);
      }
    });
  },
};

/* ---------- Laporan Perkembangan ---------- */
PelajarPages.laporan = {
  title: 'Laporan Perkembangan',
  render() {
    const me = Q.me();
    const st = Q.attStats(me.id);
    const tasks = Q.myTasks();
    const graded = tasks.filter(a => a.my.status === 'dinilai');
    const done = tasks.filter(a => a.my.status !== 'belum').length;
    const tos = DB.tryouts;
    const last = tos[tos.length - 1], prev = tos[tos.length - 2];
    const rec = Q.attOf(me.id);
    const perSubj = Q.subjectsOfGroup(me.groupId).map(sb => {
      const ss = Q.sessionsOf([me.groupId]).filter(s => s.subjectId === sb.id && rec[s.id] && s.date <= todayStr());
      const ok = ss.filter(s => ['hadir', 'terlambat'].includes(rec[s.id].status)).length;
      return { sb, pct: ss.length ? Math.round(ok / ss.length * 100) : 0, n: ss.length };
    });
    const subs = Object.keys(last.scores);
    const SUB_NAME = { PU: 'Penalaran Umum', PPU: 'Pengetahuan & Pemahaman Umum', PBM: 'Pemahaman Bacaan & Menulis', PK: 'Pengetahuan Kuantitatif', LBI: 'Literasi B. Indonesia', LBE: 'Literasi B. Inggris', PM: 'Penalaran Matematika' };
    return `
    <div class="page-head">
      <div><h1>Laporan Perkembangan</h1><p>Pantau kehadiran per mata pelajaran, nilai tugas, hasil tryout eksternal, dan catatan evaluasi dari tutor & Wali Kelas.</p></div>
      <div class="actions"><button class="btn btn-ghost" data-pdf>${icon('download', 16)} Unduh laporan</button></div>
    </div>
    <div class="stats">
      ${statCard('checkCircle', st.pct + '%', 'Kehadiran', 'success', `${st.total} sesi tercatat`)}
      ${statCard('target', Q.taskAvg(me.id), 'Rata-rata nilai tugas', 'primary', `${graded.length} tugas dinilai`)}
      ${statCard('file', `${done}/${tasks.length}`, 'Tugas terkumpul', 'info', `${tasks.length ? Math.round(done / tasks.length * 100) : 0}% progres`)}
      ${statCard('trending', Q.toAvg(last), 'Rata-rata tryout', 'accent', `${trendMark(Q.toAvg(last) - Q.toAvg(prev))} dari TO sebelumnya`)}
    </div>
    <div class="cols cols-1-1">
      <div class="card">
        <div class="card-head"><h3>Grafik kehadiran</h3></div>
        ${attSummary(st)}
        <div class="divider"></div>
        <div class="card-head" style="margin-bottom:8px"><h3>Kehadiran per mata pelajaran</h3></div>
        ${perSubj.map(p => `<div style="margin-bottom:12px"><div class="row-between small" style="margin-bottom:6px"><span>${stag(p.sb)} ${esc(p.sb.name)}</span><span class="muted">${p.n} sesi</span></div>${progRow(p.pct, p.sb.color)}</div>`).join('')}
      </div>
      <div class="card">
        <div class="card-head"><h3>Tren nilai tugas</h3>${badge('Skala 0–100', 'neutral', 'no-dot')}</div>
        ${graded.length ? lineChart(graded.map(a => ({ label: a.title.split(' ').slice(0, 2).join(' '), value: a.my.score })), { min: 50, max: 100 }) : emptyState('chart', 'Belum ada nilai')}
        <div class="divider"></div>
        <div class="list">${tasks.map(a => { const sb = Q.subj(a.subjectId); return `<div class="item"><div class="item-ic code-ic" style="--c:${sb.color}">${esc(sb.code)}</div><div class="item-body"><div class="item-title">${esc(a.title)}</div><div class="item-sub">${esc(sb.name)}</div></div>${a.my.status === 'dinilai' ? `<b style="color:var(--success)">${a.my.score}</b>` : badge(TASK[a.my.status].label, TASK[a.my.status].tone)}</div>`; }).join('')}</div>
      </div>
    </div>
    <div class="cols cols-3-2">
      <div class="card">
        <div class="card-head"><h3>Performa tryout eksternal</h3><span class="muted small">Diinput oleh Kurikulum</span></div>
        ${lineChart(tos.map((t, i) => ({ label: 'TO #' + (i + 1), value: Q.toAvg(t) })), { min: 400, max: 700, color: '#a0336b', steps: 3 })}
        <div class="divider"></div>
        <div class="table-wrap"><table style="min-width:520px"><thead><tr><th>Subtes</th><th>${esc(prev.name.replace('Tryout Eksternal ', 'TO '))}</th><th>${esc(last.name.replace('Tryout Eksternal ', 'TO '))}</th><th>Perubahan</th></tr></thead><tbody>
          ${subs.map(k => { const d = last.scores[k] - prev.scores[k]; return `<tr><td><b>${k}</b><div class="muted small">${SUB_NAME[k]}</div></td><td>${prev.scores[k]}</td><td><b>${last.scores[k]}</b></td><td class="${d >= 0 ? 'text-success' : 'text-danger'}"><b>${trendMark(d)}</b></td></tr>`; }).join('')}
        </tbody></table></div>
      </div>
      <div class="card">
        <div class="card-head"><h3>${icon('edit', 16)} Catatan evaluasi</h3></div>
        ${DB.notes.map(n => `<div class="activity">${avatar(n.by, 'sm')}<div><p><b>${esc(n.by)}</b> <span class="muted small">· ${esc(n.role)}</span></p><p class="muted" style="margin:4px 0">${esc(n.text)}</p><time>${relDay(n.date)}</time></div></div>`).join('')}
      </div>
    </div>`;
  },
  mount(root) {
    root.addEventListener('click', e => { if (e.target.closest('[data-pdf]')) toast('Laporan sedang disiapkan untuk diunduh (demo).', 'info'); });
  },
};

/* ---------- Profil ---------- */
PelajarPages.profil = {
  title: 'Profil',
  render() {
    const me = Q.me(), g = Q.grp(me.groupId);
    const st = Q.attStats(me.id);
    return `
    <div class="page-head"><div><h1>Profil</h1><p>Informasi akun dan preferensi notifikasi.</p></div></div>
    <div class="cols cols-3-2">
      <div>
        <div class="card profile-card">
          ${avatar(me.name, 'lg')}
          <h2>${esc(me.name)}</h2>
          <p class="muted">${esc(me.email)}</p>
          <div class="role-chips" style="justify-content:center;margin-top:12px">${badge('Pelajar', 'primary', 'no-dot')}${badge(me.status, 'accent', 'no-dot')}${tag(g)}</div>
          <div class="stats" style="grid-template-columns:repeat(3,1fr);margin-top:20px">
            <div><b style="font-size:20px">${st.pct}%</b><div class="muted small">Kehadiran</div></div>
            <div><b style="font-size:20px">${Q.taskAvg(me.id)}</b><div class="muted small">Nilai</div></div>
            <div><b style="font-size:20px">${Q.subjectsOfGroup(me.groupId).length}</b><div class="muted small">Mapel</div></div>
          </div>
        </div>
        <div class="card mt">
          <div class="card-head"><h3>Data diri</h3><button class="btn btn-sm btn-ghost" data-edit-profile>${icon('edit', 14)} Ubah</button></div>
          <div class="kv">
            <div><span>Asal sekolah</span><b>${esc(me.school)}</b></div>
            <div><span>Status</span><b>${esc(me.status)}</b></div>
            <div><span>No. HP</span><b>${esc(me.phone)}</b></div>
            <div><span>Kelompok Kelas</span><b>${esc(g.name)}</b></div>
            <div><span>Wali Kelas</span><b>${esc(g.wali)}</b></div>
            <div><span>Bergabung</span><b>${fmtDate(me.joined, { day: 'numeric', month: 'long', year: 'numeric' })}</b></div>
          </div>
          <p class="muted small" style="margin-top:10px">Perpindahan Kelompok Kelas hanya dapat dilakukan oleh Kurikulum.</p>
        </div>
      </div>
      <div>
        <div class="card">
          <div class="card-head"><h3>Notifikasi</h3></div>
          ${[['Tugas baru & tenggat', 'Pengingat H-1 sebelum tenggat', true], ['Perubahan jadwal', 'Saat jadwal sesi berubah', true], ['Status izin', 'Pembaruan verifikasi dan keputusan', true], ['Pengumuman komunitas', 'Info dan agenda BAT', false]].map(([t, s, on]) => `<div class="setting-row"><div><b>${t}</b><small>${s}</small></div><label class="switch"><input type="checkbox" ${on ? 'checked' : ''} data-toggle><span></span></label></div>`).join('')}
        </div>
        <div class="card mt">
          <div class="card-head"><h3>Keamanan</h3></div>
          <div class="setting-row"><div><b>Kata sandi</b><small>Terakhir diubah 2 bulan lalu</small></div><button class="btn btn-sm btn-ghost" data-pw>${icon('lock', 14)} Ubah</button></div>
          <div class="setting-row"><div><b>Keluar dari akun</b><small>Akhiri sesi di perangkat ini</small></div><button class="btn btn-sm btn-danger" data-action="logout">${icon('logout', 14)} Keluar</button></div>
        </div>
      </div>
    </div>`;
  },
  mount(root) {
    root.addEventListener('change', e => { if (e.target.matches('[data-toggle]')) toast('Preferensi notifikasi disimpan.'); });
    root.addEventListener('click', e => {
      if (e.target.closest('[data-pw]')) openPasswordModal();
      if (e.target.closest('[data-edit-profile]')) {
        const me = Q.me();
        openModal({
          title: 'Ubah data diri',
          body: `<label class="field"><span>No. HP</span><input id="pf-phone" value="${esc(me.phone)}"></label><label class="field"><span>Asal sekolah</span><input id="pf-school" value="${esc(me.school)}"></label>`,
          footer: `<button class="btn btn-ghost" data-close>Batal</button><button class="btn btn-primary" id="pf-save">Simpan</button>`,
          onMount(m) { $('#pf-save', m).addEventListener('click', () => { me.phone = $('#pf-phone', m).value; me.school = $('#pf-school', m).value; closeModal(); toast('Data diri diperbarui.'); App.refresh(); }); },
        });
      }
    });
  },
};

function openPasswordModal() {
  openModal({
    title: 'Ubah kata sandi',
    body: `<label class="field"><span>Kata sandi lama</span><input type="password" id="pw-old"></label>
      <label class="field"><span>Kata sandi baru</span><input type="password" id="pw-new" placeholder="Minimal 6 karakter"><small class="field-err"></small></label>
      <label class="field"><span>Ulangi kata sandi baru</span><input type="password" id="pw-new2"><small class="field-err"></small></label>`,
    footer: `<button class="btn btn-ghost" data-close>Batal</button><button class="btn btn-primary" id="pw-save">Simpan</button>`,
    onMount(m) {
      $('#pw-save', m).addEventListener('click', () => {
        $$('.field', m).forEach(f => { f.classList.remove('invalid'); const er = f.querySelector('.field-err'); if (er) er.textContent = ''; });
        const a = $('#pw-new', m), b = $('#pw-new2', m);
        if (a.value.length < 6) return fieldErr(a, 'Minimal 6 karakter.');
        if (a.value !== b.value) return fieldErr(b, 'Kata sandi tidak sama.');
        closeModal(); toast('Kata sandi berhasil diubah (demo).');
      });
    },
  });
}
