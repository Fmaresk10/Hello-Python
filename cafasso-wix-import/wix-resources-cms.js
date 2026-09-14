(() => {
  const API = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoCourse';
  const RESOURCE_TITLE = 'CAFASSO · Recursos internos';
  const STATIC_CATALOG = './data/resources.json';
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

  function truthy(value) {
    if (value === true || value === 1) return true;
    const text = String(value ?? '').trim().toLowerCase();
    return ['true','1','yes','si','sí','on'].includes(text);
  }

  function explicitlyFalse(value) {
    if (value === false || value === 0) return true;
    const text = String(value ?? '').trim().toLowerCase();
    return ['false','0','no','off'].includes(text);
  }

  function collectContents(course) {
    const blocks = [];
    const seen = new Set();

    function walk(value) {
      if (!value || typeof value !== 'object') return;
      if (seen.has(value)) return;
      seen.add(value);

      if (Array.isArray(value)) {
        value.forEach(item => walk(item));
        return;
      }

      if (Array.isArray(value.contents)) {
        value.contents.forEach(block => {
          if (block && typeof block === 'object') blocks.push(block);
        });
      }

      Object.entries(value).forEach(([childKey, child]) => {
        if (childKey !== 'contents' && child && typeof child === 'object') walk(child);
      });
    }

    walk(course);
    return blocks;
  }

  function normalizeResource(block, index) {
    const settings = block?.settings || block?.config || block?.metadata || {};
    const content = block?.content || {};
    const markedAsResource = truthy(settings.cafassoResource) ||
      Object.prototype.hasOwnProperty.call(settings, 'mostrarEnBiblioteca') ||
      Object.prototype.hasOwnProperty.call(settings, 'resourceType') ||
      Object.prototype.hasOwnProperty.call(settings, 'categoria');

    if (!markedAsResource && !block?.title) return null;

    const showValue = settings.mostrarEnBiblioteca ?? block.mostrarEnBiblioteca;
    return {
      id: block._id || block.id || `recurso-${index}`,
      titulo: block.title || block.titulo || block.name || 'Recurso',
      categoria: settings.categoria || block.categoria || '',
      tipo: settings.resourceType || block.tipo || block.type || 'Documento',
      url: content.body || content.url || block.url || block.archivo || '',
      mostrarEnBiblioteca: showValue == null ? true : !explicitlyFalse(showValue),
      disponibleParaCursos: truthy(settings.disponibleParaCursos ?? block.disponibleParaCursos)
    };
  }

  function createBook(resource, index) {
    const href = resource.url;
    const book = document.createElement(href ? 'a' : 'button');
    book.className = 'cafasso-resource-book';
    const seed = resource.categoria || resource.id || resource.titulo;
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

  function render(resources, source = '') {
    const shelf = document.querySelector('[data-resource-shelf]');
    if (!shelf) return 0;

    const visible = resources.filter(resource => resource && truthy(resource.mostrarEnBiblioteca));
    if (!visible.length) return 0;

    shelf.innerHTML = '';
    shelf.dataset.cafassoResourceCount = String(visible.length);
    if (source) shelf.dataset.cafassoResourceSource = source;

    const rows = Array.from({ length: 8 }, (_, index) => {
      const row = document.createElement('div');
      row.className = `cafasso-resource-row cafasso-resource-row--${index + 1}`;
      shelf.appendChild(row);
      return row;
    });

    visible.forEach((resource, index) => {
      const rowIndex = Math.min(Math.floor(index / 7), rows.length - 1);
      rows[rowIndex].appendChild(createBook(resource, index));
    });
    return visible.length;
  }

  async function loadStatic() {
    try {
      const response = await fetch(`${STATIC_CATALOG}?v=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const resources = await response.json();
      if (!Array.isArray(resources)) throw new Error('El catálogo local no es una lista');
      const count = render(resources, 'static');
      if (count) console.info(`CAFASSO: respaldo local de Biblioteca cargado con ${count} recurso(s).`);
      return resources;
    } catch (error) {
      console.warn('CAFASSO: no se pudo cargar el respaldo local de Recursos.', error);
      return [];
    }
  }

  async function loadLive() {
    try {
      const response = await fetch(`${API}?title=${encodeURIComponent(RESOURCE_TITLE)}&_=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      const course = payload?.course || payload?.data?.course || payload?.item || payload?.data || null;
      if (!course) throw new Error('El catálogo no vino en la respuesta');

      const resources = collectContents(course)
        .map(normalizeResource)
        .filter(Boolean);

      const count = render(resources, 'wix-live');
      if (count) console.info(`CAFASSO: Biblioteca en vivo cargada con ${count} recurso(s).`);
      return count;
    } catch (error) {
      console.warn('CAFASSO: no se pudo cargar el catálogo de Recursos desde Wix.', error);
      return 0;
    }
  }

  async function loadFallback() {
    if (new URLSearchParams(location.search).get('space') !== 'recursos') return;
    const localResources = await loadStatic();
    const liveCount = await loadLive();

    // Si el endpoint de Wix no respondió o devolvió un catálogo vacío, el respaldo
    // local queda como fuente visible. Repetimos una vez para ganar cualquier carrera
    // con el cargador principal de la pantalla.
    if (!liveCount && localResources.length) {
      setTimeout(() => {
        const shelf = document.querySelector('[data-resource-shelf]');
        if (!shelf?.querySelector('.cafasso-resource-book')) render(localResources, 'static-final');
      }, 1200);
    }
  }

  setTimeout(loadFallback, 220);
})();
