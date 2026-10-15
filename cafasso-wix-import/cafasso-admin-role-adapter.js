/* CAFASSO · adapta herramientas compartidas cuando entra un administrador. */
(()=>{
  'use strict';

  function isAdmin(){
    try{
      const session=JSON.parse(localStorage.getItem('cafassoSession')||'null');
      const user=session?.authenticated&&session?.user;
      if(!user)return false;
      const roles=[user.role,...(Array.isArray(user.roles)?user.roles:[user.roles])]
        .filter(Boolean).join(' ').toLowerCase();
      return /admin|administrador/.test(roles);
    }catch(error){return false}
  }

  if(!isAdmin())return;

  const page=String(location.pathname.split('/').pop()||'').toLowerCase();
  document.body.classList.add('cafasso-admin-center','cafasso-admin-tool');

  const adminSidebar=()=>`
    <aside class="side">
      <div class="brand">
        <a href="./admin.html" aria-label="Inicio administración"><img src="./cafasso-mark.svg" alt="CAFASSO"></a>
        <div><b>CAFASSO</b><small>Centro de Administración</small></div>
      </div>
      <nav class="menu">
        <a href="./admin.html">⌂ Inicio</a>
        <a href="./animadores.html">👥 Personas</a>
        <a href="./admin.html#cursos">📚 Cursos</a>
        <a href="./hologramas.html">✦ Hologramas</a>
      </nav>
      <div class="side-foot">
        <div class="motto">Caminamos juntos,<br>animamos con el corazón.</div>
        <a class="back" href="./admin.html">← Administración</a>
      </div>
    </aside>`;

  function tuneSharedChrome(){
    document.querySelector('.mobile-admin-head')?.remove();
    document.querySelectorAll('.side .brand small').forEach(el=>el.textContent='Centro de Administración');
    document.querySelectorAll('.side .back').forEach(el=>{
      el.href='./admin.html';
      el.textContent='← Administración';
    });
  }

  if(page==='reportes.html'){
    document.body.classList.add('cafasso-admin-reports');
    tuneSharedChrome();
    return;
  }

  if(page==='entregas.html'){
    document.body.classList.add('cafasso-admin-submissions');
    const wrap=document.querySelector('body > .wrap');
    if(wrap&&!wrap.closest('.shell')){
      const shell=document.createElement('div');
      shell.className='shell';
      const main=document.createElement('main');
      wrap.before(shell);
      shell.insertAdjacentHTML('afterbegin',adminSidebar());
      shell.appendChild(main);
      main.appendChild(wrap);
    }
    const topBrand=document.querySelector('.wrap .top .brand');
    topBrand?.querySelector('a')?.remove();
    const back=document.querySelector('.wrap .top>a.btn');
    if(back){
      back.href='./admin.html';
      back.textContent='← Administración';
    }
    tuneSharedChrome();
  }
})();
