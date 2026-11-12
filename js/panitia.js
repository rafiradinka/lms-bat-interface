/* =========================================================
   LMS BAT — Halaman Panitia (menu menyesuaikan peran)
   Dashboard · Pelajar · Manajemen Kelas (Kelompok Kelas, Mata Pelajaran) · Jadwal ·
   Materi & Tugas · Presensi · Perizinan · Laporan · Pengguna & Peran · Pengaturan
   ========================================================= */
const PanitiaPages = {};

/* Pengajuan izin yang menunggu tindakan saya */
function myLeaveActions() {
  const out = [];
  if (App.has('wali')) { const w = Q.waliGroupIds(); out.push(...DB.leaves.filter(l => l.status === 'wali' && w.includes(Q.session(l.sessionId).groupId))); }
  if (App.has('kurikulum')) out.push(...DB.leaves.filter(l => l.status === 'kurikulum'));
  return out;
}
function scopeLeaves() {
  if (Q.seeAll()) return DB.leaves;
  const w = Q.waliGroupIds();
  return DB.leaves.filter(l => w.includes(Q.session(l.sessionId).groupId));
}
/* Wali Kelas (bukan admin): satu kelompok dampingan, antarmuka Kelompok Kelas langsung ke kelompoknya */
const isWaliOnly = () => !App.isAdmin && !!App.user && App.user.roles.includes('wali');
const roleBadges = u => u.roles.map(r => badge(DB.roles[r], r === 'admin' ? 'danger' : r === 'ketua' ? 'accent' : 'primary', 'no-dot')).join('');

/* ---------- Dashboard ---------- */
PanitiaPages.dashboard = {
  title: 'Dashboard',
  render() {
    const u = App.user;
    const groups = Q.myGroups();
    const students = Q.scopeStudents();
    const scopeSess = Q.scopeSessions();
    const todays = scopeSess.filter(s => s.date === todayStr());
    // Ringkasan kehadiran 7 hari terakhir: Σ pelajar hadir (hadir + terlambat) seluruh kelompok × mapel per hari / Σ pelajar seharusnya
    const days7 = dailyAttendance(scopeSess, 7);
    const week = aggAttendance(scopeSess.filter(s => dayDiff(s.date) >= -7 && dayDiff(s.date) < 0));
    const leaveAct = myLeaveActions();
    const toGrade = App.has('tutor', 'kurikulum') ? Q.myAssignments().filter(a => a.submitted > a.graded) : [];
    const corr = App.has('tutor', 'kurikulum') ? DB.corrections.filter(k => k.status === 'pending' && Q.canRunSession(Q.session(k.sessionId))) : [];
    const pendingAll = DB.leaves.filter(l => ['wali', 'kurikulum'].includes(l.status)).length;
    const monitorOnly = App.has('ketua') && !App.has('kurikulum', 'wali');
    // 3 pelajar dengan kehadiran terendah (global, pelajar aktif yang sudah punya catatan presensi)
    const lowest = Q.activeStudents().map(s => ({ s, st: Q.attStats(s.id) })).filter(x => x.st.total > 0)
      .sort((a, b) => a.st.pct - b.st.pct || a.s.name.localeCompare(b.s.name)).slice(0, 3);
    // Aktivitas pembelajaran: hanya aktivitas panitia
    const staffAct = DB.activity.filter(a => Q.staffByName(a.who));

    const actions = [
      ...leaveAct.map(l => { const st = Q.student(l.studentId); return { ic: 'clipboard', tone: 'var(--warning)', title: `${l.status === 'wali' ? 'Verifikasi' : 'Putuskan'} izin ${st.name}`, sub: `${l.reason} · ${Q.grp(st.groupId).name}`, go: 'perizinan', b: badge(l.status === 'wali' ? 'Wali Kelas' : 'Kurikulum', l.status === 'wali' ? 'warning' : 'info') }; }),
      ...toGrade.map(a => ({ ic: 'file', tone: 'var(--primary)', title: `Nilai ${a.submitted - a.graded} pengumpulan`, sub: `${a.title} · ${Q.subj(a.subjectId).code}`, go: 'materi/' + a.subjectId, b: badge('Penilaian', 'primary') })),
      ...corr.map(k => ({ ic: 'qr', tone: 'var(--info)', title: `Koreksi presensi ${Q.student(k.studentId).name}`, sub: `${k.type} · ${fmtDay(Q.session(k.sessionId).date)}`, go: 'presensi', b: badge('Koreksi', 'info') })),
    ];

    return `
    <div class="page-head">
      <div><p class="eyebrow">${fmtLong(todayStr())}</p><h1>${greeting()}, ${esc(firstName(u.name))}!</h1>
        <div class="role-chips" style="margin-top:8px">${roleBadges(u)}</div></div>
      ${App.has('kurikulum', 'tutor', 'wali') ? `<div class="actions"><button class="btn btn-ghost" data-ann>${icon('megaphone', 16)} Pengumuman</button></div>` : ''}
    </div>
    <div class="stats">
      ${statCard('users', students.length, Q.seeAll() ? 'Pelajar aktif' : 'Pelajar aktif di kelompokku', 'primary')}
      ${statCard('layers', groups.length, 'Kelompok Kelas', 'info', `${todays.length} sesi hari ini`)}
      ${statCard('checkCircle', week.pct == null ? '—' : week.pct + '%', 'Kehadiran 7 hari', 'success', `${week.present}/${week.expected} kehadiran · ${week.sessions} sesi`)}
      ${statCard('clipboard', monitorOnly ? pendingAll : leaveAct.length, monitorOnly ? 'Izin dalam proses' : 'Izin menunggu verifikasi', 'warning', monitorOnly ? 'Mode pantau' : 'Butuh tindakan')}
    </div>
    <div class="cols cols-3-2">
      <div class="card">
        <div class="card-head"><h3>${icon('calendar', 16)} ${App.has('tutor') && !Q.seeAll() ? 'Sesi saya hari ini' : 'Jadwal pembelajaran hari ini'}</h3><a class="link" href="#/jadwal">Kalender ${icon('right', 14)}</a></div>
        <div class="agenda">
          ${todays.length ? todays.map(s => {
            const g = Q.grp(s.groupId), sb = Q.subj(s.subjectId), st = Q.state(s), r = sessionRecap(s);
            return `<div class="agenda-item ${st.key === 'selesai' ? 'is-past' : ''}" style="--c:${sb.color}"><div class="agenda-time"><b>${s.start}</b><span>${s.end}</span></div>
              <div class="agenda-card"><div class="agenda-top">${stag(sb)}${tag(g)}${badge(st.label, st.tone)}</div><h4>${esc(s.topic)}</h4>
              <div class="meta-row"><span>${icon('pin', 14)} ${esc(s.location)}</span><span>${icon('user', 14)} ${esc(s.tutor)}</span><span>${icon('users', 14)} ${r.total} pelajar</span></div>
              <div class="agenda-actions"><a class="btn btn-sm ${st.key === 'selesai' ? 'btn-ghost' : 'btn-primary'}" href="#/sesi/${s.id}">${icon(st.key === 'selesai' ? 'history' : 'arrowRight', 14)} ${st.key === 'selesai' ? 'Buka arsip' : 'Masuk Kelas'}</a></div></div></div>`;
          }).join('') : emptyState('calendar', 'Tidak ada sesi hari ini', 'Cek kalender untuk jadwal berikutnya.')}
        </div>
      </div>
      <div class="card">
        <div class="card-head"><h3>${icon('bell', 16)} Notifikasi administrasi</h3>${actions.length ? badge(actions.length, 'danger', 'no-dot') : ''}</div>
        <div class="list">
          ${actions.length ? actions.slice(0, 7).map(a => `<a class="item clickable" href="#/${a.go}"><div class="item-ic" style="--c:${a.tone}">${icon(a.ic, 18)}</div><div class="item-body"><div class="item-title">${esc(a.title)}</div><div class="item-sub">${esc(a.sub)}</div></div>${a.b}</a>`).join('')
          : emptyState('checkCircle', monitorOnly ? 'Mode pantau' : 'Semua beres!', monitorOnly ? 'Ketua BAT memantau tanpa masuk alur persetujuan rutin.' : 'Tidak ada tindakan yang menunggu.')}
        </div>
      </div>
    </div>
    <div class="cols cols-3-2">
      <div class="card">
        <div class="card-head"><h3>${icon('chart', 16)} Ringkasan kehadiran 7 hari terakhir</h3>${badge('Hadir + terlambat', 'neutral', 'no-dot')}</div>
        ${barChart(days7.map(d => ({ label: fmtDate(d.date, { weekday: 'short', day: 'numeric' }), title: `${fmtDay(d.date)} · ${d.present}/${d.expected} pelajar hadir dari ${d.sessions} sesi`, value: d.pct, color: d.pct == null ? null : d.pct < 70 ? 'var(--danger)' : 'var(--ink)' })), { max: 100, suffix: '%' })}
        <p class="muted small" style="margin-top:10px">Per hari: total pelajar hadir di seluruh Kelompok Kelas &amp; mapel ÷ total pelajar yang seharusnya hadir hari itu. “—” = tidak ada sesi. Batang merah = kehadiran di bawah 70%.</p>
      </div>
      <div class="card">
        <div class="card-head"><h3>${icon('alert', 16)} Kehadiran terendah</h3>${badge('Global', 'neutral', 'no-dot')}</div>
        ${lowest.length ? `<div class="low-rank">${lowest.map((x, i) => `<div class="lr-item"><span class="lr-no">${i + 1}</span><div class="lr-body"><b>${esc(x.s.name)}</b>${progRow(x.st.pct, toneByPct(x.st.pct))}</div></div>`).join('')}</div>` : emptyState('users', 'Belum ada data kehadiran')}
      </div>
    </div>
    <div class="card mt">
      <div class="card-head"><h3>${icon('activity', 16)} Aktivitas pembelajaran panitia</h3></div>
      ${staffAct.length ? staffAct.slice(0, 6).map(a => `<div class="activity">${avatar(a.who, 'sm')}<div><p><b>${esc(a.who)}</b> ${a.what} <b>${esc(a.obj)}</b></p><time>${relStamp(a.at)}</time></div></div>`).join('') : emptyState('activity', 'Belum ada aktivitas')}
    </div>`;
  },
  mount(root) {
    root.addEventListener('click', e => { if (e.target.closest('[data-ann]')) Shared.announceModal(null); });
  },
};

