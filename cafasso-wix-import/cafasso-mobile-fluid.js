(()=>{
  if(window.__cafassoMobileFluidInstalled)return;
  window.__cafassoMobileFluidInstalled=true;

  const MOBILE_QUERY='(max-width: 820px), (pointer: coarse)';
  const STYLE_ID='cafassoMobileFluidStyles';
  const TRANSITION_MS=130;
  let raf=0;
  let leaving=false;

  function mobileLike(){return Boolean(window.matchMedia?.(MOBILE_QUERY)?.matches)}
  function viewport(){
    const vv=window.visualViewport;
    return{
      width:Math.max(1,Math.round(vv?.width||window.innerWidth||document.documentElement.clientWidth||1)),
      height:Math.max(320,Math.round(vv?.height||window.innerHeight||document.documentElement.clientHeight||320)),
      top:Math.max(0,Math.round(vv?.offsetTop||0)),
      left:Math.max(0,Math.round(vv?.offsetLeft||0))
    };
  }
  function updateViewport(){
    const size=viewport(),root=document.documentElement,mobile=mobileLike();
    root.style.setProperty('--cafasso-fluid-vh',size.height+'px');
    root.style.setProperty('--cafasso-fluid-vw',size.width+'px');
    root.style.setProperty('--cafasso-vv-top',size.top+'px');
    root.style.setProperty('--cafasso-vv-left',size.left+'px');
    root.classList.toggle('cafasso-mobile-fluid',mobile);
    if(!document.getElementById('cafassoMobileFoundationStyles')){
      root.classList.toggle('cafasso-mobile',mobile);
      root.classList.toggle('cafasso-mobile-portrait',mobile&&size.height>=size.width);
      root.classList.toggle('cafasso-mobile-landscape',mobile&&size.width>size.height);
    }
  }
  function scheduleViewport(){
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(updateViewport);
  }

  function ensureStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      :root{
        --cafasso-fluid-vh:100dvh;
        --cafasso-fluid-vw:100vw;
        --cafasso-vv-top:0px;
        --cafasso-vv-left:0px;
      }

      .cafasso-mobile-transition{
        position:fixed;inset:0;z-index:2147483646;pointer-events:none;
        background:
          radial-gradient(circle at 50% 42%,rgba(38,78,70,.20),transparent 38%),
          #102f33;
        opacity:1;
        transition:opacity .22s ease;
      }
      html.cafasso-mobile-fluid-ready .cafasso-mobile-transition{opacity:0}
      html.cafasso-mobile-fluid-leaving .cafasso-mobile-transition{
        opacity:1;pointer-events:auto;transition-duration:.12s
      }

      html.cafasso-mobile-fluid{
        background:#102f33;
        -webkit-text-size-adjust:100%;
      }

      html.cafasso-mobile-fluid body{
        -webkit-tap-highlight-color:transparent;
      }

      html.cafasso-mobile-fluid :is(button,a,[role="button"],input,textarea,select){
        -webkit-tap-highlight-color:transparent;
      }

      html.cafasso-mobile-fluid :is(button,a,[role="button"]):active{
        filter:brightness(.96);
      }

      html.cafasso-mobile-fluid :is(
        .cafasso-profile-panel,
        .cafasso-bitacora-panel,
        .cafasso-bitacora-acompanante-panel,
        .cafasso-parish-panel,
        .cafasso-parish-silence,
        .cafasso-school-map-panel,
        .cafasso-world-object-layer,
        .cafasso-discovery-layer,
        .cafasso-corazon-layer,
        .cafasso-servidor-layer,
        .cafasso-parish-secret-layer
      ){
        overscroll-behavior:contain;
      }

      html.cafasso-mobile-fluid :is(
        .cafasso-profile-card,
        .cafasso-bitacora-book,
        .cafasso-bitacora-acompanante-book,
        .cafasso-parish-sheet,
        .cafasso-school-map,
        .cafasso-world-object-note,
        .cafasso-discovery-note,
        .cafasso-corazon-note
      ){
        scrollbar-width:none;
      }
      html.cafasso-mobile-fluid :is(
        .cafasso-profile-card,
        .cafasso-bitacora-book,
        .cafasso-bitacora-acompanante-book,
        .cafasso-parish-sheet,
        .cafasso-school-map,
        .cafasso-world-object-note,
        .cafasso-discovery-note,
        .cafasso-corazon-note
      )::-webkit-scrollbar{display:none}

      html.cafasso-mobile-fluid .cafasso-mobile-pan-hint{
        position:fixed;
        left:50%;
        bottom:max(18px,calc(env(safe-area-inset-bottom) + 12px));
        z-index:2147482500;
        transform:translateX(-50%) translateY(6px);
        display:flex;align-items:center;gap:7px;
        max-width:calc(100vw - 28px);
        padding:8px 11px;
        border:1px solid rgba(242,201,90,.36);
        border-radius:999px;
        background:rgba(8,35,39,.78);
        box-shadow:0 7px 22px rgba(0,0,0,.22);
        color:#f5e7bc;
        font:800 9px/1.1 Inter,system-ui,sans-serif;
        letter-spacing:.05em;
        text-transform:uppercase;
        opacity:0;pointer-events:none;
        transition:opacity .25s ease,transform .25s ease;
        backdrop-filter:blur(5px);
      }
      html.cafasso-mobile-fluid .cafasso-mobile-pan-hint.show{
        opacity:.92;transform:translateX(-50%) translateY(0)
      }

      @media(max-width:820px),(pointer:coarse){
        html.cafasso-mobile-fluid :is(
          .cafasso-house,.cafasso-patio,.cafasso-parroquia,.cafasso-escuela,.cafasso-recursos
        ){
          height:var(--cafasso-fluid-vh)!important;
          min-height:var(--cafasso-fluid-vh)!important;
        }

        html.cafasso-mobile-fluid :is(
          .cafasso-profile-panel,
          .cafasso-bitacora-panel,
          .cafasso-bitacora-acompanante-panel,
          .cafasso-parish-panel,
          .cafasso-parish-silence,
          .cafasso-school-map-panel
        ){
          height:var(--cafasso-fluid-vh)!important;
          max-height:var(--cafasso-fluid-vh)!important;
        }

        html.cafasso-mobile-fluid :is(
          .cafasso-profile-card,
          .cafasso-bitacora-book,
          .cafasso-bitacora-acompanante-book,
          .cafasso-parish-sheet,
          .cafasso-school-map
        ){
          scroll-behavior:smooth;
          overscroll-behavior:contain;
          -webkit-overflow-scrolling:touch;
        }

        /* Menos blur = mejor FPS durante el panorama y los gestos. */
        html.cafasso-mobile-fluid :is(
          .cafasso-profile-panel,
          .cafasso-bitacora-panel,
          .cafasso-bitacora-acompanante-panel,
          .cafasso-parish-panel,
          .cafasso-school-map-panel,
          .cafasso-world-object-layer,
          .cafasso-discovery-layer,
          .cafasso-corazon-layer
        ){
          backdrop-filter:blur(3px)!important;
          -webkit-backdrop-filter:blur(3px)!important;
        }

        html.cafasso-mobile-fluid :is(
          .cafasso-space-link,
          .cafasso-profile-hud-button,
          .cafasso-parish-action,
          .cafasso-bitacora-save,
          .cafasso-school-course,
          .cafasso-school-module,
          .cafasso-resource-book
        ){
          touch-action:manipulation;
        }
      }

      /* Player: la experiencia de curso debe sentirse como parte del mundo móvil. */
      html[data-cafasso-player="1"].cafasso-mobile-fluid,
      html[data-cafasso-player="1"].cafasso-mobile-fluid body{
        min-height:var(--cafasso-fluid-vh);
        background:#102f35;
      }
      html[data-cafasso-player="1"].cafasso-mobile-fluid body{
        overflow-x:hidden;
        overscroll-behavior-y:contain;
      }
      html[data-cafasso-player="1"].cafasso-mobile-fluid #app,
      html[data-cafasso-player="1"].cafasso-mobile-fluid .player-shell,
      html[data-cafasso-player="1"].cafasso-mobile-fluid #main{
        min-height:var(--cafasso-fluid-vh)!important;
      }

      @media(max-width:820px),(pointer:coarse){
        html[data-cafasso-player="1"].cafasso-mobile-fluid body.cafasso-mission-mode .cafasso-mission-shell{
          min-height:var(--cafasso-fluid-vh)!important;
          padding:
            max(14px,calc(env(safe-area-inset-top) + 10px))
            max(14px,calc(env(safe-area-inset-right) + 12px))
            max(30px,calc(env(safe-area-inset-bottom) + 24px))
            max(14px,calc(env(safe-area-inset-left) + 12px))!important;
        }

        html[data-cafasso-player="1"].cafasso-mobile-fluid .cafasso-scene-back{
          min-height:46px!important;
          padding:9px 12px!important;
          touch-action:manipulation;
        }

        html[data-cafasso-player="1"].cafasso-mobile-fluid body.cafasso-mission-mode .cafasso-mission-nav{
          scroll-snap-type:x proximity;
          scroll-padding-inline:12px;
          -webkit-overflow-scrolling:touch;
          touch-action:pan-x;
        }
        html[data-cafasso-player="1"].cafasso-mobile-fluid body.cafasso-mission-mode .cafasso-mission-node{
          scroll-snap-align:center;
          min-height:52px;
        }

        html[data-cafasso-player="1"].cafasso-mobile-fluid body.cafasso-mission-mode article.block{
          margin-bottom:12px!important;
          border-radius:14px!important;
          padding:16px!important;
          contain:layout paint;
        }

        html[data-cafasso-player="1"].cafasso-mobile-fluid :is(
          .activity textarea,
          .eval-question-player textarea
        ){
          font-size:16px!important;
          line-height:1.5;
        }

        html[data-cafasso-player="1"].cafasso-mobile-fluid :is(
          .btn,
          .eval-option-player
        ){
          min-height:46px;
        }

        html[data-cafasso-player="1"].cafasso-mobile-fluid .eval-option-player{
          align-items:center;
          padding:11px 12px;
        }

        html[data-cafasso-player="1"].cafasso-mobile-fluid .video-frame,
        html[data-cafasso-player="1"].cafasso-mobile-fluid .media-img{
          border-radius:12px!important;
        }

        html[data-cafasso-player="1"].cafasso-mobile-fluid .complete-box{
          margin-bottom:max(8px,env(safe-area-inset-bottom));
        }
      }

      @media(max-width:430px){
        html[data-cafasso-player="1"].cafasso-mobile-fluid body.cafasso-mission-mode .cafasso-mission-title{
          font-size:clamp(27px,8.4vw,36px)!important;
        }
        html[data-cafasso-player="1"].cafasso-mobile-fluid .card.block{
          padding:14px!important;
        }
      }

      @media(prefers-reduced-motion:reduce){
        .cafasso-mobile-transition,
        html.cafasso-mobile-fluid .cafasso-mobile-pan-hint{transition:none!important}
        html.cafasso-mobile-fluid *{scroll-behavior:auto!important}
      }
    `;
    document.head.appendChild(style);
  }

  function ensureTransition(){
    let node=document.getElementById('cafassoMobileTransition');
    if(node)return node;
    node=document.createElement('div');
    node.id='cafassoMobileTransition';
    node.className='cafasso-mobile-transition';
    node.setAttribute('aria-hidden','true');
    document.body.appendChild(node);
    return node;
  }

  async function reveal(){
    if(!mobileLike()){
      document.documentElement.classList.add('cafasso-mobile-fluid-ready');
      return;
    }
    const image=document.querySelector('.cafasso-house__image,.cafasso-patio__image,.cafasso-parroquia__image,.cafasso-escuela__image,.cafasso-recursos__image');
    if(image){
      try{
        if(!image.complete&&image.decode){
          await Promise.race([image.decode().catch(()=>null),new Promise(resolve=>setTimeout(resolve,420))]);
        }
      }catch(error){}
    }else{
      await new Promise(resolve=>requestAnimationFrame(resolve));
    }
    requestAnimationFrame(()=>document.documentElement.classList.add('cafasso-mobile-fluid-ready'));
  }

  function navigate(url){
    if(leaving)return true;
    leaving=true;
    document.documentElement.classList.remove('cafasso-mobile-fluid-ready');
    document.documentElement.classList.add('cafasso-mobile-fluid-leaving');
    setTimeout(()=>location.assign(String(url)),TRANSITION_MS);
    return true;
  }

  function showPanHint(){
    if(!mobileLike()||!document.documentElement.classList.contains('cafasso-mobile-portrait'))return;
    const panorama=document.querySelector('.cafasso-house-panorama,.cafasso-patio-panorama,.cafasso-school-panorama,.cafasso-parish-panorama,.cafasso-resources-panorama');
    if(!panorama)return;
    const space=new URLSearchParams(location.search).get('space')||'house';
    const key='cafasso-mobile-pan-hint-'+space;
    try{if(sessionStorage.getItem(key)==='1')return}catch(error){}
    if(document.getElementById('cafassoMobilePanHint'))return;
    const hint=document.createElement('div');
    hint.id='cafassoMobilePanHint';
    hint.className='cafasso-mobile-pan-hint';
    hint.innerHTML='<span>↔</span><span>Deslizá para recorrer</span>';
    document.body.appendChild(hint);
    requestAnimationFrame(()=>hint.classList.add('show'));
    const dismiss=()=>{
      hint.classList.remove('show');
      try{sessionStorage.setItem(key,'1')}catch(error){}
      setTimeout(()=>hint.remove(),260);
      document.removeEventListener('pointermove',onMove,true);
    };
    const onMove=event=>{if(Math.abs(event.movementX||0)>2)dismiss()};
    document.addEventListener('pointermove',onMove,true);
    setTimeout(dismiss,2800);
  }

  function watchPanorama(){
    const observer=new MutationObserver(()=>showPanHint());
    observer.observe(document.documentElement,{subtree:true,childList:true});
    setTimeout(()=>observer.disconnect(),5000);
    showPanHint();
  }

  function init(){
    ensureStyles();
    updateViewport();
    ensureTransition();
    reveal();
    if(!document.documentElement.dataset.cafassoPlayer)watchPanorama();

    window.addEventListener('pageshow',()=>{
      leaving=false;
      document.documentElement.classList.remove('cafasso-mobile-fluid-leaving');
      reveal();
    });
    window.addEventListener('resize',scheduleViewport,{passive:true});
    window.addEventListener('orientationchange',scheduleViewport,{passive:true});
    window.visualViewport?.addEventListener('resize',scheduleViewport,{passive:true});
    window.visualViewport?.addEventListener('scroll',scheduleViewport,{passive:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();

  window.CafassoMobileFluid={
    refresh:updateViewport,
    navigate,
    get active(){return mobileLike()}
  };
})();