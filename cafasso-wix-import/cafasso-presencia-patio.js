(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('space') !== 'patio') return;
  if (window.__cafassoPresenciaPatioInstalled) return;
  window.__cafassoPresenciaPatioInstalled = true;

  const STYLE_ID = 'cafassoPresenciaPatioStyles';
  const PRESENCIA_MIN = 300;
  const UNLOCK_ID = 'presencia-leather-ball';

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
      .cafasso-presencia-ball{
        position:absolute;z-index:5;left:34.5%;bottom:8.8%;width:72px;height:72px;padding:0;border:0;border-radius:50%;
        background:transparent;cursor:pointer;touch-action:manipulation;transform:rotate(-12deg) scale(.94);
        filter:drop-shadow(0 12px 8px rgba(0,0,0,.46));transition:transform .2s ease,filter .2s ease;
      }
      .cafasso-presencia-ball:hover,.cafasso-presencia-ball:focus-visible{
        transform:rotate(-7deg) translateY(-3px) scale(1);filter:drop-shadow(0 15px 10px rgba(0,0,0,.5)) brightness(1.045);outline:none;
      }
      .cafasso-presencia-ball__body{
        position:absolute;inset:3px;border-radius:50%;overflow:hidden;
        background:
          radial-gradient(circle at 31% 24%,rgba(255,225,166,.28),transparent 20%),
          radial-gradient(circle at 68% 75%,rgba(57,28,12,.25),transparent 34%),
          repeating-radial-gradient(circle at 54% 42%,rgba(255,255,255,.025) 0 1px,transparent 1px 5px),
          linear-gradient(145deg,#8d5b2e 0%,#a76f38 34%,#744522 73%,#533018 100%);
        border:2px solid rgba(70,38,18,.72);
        box-shadow:inset 0 0 16px rgba(48,25,12,.5),inset 4px 5px 7px rgba(255,218,154,.12),0 1px 2px rgba(0,0,0,.25);
      }
      .cafasso-presencia-ball__body:before,
      .cafasso-presencia-ball__body:after{
        content:"";position:absolute;border:2px solid rgba(66,34,16,.52);border-radius:50%;pointer-events:none;
      }
      .cafasso-presencia-ball__body:before{width:74px;height:35px;left:-9px;top:16px;transform:rotate(18deg)}
      .cafasso-presencia-ball__body:after{width:34px;height:74px;left:17px;top:-8px;transform:rotate(-17deg)}
      .cafasso-presencia-ball__seam{
        position:absolute;left:50%;top:50%;width:5px;height:5px;border-radius:50%;transform:translate(-50%,-50%);
        background:#4c2b17;box-shadow:0 -25px 0 -1px rgba(71,38,18,.58),0 25px 0 -1px rgba(71,38,18,.58),25px 0 0 -1px rgba(71,38,18,.58),-25px 0 0 -1px rgba(71,38,18,.58);
      }
      .cafasso-presencia-ball.is-arriving{animation:cafassoPresenciaBallArrive 1.25s cubic-bezier(.2,.8,.2,1) both}
      @keyframes cafassoPresenciaBallArrive{
        0%{opacity:0;transform:translateX(-28px) rotate(-42deg) scale(.72)}
        68%{opacity:1;transform:translateX(3px) rotate(-7deg) scale(1.02)}
        100%{opacity:1;transform:translateX(0) rotate(-12deg) scale(.94)}
      }

      .cafasso-presencia-toast{
        position:fixed;z-index:2147483250;left:50%;bottom:28px;transform:translate(-50%,18px);padding:11px 16px;
        border:1px solid rgba(232,195,114,.44);border-radius:999px;background:rgba(8,38,36,.95);box-shadow:0 12px 28px rgba(0,0,0,.34);
        color:#fff1ce;font:800 10px/1.25 Inter,system-ui,sans-serif;letter-spacing:.04em;opacity:0;transition:opacity .24s ease,transform .24s ease;pointer-events:none;
      }
      .cafasso-presencia-toast.show{opacity:1;transform:translate(-50%,0)}

      .cafasso-presencia-layer{
        position:fixed;inset:0;z-index:2147483260;display:grid;place-items:center;padding:24px;background:rgba(5,19,18,.67);
        backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);opacity:0;transition:opacity .22s ease;
      }
      .cafasso-presencia-layer.is-visible{opacity:1}
      .cafasso-presencia-note{
        position:relative;width:min(585px,91vw);padding:46px 48px 36px;border:1px solid rgba(109,77,42,.38);border-radius:5px;
        background:repeating-linear-gradient(0deg,rgba(105,74,41,.025) 0 1px,transparent 1px 9px),linear-gradient(145deg,#f5ead0,#e4cfaa);
        box-shadow:0 31px 76px rgba(0,0,0,.53),inset 0 0 0 4px rgba(255,249,229,.25);color:#443326;font-family:Georgia,serif;
        transform:translateY(9px) rotate(.25deg) scale(.985);transition:transform .24s ease;
      }
      .cafasso-presencia-layer.is-visible .cafasso-presencia-note{transform:translateY(0) rotate(.25deg) scale(1)}
      .cafasso-presencia-note:before{
        content:"";position:absolute;left:31px;top:25px;width:31px;height:31px;border:1px solid rgba(140,98,49,.23);border-radius:50%;
        box-shadow:inset 0 0 0 4px rgba(166,119,60,.06);
      }
      .cafasso-presencia-close{position:absolute;right:12px;top:10px;width:34px;height:34px;border:0;border-radius:50%;background:rgba(91,62,36,.07);color:#5a4532;font:26px/1 Georgia,serif;cursor:pointer}
      .cafasso-presencia-kicker{color:#98744e;font:850 9px/1.2 Inter,system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase}
      .cafasso-presencia-note h2{margin:9px 0 15px;color:#453226;font:500 clamp(34px,5vw,46px)/1 Georgia,serif}
      .cafasso-presencia-note p{margin:0;color:#705a45;font:17px/1.58 Georgia,serif}
      .cafasso-presencia-note p+p{margin-top:13px}
      .cafasso-presencia-sign{margin-top:23px;padding-top:13px;border-top:1px solid rgba(111,78,43,.16);color:#8f6b45;font:italic 14px/1.4 Georgia,serif}

      @media(max-width:680px){
        .cafasso-presencia-ball{left:30%;bottom:10%;width:58px;height:58px}
        .cafasso-presencia-ball__body:before{width:60px;height:29px;left:-8px;top:13px}
        .cafasso-presencia-ball__body:after{width:28px;height:60px;left:14px;top:-7px}
        .cafasso-presencia-ball__seam{box-shadow:0 -20px 0 -1px rgba(71,38,18,.58),0 20px 0 -1px rgba(71,38,18,.58),20px 0 0 -1px rgba(71,38,18,.58),-20px 0 0 -1px rgba(71,38,18,.58)}
        .cafasso-presencia-note{padding:41px 25px 29px}.cafasso-presencia-note p{font-size:15px}
        .cafasso-presencia-toast{bottom:18px;max-width:90vw;text-align:center}
      }
      @media(prefers-reduced-motion:reduce){
        .cafasso-presencia-ball,.cafasso-presencia-toast,.cafasso-presencia-layer,.cafasso-presencia-note{transition:none!important}
        .cafasso-presencia-ball.is-arriving{animation:none!important}
      }
    `;
    document.head.appendChild(style);
  }

  function showToast(text) {
    document.querySelector('.cafasso-presencia-toast')?.remove();
    const toast = document.createElement('div');
    toast.className = 'cafasso-presencia-toast';
    toast.textContent = text;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => toast.classList.remove('show'), 3000);
    setTimeout(() => toast.remove(), 3350);
  }

  function openNote() {
    document.querySelector('.cafasso-presencia-layer')?.remove();
    const layer = document.createElement('div');
    layer.className = 'cafasso-presencia-layer';
    layer.innerHTML = `
      <article class="cafasso-presencia-note" role="dialog" aria-modal="true" aria-labelledby="cafasso-presencia-title">
        <button class="cafasso-presencia-close" type="button" aria-label="Cerrar">×</button>
        <div class="cafasso-presencia-kicker">El Patio cambió · Etapa Presencia</div>
        <h2 id="cafasso-presencia-title">Estar de verdad</h2>
        <p>Un patio se vuelve casa cuando alguien decide quedarse. Jugar, escuchar, mirar a los ojos, saber el nombre.</p>
        <p>La presencia no es ocupar un lugar. Es hacer sentir al otro que no está solo.</p>
        <div class="cafasso-presencia-sign">Esta señal apareció porque alcanzaste la etapa Presencia.</div>
      </article>`;
    document.body.appendChild(layer);

    const close = () => {
      layer.classList.remove('is-visible');
      setTimeout(() => layer.remove(), 240);
    };
    layer.querySelector('.cafasso-presencia-close')?.addEventListener('click', close);
    layer.addEventListener('click', event => { if (event.target === layer) close(); });
    const onKey = event => {
      if (event.key !== 'Escape') return;
      document.removeEventListener('keydown', onKey);
      close();
    };
    document.addEventListener('keydown', onKey);
    requestAnimationFrame(() => layer.classList.add('is-visible'));
  }

  function mount(total) {
    const patio = document.querySelector('.cafasso-patio');
    if (!patio || total < PRESENCIA_MIN) return false;
    ensureStyles();

    let ball = patio.querySelector(`[data-world-unlock="${UNLOCK_ID}"]`);
    if (!ball) {
      ball = document.createElement('button');
      ball.type = 'button';
      ball.className = 'cafasso-presencia-ball';
      ball.dataset.worldUnlock = UNLOCK_ID;
      ball.setAttribute('aria-label', 'Pelota de cuero desbloqueada en la etapa Presencia');
      ball.innerHTML = '<span class="cafasso-presencia-ball__body"></span><span class="cafasso-presencia-ball__seam"></span>';
      patio.appendChild(ball);
      ball.addEventListener('click', openNote);

      const seen = readSeen();
      if (!seen[UNLOCK_ID]) {
        ball.classList.add('is-arriving');
        showToast('El Patio cambió · algo quedó esperando tu presencia');
        markSeen(UNLOCK_ID);
        setTimeout(() => ball.classList.remove('is-arriving'), 1400);
      }
    }
    return true;
  }

  function apply(total) {
    mount(Math.max(0, Number(total || 0)));
  }

  function boot() {
    ensureStyles();
    let tries = 0;
    const wait = () => {
      const patio = document.querySelector('.cafasso-patio');
      if (!patio && tries++ < 35) return setTimeout(wait, 80);
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