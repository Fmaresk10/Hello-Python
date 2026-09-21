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
      descripcion: settings.descripcion || block.descripcion || block.description || '',
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
      descripcion: resource.descripcion || resource.description || '',
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

  function ensureViewerStyles() {
    if (document.getElementById('cafassoResourceViewerStyles')) return;
    const style = document.createElement('style');
    style.id = 'cafassoResourceViewerStyles';
    style.textContent = `
      .cafasso-resource-viewer{
        position:fixed;inset:0;z-index:2147482500;display:grid;place-items:center;
        padding:max(14px,env(safe-area-inset-top)) max(14px,env(safe-area-inset-right)) max(14px,env(safe-area-inset-bottom)) max(14px,env(safe-area-inset-left));
        background:radial-gradient(circle at 50% 32%,rgba(112,83,49,.15),rgba(5,18,19,.78) 62%,rgba(3,12,13,.9));
        backdrop-filter:blur(8px) saturate(.78)
      }
      .cafasso-resource-viewer[hidden]{display:none!important}
      .cafasso-resource-viewer__book{
        position:relative;width:min(1120px,96vw);height:min(760px,92dvh);display:grid;
        grid-template-columns:minmax(220px,310px) minmax(0,1fr);overflow:hidden;
        border:1px solid rgba(111,78,45,.5);border-radius:12px;
        background:linear-gradient(90deg,#8b4a38 0 58px,#f6ead1 58px 100%);
        box-shadow:0 30px 90px rgba(0,0,0,.52),inset 0 1px rgba(255,255,255,.54)
      }
      .cafasso-resource-viewer__book:before{
        content:"";position:absolute;left:58px;top:0;bottom:0;width:1px;background:rgba(82,53,33,.22);
        box-shadow:5px 0 15px rgba(82,53,33,.08);pointer-events:none
      }
      .cafasso-resource-viewer__meta{
        min-width:0;padding:38px 25px 28px 86px;overflow:auto;color:#3b3026;
        background:linear-gradient(145deg,rgba(255,251,241,.52),rgba(225,201,158,.18))
      }
      .cafasso-resource-viewer__kicker{
        color:#987344;font:850 9px/1.2 Inter,system-ui,sans-serif;letter-spacing:.17em;text-transform:uppercase
      }
      .cafasso-resource-viewer__meta h2{
        margin:8px 0 9px;color:#31271f;font:500 34px/1.03 Georgia,serif;overflow-wrap:anywhere
      }
      .cafasso-resource-viewer__type{
        display:inline-flex;margin:0 0 16px;padding:6px 8px;border:1px solid rgba(126,91,49,.25);
        border-radius:999px;background:rgba(255,255,255,.4);color:#725a3c;
        font:800 9px/1 Inter,system-ui,sans-serif;text-transform:uppercase;letter-spacing:.08em
      }
      .cafasso-resource-viewer__description{
        margin:0 0 18px;color:#615142;font:14px/1.58 Georgia,serif
      }
      .cafasso-resource-viewer__hint{
        margin:17px 0 0;padding-top:14px;border-top:1px solid rgba(111,78,45,.18);
        color:#7c6c5d;font:700 10px/1.45 Inter,system-ui,sans-serif
      }
      .cafasso-resource-viewer__actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:20px}
      .cafasso-resource-viewer__action{
        display:inline-flex;align-items:center;justify-content:center;min-height:39px;padding:10px 13px;
        border:1px solid rgba(103,76,44,.28);border-radius:999px;background:#fff9e9;color:#3d4f47;
        text-decoration:none;font:850 10px/1 Inter,system-ui,sans-serif;cursor:pointer
      }
      .cafasso-resource-viewer__action--primary{background:#b99b55;border-color:#b99b55;color:#203631}
      .cafasso-resource-viewer__stage{
        position:relative;min-width:0;min-height:0;display:grid;place-items:center;padding:20px;
        background:linear-gradient(145deg,#18383b,#0e292d)
      }
      .cafasso-resource-viewer__frame{
        width:100%;height:100%;min-height:0;border:1px solid rgba(244,216,137,.28);border-radius:8px;
        background:#f8f2e7;box-shadow:0 12px 34px rgba(0,0,0,.25)
      }
      iframe.cafasso-resource-viewer__frame{border:0}
      img.cafasso-resource-viewer__frame{object-fit:contain;background:#111}
      video.cafasso-resource-viewer__frame{object-fit:contain;background:#000}
      .cafasso-resource-viewer__fallback{
        width:min(520px,90%);padding:26px;text-align:center;border:1px solid rgba(244,216,137,.3);
        border-radius:10px;background:rgba(11,37,41,.8);color:#f5ecd8
      }
      .cafasso-resource-viewer__fallback strong{display:block;font:500 25px/1.08 Georgia,serif}
      .cafasso-resource-viewer__fallback span{display:block;margin-top:9px;color:#cbd9d1;font:11px/1.5 Inter,system-ui,sans-serif}
      .cafasso-resource-viewer__close{
        position:absolute;right:12px;top:10px;z-index:4;width:38px;height:38px;border:1px solid rgba(92,64,38,.2);
        border-radius:50%;background:rgba(255,249,232,.78);color:#5e4a38;font:28px/1 Georgia,serif;cursor:pointer
      }
      @media(max-width:760px){
        .cafasso-resource-viewer{place-items:stretch;padding:0}
        .cafasso-resource-viewer__book{
          width:100%;height:100dvh;border:0;border-radius:0;grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr);
          background:#f4e7ce
        }
        .cafasso-resource-viewer__book:before{display:none}
        .cafasso-resource-viewer__meta{padding:22px 56px 17px 20px;max-height:39dvh}
        .cafasso-resource-viewer__meta h2{font-size:27px}
        .cafasso-resource-viewer__description{font-size:13px;margin-bottom:11px}
        .cafasso-resource-viewer__hint{margin-top:11px;padding-top:10px}
        .cafasso-resource-viewer__actions{margin-top:12px}
        .cafasso-resource-viewer__stage{padding:10px;min-height:0}
        .cafasso-resource-viewer__close{position:fixed;right:max(10px,env(safe-area-inset-right));top:max(10px,env(safe-area-inset-top))}
      }
      @media(max-height:560px) and (orientation:landscape){
        .cafasso-resource-viewer__book{height:100dvh;width:100vw;border-radius:0;grid-template-columns:260px minmax(0,1fr)}
        .cafasso-resource-viewer__meta{padding:24px 18px 18px 68px;max-height:none}
        .cafasso-resource-viewer__meta h2{font-size:25px}
        .cafasso-resource-viewer__description{font-size:12px}
        .cafasso-resource-viewer__stage{padding:9px}
      }
      @media(prefers-reduced-motion:reduce){.cafasso-resource-viewer{backdrop-filter:none}}
    `;
    document.head.appendChild(style);
  }

  function viewerEmbedUrl(rawUrl) {
    const url = String(rawUrl || '').trim();
    if (!url) return '';
    try {
      const parsed = new URL(url, location.href);
      const host = parsed.hostname.toLowerCase();
      const youtube = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/);
      if (youtube) return `https://www.youtube.com/embed/${youtube[1]}?rel=0`;
      if (host.includes('drive.google.com')) {
        const file = parsed.pathname.match(/\/file\/d\/([^/]+)/);
        if (file) return `https://drive.google.com/file/d/${file[1]}/preview`;
        const presentation = parsed.pathname.match(/\/presentation\/d\/([^/]+)/);
        if (presentation) return `https://docs.google.com/presentation/d/${presentation[1]}/embed?start=false&loop=false&delayms=3000`;
        const documentId = parsed.pathname.match(/\/(?:document|spreadsheets)\/d\/([^/]+)/);
        if (documentId) return url.replace(/\/(edit|view)(?:\?.*)?$/, '/preview');
      }
      if (host.includes('canva.com') && !parsed.searchParams.has('embed')) {
        parsed.searchParams.set('embed', '1');
        return parsed.toString();
      }
      return parsed.toString();
    } catch (error) {
      return url;
    }
  }

  function resourceViewerKind(resource) {
    const type = String(resource?.tipo || '').toLowerCase();
    const url = String(resource?.url || '').toLowerCase().split('?')[0].split('#')[0];
    if (type.includes('imagen') || /\.(png|jpe?g|webp|gif|svg)$/.test(url)) return 'image';
    if (/youtube\.com|youtu\.be/.test(String(resource?.url || '').toLowerCase())) return 'youtube';
    if (type.includes('video') || /\.(mp4|webm|mov|m4v)$/.test(url)) return 'video';
    if (type.includes('pdf') || /\.pdf$/.test(url)) return 'document';
    return 'document';
  }

  function closeResourceViewer() {
    const viewer = document.getElementById('cafassoResourceViewer');
    if (!viewer) return;
    viewer.hidden = true;
    const stage = viewer.querySelector('[data-resource-viewer-stage]');
    if (stage) stage.innerHTML = '';
    document.body.classList.remove('cafasso-resource-viewer-open');
    viewer._returnFocus?.focus?.();
  }

  function ensureResourceViewer() {
    ensureViewerStyles();
    let viewer = document.getElementById('cafassoResourceViewer');
    if (viewer) return viewer;

    viewer = document.createElement('section');
    viewer.id = 'cafassoResourceViewer';
    viewer.className = 'cafasso-resource-viewer';
    viewer.hidden = true;
    viewer.innerHTML = `
      <article class="cafasso-resource-viewer__book" role="dialog" aria-modal="true" aria-labelledby="cafassoResourceViewerTitle">
        <button class="cafasso-resource-viewer__close" type="button" aria-label="Cerrar recurso" data-resource-viewer-close>×</button>
        <aside class="cafasso-resource-viewer__meta">
          <div class="cafasso-resource-viewer__kicker" data-resource-viewer-category>Biblioteca CAFASSO</div>
          <h2 id="cafassoResourceViewerTitle" data-resource-viewer-title>Recurso</h2>
          <span class="cafasso-resource-viewer__type" data-resource-viewer-type>Documento</span>
          <p class="cafasso-resource-viewer__description" data-resource-viewer-description></p>
          <div class="cafasso-resource-viewer__actions">
            <a class="cafasso-resource-viewer__action cafasso-resource-viewer__action--primary" data-resource-viewer-original target="_blank" rel="noopener noreferrer">Abrir original ↗</a>
            <button class="cafasso-resource-viewer__action" type="button" data-resource-viewer-close>Volver a la Biblioteca</button>
          </div>
          <p class="cafasso-resource-viewer__hint">El recurso se abre dentro de CAFASSO siempre que la fuente lo permita. Algunos sitios externos bloquean la vista integrada; en ese caso podés usar “Abrir original”.</p>
        </aside>
        <div class="cafasso-resource-viewer__stage" data-resource-viewer-stage></div>
      </article>`;

    viewer.querySelectorAll('[data-resource-viewer-close]').forEach(button => button.addEventListener('click', closeResourceViewer));
    viewer.addEventListener('click', event => { if (event.target === viewer) closeResourceViewer(); });
    document.body.appendChild(viewer);
    return viewer;
  }

  function openResourceViewer(resource, returnFocus) {
    if (!resource?.url) return;
    const viewer = ensureResourceViewer();
    const stage = viewer.querySelector('[data-resource-viewer-stage]');
    const title = viewer.querySelector('[data-resource-viewer-title]');
    const category = viewer.querySelector('[data-resource-viewer-category]');
    const type = viewer.querySelector('[data-resource-viewer-type]');
    const description = viewer.querySelector('[data-resource-viewer-description]');
    const original = viewer.querySelector('[data-resource-viewer-original]');
    const kind = resourceViewerKind(resource);
    const embedUrl = viewerEmbedUrl(resource.url);

    if (title) title.textContent = resource.titulo || 'Recurso';
    if (category) category.textContent = resource.categoria ? `Biblioteca · ${resource.categoria}` : 'Biblioteca CAFASSO';
    if (type) type.textContent = resource.tipo || 'Documento';
    if (description) {
      description.textContent = resource.descripcion || 'Un material de la Biblioteca CAFASSO.';
      description.hidden = !description.textContent;
    }
    if (original) original.href = resource.url;

    if (stage) {
      stage.innerHTML = '';
      let content;
      if (kind === 'image') {
        content = document.createElement('img');
        content.src = resource.url;
        content.alt = resource.titulo || 'Recurso';
      } else if (kind === 'video' && !/youtube\.com|youtu\.be/i.test(resource.url)) {
        content = document.createElement('video');
        content.src = resource.url;
        content.controls = true;
        content.playsInline = true;
        content.preload = 'metadata';
      } else {
        content = document.createElement('iframe');
        content.src = embedUrl;
        content.title = resource.titulo || 'Recurso';
        content.loading = 'eager';
        content.allow = 'autoplay; clipboard-write; encrypted-media; picture-in-picture; fullscreen';
        content.referrerPolicy = 'strict-origin-when-cross-origin';
        content.setAttribute('allowfullscreen', '');
      }
      content.className = 'cafasso-resource-viewer__frame';
      content.addEventListener('error', () => {
        stage.innerHTML = '<div class="cafasso-resource-viewer__fallback"><strong>No pudimos mostrar este recurso acá.</strong><span>La fuente puede estar bloqueando la vista integrada. Usá “Abrir original” para verlo directamente.</span></div>';
      }, { once:true });
      stage.appendChild(content);
    }

    viewer._returnFocus = returnFocus || document.activeElement;
    viewer.hidden = false;
    document.body.classList.add('cafasso-resource-viewer-open');
    viewer.querySelector('[data-resource-viewer-close]')?.focus();
  }

  function createBook(resource, index) {
    const slot = resolveSlot(resource, index);
    const href = resource.url;
    const book = document.createElement('button');
    const seed = resource.categoria || resource.id || resource.titulo;

    book.className = 'cafasso-resource-book';
    book.type = 'button';
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
      book.addEventListener('click', event => {
        event.preventDefault();
        openResourceViewer(resource, book);
      });
    } else {
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
  window.addEventListener('cafasso:resources-realign', () => alignShelfToLibraryImage());
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) loadLibrary();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !document.getElementById('cafassoResourceViewer')?.hidden) {
      closeResourceViewer();
    }
  });

  window.addEventListener('storage', event => {
    if (event.key === 'cafasso-resources-updated') loadLibrary();
  });

  setInterval(() => {
    if (!document.hidden && onLibraryScreen()) loadLibrary();
  }, REFRESH_MS);
})();
