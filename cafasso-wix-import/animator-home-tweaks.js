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

    html[data-cafasso-home-v2="1"] .brand{
      padding:2px 8px 0!important;
      gap:14px!important;
      align-items:center!important;
    }
    html[data-cafasso-home-v2="1"] .brand a{
      gap:14px!important;
      align-items:center!important;
    }
    html[data-cafasso-home-v2="1"] .brand img{
      width:58px!important;
      height:68px!important;
      max-width:none!important;
      opacity:1!important;
      filter:drop-shadow(0 2px 7px rgba(0,0,0,.16))!important;
      flex:0 0 auto!important;
    }
    html[data-cafasso-home-v2="1"] .brand b{
      font-size:28px!important;
      line-height:1!important;
      letter-spacing:-.025em!important;
      color:#fff!important;
    }
    html[data-cafasso-home-v2="1"] .brand small{
      font-size:9px!important;
      line-height:1.55!important;
      letter-spacing:.11em!important;
      opacity:.82!important;
      color:#F1DFAF!important;
      max-width:125px!important;
    }
    html[data-cafasso-home-v2="1"] .nav{margin-top:38px!important}

    html[data-cafasso-home-v2="1"] .cafasso-home-manifest{display:none!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-footer{display:none!important}

    html[data-cafasso-home-v2="1"] .cafasso-home-course,
    html[data-cafasso-home-v2="1"] .cafasso-home-next{
      background:rgba(246,238,227,.88)!important;
      box-shadow:0 8px 22px rgba(74,57,37,.035)!important;
    }
    html[data-cafasso-home-v2="1"] .cafasso-home-head{margin-bottom:26px!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-lower{margin-bottom:4px!important}

    @media(max-width:680px){
      html[data-cafasso-home-v2="1"] body{background:#F1ECE3!important}
    }
  `;
  document.head.appendChild(style);

  function clean(){
    if(!document.documentElement.dataset.cafassoHomeV2)return;
    document.querySelector('.cafasso-home-manifest')?.remove();
    document.querySelector('.cafasso-home-footer')?.remove();
  }

  clean();
  const target=document.getElementById('app')||document.body;
  new MutationObserver(clean).observe(target,{childList:true,subtree:true});
})();
