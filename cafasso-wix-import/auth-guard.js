(()=>{
  const SITE_API=/^https:\/\/federicomaresca\.wixstudio\.com\/my-site-1\/_functions\/([A-Za-z0-9_]+)(\?.*)?$/;
  const AUTH_API='https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoAuth';
  const MAIL_APP='https://script.google.com/macros/s/AKfycbwwFIjRoNrptAA1_hjgE-gkX3lxxY1yjv6AzNpohH5Csx37VbAR-sjCLm9apnyAha0/exec';
  const LEGACY_CREST='47bf07_3bf4fe6421f34a05990caa87c98fffc2';
  const BRAND_MARK='./cafasso-mark.svg';
  const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();

  function applyBranding(){
    document.querySelectorAll('img').forEach(img=>{
      if(String(img.getAttribute('src')||'').includes(LEGACY_CREST)){
        img.src=BRAND_MARK;
        img.alt='CAFASSO';
      }
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyBranding,{once:true});
  else applyBranding();

  if(page==='login.html')return;

  function read(key){try{return JSON.parse(localStorage.getItem(key)||'null')}catch(e){return null}}
  function clear(){localStorage.removeItem('cafassoSession');localStorage.removeItem('cafassoAuth')}
  function login(){clear();location.replace('./login.html')}
  const session=read('cafassoSession');
  const auth=read('cafassoAuth');
  if(!session?.authenticated||!session?.user||!auth?.sessionToken||Number(auth.expiresAt||0)<=Date.now()){login();return}

  const role=String(session.user.role||'Animador').toLowerCase();
  const isAdmin=role.includes('admin');
  const isFormador=role.includes('formador');
  const adminOnly=new Set(['admin.html','animadores.html','grupos.html','grupo.html','asignaciones.html','importar-usuarios.html','animador.html']);
  const courseStaff=new Set(['formador.html','curso-editor.html','entregas.html','reportes.html']);
  if(adminOnly.has(page)&&!isAdmin){location.replace(isFormador?'./formador.html':'./');return}
  if(courseStaff.has(page)&&!(isAdmin||isFormador)){location.replace('./');return}
  document.documentElement.dataset.cafassoRole=isAdmin?'admin':isFormador?'formador':'animador';

  const nativeFetch=window.fetch.bind(window);

  function saveSessionUser(user){
    const current=read('cafassoSession')||{};
    current.authenticated=true;
    current.user={...(current.user||{}),...(user||{})};
    current.checkedAt=Date.now();
    localStorage.setItem('cafassoSession',JSON.stringify(current));
    session.user=current.user;
  }

  function addProfileStyles(){
    if(document.getElementById('cafassoProfileStyles'))return;
    const style=document.createElement('style');
    style.id='cafassoProfileStyles';
    style.textContent=`
      .avatar.cafasso-photo{background-size:cover!important;background-position:center!important;background-repeat:no-repeat!important;color:transparent!important;overflow:hidden}
      .cafasso-photo-card{margin-top:16px;max-width:680px}
      .cafasso-photo-row{display:flex;gap:20px;align-items:center;flex-wrap:wrap}
      .cafasso-photo-preview{width:112px;height:112px;border-radius:50%;background:#F2C94C;display:grid;place-items:center;font:800 30px Inter,system-ui;color:#0F2D4D;background-size:cover;background-position:center;border:4px solid #fff;box-shadow:0 0 0 1px #E8DCCB,0 8px 24px rgba(15,45,77,.12);overflow:hidden}
      .cafasso-photo-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
      .cafasso-photo-help{font-size:12px;color:#687386;line-height:1.45;margin-top:8px}
      .cafasso-profile-link{display:block;color:inherit;text-decoration:none;font-weight:700;margin-top:10px}
      @media(max-width:680px){.cafasso-photo-row{align-items:flex-start}.cafasso-photo-preview{width:96px;height:96px}.cafasso-photo-actions{display:grid;grid-template-columns:1fr;width:100%}.cafasso-photo-actions button{width:100%;min-height:44px}}
    `;
    document.head.appendChild(style);
  }

  function decorateAvatars(){
    const photo=String(session.user?.avatarData||'');
    const fallback=String(session.user?.name||'?').trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase()||'?';
    document.querySelectorAll('.avatar').forEach(el=>{
      if(photo){
        el.classList.add('cafasso-photo');
        el.style.backgroundImage=`url("${photo.replace(/"/g,'%22')}")`;
        el.textContent='';
      }else{
        el.classList.remove('cafasso-photo');
        el.style.backgroundImage='';
        el.textContent=fallback;
      }
    });
  }

  function addProfileLinks(){
    if(!(isAdmin||isFormador)||page==='index.html'||page==='')return;
    const targets=[document.querySelector('.side-foot'),document.querySelector('.foot'),document.querySelector('.admin-mobile-sheet'),document.querySelector('.core-mobile-sheet')].filter(Boolean);
    targets.forEach(target=>{
      if(target.querySelector('[data-cafasso-profile-link]'))return;
      const a=document.createElement('a');
      a.href='./#perfil';
      a.textContent='👤 Mi perfil';
      a.dataset.cafassoProfileLink='1';
      a.className='cafasso-profile-link';
      const back=target.querySelector('.back');
      if(back)target.insertBefore(a,back);else target.appendChild(a);
    });
  }

  function imageToAvatarData(file){
    return new Promise((resolve,reject)=>{
      if(!file||!String(file.type||'').startsWith('image/'))return reject(new Error('Elegí una imagen JPG, PNG o WEBP.'));
      if(file.size>8*1024*1024)return reject(new Error('La imagen es demasiado pesada. Elegí una de menos de 8 MB.'));
      const reader=new FileReader();
      reader.onerror=()=>reject(new Error('No se pudo leer la imagen.'));
      reader.onload=()=>{
        const img=new Image();
        img.onerror=()=>reject(new Error('No se pudo procesar la imagen.'));
        img.onload=()=>{
          const size=256;
          const canvas=document.createElement('canvas');
          canvas.width=size;canvas.height=size;
          const ctx=canvas.getContext('2d');
          const side=Math.min(img.width,img.height);
          const sx=(img.width-side)/2,sy=(img.height-side)/2;
          ctx.drawImage(img,sx,sy,side,side,0,0,size,size);
          let out=canvas.toDataURL('image/jpeg',0.8);
          if(out.length>180000){
            const small=document.createElement('canvas');small.width=192;small.height=192;
            small.getContext('2d').drawImage(canvas,0,0,192,192);
            out=small.toDataURL('image/jpeg',0.72);
          }
          if(out.length>220000)return reject(new Error('No pudimos reducir suficientemente esa imagen. Probá con otra foto.'));
          resolve(out);
        };
        img.src=String(reader.result||'');
      };
      reader.readAsDataURL(file);
    });
  }

  async function saveProfilePhoto(avatarData){
    const r=await fetch(AUTH_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'saveAvatar',avatarData})});
    const j=await r.json();
    if(!r.ok||!j.ok)throw new Error(j.error||'No se pudo guardar la foto.');
    saveSessionUser(j.user||{avatarData});
    decorateAvatars();
    return j;
  }

  function injectProfilePhotoCard(){
    if(page!=='index.html'&&page!=='')return;
    const main=document.getElementById('main');
    if(!main||!location.hash.includes('perfil')||document.getElementById('cafassoProfilePhotoCard'))return;
    const cards=main.querySelectorAll('.card');
    if(!cards.length)return;
    const photo=String(session.user?.avatarData||'');
    const initials=String(session.user?.name||'?').trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase()||'?';
    const card=document.createElement('div');
    card.id='cafassoProfilePhotoCard';
    card.className='card cafasso-photo-card';
    card.innerHTML=`<h2 style="font-family:Georgia,serif;color:var(--navy);margin-top:0">Foto de perfil</h2><div class="cafasso-photo-row"><div id="cafassoPhotoPreview" class="cafasso-photo-preview"${photo?` style="background-image:url('${photo}')"`:''}>${photo?'':initials}</div><div style="flex:1;min-width:220px"><strong>Elegí una foto que te identifique</strong><div class="cafasso-photo-help">CAFASSO la recorta automáticamente en formato cuadrado y guarda una versión liviana para tu perfil.</div><div class="cafasso-photo-actions"><button class="btn" id="cafassoChoosePhoto">Elegir foto</button>${photo?'<button class="btn alt" id="cafassoRemovePhoto">Quitar foto</button>':''}</div><input id="cafassoPhotoInput" type="file" accept="image/jpeg,image/png,image/webp" hidden><div id="cafassoPhotoMsg" class="cafasso-photo-help" style="font-weight:700;min-height:18px"></div></div></div>`;
    if(cards[0].nextSibling)main.insertBefore(card,cards[0].nextSibling);else main.appendChild(card);
    const input=document.getElementById('cafassoPhotoInput'),choose=document.getElementById('cafassoChoosePhoto'),remove=document.getElementById('cafassoRemovePhoto'),msg=document.getElementById('cafassoPhotoMsg'),preview=document.getElementById('cafassoPhotoPreview');
    choose.onclick=()=>input.click();
    input.onchange=async()=>{
      const file=input.files&&input.files[0];if(!file)return;
      choose.disabled=true;choose.textContent='Guardando…';msg.textContent='Preparando tu foto…';msg.style.color='var(--muted)';
      try{
        const data=await imageToAvatarData(file);
        preview.style.backgroundImage=`url('${data}')`;preview.textContent='';
        await saveProfilePhoto(data);
        msg.textContent='Foto de perfil actualizada.';msg.style.color='var(--green)';
        setTimeout(()=>{if(location.hash.includes('perfil')){const old=document.getElementById('cafassoProfilePhotoCard');if(old)old.remove();injectProfilePhotoCard();}},300);
      }catch(e){msg.textContent=e.message||'No se pudo guardar la foto.';msg.style.color='var(--red)';}
      finally{choose.disabled=false;choose.textContent='Elegir foto';input.value='';}
    };
    if(remove)remove.onclick=async()=>{
      if(!confirm('¿Quitar tu foto de perfil?'))return;
      remove.disabled=true;msg.textContent='Quitando foto…';
      try{await saveProfilePhoto('');msg.textContent='Foto eliminada.';msg.style.color='var(--green)';setTimeout(()=>{const old=document.getElementById('cafassoProfilePhotoCard');if(old)old.remove();injectProfilePhotoCard();},250);}catch(e){msg.textContent=e.message||'No se pudo quitar la foto.';msg.style.color='var(--red)';}finally{remove.disabled=false;}
    };
  }

  async function solicitarBienvenida(payload,result,sessionToken){
    try{
      if(page!=='animadores.html')return;
      if(payload?.action!=='saveUser')return;
      if(!result?.temporaryPassword)return;
      const user=payload?.user||{};
      const newRole=String(user.role||'Animador');
      if(!['Animador','Formador'].includes(newRole))return;
      const name=String(user.name||'').trim();
      const email=String(user.email||'').trim().toLowerCase();
      if(!name||!email)return;

      await nativeFetch(MAIL_APP,{
        method:'POST',
        mode:'no-cors',
        headers:{'Content-Type':'text/plain;charset=utf-8'},
        body:JSON.stringify({
          token:sessionToken,
          name,
          email,
          password:String(result.temporaryPassword)
        })
      });
    }catch(error){
      console.warn('CAFASSO: no se pudo solicitar el correo de bienvenida.',error);
    }
  }

  window.fetch=async function(input,init={}){
    const raw=typeof input==='string'?input:(input&&input.url)||'';
    if(!SITE_API.test(raw))return nativeFetch(input,init);
    const current=read('cafassoAuth');
    if(!current?.sessionToken||Number(current.expiresAt||0)<=Date.now()){login();throw new Error('Tu sesión venció. Volvé a ingresar.');}
    const headers=new Headers(init.headers||(input instanceof Request?input.headers:undefined));
    headers.set('Authorization','Bearer '+current.sessionToken);
    const res=await nativeFetch(input,{...init,headers});
    if(res.status===401){login();throw new Error('Tu sesión venció. Volvé a ingresar.');}

    if(page==='animadores.html'&&/\/_functions\/cafassoAdmin(?:\?|$)/.test(raw)&&String(init.method||'GET').toUpperCase()==='POST'){
      try{
        const payload=typeof init.body==='string'?JSON.parse(init.body):null;
        if(payload?.action==='saveUser'){
          res.clone().json().then(result=>solicitarBienvenida(payload,result,current.sessionToken)).catch(()=>{});
        }
      }catch(e){}
    }

    return res;
  };

  function refreshProfileEnhancements(){applyBranding();addProfileStyles();decorateAvatars();addProfileLinks();injectProfilePhotoCard();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refreshProfileEnhancements,{once:true});else refreshProfileEnhancements();
  window.addEventListener('hashchange',()=>setTimeout(refreshProfileEnhancements,0));
  const observer=new MutationObserver(()=>refreshProfileEnhancements());
  observer.observe(document.documentElement,{childList:true,subtree:true});
})();
// CAFASSO deploy marker: profile-photo-and-branding
