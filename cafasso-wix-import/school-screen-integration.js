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
        /* El contenido deja de ser un pizarrón agregado y vive dentro de la pantalla del ambiente. */
        .cafasso-escuela .cafasso-school-board--screen{
          left:6.4%!important;
          top:15.8%!important;
          width:28.2vw!important;
          min-height:0!important;
          max-height:48vh;
          padding:2.05vw 2vw 1.65vw!important;
          border:0!important;
          border-radius:2px!important;
          background:
            linear-gradient(112deg,rgba(255,255,255,.055),transparent 22%,transparent 72%,rgba(120,180,205,.035)),
            linear-gradient(180deg,rgba(10,24,31,.86),rgba(7,18,25,.82))!important;
          box-shadow:
            inset 0 0 0 1px rgba(184,218,230,.08),
            inset 0 0 38px rgba(0,0,0,.42),
            0 0 24px rgba(83,155,181,.08)!important;
          color:#eef6f7!important;
          overflow:hidden;
          transform:perspective(1100px) rotateY(2.4deg) rotateZ(-.22deg)!important;
          transform-origin:50% 50%!important;
          backdrop-filter:blur(1.2px);
        }
        .cafasso-escuela .cafasso-school-board--screen:before{
          content:""!important;
          position:absolute!important;
          inset:0!important;
          border:0!important;
          border-radius:inherit!important;
          background:
            radial-gradient(ellipse 65% 55% at 18% 4%,rgba(205,236,246,.09),transparent 52%),
            repeating-linear-gradient(180deg,rgba(255,255,255,.012) 0 1px,transparent 1px 4px)!important;
          pointer-events:none!important;
          mix-blend-mode:screen;
          opacity:.78;
        }
        .cafasso-escuela .cafasso-school-board--screen:after{
          content:""!important;
          position:absolute!important;
          left:5%!important;
          right:5%!important;
          top:auto!important;
          bottom:7px!important;
          height:1px!important;
          border-radius:99px!important;
          background:linear-gradient(90deg,transparent,rgba(167,218,234,.18),transparent)!important;
          box-shadow:none!important;
          pointer-events:none!important;
        }
        .cafasso-escuela .cafasso-school-board--screen .cafasso-school-board__kicker{
          color:#8fc3d2!important;
          font:800 clamp(6px,.52vw,9px)/1.2 Inter,system-ui,sans-serif!important;
          letter-spacing:.18em!important;
          text-shadow:0 0 9px rgba(108,194,219,.2);
        }
        .cafasso-escuela .cafasso-school-board--screen h1{
          margin:.45vw 0 .3vw!important;
          color:#f4fbfc!important;
          font:500 clamp(17px,1.72vw,29px)/1.02 Georgia,serif!important;
          text-shadow:0 1px 7px rgba(0,0,0,.7)!important;
        }
        .cafasso-escuela .cafasso-school-board--screen .cafasso-school-board__copy{
          max-width:25vw!important;
          margin:0 0 .8vw!important;
          color:rgba(218,235,239,.6)!important;
          font:italic clamp(7px,.62vw,10px)/1.35 Georgia,serif!important;
        }
        .cafasso-escuela .cafasso-school-board--screen .cafasso-school-board__courses{
          gap:0!important;
          padding-top:.35vw!important;
          border-top:1px solid rgba(161,207,220,.12)!important;
        }
        .cafasso-escuela .cafasso-school-board--screen .cafasso-school-course{
          gap:.7vw!important;
          padding:.53vw .2vw!important;
          border-bottom:1px solid rgba(174,214,226,.08)!important;
          color:#e7f1f3!important;
          background:transparent!important;
        }
        .cafasso-escuela .cafasso-school-board--screen .cafasso-school-course:hover{
          transform:translateX(2px)!important;
          color:#fff!important;
          background:linear-gradient(90deg,rgba(120,189,211,.06),transparent)!important;
        }
        .cafasso-escuela .cafasso-school-board--screen .cafasso-school-course strong{
          font:600 clamp(10px,.85vw,14px)/1.15 Georgia,serif!important;
        }
        .cafasso-escuela .cafasso-school-board--screen .cafasso-school-course small{
          margin-top:2px!important;
          color:rgba(184,211,219,.5)!important;
          font:700 clamp(5.5px,.43vw,7.5px)/1.2 Inter,system-ui,sans-serif!important;
        }
        .cafasso-escuela .cafasso-school-board--screen .cafasso-school-course__progress{
          width:clamp(26px,2.45vw,39px)!important;
          height:clamp(26px,2.45vw,39px)!important;
          border-color:rgba(128,190,209,.3)!important;
          color:#b8dde7!important;
          font-size:clamp(7px,.58vw,9px)!important;
          background:rgba(13,32,41,.35)!important;
          box-shadow:inset 0 0 12px rgba(87,169,194,.05)!important;
        }
        .cafasso-escuela .cafasso-school-board--screen .cafasso-school-course.is-done .cafasso-school-course__progress{
          background:rgba(66,124,111,.24)!important;
          border-color:rgba(137,198,178,.35)!important;
          color:#dff3ec!important;
        }
        .cafasso-escuela .cafasso-school-board--screen .cafasso-school-loading,
        .cafasso-escuela .cafasso-school-board--screen .cafasso-school-empty{
          padding:1vw .2vw!important;
          color:rgba(211,230,235,.58)!important;
          font-size:clamp(8px,.68vw,11px)!important;
        }

        @media(max-width:760px){
          .cafasso-escuela .cafasso-school-board--screen{
            left:7%!important;
            top:12%!important;
            width:62vw!important;
            max-height:48svh!important;
            padding:18px 16px 14px!important;
            transform:none!important;
          }
          .cafasso-escuela .cafasso-school-board--screen h1{font-size:22px!important;margin:5px 0 4px!important}
          .cafasso-escuela .cafasso-school-board--screen .cafasso-school-board__copy{max-width:none!important;font-size:9px!important;margin-bottom:8px!important}
          .cafasso-escuela .cafasso-school-board--screen .cafasso-school-course{padding:7px 2px!important}
          .cafasso-escuela .cafasso-school-board--screen .cafasso-school-course strong{font-size:12px!important}
          .cafasso-escuela .cafasso-school-board--screen .cafasso-school-course small{font-size:7px!important}
          .cafasso-escuela .cafasso-school-board--screen .cafasso-school-course__progress{width:32px!important;height:32px!important;font-size:8px!important}
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
