(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('space') !== 'escuela') return;
  if (window.__cafassoSchoolSecretInstalled) return;
  window.__cafassoSchoolSecretInstalled = true;

  const ME_API = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoMe';
  const PROGRESS_API = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoProgress';
  const COURSE_ID = '__cafasso_exploration__';
  const MODULE_ID = '__world__';
  const TOTAL_SECRETS = 4;
  const SECRET_ID = 'school-chalk-transformation';
  const STYLE_ID = 'cafassoSchoolSecretStyles';

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
    const state = raw && typeof raw === 'object' ? raw : {};
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

  function hasDiscovery(state) {
    return Boolean((state?.discoveries || []).some(item => item.id === SECRET_ID));
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
      .cafasso-school-secret{
        position:absolute;z-index:12;right:13px;bottom:14px;width:42px;height:35px;padding:0;border:0;
        background:transparent;cursor:pointer;outline:none;touch-action:manipulation;transform:rotate(-7deg);
      }
      .cafasso-school-secret:before,.cafasso-school-secret:after{content:"";position:absolute;pointer-events:none}
      .cafasso-school-secret:before{
        left:8px;top:6px;width:19px;height:19px;border:2px solid rgba(242,237,215,.27);border-right-color:transparent;
        border-radius:50%;transform:rotate(22deg);filter:blur(.15px);transition:opacity .2s ease,filter .2s ease,transform .2s ease;
      }
      .cafasso-school-secret:after{
        left:23px;top:22px;width:11px;height:2px;border-radius:999px;background:rgba(242,237,215,.23);
        box-shadow:-13px 4px 0 rgba(242,237,215,.11);transform:rotate(-18deg);transition:opacity .2s ease,box-shadow .2s ease;
      }
      .cafasso-school-secret:hover:before,.cafasso-school-secret:focus-visible:before{
        border-color:rgba(255,245,207,.62);border-right-color:transparent;filter:drop-shadow(0 0 4px rgba(255,241,191,.28));transform:rotate(35deg) scale(1.06)
      }
      .cafasso-school-secret:hover:after,.cafasso-school-secret:focus-visible:after{background:rgba(255,245,207,.55)}
      .cafasso-school-secret.is-found:before{border-color:rgba(249,237,198,.4);border-right-color:transparent}
      .cafasso-school-secret.is-whispering:before{animation:cafassoSchoolChalkWhisper 1.5s ease-in-out 2}
      @keyframes cafassoSchoolChalkWhisper{
        0%,100%{opacity:.55;filter:none}
        50%{opacity:1;filter:drop-shadow(0 0 5px rgba(255,241,191,.48))}
      }

      .cafasso-school-secret-layer{
        position:fixed;inset:0;z-index:2147483220;display:grid;place-items:center;padding:24px;background:rgba(5,18,17,.68);
        backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);opacity:0;transition:opacity .22s ease;
      }
      .cafasso-school-secret-layer.is-visible{opacity:1}
      .cafasso-school-secret-slate{
        position:relative;width:min(590px,91vw);padding:46px 48px 36px;border:9px solid #725039;border-radius:5px;
        background:radial-gradient(circle at 20% 17%,rgba(255,255,255,.035),transparent 25%),repeating-linear-gradient(178deg,rgba(255,255,255,.012) 0 1px,transparent 1px 7px),linear-gradient(145deg,#244a42,#17362f 72%,#102b27);
        box-shadow:0 32px 78px rgba(0,0,0,.5),inset 0 0 38px rgba(0,0,0,.24);color:#f8f0d8;font-family:Georgia,serif;
        transform:translateY(8px) scale(.985) rotate(-.25deg);transition:transform .24s ease;
      }
      .cafasso-school-secret-layer.is-visible .cafasso-school-secret-slate{transform:translateY(0) scale(1) rotate(-.25deg)}
      .cafasso-school-secret-slate:after{
        content:"";position:absolute;left:7%;right:7%;bottom:10px;height:3px;border-radius:999px;background:rgba(239,224,191,.13);
      }
      .cafasso-school-secret-close{
        position:absolute;right:12px;top:10px;width:35px;height:35px;border:0;border-radius:50%;background:rgba(255,255,255,.06);
        color:#f5ead0;font:26px/1 Georgia,serif;cursor:pointer;
      }
      .cafasso-school-secret-kicker{color:#dfcf9a;font:850 9px/1.2 Inter,system-ui,sans-serif;letter-spacing:.17em;text-transform:uppercase}
      .cafasso-school-secret-slate h2{margin:9px 0 16px;color:#fff9e8;font:400 clamp(32px,5vw,45px)/1 Georgia,serif;text-shadow:0 2px 4px rgba(0,0,0,.24)}
      .cafasso-school-secret-slate p{margin:0;color:rgba(247,241,221,.85);font:17px/1.58 Georgia,serif}
      .cafasso-school-secret-slate p+p{margin-top:14px}
      .cafasso-school-secret-progress{
        display:flex;align-items:center;gap:9px;margin-top:27px;padding-top:15px;border-top:1px solid rgba(240,230,201,.15);
        color:#e4d49f;font:800 10px/1.2 Inter,system-ui,sans-serif;letter-spacing:.05em;text-transform:uppercase;
      }
      .cafasso-school-secret-progress b{
        display:grid;place-items:center;width:28px;height:28px;border:1px solid rgba(239,223,178,.36);border-radius:50%;
        background:rgba(255,255,255,.05);color:#fff0b7;font:850 11px/1 Inter,system-ui,sans-serif;
      }
      .cafasso-school-secret-toast{
        position:fixed;z-index:2147483219;left:50%;bottom:28px;transform:translate(-50%,18px);padding:10px 15px;
        border:1px solid rgba(236,217,158,.42);border-radius:999px;background:rgba(11,44,40,.94);box-shadow:0 10px 24px rgba(0,0,0,.3);
        color:#fff4d4;font:800 10px/1.2 Inter,system-ui,sans-serif;letter-spacing:.04em;opacity:0;transition:opacity .25s ease,transform .25s ease;pointer-events:none;
      }
      .cafasso-school-secret-toast.show{opacity:1;transform:translate(-50%,0)}
      .cafasso-school-secret-dust{
        position:fixed;z-index:2147483221;width:5px;height:5px;border-radius:50%;background:#eee6ca;box-shadow:0 0 7px rgba(244,236,208,.55);
        pointer-events:none;animation:cafassoSchoolChalkDust .8s ease-out forwards;
      }
      @keyframes cafassoSchoolChalkDust{to{opacity:0;transform:translate(var(--dx),var(--dy)) scale(.15)}}

      @media(max-width:760px){
        .cafasso-school-secret{right:9px;bottom:10px;width:37px;height:31px}
        .cafasso-school-secret-slate{padding:41px 25px 29px;border-width:7px}.cafasso-school-secret-slate p{font-size:15px}
        .cafasso-school-secret-toast{bottom:18px;max-width:88vw;text-align:center}
      }
      @media(prefers-reduced-motion:reduce){
        .cafasso-school-secret:before,.cafasso-school-secret:after,.cafasso-school-secret-layer,.cafasso-school-secret-slate,.cafasso-school-secret-toast{transition:none!important}
        .cafasso-school-secret.is-whispering:before,.cafasso-school-secret-dust{animation:none!important}
      }
    `;
    document.head.appendChild(style);
  }

  function makeDust(origin) {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) return;
    const rect = origin?.getBoundingClientRect?.();
    const x = rect ? rect.left + rect.width / 2 : innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : innerHeight / 2;
    for (let i = 0; i < 11; i += 1) {
      const dust = document.createElement('i');
      dust.className = 'cafasso-school-secret-dust';
      dust.style.left = `${x}px`;
      dust.style.top = `${y}px`;
      const angle = (Math.PI * 2 * i) / 11;
      const distance = 22 + Math.random() * 34;
      dust.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
      dust.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
      document.body.appendChild(dust);
      setTimeout(() => dust.remove(), 900);
    }
  }

  function showToast(text) {
    document.querySelector('.cafasso-school-secret-toast')?.remove();
    const toast = document.createElement('div');
    toast.className = 'cafasso-school-secret-toast';
    toast.textContent = text;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => toast.classList.remove('show'), 2700);
    setTimeout(() => toast.remove(), 3050);
  }

  function showSlate(state) {
    document.querySelector('.cafasso-school-secret-layer')?.remove();
    const layer = document.createElement('div');
    layer.className = 'cafasso-school-secret-layer';
    const count = state.discoveries.length;
    layer.innerHTML = `
      <article class="cafasso-school-secret-slate" role="dialog" aria-modal="true" aria-labelledby="cafasso-school-secret-title">
        <button class="cafasso-school-secret-close" type="button" aria-label="Cerrar">×</button>
        <div class="cafasso-school-secret-kicker">Secreto encontrado · Escuela</div>
        <h2 id="cafasso-school-secret-title">Dejarse cambiar</h2>
        <p>Una buena formación no termina cuando entendés algo. Empieza cuando eso cambia tu manera de mirar, decidir y acompañar.</p>
        <p>Aprender, en serio, es dejar que algo en vos se mueva.</p>
        <div class="cafasso-school-secret-progress"><b>${count}</b><span>${count === 1 ? 'descubrimiento guardado' : 'descubrimientos guardados'} · el mundo lo recuerda</span></div>
      </article>`;
    document.body.appendChild(layer);
    const close = () => {
      layer.classList.remove('is-visible');
      setTimeout(() => layer.remove(), 240);
    };
    layer.querySelector('.cafasso-school-secret-close')?.addEventListener('click', close);
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
        space: 'escuela',
        title: 'Dejarse cambiar',
        foundAt: new Date().toISOString()
      });
      state.updatedAt = new Date().toISOString();
      secret.classList.add('is-found');
      secret.setAttribute('aria-label', 'Reabrir secreto descubierto de la Escuela');
      makeDust(secret);
      showToast('✦ Secreto descubierto · la Escuela guarda tu huella');
      await persist(state);
      window.dispatchEvent(new CustomEvent('cafasso:exploration-update', { detail: state }));
    }
    showSlate(state);
  }

  function mountSecret(state) {
    const board = document.querySelector('.cafasso-school-board');
    if (!board || board.querySelector(`[data-cafasso-secret="${SECRET_ID}"]`)) return false;
    ensureStyles();
    const secret = document.createElement('button');
    secret.type = 'button';
    secret.className = 'cafasso-school-secret';
    secret.dataset.cafassoSecret = SECRET_ID;
    secret.setAttribute('aria-label', hasDiscovery(state)
      ? 'Reabrir secreto descubierto de la Escuela'
      : 'Marca de tiza casi borrada en el pizarrón');
    if (hasDiscovery(state)) secret.classList.add('is-found');
    board.appendChild(secret);
    secret.addEventListener('click', () => discover(state, secret));

    if (!hasDiscovery(state)) {
      setTimeout(() => {
        if (document.visibilityState === 'visible' && document.body.contains(secret)) {
          secret.classList.add('is-whispering');
          setTimeout(() => secret.classList.remove('is-whispering'), 3200);
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
      if (attempts < 45) {
        attempts += 1;
        setTimeout(mount, 100);
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
      secret.setAttribute('aria-label', 'Reabrir secreto descubierto de la Escuela');
    }
    if (changed) window.dispatchEvent(new CustomEvent('cafasso:exploration-update', { detail: state }));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
