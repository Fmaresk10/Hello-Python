(()=>{
  if(window.__cafassoCourseCoverHomeInstalled)return;
  window.__cafassoCourseCoverHomeInstalled=true;

  const root=document.documentElement;
  const params=new URLSearchParams(location.search);
  const role=String(root.dataset.cafassoRole||'').toLowerCase();
  const preview=String(root.dataset.cafassoPreviewRole||params.get('previewRole')||'').toLowerCase();
  if(role!=='animador'&&preview!=='animador'&&!params.get('previewUser'))return;

  const COURSE_API='https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoCourse';
  const covers=new Map();
  const pending=new Set();
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
  function coverFromCourse(course){
    const direct=String(course?.coverImage||'').trim();
    if(/^https?:\/\//i.test(direct))return direct;
    for(const m of (course?.modules||[])){
      const u=String(m?.settings?.courseCoverImage||'').trim();
      if(/^https?:\/\//i.test(u))return u;
    }
    return '';
  }
  async function loadCover(title){
    const key=normalizeTitle(title);
    if(!key||covers.has(key)||pending.has(key))return;
    pending.add(key);
    try{
      const r=await fetch(COURSE_API+'?title='+encodeURIComponent(title),{cache:'no-store'});
      const j=await r.json();
      if(r.ok&&j.ok&&j.course)covers.set(key,coverFromCourse(j.course));
    }catch(e){covers.set(key,'');}
    finally{pending.delete(key);apply();}
  }
  function titlesOnScreen(){
    const titles=[];
    const selected=document.querySelector('.cafasso-home-course-name')?.textContent||'';
    if(selected)titles.push(selected);
    document.querySelectorAll('.cafasso-home-course h4').forEach(h=>titles.push(h.textContent||''));
    return [...new Set(titles.map(x=>String(x).trim()).filter(Boolean))];
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
        const img=document.createElement('img');img.className='cafasso-home-cover-image';img.src=url;img.alt=title||'Imagen del curso';
        cover.innerHTML='';cover.appendChild(img);cover.classList.add('has-course-cover');
      }
    });
  }
  function cycle(){
    if(root.dataset.cafassoHomeV2!=='1')return;
    titlesOnScreen().forEach(loadCover);
    apply();
  }
  cycle();
  const target=document.getElementById('app')||document.body;
  new MutationObserver(cycle).observe(target,{childList:true,subtree:true});
  window.addEventListener('hashchange',()=>setTimeout(cycle,120));
})();
