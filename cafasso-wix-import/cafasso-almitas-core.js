(() => {
  if (window.__cafassoAlmitasCoreInstalled) return;
  window.__cafassoAlmitasCoreInstalled = true;

  const ME_API = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoMe';
  const GIFT_COURSE = '__cafasso_admin_gifts__';
  const RUAH_COURSE = '__cafasso_ruah__';
  const RESERVED_PREFIX = '__cafasso_';
  const CACHE_PREFIX = 'cafasso-almitas-core-v1:';
  let loading = null;
  let last = null;
  let applying = false;
  let observer = null;

  function json(storage, key) {
    try { return JSON.parse(storage.getItem(key) || 'null'); }
    catch (error) { return null; }
  }

  function sessionUser() { return json(localStorage, 'cafassoSession')?.user || {}; }
  function uid() { const u = sessionUser(); return String(u?._id || u?.id || ''); }
  function userKey() { const u = sessionUser(); return String(u?._id || u?.id || u?.email || u?.name || 'local'); }
  function cacheKey() { return `${CACHE_PREFIX}${userKey()}`; }
  function huellaKey() { return `cafasso-huella-rewards-v1:${userKey()}`; }
  function ruahKey() { return `cafasso-ruah-v2:${userKey()}`; }

  function authHeaders() {
    const auth = json(localStorage, 'cafassoAuth');
    if (!auth?.sessionToken || Number(auth.expiresAt || 0) <= Date.now()) return null;
    return { Authorization: `Bearer ${auth.sessionToken}` };
  }

  function rowsForUser(data) {
    const id = uid();
    return (Array.isArray(data?.progress) ? data.progress : []).filter(row =>
      !id || !row?.userId || String(row.userId) === id
    );
  }

  function challengeAlmitas(data) {
    return rowsForUser(data)
      .filter(row => {
        const courseId = String(row?.courseId || '');
        return courseId && !courseId.startsWith(RESERVED_PREFIX);
      })
      .reduce((sum, row) => sum + Math.max(0, Number(row?.almitasApproved || 0)), 0);
  }

  function ruahAlmitas(data) {
    const row = rowsForUser(data).find(item => String(item?.courseId || '') === RUAH_COURSE) || null;
    const remote = Math.max(
      0,
      Number(row?.ruahBonusAlmitas || 0),
      Number(row?.blockAnswers?.ruahState?.bonusAlmitas || 0)
    );
    const local = Math.max(0, Number(json(localStorage, ruahKey())?.bonusAlmitas || 0));
    const current = Math.max(0, Number(window.CafassoProfileMetrics?.almitas?.ruahBonus || window.CafassoProfileMetrics?.ruah?.bonusAlmitas || 0));
    return Math.max(remote, local, current);
  }

  function huellaAlmitas() {
    return Math.max(0, Number(json(localStorage, huellaKey())?.bonusAlmitas || 0));
  }

  function adminGiftRows(data) {
    return (Array.isArray(data?.submissions) ? data.submissions : []).filter(row =>
      String(row?.courseId || '') === GIFT_COURSE &&
      String(row?.status || '') === 'Aprobada' &&
      Number(row?.rewardAlmitas || 0) > 0
    );
  }

  function adminGiftAlmitas(data) {
    return adminGiftRows(data).reduce((sum, row) => sum + Math.max(0, Number(row?.rewardAlmitas || 0)), 0);
  }

  function pendingAlmitas(data) {
    return (Array.isArray(data?.submissions) ? data.submissions : [])
      .filter(row => {
        const courseId = String(row?.courseId || '');
        return courseId && !courseId.startsWith(RESERVED_PREFIX) &&
          ['Pendiente', 'En revisión'].includes(String(row?.status || '')) &&
          Number(row?.rewardAlmitas || 0) > 0;
      })
      .reduce((sum, row) => sum + Math.max(0, Number(row?.rewardAlmitas || 0)), 0);
  }

  function calculate(data) {
    const challenges = challengeAlmitas(data);
    const ruah = ruahAlmitas(data);
    const huellas = huellaAlmitas();
    const gifts = adminGiftAlmitas(data);
    const pending = pendingAlmitas(data);
    return {
      total: challenges + ruah + huellas + gifts,
      challenges,
      ruah,
      huellas,
      gifts,
      pending,
      updatedAt: new Date().toISOString()
    };
  }

  function writeCache(metrics) {
    try { localStorage.setItem(cacheKey(), JSON.stringify(metrics)); }
    catch (error) {}
  }

  function readCache() { return json(localStorage, cacheKey()); }

  function patchNumericUi(metrics) {
    if (!metrics) return;
    applying = true;
    const value = String(Math.max(0, Number(metrics.total || 0)));
    const globalNode = document.querySelector('[data-global-almitas] .cafasso-global-counter__value');
    const profileNode = document.querySelector('[data-profile-almitas-card] strong');
    if (globalNode && globalNode.textContent !== value) globalNode.textContent = value;
    if (profileNode && profileNode.textContent !== value) profileNode.textContent = value;
    document.querySelectorAll('[data-almitas-total]').forEach(node => {
      if (node.textContent !== value) node.textContent = value;
    });

    const profileCard = document.querySelector('[data-profile-almitas-card]');
    const subtitle = profileCard?.querySelector('.cafasso-profile-metric-sub, span');
    if (subtitle) {
      const parts = [];
      if (metrics.challenges) parts.push(`${metrics.challenges} por desafíos`);
      if (metrics.ruah) parts.push(`${metrics.ruah} por RUAH`);
      if (metrics.huellas) parts.push(`${metrics.huellas} por Huellas`);
      if (metrics.gifts) parts.push(`${metrics.gifts} regaladas`);
      if (metrics.pending) parts.push(`${metrics.pending} pendientes`);
      subtitle.textContent = parts.length ? parts.join(' · ') : 'Tu camino recién empieza.';
    }

    const current = window.CafassoProfileMetrics || {};
    window.CafassoProfileMetrics = {
      ...current,
      almitas: {
        ...(current.almitas || {}),
        total: Number(metrics.total || 0),
        challenges: Number(metrics.challenges || 0),
        ruahBonus: Number(metrics.ruah || 0),
        huellasBonus: Number(metrics.huellas || 0),
        adminGiftBonus: Number(metrics.gifts || 0),
        pending: Number(metrics.pending || 0)
      }
    };
    queueMicrotask(() => { applying = false; });
  }

  function publish(metrics, { force = false } = {}) {
    if (!metrics) return;
    const changed = force || !last || ['total','challenges','ruah','huellas','gifts','pending'].some(key => Number(last?.[key] || 0) !== Number(metrics?.[key] || 0));
    last = metrics;
    window.CafassoAlmitasMetrics = metrics;
    writeCache(metrics);
    patchNumericUi(metrics);
    if (changed) {
      window.dispatchEvent(new CustomEvent('cafasso:almitas-total', { detail: metrics }));
    }
  }

  async function refresh({ force = false } = {}) {
    if (loading) return loading;
    loading = (async () => {
      const headers = authHeaders();
      if (!headers || !uid()) {
        const cached = readCache();
        if (cached) publish(cached, { force });
        return cached || null;
      }
      try {
        const response = await fetch(ME_API, { headers, cache: 'no-store' });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data?.ok === false) throw new Error(data?.error || 'almitas');
        const metrics = calculate(data);
        publish(metrics, { force });
        return metrics;
      } catch (error) {
        const cached = readCache();
        if (cached) publish(cached, { force });
        return cached || null;
      }
    })().finally(() => { loading = null; });
    return loading;
  }

  function holdUntilReady() {
    const cached = readCache();
    if (cached) {
      last = cached;
      patchNumericUi(cached);
      return;
    }
    applying = true;
    const globalNode = document.querySelector('[data-global-almitas] .cafasso-global-counter__value');
    if (globalNode) globalNode.textContent = '…';
    queueMicrotask(() => { applying = false; });
  }

  function observeUi() {
    if (observer || !document.body) return;
    observer = new MutationObserver(() => {
      if (applying || !last) return;
      const globalNode = document.querySelector('[data-global-almitas] .cafasso-global-counter__value');
      const profileNode = document.querySelector('[data-profile-almitas-card] strong');
      const expected = String(Number(last.total || 0));
      if ((globalNode && globalNode.textContent !== expected) || (profileNode && profileNode.textContent !== expected)) {
        patchNumericUi(last);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  function schedule(delay = 0, force = false) {
    setTimeout(() => refresh({ force }), delay);
  }

  function boot() {
    holdUntilReady();
    observeUi();
    schedule(80, true);
    schedule(900, true);
    window.addEventListener('cafasso:profile-metrics', () => schedule(40, true));
    window.addEventListener('cafasso:huella-rewards', () => schedule(80, true));
    window.addEventListener('cafasso:admin-gifts', () => schedule(80, true));
    window.addEventListener('cafasso:almitas-movement', () => schedule(120, true));
    window.addEventListener('focus', () => schedule(20, true));
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') schedule(20, true);
    });
    setInterval(() => refresh({ force: true }), 30000);
  }

  window.CafassoAlmitasCore = { refresh, calculate, get current() { return last; } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
