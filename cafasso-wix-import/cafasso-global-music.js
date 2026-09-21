(() => {
  if (window.CafassoGlobalMusic) return;

  const STORAGE_KEY = 'cafasso-global-music-v1';
  const STYLE_ID = 'cafassoGlobalMusicStyles';
  const WIDGET_ID = 'cafassoGlobalMusicWidget';
  let state = readState();
  let iframe = null;
  let mediaShell = null;
  let hiddenSlot = null;
  let widget = null;
  let attachedContainer = null;
  let progressTimer = null;

  function cleanTrack(track) {
    if (!track || (!track.videoId && !track.spotifyUri)) return null;
    return {
      id: String(track.id || track.spotifyUri || track.videoId),
      title: String(track.title || 'Música'),
      subtitle: String(track.subtitle || track.categoryLabel || ''),
      source: String(track.source || track.categoryLabel || ''),
      categoryLabel: String(track.categoryLabel || ''),
      videoId: String(track.videoId || ''),
      spotifyUri: String(track.spotifyUri || ''),
      spotifyUrl: String(track.spotifyUrl || ''),
      image: String(track.image || ''),
      durationMs: Number(track.durationMs || 0),
      provider: String(track.provider || (track.spotifyUri ? 'spotify' : 'youtube'))
    };
  }

  function readState() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (!raw?.track?.videoId && !raw?.track?.spotifyUri) return { track:null, playing:false, position:0, updatedAt:Date.now(), needsGesture:false };
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

  function durationSeconds() {
    return Math.max(0, Number(state.track?.durationMs || 0) / 1000);
  }

  function currentPosition() {
    if (!state.track) return 0;
    const raw = state.playing && !state.needsGesture
      ? Math.max(0, Number(state.position || 0) + (Date.now() - Number(state.updatedAt || Date.now())) / 1000)
      : Math.max(0, Number(state.position || 0));
    const duration = durationSeconds();
    return duration > 0 ? Math.min(raw, duration) : raw;
  }

  function formatTime(seconds) {
    const value = Math.max(0, Math.floor(Number(seconds || 0)));
    const minutes = Math.floor(value / 60);
    const secs = String(value % 60).padStart(2, '0');
    return `${minutes}:${secs}`;
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
      position: currentPosition(),
      duration: durationSeconds()
    };
  }

  function emit() {
    renderWidget();
    renderAttachedView();
    window.dispatchEvent(new CustomEvent('cafasso:global-music-state', { detail:snapshot() }));
  }

  function persistFromPlayer() {
    if (!state.track) return;
    state.position = currentPosition();
    state.updatedAt = Date.now();
    writeState();
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-global-music{
        position:fixed;right:18px;bottom:18px;z-index:2147483000;
        display:grid;grid-template-columns:42px minmax(0,1fr) auto;grid-template-rows:auto auto;align-items:center;gap:8px 10px;
        width:min(430px,calc(100vw - 28px));min-height:82px;padding:10px 10px 9px 10px;
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
      .cafasso-global-music__mark{grid-column:1;grid-row:1 / span 2}
      .cafasso-global-music__copy{grid-column:2;grid-row:1;min-width:0}
      .cafasso-global-music__controls{grid-column:3;grid-row:1;display:flex;align-items:center;gap:4px}
      .cafasso-global-music__progress{grid-column:2 / 4;grid-row:2;display:grid;grid-template-columns:31px minmax(0,1fr) 31px;align-items:center;gap:7px}
      .cafasso-global-music__time{color:#aa9681;font:8.5px/1 Inter,system-ui,sans-serif;font-variant-numeric:tabular-nums;text-align:center}
      .cafasso-global-music__seek{width:100%;height:14px;margin:0;accent-color:#d7b06e;cursor:pointer;background:transparent}
      .cafasso-global-music__seek:disabled{opacity:.35;cursor:default}
      .cafasso-global-music__eyebrow{display:block;margin-bottom:3px;color:#c8a77a;font:700 8px/1 Inter,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase}
      .cafasso-global-music__title{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#fff7e8;font:600 15px/1.15 Georgia,serif}
      .cafasso-global-music__meta{display:block;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#bea995;font:10px/1.2 Georgia,serif;font-style:italic}
      .cafasso-global-music__toggle,.cafasso-global-music__stop,.cafasso-global-music__skip{
        display:grid;place-items:center;padding:0;border:0;border-radius:50%;cursor:pointer
      }
      .cafasso-global-music__toggle{
        width:36px;height:36px;background:#efe0bd;color:#5a2c2b;box-shadow:0 3px 10px rgba(0,0,0,.18);font:700 14px/1 system-ui,sans-serif
      }
      .cafasso-global-music__skip{
        width:26px;height:26px;background:transparent;color:#d7bea0;font:700 12px/1 system-ui,sans-serif
      }
      .cafasso-global-music__stop{
        width:24px;height:24px;background:transparent;color:#a99682;font:18px/1 Georgia,serif
      }
      .cafasso-global-music__toggle:hover{transform:translateY(-1px);background:#f8ebcb}
      .cafasso-global-music__skip:hover,.cafasso-global-music__stop:hover{color:#f0d9bd;background:rgba(255,255,255,.05)}
      .cafasso-global-music__skip[hidden]{display:none!important}
      .cafasso-global-music__hidden-player{
        position:fixed!important;left:-10000px!important;top:0!important;width:2px!important;height:2px!important;
        overflow:hidden!important;opacity:.001!important;pointer-events:none!important
      }
      .cafasso-global-music__media{width:100%;height:100%;overflow:hidden}
      .cafasso-global-music__media iframe{display:block;width:100%!important;height:100%!important;border:0!important}
      .cafasso-global-music__book-display{
        position:absolute;inset:0;display:grid;place-items:center;padding:24px;text-align:center;
        background:
          radial-gradient(circle at 50% 42%,rgba(126,78,58,.08),transparent 34%),
          repeating-linear-gradient(180deg,transparent 0 27px,rgba(111,79,44,.045) 27px 28px),
          #eadcc0;color:#6f5643;font-family:Georgia,serif
      }
      .cafasso-global-music__book-display-inner{max-width:90%;width:100%}
      .cafasso-global-music__book-display-inner.has-cover{display:grid;grid-template-columns:minmax(98px,42%) minmax(0,1fr);grid-template-rows:auto auto auto;align-items:center;column-gap:18px;text-align:left;max-width:100%}
      .cafasso-global-music__book-cover{display:block;grid-column:1;grid-row:1 / span 3;width:100%;aspect-ratio:1;margin:0;object-fit:contain;border:6px solid #ead9bb;outline:1px solid rgba(102,69,40,.17);box-shadow:0 7px 16px rgba(69,44,27,.16);background:#dfccb0}
      .cafasso-global-music__book-display-inner.has-cover .cafasso-global-music__book-status{grid-column:2;grid-row:1;align-self:end}
      .cafasso-global-music__book-display-inner.has-cover .cafasso-global-music__book-title{grid-column:2;grid-row:2}
      .cafasso-global-music__book-display-inner.has-cover .cafasso-global-music__book-meta{grid-column:2;grid-row:3;align-self:start}
      .cafasso-global-music__book-note{display:block;margin:0 auto 10px;color:#8b3a35;font:34px/1 Georgia,serif}
      .cafasso-global-music__book-status{display:block;margin-bottom:7px;color:#9a7650;font:700 8px/1 Georgia,serif;letter-spacing:.15em;text-transform:uppercase}
      .cafasso-global-music__book-title{display:block;color:#6f2f2c;font:600 22px/1.12 Georgia,serif}
      .cafasso-global-music__book-meta{display:block;margin-top:7px;color:#8a725f;font:italic 11px/1.35 Georgia,serif}
      @media(max-width:680px){
        .cafasso-global-music{right:8px;bottom:max(8px,env(safe-area-inset-bottom));width:calc(100vw - 16px);grid-template-columns:38px minmax(0,1fr) auto;min-height:78px;padding:8px 8px 7px 9px}
        .cafasso-global-music__mark{width:38px;height:38px}.cafasso-global-music__toggle{width:34px;height:34px}.cafasso-global-music__skip{width:23px;height:23px}
        .cafasso-global-music__progress{grid-template-columns:29px minmax(0,1fr) 29px;gap:5px}
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
          <div class="cafasso-global-music__controls">
            <button class="cafasso-global-music__skip" type="button" data-global-music-prev aria-label="Tema anterior">◀</button>
            <button class="cafasso-global-music__toggle" type="button" data-global-music-toggle aria-label="Pausar o reanudar">▶</button>
            <button class="cafasso-global-music__skip" type="button" data-global-music-next aria-label="Tema siguiente">▶</button>
            <button class="cafasso-global-music__stop" type="button" data-global-music-stop aria-label="Detener música">×</button>
          </div>
          <div class="cafasso-global-music__progress">
            <span class="cafasso-global-music__time" data-global-music-current>0:00</span>
            <input class="cafasso-global-music__seek" data-global-music-seek type="range" min="0" max="0" step="0.1" value="0" aria-label="Posición de reproducción">
            <span class="cafasso-global-music__time" data-global-music-duration>0:00</span>
          </div>
        `;
        document.body.appendChild(widget);
        widget.querySelector('[data-global-music-toggle]')?.addEventListener('click', () => toggle());
        widget.querySelector('[data-global-music-prev]')?.addEventListener('click', () => previous());
        widget.querySelector('[data-global-music-next]')?.addEventListener('click', () => next());
        widget.querySelector('[data-global-music-stop]')?.addEventListener('click', () => stop());
        widget.querySelector('[data-global-music-seek]')?.addEventListener('input', event => {
          const current = widget.querySelector('[data-global-music-current]');
          if (current) current.textContent = formatTime(event.target?.value || 0);
        });
        widget.querySelector('[data-global-music-seek]')?.addEventListener('change', event => seekTo(Number(event.target?.value || 0)));
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
      hiddenSlot.appendChild(mediaShell);
    }
  }

  function syncProgressTimer() {
    const shouldRun = Boolean(state.track && state.playing && !state.needsGesture);
    if (shouldRun && !progressTimer) progressTimer = setInterval(updateProgressUi, 500);
    if (!shouldRun && progressTimer) {
      clearInterval(progressTimer);
      progressTimer = null;
    }
  }

  function updateProgressUi() {
    if (!widget || !state.track) return;
    const seek = widget.querySelector('[data-global-music-seek]');
    const current = widget.querySelector('[data-global-music-current]');
    const duration = widget.querySelector('[data-global-music-duration]');
    const total = durationSeconds();
    const position = currentPosition();
    if (seek) {
      seek.max = String(Math.max(0, total));
      seek.value = String(Math.min(position, total || position));
      seek.disabled = total <= 0;
    }
    if (current) current.textContent = formatTime(position);
    if (duration) duration.textContent = formatTime(total);
  }

  function renderWidget() {
    ensureDom();
    if (!state.track) {
      widget.hidden = true;
      widget.classList.remove('is-playing');
      syncProgressTimer();
      return;
    }
    widget.hidden = false;
    widget.classList.toggle('is-playing', Boolean(state.playing && !state.needsGesture));
    const status = widget.querySelector('[data-global-music-status]');
    const title = widget.querySelector('[data-global-music-title]');
    const meta = widget.querySelector('[data-global-music-meta]');
    const toggleButton = widget.querySelector('[data-global-music-toggle]');
    const prevButton = widget.querySelector('[data-global-music-prev]');
    const nextButton = widget.querySelector('[data-global-music-next]');
    if (status) {
      const provider = state.track?.provider === 'spotify' ? 'Spotify · ' : '';
      status.textContent = provider + (state.needsGesture ? 'Tocá para continuar' : state.playing ? 'Ahora suena' : 'En pausa');
    }
    if (title) title.textContent = state.track.title || 'Música';
    if (meta) meta.textContent = state.track.source || state.track.subtitle || state.track.categoryLabel || 'Cancionero CAFASSO';
    if (toggleButton) {
      const actualPlaying = Boolean(state.playing && !state.needsGesture);
      toggleButton.textContent = actualPlaying ? 'Ⅱ' : '▶';
      toggleButton.setAttribute('aria-label', actualPlaying ? 'Pausar música' : 'Reanudar música');
    }
    const hasSequence = Boolean(state.track?.spotifyUri && window.CafassoSpotify?.isAuthenticated?.());
    if (prevButton) prevButton.hidden = !hasSequence;
    if (nextButton) nextButton.hidden = !hasSequence;
    updateProgressUi();
    syncProgressTimer();
  }

  function playerUrl(track, { autoplay = false, start = 0 } = {}) {
    const seconds = Math.max(0, Math.floor(Number(start || 0)));
    const params = new URLSearchParams({
      autoplay: autoplay ? '1' : '0',
      enablejsapi: '1',
      playsinline: '1',
      rel: '0',
      modestbranding: '1',
      start: String(seconds)
    });
    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(track.videoId)}?${params.toString()}`;
  }

  function createIframe({ autoplay = false, start = currentPosition(), force = false } = {}) {
    ensureDom();
    if (!state.track?.videoId) return null;
    if (iframe && !force) return iframe;

    if (iframe) iframe.remove();
    iframe = document.createElement('iframe');
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.title = `Música: ${state.track.title || 'CAFASSO'}`;
    iframe.src = playerUrl(state.track, { autoplay, start });
    iframe.setAttribute('allowfullscreen', '');
    mediaShell.replaceChildren(iframe);
    return iframe;
  }

  function sendCommand(func) {
    if (!iframe?.contentWindow) return false;
    try {
      iframe.contentWindow.postMessage(JSON.stringify({ event:'command', func, args:[] }), '*');
      return true;
    } catch (error) {
      return false;
    }
  }

  async function play(track) {
    const clean = cleanTrack(track || state.track);
    if (!clean) return false;

    if (clean.spotifyUri && window.CafassoSpotify?.isAuthenticated?.()) {
      state.track = clean;
      state.position = 0;
      state.updatedAt = Date.now();
      state.playing = true;
      state.needsGesture = false;
      if (iframe) {
        iframe.remove();
        iframe = null;
      }
      writeState();
      emit();
      try {
        await window.CafassoSpotify.playTrack(clean);
        return true;
      } catch (error) {
        state.playing = false;
        state.needsGesture = true;
        writeState();
        emit();
        console.warn('CAFASSO Spotify playback:', error);
        return false;
      }
    }

    if (!clean.videoId) return false;
    const sameTrack = state.track?.videoId === clean.videoId;
    const resumeAt = sameTrack ? currentPosition() : 0;
    state.track = clean;
    state.position = resumeAt;
    state.updatedAt = Date.now();
    state.playing = true;
    state.needsGesture = false;
    writeState();

    if (!sameTrack || !iframe) createIframe({ autoplay:true, start:resumeAt, force:true });
    else if (!sendCommand('playVideo')) createIframe({ autoplay:true, start:resumeAt, force:true });

    emit();
    return true;
  }

  async function pause() {
    if (!state.track) return;
    state.position = currentPosition();
    state.updatedAt = Date.now();
    state.playing = false;
    state.needsGesture = false;
    if (state.track.spotifyUri && window.CafassoSpotify?.isAuthenticated?.()) {
      try { await window.CafassoSpotify.pause(); } catch (error) {}
    } else {
      sendCommand('pauseVideo');
    }
    writeState();
    emit();
  }

  async function toggle() {
    if (!state.track) return;
    if (state.track.spotifyUri && window.CafassoSpotify?.isAuthenticated?.()) {
      try {
        await window.CafassoSpotify.toggle();
        return;
      } catch (error) {}
    }
    if (state.playing && !state.needsGesture) pause();
    else play(state.track);
  }

  async function seekTo(seconds) {
    if (!state.track) return;
    const target = Math.max(0, Math.min(Number(seconds || 0), durationSeconds() || Number(seconds || 0)));
    if (state.track.spotifyUri && window.CafassoSpotify?.isAuthenticated?.()) {
      try { await window.CafassoSpotify.seek(target); } catch (error) { return; }
    } else {
      return;
    }
    state.position = target;
    state.updatedAt = Date.now();
    writeState();
    emit();
  }

  async function previous() {
    if (!state.track?.spotifyUri || !window.CafassoSpotify?.isAuthenticated?.()) return;
    try { await window.CafassoSpotify.previous(state.track.spotifyUri); } catch (error) {}
  }

  async function next() {
    if (!state.track?.spotifyUri || !window.CafassoSpotify?.isAuthenticated?.()) return;
    try { await window.CafassoSpotify.next(state.track.spotifyUri); } catch (error) {}
  }

  async function stop() {
    if (state.track?.spotifyUri && window.CafassoSpotify?.isAuthenticated?.()) {
      try { await window.CafassoSpotify.pause(); } catch (error) {}
    } else {
      try { sendCommand('stopVideo'); } catch (error) {}
    }
    state = { track:null, playing:false, position:0, updatedAt:Date.now(), needsGesture:false };
    writeState();
    if (iframe) {
      iframe.remove();
      iframe = null;
    }
    detachVideo();
    emit();
  }

  function renderAttachedView() {
    if (!attachedContainer) return;
    if (!state.track) {
      attachedContainer.innerHTML = '<div class="cafasso-songbook-player__empty">Elegí una música y dejá que el sonido acompañe la oración.</div>';
      return;
    }
    const status = state.needsGesture ? 'Tocá el reproductor para continuar' : state.playing ? 'Reproduciendo en CAFASSO' : 'En pausa';
    const meta = state.track.source || state.track.subtitle || state.track.categoryLabel || 'Cancionero CAFASSO';
    const hasCover = Boolean(state.track.image);
    const cover = hasCover
      ? `<img class="cafasso-global-music__book-cover" src="${state.track.image}" alt="" decoding="async">`
      : '<span class="cafasso-global-music__book-note">♪</span>';
    attachedContainer.innerHTML = `
      <div class="cafasso-global-music__book-display" aria-hidden="true">
        <div class="cafasso-global-music__book-display-inner${hasCover ? ' has-cover' : ''}">
          ${cover}
          <span class="cafasso-global-music__book-status">${status}</span>
          <strong class="cafasso-global-music__book-title">${state.track.title || 'Música'}</strong>
          <span class="cafasso-global-music__book-meta">${meta}</span>
        </div>
      </div>`;

    const coverImage = attachedContainer.querySelector('.cafasso-global-music__book-cover');
    coverImage?.addEventListener('error', () => {
      const inner = coverImage.closest('.cafasso-global-music__book-display-inner');
      if (!inner) return;
      inner.classList.remove('has-cover');
      const note = document.createElement('span');
      note.className = 'cafasso-global-music__book-note';
      note.textContent = '♪';
      coverImage.replaceWith(note);
    }, { once:true });
  }

  function attachVideo(container) {
    if (!container) return false;
    ensureDom();
    attachedContainer = container;

    // El iframe real nunca sale del reproductor oculto: mover un iframe de YouTube
    // dentro del DOM lo recarga. En el libro mostramos una vista propia de CAFASSO.
    if (mediaShell.parentNode !== hiddenSlot) hiddenSlot.appendChild(mediaShell);
    renderAttachedView();
    if (state.track?.videoId && !iframe) createIframe({ autoplay:state.playing, start:currentPosition() });
    return true;
  }

  function detachVideo() {
    ensureDom();
    attachedContainer = null;
    if (mediaShell.parentNode !== hiddenSlot) hiddenSlot.appendChild(mediaShell);
  }

  function boot() {
    ensureDom();
    renderWidget();
    if (state.track?.videoId) {
      createIframe({
        autoplay:Boolean(state.playing && !state.needsGesture),
        start:currentPosition(),
        force:true
      });
    }
    window.addEventListener('cafasso:spotify-state', event => {
      const detail = event.detail || {};
      if (!detail.track) return;
      const next = cleanTrack(detail.track);
      if (!next) return;
      if (state.track && state.track.id === next.id) {
        if (!next.image) next.image = state.track.image || '';
        if (!next.spotifyUrl) next.spotifyUrl = state.track.spotifyUrl || '';
      }
      state.track = next;
      state.playing = Boolean(detail.playing);
      state.needsGesture = false;
      state.position = Math.max(0, Number(detail.position || 0));
      state.updatedAt = Date.now();
      writeState();
      emit();
    });

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
    seek:seekTo,
    previous,
    next,
    attachVideo,
    detachVideo,
    getState:snapshot,
    persist:persistFromPlayer
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();