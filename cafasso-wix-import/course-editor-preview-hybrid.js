(()=>{
  if(typeof data==='undefined'||!document.getElementById('editorPreviewV2')||document.getElementById('cafassoHybridPreview'))return;
  const $e=id=>document.getElementById(id);
  let previewModuleIndex=0;
  let previewMissionId='';

  const style=document.createElement('style');
  style.id='cafassoHybridPreview';
  style.textContent=`
    .hybrid-preview-shell{display:grid;gap:14px}
    .hybrid-preview-course{position:relative;overflow:hidden;padding:25px;border-radius:11px;background:radial-gradient(circle at 86% 8%,rgba(244,216,137,.22),transparent 24%),linear-gradient(145deg,#173a36,#224d43);color:#fff;border:1px solid rgba(244,216,137,.42)}
    .hybrid-preview-course small{display:block;color:#f1d789;font-size:9px;font-weight:850;letter-spacing:.12em;text-transform:uppercase}.hybrid-preview-course h2{margin:6px 0 7px;font:31px/1.08 Georgia,serif}.hybrid-preview-course p{max-width:720px;margin:0;color:#dce8df;line-height:1.55;font-size:13px}
    .hybrid-preview-module-tabs{display:flex;gap:7px;overflow-x:auto;padding:1px 1px 5px;scrollbar-width:thin}
    .hybrid-preview-module-tab{flex:0 0 auto;min-width:150px;padding:9px 11px;border:1px solid #d3c3a5;border-radius:7px;background:#fff8eb;color:#40554c;text-align:left;cursor:pointer}.hybrid-preview-module-tab.active{background:#314d43;border-color:#314d43;color:#fff}.hybrid-preview-module-tab small{display:block;margin-bottom:3px;font-size:8px;font-weight:850;letter-spacing:.08em;text-transform:uppercase;opacity:.7}.hybrid-preview-module-tab strong{display:block;font-size:11px;line-height:1.25}
    .hybrid-preview-stage{min-height:360px}
    .hybrid-preview-linear,.hybrid-preview-mission{border:1px solid #d5c5a8;border-radius:10px;background:#fff9ee;overflow:hidden}
    .hybrid-preview-module-head{padding:18px 20px;border-bottom:1px solid #e1d4bd;background:#f4ead8}.hybrid-preview-module-head .kicker{font-size:9px;font-weight:850;letter-spacing:.11em;text-transform:uppercase;color:#9a7623}.hybrid-preview-module-head h3{margin:5px 0 5px;color:#30493f;font:25px Georgia,serif}.hybrid-preview-module-head p{margin:0;color:#736d62;font-size:12px;line-height:1.5}
    .hybrid-preview-blocks{padding:4px 20px 17px}.hybrid-preview-block{padding:16px 0;border-top:1px solid #e5d9c5}.hybrid-preview-block:first-child{border-top:0}.hybrid-preview-block__type{display:flex;align-items:center;gap:6px;color:#9b7622;font-size:9px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.hybrid-preview-block h4{margin:6px 0 9px;color:#30493f;font:21px Georgia,serif}.hybrid-preview-block__body{color:#465a51;font-size:13px;line-height:1.62;white-space:pre-wrap}
    .hybrid-preview-response{margin-top:12px;padding:12px;border:1px solid #d8d0c2;border-radius:7px;background:#f4efe7;color:#6c716d;font-size:11px}.hybrid-preview-response textarea{width:100%;min-height:72px;margin-top:8px;border:1px solid #d5c8b5;border-radius:6px;background:white;padding:9px;resize:none;color:#788078}
    .hybrid-preview-media{margin-top:10px;border:1px solid #ded3c0;border-radius:8px;overflow:hidden;background:#f0e8dc}.hybrid-preview-media img{display:block;width:100%;max-height:420px;object-fit:contain;background:#ece4d8}.hybrid-preview-media iframe{display:block;width:100%;height:min(54vw,440px);border:0;background:#172b2b}.hybrid-preview-link{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px;color:#40584d;text-decoration:none;font-size:11px;font-weight:850}.hybrid-preview-link span:last-child{font-size:15px}
    .hybrid-preview-mission{background:linear-gradient(145deg,#102f35,#1b4d47);border-color:#856f47;color:#fff}
    .hybrid-preview-mission .hybrid-preview-module-head{background:rgba(10,35,39,.58);border-color:rgba(244,216,137,.24)}.hybrid-preview-mission .hybrid-preview-module-head .kicker{color:#f4d889}.hybrid-preview-mission .hybrid-preview-module-head h3{color:#fff9e8}.hybrid-preview-mission .hybrid-preview-module-head p{color:#d8e5dd}
    .hybrid-preview-mission-nav{position:relative;display:flex;gap:10px;overflow-x:auto;padding:18px 20px 14px;scrollbar-width:thin}.hybrid-preview-mission-nav:before{content:'';position:absolute;left:35px;right:35px;top:38px;height:2px;background:rgba(244,216,137,.22)}
    .hybrid-preview-mission-node{position:relative;z-index:1;flex:1 0 105px;min-width:105px;border:0;background:transparent;color:#e8eee8;text-align:center;cursor:pointer}.hybrid-preview-mission-node i{display:grid;place-items:center;width:40px;height:40px;margin:0 auto 6px;border-radius:50%;background:#173d3a;border:1px solid rgba(244,216,137,.55);font-style:normal;font-size:18px;box-shadow:0 5px 12px rgba(0,0,0,.2)}.hybrid-preview-mission-node strong{display:block;font-size:9px;line-height:1.2}.hybrid-preview-mission-node.active i{background:#f0c85b;color:#17302f;border-color:#ffe6a4;box-shadow:0 0 0 5px rgba(244,216,137,.16),0 5px 14px rgba(0,0,0,.25)}.hybrid-preview-mission-node.active strong{color:#fff4c9}
    .hybrid-preview-mission-card{margin:4px 20px 18px;padding:18px;border:1px solid rgba(244,216,137,.34);border-radius:9px;background:rgba(8,31,35,.52)}.hybrid-preview-mission-card__head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;padding-bottom:13px;border-bottom:1px solid rgba(244,216,137,.2)}.hybrid-preview-mission-card__icon{font-size:28px}.hybrid-preview-mission-card h4{margin:0;color:#fff9e8;font:24px Georgia,serif}.hybrid-preview-mission-card .objective{margin:5px 0 0;color:#d6e4dc;font-size:12px;line-height:1.5}.hybrid-preview-mission-card .prompt{margin:13px 0 2px;padding:11px 12px;border-radius:7px;background:rgba(255,249,232,.08);color:#e9efe9;font-size:11px;line-height:1.5}.hybrid-preview-mission-card .prompt b{color:#f4d889}
    .hybrid-preview-mission-card .hybrid-preview-blocks{padding:8px 0 0}.hybrid-preview-mission-card .hybrid-preview-block{border-color:rgba(244,216,137,.18);padding:15px 0}.hybrid-preview-mission-card .hybrid-preview-block__type{color:#f4d889}.hybrid-preview-mission-card .hybrid-preview-block h4{font-size:20px;color:#fff9e8}.hybrid-preview-mission-card .hybrid-preview-block__body{color:#dce7df}.hybrid-preview-mission-card .hybrid-preview-response{background:rgba(255,249,232,.09);border-color:rgba(244,216,137,.22);color:#dfe8e2}.hybrid-preview-mission-card .hybrid-preview-media{border-color:rgba(244,216,137,.24)}.hybrid-preview-mission-card .hybrid-preview-link{background:#fff9ee;color:#40584d}
    .hybrid-preview-empty{padding:22px;text-align:center;color:#7a7163;font-size:12px}.hybrid-preview-mission .hybrid-preview-empty{color:#d6e2db}
    .hybrid-preview-footnote{padding:1px 3px;color:#7c7468;font-size:9px;text-align:center}
    @media(max-width:700px){.hybrid-preview-course{padding:18px}.hybrid-preview-course h2{font-size:27px}.hybrid-preview-module-head{padding:15px}.hybrid-preview-blocks{padding:3px 15px 14px}.hybrid-preview-mission-nav{padding-left:13px;padding-right:13px}.hybrid-preview-mission-card{margin:3px 13px 14px;padding:14px}.hybrid-preview-mission-card__head{display:block}.hybrid-preview-mission-card__icon{margin-bottom:6px}.hybrid-preview-module-tab{min-width:132px}}
  `;
  document.head.appendChild(style);

  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
  function currentPreviewModule(){return data.modules?.[previewModuleIndex]||null}
  function settings(module){return module?.settings&&typeof module.settings==='object'?module.settings:{}}
  function missions(module){
    const s=settings(module);
    if(s.experienceMode==='linear')return[];
    return Array.isArray(s.missions)?s.missions.filter(m=>m&&m.id):[];
  }
  function isMissionModule(module){
    const s=settings(module);
    if(s.experienceMode==='linear')return false;
    return s.experienceMode==='missions'||missions(module).length>0;
  }
  function icon(type){
    return ({Texto:'📝',Video:'🎬',Imagen:'🖼️',Documento:'📄','Reflexión':'💭',Entrega:'📥','Desafío':'⭐','Evaluación':'✅'})[type]||'•';
  }
  function youtubeEmbed(url){
    const text=String(url||'').trim();
    let id='';
    let match=text.match(/[?&]v=([^&#]+)/i);if(match)id=match[1];
    if(!id){match=text.match(/youtu\.be\/([^?&#/]+)/i);if(match)id=match[1]}
    if(!id){match=text.match(/youtube\.com\/(?:embed|shorts)\/([^?&#/]+)/i);if(match)id=match[1]}
    return id?('https://www.youtube.com/embed/'+encodeURIComponent(id)):'';
  }
  function googleEmbed(url){
    const text=String(url||'').trim();
    if(!/^https?:\/\/(?:drive|docs)\.google\.com\//i.test(text))return'';
    if(/drive\.google\.com\/file\/d\/([^/]+)/i.test(text)){
      const id=text.match(/drive\.google\.com\/file\/d\/([^/]+)/i)?.[1];
      return id?'https://drive.google.com/file/d/'+id+'/preview':'';
    }
    if(/docs\.google\.com\/(document|presentation|spreadsheets)\/d\/([^/]+)/i.test(text)){
      const m=text.match(/docs\.google\.com\/(document|presentation|spreadsheets)\/d\/([^/]+)/i);
      if(!m)return'';
      const kind=m[1],id=m[2];
      if(kind==='presentation')return 'https://docs.google.com/presentation/d/'+id+'/preview';
      return 'https://docs.google.com/'+kind+'/d/'+id+'/preview';
    }
    return'';
  }
  function safeUrl(url){
    const text=String(url||'').trim();
    return /^https?:\/\//i.test(text)?text:'';
  }
  function blockMedia(block){
    const type=String(block?.type||'Texto'),url=safeUrl(block?.content?.body),settings=block?.settings||{};
    if(type==='Imagen'&&url)return `<div class="hybrid-preview-media"><img src="${esc(url)}" alt="${esc(settings.altText||block.title||'Imagen')}"></div>`;
    if(type==='Video'&&url){
      const embed=youtubeEmbed(url)||googleEmbed(url);
      if(embed)return `<div class="hybrid-preview-media"><iframe src="${esc(embed)}" loading="lazy" allowfullscreen></iframe></div>`;
      return `<div class="hybrid-preview-media"><a class="hybrid-preview-link" href="${esc(url)}" target="_blank" rel="noopener"><span>Abrir video</span><span>↗</span></a></div>`;
    }
    if(type==='Documento'&&url){
      const embed=googleEmbed(url);
      if(embed)return `<div class="hybrid-preview-media"><iframe src="${esc(embed)}" loading="lazy"></iframe></div>`;
      return `<div class="hybrid-preview-media"><a class="hybrid-preview-link" href="${esc(url)}" target="_blank" rel="noopener"><span>${esc(settings.linkLabel||'Abrir material')}</span><span>↗</span></a></div>`;
    }
    return'';
  }
  function renderEvaluationQuizPreview(block){
    const ev=block?.settings?.evaluation||{},questions=Array.isArray(ev.questions)?ev.questions:[],passing=Math.max(0,Math.min(100,Number(ev.passingScore??70))),attempts=Math.max(0,Number(ev.maxAttempts??3));
    if(!questions.length)return '<div class="hybrid-preview-response">Este cuestionario todavía no tiene preguntas.</div>';
    return `<div class="hybrid-preview-response"><strong>Cuestionario · aprobación ${passing}% · ${attempts?attempts+' intento'+(attempts===1?'':'s'):'intentos ilimitados'}</strong></div>`+
      questions.map((q,i)=>{
        const pts=Math.max(1,Number(q.points||1));
        let input='';
        if(q.type==='choice')input=`<div style="display:grid;gap:6px;margin-top:8px">${(q.options||[]).map(opt=>`<label style="display:flex;gap:7px;align-items:flex-start"><input type="radio" disabled><span>${esc(opt)}</span></label>`).join('')}</div>`;
        else if(q.type==='boolean')input='<div style="display:grid;gap:6px;margin-top:8px"><label><input type="radio" disabled> Verdadero</label><label><input type="radio" disabled> Falso</label></div>';
        else input=`<textarea disabled placeholder="Respuesta abierta…"${Number(q.minChars||0)>0?` data-min="${Number(q.minChars)}"`:''}></textarea>`;
        return `<div class="hybrid-preview-response"><strong>${i+1}. ${esc(q.prompt||'Pregunta')}</strong> <span style="opacity:.68">· ${pts} pt${pts===1?'':'s'}</span>${input}${q.type==='open'&&Number(q.minChars||0)>0?`<div style="margin-top:5px;font-size:9px">Mínimo: ${Number(q.minChars)} caracteres · revisión del formador</div>`:''}</div>`;
      }).join('');
  }
  function renderBlock(block){
    const type=String(block?.type||'Texto'),body=String(block?.content?.body||''),settings=block?.settings||{};
    const interactive=['Reflexión','Entrega','Desafío','Evaluación'].includes(type);
    const media=blockMedia(block);
    const linked=settings.libraryResourceId?' · 📚 Biblioteca':'';
    let bodyHtml='';
    if(['Video','Imagen','Documento'].includes(type)){
      const before=type==='Documento'&&settings.resourceDescription?`<div class="hybrid-preview-block__body" style="margin-bottom:10px">${esc(settings.resourceDescription)}</div>`:'';
      const after=(type==='Video'||type==='Imagen')&&settings.caption?`<div class="hybrid-preview-response">${esc(settings.caption)}</div>`:'';
      bodyHtml=before+(media||`<div class="hybrid-preview-block__body">${esc(body||'Recurso sin enlace todavía.')}</div>`)+after;
    }else{
      const style=settings.textStyle==='highlight'?'padding:13px;border-radius:8px;background:#fff3cf;border:1px solid #e4cb7e;font-weight:700':settings.textStyle==='quiet'?'padding:13px;border-radius:8px;background:#eef5f0;border-left:4px solid #7b9d8b':'';
      bodyHtml=`<div class="hybrid-preview-block__body"${style?` style="${style}"`:''}>${esc(body)}</div>`;
    }
    let extra='';
    if(type==='Desafío'){
      extra+=`<div class="hybrid-preview-response">⭐ Al aprobarse: <strong>+${Number(settings.rewardAlmitas||0)} Almitas</strong>${settings.reviewCriteria?`<div style="margin-top:5px">Criterio de revisión: ${esc(settings.reviewCriteria)}</div>`:''}<textarea disabled placeholder="${esc(settings.responsePlaceholder||'Contá qué hiciste y cómo lo realizaste…')}"></textarea></div>`;
    }else if(type==='Evaluación'&&settings.evaluationMode==='quiz'){
      extra+=renderEvaluationQuizPreview(block);
    }else if(interactive){
      if(settings.responseGuidance)extra+=`<div class="hybrid-preview-response"><strong>Orientación:</strong> ${esc(settings.responseGuidance)}</div>`;
      if(settings.expectedDelivery)extra+=`<div class="hybrid-preview-response"><strong>Qué se espera:</strong> ${esc(settings.expectedDelivery)}</div>`;
      if(settings.reviewCriteria)extra+=`<div class="hybrid-preview-response"><strong>Criterio de revisión:</strong> ${esc(settings.reviewCriteria)}</div>`;
      if(type==='Evaluación'&&Number(settings.minimumCharacters||0)>0)extra+=`<div class="hybrid-preview-response">Extensión mínima: <strong>${Number(settings.minimumCharacters)} caracteres</strong></div>`;
      extra+=`<div class="hybrid-preview-response">Así verá el animador el espacio para responder.<textarea disabled placeholder="${esc(settings.responsePlaceholder||(type==='Entrega'?'Escribí o pegá acá tu entrega…':'Respuesta del animador…'))}"></textarea></div>`;
    }
    return `<section class="hybrid-preview-block"><div class="hybrid-preview-block__type"><span>${icon(type)}</span><span>${esc(type)}${block?.required?' · OBLIGATORIO':''}${linked}</span></div><h4>${esc(block?.title||type)}</h4>${bodyHtml}${extra}</section>`;
  }
  function ensureSelection(module){
    const list=missions(module);
    if(!list.length){previewMissionId='';return}
    if(!previewMissionId||!list.some(m=>m.id===previewMissionId))previewMissionId=list[0].id;
  }
  function renderLinear(module,index){
    const blocks=module?.contents||[];
    return `<article class="hybrid-preview-linear"><header class="hybrid-preview-module-head"><div class="kicker">MÓDULO ${index+1} · 📖 RECORRIDO · ${esc(module.status||'Borrador')}</div><h3>${esc(module.title||'Módulo')}</h3><p>${esc(module.desc||'')}</p></header><div class="hybrid-preview-blocks">${blocks.length?blocks.map(renderBlock).join(''):'<div class="hybrid-preview-empty">Este módulo todavía no tiene contenidos.</div>'}</div></article>`;
  }
  function renderMissionModule(module,index){
    const list=missions(module);ensureSelection(module);
    if(!list.length)return `<article class="hybrid-preview-mission"><header class="hybrid-preview-module-head"><div class="kicker">MÓDULO ${index+1} · 🗺️ MISIONES</div><h3>${esc(module.title||'Módulo')}</h3><p>${esc(module.desc||'')}</p></header><div class="hybrid-preview-empty">Este módulo está en modo Misiones pero todavía no tiene paradas.</div></article>`;
    const mission=list.find(m=>m.id===previewMissionId)||list[0];
    const blocks=(module.contents||[]).filter(b=>b?.settings?.missionId===mission.id);
    return `<article class="hybrid-preview-mission"><header class="hybrid-preview-module-head"><div class="kicker">MÓDULO ${index+1} · 🗺️ MISIONES · ${esc(module.status||'Borrador')}</div><h3>${esc(module.title||'Módulo')}</h3><p>${esc(module.desc||'')}</p></header><nav class="hybrid-preview-mission-nav">${list.map((m,i)=>`<button type="button" class="hybrid-preview-mission-node ${m.id===mission.id?'active':''}" data-preview-mission="${esc(m.id)}"><i>${esc(m.icon||'🧭')}</i><strong>${i+1}. ${esc(m.title||'Misión')}</strong></button>`).join('')}</nav><section class="hybrid-preview-mission-card"><div class="hybrid-preview-mission-card__head"><div><h4>${esc(mission.title||'Misión')}</h4><p class="objective">${esc(mission.objective||'')}</p></div><div class="hybrid-preview-mission-card__icon">${esc(mission.icon||'🧭')}</div></div>${mission.prompt?`<div class="prompt"><b>Tu misión:</b> ${esc(mission.prompt)}</div>`:''}<div class="hybrid-preview-blocks">${blocks.length?blocks.map(renderBlock).join(''):'<div class="hybrid-preview-empty">Esta misión todavía no tiene contenidos.</div>'}</div></section></article>`;
  }
  function renderHybridPreview(){
    try{saveAllFields()}catch(e){}
    const course=data.course||{},modules=data.modules||[],body=$e('editorPreviewBodyV2'),wrap=$e('editorPreviewV2');
    if(!body||!wrap)return;
    if(previewModuleIndex>=modules.length)previewModuleIndex=Math.max(0,modules.length-1);
    const module=modules[previewModuleIndex];
    if(module&&isMissionModule(module))ensureSelection(module);else previewMissionId='';
    body.innerHTML=`<div class="hybrid-preview-shell"><section class="hybrid-preview-course"><small>${esc(course.status||'Borrador')} · Vista del animador</small><h2>${esc(course.title||'Curso')}</h2><p>${esc(course.description||course.subtitle||'Recorrido formativo CAFASSO.')}</p></section>${modules.length?`<nav class="hybrid-preview-module-tabs">${modules.map((m,i)=>`<button type="button" class="hybrid-preview-module-tab ${i===previewModuleIndex?'active':''}" data-preview-module="${i}"><small>Módulo ${i+1} · ${isMissionModule(m)?'🗺️ Misiones':'📖 Recorrido'}</small><strong>${esc(m.title||'Módulo')}</strong></button>`).join('')}</nav><main class="hybrid-preview-stage">${isMissionModule(module)?renderMissionModule(module,previewModuleIndex):renderLinear(module,previewModuleIndex)}</main>`:'<div class="hybrid-preview-empty">Todavía no hay módulos.</div>'}<div class="hybrid-preview-footnote">Vista previa local · no modifica progreso, entregas ni Almitas reales.</div></div>`;
    wrap.classList.add('show');
    document.querySelectorAll('.editor-step').forEach(x=>x.classList.toggle('active',x.dataset.step==='publish'));
  }

  const previewBtn=$e('previewBtn');
  if(previewBtn){
    previewBtn.onclick=()=>{
      previewModuleIndex=Math.max(0,Number(active)||0);
      const module=currentPreviewModule();
      if(module&&isMissionModule(module)){
        const list=missions(module);
        const selectedBlock=module.contents?.[activeBlock];
        const fromBlock=selectedBlock?.settings?.missionId;
        previewMissionId=list.some(m=>m.id===fromBlock)?fromBlock:(list[0]?.id||'');
      }else previewMissionId='';
      renderHybridPreview();
    };
  }
  document.addEventListener('click',e=>{
    const moduleBtn=e.target.closest('[data-preview-module]');
    if(moduleBtn){
      previewModuleIndex=Math.max(0,Number(moduleBtn.dataset.previewModule)||0);
      previewMissionId='';
      const module=currentPreviewModule();if(module&&isMissionModule(module))ensureSelection(module);
      renderHybridPreview();
      return;
    }
    const missionBtn=e.target.closest('[data-preview-mission]');
    if(missionBtn){
      previewMissionId=missionBtn.dataset.previewMission;
      renderHybridPreview();
    }
  });
})();