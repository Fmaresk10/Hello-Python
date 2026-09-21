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
      .cafasso-escuela .cafasso-school-board--screen{
        transition:filter .55s ease,box-shadow .55s ease;
      }
      .cafasso-escuela .cafasso-school-board--screen.cafasso-school-screen-booting{
        filter:brightness(.58) saturate(.62);
        box-shadow:
          0 0 0 .09vw rgba(45,49,51,.68),
          0 .24vw .62vw rgba(0,0,0,.42),
          inset 0 0 2vw rgba(0,0,0,.82)!important;
      }
      .cafasso-escuela .cafasso-school-board--screen.cafasso-school-screen-booting > :not(.cafasso-school-screen-boot){
        opacity:0!important;
        pointer-events:none!important;
      }
      .cafasso-school-screen-boot{
        position:absolute;inset:0;z-index:30;
        display:grid;place-items:center;padding:8%;
        background:
          radial-gradient(ellipse 55% 38% at 50% 48%,rgba(72,126,139,.055),transparent 72%),
          linear-gradient(180deg,#030709,#020506);
        color:#eff5f6;text-align:center;
        opacity:1;transition:opacity .48s ease;
      }
      .cafasso-school-screen-boot:before{
        content:"";position:absolute;left:18%;right:18%;top:50%;height:1px;
        background:linear-gradient(90deg,transparent,rgba(151,207,219,.34),transparent);
        opacity:0;transform:scaleX(.15);
        transition:opacity .48s ease .12s,transform .72s cubic-bezier(.2,.75,.2,1) .12s;
      }
      .cafasso-school-screen-boot.is-ready:before{opacity:.58;transform:scaleX(1)}
      .cafasso-school-screen-boot.is-leaving{opacity:0}
      .cafasso-school-screen-boot__inner{
        position:relative;z-index:2;
        transform:translateY(2px);opacity:0;
        transition:opacity .58s ease .34s,transform .58s ease .34s;
      }
      .cafasso-school-screen-boot.is-ready .cafasso-school-screen-boot__inner{opacity:1;transform:translateY(0)}
      .cafasso-school-screen-boot__mark{
        display:grid;place-items:center;
        width:clamp(20px,1.55vw,28px);height:clamp(20px,1.55vw,28px);
        margin:0 auto 8px;
        border:1px solid rgba(177,213,221,.24);border-radius:50%;
        color:rgba(213,231,235,.8);
        font:700 clamp(8px,.58vw,10px)/1 Inter,system-ui,sans-serif;
        box-shadow:none;
      }
      .cafasso-school-screen-boot__kicker{
        color:rgba(151,196,206,.72);
        font:700 clamp(6px,.42vw,8px)/1.1 Inter,system-ui,sans-serif;
        letter-spacing:.16em;text-transform:uppercase;
      }
      .cafasso-school-screen-boot__title{
        margin:6px 0 0;color:#f5f8f9;
        font:500 clamp(12px,.92vw,17px)/1.12 Inter,system-ui,sans-serif;
        letter-spacing:-.015em;text-shadow:none;
      }
      .cafasso-school-screen-boot__line{display:none!important}
      @media(max-width:760px){
        .cafasso-school-screen-boot{padding:6%}
        .cafasso-school-screen-boot__mark{margin-bottom:5px}
        .cafasso-school-screen-boot__title{margin-top:4px}
      }
      @media(prefers-reduced-motion:reduce){
        .cafasso-school-screen-boot,.cafasso-school-screen-boot__inner,
        .cafasso-school-screen-boot:before{
          transition:none!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function bootScreen() {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reduced || !cameFromPatio()) return;

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

      setTimeout(() => boot.classList.add('is-ready'), 240);

      setTimeout(() => {
        boot.classList.add('is-leaving');
        screen.classList.remove('cafasso-school-screen-booting');
      }, 2050);
      setTimeout(() => boot.remove(), 2520);
    };
    find();
  }

  ensureStyles();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootScreen, { once:true });
  else bootScreen();
})();