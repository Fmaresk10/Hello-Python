(() => {
  const STANDARD_WIDTH = 40;
  const STANDARD_HEIGHT = 118;

  function normalizeBook(book) {
    if (!book || book.dataset.cafassoStandardBookSize === '1') return;

    const currentTop = Number.parseFloat(book.style.top);
    const currentHeight = Number.parseFloat(book.style.height);

    // Conserva la línea de apoyo original del slot y aplica a todos los libros
    // el tamaño visual aprobado de "Juego de Tronos".
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

  function normalizeAllBooks() {
    document.querySelectorAll('[data-resource-shelf] .cafasso-resource-book').forEach(normalizeBook);
  }

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
    script.src = src;
    script.defer = true;
    script.setAttribute(`data-${marker}`, '1');
    document.head.appendChild(script);
  }

  function loadHouseExperiences() {
    loadHouseScript('./house-door.js?v=1', 'cafasso-house-door-loader');
    loadHouseScript('./house-prologue.js?v=1', 'cafasso-house-prologue-loader');
    loadHouseScript('./house-microinteractions.js?v=1', 'cafasso-house-micro-loader');
    loadHouseScript('./patio-experience.js?v=1', 'cafasso-patio-experience-loader');
    loadHouseScript('./parish-experience.js?v=1', 'cafasso-parish-experience-loader');
    loadHouseScript('./parish-lectionary-realism.js?v=1', 'cafasso-parish-lectionary-realism-loader');
    loadHouseScript('./parish-songbook.js?v=1', 'cafasso-parish-songbook-loader');
    loadHouseScript('./parish-candle.js?v=2', 'cafasso-parish-candle-loader');
    loadHouseScript('./parish-candle-altar.js?v=1', 'cafasso-parish-candle-altar-loader');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installRule, { once: true });
  } else {
    installRule();
  }

  setTimeout(installRule, 180);
  loadHouseExperiences();
})();
