(() => {
  const params = new URLSearchParams(location.search);
  const SPACE = params.get('space') || 'house';
  const SUPPORTED = new Set(['house', 'patio', 'escuela', 'parroquia']);
  if (!SUPPORTED.has(SPACE)) return;
  if (window.__cafassoWorldMicroeventsInstalled) return;
  window.__cafassoWorldMicroeventsInstalled = true;

  const STYLE_ID = 'cafassoWorldMicroeventsStyles';
  const PREFIX = 'cafasso-world-microevent-v1';
  const REDUCED = () => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
  let retryCount = 0;

  function json(storage, key) {
    try { return JSON.parse(storage.getItem(key) || 'null'); }
    catch (error) { return null; }
  }

  function userKey() {
    const session = json(localStorage, 'cafassoSession')?.user || {};
    return String(session._id || session.id || session.email || 'anon');
  }

  function localDay(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function period() {
    return document.documentElement.dataset.cafassoPeriod || (() => {
      const now = new Date();
      const h = now.getHours() + now.getMinutes() / 60;
      if (h >= 6 && h < 12) return 'morning';
      if (h >= 12 && h < 17.5) return 'afternoon';
      if (h >= 17.5 && h < 20.5) return 'sunset';
      return 'night';
    })();
  }

  function hash(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function seed(extra = '') {
    return hash(`${userKey()}|${localDay()}|${SPACE}|${extra}`) / 4294967295;
  }

  function storageKey() {
    return `${PREFIX}:${userKey()}:${localDay()}:${SPACE}`;
  }

  function seenToday() {
    try { return localStorage.getItem(storageKey()) === '1'; }
    catch (error) { return false; }
  }

  function markSeen() {
    try { localStorage.setItem(storageKey(), '1'); }
    catch (error) {}
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

      @media(max-width:700px){.cafasso-microevent-chalk{right:8%;top:10%;font-size:17px}.cafasso-microevent-parish-ray{left:38%;width:22%}}
      @media(prefers-reduced-motion:reduce){.cafasso-microevent-layer,.cafasso-microevent-chalk,.cafasso-parish-candle.cafasso-microevent-candle-breathe{display:none!important;animation:none!important}}
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

  function houseEvent(host) {
    const el = layer(host);
    if (period() === 'night' || seed('house-choice') > .47) {
      const glow = document.createElement('div');
      glow.className = 'cafasso-microevent-house-glow';
      el.appendChild(glow);
    } else {
      for (let i = 0; i < 7; i += 1) {
        const mote = document.createElement('i');
        mote.className = 'cafasso-microevent-dust';
        mote.style.left = `${42 + seed(`dust-x-${i}`) * 30}%`;
        mote.style.top = `${18 + seed(`dust-y-${i}`) * 42}%`;
        mote.style.animationDelay = `${seed(`dust-d-${i}`) * 1.1}s`;
        mote.style.animationDuration = `${4.7 + seed(`dust-t-${i}`) * 1.6}s`;
        el.appendChild(mote);
      }
    }
    setTimeout(() => el.remove(), 7600);
  }

  function patioEvent(host) {
    const el = layer(host);
    const sweep = document.createElement('div');
    sweep.className = 'cafasso-microevent-patio-sweep';
    el.appendChild(sweep);
    setTimeout(() => el.remove(), 7000);
  }

  function schoolEvent(host) {
    const board = host.querySelector('.cafasso-school-board');
    if (!board) return false;
    const words = period() === 'night'
      ? ['escuchar', 'cuidar', 'gracias']
      : ['presencia', 'acompañar', 'mirar', 'cuidar'];
    const word = words[Math.floor(seed('chalk-word') * words.length) % words.length];
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

  function fire() {
    const host = root();
    if (!host || seenToday() || REDUCED()) return;
    if (worldBusy()) {
      if (retryCount < 8) {
        retryCount += 1;
        setTimeout(fire, 3500 + retryCount * 450);
      }
      return;
    }

    let fired = true;
    if (SPACE === 'house') houseEvent(host);
    else if (SPACE === 'patio') patioEvent(host);
    else if (SPACE === 'escuela') fired = schoolEvent(host);
    else if (SPACE === 'parroquia') fired = parishEvent(host);

    if (fired !== false) {
      markSeen();
      window.dispatchEvent(new CustomEvent('cafasso:microevent', { detail: { space: SPACE, period: period(), day: localDay() } }));
    } else if (retryCount < 8) {
      retryCount += 1;
      setTimeout(fire, 3200);
    }
  }

  function boot() {
    ensureStyles();
    const host = root();
    if (!host || seenToday() || REDUCED()) return Boolean(host);
    const delay = 6500 + Math.floor(seed('delay') * 6500);
    setTimeout(fire, delay);
    return true;
  }

  let attempts = 0;
  const wait = () => {
    if (boot()) return;
    if (attempts < 36) {
      attempts += 1;
      setTimeout(wait, 100);
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wait, { once: true });
  else wait();
})();
