(()=>{
  if(typeof data==='undefined'||typeof render!=='function')return;

  const VERSION='course-editor-v2-20260903';
  const $e=id=>document.getElementById(id);
  let dirty=false;
  let localTimer=null;
  let dragModule=-1;
  let dragBlock=-1;

  const style=document.createElement('style');
  style.id='cafassoCourseEditorV2Styles';
  style.textContent=`
    .editor-flow{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:0 0 18px}
    .editor-step{background:#fff;border:1px solid var(--line);border-radius:14px;padding:11px 12px;color:var(--muted);font-size:12px;font-weight:800;display:flex;align-items:center;gap:8px}
    .editor-step b{width:24px;height:24px;border-radius:50%;display:grid;place-items:center;background:#F7F1E8;color:var(--navy);font-size:11px}
    .editor-step.active{background:#FFF7D7;border-color:#E7CF73;color:var(--navy)}
    .save-state{display:inline-flex;align-items:center;gap:7px;padding:8px 11px;border-radius:999px;background:#EDF5F1;color:#245F48;font-size:11px;font-weight:800;margin-top:10px}
    .save-state.dirty{background:#FFF7D7;color:#7A5A00}
    .editor-extra-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
    .editor-extra-actions .mini{min-height:35px}
    .module[draggable="true"],.content[draggable="true"]{cursor:grab}
    .module.dragging,.content.dragging{opacity:.45}
    .module.drag-over,.content.drag-over{outline:2px dashed #D8B23A;outline-offset:2px}
    .drag-hint{font-size:11px;color:var(--muted);margin:7px 0 2px;line-height:1.4}
    .block-help{margin:-5px 0 14px;padding:11px 12px;border-radius:12px;background:#F7F1E8;color:#59697A;font-size:12px;line-height:1.5}
    .editor-preview-wrap{position:fixed;inset:0;background:rgba(10,25,45,.52);display:none;place-items:center;z-index:170;padding:18px}
    .editor-preview-wrap.show{display:grid}
    .editor-preview{width:min(960px,100%);max-height:90vh;overflow:auto;background:#F6EFE4;border-radius:26px;border:1px solid var(--line);box-shadow:0 26px 80px rgba(10,25,45,.3)}
    .editor-preview-head{position:sticky;top:0;z-index:2;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:15px 18px;background:#FFFDF9;border-bottom:1px solid var(--line)}
    .editor-preview-head strong{font:24px Georgia,serif;color:var(--navy)}
    .editor-preview-head button{border:0;width:38px;height:38px;border-radius:50%;background:#F2ECE3;color:var(--navy);font-size:20px;cursor:pointer}
    .editor-preview-body{padding:22px}
    .preview-hero{background:var(--navy);color:white;border-radius:22px;padding:26px;margin-bottom:18px}
    .preview-hero h2{font:34px Georgia,serif;margin:5px 0 8px}.preview-hero p{color:#DCE6EF;line-height:1.6;margin:0}
    .preview-module{background:#FFFDF9;border:1px solid var(--line);border-radius:19px;padding:18px;margin:12px 0}
    .preview-module h3{font:24px Georgia,serif;color:var(--navy);margin:0 0 6px}.preview-module>p{color:var(--muted);margin:0 0 14px}
    .preview-block{border-top:1px solid var(--line);padding:14px 0}.preview-block:first-of-type{border-top:0}.preview-block small{font-weight:800;color:#B77D00;text-transform:uppercase;letter-spacing:.07em}.preview-block strong{display:block;color:var(--navy);margin:5px 0}.preview-block p{white-space:pre-wrap;line-height:1.55;color:#405166;margin:0}.preview-consigna{margin-top:9px;background:#F7F1E8;border-radius:12px;padding:12px;color:#526173;font-size:13px}
    .editor-validation{padding:13px 14px;border-radius:14px;background:#FFF7D7;border:1px solid #F3DF91;color:#6C5500;font-size:12px;line-height:1.5;margin-bottom:14px;display:none}
    .editor-validation.show{display:block}
    @media(max-width:700px){.editor-flow{grid-template-columns:1fr 1fr}.editor-step{padding:9px}.editor-preview-body{padding:14px}.preview-hero{padding:20px}.editor-extra-actions{display:grid;grid-template-columns:1fr 1fr}.editor-extra-actions .mini{width:100%}}
  `;
  document.head.appendChild(style);

  const top=document.querySelector('main .top');
  if(top){
    const flow=document.createElement('div');
    flow.className='editor-flow';
    flow.innerHTML=`
      <div class="editor-step active" data-step="course"><b>1</b> Datos del curso</div>
      <div class="editor-step" data-step="modules"><b>2</b> Módulos</div>
      <div class="editor-step" data-step="contents"><b>3</b> Contenidos</div>
      <div class="editor-step" data-step="publish"><b>4</b> Revisar y publicar</div>`;
    top.insertAdjacentElement('afterend',flow);
    const state=document.createElement('div');
    state.id='editorSaveState';
    state.className='save-state';
    state.textContent='✓ Sin cambios pendientes';
    top.querySelector('div:first-child')?.appendChild(state);
  }

  const moduleList=$e('moduleList');
  if(moduleList){
    const hint=document.createElement('div');
    hint.className='drag-hint';
    hint.textContent='Podés arrastrar los módulos para cambiar el orden.';
    moduleList.insertAdjacentElement('beforebegin',hint);
    const actions=document.createElement('div');
    actions.className='editor-extra-actions';
    actions.innerHTML='<button class="mini" id="duplicateModuleV2" type="button">⧉ Duplicar módulo</button>';
    $e('deleteModule')?.insertAdjacentElement('beforebegin',actions);
  }

  const contentList=$e('contentList');
  if(contentList){
    const hint=document.createElement('div');
    hint.className='drag-hint';
    hint.textContent='Arrastrá los contenidos para ordenar la experiencia del animador.';
    contentList.insertAdjacentElement('beforebegin',hint);
    const actions=document.createElement('div');
    actions.className='editor-extra-actions';
    actions.innerHTML='<button class="mini" id="duplicateBlockV2" type="button">⧉ Duplicar bloque seleccionado</button>';
    contentList.insertAdjacentElement('afterend',actions);
  }

  const blockFields=$e('blockFields');
  if(blockFields){
    const help=document.createElement('div');
    help.id='blockTypeHelpV2';
    help.className='block-help';
    blockFields.insertAdjacentElement('afterbegin',help);
  }

  const validation=document.createElement('div');
  validation.id='editorValidationV2';
  validation.className='editor-validation';
  document.querySelector('.editor .section')?.insertAdjacentElement('beforebegin',validation);

  const previewWrap=document.createElement('div');
  previewWrap.className='editor-preview-wrap';
  previewWrap.id='editorPreviewV2';
  previewWrap.innerHTML='<section class="editor-preview"><div class="editor-preview-head"><strong>Vista previa del curso</strong><button type="button" aria-label="Cerrar">×</button></div><div class="editor-preview-body" id="editorPreviewBodyV2"></div></section>';
  document.body.appendChild(previewWrap);
  previewWrap.querySelector('button').onclick=()=>previewWrap.classList.remove('show');
  previewWrap.onclick=e=>{if(e.target===previewWrap)previewWrap.classList.remove('show')};

  function clone(v){return JSON.parse(JSON.stringify(v));}
  function uid(){return 'local-'+crypto.randomUUID();}
  function markDirty(){
    dirty=true;
    const el=$e('editorSaveState');
    if(el){el.className='save-state dirty';el.textContent='● Cambios todavía no guardados en Wix';}
    clearTimeout(localTimer);
    localTimer=setTimeout(()=>{try{cache()}catch(e){}},500);
  }
  function markSaved(){dirty=false;const el=$e('editorSaveState');if(el){el.className='save-state';el.textContent='✓ Guardado en Wix CMS';}}

  function typeHelp(){
    const type=$e('blockType')?.value||'Texto';
    const map={
      Texto:['Escribí el contenido formativo que va a leer el animador.','Escribí acá el texto del bloque…','Contenido'],
      Video:['Pegá un enlace de YouTube. CAFASSO lo mostrará integrado dentro del módulo.','https://www.youtube.com/watch?v=…','URL del video'],
      Imagen:['Pegá la URL pública de una imagen.','https://…','URL de la imagen'],
      Documento:['Pegá un enlace al PDF, documento o recurso que querés que abra el animador.','https://…','Enlace al documento'],
      'Reflexión':['Escribí una pregunta o consigna personal. La respuesta se guarda y puede recibir devolución.','¿Qué te resuena de lo trabajado?','Consigna de reflexión'],
      Entrega:['Planteá la tarea que el animador debe entregar. Quedará pendiente de revisión.','Describí qué tiene que entregar…','Consigna de entrega'],
      'Evaluación':['Escribí la consigna de evaluación. Por ahora funciona como respuesta escrita revisable.','Escribí la consigna de evaluación…','Consigna de evaluación']
    };
    const cfg=map[type]||map.Texto;
    const help=$e('blockTypeHelpV2');if(help)help.innerHTML='<strong>'+cfg[2]+':</strong> '+cfg[0];
    const body=$e('blockBody');if(body)body.placeholder=cfg[1];
    const settings=$e('blockSettings');if(settings)settings.placeholder=type==='Evaluación'?'Ej.: puntaje mínimo 70%':'Notas internas opcionales';
  }

  function validateForPublish(){
    saveAllFields();
    const problems=[];
    if(!String(data.course.title||'').trim())problems.push('El curso necesita un título.');
    const published=(data.modules||[]).filter(m=>m.status==='Publicado');
    if(!published.length)problems.push('Publicá al menos un módulo.');
    published.forEach((m,i)=>{
      if(!String(m.title||'').trim())problems.push(`El módulo ${i+1} necesita título.`);
      if(!(m.contents||[]).length)problems.push(`“${m.title||'Módulo'}” no tiene contenidos.`);
      (m.contents||[]).forEach((b,j)=>{
        if(!String(b.title||'').trim())problems.push(`Hay un bloque sin título en “${m.title||'Módulo'}”.`);
        if(!String(b.content?.body||'').trim())problems.push(`“${b.title||'Bloque '+(j+1)}” está vacío.`);
      });
    });
    const box=$e('editorValidationV2');
    if(box){box.classList.toggle('show',problems.length>0);box.innerHTML=problems.length?'<strong>Antes de publicar revisá esto:</strong><br>• '+problems.join('<br>• '):'';}
    return problems;
  }

  function preview(){
    saveAllFields();
    const c=data.course;
    const modules=data.modules||[];
    const body=$e('editorPreviewBodyV2');
    body.innerHTML=`<section class="preview-hero"><small>${escPreview(c.status||'Borrador')}</small><h2>${escPreview(c.title||'Curso')}</h2><p>${escPreview(c.description||c.subtitle||'Recorrido formativo CAFASSO.')}</p></section>`+
      (modules.length?modules.map((m,i)=>`<article class="preview-module"><small>MÓDULO ${i+1} · ${escPreview(m.status||'Borrador')}</small><h3>${escPreview(m.title||'Módulo')}</h3><p>${escPreview(m.desc||'')}</p>${(m.contents||[]).length?(m.contents||[]).map(b=>previewBlock(b)).join(''):'<div class="preview-block"><p>Este módulo todavía no tiene contenidos.</p></div>'}</article>`).join(''):'<div class="preview-module">Todavía no hay módulos.</div>');
    previewWrap.classList.add('show');
    document.querySelectorAll('.editor-step').forEach(x=>x.classList.toggle('active',x.dataset.step==='publish'));
  }
  function escPreview(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
  function previewBlock(b){
    const type=String(b.type||'Texto'),content=String(b.content?.body||'');
    const interactive=['Reflexión','Entrega','Evaluación'].includes(type);
    return `<div class="preview-block"><small>${escPreview(type)}${b.required?' · OBLIGATORIO':''}</small><strong>${escPreview(b.title||type)}</strong>${interactive?`<p>${escPreview(content)}</p><div class="preview-consigna">Así verá el animador el espacio para responder.</div>`:`<p>${escPreview(content)}</p>`}</div>`;
  }

  function enhanceRows(){
    document.querySelectorAll('#moduleList .module').forEach((el,i)=>{
      el.draggable=true;el.dataset.moduleIndex=i;
      el.ondragstart=()=>{saveAllFields();dragModule=i;el.classList.add('dragging')};
      el.ondragend=()=>{dragModule=-1;el.classList.remove('dragging');document.querySelectorAll('.module.drag-over').forEach(x=>x.classList.remove('drag-over'))};
      el.ondragover=e=>{e.preventDefault();if(dragModule!==i)el.classList.add('drag-over')};
      el.ondragleave=()=>el.classList.remove('drag-over');
      el.ondrop=e=>{e.preventDefault();el.classList.remove('drag-over');if(dragModule<0||dragModule===i)return;const moved=data.modules.splice(dragModule,1)[0];data.modules.splice(i,0,moved);active=i;activeBlock=-1;markDirty();render()};
    });
    document.querySelectorAll('#contentList .content').forEach((el,i)=>{
      el.draggable=true;el.dataset.blockIndex=i;
      el.ondragstart=e=>{if(e.target.closest('button')){e.preventDefault();return}saveBlockFields();dragBlock=i;el.classList.add('dragging')};
      el.ondragend=()=>{dragBlock=-1;el.classList.remove('dragging');document.querySelectorAll('.content.drag-over').forEach(x=>x.classList.remove('drag-over'))};
      el.ondragover=e=>{e.preventDefault();if(dragBlock!==i)el.classList.add('drag-over')};
      el.ondragleave=()=>el.classList.remove('drag-over');
      el.ondrop=e=>{e.preventDefault();el.classList.remove('drag-over');if(dragBlock<0||dragBlock===i)return;const a=data.modules[active].contents,moved=a.splice(dragBlock,1)[0];a.splice(i,0,moved);activeBlock=i;markDirty();renderContents();renderBlock();enhanceRows()};
    });
  }

  const originalRender=render;
  render=function(){originalRender();enhanceRows();typeHelp();};
  const originalRenderContents=renderContents;
  renderContents=function(){originalRenderContents();enhanceRows();};
  const originalRenderBlock=renderBlock;
  renderBlock=function(){originalRenderBlock();typeHelp();};

  $e('duplicateModuleV2').onclick=()=>{
    saveAllFields();const source=data.modules[active];if(!source)return;
    const copy=clone(source);copy._id=uid();copy.title=(source.title||'Módulo')+' · copia';copy.contents=(copy.contents||[]).map(b=>({...b,_id:uid()}));
    data.modules.splice(active+1,0,copy);active++;activeBlock=-1;markDirty();render();toast('Módulo duplicado');
  };
  $e('duplicateBlockV2').onclick=()=>{
    saveBlockFields();const source=data.modules[active]?.contents?.[activeBlock];if(!source){toast('Seleccioná un bloque primero');return}
    const copy=clone(source);copy._id=uid();copy.title=(source.title||source.type)+' · copia';data.modules[active].contents.splice(activeBlock+1,0,copy);activeBlock++;markDirty();renderContents();renderBlock();toast('Bloque duplicado');
  };

  document.querySelectorAll('input,textarea,select').forEach(el=>{
    el.addEventListener('input',markDirty);
    el.addEventListener('change',()=>{markDirty();if(el.id==='blockType')typeHelp()});
  });
  document.querySelectorAll('[data-type],#addModule,#deleteModule,#moduleUp,#moduleDown,#blockUp,#blockDown').forEach(el=>el?.addEventListener('click',()=>setTimeout(markDirty,0)));

  const originalSave=saveToWix;
  saveToWix=async function(publish=false){
    if(publish){const issues=validateForPublish();if(issues.length){toast('Hay detalles para revisar antes de publicar');return;}}
    await originalSave(publish);
    if($e('syncStatus')?.classList.contains('warn'))markDirty();else markSaved();
  };

  $e('previewBtn').onclick=preview;
  $e('publishBtn').onclick=()=>saveToWix(true);
  $e('saveBtn').onclick=()=>saveToWix(false);

  window.addEventListener('beforeunload',e=>{if(!dirty)return;e.preventDefault();e.returnValue='';});
  render();
  markSaved();
  console.info('CAFASSO',VERSION);

  if(!document.getElementById('cafassoCourseEditorV3Loader')){
    const s=document.createElement('script');s.id='cafassoCourseEditorV3Loader';s.src='./course-editor-v3.js?v=20260904-1';s.defer=true;document.body.appendChild(s);
  }
})();
