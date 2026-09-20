(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('space') !== 'parroquia') return;
  if (window.__cafassoMobileParishInstalled) return;
  window.__cafassoMobileParishInstalled = true;

  const STYLE_ID = 'cafassoMobileParishStyles';
  const PAN_KEY = 'cafasso-parish-panorama-v1';
  const ASPECT = 16 / 9;
  const DEFAULT_PROGRESS = .48;

  const SPATIAL_SELECTORS = [
    '.cafasso-parroquia__image',
    '.cafasso-space-link--parroquia-patio[data-space="patio"]',
    '.cafasso-parish-lectionary',
    '.cafasso-parish-songbook',
    '.cafasso-parish-candle',
    '.cafasso-parish-secret',
    '.cafasso-corazon-huella',
    '.cafasso-calendar-layer'
  ];

  let parish = null;
  let scene = null;
  let observer = null;
  let currentPan = 0;
  let progress = DEFAULT_PROGRESS;
  let dragging = false;
  let moved = false;
  let pointerId = null;
  let startX = 0;
  let startPan = 0;
  let lastX = 0;
  let lastT = 0;
  let velocity = 0;
  let suppressClickUntil = 0;
  let inertiaRaf = 0;

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      html.cafasso-mobile body.cafasso-mobile-parish-active{
        overflow:hidden!important;
        overscroll-behavior:none;
      }

      html.cafasso-mobile .cafasso-parroquia{
        position:fixed!important;
        inset:0!important;
        width:100vw!important;
        height:var(--cafasso-vh)!important;
        overflow:hidden!important;
        background:#151b18!important;
        isolation:isolate;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-parroquia{
        touch-action:none!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-parish-panorama{
        position:absolute;
        left:0;
        top:0;
        z-index:1;
        width:var(--cafasso-parish-scene-width,177.78vh);
        min-width:100vw;
        height:var(--cafasso-vh);
        overflow:hidden;
        transform:translate3d(var(--cafasso-parish-pan-x,0px),0,0);
        will-change:transform;
        touch-action:none;
        user-select:none;
        -webkit-user-select:none;
        cursor:grab;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-parish-panorama.is-dragging{
        cursor:grabbing;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-parish-panorama .cafasso-parroquia__image{
        position:absolute!important;
        inset:0!important;
        z-index:0!important;
        display:block!important;
        width:100%!important;
        height:100%!important;
        max-width:none!important;
        object-fit:cover!important;
        object-position:center!important;
        transform:none!important;
        filter:none!important;
        pointer-events:none!important;
      }

      /* Salida al Patio: coordenada original 16:9. */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-parish-panorama .cafasso-space-link--parroquia-patio{
        left:calc(50% - 8cm)!important;
        right:auto!important;
        top:47%!important;
        bottom:auto!important;
        min-width:108px!important;
        min-height:44px!important;
        padding:9px 13px 8px!important;
        transform:translate(-50%,-50%)!important;
        z-index:13!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-parish-panorama .cafasso-space-link--parroquia-patio:hover{
        transform:translate(-50%,calc(-50% - 2px))!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-parish-panorama .cafasso-parish-link__main{
        font-size:14px!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-parish-panorama .cafasso-parish-link__sub{
        font-size:6.7px!important;
      }

      /* Palabra del día: posición final de escritorio. */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-parish-panorama .cafasso-parish-lectionary{
        left:auto!important;
        right:9.25%!important;
        bottom:calc(11.15% + 3cm)!important;
        width:238px!important;
        height:162px!important;
        transform:perspective(820px) rotateX(3deg) rotateZ(1.1deg)!important;
        transform-origin:50% 100%!important;
        z-index:14!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-parish-panorama .cafasso-parish-lectionary:hover{
        transform:perspective(820px) rotateX(2deg) rotateZ(.65deg) translateY(-3px) scale(1.012)!important;
      }

      /* Cancionero físico: vuelve a su coordenada original. */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-parish-panorama .cafasso-parish-songbook{
        left:9.2%!important;
        right:auto!important;
        bottom:12.2%!important;
        width:172px!important;
        height:118px!important;
        transform:perspective(720px) rotateX(7deg) rotateZ(-4deg)!important;
        transform-origin:50% 100%!important;
        z-index:14!important;
      }

      /* Vela: sobre el lado izquierdo del altar, como en escritorio. */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-parish-panorama .cafasso-parish-candle{
        left:47.8%!important;
        right:auto!important;
        bottom:57.2%!important;
        width:92px!important;
        height:166px!important;
        transform:translateX(-50%) perspective(700px) rotateX(1.6deg) scale(.64)!important;
        transform-origin:50% 100%!important;
        z-index:15!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-parish-panorama .cafasso-parish-candle:hover{
        transform:translateX(-50%) perspective(700px) rotateX(1deg) translateY(-2px) scale(.655)!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-parish-panorama .cafasso-parish-candle__wax{
        left:29px!important;
        bottom:43px!important;
        width:35px!important;
        height:80px!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-parish-panorama .cafasso-parish-candle__holder{
        left:15px!important;
        right:15px!important;
        bottom:9px!important;
        height:17px!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-parish-panorama .cafasso-parish-candle__flame{
        left:34px!important;
        bottom:122px!important;
        width:24px!important;
        height:37px!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-parish-panorama .cafasso-parish-candle__glow{
        left:-14px!important;
        right:-14px!important;
        top:2px!important;
        height:128px!important;
      }

      /* Servidor: toalla sobre el altar en su posición original. */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-parish-panorama .cafasso-servidor-cloth{
        left:48.2%!important;
        right:auto!important;
        bottom:30.1%!important;
        width:112px!important;
        height:49px!important;
        transform:translateX(-50%) rotate(-1.8deg)!important;
        z-index:15!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-parish-panorama .cafasso-servidor-cloth__fold{
        left:7px!important;
        right:7px!important;
        top:6px!important;
        height:34px!important;
      }

      /* Secreto y Corazón salesiano. */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-parish-panorama .cafasso-parish-secret{
        left:49.2%!important;
        top:8.2%!important;
        width:8.2%!important;
        height:15%!important;
        min-width:72px!important;
        min-height:72px!important;
        z-index:14!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-parish-panorama .cafasso-corazon-huella{
        left:66.2%!important;
        right:auto!important;
        top:auto!important;
        bottom:18.8%!important;
        width:38px!important;
        height:38px!important;
        font-size:29px!important;
        z-index:14!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-parish-panorama .cafasso-calendar-layer{
        position:absolute!important;
        inset:0!important;
        width:100%!important;
        height:100%!important;
      }

      /* Luz ambiental permanece respecto de la ventana. */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-parroquia:before,
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-parroquia:after{
        position:fixed!important;
        inset:0!important;
        width:100vw!important;
        height:var(--cafasso-vh)!important;
      }

      /* HUD fijo. */
      html.cafasso-mobile body.cafasso-mobile-parish-active .cafasso-level-pill{
        display:none!important;
      }

      html.cafasso-mobile body.cafasso-mobile-parish-active .cafasso-global-counters{
        left:max(8px,calc(var(--cafasso-safe-left) + 6px))!important;
        top:max(8px,calc(var(--cafasso-safe-top) + 6px))!important;
        transform:scale(.92);
        transform-origin:top left;
      }

      html.cafasso-mobile body.cafasso-mobile-parish-active .cafasso-calendar-admin-trigger{
        width:38px!important;
        height:38px!important;
        min-width:38px!important;
        min-height:38px!important;
        right:max(10px,calc(var(--cafasso-safe-right) + 7px))!important;
        bottom:max(10px,calc(var(--cafasso-safe-bottom) + 7px))!important;
        opacity:.68!important;
      }

      /* Intro y transición son capas de pantalla. */
      html.cafasso-mobile .cafasso-parish-intro{
        position:fixed!important;
        left:50%!important;
        bottom:max(54px,calc(var(--cafasso-safe-bottom) + 42px))!important;
        width:min(680px,88vw)!important;
        z-index:2147482000!important;
      }

      html.cafasso-mobile .cafasso-parish-transition{
        position:fixed!important;
        inset:0!important;
        width:100vw!important;
        height:var(--cafasso-vh)!important;
      }

      /* Palabra, canciones, intención, silencio y etapas: interfaz móvil fija. */
      html.cafasso-mobile :is(
        .cafasso-parish-panel,
        .cafasso-songbook-panel,
        .cafasso-candle-intention,
        .cafasso-parish-silence,
        .cafasso-servidor-layer,
        .cafasso-parish-secret-layer,
        .cafasso-corazon-layer
      ){
        position:fixed!important;
        inset:0!important;
        width:100vw!important;
        height:var(--cafasso-vh)!important;
      }

      html.cafasso-mobile :is(
        .cafasso-parish-panel,
        .cafasso-songbook-panel,
        .cafasso-candle-intention,
        .cafasso-servidor-layer,
        .cafasso-parish-secret-layer,
        .cafasso-corazon-layer
      ){
        align-items:flex-end!important;
        justify-content:center!important;
        padding:
          max(10px,var(--cafasso-safe-top))
          max(10px,var(--cafasso-safe-right))
          max(10px,var(--cafasso-safe-bottom))
          max(10px,var(--cafasso-safe-left))!important;
      }

      html.cafasso-mobile :is(
        .cafasso-parish-sheet,
        .cafasso-songbook-sheet,
        .cafasso-candle-intention__sheet,
        .cafasso-servidor-note,
        .cafasso-parish-secret-card,
        .cafasso-corazon-note
      ){
        width:100%!important;
        max-width:none!important;
        max-height:calc(var(--cafasso-vh) - var(--cafasso-safe-top) - 12px)!important;
        overflow:auto!important;
        -webkit-overflow-scrolling:touch;
        border-radius:16px 16px 0 0!important;
        transform:none!important;
        padding-bottom:max(28px,calc(var(--cafasso-safe-bottom) + 18px))!important;
      }

      html.cafasso-mobile :is(
        .cafasso-parish-close,
        .cafasso-songbook-close,
        .cafasso-servidor-close,
        .cafasso-parish-secret-close,
        .cafasso-corazon-close
      ){
        min-width:46px!important;
        min-height:46px!important;
      }

      html.cafasso-mobile :is(
        .cafasso-servidor-toast,
        .cafasso-parish-secret-toast,
        .cafasso-corazon-toast,
        .cafasso-parish-candle-message
      ){
        left:50%!important;
        right:auto!important;
        bottom:max(62px,calc(var(--cafasso-safe-bottom) + 48px))!important;
        max-width:calc(100vw - 30px)!important;
        text-align:center;
      }

      html.cafasso-mobile .cafasso-parish-silence{
        padding:
          max(20px,var(--cafasso-safe-top))
          max(20px,var(--cafasso-safe-right))
          max(20px,var(--cafasso-safe-bottom))
          max(20px,var(--cafasso-safe-left))!important;
      }

      /* Horizontal: entra la iglesia completa. */
      html.cafasso-mobile.cafasso-mobile-landscape .cafasso-parish-panorama{
        width:100vw!important;
        height:var(--cafasso-vh)!important;
        transform:none!important;
        cursor:default;
      }

      html.cafasso-mobile.cafasso-mobile-landscape .cafasso-parish-panorama .cafasso-parroquia__image{
        width:100%!important;
        height:100%!important;
        object-fit:cover!important;
      }

      @media(prefers-reduced-motion:reduce){
        html.cafasso-mobile .cafasso-parish-panorama{
          transition:none!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function isPortraitMobile() {
    const root = document.documentElement;
    return root.classList.contains('cafasso-mobile') && root.classList.contains('cafasso-mobile-portrait');
  }

  function viewportSize() {
    const vv = window.visualViewport;
    return {
      width: Math.max(1, Math.round(vv?.width || window.innerWidth || 1)),
      height: Math.max(1, Math.round(vv?.height || window.innerHeight || 1))
    };
  }

  function clampPan(value) {
    if (!scene) return 0;
    const { width } = viewportSize();
    const sceneWidth = scene.getBoundingClientRect().width || width;
    const min = Math.min(0, width - sceneWidth);
    return Math.max(min, Math.min(0, value));
  }

  function rangeSize() {
    if (!scene) return 0;
    const { width } = viewportSize();
    return Math.max(0, (scene.getBoundingClientRect().width || width) - width);
  }

  function setPan(value, save = false) {
    if (!scene) return;
    currentPan = clampPan(value);
    scene.style.setProperty('--cafasso-parish-pan-x', `${currentPan}px`);
    const range = rangeSize();
    progress = range > 0 ? Math.max(0, Math.min(1, -currentPan / range)) : 0;
    if (save) {
      try { sessionStorage.setItem(PAN_KEY, String(progress)); } catch (error) {}
    }
  }

  function readProgress() {
    try {
      const value = Number(sessionStorage.getItem(PAN_KEY));
      if (Number.isFinite(value) && value >= 0 && value <= 1) return value;
    } catch (error) {}
    return DEFAULT_PROGRESS;
  }

  function applySceneSize() {
    if (!scene) return;
    const size = viewportSize();
    if (isPortraitMobile()) {
      const sceneWidth = Math.max(size.width, Math.round(size.height * ASPECT));
      scene.style.setProperty('--cafasso-parish-scene-width', `${sceneWidth}px`);
      const range = Math.max(0, sceneWidth - size.width);
      setPan(-range * progress);
    } else {
      scene.style.setProperty('--cafasso-parish-scene-width', `${size.width}px`);
      setPan(0);
    }
  }

  function moveSpatialElements() {
    if (!parish || !scene) return;
    SPATIAL_SELECTORS.forEach(selector => {
      parish.querySelectorAll(selector).forEach(node => {
        if (node === scene || scene.contains(node)) return;
        scene.appendChild(node);
      });
    });
  }

  function stopInertia() {
    if (inertiaRaf) cancelAnimationFrame(inertiaRaf);
    inertiaRaf = 0;
  }

  function startInertia(initialVelocity) {
    stopInertia();
    let v = initialVelocity;
    let previous = performance.now();

    const tick = now => {
      const dt = Math.min(32, Math.max(1, now - previous));
      previous = now;
      const before = currentPan;
      setPan(currentPan + v * dt);
      const hitEdge = Math.abs(currentPan - before) < .01;
      v *= Math.pow(.90, dt / 16);
      if (hitEdge || Math.abs(v) < .025) {
        setPan(currentPan, true);
        inertiaRaf = 0;
        return;
      }
      inertiaRaf = requestAnimationFrame(tick);
    };

    if (Math.abs(v) >= .04) inertiaRaf = requestAnimationFrame(tick);
    else setPan(currentPan, true);
  }

  function installDrag() {
    if (!parish || parish.dataset.cafassoPanInstalled === '1') return;
    parish.dataset.cafassoPanInstalled = '1';

    parish.addEventListener('pointerdown', event => {
      if (!isPortraitMobile()) return;
      if (event.button != null && event.button !== 0) return;
      if (event.target.closest('.cafasso-parish-panel,.cafasso-songbook-panel,.cafasso-candle-intention,.cafasso-parish-silence,.cafasso-servidor-layer,.cafasso-parish-secret-layer,.cafasso-corazon-layer,[role="dialog"]')) return;

      stopInertia();
      dragging = true;
      moved = false;
      pointerId = event.pointerId;
      startX = event.clientX;
      startPan = currentPan;
      lastX = event.clientX;
      lastT = performance.now();
      velocity = 0;
      scene?.classList.add('is-dragging');
      try { parish.setPointerCapture(pointerId); } catch (error) {}
    }, { passive:true });

    parish.addEventListener('pointermove', event => {
      if (!dragging || event.pointerId !== pointerId || !isPortraitMobile()) return;
      const dx = event.clientX - startX;
      if (Math.abs(dx) > 5) moved = true;
      if (!moved) return;

      event.preventDefault();
      const now = performance.now();
      const dt = Math.max(1, now - lastT);
      velocity = (event.clientX - lastX) / dt;
      lastX = event.clientX;
      lastT = now;
      setPan(startPan + dx);
    }, { passive:false });

    const finish = event => {
      if (!dragging || event.pointerId !== pointerId) return;
      dragging = false;
      scene?.classList.remove('is-dragging');
      try { parish.releasePointerCapture(pointerId); } catch (error) {}
      pointerId = null;

      if (moved) {
        suppressClickUntil = performance.now() + 320;
        startInertia(velocity);
      } else {
        setPan(currentPan, true);
      }
    };

    parish.addEventListener('pointerup', finish, { passive:true });
    parish.addEventListener('pointercancel', finish, { passive:true });

    parish.addEventListener('click', event => {
      if (performance.now() < suppressClickUntil) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);
  }

  function mountPanorama() {
    parish = document.querySelector('.cafasso-parroquia');
    if (!parish) return false;

    ensureStyles();
    document.body.classList.add('cafasso-mobile-parish-active');

    scene = parish.querySelector('.cafasso-parish-panorama');
    if (!scene) {
      scene = document.createElement('div');
      scene.className = 'cafasso-parish-panorama';
      scene.setAttribute('aria-label', 'Parroquia CAFASSO, deslizá horizontalmente para recorrerla');
      parish.insertBefore(scene, parish.firstChild);
    }

    progress = readProgress();
    moveSpatialElements();
    applySceneSize();
    installDrag();

    if (!observer) {
      observer = new MutationObserver(() => {
        moveSpatialElements();
        applySceneSize();
      });
      observer.observe(parish, { childList:true });
    }

    parish.dataset.mobileParishReady = 'panorama';
    return true;
  }

  ensureStyles();

  let attempts = 0;
  const boot = () => {
    if (mountPanorama()) return;
    if (attempts < 50) {
      attempts += 1;
      setTimeout(boot,80);
    }
  };

  const refresh = () => {
    if (!scene || !parish) {
      boot();
      return;
    }
    moveSpatialElements();
    applySceneSize();
  };

  window.addEventListener('resize', refresh, { passive:true });
  window.addEventListener('orientationchange', refresh, { passive:true });
  window.visualViewport?.addEventListener('resize', refresh, { passive:true });
  window.addEventListener('cafasso:mobile-layout', refresh);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();

  window.CafassoParishPanorama = {
    refresh,
    center() {
      progress = .5;
      applySceneSize();
      setPan(currentPan,true);
    },
    get progress() { return progress; }
  };
})();
