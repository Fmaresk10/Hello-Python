(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('space') !== 'parroquia') return;
  if (window.__cafassoParishCandleInstalled) return;
  window.__cafassoParishCandleInstalled = true;

  const STYLE_ID = 'cafassoParishCandleStyles';
  const todayKey = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `cafasso-parish-candle-${y}-${m}-${d}`;
  };

  function isLitToday() {
    try { return localStorage.getItem(todayKey()) === 'lit'; }
    catch (error) { return false; }
  }

  function rememberLit() {
    try { localStorage.setItem(todayKey(), 'lit'); }
    catch (error) {}
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-parish-candle{position:absolute;left:49.2%;bottom:8.4%;z-index:7;width:82px;height:142px;padding:0;border:0;background:transparent;cursor:pointer;transform:translateX(-50%);filter:drop-shadow(0 12px 9px rgba(0,0,0,.35));transition:transform .2s ease,filter .2s ease}
      .cafasso-parish-candle:hover{transform:translateX(-50%) translateY(-3px) scale(1.025);filter:drop-shadow(0 16px 12px rgba(0,0,0,.4)) brightness(1.035)}
      .cafasso-parish-candle:focus-visible{outline:3px solid #e9c569;outline-offset:5px;border-radius:8px}
      .cafasso-parish-candle__wax{position:absolute;left:25px;bottom:22px;width:32px;height:77px;border:1px solid rgba(124,99,68,.34);border-radius:10px 10px 5px 5px;background:linear-gradient(90deg,#d9c7a5 0%,#f1e6cc 24%,#fff6df 55%,#e4d2ad 100%);box-shadow:inset 5px 0 7px rgba(255,255,255,.18),inset -6px 0 9px rgba(96,69,38,.1),0 4px 4px rgba(29,20,13,.2)}
      .cafasso-parish-candle__wax:before{content:"";position:absolute;left:4px;right:4px;top:-4px;height:10px;border-radius:50%;background:radial-gradient(ellipse at center,#eadbc0 0 38%,#c6ad87 39% 48%,#f5ead3 49%);box-shadow:inset 0 2px 3px rgba(82,56,32,.15)}
      .cafasso-parish-candle__wax:after{content:"";position:absolute;left:15px;top:-1px;width:2px;height:9px;border-radius:2px;background:#4b3628}
      .cafasso-parish-candle__holder{position:absolute;left:14px;right:14px;bottom:10px;height:17px;border-radius:50%;background:radial-gradient(ellipse at 50% 35%,#b68b4b 0 20%,#80633c 46%,#403224 76%,#211c18 100%);box-shadow:0 5px 7px rgba(0,0,0,.28),inset 0 1px rgba(255,229,159,.3)}
      .cafasso-parish-candle__flame{position:absolute;left:31px;bottom:98px;width:20px;height:31px;border-radius:54% 46% 56% 44% / 72% 67% 33% 28%;background:radial-gradient(ellipse at 51% 68%,#fffce0 0 16%,#ffd56c 24%,#f9a229 51%,#d9671c 70%,rgba(211,83,12,0) 74%);filter:drop-shadow(0 0 7px rgba(255,184,67,.74)) drop-shadow(0 0 18px rgba(255,154,46,.34));opacity:0;transform-origin:50% 100%;transform:scale(.5);transition:opacity .35s ease,transform .35s ease}
      .cafasso-parish-candle.is-lit .cafasso-parish-candle__flame{opacity:1;transform:scale(1);animation:cafassoCandleFlame 1.8s ease-in-out infinite alternate}
      .cafasso-parish-candle__glow{position:absolute;left:-4px;right:-4px;top:10px;height:95px;border-radius:50%;background:radial-gradient(circle at 50% 45%,rgba(255,203,103,.28),rgba(255,168,58,.08) 44%,transparent 72%);opacity:0;pointer-events:none;transition:opacity .4s ease}
      .cafasso-parish-candle.is-lit .cafasso-parish-candle__glow{opacity:1}
      @keyframes cafassoCandleFlame{0%{transform:scale(1) rotate(-2deg) translateX(-.5px)}45%{transform:scale(.96,1.04) rotate(1.3deg)}100%{transform:scale(1.03,.97) rotate(-.8deg) translateX(.7px)}}

      .cafasso-parish-candle-message{position:fixed;left:50%;bottom:5.5%;z-index:96;width:min(470px,86vw);padding:17px 22px 16px;border:1px solid rgba(203,166,99,.35);border-radius:5px;background:linear-gradient(145deg,rgba(50,42,33,.96),rgba(23,29,27,.97));box-shadow:0 18px 44px rgba(0,0,0,.42),inset 0 1px rgba(255,245,215,.07);color:#fff7e5;text-align:center;backdrop-filter:blur(7px);opacity:0;transform:translate(-50%,12px);transition:opacity .42s ease,transform .42s ease;pointer-events:none}
      .cafasso-parish-candle-message.is-visible{opacity:1;transform:translate(-50%,0)}
      .cafasso-parish-candle-message strong{display:block;font:500 22px/1.1 Georgia,serif}
      .cafasso-parish-candle-message span{display:block;margin-top:7px;color:rgba(255,244,219,.67);font:600 10px/1.45 Inter,system-ui,sans-serif;letter-spacing:.035em}

      @media(max-width:760px){
        .cafasso-parish-candle{left:50%;bottom:7%;width:62px;height:112px}.cafasso-parish-candle__wax{left:19px;bottom:18px;width:25px;height:60px}.cafasso-parish-candle__wax:after{left:11px}.cafasso-parish-candle__holder{left:9px;right:9px;bottom:8px;height:14px}.cafasso-parish-candle__flame{left:22px;bottom:77px;width:18px;height:28px}.cafasso-parish-candle__glow{top:5px;height:78px}.cafasso-parish-candle-message{bottom:4%;padding:15px 18px}.cafasso-parish-candle-message strong{font-size:19px}
      }
      @media(prefers-reduced-motion:reduce){.cafasso-parish-candle,.cafasso-parish-candle__flame,.cafasso-parish-candle-message{transition:none!important;animation:none!important}}
    `;
    document.head.appendChild(style);
  }

  let messageTimer = null;
  function showMessage(alreadyLit = false) {
    document.querySelector('.cafasso-parish-candle-message')?.remove();
    const message = document.createElement('div');
    message.className = 'cafasso-parish-candle-message';
    message.setAttribute('role', 'status');
    message.innerHTML = alreadyLit
      ? '<strong>Tu vela sigue encendida.</strong><span>Que esta luz te acompañe durante el día.</span>'
      : '<strong>Una luz queda encendida.</strong><span>Que esta luz te recuerde a quién querés cuidar, acompañar o confiar hoy.</span>';
    document.body.appendChild(message);
    requestAnimationFrame(() => message.classList.add('is-visible'));
    clearTimeout(messageTimer);
    messageTimer = setTimeout(() => {
      message.classList.remove('is-visible');
      setTimeout(() => message.remove(), 500);
    }, 4700);
  }

  function boot() {
    const parish = document.querySelector('.cafasso-parroquia');
    if (!parish || parish.dataset.candleReady === '1') return false;
    parish.dataset.candleReady = '1';
    ensureStyles();

    const candle = document.createElement('button');
    candle.className = 'cafasso-parish-candle';
    candle.type = 'button';
    candle.setAttribute('aria-label', 'Encender una vela de oración');
    candle.innerHTML = '<span class="cafasso-parish-candle__glow" aria-hidden="true"></span><span class="cafasso-parish-candle__flame" aria-hidden="true"></span><span class="cafasso-parish-candle__wax" aria-hidden="true"></span><span class="cafasso-parish-candle__holder" aria-hidden="true"></span>';
    if (isLitToday()) {
      candle.classList.add('is-lit');
      candle.setAttribute('aria-label', 'Vela de oración encendida');
    }
    parish.appendChild(candle);

    candle.addEventListener('click', () => {
      const alreadyLit = candle.classList.contains('is-lit');
      if (!alreadyLit) {
        rememberLit();
        candle.classList.add('is-lit');
        candle.setAttribute('aria-label', 'Vela de oración encendida');
      }
      showMessage(alreadyLit);
    });

    return true;
  }

  let attempts = 0;
  const wait = () => {
    if (boot()) return;
    if (attempts < 30) {
      attempts += 1;
      setTimeout(wait, 80);
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wait, { once:true });
  else wait();
})();
