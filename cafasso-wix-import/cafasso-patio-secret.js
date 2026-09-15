(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('space') !== 'patio') return;
  if (window.__cafassoPatioSecretInstalled) return;
  window.__cafassoPatioSecretInstalled = true;

  const ME_API = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoMe';
  const PROGRESS_API = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoProgress';
  const COURSE_ID = '__cafasso_exploration__';
  const MODULE_ID = '__world__';
  const TOTAL_SECRETS = 4;
  const SECRET_ID = 'patio-bosco-presence';
  const STYLE_ID = 'cafassoPatioSecretStyles';

  function json(storage, key) {
    try { return JSON.parse(storage.getItem(key) || 'null'); }
    catch (error) { return null; }
  }

  function sessionUser() {
    return json(localStorage, 'cafassoSession')?.user || {};
  }

  function userKey() {
    const user = sessionUser();
    return String(user?._id || user?.id || user?.email || user?.name || 'local');
  }

  function storageKey() {
    return `cafasso-exploration-v1:${userKey()}`;
  }

  function authHeaders(withJson = false) {
    const auth = json(localStorage, 'cafassoAuth');
    if (!auth?.sessionToken || Number(auth.expiresAt || 0) <= Date.now()) return null;
    const headers = { Authorization: `Bearer ${auth.sessionToken}` };
    if (withJson) headers['Content-Type'] = 'application/json';
    return headers;
  }

  function emptyState() {
    return { version: 1, discoveries: [], updatedAt: '' };
  }

  function normalizeState(raw) {
    const state = raw && typeof raw === 'object' ? raw : emptyState();
    return {
      version: 1,
      discoveries: Array.isArray(state.discoveries) ? state.discoveries.filter(item => item?.id) : [],
      updatedAt: String(state.updatedAt || '')
    };
  }

  function readLocal() {
    return normalizeState(json(localStorage, storageKey()));
  }

  function writeLocal(state) {
    try { localStorage.setItem(storageKey(), JSON.stringify(state)); }
    catch (error) {}
  }

  function mergeStates(localState, remoteState) {
    const rows = [...(localState?.discoveries || []), ...(remoteState?.discoveries || [])];
    const unique = new Map();
    rows.forEach(row => {
      if (!row?.id) return;
      const previous = unique.get(row.id);
      if (!previous || String(row.foundAt || '') > String(previous.foundAt || '')) unique.set(row.id, row);
    });
    return normalizeState({
      discoveries: [...unique.values()],
      updatedAt: String(remoteState?.updatedAt || localState?.updatedAt || '')
    });
  }

  function hasDiscovery(state, id) {
    return Boolean((state?.discoveries || []).some(item => item.id === id));
  }

  async function readRemote() {
    const headers = authHeaders(false);
    const user = sessionUser();
    const userId = String(user?._id || user?.id || '');
    if (!headers || !userId) return null;
    try {
      const response = await fetch(ME_API, { headers, cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.ok === false) return null;
      const row = (Array.isArray(data?.progress) ? data.progress : []).find(item =>
        String(item?.courseId || '') === COURSE_ID && (!item?.userId || String(item.userId) === userId)
      );
      return normalizeState(row?.blockAnswers?.explorationState || null);
    } catch (error) {
      return null;
    }
  }

  async function persist(state) {
    writeLocal(state);
    const headers = authHeaders(true);
    const user = sessionUser();
    const userId = String(user?._id || user?.id || '');
    if (!headers || !userId) return false;
    try {
      const completedBlocks = state.discoveries.map(item => item.id);
      const response = await fetch(PROGRESS_API, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId,
          courseId: COURSE_ID,
          moduleId: MODULE_ID,
          completed: completedBlocks.length >= TOTAL_SECRETS,
          percent: Math.min(100, Math.round((completedBlocks.length / TOTAL_SECRETS) * 100)),
          completedBlocks,
          blockAnswers: { explorationState: state }
        })
      });
      const result = await response.json().catch(() => ({}));
      return Boolean(response.ok && result?.ok !== false);
    } catch (error) {
      return false;
    }
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-patio-secret{
        position:absolute;left:48%;top:40.5%;z-index:7;width:8.5%;height:19%;
        min-width:54px;min-height:88px;padding:0;border:0;background:transparent;
        cursor:pointer;outline:none;overflow:visible;touch-action:manipulation;
      }
      .cafasso-patio-secret:before{
        content:"";position:absolute;left:28%;right:24%;bottom:7%;height:3px;border-radius:999px;
        background:linear-gradient(90deg,transparent,rgba(244,210,132,.9),transparent);
        box-shadow:0 0 11px rgba(244,210,132,.42);opacity:0;transform:scaleX(.55);
        transition:opacity .22s ease,transform .22s ease;pointer-events:none;
      }
      .cafasso-patio-secret:hover:before,.cafasso-patio-secret:focus-visible:before{
        opacity:.62;transform:scaleX(1);
      }
      .cafasso-patio-secret.is-found:before{opacity:.22;transform:scaleX(.72)}
      .cafasso-patio-secret.is-whispering:before{animation:cafassoPatioSecretWhisper 1.35s ease-in-out 2}
      @keyframes cafassoPatioSecretWhisper{
        0%,100%{opacity:0;transform:scaleX(.45)}
        50%{opacity:.48;transform:scaleX(.92);box-shadow:0 0 15px rgba(244,210,132,.52)}
      }

      .cafasso-patio-secret-layer{
        position:fixed;inset:0;z-index:2147483200;display:grid;place-items:center;padding:24px;
        background:rgba(5,18,18,.61);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);
        opacity:0;transition:opacity .22s ease;
      }
      .cafasso-patio-secret-layer.is-visible{opacity:1}
      .cafasso-patio-plaque{
        position:relative;width:min(560px,90vw);padding:42px 42px 34px;border:1px solid rgba(226,193,117,.44);
        border-radius:8px;background:linear-gradient(145deg,#5a452d,#2f2e25 54%,#1d2c29);
        box-shadow:0 30px 70px rgba(0,0,0,.48),inset 0 1px rgba(255,238,191,.16),inset 0 0 45px rgba(197,147,64,.08);
        color:#fff3d4;transform:translateY(8px) scale(.985);transition:transform .24s ease;
        font-family:Georgia,serif;
      }
      .cafasso-patio-secret-layer.is-visible .cafasso-patio-plaque{transform:translateY(0) scale(1)}
      .cafasso-patio-plaque:before,.cafasso-patio-plaque:after{
        content:"";position:absolute;width:7px;height:7px;border-radius:50%;background:#b58a4b;
        box-shadow:inset 0 1px rgba(255,255,255,.28),0 1px 3px rgba(0,0,0,.45);
      }
      .cafasso-patio-plaque:before{left:16px;top:16px}
      .cafasso-patio-plaque:after{right:16px;bottom:16px}
      .cafasso-patio-secret-close{
        position:absolute;right:13px;top:11px;width:34px;height:34px;border:0;border-radius:50%;
        background:rgba(255,255,255,.07);color:#f9e7bb;font:26px/1 Georgia,serif;cursor:pointer;
      }
      .cafasso-patio-secret-kicker{color:#e7c67a;font:850 9px/1.2 Inter,system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase}
      .cafasso-patio-plaque h2{margin:9px 0 14px;color:#fff0c8;font:500 clamp(31px,5vw,43px)/1 Georgia,serif}
      .cafasso-patio-plaque p{margin:0;color:rgba(255,245,221,.84);font:17px/1.58 Georgia,serif}
      .cafasso-patio-plaque p+p{margin-top:14px}
      .cafasso-patio-secret-progress{
        display:flex;align-items:center;gap:9px;margin-top:25px;padding-top:14px;border-top:1px solid rgba(237,207,143,.18);
        color:#e2c783;font:800 10px/1.2 Inter,system-ui,sans-serif;letter-spacing:.05em;text-transform:uppercase;
      }
      .cafasso-patio-secret-progress b{
        display:grid;place-items:center;width:27px;height:27px;border:1px solid rgba(235,204,133,.45);border-radius:50%;
        background:rgba(215,168,83,.14);color:#ffe5a6;font:850 11px/1 Inter,system-ui,sans-serif;
      }
      .cafasso-patio-secret-toast{
        position:fixed;z-index:2147483199;left:50%;bottom:28px;transform:translate(-50%,18px);
        padding:10px 15px;border:1px solid rgba(242,201,90,.44);border-radius:999px;background:rgba(8,36,37,.92);
        box-shadow:0 10px 24px rgba(0,0,0,.3);color:#fff5d9;font:800 10px/1.2 Inter,system-ui,sans-serif;
        letter-spacing:.04em;opacity:0;transition:opacity .25s ease,transform .25s ease;pointer-events:none;
      }
      .cafasso-patio-secret-toast.show{opacity:1;transform:translate(-50%,0)}
      .cafasso-patio-secret-spark{
        position:fixed;z-index:2147483201;width:6px;height:6px;border-radius:50%;background:#e4bd69;
        box-shadow:0 0 8px rgba(228,189,105,.72);pointer-events:none;animation:cafassoPatioSecretSpark .8s ease-out forwards;
      }
      @keyframes cafassoPatioSecretSpark{to{opacity:0;transform:translate(var(--dx),var(--dy)) scale(.2)}}

      @media(max-width:680px){
        .cafasso-patio-secret{left:46.5%;top:40%;width:12%;height:20%;min-width:42px;min-height:74px}
        .cafasso-patio-plaque{padding:38px 24px 27px}.cafasso-patio-plaque p{font-size:15px}
        .cafasso-patio-secret-toast{bottom:18px;max-width:88vw;text-align:center}
      }
      @media(prefers-reduced-motion:reduce){
        .cafasso-patio-secret:before,.cafasso-patio-secret-layer,.cafasso-patio-plaque,.cafasso-patio-secret-toast{transition:none!important}
        .cafasso-patio-secret.is-whispering:before,.cafasso-patio-secret-spark{animation:none!important}
      }
    `;
    document.head.appendChild(style);
  }

  function makeSparks(origin) {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) return;
    const rect = origin?.getBoundingClientRect?.();
    const x = rect ? rect.left + rect.width / 2 : innerWidth / 2;
    const y = rect ? rect.top + rect.height * .78 : innerHeight / 2;
    for (let i = 0; i < 12; i += 1) {
      const spark = document.createElement('i');
      spark.className = 'cafasso-patio-secret-spark';
      spark.style.left = `${x}px`;
      spark.style.top = `${y}px`;
      const angle = (Math.PI * 2 * i) / 12;
      const distance = 24 + Math.random() * 38;
      spark.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
      spark.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
      document.body.appendChild(spark);
      setTimeout(() => spark.remove(), 900);
    }
  }

  function showToast(text) {
    document.querySelector('.cafasso-patio-secret-toast')?.remove();
    const toast = document.createElement('div');
    toast.className = 'cafasso-patio-secret-toast';
    toast.textContent = text;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => toast.classList.remove('show'), 2600);
    setTimeout(() => toast.remove(), 3000);
  }

  function showPlaque(state) {
    document.querySelector('.cafasso-patio-secret-layer')?.remove();
    const layer = document.createElement('div');
    layer.className = 'cafasso-patio-secret-layer';
    const count = state.discoveries.length;
    layer.innerHTML = `
      <article class="cafasso-patio-plaque" role="dialog" aria-modal="true" aria-labelledby="cafasso-patio-secret-title">
        <button class="cafasso-patio-secret-close" type="button" aria-label="Cerrar">×</button>
        <div class="cafasso-patio-secret-kicker">Secreto encontrado · Patio</div>
        <h2 id="cafasso-patio-secret-title">Estar ahí</h2>
        <p>Don Bosco no miraba la vida de los jóvenes desde lejos. Se quedaba en medio del patio: escuchando, riendo, acompañando.</p>
        <p>A veces, la presencia es la primera forma de educar.</p>
        <div class="cafasso-patio-secret-progress"><b>${count}</b><span>${count === 1 ? 'descubrimiento guardado' : 'descubrimientos guardados'} · el mundo lo recuerda</span></div>
      </article>`;
    document.body.appendChild(layer);
    const close = () => {
      layer.classList.remove('is-visible');
      setTimeout(() => layer.remove(), 240);
    };
    layer.querySelector('.cafasso-patio-secret-close')?.addEventListener('click', close);
    layer.addEventListener('click', event => { if (event.target === layer) close(); });
    const onKey = event => {
      if (event.key !== 'Escape') return;
      document.removeEventListener('keydown', onKey);
      close();
    };
    document.addEventListener('keydown', onKey);
    requestAnimationFrame(() => layer.classList.add('is-visible'));
  }

  async function discover(state, secret) {
    const firstTime = !hasDiscovery(state, SECRET_ID);
    if (firstTime) {
      state.discoveries.push({
        id: SECRET_ID,
        space: 'patio',
        title: 'Estar ahí',
        foundAt: new Date().toISOString()
      });
      state.updatedAt = new Date().toISOString();
      secret.classList.add('is-found');
      secret.setAttribute('aria-label', 'Reabrir secreto descubierto del Patio');
      makeSparks(secret);
      showToast('✦ Secreto descubierto · el Patio guarda tu huella');
      await persist(state);
      window.dispatchEvent(new CustomEvent('cafasso:exploration-update', { detail: state }));
    }
    showPlaque(state);
  }

  function mountSecret(state) {
    const patio = document.querySelector('.cafasso-patio');
    if (!patio || patio.querySelector(`[data-cafasso-secret="${SECRET_ID}"]`)) return false;
    ensureStyles();
    const secret = document.createElement('button');
    secret.type = 'button';
    secret.className = 'cafasso-patio-secret';
    secret.dataset.cafassoSecret = SECRET_ID;
    secret.setAttribute('aria-label', hasDiscovery(state, SECRET_ID)
      ? 'Reabrir secreto descubierto del Patio'
      : 'Detalle oculto en el Patio');
    if (hasDiscovery(state, SECRET_ID)) secret.classList.add('is-found');
    patio.appendChild(secret);
    secret.addEventListener('click', () => discover(state, secret));

    if (!hasDiscovery(state, SECRET_ID)) {
      setTimeout(() => {
        if (document.visibilityState === 'visible' && document.body.contains(secret)) {
          secret.classList.add('is-whispering');
          setTimeout(() => secret.classList.remove('is-whispering'), 3000);
        }
      }, 7800);
    }
    return true;
  }

  async function boot() {
    ensureStyles();
    let state = readLocal();
    let attempts = 0;
    const mount = () => {
      if (mountSecret(state)) return;
      if (attempts < 35) {
        attempts += 1;
        setTimeout(mount, 90);
      }
    };
    mount();

    const remote = await readRemote();
    if (!remote) return;
    const merged = mergeStates(state, remote);
    const changed = JSON.stringify(merged) !== JSON.stringify(state);
    state = merged;
    writeLocal(state);
    const secret = document.querySelector(`[data-cafasso-secret="${SECRET_ID}"]`);
    if (secret && hasDiscovery(state, SECRET_ID)) {
      secret.classList.add('is-found');
      secret.setAttribute('aria-label', 'Reabrir secreto descubierto del Patio');
    }
    if (changed) window.dispatchEvent(new CustomEvent('cafasso:exploration-update', { detail: state }));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
