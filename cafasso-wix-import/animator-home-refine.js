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

    /* CAFASSO aventura: el inicio funciona como campamento base del juego */
    html[data-cafasso-home-v2="1"] body{
      background:#102F35 url('https://static.wixstatic.com/media/47bf07_0d0a5e3ec41543cbb9d6171058171b28~mv2.png') center/cover fixed no-repeat!important;
      overflow-x:hidden;
    }
    html[data-cafasso-home-v2="1"] .shell{display:block!important;min-height:100vh!important}
    html[data-cafasso-home-v2="1"] .side{
      position:fixed!important;left:0;top:0;width:230px;height:100vh;z-index:30;
      background:linear-gradient(90deg,rgba(6,27,33,.9),rgba(6,27,33,.43),transparent)!important;
      border-radius:0!important;box-shadow:none!important;padding:27px 16px!important;
    }
    html[data-cafasso-home-v2="1"] .side .brand{margin-bottom:34px!important;padding:0!important}
    html[data-cafasso-home-v2="1"] .side .nav{margin-top:0!important;gap:7px!important}
    html[data-cafasso-home-v2="1"] .side .nav button{background:rgba(8,35,39,.38)!important;border:1px solid rgba(244,216,137,.18)!important;backdrop-filter:blur(8px);color:#FFF9E8!important;text-shadow:0 1px 8px rgba(0,0,0,.4)!important}
    html[data-cafasso-home-v2="1"] .side .nav button.active,html[data-cafasso-home-v2="1"] .side .nav button:hover{background:rgba(244,216,137,.9)!important;border-color:#FFF0B4!important;color:#17302F!important;text-shadow:none!important}
    html[data-cafasso-home-v2="1"] .side .foot{left:16px!important;right:16px!important;bottom:20px!important}
    html[data-cafasso-home-v2="1"] .side .motto{border-top-color:rgba(244,216,137,.25)!important;color:#F4D889!important}
    html[data-cafasso-home-v2="1"] main{max-width:none!important;width:100%!important;min-height:100vh;padding:0!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-v2{max-width:none!important;min-height:100vh;padding:42px 7vw 54px 250px!important;position:relative}
    html[data-cafasso-home-v2="1"] .cafasso-home-v2:before{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(6,27,33,.12),rgba(6,27,33,.34));pointer-events:none;z-index:0}
    html[data-cafasso-home-v2="1"] .cafasso-home-v2>*{position:relative;z-index:1}
    html[data-cafasso-home-v2="1"] .cafasso-home-head{align-items:flex-end;margin-bottom:22px!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-kicker{color:#F4D889!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-title{color:#FFF9E8!important;text-shadow:0 2px 14px rgba(0,0,0,.35)!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-sub{color:#DDE9DF!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-feature-grid{grid-template-columns:minmax(0,1.45fr) minmax(260px,.7fr)!important;gap:18px!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-hero{min-height:350px!important;border:1px solid rgba(244,216,137,.42)!important;border-radius:22px!important;background:linear-gradient(135deg,rgba(10,39,45,.9),rgba(24,74,67,.77))!important;box-shadow:0 18px 42px rgba(0,0,0,.23)!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-hero:before{background:radial-gradient(circle at 78% 20%,rgba(244,216,137,.22),transparent 28%)!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-hero-copy{padding:34px 36px!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-eyebrow{color:#F4D889!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-hero h2{color:#FFF9E8!important;font-size:43px!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-course-name{color:#F4D889!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-desc{color:#DDE9DF!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-track{background:rgba(255,255,255,.17)!important}.cafasso-home-track span{background:#F4D889!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-progress-row b{color:#FFF9E8!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-primary{background:#F1C85B!important;color:#17302F!important;box-shadow:0 8px 18px rgba(0,0,0,.18)!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-visual{background:linear-gradient(155deg,#2B5B59,#123C43)!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-word-slot .cafasso-daily-word,html[data-cafasso-home-v2="1"] .cafasso-home-word-placeholder{border:1px solid rgba(244,216,137,.4)!important;box-shadow:0 18px 42px rgba(0,0,0,.2)!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-almitas{margin-top:18px!important;background:rgba(255,236,168,.93)!important;border-color:rgba(244,216,137,.75)!important;box-shadow:0 10px 25px rgba(0,0,0,.14)!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-lower{margin-top:22px!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-section-head h3,html[data-cafasso-home-v2="1"] .cafasso-home-next-title h3{color:#FFF9E8!important;text-shadow:0 2px 10px rgba(0,0,0,.35)!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-link{color:#F4D889!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-course,html[data-cafasso-home-v2="1"] .cafasso-home-next{background:rgba(10,39,45,.78)!important;border-color:rgba(244,216,137,.3)!important;box-shadow:0 12px 28px rgba(0,0,0,.2)!important;color:#FFF9E8!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-course h4,html[data-cafasso-home-v2="1"] .cafasso-home-next-item strong{color:#FFF9E8!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-course-meta,html[data-cafasso-home-v2="1"] .cafasso-home-next-item small{color:#C9DDD1!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-course-open{color:#F4D889!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-next-item{border-top-color:rgba(244,216,137,.16)!important}.cafasso-home-dot{border-color:#A7C4B2!important}.cafasso-home-next-item:first-child .cafasso-home-dot{background:#F4D889!important;border-color:#F4D889!important}

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
      html[data-cafasso-home-v2="1"] .cafasso-home-v2{padding:24px 14px 88px!important}
      html[data-cafasso-home-v2="1"] .cafasso-home-v2:before{background:linear-gradient(180deg,rgba(6,27,33,.16),rgba(6,27,33,.42))!important}
      html[data-cafasso-home-v2="1"] .cafasso-home-hero h2{font-size:34px!important}
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

