(()=>{
  if(typeof data==='undefined'||typeof render!=='function'||typeof saveToWix!=='function')return;
  const $e=id=>document.getElementById(id);
  const TYPES=[['Texto','📝'],['Video','🎬'],['Imagen','🖼️'],['Documento','📄'],['Reflexión','💭'],['Entrega','📥'],['Evaluación','✅']];

  const style=document.createElement('style');
  style.id='cafassoCourseEditorV3Styles';
  style.textContent=`
    .quick-content-bar{display:flex;gap:7px;flex-wrap:wrap;margin:12px 0 4px}.quick-content-bar button{border:1px solid var(--line);background:#fff;color:var(--navy);border-radius:999px;padding:8px 11px;font-size:11px;font-weight:850;cursor:pointer}.quick-content-bar button:hover{background:#FFF7D7;border-color:#E7CF73}
    .module-jump{display:flex;gap:8px;align-items:center;margin:0 0 12px}.module-jump select{flex:1;border:1px solid var(--line);background:#fff;border-radius:11px;padding:9px 10px;color:var(--navy);font:inherit}.module-jump button{border:1px solid var(--line);background:#fff;color:var(--navy);border-radius:10px;padding:9px 10px;font-weight:850;cursor:pointer}
    .block-quick-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.block-quick-actions button{border:1px solid var(--line);background:#fff;color:var(--navy);border-radius:10px;padding:8px 10px;font-size:11px;font-weight:850;cursor:pointer}.block-quick-actions .danger{color:var(--red);border-color:#ebc7c7;background:#fff7f7}
    .editor-shortcuts{font-size:11px;color:var(--muted);margin-top:8px}.editor-shortcuts kbd{background:#fff;border:1px solid var(--line);border-bottom-width:2px;border-radius:6px;padding:2px 5px;font:700 10px Inter,system-ui;color:var(--navy)}
    .editor-mobile-actions{display:none}
    @media(max-width:700px){
      body{padding-bottom:80px}.side{overflow-x:auto}.side-tools{min-width:max-content}.quick-content-bar{display:grid;grid-template-columns:repeat(2,1fr)}.quick-content-bar button{border-radius:11px;min-height:42px}.module-jump{position:sticky;top:0;z-index:8;background:var(--cream);padding:8px 0}.editor-mobile-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;position:fixed;left:0;right:0;bottom:0;z-index:95;background:rgba(255,253,249,.97);backdrop-filter:blur(12px);border-top:1px solid var(--line);padding:9px 12px calc(9px + env(safe-area-inset-bottom));box-shadow:0 -8px 24px rgba(15,45,77,.10)}.editor-mobile-actions button{min-height:46px;border:0;border-radius:12px;font-weight:850}.editor-mobile-actions .save{background:#fff;border:1px solid var(--line);color:var(--navy)}.editor-mobile-actions .publish{background:var(--green);color:#fff}
    }
  `;
  document.head.appendChild(style);

  const outline=$e('moduleList')?.closest('.outline');
  if(outline){
    const jump=document.createElement('div');jump.className='module-jump';jump.innerHTML='<button type="button" data-prev-module title="Módulo anterior">←</button><select id="moduleJumpV3" aria-label="Ir a módulo"></select><button type="button" data-next-module title="Módulo siguiente">→</button>';
    $e('moduleList').insertAdjacentElement('beforebegin',jump);
  }

  const contentsSection=$e('contentList')?.closest('.section');
  if(contentsSection){
    const bar=document.createElement('div');bar.className='quick-content-bar';bar.id='quickContentBarV3';bar.innerHTML=TYPES.map(([t,i])=>`<button type="button" data-quick-type="${t}">${i} ${t}</button>`).join('');
    $e('contentList').insertAdjacentElement('beforebegin',bar);
  }

  const blockFields=$e('blockFields');
  if(blockFields){
    const actions=document.createElement('div');actions.className='block-quick-actions';actions.id='blockQuickActionsV3';actions.innerHTML='<button type="button" data-dup-block>⧉ Duplicar</button><button type="button" data-new-after>＋ Agregar texto debajo</button><button type="button" class="danger" data-delete-block>Eliminar bloque</button>';
    blockFields.appendChild(actions);
  }

  const titleArea=document.querySelector('main .top > div:first-child');
  if(titleArea){const h=document.createElement('div');h.className='editor-shortcuts';h.innerHTML='Atajos: <kbd>Ctrl/⌘ S</kbd> guardar · <kbd>Ctrl/⌘ Enter</kbd> vista previa';titleArea.appendChild(h)}

  const mobile=document.createElement('div');mobile.className='editor-mobile-actions';mobile.innerHTML='<button class="save" type="button" data-mobile-save>Guardar</button><button class="publish" type="button" data-mobile-publish>Publicar</button>';document.body.appendChild(mobile);

  function safeSaveFields(){try{saveAllFields()}catch(e){}}
  function addBlock(type,afterCurrent=false){
    safeSaveFields();
    const m=data.modules?.[active];if(!m)return;
    const b=newBlock(type);
    if(afterCurrent&&activeBlock>=0){m.contents.splice(activeBlock+1,0,b);activeBlock++;}else{m.contents.push(b);activeBlock=m.contents.length-1;}
    render();try{cache()}catch(e){};
    setTimeout(()=>{$e('blockTitle')?.focus();$e('blockEditor')?.scrollIntoView({behavior:'smooth',block:'start'})},0);
  }
  function duplicateCurrent(){
    safeSaveFields();const m=data.modules?.[active],b=m?.contents?.[activeBlock];if(!b)return;
    const copy=JSON.parse(JSON.stringify(b));copy._id='local-'+crypto.randomUUID();copy.title=(copy.title||copy.type||'Bloque')+' · copia';m.contents.splice(activeBlock+1,0,copy);activeBlock++;render();try{cache()}catch(e){}
  }
  function deleteCurrent(){
    const m=data.modules?.[active];if(!m||activeBlock<0)return;if(!confirm('¿Eliminar este bloque?'))return;
    m.contents.splice(activeBlock,1);activeBlock=Math.min(activeBlock,m.contents.length-1);render();try{cache()}catch(e){}
  }
  function goModule(index){
    safeSaveFields();if(index<0||index>=data.modules.length)return;active=index;activeBlock=-1;render();try{cache()}catch(e){};$e('moduleHeading')?.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function refreshJump(){
    const s=$e('moduleJumpV3');if(!s)return;
    s.innerHTML=(data.modules||[]).map((m,i)=>`<option value="${i}" ${i===active?'selected':''}>${i+1}. ${String(m.title||'Módulo').replace(/[&<>"']/g,'')}</option>`).join('');
    const p=document.querySelector('[data-prev-module]'),n=document.querySelector('[data-next-module]');if(p)p.disabled=active<=0;if(n)n.disabled=active>=data.modules.length-1;
  }

  const originalRender=render;
  render=function(){originalRender();refreshJump();};
  refreshJump();

  document.addEventListener('click',e=>{
    const qt=e.target.closest('[data-quick-type]');if(qt){addBlock(qt.dataset.quickType);return}
    if(e.target.closest('[data-dup-block]')){duplicateCurrent();return}
    if(e.target.closest('[data-new-after]')){addBlock('Texto',true);return}
    if(e.target.closest('[data-delete-block]')){deleteCurrent();return}
    if(e.target.closest('[data-prev-module]')){goModule(active-1);return}
    if(e.target.closest('[data-next-module]')){goModule(active+1);return}
    if(e.target.closest('[data-mobile-save]')){saveToWix(false);return}
    if(e.target.closest('[data-mobile-publish]')){saveToWix(true);return}
  });
  $e('moduleJumpV3')?.addEventListener('change',e=>goModule(Number(e.target.value)));

  document.addEventListener('keydown',e=>{
    const mod=e.ctrlKey||e.metaKey;if(!mod)return;
    if(e.key.toLowerCase()==='s'){e.preventDefault();saveToWix(false)}
    if(e.key==='Enter'){e.preventDefault();$e('previewBtn')?.click()}
  });
})();
