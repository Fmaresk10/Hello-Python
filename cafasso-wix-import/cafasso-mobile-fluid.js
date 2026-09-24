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

        /* HUD compacto: mantiene Almitas, RUAH y perfil sin tapar la escena. */
        html.cafasso-mobile-fluid body:not(.cafasso-mission-mode):not(.cafasso-journey-mode) .cafasso-global-counters{
          left:max(8px,calc(env(safe-area-inset-left) + 6px))!important;
          top:max(8px,calc(env(safe-area-inset-top) + 6px))!important;
          display:flex!important;
          align-items:center!important;
          gap:2px!important;
          padding:3px!important;
          border-radius:999px!important;
          transform:none!important;
          backdrop-filter:blur(6px)!important;
          -webkit-backdrop-filter:blur(6px)!important;
          transition:opacity .16s ease,transform .16s ease!important;
        }
        html.cafasso-mobile-fluid body:not(.cafasso-mission-mode):not(.cafasso-journey-mode) .cafasso-global-counter{
          display:flex!important;
          align-items:center!important;
          gap:5px!important;
          min-width:0!important;
          padding:5px 7px!important;
        }
        html.cafasso-mobile-fluid body:not(.cafasso-mission-mode):not(.cafasso-journey-mode) .cafasso-global-counter+.cafasso-global-counter{
          border-left:1px solid rgba(242,201,90,.20)!important;
        }
        html.cafasso-mobile-fluid body:not(.cafasso-mission-mode):not(.cafasso-journey-mode) .cafasso-global-counter__icon{
          display:grid!important;
          place-items:center!important;
          width:19px!important;
          height:19px!important;
          flex:0 0 19px!important;
          font-size:10px!important;
        }
        html.cafasso-mobile-fluid body:not(.cafasso-mission-mode):not(.cafasso-journey-mode) .cafasso-global-counter__label,
        html.cafasso-mobile-fluid body:not(.cafasso-mission-mode):not(.cafasso-journey-mode) .cafasso-global-counter__unit{
          display:none!important;
        }
        html.cafasso-mobile-fluid body:not(.cafasso-mission-mode):not(.cafasso-journey-mode) .cafasso-global-counter__value{
          margin:0!important;
          font-size:12px!important;
          line-height:1!important;
        }
        html.cafasso-mobile-fluid[data-cafasso-world-role="formador"] .cafasso-global-counters,
        html.cafasso-mobile-fluid[data-cafasso-world-role="admin"] .cafasso-global-counters{
          display:none!important;
        }

        html.cafasso-mobile-fluid body:not(.cafasso-mission-mode):not(.cafasso-journey-mode) #cafassoGlobalCounters .cafasso-profile-hud-button{
          width:36px!important;
          height:36px!important;
          min-width:36px!important;
          min-height:36px!important;
          margin:0!important;
          flex:0 0 36px!important;
          font-size:11px!important;
        }

        /* Cuando hay un panel abierto, el mundo deja de competir visualmente. */
        html.cafasso-mobile-fluid body.cafasso-mobile-overlay-open :is(
          .cafasso-global-counters,
          .cafasso-admin-home-link,
          .cafasso-ambience-toggle,
          .cafasso-calendar-admin-trigger
        ){
          opacity:0!important;
          pointer-events:none!important;
        }

        /* Cierre siempre a mano, incluso después de hacer scroll dentro de una hoja. */
        html.cafasso-mobile-fluid :is(
          .cafasso-profile-close,
          .cafasso-bitacora-close,
          .cafasso-bitacora-acompanante-close,
          .cafasso-parish-close,
          .cafasso-songbook-close,
          .cafasso-candle-intention__close
        ){
          position:fixed!important;
          top:max(12px,calc(env(safe-area-inset-top) + 8px))!important;
          right:max(12px,calc(env(safe-area-inset-right) + 8px))!important;
          left:auto!important;
          width:44px!important;
          height:44px!important;
          min-width:44px!important;
          min-height:44px!important;
          z-index:2147483600!important;
          display:grid!important;
          place-items:center!important;
          transform:none!important;
        }

        /* Acciones cómodas para pulgar. */
        html.cafasso-mobile-fluid :is(
          .cafasso-profile-action,
          .cafasso-bitacora-save,
          .cafasso-parish-action,
          .cafasso-songbook-track,
          .cafasso-candle-intention__action
        ){
          min-height:46px!important;
        }
        html.cafasso-mobile-fluid .cafasso-parish-actions{
          gap:9px!important;
        }
        html.cafasso-mobile-fluid .cafasso-bitacora-footer{
          align-items:stretch!important;
          gap:10px!important;
        }
        html.cafasso-mobile-fluid .cafasso-bitacora-save{
          width:100%!important;
          min-width:0!important;
        }

        /* Pequeña señal de hoja móvil; no altera la estética del contenido. */
        html.cafasso-mobile-fluid .cafasso-mobile-sheet-grip{
          position:sticky;
          top:5px;
          z-index:20;
          display:block;
          width:46px;
          height:5px;
          margin:-20px auto 14px;
          border-radius:999px;
          background:rgba(77,58,39,.30);
          box-shadow:0 1px rgba(255,255,255,.30);
          pointer-events:auto;
          touch-action:none;
          cursor:grab;
        }
        html.cafasso-mobile-fluid .cafasso-mobile-sheet-grip:active{cursor:grabbing}
        html.cafasso-mobile-fluid .cafasso-sheet-dragging{
          transform:translate3d(0,var(--cafasso-sheet-drag-y,0px),0)!important;
          transition:none!important;
          will-change:transform;
        }
        html.cafasso-mobile-fluid .cafasso-sheet-snapping{
          transform:translate3d(0,0,0)!important;
          transition:transform .24s cubic-bezier(.2,.8,.2,1)!important;
        }
        html.cafasso-mobile-fluid .cafasso-sheet-dismissing{
          transform:translate3d(0,115vh,0)!important;
          transition:transform .24s cubic-bezier(.4,0,1,1)!important;
          pointer-events:none!important;
        }
        html.cafasso-mobile-fluid .cafasso-sheet-drag-overlay{
          transition:background-color .12s linear,backdrop-filter .12s linear!important;
        }
        html.cafasso-mobile-fluid .cafasso-profile-card .cafasso-mobile-sheet-grip{
          background:rgba(104,73,45,.24);
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

  function navigate(url,options={}){
    if(leaving)return true;
    leaving=true;
    document.documentElement.classList.remove('cafasso-mobile-fluid-ready');
    document.documentElement.classList.add('cafasso-mobile-fluid-leaving');
    const target=String(url);
    setTimeout(()=>{
      if(options&&options.replace)location.replace(target);
      else location.assign(target);
    },TRANSITION_MS);
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

  const OVERLAY_SELECTORS=[
    '.cafasso-profile-panel',
    '.cafasso-bitacora-panel',
    '.cafasso-bitacora-acompanante-panel',
    '.cafasso-parish-panel',
    '.cafasso-songbook-panel',
    '.cafasso-candle-intention',
    '.cafasso-school-map-panel',
    '.cafasso-world-object-layer',
    '.cafasso-discovery-layer',
    '.cafasso-corazon-layer',
    '.cafasso-servidor-layer',
    '.cafasso-parish-secret-layer'
  ];

  const SHEET_SELECTORS=[
    '.cafasso-profile-card',
    '.cafasso-bitacora-book',
    '.cafasso-bitacora-acompanante-book',
    '.cafasso-parish-sheet',
    '.cafasso-songbook-sheet',
    '.cafasso-candle-intention__sheet',
    '.cafasso-world-object-note',
    '.cafasso-discovery-note',
    '.cafasso-corazon-note'
  ];

  function visible(node){
    if(!node||node.hidden)return false;
    const style=getComputedStyle(node);
    return style.display!=='none'&&style.visibility!=='hidden';
  }

  const OVERLAY_CLOSE_SELECTORS=[
    '[data-house-profile-close]',
    '.cafasso-profile-close',
    '.cafasso-bitacora-close',
    '.cafasso-bitacora-acompanante-close',
    '.cafasso-parish-close',
    '.cafasso-songbook-close',
    '[data-candle-intention-close]',
    '.cafasso-candle-intention__close',
    '.cafasso-school-map__close',
    '.cafasso-world-object-close',
    '.cafasso-discovery-close',
    '.cafasso-corazon-close',
    '.cafasso-servidor-close',
    '.cafasso-parish-secret-close',
    '[data-close]',
    '[aria-label="Cerrar"]'
  ];

  let lastOverlayOpen=null;

  function topVisibleOverlay(){
    const nodes=[];
    OVERLAY_SELECTORS.forEach(selector=>{
      document.querySelectorAll(selector).forEach(node=>{
        if(node instanceof HTMLElement&&visible(node)&&!nodes.includes(node))nodes.push(node);
      });
    });
    nodes.sort((a,b)=>{
      const az=Number.parseInt(getComputedStyle(a).zIndex,10)||0;
      const bz=Number.parseInt(getComputedStyle(b).zIndex,10)||0;
      return az-bz;
    });
    return nodes.at(-1)||null;
  }

  function notifyOverlayState(force=false){
    if(!mobileLike()||window.parent===window)return;
    const open=!!topVisibleOverlay();
    if(!force&&open===lastOverlayOpen)return;
    lastOverlayOpen=open;
    try{
      window.parent.postMessage({type:'cafasso-overlay-state',open},location.origin);
    }catch(error){}
  }

  function closeOverlayNode(overlay){
    if(!(overlay instanceof HTMLElement))return false;

    const closeButton=OVERLAY_CLOSE_SELECTORS
      .map(selector=>overlay.querySelector(selector))
      .find(node=>node instanceof HTMLElement&&visible(node));

    if(closeButton){
      closeButton.click();
    }else{
      document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape',bubbles:true}));
      setTimeout(()=>{
        if(visible(overlay)){
          overlay.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));
        }
      },0);
    }

    setTimeout(()=>notifyOverlayState(true),90);
    return true;
  }

  function closeTopOverlay(){
    const overlay=topVisibleOverlay();
    if(!overlay){
      notifyOverlayState(true);
      return false;
    }
    return closeOverlayNode(overlay);
  }

  function syncOverlayState(){
    if(!mobileLike())return;
    const open=!!topVisibleOverlay();
    document.body.classList.toggle('cafasso-mobile-overlay-open',open);
    notifyOverlayState();
  }

  window.addEventListener('message',event=>{
    if(event.origin!==location.origin)return;
    const data=event.data||{};
    if(data.type==='cafasso-close-overlay'){
      closeTopOverlay();
      return;
    }
    if(data.type==='cafasso-query-overlay-state')notifyOverlayState(true);
  });

  function decorateSheets(){
    if(!mobileLike())return;
    SHEET_SELECTORS.forEach(selector=>{
      document.querySelectorAll(selector).forEach(sheet=>{
        if(sheet.querySelector(':scope > .cafasso-mobile-sheet-grip'))return;
        const grip=document.createElement('span');
        grip.className='cafasso-mobile-sheet-grip';
        grip.setAttribute('aria-hidden','true');
        sheet.insertBefore(grip,sheet.firstChild);
      });
    });
  }

  function installSheetObserver(){
    const refresh=()=>{
      decorateSheets();
      syncOverlayState();
    };
    refresh();
    const observer=new MutationObserver(refresh);
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class']});
  }

  function installSheetSwipeToClose(){
    if(!mobileLike())return;

    let drag=null;
    const DISMISS_DISTANCE=112;
    const MIN_FAST_DISTANCE=42;
    const DISMISS_VELOCITY=.62;

    const cleanup=(sheet,overlay)=>{
      sheet?.classList.remove('cafasso-sheet-dragging','cafasso-sheet-snapping','cafasso-sheet-dismissing');
      sheet?.style.removeProperty('--cafasso-sheet-drag-y');
      overlay?.classList.remove('cafasso-sheet-drag-overlay');
      overlay?.style.removeProperty('--cafasso-sheet-drag-progress');
    };

    const snapBack=(sheet,overlay)=>{
      if(!(sheet instanceof HTMLElement))return;
      sheet.classList.remove('cafasso-sheet-dragging');
      sheet.classList.add('cafasso-sheet-snapping');
      sheet.style.setProperty('--cafasso-sheet-drag-y','0px');
      overlay?.classList.remove('cafasso-sheet-drag-overlay');
      setTimeout(()=>cleanup(sheet,overlay),270);
    };

    const dismiss=(sheet,overlay)=>{
      if(!(sheet instanceof HTMLElement)||!(overlay instanceof HTMLElement))return;
      sheet.classList.remove('cafasso-sheet-dragging','cafasso-sheet-snapping');
      sheet.classList.add('cafasso-sheet-dismissing');
      overlay.classList.remove('cafasso-sheet-drag-overlay');
      try{
        if(navigator.vibrate&&/Android/i.test(navigator.userAgent))navigator.vibrate(8);
      }catch(error){}
      setTimeout(()=>{
        cleanup(sheet,overlay);
        closeOverlayNode(overlay);
      },205);
    };

    document.addEventListener('pointerdown',event=>{
      if(event.pointerType==='mouse'||drag)return;
      const grip=event.target instanceof Element?event.target.closest('.cafasso-mobile-sheet-grip'):null;
      if(!(grip instanceof HTMLElement))return;

      const sheet=grip.closest(SHEET_SELECTORS.join(','));
      if(!(sheet instanceof HTMLElement)||!visible(sheet))return;
      const overlay=sheet.closest(OVERLAY_SELECTORS.join(','));
      if(!(overlay instanceof HTMLElement)||!visible(overlay))return;

      const now=performance.now();
      drag={
        pointerId:event.pointerId,
        sheet,
        overlay,
        startX:event.clientX,
        startY:event.clientY,
        lastY:event.clientY,
        lastTime:now,
        velocity:0,
        distance:0,
        locked:false
      };

      sheet.classList.remove('cafasso-sheet-snapping','cafasso-sheet-dismissing');
      sheet.classList.add('cafasso-sheet-dragging');
      overlay.classList.add('cafasso-sheet-drag-overlay');
      try{grip.setPointerCapture?.(event.pointerId)}catch(error){}
      event.preventDefault();
    },{capture:true,passive:false});

    document.addEventListener('pointermove',event=>{
      if(!drag||event.pointerId!==drag.pointerId)return;
      const dx=event.clientX-drag.startX;
      const rawDy=event.clientY-drag.startY;

      if(!drag.locked){
        if(Math.abs(dx)>8&&Math.abs(dx)>Math.abs(rawDy)*1.15){
          snapBack(drag.sheet,drag.overlay);
          drag=null;
          return;
        }
        if(Math.abs(rawDy)<4)return;
        drag.locked=true;
      }

      const dy=Math.max(0,rawDy);
      const resisted=dy<=180?dy:180+(dy-180)*.42;
      const now=performance.now();
      const dt=Math.max(8,now-drag.lastTime);
      drag.velocity=(event.clientY-drag.lastY)/dt;
      drag.lastY=event.clientY;
      drag.lastTime=now;
      drag.distance=dy;

      drag.sheet.style.setProperty('--cafasso-sheet-drag-y',resisted.toFixed(1)+'px');

      const progress=Math.min(1,resisted/260);
      drag.overlay.style.setProperty('--cafasso-sheet-drag-progress',progress.toFixed(3));
      drag.overlay.style.backgroundColor=`rgba(7,25,27,${Math.max(.12,.67*(1-progress*.72)).toFixed(3)})`;

      event.preventDefault();
    },{capture:true,passive:false});

    const finish=event=>{
      if(!drag||event.pointerId!==drag.pointerId)return;
      const current=drag;
      drag=null;

      current.overlay.style.removeProperty('background-color');
      const fast=current.velocity>DISMISS_VELOCITY&&current.distance>MIN_FAST_DISTANCE;
      const far=current.distance>DISMISS_DISTANCE;
      if(fast||far)dismiss(current.sheet,current.overlay);
      else snapBack(current.sheet,current.overlay);

      event.preventDefault();
    };

    document.addEventListener('pointerup',finish,{capture:true,passive:false});
    document.addEventListener('pointercancel',event=>{
      if(!drag||event.pointerId!==drag.pointerId)return;
      const current=drag;
      drag=null;
      current.overlay.style.removeProperty('background-color');
      snapBack(current.sheet,current.overlay);
    },{capture:true,passive:false});
  }

  function installKeyboardAssist(){
    document.addEventListener('focusin',event=>{
      if(!mobileLike())return;
      const field=event.target;
      if(!(field instanceof HTMLElement)||!field.matches('input,textarea,select'))return;
      if(!field.closest(OVERLAY_SELECTORS.join(','))&&!document.documentElement.dataset.cafassoPlayer)return;
      setTimeout(()=>{
        try{field.scrollIntoView({block:'center',inline:'nearest',behavior:'smooth'});}catch(error){}
      },180);
    });
  }

  function installTouchAssist(){
    if(!mobileLike())return;
    const selector=[
      '.cafasso-resource-book',
      '.cafasso-world-compass',
      '.cafasso-explore-secret--house',
      '.cafasso-corazon-huella',
      '.cafasso-calendar-admin-trigger',
      '.cafasso-ambience-toggle',
      '.cafasso-parish-candle',
      '.cafasso-parish-songbook',
      '.cafasso-parish-lectionary',
      '.cafasso-bitacora-object'
    ].join(',');
    let down=null;

    document.addEventListener('pointerdown',event=>{
      if(event.pointerType==='mouse')return;
      down={x:event.clientX,y:event.clientY,id:event.pointerId};
    },true);

    document.addEventListener('pointerup',event=>{
      if(!down||down.id!==event.pointerId){down=null;return}
      const dx=event.clientX-down.x,dy=event.clientY-down.y;
      down=null;
      if(Math.hypot(dx,dy)>4.5)return;
      if(event.target instanceof Element&&event.target.closest('button,a,input,textarea,select,[role="button"]'))return;
      if(document.body.classList.contains('cafasso-mobile-overlay-open'))return;

      let best=null,bestScore=Infinity;
      document.querySelectorAll(selector).forEach(node=>{
        if(!(node instanceof HTMLElement)||!visible(node)||node.disabled)return;
        const r=node.getBoundingClientRect();
        const pad=node.matches('.cafasso-resource-book')?10:12;
        if(event.clientX<r.left-pad||event.clientX>r.right+pad||event.clientY<r.top-pad||event.clientY>r.bottom+pad)return;
        const cx=Math.max(r.left,Math.min(event.clientX,r.right));
        const cy=Math.max(r.top,Math.min(event.clientY,r.bottom));
        const score=Math.hypot(event.clientX-cx,event.clientY-cy);
        if(score<bestScore){best=node;bestScore=score}
      });
      if(best){
        event.preventDefault();
        requestAnimationFrame(()=>best.click());
      }
    },true);
  }

  function init(){
    ensureStyles();
    updateViewport();
    ensureTransition();
    reveal();
    if(!document.documentElement.dataset.cafassoPlayer)watchPanorama();
    installSheetObserver();
    notifyOverlayState(true);
    installSheetSwipeToClose();
    installKeyboardAssist();
    installTouchAssist();

    window.addEventListener('pageshow',()=>{
      leaving=false;
      document.documentElement.classList.remove('cafasso-mobile-fluid-leaving');
      reveal();
      decorateSheets();
      syncOverlayState();
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