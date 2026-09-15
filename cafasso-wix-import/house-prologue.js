(() => {
  const params = new URLSearchParams(location.search);
  if ((params.get('space') || 'house') !== 'house') return;
  if (window.__cafassoHousePrologueInstalled) return;
  window.__cafassoHousePrologueInstalled = true;

  const STYLE_ID = 'cafassoHousePrologueStyles';
  const FORCE = params.get('prologue') === '1';
  const IS_PREVIEW = Boolean(params.get('previewUser') || params.get('previewRole'));

  function readSession() {
    try { return JSON.parse(localStorage.getItem('cafassoSession') || 'null'); }
    catch (error) { return null; }
  }

  function firstName() {
    const user = readSession()?.user || {};
    const raw = String(user.name || user.nombre || '').trim();
    return raw ? raw.split(/\s+/)[0] : '';
  }

  function userKey() {
    const user = readSession()?.user || {};
    const id = String(user._id || user.id || user.email || 'animador').trim().toLowerCase();
    return `cafasso-house-prologue-v1:${id}`;
  }

  function hasSeen() {
    if (FORCE) return false;
    try { return localStorage.getItem(userKey()) === 'seen'; }
    catch (error) { return false; }
  }

  function markSeen() {
    try { localStorage.setItem(userKey(), 'seen'); }
    catch (error) {}
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      body.cafasso-prologue-open{overflow:hidden}
      body.cafasso-prologue-open .cafasso-house > :not(.cafasso-house-prologue){pointer-events:none}
      .cafasso-house-prologue{position:absolute;inset:0;z-index:80;display:flex;align-items:flex-end;padding:clamp(28px,5vw,72px);background:linear-gradient(180deg,rgba(4,12,13,.18) 0%,rgba(4,13,14,.16) 38%,rgba(4,12,13,.74) 100%);color:#fff7e7;opacity:0;transition:opacity .8s ease;pointer-events:auto}
      .cafasso-house-prologue.is-visible{opacity:1}
      .cafasso-house-prologue:before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 48% 54% at 62% 31%,rgba(255,213,135,.14),transparent 66%),linear-gradient(90deg,rgba(5,15,16,.30),transparent 58%)}
      .cafasso-house-prologue__content{position:relative;z-index:2;width:min(720px,88vw);padding-left:18px;border-left:1px solid rgba(239,199,112,.48);text-shadow:0 3px 18px rgba(0,0,0,.72)}
      .cafasso-house-prologue__kicker{margin:0 0 12px;color:#e7c983;font:800 9px/1.2 Inter,system-ui,sans-serif;letter-spacing:.22em;text-transform:uppercase}
      .cafasso-house-prologue__text{margin:0;min-height:2.5em;color:#fff9ec;font:400 clamp(29px,4.1vw,52px)/1.08 Georgia,serif;letter-spacing:-.018em;text-wrap:balance}
      .cafasso-house-prologue__hint{margin:15px 0 0;max-width:570px;color:rgba(255,247,230,.72);font:500 clamp(12px,1.25vw,15px)/1.55 Inter,system-ui,sans-serif;min-height:1.55em}
      .cafasso-house-prologue__footer{display:flex;align-items:center;gap:11px;margin-top:23px}
      .cafasso-house-prologue__next{border:1px solid rgba(238,198,104,.74);border-radius:999px;padding:10px 17px;background:rgba(25,39,35,.74);color:#fff7e7;font:800 11px/1 Inter,system-ui,sans-serif;letter-spacing:.05em;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.22);backdrop-filter:blur(5px);transition:transform .18s ease,background .18s ease}
      .cafasso-house-prologue__next:hover{transform:translateY(-2px);background:rgba(47,59,48,.9)}
      .cafasso-house-prologue__skip{border:0;background:transparent;color:rgba(255,247,230,.55);font:700 10px/1 Inter,system-ui,sans-serif;cursor:pointer;padding:10px 7px}
      .cafasso-house-prologue__dots{display:flex;gap:6px;margin-left:4px}
      .cafasso-house-prologue__dot{width:5px;height:5px;border-radius:50%;background:rgba(255,247,230,.25);transition:transform .24s ease,background .24s ease}
      .cafasso-house-prologue__dot.is-active{background:#e7c15f;transform:scale(1.35)}
      .cafasso-house-prologue__content.is-changing{opacity:0;transform:translateY(7px)}
      .cafasso-house-prologue__content{transition:opacity .28s ease,transform .28s ease}
      .cafasso-house-prologue.is-closing{opacity:0;transition-duration:.5s}
      @media(max-width:680px){
        .cafasso-house-prologue{padding:28px 22px 38px;background:linear-gradient(180deg,rgba(4,12,13,.10),rgba(4,12,13,.26) 38%,rgba(4,12,13,.84) 100%)}
        .cafasso-house-prologue__content{width:100%;padding-left:14px}
        .cafasso-house-prologue__text{font-size:31px;line-height:1.07}
        .cafasso-house-prologue__hint{font-size:12px}
        .cafasso-house-prologue__footer{flex-wrap:wrap;margin-top:19px}
      }
      @media(prefers-reduced-motion:reduce){.cafasso-house-prologue,.cafasso-house-prologue__content,.cafasso-house-prologue__next,.cafasso-house-prologue__dot{transition:none!important}}
    `;
    document.head.appendChild(style);
  }

  function boot() {
    const house = document.querySelector('.cafasso-house');
    if (!house) return false;
    if (IS_PREVIEW || hasSeen()) return true;
    if (house.querySelector('.cafasso-house-prologue')) return true;

    ensureStyles();
    const name = firstName();
    const scenes = [
      {
        text: 'Hay lugares que no se explican. Se habitan.',
        hint: 'CAFASSO empieza acá: no como una página para mirar, sino como un lugar para recorrer.'
      },
      {
        text: name ? `Esta Casa también es tuya, ${name}.` : 'Esta Casa también es tuya.',
        hint: 'Es tu punto de partida. Acá queda tu camino, tu historia y lo que vas descubriendo como animador.'
      },
      {
        text: 'Mirá alrededor. Cada cosa tiene algo para ofrecerte.',
        hint: 'Tu ficha guarda el recorrido. La Bitácora, lo que quieras recordar. La biblioteca, recursos para seguir creciendo.'
      },
      {
        text: 'Y cuando quieras salir al encuentro, abrí la puerta.',
        hint: 'El Patio, la Escuela y la Parroquia están del otro lado. Tu camino no termina en esta Casa: empieza en ella.'
      }
    ];

    let index = 0;
    let closing = false;
    const overlay = document.createElement('section');
    overlay.className = 'cafasso-house-prologue';
    overlay.setAttribute('aria-label', 'Bienvenida a CAFASSO');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = `
      <div class="cafasso-house-prologue__content">
        <div class="cafasso-house-prologue__kicker">Narrador · Bienvenido a CAFASSO</div>
        <p class="cafasso-house-prologue__text" data-prologue-text></p>
        <p class="cafasso-house-prologue__hint" data-prologue-hint></p>
        <div class="cafasso-house-prologue__footer">
          <button class="cafasso-house-prologue__next" data-prologue-next type="button">Continuar</button>
          <button class="cafasso-house-prologue__skip" data-prologue-skip type="button">Saltar introducción</button>
          <span class="cafasso-house-prologue__dots" data-prologue-dots aria-hidden="true"></span>
        </div>
      </div>`;
    house.appendChild(overlay);
    document.body.classList.add('cafasso-prologue-open');

    const content = overlay.querySelector('.cafasso-house-prologue__content');
    const text = overlay.querySelector('[data-prologue-text]');
    const hint = overlay.querySelector('[data-prologue-hint]');
    const next = overlay.querySelector('[data-prologue-next]');
    const skip = overlay.querySelector('[data-prologue-skip]');
    const dots = overlay.querySelector('[data-prologue-dots]');
    dots.innerHTML = scenes.map((_, i) => `<span class="cafasso-house-prologue__dot${i === 0 ? ' is-active' : ''}"></span>`).join('');

    function renderScene(immediate = false) {
      const scene = scenes[index];
      const apply = () => {
        text.textContent = scene.text;
        hint.textContent = scene.hint;
        dots.querySelectorAll('.cafasso-house-prologue__dot').forEach((dot, i) => dot.classList.toggle('is-active', i === index));
        next.textContent = index === scenes.length - 1 ? 'Entrar a la Casa' : 'Continuar';
        content.classList.remove('is-changing');
      };
      if (immediate || window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
        apply();
      } else {
        content.classList.add('is-changing');
        setTimeout(apply, 230);
      }
    }

    function finish() {
      if (closing) return;
      closing = true;
      markSeen();
      overlay.classList.add('is-closing');
      document.body.classList.remove('cafasso-prologue-open');
      const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
      setTimeout(() => overlay.remove(), reduced ? 0 : 510);
    }

    function advance() {
      if (index >= scenes.length - 1) return finish();
      index += 1;
      renderScene(false);
    }

    next.addEventListener('click', advance);
    skip.addEventListener('click', finish);
    overlay.addEventListener('keydown', event => {
      if (event.key === 'Escape') finish();
      if (event.key === 'Enter' && document.activeElement !== skip) advance();
    });

    renderScene(true);
    requestAnimationFrame(() => {
      overlay.classList.add('is-visible');
      next.focus({ preventScroll: true });
    });
    return true;
  }

  let attempts = 0;
  const wait = () => {
    if (boot()) return;
    if (attempts < 30) {
      attempts += 1;
      setTimeout(wait, 80);
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wait, { once: true });
  else wait();
})();
