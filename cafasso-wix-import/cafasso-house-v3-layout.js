(() => {
  const params = new URLSearchParams(location.search);
  if ((params.get('space') || 'house') !== 'house') return;
  if (window.__cafassoHouseV3LayoutInstalled) return;
  window.__cafassoHouseV3LayoutInstalled = true;

  const STYLE_ID = 'cafassoHouseV3LayoutStyles';

  function syncObjectScale() {
    const root = document.documentElement;
    if (root.classList.contains('cafasso-mobile')) return;

    const viewportWidth = Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1);
    const fullWidth = Math.max(viewportWidth, window.screen?.availWidth || window.screen?.width || viewportWidth);
    const scale = Math.max(.42, Math.min(1, viewportWidth / fullWidth));

    root.style.setProperty('--cafasso-house-bitacora-w', `${150 * scale}px`);
    root.style.setProperty('--cafasso-house-bitacora-h', `${132 * scale}px`);
    root.style.setProperty('--cafasso-house-bitacora-x', `${113.3858 * scale}px`);
    root.style.setProperty('--cafasso-house-sheet-w', `${142 * scale}px`);
    root.style.setProperty('--cafasso-house-sheet-h', `${168 * scale}px`);
    root.style.setProperty('--cafasso-house-compass-size', `${70 * scale}px`);
    root.style.setProperty('--cafasso-house-secret-w', `${29 * scale}px`);
    root.style.setProperty('--cafasso-house-secret-h', `${20 * scale}px`);
    root.style.setProperty('--cafasso-house-heart-size', `${38 * scale}px`);
    root.style.setProperty('--cafasso-house-heart-font', `${29 * scale}px`);
    root.style.setProperty('--cafasso-house-door-min', `${88 * scale}px`);
    root.dataset.cafassoHouseObjectScale = scale.toFixed(4);
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* Mantener el mapa completo de Casa en cualquier proporción de ventana.
         fill evita el recorte/zoom de cover y conserva alineados los objetos por porcentaje. */
      .cafasso-house > .cafasso-house__image,
      .cafasso-house .cafasso-house-panorama > .cafasso-house__image{
        width:100%!important;
        height:100%!important;
        max-width:none!important;
        object-fit:fill!important;
        object-position:center center!important;
        transform:none!important;
      }

      /* En móvil vertical el panorama ya mantiene una escena física 16:9; ahí no deformamos. */
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
        min-width:var(--cafasso-house-door-min,88px)!important;
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

      /* Bitácora: vuelve a ser un objeto apoyado sobre la mesa. */
      .cafasso-house .cafasso-bitacora-object{
        left:calc(53.2% - var(--cafasso-house-bitacora-x,3cm))!important;
        right:auto!important;
        top:auto!important;
        bottom:6.7%!important;
        width:var(--cafasso-house-bitacora-w,150px)!important;
        height:var(--cafasso-house-bitacora-h,132px)!important;
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
        width:var(--cafasso-house-sheet-w,142px)!important;
        height:var(--cafasso-house-sheet-h,168px)!important;
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
        width:var(--cafasso-house-compass-size,70px)!important;
        height:var(--cafasso-house-compass-size,70px)!important;
      }
      .cafasso-house .cafasso-explore-secret--house{
        left:38.1%!important;
        right:auto!important;
        bottom:8.2%!important;
        width:var(--cafasso-house-secret-w,29px)!important;
        height:var(--cafasso-house-secret-h,20px)!important;
        transform:rotate(-7deg)!important;
      }
      .cafasso-house .cafasso-corazon-huella{
        left:76.1%!important;
        right:auto!important;
        bottom:9.2%!important;
        width:var(--cafasso-house-heart-size,38px)!important;
        height:var(--cafasso-house-heart-size,38px)!important;
        font-size:var(--cafasso-house-heart-font,29px)!important;
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
        width:clamp(108px,17vh,142px)!important;
        height:clamp(128px,20vh,168px)!important;
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
    syncObjectScale();
  }

  window.addEventListener('resize', syncObjectScale, { passive:true });
  window.visualViewport?.addEventListener('resize', syncObjectScale, { passive:true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once:true });
  } else {
    boot();
  }
})();