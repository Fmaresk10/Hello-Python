(() => {
  if (new URLSearchParams(location.search).get('space') !== 'recursos') return;

  const COLORS = ['#744936','#3f5e53','#6c5a38','#584967','#7b3f45','#355765','#6d513f','#4f603f','#734f2f','#4f4d6f'];

  function hashText(value) {
    let hash = 0;
    const text = String(value || 'recurso');
    for (let i = 0; i < text.length; i += 1) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function visible(value) {
    return value === true || value === 1 || ['true','1','yes','si','sí','on'].includes(String(value ?? '').trim().toLowerCase());
  }

  function createBook(resource, index) {
    const href = resource.url || '';
    const book = document.createElement(href ? 'a' : 'button');
    book.className = 'cafasso-resource-book';
    const seed = resource.categoria || resource.id || resource.titulo || index;
    book.style.setProperty('--book-color', resource.color || COLORS[hashText(seed) % COLORS.length]);
    book.style.setProperty('--book-height', `${72 + (hashText(resource.id || resource.titulo || index) % 24)}%`);
    book.setAttribute('aria-label', resource.titulo || 'Recurso');
    book.title = [resource.titulo, resource.categoria, resource.tipo].filter(Boolean).join(' · ');

    if (href) {
      book.href = href;
      book.target = '_blank';
      book.rel = 'noopener noreferrer';
    } else {
      book.type = 'button';
      book.disabled = true;
    }

    const spine = document.createElement('span');
    spine.className = 'cafasso-resource-book__spine';
    const title = document.createElement('span');
    title.className = 'cafasso-resource-book__title';
    title.textContent = resource.titulo || 'Recurso';
    spine.appendChild(title);
    book.appendChild(spine);
    return book;
  }

  function render(resources) {
    const shelf = document.querySelector('[data-resource-shelf]');
    if (!shelf) return;

    const list = resources.filter(resource => resource && visible(resource.mostrarEnBiblioteca));
    if (!list.length) return;

    shelf.innerHTML = '';
    shelf.dataset.cafassoResourceCount = String(list.length);
    shelf.dataset.cafassoResourceSource = 'static-fallback';

    const rows = Array.from({ length: 8 }, (_, index) => {
      const row = document.createElement('div');
      row.className = `cafasso-resource-row cafasso-resource-row--${index + 1}`;
      shelf.appendChild(row);
      return row;
    });

    list.forEach((resource, index) => {
      const rowIndex = Math.min(Math.floor(index / 7), rows.length - 1);
      rows[rowIndex].appendChild(createBook(resource, index));
    });
  }

  async function load() {
    try {
      const response = await fetch(`./data/resources.json?v=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const resources = await response.json();
      if (!Array.isArray(resources)) throw new Error('El catálogo local no es una lista');
      render(resources);
    } catch (error) {
      console.warn('CAFASSO: no se pudo cargar el respaldo local de Recursos.', error);
    }
  }

  setTimeout(load, 180);
})();
