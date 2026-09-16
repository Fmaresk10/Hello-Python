(() => {
  if (window.__cafassoAlmitasHistoryV2Installed) return;
  window.__cafassoAlmitasHistoryV2Installed = true;

  const STYLE_ID = 'cafassoAlmitasHistoryV2Styles';
  const MAX = 40;
  const VISIBLE = 5;
  let snapshot = null;

  function json(storage, key) { try { return JSON.parse(storage.getItem(key) || 'null'); } catch (e) { return null; } }
  function user() { return json(localStorage, 'cafassoSession')?.user || {}; }
  function userKey() { const u = user(); return String(u?._id || u?.id || u?.email || u?.name || 'local'); }
  function key() { return `cafasso-almitas-ledger-v1:${userKey()}`; }

  function normalize(raw) {
    const source = raw && typeof raw === 'object' ? raw : {};
    const seen = new Set();
    const entries = (Array.isArray(source.entries) ? source.entries : [])
      .map(e => ({ id:String(e?.id || ''), amount:Number(e?.amount || 0), source:String(e?.source || 'Movimiento'), detail:String(e?.detail || ''), at:String(e?.at || ''), fingerprint:String(e?.fingerprint || '') }))
      .filter(e => e.id && Number.isFinite(e.amount) && e.at)
      .sort((a,b) => new Date(b.at)-new Date(a.at))
      .filter(e => { const k=e.fingerprint||e.id; if(seen.has(k)) return false; seen.add(k); return true; })
      .slice(0, MAX);
    return { version:2, entries, updatedAt:String(source.updatedAt || '') };
  }
  function read() { return normalize(json(localStorage, key())); }
  function write(state) { const clean=normalize(state); try { localStorage.setItem(key(), JSON.stringify(clean)); } catch(e) {} return clean; }
  function id(prefix) { return `${prefix}:${Date.now()}:${Math.random().toString(36).slice(2,8)}`; }

  function add({ amount, source, detail='', fingerprint='' }) {
    const n = Number(amount || 0); if (!Number.isFinite(n) || n === 0) return false;
    const state = read(); if (fingerprint && state.entries.some(e => e.fingerprint === fingerprint)) return false;
    state.entries.unshift({ id:id(source.toLowerCase().replace(/[^a-z0-9]+/g,'-')), amount:n, source, detail, at:new Date().toISOString(), fingerprint });
    state.updatedAt = new Date().toISOString();
    write(state); render();
    return true;
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      .cafasso-almitas-history{position:relative;margin:0 7px 16px;padding:15px 16px;border:1px solid rgba(114,77,42,.22);background:rgba(255,250,237,.23);color:#4c3a2b}.cafasso-almitas-history__head{display:flex;justify-content:space-between;gap:12px;margin-bottom:10px}.cafasso-almitas-history__head strong{font:600 18px/1 Georgia,serif}.cafasso-almitas-history__head small{color:#91704f;font:800 8px/1 Inter,system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase}.cafasso-almitas-history__list{display:grid;gap:7px}.cafasso-almitas-move{display:grid;grid-template-columns:52px minmax(0,1fr) auto;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid rgba(114,77,42,.12)}.cafasso-almitas-move:last-child{border-bottom:0}.cafasso-almitas-move__amount{font:800 15px/1 Inter,system-ui,sans-serif;color:#8a5c30}.cafasso-almitas-move__copy strong{display:block;font:800 10px/1.2 Inter,system-ui,sans-serif;color:#5b4430}.cafasso-almitas-move__copy span{display:block;margin-top:2px;color:#8a725b;font:10px/1.3 Inter,system-ui,sans-serif}.cafasso-almitas-move__when{color:#9a856f;font:9px/1.2 Inter,system-ui,sans-serif;white-space:nowrap}.cafasso-almitas-history__empty{color:#8a725b;font:11px/1.4 Inter,system-ui,sans-serif;padding:4px 0}
    `;document.head.appendChild(s);
  }

  function fmt(iso){const d=new Date(iso);if(!Number.isFinite(d.getTime()))return'';const now=new Date(),time=d.toLocaleTimeString('es-UY',{hour:'2-digit',minute:'2-digit'});if(d.toDateString()===now.toDateString())return`Hoy · ${time}`;return`${d.toLocaleDateString('es-UY',{day:'2-digit',month:'2-digit'})} · ${time}`}
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  function render(){ensureStyles();const anchor=document.querySelector('[data-cafasso-level-panel]')||document.querySelector('[data-cafasso-huellas-summary]')||document.querySelector('.cafasso-profile-path');if(!anchor)return false;let root=document.querySelector('[data-cafasso-almitas-history]');if(!root){root=document.createElement('section');root.className='cafasso-almitas-history';root.dataset.cafassoAlmitasHistory='1';anchor.insertAdjacentElement('afterend',root)}const entries=read().entries.slice(0,VISIBLE);root.innerHTML=`<div class="cafasso-almitas-history__head"><strong>Movimientos de Almitas</strong><small>últimos ${VISIBLE}</small></div><div class="cafasso-almitas-history__list">${entries.length?entries.map(e=>`<div class="cafasso-almitas-move"><div class="cafasso-almitas-move__amount">${e.amount>0?'+':''}${e.amount}</div><div class="cafasso-almitas-move__copy"><strong>${esc(e.source)}</strong><span>${esc(e.detail||'Movimiento registrado')}</span></div><div class="cafasso-almitas-move__when">${fmt(e.at)}</div></div>`).join(''):'<div class="cafasso-almitas-history__empty">Los próximos cambios de Almitas van a quedar registrados acá.</div>'}</div>`;return true}

  function handle(metrics){if(!metrics)return;const next={challenges:Number(metrics.challenges||0),ruah:Number(metrics.ruah||0),huellas:Number(metrics.huellas||0)};if(!snapshot){snapshot=next;return}const dc=next.challenges-snapshot.challenges,dr=next.ruah-snapshot.ruah,dh=next.huellas-snapshot.huellas;if(dc)add({amount:dc,source:dc>0?'Desafío aprobado':'Ajuste de desafío',detail:dc>0?'Recompensa acreditada por una entrega.':'Se ajustó el saldo de desafíos.',fingerprint:`challenge:${next.challenges}:${dc}`});if(dr)add({amount:dr,source:'RUAH',detail:dr>0?'Bonificación por constancia.':'Ajuste de bonificación RUAH.',fingerprint:`ruah:${next.ruah}:${dr}`});if(dh)add({amount:dh,source:'Huella',detail:dh>0?'Nueva Huella recompensada.':'Ajuste de Huellas.',fingerprint:`huellas:${next.huellas}:${dh}`});snapshot=next}

  function boot(){ensureStyles();let tries=0;const mount=()=>{if(render())return;if(tries++<50)setTimeout(mount,100)};mount();const current=window.CafassoAlmitasMetrics;if(current)snapshot={challenges:Number(current.challenges||0),ruah:Number(current.ruah||0),huellas:Number(current.huellas||0)};window.addEventListener('cafasso:almitas-total',e=>{handle(e?.detail||{});setTimeout(render,40)});window.addEventListener('cafasso:admin-gifts',()=>setTimeout(render,120));setInterval(render,2500)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
