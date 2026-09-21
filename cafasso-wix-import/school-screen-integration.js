(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('space') !== 'escuela') return;
  if (window.__cafassoSchoolScreenIntegrationInstalled) return;
  window.__cafassoSchoolScreenIntegrationInstalled = true;

  const STYLE_ID = 'cafassoSchoolScreenIntegrationStyles';

  function install() {
    const school = document.querySelector('.cafasso-escuela');
    const screen = school?.querySelector('.cafasso-school-board');
    if (!school || !screen) return false;

    screen.classList.add('cafasso-school-board--screen');
    screen.setAttribute('aria-label', 'Pantalla de formación de Escuela');

    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = `
        /* Pantalla física: vidrio negro, bisel fino e interfaz digital. */
        .cafasso-escuela .cafasso-school-board--screen{
          left:6.85%!important;
          top:16.65%!important;
          width:27.1vw!important;
          aspect-ratio:16/9;
          height:auto!important;
          min-height:0!important;
          max-height:none!important;
          padding:.92vw 1vw .78vw!important;
          border:.14vw solid rgba(7,9,10,.98)!important;
          border-radius:.24vw!important;
          background:
            radial-gradient(ellipse 70% 60% at 50% 18%,rgba(61,104,117,.10),transparent 66%),
            linear-gradient(180deg,rgba(6,13,17,.995),rgba(2,7,10,.995))!important;
          box-shadow:
            0 0 0 .09vw rgba(60,64,66,.7),
            0 .28vw .7vw rgba(0,0,0,.43),
            inset 0 0 0 1px rgba(220,235,240,.04),
            inset 0 0 1.75vw rgba(0,0,0,.58)!important;
          color:#eef5f7!important;
          overflow:hidden;
          display:flex;
          flex-direction:column;
          transform:perspective(1100px) rotateY(2.25deg) rotateZ(-.18deg)!important;
          transform-origin:50% 50%!important;
          backdrop-filter:none!important;
        }
        .cafasso-escuela .cafasso-school-board--screen:before{
          content:""!important;
          position:absolute!important;
          inset:0!important;
          z-index:4!important;
          border:0!important;
          border-radius:inherit!important;
          background:
            linear-gradient(116deg,rgba(255,255,255,.075) 0%,rgba(255,255,255,.02) 13%,transparent 29%,transparent 72%,rgba(145,196,209,.018) 100%)!important;
          pointer-events:none!important;
          opacity:.72!important;
        }
        .cafasso-escuela .cafasso-school-board--screen:after{
          content:""!important;
          position:absolute!important;
          z-index:5!important;
          left:auto!important;
          right:7%!important;
          top:auto!important;
          bottom:.22vw!important;
          width:.16vw!important;
          height:.16vw!important;
          min-width:2px!important;
          min-height:2px!important;
          border-radius:50%!important;
          background:rgba(125,184,196,.72)!important;
          box-shadow:0 0 .22vw rgba(95,178,195,.44)!important;
          pointer-events:none!important;
        }
        .cafasso-escuela .cafasso-school-board--screen .cafasso-school-board__kicker{
          position:relative;
          z-index:2;
          color:rgba(174,208,217,.72)!important;
          font:700 clamp(7px,.49vw,9px)/1.15 Inter,system-ui,sans-serif!important;
          letter-spacing:.15em!important;
          text-transform:uppercase;
          text-shadow:none!important;
        }
        .cafasso-escuela .cafasso-school-board--screen h1{
          position:relative;
          z-index:2;
          margin:.28vw 0 .42vw!important;
          color:#f4f8f9!important;
          font:600 clamp(15px,1.1vw,21px)/1.08 Inter,system-ui,sans-serif!important;
          letter-spacing:-.025em!important;
          text-shadow:0 1px 4px rgba(0,0,0,.55)!important;
        }
        .cafasso-escuela .cafasso-school-board--screen .cafasso-school-board__copy{
          display:none!important;
        }
        .cafasso-escuela .cafasso-school-board--screen .cafasso-school-board__courses{
          position:relative;
          z-index:2;
          flex:1 1 auto;
          min-height:0;
          display:grid!important;
          align-content:start;
          gap:0!important;
          padding-top:.28vw!important;
          border-top:1px solid rgba(205,225,231,.10)!important;
          overflow:auto;
          scrollbar-width:thin;
          scrollbar-color:rgba(180,213,222,.2) transparent;
        }
        .cafasso-escuela .cafasso-school-board--screen .cafasso-school-course{
          gap:.62vw!important;
          min-height:0!important;
          padding:.48vw .14vw!important;
          border:0!important;
          border-bottom:1px solid rgba(205,225,231,.075)!important;
          color:#edf4f6!important;
          background:transparent!important;
          border-radius:0!important;
        }
        .cafasso-escuela .cafasso-school-board--screen .cafasso-school-course:hover{
          transform:none!important;
          color:#fff!important;
          background:linear-gradient(90deg,rgba(105,165,181,.075),rgba(105,165,181,.015))!important;
        }
        .cafasso-escuela .cafasso-school-board--screen .cafasso-school-course strong{
          display:block;
          color:#f7fafb!important;
          font:600 clamp(11px,.78vw,15px)/1.15 Inter,system-ui,sans-serif!important;
          letter-spacing:-.012em!important;
          text-shadow:none!important;
        }
        .cafasso-escuela .cafasso-school-board--screen .cafasso-school-course small{
          display:block;
          margin-top:2px!important;
          color:rgba(193,214,220,.64)!important;
          font:600 clamp(7px,.47vw,9px)/1.2 Inter,system-ui,sans-serif!important;
          letter-spacing:0!important;
        }
        .cafasso-escuela .cafasso-school-board--screen .cafasso-school-course__progress{
          width:auto!important;
          min-width:2.3vw!important;
          height:auto!important;
          padding:.28vw .42vw!important;
          border:1px solid rgba(164,199,208,.18)!important;
          border-radius:999px!important;
          color:rgba(225,235,238,.88)!important;
          font:700 clamp(7px,.49vw,9px)/1 Inter,system-ui,sans-serif!important;
          background:rgba(23,43,49,.44)!important;
          box-shadow:none!important;
        }
        .cafasso-escuela .cafasso-school-board--screen .cafasso-school-course.is-done .cafasso-school-course__progress{
          background:rgba(53,104,84,.32)!important;
          border-color:rgba(140,194,166,.24)!important;
          color:#dcebe2!important;
        }
        .cafasso-escuela .cafasso-school-board--screen .cafasso-school-loading,
        .cafasso-escuela .cafasso-school-board--screen .cafasso-school-empty{
          padding:.8vw .05vw!important;
          color:rgba(204,221,226,.74)!important;
          font:500 clamp(9px,.63vw,12px)/1.4 Inter,system-ui,sans-serif!important;
        }

        @media(max-width:760px){
          .cafasso-escuela .cafasso-school-board--screen{
            left:7.5%!important;
            top:15.5%!important;
            width:58vw!important;
            aspect-ratio:16/9!important;
            padding:10px 11px 8px!important;
            border-width:2px!important;
            border-radius:4px!important;
            transform:none!important;
          }
          .cafasso-escuela .cafasso-school-board--screen:after{right:8%!important;bottom:3px!important;width:2px!important;height:2px!important}
          .cafasso-escuela .cafasso-school-board--screen .cafasso-school-board__kicker{font-size:7px!important}
          .cafasso-escuela .cafasso-school-board--screen h1{font-size:14px!important;margin:3px 0 4px!important}
          .cafasso-escuela .cafasso-school-board--screen .cafasso-school-course{padding:5px 1px!important;gap:7px!important}
          .cafasso-escuela .cafasso-school-board--screen .cafasso-school-course strong{font-size:10px!important}
          .cafasso-escuela .cafasso-school-board--screen .cafasso-school-course small{font-size:7px!important}
          .cafasso-escuela .cafasso-school-board--screen .cafasso-school-course__progress{min-width:27px!important;padding:3px 5px!important;font-size:7px!important}
        }
      `;
      document.head.appendChild(style);
    }
    return true;
  }

  let tries = 0;
  const boot = () => {
    if (install()) return;
    if (tries++ < 40) setTimeout(boot, 80);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();
