(() => {
  const params = new URLSearchParams(location.search);
  if ((params.get('space') || 'house') !== 'house') return;
  if (window.__cafassoHouseMicroInstalled) return;
  window.__cafassoHouseMicroInstalled = true;

  const STYLE_ID = 'cafassoHouseMicroStyles';
  const DISCOVERY_KEY = 'cafasso-house-micro-discovery-v1';
  const REDUCED = () => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-house .cafasso-micro-ready{will-change:transform,filter}

      .cafasso-animator-sheet.cafasso-micro-ready .cafasso-animator-sheet__paper{
        transition:box-shadow .24s ease,filter .24s ease,background .24s ease;
      }
      .cafasso-animator-sheet.cafasso-micro-ready .cafasso-animator-sheet__clip{
        overflow:hidden;transition:filter .22s ease,transform .22s ease;
      }
      .cafasso-animator-sheet.cafasso-micro-ready .cafasso-animator-sheet__clip:after{
        content:"";position:absolute;inset:-40% -70%;pointer-events:none;
        background:linear-gradient(105deg,transparent 38%,rgba(255,255,255,.62) 49%,transparent 60%);
        transform:translateX(-68%);opacity:0;
      }
      .cafasso-animator-sheet.cafasso-micro-active .cafasso-animator-sheet__paper,
      .cafasso-animator-sheet.cafasso-micro-ready:focus-visible .cafasso-animator-sheet__paper{
        box-shadow:inset 0 0 18px rgba(113,78,42,.11),inset 0 0 0 3px rgba(255,250,235,.40),0 8px 14px rgba(45,29,16,.22),0 0 22px rgba(237,199,114,.12);
        filter:brightness(1.025) saturate(1.02);
      }
      .cafasso-animator-sheet.cafasso-micro-active .cafasso-animator-sheet__clip:after{
        opacity:.72;animation:cafassoClipGleam .72s ease both;
      }
      @keyframes cafassoClipGleam{from{transform:translateX(-68%)}to{transform:translateX(68%)}}

      .cafasso-bitacora-object.cafasso-micro-ready:after{
        content:"";position:absolute;inset:22% 13% 12%;z-index:-1;border-radius:50%;pointer-events:none;
        background:radial-gradient(ellipse,rgba(239,202,126,.23),rgba(239,202,126,.06) 48%,transparent 72%);
        opacity:0;transform:scale(.78);transition:opacity .22s ease,transform .26s ease;
      }
      .cafasso-bitacora-object.cafasso-micro-active:after,
      .cafasso-bitacora-object.cafasso-micro-ready:focus-visible:after{
        opacity:1;transform:scale(1.08);
      }
      .cafasso-bitacora-object.cafasso-micro-active img{
        animation:cafassoBookBreathe .72s ease both;
      }
      @keyframes cafassoBookBreathe{0%,100%{transform:rotate(0deg)}45%{transform:rotate(.75deg) translateY(-1px)}}

      .cafasso-space-link--house-recursos.cafasso-micro-ready{
        overflow:visible;isolation:isolate;
      }
      .cafasso-space-link--house-recursos.cafasso-micro-ready:before{
        content:"";position:absolute;inset:-20px -27px;z-index:-1;border-radius:50%;pointer-events:none;
        background:radial-gradient(circle,rgba(239,201,112,.20),rgba(239,201,112,.055) 42%,transparent 70%);
        opacity:0;transform:scale(.72);transition:opacity .23s ease,transform .28s ease;
      }
      .cafasso-space-link--house-recursos.cafasso-micro-active:before,
      .cafasso-space-link--house-recursos.cafasso-micro-ready:focus-visible:before{
        opacity:1;transform:scale(1.05);
      }
      .cafasso-space-link--house-recursos.cafasso-micro-active{
        box-shadow:0 8px 20px rgba(0,0,0,.34),0 0 18px rgba(237,197,102,.14);
      }

      .cafasso-house-door.cafasso-micro-ready:after{
        content:"";position:absolute;inset:-18px -20px;z-index:-1;border-radius:50%;pointer-events:none;
        background:radial-gradient(ellipse,rgba(255,211,126,.18),rgba(255,211,126,.04) 47%,transparent 72%);
        opacity:.22;transform:scale(.82);transition:opacity .22s ease,transform .26s ease;
      }
      .cafasso-house-door.cafasso-micro-active:after,
      .cafasso-house-door.cafasso-micro-ready:focus-visible:after{
        opacity:.9;transform:scale(1.06);
      }

      .cafasso-micro-discover{animation:cafassoObjectDiscover 1.55s ease both}
      @keyframes cafassoObjectDiscover{
        0%,100%{filter:inherit}
        36%{filter:brightness(1.09) drop-shadow(0 0 8px rgba(239,201,112,.22))}
      }

      @media(prefers-reduced-motion:reduce){
        .cafasso-micro-discover,.cafasso-bitacora-object.cafasso-micro-active img,.cafasso-animator-sheet.cafasso-micro-active .cafasso-animator-sheet__clip:after{animation:none!important}
        .cafasso-animator-sheet.cafasso-micro-ready .cafasso-animator-sheet__paper,
        .cafasso-bitacora-object.cafasso-micro-ready:after,
        .cafasso-space-link--house-recursos.cafasso-micro-ready:before,
        .cafasso-house-door.cafasso-micro-ready:after{transition:none!important}
      }
    `;
    document.head.appendChild(style);
  }

  let audioCtx = null;
  let hoverNodes = [];

  function unlockAudio() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtx) audioCtx = new AudioCtx();
      if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    } catch (error) {}
  }

  function stopHoverSound() {
    hoverNodes.forEach(node => {
      try { node.stop?.(); } catch (error) {}
      try { node.disconnect?.(); } catch (error) {}
    });
    hoverNodes = [];
  }

  function startHoverSound(kind) {
    if (!audioCtx || audioCtx.state !== 'running' || document.body.classList.contains('cafasso-prologue-open')) return;
    stopHoverSound();
    try {
      const now = audioCtx.currentTime;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(kind === 'door' ? 0.018 : 0.012, now + 0.05);
      gain.connect(audioCtx.destination);

      if (kind === 'sheet' || kind === 'bitacora' || kind === 'recursos') {
        const length = Math.floor(audioCtx.sampleRate * 0.7);
        const buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        let last = 0;
        for (let i = 0; i < length; i += 1) {
          const white = Math.random() * 2 - 1;
          last = last * 0.94 + white * 0.06;
          data[i] = last * 0.5;
        }
        const src = audioCtx.createBufferSource();
        const filter = audioCtx.createBiquadFilter();
        src.buffer = buffer;
        src.loop = true;
        filter.type = kind === 'recursos' ? 'bandpass' : 'lowpass';
        filter.frequency.value = kind === 'bitacora' ? 760 : kind === 'sheet' ? 1180 : 520;
        filter.Q.value = kind === 'recursos' ? 0.8 : 0.45;
        src.connect(filter).connect(gain);
        src.start(now);
        hoverNodes.push(src, filter, gain);
      } else {
        const osc = audioCtx.createOscillator();
        const filter = audioCtx.createBiquadFilter();
        osc.type = 'sine';
        osc.frequency.value = 88;
        filter.type = 'lowpass';
        filter.frequency.value = 170;
        osc.connect(filter).connect(gain);
        osc.start(now);
        hoverNodes.push(osc, filter, gain);
      }
    } catch (error) { stopHoverSound(); }
  }

  function clickCue(kind) {
    if (!audioCtx || audioCtx.state !== 'running' || kind === 'door') return;
    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const base = kind === 'sheet' ? 330 : kind === 'bitacora' ? 220 : 165;
      osc.type = kind === 'bitacora' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(base, now);
      osc.frequency.exponentialRampToValueAtTime(base * 0.62, now + 0.13);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.035, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch (error) {}
  }

  function attach(target, kind) {
    if (!target || target.dataset.cafassoMicroReady === '1') return;
    target.dataset.cafassoMicroReady = '1';
    target.dataset.cafassoMicroKind = kind;
    target.classList.add('cafasso-micro-ready');

    const enter = () => {
      if (document.body.classList.contains('cafasso-prologue-open')) return;
      target.classList.add('cafasso-micro-active');
      startHoverSound(kind);
    };
    const leave = () => {
      target.classList.remove('cafasso-micro-active');
      stopHoverSound();
    };

    target.addEventListener('pointerenter', enter);
    target.addEventListener('pointerleave', leave);
    target.addEventListener('focus', enter);
    target.addEventListener('blur', leave);
    target.addEventListener('pointerdown', () => {
      unlockAudio();
      clickCue(kind);
    }, { passive: true });
  }

  function targets() {
    const house = document.querySelector('.cafasso-house');
    if (!house) return [];
    return [
      [house.querySelector('.cafasso-animator-sheet'), 'sheet'],
      [house.querySelector('.cafasso-bitacora-object'), 'bitacora'],
      [house.querySelector('.cafasso-space-link--house-recursos'), 'recursos'],
      [house.querySelector('.cafasso-house-door, .cafasso-space-link--casa[data-space="patio"]'), 'door']
    ];
  }

  function maybeDiscovery() {
    if (REDUCED() || document.body.classList.contains('cafasso-prologue-open')) return;
    try {
      if (sessionStorage.getItem(DISCOVERY_KEY) === 'seen') return;
      sessionStorage.setItem(DISCOVERY_KEY, 'seen');
    } catch (error) {}

    targets().forEach(([target], index) => {
      if (!target) return;
      setTimeout(() => {
        target.classList.add('cafasso-micro-discover');
        setTimeout(() => target.classList.remove('cafasso-micro-discover'), 1650);
      }, 260 + index * 310);
    });
  }

  function boot() {
    const house = document.querySelector('.cafasso-house');
    if (!house) return false;
    ensureStyles();
    targets().forEach(([target, kind]) => attach(target, kind));
    return true;
  }

  document.addEventListener('pointerdown', unlockAudio, { capture: true, passive: true });
  document.addEventListener('keydown', unlockAudio, { capture: true });
  window.addEventListener('blur', stopHoverSound);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopHoverSound(); });

  let attempts = 0;
  const wait = () => {
    const ready = boot();
    if (!ready && attempts < 30) {
      attempts += 1;
      setTimeout(wait, 90);
      return;
    }

    const observer = new MutationObserver(() => boot());
    const house = document.querySelector('.cafasso-house');
    if (house) observer.observe(house, { childList: true, subtree: true });

    const startDiscoveryWhenFree = () => {
      if (document.body.classList.contains('cafasso-prologue-open')) {
        setTimeout(startDiscoveryWhenFree, 240);
      } else {
        setTimeout(maybeDiscovery, 420);
      }
    };
    startDiscoveryWhenFree();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wait, { once: true });
  else wait();
})();
