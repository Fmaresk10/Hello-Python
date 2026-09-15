(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('space') !== 'parroquia') return;
  if (window.__cafassoParishCandleAltarInstalled) return;
  window.__cafassoParishCandleAltarInstalled = true;

  const STYLE_ID = 'cafassoParishCandleAltarStyles';

  function install() {
    if (document.getElementById(STYLE_ID)) return true;
    const parish = document.querySelector('.cafasso-parroquia');
    if (!parish) return false;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* La vela queda apoyada visualmente sobre el altar, no sobre el piso. */
      .cafasso-parroquia .cafasso-parish-candle{
        left:50.2%;
        bottom:28.5%;
      }
      @media(max-width:760px){
        .cafasso-parroquia .cafasso-parish-candle{
          left:50%;
          bottom:24.5%;
        }
      }
    `;
    document.head.appendChild(style);
    return true;
  }

  let attempts = 0;
  const wait = () => {
    if (install()) return;
    if (attempts < 30) {
      attempts += 1;
      setTimeout(wait, 80);
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wait, { once:true });
  else wait();
})();
