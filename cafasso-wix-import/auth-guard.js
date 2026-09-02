(()=>{
  const page=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const publicPages=new Set(['login.html']);
  if(publicPages.has(page))return;
  let session=null;
  try{session=JSON.parse(localStorage.getItem('cafassoSession')||'null')}catch(e){}
  if(!session?.user){location.replace('./login.html');return}
  const role=String(session.user.role||'Animador').toLowerCase();
  const isAdmin=role.includes('admin');
  const isFormador=role.includes('formador');
  const adminOnly=new Set(['admin.html','animadores.html','grupos.html','grupo.html','asignaciones.html','importar-usuarios.html','animador.html']);
  const courseStaff=new Set(['formador.html','curso-editor.html','entregas.html','reportes.html']);
  if(adminOnly.has(page)&&!isAdmin){location.replace(isFormador?'./formador.html':'./');return}
  if(courseStaff.has(page)&&!(isAdmin||isFormador)){location.replace('./');return}
  document.documentElement.dataset.cafassoRole=isAdmin?'admin':isFormador?'formador':'animador';
})();
