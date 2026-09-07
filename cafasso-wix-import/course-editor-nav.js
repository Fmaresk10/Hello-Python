(()=>{
  if(window.__cafassoCourseEditorNavInstalled)return;
  window.__cafassoCourseEditorNavInstalled=true;
  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  if(page!=='curso-editor.html')return;

  const style=document.createElement('style');
  style.id='cafassoCourseEditorNavStyles';
  style.textContent=`
    .editor-step.editor-step-button{appearance:none;width:100%;text-align:left;cursor:pointer;font:inherit;transition:transform .15s ease,box-shadow .15s ease,border-color .15s ease;background:#fff}
    .editor-step.editor-step-button:hover{transform:translateY(-1px);border-color:#D9C68E;box-shadow:0 6px 16px rgba(15,45,77,.06)}
    .editor-step.editor-step-button:focus-visible{outline:3px solid rgba(242,201,76,.35);outline-offset:2px}
    .editor-step.editor-step-button.active{background:#FFF7D7}
    .cafasso-nav-target{scroll-margin-top:24px}
  `;
  document.head.appendChild(style);

  function activate(step){
    document.querySelectorAll('.editor-step').forEach(el=>el.classList.toggle('active',el.dataset.step===step));
  }

  function targetFor(step){
    const sections=[...document.querySelectorAll('.editor .section')];
    if(step==='course')return sections[0]||document.querySelector('.editor');
    if(step==='modules')return sections[1]||document.getElementById('moduleHeading')||document.getElementById('moduleList');
    if(step==='contents')return sections[2]||document.getElementById('contentList');
    if(step==='publish')return document.querySelector('main .top .actions')||document.getElementById('publishBtn')||document.querySelector('main .top');
    return null;
  }

  function go(step){
    const target=targetFor(step);
    if(!target)return;
    target.classList.add('cafasso-nav-target');
    target.scrollIntoView({behavior:'smooth',block:'start'});
    activate(step);
    if(step==='publish')setTimeout(()=>document.getElementById('publishBtn')?.focus({preventScroll:true}),450);
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
    return true;
  }

  let tries=0;
  const tick=()=>{if(install())return;if(tries++<40)setTimeout(tick,120);};
  tick();
})();
