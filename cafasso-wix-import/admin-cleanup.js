(()=>{
  if(window.__cafassoAdminCleanupInstalled)return;
  window.__cafassoAdminCleanupInstalled=true;

  const STYLE_ID='cafassoAdminCleanupStyles';

  function addStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #resumen .cafasso-admin-clean-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(320px,.85fr);gap:18px;margin-top:18px}
      #resumen .cafasso-admin-attention .alerts{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      #resumen .cafasso-admin-attention .alert{margin:0}
      #resumen .cafasso-admin-quick{padding:22px}
      #resumen .cafasso-admin-quick-links{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      #resumen .cafasso-admin-quick-link{display:flex;align-items:center;gap:11px;min-height:64px;padding:13px 14px;border:1px solid var(--line);border-radius:15px;background:#fff;color:var(--navy);text-decoration:none;font-weight:800;transition:.16s ease}
      #resumen .cafasso-admin-quick-link:hover{border-color:#D8C28A;background:#FFF9E8;transform:translateY(-1px)}
      #resumen .cafasso-admin-quick-link .ico{width:34px;height:34px;border-radius:11px;background:#F7F1E8;display:grid;place-items:center;font-size:17px;flex:0 0 auto}
      #resumen .cafasso-admin-quick-link small{display:block;color:var(--muted);font-weight:600;font-size:11px;margin-top:2px}
      #resumen .cafasso-admin-kpi-note{font-size:11px;color:var(--muted)!important;font-weight:650!important}
      @media(max-width:1050px){#resumen .cafasso-admin-clean-grid{grid-template-columns:1fr}#resumen .cafasso-admin-attention .alerts{grid-template-columns:1fr 1fr}}
      @media(max-width:700px){#resumen .cafasso-admin-attention .alerts,#resumen .cafasso-admin-quick-links{grid-template-columns:1fr}#resumen .cafasso-admin-clean-grid{gap:12px;margin-top:12px}#resumen .cafasso-admin-quick{padding:17px}}
    `;
    document.head.appendChild(style);
  }

  function makeQuickAccess(){
    const card=document.createElement('article');
    card.className='card box cafasso-admin-quick';
    card.innerHTML=`
      <div class="title"><h3>Accesos rápidos</h3></div>
      <div class="cafasso-admin-quick-links">
        <a class="cafasso-admin-quick-link" href="./animadores.html"><span class="ico">👥</span><span>Animadores<small>Usuarios y perfiles</small></span></a>
        <a class="cafasso-admin-quick-link" href="./admin.html#cursos"><span class="ico">📚</span><span>Cursos<small>Editar y publicar</small></span></a>
        <a class="cafasso-admin-quick-link" href="./asignaciones.html"><span class="ico">↗</span><span>Asignaciones<small>Cursos y grupos</small></span></a>
        <a class="cafasso-admin-quick-link" href="./entregas.html"><span class="ico">📥</span><span>Entregas<small>Revisar pendientes</small></span></a>
        <a class="cafasso-admin-quick-link" href="./reportes.html"><span class="ico">📊</span><span>Seguimiento<small>Progreso detallado</small></span></a>
        <a class="cafasso-admin-quick-link" href="./grupos.html"><span class="ico">◉</span><span>Grupos<small>Organización</small></span></a>
      </div>`;
    return card;
  }

  function simplify(){
    if((location.pathname.split('/').pop()||'').toLowerCase()!=='admin.html')return false;
    const panel=document.getElementById('resumen');
    if(!panel||panel.dataset.cafassoCleaned==='1')return !!panel;

    addStyles();

    const head=document.querySelector('main .head p');
    if(head)head.textContent='Estado general y accesos principales de CAFASSO.';

    const progress=document.getElementById('progressCourses');
    const progressCard=progress&&progress.closest('.card.box');
    if(progressCard)progressCard.remove();

    const alerts=document.getElementById('alerts');
    const attentionCard=alerts&&alerts.closest('.card.box');
    if(attentionCard){
      attentionCard.classList.add('cafasso-admin-attention');
      const title=attentionCard.querySelector('.title h3');
      if(title)title.textContent='Requiere atención';
      const oldLink=attentionCard.querySelector('.title a');
      if(oldLink)oldLink.remove();
    }

    let grid=panel.querySelector('.grid');
    if(grid){
      grid.className='cafasso-admin-clean-grid';
      if(attentionCard&&!grid.contains(attentionCard))grid.appendChild(attentionCard);
      grid.appendChild(makeQuickAccess());
    }else{
      grid=document.createElement('div');
      grid.className='cafasso-admin-clean-grid';
      if(attentionCard)grid.appendChild(attentionCard);
      grid.appendChild(makeQuickAccess());
      panel.appendChild(grid);
    }

    const progressKpi=document.getElementById('kProgress')?.closest('.kpi');
    if(progressKpi){
      const note=progressKpi.querySelector('small');
      if(note){note.textContent='Promedio general';note.classList.add('cafasso-admin-kpi-note');}
    }
    const pendingKpi=document.getElementById('kPending')?.closest('.kpi');
    if(pendingKpi){
      const note=pendingKpi.querySelector('small');
      if(note){note.textContent='Por revisar';note.classList.add('cafasso-admin-kpi-note');}
    }

    panel.dataset.cafassoCleaned='1';
    return true;
  }

  function boot(){
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      if(simplify()||tries>30)clearInterval(timer);
    },120);
    simplify();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
