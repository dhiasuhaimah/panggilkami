"use strict";
/* ============ Konfigurasi ============ */
const WA = '6282283883580', WA_DISP = '0822-8388-3580', NMID = 'ID1026484632207';
const VOUCHERS = { KOSBARU:{ off:5000, firstOnly:true, label:'potongan Rp 5.000' }, PANGGILKAMI:{ pct:100, label:'biaya jasa gratis 100%' }, PESANAJA:{ pct:50, label:'diskon 50% biaya jasa' } };
const SERVICES = [
  { id:'belanja', name:'Titip Belanja', icon:'bi-bag-check', price:15000, label:'Mulai Rp 15.000', flow:'beli',
    short:'Makanan, minimarket, pasar, apotek.',
    desc:'Titip makanan, kebutuhan minimarket, pasar, atau apotek. Biaya jasa Rp 15.000 belum termasuk harga barang. Setelah jasa dibayar di website, driver menghubungi Anda via WhatsApp untuk memastikan barang dan total belanja. Harga barang dibayar saat barang tiba sesuai struk asli (COD).' },
  { id:'antar', name:'Antar Jemput', icon:'bi-bicycle', price:15000, label:'0–5 KM Rp 15.000', flow:'ride',
    short:'Ke stasiun, kampus, kantor.',
    desc:'Antar jemput ke stasiun, kampus, atau kantor. Tarif Rp 15.000 untuk jarak 0–5 KM. Untuk jarak lebih jauh, tarif dikonfirmasi oleh admin melalui WhatsApp.' },
  { id:'kos', name:'Bersih Kos', icon:'bi-house-heart', price:120000, label:'Rp 120.000 / jam', flow:'bersih',
    short:'Sapu, pel, ganti sprei.',
    desc:'Pembersihan kamar kos meliputi menyapu, mengepel, dan mengganti sprei. Tarif Rp 120.000 per jam. Pilih durasi pada form pemesanan.' },
  { id:'wc', name:'Bersih WC', icon:'bi-droplet-half', price:100000, label:'Mulai Rp 100.000', flow:'bersih', photoReq:true,
    short:'Sikat kerak, kloset, wastafel.',
    desc:'Menyikat kerak, membersihkan kloset dan wastafel. Mulai Rp 100.000, menyesuaikan ukuran kamar mandi. Dilengkapi foto before–after sebagai bukti kebersihan.' },
  { id:'kurir', name:'Kurir Serabutan', icon:'bi-box-seam', price:15000, label:'Mulai Rp 15.000', flow:'beli',
    short:'Kirim dokumen, print skripsi, antre.',
    desc:'Kirim dokumen, cetak skripsi, mengantre, dan keperluan serabutan lainnya. Mulai Rp 15.000; tarif akhir dikonfirmasi sesuai tugas.' }
];
const FLOWS = {
  beli:   ['Pesanan Diterima','Driver OTW ke Toko','Barang Dibeli (Foto Struk)','OTW Antar ke Kamu','Selesai'],
  ride:   ['Pesanan Diterima','Driver OTW ke Lokasi Jemput','Penumpang Naik','Dalam Perjalanan','Sampai Tujuan & Selesai'],
  bersih: ['Pesanan Diterima','Petugas OTW ke Kos Kamu','Pembersihan Dimulai (Foto Before)','Pembersihan Selesai (Foto After)','Selesai']
};
const PHOTO = { belanja:['courier','center 35%'], antar:['ride','center 5%'], kos:['kos','center 30%'], wc:['wc','center 58%'], kurir:['office','80% 45%'] };
const svcPhoto = (id, lg) => { const p = PHOTO[id], s = svcById(id); return `<div class="svc-photo${lg?' lg':''}" style="background-image:url(${IMG[p[0]]});background-position:${p[1]}"><span class="svc-ico"><i class="bi ${s.icon}"></i></span></div>`; };
const svcById = id => SERVICES.find(s => s.id === id);
const flowOf = o => FLOWS[svcById(o.svc).flow];

/* ============ Util ============ */
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const rp = n => 'Rp ' + Number(n||0).toLocaleString('id-ID');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = p => p + Date.now().toString(36).toUpperCase().slice(-6) + Math.random().toString(36).slice(2,4).toUpperCase();
const fdate = t => new Date(t).toLocaleString('id-ID', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
const initials = n => (n||'?').trim().split(/\s+/).slice(0,2).map(w => w[0]).join('').toUpperCase();
const normWa = n => { n = String(n).replace(/[^\d+]/g,''); if (n.startsWith('+')) n = n.slice(1); if (n.startsWith('0')) n = '62' + n.slice(1); return n; };
const validWa = n => /^(08|628|\+628)\d{8,12}$/.test(String(n).replace(/[\s-]/g,''));
const waLink = (txt, num=WA) => `https://wa.me/${num}?text=${encodeURIComponent(txt)}`;
const db = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); if (window.pkCloudPush) window.pkCloudPush(k); return true; } catch { toast('Penyimpanan perangkat penuh. Hapus data lama atau gunakan foto yang lebih kecil.'); return false; } }
};
function toast(msg) {
  const t = document.createElement('div'); t.className = 'toast-pk'; t.textContent = msg;
  $('#toasts').appendChild(t); setTimeout(() => t.remove(), 3800);
}
function readImg(file, max=900, q=.72) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => { const i = new Image(); i.onload = () => {
      const s = Math.min(1, max / Math.max(i.width, i.height)); const c = document.createElement('canvas');
      c.width = Math.round(i.width*s); c.height = Math.round(i.height*s); c.getContext('2d').drawImage(i,0,0,c.width,c.height);
      res(c.toDataURL('image/jpeg', q)); }; i.onerror = rej; i.src = r.result; };
    r.onerror = rej; r.readAsDataURL(file);
  });
}
async function hashPw(pw, salt) {
  if (window.crypto && crypto.subtle) {
    const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + ':' + pw));
    return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2,'0')).join('');
  }
  let h = 5381; const s = salt + ':' + pw; for (let i=0;i<s.length;i++) h = ((h<<5)+h) ^ s.charCodeAt(i); return 'f' + (h>>>0).toString(16);
}
const stars = n => '★'.repeat(n) + '☆'.repeat(5-n);

/* ============ Data ============ */
const K = { users:'pk_users', orders:'pk_orders', tests:'pk_testimonials', sess:'pk_session', theme:'pk_theme', qris:'pk_qris', qrisP:'pk_qris_payload' };
const users = () => db.get(K.users, []);
const orders = () => db.get(K.orders, []);
const tests = () => db.get(K.tests, []);
function getSess() {
  try { return JSON.parse(localStorage.getItem(K.sess)) || JSON.parse(sessionStorage.getItem(K.sess)); } catch { return null; }
}
function me() { const s = getSess(); return s ? users().find(u => u.id === s.uid) || null : null; }
const isAdmin = () => me()?.role === 'admin';
async function seedAdmin() {
  /* Akun admin selalu dipastikan ada dan sesuai kredensial ini. */
  const us = users(); const salt = Math.random().toString(36).slice(2);
  const adm = { name:'Admin PanggilKami', email:'admin@gmail.com', salt, hash: await hashPw('123456', salt), role:'admin' };
  const i = us.findIndex(u => u.role === 'admin');
  if (i < 0) us.push({ id:uid('U'), photo:'', wa:'', area:'', at:Date.now(), ...adm }); else us[i] = { ...us[i], ...adm };
  db.set(K.users, us);
}

/* ============ Modal helper ============ */
let mdl;
function openModal(title, body, foot='') {
  $('#mdlTitle').innerHTML = title; $('#mdlBody').innerHTML = body; $('#mdlFoot').innerHTML = foot;
  $('#mdlFoot').style.display = foot ? '' : 'none';
  mdl = bootstrap.Modal.getOrCreateInstance($('#mdl')); mdl.show();
}
const closeModal = () => { mdl && mdl.hide(); };

/* ============ Navigasi ============ */
let view = 'home';
function navLinks() {
  const u = me(); const base = [
    ['home','top','Beranda'],['home','layanan','Layanan'],...(tests().some(x => x.visible !== false) ? [['home','testimoni','Ulasan']] : []),['home','tentang','Tentang'],['home','bantuan','Bantuan']];
  if (u && u.role !== 'admin') base.push(['orders','','Pesanan Saya']);
  if (u && u.role === 'admin') base.push(['admin','','Dasbor Admin']);
  return base;
}
function renderNav() {
  const u = me(), links = navLinks();
  $('#navLinks').innerHTML = links.map(l => `<a class="nav-link py-1" href="#" data-act="go" data-view="${l[0]}" data-anchor="${l[1]}">${l[2]}</a>`).join('');
  $('#menuLinks').innerHTML = links.map(l => `<a class="nav-link py-2 fs-6" href="#" data-act="go" data-view="${l[0]}" data-anchor="${l[1]}" data-close="1">${l[2]}</a>`).join('');
  const guest = `<button class="btn btn-pk btn-sm" data-act="auth" data-tab="login" data-close="1">Masuk &amp; Daftar</button>`;
  const user = u ? `<div class="dropdown"><button class="btn btn-sm btn-outline-light rounded-pill d-flex align-items-center gap-2" data-bs-toggle="dropdown"><span class="avatar" style="width:26px;height:26px;font-size:.75rem">${u.photo?`<img src="${u.photo}" alt="">`:esc(initials(u.name))}</span>${esc(u.name.split(' ')[0])}</button>
    <ul class="dropdown-menu dropdown-menu-end"><li><a class="dropdown-item" href="#" data-act="go" data-view="profile">Profil Saya</a></li>${u.role!=='admin'?'<li><a class="dropdown-item" href="#" data-act="go" data-view="orders">Pesanan Saya</a></li>':''}<li><hr class="dropdown-divider"></li><li><a class="dropdown-item text-danger" href="#" data-act="logout">Keluar</a></li></ul></div>` : '';
  $('#navAuth').innerHTML = u ? user : guest;
  $('#menuAuth').innerHTML = u ? `<div class="small mb-1" style="color:#b8cbe2">Masuk sebagai <strong>${esc(u.name)}</strong></div><button class="btn btn-outline-light" data-act="go" data-view="profile" data-close="1">Profil Saya</button><button class="btn btn-outline-danger" data-act="logout" data-close="1">Keluar</button>` : guest.replace('btn-sm','btn-lg w-100');
}
function go(v, anchor) {
  const u = me();
  if (['orders','profile'].includes(v) && !u) { authModal('login', 'Silakan masuk terlebih dahulu untuk mengakses halaman ini.'); return; }
  if (v === 'admin' && !isAdmin()) { authModal('login', 'Halaman ini khusus admin. Silakan masuk sebagai admin.'); return; }
  view = v;
  $$('.view').forEach(x => x.classList.toggle('active', x.id === 'v-' + v));
  renderView();
  requestAnimationFrame(() => {
    if (anchor && anchor !== 'top' && $('#' + anchor)) $('#' + anchor).scrollIntoView({ behavior:'smooth' });
    else window.scrollTo({ top:0, behavior:'smooth' });
  });
}
function renderView() {
  renderNav();
  if (view === 'home') { renderHome(); }
  if (view === 'orders') renderOrders();
  if (view === 'profile') renderProfile();
  if (view === 'admin') renderAdmin();
}

