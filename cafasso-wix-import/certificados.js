(()=>{
  if(!/animador\.html$/i.test(location.pathname))return;
  const API='https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoAdmin';
  const COURSE_API='https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoCourse';
  const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const fmt=v=>{if(!v)return'—';const d=new Date(v);return Number.isNaN(d.getTime())?'—':d.toLocaleDateString('es-UY',{day:'2-digit',month:'long',year:'numeric'})};
  const assignedIds=(state,user)=>{const set=new Set();(state.assignments||[]).filter(a=>a.active!==false).forEach(a=>{if(a.targetType==='user'&&a.targetId===user._id)set.add(a.courseId);if(a.targetType==='group'&&user.groupId&&a.targetId===user.groupId)set.add(a.courseId)});return set};
  const hoursLabel=mins=>{const h=Math.max(0,Number(mins||0))/60;if(!h)return'—';return `${Math.round(h*10)/10} h`};
  async function courseDetail(id){try{const r=await fetch(COURSE_API+'?id='+encodeURIComponent(id),{cache:'no-store'}),j=await r.json();return r.ok&&j.ok?j.course:null}catch(e){return null}}
  function certificate(user,course,progress,minutes){
    const w=window.open('','_blank','noopener,noreferrer');if(!w)return;
    const date=fmt(progress.updatedAt),hours=hoursLabel(minutes);
    w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Certificado · ${esc(user.name)} · ${esc(course.title)}</title><style>@page{size:A4 landscape;margin:0}*{box-sizing:border-box}body{margin:0;background:#F6EFE4;font-family:Arial,sans-serif;color:#11233A}.sheet{width:297mm;height:210mm;padding:18mm;display:flex}.frame{flex:1;border:3px solid #0F2D4D;outline:1px solid #D5B24A;outline-offset:-10px;padding:20mm 24mm;text-align:center;display:flex;flex-direction:column;justify-content:center;background:#FFFDF9}.brand{font:700 17pt Georgia,serif;color:#0F2D4D;letter-spacing:.12em}.gold{width:70px;height:4px;background:#F2C94C;margin:12px auto 24px}.kicker{font-size:11pt;text-transform:uppercase;letter-spacing:.16em;color:#687386}.title{font:700 30pt Georgia,serif;color:#0F2D4D;margin:14px 0 8px}.name{font:700 28pt Georgia,serif;color:#2E7D59;margin:12px 0}.text{font-size:13pt;line-height:1.6;max-width:900px;margin:0 auto}.course{font-weight:700;color:#0F2D4D}.meta{margin-top:22px;font-size:11pt;color:#526173}.signature{margin-top:34px;display:flex;justify-content:center;gap:70px}.sig{width:220px;border-top:1px solid #0F2D4D;padding-top:8px;font-size:10pt}.actions{position:fixed;right:18px;top:18px}@media print{.actions{display:none}}</style></head><body><button class="actions" onclick="window.print()">Imprimir / Guardar PDF</button><div class="sheet"><div class="frame"><div class="brand">CAFASSO</div><div class="gold"></div><div class="kicker">Espacio de formación para animadores</div><div class="title">Certificado de formación</div><div class="text">Se deja constancia de que</div><div class="name">${esc(user.name)}</div><div class="text">ha completado satisfactoriamente la formación<br><span class="course">${esc(course.title)}</span>.</div><div class="meta">Finalización: ${esc(date)}${hours!=='—'?` · Carga estimada: ${esc(hours)}`:''}</div><div class="signature"><div class="sig">Equipo de Formación CAFASSO</div><div class="sig">Colegio Salesiano Maturana</div></div></div></div></body></html>`);w.document.close();
  }
  function styles(){if(document.getElementById('cafassoCertificatesStyles'))return;const s=document.createElement('style');s.id='cafassoCertificatesStyles';s.textContent='.cafasso-completed-grid{display:grid;gap:10px}.cafasso-completed-item{border:1px solid var(--line,#E8DCCB);background:#fff;border-radius:15px;padding:14px}.cafasso-completed-head{display:flex;justify-content:space-between;gap:12px;align-items:center}.cafasso-completed-head strong{color:var(--navy,#0F2D4D)}.cafasso-completed-meta{font-size:12px;color:var(--muted,#687386);margin-top:6px}.cafasso-cert-btn{border:0;border-radius:11px;padding:9px 11px;background:var(--gold,#F2C94C);color:var(--navy,#0F2D4D);font-weight:800;cursor:pointer;white-space:nowrap}@media(max-width:620px){.cafasso-completed-head{align-items:flex-start;flex-direction:column}.cafasso-cert-btn{width:100%}}';document.head.appendChild(s)}
  async function install(){
    const id=new URLSearchParams(location.search).get('id');if(!id)return;
    try{
      const r=await fetch(API,{cache:'no-store'}),state=await r.json();if(!r.ok||!state.ok)return;
      const user=(state.users||[]).find(u=>u._id===id);if(!user)return;
      const assigned=assignedIds(state,user),progress=(state.progress||[]).filter(p=>p.userId===id&&Number(p.percent||0)>=100),pBy=new Map(progress.map(p=>[p.courseId,p]));
      const courses=(state.courses||[]).filter(c=>assigned.has(c._id)&&pBy.has(c._id));
      if(!courses.length)return;
      const details=Object.fromEntries(await Promise.all(courses.map(async c=>[c._id,await courseDetail(c._id)])));
      const rows=courses.map(c=>{const p=pBy.get(c._id),tree=details[c._id],mins=(tree?.modules||[]).reduce((s,m)=>s+Number(m.estimatedMinutes||0),0);return {c,p,tree,mins}});
      styles();
      const target=document.querySelector('aside .card.box');if(!target)return;
      const card=document.createElement('article');card.className='card box section-gap';card.id='cafassoCompletedTraining';card.innerHTML=`<h2>Formación completada</h2><div class="cafasso-completed-grid">${rows.map((x,i)=>`<div class="cafasso-completed-item"><div class="cafasso-completed-head"><div><strong>${esc(x.c.title)}</strong><div class="cafasso-completed-meta">Completado ${esc(fmt(x.p.updatedAt))}${x.mins?` · ${esc(hoursLabel(x.mins))} estimadas`:''}</div></div><button class="cafasso-cert-btn" data-cert="${i}">Certificado</button></div></div>`).join('')}</div>`;
      target.insertAdjacentElement('afterend',card);
      card.querySelectorAll('[data-cert]').forEach(btn=>btn.onclick=()=>{const x=rows[Number(btn.dataset.cert)];certificate(user,x.c,x.p,x.mins)});
    }catch(e){console.warn('CAFASSO certificados:',e)}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,650),{once:true});else setTimeout(install,650);
})();
