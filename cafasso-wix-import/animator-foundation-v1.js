(() => {
  const app = document.getElementById('app');
  if (!app) return;

  document.body.className = 'cafasso-foundation';

  const space = new URLSearchParams(location.search).get('space') || 'house';
  const PARROQUIA_BG = 'https://static.wixstatic.com/media/47bf07_b411bebc79644a0092920abb58a2f56d~mv2.png';
  const ESCUELA_BG = 'https://static.wixstatic.com/media/47bf07_481618e0256044f9b31ae360a03a9169~mv2.png';
  const RECURSOS_BG = 'https://static.wixstatic.com/media/47bf07_8451eada7d72451a854df7cae47a80b6~mv2.png';
  const BITACORA_IMG = 'https://static.wixstatic.com/media/47bf07_20750dc35c6f4678b865413ce34ec1fe~mv2.png';
  const RESOURCE_API = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoCourse';
  const RESOURCE_COURSE_TITLE = 'CAFASSO · Recursos internos';
  const BITACORA_KEY = 'cafasso-bitacora-v1';

  const isAdmin = (() => {
    const datasetRole = String(document.documentElement.dataset.cafassoRole || '').toLowerCase();
    if (datasetRole.includes('admin')) return true;
    try {
      const session = JSON.parse(localStorage.getItem('cafassoSession') || '{}');
      return String(session?.user?.role || '').toLowerCase().includes('admin');
    } catch (error) {
      return false;
    }
  })();

  const RESOURCE_COLORS = [
    '#744936', '#3f5e53', '#6c5a38', '#584967', '#7b3f45',
    '#355765', '#6d513f', '#4f603f', '#734f2f', '#4f4d6f'
  ];

  if (space === 'patio') {
    app.innerHTML = '<main class="cafasso-patio"><img class="cafasso-patio__image" src="https://static.wixstatic.com/media/47bf07_2465a68b3ac64824b43bc20531ce6fd4~mv2.png" alt="Patio salesiano CAFASSO"><button class="cafasso-space-link cafasso-space-link--patio-home" data-space="house" type="button">Casa</button><button class="cafasso-space-link cafasso-space-link--patio-escuela" data-space="escuela" type="button">Escuela</button><button class="cafasso-space-link cafasso-space-link--patio-parroquia" data-space="parroquia" type="button">Parroquia</button></main>';
  } else if (space === 'parroquia') {
    app.innerHTML = `<main class="cafasso-parroquia"><img class="cafasso-parroquia__image" src="${PARROQUIA_BG}" alt="Espacio Parroquia de CAFASSO"><button class="cafasso-space-link cafasso-space-link--parroquia-patio" data-space="patio" type="button">Patio</button></main>`;
  } else if (space === 'escuela') {
    app.innerHTML = `<main class="cafasso-escuela"><img class="cafasso-escuela__image" src="${ESCUELA_BG}" alt="Espacio Escuela de CAFASSO"><button class="cafasso-space-link cafasso-space-link--escuela-patio" data-space="patio" type="button">Patio</button></main>`;
  } else if (space === 'recursos') {
    app.innerHTML = `
      <main class="cafasso-recursos">
        <img class="cafasso-recursos__image" src="${RECURSOS_BG}" alt="Biblioteca de Recursos CAFASSO">
        <button class="cafasso-space-link cafasso-space-link--recursos-home" data-space="house" type="button">Casa</button>
        <div class="cafasso-recursos__shelf" data-resource-shelf aria-label="Biblioteca de recursos"></div>
      </main>`;
  } else {
    app.innerHTML = `
      <main class="cafasso-house">
        <img class="cafasso-house__image" src="./assets/cafasso-casa-interior-v2.jpg" alt="Interior cálido de la Casa CAFASSO">
        ${isAdmin ? '<a class="cafasso-admin-home-link" href="./admin.html" aria-label="Ir al perfil de administrador">⚙ Administrador</a>' : ''}
        <button class="cafasso-space-link cafasso-space-link--casa" data-space="patio" type="button">Patio</button>
        <button class="cafasso-space-link cafasso-space-link--house-recursos" data-space="recursos" type="button">Recursos</button>
        <button class="cafasso-bitacora-object" data-action="bitacora-open" type="button" aria-label="Abrir Bitácora">
          <img src="${BITACORA_IMG}" alt="Bitácora">
        </button>
        <section class="cafasso-bitacora-panel" data-bitacora-panel hidden aria-label="Bitácora personal">
          <div class="cafasso-bitacora-book" role="dialog" aria-modal="true" aria-labelledby="cafasso-bitacora-title">
            <button class="cafasso-bitacora-close" data-action="bitacora-close" type="button" aria-label="Cerrar Bitácora">×</button>
            <div class="cafasso-bitacora-kicker">Mi camino en CAFASSO</div>
            <h2 id="cafasso-bitacora-title">Bitácora</h2>
            <p class="cafasso-bitacora-prompt">Un lugar para guardar lo que vas descubriendo, sintiendo y aprendiendo en el camino.</p>
            <textarea class="cafasso-bitacora-text" data-bitacora-text placeholder="Escribí acá..." aria-label="Escribir en la Bitácora"></textarea>
            <div class="cafasso-bitacora-footer">
              <span data-bitacora-status>Tu texto queda guardado en este dispositivo.</span>
              <button class="cafasso-bitacora-save" data-action="bitacora-save" type="button">Guardar</button>
            </div>
          </div>
        </section>
      </main>`;
  }

  app.querySelectorAll('[data-space]').forEach((button) => {
    button.addEventListener('click', () => {
      const next = new URL(location.href);
      if (button.dataset.space === 'house') next.searchParams.delete('space');
      else next.searchParams.set('space', button.dataset.space);
      location.href = next.toString();
    });
  });

  function hashText(value) {
    let hash = 0;
    const textValue = String(value || 'recurso');
    for (let i = 0; i < textValue.length; i += 1) {
      hash = ((hash << 5) - hash) + textValue.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function resourceColor(resource) {
    if (resource.color) return resource.color;
    const seed = resource.categoria || resource.id || resource.titulo;
    return RESOURCE_COLORS[hashText(seed) % RESOURCE_COLORS.length];
  }

  function resourceHeight(resource, index) {
    const seed = hashText(resource.id || resource.titulo || index);
    return 72 + (seed % 24);
  }

  function createResourceBook(resource, index) {
    const book = document.createElement(resource.url ? 'a' : 'button');
    book.className = 'cafasso-resource-book';
    book.style.setProperty('--book-color', resourceColor(resource));
    book.style.setProperty('--book-height', `${resourceHeight(resource, index)}%`);
    book.setAttribute('aria-label', resource.titulo || 'Recurso');
    book.title = [resource.titulo, resource.categoria].filter(Boolean).join(' · ');

    if (resource.url) {
      book.href = resource.url;
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

  function renderResourceLibrary(resources) {
    const shelf = app.querySelector('[data-resource-shelf]');
    if (!shelf) return;

    shelf.innerHTML = '';
    const visibleResources = resources.filter((resource) => resource && resource.mostrarEnBiblioteca === true);
    if (!visibleResources.length) return;

    const rowCount = 8;
    const rows = Array.from({ length: rowCount }, (_, index) => {
      const row = document.createElement('div');
      row.className = `cafasso-resource-row cafasso-resource-row--${index + 1}`;
      shelf.appendChild(row);
      return row;
    });

    visibleResources.forEach((resource, index) => {
      const rowIndex = Math.min(Math.floor(index / 7), rowCount - 1);
      rows[rowIndex].appendChild(createResourceBook(resource, index));
    });
  }

  async function loadResourceLibrary() {
    if (space !== 'recursos') return;
    try {
      const response = await fetch(`${RESOURCE_API}?title=${encodeURIComponent(RESOURCE_COURSE_TITLE)}`, { cache: 'no-store' });
      if (!response.ok) {
        renderResourceLibrary([]);
        return;
      }
      const payload = await response.json();
      if (!payload?.ok || !payload?.course) {
        renderResourceLibrary([]);
        return;
      }
      const contents = Array.isArray(payload.course?.modules)
        ? payload.course.modules.flatMap((module) => Array.isArray(module?.contents) ? module.contents : [])
        : [];
      const resources = contents
        .filter((block) => block?.settings?.cafassoResource === true)
        .map((block) => ({
          id: block._id,
          titulo: block.title || 'Recurso',
          categoria: block.settings?.categoria || '',
          tipo: block.settings?.resourceType || block.type || 'Documento',
          url: block.content?.body || '',
          descripcion: block.settings?.descripcion || '',
          mostrarEnBiblioteca: block.settings?.mostrarEnBiblioteca === true,
          disponibleParaCursos: block.settings?.disponibleParaCursos === true,
          cursos: Array.isArray(block.settings?.cursos) ? block.settings.cursos : []
        }));
      renderResourceLibrary(resources);
    } catch (error) {
      console.warn('CAFASSO: no se pudo cargar la biblioteca de recursos.', error);
      renderResourceLibrary([]);
    }
  }

  loadResourceLibrary();

  const panel = app.querySelector('[data-bitacora-panel]');
  const text = app.querySelector('[data-bitacora-text]');
  const status = app.querySelector('[data-bitacora-status]');

  function readBitacora() {
    if (!text) return;
    try {
      const saved = JSON.parse(localStorage.getItem(BITACORA_KEY) || '{}');
      text.value = saved.text || '';
      if (status && saved.updatedAt) {
        const when = new Date(saved.updatedAt);
        status.textContent = `Último guardado: ${when.toLocaleString('es-UY', { dateStyle: 'short', timeStyle: 'short' })}`;
      }
    } catch (e) {
      text.value = '';
    }
  }

  function openBitacora() {
    if (!panel || !text) return;
    readBitacora();
    panel.hidden = false;
    requestAnimationFrame(() => text.focus());
  }

  function closeBitacora() {
    if (!panel) return;
    panel.hidden = true;
  }

  function saveBitacora() {
    if (!text) return;
    const updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(BITACORA_KEY, JSON.stringify({ text: text.value, updatedAt }));
      if (status) status.textContent = 'Guardado recién.';
    } catch (e) {
      if (status) status.textContent = 'No se pudo guardar en este dispositivo.';
    }
  }

  app.querySelector('[data-action="bitacora-open"]')?.addEventListener('click', openBitacora);
  app.querySelector('[data-action="bitacora-close"]')?.addEventListener('click', closeBitacora);
  app.querySelector('[data-action="bitacora-save"]')?.addEventListener('click', saveBitacora);
  panel?.addEventListener('click', (event) => {
    if (event.target === panel) closeBitacora();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && panel && !panel.hidden) closeBitacora();
  });
})();
