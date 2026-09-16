(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('space') !== 'parroquia') return;
  if (window.__cafassoServidorParroquiaInstalled) return;
  window.__cafassoServidorParroquiaInstalled = true;

  const MIN_ALMITAS = 1000;
  const STYLE_ID = 'cafassoServidorParroquiaStyles';
  const UNLOCK_ID = 'servidor-altar-cloth';
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

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-servidor-cloth{
        position:absolute;z-index:7;left:48.2%;bottom:30.1%;width:112px;height:49px;padding:0;border:0;background:transparent;
        cursor:pointer;transform:translateX(-50%) rotate(-1.8deg);filter:drop-shadow(0 8px 5px rgba(0,0,0,.30));
        transition:transform .2s ease,filter .2s ease;
      }
      .cafasso-servidor-cloth:hover,.cafasso-servidor-cloth:focus-visible{
        transform:translateX(-50%) translateY(-2px) rotate(-1deg) scale(1.015);filter:drop-shadow(0 10px 7px rgba(0,0,0,.33)) brightness(1.025);outline:none;
      }
      .cafasso-servidor-cloth__fold{
        position:absolute;left:7px;right:7px;top:6px;height:34px;border:1px solid rgba(121,104,81,.30);border-radius:7px 8px 5px 6px;
        background:
          linear-gradient(176deg,rgba(255,255,255,.34),transparent 22%),
          linear-gradient(90deg,#d8d1c4 0%,#f1ece2 22%,#ded6c8 52%,#f5f1e9 74%,#cbc2b4 100%);
        box-shadow:inset 0 1px rgba(255,255,255,.62),inset 0 -5px 8px rgba(105,88,68,.08),0 2px 3px rgba(45,31,20,.13);
      }
      .cafasso-servidor-cloth__fold:before{
        content:"";position:absolute;left:12px;right:14px;top:11px;height:1px;background:rgba(112,96,75,.14);box-shadow:0 7px rgba(255,255,255,.35);
      }
      .cafasso-servidor-cloth__fold:after{
        content:"";position:absolute;right:-5px;bottom:-7px;width:38px;height:13px;border-radius:2px 2px 7px 7px;
        background:linear-gradient(100deg,#d0c8ba,#eee9df 48%,#c9c0b1);transform:rotate(4deg);transform-origin:left top;
        box-shadow:0 3px 3px rgba(42,29,19,.15),inset 0 1px rgba(255,255,255,.38);
      }
      .cafasso-servidor-cloth.is-arriving{animation:cafassoServidorClothArrive 1.05s cubic-bezier(.2,.8,.2,1) both}
      @keyframes cafassoServidorClothArrive{
        0%{opacity:0;transform:translateX(-50%) translateY(-18px) rotate(-5deg) scale(.9)}
        72%{opacity:1;transform:translateX(-50%) translateY(2px) rotate(-1deg) scale(1.02)}
        100%{opacity:1;transform:translateX(-50%) translateY(0) rotate(-1.8deg) scale(1)}
      }

      .cafasso-servidor-toast{
        position:fixed;z-index:2147483275;left:50%;bottom:28px;max-width:min(540px,88vw);padding:12px 17px;
        border:1px solid rgba(232,195,114,.48);border-radius:999px;background:rgba(8,38,36,.96);box-shadow:0 14px 30px rgba(0,0,0,.35);
        color:#fff1ce;text-align:center;font:800 10px/1.3 Inter,system-ui,sans-serif;letter-spacing:.035em;opacity:0;
        transform:translate(-50%,16px);transition:.22s opacity,.22s transform;pointer-events:none;
      }
      .cafasso-servidor-toast.show{opacity:1;transform:translate(-50%,0)}

      .cafasso-servidor-layer{
        position:fixed;inset:0;z-index:2147483280;display:grid;place-items:center;padding:24px;background:rgba(5,19,18,.67);
        backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);opacity:0;transition:opacity .22s ease;
      }
      .cafasso-servidor-layer.is-visible{opacity:1}
      .cafasso-servidor-note{
        position:relative;width:min(590px,91vw);padding:45px 48px 36px;border:1px solid rgba(109,77,42,.38);border-radius:5px;
        background:repeating-linear-gradient(0deg,rgba(105,74,41,.025) 0 1px,transparent 1px 9px),linear-gradient(145deg,#f5ead0,#e4cfaa);
        box-shadow:0 31px 76px rgba(0,0,0,.53),inset 0 0 0 4px rgba(255,249,229,.25);color:#443326;font-family:Georgia,serif;
        transform:translateY(9px) rotate(.18deg) scale(.985);transition:transform .24s ease;
      }
      .cafasso-servidor-layer.is-visible .cafasso-servidor-note{transform:translateY(0) rotate(.18deg) scale(1)}
      .cafasso-servidor-close{position:absolute;right:12px;top:10px;width:34px;height:34px;border:0;border-radius:50%;background:rgba(91,62,36,.07);color:#5a4532;font:26px/1 Georgia,serif;cursor:pointer}
      .cafasso-servidor-kicker{color:#98744e;font:850 9px/1.2 Inter,system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase}
      .cafasso-servidor-note h2{margin:9px 0 15px;color:#453226;font:500 clamp(34px,5vw,46px)/1 Georgia,serif}
      .cafasso-servidor-note p{margin:0;color:#705a45;font:17px/1.58 Georgia,serif}
      .cafasso-servidor-note p+p{margin-top:13px}
      .cafasso-servidor-sign{margin-top:23px;padding-top:13px;border-top:1px solid rgba(111,78,43,.16);color:#8f6b45;font:italic 14px/1.4 Georgia,serif}

      @media(max-width:760px){
        .cafasso-servidor-cloth{left:50.2%;bottom:26.4%;width:82px;height:38px}
        .cafasso-servidor-cloth__fold{left:5px;right:5px;top:5px;height:26px}
        .cafasso-servidor-cloth__fold:after{right:-4px;bottom:-5px;width:29px;height:10px}
        .cafasso-servidor-note{padding:41px 25px 29px}.cafasso-servidor-note p{font-size:15px}.cafasso-servidor-toast{bottom:18px}
      }
      @media(prefers-reduced-motion:reduce){
        .cafasso-servidor-cloth,.cafasso-servidor-toast,.cafasso-servidor-layer,.cafasso-servidor-note{transition:none!important}
        .cafasso-servidor-cloth.is-arriving{animation:none!important}
      }
    `;
    document.head.appendChild(style);
  }

  function showToast() {
    document.querySelector('.cafasso-servidor-toast')?.remove();
    const toast = document.createElement('div');
    toast.className = 'cafasso-servidor-toast';
    toast.textContent = 'La Parroquia cambió · algo quedó listo para servir';
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => toast.classList.remove('show'), 3200);
    setTimeout(() => toast.remove(), 3550);
  }

  function openNote() {
    document.querySelector('.cafasso-servidor-layer')?.remove();
    const layer = document.createElement('div');
    layer.className = 'cafasso-servidor-layer';
    layer.innerHTML = `
      <article class="cafasso-servidor-note" role="dialog" aria-modal="true" aria-labelledby="cafasso-servidor-title">
        <button class="cafasso-servidor-close" type="button" aria-label="Cerrar">×</button>
        <div class="cafasso-servidor-kicker">La Parroquia cambió · Etapa Servidor</div>
        <h2 id="cafasso-servidor-title">Arremangarse</h2>
        <p>Servir no es ocupar el centro. Es darse cuenta de lo que hace falta y ponerse a disposición.</p>
        <p>A veces empieza con algo simple: preparar, ordenar, escuchar, llegar antes, quedarse después. Hacer lugar para que otro pueda estar mejor.</p>
        <div class="cafasso-servidor-sign">Esta señal apareció porque alcanzaste la etapa Servidor.</div>
      </article>`;
    document.body.appendChild(layer);
    const close = () => {
      layer.classList.remove('is-visible');
      setTimeout(() => layer.remove(), 240);
    };
    layer.querySelector('.cafasso-servidor-close')?.addEventListener('click', close);
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
    const parish = document.querySelector('.cafasso-parroquia');
    if (!parish) return false;
    ensureStyles();
    let cloth = parish.querySelector(`[data-world-unlock="${UNLOCK_ID}"]`);
    if (!cloth) {
      cloth = document.createElement('button');
      cloth.type = 'button';
      cloth.className = 'cafasso-servidor-cloth';
      cloth.dataset.worldUnlock = UNLOCK_ID;
      cloth.setAttribute('aria-label', 'Toalla de servicio desbloqueada en la etapa Servidor');
      cloth.innerHTML = '<span class="cafasso-servidor-cloth__fold"></span>';
      parish.appendChild(cloth);
      cloth.addEventListener('click', openNote);
    }
    const seen = readSeen();
    if (announce && !seen[UNLOCK_ID]) {
      cloth.classList.add('is-arriving');
      showToast();
      markSeen();
      setTimeout(() => cloth.classList.remove('is-arriving'), 1150);
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
    [280, 760, 1500].forEach(delay => setTimeout(() => apply(currentTotal(), false), delay));
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
