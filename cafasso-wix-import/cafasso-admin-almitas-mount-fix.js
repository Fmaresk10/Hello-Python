(() => {
  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  if(page!=='admin.html'||window.__cafassoAdminAlmitasMountFixInstalled)return;
  window.__cafassoAdminAlmitasMountFixInstalled=true;

  function ensureHost(){
    if(document.querySelector('.cafasso-gift-trigger'))return true;
    let host=document.getElementById('cafassoGiftFallbackHost');
    if(!host){
      host=document.createElement('div');
      host.id='cafassoGiftFallbackHost';
      host.className='adm2-quick';
      host.style.cssText='margin:0 0 18px;display:flex;gap:9px;flex-wrap:wrap;';
      const main=document.querySelector('main');
      if(!main)return false;
      const head=main.querySelector('.head');
      if(head&&head.nextSibling)head.parentNode.insertBefore(host,head.nextSibling);
      else main.prepend(host);
    }
    host.appendChild(document.createComment('CAFASSO Almitas gift mount'));
    return true;
  }

  function forceGiftScript(){
    if(window.__cafassoAdminAlmitasGiftsV2Installed){ensureHost();return;}
    if(document.getElementById('cafassoAdminAlmitasGiftForceLoader'))return;
    const s=document.createElement('script');
    s.id='cafassoAdminAlmitasGiftForceLoader';
    s.src='./cafasso-admin-almitas-gifts-v2.js?v=20260916-0959';
    s.onload=()=>{ensureHost();setTimeout(ensureHost,120)};
    document.body.appendChild(s);
  }

  function boot(){
    ensureHost();
    forceGiftScript();
    let tries=0;
    const timer=setInterval(()=>{
      ensureHost();
      if(document.querySelector('.cafasso-gift-trigger')||tries++>40)clearInterval(timer);
    },150);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
