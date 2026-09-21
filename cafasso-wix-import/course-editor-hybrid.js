(()=>{
  if(typeof data==='undefined'||typeof render!=='function'||document.getElementById('cafassoHybridCourseEditor'))return;
  const $e=id=>document.getElementById(id);
  let activeMissionId='';

  const style=document.createElement('style');
  style.id='cafassoHybridCourseEditor';
  style.textContent=`
    .experience-mode{margin:4px 0 17px;padding:14px;border:1px solid #d9ccb4;border-radius:9px;background:#f6eddd}
    .experience-mode__head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:10px}
    .experience-mode__head strong{display:block;color:#304a40;font:20px Georgia,serif}.experience-mode__head small{display:block;color:#756f64;margin-top:3px;line-height:1.4}
    .experience-mode__choices{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .experience-choice{border:1px solid #d9ccb4;background:#fffaf0;color:#40564c;border-radius:8px;padding:11px 12px;text-align:left;cursor:pointer;min-height:70px}
    .experience-choice b{display:block;font-size:13px;margin-bottom:4px}.experience-choice span{display:block;color:#777167;font-size:11px;line-height:1.35}
    .experience-choice.active{background:#314d43;border-color:#314d43;color:#fff}.experience-choice.active span{color:#e8eee9}
    .mission-builder{display:none;margin:0 0 18px;padding:15px;border:1px solid #d8c798;border-radius:9px;background:#f7edd6}.mission-builder.show{display:block}
    .mission-builder__head{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:12px}.mission-builder__head strong{font:21px Georgia,serif;color:#30483f}.mission-builder__head button{border:1px solid #ccb77d;background:#fff8e7;color:#395247;border-radius:7px;padding:8px 10px;font-weight:850;cursor:pointer}
    .mission-tabs{display:flex;gap:7px;overflow-x:auto;padding:2px 1px 10px;scrollbar-width:thin}.mission-tab{flex:0 0 auto;min-width:145px;border:1px solid #d9c99e;background:#fffaf0;color:#3e554c;border-radius:8px;padding:9px 10px;text-align:left;cursor:pointer}.mission-tab.active{background:#d8bd70;border-color:#b99435;color:#263d35}.mission-tab i{font-style:normal;font-size:18px;margin-right:5px}.mission-tab strong{display:block;font:800 11px Inter,system-ui}.mission-tab small{display:block;margin-top:3px;color:inherit;opacity:.72;font-size:9px}
    .mission-editor{border-top:1px solid #ddcfaa;padding-top:13px}.mission-editor-grid{display:grid;grid-template-columns:90px 1fr;gap:10px}.mission-editor label{display:grid;gap:5px;color:#5b5a50;font-size:10px;font-weight:850;text-transform:uppercase;letter-spacing:.04em}.mission-editor input,.mission-editor textarea{width:100%;border:1px solid #d7c69c;background:#fffaf0;border-radius:7px;padding:9px 10px;color:#334b42;font:inherit}.mission-editor textarea{min-height:64px;resize:vertical}.mission-editor__wide{grid-column:1/-1}.mission-editor-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.mission-editor-actions button{border:1px solid #d5c59c;background:#fffaf0;color:#3d554b;border-radius:6px;padding:7px 9px;font-size:10px;font-weight:850;cursor:pointer}.mission-editor-actions button.danger{color:#984f43;border-color:#deb8b0;background:#fff5f1}
    .mission-assignment{margin:0 0 14px;padding:11px 12px;border:1px solid #d8c798;border-radius:8px;background:#f7edd6}.mission-assignment label{display:grid;gap:6px;color:#5e552f;font-size:11px;font-weight:850}.mission-assignment select{width:100%;border:1px solid #d4c08b;background:#fffaf0;border-radius:7px;padding:9px 10px;color:#354f44;font:inherit}.mission-badge{display:inline-flex;margin-left:6px;padding:2px 6px;border-radius:999px;background:#eee2c5;color:#6a5621;font-size:8px;font-weight:850;vertical-align:middle}
    .mission-empty{padding:12px;border:1px dashed #cdbb89;border-radius:8px;color:#766a49;font-size:11px;line-height:1.45;background:rgba(255,250,240,.55)}
    @media(max-width:700px){.experience-mode__choices{grid-template-columns:1fr}.mission-editor-grid{grid-template-columns:70px 1fr}.mission-builder{padding:12px}.mission-tab{min-width:130px}}
  `;
  document.head.appendChild(style);

  function currentModule(){return data.modules?.[active]||null}
  function settings(module=currentModule()){if(!module)return{};module.settings=module.settings&&typeof module.settings==='object'?module.settings:{};return module.settings}
  function missions(module=currentModule()){const list=settings(module).missions;return Array.isArray(list)?list:[]}
  function isMissionMode(module=currentModule()){
    if(!module)return false;
    const s=settings(module);
    if(s.experienceMode==='linear')return false;
    return s.experienceMode==='missions'||Array.isArray(s.missions)&&s.missions.length>0;
  }
  function uid(){return 'm-'+crypto.randomUUID().replace(/-/g,'').slice(0,10)}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
  function markChanged(){
    try{cache()}catch(e){}
    const state=$e('editorSaveState');if(state){state.classList.add('dirty');state.textContent='● Cambios todavía no guardados en Wix'}
    const sync=$e('syncStatus');if(sync&&!sync.textContent.includes('Nuevo curso')){sync.textContent='Cambios locales · falta guardar en Wix';sync.classList.add('warn')}
  }
  function ensureMissionSelection(){
    const list=missions();
    if(!list.length){activeMissionId='';return}
    if(!activeMissionId||!list.some(m=>m.id===activeMissionId))activeMissionId=list[0].id;
  }
  function createMission(label='Nueva misión'){
    const list=missions();
    const id=uid();
    const mission={id,title:label,objective:'',prompt:'',icon:'🧭'};
    list.push(mission);settings().missions=list;settings().experienceMode='missions';activeMissionId=id;return mission;
  }
  function assignUnassignedBlocks(targetId){
    const m=currentModule();if(!m||!targetId)return;
    (m.contents||[]).forEach(block=>{block.settings=block.settings||{};if(!block.settings.missionId)block.settings.missionId=targetId});
  }
  function setMode(mode){
    try{saveAllFields()}catch(e){}
    const m=currentModule();if(!m)return;
    const s=settings(m);
    if(mode==='missions'){
      s.experienceMode='missions';
      if(!Array.isArray(s.missions)||!s.missions.length){s.missions=[];const first=createMission('Misión 1');assignUnassignedBlocks(first.id)}
      ensureMissionSelection();
    }else{
      s.experienceMode='linear';
      activeMissionId='';
    }
    markChanged();render();
  }

  const moduleSection=$e('moduleHeading')?.closest('.section');
  if(moduleSection){
    const mode=document.createElement('div');mode.className='experience-mode';mode.id='experienceModeHybrid';
    mode.innerHTML=`<div class="experience-mode__head"><div><strong>¿Cómo se vive este módulo?</strong><small>Podés combinar módulos clásicos y módulos gamificados dentro del mismo curso.</small></div></div><div class="experience-mode__choices"><button type="button" class="experience-choice" data-experience-mode="linear"><b>📖 Recorrido</b><span>Contenidos en secuencia: texto, video, reflexión, entrega, evaluación…</span></button><button type="button" class="experience-choice" data-experience-mode="missions"><b>🗺️ Misiones</b><span>El módulo se organiza en paradas con objetivo, consigna y contenidos propios.</span></button></div>`;
    $e('moduleHeading').insertAdjacentElement('afterend',mode);

    const builder=document.createElement('div');builder.className='mission-builder';builder.id='missionBuilderHybrid';
    builder.innerHTML='<div class="mission-builder__head"><div><strong>Misiones del módulo</strong><div style="font-size:10px;color:#766f60;margin-top:3px">Cada bloque puede pertenecer a una misión. Las misiones se recorren en este orden.</div></div><button type="button" data-add-mission>＋ Misión</button></div><div class="mission-tabs" id="missionTabsHybrid"></div><div class="mission-editor" id="missionEditorHybrid"></div>';
    const unlock=$e('moduleUnlock')?.closest('label');(unlock||moduleSection.lastElementChild)?.insertAdjacentElement('afterend',builder);
  }

  const blockFields=$e('blockFields');
  if(blockFields){
    const assignment=document.createElement('div');assignment.className='mission-assignment';assignment.id='missionAssignmentHybrid';assignment.style.display='none';
    assignment.innerHTML='<label>Misión de este bloque<select id="blockMissionHybrid"></select></label>';
    const typeRow=$e('blockType')?.closest('.fields2');(typeRow||blockFields.firstElementChild)?.insertAdjacentElement('afterend',assignment);
  }

  function renderMode(){
    const mission=isMissionMode();
    document.querySelectorAll('[data-experience-mode]').forEach(btn=>btn.classList.toggle('active',btn.dataset.experienceMode===(mission?'missions':'linear')));
    const builder=$e('missionBuilderHybrid');if(builder)builder.classList.toggle('show',mission);
    if(mission){ensureMissionSelection();renderMissionBuilder()}
  }
  function renderMissionBuilder(){
    const list=missions();ensureMissionSelection();
    const tabs=$e('missionTabsHybrid'),editor=$e('missionEditorHybrid');if(!tabs||!editor)return;
    if(!list.length){tabs.innerHTML='';editor.innerHTML='<div class="mission-empty">Este módulo todavía no tiene misiones. Agregá la primera para empezar.</div>';return}
    tabs.innerHTML=list.map((m,i)=>`<button type="button" class="mission-tab ${m.id===activeMissionId?'active':''}" data-mission-id="${esc(m.id)}"><span><i>${esc(m.icon||'🧭')}</i><strong>${i+1}. ${esc(m.title||'Misión')}</strong><small>${esc(m.objective||'Sin objetivo todavía')}</small></span></button>`).join('');
    const mission=list.find(m=>m.id===activeMissionId)||list[0];activeMissionId=mission.id;
    const count=(currentModule()?.contents||[]).filter(b=>b?.settings?.missionId===mission.id).length;
    editor.innerHTML=`<div class="mission-editor-grid"><label>Icono<input id="missionIconHybrid" maxlength="8" value="${esc(mission.icon||'🧭')}"></label><label>Título<input id="missionTitleHybrid" value="${esc(mission.title||'')}"></label><label class="mission-editor__wide">Objetivo<textarea id="missionObjectiveHybrid" placeholder="¿Qué tiene que descubrir, comprender o vivir?">${esc(mission.objective||'')}</textarea></label><label class="mission-editor__wide">Consigna / narrativa<textarea id="missionPromptHybrid" placeholder="¿Qué tiene que hacer en esta parada?">${esc(mission.prompt||'')}</textarea></label></div><div class="mission-editor-actions"><button type="button" data-mission-up>↑ Mover</button><button type="button" data-mission-down>↓ Mover</button><button type="button" data-duplicate-mission>⧉ Duplicar</button><button type="button" class="danger" data-delete-mission>Eliminar</button><span style="margin-left:auto;align-self:center;color:#746d5f;font-size:10px;font-weight:800">${count} bloque${count===1?'':'s'}</span></div>`;
  }
  function saveMissionFields(){
    if(!isMissionMode())return;
    const mission=missions().find(m=>m.id===activeMissionId);if(!mission)return;
    const icon=$e('missionIconHybrid'),title=$e('missionTitleHybrid'),objective=$e('missionObjectiveHybrid'),prompt=$e('missionPromptHybrid');
    if(icon)mission.icon=icon.value.trim()||'🧭';if(title)mission.title=title.value.trim()||'Misión';if(objective)mission.objective=objective.value;if(prompt)mission.prompt=prompt.value;
  }
  function refreshBlockAssignment(){
    const box=$e('missionAssignmentHybrid'),sel=$e('blockMissionHybrid'),block=data.modules?.[active]?.contents?.[activeBlock];
    const missionMode=isMissionMode();if(!box||!sel){return}box.style.display=missionMode&&block?'block':'none';if(!missionMode||!block)return;
    const list=missions();
    sel.innerHTML=list.map((m,i)=>`<option value="${esc(m.id)}">${i+1}. ${esc(m.title||'Misión')}</option>`).join('');
    block.settings=block.settings||{};
    if(!block.settings.missionId&&list.length){block.settings.missionId=activeMissionId||list[0].id;markChanged()}
    sel.value=block.settings.missionId||'';
    if(block.settings.missionId&&block.settings.missionId!==activeMissionId&&list.some(m=>m.id===block.settings.missionId)){activeMissionId=block.settings.missionId;renderMissionBuilder()}
  }
  function decorateContentMissions(){
    if(!isMissionMode())return;
    const list=new Map(missions().map(m=>[m.id,m]));
    document.querySelectorAll('#contentList .content').forEach((row,i)=>{
      const block=currentModule()?.contents?.[i],mission=list.get(block?.settings?.missionId);const strong=row.querySelector('strong');if(!strong||!mission)return;
      if(!strong.querySelector('.mission-badge'))strong.insertAdjacentHTML('beforeend',`<span class="mission-badge">${esc(mission.icon||'🧭')} ${esc(mission.title||'Misión')}</span>`);
    });
  }

  const originalNewBlock=newBlock;
  newBlock=function(type){
    const block=originalNewBlock(type);
    if(isMissionMode()){
      ensureMissionSelection();block.settings={...(block.settings||{}),missionId:activeMissionId||missions()[0]?.id||''};
    }
    return block;
  };
  const originalSaveModuleFields=saveModuleFields;
  saveModuleFields=function(){saveMissionFields();originalSaveModuleFields();};
  const originalSaveBlockFields=saveBlockFields;
  saveBlockFields=function(){originalSaveBlockFields();const block=data.modules?.[active]?.contents?.[activeBlock],sel=$e('blockMissionHybrid');if(block&&isMissionMode()&&sel){block.settings={...(block.settings||{}),missionId:sel.value||activeMissionId}}};
  const originalRender=render;
  render=function(){originalRender();renderMode();setTimeout(()=>{refreshBlockAssignment();decorateContentMissions()},0)};
  const originalRenderContents=renderContents;
  renderContents=function(){originalRenderContents();setTimeout(decorateContentMissions,0)};
  const originalRenderBlock=renderBlock;
  renderBlock=function(){originalRenderBlock();setTimeout(refreshBlockAssignment,0)};

  function missionPublishProblem(){
    for(let mi=0;mi<(data.modules||[]).length;mi++){
      const module=data.modules[mi],s=module?.settings&&typeof module.settings==='object'?module.settings:{};
      const missionMode=s.experienceMode==='missions'||(s.experienceMode!=='linear'&&Array.isArray(s.missions)&&s.missions.length>0);
      if(!missionMode||module.status!=='Publicado')continue;
      const list=Array.isArray(s.missions)?s.missions:[];
      if(!list.length)return{mi,message:`“${module.title||'Módulo'}” está en modo Misiones pero no tiene ninguna misión.`};
      const valid=new Set(list.map(m=>m.id));
      (module.contents||[]).forEach(block=>{block.settings=block.settings||{};if(!valid.has(block.settings.missionId))block.settings.missionId=list[0].id});
      for(const mission of list){
        if(!String(mission.title||'').trim())return{mi,missionId:mission.id,message:`Hay una misión sin título en “${module.title||'Módulo'}”.`};
        if(!(module.contents||[]).some(block=>block?.settings?.missionId===mission.id))return{mi,missionId:mission.id,message:`La misión “${mission.title||'Misión'}” necesita al menos un bloque de contenido.`};
      }
    }
    return null;
  }
  const originalHybridSave=saveToWix;
  saveToWix=async function(publish=false){
    saveMissionFields();
    if(publish){
      const problem=missionPublishProblem();
      if(problem){active=problem.mi;activeBlock=-1;activeMissionId=problem.missionId||'';render();try{toast(problem.message)}catch(e){alert(problem.message)};setTimeout(()=>$e('missionBuilderHybrid')?.scrollIntoView({behavior:'smooth',block:'center'}),0);return false}
    }
    return originalHybridSave(publish);
  };

  document.addEventListener('click',e=>{
    const mode=e.target.closest('[data-experience-mode]');if(mode){setMode(mode.dataset.experienceMode);return}
    const tab=e.target.closest('[data-mission-id]');if(tab){saveMissionFields();activeMissionId=tab.dataset.missionId;renderMissionBuilder();refreshBlockAssignment();return}
    if(e.target.closest('[data-add-mission]')){saveMissionFields();createMission(`Misión ${missions().length+1}`);markChanged();renderMissionBuilder();refreshBlockAssignment();return}
    if(e.target.closest('[data-mission-up]')||e.target.closest('[data-mission-down]')){
      saveMissionFields();const list=missions(),i=list.findIndex(m=>m.id===activeMissionId);if(i<0)return;const dir=e.target.closest('[data-mission-up]')?-1:1,j=i+dir;if(j<0||j>=list.length)return;[list[i],list[j]]=[list[j],list[i]];settings().missions=list;markChanged();renderMissionBuilder();return
    }
    if(e.target.closest('[data-duplicate-mission]')){
      saveMissionFields();const list=missions(),source=list.find(m=>m.id===activeMissionId);if(!source)return;const copy={...JSON.parse(JSON.stringify(source)),id:uid(),title:(source.title||'Misión')+' · copia'};const i=list.indexOf(source);list.splice(i+1,0,copy);const module=currentModule();const sourceBlocks=(module.contents||[]).filter(b=>b?.settings?.missionId===source.id);sourceBlocks.forEach(b=>{const cloned=JSON.parse(JSON.stringify(b));cloned._id='local-'+crypto.randomUUID();cloned.settings={...(cloned.settings||{}),missionId:copy.id};module.contents.push(cloned)});settings().missions=list;activeMissionId=copy.id;markChanged();render();return
    }
    if(e.target.closest('[data-delete-mission]')){
      const list=missions();if(list.length<=1){try{toast('Un módulo de Misiones necesita al menos una misión')}catch(_){ }return}
      const mission=list.find(m=>m.id===activeMissionId);if(!mission)return;const assigned=(currentModule().contents||[]).filter(b=>b?.settings?.missionId===mission.id).length;const detail=assigned?`\n\nSus ${assigned} bloque${assigned===1?'':'s'} pasarán a la misión anterior o siguiente.`:'';if(!confirm(`¿Eliminar “${mission.title||'Misión'}”?${detail}`))return;
      const i=list.indexOf(mission),fallback=list[i-1]||list[i+1];(currentModule().contents||[]).forEach(b=>{if(b?.settings?.missionId===mission.id)b.settings.missionId=fallback.id});list.splice(i,1);settings().missions=list;activeMissionId=fallback.id;markChanged();render();return
    }
  });
  document.addEventListener('input',e=>{if(['missionIconHybrid','missionTitleHybrid','missionObjectiveHybrid','missionPromptHybrid'].includes(e.target.id)){saveMissionFields();markChanged()}});
  document.addEventListener('change',e=>{if(['missionIconHybrid','missionTitleHybrid','missionObjectiveHybrid','missionPromptHybrid'].includes(e.target.id)){saveMissionFields();renderMissionBuilder();markChanged()}});
  $e('blockMissionHybrid')?.addEventListener('change',e=>{const block=data.modules?.[active]?.contents?.[activeBlock];if(!block)return;block.settings={...(block.settings||{}),missionId:e.target.value};activeMissionId=e.target.value;markChanged();renderContents();refreshBlockAssignment();});

  render();
})();
