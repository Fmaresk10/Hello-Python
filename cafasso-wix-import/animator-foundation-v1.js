(() => {
  const app = document.getElementById('app');
  if (!app) return;

  document.body.className = 'cafasso-foundation';

  const space = new URLSearchParams(location.search).get('space') || 'house';
  const HOUSE_BG = 'https://static.wixstatic.com/media/47bf07_32fab0f8b4a444808b0f577cf89e2196~mv2.png';
  const PATIO_BG = 'https://static.wixstatic.com/media/47bf07_794847b8f87d4577a04e10fb9adf630c~mv2.png';
  const PARROQUIA_BG = 'https://static.wixstatic.com/media/47bf07_1c9e484e5ec8490781a6e54d6c262e1a~mv2.png';
  const ESCUELA_IMAGES = {
    morning: 'https://static.wixstatic.com/media/47bf07_a8d33103cb5a4effb8af4af5d7a38c17~mv2.png',
    afternoon: 'https://static.wixstatic.com/media/47bf07_3248c27ab7aa4fe5847c319c7e250cc4~mv2.png',
    sunset: 'https://static.wixstatic.com/media/47bf07_2323847daa184448bdc3b4e6543b6c43~mv2.png',
    night: 'https://static.wixstatic.com/media/47bf07_5a9befdb2e4c41b5960e7476b971e655~mv2.png'
  };
  const URUGUAY_SUNRISE = [5.70,6.05,6.45,6.95,7.30,7.55,7.52,7.15,6.55,5.95,5.55,5.45];
  const URUGUAY_SUNSET  = [20.10,19.75,19.15,18.40,18.00,17.72,17.80,18.05,18.45,18.88,19.35,19.85];

  function cafassoInterpolateMonth(date, values) {
    const month = date.getMonth();
    const next = (month + 1) % 12;
    const days = new Date(date.getFullYear(), month + 1, 0).getDate();
    const t = Math.max(0, Math.min(1, (date.getDate() - 1) / days));
    return values[month] + (values[next] - values[month]) * t;
  }

  function cafassoInitialPeriod(date = new Date()) {
    const hour = date.getHours() + date.getMinutes() / 60;
    const sunrise = cafassoInterpolateMonth(date, URUGUAY_SUNRISE);
    const sunset = cafassoInterpolateMonth(date, URUGUAY_SUNSET);
    const morningStart = sunrise - 0.20;
    const sunsetStart = sunset - 1.05;
    const nightStart = sunset + 0.25;
    if (hour >= morningStart && hour < 12) return 'morning';
    if (hour >= 12 && hour < sunsetStart) return 'afternoon';
    if (hour >= sunsetStart && hour < nightStart) return 'sunset';
    return 'night';
  }

  const ESCUELA_BG = ESCUELA_IMAGES[cafassoInitialPeriod()] || ESCUELA_IMAGES.afternoon;
  const RECURSOS_BG = 'https://static.wixstatic.com/media/47bf07_8451eada7d72451a854df7cae47a80b6~mv2.png';
  const BITACORA_IMG = 'https://static.wixstatic.com/media/47bf07_20750dc35c6f4678b865413ce34ec1fe~mv2.png';
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

  if (space === 'patio') {
    app.innerHTML = '<main class="cafasso-patio"><img class="cafasso-patio__image" src="${PATIO_BG}" alt="Patio salesiano CAFASSO"><button class="cafasso-space-link cafasso-space-link--patio-home" data-space="house" type="button">Casa</button><button class="cafasso-space-link cafasso-space-link--patio-escuela" data-space="escuela" type="button">Escuela</button><button class="cafasso-space-link cafasso-space-link--patio-parroquia" data-space="parroquia" type="button">Parroquia</button></main>';
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
        <img class="cafasso-house__image" src="${HOUSE_BG}" alt="Casa CAFASSO, espacio cálido de encuentro y acompañamiento">
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

  // La Biblioteca de Recursos tiene un único renderizador dedicado:
  // wix-resources-cms.js. No dibujamos libros acá para evitar dobles posiciones.

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
