/* ============================================================
   Database online PanggilKami (Supabase)
   Supaya pesanan, bukti bayar, dan ulasan dari HP pelanggan
   masuk ke Dasbor Admin di perangkat mana pun.
   Cara mengisi: lihat file PANDUAN-DATABASE.txt
   ============================================================ */
window.PK_CLOUD = {
  url: '',   // contoh: https://abcdxyz.supabase.co
  key: ''    // anon public key dari Supabase
};

(function () {
  const C = window.PK_CLOUD, on = () => !!(C.url && C.key);
  window.pkCloudOn = on;
  const MK = 'pk_cloud_meta', TBL = { pk_orders:'orders', pk_testimonials:'testimonials' };
  const meta = () => { try { return JSON.parse(localStorage.getItem(MK)) || {}; } catch { return {}; } };
  const saveMeta = m => { try { localStorage.setItem(MK, JSON.stringify(m)); } catch {} };
  const hsh = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return s.length + ':' + h; };
  const H = extra => Object.assign({ apikey:C.key, Authorization:'Bearer ' + C.key, 'Content-Type':'application/json' }, extra || {});
  const api = (path, opt) => fetch(C.url.replace(/\/$/, '') + '/rest/v1/' + path, opt);
  let busy = false, timer = null, warned = false;

  async function push(key) {
    const t = TBL[key]; if (!t) return;
    const m = meta(); m[t] = m[t] || { h:{}, since:0 };
    const list = JSON.parse(localStorage.getItem(key) || '[]'), now = Date.now(), changed = [], ids = new Set();
    list.forEach(x => { ids.add(x.id); const h = hsh(JSON.stringify(x)); if (m[t].h[x.id] !== h) changed.push({ x, h }); });
    for (let i = 0; i < changed.length; i += 5) {
      const part = changed.slice(i, i + 5), upd = now + i;
      const rows = part.map(p => t === 'orders' ? { id:p.x.id, uid:p.x.uid || '', data:p.x, upd } : { id:p.x.id, data:p.x, upd });
      const r = await api(t + '?on_conflict=id', { method:'POST', headers:H({ Prefer:'resolution=merge-duplicates,return=minimal' }), body:JSON.stringify(rows) });
      if (!r.ok) throw new Error('push ' + t + ' ' + r.status);
      part.forEach(p => { m[t].h[p.x.id] = p.h; }); saveMeta(m);
    }
    for (const id of Object.keys(m[t].h)) if (!ids.has(id)) {
      const r = await api(t + '?id=eq.' + encodeURIComponent(id), { method:'DELETE', headers:H() });
      if (r.ok) { delete m[t].h[id]; saveMeta(m); }
    }
  }

  async function pull(key, filter) {
    const t = TBL[key], m = meta(); m[t] = m[t] || { h:{}, since:0 };
    const r = await api(`${t}?select=id,data,upd&upd=gt.${Math.max(0, m[t].since - 5000)}${filter || ''}&order=upd.asc&limit=300`, { headers:H() });
    if (!r.ok) throw new Error('pull ' + t + ' ' + r.status);
    const rows = await r.json(); if (!rows.length) return false;
    const list = JSON.parse(localStorage.getItem(key) || '[]'); let diff = false;
    rows.forEach(row => { const h = hsh(JSON.stringify(row.data)), i = list.findIndex(x => x.id === row.id);
      m[t].since = Math.max(m[t].since, row.upd);
      if (i >= 0 && hsh(JSON.stringify(list[i])) === h) { m[t].h[row.id] = h; return; }
      if (i >= 0 && m[t].h[row.id] !== hsh(JSON.stringify(list[i]))) return;   /* ada perubahan lokal yang belum terkirim */
      if (i >= 0) list[i] = row.data; else list.push(row.data); m[t].h[row.id] = h; diff = true; });
    saveMeta(m); if (diff) localStorage.setItem(key, JSON.stringify(list)); return diff;
  }

  async function cycle() {
    if (!on() || busy || document.hidden) return; busy = true;
    try {
      await push('pk_orders'); await push('pk_testimonials');
      const u = typeof me === 'function' ? me() : null;
      await pull('pk_testimonials');
      if (u) await pull('pk_orders', u.role === 'admin' ? '' : '&uid=eq.' + encodeURIComponent(u.id));
      warned = false;
    } catch (e) { console.warn('Database online:', e.message); if (!warned) { warned = true; toast('Koneksi ke database online bermasalah. Data tetap aman di perangkat dan akan dikirim ulang.'); } }
    busy = false;
  }

  window.pkCloudPush = key => { if (!on() || !TBL[key]) return; clearTimeout(timer); timer = setTimeout(cycle, 400); };

  function adminNotice() {
    if (on() || sessionStorage.getItem('pk_cloud_note')) return;
    if (typeof isAdmin === 'function' && isAdmin()) { sessionStorage.setItem('pk_cloud_note', '1'); toast('Database online belum diaktifkan. Pesanan pelanggan baru terlihat di perangkat yang sama. Lihat PANDUAN-DATABASE.txt.'); }
  }
  setInterval(adminNotice, 4000);
  setInterval(cycle, 6000); setTimeout(cycle, 1500);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) cycle(); });
})();
