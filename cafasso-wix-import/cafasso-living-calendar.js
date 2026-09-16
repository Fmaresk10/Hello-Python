(() => {
  if (window.__cafassoLivingCalendarInstalled) return;
  window.__cafassoLivingCalendarInstalled = true;

  const SPACE = new URLSearchParams(location.search).get('space') || 'house';
  const VALID_SPACES = new Set(['house', 'patio', 'escuela', 'parroquia']);
  if (!VALID_SPACES.has(SPACE)) return;

  const STYLE_ID = 'cafassoLivingCalendarStyles';
  const PERIOD_CLASSES = [
    'cafasso-lit-ordinary','cafasso-lit-advent','cafasso-lit-christmas','cafasso-lit-lent',
    'cafasso-lit-holy-week','cafasso-lit-easter','cafasso-lit-pentecost'
  ];
  const SALESIAN_CLASSES = ['cafasso-salesian-don-bosco','cafasso-salesian-auxiliadora','cafasso-salesian-bosco-birthday'];

  function localUser() {
    try { return JSON.parse(localStorage.getItem('cafassoSession') || 'null')?.user || {}; }
    catch (error) { return {}; }
  }

  function isAdmin() {
    return String(localUser()?.role || '').toLowerCase().includes('admin');
  }

  function safeDate(y, m, d) {
    const date = new Date(y, m, d, 12, 0, 0, 0);
    return Number.isFinite(date.getTime()) ? date : null;
  }

  function ymd(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function previewDate() {
    if (!isAdmin()) return null;
    const raw = new URLSearchParams(location.search).get('cafassoDate');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw || '')) return null;
    const [y,m,d] = raw.split('-').map(Number);
    const date = safeDate(y, m - 1, d);
    if (!date || date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
    return date;
  }

  function today() {
    const overridden = previewDate();
    if (overridden) return overridden;
    const now = new Date();
    return safeDate(now.getFullYear(), now.getMonth(), now.getDate());
  }

  function addDays(date, days) {
    const out = new Date(date);
    out.setDate(out.getDate() + days);
    out.setHours(12,0,0,0);
    return out;
  }

  function sameDay(a,b) {
    return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function between(date, start, end) {
    return date >= start && date <= end;
  }

  function easterSunday(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return safeDate(year, month, day);
  }

  function adventStart(year) {
    const dec3 = safeDate(year, 11, 3);
    return addDays(dec3, -dec3.getDay());
  }

  function calendarFor(date) {
    const year = date.getFullYear();
    const easter = easterSunday(year);
    const ashWednesday = addDays(easter, -46);
    const palmSunday = addDays(easter, -7);
    const holySaturday = addDays(easter, -1);
    const pentecost = addDays(easter, 49);
    const advent = adventStart(year);
    const christmas = safeDate(year, 11, 25);
    const christmasEnd = safeDate(year, 0, 6);

    let season = 'ordinary';
    let week = 0;
    let label = 'Tiempo Ordinario';

    if (date.getMonth() === 0 && date <= christmasEnd) {
      season = 'christmas'; label = 'Navidad';
    } else if (between(date, ashWednesday, addDays(palmSunday, -1))) {
      season = 'lent'; label = 'Cuaresma';
      week = Math.min(6, Math.floor((date - ashWednesday) / 604800000) + 1);
    } else if (between(date, palmSunday, holySaturday)) {
      season = 'holy-week'; label = 'Semana Santa';
    } else if (sameDay(date, pentecost)) {
      season = 'pentecost'; label = 'Pentecostés';
    } else if (between(date, easter, addDays(pentecost, -1))) {
      season = 'easter'; label = 'Pascua';
      week = Math.min(7, Math.floor((date - easter) / 604800000) + 1);
    } else if (between(date, advent, addDays(christmas, -1))) {
      season = 'advent'; label = 'Adviento';
      week = Math.min(4, Math.floor((date - advent) / 604800000) + 1);
    } else if (between(date, christmas, safeDate(year, 11, 31))) {
      season = 'christmas'; label = 'Navidad';
    }

    let salesian = null;
    if (date.getMonth() === 0 && date.getDate() === 31) salesian = { id:'don-bosco', label:'Don Bosco' };
    if (date.getMonth() === 4 && date.getDate() === 24) salesian = { id:'auxiliadora', label:'María Auxiliadora' };
    if (date.getMonth() === 7 && date.getDate() === 16) salesian = { id:'bosco-birthday', label:'Nacimiento de Don Bosco' };

    return { date, season, label, week, salesian, easter, ashWednesday, palmSunday, pentecost, advent, christmas, preview:Boolean(previewDate()) };
  }

  function root() {
    if (SPACE === 'house') return document.querySelector('.cafasso-house');
    if (SPACE === 'patio') return document.querySelector('.cafasso-patio');
    if (SPACE === 'escuela') return document.querySelector('.cafasso-escuela');
    return document.querySelector('.cafasso-parroquia');
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-calendar-layer{position:absolute;inset:0;z-index:4;pointer-events:none;overflow:hidden}
      .cafasso-calendar-atmosphere{position:absolute;inset:0;opacity:1;transition:background 1.4s ease,box-shadow 1.4s ease,opacity 1.4s ease}
      .cafasso-calendar-symbol{position:absolute;z-index:5;pointer-events:none;opacity:0;transition:opacity .9s ease,transform .9s ease,filter .9s ease}

      .cafasso-lit-advent .cafasso-calendar-atmosphere{background:linear-gradient(180deg,rgba(53,34,83,.055),transparent 52%,rgba(63,43,88,.035));box-shadow:inset 0 0 120px rgba(62,38,91,.045)}
      .cafasso-lit-christmas .cafasso-calendar-atmosphere{background:radial-gradient(circle at 72% 14%,rgba(255,222,143,.13),transparent 34%),linear-gradient(180deg,rgba(255,231,171,.035),transparent 58%);box-shadow:inset 0 0 105px rgba(237,190,91,.04)}
      .cafasso-lit-lent .cafasso-calendar-atmosphere{background:linear-gradient(180deg,rgba(48,35,62,.10),rgba(37,31,43,.045));box-shadow:inset 0 0 150px rgba(31,21,39,.09)}
      .cafasso-lit-holy-week .cafasso-calendar-atmosphere{background:linear-gradient(180deg,rgba(27,23,31,.15),rgba(15,17,19,.12));box-shadow:inset 0 0 180px rgba(11,10,15,.16)}
      .cafasso-lit-easter .cafasso-calendar-atmosphere{background:radial-gradient(circle at 67% 18%,rgba(255,237,181,.18),transparent 40%),linear-gradient(180deg,rgba(255,246,207,.055),transparent 60%);box-shadow:inset 0 0 110px rgba(255,218,128,.045)}
      .cafasso-lit-pentecost .cafasso-calendar-atmosphere{background:radial-gradient(circle at 54% 23%,rgba(255,128,72,.14),transparent 38%),linear-gradient(180deg,rgba(135,35,27,.055),transparent 62%);box-shadow:inset 0 0 120px rgba(120,37,26,.06)}

      .cafasso-advent-wreath{right:8.2%;bottom:8.8%;width:126px;height:42px;transform:translateY(5px)}
      .cafasso-advent-wreath:before{content:"";position:absolute;left:6px;right:6px;bottom:1px;height:22px;border:7px solid rgba(39,80,58,.84);border-radius:50%;box-shadow:0 7px 13px rgba(0,0,0,.32),inset 0 1px rgba(223,245,214,.12)}
      .cafasso-advent-candle{position:absolute;bottom:17px;width:12px;height:27px;border-radius:3px 3px 1px 1px;background:linear-gradient(90deg,#684c77,#9270a3 52%,#5d456c);box-shadow:0 3px 5px rgba(0,0,0,.24)}
      .cafasso-advent-candle:nth-child(1){left:16px}.cafasso-advent-candle:nth-child(2){left:45px}.cafasso-advent-candle:nth-child(3){left:73px;background:linear-gradient(90deg,#a75e73,#d98ca1 52%,#984f65)}.cafasso-advent-candle:nth-child(4){left:101px}
      .cafasso-advent-candle.is-lit:after{content:"";position:absolute;left:3px;top:-12px;width:6px;height:11px;border-radius:52% 48% 48% 52%;background:radial-gradient(circle at 50% 70%,#fff7c9 0 19%,#ffd76f 31%,#e99a38 57%,transparent 70%);filter:drop-shadow(0 0 5px rgba(255,205,92,.75));animation:cafassoCalendarFlame 1.8s ease-in-out infinite alternate}
      @keyframes cafassoCalendarFlame{from{transform:rotate(-2deg) scale(.94)}to{transform:rotate(2deg) scale(1.06)}}

      .cafasso-calendar-star{right:11%;top:10%;width:28px;height:28px;filter:drop-shadow(0 0 12px rgba(255,219,124,.48));transform:scale(.8)}
      .cafasso-calendar-star:before,.cafasso-calendar-star:after{content:"";position:absolute;left:13px;top:0;width:2px;height:28px;border-radius:99px;background:linear-gradient(transparent,#ffe7a0 35%,#fff7d0 50%,#ffe7a0 65%,transparent)}
      .cafasso-calendar-star:after{transform:rotate(90deg)}
      .cafasso-lit-christmas .cafasso-calendar-star,.cafasso-lit-easter .cafasso-calendar-star{opacity:.9;transform:scale(1)}

      .cafasso-calendar-cross{right:10%;top:14%;width:30px;height:45px;filter:drop-shadow(0 6px 8px rgba(0,0,0,.26))}
      .cafasso-calendar-cross:before,.cafasso-calendar-cross:after{content:"";position:absolute;background:rgba(78,57,44,.72);border-radius:2px}
      .cafasso-calendar-cross:before{left:12px;top:0;width:6px;height:45px}.cafasso-calendar-cross:after{left:2px;top:12px;width:26px;height:5px}
      .cafasso-lit-lent .cafasso-calendar-cross{opacity:.48}.cafasso-lit-holy-week .cafasso-calendar-cross{opacity:.74;transform:translateY(2px)}

      .cafasso-pentecost-ember{left:50%;top:18%;width:7px;height:12px;border-radius:60% 40% 65% 35%;background:radial-gradient(circle at 50% 70%,#fff5b8,#ef8f46 48%,#b8392d 72%,transparent 75%);box-shadow:-34px 14px 0 -1px rgba(221,77,51,.45),31px 18px 0 -1px rgba(244,139,65,.42),12px -8px 0 -2px rgba(255,210,104,.46)}
      .cafasso-lit-pentecost .cafasso-pentecost-ember{opacity:.86;animation:cafassoPentecostFloat 3.6s ease-in-out infinite alternate}
      @keyframes cafassoPentecostFloat{from{transform:translate(-50%,4px) rotate(-4deg)}to{transform:translate(-50%,-5px) rotate(4deg)}}

      .cafasso-season-word{left:7.5%;top:12.5%;padding:0;color:rgba(245,239,217,.28);font:italic 20px/1 Georgia,serif;letter-spacing:.02em;text-shadow:0 2px 8px rgba(0,0,0,.25);transform:rotate(-2deg)}
      .cafasso-lit-advent .cafasso-escuela .cafasso-season-word{opacity:.75}.cafasso-lit-advent .cafasso-escuela .cafasso-season-word:after{content:"Esperar"}
      .cafasso-lit-lent .cafasso-escuela .cafasso-season-word{opacity:.63}.cafasso-lit-lent .cafasso-escuela .cafasso-season-word:after{content:"Volver"}
      .cafasso-lit-easter .cafasso-escuela .cafasso-season-word{opacity:.72}.cafasso-lit-easter .cafasso-escuela .cafasso-season-word:after{content:"Vida nueva"}
      .cafasso-lit-pentecost .cafasso-escuela .cafasso-season-word{opacity:.76}.cafasso-lit-pentecost .cafasso-escuela .cafasso-season-word:after{content:"Espíritu"}

      .cafasso-salesian-sign{left:50%;bottom:7.8%;width:76px;height:20px;transform:translate(-50%,6px)}
      .cafasso-salesian-sign:before{content:"";position:absolute;left:6px;right:6px;top:5px;height:9px;border-radius:70% 35% 65% 40%;background:linear-gradient(90deg,#154f7c,#2b78a3 48%,#e7b94c 50%,#dba42f 100%);box-shadow:0 5px 9px rgba(0,0,0,.28);transform:rotate(-4deg)}
      .cafasso-salesian-don-bosco .cafasso-patio .cafasso-salesian-sign,.cafasso-salesian-bosco-birthday .cafasso-house .cafasso-salesian-sign{opacity:.92;transform:translate(-50%,0)}
      .cafasso-salesian-auxiliadora .cafasso-parroquia .cafasso-salesian-sign{opacity:.92;transform:translate(-50%,0)}
      .cafasso-salesian-auxiliadora .cafasso-parroquia .cafasso-salesian-sign:before{background:linear-gradient(90deg,#dcefff,#77a8d1 46%,#f5e7b0 50%,#f0d889 100%)}

      .cafasso-calendar-preview{position:fixed;right:14px;bottom:58px;z-index:2147483100;padding:5px 8px;border:1px solid rgba(236,202,130,.25);border-radius:999px;background:rgba(9,25,25,.72);color:rgba(255,241,207,.72);font:700 7px/1 Inter,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;pointer-events:none;backdrop-filter:blur(5px)}
      .cafasso-calendar-admin-trigger{position:fixed;right:14px;bottom:14px;z-index:2147483200;width:36px;height:36px;border:1px solid rgba(236,202,130,.30);border-radius:50%;background:rgba(12,35,34,.66);color:#f5e2ae;font:700 17px/1 Georgia,serif;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.24);backdrop-filter:blur(5px);opacity:.78}
      .cafasso-calendar-admin-trigger:hover,.cafasso-calendar-admin-trigger:focus-visible{opacity:1;outline:none;transform:translateY(-1px)}
      .cafasso-calendar-admin-panel{position:fixed;right:14px;bottom:58px;z-index:2147483201;width:min(280px,calc(100vw - 28px));padding:12px;border:1px solid rgba(236,202,130,.24);border-radius:14px;background:rgba(8,28,28,.94);box-shadow:0 16px 44px rgba(0,0,0,.38);backdrop-filter:blur(10px);color:#f8edd1;font-family:Inter,system-ui,sans-serif}
      .cafasso-calendar-admin-panel[hidden]{display:none!important}.cafasso-calendar-admin-panel strong{display:block;margin:0 0 9px;font:600 14px/1.2 Georgia,serif;color:#fff5d9}.cafasso-calendar-admin-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}.cafasso-calendar-admin-grid button{min-height:32px;padding:7px 8px;border:1px solid rgba(240,210,141,.18);border-radius:8px;background:rgba(255,255,255,.035);color:#f6e7c0;font:700 8px/1.15 Inter,system-ui,sans-serif;cursor:pointer;text-align:left}.cafasso-calendar-admin-grid button:hover{background:rgba(240,210,141,.10);border-color:rgba(240,210,141,.35)}

      @media(max-width:680px){.cafasso-advent-wreath{right:5%;bottom:10%;transform:scale(.76);transform-origin:100% 100%}.cafasso-calendar-cross,.cafasso-calendar-star{right:6%}.cafasso-season-word{left:6%;top:10%;font-size:15px}.cafasso-salesian-sign{bottom:9%}.cafasso-calendar-admin-trigger{right:10px;bottom:10px}.cafasso-calendar-admin-panel{right:10px;bottom:54px}}
      @media(prefers-reduced-motion:reduce){.cafasso-calendar-atmosphere,.cafasso-calendar-symbol,.cafasso-calendar-admin-trigger{transition:none!important}.cafasso-advent-candle.is-lit:after,.cafasso-lit-pentecost .cafasso-pentecost-ember{animation:none!important}}
    `;
    document.head.appendChild(style);
  }

  function mountLayer(state) {
    const host = root();
    if (!host) return false;
    let layer = host.querySelector('.cafasso-calendar-layer');
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'cafasso-calendar-layer';
      layer.setAttribute('aria-hidden','true');
      layer.innerHTML = `
        <div class="cafasso-calendar-atmosphere"></div>
        <div class="cafasso-calendar-symbol cafasso-calendar-star"></div>
        <div class="cafasso-calendar-symbol cafasso-calendar-cross"></div>
        <div class="cafasso-calendar-symbol cafasso-pentecost-ember"></div>
        <div class="cafasso-calendar-symbol cafasso-season-word"></div>
        <div class="cafasso-calendar-symbol cafasso-salesian-sign"></div>`;
      host.appendChild(layer);
    }

    let wreath = layer.querySelector('.cafasso-advent-wreath');
    if (SPACE === 'parroquia' && state.season === 'advent') {
      if (!wreath) {
        wreath = document.createElement('div');
        wreath.className = 'cafasso-calendar-symbol cafasso-advent-wreath';
        wreath.innerHTML = '<i class="cafasso-advent-candle"></i><i class="cafasso-advent-candle"></i><i class="cafasso-advent-candle"></i><i class="cafasso-advent-candle"></i>';
        layer.appendChild(wreath);
      }
      wreath.style.opacity = '.96';
      wreath.querySelectorAll('.cafasso-advent-candle').forEach((candle,index) => candle.classList.toggle('is-lit', index < Math.max(1,state.week || 1)));
    } else if (wreath) {
      wreath.remove();
    }
    return true;
  }

  function setPreview(value) {
    if (!isAdmin()) return false;
    const next = new URL(location.href);
    if (value) next.searchParams.set('cafassoDate', value);
    else next.searchParams.delete('cafassoDate');
    location.href = next.toString();
    return true;
  }

  function mountAdminPreview(state) {
    document.querySelector('.cafasso-calendar-admin-trigger')?.remove();
    document.querySelector('.cafasso-calendar-admin-panel')?.remove();
    if (!isAdmin()) return;

    const year = new Date().getFullYear();
    const easter = easterSunday(year);
    const advent = adventStart(year);
    const presets = [
      ['Hoy',''],
      ['Adviento 1',ymd(advent)],
      ['Adviento 4',ymd(addDays(advent,21))],
      ['Navidad',`${year}-12-25`],
      ['Cuaresma',ymd(addDays(easter,-30))],
      ['Semana Santa',ymd(addDays(easter,-7))],
      ['Pascua',ymd(easter)],
      ['Pentecostés',ymd(addDays(easter,49))],
      ['Don Bosco',`${year}-01-31`],
      ['Auxiliadora',`${year}-05-24`],
      ['Nacimiento DB',`${year}-08-16`]
    ];

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'cafasso-calendar-admin-trigger';
    trigger.textContent = '◷';
    trigger.title = 'Previsualizar calendario CAFASSO';
    trigger.setAttribute('aria-label', trigger.title);

    const panel = document.createElement('div');
    panel.className = 'cafasso-calendar-admin-panel';
    panel.hidden = true;
    panel.innerHTML = `<strong>Calendario vivo</strong><div class="cafasso-calendar-admin-grid"></div>`;
    const grid = panel.querySelector('.cafasso-calendar-admin-grid');
    presets.forEach(([name,value]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = name;
      button.addEventListener('click', () => setPreview(value));
      grid.appendChild(button);
    });

    trigger.addEventListener('click', event => {
      event.preventDefault(); event.stopPropagation(); panel.hidden = !panel.hidden;
    });
    document.addEventListener('pointerdown', event => {
      if (!panel.hidden && !panel.contains(event.target) && event.target !== trigger) panel.hidden = true;
    });
    document.body.append(trigger,panel);
  }

  function apply(state) {
    ensureStyles();
    PERIOD_CLASSES.forEach(name => document.body.classList.remove(name));
    SALESIAN_CLASSES.forEach(name => document.body.classList.remove(name));
    document.body.classList.add(`cafasso-lit-${state.season}`);
    document.documentElement.dataset.cafassoLiturgicalSeason = state.season;
    document.documentElement.dataset.cafassoLiturgicalWeek = String(state.week || 0);
    if (state.salesian) document.body.classList.add(`cafasso-salesian-${state.salesian.id}`);
    mountLayer(state);

    document.querySelector('.cafasso-calendar-preview')?.remove();
    if (state.preview) {
      const badge = document.createElement('div');
      badge.className = 'cafasso-calendar-preview';
      badge.textContent = `Previsualización · ${state.date.toLocaleDateString('es-UY')} · ${state.salesian?.label || state.label}`;
      document.body.appendChild(badge);
    }

    window.CafassoCalendar = {
      get: () => state,
      preview: value => setPreview(value),
      clearPreview: () => setPreview('')
    };
    mountAdminPreview(state);

    window.dispatchEvent(new CustomEvent('cafasso:calendar', { detail: {
      season: state.season,
      label: state.label,
      week: state.week,
      salesian: state.salesian,
      date: ymd(state.date),
      preview: state.preview,
      space: SPACE
    }}));
  }

  function boot() {
    const host = root();
    if (!host) return false;
    apply(calendarFor(today()));
    return true;
  }

  let attempts = 0;
  const wait = () => {
    if (boot()) return;
    if (attempts++ < 45) setTimeout(wait, 90);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wait, { once:true });
  else wait();

  setInterval(() => {
    const state = calendarFor(today());
    const current = window.CafassoCalendar?.get?.();
    const nextKey = `${state.date.toDateString()}|${state.season}|${state.week}|${state.salesian?.id || ''}`;
    const oldKey = current ? `${current.date.toDateString()}|${current.season}|${current.week}|${current.salesian?.id || ''}` : '';
    if (nextKey !== oldKey) apply(state);
  }, 15 * 60 * 1000);
})();
