(() => {
  const SPACE = new URLSearchParams(location.search).get('space') || 'house';
  if (!['escuela', 'parroquia'].includes(SPACE)) return;
  if (window.__cafassoDynamicAmbienceSchoolParishInstalled) return;
  window.__cafassoDynamicAmbienceSchoolParishInstalled = true;

  const STORAGE_KEY = 'cafasso-dynamic-ambience-v1';
  const STYLE_ID = 'cafassoDynamicAmbienceSchoolParishStyles';
  let enabled = true;
  let period = '';
  let audioCtx = null;
  let master = null;
  let sceneGain = null;
  let nodes = [];
  let timers = [];
  let unlocked = false;
  let silenceObserver = null;

  function readPreference() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return saved.enabled !== false;
    } catch (error) {
      return true;
    }
  }

  function writePreference() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled, updatedAt: new Date().toISOString() }));
    } catch (error) {}
  }

  function getPeriod(date = new Date()) {
    const hour = date.getHours() + date.getMinutes() / 60;
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17.5) return 'afternoon';
    if (hour >= 17.5 && hour < 20.5) return 'sunset';
    return 'night';
  }

  function label(value) {
    return ({ morning: 'Mañana', afternoon: 'Tarde', sunset: 'Atardecer', night: 'Noche' })[value] || 'CAFASSO';
  }

  function root() {
    return SPACE === 'escuela'
      ? document.querySelector('.cafasso-escuela')
      : document.querySelector('.cafasso-parroquia');
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-dynamic-light-sp{position:absolute;inset:0;z-index:3;pointer-events:none;transition:background 1.35s ease,box-shadow 1.35s ease,opacity 1.35s ease}

      .cafasso-time-morning .cafasso-escuela .cafasso-dynamic-light-sp{background:radial-gradient(ellipse 44% 38% at 69% 16%,rgba(255,238,181,.19),transparent 68%),linear-gradient(145deg,rgba(218,240,229,.035),transparent 52%);box-shadow:inset 0 0 95px rgba(255,244,211,.025)}
      .cafasso-time-afternoon .cafasso-escuela .cafasso-dynamic-light-sp{background:radial-gradient(ellipse 43% 37% at 70% 18%,rgba(255,207,116,.16),transparent 67%),linear-gradient(180deg,transparent 52%,rgba(67,48,28,.055));box-shadow:inset 0 0 100px rgba(70,43,22,.025)}
      .cafasso-time-sunset .cafasso-escuela .cafasso-dynamic-light-sp{background:radial-gradient(ellipse 54% 44% at 73% 20%,rgba(255,160,76,.25),transparent 62%),linear-gradient(115deg,rgba(101,45,26,.10),transparent 48%,rgba(235,151,72,.075));box-shadow:inset 0 0 135px rgba(74,33,21,.11)}
      .cafasso-time-night .cafasso-escuela .cafasso-dynamic-light-sp{background:radial-gradient(ellipse 28% 26% at 62% 24%,rgba(244,194,106,.075),transparent 72%),linear-gradient(180deg,rgba(5,18,30,.29),rgba(3,14,25,.45));box-shadow:inset 0 0 165px rgba(0,7,17,.26)}

      .cafasso-time-morning .cafasso-parroquia .cafasso-dynamic-light-sp{background:radial-gradient(ellipse 34% 58% at 55% 15%,rgba(255,239,190,.17),transparent 68%),linear-gradient(180deg,rgba(238,244,226,.025),transparent 56%)}
      .cafasso-time-afternoon .cafasso-parroquia .cafasso-dynamic-light-sp{background:radial-gradient(ellipse 34% 55% at 55% 16%,rgba(255,215,142,.15),transparent 68%),linear-gradient(180deg,transparent 50%,rgba(74,49,27,.045))}
      .cafasso-time-sunset .cafasso-parroquia .cafasso-dynamic-light-sp{background:radial-gradient(ellipse 39% 58% at 57% 17%,rgba(255,171,84,.22),transparent 65%),linear-gradient(180deg,rgba(96,44,25,.08),transparent 48%,rgba(56,29,24,.09));box-shadow:inset 0 0 135px rgba(76,35,21,.10)}
      .cafasso-time-night .cafasso-parroquia .cafasso-dynamic-light-sp{background:radial-gradient(ellipse 28% 44% at 53% 20%,rgba(255,191,99,.085),transparent 68%),linear-gradient(180deg,rgba(3,11,24,.30),rgba(2,9,19,.48));box-shadow:inset 0 0 180px rgba(0,5,13,.28)}

      @media(prefers-reduced-motion:reduce){.cafasso-dynamic-light-sp{transition:none!important}}
    `;
    document.head.appendChild(style);
  }

  function ensureLight() {
    const host = root();
    if (!host || host.querySelector('.cafasso-dynamic-light-sp')) return;
    const layer = document.createElement('div');
    layer.className = 'cafasso-dynamic-light-sp';
    layer.setAttribute('aria-hidden', 'true');
    host.appendChild(layer);
  }

  function ensureToggle() {
    if (document.querySelector('.cafasso-ambience-toggle')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'cafasso-ambience-toggle';
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      enabled = !enabled;
      writePreference();
      updateToggle();
      if (enabled) {
        unlockAudio();
        rebuildScene();
      } else {
        fadeScene(.0001, .28);
      }
    });
    document.body.appendChild(button);
    updateToggle();
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

  function ensureAudio() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return false;
      if (!audioCtx) {
        audioCtx = new AudioCtx();
        master = audioCtx.createGain();
        master.gain.value = .72;
        master.connect(audioCtx.destination);
      }
      if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
      return true;
    } catch (error) {
      return false;
    }
  }

  function unlockAudio() {
    if (unlocked) return;
    if (!ensureAudio()) return;
    unlocked = true;
    if (enabled) rebuildScene();
  }

  function clearScene() {
    timers.forEach(timer => clearTimeout(timer));
    timers = [];
    nodes.forEach(node => {
      try { node.stop?.(); } catch (error) {}
      try { node.disconnect?.(); } catch (error) {}
    });
    nodes = [];
    if (sceneGain) {
      try { sceneGain.disconnect(); } catch (error) {}
      sceneGain = null;
    }
  }

  function makeNoise({ gain = .004, lowpass = 600, bandpass = 0, q = .4, brown = .97 } = {}) {
    const length = Math.floor(audioCtx.sampleRate * 3.1);
    const buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1;
      last = last * brown + white * (1 - brown);
      data[i] = last * .82;
    }
    const src = audioCtx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    let tail = src;
    if (lowpass || bandpass) {
      const filter = audioCtx.createBiquadFilter();
      filter.type = bandpass ? 'bandpass' : 'lowpass';
      filter.frequency.value = bandpass || lowpass;
      filter.Q.value = q;
      tail.connect(filter);
      tail = filter;
      nodes.push(filter);
    }
    const g = audioCtx.createGain();
    g.gain.value = gain;
    tail.connect(g).connect(sceneGain);
    src.start();
    nodes.push(src, g);
  }

  function tone({ freq = 220, end = 150, gain = .0025, duration = .12, type = 'sine' } = {}) {
    if (!audioCtx || !sceneGain || !enabled || document.hidden) return;
    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, end), now + duration);
      g.gain.setValueAtTime(.0001, now);
      g.gain.exponentialRampToValueAtTime(gain, now + .015);
      g.gain.exponentialRampToValueAtTime(.0001, now + duration);
      osc.connect(g).connect(sceneGain);
      osc.start(now);
      osc.stop(now + duration + .02);
    } catch (error) {}
  }

  function softRustle(volume = .0022) {
    if (!audioCtx || !sceneGain || !enabled || document.hidden) return;
    try {
      const now = audioCtx.currentTime;
      const length = Math.floor(audioCtx.sampleRate * .26);
      const buffer = audioCtx.createBuffer(1, length, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / length);
      const src = audioCtx.createBufferSource();
      const filter = audioCtx.createBiquadFilter();
      const g = audioCtx.createGain();
      src.buffer = buffer;
      filter.type = 'bandpass';
      filter.frequency.value = 1350;
      filter.Q.value = .5;
      g.gain.setValueAtTime(.0001, now);
      g.gain.linearRampToValueAtTime(volume, now + .055);
      g.gain.exponentialRampToValueAtTime(.0001, now + .25);
      src.connect(filter).connect(g).connect(sceneGain);
      src.start(now);
      src.stop(now + .27);
    } catch (error) {}
  }

  function schedule(fn, minMs, maxMs) {
    const tick = () => {
      if (!enabled || !unlocked || !sceneGain || document.hidden) return;
      fn();
      const timer = setTimeout(tick, minMs + Math.random() * (maxMs - minMs));
      timers.push(timer);
    };
    const first = setTimeout(tick, minMs * .7 + Math.random() * minMs * .5);
    timers.push(first);
  }

  function buildSchool() {
    const profile = {
      morning:   { room: .0065, air: .0024, rustle: .0024, chalk: .0020 },
      afternoon: { room: .0075, air: .0020, rustle: .0030, chalk: .0025 },
      sunset:    { room: .0062, air: .0014, rustle: .0018, chalk: .0018 },
      night:     { room: .0048, air: .0009, rustle: .0012, chalk: .0012 }
    }[period];
    makeNoise({ gain: profile.room, lowpass: period === 'night' ? 360 : 560, brown: .978 });
    makeNoise({ gain: profile.air, bandpass: 1600, q: .28, brown: .945 });
    schedule(() => softRustle(profile.rustle), period === 'afternoon' ? 10000 : 16000, period === 'afternoon' ? 22000 : 32000);
    schedule(() => tone({ freq: 290, end: 180, gain: profile.chalk, duration: .08, type: 'triangle' }), 15000, 33000);
  }

  function buildParish() {
    const profile = {
      morning:   { room: .0044, air: .0014, wood: .0011 },
      afternoon: { room: .0040, air: .0010, wood: .0010 },
      sunset:    { room: .0035, air: .0008, wood: .0013 },
      night:     { room: .0028, air: .00055, wood: .0009 }
    }[period];
    makeNoise({ gain: profile.room, lowpass: 300, brown: .985 });
    makeNoise({ gain: profile.air, bandpass: 1150, q: .20, brown: .965 });
    schedule(() => tone({ freq: 95, end: 62, gain: profile.wood, duration: .13, type: 'sine' }), 21000, 43000);
  }

  function targetSceneLevel() {
    if (!enabled) return .0001;
    if (SPACE === 'parroquia' && document.querySelector('.cafasso-parish-silence.is-visible')) return .06;
    return 1;
  }

  function fadeScene(value, seconds = .35) {
    if (!audioCtx || !sceneGain) return;
    try {
      const now = audioCtx.currentTime;
      const current = Math.max(.0001, Number(sceneGain.gain.value || .0001));
      sceneGain.gain.cancelScheduledValues(now);
      sceneGain.gain.setValueAtTime(current, now);
      sceneGain.gain.exponentialRampToValueAtTime(Math.max(.0001, value), now + seconds);
    } catch (error) {}
  }

  function rebuildScene() {
    if (!unlocked || !enabled || !ensureAudio()) return;
    clearScene();
    sceneGain = audioCtx.createGain();
    sceneGain.gain.value = .0001;
    sceneGain.connect(master);
    if (SPACE === 'escuela') buildSchool();
    else buildParish();
    fadeScene(targetSceneLevel(), .85);
  }

  function observeParishSilence() {
    if (SPACE !== 'parroquia' || silenceObserver || !document.body) return;
    silenceObserver = new MutationObserver(() => {
      fadeScene(targetSceneLevel(), .42);
    });
    silenceObserver.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
  }

  function applyPeriod(next = getPeriod(), rebuild = true) {
    if (!next) return;
    const changed = next !== period;
    period = next;
    document.body.classList.remove('cafasso-time-morning', 'cafasso-time-afternoon', 'cafasso-time-sunset', 'cafasso-time-night');
    document.body.classList.add(`cafasso-time-${period}`);
    document.documentElement.dataset.cafassoPeriod = period;
    ensureLight();
    if ((changed || rebuild) && unlocked && enabled) rebuildScene();
    window.CafassoDynamicAmbienceExtension = { space: SPACE, period, label: label(period), enabled };
  }

  function boot() {
    const host = root();
    if (!host) return false;
    enabled = readPreference();
    ensureStyles();
    ensureLight();
    ensureToggle();
    applyPeriod(getPeriod(), false);
    observeParishSilence();

    document.addEventListener('pointerdown', unlockAudio, { capture: true, passive: true });
    document.addEventListener('keydown', unlockAudio, { capture: true });
    window.addEventListener('cafasso:time-period', event => applyPeriod(event?.detail?.period || getPeriod(), true));
    window.addEventListener('focus', () => applyPeriod(getPeriod(), true));
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) fadeScene(.0001, .18);
      else if (unlocked && enabled) {
        ensureAudio();
        fadeScene(targetSceneLevel(), .45);
      }
    });
    setInterval(() => applyPeriod(getPeriod(), false), 60000);
    return true;
  }

  let attempts = 0;
  const wait = () => {
    if (boot()) return;
    if (attempts < 30) {
      attempts += 1;
      setTimeout(wait, 90);
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wait, { once: true });
  else wait();
})();
