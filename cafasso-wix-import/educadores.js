(()=>{
'use strict';
const ME_API='https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoMe';
const COURSE_API='https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoCourse';
const RESOURCE_TITLE='CAFASSO · Recursos internos';
const RESOURCE_STATIC='./data/resources.json';
const $=s=>document.querySelector(s);
const $$=s=>Array.from(document.querySelectorAll(s));
let session=readJson('cafassoSession');
let data=null;
let courses=[];
let currentCourse=null;
let resourceLibrary=[];
let resourceLoadPromise=null;
const cache=new Map();

function readJson(key){try{return JSON.parse(localStorage.getItem(key)||'null')}catch(e){return null}}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function authHeaders(){const a=readJson('cafassoAuth');return a?.sessionToken?{Authorization:'Bearer '+a.sessionToken}:{}}
function isAdmin(){return String(session?.user?.role||'').toLowerCase().includes('admin')}
function userId(){return String(session?.user?._id||session?.user?.id||'')}
function progressRow(courseId){return (data?.progress||[]).find(p=>String(p.userId||'')===userId()&&String(p.courseId||'')===String(courseId))||null}
function progressOf(courseId){const row=progressRow(courseId);return Math.max(0,Math.min(100,Number(row?.percent||0)))}
function completedModules(courseId){return new Set((progressRow(courseId)?.completedModules||[]).map(String))}
function courseId(c){return String(c?._id||c?.id||'')}
function moduleId(m){return String(m?._id||m?.id||'')}
function descriptionOf(c){return String(c?.description||c?.summary||c?.subtitle||c?.settings?.description||'Un recorrido formativo para seguir creciendo en el acompañamiento y la misión.')}
function publishedModule(m){if(isAdmin())return true;return String(m?.status||'Publicado').trim().toLowerCase()==='publicado'}
function publishedModules(c){return (c?.modules||[]).filter(publishedModule)}
function minutesOf(c){const mods=publishedModules(c);const total=mods.reduce((sum,m)=>sum+Number(m?.minutes||m?.settings?.minutes||m?.settings?.estimatedMinutes||0),0);return total||0}
function durationText(c){const min=minutesOf(c);if(!min)return publishedModules(c).length+' módulo'+(publishedModules(c).length===1?'':'s');if(min<60)return min+' min';const h=Math.floor(min/60),r=min%60;return h+' h'+(r?' '+r+' min':'')}
function assigned(){
  const uid=userId(),gid=String(session?.user?.groupId||''),ids=new Set();
  (data?.assignments||[]).forEach(a=>{if(a?.active===false)return;if(a.targetType==='user'&&String(a.targetId)===uid)ids.add(String(a.courseId));if(a.targetType==='group'&&gid&&String(a.targetId)===gid)ids.add(String(a.courseId))});
  const all=(data?.courses||[]).filter(c=>String(c?.status||'Publicado')==='Publicado'||isAdmin());
  const list=(isAdmin()&&!ids.size)?all:all.filter(c=>ids.has(courseId(c)));
  return list.map(c=>({...c,myProgress:progressOf(courseId(c))}));
}
function route(){const p=new URLSearchParams(location.search);return{view:p.get('view')||'home',id:p.get('id')||''}}
function go(view,id='',replace=false){const url=new URL(location.href);if(view==='home')url.search='';else{url.search='';url.searchParams.set('view',view);if(id)url.searchParams.set('id',id)};(replace?history.replaceState:history.pushState).call(history,{view,id},'',url.pathname+url.search);render()}
function setActive(view){$$('[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===view||(view==='curso'&&b.dataset.nav==='formacion')))}
function greeting(){const h=new Date().getHours();return h<12?'Buen día':h<19?'Buenas tardes':'Buenas noches'}
function firstName(){return String(session?.user?.name||session?.user?.firstName||session?.user?.email||'').trim().split(/\s+/)[0]||'educador'}
function initials(){const n=String(session?.user?.name||session?.user?.email||'CAFASSO').trim().split(/\s+/);return ((n[0]?.[0]||'C')+(n[1]?.[0]||n[0]?.[1]||'F')).toUpperCase()}
function courseCard(c,kind='standard'){
  const id=courseId(c),p=progressOf(id),mods=publishedModules(c).length,info=activeModuleInfo(c);
  const state=p>=100?'Recorrido completo':p>0?'En camino':'Para empezar';
  const next=info?.module?.title||info?.module?.settings?.stageLabel||'Abrir el recorrido';
  return '<article class="school-book '+kind+'">'+
    '<div class="school-book-cover"><span>'+state+'</span><b>'+esc(c.title||'Curso')+'</b></div>'+
    '<div class="school-book-body"><div><small>'+mods+' módulo'+(mods===1?'':'s')+' · '+esc(durationText(c))+'</small><h3>'+esc(c.title||'Curso')+'</h3><p>'+esc(descriptionOf(c))+'</p></div>'+
    '<div class="school-book-foot">'+
      (p>0?'<div class="school-book-progress"><div class="progress"><i style="width:'+p+'%"></i></div><span>'+Math.round(p)+'%</span></div>':'<span class="school-book-note">Un recorrido listo para abrir.</span>')+
      '<button class="edu-primary" data-course="'+esc(id)+'">'+(p>=100?'Volver a recorrer':p>0?'Retomar':'Entrar')+' →</button>'+
    '</div>'+
    (p>0&&p<100?'<div class="school-next">Seguís por: <strong>'+esc(next)+'</strong></div>':'')+
    '</div></article>';
}
function activeCourse(){return courses.find(c=>progressOf(courseId(c))>0&&progressOf(courseId(c))<100)||courses.find(c=>progressOf(courseId(c))<100)||courses[0]||null}
function activeModuleInfo(course){
  if(!course)return null;
  const mods=publishedModules(course),done=completedModules(courseId(course));
  const next=mods.find(m=>!done.has(moduleId(m)))||mods[mods.length-1]||null;
  if(!next)return null;
  const minutes=Number(next?.minutes||next?.settings?.minutes||next?.settings?.estimatedMinutes||0);
  return {module:next,index:Math.max(0,mods.findIndex(m=>moduleId(m)===moduleId(next))),total:mods.length,minutes};
}
function asObject(value){
  if(value&&typeof value==='object')return value;
  if(typeof value!=='string')return {};
  try{const parsed=JSON.parse(value);return parsed&&typeof parsed==='object'?parsed:{}}catch(e){return {}}
}
function truthy(value){
  if(value===true||value===1)return true;
  const s=String(value??'').trim().toLowerCase();
  return ['true','1','yes','si','sí','on'].includes(s);
}
function explicitlyFalse(value){
  if(value===false||value===0)return true;
  const s=String(value??'').trim().toLowerCase();
  return ['false','0','no','off'].includes(s);
}
function collectResourceBlocks(payload){
  const blocks=[],seen=new Set(),ids=new Set();
  function walk(value){
    if(!value||typeof value!=='object'||seen.has(value))return;
    seen.add(value);
    if(Array.isArray(value)){value.forEach(walk);return}
    const settings=asObject(value.settings||value.config||value.metadata||{});
    const marked=truthy(settings.cafassoResource)||
      Object.prototype.hasOwnProperty.call(settings,'mostrarEnBiblioteca')||
      Object.prototype.hasOwnProperty.call(settings,'resourceType')||
      Object.prototype.hasOwnProperty.call(settings,'categoria');
    if(marked){
      const id=String(value._id||value.id||'');
      if(!id||!ids.has(id)){blocks.push(value);if(id)ids.add(id)}
    }
    Object.values(value).forEach(walk);
  }
  walk(payload);return blocks;
}
function normalizeLiveResource(block,index){
  const settings=asObject(block?.settings||block?.config||block?.metadata||{});
  const content=asObject(block?.content||{});
  const marked=truthy(settings.cafassoResource)||
    Object.prototype.hasOwnProperty.call(settings,'mostrarEnBiblioteca')||
    Object.prototype.hasOwnProperty.call(settings,'resourceType')||
    Object.prototype.hasOwnProperty.call(settings,'categoria');
  if(!marked)return null;
  const showValue=settings.mostrarEnBiblioteca??block.mostrarEnBiblioteca;
  return {
    id:String(block._id||block.id||('recurso-'+index)),
    titulo:String(block.title||block.titulo||block.name||'Recurso'),
    categoria:String(settings.categoria||block.categoria||'General'),
    tipo:String(settings.resourceType||block.tipo||block.type||'Documento'),
    url:String(content.body||content.url||block.url||block.archivo||''),
    descripcion:String(settings.descripcion||block.descripcion||block.description||''),
    mostrarEnBiblioteca:showValue==null?true:!explicitlyFalse(showValue),
    disponibleParaCursos:truthy(settings.disponibleParaCursos??block.disponibleParaCursos),
    bibliotecaSlot:Number(settings.bibliotecaSlot??block.bibliotecaSlot??block.slot)||null
  };
}
function normalizeStaticResource(resource,index){
  if(!resource||typeof resource!=='object')return null;
  return {
    id:String(resource.id||resource._id||('static-'+index)),
    titulo:String(resource.titulo||resource.title||resource.name||'Recurso'),
    categoria:String(resource.categoria||'General'),
    tipo:String(resource.tipo||resource.type||'Documento'),
    url:String(resource.url||resource.archivo||''),
    descripcion:String(resource.descripcion||resource.description||''),
    mostrarEnBiblioteca:resource.mostrarEnBiblioteca==null?true:!explicitlyFalse(resource.mostrarEnBiblioteca),
    disponibleParaCursos:truthy(resource.disponibleParaCursos),
    bibliotecaSlot:Number(resource.bibliotecaSlot??resource.slot)||null
  };
}
async function loadResources(){
  if(resourceLibrary.length)return resourceLibrary;
  if(resourceLoadPromise)return resourceLoadPromise;
  resourceLoadPromise=(async()=>{
    let staticList=[],liveList=[];
    try{
      const r=await fetch(RESOURCE_STATIC+'?v='+Date.now(),{cache:'no-store'});
      if(r.ok){const j=await r.json();if(Array.isArray(j))staticList=j.map(normalizeStaticResource).filter(Boolean)}
    }catch(e){console.warn('CAFASSO Educadores: respaldo de Recursos no disponible.',e)}
    try{
      const r=await fetch(COURSE_API+'?title='+encodeURIComponent(RESOURCE_TITLE)+'&_='+Date.now(),{headers:authHeaders(),cache:'no-store'});
      const j=await r.json().catch(()=>null);
      if(r.ok&&j)liveList=collectResourceBlocks(j).map(normalizeLiveResource).filter(Boolean);
    }catch(e){console.warn('CAFASSO Educadores: Recursos de Wix no disponibles.',e)}
    const merged=new Map();
    staticList.forEach(x=>merged.set(String(x.id),x));
    liveList.forEach(x=>merged.set(String(x.id),{...(merged.get(String(x.id))||{}),...x}));
    resourceLibrary=Array.from(merged.values())
      .filter(x=>x&&x.mostrarEnBiblioteca!==false)
      .sort((a,b)=>(Number(a.bibliotecaSlot)||999)-(Number(b.bibliotecaSlot)||999)||a.titulo.localeCompare(b.titulo,'es'));
    return resourceLibrary;
  })().finally(()=>{resourceLoadPromise=null});
  return resourceLoadPromise;
}
function suggestedResource(){
  const list=resourceLibrary.length?resourceLibrary:[...(Array.isArray(data?.resources)?data.resources:[]),...(Array.isArray(data?.libraryResources)?data.libraryResources:[])].filter(Boolean);
  return list.find(item=>item?.titulo||item?.title||item?.name)||null;
}
function warmGreeting(){return 'Qué bueno verte de nuevo, '+esc(firstName())+'.'}
function home(){
  const active=activeCourse(),p=active?progressOf(courseId(active)):0,info=activeModuleInfo(active),resource=suggestedResource();
  const moduleTitle=info?.module?.title||info?.module?.settings?.stageLabel||'Tu próximo tramo';
  const moduleMeta=info?'Módulo '+(info.index+1)+' de '+info.total:'Tu recorrido';
  const timeText=info?.minutes?('Aprox. '+info.minutes+' min'):(active?durationText(active):'');
  return '<section class="house-home">'+
    '<div class="house-hero"><div class="house-hero-copy"><div class="edu-eyebrow">CAFASSO · La Casa</div><h1>'+warmGreeting()+'</h1>'+
      '<p>Esta también es tu casa. Podés retomar tu camino, buscar algo para tu tarea o regalarte un momento para detenerte.</p>'+
      '<div class="house-hero-actions"><button class="edu-primary" '+(active?'data-course="'+esc(courseId(active))+'"':'data-nav="formacion"')+'>▶ &nbsp;Seguir mi camino</button><button class="edu-secondary" data-nav="interioridad">♧ &nbsp;Quiero detenerme un momento</button></div></div>'+
      '<div class="house-hero-note">Formarse también es dejar espacio para que otros se encuentren.<small>Don Bosco</small></div>'+
    '</div>'+
    (active?
      '<article class="desk-card"><div class="desk-cover" aria-hidden="true"></div><div class="desk-copy"><small>Sobre tu mesa</small><h2>'+esc(active.title||'Tu formación')+'</h2><p>Tu próximo tramo: '+esc(moduleTitle)+'.</p><div class="desk-progress-row"><div class="progress"><i style="width:'+p+'%"></i></div><b>'+Math.round(p)+'%</b></div><div class="desk-meta"><span>▥ '+esc(moduleMeta)+'</span>'+(timeText?'<span>◷ '+esc(timeText)+'</span>':'')+'</div></div><div class="desk-action"><button class="edu-primary" data-course="'+esc(courseId(active))+'">Retomar &nbsp;→</button></div></article>'
      :'<article class="desk-card"><div class="desk-cover" aria-hidden="true"></div><div class="desk-copy"><small>Sobre tu mesa</small><h2>Tu espacio está preparado.</h2><p>Cuando tengas una formación asignada, va a aparecer acá para que puedas retomarla sin buscarla.</p></div><div class="desk-action"><button class="edu-primary" data-nav="formacion">Ver mi formación →</button></div></article>')+
    '<div class="house-content">'+
      '<div class="house-section-title"><div><h2>Espacios de CAFASSO</h2><p>La misma casa salesiana, habitada de otra manera.</p></div></div>'+
      '<div class="house-spaces house-spaces-four">'+
        houseSpace('formacion','school','▤','Escuela','El lugar para formarte, profundizar y volver a la práctica.')+
        houseSpace('comunidad','patio','◎','Patio','Donde lo que cada uno vive puede encontrarse con lo de otros.')+
        houseSpace('interioridad','pause','♧','Parroquia','Palabra, oración y silencio para detenerte un momento.')+
        houseSpace('biblioteca','library','▥','Recursos','Materiales para volver, preparar, buscar e inspirarte.')+
      '</div>'+
      '<section class="today-strip"><h2>Para vos hoy</h2><div class="today-grid">'+
        '<article class="today-card"><div class="today-thumb" aria-hidden="true"></div><div><small>Recurso sugerido</small><strong>'+esc(resource?.title||resource?.name||'Educar con presencia')+'</strong><span>'+(resource?esc(resource?.description||resource?.type||'Un recurso de la biblioteca para volver sobre tu tarea.'):'Una invitación breve para pensar cómo estamos presentes en la vida de otros.')+'</span></div><button data-nav="biblioteca" aria-label="Ir a Recursos">→</button></article>'+
        '<article class="today-card quote"><div><small>Una frase para hoy</small><blockquote>“La educación es cosa del corazón.”</blockquote><cite>Don Bosco</cite></div></article>'+
        '<article class="today-card path"><div><small>Tu casa</small><strong>'+esc(active?'Seguí desde donde quedaste':'Tu camino puede empezar hoy')+'</strong><span>'+esc(active?(moduleTitle+' · '+Math.round(p)+'% recorrido'):'Entrá a Escuela para ver tus itinerarios disponibles.')+'</span></div><button '+(active?'data-course="'+esc(courseId(active))+'"':'data-nav="formacion"')+' aria-label="Seguir mi camino">→</button></article>'+
      '</div></section>'+
    '</div>'+
  '</section>';
}
function houseSpace(view,klass,icon,title,copy){return '<button class="house-space '+klass+'" data-nav="'+view+'" type="button"><span class="house-space-copy"><i>'+icon+'</i><span><h3>'+title+'</h3><p>'+copy+'</p></span><b>→</b></span></button>'}
function area(view,icon,title,copy){return '<button class="area-card" data-nav="'+view+'" type="button"><span class="area-icon">'+icon+'</span><h3>'+title+'</h3><p>'+copy+'</p></button>'}
function formation(){
  const ongoing=courses.filter(c=>{const p=progressOf(courseId(c));return p>0&&p<100});
  const available=courses.filter(c=>progressOf(courseId(c))===0);
  const completed=courses.filter(c=>progressOf(courseId(c))>=100);
  const featured=ongoing[0]||available[0]||completed[0]||null;
  return '<div class="school-page">'+
    '<button class="back" data-nav="home">← Volver a Casa</button>'+
    '<section class="school-intro"><div><div class="edu-eyebrow">CAFASSO · Escuela</div><h1>Escuela</h1><p>Un lugar para volver sobre la práctica, abrir preguntas y seguir creciendo como educador. No hace falta recorrer todo de una vez: cada itinerario puede tener su propio tiempo.</p></div><aside><span>“Educar es cosa del corazón.”</span><small>Don Bosco</small></aside></section>'+
    (featured?'<section class="school-now"><div class="section-head"><div><span class="school-kicker">Lo que estamos recorriendo</span><h2>'+(ongoing.length?'Ahora':'Para empezar')+'</h2><p>'+(ongoing.length?'Retomá exactamente desde donde quedaste.':'Hay un recorrido preparado para vos.')+'</p></div></div>'+courseCard(featured,'featured')+'</section>':'')+
    (available.length?'<section class="school-shelf"><div class="section-head"><div><span class="school-kicker">Para seguir creciendo</span><h2>Otros recorridos</h2><p>Formaciones disponibles para abrir cuando sea el momento.</p></div></div><div class="school-grid">'+available.filter(c=>!featured||courseId(c)!==courseId(featured)).map(c=>courseCard(c)).join('')+'</div></section>':'')+
    (completed.length?'<section class="school-shelf completed"><div class="section-head"><div><span class="school-kicker">Lo que ya recorriste</span><h2>Queda con vos</h2><p>Podés volver a cualquiera de estos recorridos cuando lo necesites.</p></div></div><div class="school-grid">'+completed.filter(c=>!featured||courseId(c)!==courseId(featured)).map(c=>courseCard(c,'completed')).join('')+'</div></section>':'')+
    (!courses.length?'<div class="empty">Todavía no tenés recorridos asignados en Escuela.</div>':'')+
  '</div>';
}
async function getCourse(id){if(cache.has(id))return cache.get(id);const r=await fetch(COURSE_API+'?id='+encodeURIComponent(id),{headers:authHeaders(),cache:'no-store'});const j=await r.json().catch(()=>null);if(!r.ok||!j?.ok||!j?.course)throw new Error(j?.error||'No pudimos abrir este curso.');cache.set(id,j.course);return j.course}
function moduleUnlocked(m,index,mods,done){if(index===0||m?.unlockAfterPrevious===false)return true;return done.has(moduleId(mods[index-1]))}
function notebookModule(m,index,mods,done,cid,currentIndex){
  const id=moduleId(m),isDone=done.has(id),unlocked=moduleUnlocked(m,index,mods,done),isCurrent=index===currentIndex;
  const minutes=Number(m?.minutes||m?.settings?.minutes||m?.settings?.estimatedMinutes||0);
  const state=isDone?'done':!unlocked?'locked':isCurrent?'current':'open';
  const label=isDone?'Recorrido':!unlocked?'Más adelante':isCurrent?'Por acá seguís':'Disponible';
  const action=isDone?'Volver a mirar':isCurrent?'Seguir por acá':'Abrir';
  return '<article class="notebook-chapter '+state+'">'+
    '<div class="chapter-marker"><span>'+(isDone?'✓':String(index+1).padStart(2,'0'))+'</span><i></i></div>'+
    '<div class="chapter-copy"><div class="chapter-state">'+label+'</div><h3>'+esc(m.title||('Módulo '+(index+1)))+'</h3><p>'+esc(m.description||m.settings?.objective||m.settings?.stageLabel||'Una nueva etapa del recorrido.')+'</p>'+
      '<div class="chapter-meta"><span>Capítulo '+(index+1)+'</span>'+(minutes?'<span>· '+minutes+' min aprox.</span>':'')+'</div></div>'+
    (unlocked?'<button class="'+(isCurrent?'edu-primary':'edu-secondary')+'" data-module="'+esc(id)+'" data-course-id="'+esc(cid)+'">'+action+' →</button>':'<span class="chapter-lock">Todavía no</span>')+
  '</article>';
}
async function courseView(id){
  $('#main').innerHTML='<div class="edu-loading"><span></span><strong>Abriendo el cuaderno…</strong></div>';
  try{currentCourse=await getCourse(id)}catch(e){return '<div class="empty">'+esc(e.message)+'</div>'}
  const p=progressOf(id),mods=publishedModules(currentCourse),done=completedModules(id);
  let currentIndex=mods.findIndex((m,i)=>!done.has(moduleId(m))&&moduleUnlocked(m,i,mods,done));
  if(currentIndex<0&&mods.length&&done.size<mods.length)currentIndex=0;
  const current=currentIndex>=0?mods[currentIndex]:null;
  const currentTitle=current?.title||current?.settings?.stageLabel||'Tu próximo capítulo';
  const completed=mods.length>0&&done.size>=mods.length;
  const continueText=completed?'Volver a recorrer':current?'Seguir por acá':'Abrir el recorrido';
  const continueId=current?moduleId(current):(mods[0]?moduleId(mods[0]):'');
  return '<div class="notebook-page">'+
    '<button class="back" data-nav="formacion">← Volver a Escuela</button>'+
    '<section class="notebook-cover">'+
      '<div class="notebook-spine" aria-hidden="true"></div>'+
      '<div class="notebook-cover-main"><div class="edu-eyebrow">CAFASSO · Escuela</div><span class="notebook-label">Cuaderno de formación</span><h1>'+esc(currentCourse.title||'Curso')+'</h1><p>'+esc(descriptionOf(currentCourse))+'</p>'+
        '<div class="notebook-meta"><span>▥ '+mods.length+' capítulos</span><span>◷ '+esc(durationText(currentCourse))+'</span></div>'+
      '</div>'+
      '<aside class="notebook-resume"><small>'+(completed?'Lo recorriste completo':'Para retomar')+'</small><h2>'+esc(completed?'Este recorrido queda con vos':currentTitle)+'</h2>'+
        '<p>'+(completed?'Podés volver cuando necesites mirar algo de nuevo.':'No hace falta empezar otra vez. Seguís exactamente desde acá.')+'</p>'+
        '<div class="notebook-progress"><span>Tu recorrido</span><b>'+Math.round(p)+'%</b><div class="progress"><i style="width:'+p+'%"></i></div></div>'+
        (continueId?'<button class="edu-primary" data-module="'+esc(continueId)+'" data-course-id="'+esc(id)+'">'+continueText+' →</button>':'')+
      '</aside>'+
    '</section>'+
    '<section class="notebook-body">'+
      '<div class="notebook-margin-note"><span>Tu recorrido</span><p>Andá capítulo por capítulo, a tu ritmo. Lo importante no es terminar rápido, sino dejar que algo de lo trabajado vuelva con vos a la práctica.</p></div>'+
      '<div class="notebook-toc"><div class="notebook-heading"><span class="school-kicker">Índice</span><h2>El recorrido</h2><p>'+done.size+' de '+mods.length+' capítulos recorridos.</p></div>'+
        '<div class="notebook-chapters">'+mods.map((m,i)=>notebookModule(m,i,mods,done,id,currentIndex)).join('')+'</div>'+
      '</div>'+
    '</section>'+
    '<section class="notebook-closing"><span>Antes de seguir</span><blockquote>“La educación es cosa del corazón.”</blockquote><small>Don Bosco</small></section>'+
  '</div>';
}


function resourceKind(resource){
  const t=String(resource?.tipo||'').toLowerCase(),u=String(resource?.url||'').toLowerCase().split('?')[0].split('#')[0];
  if(t.includes('video')||/youtube\.com|youtu\.be|\.(mp4|webm|mov|m4v)$/.test(u))return 'video';
  if(t.includes('imagen')||/\.(png|jpe?g|webp|gif|svg)$/.test(u))return 'image';
  if(t.includes('audio')||/\.(mp3|wav|m4a|ogg)$/.test(u))return 'audio';
  return 'document';
}
function resourceIcon(resource){
  return ({video:'▶',image:'◇',audio:'♪',document:'▤'})[resourceKind(resource)]||'▤';
}
function resourceCard(resource,index,featured=false){
  const category=resource.categoria||'General',kind=resourceKind(resource);
  return '<article class="resource-card '+(featured?'featured ':'')+'resource-'+kind+'" data-resource-card data-category="'+esc(category.toLowerCase())+'" data-search="'+esc((resource.titulo+' '+resource.descripcion+' '+category+' '+resource.tipo).toLowerCase())+'">'+
    '<div class="resource-card-art"><span>'+resourceIcon(resource)+'</span><small>'+esc(resource.tipo||'Recurso')+'</small></div>'+
    '<div class="resource-card-copy"><span class="resource-category">'+esc(category)+'</span><h3>'+esc(resource.titulo||'Recurso')+'</h3><p>'+esc(resource.descripcion||'Un material para volver, preparar o abrir nuevas preguntas.')+'</p>'+
      '<div class="resource-card-foot"><span>'+(resource.disponibleParaCursos?'También disponible para cursos':'Biblioteca CAFASSO')+'</span>'+
      (resource.url?'<button class="edu-primary" data-resource-open="'+esc(resource.id)+'">Abrir →</button>':'<span class="resource-unavailable">Sin enlace</span>')+'</div></div>'+
  '</article>';
}
async function resourcesView(){
  const resources=await loadResources();
  const featured=resources[0]||null;
  const rest=featured?resources.slice(1):resources;
  const categories=[...new Set(resources.map(r=>String(r.categoria||'General').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
  return '<div class="resources-page">'+
    '<button class="back" data-nav="home">← Volver a Casa</button>'+
    '<section class="resources-intro"><div><div class="edu-eyebrow">CAFASSO · Recursos</div><h1>Recursos</h1><p>Algunas cosas sirven para resolver. Otras, para volver a pensar. Este es un lugar para buscar materiales, abrir preguntas y preparar tu tarea con otros recursos a mano.</p></div><aside><span>Una biblioteca no es un depósito.</span><p>Es un lugar al que volvemos cuando necesitamos mirar algo de nuevo.</p></aside></section>'+
    (resources.length?
      '<section class="resources-tools"><label class="resource-search"><span>⌕</span><input id="resourceSearch" type="search" placeholder="Buscar un recurso, tema o tipo…" autocomplete="off"></label>'+
      '<div class="resource-chips"><button class="active" data-resource-category="">Todos</button>'+categories.map(c=>'<button data-resource-category="'+esc(c.toLowerCase())+'">'+esc(c)+'</button>').join('')+'</div>'+
      (isAdmin()?'<button class="resource-manage" id="manageResources" type="button">⚙ Gestionar recursos</button>':'')+'</section>'+
      (featured?'<section class="resource-feature"><div class="section-head"><div><span class="school-kicker">Sobre la mesa</span><h2>Para abrir hoy</h2><p>Un material destacado de la biblioteca.</p></div></div>'+resourceCard(featured,0,true)+'</section>':'')+
      '<section class="resource-shelf"><div class="section-head"><div><span class="school-kicker">La estantería</span><h2>Para volver cuando lo necesites</h2><p><span id="resourceCount">'+resources.length+'</span> recurso'+(resources.length===1?'':'s')+' disponible'+(resources.length===1?'':'s')+'.</p></div></div>'+
      '<div class="resource-grid" id="resourceGrid">'+rest.map((r,i)=>resourceCard(r,i+1,false)).join('')+'</div><div class="resource-no-results" id="resourceNoResults" hidden>No encontré materiales con esa búsqueda.</div></section>'
      :'<div class="resource-empty"><span>▥</span><h2>La estantería está preparada.</h2><p>Todavía no hay recursos visibles en la biblioteca. Cuando se publiquen desde Administración van a aparecer acá automáticamente.</p></div>')+
    '<section class="resource-viewer" id="resourceViewer" hidden><div class="resource-viewer-backdrop" data-resource-close></div><article class="resource-viewer-book" role="dialog" aria-modal="true" aria-labelledby="resourceViewerTitle"><button class="resource-viewer-close" data-resource-close aria-label="Cerrar">×</button><aside><span class="school-kicker" id="resourceViewerCategory">Recursos</span><h2 id="resourceViewerTitle">Recurso</h2><b id="resourceViewerType">Documento</b><p id="resourceViewerDescription"></p><div class="resource-viewer-actions"><a id="resourceViewerOriginal" class="edu-primary" target="_blank" rel="noopener">Abrir original ↗</a><button class="edu-secondary" data-resource-close>Volver a Recursos</button></div></aside><div class="resource-viewer-stage" id="resourceViewerStage"></div></article></section>'+
  '</div>';
}
function resourceEmbedUrl(raw){
  const url=String(raw||'').trim();if(!url)return '';
  try{
    const parsed=new URL(url,location.href),s=parsed.toString();
    const yt=s.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/);
    if(yt)return 'https://www.youtube.com/embed/'+yt[1]+'?rel=0';
    const drive=s.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
    if(drive)return 'https://drive.google.com/file/d/'+drive[1]+'/preview';
    const docs=s.match(/docs\.google\.com\/(document|presentation|spreadsheets)\/d\/([^/]+)/i);
    if(docs)return 'https://docs.google.com/'+docs[1]+'/d/'+docs[2]+'/preview';
    return s;
  }catch(e){return url}
}
function openEducatorResource(id){
  const r=resourceLibrary.find(x=>String(x.id)===String(id));if(!r||!r.url)return;
  const viewer=$('#resourceViewer'),stage=$('#resourceViewerStage');if(!viewer||!stage)return;
  $('#resourceViewerCategory').textContent=r.categoria||'Recursos';
  $('#resourceViewerTitle').textContent=r.titulo||'Recurso';
  $('#resourceViewerType').textContent=r.tipo||'Documento';
  $('#resourceViewerDescription').textContent=r.descripcion||'Un material de la biblioteca CAFASSO.';
  $('#resourceViewerOriginal').href=r.url;
  const kind=resourceKind(r),embed=resourceEmbedUrl(r.url);
  stage.innerHTML=kind==='image'?'<img src="'+esc(r.url)+'" alt="'+esc(r.titulo||'Recurso')+'">':
    kind==='video'&&/\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(r.url)?'<video controls playsinline src="'+esc(r.url)+'"></video>':
    kind==='audio'?'<div class="resource-audio"><span>♪</span><strong>'+esc(r.titulo||'Audio')+'</strong><audio controls src="'+esc(r.url)+'"></audio></div>':
    '<iframe src="'+esc(embed)+'" title="'+esc(r.titulo||'Recurso')+'" loading="eager"></iframe>';
  viewer.hidden=false;document.body.classList.add('resource-viewer-open');
}
function closeEducatorResource(){
  const viewer=$('#resourceViewer');if(!viewer)return;
  viewer.hidden=true;const stage=$('#resourceViewerStage');if(stage)stage.innerHTML='';
  document.body.classList.remove('resource-viewer-open');
}
function bindResourceFilters(){
  const input=$('#resourceSearch'),chips=$('[data-resource-category]'),cards=$('[data-resource-card]'),count=$('#resourceCount'),empty=$('#resourceNoResults');
  if(!input)return;
  let category='';
  const apply=()=>{
    const q=input.value.trim().toLowerCase();let visible=0;
    cards.forEach(card=>{const okCat=!category||card.dataset.category===category;const okSearch=!q||(card.dataset.search||'').includes(q);const show=okCat&&okSearch;card.hidden=!show;if(show)visible++});
    if(count)count.textContent=String(visible);if(empty)empty.hidden=visible!==0;
  };
  input.addEventListener('input',apply);
  chips.forEach(btn=>btn.onclick=()=>{category=btn.dataset.resourceCategory||'';chips.forEach(x=>x.classList.toggle('active',x===btn));apply()});
}

function placeholder(view){
  const map={biblioteca:['▥','Recursos','Algunas cosas sirven para resolver. Otras, para volver a pensar. Acá vamos a reunir textos, videos y materiales para tu tarea.'],interioridad:['♧','Parroquia','Un espacio más sereno para la Palabra, la oración y las pausas personales.'],comunidad:['◎','Patio','Donde lo que cada uno vive puede encontrarse con lo de otros: experiencias, preguntas y encuentros.'],camino:['◇','Mi camino','Lo que vas viviendo también forma parte de tu formación. Acá vamos a reunir lo recorrido y lo que sigue.']};
  const x=map[view]||['⌂','Casa de Formación','Estamos preparando este espacio.'];
  return '<button class="back" data-nav="home">← Volver a Mi Casa</button><div class="placeholder"><article><i>'+x[0]+'</i><h1>'+x[1]+'</h1><p>'+x[2]+'</p><button class="edu-secondary" data-nav="home">Volver al inicio</button></article></div>';
}
async function render(){
  const r=route();setActive(r.view);let html='';
  if(r.view==='home')html=home();
  else if(r.view==='formacion')html=formation();
  else if(r.view==='curso'&&r.id)html=await courseView(r.id);
  else if(r.view==='biblioteca')html=await resourcesView();
  else html=placeholder(r.view);
  if(route().view!==r.view||route().id!==r.id)return;
  $('#main').innerHTML=html;bindDynamic();window.scrollTo({top:0,behavior:'instant'});
}
function bindDynamic(){
  $$('[data-nav]').forEach(b=>b.onclick=()=>go(b.dataset.nav));
  $$('[data-course]').forEach(b=>b.onclick=()=>go('curso',b.dataset.course));
  $('[data-resource-open]').forEach(b=>b.onclick=()=>openEducatorResource(b.dataset.resourceOpen));
  $('[data-resource-close]').forEach(b=>b.onclick=closeEducatorResource);
  bindResourceFilters();
  const manage=$('#manageResources');if(manage)manage.onclick=()=>location.href='./resource-admin.html?from=educadores';
  $('[data-module]').forEach(b=>b.onclick=()=>{
    const url=new URL('./course-player.html',location.href);
    url.searchParams.set('player','1');url.searchParams.set('course',b.dataset.courseId);url.searchParams.set('module',b.dataset.module);url.searchParams.set('educator','1');url.hash='modulo';location.href=url.toString();
  });
}
async function load(){
  if(!session?.authenticated||!session?.user){location.replace('./login.html');return}
  localStorage.setItem('cafassoExperience','educadores');
  $('#userMenu').textContent=initials();$('#userMenuName').textContent=session.user.name||session.user.email||'Mi cuenta';
  $('#sidebarAvatar').textContent=initials();$('#sidebarUserName').textContent=session.user.name||session.user.email||'Mi cuenta';
  const adminAllowed=isAdmin();
  $('#adminEntry').hidden=!adminAllowed;
  $('#mobileAdminEntry').hidden=!adminAllowed;
  try{
    const r=await fetch(ME_API,{headers:authHeaders(),cache:'no-store'});const j=await r.json().catch(()=>null);
    if(!r.ok||!j?.ok)throw new Error(j?.error||'No pudimos cargar tu espacio.');
    data=j;
    if(!Array.isArray(data.users)&&data.user)data.users=[data.user];
    const fresh=(data.users||[]).find(u=>String(u.email||'').toLowerCase()===String(session.user.email||'').toLowerCase());
    if(fresh){session.user={...session.user,...fresh};localStorage.setItem('cafassoSession',JSON.stringify(session))}
    courses=assigned();
    await render();
  }catch(e){$('#main').innerHTML='<div class="placeholder"><article><i>!</i><h1>No pudimos abrir la Casa</h1><p>'+esc(e.message||'Error de conexión')+'</p><button class="edu-secondary" onclick="location.reload()">Reintentar</button></article></div>'}
}
function staticBind(){
  $$('.edu-header [data-nav],.edu-mobile-nav [data-nav]').forEach(b=>b.onclick=()=>go(b.dataset.nav));
  const openAdmin=()=>{ if(!isAdmin())return; location.href='./admin.html?from=educadores'; };
  $('#adminEntry').onclick=openAdmin;
  $('#mobileAdminEntry').onclick=openAdmin;
  $('#switchExperience').onclick=()=>location.href='./experiencia.html';
  $('#mobileSwitchExperience').onclick=()=>location.href='./experiencia.html';
  $('#userMenu').onclick=()=>{$('#userMenuPanel').hidden=!$('#userMenuPanel').hidden};
  $('#userMenuPanel [data-nav]').onclick=()=>{ $('#userMenuPanel').hidden=true;go('camino')};
  const closeSession=()=>{localStorage.removeItem('cafassoSession');localStorage.removeItem('cafassoAuth');location.replace('./login.html')};
  $('#logout').onclick=closeSession;
  $('#mobileLogout').onclick=closeSession;
  window.addEventListener('popstate',render);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#resourceViewer')?.hidden)closeEducatorResource()});
}
staticBind();load();
})();