/* ============ HOME ============ */
function ratingInfo() {
  const t = tests().filter(x => x.visible !== false);
  const avg = t.length ? (t.reduce((a,b) => a + b.rating, 0) / t.length) : 0;
  return { n:t.length, avg };
}
function renderHome() {
  $('#svcGrid').innerHTML = SERVICES.map(s => `
    <div class="col-12 col-md-6 col-lg-4"><div class="pk-card svc" data-act="svc" data-id="${s.id}" role="button" tabindex="0">
      ${svcPhoto(s.id)}
      <div class="p-3 d-flex gap-3 align-items-start"><div class="flex-grow-1"><h5 class="mb-1">${s.name}</h5><div class="text-muted-pk small">${s.short}</div><div class="price mt-2">${s.label}</div></div><i class="bi bi-chevron-right text-muted-pk mt-1"></i></div></div></div>`).join('');
  const sel = $('#oSvc'), cur = sel.value;
  sel.innerHTML = '<option value="">Pilih Jasa ▼</option>' + SERVICES.map(s => `<option value="${s.id}">${s.name} — ${s.label}</option>`).join('');
  sel.value = cur;
  const u = me(); if (u) { if (!$('#oName').value) $('#oName').value = u.name; if (!$('#oWa').value && u.wa) $('#oWa').value = u.wa; }
  updateOrderForm();
  const { n, avg } = ratingInfo();
  $('#heroStars').textContent = n ? '★'.repeat(Math.round(avg)) + '☆'.repeat(5-Math.round(avg)) : '☆☆☆☆☆';
  $('#heroRating').textContent = n ? `${avg.toFixed(1)}/5 dari ${n} pelanggan` : 'Jadilah pelanggan pertama yang memberi ulasan';
  const pill = $('#ratePill');
  pill.style.display = n ? '' : 'none';
  pill.innerHTML = n ? `<span class="stars">${stars(Math.round(avg))}</span> ${avg.toFixed(1)} / 5.0 <span class="text-muted-pk fw-normal small">${n} Ulasan</span>` : '';
  $('#pSlider').innerHTML = PROMISES.map(promiseCard).join('');
  const t = tests().filter(x => x.visible !== false).sort((a,b) => b.at - a.at).slice(0,10);
  $('#testimoni .hero-eyebrow').innerHTML = '<i class="bi bi-chat-quote"></i> Ulasan Pelanggan';
  $('#testimoni .section-title').textContent = 'Apa Kata Mereka Tentang PanggilKami?';
  $('#ratingLine').textContent = 'Ulasan dari pelanggan yang telah memakai layanan PanggilKami.';
  $('#testimoni').classList.toggle('d-none', !t.length);
  $('#tSlider').innerHTML = t.map(reviewCard).join('');
}
/* ---- kartu ulasan ---- */
const reviewCard = x => `<div class="pk-card tcard"><div class="d-flex gap-3 align-items-center mb-3"><div class="avatar">${esc(initials(x.name))}</div><div><strong>${esc(x.name)}${x.area ? ' - ' + esc(x.area) : ''}</strong></div></div>
  <div class="d-flex justify-content-between align-items-center gap-2 mb-2"><span class="svc-chip"><i class="bi bi-check2-circle"></i>${esc(svcById(x.svc)?.name || 'Layanan')}</span><span class="stars">${stars(x.rating)}</span></div>
  <p class="rv-q">“${esc(x.comment || 'Pelayanan memuaskan.')}”</p>${x.photo ? `<img class="thumb" src="${x.photo}" data-act="zoom" alt="Foto ulasan">` : ''}</div>`;
/* ---- lokasi, waktu, Google Maps ---- */
const isUrl = t => /^https?:\/\//i.test(String(t).trim());
function locVal(t) { const L = LOC[t]; return { text:$('#' + t + 'Text').value.trim(), lat:L.lat, lng:L.lng }; }
const locOk = o => !!(o.lat != null || (o.text && o.text.length >= 5));
function mapHref(o) { if (isUrl(o.text)) return o.text.trim(); const q = o.lat != null ? `${o.lat},${o.lng}` : o.text; return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q); }
/* Peta di dalam web (OpenStreetMap, tanpa kunci API) */
function osmEmbed(lat, lng) { const d = 0.004; return `https://www.openstreetmap.org/export/embed.html?bbox=${lng-d},${lat-d},${lng+d},${lat+d}&layer=mapnik&marker=${lat},${lng}`; }
async function geocode(q, n = 5) {
  const r = await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=' + n + '&countrycodes=id&accept-language=id&viewbox=110.62,-7.40,111.02,-7.72&q=' + encodeURIComponent(q));
  if (!r.ok) throw new Error('geocode'); return r.json();
}
const shortAddr = n => String(n).split(',').slice(0, 4).join(',').trim();
const mapLinkHtml = (o, label) => { if (!o || !(o.text || o.lat != null)) return '';
  if (isUrl(o.text)) return `<a href="${esc(o.text.trim())}" target="_blank" rel="noopener" class="text-decoration-none"><i class="bi bi-geo-alt-fill me-1"></i>${label}</a>`;
  return `<a href="#" class="text-decoration-none" data-act="showMap" data-lat="${o.lat ?? ''}" data-lng="${o.lng ?? ''}" data-q="${esc(o.text || '')}"><i class="bi bi-geo-alt-fill me-1"></i>${label}</a>`; };
async function showMapModal(d) {
  let lat = d.lat === '' || d.lat == null ? null : +d.lat, lng = d.lng === '' || d.lng == null ? null : +d.lng, q = d.q || '';
  openModal('<i class="bi bi-geo-alt-fill me-2" style="color:var(--blue)"></i>Lokasi', `<div class="small text-muted-pk mb-2">${esc(q)}</div><div id="mapBox" class="notice small">Memuat peta…</div>`, '');
  try { if (lat == null) { const r = await geocode(q + ' Solo', 1); if (r[0]) { lat = +r[0].lat; lng = +r[0].lon; } }
    $('#mapBox').outerHTML = lat != null ? `<iframe id="mapBox" title="Peta lokasi" loading="lazy" style="width:100%;height:300px;border:0;border-radius:14px" src="${osmEmbed(lat, lng)}"></iframe>` : '<div id="mapBox" class="notice small">Titik belum ditemukan di peta. Alamat tetap tersimpan di pesanan.</div>';
  } catch { $('#mapBox').textContent = 'Peta membutuhkan internet. Alamat tetap tersimpan di pesanan.'; } }
