(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('space') !== 'escuela') return;
  if (window.__cafassoSchoolExperienceInstalled) return;
  window.__cafassoSchoolExperienceInstalled = true;

  const ME_API = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoMe';
  const COURSE_API = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoCourse';
  const MAP_BG = 'https://static.wixstatic.com/media/47bf07_0d0a5e3ec41543cbb9d6171058171b28~mv2.png';
  const INTRO_KEY = 'cafasso-school-intro-v1';
  const STYLE_ID = 'cafassoSchoolExperienceStyles';
  const RESERVED_PREFIX = '__cafasso_';
  let returnCourseRestored = false;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
  }[char]));

  function json(storage, key) {
    try { return JSON.parse(storage.getItem(key) || 'null'); }
    catch (error) { return null; }
  }

  function authHeaders() {
    const auth = json(localStorage, 'cafassoAuth');
    if (!auth?.sessionToken || Number(auth.expiresAt || 0) <= Date.now()) return null;
    return { Authorization:`Bearer ${auth.sessionToken}` };
  }

  function sessionUser() {
    return json(localStorage, 'cafassoSession')?.user || {};
  }

  function invalidateSession() {
    try {
      if (window.parent?.CafassoInvalidateSession) {
        window.parent.CafassoInvalidateSession();
        return;
      }
    } catch (error) {}
    localStorage.removeItem('cafassoSession');
    localStorage.removeItem('cafassoAuth');
    try { window.top.location.replace('./login.html?reason=session'); }
    catch (error) { location.replace('./login.html?reason=session'); }
  }

  function isSessionFailure(response, payload) {
    if (response?.status === 401 || response?.status === 403) return true;
    return payload?.ok === false && /sesi[oó]n|token/i.test(String(payload?.error || ''));
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-escuela{isolation:isolate;background:#253b37}
      .cafasso-escuela:after{content:"";position:absolute;inset:0;z-index:2;pointer-events:none;background:linear-gradient(180deg,rgba(7,19,18,.02),transparent 48%,rgba(6,16,15,.18));box-shadow:inset 0 0 125px rgba(4,12,11,.12)}
      .cafasso-escuela .cafasso-space-link--escuela-patio{z-index:10}

      .cafasso-school-board{position:absolute;z-index:7;left:5.3%;top:11.5%;width:min(410px,32vw);min-height:315px;padding:31px 28px 25px;border:10px solid #755034;border-radius:5px;background:radial-gradient(circle at 23% 18%,rgba(255,255,255,.035),transparent 24%),repeating-linear-gradient(178deg,rgba(255,255,255,.012) 0 1px,transparent 1px 7px),linear-gradient(145deg,#264b43,#17372f 72%,#112c27);box-shadow:0 18px 34px rgba(0,0,0,.35),inset 0 0 38px rgba(0,0,0,.24),inset 0 0 0 2px rgba(230,199,145,.08);color:#f7efd9;transform:perspective(900px) rotateY(1.2deg) rotateZ(-.35deg);transform-origin:50% 100%}
      .cafasso-school-board:before{content:"";position:absolute;inset:-7px;border:2px solid rgba(50,29,17,.5);border-radius:4px;pointer-events:none}
      .cafasso-school-board:after{content:"";position:absolute;left:8%;right:8%;bottom:8px;height:3px;border-radius:99px;background:rgba(235,219,186,.14);box-shadow:0 1px rgba(0,0,0,.25)}
      .cafasso-school-board__kicker{color:#e5cf91;font:800 8px/1.2 Inter,system-ui,sans-serif;letter-spacing:.17em;text-transform:uppercase}
      .cafasso-school-board h1{margin:7px 0 4px;color:#fff9e8;font:400 clamp(25px,2.7vw,38px)/1 Georgia,serif;text-shadow:0 2px 4px rgba(0,0,0,.28)}
      .cafasso-school-board__copy{max-width:330px;margin:0 0 18px;color:rgba(244,239,221,.72);font:italic 12px/1.45 Georgia,serif}
      .cafasso-school-board__courses{display:grid;gap:4px;border-top:1px solid rgba(240,230,201,.14);padding-top:8px}
      .cafasso-school-course{position:relative;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:13px;align-items:center;width:100%;padding:10px 5px;border:0;border-bottom:1px solid rgba(240,230,201,.11);background:transparent;color:#f5efd9;text-align:left;cursor:pointer;transition:transform .16s ease,color .16s ease,background .16s ease}
      .cafasso-school-course:hover{transform:translateX(3px);color:#ffe39a;background:rgba(255,255,255,.025)}
      .cafasso-school-course:focus-visible{outline:2px solid #f2c95a;outline-offset:2px}
      .cafasso-school-course strong{display:block;font:500 16px/1.2 Georgia,serif}
      .cafasso-school-course small{display:block;margin-top:3px;color:rgba(241,235,214,.58);font:700 8px/1.3 Inter,system-ui,sans-serif;letter-spacing:.035em}
      .cafasso-school-course__progress{display:grid;place-items:center;width:43px;height:43px;border:1px solid rgba(242,213,132,.38);border-radius:50%;color:#f6d77f;font:800 10px/1 Inter,system-ui,sans-serif;box-shadow:inset 0 0 0 3px rgba(255,255,255,.025)}
      .cafasso-school-course.is-done .cafasso-school-course__progress{background:rgba(88,141,104,.24);border-color:rgba(171,219,178,.42);color:#dff2d9}
      .cafasso-school-loading,.cafasso-school-empty{padding:20px 4px;color:rgba(247,239,217,.7);font:italic 13px/1.5 Georgia,serif}

      .cafasso-school-intro{position:absolute;z-index:8;left:50%;bottom:5.5%;width:min(690px,82vw);padding:0 18px 12px;border-bottom:1px solid rgba(238,205,125,.28);color:#fff8e9;text-align:center;text-shadow:0 3px 16px rgba(0,0,0,.72);pointer-events:none;opacity:0;transform:translate(-50%,10px);transition:opacity .75s ease,transform .75s ease}
      .cafasso-school-intro.is-visible{opacity:1;transform:translate(-50%,0)}
      .cafasso-school-intro.is-leaving{opacity:0;transform:translate(-50%,-5px)}
      .cafasso-school-intro strong{display:block;font:400 clamp(24px,3vw,39px)/1.08 Georgia,serif}
      .cafasso-school-intro span{display:block;margin-top:7px;color:rgba(255,247,227,.67);font:700 9px/1.3 Inter,system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase}

      body.cafasso-school-course-open .cafasso-global-counters,body.cafasso-school-course-open .cafasso-level-pill{display:none!important}
      .cafasso-school-map-panel{position:fixed;inset:0;z-index:82;background:#102f35 center/cover no-repeat;overflow:hidden;color:#fff8e7}
      .cafasso-school-map-panel:before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,27,31,.22),rgba(7,27,31,.36) 54%,rgba(4,18,21,.62));pointer-events:none}
      .cafasso-school-map-panel[hidden]{display:none!important}
      .cafasso-school-map__close{position:absolute;z-index:6;right:24px;top:21px;border:1px solid rgba(244,216,137,.56);border-radius:999px;padding:10px 15px;background:rgba(8,35,39,.78);backdrop-filter:blur(8px);color:#fff8e7;font:800 11px/1 Inter,system-ui,sans-serif;cursor:pointer}
      .cafasso-school-map__head{position:relative;z-index:3;max-width:750px;padding:42px 6vw 0}
      .cafasso-school-map__kicker{color:#f2d47e;font:800 9px/1.2 Inter,system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase}
      .cafasso-school-map__head h2{margin:7px 0 8px;font:400 clamp(34px,4vw,54px)/1 Georgia,serif;text-shadow:0 3px 17px rgba(0,0,0,.42)}
      .cafasso-school-map__head p{max-width:560px;margin:0;color:#e1ebe2;font:13px/1.5 Inter,system-ui,sans-serif}
      .cafasso-school-map__progress{display:inline-flex;align-items:center;gap:8px;margin-top:14px;padding:8px 11px;border:1px solid rgba(244,216,137,.42);border-radius:999px;background:rgba(7,32,36,.55);color:#fff4c7;font:800 10px/1 Inter,system-ui,sans-serif;backdrop-filter:blur(7px)}
      .cafasso-school-map__stations{position:absolute;inset:0;z-index:4}
      .cafasso-school-module{position:absolute;transform:translate(-50%,-50%);width:185px;min-height:82px;padding:12px 12px 10px;border:1px solid rgba(115,77,39,.56);border-radius:7px 7px 4px 4px;background:linear-gradient(145deg,#f4e6c8,#d9bd8b);box-shadow:0 11px 22px rgba(42,26,14,.33),inset 0 1px rgba(255,255,255,.56);color:#3b2b1e;text-align:left;cursor:pointer;transition:transform .17s ease,filter .17s ease}
      .cafasso-school-module:hover:not(:disabled){transform:translate(-50%,-54%);filter:brightness(1.035)}
      .cafasso-school-module i{display:grid;place-items:center;width:31px;height:31px;margin:-27px 0 6px;border-radius:50%;border:2px solid #f4d889;background:#2b5a50;color:#fff9e8;font-style:normal;font:800 13px/1 Inter,system-ui,sans-serif;box-shadow:0 3px 8px rgba(35,35,20,.25)}
      .cafasso-school-module strong{display:block;font:600 14px/1.15 Georgia,serif}.cafasso-school-module small{display:block;margin-top:5px;color:#70563b;font:700 8.5px/1.3 Inter,system-ui,sans-serif}
      .cafasso-school-module.is-done{background:linear-gradient(145deg,#d6e8d8,#9fc5a7);border-color:#e8f4e7}.cafasso-school-module.is-done i{background:#2e7d59}
      .cafasso-school-module.is-current{background:linear-gradient(145deg,#ffe6a0,#d9a83e);border-color:#fff1be;box-shadow:0 0 0 5px rgba(244,216,137,.22),0 12px 28px rgba(47,29,15,.34)}
      .cafasso-school-module.is-locked{opacity:.66;filter:saturate(.5);cursor:not-allowed}
      .cafasso-school-module:nth-child(1){left:17%;top:76%}.cafasso-school-module:nth-child(2){left:39%;top:60%}.cafasso-school-module:nth-child(3){left:61%;top:42%}.cafasso-school-module:nth-child(4){left:82%;top:29%}.cafasso-school-module:nth-child(5){left:70%;top:71%}.cafasso-school-module:nth-child(6){left:88%;top:55%}
      .cafasso-school-module-note{position:absolute;z-index:5;right:4.5%;bottom:4.5%;width:min(340px,30vw);padding:17px 18px;border:1px solid rgba(115,77,39,.48);border-radius:7px;background:linear-gradient(145deg,rgba(249,235,204,.96),rgba(218,190,140,.96));box-shadow:0 13px 27px rgba(42,26,14,.3);color:#3f3022;transform:rotate(-.5deg)}
      .cafasso-school-module-note strong{display:block;font:500 21px/1.1 Georgia,serif}.cafasso-school-module-note span{display:block;margin-top:6px;color:#6f563b;font:11px/1.45 Inter,system-ui,sans-serif}

      @media(max-width:760px){
        .cafasso-school-board{left:5%;right:5%;top:10%;width:auto;min-height:0;padding:24px 20px 19px;border-width:7px;transform:none}.cafasso-school-board h1{font-size:30px}.cafasso-school-board__copy{font-size:11px;margin-bottom:12px}.cafasso-school-course strong{font-size:14px}.cafasso-school-intro{bottom:4%;width:90vw}.cafasso-school-map__head{padding:72px 20px 0}.cafasso-school-map__head h2{font-size:35px}.cafasso-school-map__head p{font-size:11px;max-width:300px}.cafasso-school-map__close{right:12px;top:13px}.cafasso-school-module{width:132px;min-height:66px;padding:8px;font-size:10px}.cafasso-school-module strong{font-size:11px}.cafasso-school-module small{font-size:7.5px}.cafasso-school-module:nth-child(1){left:22%;top:76%}.cafasso-school-module:nth-child(2){left:43%;top:62%}.cafasso-school-module:nth-child(3){left:61%;top:45%}.cafasso-school-module:nth-child(4){left:80%;top:31%}.cafasso-school-module-note{left:14px;right:14px;bottom:14px;width:auto;padding:12px 14px}.cafasso-school-module-note strong{font-size:17px}
      }
      /* Curso responsive: cambia de mapa libre a recorrido legible según espacio real. */
      @media(max-width:1100px) and (min-width:761px){
        .cafasso-school-map__head{padding:34px 5vw 0;max-width:64vw}
        .cafasso-school-map__head h2{font-size:clamp(31px,4.2vw,46px)}
        .cafasso-school-module{width:clamp(142px,16vw,176px);min-height:74px}
        .cafasso-school-module-note{width:min(300px,28vw);padding:14px 15px}
      }
      @media(max-width:820px),(max-height:600px){
        .cafasso-school-map-panel{overflow:auto;overscroll-behavior:contain;padding-bottom:max(22px,env(safe-area-inset-bottom))}
        .cafasso-school-map-panel:before{position:fixed}
        .cafasso-school-map__close{position:fixed;right:max(12px,env(safe-area-inset-right));top:max(12px,env(safe-area-inset-top));min-height:42px}
        .cafasso-school-map__head{padding:calc(64px + env(safe-area-inset-top)) max(18px,5vw) 0;max-width:none}
        .cafasso-school-map__head h2{font-size:clamp(30px,8vw,42px);max-width:calc(100vw - 90px)}
        .cafasso-school-map__head p{max-width:680px;font-size:clamp(11px,2.8vw,13px)}
        .cafasso-school-map__progress{margin-top:11px}
        .cafasso-school-map__stations{position:relative;inset:auto;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px 14px;padding:34px max(18px,5vw) 18px}
        .cafasso-school-module,.cafasso-school-module:nth-child(n){position:relative!important;left:auto!important;top:auto!important;transform:none!important;width:100%;min-height:78px;padding:11px 11px 10px}
        .cafasso-school-module:hover:not(:disabled){transform:translateY(-2px)!important}
        .cafasso-school-module i{margin:-24px 0 6px}
        .cafasso-school-module strong{font-size:clamp(12px,3vw,15px)}
        .cafasso-school-module small{font-size:clamp(8px,2.2vw,10px)}
        .cafasso-school-module-note{position:relative;left:auto;right:auto;bottom:auto;width:auto;margin:8px max(18px,5vw) 0;padding:14px 15px;transform:none}
      }
      @media(max-width:520px){
        .cafasso-school-map__stations{grid-template-columns:1fr;gap:19px;padding-top:36px}
        .cafasso-school-module{min-height:72px}
        .cafasso-school-module-note strong{font-size:18px}
      }
      @media(max-height:600px) and (orientation:landscape){
        .cafasso-school-map__head{padding-top:18px;padding-right:150px}
        .cafasso-school-map__head h2{font-size:clamp(25px,5.5vh,36px);margin:4px 0 5px}
        .cafasso-school-map__head p{font-size:10px;line-height:1.35}
        .cafasso-school-map__progress{margin-top:7px;padding:6px 9px}
        .cafasso-school-map__stations{grid-template-columns:repeat(3,minmax(0,1fr));gap:15px 12px;padding-top:28px}
        .cafasso-school-module{min-height:64px;padding:8px 9px}
        .cafasso-school-module i{width:27px;height:27px;margin:-21px 0 4px}
        .cafasso-school-module-note{margin-top:2px}
      }
      @media(prefers-reduced-motion:reduce){.cafasso-school-course,.cafasso-school-intro,.cafasso-school-module{transition:none!important}}
    `;
    document.head.appendChild(style);
  }

  function showIntro(parish) {
    let already = false;
    try { already = sessionStorage.getItem(INTRO_KEY) === '1'; } catch (error) {}
    if (already) return;
    const intro = document.createElement('div');
    intro.className = 'cafasso-school-intro';
    intro.innerHTML = '<strong>Aprender también es una forma de cuidar.</strong><span>Entrá a tu camino de formación.</span>';
    parish.appendChild(intro);
    requestAnimationFrame(() => intro.classList.add('is-visible'));
    setTimeout(() => intro.classList.add('is-leaving'), 3800);
    setTimeout(() => intro.remove(), 4700);
    try { sessionStorage.setItem(INTRO_KEY, '1'); } catch (error) {}
  }

  function mountBoard(school) {
    const board = document.createElement('section');
    board.className = 'cafasso-school-board';
    board.setAttribute('aria-label', 'Mis cursos en Escuela');
    board.innerHTML = `
      <div class="cafasso-school-board__kicker">CAFASSO · Escuela</div>
      <h1>Mi camino de formación</h1>
      <p class="cafasso-school-board__copy">Lo que aprendés acá se vuelve presencia, criterio y cuidado cuando acompañás a otros.</p>
      <div class="cafasso-school-board__courses" data-school-courses><div class="cafasso-school-loading">Buscando tus cursos…</div></div>`;
    school.appendChild(board);
    return board;
  }

  function renderCourses(board, data) {
    const host = board.querySelector('[data-school-courses]');
    if (!host) return;
    const userId = String(sessionUser()?._id || sessionUser()?.id || '');
    const rows = (Array.isArray(data?.progress) ? data.progress : []).filter(row => !userId || !row?.userId || String(row.userId) === userId);
    const byCourse = new Map(rows.map(row => [String(row.courseId || ''), row]));
    const courses = (Array.isArray(data?.courses) ? data.courses : []).filter(course => {
      const id = String(course?._id || course?.id || '');
      return id && !id.startsWith(RESERVED_PREFIX);
    });

    if (!courses.length) {
      host.innerHTML = '<div class="cafasso-school-empty">Todavía no tenés cursos asignados. Cuando se abra uno para vos, va a aparecer escrito acá.</div>';
      return;
    }

    host.innerHTML = courses.map(course => {
      const id = String(course._id || course.id || '');
      const row = byCourse.get(id);
      const direct = Number(course.myProgress);
      const percent = Math.max(0, Math.min(100, row ? Number(row.percent || 0) : (Number.isFinite(direct) ? direct : 0)));
      const done = percent >= 100;
      return `<button class="cafasso-school-course ${done ? 'is-done' : ''}" type="button" data-school-course="${esc(id)}"><span><strong>${esc(course.title || 'Curso')}</strong><small>${done ? 'Camino completado' : percent > 0 ? 'Seguí desde donde quedaste' : 'Un camino nuevo te espera'}</small></span><span class="cafasso-school-course__progress">${Math.round(percent)}%</span></button>`;
    }).join('');

    host.querySelectorAll('[data-school-course]').forEach(button => {
      button.addEventListener('click', () => openCourseMap(button.dataset.schoolCourse, data));
    });

    const requestedCourse = String(params.get('course') || '').trim();
    if (requestedCourse && !returnCourseRestored && courses.some(course => String(course?._id || course?.id || '') === requestedCourse)) {
      returnCourseRestored = true;
      requestAnimationFrame(() => openCourseMap(requestedCourse, data));
    }
  }

  function findProgress(data, courseId) {
    const userId = String(sessionUser()?._id || sessionUser()?.id || '');
    return (Array.isArray(data?.progress) ? data.progress : []).find(row =>
      String(row?.courseId || '') === String(courseId) && (!userId || !row?.userId || String(row.userId) === userId)
    ) || null;
  }

  function moduleId(module) { return String(module?._id || module?.id || ''); }

  function closeCourseMap(panel) {
    if (panel) panel.hidden = true;
    document.body.classList.remove('cafasso-school-course-open');
    try {
      const url = new URL(location.href);
      if (url.searchParams.has('course') || url.searchParams.has('fromMission')) {
        url.searchParams.delete('course');
        url.searchParams.delete('fromMission');
        history.replaceState(history.state, '', url.pathname + (url.searchParams.toString() ? '?' + url.searchParams.toString() : '') + url.hash);
      }
    } catch (error) {}
  }

  async function openCourseMap(courseId, meData) {
    let panel = document.querySelector('.cafasso-school-map-panel');
    if (!panel) {
      panel = document.createElement('section');
      panel.className = 'cafasso-school-map-panel';
      panel.hidden = true;
      document.body.appendChild(panel);
    }
    panel.hidden = false;
    document.body.classList.add('cafasso-school-course-open');
    panel.style.backgroundImage = `url('${MAP_BG}')`;
    panel.innerHTML = '<button class="cafasso-school-map__close" type="button" data-school-map-close>← Volver a Escuela</button><div class="cafasso-school-map__head"><div class="cafasso-school-map__kicker">Abriendo tu camino…</div><h2>Preparando el curso</h2></div>';
    panel.querySelector('[data-school-map-close]')?.addEventListener('click', () => { closeCourseMap(panel); });

    try {
      const response = await fetch(`${COURSE_API}?id=${encodeURIComponent(courseId)}`, { cache:'no-store' });
      const result = await response.json().catch(() => ({}));
      if (isSessionFailure(response, result)) {
        invalidateSession();
        return;
      }
      if (!response.ok || !result?.ok || !result?.course) throw new Error(result?.error || 'No se pudo cargar el curso.');
      const course = result.course;
      const modules = Array.isArray(course.modules) ? course.modules : [];
      const progress = findProgress(meData, courseId);
      const percent = Math.max(0, Math.min(100, Number(progress?.percent || 0)));
      const completed = new Set(Array.isArray(progress?.completedModules) ? progress.completedModules.map(String) : []);
      const firstPending = modules.findIndex(module => !completed.has(moduleId(module)));

      panel.innerHTML = `
        <button class="cafasso-school-map__close" type="button" data-school-map-close>← Volver a Escuela</button>
        <header class="cafasso-school-map__head">
          <div class="cafasso-school-map__kicker">Tu recorrido en Escuela</div>
          <h2>${esc(course.title || 'Curso')}</h2>
          <p>${esc(course.description || 'Cada módulo abre una etapa nueva del camino. Avanzá a tu ritmo y retomá siempre desde donde quedaste.')}</p>
          <span class="cafasso-school-map__progress">${Math.round(percent)}% del camino completado</span>
        </header>
        <div class="cafasso-school-map__stations">
          ${modules.slice(0,6).map((module,index) => {
            const id = moduleId(module);
            const done = completed.has(id);
            const unlocked = done || index === 0 || completed.has(moduleId(modules[index - 1]));
            const current = !done && (firstPending < 0 ? index === modules.length - 1 : index === firstPending);
            return `<button class="cafasso-school-module ${done ? 'is-done' : ''} ${current ? 'is-current' : ''} ${unlocked ? '' : 'is-locked'}" type="button" data-school-module="${esc(id)}" data-school-module-index="${index}" ${unlocked ? '' : 'disabled'}><i>${done ? '✓' : unlocked ? index + 1 : '🔒'}</i><strong>${esc(module.title || `Módulo ${index + 1}`)}</strong><small>${done ? 'Completado' : unlocked ? current ? 'Tu próxima etapa' : 'Disponible' : 'Se abre al completar la etapa anterior'}</small></button>`;
          }).join('')}
        </div>
        <aside class="cafasso-school-module-note" data-school-module-note>
          <strong>${modules.length ? 'Elegí una etapa del camino' : 'Este curso todavía no tiene módulos'}</strong>
          <span>${modules.length ? 'Los candados respetan tu progreso real. El próximo paso es entrar a las misiones de cada módulo.' : 'Cuando se publiquen los módulos, van a aparecer acá.'}</span>
        </aside>`;

      panel.querySelector('[data-school-map-close]')?.addEventListener('click', () => { closeCourseMap(panel); });
      panel.querySelectorAll('[data-school-module]:not(:disabled)').forEach(button => {
        button.addEventListener('click', () => {
          const module = modules[Number(button.dataset.schoolModuleIndex || 0)];
          const id = moduleId(module);
          if (!module || !id) return;
          const target = new URL('./course-player.html', location.href);
          target.searchParams.set('player', '1');
          target.searchParams.set('playerBuild', '3');
          target.searchParams.set('course', String(courseId));
          target.searchParams.set('module', id);
          target.hash = 'modulo';
          location.href = target.toString();
        });
      });
    } catch (error) {
      panel.innerHTML = `<button class="cafasso-school-map__close" type="button" data-school-map-close>← Volver a Escuela</button><header class="cafasso-school-map__head"><div class="cafasso-school-map__kicker">Escuela</div><h2>No pudimos abrir este camino</h2><p>${esc(error?.message || 'Probá nuevamente en un momento.')}</p></header>`;
      panel.querySelector('[data-school-map-close]')?.addEventListener('click', () => { closeCourseMap(panel); });
    }
  }

  async function loadCourses(board) {
    const host = board.querySelector('[data-school-courses]');
    const headers = authHeaders();
    if (!headers) {
      if (host) host.innerHTML = '<div class="cafasso-school-empty">Volvé a ingresar a CAFASSO para sincronizar tus cursos.</div>';
      return;
    }
    try {
      const response = await fetch(ME_API, { headers, cache:'no-store' });
      const data = await response.json().catch(() => ({}));
      if (isSessionFailure(response, data)) {
        invalidateSession();
        return;
      }
      if (!response.ok || data?.ok === false) throw new Error(data?.error || 'No pudimos cargar tus cursos.');
      renderCourses(board, data);
    } catch (error) {
      if (host) host.innerHTML = `<div class="cafasso-school-empty">${esc(error?.message || 'No pudimos cargar tus cursos.')}</div>`;
    }
  }

  function boot() {
    const school = document.querySelector('.cafasso-escuela');
    if (!school || school.dataset.schoolExperienceReady === '1') return false;
    school.dataset.schoolExperienceReady = '1';
    ensureStyles();
    const board = mountBoard(school);
    showIntro(school);
    loadCourses(board);
    return true;
  }

  let attempts = 0;
  const wait = () => {
    if (boot()) return;
    attempts += 1;
    if (attempts < 35) setTimeout(wait, 80);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wait, { once:true });
  else wait();
})();
