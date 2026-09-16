(() => {
  if (window.__cafassoAdminGiftsClientV2Installed) return;
  window.__cafassoAdminGiftsClientV2Installed = true;

  const ME = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoMe';
  const GIFT_COURSE = '__cafasso_admin_gifts__';
  const MAX_LEDGER = 40;
  let loading = null;
  let timer = null;

  const json = (storage, key) => { try { return JSON.parse(storage.getItem(key) || 'null'); } catch (e) { return null; } };
  const user = () => json(localStorage, 'cafassoSession')?.user || {};
  const uid = () => String(user()?._id || user()?.id || '');
  const userKey = () => String(user()?._id || user()?.id || user()?.email || user()?.name || 'local');
  const ledgerKey = () => `cafasso-almitas-ledger-v1:${userKey()}`;
  const seenKey = () => `cafasso-admin-gifts-seen-v2:${userKey()}`;

  function headers() {
    const a = json(localStorage, 'cafassoAuth');
    return a?.sessionToken && Number(a.expiresAt || 0) > Date.now() ? { Authorization: `Bearer ${a.sessionToken}` } : null;
  }

  function gifts(data) {
    return (data?.submissions || [])
      .filter(s => String(s.courseId || '') === GIFT_COURSE && String(s.status || '') === 'Aprobada' && Number(s.rewardAlmitas || 0) > 0)
      .map(s => ({
        id: String(s.activityId || s._id || ''),
        amount: Math.max(0, Number(s.rewardAlmitas || 0)),
        reason: String(s.content || ''),
        at: String(s.almitasAwardedAt || s.reviewedAt || s._createdDate || s._updatedDate || ''),
        by: String(s.feedback || '').replace(/^Asignado por\s*/i, '') || 'Administrador'
      }))
      .filter(g => g.id && g.amount > 0)
      .sort((a, b) => new Date(b.at) - new Date(a.at));
  }

  function normalizeLedger(raw) {
    const source = raw && typeof raw === 'object' ? raw : {};
    const seen = new Set();
    const entries = (Array.isArray(source.entries) ? source.entries : [])
      .map(x => ({
        id: String(x?.id || ''), amount: Number(x?.amount || 0), source: String(x?.source || 'Movimiento'),
        detail: String(x?.detail || ''), at: String(x?.at || ''), fingerprint: String(x?.fingerprint || '')
      }))
      .filter(e => e.id && Number.isFinite(e.amount) && e.at)
      .sort((a, b) => new Date(b.at) - new Date(a.at))
      .filter(e => { const k = e.fingerprint || e.id; if (seen.has(k)) return false; seen.add(k); return true; })
      .slice(0, MAX_LEDGER);
    return { version: 1, entries, updatedAt: String(source.updatedAt || '') };
  }

  function mergeGifts(list) {
    const ledger = normalizeLedger(json(localStorage, ledgerKey()));
    let changed = false;
    for (const g of list) {
      const fp = `admin-gift:${g.id}`;
      if (ledger.entries.some(e => e.fingerprint === fp)) continue;
      ledger.entries.push({
        id: `gift:${g.id}`,
        amount: g.amount,
        source: 'Regalo del administrador',
        detail: g.reason || `Asignado por ${g.by}`,
        at: g.at || new Date().toISOString(),
        fingerprint: fp
      });
      changed = true;
    }
    const clean = normalizeLedger({ entries: ledger.entries, updatedAt: changed ? new Date().toISOString() : ledger.updatedAt });
    try { localStorage.setItem(ledgerKey(), JSON.stringify(clean)); } catch (e) {}
    return clean;
  }

  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[c]));
  function fmt(iso) {
    const d = new Date(iso); if (!Number.isFinite(d.getTime())) return '';
    const now = new Date(), time = d.toLocaleTimeString('es-UY', { hour:'2-digit', minute:'2-digit' });
    if (d.toDateString() === now.toDateString()) return `Hoy · ${time}`;
    return `${d.toLocaleDateString('es-UY', { day:'2-digit', month:'2-digit' })} · ${time}`;
  }

  function renderHistory(ledger) {
    const list = document.querySelector('[data-cafasso-almitas-history] .cafasso-almitas-history__list');
    if (!list) return;
    const visible = ledger.entries.slice(0, 5);
    list.innerHTML = visible.length ? visible.map(e => `<div class="cafasso-almitas-move"><div class="cafasso-almitas-move__amount${e.amount < 0 ? ' is-negative' : ''}">${e.amount > 0 ? '+' : ''}${e.amount}</div><div class="cafasso-almitas-move__copy"><strong>${esc(e.source)}</strong><span>${esc(e.detail || 'Movimiento registrado')}</span></div><div class="cafasso-almitas-move__when">${fmt(e.at)}</div></div>`).join('') : '<div class="cafasso-almitas-history__empty">Los próximos cambios de Almitas van a quedar registrados acá.</div>';
  }

  function unseen(list) {
    const old = json(localStorage, seenKey()), known = new Set(Array.isArray(old?.ids) ? old.ids.map(String) : []);
    return list.filter(g => !known.has(g.id));
  }
  function markSeen(list) {
    try { localStorage.setItem(seenKey(), JSON.stringify({ ids:list.map(g => g.id).slice(0, 300), updatedAt:new Date().toISOString() })); } catch (e) {}
  }

  function toast(items) {
    if (!items.length) return;
    const sum = items.reduce((n, g) => n + g.amount, 0), latest = items[0];
    document.querySelector('.cafasso-admin-gift-toast')?.remove();
    const t = document.createElement('div');
    t.className = 'cafasso-admin-gift-toast';
    t.style.cssText = 'position:fixed;z-index:2147483590;left:50%;bottom:28px;max-width:min(560px,90vw);padding:13px 18px;border:1px solid rgba(238,197,104,.58);border-radius:999px;background:rgba(12,43,40,.98);box-shadow:0 15px 34px rgba(0,0,0,.36);color:#fff4d4;text-align:center;font:800 11px/1.35 Inter,system-ui,sans-serif;opacity:0;transform:translate(-50%,16px);transition:.22s opacity,.22s transform;pointer-events:none';
    t.textContent = `+${sum} Almitas · Regalo del administrador${latest.reason ? `: ${latest.reason}` : ''}`;
    document.body.appendChild(t);
    requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translate(-50%,0)'; });
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translate(-50%,16px)'; }, 3500);
    setTimeout(() => t.remove(), 3850);
  }

  async function refresh({ announce = true } = {}) {
    if (loading) return loading;
    loading = (async () => {
      const h = headers(); if (!h || !uid()) return;
      try {
        const r = await fetch(ME, { headers:h, cache:'no-store' });
        const data = await r.json().catch(() => ({}));
        if (!r.ok || data?.ok === false) return;
        const list = gifts(data), newItems = unseen(list), bonus = list.reduce((n, g) => n + g.amount, 0), ledger = mergeGifts(list);
        renderHistory(ledger);
        if (announce && newItems.length) toast(newItems);
        markSeen(list);
        window.CafassoAdminGiftMetrics = { bonusAlmitas: bonus, gifts:list };
        window.dispatchEvent(new CustomEvent('cafasso:admin-gifts', { detail: window.CafassoAdminGiftMetrics }));
      } catch (e) {}
    })().finally(() => { loading = null; });
    return loading;
  }

  function schedule(announce = false, delay = 180) { clearTimeout(timer); timer = setTimeout(() => refresh({ announce }), delay); }
  function boot() {
    setTimeout(() => refresh({ announce:false }), 700);
    window.addEventListener('focus', () => refresh({ announce:true }));
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refresh({ announce:true }); });
    setInterval(() => refresh({ announce:true }), 45000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();
