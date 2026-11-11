/* =========================================================
   LMS BAT — App shell, login, navigasi & router (hash-based)
   ========================================================= */
const App = {
  user: null,
  get isPanitia() { return !!this.user && this.user.type === 'panitia'; },
  /* Administrator dapat mengakses seluruh menu & aksi */
  get isAdmin() { return !!this.user && (this.user.roles || []).includes('admin'); },
  has(...roles) { return !!this.user && (this.isAdmin || roles.some(r => (this.user.roles || []).includes(r))); },
  refresh() { render(true); },
};

const PELAJAR_NAV = [
  { id: 'beranda', label: 'Beranda', icon: 'home' },
  { id: 'kelas', label: 'Kelompok Kelas', icon: 'layers', short: 'Kelompok' },
  { id: 'jadwal', label: 'Jadwal', icon: 'calendar' },
  { id: 'tugas', label: 'Materi dan Tugas', icon: 'file', short: 'Tugas' },
  { id: 'presensi', label: 'Presensi', icon: 'qr' },
  { id: 'izin', label: 'Izin', icon: 'clipboard' },
  { id: 'laporan', label: 'Laporan Perkembangan', icon: 'chart' },
  { id: 'profil', label: 'Profil', icon: 'user' },
];
const PANITIA_NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid', roles: '*' },
  { id: 'pelajar', label: 'Manajemen Pelajar', icon: 'users', short: 'Pelajar', roles: ['wali', 'kurikulum', 'ketua'] },
  { id: 'kelas', label: 'Manajemen Kelas', icon: 'layers', short: 'Kelas', roles: ['tutor', 'wali', 'kurikulum', 'ketua'],
    sub: [
      { path: 'kelas', label: 'Kelompok Kelas', match: p => p[0] !== 'mapel' },
      { path: 'kelas/mapel', label: 'Mata Pelajaran', match: p => p[0] === 'mapel' },
    ] },
  { id: 'jadwal', label: 'Manajemen Jadwal', icon: 'calendar', short: 'Jadwal', roles: ['tutor', 'wali', 'kurikulum', 'ketua'] },
  { id: 'materi', label: 'Materi dan Tugas', icon: 'file', short: 'Materi', roles: ['tutor', 'kurikulum', 'ketua'] },
  { id: 'presensi', label: 'Presensi', icon: 'qr', roles: ['tutor', 'wali', 'kurikulum', 'ketua'] },
  { id: 'perizinan', label: 'Perizinan', icon: 'clipboard', short: 'Izin', roles: ['wali', 'kurikulum', 'ketua'], count: () => myLeaveActions().length },
  { id: 'laporan', label: 'Laporan Perkembangan', icon: 'chart', short: 'Laporan', roles: ['tutor', 'wali', 'kurikulum', 'ketua'] },
  { id: 'pengguna', label: 'Pengguna & Peran', icon: 'key', short: 'Pengguna', roles: ['admin'] },
  { id: 'pengaturan', label: 'Pengaturan', icon: 'settings', roles: '*' },
];
const navItems = () => App.isPanitia ? PANITIA_NAV.filter(n => n.roles === '*' || App.has(...n.roles)) : PELAJAR_NAV;
const defaultRoute = () => App.isPanitia ? 'dashboard' : 'beranda';

