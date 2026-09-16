(() => {
  if (window.__cafassoAdminGiftsClientInstalled) return;
  window.__cafassoAdminGiftsClientInstalled = true;

  const ME_API = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoMe';
  const PROGRESS_API = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoProgress';
  const GIFT_COURSE_ID = '__cafasso_admin_gifts__';
  const LEDGER_COURSE_ID = '__cafasso_almitas_ledger__';
  const LEDGER_MODULE_ID = '__movements__';
  const RUAH_ID = '__cafasso_ruah__';
  const HUELLAS_ID = '__cafasso_huella_rewards__';
  const MAX_LEDGER = 40;
  const LEVELS = [
    { id:'sonador', min:0, title:'Soñador', icon:'✧', copy:'Todo empieza con una intuición que invita a ponerse en camino.' },
    { id:'caminante', min:100, title:'Caminante', icon:'›', copy:'Ya no mirás desde afuera: empezaste a recorrer el camino.' },
    { id:'presencia', min:300, title:'Presencia', icon:'◉', copy:'Tu camino empieza a hacerse presencia cercana entre otros.' },
    { id:'acompanante', min:600, title:'Acompañante', icon:'◇', copy:'Aprender se convierte en estar cerca, escuchar y sostener.' },
    { id:'servidor', min:1000, title:'Servidor', icon:'✦', copy:'Lo recibido empieza a volverse entrega concreta.' },
    { id:'corazon-salesiano', min:1600, title:'Corazón salesiano', icon:'♡', copy:'Casa, patio, escuela y parroquia se vuelven una misma forma de estar.' }
  ];
  let loading = null;
  let timer = null;

  function json(storage, key) {
    try { return JSON.parse(storage.getItem(key) || 'null'); }
    catch (error) { return null; }
  }

  function sessionUser() { return json(localStorage, 'cafassoSession')?.user || {}; }
  function uid() { const user = sessionUser(); return String(user?._id || user?.id || ''); }
  function userKey() { const user = sessionUser(); return String(user?._id || user?.id || user?.email || user?.name || 'local'); }
  function ledgerKey() { return `cafasso-almitas-ledger-v1:${userKey()}`; }
  function seenKey() { return `cafasso-admin-gifts-seen-v1:${userKey()}`; }
  function levelKey() { return `cafasso-admin-gift-level-v1:${userKey()}`; }

  function authHeaders(withJson = false) {
    const auth = json(localStorage, 'cafassoAuth');
    if (!auth?.sessionToken || Number(auth.expiresAt || 0) <= Date.now()) return null;
    const headers = { Authorization: `Bearer ${auth.sessionToken}` };
    if (withJson) headers['Content-Type'] = 'application/json';
    return headers;
  }

  function row(data, courseId) {
    const userId = uid();
    return (Array.isArray(data?.progress) ? data.progress : []).find(item =>
      String(item?.courseId || '') === courseId && (!userId || !item?.userId || String(item.userId) === userId)
    ) || null;
  }

  function giftsState(data) {
    const raw = row(data, GIFT_COURSE_ID)?.blockAnswers?.adminGiftState || {};
    const gifts = (Array.isArray(raw.gifts) ? raw.gifts : [])
      .map(item => ({
        id: String(item?.id || ''),
        amount: Math.max(0, Math.round(Number(item?.amount || 0))),
        reason: String(item?.reason || ''),
        at: String(item?.at || ''),
        byName: String(item?.byName || 'Administrador')
      }))
      .filter(item => item.id && item.amount > 0 && item.at)
      .sort((a, b) => new Date(b.at) - new Date(a.at));
    const sum = gifts.reduce((total, item) => total + item.amount, 0);
    return {
      gifts,
      bonusAlmitas: Math.max(sum, Math.max(0, Number(raw.bonusAlmitas || 0))),
      updatedAt: String(raw.updatedAt || '')
    };
  }

  function authoritativeTotal(data, gifts) {
    const userId = uid();
    const rows = (Array.isArray(data?.progress) ? data.progress : []).filter(item =>
      !userId || !item?.userId || String(item.userId) === userId
    );
    const approved = rows.reduce((sum, item) => sum + Number(item?.almitasApproved || 0), 0);
    const ruah = Number(row(data, RUAH_ID)?.blockAnswers?.ruahState?.bonusAlmitas || 0);
    const huellas = Number(row(data, HUELLAS_ID)?.blockAnswers?.huellaRewardState?.bonusAlmitas || 0);
    return Math.max(0, approved + ruah + huellas + Number(gifts?.bonusAlmitas || 0));
  }

  function cleanEntry(raw) {
    const entry = raw && typeof raw === 'object' ? raw : {};
    return {
      id: String(entry.id || ''), amount: Number(entry.amount || 0), source: String(entry.source || 'Movimiento'),
      detail: String(entry.detail || ''), at: String(entry.at || ''), fingerprint: String(entry.fingerprint || '')
    };
  }

  function normalizeLedger(raw) {
    const source = raw && typeof raw === 'object' ? raw : {};
    const seen = new Set();
    const entries = (Array.isArray(source.entries) ? source.entries : [])
      .map(cleanEntry)
      .filter(entry => entry.id && Number.isFinite(entry.amount) && entry.at)
      .sort((a, b) => new Date(b.at) - new Date(a.at))
      .filter(entry => {
        const key = entry.fingerprint || entry.id;
        if (seen.has(key)) return false;
        seen.add(key); return true;
      })
      .slice(0, MAX_LEDGER);
    return { version:1, entries, updatedAt:String(source.updatedAt || '') };
  }

  function mergeLedger(local, remote) {
    return normalizeLedger({ entries:[...(local?.entries || []), ...(remote?.entries || [])], updatedAt:local?.updatedAt || remote?.updatedAt || '' });
  }

  function remoteLedger(data) {
    return normalizeLedger(row(data, LEDGER_COURSE_ID)?.blockAnswers?.ledgerState || null);
  }

  function addGiftsToLedger(data, gifts) {
    const local = normalizeLedger(json(localStorage, ledgerKey()));
    const merged = mergeLedger(local, remoteLedger(data));
    let changed = false;
    gifts.gifts.forEach(gift => {
      const fingerprint = `admin-gift:${gift.id}`;
      if (merged.entries.some(entry => entry.fingerprint === fingerprint)) return;
      merged.entries.push({
        id: `gift-ledger:${gift.id}`,
        amount: gift.amount,
        source: 'Regalo del administrador',
        detail: gift.reason || 'Reconocimiento del equipo de CAFASSO',
        at: gift.at,
        fingerprint
      });
      changed = true;
    });
    const clean = normalizeLedger({ entries:merged.entries, updatedAt:changed ? new Date().toISOString() : merged.updatedAt });
    try { localStorage.setItem(ledgerKey(), JSON.stringify(clean)); } catch (error) {}
    return { ledger:clean, changed };
  }

  async function persistLedger(ledger) {
    const headers = authHeaders(true);
    const userId = uid();
    if (!headers || !userId) return false;
    try {
      const response = await fetch(PROGRESS_API, {
        method:'POST', headers,
        body:JSON.stringify({
          userId,
          courseId:LEDGER_COURSE_ID,
          moduleId:LEDGER_MODULE_ID,
          completed:false,
          percent:0,
          completedBlocks:ledger.entries.slice(0,20).map(entry => entry.id),
          blockAnswers:{ ledgerState:ledger }
        })
      });
      const result = await response.json().catch(() => ({}));
      return Boolean(response.ok && result?.ok !== false);
    } catch (error) { return false; }
  }

  function formatWhen(iso) {
    const date = new Date(iso); if (!Number.isFinite(date.getTime())) return '';
    const now = new Date();
    const same = date.toDateString() === now.toDateString();
    const time = date.toLocaleTimeString('es-UY', { hour:'2-digit', minute:'2-digit' });
    if (same) return `Hoy · ${time}`;
    return `${date.toLocaleDateString('es-UY', { day:'2-digit', month:'2-digit' })} · ${time}`;
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
  }

  function renderHistory(ledger) {
    const panel = document.querySelector('[data-cafasso-almitas-history]');
    if (!panel) return;
    const visible = ledger.entries.slice(0,5);
    const list = panel.querySelector('.cafasso-almitas-history__list');
    if (!list) return;
    list.innerHTML = visible.length ? visible.map(entry => `
      <div class="cafasso-almitas-move">
        <div class="cafasso-almitas-move__amount${entry.amount < 0 ? ' is-negative' : ''}">${entry.amount > 0 ? '+' : ''}${entry.amount}</div>
        <div class="cafasso-almitas-move__copy"><strong>${esc(entry.source)}</strong><span>${esc(entry.detail || 'Movimiento registrado')}</span></div>
        <div class="cafasso-almitas-move__when">${formatWhen(entry.at)}</div>
      </div>`).join('') : '<div class="cafasso-almitas-history__empty">Los próximos cambios de Almitas van a quedar registrados acá.</div>';
  }

  function levelFor(total) {
    let level = LEVELS[0];
    LEVELS.forEach(item => { if (total >= item.min) level = item; });
    const index = LEVELS.findIndex(item => item.id === level.id);
    const next = LEVELS[index + 1] || null;
    const span = next ? Math.max(1, next.min - level.min) : 1;
    const progress = next ? Math.max(0, Math.min(100, ((total - level.min) / span) * 100)) : 100;
    return { level, next, index, progress };
  }

  function showLevelUp(data) {
    document.querySelector('.cafasso-level-up')?.remove();
    const box = document.createElement('div');
    box.className = 'cafasso-level-up';
    box.setAttribute('role','status');
    box.innerHTML = `<div class="cafasso-level-up__icon">${data.level.icon}</div><small>Nueva etapa del camino</small><strong>${data.level.title}</strong><span>${data.level.copy}</span>`;
    document.body.appendChild(box);
    requestAnimationFrame(() => box.classList.add('is-visible'));
    setTimeout(() => box.classList.remove('is-visible'), 3300);
    setTimeout(() => box.remove(), 3650);
  }

  function patchLevel(total, announce = false) {
    const data = levelFor(total);
    const pill = document.querySelector('.cafasso-level-pill');
    if (pill) pill.innerHTML = `<span class="cafasso-level-pill__icon">${data.level.icon}</span><span><small>Etapa del camino</small><strong>${data.level.title}</strong></span>`;
    const panel = document.querySelector('[data-cafasso-level-panel]');
    if (panel) {
      const remaining = data.next ? Math.max(0, data.next.min - total) : 0;
      const title = panel.querySelector('h3'); const copy = panel.querySelector('p'); const icon = panel.querySelector('.cafasso-level-panel__icon');
      const bar = panel.querySelector('.cafasso-level-progress i'); const foot = panel.querySelector('.cafasso-level-panel__foot');
      if (title) title.textContent = data.level.title;
      if (copy) copy.textContent = data.level.copy;
      if (icon) icon.textContent = data.level.icon;
      if (bar) bar.style.width = `${data.progress.toFixed(1)}%`;
      if (foot) foot.innerHTML = `<span><b>${total}</b> Almitas</span><span>${data.next ? `Faltan <b>${remaining}</b> para ${data.next.title}` : '<b>Etapa más alta alcanzada</b>'}</span>`;
    }

    const previous = json(localStorage, levelKey()) || {};
    const previousIndex = Number.isFinite(Number(previous.index)) ? Number(previous.index) : null;
    try { localStorage.setItem(levelKey(), JSON.stringify({ index:data.index, id:data.level.id, total, updatedAt:new Date().toISOString() })); } catch (error) {}
    if (announce && previousIndex !== null && data.index > previousIndex) showLevelUp(data);

    window.CafassoLevel = { totalAlmitas:total, ...data };
    window.dispatchEvent(new CustomEvent('cafasso:level-update', { detail:window.CafassoLevel }));
  }

  function patchCounters(total, giftBonus) {
    const global = document.querySelector('[data-global-almitas] .cafasso-global-counter__value');
    if (global) global.textContent = String(total);
    const card = document.querySelector('[data-profile-almitas-card]');
    if (card) {
      const strong = card.querySelector('strong'); const span = card.querySelector('span');
      if (strong) strong.textContent = String(total);
      if (span) {
        let text = String(span.textContent || '').replace(/\s*·\s*\d+\s+regaladas?/gi, '').trim();
        if (giftBonus > 0) text = `${text}${text ? ' · ' : ''}${giftBonus} regaladas`;
        span.textContent = text || 'Tu camino recién empieza.';
      }
    }
    document.querySelectorAll('[data-almitas-total]').forEach(node => { node.textContent = String(total); });
    if (window.CafassoProfileMetrics) {
      window.CafassoProfileMetrics.almitas = {
        ...(window.CafassoProfileMetrics.almitas || {}),
        total,
        adminGiftBonus:giftBonus
      };
    }
  }

  function unseenGifts(gifts) {
    const stored = json(localStorage, seenKey());
    const known = new Set(Array.isArray(stored?.ids) ? stored.ids.map(String) : []);
    return gifts.gifts.filter(gift => !known.has(gift.id));
  }

  function markSeen(gifts) {
    try { localStorage.setItem(seenKey(), JSON.stringify({ ids:gifts.gifts.map(gift => gift.id).slice(0,250), updatedAt:new Date().toISOString() })); } catch (error) {}
  }

  function showGiftToast(items) {
    if (!items.length) return;
    const amount = items.reduce((sum, item) => sum + item.amount, 0);
    const latest = items[0];
    document.querySelector('.cafasso-admin-gift-toast')?.remove();
    const toast = document.createElement('div');
    toast.className = 'cafasso-admin-gift-toast';
    toast.style.cssText = 'position:fixed;z-index:2147483590;left:50%;bottom:28px;max-width:min(540px,90vw);padding:13px 18px;border:1px solid rgba(238,197,104,.58);border-radius:999px;background:rgba(12,43,40,.98);box-shadow:0 15px 34px rgba(0,0,0,.36);color:#fff4d4;text-align:center;font:800 11px/1.35 Inter,system-ui,sans-serif;opacity:0;transform:translate(-50%,16px);transition:.22s opacity,.22s transform;pointer-events:none';
    toast.textContent = `+${amount} Almitas · Regalo del administrador${latest.reason ? `: ${latest.reason}` : ''}`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => { toast.style.opacity = '1'; toast.style.transform = 'translate(-50%,0)'; });
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translate(-50%,16px)'; }, 3500);
    setTimeout(() => toast.remove(), 3850);
  }

  async function refresh({ announce = true } = {}) {
    if (loading) return loading;
    loading = (async () => {
      const headers = authHeaders(false);
      if (!headers || !uid()) return;
      try {
        const response = await fetch(ME_API, { headers, cache:'no-store' });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data?.ok === false) return;
        const gifts = giftsState(data);
        const unseen = unseenGifts(gifts);
        const total = authoritativeTotal(data, gifts);
        const result = addGiftsToLedger(data, gifts);
        if (result.changed) await persistLedger(result.ledger);
        renderHistory(result.ledger);
        patchCounters(total, gifts.bonusAlmitas);
        patchLevel(total, announce && unseen.length > 0);
        if (announce && unseen.length) showGiftToast(unseen);
        markSeen(gifts);
        window.CafassoAdminGiftMetrics = { totalAlmitas:total, bonusAlmitas:gifts.bonusAlmitas, gifts:gifts.gifts };
        window.dispatchEvent(new CustomEvent('cafasso:admin-gifts', { detail:window.CafassoAdminGiftMetrics }));
      } catch (error) {}
    })().finally(() => { loading = null; });
    return loading;
  }

  function schedule(announce = true, delay = 140) {
    clearTimeout(timer);
    timer = setTimeout(() => refresh({ announce }), delay);
  }

  function boot() {
    setTimeout(() => refresh({ announce:false }), 950);
    window.addEventListener('cafasso:profile-metrics', () => schedule(false, 180));
    window.addEventListener('cafasso:huella-rewards', () => schedule(false, 220));
    window.addEventListener('focus', () => refresh({ announce:true }));
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refresh({ announce:true }); });
    setInterval(() => refresh({ announce:true }), 45000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();
