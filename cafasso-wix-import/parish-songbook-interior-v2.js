(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('space') !== 'parroquia') return;
  if (window.__cafassoParishSongbookInteriorV2Installed) return;
  window.__cafassoParishSongbookInteriorV2Installed = true;

  const STYLE_ID = 'cafassoParishSongbookInteriorV3Styles';

  function install() {
    const panel = document.querySelector('.cafasso-songbook-panel');
    const sheet = panel?.querySelector('.cafasso-songbook-sheet');
    if (!panel || !sheet) return false;
    if (document.getElementById(STYLE_ID)) return true;

    const kicker = sheet.querySelector('.cafasso-songbook-kicker');
    const title = sheet.querySelector('h2');
    const lead = sheet.querySelector('.cafasso-songbook-lead');
    const playerKicker = sheet.querySelector('.cafasso-songbook-player__kicker');

    if (kicker) kicker.textContent = 'CAFASSO · Parroquia';
    if (title) title.textContent = 'Cancionero';
    if (lead) lead.textContent = 'Cantos para rezar, celebrar y caminar juntos.';
    if (playerKicker) playerKicker.textContent = 'Canto elegido';

    if (!sheet.querySelector('.cafasso-songbook-page-label--left')) {
      const left = document.createElement('div');
      left.className = 'cafasso-songbook-page-label cafasso-songbook-page-label--left';
      left.textContent = 'CAFASSO · Parroquia';
      left.setAttribute('aria-hidden', 'true');
      sheet.appendChild(left);

      const right = document.createElement('div');
      right.className = 'cafasso-songbook-page-label cafasso-songbook-page-label--right';
      right.textContent = 'Música para orar';
      right.setAttribute('aria-hidden', 'true');
      sheet.appendChild(right);

      const leftPage = document.createElement('div');
      leftPage.className = 'cafasso-songbook-page-number cafasso-songbook-page-number--left';
      leftPage.textContent = '14';
      leftPage.setAttribute('aria-hidden', 'true');
      sheet.appendChild(leftPage);

      const rightPage = document.createElement('div');
      rightPage.className = 'cafasso-songbook-page-number cafasso-songbook-page-number--right';
      rightPage.textContent = '15';
      rightPage.setAttribute('aria-hidden', 'true');
      sheet.appendChild(rightPage);
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-songbook-panel{
        padding:clamp(14px,2.6vh,30px)!important;
        background:
          radial-gradient(ellipse at 50% 44%,rgba(126,89,55,.16),transparent 42%),
          rgba(7,12,11,.82)!important;
        backdrop-filter:blur(9px) saturate(.70)!important;
      }

      .cafasso-songbook-sheet{
        position:relative!important;
        display:grid!important;
        grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;
        grid-template-rows:auto auto auto minmax(0,1fr) auto!important;
        column-gap:0!important;
        width:min(1080px,95vw)!important;
        height:min(720px,90vh)!important;
        max-height:90vh!important;
        overflow:hidden!important;
        padding:58px 62px 42px!important;
        border:8px solid #68242a!important;
        border-radius:11px 18px 18px 11px!important;
        background:
          linear-gradient(90deg,
            rgba(112,74,41,.13) 0%,
            transparent 3.3%,
            transparent 46.9%,
            rgba(82,52,29,.12) 48.5%,
            rgba(255,255,255,.44) 49.65%,
            rgba(85,54,30,.17) 50.35%,
            transparent 51.8%,
            transparent 96.7%,
            rgba(103,67,38,.10) 100%),
          radial-gradient(circle at 18% 10%,rgba(255,255,255,.28),transparent 24%),
          radial-gradient(circle at 84% 86%,rgba(120,82,46,.07),transparent 31%),
          repeating-linear-gradient(0deg,rgba(105,76,47,.018) 0 1px,transparent 1px 8px),
          linear-gradient(90deg,#f3e7cd 0 49.8%,#eedfc2 50.2% 100%)!important;
        box-shadow:
          0 40px 110px rgba(0,0,0,.64),
          0 9px 0 #351116,
          0 14px 18px rgba(29,13,10,.30),
          inset 22px 0 34px rgba(68,42,23,.07),
          inset -20px 0 30px rgba(68,42,23,.055)!important;
        color:#3c2e24!important;
        font-family:Georgia,'Times New Roman',serif!important;
      }

      .cafasso-songbook-sheet:before{
        display:block!important;
        content:""!important;
        position:absolute!important;
        left:50%!important;
        top:21px!important;
        bottom:21px!important;
        width:14px!important;
        transform:translateX(-50%)!important;
        background:
          linear-gradient(90deg,
            rgba(61,38,22,.18),
            rgba(255,255,255,.45) 39%,
            rgba(73,43,24,.17) 60%,
            transparent 100%)!important;
        border:0!important;
        box-shadow:none!important;
        pointer-events:none!important;
        z-index:1!important;
      }

      .cafasso-songbook-sheet:after{
        content:""!important;
        position:absolute!important;
        inset:14px!important;
        border:1px solid rgba(119,82,46,.07)!important;
        border-radius:6px 12px 12px 6px!important;
        box-shadow:inset 0 0 40px rgba(81,52,29,.028)!important;
        pointer-events:none!important;
        z-index:0!important;
      }

      .cafasso-songbook-close{
        right:18px!important;
        top:17px!important;
        z-index:10!important;
        width:34px!important;
        height:34px!important;
        border:0!important;
        border-radius:50%!important;
        background:rgba(104,61,45,.06)!important;
        color:#795645!important;
        font:26px/1 Georgia,serif!important;
        box-shadow:none!important;
        transition:background .16s ease,transform .16s ease!important;
      }
      .cafasso-songbook-close:hover{
        background:rgba(104,61,45,.13)!important;
        transform:rotate(4deg)!important;
      }

      .cafasso-songbook-page-label{
        position:absolute;
        top:27px;
        z-index:3;
        color:#9d7758;
        font:700 8px/1 Georgia,serif;
        letter-spacing:.18em;
        text-transform:uppercase;
        pointer-events:none;
      }
      .cafasso-songbook-page-label:after{
        content:"";
        display:inline-block;
        width:54px;
        height:1px;
        margin:0 0 2px 12px;
        background:rgba(132,91,54,.27);
      }
      .cafasso-songbook-page-label--left{left:67px}
      .cafasso-songbook-page-label--right{left:calc(50% + 61px)}

      .cafasso-songbook-page-number{
        position:absolute;
        bottom:24px;
        z-index:3;
        color:#947458;
        font:11px/1 Georgia,serif;
        pointer-events:none;
      }
      .cafasso-songbook-page-number--left{left:67px}
      .cafasso-songbook-page-number--right{right:66px}

      .cafasso-songbook-kicker,
      .cafasso-songbook-sheet h2,
      .cafasso-songbook-lead,
      .cafasso-songbook-groups,
      .cafasso-songbook-player,
      .cafasso-songbook-footnote{
        position:relative;
        z-index:3;
      }

      .cafasso-songbook-kicker{
        grid-column:1!important;
        grid-row:1!important;
        margin:9px 51px 7px 7px!important;
        color:#a16d4b!important;
        font:600 10px/1 Georgia,serif!important;
        letter-spacing:.11em!important;
        text-transform:none!important;
      }

      .cafasso-songbook-sheet h2{
        grid-column:1!important;
        grid-row:2!important;
        margin:0 52px 10px 6px!important;
        color:#7a2f2c!important;
        font:600 clamp(39px,4.2vw,54px)/.98 Georgia,serif!important;
        letter-spacing:-.025em!important;
      }
      .cafasso-songbook-sheet h2:after{
        content:"✦";
        display:block;
        margin-top:9px;
        color:#a67b4c;
        font:12px/1 Georgia,serif;
        letter-spacing:.4em;
      }

      .cafasso-songbook-lead{
        grid-column:1!important;
        grid-row:3!important;
        margin:0 52px 21px 7px!important;
        max-width:365px!important;
        color:#79614c!important;
        font:italic 14px/1.5 Georgia,serif!important;
      }

      .cafasso-songbook-layout{display:contents!important}

      .cafasso-songbook-groups{
        grid-column:1!important;
        grid-row:4 / span 2!important;
        min-height:0!important;
        max-height:100%!important;
        overflow:auto!important;
        margin:0 49px 0 7px!important;
        padding:0 8px 30px 0!important;
        scrollbar-width:thin!important;
        scrollbar-color:rgba(112,78,47,.20) transparent!important;
      }
      .cafasso-songbook-groups::-webkit-scrollbar{width:4px}
      .cafasso-songbook-groups::-webkit-scrollbar-thumb{
        background:rgba(112,78,47,.18);
        border-radius:9px;
      }

      .cafasso-songbook-group{
        margin:0 0 20px!important;
        padding:0!important;
        border:0!important;
        background:transparent!important;
      }
      .cafasso-songbook-group + .cafasso-songbook-group{
        padding-top:16px!important;
        border-top:1px solid rgba(128,88,52,.14)!important;
      }
      .cafasso-songbook-group__title{
        display:flex!important;
        align-items:baseline!important;
        justify-content:space-between!important;
        gap:12px!important;
        margin:0 0 5px!important;
      }
      .cafasso-songbook-group__title strong{
        color:#57392e!important;
        font:600 20px/1.1 Georgia,serif!important;
      }
      .cafasso-songbook-group__title span{
        color:#a38365!important;
        font:600 8px/1 Georgia,serif!important;
        letter-spacing:.08em!important;
        text-transform:none!important;
      }
      .cafasso-songbook-group__copy{
        margin:0 0 9px!important;
        color:#8b725d!important;
        font:italic 11.5px/1.4 Georgia,serif!important;
      }

      .cafasso-songbook-track{
        position:relative!important;
        display:grid!important;
        grid-template-columns:28px minmax(0,1fr) auto!important;
        align-items:center!important;
        gap:8px!important;
        min-height:48px!important;
        padding:7px 1px!important;
        border:0!important;
        border-top:1px solid rgba(126,87,52,.10)!important;
        background:transparent!important;
      }
      .cafasso-songbook-track:before{
        content:"♪";
        display:grid;
        place-items:center;
        width:22px;
        height:22px;
        border-radius:50%;
        color:#9b644b;
        background:rgba(144,78,63,.055);
        font:13px/1 Georgia,serif;
      }
      .cafasso-songbook-track__copy{
        grid-column:2!important;
        min-width:0!important;
      }
      .cafasso-songbook-track__copy strong{
        display:block!important;
        color:#4b372d!important;
        font:600 14px/1.2 Georgia,serif!important;
      }
      .cafasso-songbook-track__copy span{
        display:block!important;
        margin-top:2px!important;
        color:#8a725f!important;
        font:italic 10.5px/1.3 Georgia,serif!important;
      }
      .cafasso-songbook-play{
        grid-column:3!important;
        min-width:65px!important;
        padding:6px 3px!important;
        border:0!important;
        border-bottom:1px solid rgba(121,79,52,.24)!important;
        border-radius:0!important;
        background:transparent!important;
        color:#7c5842!important;
        font:700 9.5px/1 Georgia,serif!important;
        letter-spacing:.02em!important;
        box-shadow:none!important;
      }
      .cafasso-songbook-play:hover{
        transform:none!important;
        background:transparent!important;
        color:#7a302d!important;
        border-bottom-color:#7a302d!important;
      }
      .cafasso-songbook-play.is-playing{
        background:transparent!important;
        border-color:#8f3935!important;
        color:#8f3935!important;
      }

      .cafasso-songbook-player{
        grid-column:2!important;
        grid-row:1 / span 4!important;
        position:relative!important;
        top:auto!important;
        align-self:stretch!important;
        margin:8px 7px 0 57px!important;
        padding:39px 13px 10px!important;
        border:0!important;
        background:transparent!important;
        box-shadow:none!important;
        overflow:auto!important;
        scrollbar-width:thin!important;
        scrollbar-color:rgba(110,78,46,.18) transparent!important;
      }
      .cafasso-songbook-player:before{
        content:"";
        position:absolute;
        left:0;
        right:0;
        top:27px;
        height:1px;
        background:rgba(128,88,52,.19);
        pointer-events:none;
      }
      .cafasso-songbook-player:after{
        content:"♫";
        position:absolute;
        right:9px;
        top:43px;
        color:rgba(126,72,52,.13);
        font:52px/1 Georgia,serif;
        transform:rotate(-7deg);
        pointer-events:none;
      }
      .cafasso-songbook-player__kicker{
        margin:0 0 10px!important;
        color:#9a6f50!important;
        font:600 9px/1 Georgia,serif!important;
        letter-spacing:.13em!important;
        text-transform:uppercase!important;
      }
      .cafasso-songbook-player h3{
        max-width:355px!important;
        margin:0 0 8px!important;
        padding-right:45px!important;
        color:#7b302d!important;
        font:600 clamp(29px,3vw,40px)/1.03 Georgia,serif!important;
        letter-spacing:-.02em!important;
      }
      .cafasso-songbook-player p{
        min-height:34px!important;
        margin:0 0 18px!important;
        max-width:350px!important;
        color:#7d6551!important;
        font:italic 13.5px/1.45 Georgia,serif!important;
      }

      .cafasso-songbook-player__frame{
        position:relative!important;
        margin:4px 0 0!important;
        aspect-ratio:16/9!important;
        border:7px solid #e8d8b8!important;
        outline:1px solid rgba(102,69,40,.17)!important;
        background:
          radial-gradient(circle at 50% 45%,rgba(104,71,43,.07),transparent 42%),
          repeating-linear-gradient(180deg,transparent 0 27px,rgba(111,79,44,.045) 27px 28px),
          #eadcc0!important;
        box-shadow:
          0 7px 14px rgba(69,44,27,.10),
          inset 0 0 16px rgba(35,24,16,.06)!important;
        overflow:hidden!important;
      }
      .cafasso-songbook-player__frame iframe{
        position:relative;
        z-index:1;
        width:100%!important;
        height:100%!important;
        border:0!important;
      }
      .cafasso-songbook-player__empty{
        position:relative!important;
        height:100%!important;
        display:grid!important;
        place-items:center!important;
        padding:34px 30px 24px!important;
        color:#826b57!important;
        background:transparent!important;
        font:italic 14px/1.55 Georgia,serif!important;
        text-align:center!important;
      }
      .cafasso-songbook-player__empty:before{
        content:"♫";
        position:absolute;
        top:18%;
        left:50%;
        transform:translateX(-50%);
        color:rgba(121,79,50,.16);
        font:32px/1 Georgia,serif;
      }

      .cafasso-songbook-player__source{
        margin-top:11px!important;
        padding-top:9px!important;
        border-top:1px solid rgba(124,85,51,.12)!important;
        color:#8d745f!important;
        font:10px/1.35 Georgia,serif!important;
      }
      .cafasso-songbook-player__source a{
        color:#79533e!important;
        font-weight:700!important;
        text-decoration:none!important;
        border-bottom:1px solid rgba(121,82,58,.24)!important;
      }

      .cafasso-songbook-footnote{
        grid-column:2!important;
        grid-row:5!important;
        align-self:end!important;
        margin:14px 15px 0 58px!important;
        padding:11px 0 0!important;
        border-top:1px solid rgba(126,87,52,.11)!important;
        color:#8d735d!important;
        font:italic 10px/1.45 Georgia,serif!important;
      }

      .cafasso-songbook-spotify-status{
        margin:0 0 13px!important;
        padding:0 0 12px!important;
        border:0!important;
        border-bottom:1px solid rgba(126,87,52,.12)!important;
        border-radius:0!important;
        background:transparent!important;
        color:#806854!important;
        font:italic 11px/1.45 Georgia,serif!important;
      }
      .cafasso-songbook-spotify-badge{
        display:inline-flex!important;
        align-items:center!important;
        gap:6px!important;
        margin:0 0 7px!important;
        color:#496b50!important;
        font:700 8px/1 Georgia,serif!important;
        letter-spacing:.08em!important;
        text-transform:uppercase!important;
      }
      .cafasso-songbook-spotify-badge span{
        width:7px!important;
        height:7px!important;
        border-radius:50%!important;
        background:#3f7b4a!important;
        box-shadow:0 0 0 3px rgba(63,123,74,.09)!important;
      }
      .cafasso-songbook-search{
        margin:0 0 15px!important;
        padding:0 0 14px!important;
        border-bottom:1px solid rgba(126,87,52,.12)!important;
      }
      .cafasso-songbook-search label{
        display:block!important;
        margin:0 0 6px!important;
        color:#9a7650!important;
        font:700 8px/1 Georgia,serif!important;
        letter-spacing:.11em!important;
        text-transform:uppercase!important;
      }
      .cafasso-songbook-search__field{
        display:grid!important;
        grid-template-columns:22px minmax(0,1fr)!important;
        align-items:center!important;
        gap:5px!important;
        padding:7px 9px!important;
        border:1px solid rgba(121,79,52,.18)!important;
        border-radius:3px!important;
        background:rgba(255,251,240,.23)!important;
        box-shadow:inset 0 1px rgba(255,255,255,.28)!important;
      }
      .cafasso-songbook-search__field span{
        color:#9b7759!important;
        font:18px/1 Georgia,serif!important;
      }
      .cafasso-songbook-search__field input{
        width:100%!important;
        padding:0!important;
        border:0!important;
        outline:0!important;
        background:transparent!important;
        color:#503a2f!important;
        font:italic 12.5px/1.3 Georgia,serif!important;
      }
      .cafasso-songbook-search__field input::placeholder{color:#9b836e!important}
      .cafasso-songbook-search small{
        display:block!important;
        margin-top:5px!important;
        color:#a18973!important;
        font:9.5px/1.2 Georgia,serif!important;
      }
      .cafasso-songbook-search-empty{
        margin:18px 0!important;
        color:#806854!important;
        font:italic 12.5px/1.5 Georgia,serif!important;
      }
      .cafasso-songbook-track.is-active{
        background:linear-gradient(90deg,rgba(125,57,51,.07),transparent 82%)!important;
      }
      .cafasso-songbook-track.is-active:before{
        content:"♫"!important;
        color:#7b302d!important;
        background:rgba(123,48,45,.09)!important;
      }
      .cafasso-songbook-track.is-active .cafasso-songbook-track__copy strong{
        color:#7b302d!important;
      }
      .cafasso-songbook-track.is-playing{
        box-shadow:inset 2px 0 0 rgba(123,48,45,.42)!important;
      }
      .cafasso-songbook-play.is-active{
        color:#8f3935!important;
        border-bottom-color:rgba(143,57,53,.4)!important;
      }

      @media(max-height:720px) and (min-width:761px){
        .cafasso-songbook-sheet{
          height:calc(100dvh - 20px)!important;
          padding-top:48px!important;
          padding-bottom:34px!important;
        }
        .cafasso-songbook-page-label{top:22px}
        .cafasso-songbook-page-number{bottom:18px}
        .cafasso-songbook-sheet h2{font-size:41px!important}
        .cafasso-songbook-lead{margin-bottom:14px!important}
        .cafasso-songbook-group{margin-bottom:13px!important}
        .cafasso-songbook-track{min-height:41px!important;padding:5px 1px!important}
        .cafasso-songbook-player{padding-top:31px!important}
      }

      @media(max-width:760px){
        .cafasso-songbook-panel{
          padding:7px!important;
          align-items:flex-end!important;
        }
        .cafasso-songbook-sheet{
          display:block!important;
          width:100%!important;
          height:auto!important;
          max-height:94dvh!important;
          overflow:auto!important;
          padding:43px 22px 30px!important;
          border-width:6px!important;
          border-radius:15px 15px 4px 4px!important;
          background:
            radial-gradient(circle at 20% 10%,rgba(255,255,255,.26),transparent 23%),
            repeating-linear-gradient(0deg,rgba(105,76,47,.018) 0 1px,transparent 1px 8px),
            linear-gradient(145deg,#f3e7cd,#ead8b8 76%,#ddc29a)!important;
          box-shadow:0 23px 65px rgba(0,0,0,.60),0 6px 0 #351116!important;
        }
        .cafasso-songbook-sheet:before{display:none!important}
        .cafasso-songbook-sheet:after{inset:9px!important}
        .cafasso-songbook-page-label,
        .cafasso-songbook-page-number{display:none!important}
        .cafasso-songbook-kicker,
        .cafasso-songbook-sheet h2,
        .cafasso-songbook-lead{
          margin-left:0!important;
          margin-right:36px!important;
        }
        .cafasso-songbook-sheet h2{font-size:39px!important}
        .cafasso-songbook-groups{
          max-height:none!important;
          overflow:visible!important;
          margin:0!important;
          padding:0 0 18px!important;
        }
        .cafasso-songbook-player{
          margin:20px 0 0!important;
          padding:31px 0 0!important;
          border-top:2px solid rgba(128,88,52,.15)!important;
          overflow:visible!important;
        }
        .cafasso-songbook-player:before{top:12px!important}
        .cafasso-songbook-player:after{top:34px!important;right:4px!important;font-size:40px!important}
        .cafasso-songbook-player h3{font-size:30px!important}
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