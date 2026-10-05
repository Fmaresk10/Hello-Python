(()=>{
  if(window.__cafassoCourseHologramsEditorInstalled)return;
  window.__cafassoCourseHologramsEditorInstalled=true;

  const STYLE_ID='cafassoCourseHologramsEditorStyles';
  const MODAL_ID='cafassoCourseHologramsEditor';
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[c]));

  function currentModule(){try{return data?.modules?.[active]||null}catch(e){return null}}
  function settings(){const m=currentModule();if(!m)return{};m.settings=m.settings&&typeof m.settings==='object'?m.settings:{};return m.settings}
  function list(){const s=settings();s.holograms=Array.isArray(s.holograms)?s.holograms:[];return s.holograms}
  function missions(){const s=settings();return Array.isArray(s.missions)?s.missions:[]}
  function blocks(){const m=currentModule();return Array.isArray(m?.contents)?m.contents:[]}
  function uid(){return 'holo-'+crypto.randomUUID().replace(/-/g,'').slice(0,12)}
  function changed(){try{cache()}catch(e){};const x=document.getElementById('editorSaveState');if(x){x.classList.add('dirty');x.textContent='● Cambios todavía no guardados en Wix'}const sync=document.getElementById('syncStatus');if(sync&&!sync.textContent.includes('Nuevo curso')){sync.textContent='Cambios locales · falta guardar en Wix';sync.classList.add('warn')}}
  function notify(message){try{toast(message)}catch(e){console.log(message)}}

  function styles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');style.id=STYLE_ID;style.textContent=`
      .workspace-holograms-btn{min-height:38px;border:1px solid #85cfc8!important;border-radius:8px!important;background:#e7f6f3!important;color:#285d59!important;font:850 12px Inter,system-ui!important;cursor:pointer;padding:8px 12px!important}
      .workspace-holograms-btn b{display:inline-grid;place-items:center;width:19px;height:19px;margin-right:5px;border-radius:50%;background:#4bbeb7;color:white;font-size:11px}
      .cafasso-holo-editor{position:fixed;inset:0;z-index:2147483500;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(13,34,34,.58)}
      .cafasso-holo-editor.show{display:flex}
      .cafasso-holo-editor__card{width:min(980px,96vw);max-height:92dvh;overflow:auto;border:1px solid #cdbf9f;border-radius:18px;background:#fbf5e9;box-shadow:0 28px 80px rgba(33,31,24,.34);color:#344b43}
      .cafasso-holo-editor__head{position:sticky;top:0;z-index:2;display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:18px 20px;border-bottom:1px solid #ddd0b8;background:rgba(251,245,233,.97)}
      .cafasso-holo-editor__head small{display:block;color:#51928c;font:850 9px/1 Inter,system-ui;letter-spacing:.12em;text-transform:uppercase}
      .cafasso-holo-editor__head h2{margin:5px 0 4px;color:#304940;font:500 28px/1.05 Georgia,serif}
      .cafasso-holo-editor__head p{margin:0;color:#766f62;font-size:12px;line-height:1.4}
      .cafasso-holo-editor__close{width:40px;height:40px;border:1px solid #d2c3a8;border-radius:50%;background:#fffaf0;color:#56665f;font-size:23px;cursor:pointer}
      .cafasso-holo-editor__body{display:grid;grid-template-columns:minmax(260px,.8fr) minmax(0,1.2fr);gap:14px;padding:16px}
      .cafasso-holo-editor__list,.cafasso-holo-editor__form{border:1px solid #ded2bc;border-radius:13px;background:#fffaf0;padding:14px}
      .cafasso-holo-editor__toolbar{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
      .cafasso-holo-editor__toolbar strong{font:500 20px Georgia,serif;color:#334d44}.cafasso-holo-editor__toolbar button,.cafasso-holo-editor__actions button{border:1px solid #cbb88e;border-radius:8px;background:#f5e7c9;color:#40564d;padding:8px 10px;font:850 11px Inter,system-ui;cursor:pointer}
      .cafasso-holo-editor__items{display:grid;gap:7px}.cafasso-holo-editor__item{position:relative;width:100%;text-align:left;border:1px solid #ded1b9;border-radius:10px;background:#fffdf8;padding:10px 42px 10px 11px;color:#40564d;cursor:pointer}.cafasso-holo-editor__item.active{border-color:#6ebeb8;box-shadow:inset 3px 0 #4bbeb7;background:#f0faf8}.cafasso-holo-editor__item strong{display:block;font-size:12px}.cafasso-holo-editor__item small{display:block;margin-top:4px;color:#84796a;font-size:9.5px;line-height:1.3}.cafasso-holo-editor__item .x{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:27px;height:27px;border:0;border-radius:50%;background:#f8e9e4;color:#9c5046;font-size:16px}
      .cafasso-holo-editor__empty{padding:18px;border:1px dashed #cabd9f;border-radius:10px;color:#7e7567;font-size:11px;line-height:1.45}
      .cafasso-holo-editor__grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.cafasso-holo-field{display:grid;gap:5px;margin-bottom:10px}.cafasso-holo-field.full{grid-column:1/-1}.cafasso-holo-field label{color:#6a655a;font:850 9px Inter,system-ui;text-transform:uppercase;letter-spacing:.07em}.cafasso-holo-field input,.cafasso-holo-field select,.cafasso-holo-field textarea{width:100%;border:1px solid #d6c8ad;border-radius:8px;background:white;color:#344b43;padding:9px 10px;font:12px Inter,system-ui}.cafasso-holo-field textarea{min-height:90px;resize:vertical;line-height:1.4}
      .cafasso-holo-editor__preview{margin:4px 0 12px;padding:11px 12px;border:1px solid rgba(82,185,177,.35);border-radius:10px;background:linear-gradient(135deg,#eaf8f5,#f9f1d9);color:#36564f;font-size:11px;line-height:1.45}.cafasso-holo-editor__preview b{color:#2b7770}
      .cafasso-holo-upload{grid-column:1/-1;padding:13px;border:1px dashed #83bbb5;border-radius:11px;background:#eff9f7}.cafasso-holo-upload__head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.cafasso-holo-upload__head strong{display:block;color:#31564f;font:700 15px Georgia,serif}.cafasso-holo-upload__head small{display:block;margin-top:4px;color:#6d7b75;font-size:10px;line-height:1.35}.cafasso-holo-upload label{display:inline-flex;align-items:center;justify-content:center;margin-top:10px;min-height:38px;padding:8px 12px;border:1px solid #63aba5;border-radius:8px;background:#4caea8;color:#fff;font:850 11px Inter,system-ui;cursor:pointer}.cafasso-holo-upload input[type=file]{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}.cafasso-holo-upload__status{margin-top:9px;color:#58706b;font-size:10px;min-height:14px}.cafasso-holo-upload__track{height:5px;margin-top:6px;border-radius:999px;background:#d8e8e4;overflow:hidden}.cafasso-holo-upload__bar{display:block;height:100%;width:0;background:#4caea8;transition:width .18s ease}.cafasso-holo-upload.is-busy label{pointer-events:none;opacity:.55}
      .cafasso-holo-editor__actions{display:flex;justify-content:flex-end;gap:8px;padding-top:8px;border-top:1px solid #e3d7c3}.cafasso-holo-editor__actions .primary{background:#4caea8;border-color:#338f89;color:#fff}
      @media(max-width:760px){.cafasso-holo-editor{padding:8px}.cafasso-holo-editor__card{max-height:96dvh;border-radius:14px}.cafasso-holo-editor__body{grid-template-columns:1fr}.cafasso-holo-editor__grid{grid-template-columns:1fr}.cafasso-holo-field.full{grid-column:auto}}
    `;document.head.appendChild(style)
  }

  let selected=-1;
  function triggerLabel(h){
    const labels={'module-enter':'Al entrar al módulo','mission-enter':'Al entrar a una misión','block-completed':'Después de completar un contenido','module-completed':'Al completar el módulo'};
    return labels[h?.trigger]||'Intervención';
  }
  function courseSpotLabel(h){const list=window.CafassoHologramSpots?.COURSE_SPOTS||[];return list.find(x=>x.id===(h?.courseSpotId||'curso-derecha'))?.label||'Lado derecho'}
  function renderList(){
    const box=document.querySelector('[data-holo-editor-items]');if(!box)return;
    const items=list();
    box.innerHTML=items.length?items.map((h,i)=>`<button type="button" class="cafasso-holo-editor__item ${i===selected?'active':''}" data-holo-index="${i}"><strong>✦ ${esc(h.name||'Formador')}</strong><small>${esc(triggerLabel(h))} · ${esc(courseSpotLabel(h))}${h.missionId?' · '+esc(missions().find(m=>String(m.id)===String(h.missionId))?.title||h.missionId):''}</small><span class="x" data-holo-delete="${i}" aria-label="Eliminar">×</span></button>`).join(''):'<div class="cafasso-holo-editor__empty">Todavía no hay intervenciones holográficas en este módulo. Agregá una para que el formador aparezca en un momento concreto del recorrido.</div>';
  }
  function option(value,label,current){return `<option value="${esc(value)}" ${String(value)===String(current)?'selected':''}>${esc(label)}</option>`}
  function videoUrl(h){return h.videoWebm||h.videoMov||h.videoMp4||''}
  function courseSpotOptions(h){const list=window.CafassoHologramSpots?.COURSE_SPOTS||[];return list.map(x=>option(x.id,x.label,h.courseSpotId||'curso-derecha')).join('')}
  function renderForm(){
    const form=document.querySelector('[data-holo-editor-form]');if(!form)return;
    const h=list()[selected];
    if(!h){form.innerHTML='<div class="cafasso-holo-editor__empty">Elegí una intervención o creá una nueva.</div>';return}
    const ms=missions(),bs=blocks();
    form.innerHTML=`
      <div class="cafasso-holo-editor__grid">
        <div class="cafasso-holo-field"><label>Nombre que verá el animador</label><input data-hf="name" value="${esc(h.name||'Tu formador')}"></div>
        <div class="cafasso-holo-field"><label>Rol / subtítulo</label><input data-hf="role" value="${esc(h.role||'Acompañamiento CAFASSO')}"></div>
        <div class="cafasso-holo-field"><label>Cuándo aparece</label><select data-hf="trigger">
          ${option('module-enter','Al entrar al módulo',h.trigger)}
          ${option('mission-enter','Al entrar a una misión',h.trigger)}
          ${option('block-completed','Después de completar un contenido',h.trigger)}
          ${option('module-completed','Al completar el módulo',h.trigger)}
        </select></div>
        <div class="cafasso-holo-field"><label>Cómo aparece</label><select data-hf="activation">${option('signal','Primero muestra una señal para tocar',h.activation||'signal')}${option('auto','Aparece automáticamente',h.activation)}</select></div>
        <div class="cafasso-holo-field" data-holo-mission-field><label>Misión</label><select data-hf="missionId"><option value="">Cualquier misión</option>${ms.map(m=>option(m.id,m.title||m.id,h.missionId)).join('')}</select></div>
        <div class="cafasso-holo-field" data-holo-block-field><label>Contenido</label><select data-hf="blockId"><option value="">Cualquier contenido</option>${bs.map(b=>option(b._id,b.title||b.type||b._id,h.blockId)).join('')}</select></div>
        <div class="cafasso-holo-field full"><label>Comentario del formador</label><textarea data-hf="message">${esc(h.message||'')}</textarea></div>
        <section class="cafasso-holo-upload" data-holo-upload-box>
          <div class="cafasso-holo-upload__head"><div><strong>Subir video del formador</strong><small>Grabalo normal. CAFASSO quita el fondo automáticamente al mostrarlo. MP4, MOV o WebM · máximo 60 s / 50 MB.</small></div><span aria-hidden="true">✦</span></div>
          <label>Elegir video<input type="file" accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm" data-holo-file></label>
          <div class="cafasso-holo-upload__status" data-holo-upload-status>${h.videoFileId?'Video guardado en Wix ✓':videoUrl(h)?'Video enlazado ✓':'Todavía no hay video.'}</div>
          <div class="cafasso-holo-upload__track"><span class="cafasso-holo-upload__bar" data-holo-upload-bar></span></div>
        </section>
        <div class="cafasso-holo-field"><label>Quitar fondo</label><select data-hf="removeBackground">${option('true','Sí · automático',h.removeBackground!==false?'true':'false')}${option('false','No · usar video completo',h.removeBackground===false?'false':'true')}</select></div>
        <div class="cafasso-holo-field"><label>Frecuencia</label><select data-hf="repeat">${option('session','Una vez por sesión',h.repeat||'session')}${option('always','Siempre que se cumpla',h.repeat)}</select></div>
        <div class="cafasso-holo-field full"><label>URL manual (opcional / avanzado)</label><input data-hf="videoUrl" value="${esc(videoUrl(h))}" placeholder="También podés pegar una URL WebM, MOV o MP4"></div>
        <div class="cafasso-holo-field"><label>Ubicación del formador</label><select data-hf="courseSpotId">${courseSpotOptions(h)}</select></div>
        <div class="cafasso-holo-field"><label>Escala</label><select data-hf="spotScale">${option('.85','Más discreto',String(h.spotScale||1))}${option('1','Normal',String(h.spotScale||1))}${option('1.15','Más protagonista',String(h.spotScale||1))}</select></div>
      </div>
      <div class="cafasso-holo-editor__preview"><b>Vista pedagógica:</b> ${esc(triggerLabel(h))}. ${esc(h.activation==='auto'?'El holograma aparecerá solo.':'El animador verá una señal y decidirá abrir el mensaje.')}</div>
      <div class="cafasso-holo-editor__actions"><button type="button" data-holo-test>Vista previa</button><button type="button" class="primary" data-holo-done>Listo</button></div>`;
    syncConditional();
  }
  function syncConditional(){
    const h=list()[selected];if(!h)return;
    const mission=document.querySelector('[data-holo-mission-field]'),block=document.querySelector('[data-holo-block-field]');
    if(mission)mission.style.display=h.trigger==='mission-enter'?'grid':'none';
    if(block)block.style.display=h.trigger==='block-completed'?'grid':'none';
  }
  function saveForm(){
    const h=list()[selected];if(!h)return;
    document.querySelectorAll('[data-hf]').forEach(el=>{
      const key=el.dataset.hf,value=el.value;
      if(key==='videoUrl'){const current=videoUrl(h);const clean=value.trim();if(clean===current)return;delete h.videoWebm;delete h.videoMov;delete h.videoMp4;delete h.videoFileId;if(clean){if(/\.webm(?:\?|$)/i.test(clean))h.videoWebm=clean;else if(/\.mov(?:\?|$)/i.test(clean))h.videoMov=clean;else h.videoMp4=clean}return}
      if(key==='removeBackground'){h.removeBackground=value!=='false';return}
      if(key==='spotScale'){h.spotScale=Number(value||1);return}
      h[key]=value;
    });
    if(h.trigger!=='mission-enter')delete h.missionId;
    if(h.trigger!=='block-completed')delete h.blockId;
    changed();
  }
  function add(){
    const h={id:uid(),trigger:'module-enter',name:'Tu formador',role:'Acompañamiento CAFASSO',message:'',activation:'signal',repeat:'session',courseSpotId:'curso-derecha',spotScale:1,removeBackground:true};
    list().push(h);selected=list().length-1;changed();renderList();renderForm()
  }
  function remove(index){
    if(!confirm('¿Eliminar esta intervención holográfica del módulo?'))return;
    list().splice(index,1);selected=Math.min(selected,list().length-1);changed();renderList();renderForm()
  }
  function open(){
    styles();let modal=document.getElementById(MODAL_ID);
    if(!modal){
      modal=document.createElement('div');modal.id=MODAL_ID;modal.className='cafasso-holo-editor';
      modal.innerHTML=`<section class="cafasso-holo-editor__card"><header class="cafasso-holo-editor__head"><div><small>CAFASSO · herramienta didáctica</small><h2>Hologramas del módulo</h2><p>Elegí quién aparece, qué dice y en qué momento del recorrido interviene.</p></div><button type="button" class="cafasso-holo-editor__close" aria-label="Cerrar">×</button></header><div class="cafasso-holo-editor__body"><section class="cafasso-holo-editor__list"><div class="cafasso-holo-editor__toolbar"><strong>Intervenciones</strong><button type="button" data-holo-add>＋ Agregar</button></div><div class="cafasso-holo-editor__items" data-holo-editor-items></div></section><section class="cafasso-holo-editor__form" data-holo-editor-form></section></div></section>`;
      document.body.appendChild(modal);
      modal.querySelector('.cafasso-holo-editor__close').onclick=()=>{saveForm();modal.classList.remove('show')};
      modal.addEventListener('click',e=>{
        if(e.target===modal){saveForm();modal.classList.remove('show');return}
        const del=e.target.closest('[data-holo-delete]');if(del){e.preventDefault();e.stopPropagation();remove(Number(del.dataset.holoDelete));return}
        const item=e.target.closest('[data-holo-index]');if(item){saveForm();selected=Number(item.dataset.holoIndex);renderList();renderForm();return}
        if(e.target.closest('[data-holo-add]')){saveForm();add();return}
        if(e.target.closest('[data-holo-done]')){saveForm();notify('Intervención lista · guardá el curso para sincronizarla con Wix');modal.classList.remove('show');return}
        if(e.target.closest('[data-holo-test]')){saveForm();const h=list()[selected];if(window.CafassoHologram?.show)window.CafassoHologram.show({...h,repeat:'always'});else notify('La vista previa completa está disponible en el curso publicado.');return}
      });
      modal.addEventListener('change',async e=>{
        const fileInput=e.target.closest('[data-holo-file]');
        if(fileInput){
          const file=fileInput.files?.[0];if(!file)return;
          const h=list()[selected];const box=modal.querySelector('[data-holo-upload-box]'),status=modal.querySelector('[data-holo-upload-status]'),bar=modal.querySelector('[data-holo-upload-bar]');
          if(!h||!window.CafassoHologramUploader){notify('El cargador de video todavía no está disponible.');return}
          box?.classList.add('is-busy');
          try{
            const result=await window.CafassoHologramUploader.upload(file,{onStatus:(label,progress)=>{if(status)status.textContent=label;if(bar)bar.style.width=Math.round(Math.max(0,Math.min(1,progress||0))*100)+'%'}});
            window.CafassoHologramUploader.assign(h,result);changed();renderForm();renderList();notify('Video cargado · CAFASSO quitará el fondo automáticamente');
          }catch(error){if(status)status.textContent=error.message||'No se pudo subir el video.';if(bar)bar.style.width='0%';notify(error.message||'No se pudo subir el video.')}
          finally{box?.classList.remove('is-busy')}
          return;
        }
        if(e.target.matches('[data-hf]')){saveForm();renderList();syncConditional()}
      });
      modal.addEventListener('input',e=>{if(e.target.matches('[data-hf]')){saveForm();if(e.target.dataset.hf==='trigger'){renderForm()}else if(e.target.dataset.hf==='activation'){renderForm()}}});
    }
    selected=list().length?Math.max(0,Math.min(selected,list().length-1)):-1;renderList();renderForm();modal.classList.add('show')
  }

  function installButton(){
    styles();
    const actions=document.querySelector('.workspace-active-module__actions');
    if(!actions||actions.querySelector('[data-workspace-holograms]'))return false;
    const btn=document.createElement('button');btn.type='button';btn.className='workspace-holograms-btn';btn.dataset.workspaceHolograms='1';btn.innerHTML='<b>✦</b> Hologramas';
    btn.addEventListener('click',open);actions.prepend(btn);return true
  }

  const boot=()=>{let attempts=0;const run=()=>{if(installButton())return;if(++attempts<80)setTimeout(run,100)};run();const obs=new MutationObserver(()=>installButton());obs.observe(document.body,{childList:true,subtree:true});};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();