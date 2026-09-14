(() => {
  const COLLECTION_ID = 'cafasso-recursos';
  const OAUTH_CLIENT_ID = 'c4378c2e-b8fa-4e76-b0e1-7fbd7336de44';
  const TOKEN_URL = 'https://www.wixapis.com/oauth2/token';
  const QUERY_URL = 'https://www.wixapis.com/data/v2/items/query';
  const TOKEN_CACHE_KEY = 'cafasso-wix-visitor-token-v1';
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

  function bookColor(resource) {
    const seed = resource.categoria || resource.id || resource.titulo;
    return COLORS[hashText(seed) % COLORS.length];
  }

  function bookHeight(resource, index) {
    return 72 + (hashText(resource.id || resource.titulo || index) % 24);
  }

  function resourceUrl(resource) {
    return resource.url || resource.archivo || '';
  }

  function createBook(resource, index) {
    const href = resourceUrl(resource);
    const book = document.createElement(href ? 'a' : 'button');
    book.className = 'cafasso-resource-book';
    book.style.setProperty('--book-color', bookColor(resource));
    book.style.setProperty('--book-height', `${bookHeight(resource, index)}%`);
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
    shelf.innerHTML = '';

    const visible = resources.filter(resource => resource && resource.mostrarEnBiblioteca === true);
    if (!visible.length) return;

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
  }

  async function getVisitorToken() {
    try {
      const cached = JSON.parse(sessionStorage.getItem(TOKEN_CACHE_KEY) || 'null');
      if (cached?.accessToken && Number(cached.expiresAt || 0) > Date.now() + 60000) return cached.accessToken;
    } catch (error) {}

    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: OAUTH_CLIENT_ID, grantType: 'anonymous' })
    });
    if (!response.ok) throw new Error(`Wix OAuth ${response.status}`);
    const payload = await response.json();
    if (!payload?.access_token) throw new Error('Wix OAuth no devolvió access_token');

    try {
      sessionStorage.setItem(TOKEN_CACHE_KEY, JSON.stringify({
        accessToken: payload.access_token,
        expiresAt: Date.now() + Number(payload.expires_in || 3600) * 1000
      }));
    } catch (error) {}

    return payload.access_token;
  }

  async function load() {
    if (new URLSearchParams(location.search).get('space') !== 'recursos') return;
    const shelf = document.querySelector('[data-resource-shelf]');
    if (!shelf) return;

    try {
      const accessToken = await getVisitorToken();
      const response = await fetch(QUERY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': accessToken
        },
        body: JSON.stringify({
          dataCollectionId: COLLECTION_ID,
          query: { paging: { limit: 1000, offset: 0 } }
        })
      });
      if (!response.ok) throw new Error(`Wix Data ${response.status}`);
      const payload = await response.json();
      const resources = Array.isArray(payload?.dataItems)
        ? payload.dataItems.map(item => ({ id: item.id, ...(item.data || {}) }))
        : [];
      render(resources);
    } catch (error) {
      console.warn('CAFASSO: no se pudo cargar Recursos desde Wix CMS.', error);
    }
  }

  setTimeout(load, 250);
})();
