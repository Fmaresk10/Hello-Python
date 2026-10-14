(() => {
  'use strict';
  const HOUSES = Object.freeze({
    maturana:'Maturana', tacuru:'Movimiento Tacurú', pio:'Colegio Pío IX',
    paiva:'Instituto Benigno Paiva Irisarri', talleres:'Talleres Don Bosco'
  });
  const SPACES = ['house','patio','escuela','parroquia'];
  const API='https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoHouses';
  const CONFIG_URL = './data/cafasso-house-backgrounds.json?v=1';
  function currentUser(){try{return JSON.parse(localStorage.getItem('cafassoSession')||'{}')?.user||{}}catch(_){return {}}}
  // La casa es independiente del grupo de animadores; nunca inferirla del nombre del grupo.
  function houseId() {
    const preview=previewHouseId();
    if(preview)return preview;
    const user=currentUser();
    const candidate = String(user.houseId || user.salesianHouseId || user.casaId || user.salesianHouse || '').trim().toLowerCase();
    if (candidate) return candidate;
    const groupId = String(user.groupId || '').trim();
    const mapped = config.groupHouseMappings?.[groupId] || '';
    return String(mapped || '').toLowerCase();
  }
  function previewHouseId(){
    const user=currentUser();
    const role=String(user.role||'').toLowerCase();
    if(!role.includes('admin'))return '';
    return String(new URLSearchParams(location.search).get('previewHouse')||'').trim().toLowerCase();
  }
  function installPreviewBar(){
    const selected=previewHouseId();
    if(!selected||document.getElementById('cafassoHousePreviewBar'))return;
    const bar=document.createElement('nav');bar.id='cafassoHousePreviewBar';
    Object.assign(bar.style,{position:'fixed',left:'12px',right:'12px',bottom:'12px',zIndex:'2147483645',display:'flex',gap:'8px',flexWrap:'wrap',alignItems:'center',padding:'12px 14px',borderRadius:'16px',background:'#f9f2e5',color:'#243f37',boxShadow:'0 8px 32px #0008',font:'600 13px system-ui,sans-serif'});
    const label=document.createElement('span');label.textContent='Vista previa · '+(config.houses?.[selected]?.name||selected);bar.append(label);
    for(const [space,title] of [['house','Casa'],['patio','Patio'],['escuela','Escuela'],['parroquia','Parroquia']]){
      const link=document.createElement('a');link.textContent=title;
      const dest=new URL(location.href);dest.searchParams.set('space',space);dest.searchParams.set('previewHouse',selected);link.href=dest.toString();
      Object.assign(link.style,{borderRadius:'9px',padding:'7px 10px',background:space===(new URLSearchParams(location.search).get('space')||'house')?'#264940':'#e7dac6',color:space===(new URLSearchParams(location.search).get('space')||'house')?'white':'#264940',textDecoration:'none'});bar.append(link);
    }
    const exit=document.createElement('a');exit.textContent='Salir de la prueba';exit.href='./casas.html';
    Object.assign(exit.style,{marginLeft:'auto',padding:'7px',color:'#264940'});bar.append(exit);
    document.body.append(bar);
  }
  let config = { houses:{} };
  async function sessionHash(){
    try{const auth=JSON.parse(localStorage.getItem('cafassoAuth')||'{}');
      if(!auth.sessionToken)return '';
      const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(auth.sessionToken));
      return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
    }catch(_){return ''}
  }
  async function loadConfig(){
    try{const r=await fetch(CONFIG_URL,{cache:'no-store'});if(r.ok){const data=await r.json();if(data&&typeof data==='object')config=data}}catch(_){}
    try{
      const hash=await sessionHash();
      if(!hash)return config;
      const r=await fetch(API,{headers:{'X-Cafasso-Session-Hash':hash},cache:'no-store'});
      if(!r.ok)return config;
      const data=await r.json();
      if(!data.ok||!Array.isArray(data.houses))return config;
      config.houses=config.houses||{};
      for(const house of data.houses){
        if(!house.slug)continue;
        const prev=config.houses[house.slug]||{};
        const backgrounds={...prev.backgrounds};
        for(const [key,value] of Object.entries(house.backgrounds||{})){
          const normalized=key==='casa'?'house':key;
          if(SPACES.includes(normalized)&&typeof value==='string'&&validURL(value))backgrounds[normalized]=value;
        }
        config.houses[house.slug]={...prev,name:house.name||prev.name||house.slug,backgrounds};
      }
    }catch(_){}
    return config;
  }
  const ready=loadConfig();
  function image(space, period) {
    if (!SPACES.includes(space)) return '';
    const record = config.houses?.[houseId()]?.backgrounds?.[space];
    if (typeof record === 'string') return validURL(record) ? record : '';
    if (record && typeof record === 'object') {
      const candidate = record[period] || record.default || '';
      return validURL(candidate) ? candidate : '';
    }
    return '';
  }
  function validURL(s) {
    if (typeof s !== 'string') return false;
    try { const u = new URL(s,location.href); return u.protocol === 'https:' || (u.origin === location.origin && u.protocol === 'http:'); }
    catch (_) { return false; }
  }
  const SELECTORS = {
    house:'.cafasso-house__image',
    patio:'.cafasso-patio__image',
    escuela:'.cafasso-escuela__image',
    parroquia:'.cafasso-parroquia__image'
  };
  function apply() {
    const space = new URLSearchParams(location.search).get('space') || 'house';
    const src = image(space, document.documentElement.dataset.cafassoPeriod || 'afternoon');
    const img = document.querySelector(SELECTORS[space]);
    if (img && src && img.getAttribute('src') !== src) {
      img.src = src;
      img.dataset.cafassoHouseBackground = houseId();
    }
    document.documentElement.dataset.cafassoSalesianHouse = houseId() || 'general';
    return Boolean(src);
  }
  ready.then(()=>{apply();if(document.body)installPreviewBar();else document.addEventListener('DOMContentLoaded',installPreviewBar,{once:true})});
  const root = document.getElementById('app');
  if (root) {
    const observer = new MutationObserver(() => { if (Object.values(SELECTORS).some(selector => document.querySelector(selector))) apply(); });
    observer.observe(root, {childList:true, subtree:true, attributes:true, attributeFilter:['src']});
  }
  window.addEventListener('pageshow',() => loadConfig().then(apply));
  window.addEventListener('storage',event=>{if(event.key==='cafassoSession'||event.key==='cafassoAuth')loadConfig().then(apply)});
  document.addEventListener('cafasso:time-period',() => loadConfig().then(apply));
  window.CafassoHouseBackgrounds = Object.freeze({
    ready, image, apply, houseId, houses:HOUSES, spaces:SPACES
  });
})();