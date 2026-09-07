(()=>{
  if(window.__cafassoAnimatorHomeV2Installed)return;
  window.__cafassoAnimatorHomeV2Installed=true;

  const root=document.documentElement;
  const realRole=String(root.dataset.cafassoRole||'').toLowerCase();
  const previewRole=String(root.dataset.cafassoPreviewRole||'').toLowerCase();
  const isAnimator=realRole==='animador'||previewRole==='animador';
  const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  if(page!=='index.html'||!isAnimator)return;

  const STYLE_ID='cafassoAnimatorHomeV2Styles';
  let timer=null;

  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
  function isHome(){return (location.hash||'#inicio').replace(/^#/,'')==='inicio';}

  function styles(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      html[data-cafasso-home-v2="1"]{--home-bg:#F1ECE3;--home-paper:#FAF7F0;--home-card:#FCFAF5;--home-navy:#173954;--home-navy-dark:#102B44;--home-gold:#C89B31;--home-ink:#17324A;--home-muted:#77746E;--home-line:rgba(23,50,74,.09)}
      html[data-cafasso-home-v2="1"] body{background:var(--home-bg)!important;color:var(--home-ink)!important}
      html[data-cafasso-home-v2="1"] .shell{grid-template-columns:218px minmax(0,1fr)!important}
      html[data-cafasso-home-v2="1"] .side{background:linear-gradient(180deg,var(--home-navy),var(--home-navy-dark))!important;padding:30px 17px!important;border-radius:0 24px 24px 0!important;box-shadow:10px 0 34px rgba(16,43,68,.08)!important}
      html[data-cafasso-home-v2="1"] .brand{padding:0 8px!important;align-items:flex-start!important}
      html[data-cafasso-home-v2="1"] .brand img{width:38px!important;height:45px!important}
      html[data-cafasso-home-v2="1"] .brand b{font:700 23px/1 Georgia,serif!important;letter-spacing:-.02em!important}
      html[data-cafasso-home-v2="1"] .brand small{font:700 8px/1.5 Inter,system-ui!important;letter-spacing:.13em!important;text-transform:uppercase!important;opacity:.62!important;max-width:120px!important}
      html[data-cafasso-home-v2="1"] .nav{margin-top:48px!important;gap:7px!important}
      html[data-cafasso-home-v2="1"] .nav button{padding:13px 14px!important;border-radius:12px!important;font-size:13px!important;color:rgba(255,255,255,.72)!important}
      html[data-cafasso-home-v2="1"] .nav button.active{background:rgba(255,255,255,.105)!important;color:#fff!important;box-shadow:inset 2px 0 0 var(--home-gold)!important}
      html[data-cafasso-home-v2="1"] .nav button[data-view="certificados"]{display:none!important}
      html[data-cafasso-home-v2="1"] .foot{left:24px!important;right:20px!important;bottom:24px!important;gap:8px!important}
      html[data-cafasso-home-v2="1"] .motto{padding-top:20px!important;border-top:1px solid rgba(255,255,255,.14)!important;color:#EFDDAE!important;font:italic 14px/1.5 Georgia,serif!important;margin-bottom:10px!important}
      html[data-cafasso-home-v2="1"] .foot button,html[data-cafasso-home-v2="1"] .foot a{padding:8px 3px!important;font-size:12px!important;color:rgba(255,255,255,.68)!important}
      html[data-cafasso-home-v2="1"] main{max-width:1420px!important;padding:46px 44px 52px!important;margin:0 auto!important}

      .cafasso-home-v2{max-width:1180px;margin:0 auto}
      .cafasso-home-head{display:flex;justify-content:space-between;align-items:flex-start;gap:30px;margin-bottom:30px}
      .cafasso-home-kicker{font:800 10px/1.2 Inter,system-ui;letter-spacing:.16em;text-transform:uppercase;color:#A37C27;margin-bottom:9px}
      .cafasso-home-title{font:400 48px/1.02 Georgia,serif;letter-spacing:-.035em;color:var(--home-navy);margin:0}
      .cafasso-home-sub{font-size:13px;color:var(--home-muted);margin-top:8px}
      .cafasso-home-manifest{font:700 9px/1.3 Inter,system-ui;letter-spacing:.18em;color:#9A968F;text-transform:uppercase;padding-top:12px;white-space:nowrap}

      .cafasso-home-feature-grid{display:grid;grid-template-columns:minmax(0,1.72fr) minmax(260px,.72fr);gap:16px;align-items:stretch}
      .cafasso-home-hero{min-height:355px;border-radius:22px;overflow:hidden;background:linear-gradient(112deg,#E6D8C6 0%,#F1E7D7 46%,#DCC6A5 100%);position:relative;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(250px,.72fr);border:1px solid rgba(23,50,74,.05)}
      .cafasso-home-hero:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(250,247,240,.34),transparent 60%);pointer-events:none}
      .cafasso-home-hero-copy{padding:38px 38px 34px;position:relative;z-index:2;align-self:center}
      .cafasso-home-eyebrow{font:850 9px/1.2 Inter,system-ui;letter-spacing:.17em;text-transform:uppercase;color:#8C6A24;margin-bottom:11px}
      .cafasso-home-hero h2{font:400 46px/1.02 Georgia,serif;letter-spacing:-.035em;color:var(--home-navy);margin:0 0 7px}
      .cafasso-home-course-name{font:700 17px/1.2 Inter,system-ui;color:var(--home-navy);margin-bottom:10px}
      .cafasso-home-desc{font-size:13px;line-height:1.58;color:#676761;max-width:520px;margin:0 0 22px}
      .cafasso-home-progress-row{display:grid;grid-template-columns:minmax(130px,260px) auto;gap:10px;align-items:center;max-width:340px;margin-bottom:20px}
      .cafasso-home-track{height:5px;background:rgba(23,50,74,.12);border-radius:999px;overflow:hidden}.cafasso-home-track span{display:block;height:100%;background:var(--home-gold);border-radius:inherit}
      .cafasso-home-progress-row b{font-size:11px;color:var(--home-navy)}
      .cafasso-home-primary{appearance:none;border:0;background:var(--home-gold);color:#fff;border-radius:999px;padding:12px 18px;font:800 12px Inter,system-ui;cursor:pointer;box-shadow:none}
      .cafasso-home-visual{position:relative;min-height:355px;background:radial-gradient(circle at 65% 30%,rgba(255,255,255,.45),transparent 26%),linear-gradient(150deg,rgba(66,82,77,.05),rgba(116,85,42,.15));display:flex;align-items:flex-end;justify-content:flex-end;padding:30px}
      .cafasso-home-visual:before{content:"";position:absolute;width:205px;height:205px;border-radius:50%;right:16px;top:46px;border:1px solid rgba(23,57,84,.12);box-shadow:0 0 0 26px rgba(255,255,255,.10),0 0 0 52px rgba(255,255,255,.055)}
      .cafasso-home-visual-mark{position:absolute;right:54px;top:83px;width:115px;height:135px;opacity:.20;filter:sepia(.15)}
      .cafasso-home-visual-quote{position:relative;z-index:2;text-align:right;color:#5D5243;font:italic 20px/1.15 Georgia,serif;max-width:190px}.cafasso-home-visual-quote small{display:block;margin-top:9px;font:700 8px Inter,system-ui;letter-spacing:.12em;text-transform:uppercase;color:#85745D}

      .cafasso-home-word-slot{min-height:355px}
      .cafasso-home-word-slot .cafasso-daily-word{height:100%;min-height:355px;margin:0!important;border:0!important;border-radius:22px!important;padding:26px!important;background:linear-gradient(180deg,#173954,#112E47)!important;box-shadow:none!important;display:flex!important;align-items:stretch!important}
      .cafasso-home-word-slot .cafasso-dw-shell{width:100%;grid-template-columns:1fr!important;align-content:start!important;gap:18px!important}
      .cafasso-home-word-slot .cafasso-dw-symbol{width:34px!important;height:34px!important;border-radius:50%!important;background:rgba(255,255,255,.08)!important;border-color:rgba(255,255,255,.14)!important;color:#E7C15F!important}
      .cafasso-home-word-slot .cafasso-dw-kicker{font-size:9px!important;letter-spacing:.16em!important;color:#E7C15F!important;margin-bottom:11px!important}
      .cafasso-home-word-slot .cafasso-dw-main{display:block!important}.cafasso-home-word-slot .cafasso-dw-main strong{display:block!important;font:400 28px/1.12 Georgia,serif!important;letter-spacing:-.02em!important;color:#fff!important;margin-bottom:8px!important}
      .cafasso-home-word-slot .cafasso-dw-main span{font-size:11px!important;color:#C8D3DD!important}
      .cafasso-home-word-slot .cafasso-dw-readings{font-size:11px!important;line-height:1.5!important;color:#C8D3DD!important;margin-top:12px!important}
      .cafasso-home-word-slot .cafasso-dw-action{margin-top:auto!important;align-self:end!important;border-top:1px solid rgba(255,255,255,.12)!important;padding-top:16px!important;width:100%!important}.cafasso-home-word-slot .cafasso-dw-link{background:#D2AD4A!important;border-radius:999px!important;padding:9px 13px!important}.cafasso-home-word-slot .cafasso-dw-season{color:#C8D3DD!important}
      .cafasso-home-word-placeholder{height:100%;min-height:355px;border-radius:22px;background:linear-gradient(180deg,#173954,#112E47);padding:27px;color:#fff;display:flex;flex-direction:column;justify-content:space-between}.cafasso-home-word-placeholder span{color:#E7C15F;font-size:24px}.cafasso-home-word-placeholder h3{font:400 28px/1.1 Georgia,serif;margin:18px 0 8px}.cafasso-home-word-placeholder p{color:#C8D3DD;font-size:12px;line-height:1.55}

      .cafasso-home-lower{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(260px,.72fr);gap:20px;margin-top:31px;align-items:start}
      .cafasso-home-section-head{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-bottom:14px}.cafasso-home-section-head h3{font:400 29px/1.1 Georgia,serif;color:var(--home-navy);margin:0}.cafasso-home-link{appearance:none;border:0;background:none;padding:0;color:#7A6A50;font:800 11px Inter,system-ui;cursor:pointer}
      .cafasso-home-courses{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
      .cafasso-home-course{background:var(--home-card);border:1px solid var(--home-line);border-radius:17px;overflow:hidden;min-width:0}
      .cafasso-home-cover{height:105px;position:relative;background:linear-gradient(135deg,#D8C5AC,#EEE1CE)}.cafasso-home-course:nth-child(2) .cafasso-home-cover{background:linear-gradient(135deg,#A9B9AE,#E6D9C9)}.cafasso-home-course:nth-child(3) .cafasso-home-cover{background:linear-gradient(135deg,#D2B679,#EED8A7 55%,#94A4A8)}
      .cafasso-home-cover:after{content:"";position:absolute;right:18px;top:18px;width:48px;height:48px;border:1px solid rgba(255,255,255,.60);border-radius:50%;box-shadow:0 0 0 13px rgba(255,255,255,.14)}
      .cafasso-home-course-body{padding:16px 17px 17px}.cafasso-home-course h4{font:400 19px/1.15 Georgia,serif;color:var(--home-navy);margin:0 0 13px;min-height:44px}.cafasso-home-course .cafasso-home-track{margin-bottom:8px}.cafasso-home-course-meta{display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:10.5px;color:var(--home-muted)}.cafasso-home-course-open{appearance:none;border:0;background:none;color:var(--home-navy);padding:0;font:800 10.5px Inter,system-ui;cursor:pointer}

      .cafasso-home-next{background:rgba(250,247,240,.72);border:1px solid var(--home-line);border-radius:18px;padding:20px}.cafasso-home-next-title{display:flex;align-items:center;justify-content:space-between;margin-bottom:15px}.cafasso-home-next-title h3{font:400 23px/1.1 Georgia,serif;color:var(--home-navy);margin:0}.cafasso-home-next-list{display:grid;gap:0}.cafasso-home-next-item{display:grid;grid-template-columns:14px 1fr;gap:11px;padding:12px 0;border-top:1px solid rgba(23,50,74,.07)}.cafasso-home-next-item:first-child{border-top:0}.cafasso-home-dot{width:8px;height:8px;border-radius:50%;border:1px solid #A9A096;margin-top:4px}.cafasso-home-next-item:first-child .cafasso-home-dot{background:var(--home-gold);border-color:var(--home-gold)}.cafasso-home-next-item strong{display:block;font-size:12px;color:var(--home-navy);margin-bottom:3px}.cafasso-home-next-item small{font-size:10.5px;color:var(--home-muted);line-height:1.35}
      .cafasso-home-footer{margin-top:28px;border-radius:17px;background:#E7DED1;min-height:78px;padding:20px 24px;display:flex;align-items:center;justify-content:space-between;gap:24px;color:#61705E}.cafasso-home-footer strong{font:italic 18px Georgia,serif}.cafasso-home-footer span{font:800 9px Inter,system-ui;letter-spacing:.17em;text-transform:uppercase;color:#8A8379}

      @media(max-width:980px) and (min-width:681px){html[data-cafasso-home-v2="1"] .shell{grid-template-columns:88px minmax(0,1fr)!important}html[data-cafasso-home-v2="1"] .side{border-radius:0 18px 18px 0!important}.side .brand div,.side .nav button span,.side .foot{display:none!important}html[data-cafasso-home-v2="1"] main{padding:36px 26px!important}.cafasso-home-feature-grid,.cafasso-home-lower{grid-template-columns:1fr}.cafasso-home-word-slot{min-height:280px}.cafasso-home-word-slot .cafasso-daily-word,.cafasso-home-word-placeholder{min-height:280px}.cafasso-home-courses{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:680px){html[data-cafasso-home-v2="1"] body{background:#F1ECE3!important}html[data-cafasso-home-v2="1"] .side{display:none!important}html[data-cafasso-home-v2="1"] main{padding:20px 14px 28px!important}.cafasso-home-head{margin-bottom:20px}.cafasso-home-title{font-size:34px}.cafasso-home-manifest{display:none}.cafasso-home-feature-grid,.cafasso-home-lower{grid-template-columns:1fr}.cafasso-home-hero{grid-template-columns:1fr;min-height:0;border-radius:19px}.cafasso-home-hero-copy{padding:25px 21px 22px}.cafasso-home-hero h2{font-size:34px}.cafasso-home-visual{min-height:150px;padding:20px}.cafasso-home-visual:before{width:110px;height:110px;right:18px;top:18px}.cafasso-home-visual-mark{width:58px;height:72px;right:45px;top:36px}.cafasso-home-visual-quote{font-size:17px;max-width:165px}.cafasso-home-primary{width:100%;min-height:46px}.cafasso-home-word-slot{min-height:250px}.cafasso-home-word-slot .cafasso-daily-word,.cafasso-home-word-placeholder{min-height:250px;border-radius:19px!important}.cafasso-home-lower{margin-top:24px}.cafasso-home-courses{grid-template-columns:1fr}.cafasso-home-cover{height:82px}.cafasso-home-course h4{min-height:0}.cafasso-home-next{border-radius:16px}.cafasso-home-footer{margin-bottom:66px;align-items:flex-start;flex-direction:column;gap:8px}.mobilebar,.mobile-nav{background:rgba(250,247,240,.97)!important;border-top-color:rgba(23,50,74,.08)!important}.mobilebar button.active,.mobile-nav button.active{color:var(--home-navy)!important}.mobilebar button.active::after{background:var(--home-gold)!important}.mobile-nav button.active{background:#EEE1BD!important}}
    `;
    document.head.appendChild(s);
  }

  function pctFromCard(card){
    const span=card.querySelector('.mini span,.bar span');
    if(span){
      const raw=span.style.width||span.getAttribute('style')||'';
      const m=String(raw).match(/(\d+(?:\.\d+)?)%/);
      if(m)return Math.max(0,Math.min(100,Math.round(Number(m[1]))));
    }
    const m=(card.textContent||'').match(/\b(100|\d{1,2})\s*%/);
    return m?Number(m[1]):0;
  }

  function collectCards(main){
    return [...main.querySelectorAll('.course.card,.card.course')].map(card=>{
      const title=(card.querySelector('h4,h3,strong')?.textContent||'Tu formación').trim();
      const desc=(card.querySelector('p')?.textContent||'').trim();
      const button=card.querySelector('button:not([disabled]),a.btn,.btn:not([disabled])');
      return {title,desc,pct:pctFromCard(card),button};
    }).filter(x=>x.button);
  }

  function choose(cards){
    const pending=cards.filter(x=>x.pct<100);
    const active=pending.filter(x=>x.pct>0).sort((a,b)=>b.pct-a.pct);
    return active[0]||pending[0]||cards[0]||null;
  }

  function textFrom(selector,fallback=''){
    return (document.querySelector(selector)?.textContent||fallback).trim();
  }

  function renderHome(){
    if(!isHome()){root.dataset.cafassoHomeV2='0';return;}
    const main=document.getElementById('main');
    if(!main||main.querySelector('.cafasso-home-v2')){moveDailyWord();return;}
    const cards=collectCards(main);
    if(!cards.length)return;

    styles();
    root.dataset.cafassoHomeV2='1';
    const oldTitle=textFrom('#main .top h1','Hola');
    const name=(oldTitle.replace(/[!👋]/g,'').replace(/^Buenas,?\s*/i,'').trim()||'Animador/a').split(' ')[0];
    const groupCard=[...main.querySelectorAll('.stat')].find(x=>(x.textContent||'').toLowerCase().includes('grupo'));
    const group=groupCard?.querySelector('strong')?.textContent?.trim()||'';
    const selected=choose(cards);
    const list=cards.slice(0,3);
    const desc=selected?.desc||'Seguí creciendo en tu camino de formación y acompañamiento salesiano.';
    const nextCourse=cards.find(x=>x!==selected&&x.pct<100);

    main.innerHTML=`<div class="cafasso-home-v2">
      <header class="cafasso-home-head">
        <div><div class="cafasso-home-kicker">Tu espacio CAFASSO</div><h1 class="cafasso-home-title">Hola, ${esc(name)}</h1><div class="cafasso-home-sub">Animador/a${group&&group!=='—'?` · ${esc(group)}`:''}</div></div>
        <div class="cafasso-home-manifest">Jóvenes · Comunidad · Vida plena</div>
      </header>

      <section class="cafasso-home-feature-grid">
        <article class="cafasso-home-hero">
          <div class="cafasso-home-hero-copy">
            <div class="cafasso-home-eyebrow">Tu recorrido actual</div>
            <h2>Continuá desde acá</h2>
            <div class="cafasso-home-course-name">${esc(selected.title)}</div>
            <p class="cafasso-home-desc">${esc(desc)}</p>
            <div class="cafasso-home-progress-row"><div class="cafasso-home-track"><span style="width:${selected.pct}%"></span></div><b>${selected.pct}%</b></div>
            <button class="cafasso-home-primary" id="cafassoHomeContinue">${selected.pct?'Continuar recorrido':'Empezar recorrido'} →</button>
          </div>
          <div class="cafasso-home-visual"><img class="cafasso-home-visual-mark" src="./cafasso-mark.svg" alt=""><div class="cafasso-home-visual-quote">“Buenos cristianos y honestos ciudadanos”<small>Don Bosco</small></div></div>
        </article>
        <aside class="cafasso-home-word-slot" id="cafassoHomeWordSlot"><div class="cafasso-home-word-placeholder"><div><span>✝</span><h3>Palabra del día</h3><p>Una palabra para iluminar el camino de hoy.</p></div><small>Cargando liturgia…</small></div></aside>
      </section>

      <section class="cafasso-home-lower">
        <div>
          <div class="cafasso-home-section-head"><h3>Mis cursos</h3><button class="cafasso-home-link" id="cafassoHomeAllCourses">Ver todos →</button></div>
          <div class="cafasso-home-courses">${list.map((c,i)=>`<article class="cafasso-home-course"><div class="cafasso-home-cover"></div><div class="cafasso-home-course-body"><h4>${esc(c.title)}</h4><div class="cafasso-home-track"><span style="width:${c.pct}%"></span></div><div class="cafasso-home-course-meta"><span>${c.pct}%</span><button class="cafasso-home-course-open" data-home-course="${i}">${c.pct?'Continuar':'Abrir curso'} →</button></div></div></article>`).join('')}</div>
        </div>
        <aside class="cafasso-home-next">
          <div class="cafasso-home-next-title"><h3>Próximos pasos</h3></div>
          <div class="cafasso-home-next-list">
            <div class="cafasso-home-next-item"><span class="cafasso-home-dot"></span><div><strong>${selected.pct?'Retomar tu recorrido':'Comenzar tu recorrido'}</strong><small>${esc(selected.title)} · ${selected.pct}% completado</small></div></div>
            <div class="cafasso-home-next-item"><span class="cafasso-home-dot"></span><div><strong>Regalate un momento</strong><small>Leé la Palabra del día y hacé espacio a la reflexión.</small></div></div>
            <div class="cafasso-home-next-item"><span class="cafasso-home-dot"></span><div><strong>${nextCourse?'Explorar otro curso':'Seguir profundizando'}</strong><small>${nextCourse?esc(nextCourse.title):'Tu formación continúa paso a paso.'}</small></div></div>
          </div>
        </aside>
      </section>

      <footer class="cafasso-home-footer"><strong>🌿 Pequeños pasos, grandes historias.</strong><span>Formación que transforma</span></footer>
    </div>`;

    const cont=document.getElementById('cafassoHomeContinue');if(cont)cont.onclick=()=>selected.button?.click();
    const all=document.getElementById('cafassoHomeAllCourses');if(all)all.onclick=()=>document.querySelector('[data-view="cursos"]')?.click();
    main.querySelectorAll('[data-home-course]').forEach(btn=>{btn.onclick=()=>list[Number(btn.dataset.homeCourse)]?.button?.click();});
    polishBrand();
    moveDailyWord();
  }

  function polishBrand(){
    const small=document.querySelector('.side .brand small');
    if(small)small.innerHTML='FORMAR<br>ACOMPAÑAR<br>TRANSFORMAR';
    const motto=document.querySelector('.side .motto');
    if(motto)motto.innerHTML='“La educación es cosa del corazón.”<br><small style="font:700 9px Inter,system-ui;letter-spacing:.08em;text-transform:uppercase;opacity:.72">San Juan Bosco</small>';
  }

  function moveDailyWord(){
    if(!isHome())return;
    const slot=document.getElementById('cafassoHomeWordSlot');
    const word=document.getElementById('cafassoDailyWord');
    if(slot&&word&&word.parentElement!==slot){slot.innerHTML='';slot.appendChild(word);}
  }

  function schedule(){clearTimeout(timer);timer=setTimeout(()=>{renderHome();moveDailyWord();},90);}
  function boot(){
    styles();
    schedule();
    const app=document.getElementById('app')||document.body;
    const mo=new MutationObserver(()=>{
      const main=document.getElementById('main');
      if(main&&isHome()&&!main.querySelector('.cafasso-home-v2')&&main.querySelector('.course.card,.card.course'))schedule();
      if(main&&main.querySelector('.cafasso-home-v2'))moveDailyWord();
    });
    mo.observe(app,{childList:true,subtree:true});
    window.addEventListener('hashchange',schedule);
    document.addEventListener('click',e=>{if(e.target.closest('[data-view="inicio"]'))schedule();});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
