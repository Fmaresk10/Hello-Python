(()=>{
  const style=document.createElement('style');
  style.textContent=`
    .cafasso-course-manager{margin-top:16px;border-top:1px solid #E8DCCB;padding-top:16px}
    .cafasso-course-manager-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px}
    .cafasso-course-manager-head h4{margin:0;color:#0F2D4D;font:22px Georgia,serif}
    .cafasso-course-manager-head small{color:#687386}
    .cafasso-course-catalog{display:grid;gap:9px}
    .cafasso-course-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;padding:13px;border:1px solid #E8DCCB;border-radius:14px;background:#fff}
    .cafasso-course-row strong{display:block;color:#0F2D4D;margin-bottom:3px}
    .cafasso-course-row small{color:#687386}
    .cafasso-course-state{display:inline-block;margin-top:7px;padding:5px 8px;border-radius:999px;font-size:10px;font-weight:850;background:#F0F1F2;color:#687386}
    .cafasso-course-state.on{background:#EDF5F1;color:#2E7D59}
    .cafasso-course-action{border:1px solid #E8DCCB;background:#fff;color:#0F2D4D;border-radius:10px;padding:8px 10px;font-size:11px;font-weight:850;cursor:pointer}
    .cafasso-course-action.assign{background:#F2C94C;border-color:#F2C94C}
    .cafasso-course-action.remove{color:#A64747;border-color:#EBC7C7;background:#FFF8F8}
    @media(max-width:700px){.cafasso-course-row{grid-template-columns:1fr}.cafasso-course-action{width:100%;min-height:42px}}
  `;
  document.head.appendChild(style);

  function mount(){
    if(typeof state==='undefined'||!state||typeof id==='undefined'||!id)return;
    const box=document.getElementById('coursesBox');
    if(!box||document.getElementById('cafassoCourseCatalog'))return;
    const section=document.createElement('div');
    section.className='cafasso-course-manager';
    section.id='cafassoCourseCatalog';
    section.innerHTML='<div class="cafasso-course-manager-head"><div><h4>Gestionar cursos</h4><small>Asigná o quitá cursos sin salir de esta ficha.</small></div></div><div class="cafasso-course-catalog" id="cafassoCourseCatalogList"></div>';
    box.insertAdjacentElement('afterend',section);
    renderCatalog();
  }

  function renderCatalog(){
    if(typeof state==='undefined'||!state)return;
    const list=document.getElementById('cafassoCourseCatalogList');
    if(!list)return;
    const assignments=(state.assignments||[]).filter(a=>a.targetType==='group'&&a.targetId===id&&a.active!==false);
    const byCourse=new Map(assignments.map(a=>[a.courseId,a]));
    const courses=(state.courses||[]).filter(c=>c.status!=='Archivado').sort((a,b)=>String(a.title||'').localeCompare(String(b.title||''),'es'));
    list.innerHTML=courses.length?courses.map(c=>{
      const a=byCourse.get(c._id); const assigned=!!a;
      return `<div class="cafasso-course-row"><div><strong>${esc(c.title||'Curso')}</strong><small>${esc(c.subtitle||c.status||'')}</small><div><span class="cafasso-course-state ${assigned?'on':''}">${assigned?'Asignado al grupo':'Disponible'}</span></div></div><button class="cafasso-course-action ${assigned?'remove':'assign'}" data-catalog-course="${c._id}" data-assignment-id="${assigned?a._id:''}">${assigned?'Quitar':'Asignar'}</button></div>`;
    }).join(''):'<div class="empty">No hay cursos disponibles.</div>';
  }

  document.addEventListener('click',async e=>{
    const b=e.target.closest('[data-catalog-course]');
    if(!b)return;
    const courseId=b.dataset.catalogCourse;
    const assignmentId=b.dataset.assignmentId;
    b.disabled=true;
    try{
      if(assignmentId){
        if(!confirm('¿Quitar este curso del grupo?'))return;
        await mutate({action:'deleteAssignment',id:assignmentId});
      }else{
        await mutate({action:'saveAssignment',assignment:{courseId,targetType:'group',targetId:id,active:true}});
      }
      renderCatalog();
    }catch(err){}finally{b.disabled=false}
  });

  const observer=new MutationObserver(()=>{mount();renderCatalog()});
  observer.observe(document.documentElement,{subtree:true,childList:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
// CAFASSO deploy marker: group-course-manager-v1
