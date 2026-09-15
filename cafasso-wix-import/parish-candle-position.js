(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('space') !== 'parroquia') return;
  if (window.__cafassoParishCandlePositionInstalled) return;
  window.__cafassoParishCandlePositionInstalled = true;

  const STYLE_ID = 'cafassoParishCandlePositionStyles';

  function install() {
    if (document.getElementById(STYLE_ID)) return true;
    const parish = document.querySelector('.cafasso-parroquia');
    if (!parish) return false;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* Corrección visual basada en la escena real: vela apoyada sobre el tercio izquierdo del altar. */
      @media(min-width:761px){
        .cafasso-parroquia .cafasso-parish-candle{
          left:47.8%!important;
          bottom:57.2%!important;
          transform:translateX(-50%) perspective(700px) rotateX(1.6deg) scale(.64)!important;
          transform-origin:50% 100%!important;
        }
        .cafasso-parroquia .cafasso-parish-candle:hover{
          transform:translateX(-50%) perspective(700px) rotateX(1deg) translateY(-2px) scale(.655)!important;
        }
      }

      @media(max-width:760px){
        .cafasso-parroquia .cafasso-parish-candle{
          left:34%!important;
          bottom:56%!important;
          transform:translateX(-50%) perspective(700px) rotateX(1.4deg) scale(.54)!important;
          transform-origin:50% 100%!important;
        }
        .cafasso-parroquia .cafasso-parish-candle:hover{
          transform:translateX(-50%) perspective(700px) rotateX(1deg) translateY(-1px) scale(.555)!important;
        }
      }
    `;
    document.head.appendChild(style);
    return true;
  }

  let attempts = 0;
  const wait = () => {
    if (install()) return;
    attempts += 1;
    if (attempts < 30) setTimeout(wait, 80);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wait, { once:true });
  else wait();
})();
