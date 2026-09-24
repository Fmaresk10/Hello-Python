(()=>{
  if(window.__cafassoCourseMobileNativeInstalled)return;
  window.__cafassoCourseMobileNativeInstalled=true;
  if((location.pathname.split('/').pop()||'').toLowerCase()!=='course-player.html')return;

  const MOBILE='(max-width:820px), (pointer:coarse)';
  const root=document.documentElement;
  let bar=null;
  let missionDock=null;
  let missionObserver=null;
  let raf=0;

  const mobile=()=>Boolean(window.matchMedia?.(MOBILE)?.matches);
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  function installStyles(){
    if(document.getElementById('cafassoCourseMobileNativeStyles'))return;
    const style=document.createElement('style');
    style.id='cafassoCourseMobileNativeStyles';
    style.textContent=`
      @media(max-width:820px),(pointer:coarse){
        html[data-cafasso-player="1"] body.cafasso-course-mobile-native{
          overscroll-behavior-y:none;
          -webkit-text-size-adjust:100%;
        }

        .cafasso-course-mobile-bar{
          position:fixed;
          z-index:2147483200;
          left:0;
          right:0;
          top:0;
          min-height:calc(58px + env(safe-area-inset-top));
          padding:calc(8px + env(safe-area-inset-top)) max(12px,env(safe-area-inset-right)) 8px max(12px,env(safe-area-inset-left));
          display:grid;
          grid-template-columns:44px minmax(0,1fr) 44px;
          align-items:center;
          gap:8px;
          background:#102f35;
          border-bottom:1px solid rgba(242,201,76,.18);
          box-shadow:0 5px 16px rgba(0,0,0,.14);
          color:#fff9e8;
        }
        .cafasso-course-mobile-bar__back{
          width:42px;height:42px;border:1px solid rgba(242,201,76,.30);border-radius:50%;
          background:#173f43;color:#fff8df;font:800 20px/1 Inter,system-ui;display:grid;place-items:center;
          padding:0;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation
        }
        .cafasso-course-mobile-bar__copy{min-width:0;text-align:center}
        .cafasso-course-mobile-bar__course{
          display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
          color:#e6c86f;font:850 8px/1.1 Inter,system-ui;text-transform:uppercase;letter-spacing:.09em
        }
        .cafasso-course-mobile-bar__module{
          display:block;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
          color:#fff9e8;font:700 14px/1.15 Georgia,serif
        }
        .cafasso-course-mobile-bar__step{
          display:grid;place-items:center;width:42px;height:42px;border-radius:50%;
          border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.055);
          color:#f1dfad;font:800 9px/1 Inter,system-ui;text-align:center
        }

        html[data-cafasso-player="1"] body.cafasso-linear-module-mode .module-detail{
          padding-top:max(78px,calc(env(safe-area-inset-top) + 70px))!important;
          padding-bottom:calc(104px + env(safe-area-inset-bottom))!important;
        }
        html[data-cafasso-player="1"] body.cafasso-mission-mode .cafasso-mission-shell{
          padding-top:max(78px,calc(env(safe-area-inset-top) + 70px))!important;
          padding-bottom:max(118px,calc(env(safe-area-inset-bottom) + 106px))!important;
        }
        html[data-cafasso-player="1"] body.cafasso-mission-mode.cafasso-mission-native-nav .cafasso-scene-back,
        html[data-cafasso-player="1"] body.cafasso-mission-mode.cafasso-mission-native-nav .cafasso-mission-nav,
        html[data-cafasso-player="1"] body.cafasso-mission-mode.cafasso-course-mobile-native .cafasso-world-return{
          display:none!important;
        }
        .cafasso-mission-mobile-progress{width:min(360px,100%);margin:14px auto 2px;display:grid;gap:7px}
        .cafasso-mission-mobile-progress__meta{display:flex;align-items:center;justify-content:space-between;gap:10px;color:#e4d19a;font:800 8px/1.2 Inter,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase}
        .cafasso-mission-mobile-progress__rail{display:grid;grid-template-columns:repeat(var(--cafasso-mission-count,5),1fr);gap:5px}
        .cafasso-mission-mobile-progress__rail i{display:block;height:4px;border-radius:999px;background:rgba(255,255,255,.16)}
        .cafasso-mission-mobile-progress__rail i.done{background:#75aa83}
        .cafasso-mission-mobile-progress__rail i.active{background:#f1c85b;box-shadow:0 0 0 2px rgba(241,200,91,.14)}
        .cafasso-mission-mobile-dock{position:fixed;z-index:2147483160;left:max(10px,env(safe-area-inset-left));right:max(10px,env(safe-area-inset-right));bottom:max(8px,env(safe-area-inset-bottom));min-height:68px;padding:8px;display:grid;grid-template-columns:minmax(78px,.8fr) minmax(0,1.35fr) minmax(78px,.8fr);gap:8px;align-items:stretch;border:1px solid rgba(223,211,195,.92);border-radius:18px;background:rgba(255,253,249,.97);box-shadow:0 12px 34px rgba(7,27,31,.24);backdrop-filter:blur(12px)}
        .cafasso-mission-mobile-dock[hidden]{display:none!important}
        .cafasso-mission-mobile-dock__step{min-width:0;min-height:50px;padding:8px 9px;border:1px solid #e1d5c5;border-radius:12px;background:#fff;color:#173954;font:850 10px/1.15 Inter,system-ui,sans-serif;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
        .cafasso-mission-mobile-dock__step--next{background:#f2c94c;border-color:#dfb83c;color:#17302f}
        .cafasso-mission-mobile-dock__step:disabled{opacity:.38;cursor:not-allowed}
        .cafasso-mission-mobile-dock__current{min-width:0;display:grid;place-content:center;text-align:center;padding:4px 2px}
        .cafasso-mission-mobile-dock__current small{display:block;color:#8d785c;font:850 7px/1.1 Inter,system-ui,sans-serif;letter-spacing:.09em;text-transform:uppercase}
        .cafasso-mission-mobile-dock__current strong{display:block;margin-top:4px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#3f3022;font:700 12px/1.15 Georgia,serif}

        html[data-cafasso-player="1"] body.cafasso-linear-module-mode .linear-module-nav:not(.linear-module-nav--bottom){
          display:none!important;
        }
        html[data-cafasso-player="1"] body.cafasso-linear-module-mode .linear-module-nav--bottom{
          position:fixed!important;
          z-index:2147483150!important;
          left:max(10px,env(safe-area-inset-left))!important;
          right:max(10px,env(safe-area-inset-right))!important;
          bottom:max(8px,env(safe-area-inset-bottom))!important;
          width:auto!important;
          margin:0!important;
          padding:8px!important;
          display:block!important;
          border:1px solid #dfd3c3!important;
          border-radius:17px!important;
          background:#fffdf9!important;
          box-shadow:0 12px 34px rgba(7,27,31,.22)!important;
        }
        html[data-cafasso-player="1"] body.cafasso-linear-module-mode .linear-module-nav--bottom .linear-module-nav__back,
        html[data-cafasso-player="1"] body.cafasso-linear-module-mode .linear-module-nav--bottom .linear-module-nav__meta{
          display:none!important;
        }
        html[data-cafasso-player="1"] body.cafasso-linear-module-mode .linear-module-nav--bottom .linear-module-nav__controls{
          display:grid!important;
          grid-template-columns:1fr 1fr!important;
          gap:8px!important;
        }
        html[data-cafasso-player="1"] body.cafasso-linear-module-mode .linear-module-nav--bottom .linear-module-nav__step{
          width:100%!important;
          min-height:48px!important;
          max-height:52px!important;
          padding:8px 10px!important;
          border-radius:12px!important;
          overflow:hidden!important;
          white-space:nowrap!important;
          text-overflow:ellipsis!important;
          font-size:11px!important;
          touch-action:manipulation;
          -webkit-tap-highlight-color:transparent
        }

        html[data-cafasso-player="1"] body.cafasso-course-keyboard-open .linear-module-nav--bottom,
        html[data-cafasso-player="1"] body.cafasso-course-keyboard-open .cafasso-mission-mobile-dock{
          display:none!important;
        }
        html[data-cafasso-player="1"] body.cafasso-course-keyboard-open .module-detail{
          padding-bottom:max(28px,env(safe-area-inset-bottom))!important;
        }

        html[data-cafasso-player="1"] body.cafasso-course-switching #main{
          opacity:.35;
          transform:translate3d(10px,0,0);
        }
        html[data-cafasso-player="1"] #main{
          transition:opacity .18s ease,transform .18s ease;
        }

        html[data-cafasso-player="1"] :is(button,a,input,textarea,select,[role="button"]){
          -webkit-tap-highlight-color:transparent;
        }
        html[data-cafasso-player="1"] :is(input,textarea,select){font-size:16px!important}
      }

      @media(prefers-reduced-motion:reduce){
        .cafasso-course-mobile-bar,
        html[data-cafasso-player="1"] #main{transition:none!important}
      }
    `;
    document.head.appendChild(style);
  }

  function currentState(){
    return window.CafassoCourseExperience||null;
  }

  function missionNodes(){
    const shell=document.querySelector('.cafasso-mission-shell');
    if(!shell)return {shell:null,nodes:[],active:-1};
    const nodes=Array.from(shell.querySelectorAll('[data-mission-id]'));
    return {shell,nodes,active:nodes.findIndex(node=>node.classList.contains('active'))};
  }

  function ensureMissionProgress(shell,nodes,active){
    if(!shell||!nodes.length)return;
    let progress=shell.querySelector('.cafasso-mission-mobile-progress');
    if(!progress){
      progress=document.createElement('div');
      progress.className='cafasso-mission-mobile-progress';
      const anchor=shell.querySelector('.cafasso-mission-prompt')||shell.querySelector('.cafasso-mission-head');
      if(anchor)anchor.insertAdjacentElement('afterend',progress); else shell.prepend(progress);
    }
    const signature=nodes.map((node,index)=>index===active?'a':node.classList.contains('done')?'d':node.disabled?'l':'o').join('');
    if(progress.dataset.signature===signature)return;
    progress.dataset.signature=signature;
    const done=nodes.filter(node=>node.classList.contains('done')).length;
    progress.style.setProperty('--cafasso-mission-count',String(nodes.length));
    progress.innerHTML=`<div class="cafasso-mission-mobile-progress__meta"><span>${done===nodes.length?'Recorrido completado':'Progreso del recorrido'}</span><b>${Math.max(1,active+1)}/${nodes.length}</b></div><div class="cafasso-mission-mobile-progress__rail" aria-hidden="true">${nodes.map((node,index)=>`<i class="${node.classList.contains('done')?'done ':''}${index===active?'active':''}"></i>`).join('')}</div>`;
  }

  function ensureMissionDock(){
    if(!mobile()||!document.body.classList.contains('cafasso-mission-mode')){
      document.body.classList.remove('cafasso-mission-native-nav');
      document.getElementById('cafassoMissionMobileDock')?.remove();
      missionDock=null; return;
    }
    const {shell,nodes,active}=missionNodes();
    if(!shell||!nodes.length||active<0){
      document.body.classList.remove('cafasso-mission-native-nav');
      document.getElementById('cafassoMissionMobileDock')?.remove();
      missionDock=null; return;
    }
    document.body.classList.add('cafasso-mission-native-nav');
    ensureMissionProgress(shell,nodes,active);
    missionDock=document.getElementById('cafassoMissionMobileDock');
    if(!missionDock){
      missionDock=document.createElement('nav');
      missionDock.id='cafassoMissionMobileDock';
      missionDock.className='cafasso-mission-mobile-dock';
      missionDock.setAttribute('aria-label','Navegación entre misiones');
      missionDock.innerHTML='<button type="button" class="cafasso-mission-mobile-dock__step" data-mobile-mission-prev>← Anterior</button><div class="cafasso-mission-mobile-dock__current"><small>Misión</small><strong data-mobile-mission-title>—</strong></div><button type="button" class="cafasso-mission-mobile-dock__step cafasso-mission-mobile-dock__step--next" data-mobile-mission-next>Siguiente →</button>';
      document.body.appendChild(missionDock);
    }
    const activeNode=nodes[active],prev=active>0?nodes[active-1]:null,next=active<nodes.length-1?nodes[active+1]:null;
    missionDock.querySelector('[data-mobile-mission-title]').textContent=activeNode?.querySelector('span')?.textContent?.trim()||`Misión ${active+1}`;
    const prevBtn=missionDock.querySelector('[data-mobile-mission-prev]'),nextBtn=missionDock.querySelector('[data-mobile-mission-next]');
    prevBtn.disabled=!prev||prev.disabled; nextBtn.disabled=!next||next.disabled;
    prevBtn.onclick=()=>{if(prev&&!prev.disabled)prev.click();};
    nextBtn.onclick=()=>{if(next&&!next.disabled)next.click();};
  }

  function publishedModules(course){
    return (Array.isArray(course?.modules)?course.modules:[]).filter(item=>item&&item.status==='Publicado');
  }

  function ensureBar(){
    if(!mobile()){
      document.body.classList.remove('cafasso-course-mobile-native');
      document.getElementById('cafassoCourseMobileBar')?.remove();
      bar=null;
      return null;
    }
    document.body.classList.add('cafasso-course-mobile-native');
    bar=document.getElementById('cafassoCourseMobileBar');
    if(bar)return bar;
    bar=document.createElement('header');
    bar.id='cafassoCourseMobileBar';
    bar.className='cafasso-course-mobile-bar';
    bar.innerHTML=`
      <button type="button" class="cafasso-course-mobile-bar__back" aria-label="Volver a Escuela">‹</button>
      <div class="cafasso-course-mobile-bar__copy">
        <span class="cafasso-course-mobile-bar__course">CAFASSO · Escuela</span>
        <strong class="cafasso-course-mobile-bar__module">Curso</strong>
      </div>
      <span class="cafasso-course-mobile-bar__step" aria-hidden="true">—</span>
    `;
    bar.querySelector('.cafasso-course-mobile-bar__back').addEventListener('click',()=>{
      if(typeof window.CafassoNavigate==='function')window.CafassoNavigate('inicio');
      else history.back();
    });
    document.body.appendChild(bar);
    return bar;
  }

  function syncBar(){
    const node=ensureBar();
    if(!node)return;
    const state=currentState();
    const course=state?.course||null;
    const module=state?.module||null;
    const modules=publishedModules(course);
    const index=modules.findIndex(item=>String(item?._id||item?.id||'')===String(module?._id||module?.id||''));
    node.querySelector('.cafasso-course-mobile-bar__course').textContent=course?.title||'CAFASSO · Escuela';
    node.querySelector('.cafasso-course-mobile-bar__module').textContent=module?.title||'Curso';
    const mission=missionNodes();
    const missionMode=document.body.classList.contains('cafasso-mission-mode')&&mission.active>=0&&mission.nodes.length;
    node.querySelector('.cafasso-course-mobile-bar__step').textContent=missionMode?String(mission.active+1)+'/'+String(mission.nodes.length):(index>=0&&modules.length?String(index+1)+'/'+String(modules.length):'—');
    node.querySelector('.cafasso-course-mobile-bar__back').setAttribute('aria-label',missionMode?'Volver al recorrido':'Volver a Escuela');
  }

  function syncKeyboard(){
    if(!mobile())return;
    const vv=window.visualViewport;
    const layout=Math.max(window.innerHeight||0,document.documentElement.clientHeight||0);
    const open=Boolean(vv&&layout>0&&vv.height<layout*.78);
    document.body.classList.toggle('cafasso-course-keyboard-open',open);
  }

  function sync(){
    cancelAnimationFrame(raf);
    raf=requestAnimationFrame(()=>{
      installStyles();
      syncBar();
      ensureMissionDock();
      syncKeyboard();
    });
  }

  window.addEventListener('cafasso:course-experience-ready',sync);
  window.addEventListener('cafasso:module-completed',sync);
  window.addEventListener('cafasso:block-completed',()=>setTimeout(sync,90));
  window.addEventListener('resize',sync,{passive:true});
  window.addEventListener('orientationchange',sync,{passive:true});
  window.visualViewport?.addEventListener('resize',syncKeyboard,{passive:true});
  window.visualViewport?.addEventListener('scroll',syncKeyboard,{passive:true});
  window.addEventListener('pageshow',sync);

  function installMissionObserver(){
    if(missionObserver)return;
    const host=document.getElementById('main')||document.getElementById('app');
    if(!host){setTimeout(installMissionObserver,120);return;}
    missionObserver=new MutationObserver(()=>sync());
    missionObserver.observe(host,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{sync();installMissionObserver();},{once:true});
  else {sync();installMissionObserver();}
})();