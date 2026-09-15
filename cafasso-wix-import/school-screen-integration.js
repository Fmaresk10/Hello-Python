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
        /* La interfaz vive dentro de la TV existente del ambiente. */
        .cafasso-escuela .cafasso-school-board--screen{
          left:6.85%!important;
          top:16.65%!important;
          width:27.1vw!important;
          aspect-ratio:16/9;
          height:auto!important;
          min-height:0!important;
          max-height:none!important;
          padding:1.15vw 1.18vw 1vw!important;
          border:.36vw solid rgba(10,13,15,.94)!important;
          border-radius:.62vw!important;
          background:
            radial-gradient(ellipse 70% 45% at 16% 2%,rgba(185,226,240,.09),transparent 58%),
            linear-gradient(180deg,rgba(10,26,34,.97),rgba(6,17,23,.98))!important;
          box-shadow:
            inset 0 0 0 1px rgba(196,228,238,.12),
            inset 0 0 34px rgba(0,0,0,.48),
            0 2px 5px rgba(0,0,0,.34)!important;
          color:#f5fafb!important;
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
          border:0!important;
          border-radius:calc(.62vw - 2px)!important;
          background:
            linear-gradient(112deg,rgba(255,255,255,.055),transparent 20%,transparent 70%,rgba(137,197,217,.025)),
            repeating-linear-gradient(180deg,rgba(255,255,255,.01) 0 1px,transparent 1px 4px)!important;
          pointer-events:none!important;
          opacity:.72;
        }
        .cafasso-escuela .cafasso-school-board--screen:after{
          content:""!important;
          position:absolute!important;
          left:38%!important;
          right:38%!important;
          top:auto!important;
          bottom:5px!important;
          height:2px!important;
          border-radius:99px!important;
          background:rgba(190,224,235,.22)!important;
          box-shadow:none!important;
          pointer-events:none!important;
        }
        .cafasso-escuela .cafasso-school-board--screen .cafasso-school-board__kicker{
          position:relative;
          z-index:1;
          color:#acd5e0!important;
          font:800 clamp(9px,.62vw,12px)/1.15 Inter,system-ui,sans-serif!important;
          letter-spacing:.11em!important;
          text-transform:uppercase;
          text-shadow:0 1px 2px rgba(0,0,0,.62)!important;
        }
        .cafasso-escuela .cafasso-school-board--screen h1{
          position:relative;
          z-index:1;
          margin:.34vw 0 .46vw!important;
          color:#ffffff!important;
          font:600 clamp(20px,1.55vw,30px)/1.04 Georgia,serif!important;
          text-shadow:0 2px 5px rgba(0,0,0,.72)!important;
        }
        .cafasso-escuela .cafasso-school-board--screen .cafasso-school-board__copy{
          display:none!important;
        }
        .cafasso-escuela .cafasso-school-board--screen .cafasso-school-board__courses{
          position:relative;
          z-index:1;
          flex:1 1 auto;
          min-height:0;
          display:grid!important;
          align-content:start;
          gap:0!important;
          padding-top:.38vw!important;
          border-top:1px solid rgba(196,224,232,.2)!important;
          overflow:auto;
          scrollbar-width:thin;
          scrollbar-color:rgba(190,222,231,.28) transparent;
        }
        .cafasso-escuela .cafasso-school-board--screen .cafasso-school-course{
          gap:.72vw!important;
          min-height:0!important;
          padding:.56vw .18vw!important;
          border-bottom:1px solid rgba(194,222,229,.13)!important;
          color:#f4f8f9!important;
          background:transparent!important;
        }
        .cafasso-escuela .cafasso-school-board--screen .cafasso-school-course:hover{
          transform:none!important;
          color:#fff!important;
          background:linear-gradient(90deg,rgba(126,193,214,.10),transparent)!important;
        }
        .cafasso-escuela .cafasso-school-board--screen .cafasso-school-course strong{
          display:block;
          color:#fff!important;
          font:700 clamp(13px,1vw,17px)/1.16 Inter,system-ui,sans-serif!important;
          text-shadow:0 1px 2px rgba(0,0,0,.5);
        }
        .cafasso-escuela .cafasso-school-board--screen .cafasso-school-course small{
          display:block;
          margin-top:3px!important;
          color:rgba(220,235,239,.82)!important;
          font:700 clamp(8px,.58vw,10px)/1.2 Inter,system-ui,sans-serif!important;
          letter-spacing:0!important;
        }
        .cafasso-escuela .cafasso-school-board--screen .cafasso-school-course__progress{
          width:clamp(35px,2.65vw,46px)!important;
          height:clamp(35px,2.65vw,46px)!important;
          border:1px solid rgba(185,220,231,.44)!important;
          color:#ffe7a6!important;
          font:800 clamp(9px,.68vw,11px)/1 Inter,system-ui,sans-serif!important;
          background:rgba(15,38,47,.72)!important;
          box-shadow:inset 0 0 0 3px rgba(255,255,255,.025)!important;
        }
        .cafasso-escuela .cafasso-school-board--screen .cafasso-school-course.is-done .cafasso-school-course__progress{
          background:rgba(55,121,96,.6)!important;
          border-color:rgba(169,224,194,.55)!important;
          color:#ecfff2!important;
        }
        .cafasso-escuela .cafasso-school-board--screen .cafasso-school-loading,
        .cafasso-escuela .cafasso-school-board--screen .cafasso-school-empty{
          padding:1vw .1vw!important;
          color:rgba(228,239,242,.86)!important;
          font:600 clamp(11px,.76vw,13px)/1.4 Inter,system-ui,sans-serif!important;
        }

        @media(max-width:760px){
          .cafasso-escuela .cafasso-school-board--screen{
            left:7.5%!important;
            top:15.5%!important;
            width:58vw!important;
            aspect-ratio:16/9!important;
            padding:12px 12px 9px!important;
            border-width:5px!important;
            border-radius:8px!important;
            transform:none!important;
          }
          .cafasso-escuela .cafasso-school-board--screen .cafasso-school-board__kicker{font-size:8px!important}
          .cafasso-escuela .cafasso-school-board--screen h1{font-size:18px!important;margin:4px 0 5px!important}
          .cafasso-escuela .cafasso-school-board--screen .cafasso-school-course{padding:6px 1px!important;gap:8px!important}
          .cafasso-escuela .cafasso-school-board--screen .cafasso-school-course strong{font-size:11px!important}
          .cafasso-escuela .cafasso-school-board--screen .cafasso-school-course small{font-size:8px!important}
          .cafasso-escuela .cafasso-school-board--screen .cafasso-school-course__progress{width:29px!important;height:29px!important;font-size:8px!important}
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
