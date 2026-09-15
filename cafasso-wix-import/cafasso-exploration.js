(() => {
  if (window.__cafassoExplorationInstalled) return;
  window.__cafassoExplorationInstalled = true;

  const ME_API = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoMe';
  const PROGRESS_API = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoProgress';
  const COURSE_ID = '__cafasso_exploration__';
  const MODULE_ID = '__world__';
  const TOTAL_SECRETS = 4;
  const STYLE_ID = 'cafassoExplorationStyles';
  const SECRET_ID = 'house-heart-note';

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

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-explore-secret{position:absolute;z-index:4;width:38px;height:25px;padding:0;border:1px solid rgba(96,66,38,.5);border-radius:2px;background:linear-gradient(145deg,#f2e3bd,#d7bc88);box-shadow:0 5px 8px rgba(24,14,8,.35),inset 0 1px rgba(255,255,255,.65);cursor:pointer;transform-origin:70% 80%;transition:transform .18s ease,filter .18s ease,box-shadow .18s ease;overflow:hidden}
      .cafasso-explore-secret:before{content:"";position:absolute;right:-1px;top:-1px;width:10px;height:10px;background:linear-gradient(225deg,rgba(255,255,255,.8) 0 48%,#b79560 50% 100%);box-shadow:-1px 1px 2px rgba(67,45,24,.18)}
      .cafasso-explore-secret:after{content:"";position:absolute;left:7px;right:7px;top:9px;height:1px;background:rgba(102,68,35,.35);box-shadow:0 4px rgba(102,68,35,.22)}
      .cafasso-explore-secret:hover,.cafasso-explore-secret:focus-visible{transform:translateY(-3px) rotate(4deg) scale(1.08);filter:brightness(1.06);box-shadow:0 9px 13px rgba(24,14,8,.43),0 0 13px rgba(242,201,90,.16);outline:none}
      .cafasso-explore-secret.is-found{border-color:rgba(201,155,54,.75);filter:saturate(.92)}
      .cafasso-explore-secret.is-found .cafasso-explore-secret__seal{display:grid}
      .cafasso-explore-secret__seal{display:none;position:absolute;left:14px;top:6px;z-index:2;place-items:center;width:11px;height:11px;border-radius:50%;background:#a66f2c;color:#f9df92;font:800 7px/1 Georgia,serif;box-shadow:0 1px 2px rgba(56,34,15,.35)}
      .cafasso-house .cafasso-explore-secret--house{left:calc(50.5% + 96px);bottom:16.4%;transform:rotate(7deg)}
      .cafasso-house .cafasso-explore-secret--house:hover,.cafasso-house .cafasso-explore-secret--house:focus-visible{transform:translateY(-3px) rotate(4deg) scale(1.08)}
      .cafasso-explore-secret.is-whispering{animation:cafassoSecretWhisper 1.45s ease-in-out 2}
      @keyframes cafassoSecretWhisper{0%,100%{filter:brightness(1);box-shadow:0 5px 8px rgba(24,14,8,.35)}50%{filter:brightness(1.13);box-shadow:0 7px 11px rgba(24,14,8,.4),0 0 16px rgba(244,211,126,.3)}}

      .cafasso-discovery-layer{position:fixed;inset:0;z-index:2147483200;display:grid;place-items:center;padding:24px;background:rgba(6,20,21,.58);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);opacity:0;transition:opacity .22s ease}
      .cafasso-discovery-layer.is-visible{opacity:1}
      .cafasso-discovery-note{position:relative;width:min(520px,90vw);padding:44px 42px 36px;border:1px solid rgba(116,78,39,.5);border-radius:4px 11px 8px 4px;background:repeating-linear-gradient(180deg,transparent 0 30px,rgba(112,83,48,.07) 30px 31px),linear-gradient(145deg,#f7edcf,#e7d2a6);box-shadow:0 30px 70px rgba(0,0,0,.45),inset 0 1px rgba(255,255,255,.72);color:#463522;transform:rotate(-.7deg) translateY(8px);transition:transform .24s ease;font-family:Georgia,serif}
      .cafasso-discovery-layer.is-visible .cafasso-discovery-note{transform:rotate(-.7deg) translateY(0)}
      .cafasso-discovery-note:before{content:"";position:absolute;left:30px;top:-10px;width:68px;height:21px;background:rgba(222,203,155,.72);box-shadow:0 2px 3px rgba(71,48,25,.14);transform:rotate(-5deg)}
      .cafasso-discovery-close{position:absolute;right:13px;top:12px;width:34px;height:34px;border:0;border-radius:50%;background:rgba(72,51,31,.08);color:#503b27;font:26px/1 Georgia,serif;cursor:pointer}
      .cafasso-discovery-kicker{color:#9a6d2a;font:850 9px/1.2 Inter,system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase}
      .cafasso-discovery-note h2{margin:8px 0 13px;font:500 clamp(30px,5vw,42px)/1 Georgia,serif;color:#3e2e1e}
      .cafasso-discovery-note p{margin:0;color:#5f4b35;font:17px/1.58 Georgia,serif}
      .cafasso-discovery-note p+p{margin-top:14px}
      .cafasso-discovery-progress{display:flex;align-items:center;gap:9px;margin-top:24px;padding-top:14px;border-top:1px solid rgba(100,71,40,.18);color:#765627;font:800 10px/1.2 Inter,system-ui,sans-serif;letter-spacing:.05em;text-transform:uppercase}
      .cafasso-discovery-progress b{display:grid;place-items:center;width:27px;height:27px;border-radius:50%;background:#a66f2c;color:#fff4cc;font:850 11px/1 Inter,system-ui,sans-serif}
      .cafasso-discovery-toast{position:fixed;z-index:2147483199;left:50%;bottom:28px;transform:translate(-50%,18px);padding:10px 15px;border:1px solid rgba(242,201,90,.44);border-radius:999px;background:rgba(8,36,37,.92);box-shadow:0 10px 24px rgba(0,0,0,.3);color:#fff5d9;font:800 10px/1.2 Inter,system-ui,sans-serif;letter-spacing:.04em;opacity:0;transition:opacity .25s ease,transform .25s ease;pointer-events:none}
      .cafasso-discovery-toast.show{opacity:1;transform:translate(-50%,0)}
      .cafasso-discovery-spark{position:fixed;z-index:2147483201;width:7px;height:7px;border-radius:50%;background:#f4d889;box-shadow:0 0 8px rgba(244,216,137,.7);pointer-events:none;animation:cafassoDiscoverySpark .8s ease-out forwards}
      @keyframes cafassoDiscoverySpark{to{opacity:0;transform:translate(var(--dx),var(--dy)) scale(.2)}}

      @media(max-width:680px){
        .cafasso-house .cafasso-explore-secret--house{left:calc(47.5% + 69px);bottom:16.8%;width:31px;height:21px}
        .cafasso-discovery-note{padding:39px 24px 28px}.cafasso-discovery-note p{font-size:15px}.cafasso-discovery-toast{bottom:18px;max-width:88vw;text-align:center}
      }
      @media(prefers-reduced-motion:reduce){.cafasso-explore-secret,.cafasso-discovery-layer,.cafasso-discovery-note,.cafasso-discovery-toast{transition:none!important}.cafasso-explore-secret.is-whispering,.cafasso-discovery-spark{animation:none!important}}
    `;
    document.head.appendChild(style);
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

  function makeSparks(origin) {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) return;
    const rect = origin?.getBoundingClientRect?.();
    const x = rect ? rect.left + rect.width / 2 : innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : innerHeight / 2;
    for (let i = 0; i < 14; i += 1) {
      const spark = document.createElement('i');
      spark.className = 'cafasso-discovery-spark';
      spark.style.left = `${x}px`;
      spark.style.top = `${y}px`;
      const angle = (Math.PI * 2 * i) / 14;
      const distance = 30 + Math.random() * 46;
      spark.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
      spark.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
      document.body.appendChild(spark);
      setTimeout(() => spark.remove(), 900);
    }
  }

  function showToast(text) {
    const old = document.querySelector('.cafasso-discovery-toast');
    old?.remove();
    const toast = document.createElement('div');
    toast.className = 'cafasso-discovery-toast';
    toast.textContent = text;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => toast.classList.remove('show'), 2600);
    setTimeout(() => toast.remove(), 3000);
  }

  function showNote(state) {
    document.querySelector('.cafasso-discovery-layer')?.remove();
    const layer = document.createElement('div');
    layer.className = 'cafasso-discovery-layer';
    const count = state.discoveries.length;
    layer.innerHTML = `
      <article class="cafasso-discovery-note" role="dialog" aria-modal="true" aria-labelledby="cafasso-discovery-title">
        <button class="cafasso-discovery-close" type="button" aria-label="Cerrar">×</button>
        <div class="cafasso-discovery-kicker">Secreto encontrado · Casa</div>
        <h2 id="cafasso-discovery-title">Huella del corazón</h2>
        <p>Hay cosas que no aparecen en los menús. Algunas se encuentran solamente cuando mirás el mundo con un poco más de tiempo.</p>
        <p>Don Bosco aprendió a estar atento a las pequeñas señales. CAFASSO también guarda algunas.</p>
        <div class="cafasso-discovery-progress"><b>${count}</b><span>${count === 1 ? 'descubrimiento guardado' : 'descubrimientos guardados'} · el mundo lo recuerda</span></div>
      </article>`;
    document.body.appendChild(layer);
    const close = () => {
      layer.classList.remove('is-visible');
      setTimeout(() => layer.remove(), 240);
    };
    layer.querySelector('.cafasso-discovery-close')?.addEventListener('click', close);
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
        space: 'house',
        title: 'Huella del corazón',
        foundAt: new Date().toISOString()
      });
      state.updatedAt = new Date().toISOString();
      secret.classList.add('is-found');
      secret.setAttribute('aria-label', 'Reabrir secreto descubierto: Huella del corazón');
      makeSparks(secret);
      showToast('✦ Secreto descubierto · CAFASSO lo va a recordar');
      await persist(state);
      window.dispatchEvent(new CustomEvent('cafasso:exploration-update', { detail: state }));
    }
    showNote(state);
  }

  function mountHouseSecret(state) {
    const house = document.querySelector('.cafasso-house');
    if (!house || house.querySelector(`[data-cafasso-secret="${SECRET_ID}"]`)) return false;
    ensureStyles();
    const secret = document.createElement('button');
    secret.type = 'button';
    secret.className = 'cafasso-explore-secret cafasso-explore-secret--house';
    secret.dataset.cafassoSecret = SECRET_ID;
    secret.setAttribute('aria-label', hasDiscovery(state, SECRET_ID)
      ? 'Reabrir secreto descubierto: Huella del corazón'
      : 'Objeto oculto en la Casa');
    secret.innerHTML = '<span class="cafasso-explore-secret__seal" aria-hidden="true">✦</span>';
    if (hasDiscovery(state, SECRET_ID)) secret.classList.add('is-found');
    house.appendChild(secret);
    secret.addEventListener('click', () => discover(state, secret));

    if (!hasDiscovery(state, SECRET_ID)) {
      setTimeout(() => {
        if (document.visibilityState === 'visible' && document.body.contains(secret)) {
          secret.classList.add('is-whispering');
          setTimeout(() => secret.classList.remove('is-whispering'), 3200);
        }
      }, 6500);
    }
    return true;
  }

  async function boot() {
    if ((new URLSearchParams(location.search).get('space') || 'house') !== 'house') return;
    ensureStyles();
    let state = readLocal();
    let attempts = 0;
    const mount = () => {
      if (mountHouseSecret(state)) return;
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
      secret.setAttribute('aria-label', 'Reabrir secreto descubierto: Huella del corazón');
    }
    if (changed) window.dispatchEvent(new CustomEvent('cafasso:exploration-update', { detail: state }));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
