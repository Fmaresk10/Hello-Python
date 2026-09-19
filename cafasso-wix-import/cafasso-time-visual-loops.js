(() => {
  const params = new URLSearchParams(location.search);
  const SPACE = params.get('space') || 'house';
  const VALID_PERIODS = new Set(['morning', 'afternoon', 'sunset', 'night']);
  const PREVIEW_PERIOD = VALID_PERIODS.has(params.get('loopPeriod')) ? params.get('loopPeriod') : '';
  const ROOTS = {
    house: '.cafasso-house',
    patio: '.cafasso-patio',
    escuela: '.cafasso-escuela',
    parroquia: '.cafasso-parroquia'
  };
  if (!ROOTS[SPACE]) return;
  if (window.__cafassoTimeVisualLoopsInstalled) return;
  window.__cafassoTimeVisualLoopsInstalled = true;

  const STYLE_ID = 'cafassoTimeVisualLoopsStyles';
  const ACTIVE_CLASS = 'cafasso-visual-loop-active';
  const REDUCED = () => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
  const CROSSFADE_MS = 1400;
  const PROBE_TIMEOUT_MS = 4500;

  const LOOPS = {
    escuela: {
      night: './assets/loops/school-night.mp4'
    },
    parroquia: {
      night: './assets/loops/parish-night.mp4'
    }
  };

  let currentKey = '';
  let currentVideo = null;
  let pendingToken = 0;
  let root = null;

  function realPeriod() {
    const declared = document.documentElement.dataset.cafassoPeriod;
    if (declared) return declared;
    const now = new Date();
    const hour = now.getHours() + now.getMinutes() / 60;
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17.5) return 'afternoon';
    if (hour >= 17.5 && hour < 20.5) return 'sunset';
    return 'night';
  }

  function period() {
    return PREVIEW_PERIOD || realPeriod();
  }

  function loopSource(space = SPACE, time = period()) {
    return LOOPS?.[space]?.[time] || '';
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-visual-loop-layer{
        position:absolute;inset:0;z-index:2;overflow:hidden;pointer-events:none;
        opacity:1;isolation:isolate;
      }
      .cafasso-visual-loop-video{
        position:absolute;inset:-1%;width:102%;height:102%;object-fit:cover;
        opacity:0;pointer-events:none;user-select:none;
        transform:scale(1.012);
        transition:opacity ${CROSSFADE_MS}ms ease;
        will-change:opacity;
      }
      .cafasso-visual-loop-video.is-visible{opacity:1}
      body.${ACTIVE_CLASS} .cafasso-dynamic-light{opacity:.22!important}
      body.${ACTIVE_CLASS} .cafasso-dynamic-light-sp{opacity:.18!important}
      body.${ACTIVE_CLASS} .cafasso-corazon-ambient{opacity:.36!important}
      .cafasso-loop-preview-badge{
        position:fixed;right:12px;bottom:12px;z-index:2147483100;padding:5px 8px;border-radius:999px;
        background:rgba(12,20,21,.72);border:1px solid rgba(255,239,199,.14);color:rgba(255,245,220,.70);
        font:700 9px/1 Inter,system-ui,sans-serif;letter-spacing:.05em;text-transform:uppercase;
        pointer-events:none;backdrop-filter:blur(5px)
      }
      @media(max-width:700px){
        .cafasso-visual-loop-video{inset:-2%;width:104%;height:104%}
      }
      @media(prefers-reduced-motion:reduce){
        .cafasso-visual-loop-layer{display:none!important}
      }
    `;
    document.head.appendChild(style);
  }

  function host() {
    return document.querySelector(ROOTS[SPACE]);
  }

  function layer() {
    root = host();
    if (!root) return null;
    let el = root.querySelector(':scope > .cafasso-visual-loop-layer');
    if (!el) {
      el = document.createElement('div');
      el.className = 'cafasso-visual-loop-layer';
      el.setAttribute('aria-hidden', 'true');
      root.appendChild(el);
    }
    return el;
  }

  function deactivate({ removeCurrent = false } = {}) {
    document.body.classList.remove(ACTIVE_CLASS);
    currentKey = '';
    if (currentVideo) {
      currentVideo.classList.remove('is-visible');
      if (removeCurrent) {
        const old = currentVideo;
        currentVideo = null;
        setTimeout(() => old.remove(), CROSSFADE_MS + 80);
      }
    }
    window.dispatchEvent(new CustomEvent('cafasso:visual-loop', {
      detail: { active: false, space: SPACE, period: period(), preview: Boolean(PREVIEW_PERIOD) }
    }));
  }

  function buildVideo(src) {
    const video = document.createElement('video');
    video.className = 'cafasso-visual-loop-video';
    video.muted = true;
    video.defaultMuted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('aria-hidden', 'true');
    video.src = src;
    return video;
  }

  function waitUntilPlayable(video) {
    return new Promise(resolve => {
      let settled = false;
      const finish = ok => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        video.removeEventListener('canplay', onReady);
        video.removeEventListener('loadeddata', onReady);
        video.removeEventListener('error', onError);
        resolve(ok);
      };
      const onReady = () => finish(true);
      const onError = () => finish(false);
      const timer = setTimeout(() => finish(false), PROBE_TIMEOUT_MS);
      video.addEventListener('canplay', onReady, { once: true });
      video.addEventListener('loadeddata', onReady, { once: true });
      video.addEventListener('error', onError, { once: true });
      try { video.load(); } catch (error) { finish(false); }
    });
  }

  async function apply(force = false) {
    if (REDUCED()) {
      deactivate({ removeCurrent: true });
      return;
    }

    const time = period();
    const src = loopSource(SPACE, time);
    const key = src ? `${SPACE}:${time}:${src}` : '';

    if (!src) {
      pendingToken += 1;
      deactivate({ removeCurrent: true });
      return;
    }
    if (!force && key === currentKey && currentVideo) return;

    const hostLayer = layer();
    if (!hostLayer) return;

    const token = ++pendingToken;
    const next = buildVideo(src);
    hostLayer.appendChild(next);

    const playable = await waitUntilPlayable(next);
    if (token !== pendingToken) {
      next.remove();
      return;
    }
    if (!playable) {
      next.remove();
      if (!currentVideo) deactivate({ removeCurrent: false });
      window.dispatchEvent(new CustomEvent('cafasso:visual-loop-missing', {
        detail: { space: SPACE, period: time, src }
      }));
      return;
    }

    try {
      const promise = next.play();
      if (promise?.catch) promise.catch(() => {});
    } catch (error) {}

    const previous = currentVideo;
    currentVideo = next;
    currentKey = key;
    document.body.classList.add(ACTIVE_CLASS);
    requestAnimationFrame(() => requestAnimationFrame(() => next.classList.add('is-visible')));

    if (previous && previous !== next) {
      previous.classList.remove('is-visible');
      setTimeout(() => previous.remove(), CROSSFADE_MS + 100);
    }

    window.dispatchEvent(new CustomEvent('cafasso:visual-loop', {
      detail: { active: true, space: SPACE, period: time, src, preview: Boolean(PREVIEW_PERIOD) }
    }));
  }

  function handleVisibility() {
    if (!currentVideo) return;
    if (document.hidden) {
      try { currentVideo.pause(); } catch (error) {}
    } else {
      try {
        const promise = currentVideo.play();
        if (promise?.catch) promise.catch(() => {});
      } catch (error) {}
    }
  }

  function ensurePreviewBadge() {
    if (!PREVIEW_PERIOD || document.querySelector('.cafasso-loop-preview-badge')) return;
    const badge = document.createElement('div');
    badge.className = 'cafasso-loop-preview-badge';
    badge.textContent = `Preview loop · ${SPACE} · ${PREVIEW_PERIOD}`;
    badge.setAttribute('aria-hidden', 'true');
    document.body.appendChild(badge);
  }

  function boot() {
    root = host();
    if (!root) return false;
    ensureStyles();
    ensurePreviewBadge();
    apply(true);
    window.addEventListener('cafasso:time-period', () => apply(false));
    window.addEventListener('focus', () => apply(false));
    document.addEventListener('visibilitychange', handleVisibility);
    setInterval(() => apply(false), 60000);

    window.CafassoVisualLoops = {
      get space() { return SPACE; },
      get period() { return period(); },
      get realPeriod() { return realPeriod(); },
      get previewPeriod() { return PREVIEW_PERIOD; },
      get preview() { return Boolean(PREVIEW_PERIOD); },
      get active() { return Boolean(currentVideo && currentVideo.classList.contains('is-visible')); },
      get source() { return loopSource(); },
      refresh: () => apply(true),
      config: LOOPS
    };
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