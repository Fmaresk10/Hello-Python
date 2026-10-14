(() => {
  'use strict';
  const HOUSES = Object.freeze({
    maturana:'Maturana', tacuru:'Movimiento Tacurú', pio:'Colegio Pío IX',
    paiva:'Instituto Benigno Paiva Irisarri', talleres:'Talleres Don Bosco'
  });
  const SPACES = ['house','patio','escuela','parroquia'];
  const CONFIG_URL = './data/cafasso-house-backgrounds.json?v=1';
  const session = (() => { try { return JSON.parse(localStorage.getItem('cafassoSession')||'{}'); } catch (_) { return {}; } })();
  const user = session.user || {};
  // La casa es independiente del grupo de animadores; nunca inferirla del nombre del grupo.
  function houseId() {
    const candidate = String(user.houseId || user.salesianHouseId || user.casaId || user.salesianHouse || '').trim().toLowerCase();
    if (HOUSES[candidate]) return candidate;
    const groupId = String(user.groupId || '').trim();
    const mapped = config.groupHouseMappings?.[groupId] || '';
    return HOUSES[mapped] ? mapped : '';
  }
  let config = { houses:{} };
  const ready = fetch(CONFIG_URL, {cache:'no-store'})
    .then(r => { if (!r.ok) throw new Error('config unavailable'); return r.json(); })
    .then(data => { config = data && typeof data === 'object' ? data : {houses:{}}; return config; })
    .catch(() => config);
  function image(space, period) {
    if (!SPACES.includes(space)) return '';
    const record = config.houses?.[houseId()]?.backgrounds?.[space];
    if (typeof record === 'string') return validURL(record) ? record : '';
    if (record && typeof record === 'object') {
      const candidate = record[period] || record.default || record.afternoon || '';
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
  ready.then(apply);
  const root = document.getElementById('app');
  if (root) {
    const observer = new MutationObserver(() => { if (Object.values(SELECTORS).some(selector => document.querySelector(selector))) apply(); });
    observer.observe(root, {childList:true, subtree:true, attributes:true, attributeFilter:['src']});
  }
  window.addEventListener('pageshow',() => ready.then(apply));
  document.addEventListener('cafasso:time-period',() => ready.then(apply));
  window.CafassoHouseBackgrounds = Object.freeze({
    ready, image, apply, houseId, houses:HOUSES, spaces:SPACES
  });
})();