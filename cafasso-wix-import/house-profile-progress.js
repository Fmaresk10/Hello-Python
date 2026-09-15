(() => {
  const params = new URLSearchParams(location.search);
  if ((params.get('space') || 'house') !== 'house') return;
  if (window.__cafassoHouseProfileProgressInstalled) return;
  window.__cafassoHouseProfileProgressInstalled = true;

  const ME_API = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoMe';
  const PROGRESS_API = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoProgress';
  const RUAH_COURSE_ID = '__cafasso_ruah__';
  const RUAH_MODULE_ID = '__daily__';
  const RESERVED_PREFIX = '__cafasso_';
  const RUAH_REWARD_EVERY = 10;
  const RUAH_REWARD_ALMITAS = 50;
  const STYLE_ID = 'cafassoHouseProfileProgressStyles';
  let loadPromise = null;

  function json(storage, key) {
    try { return JSON.parse(storage.getItem(key) || 'null'); }
    catch (error) { return null; }
  }

  function sessionUser() {
    return json(localStorage, 'cafassoSession')?.user || {};
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

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-profile-path{grid-template-columns:repeat(3,minmax(0,1fr))!important}
      .cafasso-profile-path__item strong[data-profile-metric]{font:500 26px/1 Georgia,serif;color:#4b392b}
      .cafasso-profile-path__item[data-profile-progress-card] strong[data-profile-metric]{font-size:24px}
      .cafasso-profile-path__item.is-loading{opacity:.72}
      .cafasso-profile-path__item.is-error{border-style:solid;border-color:rgba(152,75,58,.24)}
      .cafasso-profile-path__item .cafasso-profile-metric-sub{min-height:28px}
      @media(max-width:680px){.cafasso-profile-path{grid-template-columns:1fr!important}}
    `;
    document.head.appendChild(style);
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

  function rewardSummary(data, userId) {
    const rows = (Array.isArray(data?.progress) ? data.progress : []).filter(row =>
      !userId || !row?.userId || String(row.userId) === String(userId)
    );
    const approved = rows.reduce((sum, row) => sum + Number(row?.almitasApproved || 0), 0);
    const pendingRows = (Array.isArray(data?.submissions) ? data.submissions : []).filter(row =>
      (!userId || !row?.userId || String(row.userId) === String(userId)) &&
      ['Pendiente', 'En revisión'].includes(String(row?.status || '')) &&
      Number(row?.rewardAlmitas || 0) > 0
    );
    return {
      approved,
      pending: pendingRows.reduce((sum, row) => sum + Number(row?.rewardAlmitas || 0), 0),
      pendingCount: pendingRows.length
    };
  }

  function courseSummary(data, userId) {
    const courses = (Array.isArray(data?.courses) ? data.courses : []).filter(course => {
      const id = String(course?._id || course?.id || '');
      return id && !id.startsWith(RESERVED_PREFIX);
    });
    const rows = (Array.isArray(data?.progress) ? data.progress : []).filter(row => {
      const id = String(row?.courseId || '');
      return id && !id.startsWith(RESERVED_PREFIX) && (!userId || !row?.userId || String(row.userId) === String(userId));
    });
    const byCourse = new Map(rows.map(row => [String(row.courseId), row]));

    if (!courses.length) {
      const usableRows = rows.filter(row => Number.isFinite(Number(row?.percent)));
      const completed = usableRows.filter(row => Number(row.percent || 0) >= 100).length;
      const percent = usableRows.length
        ? Math.round(usableRows.reduce((sum, row) => sum + Math.max(0, Math.min(100, Number(row.percent || 0))), 0) / usableRows.length)
        : 0;
      return { percent, completed, total: usableRows.length };
    }

    const percentages = courses.map(course => {
      const id = String(course?._id || course?.id || '');
      const row = byCourse.get(id);
      const direct = Number(course?.myProgress);
      const value = row ? Number(row.percent || 0) : (Number.isFinite(direct) ? direct : 0);
      return Math.max(0, Math.min(100, value));
    });
    const completed = percentages.filter(value => value >= 100).length;
    const percent = Math.round(percentages.reduce((sum, value) => sum + value, 0) / Math.max(1, percentages.length));
    return { percent, completed, total: courses.length };
  }

  function metricMarkup(label, value, subtitle, dataAttr) {
    return `<div class="cafasso-profile-path__item is-loading" ${dataAttr}><small>${label}</small><strong data-profile-metric>${value}</strong><span class="cafasso-profile-metric-sub">${subtitle}</span></div>`;
  }

  function mountMetrics() {
    const path = document.querySelector('.cafasso-profile-path');
    if (!path || path.dataset.profileMetricsMounted === '1') return path;
    ensureStyles();
    path.dataset.profileMetricsMounted = '1';
    path.innerHTML =
      metricMarkup('Almitas', '…', 'Sincronizando tu recorrido.', 'data-profile-almitas-card') +
      metricMarkup('RUAH', '…', 'Revisando tu constancia.', 'data-profile-ruah-card') +
      metricMarkup('Mi camino', '…', 'Calculando tu progreso.', 'data-profile-progress-card');
    return path;
  }

  function setCard(selector, value, subtitle, state = '') {
    const card = document.querySelector(selector);
    if (!card) return;
    card.classList.remove('is-loading', 'is-error');
    if (state) card.classList.add(state);
    const strong = card.querySelector('strong');
    const span = card.querySelector('span');
    if (strong) strong.textContent = String(value);
    if (span) span.textContent = String(subtitle);
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

  async function performLoad() {
    const path = mountMetrics();
    if (!path) return false;

    const headers = authHeaders(false);
    const user = sessionUser();
    const userId = String(user?._id || user?.id || '');
    if (!headers) {
      setCard('[data-profile-almitas-card]', '—', 'Volvé a ingresar para sincronizar.', 'is-error');
      setCard('[data-profile-ruah-card]', '—', 'No pudimos validar tu sesión.', 'is-error');
      setCard('[data-profile-progress-card]', '—', 'No pudimos cargar tu progreso.', 'is-error');
      return true;
    }

    try {
      const response = await fetch(ME_API, { headers, cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.ok === false) throw new Error(data?.error || 'No se pudo cargar tu recorrido.');

      const challengeRewards = rewardSummary(data, userId);
      const course = courseSummary(data, userId);
      const today = todayKey();
      const ruahRow = findRuahRow(data, userId);
      const rawRuah = ruahRow?.blockAnswers?.ruahState || null;
      const normalized = normalizeRuah(rawRuah, today);
      const ruah = normalized.state;
      const preview = Boolean(params.get('previewUser') || params.get('previewRole'));

      if (normalized.changed && !preview && userId) {
        await persistRuah(userId, ruah);
      }

      const totalAlmitas = challengeRewards.approved + ruah.bonusAlmitas;
      const almitasParts = [];
      if (challengeRewards.approved) almitasParts.push(`${challengeRewards.approved} por desafíos`);
      if (ruah.bonusAlmitas) almitasParts.push(`${ruah.bonusAlmitas} por RUAH`);
      if (challengeRewards.pendingCount) almitasParts.push(`${challengeRewards.pending} pendientes`);
      const almitasSubtitle = almitasParts.length ? almitasParts.join(' · ') : 'Tu camino recién empieza.';
      setCard('[data-profile-almitas-card]', totalAlmitas, almitasSubtitle);

      const remainder = ruah.streak % RUAH_REWARD_EVERY;
      const next = remainder === 0 ? RUAH_REWARD_EVERY : RUAH_REWARD_EVERY - remainder;
      setCard(
        '[data-profile-ruah-card]',
        `${ruah.streak} día${ruah.streak === 1 ? '' : 's'}`,
        `Próximo +${RUAH_REWARD_ALMITAS}: ${next} día${next === 1 ? '' : 's'} · Récord: ${ruah.longest}.`
      );

      const courseSubtitle = course.total
        ? `${course.completed} de ${course.total} curso${course.total === 1 ? '' : 's'} completado${course.completed === 1 ? '' : 's'}.`
        : 'Todavía no hay cursos con progreso registrado.';
      setCard('[data-profile-progress-card]', `${course.percent}%`, courseSubtitle);

      document.querySelectorAll('[data-almitas-total]').forEach(node => { node.textContent = String(totalAlmitas); });

      window.CafassoProfileMetrics = {
        almitas: { total: totalAlmitas, challenges: challengeRewards.approved, ruahBonus: ruah.bonusAlmitas, pending: challengeRewards.pending },
        ruah,
        progress: course
      };
      window.dispatchEvent(new CustomEvent('cafasso:profile-metrics', { detail: window.CafassoProfileMetrics }));
      return true;
    } catch (error) {
      setCard('[data-profile-almitas-card]', '—', 'No pudimos sincronizar las almitas.', 'is-error');
      setCard('[data-profile-ruah-card]', '—', 'No pudimos sincronizar RUAH.', 'is-error');
      setCard('[data-profile-progress-card]', '—', 'No pudimos sincronizar el progreso.', 'is-error');
      return true;
    }
  }

  function loadMetrics() {
    if (loadPromise) return loadPromise;
    loadPromise = performLoad().finally(() => { loadPromise = null; });
    return loadPromise;
  }

  let attempts = 0;
  const boot = () => {
    if (mountMetrics()) {
      loadMetrics();
      const sheet = document.querySelector('.cafasso-animator-sheet');
      sheet?.addEventListener('click', () => loadMetrics(), { passive: true });
      return;
    }
    if (attempts < 30) {
      attempts += 1;
      setTimeout(boot, 100);
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
