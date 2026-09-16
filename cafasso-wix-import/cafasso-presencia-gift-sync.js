(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('space') !== 'patio') return;
  if (window.__cafassoPresenciaGiftSyncInstalled) return;
  window.__cafassoPresenciaGiftSyncInstalled = true;

  const PRESENCIA_MIN = 300;
  let lastApplied = 0;

  function uiTotal() {
    const node = document.querySelector('[data-global-almitas] .cafasso-global-counter__value') ||
      document.querySelector('[data-profile-almitas-card] strong');
    const value = Number(String(node?.textContent || '').replace(/[^0-9.-]/g, ''));
    return Number.isFinite(value) ? Math.max(0, value) : 0;
  }

  function authoritativeTotal() {
    const giftTotal = Number(window.CafassoAdminGiftMetrics?.totalAlmitas);
    if (Number.isFinite(giftTotal)) return Math.max(0, giftTotal);
    const levelTotal = Number(window.CafassoLevel?.totalAlmitas);
    const visualTotal = uiTotal();
    if (Number.isFinite(levelTotal)) return Math.max(levelTotal, visualTotal);
    return visualTotal;
  }

  function apply(total = authoritativeTotal()) {
    const value = Math.max(0, Number(total || 0));
    if (!Number.isFinite(value) || value < PRESENCIA_MIN) return;
    if (value === lastApplied && document.querySelector('[data-world-unlock="presencia-leather-ball"]')) return;
    lastApplied = value;
    window.dispatchEvent(new CustomEvent('cafasso:level-update', {
      detail: {
        ...(window.CafassoLevel || {}),
        totalAlmitas: value,
        source: 'admin-gift-sync'
      }
    }));
  }

  window.addEventListener('cafasso:admin-gifts', event => {
    const value = Number(event?.detail?.totalAlmitas);
    setTimeout(() => apply(Number.isFinite(value) ? value : authoritativeTotal()), 60);
  });

  window.addEventListener('cafasso:profile-metrics', () => setTimeout(() => apply(), 220));
  window.addEventListener('focus', () => setTimeout(() => apply(), 120));
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') setTimeout(() => apply(), 120);
  });

  [350, 900, 1600, 2800].forEach(delay => setTimeout(() => apply(), delay));
})();