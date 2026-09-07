(()=>{
  if(window.__cafassoAnimatorHomeTweaksInstalled)return;
  window.__cafassoAnimatorHomeTweaksInstalled=true;

  const root=document.documentElement;
  const params=new URLSearchParams(location.search);
  const role=String(root.dataset.cafassoRole||'').toLowerCase();
  const preview=String(root.dataset.cafassoPreviewRole||params.get('previewRole')||'').toLowerCase();
  if(role!=='animador'&&preview!=='animador'&&!params.get('previewUser'))return;

  const style=document.createElement('style');
  style.id='cafassoAnimatorHomeTweaksStyles';
  style.textContent=`
    html[data-cafasso-home-v2="1"]{
      --home-bg:#E8DED0!important;
      --home-paper:#F1E8DB!important;
      --home-card:#F6EEE3!important;
      --home-line:rgba(23,50,74,.08)!important;
    }
    html[data-cafasso-home-v2="1"] body{
      background:linear-gradient(135deg,#E8DED0 0%,#EEE4D6 55%,#E4D8C8 100%)!important;
    }
    html[data-cafasso-home-v2="1"] main{
      background:transparent!important;
      padding-bottom:42px!important;
    }

    @media(min-width:681px){
      html[data-cafasso-home-v2="1"] .shell{grid-template-columns:248px minmax(0,1fr)!important}
      html[data-cafasso-home-v2="1"] .side{padding:28px 20px!important}
      html[data-cafasso-home-v2="1"] .brand{padding:0!important;display:block!important}
      html[data-cafasso-home-v2="1"] .brand a{display:block!important;width:100%!important}
      html[data-cafasso-home-v2="1"] .brand img{
        width:194px!important;
        height:auto!important;
        max-width:100%!important;
        display:block!important;
        object-fit:contain!important;
        opacity:1!important;
        filter:drop-shadow(0 3px 8px rgba(0,0,0,.14))!important;
      }
      html[data-cafasso-home-v2="1"] .brand div{display:none!important}
      html[data-cafasso-home-v2="1"] .nav{margin-top:42px!important}
    }

    html[data-cafasso-home-v2="1"] .cafasso-home-manifest{display:none!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-footer{display:none!important}

    html[data-cafasso-home-v2="1"] .cafasso-home-course,
    html[data-cafasso-home-v2="1"] .cafasso-home-next{
      background:rgba(246,238,227,.88)!important;
      box-shadow:0 8px 22px rgba(74,57,37,.035)!important;
    }
    html[data-cafasso-home-v2="1"] .cafasso-home-head{margin-bottom:26px!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-lower{margin-bottom:4px!important}

    html[data-cafasso-home-v2="1"] .cafasso-home-hero{
      grid-template-columns:minmax(0,1.45fr) minmax(245px,.55fr)!important;
      background:linear-gradient(118deg,#E7D8C5 0%,#F2E8DA 58%,#D9C7AE 100%)!important;
    }
    html[data-cafasso-home-v2="1"] .cafasso-home-visual{
      min-height:355px!important;
      padding:30px!important;
      background:linear-gradient(155deg,#2A4A60 0%,#173954 58%,#112D46 100%)!important;
      display:flex!important;
      align-items:flex-end!important;
      justify-content:flex-start!important;
      overflow:hidden!important;
    }
    html[data-cafasso-home-v2="1"] .cafasso-home-visual:before{
      content:'“'!important;
      position:absolute!important;
      width:auto!important;
      height:auto!important;
      border:0!important;
      box-shadow:none!important;
      border-radius:0!important;
      right:24px!important;
      top:4px!important;
      font:400 118px/1 Georgia,serif!important;
      color:rgba(242,201,76,.19)!important;
    }
    html[data-cafasso-home-v2="1"] .cafasso-home-visual:after{
      content:'';
      position:absolute;
      left:30px;
      top:31px;
      width:36px;
      height:3px;
      border-radius:999px;
      background:#C89B31;
    }
    html[data-cafasso-home-v2="1"] .cafasso-home-visual-mark{display:none!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-visual-quote{
      text-align:left!important;
      color:#F8F1E6!important;
      font:italic 24px/1.25 Georgia,serif!important;
      max-width:220px!important;
      margin-top:auto!important;
    }
    html[data-cafasso-home-v2="1"] .cafasso-home-visual-quote small{
      margin-top:16px!important;
      color:#E5C66D!important;
      font-size:9px!important;
      letter-spacing:.14em!important;
    }

    @media(max-width:680px){
      html[data-cafasso-home-v2="1"] body{background:#F1ECE3!important}
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
    const current=(document.querySelector('.cafasso-home-title')?.textContent||'').replace(/^Hola,?\s*/i,'').replace(/^Buenas,?\s*/i,'').trim();
    return current||'animador/a';
  }

  function clean(){
    if(!document.documentElement.dataset.cafassoHomeV2)return;
    document.querySelector('.cafasso-home-manifest')?.remove();
    document.querySelector('.cafasso-home-footer')?.remove();

    const brandImg=document.querySelector('.side .brand img');
    if(brandImg&&brandImg.getAttribute('src')!=='./cafasso-logo.svg')brandImg.setAttribute('src','./cafasso-logo.svg');
    const brandText=document.querySelector('.side .brand div');
    if(brandText)brandText.remove();

    const title=document.querySelector('.cafasso-home-title');
    if(title)title.textContent='Buenas, '+firstName();

    const quote=document.querySelector('.cafasso-home-visual-quote');
    if(quote)quote.innerHTML='“Buenos cristianos y honrados ciudadanos”<small>Don Bosco</small>';
  }

  clean();
  const target=document.getElementById('app')||document.body;
  new MutationObserver(clean).observe(target,{childList:true,subtree:true});
})();
