(() => {
  const params = new URLSearchParams(location.search);
  const currentSpace = params.get('space') || 'house';
  const NAV_KEY = 'cafassoSpaceTransition';

  function rememberSpaceTransition(event) {
    const target = event.target instanceof Element ? event.target.closest('[data-space]') : null;
    if (!target) return;
    const to = target.dataset.space || 'house';
    try {
      sessionStorage.setItem(NAV_KEY, JSON.stringify({
        from: currentSpace,
        to,
        at: Date.now()
      }));
    } catch (error) {}
  }

  if (!window.__cafassoSpaceTransitionTrackerInstalled) {
    window.__cafassoSpaceTransitionTrackerInstalled = true;
    document.addEventListener('click', rememberSpaceTransition, true);
  }

  if (currentSpace !== 'escuela') return;
  if (window.__cafassoSchoolImmersionInstalled) return;
  window.__cafassoSchoolImmersionInstalled = true;

  const STYLE_ID = 'cafassoSchoolImmersionStyles';

  function json(storage, key) {
    try { return JSON.parse(storage.getItem(key) || 'null'); }
    catch (error) { return null; }
  }

  function userName() {
    const user = json(localStorage, 'cafassoSession')?.user || {};
    const raw = String(user.name || user.nombre || '').trim();
    if (!raw) return '';
    return raw.split(/\s+/)[0] || raw;
  }

  function cameFromPatio() {
    try {
      const nav = json(sessionStorage, NAV_KEY);
      const age = Date.now() - Number(nav?.at || 0);
      if (nav?.from === 'patio' && nav?.to === 'escuela' && age >= 0 && age < 30000) return true;
    } catch (error) {}

    try {
      if (!document.referrer) return false;
      const previous = new URL(document.referrer);
      return previous.origin === location.origin &&
        previous.pathname === location.pathname &&
        previous.searchParams.get('space') === 'patio';
    } catch (error) {
      return false;
    }
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-escuela .cafasso-school-board--screen{transition:filter .42s ease,box-shadow .42s ease}
      .cafasso-escuela .cafasso-school-board--screen.cafasso-school-screen-booting{
        filter:brightness(.78) saturate(.76);
        box-shadow:
          inset 0 0 0 1px rgba(196,228,238,.08),
          inset 0 0 48px rgba(0,0,0,.62),
          0 2px 5px rgba(0,0,0,.38)!important;
      }
      .cafasso-escuela .cafasso-school-board--screen.cafasso-school-screen-booting > :not(.cafasso-school-screen-boot){
        opacity:0!important;
        pointer-events:none!important;
      }
      .cafasso-school-screen-boot{
        position:absolute;inset:0;z-index:30;display:grid;place-items:center;padding:8%;
        background:
          radial-gradient(circle at 50% 45%,rgba(80,145,160,.10),transparent 38%),
          linear-gradient(180deg,rgba(5,17,23,.985),rgba(5,14,19,.995));
        color:#eff8f9;text-align:center;opacity:1;transition:opacity .38s ease;
      }
      .cafasso-school-screen-boot.is-leaving{opacity:0}
      .cafasso-school-screen-boot__inner{transform:translateY(4%);opacity:0;transition:opacity .34s ease,transform .42s ease}
      .cafasso-school-screen-boot.is-ready .cafasso-school-screen-boot__inner{opacity:1;transform:translateY(0)}
      .cafasso-school-screen-boot__mark{
        display:grid;place-items:center;width:clamp(23px,2.2vw,36px);height:clamp(23px,2.2vw,36px);margin:0 auto 7px;
        border:1px solid rgba(190,224,235,.32);border-radius:50%;color:#cfe9ef;
        font:700 clamp(10px,.8vw,14px)/1 Georgia,serif;box-shadow:inset 0 0 13px rgba(133,201,217,.06)
      }
      .cafasso-school-screen-boot__kicker{
        color:#9ecbd5;font:800 clamp(6px,.48vw,9px)/1.1 Inter,system-ui,sans-serif;
        letter-spacing:.16em;text-transform:uppercase;
      }
      .cafasso-school-screen-boot__title{
        margin:5px 0 0;color:#fff;font:500 clamp(13px,1.2vw,22px)/1.08 Georgia,serif;
        text-shadow:0 2px 5px rgba(0,0,0,.65)
      }
      .cafasso-school-screen-boot__line{
        width:0;height:1px;margin:8px auto 0;background:linear-gradient(90deg,transparent,#b7dce5,transparent);
        opacity:.64;transition:width .58s ease .16s;
      }
      .cafasso-school-screen-boot.is-ready .cafasso-school-screen-boot__line{width:72%}

      .cafasso-escuela .cafasso-school-resume{isolation:isolate}
      .cafasso-escuela .cafasso-school-resume:before{
        content:"";position:absolute;z-index:-1;left:-18%;right:-18%;top:-34%;bottom:-31%;
        border-radius:50%;pointer-events:none;opacity:0;
        background:radial-gradient(ellipse at center,rgba(247,211,133,.20),rgba(247,211,133,.07) 38%,transparent 70%);
        filter:blur(9px);transform:scale(.9);transition:opacity .6s ease,transform .6s ease;
      }
      .cafasso-escuela .cafasso-school-resume.cafasso-school-resume-ready:before{
        opacity:1;transform:scale(1);
      }
      .cafasso-escuela .cafasso-school-resume.cafasso-school-resume-ready{
        animation:cafassoSchoolResumeBreath 3.8s ease-in-out 1.2s 2;
      }
      @keyframes cafassoSchoolResumeBreath{
        0%,100%{filter:drop-shadow(0 10px 7px rgba(0,0,0,.5))}
        50%{filter:drop-shadow(0 12px 9px rgba(0,0,0,.54)) brightness(1.035)}
      }

      @media(max-width:760px){
        .cafasso-school-screen-boot{padding:6%}
        .cafasso-school-screen-boot__mark{margin-bottom:4px}
        .cafasso-school-screen-boot__title{margin-top:3px}
        .cafasso-school-screen-boot__line{margin-top:5px}
      }
      @media(prefers-reduced-motion:reduce){
        .cafasso-school-screen-boot,.cafasso-school-screen-boot__inner,.cafasso-school-screen-boot__line,
        .cafasso-escuela .cafasso-school-resume:before{transition:none!important}
        .cafasso-escuela .cafasso-school-resume.cafasso-school-resume-ready{animation:none!important}
      }
    `;
    document.head.appendChild(style);
  }

  function illuminateResume() {
    let attempts = 0;
    const find = () => {
      const resume = document.querySelector('.cafasso-school-resume:not(.is-unavailable)');
      if (resume) {
        resume.classList.add('cafasso-school-resume-ready');
        return;
      }
      if (attempts++ < 45) setTimeout(find, 100);
    };
    find();
  }

  function bootScreen() {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reduced || !cameFromPatio()) {
      illuminateResume();
      return;
    }

    let attempts = 0;
    const find = () => {
      const screen = document.querySelector('.cafasso-school-board--screen');
      if (!screen) {
        if (attempts++ < 45) setTimeout(find, 80);
        return;
      }
      if (screen.querySelector('.cafasso-school-screen-boot')) return;

      const name = userName();
      const boot = document.createElement('div');
      boot.className = 'cafasso-school-screen-boot';
      boot.setAttribute('aria-hidden','true');
      boot.innerHTML = `
        <div class="cafasso-school-screen-boot__inner">
          <span class="cafasso-school-screen-boot__mark">C</span>
          <div class="cafasso-school-screen-boot__kicker">CAFASSO · Escuela</div>
          <div class="cafasso-school-screen-boot__title">${name ? `Buen encuentro, ${name}` : 'Tu camino de formación'}</div>
          <div class="cafasso-school-screen-boot__line"></div>
        </div>`;
      screen.classList.add('cafasso-school-screen-booting');
      screen.appendChild(boot);

      requestAnimationFrame(() => boot.classList.add('is-ready'));

      setTimeout(() => {
        boot.classList.add('is-leaving');
        screen.classList.remove('cafasso-school-screen-booting');
      }, 1180);
      setTimeout(() => boot.remove(), 1580);
      setTimeout(illuminateResume, 1050);
    };
    find();
  }

  ensureStyles();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootScreen, { once:true });
  else bootScreen();
})();