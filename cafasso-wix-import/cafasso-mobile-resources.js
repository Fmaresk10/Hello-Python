(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('space') !== 'recursos') return;
  if (window.__cafassoMobileResourcesInstalled) return;
  window.__cafassoMobileResourcesInstalled = true;

  const STYLE_ID = 'cafassoMobileResourcesStyles';
  const PAN_KEY = 'cafasso-resources-panorama-v1';
  const ASPECT = 16 / 9;
  const DEFAULT_PROGRESS = .5;

  const SPATIAL_SELECTORS = [
    '.cafasso-recursos__image',
    '.cafasso-space-link--recursos-home[data-space="house"]',
    '.cafasso-recursos__shelf'
  ];

  let library = null;
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
      html.cafasso-mobile body.cafasso-mobile-resources-active{
        overflow:hidden!important;
        overscroll-behavior:none;
      }

      html.cafasso-mobile .cafasso-recursos{
        position:fixed!important;
        inset:0!important;
        width:100vw!important;
        height:var(--cafasso-vh)!important;
        overflow:hidden!important;
        background:#171a17!important;
        isolation:isolate;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-recursos{
        touch-action:none!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-resources-panorama{
        position:absolute;
        left:0;
        top:0;
        z-index:1;
        width:var(--cafasso-resources-scene-width,177.78vh);
        min-width:100vw;
        height:var(--cafasso-vh);
        overflow:hidden;
        transform:translate3d(var(--cafasso-resources-pan-x,0px),0,0);
        will-change:transform;
        touch-action:none;
        user-select:none;
        -webkit-user-select:none;
        cursor:grab;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-resources-panorama.is-dragging{
        cursor:grabbing;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-resources-panorama .cafasso-recursos__image{
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

      /* Plano físico de libros: acompaña exactamente a la imagen 1672 × 941. */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-resources-panorama .cafasso-recursos__shelf{
        position:absolute!important;
        z-index:3!important;
        pointer-events:none!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-resources-panorama .cafasso-resource-book{
        pointer-events:auto!important;
        touch-action:none!important;
      }

      /* Regreso a Casa: coordenada original de Biblioteca. */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-resources-panorama .cafasso-space-link--recursos-home{
        left:4%!important;
        right:auto!important;
        top:7%!important;
        min-width:92px!important;
        min-height:44px!important;
        padding:10px 16px!important;
        font-size:15px!important;
        z-index:13!important;
      }

      /* En móvil mantenemos los lomos legibles sin agrandarlos artificialmente. */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-resources-panorama .cafasso-resource-book__title{
        font-size:16px!important;
      }

      /* HUD fijo, como en los otros mundos. */
      html.cafasso-mobile body.cafasso-mobile-resources-active .cafasso-level-pill{
        display:none!important;
      }

      html.cafasso-mobile body.cafasso-mobile-resources-active .cafasso-global-counters{
        left:max(8px,calc(var(--cafasso-safe-left) + 6px))!important;
        top:max(8px,calc(var(--cafasso-safe-top) + 6px))!important;
        transform:scale(.92);
        transform-origin:top left;
      }

      html.cafasso-mobile body.cafasso-mobile-resources-active .cafasso-calendar-admin-trigger{
        width:38px!important;
        height:38px!important;
        min-width:38px!important;
        min-height:38px!important;
        right:max(10px,calc(var(--cafasso-safe-right) + 7px))!important;
        bottom:max(10px,calc(var(--cafasso-safe-bottom) + 7px))!important;
        opacity:.68!important;
      }

      /* Horizontal: la biblioteca entra completa. */
      html.cafasso-mobile.cafasso-mobile-landscape .cafasso-resources-panorama{
        width:100vw!important;
        height:var(--cafasso-vh)!important;
        transform:none!important;
        cursor:default;
      }

      html.cafasso-mobile.cafasso-mobile-landscape .cafasso-resources-panorama .cafasso-recursos__image{
        width:100%!important;
        height:100%!important;
        object-fit:cover!important;
      }

      @media(prefers-reduced-motion:reduce){
        html.cafasso-mobile .cafasso-resources-panorama{
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
    scene.style.setProperty('--cafasso-resources-pan-x', `${currentPan}px`);
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

  function requestShelfRealign() {
    window.dispatchEvent(new Event('resize'));
  }

  function applySceneSize() {
    if (!scene) return;
    const size = viewportSize();
    if (isPortraitMobile()) {
      const sceneWidth = Math.max(size.width, Math.round(size.height * ASPECT));
      scene.style.setProperty('--cafasso-resources-scene-width', `${sceneWidth}px`);
      const range = Math.max(0, sceneWidth - size.width);
      setPan(-range * progress);
    } else {
      scene.style.setProperty('--cafasso-resources-scene-width', `${size.width}px`);
      setPan(0);
    }
    requestAnimationFrame(requestShelfRealign);
  }

  function moveSpatialElements() {
    if (!library || !scene) return;
    SPATIAL_SELECTORS.forEach(selector => {
      library.querySelectorAll(selector).forEach(node => {
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
    if (!library || library.dataset.cafassoPanInstalled === '1') return;
    library.dataset.cafassoPanInstalled = '1';

    library.addEventListener('pointerdown', event => {
      if (!isPortraitMobile()) return;
      if (event.button != null && event.button !== 0) return;

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
      try { library.setPointerCapture(pointerId); } catch (error) {}
    }, { passive:true });

    library.addEventListener('pointermove', event => {
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
      try { library.releasePointerCapture(pointerId); } catch (error) {}
      pointerId = null;

      if (moved) {
        suppressClickUntil = performance.now() + 320;
        startInertia(velocity);
      } else {
        setPan(currentPan, true);
      }
    };

    library.addEventListener('pointerup', finish, { passive:true });
    library.addEventListener('pointercancel', finish, { passive:true });

    library.addEventListener('click', event => {
      if (performance.now() < suppressClickUntil) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);
  }

  function mountPanorama() {
    library = document.querySelector('.cafasso-recursos');
    if (!library) return false;

    ensureStyles();
    document.body.classList.add('cafasso-mobile-resources-active');

    scene = library.querySelector('.cafasso-resources-panorama');
    if (!scene) {
      scene = document.createElement('div');
      scene.className = 'cafasso-resources-panorama';
      scene.setAttribute('aria-label', 'Biblioteca CAFASSO, deslizá horizontalmente para recorrerla');
      library.insertBefore(scene, library.firstChild);
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
      observer.observe(library, { childList:true });
    }

    library.dataset.mobileResourcesReady = 'panorama';
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
    if (!scene || !library) {
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

  window.CafassoResourcesPanorama = {
    refresh,
    center() {
      progress = .5;
      applySceneSize();
      setPan(currentPan,true);
    },
    get progress() { return progress; }
  };
})();
