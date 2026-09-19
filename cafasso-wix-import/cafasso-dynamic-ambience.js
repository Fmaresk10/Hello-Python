(() => {
  if (window.__cafassoDynamicAmbienceInstalled) return;
  window.__cafassoDynamicAmbienceInstalled = true;

  const STYLE_ID = 'cafassoDynamicAmbienceStyles';
  const STORAGE_KEY = 'cafasso-dynamic-ambience-v1';
  const SPACE = new URLSearchParams(location.search).get('space') || 'house';
  const SUPPORTED = new Set(['house', 'patio']);
  const REDUCED = () => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);

  let period = '';
  let enabled = false;
  let audioCtx = null;
  let masterGain = null;
  let sceneGain = null;
  let sceneNodes = [];
  let sceneTimers = [];
  let audioUnlocked = false;
  let rebuilding = false;

  function readPreference() {
    return false;
  }

  function writePreference() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled: false, updatedAt: new Date().toISOString() }));
    } catch (error) {}
  }

  function getPeriod(date = new Date()) {
    const hour = date.getHours() + date.getMinutes() / 60;
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17.5) return 'afternoon';
    if (hour >= 17.5 && hour < 20.5) return 'sunset';
    return 'night';
  }

  function periodLabel(value) {
    return ({ morning: 'Mañana', afternoon: 'Tarde', sunset: 'Atardecer', night: 'Noche' })[value] || 'CAFASSO';
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-dynamic-light{
        position:absolute;inset:0;z-index:3;pointer-events:none;opacity:1;
        transition:background 1.35s ease,opacity 1.35s ease,box-shadow 1.35s ease;
      }
      .cafasso-time-morning .cafasso-house .cafasso-dynamic-light{
        background:radial-gradient(ellipse 50% 42% at 68% 17%,rgba(255,236,176,.22),transparent 68%),linear-gradient(112deg,rgba(255,244,207,.09),transparent 48%);
        box-shadow:inset 0 0 90px rgba(255,241,203,.035);
      }
      .cafasso-time-afternoon .cafasso-house .cafasso-dynamic-light{
        background:radial-gradient(ellipse 44% 40% at 67% 20%,rgba(255,205,113,.18),transparent 68%),linear-gradient(120deg,transparent 35%,rgba(191,112,46,.055));
        box-shadow:inset 0 0 105px rgba(92,55,30,.025);
      }
      .cafasso-time-sunset .cafasso-house .cafasso-dynamic-light{
        background:radial-gradient(ellipse 56% 49% at 70% 23%,rgba(255,164,76,.28),transparent 64%),linear-gradient(108deg,rgba(112,47,22,.12),transparent 47%,rgba(255,187,89,.09));
        box-shadow:inset 0 0 130px rgba(73,34,18,.14);
      }
      .cafasso-time-night .cafasso-house .cafasso-dynamic-light{
        background:radial-gradient(ellipse 33% 30% at 61% 24%,rgba(255,187,93,.105),transparent 70%),linear-gradient(180deg,rgba(4,16,30,.30),rgba(3,15,26,.43));
        box-shadow:inset 0 0 170px rgba(0,8,18,.28);
      }

      .cafasso-time-morning .cafasso-patio .cafasso-dynamic-light{
        background:radial-gradient(ellipse 48% 36% at 66% 13%,rgba(255,235,171,.17),transparent 68%),linear-gradient(180deg,rgba(211,240,235,.035),transparent 58%);
      }
      .cafasso-time-afternoon .cafasso-patio .cafasso-dynamic-light{
        background:radial-gradient(ellipse 47% 34% at 67% 16%,rgba(255,210,126,.15),transparent 67%),linear-gradient(180deg,transparent 58%,rgba(65,44,26,.055));
      }
      .cafasso-time-sunset .cafasso-patio .cafasso-dynamic-light{
        background:radial-gradient(ellipse 58% 43% at 72% 18%,rgba(255,149,67,.29),transparent 62%),linear-gradient(180deg,rgba(111,44,27,.075),transparent 45%,rgba(58,29,24,.14));
        box-shadow:inset 0 0 125px rgba(80,34,23,.10);
      }
      .cafasso-time-night .cafasso-patio .cafasso-dynamic-light{
        background:radial-gradient(circle 18% at 72% 12%,rgba(202,224,235,.10),transparent 70%),linear-gradient(180deg,rgba(5,18,34,.31),rgba(3,14,27,.47));
        box-shadow:inset 0 0 165px rgba(0,6,16,.24);
      }

      .cafasso-ambience-toggle{
        position:fixed;left:17px;bottom:17px;z-index:2147483200;display:grid;place-items:center;
        width:38px;height:38px;padding:0;border:1px solid rgba(236,202,130,.32);border-radius:50%;
        background:rgba(12,35,34,.58);box-shadow:0 6px 18px rgba(0,0,0,.24),inset 0 1px rgba(255,255,255,.06);
        color:#fff0c9;font:700 17px/1 Georgia,serif;cursor:pointer;backdrop-filter:blur(5px);
        opacity:.72;transition:opacity .18s ease,transform .18s ease,background .18s ease;
      }
      .cafasso-ambience-toggle:hover,.cafasso-ambience-toggle:focus-visible{opacity:1;transform:translateY(-2px);outline:none;background:rgba(16,48,45,.84)}
      .cafasso-ambience-toggle.is-muted{color:rgba(255,240,201,.55);background:rgba(18,29,30,.50)}
      .cafasso-ambience-toggle:after{
        content:attr(data-label);position:absolute;left:47px;bottom:8px;white-space:nowrap;padding:5px 8px;border-radius:999px;
        background:rgba(9,29,29,.86);color:#f7e8c7;font:700 8px/1 Inter,system-ui,sans-serif;letter-spacing:.07em;text-transform:uppercase;
        opacity:0;transform:translateX(-4px);pointer-events:none;transition:opacity .16s ease,transform .16s ease;
      }
      .cafasso-ambience-toggle:hover:after,.cafasso-ambience-toggle:focus-visible:after{opacity:1;transform:translateX(0)}

      @media(max-width:680px){.cafasso-ambience-toggle{left:11px;bottom:11px;width:34px;height:34px;font-size:15px}.cafasso-ambience-toggle:after{display:none}}
      @media(prefers-reduced-motion:reduce){.cafasso-dynamic-light,.cafasso-ambience-toggle{transition:none!important}}
    `;
    document.head.appendChild(style);
  }

  function sceneRoot() {
    if (SPACE === 'house') return document.querySelector('.cafasso-house');
    if (SPACE === 'patio') return document.querySelector('.cafasso-patio');
    return null;
  }

  function ensureLightLayer() {
    const root = sceneRoot();
    if (!root || root.querySelector('.cafasso-dynamic-light')) return;
    const layer = document.createElement('div');
    layer.className = 'cafasso-dynamic-light';
    layer.setAttribute('aria-hidden', 'true');
    root.appendChild(layer);
  }

  function updatePeriod(force = false) {
    const next = getPeriod();
    if (!force && next === period) return;
    period = next;
    document.body.classList.remove('cafasso-time-morning','cafasso-time-afternoon','cafasso-time-sunset','cafasso-time-night');
    document.documentElement.dataset.cafassoPeriod = period;
    document.body.classList.add(`cafasso-time-${period}`);
    ensureLightLayer();
    if (audioUnlocked && enabled && SUPPORTED.has(SPACE)) rebuildAudioScene();
    window.dispatchEvent(new CustomEvent('cafasso:time-period', { detail: { period, label: periodLabel(period), space: SPACE } }));
  }

  function ensureToggle() {
    document.querySelectorAll('.cafasso-ambience-toggle').forEach(button => button.remove());
  }

  function updateToggle() {
    const button = document.querySelector('.cafasso-ambience-toggle');
    if (!button) return;
    button.classList.toggle('is-muted', !enabled);
    button.textContent = enabled ? '♪' : '×';
    button.dataset.label = enabled ? 'Ambiente activo' : 'Ambiente silenciado';
    button.title = enabled ? 'Silenciar ambiente' : 'Activar ambiente';
    button.setAttribute('aria-label', button.title);
    button.setAttribute('aria-pressed', enabled ? 'true' : 'false');
  }

  function ensureAudioContext() {
    return false;
  }

  function stopTimers() {
    sceneTimers.forEach(timer => clearTimeout(timer));
    sceneTimers = [];
  }

  function stopNodes() {
    sceneNodes.forEach(node => {
      try { node.stop?.(); } catch (error) {}
      try { node.disconnect?.(); } catch (error) {}
    });
    sceneNodes = [];
  }

  function createNoiseLoop({ gain = .01, lowpass = 0, bandpass = 0, q = .5, brown = .96 } = {}) {
    const seconds = 3.2;
    const length = Math.floor(audioCtx.sampleRate * seconds);
    const buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1;
      last = last * brown + white * (1 - brown);
      data[i] = last * .85;
    }
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    let tail = source;
    if (lowpass || bandpass) {
      const filter = audioCtx.createBiquadFilter();
      filter.type = bandpass ? 'bandpass' : 'lowpass';
      filter.frequency.value = bandpass || lowpass;
      filter.Q.value = q;
      tail.connect(filter);
      tail = filter;
      sceneNodes.push(filter);
    }
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = gain;
    tail.connect(gainNode).connect(sceneGain);
    source.start();
    sceneNodes.push(source, gainNode);
    return source;
  }

  function chirp(volume = .0035, high = false) {
    if (!audioCtx || !sceneGain || !enabled || document.hidden) return;
    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      const start = high ? 3550 : 2350;
      osc.frequency.setValueAtTime(start, now);
      osc.frequency.exponentialRampToValueAtTime(start * 1.22, now + .055);
      osc.frequency.exponentialRampToValueAtTime(start * .92, now + .13);
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + .018);
      gain.gain.exponentialRampToValueAtTime(.0001, now + .15);
      osc.connect(gain).connect(sceneGain);
      osc.start(now);
      osc.stop(now + .16);
    } catch (error) {}
  }

  function woodTick(volume = .003) {
    if (!audioCtx || !sceneGain || !enabled || document.hidden) return;
    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(128, now);
      osc.frequency.exponentialRampToValueAtTime(74, now + .085);
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + .006);
      gain.gain.exponentialRampToValueAtTime(.0001, now + .10);
      osc.connect(gain).connect(sceneGain);
      osc.start(now);
      osc.stop(now + .11);
    } catch (error) {}
  }

  function scheduleLoop(fn, minMs, maxMs) {
    const tick = () => {
      if (!enabled || !audioUnlocked || !sceneGain) return;
      fn();
      const delay = minMs + Math.random() * (maxMs - minMs);
      const timer = setTimeout(tick, delay);
      sceneTimers.push(timer);
    };
    const first = setTimeout(tick, minMs * .65 + Math.random() * minMs);
    sceneTimers.push(first);
  }

  function buildHouseScene() {
    const profile = {
      morning:   { room: .010, freq: 720, air: .0027, birds: .0035, wood: .0018 },
      afternoon: { room: .011, freq: 610, air: .0020, birds: .0022, wood: .0020 },
      sunset:    { room: .010, freq: 470, air: .0012, birds: 0,     wood: .0030 },
      night:     { room: .008, freq: 340, air: .0008, birds: 0,     wood: .0036 }
    }[period];
    createNoiseLoop({ gain: profile.room, lowpass: profile.freq, brown: .975 });
    createNoiseLoop({ gain: profile.air, bandpass: 1450, q: .25, brown: .94 });
    if (profile.birds) scheduleLoop(() => { chirp(profile.birds); if (Math.random() > .55) setTimeout(() => chirp(profile.birds * .7, true), 165); }, 9000, 19000);
    if (profile.wood) scheduleLoop(() => woodTick(profile.wood), period === 'night' ? 9000 : 14000, period === 'night' ? 21000 : 28000);
  }

  function buildPatioScene() {
    const profile = {
      morning:   { breeze: .008, murmur: .0045, birds: .0048, insect: 0 },
      afternoon: { breeze: .007, murmur: .0105, birds: .0025, insect: 0 },
      sunset:    { breeze: .008, murmur: .0060, birds: .0018, insect: .0016 },
      night:     { breeze: .006, murmur: .0018, birds: 0,     insect: .0028 }
    }[period];
    createNoiseLoop({ gain: profile.breeze, lowpass: 1200, brown: .965 });
    createNoiseLoop({ gain: profile.murmur, bandpass: 610, q: .32, brown: .91 });
    if (profile.birds) scheduleLoop(() => { chirp(profile.birds); if (Math.random() > .42) setTimeout(() => chirp(profile.birds * .75, true), 145); }, 6500, 15000);
    if (profile.insect) scheduleLoop(() => { chirp(profile.insect, true); setTimeout(() => chirp(profile.insect * .7, true), 105); }, 5000, 10500);
  }

  function buildScene() {
    if (!audioCtx || !masterGain || !SUPPORTED.has(SPACE) || !enabled) return;
    sceneGain = audioCtx.createGain();
    sceneGain.gain.value = .0001;
    sceneGain.connect(masterGain);
    sceneNodes.push(sceneGain);
    if (SPACE === 'house') buildHouseScene();
    else if (SPACE === 'patio') buildPatioScene();
    sceneGain.gain.exponentialRampToValueAtTime(1, audioCtx.currentTime + 1.15);
  }

  function stopScene(fadeSeconds = .35, { rebuild = false } = {}) {
    stopTimers();
    const oldGain = sceneGain;
    const nodes = [...sceneNodes];
    sceneGain = null;
    sceneNodes = [];
    if (!audioCtx || !oldGain) {
      nodes.forEach(node => { try { node.stop?.(); } catch (error) {} try { node.disconnect?.(); } catch (error) {} });
      if (rebuild && enabled) buildScene();
      return;
    }
    try {
      const now = audioCtx.currentTime;
      oldGain.gain.cancelScheduledValues(now);
      oldGain.gain.setValueAtTime(Math.max(.0001, oldGain.gain.value || 1), now);
      oldGain.gain.exponentialRampToValueAtTime(.0001, now + Math.max(.06, fadeSeconds));
    } catch (error) {}
    setTimeout(() => {
      nodes.forEach(node => { try { node.stop?.(); } catch (error) {} try { node.disconnect?.(); } catch (error) {} });
      if (rebuild && enabled && audioUnlocked) buildScene();
    }, Math.max(90, fadeSeconds * 1000 + 40));
  }

  function rebuildAudioScene() {
    if (rebuilding || !enabled || !audioUnlocked || !SUPPORTED.has(SPACE)) return;
    rebuilding = true;
    stopScene(.48, { rebuild: true });
    setTimeout(() => { rebuilding = false; }, 620);
  }

  function start() {
    enabled = false;
    audioUnlocked = false;
    return false;
  }

  function fadeOut(seconds = .28) {
    stopScene(seconds, { rebuild: false });
  }

  function setEnabled() {
    enabled = false;
    audioUnlocked = false;
    writePreference();
    ensureToggle();
    stopScene(.01, { rebuild: false });
    return false;
  }

  function ownsSpace(space) {
    return SUPPORTED.has(space);
  }

  function handleFirstGesture() {
    return false;
  }

  function boot() {
    enabled = readPreference();
    ensureStyles();
    updatePeriod(true);
    ensureLightLayer();
    ensureToggle();

    // CAFASSO funciona sin sonido ambiente automático.
    enabled = false;
    audioUnlocked = false;
    writePreference();
    ensureToggle();

    setInterval(() => updatePeriod(false), 60000);
  }

  window.CafassoDynamicAmbience = {
    get period() { return period; },
    get enabled() { return enabled; },
    get space() { return SPACE; },
    ownsSpace,
    start,
    fadeOut,
    setEnabled,
    refresh: () => updatePeriod(true)
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
