/* ============================================================
   Database online PanggilKami (Supabase)
   Supaya pesanan, bukti bayar, pengguna, dan ulasan dari HP
   pelanggan masuk ke Dasbor Admin secara otomatis dan realtime.
   ============================================================ */
window.PK_CLOUD = {
  url: 'https://bfjaflojwapdvclvvghy.supabase.co',
  key: 'sb_publishable_LfyHyXMs3ZJdd2jIzaEmhw__NccGunP'
};

window.PK_SQL_SCRIPT = `-- Skrip Tabel Supabase PanggilKami
create table if not exists orders (
  id text primary key,
  uid text not null default '',
  data jsonb not null,
  upd bigint not null
);
create index if not exists orders_upd_idx on orders (upd);
create index if not exists orders_uid_idx on orders (uid);
alter table orders enable row level security;
drop policy if exists "pk_orders_all" on orders;
create policy "pk_orders_all" on orders for all to public using (true) with check (true);

create table if not exists users (
  id text primary key,
  email text not null,
  role text not null default 'user',
  data jsonb not null,
  upd bigint not null
);
create index if not exists users_upd_idx on users (upd);
create index if not exists users_email_idx on users (email);
alter table users enable row level security;
drop policy if exists "pk_users_all" on users;
create policy "pk_users_all" on users for all to public using (true) with check (true);

create table if not exists testimonials (
  id text primary key,
  data jsonb not null,
  upd bigint not null
);
create index if not exists testimonials_upd_idx on testimonials (upd);
alter table testimonials enable row level security;
drop policy if exists "pk_testimonials_all" on testimonials;
create policy "pk_testimonials_all" on testimonials for all to public using (true) with check (true);`;