/* ---------- Login ---------- */
const LoginPage = {
  render() {
    return `
    <div class="login">
      <section class="login-hero">
        <div class="hero-glow"></div><div class="hero-grid"></div>
        <div class="brand">${LOGO(46)}<div><b>LMS BAT</b><span>Bimbingan Alumni Tutoring</span></div></div>
        <div class="hero-copy">
          <span class="eyebrow-pill">${icon('sparkle', 14)} Persiapan UTBK/SNBT · Yogyakarta</span>
          <h1>Satu tempat untuk <span class="grad">belajar, hadir,</span> dan berkembang bersama.</h1>
          <p>Kelompok Kelas, jadwal sesi, materi, tugas, presensi berbasis lokasi, hingga perizinan, semuanya terintegrasi dalam satu aplikasi web komunitas BAT.</p>
          <div class="value-chips"><span>Inklusif</span><span>Growth</span><span>Impact</span><span>Commitment</span></div>
        </div>
        <div class="hero-preview">
          <div class="pv-card"><small>Kehadiran</small><b>94%</b>${progress(94, 'var(--success)')}<p class="muted small" style="margin-top:8px">22 dari 24 sesi</p></div>
          <div class="pv-card"><small>Izin</small><b style="font-size:16px;margin-top:8px">Disetujui ✓</b>
            <div class="timeline" style="margin-top:6px"><div class="tl done"><span>Wali Kelas</span></div><div class="tl done"><span>Kurikulum</span></div></div></div>
        </div>
        <p class="hero-motto">“BAT?! Show The Way~”</p>
      </section>
      <section class="login-panel">
        <form class="login-card" id="login-form" novalidate>
          <div class="brand">${LOGO(42)}<div><b>LMS BAT</b><span>BAT?! Show The Way~</span></div></div>
          <div><h2>Masuk ke akun</h2><p class="muted" style="margin-top:4px">Gunakan email dan kata sandi yang terdaftar di BAT.</p></div>
          <div class="alert alert-danger hidden" id="login-error" role="alert">${icon('alert', 16)}<span></span></div>
          <label class="field" id="f-email"><span>Email</span><div class="input-ic">${icon('mail', 18)}<input type="email" id="email" placeholder="nama@bat.id" autocomplete="username"></div><small class="field-err"></small></label>
          <label class="field" id="f-pass"><span>Kata sandi</span><div class="input-ic">${icon('lock', 18)}<input type="password" id="password" placeholder="••••••••" autocomplete="current-password"><button type="button" class="pw-toggle" id="pw-toggle" aria-label="Tampilkan kata sandi">${icon('eye', 18)}</button></div><small class="field-err"></small></label>
          <div class="row-between"><label class="check"><input type="checkbox" checked> Ingat saya</label><a href="#" id="forgot" style="color:var(--primary);font-weight:700;font-size:13px">Lupa kata sandi?</a></div>
          <button class="btn btn-primary btn-lg btn-block" type="submit" id="login-btn">Masuk</button>
          <div class="demo-box">
            <p>Akun demo · kata sandi <code>bat123</code></p>
            <div class="demo-grid">${DB.accounts.map(a => `<button type="button" class="demo-acc" data-email="${a.email}">${avatar(a.name, 'xs')}<span><b>${a.label}</b><small>${a.email}</small></span></button>`).join('')}</div>
          </div>
          <p class="muted small" style="text-align:center">Prototipe antarmuka · data dummy tanpa database</p>
        </form>
      </section>
    </div>`;
  },
  mount() {
    const form = $('#login-form');
    const setErr = (id, msg) => { const f = $(id); f.classList.toggle('invalid', !!msg); f.querySelector('.field-err').textContent = msg || ''; };
    const showAlert = msg => { const a = $('#login-error'); a.classList.toggle('hidden', !msg); a.querySelector('span').textContent = msg || ''; };
    $$('.demo-acc').forEach(b => b.addEventListener('click', () => { $('#email').value = b.dataset.email; $('#password').value = 'bat123'; setErr('#f-email'); setErr('#f-pass'); showAlert(); $('#login-btn').focus(); }));
    $('#pw-toggle').addEventListener('click', () => { const p = $('#password'); p.type = p.type === 'password' ? 'text' : 'password'; });
    $('#forgot').addEventListener('click', e => {
      e.preventDefault();
      openModal({
        title: 'Lupa kata sandi', sub: 'Kami akan mengirim tautan untuk mengatur ulang kata sandi.',
        body: `<label class="field"><span>Email terdaftar</span><input type="email" id="fg-email" value="${esc($('#email').value)}" placeholder="nama@bat.id"><small class="field-err"></small></label>`,
        footer: `<button class="btn btn-ghost" data-close>Batal</button><button class="btn btn-primary" id="fg-send">Kirim tautan</button>`,
        onMount(m) {
          $('#fg-send', m).addEventListener('click', () => {
            const v = $('#fg-email', m).value.trim();
            if (!/^\S+@\S+\.\S+$/.test(v)) { const f = $('#fg-email', m).closest('.field'); f.classList.add('invalid'); f.querySelector('.field-err').textContent = 'Masukkan email yang valid.'; return; }
            closeModal(); toast(`Tautan reset dikirim ke ${esc(v)} (demo).`);
          });
        },
      });
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      showAlert();
      const email = $('#email').value.trim().toLowerCase(), pass = $('#password').value;
      let ok = true;
      if (!email) { setErr('#f-email', 'Email wajib diisi.'); ok = false; }
      else if (!/^\S+@\S+\.\S+$/.test(email)) { setErr('#f-email', 'Format email tidak valid.'); ok = false; }
      else setErr('#f-email');
      if (!pass) { setErr('#f-pass', 'Kata sandi wajib diisi.'); ok = false; } else setErr('#f-pass');
      if (!ok) return;
      const btn = $('#login-btn'); btn.classList.add('loading'); btn.textContent = 'Memproses';
      setTimeout(() => {
        const acc = DB.accounts.find(a => a.email === email);
        if (!acc || pass !== 'bat123') {
          btn.classList.remove('loading'); btn.textContent = 'Masuk';
          showAlert('Email atau kata sandi salah. Periksa kembali atau gunakan akun demo di bawah.');
          return;
        }
        const st = acc.studentId && Q.student(acc.studentId);
        if (acc.studentId && (!st || !Q.isActive(st))) {
          btn.classList.remove('loading'); btn.textContent = 'Masuk';
          showAlert('Akun pelajar ini sedang dinonaktifkan. Hubungi Kurikulum BAT.');
          return;
        }
        login(acc);
      }, 650);
    });
  },
};

