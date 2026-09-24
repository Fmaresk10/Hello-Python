(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('space') !== 'parroquia') return;
  if (window.__cafassoParishCandlePositionInstalled) return;
  window.__cafassoParishCandlePositionInstalled = true;

  const STYLE_ID = 'cafassoParishCandlePositionStyles';
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    /* Geometría final aplicada antes de crear la vela: evita el salto al recargar. */
    @media(min-width:761px){
      html body .cafasso-parroquia .cafasso-parish-candle{
        left:calc(61.0% - .2cm)!important;
        bottom:calc(51.0% - 1cm)!important;
        width:84px!important;
        height:152px!important;
        transform:translateX(-50%) perspective(700px) rotateX(1.6deg) scale(.47)!important;
        transform-origin:50% 100%!important;
      }
      html body .cafasso-parroquia .cafasso-parish-candle:hover{
        transform:translateX(-50%) perspective(700px) rotateX(1deg) translateY(-2px) scale(.485)!important;
      }
    }

    html body .cafasso-parroquia .cafasso-parish-candle__holder,
    html body .cafasso-parroquia .cafasso-parish-candle__holder:before,
    html body .cafasso-parroquia .cafasso-parish-candle__holder:after{
      display:none!important;
      content:none!important;
    }

    @media(max-width:760px){
      html body .cafasso-parroquia .cafasso-parish-candle{
        left:calc(61.0% - .2cm)!important;
        bottom:54.7%!important;
        width:84px!important;
        height:152px!important;
        transform:translateX(-50%) perspective(700px) rotateX(1.4deg) scale(.47)!important;
        transform-origin:50% 100%!important;
      }
      html body .cafasso-parroquia .cafasso-parish-candle:hover{
        transform:translateX(-50%) perspective(700px) rotateX(1deg) translateY(-1px) scale(.485)!important;
      }
    }
  `;
  document.head.appendChild(style);
})();
