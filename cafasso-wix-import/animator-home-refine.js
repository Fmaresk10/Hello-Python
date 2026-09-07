(()=>{
  if(window.__cafassoAnimatorHomeRefineInstalled)return;
  window.__cafassoAnimatorHomeRefineInstalled=true;

  const params=new URLSearchParams(location.search);
  const root=document.documentElement;
  const role=String(root.dataset.cafassoRole||'').toLowerCase();
  const preview=String(root.dataset.cafassoPreviewRole||params.get('previewRole')||'').toLowerCase();
  if(role!=='animador'&&preview!=='animador'&&!params.get('previewUser'))return;

  const style=document.createElement('style');
  style.id='cafassoAnimatorHomeRefineStyles';
  style.textContent=`
    html[data-cafasso-home-v2="1"]{
      --cafasso-font-display:Georgia,'Times New Roman',serif;
      --cafasso-font-ui:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
    }

    html[data-cafasso-home-v2="1"] .cafasso-home-v2,
    html[data-cafasso-home-v2="1"] .side,
    html[data-cafasso-home-v2="1"] .cafasso-daily-word{
      font-family:var(--cafasso-font-ui)!important;
    }
    html[data-cafasso-home-v2="1"] .cafasso-home-v2 button,
    html[data-cafasso-home-v2="1"] .cafasso-home-v2 input,
    html[data-cafasso-home-v2="1"] .cafasso-home-v2 textarea,
    html[data-cafasso-home-v2="1"] .cafasso-home-v2 select,
    html[data-cafasso-home-v2="1"] .side button,
    html[data-cafasso-home-v2="1"] .side a{
      font-family:var(--cafasso-font-ui)!important;
    }
    html[data-cafasso-home-v2="1"] .cafasso-home-title,
    html[data-cafasso-home-v2="1"] .cafasso-home-hero h2,
    html[data-cafasso-home-v2="1"] .cafasso-home-section-head h3,
    html[data-cafasso-home-v2="1"] .cafasso-home-course h4,
    html[data-cafasso-home-v2="1"] .cafasso-home-next-title h3,
    html[data-cafasso-home-v2="1"] .cafasso-home-word-slot .cafasso-dw-main strong,
    html[data-cafasso-home-v2="1"] .cafasso-home-word-placeholder h3,
    html[data-cafasso-home-v2="1"] .cafasso-home-visual-quote,
    html[data-cafasso-home-v2="1"] .motto{
      font-family:var(--cafasso-font-display)!important;
    }
    html[data-cafasso-home-v2="1"] .cafasso-home-kicker,
    html[data-cafasso-home-v2="1"] .cafasso-home-sub,
    html[data-cafasso-home-v2="1"] .cafasso-home-eyebrow,
    html[data-cafasso-home-v2="1"] .cafasso-home-course-name,
    html[data-cafasso-home-v2="1"] .cafasso-home-desc,
    html[data-cafasso-home-v2="1"] .cafasso-home-progress-row,
    html[data-cafasso-home-v2="1"] .cafasso-home-course-meta,
    html[data-cafasso-home-v2="1"] .cafasso-home-next-item,
    html[data-cafasso-home-v2="1"] .cafasso-home-word-slot .cafasso-dw-kicker,
    html[data-cafasso-home-v2="1"] .cafasso-home-word-slot .cafasso-dw-main span,
    html[data-cafasso-home-v2="1"] .cafasso-home-word-slot .cafasso-dw-readings,
    html[data-cafasso-home-v2="1"] .cafasso-home-word-slot .cafasso-dw-action,
    html[data-cafasso-home-v2="1"] .cafasso-home-visual-quote small{
      font-family:var(--cafasso-font-ui)!important;
    }

    html[data-cafasso-home-v2="1"] .brand{gap:14px!important;align-items:center!important}
    html[data-cafasso-home-v2="1"] .brand a{gap:14px!important;align-items:center!important}
    html[data-cafasso-home-v2="1"] .brand img{width:60px!important;height:70px!important;max-width:none!important;opacity:1!important;filter:drop-shadow(0 3px 8px rgba(0,0,0,.14))!important;flex:0 0 auto!important}
    html[data-cafasso-home-v2="1"] .brand b{font-family:var(--cafasso-font-display)!important;font-size:31px!important;line-height:1!important;letter-spacing:-.03em!important;color:#fff!important}
    html[data-cafasso-home-v2="1"] .brand small{display:none!important}
    html[data-cafasso-home-v2="1"] .nav{margin-top:38px!important}

    html[data-cafasso-home-v2="1"] .cafasso-home-hero{grid-template-columns:minmax(0,1.45fr) minmax(235px,.55fr)!important;background:linear-gradient(118deg,#E7D8C5 0%,#F2E8DA 60%,#D9C7AE 100%)!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-visual{min-height:355px!important;padding:30px!important;background:linear-gradient(155deg,#2B4B61 0%,#173954 58%,#112D46 100%)!important;display:flex!important;align-items:flex-end!important;justify-content:flex-start!important;overflow:hidden!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-visual:before{content:'“'!important;position:absolute!important;width:auto!important;height:auto!important;border:0!important;box-shadow:none!important;border-radius:0!important;right:22px!important;top:2px!important;font-family:var(--cafasso-font-display)!important;font-size:112px!important;font-weight:400!important;line-height:1!important;color:rgba(242,201,76,.16)!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-visual:after{content:'';position:absolute;left:30px;top:31px;width:34px;height:3px;border-radius:999px;background:#C89B31}
    html[data-cafasso-home-v2="1"] .cafasso-home-visual-mark{display:none!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-visual-quote{text-align:left!important;color:#F8F1E6!important;font-family:var(--cafasso-font-display)!important;font-style:italic!important;font-size:23px!important;line-height:1.28!important;max-width:215px!important;margin-top:auto!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-visual-quote small{margin-top:15px!important;color:#E5C66D!important;font-size:9px!important;letter-spacing:.14em!important}

    @media(max-width:680px){
      html[data-cafasso-home-v2="1"] .cafasso-home-visual{min-height:155px!important;padding:22px!important}
      html[data-cafasso-home-v2="1"] .cafasso-home-visual:after{left:22px;top:22px}
      html[data-cafasso-home-v2="1"] .cafasso-home-visual-quote{font-size:19px!important;max-width:220px!important}
    }
  `;
  document.head.appendChild(style);

  function firstName(){
    try{
      const s=JSON.parse(localStorage.getItem('cafassoSession')||'null');
      const n=String(s&&s.user&&s.user.name||'').trim();
      if(n)return n.split(/\s+/)[0];
    }catch(e){}
    const h=document.querySelector('#main .top h1');
    const raw=String(h&&h.textContent||'').replace(/[!¡👋]/g,'').replace(/^Buenas,?\s*/i,'').trim();
    return raw.split(/\s+/)[0]||'animador/a';
  }

  let queued=false;
  function apply(){
    queued=false;
    if(root.dataset.cafassoHomeV2!=='1')return;
    const title=document.querySelector('.cafasso-home-title');
    const desired='Buenas, '+firstName();
    if(title&&title.textContent!==desired)title.textContent=desired;
    const quote=document.querySelector('.cafasso-home-visual-quote');
    const desiredQuote='“Buenos cristianos y honrados ciudadanos”<small>Don Bosco</small>';
    if(quote&&quote.innerHTML!==desiredQuote)quote.innerHTML=desiredQuote;
  }

  function schedule(){if(queued)return;queued=true;requestAnimationFrame(apply);}
  schedule();
  const target=document.getElementById('app')||document.body;
  new MutationObserver(schedule).observe(target,{childList:true,subtree:true});
})();
