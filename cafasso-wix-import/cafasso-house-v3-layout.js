(() => {
  const params = new URLSearchParams(location.search);
  if ((params.get('space') || 'house') !== 'house') return;
  if (window.__cafassoHouseV3LayoutInstalled) return;
  window.__cafassoHouseV3LayoutInstalled = true;

  const STYLE_ID = 'cafassoHouseV3LayoutStyles';

  const ASPECT = 16 / 9;
  const SPATIAL_SELECTORS = [
    '.cafasso-house__image',
    '.cafasso-space-link--casa[data-space="patio"]',
    '.cafasso-space-link--house-recursos',
    '.cafasso-bitacora-object',
    '.cafasso-house-corner',
    '.cafasso-animator-sheet',
    '.cafasso-world-compass',
    '.cafasso-explore-secret--house',
    '.cafasso-corazon-huella',
    '.cafasso-calendar-layer'
  ];

  let house = null;
  let desktopScene = null;
  let sceneObserver = null;

  function isMobile() {
    return document.documentElement.classList.contains('cafasso-mobile');
  }

  function viewportSize() {
    const vv = window.visualViewport;
    return {
      width: Math.max(1, Math.round(vv?.width || window.innerWidth || 1)),
      height: Math.max(1, Math.round(vv?.height || window.innerHeight || 1))
    };
  }

  function referenceSize() {
    const screenWidth = Math.max(1, Number(window.screen?.width) || viewportSize().width);
    return { width: screenWidth, height: screenWidth / ASPECT };
  }

  function sizeDesktopScene() {
    if (!desktopScene || isMobile()) return;
    const viewport = viewportSize();
    const base = referenceSize();
    const scale = Math.min(viewport.width / base.width, viewport.height / base.height);
    const renderedWidth = base.width * scale;
    const renderedHeight = base.height * scale;
    desktopScene.style.setProperty('--cafasso-house-base-w', base.width + 'px');
    desktopScene.style.setProperty('--cafasso-house-base-h', base.height + 'px');
    desktopScene.style.setProperty('--cafasso-house-scene-scale', String(scale));
    desktopScene.style.left = ((viewport.width - renderedWidth) / 2) + 'px';
    desktopScene.style.top = ((viewport.height - renderedHeight) / 2) + 'px';
    document.documentElement.dataset.cafassoHouseSceneScale = scale.toFixed(4);
  }

  function moveSpatialElements() {
    if (!house || !desktopScene || isMobile()) return;
    SPATIAL_SELECTORS.forEach(selector => {
      house.querySelectorAll(selector).forEach(node => {
        if (node === desktopScene || desktopScene.contains(node)) return;
        desktopScene.appendChild(node);
      });
    });
  }

  function mountDesktopScene() {
    if (isMobile()) return false;
    house = document.querySelector('.cafasso-house');
    if (!house) return false;
    desktopScene = house.querySelector('.cafasso-house-desktop-scene');
    if (!desktopScene) {
      desktopScene = document.createElement('div');
      desktopScene.className = 'cafasso-house-desktop-scene';
      desktopScene.setAttribute('aria-label', 'Escena Casa CAFASSO');
      house.insertBefore(desktopScene, house.firstChild);
    }
    moveSpatialElements();
    sizeDesktopScene();
    if (!sceneObserver) {
      sceneObserver = new MutationObserver(() => {
        moveSpatialElements();
        sizeDesktopScene();
      });
      sceneObserver.observe(house, { childList:true });
    }
    house.dataset.cafassoDesktopScene = '1';
    return true;
  }
  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* Escritorio: fondo y objetos viven dentro de una única escena 16:9. */
      .cafasso-house .cafasso-house-desktop-scene{
        position:absolute!important;
        z-index:1!important;
        width:var(--cafasso-house-base-w)!important;
        height:var(--cafasso-house-base-h)!important;
        overflow:hidden!important;
        transform:scale(var(--cafasso-house-scene-scale,1))!important;
        transform-origin:0 0!important;
        will-change:transform;
      }
      .cafasso-house .cafasso-house-desktop-scene > .cafasso-house__image{
        position:absolute!important;
        inset:0!important;
        z-index:0!important;
        display:block!important;
        width:100%!important;
        height:100%!important;
        max-width:none!important;
        object-fit:fill!important;
        object-position:center center!important;
        transform:none!important;
      }

      /* Móvil conserva su panorama dedicado. */
      html.cafasso-mobile.cafasso-mobile-portrait body .cafasso-house-panorama > .cafasso-house__image{
        object-fit:cover!important;
      }

      /* La nueva Casa ya trae su propia luz: evitamos superponer filtros o videos viejos. */
      .cafasso-house:after,
      .cafasso-house .cafasso-dynamic-light,
      .cafasso-house .cafasso-visual-loop-layer{
        display:none!important;
      }

      /* Acceso al Patio: sobre el gran vano central. */
      .cafasso-house .cafasso-space-link--casa.cafasso-house-door{
        left:50.4%!important;
        right:auto!important;
        top:48.5%!important;
        min-width:88px!important;
        transform:none!important;
        transform-origin:center center!important;
        background:linear-gradient(180deg,rgba(50,39,28,.56),rgba(25,31,28,.70))!important;
        border-color:rgba(236,205,145,.48)!important;
        box-shadow:0 7px 18px rgba(0,0,0,.24),inset 0 1px rgba(255,248,221,.08)!important;
        backdrop-filter:blur(2px)!important;
      }
      .cafasso-house .cafasso-space-link--casa.cafasso-house-door:hover{
        transform:translateY(-2px) scale(1.02)!important;
      }

      /* Recursos: asociado al gran mueble de libros del lateral derecho. */
      .cafasso-house .cafasso-space-link--house-recursos{
        left:auto!important;
        right:6.2%!important;
        top:20.5%!important;
        background:rgba(35,38,31,.60)!important;
        border-color:rgba(234,203,144,.48)!important;
        box-shadow:0 7px 16px rgba(0,0,0,.22)!important;
        backdrop-filter:blur(2px)!important;
      }

      /* Mi rincón: posición final de la tarjeta personal, separada de la Bitácora. */
      .cafasso-house .cafasso-house-corner{
        left:calc(42.6% - 8cm)!important;
        right:auto!important;
        bottom:8.8%!important;
      }

      /* Bitácora: vuelve a ser un objeto apoyado sobre la mesa. */
      .cafasso-house .cafasso-bitacora-object{
        left:calc(53.2% - 3cm)!important;
        right:auto!important;
        top:auto!important;
        bottom:6.7%!important;
        width:150px!important;
        height:132px!important;
        transform:rotate(-3.5deg)!important;
        filter:drop-shadow(0 8px 7px rgba(35,22,13,.34))!important;
      }
      .cafasso-house .cafasso-bitacora-object:hover{
        transform:rotate(-3deg) translateY(-4px) scale(1.035)!important;
      }

      /* La ficha queda integrada sobre la pared izquierda, como un elemento real de la Casa. */
      .cafasso-house .cafasso-animator-sheet{
        left:19.8%!important;
        right:auto!important;
        top:24.8%!important;
        bottom:auto!important;
        width:166px!important;
        height:188px!important;
        transform:perspective(700px) rotateY(-3deg) rotateZ(-2.8deg)!important;
        filter:drop-shadow(0 10px 8px rgba(31,20,13,.31))!important;
      }
      .cafasso-house .cafasso-animator-sheet:hover{
        transform:perspective(700px) rotateY(-2deg) rotateZ(-1.8deg) translateY(-4px) scale(1.02)!important;
      }

      /* Objetos de etapa: se apoyan en la mesa, sin pelear con la arquitectura. */
      .cafasso-house .cafasso-world-compass{
        left:63.2%!important;
        right:auto!important;
        bottom:8.8%!important;
        width:70px!important;
        height:70px!important;
      }
      .cafasso-house .cafasso-explore-secret--house{
        left:38.1%!important;
        right:auto!important;
        bottom:8.2%!important;
        width:29px!important;
        height:20px!important;
        transform:rotate(-7deg)!important;
      }
      .cafasso-house .cafasso-corazon-huella{
        left:76.1%!important;
        right:auto!important;
        bottom:9.2%!important;
      }

      @media(max-width:680px){
        .cafasso-house .cafasso-space-link--casa.cafasso-house-door{
          left:50.4%!important;
          top:48.5%!important;
        }
        .cafasso-house .cafasso-space-link--house-recursos{
          right:6.2%!important;
          top:20.5%!important;
        }
      }

      /* En móvil vertical conservamos exactamente el mismo mapa espacial 16:9. */
      html.cafasso-mobile.cafasso-mobile-portrait body .cafasso-house-panorama .cafasso-animator-sheet{
        left:19.8%!important;
        top:24.8%!important;
        width:clamp(124px,19.5vh,166px)!important;
        height:clamp(140px,22vh,188px)!important;
        transform:perspective(700px) rotateY(-3deg) rotateZ(-2.8deg)!important;
      }
      html.cafasso-mobile.cafasso-mobile-portrait body .cafasso-house-panorama .cafasso-bitacora-object{
        left:53.2%!important;
        bottom:6.7%!important;
        width:clamp(115px,17.7vh,150px)!important;
        height:clamp(101px,15.6vh,132px)!important;
        transform:rotate(-3.5deg)!important;
      }
      html.cafasso-mobile.cafasso-mobile-portrait body .cafasso-house-panorama .cafasso-world-compass{
        left:63.2%!important;
        bottom:8.8%!important;
        width:clamp(58px,8.3vh,70px)!important;
        height:clamp(58px,8.3vh,70px)!important;
      }
      html.cafasso-mobile.cafasso-mobile-portrait body .cafasso-house-panorama .cafasso-explore-secret--house{
        left:38.1%!important;
        bottom:8.2%!important;
        width:29px!important;
        height:20px!important;
        transform:rotate(-7deg)!important;
      }
      html.cafasso-mobile.cafasso-mobile-portrait body .cafasso-house-panorama .cafasso-corazon-huella{
        left:76.1%!important;
        bottom:9.2%!important;
      }
      html.cafasso-mobile.cafasso-mobile-portrait body .cafasso-house-panorama .cafasso-space-link--house-recursos{
        left:auto!important;
        right:6.2%!important;
        top:20.5%!important;
      }
      html.cafasso-mobile.cafasso-mobile-portrait body .cafasso-house-panorama .cafasso-space-link--casa.cafasso-house-door{
        left:50.4%!important;
        top:48.5%!important;
        transform:none!important;
      }

      @media(prefers-reduced-motion:reduce){
        .cafasso-house .cafasso-bitacora-object,
        .cafasso-house .cafasso-animator-sheet,
        .cafasso-house .cafasso-space-link--casa.cafasso-house-door{
          transition:none!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function boot() {
    ensureStyles();
    if (isMobile()) return;
    if (!mountDesktopScene()) setTimeout(boot, 80);
  }

  const refresh = () => {
    if (isMobile()) return;
    if (!desktopScene) mountDesktopScene();
    moveSpatialElements();
    sizeDesktopScene();
  };

  window.addEventListener('resize', refresh, { passive:true });
  window.visualViewport?.addEventListener('resize', refresh, { passive:true });
  window.addEventListener('cafasso:mobile-layout', refresh);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once:true });
  } else {
    boot();
  }
})();