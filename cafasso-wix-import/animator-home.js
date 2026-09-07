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
      :root{--cafasso-home-bg:#F3EEE5;--cafasso-home-surface:#FBF8F2;--cafasso-home-card:#FFFDF9;--cafasso-home-navy:#153550;--cafasso-home-navy2:#102C47;--cafasso-home-gold:#C79A2B;--cafasso-home-ink:#15304A;--cafasso-home-muted:#6B737C;--cafasso-home-line:rgba(21,48,74,.10)}
      body{background:var(--cafasso-home-bg)}
      .shell{grid-template-columns:220px minmax(0,1fr)}
      .side{background:linear-gradient(180deg,var(--cafasso-home-navy),var(--cafasso-home-navy2));padding:28px 16px;border-radius:0 22px 22px 0;box-shadow:8px 0 28px rgba(16,44,71,.08)}
      .brand{padding:0 8px}.brand img{width:42px!important;height:50px!important}.brand b{font-size:24px!important;letter-spacing:-.015em}.brand small{font-size:9px!important;letter-spacing:.08em!important;opacity:.68!important;line-height:1.45}
      .nav{margin-top:40px!important;gap:8px!important}.nav button{padding:13px 14px!important;border-radius:12px!important;color:rgba(255,255,255,.82)!important;font-size:13px!important}.nav button.active{background:rgba(255,255,255,.14)!important;color:#fff!important;box-shadow:none!important}.nav button:hover{background:rgba(255,255,255,.10)!important;color:#fff!important}
      .foot{left:24px!important;right:20px!important;bottom:24px!important}.motto{font-size:14px!important;line-height:1.55!important;color:#F3DFC0!important;border-top:1px solid rgba(255,255,255,.16);padding-top:20px;margin-bottom:14px!important}.foot button,.foot a{font-size:12px!important;color:rgba(255,255,255,.78)!important;padding:9px 4px!important}
      main{padding:44px 34px 48px!important;max-width:1320px!important;margin:0 auto!important}
      .top{margin-bottom:28px!important;align-items:flex-start!important}.top h1{font-size:44px!important;line-height:1.02!important;letter-spacing:-.035em!important;color:var(--cafasso-home-navy)!important}.top p{font-size:14px!important;color:var(--cafasso-home-muted)!important;margin-top:7px!important}.pill{background:transparent!important;border:0!important;padding:2px 0!important}.pill .avatar{width:42px!important;height:42px!important;background:#E7D1A0!important;color:var(--cafasso-home-navy)!important}.pill span{font-size:13px!important;color:var(--cafasso-home-navy)!important;font-weight:700}
      .hero{background:linear-gradient(135deg,#EDE1CF 0%,#F5EEDF 50%,#E8D9C4 100%)!important;color:var(--cafasso-home-ink)!important;border-radius:18px!important;padding:34px!important;box-shadow:none!important;border:1px solid rgba(21,48,74,.06)!important;position:relative!important;overflow:hidden!important}
      .hero:after{content:'';position:absolute;right:-45px;top:-70px;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(199,154,43,.14),rgba(199,154,43,0) 68%);pointer-events:none}.hero>div{position:relative;z-index:1}.hero>div:first-child>div:first-child{font-size:10px!important;letter-spacing:.18em!important;color:#8C6B20!important;font-weight:850!important}.hero h2{font-size:44px!important;line-height:1.04!important;letter-spacing:-.03em!important;color:var(--cafasso-home-navy)!important;margin:10px 0 12px!important}.hero p{font-size:14px!important;line-height:1.65!important;color:#566270!important;max-width:620px}.hero .row{color:#5D6670!important;margin-top:24px!important}.hero .bar{background:rgba(21,48,74,.10)!important;height:7px!important}.hero .bar span{background:var(--cafasso-home-gold)!important}.hero .btn{background:var(--cafasso-home-gold)!important;color:white!important;border-radius:999px!important;padding:12px 18px!important;box-shadow:none!important}.hero .quote{background:linear-gradient(180deg,var(--cafasso-home-navy),var(--cafasso-home-navy2))!important;border:0!important;border-radius:16px!important;color:#fff!important;padding:22px!important;box-shadow:none!important}.hero .quote strong{font-size:22px!important;color:#fff!important}.hero .quote p{color:rgba(255,255,255,.72)!important;margin-bottom:0!important}
      #${BLOCK_ID}{margin:22px 0 4px;background:var(--cafasso-home-card);border:1px solid var(--cafasso-home-line);border-radius:18px;padding:20px 22px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:22px;align-items:center;box-shadow:none}
      .cafasso-continue-eyebrow{font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#9B7622;font-weight:850;margin-bottom:5px}.cafasso-continue-title{margin:0;color:var(--cafasso-home-navy);font:27px/1.12 Georgia,serif;letter-spacing:-.02em}.cafasso-continue-meta{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-top:8px;color:var(--cafasso-home-muted);font-size:12px}.cafasso-continue-progress{display:grid;grid-template-columns:minmax(130px,210px) auto;gap:9px;align-items:center;margin-top:13px;max-width:340px}.cafasso-continue-track{height:6px;background:#E8E1D7;border-radius:999px;overflow:hidden}.cafasso-continue-track span{display:block;height:100%;background:var(--cafasso-home-gold);border-radius:inherit}.cafasso-continue-progress b{font-size:11px;color:var(--cafasso-home-navy)}.cafasso-continue-action{border:0;background:var(--cafasso-home-navy);color:#fff;border-radius:999px;padding:12px 18px;min-height:44px;font:800 13px Inter,system-ui;cursor:pointer;white-space:nowrap;box-shadow:none}.cafasso-continue-fresh{background:#F7F2E9}
      .section{margin-top:30px!important}.section h3{font-size:29px!important;letter-spacing:-.025em!important;margin-bottom:16px!important;color:var(--cafasso-home-navy)!important}.courses{gap:14px!important}.course.card{background:var(--cafasso-home-card)!important;border:1px solid var(--cafasso-home-line)!important;border-radius:16px!important;padding:0 0 18px!important;overflow:hidden!important;box-shadow:none!important}.course.card:before{content:'';display:block;height:94px;background:linear-gradient(135deg,#DCCDB8,#F0E3CF 55%,#C6B18C)}.course.card:nth-child(2):before{background:linear-gradient(135deg,#B8C2B5,#E2D7C7 55%,#9EAD9F)}.course.card:nth-child(3):before{background:linear-gradient(135deg,#D1B178,#F1D9A9 55%,#8FA0A9)}.course.card>*{margin-left:18px;margin-right:18px}.course.card .badge{margin-top:16px}.course h4{font-family:Georgia,serif!important;font-size:19px!important;line-height:1.18!important;letter-spacing:-.01em!important;color:var(--cafasso-home-navy)!important;margin-top:12px!important}.course p{font-size:12.5px!important;line-height:1.5!important;color:var(--cafasso-home-muted)!important;min-height:38px}.course .mini{height:6px!important;background:#E5DFD6!important;margin-top:18px!important}.course .mini span{background:var(--cafasso-home-gold)!important}.course .btn{background:transparent!important;color:var(--cafasso-home-navy)!important;padding:0!important;border:0!important;border-radius:0!important;font-size:12px!important}.course small{font-size:11px!important;color:var(--cafasso-home-muted)!important}.badge{font-size:9px!important;padding:5px 8px!important;letter-spacing:.03em!important}.badge.gray{background:#F0EDE8!important}.badge.gold{background:#F2E4B8!important;color:#765A14!important}
      .stats{gap:10px!important;margin-top:18px!important}.stat{background:rgba(255,253,249,.62)!important;border:1px solid rgba(21,48,74,.06)!important;border-radius:14px!important;padding:15px 16px!important}.stat strong{font-size:25px!important;color:var(--cafasso-home-navy)!important}.stat span{font-size:11px!important;color:var(--cafasso-home-muted)!important}
      @media(max-width:900px) and (min-width:681px){.shell{grid-template-columns:88px minmax(0,1fr)!important}.side{border-radius:0 18px 18px 0}.side .brand div,.side .nav button span,.side .foot{display:none!important}main{padding:34px 24px 42px!important}.top h1{font-size:36px!important}.hero h2{font-size:36px!important}}
      @media(max-width:680px){body{background:#F3EEE5!important}.side{display:none!important}.mobile-head{background:linear-gradient(135deg,var(--cafasso-home-navy),var(--cafasso-home-navy2))!important;box-shadow:0 5px 18px rgba(16,44,71,.12)!important}.mobile-brand b{font-size:19px!important}.mobile-brand small{opacity:.65!important}.mobile-user .avatar{background:#D7B968!important;color:var(--cafasso-home-navy)!important;border:0!important}main{padding:20px 14px 28px!important}.top{margin-bottom:18px!important}.top h1{font-size:31px!important}.top p{font-size:13px!important}.hero{padding:22px 18px!important;border-radius:18px!important}.hero h2{font-size:32px!important}.hero .quote{display:none!important}.hero .btn{width:100%!important;min-height:46px!important}.section{margin-top:24px!important}.section h3{font-size:25px!important}.courses{grid-template-columns:1fr!important;gap:12px!important}.course.card{border-radius:16px!important}.course.card:before{height:82px}.stats{grid-template-columns:1fr 1fr!important;gap:9px!important}.stat{border-radius:13px!important;padding:14px!important}.mobilebar,.mobile-nav{background:rgba(251,248,242,.97)!important;border-top-color:rgba(21,48,74,.08)!important}.mobilebar button.active,.mobile-nav button.active{color:var(--cafasso-home-navy)!important}.mobilebar button.active::after{background:var(--cafasso-home-gold)!important}.mobile-nav button.active{background:#EFE3C2!important}#${BLOCK_ID}{margin:18px 0 2px;padding:17px;border-radius:16px;grid-template-columns:1fr;gap:15px}.cafasso-continue-title{font-size:24px}.cafasso-continue-progress{grid-template-columns:1fr auto;max-width:none}.cafasso-continue-action{width:100%;min-height:46px}}
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

  function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
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
