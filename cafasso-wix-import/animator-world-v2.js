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
    .cafasso-world-v2--arrival .cafasso-world-v2__content{justify-content:flex-end;align-items:flex-end}
    .world-v2__arrival-note{position:relative;max-width:270px;margin:0 0 18px;padding:14px 17px;border-left:2px solid #efc35d;background:linear-gradient(90deg,rgba(12,39,42,.68),rgba(12,39,42,.12));text-shadow:0 2px 10px rgba(0,0,0,.5)}
    .world-v2__arrival-note b{display:block;font-family:Georgia,serif;font-size:23px;font-weight:500;color:#fff8e9;margin-bottom:5px}
    .world-v2__arrival-note span{display:block;font-size:13px;line-height:1.45;color:rgba(255,248,233,.78)}
    .world-v2__arrival-hotspot{position:absolute;left:calc(66% - 114px);top:calc(40% - 113px);border:0;background:transparent;color:#fff8e9;text-shadow:0 2px 9px #142f2e;opacity:.92}
    .world-v2__arrival-hotspot:before{content:"";display:block;width:18px;height:18px;margin:auto;border-radius:50%;background:#efc35d;box-shadow:0 0 0 7px rgba(239,195,93,.2),0 4px 14px rgba(0,0,0,.4)}
    .world-v2__arrival-hotspot span{display:block;margin-top:10px;font-size:12px;letter-spacing:.08em;text-transform:uppercase}
    .world-v2__arrival-hotspot:hover{transform:scale(1.05)}
    .world-v2__resource-hotspot{position:absolute;left:calc(74% + 113px);top:calc(56% - 189px);border:0;background:rgba(21,39,38,.66);color:#fff8e9;padding:9px 15px;border-radius:5px 12px 12px 5px;border-left:4px solid #b7895c;box-shadow:0 5px 14px rgba(0,0,0,.3);font-family:Georgia,serif;font-size:17px;text-shadow:0 1px 4px #142f2e}
    .world-v2__resource-hotspot:before{content:"";position:absolute;left:-9px;top:8px;bottom:8px;width:5px;background:#efc35d;border-radius:3px;opacity:.65}
    .world-v2__resource-hotspot:hover{transform:translateY(-3px);background:rgba(21,39,38,.82)}

  `;

  function style(){if(document.getElementById('cafasso-world-v2-style'))return;const s=document.createElement('style');s.id='cafasso-world-v2-style';s.textContent=css;document.head.appendChild(s);}
  function seen(){try{return localStorage.getItem(KEY)==='1';}catch(e){return false;}}
  function mark(){try{localStorage.setItem(KEY,'1');}catch(e){}}
  function shell(kind){
    const intro=kind==='arrival'
      ? '<div class="cafasso-world-v2__content"><div class="world-v2__arrival-note"><b>Estás en Casa</b><span>Tu recorrido comienza en este lugar. Mirá alrededor y seguí el camino cuando estés listo.</span></div></div><button class="world-v2__arrival-hotspot" data-world="house" aria-label="Explorar el mundo"><span>Explorar</span></button><button class="world-v2__resource-hotspot" data-world="resources" aria-label="Abrir recursos">Recursos</button><div class="world-v2__scene-message" aria-live="polite"></div>'
      : kind==='patio'
      ? '<div class="world-v2__topbar"><button class="world-v2__back" data-world="house">← Volver a la Casa</button><span class="world-v2__label">Primera estación · Patio</span></div><div class="cafasso-world-v2__content"><div class="cafasso-world-v2__intro"><div class="cafasso-world-v2__eyebrow">Primera misión</div><h2>Entrá al Patio</h2><p>Acá comienza el encuentro. Antes de estudiar la vida de Don Bosco, vamos a aprender a mirar como él: atentos a las personas, sus historias y sus preguntas.</p><div class="cafasso-world-v2__actions"><button class="cafasso-world-v2__primary" data-world="courses">Iniciar el recorrido →</button></div></div></div>'
      : '<div class="world-v2__topbar"><button class="world-v2__back" data-world="arrival">← Volver a la llegada</button><span class="world-v2__label">Tu punto de partida · Casa</span></div><div class="cafasso-world-v2__map"><div class="cafasso-world-v2__mist"></div><div class="world-v2__path"></div><button class="world-v2__location world-v2__house" data-world="house"><span class="world-v2__building"></span><strong>Casa</strong><small>Tu identidad y tu camino</small></button><button class="world-v2__location world-v2__patio" data-world="patio"><span class="world-v2__building"></span><strong>Patio</strong><small>Primera misión disponible</small></button><div class="world-v2__location world-v2__school world-v2__locked"><span class="world-v2__building"></span><strong>Escuela</strong><small>Se abre al avanzar</small></div><div class="world-v2__location world-v2__parish world-v2__locked"><span class="world-v2__building"></span><strong>Parroquia</strong><small>Más adelante</small></div><div class="world-v2__mission"><b>Estás en la Casa</b><p>Desde acá comienza tu recorrido. El Patio está listo para recibirte.</p><button class="cafasso-world-v2__primary" data-world="patio">Explorar el Patio</button></div></div>';
    return '<section class="cafasso-world-v2 cafasso-world-v2--'+kind+'" aria-label="Mundo CAFASSO"><div class="cafasso-world-v2__map"></div>'+intro+'</section>';
  }
  function mount(kind){
    const main=document.getElementById('main');if(!main)return false;
    style();document.body.classList.add('cafasso-world-active');main.innerHTML=shell(kind);
    main.querySelectorAll('[data-world]').forEach(b=>b.addEventListener('click',()=>{const a=b.dataset.world;if(a==='house'){mark();mount('house');}else if(a==='arrival')mount('arrival');else if(a==='patio')mount('patio');else if(a==='courses'&&typeof window.CafassoNavigate==='function')window.CafassoNavigate('cursos');
      else if(a==='resources'||a==='journal'){const msg=main.querySelector('.world-v2__scene-message');if(msg){msg.textContent=a==='resources'?'Los recursos van a reunirse aquí.':'Tu bitácora empieza en esta mesa.';msg.classList.add('show');setTimeout(()=>msg.classList.remove('show'),2400);}}}));
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