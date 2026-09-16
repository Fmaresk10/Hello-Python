(() => {
  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  if(page!=='admin.html'||window.__cafassoAdminAlmitasGiftsV2Installed)return;
  window.__cafassoAdminAlmitasGiftsV2Installed=true;

  const API='https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoAdmin';
  const GIFT_COURSE='__cafasso_admin_gifts__';
  const ROOT='cafassoAdminAlmitasGiftV2';
  const STYLE='cafassoAdminAlmitasGiftV2Styles';
  let data=null,busy=false;

  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const json=(storage,key)=>{try{return JSON.parse(storage.getItem(key)||'null')}catch(e){return null}};
  const currentUser=()=>json(localStorage,'cafassoSession')?.user||{};
  const isAdmin=()=>String(currentUser().role||'').toLowerCase().includes('admin');

  function styles(){
    if(document.getElementById(STYLE))return;
    const s=document.createElement('style');s.id=STYLE;s.textContent=`
      .cafasso-gift-trigger{position:relative}.cafasso-gift-modal{position:fixed;inset:0;z-index:2147483500;display:grid;place-items:center;padding:20px;background:rgba(9,25,43,.54);backdrop-filter:blur(5px)}.cafasso-gift-modal[hidden]{display:none!important}
      .cafasso-gift-sheet{width:min(590px,95vw);max-height:90vh;overflow:auto;padding:25px;border:1px solid #E8DCCB;border-radius:24px;background:#FFFDF9;box-shadow:0 30px 90px rgba(10,25,45,.28);color:#11233A;font-family:Inter,system-ui,sans-serif}.cafasso-gift-head{display:flex;justify-content:space-between;gap:16px}.cafasso-gift-head small{display:block;color:#B77D00;font-size:10px;font-weight:900;letter-spacing:.14em;text-transform:uppercase}.cafasso-gift-head h2{margin:6px 0 5px;color:#0F2D4D;font:32px/1 Georgia,serif}.cafasso-gift-head p{margin:0;color:#687386;font-size:12px;line-height:1.45}.cafasso-gift-close{width:38px;height:38px;border:0;border-radius:50%;background:#F3EEE6;color:#0F2D4D;font-size:23px;cursor:pointer;flex:0 0 auto}
      .cafasso-gift-grid{display:grid;grid-template-columns:1.25fr .75fr;gap:12px}.cafasso-gift-field{margin-top:17px}.cafasso-gift-field label{display:block;margin-bottom:6px;color:#0F2D4D;font-size:11px;font-weight:900}.cafasso-gift-field input,.cafasso-gift-field select,.cafasso-gift-field textarea{width:100%;padding:12px 13px;border:1px solid #E8DCCB;border-radius:12px;background:#fff;color:#11233A;font:inherit}.cafasso-gift-field textarea{min-height:90px;resize:vertical}.cafasso-gift-current{margin-top:12px;padding:11px 13px;border:1px solid #E8DCCB;border-radius:13px;background:#FBF7F0;color:#687386;font-size:11px;line-height:1.4}.cafasso-gift-current b{color:#0F2D4D}.cafasso-gift-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:20px}.cafasso-gift-btn{border:0;border-radius:12px;padding:11px 14px;background:#F2C94C;color:#0F2D4D;font-weight:900;cursor:pointer}.cafasso-gift-btn.alt{background:#fff;border:1px solid #E8DCCB}.cafasso-gift-btn:disabled{opacity:.55}.cafasso-gift-note{margin-top:13px;color:#856200;font-size:10px;line-height:1.45}.cafasso-gift-ok,.cafasso-gift-error{margin-top:14px;padding:11px 13px;border-radius:13px;font-size:12px;font-weight:750}.cafasso-gift-ok{border:1px solid #BFD9C9;background:#EDF5F1;color:#2E6A50}.cafasso-gift-error{border:1px solid #EBC7C7;background:#FFF3F3;color:#A64747}
      @media(max-width:700px){.cafasso-gift-modal{align-items:end;padding:10px}.cafasso-gift-sheet{border-radius:24px 24px 16px 16px;padding:20px}.cafasso-gift-grid{grid-template-columns:1fr}.cafasso-gift-actions{display:grid;grid-template-columns:1fr}.cafasso-gift-btn{width:100%;min-height:46px}}
    `;document.head.appendChild(s);
  }

  async function load(){
    const r=await fetch(API,{cache:'no-store'}),j=await r.json().catch(()=>({}));
    if(!r.ok||j?.ok===false)throw new Error(j?.error||'No se pudo cargar la administración.');
    data=j;return j;
  }
  function rows(userId){return (data?.submissions||[]).filter(s=>String(s.userId||'')===String(userId)&&String(s.courseId||'')===GIFT_COURSE&&String(s.status||'')==='Aprobada'&&Number(s.rewardAlmitas||0)>0)}
  function currentText(userId){const list=rows(userId),total=list.reduce((n,s)=>n+Number(s.rewardAlmitas||0),0);return total?`Ya recibió <b>${total} Almitas</b> en ${list.length} regalo${list.length===1?'':'s'} administrativo${list.length===1?'':'s'}.`:'Todavía no recibió Almitas regaladas por administración.'}
  function updateCurrent(){const u=document.getElementById('giftUser'),box=document.getElementById('giftCurrent');if(u&&box)box.innerHTML=currentText(u.value)}
  function close(){const root=document.getElementById(ROOT);if(root)root.hidden=true}

  async function open(){
    if(!isAdmin())return;styles();
    let root=document.getElementById(ROOT);if(!root){root=document.createElement('div');root.id=ROOT;root.className='cafasso-gift-modal';root.hidden=true;document.body.appendChild(root);root.addEventListener('click',e=>{if(e.target===root)close()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!root.hidden)close()})}
    root.hidden=false;root.innerHTML='<section class="cafasso-gift-sheet"><div class="cafasso-gift-head"><div><small>Administración · Almitas</small><h2>Regalar Almitas</h2><p>Cargando personas…</p></div><button class="cafasso-gift-close">×</button></div></section>';root.querySelector('.cafasso-gift-close').onclick=close;
    try{
      const fresh=await load(),users=(fresh.users||[]).filter(u=>u?._id).sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'es'));
      root.innerHTML=`<section class="cafasso-gift-sheet" role="dialog" aria-modal="true"><div class="cafasso-gift-head"><div><small>Administración · Almitas</small><h2>Regalar Almitas</h2><p>Elegí a cualquier persona de CAFASSO, definí la cantidad y, si querés, dejá el motivo.</p></div><button class="cafasso-gift-close" aria-label="Cerrar">×</button></div><div class="cafasso-gift-grid"><div class="cafasso-gift-field"><label>Persona</label><select id="giftUser">${users.map(u=>`<option value="${esc(u._id)}">${esc(u.name||u.email)} · ${esc(u.role||'Animador')}</option>`).join('')}</select></div><div class="cafasso-gift-field"><label>Cantidad</label><input id="giftAmount" type="number" min="1" max="10000" step="1" inputmode="numeric" placeholder="50"></div></div><div id="giftCurrent" class="cafasso-gift-current"></div><div class="cafasso-gift-field"><label>Motivo <span style="font-weight:600;color:#687386">(opcional)</span></label><textarea id="giftReason" maxlength="240" placeholder="Ej.: Por la disponibilidad en el servicio…"></textarea></div><div id="giftMessage"></div><div class="cafasso-gift-note">Se suma al total real de Almitas y puede hacer avanzar de etapa. No modifica desafíos, RUAH ni Huellas.</div><div class="cafasso-gift-actions"><button class="cafasso-gift-btn alt" id="giftCancel">Cancelar</button><button class="cafasso-gift-btn" id="giftSave">Regalar Almitas</button></div></section>`;
      root.querySelector('.cafasso-gift-close').onclick=close;document.getElementById('giftCancel').onclick=close;document.getElementById('giftUser').onchange=updateCurrent;document.getElementById('giftSave').onclick=save;updateCurrent();setTimeout(()=>document.getElementById('giftAmount')?.focus(),60);
    }catch(error){root.innerHTML=`<section class="cafasso-gift-sheet"><div class="cafasso-gift-error">${esc(error.message)}</div></section>`}
  }

  async function save(){
    if(busy)return;const userId=String(document.getElementById('giftUser')?.value||''),amount=Math.round(Number(document.getElementById('giftAmount')?.value||0)),reason=String(document.getElementById('giftReason')?.value||'').trim().slice(0,240),target=(data?.users||[]).find(u=>String(u._id)===userId),msg=document.getElementById('giftMessage'),btn=document.getElementById('giftSave');
    if(!target)return alert('Elegí una persona válida.');if(!Number.isFinite(amount)||amount<1||amount>10000)return alert('Ingresá una cantidad entre 1 y 10.000 Almitas.');if(!confirm(`¿Regalar ${amount} Almitas a ${target.name||target.email}?${reason?`\n\nMotivo: ${reason}`:''}`))return;
    busy=true;if(btn){btn.disabled=true;btn.textContent='Regalando…'};if(msg)msg.innerHTML='';
    try{const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'giftAlmitas',userId,amount,reason})}),j=await r.json().catch(()=>({}));if(!r.ok||j?.ok===false)throw new Error(j?.error||'No se pudo acreditar el regalo.');data=j;updateCurrent();document.getElementById('giftAmount').value='';document.getElementById('giftReason').value='';if(msg)msg.innerHTML=`<div class="cafasso-gift-ok">✓ ${amount} Almitas acreditadas a ${esc(target.name||target.email)}.${reason?` · ${esc(reason)}`:''}</div>`}catch(error){if(msg)msg.innerHTML=`<div class="cafasso-gift-error">${esc(error.message)}</div>`}finally{busy=false;if(btn){btn.disabled=false;btn.textContent='Regalar Almitas'}}
  }

  function trigger(){const b=document.createElement('button');b.type='button';b.className='cafasso-gift-trigger primary';b.textContent='✦ Regalar Almitas';b.onclick=open;return b}
  function mount(){if(!isAdmin())return false;styles();const quick=document.querySelector('.adm2-quick');if(quick&&!quick.querySelector('.cafasso-gift-trigger')){quick.insertBefore(trigger(),quick.lastElementChild||null);return true}return false}
  function boot(){if(!isAdmin())return;let n=0;const wait=()=>{mount();if(n++<60&&!document.querySelector('.adm2-quick'))setTimeout(wait,120)};wait();new MutationObserver(mount).observe(document.body,{childList:true,subtree:true})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