let sugTimer = {};
function locSearch(t) {
  const v = $('#' + t + 'Text').value.trim(), box = $('#' + t + 'Sug'); clearTimeout(sugTimer[t]);
  if (v.length < 3 || isUrl(v) || /^Titik GPS/i.test(v)) { box.classList.add('d-none'); box.innerHTML = ''; return; }
  sugTimer[t] = setTimeout(async () => {
    box.classList.remove('d-none'); box.innerHTML = '<div class="sug-note">Mencari alamat…</div>';
    try { const r = await geocode(v + ' Solo', 5);
      if ($('#' + t + 'Text').value.trim() !== v) return;
      box.innerHTML = r.length ? r.map((x, i) => `<button type="button" data-act="pickLoc" data-t="${t}" data-lat="${x.lat}" data-lng="${x.lon}" data-name="${esc(shortAddr(x.display_name))}"><i class="bi bi-geo-alt me-2"></i>${esc(shortAddr(x.display_name))}</button>`).join('') : '<div class="sug-note">Alamat tidak ditemukan. Coba nama jalan atau tempat yang lebih umum, atau tulis alamat lengkap secara manual.</div>';
    } catch { box.innerHTML = '<div class="sug-note">Pencarian membutuhkan internet. Anda tetap bisa menulis alamat secara manual.</div>'; }
  }, 600);
}
function fwhen(v) { const d = new Date(v); return isNaN(d) ? v : d.toLocaleString('id-ID', { weekday:'short', day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }); }
function setDefaultWhen(soon) {
  const pad = n => String(n).padStart(2, '0'), fmt = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const d = new Date(Date.now() + (soon ? 10 : 30) * 60000); d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5, 0, 0);
  const el = $('#oWhen'); el.value = fmt(d); el.min = fmt(new Date());
}
async function mapPreview(t, forceShow) {
  const box = $('#' + t + 'Prev'), o = locVal(t);
  if (!(o.text || o.lat != null)) { toast('Isi lokasi terlebih dahulu.'); return; }
  if (!forceShow && !box.classList.contains('d-none')) { box.classList.add('d-none'); box.innerHTML = ''; return; }
  box.classList.remove('d-none');
  if (isUrl(o.text)) { box.innerHTML = '<div class="notice small">Tautan tersimpan. Disarankan mengetik alamat agar titik tampil di peta.</div>'; return; }
  let lat = o.lat, lng = o.lng;
  if (lat == null) { box.innerHTML = '<div class="notice small">Mencari titik di peta…</div>';
    try { const r = await geocode(o.text + ' Solo', 1); if (r[0]) { lat = +r[0].lat; lng = +r[0].lon; LOC[t] = { lat:+lat.toFixed(6), lng:+lng.toFixed(6) }; } } catch { box.innerHTML = '<div class="notice small">Peta membutuhkan internet. Alamat tetap tersimpan.</div>'; return; } }
  box.innerHTML = lat != null ? `<iframe title="Peta lokasi" loading="lazy" style="width:100%;height:220px;border:0;border-radius:14px" src="${osmEmbed(lat, lng)}"></iframe>` : '<div class="notice small">Titik belum ditemukan. Pilih salah satu saran alamat, atau bagikan lokasi Anda.</div>';
}
const orderMeta = o => [
  o.sub ? `<i class="bi bi-tag me-1"></i>${esc(o.sub)}` : '',
  (o.pick && (o.pick.text || o.pick.lat != null)) ? `<i class="bi bi-geo me-1"></i>Jemput: ${esc(o.pick.text)} ${mapLinkHtml(o.pick, 'Peta')}` : '',
  (o.dest && (o.dest.text || o.dest.lat != null)) ? `<i class="bi bi-flag me-1"></i>Tujuan: ${esc(o.dest.text)} ${mapLinkHtml(o.dest, 'Peta')}` : '',
  o.when ? `<i class="bi bi-clock me-1"></i>${esc(fwhen(o.when))}` : '',
  o.payGoods ? `<i class="bi bi-cash-coin me-1"></i>Bayar barang: ${esc(o.payGoods)}` : ''
].filter(Boolean).map(x => `<div class="small text-muted-pk">${x}</div>`).join('');
/* ---- komitmen layanan (tampil selama belum ada ulasan asli) ---- */
const PROMISES = [
  ['bi-chat-dots','Konfirmasi Sebelum Dikerjakan','Detail pesanan dipastikan melalui WhatsApp agar tidak ada yang keliru.'],
  ['bi-camera-video','Chat/VC dengan Penjual','Khusus titip belanja, Anda dapat berbicara langsung dengan penjual.'],
  ['bi-receipt','Harga Sesuai Struk Asli','Harga barang mengikuti struk toko dan dibayar saat barang tiba.'],
  ['bi-tag','Biaya Jasa Transparan','Tarif jasa tertera jelas sebelum Anda membayar, mulai Rp 15.000.'],
  ['bi-qr-code-scan','Pembayaran QRIS Aman','Biaya jasa dibayar melalui QRIS semua bank dengan nominal terkunci.'],
  ['bi-geo-alt','Pelacakan Status Pesanan','Pantau setiap tahap pesanan langsung dari akun Anda.'],
  ['bi-camera','Bukti Foto Pengerjaan','Foto struk belanja dan foto before–after untuk layanan kebersihan.'],
  ['bi-people','Tim Lokal Solo','Mengenal wilayah Solo, sehingga rute lebih efisien dan tepat waktu.'],
  ['bi-clock','Siap Setiap Hari','Melayani setiap hari pukul 06.00–00.00 WIB.'],
  ['bi-whatsapp','Admin yang Siap Membantu','Bingung saat memesan? Tim kami siap membantu melalui WhatsApp.']
];
const promiseCard = p => `<div class="pk-card tcard"><div class="d-flex gap-3 align-items-center mb-2"><div class="avatar"><i class="bi ${p[0]}"></i></div><strong>${p[1]}</strong></div><p class="mb-0 text-muted-pk">${p[2]}</p></div>`;
function calcFee() {
  const id = $('#oSvc').value; if (!id) return { fee:0, off:0, total:0 };
  const s = svcById(id); let fee = s.price; if (id === 'kos') fee = s.price * Number($('#oHours').value || 1);
  let off = 0; const v = VOUCHERS[$('#oVoucher').dataset.applied || ''];
  if (v) off = v.pct ? Math.round(fee * v.pct / 100) : Math.min(v.off, fee);
  return { fee, off, total: fee - off };
}
const SUBS = {
  belanja: [['Beli Makanan','Beli Makanan'],['Belanja Lainnya','Belanja Lainnya (minimarket, pasar, apotek)']],
  kurir: [['Antar Barang','Antar Barang'],['Antri','Antri'],['Lainnya','Lainnya']]
};
const LOC = { p:{ lat:null, lng:null }, d:{ lat:null, lng:null } };
function locCfg(svc, sub) {
  if (!svc) return { pick:null, dL:'Lokasi Tujuan', dH:'Pilih jenis layanan terlebih dahulu.' };
  if (svc === 'antar') return { pick:'req', pL:'Lokasi Jemput', pH:'Titik penjemputan. Anda bebas menentukan lokasinya.', dL:'Lokasi Tujuan', dH:'Tujuan perjalanan Anda.' };
  if (svc === 'kurir' && sub === 'Antar Barang') return { pick:'req', pL:'Lokasi Jemput Barang', pH:'Wajib jelas: alamat lengkap atau titik lokasi pengambilan barang.', dL:'Lokasi Tujuan Pengantaran', dH:'Alamat penerima barang.' };
  if (svc === 'kurir' && sub === 'Antri') return { pick:'req', pL:'Lokasi Antri', pH:'Tempat yang perlu diantri (kantor, loket, toko, dll.).', dL:'Lokasi Pengantaran', dH:'Titik temu atau tujuan pengantaran hasil antrian.' };
  if (svc === 'kurir') return { pick:'opt', pL:'Lokasi Jemput / Pengerjaan', pH:'Isi bila tugas dimulai dari lokasi tertentu.', dL:'Lokasi Tujuan', dH:'Tujuan pengantaran atau lokasi tugas.' };
  if (svc === 'belanja') return { pick:'opt', pL:'Lokasi Pembelian (toko / pasar / warung)', pH:'Isi jika ingin membeli di tempat tertentu. Jika dikosongkan, driver akan menentukannya bersama Anda via WhatsApp.', dL:'Lokasi Pengantaran', dH:'Alamat tempat barang diantar.' };
  return { pick:null, dL:'Lokasi Kos / Kamar Mandi', dH:'Alamat lokasi yang akan dibersihkan.' };
}
function currentSub() { return $('#subWrap').classList.contains('d-none') ? '' : $('#oSub').value; }
function refreshSub() {
  const id = $('#oSvc').value, list = SUBS[id], w = $('#subWrap');
  if (!list) { w.classList.add('d-none'); $('#oSub').innerHTML = ''; $('#oSub').dataset.for = ''; return; }
  if ($('#oSub').dataset.for !== id) { $('#oSub').innerHTML = list.map(x => `<option value="${esc(x[0])}">${esc(x[1])}</option>`).join(''); $('#oSub').dataset.for = id; }
  $('#subLabel').textContent = id === 'belanja' ? 'Jenis Belanja' : 'Jenis Tugas';
  w.classList.remove('d-none');
}
function updateOrderForm() {
  const id = $('#oSvc').value; refreshSub(); const sub = currentSub(), cfg = locCfg(id, sub);
  $('#hoursWrap').classList.toggle('d-none', id !== 'kos');
  $('#noticeBelanja').classList.toggle('d-none', id !== 'belanja' && id !== '');
  $('#goodsPay').classList.toggle('d-none', id !== 'belanja');
  $('#pickWrap').classList.toggle('d-none', !cfg.pick);
  $('#pLabel').innerHTML = esc(cfg.pL || '') + (cfg.pick === 'opt' ? ' <span class="text-muted-pk fw-normal">(opsional)</span>' : cfg.pick ? ' <span class="text-danger">*</span>' : '');
  $('#pHint').textContent = cfg.pH || '';
  $('#dLabel').innerHTML = esc(cfg.dL) + ' <span class="text-danger">*</span>'; $('#dHint').textContent = cfg.dH;
  $('#goodsHint').textContent = ($('input[name=oPayG]:checked')?.value === 'Transfer') ? 'Driver akan mengirim nomor rekening melalui WhatsApp setelah total belanja dikonfirmasi.' : 'Bayar tunai kepada driver saat barang tiba, sesuai struk asli toko.';
  const c = calcFee();
  $('#feeLine').innerHTML = id ? (c.off ? `<s class="text-muted-pk fs-6 me-2">${rp(c.fee)}</s>${c.total ? rp(c.total) : 'GRATIS'}` : rp(c.total)) : '—';
  const when = $('#oWhen').value, whenOk = !!when && new Date(when).getTime() >= Date.now() - 10 * 60000;
  const miss = [];
  if ($('#oName').value.trim().length < 2) miss.push('nama');
  if (!validWa($('#oWa').value)) miss.push('nomor HP');
  if (!id) miss.push('jenis layanan');
  if ($('#oDetail').value.trim().length < 5) miss.push('detail order');
  if (cfg.pick === 'req' && !locOk(locVal('p'))) miss.push('lokasi jemput');
  if (!locOk(locVal('d'))) miss.push('lokasi tujuan');
  if (!whenOk) miss.push('waktu');
  $('#btnOrder').disabled = miss.length > 0;
  $('#formHint').textContent = miss.length ? 'Lengkapi: ' + miss.join(', ') + '.' : '';
  $('#btnOrder').textContent = id ? (c.total === 0 ? 'Pesan Sekarang - Gratis (Voucher)' : `Pesan Sekarang - Bayar Jasa ${rp(c.total)}`) : 'Pesan Sekarang';
}
function applyVoucher() {
  const v = $('#oVoucher'), code = v.value.trim().toUpperCase(), m = $('#voucherMsg'), def = VOUCHERS[code];
  const bad = t => { v.dataset.applied = ''; m.className = 'form-text text-danger'; m.textContent = t; updateOrderForm(); };
  if (!code) { v.dataset.applied = ''; m.textContent = ''; updateOrderForm(); return; }
  const u = me();
  if (!def) return bad('Kode voucher tidak dikenali.');
  if (def.firstOnly && u && orders().some(o => o.uid === u.id)) return bad('Voucher ini hanya berlaku untuk pesanan pertama.');
  v.dataset.applied = code; m.className = 'form-text text-success'; m.textContent = `Voucher ${code} berhasil dipakai: ${def.label}.`; updateOrderForm();
}

