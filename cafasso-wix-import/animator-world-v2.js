(() => {
  if (window.__cafassoAnimatorWorldV2) return;
  window.__cafassoAnimatorWorldV2 = true;

  const KEY = 'cafassoWorldPrologueV2';
  const css = `
    .cafasso-world-v2{min-height:calc(100vh - 32px);padding:clamp(24px,5vw,72px);display:flex;align-items:center;justify-content:center;color:#f8f1e5;background:linear-gradient(135deg,rgba(15,45,55,.96),rgba(32,76,67,.88)),url('https://static.wixstatic.com/media/47bf07_fdaf845ac90049d89227e663e627cd4e~mv2.jpg') center/cover;border-radius:28px;overflow:hidden;position:relative}
    .cafasso-world-v2:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 20% 15%,rgba(239,193,91,.28),transparent 28%),linear-gradient(90deg,rgba(10,30,38,.35),transparent 60%);pointer-events:none}
    .cafasso-world-v2__inner{width:min(980px,100%);position:relative;z-index:1}
    .cafasso-world-v2__eyebrow{letter-spacing:.18em;text-transform:uppercase;color:#f0c867;font-size:12px;font-weight:800;margin-bottom:14px}
    .cafasso-world-v2 h1{font-family:Georgia,serif;font-size:clamp(38px,7vw,76px);line-height:.98;max-width:680px;margin:0 0 20px;color:#fff8e9}
    .cafasso-world-v2 h2{font-family:Georgia,serif;font-size:clamp(30px,5vw,52px);margin:0 0 14px;color:#fff8e9}
    .cafasso-world-v2 p{font-size:clamp(16px,2vw,20px);line-height:1.6;max-width:650px;color:rgba(255,248,233,.84);margin:0 0 28px}
    .cafasso-world-v2__actions{display:flex;gap:12px;flex-wrap:wrap}
    .cafasso-world-v2 button{font:inherit;border:0;cursor:pointer}
    .cafasso-world-v2__primary{background:#efc35d;color:#17363a;padding:14px 22px;border-radius:999px;font-weight:850;box-shadow:0 10px 28px rgba(0,0,0,.2)}
    .cafasso-world-v2__secondary{background:rgba(255,255,255,.1);color:#fff8e9;padding:14px 22px;border:1px solid rgba(255,255,255,.25)!important;border-radius:999px;font-weight:750}
    .cafasso-world-v2__zones{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:30px 0}
    .cafasso-world-v2__zone{min-height:146px;text-align:left;padding:18px;border-radius:20px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18)!important;color:#fff8e9;transition:transform .16s,background .16s}
    .cafasso-world-v2__zone:not([disabled]):hover{transform:translateY(-4px);background:rgba(255,255,255,.17)}
    .cafasso-world-v2__zone[disabled]{opacity:.48;cursor:not-allowed}
    .cafasso-world-v2__zone b{display:block;font-family:Georgia,serif;font-size:23px;margin:12px 0 7px}
    .cafasso-world-v2__zone span{font-size:13px;line-height:1.35;color:rgba(255,248,233,.75)}
    .cafasso-world-v2__symbol{font-size:25px}
    .cafasso-world-v2__back{background:transparent;color:#f0c867;padding:0;margin-bottom:26px;font-weight:800}
    .cafasso-world-v2__note{border-left:3px solid #efc35d;padding:12px 16px;margin:22px 0 28px;background:rgba(0,0,0,.14);max-width:660px}
    @media(max-width:760px){.cafasso-world-v2{padding:28px 20px;border-radius:18px;min-height:calc(100vh - 18px)}.cafasso-world-v2__zones{grid-template-columns:repeat(2,minmax(0,1fr))}.cafasso-world-v2__zone{min-height:125px;padding:14px}.cafasso-world-v2__zone b{font-size:19px}}
  `;

  function injectStyle(){
    if(document.getElementById('cafasso-world-v2-style')) return;
    const s=document.createElement('style');s.id='cafasso-world-v2-style';s.textContent=css;document.head.appendChild(s);
  }

  function seen(){
    try{return localStorage.getItem(KEY)==='1';}catch(e){return false;}
  }
  function markSeen(){
    try{localStorage.setItem(KEY,'1');}catch(e){}
  }

  function arrival(){
    return `<div class="cafasso-world-v2__inner">
      <div class="cafasso-world-v2__eyebrow">Mundo CAFASSO</div>
      <h1>Un lugar para aprender, encontrarse y acompañar.</h1>
      <p>Tu recorrido como animador comienza acá. No entrás solamente a un curso: entrás a una historia que se construye caminando con otros.</p>
      <div class="cafasso-world-v2__actions">
        <button class="cafasso-world-v2__primary" data-world-action="house">Llegar a la Casa →</button>
        <button class="cafasso-world-v2__secondary" data-world-action="skip">Explorar el mundo</button>
      </div>
    </div>`;
  }

  function house(){
    return `<div class="cafasso-world-v2__inner">
      <button class="cafasso-world-v2__back" data-world-action="arrival">← Volver a la llegada</button>
      <div class="cafasso-world-v2__eyebrow">Tu punto de partida</div>
      <h2>La Casa</h2>
      <p>Este es tu lugar de identidad y descanso. Desde acá vas a poder mirar tu recorrido, encontrarte con otros espacios y descubrir nuevas misiones.</p>
      <div class="cafasso-world-v2__zones">
        <button class="cafasso-world-v2__zone" data-world-action="patio"><span class="cafasso-world-v2__symbol">☀</span><b>Patio</b><span>El lugar del encuentro y la primera misión.</span></button>
        <button class="cafasso-world-v2__zone" disabled><span class="cafasso-world-v2__symbol">⌂</span><b>Casa</b><span>Tu identidad, tus almitas y tu progreso.</span></button>
        <button class="cafasso-world-v2__zone" disabled><span class="cafasso-world-v2__symbol">▤</span><b>Escuela</b><span>Se habilita al comenzar el recorrido.</span></button>
        <button class="cafasso-world-v2__zone" disabled><span class="cafasso-world-v2__symbol">✦</span><b>Parroquia</b><span>Un espacio para la interioridad y la Palabra.</span></button>
      </div>
    </div>`;
  }

  function patio(){
    return `<div class="cafasso-world-v2__inner">
      <button class="cafasso-world-v2__back" data-world-action="house">← Volver a la Casa</button>
      <div class="cafasso-world-v2__eyebrow">Primera estación</div>
      <h2>Entrá al Patio</h2>
      <p>Acá comienza el encuentro. Antes de estudiar la vida de Don Bosco, vamos a aprender a mirar como él: atentos a las personas, a sus historias y a las preguntas que traen.</p>
      <div class="cafasso-world-v2__note">Tu primera misión será conocer a Juanito y descubrir qué pregunta puede acompañar tu propio camino.</div>
      <div class="cafasso-world-v2__actions">
        <button class="cafasso-world-v2__primary" data-world-action="courses">Ir al recorrido →</button>
      </div>
    </div>`;
  }

  function mount(screen){
    const main=document.getElementById('main');
    if(!main) return false;
    injectStyle();
    let root=main.querySelector('.cafasso-world-v2');
    if(!root){main.innerHTML='<section class="cafasso-world-v2" aria-label="Mundo CAFASSO"></section>';root=main.querySelector('.cafasso-world-v2');}
    root.innerHTML=screen==='arrival'?arrival():screen==='patio'?patio():house();
    root.querySelectorAll('[data-world-action]').forEach(btn=>btn.addEventListener('click',()=>{
      const a=btn.dataset.worldAction;
      if(a==='arrival') mount('arrival');
      else if(a==='house'){markSeen();mount('house');}
      else if(a==='skip'){markSeen();mount('house');}
      else if(a==='patio') mount('patio');
      else if(a==='courses'&&typeof window.CafassoNavigate==='function') window.CafassoNavigate('cursos');
    }));
    return true;
  }

  function sync(){
    if((location.hash||'#inicio')!=='#inicio') return;
    const main=document.getElementById('main');
    if(!main) return;
    mount(seen()?'house':'arrival');
  }

  function boot(){
    if(!document.getElementById('main')) return setTimeout(boot,250);
    sync();
    const observer=new MutationObserver(()=>{if((location.hash||'#inicio')==='#inicio'&&!document.querySelector('.cafasso-world-v2'))sync();});
    observer.observe(document.getElementById('main'),{childList:true});
    window.addEventListener('hashchange',sync);
    window.addEventListener('popstate',()=>setTimeout(sync,30));
  }

  boot();
})();