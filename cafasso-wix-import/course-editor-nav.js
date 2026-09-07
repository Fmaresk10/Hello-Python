(()=>{
  if(window.__cafassoCourseEditorNavInstalled)return;
  window.__cafassoCourseEditorNavInstalled=true;
  if((location.pathname.split('/').pop()||'').toLowerCase()!=='curso-editor.html')return;

  const root=document.documentElement;
  const style=document.createElement('style');
  style.id='cafassoCourseEditorNavStyles';
  style.textContent=`
    .editor-step.editor-step-button{appearance:none;width:100%;text-align:left;cursor:pointer;font:inherit;transition:transform .15s ease,box-shadow .15s ease,border-color .15s ease;background:#fff}
    .editor-step.editor-step-button:hover{transform:translateY(-1px);border-color:#D9C68E;box-shadow:0 6px 16px rgba(15,45,77,.06)}
    .editor-step.editor-step-button:focus-visible{outline:3px solid rgba(242,201,76,.35);outline-offset:2px}
    .editor-step.editor-step-button.active{background:#FFF7D7}
    .cafasso-nav-target{scroll-margin-top:24px}
    .cafasso-course-toolbar{display:flex;gap:9px;flex-wrap:wrap;margin:0 0 18px;align-items:center}
    .cafasso-course-toolbar a{text-decoration:none;border-radius:12px;padding:10px 13px;font-weight:850}
    .cafasso-back-courses{background:#fff;border:1px solid var(--line);color:var(--navy)}
    .cafasso-new-course{background:var(--gold);color:var(--navy)}

    html[data-course-editor-screen="course"] .layout{grid-template-columns:minmax(0,860px)!important;justify-content:center}
    html[data-course-editor-screen="course"] .outline{display:none!important}
    html[data-course-editor-screen="course"] .editor{display:block!important;padding:26px!important}
    html[data-course-editor-screen="course"] .editor .section{display:none!important}
    html[data-course-editor-screen="course"] .editor .cafasso-section-course{display:block!important}

    html[data-course-editor-screen="modules"] .editor{display:block!important}
    html[data-course-editor-screen="modules"] .editor .section{display:none!important}
    html[data-course-editor-screen="modules"] .editor .cafasso-section-module{display:block!important}
    html[data-course-editor-screen="modules"] #blockEditor{display:none!important}

    html[data-course-editor-screen="contents"] .editor{display:block!important}
    html[data-course-editor-screen="contents"] .editor .section{display:none!important}
    html[data-course-editor-screen="contents"] .editor .cafasso-section-contents,
    html[data-course-editor-screen="contents"] .editor .cafasso-section-block{display:block!important}

    html[data-course-editor-screen="publish"] .layout{grid-template-columns:1fr!important}
    html[data-course-editor-screen="publish"] .outline,
    html[data-course-editor-screen="publish"] .editor{display:none!important}

    .cafasso-course-summary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:2px 0 20px}
    .cafasso-course-summary-card{border:1px solid var(--line);background:#F7F1E8;border-radius:14px;padding:13px 14px}
    .cafasso-course-summary-card span{display:block;font-size:10px;font-weight:850;letter-spacing:.08em;text-transform:uppercase;color:#8A7A63;margin-bottom:5px}
    .cafasso-course-summary-card strong{display:block;color:var(--navy);font-size:14px;line-height:1.3}
    html[data-course-editor-screen="course"] .course-cover-field{margin-top:22px!important;padding-top:18px!important;border-top:1px solid var(--line)!important}

    .cafasso-review-panel{display:none;background:#FFFDF9;border:1px solid var(--line);border-radius:22px;padding:26px;max-width:860px;margin:0 auto;box-shadow:0 9px 24px rgba(25,37,54,.06)}
    html[data-course-editor-screen="publish"] .cafasso-review-panel{display:block}
    .cafasso-review-panel h2{font-family:Georgia,serif;color:var(--navy);font-size:30px;margin:0 0 8px}
    .cafasso-review-panel p{color:var(--muted);line-height:1.55;margin:0 0 18px}
    .cafasso-review-actions{display:flex;gap:10px;flex-wrap:wrap}

    @media(max-width:700px){
      html[data-course-editor-screen="course"] .layout{display:block}
      .cafasso-course-summary{grid-template-columns:1fr}
      .cafasso-review-actions{display:grid;grid-template-columns:1fr}
      .cafasso-review-actions .btn{width:100%}
      .cafasso-course-toolbar{display:grid;grid-template-columns:1fr}
      .cafasso-course-toolbar a{text-align:center}
    }
  `;
  document.head.appendChild(style);

  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
  function sessionUser(){try{return JSON.parse(localStorage.getItem('cafassoSession')||'null')?.user||{};}catch(e){return {};}}
  function sessionUserName(){const u=sessionUser();return String(u?.name||u?.displayName||'Formador/a').trim()||'Formador/a';}
  function coursesHome(){const role=String(sessionUser()?.role||'').toLowerCase();return role.includes('formador')&&!role.includes('admin')?'./formador.html':'./admin.html#cursos';}
  function moduleCount(){try{return Array.isArray(data?.modules)?data.modules.length:document.querySelectorAll('#moduleList .module').length;}catch(e){return document.querySelectorAll('#moduleList .module').length;}}

  function tagSections(){
    document.querySelectorAll('.editor .section').forEach(s=>s.classList.remove('cafasso-section-course','cafasso-section-module','cafasso-section-contents','cafasso-section-block'));
    document.getElementById('courseName')?.closest('.section')?.classList.add('cafasso-section-course');
    document.getElementById('moduleTitle')?.closest('.section')?.classList.add('cafasso-section-module');
    document.getElementById('contentList')?.closest('.section')?.classList.add('cafasso-section-contents');
    document.getElementById('blockEditor')?.classList.add('cafasso-section-block');
  }

  function ensureToolbar(){
    if(document.getElementById('cafassoCourseToolbar'))return;
    const top=document.querySelector('main .top');if(!top)return;
    const bar=document.createElement('div');bar.id='cafassoCourseToolbar';bar.className='cafasso-course-toolbar';
    bar.innerHTML=`<a class="cafasso-back-courses" href="${coursesHome()}">← Volver a todos los cursos</a><a class="cafasso-new-course" href="./curso-editor.html?curso=Nuevo%20curso">＋ Nuevo curso</a>`;
    top.insertAdjacentElement('afterend',bar);
    const oldBack=document.querySelector('.side .back');if(oldBack){oldBack.href=coursesHome();oldBack.textContent='← Volver a todos los cursos';}
  }

  function courseSection(){return document.getElementById('courseName')?.closest('.section')||null;}
  function moduleSection(){return document.getElementById('moduleTitle')?.closest('.section')||null;}
  function contentsSection(){return document.getElementById('contentList')?.closest('.section')||null;}

  function ensureCourseSummary(){
    const section=courseSection();if(!section)return null;
    let box=document.getElementById('cafassoCourseSummary');
    if(!box){box=document.createElement('div');box.id='cafassoCourseSummary';box.className='cafasso-course-summary';const h=section.querySelector('h3');if(h)h.insertAdjacentElement('afterend',box);else section.prepend(box);}
    const next=`<div class="cafasso-course-summary-card"><span>Módulos del curso</span><strong>${moduleCount()}</strong></div><div class="cafasso-course-summary-card"><span>Formador a cargo</span><strong>${esc(sessionUserName())}</strong></div>`;
    if(box.innerHTML!==next)box.innerHTML=next;
    return box;
  }

  function ensureReviewPanel(){
    let panel=document.getElementById('cafassoReviewPanel');if(panel)return panel;
    const layout=document.querySelector('.layout');if(!layout)return null;
    panel=document.createElement('section');panel.id='cafassoReviewPanel';panel.className='cafasso-review-panel';
    panel.innerHTML=`<div class="eyebrow">Paso 4</div><h2>Revisar y publicar</h2><p>Revisá el curso antes de publicarlo. Podés abrir la vista previa, guardar un borrador o publicar los cambios cuando esté pronto.</p><div class="cafasso-review-actions"><button class="btn alt" type="button" id="cafassoReviewPreview">Vista previa</button><button class="btn alt" type="button" id="cafassoReviewSave">Guardar borrador</button><button class="btn green" type="button" id="cafassoReviewPublish">Publicar cambios</button></div>`;
    layout.insertAdjacentElement('afterend',panel);
    document.getElementById('cafassoReviewPreview').onclick=()=>document.getElementById('previewBtn')?.click();
    document.getElementById('cafassoReviewSave').onclick=()=>document.getElementById('saveBtn')?.click();
    document.getElementById('cafassoReviewPublish').onclick=()=>document.getElementById('publishBtn')?.click();
    return panel;
  }

  function activate(step){document.querySelectorAll('.editor-step').forEach(el=>el.classList.toggle('active',el.dataset.step===step));}
  function targetFor(step){
    if(step==='course')return courseSection();
    if(step==='modules')return document.querySelector('.outline')||moduleSection();
    if(step==='contents')return contentsSection();
    if(step==='publish')return ensureReviewPanel();
    return null;
  }
  function go(step,{smooth=true}={}){
    if(!['course','modules','contents','publish'].includes(step))step='course';
    tagSections();root.dataset.courseEditorScreen=step;if(step==='course')ensureCourseSummary();activate(step);
    const target=targetFor(step);if(target){target.classList.add('cafasso-nav-target');target.scrollIntoView({behavior:smooth?'smooth':'auto',block:'start'});}
  }

  function install(){
    const flow=document.querySelector('.editor-flow');if(!flow)return false;
    tagSections();ensureToolbar();
    [...flow.querySelectorAll('.editor-step')].forEach(old=>{
      if(old.tagName==='BUTTON'){
        old.classList.add('editor-step-button');
        if(!old.dataset.navReady){old.dataset.navReady='1';old.addEventListener('click',()=>go(old.dataset.step));}
        return;
      }
      const btn=document.createElement('button');btn.type='button';btn.className=old.className+' editor-step-button';btn.dataset.step=old.dataset.step||'';btn.innerHTML=old.innerHTML;btn.setAttribute('aria-label','Ir a '+btn.textContent.trim());btn.addEventListener('click',()=>go(btn.dataset.step));old.replaceWith(btn);
    });
    ensureCourseSummary();ensureReviewPanel();
    go(root.dataset.courseEditorScreen||'course',{smooth:false});
    return true;
  }

  document.addEventListener('click',e=>{if(e.target.closest('#addModule,#deleteModule,#duplicateModuleV2'))setTimeout(()=>{tagSections();ensureCourseSummary();},80);});
  let tries=0;const tick=()=>{if(install())return;if(tries++<40)setTimeout(tick,120);};tick();
})();