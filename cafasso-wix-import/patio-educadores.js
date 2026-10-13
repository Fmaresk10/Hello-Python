(()=>{
'use strict';
const COURSE_API='https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoCourse';
const SUBMISSION_API='https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoSubmission';
const PATIO_COURSE_ID='caf0f00d-0001-4a11-8000-000000000001';
const PATIO_IMAGES={
  morning:'https://static.wixstatic.com/media/47bf07_1b5565dca9f446b38de8a368dfc8c4f3~mv2.png',
  afternoon:'https://static.wixstatic.com/media/47bf07_794847b8f87d4577a04e10fb9adf630c~mv2.png',
  sunset:'https://static.wixstatic.com/media/47bf07_2ffcd3027228450c9c7487350e067bdd~mv2.png',
  night:'https://static.wixstatic.com/media/47bf07_e63b403b8b64424c981b1169ddb04fe2~mv2.png'
};
const $=s=>document.querySelector(s);
const $$=s=>Array.from(document.querySelectorAll(s));
function readJson(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
let session=readJson('cafassoSession');
let patioCourse=null,patioSubmissions=[];
function authHeaders(){const a=readJson('cafassoAuth');return a?.sessionToken?{Authorization:'Bearer '+a.sessionToken}:{}}
function userId(){return String(session?.user?._id||session?.user?.id||'')}
function isAdmin(){return String(session?.user?.role||'').toLowerCase().includes('admin')}
function initials(){const n=String(session?.user?.name||session?.user?.email||'CAFASSO').trim().split(/\s+/);return ((n[0]?.[0]||'C')+(n[1]?.[0]||n[0]?.[1]||'F')).toUpperCase()}
function go(view){
  if(view==='comunidad')return;
  const url=new URL('./educadores.html',location.href);
  if(view!=='home')url.searchParams.set('view',view);
  location.href=url.toString();
}
function patioPeriod(){const d=new Date(),h=d.getHours()+d.getMinutes()/60;if(h>=6&&h<12)return'morning';if(h>=12&&h<17.5)return'afternoon';if(h>=17.5&&h<20.5)return'sunset';return'night'}
function patioHeroImage(){return PATIO_IMAGES[patioPeriod()]||PATIO_IMAGES.afternoon}
function patioModules(){return [...(patioCourse?.modules||[])].sort((a,b)=>Number(a?.order||0)-Number(b?.order||0))}
function patioModule(section){
  const names={weekly:'pregunta de la semana',board:'cartelera',stories:'experiencias',peer:'entre nosotros'};
  return patioModules().find(m=>String(m?.settings?.patioSection||'').toLowerCase()===section)||patioModules().find(m=>String(m?.title||'').trim().toLowerCase()===names[section])||null
}
function patioBlocks(section){return [...(patioModule(section)?.contents||[])].sort((a,b)=>Number(a?.order||0)-Number(b?.order||0))}
function patioSubmission(blockId){return patioSubmissions.find(s=>String(s?.activityId||'')===String(blockId))||null}
function patioBlockText(block){const value=block?.content?.body??block?.body??'';return typeof value==='string'?value:String(value||'')}
function patioBoardNote(block,index){
  const note=String(block?.settings?.notes||'').trim();
  return '<article class="patio-board-note note-'+((index%4)+1)+'"><span class="patio-tape" aria-hidden="true"></span>'+(note?'<small>'+esc(note)+'</small>':'<small>Cartelera</small>')+'<h3>'+esc(block?.title||'Algo para tener a la vista')+'</h3><p>'+esc(patioBlockText(block))+'</p></article>'
}
function patioStory(block,index){
  const note=String(block?.settings?.notes||'').trim();
  return '<article class="patio-story story-'+((index%3)+1)+'"><span class="patio-story-mark">“</span><div><small>'+esc(note||'Una experiencia compartida')+'</small><h3>'+esc(block?.title||'Algo que nos pasó')+'</h3><p>'+esc(patioBlockText(block))+'</p></div></article>'
}
function patioOwnAnswerCard(submission,label){
  if(!submission?.content)return'';
  return '<div class="patio-own-answer"><span>'+esc(label)+'</span><p>'+esc(submission.content)+'</p><small>Tu aporte quedó guardado en CAFASSO.</small></div>'
}
async function loadPatio(){
  const [courseResult,submissionResult]=await Promise.allSettled([
    fetch(COURSE_API+'?id='+encodeURIComponent(PATIO_COURSE_ID)+'&_='+Date.now(),{headers:authHeaders(),cache:'no-store'}).then(async r=>{const j=await r.json().catch(()=>null);if(!r.ok||!j?.ok||!j?.course)throw new Error(j?.error||'No pudimos abrir el Patio.');return j.course}),
    fetch(SUBMISSION_API+'?userId='+encodeURIComponent(userId())+'&courseId='+encodeURIComponent(PATIO_COURSE_ID)+'&_='+Date.now(),{headers:authHeaders(),cache:'no-store'}).then(async r=>{const j=await r.json().catch(()=>null);if(!r.ok||!j?.ok)throw new Error(j?.error||'No pudimos leer tus aportes.');return j.submissions||[]})
  ]);
  if(courseResult.status!=='fulfilled')throw courseResult.reason;
  patioCourse=courseResult.value;
  patioSubmissions=submissionResult.status==='fulfilled'?submissionResult.value:[];
}
function renderPatio(){
  const weekly=patioBlocks('weekly')[0]||null,peer=patioBlocks('peer')[0]||null;
  const board=patioBlocks('board'),stories=patioBlocks('stories');
  const weeklySubmission=weekly?patioSubmission(weekly._id||weekly.id):null;
  const peerSubmission=peer?patioSubmission(peer._id||peer.id):null;
  const hero=patioHeroImage();
  const weekQuestion=patioBlockText(weekly)||'¿Qué de tu tarea educativa te gustaría conversar esta semana?';
  const peerQuestion=patioBlockText(peer)||'¿Qué situación de tu tarea te vendría bien conversar con otros educadores?';
  $('#main').innerHTML='<div class="patio-page" style="--patio-image:url(\''+esc(hero)+'\')">'+
    '<button class="back" data-nav="home">← Volver a Casa</button>'+
    '<section class="patio-hero"><div class="patio-hero-copy"><div class="edu-eyebrow">CAFASSO · Patio</div><h1>Patio</h1><p>Acá el camino se cruza con otros caminos. Un lugar para compartir lo que vivimos, enterarnos de lo que está pasando y descubrir que muchas preguntas no son solamente nuestras.</p><span>El Patio es encuentro.</span></div><div class="patio-hero-doodle" aria-hidden="true">↗</div></section>'+
    '<section class="patio-weekly"><div class="patio-weekly-pin" aria-hidden="true"></div><span class="school-kicker">Pregunta de la semana</span><h2>'+esc(weekQuestion)+'</h2><p>No hace falta escribir mucho. A veces una escena, una frase o una pregunta alcanza para abrir una conversación.</p>'+
      (weekly?'<textarea id="patioWeeklyAnswer" maxlength="700" placeholder="Dejá algo de lo que te pasó esta semana…">'+esc(weeklySubmission?.content||'')+'</textarea><div class="patio-share-row"><small id="patioWeeklyStatus">'+(weeklySubmission?'Ya compartiste algo esta semana. Podés volver a editarlo.':'Tu respuesta queda guardada en CAFASSO.')+'</small><button class="edu-primary" data-patio-save="weekly" data-block-id="'+esc(weekly._id||weekly.id)+'" data-module-id="'+esc(patioModule('weekly')?._id||patioModule('weekly')?.id||'')+'">'+(weeklySubmission?'Actualizar lo que compartí':'Compartir en el Patio')+' →</button></div>':'')+patioOwnAnswerCard(weeklySubmission,'Lo que dejaste esta semana')+'</section>'+
    '<section class="patio-board-section"><div class="section-head"><div><span class="school-kicker">Cartelera</span><h2>Lo que está pasando</h2><p>Encuentros, celebraciones, retiros y esas cosas que conviene tener a la vista.</p></div>'+(isAdmin()?'<button class="resource-manage" data-manage-patio>⚙ Gestionar Patio</button>':'')+'</div>'+
      (board.length?'<div class="patio-board">'+board.map(patioBoardNote).join('')+'</div>':'<div class="patio-board empty-board"><div class="patio-empty-paper"><span class="patio-tape"></span><h3>La cartelera está pronta.</h3><p>Cuando haya un encuentro, una celebración o algo que compartir con la Casa, va a aparecer acá.</p>'+(isAdmin()?'<button class="edu-secondary" data-manage-patio>Agregar a la cartelera →</button>':'')+'</div></div>')+'</section>'+
    '<section class="patio-stories-section"><div class="section-head"><div><span class="school-kicker">Algo para compartir</span><h2>Experiencias del Patio</h2><p>No recetas. Historias breves que quizás ayuden a otro educador a mirar distinto.</p></div></div>'+
      (stories.length?'<div class="patio-stories">'+stories.map(patioStory).join('')+'</div>':'<div class="patio-stories-empty"><span>“</span><div><h3>Todavía no dejamos ninguna historia colgada.</h3><p>Cuando una experiencia merezca ser guardada y compartida con otros, va a encontrar su lugar acá.</p></div>'+(isAdmin()?'<button class="edu-secondary" data-manage-patio>Publicar una experiencia →</button>':'')+'</div>')+'</section>'+
    '<section class="patio-peer"><div class="patio-peer-copy"><span class="school-kicker">Entre nosotros</span><h2>Hay cosas que se piensan mejor con otros.</h2><p>'+esc(peerQuestion)+'</p></div>'+
      (peer?'<div class="patio-peer-write"><textarea id="patioPeerAnswer" maxlength="700" placeholder="Escribí la situación, la pregunta o algo que te gustaría poner en común…">'+esc(peerSubmission?.content||'')+'</textarea><div class="patio-share-row"><small id="patioPeerStatus">'+(peerSubmission?'Esta conversación ya quedó abierta. Podés actualizarla.':'No es un chat: dejá la pregunta y permití que quede resonando.')+'</small><button class="edu-primary" data-patio-save="peer" data-block-id="'+esc(peer._id||peer.id)+'" data-module-id="'+esc(patioModule('peer')?._id||patioModule('peer')?.id||'')+'">'+(peerSubmission?'Actualizar':'Abrir la conversación')+' →</button></div>'+patioOwnAnswerCard(peerSubmission,'La conversación que abriste')+'</div>':'')+'</section>'+
    '<section class="patio-closing"><span>En el Patio</span><blockquote>No siempre necesitamos una respuesta. A veces alcanza con encontrarnos.</blockquote></section></div>';
  bindPatio();
}
async function savePatioResponse(button){
  const kind=button.dataset.patioSave,blockId=button.dataset.blockId,moduleId=button.dataset.moduleId;
  const field=kind==='weekly'?$('#patioWeeklyAnswer'):$('#patioPeerAnswer');
  const status=kind==='weekly'?$('#patioWeeklyStatus'):$('#patioPeerStatus');
  const content=String(field?.value||'').trim();
  if(!content){field?.focus();if(status)status.textContent='Escribí algo antes de compartir.';return}
  button.disabled=true;const original=button.textContent;button.textContent='Guardando…';if(status)status.textContent='Guardando tu aporte en CAFASSO…';
  try{
    const r=await fetch(SUBMISSION_API,{method:'POST',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify({userId:userId(),courseId:PATIO_COURSE_ID,moduleId,activityId:blockId,type:kind==='weekly'?'Patio · Pregunta semanal':'Patio · Entre nosotros',content})});
    const j=await r.json().catch(()=>null);if(!r.ok||!j?.ok||!j?.submission)throw new Error(j?.error||'No pudimos guardar lo que compartiste.');
    const ix=patioSubmissions.findIndex(s=>String(s?.activityId||'')===String(blockId));if(ix>=0)patioSubmissions[ix]=j.submission;else patioSubmissions.push(j.submission);
    if(status)status.textContent='✓ Tu aporte quedó guardado en CAFASSO.';button.textContent='Guardado ✓';
    setTimeout(()=>{button.disabled=false;button.textContent=kind==='weekly'?'Actualizar lo que compartí →':'Actualizar →'},900);
  }catch(e){if(status)status.textContent=e?.message||'No pudimos guardar tu aporte.';button.disabled=false;button.textContent=original}
}
function managePatio(){const url=new URL('./curso-editor.html',location.href);url.searchParams.set('id',PATIO_COURSE_ID);url.searchParams.set('from','educadores');url.searchParams.set('section','patio');location.href=url.toString()}
function bindPatio(){
  $$('[data-nav]').forEach(b=>b.onclick=()=>go(b.dataset.nav));
  $$('[data-patio-save]').forEach(b=>b.onclick=()=>savePatioResponse(b));
  $$('[data-manage-patio]').forEach(b=>b.onclick=managePatio);
}
function bindShell(){
  $$('[data-nav]').forEach(b=>b.onclick=()=>go(b.dataset.nav));
  $('#sidebarAvatar').textContent=initials();$('#sidebarUserName').textContent=session.user.name||session.user.email||'Mi cuenta';
  $('#userMenu').textContent=initials();$('#userMenuName').textContent=session.user.name||session.user.email||'Mi cuenta';
  $('#adminEntry').hidden=!isAdmin();$('#mobileAdminEntry').hidden=!isAdmin();
  const openAdmin=()=>{if(isAdmin())location.href='./admin.html?from=educadores'};
  $('#adminEntry').onclick=openAdmin;$('#mobileAdminEntry').onclick=openAdmin;
  $('#switchExperience').onclick=()=>location.href='./experiencia.html';$('#mobileSwitchExperience').onclick=()=>location.href='./experiencia.html';
  $('#userMenu').onclick=()=>{$('#userMenuPanel').hidden=!$('#userMenuPanel').hidden};
  const logout=()=>{localStorage.removeItem('cafassoSession');localStorage.removeItem('cafassoAuth');location.replace('./login.html')};
  $('#logout').onclick=logout;$('#mobileLogout').onclick=logout;
}
async function start(){
  if(!session?.authenticated||!session?.user){location.replace('./login.html');return}
  localStorage.setItem('cafassoExperience','educadores');bindShell();
  try{await loadPatio();renderPatio()}catch(e){$('#main').innerHTML='<div class="patio-page"><button class="back" data-nav="home">← Volver a Casa</button><div class="resource-empty"><span>◎</span><h2>No pudimos abrir el Patio</h2><p>'+esc(e?.message||'Probá nuevamente en un momento.')+'</p><button class="edu-secondary" id="retryPatio">Reintentar</button></div></div>';$$('[data-nav]').forEach(b=>b.onclick=()=>go(b.dataset.nav));$('#retryPatio').onclick=()=>location.reload()}
}
start();
})();