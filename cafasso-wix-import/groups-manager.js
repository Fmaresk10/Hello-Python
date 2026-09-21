(()=>{
  const API='https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoAdmin';
  const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  function install(){
    if(document.getElementById('cafassoGroupManagerStyles'))return;
    const actions=document.querySelector('.top .actions');
    if(!actions)return;
    const style=document.createElement('style');
    style.id='cafassoGroupManagerStyles';
    style.textContent=`
      #cafassoNewGroup{background:#b99b55;color:#253933;border-radius:6px}
      #cafassoGroupOverlay{position:fixed;inset:0;z-index:150;background:rgba(27,35,34,.66);display:none;place-items:center;padding:18px}
      #cafassoGroupOverlay.show{display:grid}
      .cafasso-group-modal{width:min(560px,100%);background:#f8f1e4;border:1px solid #d2c4aa;border-radius:9px;padding:22px;box-shadow:0 22px 65px rgba(25,31,30,.25);color:#2d4038}
      .cafasso-group-modal h2{margin:0;color:#30473e;font:500 28px Georgia,serif}.cafasso-group-modal p{margin:7px 0 18px;color:#68716c;line-height:1.5;font-size:12px}
      .cafasso-group-field{display:grid;gap:7px;margin-top:14px}.cafasso-group-field label{font-weight:900;color:#4d5f56;font-size:10px;text-transform:uppercase;letter-spacing:.05em}
      .cafasso-group-field input,.cafasso-group-field textarea{width:100%;border:1px solid #cfc0a7;border-radius:6px;background:#fffdf7;padding:10px 11px;font:inherit;color:#2d4038}.cafasso-group-field textarea{min-height:100px;resize:vertical}
      .cafasso-group-check{display:flex;gap:10px;align-items:center;margin-top:16px;color:#46584f;font-size:11px}.cafasso-group-check input{width:18px;height:18px}
      .cafasso-group-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:20px}.cafasso-group-actions button{border:0;border-radius:6px;padding:9px 12px;font-weight:850;cursor:pointer}.cafasso-group-cancel{background:#eee5d5;color:#40544b}.cafasso-group-save{background:#b99b55;color:#253933}.cafasso-group-save:disabled{opacity:.55;cursor:wait}
      .cafasso-group-message{min-height:18px;margin-top:10px;font-size:12px;font-weight:800;color:#2E7D59}.cafasso-group-message.error{color:#A64747}
      @media(max-width:700px){.cafasso-group-modal{padding:18px;border-radius:9px}.cafasso-group-actions{display:grid;grid-template-columns:1fr 1fr}.cafasso-group-actions button{min-height:46px}}
    `;
    document.head.appendChild(style);
    const btn=document.createElement('button');
    btn.id='cafassoNewGroup';btn.className='btn';btn.textContent='+ Nuevo grupo';actions.prepend(btn);
    const overlay=document.createElement('div');
    overlay.id='cafassoGroupOverlay';
    overlay.innerHTML=`<section class="cafasso-group-modal" role="dialog" aria-modal="true" aria-labelledby="cafassoGroupTitle"><h2 id="cafassoGroupTitle">Crear grupo</h2><p>Creá un grupo para organizar animadores y luego asignarle cursos y formaciones.</p><div class="cafasso-group-field"><label for="cafassoGroupName">Nombre del grupo</label><input id="cafassoGroupName" maxlength="80" placeholder="Ej.: GEA, ECOS, MEC…"></div><div class="cafasso-group-field"><label for="cafassoGroupDescription">Descripción</label><textarea id="cafassoGroupDescription" maxlength="500" placeholder="Breve descripción del grupo (opcional)"></textarea></div><label class="cafasso-group-check"><input id="cafassoGroupActive" type="checkbox" checked> Grupo activo</label><div id="cafassoGroupMessage" class="cafasso-group-message"></div><div class="cafasso-group-actions"><button class="cafasso-group-cancel" type="button">Cancelar</button><button class="cafasso-group-save" type="button">Crear grupo</button></div></section>`;
    document.body.appendChild(overlay);
    const name=overlay.querySelector('#cafassoGroupName'),desc=overlay.querySelector('#cafassoGroupDescription'),active=overlay.querySelector('#cafassoGroupActive'),msg=overlay.querySelector('#cafassoGroupMessage'),save=overlay.querySelector('.cafasso-group-save');
    const close=()=>{overlay.classList.remove('show');msg.textContent='';msg.classList.remove('error')};
    const open=()=>{name.value='';desc.value='';active.checked=true;msg.textContent='';msg.classList.remove('error');overlay.classList.add('show');setTimeout(()=>name.focus(),0)};
    async function submit(){
      const groupName=name.value.trim();
      if(!groupName){msg.classList.add('error');msg.textContent='Escribí un nombre para el grupo.';name.focus();return}
      save.disabled=true;msg.classList.remove('error');msg.textContent='Creando grupo…';
      try{
        const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'saveGroup',group:{name:groupName,description:desc.value.trim(),active:active.checked}})}),j=await r.json();
        if(!r.ok||!j.ok)throw new Error(j.error||'No se pudo crear el grupo.');
        msg.textContent='✓ Grupo creado correctamente';
        setTimeout(()=>location.reload(),450);
      }catch(e){msg.classList.add('error');msg.textContent=e.message||'No se pudo crear el grupo.';save.disabled=false}
    }
    btn.onclick=open;overlay.querySelector('.cafasso-group-cancel').onclick=close;save.onclick=submit;
    overlay.onclick=e=>{if(e.target===overlay)close()};
    overlay.addEventListener('keydown',e=>{if(e.key==='Escape')close();if(e.key==='Enter'&&e.target===name){e.preventDefault();submit()}});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
