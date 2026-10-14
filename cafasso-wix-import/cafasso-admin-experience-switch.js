/* CAFASSO · acceso permanente para administradores. */
(()=>{
  'use strict';
  const run=()=>{
    let session=null;
    try{session=JSON.parse(localStorage.getItem('cafassoSession')||'null')}catch(e){}
    const user=session?.authenticated&&session?.user;
    if(!user)return;
    const roles=[user.role,...(Array.isArray(user.roles)?user.roles:[user.roles])].filter(Boolean).join(' ').toLowerCase();
    if(!/admin|administrador/.test(roles))return;
    if(document.getElementById('cafassoAdminExperienceSwitch'))return;
    const style=document.createElement('style');
    style.textContent=`
      #cafassoAdminExperienceSwitch{
        position:fixed!important;z-index:2147483000!important;right:16px;bottom:18px;
        display:inline-flex!important;align-items:center;justify-content:center;gap:8px;
        max-width:calc(100vw - 32px);min-height:40px;padding:9px 14px;
        border:1px solid rgba(202,173,106,.75);border-radius:999px;
        background:rgba(24,57,53,.96);color:#fff8e8;
        font:800 11px/1.2 Inter,system-ui,-apple-system,"Segoe UI",sans-serif;
        text-decoration:none;letter-spacing:0;white-space:nowrap;
        box-shadow:0 8px 24px rgba(16,35,32,.22);backdrop-filter:blur(8px);
        cursor:pointer;
      }
      #cafassoAdminExperienceSwitch:hover{background:#315f53;transform:translateY(-1px)}
      #cafassoAdminExperienceSwitch:focus-visible{outline:3px solid #f2c95a;outline-offset:3px}
      @media(max-width:700px){
        #cafassoAdminExperienceSwitch{
          right:12px;bottom:calc(91px + env(safe-area-inset-bottom));
          min-height:38px;padding:9px 11px;font-size:10px;
        }
      }
    `;
    document.head.appendChild(style);
    const button=document.createElement('a');
    button.id='cafassoAdminExperienceSwitch';
    button.href=new URL('./experiencia.html',location.href).href;
    button.setAttribute('aria-label','Cambiar de experiencia CAFASSO');
    button.innerHTML='<span aria-hidden="true">↔</span><span>Cambiar experiencia</span>';
    document.body.appendChild(button);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