/* ============ Auth ============ */
function authModal(tab='login', note='') {
  const reg = tab === 'register';
  openModal(reg ? 'Daftar Akun' : 'Masuk', `
    ${note ? `<div class="notice mb-3">${esc(note)}</div>` : ''}
    <ul class="nav nav-pills nav-fill mb-3 admin-tabs"><li class="nav-item"><a href="#" class="nav-link ${!reg?'active':''}" data-act="auth" data-tab="login">Masuk</a></li><li class="nav-item"><a href="#" class="nav-link ${reg?'active':''}" data-act="auth" data-tab="register">Daftar</a></li></ul>
    <form id="authForm" novalidate data-mode="${tab}">
      ${reg ? '<div class="mb-3"><label class="form-label">Nama Lengkap</label><input class="form-control" name="name" autocomplete="name"></div>' : ''}
      <div class="mb-3"><label class="form-label">Email</label><input class="form-control" type="email" name="email" autocomplete="email"></div>
      <div class="mb-3"><label class="form-label">Kata Sandi</label><input class="form-control" type="password" name="password" autocomplete="${reg?'new-password':'current-password'}" placeholder="Minimal 6 karakter"></div>
      ${!reg ? '<div class="form-check mb-3"><input class="form-check-input" type="checkbox" id="remember" checked><label class="form-check-label" for="remember">Ingat saya</label></div>' : ''}
      <div class="text-danger small mb-2" id="authErr"></div>
      <button class="btn btn-pk w-100">${reg ? 'Buat Akun' : 'Masuk'}</button>
    </form>`);
}
async function submitAuth(form) {
  const fd = new FormData(form), mode = form.dataset.mode, err = $('#authErr');
  const email = (fd.get('email')||'').trim().toLowerCase(), pw = fd.get('password') || '';
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  if (!emailOk) { err.textContent = 'Format email tidak valid.'; return; }
  if (pw.length < 6) { err.textContent = 'Kata sandi minimal 6 karakter.'; return; }
  const us = users();
  if (mode === 'register') {
    const name = (fd.get('name')||'').trim();
    if (name.length < 2) { err.textContent = 'Nama wajib diisi.'; return; }
    if (us.some(u => u.email === email)) { err.textContent = 'Email sudah terdaftar. Silakan masuk.'; return; }
    const salt = Math.random().toString(36).slice(2);
    const u = { id:uid('U'), name, email, salt, hash: await hashPw(pw, salt), role:'user', photo:'', wa:'', area:'', at:Date.now() };
    us.push(u); if (!db.set(K.users, us)) return;
    startSession(u.id, true); closeModal(); toast('Akun berhasil dibuat. Selamat datang!'); afterAuth();
  } else {
    const u = us.find(x => x.email === email);
    if (!u || u.hash !== await hashPw(pw, u.salt)) { err.textContent = 'Email atau kata sandi salah.'; return; }
    startSession(u.id, $('#remember')?.checked); closeModal(); toast('Berhasil masuk.'); afterAuth();
  }
}
function startSession(uidv, remember) {
  localStorage.removeItem(K.sess); sessionStorage.removeItem(K.sess);
  (remember ? localStorage : sessionStorage).setItem(K.sess, JSON.stringify({ uid:uidv, at:Date.now() }));
}
function afterAuth() {
  if (isAdmin()) go('admin'); else { renderView(); checkReview(); if (pendingOrder) { pendingOrder = false; $('#orderForm').requestSubmit(); } }
}
function logout() { localStorage.removeItem(K.sess); sessionStorage.removeItem(K.sess); toast('Anda telah keluar.'); go('home'); }

/* ============ Pesan & Pembayaran ============ */
let pendingOrder = false;
function submitOrder() {
  const u = me();
  if (!u) { pendingOrder = true; authModal('register', 'Untuk memesan, silakan daftar atau masuk terlebih dahulu. Data formulir Anda tetap tersimpan.'); return; }
  if (u.role === 'admin') { toast('Akun admin tidak dapat membuat pesanan. Gunakan akun pelanggan.'); return; }
  applyVoucher();
  const c = calcFee(), svc = $('#oSvc').value, hrs = svc === 'kos' ? Number($('#oHours').value) : 0, sub = currentSub(), cfg = locCfg(svc, sub), pk = locVal('p');
  const o = { id:uid('PK'), uid:u.id, name:$('#oName').value.trim(), wa:$('#oWa').value.trim(), svc, sub, hours:hrs, detail:$('#oDetail').value.trim(),
    pick:(cfg.pick && (pk.text || pk.lat != null)) ? pk : null, dest:locVal('d'), when:$('#oWhen').value, payGoods: svc === 'belanja' ? ($('input[name=oPayG]:checked')?.value || 'Tunai') : '',
    fee:c.fee, off:c.off, total:c.total, voucher: c.off ? ($('#oVoucher').dataset.applied || '') : '', pay:'unpaid', proof:'', step:-1, log:[], reviewed:false, at:Date.now() };
  if (o.total === 0) { o.pay = 'verified'; o.step = 0; o.log.push({ t:Date.now(), s:'Biaya jasa gratis dengan voucher ' + o.voucher, i:0 }); }
  const all = orders(); all.push(o); if (!db.set(K.orders, all)) return;
  $('#oDetail').value = ''; ['p','d'].forEach(t => { $('#' + t + 'Text').value = ''; LOC[t] = { lat:null, lng:null }; $('#' + t + 'Prev').classList.add('d-none'); $('#' + t + 'Prev').innerHTML = ''; }); setDefaultWhen(); $('#oVoucher').value = ''; $('#oVoucher').dataset.applied = ''; $('#voucherMsg').textContent = '';
  updateOrderForm(); clearDraft(); ['p','d'].forEach(t => { $('#' + t + 'Sug').classList.add('d-none'); });
  if (o.total === 0) { toast('Pesanan diterima! Biaya jasa gratis dengan voucher.'); go('orders'); setTimeout(() => orderDetail(o.id), 400); } else payModal(o.id);
}
/* ---- QRIS dinamis: ubah QRIS statis jadi berisi nominal (EMV QR, tag 01=12, tag 54, CRC16) ---- */
const QRIS_DEFAULT = '00020101021126610014COM.GO-JEK.WWW01189360091432268065010210G2268065010303UMI51440014ID.CO.QRIS.WWW0215ID10264846322070303UMI5204821153033605802ID5911panggilkami6009SUKOHARJO61055755262070703A0163048BCE';
const qrisStatic = () => db.get(K.qrisP, QRIS_DEFAULT);
function crc16(s) { let c = 0xFFFF; for (let i = 0; i < s.length; i++) { c ^= s.charCodeAt(i) << 8; for (let j = 0; j < 8; j++) c = (c & 0x8000) ? ((c << 1) ^ 0x1021) : (c << 1); c &= 0xFFFF; } return c.toString(16).toUpperCase().padStart(4, '0'); }
const crcOk = p => p.length > 12 && crc16(p.slice(0, -4)) === p.slice(-4).toUpperCase();
function qrisDynamic(amount) {
  const src = qrisStatic().trim(), list = []; let i = 0;
  while (i < src.length) { const t = src.substr(i, 2), l = parseInt(src.substr(i + 2, 2), 10), v = src.substr(i + 4, l); list.push([t, v]); i += 4 + l; }
  const out = list.filter(x => x[0] !== '63' && x[0] !== '54').map(x => x[0] === '01' ? ['01', '12'] : x);
  const at = out.findIndex(x => x[0] > '54'); out.splice(at < 0 ? out.length : at, 0, ['54', String(Math.round(amount))]);
  const body = out.map(x => x[0] + String(x[1].length).padStart(2, '0') + x[1]).join('') + '6304';
  return body + crc16(body);
}
const logoImg = new Image();
function qrisCanvasUrl(text) {
  const q = qrcode(0, 'H'); q.addData(text); q.make();
  const n = q.getModuleCount(), cell = 8, quiet = 3, size = (n + quiet * 2) * cell;
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const g = cv.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0, 0, size, size); g.fillStyle = '#0b1f3a';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) g.fillRect((c + quiet) * cell, (r + quiet) * cell, cell, cell);
  if (logoImg.complete && logoImg.naturalWidth) {   /* logo PK di tengah QR */
    const P = Math.round(n * 0.21) * cell, x = (size - P) / 2, pad = 6;
    const rr = (px, py, w, hh, rad) => { g.beginPath(); g.moveTo(px + rad, py); g.arcTo(px + w, py, px + w, py + hh, rad); g.arcTo(px + w, py + hh, px, py + hh, rad); g.arcTo(px, py + hh, px, py, rad); g.arcTo(px, py, px + w, py, rad); g.closePath(); };
    g.fillStyle = '#fff'; rr(x - pad, x - pad, P + pad * 2, P + pad * 2, 18); g.fill();
    g.fillStyle = '#0A2342'; rr(x, x, P, P, 14); g.fill();
    const w = P * 0.74, hgt = w * logoImg.naturalHeight / logoImg.naturalWidth; g.drawImage(logoImg, (size - w) / 2, (size - hgt) / 2, w, hgt);
  }
  return cv.toDataURL('image/png');
}
function payModal(id) {
  const o = orders().find(x => x.id === id); if (!o) return;
  let uri = ''; try { uri = qrisCanvasUrl(qrisDynamic(o.total)); window.__qris = { uri, name:`QRIS-PanggilKami-${o.id}.png` }; } catch (e) { console.error(e); }
  openModal('Pembayaran QRIS', `
    <div class="text-center">
      <div class="small text-muted-pk">No. Pesanan <strong>#${o.id}</strong></div>
      <div class="price fs-2 my-1">${rp(o.total)}</div>
      <div class="small text-muted-pk mb-3">Biaya jasa ${svcById(o.svc).name}${o.off ? ` (voucher ${esc(o.voucher)} −${rp(o.off)})` : ''}</div>
      ${uri ? `<div class="qris-card mx-auto text-center">
          <div class="qris-mark">QRIS</div>
          <div class="fw-bold mt-1" style="color:#111">PANGGILKAMI</div>
          <div class="small" style="color:#555">SUKOHARJO • NMID ${NMID}</div>
          <img src="${uri}" alt="QRIS dinamis ${rp(o.total)}" class="my-2">
          <div class="fw-bold" style="color:#111">Nominal terkunci: ${rp(o.total)}</div>
          <div class="small pb-1" style="color:#555">Dapat dipindai GoPay, OVO, DANA, ShopeePay, LinkAja, dan m-banking.</div></div>
        <div><button type="button" class="btn btn-outline-pk btn-sm mt-3" data-act="saveQrImg"><i class="bi bi-download me-1"></i>Simpan QRIS ke Galeri</button><div class="small text-muted-pk mt-1">Di HP, pilih “Simpan Gambar” atau “Simpan ke Foto” pada menu yang muncul.</div></div>`
        : `<div class="notice">QRIS tidak dapat dibuat. Silakan hubungi admin via WhatsApp.</div>`}
    </div>
    <hr style="border-color:var(--line)">
    <ol class="small text-muted-pk ps-3 mb-3"><li>Buka aplikasi pembayaran lalu pindai QR (atau pilih dari galeri). Nominal terisi otomatis.</li><li>Selesaikan pembayaran, kemudian unggah tangkapan layar bukti bayar di bawah ini.</li><li>Admin memverifikasi dan status pesanan akan berubah otomatis.</li></ol>
    <label class="form-label">Bukti Pembayaran</label>
    <input type="file" class="form-control" id="proofFile" accept="image/*">
    <div class="text-danger small mt-2" id="proofErr"></div>`,
    `<button class="btn btn-outline-pk" data-bs-dismiss="modal">Nanti</button><button class="btn btn-pk" data-act="sendProof" data-id="${o.id}">Kirim Bukti Bayar</button>`);
}
async function sendProof(id) {
  const f = $('#proofFile').files[0]; if (!f) { $('#proofErr').textContent = 'Pilih foto bukti pembayaran terlebih dahulu.'; return; }
  try {
    const img = await readImg(f, 900, .7), all = orders(), o = all.find(x => x.id === id);
    o.proof = img; o.pay = 'proof'; o.log.push({ t:Date.now(), s:'Bukti pembayaran dikirim' });
    if (!db.set(K.orders, all)) return; closeModal(); toast('Bukti pembayaran terkirim. Menunggu verifikasi admin.'); go('orders');
  } catch { $('#proofErr').textContent = 'Gambar tidak dapat dibaca. Coba foto lain.'; }
}
function payBadge(o) {
  if (o.pay === 'unpaid') return ['warning text-dark','Menunggu Pembayaran'];
  if (o.pay === 'proof') return ['info text-dark','Menunggu Verifikasi'];
  if (o.pay === 'rejected') return ['danger','Bukti Ditolak'];
  const f = flowOf(o), done = o.step >= f.length - 1;
  return [done ? 'success' : 'primary', done ? 'Selesai' : f[Math.max(o.step,0)]];
}

