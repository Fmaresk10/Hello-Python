(()=>{
  if(typeof data==='undefined'||typeof render!=='function')return;
  if(document.getElementById('cafassoCourseStatusGuide'))return;
  const $e=id=>document.getElementById(id);

  const style=document.createElement('style');
  style.id='cafassoCourseStatusGuide';
  style.textContent=`
    .status-guide{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin:10px 0 14px}.status-guide-card{border:1px solid var(--line);background:#fff;border-radius:14px;padding:12px}.status-guide-card strong{display:flex;align-items:center;gap:7px;color:var(--navy);font-size:12px}.status-guide-card p{margin:5px 0 0;color:var(--muted);font-size:11px;line-height:1.45}.status-dot{width:9px;height:9px;border-radius:50%;background:#B0BAC5}.status-guide-card.draft .status-dot{background:#D8A928}.status-guide-card.hidden .status-dot{background:#74859A}.status-guide-card.published .status-dot{background:var(--green)}.status-guide-card.active{outline:2px solid #E1C24D;outline-offset:1px;background:#FFFBEA}
    .course-check{border:1px solid var(--line);background:#fff;border-radius:18px;padding:16px;margin:0 0 18px}.course-check-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px}.course-check-head strong{font:22px Georgia,serif;color:var(--navy)}.check-summary{font-size:11px;font-weight:800;padding:6px 9px;border-radius:999px;background:#EDF5F1;color:var(--green)}.check-summary.warn{background:#FFF4CC;color:#7A5A00}.check-list{display:grid;gap:7px}.check-item{display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid var(--line);border-radius:12px;padding:10px 11px;background:#FFFDF9;font-size:12px}.check-item .msg{display:flex;gap:8px;align-items:flex-start}.check-item .ico{font-size:14px}.check-item button{border:0;background:#F7F1E8;color:var(--navy);border-radius:9px;padding:7px 9px;font-weight:800;font-size:11px;cursor:pointer}.check-ok{padding:12px;border-radius:12px;background:#EDF5F1;color:#245F48;font-size:12px;font-weight:700}.module.has-issue{border-color:#E5C15A;background:#FFFBEA}.module.has-issue small:after{content:' · revisar';color:#9A6C00;font-weight:800}.content.has-issue{border-color:#E5C15A;background:#FFFBEA}.content.has-issue small:after{content:' · incompleto';color:#9A6C00;font-weight:800}
    @media(max-width:700px){.status-guide{grid-template-columns:1fr}.course-check-head{align-items:flex-start;flex-direction:column}.check-item{align-items:flex-start;flex-direction:column}.check-item button{width:100%}}
  `;
  document.head.appendChild(style);

  const courseStatus=$e('courseStatus');
  if(courseStatus){
    const guide=document.createElement('div');
    guide.className='status-guide';guide.id='courseStatusGuide';
    guide.innerHTML=`
      <div class="status-guide-card draft" data-status-guide="Borrador"><strong><span class="status-dot"></span>Borrador</strong><p>Solo el equipo lo edita. No queda disponible para animadores.</p></div>
      <div class="status-guide-card hidden" data-status-guide="Oculto"><strong><span class="status-dot"></span>Oculto</strong><p>El curso existe y conserva todo, pero queda fuera de la vista del animador.</p></div>
      <div class="status-guide-card published" data-status-guide="Publicado"><strong><span class="status-dot"></span>Publicado</strong><p>Queda disponible para quienes tengan el curso asignado.</p></div>`;
    courseStatus.closest('.field')?.insertAdjacentElement('afterend',guide);
  }

  const editor=document.querySelector('.card.editor');
  const check=document.createElement('div');
  check.className='course-check';check.id='courseCompletenessCheck';
  check.innerHTML='<div class="course-check-head"><strong>Chequeo del curso</strong><span class="check-summary" id="courseCheckSummary">Revisando…</span></div><div class="check-list" id="courseCheckList"></div>';
  editor?.insertAdjacentElement('afterbegin',check);

  function text(v){return String(v??'').trim()}
  function collectIssues(){
    try{saveAllFields()}catch(e){}
    const issues=[];
    if(!text(data.course?.title))issues.push({kind:'course',label:'Falta el título del curso.'});
    (data.modules||[]).forEach((m,mi)=>{
      if(!text(m.title))issues.push({kind:'module',mi,label:`El módulo ${mi+1} no tiene título.`});
      if(m.status==='Publicado'&&!(m.contents||[]).length)issues.push({kind:'module',mi,label:`“${text(m.title)||'Módulo '+(mi+1)}” está publicado pero no tiene contenidos.`});
      (m.contents||[]).forEach((b,bi)=>{
        if(!text(b.title))issues.push({kind:'block',mi,bi,label:`Hay un bloque sin título en “${text(m.title)||'Módulo '+(mi+1)}”.`});
        if(!text(b.content?.body))issues.push({kind:'block',mi,bi,label:`“${text(b.title)||b.type||'Bloque'}” está vacío.`});
      });
    });
    return issues;
  }

  function go(issue){
    try{saveAllFields()}catch(e){}
    if(issue.kind==='course'){$e('courseName')?.focus();$e('courseName')?.scrollIntoView({behavior:'smooth',block:'center'});return}
    if(Number.isInteger(issue.mi)){active=issue.mi;activeBlock=issue.kind==='block'?issue.bi:-1;render();setTimeout(()=>{(issue.kind==='block'?$e('blockEditor'):$e('moduleHeading'))?.scrollIntoView({behavior:'smooth',block:'start'})},0)}
  }

  function refreshGuide(){
    const st=$e('courseStatus')?.value||data.course?.status||'Borrador';
    document.querySelectorAll('[data-status-guide]').forEach(x=>x.classList.toggle('active',x.dataset.statusGuide===st));
  }
  function refreshMarks(issues){
    document.querySelectorAll('#moduleList .module').forEach((el,i)=>el.classList.toggle('has-issue',issues.some(x=>x.mi===i)));
    document.querySelectorAll('#contentList .content').forEach((el,i)=>el.classList.toggle('has-issue',issues.some(x=>x.kind==='block'&&x.mi===active&&x.bi===i)));
  }
  function refreshCheck(){
    const issues=collectIssues(),list=$e('courseCheckList'),sum=$e('courseCheckSummary');
    if(!list||!sum)return;
    sum.textContent=issues.length?`${issues.length} punto${issues.length===1?'':'s'} a revisar`:'Todo en orden';sum.classList.toggle('warn',issues.length>0);
    list.innerHTML=issues.length?issues.map((x,i)=>`<div class="check-item"><div class="msg"><span class="ico">${x.kind==='course'?'●':x.kind==='module'?'◉':'○'}</span><span>${String(x.label).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}</span></div><button type="button" data-fix-issue="${i}">Ir a corregir</button></div>`).join(''):'<div class="check-ok">✓ El curso no tiene campos esenciales incompletos.</div>';
    list._issues=issues;refreshMarks(issues);refreshGuide();
  }

  const originalRender=render;
  render=function(){originalRender();setTimeout(refreshCheck,0)};
  document.addEventListener('click',e=>{const b=e.target.closest('[data-fix-issue]');if(!b)return;const arr=$e('courseCheckList')?._issues||[];go(arr[Number(b.dataset.fixIssue)])});
  ['courseStatus','courseName','moduleTitle','moduleStatus','blockTitle','blockBody','blockType'].forEach(id=>$e(id)?.addEventListener(id==='blockBody'||id==='courseName'||id==='moduleTitle'||id==='blockTitle'?'input':'change',()=>setTimeout(refreshCheck,0)));
  setTimeout(refreshCheck,0);
})();
