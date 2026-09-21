(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('space') !== 'parroquia') return;
  if (window.__cafassoParishSongbookInstalled) return;
  window.__cafassoParishSongbookInstalled = true;

  const STYLE_ID = 'cafassoParishSongbookStyles';
  const SONGBOOK_IMAGE = 'https://static.wixstatic.com/media/47bf07_697589d0c0e14387bd1014e8ba3e9b5a~mv2.png';

  const GROUPS = [
    { id:'spotify', title:'Spotify · CAFASSO', copy:'Tu playlist “CAFASSO · Cancionero”, reproducida directamente desde Spotify.' }
  ];

  let tracks = [];
  let tracksPromise = null;
  let activeTrack = null;
  let playing = false;
  let spotifyStatus = '';
  let searchQuery = '';

  function musicHost() {
    try {
      if (window.parent !== window && window.parent.CafassoGlobalMusic) return window.parent;
    } catch (error) {}
    return window;
  }

  function musicApi() {
    return musicHost().CafassoGlobalMusic || null;
  }

  function spotifyApi() {
    return musicHost().CafassoSpotify || null;
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  }

  function normalizeSearch(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function matchesSearch(track) {
    const query = normalizeSearch(searchQuery);
    if (!query) return true;
    return normalizeSearch([track?.title, track?.subtitle, track?.source].filter(Boolean).join(' ')).includes(query);
  }

  async function loadTracks(force = false) {
    if (tracksPromise && !force) return tracksPromise;
    tracksPromise = (async () => {
      tracks = [];
      spotifyStatus = '';
      const spotify = spotifyApi();

      if (!spotify?.isConfigured?.()) {
        spotifyStatus = 'Spotify todavía no está configurado para este Cancionero.';
        return tracks;
      }

      if (!spotify.isAuthenticated?.()) {
        spotifyStatus = 'Conectá tu cuenta de Spotify para abrir “CAFASSO · Cancionero”.';
        return tracks;
      }

      try {
        const info = await spotify.getConnectionInfo?.(true);
        const who = info?.profile?.displayName ? `Cuenta: ${info.profile.displayName}. ` : '';

        if (info?.profile && !info.premium) {
          spotifyStatus = `${who}Spotify Premium es necesario para reproducir dentro de CAFASSO.`;
          return tracks;
        }

        const result = await spotify.getCancioneroTracks();
        if (!result?.playlist) {
          spotifyStatus = `${who}No encontré una playlist llamada “CAFASSO · Cancionero” en esta cuenta.`;
          return tracks;
        }

        if (!result.tracks?.length) {
          spotifyStatus = `${who}“${result.playlist.name || 'CAFASSO · Cancionero'}” está conectada, pero todavía no tiene temas disponibles.`;
          return tracks;
        }

        tracks = result.tracks;
        spotifyStatus = `${who}Conectado a “${result.playlist.name || 'CAFASSO · Cancionero'}” · ${result.tracks.length} ${result.tracks.length === 1 ? 'tema' : 'temas'}.`;
        return tracks;
      } catch (error) {
        spotifyStatus = `Spotify está conectado, pero hubo un problema: ${error?.message || 'no pude leer el Cancionero'}.`;
        return tracks;
      }
    })();
    return tracksPromise;
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-parish-songbook{position:absolute;left:9.2%;bottom:12.2%;z-index:7;width:172px;height:118px;padding:0;border:0;background:transparent;cursor:pointer;filter:drop-shadow(0 13px 10px rgba(0,0,0,.42));transform:perspective(650px) rotateX(5deg) rotateZ(-4deg);transform-origin:50% 100%;transition:transform .22s ease,filter .22s ease}
      .cafasso-parish-songbook:hover{transform:perspective(650px) rotateX(2deg) rotateZ(-2.2deg) translateY(-5px) scale(1.03);filter:drop-shadow(0 18px 14px rgba(0,0,0,.48)) brightness(1.04)}
      .cafasso-parish-songbook:focus-visible{outline:3px solid #e9c569;outline-offset:6px;border-radius:7px}
      .cafasso-parish-songbook__image{display:block;width:100%;height:100%;object-fit:contain;object-position:center;pointer-events:none;user-select:none;filter:drop-shadow(0 5px 4px rgba(45,27,15,.18))}
      .cafasso-parish-songbook__book{position:absolute;left:13px;right:10px;top:10px;height:88px;border:1px solid rgba(73,39,31,.75);border-radius:5px 4px 7px 5px;background:repeating-linear-gradient(8deg,rgba(255,255,255,.025) 0 1px,transparent 1px 7px),linear-gradient(108deg,#4d171b 0%,#7c2729 24%,#5f1b20 52%,#8b3432 77%,#4a1519 100%);box-shadow:inset 0 0 0 2px rgba(225,184,115,.15),inset 7px 0 13px rgba(255,213,151,.05),inset -8px 0 14px rgba(36,12,13,.25),0 4px 4px rgba(31,18,13,.25);overflow:hidden}
      .cafasso-parish-songbook__book:before{content:"";position:absolute;left:6px;right:6px;top:6px;bottom:6px;border:1px solid rgba(221,183,108,.31);border-radius:3px;pointer-events:none}
      .cafasso-parish-songbook__book:after{content:"";position:absolute;left:8px;right:-3px;bottom:-8px;height:14px;border-radius:0 0 4px 4px;background:repeating-linear-gradient(180deg,#eadfc4 0 1px,#cbb995 1px 2px);box-shadow:0 4px 6px rgba(0,0,0,.25);transform:skewX(-3deg)}
      .cafasso-parish-songbook__cross{position:absolute;left:50%;top:17px;transform:translateX(-50%);color:#d9b469;font:21px/1 Georgia,serif;text-shadow:0 1px rgba(40,17,17,.7)}
      .cafasso-parish-songbook__title{position:absolute;left:8px;right:8px;top:48px;color:#f0d6a1;font:700 10px/1.1 Georgia,serif;letter-spacing:.1em;text-transform:uppercase;text-align:center;text-shadow:0 1px 2px rgba(30,12,14,.7)}
      .cafasso-parish-songbook__ribbon{position:absolute;left:41px;bottom:-14px;width:12px;height:32px;background:linear-gradient(90deg,#8e1f25,#bd3c3e,#74171d);clip-path:polygon(0 0,100% 0,100% 78%,50% 100%,0 78%);box-shadow:0 3px 3px rgba(0,0,0,.2)}
      .cafasso-parish-songbook__note{position:absolute;right:17px;bottom:6px;color:rgba(240,214,161,.68);font:italic 9px/1 Georgia,serif}

      .cafasso-songbook-panel{position:fixed;inset:0;z-index:78;display:flex;align-items:center;justify-content:center;padding:24px;background:radial-gradient(circle at 50% 34%,rgba(73,51,34,.12),rgba(5,12,11,.8) 72%);backdrop-filter:blur(8px) saturate(.8)}
      .cafasso-songbook-panel[hidden]{display:none!important}
      .cafasso-songbook-sheet{position:relative;width:min(900px,95vw);max-height:90vh;overflow:auto;padding:38px 42px 34px;border:1px solid rgba(91,62,34,.5);border-radius:5px;background:repeating-linear-gradient(0deg,rgba(105,72,39,.026) 0 1px,transparent 1px 9px),linear-gradient(145deg,#f9efd8 0%,#efdfbf 67%,#e5cc9e 100%);box-shadow:0 34px 90px rgba(0,0,0,.58),inset 0 0 0 4px rgba(255,251,239,.28);color:#3e3025;font-family:Georgia,serif}
      .cafasso-songbook-sheet:before{content:"";position:absolute;left:24px;top:24px;bottom:24px;width:1px;background:rgba(119,83,45,.15)}
      .cafasso-songbook-close{position:absolute;right:15px;top:14px;width:38px;height:38px;border:1px solid rgba(87,60,33,.18);border-radius:50%;background:rgba(248,238,218,.82);color:#503d2d;font:28px/1 Georgia,serif;cursor:pointer}
      .cafasso-songbook-kicker{margin-left:8px;color:#8e6b47;font:800 9px/1.2 Inter,system-ui,sans-serif;letter-spacing:.17em;text-transform:uppercase}
      .cafasso-songbook-sheet h2{margin:7px 0 7px 8px;color:#443326;font:500 clamp(34px,5vw,50px)/1 Georgia,serif}
      .cafasso-songbook-lead{margin:0 0 24px 8px;max-width:650px;color:#796550;font:italic 14px/1.5 Georgia,serif}
      .cafasso-songbook-layout{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(280px,.9fr);gap:25px;margin:0 8px}
      .cafasso-songbook-groups{display:grid;gap:18px}
      .cafasso-songbook-group{padding-top:14px;border-top:1px solid rgba(111,77,42,.18)}
      .cafasso-songbook-group:first-child{padding-top:0;border-top:0}
      .cafasso-songbook-group__title{display:flex;align-items:baseline;gap:10px;margin-bottom:4px}.cafasso-songbook-group__title strong{color:#4b392b;font:600 19px/1.1 Georgia,serif}.cafasso-songbook-group__title span{color:#987756;font:800 7px/1 Inter,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase}
      .cafasso-songbook-group__copy{margin:0 0 10px;color:#8a725a;font:12px/1.45 Inter,system-ui,sans-serif}
      .cafasso-songbook-track{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;padding:10px 3px;border-top:1px solid rgba(111,77,42,.1)}
      .cafasso-songbook-track__copy{min-width:0}.cafasso-songbook-track__copy strong{display:block;color:#4d3c2f;font:600 13px/1.25 Inter,system-ui,sans-serif}.cafasso-songbook-track__copy span{display:block;margin-top:3px;color:#91785f;font:10.5px/1.35 Inter,system-ui,sans-serif}
      .cafasso-songbook-play{min-width:78px;padding:8px 11px;border:1px solid rgba(114,79,43,.35);border-radius:4px;background:rgba(255,249,234,.38);color:#604a36;font:800 10px/1 Inter,system-ui,sans-serif;cursor:pointer;transition:background .16s ease,transform .16s ease}
      .cafasso-songbook-play:hover{transform:translateY(-1px);background:rgba(255,249,234,.68)}
      .cafasso-songbook-play.is-playing{background:linear-gradient(#795536,#67472d);border-color:#745234;color:#fff8e8}
      .cafasso-songbook-player{position:sticky;top:0;align-self:start;padding:18px;border:1px solid rgba(111,77,42,.19);background:rgba(255,250,238,.26);box-shadow:inset 0 0 20px rgba(94,62,31,.035)}
      .cafasso-songbook-player__kicker{color:#957554;font:800 8px/1 Inter,system-ui,sans-serif;letter-spacing:.15em;text-transform:uppercase}
      .cafasso-songbook-player h3{margin:7px 0 4px;color:#463528;font:500 25px/1.05 Georgia,serif}
      .cafasso-songbook-player p{margin:0;color:#806b56;font:11.5px/1.45 Inter,system-ui,sans-serif}
      .cafasso-songbook-player__frame{margin-top:14px;aspect-ratio:16/9;border:1px solid rgba(101,68,37,.22);background:linear-gradient(145deg,#2b2620,#151817);box-shadow:0 8px 18px rgba(48,32,19,.16);overflow:hidden}
      .cafasso-songbook-player__frame iframe{display:block;width:100%;height:100%;border:0}
      .cafasso-songbook-player__empty{height:100%;display:grid;place-items:center;padding:22px;color:rgba(255,248,231,.62);font:italic 13px/1.5 Georgia,serif;text-align:center}
      .cafasso-songbook-player__source{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:11px;color:#8a7159;font:9px/1.3 Inter,system-ui,sans-serif}
      .cafasso-songbook-player__source a{color:#735338;font-weight:800;text-decoration:none}
      .cafasso-songbook-footnote{margin:20px 8px 0;padding-top:13px;border-top:1px solid rgba(111,77,42,.13);color:#8c755e;font:10px/1.45 Inter,system-ui,sans-serif}
      .cafasso-songbook-spotify-status{margin:0 0 16px;padding:10px 12px;border:1px solid rgba(30,215,96,.18);border-radius:6px;background:rgba(30,215,96,.045);color:#665342;font:italic 11px/1.45 Georgia,serif}
      .cafasso-songbook-spotify-connect{margin-top:8px;padding:7px 11px;border:1px solid rgba(62,92,65,.32);border-radius:999px;background:rgba(36,91,54,.08);color:#345b3f;font:700 10px/1 Georgia,serif;cursor:pointer}
      .cafasso-songbook-spotify-connect:hover{background:rgba(36,91,54,.14)}
      @media(max-width:760px){
        .cafasso-parish-songbook{left:4.5%;bottom:11.2%;width:124px;height:89px}.cafasso-parish-songbook__book{left:9px;right:7px;top:7px;height:65px}.cafasso-parish-songbook__cross{top:11px;font-size:17px}.cafasso-parish-songbook__title{top:36px;font-size:7px}.cafasso-parish-songbook__ribbon{left:30px;width:9px;height:25px}.cafasso-parish-songbook__note{right:11px;bottom:4px;font-size:6.5px}
        .cafasso-songbook-panel{padding:10px;align-items:flex-end}.cafasso-songbook-sheet{width:100%;max-height:92vh;padding:31px 21px 24px;border-radius:13px 13px 0 0}.cafasso-songbook-sheet:before{display:none}.cafasso-songbook-kicker,.cafasso-songbook-sheet h2,.cafasso-songbook-lead{margin-left:0}.cafasso-songbook-layout{grid-template-columns:1fr;margin:0;gap:18px}.cafasso-songbook-player{position:relative;order:-1}.cafasso-songbook-footnote{margin-left:0;margin-right:0}
      }
      @media(prefers-reduced-motion:reduce){.cafasso-parish-songbook,.cafasso-songbook-play{transition:none!important}}
    `;
    document.head.appendChild(style);
  }

  function setButtonStates() {
    document.querySelectorAll('.cafasso-songbook-track').forEach(row => {
      const isSelected = row.dataset.trackId === activeTrack?.id;
      row.classList.toggle('is-active', isSelected);
      row.classList.toggle('is-playing', isSelected && playing);
    });
    document.querySelectorAll('.cafasso-songbook-play').forEach(button => {
      const isSelected = button.dataset.trackId === activeTrack?.id;
      const isActive = isSelected && playing;
      button.classList.toggle('is-playing', isActive);
      button.classList.toggle('is-active', isSelected);
      button.textContent = isActive ? 'Pausar' : isSelected ? 'Reanudar' : 'Escuchar';
    });
  }

  function syncSongbookUi(snapshot = musicApi()?.getState?.()) {
    activeTrack = snapshot?.track || null;
    playing = Boolean(snapshot?.playing);
    setButtonStates();

    const title = document.querySelector('[data-songbook-now-title]');
    const copy = document.querySelector('[data-songbook-now-copy]');
    const source = document.querySelector('[data-songbook-source]');
    const frame = document.querySelector('[data-songbook-frame]');
    const panel = document.querySelector('.cafasso-songbook-panel');

    if (!activeTrack) {
      if (title) title.textContent = 'Todavía no elegiste una música';
      if (copy) copy.textContent = 'No se reproduce nada automáticamente.';
      if (source) source.innerHTML = '<span>La música comienza solo cuando vos la elegís.</span>';
      if (frame && !frame.querySelector('.cafasso-global-music__media')) {
        frame.innerHTML = '<div class="cafasso-songbook-player__empty">Elegí una música y dejá que el sonido acompañe la oración.</div>';
      }
      return;
    }

    if (title) title.textContent = activeTrack.title || 'Música';
    if (copy) copy.textContent = activeTrack.subtitle || activeTrack.categoryLabel || '';
    if (source) {
      const label = activeTrack.source || activeTrack.categoryLabel || 'Cancionero CAFASSO';
      const spotifyLink = activeTrack.spotifyUrl
        ? `<a href="${esc(activeTrack.spotifyUrl)}" target="_blank" rel="noopener noreferrer">Abrir en Spotify ↗</a>`
        : '<span>Spotify</span>';
      source.innerHTML = `<span>${esc(label)}</span>${spotifyLink}`;
    }
    if (frame && panel && !panel.hidden) musicApi()?.attachVideo?.(frame);
  }

  function stopPlayer() {
    musicApi()?.stop?.();
    syncSongbookUi();
  }

  function pauseCurrent() {
    musicApi()?.pause?.();
    syncSongbookUi();
  }

  function playTrack(track) {
    if (!track?.spotifyUri) return;
    const current = musicApi()?.getState?.();
    if (current?.track?.id === track.id && current?.playing) {
      pauseCurrent();
      return;
    }
    musicApi()?.play?.(track);
    activeTrack = track;
    playing = true;
    syncSongbookUi({ track, playing:true, requestedPlaying:true, needsGesture:false, position:0 });
  }

  function renderTracks(panel) {
    const groups = panel.querySelector('[data-songbook-groups]');
    if (!groups) return;
    const spotify = spotifyApi();
    const spotifyState = spotify?.getState?.() || {};
    const connected = Boolean(spotify?.isAuthenticated?.());
    const connectedBadge = connected
      ? `<div class="cafasso-songbook-spotify-badge" title="${esc(spotifyState?.profile?.displayName || 'Spotify conectado')}"><span aria-hidden="true"></span>Spotify conectado</div>`
      : '';
    const spotifyIntro = spotifyStatus
      ? `<div class="cafasso-songbook-spotify-status">${connectedBadge}<div>${esc(spotifyStatus)}</div>${spotify?.isConfigured?.() && !connected ? '<button class="cafasso-songbook-spotify-connect" type="button" data-spotify-connect>Conectar Spotify</button>' : ''}</div>`
      : connectedBadge;

    const visibleTracks = tracks.filter(matchesSearch);
    const searchControls = tracks.length
      ? `<div class="cafasso-songbook-search">
          <label for="cafassoSongbookSearch">Buscar en el cancionero</label>
          <div class="cafasso-songbook-search__field">
            <span aria-hidden="true">⌕</span>
            <input id="cafassoSongbookSearch" type="search" autocomplete="off" placeholder="Canción o artista…" value="${esc(searchQuery)}">
          </div>
          <small>${visibleTracks.length} de ${tracks.length} ${tracks.length === 1 ? 'tema' : 'temas'}</small>
        </div>`
      : '';

    const renderedGroups = GROUPS.map(group => {
      const list = visibleTracks.filter(track => track.category === group.id);
      if (!list.length) return '';
      return `<section class="cafasso-songbook-group">
        <div class="cafasso-songbook-group__title"><strong>${esc(group.title)}</strong><span>${list.length} ${list.length === 1 ? 'tema' : 'temas'}</span></div>
        <p class="cafasso-songbook-group__copy">${esc(group.copy)}</p>
        ${list.map(track => `<div class="cafasso-songbook-track" data-track-id="${esc(track.id)}">
          <div class="cafasso-songbook-track__copy"><strong>${esc(track.title)}</strong><span>${esc(track.subtitle || track.source || '')}</span></div>
          <button class="cafasso-songbook-play" type="button" data-track-id="${esc(track.id)}">Escuchar</button>
        </div>`).join('')}
      </section>`;
    }).join('');

    const emptyCopy = tracks.length && searchQuery
      ? '<p class="cafasso-songbook-search-empty">No encontré ningún canto con esas palabras.</p>'
      : '<p class="cafasso-songbook-lead">El Cancionero usa únicamente Spotify. Conectá tu cuenta y asegurate de tener la playlist “CAFASSO · Cancionero”.</p>';

    groups.innerHTML = spotifyIntro + searchControls + (renderedGroups || emptyCopy);

    groups.querySelector('[data-spotify-connect]')?.addEventListener('click', async () => {
      try { await spotifyApi()?.connectAccount?.(); }
      catch (error) { spotifyStatus = error?.message || 'No se pudo abrir Spotify.'; renderTracks(panel); }
    });

    groups.querySelector('#cafassoSongbookSearch')?.addEventListener('input', event => {
      searchQuery = String(event.target?.value || '');
      renderTracks(panel);
      const input = groups.querySelector('#cafassoSongbookSearch');
      if (input) {
        input.focus({ preventScroll:true });
        const end = input.value.length;
        try { input.setSelectionRange(end, end); } catch (error) {}
      }
    });

    groups.querySelectorAll('[data-track-id].cafasso-songbook-play').forEach(button => {
      button.addEventListener('click', () => {
        const track = tracks.find(item => item.id === button.dataset.trackId);
        if (track) playTrack(track);
      });
    });
    setButtonStates();
  }

  async function openPanel(panel) {
    panel.hidden = false;
    const groups = panel.querySelector('[data-songbook-groups]');
    if (groups) groups.innerHTML = '<p class="cafasso-songbook-lead">Abriendo el cancionero…</p>';
    await loadTracks(true);
    if (!panel.hidden) {
      renderTracks(panel);
      syncSongbookUi();
      const frame = panel.querySelector('[data-songbook-frame]');
      if (frame && musicApi()?.getState?.()?.track) musicApi().attachVideo(frame);
    }
  }

  function closePanel(panel) {
    musicApi()?.detachVideo?.();
    panel.hidden = true;
  }

  function boot() {
    const parish = document.querySelector('.cafasso-parroquia');
    if (!parish || parish.dataset.songbookReady === '1') return false;
    parish.dataset.songbookReady = '1';
    ensureStyles();
    loadTracks(false);

    const book = document.createElement('button');
    book.className = 'cafasso-parish-songbook';
    book.type = 'button';
    book.setAttribute('aria-label', 'Abrir el Cancionero de la Parroquia');
    book.innerHTML = `<img class="cafasso-parish-songbook__image" src="${SONGBOOK_IMAGE}" alt="" aria-hidden="true">`;
    parish.appendChild(book);

    const panel = document.createElement('section');
    panel.className = 'cafasso-songbook-panel';
    panel.hidden = true;
    panel.setAttribute('aria-label', 'Cancionero de la Parroquia');
    panel.innerHTML = `
      <article class="cafasso-songbook-sheet" role="dialog" aria-modal="true">
        <button class="cafasso-songbook-close" type="button" data-songbook-close aria-label="Cerrar">×</button>
        <div class="cafasso-songbook-kicker">Cancionero de la Parroquia</div>
        <h2>Música para orar</h2>
        <p class="cafasso-songbook-lead">Elegí una música para quedarte, rezar o simplemente escuchar.</p>
        <div class="cafasso-songbook-layout">
          <div class="cafasso-songbook-groups" data-songbook-groups></div>
          <aside class="cafasso-songbook-player">
            <div class="cafasso-songbook-player__kicker">Ahora suena</div>
            <h3 data-songbook-now-title>Todavía no elegiste una música</h3>
            <p data-songbook-now-copy>No se reproduce nada automáticamente.</p>
            <div class="cafasso-songbook-player__frame" data-songbook-frame><div class="cafasso-songbook-player__empty">Elegí una música y dejá que el sonido acompañe la oración.</div></div>
            <div class="cafasso-songbook-player__source" data-songbook-source><span>La música comienza solo cuando vos la elegís.</span></div>
          </aside>
        </div>
        <div class="cafasso-songbook-footnote">La música puede acompañarte por todo CAFASSO. El minuto de silencio sí la detiene.</div>
      </article>`;
    document.body.appendChild(panel);

    book.addEventListener('click', () => openPanel(panel));
    panel.querySelector('[data-songbook-close]')?.addEventListener('click', () => closePanel(panel));
    panel.addEventListener('click', event => { if (event.target === panel) closePanel(panel); });

    document.addEventListener('click', event => {
      if (event.target.closest('[data-parish-silence]')) stopPlayer();
    }, true);

    musicHost().addEventListener('cafasso:global-music-state', event => syncSongbookUi(event.detail));
    musicHost().addEventListener('cafasso:spotify-state', event => {
      const detail = event.detail || {};
      if (!detail.error) return;
      spotifyStatus = `Spotify: ${detail.error}`;
      if (!panel.hidden) renderTracks(panel);
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !panel.hidden) closePanel(panel);
    });
    syncSongbookUi();
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
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wait, { once:true });
  else wait();
})();
