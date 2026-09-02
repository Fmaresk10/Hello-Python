(()=>{
  const CLIENT_ID='fcef70e2-7f6f-4fa8-b3a8-f673c0c74f59';
  const TOKEN_URL='https://www.wixapis.com/oauth2/token';
  const SITE_API=/^https:\/\/federicomaresca\.wixstudio\.com\/my-site-1\/_functions\/([A-Za-z0-9_]+)(\?.*)?$/;
  const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const publicPages=new Set(['login.html']);
  if(publicPages.has(page))return;

  function read(key){try{return JSON.parse(localStorage.getItem(key)||'null')}catch(e){return null}}
  function clear(){localStorage.removeItem('cafassoSession');localStorage.removeItem('cafassoAuth')}
  function login(){clear();location.replace('./login.html')}
  let session=read('cafassoSession');
  let auth=read('cafassoAuth');
  if(!session?.authenticated||!session?.user||!auth?.accessToken){login();return}

  const role=String(session.user.role||'Animador').toLowerCase();
  const isAdmin=role.includes('admin');
  const isFormador=role.includes('formador');
  const adminOnly=new Set(['admin.html','animadores.html','grupos.html','grupo.html','asignaciones.html','importar-usuarios.html','animador.html']);
  const courseStaff=new Set(['formador.html','curso-editor.html','entregas.html','reportes.html']);
  if(adminOnly.has(page)&&!isAdmin){location.replace(isFormador?'./formador.html':'./');return}
  if(courseStaff.has(page)&&!(isAdmin||isFormador)){location.replace('./');return}
  document.documentElement.dataset.cafassoRole=isAdmin?'admin':isFormador?'formador':'animador';

  const nativeFetch=window.fetch.bind(window);
  let refreshing=null;
  async function validAuth(){
    auth=read('cafassoAuth');
    if(!auth?.accessToken)throw new Error('Sesión no disponible.');
    if(Number(auth.expiresAt||0)>Date.now()+60000)return auth;
    if(!auth.refreshToken)throw new Error('La sesión venció.');
    if(!refreshing)refreshing=(async()=>{
      const r=await nativeFetch(TOKEN_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({clientId:CLIENT_ID,grantType:'refresh_token',refreshToken:auth.refreshToken})});
      const j=await r.json().catch(()=>({}));
      if(!r.ok||!j.access_token)throw new Error(j.error_description||j.error||'No se pudo renovar la sesión.');
      auth={...auth,accessToken:j.access_token,refreshToken:j.refresh_token||auth.refreshToken,expiresAt:Date.now()+Number(j.expires_in||14400)*1000};
      localStorage.setItem('cafassoAuth',JSON.stringify(auth));
      return auth;
    })().finally(()=>{refreshing=null});
    return refreshing;
  }

  window.fetch=async function(input,init={}){
    const raw=typeof input==='string'?input:(input&&input.url)||'';
    if(!SITE_API.test(raw))return nativeFetch(input,init);
    try{
      const a=await validAuth();
      const headers=new Headers(init.headers||(input instanceof Request?input.headers:undefined));
      headers.set('Authorization',a.accessToken);
      return await nativeFetch(input,{...init,headers});
    }catch(e){
      if(/sesión|renovar/i.test(String(e?.message||'')))login();
      throw e;
    }
  };
})();
