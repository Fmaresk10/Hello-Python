(()=>{
  if(window.__cafassoAdminLoginImageInstalled)return;
  window.__cafassoAdminLoginImageInstalled=true;
  if((location.pathname.split('/').pop()||'').toLowerCase()!=='admin.html')return;

  const API='https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoLoginSettings';
  const style=document.createElement('style');
  style.textContent=`
    .login-image-card{margin-top:18px;padding:20px;background:#FFFDF9;border:1px solid var(--line);border-radius:20px;box-shadow:0 8px 22px rgba(25,37,54,.05)}
    .login-image-card h3{font:24px Georgia,serif;color:var(--navy);margin:0 0 6px}
    .login-image-card p{color:var(--muted);font-size:13px;line-height:1.5;margin:0 0 14px}
    .login-image-preview{width:100%;max-width:420px;aspect-ratio:16/10;border-radius:16px;border:1px solid var(--line);background:#F3EBDD;overflow:hidden;display:grid;place-items:center;color:var(--muted);font-size:12px;margin-bottom:12px}
    .login-image-preview img{width:100%;height:100%;object-fit:cover;display:block}
    .login-image-row{display:flex;gap:8px;flex-wrap:wrap}.login-image-row input{flex:1;min-width:260px;padding:11px 12px;border:1px solid var(--line);border-radius:12px;font:inherit}
    .login-image-msg{font-size:12px;margin-top:10px;color:var(--muted)}
    @media(max-width:700px){.login-image-row{display:grid;grid-template-columns:1fr}.login-image-row input{min-width:0;width:100%}}
  `;
  document.head.appendChild(style);

  function token(){try{return JSON.parse(localStorage.getItem('cafassoAuth')||'null')?.sessionToken||''}catch(e){return''}}
  function normalize(url){
    const v=String(url||'').trim();
    const m=v.match(/drive\.google\.com\/file\/d\/([^/]+)/i)||v.match(/[?&]id=([^&]+)/i);
    return m?'https://drive.google.com/thumbnail?id='+m[1]+'&sz=w1800':v;
  }
  async function api(method,body){
    const r=await fetch(API,{method,headers:{...(body?{'Content-Type':'application/json'}:{}),...(token()?{'Authorization':'Bearer '+token()}: {})},...(body?{body:JSON.stringify(body)}:{})});
    let j={};try{j=await r.json()}catch(e){}
    if(!r.ok||j.ok===false)throw new Error(j.error||'No se pudo guardar la imagen.');
    return j;
  }
  function mount(){
    if(document.getElementById('loginImageAdminCard'))return true;
    const panel=document.querySelector('#resumen.panel')||document.querySelector('.panel.active')||document.querySelector('main');
    if(!panel)return false;
    const card=document.createElement('section');
    card.id='loginImageAdminCard';card.className='login-image-card';
    card.innerHTML='<h3>Imagen de la pantalla de ingreso</h3><p>Podés cambiarla cuando quieras. Pegá un enlace público de una imagen o de Google Drive.</p><div class="login-image-preview" id="loginImagePreview">Sin imagen cargada</div><div class="login-image-row"><input id="loginImageUrl" type="url" placeholder="Pegá acá el enlace de la imagen"><button class="btn" type="button" id="saveLoginImage">Guardar imagen</button><button class="btn alt" type="button" id="removeLoginImage">Quitar</button></div><div class="login-image-msg" id="loginImageMsg"></div>';
    panel.appendChild(card);
    const input=document.getElementById('loginImageUrl'),preview=document.getElementById('loginImagePreview'),msg=document.getElementById('loginImageMsg');
    const show=url=>{if(url){preview.innerHTML='<img src="'+url.replace(/"/g,'&quot;')+'" alt="Vista previa">';}else preview.textContent='Sin imagen cargada';};
    api('GET').then(j=>{input.value=j.imageUrl||'';show(j.imageUrl||'')}).catch(e=>msg.textContent=e.message);
    document.getElementById('saveLoginImage').onclick=async()=>{const url=normalize(input.value);input.value=url;msg.textContent='Guardando…';try{const j=await api('POST',{imageUrl:url});show(j.imageUrl||url);msg.textContent='✓ Imagen del login actualizada.';}catch(e){msg.textContent=e.message;}};
    document.getElementById('removeLoginImage').onclick=async()=>{msg.textContent='Quitando…';try{await api('POST',{imageUrl:''});input.value='';show('');msg.textContent='✓ Imagen quitada.';}catch(e){msg.textContent=e.message;}};
    return true;
  }
  let n=0;const tick=()=>{if(mount())return;if(n++<30)setTimeout(tick,150)};tick();
})();