/* ============ Pesanan Saya ============ */
function renderOrders() {
  const u = me(); const list = orders().filter(o => o.uid === u.id).sort((a,b) => b.at - a.at);
  $('#ordersList').innerHTML = list.length ? list.map(o => { const [c,t] = payBadge(o), s = svcById(o.svc); return `
    <div class="pk-card p-3"><div class="d-flex justify-content-between gap-2 flex-wrap">
      <div><div class="fw-bold">${s.name} <span class="text-muted-pk fw-normal small">#${o.id}</span></div><div class="small text-muted-pk">${fdate(o.at)}</div></div>
      <span class="badge badge-st bg-${c}">${esc(t)}</span></div>
      <div class="mt-2 small text-muted-pk text-truncate">${esc(o.detail)}</div>
      <div class="d-flex justify-content-between align-items-center mt-2 flex-wrap gap-2"><span class="price">${rp(o.total)}</span>
      <div class="d-flex gap-2"><button class="btn btn-sm btn-outline-pk" data-act="orderDetail" data-id="${o.id}">Detail &amp; Lacak</button>
      ${(o.pay==='unpaid'||o.pay==='rejected') ? `<button class="btn btn-sm btn-pk" data-act="pay" data-id="${o.id}">Bayar</button>` : ''}</div></div></div>`; }).join('')
    : `<div class="pk-card p-4 text-center text-muted-pk">Belum ada pesanan. <a href="#" data-act="go" data-view="home" data-anchor="pesan">Buat pesanan pertama Anda</a>.</div>`;
}
function timeline(o) {
  const f = flowOf(o);
  return `<ul class="timeline">${f.map((s,i) => {
    const photos = (o.log || []).filter(l => l.i === i && l.img);
    const cls = o.pay !== 'verified' ? '' : (i < o.step ? 'done' : i === o.step ? 'done now' : '');
    return `<li class="${cls}"><span class="dot">${cls.includes('done') ? '<i class="bi bi-check-lg"></i>' : i+1}</span>${esc(s)}
      ${photos.map(p => `<div class="mt-1">${p.note ? `<div class="small text-muted-pk">${esc(p.note)}</div>` : ''}<img class="thumb" src="${p.img}" data-act="zoom" alt="Foto tahap"></div>`).join('')}</li>`; }).join('')}</ul>`;
}
function orderDetail(id) {
  const o = orders().find(x => x.id === id); if (!o) return; const s = svcById(o.svc), [c,t] = payBadge(o);
  const msg = `Halo PanggilKami, saya ${o.name}. Pesanan #${o.id} (${s.name}). Mohon dikonfirmasi.`;
  openModal(`${s.name} <small class="text-muted-pk">#${o.id}</small>`, `
    <span class="badge badge-st bg-${c} mb-3">${esc(t)}</span>
    <div class="small mb-1"><strong>Pemesan:</strong> ${esc(o.name)} • ${esc(o.wa)}</div>
    <div class="small mb-1"><strong>Detail:</strong> ${esc(o.detail)}</div>
    <div class="mb-2">${orderMeta(o)}</div>
    <div class="small mb-3"><strong>Biaya jasa:</strong> ${rp(o.total)}${o.off ? ` (voucher ${o.voucher} −${rp(o.off)})` : ''}${o.hours ? ` • ${o.hours} jam` : ''}</div>
    ${o.pay === 'verified' ? timeline(o) : `<div class="notice">${o.pay==='proof' ? 'Bukti pembayaran Anda sedang diverifikasi admin. Pelacakan aktif setelah pembayaran terverifikasi.' : o.pay==='rejected' ? 'Bukti pembayaran ditolak. Silakan unggah ulang bukti yang valid atau hubungi admin.' : 'Selesaikan pembayaran jasa agar pesanan dapat diproses.'}</div>`}
    ${o.svc==='belanja' && o.pay==='verified' ? '<div class="notice mt-2 small">Biaya jasa hanya untuk jasa. Total belanja dikonfirmasi driver via WhatsApp dan dibayar saat barang tiba (COD) sesuai struk asli.</div>' : ''}`,
    `${(o.pay==='unpaid'||o.pay==='rejected') ? `<button class="btn btn-pk" data-act="pay" data-id="${o.id}">Bayar / Unggah Bukti</button>` : ''}
     ${o.pay==='verified' ? `<a class="btn btn-pk" target="_blank" rel="noopener" href="${waLink(msg)}"><i class="bi bi-whatsapp me-1"></i> Hubungi via WhatsApp</a>` : ''}
     <button class="btn btn-outline-pk" data-bs-dismiss="modal">Tutup</button>`);
}

