(() => {
  if (window.__cafassoHuellasV2Installed) return;
  window.__cafassoHuellasV2Installed = true;

  const ME_API = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoMe';
  const PROGRESS_API = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoProgress';
  const COURSE_ID = '__cafasso_huellas__';
  const MODULE_ID = '__achievements__';
  const RESERVED_PREFIX = '__cafasso_';
  const STYLE_ID = 'cafassoHuellasV2Styles';
  const WORLD_SPACES = ['house', 'patio', 'escuela', 'parroquia'];

  const DEFINITIONS = [
    {
      id:'primer-paso', icon:'›', title:'Primer paso',
      clue:'Todo camino empieza con una primera parada.',
      description:'Completaste tu primera misión dentro de la Escuela CAFASSO.',
      test:ctx => ctx.hasCompletedMission
    },
    {
      id:'en-camino', icon:'◇', title:'En camino',
      clue:'Una etapa completa empieza a dibujar un recorrido.',
      description:'Completaste tu primer módulo de formación.',
      test:ctx => ctx.hasCompletedModule
    },
    {
      id:'ruah-encendido', icon:'R', title:'Constancia',
      clue:'Volver también es una forma de crecer.',
      description:'Sostuviste una racha RUAH de 7 días.',
      test:ctx => ctx.ruahStreak >= 7
    },
    {
      id:'me-anime', icon:'✎', title:'Me animé',
      clue:'Aprender también implica ponerse en juego.',
      description:'Enviaste tu primer desafío para ser acompañado por un formador.',
      test:ctx => ctx.hasSubmittedChallenge
    },
    {
      id:'no-alcanza-con-saber', icon:'✓', title:'Misión cumplida',
      clue:'Lo aprendido se vuelve camino cuando se hace vida.',
      description:'Tu primer desafío fue aprobado por un formador.',
      test:ctx => ctx.hasApprovedSubmission
    },
    {
      id:'caminante', icon:'✧', title:'Caminante',
      clue:'Las primeras Almitas ya empiezan a cambiar tu etapa.',
      description:'Alcanzaste la etapa Caminante del recorrido CAFASSO.',
      test:ctx => ctx.totalAlmitas >= 100
    },
    {
      id:'camino-recorrido', icon:'▣', title:'Recorrido completo',
      clue:'Un recorrido espera ser llevado hasta el final.',
      description:'Completaste un curso entero dentro de la Escuela CAFASSO.',
      test:ctx => ctx.hasCompletedCourse
    },
    {
      id:'corazon-salesiano', icon:'♡', title:'Corazón salesiano',
      clue:'Casa, patio, escuela y parroquia pueden volverse una forma de estar.',
      description:'Alcanzaste la etapa Corazón salesiano del camino CAFASSO.',
      test:ctx => ctx.totalAlmitas >= 1600
    }
  ];

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

  function storageKey() { return `cafasso-huellas-v1:${userKey()}`; }
  function explorationKey() { return `cafasso-exploration-v1:${userKey()}`; }

  function currentSpace() {
    return new URLSearchParams(location.search).get('space') || 'house';
  }

  function authHeaders(withJson = false) {
    const auth = json(localStorage, 'cafassoAuth');
    if (!auth?.sessionToken || Number(auth.expiresAt || 0) <= Date.now()) return null;
    const headers = { Authorization: `Bearer ${auth.sessionToken}` };
    if (withJson) headers['Content-Type'] = 'application/json';
    return headers;
  }

  function normalizeState(raw) {
    const source = raw && typeof raw === 'object' ? raw : {};
    return {
      version: 2,
      unlocked: [...new Set((Array.isArray(source.unlocked) ? source.unlocked : []).map(String))],
      seen: [...new Set((Array.isArray(source.seen) ? source.seen : []).map(String))],
      visitedSpaces: [...new Set((Array.isArray(source.visitedSpaces) ? source.visitedSpaces : []).map(String).filter(space => WORLD_SPACES.includes(space)))],
      updatedAt: String(source.updatedAt || '')
    };
  }

  function readLocal() { return normalizeState(json(localStorage, storageKey())); }
  function writeLocal(state) {
    try { localStorage.setItem(storageKey(), JSON.stringify(normalizeState(state))); }
    catch (error) {}
  }

  function mergeStates(a, b) {
    return normalizeState({
      unlocked: [...(a?.unlocked || []), ...(b?.unlocked || [])],
      seen: [...(a?.seen || []), ...(b?.seen || [])],
      visitedSpaces: [...(a?.visitedSpaces || []), ...(b?.visitedSpaces || [])],
      updatedAt: String(b?.updatedAt || a?.updatedAt || '')
    });
  }

  function markCurrentSpace(state) {
    const next = normalizeState(state);
    const space = currentSpace();
    if (!WORLD_SPACES.includes(space) || next.visitedSpaces.includes(space)) return { state: next, changed: false };
    next.visitedSpaces.push(space);
    next.updatedAt = new Date().toISOString();
    return { state: next, changed: true };
  }

  function localExplorationCount() {
    const state = json(localStorage, explorationKey());
    return Array.isArray(state?.discoveries) ? state.discoveries.length : 0;
  }

  function remoteExplorationCount(data, userId) {
    const row = (Array.isArray(data?.progress) ? data.progress : []).find(item =>
      String(item?.courseId || '') === '__cafasso_exploration__' && (!userId || !item?.userId || String(item.userId) === userId)
    );
    return Array.isArray(row?.blockAnswers?.explorationState?.discoveries)
      ? row.blockAnswers.explorationState.discoveries.length
      : 0;
  }

  function remoteHuellasState(data, userId) {
    const row = (Array.isArray(data?.progress) ? data.progress : []).find(item =>
      String(item?.courseId || '') === COURSE_ID && (!userId || !item?.userId || String(item.userId) === userId)
    );
    return normalizeState(row?.blockAnswers?.huellasState || null);
  }

  function usableProgressRows(data, userId) {
    return (Array.isArray(data?.progress) ? data.progress : []).filter(row => {
      const courseId = String(row?.courseId || '');
      if (!courseId || courseId.startsWith(RESERVED_PREFIX)) return false;
      if (userId && row?.userId && String(row.userId) !== userId) return false;
      return true;
    });
  }

  function hasCourseProgress(data, userId) {
    return usableProgressRows(data, userId).some(row =>
      Number(row?.percent || 0) > 0 || row?.completed === true || (Array.isArray(row?.completedBlocks) && row.completedBlocks.length > 0)
    );
  }

  function hasCompletedModule(data, userId) {
    return usableProgressRows(data, userId).some(row =>
      row?.completed === true ||
      (Array.isArray(row?.completedModules) && row.completedModules.length > 0)
    );
  }

  function hasSubmittedChallenge(data, userId) {
    return (Array.isArray(data?.submissions) ? data.submissions : []).some(row => {
      if (userId && row?.userId && String(row.userId) !== userId) return false;
      const courseId = String(row?.courseId || '');
      if (courseId.startsWith(RESERVED_PREFIX)) return false;
      const type = String(row?.type || '').toLowerCase();
      return type.includes('desaf') || row?.requiresReview === true || Number(row?.rewardAlmitas || 0) > 0;
    });
  }

  function canonicalAlmitas() {
    const values = [
      Number(window.CafassoAlmitasMetrics?.total),
      Number(window.CafassoLevel?.totalAlmitas),
      Number(window.CafassoProfileMetrics?.almitas?.total)
    ].filter(Number.isFinite);
    return values.length ? Math.max(0, ...values) : 0;
  }

  function hasCompletedCourse(data, userId) {
    return usableProgressRows(data, userId).some(row => row?.completed === true || Number(row?.percent || 0) >= 100);
  }

  function hasApprovedSubmission(data, userId) {
    return (Array.isArray(data?.submissions) ? data.submissions : []).some(row => {
      if (userId && row?.userId && String(row.userId) !== userId) return false;
      const status = String(row?.status || '').trim().toLowerCase();
      return status.includes('aprob');
    });
  }

  function ruahStreak(data, userId) {
    const row = (Array.isArray(data?.progress) ? data.progress : []).find(item =>
      String(item?.courseId || '') === '__cafasso_ruah__' && (!userId || !item?.userId || String(item.userId) === userId)
    );
    return Math.max(
      0,
      Number(row?.blockAnswers?.ruahState?.streak || 0),
      Number(window.CafassoProfileMetrics?.ruah?.streak || 0)
    );
  }

  function hasBitacora() {
    const saved = json(localStorage, 'cafasso-bitacora-v1');
    return Boolean(String(saved?.text || '').trim());
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-huellas-summary{position:relative;margin:0 7px 20px;padding:14px 15px 13px;border:1px solid rgba(114,77,42,.22);background:rgba(255,250,237,.23);font-family:Georgia,serif}
      .cafasso-huellas-summary__head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:11px}
      .cafasso-huellas-summary__title{color:#7d5e40;font:850 9px/1 Inter,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase}
      .cafasso-huellas-summary__count{color:#806447;font:700 11px/1 Inter,system-ui,sans-serif}
      .cafasso-huellas-summary__row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
      .cafasso-huella-mini{display:grid;place-items:center;width:31px;height:31px;border:1px dashed rgba(100,74,48,.3);border-radius:50%;background:rgba(117,82,47,.035);color:rgba(97,72,48,.27);font:700 14px/1 Georgia,serif;box-shadow:inset 0 0 0 3px rgba(255,255,255,.15)}
      .cafasso-huella-mini.is-unlocked{border-style:solid;border-color:rgba(126,80,38,.52);background:radial-gradient(circle at 37% 31%,#e7c78f,#aa7740 72%);color:#5b3a1d;text-shadow:0 1px rgba(255,238,198,.35);box-shadow:inset 0 0 0 2px rgba(255,236,193,.18),0 2px 5px rgba(79,48,23,.16)}
      .cafasso-huellas-open{margin-left:auto;border:0;border-bottom:1px solid rgba(105,73,40,.37);padding:3px 1px;background:transparent;color:#72563d;font:700 11px/1.2 Georgia,serif;cursor:pointer}
      .cafasso-huellas-open:hover{color:#4d3827;border-color:#4d3827}

      .cafasso-huellas-layer{position:fixed;inset:0;z-index:2147483250;display:grid;place-items:center;padding:24px;background:rgba(6,20,20,.7);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:0;transition:opacity .22s ease}
      .cafasso-huellas-layer.is-visible{opacity:1}
      .cafasso-huellas-album{position:relative;width:min(800px,94vw);max-height:88vh;overflow:auto;padding:39px 42px 36px;border:1px solid rgba(89,58,30,.48);border-radius:7px 17px 17px 7px;background:repeating-linear-gradient(0deg,rgba(108,74,39,.025) 0 1px,transparent 1px 10px),linear-gradient(90deg,#d9bd8e 0 2.5%,#f5e8cb 2.5% 51%,#eddbb8 51% 100%);box-shadow:0 32px 84px rgba(0,0,0,.55),inset 18px 0 24px rgba(92,58,27,.08);color:#463529;font-family:Georgia,serif;transform:translateY(8px) scale(.987);transition:transform .24s ease}
      .cafasso-huellas-layer.is-visible .cafasso-huellas-album{transform:translateY(0) scale(1)}
      .cafasso-huellas-album:after{content:"";position:absolute;left:50%;top:4%;bottom:4%;width:1px;background:rgba(104,75,43,.16);box-shadow:1px 0 rgba(255,255,255,.38);pointer-events:none}
      .cafasso-huellas-close{position:absolute;right:15px;top:13px;z-index:3;width:36px;height:36px;border:0;border-radius:50%;background:rgba(89,63,38,.08);color:#55412f;font:27px/1 Georgia,serif;cursor:pointer}
      .cafasso-huellas-kicker{color:#916f4d;font:850 9px/1.2 Inter,system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase}
      .cafasso-huellas-album h2{margin:7px 0 8px;color:#443326;font:500 clamp(34px,5vw,46px)/1 Georgia,serif}
      .cafasso-huellas-intro{max-width:650px;margin:0 0 25px;color:#725e49;font:15px/1.52 Georgia,serif}
      .cafasso-huellas-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px 18px}
      .cafasso-huella-card{position:relative;min-height:145px;padding:18px 17px 16px 77px;border:1px dashed rgba(104,74,43,.25);background:rgba(255,250,238,.26)}
      .cafasso-huella-card__seal{position:absolute;left:16px;top:20px;display:grid;place-items:center;width:48px;height:48px;border:1px dashed rgba(96,72,48,.25);border-radius:50%;color:rgba(80,60,42,.24);font:700 21px/1 Georgia,serif;transform:rotate(-6deg)}
      .cafasso-huella-card h3{margin:1px 0 7px;color:#4a392d;font:600 18px/1.1 Georgia,serif}
      .cafasso-huella-card p{margin:0;color:#806d59;font:12px/1.45 Inter,system-ui,sans-serif}
      .cafasso-huella-card__state{display:inline-block;margin-top:11px;color:#9a8268;font:850 8px/1 Inter,system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase}
      .cafasso-huella-card.is-unlocked{border-style:solid;border-color:rgba(112,72,35,.3);background:rgba(255,246,224,.48)}
      .cafasso-huella-card.is-unlocked .cafasso-huella-card__seal{border-style:solid;border-color:rgba(125,77,33,.58);background:radial-gradient(circle at 35% 30%,#e7c98f,#ad793f 72%);color:#5a371b;box-shadow:inset 0 0 0 3px rgba(255,239,199,.16),0 4px 9px rgba(78,45,21,.13)}
      .cafasso-huella-card.is-unlocked .cafasso-huella-card__state{color:#8a5c30}
      .cafasso-huella-card.is-locked h3{color:#81715f}.cafasso-huella-card.is-locked p{font-style:italic;color:#998875}
      .cafasso-huellas-footer{margin-top:21px;padding-top:13px;border-top:1px solid rgba(104,75,43,.14);color:#846f59;font:11px/1.45 Inter,system-ui,sans-serif}

      .cafasso-huella-unlock{position:fixed;z-index:2147483260;left:50%;top:50%;pointer-events:none;width:min(430px,86vw);padding:27px 27px 25px;border:1px solid rgba(226,188,104,.58);border-radius:7px;background:linear-gradient(145deg,rgba(53,44,31,.98),rgba(19,43,40,.98));box-shadow:0 28px 75px rgba(0,0,0,.52),inset 0 1px rgba(255,241,199,.13);color:#fff2ce;text-align:center;transform:translate(-50%,-46%) scale(.94);opacity:0;transition:opacity .25s ease,transform .28s ease;font-family:Georgia,serif}
      .cafasso-huella-unlock.is-visible{opacity:1;transform:translate(-50%,-50%) scale(1)}
      .cafasso-huella-unlock__seal{display:grid;place-items:center;width:68px;height:68px;margin:0 auto 13px;border:1px solid rgba(236,197,108,.57);border-radius:50%;background:radial-gradient(circle at 35% 30%,#e5c376,#a87539 72%);color:#503018;font:700 27px/1 Georgia,serif;box-shadow:0 0 0 5px rgba(235,194,102,.06),0 9px 18px rgba(0,0,0,.22);animation:cafassoHuellaStamp .45s cubic-bezier(.2,.75,.3,1.35)}
      @keyframes cafassoHuellaStamp{0%{transform:translateY(-26px) rotate(-10deg) scale(1.45);opacity:.15}75%{transform:translateY(3px) rotate(2deg) scale(.96)}100%{transform:none;opacity:1}}
      .cafasso-huella-unlock small{display:block;color:#d9bb75;font:850 9px/1.2 Inter,system-ui,sans-serif;letter-spacing:.15em;text-transform:uppercase}
      .cafasso-huella-unlock strong{display:block;margin-top:7px;color:#fff0c6;font:500 29px/1.05 Georgia,serif}
      .cafasso-huella-unlock span{display:block;margin-top:9px;color:rgba(255,243,215,.72);font:13px/1.45 Inter,system-ui,sans-serif}

      @media(max-width:680px){
        .cafasso-huellas-summary{margin-left:0;margin-right:0}.cafasso-huella-mini{width:28px;height:28px;font-size:12px}.cafasso-huellas-open{font-size:10px;margin-left:0}
        .cafasso-huellas-layer{padding:10px;align-items:end}.cafasso-huellas-album{width:100%;max-height:92vh;padding:32px 20px 25px;border-radius:13px 13px 0 0}.cafasso-huellas-album:after{display:none}.cafasso-huellas-grid{grid-template-columns:1fr}.cafasso-huella-card{min-height:128px}
      }
      @media(prefers-reduced-motion:reduce){.cafasso-huellas-layer,.cafasso-huellas-album,.cafasso-huella-unlock{transition:none!important}.cafasso-huella-unlock__seal{animation:none!important}}
    `;
    document.head.appendChild(style);
  }

  function renderSummary(state) {
    const path = document.querySelector('.cafasso-profile-path');
    if (!path) return false;
    ensureStyles();
    let summary = document.querySelector('[data-cafasso-huellas-summary]');
    if (!summary) {
      summary = document.createElement('section');
      summary.className = 'cafasso-huellas-summary';
      summary.dataset.cafassoHuellasSummary = '1';
    }
    const journey = document.querySelector('[data-profile-journey]');
    const level = document.querySelector('[data-cafasso-level-panel]');
    const anchor = journey || level || path;
    if (summary.previousElementSibling !== anchor) anchor.insertAdjacentElement('afterend', summary);
    const unlocked = new Set(state.unlocked || []);
    summary.innerHTML = `
      <div class="cafasso-huellas-summary__head">
        <span class="cafasso-huellas-summary__title">Huellas del camino</span>
        <span class="cafasso-huellas-summary__count">${DEFINITIONS.filter(item => unlocked.has(item.id)).length}/${DEFINITIONS.length}</span>
      </div>
      <div class="cafasso-huellas-summary__row">
        ${DEFINITIONS.map(item => `<span class="cafasso-huella-mini${unlocked.has(item.id) ? ' is-unlocked' : ''}" title="${unlocked.has(item.id) ? item.title : 'Huella por descubrir'}" aria-label="${unlocked.has(item.id) ? item.title : 'Huella todavía no descubierta'}">${unlocked.has(item.id) ? item.icon : '·'}</span>`).join('')}
        <button class="cafasso-huellas-open" data-cafasso-huellas-open type="button">abrir álbum</button>
      </div>`;
    summary.querySelector('[data-cafasso-huellas-open]')?.addEventListener('click', () => openAlbum(state));
    return true;
  }

  function openAlbum(state) {
    document.querySelector('.cafasso-huellas-layer')?.remove();
    const unlocked = new Set(state.unlocked || []);
    const layer = document.createElement('section');
    layer.className = 'cafasso-huellas-layer';
    layer.setAttribute('aria-label', 'Álbum de Huellas CAFASSO');
    layer.innerHTML = `
      <article class="cafasso-huellas-album" role="dialog" aria-modal="true" aria-labelledby="cafasso-huellas-title">
        <button class="cafasso-huellas-close" type="button" aria-label="Cerrar álbum">×</button>
        <div class="cafasso-huellas-kicker">Las marcas de tu camino</div>
        <h2 id="cafasso-huellas-title">Mis Huellas</h2>
        <p class="cafasso-huellas-intro">No son medallas para juntar. Son marcas de momentos importantes de tu recorrido: empezar, sostener, animarte, completar y crecer.</p>
        <div class="cafasso-huellas-grid">
          ${DEFINITIONS.map(item => {
            const found = unlocked.has(item.id);
            return `<article class="cafasso-huella-card ${found ? 'is-unlocked' : 'is-locked'}">
              <div class="cafasso-huella-card__seal" aria-hidden="true">${found ? item.icon : '?'}</div>
              <h3>${found ? item.title : 'Huella por descubrir'}</h3>
              <p>${found ? item.description : item.clue}</p>
              <span class="cafasso-huella-card__state">${found ? 'Huella conseguida' : 'Todavía sin marcar'}</span>
            </article>`;
          }).join('')}
        </div>
        <div class="cafasso-huellas-footer">Estas ocho Huellas acompañan los primeros grandes hitos de tu camino formativo. Se marcan solas cuando CAFASSO reconoce que ese paso ya ocurrió.</div>
      </article>`;
    document.body.appendChild(layer);
    const close = () => {
      layer.classList.remove('is-visible');
      setTimeout(() => layer.remove(), 240);
    };
    layer.querySelector('.cafasso-huellas-close')?.addEventListener('click', close);
    layer.addEventListener('click', event => { if (event.target === layer) close(); });
    const onKey = event => {
      if (event.key !== 'Escape') return;
      document.removeEventListener('keydown', onKey);
      close();
    };
    document.addEventListener('keydown', onKey);
    requestAnimationFrame(() => layer.classList.add('is-visible'));
  }

  function showUnlock(definition) {
    document.querySelector('.cafasso-huella-unlock')?.remove();
    const box = document.createElement('div');
    box.className = 'cafasso-huella-unlock';
    box.setAttribute('role', 'status');
    box.setAttribute('aria-live', 'polite');
    box.innerHTML = `<div class="cafasso-huella-unlock__seal">${definition.icon}</div><small>Nueva Huella</small><strong>${definition.title}</strong><span>${definition.description}</span>`;
    document.body.appendChild(box);
    requestAnimationFrame(() => box.classList.add('is-visible'));
    setTimeout(() => box.classList.remove('is-visible'), 3100);
    setTimeout(() => box.remove(), 3450);
  }

  async function persist(state) {
    writeLocal(state);
    const headers = authHeaders(true);
    const userId = uid();
    if (!headers || !userId) return false;
    const knownUnlocked = DEFINITIONS.filter(item => state.unlocked.includes(item.id)).map(item => item.id);
    try {
      const response = await fetch(PROGRESS_API, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId,
          courseId: COURSE_ID,
          moduleId: MODULE_ID,
          completed: knownUnlocked.length >= DEFINITIONS.length,
          percent: Math.min(100, Math.round((knownUnlocked.length / DEFINITIONS.length) * 100)),
          completedBlocks: knownUnlocked,
          blockAnswers: { huellasState: normalizeState(state) }
        })
      });
      const result = await response.json().catch(() => ({}));
      return Boolean(response.ok && result?.ok !== false);
    } catch (error) {
      return false;
    }
  }

  async function unlockById(id, { announce = true } = {}) {
    const definition = DEFINITIONS.find(item => item.id === String(id || ''));
    if (!definition) return readLocal();
    const local = readLocal();
    if (local.unlocked.includes(definition.id)) {
      renderSummary(local);
      return local;
    }
    local.unlocked.push(definition.id);
    local.updatedAt = new Date().toISOString();
    writeLocal(local);
    renderSummary(local);
    if (announce) showUnlock(definition);
    await persist(local);
    window.dispatchEvent(new CustomEvent('cafasso:huellas-update', {
      detail:{ unlocked:[...local.unlocked], newlyUnlocked:[definition.id] }
    }));
    return local;
  }

  function evaluate(state, context, announce = false) {
    const next = normalizeState(state);
    const previouslyUnlocked = new Set(next.unlocked);
    const newlyUnlocked = [];
    DEFINITIONS.forEach(def => {
      if (previouslyUnlocked.has(def.id) || !def.test(context)) return;
      next.unlocked.push(def.id);
      newlyUnlocked.push(def);
    });
    if (newlyUnlocked.length) next.updatedAt = new Date().toISOString();
    writeLocal(next);
    renderSummary(next);
    if (announce && newlyUnlocked.length) {
      let delay = 0;
      newlyUnlocked.forEach(def => {
        setTimeout(() => showUnlock(def), delay);
        delay += 3650;
      });
    }
    if (newlyUnlocked.length) {
      window.dispatchEvent(new CustomEvent('cafasso:huellas-update', {
        detail:{ unlocked:[...next.unlocked], newlyUnlocked:newlyUnlocked.map(item => item.id) }
      }));
    }
    return { state: next, changed: newlyUnlocked.length > 0 };
  }

  async function fetchContext(state) {
    const base = {
      ruahStreak: Number(window.CafassoProfileMetrics?.ruah?.streak || 0),
      hasCompletedMission: false,
      hasCompletedModule: false,
      hasCompletedCourse: false,
      hasSubmittedChallenge: false,
      hasApprovedSubmission: false,
      totalAlmitas: canonicalAlmitas(),
      visitedSpaces: [...(state?.visitedSpaces || [])]
    };
    const headers = authHeaders(false);
    const userId = uid();
    if (!headers) return { context: base, remoteState: null };
    try {
      const response = await fetch(ME_API, { headers, cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.ok === false) return { context: base, remoteState: null };
      base.ruahStreak = Math.max(base.ruahStreak, ruahStreak(data, userId));
      base.hasCompletedModule = hasCompletedModule(data, userId);
      base.hasCompletedMission = base.hasCompletedModule || hasApprovedSubmission(data, userId);
      base.hasCompletedCourse = hasCompletedCourse(data, userId);
      base.hasSubmittedChallenge = hasSubmittedChallenge(data, userId);
      base.hasApprovedSubmission = hasApprovedSubmission(data, userId);
      base.totalAlmitas = Math.max(base.totalAlmitas, canonicalAlmitas());
      return { context: base, remoteState: remoteHuellasState(data, userId) };
    } catch (error) {
      return { context: base, remoteState: null };
    }
  }

  async function refresh({ announce = false, backfill = false } = {}) {
    const local = readLocal();
    const markedLocal = markCurrentSpace(local);
    let working = markedLocal.state;
    const { context: initialContext, remoteState } = await fetchContext(working);
    if (remoteState) working = mergeStates(working, remoteState);
    const markedMerged = markCurrentSpace(working);
    working = markedMerged.state;
    const context = { ...initialContext, visitedSpaces: [...working.visitedSpaces], totalAlmitas:Math.max(initialContext.totalAlmitas, canonicalAlmitas()) };
    const result = evaluate(working, context, announce && !backfill);
    const needsPersist = result.changed || markedLocal.changed || markedMerged.changed || (remoteState && JSON.stringify(working) !== JSON.stringify(local));
    if (needsPersist) await persist(result.state);
    return result.state;
  }

  function mountWhenReady(state) {
    let attempts = 0;
    const tryMount = () => {
      if (renderSummary(state)) return;
      if (attempts < 40) {
        attempts += 1;
        setTimeout(tryMount, 100);
      }
    };
    tryMount();
  }

  function bindBitacora() {
    document.querySelector('[data-action="bitacora-save"]')?.addEventListener('click', () => {
      setTimeout(() => refresh({ announce: true }), 80);
    });
  }

  async function boot() {
    ensureStyles();
    let state = readLocal();
    const marked = markCurrentSpace(state);
    state = marked.state;
    writeLocal(state);
    mountWhenReady(state);
    state = await refresh({ backfill: true });
    renderSummary(state);
    bindBitacora();

    window.addEventListener('cafasso:mission-completed', () => unlockById('primer-paso', { announce:true }));
    window.addEventListener('cafasso:module-completed', () => unlockById('en-camino', { announce:true }));
    window.addEventListener('cafasso:challenge-submitted', () => unlockById('me-anime', { announce:true }));
    window.addEventListener('cafasso:profile-metrics', () => refresh({ announce: true }));
    window.addEventListener('cafasso:progress-update', () => refresh({ announce: true }));
    window.addEventListener('cafasso:almitas-total', () => refresh({ announce: true }));
    window.addEventListener('cafasso:level-update', () => refresh({ announce: true }));
    window.addEventListener('focus', () => refresh({ announce: true }));
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') refresh({ announce: true });
    });
    setInterval(() => refresh({ announce: true }), 75000);
  }

  window.CafassoHuellas = { refresh, unlock:unlockById, definitions:DEFINITIONS.map(({ test, ...item }) => item) };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