function login(acc) {
  App.user = JSON.parse(JSON.stringify(acc));
  sessionStorage.setItem('bat_user', acc.email);
  buildShell();
  location.hash = '#/' + defaultRoute();
  render();
  toast(`Selamat datang, ${esc(firstName(acc.name))}!`);
}
function logout() {
  Cleanup.run();
  App.user = null;
  sessionStorage.removeItem('bat_user');
  history.replaceState(null, '', location.pathname);
  render();
}

/* ---------- Shell ---------- */
function buildShell() {
  const u = App.user, items = navItems();
  const roleText = App.isPanitia ? u.roles.map(r => DB.roles[r]).join(' · ') : 'Pelajar · ' + Q.me().status;
  let bottom;
  if (App.isPanitia) {
    bottom = items.filter(n => n.id !== 'pengaturan').slice(0, 4).map(n => `<a class="bn-item" href="#/${n.id}" data-nav="${n.id}">${icon(n.icon, 22)}<span>${n.short || n.label}</span></a>`).join('');
  } else {
    const b = id => PELAJAR_NAV.find(n => n.id === id);
    const it = n => `<a class="bn-item" href="#/${n.id}" data-nav="${n.id}">${icon(n.icon, 22)}<span>${n.short || n.label}</span></a>`;
    bottom = it(b('beranda')) + it(b('kelas')) + `<a class="bn-item bn-fab" href="#/presensi" data-nav="presensi"><span class="fab">${icon('pin', 24)}</span><span>Presensi</span></a>` + it(b('tugas'));
  }
  $('#app').innerHTML = `
  <div class="shell">
    <aside class="sidebar" id="sidebar" aria-label="Navigasi utama">
      <div class="side-brand">${LOGO(38)}<div><b>LMS BAT</b><span>Bimbingan Alumni Tutoring</span></div><button class="icon-btn side-close" data-action="close-sidebar" aria-label="Tutup menu">${icon('x')}</button></div>
      <div class="side-user">${avatar(u.name)}<div class="side-user-info"><b>${esc(u.name)}</b><span>${esc(roleText)}</span></div></div>
      ${App.isPanitia ? `<div class="role-switch"><label for="role-switch">Demo · ganti akun panitia</label><select id="role-switch">${DB.accounts.filter(a => a.type === 'panitia').map(a => `<option value="${a.email}" ${a.email === u.email ? 'selected' : ''}>${a.label} — ${firstName(a.name)}</option>`).join('')}</select></div>` : ''}
      <nav class="side-nav">
        <p class="nav-label">${App.isPanitia ? 'Menu Panitia' : 'Menu Pelajar'}</p>
        ${items.map(n => { const cnt = n.count ? n.count() : 0; return `<a class="nav-item" href="#/${n.id}" data-nav="${n.id}">${icon(n.icon)}<span>${n.label}</span>${n.tag ? `<span class="nav-tag">${n.tag}</span>` : cnt ? `<span class="nav-count">${cnt}</span>` : ''}</a>${n.sub ? `<div class="nav-subs">${n.sub.map(s => `<a class="nav-sub" href="#/${s.path}" data-sub="${s.path}" data-parent="${n.id}">${s.label}</a>`).join('')}</div>` : ''}`; }).join('')}
      </nav>
      <div class="side-foot"><div class="motto">BAT?! Show The Way~</div><button class="nav-item" data-action="logout">${icon('logout')}<span>Keluar</span></button></div>
    </aside>
    <div class="scrim" data-action="close-sidebar"></div>
    <div class="main">
      <header class="topbar">
        <button class="icon-btn menu-btn" data-action="open-sidebar" aria-label="Buka menu">${icon('menu')}</button>
        <div class="topbar-title"><h2 id="page-title">LMS BAT</h2><span id="page-crumb">${App.isPanitia ? 'Panitia' : 'Pelajar'}</span></div>
        <div class="topbar-actions">
          <span class="role-pill">${icon(App.isPanitia ? 'shield' : 'user', 14)} ${esc(App.isPanitia ? u.label : 'Pelajar')}</span>
          <button class="icon-btn notif-btn" data-action="notif" aria-label="Notifikasi">${icon('bell')}<i class="dot ${unreadCount() ? '' : 'hidden'}"></i></button>
          <a class="top-avatar" href="#/${App.isPanitia ? 'pengaturan' : 'profil'}" aria-label="Profil">${avatar(u.name, 'sm')}</a>
        </div>
        <div class="notif-panel" id="notif-panel"></div>
      </header>
      <main class="content" id="content"></main>
    </div>
    <nav class="bottom-nav" aria-label="Navigasi bawah">${bottom}<button class="bn-item" data-action="open-sidebar">${icon('more', 22)}<span>Menu</span></button></nav>
  </div>`;
  const rs = $('#role-switch');
  if (rs) rs.addEventListener('change', () => { const acc = DB.accounts.find(a => a.email === rs.value); App.user = JSON.parse(JSON.stringify(acc)); sessionStorage.setItem('bat_user', acc.email); buildShell(); location.hash = '#/dashboard'; render(); toast(`Beralih ke ${acc.label} (${firstName(acc.name)}).`, 'info'); });
}

