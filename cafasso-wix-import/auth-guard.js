(()=>{
  const SITE_API=/^https:\/\/federicomaresca\.wixstudio\.com\/my-site-1\/_functions\/([A-Za-z0-9_]+)(\?.*)?$/;
  const ADMIN_API='https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoAdmin';
  const MAIL_APP='https://script.google.com/macros/s/AKfycbwwFIjRoNrptAA1_hjgE-gkX3lxxY1yjv6AzNpohH5Csx37VbAR-sjCLm9apnyAha0/exec';
  const LEGACY_CREST='47bf07_3bf4fe6421f34a05990caa87c98fffc2';
  const BRAND_MARK='./cafasso-mark.svg';
  const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const params0=new URLSearchParams(location.search);
  const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const json=(storage,key)=>{try{return JSON.parse(storage.getItem(key)||'null')}catch(e){return null}};

  function applyBranding(){
    document.querySelectorAll('img').forEach(img=>{
      if(String(img.getAttribute('src')||'').includes(LEGACY_CREST)){img.src=BRAND_MARK;img.alt='CAFASSO';}
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyBranding,{once:true});else applyBranding();
  if(page==='login.html')return;

  const realSession=json(localStorage,'cafassoSession');
  const auth=json(localStorage,'cafassoAuth');
  const clear=()=>{localStorage.removeItem('cafassoSession');localStorage.removeItem('cafassoAuth')};
  const login=()=>{clear();location.replace('./login.html')};
  if(!realSession?.authenticated||!realSession?.user||!auth?.sessionToken||Number(auth.expiresAt||0)<=Date.now()){login();return;}

  const role=String(realSession.user.role||'Animador').toLowerCase();
  const isAdmin=role.includes('admin');
  const isFormador=role.includes('formador');
  const adminOnly=new Set(['admin.html','animadores.html','grupos.html','grupo.html','asignaciones.html','importar-usuarios.html','animador.html']);
  const courseStaff=new Set(['formador.html','curso-editor.html','entregas.html','reportes.html']);
  if(adminOnly.has(page)&&!isAdmin){location.replace(isFormador?'./formador.html':'./');return;}
  if(courseStaff.has(page)&&!(isAdmin||isFormador)){location.replace('./');return;}
  document.documentElement.dataset.cafassoRole=isAdmin?'admin':isFormador?'formador':'animador';

  const exactId=String(params0.get('previewUser')||'').trim();
  let exactUser=null;
  if(isAdmin&&exactId){
    const stored=json(sessionStorage,'cafassoExactPreviewUser');
    if(stored&&String(stored._id||'')===exactId&&String(stored.role||'').toLowerCase().includes('animador'))exactUser=stored;
  }

  if(exactUser){
    document.documentElement.dataset.cafassoExactPreview='1';
    document.documentElement.dataset.cafassoPreviewRole='animador';
    const virtualSession={...realSession,user:{...realSession.user,...exactUser,role:'Animador'}};
    const nativeGet=Storage.prototype.getItem,nativeSet=Storage.prototype.setItem,nativeRemove=Storage.prototype.removeItem;
    Storage.prototype.getItem=function(key){
      if(this===localStorage&&String(key)==='cafassoSession')return JSON.stringify(virtualSession);
      return nativeGet.call(this,key);
    };
    Storage.prototype.setItem=function(key,value){
      if(this===localStorage&&['cafassoSession','cafassoAuth'].includes(String(key)))return;
      return nativeSet.call(this,key,value);
    };
    Storage.prototype.removeItem=function(key){
      if(this===localStorage&&['cafassoSession','cafassoAuth'].includes(String(key)))return;
      return nativeRemove.call(this,key);
    };
    window.CafassoExactPreview={active:true,user:exactUser};
  }

  const nativeFetch=window.fetch.bind(window);
  async function welcomeMail(payload,result,token){
    try{
      if(page!=='animadores.html'||payload?.action!=='saveUser'||!result?.temporaryPassword)return;
      const user=payload?.user||{},newRole=String(user.role||'Animador');
      if(!['Animador','Formador'].includes(newRole))return;
      const name=String(user.name||'').trim(),email=String(user.email||'').trim().toLowerCase();
      if(!name||!email)return;
      await nativeFetch(MAIL_APP,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({token,name,email,password:String(result.temporaryPassword)})});
    }catch(e){console.warn('CAFASSO: no se pudo solicitar el correo de bienvenida.',e);}
  }

  window.fetch=async function(input,init={}){
    const raw=typeof input==='string'?input:(input&&input.url)||'';
    if(!SITE_API.test(raw))return nativeFetch(input,init);
    const current=json(localStorage,'cafassoAuth');
    if(!current?.sessionToken||Number(current.expiresAt||0)<=Date.now()){location.replace('./login.html');throw new Error('Tu sesión venció. Volvé a ingresar.');}
    const method=String(init.method||(input instanceof Request?input.method:'GET')||'GET').toUpperCase();
    if(exactUser&&!['GET','HEAD','OPTIONS'].includes(method)){
      return new Response(JSON.stringify({ok:false,error:'Vista previa de solo lectura. Salí de la vista previa para modificar datos.'}),{status:403,headers:{'Content-Type':'application/json'}});
    }
    const headers=new Headers(init.headers||(input instanceof Request?input.headers:undefined));
    headers.set('Authorization','Bearer '+current.sessionToken);
    const res=await nativeFetch(input,{...init,headers});
    if(res.status===401){location.replace('./login.html');throw new Error('Tu sesión venció. Volvé a ingresar.');}
    if(page==='animadores.html'&&/\/_functions\/cafassoAdmin(?:\?|$)/.test(raw)&&method==='POST'){
      try{
        const payload=typeof init.body==='string'?JSON.parse(init.body):null;
        if(payload?.action==='saveUser')res.clone().json().then(result=>welcomeMail(payload,result,current.sessionToken)).catch(()=>{});
      }catch(e){}
    }
    return res;
  };

  function installReadOnly(){
    if(!exactUser)return;
    const style=document.createElement('style');
    style.id='cafassoExactPreviewReadOnlyStyles';
    style.textContent=`
      html[data-cafasso-exact-preview] #logout,html[data-cafasso-exact-preview] #mobileLogout,
      html[data-cafasso-exact-preview] #savePassword,html[data-cafasso-exact-preview] #profilePassword,html[data-cafasso-exact-preview] #profilePassword2,
      html[data-cafasso-exact-preview] #cafassoChooseProfilePhoto,html[data-cafasso-exact-preview] #cafassoRemoveProfilePhoto,
      html[data-cafasso-exact-preview] [data-save-answer],html[data-cafasso-exact-preview] [data-review],html[data-cafasso-exact-preview] #completeModule{display:none!important}
      html[data-cafasso-exact-preview] textarea[data-answer]{background:#F7F1E8!important;color:#526173!important;cursor:default}
    `;
    document.head.appendChild(style);
    const enforce=()=>{
      document.querySelectorAll('textarea[data-answer]').forEach(el=>{el.readOnly=true;el.setAttribute('aria-readonly','true')});
      document.querySelectorAll('#cafassoProfilePhotoInput').forEach(el=>el.disabled=true);
    };
    enforce();new MutationObserver(enforce).observe(document.documentElement,{subtree:true,childList:true});
    document.addEventListener('click',e=>{
      if(e.target.closest('#logout,#mobileLogout,#savePassword,#cafassoChooseProfilePhoto,#cafassoRemoveProfilePhoto,[data-save-answer],[data-review],#completeModule')){e.preventDefault();e.stopImmediatePropagation();}
    },true);
  }

  function installPreviewUI(){
    if(!(isAdmin||isFormador)||document.getElementById('cafassoRolePreviewStyles'))return;
    const allowed=isAdmin?['animador','formador','admin']:['animador','formador'];
    const params=new URLSearchParams(location.search);
    let preview=exactUser?'':String(params.get('previewRole')||'').toLowerCase();
    if(preview&&!allowed.includes(preview))preview='';
    if(preview)document.documentElement.dataset.cafassoPreviewRole=preview;

    const style=document.createElement('style');style.id='cafassoRolePreviewStyles';style.textContent=`
      #cafasso-role-preview-btn{position:fixed;right:18px;bottom:18px;z-index:120;border:0;border-radius:999px;background:#0F2D4D;color:#fff;padding:11px 16px;font:800 13px Inter,system-ui;box-shadow:0 10px 28px rgba(15,45,77,.24);cursor:pointer}
      #cafasso-role-preview-btn.admin-inline{position:static;box-shadow:none;background:#F2C94C;color:#0F2D4D;border-radius:12px;padding:10px 13px}
      .cafasso-admin-preview-entry{width:100%;border:0;background:rgba(242,201,76,.16);color:#F7D276;text-align:left;padding:12px 13px;border-radius:13px;font:800 14px Inter,system-ui;cursor:pointer}.cafasso-admin-preview-entry:hover{background:rgba(242,201,76,.24)}
      #cafasso-role-preview-overlay{position:fixed;inset:0;z-index:140;background:rgba(10,25,45,.48);display:none;place-items:center;padding:18px}#cafasso-role-preview-overlay.show{display:grid}
      .cafasso-role-preview-modal{width:min(500px,100%);max-height:min(760px,90vh);overflow:auto;background:#FFFDF9;border:1px solid #E8DCCB;border-radius:24px;padding:23px;box-shadow:0 24px 70px rgba(10,25,45,.28);color:#11233A;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif}
      .cafasso-role-preview-modal h3{margin:0;color:#0F2D4D;font:28px Georgia,serif}.cafasso-role-preview-modal p{color:#687386;line-height:1.5;margin:8px 0 18px}.cafasso-role-options{display:grid;gap:10px}
      .cafasso-role-option{border:1px solid #E8DCCB;background:#fff;border-radius:15px;padding:14px;text-align:left;cursor:pointer;color:#0F2D4D}.cafasso-role-option:hover{border-color:#D9BE67;background:#FFFDF5}.cafasso-role-option strong{display:block;font-size:14px}.cafasso-role-option small{display:block;color:#687386;margin-top:3px}
      .cafasso-role-option.person{display:grid;grid-template-columns:42px 1fr;align-items:center;gap:11px}.cafasso-role-person-avatar{width:42px;height:42px;border-radius:50%;background:#F2C94C;display:grid;place-items:center;font-weight:900;color:#0F2D4D}.cafasso-role-divider{display:flex;align-items:center;gap:9px;color:#8B7650;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;margin:4px 0}.cafasso-role-divider:before,.cafasso-role-divider:after{content:'';height:1px;background:#E8DCCB;flex:1}
      .cafasso-role-search{width:100%;padding:12px 13px;border:1px solid #E8DCCB;border-radius:12px;background:#fff;font:inherit;margin-bottom:12px}.cafasso-role-list{display:grid;gap:8px;max-height:390px;overflow:auto}.cafasso-role-close{width:100%;margin-top:12px;border:0;background:#F3EEE6;border-radius:12px;padding:11px;font-weight:800;color:#0F2D4D;cursor:pointer}
      #cafasso-role-preview-bar{position:fixed;left:0;right:0;top:0;z-index:130;min-height:44px;background:#F2C94C;color:#0F2D4D;display:flex;align-items:center;justify-content:center;gap:12px;padding:8px 14px;font:800 12px Inter,system-ui;box-shadow:0 5px 16px rgba(15,45,77,.12)}#cafasso-role-preview-bar button{border:0;background:#0F2D4D;color:#fff;border-radius:999px;padding:7px 10px;font-weight:800;cursor:pointer}
      html[data-cafasso-preview-role] body{padding-top:44px!important}
      html[data-cafasso-preview-role="animador"] a[href*="admin.html"],html[data-cafasso-preview-role="animador"] a[href*="formador.html"],html[data-cafasso-preview-role="animador"] a[href*="entregas.html"],html[data-cafasso-preview-role="animador"] a[href*="reportes.html"],html[data-cafasso-preview-role="animador"] a[href*="animadores.html"],html[data-cafasso-preview-role="animador"] a[href*="grupos.html"],html[data-cafasso-preview-role="animador"] a[href*="asignaciones.html"]{display:none!important}
      html[data-cafasso-preview-role="formador"] a[href*="admin.html"],html[data-cafasso-preview-role="formador"] a[href*="animadores.html"],html[data-cafasso-preview-role="formador"] a[href*="grupos.html"],html[data-cafasso-preview-role="formador"] a[href*="asignaciones.html"],html[data-cafasso-preview-role="formador"] a[href*="importar-usuarios.html"]{display:none!important}
      @media(max-width:680px){#cafasso-role-preview-btn{right:12px;bottom:86px;padding:10px 13px}.cafasso-role-preview-modal{padding:19px;border-radius:21px}#cafasso-role-preview-bar{justify-content:space-between;gap:7px;flex-wrap:wrap}.cafasso-admin-preview-entry{min-height:46px}html[data-cafasso-preview-role] .mobile-head{top:44px!important}}
    `;document.head.appendChild(style);

    const labels={animador:'Animador',formador:'Formador',admin:'Administrador'};
    const targets={animador:'./?previewRole=animador',formador:'./formador.html?previewRole=formador',admin:'./admin.html?previewRole=admin'};
    const descriptions={animador:'Vista general del rol Animador.',formador:'Cursos, entregas, devoluciones y seguimiento.',admin:'Administración general de CAFASSO.'};
    const overlay=document.createElement('div');overlay.id='cafasso-role-preview-overlay';document.body.appendChild(overlay);
    let users=[];
    const initials=name=>{const p=String(name||'').trim().split(/\s+/);return ((p[0]?.[0]||'A')+(p[1]?.[0]||'')).toUpperCase()};
    const roleModal=()=>{overlay.innerHTML=`<div class="cafasso-role-preview-modal"><h3>Ver CAFASSO como…</h3><p>La vista previa no cambia tu cuenta ni tus permisos reales.</p><div class="cafasso-role-options">${allowed.map(r=>`<button class="cafasso-role-option" data-preview-role="${r}"><strong>${labels[r]}</strong><small>${descriptions[r]}</small></button>`).join('')}${isAdmin?'<div class="cafasso-role-divider">Usuario real</div><button class="cafasso-role-option" data-user-picker><strong>👤 Elegir animador…</strong><small>Ver sus cursos, progreso y entregas reales en modo solo lectura.</small></button>':''}</div><button class="cafasso-role-close">Cancelar</button></div>`};
    const renderUsers=q=>{const list=overlay.querySelector('#cafasso-user-list');if(!list)return;const s=String(q||'').trim().toLowerCase(),rows=users.filter(u=>!s||`${u.name||''} ${u.email||''} ${u.groupName||''}`.toLowerCase().includes(s));list.innerHTML=rows.length?rows.map(u=>`<button class="cafasso-role-option person" data-user-id="${u._id}"><span class="cafasso-role-person-avatar">${initials(u.name)}</span><span><strong>${esc(u.name||'Animador')}</strong><small>${esc(u.groupName||'Sin grupo')} · ${esc(u.email||'')}</small></span></button>`).join(''):'<div style="padding:22px;text-align:center;color:#687386">No encontramos animadores.</div>'};
    async function userPicker(){
      overlay.innerHTML='<div class="cafasso-role-preview-modal"><h3>Elegir animador</h3><p>Cargando usuarios…</p></div>';
      try{
        const r=await fetch(ADMIN_API,{cache:'no-store'}),j=await r.json();if(!r.ok||!j.ok)throw new Error(j.error||'No se pudieron cargar los animadores.');
        users=(j.users||[]).filter(u=>String(u.role||'').toLowerCase().includes('animador')&&!['Bloqueado','Inactivo'].includes(String(u.status||''))).sort((a,b)=>String(a.name||'').localeCompare(String(b.name||''),'es'));
        overlay.innerHTML='<div class="cafasso-role-preview-modal"><h3>Elegir animador</h3><p>Vas a ver sus asignaciones y progreso reales. No vas a poder modificar nada.</p><input id="cafasso-user-search" class="cafasso-role-search" type="search" placeholder="Buscar por nombre, correo o grupo…"><div id="cafasso-user-list" class="cafasso-role-list"></div><button class="cafasso-role-close" data-back>← Volver</button></div>';renderUsers('');setTimeout(()=>overlay.querySelector('#cafasso-user-search')?.focus(),0);
      }catch(e){overlay.innerHTML=`<div class="cafasso-role-preview-modal"><h3>No pudimos cargar los animadores</h3><p>${esc(e.message||e)}</p><button class="cafasso-role-close" data-back>← Volver</button></div>`;}
    }
    const open=()=>{roleModal();overlay.classList.add('show')},close=()=>overlay.classList.remove('show');
    const rememberReturn=()=>{try{if(!sessionStorage.getItem('cafassoPreviewReturn')){const u=new URL(location.href);u.searchParams.delete('previewRole');u.searchParams.delete('previewUser');sessionStorage.setItem('cafassoPreviewReturn',u.toString())}}catch(e){}};
    const clearExact=()=>{try{sessionStorage.removeItem('cafassoExactPreviewUser')}catch(e){}};
    const launchUser=user=>{if(!user)return;rememberReturn();sessionStorage.setItem('cafassoExactPreviewUser',JSON.stringify(user));location.href='./?previewUser='+encodeURIComponent(user._id)};
    overlay.addEventListener('click',e=>{
      if(e.target===overlay||e.target.closest('.cafasso-role-close:not([data-back])')){close();return}
      if(e.target.closest('[data-back]')){roleModal();return}
      if(e.target.closest('[data-user-picker]')){userPicker();return}
      const ub=e.target.closest('[data-user-id]');if(ub){launchUser(users.find(u=>String(u._id)===String(ub.dataset.userId)));return}
      const rb=e.target.closest('[data-preview-role]');if(rb){rememberReturn();clearExact();location.href=targets[rb.dataset.previewRole]}
    });
    overlay.addEventListener('input',e=>{if(e.target?.id==='cafasso-user-search')renderUsers(e.target.value)});
    window.CafassoRolePreview={open,close,openUserPicker:userPicker};

    if(exactUser){
      const bar=document.createElement('div');bar.id='cafasso-role-preview-bar';bar.innerHTML=`<span>👁 Viendo como <strong>${esc(exactUser.name||'Animador')}</strong> · Solo lectura</span><span><button data-change-user>Cambiar animador</button> <button data-exit-preview>Salir</button></span>`;document.body.appendChild(bar);
      bar.querySelector('[data-change-user]').onclick=()=>{overlay.classList.add('show');userPicker()};
      bar.querySelector('[data-exit-preview]').onclick=()=>{let back='./admin.html';try{back=sessionStorage.getItem('cafassoPreviewReturn')||back;sessionStorage.removeItem('cafassoPreviewReturn');sessionStorage.removeItem('cafassoExactPreviewUser')}catch(e){}location.href=back};
    }else if(preview){
      const bar=document.createElement('div');bar.id='cafasso-role-preview-bar';bar.innerHTML=`<span>👁 Vista previa: ${labels[preview]}</span><span><button data-change-preview>Cambiar rol</button> <button data-exit-preview>Salir</button></span>`;document.body.appendChild(bar);bar.querySelector('[data-change-preview]').onclick=open;bar.querySelector('[data-exit-preview]').onclick=()=>{let back='';try{back=sessionStorage.getItem('cafassoPreviewReturn')||'';sessionStorage.removeItem('cafassoPreviewReturn')}catch(e){}if(back){location.href=back;return}params.delete('previewRole');location.href=location.pathname+(params.toString()?'?'+params.toString():'')+location.hash};
    }else if(page==='admin.html'&&isAdmin){
      const menu=document.querySelector('.menu');if(menu){const b=document.createElement('button');b.className='cafasso-admin-preview-entry';b.innerHTML='<span>👁 &nbsp; Ver como…</span>';b.onclick=open;menu.appendChild(b)}
      const head=document.querySelector('.head');if(head){const b=document.createElement('button');b.id='cafasso-role-preview-btn';b.className='admin-inline';b.textContent='👁 Ver como…';b.onclick=open;head.appendChild(b)}
    }else{const b=document.createElement('button');b.id='cafasso-role-preview-btn';b.textContent='👁 Ver como…';b.onclick=open;document.body.appendChild(b)}
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',installReadOnly,{once:true});
    document.addEventListener('DOMContentLoaded',installPreviewUI,{once:true});
  }else{installReadOnly();installPreviewUI()}
})();
// CAFASSO deploy marker: exact-user-preview-v2
