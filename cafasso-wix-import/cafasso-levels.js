(() => {
  if (window.__cafassoLevelsInstalled) return;
  window.__cafassoLevelsInstalled = true;

  const STYLE_ID = 'cafassoLevelsStyles';
  const LEVELS = [
    { id:'sonador', min:0, title:'Soñador', icon:'✧', copy:'Todo empieza con una intuición que invita a ponerse en camino.' },
    { id:'caminante', min:100, title:'Caminante', icon:'›', copy:'Ya no mirás desde afuera: empezaste a recorrer el camino.' },
    { id:'presencia', min:300, title:'Presencia', icon:'◉', copy:'Tu camino empieza a hacerse presencia cercana entre otros.' },
    { id:'acompanante', min:600, title:'Acompañante', icon:'◇', copy:'Aprender se convierte en estar cerca, escuchar y sostener.' },
    { id:'servidor', min:1000, title:'Servidor', icon:'✦', copy:'Lo recibido empieza a volverse entrega concreta.' },
    { id:'corazon-salesiano', min:1600, title:'Corazón salesiano', icon:'♡', copy:'Casa, patio, escuela y parroquia se vuelven una misma forma de estar.' }
  ];

  function json(storage, key) { try { return JSON.parse(storage.getItem(key) || 'null'); } catch (e) { return null; } }
  function userKey() { const u = json(localStorage, 'cafassoSession')?.user || {}; return String(u?._id || u?.id || u?.email || u?.name || 'local'); }
  function stateKey() { return `cafasso-levels-v2:${userKey()}`; }

  function levelFor(total) {
    let level = LEVELS[0];
    LEVELS.forEach(item => { if (total >= item.min) level = item; });
    const index = LEVELS.findIndex(item => item.id === level.id);
    const next = LEVELS[index + 1] || null;
    const span = next ? Math.max(1, next.min - level.min) : 1;
    const progress = next ? Math.max(0, Math.min(100, ((total - level.min) / span) * 100)) : 100;
    return { level, next, index, progress };
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-level-pill{position:fixed;z-index:2147482999;left:18px;top:82px;display:flex;align-items:center;gap:8px;max-width:220px;padding:7px 11px;border:1px solid rgba(242,201,90,.32);border-radius:999px;background:rgba(8,37,40,.82);box-shadow:0 7px 18px rgba(0,0,0,.22);backdrop-filter:blur(9px);color:#fff8e9;font-family:Inter,system-ui,sans-serif;pointer-events:none}.cafasso-level-pill__icon{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;border:1px solid rgba(242,201,90,.34);background:rgba(242,201,90,.12);color:#f4d889;font:700 12px/1 Georgia,serif}.cafasso-level-pill small{display:block;color:#d7c99c;font:850 6.5px/1 Inter,system-ui,sans-serif;letter-spacing:.13em;text-transform:uppercase}.cafasso-level-pill strong{display:block;margin-top:2px;color:#fff9e8;font:800 11px/1.05 Inter,system-ui,sans-serif}body.cafasso-journey-mode .cafasso-level-pill,body.cafasso-mission-mode .cafasso-level-pill{display:none!important}
      .cafasso-level-panel{position:relative;margin:0 7px 16px;padding:15px 16px 14px;border:1px solid rgba(114,77,42,.22);background:linear-gradient(90deg,rgba(255,250,237,.28),rgba(246,230,196,.22));font-family:Georgia,serif;color:#4c3a2b}.cafasso-level-panel__head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}.cafasso-level-panel__eyebrow{color:#91704f;font:850 8px/1 Inter,system-ui,sans-serif;letter-spacing:.15em;text-transform:uppercase}.cafasso-level-panel h3{margin:5px 0;color:#493629;font:500 26px/1 Georgia,serif}.cafasso-level-panel p{margin:0;color:#78624e;font:12px/1.45 Inter,system-ui,sans-serif}.cafasso-level-panel__icon{display:grid;place-items:center;flex:0 0 46px;width:46px;height:46px;border:1px solid rgba(128,82,38,.42);border-radius:50%;background:radial-gradient(circle at 35% 30%,#e7c98f,#ad793f 72%);color:#57371d;font:700 21px/1 Georgia,serif}.cafasso-level-progress{height:7px;margin-top:13px;border-radius:999px;background:rgba(117,85,51,.12);overflow:hidden}.cafasso-level-progress i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#b7894e,#ddbd78);width:0;transition:width .4s ease}.cafasso-level-panel__foot{display:flex;justify-content:space-between;gap:12px;margin-top:7px;color:#8a725b;font:750 9px/1.25 Inter,system-ui,sans-serif}.cafasso-level-panel__foot b{color:#6e5036}
      .cafasso-level-up{position:fixed;z-index:2147483280;left:50%;top:50%;width:min(440px,88vw);padding:29px;border:1px solid rgba(235,194,101,.62);border-radius:8px;background:linear-gradient(145deg,rgba(52,43,30,.99),rgba(14,48,43,.99));box-shadow:0 30px 80px rgba(0,0,0,.52);color:#fff0c7;text-align:center;font-family:Georgia,serif;opacity:0;transform:translate(-50%,-46%) scale(.94);transition:.24s opacity,.28s transform}.cafasso-level-up.is-visible{opacity:1;transform:translate(-50%,-50%) scale(1)}.cafasso-level-up__icon{display:grid;place-items:center;width:72px;height:72px;margin:0 auto 14px;border:1px solid rgba(238,201,112,.58);border-radius:50%;background:radial-gradient(circle at 35% 30%,#e8ca80,#aa763b 72%);color:#4d2f19;font:700 30px/1 Georgia,serif}.cafasso-level-up small{display:block;color:#d8ba75;font:850 9px/1 Inter,system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase}.cafasso-level-up strong{display:block;margin-top:7px;color:#fff2cc;font:500 31px/1 Georgia,serif}.cafasso-level-up span{display:block;margin-top:10px;color:rgba(255,244,216,.75);font:13px/1.45 Inter,system-ui,sans-serif}
      @media(max-width:680px){.cafasso-level-pill{left:10px;top:65px}.cafasso-level-panel{margin-left:0;margin-right:0}.cafasso-level-panel h3{font-size:23px}}
    `;
    document.head.appendChild(style);
  }

  function announce(info) {
    document.querySelector('.cafasso-level-up')?.remove();
    const box = document.createElement('div');
    box.className = 'cafasso-level-up';
    box.innerHTML = `<div class="cafasso-level-up__icon">${info.level.icon}</div><small>Nueva etapa del camino</small><strong>${info.level.title}</strong><span>${info.level.copy}</span>`;
    document.body.appendChild(box);
    requestAnimationFrame(() => box.classList.add('is-visible'));
    setTimeout(() => box.classList.remove('is-visible'), 3300);
    setTimeout(() => box.remove(), 3650);
  }

  function render(total, { announceChange = true } = {}) {
    ensureStyles();
    const value = Math.max(0, Number(total || 0));
    const info = levelFor(value);
    let pill = document.querySelector('.cafasso-level-pill');
    if (!pill) { pill = document.createElement('div'); pill.className = 'cafasso-level-pill'; document.body.appendChild(pill); }
    pill.innerHTML = `<span class="cafasso-level-pill__icon">${info.level.icon}</span><span><small>Etapa del camino</small><strong>${info.level.title}</strong></span>`;

    const path = document.querySelector('.cafasso-profile-path');
    if (path) {
      let panel = document.querySelector('[data-cafasso-level-panel]');
      if (!panel) { panel = document.createElement('section'); panel.className = 'cafasso-level-panel'; panel.dataset.cafassoLevelPanel = '1'; path.insertAdjacentElement('afterend', panel); }
      const remaining = info.next ? Math.max(0, info.next.min - value) : 0;
      panel.innerHTML = `<div class="cafasso-level-panel__head"><div><div class="cafasso-level-panel__eyebrow">Tu etapa del camino</div><h3>${info.level.title}</h3><p>${info.level.copy}</p></div><div class="cafasso-level-panel__icon">${info.level.icon}</div></div><div class="cafasso-level-progress"><i style="width:${info.progress.toFixed(1)}%"></i></div><div class="cafasso-level-panel__foot"><span><b>${value}</b> Almitas</span><span>${info.next ? `Faltan <b>${remaining}</b> para ${info.next.title}` : '<b>Etapa más alta alcanzada</b>'}</span></div>`;
    }

    const previous = json(localStorage, stateKey()) || {};
    const prevIndex = Number.isFinite(Number(previous.index)) ? Number(previous.index) : null;
    try { localStorage.setItem(stateKey(), JSON.stringify({ index:info.index, id:info.level.id, total:value, updatedAt:new Date().toISOString() })); } catch (e) {}
    if (announceChange && prevIndex !== null && info.index > prevIndex) announce(info);

    window.CafassoLevel = { totalAlmitas:value, ...info, source:'canonical-almitas' };
    window.dispatchEvent(new CustomEvent('cafasso:level-update', { detail:window.CafassoLevel }));
  }

  function boot() {
    ensureStyles();
    const current = Number(window.CafassoAlmitasMetrics?.total);
    if (Number.isFinite(current)) render(current, { announceChange:false });
    window.addEventListener('cafasso:almitas-total', event => {
      const total = Number(event?.detail?.total);
      if (Number.isFinite(total)) render(total, { announceChange:true });
    });
    setTimeout(() => {
      const fallback = Number(window.CafassoAlmitasMetrics?.total);
      if (Number.isFinite(fallback)) render(fallback, { announceChange:false });
      else window.CafassoAlmitasCore?.refresh?.({ force:true });
    }, 500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();
