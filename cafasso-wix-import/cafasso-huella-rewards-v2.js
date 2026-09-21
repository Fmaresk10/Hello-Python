(() => {
  if (window.__cafassoHuellaRewardsV2Installed) return;
  window.__cafassoHuellaRewardsV2Installed = true;

  const REWARDS = [
    { id:'primera-huella', amount:10, title:'Primera huella' },
    { id:'ojos-atentos', amount:100, title:'Ojos atentos' },
    { id:'primer-paso', amount:20, title:'Primer paso' },
    { id:'con-el-corazon', amount:15, title:'Con el corazón' },
    { id:'camino-recorrido', amount:75, title:'Camino recorrido' },
    { id:'casa-habitada', amount:30, title:'Casa habitada' }
  ];
  const REWARD_BY_ID = new Map(REWARDS.map(item => [item.id, item.amount]));
  // El mapa de recompensas conserva IDs históricos para no restar Almitas ya ganadas.
  // El álbum visible, en cambio, sigue la nueva colección de ocho Huellas formativas.
  const HUELLAS_ORDER = ['primer-paso','en-camino','ruah-encendido','me-anime','no-alcanza-con-saber','caminante','camino-recorrido','corazon-salesiano'];
  let running = false;

  function json(storage, key) { try { return JSON.parse(storage.getItem(key) || 'null'); } catch (e) { return null; } }
  function user() { return json(localStorage, 'cafassoSession')?.user || {}; }
  function userKey() { const u = user(); return String(u?._id || u?.id || u?.email || u?.name || 'local'); }
  function rewardKey() { return `cafasso-huella-rewards-v1:${userKey()}`; }
  function huellasKey() { return `cafasso-huellas-v1:${userKey()}`; }

  function normalize(raw) {
    const source = raw && typeof raw === 'object' ? raw : {};
    const awarded = [...new Set((Array.isArray(source.awarded) ? source.awarded : []).map(String).filter(id => REWARD_BY_ID.has(id)))];
    return { version:2, awarded, bonusAlmitas:awarded.reduce((sum,id) => sum + Number(REWARD_BY_ID.get(id) || 0), 0), updatedAt:String(source.updatedAt || '') };
  }
  function read() { return normalize(json(localStorage, rewardKey())); }
  function write(state) { const clean = normalize(state); try { localStorage.setItem(rewardKey(), JSON.stringify(clean)); } catch (e) {} return clean; }
  function unlocked() { const state = json(localStorage, huellasKey()); return Array.isArray(state?.unlocked) ? state.unlocked.map(String) : []; }

  function patchAlbum(state) {
    const cards = [...document.querySelectorAll('.cafasso-huellas-grid .cafasso-huella-card')];
    if (!cards.length) return;
    const awarded = new Set(state.awarded || []);
    cards.forEach((card, index) => {
      const id = HUELLAS_ORDER[index], amount = Number(REWARD_BY_ID.get(id) || 0);
      card.querySelector('.cafasso-huella-card__reward')?.remove();
      if (!amount || !awarded.has(id) || !card.classList.contains('is-unlocked')) return;
      const reward = document.createElement('span');
      reward.className = 'cafasso-huella-card__reward';
      reward.textContent = `✦ +${amount} Almitas`;
      card.appendChild(reward);
    });
  }

  function ensureStyle() {
    if (document.getElementById('cafassoHuellaRewardsV2Styles')) return;
    const style = document.createElement('style');
    style.id = 'cafassoHuellaRewardsV2Styles';
    style.textContent = '.cafasso-huella-card__reward{display:inline-flex;align-items:center;gap:5px;margin:9px 0 0 8px;padding:4px 7px;border:1px solid rgba(150,103,42,.25);border-radius:999px;background:rgba(213,166,82,.09);color:#855b2d;font:850 8px/1 Inter,system-ui,sans-serif;letter-spacing:.04em;text-transform:uppercase}';
    document.head.appendChild(style);
  }

  function toast(items) {
    if (!items.length) return;
    const total = items.reduce((sum,item) => sum + item.amount, 0);
    document.querySelector('.cafasso-huella-reward-toast')?.remove();
    const t = document.createElement('div');
    t.className = 'cafasso-huella-reward-toast';
    t.style.cssText = 'position:fixed;z-index:2147483270;left:50%;bottom:30px;padding:13px 17px;border:1px solid rgba(238,197,104,.52);border-radius:999px;background:rgba(12,43,40,.96);box-shadow:0 15px 32px rgba(0,0,0,.34);color:#fff4d4;text-align:center;font:800 11px/1.25 Inter,system-ui,sans-serif;opacity:0;transform:translate(-50%,16px);transition:.22s opacity,.22s transform;pointer-events:none';
    t.textContent = items.length === 1 ? `✦ Huella recompensada · +${total} Almitas` : `✦ ${items.length} Huellas recompensadas · +${total} Almitas`;
    document.body.appendChild(t);
    requestAnimationFrame(() => { t.style.opacity='1'; t.style.transform='translate(-50%,0)'; });
    setTimeout(() => { t.style.opacity='0'; t.style.transform='translate(-50%,16px)'; }, 3000);
    setTimeout(() => t.remove(), 3350);
  }

  function sync({ announce = true } = {}) {
    if (running) return read();
    running = true;
    try {
      const state = read(), set = new Set(state.awarded), unlockedSet = new Set(unlocked()), newly = [];
      REWARDS.forEach(reward => {
        if (!unlockedSet.has(reward.id) || set.has(reward.id)) return;
        state.awarded.push(reward.id); set.add(reward.id); newly.push(reward);
      });
      if (newly.length) state.updatedAt = new Date().toISOString();
      const clean = write(state);
      ensureStyle(); patchAlbum(clean);
      if (announce && newly.length) toast(newly);
      if (newly.length) window.dispatchEvent(new CustomEvent('cafasso:huella-rewards', { detail:{ bonusAlmitas:clean.bonusAlmitas, awarded:clean.awarded, delta:newly.reduce((sum,item)=>sum+item.amount,0), newlyAwarded:newly.map(item=>item.id) } }));
      return clean;
    } finally { running = false; }
  }

  function boot() {
    ensureStyle();
    sync({ announce:false });
    const wake = () => setTimeout(() => sync({ announce:true }), 80);
    window.addEventListener('cafasso:exploration-update', wake);
    window.addEventListener('cafasso:progress-update', wake);
    window.addEventListener('cafasso:profile-metrics', () => setTimeout(() => patchAlbum(read()), 80));
    window.addEventListener('focus', wake);
    setInterval(() => sync({ announce:true }), 1600);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();