const notifList = () => DB.notifications[App.isPanitia ? 'panitia' : 'pelajar'];
const unreadCount = () => notifList().filter(n => n.unread).length;
function renderNotif() {
  const list = notifList();
  $('#notif-panel').innerHTML = `<div class="notif-head"><b>Notifikasi</b><button data-action="read-all">Tandai semua dibaca</button></div>
    <div class="notif-list">${list.length ? list.map(n => `<div class="notif ${n.unread ? 'unread' : ''}"><div class="item-ic" style="width:36px;height:36px">${icon(n.icon, 16)}</div><div><div class="notif-title">${esc(n.title)}</div><p>${esc(n.text)}</p><time>${relStamp(n.at)}</time></div></div>`).join('') : emptyState('bell', 'Belum ada notifikasi')}</div>`;
}
function updateShellBadges() {
  const dot = $('.notif-btn .dot'); if (dot) dot.classList.toggle('hidden', !unreadCount());
  if (App.isPanitia) PANITIA_NAV.filter(n => n.count).forEach(n => {
    const a = $(`.side-nav [data-nav="${n.id}"]`); if (!a) return;
    const c = n.count(); let el = a.querySelector('.nav-count');
    if (c && !el) { a.insertAdjacentHTML('beforeend', `<span class="nav-count">${c}</span>`); } else if (el) { if (c) el.textContent = c; else el.remove(); }
  });
}

