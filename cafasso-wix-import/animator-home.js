(()=>{
  if(window.__cafassoAnimatorHomeInstalled)return;
  window.__cafassoAnimatorHomeInstalled=true;

  const root=document.documentElement;
  const realRole=String(root.dataset.cafassoRole||'').toLowerCase();
  const previewRole=String(root.dataset.cafassoPreviewRole||'').toLowerCase();
  const isAnimator=realRole==='animador'||previewRole==='animador';
  const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  if(page!=='index.html'||!isAnimator)return;

  const STYLE_ID='cafassoAnimatorHomeStyles';
  const BLOCK_ID='cafassoContinueLearning';
  let timer=null;

  function styles(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      /* CAFASSO · nueva estética animador */
      :root{--cafasso-bg:#EDE7DC;--cafasso-surface:#F8F3EA;--cafasso-card:#FCF8F1;--cafasso-navy:#102F4F;--cafasso-navy-2:#0A253F;--cafasso-gold:#E9C24F;--cafasso-ink:#173047;--cafasso-muted:#6B7680;--cafasso-line:rgba(23,48,71,.10)}
      body{background:var(--cafasso-bg)!important;color:var(--cafasso-ink)!important}
      .shell{grid-template-columns:248px minmax(0,1fr)!important;gap:0}
      .side{height:calc(100vh - 28px)!important;top:14px!important;margin:14px 0 14px 14px!important;padding:25px 18px!important;border-radius:26px!important;background:linear-gradient(180deg,var(--cafasso-navy) 0%,var(--cafasso-navy-2) 100%)!important;box-shadow:0 18px 42px rgba(10,37,63,.16)!important}
      .brand{padding:2px 4px}.brand img{width:40px!important;height:47px!important}.brand b{font-size:24px!important;letter-spacing:-.02em}.brand small{font-size:10px!important;letter-spacing:.03em;opacity:.66!important}
      .nav{margin-top:34px!important;gap:6px!important}.nav button{padding:11px 13px!important;border-radius:14px!important;font-size:13px!important;color:rgba(255,255,255,.78)!important}.nav button.active{background:rgba(255,255,255,.10)!important;color:#fff!important;box-shadow:inset 3px 0 0 var(--cafasso-gold)!important}.nav button:hover{background:rgba(255,255,255,.08)!important;color:#fff!important}
      .foot{left:18px!important;right:18px!important;bottom:18px!important;gap:7px!important}.motto{font-size:14px!important;line-height:1.45!important;color:#F0D47A!important;margin:0 0 8px!important}.foot button,.foot a{padding:9px 11px!important;font-size:12px!important;border-radius:11px!important;color:rgba(255,255,255,.72)!important}.foot button:hover,.foot a:hover{background:rgba(255,255,255,.07)!important;color:#fff!important}
      main{padding:46px 48px 54px!important;max-width:1320px!important;margin:0 auto!important}.top{margin-bottom:30px!important;align-items:flex-start!important}.top h1{font-size:42px!important;line-height:1.04!important;letter-spacing:-.035em!important;color:var(--cafasso-navy)!important}.top p{font-size:14px!important;margin-top:8px!important;color:var(--cafasso-muted)!important}.pill{background:rgba(248,243,234,.72)!important;border:0!important;box-shadow:0 1px 0 rgba(255,255,255,.6),0 8px 20px rgba(23,48,71,.05)!important;padding:6px 10px 6px 6px!important}.avatar{background:var(--cafasso-gold)!important;color:var(--cafasso-navy)!important}
      .hero{position:relative!important;overflow:hidden!important;background:linear-gradient(135deg,var(--cafasso-navy) 0%,#153D63 100%)!important;border-radius:32px!important;padding:38px 40px!important;box-shadow:0 20px 45px rgba(10,37,63,.14)!important}.hero:before{content:'';position:absolute;width:280px;height:280px;border-radius:50%;right:-100px;top:-150px;background:rgba(233,194,79,.10);pointer-events:none}.hero:after{content:'';position:absolute;width:170px;height:170px;border-radius:50%;right:130px;bottom:-120px;background:rgba(255,255,255,.045);pointer-events:none}.hero>div{position:relative;z-index:1}.hero>div:first-child>div:first-child{font-size:10px!important;letter-spacing:.16em!important;font-weight:800!important;color:#E9D889!important}.hero h2{font-size:45px!important;line-height:1.03!important;letter-spacing:-.03em!important;margin:10px 0 12px!important}.hero p{font-size:14px!important;line-height:1.6!important;color:rgba(255,255,255,.76)!important;max-width:640px}.quote{background:rgba(255,255,255,.055)!important;border:1px solid rgba(255,255,255,.10)!important;border-radius:20px!important;padding:20px!important;box-shadow:none!important}.quote strong{font-size:22px!important;line-height:1.15!important}.quote p{margin-bottom:0!important}.bar{height:7px!important;background:rgba(255,255,255,.12)!important}.row{margin-top:24px!important}.btn{border-radius:13px!important;padding:11px 15px!important;background:var(--cafasso-gold)!important;box-shadow:none!important}.btn.alt{background:var(--cafasso-card)!important;border:0!important;color:var(--cafasso-navy)!important;box-shadow:inset 0 0 0 1px var(--cafasso-line)!important}.btn.done{background:#E3EFE9!important;color:#2E7D59!important;border:0!important}
      .section{margin-top:34px!important}.section h3{font-size:28px!important;letter-spacing:-.025em!important;margin-bottom:16px!important}.courses{gap:14px!important}.card{background:var(--cafasso-card)!important;border:0!important;border-radius:24px!important;padding:22px!important;box-shadow:0 9px 24px rgba(23,48,71,.055)!important}.course{min-height:220px;display:flex;flex-direction:column}.course h4{font-size:19px!important;line-height:1.2!important;margin:14px 0 7px!important;letter-spacing:-.015em}.course p{font-size:13px!important;line-height:1.5!important;color:var(--cafasso-muted)!important;flex:1}.course>div:last-child{margin-top:auto}.mini{height:6px!important;background:#E7DFD3!important;margin:18px 0 12px!important}.mini span{background:var(--cafasso-gold)!important}.badge{border-radius:999px!important;padding:6px 9px!important;font-size:10px!important;letter-spacing:.02em!important}.badge.gray{background:#EEE9E1!important;color:#6D747B!important}.badge.gold{background:#F7E9B5!important;color:#745B10!important}
      .stats{gap:10px!important;margin-top:16px!important}.stat{background:rgba(248,243,234,.74)!important;border:0!important;border-radius:18px!important;padding:17px 18px!important;box-shadow:inset 0 0 0 1px rgba(23,48,71,.055)!important}.stat strong{font-size:27px!important;letter-spacing:-.02em!important}.stat span{font-size:11px!important;color:var(--cafasso-muted)!important}.module{padding:18px 20px!important;margin-bottom:10px!important}.module strong{color:var(--cafasso-navy)!important}.block{margin-bottom:13px!important}.block h4{font-size:20px!important;letter-spacing:-.015em!important}.block-text{color:#3D5367!important}.activity{background:#F1EBE2!important;border-radius:18px!important}.activity textarea{background:#FBF8F2!important;border:1px solid rgba(23,48,71,.11)!important;border-radius:14px!important}.module-progress{background:var(--cafasso-card)!important;border:0!important;border-radius:18px!important;box-shadow:0 7px 20px rgba(23,48,71,.045)!important}.complete-box{border:0!important;border-radius:20px!important;background:#F3E9C8!important}.complete-box.ready{background:#DFECE6!important}.backline button{color:var(--cafasso-navy)!important}
      #${BLOCK_ID}{margin:26px 0 5px;background:linear-gradient(135deg,#F7F1E7 0%,#F4EBD8 100%);border:0;border-radius:25px;padding:22px 24px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:24px;align-items:center;box-shadow:0 10px 26px rgba(23,48,71,.055)}
      .cafasso-continue-eyebrow{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#8B6C18;font-weight:850;margin-bottom:5px}.cafasso-continue-title{margin:0;color:var(--cafasso-navy);font:28px/1.1 Georgia,serif;letter-spacing:-.025em}.cafasso-continue-meta{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-top:8px;color:var(--cafasso-muted);font-size:12px}.cafasso-continue-progress{display:grid;grid-template-columns:minmax(130px,210px) auto;gap:9px;align-items:center;margin-top:13px;max-width:340px}.cafasso-continue-track{height:6px;background:#DED5C6;border-radius:999px;overflow:hidden}.cafasso-continue-track span{display:block;height:100%;background:var(--cafasso-gold);border-radius:inherit}.cafasso-continue-progress b{font-size:11px;color:var(--cafasso-navy)}.cafasso-continue-action{border:0;background:var(--cafasso-navy);color:#fff;border-radius:14px;padding:12px 17px;min-height:44px;font:800 13px Inter,system-ui;cursor:pointer;white-space:nowrap;box-shadow:none}.cafasso-continue-action:hover{filter:brightness(1.06)}.cafasso-continue-fresh{background:linear-gradient(135deg,#F8F3EA,#EEE4D1)}
      @media(max-width:900px) and (min-width:681px){.shell{grid-template-columns:88px minmax(0,1fr)!important}.side{margin-left:10px!important;padding:22px 12px!important}.side .brand div,.side .nav button span,.side .foot{display:none!important}.side .brand{justify-content:center}.nav button{text-align:center!important}main{padding:38px 30px 48px!important}.top h1{font-size:36px!important}}
      @media(max-width:680px){
        body{background:#EDE7DC!important}.side{display:none!important}.mobile-head{background:rgba(16,47,79,.97)!important;box-shadow:0 8px 24px rgba(10,37,63,.12)!important;min-height:64px!important;padding:9px 14px!important}.mobile-brand b{font-size:19px!important}.mobile-brand small{opacity:.62!important}.mobile-user .avatar{border:0!important;box-shadow:none!important}
        main{padding:20px 14px 28px!important}.top{margin-bottom:20px!important}.top h1{font-size:31px!important;letter-spacing:-.03em!important}.top p{font-size:13px!important}.hero{padding:24px 20px!important;border-radius:25px!important}.hero h2{font-size:32px!important}.hero p{font-size:14px!important}.hero .quote{display:none!important}.hero .btn{width:100%!important;min-height:46px!important;margin-top:2px}.section{margin-top:26px!important}.section h3{font-size:25px!important}.courses{grid-template-columns:1fr!important;gap:11px!important}.card{border-radius:20px!important;padding:18px!important;box-shadow:0 7px 18px rgba(23,48,71,.045)!important}.course{min-height:0}.stats{grid-template-columns:1fr 1fr!important;gap:9px!important}.stat{border-radius:16px!important;padding:14px!important}.stat strong{font-size:24px!important}.mobilebar{background:rgba(248,243,234,.98)!important;border-top:1px solid rgba(23,48,71,.08)!important;box-shadow:0 -8px 22px rgba(23,48,71,.08)!important}.mobilebar button.active{color:var(--cafasso-navy)!important}.mobilebar button.active::after{background:var(--cafasso-gold)!important}.mobile-nav{background:rgba(248,243,234,.98)!important;border-top:1px solid rgba(23,48,71,.08)!important}.mobile-nav button.active{background:#F3E7BB!important;color:var(--cafasso-navy)!important}.mobile-sheet{background:#F8F3EA!important;border:0!important}.module-progress{border-radius:16px!important}.activity{padding:14px!important}#${BLOCK_ID}{margin:18px 0 2px;padding:18px;border-radius:20px;grid-template-columns:1fr;gap:15px}.cafasso-continue-title{font-size:24px}.cafasso-continue-progress{grid-template-columns:1fr auto;max-width:none}.cafasso-continue-action{width:100%;min-height:46px}}
    `;
    document.head.appendChild(s);
  }

  function pctFromCard(card){
    const spans=[...card.querySelectorAll('.mini span,.bar span,[class*="progress"] span')];
    for(const span of spans){
      const raw=span.style.width||span.getAttribute('style')||'';
      const m=String(raw).match(/(?:width\s*:\s*)?(\d+(?:\.\d+)?)%/i);
      if(m)return Math.max(0,Math.min(100,Math.round(Number(m[1]))));
    }
    const text=card.textContent||'';
    const m=text.match(/\b(100|\d{1,2})\s*%/);
    return m?Number(m[1]):0;
  }

  function courseCards(){
    const main=document.getElementById('main');
    if(!main)return [];
    const raw=[...main.querySelectorAll('.course.card,.card.course,.courses .card')];
    return raw.filter(card=>{
      if(card.closest('#'+BLOCK_ID))return false;
      const btn=card.querySelector('button,.btn,a.btn');
      const title=card.querySelector('h4,h3,strong');
      return btn&&title;
    });
  }

  function info(card){
    const title=(card.querySelector('h4,h3')?.textContent||card.querySelector('strong')?.textContent||'Tu formación').trim();
    const description=(card.querySelector('p')?.textContent||'').trim();
    const button=card.querySelector('button:not([disabled]),a.btn,.btn:not([disabled])');
    const pct=pctFromCard(card);
    const badge=(card.querySelector('.badge')?.textContent||'').trim();
    return {card,title,description,button,pct,badge};
  }

  function choose(cards){
    const rows=cards.map(info).filter(x=>x.button&&x.pct<100);
    if(!rows.length)return null;
    const active=rows.filter(x=>x.pct>0).sort((a,b)=>b.pct-a.pct);
    return active[0]||rows[0];
  }

  function anchor(){
    const cards=courseCards();
    if(!cards.length)return null;
    return cards[0].closest('.section')||cards[0].parentElement;
  }

  function render(){
    if((location.hash||'#inicio').replace(/^#/,'')!=='inicio'){
      document.getElementById(BLOCK_ID)?.remove();
      return;
    }
    const cards=courseCards();
    const selected=choose(cards);
    const section=anchor();
    if(!selected||!section){document.getElementById(BLOCK_ID)?.remove();return;}
    styles();
    let block=document.getElementById(BLOCK_ID);
    if(!block){block=document.createElement('section');block.id=BLOCK_ID;section.parentNode.insertBefore(block,section);}
    const fresh=selected.pct===0;
    block.className=fresh?'cafasso-continue-fresh':'';
    const meta=[fresh?'Todavía no empezaste este curso':'Retomá donde lo dejaste',selected.badge].filter(Boolean).join(' · ');
    block.innerHTML=`
      <div>
        <div class="cafasso-continue-eyebrow">${fresh?'Tu próximo paso':'Continuá desde acá'}</div>
        <h3 class="cafasso-continue-title">${escapeHtml(selected.title)}</h3>
        <div class="cafasso-continue-meta"><span>${escapeHtml(meta)}</span></div>
        <div class="cafasso-continue-progress"><div class="cafasso-continue-track"><span style="width:${selected.pct}%"></span></div><b>${selected.pct}%</b></div>
      </div>
      <button class="cafasso-continue-action" type="button">${fresh?'Empezar curso':'Continuar curso'} →</button>`;
    block.querySelector('.cafasso-continue-action').onclick=()=>selected.button.click();
  }

  function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[c]));}
  function schedule(){clearTimeout(timer);timer=setTimeout(render,80);}

  const boot=()=>{
    styles();
    schedule();
    new MutationObserver(schedule).observe(document.getElementById('main')||document.body,{subtree:true,childList:true});
    window.addEventListener('hashchange',schedule);
    document.addEventListener('click',e=>{if(e.target.closest('[data-view="inicio"]'))schedule();});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
