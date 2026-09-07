(()=>{
  if(window.__cafassoCourseEditorNavInstalled)return;
  window.__cafassoCourseEditorNavInstalled=true;
  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  if(page!=='curso-editor.html')return;

  const root=document.documentElement;
  const style=document.createElement('style');
  style.id='cafassoCourseEditorNavStyles';
  style.textContent=`
    .editor-step.editor-step-button{appearance:none;width:100%;text-align:left;cursor:pointer;font:inherit;transition:transform .15s ease,box-shadow .15s ease,border-color .15s ease;background:#fff}
    .editor-step.editor-step-button:hover{transform:translateY(-1px);border-color:#D9C68E;box-shadow:0 6px 16px rgba(15,45,77,.06)}
    .editor-step.editor-step-button:focus-visible{outline:3px solid rgba(242,201,76,.35);outline-offset:2px}
    .editor-step.editor-step-button.active{background:#FFF7D7}
    .cafasso-nav-target{scroll-margin-top:24px}

    html[data-course-editor-screen="course"] .layout{grid-template-columns:minmax(0,860px)!important;justify-content:center}
    html[data-course-editor-screen="course"] .outline{display:none!important}
    html[data-course-editor-screen="course"] .editor .section:not(:first-of-type){display:none!important}
    html[data-course-editor-screen="course"] .editor{padding:26px!important}

    html[data-course-editor-screen="modules"] .editor .section:first-of-type,
    html[data-course-editor-screen="contents"] .editor .section:first-of-type,
    html[data-course-editor-screen="publish"] .editor .section:first-of-type{display:none!important}

    html[data-course-editor-screen="modules"] .editor .section:nth-of-type(3),
    html[data-course-editor-screen="modules"] #blockEditor{display:none!important}

    html[data-course-editor-screen="contents"] .editor .section:nth-of-type(2){display:none!important}

    html[data-course-editor-screen="publish"] .layout{grid-template-columns:1fr!important}
    html[data-course-editor-screen="publish"] .outline{display:none!important}
    html[data-course-editor-screen="publish"] .editor{display:none!important}

    .cafasso-review-panel{display:none;background:#FFFDF9;border:1px solid var(--line);border-radius:22px;padding:26px;max-width:860px;margin:0 auto;box-shadow:0 9px 24px rgba(25,37,54,.06)}
    html[data-course-editor-screen="publish"] .cafasso-review-panel{display:block}
    .cafasso-review-panel h2{font-family:Georgia,serif;color:var(--navy);font-size:30px;margin:0 0 8px}
    .cafasso-review-panel p{color:var(--muted);line-height:1.55;margin:0 0 18px}
    .cafasso-review-actions{display:flex;gap:10px;flex-wrap:wrap}
    @media(max-width:700px){html[data-course-editor-screen="course"] .layout{display:block}.cafasso-review-actions{display:grid;grid-template-columns:1fr}.cafasso-review-actions .btn{width:100%}}
  `;
  document.head.appendChild(style);

  function activate(step){
    document.querySelectorAll('.editor-step').forEach(el=>el.classList.toggle('active',el.dataset.step===step));
  }

  function ensureReviewPanel(){
    let panel=document.getElementById('cafassoReviewPanel');
    if(panel)return panel;
    const layout=document.querySelector('.layout');
    if(!layout)return null;
    panel=document.createElement('section');
    panel.id='cafassoReviewPanel';
    panel.className='cafasso-review-panel';
    panel.innerHTML=`<div class="eyebrow">Paso 4</div><h2>Revisar y publicar</h2><p>Revisá el curso antes de publicarlo. Podés abrir la vista previa, guardar un borrador o publicar los cambios cuando esté pronto.</p><div class="cafasso-review-actions"><button class="btn alt" type="button" id="cafassoReviewPreview">Vista previa</button><button class="btn alt" type="button" id="cafassoReviewSave">Guardar borrador</button><button class="btn green" type="button" id="cafassoReviewPublish">Publicar cambios</button></div>`;
    layout.insertAdjacentElement('afterend',panel);
    document.getElementById('cafassoReviewPreview').onclick=()=>document.getElementById('previewBtn')?.click();
    document.getElementById('cafassoReviewSave').onclick=()=>document.getElementById('saveBtn')?.click();
    document.getElementById('cafassoReviewPublish').onclick=()=>document.getElementById('publishBtn')?.click();
    return panel;
  }

  function targetFor(step){
    const sections=[...document.querySelectorAll('.editor .section')];
    if(step==='course')return sections[0]||document.querySelector('.editor');
    if(step==='modules')return document.querySelector('.outline')||sections[1]||document.getElementById('moduleHeading');
    if(step==='contents')return sections[2]||document.getElementById('contentList');
    if(step==='publish')return ensureReviewPanel();
    return null;
  }

  function go(step,{smooth=true}={}){
    if(!['course','modules','contents','publish'].includes(step))step='course';
    root.dataset.courseEditorScreen=step;
    activate(step);
    const target=targetFor(step);
    if(target){
      target.classList.add('cafasso-nav-target');
      target.scrollIntoView({behavior:smooth?'smooth':'auto',block:'start'});
    }
  }

  function install(){
    const flow=document.querySelector('.editor-flow');
    if(!flow)return false;
    [...flow.querySelectorAll('.editor-step')].forEach(old=>{
      if(old.tagName==='BUTTON'){
        old.classList.add('editor-step-button');
        if(!old.dataset.navReady){old.dataset.navReady='1';old.addEventListener('click',()=>go(old.dataset.step));}
        return;
      }
      const btn=document.createElement('button');
      btn.type='button';
      btn.className=old.className+' editor-step-button';
      btn.dataset.step=old.dataset.step||'';
      btn.innerHTML=old.innerHTML;
      btn.setAttribute('aria-label','Ir a '+btn.textContent.trim());
      btn.addEventListener('click',()=>go(btn.dataset.step));
      old.replaceWith(btn);
    });
    ensureReviewPanel();
    if(!root.dataset.courseEditorScreen)go('course',{smooth:false});
    return true;
  }

  let tries=0;
  const tick=()=>{if(install())return;if(tries++<40)setTimeout(tick,120);};
  tick();
})();