/* ---------- Router ---------- */
function render(keepScroll) {
  Cleanup.run();
  closeModal(true);
  if (!App.user) { $('#app').innerHTML = LoginPage.render(); LoginPage.mount(); document.title = 'Masuk · LMS BAT'; return; }
  if (!$('.shell')) buildShell();
  const hash = location.hash.replace(/^#\/?/, '');
  const [page, ...params] = (hash || defaultRoute()).split('/');
  const pages = App.isPanitia ? PanitiaPages : PelajarPages;
  // Room Pertemuan (#/sesi/<id>) tidak ada di menu; hak akses dicek di halamannya
  const allowed = navItems().some(n => n.id === page) || page === 'sesi';
  if (!pages[page] || !allowed) { location.replace('#/' + defaultRoute()); return; }
  const p = pages[page];
  const y = window.scrollY;
  // ganti elemen konten agar listener halaman sebelumnya ikut terbuang
  const old = $('#content'), fresh = old.cloneNode(false);
  old.replaceWith(fresh);
  fresh.innerHTML = p.render(...params);
  const title = typeof p.title === 'function' ? p.title(...params) : p.title;
  $('#page-title').textContent = title;
  document.title = `${title} · LMS BAT`;
  if (p.mount) p.mount(fresh, ...params);
  const navPage = p.navAs || page;
  $$('[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === navPage));
  const navDef = navItems().find(n => n.id === navPage);
  $$('[data-sub]').forEach(a => {
    const sd = navDef && navDef.sub ? navDef.sub.find(s => s.path === a.dataset.sub) : null;
    a.classList.toggle('active', a.dataset.parent === navPage && !!sd && sd.match(params));
  });
  $('#page-crumb').textContent = p.crumb ? p.crumb(...params) : (App.isPanitia ? 'Panitia' : 'Pelajar');
  $('#sidebar').classList.remove('open');
  $('#notif-panel').classList.remove('open');
  updateShellBadges();
  if (keepScroll) { fresh.style.animation = 'none'; window.scrollTo(0, y); } else window.scrollTo(0, 0);
}

/* ---------- Event global ---------- */
document.addEventListener('click', e => {
  const act = e.target.closest('[data-action]');
  const panel = $('#notif-panel');
  if (panel && panel.classList.contains('open') && !e.target.closest('#notif-panel') && !(act && act.dataset.action === 'notif')) panel.classList.remove('open');
  if (!act) return;
  switch (act.dataset.action) {
    case 'open-sidebar': $('#sidebar').classList.add('open'); break;
    case 'close-sidebar': $('#sidebar').classList.remove('open'); break;
    case 'logout': closeModal(true); logout(); toast('Kamu telah keluar.', 'info'); break;
    case 'notif': renderNotif(); panel.classList.toggle('open'); break;
    case 'read-all': notifList().forEach(n => { n.unread = false; }); renderNotif(); updateShellBadges(); break;
  }
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if ($('#modal-root .modal-backdrop')) return closeModal();
  const sb = $('#sidebar'); if (sb) sb.classList.remove('open');
  const np = $('#notif-panel'); if (np) np.classList.remove('open');
});
window.addEventListener('hashchange', () => render());

/* ---------- Boot ---------- */
(function boot() {
  const saved = sessionStorage.getItem('bat_user');
  const acc = saved && DB.accounts.find(a => a.email === saved);
  if (acc) App.user = JSON.parse(JSON.stringify(acc));
  render();
})();
