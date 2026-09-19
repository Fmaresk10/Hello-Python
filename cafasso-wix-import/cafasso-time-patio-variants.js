(() => {
  const params = new URLSearchParams(location.search);
  const SPACE = params.get('space') || 'house';
  if (SPACE !== 'patio') return;
  if (window.__cafassoTimePatioVariantsInstalled) return;
  window.__cafassoTimePatioVariantsInstalled = true;

  const VALID_PERIODS = new Set(['morning', 'afternoon', 'sunset', 'night']);
  const PREVIEW_PERIOD = VALID_PERIODS.has(params.get('patioPeriod'))
    ? params.get('patioPeriod')
    : (VALID_PERIODS.has(params.get('loopPeriod')) ? params.get('loopPeriod') : '');

  const IMAGES = {
    morning: 'https://static.wixstatic.com/media/47bf07_1b5565dca9f446b38de8a368dfc8c4f3~mv2.png',
    afternoon: 'https://static.wixstatic.com/media/47bf07_794847b8f87d4577a04e10fb9adf630c~mv2.png',
    sunset: 'https://static.wixstatic.com/media/47bf07_2ffcd3027228450c9c7487350e067bdd~mv2.png',
    night: 'https://static.wixstatic.com/media/47bf07_e63b403b8b64424c981b1169ddb04fe2~mv2.png'
  };

  const STYLE_ID = 'cafassoTimePatioVariantsStyles';
  let currentPeriod = '';
  let currentSrc = '';
  let swapping = false;
  let pendingPeriod = '';

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
      .cafasso-patio__image{
        transition:opacity .72s ease,filter .72s ease!important;
        will-change:opacity;
      }
      .cafasso-patio__image.cafasso-patio-time-fading{
        opacity:.16!important;
        filter:saturate(.97) brightness(.99)!important;
      }
      .cafasso-patio-time-preview{
        position:fixed;right:12px;bottom:12px;z-index:2147483100;
        padding:5px 8px;border-radius:999px;
        border:1px solid rgba(255,239,199,.14);
        background:rgba(12,20,21,.72);color:rgba(255,245,220,.70);
        font:700 9px/1 Inter,system-ui,sans-serif;
        letter-spacing:.05em;text-transform:uppercase;
        pointer-events:none;backdrop-filter:blur(5px);
      }
      @media(prefers-reduced-motion:reduce){
        .cafasso-patio__image{transition:none!important}
      }
    `;
    document.head.appendChild(style);
  }

  function getImage() {
    return document.querySelector('.cafasso-patio__image');
  }

  function preload(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(src);
      image.onerror = () => reject(new Error('LOAD_FAILED'));
      image.src = src;
    });
  }

  function setPreviewBadge() {
    if (!PREVIEW_PERIOD || document.querySelector('.cafasso-patio-time-preview')) return;
    const badge = document.createElement('div');
    badge.className = 'cafasso-patio-time-preview';
    badge.textContent = `Patio · ${PREVIEW_PERIOD}`;
    badge.setAttribute('aria-hidden', 'true');
    document.body.appendChild(badge);
  }

  async function apply({ force = false, instant = false } = {}) {
    const img = getImage();
    if (!img) return false;

    const nextPeriod = period();
    const src = IMAGES[nextPeriod];
    if (!src) return false;
    if (!force && nextPeriod === currentPeriod && src === currentSrc) return true;

    if (swapping) {
      pendingPeriod = nextPeriod;
      return true;
    }

    swapping = true;
    pendingPeriod = '';

    try {
      await preload(src);

      const reduced = Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
      const shouldFade = !instant && !reduced && Boolean(currentPeriod);

      if (shouldFade) {
        img.classList.add('cafasso-patio-time-fading');
        await new Promise(resolve => setTimeout(resolve, 460));
      }

      img.src = src;
      try { if (img.decode) await img.decode(); } catch (error) {}

      currentPeriod = nextPeriod;
      currentSrc = src;
      document.documentElement.dataset.cafassoPatioPeriod = nextPeriod;
      img.dataset.cafassoPatioPeriod = nextPeriod;
      img.classList.remove('cafasso-patio-time-fading');

      window.dispatchEvent(new CustomEvent('cafasso:patio-image-period', {
        detail: {
          period: nextPeriod,
          realPeriod: realPeriod(),
          preview: Boolean(PREVIEW_PERIOD),
          src
        }
      }));
    } catch (error) {
      img.classList.remove('cafasso-patio-time-fading');
      window.dispatchEvent(new CustomEvent('cafasso:patio-image-error', {
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
    apply({ force: true, instant: true });

    window.addEventListener('cafasso:time-period', () => apply({ instant: false }));
    window.addEventListener('focus', () => apply({ instant: false }));
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) apply({ instant: false });
    });
    setInterval(() => apply({ instant: false }), 60000);

    window.CafassoPatioTime = {
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