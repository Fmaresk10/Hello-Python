(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('space') !== 'escuela') return;
  if (!window.matchMedia?.('(max-width: 820px), (pointer: coarse)').matches) return;
  if (window.__cafassoMobileSchoolInstalled) return;
  window.__cafassoMobileSchoolInstalled = true;

  const STYLE_ID = 'cafassoMobileSchoolStyles';
  const PAN_KEY = 'cafasso-school-panorama-v1';
  const ASPECT = 16 / 9;
  const DEFAULT_PROGRESS = .46;

  const SPATIAL_SELECTORS = [
    '.cafasso-escuela__image',
    '.cafasso-space-link--escuela-patio[data-space="patio"]',
    '.cafasso-school-board',
    '.cafasso-school-resume',
    '.cafasso-corazon-huella',
    '.cafasso-calendar-layer'
  ];

  let school = null;
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
      html.cafasso-mobile body.cafasso-mobile-school-active{
        overflow:hidden!important;
        overscroll-behavior:none;
      }

      html.cafasso-mobile .cafasso-escuela{
        position:fixed!important;
        inset:0!important;
        width:100vw!important;
        height:var(--cafasso-vh)!important;
        overflow:hidden!important;
        background:#253b37!important;
        isolation:isolate;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-escuela{
        touch-action:none!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-school-panorama{
        position:absolute;
        left:0;
        top:0;
        z-index:1;
        width:var(--cafasso-school-scene-width,177.78vh);
        min-width:100vw;
        height:var(--cafasso-vh);
        overflow:hidden;
        transform:translate3d(var(--cafasso-school-pan-x,0px),0,0);
        will-change:transform;
        touch-action:none;
        user-select:none;
        -webkit-user-select:none;
        cursor:grab;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-school-panorama.is-dragging{
        cursor:grabbing;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-school-panorama .cafasso-escuela__image{
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

      /* Pantalla/TV de formación: proporción original dentro del mundo 16:9. */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-school-panorama .cafasso-school-board--screen{
        left:6.85%!important;
        top:16.65%!important;
        width:27.1%!important;
        height:auto!important;
        min-height:0!important;
        max-height:none!important;
        aspect-ratio:16/9!important;
        padding:1.15% 1.18% 1%!important;
        border:5px solid rgba(10,13,15,.94)!important;
        border-radius:8px!important;
        transform:perspective(1100px) rotateY(2.25deg) rotateZ(-.18deg)!important;
        transform-origin:50% 50%!important;
        z-index:13!important;
        overflow:hidden!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-school-panorama .cafasso-school-board--screen .cafasso-school-board__kicker{
        font-size:clamp(7px,1.05vh,9px)!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-school-panorama .cafasso-school-board--screen h1{
        margin:4px 0 4px!important;
        font-size:clamp(16px,2.25vh,22px)!important;
        line-height:1!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-school-panorama .cafasso-school-board--screen .cafasso-school-board__copy{
        margin:0 0 7px!important;
        font-size:clamp(8px,1.15vh,11px)!important;
        line-height:1.25!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-school-panorama .cafasso-school-board--screen .cafasso-school-board__courses{
        gap:1px!important;
        padding-top:4px!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-school-panorama .cafasso-school-board--screen .cafasso-school-course{
        padding:4px 1px!important;
        gap:6px!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-school-panorama .cafasso-school-board--screen .cafasso-school-course strong{
        font-size:clamp(10px,1.45vh,13px)!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-school-panorama .cafasso-school-board--screen .cafasso-school-course small{
        margin-top:1px!important;
        font-size:clamp(6px,.88vh,8px)!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-school-panorama .cafasso-school-board--screen .cafasso-school-course__progress{
        width:clamp(27px,4.1vh,34px)!important;
        height:clamp(27px,4.1vh,34px)!important;
        font-size:clamp(7px,1vh,9px)!important;
      }

      /* Retomar: recupera la ubicación del escritorio, no la reducción móvil anterior. */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-school-panorama .cafasso-school-resume{
        left:52.3%!important;
        right:auto!important;
        top:35.2%!important;
        bottom:auto!important;
        width:145px!important;
        height:92px!important;
        transform:translateX(-50%) rotateZ(-.7deg)!important;
        z-index:14!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-school-panorama .cafasso-school-resume__label{
        left:20px!important;
        right:12px!important;
        top:12px!important;
        min-height:59px!important;
        padding:7px 8px 6px!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-school-panorama .cafasso-school-resume__kicker{
        font-size:7px!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-school-panorama .cafasso-school-resume__title{
        font-size:11.5px!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-school-panorama .cafasso-school-resume__meta{
        font-size:7.4px!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-school-panorama .cafasso-school-resume__pencil{
        right:-3px!important;
        top:12px!important;
        width:7px!important;
        height:72px!important;
      }

      /* Salida al Patio en su coordenada 16:9 original. */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-school-panorama .cafasso-space-link--escuela-patio{
        left:auto!important;
        right:20%!important;
        top:44%!important;
        min-width:92px!important;
        min-height:44px!important;
        padding:10px 14px!important;
        font-size:13px!important;
        z-index:13!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-school-panorama .cafasso-corazon-huella{
        left:71.8%!important;
        right:auto!important;
        top:16.4%!important;
        bottom:auto!important;
        width:38px!important;
        height:38px!important;
        font-size:29px!important;
        z-index:14!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-school-panorama .cafasso-calendar-layer{
        position:absolute!important;
        inset:0!important;
        width:100%!important;
        height:100%!important;
      }

      /* La marca secreta ya vive dentro de la pantalla, así que viaja con ella. */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-school-panorama .cafasso-school-secret{
        right:13px!important;
        bottom:14px!important;
        width:42px!important;
        height:35px!important;
      }

      /* Oscurecido ambiental permanece fijo respecto de la pantalla del celular. */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-escuela:after{
        position:fixed!important;
        inset:0!important;
        width:100vw!important;
        height:var(--cafasso-vh)!important;
      }

      /* HUD fijo. */
      html.cafasso-mobile body.cafasso-mobile-school-active .cafasso-level-pill{
        display:none!important;
      }

      html.cafasso-mobile body.cafasso-mobile-school-active .cafasso-global-counters{
        left:max(8px,calc(var(--cafasso-safe-left) + 6px))!important;
        top:max(8px,calc(var(--cafasso-safe-top) + 6px))!important;
        transform:scale(.92);
        transform-origin:top left;
      }

      html.cafasso-mobile body.cafasso-mobile-school-active .cafasso-calendar-admin-trigger{
        width:38px!important;
        height:38px!important;
        min-width:38px!important;
        min-height:38px!important;
        right:max(10px,calc(var(--cafasso-safe-right) + 7px))!important;
        bottom:max(10px,calc(var(--cafasso-safe-bottom) + 7px))!important;
        opacity:.68!important;
      }

      /* Intro y cortina de entrada: capa de pantalla. */
      html.cafasso-mobile .cafasso-school-intro{
        position:fixed!important;
        left:50%!important;
        bottom:max(54px,calc(var(--cafasso-safe-bottom) + 42px))!important;
        width:min(690px,88vw)!important;
        z-index:2147482000!important;
      }

      html.cafasso-mobile .cafasso-school-entry-curtain{
        position:fixed!important;
        inset:0!important;
        width:100vw!important;
        height:var(--cafasso-vh)!important;
      }

      /* Mapa del curso: pensado como interfaz móvil, no como parte del aula. */
      html.cafasso-mobile .cafasso-school-map-panel{
        position:fixed!important;
        inset:0!important;
        width:100vw!important;
        height:var(--cafasso-vh)!important;
        overflow:auto!important;
        overscroll-behavior:contain;
        -webkit-overflow-scrolling:touch;
      }

      html.cafasso-mobile .cafasso-school-map__head{
        padding:
          max(72px,calc(var(--cafasso-safe-top) + 54px))
          20px
          0!important;
      }

      html.cafasso-mobile .cafasso-school-map__close{
        position:fixed!important;
        right:max(12px,calc(var(--cafasso-safe-right) + 8px))!important;
        top:max(13px,calc(var(--cafasso-safe-top) + 8px))!important;
        min-height:44px!important;
        z-index:20!important;
      }

      html.cafasso-mobile .cafasso-school-secret-layer,
      html.cafasso-mobile .cafasso-corazon-layer{
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

      html.cafasso-mobile .cafasso-corazon-note{
        width:100%!important;
        max-width:none!important;
        max-height:calc(var(--cafasso-vh) - var(--cafasso-safe-top) - 12px)!important;
        overflow:auto!important;
        border-radius:16px 16px 0 0!important;
        transform:none!important;
        padding-bottom:max(28px,calc(var(--cafasso-safe-bottom) + 18px))!important;
      }

      html.cafasso-mobile :is(.cafasso-corazon-toast,.cafasso-school-secret-toast){
        left:50%!important;
        bottom:max(62px,calc(var(--cafasso-safe-bottom) + 48px))!important;
        max-width:calc(100vw - 30px)!important;
        text-align:center;
      }

      /* Horizontal: entra el aula completa. */
      html.cafasso-mobile.cafasso-mobile-landscape .cafasso-school-panorama{
        width:100vw!important;
        height:var(--cafasso-vh)!important;
        transform:none!important;
        cursor:default;
      }

      html.cafasso-mobile.cafasso-mobile-landscape .cafasso-school-panorama .cafasso-escuela__image{
        width:100%!important;
        height:100%!important;
        object-fit:cover!important;
      }

      @media(prefers-reduced-motion:reduce){
        html.cafasso-mobile .cafasso-school-panorama{
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
    scene.style.setProperty('--cafasso-school-pan-x', `${currentPan}px`);
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
      scene.style.setProperty('--cafasso-school-scene-width', `${sceneWidth}px`);
      const range = Math.max(0, sceneWidth - size.width);
      setPan(-range * progress);
    } else {
      scene.style.setProperty('--cafasso-school-scene-width', `${size.width}px`);
      setPan(0);
    }
  }

  function moveSpatialElements() {
    if (!school || !scene) return;
    SPATIAL_SELECTORS.forEach(selector => {
      school.querySelectorAll(selector).forEach(node => {
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
    if (!school || school.dataset.cafassoPanInstalled === '1') return;
    school.dataset.cafassoPanInstalled = '1';

    school.addEventListener('pointerdown', event => {
      if (!isPortraitMobile()) return;
      if (event.button != null && event.button !== 0) return;
      if (event.target.closest('.cafasso-school-map-panel,.cafasso-school-secret-layer,.cafasso-corazon-layer,[role="dialog"]')) return;

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
      try { school.setPointerCapture(pointerId); } catch (error) {}
    }, { passive:true });

    school.addEventListener('pointermove', event => {
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
      try { school.releasePointerCapture(pointerId); } catch (error) {}
      pointerId = null;

      if (moved) {
        suppressClickUntil = performance.now() + 320;
        startInertia(velocity);
      } else {
        setPan(currentPan, true);
      }
    };

    school.addEventListener('pointerup', finish, { passive:true });
    school.addEventListener('pointercancel', finish, { passive:true });

    school.addEventListener('click', event => {
      if (performance.now() < suppressClickUntil) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);
  }

  function mountPanorama() {
    school = document.querySelector('.cafasso-escuela');
    if (!school) return false;

    ensureStyles();
    document.body.classList.add('cafasso-mobile-school-active');

    scene = school.querySelector('.cafasso-school-panorama');
    if (!scene) {
      scene = document.createElement('div');
      scene.className = 'cafasso-school-panorama';
      scene.setAttribute('aria-label', 'Escuela CAFASSO, deslizá horizontalmente para recorrerla');
      school.insertBefore(scene, school.firstChild);
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
      observer.observe(school, { childList:true });
    }

    school.dataset.mobileSchoolReady = 'panorama';
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
    if (!scene || !school) {
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

  window.CafassoSchoolPanorama = {
    refresh,
    center() {
      progress = .5;
      applySceneSize();
      setPan(currentPan,true);
    },
    get progress() { return progress; }
  };
})();
