(() => {
  const params = new URLSearchParams(location.search);
  const SPACE = params.get('space') || 'house';
  if (SPACE !== 'escuela') return;
  if (window.__cafassoTimeSchoolVariantsInstalled) return;
  window.__cafassoTimeSchoolVariantsInstalled = true;

  const VALID_PERIODS = new Set(['morning', 'afternoon', 'sunset', 'night']);
  const requested = params.get('schoolPeriod') || params.get('escuelaPeriod') || params.get('loopPeriod') || '';
  const PREVIEW_PERIOD = VALID_PERIODS.has(requested) ? requested : '';

  const IMAGES = {
    morning: 'https://static.wixstatic.com/media/47bf07_a8d33103cb5a4effb8af4af5d7a38c17~mv2.png',
    afternoon: 'https://static.wixstatic.com/media/47bf07_3248c27ab7aa4fe5847c319c7e250cc4~mv2.png',
    sunset: 'https://static.wixstatic.com/media/47bf07_2323847daa184448bdc3b4e6543b6c43~mv2.png',
    night: 'https://static.wixstatic.com/media/47bf07_5a9befdb2e4c41b5960e7476b971e655~mv2.png'
  };

  const STYLE_ID = 'cafassoTimeSchoolVariantsStyles';
  let currentPeriod = '';
  let currentSrc = '';
  let swapping = false;
  let pendingPeriod = '';

  const SUNRISE = [5.70,6.05,6.45,6.95,7.30,7.55,7.52,7.15,6.55,5.95,5.55,5.45];
  const SUNSET  = [20.10,19.75,19.15,18.40,18.00,17.72,17.80,18.05,18.45,18.88,19.35,19.85];

  function interpolateMonth(date, values) {
    const month = date.getMonth();
    const next = (month + 1) % 12;
    const days = new Date(date.getFullYear(), month + 1, 0).getDate();
    const t = Math.max(0, Math.min(1, (date.getDate() - 1) / days));
    return values[month] + (values[next] - values[month]) * t;
  }

  function realPeriod(date = new Date()) {
    const declared = document.documentElement.dataset.cafassoPeriod;
    if (VALID_PERIODS.has(declared)) return declared;

    const hour = date.getHours() + date.getMinutes() / 60;
    const sunrise = interpolateMonth(date, SUNRISE);
    const sunset = interpolateMonth(date, SUNSET);
    const morningStart = sunrise - 0.20;
    const sunsetStart = sunset - 1.05;
    const nightStart = sunset + 0.25;

    if (hour >= morningStart && hour < 12) return 'morning';
    if (hour >= 12 && hour < sunsetStart) return 'afternoon';
    if (hour >= sunsetStart && hour < nightStart) return 'sunset';
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
      .cafasso-escuela__image{
        transition:opacity .72s ease,filter .72s ease!important;
        will-change:opacity;
      }
      .cafasso-escuela__image.cafasso-school-time-fading{
        opacity:.16!important;
        filter:saturate(.97) brightness(.99)!important;
      }

      /* Las cuatro imágenes ya contienen la atmósfera completa.
         No superponer el sombreado histórico, luz dinámica ni video nocturno. */
      .cafasso-escuela:before,
      .cafasso-escuela:after,
      .cafasso-escuela .cafasso-dynamic-light-sp,
      .cafasso-escuela .cafasso-seasonal-night-layer,
      .cafasso-escuela .cafasso-visual-loop-layer{
        display:none!important;
      }

      .cafasso-school-time-preview{
        position:fixed;right:12px;bottom:12px;z-index:2147483100;
        padding:5px 8px;border-radius:999px;
        border:1px solid rgba(255,239,199,.14);
        background:rgba(12,20,21,.72);color:rgba(255,245,220,.70);
        font:700 9px/1 Inter,system-ui,sans-serif;
        letter-spacing:.05em;text-transform:uppercase;
        pointer-events:none;backdrop-filter:blur(5px);
      }
      @media(prefers-reduced-motion:reduce){
        .cafasso-escuela__image{transition:none!important}
      }
    `;
    document.head.appendChild(style);
  }

  function getImage() {
    return document.querySelector('.cafasso-escuela__image');
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
    if (!PREVIEW_PERIOD || document.querySelector('.cafasso-school-time-preview')) return;
    const badge = document.createElement('div');
    badge.className = 'cafasso-school-time-preview';
    badge.textContent = `Escuela · ${PREVIEW_PERIOD}`;
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
        img.classList.add('cafasso-school-time-fading');
        await new Promise(resolve => setTimeout(resolve, 460));
      }

      img.src = src;
      try { if (img.decode) await img.decode(); } catch (error) {}

      currentPeriod = nextPeriod;
      currentSrc = src;
      document.documentElement.dataset.cafassoSchoolPeriod = nextPeriod;
      img.dataset.cafassoSchoolPeriod = nextPeriod;
      img.classList.remove('cafasso-school-time-fading');

      window.dispatchEvent(new CustomEvent('cafasso:school-image-period', {
        detail: {
          period: nextPeriod,
          realPeriod: realPeriod(),
          preview: Boolean(PREVIEW_PERIOD),
          src
        }
      }));
    } catch (error) {
      img.classList.remove('cafasso-school-time-fading');
      window.dispatchEvent(new CustomEvent('cafasso:school-image-error', {
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

    window.CafassoSchoolTime = {
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