(() => {
  if (window.__cafassoAnimatorWorldV2) return;
  window.__cafassoAnimatorWorldV2 = true;

  const KEY='cafassoWorldPrologueV3';
  const css=`
    body.cafasso-world-active{background:#0e3035!important}
    body.cafasso-world-active #cafassoDailyWord,
    body.cafasso-world-active .cafasso-daily-word,
    body.cafasso-world-active .cafasso-drive-preview{display:none!important}
    body.cafasso-world-active .side,
    body.cafasso-world-active .mobile-head,
    body.cafasso-world-active .mobilebar,
    body.cafasso-world-active .mobile-nav{display:none!important}
    body.cafasso-world-active .shell{display:block!important;min-height:100vh}
    body.cafasso-world-active main{width:100%!important;max-width:none!important;padding:0!important}
    .cafasso-world-v2{min-height:100vh;position:relative;overflow:hidden;color:#fff6e5;background:linear-gradient(90deg,rgba(8,31,35,.46),rgba(8,31,35,.06) 58%,rgba(8,31,35,.18)),url('./assets/cafasso-casa-interior-v2.jpg') center/cover no-repeat;isolation:isolate}
    .cafasso-world-v2--house,.cafasso-world-v2--patio{background:linear-gradient(90deg,rgba(8,31,35,.62),rgba(8,31,35,.08) 58%,rgba(8,31,35,.2)),url('https://static.wixstatic.com/media/47bf07_2465a68b3ac64824b43bc20531ce6fd4~mv2.png') center/cover no-repeat}
    .cafasso-world-v2:before{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(9,32,37,.04),rgba(9,32,37,.18) 55%,rgba(9,32,37,.58));pointer-events:none}
    .cafasso-world-v2:after{content:"";position:absolute;inset:0;z-index:-1;background:radial-gradient(circle at 50% 52%,transparent 0 26%,rgba(8,30,35,.16) 72%,rgba(8,30,35,.45) 100%);pointer-events:none}
    .cafasso-world-v2__mist{position:absolute;inset:35% -10% auto;height:28%;z-index:-1;background:linear-gradient(180deg,transparent,rgba(228,220,171,.16),transparent);filter:blur(18px)}
    .cafasso-world-v2__content{position:relative;z-index:2;min-height:100vh;padding:clamp(28px,5vw,68px);display:flex;align-items:flex-end}
    .cafasso-world-v2__intro{max-width:600px;padding:26px 30px 28px;border-left:3px solid #f0c665;background:linear-gradient(90deg,rgba(10,35,38,.72),rgba(10,35,38,.18),transparent);text-shadow:0 2px 14px rgba(0,0,0,.45)}
    .cafasso-world-v2__eyebrow{font-size:11px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;color:#f0c665;margin-bottom:13px}
    .cafasso-world-v2 h1,.cafasso-world-v2 h2{font-family:Georgia,serif;color:#fff8e9;font-weight:500;line-height:1;margin:0 0 18px}
    .cafasso-world-v2 h1{font-size:clamp(42px,7vw,84px);max-width:650px}
    .cafasso-world-v2 h2{font-size:clamp(38px,6vw,70px)}
    .cafasso-world-v2 p{font-size:clamp(16px,2vw,20px);line-height:1.55;color:rgba(255,248,233,.86);margin:0 0 25px;max-width:580px}
    .cafasso-world-v2__actions{display:flex;gap:12px;flex-wrap:wrap}
    .cafasso-world-v2 button{font:inherit;cursor:pointer}
    .cafasso-world-v2__primary{border:0;border-radius:999px;background:#efc35d;color:#17363a;padding:13px 21px;font-weight:900;box-shadow:0 8px 24px rgba(0,0,0,.2)}
    .cafasso-world-v2__ghost{border:1px solid rgba(255,248,233,.38);border-radius:999px;background:rgba(10,35,38,.18);color:#fff8e9;padding:13px 20px;font-weight:750}
    .cafasso-world-v2__map{position:absolute;inset:0;min-height:100vh}
    .world-v2__path{display:none}
    .world-v2__location{position:absolute;border:0;background:transparent;color:#fff8e9;text-align:center;text-shadow:0 2px 8px #142f2e;filter:drop-shadow(0 8px 10px rgba(0,0,0,.22));padding:10px 14px;border-radius:14px}
    .world-v2__location:before{content:"";display:block;width:13px;height:13px;margin:0 auto 9px;border-radius:50%;background:#efc35d;box-shadow:0 0 0 5px rgba(239,195,93,.18),0 4px 14px rgba(0,0,0,.35)}.world-v2__location:hover{transform:translateY(-5px);transition:.18s;background:rgba(14,48,53,.42);backdrop-filter:blur(5px)}
    .world-v2__location strong{display:block;font-family:Georgia,serif;font-size:24px;font-weight:500}
    .world-v2__location small{display:block;margin-top:5px;font-size:12px;color:#fff5d3}
    .world-v2__building{display:none}
    
    
    .world-v2__house{left:18%;top:42%}
    .world-v2__patio{left:52%;top:46%}
    .world-v2__patio .world-v2__building{display:none}
    
    
    .world-v2__school{right:13%;top:29%}
    .world-v2__parish{right:35%;top:12%}
    .world-v2__parish .world-v2__building{display:none}
    
    
    .world-v2__locked{opacity:.55;pointer-events:none}
    .world-v2__topbar{position:absolute;z-index:3;top:26px;left:clamp(24px,5vw,68px);right:clamp(24px,5vw,68px);display:flex;justify-content:space-between;align-items:center}
    .world-v2__back{border:0;background:transparent;color:#f0c665;font-weight:850;padding:7px 0}
    .world-v2__label{font-size:12px;letter-spacing:.13em;text-transform:uppercase;color:rgba(255,248,233,.7)}
    .world-v2__mission{position:absolute;z-index:3;right:clamp(24px,5vw,68px);bottom:clamp(28px,6vw,75px);max-width:320px;padding:18px 20px;border:1px solid rgba(255,248,233,.28);border-radius:18px;background:rgba(14,48,53,.72);backdrop-filter:blur(8px)}
    .world-v2__mission b{display:block;color:#f0c665;margin-bottom:7px}
    .world-v2__mission p{font-size:14px;line-height:1.45;margin:0 0 14px;color:rgba(255,248,233,.84)}
    @media(max-width:760px){.cafasso-world-v2__content{padding:24px 20px 34px;align-items:flex-end}.cafasso-world-v2__intro{padding:20px 18px}.world-v2__house{left:7%;top:39%;transform:scale(.72)}.world-v2__patio{left:47%;top:45%;transform:scale(.72)}.world-v2__school{right:-6%;top:29%;transform:scale(.65)}.world-v2__parish{right:23%;top:12%;transform:scale(.55)}.world-v2__mission{left:20px;right:20px;bottom:24px;max-width:none}}
  `;

  function style(){if(document.getElementById('cafasso-world-v2-style'))return;const s=document.createElement('style');s.id='cafasso-world-v2-style';s.textContent=css;document.head.appendChild(s);}
  function seen(){try{return localStorage.getItem(KEY)==='1';}catch(e){return false;}}
  function mark(){try{localStorage.setItem(KEY,'1');}catch(e){}}
  function shell(kind){
    const intro=kind==='arrival'
      ? '<div class="cafasso-world-v2__content"><div class="cafasso-world-v2__intro"><div class="cafasso-world-v2__eyebrow">Mundo CAFASSO</div><h1>Un lugar para aprender, encontrarse y acompañar.</h1><p>Tu recorrido como animador comienza acá. No entrás solamente a un curso: entrás a una historia que se construye caminando con otros.</p><div class="cafasso-world-v2__actions"><button class="cafasso-world-v2__primary" data-world="house">Llegar a la Casa →</button><button class="cafasso-world-v2__ghost" data-world="house">Explorar el mundo</button></div></div></div>'
      : kind==='patio'
      ? '<div class="world-v2__topbar"><button class="world-v2__back" data-world="house">← Volver a la Casa</button><span class="world-v2__label">Primera estación · Patio</span></div><div class="cafasso-world-v2__content"><div class="cafasso-world-v2__intro"><div class="cafasso-world-v2__eyebrow">Primera misión</div><h2>Entrá al Patio</h2><p>Acá comienza el encuentro. Antes de estudiar la vida de Don Bosco, vamos a aprender a mirar como él: atentos a las personas, sus historias y sus preguntas.</p><div class="cafasso-world-v2__actions"><button class="cafasso-world-v2__primary" data-world="courses">Iniciar el recorrido →</button></div></div></div>'
      : '<div class="world-v2__topbar"><button class="world-v2__back" data-world="arrival">← Volver a la llegada</button><span class="world-v2__label">Tu punto de partida · Casa</span></div><div class="cafasso-world-v2__map"><div class="cafasso-world-v2__mist"></div><div class="world-v2__path"></div><button class="world-v2__location world-v2__house" data-world="house"><span class="world-v2__building"></span><strong>Casa</strong><small>Tu identidad y tu camino</small></button><button class="world-v2__location world-v2__patio" data-world="patio"><span class="world-v2__building"></span><strong>Patio</strong><small>Primera misión disponible</small></button><div class="world-v2__location world-v2__school world-v2__locked"><span class="world-v2__building"></span><strong>Escuela</strong><small>Se abre al avanzar</small></div><div class="world-v2__location world-v2__parish world-v2__locked"><span class="world-v2__building"></span><strong>Parroquia</strong><small>Más adelante</small></div><div class="world-v2__mission"><b>Estás en la Casa</b><p>Desde acá comienza tu recorrido. El Patio está listo para recibirte.</p><button class="cafasso-world-v2__primary" data-world="patio">Explorar el Patio</button></div></div>';
    return '<section class="cafasso-world-v2 cafasso-world-v2--'+kind+'" aria-label="Mundo CAFASSO"><div class="cafasso-world-v2__map"></div>'+intro+'</section>';
  }
  function mount(kind){
    const main=document.getElementById('main');if(!main)return false;
    style();document.body.classList.add('cafasso-world-active');main.innerHTML=shell(kind);
    main.querySelectorAll('[data-world]').forEach(b=>b.addEventListener('click',()=>{const a=b.dataset.world;if(a==='house'){mark();mount('house');}else if(a==='arrival')mount('arrival');else if(a==='patio')mount('patio');else if(a==='courses'&&typeof window.CafassoNavigate==='function')window.CafassoNavigate('cursos');}));
    return true;
  }
  function sync(){
    if((location.hash||'#inicio')!=='#inicio'){document.body.classList.remove('cafasso-world-active');return;}
    const main=document.getElementById('main');if(!main)return;
    mount(seen()?'house':'arrival');
  }
  function boot(){
    if(!document.getElementById('main'))return setTimeout(boot,250);
    sync();
    const observer=new MutationObserver(()=>{if((location.hash||'#inicio')==='#inicio'&&!document.querySelector('.cafasso-world-v2'))sync();});
    observer.observe(document.getElementById('main'),{childList:true});
    window.addEventListener('hashchange',sync);window.addEventListener('popstate',()=>setTimeout(sync,30));
  }
  boot();
})();