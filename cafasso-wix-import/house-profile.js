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
      .cafasso-profile-frame{position:absolute;left:23.2%;top:20.5%;z-index:6;width:104px;height:126px;padding:11px 10px 18px;border:0;background:linear-gradient(135deg,#6e4a2f 0 8%,#bd8b54 8% 16%,#6b472d 16% 84%,#c79b67 84% 92%,#6a452c 92%);clip-path:polygon(7% 0,93% 0,100% 7%,100% 93%,93% 100%,7% 100%,0 93%,0 7%);box-shadow:0 12px 20px rgba(0,0,0,.34),inset 0 0 0 2px rgba(255,222,164,.28);cursor:pointer;transform:rotate(-1.4deg);transition:transform .18s ease,filter .18s ease,box-shadow .18s ease}
      .cafasso-profile-frame:hover{transform:rotate(-.4deg) translateY(-4px) scale(1.025);filter:brightness(1.08);box-shadow:0 16px 26px rgba(0,0,0,.42),0 0 16px rgba(248,205,112,.18),inset 0 0 0 2px rgba(255,222,164,.34)}
      .cafasso-profile-frame:focus-visible{outline:3px solid #f2c95a;outline-offset:5px}
      .cafasso-profile-frame__photo{width:100%;height:100%;display:grid;place-items:center;overflow:hidden;background:linear-gradient(145deg,#d8c6a4,#a78b67);border:3px solid #ead9ba;box-shadow:inset 0 0 0 1px rgba(66,42,26,.4);color:#4d3827;font:700 27px Georgia,serif;letter-spacing:.03em}
      .cafasso-profile-frame__photo img{display:block;width:100%;height:100%;object-fit:cover}
      .cafasso-profile-frame:after{content:"";position:absolute;left:16%;right:16%;bottom:9px;height:3px;border-radius:99px;background:rgba(228,190,129,.72);box-shadow:0 1px 0 rgba(55,31,18,.45)}
      .cafasso-profile-panel{position:fixed;inset:0;z-index:40;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(7,23,25,.68);backdrop-filter:blur(6px)}
      .cafasso-profile-card{position:relative;width:min(720px,92vw);min-height:430px;padding:38px 42px 34px;border:1px solid rgba(114,83,50,.36);border-radius:9px 24px 24px 9px;background:linear-gradient(90deg,rgba(117,86,48,.08),transparent 7%),linear-gradient(135deg,#f5ead2,#ead8b7);box-shadow:0 30px 80px rgba(0,0,0,.5),inset 16px 0 24px rgba(98,67,35,.1);color:#3c3026;font-family:Georgia,serif}
      .cafasso-profile-card:before{content:"";position:absolute;left:32px;top:26px;bottom:26px;width:1px;background:rgba(116,81,45,.14)}
      .cafasso-profile-close{position:absolute;right:18px;top:16px;width:38px;height:38px;border:0;border-radius:50%;background:rgba(73,54,36,.1);color:#503d2d;font:28px/1 Georgia,serif;cursor:pointer}
      .cafasso-profile-kicker{margin-left:7px;color:#8a6748;font:700 11px/1.2 Inter,system-ui,sans-serif;letter-spacing:.15em;text-transform:uppercase}
      .cafasso-profile-head{display:grid;grid-template-columns:132px minmax(0,1fr);gap:28px;align-items:center;margin:18px 0 24px}
      .cafasso-profile-avatar{width:132px;height:156px;padding:9px;background:linear-gradient(135deg,#714d31,#c49a69 20%,#68442b 82%,#b4834e);box-shadow:0 10px 22px rgba(70,43,24,.24),inset 0 0 0 2px rgba(255,229,182,.24);transform:rotate(-1deg)}
      .cafasso-profile-avatar__image{width:100%;height:100%;display:grid;place-items:center;overflow:hidden;background:#d9c7a5;border:3px solid #ead9ba;color:#4d3827;font:700 34px Georgia,serif}
      .cafasso-profile-avatar__image img{width:100%;height:100%;display:block;object-fit:cover}
      .cafasso-profile-name{margin:0;color:#3d3025;font:500 clamp(32px,4vw,48px)/1.02 Georgia,serif}
      .cafasso-profile-role{margin-top:7px;color:#7b6148;font:700 13px/1.4 Inter,system-ui,sans-serif;text-transform:uppercase;letter-spacing:.09em}
      .cafasso-profile-meta{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:6px 0 20px}
      .cafasso-profile-meta__item{padding:13px 15px;border:1px solid rgba(118,86,50,.18);border-radius:13px;background:rgba(255,253,246,.45)}
      .cafasso-profile-meta__item small{display:block;margin-bottom:4px;color:#8a735d;font:700 10px/1.2 Inter,system-ui,sans-serif;text-transform:uppercase;letter-spacing:.1em}
      .cafasso-profile-meta__item strong{display:block;color:#49392c;font:600 15px/1.35 Inter,system-ui,sans-serif;overflow-wrap:anywhere}
      .cafasso-profile-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:18px;padding-top:16px;border-top:1px solid rgba(108,76,45,.18)}
      .cafasso-profile-action{border:1px solid #84613d;border-radius:999px;padding:10px 16px;background:#725033;color:#fff8e8;font:700 12px Inter,system-ui,sans-serif;cursor:pointer;box-shadow:0 4px 10px rgba(77,51,29,.14)}
      .cafasso-profile-action--secondary{background:rgba(255,253,246,.46);color:#5d4936;border-color:rgba(112,79,45,.28)}
      .cafasso-profile-note{flex:1;min-width:220px;color:#7a6856;font:12px/1.45 Inter,system-ui,sans-serif}
      .cafasso-profile-status{min-height:18px;margin-top:9px;color:#6a5745;font:700 12px/1.4 Inter,system-ui,sans-serif}
      @media(max-width:680px){
        .cafasso-profile-frame{left:8%;top:18%;width:78px;height:96px;padding:8px 8px 14px}
        .cafasso-profile-frame__photo{font-size:21px}
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
