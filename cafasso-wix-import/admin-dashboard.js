(()=>{
  const API='https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoAdmin';
  const STYLE_ID='cafassoAdminDashboardV2Styles';
  const ROOT_ID='cafassoAdminDashboardV2';
  const DAY=86400000;
  const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const when=v=>{if(!v)return 'Nunca';const d=new Date(v);if(Number.isNaN(d.getTime()))return '—';const diff=Date.now()-d.getTime();if(diff<60000)return 'Recién';if(diff<3600000)return `Hace ${Math.max(1,Math.floor(diff/60000))} min`;if(diff<DAY)return `Hace ${Math.max(1,Math.floor(diff/3600000))} h`;if(diff<7*DAY)return `Hace ${Math.max(1,Math.floor(diff/DAY))} días`;return d.toLocaleDateString('es-UY',{day:'2-digit',month:'2-digit'});};
  const initials=name=>{const p=String(name||'').trim().split(/\s+/);return ((p[0]?.[0]||'A')+(p[1]?.[0]||'')).toUpperCase();};

  function ensureStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #${ROOT_ID}{margin-top:16px}
      .adm2-quick{display:flex;gap:9px;flex-wrap:wrap;margin:0 0 18px}.adm2-quick a,.adm2-quick button{border:1px solid var(--line);background:#fff;color:var(--navy);border-radius:13px;padding:11px 14px;text-decoration:none;font:800 12px Inter,system-ui;cursor:pointer}.adm2-quick .primary{background:var(--gold);border-color:var(--gold)}
      .adm2-attention{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:18px}.adm2-attention-card{background:#fff;border:1px solid var(--line);border-radius:18px;padding:16px;text-decoration:none;color:var(--ink);display:block;transition:.15s transform,.15s box-shadow}.adm2-attention-card:hover{transform:translateY(-1px);box-shadow:0 10px 22px rgba(15,45,77,.08)}.adm2-attention-card strong{display:block;font:29px Georgia,serif;color:var(--navy);margin-bottom:4px}.adm2-attention-card b{display:block;color:var(--navy);font-size:13px}.adm2-attention-card small{display:block;color:var(--muted);margin-top:4px;line-height:1.35}.adm2-attention-card.warn{background:#FFF9E7;border-color:#ECD88F}.adm2-attention-card.urgent{background:#FFF5F2;border-color:#EBC7BE}
      .adm2-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}.adm2-box{background:var(--card);border:1px solid var(--line);border-radius:22px;padding:20px;box-shadow:0 9px 24px rgba(25,37,54,.05)}.adm2-title{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:13px}.adm2-title h3{font:25px Georgia,serif;color:var(--navy);margin:0}.adm2-title p{margin:4px 0 0;color:var(--muted);font-size:12px;line-height:1.4}.adm2-list{display:grid;gap:8px}.adm2-row{display:grid;grid-template-columns:42px minmax(0,1fr) auto;gap:11px;align-items:center;padding:11px 0;border-bottom:1px solid #EEE6DB}.adm2-row:last-child{border-bottom:0}.adm2-avatar{width:42px;height:42px;border-radius:50%;background:#FFF1B8;color:var(--navy);display:grid;place-items:center;font-weight:900}.adm2-row strong{display:block;color:var(--navy);font-size:13px}.adm2-row small{display:block;color:var(--muted);margin-top:3px;line-height:1.35}.adm2-side{text-align:right;white-space:nowrap}.adm2-side b{display:block;color:var(--navy);font-size:13px}.adm2-side small{font-size:10px}.adm2-progress{height:6px;background:#EEE6DB;border-radius:999px;overflow:hidden;margin-top:7px}.adm2-progress span{height:100%;display:block;background:var(--green);border-radius:999px}.adm2-empty{padding:24px 8px;text-align:center;color:var(--muted);font-size:13px}.adm2-pill{display:inline-block;padding:5px 8px;border-radius:999px;background:#FFF4CC;color:#856200;font-size:10px;font-weight:800}.adm2-pill.green{background:#EDF5F1;color:var(--green)}.adm2-footer{margin-top:12px}.adm2-footer a{font-size:11px;font-weight:800;color:var(--navy);text-decoration:none}
      #resumen>.grid{display:none!important}
      @media(max-width:1050px){.adm2-attention{grid-template-columns:1fr 1fr}.adm2-grid{grid-template-columns:1fr}}
      @media(max-width:700px){#${ROOT_ID}{margin-top:12px}.adm2-quick{display:grid;grid-template-columns:1fr 1fr;gap:8px}.adm2-quick a,.adm2-quick button{min-height:46px;padding:11px}.adm2-attention{grid-template-columns:1fr 1fr;gap:9px}.adm2-attention-card{padding:14px}.adm2-attention-card strong{font-size:26px}.adm2-grid{gap:11px}.adm2-box{padding:16px;border-radius:18px}.adm2-title h3{font-size:22px}.adm2-row{grid-template-columns:38px minmax(0,1fr);gap:9px}.adm2-avatar{width:38px;height:38px}.adm2-side{grid-column:2;text-align:left;display:flex;gap:7px;align-items:center}.adm2-side b{display:inline}.adm2-quick .wide{grid-column:1/-1}}
    `;
    document.head.appendChild(style);
  }

  function assignedPairs(data,animators){
    const courses=(data.courses||[]).filter(c=>c.status==='Publicado');
    const assignments=(data.assignments||[]).filter(a=>a.active!==false);
    const progress=data.progress||[];
    const rows=[];
    animators.forEach(u=>{
      const ids=new Set();
      assignments.forEach(a=>{
        if(a.targetType==='user'&&String(a.targetId)===String(u._id))ids.add(String(a.courseId));
        if(a.targetType==='group'&&u.groupId&&String(a.targetId)===String(u.groupId))ids.add(String(a.courseId));
      });
      courses.filter(c=>ids.has(String(c._id))).forEach(c=>{
        const p=progress.find(x=>String(x.userId)===String(u._id)&&String(x.courseId)===String(c._id));
        rows.push({user:u,course:c,percent:Number(p?.percent||0)});
      });
    });
    return rows;
  }

  function personRow(u,meta,side=''){
    return `<div class="adm2-row"><div class="adm2-avatar">${initials(u.name)}</div><div><strong>${esc(u.name||'Animador')}</strong><small>${esc(meta||u.groupName||'Sin grupo')}</small></div><div class="adm2-side">${side}</div></div>`;
  }

  function render(data){
    const root=document.getElementById(ROOT_ID);if(!root)return;
    const users=(data.users||[]);
    const animators=users.filter(u=>String(u.role||'').toLowerCase().includes('animador')&&!['Bloqueado','Inactivo'].includes(String(u.status||'')));
    const never=animators.filter(u=>!u.lastAccess);
    const inactive=animators.filter(u=>u.lastAccess&&(Date.now()-new Date(u.lastAccess).getTime())>14*DAY);
    const pairs=assignedPairs(data,animators);
    const low=pairs.filter(x=>x.percent<50).sort((a,b)=>a.percent-b.percent||String(a.user.name).localeCompare(String(b.user.name),'es'));
    const pending=(data.submissions||[]).filter(s=>!s.status||['Pendiente','En revisión'].includes(s.status)).sort((a,b)=>new Date(a._createdDate||a._updatedDate||0)-new Date(b._createdDate||b._updatedDate||0));
    const recent=(data.submissions||[]).slice().sort((a,b)=>new Date(b._updatedDate||b._createdDate||0)-new Date(a._updatedDate||a._createdDate||0));

    const pendingRows=pending.slice(0,5).map(s=>{
      const u=users.find(x=>String(x._id)===String(s.userId))||{name:s.userName||'Animador',groupName:s.groupName||''};
      return personRow(u,`${s.courseTitle||'Curso'} · ${s.type||'Entrega'}`,`<span class="adm2-pill">${esc(s.status||'Pendiente')}</span><small>${when(s._createdDate||s._updatedDate)}</small>`);
    }).join('');

    const lowRows=low.slice(0,6).map(x=>`<div class="adm2-row"><div class="adm2-avatar">${initials(x.user.name)}</div><div><strong>${esc(x.user.name)}</strong><small>${esc(x.course.title)} · ${esc(x.user.groupName||'Sin grupo')}</small><div class="adm2-progress"><span style="width:${Math.max(0,Math.min(100,x.percent))}%"></span></div></div><div class="adm2-side"><b>${x.percent}%</b><small>avance</small></div></div>`).join('');

    const neverRows=never.slice(0,6).map(u=>personRow(u,u.groupName||'Sin grupo',`<b>Nunca</b><small>ingresó</small>`)).join('');
    const recentRows=recent.slice(0,6).map(s=>{
      const u=users.find(x=>String(x._id)===String(s.userId))||{name:s.userName||'Animador'};
      const good=s.status==='Aprobada';
      return personRow(u,`${s.courseTitle||'Curso'} · ${s.type||'Actividad'}`,`<span class="adm2-pill ${good?'green':''}">${esc(s.status||'Pendiente')}</span><small>${when(s._updatedDate||s._createdDate)}</small>`);
    }).join('');

    root.innerHTML=`
      <div class="adm2-quick">
        <a class="primary" href="./animadores.html">＋ Nuevo animador</a>
        <a href="./asignaciones.html">↗ Asignar formación</a>
        <a href="./entregas.html">📥 Revisar entregas</a>
        <a href="./curso-editor.html">＋ Crear curso</a>
        <button class="wide" id="adm2PreviewUser">👁 Ver como un animador</button>
      </div>
      <div class="adm2-attention">
        <a class="adm2-attention-card ${pending.length?'urgent':''}" href="./entregas.html"><strong>${pending.length}</strong><b>Entregas por atender</b><small>Pendientes o en revisión.</small></a>
        <a class="adm2-attention-card ${never.length?'warn':''}" href="./animadores.html"><strong>${never.length}</strong><b>Todavía no ingresaron</b><small>Animadores sin primer acceso.</small></a>
        <a class="adm2-attention-card ${inactive.length?'warn':''}" href="./animadores.html"><strong>${inactive.length}</strong><b>Sin actividad reciente</b><small>Más de 14 días sin entrar.</small></a>
        <a class="adm2-attention-card ${low.length?'warn':''}" href="./reportes.html"><strong>${low.length}</strong><b>Procesos debajo de 50%</b><small>Curso–animador que requieren seguimiento.</small></a>
      </div>
      <div class="adm2-grid">
        <section class="adm2-box"><div class="adm2-title"><div><h3>Para corregir</h3><p>Las entregas más antiguas aparecen primero.</p></div><a class="tiny" href="./entregas.html">Ver todas</a></div><div class="adm2-list">${pendingRows||'<div class="adm2-empty">No hay entregas esperando revisión. ✓</div>'}</div></section>
        <section class="adm2-box"><div class="adm2-title"><div><h3>Necesitan seguimiento</h3><p>Recorridos publicados con menos de 50% de avance.</p></div><a class="tiny" href="./reportes.html">Reportes</a></div><div class="adm2-list">${lowRows||'<div class="adm2-empty">No hay procesos por debajo del 50%. ✓</div>'}</div></section>
      </div>
      <div class="adm2-grid">
        <section class="adm2-box"><div class="adm2-title"><div><h3>Todavía no ingresaron</h3><p>Usuarios animadores que nunca registraron acceso.</p></div><a class="tiny" href="./animadores.html">Gestionar</a></div><div class="adm2-list">${neverRows||'<div class="adm2-empty">Todos los animadores ya ingresaron al menos una vez. ✓</div>'}</div></section>
        <section class="adm2-box"><div class="adm2-title"><div><h3>Actividad reciente</h3><p>Últimos movimientos de entregas en CAFASSO.</p></div><a class="tiny" href="./entregas.html">Entregas</a></div><div class="adm2-list">${recentRows||'<div class="adm2-empty">Todavía no hay actividad registrada.</div>'}</div></section>
      </div>`;

    const preview=document.getElementById('adm2PreviewUser');
    if(preview)preview.onclick=()=>window.CafassoRolePreview?.openUserPicker?.()||window.CafassoRolePreview?.open?.();
  }

  async function loadDashboard(){
    const resumen=document.getElementById('resumen');if(!resumen||document.getElementById(ROOT_ID))return;
    ensureStyles();
    const head=document.querySelector('.head p');if(head)head.textContent='Lo que requiere tu atención hoy y el panorama general de CAFASSO.';
    const root=document.createElement('div');root.id=ROOT_ID;root.innerHTML='<div class="adm2-box"><div class="adm2-empty">Cargando tablero de gestión…</div></div>';
    const kpis=resumen.querySelector('.kpis');if(kpis)kpis.insertAdjacentElement('afterend',root);else resumen.prepend(root);
    try{
      const r=await fetch(API,{cache:'no-store'}),j=await r.json();
      if(!r.ok||!j.ok)throw new Error(j.error||'No se pudo cargar el tablero.');
      render(j);
    }catch(e){root.innerHTML=`<div class="adm2-box"><div class="adm2-empty">No pudimos cargar el tablero de gestión: ${esc(e.message||e)}</div></div>`;}
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',loadDashboard,{once:true});else loadDashboard();
})();
// CAFASSO deploy marker: admin-dashboard-v2
