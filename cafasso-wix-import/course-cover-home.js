(()=>{
  if(window.__cafassoCourseCoverHomeInstalled)return;
  window.__cafassoCourseCoverHomeInstalled=true;

  const root=document.documentElement;
  const params=new URLSearchParams(location.search);
  const role=String(root.dataset.cafassoRole||'').toLowerCase();
  const preview=String(root.dataset.cafassoPreviewRole||params.get('previewRole')||'').toLowerCase();
  if(role!=='animador'&&preview!=='animador'&&!params.get('previewUser'))return;

  const covers=new Map();
  const style=document.createElement('style');
  style.id='cafassoCourseCoverHomeStyles';
  style.textContent=`
    html[data-cafasso-home-v2="1"] .cafasso-home-cover.has-course-cover:after{display:none!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-cover-image{width:100%;height:100%;object-fit:cover;display:block}
    html[data-cafasso-home-v2="1"] .cafasso-home-visual.has-course-cover{padding:0!important;background:#173954!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-visual.has-course-cover:before{display:none!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-visual.has-course-cover:after{content:''!important;position:absolute!important;inset:0!important;width:auto!important;height:auto!important;background:linear-gradient(180deg,rgba(10,36,64,.08),rgba(10,36,64,.72))!important;border-radius:0!important;left:0!important;top:0!important;z-index:1!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-hero-image{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;z-index:0}
    html[data-cafasso-home-v2="1"] .cafasso-home-visual.has-course-cover .cafasso-home-visual-quote{position:absolute!important;left:28px!important;right:28px!important;bottom:28px!important;z-index:2!important;color:#fff!important;text-shadow:0 1px 12px rgba(0,0,0,.28)!important}
    html[data-cafasso-home-v2="1"] .cafasso-home-visual.has-course-cover .cafasso-home-visual-quote small{color:#F0D078!important}
  `;
  document.head.appendChild(style);

  function normalizeTitle(v){return String(v||'').trim().replace(/\s+/g,' ').toLowerCase();}
  function collect(){
    document.querySelectorAll('.course.card[data-course-cover],.card.course[data-course-cover]').forEach(card=>{
      const title=card.querySelector('h4,h3,strong')?.textContent||'';
      const url=card.getAttribute('data-course-cover')||card.querySelector('.course-cover-source img')?.src||'';
      if(title&&/^https?:\/\//i.test(url))covers.set(normalizeTitle(title),url);
    });
  }
  function apply(){
    if(root.dataset.cafassoHomeV2!=='1')return;
    const selectedTitle=document.querySelector('.cafasso-home-course-name')?.textContent||'';
    const heroUrl=covers.get(normalizeTitle(selectedTitle));
    const visual=document.querySelector('.cafasso-home-visual');
    if(visual&&heroUrl&&!visual.querySelector('.cafasso-home-hero-image')){
      const img=document.createElement('img');img.className='cafasso-home-hero-image';img.src=heroUrl;img.alt=selectedTitle||'Imagen del curso';
      visual.prepend(img);visual.classList.add('has-course-cover');
    }
    document.querySelectorAll('.cafasso-home-course').forEach(card=>{
      const title=card.querySelector('h4')?.textContent||'';
      const url=covers.get(normalizeTitle(title));
      const cover=card.querySelector('.cafasso-home-cover');
      if(cover&&url&&!cover.querySelector('.cafasso-home-cover-image')){
        cover.innerHTML='<img class="cafasso-home-cover-image" src="'+url.replace(/"/g,'&quot;')+'" alt="">';
        cover.classList.add('has-course-cover');
      }
    });
  }
  function cycle(){collect();apply();}
  cycle();
  const target=document.getElementById('app')||document.body;
  new MutationObserver(cycle).observe(target,{childList:true,subtree:true});
})();
