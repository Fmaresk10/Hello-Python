(()=>{
  const API='https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoAdmin';
  if(!location.pathname.toLowerCase().endsWith('/formador.html')&&!location.pathname.toLowerCase().endsWith('formador.html'))return;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const pct=(state,userId)=>{const rows=(state.progress||[]).filter(p=>p.userId===userId);return rows.length?Math.round(rows.reduce((a,p)=>a+Number(p.percent||0),0)/rows.length):0};
  function installStyles(){if(document.getElementById('cafassoFormadorFollowupStyles'))return;const s=document.createElement('style');s.id='cafassoFormadorFollowupStyles';s.textContent=`
    .formador-followup{padding:22px;margin-top:18px}.formador-followup-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:15px}.formador-followup-head h3{margin:0;font:25px Georgia,serif;color:var(--navy)}.formador-followup-head p{margin:5px 0 0;color:var(--muted);font-size:13px}.formador-followup-search{width:min(360px,100%);padding:10px 12px;border:1px solid var(--line);border-radius:11px;background:#fff;font:inherit}.formador-followup-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.formador-person{border:1px solid var(--line);background:#fff;border-radius:15px;padding:14px;text-decoration:none;color:var(--ink);display:block}.formador-person:hover{border-color:#D9BE67;background:#FFFDF5}.formador-person strong{display:block;color:var(--navy);font-size:14px}.formador-person small{display:block;color:var(--muted);margin-top:4px}.formador-person-meta{display:flex;justify-content:space-between;gap:8px;margin-top:10px;font-size:11px;color:var(--muted)}.formador-person .mini-progress{margin-top:8px}.formador-followup-empty{padding:24px;text-align:center;color:var(--muted);grid-column:1/-1}
    @media(max-width:1000px){.formador-followup-grid{grid-template-columns:1fr 1fr}}@media(max-width:650px){.formador-followup-head{flex-direction:column}.formador-followup-search{width:100%;font-size:16px}.formador-followup-grid{grid-template-columns:1fr}}
  `;document.head.appendChild(s)}
  function render(section,state,q=''){
    const needle=String(q||'').trim().toLowerCase();
    const users=(state.users||[]).filter(u=>String(u.role||'Animador').toLowerCase().includes('animador')&&!['Bloqueado','Inactivo'].includes(String(u.status||''))).filter(u=>!needle||`${u.name||''} ${u.email||''} ${u.groupName||''}`.toLowerCase().includes(needle)).sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'es'));
    const box=section.querySelector('[data-followup-grid]');
    box.innerHTML=users.length?users.map(u=>{const p=pct(state,u._id);return `<a class="formador-person" href="./animador.html?id=${encodeURIComponent(u._id)}"><strong>${esc(u.name||'Animador')}</strong><small>${esc(u.groupName||'Sin grupo')} · ${esc(u.email||'')}</small><div class="mini-progress"><span style="width:${Math.max(0,Math.min(100,p))}%"></span></div><div class="formador-person-meta"><span>${p}% promedio</span><span>Ver ficha →</span></div></a>`}).join(''):'<div class="formador-followup-empty">No encontramos animadores con esa búsqueda.</div>';
  }
  async function init(){
    installStyles();
    const courseBox=document.querySelector('section.card.box');
    if(!courseBox||document.getElementById('cafassoFormadorFollowup'))return;
    const section=document.createElement('section');section.id='cafassoFormadorFollowup';section.className='card formador-followup';section.innerHTML=`<div class="formador-followup-head"><div><h3>Seguimiento de animadores</h3><p>Accedé a progreso, entregas y notas internas de acompañamiento sin permisos de administración.</p></div><input class="formador-followup-search" type="search" placeholder="Buscar animador o grupo…" aria-label="Buscar animador"></div><div class="formador-followup-grid" data-followup-grid><div class="formador-followup-empty">Cargando animadores…</div></div>`;
    courseBox.parentNode.insertBefore(section,courseBox);
    try{const r=await fetch(API,{cache:'no-store'}),j=await r.json();if(!r.ok||!j.ok)throw new Error(j.error||'No se pudo cargar');render(section,j);section.querySelector('input').addEventListener('input',e=>render(section,j,e.target.value));}
    catch(e){section.querySelector('[data-followup-grid]').innerHTML='<div class="formador-followup-empty">No pudimos cargar los animadores ahora.</div>'}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
