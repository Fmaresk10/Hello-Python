(()=>{
  if(window.__cafassoCourseCoverEditorInstalled)return;
  window.__cafassoCourseCoverEditorInstalled=true;
  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  if(page!=='curso-editor.html')return;

  const $=id=>document.getElementById(id);
  const style=document.createElement('style');
  style.id='cafassoCourseCoverEditorStyles';
  style.textContent=`
    .course-cover-field{margin-top:3px}
    .course-cover-help{display:block;margin-top:6px;color:var(--muted);font-size:11px;line-height:1.45}
    .course-cover-preview{margin-top:10px;min-height:150px;border:1px dashed var(--line);border-radius:16px;overflow:hidden;background:#F7F1E8;display:grid;place-items:center;color:var(--muted);font-size:12px}
    .course-cover-preview img{width:100%;height:190px;object-fit:cover;display:block}
  `;
  document.head.appendChild(style);

  function currentCover(){
    try{
      const direct=String(data?.course?.coverImage||'').trim();
      if(direct)return direct;
      for(const m of (data?.modules||[])){
        const u=String(m?.settings?.courseCoverImage||'').trim();
        if(u)return u;
      }
    }catch(e){}
    return '';
  }

  function propagate(url){
    try{
      data.course.coverImage=url;
      (data.modules||[]).forEach(m=>{m.settings={...(m.settings||{}),courseCoverImage:url};});
    }catch(e){}
  }

  function preview(){
    const box=$('courseCoverPreview'),input=$('courseCoverImage');
    if(!box||!input)return;
    const url=String(input.value||'').trim();
    if(/^https?:\/\//i.test(url))box.innerHTML='<img src="'+url.replace(/"/g,'&quot;')+'" alt="Vista previa de la imagen del curso">';
    else box.textContent=url?'La URL debe comenzar con http:// o https://':'Todavía no hay imagen elegida.';
  }

  function installField(){
    if($('courseCoverImage'))return;
    const section=[...document.querySelectorAll('.editor .section')].find(s=>(s.querySelector('h3')?.textContent||'').trim()==='Datos del curso');
    if(!section)return;
    const certificate=section.querySelector('#certificateEnabled')?.closest('label');
    const field=document.createElement('div');
    field.className='field course-cover-field';
    field.innerHTML='<label>Imagen del curso</label><input id="courseCoverImage" type="url" placeholder="https://.../imagen.jpg"><small class="course-cover-help">Elegí una imagen para este curso. CAFASSO la usará automáticamente en sus tarjetas y en “Tu recorrido actual”.</small><div class="course-cover-preview" id="courseCoverPreview">Todavía no hay imagen elegida.</div>';
    if(certificate)section.insertBefore(field,certificate);else section.appendChild(field);
    const input=$('courseCoverImage');
    input.value=currentCover();
    input.addEventListener('input',preview);
    input.addEventListener('change',()=>{propagate(String(input.value||'').trim());try{cache()}catch(e){}});
    preview();
  }

  const originalSaveCourseFields=typeof saveCourseFields==='function'?saveCourseFields:null;
  if(originalSaveCourseFields){
    saveCourseFields=function(){
      originalSaveCourseFields();
      const input=$('courseCoverImage');
      if(input)propagate(String(input.value||'').trim());
    };
  }

  const originalRender=typeof render==='function'?render:null;
  if(originalRender){
    render=function(){
      originalRender();
      installField();
      const input=$('courseCoverImage');
      if(input&&document.activeElement!==input)input.value=currentCover();
      preview();
    };
  }

  installField();
  const input=$('courseCoverImage');
  if(input){input.value=currentCover();preview();}
})();
