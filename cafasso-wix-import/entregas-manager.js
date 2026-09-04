(()=>{
  if(!location.pathname.toLowerCase().endsWith('entregas.html'))return;
  const INTERNAL='__cafasso_internal_notes__';
  let queue=[],queueIndex=-1;
  const getRows=()=>{
    const q=$('q').value.trim().toLowerCase(),st=$('status').value,course=$('course').value,group=$('group').value,user=document.getElementById('userFilter')?.value||'';
    return (state.submissions||[]).filter(x=>x.courseId!==INTERNAL).filter(x=>(!q||[x.userName,x.userEmail,x.content,x.type,x.courseTitle,x.groupName].join(' ').toLowerCase().includes(q))&&(!st||(x.status||'Pendiente')===st)&&(!course||x.courseId===course)&&(!group||x.groupId===group)&&(!user||x.userId===user));
  };
  function install(){
    const filters=document.querySelector('.filters');
    if(filters&&!document.getElementById('userFilter')){
      const sel=document.createElement('select');sel.id='userFilter';sel.innerHTML='<option value="">Todos los animadores</option>';filters.appendChild(sel);
      sel.addEventListener('change',()=>render());
    }
    const note=document.getElementById('resultNote');
    if(note&&!document.getElementById('reviewQuick')){
      const bar=document.createElement('div');bar.id='reviewQuick';bar.className='review-quick';bar.innerHTML='<button class="btn alt" data-quick-status="Pendiente">Pendientes</button><button class="btn alt" data-quick-status="En revisión">En revisión</button><button class="btn alt" data-quick-status="Rehacer">Para rehacer</button><button class="btn alt" data-quick-status="">Todas</button><button class="btn" id="startQueue">▶ Corregir pendientes</button>';note.parentNode.insertBefore(bar,note);
      bar.addEventListener('click',e=>{const b=e.target.closest('[data-quick-status]');if(b){$('status').value=b.dataset.quickStatus;render();}if(e.target.closest('#startQueue'))startQueue();});
    }
    const actions=document.querySelector('.modal .actions');
    if(actions&&!document.getElementById('saveNext')){
      const prev=document.createElement('button');prev.className='btn alt';prev.id='prevSubmission';prev.textContent='← Anterior';
      const next=document.createElement('button');next.className='btn alt';next.id='nextSubmission';next.textContent='Siguiente →';
      const saveNext=document.createElement('button');saveNext.className='btn';saveNext.id='saveNext';saveNext.textContent='Guardar y siguiente';
      actions.insertBefore(prev,actions.firstChild);actions.insertBefore(next,document.getElementById('save'));actions.appendChild(saveNext);
      prev.onclick=()=>moveQueue(-1);next.onclick=()=>moveQueue(1);saveNext.onclick=()=>saveAndContinue();
      const indicator=document.createElement('div');indicator.id='queueIndicator';indicator.className='queue-indicator';document.getElementById('meta').insertAdjacentElement('afterend',indicator);
    }
    const style=document.createElement('style');style.id='entregasManagerStyles';style.textContent='.review-quick{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 12px}.review-quick .btn{min-height:38px}.queue-indicator{font-size:12px;color:var(--muted);margin-top:7px}.actions #saveNext{background:var(--green);color:#fff}.stat{cursor:pointer}.stat:hover{border-color:#D9BE67}.filters{grid-template-columns:minmax(220px,1.3fr) repeat(4,minmax(140px,.6fr))}@media(max-width:1000px){.filters{grid-template-columns:1fr 1fr 1fr}}@media(max-width:700px){.review-quick{display:grid;grid-template-columns:1fr 1fr}.review-quick .btn{width:100%}.filters{grid-template-columns:1fr}.actions{grid-template-columns:1fr}.actions #prevSubmission,.actions #nextSubmission{display:none}}';document.head.appendChild(style);
    document.querySelectorAll('.stat').forEach((el,i)=>{el.onclick=()=>{const values=['','Pendiente','En revisión','Aprobada'];$('status').value=values[i]||'';render();}});
  }
  function fillUserFilter(){const sel=document.getElementById('userFilter');if(!sel)return;const cur=sel.value;const users=[...new Map((state.submissions||[]).filter(x=>x.courseId!==INTERNAL&&x.userId).map(x=>[x.userId,{id:x.userId,name:x.userName||x.userEmail||'Animador'}])).values()].sort((a,b)=>a.name.localeCompare(b.name,'es'));sel.innerHTML='<option value="">Todos los animadores</option>'+users.map(u=>`<option value="${esc(u.id)}">${esc(u.name)}</option>`).join('');sel.value=cur;}
  const originalStats=stats;stats=function(){const old=state.submissions;state.submissions=(old||[]).filter(x=>x.courseId!==INTERNAL);try{return originalStats()}finally{state.submissions=old}};
  const originalFill=fillFilters;fillFilters=function(){originalFill();fillUserFilter()};
  render=function(){const all=(state.submissions||[]).filter(x=>x.courseId!==INTERNAL),rows=getRows();$('resultNote').textContent=rows.length===all.length?`${all.length} entregas en total`:`Mostrando ${rows.length} de ${all.length} entregas`;$('body').innerHTML=rows.length?rows.map(x=>`<tr><td><strong>${esc(x.userName||'Animador')}</strong><br><small>${esc(x.groupName||x.userEmail||'')}</small></td><td>${esc(x.courseTitle||'Curso')}</td><td>${esc(x.type||'Entrega')}</td><td>${esc((x.content||'').slice(0,90))}${(x.content||'').length>90?'…':''}</td><td>${badge(x.status)}</td><td>${fmt(x._updatedDate||x._createdDate)}</td><td><button class="btn alt" data-open="${x._id}">Revisar</button></td></tr>`).join(''):'<tr><td colspan="7" class="empty">No hay entregas que coincidan con los filtros.</td></tr>';};
  const originalOpen=openItem;openItem=function(id){queue=getRows();queueIndex=queue.findIndex(x=>x._id===id);originalOpen(id);updateQueueIndicator();};
  function updateQueueIndicator(){const el=document.getElementById('queueIndicator');if(!el)return;if(queueIndex<0||!queue.length){el.textContent='';return}el.textContent=`Entrega ${queueIndex+1} de ${queue.length} en esta vista`;document.getElementById('prevSubmission').disabled=queueIndex<=0;document.getElementById('nextSubmission').disabled=queueIndex>=queue.length-1;}
  function moveQueue(dir){if(!queue.length)return;const n=queueIndex+dir;if(n<0||n>=queue.length)return;queueIndex=n;originalOpen(queue[n]._id);updateQueueIndicator();}
  function startQueue(){const rows=getRows().filter(x=>['Pendiente','En revisión','Rehacer'].includes(x.status||'Pendiente'));if(!rows.length)return alert('No hay entregas pendientes en esta vista.');queue=rows;queueIndex=0;originalOpen(rows[0]._id);updateQueueIndicator();}
  async function saveAndContinue(){if(!current)return;const id=current._id;const nextId=queue[queueIndex+1]?._id;const btn=document.getElementById('saveNext');btn.disabled=true;btn.textContent='Guardando…';try{const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'reviewSubmission',id,status:$('reviewStatus').value,feedback:$('feedback').value})}),j=await r.json();if(!r.ok||!j.ok)throw new Error(j.error||'No se pudo guardar');state=j;fillFilters();stats();render();if(nextId&&(state.submissions||[]).some(x=>x._id===nextId)){queue=getRows();queueIndex=queue.findIndex(x=>x._id===nextId);originalOpen(nextId);updateQueueIndicator();}else{$('modal').classList.remove('show');current=null;}}catch(e){alert(e.message)}finally{btn.disabled=false;btn.textContent='Guardar y siguiente'}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{install();fillUserFilter();render()},{once:true});else{install();fillUserFilter();render()}
})();
