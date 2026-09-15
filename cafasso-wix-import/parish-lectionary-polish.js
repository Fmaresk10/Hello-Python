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
        position:absolute;left:50%;top:29px;z-index:8;width:158px;
        transform:translateX(-50%);color:#55222b;text-align:center;
        font:700 15px/1.05 Georgia,serif;letter-spacing:.006em;white-space:nowrap;
        text-shadow:0 1px 0 rgba(255,255,255,.96);pointer-events:none
      }
      .cafasso-parish-lectionary-label:after{
        content:"✝";display:block;margin-top:8px;color:#9b713e;
        font:18px/1 Georgia,serif;text-shadow:0 1px rgba(255,255,255,.62)
      }

      .cafasso-parish-panel{
        background:rgba(4,10,9,.82)!important;
        backdrop-filter:none!important
      }
      .cafasso-parish-sheet{
        position:relative!important;width:min(900px,94vw)!important;max-height:88vh!important;
        overflow:auto!important;padding:46px 52px 36px!important;
        border:6px solid #57202a!important;border-radius:12px 20px 20px 12px!important;
        background:linear-gradient(90deg,#e2cda3 0,#fbefd6 4%,#fff7e2 48.2%,#cfb78d 49.5%,#b79a6d 50%,#d2ba91 50.7%,#fff6df 52%,#f8e9ca 96%,#dec497 100%)!important;
        box-shadow:0 24px 56px rgba(0,0,0,.48),0 7px 0 #321119!important;
        color:#3f3025!important;transform:none!important
      }
      .cafasso-parish-sheet:before{
        content:""!important;position:absolute!important;left:50%!important;top:18px!important;bottom:18px!important;
        width:12px!important;transform:translateX(-50%)!important;
        background:linear-gradient(90deg,transparent,rgba(70,44,21,.12),rgba(255,255,255,.42),rgba(70,44,21,.12),transparent)!important;
        box-shadow:none!important;pointer-events:none!important
      }
      .cafasso-parish-sheet:after{
        content:"";position:absolute;inset:10px 12px;border:1px solid rgba(139,104,56,.18);
        border-radius:6px 13px 13px 6px;pointer-events:none
      }
      .cafasso-parish-close{
        z-index:5!important;right:18px!important;top:16px!important;
        background:rgba(255,247,226,.9)!important;color:#5d4230!important;
        border:1px solid rgba(104,72,39,.25)!important;box-shadow:none!important
      }
      .cafasso-parish-kicker{color:#8a2935!important}
      .cafasso-parish-sheet h2{color:#4d2027!important}
      .cafasso-parish-date{color:#806850!important}
      .cafasso-parish-gospel{
        border-top:1px solid rgba(111,79,45,.18)!important;
        border-bottom:1px solid rgba(111,79,45,.18)!important;
        background:transparent!important
      }
      .cafasso-parish-gospel small{color:#8a2935!important}
      .cafasso-parish-gospel strong{color:#33271f!important}
      .cafasso-parish-readings{gap:0!important}
      .cafasso-parish-reading{
        border:0!important;border-bottom:1px solid rgba(111,79,45,.16)!important;
        background:transparent!important
      }
      .cafasso-parish-reading:first-child{border-top:1px solid rgba(111,79,45,.16)!important}
      .cafasso-parish-reflection{
        border-left:2px solid rgba(138,41,53,.35)!important;
        background:transparent!important;color:#725b45!important
      }
      .cafasso-parish-action{
        border-radius:999px!important;border-color:#6d2631!important;
        background:linear-gradient(#742b36,#581f29)!important
      }
      .cafasso-parish-action--quiet{
        background:rgba(255,247,226,.58)!important;color:#684a35!important;
        border-color:rgba(117,78,44,.26)!important
      }

      @media(max-width:760px){
        .cafasso-parish-lectionary-label{top:21px;width:110px;font-size:10px}
        .cafasso-parish-lectionary-label:after{margin-top:5px;font-size:13px}
        .cafasso-parish-sheet{
          width:96vw!important;max-height:91vh!important;padding:42px 24px 28px!important;
          border-width:5px!important;border-radius:10px 16px 16px 10px!important;
          background:linear-gradient(90deg,#ead6ad,#fff4db 7%,#fff8e8 93%,#e1c797)!important
        }
        .cafasso-parish-sheet:before{display:none!important}
      }
    `;
    document.head.appendChild(style);
  }

  function addLectionaryLabel() {
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

  function boot() {
    ensureStyles();
    return addLectionaryLabel();
  }

  let attempts = 0;
  const wait = () => {
    if (boot()) return;
    attempts += 1;
    if (attempts < 50) setTimeout(wait, 90);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wait, { once:true });
  else wait();
})();
