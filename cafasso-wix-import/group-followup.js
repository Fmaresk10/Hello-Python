// CAFASSO deploy marker: group-followup-v1
(function(){
  function ready(fn){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn);else fn();}
  function safeEsc(v=''){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
  function isInternalNote(s){return s&&String(s.courseId||'').startsWith('__cafasso_');}
  function memberProgress(user){try{return typeof progressForUser==='function'?Number(progressForUser(user._id)||0):Number(user.progressPercent||0);}catch{return Number(user.progressPercent||0);}}
  function pendingFor(user){const rows=((window.state&&state.submissions)||[]).filter(s=>!isInternalNote(s)&&s.userId===user._id);return rows.filter(s=>!s.status||s.status==='Pendiente'||s.status==='En revisión'||s.status==='Rehacer');}
  function daysSince(v){if(!v)return null;const d=new Date(v);if(Number.isNaN(d.getTime()))return null;return Math.floor((Date.now()-d.getTime())/86400000);}
  function injectStyles(){if(document.getElementById('cafasso-followup-style'))return;const st=document.createElement('style');st.id='cafasso-followup-style';st.textContent=`
    .followup-wrap{margin-top:11px}.followup-head{display:flex;justify-content:space-between;gap:7px;align-items:end;margin-bottom:13px}.followup-head h3{margin:0;font:500 22px Georgia,serif;color:#30473e}.followup-head p{margin:4px 0 0;color:var(--muted);font-size:10px}.followup-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.follow-card{padding:12px;border-radius:6px;border:1px solid #d8ccb7;background:#fffaf0}.follow-card.attn{background:#f3ead2;border-color:#dac37c}.follow-card.warn{background:#f5e7e3;border-color:#d9b6ad}.follow-card.ok{background:#e8f0eb;border-color:#c4d6cb}.follow-top{display:flex;justify-content:space-between;gap:10px;align-items:center}.follow-top strong{color:#30473e;font-size:11px}.follow-count{font:500 24px Georgia,serif;color:#30473e}.follow-list{display:grid;gap:7px;margin-top:10px}.follow-person{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-top:7px;border-top:1px solid rgba(15,45,77,.09)}.follow-person:first-child{border-top:0}.follow-person a{font-weight:800;color:#3b554b;text-decoration:none;font-size:10px}.follow-person small{color:var(--muted);text-align:right}.follow-empty{margin-top:10px;color:var(--muted);font-size:12px}.follow-actions{margin-top:9px}.follow-actions a{font-size:11px;font-weight:800;color:var(--navy);text-decoration:none}@media(max-width:950px){.followup-grid{grid-template-columns:1fr}}`;
    document.head.appendChild(st);
  }
  function renderFollowup(){
    if(!window.state||!window.members)return;
    injectStyles();
    let host=document.getElementById('cafassoFollowup');
    if(!host){host=document.createElement('section');host.id='cafassoFollowup';host.className='card box followup-wrap';const grid=document.querySelector('.grid');if(grid&&grid.parentNode)grid.parentNode.insertBefore(host,grid);else document.querySelector('main')?.appendChild(host);}
    const active=(members||[]).filter(u=>u.status==='Activo'||!u.status);
    const notStarted=active.filter(u=>memberProgress(u)===0);
    const lowProgress=active.filter(u=>{const p=memberProgress(u);return p>0&&p<35;}).sort((a,b)=>memberProgress(a)-memberProgress(b));
    const withPending=active.map(u=>({u,rows:pendingFor(u)})).filter(x=>x.rows.length).sort((a,b)=>b.rows.length-a.rows.length);
    const recentOk=active.filter(u=>memberProgress(u)>=35&&!pendingFor(u).length);
    const person=(u,meta)=>`<div class="follow-person"><a href="./animador.html?id=${encodeURIComponent(u._id)}">${safeEsc(u.name||u.email||'Animador')}</a><small>${safeEsc(meta)}</small></div>`;
    host.innerHTML=`
      <div class="followup-head"><div><h3>Seguimiento del grupo</h3><p>Alertas automáticas para detectar a quién conviene acompañar primero.</p></div><span class="badge ${notStarted.length||lowProgress.length||withPending.length?'gold':''}">${notStarted.length+lowProgress.length+withPending.length} alertas</span></div>
      <div class="followup-grid">
        <article class="follow-card attn"><div class="follow-top"><strong>Sin empezar</strong><span class="follow-count">${notStarted.length}</span></div><div class="follow-list">${notStarted.slice(0,5).map(u=>person(u,u.lastAccess?`Último acceso: ${daysSince(u.lastAccess)??'—'} días`:'Nunca ingresó')).join('')||'<div class="follow-empty">Todos comenzaron su recorrido.</div>'}</div>${notStarted.length>5?`<div class="follow-actions"><a href="#">+ ${notStarted.length-5} más</a></div>`:''}</article>
        <article class="follow-card warn"><div class="follow-top"><strong>Avance bajo</strong><span class="follow-count">${lowProgress.length}</span></div><div class="follow-list">${lowProgress.slice(0,5).map(u=>person(u,`${memberProgress(u)}% de progreso`)).join('')||'<div class="follow-empty">No hay animadores con avance bajo.</div>'}</div>${lowProgress.length>5?`<div class="follow-actions"><a href="#">+ ${lowProgress.length-5} más</a></div>`:''}</article>
        <article class="follow-card ${withPending.length?'warn':'ok'}"><div class="follow-top"><strong>Entregas a revisar</strong><span class="follow-count">${withPending.length}</span></div><div class="follow-list">${withPending.slice(0,5).map(x=>person(x.u,`${x.rows.length} pendiente${x.rows.length===1?'':'s'}`)).join('')||'<div class="follow-empty">No hay entregas pendientes en este grupo.</div>'}</div>${withPending.length?`<div class="follow-actions"><a href="./entregas.html">Abrir entregas →</a></div>`:`<div class="follow-actions"><span style="font-size:11px;color:var(--green);font-weight:800">${recentOk.length} animadores al día</span></div>`}</article>
      </div>`;
  }
  ready(function(){
    const oldRender=window.render;
    if(typeof oldRender==='function')window.render=function(){const r=oldRender.apply(this,arguments);setTimeout(renderFollowup,0);return r;};
    setTimeout(renderFollowup,400);
    setTimeout(renderFollowup,1200);
  });
})();
