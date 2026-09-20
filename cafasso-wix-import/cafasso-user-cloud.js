(() => {
  const PARENT = (() => {
    try {
      if (window.parent !== window && window.parent.CafassoUserCloud) return window.parent.CafassoUserCloud;
    } catch (error) {}
    return null;
  })();

  const nativeGet = Storage.prototype.getItem;
  const nativeSet = Storage.prototype.setItem;
  const nativeRemove = Storage.prototype.removeItem;

  function installBridge(api) {
    if (window.__cafassoUserCloudBridgeInstalled) return;
    window.__cafassoUserCloudBridgeInstalled = true;

    Storage.prototype.setItem = function(key, value) {
      nativeSet.call(this, key, value);
      if (this === localStorage) {
        try { api.captureStorageMutation(String(key), String(value), false); } catch (error) {}
      }
    };

    Storage.prototype.removeItem = function(key) {
      nativeRemove.call(this, key);
      if (this === localStorage) {
        try { api.captureStorageMutation(String(key), '', true); } catch (error) {}
      }
    };
  }

  if (PARENT) {
    window.CafassoUserCloud = PARENT;
    installBridge(PARENT);
    return;
  }

  if (window.CafassoUserCloud) {
    installBridge(window.CafassoUserCloud);
    return;
  }

  const STATE_API = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoUserState';
  const VERSION = 1;
  const LEGACY_BITACORA_KEY = 'cafasso-bitacora-v1';

  const USER_PREFIXES = [
    'cafasso-bitacora-v2:',
    'cafasso-acompanante-v1:',
    'cafasso-school-resume-v1:',
    'cafasso-world-unlocks-v1:',
    'cafasso-huella-rewards-v1:',
    'cafasso-huellas-v1:',
    'cafasso-exploration-v1:',
    'cafasso-ruah-v2:',
    'cafasso-levels-v2:',
    'cafasso-house-prologue-v1:',
    'cafasso-world-state-'
  ];

  let suppress = 0;
  let saveTimer = 0;
  let savePromise = null;
  const dirtyKeys = new Set();
  let cloudState = emptyCloud();
  let lastRemoteData = null;

  function json(raw) {
    try { return JSON.parse(raw || 'null'); }
    catch (error) { return null; }
  }

  function session() {
    return json(nativeGet.call(localStorage, 'cafassoSession')) || {};
  }

  function user() {
    return session()?.user || {};
  }

  function userId() {
    const u = user();
    return String(u?._id || u?.id || '').trim();
  }

  function userKey() {
    const u = user();
    return String(u?._id || u?.id || u?.email || u?.name || 'local').trim();
  }

  function authHeaders(withJson = false) {
    const auth = json(nativeGet.call(localStorage, 'cafassoAuth')) || {};
    if (!auth?.sessionToken || Number(auth.expiresAt || 0) <= Date.now()) return null;
    const headers = { Authorization: `Bearer ${auth.sessionToken}` };
    if (withJson) headers['Content-Type'] = 'application/json';
    return headers;
  }

  function emptyCloud() {
    return { version:VERSION, storage:{}, updatedAt:'' };
  }

  function bitacoraKey() {
    return `cafasso-bitacora-v2:${userKey()}`;
  }

  function shouldSyncKey(key) {
    const currentKey = userKey();
    const candidate = String(key || '');
    if (!currentKey || currentKey === 'local' || !candidate.startsWith('cafasso-')) return false;
    const lower = candidate.toLowerCase();
    const identity = currentKey.toLowerCase();
    if (!lower.includes(identity)) return false;
    if (/cafasso-(auth|session)|spotify|token/i.test(candidate)) return false;
    return true;
  }

  function inferTimestamp(value) {
    const parsed = json(value);
    if (parsed && typeof parsed === 'object') {
      const direct = parsed.updatedAt || parsed.at || parsed.savedAt || parsed.completedAt || '';
      if (direct && Number.isFinite(Date.parse(direct))) return new Date(direct).toISOString();

      const times = [];
      Object.values(parsed).forEach(item => {
        if (typeof item === 'string' && Number.isFinite(Date.parse(item))) times.push(Date.parse(item));
        if (item && typeof item === 'object') {
          const nested = item.updatedAt || item.at || item.foundAt || item.date || '';
          if (nested && Number.isFinite(Date.parse(nested))) times.push(Date.parse(nested));
        }
      });
      if (times.length) return new Date(Math.max(...times)).toISOString();
    }
    return '';
  }

  function stamp(entry) {
    const value = String(entry?.value ?? '');
    return String(entry?.updatedAt || inferTimestamp(value) || '');
  }

  function newerEntry(a, b) {
    if (!a) return b || null;
    if (!b) return a || null;
    const ta = Date.parse(stamp(a) || '') || 0;
    const tb = Date.parse(stamp(b) || '') || 0;
    if (ta === tb) return b?.value ? b : a;
    return ta > tb ? a : b;
  }

  function mergeTimestampMap(a, b) {
    const left = json(a?.value) || {};
    const right = json(b?.value) || {};
    const merged = { ...left };
    Object.entries(right).forEach(([key, value]) => {
      const old = merged[key];
      const oldTime = Date.parse(String(old || '')) || 0;
      const newTime = Date.parse(String(value || '')) || 0;
      if (!(key in merged) || newTime >= oldTime) merged[key] = value;
    });
    const latest = Math.max(
      Date.parse(stamp(a) || '') || 0,
      Date.parse(stamp(b) || '') || 0
    );
    return {
      value:JSON.stringify(merged),
      updatedAt:latest ? new Date(latest).toISOString() : ''
    };
  }

  function mergeArrayState(a, b, fields) {
    const left = json(a?.value) || {};
    const right = json(b?.value) || {};
    const merged = { ...left, ...right };
    fields.forEach(field => {
      merged[field] = [...new Set([
        ...(Array.isArray(left[field]) ? left[field] : []),
        ...(Array.isArray(right[field]) ? right[field] : [])
      ].map(String))];
    });
    const when = [left.updatedAt, right.updatedAt, stamp(a), stamp(b)]
      .map(value => Date.parse(String(value || '')) || 0);
    const latest = Math.max(...when);
    merged.updatedAt = latest ? new Date(latest).toISOString() : '';
    return { value:JSON.stringify(merged), updatedAt:merged.updatedAt };
  }

  function mergeExploration(a, b) {
    const left = json(a?.value) || {};
    const right = json(b?.value) || {};
    const rows = [...(left.discoveries || []), ...(right.discoveries || [])];
    const byId = new Map();
    rows.forEach(row => {
      if (!row?.id) return;
      const previous = byId.get(String(row.id));
      if (!previous || String(row.foundAt || '') >= String(previous.foundAt || '')) byId.set(String(row.id), row);
    });
    const updatedAt = [left.updatedAt, right.updatedAt, stamp(a), stamp(b)]
      .sort().filter(Boolean).at(-1) || new Date().toISOString();
    return {
      value:JSON.stringify({ ...left, ...right, discoveries:[...byId.values()], updatedAt }),
      updatedAt
    };
  }

  function mergeWorldState(a, b) {
    const left = json(a?.value) || {};
    const right = json(b?.value) || {};
    const rows = [...(left.huellas || []), ...(right.huellas || [])];
    const byId = new Map();
    rows.forEach(row => {
      if (!row?.id) return;
      const previous = byId.get(String(row.id));
      const prevDate = Date.parse(previous?.updatedAt || previous?.date || '') || 0;
      const nextDate = Date.parse(row?.updatedAt || row?.date || '') || 0;
      if (!previous || nextDate >= prevDate) byId.set(String(row.id), row);
    });
    const updatedAt = [left.updatedAt, right.updatedAt, stamp(a), stamp(b)]
      .sort().filter(Boolean).at(-1) || new Date().toISOString();
    return {
      value:JSON.stringify({
        ...left,
        ...right,
        huellas:[...byId.values()],
        arrivalCompleted:Boolean(left.arrivalCompleted || right.arrivalCompleted),
        updatedAt
      }),
      updatedAt
    };
  }

  function mergeEntry(key, localEntry, remoteEntry) {
    if (!localEntry) return remoteEntry || null;
    if (!remoteEntry) return localEntry || null;

    if (key.startsWith('cafasso-world-unlocks-v1:')) return mergeTimestampMap(localEntry, remoteEntry);
    if (key.startsWith('cafasso-huellas-v1:')) return mergeArrayState(localEntry, remoteEntry, ['unlocked','seen','visitedSpaces']);
    if (key.startsWith('cafasso-huella-rewards-v1:')) {
      const merged = mergeArrayState(localEntry, remoteEntry, ['awarded']);
      const data = json(merged.value) || {};
      const left = json(localEntry.value) || {};
      const right = json(remoteEntry.value) || {};
      data.bonusAlmitas = Math.max(Number(left.bonusAlmitas || 0), Number(right.bonusAlmitas || 0));
      merged.value = JSON.stringify(data);
      return merged;
    }
    if (key.startsWith('cafasso-exploration-v1:')) return mergeExploration(localEntry, remoteEntry);
    if (key.startsWith('cafasso-world-state-')) return mergeWorldState(localEntry, remoteEntry);
    if (key.startsWith('cafasso-house-prologue-v1:')) {
      const seen = localEntry.value === 'seen' || remoteEntry.value === 'seen';
      const latest = Math.max(
        Date.parse(stamp(localEntry) || '') || 0,
        Date.parse(stamp(remoteEntry) || '') || 0
      );
      return { value: seen ? 'seen' : newerEntry(localEntry, remoteEntry).value, updatedAt:latest ? new Date(latest).toISOString() : '' };
    }
    return newerEntry(localEntry, remoteEntry);
  }

  function migrateLegacyBitacora() {
    const target = bitacoraKey();
    if (nativeGet.call(localStorage, target) != null) return false;
    const legacy = nativeGet.call(localStorage, LEGACY_BITACORA_KEY);
    if (legacy == null) return false;
    suppress += 1;
    try {
      nativeSet.call(localStorage, target, legacy);
      nativeRemove.call(localStorage, LEGACY_BITACORA_KEY);
    } finally {
      suppress -= 1;
    }
    return true;
  }

  function collectLocal() {
    const storage = {};
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key || !shouldSyncKey(key)) continue;
      const value = nativeGet.call(localStorage, key);
      if (value == null) continue;
      storage[key] = {
        value:String(value),
        updatedAt:inferTimestamp(value) || ''
      };
    }
    return storage;
  }

  function remoteStateFrom(data) {
    const raw = data?.state;
    if (!raw || typeof raw !== 'object') return emptyCloud();
    return {
      version:Number(raw.version || VERSION),
      storage:raw.storage && typeof raw.storage === 'object' ? raw.storage : {},
      updatedAt:String(raw.updatedAt || data?.updatedAt || '')
    };
  }

  async function sessionHash() {
    const auth = json(nativeGet.call(localStorage, 'cafassoAuth')) || {};
    const token = String(auth?.sessionToken || '');
    if (!token || Number(auth.expiresAt || 0) <= Date.now()) return '';
    const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
    return Array.from(new Uint8Array(bytes)).map(byte => byte.toString(16).padStart(2, '0')).join('');
  }

  function applyStorage(storage) {
    suppress += 1;
    try {
      Object.entries(storage || {}).forEach(([key, entry]) => {
        if (!shouldSyncKey(key)) return;
        if (entry?.deleted) nativeRemove.call(localStorage, key);
        else if (entry && Object.prototype.hasOwnProperty.call(entry, 'value')) nativeSet.call(localStorage, key, String(entry.value));
      });
    } finally {
      suppress -= 1;
    }
  }

  function mergeCloud(localStorageState, remoteCloud) {
    const merged = emptyCloud();
    const keys = new Set([
      ...Object.keys(localStorageState || {}),
      ...Object.keys(remoteCloud?.storage || {})
    ]);
    keys.forEach(key => {
      if (!shouldSyncKey(key)) return;
      const localEntry = localStorageState?.[key] || null;
      const remoteEntry = remoteCloud?.storage?.[key] || null;
      const entry = mergeEntry(key, localEntry, remoteEntry);
      if (entry) merged.storage[key] = entry;
    });
    merged.updatedAt = new Date().toISOString();
    return merged;
  }

  async function fetchRemote() {
    const hash = await sessionHash();
    if (!hash) throw new Error('auth');
    const response = await fetch(STATE_API, {
      method:'GET',
      headers:{ 'X-Cafasso-Session-Hash':hash },
      cache:'no-store'
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data?.ok === false) throw new Error(data?.error || 'No se pudo leer el estado CAFASSO');
    lastRemoteData = data;
    return data;
  }

  async function persist(state) {
    const hash = await sessionHash();
    if (!hash || !userId()) return false;
    const response = await fetch(STATE_API, {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'X-Cafasso-Session-Hash':hash
      },
      body:JSON.stringify({ state })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result?.ok === false) {
      throw new Error(result?.error || 'No se pudo guardar el perfil CAFASSO');
    }
    return true;
  }

  async function saveNow() {
    clearTimeout(saveTimer);
    saveTimer = 0;
    if (savePromise) return savePromise;
    if (!userId() || !authHeaders(false)) return false;

    savePromise = (async () => {
      try {
        const latest = await fetchRemote();
        const remote = remoteStateFrom(latest);
        const local = collectLocal();
        const merged = mergeCloud(local, remote);
        dirtyKeys.forEach(key => {
          const pending = cloudState.storage[key];
          if (!pending || !shouldSyncKey(key)) return;
          const current = merged.storage[key];
          const pendingTime = Date.parse(String(pending.updatedAt || '')) || 0;
          const currentTime = Date.parse(String(current?.updatedAt || '')) || 0;
          if (pending.deleted || pendingTime >= currentTime) merged.storage[key] = pending;
        });
        cloudState = merged;
        applyStorage(merged.storage);
        await persist(merged);
        dirtyKeys.clear();
        window.dispatchEvent(new CustomEvent('cafasso:user-cloud-synced', {
          detail:{ userId:userId(), updatedAt:merged.updatedAt }
        }));
        return true;
      } catch (error) {
        console.warn('CAFASSO user cloud:', error);
        return false;
      } finally {
        savePromise = null;
      }
    })();

    return savePromise;
  }

  function scheduleSave(delay = 1800) {
    clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => saveNow(), delay);
  }

  function captureStorageMutation(key, value, deleted = false) {
    if (suppress || !shouldSyncKey(key)) return;
    const current = cloudState.storage[key];
    if (!deleted && current && !current.deleted && String(current.value ?? '') === String(value)) return;
    if (deleted && current?.deleted) return;

    const now = new Date().toISOString();
    cloudState.storage[key] = deleted
      ? { deleted:true, updatedAt:now }
      : { value:String(value), updatedAt:inferTimestamp(value) || now };
    cloudState.updatedAt = now;
    dirtyKeys.add(key);
    scheduleSave();
  }

  async function hydrate() {
    if (!userId() || !authHeaders(false)) return { ok:false, reason:'no-session' };

    const migrated = migrateLegacyBitacora();
    try {
      const data = await fetchRemote();
      const remote = remoteStateFrom(data);
      const local = collectLocal();
      const merged = mergeCloud(local, remote);
      cloudState = merged;
      applyStorage(merged.storage);

      const remoteKeys = Object.keys(remote.storage || {});
      const localKeys = Object.keys(local || {});
      if (migrated || !remoteKeys.length || JSON.stringify(merged.storage) !== JSON.stringify(remote.storage || {})) {
        await persist(merged);
      }

      window.dispatchEvent(new CustomEvent('cafasso:user-cloud-ready', {
        detail:{ userId:userId(), localKeys:localKeys.length, cloudKeys:Object.keys(merged.storage).length }
      }));
      return { ok:true, state:merged, data };
    } catch (error) {
      console.warn('CAFASSO user cloud bootstrap:', error);
      window.dispatchEvent(new CustomEvent('cafasso:user-cloud-ready', {
        detail:{ userId:userId(), offline:true }
      }));
      return { ok:false, reason:'offline', error:String(error?.message || error) };
    }
  }

  const api = {
    get ready() { return ready; },
    get state() { return cloudState; },
    get lastRemoteData() { return lastRemoteData; },
    userId,
    userKey,
    bitacoraKey,
    shouldSyncKey,
    captureStorageMutation,
    flush:saveNow,
    refresh:hydrate,
    installStorageBridge(targetWindow = window) {
      try {
        if (targetWindow === window) installBridge(api);
      } catch (error) {}
    }
  };

  window.CafassoUserCloud = api;
  installBridge(api);
  const ready = hydrate();

  window.addEventListener('focus', () => {
    hydrate().catch(() => {});
  });
  window.setInterval(() => {
    if (document.visibilityState === 'visible') hydrate().catch(() => {});
  }, 60000);

  window.addEventListener('pagehide', () => {
    if (saveTimer) saveNow();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && saveTimer) saveNow();
  });
})();