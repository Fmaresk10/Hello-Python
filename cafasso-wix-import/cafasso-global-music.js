(() => {
  if (window.CafassoGlobalMusic) return;

  const STORAGE_KEY = 'cafasso-global-music-v1';
  const STYLE_ID = 'cafassoGlobalMusicStyles';
  const WIDGET_ID = 'cafassoGlobalMusicWidget';
  const API_SRC = 'https://www.youtube.com/iframe_api';

  let state = readState();
  let player = null;
  let playerReady = false;
  let restoring = false;
  let restoreTimer = 0;
  let mediaShell = null;
  let mediaNode = null;
  let hiddenSlot = null;
  let widget = null;
  let attachedContainer = null;

  function cleanTrack(track) {
    if (!track || !track.videoId) return null;
    return {
      id: String(track.id || track.videoId),
      title: String(track.title || 'Música'),
      subtitle: String(track.subtitle || track.categoryLabel || ''),
      source: String(track.source || track.categoryLabel || ''),
      categoryLabel: String(track.categoryLabel || ''),
      videoId: String(track.videoId)
    };
  }

  function readState() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (!raw?.track?.videoId) return { track:null, playing:false, position:0, updatedAt:Date.now(), needsGesture:false };
      return {
        track: cleanTrack(raw.track),
        playing: Boolean(raw.playing),
        position: Math.max(0, Number(raw.position || 0)),
        updatedAt: Number(raw.updatedAt || Date.now()),
        needsGesture: Boolean(raw.needsGesture)
      };
    } catch (error) {
      return { track:null, playing:false, position:0, updatedAt:Date.now(), needsGesture:false };
    }
  }

  function currentPosition() {
    if (!state.track) return 0;
    if (playerReady && player && typeof player.getCurrentTime === 'function') {
      const value = Number(player.getCurrentTime());
      if (Number.isFinite(value) && value >= 0) return value;
    }
    if (state.playing && !state.needsGesture) {
      return Math.max(0, state.position + (Date.now() - state.updatedAt) / 1000);
    }
    return Math.max(0, state.position || 0);
  }

  function writeState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (error) {}
  }

  function snapshot() {
    return {
      track: state.track ? { ...state.track } : null,
      playing: Boolean(state.playing && !state.needsGesture),
      requestedPlaying: Boolean(state.playing),
      needsGesture: Boolean(state.needsGesture),
      position: currentPosition()
    };
  }

  function emit() {
    renderWidget();
    window.dispatchEvent(new CustomEvent('cafasso:global-music-state', { detail:snapshot() }));
  }

  function persistFromPlayer() {
    if (!state.track) return;
    state.position = currentPosition();
    state.updatedAt = Date.now();
    if (playerReady && player && window.YT?.PlayerState) {
      const ps = player.getPlayerState?.();
      if (ps === YT.PlayerState.PLAYING) {
        state.playing = true;
        state.needsGesture = false;
      } else if (ps === YT.PlayerState.PAUSED || ps === YT.PlayerState.ENDED) {
        state.playing = false;
      }
    }
    writeState();
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-global-music{
        position:fixed;right:18px;bottom:18px;z-index:2147483000;
        display:grid;grid-template-columns:42px minmax(0,1fr) 38px 30px;align-items:center;gap:10px;
        width:min(354px,calc(100vw - 28px));min-height:66px;padding:10px 9px 10px 10px;
        border:1px solid rgba(205,167,105,.26);border-radius:13px;
        background:
          linear-gradient(90deg,rgba(111,37,43,.96) 0 7px,transparent 7px),
          linear-gradient(145deg,rgba(38,29,24,.96),rgba(22,25,23,.96));
        box-shadow:0 16px 38px rgba(0,0,0,.42),inset 0 1px rgba(255,255,255,.035);
        color:#f7ecd4;backdrop-filter:blur(10px);
        font-family:Georgia,serif
      }
      .cafasso-global-music[hidden]{display:none!important}
      .cafasso-global-music__mark{
        position:relative;width:42px;height:42px;display:grid;place-items:center;border-radius:50%;
        border:1px solid rgba(218,181,112,.28);background:rgba(112,39,43,.32);color:#ddb978;font:21px/1 Georgia,serif
      }
      .cafasso-global-music__bars{
        position:absolute;left:4px;right:4px;bottom:-3px;height:8px;display:flex;align-items:end;justify-content:center;gap:2px
      }
      .cafasso-global-music__bars i{display:block;width:2px;height:3px;border-radius:3px;background:#d7b06e;opacity:.75}
      .cafasso-global-music.is-playing .cafasso-global-music__bars i:nth-child(1){animation:cafassoMusicBar .7s ease-in-out infinite alternate}
      .cafasso-global-music.is-playing .cafasso-global-music__bars i:nth-child(2){animation:cafassoMusicBar .52s ease-in-out .1s infinite alternate}
      .cafasso-global-music.is-playing .cafasso-global-music__bars i:nth-child(3){animation:cafassoMusicBar .8s ease-in-out .2s infinite alternate}
      @keyframes cafassoMusicBar{from{height:2px}to{height:8px}}
      .cafasso-global-music__copy{min-width:0}
      .cafasso-global-music__eyebrow{display:block;margin-bottom:3px;color:#c8a77a;font:700 8px/1 Inter,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase}
      .cafasso-global-music__title{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#fff7e8;font:600 15px/1.15 Georgia,serif}
      .cafasso-global-music__meta{display:block;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#bea995;font:10px/1.2 Georgia,serif;font-style:italic}
      .cafasso-global-music__toggle,.cafasso-global-music__stop{
        display:grid;place-items:center;padding:0;border:0;border-radius:50%;cursor:pointer
      }
      .cafasso-global-music__toggle{
        width:38px;height:38px;background:#efe0bd;color:#5a2c2b;box-shadow:0 3px 10px rgba(0,0,0,.18);font:700 15px/1 system-ui,sans-serif
      }
      .cafasso-global-music__stop{
        width:28px;height:28px;background:transparent;color:#a99682;font:19px/1 Georgia,serif
      }
      .cafasso-global-music__toggle:hover{transform:translateY(-1px);background:#f8ebcb}
      .cafasso-global-music__stop:hover{color:#f0d9bd;background:rgba(255,255,255,.05)}
      .cafasso-global-music__hidden-player{
        position:fixed!important;left:-10000px!important;top:0!important;width:2px!important;height:2px!important;
        overflow:hidden!important;opacity:.001!important;pointer-events:none!important
      }
      .cafasso-global-music__media{width:100%;height:100%;overflow:hidden}
      .cafasso-global-music__media iframe{display:block;width:100%!important;height:100%!important;border:0!important}
      .cafasso-global-music__media.is-attached{position:absolute;inset:0;width:100%;height:100%;opacity:1;pointer-events:auto}
      @media(max-width:680px){
        .cafasso-global-music{right:8px;bottom:max(8px,env(safe-area-inset-bottom));width:calc(100vw - 16px);grid-template-columns:38px minmax(0,1fr) 36px 28px;min-height:60px;padding:8px 8px 8px 9px}
        .cafasso-global-music__mark{width:38px;height:38px}.cafasso-global-music__toggle{width:36px;height:36px}
      }
      @media(prefers-reduced-motion:reduce){.cafasso-global-music__bars i{animation:none!important}}
    `;
    document.head.appendChild(style);
  }

  function ensureDom() {
    ensureStyles();
    if (!widget) {
      widget = document.getElementById(WIDGET_ID);
      if (!widget) {
        widget = document.createElement('aside');
        widget.id = WIDGET_ID;
        widget.className = 'cafasso-global-music';
        widget.hidden = true;
        widget.setAttribute('aria-label', 'Reproductor global de CAFASSO');
        widget.innerHTML = `
          <div class="cafasso-global-music__mark" aria-hidden="true">♪<span class="cafasso-global-music__bars"><i></i><i></i><i></i></span></div>
          <div class="cafasso-global-music__copy">
            <span class="cafasso-global-music__eyebrow" data-global-music-status>Ahora suena</span>
            <strong class="cafasso-global-music__title" data-global-music-title>Música</strong>
            <span class="cafasso-global-music__meta" data-global-music-meta></span>
          </div>
          <button class="cafasso-global-music__toggle" type="button" data-global-music-toggle aria-label="Pausar o reanudar">▶</button>
          <button class="cafasso-global-music__stop" type="button" data-global-music-stop aria-label="Detener música">×</button>
        `;
        document.body.appendChild(widget);
        widget.querySelector('[data-global-music-toggle]')?.addEventListener('click', () => toggle());
        widget.querySelector('[data-global-music-stop]')?.addEventListener('click', () => stop());
      }
    }

    if (!hiddenSlot) {
      hiddenSlot = document.querySelector('.cafasso-global-music__hidden-player');
      if (!hiddenSlot) {
        hiddenSlot = document.createElement('div');
        hiddenSlot.className = 'cafasso-global-music__hidden-player';
        hiddenSlot.setAttribute('aria-hidden', 'true');
        document.body.appendChild(hiddenSlot);
      }
    }

    if (!mediaShell) {
      mediaShell = document.createElement('div');
      mediaShell.className = 'cafasso-global-music__media';
      mediaNode = document.createElement('div');
      mediaNode.id = 'cafassoGlobalMusicYoutube';
      mediaShell.appendChild(mediaNode);
      hiddenSlot.appendChild(mediaShell);
    }
  }

  function renderWidget() {
    ensureDom();
    if (!state.track) {
      widget.hidden = true;
      widget.classList.remove('is-playing');
      return;
    }
    widget.hidden = false;
    widget.classList.toggle('is-playing', Boolean(state.playing && !state.needsGesture));
    const status = widget.querySelector('[data-global-music-status]');
    const title = widget.querySelector('[data-global-music-title]');
    const meta = widget.querySelector('[data-global-music-meta]');
    const toggleButton = widget.querySelector('[data-global-music-toggle]');
    if (status) status.textContent = state.needsGesture ? 'Tocá para continuar' : state.playing ? 'Ahora suena' : 'En pausa';
    if (title) title.textContent = state.track.title || 'Música';
    if (meta) meta.textContent = state.track.source || state.track.subtitle || state.track.categoryLabel || 'Cancionero CAFASSO';
    if (toggleButton) {
      const actualPlaying = Boolean(state.playing && !state.needsGesture);
      toggleButton.textContent = actualPlaying ? 'Ⅱ' : '▶';
      toggleButton.setAttribute('aria-label', actualPlaying ? 'Pausar música' : 'Reanudar música');
    }
  }

  function loadYoutubeApi() {
    if (window.YT?.Player) return Promise.resolve();
    if (window.__cafassoYoutubeApiPromise) return window.__cafassoYoutubeApiPromise;
    window.__cafassoYoutubeApiPromise = new Promise((resolve) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        try { if (typeof previous === 'function') previous(); } catch (error) {}
        resolve();
      };
      if (!document.querySelector(`script[src="${API_SRC}"]`)) {
        const script = document.createElement('script');
        script.src = API_SRC;
        script.async = true;
        document.head.appendChild(script);
      }
      const poll = setInterval(() => {
        if (window.YT?.Player) {
          clearInterval(poll);
          resolve();
        }
      }, 120);
    });
    return window.__cafassoYoutubeApiPromise;
  }

  async function ensurePlayer() {
    ensureDom();
    if (player) return player;
    await loadYoutubeApi();
    if (player) return player;

    const restoreTrack = state.track ? { ...state.track } : null;
    const restorePosition = currentPosition();
    const shouldRestorePlaying = Boolean(state.playing && !state.needsGesture);
    restoring = true;

    player = new YT.Player(mediaNode, {
      width:'100%',
      height:'100%',
      host:'https://www.youtube-nocookie.com',
      videoId:restoreTrack?.videoId || '',
      playerVars:{
        playsinline:1,
        rel:0,
        modestbranding:1,
        enablejsapi:1,
        origin:location.origin
      },
      events:{
        onReady:event => {
          playerReady = true;
          if (!restoreTrack) {
            restoring = false;
            return;
          }
          event.target.cueVideoById({ videoId:restoreTrack.videoId, startSeconds:restorePosition });
          setTimeout(() => {
            restoring = false;
            if (shouldRestorePlaying) {
              try { event.target.playVideo(); } catch (error) {}
              clearTimeout(restoreTimer);
              restoreTimer = window.setTimeout(() => {
                if (!player || player.getPlayerState?.() === YT.PlayerState.PLAYING) return;
                state.position = currentPosition();
                state.updatedAt = Date.now();
                state.playing = false;
                state.needsGesture = true;
                writeState();
                emit();
              }, 1800);
            }
          }, 120);
        },
        onStateChange:event => {
          if (restoring) return;
          clearTimeout(restoreTimer);
          const ps = event.data;
          if (ps === YT.PlayerState.PLAYING) {
            state.playing = true;
            state.needsGesture = false;
            state.position = Number(player.getCurrentTime?.() || state.position || 0);
            state.updatedAt = Date.now();
            writeState();
            emit();
          } else if (ps === YT.PlayerState.PAUSED) {
            state.position = Number(player.getCurrentTime?.() || state.position || 0);
            state.updatedAt = Date.now();
            state.playing = false;
            state.needsGesture = false;
            writeState();
            emit();
          } else if (ps === YT.PlayerState.ENDED) {
            state.position = 0;
            state.updatedAt = Date.now();
            state.playing = false;
            state.needsGesture = false;
            writeState();
            emit();
          }
        }
      }
    });
    return player;
  }

  async function play(track) {
    const clean = cleanTrack(track || state.track);
    if (!clean) return false;
    const sameTrack = state.track?.videoId === clean.videoId;
    state.track = clean;
    state.needsGesture = false;
    if (!sameTrack) state.position = 0;
    state.updatedAt = Date.now();
    state.playing = true;
    writeState();
    emit();

    const p = await ensurePlayer();
    try {
      if (!sameTrack) p.loadVideoById({ videoId:clean.videoId, startSeconds:0 });
      else if (playerReady) p.playVideo();
    } catch (error) {}
    return true;
  }

  function pause() {
    if (!state.track) return;
    state.position = currentPosition();
    state.updatedAt = Date.now();
    state.playing = false;
    state.needsGesture = false;
    try { player?.pauseVideo?.(); } catch (error) {}
    writeState();
    emit();
  }

  function toggle() {
    if (!state.track) return;
    if (state.playing && !state.needsGesture) pause();
    else play(state.track);
  }

  function stop() {
    if (state.track) state.position = currentPosition();
    try { player?.stopVideo?.(); } catch (error) {}
    state = { track:null, playing:false, position:0, updatedAt:Date.now(), needsGesture:false };
    writeState();
    detachVideo();
    emit();
  }

  function attachVideo(container) {
    if (!container) return false;
    ensureDom();
    attachedContainer = container;
    container.innerHTML = '';
    mediaShell.classList.add('is-attached');
    container.appendChild(mediaShell);
    if (state.track) ensurePlayer();
    return true;
  }

  function detachVideo() {
    ensureDom();
    attachedContainer = null;
    mediaShell.classList.remove('is-attached');
    hiddenSlot.appendChild(mediaShell);
  }

  function boot() {
    ensureDom();
    renderWidget();
    if (state.track) ensurePlayer();
    window.addEventListener('pagehide', persistFromPlayer);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') persistFromPlayer();
    });
  }

  window.CafassoGlobalMusic = {
    play,
    pause,
    toggle,
    stop,
    attachVideo,
    detachVideo,
    getState:snapshot,
    persist:persistFromPlayer
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();