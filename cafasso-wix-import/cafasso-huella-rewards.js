(() => {
  if (window.__cafassoHuellaRewardsInstalled) return;
  window.__cafassoHuellaRewardsInstalled = true;

  const ME_API = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoMe';
  const PROGRESS_API = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoProgress';
  const COURSE_ID = '__cafasso_huella_rewards__';
  const MODULE_ID = '__bonus__';
  const HUELLAS_COURSE_ID = '__cafasso_huellas__';
  const STYLE_ID = 'cafassoHuellaRewardsStyles';

  // RUAH y las entregas aprobadas ya tienen su propio circuito de Almitas.
  // Por eso esas dos Huellas no vuelven a premiar la misma acción.
  const REWARDS = [
    { id: 'primera-huella', amount: 10 },
    { id: 'ojos-atentos', amount: 100 },
    { id: 'primer-paso', amount: 20 },
    { id: 'con-el-corazon', amount: 15 },
    { id: 'camino-recorrido', amount: 75 },
    { id: 'casa-habitada', amount: 30 }
  ];
  const REWARD_BY_ID = new Map(REWARDS.map(item => [item.id, item.amount]));
  const HUELLAS_ORDER = [
    'primera-huella', 'ojos-atentos', 'ruah-encendido', 'primer-paso',
    'con-el-corazon', 'no-alcanza-con-saber', 'camino-recorrido', 'casa-habitada'
  ];

  let remoteLoading = null;

  function json(storage, key) {
    try { return JSON.parse(storage.getItem(key) || 'null'); }
    catch (error) { return null; }
  }

  function sessionUser() {
    return json(localStorage, 'cafassoSession')?.user || {};
  }

  function uid() {
    const user = sessionUser();
    return String(user?._id || user?.id || '');
  }

  function userKey() {
    const user = sessionUser();
    return String(user?._id || user?.id || user?.email || user?.name || 'local');
  }

  function storageKey() { return `cafasso-huella-rewards-v1:${userKey()}`; }
  function huellasStorageKey() { return `cafasso-huellas-v1:${userKey()}`; }

  function authHeaders(withJson = false) {
    const auth = json(localStorage, 'cafassoAuth');
    if (!auth?.sessionToken || Number(auth.expiresAt || 0) <= Date.now()) return null;
    const headers = { Authorization: `Bearer ${auth.sessionToken}` };
    if (withJson) headers['Content-Type'] = 'application/json';
    return headers;
  }

  function rewardTotal(awarded) {
    return [...new Set(awarded || [])].reduce((sum, id) => sum + Number(REWARD_BY_ID.get(id) || 0), 0);
  }

  function normalizeState(raw) {
    const source = raw && typeof raw === 'object' ? raw : {};
    const awarded = [...new Set((Array.isArray(source.awarded) ? source.awarded : [])
      .map(String)
      .filter(id => REWARD_BY_ID.has(id)))];
    return {
      version: 1,
      awarded,
      bonusAlmitas: rewardTotal(awarded),
      updatedAt: String(source.updatedAt || '')
    };
  }

  function readLocal() { return normalizeState(json(localStorage, storageKey())); }
  function writeLocal(state) {
    try { localStorage.setItem(storageKey(), JSON.stringify(normalizeState(state))); }
    catch (error) {}
  }

  function localUnlocked() {
    const state = json(localStorage, huellasStorageKey());
    return Array.isArray(state?.unlocked) ? state.unlocked.map(String) : [];
  }

  function mergeRewardStates(a, b) {
    return normalizeState({
      awarded: [...(a?.awarded || []), ...(b?.awarded || [])],
      updatedAt: String(b?.updatedAt || a?.updatedAt || '')
    });
  }

  function unlockedFromRemote(data, userId) {
    const row = (Array.isArray(data?.progress) ? data.progress : []).find(item =>
      String(item?.courseId || '') === HUELLAS_COURSE_ID && (!userId || !item?.userId || String(item.userId) === userId)
    );
    return Array.isArray(row?.blockAnswers?.huellasState?.unlocked)
      ? row.blockAnswers.huellasState.unlocked.map(String)
      : [];
  }

  function rewardsFromRemote(data, userId) {
    const row = (Array.isArray(data?.progress) ? data.progress : []).find(item =>
      String(item?.courseId || '') === COURSE_ID && (!userId || !item?.userId || String(item.userId) === userId)
    );
    return normalizeState(row?.blockAnswers?.huellaRewardState || null);
  }

  function awardMissing(state, unlocked) {
    const next = normalizeState(state);
    const unlockedSet = new Set(unlocked || []);
    const awardedSet = new Set(next.awarded);
    const newlyAwarded = [];
    REWARDS.forEach(reward => {
      if (!unlockedSet.has(reward.id) || awardedSet.has(reward.id)) return;
      next.awarded.push(reward.id);
      awardedSet.add(reward.id);
      newlyAwarded.push(reward);
    });
    if (newlyAwarded.length) next.updatedAt = new Date().toISOString();
    next.bonusAlmitas = rewardTotal(next.awarded);
    return { state: next, newlyAwarded };
  }

  async function persist(state) {
    writeLocal(state);
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
          completed: clean.awarded.length >= REWARDS.length,
          percent: Math.min(100, Math.round((clean.awarded.length / REWARDS.length) * 100)),
          completedBlocks: clean.awarded,
          blockAnswers: { huellaRewardState: clean }
        })
      });
      const result = await response.json().catch(() => ({}));
      return Boolean(response.ok && result?.ok !== false);
    } catch (error) {
      return false;
    }
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-huella-card__reward{display:inline-flex;align-items:center;gap:5px;margin:9px 0 0 8px;padding:4px 7px;border:1px solid rgba(150,103,42,.25);border-radius:999px;background:rgba(213,166,82,.09);color:#855b2d;font:850 8px/1 Inter,system-ui,sans-serif;letter-spacing:.04em;text-transform:uppercase}
      .cafasso-huella-bonus-note{display:block;margin-top:4px;color:#9a713f;font:700 9px/1.25 Inter,system-ui,sans-serif}
      .cafasso-huella-reward-toast{position:fixed;z-index:2147483270;left:50%;bottom:30px;min-width:min(370px,86vw);padding:13px 17px;border:1px solid rgba(238,197,104,.52);border-radius:999px;background:rgba(12,43,40,.96);box-shadow:0 15px 32px rgba(0,0,0,.34);color:#fff4d4;text-align:center;font:800 11px/1.25 Inter,system-ui,sans-serif;letter-spacing:.02em;opacity:0;transform:translate(-50%,16px);transition:opacity .22s ease,transform .22s ease;pointer-events:none}
      .cafasso-huella-reward-toast.is-visible{opacity:1;transform:translate(-50%,0)}
      @media(max-width:680px){.cafasso-huella-reward-toast{bottom:18px;min-width:88vw}.cafasso-huella-card__reward{margin-left:0}}
      @media(prefers-reduced-motion:reduce){.cafasso-huella-reward-toast{transition:none!important}}
    `;
    document.head.appendChild(style);
  }

  function adjustNumberNode(node, bonus) {
    if (!node || !Number.isFinite(Number(bonus))) return;
    const shown = Number(String(node.textContent || '').replace(/[^0-9.-]/g, ''));
    if (!Number.isFinite(shown)) return;
    const previousBase = Number(node.dataset.cafassoHuellaBase);
    const previousBonus = Number(node.dataset.cafassoHuellaBonus || 0);
    const previousAdjusted = Number.isFinite(previousBase) ? previousBase + previousBonus : NaN;
    let base = previousBase;
    if (!Number.isFinite(base)) base = shown;
    else if (shown !== previousAdjusted && shown !== previousBase) base = shown;
    node.dataset.cafassoHuellaBase = String(base);
    node.dataset.cafassoHuellaBonus = String(bonus);
    node.textContent = String(base + Number(bonus || 0));
  }

  function patchCounters(state) {
    const bonus = Number(state?.bonusAlmitas || 0);
    if (bonus <= 0) return;
    adjustNumberNode(document.querySelector('[data-global-almitas] .cafasso-global-counter__value'), bonus);
    adjustNumberNode(document.querySelector('[data-profile-almitas-card] strong'), bonus);
    document.querySelectorAll('[data-almitas-total]').forEach(node => adjustNumberNode(node, bonus));

    const card = document.querySelector('[data-profile-almitas-card]');
    if (card) {
      let note = card.querySelector('.cafasso-huella-bonus-note');
      if (!note) {
        note = document.createElement('span');
        note.className = 'cafasso-huella-bonus-note';
        card.appendChild(note);
      }
      note.textContent = `+${bonus} por Huellas`;
    }
  }

  function patchAlbum(state) {
    const cards = [...document.querySelectorAll('.cafasso-huellas-grid .cafasso-huella-card')];
    if (!cards.length) return;
    const awarded = new Set(state?.awarded || []);
    cards.forEach((card, index) => {
      const id = HUELLAS_ORDER[index];
      const amount = Number(REWARD_BY_ID.get(id) || 0);
      card.querySelector('.cafasso-huella-card__reward')?.remove();
      if (!amount || !awarded.has(id) || !card.classList.contains('is-unlocked')) return;
      const reward = document.createElement('span');
      reward.className = 'cafasso-huella-card__reward';
      reward.textContent = `✦ +${amount} Almitas`;
      card.appendChild(reward);
    });
  }

  function patchUi(state) {
    ensureStyles();
    patchCounters(state);
    patchAlbum(state);
  }

  function showRewardToast(newlyAwarded) {
    if (!newlyAwarded?.length) return;
    document.querySelector('.cafasso-huella-reward-toast')?.remove();
    const total = newlyAwarded.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const toast = document.createElement('div');
    toast.className = 'cafasso-huella-reward-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = newlyAwarded.length === 1
      ? `✦ Huella recompensada · +${total} Almitas`
      : `✦ ${newlyAwarded.length} Huellas recompensadas · +${total} Almitas`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('is-visible'));
    setTimeout(() => toast.classList.remove('is-visible'), 3000);
    setTimeout(() => toast.remove(), 3350);
  }

  async function applyUnlocked(unlocked, { announce = false } = {}) {
    const current = readLocal();
    const result = awardMissing(current, unlocked);
    if (result.newlyAwarded.length) {
      writeLocal(result.state);
      await persist(result.state);
      if (announce) showRewardToast(result.newlyAwarded);
      window.dispatchEvent(new CustomEvent('cafasso:huella-rewards', {
        detail: {
          bonusAlmitas: result.state.bonusAlmitas,
          awarded: result.state.awarded,
          delta: result.newlyAwarded.reduce((sum, item) => sum + item.amount, 0)
        }
      }));
    }
    patchUi(result.state);
    return result.state;
  }

  async function syncRemote({ backfill = false } = {}) {
    if (remoteLoading) return remoteLoading;
    remoteLoading = (async () => {
      const localRewards = readLocal();
      const localHuellas = localUnlocked();
      const headers = authHeaders(false);
      const userId = uid();
      if (!headers) return applyUnlocked(localHuellas, { announce: !backfill });
      try {
        const response = await fetch(ME_API, { headers, cache: 'no-store' });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data?.ok === false) return applyUnlocked(localHuellas, { announce: !backfill });
        const remoteRewards = rewardsFromRemote(data, userId);
        const mergedRewards = mergeRewardStates(localRewards, remoteRewards);
        writeLocal(mergedRewards);
        const unlocked = [...new Set([...localHuellas, ...unlockedFromRemote(data, userId)])];
        const result = awardMissing(mergedRewards, unlocked);
        if (result.newlyAwarded.length || JSON.stringify(result.state) !== JSON.stringify(localRewards)) {
          await persist(result.state);
        }
        patchUi(result.state);
        if (!backfill && result.newlyAwarded.length) showRewardToast(result.newlyAwarded);
        if (result.newlyAwarded.length) {
          window.dispatchEvent(new CustomEvent('cafasso:huella-rewards', {
            detail: {
              bonusAlmitas: result.state.bonusAlmitas,
              awarded: result.state.awarded,
              delta: result.newlyAwarded.reduce((sum, item) => sum + item.amount, 0)
            }
          }));
        }
        return result.state;
      } catch (error) {
        return applyUnlocked(localHuellas, { announce: !backfill });
      } finally {
        remoteLoading = null;
      }
    })();
    return remoteLoading;
  }

  function localTick() {
    applyUnlocked(localUnlocked(), { announce: true });
  }

  async function boot() {
    ensureStyles();
    patchUi(readLocal());
    await syncRemote({ backfill: true });

    const wake = () => setTimeout(localTick, 120);
    window.addEventListener('cafasso:exploration-update', wake);
    window.addEventListener('cafasso:profile-metrics', () => setTimeout(() => patchUi(readLocal()), 30));
    window.addEventListener('cafasso:progress-update', wake);
    window.addEventListener('focus', () => syncRemote());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') syncRemote();
    });

    setInterval(localTick, 1800);
    setInterval(() => syncRemote(), 60000);
    setInterval(() => patchUi(readLocal()), 2200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
