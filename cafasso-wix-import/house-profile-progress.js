(() => {
  const params = new URLSearchParams(location.search);
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
      .cafasso-profile-journey{position:relative;margin:0 7px 17px;padding:18px 18px 17px;border:1px solid rgba(114,77,42,.24);background:linear-gradient(145deg,rgba(255,250,237,.46),rgba(232,211,171,.30));color:#4c3a2b;font-family:Inter,system-ui,sans-serif;overflow:hidden}
      .cafasso-profile-journey:before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(#b7894e,#667c64)}
      .cafasso-profile-journey__head{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;align-items:start}
      .cafasso-profile-journey__eyebrow{color:#91704f;font:850 8px/1 Inter,system-ui;letter-spacing:.15em;text-transform:uppercase}
      .cafasso-profile-journey h3{margin:5px 0 5px;color:#493629;font:500 28px/1 Georgia,serif}
      .cafasso-profile-journey__copy{margin:0;max-width:520px;color:#78624e;font:11px/1.48 Inter,system-ui}
      .cafasso-profile-journey__almitas{text-align:right;white-space:nowrap}.cafasso-profile-journey__almitas strong{display:block;color:#6f4d2d;font:700 24px/1 Georgia,serif}.cafasso-profile-journey__almitas small{display:block;margin-top:3px;color:#91704f;font:800 7px/1 Inter,system-ui;letter-spacing:.11em;text-transform:uppercase}
      .cafasso-profile-journey__bar{height:7px;margin-top:14px;border-radius:999px;background:rgba(117,85,51,.12);overflow:hidden}.cafasso-profile-journey__bar i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#b7894e,#d5b56d);transition:width .35s ease}
      .cafasso-profile-journey__bar-note{display:flex;justify-content:space-between;gap:10px;margin-top:6px;color:#8a725b;font:750 8px/1.25 Inter,system-ui}.cafasso-profile-journey__bar-note b{color:#6e5036}
      .cafasso-profile-journey__stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:15px}.cafasso-profile-journey__stat{padding:10px 11px;border:1px solid rgba(114,77,42,.15);background:rgba(255,252,243,.36)}.cafasso-profile-journey__stat strong{display:block;color:#573f2d;font:600 19px/1 Georgia,serif}.cafasso-profile-journey__stat span{display:block;margin-top:4px;color:#8a725b;font:750 8px/1.25 Inter,system-ui}
      .cafasso-profile-next{display:grid;grid-template-columns:37px minmax(0,1fr) auto;gap:11px;align-items:center;margin-top:12px;padding:12px 13px;border:1px solid rgba(91,112,87,.24);background:rgba(220,228,207,.48)}
      .cafasso-profile-next__icon{display:grid;place-items:center;width:37px;height:37px;border:1px solid rgba(91,112,87,.32);border-radius:50%;background:rgba(91,112,87,.12);color:#52674e;font:700 15px/1 Georgia,serif}
      .cafasso-profile-next small{display:block;color:#6d8065;font:850 7px/1 Inter,system-ui;letter-spacing:.13em;text-transform:uppercase}.cafasso-profile-next strong{display:block;margin-top:3px;color:#40523e;font:700 12px/1.25 Inter,system-ui}.cafasso-profile-next span{display:block;margin-top:3px;color:#66705f;font:9px/1.35 Inter,system-ui}.cafasso-profile-next__course{align-self:start;max-width:145px;padding:5px 7px;border-radius:999px;background:rgba(255,255,255,.42);color:#6a5b48!important;font:800 7px/1.2 Inter,system-ui!important;text-align:center}
      .cafasso-profile-next.is-waiting{border-color:rgba(183,137,78,.27);background:rgba(245,225,181,.42)}.cafasso-profile-next.is-waiting .cafasso-profile-next__icon{border-color:rgba(183,137,78,.32);background:rgba(183,137,78,.12);color:#8b673d}.cafasso-profile-next.is-waiting small,.cafasso-profile-next.is-waiting strong{color:#745333}
      .cafasso-profile-journey.is-loading{opacity:.72}.cafasso-profile-journey.is-error{border-color:rgba(152,75,58,.24)}
      @media(max-width:680px){.cafasso-profile-path{grid-template-columns:1fr!important}.cafasso-profile-journey{margin-left:0;margin-right:0;padding:15px}.cafasso-profile-journey__head{grid-template-columns:1fr}.cafasso-profile-journey__almitas{text-align:left}.cafasso-profile-journey__stats{grid-template-columns:1fr 1fr 1fr}.cafasso-profile-next{grid-template-columns:34px minmax(0,1fr)}.cafasso-profile-next__course{grid-column:2;justify-self:start;max-width:none}.cafasso-profile-journey h3{font-size:25px}}
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

  function journeyStage(total) {
    const levels = [
      { min:0, title:'Soñador' },
      { min:100, title:'Caminante' },
      { min:300, title:'Presencia' },
      { min:600, title:'Acompañante' },
      { min:1000, title:'Servidor' },
      { min:1600, title:'Corazón salesiano' }
    ];
    const value = Math.max(0, Number(total || 0));
    let current = levels[0];
    levels.forEach(level => { if (value >= level.min) current = level; });
    const index = levels.indexOf(current);
    const next = levels[index + 1] || null;
    const progress = next ? Math.max(0, Math.min(100, ((value - current.min) / Math.max(1, next.min - current.min)) * 100)) : 100;
    return { current, next, progress, remaining:next ? Math.max(0, next.min - value) : 0, total:value };
  }

  function challengeJourney(data, userId) {
    const rows = (Array.isArray(data?.submissions) ? data.submissions : []).filter(row =>
      (!userId || !row?.userId || String(row.userId) === String(userId)) &&
      (String(row?.type || '').toLowerCase().includes('desaf') || Number(row?.rewardAlmitas || 0) > 0)
    );
    return {
      approved: rows.filter(row => /^aprobad/i.test(String(row?.status || '').trim())),
      pending: rows.filter(row => ['Pendiente', 'En revisión'].includes(String(row?.status || '').trim()))
    };
  }

  function journeyDetail(data, userId, courseSummaryValue, ruah, totalAlmitas) {
    const courses = (Array.isArray(data?.courses) ? data.courses : []).filter(course => {
      const id = String(course?._id || course?.id || '');
      return id && !id.startsWith(RESERVED_PREFIX);
    });
    const rows = (Array.isArray(data?.progress) ? data.progress : []).filter(row => {
      const id = String(row?.courseId || '');
      return id && !id.startsWith(RESERVED_PREFIX) && (!userId || !row?.userId || String(row.userId) === String(userId));
    });
    const byCourse = new Map(rows.map(row => [String(row.courseId), row]));
    let completedModules = 0;
    let totalModules = 0;

    const states = courses.map((course, order) => {
      const id = String(course?._id || course?.id || '');
      const row = byCourse.get(id) || null;
      const direct = Number(course?.myProgress);
      const percent = Math.max(0, Math.min(100, row ? Number(row.percent || 0) : (Number.isFinite(direct) ? direct : 0)));
      const modules = Array.isArray(course?.modules) ? course.modules : [];
      const done = new Set(Array.isArray(row?.completedModules) ? row.completedModules.map(String) : []);
      totalModules += modules.length;
      completedModules += modules.length
        ? modules.filter(module => done.has(String(module?._id || module?.id || ''))).length
        : done.size;
      const nextModule = modules.find(module => !done.has(String(module?._id || module?.id || ''))) || null;
      return { course, id, row, order, percent, modules, done, nextModule };
    });

    if (!courses.length) {
      rows.forEach(row => { completedModules += Array.isArray(row?.completedModules) ? row.completedModules.length : 0; });
    }

    const challenges = challengeJourney(data, userId);
    const started = states.filter(item => item.percent > 0 && item.percent < 100).sort((a,b) => b.percent - a.percent || a.order - b.order);
    const incomplete = states.filter(item => item.percent < 100);
    const active = started[0] || incomplete[0] || null;
    const activeCourseId = active?.id || '';
    const nextModuleId = String(active?.nextModule?._id || active?.nextModule?.id || '');
    const waiting = challenges.pending.find(item =>
      (!activeCourseId || String(item?.courseId || '') === activeCourseId) &&
      (!nextModuleId || !item?.moduleId || String(item.moduleId) === nextModuleId)
    ) || null;

    let nextStep;
    if (waiting) {
      nextStep = {
        mode:'waiting',
        eyebrow:'En espera de revisión',
        title:'Tu desafío ya está entregado',
        copy:'Cuando el formador lo revise, CAFASSO actualizará tu avance y tus Almitas automáticamente.',
        course:String(waiting?.courseTitle || active?.course?.title || 'Escuela')
      };
    } else if (active?.nextModule) {
      nextStep = {
        mode:'continue',
        eyebrow:active.percent > 0 ? 'Retomá tu camino' : 'Próximo paso',
        title:String(active.nextModule.title || 'Siguiente módulo'),
        copy:active.percent > 0 ? 'Ya recorriste ' + Math.round(active.percent) + '% de este curso.' : 'Esta es la primera etapa disponible de este recorrido.',
        course:String(active.course?.title || 'Curso')
      };
    } else if (active) {
      nextStep = {
        mode:'continue',
        eyebrow:active.percent > 0 ? 'Seguí avanzando' : 'Empezá por acá',
        title:String(active.course?.title || 'Curso disponible'),
        copy:active.percent > 0 ? 'Tu progreso actual es ' + Math.round(active.percent) + '%.' : 'Tenés un recorrido listo para comenzar.',
        course:'Escuela'
      };
    } else {
      nextStep = {
        mode:'complete',
        eyebrow:'Camino al día',
        title:courseSummaryValue.total ? 'Completaste tus recorridos actuales' : 'Tu camino está listo para empezar',
        copy:courseSummaryValue.total ? 'Podés seguir creciendo con RUAH, nuevos desafíos y próximos recorridos.' : 'Cuando tengas cursos asignados, tu próximo paso va a aparecer acá.',
        course:'CAFASSO'
      };
    }

    return {
      stage:journeyStage(totalAlmitas),
      course:courseSummaryValue,
      modules:{ completed:completedModules, total:totalModules },
      challenges:{ approved:challenges.approved.length, pending:challenges.pending.length },
      ruahLongest:Math.max(0, Number(ruah?.longest || 0)),
      nextStep
    };
  }

  function ensureJourneyPanel() {
    let panel = document.querySelector('[data-profile-journey]');
    if (!panel) {
      panel = document.createElement('section');
      panel.className = 'cafasso-profile-journey is-loading';
      panel.dataset.profileJourney = '1';
    }
    const path = document.querySelector('.cafasso-profile-path');
    const level = document.querySelector('[data-cafasso-level-panel]');
    const anchor = level || path;
    if (anchor && panel.previousElementSibling !== anchor) anchor.insertAdjacentElement('afterend', panel);
    return panel;
  }

  function renderJourney(detail) {
    const panel = ensureJourneyPanel();
    if (!panel || !detail) return;
    panel.classList.remove('is-loading', 'is-error');
    const stage = detail.stage;
    const next = detail.nextStep;
    const moduleText = detail.modules.total ? (detail.modules.completed + '/' + detail.modules.total) : String(detail.modules.completed);
    const stageCopy = stage.next
      ? 'Cada paso suma. Estás construyendo tu camino hacia ' + stage.next.title + '.'
      : 'Llegaste a la etapa más alta del camino CAFASSO. El desafío ahora es seguir haciéndola vida.';
    const stageFoot = stage.next
      ? 'Faltan <b>' + stage.remaining + '</b> para ' + stage.next.title
      : '<b>Etapa más alta alcanzada</b>';
    const pendingText = detail.challenges.pending ? ' · ' + detail.challenges.pending + ' en revisión' : '';

    panel.innerHTML =
      '<div class="cafasso-profile-journey__head">' +
        '<div><div class="cafasso-profile-journey__eyebrow">Mi camino · etapa actual</div><h3>' + stage.current.title + '</h3><p class="cafasso-profile-journey__copy">' + stageCopy + '</p></div>' +
        '<div class="cafasso-profile-journey__almitas"><strong>' + stage.total + '</strong><small>Almitas actuales</small></div>' +
      '</div>' +
      '<div class="cafasso-profile-journey__bar"><i style="width:' + stage.progress.toFixed(1) + '%"></i></div>' +
      '<div class="cafasso-profile-journey__bar-note"><span>' + stage.current.title + '</span><span>' + stageFoot + '</span></div>' +
      '<div class="cafasso-profile-journey__stats">' +
        '<div class="cafasso-profile-journey__stat"><strong>' + moduleText + '</strong><span>Módulos completados</span></div>' +
        '<div class="cafasso-profile-journey__stat"><strong>' + detail.challenges.approved + '</strong><span>Desafíos aprobados' + pendingText + '</span></div>' +
        '<div class="cafasso-profile-journey__stat"><strong>' + detail.ruahLongest + '</strong><span>Mejor racha RUAH</span></div>' +
      '</div>' +
      '<div class="cafasso-profile-next ' + (next.mode === 'waiting' ? 'is-waiting' : '') + '">' +
        '<span class="cafasso-profile-next__icon">' + (next.mode === 'waiting' ? '…' : next.mode === 'complete' ? '✓' : '›') + '</span>' +
        '<div><small>' + next.eyebrow + '</small><strong>' + next.title + '</strong><span>' + next.copy + '</span></div>' +
        '<span class="cafasso-profile-next__course">' + next.course + '</span>' +
      '</div>';
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
      const noAuthJourney = ensureJourneyPanel();
      if (noAuthJourney) {
        noAuthJourney.classList.remove('is-loading');
        noAuthJourney.classList.add('is-error');
        noAuthJourney.innerHTML = '<div class="cafasso-profile-journey__eyebrow">Mi camino</div><h3>Sin conexión con tu recorrido</h3><p class="cafasso-profile-journey__copy">Volvé a ingresar para sincronizar tu etapa, logros y próximo paso.</p>';
      }
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

      const canonicalAlmitas = Number(window.CafassoAlmitasMetrics?.total);
      const totalAlmitas = Number.isFinite(canonicalAlmitas) ? canonicalAlmitas : challengeRewards.approved + ruah.bonusAlmitas;
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

      const journey = journeyDetail(data, userId, course, ruah, totalAlmitas);
      renderJourney(journey);

      document.querySelectorAll('[data-almitas-total]').forEach(node => { node.textContent = String(totalAlmitas); });

      window.CafassoProfileMetrics = {
        almitas: { total: totalAlmitas, challenges: challengeRewards.approved, ruahBonus: ruah.bonusAlmitas, pending: challengeRewards.pending },
        ruah,
        progress: course,
        journey
      };
      window.dispatchEvent(new CustomEvent('cafasso:profile-metrics', { detail: window.CafassoProfileMetrics }));
      return true;
    } catch (error) {
      setCard('[data-profile-almitas-card]', '—', 'No pudimos sincronizar las almitas.', 'is-error');
      setCard('[data-profile-ruah-card]', '—', 'No pudimos sincronizar RUAH.', 'is-error');
      setCard('[data-profile-progress-card]', '—', 'No pudimos sincronizar el progreso.', 'is-error');
      const errorJourney = ensureJourneyPanel();
      if (errorJourney) {
        errorJourney.classList.remove('is-loading');
        errorJourney.classList.add('is-error');
        errorJourney.innerHTML = '<div class="cafasso-profile-journey__eyebrow">Mi camino</div><h3>No pudimos actualizar tu recorrido</h3><p class="cafasso-profile-journey__copy">Tus datos guardados siguen intactos. Probá de nuevo cuando recuperes conexión.</p>';
      }
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

  window.addEventListener('cafasso:level-update', () => {
    const panel = document.querySelector('[data-profile-journey]');
    const level = document.querySelector('[data-cafasso-level-panel]');
    if (panel && level && panel.previousElementSibling !== level) level.insertAdjacentElement('afterend', panel);
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
