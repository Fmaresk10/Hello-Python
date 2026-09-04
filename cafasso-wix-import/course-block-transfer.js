(()=>{
  if(typeof data==='undefined'||typeof render!=='function')return;
  if(document.getElementById('cafassoBlockTransferStyles'))return;
  const $=id=>document.getElementById(id);
  const style=document.createElement('style');
  style.id='cafassoBlockTransferStyles';
  style.textContent=`
    .block-transfer{margin-top:12px;padding:12px;border:1px solid var(--line);border-radius:13px;background:#F8F4ED}.block-transfer strong{display:block;color:var(--navy);font-size:12px;margin-bottom:8px}.block-transfer-row{display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:center}.block-transfer select{width:100%;border:1px solid var(--line);border-radius:10px;background:#fff;padding:9px 10px;color:var(--navy);font:inherit}.block-transfer button{border:1px solid var(--line);background:#fff;color:var(--navy);border-radius:10px;padding:9px 10px;font-weight:800;font-size:11px;cursor:pointer}.block-transfer button:hover{background:#FFF7D7}.block-transfer-note{font-size:11px;color:var(--muted);margin-top:7px;line-height:1.4}@media(max-width:700px){.block-transfer-row{grid-template-columns:1fr 1fr}.block-transfer select{grid-column:1/-1}.block-transfer button{width:100%}}
  `;
  document.head.appendChild(style);

  const host=$('blockFields');
  if(!host)return;
  const box=document.createElement('div');
  box.className='block-transfer';
  box.id='blockTransferBox';
  box.innerHTML='<strong>Usar este bloque en otro módulo</strong><div class="block-transfer-row"><select id="blockTransferTarget" aria-label="Módulo destino"></select><button type="button" data-copy-block>Copiar</button><button type="button" data-move-block>Mover</button></div><div class="block-transfer-note">Copiar mantiene el original. Mover lo saca de este módulo y lo lleva al destino.</div>';
  host.appendChild(box);

  function selected(){return data.modules?.[active]?.contents?.[activeBlock]||null}
  function refresh(){
    const sel=$('blockTransferTarget');if(!sel)return;
    const modules=data.modules||[];
    sel.innerHTML=modules.map((m,i)=>`<option value="${i}" ${i===active?'disabled':''}>${i+1}. ${String(m.title||'Módulo').replace(/[&<>"']/g,'')}</option>`).join('');
    const usable=modules.length>1 && !!selected();
    box.style.display=selected()?'block':'none';
    box.querySelectorAll('button').forEach(b=>b.disabled=!usable);
    if(usable){const first=modules.findIndex((_,i)=>i!==active);if(first>=0)sel.value=String(first)}
  }
  function cloneBlock(b){const c=JSON.parse(JSON.stringify(b));c._id='local-'+crypto.randomUUID();return c}
  function transfer(move){
    try{saveAllFields()}catch(e){}
    const src=data.modules?.[active],b=selected(),targetIndex=Number($('blockTransferTarget')?.value);
    if(!src||!b||!Number.isInteger(targetIndex)||targetIndex<0||targetIndex>=data.modules.length||targetIndex===active)return;
    const target=data.modules[targetIndex];
    target.contents=target.contents||[];
    if(move){
      const moved=src.contents.splice(activeBlock,1)[0];
      target.contents.push(moved);
      active=targetIndex;activeBlock=target.contents.length-1;
      try{toast(`Bloque movido a “${target.title||'Módulo'}”`)}catch(e){}
    }else{
      target.contents.push(cloneBlock(b));
      try{toast(`Bloque copiado a “${target.title||'Módulo'}”`)}catch(e){}
    }
    render();try{cache()}catch(e){}
    if(move)setTimeout(()=>$('blockEditor')?.scrollIntoView({behavior:'smooth',block:'start'}),0);
  }

  const originalRender=render;
  render=function(){originalRender();refresh();};
  const originalRenderBlock=typeof renderBlock==='function'?renderBlock:null;
  if(originalRenderBlock)renderBlock=function(){originalRenderBlock();refresh();};

  document.addEventListener('click',e=>{
    if(e.target.closest('[data-copy-block]'))transfer(false);
    if(e.target.closest('[data-move-block]'))transfer(true);
  });
  refresh();
})();
