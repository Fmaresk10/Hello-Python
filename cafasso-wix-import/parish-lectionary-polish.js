(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('space') !== 'parroquia') return;
  if (window.__cafassoParishLectionaryPolishInstalled) return;
  window.__cafassoParishLectionaryPolishInstalled = true;

  const STYLE_ID = 'cafassoParishLectionaryPolishStyles';

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-parish-lectionary.is-realistic .cafasso-parish-page--left:before,
      .cafasso-parish-lectionary.is-realistic .cafasso-parish-page--left:after,
      .cafasso-parish-lectionary.is-realistic .cafasso-parish-page--right:before,
      .cafasso-parish-lectionary.is-realistic .cafasso-parish-page--right:after{opacity:0!important}

      .cafasso-parish-lectionary-label{
        position:absolute;left:50%;top:30px;z-index:8;width:154px;
        transform:translateX(-50%) rotate(-.15deg);
        color:#55222b;text-align:center;font:700 15px/1 Georgia,serif;
        letter-spacing:.008em;white-space:nowrap;
        text-shadow:0 1px 0 rgba(255,255,255,.96);pointer-events:none
      }
      .cafasso-parish-lectionary-label:after{
        content:"✝";display:block;margin-top:8px;color:#9b713e;
        font:18px/1 Georgia,serif;text-shadow:0 1px rgba(255,255,255,.62)
      }

      .cafasso-parish-panel{
        background:radial-gradient(circle at 50% 35%,rgba(106,76,48,.17),rgba(4,10,9,.86) 70%)!important;
        backdrop-filter:blur(8px) saturate(.78)!important
      }
      .cafasso-parish-sheet{
        isolation:isolate;width:min(980px,94vw)!important;max-height:88vh!important;overflow:auto!important;
        padding:48px 58px 38px!important;border:7px solid #57202a!important;
        border-radius:13px 22px 22px 13px!important;
        background:linear-gradient(90deg,#e6d2a8 0,#f9ebcf 4%,#fff7e2 47.8%,#c9ae82 49.4%,#aa8b61 50%,#ccb185 50.7%,#fff6df 52.2%,#f8e8c7 96%,#dfc69a 100%)!important;
        box-shadow:0 34px 90px rgba(0,0,0,.58),0 9px 0 #321119,inset 16px 0 26px rgba(83,54,26,.08),inset -16px 0 26px rgba(83,54,26,.08)!important;
        color:#3f3025!important;transform:none!important
      }
      .cafasso-parish-sheet:before{
        content:""!important;position:absolute!important;left:50%!important;top:18px!important;bottom:18px!important;width:20px!important;
        transform:translateX(-50%)!important;
        background:linear-gradient(90deg,transparent,rgba(85,56,28,.13) 36%,rgba(255,255,255,.6) 49%,rgba(78,50,24,.16) 63%,transparent)!important;
        box-shadow:none!important;pointer-events:none!important;z-index:0!important
      }
      .cafasso-parish-sheet:after{
        content:"";position:absolute;inset:11px 12px;z-index:0;border:1px solid rgba(139,104,56,.19);
        border-radius:6px 14px 14px 6px;pointer-events:none
      }
      .cafasso-parish-close{
        z-index:5!important;right:19px!important;top:17px!important;width:36px!important;height:36px!important;
        border:1px solid rgba(104,72,39,.25)!important;background:rgba(255,247,226,.8)!important;color:#5d4230!important;
        box-shadow:0 3px 8px rgba(61,38,20,.12)!important
      }
      .cafasso-parish-sheet [data-parish-word-body]{
        position:relative;z-index:2;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);
        column-gap:74px;align-items:start;min-height:490px
      }
      .cafasso-parish-kicker{
        grid-column:1;grid-row:1;margin:0!important;color:#8a2935!important;
        font:800 9px/1.2 Inter,system-ui,sans-serif!important;letter-spacing:.18em!important;text-transform:uppercase
      }
      .cafasso-parish-sheet h2{
        grid-column:1;grid-row:2;margin:9px 0 5px!important;color:#4d2027!important;
        font:500 clamp(38px,5vw,58px)/.98 Georgia,serif!important;letter-spacing:-.025em
      }
      .cafasso-parish-date{
        grid-column:1;grid-row:3;margin:4px 0 25px!important;color:#806850!important;
        font:italic 14px/1.45 Georgia,serif!important
      }
      .cafasso-parish-gospel{
        grid-column:2;grid-row:1 / span 4;margin:0!important;padding:6px 4px 24px!important;
        border:0!important;background:transparent!important
      }
      .cafasso-parish-gospel small{
        margin-bottom:10px!important;color:#8a2935!important;font-size:9px!important;letter-spacing:.17em!important
      }
      .cafasso-parish-gospel strong{
        color:#33271f!important;font:500 clamp(31px,4vw,45px)/1.04 Georgia,serif!important;letter-spacing:-.018em
      }
      .cafasso-parish-season{margin-top:13px!important;color:#9a7653!important;font-size:9px!important;letter-spacing:.11em!important}
      .cafasso-parish-readings{grid-column:1;grid-row:4;display:block!important;margin:4px 0 20px!important}
      .cafasso-parish-reading{
        min-height:0!important;padding:10px 0 11px!important;border:0!important;border-bottom:1px solid rgba(111,79,45,.18)!important;
        background:transparent!important
      }
      .cafasso-parish-reading:first-child{border-top:1px solid rgba(111,79,45,.18)!important}
      .cafasso-parish-reading small{margin-bottom:4px!important;color:#986f4c!important;font-size:7.5px!important}
      .cafasso-parish-reading strong{color:#4b3a2d!important;font:600 13px/1.32 Inter,system-ui,sans-serif!important}
      .cafasso-parish-reflection{
        grid-column:2;grid-row:5;position:relative;margin:5px 0 0!important;padding:3px 4px 4px 31px!important;
        border:0!important;background:transparent!important;color:#725b45!important;font:italic 15px/1.58 Georgia,serif!important
      }
      .cafasso-parish-reflection:before{
        content:"“";position:absolute;left:1px;top:-11px;color:rgba(138,41,53,.52);font:46px/1 Georgia,serif
      }
      .cafasso-parish-actions{
        grid-column:1 / -1;grid-row:6;display:flex!important;justify-content:center;gap:12px!important;
        margin:29px 0 0!important;padding-top:20px;border-top:1px solid rgba(111,79,45,.16)
      }
      .cafasso-parish-action{
        min-height:42px!important;padding:10px 16px!important;border:1px solid #6d2631!important;border-radius:999px!important;
        background:linear-gradient(#742b36,#581f29)!important;color:#fff8e7!important;box-shadow:0 5px 12px rgba(76,29,36,.17)!important
      }
      .cafasso-parish-action--quiet{
        background:rgba(255,247,226,.48)!important;color:#684a35!important;border-color:rgba(117,78,44,.26)!important;box-shadow:none!important
      }
      .cafasso-parish-loading{grid-column:1 / -1;margin:120px 0!important;text-align:center;color:#78604a!important}

      @media(max-width:760px){
        .cafasso-parish-lectionary-label{top:21px;width:108px;font-size:10px}.cafasso-parish-lectionary-label:after{margin-top:5px;font-size:13px}
        .cafasso-parish-sheet{
          width:96vw!important;max-height:91vh!important;padding:42px 25px 28px!important;border-width:5px!important;
          border-radius:10px 16px 16px 10px!important;background:linear-gradient(90deg,#ead6ad,#fff4db 7%,#fff8e8 93%,#e1c797)!important
        }
        .cafasso-parish-sheet:before{display:none!important}
        .cafasso-parish-sheet [data-parish-word-body]{display:block;min-height:0}
        .cafasso-parish-sheet h2{font-size:38px!important;margin:8px 0 5px!important}
        .cafasso-parish-date{margin-bottom:24px!important}
        .cafasso-parish-gospel{padding:9px 0 22px!important;border-top:1px solid rgba(111,79,45,.16)!important;border-bottom:1px solid rgba(111,79,45,.16)!important}
        .cafasso-parish-gospel strong{font-size:34px!important}
        .cafasso-parish-readings{margin-top:18px!important}
        .cafasso-parish-reflection{margin-top:22px!important}
        .cafasso-parish-actions{display:grid!important;grid-template-columns:1fr;margin-top:24px!important}
        .cafasso-parish-action{width:100%}
      }
    `;
    document.head.appendChild(style);
  }

  function polishLectionaryLabel() {
    const lectionary = document.querySelector('.cafasso-parish-lectionary');
    if (!lectionary) return false;
    if (!lectionary.querySelector('.cafasso-parish-lectionary-label')) {
      const label = document.createElement('span');
      label.className = 'cafasso-parish-lectionary-label';
      label.setAttribute('aria-hidden', 'true');
      label.textContent = 'Palabra del día';
      lectionary.appendChild(label);
    }
    return true;
  }

  function polishPanel() {
    const panel = document.querySelector('.cafasso-parish-panel');
    const body = panel?.querySelector('[data-parish-word-body]');
    if (!panel || !body) return false;

    const applyCopy = () => {
      const kicker = body.querySelector('.cafasso-parish-kicker');
      const title = body.querySelector('h2');
      if (kicker && kicker.textContent.trim() !== 'Leccionario') kicker.textContent = 'Leccionario';
      if (title && title.textContent.trim() === 'Hoy, escuchá.') title.textContent = 'Palabra del día';
    };

    applyCopy();
    if (body.dataset.lectionaryPolishObserver !== '1') {
      body.dataset.lectionaryPolishObserver = '1';
      const observer = new MutationObserver(() => applyCopy());
      observer.observe(body, { childList:true, subtree:true });
    }
    return true;
  }

  function boot() {
    ensureStyles();
    const labelReady = polishLectionaryLabel();
    const panelReady = polishPanel();
    return labelReady && panelReady;
  }

  let attempts = 0;
  const wait = () => {
    if (boot()) return;
    attempts += 1;
    if (attempts < 60) setTimeout(wait, 90);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wait, { once:true });
  else wait();
})();
