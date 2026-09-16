(() => {
  if (window.__cafassoAlmitasHistoryInstalled) return;
  window.__cafassoAlmitasHistoryInstalled = true;

  const ME_API = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoMe';
  const PROGRESS_API = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoProgress';
  const COURSE_ID = '__cafasso_almitas_ledger__';
  const MODULE_ID = '__movements__';
  const STYLE_ID = 'cafassoAlmitasHistoryStyles';
  const MAX_ENTRIES = 40;
  const VISIBLE_ENTRIES = 5;
  const HYDRATION_MS = 2800;
  const bootedAt = Date.now();

  const HUELLA_META = {
    'primera-huella': { title: 'Primera huella', amount: 10 },
    'ojos-atentos': { title: 'Ojos atentos', amount: 100 },
    'primer-paso': { title: 'Primer paso', amount: 20 },
    'con-el-corazon': { title: 'Con el corazón', amount: 15 },
    'camino-recorrido': { title: 'Camino recorrido', amount: 75 },
    'casa-habitada': { title: 'Casa habitada', amount: 30 }
  };

  let snapshot = null;
  let remoteLoading = null;
  let persistTimer = null;
  let knownAwarded = new Set();

  function json(storage, key) {
    try { return JSON.parse(storage.getItem(key) || 'null'); }
    catch (error) { return null; }
  }

  function sessionUser() {
    return json(localStorage, 'cafassoSession')?.user || {};
  }

  function uid() {
    const current = sessionUser();
    return String(current?._id || current?.id || '');
  }

  function userKey() {
    const current = sessionUser();
    return String(current?._id || current?.id || current?.email || current?.name || 'local');
  }

  function storageKey() { return `cafasso-almitas-ledger-v1:${userKey()}`; }
  function huellaRewardsKey() { return `cafasso-huella-rewards-v1:${userKey()}`; }

  function authHeaders(withJson = false) {
    const auth = json(localStorage, 'cafassoAuth');
    if (!auth?.sessionToken || Number(auth.expiresAt || 0) <= Date.now()) return null;
    const headers = { Authorization: `Bearer ${auth.sessionToken}` };
    if (withJson) headers['Content-Type'] = 'application/json';
    return headers;
  }

  function cleanEntry(raw) {
    const entry = raw && typeof raw === 'object' ? raw : {};
    return {
      id: String(entry.id || ''),
      amount: Number(entry.amount || 0),
      source: String(entry.source || 'Movimiento'),
      detail: String(entry.detail || ''),
      at: String(entry.at || ''),
      fingerprint: String(entry.fingerprint || '')
    };
  }

  function normalizeState(raw) {
    const source = raw && typeof raw === 'object' ? raw : {};
    const seen = new Set();
    const entries = (Array.isArray(source.entries) ? source.entries : [])
      .map(cleanEntry)
      .filter(entry => entry.id && Number.isFinite(entry.amount) && entry.at)
      .sort((a, b) => Number(new Date(b.at)) - Number(new Date(a.at)))
      .filter(entry => {
        const key = entry.fingerprint || entry.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, MAX_ENTRIES);
    return {
      version: 1,
      entries,
      updatedAt: String(source.updatedAt || '')
    };
  }

  function readLocal() {
    return normalizeState(json(localStorage, storageKey()));
  }

  function writeLocal(state) {
    const clean = normalizeState(state);
    try { localStorage.setItem(storageKey(), JSON.stringify(clean)); }
    catch (error) {}
    return clean;
  }

  function rewardState() {
    const state = json(localStorage, huellaRewardsKey()) || {};
    return {
      awarded: Array.isArray(state.awarded) ? state.awarded.map(String) : [],
      bonusAlmitas: Number(state.bonusAlmitas || 0)
    };
  }

  function makeId(prefix) {
    return `${prefix}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
  }

  function formatWhen(iso) {
    const date = new Date(iso);
    if (!Number.isFinite(date.getTime())) return '';
    const now = new Date();
    const sameDay = date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
    const time = date.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' });
    if (sameDay) return `Hoy · ${time}`;
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const isYesterday = date.getFullYear() === yesterday.getFullYear() && date.getMonth() === yesterday.getMonth() && date.getDate() === yesterday.getDate();
    if (isYesterday) return `Ayer · ${time}`;
    return `${date.toLocaleDateString('es-UY', { day: '2-digit', month: '2-digit' })} · ${time}`;
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-almitas-history{position:relative;margin:0 7px 18px;padding:14px 15px 13px;border:1px solid rgba(114,77,42,.2);background:rgba(255,250,237,.2);font-family:Inter,system-ui,sans-serif;color:#584432}
      .cafasso-almitas-history__head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px}
      .cafasso-almitas-history__title{color:#7d5e40;font:850 8px/1 Inter,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase}
      .cafasso-almitas-history__hint{color:#9a8269;font:700 8px/1 Inter,system-ui,sans-serif}
      .cafasso-almitas-history__list{display:grid;gap:6px}
      .cafasso-almitas-move{display:grid;grid-template-columns:48px 1fr auto;align-items:center;gap:10px;padding:8px 9px;border-top:1px solid rgba(107,78,49,.11)}
      .cafasso-almitas-move:first-child{border-top:0}
      .cafasso-almitas-move__amount{color:#8c612f;font:850 13px/1 Inter,system-ui,sans-serif}
      .cafasso-almitas-move__amount.is-negative{color:#9b5d4e}
      .cafasso-almitas-move__copy strong{display:block;color:#5b4431;font:750 10px/1.2 Inter,system-ui,sans-serif}
      .cafasso-almitas-move__copy span{display:block;margin-top:2px;color:#8b755f;font:9px/1.3 Inter,system-ui,sans-serif}
      .cafasso-almitas-move__when{color:#a08a74;font:700 8px/1.2 Inter,system-ui,sans-serif;white-space:nowrap}
      .cafasso-almitas-history__empty{padding:8px 2px 4px;color:#8e7a67;font:italic 11px/1.45 Georgia,serif}
      .cafasso-almitas-ledger-toast{position:fixed;z-index:2147483290;left:50%;bottom:30px;max-width:min(520px,90vw);padding:13px 18px;border:1px solid rgba(238,197,104,.55);border-radius:999px;background:rgba(12,43,40,.97);box-shadow:0 15px 34px rgba(0,0,0,.36);color:#fff4d4;text-align:center;font:800 11px/1.3 Inter,system-ui,sans-serif;letter-spacing:.01em;opacity:0;transform:translate(-50%,16px);transition:opacity .22s ease,transform .22s ease;pointer-events:none}
      .cafasso-almitas-ledger-toast.is-visible{opacity:1;transform:translate(-50%,0)}
      @media(max-width:680px){.cafasso-almitas-history{margin-left:0;margin-right:0}.cafasso-almitas-move{grid-template-columns:42px 1fr}.cafasso-almitas-move__when{grid-column:2}.cafasso-almitas-ledger-toast{bottom:18px;width:90vw;border-radius:14px}}
      @media(prefers-reduced-motion:reduce){.cafasso-almitas-ledger-toast{transition:none!important}}
    `;
    document.head.appendChild(style);
  }

  function render() {
    const path = document.querySelector('.cafasso-profile-path');
    if (!path) return false;
    ensureStyles();
    let panel = document.querySelector('[data-cafasso-almitas-history]');
    if (!panel) {
      panel = document.createElement('section');
      panel.className = 'cafasso-almitas-history';
      panel.dataset.cafassoAlmitasHistory = '1';
    }
    const preferredAnchor = document.querySelector('[data-cafasso-level-panel]') || document.querySelector('[data-cafasso-huellas-summary]') || path;
    if (panel.previousElementSibling !== preferredAnchor) preferredAnchor.insertAdjacentElement('afterend', panel);

    const state = readLocal();
    const visible = state.entries.slice(0, VISIBLE_ENTRIES);
    panel.innerHTML = `
      <div class="cafasso-almitas-history__head"><span class="cafasso-almitas-history__title">Movimientos de Almitas</span><span class="cafasso-almitas-history__hint">últimos ${VISIBLE_ENTRIES}</span></div>
      <div class="cafasso-almitas-history__list">
        ${visible.length ? visible.map(entry => `
          <div class="cafasso-almitas-move">
            <div class="cafasso-almitas-move__amount${entry.amount < 0 ? ' is-negative' : ''}">${entry.amount > 0 ? '+' : ''}${entry.amount}</div>
            <div class="cafasso-almitas-move__copy"><strong>${entry.source}</strong><span>${entry.detail || 'Movimiento registrado'}</span></div>
            <div class="cafasso-almitas-move__when">${formatWhen(entry.at)}</div>
          </div>`).join('') : '<div class="cafasso-almitas-history__empty">Los próximos cambios de Almitas van a quedar registrados acá.</div>'}
      </div>`;
    return true;
  }

  function showToast(amount, source, detail) {
    if (!amount) return;
    document.querySelector('.cafasso-almitas-ledger-toast')?.remove();
    const toast = document.createElement('div');
    toast.className = 'cafasso-almitas-ledger-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = `${amount > 0 ? '+' : ''}${amount} Almitas · ${source}${detail ? `: ${detail}` : ''}`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('is-visible'));
    setTimeout(() => toast.classList.remove('is-visible'), 3200);
    setTimeout(() => toast.remove(), 3550);
  }

  function schedulePersist() {
    clearTimeout(persistTimer);
    persistTimer = setTimeout(() => persist(readLocal()), 180);
  }

  function addEntry({ amount, source, detail = '', fingerprint = '', announce = true }) {
    const numericAmount = Number(amount || 0);
    if (!Number.isFinite(numericAmount) || numericAmount === 0) return false;
    const state = readLocal();
    if (fingerprint && state.entries.some(entry => entry.fingerprint === fingerprint)) return false;
    const entry = {
      id: makeId(source.toLowerCase().replace(/[^a-z0-9]+/g, '-')),
      amount: numericAmount,
      source,
      detail,
      at: new Date().toISOString(),
      fingerprint
    };
    state.entries.unshift(entry);
    state.updatedAt = entry.at;
    writeLocal(state);
    render();
    schedulePersist();
    if (announce) showToast(numericAmount, source, detail);
    window.dispatchEvent(new CustomEvent('cafasso:almitas-movement', { detail: entry }));
    return true;
  }

  function remoteState(data, userId) {
    const row = (Array.isArray(data?.progress) ? data.progress : []).find(item =>
      String(item?.courseId || '') === COURSE_ID && (!userId || !item?.userId || String(item.userId) === userId)
    );
    return normalizeState(row?.blockAnswers?.ledgerState || null);
  }

  function mergeStates(a, b) {
    return normalizeState({
      entries: [...(a?.entries || []), ...(b?.entries || [])],
      updatedAt: String(a?.updatedAt || b?.updatedAt || '')
    });
  }

  async function persist(state) {
    const headers = authHeaders(true);
    const userId = uid();
    if (!headers || !userId) return false;
    const clean = normalizeState(state);
    try {
      const response = await fetch(PROGRESS_API, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId,
          courseId: COURSE_ID,
          moduleId: MODULE_ID,
          completed: false,
          percent: 0,
          completedBlocks: clean.entries.slice(0, 20).map(entry => entry.id),
          blockAnswers: { ledgerState: clean }
        })
      });
      const result = await response.json().catch(() => ({}));
      return Boolean(response.ok && result?.ok !== false);
    } catch (error) {
      return false;
    }
  }

  async function syncRemote() {
    if (remoteLoading) return remoteLoading;
    remoteLoading = (async () => {
      const headers = authHeaders(false);
      const userId = uid();
      if (!headers) return readLocal();
      try {
        const response = await fetch(ME_API, { headers, cache: 'no-store' });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data?.ok === false) return readLocal();
        const local = readLocal();
        const merged = mergeStates(local, remoteState(data, userId));
        const changed = JSON.stringify(merged) !== JSON.stringify(local);
        writeLocal(merged);
        render();
        if (changed) await persist(merged);
        return merged;
      } catch (error) {
        return readLocal();
      } finally {
        remoteLoading = null;
      }
    })();
    return remoteLoading;
  }

  function currentSnapshot(metrics) {
    const rewards = rewardState();
    return {
      challenges: Math.max(0, Number(metrics?.almitas?.challenges || 0)),
      ruahBonus: Math.max(0, Number(metrics?.almitas?.ruahBonus ?? metrics?.ruah?.bonusAlmitas || 0)),
      ruahRewards: Math.max(0, Number(metrics?.ruah?.currentStreakRewards || 0)),
      ruahStreak: Math.max(0, Number(metrics?.ruah?.streak || 0)),
      huellaBonus: Math.max(0, Number(rewards.bonusAlmitas || 0))
    };
  }

  function handleMetrics(metrics) {
    const next = currentSnapshot(metrics || {});
    if (!snapshot || Date.now() - bootedAt < HYDRATION_MS) {
      snapshot = next;
      return;
    }

    const challengeDelta = next.challenges - snapshot.challenges;
    if (challengeDelta !== 0) {
      addEntry({
        amount: challengeDelta,
        source: challengeDelta > 0 ? 'Desafío aprobado' : 'Ajuste de desafío',
        detail: challengeDelta > 0 ? 'Recompensa acreditada por una entrega.' : 'Se actualizó el saldo de desafíos.',
        fingerprint: `challenges:${next.challenges}:${challengeDelta}`
      });
    }

    const ruahDelta = next.ruahBonus - snapshot.ruahBonus;
    if (ruahDelta !== 0) {
      addEntry({
        amount: ruahDelta,
        source: 'RUAH',
        detail: ruahDelta > 0 ? `${next.ruahStreak} días de constancia.` : 'Ajuste de bonificación RUAH.',
        fingerprint: `ruah:${next.ruahRewards}:${next.ruahBonus}`
      });
    }
    snapshot = next;
  }

  function handleHuellaReward(detail) {
    const awarded = Array.isArray(detail?.awarded) ? detail.awarded.map(String) : [];
    const newlyAwarded = awarded.filter(id => !knownAwarded.has(id) && HUELLA_META[id]);
    awarded.forEach(id => knownAwarded.add(id));

    if (Date.now() - bootedAt < HYDRATION_MS || !newlyAwarded.length) return;

    // Reemplaza el aviso genérico del sistema anterior por uno que explique la causa.
    document.querySelector('.cafasso-huella-reward-toast')?.remove();
    newlyAwarded.forEach((id, index) => {
      const meta = HUELLA_META[id];
      setTimeout(() => addEntry({
        amount: meta.amount,
        source: 'Huella',
        detail: meta.title,
        fingerprint: `huella:${id}`,
        announce: true
      }), index * 350);
    });
    snapshot = currentSnapshot(window.CafassoProfileMetrics || {});
  }

  function mountWhenReady() {
    let attempts = 0;
    const mount = () => {
      if (render()) return;
      if (attempts++ < 50) setTimeout(mount, 100);
    };
    mount();
  }

  async function boot() {
    ensureStyles();
    const rewards = rewardState();
    knownAwarded = new Set(rewards.awarded || []);
    snapshot = window.CafassoProfileMetrics ? currentSnapshot(window.CafassoProfileMetrics) : null;
    mountWhenReady();
    await syncRemote();

    window.addEventListener('cafasso:profile-metrics', event => handleMetrics(event?.detail || {}));
    window.addEventListener('cafasso:huella-rewards', event => handleHuellaReward(event?.detail || {}));
    window.addEventListener('cafasso:level-update', () => setTimeout(render, 40));
    window.addEventListener('focus', () => syncRemote());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') syncRemote();
    });
    setInterval(render, 2600);
    setInterval(syncRemote, 90000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
