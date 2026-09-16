(() => {
  const params = new URLSearchParams(location.search);
  if ((params.get('space') || 'house') !== 'house') return;
  if (window.__cafassoWorldUnlocksInstalled) return;
  window.__cafassoWorldUnlocksInstalled = true;

  const STYLE_ID = 'cafassoWorldUnlocksStyles';
  const CAMINANTE_MIN = 100;

  function json(storage, key) {
    try { return JSON.parse(storage.getItem(key) || 'null'); }
    catch (error) { return null; }
  }

  function sessionUser() {
    return json(localStorage, 'cafassoSession')?.user || {};
  }

  function userKey() {
    const user = sessionUser();
    return String(user?._id || user?.id || user?.email || user?.name || 'local');
  }

  function seenKey() {
    return `cafasso-world-unlocks-v1:${userKey()}`;
  }

  function readSeen() {
    return json(localStorage, seenKey()) || {};
  }

  function markSeen(id) {
    const state = readSeen();
    state[id] = new Date().toISOString();
    try { localStorage.setItem(seenKey(), JSON.stringify(state)); }
    catch (error) {}
  }

  function totalFromUi() {
    const node = document.querySelector('[data-global-almitas] .cafasso-global-counter__value') ||
      document.querySelector('[data-profile-almitas-card] strong');
    const value = Number(String(node?.textContent || '').replace(/[^0-9.-]/g, ''));
    return Number.isFinite(value) ? Math.max(0, value) : 0;
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-world-compass{
        position:absolute;z-index:6;left:61.7%;bottom:13.2%;width:84px;height:84px;padding:0;border:0;background:transparent;
        cursor:pointer;filter:drop-shadow(0 10px 8px rgba(0,0,0,.42));transform:rotate(8deg) scale(.94);
        transition:transform .2s ease,filter .2s ease;touch-action:manipulation;
      }
      .cafasso-world-compass:hover,.cafasso-world-compass:focus-visible{
        transform:rotate(5deg) translateY(-4px) scale(1);filter:drop-shadow(0 14px 10px rgba(0,0,0,.47)) brightness(1.05);
        outline:none;
      }
      .cafasso-world-compass__case{
        position:absolute;inset:4px;border-radius:50%;
        background:
          radial-gradient(circle at 35% 27%,rgba(255,245,202,.42),transparent 18%),
          radial-gradient(circle at 50% 50%,#b8873e 0 7%,#d2aa61 8% 13%,#72502b 14% 17%,#c89c50 18% 70%,#77502a 71% 78%,#d1aa61 79% 86%,#6e4825 87% 100%);
        box-shadow:inset 0 0 0 2px rgba(255,236,175,.16),inset 0 0 14px rgba(59,34,16,.45),0 2px 3px rgba(0,0,0,.32);
      }
      .cafasso-world-compass__face{
        position:absolute;inset:16px;border-radius:50%;border:1px solid rgba(93,62,31,.52);
        background:
          repeating-conic-gradient(from -1deg,rgba(86,59,31,.46) 0 1deg,transparent 1deg 15deg),
          radial-gradient(circle,#eee1bf 0 62%,#cdbb91 63% 100%);
        box-shadow:inset 0 0 11px rgba(78,55,32,.22),0 0 0 2px rgba(255,246,216,.15);
      }
      .cafasso-world-compass__face:before{
        content:"N";position:absolute;left:50%;top:3px;transform:translateX(-50%);color:#5d432b;font:800 7px/1 Georgia,serif;
      }
      .cafasso-world-compass__needle{
        position:absolute;left:50%;top:50%;width:4px;height:40px;transform:translate(-50%,-50%) rotate(24deg);transform-origin:50% 50%;
      }
      .cafasso-world-compass__needle:before,.cafasso-world-compass__needle:after{
        content:"";position:absolute;left:0;width:4px;height:20px;clip-path:polygon(50% 0,100% 100%,0 100%);
      }
      .cafasso-world-compass__needle:before{top:0;background:#8b342e}
      .cafasso-world-compass__needle:after{bottom:0;background:#4b4b42;transform:rotate(180deg)}
      .cafasso-world-compass__pin{
        position:absolute;left:50%;top:50%;width:8px;height:8px;border-radius:50%;transform:translate(-50%,-50%);
        background:#b48645;border:1px solid rgba(74,47,25,.72);box-shadow:inset 0 1px rgba(255,241,197,.38);
      }
      .cafasso-world-compass.is-arriving{animation:cafassoCompassArrive 1.35s cubic-bezier(.2,.8,.2,1) both}
      @keyframes cafassoCompassArrive{
        0%{opacity:0;transform:rotate(18deg) translateY(22px) scale(.58);filter:drop-shadow(0 0 0 rgba(0,0,0,0))}
        62%{opacity:1;transform:rotate(6deg) translateY(-4px) scale(1.04);filter:drop-shadow(0 0 16px rgba(235,196,105,.42))}
        100%{opacity:1;transform:rotate(8deg) translateY(0) scale(.94);filter:drop-shadow(0 10px 8px rgba(0,0,0,.42))}
      }

      .cafasso-world-unlock-toast{
        position:fixed;z-index:2147483230;left:50%;bottom:28px;transform:translate(-50%,18px);padding:11px 16px;
        border:1px solid rgba(238,198,105,.46);border-radius:999px;background:rgba(9,39,38,.95);box-shadow:0 12px 28px rgba(0,0,0,.34);
        color:#fff3cf;font:800 10px/1.25 Inter,system-ui,sans-serif;letter-spacing:.04em;opacity:0;transition:opacity .24s ease,transform .24s ease;
        pointer-events:none;
      }
      .cafasso-world-unlock-toast.show{opacity:1;transform:translate(-50%,0)}

      .cafasso-world-object-layer{
        position:fixed;inset:0;z-index:2147483240;display:grid;place-items:center;padding:24px;background:rgba(6,19,19,.65);
        backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);opacity:0;transition:opacity .22s ease;
      }
      .cafasso-world-object-layer.is-visible{opacity:1}
      .cafasso-world-object-note{
        position:relative;width:min(570px,91vw);padding:45px 46px 36px;border:1px solid rgba(119,83,43,.38);border-radius:5px;
        background:repeating-linear-gradient(0deg,rgba(107,76,43,.027) 0 1px,transparent 1px 9px),linear-gradient(145deg,#f7ecd3,#e6d1aa);
        box-shadow:0 31px 76px rgba(0,0,0,.52),inset 0 0 0 4px rgba(255,249,229,.26);color:#443326;font-family:Georgia,serif;
        transform:translateY(9px) rotate(-.4deg) scale(.985);transition:transform .24s ease;
      }
      .cafasso-world-object-layer.is-visible .cafasso-world-object-note{transform:translateY(0) rotate(-.4deg) scale(1)}
      .cafasso-world-object-note:before{
        content:"";position:absolute;right:35px;top:25px;width:38px;height:38px;border:1px solid rgba(143,100,48,.26);border-radius:50%;
        box-shadow:inset 0 0 0 4px rgba(173,124,61,.07);
      }
      .cafasso-world-object-close{
        position:absolute;right:12px;top:10px;width:34px;height:34px;border:0;border-radius:50%;background:rgba(91,62,36,.07);color:#5a4532;font:26px/1 Georgia,serif;cursor:pointer;
      }
      .cafasso-world-object-kicker{color:#98744e;font:850 9px/1.2 Inter,system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase}
      .cafasso-world-object-note h2{margin:9px 0 15px;color:#453226;font:500 clamp(34px,5vw,46px)/1 Georgia,serif}
      .cafasso-world-object-note p{margin:0;color:#705a45;font:17px/1.58 Georgia,serif}
      .cafasso-world-object-note p+p{margin-top:13px}
      .cafasso-world-object-sign{margin-top:23px;padding-top:13px;border-top:1px solid rgba(111,78,43,.16);color:#8f6b45;font:italic 14px/1.4 Georgia,serif}

      @media(max-width:680px){
        .cafasso-world-compass{left:66%;bottom:14.5%;width:67px;height:67px}
        .cafasso-world-compass__face{inset:13px}.cafasso-world-compass__needle{height:32px}
        .cafasso-world-compass__needle:before,.cafasso-world-compass__needle:after{height:16px}
        .cafasso-world-object-note{padding:41px 25px 29px}.cafasso-world-object-note p{font-size:15px}
        .cafasso-world-unlock-toast{bottom:18px;max-width:90vw;text-align:center}
      }
      @media(prefers-reduced-motion:reduce){
        .cafasso-world-compass,.cafasso-world-unlock-toast,.cafasso-world-object-layer,.cafasso-world-object-note{transition:none!important}
        .cafasso-world-compass.is-arriving{animation:none!important}
      }
    `;
    document.head.appendChild(style);
  }

  function showToast(text) {
    document.querySelector('.cafasso-world-unlock-toast')?.remove();
    const toast = document.createElement('div');
    toast.className = 'cafasso-world-unlock-toast';
    toast.textContent = text;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => toast.classList.remove('show'), 3000);
    setTimeout(() => toast.remove(), 3350);
  }

  function openCompassNote() {
    document.querySelector('.cafasso-world-object-layer')?.remove();
    const layer = document.createElement('div');
    layer.className = 'cafasso-world-object-layer';
    layer.innerHTML = `
      <article class="cafasso-world-object-note" role="dialog" aria-modal="true" aria-labelledby="cafasso-world-compass-title">
        <button class="cafasso-world-object-close" type="button" aria-label="Cerrar">×</button>
        <div class="cafasso-world-object-kicker">La Casa cambió · Etapa Caminante</div>
        <h2 id="cafasso-world-compass-title">Ya estás en camino</h2>
        <p>Una brújula no te dice cuánto falta. Te recuerda hacia dónde querés caminar.</p>
        <p>En CAFASSO, crecer no es juntar puntos: es aprender a mirar, estar cerca y elegir con sentido.</p>
        <div class="cafasso-world-object-sign">Este objeto apareció porque alcanzaste la etapa Caminante.</div>
      </article>`;
    document.body.appendChild(layer);

    const close = () => {
      layer.classList.remove('is-visible');
      setTimeout(() => layer.remove(), 240);
    };
    layer.querySelector('.cafasso-world-object-close')?.addEventListener('click', close);
    layer.addEventListener('click', event => { if (event.target === layer) close(); });
    const onKey = event => {
      if (event.key !== 'Escape') return;
      document.removeEventListener('keydown', onKey);
      close();
    };
    document.addEventListener('keydown', onKey);
    requestAnimationFrame(() => layer.classList.add('is-visible'));
  }

  function mountCaminante(total) {
    const house = document.querySelector('.cafasso-house');
    if (!house || total < CAMINANTE_MIN) return false;
    ensureStyles();

    let compass = house.querySelector('[data-world-unlock="caminante-compass"]');
    if (!compass) {
      compass = document.createElement('button');
      compass.type = 'button';
      compass.className = 'cafasso-world-compass';
      compass.dataset.worldUnlock = 'caminante-compass';
      compass.setAttribute('aria-label', 'Brújula desbloqueada en la etapa Caminante');
      compass.innerHTML = `
        <span class="cafasso-world-compass__case"></span>
        <span class="cafasso-world-compass__face"></span>
        <span class="cafasso-world-compass__needle"></span>
        <span class="cafasso-world-compass__pin"></span>`;
      house.appendChild(compass);
      compass.addEventListener('click', openCompassNote);

      const seen = readSeen();
      if (!seen['caminante-compass']) {
        compass.classList.add('is-arriving');
        showToast('La Casa cambió · apareció algo nuevo en tu camino');
        markSeen('caminante-compass');
        setTimeout(() => compass.classList.remove('is-arriving'), 1500);
      }
    }
    return true;
  }

  function apply(total) {
    mountCaminante(Math.max(0, Number(total || 0)));
  }

  function boot() {
    ensureStyles();
    let tries = 0;
    const wait = () => {
      const house = document.querySelector('.cafasso-house');
      if (!house && tries++ < 35) return setTimeout(wait, 80);
      const initial = Number(window.CafassoLevel?.totalAlmitas);
      apply(Number.isFinite(initial) ? initial : totalFromUi());
    };
    wait();

    window.addEventListener('cafasso:level-update', event => {
      const total = Number(event?.detail?.totalAlmitas);
      if (Number.isFinite(total)) apply(total);
    });
    window.addEventListener('cafasso:profile-metrics', () => setTimeout(() => apply(totalFromUi()), 120));
    window.addEventListener('cafasso:huella-rewards', () => setTimeout(() => apply(totalFromUi()), 160));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();
