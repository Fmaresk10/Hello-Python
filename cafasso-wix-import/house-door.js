(() => {
  const params = new URLSearchParams(location.search);
  if ((params.get('space') || 'house') !== 'house') return;
  if (window.__cafassoHouseDoorInstalled) return;
  window.__cafassoHouseDoorInstalled = true;

  const STYLE_ID = 'cafassoHouseDoorStyles';
  const PATIO_BG = 'https://static.wixstatic.com/media/47bf07_2465a68b3ac64824b43bc20531ce6fd4~mv2.png';

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-space-link--casa.cafasso-house-door{
        min-width:92px;
        padding:9px 13px 8px;
        border-color:rgba(235,200,126,.62);
        background:linear-gradient(180deg,rgba(45,35,25,.68),rgba(24,30,28,.78));
        box-shadow:0 7px 17px rgba(0,0,0,.31),inset 0 1px rgba(255,243,205,.10);
        backdrop-filter:blur(3px);
        transform-origin:left center;
      }
      .cafasso-space-link--casa.cafasso-house-door:hover{
        transform:translateY(-2px) scale(1.025);
        background:linear-gradient(180deg,rgba(63,47,31,.74),rgba(28,39,35,.88));
        box-shadow:0 10px 21px rgba(0,0,0,.37),0 0 18px rgba(238,198,105,.10);
      }
      .cafasso-house-door__main{display:block;font:600 14px/1.05 Georgia,serif;letter-spacing:.04em}
      .cafasso-house-door__sub{display:block;margin-top:3px;color:rgba(255,244,216,.68);font:800 7px/1 Inter,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase}
      .cafasso-house-door.is-opening{pointer-events:none;transform:perspective(500px) rotateY(-9deg) translateX(2px);filter:brightness(1.12)}
      .cafasso-house-transition{position:absolute;inset:0;z-index:30;pointer-events:none;opacity:0;background:radial-gradient(ellipse 28% 58% at 58% 42%,rgba(255,220,150,.20),transparent 60%),rgba(8,18,17,.03);transition:opacity .36s ease}
      .cafasso-house-transition:after{content:"";position:absolute;inset:0;background:#0b1716;opacity:0;transition:opacity .34s ease .07s}
      .cafasso-house-transition.is-active{opacity:1}
      .cafasso-house-transition.is-active:after{opacity:.88}
      @media(max-width:680px){.cafasso-space-link--casa.cafasso-house-door{min-width:80px;padding:8px 11px 7px}.cafasso-house-door__main{font-size:12px}.cafasso-house-door__sub{font-size:6px}}
      @media(prefers-reduced-motion:reduce){.cafasso-house-transition,.cafasso-house-transition:after,.cafasso-space-link--casa.cafasso-house-door{transition:none!important}}
    `;
    document.head.appendChild(style);
  }

  function playWoodDoor() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      const length = Math.floor(ctx.sampleRate * 0.62);
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < length; i += 1) {
        const white = Math.random() * 2 - 1;
        last = last * 0.92 + white * 0.08;
        const t = i / length;
        const scrape = Math.sin(t * Math.PI * 5.2) * 0.23 + 0.77;
        data[i] = last * scrape * (1 - t) * 0.72;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const band = ctx.createBiquadFilter();
      band.type = 'bandpass';
      band.frequency.setValueAtTime(430, now);
      band.frequency.exponentialRampToValueAtTime(165, now + 0.58);
      band.Q.value = 0.72;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.0001, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.16, now + 0.035);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.62);
      noise.connect(band).connect(noiseGain).connect(ctx.destination);
      noise.start(now);

      const groan = ctx.createOscillator();
      groan.type = 'triangle';
      groan.frequency.setValueAtTime(92, now);
      groan.frequency.exponentialRampToValueAtTime(58, now + 0.48);
      const groanGain = ctx.createGain();
      groanGain.gain.setValueAtTime(0.0001, now);
      groanGain.gain.exponentialRampToValueAtTime(0.06, now + 0.04);
      groanGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.52);
      groan.connect(groanGain).connect(ctx.destination);
      groan.start(now + 0.01);
      groan.stop(now + 0.54);

      const knock = ctx.createOscillator();
      knock.type = 'sine';
      knock.frequency.setValueAtTime(116, now + 0.43);
      knock.frequency.exponentialRampToValueAtTime(52, now + 0.55);
      const knockGain = ctx.createGain();
      knockGain.gain.setValueAtTime(0.0001, now + 0.42);
      knockGain.gain.exponentialRampToValueAtTime(0.09, now + 0.445);
      knockGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.58);
      knock.connect(knockGain).connect(ctx.destination);
      knock.start(now + 0.42);
      knock.stop(now + 0.6);

      window.setTimeout(() => ctx.close().catch(() => {}), 900);
    } catch (error) {}
  }

  function boot() {
    const house = document.querySelector('.cafasso-house');
    const door = house?.querySelector('.cafasso-space-link--casa[data-space="patio"]');
    if (!house || !door || door.dataset.houseDoorReady === '1') return false;

    ensureStyles();
    door.dataset.houseDoorReady = '1';
    door.classList.add('cafasso-house-door');
    door.setAttribute('aria-label', 'Abrir la puerta hacia el Patio');
    door.innerHTML = '<span class="cafasso-house-door__main">Explorar</span><span class="cafasso-house-door__sub">salir al Patio</span>';

    const transition = document.createElement('div');
    transition.className = 'cafasso-house-transition';
    transition.setAttribute('aria-hidden', 'true');
    house.appendChild(transition);

    const preload = new Image();
    preload.decoding = 'async';
    preload.src = PATIO_BG;

    let opening = false;
    door.addEventListener('click', event => {
      if (opening) return;
      opening = true;
      event.preventDefault();
      event.stopImmediatePropagation();
      door.classList.add('is-opening');
      transition.classList.add('is-active');
      playWoodDoor();

      const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
      window.setTimeout(() => {
        const next = new URL(location.href);
        next.searchParams.set('space', 'patio');
        location.href = next.toString();
      }, reduced ? 90 : 470);
    }, true);

    return true;
  }

  let attempts = 0;
  const wait = () => {
    if (boot()) return;
    if (attempts < 25) {
      attempts += 1;
      setTimeout(wait, 80);
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wait, { once: true });
  else wait();
})();
