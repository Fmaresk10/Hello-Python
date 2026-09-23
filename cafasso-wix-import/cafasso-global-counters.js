(() => {
  if (window.__cafassoGlobalCountersInstalled) return;
  window.__cafassoGlobalCountersInstalled = true;

  const ME_API = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoMe';
  const PROGRESS_API = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoProgress';
  const RUAH_COURSE_ID = '__cafasso_ruah__';
  const RUAH_MODULE_ID = '__daily__';
  const RUAH_REWARD_EVERY = 10;
  const RUAH_REWARD_ALMITAS = 50;
  const STYLE_ID = 'cafassoGlobalCountersStyles';
  const HUD_ID = 'cafassoGlobalCounters';
  let loading = null;
  let lastLoadAt = 0;

  function json(storage, key) {
    try { return JSON.parse(storage.getItem(key) || 'null'); }
    catch (error) { return null; }
  }

  function sessionUser() {
    return json(localStorage, 'cafassoSession')?.user || {};
  }

  function userKey() {
    const user = sessionUser();
    return String(user?._id || user?.id || user?.email || user?.name || 'local');
  }

  function cacheKey() {
    return `cafasso-global-counters-v1:${userKey()}`;
  }

  function auth() {
    const value = json(localStorage, 'cafassoAuth');
    if (!value?.sessionToken || Number(value.expiresAt || 0) <= Date.now()) return null;
    return value;
  }

  function authHeaders(withJson = false) {
    const current = auth();
    if (!current) return null;
    const headers = { Authorization: `Bearer ${current.sessionToken}` };
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

  function normalizeRuah(raw, today) {
    const old = raw && typeof raw === 'object' ? raw : {};
    const previousDay = String(old.lastDay || '');
    const previousStreak = Math.max(0, Number(old.streak || 0));
    const todayNumber = dayNumber(today);
    const previousNumber = dayNumber(previousDay);
    let streak = previousStreak;
    let currentStreakRewards = Math.max(0, Number(old.currentStreakRewards || 0));
    let bonusAlmitas = Math.max(0, Number(old.bonusAlmitas || 0));
    let changed = false;

    if (!Number.isFinite(previousNumber) || previousStreak < 1) {
      streak = 1;
      currentStreakRewards = 0;
      changed = true;
    } else if (previousDay === today) {
      streak = Math.max(1, previousStreak);
    } else if (todayNumber - previousNumber === 1) {
      streak = previousStreak + 1;
      changed = true;
    } else {
      streak = 1;
      currentStreakRewards = 0;
      changed = true;
    }

    const earnedMilestones = Math.floor(streak / RUAH_REWARD_EVERY);
    if (earnedMilestones > currentStreakRewards) {
      bonusAlmitas += (earnedMilestones - currentStreakRewards) * RUAH_REWARD_ALMITAS;
      currentStreakRewards = earnedMilestones;
      changed = true;
    }

    const longest = Math.max(Number(old.longest || 0), streak);
    if (longest !== Number(old.longest || 0)) changed = true;

    return {
      state: {
        streak,
        lastDay: today,
        longest,
        currentStreakRewards,
        bonusAlmitas,
        updatedAt: changed ? new Date().toISOString() : String(old.updatedAt || new Date().toISOString())
      },
      changed: changed || previousDay !== today
    };
  }

  function findRuahRow(data, userId) {
    return (Array.isArray(data?.progress) ? data.progress : []).find(row =>
      String(row?.courseId || '') === RUAH_COURSE_ID && (!userId || String(row?.userId || '') === String(userId))
    ) || null;
  }

  function approvedAlmitas(data, userId) {
    return (Array.isArray(data?.progress) ? data.progress : [])
      .filter(row => !userId || !row?.userId || String(row.userId) === String(userId))
      .reduce((sum, row) => sum + Number(row?.almitasApproved || 0), 0);
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-global-counters{position:fixed;z-index:2147483000;left:18px;top:16px;display:flex;align-items:stretch;overflow:hidden;border:1px solid rgba(242,201,90,.48);border-radius:15px;background:linear-gradient(135deg,rgba(8,37,40,.91),rgba(18,55,52,.86));box-shadow:0 9px 24px rgba(0,0,0,.27),inset 0 1px rgba(255,255,255,.08);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);color:#fff8e9;pointer-events:none;font-family:Inter,system-ui,sans-serif;transform:translateZ(0)}
      .cafasso-global-counter{display:grid;grid-template-columns:24px auto;grid-template-rows:auto auto;column-gap:7px;align-items:center;min-width:104px;padding:8px 11px 8px 9px}
      .cafasso-global-counter+.cafasso-global-counter{border-left:1px solid rgba(242,201,90,.25)}
      .cafasso-global-counter__icon{grid-row:1/3;display:grid;place-items:center;width:24px;height:24px;border-radius:50%;background:rgba(242,201,90,.14);border:1px solid rgba(242,201,90,.3);color:#f4d889;font:800 13px/1 Georgia,serif;box-shadow:inset 0 0 10px rgba(242,201,90,.06)}
      .cafasso-global-counter__label{align-self:end;color:#d7c99c;font-size:7.5px;font-weight:900;line-height:1;letter-spacing:.13em;text-transform:uppercase}
      .cafasso-global-counter__value{align-self:start;margin-top:3px;color:#fff9e8;font-size:15px;font-weight:850;line-height:1;letter-spacing:-.01em;white-space:nowrap;text-shadow:0 1px 4px rgba(0,0,0,.3)}
      .cafasso-global-counter__unit{margin-left:3px;color:#d7c99c;font-size:8px;font-weight:750;letter-spacing:0}
      .cafasso-global-counters.is-loading .cafasso-global-counter__value{opacity:.68}
      .cafasso-global-counters.is-error{border-color:rgba(218,153,119,.42)}
      body.cafasso-journey-mode .cafasso-global-counters,body.cafasso-mission-mode .cafasso-global-counters{display:none!important}
      body.cafasso-journey-mode .side .brand,body.cafasso-mission-mode .side .brand{margin-top:46px!important}
      @media(max-width:680px){.cafasso-global-counters{left:max(10px,calc(env(safe-area-inset-left) + 8px));top:max(9px,calc(env(safe-area-inset-top) + 7px));border-radius:12px}.cafasso-global-counter{grid-template-columns:20px auto;column-gap:5px;min-width:84px;padding:7px 8px 7px 7px}.cafasso-global-counter__icon{width:20px;height:20px;font-size:11px}.cafasso-global-counter__label{font-size:6.5px}.cafasso-global-counter__value{font-size:12px}.cafasso-global-counter__unit{font-size:7px}body.cafasso-journey-mode .side .brand,body.cafasso-mission-mode .side .brand{margin-top:40px!important}}
      @media(prefers-reduced-motion:reduce){.cafasso-global-counters{transition:none!important}}
    `;
    document.head.appendChild(style);
  }

  function mount() {
    ensureStyles();
    let hud = document.getElementById(HUD_ID);
    if (hud) return hud;
    hud = document.createElement('div');
    hud.id = HUD_ID;
    hud.className = 'cafasso-global-counters is-loading';
    hud.setAttribute('role', 'status');
    hud.setAttribute('aria-live', 'polite');
    hud.setAttribute('aria-label', 'Almitas y racha RUAH');
    hud.innerHTML = `
      <div class="cafasso-global-counter" data-global-almitas>
        <span class="cafasso-global-counter__icon" aria-hidden="true">✦</span>
        <span class="cafasso-global-counter__label">Almitas</span>
        <strong class="cafasso-global-counter__value">…</strong>
      </div>
      <div class="cafasso-global-counter" data-global-ruah>
        <span class="cafasso-global-counter__icon" aria-hidden="true">R</span>
        <span class="cafasso-global-counter__label">RUAH</span>
        <strong class="cafasso-global-counter__value">…</strong>
      </div>`;
    document.body.appendChild(hud);
    return hud;
  }

  function render(metrics, error = false) {
    const hud = mount();
    const almitas = hud.querySelector('[data-global-almitas] .cafasso-global-counter__value');
    const ruah = hud.querySelector('[data-global-ruah] .cafasso-global-counter__value');
    hud.classList.remove('is-loading', 'is-error');
    if (error) hud.classList.add('is-error');

    if (!metrics) {
      if (almitas) almitas.textContent = '—';
      if (ruah) ruah.textContent = '—';
      return;
    }

    const total = Number(metrics?.almitas?.total ?? metrics?.almitas ?? 0);
    const streak = Math.max(0, Number(metrics?.ruah?.streak || 0));
    if (almitas) almitas.textContent = String(Number.isFinite(total) ? total : 0);
    if (ruah) ruah.innerHTML = `${streak}<span class="cafasso-global-counter__unit">día${streak === 1 ? '' : 's'}</span>`;
    hud.setAttribute('aria-label', `${total} Almitas. RUAH: ${streak} día${streak === 1 ? '' : 's'} de racha.`);
  }

  function readCache() {
    return json(localStorage, cacheKey());
  }

  function writeCache(metrics) {
    try { localStorage.setItem(cacheKey(), JSON.stringify(metrics)); }
    catch (error) {}
  }

  async function persistRuah(userId, ruah) {
    const headers = authHeaders(true);
    if (!headers || !userId) return false;
    const cycle = ((Math.max(1, ruah.streak) - 1) % RUAH_REWARD_EVERY) + 1;
    const response = await fetch(PROGRESS_API, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userId,
        courseId: RUAH_COURSE_ID,
        moduleId: RUAH_MODULE_ID,
        completed: true,
        percent: cycle * (100 / RUAH_REWARD_EVERY),
        completedBlocks: [`day:${ruah.lastDay}`],
        blockAnswers: { ruahState: ruah }
      })
    });
    const result = await response.json().catch(() => ({}));
    return Boolean(response.ok && result?.ok !== false);
  }

  async function fetchMetrics() {
    const headers = authHeaders(false);
    const user = sessionUser();
    const userId = String(user?._id || user?.id || '');
    if (!headers) throw new Error('auth');

    const response = await fetch(ME_API, { headers, cache:'no-store' });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data?.ok === false) throw new Error(data?.error || 'metrics');

    const rawRuah = findRuahRow(data, userId)?.blockAnswers?.ruahState || null;
    const normalized = normalizeRuah(rawRuah, todayKey());
    const ruah = normalized.state;
    const params = new URLSearchParams(location.search);
    const preview = Boolean(params.get('previewUser') || params.get('previewRole'));

    if (normalized.changed && !preview && userId) {
      await persistRuah(userId, ruah);
    }

    const metrics = {
      almitas: { total: approvedAlmitas(data, userId) + Number(ruah.bonusAlmitas || 0) },
      ruah
    };
    return metrics;
  }

  function isHouse() {
    const params = new URLSearchParams(location.search);
    return (params.get('space') || 'house') === 'house';
  }

  async function refresh(force = false) {
    if (loading) return loading;
    if (!force && Date.now() - lastLoadAt < 25000) return null;
    lastLoadAt = Date.now();
    loading = (async () => {
      try {
        if (isHouse() && window.CafassoProfileMetrics) {
          const metrics = window.CafassoProfileMetrics;
          writeCache(metrics);
          render(metrics);
          return metrics;
        }
        const metrics = await fetchMetrics();
        writeCache(metrics);
        render(metrics);
        return metrics;
      } catch (error) {
        const cached = readCache();
        render(cached || null, !cached);
        return cached || null;
      } finally {
        loading = null;
      }
    })();
    return loading;
  }

  function boot() {
    mount();
    const cached = readCache();
    if (cached) render(cached);

    window.addEventListener('cafasso:profile-metrics', event => {
      if (!event?.detail) return;
      writeCache(event.detail);
      render(event.detail);
      lastLoadAt = Date.now();
    });

    window.addEventListener('focus', () => refresh());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') refresh();
    });

    if (isHouse()) {
      setTimeout(() => {
        if (window.CafassoProfileMetrics) {
          writeCache(window.CafassoProfileMetrics);
          render(window.CafassoProfileMetrics);
        } else {
          refresh(true);
        }
      }, 900);
    } else {
      refresh(true);
    }

    setInterval(() => refresh(), 60000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();
