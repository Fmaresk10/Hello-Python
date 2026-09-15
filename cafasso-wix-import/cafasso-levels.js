(() => {
  if (window.__cafassoLevelsInstalled) return;
  window.__cafassoLevelsInstalled = true;

  const ME_API = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoMe';
  const RUAH_ID = '__cafasso_ruah__';
  const HUELLAS_REWARDS_ID = '__cafasso_huella_rewards__';
  const STYLE_ID = 'cafassoLevelsStyles';

  const LEVELS = [
    { id:'sonador', min:0, title:'Soñador', icon:'✧', copy:'Todo empieza con una intuición que invita a ponerse en camino.' },
    { id:'caminante', min:100, title:'Caminante', icon:'›', copy:'Ya no mirás desde afuera: empezaste a recorrer el camino.' },
    { id:'presencia', min:300, title:'Presencia', icon:'◉', copy:'Tu camino empieza a hacerse presencia cercana entre otros.' },
    { id:'acompanante', min:600, title:'Acompañante', icon:'◇', copy:'Aprender se convierte en estar cerca, escuchar y sostener.' },
    { id:'servidor', min:1000, title:'Servidor', icon:'✦', copy:'Lo recibido empieza a volverse entrega concreta.' },
    { id:'corazon-salesiano', min:1600, title:'Corazón salesiano', icon:'♡', copy:'Casa, patio, escuela y parroquia se vuelven una misma forma de estar.' }
  ];

  let loading = null;

  function json(storage, key) {
    try { return JSON.parse(storage.getItem(key) || 'null'); }
    catch (error) { return null; }
  }

  function user() { return json(localStorage, 'cafassoSession')?.user || {}; }
  function userKey() {
    const current = user();
    return String(current?._id || current?.id || current?.email || current?.name || 'local');
  }
  function stateKey() { return `cafasso-levels-v1:${userKey()}`; }

  function authHeaders() {
    const auth = json(localStorage, 'cafassoAuth');
    if (!auth?.sessionToken || Number(auth.expiresAt || 0) <= Date.now()) return null;
    return { Authorization: `Bearer ${auth.sessionToken}` };
  }

  function levelFor(total) {
    let level = LEVELS[0];
    LEVELS.forEach(item => { if (total >= item.min) level = item; });
    const index = LEVELS.findIndex(item => item.id === level.id);
    const next = LEVELS[index + 1] || null;
    const span = next ? Math.max(1, next.min - level.min) : 1;
    const progress = next ? Math.max(0, Math.min(100, ((total - level.min) / span) * 100)) : 100;
    return { level, next, index, progress };
  }

  function approvedAlmitas(data, uid) {
    return (Array.isArray(data?.progress) ? data.progress : [])
      .filter(row => !uid || !row?.userId || String(row.userId) === uid)
      .reduce((sum, row) => sum + Number(row?.almitasApproved || 0), 0);
  }

  function progressRow(data, uid, courseId) {
    return (Array.isArray(data?.progress) ? data.progress : []).find(row =>
      String(row?.courseId || '') === courseId && (!uid || !row?.userId || String(row.userId) === uid)
    ) || null;
  }

  function totalFromData(data, uid) {
    const approved = approvedAlmitas(data, uid);
    const ruah = Number(progressRow(data, uid, RUAH_ID)?.blockAnswers?.ruahState?.bonusAlmitas || 0);
    const huellas = Number(progressRow(data, uid, HUELLAS_REWARDS_ID)?.blockAnswers?.huellaRewardState?.bonusAlmitas || 0);
    return Math.max(0, approved + ruah + huellas);
  }

  function totalFromUi() {
    const node = document.querySelector('[data-global-almitas] .cafasso-global-counter__value') || document.querySelector('[data-profile-almitas-card] strong');
    const value = Number(String(node?.textContent || '').replace(/[^0-9.-]/g, ''));
    return Number.isFinite(value) ? Math.max(0, value) : 0;
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-level-pill{position:fixed;z-index:2147482999;left:18px;top:82px;display:flex;align-items:center;gap:8px;max-width:220px;padding:7px 11px;border:1px solid rgba(242,201,90,.32);border-radius:999px;background:rgba(8,37,40,.82);box-shadow:0 7px 18px rgba(0,0,0,.22);backdrop-filter:blur(9px);color:#fff8e9;font-family:Inter,system-ui,sans-serif;pointer-events:none}
      .cafasso-level-pill__icon{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;border:1px solid rgba(242,201,90,.34);background:rgba(242,201,90,.12);color:#f4d889;font:700 12px/1 Georgia,serif}
      .cafasso-level-pill small{display:block;color:#d7c99c;font:850 6.5px/1 Inter,system-ui,sans-serif;letter-spacing:.13em;text-transform:uppercase}
      .cafasso-level-pill strong{display:block;margin-top:2px;color:#fff9e8;font:800 11px/1.05 Inter,system-ui,sans-serif}
      .cafasso-level-panel{position:relative;margin:0 7px 16px;padding:15px 16px 14px;border:1px solid rgba(114,77,42,.22);background:linear-gradient(90deg,rgba(255,250,237,.28),rgba(246,230,196,.22));font-family:Georgia,serif;color:#4c3a2b}
      .cafasso-level-panel__head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}
      .cafasso-level-panel__eyebrow{color:#91704f;font:850 8px/1 Inter,system-ui,sans-serif;letter-spacing:.15em;text-transform:uppercase}
      .cafasso-level-panel h3{margin:5px 0 5px;color:#493629;font:500 26px/1 Georgia,serif}
      .cafasso-level-panel p{margin:0;max-width:520px;color:#78624e;font:12px/1.45 Inter,system-ui,sans-serif}
      .cafasso-level-panel__icon{display:grid;place-items:center;flex:0 0 46px;width:46px;height:46px;border:1px solid rgba(128,82,38,.42);border-radius:50%;background:radial-gradient(circle at 35% 30%,#e7c98f,#ad793f 72%);color:#57371d;font:700 21px/1 Georgia,serif;box-shadow:inset 0 0 0 3px rgba(255,239,199,.15),0 4px 9px rgba(78,45,21,.12)}
      .cafasso-level-progress{height:7px;margin-top:13px;border-radius:999px;background:rgba(117,85,51,.12);overflow:hidden;box-shadow:inset 0 1px 2px rgba(69,45,26,.11)}
      .cafasso-level-progress i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#b7894e,#ddbd78);width:0;transition:width .4s ease}
      .cafasso-level-panel__foot{display:flex;justify-content:space-between;gap:12px;margin-top:7px;color:#8a725b;font:750 9px/1.25 Inter,system-ui,sans-serif}
      .cafasso-level-panel__foot b{color:#6e5036;font-weight:850}
      .cafasso-level-up{position:fixed;z-index:2147483280;left:50%;top:50%;width:min(440px,88vw);padding:29px 29px 27px;border:1px solid rgba(235,194,101,.62);border-radius:8px;background:linear-gradient(145deg,rgba(52,43,30,.99),rgba(14,48,43,.99));box-shadow:0 30px 80px rgba(0,0,0,.52);color:#fff0c7;text-align:center;font-family:Georgia,serif;opacity:0;transform:translate(-50%,-46%) scale(.94);transition:opacity .24s ease,transform .28s ease}
      .cafasso-level-up.is-visible{opacity:1;transform:translate(-50%,-50%) scale(1)}
      .cafasso-level-up__icon{display:grid;place-items:center;width:72px;height:72px;margin:0 auto 14px;border:1px solid rgba(238,201,112,.58);border-radius:50%;background:radial-gradient(circle at 35% 30%,#e8ca80,#aa763b 72%);color:#4d2f19;font:700 30px/1 Georgia,serif;box-shadow:0 0 0 6px rgba(235,194,102,.06)}
      .cafasso-level-up small{display:block;color:#d8ba75;font:850 9px/1 Inter,system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase}
      .cafasso-level-up strong{display:block;margin-top:7px;color:#fff2cc;font:500 31px/1 Georgia,serif}
      .cafasso-level-up span{display:block;margin-top:10px;color:rgba(255,244,216,.75);font:13px/1.45 Inter,system-ui,sans-serif}
      @media(max-width:680px){.cafasso-level-pill{left:10px;top:65px;padding:6px 9px}.cafasso-level-panel{margin-left:0;margin-right:0}.cafasso-level-panel h3{font-size:23px}.cafasso-level-panel__icon{width:42px;height:42px;flex-basis:42px}}
      @media(prefers-reduced-motion:reduce){.cafasso-level-progress i,.cafasso-level-up{transition:none!important}}
    `;
    document.head.appendChild(style);
  }

  function render(total) {
    ensureStyles();
    const data = levelFor(total);

    let pill = document.querySelector('.cafasso-level-pill');
    if (!pill) {
      pill = document.createElement('div');
      pill.className = 'cafasso-level-pill';
      pill.setAttribute('aria-label', 'Etapa del camino CAFASSO');
      document.body.appendChild(pill);
    }
    pill.innerHTML = `<span class="cafasso-level-pill__icon">${data.level.icon}</span><span><small>Etapa del camino</small><strong>${data.level.title}</strong></span>`;

    const path = document.querySelector('.cafasso-profile-path');
    if (path) {
      let panel = document.querySelector('[data-cafasso-level-panel]');
      if (!panel) {
        panel = document.createElement('section');
        panel.className = 'cafasso-level-panel';
        panel.dataset.cafassoLevelPanel = '1';
        path.insertAdjacentElement('afterend', panel);
      }
      const remaining = data.next ? Math.max(0, data.next.min - total) : 0;
      panel.innerHTML = `
        <div class="cafasso-level-panel__head"><div><div class="cafasso-level-panel__eyebrow">Tu etapa del camino</div><h3>${data.level.title}</h3><p>${data.level.copy}</p></div><div class="cafasso-level-panel__icon">${data.level.icon}</div></div>
        <div class="cafasso-level-progress" aria-label="Progreso hacia la próxima etapa"><i style="width:${data.progress.toFixed(1)}%"></i></div>
        <div class="cafasso-level-panel__foot"><span><b>${total}</b> Almitas</span><span>${data.next ? `Faltan <b>${remaining}</b> para ${data.next.title}` : '<b>Etapa más alta alcanzada</b>'}</span></div>`;
    }

    window.CafassoLevel = { totalAlmitas: total, ...data };
    window.dispatchEvent(new CustomEvent('cafasso:level-update', { detail: window.CafassoLevel }));
    return data;
  }

  function maybeAnnounce(total, announce = true) {
    const data = render(total);
    const previous = json(localStorage, stateKey()) || {};
    const previousIndex = Number.isFinite(Number(previous.index)) ? Number(previous.index) : null;
    const firstSeen = previousIndex === null;
    try { localStorage.setItem(stateKey(), JSON.stringify({ index:data.index, id:data.level.id, total, updatedAt:new Date().toISOString() })); } catch (error) {}
    if (!announce || firstSeen || data.index <= previousIndex) return;

    document.querySelector('.cafasso-level-up')?.remove();
    const box = document.createElement('div');
    box.className = 'cafasso-level-up';
    box.setAttribute('role', 'status');
    box.setAttribute('aria-live', 'polite');
    box.innerHTML = `<div class="cafasso-level-up__icon">${data.level.icon}</div><small>Nueva etapa del camino</small><strong>${data.level.title}</strong><span>${data.level.copy}</span>`;
    document.body.appendChild(box);
    requestAnimationFrame(() => box.classList.add('is-visible'));
    setTimeout(() => box.classList.remove('is-visible'), 3300);
    setTimeout(() => box.remove(), 3650);
  }

  async function refresh({ announce = true } = {}) {
    if (loading) return loading;
    loading = (async () => {
      const headers = authHeaders();
      const current = user();
      const uid = String(current?._id || current?.id || '');
      if (!headers) {
        maybeAnnounce(totalFromUi(), announce);
        return;
      }
      try {
        const response = await fetch(ME_API, { headers, cache:'no-store' });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data?.ok === false) throw new Error('levels');
        maybeAnnounce(totalFromData(data, uid), announce);
      } catch (error) {
        maybeAnnounce(totalFromUi(), announce);
      }
    })().finally(() => { loading = null; });
    return loading;
  }

  function boot() {
    ensureStyles();
    setTimeout(() => refresh({ announce:false }), 500);
    window.addEventListener('cafasso:profile-metrics', () => setTimeout(() => refresh({ announce:true }), 100));
    window.addEventListener('cafasso:huella-rewards', () => setTimeout(() => refresh({ announce:true }), 120));
    window.addEventListener('cafasso:progress-update', () => setTimeout(() => refresh({ announce:true }), 120));
    window.addEventListener('focus', () => refresh({ announce:true }));
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refresh({ announce:true }); });
    setInterval(() => refresh({ announce:true }), 90000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();
