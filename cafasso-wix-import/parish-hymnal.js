(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('space') !== 'parroquia') return;
  if (window.__cafassoParishHymnalInstalled) return;
  window.__cafassoParishHymnalInstalled = true;

  const STYLE_ID = 'cafassoParishHymnalStyles';
  const TRACKS = [
    { id:'gregoriano', category:'contemplacion', categoryLabel:'Contemplación', title:'Canto gregoriano', subtitle:'Oración en el silencio del monasterio', videoId:'qPWTZR-opkY', source:'Catholic Chants TV' },
    { id:'organo', category:'contemplacion', categoryLabel:'Contemplación', title:'Órgano sacro', subtitle:'Himnos para oración y meditación', videoId:'r1P-bxExSqg', source:'The Sacred Christian Music TV' },
    { id:'nada-te-turbe', category:'taize', categoryLabel:'Taizé', title:'Nada te turbe', subtitle:'Canto meditativo de Taizé', videoId:'go1-BoDD7CI', source:'Taizé' },
    { id:'ubi-caritas', category:'taize', categoryLabel:'Taizé', title:'Ubi Caritas', subtitle:'Donde hay amor, allí está Dios', videoId:'F1flBOC3SxM', source:'Taizé' },
    { id:'tu-modo', category:'salesiano', categoryLabel:'Salesiano', title:'Tu modo', subtitle:'Cristóbal Fones, SJ', videoId:'5wXCLdnOQj4', source:'Cristóbal Fones, SJ' },
    { id:'todo', category:'salesiano', categoryLabel:'Salesiano', title:'Todo', subtitle:'Cristóbal Fones, SJ', videoId:'nP0BYSDFBZk', source:'Cristóbal Fones, SJ' }
  ];

  const GROUPS = [
    { id:'contemplacion', title:'Contemplación', copy:'Música serena para disponerte, respirar y permanecer.' },
    { id:'taize', title:'Taizé', copy:'Cantos breves y repetitivos para sostener la oración.' },
    { id:'salesiano', title:'Salesiano', copy:'Canciones para rezar desde una espiritualidad joven, cercana y servicial.' }
  ];

  let activeTrack = null;
  let playing = false;
  let iframe = null;

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-parish-hymnal{position:absolute;left:9.2%;bottom:12.2%;z-index:7;width:172px;height:118px;padding:0;border:0;background:transparent;cursor:pointer;filter:drop-shadow(0 13px 10px rgba(0,0,0,.42));transform:perspective(650px) rotateX(5deg) rotateZ(-4deg);transform-origin:50% 100%;transition:transform .22s ease,filter .22s ease}
      .cafasso-parish-hymnal:hover{transform:perspective(650px) rotateX(2deg) rotateZ(-2.2deg) translateY(-5px) scale(1.03);filter:drop-shadow(0 18px 14px rgba(0,0,0,.48)) brightness(1.04)}
      .cafasso-parish-hymnal:focus-visible{outline:3px solid #e9c569;outline-offset:6px;border-radius:7px}
      .cafasso-parish-hymnal__book{position:absolute;left:13px;right:10px;top:10px;height:88px;border:1px solid rgba(73,39,31,.75);border-radius:5px 4px 7px 5px;background:repeating-linear-gradient(8deg,rgba(255,255,255,.025) 0 1px,transparent 1px 7px),linear-gradient(108deg,#4d171b 0%,#7c2729 24%,#5f1b20 52%,#8b3432 77%,#4a1519 100%);box-shadow:inset 0 0 0 2px rgba(225,184,115,.15),inset 7px 0 13px rgba(255,213,151,.05),inset -8px 0 14px rgba(36,12,13,.25),0 4px 4px rgba(31,18,13,.25);overflow:hidden}
      .cafasso-parish-hymnal__book:before{content:"";position:absolute;left:6px;right:6px;top:6px;bottom:6px;border:1px solid rgba(221,183,108,.31);border-radius:3px;pointer-events:none}
      .cafasso-parish-hymnal__book:after{content:"";position:absolute;left:8px;right:-3px;bottom:-8px;height:14px;border-radius:0 0 4px 4px;background:repeating-linear-gradient(180deg,#eadfc4 0 1px,#cbb995 1px 2px);box-shadow:0 4px 6px rgba(0,0,0,.25);transform:skewX(-3deg)}
      .cafasso-parish-hymnal__cross{position:absolute;left:50%;top:18px;transform:translateX(-50%);color:#d9b469;font:24px/1 Georgia,serif;text-shadow:0 1px rgba(40,17,17,.7)}
      .cafasso-parish-hymnal__title{position:absolute;left:10px;right:10px;top:51px;color:#f0d6a1;font:700 11px/1.1 Georgia,serif;letter-spacing:.12em;text-transform:uppercase;text-align:center;text-shadow:0 1px 2px rgba(30,12,14,.7)}
      .cafasso-parish-hymnal__ribbon{position:absolute;left:41px;bottom:-14px;width:12px;height:32px;background:linear-gradient(90deg,#8e1f25,#bd3c3e,#74171d);clip-path:polygon(0 0,100% 0,100% 78%,50% 100%,0 78%);box-shadow:0 3px 3px rgba(0,0,0,.2)}
      .cafasso-parish-hymnal__note{position:absolute;right:17px;bottom:6px;color:rgba(240,214,161,.68);font:italic 9px/1 Georgia,serif}

      .cafasso-hymnal-panel{position:fixed;inset:0;z-index:78;display:flex;align-items:center;justify-content:center;padding:24px;background:radial-gradient(circle at 50% 34%,rgba(73,51,34,.12),rgba(5,12,11,.8) 72%);backdrop-filter:blur(8px) saturate(.8)}
      .cafasso-hymnal-panel[hidden]{display:none!important}
      .cafasso-hymnal-sheet{position:relative;width:min(900px,95vw);max-height:90vh;overflow:auto;padding:38px 42px 34px;border:1px solid rgba(91,62,34,.5);border-radius:5px;background:repeating-linear-gradient(0deg,rgba(105,72,39,.026) 0 1px,transparent 1px 9px),linear-gradient(145deg,#f9efd8 0%,#efdfbf 67%,#e5cc9e 100%);box-shadow:0 34px 90px rgba(0,0,0,.58),inset 0 0 0 4px rgba(255,251,239,.28);color:#3e3025;font-family:Georgia,serif}
      .cafasso-hymnal-sheet:before{content:"";position:absolute;left:24px;top:24px;bottom:24px;width:1px;background:rgba(119,83,45,.15)}
      .cafasso-hymnal-close{position:absolute;right:15px;top:14px;width:38px;height:38px;border:1px solid rgba(87,60,33,.18);border-radius:50%;background:rgba(248,238,218,.82);color:#503d2d;font:28px/1 Georgia,serif;cursor:pointer}
      .cafasso-hymnal-kicker{margin-left:8px;color:#8e6b47;font:800 9px/1.2 Inter,system-ui,sans-serif;letter-spacing:.17em;text-transform:uppercase}
      .cafasso-hymnal-sheet h2{margin:7px 0 7px 8px;color:#443326;font:500 clamp(34px,5vw,50px)/1 Georgia,serif}
      .cafasso-hymnal-lead{margin:0 0 24px 8px;max-width:650px;color:#796550;font:italic 14px/1.5 Georgia,serif}
      .cafasso-hymnal-layout{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(280px,.9fr);gap:25px;margin:0 8px}
      .cafasso-hymnal-groups{display:grid;gap:18px}
      .cafasso-hymnal-group{padding-top:14px;border-top:1px solid rgba(111,77,42,.18)}
      .cafasso-hymnal-group:first-child{padding-top:0;border-top:0}
      .cafasso-hymnal-group__title{display:flex;align-items:baseline;gap:10px;margin-bottom:4px}.cafasso-hymnal-group__title strong{color:#4b392b;font:600 19px/1.1 Georgia,serif}.cafasso-hymnal-group__title span{color:#987756;font:800 7px/1 Inter,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase}
      .cafasso-hymnal-group__copy{margin:0 0 10px;color:#8a725a;font:12px/1.45 Inter,system-ui,sans-serif}
      .cafasso-hymnal-track{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;padding:10px 3px;border-top:1px solid rgba(111,77,42,.1)}
      .cafasso-hymnal-track__copy{min-width:0}.cafasso-hymnal-track__copy strong{display:block;color:#4d3c2f;font:600 13px/1.25 Inter,system-ui,sans-serif}.cafasso-hymnal-track__copy span{display:block;margin-top:3px;color:#91785f;font:10.5px/1.35 Inter,system-ui,sans-serif}
      .cafasso-hymnal-play{min-width:78px;padding:8px 11px;border:1px solid rgba(114,79,43,.35);border-radius:4px;background:rgba(255,249,234,.38);color:#604a36;font:800 10px/1 Inter,system-ui,sans-serif;cursor:pointer;transition:background .16s ease,transform .16s ease}
      .cafasso-hymnal-play:hover{transform:translateY(-1px);background:rgba(255,249,234,.68)}
      .cafasso-hymnal-play.is-playing{background:linear-gradient(#795536,#67472d);border-color:#745234;color:#fff8e8}

      .cafasso-hymnal-player{position:sticky;top:0;align-self:start;padding:18px;border:1px solid rgba(111,77,42,.19);background:rgba(255,250,238,.26);box-shadow:inset 0 0 20px rgba(94,62,31,.035)}
      .cafasso-hymnal-player__kicker{color:#957554;font:800 8px/1 Inter,system-ui,sans-serif;letter-spacing:.15em;text-transform:uppercase}
      .cafasso-hymnal-player h3{margin:7px 0 4px;color:#463528;font:500 25px/1.05 Georgia,serif}
      .cafasso-hymnal-player p{margin:0;color:#806b56;font:11.5px/1.45 Inter,system-ui,sans-serif}
      .cafasso-hymnal-player__frame{margin-top:14px;aspect-ratio:16/9;border:1px solid rgba(101,68,37,.22);background:linear-gradient(145deg,#2b2620,#151817);box-shadow:0 8px 18px rgba(48,32,19,.16);overflow:hidden}
      .cafasso-hymnal-player__frame iframe{display:block;width:100%;height:100%;border:0}
      .cafasso-hymnal-player__empty{height:100%;display:grid;place-items:center;padding:22px;color:rgba(255,248,231,.62);font:italic 13px/1.5 Georgia,serif;text-align:center}
      .cafasso-hymnal-player__source{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:11px;color:#8a7159;font:9px/1.3 Inter,system-ui,sans-serif}
      .cafasso-hymnal-player__source a{color:#735338;font-weight:800;text-decoration:none}
      .cafasso-hymnal-footnote{margin:20px 8px 0;padding-top:13px;border-top:1px solid rgba(111,77,42,.13);color:#8c755e;font:10px/1.45 Inter,system-ui,sans-serif}

      @media(max-width:760px){
        .cafasso-parish-hymnal{left:4.5%;bottom:11.2%;width:124px;height:89px}.cafasso-parish-hymnal__book{left:9px;right:7px;top:7px;height:65px}.cafasso-parish-hymnal__cross{top:12px;font-size:18px}.cafasso-parish-hymnal__title{top:38px;font-size:8px}.cafasso-parish-hymnal__ribbon{left:30px;width:9px;height:25px}.cafasso-parish-hymnal__note{right:11px;bottom:4px;font-size:6.5px}
        .cafasso-hymnal-panel{padding:10px;align-items:flex-end}.cafasso-hymnal-sheet{width:100%;max-height:92vh;padding:31px 21px 24px;border-radius:13px 13px 0 0}.cafasso-hymnal-sheet:before{display:none}.cafasso-hymnal-kicker,.cafasso-hymnal-sheet h2,.cafasso-hymnal-lead{margin-left:0}.cafasso-hymnal-layout{grid-template-columns:1fr;margin:0;gap:18px}.cafasso-hymnal-player{position:relative;order:-1}.cafasso-hymnal-footnote{margin-left:0;margin-right:0}
      }
      @media(prefers-reduced-motion:reduce){.cafasso-parish-hymnal,.cafasso-hymnal-play{transition:none!important}}
    `;
    document.head.appendChild(style);
  }

  function stopPlayer() {
    if (iframe) {
      try { iframe.contentWindow?.postMessage(JSON.stringify({event:'command',func:'stopVideo',args:[]}), '*'); } catch (error) {}
      iframe.remove();
      iframe = null;
    }
    activeTrack = null;
    playing = false;
    document.querySelectorAll('.cafasso-hymnal-play').forEach(button => {
      button.classList.remove('is-playing');
      button.textContent = 'Escuchar';
    });
    const frame = document.querySelector('[data-hymnal-frame]');
    if (frame) frame.innerHTML = '<div class="cafasso-hymnal-player__empty">Elegí una música y dejá que el sonido acompañe la oración.</div>';
    const title = document.querySelector('[data-hymnal-now-title]');
    const copy = document.querySelector('[data-hymnal-now-copy]');
    const source = document.querySelector('[data-hymnal-source]');
    if (title) title.textContent = 'Todavía no elegiste una música';
    if (copy) copy.textContent = 'No se reproduce nada automáticamente.';
    if (source) source.innerHTML = '<span>La música comienza solo cuando vos la elegís.</span>';
  }

  function setButtonStates() {
    document.querySelectorAll('.cafasso-hymnal-play').forEach(button => {
      const isActive = button.dataset.trackId === activeTrack?.id && playing;
      button.classList.toggle('is-playing', isActive);
      button.textContent = isActive ? 'Pausar' : 'Escuchar';
    });
  }

  function pauseCurrent() {
    if (!iframe || !playing) return;
    try { iframe.contentWindow?.postMessage(JSON.stringify({event:'command',func:'pauseVideo',args:[]}), '*'); } catch (error) {}
    playing = false;
    setButtonStates();
  }

  function playTrack(track) {
    const frame = document.querySelector('[data-hymnal-frame]');
    const title = document.querySelector('[data-hymnal-now-title]');
    const copy = document.querySelector('[data-hymnal-now-copy]');
    const source = document.querySelector('[data-hymnal-source]');
    if (!frame || !title || !copy || !source) return;

    if (activeTrack?.id === track.id && playing) {
      pauseCurrent();
      return;
    }

    if (activeTrack?.id === track.id && iframe && !playing) {
      try { iframe.contentWindow?.postMessage(JSON.stringify({event:'command',func:'playVideo',args:[]}), '*'); } catch (error) {}
      playing = true;
      setButtonStates();
      return;
    }

    if (iframe) iframe.remove();
    activeTrack = track;
    playing = true;
    frame.innerHTML = '';
    iframe = document.createElement('iframe');
    iframe.title = `${track.title} — ${track.subtitle}`;
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.src = `https://www.youtube-nocookie.com/embed/${track.videoId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1`;
    frame.appendChild(iframe);
    title.textContent = track.title;
    copy.textContent = `${track.categoryLabel} · ${track.subtitle}`;
    source.innerHTML = `<span>${track.source}</span><a href="https://www.youtube.com/watch?v=${track.videoId}" target="_blank" rel="noopener">Abrir en YouTube ↗</a>`;
    setButtonStates();
  }

  function renderGroups() {
    return GROUPS.map(group => {
      const rows = TRACKS.filter(track => track.category === group.id).map(track => `
        <div class="cafasso-hymnal-track">
          <div class="cafasso-hymnal-track__copy"><strong>${track.title}</strong><span>${track.subtitle}</span></div>
          <button class="cafasso-hymnal-play" type="button" data-track-id="${track.id}">Escuchar</button>
        </div>`).join('');
      return `<section class="cafasso-hymnal-group"><div class="cafasso-hymnal-group__title"><strong>${group.title}</strong><span>para orar</span></div><p class="cafasso-hymnal-group__copy">${group.copy}</p>${rows}</section>`;
    }).join('');
  }

  function openPanel(panel) {
    panel.hidden = false;
    requestAnimationFrame(() => panel.querySelector('[data-hymnal-close]')?.focus({preventScroll:true}));
  }

  function closePanel(panel) {
    stopPlayer();
    panel.hidden = true;
  }

  function boot() {
    const parish = document.querySelector('.cafasso-parroquia');
    if (!parish || parish.dataset.hymnalReady === '1') return false;
    parish.dataset.hymnalReady = '1';
    ensureStyles();

    const hymnal = document.createElement('button');
    hymnal.className = 'cafasso-parish-hymnal';
    hymnal.type = 'button';
    hymnal.setAttribute('aria-label', 'Abrir Himnario: Música para orar');
    hymnal.innerHTML = '<span class="cafasso-parish-hymnal__book" aria-hidden="true"><span class="cafasso-parish-hymnal__cross">✝</span><span class="cafasso-parish-hymnal__title">Himnario</span><span class="cafasso-parish-hymnal__ribbon"></span><span class="cafasso-parish-hymnal__note">música para orar</span></span>';
    parish.appendChild(hymnal);

    const panel = document.createElement('section');
    panel.className = 'cafasso-hymnal-panel';
    panel.hidden = true;
    panel.setAttribute('aria-label', 'Música para orar');
    panel.innerHTML = `
      <article class="cafasso-hymnal-sheet" role="dialog" aria-modal="true" aria-labelledby="cafasso-hymnal-title">
        <button class="cafasso-hymnal-close" type="button" data-hymnal-close aria-label="Cerrar">×</button>
        <div class="cafasso-hymnal-kicker">Himnario · Parroquia CAFASSO</div>
        <h2 id="cafasso-hymnal-title">Música para orar</h2>
        <p class="cafasso-hymnal-lead">Elegí una música para quedarte, rezar o simplemente escuchar.</p>
        <div class="cafasso-hymnal-layout">
          <div class="cafasso-hymnal-groups">${renderGroups()}</div>
          <aside class="cafasso-hymnal-player" aria-live="polite">
            <div class="cafasso-hymnal-player__kicker">Ahora suena</div>
            <h3 data-hymnal-now-title>Todavía no elegiste una música</h3>
            <p data-hymnal-now-copy>No se reproduce nada automáticamente.</p>
            <div class="cafasso-hymnal-player__frame" data-hymnal-frame><div class="cafasso-hymnal-player__empty">Elegí una música y dejá que el sonido acompañe la oración.</div></div>
            <div class="cafasso-hymnal-player__source" data-hymnal-source><span>La música comienza solo cuando vos la elegís.</span></div>
          </aside>
        </div>
        <div class="cafasso-hymnal-footnote">Solo suena una pista a la vez. Al cerrar el Himnario, entrar en silencio o salir de la Parroquia, la música se detiene.</div>
      </article>`;
    document.body.appendChild(panel);

    hymnal.addEventListener('click', () => openPanel(panel));
    panel.querySelector('[data-hymnal-close]')?.addEventListener('click', () => closePanel(panel));
    panel.addEventListener('click', event => {
      if (event.target === panel) closePanel(panel);
      const button = event.target.closest?.('[data-track-id]');
      if (!button) return;
      const track = TRACKS.find(item => item.id === button.dataset.trackId);
      if (track) playTrack(track);
    });

    document.addEventListener('click', event => {
      if (event.target.closest?.('[data-parish-silence]')) stopPlayer();
      if (event.target.closest?.('.cafasso-space-link--parroquia-patio')) stopPlayer();
    }, true);
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !panel.hidden) closePanel(panel);
    });
    window.addEventListener('pagehide', stopPlayer, { once:true });
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
