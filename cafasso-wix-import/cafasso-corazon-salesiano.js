(() => {
  const params = new URLSearchParams(location.search);
  const space = params.get('space') || 'house';
  const SPACES = ['house', 'patio', 'escuela', 'parroquia'];
  if (!SPACES.includes(space)) return;
  if (window.__cafassoCorazonSalesianoInstalled) return;
  window.__cafassoCorazonSalesianoInstalled = true;

  const MIN_ALMITAS = 1600;
  const STYLE_ID = 'cafassoCorazonSalesianoStyles';
  const UNLOCK_ID = 'corazon-salesiano-world';
  let unlocked = false;

  function json(storage, key) {
    try { return JSON.parse(storage.getItem(key) || 'null'); }
    catch (error) { return null; }
  }

  function user() { return json(localStorage, 'cafassoSession')?.user || {}; }
  function userKey() {
    const current = user();
    return String(current?._id || current?.id || current?.email || current?.name || 'local');
  }
  function seenKey() { return `cafasso-world-unlocks-v1:${userKey()}`; }
  function readSeen() { return json(localStorage, seenKey()) || {}; }
  function markSeen() {
    const state = readSeen();
    state[UNLOCK_ID] = new Date().toISOString();
    try { localStorage.setItem(seenKey(), JSON.stringify(state)); } catch (error) {}
  }

  function root() {
    return document.querySelector(`.cafasso-${space}`);
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-corazon-ambient{position:absolute;inset:0;z-index:2;pointer-events:none;background:radial-gradient(circle at 50% 44%,rgba(255,215,145,.11),transparent 43%),linear-gradient(180deg,rgba(255,224,168,.025),rgba(255,190,102,.04));mix-blend-mode:screen;opacity:.78;animation:cafassoCorazonAmbient 8s ease-in-out infinite alternate}
      @keyframes cafassoCorazonAmbient{from{opacity:.55}to{opacity:.92}}
      .cafasso-corazon-huella{position:absolute;z-index:8;width:38px;height:38px;padding:0;border:0;background:transparent;color:rgba(246,216,154,.8);font:500 29px/1 Georgia,serif;cursor:pointer;text-shadow:0 2px 3px rgba(0,0,0,.56),0 0 8px rgba(246,190,88,.2);opacity:.78;transform:rotate(-6deg);transition:opacity .2s ease,transform .2s ease,text-shadow .2s ease}
      .cafasso-corazon-huella:hover,.cafasso-corazon-huella:focus-visible{opacity:1;transform:rotate(-2deg) translateY(-2px) scale(1.05);text-shadow:0 2px 3px rgba(0,0,0,.5),0 0 12px rgba(246,190,88,.42);outline:none}
      .cafasso-house .cafasso-corazon-huella{left:70.2%;bottom:10.2%}
      .cafasso-patio .cafasso-corazon-huella{left:18.5%;bottom:11.6%}
      .cafasso-escuela .cafasso-corazon-huella{left:71.8%;top:16.4%}
      .cafasso-parroquia .cafasso-corazon-huella{left:66.2%;bottom:18.8%}
      .cafasso-corazon-huella.is-arriving{animation:cafassoCorazonHuellaArrive 1.35s ease both}
      @keyframes cafassoCorazonHuellaArrive{0%{opacity:0;transform:rotate(-10deg) scale(.55)}55%{opacity:1;transform:rotate(-4deg) scale(1.12)}100%{opacity:.78;transform:rotate(-6deg) scale(1)}}

      .cafasso-corazon-toast{position:fixed;z-index:2147483290;left:50%;bottom:28px;max-width:min(600px,90vw);padding:12px 18px;border:1px solid rgba(232,195,114,.52);border-radius:999px;background:rgba(8,38,36,.97);box-shadow:0 14px 30px rgba(0,0,0,.35);color:#fff1ce;text-align:center;font:800 10px/1.3 Inter,system-ui,sans-serif;letter-spacing:.035em;opacity:0;transform:translate(-50%,16px);transition:.22s opacity,.22s transform;pointer-events:none}
      .cafasso-corazon-toast.show{opacity:1;transform:translate(-50%,0)}

      .cafasso-corazon-layer{position:fixed;inset:0;z-index:2147483295;display:grid;place-items:center;padding:24px;background:rgba(5,19,18,.7);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:0;transition:opacity .22s ease}
      .cafasso-corazon-layer.is-visible{opacity:1}
      .cafasso-corazon-note{position:relative;width:min(625px,92vw);padding:48px 50px 39px;border:1px solid rgba(218,179,96,.45);border-radius:6px;background:repeating-linear-gradient(0deg,rgba(105,74,41,.025) 0 1px,transparent 1px 9px),linear-gradient(145deg,#f5ead0,#e4cfaa);box-shadow:0 34px 82px rgba(0,0,0,.56),inset 0 0 0 4px rgba(255,249,229,.25);color:#443326;font-family:Georgia,serif;transform:translateY(9px) scale(.985);transition:transform .24s ease}
      .cafasso-corazon-layer.is-visible .cafasso-corazon-note{transform:translateY(0) scale(1)}
      .cafasso-corazon-close{position:absolute;right:12px;top:10px;width:34px;height:34px;border:0;border-radius:50%;background:rgba(91,62,36,.07);color:#5a4532;font:26px/1 Georgia,serif;cursor:pointer}
      .cafasso-corazon-seal{display:grid;place-items:center;width:54px;height:54px;margin-bottom:15px;border:1px solid rgba(143,98,46,.32);border-radius:50%;background:radial-gradient(circle at 35% 30%,#ead29a,#bc8a4e 74%);color:#5f3a20;font:500 26px/1 Georgia,serif;box-shadow:inset 0 0 0 3px rgba(255,239,199,.15)}
      .cafasso-corazon-kicker{color:#98744e;font:850 9px/1.2 Inter,system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase}
      .cafasso-corazon-note h2{margin:9px 0 16px;color:#453226;font:500 clamp(34px,5vw,48px)/1 Georgia,serif}
      .cafasso-corazon-note p{margin:0;color:#705a45;font:17px/1.6 Georgia,serif}
      .cafasso-corazon-note p+p{margin-top:13px}
      .cafasso-corazon-sign{margin-top:24px;padding-top:14px;border-top:1px solid rgba(111,78,43,.16);color:#8f6b45;font:italic 14px/1.4 Georgia,serif}

      @media(max-width:760px){
        .cafasso-corazon-huella{width:32px;height:32px;font-size:24px}
        .cafasso-house .cafasso-corazon-huella{left:72%;bottom:11%}.cafasso-patio .cafasso-corazon-huella{left:15%;bottom:12%}.cafasso-escuela .cafasso-corazon-huella{left:72%;top:17%}.cafasso-parroquia .cafasso-corazon-huella{left:68%;bottom:19%}
        .cafasso-corazon-note{padding:42px 26px 31px}.cafasso-corazon-note p{font-size:15px}.cafasso-corazon-toast{bottom:18px}
      }
      @media(prefers-reduced-motion:reduce){.cafasso-corazon-ambient,.cafasso-corazon-huella,.cafasso-corazon-toast,.cafasso-corazon-layer,.cafasso-corazon-note{animation:none!important;transition:none!important}}
    `;
    document.head.appendChild(style);
  }

  function showToast() {
    document.querySelector('.cafasso-corazon-toast')?.remove();
    const toast = document.createElement('div');
    toast.className = 'cafasso-corazon-toast';
    toast.textContent = 'El mundo cambió · Casa, Patio, Escuela y Parroquia comparten ahora una misma huella';
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => toast.classList.remove('show'), 3500);
    setTimeout(() => toast.remove(), 3850);
  }

  function openNote() {
    document.querySelector('.cafasso-corazon-layer')?.remove();
    const layer = document.createElement('div');
    layer.className = 'cafasso-corazon-layer';
    layer.innerHTML = `
      <article class="cafasso-corazon-note" role="dialog" aria-modal="true" aria-labelledby="cafasso-corazon-title">
        <button class="cafasso-corazon-close" type="button" aria-label="Cerrar">×</button>
        <div class="cafasso-corazon-seal">♡</div>
        <div class="cafasso-corazon-kicker">Etapa Corazón salesiano</div>
        <h2 id="cafasso-corazon-title">Una sola forma de estar</h2>
        <p>Casa para recibir. Patio para encontrarse. Escuela para crecer. Parroquia para hacer lugar a Dios y a los demás.</p>
        <p>Cuando esas cuatro cosas empiezan a mezclarse, dejan de ser cuatro espacios. Se vuelven una manera salesiana de estar en el mundo.</p>
        <div class="cafasso-corazon-sign">El camino no termina acá. Desde acá se vuelve cotidiano.</div>
      </article>`;
    document.body.appendChild(layer);
    const close = () => {
      layer.classList.remove('is-visible');
      setTimeout(() => layer.remove(), 240);
    };
    layer.querySelector('.cafasso-corazon-close')?.addEventListener('click', close);
    layer.addEventListener('click', event => { if (event.target === layer) close(); });
    const onKey = event => {
      if (event.key !== 'Escape') return;
      document.removeEventListener('keydown', onKey);
      close();
    };
    document.addEventListener('keydown', onKey);
    requestAnimationFrame(() => layer.classList.add('is-visible'));
  }

  function mount(announce = false) {
    const target = root();
    if (!target) return false;
    ensureStyles();
    let ambient = target.querySelector('.cafasso-corazon-ambient');
    if (!ambient) {
      ambient = document.createElement('span');
      ambient.className = 'cafasso-corazon-ambient';
      ambient.setAttribute('aria-hidden', 'true');
      target.appendChild(ambient);
    }
    let mark = target.querySelector(`[data-world-unlock="${UNLOCK_ID}"]`);
    if (!mark) {
      mark = document.createElement('button');
      mark.type = 'button';
      mark.className = 'cafasso-corazon-huella';
      mark.dataset.worldUnlock = UNLOCK_ID;
      mark.setAttribute('aria-label', 'Huella de la etapa Corazón salesiano');
      mark.textContent = '♡';
      target.appendChild(mark);
      mark.addEventListener('click', openNote);
    }
    const seen = readSeen();
    if (announce && !seen[UNLOCK_ID]) {
      mark.classList.add('is-arriving');
      showToast();
      markSeen();
      setTimeout(() => mark.classList.remove('is-arriving'), 1450);
    }
    return true;
  }

  function apply(total, announce = false) {
    const value = Math.max(0, Number(total || 0));
    if (!Number.isFinite(value) || value < MIN_ALMITAS) return;
    const first = !unlocked;
    unlocked = true;
    mount(announce && first);
  }

  function currentTotal() {
    const canonical = Number(window.CafassoAlmitasMetrics?.total);
    if (Number.isFinite(canonical)) return canonical;
    const level = Number(window.CafassoLevel?.totalAlmitas);
    if (Number.isFinite(level)) return level;
    const node = document.querySelector('[data-global-almitas] .cafasso-global-counter__value');
    const ui = Number(String(node?.textContent || '').replace(/[^0-9.-]/g, ''));
    return Number.isFinite(ui) ? ui : 0;
  }

  function boot() {
    ensureStyles();
    [260, 720, 1450].forEach(delay => setTimeout(() => apply(currentTotal(), false), delay));
    window.addEventListener('cafasso:almitas-total', event => apply(event?.detail?.total, true));
    window.addEventListener('cafasso:level-update', event => apply(event?.detail?.totalAlmitas, true));
    window.addEventListener('focus', () => apply(currentTotal(), false));
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') apply(currentTotal(), false);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