/* ============ Testimoni ============ */
let rvStar = 5;
function checkReview() {
  const u = me(); if (!u || u.role === 'admin' || $('#mdl').classList.contains('show')) return;
  let skipped = []; try { skipped = JSON.parse(sessionStorage.getItem('pk_skip') || '[]'); } catch {}
  const o = orders().find(x => x.uid === u.id && x.pay === 'verified' && x.step >= flowOf(x).length - 1 && !x.reviewed && !skipped.includes(x.id));
  if (o) reviewModal(o.id);
}
function reviewModal(id) {
  const o = orders().find(x => x.id === id), u = me(); rvStar = 5;
  openModal('Gimana pelayanan kami?', `
    <p class="text-muted-pk small">Pesanan <strong>${svcById(o.svc).name}</strong> #${o.id} telah selesai. Penilaian Anda sangat berarti bagi kami.</p>
    <div class="star-pick text-center mb-3" id="starPick">${[1,2,3,4,5].map(i => `<i class="bi bi-star-fill on" data-act="star" data-n="${i}"></i>`).join('')}</div>
    <div class="mb-3"><label class="form-label">Komentar singkat</label><textarea class="form-control" id="rvText" rows="3" maxlength="200" placeholder="Ceritakan pengalaman Anda…"></textarea></div>
    <div class="mb-3"><label class="form-label">Daerah <span class="text-muted-pk fw-normal">(mis. Jebres)</span></label><input class="form-control" id="rvArea" value="${esc(u.area||'')}" maxlength="30"></div>
    <div><label class="form-label">Foto <span class="text-muted-pk fw-normal">(opsional)</span></label><input type="file" class="form-control" id="rvPhoto" accept="image/*"></div>`,
    `<button class="btn btn-outline-pk" data-act="skipReview" data-id="${o.id}">Nanti saja</button><button class="btn btn-pk" data-act="sendReview" data-id="${o.id}">Kirim Ulasan</button>`);
}
async function sendReview(id) {
  const all = orders(), o = all.find(x => x.id === id), u = me(); let photo = '';
  const f = $('#rvPhoto').files[0]; if (f) { try { photo = await readImg(f, 700, .7); } catch {} }
  const ts = tests(); ts.push({ id:uid('T'), oid:id, uid:u.id, name:o.name.split(' ')[0] || u.name, area:$('#rvArea').value.trim(), rating:rvStar, comment:$('#rvText').value.trim(), photo, svc:o.svc, visible:true, at:Date.now() });
  o.reviewed = true; if (!db.set(K.tests, ts) || !db.set(K.orders, all)) return;
  const us = users(), uu = us.find(x => x.id === u.id); if (uu) { uu.area = $('#rvArea').value.trim(); db.set(K.users, us); }
  closeModal(); toast('Terima kasih! Ulasan Anda telah tersimpan.'); renderView();
}

/* ============ Profil ============ */
function renderProfile() {
  const u = me();
  $('#profileBox').innerHTML = `
    <h2 class="section-title">Profil Saya</h2>
    <div class="d-flex align-items-center gap-3 my-3"><div class="avatar" style="width:80px;height:80px;font-size:1.6rem">${u.photo ? `<img src="${u.photo}" alt="">` : esc(initials(u.name))}</div>
      <div><div class="fw-bold">${esc(u.name)}</div><div class="small text-muted-pk">${esc(u.email)}${u.role==='admin' ? ' • Admin' : ''}</div></div></div>
    <form id="profileForm" novalidate>
      <div class="mb-3"><label class="form-label">Foto Profil</label><input type="file" class="form-control" id="pPhoto" accept="image/*"></div>
      <div class="mb-3"><label class="form-label">Nama</label><input class="form-control" id="pName" value="${esc(u.name)}"></div>
      <div class="mb-3"><label class="form-label">Email</label><input class="form-control" value="${esc(u.email)}" disabled></div>
      <div class="mb-3"><label class="form-label">No. WhatsApp</label><input class="form-control" id="pWa" value="${esc(u.wa||'')}" placeholder="08xxxxxxxxxx"></div>
      <div class="mb-3"><label class="form-label">Kata Sandi Baru <span class="text-muted-pk fw-normal">(kosongkan jika tidak diubah)</span></label><input type="password" class="form-control" id="pPw" placeholder="Minimal 6 karakter"></div>
      <div class="text-danger small mb-2" id="pErr"></div>
      <button class="btn btn-pk w-100">Simpan Perubahan</button>
    </form>`;
}
async function saveProfile() {
  const us = users(), me_ = me(), u = us.find(x => x.id === me_.id), err = $('#pErr');
  const name = $('#pName').value.trim(), wa = $('#pWa').value.trim(), pw = $('#pPw').value;
  if (name.length < 2) { err.textContent = 'Nama wajib diisi.'; return; }
  if (wa && !validWa(wa)) { err.textContent = 'Nomor WhatsApp tidak valid.'; return; }
  if (pw && pw.length < 6) { err.textContent = 'Kata sandi baru minimal 6 karakter.'; return; }
  const f = $('#pPhoto').files[0]; if (f) { try { u.photo = await readImg(f, 300, .8); } catch { err.textContent = 'Foto tidak dapat dibaca.'; return; } }
  u.name = name; u.wa = wa; if (pw) { u.salt = Math.random().toString(36).slice(2); u.hash = await hashPw(pw, u.salt); }
  if (db.set(K.users, us)) { toast('Profil berhasil diperbarui.'); renderView(); }
}

/* ============ ADMIN ============ */
let adminTab = 'orders';
function renderAdmin() {
  const os = orders().sort((a,b) => b.at - a.at), ts = tests().sort((a,b) => b.at - a.at), us = users();
  const revenue = os.filter(o => o.pay === 'verified').reduce((a,b) => a + b.total, 0);
  const pend = os.filter(o => o.pay === 'proof').length;
  const stat = (l,v,i) => `<div class="col-6 col-lg-3"><div class="pk-card p-3"><div class="small text-muted-pk"><i class="bi ${i} me-1"></i>${l}</div><div class="fs-4 fw-bold">${v}</div></div></div>`;
  let body = '';
  if (adminTab === 'orders') body = os.length ? os.map(o => { const [c,t] = payBadge(o); return `
    <div class="pk-card p-3 mb-2"><div class="d-flex justify-content-between flex-wrap gap-2"><div><strong>${svcById(o.svc).name}</strong> <span class="small text-muted-pk">#${o.id} • ${fdate(o.at)}</span><div class="small">${esc(o.name)} • ${esc(o.wa)}</div></div><span class="badge badge-st bg-${c} align-self-start">${esc(t)}</span></div>
      <div class="small text-muted-pk my-2">${esc(o.detail)}</div>
      ${orderMeta(o)}
      <div class="d-flex flex-wrap gap-2 align-items-center"><span class="price me-auto">${rp(o.total)}</span>
        ${o.proof ? `<button class="btn btn-sm btn-outline-pk" data-act="zoomProof" data-id="${o.id}"><i class="bi bi-image"></i> Bukti</button>` : ''}
        ${o.pay==='proof' ? `<button class="btn btn-sm btn-success" data-act="verify" data-id="${o.id}">Verifikasi</button><button class="btn btn-sm btn-danger" data-act="reject" data-id="${o.id}">Tolak</button>` : ''}
        ${o.pay==='verified' ? `<button class="btn btn-sm btn-pk" data-act="stepModal" data-id="${o.id}">Update Status</button><a class="btn btn-sm btn-outline-pk" target="_blank" rel="noopener" href="${waLink(`Halo ${o.name}, status pesanan #${o.id} (${svcById(o.svc).name}): ${flowOf(o)[o.step]}. Terima kasih telah memakai PanggilKami.`, normWa(o.wa))}"><i class="bi bi-whatsapp"></i> Notif</a>` : ''}
        <button class="btn btn-sm btn-outline-danger" data-act="delOrder" data-id="${o.id}"><i class="bi bi-trash"></i></button></div></div>`; }).join('')
    : '<div class="pk-card p-4 text-center text-muted-pk">Belum ada pesanan.</div>';
  if (adminTab === 'tests') body = ts.length ? ts.map(t => `
    <div class="pk-card p-3 mb-2"><div class="d-flex justify-content-between"><strong>${esc(t.name)}${t.area?' - '+esc(t.area):''}</strong><span class="stars">${stars(t.rating)}</span></div>
      <div class="small my-2">${esc(t.comment)}</div>${t.photo ? `<img class="thumb mb-2" src="${t.photo}" data-act="zoom" alt="">` : ''}
      <div class="d-flex gap-2 flex-wrap align-items-center"><span class="small text-muted-pk me-auto">${svcById(t.svc)?.name || ''} • ${fdate(t.at)} ${t.visible===false?'• <em>disembunyikan</em>':''} ${t.manual?'• <em>ditambahkan admin</em>':''}</span>
      <button class="btn btn-sm btn-outline-pk" data-act="tEdit" data-id="${t.id}">Edit</button><button class="btn btn-sm btn-outline-pk" data-act="tHide" data-id="${t.id}">${t.visible===false?'Tampilkan':'Sembunyikan'}</button><button class="btn btn-sm btn-outline-danger" data-act="tDel" data-id="${t.id}"><i class="bi bi-trash"></i></button></div></div>`).join('')
    : '<div class="pk-card p-4 text-center text-muted-pk">Belum ada testimoni.</div>';
  if (adminTab === 'tests') body = '<button class="btn btn-pk btn-sm mb-3" data-act="tAdd"><i class="bi bi-plus-lg me-1"></i>Tambah Ulasan Asli</button>' + body;
  if (adminTab === 'users') body = `<div class="pk-card p-2"><div class="table-responsive"><table class="table align-middle mb-0"><thead><tr><th>Nama</th><th>Email</th><th>Peran</th><th></th></tr></thead><tbody>${us.map(u => `<tr><td>${esc(u.name)}</td><td class="small">${esc(u.email)}</td><td>${u.role}</td><td>${u.role!=='admin' ? `<button class="btn btn-sm btn-outline-danger" data-act="delUser" data-id="${u.id}"><i class="bi bi-trash"></i></button>` : ''}</td></tr>`).join('')}</tbody></table></div></div>`;
  if (adminTab === 'set') body = `<div class="pk-card p-3"><h5>Kode QRIS Statis</h5><p class="small text-muted-pk">Kode ini diubah otomatis menjadi QRIS dinamis (nominal terisi) untuk setiap pesanan. Tempel hasil pindai QRIS resmi Anda jika berganti merchant.</p>
    <textarea id="qrisText" class="form-control mb-2" rows="5" style="font-family:monospace;font-size:.78rem">${esc(qrisStatic())}</textarea>
    <div class="small mb-3 ${crcOk(qrisStatic()) ? 'text-success' : 'text-danger'}">${crcOk(qrisStatic()) ? '✔ Kode valid (CRC cocok)' : '✖ CRC tidak cocok'}</div>
    <div class="d-flex gap-2 flex-wrap"><button class="btn btn-pk" data-act="saveQris">Simpan</button><button class="btn btn-outline-pk" data-act="resetQris">Kembalikan bawaan</button></div></div>`;
  $('#adminBox').innerHTML = `<div class="row g-2 mb-3">${stat('Total Pesanan',os.length,'bi-bag')}${stat('Perlu Verifikasi',pend,'bi-hourglass-split')}${stat('Pendapatan Jasa',rp(revenue),'bi-cash-coin')}${stat('Testimoni',ts.length,'bi-chat-heart')}</div>
    <ul class="nav nav-pills admin-tabs mb-3 flex-nowrap overflow-auto">${[['orders','Pesanan'],['tests','Testimoni'],['users','Pengguna'],['set','Pengaturan']].map(t => `<li class="nav-item"><a href="#" class="nav-link ${adminTab===t[0]?'active':''}" data-act="aTab" data-t="${t[0]}">${t[1]}</a></li>`).join('')}</ul>${body}`;
}
function stepModal(id) {
  const o = orders().find(x => x.id === id), f = flowOf(o), s = svcById(o.svc), next = Math.min(o.step + 1, f.length - 1);
  openModal('Update Status Pesanan', `<div class="small text-muted-pk mb-2">#${o.id} • ${s.name} • ${esc(o.name)}</div>
    <div class="mb-3"><label class="form-label">Status</label><select class="form-select" id="stSel">${f.map((x,i) => `<option value="${i}" ${i===next?'selected':''}>${i+1}. ${esc(x)}</option>`).join('')}</select></div>
    <div class="mb-3"><label class="form-label">Foto ${s.photoReq ? '<span class="text-danger">(wajib untuk tahap Before/After)</span>' : '<span class="text-muted-pk fw-normal">(opsional)</span>'}</label><input type="file" class="form-control" id="stPhoto" accept="image/*"></div>
    <div><label class="form-label">Catatan</label><input class="form-control" id="stNote" maxlength="120" placeholder="Opsional"></div><div class="text-danger small mt-2" id="stErr"></div>`,
    `<button class="btn btn-outline-pk" data-bs-dismiss="modal">Batal</button><button class="btn btn-pk" data-act="saveStep" data-id="${id}">Simpan</button>`);
}
async function saveStep(id) {
  const all = orders(), o = all.find(x => x.id === id), s = svcById(o.svc), i = Number($('#stSel').value), f = $('#stPhoto').files[0];
  if (s.photoReq && (i === 2 || i === 3) && !f) { $('#stErr').textContent = 'Foto before/after wajib diunggah untuk tahap ini.'; return; }
  let img = ''; if (f) { try { img = await readImg(f, 900, .7); } catch { $('#stErr').textContent = 'Foto tidak dapat dibaca.'; return; } }
  o.step = i; o.log.push({ t:Date.now(), s:flowOf(o)[i], i, img, note:$('#stNote').value.trim() });
  if (db.set(K.orders, all)) { closeModal(); toast('Status diperbarui.'); renderAdmin(); }
}

