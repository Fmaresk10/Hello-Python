(() => {
  const params = new URLSearchParams(location.search);
  const SPACE = params.get('space') || 'house';
  if (SPACE !== 'house') return;
  if (window.__cafassoTimeHouseVariantsInstalled) return;
  window.__cafassoTimeHouseVariantsInstalled = true;

  const VALID_PERIODS = new Set(['morning', 'afternoon', 'sunset', 'night']);
  const PREVIEW_PERIOD = VALID_PERIODS.has(params.get('housePeriod'))
    ? params.get('housePeriod')
    : (VALID_PERIODS.has(params.get('loopPeriod')) ? params.get('loopPeriod') : '');

  const IMAGES = {
    morning: {
      primary: 'https://static.wixstatic.com/media/47bf07_a80080c806984cfaaa53b5d16aa89731~mv2.jpg',
      fallback: './assets/time/house-morning.jpg'
    },
    afternoon: {
      primary: 'https://static.wixstatic.com/media/47bf07_9bc5db4bdd144670b58b89d62684b300~mv2.jpg',
      fallback: './assets/time/house-afternoon.jpg'
    },
    sunset: {
      primary: 'https://static.wixstatic.com/media/47bf07_32fab0f8b4a444808b0f577cf89e2196~mv2.png',
      fallback: './assets/time/house-sunset.jpg'
    },
    night: {
      primary: 'https://static.wixstatic.com/media/47bf07_35127a444ffb4f3ab1f669abc21c067d~mv2.jpg',
      fallback: './assets/time/house-night.jpg'
    }
  };

  const STYLE_ID = 'cafassoTimeHouseVariantsStyles';
  let currentPeriod = '';
  let currentSrc = '';
  let swapping = false;
  let pendingPeriod = '';
  let rootImage = null;

  function realPeriod(date = new Date()) {
    const declared = document.documentElement.dataset.cafassoPeriod;
    if (VALID_PERIODS.has(declared)) return declared;

    const hour = date.getHours() + date.getMinutes() / 60;
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17.5) return 'afternoon';
    if (hour >= 17.5 && hour < 20.5) return 'sunset';
    return 'night';
  }

  function period() {
    return PREVIEW_PERIOD || realPeriod();
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-house__image{
        transition:opacity .72s ease,filter .72s ease!important;
        will-change:opacity;
      }
      .cafasso-house__image.cafasso-house-time-fading{
        opacity:.16!important;
        filter:saturate(.96) brightness(.985)!important;
      }
      .cafasso-house-time-preview{
        position:fixed;
        right:12px;
        bottom:12px;
        z-index:2147483100;
        padding:5px 8px;
        border-radius:999px;
        border:1px solid rgba(255,239,199,.14);
        background:rgba(12,20,21,.72);
        color:rgba(255,245,220,.70);
        font:700 9px/1 Inter,system-ui,sans-serif;
        letter-spacing:.05em;
        text-transform:uppercase;
        pointer-events:none;
        backdrop-filter:blur(5px);
      }
      @media(prefers-reduced-motion:reduce){
        .cafasso-house__image{transition:none!important}
      }
    `;
    document.head.appendChild(style);
  }

  function getImage() {
    rootImage = document.querySelector('.cafasso-house__image');
    return rootImage;
  }

  function preload(src) {
    return new Promise((resolve, reject) => {
      if (!src) return reject(new Error('EMPTY_SRC'));
      const image = new Image();
      image.onload = () => resolve(src);
      image.onerror = () => reject(new Error('LOAD_FAILED'));
      image.src = src;
    });
  }

  async function resolveSource(time) {
    const config = IMAGES[time];
    if (!config) throw new Error('UNKNOWN_PERIOD');
    try {
      return await preload(config.primary);
    } catch (error) {
      if (!config.fallback) throw error;
      return preload(config.fallback);
    }
  }

  function setPreviewBadge() {
    if (!PREVIEW_PERIOD || document.querySelector('.cafasso-house-time-preview')) return;
    const badge = document.createElement('div');
    badge.className = 'cafasso-house-time-preview';
    badge.textContent = `Casa · ${PREVIEW_PERIOD}`;
    badge.setAttribute('aria-hidden', 'true');
    document.body.appendChild(badge);
  }

  async function apply({ force = false, instant = false } = {}) {
    const img = getImage();
    if (!img) return false;

    const nextPeriod = period();
    if (!force && nextPeriod === currentPeriod) return true;

    if (swapping) {
      pendingPeriod = nextPeriod;
      return true;
    }

    swapping = true;
    pendingPeriod = '';

    try {
      const src = await resolveSource(nextPeriod);
      if (!force && src === currentSrc && nextPeriod === currentPeriod) return true;

      const reduced = Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
      const shouldFade = !instant && !reduced && Boolean(currentPeriod);

      if (shouldFade) {
        img.classList.add('cafasso-house-time-fading');
        await new Promise(resolve => setTimeout(resolve, 460));
      }

      img.src = src;
      try {
        if (img.decode) await img.decode();
      } catch (error) {}

      currentPeriod = nextPeriod;
      currentSrc = src;
      document.documentElement.dataset.cafassoHousePeriod = nextPeriod;
      img.dataset.cafassoHousePeriod = nextPeriod;
      img.classList.remove('cafasso-house-time-fading');

      window.dispatchEvent(new CustomEvent('cafasso:house-image-period', {
        detail: {
          period: nextPeriod,
          realPeriod: realPeriod(),
          preview: Boolean(PREVIEW_PERIOD),
          src
        }
      }));
    } catch (error) {
      img.classList.remove('cafasso-house-time-fading');
      window.dispatchEvent(new CustomEvent('cafasso:house-image-error', {
        detail: { period: nextPeriod, message: String(error?.message || error) }
      }));
    } finally {
      swapping = false;
      if (pendingPeriod && pendingPeriod !== currentPeriod) {
        setTimeout(() => apply({ force: true, instant: false }), 40);
      }
    }

    return true;
  }

  function boot() {
    if (!getImage()) return false;
    ensureStyles();
    setPreviewBadge();

    // On first paint switch immediately; later changes fade gently.
    apply({ force: true, instant: true });

    window.addEventListener('cafasso:time-period', () => apply({ instant: false }));
    window.addEventListener('focus', () => apply({ instant: false }));
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) apply({ instant: false });
    });
    setInterval(() => apply({ instant: false }), 60000);

    window.CafassoHouseTime = {
      get period() { return currentPeriod || period(); },
      get realPeriod() { return realPeriod(); },
      get previewPeriod() { return PREVIEW_PERIOD; },
      get preview() { return Boolean(PREVIEW_PERIOD); },
      get src() { return currentSrc; },
      refresh() { return apply({ force: true, instant: false }); },
      images: IMAGES
    };

    return true;
  }

  let attempts = 0;
  const wait = () => {
    if (boot()) return;
    if (attempts < 50) {
      attempts += 1;
      setTimeout(wait, 80);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wait, { once: true });
  } else {
    wait();
  }
})();