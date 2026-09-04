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
      #${BLOCK_ID}{margin:24px 0 4px;background:linear-gradient(135deg,#FFFDF9 0%,#FFF9E8 100%);border:1px solid #E8DCCB;border-radius:22px;padding:20px 22px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:22px;align-items:center;box-shadow:0 7px 20px rgba(15,45,77,.045)}
      .cafasso-continue-eyebrow{font-size:10px;letter-spacing:.13em;text-transform:uppercase;color:#9A6B16;font-weight:850;margin-bottom:5px}
      .cafasso-continue-title{margin:0;color:#0F2D4D;font:27px/1.12 Georgia,serif}
      .cafasso-continue-meta{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-top:8px;color:#687386;font-size:12px}
      .cafasso-continue-progress{display:grid;grid-template-columns:minmax(130px,210px) auto;gap:9px;align-items:center;margin-top:13px;max-width:340px}
      .cafasso-continue-track{height:7px;background:#EDE5D8;border-radius:999px;overflow:hidden}.cafasso-continue-track span{display:block;height:100%;background:#F2C94C;border-radius:inherit}
      .cafasso-continue-progress b{font-size:11px;color:#0F2D4D}
      .cafasso-continue-action{border:0;background:#F2C94C;color:#0F2D4D;border-radius:13px;padding:12px 16px;min-height:44px;font:850 13px Inter,system-ui;cursor:pointer;white-space:nowrap;box-shadow:0 5px 13px rgba(145,111,0,.10)}
      .cafasso-continue-action:hover{filter:brightness(.985)}
      .cafasso-continue-fresh{background:linear-gradient(135deg,#FFFDF9,#F7F2E9)}
      @media(max-width:680px){#${BLOCK_ID}{margin:18px 0 2px;padding:17px;border-radius:18px;grid-template-columns:1fr;gap:15px}.cafasso-continue-title{font-size:23px}.cafasso-continue-progress{grid-template-columns:1fr auto;max-width:none}.cafasso-continue-action{width:100%;min-height:46px}}
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
    schedule();
    new MutationObserver(schedule).observe(document.getElementById('main')||document.body,{subtree:true,childList:true});
    window.addEventListener('hashchange',schedule);
    document.addEventListener('click',e=>{if(e.target.closest('[data-view="inicio"]'))schedule();});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
