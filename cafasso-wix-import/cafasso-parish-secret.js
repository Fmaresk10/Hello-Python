(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('space') !== 'parroquia') return;
  if (window.__cafassoParishSecretInstalled) return;
  window.__cafassoParishSecretInstalled = true;

  const ME_API = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoMe';
  const PROGRESS_API = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoProgress';
  const COURSE_ID = '__cafasso_exploration__';
  const MODULE_ID = '__world__';
  const TOTAL_SECRETS = 4;
  const SECRET_ID = 'parish-light-make-room';
  const STYLE_ID = 'cafassoParishSecretStyles';

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

  function normalizeState(raw) {
    const source = raw && typeof raw === 'object' ? raw : {};
    return {
      version: 1,
      discoveries: Array.isArray(source.discoveries) ? source.discoveries.filter(item => item?.id) : [],
      updatedAt: String(source.updatedAt || '')
    };
  }

  function readLocal() {
    return normalizeState(json(localStorage, storageKey()));
  }

  function writeLocal(state) {
    try { localStorage.setItem(storageKey(), JSON.stringify(normalizeState(state))); }
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

  function hasDiscovery(state) {
    return Boolean((state?.discoveries || []).some(item => item.id === SECRET_ID));
  }

  async function readRemote() {
    const headers = authHeaders(false);
    const userId = String(sessionUser()?._id || sessionUser()?.id || '');
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
    const userId = String(sessionUser()?._id || sessionUser()?.id || '');
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
          blockAnswers: { explorationState: normalizeState(state) }
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
      .cafasso-parish-secret{
        position:absolute;z-index:6;left:49.2%;top:8.2%;width:8.2%;height:15%;min-width:72px;min-height:72px;
        padding:0;border:0;background:transparent;cursor:pointer;outline:none;touch-action:manipulation;
      }
      .cafasso-parish-secret:before,.cafasso-parish-secret:after{content:"";position:absolute;left:50%;top:50%;pointer-events:none;transform:translate(-50%,-50%)}
      .cafasso-parish-secret:before{
        width:10px;height:10px;border-radius:50%;background:rgba(255,228,160,.13);
        box-shadow:0 0 12px rgba(255,220,136,.12),0 0 28px rgba(255,213,122,.08);
        transition:opacity .3s ease,box-shadow .3s ease,transform .3s ease;
      }
      .cafasso-parish-secret:after{
        width:34px;height:1px;background:linear-gradient(90deg,transparent,rgba(255,231,174,.18),transparent);
        box-shadow:0 0 6px rgba(255,222,145,.10);transform:translate(-50%,-50%) rotate(-8deg);
        transition:opacity .3s ease,filter .3s ease;
      }
      .cafasso-parish-secret:hover:before,.cafasso-parish-secret:focus-visible:before{
        background:rgba(255,236,188,.48);box-shadow:0 0 16px rgba(255,225,147,.42),0 0 38px rgba(255,213,122,.22);
        transform:translate(-50%,-50%) scale(1.18)
      }
      .cafasso-parish-secret:hover:after,.cafasso-parish-secret:focus-visible:after{opacity:.82;filter:brightness(1.35)}
      .cafasso-parish-secret.is-found:before{background:rgba(255,231,174,.22);box-shadow:0 0 14px rgba(255,225,147,.20)}
      .cafasso-parish-secret.is-whispering:before{animation:cafassoParishSecretWhisper 1.7s ease-in-out 2}
      @keyframes cafassoParishSecretWhisper{
        0%,100%{opacity:.28;box-shadow:0 0 9px rgba(255,220,136,.10)}
        50%{opacity:.88;box-shadow:0 0 18px rgba(255,225,147,.42),0 0 42px rgba(255,213,122,.22)}
      }

      .cafasso-parish-secret-layer{
        position:fixed;inset:0;z-index:2147483240;display:grid;place-items:center;padding:24px;
        background:radial-gradient(circle at 50% 31%,rgba(107,77,40,.12),rgba(4,10,9,.82) 70%);
        backdrop-filter:blur(7px) saturate(.85);-webkit-backdrop-filter:blur(7px) saturate(.85);
        opacity:0;transition:opacity .32s ease;
      }
      .cafasso-parish-secret-layer.is-visible{opacity:1}
      .cafasso-parish-secret-card{
        position:relative;width:min(590px,91vw);padding:48px 48px 38px;border:1px solid rgba(222,190,120,.34);border-radius:6px;
        background:linear-gradient(145deg,rgba(39,42,35,.98),rgba(18,31,28,.99) 68%,rgba(11,27,25,.99));
        box-shadow:0 34px 85px rgba(0,0,0,.55),inset 0 1px rgba(255,245,216,.08),inset 0 0 55px rgba(197,151,73,.045);
        color:#fff4d8;font-family:Georgia,serif;transform:translateY(8px) scale(.985);transition:transform .32s ease;
      }
      .cafasso-parish-secret-layer.is-visible .cafasso-parish-secret-card{transform:translateY(0) scale(1)}
      .cafasso-parish-secret-card:before{
        content:"";position:absolute;left:50%;top:17px;width:42px;height:1px;transform:translateX(-50%);
        background:linear-gradient(90deg,transparent,rgba(239,205,132,.45),transparent);box-shadow:0 0 9px rgba(239,205,132,.12)
      }
      .cafasso-parish-secret-close{
        position:absolute;right:12px;top:10px;width:35px;height:35px;border:0;border-radius:50%;background:rgba(255,255,255,.05);
        color:#f4e6bf;font:26px/1 Georgia,serif;cursor:pointer;
      }
      .cafasso-parish-secret-kicker{color:#d8bd7c;font:850 9px/1.2 Inter,system-ui,sans-serif;letter-spacing:.17em;text-transform:uppercase}
      .cafasso-parish-secret-card h2{margin:9px 0 17px;color:#fff2ca;font:400 clamp(33px,5vw,46px)/1 Georgia,serif}
      .cafasso-parish-secret-card p{margin:0;color:rgba(255,246,223,.82);font:17px/1.6 Georgia,serif}
      .cafasso-parish-secret-card p+p{margin-top:14px}
      .cafasso-parish-secret-progress{
        display:flex;align-items:center;gap:9px;margin-top:28px;padding-top:15px;border-top:1px solid rgba(231,199,132,.14);
        color:#d9bf80;font:800 10px/1.2 Inter,system-ui,sans-serif;letter-spacing:.05em;text-transform:uppercase;
      }
      .cafasso-parish-secret-progress b{
        display:grid;place-items:center;width:29px;height:29px;border:1px solid rgba(230,198,127,.33);border-radius:50%;
        background:rgba(221,177,88,.07);color:#ffe2a1;font:850 11px/1 Inter,system-ui,sans-serif;
      }
      .cafasso-parish-secret-toast{
        position:fixed;z-index:2147483239;left:50%;bottom:28px;transform:translate(-50%,18px);padding:10px 15px;
        border:1px solid rgba(235,199,119,.38);border-radius:999px;background:rgba(10,34,32,.95);box-shadow:0 10px 24px rgba(0,0,0,.34);
        color:#fff2cc;font:800 10px/1.2 Inter,system-ui,sans-serif;letter-spacing:.04em;opacity:0;transition:opacity .28s ease,transform .28s ease;pointer-events:none;
      }
      .cafasso-parish-secret-toast.show{opacity:1;transform:translate(-50%,0)}
      .cafasso-parish-secret-ray{
        position:fixed;z-index:2147483241;width:4px;height:13px;border-radius:999px;background:linear-gradient(#fff0be,rgba(240,199,108,.1));
        box-shadow:0 0 8px rgba(255,223,143,.42);pointer-events:none;animation:cafassoParishSecretRay 1s ease-out forwards;
      }
      @keyframes cafassoParishSecretRay{to{opacity:0;transform:translate(var(--dx),var(--dy)) rotate(var(--rot)) scale(.3)}}

      @media(max-width:760px){
        .cafasso-parish-secret{left:47%;top:8%;width:14%;height:14%;min-width:58px;min-height:58px}
        .cafasso-parish-secret-card{padding:43px 25px 30px}.cafasso-parish-secret-card p{font-size:15px}
        .cafasso-parish-secret-toast{bottom:18px;max-width:88vw;text-align:center}
      }
      @media(prefers-reduced-motion:reduce){
        .cafasso-parish-secret:before,.cafasso-parish-secret:after,.cafasso-parish-secret-layer,.cafasso-parish-secret-card,.cafasso-parish-secret-toast{transition:none!important}
        .cafasso-parish-secret.is-whispering:before,.cafasso-parish-secret-ray{animation:none!important}
      }
    `;
    document.head.appendChild(style);
  }

  function makeLight(origin) {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) return;
    const rect = origin?.getBoundingClientRect?.();
    const x = rect ? rect.left + rect.width / 2 : innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : innerHeight * .18;
    for (let i = 0; i < 10; i += 1) {
      const ray = document.createElement('i');
      ray.className = 'cafasso-parish-secret-ray';
      ray.style.left = `${x}px`;
      ray.style.top = `${y}px`;
      const angle = -Math.PI / 2 + ((i - 4.5) * .13);
      const distance = 24 + Math.random() * 42;
      ray.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
      ray.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
      ray.style.setProperty('--rot', `${-18 + Math.random() * 36}deg`);
      document.body.appendChild(ray);
      setTimeout(() => ray.remove(), 1100);
    }
  }

  function showToast(text) {
    document.querySelector('.cafasso-parish-secret-toast')?.remove();
    const toast = document.createElement('div');
    toast.className = 'cafasso-parish-secret-toast';
    toast.textContent = text;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => toast.classList.remove('show'), 2900);
    setTimeout(() => toast.remove(), 3250);
  }

  function showCard(state) {
    document.querySelector('.cafasso-parish-secret-layer')?.remove();
    const layer = document.createElement('div');
    layer.className = 'cafasso-parish-secret-layer';
    const count = state.discoveries.length;
    const complete = count >= TOTAL_SECRETS;
    layer.innerHTML = `
      <article class="cafasso-parish-secret-card" role="dialog" aria-modal="true" aria-labelledby="cafasso-parish-secret-title">
        <button class="cafasso-parish-secret-close" type="button" aria-label="Cerrar">×</button>
        <div class="cafasso-parish-secret-kicker">Secreto encontrado · Parroquia</div>
        <h2 id="cafasso-parish-secret-title">Hacer lugar</h2>
        <p>No todo se descubre haciendo más. Hay momentos en los que hace falta detenerse, respirar y dejar espacio para que algo nos alcance.</p>
        <p>También acompañamos cuando sabemos quedarnos, escuchar y hacer silencio.</p>
        <div class="cafasso-parish-secret-progress"><b>${count}</b><span>${complete ? '4 de 4 · el mundo fue recorrido por completo' : `${count} descubrimientos guardados · el mundo lo recuerda`}</span></div>
      </article>`;
    document.body.appendChild(layer);
    const close = () => {
      layer.classList.remove('is-visible');
      setTimeout(() => layer.remove(), 320);
    };
    layer.querySelector('.cafasso-parish-secret-close')?.addEventListener('click', close);
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
    const firstTime = !hasDiscovery(state);
    if (firstTime) {
      state.discoveries.push({
        id: SECRET_ID,
        space: 'parroquia',
        title: 'Hacer lugar',
        foundAt: new Date().toISOString()
      });
      state.updatedAt = new Date().toISOString();
      secret.classList.add('is-found');
      secret.setAttribute('aria-label', 'Reabrir secreto descubierto de la Parroquia');
      makeLight(secret);
      const complete = state.discoveries.length >= TOTAL_SECRETS;
      showToast(complete ? '✦ 4 de 4 · recorriste todos los secretos de CAFASSO' : '✦ Secreto descubierto · la Parroquia guarda tu huella');
      await persist(state);
      window.dispatchEvent(new CustomEvent('cafasso:exploration-update', { detail: state }));
    }
    showCard(state);
  }

  function mountSecret(state) {
    const parish = document.querySelector('.cafasso-parroquia');
    if (!parish || parish.querySelector(`[data-cafasso-secret="${SECRET_ID}"]`)) return false;
    ensureStyles();
    const secret = document.createElement('button');
    secret.type = 'button';
    secret.className = 'cafasso-parish-secret';
    secret.dataset.cafassoSecret = SECRET_ID;
    secret.setAttribute('aria-label', hasDiscovery(state)
      ? 'Reabrir secreto descubierto de la Parroquia'
      : 'Detalle oculto en la luz de la Parroquia');
    if (hasDiscovery(state)) secret.classList.add('is-found');
    parish.appendChild(secret);
    secret.addEventListener('click', () => discover(state, secret));

    if (!hasDiscovery(state)) {
      setTimeout(() => {
        if (document.visibilityState === 'visible' && document.body.contains(secret)) {
          secret.classList.add('is-whispering');
          setTimeout(() => secret.classList.remove('is-whispering'), 3600);
        }
      }, 9000);
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
    if (secret && hasDiscovery(state)) {
      secret.classList.add('is-found');
      secret.setAttribute('aria-label', 'Reabrir secreto descubierto de la Parroquia');
    }
    if (changed) window.dispatchEvent(new CustomEvent('cafasso:exploration-update', { detail: state }));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