/* ---------- Manajemen Pelajar ---------- */
const PelajarMgmt = { q: '', grp: 'all', st: 'on' };
/* Kata sandi acak untuk akun pelajar baru (tanpa karakter yang mirip: 0/O, 1/l/I) */
function genPassword(n = 10) {
  const cs = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const buf = new Uint32Array(n);
  (window.crypto || {}).getRandomValues ? crypto.getRandomValues(buf) : buf.forEach((_, i) => { buf[i] = Math.floor(Math.random() * 4294967296); });
  return Array.from(buf, x => cs[x % cs.length]).join('');
}
PanitiaPages.pelajar = {
  title: 'Manajemen Pelajar',
  /* Daftar pelajar dalam cakupan peran, termasuk yang nonaktif (khusus halaman ini) */
  pool() {
    if (Q.seeAll()) return DB.students;
    const ids = Q.myGroupIds();
    return DB.students.filter(s => ids.includes(s.groupId));
  },
  render() {
    const groups = Q.myGroups();
    const canPlace = Q.canPlace();
    const all = this.pool(), active = all.filter(Q.isActive), off = all.length - active.length;
    const scope = Q.seeAll() ? 'Seluruh pelajar BAT' : 'Pelajar di Kelompok Kelas yang kamu dampingi';
    const cnt = k => all.filter(s => k === 'all' || (k === 'on' ? Q.isActive(s) : !Q.isActive(s))).length;
    return `
    <div class="page-head">
      <div><h1>Manajemen Pelajar</h1></div>
      <div class="actions"><button class="btn btn-ghost" data-export>${icon('download', 16)} Ekspor</button>${canPlace ? `<button class="btn btn-primary" data-add>${icon('plus', 16)} Tambah pelajar</button>` : ''}</div>
    </div>
    <div class="stats">
      ${statCard('users', active.length, 'Pelajar aktif', 'primary', off ? `${off} nonaktif` : '')}
      ${statCard('book', active.filter(s => s.status === 'Kelas 12').length, 'Kelas 12', 'info')}
      ${statCard('flag', active.filter(s => s.status === 'Gap Year').length, 'Alumni / gap year', 'accent')}
      ${statCard('alert', active.filter(s => Q.attStats(s.id).total > 0 && Q.attStats(s.id).pct < 80).length, 'Kehadiran < 80%', 'danger')}
    </div>
    <div class="card">
      <div class="toolbar">
        <div class="search">${icon('search', 16)}<input class="input" id="pm-q" placeholder="Cari nama atau sekolah…" value="${esc(PelajarMgmt.q)}"></div>
        <select id="pm-grp" aria-label="Filter Kelompok Kelas"><option value="all">Semua Kelompok Kelas</option>${groups.map(g => `<option value="${g.id}" ${PelajarMgmt.grp === g.id ? 'selected' : ''}>${esc(g.name)}</option>`).join('')}</select>
        <div class="chips">${[['on', 'Aktif'], ['off', 'Nonaktif'], ['all', 'Semua']].map(([k, l]) => `<button class="chip ${PelajarMgmt.st === k ? 'active' : ''}" data-st="${k}">${l}<span class="cnt">${cnt(k)}</span></button>`).join('')}</div>
      </div>
      <div class="table-wrap"><table><thead><tr><th>Pelajar</th><th>Kelompok Kelas</th><th>Wali Kelas</th><th>Asal / status</th><th style="width:160px">Kehadiran</th><th>Nilai</th><th></th></tr></thead><tbody id="pm-body">${this.rows()}</tbody></table></div>
    </div>`;
  },
  rows() {
    const q = PelajarMgmt.q.toLowerCase(), canPlace = Q.canPlace(), stf = PelajarMgmt.st;
    const list = this.pool().filter(s => (stf === 'all' || (stf === 'on' ? Q.isActive(s) : !Q.isActive(s))) && (PelajarMgmt.grp === 'all' || s.groupId === PelajarMgmt.grp) && (s.name.toLowerCase().includes(q) || s.school.toLowerCase().includes(q)));
    if (!list.length) return `<tr><td colspan="7">${emptyState('users', 'Pelajar tidak ditemukan', 'Coba kata kunci atau filter lain.')}</td></tr>`;
    return list.map(s => {
      const pct = Q.attStats(s.id).pct, g = Q.grp(s.groupId), on = Q.isActive(s);
      return `<tr class="${on ? '' : 'row-muted'}"><td><div class="cell-user">${avatar(s.name, 'sm')}<div><b>${esc(s.name)}</b>${on ? '' : ` ${badge('Nonaktif', 'neutral')}`}<small>${esc(s.email)}</small></div></div></td>
        <td>${tag(g)}</td>
        <td>${esc(g.wali)}</td>
        <td>${esc(s.school)}<div class="muted small">${s.status}</div></td>
        <td>${progRow(pct, toneByPct(pct))}</td>
        <td><b>${Q.taskAvg(s.id)}</b></td>
        <td class="row-actions"><button class="btn btn-sm btn-ghost" data-detail="${s.id}">${icon('eye', 14)} Detail</button>${canPlace ? `<button class="btn btn-sm btn-ghost" data-edit="${s.id}" aria-label="Ubah ${esc(s.name)}">${icon('edit', 14)} Ubah</button>` : ''}</td></tr>`;
    }).join('');
  },
  mount(root) {
    $('#pm-q', root).addEventListener('input', e => { PelajarMgmt.q = e.target.value; $('#pm-body', root).innerHTML = this.rows(); });
    $('#pm-grp', root).addEventListener('change', e => { PelajarMgmt.grp = e.target.value; $('#pm-body', root).innerHTML = this.rows(); });
    root.addEventListener('click', e => {
      const st = e.target.closest('[data-st]'); if (st) { PelajarMgmt.st = st.dataset.st; return App.refresh(); }
      const d = e.target.closest('[data-detail]'); if (d) return studentDetailModal(d.dataset.detail);
      const ed = e.target.closest('[data-edit]'); if (ed) return this.formModal(ed.dataset.edit);
      const mv = e.target.closest('[data-move]'); if (mv) return Shared.moveStudentModal(mv.dataset.move);
      if (e.target.closest('[data-export]')) return toast('Data pelajar diekspor ke spreadsheet (demo).', 'info');
      if (e.target.closest('[data-add]')) return this.formModal(null);
    });
  },
  formModal(id) {
    const s = id ? Q.student(id) : null;
    const isDemo = s && DB.accounts.some(a => a.studentId === s.id);
    openModal({
      title: s ? 'Ubah data pelajar' : 'Tambah pelajar', sub: s ? s.name : 'Kata sandi awal dibuat otomatis. Berikan ke pelajar; pelajar dapat menggantinya setelah masuk.',
      body: `<div class="form-grid two">
        <label class="field span-2"><span>Nama lengkap</span><input id="ap-name" value="${s ? esc(s.name) : ''}"><small class="field-err"></small></label>
        <label class="field"><span>Email</span><input id="ap-email" type="email" placeholder="nama@email.com" value="${s ? esc(s.email) : ''}"><small class="field-err"></small></label>
        <label class="field"><span>No. HP</span><input id="ap-phone" placeholder="08…" value="${s ? esc(s.phone) : ''}"></label>
        <label class="field"><span>Asal sekolah</span><input id="ap-school" value="${s ? esc(s.school) : ''}"></label>
        <label class="field"><span>Status</span><select id="ap-status">${['Kelas 12', 'Gap Year'].map(v => `<option ${s && s.status === v ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
        <label class="field span-2"><span>Kelompok Kelas</span><select id="ap-grp">${DB.groups.map(g => `<option value="${g.id}" ${s && s.groupId === g.id ? 'selected' : ''}>${esc(g.name)} — Wali: ${esc(g.wali)} · ${Q.studentsOf(g.id).length} pelajar</option>`).join('')}</select></label>
        ${s ? `<div class="field span-2"><span>Status akun</span><div class="setting-row" style="padding:6px 0;border:0"><div><b id="ap-act-label">${Q.isActive(s) ? 'Aktif' : 'Nonaktif'}</b><small>Pelajar nonaktif tidak dihitung di kelompok, presensi, dan tugas, serta tidak dapat masuk.</small></div><label class="switch"><input type="checkbox" id="ap-active" ${Q.isActive(s) ? 'checked' : ''}><span></span></label></div></div>`
        : `<div class="field span-2"><span>Kata sandi awal</span><div class="pw-gen"><input id="ap-pw" readonly value="${genPassword()}" aria-label="Kata sandi awal"><button type="button" class="btn btn-ghost" id="ap-regen" title="Buat ulang">${icon('refresh', 16)} Generate</button><button type="button" class="btn btn-ghost" id="ap-copy" title="Salin">${icon('clip', 16)} Salin</button></div><small class="muted small">Dibuat acak 10 karakter. Simpan dan berikan ke pelajar.</small></div>`}
      </div>
      <div class="note primary" id="ap-note">${icon('alert', 15)}<span>Satu pelajar hanya dapat terdaftar di satu Kelompok Kelas.</span></div>`,
      footer: `${s ? `<button class="btn btn-danger foot-left" id="ap-del">${icon('x', 16)} Hapus pelajar</button>` : ''}<button class="btn btn-ghost" data-close>Batal</button><button class="btn btn-primary" id="ap-save">${icon('check', 16)} Simpan pelajar</button>`,
      onMount: m => {
        if (s) {
          $('#ap-grp', m).addEventListener('change', e => {
            $('#ap-note span', m).innerHTML = e.target.value === s.groupId ? 'Satu pelajar hanya dapat terdaftar di satu Kelompok Kelas.' : `Pelajar akan <b>dipindahkan</b> dari ${esc(Q.grp(s.groupId).name)} ke ${esc(Q.grp(e.target.value).name)}.`;
          });
          $('#ap-active', m).addEventListener('change', e => { $('#ap-act-label', m).textContent = e.target.checked ? 'Aktif' : 'Nonaktif'; });
          $('#ap-del', m).addEventListener('click', () => this.deleteModal(s, isDemo));
        } else {
          $('#ap-regen', m).addEventListener('click', () => { $('#ap-pw', m).value = genPassword(); });
          $('#ap-copy', m).addEventListener('click', () => {
            const pw = $('#ap-pw', m).value;
            const done = () => toast('Kata sandi disalin.', 'info');
            if (navigator.clipboard) navigator.clipboard.writeText(pw).then(done, () => { $('#ap-pw', m).select(); toast('Salin manual: teks sudah dipilih.', 'info'); });
            else { $('#ap-pw', m).select(); toast('Salin manual: teks sudah dipilih.', 'info'); }
          });
        }
        $('#ap-save', m).addEventListener('click', () => {
          const name = $('#ap-name', m).value.trim(), email = $('#ap-email', m).value.trim();
          fieldErr($('#ap-name', m), name ? '' : 'Nama wajib diisi.');
          fieldErr($('#ap-email', m), /^\S+@\S+\.\S+$/.test(email) ? '' : 'Format email tidak valid.');
          if (!name || !/^\S+@\S+\.\S+$/.test(email)) return;
          const data = { name, email, phone: $('#ap-phone', m).value || '-', school: $('#ap-school', m).value || '-', status: $('#ap-status', m).value, groupId: $('#ap-grp', m).value };
          if (s) {
            const moved = s.groupId !== data.groupId, from = Q.grp(s.groupId).name;
            const wasOn = Q.isActive(s), on = $('#ap-active', m).checked;
            Object.assign(s, data, { active: on });
            if (moved) DB.audit.unshift({ who: App.user.name, at: stamp(), what: `Memindahkan ${name}: ${from} → ${Q.grp(data.groupId).name}` });
            if (wasOn !== on) DB.audit.unshift({ who: App.user.name, at: stamp(), what: `${on ? 'Mengaktifkan' : 'Menonaktifkan'} akun pelajar ${name}` });
            closeModal();
            toast(wasOn !== on ? `Akun ${esc(name)} ${on ? 'diaktifkan kembali' : 'dinonaktifkan'}.` : moved ? `Data disimpan & ${esc(name)} dipindah ke ${esc(Q.grp(data.groupId).name)}.` : 'Data pelajar diperbarui.', wasOn !== on && !on ? 'warning' : 'success');
          } else {
            const pw = $('#ap-pw', m).value;
            // Pelajar baru belum punya riwayat presensi: att null → kehadiran 0%
            DB.students.push({ id: 'p' + Date.now(), ...data, active: true, joined: todayStr(), att: null, avg: 0, toHist: [0, 0, 0, 0] });
            DB.activity.unshift({ who: App.user.name, what: 'menambahkan pelajar ke', obj: Q.grp(data.groupId).name, at: stamp(), icon: 'users' });
            closeModal(); toast(`${esc(name)} ditambahkan ke ${esc(Q.grp(data.groupId).name)}. Kata sandi awal: <b>${esc(pw)}</b>`);
          }
          App.refresh();
        });
      },
    });
  },
  deleteModal(s, isDemo) {
    if (isDemo) return toast(`${esc(s.name)} adalah akun demo dan tidak dapat dihapus. Nonaktifkan saja bila perlu.`, 'error');
    openModal({
      title: 'Hapus pelajar?', sub: s.name,
      body: `<div class="alert alert-danger">${icon('alert', 16)}<span>Akun, riwayat presensi, pengajuan izin, dan koreksi presensi <b>${esc(s.name)}</b> akan dihapus permanen. Bila hanya ingin menghentikan sementara, gunakan <b>Nonaktifkan</b>.</span></div>`,
      footer: `<button class="btn btn-ghost" data-close>Batal</button><button class="btn btn-danger" id="del-ok">${icon('x', 16)} Ya, hapus</button>`,
      onMount(m) {
        $('#del-ok', m).addEventListener('click', () => {
          const rm = (arr, f) => { for (let i = arr.length - 1; i >= 0; i--) if (f(arr[i])) arr.splice(i, 1); };
          rm(DB.students, x => x.id === s.id);
          rm(DB.leaves, x => x.studentId === s.id);
          rm(DB.corrections, x => x.studentId === s.id);
          delete DB.attendance[s.id];
          DB.audit.unshift({ who: App.user.name, at: stamp(), what: `Menghapus akun pelajar ${s.name}` });
          closeModal(); toast(`${esc(s.name)} dihapus.`, 'info'); App.refresh();
        });
      },
    });
  },
};

function studentDetailModal(id) {
  const s = Q.student(id), g = Q.grp(s.groupId);
  const st = Q.attStats(s.id);
  const hist = s.id === 'p1' && DB.tryouts.length ? DB.tryouts.map(Q.toAvg) : s.toHist;
  const leaves = DB.leaves.filter(l => l.studentId === s.id);
  openModal({
    title: s.name, sub: `${s.school} · ${s.status}`, size: 'lg',
    body: `
      <div class="stats">
        ${statCard('checkCircle', st.pct + '%', 'Kehadiran', 'success', `Skor presensi ${st.score}`)}
        ${statCard('target', Q.taskAvg(s.id), 'Rata-rata tugas', 'primary')}
        ${statCard('trending', hist[hist.length - 1], 'Tryout terakhir', 'accent')}
        ${statCard('clipboard', leaves.length, 'Pengajuan izin', 'warning')}
      </div>
      <div class="cols cols-1-1" style="margin-top:0">
        <div class="card" style="background:var(--surface-2)"><div class="card-head"><h3>Kehadiran</h3></div>${attSummary(st, 120)}</div>
        <div class="card" style="background:var(--surface-2)"><div class="card-head"><h3>Tren tryout eksternal</h3></div>${lineChart(hist.map((v, i) => ({ label: 'TO #' + (i + 1), value: v })), { min: 400, max: 700, color: '#a0336b', steps: 3, h: 200 })}</div>
      </div>
      <div class="kv">
        <div><span>Kelompok Kelas</span><b>${tag(g)}</b></div>
        <div><span>Wali Kelas</span><b>${esc(g.wali)}</b></div>
        <div><span>Kontak</span><b>${esc(s.email)} · ${esc(s.phone)}</b></div>
        <div><span>Bergabung</span><b>${fmtDate(s.joined, { day: 'numeric', month: 'long', year: 'numeric' })}</b></div>
      </div>`,
    footer: `${Q.canPlace() ? `<button class="btn btn-ghost" id="sd-move">${icon('swap', 16)} Pindahkan kelompok</button>` : ''}${App.has('tutor', 'wali', 'kurikulum') ? `<button class="btn btn-ghost" id="sd-note">${icon('edit', 16)} Catatan evaluasi</button>` : ''}<button class="btn btn-primary" data-close>Tutup</button>`,
    onMount(m) {
      const mv = $('#sd-move', m); if (mv) mv.addEventListener('click', () => Shared.moveStudentModal(s.id));
      const b = $('#sd-note', m);
      if (b) b.addEventListener('click', () => {
        openModal({
          title: 'Catatan evaluasi', sub: s.name,
          body: `<label class="field"><span>Catatan untuk pelajar</span><textarea id="ev-text" placeholder="Tulis catatan perkembangan dan saran…"></textarea></label>`,
          footer: `<button class="btn btn-ghost" data-close>Batal</button><button class="btn btn-primary" id="ev-save">Simpan</button>`,
          onMount(mm) {
            $('#ev-save', mm).addEventListener('click', () => {
              const t = $('#ev-text', mm).value.trim(); if (!t) return toast('Catatan masih kosong.', 'error');
              if (s.id === 'p1') DB.notes.unshift({ by: App.user.name, role: App.user.roles.map(r => DB.roles[r]).join(' & '), date: todayStr(), text: t });
              closeModal(); toast('Catatan evaluasi tersimpan & terlihat oleh pelajar.');
            });
          },
        });
      });
    },
  });
}

/* =========================================================
   MANAJEMEN KELAS — sub-navigasi: Kelompok Kelas · Mata Pelajaran
   ========================================================= */
const kelasSubnav = active => `<nav class="tabs subnav" aria-label="Sub-menu Manajemen Kelas">
  <a class="tab ${active === 'kelompok' ? 'active' : ''}" href="#/kelas">${icon('layers', 16)} Kelompok Kelas</a>
  <a class="tab ${active === 'mapel' ? 'active' : ''}" href="#/kelas/mapel">${icon('book', 16)} Mata Pelajaran</a>
</nav>`;

PanitiaPages.kelas = {
  title: a => a === 'mapel' ? 'Mata Pelajaran' : a ? (Q.grp(a) ? Q.grp(a).name : 'Kelompok Kelas') : 'Kelompok Kelas',
  crumb: () => 'Manajemen Kelas',
  render(a) {
    if (a === 'mapel') return kelasSubnav('mapel') + MapelPage.render();
    if (isWaliOnly()) {
      const gid = Q.waliGroupIds()[0];
      if (!gid) return kelasSubnav('kelompok') + `<div class="card">${emptyState('layers', 'Belum mendampingi kelompok', 'Kurikulum akan menempatkanmu sebagai Wali Kelas satu Kelompok Kelas.')}</div>`;
      if (TabMemory._grp !== gid) { TabMemory._grp = gid; delete TabMemory.grp; }
      return kelasSubnav('kelompok') + Shared.groupDetail(gid, true, { solo: true });
    }
    if (a) {
      if (TabMemory._grp !== a) { TabMemory._grp = a; delete TabMemory.grp; }
      return kelasSubnav('kelompok') + Shared.groupDetail(a, true);
    }
    return kelasSubnav('kelompok') + KelompokPage.render();
  },
  mount(root, a) {
    if (a === 'mapel') return MapelPage.mount(root);
    Shared.bindGroupActions(root);
  },
};

/* ---------- 3.1 Kelompok Kelas ---------- */
const KelompokPage = {
  render() {
    const groups = Q.myGroups(), canPlace = Q.canPlace();
    const allSt = Q.studentsIn(groups.map(g => g.id));
    const weekN = Q.sessionsOf(groups.map(g => g.id)).filter(s => dayDiff(s.date) >= 0 && dayDiff(s.date) < 7).length;
    const walis = Q.walis();
    return `
    <div class="page-head">
      <div><h1>Kelompok Kelas</h1></div>
      ${canPlace ? `<div class="actions"><button class="btn btn-primary" data-act="new-group">${icon('plus', 16)} Tambah Kelompok Kelas</button></div>` : ''}
    </div>
    <div class="stats">
      ${statCard('layers', groups.length, 'Kelompok Kelas', 'primary')}
      ${statCard('users', allSt.length, 'Pelajar', 'info')}
      ${statCard('user', new Set(groups.map(g => g.wali)).size, 'Wali Kelas bertugas', 'accent')}
      ${statCard('calendar', weekN, 'Sesi 7 hari ke depan', 'success')}
    </div>
    ${groups.length ? `<div class="grid-cards">${groups.map(g => {
      const n = Q.studentsOf(g.id).length, next = Q.nextSession([g.id]), subs = Q.subjectsOfGroup(g.id);
      const role = [Q.teachesGroup(g) ? 'Tutor' : '', g.wali === App.user.name ? 'Wali Kelas' : ''].filter(Boolean).join(' · ');
      return `<a class="class-card" href="#/kelas/${g.id}" style="--c:${g.color}">
        <div class="class-cover"><h3>${esc(g.name)}</h3><p>${esc(g.desc)}</p></div>
        <div class="class-body">
          <div class="class-people"><div class="person">${avatar(g.wali, 'sm')}<div><small>Wali Kelas</small><b>${esc(g.wali)}</b></div></div></div>
          <div class="row wrap" style="gap:6px">${subs.map(stag).join('') || '<span class="muted small">Belum ada mapel terjadwal</span>'}</div>
          ${next ? `<div class="meta-row"><span>${icon('calendar', 14)} ${relDay(next.date)}, ${next.start}</span><span>${icon('book', 14)} ${esc(Q.subj(next.subjectId).code)} · ${esc(next.topic)}</span></div>` : ''}
          ${role ? `<div>${badge('Peranmu: ' + role, 'primary', 'no-dot')}</div>` : ''}
          <div class="class-foot"><span>${icon('users', 14)} ${n} pelajar</span><span>${icon('book', 14)} ${subs.length} mapel</span><span>${icon('calendar', 14)} ${Q.sessionsOf([g.id]).filter(Q.isUpcoming).length} sesi mendatang</span></div>
        </div>
      </a>`;
    }).join('')}</div>` : `<div class="card">${emptyState('layers', 'Belum ada Kelompok Kelas', 'Kelompok akan muncul setelah kamu ditugaskan oleh Kurikulum.')}</div>`}
    ${Q.seeAll() ? `<div class="card mt">
      <div class="card-head"><h3>${icon('user', 16)} Wali Kelas & kelompok yang dipegang</h3><span class="muted small">${walis.length} Wali Kelas</span></div>
      <div class="list">${walis.map(w => { const gs = DB.groups.filter(g => g.wali === w.name); return `<div class="item">${avatar(w.name)}<div class="item-body"><div class="item-title">${esc(w.name)}</div><div class="item-sub">${gs.length ? `${gs.length} Kelompok Kelas` : 'Belum memegang kelompok'}</div></div><div class="item-side row wrap" style="gap:6px;justify-content:flex-end">${gs.map(tag).join('') || badge('Tersedia', 'success')}</div></div>`; }).join('')}</div>
    </div>` : ''}`;
  },
};

/* ---------- 3.2 Mata Pelajaran ---------- */
const MapelState = { q: '', st: 'all' };
const MapelPage = {
  render() {
    const canPlace = Q.canPlace();
    const cnt = k => DB.subjects.filter(s => k === 'all' || (k === 'on' ? s.active : !s.active)).length;
    return `
    <div class="page-head">
      <div><h1>Mata Pelajaran</h1></div>
      ${canPlace ? `<div class="actions"><button class="btn btn-primary" data-new-subj>${icon('plus', 16)} Tambah mapel</button></div>` : ''}
    </div>
    <div class="card">
      <div class="toolbar">
        <div class="search">${icon('search', 16)}<input class="input" id="mp-q" placeholder="Cari nama atau kode mapel…" value="${esc(MapelState.q)}"></div>
        <div class="chips">${[['all', 'Semua'], ['on', 'Aktif'], ['off', 'Nonaktif']].map(([k, l]) => `<button class="chip ${MapelState.st === k ? 'active' : ''}" data-st="${k}">${l}<span class="cnt">${cnt(k)}</span></button>`).join('')}</div>
      </div>
      <div class="table-wrap"><table><thead><tr><th>Kode</th><th>Mata Pelajaran</th><th>Tutor pengampu</th><th>Kelompok Kelas</th><th>Status</th>${canPlace ? '<th></th>' : ''}</tr></thead><tbody id="mp-body">${this.rows()}</tbody></table></div>
    </div>`;
  },
  rows() {
    const canPlace = Q.canPlace(), q = MapelState.q.toLowerCase();
    const list = DB.subjects.filter(s => (MapelState.st === 'all' || (MapelState.st === 'on' ? s.active : !s.active)) && (s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)));
    if (!list.length) return `<tr><td colspan="6">${emptyState('book', 'Mapel tidak ditemukan', 'Coba kata kunci atau filter lain.')}</td></tr>`;
    return list.map(s => {
      const tutors = Q.tutorsOfSubject(s.id), groups = Q.groupsOfSubject(s.id);
      return `<tr class="${s.active ? '' : 'row-muted'}">
        <td>${stag(s)}</td>
        <td style="min-width:220px"><b>${esc(s.name)}</b><div class="muted small">${esc(s.desc)}</div></td>
        <td>${tutors.length ? `<div class="avatar-stack">${tutors.slice(0, 3).map(t => avatar(t, 'xs')).join('')}</div><div class="muted small">${tutors.map(esc).join(', ')}</div>` : '<span class="muted small">—</span>'}</td>
        <td><div class="row wrap" style="gap:4px">${groups.map(tag).join('') || '<span class="muted small">—</span>'}</div></td>
        <td>${canPlace ? `<label class="switch" title="${s.active ? 'Nonaktifkan' : 'Aktifkan'}"><input type="checkbox" data-toggle-subj="${s.id}" ${s.active ? 'checked' : ''}><span></span></label> <span class="muted small" style="margin-left:6px">${s.active ? 'Aktif' : 'Nonaktif'}</span>` : badge(s.active ? 'Aktif' : 'Nonaktif', s.active ? 'success' : 'neutral')}</td>
        ${canPlace ? `<td style="text-align:right"><button class="btn btn-sm btn-ghost" data-edit-subj="${s.id}">${icon('edit', 14)} Ubah</button></td>` : ''}
      </tr>`;
    }).join('');
  },
  mount(root) {
    $('#mp-q', root).addEventListener('input', e => { MapelState.q = e.target.value; $('#mp-body', root).innerHTML = this.rows(); });
    root.addEventListener('change', e => {
      const t = e.target.closest('[data-toggle-subj]'); if (!t) return;
      const s = Q.subj(t.dataset.toggleSubj);
      s.active = t.checked;
      const upcoming = DB.sessions.filter(x => x.subjectId === s.id && Q.isUpcoming(x)).length;
      toast(s.active ? `${esc(s.code)} diaktifkan.` : `${esc(s.code)} dinonaktifkan${upcoming ? `. Catatan: masih ada ${upcoming} sesi mendatang` : ''}.`, s.active || !upcoming ? 'success' : 'warning');
      App.refresh();
    });
    root.addEventListener('click', e => {
      const st = e.target.closest('[data-st]'); if (st) { MapelState.st = st.dataset.st; return App.refresh(); }
      const ed = e.target.closest('[data-edit-subj]'); if (ed) return this.form(ed.dataset.editSubj);
      if (e.target.closest('[data-new-subj]')) return this.form(null);
    });
  },
  form(id) {
    const s = id ? Q.subj(id) : null;
    const colors = ['#17734a', '#5b4aa8', '#1f5f99', '#a85a0c', '#a0336b', '#0f6f7d', '#5f6d16', '#8a4a2b'];
    openModal({
      title: s ? 'Ubah Mata Pelajaran' : 'Tambah Mata Pelajaran', size: 'lg',
      body: `<div class="form-grid two">
        <label class="field span-2"><span>Nama mata pelajaran</span><input id="sf-name" value="${s ? esc(s.name) : ''}" placeholder="cth. Penalaran Umum"><small class="field-err"></small></label>
        <label class="field"><span>Kode</span><input id="sf-code" value="${s ? esc(s.code) : ''}" placeholder="cth. PU" maxlength="6" style="text-transform:uppercase"><small class="field-err"></small></label>
        <div class="field"><span>Status</span><div class="setting-row" style="padding:6px 0;border:0"><div><b id="sf-st-label">${!s || s.active ? 'Aktif' : 'Nonaktif'}</b><small>Mapel aktif dapat dijadwalkan</small></div><label class="switch"><input type="checkbox" id="sf-active" ${!s || s.active ? 'checked' : ''}><span></span></label></div></div>
        <label class="field span-2"><span>Deskripsi singkat</span><textarea id="sf-desc" maxlength="160" placeholder="Cakupan materi secara singkat…" style="min-height:80px">${s ? esc(s.desc) : ''}</textarea><small class="muted small" style="text-align:right"><span id="sf-count">${s ? s.desc.length : 0}</span>/160</small></label>
        <div class="field span-2"><span>Tutor pengampu</span>
          <div class="check-grid" id="sf-tutors">${Q.tutors().map(t => {
            const others = t.subjects.filter(x => x !== (s && s.id)).map(x => Q.subj(x)).filter(Boolean).map(x => x.code);
            return `<label class="check-chip"><input type="checkbox" value="${t.id}" ${s && t.subjects.includes(s.id) ? 'checked' : ''}><span><b>${esc(t.name)}</b><small>${others.length ? 'Juga mengampu ' + others.map(esc).join(', ') : 'Belum mengampu mapel lain'}</small></span></label>`;
          }).join('') || '<p class="muted small">Belum ada akun tutor. Tambahkan di Pengguna & Peran.</p>'}</div>
          <small class="muted small">Hanya tutor yang dicentang yang dapat dipilih saat membuat jadwal sesi mapel ini.</small>
        </div>
      </div>
      <div id="sf-warn"></div>`,
      footer: `<button class="btn btn-ghost" data-close>Batal</button><button class="btn btn-primary" id="sf-save">${icon('check', 16)} Simpan mapel</button>`,
      onMount(m) {
        $('#sf-desc', m).addEventListener('input', e => { $('#sf-count', m).textContent = e.target.value.length; });
        $('#sf-active', m).addEventListener('change', e => { $('#sf-st-label', m).textContent = e.target.checked ? 'Aktif' : 'Nonaktif'; });
        $('#sf-save', m).addEventListener('click', () => {
          const name = $('#sf-name', m).value.trim(), code = $('#sf-code', m).value.trim().toUpperCase();
          const dup = DB.subjects.some(x => x !== s && x.code === code);
          fieldErr($('#sf-name', m), name ? '' : 'Nama wajib diisi.');
          fieldErr($('#sf-code', m), !/^[A-Z0-9]{2,6}$/.test(code) ? 'Kode 2–6 huruf/angka.' : dup ? 'Kode sudah dipakai mapel lain.' : '');
          if (!name || !/^[A-Z0-9]{2,6}$/.test(code) || dup) return;
          const data = { name, code, desc: $('#sf-desc', m).value.trim() || '-', active: $('#sf-active', m).checked };
          const picked = $$('#sf-tutors input:checked', m).map(i => i.value);
          // Tutor yang dilepas tidak boleh masih punya sesi mendatang untuk mapel ini
          if (s) {
            const blocked = Q.tutors().filter(t => t.subjects.includes(s.id) && !picked.includes(t.id))
              .map(t => ({ t, n: DB.sessions.filter(x => x.subjectId === s.id && x.tutor === t.name && Q.isUpcoming(x)).length })).filter(x => x.n);
            if (blocked.length) {
              $('#sf-warn', m).innerHTML = `<div class="alert alert-danger">${icon('alert', 16)}<span>${blocked.map(x => `<b>${esc(x.t.name)}</b> masih dijadwalkan ${x.n} sesi mendatang ${esc(s.code)}`).join('; ')}. Alihkan sesi tersebut di Manajemen Jadwal terlebih dahulu.</span></div>`;
              return;
            }
          }
          const subj = s ? Object.assign(s, data) : { id: 'sb' + Date.now(), color: colors[DB.subjects.length % colors.length], topics: [], ...data };
          if (!s) DB.subjects.push(subj);
          Q.tutors().forEach(t => {
            const has = t.subjects.includes(subj.id), want = picked.includes(t.id);
            if (want && !has) t.subjects.push(subj.id);
            if (!want && has) t.subjects = t.subjects.filter(x => x !== subj.id);
          });
          closeModal(); toast(s ? 'Mata pelajaran diperbarui.' : `Mapel ${esc(code)} ditambahkan${picked.length ? ` dengan ${picked.length} tutor pengampu` : ''}.`); App.refresh();
        });
      },
    });
  },
};

/* ---------- Manajemen Jadwal (bersama) ---------- */
PanitiaPages.jadwal = Shared.jadwal(true);

/* =========================================================
   MATERI DAN TUGAS — dikelompokkan per Mata Pelajaran
   ========================================================= */
const MateriState = { grp: 'all' };
function ensureSubs(a) {
  const list = Q.studentsIn(a.groupIds);
  if (a.subs && a.subs.length === list.length) return a.subs;
  let k = 0;
  a.subs = list.map(st => {
    if (st.id === 'p1' && a.my) return { studentId: st.id, submitted: a.my.status !== 'belum', file: a.my.file, at: a.my.submittedAt, score: a.my.score, feedback: a.my.feedback };
    const i = k++;
    const quiz = a.kind === 'kuis';   // kuis: dinilai otomatis, tanpa berkas
    const submitted = i < a.submitted - (a.my && a.my.status !== 'belum' ? 1 : 0);
    const graded = submitted && (quiz || i < a.graded - (a.my && a.my.status === 'dinilai' ? 1 : 0));
    const h = hashStr(st.id + a.id);
    if (quiz) { const n = a.questions.length, right = submitted ? Math.max(1, n - h % 3) : 0; return { studentId: st.id, submitted, file: null, at: submitted ? `${a.deadline} ${a.time}` : null, score: submitted ? Math.round(Math.min(right, n) / n * 100) : null, feedback: submitted ? 'Dinilai otomatis.' : '' }; }
    return { studentId: st.id, submitted, file: submitted ? `${firstName(st.name)}_${a.title.split(' ')[0]}.pdf` : null, at: submitted ? `${DB.D(Math.min(-1, dayDiff(a.deadline) - 1))} ${pad2(18 + h % 5)}:${pad2(h % 60)}` : null, score: graded ? 70 + h % 28 : null, feedback: graded ? 'Sudah baik, pertahankan.' : '' };
  });
  return a.subs;
}
const canManageMat = () => App.has('tutor', 'kurikulum');
const matItem = (m, withDl = true) => `<div class="item"><div class="item-ic" style="--c:${MAT_COLOR[m.type]}">${icon(MAT_ICON[m.type], 18)}</div><div class="item-body"><div class="item-title">${esc(m.title)}</div><div class="item-sub">${m.type} · ${m.size} · ${esc(m.by)} · ${fmtShort(m.date)}${meetLink(m.sessionId)}</div></div>${withDl ? `<button class="icon-btn" data-dl="${esc(m.title)}" aria-label="Unduh">${icon(m.type === 'Link' ? 'link' : 'download', 18)}</button>` : ''}</div>`;

PanitiaPages.materi = {
  title: sid => sid && Q.subj(sid) ? Q.subj(sid).name : 'Materi dan Tugas',
  render(sid) {
    if (sid && TabMemory._mapel !== sid) { TabMemory._mapel = sid; delete TabMemory.mapel; }
    return sid ? this.detail(sid) : this.overview();
  },
  overview() {
    const asg = Q.myAssignments();
    const subs = Q.mySubjects().filter(s => s.active || DB.materials.some(m => m.subjectId === s.id) || asg.some(a => a.subjectId === s.id));
    const toGrade = asg.filter(a => a.submitted > a.graded);
    const mats = DB.materials.filter(m => subs.some(s => s.id === m.subjectId));
    return `
    <div class="page-head">
      <div><h1>Materi dan Tugas</h1></div>
      ${canManageMat() ? `<div class="actions"><button class="btn btn-ghost" data-new-mat>${icon('upload', 16)} Unggah materi</button><button class="btn btn-primary" data-new-task>${icon('plus', 16)} Buat tugas</button></div>` : ''}
    </div>
    <div class="stats">
      ${statCard('book', subs.length, 'Mata Pelajaran', 'primary')}
      ${statCard('file', mats.length, 'Materi', 'info')}
      ${statCard('clipboard', asg.filter(a => dayDiff(a.deadline) >= 0).length, 'Tugas aktif', 'accent')}
      ${statCard('check', toGrade.reduce((n, a) => n + a.submitted - a.graded, 0), 'Perlu dinilai', 'warning')}
    </div>
    <div class="grid-cards">${subs.map(sb => {
      const ms = DB.materials.filter(m => m.subjectId === sb.id), ts = asg.filter(a => a.subjectId === sb.id);
      const need = ts.reduce((n, a) => n + a.submitted - a.graded, 0);
      const gs = Q.groupsOfSubject(sb.id).filter(g => Q.seeAll() || Q.myGroupIds().includes(g.id));
      return `<a class="class-card" href="#/materi/${sb.id}" style="--c:${sb.color}">
        <div class="class-cover"><span class="badge no-dot">${esc(sb.code)}</span><h3>${esc(sb.name)}</h3><p>${esc(sb.desc)}</p></div>
        <div class="class-body">
          <div class="row wrap" style="gap:6px">${gs.map(tag).join('') || '<span class="muted small">Belum dijadwalkan di kelompok mana pun</span>'}</div>
          <div class="row wrap" style="gap:6px">${need ? badge(`${need} perlu dinilai`, 'warning') : ''}${sb.active ? '' : badge('Mapel nonaktif', 'neutral')}</div>
          <div class="class-foot"><span>${icon('file', 14)} ${ms.length} materi</span><span>${icon('clipboard', 14)} ${ts.length} tugas</span><span>${icon('user', 14)} ${Q.tutorsOfSubject(sb.id).length} tutor</span></div>
        </div>
      </a>`;
    }).join('') || `<div class="card">${emptyState('book', 'Belum ada mata pelajaran', 'Mapel muncul setelah kamu dijadwalkan mengajar.')}</div>`}</div>
    ${toGrade.length ? `<div class="card mt"><div class="card-head"><h3>${icon('check', 16)} Pengumpulan menunggu penilaian</h3></div><div class="list">
      ${toGrade.map(a => `<button class="item clickable" data-grade="${a.id}" style="width:100%;text-align:left"><div class="item-ic" style="--c:${Q.subj(a.subjectId).color}">${icon('file', 18)}</div><div class="item-body"><div class="item-title">${esc(a.title)}</div><div class="item-sub">${esc(Q.subj(a.subjectId).code)} · ${a.groupIds.map(g => esc(Q.grp(g).name)).join(', ')}</div></div>${badge(`${a.submitted - a.graded} perlu dinilai`, 'warning')}</button>`).join('')}
    </div></div>` : ''}`;
  },
  detail(sid) {
    const sb = Q.subj(sid);
    if (!sb || !Q.mySubjects().includes(sb)) return `<div class="card">${emptyState('book', 'Mata pelajaran tidak ditemukan', '', `<a class="btn btn-ghost" href="#/materi">Kembali</a>`)}</div>`;
    const mats = DB.materials.filter(m => m.subjectId === sid).sort((a, b) => b.date.localeCompare(a.date));
    const all = Q.myAssignments().filter(a => a.subjectId === sid);
    const targetIds = [...new Set(all.flatMap(a => a.groupIds))];
    if (MateriState.grp !== 'all' && !targetIds.includes(MateriState.grp)) MateriState.grp = 'all';
    const tasks = all.filter(a => MateriState.grp === 'all' || a.groupIds.includes(MateriState.grp)).sort((a, b) => b.deadline.localeCompare(a.deadline));
    const studying = Q.groupsOfSubject(sid);
    return `
    <div class="class-hero" style="--c:${sb.color}">
      <a class="back" href="#/materi">${icon('left', 16)} Semua mata pelajaran</a>
      <h1>${esc(sb.name)} <span class="muted" style="font-weight:700">· ${esc(sb.code)}</span></h1>
      <p>${esc(sb.desc)}</p>
      <div class="meta-row" style="margin-top:10px"><span>${icon('user', 14)} ${Q.tutorsOfSubject(sid).map(esc).join(', ') || '—'}</span><span>${icon('layers', 14)} Dipelajari: ${studying.map(g => esc(g.name)).join(', ') || '—'}</span></div>
      ${canManageMat() && sb.active ? `<div class="hero-actions"><button class="btn btn-ghost" data-new-mat="${sid}">${icon('upload', 16)} Unggah materi</button><button class="btn btn-primary" data-new-task="${sid}">${icon('plus', 16)} Buat tugas</button></div>` : ''}
    </div>
    <div data-tab-scope>
      <div class="tabs" data-tabs="mapel" style="max-width:max-content">
        <button class="tab ${tabCls('mapel', 't', true)}" data-tab="t">${icon('clipboard', 16)} Tugas <span class="muted">${all.length}</span></button>
        <button class="tab ${tabCls('mapel', 'm')}" data-tab="m">${icon('file', 16)} Materi <span class="muted">${mats.length}</span></button>
      </div>
      <div class="tab-pane ${tabCls('mapel', 't', true)}" data-pane="t">
        ${targetIds.length > 1 ? `<div class="chips" style="margin-bottom:14px"><button class="chip ${MateriState.grp === 'all' ? 'active' : ''}" data-grp="all">Semua kelompok</button>${targetIds.map(id => `<button class="chip ${MateriState.grp === id ? 'active' : ''}" data-grp="${id}">${esc(Q.grp(id).name)}</button>`).join('')}</div>` : ''}
        ${tasks.length ? tasks.map(a => {
          const n = Q.assignTotal(a), need = a.submitted - a.graded, open = dayDiff(a.deadline) >= 0;
          return `<div class="task">
            <div class="task-main">
              <div class="task-top"><span class="muted small" style="font-weight:700">Untuk:</span>${a.groupIds.map(g => tag(Q.grp(g))).join('')}${open ? badge('Aktif', 'success') : badge('Tenggat lewat', 'neutral')}${need > 0 ? badge(`${need} perlu dinilai`, 'warning') : ''}</div>
              <h4>${esc(a.title)}</h4><p>${esc(a.desc)}</p>
              <div class="meta-row"><span>${icon('clock', 14)} Tenggat ${fmtDay(a.deadline)}, ${a.time} (${relDay(a.deadline)})</span><span>${icon('user', 14)} ${esc(a.by)}</span></div>
              <div class="row wrap" style="gap:18px;margin-top:12px">
                <div style="flex:1;min-width:160px"><div class="row-between small muted" style="margin-bottom:4px"><span>Dikumpul</span><b>${a.submitted}/${n}</b></div>${progress(n ? Math.round(a.submitted / n * 100) : 0, 'var(--info)')}</div>
                <div style="flex:1;min-width:160px"><div class="row-between small muted" style="margin-bottom:4px"><span>Dinilai</span><b>${a.graded}/${a.submitted}</b></div>${progress(a.submitted ? Math.round(a.graded / a.submitted * 100) : 0, 'var(--success)')}</div>
              </div>
            </div>
            <div class="task-side">${canManageMat() ? `<button class="btn ${need > 0 ? 'btn-primary' : 'btn-ghost'} btn-sm" data-grade="${a.id}">${icon('check', 14)} Periksa${need > 0 ? ` (${need})` : ''}</button>` : `<button class="btn btn-ghost btn-sm" data-grade="${a.id}">${icon('eye', 14)} Lihat</button>`}</div>
          </div>`;
        }).join('') : `<div class="card">${emptyState('clipboard', 'Belum ada tugas', 'Buat tugas dan pilih Kelompok Kelas tujuan.')}</div>`}
      </div>
      <div class="tab-pane ${tabCls('mapel', 'm')}" data-pane="m">
        <div class="card">
          <div class="note info" style="margin:0 0 10px">${icon('layers', 15)}<span>Materi ${esc(sb.code)} dapat diakses oleh seluruh Kelompok Kelas yang mempelajarinya${studying.length ? `: <b>${studying.map(g => esc(g.name)).join(', ')}</b>` : ''}.</span></div>
          <div class="list">${mats.map(m => matItem(m)).join('') || emptyState('file', 'Belum ada materi')}</div>
        </div>
      </div>
    </div>`;
  },
  mount(root, sid) {
    bindTabs(root);
    root.addEventListener('click', e => {
      const g = e.target.closest('[data-grp]'); if (g) { MateriState.grp = g.dataset.grp; return App.refresh(); }
      const gr = e.target.closest('[data-grade]'); if (gr) return this.gradeModal(gr.dataset.grade);
      const nt = e.target.closest('[data-new-task]'); if (nt) return this.taskModal(nt.dataset.newTask || sid);
      const nm = e.target.closest('[data-new-mat]'); if (nm) return this.matModal(nm.dataset.newMat || sid);
      const d = e.target.closest('[data-dl]'); if (d) toast(`Mengunduh “${d.dataset.dl}” (demo)`, 'info');
    });
  },
  gradeModal(id) {
    const a = DB.assignments.find(x => x.id === id), sb = Q.subj(a.subjectId);
    const subs = ensureSubs(a);
    const canGrade = canManageMat();
    openModal({
      title: a.kind === 'kuis' ? 'Hasil kuis' : 'Periksa pengumpulan', sub: `${sb.code} · ${a.title}${a.kind === 'kuis' ? ' · dinilai otomatis' : ''}`, size: 'lg',
      body: `<div class="row wrap" style="gap:8px">${badge(`${subs.filter(s => s.submitted).length} dikumpul`, 'info')}${badge(`${subs.filter(s => s.score != null).length} dinilai`, 'success')}${badge(`${subs.filter(s => !s.submitted).length} belum mengumpulkan`, 'warning')}</div>
        ${a.groupIds.map(gid => {
          const g = Q.grp(gid), rows = subs.map((s, i) => ({ s, i })).filter(x => Q.student(x.s.studentId).groupId === gid);
          return `<div class="grade-group"><div class="row-between" style="margin:14px 0 4px">${tag(g)}<span class="muted small">${rows.filter(x => x.s.submitted).length}/${rows.length} dikumpul</span></div>
            ${rows.map(({ s, i }) => {
              const st = Q.student(s.studentId);
              return `<div class="grade-row">
                <div class="cell-user">${avatar(st.name, 'sm')}<div><b>${esc(st.name)}</b><small>${s.submitted ? `Dikumpul ${fmtStamp(s.at)}` : 'Belum mengumpulkan'}</small>${s.submitted && s.file ? `<div style="margin-top:6px"><button class="file-chip" data-file="${esc(s.file)}">${icon('clip', 13)}<span>${esc(s.file)}</span></button></div>` : ''}</div></div>
                ${s.submitted ? `<div class="inputs"><input type="number" min="0" max="100" placeholder="Nilai" data-score="${i}" value="${s.score ?? ''}" ${canGrade ? '' : 'disabled'}><input placeholder="Umpan balik singkat…" data-fb="${i}" value="${esc(s.feedback || '')}" ${canGrade ? '' : 'disabled'}></div>` : `<div>${badge('Menunggu pengumpulan', 'neutral')}</div>`}
              </div>`;
            }).join('') || '<p class="muted small">Belum ada anggota.</p>'}</div>`;
        }).join('')}`,
      footer: canGrade ? `<button class="btn btn-ghost" data-close>Batal</button><button class="btn btn-primary" id="gr-save">${icon('check', 16)} Simpan nilai</button>` : `<button class="btn btn-primary" data-close>Tutup</button>`,
      onMount(m) {
        m.addEventListener('click', e => { const f = e.target.closest('[data-file]'); if (f) toast(`Membuka ${f.dataset.file} (demo)`, 'info'); });
        const save = $('#gr-save', m);
        if (!save) return;
        save.addEventListener('click', () => {
          let bad = false;
          $$('[data-score]', m).forEach(inp => {
            const i = +inp.dataset.score, v = inp.value.trim();
            inp.style.borderColor = '';
            if (v === '') return;
            const n = Number(v);
            if (isNaN(n) || n < 0 || n > 100) { inp.style.borderColor = 'var(--danger)'; bad = true; return; }
            subs[i].score = n; subs[i].feedback = $(`[data-fb="${i}"]`, m).value.trim();
            if (subs[i].studentId === 'p1' && a.my) Object.assign(a.my, { status: 'dinilai', score: n, feedback: subs[i].feedback || 'Kerja bagus!' });
          });
          if (bad) return toast('Nilai harus di antara 0–100.', 'error');
          a.graded = subs.filter(s => s.score != null).length;
          DB.activity.unshift({ who: App.user.name, what: 'menilai pengumpulan', obj: a.title, at: stamp(), icon: 'check' });
          closeModal(); toast('Nilai & umpan balik tersimpan. Pelajar mendapat notifikasi.'); App.refresh();
        });
      },
    });
  },
  /* Kelompok tujuan yang boleh dipilih untuk mapel tertentu */
  targetGroups(sid) {
    if (App.has('kurikulum')) return DB.groups;
    const mine = [...new Set(DB.sessions.filter(s => s.tutor === App.user.name && s.subjectId === sid).map(s => s.groupId))];
    const ids = mine.length ? mine : Q.teachGroupIds();
    return DB.groups.filter(g => ids.includes(g.id));
  },
  taskModal(presetSid) {
    const subs = Q.mySubjects().filter(s => s.active);
    if (!subs.length) return toast('Tidak ada mata pelajaran aktif yang kamu ampu.', 'error');
    const sid0 = subs.find(s => s.id === presetSid) ? presetSid : subs[0].id;
    const groupChecks = sid => {
      const studying = Q.groupsOfSubject(sid).map(g => g.id);
      const list = this.targetGroups(sid);
      return list.map(g => `<label class="check-chip"><input type="checkbox" value="${g.id}" ${list.length === 1 ? 'checked' : ''}><span style="--c:${g.color}"><b>${esc(g.name)}</b><small>${Q.studentsOf(g.id).length} pelajar${studying.includes(g.id) ? ` · mempelajari ${esc(Q.subj(sid).code)}` : ''}</small></span></label>`).join('');
    };
    openModal({
      title: 'Buat tugas', sub: 'Tugas milik satu Mata Pelajaran dan ditujukan ke satu atau beberapa Kelompok Kelas.', size: 'lg',
      body: `<div class="form-grid two">
        <label class="field span-2"><span>Mata Pelajaran</span><select id="nt-subj">${subs.map(s => `<option value="${s.id}" ${s.id === sid0 ? 'selected' : ''}>${esc(s.code)} · ${esc(s.name)}</option>`).join('')}</select></label>
        <div class="field span-2"><span>Ditujukan ke Kelompok Kelas</span><div class="check-grid" id="nt-groups">${groupChecks(sid0)}</div><small class="field-err" id="nt-groups-err"></small></div>
        <label class="field span-2"><span>Judul tugas</span><input id="nt-title" placeholder="cth. Latihan Soal Peluang"><small class="field-err"></small></label>
        <label class="field span-2"><span>Instruksi</span><textarea id="nt-desc" placeholder="Jelaskan apa yang harus dikerjakan…"></textarea></label>
        <label class="field"><span>Tanggal tenggat</span><input type="date" id="nt-date" value="${DB.D(7)}"></label>
        <label class="field"><span>Jam tenggat</span><input type="time" id="nt-time" value="23:59"></label>
        <div class="field span-2"><span>Lampiran soal (opsional)</span>${dropzone('nt-file')}</div>
      </div>`,
      footer: `<button class="btn btn-ghost" data-close>Batal</button><button class="btn btn-primary" id="nt-save">${icon('send', 16)} Terbitkan tugas</button>`,
      onMount(m) {
        bindDropzone($('#nt-file', m));
        $('#nt-subj', m).addEventListener('change', e => { $('#nt-groups', m).innerHTML = groupChecks(e.target.value); });
        $('#nt-save', m).addEventListener('click', () => {
          const title = $('#nt-title', m).value.trim();
          const groupIds = $$('#nt-groups input:checked', m).map(i => i.value);
          fieldErr($('#nt-title', m), title ? '' : 'Judul wajib diisi.');
          $('#nt-groups-err', m).textContent = groupIds.length ? '' : 'Pilih minimal satu Kelompok Kelas.';
          $('#nt-groups-err', m).closest('.field').classList.toggle('invalid', !groupIds.length);
          if (!title || !groupIds.length) return;
          const subjectId = $('#nt-subj', m).value;
          const t = { id: 'a' + Date.now(), subjectId, groupIds, by: App.user.name, title, desc: $('#nt-desc', m).value.trim() || '-', deadline: $('#nt-date', m).value, time: $('#nt-time', m).value, createdAt: todayStr(), submitted: 0, graded: 0 };
          if (groupIds.includes(Q.student('p1').groupId)) {
            t.my = { status: 'belum', score: null, file: null, submittedAt: null, feedback: '' };
            DB.notifications.pelajar.unshift({ title: `Tugas baru: ${title}`, text: `${Q.subj(subjectId).code} · Tenggat ${fmtShort(t.deadline)}`, at: stamp(), unread: true, icon: 'file' });
          }
          DB.assignments.push(t);
          DB.activity.unshift({ who: App.user.name, what: 'membuat tugas', obj: title, at: stamp(), icon: 'file' });
          TabMemory.mapel = 't'; TabMemory._mapel = subjectId;
          closeModal(); toast(`Tugas diterbitkan ke ${Q.studentsIn(groupIds).length} pelajar di ${groupIds.length} Kelompok Kelas.`);
          location.hash = '#/materi/' + subjectId; App.refresh();
        });
      },
    });
  },
  matModal(presetSid) {
    const subs = Q.mySubjects().filter(s => s.active);
    if (!subs.length) return toast('Tidak ada mata pelajaran aktif yang kamu ampu.', 'error');
    const sid0 = subs.find(s => s.id === presetSid) ? presetSid : subs[0].id;
    let file = null;
    const reach = sid => { const gs = Q.groupsOfSubject(sid); return gs.length ? `Akan tersedia untuk: <b>${gs.map(g => esc(g.name)).join(', ')}</b>.` : 'Belum ada Kelompok Kelas yang mempelajari mapel ini.'; };
    openModal({
      title: 'Unggah materi', sub: 'Materi melekat pada Mata Pelajaran.',
      body: `<label class="field"><span>Mata Pelajaran</span><select id="nm-subj">${subs.map(s => `<option value="${s.id}" ${s.id === sid0 ? 'selected' : ''}>${esc(s.code)} · ${esc(s.name)}</option>`).join('')}</select></label>
        <div class="note info" style="margin:0">${icon('layers', 15)}<span id="nm-reach">${reach(sid0)}</span></div>
        <label class="field"><span>Judul materi</span><input id="nm-title" placeholder="cth. Modul Peluang"><small class="field-err"></small></label>
        <label class="field"><span>Jenis</span><select id="nm-type"><option>PDF</option><option>PPT</option><option>Video</option><option>Link</option></select></label>
        <div class="field"><span>Berkas</span>${dropzone('nm-file', 'PDF, PPT, MP4 · atau tautan')}</div>`,
      footer: `<button class="btn btn-ghost" data-close>Batal</button><button class="btn btn-primary" id="nm-save">${icon('upload', 16)} Unggah</button>`,
      onMount(m) {
        $('#nm-subj', m).addEventListener('change', e => { $('#nm-reach', m).innerHTML = reach(e.target.value); });
        bindDropzone($('#nm-file', m), f => { file = f; if (!$('#nm-title', m).value) $('#nm-title', m).value = f.name.replace(/\.[^.]+$/, ''); });
        $('#nm-save', m).addEventListener('click', () => {
          const title = $('#nm-title', m).value.trim();
          if (!title) return fieldErr($('#nm-title', m), 'Judul wajib diisi.');
          const type = $('#nm-type', m).value, subjectId = $('#nm-subj', m).value;
          DB.materials.push({ id: 'm' + Date.now(), subjectId, title, type, size: file ? `${(file.size / 1048576).toFixed(1)} MB` : type === 'Link' ? 'Tautan' : '—', date: todayStr(), by: App.user.name });
          DB.activity.unshift({ who: App.user.name, what: 'mengunggah materi', obj: title, at: stamp(), icon: 'upload' });
          TabMemory.mapel = 'm'; TabMemory._mapel = subjectId;
          closeModal(); toast('Materi berhasil diunggah.'); location.hash = '#/materi/' + subjectId; App.refresh();
        });
      },
    });
  },
};

/* ---------- Presensi (ringkasan sesi hari ini · koreksi · audit). Presensi dibuka di room pertemuan. ---------- */
const PresensiPan = { sessionId: null };
PanitiaPages.presensi = {
  title: 'Presensi',
  render() {
    const scope = Q.scopeSessions();
    let options = scope.filter(s => s.date === todayStr());
    const demo = !options.length;
    if (demo) options = scope.filter(Q.isUpcoming).slice(0, 3);
    if (!PresensiPan.sessionId || !options.find(s => s.id === PresensiPan.sessionId)) PresensiPan.sessionId = (options.find(Q.canRunSession) || options[0] || {}).id || null;
    const s = Q.session(PresensiPan.sessionId);
    const corr = DB.corrections.filter(k => scope.includes(Q.session(k.sessionId)));
    const rm = s ? Room.state(s) : null;
    // Edit presensi: Wali Kelas (kelompok dampingan), Kurikulum, Administrator
    const editable = scope.filter(x => Room.canEdit(x)).slice().reverse().slice(0, 8);
    const editCard = editable.length ? `<div class="card mt"><div class="card-head"><h3>${icon('edit', 16)} Edit presensi</h3><span class="muted small">Buka pertemuan › tab Presensi › tombol Edit pada baris pelajar</span></div><div class="list">${editable.map(x => sessRow(x, { showGroup: true })).join('')}</div></div>` : '';

    return `
    <div class="page-head">
      <div><h1>Presensi</h1></div>
    </div>
    ${!s ? `<div class="card">${emptyState('locate', 'Tidak ada sesi', 'Belum ada sesi dalam cakupanmu.')}</div>` : `
    <div class="cols cols-1-1">
      <div class="card">
        <div class="card-head"><h3>${icon('locate', 16)} Sesi presensi</h3>${demo ? badge('Mode demo', 'accent', 'no-dot') : badge('Hari ini', 'accent', 'no-dot')}</div>
        ${demo ? `<div class="note warning" style="margin:0 0 14px">${icon('alert', 15)}<span>Tidak ada sesi hari ini dalam cakupanmu. Sesi mendatang ditampilkan sebagai contoh.</span></div>` : ''}
        <div class="session-pick">
          ${options.map(x => { const g = Q.grp(x.groupId), sb = Q.subj(x.subjectId), r = Room.state(x); return `<label class="pick ${x.id === s.id ? 'active' : ''}"><input type="radio" name="ps" value="${x.id}" ${x.id === s.id ? 'checked' : ''}><span class="pick-bar" style="--c:${sb.color}"></span><div class="pick-body"><b>${esc(sb.code)} · ${esc(x.topic)}</b><span>${esc(g.name)} · ${fmtDay(x.date)} · ${x.start}–${x.end} · ${esc(x.tutor)}</span></div>${r.open ? badge('Dibuka', 'danger') : r.closed ? badge('Ditutup', 'neutral') : ''}</label>`; }).join('')}
        </div>
        <div class="kv" style="margin-bottom:16px">
          <div><span>Kelompok Kelas</span><b>${esc(Q.grp(s.groupId).name)} · ${Q.studentsOf(s.groupId).length} pelajar</b></div>
          <div><span>Status presensi</span><b>${rm.open ? `Dibuka ${Room.openTime(s)} WIB` : rm.closed ? 'Sudah ditutup' : 'Belum dibuka'}</b></div>
          <div><span>Batas Hadir</span><b>${rm.open || rm.closed ? `${Room.deadline(s)} WIB` : `Jam dibuka + ${DB.settings.lateTolerance} menit`}</b></div>
          <div><span>Titik lokasi</span><b>${esc(placeOf(s).name)} · radius ${DB.settings.geoRadius} m</b></div>
        </div>
        <a class="btn btn-primary btn-lg btn-block" href="#/sesi/${s.id}">${icon('arrowRight', 18)} Masuk Kelas${Q.canRunSession(s) && !rm.open && !rm.closed ? ' & buka presensi' : ''}</a>
        ${Q.canRunSession(s) ? '' : `<div class="note info" style="margin-top:10px">${icon('eye', 15)}<span>Peranmu hanya dapat memantau presensi sesi ini. Presensi dibuka oleh tutor sesi atau Kurikulum di room pertemuan.</span></div>`}
      </div>
      <div class="card">${this.liveView(s)}</div>
    </div>`}
    <div class="cols cols-1-1">
      <div class="card">
        <div class="card-head"><h3>${icon('edit', 16)} Pengajuan koreksi presensi</h3>${badge(`${corr.filter(k => k.status === 'pending').length} menunggu`, 'warning')}</div>
        ${corr.length ? corr.map(k => {
          const st = Q.student(k.studentId), ss = Q.session(k.sessionId);
          return `<div class="leave-card"><div class="leave-head"><div class="cell-user" style="min-width:0">${avatar(st.name, 'sm')}<div><b>${esc(st.name)}</b><small>${esc(Q.grp(ss.groupId).name)} · ${esc(Q.subj(ss.subjectId).code)} · ${fmtDay(ss.date)}</small></div></div>${k.status === 'pending' ? badge('Menunggu', 'warning') : k.status === 'approved' ? badge('Disetujui', 'success') : badge('Ditolak', 'danger')}</div>
            <p class="leave-reason"><b>${esc(k.type)}</b> — ${esc(k.note)}</p>
            ${k.status === 'pending' && Q.canRunSession(ss) ? `<div class="row wrap"><button class="btn btn-sm btn-success" data-kok="${k.id}">${icon('check', 14)} Setujui → Hadir</button><button class="btn btn-sm btn-danger" data-kno="${k.id}">${icon('x', 14)} Tolak</button></div>` : ''}
          </div>`;
        }).join('') : emptyState('checkCircle', 'Tidak ada pengajuan koreksi')}
      </div>
      <div class="card">
        <div class="card-head"><h3>${icon('shield', 16)} Audit trail</h3><span class="muted small">Siapa · kapan · apa yang diubah</span></div>
        ${DB.audit.slice(0, 8).map(a => `<div class="activity">${avatar(a.who, 'xs')}<div><p><b>${esc(a.who)}</b> · ${esc(a.what)}</p><time>${relStamp(a.at)}</time></div></div>`).join('')}
      </div>
    </div>
    ${editCard}`;
  },
  /* Ringkasan daftar hadir diambil dari Room Pertemuan (sumber data presensi yang sama) */
  liveView(s) {
    const rm = Room.state(s), roster = Room.roster(s), t = Room.tally(roster);
    const order = rm.attendees.map(a => roster.find(r => r.st.id === a.id)).filter(Boolean).reverse();
    const izin = roster.filter(r => r.status === 'izin');
    return `
      <div class="card-head"><h3>${icon('users', 16)} Daftar hadir ${rm.open ? '<span class="live-dot" style="margin-left:4px"></span>' : ''}</h3><span class="muted small">${rm.open ? 'Presensi dibuka' : rm.closed ? 'Presensi ditutup' : 'Belum dibuka'}</span></div>
      <div class="live-stats"><div><b style="color:var(--success)">${t.hadir}</b><span>Hadir</span></div><div><b style="color:var(--warning)">${t.terlambat}</b><span>Terlambat</span></div><div><b>${t.belum + t.alpa}</b><span>${rm.closed ? 'Tidak hadir' : 'Belum'}</span></div></div>
      <div class="live-list list">${order.length || izin.length ? [...order.slice(0, 12), ...izin].map(r => Room.personRow(r)).join('') : emptyState('locate', 'Belum ada yang presensi', 'Pelajar dengan izin yang sudah disetujui otomatis tercatat Izin di sini.')}</div>`;
  },
  mount(root) {
    root.addEventListener('change', e => { if (e.target.name === 'ps') { PresensiPan.sessionId = e.target.value; App.refresh(); } });
    root.addEventListener('click', e => {
      const ok = e.target.closest('[data-kok]'), no = e.target.closest('[data-kno]');
      if (!ok && !no) return;
      const k = DB.corrections.find(x => x.id === (ok || no).dataset[ok ? 'kok' : 'kno']);
      const st = Q.student(k.studentId), ss = Q.session(k.sessionId);
      k.status = ok ? 'approved' : 'rejected';
      if (ok) {
        Q.attOf(k.studentId)[k.sessionId] = { status: 'hadir', time: ss.start };
        // Perbarui juga daftar hadir room bila presensinya sudah dibuka/ditutup
        const rm = DB.rooms[ss.id];
        if (rm) { rm.attendees = rm.attendees.filter(a => a.id !== st.id); rm.attendees.push({ id: st.id, time: ss.start, status: 'hadir', via: 'Koreksi disetujui' }); }
      }
      DB.audit.unshift({ who: App.user.name, at: stamp(), what: ok ? `Koreksi presensi ${st.name} disetujui → Hadir` : `Koreksi presensi ${st.name} ditolak` });
      toast(ok ? 'Koreksi disetujui. Status presensi diperbarui.' : 'Koreksi ditolak.', ok ? 'success' : 'info');
      App.refresh();
    });
  },
};

/* ---------- Perizinan ---------- */
const IzinPan = { filter: 'aksi' };
PanitiaPages.perizinan = {
  title: 'Perizinan',
  render() {
    const allL = scopeLeaves().slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    // Hanya pengajuan untuk sesi yang belum lewat yang aktif. Sesi lewat → Arsip (belum ditindak = Tidak hadir)
    const active = allL.filter(l => !leaveEnded(l)), arsip = allL.filter(leaveEnded);
    const mine = myLeaveActions();
    const canAct = App.has('wali', 'kurikulum');
    if (IzinPan.filter === 'aksi' && !canAct) IzinPan.filter = 'semua';
    const filters = [
      ...(canAct ? [['aksi', 'Perlu tindakan saya', mine.length]] : []),
      ['semua', 'Aktif', active.length],
      ['wali', 'Menunggu Wali Kelas', active.filter(l => l.status === 'wali').length],
      ['kurikulum', 'Menunggu Kurikulum', active.filter(l => l.status === 'kurikulum').length],
      ['disetujui', 'Disetujui', active.filter(l => l.status === 'disetujui').length],
      ['ditolak', 'Ditolak', active.filter(l => l.status === 'ditolak').length],
      ['arsip', 'Arsip', arsip.length],
    ];
    const list = IzinPan.filter === 'aksi' ? mine : IzinPan.filter === 'semua' ? active : IzinPan.filter === 'arsip' ? arsip : active.filter(l => l.status === IzinPan.filter);
    const roleNote = App.isAdmin ? ['primary', 'Sebagai <b>Administrator</b>, kamu dapat memutuskan sebagai Wali Kelas (terima / tolak) maupun sebagai Kurikulum (keputusan akhir) untuk seluruh pengajuan.']
      : App.has('kurikulum') ? ['primary', 'Sebagai <b>Kurikulum</b>, kamu memberi <b>keputusan akhir</b> hanya untuk izin yang sudah <b>diterima Wali Kelas</b>. Disetujui → presensi menjadi “Izin”. Ditolak, atau tidak ditindak sampai sesi selesai → <b>Tidak hadir</b>.']
      : App.has('wali') ? ['primary', 'Sebagai <b>Wali Kelas</b>, kamu memilih <b>Terima</b> (diteruskan ke Kurikulum) atau <b>Tolak</b> (pelajar langsung Tidak hadir). Pengajuan yang tidak kamu tindak sampai jam pelajaran selesai otomatis diarsipkan sebagai Tidak hadir.']
      : ['warning', 'Sebagai <b>Ketua BAT</b>, kamu memiliki akses <b>pemantauan</b> tanpa masuk ke alur persetujuan rutin.'];
    return `
    <div class="page-head"><div><h1>Perizinan</h1></div></div>
    ${Q.seeAll() ? `<div class="stats" style="margin-bottom:16px">
      ${statCard('clipboard', allL.length, 'Total pengajuan', 'primary')}
      ${statCard('clock', active.filter(l => ['wali', 'kurikulum'].includes(l.status)).length, 'Dalam proses', 'warning')}
      ${statCard('checkCircle', allL.filter(l => l.status === 'disetujui').length, 'Disetujui', 'success')}
      ${statCard('xCircle', allL.filter(l => ['ditolak', 'kedaluwarsa'].includes(l.status)).length, 'Ditolak / kedaluwarsa', 'danger')}
    </div>` : ''}
    <div class="chips" style="margin-bottom:16px">${filters.map(([k, l, n]) => `<button class="chip ${IzinPan.filter === k ? 'active' : ''}" data-f="${k}">${l}<span class="cnt">${n}</span></button>`).join('')}</div>
    ${list.length ? `<div class="leave-grid">${list.map(l => this.card(l)).join('')}</div>` : `<div class="card">${emptyState(IzinPan.filter === 'arsip' ? 'history' : 'checkCircle', IzinPan.filter === 'arsip' ? 'Arsip kosong' : 'Tidak ada pengajuan', IzinPan.filter === 'aksi' ? 'Semua pengajuan sudah kamu tindak lanjuti.' : IzinPan.filter === 'arsip' ? 'Pengajuan untuk sesi yang sudah lewat akan tersimpan di sini.' : 'Tidak ada pengajuan aktif pada kategori ini.')}</div>`}`;
  },
  card(l) {
    const st = Q.student(l.studentId), s = Q.session(l.sessionId), g = Q.grp(s.groupId), sb = Q.subj(s.subjectId), m = LEAVE[l.status];
    const archived = leaveEnded(l);
    const canWali = !archived && l.status === 'wali' && App.has('wali') && Q.waliGroupIds().includes(g.id);
    const canKur = !archived && l.status === 'kurikulum' && App.has('kurikulum');
    return `<div class="leave-card">
      <div class="leave-head"><div class="cell-user" style="min-width:0">${avatar(st.name)}<div><b>${esc(st.name)}</b><small>${esc(g.name)} · diajukan ${relStamp(l.createdAt)}</small></div></div><div class="row" style="gap:6px">${archived ? badge('Arsip', 'neutral', 'no-dot') : ''}${badge(m.short, m.tone)}</div></div>
      <div class="note primary" style="margin-top:12px">${icon('calendar', 15)}<span>${esc(sb.code)} · ${esc(s.topic)} · ${fmtDay(s.date)}, ${s.start}–${s.end}</span></div>
      <p class="leave-reason"><b>${esc(l.reason)}</b> — ${esc(l.note)}</p>
      ${l.file ? `<button class="file-chip" data-file="${esc(l.file)}">${icon('clip', 14)}<span>${esc(l.file)}</span></button>` : '<span class="muted small">Tanpa lampiran (data lama)</span>'}
      ${['ditolak', 'kedaluwarsa'].includes(l.status) ? `<div class="note warning" style="margin-top:8px">${icon('alert', 15)}<span>Pelajar tercatat <b>Tidak hadir</b> pada sesi ini.</span></div>` : ''}
      <details ${canWali || canKur ? '' : 'open'}><summary>${icon('activity', 14)} Lini masa verifikasi</summary>${leaveTimeline(l)}</details>
      ${canWali ? `<div class="leave-actions">
        <label class="field"><span>Catatan (wajib bila menolak)</span><textarea data-note="${l.id}" placeholder="cth. Sudah konfirmasi ke pelajar / orang tua…" style="min-height:70px"></textarea></label>
        <div class="row wrap"><button class="btn btn-success btn-sm" data-wali-ok="${l.id}">${icon('check', 14)} Terima & teruskan ke Kurikulum</button><button class="btn btn-danger btn-sm" data-wali-no="${l.id}">${icon('x', 14)} Tolak (pelajar tidak hadir)</button></div>
      </div>` : ''}
      ${canKur ? `<div class="leave-actions">
        <label class="field"><span>Catatan keputusan</span><textarea data-note="${l.id}" placeholder="Catatan ini dapat dilihat pelajar…" style="min-height:70px"></textarea></label>
        <div class="row wrap"><button class="btn btn-success btn-sm" data-ok="${l.id}">${icon('check', 14)} Setujui</button><button class="btn btn-danger btn-sm" data-no="${l.id}">${icon('x', 14)} Tolak (pelajar tidak hadir)</button></div>
      </div>` : ''}
    </div>`;
  },
  mount(root) {
    root.addEventListener('click', e => {
      const t = e.target;
      const f = t.closest('[data-f]'); if (f) { IzinPan.filter = f.dataset.f; return App.refresh(); }
      const fl = t.closest('[data-file]'); if (fl) return toast(`Membuka lampiran ${fl.dataset.file} (demo)`, 'info');
      const wk = t.closest('[data-wali-ok]'), wn = t.closest('[data-wali-no]');
      if (wk || wn) {
        const l = DB.leaves.find(x => x.id === (wk || wn).dataset[wk ? 'waliOk' : 'waliNo']);
        const note = $(`[data-note="${l.id}"]`, root).value.trim();
        if (leaveEnded(l)) { toast('Sesi sudah selesai, pengajuan diarsipkan sebagai Tidak hadir.', 'error'); return App.refresh(); }
        if (wn && !note) { toast('Tuliskan alasan penolakan untuk pelajar.', 'error'); $(`[data-note="${l.id}"]`, root).focus(); return; }
        const st = Q.student(l.studentId);
        if (wk) {
          Object.assign(l, { status: 'kurikulum', waliDecision: 'diterima', waliRec: 'Diterima', waliNote: note, waliBy: App.user.name, waliAt: stamp() });
          DB.activity.unshift({ who: App.user.name, what: 'menerima izin', obj: st.name, at: stamp(), icon: 'clipboard' });
          toast('Izin diterima & diteruskan ke Kurikulum.');
        } else {
          Object.assign(l, { status: 'ditolak', waliDecision: 'ditolak', waliRec: 'Ditolak', waliNote: note, waliBy: App.user.name, waliAt: stamp() });
          setAttOverride(l.sessionId, l.studentId, 'alpa', App.user.name, `Izin ditolak Wali Kelas: ${note}`, 'Izin ditolak Wali Kelas → tidak hadir');
          DB.audit.unshift({ who: App.user.name, at: stamp(), what: `Izin ${st.name} ditolak Wali Kelas → Tidak hadir` });
          DB.activity.unshift({ who: App.user.name, what: 'menolak izin', obj: st.name, at: stamp(), icon: 'clipboard' });
          if (st.id === 'p1') DB.notifications.pelajar.unshift({ title: 'Izin ditolak Wali Kelas', text: `${note} · Presensi sesi ini tercatat Tidak hadir.`, at: stamp(), unread: true, icon: 'clipboard' });
          toast('Izin ditolak. Pelajar tercatat Tidak hadir.', 'info');
        }
        return App.refresh();
      }
      const ok = t.closest('[data-ok]'), no = t.closest('[data-no]');
      if (ok || no) {
        const l = DB.leaves.find(x => x.id === (ok || no).dataset[ok ? 'ok' : 'no']);
        const note = $(`[data-note="${l.id}"]`, root).value.trim();
        if (leaveEnded(l)) { toast('Sesi sudah selesai, pengajuan diarsipkan sebagai Tidak hadir.', 'error'); return App.refresh(); }
        if (no && !note) { toast('Tuliskan catatan alasan penolakan untuk pelajar.', 'error'); $(`[data-note="${l.id}"]`, root).focus(); return; }
        Object.assign(l, { status: ok ? 'disetujui' : 'ditolak', decisionNote: note || 'Disetujui.', decisionBy: App.user.name, decisionAt: stamp() });
        const st = Q.student(l.studentId);
        if (ok) {
          Q.attOf(l.studentId)[l.sessionId] = { status: 'izin', time: null };
          DB.audit.unshift({ who: 'Sistem', at: stamp(), what: `Status presensi ${st.name} otomatis menjadi “Izin” (pengajuan disetujui)` });
        } else {
          setAttOverride(l.sessionId, l.studentId, 'alpa', App.user.name, `Izin ditolak Kurikulum: ${note}`, 'Izin ditolak Kurikulum → tidak hadir');
          DB.audit.unshift({ who: App.user.name, at: stamp(), what: `Izin ${st.name} ditolak Kurikulum → Tidak hadir` });
        }
        if (st.id === 'p1') DB.notifications.pelajar.unshift({ title: `Izin ${ok ? 'disetujui' : 'ditolak'}`, text: ok ? (note || 'Pengajuan izinmu disetujui Kurikulum.') : `${note} · Presensi sesi ini tercatat Tidak hadir.`, at: stamp(), unread: true, icon: 'clipboard' });
        toast(ok ? 'Izin disetujui. Status presensi otomatis menjadi “Izin”.' : 'Izin ditolak. Pelajar tercatat Tidak hadir.', ok ? 'success' : 'info');
        return App.refresh();
      }
    });
  },
};

/* ---------- Laporan Perkembangan ---------- */
const LapState = { grp: 'all' };
PanitiaPages.laporan = {
  title: 'Laporan Perkembangan',
  render() {
    const groups = Q.myGroups();
    if (LapState.grp !== 'all' && !groups.find(g => g.id === LapState.grp)) LapState.grp = 'all';
    const students = Q.scopeStudents().filter(s => LapState.grp === 'all' || s.groupId === LapState.grp);
    const atts = students.map(s => Q.attStats(s.id).pct);
    const tavg = students.map(s => Q.taskAvg(s.id));
    const tos = students.map(s => Q.lastTO(s.id));
    const watch = students.filter(s => Q.attStats(s.id).pct < 80 || Q.taskAvg(s.id) < 72);
    const toTrend = [0, 1, 2, 3].map(i => avg(students.map(s => (s.id === 'p1' && DB.tryouts.length > i ? DB.tryouts.map(Q.toAvg) : s.toHist)[i] || 0)));
    const scopeLabel = Q.seeAll() ? 'Rekap menyeluruh seluruh Kelompok Kelas' : App.has('wali') ? 'Pelajar di Kelompok Kelas dampinganmu' : 'Pelajar di Kelompok Kelas yang kamu ajar';
    return `
    <div class="page-head">
      <div><h1>Laporan Perkembangan</h1></div>
      <div class="actions"><button class="btn btn-ghost" data-dl>${icon('download', 16)} Unduh rekap</button>${App.has('kurikulum') ? `<button class="btn btn-primary" data-to>${icon('upload', 16)} Input hasil tryout</button>` : ''}</div>
    </div>
    <div class="chips" style="margin-bottom:16px">
      <button class="chip ${LapState.grp === 'all' ? 'active' : ''}" data-grp="all">Semua Kelompok Kelas</button>
      ${groups.map(g => `<button class="chip ${LapState.grp === g.id ? 'active' : ''}" data-grp="${g.id}">${esc(g.name)}</button>`).join('')}
    </div>
    <div class="stats">
      ${statCard('checkCircle', avg(atts) + '%', 'Rata-rata kehadiran', 'success', `${students.length} pelajar`)}
      ${statCard('target', avg(tavg), 'Rata-rata nilai tugas', 'primary')}
      ${statCard('trending', avg(tos), 'Rata-rata tryout terakhir', 'accent', `${trendMark(toTrend[3] - toTrend[2])} dari TO sebelumnya`)}
      ${statCard('alert', watch.length, 'Perlu perhatian', 'danger', 'Kehadiran <80% / nilai <72')}
    </div>
    <div class="cols cols-1-1">
      <div class="card"><div class="card-head"><h3>Kehadiran per Kelompok Kelas</h3></div>
        ${barChart(groups.filter(g => LapState.grp === 'all' || g.id === LapState.grp).map(g => ({ label: g.name, value: avg(Q.studentsOf(g.id).map(s => Q.attStats(s.id).pct)), color: g.color })), { max: 100, suffix: '%' })}
      </div>
      <div class="card"><div class="card-head"><h3>Tren rata-rata tryout eksternal</h3></div>
        ${lineChart(toTrend.map((v, i) => ({ label: 'TO #' + (i + 1), value: v })), { min: 400, max: 700, color: '#a0336b', steps: 3, h: 210 })}
      </div>
    </div>
    <div class="card mt">
      <div class="card-head"><h3>Rekap pelajar</h3><span class="muted small">Klik baris untuk detail</span></div>
      <div class="table-wrap"><table><thead><tr><th>Pelajar</th><th>Kelompok Kelas</th><th style="width:170px">Kehadiran</th><th>Skor presensi</th><th>Nilai tugas</th><th>Tryout terakhir</th><th>Status</th></tr></thead><tbody>
        ${students.map(s => { const p = Q.attStats(s.id).pct, t = Q.taskAvg(s.id), flag = p < 80 || t < 72; return `<tr style="cursor:pointer" data-detail="${s.id}"><td><div class="cell-user">${avatar(s.name, 'sm')}<div><b>${esc(s.name)}</b><small>${esc(s.school)}</small></div></div></td><td>${tag(Q.grp(s.groupId))}</td><td>${progRow(p, toneByPct(p))}</td><td><b>${Q.attStats(s.id).score}</b></td><td><b>${t}</b></td><td>${Q.lastTO(s.id)}</td><td>${flag ? badge('Perlu perhatian', 'danger') : badge('Baik', 'success')}</td></tr>`; }).join('')}
      </tbody></table></div>
    </div>`;
  },
  mount(root) {
    root.addEventListener('click', e => {
      const c = e.target.closest('[data-grp]'); if (c) { LapState.grp = c.dataset.grp; return App.refresh(); }
      const d = e.target.closest('[data-detail]'); if (d) return studentDetailModal(d.dataset.detail);
      if (e.target.closest('[data-dl]')) return toast('Rekap laporan disiapkan (demo).', 'info');
      if (e.target.closest('[data-to]')) return this.tryoutModal();
    });
  },
  tryoutModal() {
    const subs = ['PU', 'PPU', 'PBM', 'PK', 'LBI', 'LBE', 'PM'];
    openModal({
      title: 'Input hasil tryout eksternal', sub: 'BAT tidak menyelenggarakan tryout di aplikasi; hasil dari platform eksternal diinput di sini.', size: 'lg',
      body: `<div class="form-grid two">
        <label class="field"><span>Pelajar</span><select id="to-st">${Q.activeStudents().map(s => `<option value="${s.id}">${esc(s.name)} · ${esc(Q.grp(s.groupId).name)}</option>`).join('')}</select></label>
        <label class="field"><span>Nama tryout</span><input id="to-name" value="Tryout Eksternal #5"></label>
        <label class="field"><span>Platform penyelenggara</span><input id="to-plat" placeholder="cth. Mitra TO Nasional"></label>
        <label class="field"><span>Tanggal</span><input type="date" id="to-date" value="${todayStr()}"></label>
      </div>
      <div class="field"><span>Skor per subtes (0–1000)</span></div>
      <div class="form-grid" style="grid-template-columns:repeat(auto-fill,minmax(110px,1fr))">${subs.map(k => `<label class="field"><span>${k}</span><input type="number" min="0" max="1000" data-sub="${k}" placeholder="0"></label>`).join('')}</div>
      <div class="note info">${icon('upload', 15)}<span>Punya banyak data? Unggah berkas CSV/Excel dari platform tryout (tersedia di versi penuh).</span></div>`,
      footer: `<button class="btn btn-ghost" data-close>Batal</button><button class="btn btn-primary" id="to-save">Simpan hasil</button>`,
      onMount(m) {
        $('#to-save', m).addEventListener('click', () => {
          const scores = {}; let bad = false;
          $$('[data-sub]', m).forEach(i => { const v = Number(i.value); i.style.borderColor = ''; if (i.value === '' || isNaN(v) || v < 0 || v > 1000) { i.style.borderColor = 'var(--danger)'; bad = true; } scores[i.dataset.sub] = v; });
          if (bad) return toast('Lengkapi semua skor subtes (0–1000).', 'error');
          const sid = $('#to-st', m).value, st = Q.student(sid);
          const t = { id: 'to' + Date.now(), name: $('#to-name', m).value || 'Tryout Eksternal', platform: $('#to-plat', m).value || '-', date: $('#to-date', m).value, scores };
          if (sid === 'p1') DB.tryouts.push(t); else { st.toHist.shift(); st.toHist.push(Q.toAvg(t)); }
          closeModal(); toast(`Hasil tryout ${esc(st.name)} tersimpan (rata-rata ${Q.toAvg(t)}).`); App.refresh();
        });
      },
    });
  },
};

/* ---------- Pengguna & Peran (Administrator) ---------- */
const UserState = { role: 'all' };
PanitiaPages.pengguna = {
  title: 'Pengguna & Peran',
  render() {
    const roles = Object.keys(DB.roles);
    const list = DB.staff.filter(s => UserState.role === 'all' || s.role === UserState.role);
    return `
    <div class="page-head">
      <div><h1>Pengguna & Peran</h1></div>
      <div class="actions"><button class="btn btn-primary" data-new-user>${icon('userPlus', 16)} Tambah panitia</button></div>
    </div>
    <div class="stats">
      ${statCard('user', DB.staff.filter(s => s.role === 'tutor').length, 'Tutor', 'primary')}
      ${statCard('users', DB.staff.filter(s => s.role === 'wali').length, 'Wali Kelas', 'accent')}
      ${statCard('book', DB.staff.filter(s => s.role === 'kurikulum').length, 'Kurikulum', 'info')}
      ${statCard('key', DB.staff.filter(s => ['ketua', 'admin'].includes(s.role)).length, 'Ketua & Administrator', 'success')}
    </div>
    <div class="card">
      <div class="chips" style="margin-bottom:14px"><button class="chip ${UserState.role === 'all' ? 'active' : ''}" data-role="all">Semua<span class="cnt">${DB.staff.length}</span></button>${roles.map(r => `<button class="chip ${UserState.role === r ? 'active' : ''}" data-role="${r}">${DB.roles[r]}<span class="cnt">${DB.staff.filter(s => s.role === r).length}</span></button>`).join('')}</div>
      <div class="table-wrap"><table><thead><tr><th>Panitia</th><th>Peran</th><th>Penugasan</th><th></th></tr></thead><tbody>
        ${list.map(s => `<tr><td><div class="cell-user">${avatar(s.name, 'sm')}<div><b>${esc(s.name)}</b><small>${esc(s.email)}</small></div></div></td>
          <td>${badge(DB.roles[s.role], s.role === 'admin' ? 'danger' : s.role === 'wali' ? 'accent' : 'primary', 'no-dot')}</td>
          <td>${this.assignment(s)}</td>
          <td style="text-align:right"><button class="btn btn-sm btn-ghost" data-edit-user="${s.id}">${icon('edit', 14)} Ubah</button></td></tr>`).join('')}
      </tbody></table></div>
    </div>`;
  },
  assignment(s) {
    if (s.role === 'tutor') {
      const up = DB.sessions.filter(x => x.tutor === s.name && Q.isUpcoming(x)).length;
      return `<div class="row wrap" style="gap:4px">${s.subjects.map(id => stag(Q.subj(id))).join('')}</div><div class="muted small">${up} sesi mendatang</div>`;
    }
    if (s.role === 'wali') { const gs = DB.groups.filter(g => g.wali === s.name); return gs.length ? `<div class="row wrap" style="gap:4px">${gs.map(tag).join('')}</div>` : '<span class="muted small">Belum memegang kelompok</span>'; }
    return '<span class="muted small">Seluruh BAT</span>';
  },
  mount(root) {
    root.addEventListener('click', e => {
      const r = e.target.closest('[data-role]'); if (r) { UserState.role = r.dataset.role; return App.refresh(); }
      const ed = e.target.closest('[data-edit-user]'); if (ed) return this.form(ed.dataset.editUser);
      if (e.target.closest('[data-new-user]')) return this.form(null);
    });
  },
  form(id) {
    const s = id ? DB.staff.find(x => x.id === id) : null;
    const subjChecks = sel => DB.subjects.filter(x => x.active || sel.includes(x.id)).map(x => `<label class="check-chip"><input type="checkbox" value="${x.id}" ${sel.includes(x.id) ? 'checked' : ''}><span style="--c:${x.color}"><b>${esc(x.code)}</b><small>${esc(x.name)}</small></span></label>`).join('');
    openModal({
      title: s ? 'Ubah peran panitia' : 'Tambah panitia', sub: s ? s.name : 'Akun baru menerima email undangan.', size: 'lg',
      body: `<div class="form-grid two">
        <label class="field"><span>Nama lengkap</span><input id="uf-name" value="${s ? esc(s.name) : ''}" ${s ? 'disabled title="Nama terhubung ke jadwal & riwayat"' : ''}><small class="field-err"></small></label>
        <label class="field"><span>Email</span><input id="uf-email" type="email" value="${s ? esc(s.email) : ''}" placeholder="nama@bat.id"><small class="field-err"></small></label>
        <label class="field span-2"><span>Peran</span><select id="uf-role">${Object.entries(DB.roles).map(([k, v]) => `<option value="${k}" ${s && s.role === k ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
        <div class="field span-2" id="uf-subj-wrap"><span>Mata Pelajaran yang diampu</span><div class="check-grid" id="uf-subj">${subjChecks(s ? s.subjects : [])}</div><small class="field-err" id="uf-subj-err"></small></div>
      </div>
      <div id="uf-warn"></div>
      <div class="note info">${icon('shield', 15)}<span>Satu akun memegang satu peran. Tutor tidak dapat merangkap Wali Kelas; Wali Kelas tidak dapat dijadwalkan mengajar.</span></div>`,
      footer: `<button class="btn btn-ghost" data-close>Batal</button><button class="btn btn-primary" id="uf-save">${icon('check', 16)} Simpan</button>`,
      onMount(m) {
        const sync = () => { $('#uf-subj-wrap', m).classList.toggle('hidden', $('#uf-role', m).value !== 'tutor'); $('#uf-warn', m).innerHTML = ''; };
        $('#uf-role', m).addEventListener('change', sync); sync();
        $('#uf-save', m).addEventListener('click', () => {
          const name = $('#uf-name', m).value.trim(), email = $('#uf-email', m).value.trim(), role = $('#uf-role', m).value;
          const subjects = role === 'tutor' ? $$('#uf-subj input:checked', m).map(i => i.value) : [];
          fieldErr($('#uf-name', m), name ? '' : 'Nama wajib diisi.');
          fieldErr($('#uf-email', m), /^\S+@\S+\.\S+$/.test(email) ? '' : 'Format email tidak valid.');
          $('#uf-subj-err', m).textContent = role === 'tutor' && !subjects.length ? 'Pilih minimal satu mapel.' : '';
          if (!name || !/^\S+@\S+\.\S+$/.test(email) || (role === 'tutor' && !subjects.length)) return;
          // Aturan: Tutor ≠ Wali Kelas — cegah perubahan peran yang melanggar penugasan berjalan
          if (s && s.role !== role) {
            const held = DB.groups.filter(g => g.wali === s.name);
            const teach = DB.sessions.filter(x => x.tutor === s.name && Q.isUpcoming(x));
            const msg = s.role === 'wali' && held.length ? `${esc(s.name)} masih menjadi Wali Kelas untuk <b>${held.map(g => esc(g.name)).join(', ')}</b>. Ganti Wali Kelas kelompok tersebut terlebih dahulu.`
              : s.role === 'tutor' && teach.length ? `${esc(s.name)} masih dijadwalkan mengajar <b>${teach.length} sesi mendatang</b>. Alihkan sesi ke tutor lain di Manajemen Jadwal terlebih dahulu.` : '';
            if (msg) { $('#uf-warn', m).innerHTML = `<div class="alert alert-danger">${icon('alert', 16)}<span>${msg}</span></div>`; return; }
          }
          if (s) Object.assign(s, { email, role, subjects });
          else DB.staff.push({ id: 'st' + Date.now(), name, email, role, subjects });
          closeModal(); toast(s ? `Peran ${esc(s.name)} diperbarui.` : `${esc(name)} ditambahkan sebagai ${DB.roles[role]}.`); App.refresh();
        });
      },
    });
  },
};

/* ---------- Pengaturan ---------- */
PanitiaPages.pengaturan = {
  title: 'Pengaturan',
  render() {
    const u = App.user;
    /* Pengaturan presensi: Tutor, Kurikulum, dan Administrator */
    const canSys = App.has('kurikulum', 'tutor');
    return `
    <div class="page-head"><div><h1>Pengaturan</h1></div></div>
    <div class="cols cols-3-2">
      <div>
        <div class="card">
          <div class="card-head"><h3>Profil akun</h3></div>
          <div class="row" style="gap:16px;margin-bottom:18px">${avatar(u.name, 'lg')}<div><b style="font-size:18px">${esc(u.name)}</b><p class="muted">${esc(u.email)}</p><div class="role-chips" style="margin-top:8px">${roleBadges(u)}</div></div></div>
          <div class="form-grid two">
            <label class="field"><span>Nama lengkap</span><input id="st-name" value="${esc(u.name)}"></label>
            <label class="field"><span>Email</span><input value="${esc(u.email)}" disabled></label>
          </div>
          <div class="row" style="margin-top:14px;justify-content:flex-end"><button class="btn btn-ghost" data-pw>${icon('lock', 16)} Ubah kata sandi</button><button class="btn btn-primary" data-save-profile>Simpan profil</button></div>
        </div>
        <div class="card mt">
          <div class="card-head"><h3>${icon('bell', 16)} Notifikasi</h3></div>
          <p class="muted small" style="margin-bottom:8px">Notifikasi hanya tampil di dalam aplikasi (ikon lonceng). Belum ada pengiriman keluar web.</p>
          ${[['Pengajuan izin baru', true], ['Pengumpulan tugas', true], ['Koreksi presensi', true], ['Ringkasan harian', false]].map(([t, on]) => `<div class="setting-row"><div><b>${t}</b></div><label class="switch"><input type="checkbox" ${on ? 'checked' : ''} data-toggle><span></span></label></div>`).join('')}
        </div>
        <div class="card mt">
          <div class="setting-row"><div><b>Keluar dari akun</b><small>Akhiri sesi di perangkat ini</small></div><button class="btn btn-sm btn-danger" data-action="logout">${icon('logout', 14)} Keluar</button></div>
        </div>
      </div>
      <div>
        ${yearCard()}
        <div class="card mt">
          <div class="card-head"><h3>${icon('locate', 16)} Pengaturan presensi</h3>${canSys ? '' : badge('Hanya Tutor, Kurikulum, Admin', 'neutral', 'no-dot')}</div>
          <div class="form-grid">
            <label class="field"><span>Batas Hadir sejak presensi dibuka (menit)</span><input type="number" id="st-late" value="${DB.settings.lateTolerance}" min="0" max="60" ${canSys ? '' : 'disabled'}></label>
            <label class="field"><span>Radius area presensi (meter)</span><input type="number" id="st-radius" value="${DB.settings.geoRadius}" min="20" max="1000" ${canSys ? '' : 'disabled'}><small class="muted small">Pelajar harus berada dalam radius ini dari titik lokasi tempat sesi.</small></label>
            <label class="field"><span>Batas pengajuan izin</span><select id="st-izin" ${canSys ? '' : 'disabled'}>${['H-0', 'H-1', 'H-2'].map(v => `<option ${DB.settings.leaveDeadline === v ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
            <label class="field"><span>Batas pengajuan koreksi presensi (hari)</span><input type="number" id="st-corr" value="${DB.settings.correctionWindow}" min="1" max="7" ${canSys ? '' : 'disabled'}></label>
          </div>
          <div class="field mt"><span>Titik lokasi tempat sesi</span>
            <small class="muted small" style="margin-bottom:6px">Nama · kata kunci pada kolom “Tempat” sesi · lintang · bujur</small>
            ${DB.places.map(pl => `<div class="place-row" data-place="${pl.id}">
              <input data-k="name" value="${esc(pl.name)}" aria-label="Nama titik" ${canSys ? '' : 'disabled'}>
              <input data-k="match" value="${esc(pl.match)}" aria-label="Kata kunci tempat" ${canSys ? '' : 'disabled'}>
              <input data-k="lat" value="${pl.lat}" inputmode="decimal" aria-label="Lintang" ${canSys ? '' : 'disabled'}>
              <input data-k="lng" value="${pl.lng}" inputmode="decimal" aria-label="Bujur" ${canSys ? '' : 'disabled'}>
            </div>`).join('')}
            ${canSys ? `<div class="row wrap" style="gap:8px;margin-top:8px"><button class="btn btn-sm btn-ghost" data-add-place>${icon('plus', 14)} Tambah titik</button><button class="btn btn-sm btn-ghost" data-here>${icon('locate', 14)} Isi titik terakhir dengan lokasi saya</button></div>` : ''}
          </div>
          ${canSys ? `<button class="btn btn-primary btn-block mt" data-save-sys>Simpan pengaturan</button>` : ''}
        </div>
      </div>
    </div>`;
  },
  mount(root) {
    root.addEventListener('change', e => { if (e.target.matches('[data-toggle]')) toast('Preferensi notifikasi disimpan.'); });
    root.addEventListener('click', e => {
      if (e.target.closest('[data-pw]')) return openPasswordModal();
      if (e.target.closest('[data-save-profile]')) return toast('Profil disimpan (demo).');
      if (e.target.closest('[data-add-place]')) {
        if (!App.has('kurikulum', 'tutor')) return toast('Hanya Tutor, Kurikulum, dan Administrator yang dapat mengubah pengaturan presensi dan titik lokasi.', 'error');
                DB.places.push({ id: 'pl' + Date.now(), name: 'Titik baru', match: 'Titik baru', lat: DB.places[0].lat, lng: DB.places[0].lng });
        return App.refresh();
      }
      if (e.target.closest('[data-here]')) {
        if (!App.has('kurikulum', 'tutor')) return toast('Hanya Tutor, Kurikulum, dan Administrator yang dapat mengubah pengaturan presensi dan titik lokasi.', 'error');
                if (!navigator.geolocation) return toast('Browser tidak mendukung GPS.', 'error');
        return navigator.geolocation.getCurrentPosition(pos => {
          const row = $$('[data-place]', root).pop();
          row.querySelector('[data-k="lat"]').value = pos.coords.latitude.toFixed(6);
          row.querySelector('[data-k="lng"]').value = pos.coords.longitude.toFixed(6);
          toast('Koordinat terisi. Klik Simpan pengaturan.', 'info');
        }, () => toast('Lokasi tidak dapat diambil. Periksa izin lokasi browser.', 'error'), { enableHighAccuracy: true, timeout: 10000 });
      }
      if (e.target.closest('[data-save-sys]')) {
        if (!App.has('kurikulum', 'tutor')) return toast('Hanya Tutor, Kurikulum, dan Administrator yang dapat mengubah pengaturan presensi dan titik lokasi.', 'error');
                DB.settings.lateTolerance = Number($('#st-late', root).value) || 15;
        DB.settings.geoRadius = Math.min(1000, Math.max(20, Number($('#st-radius', root).value) || 100));
        $$('[data-place]', root).forEach(row => {
          const pl = DB.places.find(p => p.id === row.dataset.place); if (!pl) return;
          const v = k => row.querySelector(`[data-k="${k}"]`).value;
          pl.name = v('name').trim() || pl.name; pl.match = v('match').trim() || pl.match;
          const la = parseFloat(v('lat')), ln = parseFloat(v('lng')); if (!isNaN(la)) pl.lat = la; if (!isNaN(ln)) pl.lng = ln;
        });
        DB.settings.leaveDeadline = $('#st-izin', root).value;
        DB.settings.correctionWindow = Number($('#st-corr', root).value) || 2;
        toast('Pengaturan presensi disimpan.');
      }
    });
  },
};
