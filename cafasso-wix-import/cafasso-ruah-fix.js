(() => {
  if (window.__cafassoRuahDailyFixInstalled) return;
  window.__cafassoRuahDailyFixInstalled = true;

  const ME_API = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoMe';
  const PROGRESS_API = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoProgress';
  const COURSE_ID = '__cafasso_ruah__';
  const MODULE_ID = '__daily__';
  const REWARD_EVERY = 10;
  const REWARD_ALMITAS = 50;
  let syncing = null;

  function json(storage, key) {
    try { return JSON.parse(storage.getItem(key) || 'null'); }
    catch (error) { return null; }
  }

  function user() {
    return json(localStorage, 'cafassoSession')?.user || {};
  }

  function userId() {
    const current = user();
    return String(current?._id || current?.id || '');
  }

  function userKey() {
    const current = user();
    return String(current?._id || current?.id || current?.email || current?.name || 'local');
  }

  function stateKey() {
    return `cafasso-ruah-v2:${userKey()}`;
  }

  function legacyCounterKey() {
    return `cafasso-global-counters-v1:${userKey()}`;
  }

  function authHeaders(withJson = false) {
    const auth = json(localStorage, 'cafassoAuth');
    if (!auth?.sessionToken || Number(auth.expiresAt || 0) <= Date.now()) return null;
    const headers = { Authorization: `Bearer ${auth.sessionToken}` };
    if (withJson) headers['Content-Type'] = 'application/json';
    return headers;
  }

  function todayKey() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function dayNumber(key) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(key || ''));
    if (!match) return NaN;
    return Math.floor(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) / 86400000);
  }

  function normalize(raw) {
    const source = raw && typeof raw === 'object' ? raw : {};
    return {
      streak: Math.max(0, Number(source.streak || 0)),
      lastDay: String(source.lastDay || ''),
      longest: Math.max(0, Number(source.longest || source.streak || 0)),
      currentStreakRewards: Math.max(0, Number(source.currentStreakRewards || 0)),
      bonusAlmitas: Math.max(0, Number(source.bonusAlmitas || 0)),
      updatedAt: String(source.updatedAt || '')
    };
  }

  function bestState(...candidates) {
    const usable = candidates.map(normalize).filter(item => item.streak > 0 || item.lastDay);
    if (!usable.length) return normalize(null);
    usable.sort((a, b) => {
      const dayA = dayNumber(a.lastDay);
      const dayB = dayNumber(b.lastDay);
      const safeA = Number.isFinite(dayA) ? dayA : -Infinity;
      const safeB = Number.isFinite(dayB) ? dayB : -Infinity;
      if (safeA !== safeB) return safeB - safeA;
      if (a.streak !== b.streak) return b.streak - a.streak;
      return Number(new Date(b.updatedAt || 0)) - Number(new Date(a.updatedAt || 0));
    });
    const best = { ...usable[0] };
    usable.forEach(item => {
      if (item.lastDay === best.lastDay) best.streak = Math.max(best.streak, item.streak);
      best.longest = Math.max(best.longest, item.longest, item.streak);
      best.currentStreakRewards = Math.max(best.currentStreakRewards, item.currentStreakRewards);
      best.bonusAlmitas = Math.max(best.bonusAlmitas, item.bonusAlmitas);
    });
    return best;
  }

  function localCandidates() {
    return [
      json(localStorage, stateKey()),
      json(localStorage, legacyCounterKey())?.ruah,
      window.CafassoProfileMetrics?.ruah
    ].map(normalize).filter(item => item.streak > 0 || item.lastDay);
  }

  function continuityBase(candidates, today) {
    const usable = (candidates || []).map(normalize).filter(item => item.streak > 0 || item.lastDay);
    if (!usable.length) return normalize(null);

    const todayNumber = dayNumber(today);
    const yesterdayStates = usable.filter(item => dayNumber(item.lastDay) === todayNumber - 1);
    const todayStates = usable.filter(item => dayNumber(item.lastDay) === todayNumber);

    if (yesterdayStates.length) {
      const yesterday = bestState(...yesterdayStates);
      const current = todayStates.length ? bestState(...todayStates) : normalize(null);
      // Si algún componente viejo inicializó hoy en 1 antes de leer ayer,
      // preservamos la continuidad y dejamos que advance() lo convierta en +1.
      if (!current.lastDay || current.streak <= yesterday.streak) return yesterday;
    }

    return bestState(...usable);
  }

  function advance(raw, today = todayKey()) {
    const old = normalize(raw);
    const previousDay = old.lastDay;
    const previousNumber = dayNumber(previousDay);
    const todayNumber = dayNumber(today);
    let streak = old.streak;
    let currentStreakRewards = old.currentStreakRewards;
    let bonusAlmitas = old.bonusAlmitas;
    let changed = false;

    if (!Number.isFinite(previousNumber) || streak < 1) {
      streak = 1;
      currentStreakRewards = 0;
      changed = true;
    } else if (previousDay === today) {
      streak = Math.max(1, streak);
    } else if (todayNumber - previousNumber === 1) {
      streak += 1;
      changed = true;
    } else if (todayNumber - previousNumber > 1) {
      streak = 1;
      currentStreakRewards = 0;
      changed = true;
    } else {
      return { state: old, changed: false };
    }

    const earnedRewards = Math.floor(streak / REWARD_EVERY);
    if (earnedRewards > currentStreakRewards) {
      bonusAlmitas += (earnedRewards - currentStreakRewards) * REWARD_ALMITAS;
      currentStreakRewards = earnedRewards;
      changed = true;
    }

    const longest = Math.max(old.longest, streak);
    if (longest !== old.longest) changed = true;

    return {
      state: {
        streak,
        lastDay: today,
        longest,
        currentStreakRewards,
        bonusAlmitas,
        updatedAt: changed || previousDay !== today ? new Date().toISOString() : old.updatedAt
      },
      changed: changed || previousDay !== today
    };
  }

  function writeLocal(state) {
    try { localStorage.setItem(stateKey(), JSON.stringify(normalize(state))); }
    catch (error) {}
  }

  function findRemote(data, uid) {
    return (Array.isArray(data?.progress) ? data.progress : []).find(row =>
      String(row?.courseId || '') === COURSE_ID && (!uid || !row?.userId || String(row.userId) === uid)
    )?.blockAnswers?.ruahState || null;
  }

  function sameState(a, b) {
    const left = normalize(a);
    const right = normalize(b);
    return left.streak === right.streak &&
      left.lastDay === right.lastDay &&
      left.longest === right.longest &&
      left.currentStreakRewards === right.currentStreakRewards &&
      left.bonusAlmitas === right.bonusAlmitas;
  }

  async function persist(state) {
    const headers = authHeaders(true);
    const uid = userId();
    if (!headers || !uid) return false;
    const cycle = ((Math.max(1, state.streak) - 1) % REWARD_EVERY) + 1;
    try {
      const response = await fetch(PROGRESS_API, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId: uid,
          courseId: COURSE_ID,
          moduleId: MODULE_ID,
          completed: false,
          percent: cycle * (100 / REWARD_EVERY),
          completedBlocks: [`day:${state.lastDay}`],
          blockAnswers: { ruahState: normalize(state) }
        })
      });
      const result = await response.json().catch(() => ({}));
      return Boolean(response.ok && result?.ok !== false);
    } catch (error) {
      return false;
    }
  }

  function updateLegacyCache(state, bonusDelta) {
    const cached = json(localStorage, legacyCounterKey()) || {};
    const almitas = cached?.almitas && typeof cached.almitas === 'object' ? { ...cached.almitas } : { total: 0 };
    const currentTotal = Number(almitas.total || 0);
    if (bonusDelta) almitas.total = Math.max(0, currentTotal + bonusDelta);
    almitas.ruahBonus = Number(state.bonusAlmitas || 0);
    const next = { ...cached, almitas, ruah: normalize(state) };
    try { localStorage.setItem(legacyCounterKey(), JSON.stringify(next)); }
    catch (error) {}
  }

  function patchUi(state) {
    const currentMetrics = window.CafassoProfileMetrics;
    const oldBonus = Number(currentMetrics?.ruah?.bonusAlmitas ?? currentMetrics?.almitas?.ruahBonus ?? 0);
    const newBonus = Number(state.bonusAlmitas || 0);
    const bonusDelta = newBonus - oldBonus;

    if (currentMetrics) {
      const oldTotal = Number(currentMetrics?.almitas?.total || 0);
      window.CafassoProfileMetrics = {
        ...currentMetrics,
        almitas: {
          ...(currentMetrics.almitas || {}),
          total: Math.max(0, oldTotal + bonusDelta),
          ruahBonus: newBonus
        },
        ruah: normalize(state)
      };
    }

    const globalRuah = document.querySelector('[data-global-ruah] .cafasso-global-counter__value');
    if (globalRuah) globalRuah.innerHTML = `${state.streak}<span class="cafasso-global-counter__unit">día${state.streak === 1 ? '' : 's'}</span>`;

    const profileCard = document.querySelector('[data-profile-ruah-card]');
    if (profileCard) {
      const strong = profileCard.querySelector('strong');
      const subtitle = profileCard.querySelector('.cafasso-profile-metric-sub, span');
      const remainder = state.streak % REWARD_EVERY;
      const next = remainder === 0 ? REWARD_EVERY : REWARD_EVERY - remainder;
      if (strong) strong.textContent = `${state.streak} día${state.streak === 1 ? '' : 's'}`;
      if (subtitle) subtitle.textContent = `Próximo +${REWARD_ALMITAS}: ${next} día${next === 1 ? '' : 's'} · Récord: ${state.longest}.`;
    }

    if (bonusDelta && currentMetrics) {
      const profileAlmitas = document.querySelector('[data-profile-almitas-card] strong');
      const globalAlmitas = document.querySelector('[data-global-almitas] .cafasso-global-counter__value');
      const total = Number(window.CafassoProfileMetrics?.almitas?.total || 0);
      if (profileAlmitas) profileAlmitas.textContent = String(total);
      if (globalAlmitas) globalAlmitas.textContent = String(total);
    }

    updateLegacyCache(state, bonusDelta);
  }

  async function sync() {
    if (syncing) return syncing;
    syncing = (async () => {
      const candidates = localCandidates();
      const headers = authHeaders(false);
      const uid = userId();
      let remote = null;

      if (headers) {
        try {
          const response = await fetch(ME_API, { headers, cache: 'no-store' });
          const data = await response.json().catch(() => ({}));
          if (response.ok && data?.ok !== false) remote = findRemote(data, uid);
        } catch (error) {}
      }

      if (remote) candidates.push(normalize(remote));
      const today = todayKey();
      const base = continuityBase(candidates, today);
      const result = advance(base, today);
      const state = result.state;
      writeLocal(state);
      patchUi(state);

      if (headers && uid && (!remote || !sameState(remote, state))) await persist(state);

      return state;
    })().finally(() => { syncing = null; });
    return syncing;
  }

  function scheduleSync(delay = 0) {
    setTimeout(() => sync(), delay);
  }

  function boot() {
    scheduleSync(80);
    scheduleSync(900);
    scheduleSync(1800);

    window.addEventListener('cafasso:profile-metrics', () => scheduleSync(30));
    window.addEventListener('focus', () => scheduleSync(20));
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') scheduleSync(20);
    });
    setInterval(() => sync(), 60000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
