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
    .course-cover-preview{margin-top:10px;min-height:150px;border:1px dashed var(--line);border-radius:16px;overflow:hidden;background:#F7F1E8;display:grid;place-items:center;color:var(--muted);font-size:12px;text-align:center;padding:12px}
    .course-cover-preview img{width:100%;height:190px;object-fit:cover;display:block;border-radius:10px}
    .course-cover-preview.bad{color:#8A3C3C;background:#FFF4F4;border-color:#E8CACA}
  `;
  document.head.appendChild(style);

  function googleDriveId(u){
    const filePath=u.pathname.match(/\/file\/d\/([^/]+)/i);
    if(filePath?.[1])return filePath[1];
    const dPath=u.pathname.match(/\/d\/([^/]+)/i);
    if(dPath?.[1])return dPath[1];
    return u.searchParams.get('id')||'';
  }

  function directImageUrl(raw){
    let url=String(raw||'').trim();
    if(!url)return '';
    try{
      const u=new URL(url);
      if(/(^|\.)drive\.google\.com$/i.test(u.hostname)){
        const id=googleDriveId(u);
        if(id)return 'https://drive.google.com/thumbnail?id='+encodeURIComponent(id)+'&sz=w1600';
      }
      if(/(^|\.)googleusercontent\.com$/i.test(u.hostname))return url;
      if(/(^|\.)dropbox\.com$/i.test(u.hostname)){
        u.searchParams.set('raw','1');
        u.searchParams.delete('dl');
        return u.toString();
      }
      return url;
    }catch(e){return url;}
  }

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
    const normalized=directImageUrl(url);
    try{
      data.course.coverImage=normalized;
      (data.modules||[]).forEach(m=>{m.settings={...(m.settings||{}),courseCoverImage:normalized};});
    }catch(e){}
    return normalized;
  }

  function preview(){
    const box=$('courseCoverPreview'),input=$('courseCoverImage');
    if(!box||!input)return;
    box.classList.remove('bad');
    const raw=String(input.value||'').trim();
    const url=directImageUrl(raw);
    if(!raw){box.textContent='Todavía no hay imagen elegida.';return;}
    if(!/^https?:\/\//i.test(url)){box.classList.add('bad');box.textContent='Pegá un enlace web válido que comience con http:// o https://';return;}
    box.innerHTML='';
    const img=document.createElement('img');
    img.src=url;img.alt='Vista previa de la imagen del curso';
    img.onload=()=>{box.classList.remove('bad');};
    img.onerror=()=>{box.innerHTML='';box.classList.add('bad');box.textContent='No pude mostrar esa imagen. Si está en Google Drive, verificá que el archivo pueda ser visto por cualquier persona con el enlace.';};
    box.appendChild(img);
  }

  function installField(){
    if($('courseCoverImage'))return;
    const section=[...document.querySelectorAll('.editor .section')].find(s=>(s.querySelector('h3')?.textContent||'').trim()==='Datos del curso');
    if(!section)return;
    const certificate=section.querySelector('#certificateEnabled')?.closest('label');
    const field=document.createElement('div');
    field.className='field course-cover-field';
    field.innerHTML='<label>Imagen del curso</label><input id="courseCoverImage" type="url" placeholder="https://.../imagen.jpg"><small class="course-cover-help">Podés pegar una imagen pública o un enlace compartido de Google Drive. CAFASSO la usará automáticamente en las tarjetas y en “Tu recorrido actual”.</small><div class="course-cover-preview" id="courseCoverPreview">Todavía no hay imagen elegida.</div>';
    if(certificate)section.insertBefore(field,certificate);else section.appendChild(field);
    const input=$('courseCoverImage');
    input.value=currentCover();
    input.addEventListener('input',preview);
    input.addEventListener('change',()=>{const normalized=propagate(input.value);if(normalized&&normalized!==input.value)input.value=normalized;try{cache()}catch(e){}preview();});
    preview();
  }

  const originalSaveCourseFields=typeof saveCourseFields==='function'?saveCourseFields:null;
  if(originalSaveCourseFields){
    saveCourseFields=function(){
      originalSaveCourseFields();
      const input=$('courseCoverImage');
      if(input){const normalized=propagate(input.value);if(normalized&&normalized!==input.value)input.value=normalized;}
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