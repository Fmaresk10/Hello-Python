(() => {
  const params = new URLSearchParams(location.search);
  if ((params.get('space') || 'house') !== 'house') return;
  if (window.__cafassoAcompananteBitacoraInstalled) return;
  window.__cafassoAcompananteBitacoraInstalled = true;

  const MIN_ALMITAS = 600;
  const STYLE_ID = 'cafassoAcompananteBitacoraStyles';
  const UNLOCK_ID = 'acompanante-bitacora-marker';
  let unlocked = false;
  let companionActive = false;

  function json(storage, key) {
    try { return JSON.parse(storage.getItem(key) || 'null'); }
    catch (error) { return null; }
  }

  function user() { return json(localStorage, 'cafassoSession')?.user || {}; }
  function userKey() {
    const current = user();
    return String(current?._id || current?.id || current?.email || current?.name || 'local');
  }
  function stateKey() { return `cafasso-acompanante-v1:${userKey()}`; }
  function seenKey() { return `cafasso-world-unlocks-v1:${userKey()}`; }

  function readSeen() { return json(localStorage, seenKey()) || {}; }
  function markSeen() {
    const state = readSeen();
    state[UNLOCK_ID] = new Date().toISOString();
    try { localStorage.setItem(seenKey(), JSON.stringify(state)); } catch (error) {}
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-acompanante-ribbon{position:absolute;z-index:7;right:20px;top:-8px;width:22px;height:70px;border-radius:2px 2px 8px 8px;background:linear-gradient(90deg,#71482c,#a06c43 46%,#643e27);box-shadow:0 4px 7px rgba(0,0,0,.32),inset 1px 0 rgba(255,224,181,.18);transform:rotate(4deg);pointer-events:none;opacity:.96}
      .cafasso-acompanante-ribbon:after{content:"◇";position:absolute;left:50%;bottom:9px;transform:translateX(-50%);color:#e5c88f;font:700 12px/1 Georgia,serif;text-shadow:0 1px 2px rgba(0,0,0,.45)}
      .cafasso-acompanante-ribbon.is-arriving{animation:cafassoAcompananteRibbon .9s cubic-bezier(.2,.8,.2,1) both}
      @keyframes cafassoAcompananteRibbon{0%{opacity:0;transform:translateY(-28px) rotate(1deg)}70%{opacity:1;transform:translateY(3px) rotate(5deg)}100%{opacity:.96;transform:translateY(0) rotate(4deg)}}
      .cafasso-acompanante-toast{position:fixed;z-index:2147483275;left:50%;bottom:28px;max-width:min(520px,88vw);padding:12px 17px;border:1px solid rgba(232,195,114,.48);border-radius:999px;background:rgba(8,38,36,.96);box-shadow:0 14px 30px rgba(0,0,0,.35);color:#fff1ce;text-align:center;font:800 10px/1.3 Inter,system-ui,sans-serif;letter-spacing:.035em;opacity:0;transform:translate(-50%,16px);transition:.22s opacity,.22s transform;pointer-events:none}
      .cafasso-acompanante-toast.show{opacity:1;transform:translate(-50%,0)}
      .cafasso-bitacora-tabs{display:flex;gap:8px;margin:0 0 18px;position:relative;z-index:2}
      .cafasso-bitacora-tab{border:1px solid rgba(111,78,45,.28);border-radius:999px;padding:7px 11px;background:rgba(255,248,229,.42);color:#725438;font:800 9px/1 Inter,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}
      .cafasso-bitacora-tab.is-active{background:#765034;color:#fff4dc;border-color:#765034;box-shadow:0 3px 7px rgba(74,46,27,.13)}
      .cafasso-acompanante-page{display:grid;grid-template-columns:1fr 1fr;gap:14px 18px;min-height:324px;padding:2px 5px 0;position:relative;z-index:1}
      .cafasso-acompanante-intro{grid-column:1/-1;margin:0;color:#6f5944;font:15px/1.48 Georgia,serif}
      .cafasso-acompanante-field{display:flex;flex-direction:column;gap:6px}
      .cafasso-acompanante-field:first-of-type{grid-column:1/-1}
      .cafasso-acompanante-field label{color:#8b694a;font:850 9px/1.2 Inter,system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase}
      .cafasso-acompanante-field textarea{width:100%;min-height:98px;resize:none;border:0;border-bottom:1px solid rgba(111,78,45,.2);outline:0;padding:7px 4px;background:transparent;color:#3a3028;font:16px/1.45 Georgia,serif;caret-color:#78552f}
      .cafasso-acompanante-field:first-of-type textarea{min-height:70px}
      .cafasso-acompanante-footnote{grid-column:1/-1;margin-top:1px;color:#8a7259;font:italic 12px/1.4 Georgia,serif}
      @media(max-width:680px){.cafasso-acompanante-ribbon{right:13px;top:-6px;width:17px;height:52px}.cafasso-acompanante-page{grid-template-columns:1fr;min-height:0;gap:12px}.cafasso-acompanante-intro,.cafasso-acompanante-field:first-of-type,.cafasso-acompanante-footnote{grid-column:1}.cafasso-acompanante-field textarea{min-height:86px}.cafasso-bitacora-tabs{margin-bottom:13px}.cafasso-acompanante-toast{bottom:18px}}
      @media(prefers-reduced-motion:reduce){.cafasso-acompanante-ribbon.is-arriving{animation:none!important}.cafasso-acompanante-toast{transition:none!important}}
    `;
    document.head.appendChild(style);
  }

  function showToast() {
    document.querySelector('.cafasso-acompanante-toast')?.remove();
    const toast = document.createElement('div');
    toast.className = 'cafasso-acompanante-toast';
    toast.textContent = 'La Bitácora cambió · ahora también guarda a quienes vas acompañando';
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => toast.classList.remove('show'), 3200);
    setTimeout(() => toast.remove(), 3550);
  }

  function readState() {
    const raw = json(localStorage, stateKey()) || {};
    return {
      person: String(raw.person || ''),
      seeing: String(raw.seeing || ''),
      learning: String(raw.learning || ''),
      updatedAt: String(raw.updatedAt || '')
    };
  }

  function saveState() {
    const page = document.querySelector('[data-acompanante-page]');
    if (!page) return;
    const state = {
      person: String(page.querySelector('[data-acompanante-person]')?.value || '').trim(),
      seeing: String(page.querySelector('[data-acompanante-seeing]')?.value || '').trim(),
      learning: String(page.querySelector('[data-acompanante-learning]')?.value || '').trim(),
      updatedAt: new Date().toISOString()
    };
    try { localStorage.setItem(stateKey(), JSON.stringify(state)); } catch (error) {}
    const status = document.querySelector('[data-bitacora-status]');
    if (status) status.textContent = 'Acompañamiento guardado · sincronizando…';
    window.CafassoUserCloud?.flush?.().then(ok => {
      if (status) status.textContent = ok ? 'Acompañamiento guardado en tu cuenta CAFASSO.' : 'Guardado en este equipo · se sincronizará al recuperar conexión.';
    });
    window.dispatchEvent(new CustomEvent('cafasso:acompanante-bitacora', { detail: state }));
  }

  function hydratePage() {
    const page = document.querySelector('[data-acompanante-page]');
    if (!page) return;
    const state = readState();
    const person = page.querySelector('[data-acompanante-person]');
    const seeing = page.querySelector('[data-acompanante-seeing]');
    const learning = page.querySelector('[data-acompanante-learning]');
    if (person) person.value = state.person;
    if (seeing) seeing.value = state.seeing;
    if (learning) learning.value = state.learning;
  }

  function setTab(mode) {
    const mainPrompt = document.querySelector('.cafasso-bitacora-prompt');
    const mainText = document.querySelector('[data-bitacora-text]');
    const companion = document.querySelector('[data-acompanante-page]');
    const save = document.querySelector('[data-action="bitacora-save"]');
    document.querySelectorAll('.cafasso-bitacora-tab').forEach(button => button.classList.toggle('is-active', button.dataset.bitacoraTab === mode));
    companionActive = mode === 'acompanar';
    if (mainPrompt) mainPrompt.hidden = companionActive;
    if (mainText) mainText.hidden = companionActive;
    if (companion) companion.hidden = !companionActive;
    if (save) save.textContent = companionActive ? 'Guardar acompañamiento' : 'Guardar';
    if (companionActive) {
      hydratePage();
      setTimeout(() => companion?.querySelector('textarea')?.focus(), 30);
    }
  }

  function augmentBook() {
    const book = document.querySelector('.cafasso-bitacora-book');
    if (!book || book.dataset.acompananteReady === '1') return Boolean(book);
    book.dataset.acompananteReady = '1';

    const prompt = book.querySelector('.cafasso-bitacora-prompt');
    if (!prompt) return false;

    const tabs = document.createElement('div');
    tabs.className = 'cafasso-bitacora-tabs';
    tabs.innerHTML = '<button type="button" class="cafasso-bitacora-tab is-active" data-bitacora-tab="camino">Mi camino</button><button type="button" class="cafasso-bitacora-tab" data-bitacora-tab="acompanar">Acompañar</button>';
    prompt.insertAdjacentElement('beforebegin', tabs);

    const page = document.createElement('section');
    page.className = 'cafasso-acompanante-page';
    page.dataset.acompanantePage = '1';
    page.hidden = true;
    page.innerHTML = `
      <p class="cafasso-acompanante-intro">Acompañar empieza por aprender a mirar sin apurarse a resolver. Guardá acá alguna huella de esos vínculos que también te van formando a vos.</p>
      <div class="cafasso-acompanante-field"><label>¿A quién estoy acompañando?</label><textarea data-acompanante-person maxlength="360" placeholder="Un nombre, una situación, alguien que hoy necesita presencia…"></textarea></div>
      <div class="cafasso-acompanante-field"><label>¿Qué estoy viendo en esa persona?</label><textarea data-acompanante-seeing maxlength="700" placeholder="Algo que quizás no había visto antes…"></textarea></div>
      <div class="cafasso-acompanante-field"><label>¿Qué me está enseñando este vínculo?</label><textarea data-acompanante-learning maxlength="700" placeholder="Lo que este acompañamiento también transforma en mí…"></textarea></div>
      <div class="cafasso-acompanante-footnote">No se trata de registrar la vida del otro, sino de cuidar tu propia manera de estar cerca.</div>`;
    const footer = book.querySelector('.cafasso-bitacora-footer');
    footer?.insertAdjacentElement('beforebegin', page);

    tabs.addEventListener('click', event => {
      const button = event.target.closest('[data-bitacora-tab]');
      if (button) setTab(button.dataset.bitacoraTab || 'camino');
    });

    const save = book.querySelector('[data-action="bitacora-save"]');
    save?.addEventListener('click', event => {
      if (!companionActive) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      saveState();
    }, true);

    const close = book.querySelector('[data-action="bitacora-close"]');
    close?.addEventListener('click', () => setTab('camino'));
    hydratePage();
    return true;
  }

  function mountRibbon(announce = false) {
    const object = document.querySelector('.cafasso-bitacora-object');
    if (!object) return false;
    ensureStyles();
    let ribbon = object.querySelector('.cafasso-acompanante-ribbon');
    if (!ribbon) {
      ribbon = document.createElement('span');
      ribbon.className = 'cafasso-acompanante-ribbon';
      ribbon.setAttribute('aria-hidden', 'true');
      object.appendChild(ribbon);
    }
    const seen = readSeen();
    if (announce && !seen[UNLOCK_ID]) {
      ribbon.classList.add('is-arriving');
      showToast();
      markSeen();
      setTimeout(() => ribbon.classList.remove('is-arriving'), 1000);
    }
    augmentBook();
    return true;
  }

  function apply(total, announce = false) {
    const value = Math.max(0, Number(total || 0));
    if (!Number.isFinite(value) || value < MIN_ALMITAS) return;
    const firstUnlock = !unlocked;
    unlocked = true;
    mountRibbon(announce && firstUnlock);
  }

  function currentTotal() {
    const canonical = Number(window.CafassoAlmitasMetrics?.total);
    if (Number.isFinite(canonical)) return canonical;
    const level = Number(window.CafassoLevel?.totalAlmitas);
    if (Number.isFinite(level)) return level;
    const node = document.querySelector('[data-global-almitas] .cafasso-global-counter__value');
    const ui = Number(String(node?.textContent || '').replace(/[^0-9.-]/g, ''));
    return Number.isFinite(ui) ? ui : 0;
  }

  function boot() {
    ensureStyles();
    [250, 700, 1400].forEach(delay => setTimeout(() => apply(currentTotal(), false), delay));
    window.addEventListener('cafasso:almitas-total', event => apply(event?.detail?.total, true));
    window.addEventListener('cafasso:level-update', event => apply(event?.detail?.totalAlmitas, true));
    window.addEventListener('focus', () => apply(currentTotal(), false));
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') apply(currentTotal(), false);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
