(() => {
  if (window.__cafassoSeasonalTimeFixInstalled) return;
  window.__cafassoSeasonalTimeFixInstalled = true;

  const STYLE_ID = 'cafassoSeasonalTimeFixStyles';
  const SPACE = new URLSearchParams(location.search).get('space') || 'house';
  const VALID_SPACES = new Set(['house','patio','escuela','parroquia']);
  if (!VALID_SPACES.has(SPACE)) return;

  // Aproximación estacional para Uruguay / área metropolitana.
  // Valores en hora decimal local para mitad de cada mes.
  const SUNRISE = [5.70,6.05,6.45,6.95,7.30,7.55,7.52,7.15,6.55,5.95,5.55,5.45];
  const SUNSET  = [20.10,19.75,19.15,18.40,18.00,17.72,17.80,18.05,18.45,18.88,19.35,19.85];
  const TIME_CLASSES = ['cafasso-time-morning','cafasso-time-afternoon','cafasso-time-sunset','cafasso-time-night'];

  function interpolateMonth(date, values) {
    const month = date.getMonth();
    const next = (month + 1) % 12;
    const days = new Date(date.getFullYear(), month + 1, 0).getDate();
    const t = Math.max(0, Math.min(1, (date.getDate() - 1) / days));
    return values[month] + (values[next] - values[month]) * t;
  }

  function periodFor(date = new Date()) {
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

  function root() {
    if (SPACE === 'house') return document.querySelector('.cafasso-house');
    if (SPACE === 'patio') return document.querySelector('.cafasso-patio');
    if (SPACE === 'escuela') return document.querySelector('.cafasso-escuela');
    return document.querySelector('.cafasso-parroquia');
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-seasonal-night-layer{position:absolute;inset:0;z-index:4;pointer-events:none;opacity:0;transition:opacity 1.1s ease,background 1.1s ease,backdrop-filter 1.1s ease;}
      .cafasso-time-night .cafasso-seasonal-night-layer{opacity:1;}

      .cafasso-time-night .cafasso-house .cafasso-seasonal-night-layer{
        background:radial-gradient(ellipse 30% 28% at 61% 28%,rgba(255,176,82,.10),transparent 72%),linear-gradient(180deg,rgba(4,12,29,.34),rgba(2,9,23,.58));
        backdrop-filter:brightness(.62) saturate(.78) contrast(1.04);
        box-shadow:inset 0 0 190px rgba(0,5,16,.34);
      }
      .cafasso-time-night .cafasso-patio .cafasso-seasonal-night-layer{
        background:radial-gradient(circle 18% at 72% 12%,rgba(180,210,228,.08),transparent 72%),linear-gradient(180deg,rgba(5,15,34,.40),rgba(2,9,24,.64));
        backdrop-filter:brightness(.56) saturate(.74) contrast(1.05);
        box-shadow:inset 0 0 210px rgba(0,4,14,.38);
      }
      .cafasso-time-night .cafasso-escuela .cafasso-seasonal-night-layer{
        background:radial-gradient(ellipse 30% 30% at 22% 28%,rgba(238,183,96,.08),transparent 72%),linear-gradient(180deg,rgba(4,15,28,.36),rgba(3,10,22,.60));
        backdrop-filter:brightness(.60) saturate(.76) contrast(1.04);
        box-shadow:inset 0 0 190px rgba(0,5,15,.34);
      }
      .cafasso-time-night .cafasso-parroquia .cafasso-seasonal-night-layer{
        background:radial-gradient(ellipse 24% 38% at 56% 43%,rgba(255,176,81,.085),transparent 72%),linear-gradient(180deg,rgba(2,8,19,.38),rgba(1,6,14,.66));
        backdrop-filter:brightness(.54) saturate(.72) contrast(1.04);
        box-shadow:inset 0 0 220px rgba(0,3,10,.42);
      }

      @media(prefers-reduced-motion:reduce){.cafasso-seasonal-night-layer{transition:none!important}}
    `;
    document.head.appendChild(style);
  }

  function ensureLayer() {
    const host = root();
    if (!host || host.querySelector('.cafasso-seasonal-night-layer')) return;
    const layer = document.createElement('div');
    layer.className = 'cafasso-seasonal-night-layer';
    layer.setAttribute('aria-hidden','true');
    host.appendChild(layer);
  }

  let applying = false;
  let current = '';

  function apply(force = false) {
    if (!document.body || applying) return;
    const next = periodFor();
    const alreadyCorrect = document.body.classList.contains(`cafasso-time-${next}`) &&
      TIME_CLASSES.filter(name => name !== `cafasso-time-${next}`).every(name => !document.body.classList.contains(name));
    if (!force && next === current && alreadyCorrect) return;

    applying = true;
    current = next;
    TIME_CLASSES.forEach(name => document.body.classList.remove(name));
    document.body.classList.add(`cafasso-time-${next}`);
    document.documentElement.dataset.cafassoPeriod = next;
    document.documentElement.dataset.cafassoTimeModel = 'uruguay-seasonal';
    ensureLayer();
    applying = false;

    window.CafassoTimeEngine = {
      period: next,
      model: 'uruguay-seasonal',
      getPeriod: periodFor,
      sunrise: interpolateMonth(new Date(), SUNRISE),
      sunset: interpolateMonth(new Date(), SUNSET)
    };

    window.dispatchEvent(new CustomEvent('cafasso:time-period', {
      detail: { period: next, space: SPACE, source: 'uruguay-seasonal' }
    }));
  }

  function boot() {
    ensureStyles();
    ensureLayer();
    apply(true);

    const observer = new MutationObserver(() => {
      if (!applying) apply(false);
    });
    observer.observe(document.body, { attributes:true, attributeFilter:['class'] });

    setInterval(() => apply(false), 20000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) apply(true); });
    window.addEventListener('focus', () => apply(true));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();
