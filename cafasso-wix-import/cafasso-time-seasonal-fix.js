(() => {
  if (window.__cafassoSeasonalTimeFixInstalled) return;
  window.__cafassoSeasonalTimeFixInstalled = true;

  const SPACE = new URLSearchParams(location.search).get('space') || 'house';
  const VALID_SPACES = new Set(['house','patio','escuela','parroquia']);
  if (!VALID_SPACES.has(SPACE)) return;

  // Aproximación estacional para Uruguay / área metropolitana.
  // Este módulo decide la franja horaria; cada espacio aporta su propia imagen.
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

  function removeLegacyNightLayers() {
    const host = root();
    if (!host) return;
    host.querySelectorAll('.cafasso-seasonal-night-layer').forEach(layer => layer.remove());
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
    removeLegacyNightLayers();
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
    removeLegacyNightLayers();
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
