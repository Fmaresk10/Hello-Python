(()=>{
  if(typeof data==='undefined'||typeof render!=='function')return;
  if(document.getElementById('cafassoTypedBlockEditor'))return;
  const $e=id=>document.getElementById(id);
  const style=document.createElement('style');
  style.id='cafassoTypedBlockEditor';
  style.textContent=`
    .typed-block-banner{margin:0 0 14px;padding:13px 14px;border:1px solid var(--line);border-radius:14px;background:#F7F1E8;color:#526173;font-size:12px;line-height:1.5}.typed-block-banner strong{display:block;color:var(--navy);margin-bottom:3px}
    .typed-preview{margin:10px 0 14px;border:1px solid var(--line);border-radius:15px;background:#fff;padding:12px;display:none}.typed-preview.show{display:block}.typed-preview strong{display:block;color:var(--navy);font-size:12px;margin-bottom:8px}.typed-preview iframe{width:100%;aspect-ratio:16/9;border:0;border-radius:10px;background:#eef2f5}.typed-preview img{max-width:100%;max-height:360px;display:block;border-radius:10px;margin:auto}.typed-preview a{display:inline-flex;align-items:center;gap:7px;color:var(--navy);font-weight:800;text-decoration:none;background:#F7F1E8;border-radius:10px;padding:9px 11px}.typed-preview .prompt-box{background:#FFF8DD;border-radius:11px;padding:12px;color:#5E4B00;white-space:pre-wrap;line-height:1.55}
  `;document.head.appendChild(style);

  const fields=$e('blockFields');
  if(!fields)return;
  const banner=document.createElement('div');banner.className='typed-block-banner';banner.id='typedBlockBanner';fields.insertAdjacentElement('afterbegin',banner);
  const preview=document.createElement('div');preview.className='typed-preview';preview.id='typedBlockPreview';
  const bodyField=$e('blockBody')?.closest('.field');bodyField?.insertAdjacentElement('afterend',preview);

  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
  function youtubeEmbed(url){
    const s=String(url||'').trim();
    let m=s.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i);
    return m?`https://www.youtube.com/embed/${m[1]}`:'';
  }
  const cfg={
    Texto:{label:'Contenido del texto',help:'Escribí el contenido formativo que va a leer el animador.',placeholder:'Escribí acá el contenido…'},
    Video:{label:'URL del video',help:'Pegá un enlace de YouTube. Si es válido, vas a verlo acá mismo.',placeholder:'https://www.youtube.com/watch?v=…'},
    Imagen:{label:'URL de la imagen',help:'Pegá una URL pública de imagen para previsualizarla antes de guardar.',placeholder:'https://…/imagen.jpg'},
    Documento:{label:'Enlace al documento',help:'Pegá el enlace al PDF, Drive o recurso que querés que abra el animador.',placeholder:'https://…'},
    'Reflexión':{label:'Pregunta o consigna de reflexión',help:'Escribí una pregunta personal. La respuesta del animador se guarda para seguimiento.',placeholder:'¿Qué te resuena de lo trabajado?'},
    Entrega:{label:'Consigna de la entrega',help:'Explicá claramente qué debe producir y entregar el animador.',placeholder:'Describí qué tiene que realizar y entregar…'},
    'Evaluación':{label:'Consigna de evaluación',help:'Escribí la consigna que deberá responder el animador. Por ahora funciona como respuesta escrita revisable.',placeholder:'Escribí la consigna de evaluación…'}
  };
  function refresh(){
    const type=$e('blockType')?.value||'Texto';const c=cfg[type]||cfg.Texto;
    const label=$e('blockBody')?.closest('.field')?.querySelector('label');if(label)label.textContent=c.label;
    if($e('blockBody'))$e('blockBody').placeholder=c.placeholder;
    banner.innerHTML=`<strong>${esc(type)}</strong>${esc(c.help)}`;
    const val=$e('blockBody')?.value||'';preview.classList.remove('show');preview.innerHTML='';
    if(!String(val).trim())return;
    if(type==='Video'){
      const embed=youtubeEmbed(val);preview.classList.add('show');preview.innerHTML=embed?`<strong>Vista previa</strong><iframe src="${esc(embed)}" allowfullscreen loading="lazy"></iframe>`:`<strong>Vista previa</strong><div class="prompt-box">No pude reconocer un enlace de YouTube válido.</div>`;
    } else if(type==='Imagen'){
      preview.classList.add('show');preview.innerHTML=`<strong>Vista previa</strong><img src="${esc(val)}" alt="Vista previa" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'prompt-box',textContent:'No se pudo cargar esta imagen.'}))">`;
    } else if(type==='Documento'){
      preview.classList.add('show');preview.innerHTML=`<strong>Recurso enlazado</strong><a href="${esc(val)}" target="_blank" rel="noopener">📄 Abrir documento</a>`;
    } else if(['Reflexión','Entrega','Evaluación'].includes(type)){
      preview.classList.add('show');preview.innerHTML=`<strong>Así se verá la consigna</strong><div class="prompt-box">${esc(val)}</div>`;
    }
  }
  const originalRenderBlock=renderBlock;
  renderBlock=function(){originalRenderBlock();setTimeout(refresh,0)};
  $e('blockType')?.addEventListener('change',refresh);
  $e('blockBody')?.addEventListener('input',refresh);
  setTimeout(refresh,0);
})();
