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
    const candidates = [
      user.groupName,
      user.group,
      user.grupo,
      user.teamName,
      user.community,
      user.comunidad
    ];
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
      .cafasso-profile-frame{position:absolute;left:23.2%;top:20.5%;z-index:6;width:112px;height:140px;padding:13px 12px 22px;border:1px solid #3f2819;border-radius:6px;background:repeating-linear-gradient(8deg,rgba(255,255,255,.025) 0 1px,rgba(41,22,12,.055) 1px 3px,transparent 3px 8px),linear-gradient(108deg,#3b2416 0%,#8d5d34 11%,#4d2e1b 26%,#9f6d3f 48%,#5b3821 66%,#b17b49 84%,#432819 100%);box-shadow:0 18px 24px rgba(0,0,0,.42),0 4px 5px rgba(0,0,0,.24),inset 0 0 0 2px rgba(233,187,119,.22),inset 0 0 0 6px rgba(37,20,11,.22),inset 7px 0 10px rgba(255,219,159,.08),inset -8px 0 12px rgba(24,13,8,.24);cursor:pointer;overflow:visible;isolation:isolate;transform-origin:50% 100%;transform:perspective(620px) rotateY(-5deg) rotateZ(-1.5deg);filter:drop-shadow(0 2px 1px rgba(20,10,5,.3));transition:transform .22s ease,filter .22s ease,box-shadow .22s ease}
      .cafasso-profile-frame:before{content:"";position:absolute;z-index:-1;left:29%;right:17%;bottom:-16px;height:25px;border-radius:2px 3px 11px 10px;background:linear-gradient(90deg,#2d1a10,#5b3823 24%,#805231 52%,#4a2d1b 79%,#26170e);box-shadow:0 8px 11px rgba(0,0,0,.38);transform-origin:50% 0;transform:perspective(110px) rotateX(60deg) skewX(-4deg)}
      .cafasso-profile-frame:after{content:"";position:absolute;z-index:3;left:24%;right:24%;bottom:8px;height:4px;border-radius:99px;background:linear-gradient(90deg,#765024,#d5b26d 36%,#f0d28d 52%,#a97935 78%,#5d3e1c);box-shadow:0 1px 0 rgba(45,26,14,.7),0 -1px 0 rgba(255,236,185,.18)}
      .cafasso-profile-frame:hover{transform:perspective(620px) rotateY(-2deg) rotateZ(-.6deg) translateY(-4px) scale(1.025);filter:brightness(1.04) drop-shadow(0 5px 3px rgba(17,9,5,.34));box-shadow:0 22px 30px rgba(0,0,0,.46),0 7px 8px rgba(0,0,0,.2),0 0 17px rgba(241,196,112,.12),inset 0 0 0 2px rgba(240,198,132,.27),inset 0 0 0 6px rgba(37,20,11,.22),inset 7px 0 10px rgba(255,219,159,.1),inset -8px 0 12px rgba(24,13,8,.22)}
      .cafasso-profile-frame:focus-visible{outline:3px solid #f2c95a;outline-offset:6px}
      .cafasso-profile-frame__photo{position:relative;z-index:2;width:100%;height:100%;display:grid;place-items:center;overflow:hidden;background:linear-gradient(145deg,#d8c6a4,#9f8461);border:5px solid #d8c39f;outline:1px solid rgba(45,27,17,.62);box-shadow:inset 0 0 0 1px rgba(255,247,223,.45),inset 0 0 13px rgba(50,31,20,.24),0 0 0 2px rgba(56,33,19,.22);color:#4d3827;font:700 28px Georgia,serif;letter-spacing:.03em}
      .cafasso-profile-frame__photo:after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(124deg,rgba(255,255,255,.26) 0 9%,rgba(255,255,255,.07) 16%,transparent 25% 57%,rgba(255,246,222,.07) 65%,transparent 74%);mix-blend-mode:screen;opacity:.75}
      .cafasso-profile-frame__photo img{display:block;width:100%;height:100%;object-fit:cover;filter:saturate(.92) contrast(1.02)}

      .cafasso-profile-panel{position:fixed;inset:0;z-index:40;display:flex;align-items:center;justify-content:center;padding:24px;background:radial-gradient(circle at 50% 38%,rgba(48,35,22,.16),rgba(6,19,20,.72) 66%);backdrop-filter:blur(7px) saturate(.85)}
      .cafasso-profile-card{position:relative;width:min(720px,92vw);min-height:430px;padding:40px 44px 36px;border:1px solid rgba(96,66,36,.44);border-radius:10px 28px 24px 10px;background:repeating-linear-gradient(180deg,rgba(116,82,46,.035) 0 1px,transparent 1px 28px),linear-gradient(96deg,rgba(107,71,36,.12),transparent 9%),linear-gradient(136deg,#f8efd9 0%,#f0e0be 54%,#e5cfaa 100%);box-shadow:0 32px 82px rgba(0,0,0,.54),0 6px 12px rgba(35,21,12,.22),inset 18px 0 30px rgba(86,56,29,.12),inset -8px -8px 18px rgba(125,88,47,.06);color:#3c3026;font-family:Georgia,serif}
      .cafasso-profile-card:before{content:"";position:absolute;left:30px;top:24px;bottom:24px;width:2px;background:linear-gradient(180deg,transparent,rgba(111,76,39,.23) 12%,rgba(111,76,39,.23) 88%,transparent);box-shadow:1px 0 rgba(255,255,255,.34)}
      .cafasso-profile-card:after{content:"";position:absolute;right:35px;top:24px;width:118px;height:18px;border-radius:2px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent);transform:rotate(-3deg);opacity:.55;pointer-events:none}
      .cafasso-profile-close{position:absolute;right:18px;top:16px;width:38px;height:38px;border:1px solid rgba(89,63,38,.17);border-radius:50%;background:rgba(245,233,208,.64);color:#503d2d;font:28px/1 Georgia,serif;cursor:pointer;box-shadow:0 3px 8px rgba(70,45,26,.1)}
      .cafasso-profile-kicker{margin-left:7px;color:#8a6748;font:700 11px/1.2 Inter,system-ui,sans-serif;letter-spacing:.15em;text-transform:uppercase}
      .cafasso-profile-head{display:grid;grid-template-columns:132px minmax(0,1fr);gap:28px;align-items:center;margin:18px 0 24px}
      .cafasso-profile-avatar{width:132px;height:156px;padding:10px;border:1px solid #3f2819;border-radius:5px;background:repeating-linear-gradient(9deg,rgba(255,255,255,.025) 0 1px,transparent 1px 7px),linear-gradient(115deg,#482a18,#a26b3b 17%,#57351f 47%,#a77748 77%,#3b2416);box-shadow:0 13px 24px rgba(70,43,24,.28),inset 0 0 0 2px rgba(255,229,182,.19),inset 0 0 0 6px rgba(48,28,16,.14);transform:rotate(-1.2deg)}
      .cafasso-profile-avatar__image{position:relative;width:100%;height:100%;display:grid;place-items:center;overflow:hidden;background:#d9c7a5;border:4px solid #dfcaab;box-shadow:inset 0 0 12px rgba(57,36,23,.2);color:#4d3827;font:700 34px Georgia,serif}
      .cafasso-profile-avatar__image:after{content:"";position:absolute;inset:0;background:linear-gradient(128deg,rgba(255,255,255,.22),transparent 24% 64%,rgba(255,255,255,.05) 72%,transparent 80%);pointer-events:none}
      .cafasso-profile-avatar__image img{width:100%;height:100%;display:block;object-fit:cover}
      .cafasso-profile-name{margin:0;color:#3d3025;font:500 clamp(32px,4vw,48px)/1.02 Georgia,serif;text-shadow:0 1px rgba(255,255,255,.4)}
      .cafasso-profile-role{margin-top:7px;color:#7b6148;font:700 13px/1.4 Inter,system-ui,sans-serif;text-transform:uppercase;letter-spacing:.09em}
      .cafasso-profile-meta{display:grid;grid-template-columns:1fr 1fr;gap:10px 22px;margin:7px 0 20px;padding:17px 0 8px;border-top:1px solid rgba(112,79,43,.16);border-bottom:1px solid rgba(112,79,43,.14)}
      .cafasso-profile-meta__item{padding:6px 2px 11px;border:0;border-bottom:1px solid rgba(115,82,48,.12);border-radius:0;background:transparent}
      .cafasso-profile-meta__item small{display:block;margin-bottom:5px;color:#8a735d;font:700 10px/1.2 Inter,system-ui,sans-serif;text-transform:uppercase;letter-spacing:.1em}
      .cafasso-profile-meta__item strong{display:block;color:#49392c;font:600 15px/1.35 Inter,system-ui,sans-serif;overflow-wrap:anywhere}
      .cafasso-profile-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:18px;padding-top:4px}
      .cafasso-profile-action{border:1px solid #765434;border-radius:6px;padding:10px 16px;background:linear-gradient(#7c5837,#69472d);color:#fff8e8;font:700 12px Inter,system-ui,sans-serif;cursor:pointer;box-shadow:0 4px 9px rgba(77,51,29,.16),inset 0 1px rgba(255,255,255,.12)}
      .cafasso-profile-action--secondary{background:rgba(249,240,221,.55);color:#5d4936;border-color:rgba(112,79,45,.28);box-shadow:none}
      .cafasso-profile-note{flex:1;min-width:220px;color:#7a6856;font:12px/1.45 Inter,system-ui,sans-serif}
      .cafasso-profile-status{min-height:18px;margin-top:9px;color:#6a5745;font:700 12px/1.4 Inter,system-ui,sans-serif}
      @media(max-width:680px){
        .cafasso-profile-frame{left:8%;top:18%;width:84px;height:108px;padding:9px 9px 17px;transform:perspective(500px) rotateY(-4deg) rotateZ(-1.2deg)}
        .cafasso-profile-frame:before{bottom:-12px;height:20px}
        .cafasso-profile-frame__photo{border-width:4px;font-size:21px}
        .cafasso-profile-panel{padding:12px;align-items:flex-end}
        .cafasso-profile-card{width:100%;max-height:90vh;overflow:auto;min-height:0;padding:31px 22px 24px;border-radius:22px 22px 0 0}
        .cafasso-profile-card:before{display:none}
        .cafasso-profile-head{grid-template-columns:92px 1fr;gap:18px;margin-top:20px}
        .cafasso-profile-avatar{width:92px;height:112px;padding:7px}
        .cafasso-profile-avatar__image{font-size:26px}
        .cafasso-profile-name{font-size:31px}
        .cafasso-profile-role{font-size:11px}
        .cafasso-profile-meta{grid-template-columns:1fr}
        .cafasso-profile-actions{display:grid;grid-template-columns:1fr}.cafasso-profile-action{width:100%}.cafasso-profile-note{min-width:0}
      }
      @media(prefers-reduced-motion:reduce){.cafasso-profile-frame{transition:none}}
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
          ctx.drawImage(image, sx, sy,side,side,0,0,size,size);
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

    const frame = document.createElement('button');
    frame.type = 'button';
    frame.className = 'cafasso-profile-frame';
    frame.dataset.houseProfile = 'open';
    frame.setAttribute('aria-label', `Abrir perfil de ${name}`);
    frame.innerHTML = portraitMarkup(user, 'cafasso-profile-frame__photo');

    const panel = document.createElement('section');
    panel.className = 'cafasso-profile-panel';
    panel.dataset.houseProfilePanel = '1';
    panel.hidden = true;
    panel.setAttribute('aria-label', 'Mi perfil CAFASSO');
    panel.innerHTML = `
      <article class="cafasso-profile-card" role="dialog" aria-modal="true" aria-labelledby="cafasso-house-profile-title">
        <button class="cafasso-profile-close" data-house-profile-close type="button" aria-label="Cerrar perfil">×</button>
        <div class="cafasso-profile-kicker">Mi lugar en CAFASSO</div>
        <div class="cafasso-profile-head">
          <div class="cafasso-profile-avatar" data-house-profile-avatar>${portraitMarkup(user, 'cafasso-profile-avatar__image')}</div>
          <div>
            <h2 class="cafasso-profile-name" id="cafasso-house-profile-title">${esc(name)}</h2>
            <div class="cafasso-profile-role">${esc(role)}</div>
          </div>
        </div>
        <div class="cafasso-profile-meta">
          ${email ? `<div class="cafasso-profile-meta__item"><small>Correo</small><strong>${esc(email)}</strong></div>` : ''}
          ${group ? `<div class="cafasso-profile-meta__item"><small>Grupo / comunidad</small><strong>${esc(group)}</strong></div>` : ''}
          <div class="cafasso-profile-meta__item"><small>Almitas</small><strong>Se conecta en el próximo paso</strong></div>
          <div class="cafasso-profile-meta__item"><small>RUAH</small><strong>Se conecta en el próximo paso</strong></div>
        </div>
        <div class="cafasso-profile-actions">
          <button class="cafasso-profile-action" data-house-profile-photo type="button">Cambiar mi foto</button>
          ${user.avatarData ? '<button class="cafasso-profile-action cafasso-profile-action--secondary" data-house-profile-photo-remove type="button">Quitar foto</button>' : ''}
          <input data-house-profile-file type="file" accept="image/jpeg,image/png,image/webp" hidden>
          <span class="cafasso-profile-note">Tu foto identifica tu Casa. Almitas, RUAH y progreso van a vivir en esta misma ficha.</span>
        </div>
        <div class="cafasso-profile-status" data-house-profile-status></div>
      </article>`;

    house.appendChild(frame);
    house.appendChild(panel);

    const fileInput = panel.querySelector('[data-house-profile-file]');
    const choose = panel.querySelector('[data-house-profile-photo]');
    const remove = panel.querySelector('[data-house-profile-photo-remove]');
    const status = panel.querySelector('[data-house-profile-status]');

    const close = () => { panel.hidden = true; frame.focus(); };
    const refreshPhoto = () => {
      const fresh = readUser();
      frame.innerHTML = portraitMarkup(fresh, 'cafasso-profile-frame__photo');
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
    };

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
        button.disabled = false;
      }
    }

    function bindRemove(button) {
      button.addEventListener('click', () => removePhoto(button));
    }

    frame.addEventListener('click', () => { panel.hidden = false; panel.querySelector('[data-house-profile-close]')?.focus(); });
    panel.querySelector('[data-house-profile-close]')?.addEventListener('click', close);
    panel.addEventListener('click', event => { if (event.target === panel) close(); });
    choose?.addEventListener('click', () => fileInput?.click());
    if (remove) bindRemove(remove);

    fileInput?.addEventListener('change', async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      choose.disabled = true;
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
        if (remove) remove.disabled = false;
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
