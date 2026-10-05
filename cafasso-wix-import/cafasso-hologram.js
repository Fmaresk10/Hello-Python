(()=>{
  if(window.__cafassoHologramInstalled)return;
  window.__cafassoHologramInstalled=true;

  const STYLE_ID='cafassoHologramStyles';
  const SIGNAL_ID='cafassoHologramSignal';
  const STAGE_ID='cafassoHologramStage';
  const SESSION_PREFIX='cafassoHologramSeen:';
  const rules=[];
  let globalRules=[];
  let current=null;
  let lastMissionKey='';
  let lastSpaceKey='';
  let syncTimer=0;
  const GLOBAL_CONFIG_API='https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoCourse';
  const GLOBAL_CONFIG_TITLE='__CAFASSO_GLOBAL_HOLOGRAMS__';
  const PREVIEW_MODE=new URLSearchParams(location.search).get('holoPreview')==='1';

  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[char]));

  const normalize=value=>String(value??'').trim();

  function installStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .cafasso-holo-signal{
        position:fixed;z-index:2147483340;right:max(16px,calc(env(safe-area-inset-right) + 12px));bottom:max(22px,calc(env(safe-area-inset-bottom) + 18px));
        display:flex;align-items:center;gap:10px;max-width:min(330px,calc(100vw - 28px));padding:9px 13px 9px 9px;
        border:1px solid rgba(121,225,224,.48);border-radius:999px;background:rgba(7,35,40,.9);color:#f7fffb;
        box-shadow:0 12px 34px rgba(0,0,0,.28),0 0 26px rgba(89,220,214,.10);cursor:pointer;
        font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
        animation:cafassoHoloSignalIn .28s ease-out both;touch-action:manipulation
      }
      .cafasso-holo-signal__orb{position:relative;display:grid;place-items:center;flex:0 0 38px;width:38px;height:38px;border-radius:50%;background:radial-gradient(circle,#cffff8 0 8%,#4ecfc9 22%,rgba(42,166,171,.35) 50%,rgba(42,166,171,.05) 72%);box-shadow:0 0 18px rgba(83,224,218,.58)}
      .cafasso-holo-signal__orb:after{content:"";position:absolute;inset:-5px;border:1px solid rgba(118,240,232,.46);border-radius:50%;animation:cafassoHoloPulse 1.8s ease-out infinite}
      .cafasso-holo-signal__copy{min-width:0;text-align:left}
      .cafasso-holo-signal__copy small{display:block;color:#84ddd8;font:850 7px/1.1 Inter,system-ui;letter-spacing:.13em;text-transform:uppercase}
      .cafasso-holo-signal__copy strong{display:block;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#fff8e9;font:700 12px/1.15 Georgia,serif}
      .cafasso-holo-stage{position:fixed;inset:0;z-index:2147483430;display:grid;place-items:end center;padding:max(18px,env(safe-area-inset-top)) max(18px,env(safe-area-inset-right)) max(20px,env(safe-area-inset-bottom)) max(18px,env(safe-area-inset-left));overflow:hidden;background:radial-gradient(circle at 50% 70%,rgba(57,212,207,.11),transparent 38%),rgba(1,19,25,.28);font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif;animation:cafassoHoloBackdrop .24s ease-out both}
      .cafasso-holo-stage[hidden]{display:none!important}
      .cafasso-holo-stage--spatial{padding:0!important;background:transparent!important;overflow:hidden!important;pointer-events:none!important;animation:none!important}
      .cafasso-holo-stage--spatial:before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at var(--cafasso-holo-light-x,50%) var(--cafasso-holo-light-y,70%),hsla(var(--cafasso-holo-light-h,178),var(--cafasso-holo-light-s,50%),var(--cafasso-holo-light-l,64%),var(--cafasso-holo-light-a,.12)),transparent 18%);mix-blend-mode:screen}
      .cafasso-holo-stage--spatial .cafasso-holo-close{pointer-events:auto}
      .cafasso-holo-stage--spatial .cafasso-holo-scene{position:absolute;min-height:0;width:320px;height:560px;pointer-events:none}
      .cafasso-holo-stage--spatial .cafasso-holo-person{height:100%;max-width:100%;margin:0;transform:perspective(900px) rotateY(var(--cafasso-holo-ry,0deg)) rotateX(var(--cafasso-holo-rx,0deg));transform-origin:50% 100%}
      .cafasso-holo-stage--spatial .cafasso-holo-projector{bottom:0;width:78%;height:88%;opacity:.48}
      .cafasso-holo-stage--spatial .cafasso-holo-base{bottom:-2px;width:var(--cafasso-holo-contact-width,46%);height:18px;opacity:var(--cafasso-holo-contact-opacity,.22);filter:blur(var(--cafasso-holo-contact-blur,8px));border:0;background:radial-gradient(ellipse,rgba(151,255,246,.66),rgba(54,211,204,.20) 42%,transparent 72%);box-shadow:none}
      .cafasso-holo-stage--spatial .cafasso-holo-glitch{opacity:.40}
      .cafasso-holo-stage--spatial .cafasso-holo-card{position:fixed;left:50%;bottom:max(12px,calc(env(safe-area-inset-bottom) + 8px));transform:translateX(-50%);pointer-events:auto}
      .cafasso-holo-stage--spatial .cafasso-holo-audio-hint{position:fixed;left:50%;top:max(14px,calc(env(safe-area-inset-top) + 8px));transform:translateX(-50%);pointer-events:none}
      .cafasso-holo-occluder{position:absolute;z-index:4;pointer-events:none;object-fit:fill}
      .cafasso-holo-close{position:absolute;z-index:4;right:max(15px,calc(env(safe-area-inset-right) + 10px));top:max(15px,calc(env(safe-area-inset-top) + 10px));width:42px;height:42px;border:1px solid rgba(183,247,241,.35);border-radius:50%;background:rgba(8,38,43,.82);color:#eafffb;font:300 27px/1 Georgia,serif;cursor:pointer;touch-action:manipulation}
      .cafasso-holo-scene{position:relative;width:min(920px,96vw);height:min(78vh,760px);min-height:390px;display:flex;align-items:flex-end;justify-content:center;pointer-events:none}
      .cafasso-holo-position--left .cafasso-holo-scene{justify-content:flex-start}.cafasso-holo-position--right .cafasso-holo-scene{justify-content:flex-end}
      .cafasso-holo-projector{position:absolute;left:50%;bottom:0;width:min(560px,78vw);height:76%;transform:translateX(-50%);clip-path:polygon(39% 100%,61% 100%,91% 0,9% 0);background:linear-gradient(180deg,rgba(108,242,235,.02),rgba(90,231,222,.10) 70%,rgba(90,231,222,.24));filter:blur(.2px);opacity:.92}
      .cafasso-holo-projector:after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(180deg,transparent 0 7px,rgba(174,255,250,.09) 8px,transparent 9px);animation:cafassoHoloScan 5.5s linear infinite}
      .cafasso-holo-base{position:absolute;left:50%;bottom:0;width:min(330px,56vw);height:30px;transform:translateX(-50%);border:1px solid rgba(125,239,231,.58);border-radius:50%;background:radial-gradient(ellipse,rgba(167,255,248,.35),rgba(43,181,180,.12) 45%,rgba(10,76,81,.1) 70%,transparent 72%);box-shadow:0 0 38px rgba(78,232,223,.30),inset 0 0 22px rgba(174,255,249,.25)}
      .cafasso-holo-person{position:relative;z-index:2;height:calc(100% - 30px);max-width:min(58vw,520px);display:flex;align-items:flex-end;justify-content:center;filter:drop-shadow(0 0 10px rgba(109,244,236,.34));pointer-events:auto;transform-origin:50% 100%;animation:cafassoHoloMaterialize .68s cubic-bezier(.18,.78,.22,1) both}
      .cafasso-holo-person video,.cafasso-holo-person img{display:block;max-width:100%;max-height:100%;height:100%;width:auto;object-fit:contain;object-position:center bottom;filter:saturate(.82) contrast(1.04) drop-shadow(0 0 12px rgba(83,226,218,.18))}
      .cafasso-holo-person video{background:transparent}
      .cafasso-holo-cutout-canvas{display:block;max-width:100%;max-height:100%;height:100%;width:auto;object-fit:contain;object-position:center bottom;filter:saturate(.82) contrast(1.04) drop-shadow(0 0 12px rgba(83,226,218,.18))}
      .cafasso-holo-cutout-loading{position:absolute;left:50%;bottom:28%;transform:translateX(-50%);padding:7px 10px;border:1px solid rgba(181,255,249,.28);border-radius:999px;background:rgba(5,32,37,.74);color:#cdf8f3;font:800 8px/1 Inter,system-ui;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap}
      .cafasso-holo-fallback{position:relative;width:min(250px,48vw);height:70%;min-height:270px;opacity:.82}
      .cafasso-holo-fallback__head{position:absolute;left:50%;top:4%;width:29%;aspect-ratio:1;border-radius:48% 48% 44% 44%;transform:translateX(-50%);background:linear-gradient(135deg,rgba(184,255,249,.76),rgba(64,203,201,.24));box-shadow:0 0 18px rgba(114,242,234,.34)}
      .cafasso-holo-fallback__body{position:absolute;left:12%;right:12%;top:24%;bottom:0;border-radius:45% 45% 18% 18%/23% 23% 8% 8%;background:linear-gradient(90deg,rgba(53,176,180,.18),rgba(187,255,249,.67) 50%,rgba(53,176,180,.18));clip-path:polygon(24% 0,76% 0,100% 100%,0 100%)}
      .cafasso-holo-fallback:after{content:"VIDEO DEL FORMADOR";position:absolute;left:50%;top:47%;transform:translate(-50%,-50%);width:180%;text-align:center;color:rgba(221,255,251,.64);font:850 9px/1 Inter,system-ui;letter-spacing:.18em;text-shadow:0 0 8px rgba(60,219,211,.55)}
      .cafasso-holo-glitch{position:absolute;z-index:3;inset:0;pointer-events:none;mix-blend-mode:screen;background:repeating-linear-gradient(180deg,transparent 0 5px,rgba(134,255,248,.075) 6px,transparent 7px);opacity:.72}
      .cafasso-holo-card{position:absolute;z-index:5;left:50%;bottom:44px;transform:translateX(-50%);width:min(620px,calc(100vw - 30px));padding:15px 17px;border:1px solid rgba(160,241,232,.34);border-radius:17px;background:rgba(6,35,39,.91);box-shadow:0 16px 46px rgba(0,0,0,.30);color:#f7fffa;pointer-events:auto;backdrop-filter:blur(9px);-webkit-backdrop-filter:blur(9px)}
      .cafasso-holo-card__meta{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}.cafasso-holo-card__meta strong{color:#fff1bf;font:700 17px/1.1 Georgia,serif}.cafasso-holo-card__meta span{color:#77d8d2;font:850 8px/1 Inter,system-ui;text-transform:uppercase;letter-spacing:.11em}
      .cafasso-holo-card p{margin:8px 0 0;color:#e6f5ef;font-size:13px;line-height:1.48}
      .cafasso-holo-card__actions{display:flex;justify-content:flex-end;gap:8px;margin-top:12px}.cafasso-holo-card__actions button{min-height:38px;border:1px solid rgba(155,234,226,.30);border-radius:999px;padding:8px 12px;background:rgba(255,255,255,.06);color:#effefa;font:800 10px/1 Inter,system-ui;cursor:pointer}.cafasso-holo-card__actions .primary{background:#f1c85b;border-color:#ffe49d;color:#17302f}
      .cafasso-holo-audio-hint{position:absolute;z-index:5;left:50%;top:20px;transform:translateX(-50%);padding:7px 10px;border-radius:999px;background:rgba(5,31,35,.76);color:#c9f2ed;font:750 9px/1 Inter,system-ui;pointer-events:none;opacity:.9}
      body.cafasso-holo-open{overflow:hidden!important}
      @media(max-width:820px),(pointer:coarse){
        .cafasso-holo-signal{right:max(10px,env(safe-area-inset-right));bottom:max(86px,calc(env(safe-area-inset-bottom) + 78px));max-width:calc(100vw - 20px)}
        .cafasso-holo-stage{padding:0 max(8px,env(safe-area-inset-right)) max(8px,env(safe-area-inset-bottom)) max(8px,env(safe-area-inset-left));background:radial-gradient(circle at 50% 62%,rgba(57,212,207,.13),transparent 38%),rgba(1,19,25,.34)}
        .cafasso-holo-scene{width:100%;height:calc(100dvh - max(6px,env(safe-area-inset-bottom)));min-height:0}
        .cafasso-holo-person{height:72%;max-width:86vw;margin-bottom:116px}
        .cafasso-holo-projector{height:72%;bottom:104px;width:88vw}
        .cafasso-holo-base{bottom:104px;width:62vw}
        .cafasso-holo-stage--spatial .cafasso-holo-person{height:100%;max-width:100%;margin:0}
        .cafasso-holo-stage--spatial .cafasso-holo-projector{height:88%;bottom:0;width:78%}
        .cafasso-holo-stage--spatial .cafasso-holo-base{bottom:-2px;width:var(--cafasso-holo-contact-width,46vw)}
        .cafasso-holo-card{bottom:8px;width:calc(100vw - 16px);padding:13px 14px;border-radius:15px}
        .cafasso-holo-card__meta strong{font-size:15px}.cafasso-holo-card p{font-size:12px;line-height:1.42}
        .cafasso-holo-audio-hint{top:max(13px,env(safe-area-inset-top))}
      }
      @media(max-height:620px) and (orientation:landscape){
        .cafasso-holo-person{height:80%;margin-bottom:74px}.cafasso-holo-projector{bottom:65px;height:75%}.cafasso-holo-base{bottom:64px}.cafasso-holo-card{left:auto;right:10px;bottom:10px;transform:none;width:min(430px,47vw)}
      }
      @media(prefers-reduced-motion:reduce){
        .cafasso-holo-signal,.cafasso-holo-person,.cafasso-holo-stage{animation:none!important}.cafasso-holo-projector:after,.cafasso-holo-signal__orb:after{animation:none!important}
      }
      @keyframes cafassoHoloSignalIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
      @keyframes cafassoHoloPulse{0%{transform:scale(.72);opacity:.8}100%{transform:scale(1.5);opacity:0}}
      @keyframes cafassoHoloBackdrop{from{opacity:0}to{opacity:1}}
      @keyframes cafassoHoloMaterialize{0%{opacity:0;transform:translateY(16px) scaleY(.35);filter:blur(5px)}45%{opacity:.72;transform:translateY(2px) scaleY(1.025);filter:blur(1px)}100%{opacity:1;transform:none;filter:none}}
      @keyframes cafassoHoloScan{from{transform:translateY(-18px)}to{transform:translateY(18px)}}
    `;
    document.head.appendChild(style);
  }

  function sessionKey(config){
    return SESSION_PREFIX+normalize(config.onceKey||config.id||[config.trigger,config.courseId,config.moduleId,config.missionId,config.blockId].filter(Boolean).join(':'));
  }

  function hasSeen(config){
    if(config.repeat==='always')return false;
    try{return sessionStorage.getItem(sessionKey(config))==='1';}catch(error){return false;}
  }

  function markSeen(config){
    if(config.repeat==='always')return;
    try{sessionStorage.setItem(sessionKey(config),'1');}catch(error){}
  }

  function removeSignal(){
    document.getElementById(SIGNAL_ID)?.remove();
  }

  function close(){
    const stage=document.getElementById(STAGE_ID);
    if(stage){
      const video=stage.querySelector('video');
      try{video?.pause();}catch(error){}
      try{stage.__cafassoCutoutCleanup?.()}catch(error){}
      try{stage.__cafassoSpatialCleanup?.()}catch(error){}
      try{if(current?.__cafassoObjectUrl)URL.revokeObjectURL(current.__cafassoObjectUrl)}catch(error){}
      stage.remove();
    }
    document.body.classList.remove('cafasso-holo-open');
    current=null;
    try{window.dispatchEvent(new CustomEvent('cafasso:hologram-close'));}catch(error){}
  }

  function spatialContext(config={}){
    const ctx=context();
    if(ctx.space&&window.CafassoHologramSpots?.resolve){
      const spot=window.CafassoHologramSpots.resolve(config,ctx);
      if(spot?.host)return {kind:'world',...spot};
    }
    if((config.courseSpotId||ctx.view==='module')&&window.CafassoHologramSpots?.courseFind){
      const spot=window.CafassoHologramSpots.courseFind(config.courseSpotId||'curso-derecha');
      return {
        kind:'course',
        id:spot.id,label:spot.label,x:spot.x,y:spot.y,scale:Math.max(.35,Math.min(1.35,spot.scale*Number(config.spotScale||1))),
        perspective:{rotateY:0,rotateX:0},contact:{width:28,opacity:.20,blur:8},
        light:{hue:178,saturation:48,luminosity:64,opacity:.18},
        host:document.documentElement
      };
    }
    return null;
  }

  function imageFitRect(hostRect,kind){
    if(kind==='course')return {left:0,top:0,width:window.innerWidth||hostRect.width,height:window.innerHeight||hostRect.height};
    const aspect=16/9;
    const containerRatio=hostRect.width/Math.max(1,hostRect.height);
    if(Math.abs(containerRatio-aspect)<.01)return hostRect;
    if(containerRatio>aspect){
      const width=hostRect.width,height=width/aspect;
      return {left:hostRect.left,top:hostRect.top+(hostRect.height-height)/2,width,height};
    }
    const height=hostRect.height,width=height*aspect;
    return {left:hostRect.left+(hostRect.width-width)/2,top:hostRect.top,width,height};
  }

  function installSpatialStage(stage,config){
    const spot=spatialContext(config);
    if(!spot)return null;
    const scene=stage.querySelector('.cafasso-holo-scene');
    if(!scene)return null;
    stage.classList.add('cafasso-holo-stage--spatial');
    stage.dataset.holoSpot=spot.id||'';
    stage.dataset.holoSpace=spot.space||spot.kind||'';
    const light=spot.light||{};
    stage.style.setProperty('--cafasso-holo-light-h',String(Number(light.hue||178)));
    stage.style.setProperty('--cafasso-holo-light-s',String(Number(light.saturation||50))+'%');
    stage.style.setProperty('--cafasso-holo-light-l',String(Number(light.luminosity||64))+'%');
    stage.style.setProperty('--cafasso-holo-light-a',String(Number(light.opacity||.18)));
    scene.style.setProperty('--cafasso-holo-ry',String(Number(spot.perspective?.rotateY||0))+'deg');
    scene.style.setProperty('--cafasso-holo-rx',String(Number(spot.perspective?.rotateX||0))+'deg');
    scene.style.setProperty('--cafasso-holo-contact-width',String(Number(spot.contact?.width||26))+'%');
    scene.style.setProperty('--cafasso-holo-contact-opacity',String(Number(spot.contact?.opacity||.20)));
    scene.style.setProperty('--cafasso-holo-contact-blur',String(Number(spot.contact?.blur||8))+'px');

    let raf=0,stopped=false;
    const layout=()=>{
      if(stopped||!stage.isConnected)return;
      const host=spot.kind==='world'&&window.CafassoHologramSpots?.scene?window.CafassoHologramSpots.scene(spot.space):spot.host;
      if(!host?.isConnected){raf=requestAnimationFrame(layout);return}
      const raw=host.getBoundingClientRect();
      const rect=imageFitRect(raw,spot.kind);
      const x=rect.left+rect.width*(Number(spot.x||50)/100);
      const y=rect.top+rect.height*(Number(spot.y||88)/100);
      const viewportW=Math.max(320,window.innerWidth||raw.width||320);
      const viewportH=Math.max(420,window.innerHeight||raw.height||420);
      const baseW=Math.min(440,Math.max(250,viewportW*(spot.kind==='course'?.34:.31)));
      const baseH=Math.min(690,Math.max(400,viewportH*(spot.kind==='course'?.76:.73)));
      const scale=Number(spot.scale||.75);
      const width=baseW*scale,height=baseH*scale;
      scene.style.left=(x-width/2)+'px';
      scene.style.top=(y-height)+'px';
      scene.style.width=width+'px';
      scene.style.height=height+'px';
      stage.style.setProperty('--cafasso-holo-light-x',(100*x/viewportW)+'%');
      stage.style.setProperty('--cafasso-holo-light-y',(100*y/viewportH)+'%');
      raf=requestAnimationFrame(layout);
    };
    layout();
    const mask=spot.occlusion?.maskUrl||config.occlusionMaskUrl;
    if(mask){
      const img=document.createElement('img');
      img.className='cafasso-holo-occluder';
      img.src=mask;img.alt='';img.setAttribute('aria-hidden','true');
      Object.assign(img.style,{left:'0',top:'0',width:'100%',height:'100%'});
      stage.appendChild(img);
    }
    const cleanup=()=>{stopped=true;if(raf)cancelAnimationFrame(raf)};
    stage.__cafassoSpatialCleanup=cleanup;
    return spot;
  }

  function mediaHtml(config){
    const sources=[];
    if(normalize(config.videoWebm))sources.push('<source src="'+esc(config.videoWebm)+'" type="video/webm">');
    if(normalize(config.videoMov))sources.push('<source src="'+esc(config.videoMov)+'" type="video/quicktime">');
    if(normalize(config.videoMp4))sources.push('<source src="'+esc(config.videoMp4)+'" type="video/mp4">');
    if(sources.length){
      const cors=config.removeBackground?'crossorigin="anonymous" ':'';
      return '<video '+cors+'playsinline preload="metadata" '+(config.loop?'loop ':'')+(config.muted?'muted ':'')+(normalize(config.poster)?'poster="'+esc(config.poster)+'" ':'')+'>'+sources.join('')+'</video>';
    }
    if(normalize(config.poster))return '<img src="'+esc(config.poster)+'" alt="">';
    return '<div class="cafasso-holo-fallback" aria-hidden="true"><div class="cafasso-holo-fallback__head"></div><div class="cafasso-holo-fallback__body"></div></div>';
  }

  function show(config={}){
    installStyles();
    close();
    removeSignal();
    current={...config};
    const stage=document.createElement('section');
    stage.id=STAGE_ID;
    stage.className='cafasso-holo-stage cafasso-holo-position--'+(['left','right'].includes(config.position)?config.position:'center');
    stage.setAttribute('role','dialog');
    stage.setAttribute('aria-modal','true');
    stage.setAttribute('aria-label','Mensaje holográfico del formador');
    const hasVideo=Boolean(normalize(config.videoWebm)||normalize(config.videoMov)||normalize(config.videoMp4));
    stage.innerHTML=`
      <button class="cafasso-holo-close" type="button" aria-label="Cerrar holograma">×</button>
      <div class="cafasso-holo-scene">
        <div class="cafasso-holo-projector" aria-hidden="true"></div>
        <div class="cafasso-holo-person">${mediaHtml(config)}</div>
        <div class="cafasso-holo-glitch" aria-hidden="true"></div>
        <div class="cafasso-holo-base" aria-hidden="true"></div>
        ${hasVideo?'<div class="cafasso-holo-audio-hint">Mensaje del formador</div>':''}
        <article class="cafasso-holo-card">
          <div class="cafasso-holo-card__meta"><strong>${esc(config.name||'Formador')}</strong><span>${esc(config.role||'Acompañamiento')}</span></div>
          ${normalize(config.message)?'<p>'+esc(config.message)+'</p>':''}
          <div class="cafasso-holo-card__actions">
            ${hasVideo?'<button type="button" data-holo-replay>Repetir</button>':''}
            <button type="button" class="primary" data-holo-continue>Continuar</button>
          </div>
        </article>
      </div>
    `;
    document.body.appendChild(stage);
    const spatial=installSpatialStage(stage,config);
    if(!spatial)document.body.classList.add('cafasso-holo-open');
    markSeen(config);

    const video=stage.querySelector('video');
    if(video){
      video.volume=Math.max(0,Math.min(1,Number(config.volume==null?1:config.volume)));
      const person=stage.querySelector('.cafasso-holo-person');
      if(config.removeBackground&&window.CafassoHologramCutout?.attach&&person){
        Promise.resolve(window.CafassoHologramCutout.attach(video,person,config)).then(cleanup=>{
          if(!stage.isConnected){try{cleanup?.()}catch(error){};return}
          stage.__cafassoCutoutCleanup=cleanup;
        }).catch(error=>console.warn('CAFASSO cutout attach',error));
      }
      const play=()=>video.play().catch(()=>{
        const hint=stage.querySelector('.cafasso-holo-audio-hint');
        if(hint){hint.textContent='Tocá Repetir para escuchar';hint.style.pointerEvents='auto';}
      });
      setTimeout(play,80);
      stage.querySelector('[data-holo-replay]')?.addEventListener('click',()=>{try{video.currentTime=0;}catch(error){}play();});
    }
    stage.querySelector('.cafasso-holo-close')?.addEventListener('click',close);
    stage.querySelector('[data-holo-continue]')?.addEventListener('click',close);
    stage.addEventListener('click',event=>{if(event.target===stage&&!stage.classList.contains('cafasso-holo-stage--spatial')&&config.dismissOnBackdrop!==false)close();});
    window.addEventListener('keydown',event=>{if(event.key==='Escape')close();},{once:true});
    try{window.dispatchEvent(new CustomEvent('cafasso:hologram-open',{detail:{config:current}}));}catch(error){}
    return stage;
  }

  function announce(config={}){
    installStyles();
    if(!config||hasSeen(config))return null;
    removeSignal();
    const signal=document.createElement('button');
    signal.id=SIGNAL_ID;
    signal.type='button';
    signal.className='cafasso-holo-signal';
    signal.setAttribute('aria-label','Abrir mensaje del formador');
    signal.innerHTML='<span class="cafasso-holo-signal__orb" aria-hidden="true">✦</span><span class="cafasso-holo-signal__copy"><small>'+esc(config.kicker||'Mensaje del formador')+'</small><strong>'+esc(config.signalTitle||config.name||'Hay algo para vos')+'</strong></span>';
    signal.addEventListener('click',()=>show(config),{once:true});
    document.body.appendChild(signal);
    return signal;
  }

  function register(input){
    const list=Array.isArray(input)?input:[input];
    list.filter(Boolean).forEach(item=>rules.push({...item}));
    scheduleSync();
    return rules.length;
  }

  function currentSpace(){
    const checks=[
      ['casa','.cafasso-house'],['patio','.cafasso-patio'],['escuela','.cafasso-escuela'],['parroquia','.cafasso-parroquia'],['recursos','.cafasso-recursos']
    ];
    for(const [name,selector] of checks){
      const node=document.querySelector(selector);
      if(node&&!node.hidden&&getComputedStyle(node).display!=='none')return name;
    }
    const params=new URLSearchParams(location.search);
    const hinted=normalize(params.get('space')).toLowerCase();
    return ['casa','patio','escuela','parroquia','recursos'].includes(hinted)?hinted:'';
  }

  function context(){
    const state=window.CafassoCourseExperience||null;
    const course=state?.course||null;
    const module=state?.module||null;
    const active=document.querySelector('[data-mission-id].active');
    return {
      view:state?.view||'',
      courseId:normalize(course?._id||course?.id),
      moduleId:normalize(module?._id||module?.id),
      missionId:normalize(active?.getAttribute('data-mission-id')),
      space:currentSpace(),
      course,
      module
    };
  }

  function dynamicRules(ctx){
    const settings=ctx.module?.settings&&typeof ctx.module.settings==='object'?ctx.module.settings:{};
    const items=Array.isArray(settings.holograms)?settings.holograms:[];
    return items.map((item,index)=>({
      id:item.id||('module-hologram-'+ctx.moduleId+'-'+index),
      trigger:item.trigger||'mission-enter',
      courseId:item.courseId||ctx.courseId,
      moduleId:item.moduleId||ctx.moduleId,
      ...item
    }));
  }

  function matches(rule,trigger,ctx,detail={}){
    if(normalize(rule.trigger||'mission-enter')!==trigger)return false;
    if(rule.space&&normalize(rule.space).toLowerCase()!==normalize(ctx.space).toLowerCase())return false;
    if(rule.courseId&&normalize(rule.courseId)!==ctx.courseId)return false;
    if(rule.moduleId&&normalize(rule.moduleId)!==ctx.moduleId)return false;
    if(rule.missionId&&normalize(rule.missionId)!==normalize(ctx.missionId||detail.missionId))return false;
    if(rule.blockId&&normalize(rule.blockId)!==normalize(detail.blockId))return false;
    return true;
  }

  function present(rule,trigger){
    const config={...rule,trigger};
    const delay=Math.max(0,Number(config.delayMs||0));
    if(config.activation==='auto'){
      if(delay){setTimeout(()=>{if(!hasSeen(config))show(config)},delay);return config}
      return show(config);
    }
    return announce(config);
  }

  function fire(trigger,detail={}){
    const ctx=context();
    const pool=[...rules,...globalRules,...dynamicRules(ctx)];
    const rule=pool.find(item=>matches(item,trigger,ctx,detail)&&!hasSeen(item));
    if(!rule)return null;
    return present(rule,trigger);
  }

  function syncExperience(){
    if(PREVIEW_MODE)return;
    const ctx=context();
    if(ctx.view==='module'&&ctx.moduleId){
      lastSpaceKey='';
      const key=[ctx.courseId,ctx.moduleId,ctx.missionId].join(':');
      if(ctx.missionId&&key!==lastMissionKey){
        lastMissionKey=key;
        if(!fire('mission-enter',{missionId:ctx.missionId}))fire('module-enter',{});
      }else if(!ctx.missionId&&!lastMissionKey){
        lastMissionKey=[ctx.courseId,ctx.moduleId,'module'].join(':');
        fire('module-enter',{});
      }
      return;
    }
    lastMissionKey='';
    if(ctx.space){
      const key='space:'+ctx.space;
      if(key!==lastSpaceKey){lastSpaceKey=key;removeSignal();fire('space-enter',{space:ctx.space});}
      return;
    }
    lastSpaceKey='';
    removeSignal();
  }

  async function loadGlobalRules(){
    try{
      let token='';
      try{token=String(JSON.parse(localStorage.getItem('cafassoAuth')||'null')?.sessionToken||'')}catch(error){}
      const response=await fetch(GLOBAL_CONFIG_API+'?title='+encodeURIComponent(GLOBAL_CONFIG_TITLE)+'&holo='+Date.now(),{
        cache:'no-store',
        headers:token?{'Authorization':'Bearer '+token}:{}
      });
      const json=await response.json();
      const list=json?.course?.modules?.[0]?.settings?.holograms;
      globalRules=Array.isArray(list)?list.map((item,index)=>({id:item.id||('global-hologram-'+index),trigger:item.trigger||'space-enter',...item})):[];
    }catch(error){globalRules=[]}
    scheduleSync();
    return globalRules;
  }

  function scheduleSync(){
    clearTimeout(syncTimer);
    syncTimer=setTimeout(syncExperience,120);
  }

  function previewFromStorage(){
    if(!PREVIEW_MODE)return false;
    try{
      const preview=JSON.parse(localStorage.getItem('cafassoHologramPreviewRule')||'null');
      if(!preview||Number(preview.expiresAt||0)<Date.now()){localStorage.removeItem('cafassoHologramPreviewRule');return false}
      const ctx=context();
      if(preview.space&&ctx.space&&String(preview.space)!==String(ctx.space))return false;
      setTimeout(()=>show({...preview,activation:'auto',repeat:'always'}),260);
      return true;
    }catch(error){return false}
  }

  window.CafassoHologram={show,announce,close,register,fire,context,loadGlobalRules,get globalRules(){return globalRules.slice()},get current(){return current;}};

  window.addEventListener('cafasso:course-experience-ready',scheduleSync);
  window.addEventListener('cafasso:state-ready',scheduleSync);
  window.addEventListener('cafasso:block-completed',event=>fire('block-completed',event?.detail||{}));
  window.addEventListener('cafasso:module-completed',event=>fire('module-completed',event?.detail||{}));
  window.addEventListener('hashchange',scheduleSync);
  window.addEventListener('pagehide',close);
  window.addEventListener('cafasso:navigate',close);

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{installStyles();loadGlobalRules();scheduleSync();previewFromStorage();},{once:true});
  else {installStyles();loadGlobalRules();scheduleSync();previewFromStorage()}

  const observer=new MutationObserver(()=>scheduleSync());
  const observe=()=>{const host=document.getElementById('main')||document.getElementById('app');if(host)observer.observe(host,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});else setTimeout(observe,180);};
  observe();
})();