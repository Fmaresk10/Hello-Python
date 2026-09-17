(() => {
  const params = new URLSearchParams(location.search);
  const SPACE = params.get('space') || 'house';
  const SUPPORTED = new Set(['house', 'patio', 'escuela', 'parroquia']);
  if (!SUPPORTED.has(SPACE)) return;
  if (window.__cafassoWorldMicroeventsInstalledV2) return;
  window.__cafassoWorldMicroeventsInstalledV2 = true;

  const STYLE_ID = 'cafassoWorldMicroeventsStylesV2';
  const PREFIX = 'cafasso-world-microevent-v2';
  const MAX_SESSION_ATTEMPTS = 2;
  const COOLDOWN_MS = 3 * 60 * 60 * 1000;
  const FORCE = params.get('microevent') === 'force';
  const REDUCED = () => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
  let retryCount = 0;

  const CONFIG = {
    house: {
      chance: { morning: .16, afternoon: .11, sunset: .21, night: .13 },
      phrase: {
        morning: 'La casa también despierta de a poco.',
        afternoon: 'A veces, lo importante pasa bajito.',
        sunset: 'Hay luces que invitan a quedarse.',
        night: 'También el silencio puede hacer hogar.'
      }
    },
    patio: {
      chance: { morning: .15, afternoon: .23, sunset: .27, night: .07 },
      phrase: {
        morning: 'El patio empieza antes que el ruido.',
        afternoon: 'Estar también es hacerse presente.',
        sunset: 'Quedarse un poco más también acompaña.',
        night: 'Cuando baja el ruido, quedan los vínculos.'
      }
    },
    escuela: {
      chance: { morning: .11, afternoon: .15, sunset: .09, night: .07 },
      phrase: {
        morning: 'Aprender también es dejarse tocar.',
        afternoon: 'Lo aprendido se vuelve gesto.',
        sunset: 'Algunas preguntas siguen trabajando solas.',
        night: 'Hay cosas que se entienden después.'
      }
    },
    parroquia: {
      chance: { morning: .07, afternoon: .05, sunset: .25, night: .28 },
      phrase: {
        morning: 'La luz entra sin pedir permiso.',
        afternoon: 'También aquí alcanza con estar.',
        sunset: 'Hay luces que no hacen ruido.',
        night: 'A veces, una llama alcanza.'
      }
    }
  };

  function json(storage, key) {
    try { return JSON.parse(storage.getItem(key) || 'null'); }
    catch (error) { return null; }
  }

  function userKey() {
    const session = json(localStorage, 'cafassoSession')?.user || {};
    return String(session._id || session.id || session.email || 'anon');
  }

  function period() {
    const declared = document.documentElement.dataset.cafassoPeriod;
    if (declared) return declared;
    const now = new Date();
    const h = now.getHours() + now.getMinutes() / 60;
    if (h >= 6 && h < 12) return 'morning';
    if (h >= 12 && h < 17.5) return 'afternoon';
    if (h >= 17.5 && h < 20.5) return 'sunset';
    return 'night';
  }

  function random() {
    try {
      const values = new Uint32Array(1);
      crypto.getRandomValues(values);
      return values[0] / 4294967296;
    } catch (error) {
      return Math.random();
    }
  }

  function sessionKey(suffix) {
    return `${PREFIX}:${userKey()}:${suffix}`;
  }

  function hasFiredThisSession() {
    try { return sessionStorage.getItem(sessionKey('fired')) === '1'; }
    catch (error) { return false; }
  }

  function markFiredThisSession() {
    try { sessionStorage.setItem(sessionKey('fired'), '1'); }
    catch (error) {}
  }

  function attemptedSpace() {
    try { return sessionStorage.getItem(sessionKey(`attempted:${SPACE}`)) === '1'; }
    catch (error) { return false; }
  }

  function markAttemptedSpace() {
    try { sessionStorage.setItem(sessionKey(`attempted:${SPACE}`), '1'); }
    catch (error) {}
  }

  function attemptsCount() {
    try { return Math.max(0, Number(sessionStorage.getItem(sessionKey('attempts')) || 0)); }
    catch (error) { return 0; }
  }

  function incrementAttempts() {
    const next = attemptsCount() + 1;
    try { sessionStorage.setItem(sessionKey('attempts'), String(next)); }
    catch (error) {}
    return next;
  }

  function lastEventAt() {
    try { return Math.max(0, Number(localStorage.getItem(sessionKey('last-fired-at')) || 0)); }
    catch (error) { return 0; }
  }

  function markLastEvent() {
    try { localStorage.setItem(sessionKey('last-fired-at'), String(Date.now())); }
    catch (error) {}
  }

  function inCooldown() {
    if (FORCE) return false;
    const last = lastEventAt();
    return last > 0 && Date.now() - last < COOLDOWN_MS;
  }

  function root() {
    return ({
      house: document.querySelector('.cafasso-house'),
      patio: document.querySelector('.cafasso-patio'),
      escuela: document.querySelector('.cafasso-escuela'),
      parroquia: document.querySelector('.cafasso-parroquia')
    })[SPACE] || null;
  }

  function visible(selector) {
    return Array.from(document.querySelectorAll(selector)).some(node => {
      if (node.hidden) return false;
      const style = getComputedStyle(node);
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > 0;
    });
  }

  function worldBusy() {
    if (document.hidden || document.body.classList.contains('cafasso-prologue-open')) return true;
    return visible([
      '.cafasso-parish-panel:not([hidden])',
      '.cafasso-parish-silence.is-visible',
      '.cafasso-school-map-panel:not([hidden])',
      '.cafasso-bitacora-acompanante-panel:not([hidden])',
      '.cafasso-bitacora-panel:not([hidden])',
      '[role="dialog"]:not([hidden])'
    ].join(','));
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-microevent-layer{position:absolute;inset:0;z-index:4;pointer-events:none;overflow:hidden}

      .cafasso-microevent-house-glow{position:absolute;inset:-6%;opacity:0;background:radial-gradient(ellipse 42% 35% at 63% 27%,rgba(255,214,132,.25),transparent 70%);mix-blend-mode:screen;animation:cafassoMicroHouseGlow 5.8s ease-in-out both}
      @keyframes cafassoMicroHouseGlow{0%,100%{opacity:0;transform:scale(.97)}38%{opacity:.58;transform:scale(1.02)}68%{opacity:.28;transform:scale(1.01)}}
      .cafasso-microevent-dust{position:absolute;width:3px;height:3px;border-radius:50%;background:rgba(255,235,190,.72);box-shadow:0 0 7px rgba(255,226,164,.45);opacity:0;animation:cafassoMicroDust 5.4s ease-in-out both}
      @keyframes cafassoMicroDust{0%{opacity:0;transform:translate3d(0,12px,0) scale(.6)}28%{opacity:.7}75%{opacity:.28}100%{opacity:0;transform:translate3d(34px,-25px,0) scale(1.08)}}

      .cafasso-microevent-patio-sweep{position:absolute;left:-28%;top:8%;width:48%;height:120%;opacity:0;transform:skewX(-18deg) rotate(5deg);background:linear-gradient(90deg,transparent,rgba(255,227,163,.10) 28%,rgba(255,227,163,.20) 48%,rgba(42,57,50,.10) 72%,transparent);filter:blur(7px);animation:cafassoMicroPatioSweep 6.4s ease-in-out both}
      .cafasso-time-night .cafasso-microevent-patio-sweep{background:linear-gradient(90deg,transparent,rgba(199,220,235,.04) 28%,rgba(199,220,235,.11) 49%,rgba(5,11,19,.16) 70%,transparent)}
      @keyframes cafassoMicroPatioSweep{0%{opacity:0;transform:translateX(0) skewX(-18deg) rotate(5deg)}20%{opacity:.56}76%{opacity:.34}100%{opacity:0;transform:translateX(270%) skewX(-18deg) rotate(5deg)}}

      .cafasso-microevent-chalk{position:absolute;z-index:12;right:9%;top:14%;color:rgba(243,240,219,.78);font:italic 22px/1.1 Georgia,serif;letter-spacing:.02em;text-shadow:0 0 2px rgba(255,255,255,.22);opacity:0;transform:rotate(-1.2deg);filter:blur(.1px);animation:cafassoMicroChalk 6.8s ease both}
      .cafasso-microevent-chalk:after{content:"";display:block;width:0;height:1px;margin-top:5px;background:rgba(238,235,213,.42);box-shadow:0 0 3px rgba(255,255,255,.13);animation:cafassoMicroChalkLine 5.2s ease .7s both}
      @keyframes cafassoMicroChalk{0%,100%{opacity:0}18%{opacity:.16}31%,71%{opacity:.88}88%{opacity:.18}}
      @keyframes cafassoMicroChalkLine{0%{width:0;opacity:0}35%,78%{width:100%;opacity:.72}100%{width:100%;opacity:0}}

      .cafasso-microevent-parish-ray{position:absolute;left:42%;top:-18%;width:17%;height:112%;opacity:0;transform:rotate(8deg);transform-origin:50% 0;background:linear-gradient(180deg,rgba(255,237,191,.18),rgba(255,211,139,.075) 54%,transparent 92%);clip-path:polygon(38% 0,62% 0,100% 100%,0 100%);filter:blur(5px);mix-blend-mode:screen;animation:cafassoMicroParishRay 7.4s ease-in-out both}
      .cafasso-time-night .cafasso-microevent-parish-ray{background:linear-gradient(180deg,rgba(255,219,146,.13),rgba(255,188,95,.055) 58%,transparent 92%)}
      @keyframes cafassoMicroParishRay{0%,100%{opacity:0;transform:rotate(8deg) scaleX(.86)}30%{opacity:.45}58%{opacity:.62;transform:rotate(7.3deg) scaleX(1.03)}80%{opacity:.24}}
      .cafasso-parish-candle.cafasso-microevent-candle-breathe{animation:cafassoMicroCandleBreathe 5.4s ease-in-out both!important}
      @keyframes cafassoMicroCandleBreathe{0%,100%{filter:drop-shadow(0 13px 8px rgba(0,0,0,.31))}44%{filter:drop-shadow(0 13px 8px rgba(0,0,0,.31)) drop-shadow(0 0 18px rgba(255,187,80,.26)) brightness(1.035)}72%{filter:drop-shadow(0 13px 8px rgba(0,0,0,.31)) drop-shadow(0 0 9px rgba(255,187,80,.11))}}

      .cafasso-microevent-whisper{position:fixed;left:50%;bottom:7.5%;z-index:65;max-width:min(420px,78vw);padding:8px 13px;border-radius:999px;background:rgba(18,17,15,.60);border:1px solid rgba(255,244,214,.12);box-shadow:0 8px 28px rgba(0,0,0,.18);backdrop-filter:blur(8px);color:rgba(255,248,229,.80);font:italic 13px/1.35 Georgia,serif;letter-spacing:.015em;text-align:center;pointer-events:none;opacity:0;transform:translate(-50%,9px);animation:cafassoMicroWhisper 4.8s ease both}
      @keyframes cafassoMicroWhisper{0%{opacity:0;transform:translate(-50%,9px)}18%,72%{opacity:.82;transform:translate(-50%,0)}100%{opacity:0;transform:translate(-50%,-3px)}}

      @media(max-width:700px){.cafasso-microevent-chalk{right:8%;top:10%;font-size:17px}.cafasso-microevent-parish-ray{left:38%;width:22%}.cafasso-microevent-whisper{bottom:10%;font-size:12px}}
      @media(prefers-reduced-motion:reduce){.cafasso-microevent-layer,.cafasso-microevent-chalk,.cafasso-microevent-whisper,.cafasso-parish-candle.cafasso-microevent-candle-breathe{display:none!important;animation:none!important}}
    `;
    document.head.appendChild(style);
  }

  function layer(host) {
    const el = document.createElement('div');
    el.className = 'cafasso-microevent-layer';
    el.setAttribute('aria-hidden', 'true');
    host.appendChild(el);
    return el;
  }

  function whisper() {
    const message = CONFIG[SPACE]?.phrase?.[period()];
    if (!message) return;
    const note = document.createElement('div');
    note.className = 'cafasso-microevent-whisper';
    note.textContent = message;
    note.setAttribute('aria-hidden', 'true');
    document.body.appendChild(note);
    setTimeout(() => note.remove(), 5000);
  }

  function houseEvent(host) {
    const el = layer(host);
    const p = period();
    if (p === 'night' || p === 'sunset' || random() > .48) {
      const glow = document.createElement('div');
      glow.className = 'cafasso-microevent-house-glow';
      el.appendChild(glow);
    } else {
      for (let i = 0; i < 7; i += 1) {
        const mote = document.createElement('i');
        mote.className = 'cafasso-microevent-dust';
        mote.style.left = `${42 + random() * 30}%`;
        mote.style.top = `${18 + random() * 42}%`;
        mote.style.animationDelay = `${random() * 1.1}s`;
        mote.style.animationDuration = `${4.7 + random() * 1.6}s`;
        el.appendChild(mote);
      }
    }
    setTimeout(() => el.remove(), 7600);
    return true;
  }

  function patioEvent(host) {
    const el = layer(host);
    const sweep = document.createElement('div');
    sweep.className = 'cafasso-microevent-patio-sweep';
    el.appendChild(sweep);
    setTimeout(() => el.remove(), 7000);
    return true;
  }

  function schoolEvent(host) {
    const board = host.querySelector('.cafasso-school-board');
    if (!board) return false;
    const wordsByPeriod = {
      morning: ['mirar', 'preguntar', 'descubrir'],
      afternoon: ['presencia', 'acompañar', 'cuidar'],
      sunset: ['recordar', 'agradecer', 'volver'],
      night: ['escuchar', 'guardar', 'gracias']
    };
    const words = wordsByPeriod[period()] || wordsByPeriod.afternoon;
    const word = words[Math.floor(random() * words.length)];
    const chalk = document.createElement('span');
    chalk.className = 'cafasso-microevent-chalk';
    chalk.textContent = word;
    board.appendChild(chalk);
    setTimeout(() => chalk.remove(), 7200);
    return true;
  }

  function parishEvent(host) {
    if (visible('.cafasso-parish-silence.is-visible')) return false;
    const el = layer(host);
    const ray = document.createElement('div');
    ray.className = 'cafasso-microevent-parish-ray';
    el.appendChild(ray);
    const candle = host.querySelector('.cafasso-parish-candle');
    if (candle && (period() === 'sunset' || period() === 'night')) {
      candle.classList.add('cafasso-microevent-candle-breathe');
      setTimeout(() => candle.classList.remove('cafasso-microevent-candle-breathe'), 5600);
    }
    setTimeout(() => el.remove(), 7900);
    return true;
  }

  function shouldTry() {
    if (FORCE) return true;
    if (REDUCED() || document.hidden || hasFiredThisSession() || inCooldown()) return false;
    if (attemptedSpace() || attemptsCount() >= MAX_SESSION_ATTEMPTS) return false;
    return true;
  }

  function fire() {
    const host = root();
    if (!host || !shouldTry()) return;

    if (worldBusy()) {
      if (retryCount < 7) {
        retryCount += 1;
        setTimeout(fire, 2800 + retryCount * 500);
      }
      return;
    }

    if (!FORCE) {
      markAttemptedSpace();
      incrementAttempts();
      const chance = CONFIG[SPACE]?.chance?.[period()] ?? .10;
      if (random() > chance) return;
    }

    let fired = false;
    if (SPACE === 'house') fired = houseEvent(host);
    else if (SPACE === 'patio') fired = patioEvent(host);
    else if (SPACE === 'escuela') fired = schoolEvent(host);
    else if (SPACE === 'parroquia') fired = parishEvent(host);

    if (!fired) return;

    if (!FORCE) {
      markFiredThisSession();
      markLastEvent();
    }

    setTimeout(whisper, 1900);
    window.dispatchEvent(new CustomEvent('cafasso:microevent', {
      detail: {
        version: 2,
        space: SPACE,
        period: period(),
        forced: FORCE
      }
    }));
  }

  function boot() {
    ensureStyles();
    const host = root();
    if (!host || REDUCED()) return Boolean(host);
    if (!shouldTry()) return true;
    const delay = FORCE ? 1100 : 8500 + Math.floor(random() * 9000);
    setTimeout(fire, delay);
    return true;
  }

  let attempts = 0;
  const wait = () => {
    if (boot()) return;
    if (attempts < 40) {
      attempts += 1;
      setTimeout(wait, 100);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wait, { once: true });
  } else {
    wait();
  }
})();
