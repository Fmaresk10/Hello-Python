(()=>{
  if(window.__cafassoAnimatorProfileChipInstalled)return;
  window.__cafassoAnimatorProfileChipInstalled=true;

  const root=document.documentElement;
  const params=new URLSearchParams(location.search);
  const role=String(root.dataset.cafassoRole||root.dataset.cafassoPreviewRole||params.get('previewRole')||'').toLowerCase();
  if(role!=='animador'&&!params.get('previewUser'))return;

  function readSession(){
    try{return JSON.parse(localStorage.getItem('cafassoSession')||'null');}
    catch(e){return null;}
  }
  function initials(name){
    const p=String(name||'').trim().split(/\s+/).filter(Boolean);
    return ((p[0]?.[0]||'A')+(p[1]?.[0]||'')).toUpperCase();
  }
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}

  const style=document.createElement('style');
  style.id='cafassoAnimatorProfileChipStyles';
  style.textContent=`
    html[data-cafasso-home-v2="1"] .cafasso-home-profile-chip{
      width:48px;height:48px;border-radius:50%;border:3px solid #FFFDF9;
      background:#E6D8C6;color:#173954;display:grid;place-items:center;overflow:hidden;
      box-shadow:0 0 0 1px rgba(23,50,74,.09),0 8px 22px rgba(23,50,74,.12);
      font:800 13px Inter,system-ui;cursor:pointer;flex:0 0 auto;padding:0;
    }
    html[data-cafasso-home-v2="1"] .cafasso-home-profile-chip img{width:100%;height:100%;object-fit:cover;display:block}
    html[data-cafasso-home-v2="1"] .cafasso-home-profile-chip:hover{transform:translateY(-1px);box-shadow:0 0 0 1px rgba(23,50,74,.12),0 10px 26px rgba(23,50,74,.16)}
    html[data-cafasso-home-v2="1"] .cafasso-home-profile-chip:focus-visible{outline:3px solid rgba(200,155,49,.32);outline-offset:3px}
    @media(max-width:680px){html[data-cafasso-home-v2="1"] .cafasso-home-profile-chip{width:42px;height:42px;border-width:2px}}
  `;
  document.head.appendChild(style);

  function mount(){
    if(root.dataset.cafassoHomeV2!=='1')return false;
    const head=document.querySelector('.cafasso-home-head');
    if(!head)return false;
    let chip=document.getElementById('cafassoHomeProfileChip');
    const session=readSession();
    const user=session?.user||{};
    const photo=String(user.avatarData||'');
    const name=String(user.name||'Animador/a');
    if(!chip){
      chip=document.createElement('button');
      chip.id='cafassoHomeProfileChip';
      chip.type='button';
      chip.className='cafasso-home-profile-chip';
      chip.title='Mi perfil';
      chip.setAttribute('aria-label','Abrir mi perfil');
      chip.onclick=()=>{
        location.hash='perfil';
        const btn=document.querySelector('[data-view="perfil"]');
        if(btn)btn.click();
      };
      const oldRight=head.querySelector('.cafasso-home-manifest');
      if(oldRight)oldRight.replaceWith(chip);else head.appendChild(chip);
    }
    if(photo)chip.innerHTML='<img src="'+esc(photo)+'" alt="Foto de perfil de '+esc(name)+'">';
    else chip.textContent=initials(name);
    return true;
  }

  function schedule(){
    let tries=0;
    const tick=()=>{
      if(mount())return;
      if(tries++<30)setTimeout(tick,120);
    };
    tick();
  }

  schedule();
  new MutationObserver(()=>mount()).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('hashchange',()=>setTimeout(mount,80));
})();