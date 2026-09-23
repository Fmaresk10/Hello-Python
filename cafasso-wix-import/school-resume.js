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
      .cafasso-school-resume{
        position:absolute;z-index:9;right:27.5%;bottom:9.4%;
        width:180px;height:118px;padding:0;border:0;background:transparent;
        cursor:pointer;filter:drop-shadow(0 10px 8px rgba(0,0,0,.40));
        transform:rotate(-2deg);
        transition:transform .22s ease,filter .22s ease,opacity .22s ease;
      }
      .cafasso-school-resume:hover{
        transform:rotate(-1.4deg) translateY(-2px);
        filter:drop-shadow(0 12px 9px rgba(0,0,0,.46));
      }
      .cafasso-school-resume:focus-visible{outline:2px solid rgba(242,201,90,.86);outline-offset:6px;border-radius:8px}
      .cafasso-school-resume.is-opening{transform:rotate(-1deg) translateY(-3px);opacity:1}
      .cafasso-school-resume.is-unavailable{opacity:.82;pointer-events:none;filter:drop-shadow(0 9px 7px rgba(0,0,0,.35)) saturate(.9)}

      /* Objeto fotográfico real del Media Manager de Wix. */
      .cafasso-school-resume__book{
        position:absolute;inset:-8% -8% -10% -8%;
        overflow:visible;border:0!important;border-radius:0!important;
        background:url("https://static.wixstatic.com/media/47bf07_20750dc35c6f4678b865413ce34ec1fe~mv2.png") center/contain no-repeat!important;
        box-shadow:none!important;
        transform:perspective(900px) rotateX(4deg) rotateZ(-1.2deg);
        transform-origin:50% 75%;
        opacity:.98;
        mix-blend-mode:multiply;
        filter:saturate(.90) contrast(1.02) brightness(.98);
      }
      .cafasso-school-resume__book:before,
      .cafasso-school-resume__book:after{display:none!important}

      /* Solo una pequeña etiqueta física: la información completa sigue en aria-label. */
      .cafasso-school-resume__label{
        position:absolute;
        left:auto;right:8px;top:12px;
        width:auto;min-width:58px;min-height:0;
        padding:5px 7px 4px;
        border:1px solid rgba(104,78,48,.48);
        border-radius:2px;
        background:linear-gradient(180deg,rgba(244,235,212,.96),rgba(222,207,174,.95));
        box-shadow:0 2px 4px rgba(31,20,12,.22),inset 0 1px rgba(255,255,255,.5);
        color:#3c3025;text-align:center;
        transform:rotate(1deg);
        opacity:.94;
        pointer-events:none;
      }
      .cafasso-school-resume__kicker{
        display:block;color:#5b4531;
        font:800 7px/1 Inter,system-ui,sans-serif;
        letter-spacing:.11em;text-transform:uppercase;text-shadow:none;
      }
      .cafasso-school-resume__title,
      .cafasso-school-resume__meta{
        position:absolute!important;width:1px!important;height:1px!important;
        padding:0!important;margin:-1px!important;overflow:hidden!important;
        clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important;
      }
      .cafasso-school-resume__pencil{display:none!important}

      @media(max-width:760px){
        .cafasso-school-resume{right:22%;bottom:9.5%;width:128px;height:86px}
        .cafasso-school-resume__label{right:6px;top:8px;min-width:48px;padding:4px 5px 3px}
        .cafasso-school-resume__kicker{font-size:5.8px}
      }
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

  function buttonProgress(button) {
    const text = button?.querySelector('.cafasso-school-course__progress')?.textContent?.trim() || '0%';
    return Number.parseInt(text, 10) || 0;
  }

  function chooseCourse() {
    const buttons = courseButtons();
    if (!buttons.length) return null;
    const pending = buttons.filter(button => buttonProgress(button) < 100);
    if (!pending.length) return null;
    const memory = readMemory();
    const remembered = pending.find(button => String(button.dataset.schoolCourse || '') === String(memory.courseId || ''));
    if (remembered) return remembered;
    return pending.find(button => /Seguí desde donde quedaste/i.test(button.textContent || '')) || pending[0];
  }

  function hydrate(button, attempts = 0) {
    const buttons = courseButtons();
    const target = chooseCourse();
    if (!target) {
      if (!buttons.length && attempts < 45) {
        setTimeout(() => hydrate(button, attempts + 1), 100);
        return;
      }
      if (buttons.length) {
        button.dataset.courseId = '';
        button.dataset.moduleId = '';
        button.classList.add('is-unavailable');
        button.querySelector('.cafasso-school-resume__kicker').textContent = 'Al día';
        button.querySelector('.cafasso-school-resume__title').textContent = 'Camino completado';
        button.querySelector('.cafasso-school-resume__meta').textContent = 'No tenés recorridos pendientes';
        button.setAttribute('aria-label', 'Camino al día. No tenés recorridos pendientes.');
      }
      return;
    }
    const title = target.querySelector('strong')?.textContent?.trim() || 'Curso';
    const progress = buttonProgress(target);
    const memory = readMemory();
    button.dataset.courseId = String(target.dataset.schoolCourse || '');
    button.dataset.moduleId = String(memory.courseId || '') === String(target.dataset.schoolCourse || '') ? String(memory.moduleId || '') : '';
    button.classList.remove('is-unavailable');
    button.querySelector('.cafasso-school-resume__kicker').textContent = progress > 0 ? 'Continuar' : 'Empezar';
    button.querySelector('.cafasso-school-resume__title').textContent = title;
    button.querySelector('.cafasso-school-resume__meta').textContent = progress > 0 ? `${progress}% · retomá tu último paso` : 'Tu primer paso está pronto';
    button.setAttribute('aria-label', `${progress > 0 ? 'Continuar' : 'Empezar'} ${title}`);
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
