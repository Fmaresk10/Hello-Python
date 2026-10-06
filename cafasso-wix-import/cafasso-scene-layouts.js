(()=>{
  if(window.CafassoSceneLayouts)return;

  const API='https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoCourse';
  const CONFIG_TITLE='__CAFASSO_SCENE_LAYOUTS__';
  const CACHE_KEY='cafassoSceneLayouts:v1';
  const params=new URLSearchParams(location.search);
  const EDITOR=params.get('sceneEditor')==='1';

  const REGISTRY={
    house:{
      label:'Casa',
      sceneSelectors:['.cafasso-house-panorama','.cafasso-house-desktop-scene','.cafasso-house'],
      objects:[
        {id:'door-patio',label:'Acceso al Patio',selector:'.cafasso-space-link--casa[data-space="patio"]'},
        {id:'door-resources',label:'Acceso a Recursos',selector:'.cafasso-space-link--house-recursos'},
        {id:'admin-button',label:'Botón Administración',selector:'.cafasso-admin-button'},
        {id:'bitacora',label:'Bitácora',selector:'.cafasso-bitacora-object'},
        {id:'personal-corner',label:'Mi rincón',selector:'.cafasso-house-corner'},
        {id:'animator-sheet',label:'Ficha del animador',selector:'.cafasso-animator-sheet'},
        {id:'compass',label:'Brújula / camino',selector:'.cafasso-world-compass'},
        {id:'secret',label:'Secreto de Casa',selector:'.cafasso-explore-secret--house'},
        {id:'heart',label:'Huella del corazón',selector:'.cafasso-corazon-huella'}
      ]
    },
    patio:{
      label:'Patio',
      sceneSelectors:['.cafasso-patio-panorama','.cafasso-patio-desktop-scene','.cafasso-patio'],
      objects:[
        {id:'door-house',label:'Acceso a Casa',selector:'.cafasso-space-link--patio-home'},
        {id:'door-school',label:'Acceso a Escuela',selector:'.cafasso-space-link--patio-escuela'},
        {id:'door-parish',label:'Acceso a Parroquia',selector:'.cafasso-space-link--patio-parroquia'},
        {id:'admin-groups',label:'Botón Grupos',selector:'.cafasso-role-tool--patio'},
        {id:'young-person',label:'Joven del Patio',selector:'.cafasso-patio-encounter-alone'},
        {id:'secret',label:'Secreto del Patio',selector:'.cafasso-patio-secret'},
        {id:'presence-ball',label:'Pelota Presencia',selector:'.cafasso-presencia-ball'},
        {id:'heart',label:'Huella del corazón',selector:'.cafasso-corazon-huella'}
      ]
    },
    escuela:{
      label:'Escuela',
      sceneSelectors:['.cafasso-school-panorama','.cafasso-school-desktop-scene','.cafasso-escuela'],
      objects:[
        {id:'door-patio',label:'Acceso al Patio',selector:'.cafasso-space-link--escuela-patio'},
        {id:'board',label:'Pizarra / cursos',selector:'.cafasso-school-board'},
        {id:'role-tool',label:'Selector de vista',selector:'.cafasso-role-tool--school,.cafasso-role-tool'},
        {id:'resume',label:'Ficha / currículum',selector:'.cafasso-school-resume'},
        {id:'secret',label:'Secreto de Escuela',selector:'.cafasso-school-secret'},
        {id:'heart',label:'Huella del corazón',selector:'.cafasso-corazon-huella'}
      ]
    },
    parroquia:{
      label:'Parroquia',
      sceneSelectors:['.cafasso-parish-panorama','.cafasso-parish-desktop-scene','.cafasso-parroquia'],
      objects:[
        {id:'door-patio',label:'Acceso al Patio',selector:'.cafasso-space-link--parroquia-patio'},
        {id:'admin-songbook',label:'Botón Cancionero',selector:'.cafasso-role-tool--parish'},
        {id:'lectionary',label:'Palabra del día / Leccionario',selector:'.cafasso-parish-lectionary'},
        {id:'songbook',label:'Cancionero',selector:'.cafasso-parish-songbook'},
        {id:'candle',label:'Vela',selector:'.cafasso-parish-candle'},
        {id:'secret',label:'Secreto de Parroquia',selector:'.cafasso-parish-secret'},
        {id:'heart',label:'Huella del corazón',selector:'.cafasso-corazon-huella'}
      ]
    },
    recursos:{
      label:'Recursos',
      sceneSelectors:['.cafasso-resources-panorama','.cafasso-recursos'],
      objects:[
        {id:'door-house',label:'Volver a Casa',selector:'.cafasso-space-link--recursos-home'},
        {id:'admin-library',label:'Botón Biblioteca',selector:'.cafasso-role-tool--resources'}
      ]
    }
  };

  const clone=value=>JSON.parse(JSON.stringify(value||{}));
  const clamp=(value,min,max)=>Math.min(max,Math.max(min,Number(value)||0));
  const round=value=>Math.round(Number(value||0)*100)/100;

  function emptyLayouts(){
    return {version:1,spaces:{}};
  }

  function normalizeLayouts(value){
    const out=emptyLayouts();
    const spaces=value&&typeof value==='object'&&value.spaces&&typeof value.spaces==='object'?value.spaces:{};
    Object.keys(REGISTRY).forEach(space=>{
      const sourceSpace=spaces[space]&&typeof spaces[space]==='object'?spaces[space]:{};
      ['desktop','mobile'].forEach(profile=>{
        const sourceProfile=sourceSpace[profile]&&typeof sourceSpace[profile]==='object'?sourceSpace[profile]:{};
        const target={};
        REGISTRY[space].objects.forEach(spec=>{
          const raw=sourceProfile[spec.id];
          if(!raw||typeof raw!=='object')return;
          const item={
            dx:round(clamp(raw.dx,-100,100)),
            dy:round(clamp(raw.dy,-100,100)),
            scale:Math.round(clamp(raw.scale||1,.35,2.5)*1000)/1000
          };
          if(Number.isFinite(Number(raw.sizePct))&&Number(raw.sizePct)>0){
            item.sizePct=round(clamp(raw.sizePct,.05,100));
          }
          target[spec.id]=item;
        });
        if(Object.keys(target).length){
          if(!out.spaces[space])out.spaces[space]={};
          out.spaces[space][profile]=target;
        }
      });
    });
    return out;
  }

  function readCache(){
    try{return normalizeLayouts(JSON.parse(localStorage.getItem(CACHE_KEY)||'null'))}
    catch(error){return emptyLayouts()}
  }

  function writeCache(layouts){
    try{localStorage.setItem(CACHE_KEY,JSON.stringify(normalizeLayouts(layouts)))}catch(error){}
  }

  function defaultCourse(){
    return {
      title:CONFIG_TITLE,
      description:'Configuración interna del editor visual de escenas CAFASSO',
      subtitle:'Sistema',
      status:'Archivado',
      version:1,
      certificateEnabled:false,
      modules:[{
        title:'Diseño de escenas',
        desc:'Posiciones visuales de objetos por escena y dispositivo',
        status:'Publicado',
        required:false,
        unlockAfterPrevious:false,
        estimatedMinutes:0,
        settings:{experienceMode:'linear',sceneLayouts:emptyLayouts()},
        contents:[]
      }]
    };
  }

  function readLayoutsFromCourse(course){
    const value=course&&course.modules&&course.modules[0]&&course.modules[0].settings&&course.modules[0].settings.sceneLayouts;
    return normalizeLayouts(value);
  }

  function ensureCourse(course,layouts){
    const base=course&&typeof course==='object'?clone(course):defaultCourse();
    if(!Array.isArray(base.modules)||!base.modules.length)base.modules=defaultCourse().modules;
    const module=base.modules[0];
    module.settings=module.settings&&typeof module.settings==='object'?module.settings:{};
    module.settings.sceneLayouts=normalizeLayouts(layouts);
    module.settings.sceneLayouts.updatedAt=new Date().toISOString();
    return base;
  }

  const state={
    course:null,
    layouts:readCache(),
    preview:null,
    loaded:false,
    loading:null,
    raf:0,
    observer:null,
    selected:'',
    editorPresence:{}
  };

  function currentSpace(){
    const raw=String(params.get('space')||'').toLowerCase();
    const aliases={casa:'house',school:'escuela',parish:'parroquia',resources:'recursos'};
    const named=aliases[raw]||raw;
    if(REGISTRY[named])return named;
    if(document.querySelector('.cafasso-house'))return'house';
    if(document.querySelector('.cafasso-patio'))return'patio';
    if(document.querySelector('.cafasso-escuela'))return'escuela';
    if(document.querySelector('.cafasso-parroquia'))return'parroquia';
    if(document.querySelector('.cafasso-recursos'))return'recursos';
    return null;
  }

  function currentProfile(){
    if(EDITOR){
      const requested=params.get('sceneProfile');
      if(requested==='mobile'||requested==='desktop')return requested;
    }
    return document.documentElement.classList.contains('cafasso-mobile')||
      Boolean(window.matchMedia&&window.matchMedia('(max-width:820px),(pointer:coarse)').matches)
      ?'mobile':'desktop';
  }

  function sceneNode(space){
    const entry=REGISTRY[space];
    if(!entry)return null;
    for(const selector of entry.sceneSelectors){
      const node=document.querySelector(selector);
      if(node)return node;
    }
    return null;
  }

  function findSpec(space,id){
    return REGISTRY[space]&&REGISTRY[space].objects.find(item=>item.id===id)||null;
  }

  function findNode(space,spec){
    const host=sceneNode(space);
    if(host){
      try{
        const local=host.matches&&host.matches(spec.selector)?host:host.querySelector(spec.selector);
        if(local)return local;
      }catch(error){}
    }
    try{return document.querySelector(spec.selector)}catch(error){return null}
  }

  function sourceLayouts(){
    return state.preview||state.layouts;
  }

  function storedValue(space,profile,id,layouts){
    const raw=(layouts||sourceLayouts()).spaces?.[space]?.[profile]?.[id];
    if(!raw)return null;
    const value={
      dx:round(clamp(raw.dx,-100,100)),
      dy:round(clamp(raw.dy,-100,100)),
      scale:Math.round(clamp(raw.scale||1,.35,2.5)*1000)/1000
    };
    if(Number.isFinite(Number(raw.sizePct))&&Number(raw.sizePct)>0)value.sizePct=round(clamp(raw.sizePct,.05,100));
    return value;
  }

  function clearApplied(node){
    if(!node||node.dataset.cafassoSceneLayoutApplied!=='1')return;
    node.style.removeProperty('translate');
    node.style.removeProperty('scale');
    delete node.dataset.cafassoSceneLayoutApplied;
  }

  function measureBaseWidthPct(space,node){
    const scene=sceneNode(space);
    if(!scene||!node)return 0;
    const oldValue=node.style.getPropertyValue('scale');
    const oldPriority=node.style.getPropertyPriority('scale');
    node.style.setProperty('scale','1','important');
    const sceneWidth=Math.max(1,scene.getBoundingClientRect().width||scene.clientWidth||1);
    const nodeWidth=Math.max(0,node.getBoundingClientRect().width||0);
    if(oldValue)node.style.setProperty('scale',oldValue,oldPriority||'');
    else node.style.removeProperty('scale');
    return round(nodeWidth/sceneWidth*100);
  }

  function measureVisualWidthPct(space,node){
    const scene=sceneNode(space);
    if(!scene||!node)return 0;
    const sceneWidth=Math.max(1,scene.getBoundingClientRect().width||scene.clientWidth||1);
    return round(Math.max(0,node.getBoundingClientRect().width||0)/sceneWidth*100);
  }

  function applyOne(space,profile,spec,node,layouts){
    if(!node)return;
    const layout=storedValue(space,profile,spec.id,layouts);
    if(!layout){
      clearApplied(node);
      return;
    }
    const scene=sceneNode(space);
    if(!scene)return;
    const width=Math.max(1,scene.clientWidth||scene.getBoundingClientRect().width||1);
    const height=Math.max(1,scene.clientHeight||scene.getBoundingClientRect().height||1);
    const tx=width*layout.dx/100;
    const ty=height*layout.dy/100;
    node.style.setProperty('translate',round(tx)+'px '+round(ty)+'px','important');
    let factor=layout.scale;
    if(Number.isFinite(Number(layout.sizePct))&&Number(layout.sizePct)>0){
      const basePct=measureBaseWidthPct(space,node);
      if(basePct>0)factor=clamp(Number(layout.sizePct)/basePct,.1,6);
    }
    node.style.setProperty('scale',String(Math.round(factor*10000)/10000),'important');
    node.dataset.cafassoSceneLayoutApplied='1';
  }

  function editorCss(){
    if(!EDITOR||document.getElementById('cafassoSceneEditorRuntimeStyles'))return;
    document.documentElement.dataset.cafassoSceneEditor='1';
    const style=document.createElement('style');
    style.id='cafassoSceneEditorRuntimeStyles';
    style.textContent=[
      'html[data-cafasso-scene-editor="1"] body{user-select:none!important}',
      'html[data-cafasso-scene-editor="1"] .cafasso-admin-home-link,html[data-cafasso-scene-editor="1"] .cafasso-global-counters,html[data-cafasso-scene-editor="1"] .cafasso-level-pill,html[data-cafasso-scene-editor="1"] .cafasso-profile-global-anchor{opacity:.18!important;pointer-events:none!important}',
      'html[data-cafasso-scene-editor="1"] .cafasso-school-board,html[data-cafasso-scene-editor="1"] .cafasso-school-resume{display:block!important;visibility:visible!important;opacity:1!important}',
      'html[data-cafasso-scene-editor="1"] [data-cafasso-scene-object]{outline:1px dashed rgba(255,232,151,.76)!important;outline-offset:3px!important;cursor:grab!important;pointer-events:auto!important}',
      'html[data-cafasso-scene-editor="1"] [data-cafasso-scene-object].cafasso-scene-editor-selected{outline:3px solid #f2c94c!important;outline-offset:5px!important;filter:drop-shadow(0 0 8px rgba(242,201,76,.55))!important;z-index:999!important}',
      'html[data-cafasso-scene-editor="1"] [data-cafasso-scene-object]:active{cursor:grabbing!important}',
      'html[data-cafasso-scene-editor="1"] .cafasso-scene-editor-grid{position:absolute!important;inset:0!important;z-index:998!important;pointer-events:none!important;background-image:linear-gradient(rgba(255,255,255,.13) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.13) 1px,transparent 1px)!important;background-size:10% 10%!important}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function postEditor(payload){
    if(!EDITOR||window.parent===window)return;
    try{window.parent.postMessage(Object.assign({type:'cafasso-scene-editor',space:currentSpace(),profile:currentProfile()},payload),location.origin)}catch(error){}
  }

  function ensureEditorGrid(space){
    if(!EDITOR)return;
    const scene=sceneNode(space);
    if(!scene)return;
    let grid=scene.querySelector(':scope > .cafasso-scene-editor-grid');
    if(!grid){
      grid=document.createElement('div');
      grid.className='cafasso-scene-editor-grid';
      grid.setAttribute('aria-hidden','true');
      scene.appendChild(grid);
    }
  }

  function bindEditorNode(space,profile,spec,node){
    if(!EDITOR||!node)return;
    node.dataset.cafassoSceneObject=spec.id;
    node.dataset.cafassoSceneLabel=spec.label;
    node.classList.toggle('cafasso-scene-editor-selected',state.selected===spec.id);
    if(node.dataset.cafassoSceneEditorBound==='1')return;
    node.dataset.cafassoSceneEditorBound='1';

    node.addEventListener('pointerdown',event=>{
      if(event.button!==undefined&&event.button!==0)return;
      event.preventDefault();
      event.stopImmediatePropagation();
      state.selected=spec.id;
      scheduleApply();
      postEditor({action:'select',objectId:spec.id});

      const scene=sceneNode(space);
      if(!scene)return;
      const rect=scene.getBoundingClientRect();
      const width=Math.max(1,rect.width);
      const height=Math.max(1,rect.height);
      const initial=storedValue(space,currentProfile(),spec.id)||{dx:0,dy:0,scale:1};
      if(!Number.isFinite(Number(initial.sizePct))||Number(initial.sizePct)<=0){
        const basePct=measureBaseWidthPct(space,node);
        if(basePct>0)initial.sizePct=round(basePct*(Number(initial.scale)||1));
      }
      const startX=event.clientX,startY=event.clientY;
      const pointerId=event.pointerId;
      try{node.setPointerCapture(pointerId)}catch(error){}

      const move=moveEvent=>{
        if(moveEvent.pointerId!==pointerId)return;
        moveEvent.preventDefault();
        const next={
          dx:round(clamp(initial.dx+(moveEvent.clientX-startX)/width*100,-100,100)),
          dy:round(clamp(initial.dy+(moveEvent.clientY-startY)/height*100,-100,100)),
          scale:initial.scale,
          ...(Number.isFinite(Number(initial.sizePct))&&Number(initial.sizePct)>0?{sizePct:initial.sizePct}:{})
        };
        const layouts=normalizeLayouts(state.preview||state.layouts);
        if(!layouts.spaces[space])layouts.spaces[space]={};
        const activeProfile=currentProfile();
        if(!layouts.spaces[space][activeProfile])layouts.spaces[space][activeProfile]={};
        layouts.spaces[space][activeProfile][spec.id]=next;
        state.preview=layouts;
        applyOne(space,activeProfile,spec,node,layouts);
        postEditor({action:'change',objectId:spec.id,value:next});
      };

      const finish=upEvent=>{
        if(upEvent.pointerId!==pointerId)return;
        try{node.releasePointerCapture(pointerId)}catch(error){}
        node.removeEventListener('pointermove',move,true);
        node.removeEventListener('pointerup',finish,true);
        node.removeEventListener('pointercancel',finish,true);
        postEditor({action:'dragend',objectId:spec.id});
      };

      node.addEventListener('pointermove',move,true);
      node.addEventListener('pointerup',finish,true);
      node.addEventListener('pointercancel',finish,true);
    },true);
  }

  function applyCurrent(){
    const space=currentSpace();
    if(!space)return;
    const profile=currentProfile();
    const layouts=sourceLayouts();
    const presence={};
    const metrics={};
    REGISTRY[space].objects.forEach(spec=>{
      const node=findNode(space,spec);
      presence[spec.id]=Boolean(node);
      if(node){
        applyOne(space,profile,spec,node,layouts);
        bindEditorNode(space,profile,spec,node);
        if(EDITOR){
          metrics[spec.id]={
            baseSizePct:measureBaseWidthPct(space,node),
            visualSizePct:measureVisualWidthPct(space,node)
          };
        }
      }
    });
    if(EDITOR){
      ensureEditorGrid(space);
      const key=JSON.stringify(presence);
      if(state.editorPresence[space]!==key){
        state.editorPresence[space]=key;
        postEditor({action:'presence',presence,metrics});
      }
    }
  }

  function scheduleApply(){
    if(state.raf)return;
    state.raf=requestAnimationFrame(()=>{
      state.raf=0;
      editorCss();
      applyCurrent();
    });
  }

  async function loadRemote(force=false){
    if(state.loading&&!force)return state.loading;
    state.loading=(async()=>{
      try{
        const response=await fetch(API+'?title='+encodeURIComponent(CONFIG_TITLE)+'&t='+Date.now(),{cache:'no-store'});
        const json=await response.json();
        if(response.ok&&json.ok&&json.course){
          state.course=json.course;
          state.layouts=readLayoutsFromCourse(json.course);
          writeCache(state.layouts);
        }else if(!state.course){
          state.course=defaultCourse();
        }
      }catch(error){
        if(!state.course)state.course=defaultCourse();
      }finally{
        state.loaded=true;
        state.loading=null;
        scheduleApply();
      }
      return clone(state.layouts);
    })();
    return state.loading;
  }

  async function saveRemote(layouts){
    const clean=normalizeLayouts(layouts);
    const course=ensureCourse(state.course,clean);
    const response=await fetch(API,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({course})
    });
    const json=await response.json();
    if(!response.ok||!json.ok||!json.course)throw new Error(json.error||'No se pudo guardar el diseño');
    state.course=json.course;
    state.layouts=readLayoutsFromCourse(json.course);
    state.preview=null;
    writeCache(state.layouts);
    scheduleApply();
    return clone(state.layouts);
  }

  function setPreview(layouts){
    state.preview=normalizeLayouts(layouts);
    scheduleApply();
  }

  function clearPreview(){
    state.preview=null;
    scheduleApply();
  }

  function getLayouts(){
    return clone(state.layouts);
  }

  function getEffectiveLayouts(){
    return clone(sourceLayouts());
  }

  function selectObject(id){
    state.selected=String(id||'');
    scheduleApply();
  }

  window.CafassoSceneLayouts={
    API,CONFIG_TITLE,CACHE_KEY,REGISTRY,
    normalizeLayouts,loadRemote,saveRemote,
    getLayouts,getEffectiveLayouts,setPreview,clearPreview,
    apply:scheduleApply,sceneNode,currentSpace,currentProfile,selectObject
  };

  if(EDITOR){
    document.addEventListener('click',event=>{
      const editable=event.target&&event.target.closest&&event.target.closest('[data-cafasso-scene-object]');
      if(!editable)return;
      event.preventDefault();
      event.stopImmediatePropagation();
    },true);

    window.addEventListener('message',event=>{
      if(event.origin!==location.origin)return;
      const data=event.data||{};
      if(data.type!=='cafasso-scene-editor-control')return;
      if(data.action==='state')setPreview(data.layouts||emptyLayouts());
      if(data.action==='select')selectObject(data.objectId||'');
      if(data.action==='clear')clearPreview();
    });
  }

  const boot=()=>{
    editorCss();
    scheduleApply();
    if(document.body&&!state.observer){
      state.observer=new MutationObserver(scheduleApply);
      state.observer.observe(document.body,{childList:true,subtree:true});
    }
    loadRemote(false);
  };

  window.addEventListener('resize',scheduleApply,{passive:true});
  window.visualViewport&&window.visualViewport.addEventListener('resize',scheduleApply,{passive:true});
  window.addEventListener('cafasso:mobile-layout',scheduleApply);
  window.addEventListener('storage',event=>{
    if(event.key!==CACHE_KEY||!event.newValue)return;
    try{
      state.layouts=normalizeLayouts(JSON.parse(event.newValue));
      if(!state.preview)scheduleApply();
    }catch(error){}
  });

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();