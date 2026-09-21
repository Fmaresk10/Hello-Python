(() => {
  const AUTH_API = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoAuth';
  const STYLE_ID = 'cafassoHouseProfileStyles';

  function json(storage, key) {
    try { return JSON.parse(storage.getItem(key) || 'null'); }
    catch (error) { return null; }
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    })[char]);
  }

  function initials(name) {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    return ((parts[0]?.[0] || 'A') + (parts[1]?.[0] || '')).toUpperCase();
  }

  function readUser() {
    const session = json(localStorage, 'cafassoSession');
    return session?.user || {};
  }

  function getGroupLabel(user) {
    const candidates = [user.groupName, user.group, user.grupo, user.teamName, user.community, user.comunidad];
    const direct = candidates.find(value => typeof value === 'string' && value.trim());
    if (direct) return direct.trim();
    if (Array.isArray(user.groups) && user.groups.length) {
      return user.groups.map(item => typeof item === 'string' ? item : item?.name || item?.title).filter(Boolean).join(' · ');
    }
    return '';
  }

  function readJourneyCounters() {
    const almitasNode = document.querySelector('[data-global-almitas] .cafasso-global-counter__value');
    const ruahNode = document.querySelector('[data-global-ruah] .cafasso-global-counter__value');
    const almitas = String(almitasNode?.textContent || '').trim();
    const ruah = String(ruahNode?.textContent || '').trim().replace(/\s+/g, ' ');
    return {
      almitas: almitas && almitas !== '…' ? almitas : '—',
      ruah: ruah && ruah !== '…' ? ruah : '—'
    };
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-profile-global-anchor{
        position:fixed;z-index:2147483300;display:none;align-items:center;justify-content:center;
        pointer-events:none
      }
      .cafasso-profile-global-anchor.is-active{display:flex}
      .cafasso-profile-global-anchor .cafasso-profile-hud-button{margin:0;pointer-events:auto}
      body.cafasso-school-course-open .cafasso-profile-global-anchor{
        left:max(16px,env(safe-area-inset-left));right:auto;top:max(16px,env(safe-area-inset-top))
      }
      body.cafasso-mission-mode .cafasso-profile-global-anchor,
      html[data-cafasso-player="1"] .cafasso-profile-global-anchor{
        left:auto;right:max(16px,env(safe-area-inset-right));top:max(16px,env(safe-area-inset-top))
      }
      .cafasso-profile-hud-button{
        position:relative;display:grid;place-items:center;align-self:center;flex:0 0 auto;
        width:42px;height:42px;margin:5px 6px 5px 0;padding:0;border:1px solid rgba(242,201,90,.38);border-radius:50%;
        background:
          radial-gradient(circle at 36% 30%,rgba(255,255,255,.10),transparent 33%),
          linear-gradient(145deg,rgba(130,70,59,.96),rgba(91,47,43,.96));
        box-shadow:inset 0 1px rgba(255,255,255,.10),0 4px 12px rgba(0,0,0,.20);
        color:#fff4dc;font:800 13px/1 Inter,system-ui,sans-serif;letter-spacing:.03em;
        cursor:pointer;pointer-events:auto;transition:transform .16s ease,filter .16s ease,background .16s ease
      }
      .cafasso-profile-hud-button:before{
        content:"";position:absolute;inset:4px;border:1px solid rgba(242,201,90,.16);border-radius:50%;pointer-events:none
      }
      .cafasso-profile-hud-button:hover{
        transform:translateY(-1px) scale(1.035);filter:brightness(1.08);
        background:
          radial-gradient(circle at 36% 30%,rgba(255,255,255,.12),transparent 33%),
          linear-gradient(145deg,rgba(145,78,65,.98),rgba(101,52,47,.98))
      }
      .cafasso-profile-hud-button:focus-visible{outline:2px solid #f2c95a;outline-offset:2px}
      .cafasso-profile-hud-button__label{
        position:absolute;left:50%;top:calc(100% + 7px);transform:translateX(-50%) translateY(-2px);
        width:max-content;max-width:120px;padding:5px 7px;border-radius:999px;background:rgba(8,37,40,.94);
        border:1px solid rgba(242,201,90,.24);box-shadow:0 5px 13px rgba(0,0,0,.22);
        color:#eadcae;font:800 6.5px/1 Inter,system-ui,sans-serif;letter-spacing:.09em;text-transform:uppercase;
        opacity:0;pointer-events:none;transition:opacity .16s ease,transform .16s ease
      }
      .cafasso-profile-hud-button:hover .cafasso-profile-hud-button__label,
      .cafasso-profile-hud-button:focus-visible .cafasso-profile-hud-button__label{
        opacity:1;transform:translateX(-50%) translateY(0)
      }
      @media(max-width:680px){
        .cafasso-profile-hud-button{width:34px;height:34px;margin:4px 5px 4px 0;font-size:11px}
        .cafasso-profile-global-anchor .cafasso-profile-hud-button{width:36px;height:36px;margin:0;font-size:11px}
        .cafasso-profile-hud-button__label{display:none}
        body.cafasso-school-course-open .cafasso-profile-global-anchor{
          left:max(12px,env(safe-area-inset-left));top:max(12px,env(safe-area-inset-top))
        }
        body.cafasso-mission-mode .cafasso-profile-global-anchor,
        html[data-cafasso-player="1"] .cafasso-profile-global-anchor{
          right:max(12px,env(safe-area-inset-right));top:max(12px,env(safe-area-inset-top))
        }
      }


      .cafasso-profile-panel{
        position:fixed;inset:0;z-index:2147483400;display:flex;align-items:center;justify-content:center;
        padding:clamp(10px,2.2vh,24px);overflow:hidden;
        background:radial-gradient(circle at 50% 40%,rgba(92,65,40,.10),rgba(7,18,18,.68) 64%,rgba(4,13,14,.82));
        backdrop-filter:blur(9px) saturate(.78)
      }
      .cafasso-profile-card{
        position:relative;width:min(940px,94vw);max-width:calc(100vw - 20px);max-height:calc(100dvh - 20px);
        min-height:0;overflow:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;
        padding:34px 42px 28px 106px;border:1px solid rgba(110,79,48,.34);border-radius:14px;
        background:
          radial-gradient(circle at 86% 15%,rgba(176,131,70,.07),transparent 24%),
          repeating-linear-gradient(0deg,rgba(91,66,39,.017) 0 1px,transparent 1px 8px),
          linear-gradient(145deg,#fbf4e5 0%,#f3e6cb 55%,#ead7b4 100%);
        box-shadow:0 34px 90px rgba(0,0,0,.48),0 10px 24px rgba(35,24,15,.22),inset 0 0 0 1px rgba(255,255,255,.5);
        color:#3b3026;font-family:Georgia,serif
      }
      .cafasso-profile-card::-webkit-scrollbar{width:8px}
      .cafasso-profile-card::-webkit-scrollbar-thumb{background:rgba(112,80,48,.28);border-radius:999px}
      .cafasso-profile-card:before{
        content:"";position:absolute;left:0;top:0;bottom:0;width:72px;border-radius:13px 0 0 13px;
        background:
          linear-gradient(180deg,rgba(255,255,255,.08),transparent 14%),
          linear-gradient(180deg,#8d4937 0%,#9c5742 48%,#79402f 100%);
        box-shadow:inset -1px 0 rgba(77,48,31,.22),4px 0 14px rgba(87,56,36,.08)
      }
      .cafasso-profile-card:after{
        content:"JÓVENES · VIDA · VOCACIÓN";position:absolute;left:17px;top:116px;width:38px;
        color:rgba(255,242,217,.84);font:700 9px/1.65 Georgia,serif;letter-spacing:.08em;text-align:center;
        writing-mode:vertical-rl;transform:rotate(180deg)
      }
      .cafasso-profile-close{
        position:absolute;right:16px;top:14px;z-index:3;width:38px;height:38px;border:0;border-radius:50%;
        background:transparent;color:#6b5845;font:28px/1 Georgia,serif;cursor:pointer;transition:background .18s ease,transform .18s ease
      }
      .cafasso-profile-close:hover{background:rgba(112,79,45,.09);transform:rotate(3deg)}
      .cafasso-profile-kicker{
        display:flex;align-items:center;gap:10px;margin:0 0 4px;color:#9a754a;
        font:800 10px/1.2 Inter,system-ui,sans-serif;letter-spacing:.24em;text-transform:uppercase
      }
      .cafasso-profile-kicker:before,.cafasso-profile-kicker:after{content:"";height:1px;width:38px;background:rgba(154,117,74,.55)}
      .cafasso-profile-title{margin:0 0 18px;color:#31271f;font:500 42px/1 Georgia,serif;letter-spacing:-.025em}
      .cafasso-profile-head{
        display:grid;grid-template-columns:148px minmax(0,1fr);gap:29px;align-items:center;
        margin:0 0 24px;padding:18px 0 24px;border-top:1px solid rgba(115,82,49,.17);border-bottom:1px solid rgba(115,82,49,.17)
      }
      .cafasso-profile-avatar{
        position:relative;width:148px;height:172px;padding:7px;border:1px solid rgba(102,72,42,.28);border-radius:11px;
        background:#e7d3aa;box-shadow:0 12px 26px rgba(67,43,24,.18);transform:none;overflow:hidden
      }
      .cafasso-profile-avatar:after{content:"";position:absolute;inset:7px;border-radius:6px;pointer-events:none;background:linear-gradient(130deg,rgba(255,255,255,.17),transparent 28% 72%,rgba(97,68,38,.05))}
      .cafasso-profile-avatar__image{width:100%;height:100%;display:grid;place-items:center;overflow:hidden;border-radius:6px;background:linear-gradient(145deg,#ceb68c,#947651);color:#4d3827;font:700 38px Georgia,serif}
      .cafasso-profile-avatar__image img{width:100%;height:100%;display:block;object-fit:cover}
      .cafasso-profile-identity{position:relative;padding:2px 118px 0 0;min-height:150px}
      .cafasso-profile-identity:after{
        content:"DA MIHI ANIMAS\A CÆTERA TOLLE";white-space:pre;position:absolute;right:0;top:5px;width:92px;height:92px;
        display:grid;place-items:center;border:1px solid rgba(126,92,59,.28);border-radius:50%;color:rgba(112,78,47,.46);
        font:800 8px/1.5 Inter,system-ui,sans-serif;letter-spacing:.10em;text-align:center;transform:rotate(8deg)
      }
      .cafasso-profile-name{margin:0;color:#34291f;font:500 clamp(34px,4vw,49px)/1 Georgia,serif;letter-spacing:-.025em}
      .cafasso-profile-role{margin-top:8px;color:#9b503d;font:700 16px/1.35 Georgia,serif;letter-spacing:.01em;text-transform:none}
      .cafasso-profile-identity-line{margin-top:18px;padding-top:14px;border-top:1px solid rgba(110,77,42,.16);color:#665442;font:14px/1.55 Georgia,serif;font-style:normal;max-width:520px}
      .cafasso-profile-section-title{
        display:flex;align-items:center;gap:10px;margin:0 0 12px;color:#443426;font:600 20px/1.2 Georgia,serif
      }
      .cafasso-profile-section-title:after{content:"";height:1px;flex:1;background:rgba(116,82,49,.17)}
      .cafasso-profile-section-title span{display:grid;place-items:center;width:25px;height:25px;border-radius:50%;background:rgba(165,119,61,.09);color:#a36f37;font:800 11px Inter,system-ui,sans-serif}
      .cafasso-profile-details{
        display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:0 0 24px;padding:0;border:0
      }
      .cafasso-profile-field{
        min-width:0;min-height:80px;padding:12px 13px 11px;border:1px solid rgba(113,80,47,.16);border-radius:10px;
        background:rgba(255,252,244,.48);box-shadow:inset 0 1px rgba(255,255,255,.46)
      }
      .cafasso-profile-field small{display:block;margin-bottom:8px;color:#997352;font:800 9px/1.15 Inter,system-ui,sans-serif;text-transform:uppercase;letter-spacing:.10em}
      .cafasso-profile-field strong{display:block;color:#413328;font:600 13px/1.35 Inter,system-ui,sans-serif;overflow-wrap:anywhere}
      .cafasso-profile-path{
        display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:0 0 17px
      }
      .cafasso-profile-path__item{
        position:relative;min-height:126px;padding:18px 54px 17px 76px;border:1px solid rgba(115,79,44,.16);border-radius:12px;
        overflow:hidden;background:rgba(246,228,207,.64)
      }
      .cafasso-profile-path__item:before{
        content:"✦";position:absolute;left:18px;top:21px;width:43px;height:43px;display:grid;place-items:center;border-radius:50%;
        background:#a9583f;color:#fff4df;font:700 20px Georgia,serif;box-shadow:0 6px 12px rgba(99,58,39,.15)
      }
      .cafasso-profile-path__item--ruah{background:rgba(220,228,207,.68)}
      .cafasso-profile-path__item--ruah:before{content:"R";background:#6d8065}
      .cafasso-profile-path__item:after{content:"›";position:absolute;right:20px;top:50%;transform:translateY(-50%);color:rgba(79,59,42,.58);font:34px/1 Georgia,serif}
      .cafasso-profile-path__item small{display:block;margin-bottom:3px;color:#865643;font:700 15px/1.1 Georgia,serif;text-transform:none;letter-spacing:0}
      .cafasso-profile-path__item--ruah small{color:#51644f}
      .cafasso-profile-path__item strong{display:block;color:#633325;font:600 29px/1 Georgia,serif}
      .cafasso-profile-path__item--ruah strong{color:#40523e}
      .cafasso-profile-path__item span{display:block;margin-top:7px;color:#745f4c;font:12px/1.35 Georgia,serif}
      .cafasso-profile-reflection{
        display:flex;align-items:flex-start;gap:12px;margin:0 0 17px;padding:12px 15px;border:1px solid rgba(111,79,48,.12);
        border-radius:10px;background:rgba(255,252,244,.38);color:#76604c;font:italic 12px/1.5 Georgia,serif
      }
      .cafasso-profile-reflection:before{content:"“";color:#b99a73;font:34px/.8 Georgia,serif}
      .cafasso-profile-actions{
        display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0;padding-top:12px;border-top:1px solid rgba(115,82,49,.14)
      }
      .cafasso-profile-action{
        border:1px solid rgba(112,79,45,.24);border-radius:9px;padding:10px 15px;background:rgba(255,252,244,.48);
        color:#5d4936;font:700 11px Inter,system-ui,sans-serif;cursor:pointer;box-shadow:none;transition:background .18s ease,transform .18s ease
      }
      .cafasso-profile-action:hover{background:rgba(255,255,255,.72);transform:translateY(-1px)}
      .cafasso-profile-action--secondary{background:transparent;color:#806b57;border-color:rgba(112,79,45,.16)}
      .cafasso-profile-note{flex:1;min-width:230px;color:#947f68;font:10.5px/1.45 Inter,system-ui,sans-serif;text-align:right}
      .cafasso-profile-status{min-height:18px;margin:7px 0 0;color:#6a5745;font:700 11px/1.4 Inter,system-ui,sans-serif}

      @media(max-width:680px){
        .cafasso-animator-sheet{left:7.5%;top:18.5%;width:112px;height:134px;transform:perspective(560px) rotateY(-3deg) rotateZ(-3.4deg)}
        .cafasso-animator-sheet__clip{width:43px;height:20px;top:-8px}
        .cafasso-animator-sheet__brand{left:9px;right:9px;top:13px;padding-bottom:5px}.cafasso-animator-sheet__brand strong{font-size:10px}.cafasso-animator-sheet__brand span{font-size:5px}
        .cafasso-animator-sheet__body{left:9px;right:9px;top:41px;bottom:15px;grid-template-columns:42px 1fr;gap:7px}.cafasso-animator-sheet__portrait{width:42px;height:51px;border-width:2px;font-size:16px}.cafasso-animator-sheet__name{font-size:9px}.cafasso-animator-sheet__role{font-size:5.5px}.cafasso-animator-sheet__stamp{left:10px;bottom:10px;font-size:5px}.cafasso-animator-sheet__label{right:10px;bottom:11px;font-size:6px}
        .cafasso-profile-panel{padding:8px;align-items:flex-end}
        .cafasso-profile-card{width:100%;max-height:94dvh;padding:26px 18px 22px 24px;border-radius:16px 16px 0 0}.cafasso-profile-card:before{width:8px;border-radius:15px 0 0 0}.cafasso-profile-card:after{display:none}
        .cafasso-profile-kicker{font-size:8px;letter-spacing:.17em}.cafasso-profile-kicker:before,.cafasso-profile-kicker:after{width:20px}
        .cafasso-profile-title{font-size:31px;margin-bottom:13px}
        .cafasso-profile-head{grid-template-columns:88px minmax(0,1fr);gap:15px;padding:14px 0 17px;margin-bottom:18px}.cafasso-profile-avatar{width:88px;height:106px;padding:5px}.cafasso-profile-avatar__image{font-size:24px}
        .cafasso-profile-identity{padding:0;min-height:0}.cafasso-profile-identity:after{display:none}.cafasso-profile-name{font-size:27px}.cafasso-profile-role{font-size:13px}.cafasso-profile-identity-line{font-size:11.5px;margin-top:10px;padding-top:9px}
        .cafasso-profile-section-title{font-size:17px}.cafasso-profile-details{grid-template-columns:1fr 1fr;gap:8px;margin-bottom:19px}.cafasso-profile-field{min-height:72px;padding:10px}
        .cafasso-profile-path{grid-template-columns:1fr;gap:9px}.cafasso-profile-path__item{min-height:102px;padding:15px 44px 14px 66px}.cafasso-profile-path__item:before{left:14px;top:17px;width:39px;height:39px}.cafasso-profile-path__item strong{font-size:25px}
        .cafasso-profile-actions{display:grid;grid-template-columns:1fr}.cafasso-profile-action{width:100%}.cafasso-profile-note{min-width:0;text-align:left}.cafasso-profile-reflection{font-size:11.5px}
      }
      @media(max-height:720px) and (min-width:681px){
        .cafasso-profile-panel{padding:8px}
        .cafasso-profile-card{max-height:calc(100dvh - 16px);padding:20px 28px 18px 88px}
        .cafasso-profile-card:before{width:58px}.cafasso-profile-card:after{display:none}
        .cafasso-profile-title{margin-bottom:11px;font-size:31px}
        .cafasso-profile-head{grid-template-columns:92px minmax(0,1fr);gap:18px;margin-bottom:12px;padding:10px 0 13px}
        .cafasso-profile-avatar{width:92px;height:108px;padding:5px}
        .cafasso-profile-identity{min-height:0;padding-right:92px}.cafasso-profile-identity:after{width:72px;height:72px;font-size:6.5px}
        .cafasso-profile-name{font-size:clamp(27px,3vw,37px)}.cafasso-profile-role{font-size:13px}
        .cafasso-profile-identity-line{margin-top:8px;padding-top:8px;line-height:1.35;font-size:12px}
        .cafasso-profile-section-title{font-size:17px;margin-bottom:8px}.cafasso-profile-details{margin-bottom:13px;gap:8px}.cafasso-profile-field{min-height:62px;padding:8px 9px}.cafasso-profile-field small{margin-bottom:5px}.cafasso-profile-field strong{font-size:12px}
        .cafasso-profile-path{gap:9px;margin-bottom:10px}.cafasso-profile-path__item{min-height:90px;padding:12px 42px 11px 62px}.cafasso-profile-path__item:before{left:13px;top:15px;width:36px;height:36px}.cafasso-profile-path__item small{font-size:13px}.cafasso-profile-path__item strong{font-size:23px}.cafasso-profile-path__item span{font-size:10.5px;margin-top:4px}
        .cafasso-profile-reflection{display:none}.cafasso-profile-actions{padding-top:8px}.cafasso-profile-action{padding:8px 12px}
      }
      @media(prefers-reduced-motion:reduce){.cafasso-animator-sheet{transition:none}}
    `;
    document.head.appendChild(style);
  }

  function portraitMarkup(user, className) {
    const photo = String(user.avatarData || '').trim();
    if (photo) return `<div class="${className}"><img src="${esc(photo)}" alt="Foto de perfil"></div>`;
    return `<div class="${className}">${esc(initials(user.name || user.email || 'Animador'))}</div>`;
  }

  function updateSessionUser(patch) {
    const session = json(localStorage, 'cafassoSession');
    if (!session?.user) return;
    session.user = { ...session.user, ...patch };
    session.authenticated = true;
    session.checkedAt = Date.now();
    localStorage.setItem('cafassoSession', JSON.stringify(session));
  }

  function fileToAvatarData(file) {
    return new Promise((resolve, reject) => {
      if (!file || !String(file.type || '').startsWith('image/')) return reject(new Error('Elegí una imagen JPG, PNG o WEBP.'));
      if (file.size > 8 * 1024 * 1024) return reject(new Error('La imagen pesa demasiado. Elegí una de menos de 8 MB.'));
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error('No se pudo procesar la imagen.'));
        image.onload = () => {
          const size = 128;
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          const side = Math.min(image.width, image.height);
          const sx = (image.width - side) / 2;
          const sy = (image.height - side) / 2;
          ctx.drawImage(image, sx, sy, side, side, 0, 0, size, size);
          const output = canvas.toDataURL('image/jpeg', .72);
          if (output.length > 80000) return reject(new Error('Probá con una foto más simple o liviana.'));
          resolve(output);
        };
        image.src = String(reader.result || '');
      };
      reader.readAsDataURL(file);
    });
  }

  async function saveAvatar(avatarData) {
    const auth = json(localStorage, 'cafassoAuth');
    if (!auth?.sessionToken || Number(auth.expiresAt || 0) <= Date.now()) throw new Error('Tu sesión necesita volver a validarse para cambiar la foto.');
    const response = await fetch(AUTH_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.sessionToken}`
      },
      body: JSON.stringify({ action: 'saveAvatar', avatarData })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) throw new Error(result.error || 'No se pudo guardar la foto.');
    updateSessionUser(result.user || { avatarData });
    if (!result.user) updateSessionUser({ avatarData });
    return result;
  }

  function render() {
    if (document.querySelector('[data-house-profile-panel]')) return;
    ensureStyles();

    const user = readUser();
    const name = String(user.name || user.nombre || user.email || 'Mi perfil').trim();
    const role = String(user.role || 'Animador').trim();
    const email = String(user.email || '').trim();
    const group = getGroupLabel(user);

    const sheet = document.createElement('button');
    sheet.type = 'button';
    sheet.className = 'cafasso-profile-hud-button';
    sheet.dataset.houseProfile = 'open';
    sheet.setAttribute('aria-label', `Abrir mi ficha CAFASSO: ${name}`);
    sheet.innerHTML = `<span aria-hidden="true">${esc(initials(name))}</span><span class="cafasso-profile-hud-button__label">Mi ficha</span>`;

    const panel = document.createElement('section');
    panel.className = 'cafasso-profile-panel';
    panel.dataset.houseProfilePanel = '1';
    panel.hidden = true;
    panel.setAttribute('aria-label', 'Mi ficha CAFASSO');
    panel.innerHTML = `
      <article class="cafasso-profile-card" role="dialog" aria-modal="true" aria-labelledby="cafasso-house-profile-title">
        <button class="cafasso-profile-close" data-house-profile-close type="button" aria-label="Cerrar mi ficha">×</button>
        <div class="cafasso-profile-kicker">CAFASSO</div>
        <h2 class="cafasso-profile-title" id="cafasso-house-profile-title">Mi ficha</h2>

        <div class="cafasso-profile-head">
          <div class="cafasso-profile-avatar" data-house-profile-avatar>${portraitMarkup(user, 'cafasso-profile-avatar__image')}</div>
          <div class="cafasso-profile-identity">
            <h3 class="cafasso-profile-name">${esc(name)}</h3>
            <div class="cafasso-profile-role">Animador en camino · ${esc(role)}</div>
            <div class="cafasso-profile-identity-line">Mi lugar dentro de CAFASSO: crecer, servir y acompañar a otros en el camino.</div>
          </div>
        </div>

        <h3 class="cafasso-profile-section-title"><span aria-hidden="true">I</span>Información personal</h3>
        <div class="cafasso-profile-details">
          ${email ? `<div class="cafasso-profile-field"><small>Correo</small><strong>${esc(email)}</strong></div>` : '<div class="cafasso-profile-field"><small>Correo</small><strong>Sin registrar</strong></div>'}
          ${group ? `<div class="cafasso-profile-field"><small>Grupo / comunidad</small><strong>${esc(group)}</strong></div>` : '<div class="cafasso-profile-field"><small>Grupo / comunidad</small><strong>—</strong></div>'}
          <div class="cafasso-profile-field"><small>Rol</small><strong>${esc(role)}</strong></div>
          <div class="cafasso-profile-field"><small>Identidad CAFASSO</small><strong>Animador en camino</strong></div>
        </div>

        <h3 class="cafasso-profile-section-title"><span aria-hidden="true">C</span>Camino CAFASSO</h3>
        <div class="cafasso-profile-path" aria-label="Camino CAFASSO">
          <div class="cafasso-profile-path__item">
            <small>Almitas</small>
            <strong data-profile-almitas-value>—</strong>
            <span>Las huellas que vas reuniendo en tu camino.</span>
          </div>
          <div class="cafasso-profile-path__item cafasso-profile-path__item--ruah">
            <small>RUAH</small>
            <strong data-profile-ruah-value>—</strong>
            <span>Tu constancia diaria también transforma.</span>
          </div>
        </div>

        <div class="cafasso-profile-reflection">Cada paso que das en CAFASSO habla de una historia compartida, una vocación que crece y una comunidad que se construye.</div>

        <div class="cafasso-profile-actions">
          <button class="cafasso-profile-action" data-house-profile-photo type="button">Cambiar mi foto</button>
          ${user.avatarData ? '<button class="cafasso-profile-action cafasso-profile-action--secondary" data-house-profile-photo-remove type="button">Quitar foto</button>' : ''}
          <input data-house-profile-file type="file" accept="image/jpeg,image/png,image/webp" hidden>
          <span class="cafasso-profile-note">Ficha personal del animador · CAFASSO</span>
        </div>
        <div class="cafasso-profile-status" data-house-profile-status></div>
      </article>`;

    document.body.appendChild(panel);

    function ensureGlobalAnchor() {
      let anchor = document.getElementById('cafassoProfileGlobalAnchor');
      if (anchor) return anchor;
      anchor = document.createElement('div');
      anchor.id = 'cafassoProfileGlobalAnchor';
      anchor.className = 'cafasso-profile-global-anchor';
      anchor.setAttribute('aria-label', 'Acceso a mi ficha CAFASSO');
      document.body.appendChild(anchor);
      return anchor;
    }

    function needsStandaloneProfile() {
      return document.documentElement.dataset.cafassoPlayer === '1' ||
        document.body.classList.contains('cafasso-school-course-open') ||
        document.body.classList.contains('cafasso-mission-mode');
    }

    function mountProfileButton() {
      const anchor = ensureGlobalAnchor();
      if (needsStandaloneProfile()) {
        if (sheet.parentNode !== anchor) anchor.appendChild(sheet);
        anchor.classList.add('is-active');
        return true;
      }

      anchor.classList.remove('is-active');
      const hud = document.getElementById('cafassoGlobalCounters');
      if (!hud) return false;
      if (sheet.parentNode !== hud) hud.appendChild(sheet);
      return true;
    }

    mountProfileButton();
    const mountObserver = new MutationObserver(() => mountProfileButton());
    mountObserver.observe(document.body, {
      attributes:true,
      attributeFilter:['class'],
      childList:true,
      subtree:true
    });
    window.addEventListener('cafasso:course-experience-ready', mountProfileButton);
    window.addEventListener('cafasso:mobile-layout', mountProfileButton);

    const fileInput = panel.querySelector('[data-house-profile-file]');
    const choose = panel.querySelector('[data-house-profile-photo]');
    const status = panel.querySelector('[data-house-profile-status]');
    const close = () => { panel.hidden = true; sheet.focus(); };

    function refreshJourney() {
      const values = readJourneyCounters();
      const almitas = panel.querySelector('[data-profile-almitas-value]');
      const ruah = panel.querySelector('[data-profile-ruah-value]');
      if (almitas) almitas.textContent = values.almitas;
      if (ruah) ruah.textContent = values.ruah;
    }

    function refreshPhoto() {
      const fresh = readUser();
      const avatar = panel.querySelector('[data-house-profile-avatar]');
      if (avatar) avatar.innerHTML = portraitMarkup(fresh, 'cafasso-profile-avatar__image');
      const oldRemove = panel.querySelector('[data-house-profile-photo-remove]');
      if (fresh.avatarData && !oldRemove) {
        const button = document.createElement('button');
        button.className = 'cafasso-profile-action cafasso-profile-action--secondary';
        button.dataset.houseProfilePhotoRemove = '1';
        button.type = 'button';
        button.textContent = 'Quitar foto';
        choose.insertAdjacentElement('afterend', button);
        bindRemove(button);
      } else if (!fresh.avatarData && oldRemove) oldRemove.remove();
    }

    async function removePhoto(button) {
      button.disabled = true;
      choose.disabled = true;
      status.textContent = 'Quitando foto…';
      try {
        await saveAvatar('');
        refreshPhoto();
        status.textContent = 'Foto eliminada.';
      } catch (error) {
        status.textContent = error.message || 'No se pudo quitar la foto.';
      } finally {
        choose.disabled = false;
        if (button.isConnected) button.disabled = false;
      }
    }

    function bindRemove(button) {
      button.addEventListener('click', () => removePhoto(button));
    }

    sheet.addEventListener('click', () => {
      refreshJourney();
      panel.hidden = false;
      panel.querySelector('[data-house-profile-close]')?.focus();
      setTimeout(refreshJourney, 350);
    });
    panel.querySelector('[data-house-profile-close]')?.addEventListener('click', close);
    panel.addEventListener('click', event => { if (event.target === panel) close(); });
    choose?.addEventListener('click', () => fileInput?.click());
    const initialRemove = panel.querySelector('[data-house-profile-photo-remove]');
    if (initialRemove) bindRemove(initialRemove);

    refreshJourney();

    fileInput?.addEventListener('change', async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      choose.disabled = true;
      const remove = panel.querySelector('[data-house-profile-photo-remove]');
      if (remove) remove.disabled = true;
      status.textContent = 'Preparando tu foto…';
      try {
        const avatarData = await fileToAvatarData(file);
        status.textContent = 'Guardando…';
        await saveAvatar(avatarData);
        refreshPhoto();
        status.textContent = 'Foto de perfil actualizada.';
      } catch (error) {
        status.textContent = error.message || 'No se pudo guardar la foto.';
      } finally {
        choose.disabled = false;
        const freshRemove = panel.querySelector('[data-house-profile-photo-remove]');
        if (freshRemove) freshRemove.disabled = false;
        fileInput.value = '';
      }
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !panel.hidden) close();
    });
  }

  const mount = () => render();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once:true });
  else mount();
})();
