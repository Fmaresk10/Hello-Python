(() => {
  'use strict';
  const API='https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoHouses';
  const CACHE_KEY='cafasso-house-backgrounds-cache-v1';
  const PERIODS=['morning','afternoon','sunset','night'];
  const SCENES={house:'casa',patio:'patio',escuela:'escuela',parroquia:'parroquia'};
  function user(){try{return JSON.parse(localStorage.getItem('cafassoSession')||'{}').user||{}}catch(_){return {}}}
  function slug(){const x=user();return String(x.houseId||x.salesianHouseId||x.casaId||'').trim().toLowerCase()}
  function period(){
    const d=new Date(),h=d.getHours()+d.getMinutes()/60;
    // Use CAFASSO's current period when it is available.
    const shared=document.documentElement.dataset.cafassoPeriod;
    if(PERIODS.includes(shared))return shared;
    if(h>=6&&h<12)return 'morning';
    if(h>=12&&h<17.5)return 'afternoon';
    if(h>=17.5&&h<20.5)return 'sunset';
    return 'night';
  }
  function cached(){try{return JSON.parse(localStorage.getItem(CACHE_KEY)||'{}')}catch(_){return {}}}
  let houses=cached().houses||{};
  function image(scene){
    const record=houses[slug()]?.backgrounds?.[SCENES[scene]||scene];
    const url=typeof record==='string'?record:(record?.[period()]||record?.default||'');
    return typeof url==='string'&&/^https:\/\//i.test(url)?url:'';
  }
  function apply(){
    const root=document.documentElement;
    for(const scene of Object.keys(SCENES)){
      const value=image(scene);
      if(value)root.style.setProperty('--animadores-'+(scene==='house'?'casa':scene),'url("'+value.replace(/"/g,'%22')+'")');
      else root.style.removeProperty('--animadores-'+(scene==='house'?'casa':scene));
    }
    document.dispatchEvent(new CustomEvent('cafasso:educator-backgrounds-ready',{detail:{slug:slug(),period:period()}}));
  }
  async function hash(){
    try{
      const auth=JSON.parse(localStorage.getItem('cafassoAuth')||'{}');
      if(!auth.sessionToken)return '';
      const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(auth.sessionToken));
      return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
    }catch(_){return ''}
  }
  async function refresh(){
    if(!slug())return;
    try{
      const token=await hash();if(!token)return;
      const response=await fetch(API,{headers:{'X-Cafasso-Session-Hash':token},cache:'no-store'});
      if(!response.ok)return;
      const data=await response.json();if(!data.ok||!Array.isArray(data.houses))return;
      for(const house of data.houses){
        if(!house.slug)continue;
        houses[house.slug]={name:house.name,backgrounds:house.backgrounds||{}};
      }
      localStorage.setItem(CACHE_KEY,JSON.stringify({houses}));
      apply();
    }catch(e){console.warn('CAFASSO educator scenes: cached backgrounds kept',e)}
  }
  window.CafassoEducatorScenes=Object.freeze({image,apply,refresh,slug,period});
  apply();refresh();
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){apply();refresh()}});
  window.addEventListener('pageshow',apply);
  document.addEventListener('cafasso:time-period',apply);
  // Re-evaluate at most once a minute while the educator view remains open.
  setInterval(()=>{if(!document.hidden)apply()},60000);
})();
