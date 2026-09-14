(() => {
  const API = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoCourse';
  const RESOURCE_TITLE = 'CAFASSO · Recursos internos';
  const STATIC_CATALOG = './data/resources.json';
  const COLORS = ['#744936','#3f5e53','#6c5a38','#584967','#7b3f45','#355765','#6d513f','#4f603f','#734f2f','#4f4d6f'];
  const SHELF_FILL_ORDER = [0, 1, 2, 3, 4, 5, 6, 7];

  // Coordenadas tomadas de la imagen real de la Biblioteca (1672 x 941).
  // Cada fila termina exactamente sobre una tabla de madera, para que los libros
  // se perciban apoyados en el mueble y no flotando sobre la escena.
  const SHELF_LAYOUT = [
    { left: '29.8%', top: '47.5%', width: '20%', height: '13%' },
    { left: '52.5%', top: '47.5%', width: '24%', height: '13%' },
    { left: '29.8%', top: '33%',   width: '20%', height: '13%' },
    { left: '52.5%', top: '31.8%', width: '24%', height: '13%' },
    { left: '18.5%', top: '47.5%', width: '9%',  height: '13%' },
    { left: '18.5%', top: '33%',   width: '9%',  height: '13%' },
    { left: '18.5%', top: '18.3%', width: '9%',  height: '13%' },
    { left: '52.5%', top: '17.2%', width: '24%', height: '13%' }
  ];

  function alignShelfToLibraryImage() {
    const shelf = document.querySelector('[data-resource-shelf]');
    const image = document.querySelector('.cafasso-recursos__image');
    const scene = document.querySelector('.cafasso-recursos');
    if (!shelf || !image || !scene) return;

    const apply = () => {
      const naturalWidth = image.naturalWidth;
      const naturalHeight = image.naturalHeight;
      const boxWidth = scene.clientWidth;
      const boxHeight = scene.clientHeight;
      if (!naturalWidth || !naturalHeight || !boxWidth || !boxHeight) return;

      const scale = Math.max(boxWidth / naturalWidth, boxHeight / naturalHeight);
      const renderedWidth = naturalWidth * scale;
      const renderedHeight = naturalHeight * scale;
      const offsetX = (boxWidth - renderedWidth) / 2;
      const offsetY = (boxHeight - renderedHeight) / 2;

      shelf.style.inset = 'auto';
      shelf.style.left = '0';
      shelf.style.top = '0';
      shelf.style.right = 'auto';
      shelf.style.bottom = 'auto';
      shelf.style.width = `${naturalWidth}px`;
      shelf.style.height = `${naturalHeight}px`;
      shelf.style.transformOrigin = '0 0';
      shelf.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0) scale(${scale})`;
    };

    if (image.complete && image.naturalWidth) apply();
    else image.addEventListener('load', apply, { once: true });

    if (!shelf.dataset.cafassoShelfAligned) {
      shelf.dataset.cafassoShelfAligned = 'true';
      window.addEventListener('resize', apply, { passive: true });
    }
  }

  function applyPhysicalShelfLayout(rows) {
    rows.forEach((row, index) => {
      const slot = SHELF_LAYOUT[index];
      if (!slot) return;
      row.style.left = slot.left;
      row.style.top = slot.top;
      row.style.width = slot.width;
      row.style.height = slot.height;
      row.style.right = 'auto';
      row.style.bottom = 'auto';
    });
  }

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
    book.style.setProperty('--book-height', `${72 + (hashText(resource.id || resource.titulo || index) % 18)}%`);
    book.style.flexBasis = `${22 + (hashText(resource.titulo || index) % 5)}px`;
    book.style.minHeight = '0';
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

    alignShelfToLibraryImage();

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
    applyPhysicalShelfLayout(rows);

    visible.forEach((resource, index) => {
      const shelfSlot = Math.min(Math.floor(index / 7), SHELF_FILL_ORDER.length - 1);
      const rowIndex = SHELF_FILL_ORDER[shelfSlot];
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
    alignShelfToLibraryImage();
    const localResources = await loadStatic();
    const liveCount = await loadLive();

    if (!liveCount && localResources.length) {
      setTimeout(() => {
        const shelf = document.querySelector('[data-resource-shelf]');
        if (!shelf?.querySelector('.cafasso-resource-book')) render(localResources, 'static-final');
      }, 1200);
    }
  }

  setTimeout(loadFallback, 220);
})();