/* ============ Aksi (delegasi klik) ============ */
const acts = {
  go: d => go(d.view, d.anchor),
  theme: () => setTheme(document.documentElement.dataset.bsTheme === 'dark' ? 'light' : 'dark'),
  auth: d => authModal(d.tab),
  logout, svc: d => { const s = svcById(d.id);
    openModal(`<i class="bi ${s.icon} me-2" style="color:var(--blue)"></i>${s.name}`, `${svcPhoto(s.id,true)}<div class="price fs-5 mb-2">${s.label}</div><p>${s.desc}</p><h6 class="mt-3">Tahapan Pengerjaan</h6><ol class="text-muted-pk small ps-3 mb-0">${FLOWS[s.flow].map(x => `<li>${x}</li>`).join('')}</ol>`,
      `<button class="btn btn-pk w-100" data-act="pick" data-id="${s.id}">Pesan ${s.name}</button>`); },
  gps: d => { const t = d.t;
    if (!navigator.geolocation) { toast('Perangkat tidak mendukung berbagi lokasi. Silakan tulis alamat secara manual.'); return; }
    toast('Mengambil lokasi…');
    navigator.geolocation.getCurrentPosition(p => {
      LOC[t] = { lat:+p.coords.latitude.toFixed(6), lng:+p.coords.longitude.toFixed(6) };
      $('#' + t + 'Text').value = `Titik GPS: ${LOC[t].lat}, ${LOC[t].lng}`; $('#' + t + 'Sug').classList.add('d-none'); updateOrderForm(); mapPreview(t, true); saveDraft(); toast('Lokasi berhasil dibagikan.');
      fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&accept-language=id&lat=${LOC[t].lat}&lon=${LOC[t].lng}`).then(r => r.json()).then(j => { if (j && j.display_name && /^Titik GPS/.test($('#' + t + 'Text').value)) { $('#' + t + 'Text').value = shortAddr(j.display_name); saveDraft(); updateOrderForm(); } }).catch(() => {});
    }, () => toast('Lokasi tidak dapat diakses. Izinkan akses lokasi di browser, atau tulis alamat secara manual.'), { enableHighAccuracy:true, timeout:12000 }); },
  mapPrev: d => mapPreview(d.t),
  pickLoc: d => { const t = d.t; $('#' + t + 'Text').value = d.name; LOC[t] = { lat:+(+d.lat).toFixed(6), lng:+(+d.lng).toFixed(6) };
    $('#' + t + 'Sug').classList.add('d-none'); $('#' + t + 'Sug').innerHTML = ''; updateOrderForm(); mapPreview(t, true); saveDraft(); },
  showMap: d => showMapModal(d),
  saveQrImg: async () => { const q = window.__qris; if (!q) return;
    try { const blob = await (await fetch(q.uri)).blob(), file = new File([blob], q.name, { type:'image/png' });
      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) && navigator.canShare && navigator.canShare({ files:[file] })) { await navigator.share({ files:[file], title:'QRIS PanggilKami' }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
    const a = document.createElement('a'); a.href = q.uri; a.download = q.name; document.body.appendChild(a); a.click(); a.remove(); toast('QRIS tersimpan. Cek folder Unduhan atau Galeri Anda.'); },
  nowTime: () => { setDefaultWhen(true); updateOrderForm(); },
  writeReview: () => { const u = me();
    if (!u) { authModal('login', 'Silakan masuk untuk menulis ulasan. Ulasan dapat ditulis setelah pesanan Anda selesai.'); return; }
    const o = orders().find(x => x.uid === u.id && x.pay === 'verified' && x.step >= flowOf(x).length - 1 && !x.reviewed);
    if (o) reviewModal(o.id); else toast('Ulasan dapat ditulis setelah pesanan Anda berstatus Selesai.'); },
  pick: d => { closeModal(); $('#oSvc').value = d.id; updateOrderForm(); setTimeout(() => $('#pesan').scrollIntoView({ behavior:'smooth' }), 300); },
  pay: d => payModal(d.id), sendProof: d => sendProof(d.id), orderDetail: d => orderDetail(d.id),
  zoom: (d, e) => { $('#imgBig').src = e.target.src; bootstrap.Modal.getOrCreateInstance($('#imgMdl')).show(); },
  zoomProof: d => { $('#imgBig').src = orders().find(x => x.id === d.id).proof; bootstrap.Modal.getOrCreateInstance($('#imgMdl')).show(); },
  star: d => { rvStar = Number(d.n); $$('#starPick i').forEach((el,i) => el.classList.toggle('on', i < rvStar)); },
  sendReview: d => sendReview(d.id),
  skipReview: d => { let s = []; try { s = JSON.parse(sessionStorage.getItem('pk_skip') || '[]'); } catch {} s.push(d.id); sessionStorage.setItem('pk_skip', JSON.stringify(s)); closeModal(); },
  aTab: d => { adminTab = d.t; renderAdmin(); },
  verify: d => { const a = orders(), o = a.find(x => x.id === d.id); o.pay = 'verified'; o.step = 0; o.log.push({ t:Date.now(), s:'Pembayaran terverifikasi', i:0 }); db.set(K.orders, a); toast('Pembayaran diverifikasi.'); renderAdmin(); },
  reject: d => { if (!confirm('Tolak bukti pembayaran ini?')) return; const a = orders(), o = a.find(x => x.id === d.id); o.pay = 'rejected'; db.set(K.orders, a); renderAdmin(); },
  stepModal: d => stepModal(d.id), saveStep: d => saveStep(d.id),
  delOrder: d => { if (confirm('Hapus pesanan ini secara permanen?')) { db.set(K.orders, orders().filter(x => x.id !== d.id)); renderAdmin(); } },
  tAdd: () => openModal('Tambah Ulasan Asli', `<div class="notice small mb-3">Gunakan fitur ini hanya untuk ulasan <strong>asli</strong> dari pelanggan yang benar-benar memakai layanan (misalnya diterima via WhatsApp), dengan seizin yang bersangkutan.</div>
    <div class="mb-3"><label class="form-label">Nama (mis. Budi)</label><input class="form-control" id="taName" maxlength="30"></div>
    <div class="mb-3"><label class="form-label">Daerah (mis. Jebres)</label><input class="form-control" id="taArea" maxlength="30"></div>
    <div class="mb-3"><label class="form-label">Jasa yang dipakai</label><select class="form-select" id="taSvc">${SERVICES.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}</select></div>
    <div class="mb-3"><label class="form-label">Bintang</label><select class="form-select" id="taStar"><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select></div>
    <div class="mb-3"><label class="form-label">Isi ulasan (sesuai aslinya)</label><textarea class="form-control" id="taText" rows="3" maxlength="200"></textarea></div>
    <div class="text-danger small" id="taErr"></div>`,
    `<button class="btn btn-outline-pk" data-bs-dismiss="modal">Batal</button><button class="btn btn-pk" data-act="tAddSave">Simpan</button>`),
  tAddSave: () => { const n = $('#taName').value.trim(), t = $('#taText').value.trim();
    if (n.length < 2 || t.length < 5) { $('#taErr').textContent = 'Nama dan isi ulasan wajib diisi.'; return; }
    const a = tests(); a.push({ id:uid('T'), oid:'', uid:'', name:n, area:$('#taArea').value.trim(), rating:Number($('#taStar').value), comment:t, photo:'', svc:$('#taSvc').value, visible:true, manual:true, at:Date.now() });
    if (db.set(K.tests, a)) { closeModal(); toast('Ulasan ditambahkan.'); renderAdmin(); } },
  tHide: d => { const a = tests(), t = a.find(x => x.id === d.id); t.visible = t.visible === false; db.set(K.tests, a); renderAdmin(); },
  tDel: d => { if (confirm('Hapus testimoni ini?')) { db.set(K.tests, tests().filter(x => x.id !== d.id)); renderAdmin(); } },
  tEdit: d => { const t = tests().find(x => x.id === d.id);
    openModal('Edit Testimoni', `<div class="mb-3"><label class="form-label">Komentar</label><textarea class="form-control" id="teText" rows="3" maxlength="200">${esc(t.comment)}</textarea></div><div class="mb-3"><label class="form-label">Daerah</label><input class="form-control" id="teArea" value="${esc(t.area||'')}"></div>`,
      `<button class="btn btn-pk" data-act="tSave" data-id="${t.id}">Simpan</button>`); },
  tSave: d => { const a = tests(), t = a.find(x => x.id === d.id); t.comment = $('#teText').value.trim(); t.area = $('#teArea').value.trim(); db.set(K.tests, a); closeModal(); renderAdmin(); },
  delUser: d => { if (confirm('Hapus pengguna ini?')) { db.set(K.users, users().filter(x => x.id !== d.id)); renderAdmin(); } },
  saveQris: () => { const p = $('#qrisText').value.trim();
    if (!/^000201/.test(p) || !p.includes('ID.CO.QRIS.WWW') || !crcOk(p)) { toast('Kode QRIS tidak valid (format atau CRC salah).'); return; }
    if (db.set(K.qrisP, p)) { toast('Kode QRIS disimpan.'); renderAdmin(); } },
  resetQris: () => { localStorage.removeItem(K.qrisP); toast('QRIS dikembalikan ke bawaan.'); renderAdmin(); }
};
document.addEventListener('click', e => {
  const a = e.target.closest('[data-act]'); if (!a) return;
  if (a.tagName === 'A') e.preventDefault();
  if (a.dataset.close) bootstrap.Offcanvas.getInstance($('#menu'))?.hide();
  acts[a.dataset.act]?.(a.dataset, e);
});
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('.svc')) e.target.click(); });
document.addEventListener('submit', e => {
  e.preventDefault();
  if (e.target.id === 'authForm') submitAuth(e.target);
  if (e.target.id === 'orderForm') submitOrder();
  if (e.target.id === 'profileForm') saveProfile();
});
['oName','oWa','oSvc','oDetail','oHours'].forEach(id => document.addEventListener('input', e => { if (e.target.id === id) updateOrderForm(); }));
document.addEventListener('change', e => { if (e.target.id === 'oSvc' || e.target.id === 'oHours') updateOrderForm(); });
document.addEventListener('DOMContentLoaded', () => { $('#btnVoucher').addEventListener('click', applyVoucher); });

document.addEventListener('input', e => {
  if (e.target.matches('#pText,#dText')) { LOC[e.target.id[0]] = { lat:null, lng:null }; locSearch(e.target.id[0]); }
  if (e.target.matches('#oSub,#pText,#dText,#oWhen,[name=oPayG]')) updateOrderForm();
});
document.addEventListener('change', e => { if (e.target.matches('#oSub,#oWhen,[name=oPayG]')) updateOrderForm(); });


/* ---- draf formulir: isian tersimpan otomatis, aman walau belum masuk/daftar ---- */
const DRAFT_K = 'pk_draft';
function saveDraft() {
  if (!$('#orderForm')) return;
  const d = { name:$('#oName').value, wa:$('#oWa').value, svc:$('#oSvc').value, sub:$('#oSub').value, hours:$('#oHours').value, detail:$('#oDetail').value,
    pText:$('#pText').value, dText:$('#dText').value, LOC:{ p:LOC.p, d:LOC.d }, when:$('#oWhen').value, payG:$('input[name=oPayG]:checked')?.value || '', voucher:$('#oVoucher').value };
  try { localStorage.setItem(DRAFT_K, JSON.stringify(d)); } catch {}
}
function clearDraft() { try { localStorage.removeItem(DRAFT_K); } catch {} }
function restoreDraft() {
  let d = null; try { d = JSON.parse(localStorage.getItem(DRAFT_K)); } catch {}
  if (!d || !$('#orderForm')) return;
  $('#oName').value = d.name || ''; $('#oWa').value = d.wa || ''; if (d.svc) $('#oSvc').value = d.svc;
  refreshSub(); if (d.sub) $('#oSub').value = d.sub; if (d.hours) $('#oHours').value = d.hours;
  $('#oDetail').value = d.detail || ''; $('#pText').value = d.pText || ''; $('#dText').value = d.dText || '';
  if (d.LOC) { LOC.p = d.LOC.p || { lat:null, lng:null }; LOC.d = d.LOC.d || { lat:null, lng:null }; }
  if (d.when && new Date(d.when).getTime() > Date.now()) $('#oWhen').value = d.when;
  if (d.payG) { const r = document.querySelector(`input[name=oPayG][value="${d.payG}"]`); if (r) r.checked = true; }
  if (d.voucher) { $('#oVoucher').value = d.voucher; try { applyVoucher(); } catch {} }
  updateOrderForm();
}
document.addEventListener('input', e => { if (e.target.closest && e.target.closest('#orderForm')) saveDraft(); });
document.addEventListener('change', e => { if (e.target.closest && e.target.closest('#orderForm')) saveDraft(); });

/* ============ Tema ============ */
function setTheme(t) {
  document.documentElement.dataset.bsTheme = t; localStorage.setItem(K.theme, t);
  $('meta[name=theme-color]').content = t === 'dark' ? '#0A2342' : '#0A2342';
}

/* ============ Slider otomatis ============ */
let sliderPause = false;
setInterval(() => {
  if (sliderPause || view !== 'home') return;
  $$('#tSlider,#pSlider').forEach(s => { if (s.children.length < 2) return;
    const w = s.children[0].getBoundingClientRect().width + 16;
    if (s.scrollLeft + s.clientWidth >= s.scrollWidth - 8) s.scrollTo({ left:0, behavior:'smooth' }); else s.scrollBy({ left:w, behavior:'smooth' }); });
}, 4000);
['touchstart','mouseenter'].forEach(ev => document.addEventListener(ev, e => { if (e.target.closest && e.target.closest('#tSlider,#pSlider')) sliderPause = true; }, { passive:true }));
['touchend','mouseleave'].forEach(ev => document.addEventListener(ev, () => { setTimeout(() => sliderPause = false, 2500); }, { passive:true }));

/* ============ Sinkronisasi status (polling + antar tab) ============ */
let sig = '';
const signature = () => localStorage.getItem(K.orders) + '|' + localStorage.getItem(K.tests) + '|' + (localStorage.getItem(K.sess) || '');
function sync() {
  const s = signature(); if (s === sig) return; sig = s;
  if (!$('#mdl').classList.contains('show')) renderView();
  checkReview();
}
setInterval(sync, 3000); window.addEventListener('storage', sync);

/* ============ PWA ============ */
let deferred;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; $('#btnInstall').classList.remove('d-none'); });
$('#btnInstall').addEventListener('click', async () => { if (!deferred) return; deferred.prompt(); await deferred.userChoice; deferred = null; $('#btnInstall').classList.add('d-none'); });
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));

/* ============ Hero slideshow ============ */
function heroSlides() {
  const bg = $('#heroBg'); if (!bg) return;
  [['hero','70% 30%']].forEach((x,i) => {
    const e = document.createElement('i'); e.style.backgroundImage = `url(${IMG[x[0]]})`; e.style.backgroundPosition = x[1];
    if (!i) e.className = 'on'; bg.appendChild(e);
  });
}

/* ============ Init ============ */
(async function init() {
  setTheme(localStorage.getItem(K.theme) || 'dark');
  $$('.WA_DISP').forEach(e => e.textContent = WA_DISP);
  $$('.WA_LINK').forEach(e => { e.href = waLink('Halo PanggilKami, saya ingin bertanya.'); e.target = '_blank'; e.rel = 'noopener'; });
  $$('[data-img]').forEach(e => e.src = IMG[e.dataset.img]);
  $$('[data-bg]').forEach(e => e.style.backgroundImage = `url(${IMG[e.dataset.bg]})`);
  logoImg.src = IMG.logoMono;
  heroSlides();
  setDefaultWhen();
  await seedAdmin();
  sig = signature(); renderView(); restoreDraft();
  setTimeout(checkReview, 800);
})();
