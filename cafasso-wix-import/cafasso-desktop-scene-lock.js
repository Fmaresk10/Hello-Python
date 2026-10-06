(() => {
  const params = new URLSearchParams(location.search);
  const space = (params.get('space') || 'house').toLowerCase();
  if (!['house','patio','escuela','recursos'].includes(space)) return;
  if (window.matchMedia?.('(max-width: 820px), (pointer: coarse)').matches) return;
  if (window.__cafassoDesktopSceneLockInstalled) return;
  window.__cafassoDesktopSceneLockInstalled = true;

  const BASE_W = 1672;
  const BASE_H = 941;
  const STYLE_ID = 'cafassoDesktopSceneLockStyles';

  const CONFIG = {
    house:{
      host:'.cafasso-house',
      sceneClass:'cafasso-house-desktop-scene',
      selectors:[
        '.cafasso-house__image',
        '.cafasso-space-link--casa[data-space="patio"]',
        '.cafasso-space-link--house-recursos',
        '.cafasso-admin-button',
        '.cafasso-bitacora-object',
        '.cafasso-house-corner',
        '.cafasso-animator-sheet',
        '.cafasso-world-compass',
        '.cafasso-explore-secret--house',
        '.cafasso-corazon-huella',
        '.cafasso-calendar-layer'
      ]
    },
    patio:{
      host:'.cafasso-patio',
      sceneClass:'cafasso-patio-desktop-scene',
      selectors:[
        '.cafasso-patio__image',
        '.cafasso-space-link--patio-home',
        '.cafasso-space-link--patio-escuela',
        '.cafasso-space-link--patio-parroquia',
        '.cafasso-role-tool--patio',
        '.cafasso-presencia-ball',
        '.cafasso-patio-encounter-alone',
        '.cafasso-patio-secret',
        '.cafasso-corazon-huella',
        '.cafasso-calendar-layer'
      ]
    },
    escuela:{
      host:'.cafasso-escuela',
      sceneClass:'cafasso-school-desktop-scene',
      selectors:[
        '.cafasso-escuela__image',
        '.cafasso-space-link--escuela-patio',
        '.cafasso-school-board',
        '.cafasso-role-tool--school',
        '.cafasso-school-resume',
        '.cafasso-school-secret',
        '.cafasso-corazon-huella',
        '.cafasso-calendar-layer'
      ]
    },
    recursos:{
      host:'.cafasso-recursos',
      sceneClass:'cafasso-resources-desktop-scene',
      selectors:[
        '.cafasso-recursos__image',
        '.cafasso-space-link--recursos-home',
        '.cafasso-role-tool--resources',
        '.cafasso-recursos__shelf'
      ]
    }
  };

  const cfg = CONFIG[space];
  let host = null;
  let scene = null;
  let observer = null;

  function isMobile(){
    return document.documentElement.classList.contains('cafasso-mobile') ||
      Boolean(window.matchMedia?.('(max-width: 820px), (pointer: coarse)').matches);
  }

  let baseline=null;

  function viewportSize(){
    const vv=window.visualViewport;
    return {
      width:Math.max(1,Math.round(vv?.width||window.innerWidth||1)),
      height:Math.max(1,Math.round(vv?.height||window.innerHeight||1))
    };
  }

  function baselineForViewport(){
    const current=viewportSize();
    if(!baseline){
      baseline={
        viewportWidth:current.width,
        viewportHeight:current.height,
        scale:Math.min(current.width/BASE_W,current.height/BASE_H)
      };
      return baseline;
    }
    // Recalcular solo si cambia realmente el ancho. Un cambio solo de altura
    // suele ser barra del navegador / fullscreen y no debe mover la escena.
    if(Math.abs(current.width-baseline.viewportWidth)>8){
      baseline={
        viewportWidth:current.width,
        viewportHeight:current.height,
        scale:Math.min(current.width/BASE_W,current.height/BASE_H)
      };
    }
    return baseline;
  }

  function ensureStyles(){
    if(document.getElementById(STYLE_ID)) return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=
      'html:not(.cafasso-mobile) .cafasso-house .cafasso-house-desktop-scene,'+
      'html:not(.cafasso-mobile) .cafasso-patio .cafasso-patio-desktop-scene,'+
      'html:not(.cafasso-mobile) .cafasso-escuela .cafasso-school-desktop-scene,'+
      'html:not(.cafasso-mobile) .cafasso-recursos .cafasso-resources-desktop-scene{'+
      'position:absolute!important;left:0!important;top:0!important;right:auto!important;bottom:auto!important;'+
      'width:1672px!important;height:941px!important;overflow:hidden!important;'+
      'transform:scale(var(--cafasso-desktop-scene-scale,1))!important;transform-origin:0 0!important;'+
      'z-index:1!important;will-change:transform;}'+
      'html:not(.cafasso-mobile) .cafasso-house .cafasso-house-desktop-scene > .cafasso-house__image,'+
      'html:not(.cafasso-mobile) .cafasso-patio .cafasso-patio-desktop-scene > .cafasso-patio__image,'+
      'html:not(.cafasso-mobile) .cafasso-escuela .cafasso-school-desktop-scene > .cafasso-escuela__image,'+
      'html:not(.cafasso-mobile) .cafasso-recursos .cafasso-resources-desktop-scene > .cafasso-recursos__image{'+
      'position:absolute!important;inset:0!important;width:100%!important;height:100%!important;'+
      'max-width:none!important;max-height:none!important;object-fit:fill!important;object-position:center center!important;transform:none!important;}';
    document.head.appendChild(style);
  }

  function moveSpatial(){
    if(!host || !scene || isMobile()) return;
    cfg.selectors.forEach(selector=>{
      host.querySelectorAll(selector).forEach(node=>{
        if(node===scene || scene.contains(node)) return;
        scene.appendChild(node);
      });
    });
  }

  function sizeScene(){
    if(!scene || isMobile()) return;
    const base=baselineForViewport();
    const current=viewportSize();
    const scale=base.scale;
    const renderedWidth=BASE_W*scale;
    scene.style.setProperty('--cafasso-desktop-scene-scale',String(scale));
    scene.style.left=Math.max(0,(current.width-renderedWidth)/2)+'px';
    scene.style.top='0px';
    scene.dataset.cafassoLockedScale=scale.toFixed(6);
    scene.dataset.cafassoBaselineViewport=base.viewportWidth+'x'+base.viewportHeight;
    document.documentElement.dataset.cafassoDesktopSceneScale=scale.toFixed(6);
  }

  function mount(){
    if(isMobile()) return false;
    host=document.querySelector(cfg.host);
    if(!host) return false;
    scene=host.querySelector('.'+cfg.sceneClass);
    if(!scene){
      scene=document.createElement('div');
      scene.className=cfg.sceneClass;
      scene.setAttribute('aria-label','Escena CAFASSO bloqueada');
      host.insertBefore(scene,host.firstChild);
    }
    moveSpatial();
    sizeScene();
    host.dataset.cafassoDesktopSceneLocked='1';
    if(!observer){
      observer=new MutationObserver(()=>{
        moveSpatial();
        sizeScene();
      });
      observer.observe(host,{childList:true});
    }
    return true;
  }

  function refresh(){
    if(isMobile()) return;
    if(!mount()) setTimeout(mount,80);
    else sizeScene();
  }

  ensureStyles();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',refresh,{once:true});
  else refresh();

  window.addEventListener('resize',refresh,{passive:true});
  window.visualViewport?.addEventListener('resize',refresh,{passive:true});
  document.addEventListener('fullscreenchange',refresh,{passive:true});
})();