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
        left:47.8%!important;
        bottom:57.2%!important;
        width:92px!important;
        height:166px!important;
        transform:translateX(-50%) perspective(700px) rotateX(1.6deg) scale(.64)!important;
        transform-origin:50% 100%!important;
      }
      html body .cafasso-parroquia .cafasso-parish-candle:hover{
        transform:translateX(-50%) perspective(700px) rotateX(1deg) translateY(-2px) scale(.655)!important;
      }
    }

    @media(max-width:760px){
      html body .cafasso-parroquia .cafasso-parish-candle{
        left:34%!important;
        bottom:56%!important;
        width:68px!important;
        height:126px!important;
        transform:translateX(-50%) perspective(700px) rotateX(1.4deg) scale(.54)!important;
        transform-origin:50% 100%!important;
      }
      html body .cafasso-parroquia .cafasso-parish-candle:hover{
        transform:translateX(-50%) perspective(700px) rotateX(1deg) translateY(-1px) scale(.555)!important;
      }
    }
  `;
  document.head.appendChild(style);
})();
