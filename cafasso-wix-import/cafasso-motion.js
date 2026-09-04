(()=>{
  if(window.__cafassoMotionInstalled)return;
  window.__cafassoMotionInstalled=true;

  const STYLE_ID='cafassoMotionStyles';
  const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function installStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      :root{--cafasso-ease:cubic-bezier(.2,.7,.25,1)}
      .card,.stat,.panel,.box,.group-card,.course-card,.module-card,.submission-card,.animator-card,.report-card,.cafasso-daily-word{transition:transform .18s var(--cafasso-ease),box-shadow .18s var(--cafasso-ease),border-color .18s var(--cafasso-ease),background-color .18s var(--cafasso-ease)}
      @media (hover:hover) and (pointer:fine){
        .card:hover,.group-card:hover,.course-card:hover,.module-card:hover,.submission-card:hover,.animator-card:hover,.report-card:hover{transform:translateY(-3px);box-shadow:0 10px 26px rgba(15,45,77,.09);border-color:#DDCFBB}
        .stat:hover{transform:translateY(-2px);box-shadow:0 7px 18px rgba(15,45,77,.06)}
      }
      button,.btn,a.btn,.nav button,.mobile-nav button{transition:transform .12s ease,filter .16s ease,background-color .16s ease,border-color .16s ease,box-shadow .16s ease}
      button:active,.btn:active,a.btn:active{transform:translateY(1px) scale(.99)}
      @media (hover:hover) and (pointer:fine){.btn:hover,button:hover{filter:brightness(.985)}}

      .cafasso-motion-enter{opacity:0;transform:translateY(7px)}
      .cafasso-motion-enter.cafasso-motion-visible{opacity:1;transform:none;transition:opacity .28s var(--cafasso-ease),transform .28s var(--cafasso-ease)}
      .cafasso-motion-enter.cafasso-motion-visible:nth-child(2){transition-delay:.025s}.cafasso-motion-enter.cafasso-motion-visible:nth-child(3){transition-delay:.05s}

      .bar span,.mini span,[class*="progress"] span{transform-origin:left center}
      .cafasso-progress-animate{animation:cafassoProgressIn .48s var(--cafasso-ease) both}
      @keyframes cafassoProgressIn{from{transform:scaleX(.06);opacity:.65}to{transform:scaleX(1);opacity:1}}

      .hero{position:relative;overflow:hidden}
      .hero:after{content:"";position:absolute;width:180px;height:180px;border-radius:50%;right:-72px;top:-82px;background:rgba(242,201,76,.055);pointer-events:none}
      .hero>*{position:relative;z-index:1}

      .brand img,.mobile-brand img{transform-origin:center bottom}
      .cafasso-brand-arrive{animation:cafassoBrandArrive .5s var(--cafasso-ease) both}
      @keyframes cafassoBrandArrive{0%{opacity:.78;transform:translateX(-4px) rotate(-1deg)}100%{opacity:1;transform:none}}

      .section h3,.head h1,.top h1{position:relative}
      .section h3:after{content:"";display:block;width:30px;height:2px;border-radius:99px;background:#F2C94C;margin-top:7px;opacity:.9}

      @media(max-width:680px){
        .cafasso-motion-enter{transform:translateY(5px)}
        .card:hover,.stat:hover,.group-card:hover,.course-card:hover,.module-card:hover,.submission-card:hover,.animator-card:hover,.report-card:hover{transform:none;box-shadow:inherit}
        .hero:after{width:130px;height:130px;right:-55px;top:-58px}
      }
      @media(prefers-reduced-motion:reduce){
        *,*:before,*:after{scroll-behavior:auto!important;animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}
        .cafasso-motion-enter{opacity:1!important;transform:none!important}
      }
    `;
    document.head.appendChild(style);
  }

  const seen=new WeakSet();
  let observer=null;
  function prepareObserver(){
    if(reduce||!('IntersectionObserver' in window))return;
    observer=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(!entry.isIntersecting)continue;
        entry.target.classList.add('cafasso-motion-visible');
        observer.unobserve(entry.target);
      }
    },{rootMargin:'0px 0px -18px 0px',threshold:.035});
  }

  function enhance(root=document){
    const selector='.card,.stat,.panel,.group-card,.course-card,.module-card,.submission-card,.animator-card,.report-card,.cafasso-daily-word';
    root.querySelectorAll?.(selector).forEach(el=>{
      if(seen.has(el))return;
      seen.add(el);
      if(reduce||!observer)return;
      el.classList.add('cafasso-motion-enter');
      observer.observe(el);
    });

    root.querySelectorAll?.('.bar span,.mini span').forEach(el=>{
      if(el.dataset.cafassoProgressAnimated)return;
      el.dataset.cafassoProgressAnimated='1';
      if(!reduce)el.classList.add('cafasso-progress-animate');
    });
  }

  function brand(){
    if(reduce)return;
    document.querySelectorAll('.brand img,.mobile-brand img').forEach(img=>{
      if(img.dataset.cafassoBrandMotion)return;
      img.dataset.cafassoBrandMotion='1';
      img.classList.add('cafasso-brand-arrive');
    });
  }

  function installAnimatorHome(){
    const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
    if(page!=='index.html'||document.getElementById('cafassoAnimatorHomeLoader'))return;
    const role=String(document.documentElement.dataset.cafassoRole||'').toLowerCase();
    const preview=String(document.documentElement.dataset.cafassoPreviewRole||'').toLowerCase();
    if(role!=='animador'&&preview!=='animador')return;
    const s=document.createElement('script');
    s.id='cafassoAnimatorHomeLoader';
    s.src='./animator-home.js?v=20260904-2';
    s.defer=true;
    document.head.appendChild(s);
  }

  function boot(){
    installStyles();
    prepareObserver();
    enhance(document);
    brand();
    installAnimatorHome();
    const mo=new MutationObserver(mutations=>{
      for(const m of mutations){
        for(const node of m.addedNodes){if(node&&node.nodeType===1){enhance(node);brand();}}
      }
    });
    mo.observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
