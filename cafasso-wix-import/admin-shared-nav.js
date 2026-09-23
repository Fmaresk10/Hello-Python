(()=>{
  if(window.__cafassoAdminSharedNavInstalled)return;
  window.__cafassoAdminSharedNavInstalled=true;

  const PRIMARY=[
    {key:'home',label:'Inicio',icon:'⌂',href:'./admin.html'},
    {key:'people',label:'Personas',icon:'👥',href:'./animadores.html'},
    {key:'courses',label:'Cursos',icon:'📚',href:'./admin.html#cursos'},
    {key:'submissions',label:'Entregas',icon:'📥',href:'./entregas.html'}
  ];
  const MORE=[
    {key:'groups',label:'Grupos',icon:'◉',href:'./grupos.html'},
    {key:'assignments',label:'Asignaciones',icon:'↗',href:'./asignaciones.html'},
    {key:'resources',label:'Recursos',icon:'🗂',href:'./resource-admin.html'},
    {key:'songbook',label:'Cancionero',icon:'🎵',href:'./parish-songbook-admin.html'},
    {key:'reports',label:'Reportes',icon:'📊',href:'./reportes.html'},
    {key:'cafasso',label:'Volver a CAFASSO',icon:'←',href:'./'}
  ];

  const pageName=()=>String(location.pathname.split('/').pop()||'admin.html').toLowerCase();
  const activeKey=()=>{
    const page=pageName();
    if(page==='admin.html'||page==='')return location.hash==='#cursos'?'courses':'home';
    if(page==='animadores.html')return'people';
    if(page==='entregas.html')return'submissions';
    if(page==='grupos.html'||page==='grupo.html')return'groups';
    if(page==='asignaciones.html')return'assignments';
    if(page==='resource-admin.html')return'resources';
    if(page==='parish-songbook-admin.html')return'songbook';
    if(page==='reportes.html')return'reports';
    return'more';
  };
  const isMoreActive=key=>MORE.some(item=>item.key===key&&key!=='cafasso');
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  function installStyles(){
    if(document.getElementById('cafassoAdminSharedNavStyles'))return;
    const style=document.createElement('style');
    style.id='cafassoAdminSharedNavStyles';
    style.textContent=`
      .cafasso-admin-shared-desktop{display:grid;gap:7px;margin-top:30px;position:relative}
      .cafasso-admin-shared-desktop>a,.cafasso-admin-shared-more>summary{
        display:flex;align-items:center;gap:10px;width:100%;min-height:43px;padding:10px 12px;
        border:0;border-radius:12px;background:transparent;color:#fff;text-decoration:none;
        font:800 13px/1.15 Inter,system-ui,-apple-system,"Segoe UI",sans-serif;cursor:pointer;list-style:none;
        transition:background .14s ease,color .14s ease
      }
      .cafasso-admin-shared-more>summary::-webkit-details-marker{display:none}
      .cafasso-admin-shared-desktop>a:hover,.cafasso-admin-shared-more>summary:hover{background:rgba(255,255,255,.10)}
      .cafasso-admin-shared-desktop>a.active,.cafasso-admin-shared-more.is-active>summary{background:rgba(255,255,255,.13);color:#fff}
      .cafasso-admin-shared-ico{width:21px;text-align:center;font-size:15px;flex:0 0 21px}
      .cafasso-admin-shared-label{min-width:0;flex:1}
      .cafasso-admin-shared-more{position:relative}
      .cafasso-admin-shared-more-menu{
        display:none;position:absolute;left:0;right:0;top:calc(100% + 7px);z-index:80;
        padding:7px;border:1px solid rgba(255,255,255,.12);border-radius:14px;
        background:#173d59;box-shadow:0 18px 42px rgba(4,20,34,.28)
      }
      .cafasso-admin-shared-more[open] .cafasso-admin-shared-more-menu{display:grid;gap:3px}
      .cafasso-admin-shared-more-menu a{
        display:flex;align-items:center;gap:10px;padding:10px 11px;border-radius:9px;color:#fff;
        text-decoration:none;font:750 12px Inter,system-ui,sans-serif
      }
      .cafasso-admin-shared-more-menu a:hover,.cafasso-admin-shared-more-menu a.active{background:rgba(255,255,255,.10)}
      .cafasso-admin-shared-mobile,.cafasso-admin-shared-mobile-more{display:none}
      @media(max-width:1000px) and (min-width:701px){
        .cafasso-admin-shared-desktop{margin-top:28px}
        .cafasso-admin-shared-desktop>a,.cafasso-admin-shared-more>summary{justify-content:center;padding:10px 5px}
        .cafasso-admin-shared-label{display:none}
        .cafasso-admin-shared-more-menu{left:58px;right:auto;top:0;width:210px}
      }
      @media(max-width:700px){
        body{padding-bottom:76px}
        .cafasso-admin-shared-desktop{display:none!important}
        .admin-mobile-nav,.core-mobile-nav{display:none!important}
        .admin-mobile-more,.core-mobile-more{display:none!important}
        .cafasso-admin-shared-mobile{
          display:grid;grid-template-columns:repeat(5,1fr);position:fixed;left:0;right:0;bottom:0;z-index:2147483200;
          padding:7px 6px calc(7px + env(safe-area-inset-bottom));border-top:1px solid rgba(15,45,77,.10);
          background:rgba(255,253,249,.97);backdrop-filter:blur(14px);box-shadow:0 -8px 24px rgba(15,45,77,.10)
        }
        .cafasso-admin-shared-mobile a,.cafasso-admin-shared-mobile button{
          border:0;background:transparent;color:#647284;text-decoration:none;border-radius:13px;min-height:54px;
          padding:5px 2px;display:grid;place-items:center;gap:1px;font:750 9.5px Inter,system-ui,sans-serif;cursor:pointer
        }
        .cafasso-admin-shared-mobile .cafasso-admin-shared-ico{width:auto;font-size:19px}
        .cafasso-admin-shared-mobile .active{background:#FFF4CC;color:#0F2D4D}
        .cafasso-admin-shared-mobile-more{
          position:fixed;inset:0;z-index:2147483250;background:rgba(10,25,45,.38);align-items:flex-end;padding:14px
        }
        .cafasso-admin-shared-mobile-more.show{display:flex}
        .cafasso-admin-shared-mobile-sheet{
          width:100%;max-height:min(78vh,620px);overflow:auto;background:#FFFDF9;border:1px solid #E8DCCB;
          border-radius:24px;padding:10px 10px calc(10px + env(safe-area-inset-bottom));box-shadow:0 22px 70px rgba(10,25,45,.28)
        }
        .cafasso-admin-shared-mobile-sheet-head{display:flex;align-items:center;justify-content:space-between;padding:8px 8px 12px}
        .cafasso-admin-shared-mobile-sheet-head strong{font:22px Georgia,serif;color:#0F2D4D}
        .cafasso-admin-shared-mobile-sheet-head button{
          border:0;background:#F2ECE3;border-radius:50%;width:36px;height:36px;color:#0F2D4D;font-size:18px;cursor:pointer
        }
        .cafasso-admin-shared-mobile-sheet a{
          display:flex;align-items:center;gap:12px;padding:14px;border-radius:14px;color:#0F2D4D;text-decoration:none;
          font:800 14px Inter,system-ui,sans-serif
        }
        .cafasso-admin-shared-mobile-sheet a.active{background:#FFF4CC}
        .cafasso-admin-shared-mobile-sheet a:active{background:#F7F1E8}
      }
    `;
    document.head.appendChild(style);
  }

  function desktopMarkup(){
    const key=activeKey();
    const primary=PRIMARY.map(item=>`
      <a href="${item.href}" data-admin-nav-key="${item.key}" class="${key===item.key?'active':''}">
        <span class="cafasso-admin-shared-ico">${item.icon}</span>
        <span class="cafasso-admin-shared-label">${esc(item.label)}</span>
      </a>`).join('');
    const more=MORE.map(item=>`
      <a href="${item.href}" data-admin-nav-key="${item.key}" class="${key===item.key?'active':''}">
        <span class="cafasso-admin-shared-ico">${item.icon}</span>
        <span>${esc(item.label)}</span>
      </a>`).join('');
    return primary+`
      <details class="cafasso-admin-shared-more ${isMoreActive(key)?'is-active':''}">
        <summary><span class="cafasso-admin-shared-ico">•••</span><span class="cafasso-admin-shared-label">Más</span></summary>
        <div class="cafasso-admin-shared-more-menu">${more}</div>
      </details>`;
  }

  function mountDesktop(){
    const old=document.querySelector('.side .menu, .side nav.nav, .side .nav');
    if(!old)return;
    const nav=document.createElement('nav');
    nav.className='cafasso-admin-shared-desktop';
    nav.setAttribute('aria-label','Administración');
    nav.innerHTML=desktopMarkup();
    old.replaceWith(nav);
  }

  function mountMobile(){
    document.querySelectorAll('.admin-mobile-nav,.core-mobile-nav,.admin-mobile-more,.core-mobile-more').forEach(el=>el.remove());
    const key=activeKey();
    const nav=document.createElement('nav');
    nav.className='cafasso-admin-shared-mobile';
    nav.setAttribute('aria-label','Administración');
    nav.innerHTML=PRIMARY.map(item=>`
      <a href="${item.href}" data-admin-mobile-key="${item.key}" class="${key===item.key?'active':''}">
        <span class="cafasso-admin-shared-ico">${item.icon}</span><span>${esc(item.label)}</span>
      </a>`).join('')+`
      <button type="button" data-admin-more class="${isMoreActive(key)?'active':''}">
        <span class="cafasso-admin-shared-ico">•••</span><span>Más</span>
      </button>`;
    document.body.appendChild(nav);

    const overlay=document.createElement('div');
    overlay.className='cafasso-admin-shared-mobile-more';
    overlay.innerHTML=`<section class="cafasso-admin-shared-mobile-sheet">
      <div class="cafasso-admin-shared-mobile-sheet-head"><strong>Administración</strong><button type="button" data-admin-close aria-label="Cerrar">×</button></div>
      ${MORE.map(item=>`<a href="${item.href}" class="${key===item.key?'active':''}"><span class="cafasso-admin-shared-ico">${item.icon}</span><span>${esc(item.label)}</span></a>`).join('')}
    </section>`;
    document.body.appendChild(overlay);
    nav.querySelector('[data-admin-more]').addEventListener('click',()=>overlay.classList.add('show'));
    overlay.querySelector('[data-admin-close]').addEventListener('click',()=>overlay.classList.remove('show'));
    overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.classList.remove('show')});
  }

  function refreshActive(){
    const key=activeKey();
    document.querySelectorAll('[data-admin-nav-key]').forEach(el=>el.classList.toggle('active',el.dataset.adminNavKey===key));
    const more=document.querySelector('.cafasso-admin-shared-more');
    if(more)more.classList.toggle('is-active',isMoreActive(key));
    document.querySelectorAll('[data-admin-mobile-key]').forEach(el=>el.classList.toggle('active',el.dataset.adminMobileKey===key));
    const mobileMore=document.querySelector('[data-admin-more]');
    if(mobileMore)mobileMore.classList.toggle('active',isMoreActive(key));
  }

  function init(){
    installStyles();
    mountDesktop();
    mountMobile();
    window.addEventListener('hashchange',refreshActive);
    refreshActive();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();