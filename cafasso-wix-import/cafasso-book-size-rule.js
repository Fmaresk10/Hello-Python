(() => {
  const STANDARD_WIDTH = 40;
  const STANDARD_HEIGHT = 118;
  const BUILD_VERSION = (() => {
    try { return new URL(document.currentScript?.src || '', location.href).searchParams.get('v') || '1'; }
    catch (error) { return '1'; }
  })();

  function normalizeBook(book) {
    if (!book || book.dataset.cafassoStandardBookSize === '1') return;
    const currentTop = Number.parseFloat(book.style.top);
    const currentHeight = Number.parseFloat(book.style.height);
    if (Number.isFinite(currentTop) && Number.isFinite(currentHeight)) {
      const shelfY = currentTop + currentHeight;
      book.style.top = `${shelfY - STANDARD_HEIGHT}px`;
    }
    book.style.width = `${STANDARD_WIDTH}px`;
    book.style.height = `${STANDARD_HEIGHT}px`;
    book.style.minHeight = '0';
    book.style.setProperty('--book-height', '100%');
    book.dataset.cafassoStandardBookSize = '1';
  }

  function normalizeAllBooks() { document.querySelectorAll('[data-resource-shelf] .cafasso-resource-book').forEach(normalizeBook); }
  function installRule() {
    const shelf = document.querySelector('[data-resource-shelf]');
    if (!shelf) return;
    normalizeAllBooks();
    const observer = new MutationObserver(() => normalizeAllBooks());
    observer.observe(shelf, { childList: true, subtree: true });
  }

  function loadHouseScript(src, marker) {
    if (document.querySelector(`script[data-${marker}]`)) return;
    const script = document.createElement('script');
    const url = new URL(src, location.href);
    url.searchParams.set('build', BUILD_VERSION);
    script.src = url.href;
    script.async = false;
    script.defer = true;
    script.setAttribute(`data-${marker}`, '1');
    document.head.appendChild(script);
  }

  function loadHouseExperiences() {
    loadHouseScript('./house-door.js?v=1', 'cafasso-house-door-loader');
    loadHouseScript('./house-prologue.js?v=1', 'cafasso-house-prologue-loader');
    loadHouseScript('./house-microinteractions.js?v=1', 'cafasso-house-micro-loader');
    loadHouseScript('./cafasso-dynamic-ambience.js?v=1', 'cafasso-dynamic-ambience-loader');
    loadHouseScript('./cafasso-dynamic-ambience-school-parish.js?v=1', 'cafasso-dynamic-ambience-school-parish-loader');
    loadHouseScript('./cafasso-time-seasonal-fix.js?v=1', 'cafasso-time-seasonal-fix-loader');
    loadHouseScript('./cafasso-living-calendar.js?v=1', 'cafasso-living-calendar-loader');
    loadHouseScript('./cafasso-time-visual-loops.js?v=3', 'cafasso-time-visual-loops-loader');
    loadHouseScript('./cafasso-world-microevents.js?v=3', 'cafasso-world-microevents-loader');
    loadHouseScript('./cafasso-exploration.js?v=1', 'cafasso-exploration-loader');
    loadHouseScript('./cafasso-exploration-click-fix.js?v=1', 'cafasso-exploration-click-fix-loader');
    loadHouseScript('./cafasso-exploration-position-v2.js?v=1', 'cafasso-exploration-position-v2-loader');
    loadHouseScript('./patio-experience-v2.js?v=1', 'cafasso-patio-experience-v2-loader');
    loadHouseScript('./cafasso-patio-secret.js?v=1', 'cafasso-patio-secret-loader');
    loadHouseScript('./cafasso-huellas-v2.js?v=1', 'cafasso-huellas-v2-loader');

    loadHouseScript('./cafasso-almitas-core.js?v=1', 'cafasso-almitas-core-loader');
    loadHouseScript('./cafasso-almitas-history-v2.js?v=1', 'cafasso-almitas-history-v2-loader');
    loadHouseScript('./cafasso-huella-rewards-v2.js?v=1', 'cafasso-huella-rewards-v2-loader');
    loadHouseScript('./cafasso-admin-gifts-client-v2.js?v=3', 'cafasso-admin-gifts-client-v2-loader');
    loadHouseScript('./cafasso-levels.js?v=2', 'cafasso-levels-loader');
    loadHouseScript('./cafasso-corazon-salesiano.js?v=1', 'cafasso-corazon-salesiano-loader');
    loadHouseScript('./cafasso-acompanante-bitacora.js?v=1', 'cafasso-acompanante-bitacora-loader');
    loadHouseScript('./cafasso-acompanante-marker-fix.js?v=1', 'cafasso-acompanante-marker-fix-loader');

    loadHouseScript('./cafasso-world-unlocks.js?v=1', 'cafasso-world-unlocks-loader');
    loadHouseScript('./cafasso-world-unlocks-position.js?v=1', 'cafasso-world-unlocks-position-loader');
    loadHouseScript('./cafasso-presencia-patio.js?v=2', 'cafasso-presencia-patio-loader');

    loadHouseScript('./school-entry.js?v=1', 'cafasso-school-entry-loader');
    loadHouseScript('./school-course-auth.js?v=1', 'cafasso-school-course-auth-loader');
    loadHouseScript('./school-experience.js?v=1', 'cafasso-school-experience-loader');
    loadHouseScript('./cafasso-school-secret.js?v=1', 'cafasso-school-secret-loader');
    loadHouseScript('./school-screen-integration.js?v=2', 'cafasso-school-screen-integration-loader');
    loadHouseScript('./school-resume.js?v=2', 'cafasso-school-resume-loader');
    loadHouseScript('./school-resume-position.js?v=3', 'cafasso-school-resume-position-loader');

    loadHouseScript('./parish-lectionary-position.js?v=2', 'cafasso-parish-lectionary-position-loader');
    loadHouseScript('./parish-candle-position.js?v=2', 'cafasso-parish-candle-position-loader');
    loadHouseScript('./parish-experience.js?v=1', 'cafasso-parish-experience-loader');
    loadHouseScript('./parish-lectionary-realism.js?v=1', 'cafasso-parish-lectionary-realism-loader');
    loadHouseScript('./parish-lectionary-polish.js?v=3', 'cafasso-parish-lectionary-polish-loader');
    loadHouseScript('./parish-songbook.js?v=1', 'cafasso-parish-songbook-loader');
    loadHouseScript('./parish-songbook-realism.js?v=1', 'cafasso-parish-songbook-realism-loader');
    loadHouseScript('./parish-songbook-interior-v2.js?v=1', 'cafasso-parish-songbook-interior-v2-loader');
    loadHouseScript('./parish-candle.js?v=2', 'cafasso-parish-candle-loader');
    loadHouseScript('./parish-candle-altar.js?v=2', 'cafasso-parish-candle-altar-loader');
    loadHouseScript('./cafasso-servidor-parroquia.js?v=1', 'cafasso-servidor-parroquia-loader');
    loadHouseScript('./cafasso-parish-secret.js?v=1', 'cafasso-parish-secret-loader');

    loadHouseScript('./cafasso-mobile-foundation.js?v=1', 'cafasso-mobile-foundation-loader');
    loadHouseScript('./cafasso-mobile-house.js?v=6', 'cafasso-mobile-house-loader');
    loadHouseScript('./cafasso-mobile-patio.js?v=1', 'cafasso-mobile-patio-loader');
    loadHouseScript('./cafasso-mobile-school.js?v=1', 'cafasso-mobile-school-loader');
    loadHouseScript('./cafasso-mobile-parish.js?v=2', 'cafasso-mobile-parish-loader');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installRule, { once: true });
  else installRule();
  setTimeout(installRule, 180);
  loadHouseExperiences();
})();
