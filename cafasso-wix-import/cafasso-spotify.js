(() => {
  if (window.CafassoSpotify) return;

  const CLIENT_ID_KEY = 'cafasso-spotify-client-id';
  const TOKEN_KEY = 'cafasso-spotify-token-v1';
  const PKCE_VERIFIER_KEY = 'cafasso-spotify-pkce-verifier';
  const PKCE_STATE_KEY = 'cafasso-spotify-pkce-state';
  const PLAYLIST_NAME = 'CAFASSO · Cancionero';
  const SCOPES = [
    'streaming',
    'user-read-private',
    'user-read-email',
    'user-read-playback-state',
    'user-read-currently-playing',
    'user-modify-playback-state',
    'playlist-read-private',
    'playlist-read-collaborative'
  ];

  let clientId = String(window.CAFASSO_SPOTIFY_CLIENT_ID || localStorage.getItem(CLIENT_ID_KEY) || '').trim();
  let token = readToken();
  let player = null;
  let deviceId = '';
  let sdkPromise = null;
  let initPromise = null;
  let connected = false;
  let lastState = null;

  function redirectUri() {
    const url = new URL(location.href);
    url.search = '';
    url.hash = '';
    return url.href;
  }

  function readToken() {
    try {
      const raw = JSON.parse(localStorage.getItem(TOKEN_KEY) || 'null');
      return raw && raw.access_token ? raw : null;
    } catch (error) {
      return null;
    }
  }

  function saveToken(next) {
    token = next || null;
    try {
      if (token) localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
      else localStorage.removeItem(TOKEN_KEY);
    } catch (error) {}
  }

  function configured() {
    return Boolean(clientId);
  }

  function setClientId(value) {
    const next = String(value || '').trim();
    clientId = next;
    try {
      if (next) localStorage.setItem(CLIENT_ID_KEY, next);
      else localStorage.removeItem(CLIENT_ID_KEY);
    } catch (error) {}
    emit();
    return clientId;
  }

  function randomString(length = 64) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const bytes = crypto.getRandomValues(new Uint8Array(length));
    return Array.from(bytes, byte => chars[byte % chars.length]).join('');
  }

  function base64url(bytes) {
    let binary = '';
    bytes.forEach(byte => { binary += String.fromCharCode(byte); });
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  async function sha256(value) {
    return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
  }

  async function connectAccount() {
    if (!configured()) throw new Error('Spotify Client ID no configurado');

    const verifier = randomString(72);
    const state = randomString(32);
    const challenge = base64url(await sha256(verifier));
    sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);
    sessionStorage.setItem(PKCE_STATE_KEY, state);

    const auth = new URL('https://accounts.spotify.com/authorize');
    auth.searchParams.set('client_id', clientId);
    auth.searchParams.set('response_type', 'code');
    auth.searchParams.set('redirect_uri', redirectUri());
    auth.searchParams.set('scope', SCOPES.join(' '));
    auth.searchParams.set('code_challenge_method', 'S256');
    auth.searchParams.set('code_challenge', challenge);
    auth.searchParams.set('state', state);
    location.href = auth.href;
  }

  async function exchangeCode(code) {
    const verifier = sessionStorage.getItem(PKCE_VERIFIER_KEY) || '';
    if (!verifier) throw new Error('Falta el verificador PKCE');

    const body = new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri(),
      code_verifier: verifier
    });

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method:'POST',
      headers:{ 'Content-Type':'application/x-www-form-urlencoded' },
      body
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.access_token) throw new Error(data.error_description || data.error || 'No se pudo autorizar Spotify');

    const now = Date.now();
    saveToken({
      ...data,
      obtained_at: now,
      expires_at: now + Number(data.expires_in || 3600) * 1000
    });
    sessionStorage.removeItem(PKCE_VERIFIER_KEY);
    sessionStorage.removeItem(PKCE_STATE_KEY);
    return token;
  }

  async function refreshToken() {
    if (!token?.refresh_token || !configured()) return null;
    const body = new URLSearchParams({
      client_id: clientId,
      grant_type:'refresh_token',
      refresh_token:token.refresh_token
    });
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method:'POST',
      headers:{ 'Content-Type':'application/x-www-form-urlencoded' },
      body
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.access_token) {
      saveToken(null);
      return null;
    }
    const now = Date.now();
    saveToken({
      ...token,
      ...data,
      refresh_token:data.refresh_token || token.refresh_token,
      obtained_at:now,
      expires_at:now + Number(data.expires_in || 3600) * 1000
    });
    return token;
  }

  async function accessToken() {
    if (!token?.access_token) return '';
    if (Date.now() >= Number(token.expires_at || 0) - 60000) await refreshToken();
    return token?.access_token || '';
  }

  async function api(path, options = {}) {
    let bearer = await accessToken();
    if (!bearer) throw new Error('Spotify no conectado');

    const request = async value => fetch(`https://api.spotify.com/v1${path}`, {
      ...options,
      headers:{
        ...(options.body ? { 'Content-Type':'application/json' } : {}),
        ...(options.headers || {}),
        Authorization:`Bearer ${value}`
      }
    });

    let response = await request(bearer);
    if (response.status === 401 && await refreshToken()) {
      bearer = token.access_token;
      response = await request(bearer);
    }
    if (response.status === 204) return null;
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error?.message || data?.error_description || `Spotify API ${response.status}`);
    return data;
  }

  function cleanUrlAfterAuth() {
    const url = new URL(location.href);
    ['code','state','error','error_description'].forEach(key => url.searchParams.delete(key));
    history.replaceState(history.state, '', url.href);
  }

  async function handleAuthCallback() {
    const url = new URL(location.href);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    if (error) {
      cleanUrlAfterAuth();
      throw new Error(url.searchParams.get('error_description') || error);
    }
    if (!code) return false;
    const expected = sessionStorage.getItem(PKCE_STATE_KEY);
    const actual = url.searchParams.get('state');
    if (!expected || expected !== actual) {
      cleanUrlAfterAuth();
      throw new Error('La validación de Spotify no coincide');
    }
    await exchangeCode(code);
    cleanUrlAfterAuth();
    return true;
  }

  function loadSdk() {
    if (window.Spotify?.Player) return Promise.resolve();
    if (sdkPromise) return sdkPromise;
    sdkPromise = new Promise((resolve, reject) => {
      const previous = window.onSpotifyWebPlaybackSDKReady;
      window.onSpotifyWebPlaybackSDKReady = () => {
        try { if (typeof previous === 'function') previous(); } catch (error) {}
        resolve();
      };
      if (!document.querySelector('script[src="https://sdk.scdn.co/spotify-player.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;
        script.onerror = () => reject(new Error('No se pudo cargar Spotify Web Playback SDK'));
        document.head.appendChild(script);
      }
      const timer = setInterval(() => {
        if (window.Spotify?.Player) {
          clearInterval(timer);
          resolve();
        }
      }, 150);
    });
    return sdkPromise;
  }

  function normalizeSdkState(sdkState) {
    if (!sdkState?.track_window?.current_track) return {
      connected,
      deviceId,
      track:null,
      playing:false,
      position:0,
      duration:0
    };
    const t = sdkState.track_window.current_track;
    const artist = (t.artists || []).map(item => item.name).filter(Boolean).join(', ');
    return {
      connected,
      deviceId,
      track:{
        id:t.id || t.uri,
        title:t.name || 'Música',
        subtitle:artist,
        source:artist || 'Spotify',
        category:'spotify',
        categoryLabel:'Spotify',
        spotifyUri:t.uri,
        spotifyUrl:t.id ? `https://open.spotify.com/track/${t.id}` : '',
        durationMs:Number(t.duration_ms || 0),
        provider:'spotify'
      },
      playing:!sdkState.paused,
      position:Number(sdkState.position || 0) / 1000,
      duration:Number(sdkState.duration || 0) / 1000
    };
  }

  function emit(detail = lastState || {
    connected,
    deviceId,
    track:null,
    playing:false,
    position:0,
    duration:0
  }) {
    lastState = { ...detail, configured:configured(), authenticated:Boolean(token?.access_token) };
    window.dispatchEvent(new CustomEvent('cafasso:spotify-state', { detail:lastState }));
  }

  async function initPlayer() {
    if (!token?.access_token || !configured()) return false;
    if (initPromise) return initPromise;

    initPromise = (async () => {
      await loadSdk();
      if (player) return true;

      player = new Spotify.Player({
        name:'CAFASSO',
        getOAuthToken:async callback => callback(await accessToken()),
        volume:0.7,
        enableMediaSession:true
      });

      player.addListener('ready', async ({ device_id }) => {
        connected = true;
        deviceId = device_id;
        try {
          await api('/me/player', {
            method:'PUT',
            body:JSON.stringify({ device_ids:[deviceId], play:false })
          });
        } catch (error) {}
        emit();
      });

      player.addListener('not_ready', ({ device_id }) => {
        if (deviceId === device_id) connected = false;
        emit();
      });

      player.addListener('player_state_changed', sdkState => {
        if (!sdkState) return;
        emit(normalizeSdkState(sdkState));
      });

      player.addListener('authentication_error', ({ message }) => {
        console.warn('CAFASSO Spotify auth:', message);
      });
      player.addListener('account_error', ({ message }) => {
        console.warn('CAFASSO Spotify account:', message);
      });
      player.addListener('playback_error', ({ message }) => {
        console.warn('CAFASSO Spotify playback:', message);
      });

      const ok = await player.connect();
      connected = Boolean(ok);
      emit();
      return ok;
    })();

    return initPromise;
  }

  async function playTrack(track) {
    if (!track?.spotifyUri) throw new Error('Este canto no tiene vínculo de Spotify');
    await initPlayer();
    if (!deviceId) throw new Error('Spotify todavía no está listo');
    await api(`/me/player/play?device_id=${encodeURIComponent(deviceId)}`, {
      method:'PUT',
      body:JSON.stringify({ uris:[track.spotifyUri] })
    });
    return true;
  }

  async function pause() {
    if (player) return player.pause();
    if (deviceId) await api(`/me/player/pause?device_id=${encodeURIComponent(deviceId)}`, { method:'PUT' });
  }

  async function resume() {
    if (player) return player.resume();
    if (deviceId) await api(`/me/player/play?device_id=${encodeURIComponent(deviceId)}`, { method:'PUT' });
  }

  async function toggle() {
    if (!player) return resume();
    return player.togglePlay();
  }

  async function seek(seconds) {
    const ms = Math.max(0, Math.floor(Number(seconds || 0) * 1000));
    if (player) return player.seek(ms);
    if (deviceId) await api(`/me/player/seek?position_ms=${ms}&device_id=${encodeURIComponent(deviceId)}`, { method:'PUT' });
  }

  async function getPlaylists() {
    const all = [];
    let offset = 0;
    while (offset < 500) {
      const data = await api(`/me/playlists?limit=50&offset=${offset}`);
      all.push(...(data?.items || []));
      if (!data?.next || !(data?.items || []).length) break;
      offset += data.items.length;
    }
    return all;
  }

  function samePlaylistName(value) {
    return String(value || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[·•–—-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase() === 'cafasso cancionero';
  }

  async function findCancioneroPlaylist() {
    const playlists = await getPlaylists();
    return playlists.find(item => samePlaylistName(item?.name)) || null;
  }

  async function getPlaylistTracks(playlistId) {
    const all = [];
    let offset = 0;
    while (offset < 500) {
      const data = await api(`/playlists/${encodeURIComponent(playlistId)}/items?limit=50&offset=${offset}`);
      const rows = data?.items || [];
      all.push(...rows);
      if (!data?.next || !rows.length) break;
      offset += rows.length;
    }

    return all.map((row, index) => {
      const t = row?.item || row?.track || row;
      if (!t || t.type !== 'track' || !t.uri) return null;
      const artist = (t.artists || []).map(item => item.name).filter(Boolean).join(', ');
      return {
        id:t.id || t.uri,
        category:'spotify',
        categoryLabel:'Spotify',
        title:t.name || `Canto ${index + 1}`,
        subtitle:artist,
        source:artist || 'Spotify',
        spotifyUri:t.uri,
        spotifyUrl:t.external_urls?.spotify || '',
        image:t.album?.images?.[0]?.url || '',
        durationMs:Number(t.duration_ms || 0),
        provider:'spotify',
        order:index + 1
      };
    }).filter(Boolean);
  }

  async function getCancioneroTracks() {
    const playlist = await findCancioneroPlaylist();
    if (!playlist) return { playlist:null, tracks:[] };
    const tracks = await getPlaylistTracks(playlist.id);
    return { playlist, tracks };
  }

  async function disconnect() {
    try { await player?.disconnect?.(); } catch (error) {}
    player = null;
    deviceId = '';
    connected = false;
    initPromise = null;
    saveToken(null);
    emit();
  }

  function getState() {
    return lastState || {
      configured:configured(),
      authenticated:Boolean(token?.access_token),
      connected,
      deviceId,
      track:null,
      playing:false,
      position:0,
      duration:0
    };
  }

  async function boot() {
    try {
      if (configured()) await handleAuthCallback();
      if (token?.access_token) await initPlayer();
    } catch (error) {
      console.warn('CAFASSO Spotify:', error);
      emit({ ...getState(), error:error.message });
    }
    emit();
  }

  window.CafassoSpotify = {
    configure:setClientId,
    isConfigured:configured,
    isAuthenticated:() => Boolean(token?.access_token),
    connectAccount,
    disconnect,
    initPlayer,
    playTrack,
    pause,
    resume,
    toggle,
    seek,
    getPlaylists,
    findCancioneroPlaylist,
    getCancioneroTracks,
    getState,
    redirectUri
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();