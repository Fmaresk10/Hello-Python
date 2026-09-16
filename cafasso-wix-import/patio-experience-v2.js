(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('space') !== 'patio') return;
  if (window.__cafassoPatioExperienceInstalled) return;
  window.__cafassoPatioExperienceInstalled = true;

  const STYLE_ID = 'cafassoPatioExperienceStyles';
  const SESSION_HINT_KEY = 'cafasso-patio-hint-v1';
  const DESTINATIONS = {
    house: { main: 'Casa', sub: 'volver al origen', aria: 'Volver a la Casa', image: './assets/cafasso-casa-interior-v2.jpg' },
    escuela: { main: 'Escuela', sub: 'seguir aprendiendo', aria: 'Entrar a la Escuela', image: 'https://static.wixstatic.com/media/47bf07_481618e0256044f9b31ae360a03a9169~mv2.png' },
    parroquia: { main: 'Parroquia', sub: 'hacer silencio', aria: 'Entrar a la Parroquia', image: 'https://static.wixstatic.com/media/47bf07_b411bebc79644a0092920abb58a2f56d~mv2.png' }
  };

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-patio{background:#233b37;isolation:isolate}
      .cafasso-patio:before{content:"";position:absolute;inset:-6%;z-index:1;pointer-events:none;background:radial-gradient(ellipse 34% 31% at 62% 18%,rgba(255,221,143,.18),transparent 68%),radial-gradient(ellipse 30% 25% at 30% 66%,rgba(246,205,120,.07),transparent 70%);mix-blend-mode:screen;animation:cafassoPatioSun 8s ease-in-out infinite alternate}
      .cafasso-patio:after{content:"";position:absolute;inset:0;z-index:2;pointer-events:none;background:linear-gradient(180deg,rgba(3,17,18,.03),transparent 37%,rgba(4,17,17,.14));box-shadow:inset 0 0 120px rgba(2,15,15,.12)}
      @keyframes cafassoPatioSun{from{opacity:.48;transform:translate3d(-1.2%,1%,0) scale(1)}to{opacity:.82;transform:translate3d(1.3%,-1%,0) scale(1.025)}}
      .cafasso-patio .cafasso-space-link{z-index:6;min-width:116px;padding:9px 13px 8px;border:1px solid rgba(230,197,126,.52);border-radius:3px;background:linear-gradient(180deg,rgba(62,48,34,.62),rgba(25,37,34,.78));box-shadow:0 8px 18px rgba(0,0,0,.28),inset 0 1px rgba(255,246,215,.08);backdrop-filter:blur(3px);text-align:left;transform-origin:center;transition:transform .2s ease,filter .2s ease,box-shadow .2s ease,background .2s ease}
      .cafasso-patio .cafasso-space-link:hover{transform:translateY(-3px) scale(1.025);filter:brightness(1.05);background:linear-gradient(180deg,rgba(78,58,38,.72),rgba(28,44,39,.9));box-shadow:0 12px 24px rgba(0,0,0,.34),0 0 20px rgba(240,201,114,.10),inset 0 1px rgba(255,246,215,.11)}
      .cafasso-patio .cafasso-space-link.is-patio-leaving{pointer-events:none;transform:translateY(-1px) scale(.985);filter:brightness(1.12)}
      .cafasso-patio-link__main{display:block;color:#fff7e5;font:600 14px/1.05 Georgia,serif;letter-spacing:.035em}
      .cafasso-patio-link__sub{display:block;margin-top:4px;color:rgba(255,244,217,.60);font:800 6.8px/1 Inter,system-ui,sans-serif;letter-spacing:.13em;text-transform:uppercase}
      .cafasso-patio-intro{position:absolute;left:50%;bottom:5.5%;z-index:8;width:min(560px,82vw);padding:0 18px 12px;border-bottom:1px solid rgba(235,199,117,.34);color:#fff8e7;text-align:center;text-shadow:0 3px 16px rgba(0,0,0,.72);pointer-events:none;opacity:0;transform:translate(-50%,9px);transition:opacity .75s ease,transform .75s ease}
      .cafasso-patio-intro.is-visible{opacity:1;transform:translate(-50%,0)}
      .cafasso-patio-intro.is-leaving{opacity:0;transform:translate(-50%,-5px)}
      .cafasso-patio-intro strong{display:block;font:400 clamp(24px,2.7vw,36px)/1.08 Georgia,serif;letter-spacing:-.012em}
      .cafasso-patio-intro span{display:block;margin-top:7px;color:rgba(255,247,226,.68);font:700 9px/1.3 Inter,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase}
      .cafasso-patio-transition{position:absolute;inset:0;z-index:40;pointer-events:none;opacity:0;background:radial-gradient(ellipse 34% 50% at 55% 45%,rgba(255,220,151,.12),transparent 70%),rgba(5,17,17,.08);transition:opacity .28s ease}
      .cafasso-patio-transition:after{content:"";position:absolute;inset:0;background:#0a1716;opacity:0;transition:opacity .3s ease .03s}
      .cafasso-patio-transition.is-active{opacity:1}.cafasso-patio-transition.is-active:after{opacity:.84}
      @media(max-width:680px){.cafasso-patio .cafasso-space-link{min-width:94px;padding:8px 10px 7px}.cafasso-patio-link__main{font-size:12px}.cafasso-patio-link__sub{font-size:5.5px}.cafasso-patio-intro{bottom:3.8%;width:88vw;padding-bottom:10px}.cafasso-patio-intro strong{font-size:24px}.cafasso-patio-intro span{font-size:7px}}
      @media(prefers-reduced-motion:reduce){.cafasso-patio:before{animation:none!important}.cafasso-patio .cafasso-space-link,.cafasso-patio-intro,.cafasso-patio-transition,.cafasso-patio-transition:after{transition:none!important}}
    `;
    document.head.appendChild(style);
  }

  function showIntro(patio) {
    try {
      if (sessionStorage.getItem(SESSION_HINT_KEY) === 'seen') return;
      sessionStorage.setItem(SESSION_HINT_KEY, 'seen');
    } catch (error) {}
    const intro = document.createElement('div');
    intro.className = 'cafasso-patio-intro';
    intro.innerHTML = '<strong>El Patio es encuentro.</strong><span>Acá el camino se cruza con otros caminos.</span>';
    patio.appendChild(intro);
    requestAnimationFrame(() => intro.classList.add('is-visible'));
    setTimeout(() => intro.classList.add('is-leaving'), 3600);
    setTimeout(() => intro.remove(), 4450);
  }

  function preloadDestinations() {
    Object.values(DESTINATIONS).forEach(item => {
      if (!item.image) return;
      const image = new Image();
      image.decoding = 'async';
      image.src = item.image;
    });
  }

  function boot() {
    const patio = document.querySelector('.cafasso-patio');
    if (!patio || patio.dataset.patioExperienceReady === '1') return false;
    patio.dataset.patioExperienceReady = '1';
    ensureStyles();

    const transition = document.createElement('div');
    transition.className = 'cafasso-patio-transition';
    transition.setAttribute('aria-hidden', 'true');
    patio.appendChild(transition);

    Object.entries(DESTINATIONS).forEach(([space, meta]) => {
      const selector = space === 'house' ? '.cafasso-space-link--patio-home[data-space="house"]' : `.cafasso-space-link[data-space="${space}"]`;
      const button = patio.querySelector(selector);
      if (!button) return;
      button.dataset.patioDestination = space;
      button.setAttribute('aria-label', meta.aria);
      button.innerHTML = `<span class="cafasso-patio-link__main">${meta.main}</span><span class="cafasso-patio-link__sub">${meta.sub}</span>`;
    });

    preloadDestinations();
    showIntro(patio);

    const startAmbient = () => window.CafassoDynamicAmbience?.start?.();
    patio.addEventListener('pointerdown', startAmbient, { once: true, passive: true });
    patio.addEventListener('keydown', startAmbient, { once: true });

    patio.querySelectorAll('[data-patio-destination]').forEach(button => {
      button.addEventListener('click', event => {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (button.classList.contains('is-patio-leaving')) return;
        button.classList.add('is-patio-leaving');
        transition.classList.add('is-active');
        window.CafassoDynamicAmbience?.fadeOut?.(.24);
        const next = new URL(location.href);
        const target = button.dataset.patioDestination;
        if (target === 'house') next.searchParams.delete('space');
        else next.searchParams.set('space', target);
        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
        setTimeout(() => { location.href = next.toString(); }, reduced ? 80 : 330);
      }, true);
    });
    return true;
  }

  let attempts = 0;
  const wait = () => {
    if (boot()) return;
    if (attempts < 30) {
      attempts += 1;
      setTimeout(wait, 80);
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wait, { once: true });
  else wait();
})();
