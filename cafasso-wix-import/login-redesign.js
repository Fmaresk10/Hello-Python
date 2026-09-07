(()=>{
  if(window.__cafassoLoginRedesignInstalled)return;
  window.__cafassoLoginRedesignInstalled=true;
  if((location.pathname.split('/').pop()||'').toLowerCase()!=='login.html')return;

  const SETTINGS_API='https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoLoginSettings';
  const style=document.createElement('style');
  style.id='cafassoLoginRedesignStyles';
  style.textContent=`
    body{padding:0!important;background:#F6EFE4!important;display:block!important;min-height:100vh}
    .wrap{width:100%!important;min-height:100vh!important;display:grid!important;grid-template-columns:minmax(360px,46%) 1fr!important;border:0!important;border-radius:0!important;box-shadow:none!important;background:#FFFDF9!important}
    .intro{position:relative!important;padding:42px 46px!important;background:#0F2D4D!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;justify-content:space-between!important;min-height:100vh!important}
    .intro:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,45,77,.05),rgba(15,45,77,.58));pointer-events:none;z-index:1}
    .login-photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:none;z-index:0}
    .intro.has-photo .login-photo{display:block}
    .brand,.login-tagline{position:relative;z-index:2}
    .brand img{width:min(300px,78%)!important;filter:brightness(0) invert(1)}
    .brand small{display:none!important}
    .intro h1,.intro p,.motto{display:none!important}
    .login-tagline{max-width:390px;color:#fff;margin-top:auto;padding-top:80px}
    .login-tagline span{display:inline-block;font-size:11px;font-weight:850;letter-spacing:.12em;text-transform:uppercase;color:#F2C94C;margin-bottom:10px}
    .login-tagline strong{display:block;font:700 38px/1.05 Georgia,serif;letter-spacing:-.02em}
    .access{padding:54px clamp(34px,6vw,86px)!important;max-width:640px;width:100%;justify-self:center}
    .eyebrow{font-size:11px!important;margin-bottom:8px}
    .access h2{font-size:40px!important;margin:0 0 22px!important;line-height:1.05}
    .access>p{display:none!important}
    .field{margin:14px 0!important}
    .field label{font-size:11px!important;letter-spacing:.03em}
    .field input{padding:15px 16px!important;border-radius:14px!important;background:#fff!important}
    button{padding:15px 16px!important;border-radius:14px!important;margin-top:16px!important}
    .fine{display:none!important}
    .secure{margin-bottom:18px!important}
    .message{margin-top:14px!important;min-height:0!important}
    @media(max-width:800px){
      .wrap{grid-template-columns:1fr!important}
      .intro{min-height:32vh!important;padding:26px 24px!important}
      .brand img{width:min(240px,72%)!important}
      .login-tagline{padding-top:80px}.login-tagline strong{font-size:30px}
      .access{padding:36px 24px 48px!important;max-width:560px}
      .access h2{font-size:34px!important}
    }
  `;
  document.head.appendChild(style);

  const intro=document.querySelector('.intro');
  if(intro){
    let img=intro.querySelector('.login-photo');
    if(!img){img=document.createElement('img');img.className='login-photo';img.alt='';intro.prepend(img);}
    if(!intro.querySelector('.login-tagline')){
      const tagline=document.createElement('div');
      tagline.className='login-tagline';
      tagline.innerHTML='<span>CAFASSO</span><strong>Formar. Acompañar. Transformar.</strong>';
      intro.appendChild(tagline);
    }
    fetch(SETTINGS_API,{cache:'no-store'}).then(r=>r.ok?r.json():null).then(j=>{
      const url=String(j?.imageUrl||'').trim();
      if(!url)return;
      img.onload=()=>intro.classList.add('has-photo');
      img.onerror=()=>intro.classList.remove('has-photo');
      img.src=url;
    }).catch(()=>{});
  }
})();
