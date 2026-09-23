(() => {
  const app = document.getElementById('app');
  if (!app) return;

  document.body.className = 'cafasso-foundation';

  const space = new URLSearchParams(location.search).get('space') || 'house';
  const TIME_IMAGES = {
    house: {
      morning: 'https://static.wixstatic.com/media/47bf07_a80080c806984cfaaa53b5d16aa89731~mv2.jpg',
      afternoon: 'https://static.wixstatic.com/media/47bf07_9bc5db4bdd144670b58b89d62684b300~mv2.jpg',
      sunset: 'https://static.wixstatic.com/media/47bf07_32fab0f8b4a444808b0f577cf89e2196~mv2.png',
      night: 'https://static.wixstatic.com/media/47bf07_35127a444ffb4f3ab1f669abc21c067d~mv2.jpg'
    },
    patio: {
      morning: 'https://static.wixstatic.com/media/47bf07_1b5565dca9f446b38de8a368dfc8c4f3~mv2.png',
      afternoon: 'https://static.wixstatic.com/media/47bf07_794847b8f87d4577a04e10fb9adf630c~mv2.png',
      sunset: 'https://static.wixstatic.com/media/47bf07_2ffcd3027228450c9c7487350e067bdd~mv2.png',
      night: 'https://static.wixstatic.com/media/47bf07_e63b403b8b64424c981b1169ddb04fe2~mv2.png'
    },
    parroquia: {
      morning: 'https://static.wixstatic.com/media/47bf07_f64cd4cb65ad4fccb885553d8121dae0~mv2.png',
      afternoon: 'https://static.wixstatic.com/media/47bf07_1c9e484e5ec8490781a6e54d6c262e1a~mv2.png',
      sunset: 'https://static.wixstatic.com/media/47bf07_36ab84721e95485587152a40d3adce64~mv2.png',
      night: 'https://static.wixstatic.com/media/47bf07_18a734a77ca94196970c4be45eb416ff~mv2.png'
    },
    escuela: {
      morning: 'https://static.wixstatic.com/media/47bf07_a8d33103cb5a4effb8af4af5d7a38c17~mv2.png',
      afternoon: 'https://static.wixstatic.com/media/47bf07_3248c27ab7aa4fe5847c319c7e250cc4~mv2.png',
      sunset: 'https://static.wixstatic.com/media/47bf07_2323847daa184448bdc3b4e6543b6c43~mv2.png',
      night: 'https://static.wixstatic.com/media/47bf07_5a9befdb2e4c41b5960e7476b971e655~mv2.png'
    }
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

  const INITIAL_PERIOD = cafassoInitialPeriod();
  document.documentElement.dataset.cafassoPeriod = INITIAL_PERIOD;
  document.documentElement.dataset.cafassoTimeModel = 'uruguay-seasonal-bootstrap';

  function initialImageFor(targetSpace) {
    const variants = TIME_IMAGES[targetSpace];
    return variants?.[INITIAL_PERIOD] || variants?.afternoon || '';
  }

  const HOUSE_BG = initialImageFor('house');
  const PATIO_BG = initialImageFor('patio');
  const PARROQUIA_BG = initialImageFor('parroquia');
  const ESCUELA_BG = initialImageFor('escuela');

  // Empieza a descargar la escena correcta antes de montar el espacio.
  if (TIME_IMAGES[space]) {
    const preload = document.createElement('link');
    preload.rel = 'preload';
    preload.as = 'image';
    preload.href = initialImageFor(space);
    document.head.appendChild(preload);
  }

  const RECURSOS_BG = 'https://static.wixstatic.com/media/47bf07_8451eada7d72451a854df7cae47a80b6~mv2.png';
  const BITACORA_IMG = 'https://static.wixstatic.com/media/47bf07_20750dc35c6f4678b865413ce34ec1fe~mv2.png';

  function bitacoraKey() {
    if (window.CafassoUserCloud?.bitacoraKey) return window.CafassoUserCloud.bitacoraKey();
    try {
      const session = JSON.parse(localStorage.getItem('cafassoSession') || '{}');
      const user = session?.user || {};
      const key = String(user?._id || user?.id || user?.email || user?.name || 'local');
      return `cafasso-bitacora-v2:${key}`;
    } catch (error) {
      return 'cafasso-bitacora-v2:local';
    }
  }

  const worldRole = (() => {
    let realRole = 'animador';
    try {
      const session = JSON.parse(localStorage.getItem('cafassoSession') || '{}');
      realRole = String(session?.user?.role || 'Animador').toLowerCase();
    } catch (error) {}
    const requested = String(new URLSearchParams(location.search).get('previewRole') || '').toLowerCase();
    const previewUser = String(new URLSearchParams(location.search).get('previewUser') || '').trim();
    let effectiveRole = realRole;
    const realAdmin = realRole.includes('admin');
    const realFormador = realRole.includes('formador');
    if ((realAdmin || realFormador) && requested === 'animador') effectiveRole = 'animador';
    else if ((realAdmin || realFormador) && requested === 'formador') effectiveRole = 'formador';
    else if (realAdmin && requested === 'admin') effectiveRole = 'admin';
    if (realAdmin && previewUser) effectiveRole = 'animador';
    document.documentElement.dataset.cafassoRole = realAdmin ? 'admin' : realFormador ? 'formador' : 'animador';
    document.documentElement.dataset.cafassoWorldRole = effectiveRole.includes('admin') ? 'admin' : effectiveRole.includes('formador') ? 'formador' : 'animador';
    return {
      realRole,
      effectiveRole,
      isAdmin:effectiveRole.includes('admin'),
      isFormador:effectiveRole.includes('formador'),
      isAnimator:!effectiveRole.includes('admin')&&!effectiveRole.includes('formador')
    };
  })();

  const isAdmin = worldRole.isAdmin;
  const isFormador = worldRole.isFormador;
  window.CafassoWorldRole = worldRole;

  if (space === 'patio') {
    app.innerHTML = '<main class="cafasso-patio"><img class="cafasso-patio__image" src="${PATIO_BG}" alt="Patio salesiano CAFASSO"><button class="cafasso-space-link cafasso-space-link--patio-home" data-space="house" type="button">Casa</button><button class="cafasso-space-link cafasso-space-link--patio-escuela" data-space="escuela" type="button">Escuela</button><button class="cafasso-space-link cafasso-space-link--patio-parroquia" data-space="parroquia" type="button">Parroquia</button></main>';
  } else if (space === 'parroquia') {
    app.innerHTML = `<main class="cafasso-parroquia"><img class="cafasso-parroquia__image" src="${PARROQUIA_BG}" alt="Espacio Parroquia de CAFASSO"><button class="cafasso-space-link cafasso-space-link--parroquia-patio" data-space="patio" type="button">Patio</button></main>`;
  } else if (space === 'escuela') {
    app.innerHTML = `<main class="cafasso-escuela"><img class="cafasso-escuela__image" src="${ESCUELA_BG}" alt="Espacio Escuela de CAFASSO"><button class="cafasso-space-link cafasso-space-link--escuela-patio" data-space="patio" type="button">Patio</button>${isFormador ? '<a class="cafasso-formador-school-link" href="./formador.html" target="_top" aria-label="Abrir Mesa del Formador"><small>FORMADOR</small><span>Mesa de trabajo</span><b>→</b></a>' : ''}</main>`;
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
        ${isAdmin ? '<a class="cafasso-admin-home-link" href="./admin.html" target="_top" aria-label="Ir al perfil de administrador">⚙ Administrador</a>' : ''}
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
              <span data-bitacora-status>Tu Bitácora queda guardada en tu cuenta CAFASSO.</span>
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
      if (window.CafassoMobileFluid?.active) window.CafassoMobileFluid.navigate(next.toString());
      else location.href = next.toString();
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
      const saved = JSON.parse(localStorage.getItem(bitacoraKey()) || '{}');
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
      localStorage.setItem(bitacoraKey(), JSON.stringify({ text: text.value, updatedAt }));
      if (status) status.textContent = 'Guardado · sincronizando con tu cuenta…';
      window.CafassoUserCloud?.flush?.().then(ok => {
        if (status) status.textContent = ok ? 'Guardado en tu cuenta CAFASSO.' : 'Guardado en este equipo · se sincronizará al recuperar conexión.';
      });
    } catch (e) {
      if (status) status.textContent = 'No se pudo guardar la Bitácora.';
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
