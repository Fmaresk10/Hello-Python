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

  function loadHouseDoorExperience() {
    if (document.querySelector('script[data-cafasso-house-door-loader]')) return;
    const script = document.createElement('script');
    script.src = './house-door.js?v=1';
    script.defer = true;
    script.dataset.cafassoHouseDoorLoader = '1';
    document.head.appendChild(script);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installRule, { once: true });
  } else {
    installRule();
  }

  setTimeout(installRule, 180);
  loadHouseDoorExperience();
})();
