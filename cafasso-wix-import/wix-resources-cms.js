(() => {
  const API = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoCourse';
  const RESOURCE_TITLE = 'CAFASSO · Recursos internos';
  const STATIC_CATALOG = './data/resources.json';
  const COLORS = ['#744936','#3f5e53','#6c5a38','#584967','#7b3f45','#355765','#6d513f','#4f603f','#734f2f','#4f4d6f'];
  const REFRESH_MS = 30000;
  let loadInFlight = null;

  // Sistema de coordenadas fijo sobre la imagen original de Biblioteca: 1672 x 941 px.
  // x = borde izquierdo del libro; shelfY = línea de apoyo sobre la madera.
  // width/height = tamaño físico del lomo en esa coordenada.
  // Cada recurso toma una coordenada de esta tabla. Si más adelante un recurso
  // trae bibliotecaSlot/slot (1..N), se respeta ese lugar explícito.
  const BOOK_SLOTS = [
    { id: 1,  x: 555,  shelfY: 619, width: 40, height: 118 },
    { id: 2,  x: 617,  shelfY: 623, width: 47, height: 145 },
    { id: 3,  x: 672,  shelfY: 623, width: 54, height: 158 },
    { id: 4,  x: 734,  shelfY: 623, width: 49, height: 150 },
    { id: 5,  x: 792,  shelfY: 623, width: 52, height: 166 },

    { id: 6,  x: 555,  shelfY: 491, width: 49, height: 104 },
    { id: 7,  x: 612,  shelfY: 491, width: 52, height: 109 },
    { id: 8,  x: 672,  shelfY: 491, width: 47, height: 99 },
    { id: 9,  x: 727,  shelfY: 491, width: 54, height: 106 },
    { id: 10, x: 789,  shelfY: 491, width: 49, height: 101 },

    { id: 11, x: 555,  shelfY: 368, width: 49, height: 101 },
    { id: 12, x: 612,  shelfY: 368, width: 54, height: 109 },
    { id: 13, x: 672,  shelfY: 368, width: 47, height: 99 },
    { id: 14, x: 727,  shelfY: 368, width: 52, height: 106 },
    { id: 15, x: 787,  shelfY: 368, width: 49, height: 104 },

    { id: 16, x: 912,  shelfY: 630, width: 52, height: 163 },
    { id: 17, x: 974,  shelfY: 630, width: 47, height: 145 },
    { id: 18, x: 1030, shelfY: 630, width: 54, height: 158 },
    { id: 19, x: 1091, shelfY: 630, width: 49, height: 150 },
    { id: 20, x: 1153, shelfY: 630, width: 52, height: 166 },
    { id: 21, x: 1211, shelfY: 630, width: 47, height: 154 },

    { id: 22, x: 912,  shelfY: 479, width: 49, height: 106 },
    { id: 23, x: 970,  shelfY: 479, width: 52, height: 111 },
    { id: 24, x: 1030, shelfY: 479, width: 47, height: 101 },
    { id: 25, x: 1085, shelfY: 479, width: 54, height: 109 },
    { id: 26, x: 1147, shelfY: 479, width: 49, height: 104 },
    { id: 27, x: 1202, shelfY: 479, width: 52, height: 106 },

    { id: 28, x: 912,  shelfY: 348, width: 49, height: 104 },
    { id: 29, x: 970,  shelfY: 348, width: 54, height: 109 },
    { id: 30, x: 1030, shelfY: 348, width: 47, height: 99 },
    { id: 31, x: 1085, shelfY: 348, width: 52, height: 106 },
    { id: 32, x: 1147, shelfY: 348, width: 49, height: 101 },
    { id: 33, x: 1202, shelfY: 348, width: 52, height: 104 }
  ];

  function onLibraryScreen() {
    return new URLSearchParams(location.search).get('space') === 'recursos';
  }

  function alignShelfToLibraryImage() {
    const shelf = document.querySelector('[data-resource-shelf]');
    const image = document.querySelector('.cafasso-recursos__image');
    const scene = document.querySelector('.cafasso-recursos');
    if (!shelf || !image || !scene) return;

    const apply = () => {
      const naturalWidth = image.naturalWidth;
      const naturalHeight = image.naturalHeight;
      const panorama = scene.querySelector('.cafasso-resources-panorama');
      const alignmentHost = panorama || scene;
      const boxWidth = alignmentHost.clientWidth;
      const boxHeight = alignmentHost.clientHeight;
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

  function asObject(value) {
    if (value && typeof value === 'object') return value;
    if (typeof value !== 'string') return {};
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  // El endpoint de Wix fue cambiando de forma a medida que CAFASSO creció.
  // En vez de depender de que los bloques estén exactamente dentro de course.modules,
  // recorremos toda la respuesta y tomamos únicamente objetos marcados como recurso.
  function collectContents(payload) {
    const blocks = [];
    const seenObjects = new Set();
    const seenIds = new Set();

    function walk(value) {
      if (!value || typeof value !== 'object' || seenObjects.has(value)) return;
      seenObjects.add(value);

      if (Array.isArray(value)) {
        value.forEach(walk);
        return;
      }

      const settings = asObject(value.settings || value.config || value.metadata || {});
      const isResource = truthy(settings.cafassoResource) ||
        Object.prototype.hasOwnProperty.call(settings, 'mostrarEnBiblioteca') ||
        Object.prototype.hasOwnProperty.call(settings, 'resourceType') ||
        Object.prototype.hasOwnProperty.call(settings, 'categoria');

      if (isResource) {
        const id = String(value._id || value.id || '');
        if (!id || !seenIds.has(id)) {
          blocks.push(value);
          if (id) seenIds.add(id);
        }
      }

      Object.values(value).forEach(walk);
    }

    walk(payload);
    return blocks;
  }

  function normalizeResource(block, index) {
    const settings = asObject(block?.settings || block?.config || block?.metadata || {});
    const content = asObject(block?.content || {});
    const markedAsResource = truthy(settings.cafassoResource) ||
      Object.prototype.hasOwnProperty.call(settings, 'mostrarEnBiblioteca') ||
      Object.prototype.hasOwnProperty.call(settings, 'resourceType') ||
      Object.prototype.hasOwnProperty.call(settings, 'categoria');

    if (!markedAsResource) return null;

    const showValue = settings.mostrarEnBiblioteca ?? block.mostrarEnBiblioteca;
    return {
      id: block._id || block.id || `recurso-${index}`,
      titulo: block.title || block.titulo || block.name || 'Recurso',
      categoria: settings.categoria || block.categoria || '',
      tipo: settings.resourceType || block.tipo || block.type || 'Documento',
      url: content.body || content.url || block.url || block.archivo || '',
      mostrarEnBiblioteca: showValue == null ? true : !explicitlyFalse(showValue),
      disponibleParaCursos: truthy(settings.disponibleParaCursos ?? block.disponibleParaCursos),
      bibliotecaSlot: Number(settings.bibliotecaSlot ?? block.bibliotecaSlot ?? block.slot) || null,
      color: settings.color || block.color || ''
    };
  }

  function normalizeCatalogResource(resource, index) {
    if (!resource || typeof resource !== 'object') return null;
    return {
      id: resource.id || resource._id || `static-${index}`,
      titulo: resource.titulo || resource.title || resource.name || 'Recurso',
      categoria: resource.categoria || '',
      tipo: resource.tipo || resource.type || 'Documento',
      url: resource.url || resource.archivo || '',
      mostrarEnBiblioteca: resource.mostrarEnBiblioteca == null ? true : !explicitlyFalse(resource.mostrarEnBiblioteca),
      disponibleParaCursos: truthy(resource.disponibleParaCursos),
      bibliotecaSlot: Number(resource.bibliotecaSlot ?? resource.slot) || null,
      color: resource.color || ''
    };
  }

  function mergeResources(staticResources, liveResources) {
    const merged = new Map();
    staticResources.forEach((resource, index) => {
      const normalized = normalizeCatalogResource(resource, index);
      if (normalized) merged.set(String(normalized.id), normalized);
    });
    liveResources.forEach(resource => {
      if (!resource) return;
      const key = String(resource.id);
      const previous = merged.get(key) || {};
      merged.set(key, { ...previous, ...resource });
    });
    return Array.from(merged.values()).sort((a, b) => {
      const aSlot = Number(a.bibliotecaSlot) || 999;
      const bSlot = Number(b.bibliotecaSlot) || 999;
      return aSlot - bSlot;
    });
  }

  function resolveSlot(resource, index) {
    const explicit = Number(resource.bibliotecaSlot ?? resource.slot);
    if (Number.isInteger(explicit) && explicit >= 1 && explicit <= BOOK_SLOTS.length) {
      return BOOK_SLOTS[explicit - 1];
    }
    return BOOK_SLOTS[index % BOOK_SLOTS.length];
  }

  function createBook(resource, index) {
    const slot = resolveSlot(resource, index);
    const href = resource.url;
    const book = document.createElement(href ? 'a' : 'button');
    const seed = resource.categoria || resource.id || resource.titulo;

    book.className = 'cafasso-resource-book';
    book.dataset.cafassoSlot = String(slot.id);
    book.dataset.cafassoResourceId = String(resource.id || '');
    book.setAttribute('aria-label', resource.titulo || 'Recurso');
    book.title = [resource.titulo, resource.categoria, resource.tipo, `Ubicación ${slot.id}`].filter(Boolean).join(' · ');

    book.style.position = 'absolute';
    book.style.left = `${slot.x}px`;
    book.style.top = `${slot.shelfY - slot.height}px`;
    book.style.width = `${slot.width}px`;
    book.style.height = `${slot.height}px`;
    book.style.flex = 'none';
    book.style.minHeight = '0';
    book.style.setProperty('--book-height', '100%');
    book.style.setProperty('--book-color', resource.color || COLORS[hashText(seed) % COLORS.length]);

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
    shelf.innerHTML = '';
    shelf.dataset.cafassoCoordinateSystem = '1672x941';
    shelf.dataset.cafassoResourceCount = String(visible.length);
    if (source) shelf.dataset.cafassoResourceSource = source;

    visible.forEach((resource, index) => shelf.appendChild(createBook(resource, index)));
    return visible.length;
  }

  async function loadStatic() {
    try {
      const response = await fetch(`${STATIC_CATALOG}?v=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const resources = await response.json();
      if (!Array.isArray(resources)) throw new Error('El catálogo local no es una lista');
      return resources;
    } catch (error) {
      console.warn('CAFASSO: no se pudo cargar el respaldo local de Recursos.', error);
      return [];
    }
  }

  async function loadLive() {
    try {
      const response = await fetch(`${API}?title=${encodeURIComponent(RESOURCE_TITLE)}&_=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      return collectContents(payload).map(normalizeResource).filter(Boolean);
    } catch (error) {
      console.warn('CAFASSO: no se pudo cargar el catálogo de Recursos desde Wix.', error);
      return [];
    }
  }

  async function performLoad() {
    if (!onLibraryScreen()) return 0;
    alignShelfToLibraryImage();

    const [staticResources, liveResources] = await Promise.all([loadStatic(), loadLive()]);
    const mergedResources = mergeResources(staticResources, liveResources);
    const source = liveResources.length
      ? (staticResources.length ? 'wix-live+static' : 'wix-live')
      : 'static';
    const count = render(mergedResources, source);
    console.info(`CAFASSO: Biblioteca cargada con ${count} recurso(s) desde ${source}.`);
    return count;
  }

  function loadLibrary() {
    if (!onLibraryScreen()) return Promise.resolve(0);
    if (loadInFlight) return loadInFlight;
    loadInFlight = performLoad().finally(() => { loadInFlight = null; });
    return loadInFlight;
  }

  // Carga inicial y una segunda pasada: cubre el pequeño lapso entre guardar en Wix
  // y que el endpoint público reconstruya el catálogo completo.
  setTimeout(loadLibrary, 120);
  setTimeout(loadLibrary, 1800);

  // Si la Biblioteca queda abierta mientras Administración guarda un recurso en otra pestaña,
  // se vuelve a sincronizar sin exigir F5.
  window.addEventListener('focus', () => loadLibrary(), { passive: true });
  window.addEventListener('pageshow', () => loadLibrary(), { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) loadLibrary();
  });
  window.addEventListener('storage', event => {
    if (event.key === 'cafasso-resources-updated') loadLibrary();
  });

  setInterval(() => {
    if (!document.hidden && onLibraryScreen()) loadLibrary();
  }, REFRESH_MS);
})();
