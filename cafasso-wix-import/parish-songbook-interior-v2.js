(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('space') !== 'parroquia') return;
  if (window.__cafassoParishSongbookInteriorV2Installed) return;
  window.__cafassoParishSongbookInteriorV2Installed = true;

  const STYLE_ID = 'cafassoParishSongbookInteriorV2Styles';

  function install() {
    const panel = document.querySelector('.cafasso-songbook-panel');
    const sheet = panel?.querySelector('.cafasso-songbook-sheet');
    if (!panel || !sheet) return false;
    if (document.getElementById(STYLE_ID)) return true;

    const kicker = sheet.querySelector('.cafasso-songbook-kicker');
    const title = sheet.querySelector('h2');
    const playerKicker = sheet.querySelector('.cafasso-songbook-player__kicker');
    if (kicker) kicker.textContent = 'Música para orar';
    if (title) title.textContent = 'Cancionero';
    if (playerKicker) playerKicker.textContent = 'Canto elegido';

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* Interior del Cancionero: dos páginas reales, no panel de aplicación. */
      .cafasso-songbook-panel{
        padding:clamp(18px,3vh,32px)!important;
        background:
          radial-gradient(ellipse at 50% 46%,rgba(95,65,40,.18),transparent 39%),
          rgba(7,13,12,.79)!important;
        backdrop-filter:blur(7px) saturate(.72)!important;
      }

      .cafasso-songbook-sheet{
        position:relative!important;
        display:grid!important;
        grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;
        grid-template-rows:auto auto auto minmax(0,1fr) auto!important;
        column-gap:0!important;
        width:min(1040px,94vw)!important;
        height:min(700px,88vh)!important;
        max-height:88vh!important;
        overflow:hidden!important;
        padding:46px 54px 34px!important;
        border:7px solid #5f2024!important;
        border-radius:10px 17px 17px 10px!important;
        background:
          linear-gradient(90deg,
            rgba(91,57,31,.16) 0%,
            transparent 3.2%,
            transparent 47.8%,
            rgba(79,51,29,.18) 49.35%,
            rgba(255,255,255,.45) 49.9%,
            rgba(80,52,30,.17) 50.45%,
            transparent 52.1%,
            transparent 96.8%,
            rgba(91,57,31,.11) 100%),
          radial-gradient(circle at 20% 12%,rgba(255,255,255,.38),transparent 26%),
          radial-gradient(circle at 82% 83%,rgba(137,96,48,.07),transparent 30%),
          linear-gradient(90deg,#eee0c1 0 49.8%,#ead9b7 50.2% 100%)!important;
        box-shadow:
          0 38px 100px rgba(0,0,0,.62),
          0 8px 0 #361215,
          inset 20px 0 30px rgba(72,44,24,.08),
          inset -18px 0 28px rgba(72,44,24,.055)!important;
        color:#3f3126!important;
        font-family:Georgia,'Times New Roman',serif!important;
      }

      .cafasso-songbook-sheet:before{
        display:block!important;
        content:""!important;
        position:absolute!important;
        left:50%!important;
        top:18px!important;
        bottom:18px!important;
        width:10px!important;
        transform:translateX(-50%)!important;
        background:linear-gradient(90deg,rgba(75,45,25,.13),rgba(255,255,255,.42) 43%,rgba(72,43,24,.14) 60%,transparent)!important;
        border:0!important;
        box-shadow:none!important;
        pointer-events:none!important;
        z-index:0!important;
      }

      .cafasso-songbook-sheet:after{
        content:""!important;
        position:absolute!important;
        inset:15px!important;
        border:1px solid rgba(112,76,39,.09)!important;
        border-radius:5px 10px 10px 5px!important;
        box-shadow:inset 0 0 35px rgba(83,52,27,.035)!important;
        pointer-events:none!important;
        z-index:0!important;
      }

      .cafasso-songbook-close{
        right:20px!important;
        top:18px!important;
        z-index:6!important;
        width:35px!important;
        height:35px!important;
        border:0!important;
        border-radius:50%!important;
        background:rgba(91,53,36,.07)!important;
        color:#664b38!important;
        font:27px/1 Georgia,serif!important;
        box-shadow:none!important;
        transition:background .16s ease,transform .16s ease!important;
      }
      .cafasso-songbook-close:hover{background:rgba(91,53,36,.14)!important;transform:rotate(3deg)!important}

      .cafasso-songbook-kicker,
      .cafasso-songbook-sheet h2,
      .cafasso-songbook-lead,
      .cafasso-songbook-groups,
      .cafasso-songbook-player,
      .cafasso-songbook-footnote{position:relative;z-index:2}

      .cafasso-songbook-kicker{
        grid-column:1!important;
        grid-row:1!important;
        align-self:end!important;
        margin:0 48px 5px 6px!important;
        color:#9a7650!important;
        font:700 9px/1.2 Inter,system-ui,sans-serif!important;
        letter-spacing:.18em!important;
        text-transform:uppercase!important;
      }

      .cafasso-songbook-sheet h2{
        grid-column:1!important;
        grid-row:2!important;
        margin:0 48px 9px 6px!important;
        color:#472f27!important;
        font:500 clamp(37px,4.2vw,54px)/.96 Georgia,serif!important;
        letter-spacing:-.025em!important;
      }

      .cafasso-songbook-lead{
        grid-column:1!important;
        grid-row:3!important;
        margin:0 50px 20px 7px!important;
        max-width:360px!important;
        color:#7c6550!important;
        font:italic 14px/1.45 Georgia,serif!important;
      }

      .cafasso-songbook-layout{display:contents!important}

      .cafasso-songbook-groups{
        grid-column:1!important;
        grid-row:4 / span 2!important;
        align-self:start!important;
        min-height:0!important;
        max-height:100%!important;
        overflow:auto!important;
        margin:0 46px 0 6px!important;
        padding:1px 7px 16px 0!important;
        display:block!important;
        scrollbar-width:thin!important;
        scrollbar-color:rgba(110,78,46,.24) transparent!important;
      }
      .cafasso-songbook-groups::-webkit-scrollbar{width:5px}
      .cafasso-songbook-groups::-webkit-scrollbar-thumb{background:rgba(110,78,46,.2);border-radius:9px}

      .cafasso-songbook-group{
        margin:0 0 21px!important;
        padding:0!important;
        border:0!important;
        background:transparent!important;
      }
      .cafasso-songbook-group + .cafasso-songbook-group{
        padding-top:16px!important;
        border-top:1px solid rgba(112,79,44,.16)!important;
      }
      .cafasso-songbook-group__title{
        display:flex!important;
        align-items:baseline!important;
        justify-content:space-between!important;
        gap:12px!important;
        margin:0 0 4px!important;
      }
      .cafasso-songbook-group__title strong{
        color:#51382c!important;
        font:600 19px/1.1 Georgia,serif!important;
      }
      .cafasso-songbook-group__title span{
        color:#a08668!important;
        font:700 7px/1 Inter,system-ui,sans-serif!important;
        letter-spacing:.12em!important;
        text-transform:uppercase!important;
      }
      .cafasso-songbook-group__copy{
        margin:0 0 8px!important;
        color:#92785e!important;
        font:11px/1.4 Inter,system-ui,sans-serif!important;
      }

      .cafasso-songbook-track{
        position:relative!important;
        display:grid!important;
        grid-template-columns:minmax(0,1fr) auto!important;
        align-items:center!important;
        gap:12px!important;
        min-height:45px!important;
        padding:9px 2px 8px 20px!important;
        border:0!important;
        border-top:1px solid rgba(112,79,44,.11)!important;
        background:transparent!important;
      }
      .cafasso-songbook-track:before{
        content:"♪";
        position:absolute;
        left:1px;
        top:50%;
        transform:translateY(-52%);
        color:#9a7350;
        font:14px/1 Georgia,serif;
        opacity:.68;
      }
      .cafasso-songbook-track__copy strong{
        color:#4c382c!important;
        font:600 13.5px/1.2 Georgia,serif!important;
      }
      .cafasso-songbook-track__copy span{
        margin-top:2px!important;
        color:#8d755f!important;
        font:10px/1.3 Inter,system-ui,sans-serif!important;
      }
      .cafasso-songbook-play{
        min-width:66px!important;
        padding:6px 2px!important;
        border:0!important;
        border-bottom:1px solid rgba(117,81,46,.28)!important;
        border-radius:0!important;
        background:transparent!important;
        color:#76573d!important;
        font:700 9px/1 Inter,system-ui,sans-serif!important;
        letter-spacing:.025em!important;
        box-shadow:none!important;
      }
      .cafasso-songbook-play:hover{
        transform:none!important;
        background:transparent!important;
        color:#442e24!important;
        border-bottom-color:#76573d!important;
      }
      .cafasso-songbook-play.is-playing{
        background:transparent!important;
        border-color:#8e4d43!important;
        color:#8e4d43!important;
      }

      .cafasso-songbook-player{
        grid-column:2!important;
        grid-row:1 / span 4!important;
        position:relative!important;
        top:auto!important;
        align-self:stretch!important;
        margin:0 4px 0 55px!important;
        padding:54px 12px 8px!important;
        border:0!important;
        background:transparent!important;
        box-shadow:none!important;
        overflow:auto!important;
        scrollbar-width:thin!important;
        scrollbar-color:rgba(110,78,46,.2) transparent!important;
      }
      .cafasso-songbook-player:before{
        content:"♪";
        position:absolute;
        right:8px;
        top:17px;
        color:rgba(115,73,47,.16);
        font:54px/1 Georgia,serif;
        transform:rotate(-7deg);
        pointer-events:none;
      }
      .cafasso-songbook-player__kicker{
        margin:0 0 9px!important;
        color:#9a7650!important;
        font:700 8px/1 Inter,system-ui,sans-serif!important;
        letter-spacing:.18em!important;
        text-transform:uppercase!important;
      }
      .cafasso-songbook-player h3{
        max-width:360px!important;
        margin:0 0 8px!important;
        color:#49342a!important;
        font:500 clamp(27px,3vw,39px)/1.03 Georgia,serif!important;
        letter-spacing:-.02em!important;
      }
      .cafasso-songbook-player p{
        min-height:34px!important;
        margin:0 0 18px!important;
        max-width:350px!important;
        color:#826b56!important;
        font:italic 13px/1.42 Georgia,serif!important;
      }

      .cafasso-songbook-player__frame{
        position:relative!important;
        margin:4px 0 0!important;
        aspect-ratio:16/9!important;
        border:9px solid rgba(238,225,197,.9)!important;
        outline:1px solid rgba(108,75,42,.17)!important;
        background:
          radial-gradient(circle at 50% 45%,rgba(104,71,43,.09),transparent 42%),
          #e8d8b9!important;
        box-shadow:0 8px 18px rgba(70,45,27,.12)!important;
        overflow:hidden!important;
      }
      .cafasso-songbook-player__frame:after{
        content:"";
        position:absolute;
        inset:0;
        pointer-events:none;
        box-shadow:inset 0 0 16px rgba(35,24,16,.09);
      }
      .cafasso-songbook-player__frame iframe{position:relative;z-index:1;width:100%!important;height:100%!important;border:0!important}
      .cafasso-songbook-player__empty{
        position:relative!important;
        height:100%!important;
        display:grid!important;
        place-items:center!important;
        padding:28px!important;
        color:#826d57!important;
        background:
          linear-gradient(rgba(255,255,255,.11),rgba(255,255,255,.02)),
          repeating-linear-gradient(180deg,transparent 0 25px,rgba(111,79,44,.06) 25px 26px)!important;
        font:italic 14px/1.55 Georgia,serif!important;
        text-align:center!important;
      }
      .cafasso-songbook-player__empty:before{
        content:"♫";
        display:block;
        position:absolute;
        top:20%;
        left:50%;
        transform:translateX(-50%);
        color:rgba(117,80,45,.18);
        font:34px/1 Georgia,serif;
      }

      .cafasso-songbook-player__source{
        margin-top:12px!important;
        padding-top:10px!important;
        border-top:1px solid rgba(112,79,44,.13)!important;
        color:#91785f!important;
        font:9px/1.35 Inter,system-ui,sans-serif!important;
      }
      .cafasso-songbook-player__source a{
        color:#725037!important;
        font-weight:750!important;
        text-decoration:none!important;
        border-bottom:1px solid rgba(114,80,55,.28)!important;
      }

      .cafasso-songbook-footnote{
        grid-column:2!important;
        grid-row:5!important;
        align-self:end!important;
        margin:14px 14px 0 56px!important;
        padding:12px 0 0!important;
        border-top:1px solid rgba(112,79,44,.12)!important;
        color:#917961!important;
        font:9px/1.45 Inter,system-ui,sans-serif!important;
      }

      @media(max-width:760px){
        .cafasso-songbook-panel{padding:8px!important;align-items:flex-end!important}
        .cafasso-songbook-sheet{
          display:block!important;
          width:100%!important;
          height:auto!important;
          max-height:93vh!important;
          overflow:auto!important;
          padding:38px 23px 26px!important;
          border-width:5px!important;
          border-radius:14px 14px 3px 3px!important;
          background:linear-gradient(145deg,#f3e5c7,#ead7b3 72%,#dfc599)!important;
          box-shadow:0 20px 60px rgba(0,0,0,.58),0 5px 0 #361215!important;
        }
        .cafasso-songbook-sheet:before{display:none!important}
        .cafasso-songbook-sheet:after{inset:9px!important}
        .cafasso-songbook-kicker,.cafasso-songbook-sheet h2,.cafasso-songbook-lead{margin-left:0!important;margin-right:35px!important}
        .cafasso-songbook-sheet h2{font-size:38px!important}
        .cafasso-songbook-groups{max-height:none!important;overflow:visible!important;margin:0!important;padding:0 0 20px!important}
        .cafasso-songbook-player{margin:18px 0 0!important;padding:28px 0 0!important;border-top:2px solid rgba(112,79,44,.15)!important;overflow:visible!important}
        .cafasso-songbook-player:before{top:10px;right:4px;font-size:39px}
        .cafasso-songbook-player h3{font-size:29px!important}
        .cafasso-songbook-footnote{margin:18px 0 0!important}
      }

      @media(prefers-reduced-motion:reduce){
        .cafasso-songbook-close{transition:none!important}
      }
    `;
    document.head.appendChild(style);
    return true;
  }

  let attempts = 0;
  const wait = () => {
    if (install()) return;
    if (attempts < 50) {
      attempts += 1;
      setTimeout(wait, 80);
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wait, { once:true });
  else wait();
})();
