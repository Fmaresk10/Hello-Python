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
      .cafasso-course-map{position:relative;min-height:calc(100vh - 205px);margin:0 -4px 24px;padding:28px;border-radius:28px;overflow:hidden;background:#173B3B center/cover no-repeat;box-shadow:0 22px 55px rgba(10,36,45,.23);border:1px solid rgba(244,216,137,.58)}
      .cafasso-course-map:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(6,28,35,.08),rgba(6,28,35,.18) 55%,rgba(6,28,35,.38));pointer-events:none}
      .cafasso-course-map-head{position:relative;z-index:2;display:flex;justify-content:space-between;align-items:flex-start;gap:18px;color:#FFF9E8;text-shadow:0 2px 12px rgba(0,0,0,.4)}
      .cafasso-course-map-kicker{font-size:10px;font-weight:850;letter-spacing:.16em;text-transform:uppercase;color:#F4D889;margin-bottom:6px}
      .cafasso-course-map-title{font:400 35px/1.05 Georgia,serif;margin:0}.cafasso-course-map-copy{max-width:460px;margin:8px 0 0;color:#F0F5EC;font-size:13px;line-height:1.45}
      .cafasso-course-map-badge{display:inline-flex;align-items:center;gap:8px;padding:9px 12px;background:rgba(10,34,39,.65);border:1px solid rgba(244,216,137,.56);border-radius:999px;color:#FFF9E8;font-size:11px;font-weight:850;white-space:nowrap}
      .cafasso-map-stations{position:absolute;inset:0;z-index:3}.cafasso-map-station{position:absolute;transform:translate(-50%,-50%);width:155px;min-height:72px;border:1px solid rgba(255,243,194,.68);background:rgba(11,39,43,.82);border-radius:12px;padding:10px 9px 9px;color:#FFF9E8;cursor:pointer;box-shadow:0 8px 20px rgba(0,0,0,.24);text-align:left}.cafasso-map-station:hover{transform:translate(-50%,-53%);border-color:#FFE49A}.cafasso-map-station i{display:grid;place-items:center;width:30px;height:30px;margin:-25px 0 5px;border-radius:50%;background:#234E4C;border:2px solid #F4D889;font-style:normal;font-size:15px}.cafasso-map-station strong{display:block;font:800 11px/1.15 Inter,system-ui}.cafasso-map-station small{display:block;margin-top:4px;color:#D5E4D8;font-size:9px;line-height:1.25}.cafasso-map-station.active{background:#F1C85B;border-color:#FFF0B4;color:#17302F;box-shadow:0 0 0 5px rgba(244,216,137,.25),0 12px 28px rgba(0,0,0,.3)}.cafasso-map-station.active i{background:#17302F;color:#FFF9E8}.cafasso-map-station.active small{color:#365247}.cafasso-map-station.done{background:#2E7D59;border-color:#D3F0DB}.cafasso-map-station.locked{opacity:.72;filter:saturate(.55);cursor:not-allowed}.cafasso-map-station:nth-child(1){left:18%;top:76%}.cafasso-map-station:nth-child(2){left:40%;top:63%}.cafasso-map-station:nth-child(3){left:57%;top:39%}.cafasso-map-station:nth-child(4){left:72%;top:58%}.cafasso-map-station:nth-child(5){left:86%;top:31%}
      body.cafasso-journey-mode{background:#102F35;overflow-x:hidden}body.cafasso-journey-mode .shell{display:block;min-height:100vh}body.cafasso-journey-mode main{max-width:none;width:100%;min-height:100vh;padding:0}body.cafasso-journey-mode main>.top,body.cafasso-journey-mode main>.backline,body.cafasso-journey-mode .cafasso-course-map~*{display:none!important}body.cafasso-journey-mode .side{position:fixed;z-index:20;left:0;top:0;width:230px;height:100vh;padding:27px 16px;background:linear-gradient(90deg,rgba(6,27,33,.86),rgba(6,27,33,.35),transparent);box-shadow:none}body.cafasso-journey-mode .side .brand{opacity:.92;margin-bottom:36px}body.cafasso-journey-mode .side .nav{gap:7px;margin-top:0}body.cafasso-journey-mode .side .nav button{background:rgba(8,35,39,.42);border:1px solid rgba(244,216,137,.18);backdrop-filter:blur(8px);color:#FFF9E8;text-shadow:0 1px 8px rgba(0,0,0,.4)}body.cafasso-journey-mode .side .nav button.active,body.cafasso-journey-mode .side .nav button:hover{background:rgba(244,216,137,.9);border-color:#FFF0B4;color:#17302F;text-shadow:none}body.cafasso-journey-mode .side .foot{left:16px;right:16px;bottom:20px}body.cafasso-journey-mode .side .foot button,body.cafasso-journey-mode .side .foot a{background:rgba(8,35,39,.34);backdrop-filter:blur(8px)}body.cafasso-journey-mode .cafasso-course-map{min-height:100vh;margin:0;border:0;border-radius:0;box-shadow:none;padding:42px 6vw 35px}body.cafasso-journey-mode .cafasso-course-map-head{padding-left:190px}
      .cafasso-mission-shell{position:relative;overflow:hidden;margin:0 0 18px;padding:22px;border-radius:24px;background:radial-gradient(circle at 78% 12%,rgba(255,210,105,.24),transparent 22%),linear-gradient(145deg,#0D2A37 0%,#163F43 48%,#245A4B 100%);border:1px solid rgba(230,194,101,.5);box-shadow:0 18px 42px rgba(10,36,45,.2)}
      .cafasso-mission-shell:after{content:'';position:absolute;inset:auto -10% -56% 20%;height:70%;border-radius:50%;background:rgba(228,190,89,.08);transform:rotate(-9deg);pointer-events:none}
      .cafasso-mission-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:15px}
      .cafasso-mission-kicker{font-size:9px;font-weight:850;letter-spacing:.14em;text-transform:uppercase;color:#F4D889;margin-bottom:5px}
      .cafasso-mission-title{font:400 27px/1.1 Georgia,serif;color:#FFF9E8;margin:0}
      .cafasso-mission-objective{margin:6px 0 0;color:#DDE9DF;font-size:12px;line-height:1.45}
      .cafasso-mission-prompt{margin:14px 0 17px;padding:12px 14px;border-radius:13px;background:rgba(4,26,32,.34);border:1px solid rgba(235,209,132,.28);color:#E8F0E6;font-size:11px;line-height:1.45}
      .cafasso-mission-prompt strong{display:block;color:#F4D889;margin-bottom:3px;font-size:10px;letter-spacing:.08em;text-transform:uppercase}
      .cafasso-mission-time{white-space:nowrap;color:#F4D889;font-size:11px;font-weight:800}
      .cafasso-mission-nav{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;position:relative}
      .cafasso-mission-nav:before{content:'';position:absolute;left:7%;right:7%;top:20px;height:3px;background:linear-gradient(90deg,rgba(244,216,137,.85),rgba(244,216,137,.18));z-index:0;border-radius:99px;box-shadow:0 0 12px rgba(244,216,137,.25)}
      .cafasso-mission-node{position:relative;z-index:1;display:grid;justify-items:center;gap:5px;border:1px solid rgba(244,216,137,.36);background:rgba(7,33,40,.64);border-radius:15px;padding:9px 5px;color:#E7EFE5;font:800 10px/1.15 Inter,system-ui;cursor:pointer;min-height:70px;box-shadow:0 6px 15px rgba(0,0,0,.12)}
      .cafasso-mission-node:hover{border-color:#F4D889;color:#FFF9E8;transform:translateY(-2px)}
      .cafasso-mission-node.active{background:#F1C85B;border-color:#FFE5A1;color:#17302F;box-shadow:0 0 0 4px rgba(244,216,137,.18),0 8px 18px rgba(0,0,0,.2)}
      .cafasso-mission-node.done{background:#2E7D59;border-color:#B9DEC8;color:#fff}
      .cafasso-mission-node.locked{opacity:.52;cursor:not-allowed}
      .cafasso-mission-node i{font-style:normal;font-size:19px;line-height:1}
      .cafasso-mission-next{margin:0 0 18px;padding:13px 15px;border:1px solid #D9E7DE;border-radius:14px;background:#F3FAF5;color:#245F48;font-size:12px;line-height:1.45}
      .cafasso-mission-next strong{display:block;margin-bottom:3px}
      .cafasso-ruah-inline{display:flex;align-items:center;gap:9px;margin-top:13px;padding-top:12px;border-top:1px solid rgba(244,216,137,.26);color:#F4D889;font-size:11px;position:relative;z-index:1}
      .cafasso-ruah-inline b{font-size:12px;color:#FFF9E8}
      @media(max-width:680px){body.cafasso-journey-mode main{padding:0}body.cafasso-journey-mode .cafasso-course-map{min-height:100svh;padding:24px 14px 20px}body.cafasso-journey-mode .cafasso-course-map-head{padding-left:0;display:block}.cafasso-course-map-title{font-size:29px}.cafasso-course-map-copy{font-size:12px;max-width:300px}.cafasso-course-map-badge{margin-top:12px}.cafasso-map-station{width:132px;min-height:64px;padding:8px;font-size:10px}.cafasso-map-station:nth-child(1){left:22%;top:75%}.cafasso-map-station:nth-child(2){left:42%;top:64%}.cafasso-map-station:nth-child(3){left:59%;top:42%}.cafasso-map-station:nth-child(4){left:73%;top:58%}.cafasso-map-station:nth-child(5){left:84%;top:30%}}
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
    m1: { title: 'Entrá al patio', objective: 'Conocé a Juanito y empezá a mirar la historia desde los jóvenes.', prompt: 'Mirá el video de bienvenida y encontrá una primera pregunta que te acompañe.', icon: '🚪' },
    m2: { title: 'Descubrí sus raíces', objective: 'Reconocé las personas y experiencias que fueron formando su corazón.', prompt: 'Armá el mapa de las raíces: una persona, una dificultad y un don.', icon: '🌱' },
    m3: { title: 'Abrí el sueño', objective: 'Escuchá el sueño de los nueve años y encontrá su primera pista.', prompt: 'Leé el sueño y elegí la palabra que más ilumina tu manera de animar.', icon: '✨' },
    m4: { title: 'Elegí cómo acercarte', objective: 'Probá una respuesta salesiana frente a una situación concreta.', prompt: 'Tomá una decisión: ¿cómo te acercarías a este joven con razón, religión y amor?', icon: '🧭' },
    m5: { title: 'Salí al encuentro', objective: 'Realizá un gesto concreto con un joven y compartilo con tu formador.', prompt: 'Hacé el desafío, entregá tu evidencia y esperá la confirmación de tus almitas.', icon: '🤝' }
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
    if (!cards.length || document.querySelector('.cafasso-course-map')) return;
    const gamifiedCard = cards.find(card => {
      const moduleId = card.querySelector('[data-module]')?.getAttribute('data-module');
      const module = (course.modules || []).find(item => item && item._id === moduleId);
      return missionsOf(module).length > 0;
    });
    const moduleId = gamifiedCard?.querySelector('[data-module]')?.getAttribute('data-module');
    const module = (course.modules || []).find(item => item && item._id === moduleId);
    if (!module) return;
    const settings = settingsOf(module);
    const missions = missionsOf(module);
    const stateNow = experience();
    const doneIds = new Set(missions.filter(item => missionDone(item, module, stateNow)).map(item => item.id));
    const activeId = currentMission(module, missions, stateNow);
    const originalButtons = new Map(cards.map(card => [card.querySelector('[data-module]')?.getAttribute('data-module'), card.querySelector('[data-module]')]));
    const section = gamifiedCard.closest('.section');
    if (!section) return;
    const badge = settings.badge || {};
    const map = document.createElement('section');
    map.className = 'cafasso-course-map';
    map.style.backgroundImage = "url('https://static.wixstatic.com/media/47bf07_7598a21e0dbc420a8d4c30ffb6e52332~mv2.png')";
    map.innerHTML = `<div class="cafasso-course-map-head"><div><div class="cafasso-course-map-kicker">${esc(settings.stageLabel || 'Tu camino')} · ${missions.length} paradas</div><h2 class="cafasso-course-map-title">El camino de Juanito</h2><p class="cafasso-course-map-copy">Avanzá por la historia de Don Bosco. Cada parada se abre con una experiencia, una decisión y un gesto concreto.</p></div>${badge.name ? `<span class="cafasso-course-map-badge"><span>${esc(badge.icon || '✦')}</span>${esc(badge.name)}</span>` : ''}</div><div class="cafasso-map-stations">${missions.map((mission,index) => { const view=presentationOf(module,mission); const done=doneIds.has(mission.id); const previousDone=index===0||doneIds.has(missions[index-1].id); const locked=!previousDone&&!done; return `<button class="cafasso-map-station ${mission.id===activeId?'active':''} ${done?'done':''} ${locked?'locked':''}" data-map-mission="${esc(mission.id)}" ${locked?'disabled':''}><i>${esc(view.icon || '•')}</i><strong>${index+1}. ${esc(view.title)}</strong><small>${esc(view.objective || 'Una nueva parada del camino.')}</small></button>`; }).join('')}</div>`;
    document.body.classList.add('cafasso-journey-mode');
    const trackingCard = section.parentElement?.querySelector('.hero');
    if (trackingCard) trackingCard.remove();
    section.replaceWith(map);
    map.querySelectorAll('[data-map-mission]').forEach(button => button.addEventListener('click', () => {
      const target = originalButtons.get(moduleId);
      if (target) { setStoredMission(module, button.dataset.mapMission); target.click(); }
    }));
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
    shell.innerHTML = `<div class="cafasso-mission-head"><div><div class="cafasso-mission-kicker">${esc(moduleSettings.stageLabel || 'El camino')} · Parada ${missions.indexOf(active) + 1} de ${missions.length}</div><h3 class="cafasso-mission-title">${esc(activeView.title)}</h3><p class="cafasso-mission-objective">${esc(activeView.objective || 'Avanzá un paso en tu recorrido.')}</p></div><span class="cafasso-mission-time">${Number(active.minutes || 5)} min</span></div>${activeView.prompt ? `<div class="cafasso-mission-prompt"><strong>Tu misión ahora</strong>${esc(activeView.prompt)}</div>` : ''}<div class="cafasso-mission-nav">${missions.map((mission, index) => {
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
    if (state?.view !== 'course') document.body.classList.remove('cafasso-journey-mode');
    decorateHome();
  }

  window.addEventListener('cafasso:course-experience-ready', refresh);
  window.addEventListener('cafasso:state-ready', refresh);
  window.addEventListener('hashchange', () => setTimeout(refresh, 40));
  setInterval(refresh, 1000);
  setTimeout(refresh, 250);
})();

