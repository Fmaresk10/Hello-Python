(() => {
  const params = new URLSearchParams(location.search);
  if ((params.get('space') || 'house') !== 'house') return;
  if (!window.matchMedia?.('(max-width: 820px), (pointer: coarse)').matches) return;
  if (window.__cafassoMobileHouseInstalled) return;
  window.__cafassoMobileHouseInstalled = true;

  const STYLE_ID = 'cafassoMobileHouseStyles';
  const PAN_KEY = 'cafasso-house-panorama-v1';
  const ASPECT = 16 / 9;
  const DEFAULT_PROGRESS = .56;

  const SPATIAL_SELECTORS = [
    '.cafasso-house__image',
    '.cafasso-space-link--casa[data-space="patio"]',
    '.cafasso-space-link--house-recursos',
    '.cafasso-bitacora-object',
    '.cafasso-admin-monitor',
    '.cafasso-house-corner',
    '.cafasso-animator-sheet',
    '.cafasso-world-compass',
    '.cafasso-explore-secret--house',
    '.cafasso-corazon-huella',
    '.cafasso-calendar-layer'
  ];

  let house = null;
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
      html.cafasso-mobile body.cafasso-mobile-house-active{
        overflow:hidden!important;
        overscroll-behavior:none;
      }

      html.cafasso-mobile .cafasso-house{
        position:fixed!important;
        inset:0!important;
        width:100vw!important;
        height:var(--cafasso-vh)!important;
        overflow:hidden!important;
        background:#101918!important;
        isolation:isolate;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house{
        touch-action:none!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house-panorama{
        position:absolute;
        left:0;
        top:0;
        z-index:1;
        width:var(--cafasso-house-scene-width,177.78vh);
        min-width:100vw;
        height:var(--cafasso-vh);
        overflow:hidden;
        transform:translate3d(var(--cafasso-house-pan-x,0px),0,0);
        will-change:transform;
        touch-action:none;
        user-select:none;
        -webkit-user-select:none;
        cursor:grab;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house-panorama.is-dragging{
        cursor:grabbing;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house-panorama .cafasso-house__image{
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
        -webkit-mask-image:none!important;
        mask-image:none!important;
        pointer-events:none!important;
      }

      /* Recuperamos las coordenadas del mundo 16:9: los objetos viajan con la habitación. */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house-panorama .cafasso-animator-sheet{
        left:22.6%!important;
        top:20.8%!important;
        width:clamp(118px,18.5vh,156px)!important;
        height:clamp(139px,21.8vh,184px)!important;
        transform:perspective(700px) rotateY(-4deg) rotateZ(-4.2deg)!important;
        z-index:12!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house-panorama .cafasso-bitacora-object{
        left:50.5%!important;
        right:auto!important;
        bottom:11.5%!important;
        width:clamp(128px,19.8vh,168px)!important;
        height:clamp(113px,17.5vh,148px)!important;
        transform:rotate(-5deg)!important;
        z-index:14!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house-panorama .cafasso-admin-monitor{
        left:69.2%!important;
        top:61.2%!important;
        width:clamp(112px,17.3vh,146px)!important;
        height:clamp(99px,15.3vh,129px)!important;
        transform:perspective(900px) rotateX(3.5deg) rotateY(-6deg) rotateZ(.35deg)!important;
        z-index:16!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house-panorama .cafasso-world-compass{
        left:61.7%!important;
        right:auto!important;
        bottom:13.2%!important;
        width:clamp(64px,9.9vh,84px)!important;
        height:clamp(64px,9.9vh,84px)!important;
        z-index:15!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house-panorama .cafasso-world-compass__face{
        inset:14px!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house-panorama .cafasso-world-compass__needle{
        height:34px!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house-panorama .cafasso-explore-secret--house{
        left:calc(50.5% + 96px)!important;
        bottom:16.4%!important;
        width:38px!important;
        height:25px!important;
        transform:rotate(7deg)!important;
        z-index:15!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house-panorama .cafasso-corazon-huella{
        left:70.2%!important;
        right:auto!important;
        bottom:10.2%!important;
        width:36px!important;
        height:36px!important;
        font-size:26px!important;
        opacity:.78!important;
        z-index:11!important;
      }

      /* Biblioteca: el acceso queda físicamente en el mueble izquierdo. */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house-panorama .cafasso-space-link--house-recursos{
        left:auto!important;
        right:8%!important;
        top:24%!important;
        min-width:92px!important;
        min-height:44px!important;
        padding:10px 14px!important;
        border-color:rgba(239,195,93,.8)!important;
        background:rgba(15,39,40,.78)!important;
        box-shadow:0 5px 14px rgba(0,0,0,.35)!important;
        color:#fff8e9!important;
        font-size:13px!important;
        opacity:1!important;
        z-index:13!important;
      }

      /* Toda la puerta funciona como salida; la etiqueta es solo una pista. */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house-panorama .cafasso-space-link--casa.cafasso-house-door{
        left:calc(66% - 114px)!important;
        top:calc(40% - 113px)!important;
        width:auto!important;
        height:auto!important;
        min-width:92px!important;
        min-height:44px!important;
        padding:9px 13px 8px!important;
        border:1px solid rgba(235,200,126,.62)!important;
        border-radius:4px!important;
        background:linear-gradient(180deg,rgba(45,35,25,.68),rgba(24,30,28,.78))!important;
        box-shadow:0 7px 17px rgba(0,0,0,.31),inset 0 1px rgba(255,243,205,.10)!important;
        backdrop-filter:blur(3px)!important;
        transform:none!important;
        translate:0 0!important;
        z-index:13!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house-panorama .cafasso-house-door__main{
        position:static!important;
        display:block!important;
        width:auto!important;
        padding:0!important;
        border:0!important;
        border-radius:0!important;
        background:transparent!important;
        box-shadow:none!important;
        backdrop-filter:none!important;
        color:#fff8e9!important;
        transform:none!important;
        font:600 14px/1.05 Georgia,serif!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house-panorama .cafasso-house-door__main:after{
        content:none!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house-panorama .cafasso-house-door__sub{
        display:block!important;
        margin-top:3px!important;
        color:rgba(255,244,216,.68)!important;
        font:800 7px/1 Inter,system-ui,sans-serif!important;
        letter-spacing:.14em!important;
        text-transform:uppercase!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house-panorama .cafasso-calendar-layer{
        position:absolute!important;
        inset:0!important;
        width:100%!important;
        height:100%!important;
      }

      /* HUD: no se mueve con la habitación. */
      html.cafasso-mobile body.cafasso-mobile-house-active .cafasso-level-pill{
        display:none!important;
      }

      html.cafasso-mobile body.cafasso-mobile-house-active .cafasso-global-counters{
        left:max(8px,calc(var(--cafasso-safe-left) + 6px))!important;
        top:max(8px,calc(var(--cafasso-safe-top) + 6px))!important;
        transform:scale(.92);
        transform-origin:top left;
      }

      /* Los paneles siguen siendo interfaz de pantalla, no parte del panorama. */
      html.cafasso-mobile :is(
        .cafasso-profile-panel,
        .cafasso-bitacora-panel,
        .cafasso-bitacora-acompanante-panel,
        .cafasso-world-object-layer,
        .cafasso-discovery-layer,
        .cafasso-corazon-layer
      ){
        position:fixed!important;
        inset:0!important;
        width:100vw!important;
        height:var(--cafasso-vh)!important;
        transform:none!important;
      }

      html.cafasso-mobile :is(
        .cafasso-world-object-layer,
        .cafasso-discovery-layer,
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
        .cafasso-world-object-note,
        .cafasso-discovery-note,
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

      html.cafasso-mobile .cafasso-world-unlock-toast,
      html.cafasso-mobile .cafasso-discovery-toast,
      html.cafasso-mobile .cafasso-corazon-toast,
      html.cafasso-mobile .cafasso-acompanante-toast{
        left:50%!important;
        right:auto!important;
        bottom:max(62px,calc(var(--cafasso-safe-bottom) + 48px))!important;
        max-width:calc(100vw - 30px)!important;
        text-align:center;
      }

      /* Paneles personales cómodos para escribir desde el teléfono. */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-profile-card{
        padding:34px 20px max(28px,calc(var(--cafasso-safe-bottom) + 18px)) 20px!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-profile-head{
        grid-template-columns:80px 1fr!important;
        gap:14px!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-profile-avatar{
        width:80px!important;
        height:96px!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-profile-name{
        font-size:clamp(25px,8vw,31px)!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-bitacora-book{
        padding:42px 20px max(26px,calc(var(--cafasso-safe-bottom) + 16px)) 20px!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-bitacora-text{
        height:min(38vh,300px)!important;
        min-height:190px!important;
        font-size:17px!important;
        line-height:28px!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-bitacora-save{
        width:100%!important;
        min-height:48px!important;
      }

      /* Horizontal: la escena entra completa y deja de desplazarse. */
      html.cafasso-mobile.cafasso-mobile-landscape .cafasso-house-panorama{
        width:100vw!important;
        height:var(--cafasso-vh)!important;
        transform:none!important;
        cursor:default;
      }

      html.cafasso-mobile.cafasso-mobile-landscape .cafasso-house-panorama .cafasso-house__image{
        width:100%!important;
        height:100%!important;
        object-fit:cover!important;
      }

      @media(prefers-reduced-motion:reduce){
        html.cafasso-mobile .cafasso-house-panorama{
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
    scene.style.setProperty('--cafasso-house-pan-x', `${currentPan}px`);
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
      scene.style.setProperty('--cafasso-house-scene-width', `${sceneWidth}px`);
      const range = Math.max(0, sceneWidth - size.width);
      setPan(-range * progress);
    } else {
      scene.style.setProperty('--cafasso-house-scene-width', `${size.width}px`);
      setPan(0);
    }
  }

  function moveSpatialElements() {
    if (!house || !scene) return;
    SPATIAL_SELECTORS.forEach(selector => {
      house.querySelectorAll(selector).forEach(node => {
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
    if (!house || house.dataset.cafassoPanInstalled === '1') return;
    house.dataset.cafassoPanInstalled = '1';

    house.addEventListener('pointerdown', event => {
      if (!isPortraitMobile()) return;
      if (event.button != null && event.button !== 0) return;
      if (event.target.closest('.cafasso-admin-monitor,.cafasso-profile-panel,.cafasso-bitacora-panel,.cafasso-bitacora-acompanante-panel,[role="dialog"]')) return;

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
      try { house.setPointerCapture(pointerId); } catch (error) {}
    }, { passive:true });

    house.addEventListener('pointermove', event => {
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
      try { house.releasePointerCapture(pointerId); } catch (error) {}
      pointerId = null;

      if (moved) {
        suppressClickUntil = performance.now() + 320;
        startInertia(velocity);
      } else {
        setPan(currentPan, true);
      }
    };

    house.addEventListener('pointerup', finish, { passive:true });
    house.addEventListener('pointercancel', finish, { passive:true });

    house.addEventListener('click', event => {
      if (performance.now() < suppressClickUntil) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);
  }

  function mountPanorama() {
    house = document.querySelector('.cafasso-house');
    if (!house) return false;

    ensureStyles();
    document.body.classList.add('cafasso-mobile-house-active');

    scene = house.querySelector('.cafasso-house-panorama');
    if (!scene) {
      scene = document.createElement('div');
      scene.className = 'cafasso-house-panorama';
      scene.setAttribute('aria-label', 'Casa CAFASSO, deslizá horizontalmente para recorrerla');
      house.insertBefore(scene, house.firstChild);
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
      observer.observe(house, { childList:true });
    }

    house.dataset.mobileHouseReady = 'panorama';
    return true;
  }

  ensureStyles();

  let attempts = 0;
  const boot = () => {
    if (mountPanorama()) return;
    if (attempts < 50) {
      attempts += 1;
      setTimeout(boot, 80);
    }
  };

  const refresh = () => {
    if (!scene || !house) {
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

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();

  window.CafassoHousePanorama = {
    refresh,
    center() {
      progress = .5;
      applySceneSize();
      setPan(currentPan, true);
    },
    get progress() { return progress; }
  };
})();
