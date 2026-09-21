(() => {
  const params = new URLSearchParams(location.search);
  if ((params.get('space') || 'house') !== 'house') return;
  if (window.__cafassoHousePersonalCornerInstalled) return;
  window.__cafassoHousePersonalCornerInstalled = true;

  const STYLE_ID = 'cafassoHousePersonalCornerStyles';
  const MAX_HISTORY_DAYS = 45;
  const MOODS = [
    { id:'energia', label:'Con energía', mark:'✦' },
    { id:'calma', label:'En calma', mark:'○' },
    { id:'cansancio', label:'Con cansancio', mark:'≋' },
    { id:'cabeza', label:'Con la cabeza llena', mark:'∿' },
    { id:'aire', label:'Con ganas de respirar', mark:'◇' }
  ];

  function json(storage, key) {
    try { return JSON.parse(storage.getItem(key) || 'null'); }
    catch (error) { return null; }
  }

  function userKey() {
    const user = json(localStorage, 'cafassoSession')?.user || {};
    return String(user?._id || user?.id || user?.email || user?.name || 'local');
  }

  function stateKey() {
    return `cafasso-house-corner-v1:${userKey()}`;
  }

  function todayKey() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function moodById(id) {
    return MOODS.find(item => item.id === id) || null;
  }

  function readState() {
    const raw = json(localStorage, stateKey()) || {};
    const entries = raw.entries && typeof raw.entries === 'object' ? raw.entries : {};
    return {
      version: 1,
      entries,
      updatedAt: String(raw.updatedAt || '')
    };
  }

  function pruneEntries(entries) {
    return Object.fromEntries(
      Object.entries(entries || {})
        .sort(([a], [b]) => b.localeCompare(a))
        .slice(0, MAX_HISTORY_DAYS)
    );
  }

  function readToday() {
    return readState().entries[todayKey()] || null;
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
    })[ch]);
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-house-corner{
        position:absolute;left:42.6%;bottom:8.8%;z-index:13;width:116px;height:82px;padding:0;border:0;
        background:transparent;cursor:pointer;transform:rotate(2.8deg);transform-origin:50% 90%;
        filter:drop-shadow(0 8px 6px rgba(37,23,13,.31));transition:transform .18s ease,filter .18s ease
      }
      .cafasso-house-corner:hover{transform:rotate(1.5deg) translateY(-4px) scale(1.035);filter:drop-shadow(0 11px 8px rgba(37,23,13,.38))}
      .cafasso-house-corner:focus-visible{outline:3px solid #efc967;outline-offset:5px;border-radius:5px}
      .cafasso-house-corner__card{
        position:absolute;inset:4px 3px 3px 4px;overflow:hidden;border:1px solid rgba(104,75,43,.42);border-radius:3px;
        background:
          radial-gradient(circle at 19% 12%,rgba(255,255,255,.38),transparent 25%),
          repeating-linear-gradient(0deg,rgba(101,70,39,.025) 0 1px,transparent 1px 7px),
          linear-gradient(145deg,#f8edcf,#ead6ad 78%,#d5b985);
        box-shadow:inset 0 0 0 2px rgba(255,251,237,.34),inset 0 0 15px rgba(102,70,39,.07)
      }
      .cafasso-house-corner__card:before{
        content:"";position:absolute;left:50%;top:-7px;width:34px;height:13px;transform:translateX(-50%) rotate(-2deg);
        border:1px solid rgba(90,70,47,.34);border-radius:2px;background:linear-gradient(180deg,rgba(231,222,194,.92),rgba(181,167,135,.88));
        box-shadow:0 2px 3px rgba(0,0,0,.16)
      }
      .cafasso-house-corner__kicker{position:absolute;left:10px;top:13px;color:#9a7552;font:800 6px/1 Inter,system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase}
      .cafasso-house-corner__mark{position:absolute;right:10px;top:12px;color:#8a3f3b;font:18px/1 Georgia,serif}
      .cafasso-house-corner__mood{
        position:absolute;left:10px;right:8px;top:30px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
        color:#543d2e;font:600 12px/1.05 Georgia,serif;text-align:left
      }
      .cafasso-house-corner__word{
        position:absolute;left:10px;right:9px;bottom:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
        color:#8b6e54;font:italic 8.5px/1.1 Georgia,serif;text-align:left
      }

      .cafasso-house-corner-panel{
        position:fixed;inset:0;z-index:2147483250;display:flex;align-items:center;justify-content:center;padding:20px;
        background:radial-gradient(circle at 50% 38%,rgba(110,80,50,.12),rgba(4,15,15,.79) 70%);backdrop-filter:blur(9px) saturate(.78)
      }
      .cafasso-house-corner-panel[hidden]{display:none!important}
      .cafasso-house-corner-sheet{
        position:relative;width:min(720px,94vw);max-height:92dvh;overflow:auto;padding:42px 46px 36px;
        border:1px solid rgba(103,72,39,.42);border-radius:8px;
        background:
          radial-gradient(circle at 86% 13%,rgba(160,118,67,.07),transparent 25%),
          repeating-linear-gradient(0deg,rgba(95,67,38,.025) 0 1px,transparent 1px 9px),
          linear-gradient(145deg,#faf1dd,#efdfbd 72%,#dfc596);
        box-shadow:0 35px 100px rgba(0,0,0,.55),inset 0 0 0 4px rgba(255,252,240,.28);
        color:#403126;font-family:Georgia,serif
      }
      .cafasso-house-corner-sheet:after{
        content:"";position:absolute;inset:13px;border:1px solid rgba(126,87,48,.08);border-radius:5px;pointer-events:none
      }
      .cafasso-house-corner-close{
        position:absolute;right:15px;top:13px;z-index:2;width:36px;height:36px;border:0;border-radius:50%;
        background:transparent;color:#765d47;font:27px/1 Georgia,serif;cursor:pointer
      }
      .cafasso-house-corner-close:hover{background:rgba(115,79,45,.08)}
      .cafasso-house-corner-kicker{position:relative;z-index:1;color:#9b734e;font:800 9px/1 Inter,system-ui,sans-serif;letter-spacing:.18em;text-transform:uppercase}
      .cafasso-house-corner-title{position:relative;z-index:1;margin:7px 0 8px;color:#4c382b;font:500 clamp(33px,5vw,46px)/1 Georgia,serif}
      .cafasso-house-corner-copy{position:relative;z-index:1;margin:0 0 25px;max-width:560px;color:#7b644f;font:italic 14px/1.5 Georgia,serif}
      .cafasso-house-corner-question{position:relative;z-index:1;margin:0 0 9px;color:#795a3e;font:700 10px/1 Inter,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase}
      .cafasso-house-corner-moods{position:relative;z-index:1;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-bottom:25px}
      .cafasso-house-corner-mood{
        min-height:82px;padding:10px 7px;border:1px solid rgba(119,82,45,.19);border-radius:5px;background:rgba(255,250,235,.32);
        color:#644b38;cursor:pointer;font:600 11px/1.25 Georgia,serif
      }
      .cafasso-house-corner-mood span{display:block;margin-bottom:7px;color:#9b5d4c;font:23px/1 Georgia,serif}
      .cafasso-house-corner-mood:hover{background:rgba(255,250,235,.58)}
      .cafasso-house-corner-mood.is-selected{border-color:rgba(126,58,52,.48);background:rgba(126,58,52,.08);color:#763a35;box-shadow:inset 0 0 0 1px rgba(126,58,52,.08)}
      .cafasso-house-corner-word-wrap{position:relative;z-index:1;margin-bottom:22px}
      .cafasso-house-corner-word{
        width:100%;padding:10px 3px 8px;border:0;border-bottom:1px solid rgba(110,76,43,.28);outline:0;background:transparent;
        color:#47362b;font:500 22px/1.25 Georgia,serif
      }
      .cafasso-house-corner-word::placeholder{color:#a68a70;font-style:italic}
      .cafasso-house-corner-actions{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:10px;padding-top:16px;border-top:1px solid rgba(117,80,44,.13)}
      .cafasso-house-corner-status{color:#8b725b;font:italic 10.5px/1.35 Georgia,serif}
      .cafasso-house-corner-buttons{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
      .cafasso-house-corner-button{
        padding:9px 14px;border:1px solid rgba(111,77,43,.3);border-radius:999px;background:rgba(255,250,238,.42);
        color:#6b4c34;font:800 9px/1 Inter,system-ui,sans-serif;letter-spacing:.04em;cursor:pointer
      }
      .cafasso-house-corner-button:hover{background:rgba(255,250,238,.72)}
      .cafasso-house-corner-button--primary{background:#72443a;border-color:#72443a;color:#fff5df}
      .cafasso-house-corner-button--primary:hover{background:#814d41}
      .cafasso-house-corner-history{position:relative;z-index:1;margin-top:17px;color:#927861;font:italic 10.5px/1.4 Georgia,serif}

      html.cafasso-mobile.cafasso-mobile-portrait body .cafasso-house-panorama .cafasso-house-corner{
        left:42.6%!important;
        bottom:8.8%!important;
        width:clamp(94px,14.2vh,116px)!important;
        height:clamp(66px,10vh,82px)!important;
        z-index:16!important;
      }

      @media(max-width:760px){
        .cafasso-house-corner-panel{padding:8px;align-items:flex-end}
        .cafasso-house-corner-sheet{width:100%;max-height:94dvh;padding:36px 22px 28px;border-radius:14px 14px 4px 4px}
        .cafasso-house-corner-moods{grid-template-columns:repeat(2,minmax(0,1fr))}
        .cafasso-house-corner-mood:last-child{grid-column:1/-1}
        .cafasso-house-corner-actions{align-items:flex-start;flex-direction:column}
        .cafasso-house-corner-buttons{width:100%;justify-content:flex-start}
      }
      @media(prefers-reduced-motion:reduce){.cafasso-house-corner{transition:none!important}}
    `;
    document.head.appendChild(style);
  }

  function renderObject(button) {
    const entry = readToday();
    const mood = moodById(entry?.mood);
    const moodLabel = mood?.label || '¿Cómo llegás hoy?';
    const mark = mood?.mark || '✦';
    const word = String(entry?.word || '').trim() || 'Hacé tuya esta Casa';
    button.innerHTML = `
      <span class="cafasso-house-corner__card">
        <span class="cafasso-house-corner__kicker">Mi rincón</span>
        <span class="cafasso-house-corner__mark" aria-hidden="true">${esc(mark)}</span>
        <strong class="cafasso-house-corner__mood">${esc(moodLabel)}</strong>
        <span class="cafasso-house-corner__word">${esc(word)}</span>
      </span>`;
  }

  function recentCount() {
    return Object.keys(readState().entries || {}).length;
  }

  function renderPanel(panel) {
    const entry = readToday() || {};
    panel.querySelectorAll('[data-house-mood]').forEach(button => {
      button.classList.toggle('is-selected', button.dataset.houseMood === entry.mood);
      button.setAttribute('aria-pressed', button.dataset.houseMood === entry.mood ? 'true' : 'false');
    });
    const word = panel.querySelector('[data-house-word]');
    if (word) word.value = String(entry.word || '');
    const history = panel.querySelector('[data-house-corner-history]');
    const count = recentCount();
    if (history) history.textContent = count
      ? `La Casa ya guarda ${count} ${count === 1 ? 'día' : 'días'} de este pequeño registro.`
      : 'Este primer gesto queda guardado sólo para vos, en tu cuenta CAFASSO.';
  }

  function openPanel(panel) {
    renderPanel(panel);
    panel.hidden = false;
    document.body.classList.add('cafasso-house-corner-open');
  }

  function closePanel(panel) {
    panel.hidden = true;
    document.body.classList.remove('cafasso-house-corner-open');
  }

  async function save(panel, object) {
    const selected = panel.querySelector('[data-house-mood].is-selected');
    const word = String(panel.querySelector('[data-house-word]')?.value || '').trim().slice(0, 40);
    const status = panel.querySelector('[data-house-corner-status]');
    if (!selected && !word) {
      if (status) status.textContent = 'Elegí cómo llegás o dejá una palabra para guardar.';
      return;
    }

    const current = readState();
    current.entries[todayKey()] = {
      mood: String(selected?.dataset.houseMood || ''),
      word,
      updatedAt: new Date().toISOString()
    };
    current.entries = pruneEntries(current.entries);
    current.updatedAt = new Date().toISOString();

    try {
      localStorage.setItem(stateKey(), JSON.stringify(current));
      if (status) status.textContent = 'Guardado · sincronizando con tu cuenta…';
      renderObject(object);
      renderPanel(panel);
      const ok = await window.CafassoUserCloud?.flush?.();
      if (status) status.textContent = ok === false
        ? 'Guardado en este equipo · se sincronizará cuando vuelva la conexión.'
        : 'Guardado en tu Casa CAFASSO.';
      window.dispatchEvent(new CustomEvent('cafasso:house-corner', { detail:{ ...current.entries[todayKey()] } }));
    } catch (error) {
      if (status) status.textContent = 'No pude guardar este momento.';
    }
  }

  function openBitacora(panel) {
    closePanel(panel);
    const book = document.querySelector('[data-action="bitacora-open"]');
    if (book) setTimeout(() => book.click(), 40);
  }

  function boot() {
    const house = document.querySelector('.cafasso-house');
    if (!house || house.dataset.personalCornerReady === '1') return false;
    house.dataset.personalCornerReady = '1';
    ensureStyles();

    const object = document.createElement('button');
    object.type = 'button';
    object.className = 'cafasso-house-corner';
    object.setAttribute('aria-label', 'Abrir mi rincón personal de Casa');
    renderObject(object);
    house.appendChild(object);

    const panel = document.createElement('section');
    panel.className = 'cafasso-house-corner-panel';
    panel.hidden = true;
    panel.setAttribute('aria-label', 'Mi rincón personal');
    panel.innerHTML = `
      <article class="cafasso-house-corner-sheet" role="dialog" aria-modal="true" aria-labelledby="cafassoHouseCornerTitle">
        <button class="cafasso-house-corner-close" type="button" data-house-corner-close aria-label="Cerrar">×</button>
        <div class="cafasso-house-corner-kicker">Casa · un lugar para volver</div>
        <h2 class="cafasso-house-corner-title" id="cafassoHouseCornerTitle">¿Cómo llegás hoy?</h2>
        <p class="cafasso-house-corner-copy">No hay respuestas correctas ni premios por sentir una cosa u otra. Es apenas una forma de dejar una pequeña marca de cómo estás entrando hoy a CAFASSO.</p>

        <div class="cafasso-house-corner-question">Hoy llego…</div>
        <div class="cafasso-house-corner-moods">
          ${MOODS.map(mood => `<button class="cafasso-house-corner-mood" type="button" data-house-mood="${mood.id}" aria-pressed="false"><span aria-hidden="true">${mood.mark}</span>${mood.label}</button>`).join('')}
        </div>

        <div class="cafasso-house-corner-question">Una palabra que quiero llevarme</div>
        <div class="cafasso-house-corner-word-wrap">
          <input class="cafasso-house-corner-word" data-house-word type="text" maxlength="40" autocomplete="off" placeholder="Una palabra, una intención, algo breve…">
        </div>

        <div class="cafasso-house-corner-actions">
          <span class="cafasso-house-corner-status" data-house-corner-status>Tu rincón se guarda en tu cuenta CAFASSO.</span>
          <div class="cafasso-house-corner-buttons">
            <button class="cafasso-house-corner-button" type="button" data-house-open-bitacora>Abrir Bitácora</button>
            <button class="cafasso-house-corner-button cafasso-house-corner-button--primary" type="button" data-house-corner-save>Guardar en mi Casa</button>
          </div>
        </div>
        <div class="cafasso-house-corner-history" data-house-corner-history></div>
      </article>`;
    document.body.appendChild(panel);

    object.addEventListener('click', () => openPanel(panel));
    panel.querySelector('[data-house-corner-close]')?.addEventListener('click', () => closePanel(panel));
    panel.addEventListener('click', event => { if (event.target === panel) closePanel(panel); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !panel.hidden) closePanel(panel);
    });

    panel.querySelectorAll('[data-house-mood]').forEach(button => {
      button.addEventListener('click', () => {
        panel.querySelectorAll('[data-house-mood]').forEach(item => {
          item.classList.toggle('is-selected', item === button);
          item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
        });
      });
    });

    panel.querySelector('[data-house-corner-save]')?.addEventListener('click', () => save(panel, object));
    panel.querySelector('[data-house-open-bitacora]')?.addEventListener('click', () => openBitacora(panel));

    window.addEventListener('storage', event => {
      if (event.key === stateKey()) renderObject(object);
    });
    window.addEventListener('cafasso:user-cloud-hydrated', () => renderObject(object));

    return true;
  }

  let attempts = 0;
  const wait = () => {
    if (boot()) return;
    if (attempts < 50) {
      attempts += 1;
      setTimeout(wait, 80);
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wait, { once:true });
  else wait();
})();