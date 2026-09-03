(()=>{
  const SITE_API=/^https:\/\/federicomaresca\.wixstudio\.com\/my-site-1\/_functions\/([A-Za-z0-9_]+)(\?.*)?$/;
  const MAIL_APP='https://script.google.com/macros/s/AKfycbwwFIjRoNrptAA1_hjgE-gkX3lxxY1yjv6AzNpohH5Csx37VbAR-sjCLm9apnyAha0/exec';
  const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
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

  async function solicitarBienvenida(payload,result,sessionToken){
    try{
      if(page!=='animadores.html')return;
      if(payload?.action!=='saveUser')return;
      if(!result?.temporaryPassword)return;
      const user=payload?.user||{};
      if(String(user.role||'Animador')!=='Animador')return;
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
// CAFASSO deploy marker: welcome-email-on-new-animator
