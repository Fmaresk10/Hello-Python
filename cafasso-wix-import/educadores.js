(()=>{
'use strict';
const ME_API='https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoMe';
const COURSE_API='https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoCourse';
const $=s=>document.querySelector(s);
const $$=s=>Array.from(document.querySelectorAll(s));
let session=readJson('cafassoSession');
let data=null;
let courses=[];
let currentCourse=null;
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
function suggestedResource(){
  const list=[...(Array.isArray(data?.resources)?data.resources:[]),...(Array.isArray(data?.libraryResources)?data.libraryResources:[])].filter(Boolean);
  return list.find(item=>item?.title||item?.name)||null;
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
  else html=placeholder(r.view);
  if(route().view!==r.view||route().id!==r.id)return;
  $('#main').innerHTML=html;bindDynamic();window.scrollTo({top:0,behavior:'instant'});
}
function bindDynamic(){
  $$('[data-nav]').forEach(b=>b.onclick=()=>go(b.dataset.nav));
  $$('[data-course]').forEach(b=>b.onclick=()=>go('curso',b.dataset.course));
  $$('[data-module]').forEach(b=>b.onclick=()=>{
    const url=new URL('./course-player.html',location.href);
    url.searchParams.set('player','1');url.searchParams.set('course',b.dataset.courseId);url.searchParams.set('module',b.dataset.module);url.searchParams.set('educator','1');url.hash='modulo';location.href=url.toString();
  });
}
async function load(){
  if(!session?.authenticated||!session?.user){location.replace('./login.html');return}
  localStorage.setItem('cafassoExperience','educadores');
  $('#userMenu').textContent=initials();$('#userMenuName').textContent=session.user.name||session.user.email||'Mi cuenta';
  $('#sidebarAvatar').textContent=initials();$('#sidebarUserName').textContent=session.user.name||session.user.email||'Mi cuenta';
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
  $('#switchExperience').onclick=()=>location.href='./experiencia.html';
  $('#mobileSwitchExperience').onclick=()=>location.href='./experiencia.html';
  $('#userMenu').onclick=()=>{$('#userMenuPanel').hidden=!$('#userMenuPanel').hidden};
  $('#userMenuPanel [data-nav]').onclick=()=>{ $('#userMenuPanel').hidden=true;go('camino')};
  const closeSession=()=>{localStorage.removeItem('cafassoSession');localStorage.removeItem('cafassoAuth');location.replace('./login.html')};
  $('#logout').onclick=closeSession;
  $('#mobileLogout').onclick=closeSession;
  window.addEventListener('popstate',render);
}
staticBind();load();
})();