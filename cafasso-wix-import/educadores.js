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
function courseCard(c){
  const id=courseId(c),p=progressOf(id),mods=publishedModules(c).length;
  return '<article class="course-card"><div class="course-cover"><span>'+(p>=100?'Completado':p>0?'En curso':'Disponible')+'</span></div><div class="course-body"><h3>'+esc(c.title||'Curso')+'</h3><p>'+esc(descriptionOf(c))+'</p><div class="course-meta"><span>'+mods+' módulo'+(mods===1?'':'s')+'</span><span>·</span><span>'+esc(durationText(c))+'</span></div><div class="course-actions"><div class="progress"><i style="width:'+p+'%"></i></div><b>'+Math.round(p)+'%</b><button class="edu-primary" data-course="'+esc(id)+'">'+(p?'Continuar':'Ver curso')+'</button></div></div></article>'
}
function activeCourse(){return courses.find(c=>progressOf(courseId(c))>0&&progressOf(courseId(c))<100)||courses.find(c=>progressOf(courseId(c))<100)||courses[0]||null}
function home(){
  const active=activeCourse(),p=active?progressOf(courseId(active)):0;
  const completed=courses.filter(c=>progressOf(courseId(c))>=100).length;
  const inProgress=courses.filter(c=>{const x=progressOf(courseId(c));return x>0&&x<100}).length;
  const modulesTotal=courses.reduce((s,c)=>s+publishedModules(c).length,0);
  return '<section class="hero"><div class="hero-content"><div class="edu-eyebrow">CAFASSO · Casa de Formación</div><h1>'+greeting()+', '+esc(firstName())+'.</h1><p>Un espacio para detenerse, formarse, encontrarse y volver a la misión con nuevas preguntas.</p>'+
    (active?'<article class="continue-card"><small>Continuar mi formación</small><h2>'+esc(active.title||'Curso')+'</h2><p>'+esc(descriptionOf(active))+'</p><div class="continue-row"><div class="progress"><i style="width:'+p+'%"></i></div><b>'+Math.round(p)+'%</b><button class="edu-primary" data-course="'+esc(courseId(active))+'">Continuar</button></div></article>':'<article class="continue-card"><small>Tu formación</small><h2>Tu casa está pronta.</h2><p>Cuando tengas un itinerario asignado, va a aparecer acá para que puedas retomarlo con un clic.</p></article>')+
    '</div></section>'+
    '<section class="section"><div class="section-head"><div><h2>La Casa</h2><p>Cada espacio responde a una dimensión de tu tarea educativa.</p></div></div><div class="area-grid">'+
    area('formacion','◇','Formación','Cursos e itinerarios para profundizar y llevar a la práctica.')+
    area('biblioteca','▥','Biblioteca','Textos, videos y recursos pastorales para volver a consultar.')+
    area('comunidad','◎','Comunidad','Experiencias, encuentros y preguntas compartidas con otros educadores.')+
    area('interioridad','✦','Interioridad','Palabra, oración y propuestas para detenerse un momento.')+
    '</div></section>'+
    '<section class="section"><div class="section-head"><div><h2>Mi recorrido</h2><p>Un vistazo sereno a lo que ya caminaste y a lo que sigue.</p></div><button data-nav="camino">Ver mi camino →</button></div><div class="journey"><article class="journey-card main"><small>Tu camino</small><strong>'+Math.round(courses.length?courses.reduce((s,c)=>s+progressOf(courseId(c)),0)/courses.length:0)+'%</strong><span>Promedio de avance en tus itinerarios actuales.</span></article><article class="journey-card"><small>Completados</small><strong>'+completed+'</strong><span>Itinerarios terminados</span></article><article class="journey-card"><small>En curso</small><strong>'+inProgress+'</strong><span>Formaciones activas</span></article><article class="journey-card"><small>Módulos</small><strong>'+modulesTotal+'</strong><span>Disponibles en tu recorrido</span></article></div></section>';
}
function area(view,icon,title,copy){return '<button class="area-card" data-nav="'+view+'" type="button"><span class="area-icon">'+icon+'</span><h3>'+title+'</h3><p>'+copy+'</p><em>'+(view==='formacion'?'Disponible':'Próximamente')+'</em></button>'}
function formation(){
  const ongoing=courses.filter(c=>{const p=progressOf(courseId(c));return p>0&&p<100});
  return '<button class="back" data-nav="home">← Volver a Mi Casa</button><div class="edu-eyebrow">Casa de Formación</div><h1 class="edu-page-title">Formación</h1><p class="edu-lead">Tus itinerarios reunidos en un mismo lugar. Podés continuar lo que empezaste o abrir un nuevo recorrido.</p>'+
  (ongoing.length?'<section class="section"><div class="section-head"><div><h2>En curso</h2><p>Retomá desde donde quedaste.</p></div></div><div class="course-grid">'+ongoing.map(courseCard).join('')+'</div></section>':'')+
  '<section class="section"><div class="section-head"><div><h2>Mis itinerarios</h2><p>'+courses.length+' curso'+(courses.length===1?'':'s')+' disponible'+(courses.length===1?'':'s')+'.</p></div></div>'+(courses.length?'<div class="course-grid">'+courses.map(courseCard).join('')+'</div>':'<div class="empty">Todavía no tenés itinerarios asignados.</div>')+'</section>';
}
async function getCourse(id){if(cache.has(id))return cache.get(id);const r=await fetch(COURSE_API+'?id='+encodeURIComponent(id),{headers:authHeaders(),cache:'no-store'});const j=await r.json().catch(()=>null);if(!r.ok||!j?.ok||!j?.course)throw new Error(j?.error||'No pudimos abrir este curso.');cache.set(id,j.course);return j.course}
function moduleUnlocked(m,index,mods,done){if(index===0||m?.unlockAfterPrevious===false)return true;return done.has(moduleId(mods[index-1]))}
function moduleRow(m,index,mods,done,cid){
  const id=moduleId(m),isDone=done.has(id),unlocked=moduleUnlocked(m,index,mods,done);
  const label=isDone?'Completado':unlocked?'Disponible':'Bloqueado';
  return '<article class="module '+(isDone?'done ':'')+(!unlocked?'locked':'')+'"><span class="module-index">'+(isDone?'✓':index+1)+'</span><div><h3>'+esc(m.title||('Módulo '+(index+1)))+'</h3><p>'+esc(m.description||m.settings?.objective||m.settings?.stageLabel||'Una nueva etapa del itinerario.')+'</p></div>'+(unlocked?'<button class="edu-primary" data-module="'+esc(id)+'" data-course-id="'+esc(cid)+'">'+(isDone?'Volver a ver':'Entrar')+'</button>':'<span class="module-status">'+label+'</span>')+'</article>'
}
async function courseView(id){
  $('#main').innerHTML='<div class="edu-loading"><span></span><strong>Abriendo el itinerario…</strong></div>';
  try{currentCourse=await getCourse(id)}catch(e){return '<div class="empty">'+esc(e.message)+'</div>'}
  const p=progressOf(id),mods=publishedModules(currentCourse),done=completedModules(id);
  return '<button class="back" data-nav="formacion">← Volver a Formación</button><section class="course-hero"><div><div class="edu-eyebrow">Itinerario formativo</div><h1>'+esc(currentCourse.title||'Curso')+'</h1><p>'+esc(descriptionOf(currentCourse))+'</p><div class="course-meta"><span>'+mods.length+' módulos</span><span>·</span><span>'+esc(durationText(currentCourse))+'</span></div></div><aside class="course-summary"><small>Tu recorrido</small><strong>'+Math.round(p)+'%</strong><span>'+done.size+' de '+mods.length+' módulos completados</span><div class="progress"><i style="width:'+p+'%"></i></div></aside></section><section class="section"><div class="section-head"><div><h2>El recorrido</h2><p>Avanzá módulo a módulo, a tu ritmo.</p></div></div><div class="module-list">'+mods.map((m,i)=>moduleRow(m,i,mods,done,id)).join('')+'</div></section>';
}
function placeholder(view){
  const map={biblioteca:['▥','Biblioteca','Vamos a reunir acá los textos, videos y subsidios para que puedas volver a ellos cuando los necesites.'],interioridad:['✦','Interioridad','Un espacio más sereno para la Palabra, la oración y las pausas personales.'],comunidad:['◎','Comunidad','Experiencias, encuentros y preguntas compartidas entre educadores.'],camino:['○','Mi camino','Tu recorrido personal va a reunir cursos, recursos guardados, notas y próximos pasos.']};
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
  $('#userMenu').onclick=()=>{$('#userMenuPanel').hidden=!$('#userMenuPanel').hidden};
  $('#userMenuPanel [data-nav]').onclick=()=>{ $('#userMenuPanel').hidden=true;go('camino')};
  $('#logout').onclick=()=>{localStorage.removeItem('cafassoSession');localStorage.removeItem('cafassoAuth');location.replace('./login.html')};
  window.addEventListener('popstate',render);
}
staticBind();load();
})();