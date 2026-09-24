(()=>{
  if(window.__cafassoPwaRegistered)return;
  window.__cafassoPwaRegistered=true;

  const script=document.currentScript;
  const allowInstallUi=script?.dataset.installUi!=='off';
  const standalone=window.matchMedia?.('(display-mode: standalone)').matches||window.navigator.standalone===true;
  document.documentElement.dataset.cafassoStandalone=standalone?'true':'false';

  const addStyles=()=>{
    if(document.getElementById('cafassoPwaUiStyles'))return;
    const style=document.createElement('style');
    style.id='cafassoPwaUiStyles';
    style.textContent=`
      .cafasso-pwa-toast{
        position:fixed;left:50%;bottom:calc(18px + env(safe-area-inset-bottom));z-index:2147483600;
        transform:translateX(-50%);width:min(430px,calc(100vw - 24px));
        display:flex;align-items:center;gap:12px;padding:12px 13px;border:1px solid rgba(255,255,255,.14);
        border-radius:17px;background:rgba(15,45,77,.96);color:#fff;
        box-shadow:0 18px 45px rgba(5,22,35,.28);font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif
      }
      .cafasso-pwa-toast__text{min-width:0;flex:1}
      .cafasso-pwa-toast strong{display:block;font-size:13px}
      .cafasso-pwa-toast small{display:block;margin-top:2px;color:rgba(255,255,255,.68);font-size:10px;line-height:1.35}
      .cafasso-pwa-toast button{border:0;border-radius:11px;padding:9px 11px;background:#F2C94C;color:#0F2D4D;font:800 11px Inter,system-ui;white-space:nowrap;cursor:pointer}
      .cafasso-pwa-toast .cafasso-pwa-dismiss{background:transparent;color:rgba(255,255,255,.68);padding:6px;font-size:15px}
      html[data-cafasso-standalone="true"]{overscroll-behavior:none}
      @media(max-width:560px){.cafasso-pwa-toast{bottom:calc(12px + env(safe-area-inset-bottom));border-radius:15px}}
    `;
    document.head.appendChild(style);
  };

  const toast=(kind,title,detail,actionLabel,onAction,canDismiss=true)=>{
    addStyles();
    document.querySelector('.cafasso-pwa-toast')?.remove();
    const el=document.createElement('div');
    el.className='cafasso-pwa-toast';
    el.dataset.kind=kind;
    el.innerHTML=`<div class="cafasso-pwa-toast__text"><strong></strong><small></small></div><button type="button" data-action></button>${canDismiss?'<button type="button" class="cafasso-pwa-dismiss" aria-label="Cerrar">×</button>':''}`;
    el.querySelector('strong').textContent=title;
    el.querySelector('small').textContent=detail;
    const action=el.querySelector('[data-action]');
    action.textContent=actionLabel;
    action.onclick=onAction;
    el.querySelector('.cafasso-pwa-dismiss')?.addEventListener('click',()=>el.remove());
    document.body.appendChild(el);
    return el;
  };

  let refreshing=false;
  navigator.serviceWorker?.addEventListener('controllerchange',()=>{
    if(refreshing)return;
    refreshing=true;
    location.reload();
  });

  const register=async()=>{
    if(!('serviceWorker' in navigator)||!/^https?:$/.test(location.protocol))return;
    try{
      const reg=await navigator.serviceWorker.register('./service-worker.js?v=20260924-6',{scope:'./'});
      window.CafassoPWA=window.CafassoPWA||{};
      window.CafassoPWA.registration=reg;

      const offerUpdate=worker=>{
        if(!worker)return;
        toast('update','Nueva versión de CAFASSO','Actualizá para usar la última versión.','Actualizar',()=>{
          worker.postMessage({type:'SKIP_WAITING'});
        },false);
      };

      if(reg.waiting&&navigator.serviceWorker.controller)offerUpdate(reg.waiting);
      reg.addEventListener('updatefound',()=>{
        const worker=reg.installing;
        worker?.addEventListener('statechange',()=>{
          if(worker.state==='installed'&&navigator.serviceWorker.controller)offerUpdate(worker);
        });
      });

      window.addEventListener('focus',()=>reg.update().catch(()=>{}),{passive:true});
    }catch(error){
      console.warn('[CAFASSO PWA] No se pudo registrar el service worker.',error);
    }
  };

  let deferredInstall=null;
  window.addEventListener('beforeinstallprompt',event=>{
    event.preventDefault();
    deferredInstall=event;
    window.CafassoPWA=window.CafassoPWA||{};
    window.CafassoPWA.canInstall=true;
    window.CafassoPWA.install=async()=>{
      if(!deferredInstall)return false;
      deferredInstall.prompt();
      const choice=await deferredInstall.userChoice;
      deferredInstall=null;
      document.querySelector('[data-kind="install"]')?.remove();
      return choice.outcome==='accepted';
    };
    if(!allowInstallUi||standalone||sessionStorage.getItem('cafassoInstallDismissed')==='1')return;
    setTimeout(()=>{
      if(!deferredInstall||document.querySelector('.cafasso-pwa-toast'))return;
      const el=toast('install','Instalar CAFASSO','Abrilo desde tu pantalla de inicio, sin el navegador.','Instalar',()=>window.CafassoPWA.install(),true);
      el.querySelector('.cafasso-pwa-dismiss')?.addEventListener('click',()=>sessionStorage.setItem('cafassoInstallDismissed','1'),{once:true});
    },1400);
  });

  window.addEventListener('appinstalled',()=>{
    deferredInstall=null;
    document.documentElement.dataset.cafassoStandalone='true';
    document.querySelector('[data-kind="install"]')?.remove();
  });

  register();
})();
