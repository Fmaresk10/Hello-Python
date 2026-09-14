(() => {
  const app = document.getElementById('app');
  if (!app) return;

  document.body.className = 'cafasso-foundation';

  const space = new URLSearchParams(location.search).get('space') || 'house';
  const PARROQUIA_BG = 'https://static.wixstatic.com/media/47bf07_b411bebc79644a0092920abb58a2f56d~mv2.png';
  const ESCUELA_BG = 'https://static.wixstatic.com/media/47bf07_481618e0256044f9b31ae360a03a9169~mv2.png';
  const BITACORA_KEY = 'cafasso-bitacora-v1';

  if (space === 'patio') {
    app.innerHTML = '<main class="cafasso-patio"><img class="cafasso-patio__image" src="https://static.wixstatic.com/media/47bf07_2465a68b3ac64824b43bc20531ce6fd4~mv2.png" alt="Patio salesiano CAFASSO"><button class="cafasso-space-link cafasso-space-link--patio-home" data-space="house" type="button">Casa</button><button class="cafasso-space-link cafasso-space-link--patio-escuela" data-space="escuela" type="button">Escuela</button><button class="cafasso-space-link cafasso-space-link--patio-parroquia" data-space="parroquia" type="button">Parroquia</button></main>';
  } else if (space === 'parroquia') {
    app.innerHTML = `<main class="cafasso-parroquia"><img class="cafasso-parroquia__image" src="${PARROQUIA_BG}" alt="Espacio Parroquia de CAFASSO"><button class="cafasso-space-link cafasso-space-link--parroquia-patio" data-space="patio" type="button">Patio</button></main>`;
  } else if (space === 'escuela') {
    app.innerHTML = `<main class="cafasso-escuela"><img class="cafasso-escuela__image" src="${ESCUELA_BG}" alt="Espacio Escuela de CAFASSO"><button class="cafasso-space-link cafasso-space-link--escuela-patio" data-space="patio" type="button">Patio</button></main>`;
  } else {
    app.innerHTML = `
      <main class="cafasso-house">
        <img class="cafasso-house__image" src="./assets/cafasso-casa-interior-v2.jpg" alt="Interior cálido de la Casa CAFASSO">
        <button class="cafasso-space-link cafasso-space-link--casa" data-space="patio" type="button">Patio</button>
        <button class="cafasso-bitacora-object" data-action="bitacora-open" type="button" aria-label="Abrir Bitácora">
          <img src="./assets/cafasso-bitacora-v3.svg" alt="Bitácora">
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