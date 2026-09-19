(() => {
  const params = new URLSearchParams(location.search);
  if ((params.get('space') || 'house') !== 'house') return;

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

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-animator-sheet{position:absolute;left:22.6%;top:20.8%;z-index:6;width:156px;height:184px;padding:0;border:0;background:transparent;cursor:pointer;transform-origin:50% 100%;transform:perspective(700px) rotateY(-4deg) rotateZ(-4.2deg);filter:drop-shadow(0 14px 10px rgba(0,0,0,.42));transition:transform .22s ease,filter .22s ease}
      .cafasso-animator-sheet:hover{transform:perspective(700px) rotateY(-2deg) rotateZ(-2.2deg) translateY(-5px) scale(1.025);filter:drop-shadow(0 18px 14px rgba(0,0,0,.46)) brightness(1.025)}
      .cafasso-animator-sheet:focus-visible{outline:3px solid #f2c95a;outline-offset:6px;border-radius:5px}
      .cafasso-animator-sheet__paper{position:absolute;inset:0;overflow:hidden;border:1px solid rgba(91,66,40,.52);border-radius:3px;background:repeating-linear-gradient(0deg,rgba(92,66,39,.025) 0 1px,transparent 1px 7px),linear-gradient(145deg,#f7ecd2 0%,#ead6ad 72%,#ddc295 100%);box-shadow:inset 0 0 18px rgba(113,78,42,.11),inset 0 0 0 3px rgba(255,250,235,.34),0 3px 1px rgba(58,37,21,.12)}
      .cafasso-animator-sheet__paper:before{content:"";position:absolute;right:-1px;bottom:-1px;width:31px;height:31px;background:linear-gradient(135deg,rgba(167,128,79,.16) 0 49%,#c9aa79 50% 53%,#f1dfbd 54% 100%);clip-path:polygon(100% 0,100% 100%,0 100%);filter:drop-shadow(-2px -2px 2px rgba(76,51,29,.12))}
      .cafasso-animator-sheet__paper:after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(118deg,rgba(255,255,255,.22),transparent 22% 72%,rgba(108,74,39,.04));mix-blend-mode:screen}
      .cafasso-animator-sheet__clip{position:absolute;z-index:4;left:50%;top:-10px;width:56px;height:25px;transform:translateX(-50%) rotate(1deg);border:1px solid rgba(69,53,35,.58);border-radius:4px 4px 7px 7px;background:linear-gradient(180deg,#9a907e,#d0c5ad 32%,#766c5c 50%,#b9ad95 74%,#6b6254);box-shadow:0 4px 5px rgba(0,0,0,.25),inset 0 1px rgba(255,255,255,.42)}
      .cafasso-animator-sheet__brand{position:absolute;left:13px;right:13px;top:17px;display:flex;align-items:flex-end;justify-content:space-between;gap:8px;padding-bottom:7px;border-bottom:1px solid rgba(105,75,42,.24);color:#6b4d2f;font-family:Georgia,serif}
      .cafasso-animator-sheet__brand strong{font-size:14px;letter-spacing:.07em}
      .cafasso-animator-sheet__brand span{font:800 7px/1 Inter,system-ui,sans-serif;letter-spacing:.15em;text-transform:uppercase;color:#937453}
      .cafasso-animator-sheet__body{position:absolute;left:13px;right:13px;top:54px;bottom:19px;display:grid;grid-template-columns:57px minmax(0,1fr);gap:10px;align-content:start}
      .cafasso-animator-sheet__portrait{width:57px;height:69px;display:grid;place-items:center;overflow:hidden;border:3px solid #eee1c7;background:linear-gradient(145deg,#d2b98c,#987853);box-shadow:0 0 0 1px rgba(85,58,32,.42),0 4px 8px rgba(65,42,23,.17);color:#4a3828;font:700 20px Georgia,serif}
      .cafasso-animator-sheet__portrait img{display:block;width:100%;height:100%;object-fit:cover;filter:saturate(.9) contrast(1.03)}
      .cafasso-animator-sheet__copy{min-width:0;padding-top:2px;text-align:left}
      .cafasso-animator-sheet__name{display:-webkit-box;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:2;margin:0 0 5px;color:#483527;font:700 12px/1.08 Georgia,serif}
      .cafasso-animator-sheet__role{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#85694c;font:800 7px/1.2 Inter,system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase}
      .cafasso-animator-sheet__stamp{position:absolute;left:15px;bottom:16px;padding:3px 6px 2px;border:1px solid rgba(126,66,46,.5);border-radius:2px;color:rgba(126,66,46,.72);font:800 7px/1 Inter,system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;transform:rotate(-3deg)}
      .cafasso-animator-sheet__label{position:absolute;right:15px;bottom:17px;color:#876e54;font:700 8px/1 Georgia,serif;font-style:italic}

      .cafasso-profile-panel{position:fixed;inset:0;z-index:40;display:flex;align-items:center;justify-content:center;padding:clamp(10px,2.2vh,24px);overflow:hidden;background:radial-gradient(circle at 50% 38%,rgba(57,42,26,.12),rgba(6,19,20,.73) 68%);backdrop-filter:blur(7px) saturate(.82)}
      .cafasso-profile-card{position:relative;width:min(790px,93vw);max-width:calc(100vw - 20px);max-height:calc(100dvh - 20px);min-height:0;overflow:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:34px 42px 32px;border:1px solid rgba(92,64,35,.46);border-radius:4px;background:repeating-linear-gradient(0deg,rgba(103,73,41,.028) 0 1px,transparent 1px 9px),linear-gradient(142deg,#f9efd8 0%,#efdfbf 66%,#e5cc9e 100%);box-shadow:0 34px 88px rgba(0,0,0,.55),0 8px 14px rgba(38,24,14,.2),inset 0 0 0 4px rgba(255,250,236,.32),inset 18px 0 30px rgba(91,60,31,.07);color:#3c3026;font-family:Georgia,serif;transform:rotate(-.35deg)}
      .cafasso-profile-card:before{content:"";position:absolute;left:0;top:0;bottom:0;width:11px;background:linear-gradient(180deg,#7b5737,#a87847 44%,#704c30);box-shadow:inset -2px 0 rgba(255,227,180,.14),4px 0 10px rgba(73,48,28,.09)}
      .cafasso-profile-card:after{content:"CAFASSO · FICHA PERSONAL";position:absolute;right:32px;top:26px;color:rgba(111,77,42,.35);font:800 8px/1 Inter,system-ui,sans-serif;letter-spacing:.18em}
      .cafasso-profile-close{position:absolute;right:16px;top:14px;z-index:3;width:37px;height:37px;border:1px solid rgba(87,60,33,.18);border-radius:50%;background:rgba(247,236,213,.78);color:#503d2d;font:28px/1 Georgia,serif;cursor:pointer;box-shadow:0 3px 7px rgba(70,45,26,.1)}
      .cafasso-profile-kicker{margin:0 0 5px 8px;color:#8a6748;font:800 10px/1.2 Inter,system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase}
      .cafasso-profile-title{margin:0 0 23px 8px;color:#443326;font:500 38px/1 Georgia,serif}
      .cafasso-profile-head{display:grid;grid-template-columns:126px minmax(0,1fr);gap:27px;align-items:start;margin:0 7px 24px}
      .cafasso-profile-avatar{position:relative;width:126px;height:151px;padding:8px;border:1px solid rgba(85,57,31,.48);background:#e6d2ab;box-shadow:0 9px 17px rgba(67,43,24,.18);transform:rotate(-1.6deg)}
      .cafasso-profile-avatar:after{content:"";position:absolute;inset:8px;pointer-events:none;background:linear-gradient(125deg,rgba(255,255,255,.18),transparent 24% 68%,rgba(255,255,255,.04))}
      .cafasso-profile-avatar__image{width:100%;height:100%;display:grid;place-items:center;overflow:hidden;background:linear-gradient(145deg,#ceb68c,#947651);color:#4d3827;font:700 34px Georgia,serif}
      .cafasso-profile-avatar__image img{width:100%;height:100%;display:block;object-fit:cover}
      .cafasso-profile-identity{padding-top:6px}
      .cafasso-profile-name{margin:0;color:#3e2f23;font:500 clamp(31px,4vw,47px)/1 Georgia,serif}
      .cafasso-profile-role{margin-top:8px;color:#806143;font:800 12px/1.4 Inter,system-ui,sans-serif;text-transform:uppercase;letter-spacing:.11em}
      .cafasso-profile-identity-line{margin-top:16px;padding-top:13px;border-top:1px solid rgba(110,77,42,.18);color:#6f5b47;font:14px/1.55 Georgia,serif;font-style:italic;max-width:470px}
      .cafasso-profile-details{display:grid;grid-template-columns:1fr 1fr;gap:0 26px;margin:0 7px 19px;padding:13px 0 4px;border-top:1px solid rgba(110,77,42,.18);border-bottom:1px solid rgba(110,77,42,.14)}
      .cafasso-profile-field{min-width:0;padding:9px 3px 12px;border-bottom:1px solid rgba(110,77,42,.09)}
      .cafasso-profile-field small{display:block;margin-bottom:5px;color:#927454;font:800 9px/1.1 Inter,system-ui,sans-serif;text-transform:uppercase;letter-spacing:.12em}
      .cafasso-profile-field strong{display:block;color:#49392c;font:600 14px/1.38 Inter,system-ui,sans-serif;overflow-wrap:anywhere}
      .cafasso-profile-path{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:0 7px 20px}
      .cafasso-profile-path__item{position:relative;padding:13px 15px 12px;border:1px dashed rgba(116,78,42,.31);background:rgba(255,250,237,.22)}
      .cafasso-profile-path__item small{display:block;margin-bottom:4px;color:#917150;font:800 9px/1.1 Inter,system-ui,sans-serif;text-transform:uppercase;letter-spacing:.12em}
      .cafasso-profile-path__item strong{display:block;color:#4b392b;font:600 15px/1.3 Georgia,serif}
      .cafasso-profile-path__item span{display:block;margin-top:3px;color:#8a735c;font:11px/1.3 Inter,system-ui,sans-serif}
      .cafasso-profile-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:0 7px;padding-top:2px}
      .cafasso-profile-action{border:1px solid #765434;border-radius:4px;padding:10px 15px;background:linear-gradient(#795536,#67472d);color:#fff8e8;font:800 11px Inter,system-ui,sans-serif;cursor:pointer;box-shadow:0 4px 8px rgba(77,51,29,.15),inset 0 1px rgba(255,255,255,.12)}
      .cafasso-profile-action--secondary{background:rgba(249,240,221,.5);color:#5d4936;border-color:rgba(112,79,45,.28);box-shadow:none}
      .cafasso-profile-note{flex:1;min-width:230px;color:#7a6856;font:11px/1.45 Inter,system-ui,sans-serif}
      .cafasso-profile-status{min-height:18px;margin:8px 7px 0;color:#6a5745;font:700 11px/1.4 Inter,system-ui,sans-serif}

      @media(max-width:680px){
        .cafasso-animator-sheet{left:7.5%;top:18.5%;width:112px;height:134px;transform:perspective(560px) rotateY(-3deg) rotateZ(-3.4deg)}
        .cafasso-animator-sheet__clip{width:43px;height:20px;top:-8px}
        .cafasso-animator-sheet__brand{left:9px;right:9px;top:13px;padding-bottom:5px}.cafasso-animator-sheet__brand strong{font-size:10px}.cafasso-animator-sheet__brand span{font-size:5px}
        .cafasso-animator-sheet__body{left:9px;right:9px;top:41px;bottom:15px;grid-template-columns:42px 1fr;gap:7px}.cafasso-animator-sheet__portrait{width:42px;height:51px;border-width:2px;font-size:16px}.cafasso-animator-sheet__name{font-size:9px}.cafasso-animator-sheet__role{font-size:5.5px}.cafasso-animator-sheet__stamp{left:10px;bottom:10px;font-size:5px}.cafasso-animator-sheet__label{right:10px;bottom:11px;font-size:6px}
        .cafasso-profile-panel{padding:10px;align-items:flex-end}
        .cafasso-profile-card{width:100%;max-height:91vh;overflow:auto;min-height:0;padding:31px 21px 24px;border-radius:13px 13px 0 0;transform:none}.cafasso-profile-card:before{width:7px}.cafasso-profile-card:after{display:none}
        .cafasso-profile-title{font-size:31px}.cafasso-profile-head{grid-template-columns:88px 1fr;gap:17px;margin-bottom:18px}.cafasso-profile-avatar{width:88px;height:106px;padding:6px}.cafasso-profile-avatar__image{font-size:24px}.cafasso-profile-name{font-size:29px}.cafasso-profile-role{font-size:10px}.cafasso-profile-identity-line{font-size:12px;margin-top:11px;padding-top:10px}
        .cafasso-profile-details,.cafasso-profile-path{grid-template-columns:1fr}.cafasso-profile-actions{display:grid;grid-template-columns:1fr}.cafasso-profile-action{width:100%}.cafasso-profile-note{min-width:0}
      }
      @media(max-height:720px) and (min-width:681px){
        .cafasso-profile-panel{padding:10px}
        .cafasso-profile-card{max-height:calc(100dvh - 20px);padding:22px 30px 20px;transform:none}
        .cafasso-profile-title{margin-bottom:14px;font-size:32px}
        .cafasso-profile-head{grid-template-columns:96px minmax(0,1fr);gap:20px;margin-bottom:14px}
        .cafasso-profile-avatar{width:96px;height:115px;padding:6px}
        .cafasso-profile-name{font-size:clamp(27px,3.2vw,38px)}
        .cafasso-profile-identity-line{margin-top:10px;padding-top:9px;line-height:1.4}
        .cafasso-profile-details{margin-bottom:12px;padding-top:8px}
        .cafasso-profile-field{padding:6px 3px 8px}
        .cafasso-profile-path{gap:10px;margin-bottom:12px}
        .cafasso-profile-path__item{padding:9px 12px}
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
    const house = document.querySelector('.cafasso-house');
    if (!house || house.querySelector('[data-house-profile]')) return;
    ensureStyles();

    const user = readUser();
    const name = String(user.name || user.nombre || user.email || 'Mi perfil').trim();
    const role = String(user.role || 'Animador').trim();
    const email = String(user.email || '').trim();
    const group = getGroupLabel(user);

    const sheet = document.createElement('button');
    sheet.type = 'button';
    sheet.className = 'cafasso-animator-sheet';
    sheet.dataset.houseProfile = 'open';
    sheet.setAttribute('aria-label', `Abrir mi ficha CAFASSO: ${name}`);
    sheet.innerHTML = `
      <span class="cafasso-animator-sheet__clip" aria-hidden="true"></span>
      <span class="cafasso-animator-sheet__paper">
        <span class="cafasso-animator-sheet__brand"><strong>CAFASSO</strong><span>Mi ficha</span></span>
        <span class="cafasso-animator-sheet__body">
          ${portraitMarkup(user, 'cafasso-animator-sheet__portrait')}
          <span class="cafasso-animator-sheet__copy">
            <span class="cafasso-animator-sheet__name">${esc(name)}</span>
            <span class="cafasso-animator-sheet__role">${esc(role)}</span>
          </span>
        </span>
        <span class="cafasso-animator-sheet__stamp">Animador</span>
        <span class="cafasso-animator-sheet__label">abrir ficha</span>
      </span>`;

    const panel = document.createElement('section');
    panel.className = 'cafasso-profile-panel';
    panel.dataset.houseProfilePanel = '1';
    panel.hidden = true;
    panel.setAttribute('aria-label', 'Mi ficha CAFASSO');
    panel.innerHTML = `
      <article class="cafasso-profile-card" role="dialog" aria-modal="true" aria-labelledby="cafasso-house-profile-title">
        <button class="cafasso-profile-close" data-house-profile-close type="button" aria-label="Cerrar mi ficha">×</button>
        <div class="cafasso-profile-kicker">Identidad · camino · pertenencia</div>
        <h2 class="cafasso-profile-title" id="cafasso-house-profile-title">Mi ficha</h2>
        <div class="cafasso-profile-head">
          <div class="cafasso-profile-avatar" data-house-profile-avatar>${portraitMarkup(user, 'cafasso-profile-avatar__image')}</div>
          <div class="cafasso-profile-identity">
            <h3 class="cafasso-profile-name">${esc(name)}</h3>
            <div class="cafasso-profile-role">${esc(role)}</div>
            <div class="cafasso-profile-identity-line">Mi lugar dentro de CAFASSO: crecer, servir y acompañar a otros en el camino.</div>
          </div>
        </div>
        <div class="cafasso-profile-details">
          ${email ? `<div class="cafasso-profile-field"><small>Correo</small><strong>${esc(email)}</strong></div>` : ''}
          ${group ? `<div class="cafasso-profile-field"><small>Grupo / comunidad</small><strong>${esc(group)}</strong></div>` : ''}
          <div class="cafasso-profile-field"><small>Rol</small><strong>${esc(role)}</strong></div>
          <div class="cafasso-profile-field"><small>Identidad CAFASSO</small><strong>Animador en camino</strong></div>
        </div>
        <div class="cafasso-profile-path" aria-label="Camino CAFASSO">
          <div class="cafasso-profile-path__item"><small>Almitas</small><strong>Tu recorrido</strong><span>Se integrará acá sin cambiar esta ficha.</span></div>
          <div class="cafasso-profile-path__item"><small>RUAH</small><strong>Tu constancia</strong><span>La racha vivirá en este mismo espacio.</span></div>
        </div>
        <div class="cafasso-profile-actions">
          <button class="cafasso-profile-action" data-house-profile-photo type="button">Cambiar mi foto</button>
          ${user.avatarData ? '<button class="cafasso-profile-action cafasso-profile-action--secondary" data-house-profile-photo-remove type="button">Quitar foto</button>' : ''}
          <input data-house-profile-file type="file" accept="image/jpeg,image/png,image/webp" hidden>
          <span class="cafasso-profile-note">Esta ficha es personal: toma los datos de la sesión del animador que entra a su Casa.</span>
        </div>
        <div class="cafasso-profile-status" data-house-profile-status></div>
      </article>`;

    house.appendChild(sheet);
    house.appendChild(panel);

    const fileInput = panel.querySelector('[data-house-profile-file]');
    const choose = panel.querySelector('[data-house-profile-photo]');
    const status = panel.querySelector('[data-house-profile-status]');
    const close = () => { panel.hidden = true; sheet.focus(); };

    function refreshPhoto() {
      const fresh = readUser();
      const smallPortrait = sheet.querySelector('.cafasso-animator-sheet__portrait');
      const avatar = panel.querySelector('[data-house-profile-avatar]');
      if (smallPortrait) smallPortrait.outerHTML = portraitMarkup(fresh, 'cafasso-animator-sheet__portrait');
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

    sheet.addEventListener('click', () => { panel.hidden = false; panel.querySelector('[data-house-profile-close]')?.focus(); });
    panel.querySelector('[data-house-profile-close]')?.addEventListener('click', close);
    panel.addEventListener('click', event => { if (event.target === panel) close(); });
    choose?.addEventListener('click', () => fileInput?.click());
    const initialRemove = panel.querySelector('[data-house-profile-photo-remove]');
    if (initialRemove) bindRemove(initialRemove);

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

  let attempts = 0;
  const mount = () => {
    const house = document.querySelector('.cafasso-house');
    if (house) return render();
    if (attempts < 20) { attempts += 1; setTimeout(mount, 80); }
  };
  mount();
})();
