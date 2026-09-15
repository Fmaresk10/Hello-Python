(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('space') !== 'parroquia') return;
  if (window.__cafassoParishExperienceInstalled) return;
  window.__cafassoParishExperienceInstalled = true;

  const STYLE_ID = 'cafassoParishExperienceStyles';
  const INTRO_KEY = 'cafasso-parish-intro-v1';
  const BOOKS = {
    'Genesis':'Génesis','Exodus':'Éxodo','Leviticus':'Levítico','Numbers':'Números','Deuteronomy':'Deuteronomio',
    'Joshua':'Josué','Judges':'Jueces','Ruth':'Rut','1 Samuel':'1 Samuel','2 Samuel':'2 Samuel','1 Kings':'1 Reyes','2 Kings':'2 Reyes',
    '1 Chronicles':'1 Crónicas','2 Chronicles':'2 Crónicas','Ezra':'Esdras','Nehemiah':'Nehemías','Tobit':'Tobías','Judith':'Judit','Esther':'Ester',
    '1 Maccabees':'1 Macabeos','2 Maccabees':'2 Macabeos','Job':'Job','Psalms':'Salmo','Psalm':'Salmo','Proverbs':'Proverbios',
    'Ecclesiastes':'Eclesiastés','Song of Songs':'Cantar de los Cantares','Wisdom':'Sabiduría','Sirach':'Eclesiástico','Isaiah':'Isaías',
    'Jeremiah':'Jeremías','Lamentations':'Lamentaciones','Baruch':'Baruc','Ezekiel':'Ezequiel','Daniel':'Daniel','Hosea':'Oseas','Joel':'Joel',
    'Amos':'Amós','Obadiah':'Abdías','Jonah':'Jonás','Micah':'Miqueas','Nahum':'Nahúm','Habakkuk':'Habacuc','Zephaniah':'Sofonías',
    'Haggai':'Ageo','Zechariah':'Zacarías','Malachi':'Malaquías','Matthew':'Mateo','Mark':'Marcos','Luke':'Lucas','John':'Juan',
    'Acts':'Hechos','Romans':'Romanos','1 Corinthians':'1 Corintios','2 Corinthians':'2 Corintios','Galatians':'Gálatas','Ephesians':'Efesios',
    'Philippians':'Filipenses','Colossians':'Colosenses','1 Thessalonians':'1 Tesalonicenses','2 Thessalonians':'2 Tesalonicenses',
    '1 Timothy':'1 Timoteo','2 Timothy':'2 Timoteo','Titus':'Tito','Philemon':'Filemón','Hebrews':'Hebreos','James':'Santiago',
    '1 Peter':'1 Pedro','2 Peter':'2 Pedro','1 John':'1 Juan','2 John':'2 Juan','3 John':'3 Juan','Jude':'Judas','Revelation':'Apocalipsis'
  };
  const SEASONS = { 'Ordinary Time':'Tiempo Ordinario','Advent':'Adviento','Christmas':'Navidad','Lent':'Cuaresma','Easter':'Pascua' };

  let silenceTimer = null;
  let bellPlayed = false;
  let leaving = false;

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-parroquia{background:#151b18;isolation:isolate}
      .cafasso-parroquia:before{content:"";position:absolute;inset:-7%;z-index:1;pointer-events:none;background:radial-gradient(ellipse 31% 58% at 53% 18%,rgba(255,224,157,.18),transparent 70%),radial-gradient(ellipse 24% 42% at 22% 32%,rgba(221,173,102,.065),transparent 72%);mix-blend-mode:screen;animation:cafassoParishLight 10s ease-in-out infinite alternate}
      .cafasso-parroquia:after{content:"";position:absolute;inset:0;z-index:2;pointer-events:none;background:linear-gradient(180deg,rgba(5,9,8,.05),transparent 42%,rgba(6,11,10,.19));box-shadow:inset 0 0 150px rgba(3,8,7,.18)}
      @keyframes cafassoParishLight{from{opacity:.52;transform:translate3d(-.8%,1%,0) scale(1)}to{opacity:.88;transform:translate3d(.9%,-.8%,0) scale(1.025)}}

      .cafasso-parroquia .cafasso-space-link{z-index:7;border-color:rgba(226,195,128,.48);background:linear-gradient(180deg,rgba(51,43,33,.62),rgba(22,29,27,.78));box-shadow:0 8px 18px rgba(0,0,0,.31),inset 0 1px rgba(255,245,215,.08);backdrop-filter:blur(3px);text-align:left;transition:filter .2s ease,background .2s ease,box-shadow .2s ease}
      .cafasso-parroquia .cafasso-space-link:hover{filter:brightness(1.06);background:linear-gradient(180deg,rgba(68,55,39,.72),rgba(26,37,33,.88));box-shadow:0 11px 23px rgba(0,0,0,.35),0 0 18px rgba(234,197,111,.08)}
      .cafasso-parish-link__main{display:block;color:#fff8e8;font:600 14px/1.05 Georgia,serif;letter-spacing:.035em}
      .cafasso-parish-link__sub{display:block;margin-top:4px;color:rgba(255,246,223,.59);font:800 6.7px/1 Inter,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase}

      .cafasso-parish-intro{position:absolute;left:50%;bottom:6%;z-index:8;width:min(680px,84vw);padding:0 18px 12px;border-bottom:1px solid rgba(232,196,116,.27);color:#fff8e9;text-align:center;text-shadow:0 3px 18px rgba(0,0,0,.78);pointer-events:none;opacity:0;transform:translate(-50%,9px);transition:opacity .8s ease,transform .8s ease}
      .cafasso-parish-intro.is-visible{opacity:1;transform:translate(-50%,0)}
      .cafasso-parish-intro.is-leaving{opacity:0;transform:translate(-50%,-5px)}
      .cafasso-parish-intro strong{display:block;font:400 clamp(25px,3vw,39px)/1.08 Georgia,serif;letter-spacing:-.013em}
      .cafasso-parish-intro span{display:block;margin-top:7px;color:rgba(255,247,227,.67);font:700 9px/1.3 Inter,system-ui,sans-serif;letter-spacing:.13em;text-transform:uppercase}

      .cafasso-parish-lectionary{position:absolute;right:9.7%;bottom:11.5%;z-index:7;width:220px;height:144px;padding:0;border:0;background:transparent;cursor:pointer;filter:drop-shadow(0 15px 12px rgba(0,0,0,.42));transform:perspective(700px) rotateX(3deg) rotateZ(1.5deg);transition:transform .22s ease,filter .22s ease}
      .cafasso-parish-lectionary:hover{transform:perspective(700px) rotateX(1deg) rotateZ(.6deg) translateY(-5px) scale(1.025);filter:drop-shadow(0 19px 16px rgba(0,0,0,.47)) brightness(1.035)}
      .cafasso-parish-lectionary:focus-visible{outline:3px solid #e9c569;outline-offset:5px;border-radius:8px}
      .cafasso-parish-book{position:absolute;left:18px;right:18px;top:8px;height:102px;display:grid;grid-template-columns:1fr 1fr;transform:perspective(350px) rotateX(8deg);transform-origin:50% 100%}
      .cafasso-parish-page{position:relative;overflow:hidden;border:1px solid rgba(93,66,35,.42);background:repeating-linear-gradient(0deg,rgba(116,83,48,.025) 0 1px,transparent 1px 7px),linear-gradient(145deg,#f7ecd3,#ead7af);box-shadow:inset 0 0 13px rgba(103,72,36,.10)}
      .cafasso-parish-page--left{border-radius:5px 1px 2px 7px;transform:skewY(.8deg);box-shadow:inset -8px 0 12px rgba(98,66,31,.08)}
      .cafasso-parish-page--right{border-radius:1px 5px 7px 2px;transform:skewY(-.8deg);box-shadow:inset 8px 0 12px rgba(98,66,31,.08)}
      .cafasso-parish-page--left:before{content:"PALABRA";position:absolute;left:11px;top:15px;color:#725438;font:800 7px/1 Inter,system-ui,sans-serif;letter-spacing:.16em}
      .cafasso-parish-page--left:after{content:"✝";position:absolute;left:50%;top:39px;transform:translateX(-50%);color:#9c7a4c;font:23px/1 Georgia,serif}
      .cafasso-parish-page--right:before{content:"DEL DÍA";position:absolute;right:11px;top:15px;color:#725438;font:800 7px/1 Inter,system-ui,sans-serif;letter-spacing:.16em}
      .cafasso-parish-page--right:after{content:"abrir";position:absolute;right:12px;bottom:15px;color:#8c6c49;font:italic 11px/1 Georgia,serif}
      .cafasso-parish-book:after{content:"";position:absolute;left:50%;top:3px;bottom:2px;width:1px;background:rgba(91,61,30,.25);box-shadow:1px 0 rgba(255,255,255,.55)}
      .cafasso-parish-stand{position:absolute;left:48px;right:48px;bottom:7px;height:36px;border-radius:4px 4px 10px 10px;background:linear-gradient(90deg,#382318,#725039 24%,#8c6342 51%,#67462f 76%,#332116);box-shadow:0 8px 10px rgba(0,0,0,.33);clip-path:polygon(12% 0,88% 0,100% 100%,0 100%)}
      .cafasso-parish-stand:after{content:"";position:absolute;left:15%;right:15%;top:6px;height:3px;border-radius:99px;background:rgba(225,190,128,.22)}

      .cafasso-parish-panel{position:fixed;inset:0;z-index:70;display:flex;align-items:center;justify-content:center;padding:24px;background:radial-gradient(circle at 50% 32%,rgba(66,51,31,.13),rgba(5,12,11,.77) 70%);backdrop-filter:blur(7px) saturate(.8)}
      .cafasso-parish-panel[hidden]{display:none!important}
      .cafasso-parish-sheet{position:relative;width:min(820px,94vw);max-height:88vh;overflow:auto;padding:39px 46px 34px;border:1px solid rgba(93,65,35,.48);border-radius:5px;background:repeating-linear-gradient(0deg,rgba(100,69,37,.026) 0 1px,transparent 1px 9px),linear-gradient(145deg,#f9efd9 0%,#efdfbf 68%,#e5cda0 100%);box-shadow:0 34px 90px rgba(0,0,0,.57),inset 0 0 0 4px rgba(255,251,239,.28);color:#3e3025;font-family:Georgia,serif;transform:rotate(-.2deg)}
      .cafasso-parish-sheet:before{content:"";position:absolute;left:27px;top:28px;bottom:28px;width:1px;background:rgba(119,83,45,.16)}
      .cafasso-parish-close{position:absolute;right:16px;top:14px;width:38px;height:38px;border:1px solid rgba(87,60,33,.18);border-radius:50%;background:rgba(248,238,218,.78);color:#503d2d;font:28px/1 Georgia,serif;cursor:pointer}
      .cafasso-parish-kicker{margin-left:11px;color:#8e6b47;font:800 9px/1.2 Inter,system-ui,sans-serif;letter-spacing:.17em;text-transform:uppercase}
      .cafasso-parish-sheet h2{margin:7px 0 4px 11px;color:#443326;font:500 clamp(35px,5vw,52px)/1 Georgia,serif}
      .cafasso-parish-date{margin:0 0 26px 11px;color:#816c56;font:italic 14px/1.4 Georgia,serif}
      .cafasso-parish-gospel{margin:0 10px 22px;padding:19px 0 18px;border-top:1px solid rgba(107,74,40,.18);border-bottom:1px solid rgba(107,74,40,.18)}
      .cafasso-parish-gospel small{display:block;margin-bottom:6px;color:#967553;font:800 9px/1 Inter,system-ui,sans-serif;letter-spacing:.15em;text-transform:uppercase}
      .cafasso-parish-gospel strong{display:block;color:#3e3025;font:500 clamp(28px,4vw,40px)/1.05 Georgia,serif}
      .cafasso-parish-season{display:inline-block;margin-top:8px;color:#8f7152;font:700 10px/1.2 Inter,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase}
      .cafasso-parish-readings{display:grid;grid-template-columns:repeat(3,1fr);gap:11px;margin:0 10px 24px}
      .cafasso-parish-reading{min-height:79px;padding:12px 13px;border:1px solid rgba(113,79,44,.19);background:rgba(255,251,240,.25)}
      .cafasso-parish-reading small{display:block;margin-bottom:6px;color:#997957;font:800 8px/1 Inter,system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase}
      .cafasso-parish-reading strong{display:block;color:#514031;font:600 13px/1.35 Inter,system-ui,sans-serif}
      .cafasso-parish-reflection{margin:0 10px 22px;padding:14px 16px;border-left:2px solid rgba(171,127,65,.44);color:#6f5946;font:italic 15px/1.55 Georgia,serif;background:rgba(255,250,235,.16)}
      .cafasso-parish-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:0 10px}
      .cafasso-parish-action{display:inline-flex;align-items:center;justify-content:center;min-height:39px;padding:9px 14px;border:1px solid #745234;border-radius:4px;background:linear-gradient(#795536,#67472d);color:#fff8e8;text-decoration:none;font:800 11px/1 Inter,system-ui,sans-serif;cursor:pointer;box-shadow:0 4px 8px rgba(77,51,29,.14)}
      .cafasso-parish-action--quiet{background:rgba(249,240,221,.48);color:#5d4936;border-color:rgba(112,79,45,.28);box-shadow:none}
      .cafasso-parish-loading{margin:25px 11px;color:#79634e;font:italic 15px/1.5 Georgia,serif}

      .cafasso-parish-silence{position:fixed;inset:0;z-index:90;display:grid;place-items:center;background:radial-gradient(circle at 50% 40%,rgba(95,67,37,.10),rgba(4,9,8,.94) 65%);color:#fff5e3;text-align:center;opacity:0;transition:opacity .65s ease}
      .cafasso-parish-silence.is-visible{opacity:1}
      .cafasso-parish-silence__inner{width:min(520px,86vw);text-shadow:0 3px 18px rgba(0,0,0,.75)}
      .cafasso-parish-flame{position:relative;width:24px;height:43px;margin:0 auto 24px;border-radius:50% 50% 48% 48%;background:radial-gradient(circle at 50% 70%,#fff2b4 0 15%,#f1bf58 26%,#bd6b2e 59%,rgba(164,73,24,.05) 70%);filter:drop-shadow(0 0 17px rgba(240,185,79,.55));transform-origin:50% 100%;animation:cafassoFlame 1.8s ease-in-out infinite alternate}
      @keyframes cafassoFlame{from{transform:rotate(-2deg) scale(.96,1.03)}to{transform:rotate(2.5deg) scale(1.04,.97)}}
      .cafasso-parish-silence strong{display:block;font:400 clamp(28px,4vw,42px)/1.1 Georgia,serif}
      .cafasso-parish-silence p{margin:11px auto 0;max-width:440px;color:rgba(255,246,226,.67);font:500 13px/1.6 Inter,system-ui,sans-serif}
      .cafasso-parish-silence__time{display:block;margin-top:18px;color:#e4c27d;font:800 10px/1 Inter,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase}
      .cafasso-parish-silence__end{margin-top:26px;border:1px solid rgba(230,194,116,.45);border-radius:999px;padding:9px 15px;background:rgba(28,36,31,.55);color:#fff4df;font:800 10px/1 Inter,system-ui,sans-serif;cursor:pointer}

      .cafasso-parish-transition{position:absolute;inset:0;z-index:50;pointer-events:none;opacity:0;background:rgba(4,11,10,.04);transition:opacity .3s ease}
      .cafasso-parish-transition:after{content:"";position:absolute;inset:0;background:#09110f;opacity:0;transition:opacity .32s ease}
      .cafasso-parish-transition.is-active{opacity:1}.cafasso-parish-transition.is-active:after{opacity:.86}

      @media(max-width:680px){
        .cafasso-parish-intro{bottom:3.5%;width:89vw}.cafasso-parish-intro strong{font-size:25px}.cafasso-parish-intro span{font-size:7px}
        .cafasso-parish-lectionary{right:4%;bottom:10%;width:148px;height:103px}.cafasso-parish-book{left:12px;right:12px;top:5px;height:73px}.cafasso-parish-page--left:before,.cafasso-parish-page--right:before{font-size:5px;top:10px}.cafasso-parish-page--left:before{left:7px}.cafasso-parish-page--right:before{right:7px}.cafasso-parish-page--left:after{top:27px;font-size:17px}.cafasso-parish-page--right:after{right:7px;bottom:9px;font-size:8px}.cafasso-parish-stand{left:32px;right:32px;height:27px;bottom:4px}
        .cafasso-parish-panel{padding:10px;align-items:flex-end}.cafasso-parish-sheet{width:100%;max-height:92vh;padding:34px 23px 24px;border-radius:13px 13px 0 0;transform:none}.cafasso-parish-sheet:before{display:none}.cafasso-parish-sheet h2,.cafasso-parish-kicker,.cafasso-parish-date{margin-left:0}.cafasso-parish-gospel,.cafasso-parish-readings,.cafasso-parish-reflection,.cafasso-parish-actions{margin-left:0;margin-right:0}.cafasso-parish-readings{grid-template-columns:1fr}.cafasso-parish-reading{min-height:0}.cafasso-parish-actions{align-items:stretch;flex-direction:column}.cafasso-parish-action{width:100%}
      }
      @media(prefers-reduced-motion:reduce){.cafasso-parroquia:before,.cafasso-parish-flame{animation:none!important}.cafasso-parish-intro,.cafasso-parish-lectionary,.cafasso-parish-silence,.cafasso-parish-transition,.cafasso-parish-transition:after{transition:none!important}}
    `;
    document.head.appendChild(style);
  }

  function localDate() {
    const d = new Date();
    return {
      d,
      year: d.getFullYear(),
      month: String(d.getMonth() + 1).padStart(2, '0'),
      day: String(d.getDate()).padStart(2, '0')
    };
  }

  function translateRef(value) {
    let text = String(value || '').trim();
    Object.keys(BOOKS).sort((a, b) => b.length - a.length).some(name => {
      if (text.startsWith(name + ' ')) {
        text = BOOKS[name] + text.slice(name.length);
        return true;
      }
      return false;
    });
    return text.replace(/(\d):(\d)/, '$1,$2');
  }

  function vaticanUrl() {
    const x = localDate();
    return `https://www.vaticannews.va/es/evangelio-de-hoy/${x.year}/${x.month}/${x.day}.html`;
  }

  async function loadReadings() {
    const x = localDate();
    const key = `cafasso-daily-word-${x.year}-${x.month}-${x.day}`;
    try {
      const cached = JSON.parse(localStorage.getItem(key) || 'null');
      if (cached?.readings) return cached;
    } catch (error) {}

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(`https://cpbjr.github.io/catholic-readings-api/readings/${x.year}/${x.month}-${x.day}.json`, { cache: 'force-cache', signal: controller.signal });
      if (!response.ok) throw new Error('Lecturas no disponibles');
      const data = await response.json();
      try { localStorage.setItem(key, JSON.stringify(data)); } catch (error) {}
      return data;
    } finally {
      clearTimeout(timeout);
    }
  }

  function playBell() {
    if (bellPlayed) return;
    bellPlayed = true;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const master = ctx.createGain();
      master.gain.value = .0001;
      master.connect(ctx.destination);
      const now = ctx.currentTime;
      const strikes = [0, .42];
      const partials = [196, 392, 588, 784, 980];
      strikes.forEach((offset, strikeIndex) => {
        partials.forEach((frequency, index) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = index < 2 ? 'sine' : 'triangle';
          osc.frequency.value = frequency * (strikeIndex ? 1.015 : 1);
          gain.gain.setValueAtTime(.0001, now + offset);
          gain.gain.exponentialRampToValueAtTime(.022 / (index + 1), now + offset + .018);
          gain.gain.exponentialRampToValueAtTime(.0001, now + offset + 1.25 + index * .12);
          osc.connect(gain).connect(master);
          osc.start(now + offset);
          osc.stop(now + offset + 1.5);
        });
      });
      master.gain.exponentialRampToValueAtTime(.85, now + .025);
      master.gain.exponentialRampToValueAtTime(.0001, now + 2.05);
      setTimeout(() => ctx.close().catch(() => {}), 2300);
    } catch (error) {}
  }

  function showIntro(parish) {
    try {
      if (sessionStorage.getItem(INTRO_KEY) === 'seen') return;
      sessionStorage.setItem(INTRO_KEY, 'seen');
    } catch (error) {}
    const intro = document.createElement('div');
    intro.className = 'cafasso-parish-intro';
    intro.innerHTML = '<strong>La Parroquia no te pide hacer.</strong><span>Te invita a estar, escuchar y dejarte encontrar.</span>';
    parish.appendChild(intro);
    requestAnimationFrame(() => intro.classList.add('is-visible'));
    setTimeout(() => intro.classList.add('is-leaving'), 4100);
    setTimeout(() => intro.remove(), 5000);
  }

  function openSilence(panel) {
    panel.hidden = true;
    const silence = document.createElement('section');
    silence.className = 'cafasso-parish-silence';
    silence.setAttribute('role', 'dialog');
    silence.setAttribute('aria-modal', 'true');
    silence.setAttribute('aria-label', 'Un minuto de silencio');
    silence.innerHTML = `
      <div class="cafasso-parish-silence__inner">
        <div class="cafasso-parish-flame" aria-hidden="true"></div>
        <strong>Quedate acá un momento.</strong>
        <p>No hay nada que completar. No hay una respuesta correcta. Solo un minuto para hacer silencio.</p>
        <span class="cafasso-parish-silence__time" data-silence-time>1:00</span>
        <button class="cafasso-parish-silence__end" type="button" data-silence-end>Terminar</button>
      </div>`;
    document.body.appendChild(silence);
    requestAnimationFrame(() => silence.classList.add('is-visible'));

    let remaining = 60;
    const label = silence.querySelector('[data-silence-time]');
    const finish = () => {
      clearInterval(silenceTimer);
      silenceTimer = null;
      silence.remove();
    };
    silence.querySelector('[data-silence-end]')?.addEventListener('click', finish);
    silence.addEventListener('keydown', event => { if (event.key === 'Escape') finish(); });
    silenceTimer = setInterval(() => {
      remaining -= 1;
      if (label) label.textContent = `0:${String(Math.max(0, remaining)).padStart(2, '0')}`;
      if (remaining <= 0) {
        clearInterval(silenceTimer);
        silenceTimer = null;
        if (label) label.textContent = 'Amén.';
      }
    }, 1000);
  }

  async function openWord(panel) {
    panel.hidden = false;
    const body = panel.querySelector('[data-parish-word-body]');
    body.innerHTML = '<p class="cafasso-parish-loading">Abriendo la Palabra de hoy…</p>';
    try {
      const data = await loadReadings();
      if (panel.hidden) return;
      const x = localDate();
      const readings = data?.readings || {};
      const gospel = translateRef(readings.gospel) || 'Evangelio de hoy';
      const first = translateRef(readings.firstReading) || '—';
      const psalm = translateRef(readings.psalm) || '—';
      const second = translateRef(readings.secondReading) || '—';
      const season = SEASONS[data?.season] || data?.season || 'Liturgia del día';
      const date = x.d.toLocaleDateString('es-UY', { weekday: 'long', day: 'numeric', month: 'long' });
      body.innerHTML = `
        <div class="cafasso-parish-kicker">Palabra del día</div>
        <h2>Hoy, escuchá.</h2>
        <p class="cafasso-parish-date">${date}</p>
        <div class="cafasso-parish-gospel">
          <small>Evangelio</small>
          <strong>${gospel}</strong>
          <span class="cafasso-parish-season">${season}</span>
        </div>
        <div class="cafasso-parish-readings">
          <div class="cafasso-parish-reading"><small>1ª lectura</small><strong>${first}</strong></div>
          <div class="cafasso-parish-reading"><small>Salmo</small><strong>${psalm}</strong></div>
          <div class="cafasso-parish-reading"><small>2ª lectura</small><strong>${second}</strong></div>
        </div>
        <div class="cafasso-parish-reflection">No hace falta leer todo de una vez. Elegí una frase, quedate con ella y dejá que te acompañe.</div>
        <div class="cafasso-parish-actions">
          <a class="cafasso-parish-action" href="${vaticanUrl()}" target="_blank" rel="noopener">Leer el Evangelio completo →</a>
          <button class="cafasso-parish-action cafasso-parish-action--quiet" type="button" data-parish-silence>Un minuto de silencio</button>
        </div>`;
      body.querySelector('[data-parish-silence]')?.addEventListener('click', () => openSilence(panel));
    } catch (error) {
      const x = localDate();
      const date = x.d.toLocaleDateString('es-UY', { weekday: 'long', day: 'numeric', month: 'long' });
      body.innerHTML = `
        <div class="cafasso-parish-kicker">Palabra del día</div>
        <h2>Hoy, escuchá.</h2>
        <p class="cafasso-parish-date">${date}</p>
        <div class="cafasso-parish-reflection">Hoy no pudimos cargar las referencias automáticamente. Podés abrir el Evangelio del día o simplemente quedarte un momento en silencio.</div>
        <div class="cafasso-parish-actions">
          <a class="cafasso-parish-action" href="${vaticanUrl()}" target="_blank" rel="noopener">Abrir Evangelio del día →</a>
          <button class="cafasso-parish-action cafasso-parish-action--quiet" type="button" data-parish-silence>Un minuto de silencio</button>
        </div>`;
      body.querySelector('[data-parish-silence]')?.addEventListener('click', () => openSilence(panel));
    }
  }

  function boot() {
    const parish = document.querySelector('.cafasso-parroquia');
    if (!parish || parish.dataset.parishExperienceReady === '1') return false;
    parish.dataset.parishExperienceReady = '1';
    ensureStyles();

    const patio = parish.querySelector('.cafasso-space-link--parroquia-patio[data-space="patio"]');
    if (patio) {
      patio.setAttribute('aria-label', 'Volver al Patio');
      patio.innerHTML = '<span class="cafasso-parish-link__main">Patio</span><span class="cafasso-parish-link__sub">volver al encuentro</span>';
    }

    const lectionary = document.createElement('button');
    lectionary.className = 'cafasso-parish-lectionary';
    lectionary.type = 'button';
    lectionary.setAttribute('aria-label', 'Abrir la Palabra del día');
    lectionary.innerHTML = '<span class="cafasso-parish-book" aria-hidden="true"><span class="cafasso-parish-page cafasso-parish-page--left"></span><span class="cafasso-parish-page cafasso-parish-page--right"></span></span><span class="cafasso-parish-stand" aria-hidden="true"></span>';
    parish.appendChild(lectionary);

    const panel = document.createElement('section');
    panel.className = 'cafasso-parish-panel';
    panel.hidden = true;
    panel.setAttribute('aria-label', 'Palabra del día');
    panel.innerHTML = '<article class="cafasso-parish-sheet" role="dialog" aria-modal="true"><button class="cafasso-parish-close" type="button" data-parish-close aria-label="Cerrar">×</button><div data-parish-word-body></div></article>';
    document.body.appendChild(panel);

    const transition = document.createElement('div');
    transition.className = 'cafasso-parish-transition';
    transition.setAttribute('aria-hidden', 'true');
    parish.appendChild(transition);

    showIntro(parish);

    const unlockBell = () => playBell();
    parish.addEventListener('pointerdown', unlockBell, { once: true, passive: true });
    parish.addEventListener('keydown', unlockBell, { once: true });

    lectionary.addEventListener('click', () => openWord(panel));
    panel.querySelector('[data-parish-close]')?.addEventListener('click', () => { panel.hidden = true; });
    panel.addEventListener('click', event => { if (event.target === panel) panel.hidden = true; });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !panel.hidden) panel.hidden = true;
    });

    if (patio) {
      patio.addEventListener('click', event => {
        if (leaving) return;
        leaving = true;
        event.preventDefault();
        event.stopImmediatePropagation();
        transition.classList.add('is-active');
        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
        setTimeout(() => {
          const next = new URL(location.href);
          next.searchParams.set('space', 'patio');
          location.href = next.toString();
        }, reduced ? 80 : 320);
      }, true);
    }

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

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wait, { once: true });
  else wait();
})();
