(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('space') !== 'patio') return;
  if (window.__cafassoPatioEncounterAloneInstalled) return;
  window.__cafassoPatioEncounterAloneInstalled = true;

  const STYLE_ID = 'cafassoPatioEncounterAloneStyles';
  const ENCOUNTER_ID = 'guri-solo-v1';

  const RESPONSES = {
    cerca: {
      title: 'Te quedás cerca.',
      text: 'No decís demasiado. Después de un rato te pregunta quién está jugando. A veces la primera puerta no es una pregunta: es compartir el mismo lugar.'
    },
    nombre: {
      title: 'Le preguntás su nombre.',
      text: 'La respuesta es corta. Un rato después volvés a nombrarlo y levanta la mirada. Ser visto también puede empezar por algo tan simple como que alguien recuerde tu nombre.'
    },
    invitar: {
      title: 'Le hacés lugar.',
      text: 'Mira al grupo, duda y no se levanta enseguida. Pero ahora sabe que alguien lo tuvo en cuenta. Hay invitaciones que necesitan quedar abiertas antes de poder ser aceptadas.'
    }
  };

  function json(storage, key) {
    try { return JSON.parse(storage.getItem(key) || 'null'); }
    catch (error) { return null; }
  }

  function userKey() {
    const user = json(localStorage, 'cafassoSession')?.user || {};
    return String(user?._id || user?.id || user?.email || user?.name || 'local');
  }

  function storageKey() {
    return `cafasso-patio-encounters-v1:${userKey()}`;
  }

  function readState() {
    const state = json(localStorage, storageKey());
    return state && typeof state === 'object' ? state : {};
  }

  function writeChoice(choice) {
    const state = readState();
    state[ENCOUNTER_ID] = {
      choice,
      updatedAt: new Date().toISOString()
    };
    try { localStorage.setItem(storageKey(), JSON.stringify(state)); }
    catch (error) {}
    Promise.resolve(window.CafassoUserCloud?.flush?.()).catch(() => {});
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-patio-encounter-alone{
        position:absolute;left:72.5%;bottom:10.7%;z-index:14;width:92px;height:118px;padding:0;border:0;
        background:transparent;cursor:pointer;touch-action:manipulation;filter:drop-shadow(0 12px 8px rgba(0,0,0,.35));
        transition:transform .2s ease,filter .2s ease,opacity .2s ease;
      }
      .cafasso-patio-encounter-alone:hover,.cafasso-patio-encounter-alone:focus-visible{
        transform:translateY(-3px) scale(1.025);filter:drop-shadow(0 15px 10px rgba(0,0,0,.42)) brightness(1.06);outline:none;
      }
      .cafasso-patio-encounter-alone:before{
        content:"";position:absolute;left:13%;right:7%;bottom:5px;height:13px;border-radius:50%;
        background:radial-gradient(ellipse at center,rgba(20,18,14,.34),rgba(20,18,14,.16) 48%,transparent 74%);
        filter:blur(3px);pointer-events:none;transform:rotate(-4deg);
      }
      .cafasso-patio-encounter-alone__photo{
        position:absolute;left:0;right:0;bottom:4px;width:100%;height:calc(100% - 4px);object-fit:contain;object-position:center bottom;
        display:block;pointer-events:none;transform:translateZ(0);
        filter:drop-shadow(0 7px 5px rgba(0,0,0,.26)) saturate(.92) contrast(1.02);
        transition:filter .2s ease;
      }
      html[data-cafasso-period="morning"] .cafasso-patio-encounter-alone__photo{
        filter:drop-shadow(0 7px 5px rgba(0,0,0,.25)) saturate(.88) brightness(1.03) contrast(1.01);
      }
      html[data-cafasso-period="afternoon"] .cafasso-patio-encounter-alone__photo{
        filter:drop-shadow(0 7px 5px rgba(0,0,0,.27)) saturate(.90) brightness(.98) contrast(1.03);
      }
      html[data-cafasso-period="sunset"] .cafasso-patio-encounter-alone__photo{
        filter:drop-shadow(0 8px 6px rgba(0,0,0,.34)) saturate(.82) sepia(.10) brightness(.88) contrast(1.05);
      }
      html[data-cafasso-period="night"] .cafasso-patio-encounter-alone__photo{
        filter:drop-shadow(0 8px 7px rgba(0,0,0,.48)) saturate(.58) brightness(.56) contrast(1.10);
      }
      .cafasso-patio-encounter-alone:hover .cafasso-patio-encounter-alone__photo,
      .cafasso-patio-encounter-alone:focus-visible .cafasso-patio-encounter-alone__photo{
        filter:drop-shadow(0 9px 7px rgba(0,0,0,.32)) saturate(.96) brightness(1.025) contrast(1.03);
      }
      .cafasso-patio-encounter-alone__hint{
        position:absolute;left:50%;bottom:-19px;transform:translateX(-50%) translateY(3px);width:max-content;
        padding:5px 8px;border:1px solid rgba(234,200,128,.28);border-radius:999px;
        background:rgba(10,35,33,.88);box-shadow:0 6px 14px rgba(0,0,0,.2);color:#f5e7c6;
        font:800 6.5px/1 Inter,system-ui,sans-serif;letter-spacing:.11em;text-transform:uppercase;
        opacity:0;pointer-events:none;transition:opacity .18s ease,transform .18s ease;
      }
      .cafasso-patio-encounter-alone:hover .cafasso-patio-encounter-alone__hint,
      .cafasso-patio-encounter-alone:focus-visible .cafasso-patio-encounter-alone__hint{
        opacity:1;transform:translateX(-50%) translateY(0);
      }
      .cafasso-patio-encounter-alone.is-met{opacity:.82}
      .cafasso-patio-encounter-alone.is-met:after{
        content:"";position:absolute;right:7px;top:2px;width:8px;height:8px;border-radius:50%;
        background:#e7c871;box-shadow:0 0 0 4px rgba(231,200,113,.09),0 0 14px rgba(231,200,113,.28);
      }

      .cafasso-patio-encounter-layer{
        position:fixed;inset:0;z-index:2147483275;display:grid;place-items:center;padding:22px;
        background:radial-gradient(circle at 50% 35%,rgba(110,80,50,.10),rgba(4,17,17,.78) 72%);
        backdrop-filter:blur(7px);-webkit-backdrop-filter:blur(7px);opacity:0;transition:opacity .2s ease;
      }
      .cafasso-patio-encounter-layer.is-visible{opacity:1}
      .cafasso-patio-encounter-card{
        position:relative;width:min(650px,93vw);padding:38px 40px 32px;border:1px solid rgba(117,82,46,.38);border-radius:8px;
        background:
          radial-gradient(circle at 84% 12%,rgba(154,111,61,.08),transparent 24%),
          repeating-linear-gradient(0deg,rgba(93,66,37,.025) 0 1px,transparent 1px 9px),
          linear-gradient(145deg,#faf0d9,#ecd9b5 72%,#ddc18f);
        box-shadow:0 30px 80px rgba(0,0,0,.5),inset 0 0 0 3px rgba(255,250,235,.27);
        color:#403126;font-family:Georgia,serif;
      }
      .cafasso-patio-encounter-close{
        position:absolute;right:14px;top:12px;width:35px;height:35px;border:0;border-radius:50%;background:transparent;
        color:#705a47;font:27px/1 Georgia,serif;cursor:pointer;
      }
      .cafasso-patio-encounter-close:hover{background:rgba(112,78,43,.08)}
      .cafasso-patio-encounter-kicker{
        color:#956f48;font:800 8px/1 Inter,system-ui,sans-serif;letter-spacing:.18em;text-transform:uppercase;
      }
      .cafasso-patio-encounter-card h2{
        margin:7px 0 13px;color:#3d2e24;font:500 clamp(30px,5vw,43px)/1.02 Georgia,serif;letter-spacing:-.02em;
      }
      .cafasso-patio-encounter-scene{
        margin:0 0 24px;max-width:555px;color:#695341;font:15px/1.55 Georgia,serif;
      }
      .cafasso-patio-encounter-question{
        margin:0 0 10px;color:#826342;font:800 9px/1 Inter,system-ui,sans-serif;letter-spacing:.11em;text-transform:uppercase;
      }
      .cafasso-patio-encounter-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
      .cafasso-patio-encounter-option{
        min-height:86px;padding:13px 11px;border:1px solid rgba(106,75,42,.23);border-radius:6px;
        background:rgba(255,250,235,.38);color:#584230;cursor:pointer;text-align:left;
        font:600 12px/1.32 Georgia,serif;transition:transform .16s ease,background .16s ease,border-color .16s ease;
      }
      .cafasso-patio-encounter-option:hover,.cafasso-patio-encounter-option:focus-visible{
        transform:translateY(-2px);background:rgba(255,250,235,.72);border-color:rgba(115,73,50,.43);outline:none;
      }
      .cafasso-patio-encounter-option span{
        display:block;margin-bottom:8px;color:#985f4e;font:800 7px/1 Inter,system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;
      }
      .cafasso-patio-encounter-result{display:none}
      .cafasso-patio-encounter-card.is-result .cafasso-patio-encounter-choices{display:none}
      .cafasso-patio-encounter-card.is-result .cafasso-patio-encounter-result{display:block}
      .cafasso-patio-encounter-result h3{margin:1px 0 12px;color:#463429;font:600 25px/1.08 Georgia,serif}
      .cafasso-patio-encounter-result p{margin:0 0 13px;color:#68513f;font:15px/1.55 Georgia,serif}
      .cafasso-patio-encounter-reflection{
        margin-top:20px;padding-top:17px;border-top:1px solid rgba(112,78,43,.16);
        color:#896c51;font:italic 13px/1.5 Georgia,serif;
      }
      .cafasso-patio-encounter-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:20px}
      .cafasso-patio-encounter-action{
        padding:9px 14px;border:1px solid rgba(105,73,41,.28);border-radius:999px;background:rgba(255,250,236,.44);
        color:#684b35;font:800 8px/1 Inter,system-ui,sans-serif;letter-spacing:.05em;cursor:pointer;
      }
      .cafasso-patio-encounter-action--primary{background:#72443a;border-color:#72443a;color:#fff3da}
      .cafasso-patio-encounter-action:hover{filter:brightness(1.04)}
      @media(max-width:680px){
        .cafasso-patio-encounter-card{padding:34px 22px 26px}
        .cafasso-patio-encounter-options{grid-template-columns:1fr}
        .cafasso-patio-encounter-option{min-height:0;padding:12px}
        .cafasso-patio-encounter-scene,.cafasso-patio-encounter-result p{font-size:14px}
      }
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-patio-panorama .cafasso-patio-encounter-alone{
        left:69%!important;bottom:9.4%!important;width:92px!important;height:118px!important;z-index:16!important;
      }
      @media(prefers-reduced-motion:reduce){
        .cafasso-patio-encounter-alone,.cafasso-patio-encounter-hint,.cafasso-patio-encounter-layer,.cafasso-patio-encounter-option{transition:none!important}
      }
    `;
    document.head.appendChild(style);
  }

  function closeLayer(layer) {
    if (!layer) return;
    layer.classList.remove('is-visible');
    setTimeout(() => layer.remove(), 210);
  }

  function openEncounter(trigger) {
    document.querySelector('.cafasso-patio-encounter-layer')?.remove();
    const previous = readState()[ENCOUNTER_ID]?.choice || '';
    const layer = document.createElement('div');
    layer.className = 'cafasso-patio-encounter-layer';
    layer.innerHTML = `
      <article class="cafasso-patio-encounter-card" role="dialog" aria-modal="true" aria-labelledby="cafasso-patio-encounter-title">
        <button class="cafasso-patio-encounter-close" type="button" aria-label="Cerrar">×</button>
        <div class="cafasso-patio-encounter-kicker">Patio · una escena</div>
        <h2 id="cafasso-patio-encounter-title">Alguien quedó al margen</h2>
        <p class="cafasso-patio-encounter-scene">El patio está lleno de movimiento. Cerca de un costado, un gurí mira el juego pero no se acerca. No sabés qué le pasa. Solo notaste que está ahí.</p>
        <div class="cafasso-patio-encounter-choices">
          <div class="cafasso-patio-encounter-question">¿Cómo te acercás?</div>
          <div class="cafasso-patio-encounter-options">
            <button class="cafasso-patio-encounter-option" type="button" data-encounter-choice="cerca"><span>Quedarte</span>Me siento cerca, sin apurar la conversación.</button>
            <button class="cafasso-patio-encounter-option" type="button" data-encounter-choice="nombre"><span>Reconocer</span>Le pregunto su nombre y cómo viene la tarde.</button>
            <button class="cafasso-patio-encounter-option" type="button" data-encounter-choice="invitar"><span>Hacer lugar</span>Le digo que, si quiere, puede venir conmigo al grupo.</button>
          </div>
        </div>
        <div class="cafasso-patio-encounter-result" aria-live="polite">
          <h3 data-encounter-result-title></h3>
          <p data-encounter-result-text></p>
          <div class="cafasso-patio-encounter-reflection">En el Patio, acompañar no siempre es resolver. Muchas veces empieza por notar, acercarse y dejar lugar.</div>
          <div class="cafasso-patio-encounter-actions">
            <button class="cafasso-patio-encounter-action cafasso-patio-encounter-action--primary" type="button" data-encounter-close>Volver al Patio</button>
            <button class="cafasso-patio-encounter-action" type="button" data-encounter-again>Probar otra forma</button>
          </div>
        </div>
      </article>`;
    document.body.appendChild(layer);

    const card = layer.querySelector('.cafasso-patio-encounter-card');
    const showResult = choice => {
      const response = RESPONSES[choice];
      if (!response) return;
      card.classList.add('is-result');
      layer.querySelector('[data-encounter-result-title]').textContent = response.title;
      layer.querySelector('[data-encounter-result-text]').textContent = response.text;
      writeChoice(choice);
      trigger.classList.add('is-met');
    };

    layer.querySelectorAll('[data-encounter-choice]').forEach(button => {
      button.addEventListener('click', () => showResult(button.dataset.encounterChoice));
    });
    layer.querySelector('[data-encounter-again]')?.addEventListener('click', () => card.classList.remove('is-result'));
    layer.querySelector('[data-encounter-close]')?.addEventListener('click', () => closeLayer(layer));
    layer.querySelector('.cafasso-patio-encounter-close')?.addEventListener('click', () => closeLayer(layer));
    layer.addEventListener('click', event => { if (event.target === layer) closeLayer(layer); });

    const onKey = event => {
      if (event.key !== 'Escape') return;
      document.removeEventListener('keydown', onKey);
      closeLayer(layer);
    };
    document.addEventListener('keydown', onKey, { once:false });

    if (previous && RESPONSES[previous]) showResult(previous);
    requestAnimationFrame(() => layer.classList.add('is-visible'));
  }

  function mount() {
    const patio = document.querySelector('.cafasso-patio');
    if (!patio || patio.querySelector('[data-patio-encounter-alone]')) return Boolean(patio);
    ensureStyles();

    const person = document.createElement('button');
    person.type = 'button';
    person.className = 'cafasso-patio-encounter-alone';
    person.dataset.patioEncounterAlone = '1';
    person.setAttribute('aria-label', 'Acercarme al gurí que está solo');
    person.innerHTML = `
      <img class="cafasso-patio-encounter-alone__photo" src="https://static.wixstatic.com/media/47bf07_43f6a7d900034fe09fbaded2852ef6c5~mv2.png" alt="" aria-hidden="true">
      <span class="cafasso-patio-encounter-alone__hint">Acercarme</span>`;
    if (readState()[ENCOUNTER_ID]?.choice) person.classList.add('is-met');
    person.addEventListener('click', () => openEncounter(person));
    patio.appendChild(person);
    window.CafassoPatioPanorama?.refresh?.();
    return true;
  }

  let attempts = 0;
  const boot = () => {
    if (mount()) return;
    if (attempts < 40) {
      attempts += 1;
      setTimeout(boot, 80);
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();