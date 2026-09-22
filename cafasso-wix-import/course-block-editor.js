(()=>{
  if(typeof data==='undefined'||typeof render!=='function')return;
  if(document.getElementById('cafassoTypedBlockEditor'))return;
  const $e=id=>document.getElementById(id);

  const style=document.createElement('style');
  style.id='cafassoTypedBlockEditor';
  style.textContent=`
    .typed-block-banner{margin:0 0 14px;padding:13px 14px;border:1px solid #d9ccb4;border-radius:9px;background:#f4ead8;color:#56675f;font-size:11px;line-height:1.5}.typed-block-banner strong{display:block;color:#304a40;margin-bottom:3px;font:18px Georgia,serif}
    .typed-preview{margin:10px 0 14px;border:1px solid #d9ccb4;border-radius:9px;background:#fff9ed;padding:12px;display:none}.typed-preview.show{display:block}.typed-preview>strong{display:block;color:#304a40;font-size:11px;margin-bottom:8px}.typed-preview iframe{width:100%;aspect-ratio:16/9;border:0;border-radius:7px;background:#eef2f5}.typed-preview img{max-width:100%;max-height:360px;display:block;border-radius:7px;margin:auto}.typed-preview a{display:inline-flex;align-items:center;gap:7px;color:#304a40;font-weight:800;text-decoration:none;background:#f1e7d5;border-radius:7px;padding:9px 11px}.typed-preview .prompt-box{background:#f5edda;border-radius:7px;padding:12px;color:#62583f;white-space:pre-wrap;line-height:1.55}
    .typed-settings{display:none;margin:0 0 14px;padding:14px;border:1px solid #d8c9ad;border-radius:9px;background:#f8efdf}.typed-settings.show{display:block}.typed-settings__head{margin-bottom:11px}.typed-settings__head strong{display:block;color:#304a40;font:19px Georgia,serif}.typed-settings__head small{display:block;margin-top:4px;color:#746d62;font-size:10px;line-height:1.4}
    .typed-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.typed-grid .wide{grid-column:1/-1}.typed-settings label{display:grid;gap:5px;color:#5b5a50;font-size:10px;font-weight:850;text-transform:uppercase;letter-spacing:.04em}.typed-settings input,.typed-settings select,.typed-settings textarea{width:100%;border:1px solid #d5c4a6;background:#fffaf0;border-radius:7px;padding:9px 10px;color:#334b42;font:inherit}.typed-settings textarea{min-height:67px;resize:vertical}.typed-settings .typed-note{padding:10px 11px;border-radius:7px;background:#eee5d5;color:#6d675d;font-size:10px;line-height:1.45}.typed-settings .typed-note strong{color:#40564c}
    .typed-eval-pill{display:inline-flex;align-items:center;gap:6px;margin-bottom:10px;padding:6px 8px;border-radius:999px;background:#e5edE7;color:#365348;font-size:9px;font-weight:900;letter-spacing:.05em;text-transform:uppercase}
    .typed-common-notes{margin-top:3px}.typed-common-notes label{font-size:10px}.typed-common-notes input{background:#fbf6ec}
    #challengeConfigV2{display:none!important}
    @media(max-width:700px){.typed-grid{grid-template-columns:1fr}.typed-grid .wide{grid-column:auto}.typed-settings{padding:12px}}
  `;
  document.head.appendChild(style);

  const fields=$e('blockFields');
  if(!fields)return;
  const banner=document.createElement('div');banner.className='typed-block-banner';banner.id='typedBlockBanner';fields.insertAdjacentElement('afterbegin',banner);
  const preview=document.createElement('div');preview.className='typed-preview';preview.id='typedBlockPreview';
  const bodyField=$e('blockBody')?.closest('.field');bodyField?.insertAdjacentElement('afterend',preview);
  const specific=document.createElement('div');specific.className='typed-settings';specific.id='typedSettingsPanel';preview.insertAdjacentElement('afterend',specific);

  const notesField=$e('blockSettings')?.closest('.field');
  if(notesField){notesField.classList.add('typed-common-notes');const label=notesField.querySelector('label');if(label)label.textContent='Notas internas';if($e('blockSettings'))$e('blockSettings').placeholder='Solo para el equipo formador · no se muestra al animador';}

  const cfg={
    Texto:{label:'Contenido del texto',help:'Escribí el contenido formativo. Podés decidir si se presenta como lectura normal o como idea destacada.',placeholder:'Escribí acá el contenido…'},
    Video:{label:'URL del video',help:'Usá YouTube, Drive o un recurso de Biblioteca. Podés agregar una breve indicación para acompañar el video.',placeholder:'https://www.youtube.com/watch?v=…'},
    Imagen:{label:'URL de la imagen',help:'Usá una imagen pública o de Biblioteca y agregá texto alternativo o epígrafe cuando aporte contexto.',placeholder:'https://…/imagen.jpg'},
    Documento:{label:'Enlace al documento',help:'Enlazá un PDF, Drive, Docs, Slides u otro material y definí cómo se presenta el acceso.',placeholder:'https://…'},
    'Reflexión':{label:'Pregunta o consigna de reflexión',help:'La respuesta queda guardada en CAFASSO. Podés orientar al animador y personalizar el espacio de respuesta.',placeholder:'¿Qué te resuena de lo trabajado?'},
    Entrega:{label:'Consigna de la entrega',help:'Explicá qué tiene que producir. Podés indicar qué se espera y qué criterio usará el formador al revisarla.',placeholder:'Describí qué tiene que realizar y entregar…'},
    'Desafío':{label:'Consigna del desafío',help:'Proponé una acción concreta. La entrega queda pendiente de aprobación y las Almitas se acreditan una sola vez al aprobarla.',placeholder:'Describí el desafío, la evidencia esperada y cuándo realizarlo…'},
    'Evaluación':{label:'Consigna de evaluación',help:'Por ahora la evaluación es de respuesta abierta. Podés definir extensión mínima y criterios de revisión reales.',placeholder:'Escribí la consigna de evaluación…'}
  };

  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
  function currentBlock(){return data.modules?.[active]?.contents?.[activeBlock]||null}
  function youtubeEmbed(url){
    const s=String(url||'').trim();
    let m=s.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i);
    return m?`https://www.youtube.com/embed/${m[1]}`:'';
  }
  function googleEmbed(url){
    const s=String(url||'').trim();
    let m=s.match(/drive\.google\.com\/file\/d\/([^/]+)/i);if(m)return 'https://drive.google.com/file/d/'+m[1]+'/preview';
    m=s.match(/docs\.google\.com\/(document|presentation|spreadsheets)\/d\/([^/]+)/i);
    if(!m)return'';return 'https://docs.google.com/'+m[1]+'/d/'+m[2]+'/preview';
  }
  function markChanged(){
    try{cache()}catch(e){}
    const state=$e('editorSaveState');if(state){state.classList.add('dirty');state.textContent='● Cambios todavía no guardados en Wix'}
    const sync=$e('syncStatus');if(sync&&!String(sync.textContent||'').includes('Nuevo curso')){sync.textContent='Cambios locales · falta guardar en Wix';sync.classList.add('warn')}
  }
  function value(id,fallback=''){const el=$e(id);return el?el.value:fallback}
  function numberValue(id,fallback=0){const n=Number(value(id,''));return Number.isFinite(n)?n:fallback}

  function settingsMarkup(type,s){
    if(type==='Texto')return `
      <div class="typed-settings__head"><strong>Presentación del texto</strong><small>Elegí el tono visual con el que aparecerá esta lectura.</small></div>
      <div class="typed-grid"><label>Estilo<select id="typedTextStyle"><option value="normal" ${(s.textStyle||'normal')==='normal'?'selected':''}>Lectura normal</option><option value="highlight" ${s.textStyle==='highlight'?'selected':''}>Idea destacada</option><option value="quiet" ${s.textStyle==='quiet'?'selected':''}>Lectura serena</option></select></label><div class="typed-note"><strong>No cambia el contenido.</strong><br>Solo modifica su presentación para el animador.</div></div>`;
    if(type==='Video')return `
      <div class="typed-settings__head"><strong>Acompañar el video</strong><small>Sumá una indicación breve antes o después de reproducirlo.</small></div>
      <div class="typed-grid"><label class="wide">Indicación / epígrafe<textarea id="typedCaption" placeholder="Ej.: Miralo prestando atención a cómo Don Bosco se acerca a los jóvenes.">${esc(s.caption||'')}</textarea></label></div>`;
    if(type==='Imagen')return `
      <div class="typed-settings__head"><strong>Datos de la imagen</strong><small>Ayudan a que la imagen tenga contexto y sea más accesible.</small></div>
      <div class="typed-grid"><label>Texto alternativo<input id="typedAltText" value="${esc(s.altText||'')}" placeholder="Qué muestra la imagen"></label><label>Epígrafe<input id="typedCaption" value="${esc(s.caption||'')}" placeholder="Texto breve debajo de la imagen"></label></div>`;
    if(type==='Documento')return `
      <div class="typed-settings__head"><strong>Presentación del material</strong><small>Definí qué va a leer el animador al encontrarse con este recurso.</small></div>
      <div class="typed-grid"><label>Texto del botón<input id="typedLinkLabel" value="${esc(s.linkLabel||'Abrir material')}" placeholder="Abrir material"></label><label>Indicación<input id="typedResourceDescription" value="${esc(s.resourceDescription||'')}" placeholder="Ej.: Leé las páginas 4 a 7"></label></div>`;
    if(type==='Reflexión')return `
      <div class="typed-settings__head"><strong>Espacio de reflexión</strong><small>La respuesta se guarda para seguimiento y puede recibir devolución.</small></div>
      <div class="typed-grid"><label class="wide">Orientación opcional<textarea id="typedResponseGuidance" placeholder="Una pista o encuadre antes de responder…">${esc(s.responseGuidance||'')}</textarea></label><label class="wide">Texto dentro de la respuesta<input id="typedResponsePlaceholder" value="${esc(s.responsePlaceholder||'')}" placeholder="Ej.: Escribí con tus palabras…"></label></div>`;
    if(type==='Entrega')return `
      <div class="typed-settings__head"><strong>Configuración de la entrega</strong><small>Estos datos aparecen en la experiencia del animador y ayudan a transparentar qué se espera.</small></div>
      <div class="typed-grid"><label class="wide">Qué se espera<textarea id="typedExpectedDelivery" placeholder="Ej.: Una reflexión de 2 o 3 párrafos con un ejemplo concreto.">${esc(s.expectedDelivery||'')}</textarea></label><label class="wide">Criterio de revisión<textarea id="typedReviewCriteria" placeholder="¿Qué va a mirar el formador?">${esc(s.reviewCriteria||'')}</textarea></label><label class="wide">Texto dentro de la respuesta<input id="typedResponsePlaceholder" value="${esc(s.responsePlaceholder||'')}" placeholder="Escribí o pegá acá tu entrega…"></label></div>`;
    if(type==='Desafío')return `
      <div class="typed-settings__head"><strong>Recompensa y evidencia</strong><small>La recompensa solo se acredita cuando un formador aprueba la entrega.</small></div>
      <div class="typed-grid"><label>Almitas<input id="typedReward" type="number" min="0" max="10000" step="1" value="${Math.max(0,Number(s.rewardAlmitas??10))}"></label><div class="typed-note"><strong>Aprobación manual.</strong><br>CAFASSO evita acreditar dos veces el mismo desafío.</div><label class="wide">Criterio para aprobar<textarea id="typedReviewCriteria" placeholder="¿Qué debe observar el formador?">${esc(s.reviewCriteria||'')}</textarea></label><label class="wide">Texto dentro de la entrega<input id="typedResponsePlaceholder" value="${esc(s.responsePlaceholder||'')}" placeholder="Contá qué hiciste y cómo lo realizaste…"></label></div>`;
    if(type==='Evaluación')return `
      <div class="typed-eval-pill">✅ Respuesta abierta</div>
      <div class="typed-settings__head"><strong>Configuración de la evaluación</strong><small>En esta etapa la corrección sigue siendo del formador. El cuestionario automático vendrá después.</small></div>
      <div class="typed-grid"><label>Mínimo de caracteres<input id="typedMinimumCharacters" type="number" min="0" max="10000" step="10" value="${Math.max(0,Number(s.minimumCharacters||0))}"></label><div class="typed-note"><strong>0 = sin mínimo.</strong><br>Si indicás un valor, CAFASSO no dejará enviar una respuesta más corta.</div><label class="wide">Criterio de revisión<textarea id="typedReviewCriteria" placeholder="¿Qué debe demostrar la respuesta?">${esc(s.reviewCriteria||'')}</textarea></label><label class="wide">Texto dentro de la respuesta<input id="typedResponsePlaceholder" value="${esc(s.responsePlaceholder||'')}" placeholder="Desarrollá tu respuesta…"></label></div>`;
    return'';
  }

  function saveStructured(){
    const block=currentBlock();if(!block)return;
    const type=String($e('blockType')?.value||block.type||'Texto');
    block.settings=block.settings||{};
    const s=block.settings;
    if(type==='Texto')s.textStyle=value('typedTextStyle',s.textStyle||'normal');
    if(type==='Video')s.caption=value('typedCaption',s.caption||'').trim();
    if(type==='Imagen'){s.altText=value('typedAltText',s.altText||'').trim();s.caption=value('typedCaption',s.caption||'').trim();}
    if(type==='Documento'){s.linkLabel=value('typedLinkLabel',s.linkLabel||'Abrir material').trim()||'Abrir material';s.resourceDescription=value('typedResourceDescription',s.resourceDescription||'').trim();}
    if(type==='Reflexión'){s.responseGuidance=value('typedResponseGuidance',s.responseGuidance||'').trim();s.responsePlaceholder=value('typedResponsePlaceholder',s.responsePlaceholder||'').trim();}
    if(type==='Entrega'){s.expectedDelivery=value('typedExpectedDelivery',s.expectedDelivery||'').trim();s.reviewCriteria=value('typedReviewCriteria',s.reviewCriteria||'').trim();s.responsePlaceholder=value('typedResponsePlaceholder',s.responsePlaceholder||'').trim();s.requiresReview=true;}
    if(type==='Desafío'){s.rewardAlmitas=Math.max(0,Math.min(10000,Math.round(numberValue('typedReward',Number(s.rewardAlmitas||10)))));s.reviewCriteria=value('typedReviewCriteria',s.reviewCriteria||'').trim();s.responsePlaceholder=value('typedResponsePlaceholder',s.responsePlaceholder||'').trim();s.requiresReview=true;}
    if(type==='Evaluación'){s.evaluationMode='open';s.minimumCharacters=Math.max(0,Math.min(10000,Math.round(numberValue('typedMinimumCharacters',Number(s.minimumCharacters||0)))));s.reviewCriteria=value('typedReviewCriteria',s.reviewCriteria||'').trim();s.responsePlaceholder=value('typedResponsePlaceholder',s.responsePlaceholder||'').trim();s.requiresReview=true;}
  }

  function refreshPreview(type,val){
    preview.classList.remove('show');preview.innerHTML='';
    if(!String(val).trim())return;
    if(type==='Video'){
      const embed=youtubeEmbed(val)||googleEmbed(val);preview.classList.add('show');preview.innerHTML=embed?`<strong>Vista previa</strong><iframe src="${esc(embed)}" allowfullscreen loading="lazy"></iframe>`:`<strong>Vista previa</strong><div class="prompt-box">El enlace está guardado. Si el proveedor permite incrustarlo, CAFASSO lo mostrará dentro del curso; de lo contrario ofrecerá abrirlo.</div>`;
    } else if(type==='Imagen'){
      preview.classList.add('show');preview.innerHTML=`<strong>Vista previa</strong><img src="${esc(val)}" alt="${esc(currentBlock()?.settings?.altText||'Vista previa')}" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'prompt-box',textContent:'No se pudo cargar esta imagen.'}))">`;
    } else if(type==='Documento'){
      preview.classList.add('show');preview.innerHTML=`<strong>Recurso enlazado</strong><a href="${esc(val)}" target="_blank" rel="noopener">📄 ${esc(currentBlock()?.settings?.linkLabel||'Abrir material')}</a>`;
    } else if(['Reflexión','Entrega','Desafío','Evaluación'].includes(type)){
      preview.classList.add('show');preview.innerHTML=`<strong>Así se verá la consigna</strong><div class="prompt-box">${esc(val)}</div>`;
    }
  }

  function refresh(){
    const block=currentBlock();
    if(!block){specific.classList.remove('show');return}
    const type=$e('blockType')?.value||block.type||'Texto',c=cfg[type]||cfg.Texto,s=block.settings||{};
    const label=$e('blockBody')?.closest('.field')?.querySelector('label');if(label)label.textContent=c.label;
    if($e('blockBody'))$e('blockBody').placeholder=c.placeholder;
    banner.innerHTML=`<strong>${esc(type)}</strong>${esc(c.help)}`;
    specific.innerHTML=settingsMarkup(type,s);specific.classList.toggle('show',!!specific.innerHTML);
    refreshPreview(type,$e('blockBody')?.value||'');
  }

  const originalSaveBlockFields=saveBlockFields;
  saveBlockFields=function(){
    originalSaveBlockFields();
    saveStructured();
  };
  const originalRenderBlock=renderBlock;
  renderBlock=function(){originalRenderBlock();setTimeout(refresh,0)};

  $e('blockType')?.addEventListener('change',()=>{setTimeout(()=>{saveBlockFields();refresh();markChanged()},0)});
  $e('blockBody')?.addEventListener('input',()=>refreshPreview($e('blockType')?.value||'Texto',$e('blockBody')?.value||''));
  specific.addEventListener('input',()=>{saveStructured();markChanged()});
  specific.addEventListener('change',()=>{saveStructured();markChanged();refreshPreview($e('blockType')?.value||'Texto',$e('blockBody')?.value||'')});

  setTimeout(refresh,0);
})();