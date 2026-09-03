(()=>{
  const SITE_API=/^https:\/\/federicomaresca\.wixstudio\.com\/my-site-1\/_functions\/([A-Za-z0-9_]+)(\?.*)?$/;
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

  function installRolePreview(){
    if(!(isAdmin||isFormador)||document.getElementById('cafassoRolePreviewStyles'))return;
    const allowed=isAdmin?['animador','formador','admin']:['animador','formador'];
    const params=new URLSearchParams(location.search);
    let preview=String(params.get('previewRole')||'').toLowerCase();
    if(preview&&!allowed.includes(preview))preview='';
    if(preview)document.documentElement.dataset.cafassoPreviewRole=preview;

    const style=document.createElement('style');
    style.id='cafassoRolePreviewStyles';
    style.textContent=`
      #cafasso-role-preview-btn{position:fixed;right:18px;bottom:18px;z-index:120;border:0;border-radius:999px;background:#0F2D4D;color:#fff;padding:11px 16px;font:800 13px Inter,system-ui;box-shadow:0 10px 28px rgba(15,45,77,.24);cursor:pointer}
      #cafasso-role-preview-overlay{position:fixed;inset:0;z-index:140;background:rgba(10,25,45,.48);display:none;place-items:center;padding:18px}
      #cafasso-role-preview-overlay.show{display:grid}
      .cafasso-role-preview-modal{width:min(470px,100%);background:#FFFDF9;border:1px solid #E8DCCB;border-radius:24px;padding:23px;box-shadow:0 24px 70px rgba(10,25,45,.28);color:#11233A;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif}
      .cafasso-role-preview-modal h3{margin:0;color:#0F2D4D;font:28px Georgia,serif}.cafasso-role-preview-modal p{color:#687386;line-height:1.5;margin:8px 0 18px}
      .cafasso-role-options{display:grid;gap:10px}.cafasso-role-option{border:1px solid #E8DCCB;background:#fff;border-radius:15px;padding:14px;text-align:left;cursor:pointer;color:#0F2D4D}.cafasso-role-option strong{display:block;font-size:14px}.cafasso-role-option small{display:block;color:#687386;margin-top:3px}
      .cafasso-role-close{width:100%;margin-top:12px;border:0;background:#F3EEE6;border-radius:12px;padding:11px;font-weight:800;color:#0F2D4D;cursor:pointer}
      #cafasso-role-preview-bar{position:fixed;left:0;right:0;top:0;z-index:130;min-height:42px;background:#F2C94C;color:#0F2D4D;display:flex;align-items:center;justify-content:center;gap:12px;padding:8px 14px;font:800 12px Inter,system-ui;box-shadow:0 5px 16px rgba(15,45,77,.12)}
      #cafasso-role-preview-bar button{border:0;background:#0F2D4D;color:#fff;border-radius:999px;padding:7px 10px;font-weight:800;cursor:pointer}
      html[data-cafasso-preview-role] body{padding-top:42px!important}
      html[data-cafasso-preview-role="animador"] a[href*="admin.html"],html[data-cafasso-preview-role="animador"] a[href*="formador.html"],html[data-cafasso-preview-role="animador"] a[href*="entregas.html"],html[data-cafasso-preview-role="animador"] a[href*="reportes.html"],html[data-cafasso-preview-role="animador"] a[href*="animadores.html"],html[data-cafasso-preview-role="animador"] a[href*="grupos.html"],html[data-cafasso-preview-role="animador"] a[href*="asignaciones.html"]{display:none!important}
      html[data-cafasso-preview-role="formador"] a[href*="admin.html"],html[data-cafasso-preview-role="formador"] a[href*="animadores.html"],html[data-cafasso-preview-role="formador"] a[href*="grupos.html"],html[data-cafasso-preview-role="formador"] a[href*="asignaciones.html"],html[data-cafasso-preview-role="formador"] a[href*="importar-usuarios.html"]{display:none!important}
      @media(max-width:680px){#cafasso-role-preview-btn{right:12px;bottom:86px;padding:10px 13px}.cafasso-role-preview-modal{padding:19px;border-radius:21px}#cafasso-role-preview-bar{justify-content:space-between}}
    `;
    document.head.appendChild(style);

    const labels={animador:'Animador',formador:'Formador',admin:'Administrador'};
    const targets={animador:'./?previewRole=animador',formador:'./formador.html?previewRole=formador',admin:'./admin.html?previewRole=admin'};
    const descriptions={animador:'Vista de formación, cursos asignados y progreso personal.',formador:'Cursos, entregas, devoluciones y seguimiento.',admin:'Administración general de CAFASSO.'};

    const overlay=document.createElement('div');
    overlay.id='cafasso-role-preview-overlay';
    overlay.innerHTML=`<div class="cafasso-role-preview-modal"><h3>Ver CAFASSO como…</h3><p>Esto solo cambia la vista. Tus permisos y tu cuenta siguen siendo los mismos.</p><div class="cafasso-role-options">${allowed.map(r=>`<button class="cafasso-role-option" data-preview-role="${r}"><strong>${labels[r]}</strong><small>${descriptions[r]}</small></button>`).join('')}</div><button class="cafasso-role-close" type="button">Cancelar</button></div>`;
    document.body.appendChild(overlay);

    function open(){overlay.classList.add('show')}
    function close(){overlay.classList.remove('show')}
    overlay.addEventListener('click',e=>{if(e.target===overlay||e.target.closest('.cafasso-role-close'))close();const b=e.target.closest('[data-preview-role]');if(!b)return;try{sessionStorage.setItem('cafassoPreviewReturn',location.href.replace(/([?&])previewRole=[^&]*&?/,'$1').replace(/[?&]$/,''));}catch(err){}location.href=targets[b.dataset.previewRole];});
    window.CafassoRolePreview={open,close};

    if(preview){
      const bar=document.createElement('div');
      bar.id='cafasso-role-preview-bar';
      bar.innerHTML=`<span>👁 Vista previa: ${labels[preview]}</span><span><button type="button" data-change-preview>Cambiar rol</button> <button type="button" data-exit-preview>Salir</button></span>`;
      document.body.appendChild(bar);
      bar.querySelector('[data-change-preview]').onclick=open;
      bar.querySelector('[data-exit-preview]').onclick=()=>{let back='';try{back=sessionStorage.getItem('cafassoPreviewReturn')||'';sessionStorage.removeItem('cafassoPreviewReturn');}catch(e){}if(back){location.href=back;return}params.delete('previewRole');const q=params.toString();location.href=location.pathname+(q?'?'+q:'')+location.hash;};
    }else{
      const btn=document.createElement('button');
      btn.id='cafasso-role-preview-btn';
      btn.type='button';
      btn.textContent='👁 Ver como…';
      btn.onclick=open;
      document.body.appendChild(btn);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installRolePreview,{once:true});else installRolePreview();

  const nativeFetch=window.fetch.bind(window);

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
})();
// CAFASSO deploy marker: role-preview-v1
