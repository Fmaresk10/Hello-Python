(() => {
  if (window.__cafassoAnimatorWorldInstalled) return;
  window.__cafassoAnimatorWorldInstalled = true;

  const root = document.documentElement;
  const BG = 'https://static.wixstatic.com/media/47bf07_fdaf845ac90049d89227e663e627cd4e~mv2.jpg';
  const STYLE_ID = 'cafassoAnimatorWorldStyles';

  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[char]));
  const home = () => document.querySelector('.cafasso-home-v2');
  const isHome = () => (location.hash || '#inicio').replace(/^#/, '') === 'inicio';

  function styles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      html[data-cafasso-home-v2="1"] body{background:#102F35 url('${BG}') center/cover fixed no-repeat!important;overflow-x:hidden}
      html[data-cafasso-home-v2="1"] .shell{display:block!important;min-height:100vh!important}
      html[data-cafasso-home-v2="1"] main{width:100%!important;max-width:none!important;min-height:100vh;padding:0!important}
      html[data-cafasso-home-v2="1"] .side{position:fixed!important;z-index:40;left:0;top:0;width:230px;height:100vh;padding:27px 16px!important;background:linear-gradient(90deg,rgba(6,27,33,.9),rgba(6,27,33,.38),transparent)!important;border-radius:0!important;box-shadow:none!important}
      html[data-cafasso-home-v2="1"] .side .nav{margin-top:0!important;gap:7px!important}html[data-cafasso-home-v2="1"] .side .nav button{background:rgba(8,35,39,.42)!important;border:1px solid rgba(244,216,137,.18)!important;backdrop-filter:blur(8px);color:#FFF9E8!important}html[data-cafasso-home-v2="1"] .side .nav button.active,html[data-cafasso-home-v2="1"] .side .nav button:hover{background:rgba(244,216,137,.9)!important;color:#17302F!important}
      html[data-cafasso-home-v2="1"] .cafasso-home-v2{max-width:none!important;min-height:100vh;padding:0!important;position:relative}
      .cafasso-world{position:relative;min-height:100vh;overflow:hidden;background:linear-gradient(180deg,rgba(5,27,32,.12),rgba(5,27,32,.28));padding:28px 6vw 32px 250px}
      .cafasso-world:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,27,32,.12),transparent 26%,rgba(5,27,32,.2));pointer-events:none}
      .cafasso-world-hud{position:relative;z-index:4;display:flex;justify-content:space-between;align-items:flex-start;gap:20px;color:#FFF9E8;text-shadow:0 2px 12px rgba(0,0,0,.45)}
      .cafasso-world-kicker{font:850 10px/1.2 Inter,system-ui;letter-spacing:.16em;text-transform:uppercase;color:#F4D889;margin-bottom:7px}.cafasso-world-title{font:400 39px/1 Georgia,serif;margin:0}.cafasso-world-sub{font-size:12px;color:#DDE9DF;margin-top:8px}
      .cafasso-world-stats{display:flex;gap:9px;flex-wrap:wrap;justify-content:flex-end}.cafasso-world-stat{display:flex;align-items:center;gap:7px;padding:9px 12px;border:1px solid rgba(244,216,137,.4);border-radius:999px;background:rgba(8,35,39,.65);backdrop-filter:blur(8px);font-size:11px;font-weight:850}.cafasso-world-stat b{color:#F4D889;font-size:15px}
      .cafasso-world-map{position:absolute;z-index:2;inset:0}.cafasso-world-zone{position:absolute;appearance:none;border:0;background:transparent;color:#FFF9E8;text-align:left;cursor:pointer;text-shadow:0 2px 8px rgba(0,0,0,.7);transition:transform .2s ease,filter .2s ease;filter:drop-shadow(0 7px 10px rgba(0,0,0,.28))}.cafasso-world-zone:hover{transform:translateY(-5px) scale(1.025);filter:drop-shadow(0 10px 15px rgba(0,0,0,.4))}.cafasso-world-zone:focus-visible{outline:3px solid #F4D889;outline-offset:5px;border-radius:16px}
      .cafasso-world-zone-label{display:inline-flex;align-items:center;gap:7px;padding:8px 12px;border-radius:999px;background:rgba(8,35,39,.75);border:1px solid rgba(244,216,137,.6);backdrop-filter:blur(7px);font:850 11px Inter,system-ui;letter-spacing:.1em;text-transform:uppercase}.cafasso-world-zone-label i{font-style:normal;font-size:16px}.cafasso-world-zone-copy{display:block;max-width:155px;margin:7px 0 0;font-size:11px;line-height:1.35;color:#F3F5E9}
      .cafasso-world-zone[data-zone="casa"]{left:8%;bottom:22%}.cafasso-world-zone[data-zone="patio"]{left:39%;bottom:15%}.cafasso-world-zone[data-zone="escuela"]{right:13%;top:24%}.cafasso-world-zone[data-zone="parroquia"]{right:7%;bottom:20%}
      .cafasso-world-panel{position:absolute;z-index:8;right:7%;bottom:7%;width:min(360px,calc(100% - 280px));padding:18px 20px;border:1px solid rgba(244,216,137,.58);border-radius:18px;background:rgba(8,35,39,.9);backdrop-filter:blur(15px);color:#FFF9E8;box-shadow:0 16px 42px rgba(0,0,0,.32);display:none}.cafasso-world-panel.show{display:block;animation:cafassoWorldPanelIn .2s ease-out both}.cafasso-world-panel h3{font:400 25px/1.1 Georgia,serif;color:#F4D889;margin:0 0 6px}.cafasso-world-panel p{margin:0;color:#DDE9DF;font-size:12px;line-height:1.5}.cafasso-world-panel button{margin-top:14px;border:0;border-radius:999px;background:#F1C85B;color:#17302F;padding:10px 14px;font:850 11px Inter,system-ui;cursor:pointer}.cafasso-world-panel .close{position:absolute;right:10px;top:8px;margin:0;padding:3px 7px;background:transparent;color:#FFF9E8;font-size:18px}
      .cafasso-world-panel .cafasso-daily-word{margin-top:13px!important;background:rgba(255,255,255,.06)!important;border:1px solid rgba(244,216,137,.2)!important;box-shadow:none!important;border-radius:13px!important;padding:13px!important}.cafasso-world-panel .cafasso-dw-shell{display:block!important}.cafasso-world-panel .cafasso-dw-action{margin-top:10px!important}.cafasso-world-panel .cafasso-dw-link{background:#F1C85B!important}
      @keyframes cafassoWorldPanelIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
      @media(max-width:680px){html[data-cafasso-home-v2="1"] .side{display:none!important}.cafasso-world{min-height:100svh;padding:20px 14px 84px}.cafasso-world-hud{display:block}.cafasso-world-title{font-size:31px}.cafasso-world-sub{font-size:11px}.cafasso-world-stats{justify-content:flex-start;margin-top:13px}.cafasso-world-map{inset:0}.cafasso-world-zone-label{font-size:9px;padding:7px 9px}.cafasso-world-zone-copy{font-size:9px;max-width:105px}.cafasso-world-zone[data-zone="casa"]{left:3%;bottom:24%}.cafasso-world-zone[data-zone="patio"]{left:36%;bottom:12%}.cafasso-world-zone[data-zone="escuela"]{right:2%;top:29%}.cafasso-world-zone[data-zone="parroquia"]{right:2%;bottom:25%}.cafasso-world-panel{left:14px;right:14px;bottom:79px;width:auto}.cafasso-home-profile-chip{z-index:5!important}}
    `;
    document.head.appendChild(style);
  }

  function readStats() {
    const almitas = document.querySelector('[data-almitas-total]')?.textContent?.trim() || '0';
    const ruah = document.querySelector('.cafasso-home-ruah-total')?.textContent?.trim() || '0 semanas';
    const title = document.querySelector('.cafasso-home-title')?.textContent?.trim() || 'Hola';
    return { almitas, ruah, title };
  }

  function buildWorld() {
    if (!isHome()) return;
    const old = home();
    if (!old || old.querySelector('.cafasso-world')) return;
    styles();
    const stats = readStats();
    const courseButton = old.querySelector('#cafassoHomeContinue');
    const dailyWord = document.getElementById('cafassoDailyWord');
    old.innerHTML = `<div class="cafasso-world"><header class="cafasso-world-hud"><div><div class="cafasso-world-kicker">Tu mundo CAFASSO</div><h1 class="cafasso-world-title">${esc(stats.title)}</h1><p class="cafasso-world-sub">Elegí un lugar y seguí caminando.</p></div><div class="cafasso-world-stats"><span class="cafasso-world-stat">✦ <b data-almitas-total>${esc(stats.almitas)}</b> almitas</span><span class="cafasso-world-stat">RUAH · <b>${esc(stats.ruah)}</b></span></div></header><div class="cafasso-world-map"><button class="cafasso-world-zone" data-zone="casa"><span class="cafasso-world-zone-label"><i>⌂</i> Casa</span><span class="cafasso-world-zone-copy">Un lugar para volver, descansar y reconocer lo que llevás dentro.</span></button><button class="cafasso-world-zone" data-zone="patio"><span class="cafasso-world-zone-label"><i>✦</i> Patio</span><span class="cafasso-world-zone-copy">El corazón del encuentro, el juego y la comunidad.</span></button><button class="cafasso-world-zone" data-zone="escuela"><span class="cafasso-world-zone-label"><i>◇</i> Escuela</span><span class="cafasso-world-zone-copy">Tus cursos, misiones y próximos pasos.</span></button><button class="cafasso-world-zone" data-zone="parroquia"><span class="cafasso-world-zone-label"><i>✝</i> Parroquia</span><span class="cafasso-world-zone-copy">La Palabra, la oración y el sentido del camino.</span></button></div><section class="cafasso-world-panel" aria-live="polite"><button class="close" aria-label="Cerrar">×</button><div class="cafasso-world-panel-content"></div></section></div>`;
    const panel = old.querySelector('.cafasso-world-panel');
    const content = old.querySelector('.cafasso-world-panel-content');
    const openPanel = zone => {
      const copy = {
        casa: ['Casa', 'Acá podés revisar tus almitas, tu RUAH y tu identidad como animador.', 'Ver mi perfil'],
        patio: ['Patio', 'El lugar de la cercanía: pequeños gestos, comunidad y vida compartida.', 'Continuar recorrido'],
        escuela: ['Escuela', 'Tus cursos viven acá. Cada misión completada abre un nuevo tramo del camino.', 'Entrar a mi curso'],
        parroquia: ['Parroquia', 'Un espacio para detenerte, escuchar la Palabra y volver a poner el corazón en el camino.', 'Abrir la Palabra del día']
      }[zone];
      content.innerHTML = `<h3>${copy[0]}</h3><p>${copy[1]}</p><button data-world-action="${zone}">${copy[2]} →</button>`;
      if (zone === 'parroquia' && dailyWord) { dailyWord.remove(); content.appendChild(dailyWord); }
      panel.classList.add('show');
    };
    old.querySelectorAll('[data-zone]').forEach(zone => zone.addEventListener('click', () => openPanel(zone.dataset.zone)));
    panel.querySelector('.close').addEventListener('click', () => panel.classList.remove('show'));
    panel.addEventListener('click', event => {
      const action = event.target.closest('[data-world-action]');
      if (!action) return;
      const zone = action.dataset.worldAction;
      if (zone === 'escuela' || zone === 'patio') courseButton?.click();
      if (zone === 'casa') document.querySelector('[data-view="perfil"]')?.click();
      if (zone === 'parroquia') document.getElementById('cafassoDailyWord')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  function boot() {
    const observer = new MutationObserver(() => { if (isHome()) buildWorld(); });
    observer.observe(document.getElementById('app') || document.body, { childList: true, subtree: true });
    window.addEventListener('hashchange', () => setTimeout(buildWorld, 80));
    buildWorld();
    setTimeout(buildWorld, 220);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
})();

