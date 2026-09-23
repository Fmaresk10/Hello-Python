(()=>{
  if(window.__cafassoCourseWorkspaceInstalled)return;
  window.__cafassoCourseWorkspaceInstalled=true;

  const TYPES=[
    ['Texto','📝','Una lectura o explicación breve.'],
    ['Video','🎬','Video de YouTube o Google Drive.'],
    ['Imagen','🖼️','Una imagen con contexto o epígrafe.'],
    ['Documento','📄','Material de Drive, Docs o PDF.'],
    ['Reflexión','💭','Una pregunta para detenerse y pensar.'],
    ['Entrega','📥','Una producción para enviar al formador.'],
    ['Desafío','⭐','Una acción concreta con Almitas.'],
    ['Evaluación','✅','Respuesta abierta o cuestionario.']
  ];
  const $e=id=>document.getElementById(id);
  const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  let refreshQueued=false;

  function installStyles(){
    if($e('cafassoCourseWorkspace'))return;
    const style=document.createElement('style');
    style.id='cafassoCourseWorkspace';
    style.textContent=[
      'body.cafasso-course-workspace{background:linear-gradient(135deg,#e8ddc9,#f6edde 52%,#ece2d1)!important}',
      'body.cafasso-course-workspace .shell{grid-template-columns:178px minmax(0,1fr)!important}',
      'body.cafasso-course-workspace .side{padding:24px 18px!important}',
      'body.cafasso-course-workspace .side h4,body.cafasso-course-workspace .side-tools{display:none!important}',
      'body.cafasso-course-workspace .side .brand{padding-bottom:18px;border-bottom:1px solid rgba(255,255,255,.12)}',
      'body.cafasso-course-workspace .side .brand b{font-size:23px!important}',
      'body.cafasso-course-workspace .side .brand small{font-size:8px!important}',
      'body.cafasso-course-workspace .side .back{left:18px!important;right:18px!important;font-size:11px!important}',
      'body.cafasso-course-workspace main{max-width:1120px!important;padding:20px clamp(18px,2.5vw,32px) 42px!important}',
      'body.cafasso-course-workspace .top{padding:15px 18px!important;margin-bottom:10px!important;align-items:center!important}',
      'body.cafasso-course-workspace .top h1{font-size:clamp(30px,3vw,40px)!important;margin:4px 0 2px!important}',
      'body.cafasso-course-workspace .top p{font-size:13.5px!important}',
      'body.cafasso-course-workspace .top .eyebrow{font-size:10px!important}',
      'body.cafasso-course-workspace .editor-shortcuts,body.cafasso-course-workspace .editor-flow{display:none!important}',
      'body.cafasso-course-workspace .save-state,body.cafasso-course-workspace .editor-mobile-actions{display:none!important}',
      'body.cafasso-course-workspace .actions{align-items:center!important;gap:7px!important}',
      'body.cafasso-course-workspace .actions #reloadBtn,body.cafasso-course-workspace .actions #courseTemplateBtn{display:none!important}',
      'body.cafasso-course-workspace .actions .btn{min-height:38px!important;padding:8px 12px!important;font-size:12.5px!important}',
      '.workspace-top-control{min-height:38px;border:1px solid #d8c9ae;border-radius:7px;background:#fffaf0;color:#365349;padding:8px 11px;font:800 12.5px Inter,system-ui;cursor:pointer}',
      '.workspace-more-wrap{position:relative}',
      '.workspace-more-menu{position:absolute;right:0;top:calc(100% + 7px);z-index:90;display:none;width:220px;padding:7px;border:1px solid #d7c7aa;border-radius:9px;background:#fffaf0;box-shadow:0 16px 38px rgba(47,42,33,.18)}',
      '.workspace-more-wrap.open .workspace-more-menu{display:grid;gap:3px}',
      '.workspace-more-menu button{border:0;border-radius:6px;background:transparent;color:#3d5148;padding:9px 10px;text-align:left;font:750 12px Inter,system-ui;cursor:pointer}',
      '.workspace-more-menu button:hover{background:#eee3cf}',
      '.workspace-more-menu button.danger{color:#995347}',
      '.workspace-course-strip{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 10px;padding:8px 12px;border:1px solid rgba(112,84,48,.16);border-radius:8px;background:rgba(255,250,239,.72);color:#536159}',
      '.workspace-course-strip__main{display:flex;align-items:center;gap:7px;flex-wrap:wrap;font-size:13px}',
      '.workspace-course-strip__main strong{color:#314a40;font-weight:850}',
      '.workspace-chip{display:inline-flex;align-items:center;min-height:28px;padding:6px 9px;border:1px solid #d7c8ac;border-radius:999px;background:#fffaf0;color:#625b4f;font:800 10.5px/1 Inter,system-ui}',
      '.workspace-chip.is-published{background:#e9f2eb;border-color:#bfd5c5;color:#34634c}',
      '.workspace-sync{max-width:360px;color:#766f64;font-size:10.5px;line-height:1.3;text-align:right}',
      'body.cafasso-course-workspace .layout{display:flex!important;flex-direction:column!important;align-items:stretch!important;gap:11px!important;overflow:visible!important}',
      'body.cafasso-course-workspace .outline,body.cafasso-course-workspace .editor{padding:14px!important;border-radius:10px!important}',
      'body.cafasso-course-workspace .outline{position:static!important;top:auto!important;left:auto!important;right:auto!important;bottom:auto!important;height:auto!important;max-height:none!important;min-height:0!important;overflow:visible!important;overscroll-behavior:auto!important;z-index:auto!important;margin:0!important;flex:0 0 auto!important}',
      'body.cafasso-course-workspace .outline h3{margin-bottom:9px!important;font-size:28px!important;line-height:1.05!important}',
      'body.cafasso-course-workspace .outline .drag-hint,body.cafasso-course-workspace .outline .module-jump,body.cafasso-course-workspace .outline .module-actions,body.cafasso-course-workspace .outline #addModule,body.cafasso-course-workspace .outline #deleteModule,body.cafasso-course-workspace .outline .editor-extra-actions,body.cafasso-course-workspace .outline #syncStatus,body.cafasso-course-workspace .outline .danger-zone{display:none!important}',
      'body.cafasso-course-workspace #moduleList{display:grid;gap:6px}',
      'body.cafasso-course-workspace .module{position:relative;margin:0!important;padding:10px 48px 10px 15px!important;border-radius:8px!important;min-height:58px;transition:.15s ease}',
      'body.cafasso-course-workspace .module:hover{transform:translateY(-1px);border-color:#c9b17a!important}',
      'body.cafasso-course-workspace .module.active{box-shadow:inset 4px 0 #b99642,0 5px 14px rgba(70,57,35,.06)!important}',
      'body.cafasso-course-workspace .module strong{font:600 19px/1.15 Georgia,serif!important;color:#30483f!important}',
      'body.cafasso-course-workspace .module small{margin-top:4px!important;font-size:11px!important;line-height:1.25!important}',
      '.workspace-module-tag{display:inline-flex;margin-left:8px;padding:4px 7px;border-radius:999px;background:#eee3ca;color:#6c5b36;font:800 9px/1 Inter,system-ui;vertical-align:2px}',
      '.workspace-module-arrow{position:absolute;right:14px;top:50%;transform:translateY(-50%);display:grid;place-items:center;width:28px;height:28px;border:1px solid #d6c7aa;border-radius:50%;background:#fffaf0;color:#536258;font-size:15px}',
      '.workspace-outline-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px;padding-top:8px;border-top:1px solid #e3d7c4}',
      '.workspace-outline-foot .workspace-add-module{flex:1;min-height:38px;border:1px dashed #bba36e;border-radius:7px;background:#f8eed9;color:#40574d;font:850 13px Inter,system-ui;cursor:pointer}',
      '.workspace-module-actions{position:relative}',
      '.workspace-module-actions>button{width:39px;height:39px;border:1px solid #d6c6a8;border-radius:7px;background:#fffaf0;color:#40564c;font-weight:900;cursor:pointer}',
      '.workspace-module-menu{position:absolute;right:0;bottom:calc(100% + 7px);z-index:30;display:none;width:210px;padding:7px;border:1px solid #d7c6a7;border-radius:8px;background:#fffaf0;box-shadow:0 14px 34px rgba(50,43,31,.16)}',
      '.workspace-module-actions.open .workspace-module-menu{display:grid;gap:3px}',
      '.workspace-module-menu button{border:0;border-radius:5px;background:transparent;padding:9px 10px;color:#40564c;text-align:left;font:750 12px Inter,system-ui;cursor:pointer}',
      '.workspace-module-menu button:hover{background:#eee3cf}',
      '.workspace-module-menu button.danger{color:#995347}',
      'body.cafasso-course-workspace .editor{display:block!important;position:relative!important;z-index:0!important;width:100%!important;min-width:0!important;flex:0 0 auto!important;clear:both!important}',
      '#courseCompletenessCheck{display:none!important}',
      'body.workspace-review-open #courseCompletenessCheck{display:block!important;margin:0 0 12px!important}',
      '.workspace-active-module{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;margin-bottom:8px;padding:11px 14px;border:1px solid #d9cbae;border-radius:9px;background:linear-gradient(100deg,#f8efdd,#fffaf0)}',
      '.workspace-active-module__kicker{color:#98752b;font:850 10px/1 Inter,system-ui;letter-spacing:.13em;text-transform:uppercase}',
      '.workspace-active-module h2{margin:4px 0 5px;color:#2f493f;font:500 30px/1 Georgia,serif}',
      '.workspace-active-module__meta{display:flex;gap:6px;flex-wrap:wrap;color:#756d60;font-size:11px;font-weight:750}',
      '.workspace-active-module__actions{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}',
      '.workspace-active-module__actions button{min-height:37px;border:1px solid #d3c2a2;border-radius:7px;background:#fffaf0;color:#3c554a;padding:8px 11px;font:800 12px Inter,system-ui;cursor:pointer}',
      '.workspace-collapsible{margin:0 0 8px!important;padding:0!important;border:1px solid #ded1bc!important;border-radius:9px!important;background:#fbf4e7!important;overflow:hidden}',
      '.workspace-section-toggle{width:100%;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;border:0;background:transparent;padding:10px 14px;color:#344d43;text-align:left;cursor:pointer}',
      '.workspace-section-toggle strong{display:block;font:500 21px/1.08 Georgia,serif}',
      '.workspace-section-toggle small{display:block;margin-top:3px;color:#797267;font:11.5px/1.35 Inter,system-ui}',
      '.workspace-section-toggle span:last-child{font-size:18px;transition:transform .16s ease}',
      '.workspace-collapsible.workspace-open>.workspace-section-toggle span:last-child{transform:rotate(180deg)}',
      '.workspace-collapsible:not(.workspace-open)>:not(.workspace-section-toggle){display:none!important}',
      '.workspace-collapsible.workspace-open> :not(.workspace-section-toggle){margin-left:15px!important;margin-right:15px!important}',
      '.workspace-collapsible.workspace-open> :last-child{margin-bottom:15px!important}',
      '.workspace-collapsible>.editor-sheet-kicker,.workspace-collapsible>h3{display:none!important}',
      'body.cafasso-course-workspace .editor-contents-sheet{margin:0!important;padding:13px!important;border:1px solid #d8c9ad!important;border-radius:9px!important;background:#fffaf0!important}',
      'body.cafasso-course-workspace .editor-contents-sheet>.editor-sheet-kicker,body.cafasso-course-workspace .editor-contents-sheet>div[style*="display:flex"],body.cafasso-course-workspace .editor-contents-sheet>.drag-hint,body.cafasso-course-workspace .editor-contents-sheet>.quick-content-bar,body.cafasso-course-workspace .editor-contents-sheet>.editor-extra-actions{display:none!important}',
      '.workspace-content-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px}',
      '.workspace-content-head small{display:block;color:#98752b;font:850 10px/1 Inter,system-ui;letter-spacing:.13em;text-transform:uppercase}',
      '.workspace-content-head h3{margin:3px 0 0!important;color:#2f493f!important;font:500 28px/1 Georgia,serif!important}',
      '.workspace-add-content{min-height:40px;border:0;border-radius:7px;background:#385c4d;color:#fff;padding:9px 14px;font:850 13px Inter,system-ui;cursor:pointer;box-shadow:0 5px 12px rgba(48,82,68,.14)}',
      'body.cafasso-course-workspace .content-list{gap:6px!important;margin-top:0!important}',
      'body.cafasso-course-workspace .content{position:relative;grid-template-columns:38px minmax(0,1fr) 30px!important;gap:10px!important;padding:9px 11px!important;border-radius:7px!important;min-height:54px}',
      'body.cafasso-course-workspace .content .icon{width:38px!important;height:38px!important;border-radius:7px!important;font-size:17px}',
      'body.cafasso-course-workspace .content strong{font-size:14.5px!important;line-height:1.2!important}',
      'body.cafasso-course-workspace .content small{font-size:10.5px!important;margin-top:2px!important}',
      'body.cafasso-course-workspace .content>.mini{display:none!important}',
      '.workspace-content-open{display:grid;place-items:center;width:26px;height:26px;border:1px solid #d8c9ad;border-radius:50%;background:#fffaf0;color:#52645b;font-size:14px}',
      '.workspace-empty-content{padding:16px 14px;border:1px dashed #cfbd98;border-radius:8px;background:#f8efdd;color:#746b5c;text-align:center;font:13px/1.5 Inter,system-ui}',
      '.workspace-picker{position:fixed;inset:0;z-index:9100;display:none;place-items:center;padding:20px;background:rgba(17,38,33,.68);backdrop-filter:blur(3px)}',
      '.workspace-picker.show{display:grid}',
      '.workspace-picker__card{width:min(720px,96vw);max-height:88vh;overflow:auto;padding:20px;border:1px solid #d2bf99;border-radius:12px;background:#f7eddd;box-shadow:0 28px 80px rgba(20,32,27,.35)}',
      '.workspace-picker__head{display:flex;justify-content:space-between;gap:15px;align-items:flex-start;margin-bottom:15px}',
      '.workspace-picker__head h2{margin:0;color:#2e493e;font:500 31px Georgia,serif}',
      '.workspace-picker__head p{margin:5px 0 0;color:#746f65;font-size:13px}',
      '.workspace-picker__close{width:36px;height:36px;border:0;border-radius:50%;background:#e7dbc6;color:#41564d;font-size:20px;cursor:pointer}',
      '.workspace-picker__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}',
      '.workspace-picker__type{display:grid;grid-template-columns:38px minmax(0,1fr);gap:10px;align-items:center;border:1px solid #d7c6a7;border-radius:8px;background:#fffaf0;padding:11px;text-align:left;color:#3b5148;cursor:pointer}',
      '.workspace-picker__type:hover{border-color:#b79954;background:#fff5df}',
      '.workspace-picker__type i{display:grid;place-items:center;width:38px;height:38px;border-radius:7px;background:#ebe1cd;font-style:normal;font-size:18px}',
      '.workspace-picker__type strong{display:block;font-size:13.5px}.workspace-picker__type small{display:block;margin-top:3px;color:#777066;font-size:10.5px;line-height:1.35}',
      '.workspace-block-backdrop{position:fixed;inset:0;z-index:8990;display:none;background:rgba(21,33,29,.38)}',
      '.workspace-block-backdrop.show{display:block}',
      'body.cafasso-course-workspace .editor-block-sheet{position:fixed!important;right:0;top:0;bottom:0;z-index:9000;width:min(610px,94vw);margin:0!important;padding:76px 22px 34px!important;overflow:auto;border:0!important;border-left:1px solid #cdbb99!important;border-radius:0!important;background:#f7eddd!important;box-shadow:-18px 0 54px rgba(28,37,32,.24);transform:translateX(104%);transition:transform .22s ease}',
      'body.cafasso-course-workspace .editor-block-sheet.workspace-drawer-open{transform:translateX(0)}',
      'body.cafasso-course-workspace .editor-block-sheet>.editor-sheet-kicker{display:block!important;color:#98752b!important}',
      'body.cafasso-course-workspace .editor-block-sheet>h3{font-size:32px!important;margin-top:5px!important}',
      '.workspace-drawer-close{position:absolute;right:18px;top:18px;width:38px;height:38px;border:1px solid #d2c19f;border-radius:50%;background:#fffaf0;color:#40564c;font-size:20px;cursor:pointer}',
      'body.cafasso-course-workspace .editor-block-sheet #blockEmpty{display:none!important}',
      'body.cafasso-course-workspace .block-transfer{margin-top:18px!important}',
      '@media(max-width:900px){body.cafasso-course-workspace .shell{grid-template-columns:1fr!important}body.cafasso-course-workspace .side{position:relative!important;top:auto!important;height:auto!important;min-height:0!important;padding:9px 14px!important;display:flex!important;align-items:center!important;justify-content:space-between!important}body.cafasso-course-workspace .side .brand{padding:0!important;border:0!important}body.cafasso-course-workspace .side .brand div{display:none!important}body.cafasso-course-workspace .side .back{position:static!important;border:0!important;padding:9px!important;font-size:10px!important}body.cafasso-course-workspace main{padding-top:14px!important}}',
      '@media(max-width:700px){body.cafasso-course-workspace main{padding:10px 10px 92px!important}body.cafasso-course-workspace .top{padding:14px!important;display:block!important}body.cafasso-course-workspace .top .actions{margin-top:12px!important;display:grid!important;grid-template-columns:1fr 1fr!important}body.cafasso-course-workspace .top .actions .btn,body.cafasso-course-workspace .workspace-top-control{width:100%!important}body.cafasso-course-workspace .workspace-more-wrap{grid-column:2}body.cafasso-course-workspace .workspace-more-wrap>button{width:100%}.workspace-course-strip{align-items:flex-start;display:block}.workspace-sync{text-align:left;margin-top:7px}.workspace-active-module{grid-template-columns:1fr}.workspace-active-module__actions{justify-content:flex-start}.workspace-content-head{align-items:flex-start}.workspace-content-head h3{font-size:22px!important}.workspace-add-content{white-space:nowrap}.workspace-picker__grid{grid-template-columns:1fr}.workspace-picker{padding:10px}.workspace-picker__card{padding:16px}.workspace-picker__head h2{font-size:25px}body.cafasso-course-workspace .editor-block-sheet{width:100vw;padding:68px 14px 110px!important}.workspace-collapsible.workspace-open> :not(.workspace-section-toggle){margin-left:12px!important;margin-right:12px!important}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function currentModule(){
    try{return data.modules&&data.modules[active]||null}catch(e){return null}
  }
  function isMission(module){
    const s=module&&module.settings&&typeof module.settings==='object'?module.settings:{};
    return s.experienceMode==='missions'||(s.experienceMode!=='linear'&&Array.isArray(s.missions)&&s.missions.length>0);
  }
  function contentCount(){
    try{return (data.modules||[]).reduce((sum,m)=>sum+(Array.isArray(m.contents)?m.contents.length:0),0)}catch(e){return 0}
  }

  function makeCollapsible(section,title,copy){
    if(!section||section.dataset.workspaceCollapsible==='1')return;
    section.dataset.workspaceCollapsible='1';
    section.classList.add('workspace-collapsible');
    const button=document.createElement('button');
    button.type='button';
    button.className='workspace-section-toggle';
    button.innerHTML='<span><strong>'+esc(title)+'</strong><small>'+esc(copy)+'</small></span><span>⌄</span>';
    button.addEventListener('click',()=>section.classList.toggle('workspace-open'));
    section.insertAdjacentElement('afterbegin',button);
  }

  function openSection(section){
    if(!section)return;
    section.classList.add('workspace-open');
    setTimeout(()=>section.scrollIntoView({behavior:'smooth',block:'start'}),30);
  }

  function installHeader(){
    const top=document.querySelector('main .top');
    const actions=top&&top.querySelector('.actions');
    if(!top||!actions)return;

    if(!$e('workspaceCourseStrip')){
      const strip=document.createElement('section');
      strip.id='workspaceCourseStrip';
      strip.className='workspace-course-strip';
      strip.innerHTML='<div class="workspace-course-strip__main"><strong data-workspace-summary>Recorrido del curso</strong><span class="workspace-chip" data-workspace-status>Borrador</span><span class="workspace-chip" data-workspace-shape></span></div><div class="workspace-sync" data-workspace-sync></div>';
      top.insertAdjacentElement('afterend',strip);
    }

    if(!$e('workspaceCourseSettings')){
      const settings=document.createElement('button');
      settings.id='workspaceCourseSettings';
      settings.type='button';
      settings.className='workspace-top-control';
      settings.textContent='Datos del curso';
      settings.addEventListener('click',()=>openSection(document.querySelector('.editor-course-sheet')));
      actions.insertAdjacentElement('afterbegin',settings);
    }

    if(!$e('workspaceMore')){
      const wrap=document.createElement('div');
      wrap.className='workspace-more-wrap';
      wrap.id='workspaceMore';
      wrap.innerHTML='<button type="button" class="workspace-top-control" aria-label="Más opciones">•••</button><div class="workspace-more-menu"><button type="button" data-workspace-review>Revisión del curso</button><button type="button" data-workspace-template>Empezar desde plantilla</button><button type="button" data-workspace-reload>Recargar desde Wix</button><button type="button" class="danger" data-workspace-delete-course>Eliminar curso…</button></div>';
      actions.appendChild(wrap);
      wrap.firstElementChild.addEventListener('click',e=>{e.stopPropagation();wrap.classList.toggle('open')});
      wrap.querySelector('[data-workspace-review]').addEventListener('click',()=>{document.body.classList.toggle('workspace-review-open');wrap.classList.remove('open');if(document.body.classList.contains('workspace-review-open'))$e('courseCompletenessCheck')?.scrollIntoView({behavior:'smooth',block:'center'})});
      wrap.querySelector('[data-workspace-template]').addEventListener('click',()=>{$e('courseTemplateBtn')?.click();wrap.classList.remove('open')});
      wrap.querySelector('[data-workspace-reload]').addEventListener('click',()=>{$e('reloadBtn')?.click();wrap.classList.remove('open')});
      wrap.querySelector('[data-workspace-delete-course]').addEventListener('click',()=>{$e('deleteCourseBtn')?.click();wrap.classList.remove('open')});
    }
  }

  function installOutline(){
    const outline=$e('moduleList')?.closest('.outline');
    if(!outline)return;
    if(!outline.querySelector('.workspace-outline-foot')){
      const foot=document.createElement('div');
      foot.className='workspace-outline-foot';
      foot.innerHTML='<button type="button" class="workspace-add-module">＋ Agregar módulo</button><div class="workspace-module-actions"><button type="button" aria-label="Opciones del módulo">•••</button><div class="workspace-module-menu"><button type="button" data-ws-module-up>↑ Mover módulo arriba</button><button type="button" data-ws-module-down>↓ Mover módulo abajo</button><button type="button" data-ws-module-duplicate>⧉ Duplicar módulo</button><button type="button" class="danger" data-ws-module-delete>Eliminar módulo…</button></div></div>';
      outline.appendChild(foot);
      foot.querySelector('.workspace-add-module').addEventListener('click',()=>$e('addModule')?.click());
      const actions=foot.querySelector('.workspace-module-actions');
      actions.firstElementChild.addEventListener('click',e=>{e.stopPropagation();actions.classList.toggle('open')});
      foot.querySelector('[data-ws-module-up]').addEventListener('click',()=>{$e('moduleUp')?.click();actions.classList.remove('open')});
      foot.querySelector('[data-ws-module-down]').addEventListener('click',()=>{$e('moduleDown')?.click();actions.classList.remove('open')});
      foot.querySelector('[data-ws-module-duplicate]').addEventListener('click',()=>{$e('duplicateModuleV2')?.click();actions.classList.remove('open')});
      foot.querySelector('[data-ws-module-delete]').addEventListener('click',()=>{$e('deleteModule')?.click();actions.classList.remove('open')});
    }
  }

  function installActiveModule(){
    const editor=document.querySelector('.editor');
    if(!editor||$e('workspaceActiveModule'))return;
    const bar=document.createElement('section');
    bar.id='workspaceActiveModule';
    bar.className='workspace-active-module';
    bar.innerHTML='<div><div class="workspace-active-module__kicker">Etapa seleccionada</div><h2 data-workspace-module-title>Módulo</h2><div class="workspace-active-module__meta" data-workspace-module-meta></div></div><div class="workspace-active-module__actions"><button type="button" data-workspace-config-module>Configurar módulo</button></div>';
    const courseSection=document.querySelector('.editor-course-sheet');
    editor.insertBefore(bar,courseSection||editor.firstChild);
    bar.querySelector('[data-workspace-config-module]').addEventListener('click',()=>openSection(document.querySelector('.editor-module-sheet')));
  }

  function installContentHeader(){
    const section=document.querySelector('.editor-contents-sheet');
    if(!section||section.querySelector('.workspace-content-head'))return;
    const head=document.createElement('div');
    head.className='workspace-content-head';
    head.innerHTML='<div><small>Contenido del módulo</small><h3>Recorrido de esta etapa</h3></div><button type="button" class="workspace-add-content">＋ Agregar contenido</button>';
    section.insertAdjacentElement('afterbegin',head);
    head.querySelector('.workspace-add-content').addEventListener('click',openPicker);
  }

  function installPicker(){
    if($e('workspaceContentPicker'))return;
    const overlay=document.createElement('div');
    overlay.id='workspaceContentPicker';
    overlay.className='workspace-picker';
    overlay.innerHTML='<section class="workspace-picker__card"><div class="workspace-picker__head"><div><h2>Agregar contenido</h2><p>Elegí qué querés sumar. Después CAFASSO te muestra solo las opciones de ese tipo.</p></div><button type="button" class="workspace-picker__close" aria-label="Cerrar">×</button></div><div class="workspace-picker__grid">'+TYPES.map(item=>'<button type="button" class="workspace-picker__type" data-workspace-type="'+esc(item[0])+'"><i>'+item[1]+'</i><span><strong>'+esc(item[0])+'</strong><small>'+esc(item[2])+'</small></span></button>').join('')+'</div></section>';
    document.body.appendChild(overlay);
    overlay.querySelector('.workspace-picker__close').addEventListener('click',closePicker);
    overlay.addEventListener('click',e=>{if(e.target===overlay)closePicker()});
    overlay.querySelectorAll('[data-workspace-type]').forEach(btn=>btn.addEventListener('click',()=>{
      const original=[...document.querySelectorAll('[data-type]')].find(x=>x.dataset.type===btn.dataset.workspaceType);
      original?.click();
      closePicker();
      setTimeout(()=>{refreshWorkspace();openBlockDrawer()},40);
    }));
  }
  function openPicker(){$e('workspaceContentPicker')?.classList.add('show')}
  function closePicker(){$e('workspaceContentPicker')?.classList.remove('show')}

  function installDrawer(){
    const section=document.querySelector('.editor-block-sheet');
    if(!section)return;
    if(!section.querySelector('.workspace-drawer-close')){
      const close=document.createElement('button');
      close.type='button';close.className='workspace-drawer-close';close.setAttribute('aria-label','Cerrar editor de contenido');close.textContent='×';
      close.addEventListener('click',closeBlockDrawer);section.appendChild(close);
    }
    if(!$e('workspaceBlockBackdrop')){
      const backdrop=document.createElement('div');
      backdrop.id='workspaceBlockBackdrop';backdrop.className='workspace-block-backdrop';
      backdrop.addEventListener('click',closeBlockDrawer);document.body.appendChild(backdrop);
    }
  }
  function openBlockDrawer(){
    let index=-1;try{index=Number(activeBlock)}catch(e){}
    const section=document.querySelector('.editor-block-sheet');
    const open=index>=0&&!!(currentModule()?.contents?.[index]);
    section?.classList.toggle('workspace-drawer-open',open);
    $e('workspaceBlockBackdrop')?.classList.toggle('show',open);
    document.body.style.overflow=open?'hidden':'';
    if(open){
      const b=currentModule()?.contents?.[index];
      const h=section?.querySelector(':scope>h3');
      if(h)h.textContent=b?'Editar · '+String(b.title||b.type||'Contenido'):'Editar contenido';
    }
  }
  function closeBlockDrawer(){
    try{saveBlockFields()}catch(e){}
    try{activeBlock=-1}catch(e){}
    try{renderContents();renderBlock()}catch(e){}
    document.querySelector('.editor-block-sheet')?.classList.remove('workspace-drawer-open');
    $e('workspaceBlockBackdrop')?.classList.remove('show');
    document.body.style.overflow='';
    setTimeout(refreshWorkspace,20);
  }

  function decorateModules(){
    const module=currentModule();
    document.querySelectorAll('#moduleList .module').forEach((row,i)=>{
      const m=data.modules?.[i];
      if(!m)return;
      let tag=row.querySelector('.workspace-module-tag');
      if(!tag){tag=document.createElement('span');tag.className='workspace-module-tag';row.querySelector('strong')?.appendChild(tag)}
      tag.textContent=isMission(m)?'🗺️ Misiones':'📖 Recorrido';
      if(!row.querySelector('.workspace-module-arrow')){
        const arrow=document.createElement('span');arrow.className='workspace-module-arrow';arrow.textContent='›';row.appendChild(arrow);
      }
      row.setAttribute('aria-label','Editar módulo '+(i+1)+': '+String(m.title||'Módulo'));
    });
    if(!module)return;
  }

  function decorateContents(){
    const rows=[...document.querySelectorAll('#contentList .content')];
    rows.forEach(row=>{
      if(!row.querySelector('.workspace-content-open')){
        const arrow=document.createElement('span');arrow.className='workspace-content-open';arrow.textContent='›';row.appendChild(arrow);
      }
    });
    const list=$e('contentList');
    if(list&&!rows.length&&!list.querySelector('.workspace-empty-content')){
      const empty=document.createElement('div');empty.className='workspace-empty-content';empty.textContent='Todavía no hay contenidos en este módulo. Usá “Agregar contenido” para empezar.';list.appendChild(empty);
    }
  }

  function refreshSummary(){
    const course=data.course||{};
    const modules=data.modules||[];
    const blocks=contentCount();
    const missionCount=modules.filter(isMission).length;
    const linearCount=modules.length-missionCount;
    const summary=document.querySelector('[data-workspace-summary]');
    const status=document.querySelector('[data-workspace-status]');
    const shape=document.querySelector('[data-workspace-shape]');
    const sync=document.querySelector('[data-workspace-sync]');
    if(summary)summary.textContent=modules.length+' módulo'+(modules.length===1?'':'s')+' · '+blocks+' contenido'+(blocks===1?'':'s');
    if(status){status.textContent=course.status||'Borrador';status.classList.toggle('is-published',String(course.status)==='Publicado')}
    if(shape)shape.textContent=missionCount&&linearCount?linearCount+' recorrido · '+missionCount+' misiones':missionCount?'🗺️ Misiones':'📖 Recorrido';
    if(sync)sync.textContent=$e('syncStatus')?.textContent||'';
  }

  function refreshActiveModule(){
    const m=currentModule();
    const title=document.querySelector('[data-workspace-module-title]');
    const meta=document.querySelector('[data-workspace-module-meta]');
    if(!m){if(title)title.textContent='Sin módulo';if(meta)meta.textContent='';return}
    if(title)title.textContent=(active+1)+'. '+String(m.title||'Módulo');
    if(meta){
      const bits=[
        isMission(m)?'🗺️ Misiones':'📖 Recorrido',
        String(m.status||'Borrador'),
        (m.contents||[]).length+' contenido'+((m.contents||[]).length===1?'':'s'),
        Number(m.estimatedMinutes||0)>0?Number(m.estimatedMinutes)+' min':null
      ].filter(Boolean);
      meta.innerHTML=bits.map(x=>'<span class="workspace-chip">'+esc(x)+'</span>').join('');
    }
  }

  function refreshWorkspace(){
    if(!document.body.classList.contains('cafasso-course-workspace'))return;
    refreshSummary();
    refreshActiveModule();
    decorateModules();
    decorateContents();
    installDrawer();
    openBlockDrawer();
  }

  function queueRefresh(){
    if(refreshQueued)return;
    refreshQueued=true;
    setTimeout(()=>{refreshQueued=false;refreshWorkspace()},20);
  }

  function patchRenders(){
    if(typeof render==='function'&&!render.__workspaceWrapped){
      const original=render;
      const wrapped=function(){const result=original.apply(this,arguments);queueRefresh();return result};
      wrapped.__workspaceWrapped=true;render=wrapped;
    }
    if(typeof renderContents==='function'&&!renderContents.__workspaceWrapped){
      const original=renderContents;
      const wrapped=function(){const result=original.apply(this,arguments);queueRefresh();return result};
      wrapped.__workspaceWrapped=true;renderContents=wrapped;
    }
    if(typeof renderBlock==='function'&&!renderBlock.__workspaceWrapped){
      const original=renderBlock;
      const wrapped=function(){const result=original.apply(this,arguments);queueRefresh();return result};
      wrapped.__workspaceWrapped=true;renderBlock=wrapped;
    }
  }

  function bindGlobal(){
    document.addEventListener('click',e=>{
      if(!e.target.closest('.workspace-more-wrap'))$e('workspaceMore')?.classList.remove('open');
      if(!e.target.closest('.workspace-module-actions'))document.querySelector('.workspace-module-actions')?.classList.remove('open');
      if(e.target.closest('#contentList .content'))setTimeout(()=>{refreshWorkspace();openBlockDrawer()},30);
      if(e.target.closest('#moduleList .module'))setTimeout(refreshWorkspace,30);
    });
    document.addEventListener('input',queueRefresh);
    document.addEventListener('change',queueRefresh);
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){closePicker();if(document.querySelector('.editor-block-sheet.workspace-drawer-open'))closeBlockDrawer()}});
  }

  function observeLists(){
    const options={childList:true};
    const observer=new MutationObserver(queueRefresh);
    const modules=$e('moduleList'),contents=$e('contentList'),sync=$e('syncStatus');
    if(modules)observer.observe(modules,options);
    if(contents)observer.observe(contents,options);
    if(sync)observer.observe(sync,{childList:true,characterData:true,subtree:true});
  }

  function init(){
    if(typeof data==='undefined'||typeof render!=='function'||!document.querySelector('.editor'))return;
    installStyles();
    document.body.classList.add('cafasso-course-workspace');
    installHeader();
    installOutline();
    installActiveModule();
    makeCollapsible(document.querySelector('.editor-course-sheet'),'Datos del curso','Título, descripción, estado, versión y certificado.');
    makeCollapsible(document.querySelector('.editor-module-sheet'),'Configuración del módulo','Nombre, duración, desbloqueo y tipo de experiencia.');
    installContentHeader();
    installPicker();
    installDrawer();
    bindGlobal();
    patchRenders();
    observeLists();
    refreshWorkspace();
    document.documentElement.classList.remove('cafasso-workspace-booting');
    document.documentElement.classList.add('cafasso-workspace-ready');
    setTimeout(()=>{patchRenders();refreshWorkspace()},120);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();