(function () {
  const getUrl = () => {
    try {
      const u = localStorage.getItem('pk_cloud_url') || window.PK_CLOUD.url || '';
      return u.trim().replace(/\/$/, '');
    } catch {
      return (window.PK_CLOUD.url || '').trim().replace(/\/$/, '');
    }
  };

  const getKey = () => {
    try {
      return (localStorage.getItem('pk_cloud_key') || window.PK_CLOUD.key || '').trim();
    } catch {
      return (window.PK_CLOUD.key || '').trim();
    }
  };

  const on = () => !!(getUrl() && getKey());
  window.pkCloudOn = on;
  window.pkCloudGetConfig = () => ({ url: getUrl(), key: getKey(), on: on() });
  window.pkCloudSetConfig = (url, key) => {
    try {
      localStorage.setItem('pk_cloud_url', (url || '').trim());
      localStorage.setItem('pk_cloud_key', (key || '').trim());
      window.PK_CLOUD.url = (url || '').trim();
      window.PK_CLOUD.key = (key || '').trim();
      clearTimeout(timer);
      setTimeout(cycle, 100);
      return true;
    } catch {
      return false;
    }
  };

  const MK = 'pk_cloud_meta';
  const TBL = { pk_orders: 'orders', pk_users: 'users', pk_testimonials: 'testimonials' };
  const meta = () => { try { return JSON.parse(localStorage.getItem(MK)) || {}; } catch { return {}; } };
  const saveMeta = m => { try { localStorage.setItem(MK, JSON.stringify(m)); } catch {} };
  const hsh = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return s.length + ':' + h; };
  const authH = () => { const k = getKey(); return String(k).startsWith('eyJ') ? { Authorization: 'Bearer ' + k } : {}; };
  const H = extra => Object.assign({ apikey: getKey(), 'Content-Type': 'application/json' }, authH(), extra || {});
  const api = (path, opt) => fetch(getUrl() + '/rest/v1/' + path, opt);
  let busy = false, timer = null, warned = false;
  const st = { ok: null, msg: '' };
  window.pkCloudStatus = st;

  window.pkCloudTest = async (testUrl, testKey) => {
    const u = (testUrl || getUrl()).replace(/\/$/, '');
    const k = testKey || getKey();
    if (!u || !k) throw new Error('URL dan Kunci API harus diisi.');
    const rO = await fetch(u + '/rest/v1/orders?select=id&limit=1', { headers: { apikey: k } });
    if (!rO.ok) {
      if (rO.status === 404) throw new Error('Tabel "orders" belum dibuat di Supabase. Buka SQL Editor di Supabase lalu jalankan skrip database.');
      throw new Error(`HTTP ${rO.status}: ${rO.statusText}`);
    }
    const rU = await fetch(u + '/rest/v1/users?select=id&limit=1', { headers: { apikey: k } });
    if (!rU.ok && rU.status === 404) {
      throw new Error('Tabel "users" belum dibuat di Supabase. Buka SQL Editor di Supabase lalu jalankan skrip database.');
    }
    return true;
  };

  async function push(key) {
    const t = TBL[key]; if (!t) return;
    const m = meta(); m[t] = m[t] || { h: {}, since: 0 };
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    const now = Date.now(), changed = [], ids = new Set();
    list.forEach(x => {
      if (!x || !x.id) return;
      ids.add(x.id);
      const h = hsh(JSON.stringify(x));
      if (m[t].h[x.id] !== h) changed.push({ x, h });
    });

    for (let i = 0; i < changed.length; i += 3) {
      const part = changed.slice(i, i + 3), upd = now + i;
      const rows = part.map(p => {
        if (t === 'orders') return { id: p.x.id, uid: p.x.uid || '', data: p.x, upd };
        if (t === 'users') return { id: p.x.id, email: (p.x.email || '').toLowerCase(), role: p.x.role || 'user', data: p.x, upd };
        return { id: p.x.id, data: p.x, upd };
      });
      const r = await api(t + '?on_conflict=id', {
        method: 'POST',
        headers: H({ Prefer: 'resolution=merge-duplicates,return=minimal' }),
        body: JSON.stringify(rows)
      });
      if (!r.ok) throw new Error(t + '|' + r.status);
      part.forEach(p => { m[t].h[p.x.id] = p.h; });
      saveMeta(m);
    }

    // Hanya akun admin yang berhak menghapus data dari cloud
    const isAdm = typeof isAdmin === 'function' && isAdmin();
    if (isAdm) {
      for (const id of Object.keys(m[t].h)) {
        if (!ids.has(id)) {
          const r = await api(t + '?id=eq.' + encodeURIComponent(id), { method: 'DELETE', headers: H() });
          if (r.ok) { delete m[t].h[id]; saveMeta(m); }
        }
      }
    }
  }

  async function pull(key, filter) {
    const t = TBL[key], m = meta(); m[t] = m[t] || { h: {}, since: 0 };
    const sinceVal = Math.max(0, (m[t].since || 0) - 5000);
    const r = await api(`${t}?select=id,data,upd&upd=gt.${sinceVal}${filter || ''}&order=upd.asc&limit=300`, { headers: H() });
    if (!r.ok) throw new Error(t + '|' + r.status);
    const rows = await r.json();
    if (!rows || !rows.length) return false;
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    let diff = false;
    rows.forEach(row => {
      if (!row || !row.id || !row.data) return;
      const h = hsh(JSON.stringify(row.data));
      const i = list.findIndex(x => x.id === row.id);
      m[t].since = Math.max(m[t].since || 0, row.upd || 0);
      if (i >= 0 && hsh(JSON.stringify(list[i])) === h) { m[t].h[row.id] = h; return; }
      if (i >= 0 && m[t].h[row.id] !== hsh(JSON.stringify(list[i]))) return;
      if (i >= 0) list[i] = row.data; else list.push(row.data);
      m[t].h[row.id] = h;
      diff = true;
    });
    saveMeta(m);
    if (diff) {
      localStorage.setItem(key, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('pk:cloud-sync', { detail: { key, count: list.length } }));
    }
    return diff;
  }

  window.pkCloudPullUser = async function (email) {
    if (!on() || !email) return null;
    try {
      const r = await api(`users?email=eq.${encodeURIComponent(email.toLowerCase())}&limit=1`, { headers: H() });
      if (!r.ok) return null;
      const rows = await r.json();
      if (!rows || !rows.length) return null;
      const usr = rows[0].data;
      const list = JSON.parse(localStorage.getItem('pk_users') || '[]');
      const i = list.findIndex(x => x.id === usr.id);
      if (i >= 0) list[i] = usr; else list.push(usr);
      localStorage.setItem('pk_users', JSON.stringify(list));
      return usr;
    } catch {
      return null;
    }
  };

  function why(e) {
    const c = String(e.message).split('|')[1];
    if (c === '401' || c === '403') return 'Kunci API salah atau aturan RLS belum dibuat. Jalankan database.sql di Supabase.';
    if (c === '404') return 'Tabel database belum dibuat di Supabase. Buka SQL Editor di Supabase lalu jalankan skrip database.sql.';
    if (c) return 'Server Supabase membalas kode ' + c;
    return 'Gagal menghubungi server database. Periksa koneksi internet.';
  }

  async function cycle() {
    if (!on()) { st.ok = false; st.msg = 'cloud.js belum diisi.'; return; }
    if (busy || document.hidden) return;
    busy = true;
    try {
      await push('pk_orders');
      await push('pk_users');
      await push('pk_testimonials');

      const u = typeof me === 'function' ? me() : null;
      const tDiff = await pull('pk_testimonials');
      let oDiff = false;
      let uDiff = false;

      if (u) {
        oDiff = await pull('pk_orders', u.role === 'admin' ? '' : '&uid=eq.' + encodeURIComponent(u.id));
        if (u.role === 'admin') {
          uDiff = await pull('pk_users');
        }
      }

      warned = false;
      st.ok = true;
      st.msg = 'Terhubung & Aktif';

      if ((tDiff || oDiff || uDiff) && typeof window.onCloudUpdated === 'function') {
        window.onCloudUpdated({ testimonials: tDiff, orders: oDiff, users: uDiff });
      }
    } catch (e) {
      st.ok = false;
      st.msg = why(e);
      console.warn('Database online:', e.message);
      if (!warned) {
        warned = true;
        if (typeof toast === 'function') toast('Database online: ' + st.msg);
      }
    }
    busy = false;
  }

  window.pkCloudPush = key => {
    if (!on() || !TBL[key]) return;
    clearTimeout(timer);
    timer = setTimeout(cycle, 250);
  };

  window.pkCloudSyncNow = () => {
    if (!on()) {
      if (typeof toast === 'function') toast('Database online belum dikonfigurasi.');
      return false;
    }
    clearTimeout(timer);
    return cycle();
  };

  function badge() {
    let b = document.getElementById('cloudBadge');
    const show = typeof isAdmin === 'function' && isAdmin() && typeof view !== 'undefined' && view === 'admin';
    if (!show) { if (b) b.remove(); return; }
    if (!b) {
      b = document.createElement('button');
      b.id = 'cloudBadge';
      b.type = 'button';
      b.style.cssText = 'position:fixed;left:14px;bottom:14px;z-index:1080;max-width:calc(100% - 90px);text-align:left;border:1px solid rgba(255,255,255,.25);border-radius:12px;padding:8px 14px;font-size:.78rem;color:#fff;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.35);transition:all .2s ease;';
      b.addEventListener('click', () => {
        st.msg = 'Menyinkronkan…';
        busy = false;
        cycle();
      });
      document.body.appendChild(b);
    }
    b.style.background = st.ok ? '#157347' : (st.ok === false ? '#b02a37' : '#495057');
    b.innerHTML = st.ok
      ? '<i class="bi bi-cloud-check-fill me-1"></i> Database: Terhubung &amp; Sinkron'
      : (st.ok === false ? `<i class="bi bi-exclamation-triangle-fill me-1"></i> Database: ${st.msg}` : '<i class="bi bi-arrow-repeat me-1"></i> Database: Memeriksa koneksi…');
  }

  setInterval(badge, 1500);
  setInterval(cycle, 4000);
  setTimeout(cycle, 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) cycle(); });
})();