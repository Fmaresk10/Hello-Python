(() => {
  'use strict';
  const HOUSES = Object.freeze({
    maturana:'Maturana', tacuru:'Movimiento Tacurú', pio:'Colegio Pío IX',
    paiva:'Instituto Benigno Paiva Irisarri', talleres:'Talleres Don Bosco'
  });
  const SPACES = ['house','patio','escuela','parroquia'];
  const API='https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoHouses';
  const CONFIG_URL = './data/cafasso-house-backgrounds.json?v=1';
  const CACHE_KEY='cafasso-house-backgrounds-cache-v1';
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
    const periodSelect=document.createElement('select');periodSelect.setAttribute('aria-label','Momento del día');periodSelect.title='Probar fondos horarios';
    for(const [key,title] of [['','Horario real'],['morning','Mañana'],['afternoon','Tarde'],['sunset','Atardecer'],['night','Noche']]){
      const option=document.createElement('option');option.value=key;option.textContent=title;periodSelect.append(option);
    }
    periodSelect.value=previewPeriod();periodSelect.onchange=()=>{const dest=new URL(location.href);if(periodSelect.value)dest.searchParams.set('previewPeriod',periodSelect.value);else dest.searchParams.delete('previewPeriod');location.assign(dest.toString())};
    Object.assign(periodSelect.style,{padding:'7px',borderRadius:'8px',color:'#264940'});bar.append(periodSelect);
    const exit=document.createElement('a');exit.textContent='Salir de la prueba';exit.href='./casas.html';
    Object.assign(exit.style,{marginLeft:'auto',padding:'7px',color:'#264940'});bar.append(exit);
    document.body.append(bar);
  }
  function cachedConfig(){
    try{
      const data=JSON.parse(localStorage.getItem(CACHE_KEY)||'{}');
      return data&&typeof data==='object'&&data.houses&&typeof data.houses==='object'?data:{houses:{}};
    }catch(_){return {houses:{}}}
  }
  let config = cachedConfig();
  function cacheBackgrounds(){
    try{
      const houses={};
      for(const [slug,item] of Object.entries(config.houses||{})){
        if(!item||typeof item!=='object')continue;
        houses[slug]={name:item.name||slug,backgrounds:item.backgrounds||{}};
      }
      localStorage.setItem(CACHE_KEY,JSON.stringify({houses}));
    }catch(_){}
  }
  async function sessionHash(){
    try{const auth=JSON.parse(localStorage.getItem('cafassoAuth')||'{}');
      if(!auth.sessionToken)return '';
      const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(auth.sessionToken));
      return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
    }catch(_){return ''}
  }
  async function loadConfig(){
    try{const r=await fetch(CONFIG_URL,{cache:'no-store'});if(r.ok){const data=await r.json();if(data&&typeof data==='object')config={...data,houses:{...(data.houses||{}),...(config.houses||{})}}}}catch(_){}
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
        const backgrounds={};
        for(const [key,value] of Object.entries(house.backgrounds||{})){
          const normalized=key==='casa'?'house':key;
          if(!SPACES.includes(normalized))continue;
          if(typeof value==='string'&&validURL(value))backgrounds[normalized]={default:value};
          else if(value&&typeof value==='object'&&!Array.isArray(value)){
            const record={};
            for(const period of ['default','morning','afternoon','sunset','night']){
              if(typeof value[period]==='string'&&validURL(value[period]))record[period]=value[period];
            }
            backgrounds[normalized]=record;
          }
        }
        config.houses[house.slug]={...prev,name:house.name||prev.name||house.slug,backgrounds};
      }
      cacheBackgrounds();
    }catch(_){}
    return config;
  }
  const ready=loadConfig();
  const PERIODS=['morning','afternoon','sunset','night'];
  const previewPeriod=()=>{
    if(!previewHouseId())return '';
    const period=new URLSearchParams(location.search).get('previewPeriod')||'';
    return PERIODS.includes(period)?period:'';
  };
  let lastApplied={space:'',src:'',house:'',period:''};
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
    const period=previewPeriod()||document.documentElement.dataset.cafassoPeriod||'afternoon';
    const src = image(space,period);
    const img = document.querySelector(SELECTORS[space]);
    if(img && src && img.getAttribute('src')!==src){
      img.src=src;
      img.dataset.cafassoHouseBackground=houseId();
    }
    if(img && !src){
      // Sin fondo propio (o Wix inaccesible): recuperar imagen general, nunca dejar un fondo neutro permanente.
      const general=window.CafassoOriginalSceneBackgrounds?.[space]?.[period]
        ||window.CafassoOriginalSceneBackgrounds?.[space]?.afternoon||'';
      if(general&&img.getAttribute('src')!==general)img.src=general;
      if(img.dataset.cafassoHouseBackground)delete img.dataset.cafassoHouseBackground;
    }
    lastApplied={space,src,house:houseId(),period};
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
  document.addEventListener('cafasso:time-period',apply);
  document.addEventListener('cafasso:period-changed',apply);
  window.CafassoHouseBackgrounds = Object.freeze({
    ready, image, apply, houseId, houses:HOUSES, spaces:SPACES, previewPeriod
  });
})();