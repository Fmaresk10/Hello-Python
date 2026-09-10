(() => {
  if (window.__cafassoGamifiedCourseInstalled) return;
  window.__cafassoGamifiedCourseInstalled = true;

  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (page !== 'index.html') return;

  const STYLE_ID = 'cafassoGamifiedCourseStyles';
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[char]));

  function styles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-stage-path{display:grid;gap:11px;margin:0 0 24px}
      .cafasso-stage-path .cafasso-stage-kicker{font-size:10px;font-weight:850;letter-spacing:.14em;text-transform:uppercase;color:#A37C27;margin-bottom:2px}
      .cafasso-stage-path .cafasso-stage-badge{display:inline-flex;align-items:center;gap:8px;width:max-content;background:#FFF7D7;border:1px solid rgba(200,155,49,.3);border-radius:999px;padding:7px 11px;color:#6D5200;font-size:11px;font-weight:850}
      .cafasso-stage-path .cafasso-stage-badge span{font-size:16px}
      .cafasso-mission-shell{margin:0 0 18px;padding:18px;border-radius:19px;background:linear-gradient(135deg,#FFF9E8,#F8F0DA);border:1px solid rgba(200,155,49,.25)}
      .cafasso-mission-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:15px}
      .cafasso-mission-kicker{font-size:9px;font-weight:850;letter-spacing:.14em;text-transform:uppercase;color:#9B7622;margin-bottom:5px}
      .cafasso-mission-title{font:400 25px/1.1 Georgia,serif;color:#173954;margin:0}
      .cafasso-mission-objective{margin:6px 0 0;color:#74664D;font-size:12px;line-height:1.45}
      .cafasso-mission-time{white-space:nowrap;color:#806823;font-size:11px;font-weight:800}
      .cafasso-mission-nav{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;position:relative}
      .cafasso-mission-nav:before{content:'';position:absolute;left:7%;right:7%;top:20px;height:2px;background:rgba(200,155,49,.3);z-index:0}
      .cafasso-mission-node{position:relative;z-index:1;display:grid;justify-items:center;gap:5px;border:1px solid rgba(23,57,84,.14);background:#FFFDF9;border-radius:15px;padding:9px 5px;color:#516173;font:800 10px/1.15 Inter,system-ui;cursor:pointer;min-height:66px}
      .cafasso-mission-node:hover{border-color:#D0A83B;color:#173954}
      .cafasso-mission-node.active{background:#173954;border-color:#173954;color:#fff}
      .cafasso-mission-node.done{background:#EDF5F1;border-color:#CDE2D8;color:#2E7D59}
      .cafasso-mission-node.locked{opacity:.48;cursor:not-allowed}
      .cafasso-mission-node i{font-style:normal;font-size:19px;line-height:1}
      .cafasso-mission-next{margin:0 0 18px;padding:13px 15px;border:1px solid #D9E7DE;border-radius:14px;background:#F3FAF5;color:#245F48;font-size:12px;line-height:1.45}
      .cafasso-mission-next strong{display:block;margin-bottom:3px}
      .cafasso-ruah-inline{display:flex;align-items:center;gap:9px;margin-top:13px;padding-top:12px;border-top:1px solid rgba(200,155,49,.2);color:#6D5200;font-size:11px}
      .cafasso-ruah-inline b{font-size:12px;color:#173954}
      .cafasso-home-ruah{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:12px;padding:14px 17px;border-radius:17px;background:linear-gradient(110deg,#E8F2ED,#F7F5E9);border:1px solid rgba(46,125,89,.18);color:#173954}
      .cafasso-home-ruah-main{display:flex;align-items:center;gap:11px}.cafasso-home-ruah-icon{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:#2E7D59;color:#fff;font:700 18px Georgia,serif}.cafasso-home-ruah-label{font:850 10px/1.2 Inter,system-ui;letter-spacing:.12em;text-transform:uppercase;color:#2E7D59}.cafasso-home-ruah-total{font:400 24px/1 Georgia,serif;color:#173954;margin-top:3px}.cafasso-home-ruah-note{font-size:11px;line-height:1.4;color:#527064;text-align:right;max-width:250px}.cafasso-home-ruah-note strong{display:block;color:#245F48;margin-bottom:3px}@media(max-width:680px){.cafasso-mission-head{display:block}.cafasso-mission-time{display:block;margin-top:8px}.cafasso-mission-nav{grid-template-columns:repeat(5,minmax(54px,1fr));overflow-x:auto;padding-bottom:4px}.cafasso-mission-node{font-size:9px}.cafasso-home-ruah{align-items:flex-start;flex-direction:column}.cafasso-home-ruah-note{text-align:left;max-width:none}}
    `;
    document.head.appendChild(style);
  }

  function experience() {
    return window.CafassoCourseExperience || null;
  }

  function settingsOf(module) {
    return module && module.settings && typeof module.settings === 'object' ? module.settings : {};
  }

  function missionsOf(module) {
    const missions = settingsOf(module).missions;
    return Array.isArray(missions) ? missions.filter(item => item && item.id) : [];
  }

  const introNarrative = {
    m1: { title: 'Entrá al patio', objective: 'Conocé a Juanito y empezá a mirar la historia desde los jóvenes.', icon: '🚪' },
    m2: { title: 'Descubrí sus raíces', objective: 'Reconocé las personas y experiencias que fueron formando su corazón.', icon: '🌱' },
    m3: { title: 'Abrí el sueño', objective: 'Escuchá el sueño de los nueve años y encontrá su primera pista.', icon: '✨' },
    m4: { title: 'Elegí cómo acercarte', objective: 'Probá una respuesta salesiana frente a una situación concreta.', icon: '🧭' },
    m5: { title: 'Salí al encuentro', objective: 'Realizá un gesto concreto con un joven y compartilo con tu formador.', icon: '🤝' }
  };

  function presentationOf(module, mission) {
    const custom = settingsOf(module).narrativeMissions;
    if (custom && custom[mission.id]) return { ...mission, ...custom[mission.id] };
    if (String(module?.title || '').toLowerCase().includes('juanito') && introNarrative[mission.id]) {
      return { ...mission, ...introNarrative[mission.id] };
    }
    return mission;
  }

  function blocksOf(module, missionId) {
    return (module?.contents || []).filter(block => {
      const settings = block.settings || {};
      return settings.missionId === missionId;
    });
  }

  function doneBlock(block, state) {
    if (block.required === false) return true;
    const settings = block.settings || {};
    const submission = (state.submissions || []).find(item => item.activityId === block._id);
    const type = String(block.type || '').toLowerCase();
    if (type === 'desafío' || type === 'desafio') return submission?.status === 'Aprobada';
    if (['reflexión', 'entrega', 'evaluación'].includes(type)) {
      return Boolean(String(submission?.content || state.work?.answers?.[block._id] || '').trim());
    }
    return Boolean(state.work?.done?.[block._id]);
  }

  function missionDone(mission, module, state) {
    const required = blocksOf(module, mission.id).filter(block => block.required !== false);
    return required.length === 0 || required.every(block => doneBlock(block, state));
  }

  function missionKey(module) {
    const user = window.CafassoAnimatorState?.session?.user?._id || 'local';
    const course = experience()?.course?._id || 'course';
    return `cafasso-mission-${user}-${course}-${module?._id || 'module'}`;
  }

  function storedMission(module) {
    try { return localStorage.getItem(missionKey(module)) || ''; } catch (error) { return ''; }
  }

  function setStoredMission(module, id) {
    try { localStorage.setItem(missionKey(module), id); } catch (error) { /* local storage may be unavailable */ }
  }

  function currentMission(module, missions, state) {
    const saved = storedMission(module);
    if (saved && missions.some(item => item.id === saved)) return saved;
    const firstOpen = missions.find(item => !missionDone(item, module, state));
    return (firstOpen || missions[missions.length - 1]).id;
  }

  function decorateStagePath() {
    const state = experience();
    const course = state?.course;
    if (!course || !document.querySelector('.section')) return;
    const cards = [...document.querySelectorAll('.card.module')];
    if (!cards.length || document.querySelector('.cafasso-stage-path')) return;
    cards.forEach((card, index) => {
      const moduleId = card.querySelector('[data-module]')?.getAttribute('data-module');
      const module = (course.modules || []).find(item => item && item._id === moduleId) || (course.modules || [])[index];
      const settings = settingsOf(module);
      if (!settings.gamified) return;
      const badge = settings.badge || {};
      const title = card.querySelector('strong');
      if (title && !title.querySelector('.cafasso-stage-kicker')) {
        title.innerHTML = `<span class="cafasso-stage-kicker">${esc(settings.stageLabel || `Etapa ${index + 1}`)}</span>${esc(module.title || '')}`;
      }
      const actions = card.querySelector('.module-actions');
      if (actions && badge.name && !actions.querySelector('.cafasso-stage-badge')) {
        actions.insertAdjacentHTML('afterbegin', `<span class="cafasso-stage-badge"><span>${esc(badge.icon || '✦')}</span>${esc(badge.name)}</span>`);
      }
    });
  }

  function decorateModule() {
    const state = experience();
    const module = state?.module;
    const missions = missionsOf(module);
    if (!module || !missions.length) return;
    const root = document.querySelector('.module-detail');
    if (!root) return;
    styles();
    const allBlocks = [...root.querySelectorAll('article.block[data-block-card]')];
    if (!allBlocks.length) return;
    const activeId = currentMission(module, missions, state);
    const existingShell = root.querySelector('.cafasso-mission-shell');
    if (existingShell && existingShell.dataset.activeMission === activeId) return;
    const active = missions.find(item => item.id === activeId) || missions[0];
    const activeView = presentationOf(module, active);
    const doneIds = new Set(missions.filter(item => missionDone(item, module, state)).map(item => item.id));
    const activeBlocks = new Set(blocksOf(module, active.id).map(block => block._id));
    allBlocks.forEach(card => {
      card.style.display = activeBlocks.has(card.dataset.blockCard) ? '' : 'none';
    });
    root.querySelectorAll('.cafasso-mission-shell,.cafasso-mission-next').forEach(node => node.remove());
    const shell = document.createElement('section');
    shell.className = 'cafasso-mission-shell';
    shell.dataset.activeMission = active.id;
    const moduleSettings = settingsOf(module);
    const badge = moduleSettings.badge || {};
    shell.innerHTML = `<div class="cafasso-mission-head"><div><div class="cafasso-mission-kicker">${esc(moduleSettings.stageLabel || 'El camino')} · Parada ${missions.indexOf(active) + 1} de ${missions.length}</div><h3 class="cafasso-mission-title">${esc(activeView.title)}</h3><p class="cafasso-mission-objective">${esc(activeView.objective || 'Avanzá un paso en tu recorrido.')}</p></div><span class="cafasso-mission-time">${Number(active.minutes || 5)} min</span></div><div class="cafasso-mission-nav">${missions.map((mission, index) => {
      const view = presentationOf(module, mission);
      const done = doneIds.has(mission.id);
      const previousDone = index === 0 || doneIds.has(missions[index - 1].id);
      const locked = !previousDone && !done;
      return `<button class="cafasso-mission-node ${mission.id === active.id ? 'active' : ''} ${done ? 'done' : ''} ${locked ? 'locked' : ''}" data-mission-id="${esc(mission.id)}" ${locked ? 'disabled' : ''}><i>${esc(view.icon || '•')}</i><span>${esc(view.title)}</span></button>`;
    }).join('')}</div>${active.rewardAlmitas ? `<div class="cafasso-ruah-inline"><span>✦</span><span>Recompensa de esta parada: <b>${Number(active.rewardAlmitas)} almitas</b></span></div>` : ''}${badge.name ? `<div class="cafasso-ruah-inline"><span>🏅</span><span>Logro del camino: <b>${esc(badge.name)}</b></span></div>` : ''}`;
    const progress = root.querySelector('.module-progress');
    if (progress) progress.insertAdjacentElement('afterend', shell);
    else root.prepend(shell);
    shell.querySelectorAll('[data-mission-id]:not([disabled])').forEach(button => {
      button.addEventListener('click', () => {
        setStoredMission(module, button.dataset.missionId);
        decorateModule();
      });
    });
    const activeDone = missionDone(active, module, state);
    const next = missions[missions.indexOf(active) + 1];
    if (activeDone && next) {
      const box = document.createElement('div');
      box.className = 'cafasso-mission-next';
      box.innerHTML = `<strong>✓ Parada completada</strong>Podés continuar con <b>${esc(presentationOf(module, next).title)}</b>.`;
      const complete = root.querySelector('.complete-box');
      if (complete) complete.insertAdjacentElement('beforebegin', box);
      else root.appendChild(box);
    }
  }

  function isoWeekKey(value) {
    const date = new Date(value || Date.now());
    if (Number.isNaN(date.getTime())) return '';
    const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const day = utc.getUTCDay() || 7;
    utc.setUTCDate(utc.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((utc - yearStart) / 86400000) + 1) / 7);
    return `${utc.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
  }

  function ruahSummary(state) {
    const weeks = new Set();
    (state?.data?.progress || []).forEach(progress => {
      (progress.ruahWeeks || []).forEach(week => weeks.add(String(week)));
      if (!progress.ruahWeeks?.length && progress.updatedAt) weeks.add(isoWeekKey(progress.updatedAt));
    });
    (state?.data?.submissions || []).forEach(submission => {
      const date = submission._updatedDate || submission._createdDate;
      if (date) weeks.add(isoWeekKey(date));
    });
    const current = isoWeekKey(Date.now());
    return { total: weeks.size, active: weeks.has(current) };
  }

  function decorateHome() {
    if ((location.hash || '#inicio') !== '#inicio') return;
    const almitas = document.querySelector('.cafasso-home-almitas');
    const state = window.CafassoAnimatorState;
    if (!almitas || !state) return;
    styles();
    const summary = ruahSummary(state);
    let card = document.querySelector('.cafasso-home-ruah');
    if (!card) {
      card = document.createElement('section');
      card.className = 'cafasso-home-ruah';
      almitas.insertAdjacentElement('afterend', card);
    }
    const signature = `${summary.total}:${summary.active}`;
    if (card.dataset.ruahSignature === signature) return;
    card.dataset.ruahSignature = signature;
    card.innerHTML = `<div class="cafasso-home-ruah-main"><span class="cafasso-home-ruah-icon">R</span><div><div class="cafasso-home-ruah-label">RUAH · constancia</div><div class="cafasso-home-ruah-total">${summary.total} semana${summary.total === 1 ? '' : 's'} con vida</div></div></div><div class="cafasso-home-ruah-note"><strong>${summary.active ? 'RUAH encendido esta semana' : 'RUAH en espera'}</strong>${summary.active ? 'Seguí caminando con una misión breve.' : 'Realizá una misión esta semana para volver a encenderlo.'}</div>`;
  }

  function refresh() {
    styles();
    const state = experience();
    if (state?.view === 'module') decorateModule();
    if (state?.view === 'course') decorateStagePath();
    decorateHome();
  }

  window.addEventListener('cafasso:course-experience-ready', refresh);
  window.addEventListener('cafasso:state-ready', refresh);
  window.addEventListener('hashchange', () => setTimeout(refresh, 40));
  setInterval(refresh, 1000);
  setTimeout(refresh, 250);
})();

