/* =========================================================
   LMS BAT — Room Pertemuan (dipakai Panitia & Pelajar)
   Setiap sesi di Manajemen Jadwal otomatis menjadi satu room: #/sesi/<id>
   Isi room: Presensi (QR / tombol Hadir) · Materi · Tugas & Kuis.
   Setelah sesi selesai, room tetap bisa dibuka sebagai arsip dari jadwal.
   Prototipe: semua data di memori browser (DB), tanpa backend.
   ========================================================= */
const OPT_LETTER = ['A', 'B', 'C', 'D'];

const Room = {
  title: id => { const s = Q.session(id); return s ? `${Q.subj(s.subjectId).code} · ${s.topic}` : 'Room Pertemuan'; },
  crumb: () => 'Room Pertemuan',
  navAs: 'jadwal',

  /* ---------- Helper data ---------- */
  state(s) { return DB.rooms[s.id] || (DB.rooms[s.id] = { open: false, closed: false, code: '', attendees: [], openedAt: '', closedAt: '' }); },
  canAccess(s) {
    if (!s) return false;
    if (!App.isPanitia) { const me = Q.me(); return !!me && s.groupId === me.groupId; }
    return Q.seeAll() || Q.scopeSessions().includes(s);
  },
  canManage: s => App.isPanitia && Q.canRunSession(s),
  meetingNo: s => DB.sessions.filter(x => x.groupId === s.groupId && x.subjectId === s.subjectId).indexOf(s) + 1,
  phase(s) { return Q.state(s).key === 'selesai' ? 'arsip' : s.date === todayStr() ? 'hari-h' : 'mendatang'; },
  statusAt: (s, time) => toMin(time) <= toMin(s.start) + DB.settings.lateTolerance ? 'hadir' : 'terlambat',
  leaveOk: (s, sid) => DB.leaves.some(l => l.sessionId === s.id && l.studentId === sid && l.status === 'disetujui'),
  record: (s, sid) => (DB.attendance[sid] || {})[s.id],
  mats: s => DB.materials.filter(m => m.sessionId === s.id).sort((a, b) => b.date.localeCompare(a.date)),
  tasks: s => DB.assignments.filter(a => a.sessionId === s.id),
  newCode(rm) { rm.code = 'BAT-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Math.floor(Math.random() * 90 + 10); },

  /* Daftar hadir per pelajar.
     Room yang dibuka/ditutup → dari daftar hadir langsung; sesi lampau tanpa room → rekap dummy deterministik. */
  roster(s) {
    const members = Q.studentsOf(s.groupId), rm = this.state(s);
    const ov = st => { const r = this.record(s, st.id); return r ? { st, status: r.status, time: r.time, via: 'QR' } : this.leaveOk(s, st.id) ? { st, status: 'izin' } : null; };
    if (rm.open || rm.closed) return members.map(st => {
      const a = rm.attendees.find(x => x.id === st.id);
      if (a) return { st, status: a.status, time: a.time, via: a.via };
      if (this.leaveOk(s, st.id)) return { st, status: 'izin' };
      return { st, status: rm.closed ? 'alpa' : null };
    });
    if (this.phase(s) === 'arsip') {
      const r = sessionRecap(s), map = {};
      const order = members.slice().sort((a, b) => hashStr(s.id + a.id) - hashStr(s.id + b.id));
      let i = 0; const take = (n, k) => order.slice(i, i += n).forEach(st => { map[st.id] = k; });
      take(r.alpa, 'alpa'); take(r.izin, 'izin'); take(r.terlambat, 'terlambat');
      return members.map(st => {
        const o = ov(st); if (o) return o;
        const k = map[st.id] || 'hadir', h = hashStr(st.id + s.id);
        return { st, status: k, time: k === 'hadir' ? DB.addMin(s.start, -(h % 9)) : k === 'terlambat' ? DB.addMin(s.start, DB.settings.lateTolerance + 2 + h % 14) : null, via: ['hadir', 'terlambat'].includes(k) ? 'QR' : '' };
      });
    }
    return members.map(st => ov(st) || { st, status: null });
  },
  tally(list) {
    const c = { hadir: 0, terlambat: 0, izin: 0, alpa: 0, belum: 0 };
    list.forEach(r => { c[r.status || 'belum']++; });
    return { ...c, total: list.length, present: c.hadir + c.terlambat };
  },

  /* ---------- Render ---------- */
  render(id) {
    const s = Q.session(id);
    if (!this.canAccess(s)) return `<div class="card">${emptyState('calendar', 'Room pertemuan tidak ditemukan', 'Sesi ini tidak ada atau di luar cakupanmu.', `<a class="btn btn-ghost" href="#/jadwal">Kembali ke jadwal</a>`)}</div>`;
    if (TabMemory._room !== id) { TabMemory._room = id; delete TabMemory.room; }
    // Agar tombol kembali membuka minggu & hari sesi ini di jadwal
    JadwalState.sel = s.date;
    JadwalState.weekOffset = Math.floor((dayDiff(s.date) + (parseYMD(todayStr()).getDay() + 6) % 7) / 7);

    const g = Q.grp(s.groupId), sb = Q.subj(s.subjectId), rm = this.state(s), phase = this.phase(s);
    const manage = this.canManage(s), roster = this.roster(s), t = this.tally(roster);
    const mats = this.mats(s), tasks = this.tasks(s);
    const me = App.isPanitia ? null : Q.me();
    const mine = me ? roster.find(r => r.st.id === me.id) : null;
    const phaseBadge = rm.open ? badge('Presensi dibuka', 'danger') : phase === 'arsip' ? badge('Selesai · arsip', 'neutral') : phase === 'hari-h' ? badge(Q.state(s).label, Q.state(s).tone) : badge(relDay(s.date), 'primary');
    const toDo = me ? tasks.filter(a => a.my && a.my.status === 'belum').length : tasks.reduce((n, a) => n + a.submitted - a.graded, 0);

    return `
    <div class="class-hero" style="--c:${sb.color}">
      <a class="back" href="#/jadwal">${icon('left', 16)} Jadwal</a>
      <div class="row wrap" style="gap:6px;margin-top:10px">${stag(sb)}${tag(g)}${phaseBadge}${s.changed ? badge('Jadwal berubah', 'warning') : ''}${App.isPanitia && s.tutor === App.user.name ? badge('Sesi saya', 'primary', 'no-dot') : ''}</div>
      <h1>${esc(s.topic)}</h1>
      <p>${esc(sb.name)} · Pertemuan ke-${this.meetingNo(s)}</p>
      <div class="meta-row" style="margin-top:10px"><span>${icon('calendar', 14)} ${fmtDate(s.date)}</span><span>${icon('clock', 14)} ${s.start}–${s.end} WIB</span><span>${icon('pin', 14)} ${esc(s.location)}</span><span>${icon('user', 14)} ${esc(s.tutor)}</span></div>
      ${phase === 'arsip' ? `<div class="note info" style="margin:14px 0 0">${icon('history', 15)}<span>Pertemuan ini sudah selesai dan tersimpan sebagai <b>arsip</b>. Materi, rekap kehadiran, dan nilai tugas tetap bisa dibuka kapan saja dari jadwal.</span></div>` : ''}
    </div>
    <div class="stats">
      ${me ? statCard('checkCircle', mine && mine.status ? ATT[mine.status].label : '—', 'Kehadiranku', mine && mine.status ? ATT[mine.status].tone : 'neutral', mine && mine.time ? `${mine.time} WIB` : phase === 'arsip' ? '' : 'Belum presensi')
        : statCard('checkCircle', `${t.present}/${t.total}`, 'Pelajar hadir', 'success', `${t.izin} izin · ${t.alpa} tidak hadir${t.belum ? ` · ${t.belum} belum` : ''}`)}
      ${statCard('file', mats.length, 'Materi pertemuan', 'info')}
      ${statCard('clipboard', tasks.length, 'Tugas & kuis', 'accent')}
      ${statCard('alert', toDo, me ? 'Belum kukerjakan' : 'Perlu dinilai', 'warning')}
    </div>
    <div data-tab-scope>
      <div class="tabs" data-tabs="room" style="max-width:max-content">
        <button class="tab ${tabCls('room', 'presensi', true)}" data-tab="presensi">${icon('qr', 16)} Presensi ${rm.open ? '<span class="live-dot" style="margin-left:4px"></span>' : ''}</button>
        <button class="tab ${tabCls('room', 'materi')}" data-tab="materi">${icon('file', 16)} Materi <span class="muted">${mats.length}</span></button>
        <button class="tab ${tabCls('room', 'tugas')}" data-tab="tugas">${icon('clipboard', 16)} Tugas & Kuis <span class="muted">${tasks.length}</span></button>
      </div>
      <div class="tab-pane ${tabCls('room', 'presensi', true)}" data-pane="presensi">${App.isPanitia ? this.presensiPanitia(s, manage, roster) : this.presensiPelajar(s, mine, t)}</div>
      <div class="tab-pane ${tabCls('room', 'materi')}" data-pane="materi">${this.materiPane(s, manage, mats)}</div>
      <div class="tab-pane ${tabCls('room', 'tugas')}" data-pane="tugas">${this.tugasPane(s, manage, tasks)}</div>
    </div>`;
  },

  /* ---------- Presensi: panitia ---------- */
  presensiPanitia(s, manage, roster) {
    const rm = this.state(s), phase = this.phase(s);
    if (rm.open) return `<div class="cols cols-1-1">
      ${manage ? `<div class="card fullscreen-qr" id="rq-card">
        <div class="card-head"><h3><span class="live-dot"></span> Presensi dibuka</h3><button class="icon-btn" data-r="full" title="Layar penuh">${icon('expand', 18)}</button></div>
        <div class="qr-stage">
          <div class="qr-frame"><canvas id="rq-canvas" aria-label="QR Code presensi"></canvas></div>
          <div class="qr-code" id="rq-code">${esc(rm.code)}</div>
          <div class="qr-timer"><span>QR diperbarui dalam <b id="rq-sec">${DB.settings.qrRefresh}</b> dtk</span><div class="progress thin"><span id="rq-bar" style="width:100%"></span></div></div>
          <p class="muted small" style="text-align:center">Pelajar di room ini dapat memindai QR atau menekan tombol <b>Hadir</b>. Batas tepat waktu ${DB.addMin(s.start, DB.settings.lateTolerance)} WIB.</p>
          <div class="row wrap" style="justify-content:center"><button class="btn btn-ghost" data-r="qr">${icon('refresh', 16)} Perbarui QR</button><button class="btn btn-danger" data-r="close">${icon('xCircle', 16)} Tutup presensi</button></div>
        </div>
      </div>` : `<div class="card">${emptyState('eye', 'Presensi sedang berlangsung', `Dibuka oleh ${esc(s.tutor)} / Kurikulum. Kamu dapat memantau daftar hadir.`)}</div>`}
      <div class="card" id="rm-live">${this.liveList(s, manage)}</div>
    </div>`;
    let head = '';
    if (phase === 'hari-h' && !rm.closed) head = manage
      ? `<div class="card" style="margin-bottom:16px"><div class="row-between wrap" style="gap:12px"><div><b>Presensi belum dibuka</b><p class="muted small" style="margin-top:4px">Buka presensi saat kelas dimulai untuk menampilkan QR Code. Pelajar juga dapat menekan tombol Hadir di room ini.</p></div><button class="btn btn-primary" data-r="open">${icon('qr', 16)} Buka presensi & tampilkan QR</button></div></div>`
      : `<div class="note info" style="margin:0 0 16px">${icon('clock', 15)}<span>Presensi belum dibuka oleh tutor sesi.</span></div>`;
    if (phase === 'mendatang') head = `<div class="note info" style="margin:0 0 16px">${icon('calendar', 15)}<span>Presensi dapat dibuka pada hari H (${fmtDay(s.date)}, ${s.start} WIB).</span></div>`;
    if (rm.closed) head = `<div class="note success" style="margin:0 0 16px">${icon('checkCircle', 15)}<span>Presensi ditutup ${rm.closedAt ? fmtStamp(rm.closedAt) : ''}. Pelajar tanpa presensi & tanpa izin tercatat <b>Tidak hadir</b>.</span></div>`;
    return head + this.recapTable(s, roster);
  },
  liveList(s, manage) {
    const roster = this.roster(s), t = this.tally(roster), rm = this.state(s);
    const order = rm.attendees.map(a => roster.find(r => r.st.id === a.id)).filter(Boolean).reverse();
    const notYet = roster.filter(r => !r.status);
    return `<div class="card-head"><h3>${icon('users', 16)} Daftar hadir <span class="live-dot" style="margin-left:4px"></span></h3><span class="muted small">Real-time</span></div>
      <div class="live-stats"><div><b style="color:var(--success)">${t.hadir}</b><span>Hadir</span></div><div><b style="color:var(--warning)">${t.terlambat}</b><span>Terlambat</span></div><div><b>${t.belum}</b><span>Belum</span></div></div>
      <div class="live-list list">${order.length ? order.map(r => this.personRow(r)).join('') : emptyState('scan', 'Menunggu pelajar…', 'Nama pelajar muncul otomatis saat presensi.')}</div>
      ${notYet.length ? `<details style="margin-top:12px"><summary class="small" style="cursor:pointer;color:var(--primary);font-weight:700">Belum presensi (${notYet.length})${manage ? ' · tandai manual' : ''}</summary>
        <div class="list" style="margin-top:8px">${notYet.map(r => `<div class="item">${avatar(r.st.name, 'xs')}<div class="item-body"><div class="item-title">${esc(r.st.name)}</div></div>${manage ? `<button class="btn btn-sm btn-ghost" data-manual="${r.st.id}">Tandai hadir</button>` : ''}</div>`).join('')}</div></details>` : ''}`;
  },
  personRow: r => `<div class="item">${avatar(r.st.name, 'sm')}<div class="item-body"><div class="item-title">${esc(r.st.name)}</div><div class="item-sub">${r.time ? r.time + ' WIB' : '—'}${r.via ? ' · ' + esc(r.via) : ''}</div></div>${r.status ? badge(ATT[r.status].label, ATT[r.status].tone) : badge('Belum', 'neutral')}</div>`,
  recapTable(s, roster) {
    const t = this.tally(roster);
    return `<div class="card">
      <div class="card-head"><h3>Rekap kehadiran pertemuan</h3><span class="muted small">${t.present} dari ${t.total} pelajar hadir</span></div>
      <div class="row wrap" style="gap:8px;margin-bottom:12px">${badge(`${t.hadir} hadir`, 'success')}${badge(`${t.terlambat} terlambat`, 'warning')}${badge(`${t.izin} izin`, 'info')}${badge(`${t.alpa} tidak hadir`, 'danger')}${t.belum ? badge(`${t.belum} belum`, 'neutral') : ''}</div>
      <div class="table-wrap"><table><thead><tr><th>Pelajar</th><th>Status</th><th>Waktu</th><th>Cara</th></tr></thead><tbody>
        ${roster.map(r => `<tr><td><div class="cell-user">${avatar(r.st.name, 'sm')}<div><b>${esc(r.st.name)}</b></div></div></td><td>${r.status ? badge(ATT[r.status].label, ATT[r.status].tone) : badge('Belum', 'neutral')}</td><td>${r.time ? r.time + ' WIB' : '—'}</td><td class="muted small">${esc(r.via || (r.status === 'izin' ? 'Izin disetujui' : '—'))}</td></tr>`).join('') || `<tr><td colspan="4">${emptyState('users', 'Belum ada anggota')}</td></tr>`}
      </tbody></table></div>
    </div>`;
  },

  /* ---------- Presensi: pelajar ---------- */
  presensiPelajar(s, mine, t) {
    const rm = this.state(s), phase = this.phase(s);
    let main;
    if (mine && mine.status && mine.status !== 'alpa' || (mine && mine.status === 'alpa' && phase === 'arsip')) {
      const m = ATT[mine.status];
      main = `<div class="scan-success"><div class="success-ic t-${m.tone}">${icon(mine.status === 'alpa' ? 'xCircle' : mine.status === 'izin' ? 'clipboard' : 'check', 36)}</div>
        <h3>${mine.status === 'izin' ? 'Izin disetujui' : mine.status === 'alpa' ? 'Tidak hadir' : 'Presensi tercatat!'}</h3>
        <div class="kv-inline"><div><span>Waktu</span><b>${mine.time ? mine.time + ' WIB' : '—'}</b></div><div><span>Status</span>${badge(m.label, m.tone)}</div></div>
        ${['alpa', 'terlambat'].includes(mine.status) ? `<p class="muted small">Ada kesalahan pencatatan? <button class="link" style="color:var(--primary);font-weight:700" data-correct="${s.id}">Ajukan koreksi</button></p>` : ''}</div>`;
    } else if (rm.closed) {
      main = emptyState('xCircle', 'Presensi sudah ditutup', 'Kamu tercatat tidak hadir pada pertemuan ini.', `<button class="btn btn-sm btn-ghost" data-correct="${s.id}">Ajukan koreksi</button>`);
    } else if (rm.open) {
      main = `<div style="text-align:center;padding:12px 0">
        <div class="success-ic t-primary">${icon('qr', 36)}</div>
        <h3 style="font-size:19px;font-weight:800">Presensi sedang dibuka</h3>
        <p class="muted" style="margin:6px 0 16px">Tekan <b>Hadir</b> atau pindai QR Code yang ditampilkan tutor. Batas tepat waktu pukul <b>${DB.addMin(s.start, DB.settings.lateTolerance)}</b> WIB.</p>
        <div class="row wrap" style="justify-content:center"><button class="btn btn-primary btn-lg" data-r="hadir">${icon('checkCircle', 18)} Hadir</button><button class="btn btn-ghost btn-lg" data-r="scan">${icon('scan', 18)} Pindai QR</button></div>
      </div>`;
    } else if (phase === 'hari-h') {
      main = emptyState('clock', 'Menunggu tutor membuka presensi', `Tombol Hadir akan muncul di sini setelah ${esc(s.tutor)} membuka presensi.`);
    } else {
      main = emptyState('calendar', 'Presensi dibuka di hari H', `${fmtDay(s.date)}, ${s.start} WIB. Tidak bisa hadir?`, `<a class="btn btn-sm btn-ghost" href="#/izin">Ajukan izin</a>`);
    }
    return `<div class="cols cols-3-2">
      <div class="card">${main}</div>
      <div class="card"><div class="card-head"><h3>Rekap kelas</h3>${badge(`${t.total} pelajar`, 'neutral', 'no-dot')}</div>
        <div class="kv">
          <div><span>${badge('Hadir', 'success')}</span><b>${t.hadir}</b></div>
          <div><span>${badge('Terlambat', 'warning')}</span><b>${t.terlambat}</b></div>
          <div><span>${badge('Izin', 'info')}</span><b>${t.izin}</b></div>
          <div><span>${badge('Tidak hadir', 'danger')}</span><b>${t.alpa}</b></div>
          ${t.belum ? `<div><span>${badge('Belum presensi', 'neutral')}</span><b>${t.belum}</b></div>` : ''}
        </div></div>
    </div>`;
  },

  /* ---------- Materi ---------- */
  materiPane(s, manage, mats) {
    const sb = Q.subj(s.subjectId);
    return `<div class="${manage ? 'cols cols-3-2' : ''}">
      <div class="card"><div class="card-head"><h3>${icon('file', 16)} Materi pertemuan</h3><span class="muted small">${mats.length} berkas</span></div>
        <div class="list">${mats.map(m => `<div class="item"><div class="item-ic" style="--c:${MAT_COLOR[m.type]}">${icon(MAT_ICON[m.type], 18)}</div><div class="item-body"><div class="item-title">${esc(m.title)}</div><div class="item-sub">${m.type === 'Link' ? 'Tautan' : m.type} · ${esc(m.size)} · ${esc(m.by)} · ${fmtShort(m.date)}</div></div><button class="btn btn-sm btn-ghost" data-dl="${esc(m.title)}">${icon(m.type === 'Link' ? 'link' : 'download', 14)} ${m.type === 'Link' ? 'Buka' : 'Unduh'}</button></div>`).join('')
          || emptyState('file', 'Belum ada materi', manage ? 'Unggah slide, rumus cepat, atau tautan rekaman kelas.' : 'Materi dari tutor akan muncul di sini.')}</div>
        <p class="muted small" style="margin-top:10px">Materi juga tersedia di menu Materi dan Tugas › ${esc(sb.code)}.</p>
      </div>
      ${manage ? `<div class="card"><div class="card-head"><h3>${icon('upload', 16)} Unggah ke room</h3></div>
        <div class="form-grid">
          <label class="field"><span>Jenis</span><select id="rm-type"><option value="PDF">PDF / modul</option><option value="PPT">Slide (PPT)</option><option value="Video">Video</option><option value="Link">Tautan rekaman / link</option></select></label>
          <label class="field"><span>Judul</span><input id="rm-title" placeholder="cth. Slide ${esc(s.topic)}"><small class="field-err"></small></label>
          <div class="field" id="rm-file-wrap"><span>Berkas</span>${dropzone('rm-file', 'PDF, PPT, MP4 · maks. 50 MB')}</div>
          <label class="field hidden" id="rm-url-wrap"><span>URL</span><input id="rm-url" placeholder="https://…"><small class="field-err"></small></label>
          <button class="btn btn-primary btn-block" data-r="upload">${icon('upload', 16)} Unggah materi</button>
        </div></div>` : ''}
    </div>`;
  },

  /* ---------- Tugas & kuis ---------- */
  tugasPane(s, manage, tasks) {
    const me = App.isPanitia ? null : Q.me();
    const head = manage ? `<div class="row wrap" style="gap:10px;margin-bottom:14px"><button class="btn btn-primary" data-r="task">${icon('plus', 16)} Sematkan tugas rumah</button><button class="btn btn-ghost" data-r="quiz">${icon('target', 16)} Buat kuis singkat</button></div>` : '';
    if (!tasks.length) return head + `<div class="card">${emptyState('clipboard', 'Belum ada tugas atau kuis', manage ? 'Sematkan kuis singkat atau tugas rumah untuk topik pertemuan ini.' : 'Tugas atau kuis dari tutor untuk pertemuan ini akan muncul di sini.')}</div>`;
    return head + tasks.map(a => {
      const quiz = a.kind === 'kuis', open = dayDiff(a.deadline) > 0 || (dayDiff(a.deadline) === 0 && a.time >= nowHM());
      const kind = quiz ? badge(`Kuis · ${a.questions.length} soal`, 'accent', 'no-dot') : badge('Tugas rumah', 'primary', 'no-dot');
      if (me) {
        const my = a.my || { status: 'belum' }, m = TASK[my.status];
        return `<div class="task"><div class="task-main"><div class="task-top">${kind}${badge(m.label, m.tone)}${my.status === 'belum' && !open ? badge('Tenggat lewat', 'danger') : ''}</div>
          <h4>${esc(a.title)}</h4><p>${esc(a.desc)}</p>
          <div class="meta-row"><span>${icon('clock', 14)} Tenggat ${fmtDay(a.deadline)}, ${a.time}</span><span>${icon('user', 14)} ${esc(a.by)}</span></div></div>
          <div class="task-side">${my.status === 'dinilai' ? `<div class="score"><b>${my.score}</b><span>/100</span></div>` : '<span></span>'}
            ${my.status === 'belum' ? `<button class="btn btn-primary btn-sm" data-do="${a.id}">${icon(quiz ? 'target' : 'upload', 14)} ${quiz ? 'Kerjakan kuis' : 'Kumpulkan'}</button>` : `<button class="btn btn-ghost btn-sm" data-see="${a.id}">${icon('eye', 14)} ${my.status === 'dinilai' ? 'Lihat nilai' : 'Lihat pengumpulan'}</button>`}</div></div>`;
      }
      const n = Q.assignTotal(a), need = a.submitted - a.graded;
      return `<div class="task"><div class="task-main"><div class="task-top">${kind}${open ? badge('Aktif', 'success') : badge('Tenggat lewat', 'neutral')}${need > 0 ? badge(`${need} perlu dinilai`, 'warning') : ''}</div>
        <h4>${esc(a.title)}</h4><p>${esc(a.desc)}</p>
        <div class="meta-row"><span>${icon('clock', 14)} Tenggat ${fmtDay(a.deadline)}, ${a.time}</span><span>${icon('user', 14)} ${esc(a.by)}</span></div>
        <div style="margin-top:12px;max-width:360px"><div class="row-between small muted" style="margin-bottom:4px"><span>${quiz ? 'Mengerjakan' : 'Dikumpul'}</span><b>${a.submitted}/${n}</b></div>${progress(n ? Math.round(a.submitted / n * 100) : 0, 'var(--info)')}</div></div>
        <div class="task-side"><span></span><button class="btn ${need > 0 ? 'btn-primary' : 'btn-ghost'} btn-sm" data-grade="${a.id}">${icon(quiz ? 'eye' : 'check', 14)} ${quiz ? 'Hasil kuis' : 'Periksa'}${need > 0 ? ` (${need})` : ''}</button></div></div>`;
    }).join('');
  },

  /* ---------- Interaksi ---------- */
  mount(root, id) {
    const s = Q.session(id);
    if (!this.canAccess(s)) return;
    bindTabs(root);
    const rm = this.state(s), manage = this.canManage(s);
    if (rm.open && manage) this.startLive(root, s);
    const dz = $('#rm-file', root);
    let upFile = null;
    if (dz) bindDropzone(dz, f => { upFile = f; if (!$('#rm-title', root).value) $('#rm-title', root).value = f.name.replace(/\.[^.]+$/, ''); });
    const ty = $('#rm-type', root);
    if (ty) ty.addEventListener('change', () => { const link = ty.value === 'Link'; $('#rm-file-wrap', root).classList.toggle('hidden', link); $('#rm-url-wrap', root).classList.toggle('hidden', !link); });

    root.addEventListener('click', e => {
      const t = e.target;
      const d = t.closest('[data-dl]'); if (d) return toast(`Membuka “${d.dataset.dl}” (demo)`, 'info');
      const k = t.closest('[data-correct]'); if (k) return openCorrection(k.dataset.correct);
      const gr = t.closest('[data-grade]'); if (gr) return PanitiaPages.materi.gradeModal(gr.dataset.grade);
      const dn = t.closest('[data-do]');
      if (dn) { const a = DB.assignments.find(x => x.id === dn.dataset.do); return a.kind === 'kuis' ? this.quizModal(a) : PelajarPages.tugas.submitModal(a.id); }
      const se = t.closest('[data-see]');
      if (se) { const a = DB.assignments.find(x => x.id === se.dataset.see); return a.kind === 'kuis' ? this.quizResult(a) : PelajarPages.tugas.viewModal(a.id); }
      const mn = t.closest('[data-manual]');
      if (mn && manage) {
        const st = Q.student(mn.dataset.manual);
        this.addAttendee(s, { id: st.id, time: nowHM(), status: 'hadir', via: 'Ditandai manual' });
        DB.audit.unshift({ who: App.user.name, at: stamp(), what: `Menandai manual ${st.name} → Hadir (${this.label(s)})` });
        toast(`${esc(st.name)} ditandai hadir.`);
        const box = $('#rm-live', root); if (box) box.innerHTML = this.liveList(s, manage);
        return;
      }
      const r = t.closest('[data-r]'); if (!r) return;
      const act = r.dataset.r;
      if (act === 'open' && manage) {
        Object.assign(rm, { open: true, closed: false, openedAt: stamp() }); this.newCode(rm);
        DB.audit.unshift({ who: App.user.name, at: stamp(), what: `Membuka presensi ${this.label(s)}` });
        TabMemory.room = 'presensi';
        toast('Presensi dibuka. Tampilkan QR ke pelajar.'); return App.refresh();
      }
      if (act === 'close' && manage) return this.close(s);
      if (act === 'qr') { this.newCode(rm); this.drawQR(root, s); return toast('QR Code diperbarui.', 'info'); }
      if (act === 'full') { const el = $('#rq-card', root); if (document.fullscreenElement) document.exitFullscreen(); else if (el.requestFullscreen) el.requestFullscreen(); return; }
      if (act === 'hadir' || act === 'scan') return this.checkIn(r, s, act === 'scan' ? 'Pindai QR' : 'Tombol Hadir');
      if (act === 'upload') return this.upload(root, s, upFile);
      if (act === 'task') return this.taskModal(s);
      if (act === 'quiz') return this.quizBuilder(s);
    });
  },
  label(s) { return `${Q.grp(s.groupId).name} · ${Q.subj(s.subjectId).code} (${s.topic})`; },
  drawQR(root, s) {
    const c = $('#rq-canvas', root); if (!c) return;
    drawQR(c, this.state(s).code + s.id); $('#rq-code', root).textContent = this.state(s).code;
  },
  /* Simpan kehadiran ke room + catatan presensi pelajar yang punya riwayat nyata */
  addAttendee(s, a) {
    const rm = this.state(s);
    if (rm.attendees.some(x => x.id === a.id)) return;
    rm.attendees.push(a);
    if (DB.attendance[a.id]) DB.attendance[a.id][s.id] = { status: a.status, time: a.time };
  },
  startLive(root, s) {
    const rm = this.state(s);
    this.drawQR(root, s);
    let sec = DB.settings.qrRefresh;
    const timer = setInterval(() => {
      sec--;
      if (sec <= 0) { sec = DB.settings.qrRefresh; this.newCode(rm); this.drawQR(root, s); }
      const el = $('#rq-sec', root); if (el) el.textContent = sec;
      const bar = $('#rq-bar', root); if (bar) bar.style.width = (sec / DB.settings.qrRefresh * 100) + '%';
    }, 1000);
    // Simulasi pelajar lain memindai QR (akun demo pelajar tidak disimulasikan agar bisa dicoba sendiri)
    const demoIds = DB.accounts.filter(a => a.studentId).map(a => a.studentId);
    const members = Q.studentsOf(s.groupId);
    let simT;
    const sim = () => {
      if (!rm.open) return;
      const left = members.filter(st => !rm.attendees.some(a => a.id === st.id) && !this.leaveOk(s, st.id) && !demoIds.includes(st.id));
      if (left.length <= 1) return;
      const st = left[Math.floor(Math.random() * left.length)];
      const late = rm.attendees.length > members.length * 0.65 && Math.random() < 0.6;
      this.addAttendee(s, { id: st.id, time: nowHM(), status: late ? 'terlambat' : this.statusAt(s, nowHM()), via: Math.random() < 0.7 ? 'Pindai QR' : 'Tombol Hadir' });
      const box = $('#rm-live', root); if (box) box.innerHTML = this.liveList(s, true);
      simT = setTimeout(sim, 1800 + Math.random() * 2600);
    };
    simT = setTimeout(sim, 1500);
    Cleanup.add(() => { clearInterval(timer); clearTimeout(simT); });
  },
  close(s) {
    const rm = this.state(s);
    Object.assign(rm, { open: false, closed: true, closedAt: stamp() });
    const roster = this.roster(s), t = this.tally(roster);
    roster.forEach(r => { if (r.status === 'alpa' && DB.attendance[r.st.id]) DB.attendance[r.st.id][s.id] = { status: 'alpa', time: null }; });
    // Rekap sesi mengikuti hasil presensi nyata (dipakai dashboard & laporan)
    _recap[s.id] = { hadir: t.hadir, terlambat: t.terlambat, izin: t.izin, alpa: t.alpa, total: t.total, pct: t.total ? Math.round(t.present / t.total * 100) : 0 };
    DB.audit.unshift({ who: App.user.name, at: stamp(), what: `Menutup presensi ${this.label(s)} (${t.present}/${t.total} hadir)` });
    DB.activity.unshift({ who: App.user.name, what: 'menutup presensi', obj: `${Q.grp(s.groupId).name} · ${Q.subj(s.subjectId).code}`, at: stamp(), icon: 'qr' });
    toast(`Presensi ditutup. ${t.alpa} pelajar tanpa presensi & izin tercatat “Tidak hadir”.`, 'info');
    App.refresh();
  },
  checkIn(btn, s, via) {
    const me = Q.me(), rm = this.state(s);
    if (!rm.open) return toast('Presensi belum dibuka.', 'error');
    btn.classList.add('loading');
    setTimeout(() => {
      const time = nowHM(), status = this.statusAt(s, time);
      this.addAttendee(s, { id: me.id, time, status, via });
      Q.attOf(me.id)[s.id] = { status, time };
      DB.audit.unshift({ who: me.name, at: stamp(), what: `Presensi ${via} ${this.label(s)} → ${ATT[status].label}` });
      toast(status === 'hadir' ? 'Presensi berhasil! Status: Hadir.' : 'Presensi tercatat dengan status Terlambat.', status === 'hadir' ? 'success' : 'warning');
      App.refresh();
    }, via === 'Pindai QR' ? 1400 : 500);
  },
  upload(root, s, file) {
    const type = $('#rm-type', root).value, title = $('#rm-title', root).value.trim(), url = $('#rm-url', root).value.trim();
    fieldErr($('#rm-title', root), title ? '' : 'Judul wajib diisi.');
    if (type === 'Link') fieldErr($('#rm-url', root), /^https?:\/\/\S+/.test(url) ? '' : 'Masukkan URL yang valid (https://…).');
    if (!title || (type === 'Link' && !/^https?:\/\/\S+/.test(url))) return;
    if (type !== 'Link' && !file) return toast('Pilih berkas terlebih dahulu.', 'error');
    DB.materials.push({ id: 'm' + Date.now(), subjectId: s.subjectId, sessionId: s.id, title, type, url: type === 'Link' ? url : '', size: type === 'Link' ? 'Tautan' : `${(file.size / 1048576).toFixed(1)} MB`, date: todayStr(), by: App.user.name });
    DB.activity.unshift({ who: App.user.name, what: 'mengunggah materi', obj: title, at: stamp(), icon: 'upload' });
    this.notifyGroup(s, `Materi baru: ${title}`, `${Q.subj(s.subjectId).code} · ${s.topic}`, 'file');
    TabMemory.room = 'materi';
    toast('Materi diunggah ke room. Pelajar dapat langsung mengunduhnya.'); App.refresh();
  },
  notifyGroup(s, title, text, ic) {
    if (Q.studentsOf(s.groupId).some(st => st.id === 'p1')) DB.notifications.pelajar.unshift({ title, text, at: stamp(), unread: true, icon: ic });
  },
  newAssignment(s, extra) {
    const a = { id: 'a' + Date.now(), subjectId: s.subjectId, groupIds: [s.groupId], sessionId: s.id, by: App.user.name, createdAt: todayStr(), submitted: 0, graded: 0, ...extra };
    if (Q.studentsOf(s.groupId).some(st => st.id === 'p1')) a.my = { status: 'belum', score: null, file: null, submittedAt: null, feedback: '' };
    DB.assignments.push(a);
    DB.activity.unshift({ who: App.user.name, what: a.kind === 'kuis' ? 'menyematkan kuis' : 'menyematkan tugas', obj: a.title, at: stamp(), icon: 'file' });
    this.notifyGroup(s, `${a.kind === 'kuis' ? 'Kuis' : 'Tugas'} baru: ${a.title}`, `${Q.subj(s.subjectId).code} · Tenggat ${fmtShort(a.deadline)}, ${a.time}`, 'file');
    TabMemory.room = 'tugas';
    return a;
  },
  taskModal(s) {
    openModal({
      title: 'Sematkan tugas rumah', sub: `${Q.grp(s.groupId).name} · ${s.topic}`,
      body: `<label class="field"><span>Judul tugas</span><input id="rt-title" placeholder="cth. Latihan ${esc(s.topic)}"><small class="field-err"></small></label>
        <label class="field"><span>Instruksi</span><textarea id="rt-desc" placeholder="Jelaskan apa yang harus dikerjakan…"></textarea></label>
        <div class="form-grid two"><label class="field"><span>Tanggal tenggat</span><input type="date" id="rt-date" value="${DB.D(Math.max(0, dayDiff(s.date)) + 7)}"></label><label class="field"><span>Jam tenggat</span><input type="time" id="rt-time" value="23:59"></label></div>
        <div class="field"><span>Lampiran soal (opsional)</span>${dropzone('rt-file')}</div>`,
      footer: `<button class="btn btn-ghost" data-close>Batal</button><button class="btn btn-primary" id="rt-save">${icon('send', 16)} Sematkan</button>`,
      onMount: m => {
        bindDropzone($('#rt-file', m));
        $('#rt-save', m).addEventListener('click', () => {
          const title = $('#rt-title', m).value.trim();
          if (!title) return fieldErr($('#rt-title', m), 'Judul wajib diisi.');
          this.newAssignment(s, { kind: 'tugas', title, desc: $('#rt-desc', m).value.trim() || '-', deadline: $('#rt-date', m).value || DB.D(7), time: $('#rt-time', m).value || '23:59' });
          closeModal(); toast(`Tugas disematkan ke room & dikirim ke ${Q.studentsOf(s.groupId).length} pelajar.`); App.refresh();
        });
      },
    });
  },
  quizBuilder(s) {
    let uid = 0;
    const block = () => { const n = ++uid; return `<div class="quiz-q" data-q>
      <div class="row-between"><b class="small">Soal</b><button type="button" class="icon-btn" data-rmq title="Hapus soal">${icon('x', 16)}</button></div>
      <textarea data-qt placeholder="Tulis pertanyaan…" style="min-height:60px"></textarea>
      <div class="quiz-opts">${OPT_LETTER.map((L, j) => `<label class="quiz-opt"><input type="radio" name="qa-${n}" value="${j}" ${j === 0 ? 'checked' : ''} title="Tandai sebagai jawaban benar"><b>${L}</b><input data-opt placeholder="Pilihan ${L}"></label>`).join('')}</div>
    </div>`; };
    const defDate = s.date >= todayStr() ? s.date : todayStr();
    openModal({
      title: 'Buat kuis singkat', sub: `${Q.grp(s.groupId).name} · ${s.topic} · dinilai otomatis`, size: 'lg',
      body: `<div class="form-grid two">
          <label class="field span-2"><span>Judul kuis</span><input id="qz-title" value="Kuis singkat: ${esc(s.topic)}"><small class="field-err"></small></label>
          <label class="field"><span>Tanggal tenggat</span><input type="date" id="qz-date" value="${defDate}"></label>
          <label class="field"><span>Jam tenggat</span><input type="time" id="qz-time" value="${s.date >= todayStr() ? s.end : '23:59'}"></label>
        </div>
        <div class="note info" style="margin:0">${icon('check', 15)}<span>Pilih bulatan di depan pilihan yang benar. Minimal 2 pilihan terisi per soal.</span></div>
        <div id="qz-list">${block()}</div>
        <button type="button" class="btn btn-ghost btn-sm" id="qz-add">${icon('plus', 14)} Tambah soal</button>`,
      footer: `<button class="btn btn-ghost" data-close>Batal</button><button class="btn btn-primary" id="qz-save">${icon('send', 16)} Terbitkan kuis</button>`,
      onMount: m => {
        const renum = () => $$('[data-q]', m).forEach((q, i) => { q.querySelector('.row-between b').textContent = `Soal ${i + 1}`; });
        renum();
        $('#qz-add', m).addEventListener('click', () => { $('#qz-list', m).insertAdjacentHTML('beforeend', block()); renum(); });
        m.addEventListener('click', e => { const x = e.target.closest('[data-rmq]'); if (x && $$('[data-q]', m).length > 1) { x.closest('[data-q]').remove(); renum(); } });
        $('#qz-save', m).addEventListener('click', () => {
          const title = $('#qz-title', m).value.trim();
          fieldErr($('#qz-title', m), title ? '' : 'Judul wajib diisi.');
          let bad = false;
          const questions = $$('[data-q]', m).map(q => {
            const text = q.querySelector('[data-qt]').value.trim();
            const raw = $$('[data-opt]', q).map((i, j) => ({ v: i.value.trim(), j })).filter(o => o.v);
            const ansIdx = Number(q.querySelector('input[type=radio]:checked').value);
            const ok = text && raw.length >= 2 && raw.some(o => o.j === ansIdx);
            q.classList.toggle('invalid', !ok); if (!ok) bad = true;
            return { q: text, opts: raw.map(o => o.v), ans: raw.findIndex(o => o.j === ansIdx) };
          });
          if (bad) return toast('Lengkapi setiap soal: pertanyaan, minimal 2 pilihan, dan jawaban benar yang terisi.', 'error');
          if (!title) return;
          this.newAssignment(s, { kind: 'kuis', title, desc: `${questions.length} soal pilihan ganda, dinilai otomatis.`, deadline: $('#qz-date', m).value || defDate, time: $('#qz-time', m).value || '23:59', questions });
          closeModal(); toast(`Kuis ${questions.length} soal diterbitkan di room.`); App.refresh();
        });
      },
    });
  },
  quizModal(a) {
    openModal({
      title: a.title, sub: `${Q.subj(a.subjectId).code} · ${a.questions.length} soal · tenggat ${fmtDay(a.deadline)}, ${a.time}`, size: 'lg',
      body: a.questions.map((q, i) => `<div class="quiz-q" data-qi="${i}"><b>${i + 1}. ${esc(q.q)}</b>
        <div class="quiz-opts">${q.opts.map((o, j) => `<label class="quiz-opt answer"><input type="radio" name="ans-${i}" value="${j}"><b>${OPT_LETTER[j]}</b><span>${esc(o)}</span></label>`).join('')}</div></div>`).join(''),
      footer: `<button class="btn btn-ghost" data-close>Batal</button><button class="btn btn-primary" id="qa-send">${icon('send', 16)} Kirim jawaban</button>`,
      onMount: m => {
        $('#qa-send', m).addEventListener('click', () => {
          const answers = a.questions.map((_, i) => { const c = $(`input[name="ans-${i}"]:checked`, m); return c ? Number(c.value) : null; });
          $$('[data-qi]', m).forEach((q, i) => q.classList.toggle('invalid', answers[i] == null));
          if (answers.includes(null)) return toast('Jawab semua soal terlebih dahulu.', 'error');
          const right = answers.filter((v, i) => v === a.questions[i].ans).length;
          const score = Math.round(right / a.questions.length * 100);
          Object.assign(a.my, { status: 'dinilai', score, answers, submittedAt: stamp(), feedback: `Benar ${right} dari ${a.questions.length} soal (dinilai otomatis).` });
          a.submitted = Math.min(a.submitted + 1, Q.assignTotal(a)); a.graded = Math.min(a.graded + 1, a.submitted);
          if (a.subs) delete a.subs;
          closeModal(); toast(`Kuis terkirim. Nilaimu: ${score}.`); App.refresh();
        });
      },
    });
  },
  quizResult(a) {
    const my = a.my;
    openModal({
      title: a.title, sub: `${Q.subj(a.subjectId).code} · dinilai otomatis`, size: 'lg',
      body: `<div class="score-big"><b>${my.score}</b><div class="muted small" style="margin-top:6px">${esc(my.feedback)}</div></div>
        ${a.questions.map((q, i) => { const mine = (my.answers || [])[i], ok = mine === q.ans; return `<div class="quiz-q"><div class="row-between"><b>${i + 1}. ${esc(q.q)}</b>${badge(ok ? 'Benar' : 'Salah', ok ? 'success' : 'danger')}</div>
          <div class="quiz-opts">${q.opts.map((o, j) => `<div class="quiz-opt ${j === q.ans ? 'right' : j === mine ? 'wrong' : ''}"><b>${OPT_LETTER[j]}</b><span>${esc(o)}</span>${j === mine ? '<small class="muted">jawabanmu</small>' : ''}</div>`).join('')}</div></div>`; }).join('')}`,
      footer: `<button class="btn btn-primary" data-close>Tutup</button>`,
    });
  },
};

PanitiaPages.sesi = Room;
PelajarPages.sesi = Room;
