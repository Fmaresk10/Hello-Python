(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('space') !== 'patio') return;
  if (window.__cafassoMobilePatioInstalled) return;
  window.__cafassoMobilePatioInstalled = true;

  const STYLE_ID = 'cafassoMobilePatioStyles';
  const PAN_KEY = 'cafasso-patio-panorama-v1';
  const ASPECT = 16 / 9;
  const DEFAULT_PROGRESS = .5;

  const SPATIAL_SELECTORS = [
    '.cafasso-patio__image',
    '.cafasso-space-link--patio-home[data-space="house"]',
    '.cafasso-space-link--patio-escuela[data-space="escuela"]',
    '.cafasso-space-link--patio-parroquia[data-space="parroquia"]',
    '.cafasso-presencia-ball',
    '.cafasso-patio-encounter-alone',
    '.cafasso-patio-secret',
    '.cafasso-corazon-huella',
    '.cafasso-calendar-layer'
  ];

  let patio = null;
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
      html.cafasso-mobile body.cafasso-mobile-patio-active{
        overflow:hidden!important;
        overscroll-behavior:none;
      }

      html.cafasso-mobile .cafasso-patio{
        position:fixed!important;
        inset:0!important;
        width:100vw!important;
        height:var(--cafasso-vh)!important;
        overflow:hidden!important;
        background:#233b37!important;
        isolation:isolate;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-patio{
        touch-action:none!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-patio-panorama{
        position:absolute;
        left:0;
        top:0;
        z-index:1;
        width:var(--cafasso-patio-scene-width,177.78vh);
        min-width:100vw;
        height:var(--cafasso-vh);
        overflow:hidden;
        transform:translate3d(var(--cafasso-patio-pan-x,0px),0,0);
        will-change:transform;
        touch-action:none;
        user-select:none;
        -webkit-user-select:none;
        cursor:grab;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-patio-panorama.is-dragging{
        cursor:grabbing;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-patio-panorama .cafasso-patio__image{
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

      /* Navegación: recuperamos exactamente la geometría del Patio 16:9. */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-patio-panorama .cafasso-space-link--patio-home{
        left:16%!important;
        right:auto!important;
        top:48%!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-patio-panorama .cafasso-space-link--patio-escuela{
        left:auto!important;
        right:9%!important;
        top:9%!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-patio-panorama .cafasso-space-link--patio-parroquia{
        left:70%!important;
        right:auto!important;
        top:58%!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-patio-panorama .cafasso-space-link{
        min-width:116px!important;
        min-height:44px!important;
        padding:9px 13px 8px!important;
        font-size:15px!important;
        z-index:13!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-patio-panorama .cafasso-patio-link__main{
        font-size:14px!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-patio-panorama .cafasso-patio-link__sub{
        font-size:6.8px!important;
      }

      /* Presencia: pelota en su lugar original. */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-patio-panorama .cafasso-presencia-ball{
        left:34.5%!important;
        right:auto!important;
        bottom:8.8%!important;
        width:72px!important;
        height:72px!important;
        z-index:15!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-patio-panorama .cafasso-presencia-ball__body:before{
        width:74px!important;
        height:35px!important;
        left:-9px!important;
        top:16px!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-patio-panorama .cafasso-presencia-ball__body:after{
        width:34px!important;
        height:74px!important;
        left:17px!important;
        top:-8px!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-patio-panorama .cafasso-presencia-ball__seam{
        box-shadow:
          0 -25px 0 -1px rgba(71,38,18,.58),
          0 25px 0 -1px rgba(71,38,18,.58),
          25px 0 0 -1px rgba(71,38,18,.58),
          -25px 0 0 -1px rgba(71,38,18,.58)!important;
      }

      /* Secreto "Estar ahí" en su punto físico original. */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-patio-panorama .cafasso-patio-secret{
        left:48%!important;
        top:40.5%!important;
        width:8.5%!important;
        height:19%!important;
        min-width:54px!important;
        min-height:88px!important;
        z-index:14!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-patio-panorama .cafasso-corazon-huella{
        left:18.5%!important;
        right:auto!important;
        bottom:11.6%!important;
        width:38px!important;
        height:38px!important;
        font-size:29px!important;
        z-index:14!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-patio-panorama .cafasso-calendar-layer{
        position:absolute!important;
        inset:0!important;
        width:100%!important;
        height:100%!important;
      }

      /* El ambiente visual sigue sobre la ventana completa. */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-patio:before,
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-patio:after{
        position:fixed!important;
        inset:0!important;
        width:100vw!important;
        height:var(--cafasso-vh)!important;
      }

      /* HUD fijo: no viaja con el Patio. */
      html.cafasso-mobile body.cafasso-mobile-patio-active .cafasso-level-pill{
        display:none!important;
      }

      html.cafasso-mobile body.cafasso-mobile-patio-active .cafasso-global-counters{
        left:max(8px,calc(var(--cafasso-safe-left) + 6px))!important;
        top:max(8px,calc(var(--cafasso-safe-top) + 6px))!important;
        transform:scale(.92);
        transform-origin:top left;
      }

      html.cafasso-mobile body.cafasso-mobile-patio-active .cafasso-calendar-admin-trigger{
        width:38px!important;
        height:38px!important;
        min-width:38px!important;
        min-height:38px!important;
        right:max(10px,calc(var(--cafasso-safe-right) + 7px))!important;
        bottom:max(10px,calc(var(--cafasso-safe-bottom) + 7px))!important;
        opacity:.68!important;
      }

      /* Intro y transición pertenecen a la pantalla, no al panorama. */
      html.cafasso-mobile .cafasso-patio-intro{
        position:fixed!important;
        left:50%!important;
        bottom:max(54px,calc(var(--cafasso-safe-bottom) + 42px))!important;
        width:min(560px,88vw)!important;
        z-index:2147482000!important;
      }

      html.cafasso-mobile .cafasso-patio-transition{
        position:fixed!important;
        inset:0!important;
        width:100vw!important;
        height:var(--cafasso-vh)!important;
      }

      /* Notas y descubrimientos se abren como bottom sheets. */
      html.cafasso-mobile :is(
        .cafasso-presencia-layer,
        .cafasso-patio-secret-layer,
        .cafasso-corazon-layer
      ){
        position:fixed!important;
        inset:0!important;
        width:100vw!important;
        height:var(--cafasso-vh)!important;
        align-items:flex-end!important;
        justify-content:center!important;
        padding:
          max(10px,var(--cafasso-safe-top))
          max(10px,var(--cafasso-safe-right))
          max(10px,var(--cafasso-safe-bottom))
          max(10px,var(--cafasso-safe-left))!important;
      }

      html.cafasso-mobile :is(
        .cafasso-presencia-note,
        .cafasso-patio-plaque,
        .cafasso-corazon-note
      ){
        width:100%!important;
        max-width:none!important;
        max-height:calc(var(--cafasso-vh) - var(--cafasso-safe-top) - 12px)!important;
        overflow:auto!important;
        -webkit-overflow-scrolling:touch;
        border-radius:16px 16px 0 0!important;
        transform:none!important;
        padding-left:24px!important;
        padding-right:24px!important;
        padding-bottom:max(28px,calc(var(--cafasso-safe-bottom) + 18px))!important;
      }

      html.cafasso-mobile :is(
        .cafasso-presencia-close,
        .cafasso-patio-secret-close,
        .cafasso-corazon-close
      ){
        width:46px!important;
        height:46px!important;
        min-width:46px!important;
        min-height:46px!important;
        display:grid!important;
        place-items:center!important;
      }

      html.cafasso-mobile :is(
        .cafasso-presencia-toast,
        .cafasso-patio-secret-toast,
        .cafasso-corazon-toast
      ){
        left:50%!important;
        right:auto!important;
        bottom:max(62px,calc(var(--cafasso-safe-bottom) + 48px))!important;
        max-width:calc(100vw - 30px)!important;
        text-align:center;
      }

      /* Horizontal: entra el Patio completo. */
      html.cafasso-mobile.cafasso-mobile-landscape .cafasso-patio-panorama{
        width:100vw!important;
        height:var(--cafasso-vh)!important;
        transform:none!important;
        cursor:default;
      }

      html.cafasso-mobile.cafasso-mobile-landscape .cafasso-patio-panorama .cafasso-patio__image{
        width:100%!important;
        height:100%!important;
        object-fit:cover!important;
      }

      @media(prefers-reduced-motion:reduce){
        html.cafasso-mobile .cafasso-patio-panorama{
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
    scene.style.setProperty('--cafasso-patio-pan-x', `${currentPan}px`);
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
      scene.style.setProperty('--cafasso-patio-scene-width', `${sceneWidth}px`);
      const range = Math.max(0, sceneWidth - size.width);
      setPan(-range * progress);
    } else {
      scene.style.setProperty('--cafasso-patio-scene-width', `${size.width}px`);
      setPan(0);
    }
  }

  function moveSpatialElements() {
    if (!patio || !scene) return;
    SPATIAL_SELECTORS.forEach(selector => {
      patio.querySelectorAll(selector).forEach(node => {
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
    if (!patio || patio.dataset.cafassoPanInstalled === '1') return;
    patio.dataset.cafassoPanInstalled = '1';

    patio.addEventListener('pointerdown', event => {
      if (!isPortraitMobile()) return;
      if (event.button != null && event.button !== 0) return;
      if (event.target.closest('.cafasso-presencia-layer,.cafasso-patio-secret-layer,.cafasso-corazon-layer,[role="dialog"]')) return;

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
      try { patio.setPointerCapture(pointerId); } catch (error) {}
    }, { passive:true });

    patio.addEventListener('pointermove', event => {
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
      try { patio.releasePointerCapture(pointerId); } catch (error) {}
      pointerId = null;

      if (moved) {
        suppressClickUntil = performance.now() + 320;
        startInertia(velocity);
      } else {
        setPan(currentPan, true);
      }
    };

    patio.addEventListener('pointerup', finish, { passive:true });
    patio.addEventListener('pointercancel', finish, { passive:true });

    patio.addEventListener('click', event => {
      if (performance.now() < suppressClickUntil) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);
  }

  function mountPanorama() {
    patio = document.querySelector('.cafasso-patio');
    if (!patio) return false;

    ensureStyles();
    document.body.classList.add('cafasso-mobile-patio-active');

    scene = patio.querySelector('.cafasso-patio-panorama');
    if (!scene) {
      scene = document.createElement('div');
      scene.className = 'cafasso-patio-panorama';
      scene.setAttribute('aria-label', 'Patio CAFASSO, deslizá horizontalmente para recorrerlo');
      patio.insertBefore(scene, patio.firstChild);
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
      observer.observe(patio, { childList:true });
    }

    patio.dataset.mobilePatioReady = 'panorama';
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
    if (!scene || !patio) {
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

  window.CafassoPatioPanorama = {
    refresh,
    center() {
      progress = .5;
      applySceneSize();
      setPan(currentPan,true);
    },
    get progress() { return progress; }
  };
})();
