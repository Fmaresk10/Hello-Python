(() => {
  const params = new URLSearchParams(location.search);
  if ((params.get('space') || 'house') !== 'patio') return;
  if (window.__cafassoPatioV3LayoutInstalled) return;
  window.__cafassoPatioV3LayoutInstalled = true;

  const STYLE_ID = 'cafassoPatioV3LayoutStyles';

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* Las nuevas imágenes ya contienen la atmósfera de cada hora. */
      .cafasso-patio:before,
      .cafasso-patio:after,
      .cafasso-patio .cafasso-dynamic-light,
      .cafasso-patio .cafasso-visual-loop-layer{
        display:none!important;
      }

      /* Casa: edificio del lateral izquierdo. */
      .cafasso-patio .cafasso-space-link--patio-home{
        left:11.5%!important;
        right:auto!important;
        top:42%!important;
      }

      /* Escuela: edificio central del fondo. */
      .cafasso-patio .cafasso-space-link--patio-escuela{
        left:53%!important;
        right:auto!important;
        top:35%!important;
      }

      /* Parroquia: iglesia del lateral derecho. */
      .cafasso-patio .cafasso-space-link--patio-parroquia{
        left:auto!important;
        right:6.2%!important;
        top:42%!important;
      }

      .cafasso-patio .cafasso-space-link{
        background:linear-gradient(180deg,rgba(55,45,34,.54),rgba(25,34,31,.72))!important;
        border-color:rgba(236,205,145,.48)!important;
        box-shadow:0 7px 18px rgba(0,0,0,.22),inset 0 1px rgba(255,248,221,.08)!important;
        backdrop-filter:blur(2px)!important;
      }

      /* Don Bosco sigue siendo el punto secreto central. */
      .cafasso-patio .cafasso-patio-secret{
        left:44.2%!important;
        top:31.5%!important;
        width:12.2%!important;
        height:30%!important;
      }

      /* La pelota queda físicamente apoyada en el empedrado del primer plano. */
      .cafasso-patio .cafasso-presencia-ball{
        left:34.5%!important;
        bottom:8.8%!important;
      }

      .cafasso-patio .cafasso-corazon-huella{
        left:18.5%!important;
        bottom:11.6%!important;
      }

      /* Móvil vertical: misma geografía dentro del panorama 16:9. */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-patio-panorama .cafasso-space-link--patio-home{
        left:11.5%!important;
        right:auto!important;
        top:42%!important;
      }
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-patio-panorama .cafasso-space-link--patio-escuela{
        left:53%!important;
        right:auto!important;
        top:35%!important;
      }
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-patio-panorama .cafasso-space-link--patio-parroquia{
        left:auto!important;
        right:6.2%!important;
        top:42%!important;
      }
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-patio-panorama .cafasso-patio-secret{
        left:44.2%!important;
        top:31.5%!important;
        width:12.2%!important;
        height:30%!important;
      }
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-patio-panorama .cafasso-presencia-ball{
        left:34.5%!important;
        bottom:8.8%!important;
      }
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-patio-panorama .cafasso-corazon-huella{
        left:18.5%!important;
        bottom:11.6%!important;
      }

      @media(max-width:680px){
        .cafasso-patio .cafasso-space-link{min-width:94px!important}
      }
    `;
    document.head.appendChild(style);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureStyles, { once:true });
  } else {
    ensureStyles();
  }
})();