(()=>{
  if(typeof data==='undefined'||typeof renderBlock!=='function'||document.getElementById('cafassoCourseLibraryPicker'))return;
  const $e=id=>document.getElementById(id);
  const API='https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoCourse';
  const RESOURCE_TITLE='CAFASSO · Recursos internos';
  let libraryResources=[];
  let libraryLoaded=false;
  let libraryLoading=false;
  let pickerType='Documento';

  const style=document.createElement('style');
  style.id='cafassoCourseLibraryPicker';
  style.textContent=`
    .course-source-picker{display:none;margin:0 0 14px;padding:12px;border:1px solid #d8c9ad;border-radius:8px;background:#f3eadb}.course-source-picker.show{display:block}
    .course-source-picker__head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:9px}.course-source-picker__head strong{color:#3d544a;font-size:12px}.course-source-picker__actions{display:flex;gap:6px;flex-wrap:wrap}
    .course-source-picker button{border:1px solid #d2c2a4;background:#fff9ed;color:#40564c;border-radius:6px;padding:7px 9px;font-size:10px;font-weight:850;cursor:pointer}.course-source-picker button.active{background:#385448;border-color:#385448;color:#fff}
    .course-source-linked{display:none;grid-template-columns:34px minmax(0,1fr) auto;gap:9px;align-items:center;padding:10px;border:1px solid #c9d9cf;border-radius:7px;background:#edf4ef}.course-source-linked.show{display:grid}
    .course-source-linked__ico{display:grid;place-items:center;width:34px;height:34px;border-radius:7px;background:#dce9df;font-size:17px}.course-source-linked strong{display:block;color:#315044;font-size:11px}.course-source-linked small{display:block;margin-top:3px;color:#68766f;font-size:9px;line-height:1.35}.course-source-linked button{white-space:nowrap;background:#fff;border-color:#c8d7cd;color:#3b5b4d}
    .course-library-overlay{position:fixed;inset:0;z-index:260;display:none;place-items:center;padding:18px;background:rgba(17,38,33,.72)}.course-library-overlay.show{display:grid}
    .course-library-modal{width:min(900px,100%);max-height:88vh;display:grid;grid-template-rows:auto auto minmax(0,1fr);overflow:hidden;border:1px solid #d1bf9d;border-radius:11px;background:#f5ecdc;box-shadow:0 28px 80px rgba(14,28,25,.36)}
    .course-library-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;padding:18px 19px 14px;border-bottom:1px solid #d9c9aa;background:#faf1e2}.course-library-head h2{margin:0;color:#30493f;font:27px Georgia,serif}.course-library-head p{margin:5px 0 0;color:#746e63;font-size:11px}.course-library-close{width:36px;height:36px;border:0;border-radius:50%;background:#e9deca;color:#40564d;font-size:20px;cursor:pointer}
    .course-library-tools{display:grid;grid-template-columns:minmax(0,1fr) 220px;gap:9px;padding:12px 18px;border-bottom:1px solid #ddd0b9}.course-library-tools input,.course-library-tools select{width:100%;border:1px solid #d4c4a8;border-radius:7px;background:#fffaf0;padding:10px 11px;color:#354d43;font:inherit}
    .course-library-list{overflow:auto;padding:13px 18px 18px;display:grid;gap:8px}.course-library-row{display:grid;grid-template-columns:42px minmax(0,1fr) auto;gap:11px;align-items:center;padding:11px 12px;border:1px solid #d9c9aa;border-radius:8px;background:#fffaf0;text-align:left;color:#354d43;cursor:pointer}.course-library-row:hover{border-color:#b99950;background:#fff5df}.course-library-row__ico{display:grid;place-items:center;width:42px;height:42px;border-radius:8px;background:#ede2cc;font-size:20px}.course-library-row strong{display:block;font-size:12px}.course-library-row small{display:block;margin-top:4px;color:#777066;font-size:10px;line-height:1.4}.course-library-row__use{padding:7px 9px;border-radius:6px;background:#385448;color:#fff;font-size:10px;font-weight:850}
    .course-library-empty{padding:28px 14px;text-align:center;color:#786f5f;font-size:12px;line-height:1.5}
    .library-source-badge{display:inline-flex;margin-left:6px;padding:2px 6px;border-radius:999px;background:#dce9df;color:#365849;font-size:8px;font-weight:850;vertical-align:middle}
    @media(max-width:700px){.course-library-modal{max-height:92vh}.course-library-tools{grid-template-columns:1fr;padding:10px 12px}.course-library-list{padding:10px 12px 16px}.course-library-row{grid-template-columns:36px minmax(0,1fr)}.course-library-row__ico{width:36px;height:36px}.course-library-row__use{grid-column:1/-1;text-align:center}.course-source-linked{grid-template-columns:32px 1fr}.course-source-linked button{grid-column:1/-1;width:100%}}
  `;
  document.head.appendChild(style);

  const bodyField=$e('blockBody')?.closest('.field');
  if(bodyField){
    const picker=document.createElement('div');
    picker.id='courseSourcePicker';
    picker.className='course-source-picker';
    picker.innerHTML='<div class="course-source-picker__head"><strong>Fuente del recurso</strong><div class="course-source-picker__actions"><button type="button" data-source-link class="active">🔗 Enlace</button><button type="button" data-source-library>📚 Biblioteca</button></div></div><div class="course-source-linked" id="courseSourceLinked"><div class="course-source-linked__ico" id="courseSourceLinkedIcon">📄</div><div><strong id="courseSourceLinkedTitle">Recurso de Biblioteca</strong><small id="courseSourceLinkedMeta"></small></div><button type="button" data-unlink-library>Usar enlace propio</button></div>';
    bodyField.insertAdjacentElement('beforebegin',picker);
  }

  const overlay=document.createElement('div');
  overlay.className='course-library-overlay';
  overlay.id='courseLibraryOverlay';
  overlay.innerHTML='<section class="course-library-modal"><header class="course-library-head"><div><h2>Biblioteca de CAFASSO</h2><p>Elegí un recurso ya cargado. El bloque queda vinculado al catálogo central.</p></div><button class="course-library-close" type="button" aria-label="Cerrar">×</button></header><div class="course-library-tools"><input id="courseLibrarySearch" placeholder="Buscar por título, categoría o descripción"><select id="courseLibraryCategory"><option value="">Todas las categorías</option></select></div><div class="course-library-list" id="courseLibraryList"><div class="course-library-empty">Cargando Biblioteca…</div></div></section>';
  document.body.appendChild(overlay);

  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
  function currentBlock(){return data.modules?.[active]?.contents?.[activeBlock]||null}
  function supportedType(type){return ['Video','Imagen','Documento'].includes(String(type||''))}
  function iconFor(type){return type==='Video'?'🎬':type==='Imagen'?'🖼️':'📄'}
  function editorType(resource){
    const t=String(resource?.tipo||'');
    if(t==='Video')return'Video';
    if(t==='Imagen')return'Imagen';
    return'Documento';
  }
  function compatible(resource,type){
    if(type==='Video')return editorType(resource)==='Video';
    if(type==='Imagen')return editorType(resource)==='Imagen';
    if(type==='Documento')return editorType(resource)==='Documento';
    return false;
  }
  function normalizeCatalog(course){
    const blocks=course?.modules?.[0]?.contents||[];
    return blocks.filter(b=>b?.settings?.cafassoResource===true&&b?.settings?.disponibleParaCursos===true).map(b=>({
      id:b._id,
      titulo:b.title||'Recurso',
      categoria:b.settings?.categoria||'',
      tipo:b.settings?.resourceType||b.type||'Documento',
      url:b.content?.body||'',
      descripcion:b.settings?.descripcion||''
    })).filter(r=>r.url);
  }
  function linkedResource(block=currentBlock()){
    const id=block?.settings?.libraryResourceId;
    if(!id)return null;
    return libraryResources.find(r=>r.id===id)||{
      id,
      titulo:block.settings?.libraryResourceTitle||'Recurso de Biblioteca',
      categoria:block.settings?.libraryResourceCategory||'',
      tipo:block.settings?.libraryResourceType||block.type||'Documento',
      url:block.content?.body||'',
      descripcion:''
    };
  }
  async function loadLibrary(force=false){
    if(libraryLoading)return;
    if(libraryLoaded&&!force)return;
    libraryLoading=true;
    try{
      const res=await fetch(`${API}?title=${encodeURIComponent(RESOURCE_TITLE)}&library=${Date.now()}`,{cache:'no-store'});
      const json=await res.json();
      if(!res.ok||!json.ok||!json.course)throw new Error(json.error||'No se pudo cargar la Biblioteca');
      libraryResources=normalizeCatalog(json.course);
      libraryLoaded=true;
      syncLinkedBlocks();
    }catch(error){
      console.warn('CAFASSO library picker',error);
      libraryResources=[];
    }finally{
      libraryLoading=false;
    }
  }
  function syncLinkedBlocks(){
    let changed=false;
    (data.modules||[]).forEach(module=>(module.contents||[]).forEach(block=>{
      const id=block?.settings?.libraryResourceId;if(!id)return;
      const resource=libraryResources.find(r=>r.id===id);if(!resource)return;
      block.settings=block.settings||{};
      if(block.content?.body!==resource.url){block.content={...(block.content||{}),body:resource.url};changed=true}
      block.settings.libraryResourceTitle=resource.titulo;
      block.settings.libraryResourceType=resource.tipo;
      block.settings.libraryResourceCategory=resource.categoria;
    }));
    if(changed){try{cache()}catch(e){}}
  }
  function unlinkLibrary(keepUrl=true){
    const block=currentBlock();if(!block)return;
    block.settings=block.settings||{};
    delete block.settings.libraryResourceId;
    delete block.settings.libraryResourceTitle;
    delete block.settings.libraryResourceType;
    delete block.settings.libraryResourceCategory;
    if(!keepUrl)block.content={...(block.content||{}),body:''};
    const body=$e('blockBody');if(body){body.readOnly=false;if(!keepUrl)body.value='';body.focus()}
    try{cache()}catch(e){}
    refreshSource();
  }
  function useResource(resource){
    const block=currentBlock();if(!block||!resource)return;
    const type=editorType(resource);
    block.type=type;
    block.content={...(block.content||{}),body:resource.url};
    block.settings={...(block.settings||{}),
      libraryResourceId:resource.id,
      libraryResourceTitle:resource.titulo,
      libraryResourceType:resource.tipo,
      libraryResourceCategory:resource.categoria
    };
    const title=String(block.title||'');
    if(!title||/^Nuevo bloque de /i.test(title))block.title=resource.titulo;
    try{cache()}catch(e){}
    closePicker();
    renderBlock();
    renderContents();
    const body=$e('blockBody');
    if(body){body.dispatchEvent(new Event('input',{bubbles:true}));body.dispatchEvent(new Event('change',{bubbles:true}))}
    try{toast(`“${resource.titulo}” vinculado desde Biblioteca`)}catch(e){}
  }
  function refreshSource(){
    const picker=$e('courseSourcePicker'),block=currentBlock(),type=String($e('blockType')?.value||block?.type||'');
    const supported=!!block&&supportedType(type);
    if(picker)picker.classList.toggle('show',supported);
    if(!supported)return;
    const resource=linkedResource(block),linked=$e('courseSourceLinked'),body=$e('blockBody');
    document.querySelector('[data-source-link]')?.classList.toggle('active',!resource);
    document.querySelector('[data-source-library]')?.classList.toggle('active',!!resource);
    linked?.classList.toggle('show',!!resource);
    if(body)body.readOnly=!!resource;
    if(resource){
      if($e('courseSourceLinkedIcon'))$e('courseSourceLinkedIcon').textContent=iconFor(editorType(resource));
      if($e('courseSourceLinkedTitle'))$e('courseSourceLinkedTitle').textContent=resource.titulo||'Recurso de Biblioteca';
      if($e('courseSourceLinkedMeta'))$e('courseSourceLinkedMeta').textContent=[resource.tipo,resource.categoria].filter(Boolean).join(' · ')+' · vinculado';
    }
  }
  function categoriesFor(type){
    return [...new Set(libraryResources.filter(r=>compatible(r,type)).map(r=>r.categoria).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
  }
  function renderPicker(){
    const list=$e('courseLibraryList'),search=$e('courseLibrarySearch'),cat=$e('courseLibraryCategory');if(!list||!cat)return;
    const cats=categoriesFor(pickerType),old=cat.value;
    cat.innerHTML='<option value="">Todas las categorías</option>'+cats.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');
    cat.value=cats.includes(old)?old:'';
    const q=String(search?.value||'').trim().toLowerCase(),category=cat.value;
    const rows=libraryResources.filter(r=>compatible(r,pickerType)&&(!q||[r.titulo,r.categoria,r.descripcion,r.tipo].join(' ').toLowerCase().includes(q))&&(!category||r.categoria===category));
    list.innerHTML=rows.length?rows.map(r=>`<button type="button" class="course-library-row" data-library-resource="${esc(r.id)}"><span class="course-library-row__ico">${iconFor(editorType(r))}</span><span><strong>${esc(r.titulo)}</strong><small>${esc([r.tipo,r.categoria,r.descripcion].filter(Boolean).join(' · '))}</small></span><span class="course-library-row__use">Usar</span></button>`).join(''):`<div class="course-library-empty">${libraryLoaded?'No hay recursos de este tipo disponibles para cursos.':'No se pudo cargar la Biblioteca.'}</div>`;
  }
  async function openPicker(){
    const block=currentBlock();if(!block)return;
    pickerType=String($e('blockType')?.value||block.type||'Documento');
    if(!supportedType(pickerType))return;
    overlay.classList.add('show');
    if($e('courseLibraryList'))$e('courseLibraryList').innerHTML='<div class="course-library-empty">Cargando Biblioteca…</div>';
    await loadLibrary();
    renderPicker();
    setTimeout(()=>$e('courseLibrarySearch')?.focus(),20);
  }
  function closePicker(){overlay.classList.remove('show')}

  const originalSaveBlockFields=saveBlockFields;
  saveBlockFields=function(){
    originalSaveBlockFields();
    const block=currentBlock(),resource=linkedResource(block);
    if(block&&resource){
      block.content={...(block.content||{}),body:resource.url||block.content?.body||''};
      block.settings={...(block.settings||{}),
        libraryResourceId:resource.id,
        libraryResourceTitle:resource.titulo,
        libraryResourceType:resource.tipo,
        libraryResourceCategory:resource.categoria
      };
    }
  };
  const originalRenderBlock=renderBlock;
  renderBlock=function(){originalRenderBlock();setTimeout(refreshSource,0)};
  const originalRenderContents=renderContents;
  renderContents=function(){
    originalRenderContents();
    setTimeout(()=>{
      document.querySelectorAll('#contentList .content').forEach((row,i)=>{
        const block=data.modules?.[active]?.contents?.[i];if(!block?.settings?.libraryResourceId)return;
        const strong=row.querySelector('strong');if(strong&&!strong.querySelector('.library-source-badge'))strong.insertAdjacentHTML('beforeend','<span class="library-source-badge">📚 Biblioteca</span>');
      });
    },0);
  };

  document.addEventListener('click',e=>{
    if(e.target.closest('[data-source-library]')){openPicker();return}
    if(e.target.closest('[data-source-link]')){if(linkedResource())unlinkLibrary(true);return}
    if(e.target.closest('[data-unlink-library]')){unlinkLibrary(true);return}
    const row=e.target.closest('[data-library-resource]');if(row){const resource=libraryResources.find(r=>r.id===row.dataset.libraryResource);if(resource)useResource(resource);return}
  });
  $e('courseLibrarySearch')?.addEventListener('input',renderPicker);
  $e('courseLibraryCategory')?.addEventListener('change',renderPicker);
  overlay.querySelector('.course-library-close')?.addEventListener('click',closePicker);
  overlay.addEventListener('click',e=>{if(e.target===overlay)closePicker()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay.classList.contains('show'))closePicker()});
  $e('blockType')?.addEventListener('change',()=>{
    const block=currentBlock(),resource=linkedResource(block),type=$e('blockType')?.value;
    if(resource&&!compatible(resource,type))unlinkLibrary(true);
    setTimeout(refreshSource,0);
  });

  loadLibrary();
  renderBlock();
  renderContents();
})();