(()=>{
  if(window.__cafassoCourseMobileNativeInstalled)return;
  window.__cafassoCourseMobileNativeInstalled=true;
  if((location.pathname.split('/').pop()||'').toLowerCase()!=='course-player.html')return;

  const MOBILE='(max-width:820px), (pointer:coarse)';
  const root=document.documentElement;
  let bar=null;
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
        }

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

        html[data-cafasso-player="1"] body.cafasso-course-keyboard-open .linear-module-nav--bottom{
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
    node.querySelector('.cafasso-course-mobile-bar__step').textContent=index>=0&&modules.length?String(index+1)+'/'+String(modules.length):'—';
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
      syncKeyboard();
    });
  }

  window.addEventListener('cafasso:course-experience-ready',sync);
  window.addEventListener('cafasso:module-completed',sync);
  window.addEventListener('resize',sync,{passive:true});
  window.addEventListener('orientationchange',sync,{passive:true});
  window.visualViewport?.addEventListener('resize',syncKeyboard,{passive:true});
  window.visualViewport?.addEventListener('scroll',syncKeyboard,{passive:true});
  window.addEventListener('pageshow',sync);

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});
  else sync();
})();