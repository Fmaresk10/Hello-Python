(() => {
  const params = new URLSearchParams(location.search);
  if ((params.get('space') || 'house') !== 'parroquia') return;
  if (window.__cafassoParishV3LayoutInstalled) return;
  window.__cafassoParishV3LayoutInstalled = true;

  const STYLE_ID = 'cafassoParishV3LayoutStyles';

  const SCENE_ASPECT = 1672 / 941;
  const SPATIAL_SELECTORS = [
    '.cafasso-parroquia__image',
    '.cafasso-space-link--parroquia-patio',
    '.cafasso-parish-lectionary',
    '.cafasso-parish-songbook',
    '.cafasso-parish-candle',
    '.cafasso-parish-secret',
    '.cafasso-corazon-huella'
  ];

  let parish = null;
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
    return { width: screenWidth, height: screenWidth / SCENE_ASPECT };
  }

  function sizeDesktopScene() {
    if (!desktopScene || isMobile()) return;
    const viewport = viewportSize();
    const base = referenceSize();
    const scale = Math.min(viewport.width / base.width, viewport.height / base.height);
    const renderedWidth = base.width * scale;
    const renderedHeight = base.height * scale;
    desktopScene.style.setProperty('--cafasso-parish-base-w', base.width + 'px');
    desktopScene.style.setProperty('--cafasso-parish-base-h', base.height + 'px');
    desktopScene.style.setProperty('--cafasso-parish-scene-scale', String(scale));
    desktopScene.style.left = ((viewport.width - renderedWidth) / 2) + 'px';
    desktopScene.style.top = ((viewport.height - renderedHeight) / 2) + 'px';
    document.documentElement.dataset.cafassoParishSceneScale = scale.toFixed(4);
  }

  function moveSpatialElements() {
    if (!parish || !desktopScene || isMobile()) return;
    SPATIAL_SELECTORS.forEach(selector => {
      parish.querySelectorAll(selector).forEach(node => {
        if (node === desktopScene || desktopScene.contains(node)) return;
        desktopScene.appendChild(node);
      });
    });
  }

  function mountDesktopScene() {
    if (isMobile()) return false;
    parish = document.querySelector('.cafasso-parroquia');
    if (!parish) return false;

    desktopScene = parish.querySelector('.cafasso-parish-desktop-scene');
    if (!desktopScene) {
      desktopScene = document.createElement('div');
      desktopScene.className = 'cafasso-parish-desktop-scene';
      desktopScene.setAttribute('aria-label', 'Escena Parroquia CAFASSO');
      parish.insertBefore(desktopScene, parish.firstChild);
    }

    moveSpatialElements();
    sizeDesktopScene();

    if (!sceneObserver) {
      sceneObserver = new MutationObserver(() => {
        moveSpatialElements();
        sizeDesktopScene();
      });
      sceneObserver.observe(parish, { childList:true });
    }

    parish.dataset.cafassoDesktopScene = '1';
    return true;
  }
  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* Escritorio: fondo y objetos comparten una única escena física.
         Así pantalla completa y ventana normal conservan exactamente la misma geografía. */
      .cafasso-parroquia .cafasso-parish-desktop-scene{
        position:absolute!important;
        z-index:1!important;
        width:var(--cafasso-parish-base-w)!important;
        height:var(--cafasso-parish-base-h)!important;
        overflow:hidden!important;
        transform:scale(var(--cafasso-parish-scene-scale,1))!important;
        transform-origin:0 0!important;
        will-change:transform;
      }
      .cafasso-parroquia .cafasso-parish-desktop-scene > .cafasso-parroquia__image{
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
      /* Las imágenes horarias ya contienen la atmósfera completa. */
      .cafasso-parroquia:before,
      .cafasso-parroquia:after,
      .cafasso-parroquia .cafasso-dynamic-light-sp,
      .cafasso-parroquia .cafasso-visual-loop-layer{
        display:none!important;
      }

      /* Salida al Patio: integrada en la gran puerta abierta de la derecha. */
      .cafasso-parroquia .cafasso-space-link--parroquia-patio{
        left:auto!important;
        right:4.6%!important;
        top:45%!important;
        transform:none!important;
        background:linear-gradient(180deg,rgba(55,45,34,.54),rgba(25,34,31,.72))!important;
        border-color:rgba(236,205,145,.48)!important;
        box-shadow:0 7px 18px rgba(0,0,0,.22),inset 0 1px rgba(255,248,221,.08)!important;
        backdrop-filter:blur(2px)!important;
      }
      .cafasso-parroquia .cafasso-space-link--parroquia-patio:hover{
        transform:translateY(-2px)!important;
      }

      /* Leccionario: apoyado sobre el altar, a la derecha. */
      html body .cafasso-parroquia .cafasso-parish-lectionary{
        left:calc(28.4% - 4cm)!important;
        right:auto!important;
        bottom:calc(53.6% - 2cm)!important;
        width:186px!important;
        height:126px!important;
        transform:perspective(820px) rotateX(3deg) rotateZ(1deg)!important;
        transform-origin:50% 100%!important;
      }
      html body .cafasso-parroquia .cafasso-parish-lectionary:hover{
        transform:perspective(820px) rotateX(2deg) rotateZ(.6deg) translateY(-3px) scale(1.012)!important;
      }

      /* Cancionero: sobre la mesita del primer plano izquierdo. */
      .cafasso-parroquia .cafasso-parish-songbook{
        left:auto!important;
        right:5.2%!important;
        bottom:9.8%!important;
        width:148px!important;
        height:110px!important;
        transform:perspective(720px) rotateX(4deg) rotateZ(-2.2deg)!important;
        filter:drop-shadow(0 12px 8px rgba(44,28,17,.34))!important;
      }
      .cafasso-parroquia .cafasso-parish-songbook:hover{
        transform:perspective(720px) rotateX(3deg) rotateZ(-1.5deg) translateY(-4px) scale(1.025)!important;
      }
      .cafasso-parroquia .cafasso-parish-songbook:before{
        display:none!important;
        content:none!important;
      }
      .cafasso-parroquia .cafasso-parish-songbook__image{
        display:block!important;
        width:100%!important;
        height:100%!important;
        object-fit:contain!important;
        object-position:center!important;
      }

      /* Vela interactiva: coincide con la vela del lado derecho del altar. */
      html body .cafasso-parroquia .cafasso-parish-candle{
        left:calc(61.0% - .2cm)!important;
        right:auto!important;
        bottom:calc(51.0% - 1cm)!important;
        width:84px!important;
        height:152px!important;
        transform:translateX(-50%) perspective(700px) rotateX(1.6deg) scale(.47)!important;
        transform-origin:50% 100%!important;
      }
      html body .cafasso-parroquia .cafasso-parish-candle:hover{
        transform:translateX(-50%) perspective(700px) rotateX(1deg) translateY(-2px) scale(.485)!important;
      }

      /* Sin pie de bronce: conservamos cera, mecha, llama y glow. */
      .cafasso-parroquia .cafasso-parish-candle__holder,
      .cafasso-parroquia .cafasso-parish-candle__holder:before,
      .cafasso-parroquia .cafasso-parish-candle__holder:after{
        display:none!important;
        content:none!important;
      }

      /* Secreto "Hacer lugar": asociado a la luz del crucifijo. */
      .cafasso-parroquia .cafasso-parish-secret{
        left:46%!important;
        top:4.8%!important;
        width:11%!important;
        height:24%!important;
        min-width:72px!important;
        min-height:72px!important;
      }

      .cafasso-parroquia .cafasso-corazon-huella{
        left:68%!important;
        right:auto!important;
        bottom:17.5%!important;
      }

      /* Móvil vertical: misma geografía dentro del panorama 16:9. */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-parish-panorama .cafasso-space-link--parroquia-patio{
        left:auto!important;
        right:4.6%!important;
        top:45%!important;
        transform:none!important;
      }
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-parish-panorama .cafasso-parish-lectionary{
        left:calc(28.4% - 4cm)!important;
        right:auto!important;
        bottom:calc(53.6% - 2cm)!important;
        width:186px!important;
        height:126px!important;
        transform:perspective(820px) rotateX(3deg) rotateZ(1deg)!important;
      }
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-parish-panorama .cafasso-parish-songbook{
        left:auto!important;
        right:5.2%!important;
        bottom:9.8%!important;
        width:148px!important;
        height:110px!important;
        transform:perspective(720px) rotateX(4deg) rotateZ(-2.2deg)!important;
      }
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-parish-panorama .cafasso-parish-candle{
        left:calc(61.0% - .2cm)!important;
        right:auto!important;
        bottom:calc(51.0% - 1cm)!important;
        width:84px!important;
        height:152px!important;
        transform:translateX(-50%) perspective(700px) rotateX(1.6deg) scale(.47)!important;
      }
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-parish-panorama .cafasso-parish-secret{
        left:46%!important;
        top:4.8%!important;
        width:11%!important;
        height:24%!important;
        min-width:72px!important;
        min-height:72px!important;
      }
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-parish-panorama .cafasso-corazon-huella{
        left:68%!important;
        right:auto!important;
        bottom:17.5%!important;
      }

      @media(max-width:680px){
        .cafasso-parroquia .cafasso-space-link--parroquia-patio{
          min-width:94px!important;
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