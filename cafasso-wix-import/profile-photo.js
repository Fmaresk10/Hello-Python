(()=>{
  const AUTH_API='https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoAuth';
  const STYLE_ID='cafassoProfilePhotoStyles';

  function readSession(){
    try{return JSON.parse(localStorage.getItem('cafassoSession')||'null');}
    catch(e){return null;}
  }

  function esc(v){
    return String(v==null?'':v).replace(/[&<>"']/g,c=>({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'
    })[c]);
  }

  function initials(name){
    const p=String(name||'').trim().split(/\s+/);
    return ((p[0]?.[0]||'A')+(p[1]?.[0]||'')).toUpperCase();
  }

  function isAdmin(){
    const s=readSession();
    return !!(s?.user&&String(s.user.role||'').toLowerCase().includes('admin'));
  }

  function ensureStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .avatar img{width:100%;height:100%;display:block;object-fit:cover;border-radius:50%}
      .cafasso-profile-photo-card{margin-top:16px;max-width:680px}
      .cafasso-profile-photo-row{display:flex;align-items:center;gap:20px;flex-wrap:wrap}
      .cafasso-profile-photo-preview{width:112px;height:112px;border-radius:50%;background:#F2C94C;display:grid;place-items:center;overflow:hidden;border:4px solid #fff;box-shadow:0 0 0 1px #E8DCCB,0 8px 24px rgba(15,45,77,.12);font-weight:900;font-size:30px;color:#0F2D4D;flex:0 0 auto}
      .cafasso-profile-photo-preview img{width:100%;height:100%;object-fit:cover;display:block}
      .cafasso-profile-photo-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
      .cafasso-profile-photo-help{font-size:12px;line-height:1.45;color:#687386;margin-top:8px}
      .cafasso-mobile-preview-card{margin-top:16px;max-width:680px;padding:20px}
      .cafasso-mobile-preview-card h2{font-family:Georgia,serif;color:#0F2D4D;margin:0 0 8px}
      .cafasso-mobile-preview-card p{color:#687386;line-height:1.5;margin:0 0 14px}
      .cafasso-device-wrap{position:fixed;inset:0;z-index:120;background:rgba(8,23,40,.68);display:none;align-items:center;justify-content:center;padding:18px}
      .cafasso-device-wrap.show{display:flex}
      .cafasso-device-dialog{width:min(520px,100%);max-height:96vh;display:flex;flex-direction:column;align-items:center;gap:12px}
      .cafasso-device-toolbar{width:min(430px,100%);display:flex;align-items:center;justify-content:space-between;gap:10px;background:#FFFDF9;border:1px solid #E8DCCB;border-radius:16px;padding:10px 12px;box-shadow:0 8px 24px rgba(0,0,0,.16)}
      .cafasso-device-toolbar strong{color:#0F2D4D}.cafasso-device-toolbar small{display:block;color:#687386;margin-top:2px}
      .cafasso-device-toolbar-actions{display:flex;gap:8px}.cafasso-device-toolbar button{border:1px solid #E8DCCB;background:#fff;color:#0F2D4D;border-radius:10px;padding:8px 10px;font-weight:800;cursor:pointer}
      .cafasso-device-phone{width:390px;max-width:calc(100vw - 36px);height:min(844px,calc(100vh - 118px));background:#111;border:10px solid #111;border-radius:34px;overflow:hidden;box-shadow:0 24px 70px rgba(0,0,0,.35)}
      .cafasso-device-phone iframe{display:block;width:100%;height:100%;border:0;background:#F6EFE4}
      @media(max-width:680px){
        .cafasso-profile-photo-row{align-items:flex-start}
        .cafasso-profile-photo-preview{width:96px;height:96px}
        .cafasso-profile-photo-actions{display:grid;grid-template-columns:1fr;width:100%}
        .cafasso-profile-photo-actions .btn{width:100%;min-height:44px}
        .cafasso-mobile-preview-card{display:none!important}
      }
    `;
    document.head.appendChild(style);
  }

  function updateStoredUser(userPatch){
    const s=readSession();
    if(!s?.user)return;
    s.user={...s.user,...(userPatch||{})};
    s.authenticated=true;
    s.checkedAt=Date.now();
    localStorage.setItem('cafassoSession',JSON.stringify(s));
  }

  function decorateAvatars(){
    ensureStyles();
    const s=readSession();
    if(!s?.user)return;
    const photo=String(s.user.avatarData||'');
    const fallback=initials(s.user.name);
    document.querySelectorAll('.avatar').forEach(el=>{
      if(photo){
        el.innerHTML=`<img src="${esc(photo)}" alt="Foto de perfil">`;
      }else{
        el.textContent=fallback;
      }
    });
  }

  function fileToAvatarData(file){
    return new Promise((resolve,reject)=>{
      if(!file||!String(file.type||'').startsWith('image/')){
        reject(new Error('Elegí una imagen JPG, PNG o WEBP.'));
        return;
      }
      if(file.size>8*1024*1024){
        reject(new Error('La imagen es demasiado pesada. Elegí una de menos de 8 MB.'));
        return;
      }
      const reader=new FileReader();
      reader.onerror=()=>reject(new Error('No se pudo leer la imagen.'));
      reader.onload=()=>{
        const img=new Image();
        img.onerror=()=>reject(new Error('No se pudo procesar la imagen.'));
        img.onload=()=>{
          const size=128;
          const canvas=document.createElement('canvas');
          canvas.width=size;
          canvas.height=size;
          const ctx=canvas.getContext('2d');
          const side=Math.min(img.width,img.height);
          const sx=(img.width-side)/2;
          const sy=(img.height-side)/2;
          ctx.drawImage(img,sx,sy,side,side,0,0,size,size);
          const out=canvas.toDataURL('image/jpeg',0.72);
          if(out.length>80000){
            reject(new Error('No pudimos reducir suficientemente esa foto. Probá con otra imagen.'));
            return;
          }
          resolve(out);
        };
        img.src=String(reader.result||'');
      };
      reader.readAsDataURL(file);
    });
  }

  async function saveAvatar(avatarData){
    const r=await fetch(AUTH_API,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:'saveAvatar',avatarData})
    });
    const j=await r.json();
    if(!r.ok||!j.ok)throw new Error(j.error||'No se pudo guardar la foto.');
    updateStoredUser(j.user||{avatarData});
    if(!j.user)updateStoredUser({avatarData});
    decorateAvatars();
    return j;
  }

  function setPreview(preview,removeBtn,photo,name){
    if(photo){
      preview.innerHTML=`<img src="${esc(photo)}" alt="Foto de perfil">`;
      if(removeBtn)removeBtn.hidden=false;
    }else{
      preview.textContent=initials(name);
      if(removeBtn)removeBtn.hidden=true;
    }
  }

  function openMobilePreview(){
    let wrap=document.getElementById('cafassoMobilePreviewWrap');
    if(!wrap){
      wrap=document.createElement('div');
      wrap.id='cafassoMobilePreviewWrap';
      wrap.className='cafasso-device-wrap';
      const src=location.pathname+location.search+'#inicio';
      wrap.innerHTML=`
        <div class="cafasso-device-dialog" role="dialog" aria-modal="true" aria-label="Vista móvil de CAFASSO">
          <div class="cafasso-device-toolbar">
            <div><strong>Vista móvil</strong><small>390 × 844 px</small></div>
            <div class="cafasso-device-toolbar-actions">
              <button type="button" id="cafassoReloadMobilePreview">↻</button>
              <button type="button" id="cafassoCloseMobilePreview">Cerrar</button>
            </div>
          </div>
          <div class="cafasso-device-phone"><iframe id="cafassoMobilePreviewFrame" src="${src}" title="CAFASSO en vista móvil"></iframe></div>
        </div>`;
      document.body.appendChild(wrap);
      document.getElementById('cafassoCloseMobilePreview').onclick=()=>wrap.classList.remove('show');
      document.getElementById('cafassoReloadMobilePreview').onclick=()=>{
        const frame=document.getElementById('cafassoMobilePreviewFrame');
        if(frame)frame.src=frame.src;
      };
      wrap.onclick=e=>{if(e.target===wrap)wrap.classList.remove('show');};
      document.addEventListener('keydown',e=>{if(e.key==='Escape')wrap.classList.remove('show');});
    }
    wrap.classList.add('show');
  }

  function mountAdminMobilePreview(firstCard){
    if(!isAdmin()||document.getElementById('cafassoMobilePreviewCard'))return;
    const card=document.createElement('div');
    card.id='cafassoMobilePreviewCard';
    card.className='card cafasso-mobile-preview-card';
    card.innerHTML=`
      <h2>Vista móvil</h2>
      <p>Probá CAFASSO en un teléfono simulado sin salir de tu sesión de administrador.</p>
      <button type="button" class="btn" id="cafassoOpenMobilePreview">📱 Ver como celular</button>`;
    const photoCard=document.getElementById('cafassoProfilePhotoCard');
    (photoCard||firstCard).insertAdjacentElement('afterend',card);
    document.getElementById('cafassoOpenMobilePreview').onclick=openMobilePreview;
  }

  function mountProfilePhoto(){
    decorateAvatars();
    if(location.hash!=='#perfil')return false;

    const main=document.getElementById('main');
    if(!main)return false;
    const firstCard=main.querySelector('.card');
    if(!firstCard)return false;

    const s=readSession();
    if(!s?.user)return false;
    const user=s.user;

    if(document.getElementById('cafassoProfilePhotoCard')){
      mountAdminMobilePreview(firstCard);
      return true;
    }

    const photo=String(user.avatarData||'');
    const card=document.createElement('div');
    card.id='cafassoProfilePhotoCard';
    card.className='card cafasso-profile-photo-card';
    card.innerHTML=`
      <h2 style="font-family:Georgia,serif;color:var(--navy);margin-top:0">Foto de perfil</h2>
      <div class="cafasso-profile-photo-row">
        <div id="cafassoProfilePhotoPreview" class="cafasso-profile-photo-preview"></div>
        <div style="flex:1;min-width:220px">
          <strong>Elegí una foto que te identifique</strong>
          <div class="cafasso-profile-photo-help">La foto se recorta automáticamente en formato cuadrado y se guarda en tu perfil de CAFASSO.</div>
          <div class="cafasso-profile-photo-actions">
            <button type="button" class="btn" id="cafassoChooseProfilePhoto">Elegir foto</button>
            <button type="button" class="btn alt" id="cafassoRemoveProfilePhoto">Quitar foto</button>
          </div>
          <input id="cafassoProfilePhotoInput" type="file" accept="image/jpeg,image/png,image/webp" hidden>
          <div id="cafassoProfilePhotoMessage" class="cafasso-profile-photo-help" style="font-weight:700;min-height:18px"></div>
        </div>
      </div>
    `;
    firstCard.insertAdjacentElement('afterend',card);

    const preview=document.getElementById('cafassoProfilePhotoPreview');
    const choose=document.getElementById('cafassoChooseProfilePhoto');
    const remove=document.getElementById('cafassoRemoveProfilePhoto');
    const input=document.getElementById('cafassoProfilePhotoInput');
    const msg=document.getElementById('cafassoProfilePhotoMessage');

    setPreview(preview,remove,photo,user.name);

    choose.onclick=()=>input.click();
    input.onchange=async()=>{
      const file=input.files?.[0];
      if(!file)return;
      choose.disabled=true;
      remove.disabled=true;
      choose.textContent='Guardando…';
      msg.textContent='Preparando tu foto…';
      msg.style.color='var(--muted)';
      try{
        const data=await fileToAvatarData(file);
        await saveAvatar(data);
        setPreview(preview,remove,data,user.name);
        msg.textContent='Foto de perfil actualizada.';
        msg.style.color='var(--green)';
      }catch(e){
        msg.textContent=e.message||'No se pudo guardar la foto.';
        msg.style.color='var(--red)';
      }finally{
        choose.disabled=false;
        remove.disabled=false;
        choose.textContent='Elegir foto';
        input.value='';
      }
    };

    remove.onclick=async()=>{
      if(!confirm('¿Quitar tu foto de perfil?'))return;
      choose.disabled=true;
      remove.disabled=true;
      msg.textContent='Quitando foto…';
      msg.style.color='var(--muted)';
      try{
        await saveAvatar('');
        setPreview(preview,remove,'',user.name);
        msg.textContent='Foto eliminada.';
        msg.style.color='var(--green)';
      }catch(e){
        msg.textContent=e.message||'No se pudo quitar la foto.';
        msg.style.color='var(--red)';
      }finally{
        choose.disabled=false;
        remove.disabled=false;
      }
    };

    mountAdminMobilePreview(firstCard);
    return true;
  }

  function scheduleMount(){
    let attempts=0;
    const tryMount=()=>{
      const ready=mountProfilePhoto();
      if(!ready&&location.hash==='#perfil'&&attempts<12){
        attempts+=1;
        setTimeout(tryMount,120);
      }
    };
    setTimeout(tryMount,0);
  }

  document.addEventListener('click',e=>{
    const button=e.target.closest('[data-view]');
    if(!button)return;
    setTimeout(()=>{
      decorateAvatars();
      if(button.getAttribute('data-view')==='perfil')scheduleMount();
    },0);
  });

  window.addEventListener('popstate',scheduleMount);

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',scheduleMount,{once:true});
  }else{
    scheduleMount();
  }
})();