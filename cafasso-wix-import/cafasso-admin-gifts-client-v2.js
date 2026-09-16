(() => {
  if(window.__cafassoAdminGiftsClientV2Installed)return;
  window.__cafassoAdminGiftsClientV2Installed=true;

  const ME='https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoMe';
  const GIFT_COURSE='__cafasso_admin_gifts__';
  const RUAH='__cafasso_ruah__';
  const HUELLAS='__cafasso_huella_rewards__';
  const MAX_LEDGER=40;
  const LEVELS=[
    {id:'sonador',min:0,title:'Soñador',icon:'✧',copy:'Todo empieza con una intuición que invita a ponerse en camino.'},
    {id:'caminante',min:100,title:'Caminante',icon:'›',copy:'Ya no mirás desde afuera: empezaste a recorrer el camino.'},
    {id:'presencia',min:300,title:'Presencia',icon:'◉',copy:'Tu camino empieza a hacerse presencia cercana entre otros.'},
    {id:'acompanante',min:600,title:'Acompañante',icon:'◇',copy:'Aprender se convierte en estar cerca, escuchar y sostener.'},
    {id:'servidor',min:1000,title:'Servidor',icon:'✦',copy:'Lo recibido empieza a volverse entrega concreta.'},
    {id:'corazon-salesiano',min:1600,title:'Corazón salesiano',icon:'♡',copy:'Casa, patio, escuela y parroquia se vuelven una misma forma de estar.'}
  ];
  let loading=null,timer=null;

  const json=(storage,key)=>{try{return JSON.parse(storage.getItem(key)||'null')}catch(e){return null}};
  const user=()=>json(localStorage,'cafassoSession')?.user||{};
  const uid=()=>String(user()?._id||user()?.id||'');
  const userKey=()=>String(user()?._id||user()?.id||user()?.email||user()?.name||'local');
  const ledgerKey=()=>`cafasso-almitas-ledger-v1:${userKey()}`;
  const seenKey=()=>`cafasso-admin-gifts-seen-v2:${userKey()}`;
  const levelKey=()=>`cafasso-admin-gift-level-v2:${userKey()}`;
  function headers(){const a=json(localStorage,'cafassoAuth');return a?.sessionToken&&Number(a.expiresAt||0)>Date.now()?{Authorization:`Bearer ${a.sessionToken}`}:null}
  function progressRow(data,id){return (data?.progress||[]).find(r=>String(r.courseId||'')===id&&(!uid()||!r.userId||String(r.userId)===uid()))||null}

  function gifts(data){
    return (data?.submissions||[]).filter(s=>String(s.courseId||'')===GIFT_COURSE&&String(s.status||'')==='Aprobada'&&Number(s.rewardAlmitas||0)>0)
      .map(s=>({id:String(s.activityId||s._id||''),amount:Math.max(0,Number(s.rewardAlmitas||0)),reason:String(s.content||''),at:String(s.almitasAwardedAt||s.reviewedAt||s._createdDate||s._updatedDate||''),by:String(s.feedback||'').replace(/^Asignado por\s*/i,'')||'Administrador'}))
      .filter(g=>g.id&&g.amount>0).sort((a,b)=>new Date(b.at)-new Date(a.at));
  }
  function giftBonus(list){return list.reduce((sum,g)=>sum+g.amount,0)}
  function approved(data){return (data?.progress||[]).filter(r=>!uid()||!r.userId||String(r.userId)===uid()).reduce((sum,r)=>sum+Number(r.almitasApproved||0),0)}
  function total(data,list){const ruah=Number(progressRow(data,RUAH)?.blockAnswers?.ruahState?.bonusAlmitas||0),huellas=Number(progressRow(data,HUELLAS)?.blockAnswers?.huellaRewardState?.bonusAlmitas||0);return Math.max(0,approved(data)+ruah+huellas+giftBonus(list))}

  function cleanEntry(x){return{id:String(x?.id||''),amount:Number(x?.amount||0),source:String(x?.source||'Movimiento'),detail:String(x?.detail||''),at:String(x?.at||''),fingerprint:String(x?.fingerprint||'')}}
  function normalizeLedger(raw){const seen=new Set(),source=raw&&typeof raw==='object'?raw:{};const entries=(Array.isArray(source.entries)?source.entries:[]).map(cleanEntry).filter(e=>e.id&&Number.isFinite(e.amount)&&e.at).sort((a,b)=>new Date(b.at)-new Date(a.at)).filter(e=>{const k=e.fingerprint||e.id;if(seen.has(k))return false;seen.add(k);return true}).slice(0,MAX_LEDGER);return{version:1,entries,updatedAt:String(source.updatedAt||'')}}
  function mergeGifts(list){const ledger=normalizeLedger(json(localStorage,ledgerKey()));let changed=false;for(const g of list){const fp=`admin-gift:${g.id}`;if(ledger.entries.some(e=>e.fingerprint===fp))continue;ledger.entries.push({id:`gift:${g.id}`,amount:g.amount,source:'Regalo del administrador',detail:g.reason||`Asignado por ${g.by}`,at:g.at||new Date().toISOString(),fingerprint:fp});changed=true}const clean=normalizeLedger({entries:ledger.entries,updatedAt:changed?new Date().toISOString():ledger.updatedAt});try{localStorage.setItem(ledgerKey(),JSON.stringify(clean))}catch(e){}return clean}
  function fmt(iso){const d=new Date(iso);if(!Number.isFinite(d.getTime()))return'';const now=new Date(),time=d.toLocaleTimeString('es-UY',{hour:'2-digit',minute:'2-digit'});if(d.toDateString()===now.toDateString())return`Hoy · ${time}`;return`${d.toLocaleDateString('es-UY',{day:'2-digit',month:'2-digit'})} · ${time}`}
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  function renderHistory(ledger){const list=document.querySelector('[data-cafasso-almitas-history] .cafasso-almitas-history__list');if(!list)return;const visible=ledger.entries.slice(0,5);list.innerHTML=visible.length?visible.map(e=>`<div class="cafasso-almitas-move"><div class="cafasso-almitas-move__amount${e.amount<0?' is-negative':''}">${e.amount>0?'+':''}${e.amount}</div><div class="cafasso-almitas-move__copy"><strong>${esc(e.source)}</strong><span>${esc(e.detail||'Movimiento registrado')}</span></div><div class="cafasso-almitas-move__when">${fmt(e.at)}</div></div>`).join(''):'<div class="cafasso-almitas-history__empty">Los próximos cambios de Almitas van a quedar registrados acá.</div>'}

  function levelFor(value){let level=LEVELS[0];for(const item of LEVELS)if(value>=item.min)level=item;const index=LEVELS.findIndex(x=>x.id===level.id),next=LEVELS[index+1]||null,span=next?Math.max(1,next.min-level.min):1,progress=next?Math.max(0,Math.min(100,((value-level.min)/span)*100)):100;return{level,next,index,progress}}
  function announceLevel(info){document.querySelector('.cafasso-level-up')?.remove();const box=document.createElement('div');box.className='cafasso-level-up';box.innerHTML=`<div class="cafasso-level-up__icon">${info.level.icon}</div><small>Nueva etapa del camino</small><strong>${info.level.title}</strong><span>${info.level.copy}</span>`;document.body.appendChild(box);requestAnimationFrame(()=>box.classList.add('is-visible'));setTimeout(()=>box.classList.remove('is-visible'),3300);setTimeout(()=>box.remove(),3650)}
  function patchLevel(value,allowAnnouncement){const info=levelFor(value),pill=document.querySelector('.cafasso-level-pill');if(pill)pill.innerHTML=`<span class="cafasso-level-pill__icon">${info.level.icon}</span><span><small>Etapa del camino</small><strong>${info.level.title}</strong></span>`;const panel=document.querySelector('[data-cafasso-level-panel]');if(panel){const rem=info.next?Math.max(0,info.next.min-value):0;const h=panel.querySelector('h3'),p=panel.querySelector('p'),i=panel.querySelector('.cafasso-level-panel__icon'),bar=panel.querySelector('.cafasso-level-progress i'),foot=panel.querySelector('.cafasso-level-panel__foot');if(h)h.textContent=info.level.title;if(p)p.textContent=info.level.copy;if(i)i.textContent=info.level.icon;if(bar)bar.style.width=`${info.progress.toFixed(1)}%`;if(foot)foot.innerHTML=`<span><b>${value}</b> Almitas</span><span>${info.next?`Faltan <b>${rem}</b> para ${info.next.title}`:'<b>Etapa más alta alcanzada</b>'}</span>`}const prev=json(localStorage,levelKey())||{},prevIndex=Number.isFinite(Number(prev.index))?Number(prev.index):null;try{localStorage.setItem(levelKey(),JSON.stringify({index:info.index,id:info.level.id,total:value,updatedAt:new Date().toISOString()}))}catch(e){}if(allowAnnouncement&&prevIndex!==null&&info.index>prevIndex)announceLevel(info);window.CafassoLevel={totalAlmitas:value,...info};window.dispatchEvent(new CustomEvent('cafasso:level-update',{detail:window.CafassoLevel}))}

  function patchCounters(value,bonus){const global=document.querySelector('[data-global-almitas] .cafasso-global-counter__value');if(global)global.textContent=String(value);const card=document.querySelector('[data-profile-almitas-card]');if(card){const strong=card.querySelector('strong'),sub=card.querySelector('span');if(strong)strong.textContent=String(value);if(sub){let text=String(sub.textContent||'').replace(/\s*·\s*\d+\s+regaladas?/gi,'').trim();if(bonus)text=`${text}${text?' · ':''}${bonus} regaladas`;sub.textContent=text||'Tu camino recién empieza.'}}document.querySelectorAll('[data-almitas-total]').forEach(n=>n.textContent=String(value));if(window.CafassoProfileMetrics){window.CafassoProfileMetrics.almitas={...(window.CafassoProfileMetrics.almitas||{}),total:value,adminGiftBonus:bonus}}}
  function unseen(list){const old=json(localStorage,seenKey()),known=new Set(Array.isArray(old?.ids)?old.ids.map(String):[]);return list.filter(g=>!known.has(g.id))}
  function markSeen(list){try{localStorage.setItem(seenKey(),JSON.stringify({ids:list.map(g=>g.id).slice(0,300),updatedAt:new Date().toISOString()}))}catch(e){}}
  function toast(items){if(!items.length)return;const sum=items.reduce((n,g)=>n+g.amount,0),latest=items[0];document.querySelector('.cafasso-admin-gift-toast')?.remove();const t=document.createElement('div');t.className='cafasso-admin-gift-toast';t.style.cssText='position:fixed;z-index:2147483590;left:50%;bottom:28px;max-width:min(560px,90vw);padding:13px 18px;border:1px solid rgba(238,197,104,.58);border-radius:999px;background:rgba(12,43,40,.98);box-shadow:0 15px 34px rgba(0,0,0,.36);color:#fff4d4;text-align:center;font:800 11px/1.35 Inter,system-ui,sans-serif;opacity:0;transform:translate(-50%,16px);transition:.22s opacity,.22s transform;pointer-events:none';t.textContent=`+${sum} Almitas · Regalo del administrador${latest.reason?`: ${latest.reason}`:''}`;document.body.appendChild(t);requestAnimationFrame(()=>{t.style.opacity='1';t.style.transform='translate(-50%,0)'});setTimeout(()=>{t.style.opacity='0';t.style.transform='translate(-50%,16px)'},3500);setTimeout(()=>t.remove(),3850)}

  async function refresh({announce=true}={}){if(loading)return loading;loading=(async()=>{const h=headers();if(!h||!uid())return;try{const r=await fetch(ME,{headers:h,cache:'no-store'}),data=await r.json().catch(()=>({}));if(!r.ok||data?.ok===false)return;const list=gifts(data),newItems=unseen(list),bonus=giftBonus(list),value=total(data,list),ledger=mergeGifts(list);renderHistory(ledger);patchCounters(value,bonus);patchLevel(value,announce&&newItems.length>0);if(announce&&newItems.length)toast(newItems);markSeen(list);window.CafassoAdminGiftMetrics={totalAlmitas:value,bonusAlmitas:bonus,gifts:list};window.dispatchEvent(new CustomEvent('cafasso:admin-gifts',{detail:window.CafassoAdminGiftMetrics}))}catch(e){}})().finally(()=>{loading=null});return loading}
  function schedule(announce=false,delay=180){clearTimeout(timer);timer=setTimeout(()=>refresh({announce}),delay)}
  function boot(){setTimeout(()=>refresh({announce:false}),1000);window.addEventListener('cafasso:profile-metrics',()=>schedule(false));window.addEventListener('cafasso:huella-rewards',()=>schedule(false,220));window.addEventListener('focus',()=>refresh({announce:true}));document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh({announce:true})});setInterval(()=>refresh({announce:true}),45000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
