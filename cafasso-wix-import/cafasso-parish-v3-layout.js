(() => {
  const params = new URLSearchParams(location.search);
  if ((params.get('space') || 'house') !== 'parroquia') return;
  if (window.__cafassoParishV3LayoutInstalled) return;
  window.__cafassoParishV3LayoutInstalled = true;

  const STYLE_ID = 'cafassoParishV3LayoutStyles';

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
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
        left:calc(28.4% - 3cm)!important;
        right:auto!important;
        bottom:53.6%!important;
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
        left:61.2%!important;
        right:auto!important;
        bottom:48.8%!important;
        width:84px!important;
        height:152px!important;
        transform:translateX(-50%) perspective(700px) rotateX(1.6deg) scale(.47)!important;
        transform-origin:50% 100%!important;
      }
      html body .cafasso-parroquia .cafasso-parish-candle:hover{
        transform:translateX(-50%) perspective(700px) rotateX(1deg) translateY(-2px) scale(.415)!important;
      }

      /* Paño de Servidor: plegado sobre el frente del altar. */
      .cafasso-parroquia .cafasso-servidor-cloth{
        left:49.6%!important;
        bottom:45.2%!important;
        width:102px!important;
        height:44px!important;
        transform:translateX(-50%) rotate(-1.3deg)!important;
      }
      .cafasso-parroquia .cafasso-servidor-cloth:hover,
      .cafasso-parroquia .cafasso-servidor-cloth:focus-visible{
        transform:translateX(-50%) translateY(-2px) rotate(-.8deg) scale(1.015)!important;
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
        left:calc(28.4% - 3cm)!important;
        right:auto!important;
        bottom:53.6%!important;
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
        left:61.2%!important;
        right:auto!important;
        bottom:48.8%!important;
        width:84px!important;
        height:152px!important;
        transform:translateX(-50%) perspective(700px) rotateX(1.6deg) scale(.47)!important;
      }
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-parish-panorama .cafasso-servidor-cloth{
        left:49.6%!important;
        right:auto!important;
        bottom:45.2%!important;
        width:102px!important;
        height:44px!important;
        transform:translateX(-50%) rotate(-1.3deg)!important;
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureStyles, { once:true });
  } else {
    ensureStyles();
  }
})();