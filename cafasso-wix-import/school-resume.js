(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('space') !== 'escuela') return;
  if (window.__cafassoSchoolResumeInstalled) return;
  window.__cafassoSchoolResumeInstalled = true;

  const STYLE_ID = 'cafassoSchoolResumeStyles';

  function json(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); }
    catch (error) { return null; }
  }

  function userKey() {
    const user = json('cafassoSession')?.user || {};
    return String(user?._id || user?.id || user?.email || user?.name || 'local');
  }

  const MEMORY_KEY = `cafasso-school-resume-v1:${userKey()}`;

  function readMemory() {
    try { return JSON.parse(localStorage.getItem(MEMORY_KEY) || '{}'); }
    catch (error) { return {}; }
  }

  function writeMemory(patch) {
    try {
      localStorage.setItem(MEMORY_KEY, JSON.stringify({ ...readMemory(), ...patch, at:new Date().toISOString() }));
    } catch (error) {}
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-school-resume{position:absolute;z-index:8;right:6.2%;bottom:8.2%;width:188px;height:126px;padding:0;border:0;background:transparent;cursor:pointer;filter:drop-shadow(0 14px 10px rgba(0,0,0,.36));transform:rotate(-4deg);transition:transform .2s ease,filter .2s ease,opacity .2s ease}
      .cafasso-school-resume:hover{transform:rotate(-3deg) translateY(-5px) scale(1.025);filter:drop-shadow(0 18px 13px rgba(0,0,0,.43))}
      .cafasso-school-resume:focus-visible{outline:3px solid #f2c95a;outline-offset:7px;border-radius:9px}
      .cafasso-school-resume.is-opening{transform:rotate(-2deg) translateY(-8px) scale(1.04);opacity:.9}
      .cafasso-school-resume.is-unavailable{opacity:.4;pointer-events:none}
      .cafasso-school-resume__book{position:absolute;inset:4px 6px 7px 3px;overflow:hidden;border-radius:5px 9px 8px 5px;border:1px solid rgba(47,27,19,.76);background:linear-gradient(90deg,rgba(255,255,255,.08),transparent 12%,transparent 75%,rgba(0,0,0,.12)),repeating-linear-gradient(0deg,rgba(255,255,255,.018) 0 1px,transparent 1px 4px),linear-gradient(145deg,#80543d,#5e392c 62%,#492b23);box-shadow:inset 7px 0 10px rgba(35,17,13,.24),inset -2px -3px 8px rgba(31,16,12,.23),inset 0 0 0 2px rgba(219,185,139,.075),0 4px 2px rgba(0,0,0,.17);transform:perspective(700px) rotateX(8deg);transform-origin:50% 100%}
      .cafasso-school-resume__book:before{content:"";position:absolute;left:8px;top:0;bottom:0;width:3px;background:linear-gradient(90deg,rgba(22,10,8,.34),rgba(255,255,255,.08),rgba(25,12,9,.18));box-shadow:3px 0 4px rgba(0,0,0,.14)}
      .cafasso-school-resume__book:after{content:"";position:absolute;left:8px;right:2px;bottom:-4px;height:8px;border-radius:0 0 5px 3px;background:repeating-linear-gradient(180deg,#e8dcc3 0 1px,#cbb99d 1px 2px);box-shadow:0 2px 2px rgba(0,0,0,.16)}
      .cafasso-school-resume__label{position:absolute;left:27px;right:18px;top:20px;min-height:75px;padding:10px 11px 8px;border:1px solid rgba(118,86,55,.3);border-radius:2px;background:repeating-linear-gradient(180deg,rgba(119,88,57,.07) 0 1px,transparent 1px 16px),linear-gradient(145deg,#f2e8cf,#dfcfaa);box-shadow:0 2px 4px rgba(35,19,12,.14),inset 0 0 11px rgba(125,93,58,.06);color:#463527;text-align:left;transform:rotate(.6deg)}
      .cafasso-school-resume__kicker{display:block;color:#8b6746;font:800 8px/1.1 Inter,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase}
      .cafasso-school-resume__title{display:-webkit-box;margin-top:5px;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:2;color:#392b20;font:600 14px/1.08 Georgia,serif}
      .cafasso-school-resume__meta{display:block;margin-top:6px;color:#725942;font:700 8.5px/1.2 Inter,system-ui,sans-serif}
      .cafasso-school-resume__pencil{position:absolute;right:-4px;top:18px;width:9px;height:99px;border-radius:4px 4px 2px 2px;background:linear-gradient(90deg,#b28b48,#e5c372 45%,#9a7137);box-shadow:0 3px 4px rgba(0,0,0,.23);transform:rotate(7deg)}
      .cafasso-school-resume__pencil:before{content:"";position:absolute;left:1px;right:1px;top:-10px;height:12px;clip-path:polygon(50% 0,100% 100%,0 100%);background:linear-gradient(90deg,#d7b784,#f2d5a2,#b98755)}
      .cafasso-school-resume__pencil:after{content:"";position:absolute;left:2px;right:2px;top:-9px;height:4px;clip-path:polygon(50% 0,100% 100%,0 100%);background:#2a211a}
      @media(max-width:760px){.cafasso-school-resume{right:4.5%;bottom:8%;width:132px;height:91px}.cafasso-school-resume__label{left:20px;right:13px;top:14px;min-height:56px;padding:7px 8px 5px}.cafasso-school-resume__kicker{font-size:6px}.cafasso-school-resume__title{margin-top:3px;font-size:10px}.cafasso-school-resume__meta{margin-top:4px;font-size:6.5px}.cafasso-school-resume__pencil{height:72px;width:7px;top:12px}}
      @media(prefers-reduced-motion:reduce){.cafasso-school-resume{transition:none!important}}
    `;
    document.head.appendChild(style);
  }

  function mount(school) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'cafasso-school-resume is-unavailable';
    button.setAttribute('aria-label', 'Continuar donde quedé');
    button.innerHTML = `
      <span class="cafasso-school-resume__book" aria-hidden="true"></span>
      <span class="cafasso-school-resume__label">
        <span class="cafasso-school-resume__kicker">Continuar</span>
        <strong class="cafasso-school-resume__title">Mi camino</strong>
        <span class="cafasso-school-resume__meta">Buscando tu último paso…</span>
      </span>
      <span class="cafasso-school-resume__pencil" aria-hidden="true"></span>`;
    school.appendChild(button);
    return button;
  }

  function courseButtons() {
    return [...document.querySelectorAll('[data-school-course]')];
  }

  function chooseCourse() {
    const buttons = courseButtons();
    if (!buttons.length) return null;
    const memory = readMemory();
    const remembered = buttons.find(button => String(button.dataset.schoolCourse || '') === String(memory.courseId || ''));
    if (remembered) return remembered;
    return buttons.find(button => /Seguí desde donde quedaste/i.test(button.textContent || '')) || buttons[0];
  }

  function hydrate(button, attempts = 0) {
    const target = chooseCourse();
    if (!target) {
      if (attempts < 45) setTimeout(() => hydrate(button, attempts + 1), 100);
      return;
    }
    const title = target.querySelector('strong')?.textContent?.trim() || 'Curso';
    const progressText = target.querySelector('.cafasso-school-course__progress')?.textContent?.trim() || '0%';
    const progress = Number.parseInt(progressText, 10) || 0;
    const memory = readMemory();
    button.dataset.courseId = String(target.dataset.schoolCourse || '');
    button.dataset.moduleId = String(memory.moduleId || '');
    button.classList.remove('is-unavailable');
    button.querySelector('.cafasso-school-resume__kicker').textContent = progress >= 100 ? 'Revisar' : progress > 0 ? 'Continuar' : 'Empezar';
    button.querySelector('.cafasso-school-resume__title').textContent = title;
    button.querySelector('.cafasso-school-resume__meta').textContent = progress >= 100 ? 'Camino completado' : progress > 0 ? `${progress}% · retomá tu último paso` : 'Tu primer paso está pronto';
    button.setAttribute('aria-label', `${progress > 0 && progress < 100 ? 'Continuar' : progress >= 100 ? 'Revisar' : 'Empezar'} ${title}`);
  }

  function rememberInteractions() {
    document.addEventListener('click', event => {
      const course = event.target.closest?.('[data-school-course]');
      if (course?.dataset?.schoolCourse) {
        writeMemory({ courseId:String(course.dataset.schoolCourse), moduleId:'' });
        return;
      }
      const module = event.target.closest?.('[data-school-module]');
      if (module?.dataset?.schoolModule) {
        writeMemory({ moduleId:String(module.dataset.schoolModule) });
      }
    }, true);
  }

  function restoreModule(moduleId, attempts = 0) {
    const panel = document.querySelector('.cafasso-school-map-panel:not([hidden])');
    if (panel) {
      let target = null;
      if (moduleId) {
        target = [...panel.querySelectorAll('[data-school-module]:not(:disabled)')].find(item => String(item.dataset.schoolModule || '') === moduleId);
      }
      target ||= panel.querySelector('.cafasso-school-module.is-current:not(:disabled)');
      if (target) {
        target.click();
        target.focus({ preventScroll:true });
        return;
      }
    }
    if (attempts < 45) setTimeout(() => restoreModule(moduleId, attempts + 1), 90);
  }

  function activate(button) {
    const courseId = String(button.dataset.courseId || '');
    const moduleId = String(button.dataset.moduleId || '');
    const target = courseButtons().find(item => String(item.dataset.schoolCourse || '') === courseId);
    if (!target) return;
    button.classList.add('is-opening');
    writeMemory({ courseId, moduleId });
    target.click();
    restoreModule(moduleId);
    setTimeout(() => button.classList.remove('is-opening'), 520);
  }

  function boot() {
    const school = document.querySelector('.cafasso-escuela');
    if (!school || school.dataset.schoolResumeReady === '1') return false;
    school.dataset.schoolResumeReady = '1';
    ensureStyles();
    rememberInteractions();
    const notebook = mount(school);
    notebook.addEventListener('click', () => activate(notebook));
    hydrate(notebook);
    return true;
  }

  let tries = 0;
  const wait = () => {
    if (boot()) return;
    tries += 1;
    if (tries < 35) setTimeout(wait, 80);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wait, { once:true });
  else wait();
})();
