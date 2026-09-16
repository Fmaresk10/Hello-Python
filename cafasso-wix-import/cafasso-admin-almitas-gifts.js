(() => {
  const page = (location.pathname.split('/').pop() || '').toLowerCase();
  if (page !== 'admin.html') return;
  if (window.__cafassoAdminAlmitasGiftsInstalled) return;
  window.__cafassoAdminAlmitasGiftsInstalled = true;

  const ADMIN_API = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoAdmin';
  const PROGRESS_API = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoProgress';
  const COURSE_ID = '__cafasso_admin_gifts__';
  const MODULE_ID = '__gifts__';
  const STYLE_ID = 'cafassoAdminAlmitasGiftStyles';
  const ROOT_ID = 'cafassoAdminAlmitasGiftModal';
  let data = null;
  let loading = false;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
  }[char]));

  function json(storage, key) {
    try { return JSON.parse(storage.getItem(key) || 'null'); }
    catch (error) { return null; }
  }

  function currentUser() {
    return json(localStorage, 'cafassoSession')?.user || {};
  }

  function isAdmin() {
    return String(currentUser()?.role || '').toLowerCase().includes('admin');
  }

  function normalizeState(raw) {
    const source = raw && typeof raw === 'object' ? raw : {};
    const gifts = (Array.isArray(source.gifts) ? source.gifts : [])
      .map(item => ({
        id: String(item?.id || ''),
        amount: Math.max(0, Math.round(Number(item?.amount || 0))),
        reason: String(item?.reason || ''),
        at: String(item?.at || ''),
        byId: String(item?.byId || ''),
        byName: String(item?.byName || 'Administrador')
      }))
      .filter(item => item.id && item.amount > 0 && item.at)
      .slice(0, 250);
    const derived = gifts.reduce((sum, item) => sum + item.amount, 0);
    return {
      version: 1,
      gifts,
      bonusAlmitas: Math.max(derived, Math.max(0, Number(source.bonusAlmitas || 0))),
      updatedAt: String(source.updatedAt || '')
    };
  }

  function giftRow(userId, source = data) {
    return (Array.isArray(source?.progress) ? source.progress : []).find(row =>
      String(row?.userId || '') === String(userId || '') && String(row?.courseId || '') === COURSE_ID
    ) || null;
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-gift-almitas-trigger{position:relative}
      .cafasso-gift-modal{position:fixed;inset:0;z-index:2147483500;display:grid;place-items:center;padding:20px;background:rgba(9,25,43,.54);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px)}
      .cafasso-gift-modal[hidden]{display:none!important}
      .cafasso-gift-sheet{width:min(590px,95vw);max-height:90vh;overflow:auto;padding:25px;border:1px solid #E8DCCB;border-radius:24px;background:#FFFDF9;box-shadow:0 30px 90px rgba(10,25,45,.28);color:#11233A;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif}
      .cafasso-gift-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.cafasso-gift-head small{display:block;color:#B77D00;font-size:10px;font-weight:900;letter-spacing:.14em;text-transform:uppercase}.cafasso-gift-head h2{margin:6px 0 5px;color:#0F2D4D;font:32px/1 Georgia,serif}.cafasso-gift-head p{margin:0;color:#687386;font-size:12px;line-height:1.45}.cafasso-gift-close{width:38px;height:38px;border:0;border-radius:50%;background:#F3EEE6;color:#0F2D4D;font-size:23px;cursor:pointer;flex:0 0 auto}
      .cafasso-gift-field{margin-top:17px}.cafasso-gift-field label{display:block;margin-bottom:6px;color:#0F2D4D;font-size:11px;font-weight:900}.cafasso-gift-field input,.cafasso-gift-field select,.cafasso-gift-field textarea{width:100%;padding:12px 13px;border:1px solid #E8DCCB;border-radius:12px;background:#fff;color:#11233A;font:inherit}.cafasso-gift-field textarea{min-height:90px;resize:vertical}.cafasso-gift-field input:focus,.cafasso-gift-field select:focus,.cafasso-gift-field textarea:focus{outline:3px solid rgba(242,201,76,.22);border-color:#D8B94B}.cafasso-gift-two{display:grid;grid-template-columns:1.25fr .75fr;gap:12px}.cafasso-gift-current{margin-top:12px;padding:11px 13px;border:1px solid #E8DCCB;border-radius:13px;background:#FBF7F0;color:#687386;font-size:11px;line-height:1.4}.cafasso-gift-current b{color:#0F2D4D}.cafasso-gift-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:20px}.cafasso-gift-btn{border:0;border-radius:12px;padding:11px 14px;background:#F2C94C;color:#0F2D4D;font-weight:900;cursor:pointer}.cafasso-gift-btn.alt{background:#fff;border:1px solid #E8DCCB}.cafasso-gift-btn:disabled{opacity:.55;cursor:not-allowed}.cafasso-gift-note{margin-top:13px;color:#856200;font-size:10px;line-height:1.45}.cafasso-gift-success{margin-top:14px;padding:11px 13px;border:1px solid #BFD9C9;border-radius:13px;background:#EDF5F1;color:#2E6A50;font-size:12px;font-weight:750}.cafasso-gift-error{margin-top:14px;padding:11px 13px;border:1px solid #EBC7C7;border-radius:13px;background:#FFF3F3;color:#A64747;font-size:12px;font-weight:750}
      @media(max-width:700px){.cafasso-gift-modal{align-items:end;padding:10px}.cafasso-gift-sheet{border-radius:24px 24px 16px 16px;padding:20px}.cafasso-gift-two{grid-template-columns:1fr}.cafasso-gift-actions{display:grid;grid-template-columns:1fr}.cafasso-gift-btn{width:100%;min-height:46px}.cafasso-gift-head h2{font-size:28px}}
    `;
    document.head.appendChild(style);
  }

  async function loadAdminData() {
    const response = await fetch(ADMIN_API, { cache: 'no-store' });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result?.ok === false) throw new Error(result?.error || 'No se pudo cargar la administración.');
    data = result;
    return result;
  }

  function options(users) {
    return users
      .slice()
      .sort((a, b) => String(a?.name || '').localeCompare(String(b?.name || ''), 'es'))
      .map(user => `<option value="${esc(user._id)}">${esc(user.name || user.email || 'Usuario')} · ${esc(user.role || 'Animador')}</option>`)
      .join('');
  }

  function currentGiftText(userId) {
    const state = normalizeState(giftRow(userId)?.blockAnswers?.adminGiftState || null);
    if (!state.bonusAlmitas) return 'Todavía no recibió Almitas regaladas por administración.';
    return `Ya recibió <b>${state.bonusAlmitas} Almitas</b> por regalos administrativos en ${state.gifts.length} movimiento${state.gifts.length === 1 ? '' : 's'}.`;
  }

  function updateCurrent() {
    const select = document.getElementById('cafassoGiftUser');
    const box = document.getElementById('cafassoGiftCurrent');
    if (select && box) box.innerHTML = currentGiftText(select.value);
  }

  function closeModal() {
    const root = document.getElementById(ROOT_ID);
    if (root) root.hidden = true;
  }

  async function openModal() {
    if (!isAdmin()) return;
    ensureStyles();
    let root = document.getElementById(ROOT_ID);
    if (!root) {
      root = document.createElement('div');
      root.id = ROOT_ID;
      root.className = 'cafasso-gift-modal';
      root.hidden = true;
      document.body.appendChild(root);
      root.addEventListener('click', event => { if (event.target === root) closeModal(); });
      document.addEventListener('keydown', event => { if (event.key === 'Escape' && !root.hidden) closeModal(); });
    }

    root.hidden = false;
    root.innerHTML = `<section class="cafasso-gift-sheet" role="dialog" aria-modal="true" aria-labelledby="cafassoGiftTitle"><div class="cafasso-gift-head"><div><small>Administración · Almitas</small><h2 id="cafassoGiftTitle">Regalar Almitas</h2><p>Asigná una cantidad libre a cualquier persona de CAFASSO. El movimiento queda registrado con su motivo.</p></div><button class="cafasso-gift-close" type="button" aria-label="Cerrar">×</button></div><div class="cafasso-gift-current">Cargando personas…</div></section>`;
    root.querySelector('.cafasso-gift-close')?.addEventListener('click', closeModal);

    try {
      const fresh = await loadAdminData();
      const users = (fresh.users || []).filter(user => user?._id);
      if (!users.length) throw new Error('No hay personas disponibles para asignar Almitas.');
      root.innerHTML = `
        <section class="cafasso-gift-sheet" role="dialog" aria-modal="true" aria-labelledby="cafassoGiftTitle">
          <div class="cafasso-gift-head"><div><small>Administración · Almitas</small><h2 id="cafassoGiftTitle">Regalar Almitas</h2><p>Asigná una cantidad libre a cualquier persona de CAFASSO. El movimiento queda registrado con su motivo.</p></div><button class="cafasso-gift-close" type="button" aria-label="Cerrar">×</button></div>
          <div class="cafasso-gift-two">
            <div class="cafasso-gift-field"><label for="cafassoGiftUser">Persona</label><select id="cafassoGiftUser">${options(users)}</select></div>
            <div class="cafasso-gift-field"><label for="cafassoGiftAmount">Cantidad</label><input id="cafassoGiftAmount" type="number" inputmode="numeric" min="1" step="1" placeholder="50"></div>
          </div>
          <div class="cafasso-gift-current" id="cafassoGiftCurrent"></div>
          <div class="cafasso-gift-field"><label for="cafassoGiftReason">Motivo <span style="font-weight:600;color:#687386">(opcional)</span></label><textarea id="cafassoGiftReason" maxlength="240" placeholder="Ej.: Por la disponibilidad en el servicio, por completar una experiencia especial…"></textarea></div>
          <div id="cafassoGiftMessage"></div>
          <div class="cafasso-gift-note">El regalo se suma al total real de Almitas y puede hacer avanzar de etapa. No modifica desafíos aprobados, RUAH ni Huellas.</div>
          <div class="cafasso-gift-actions"><button class="cafasso-gift-btn alt" id="cafassoGiftCancel" type="button">Cancelar</button><button class="cafasso-gift-btn" id="cafassoGiftSave" type="button">Regalar Almitas</button></div>
        </section>`;
      root.querySelector('.cafasso-gift-close')?.addEventListener('click', closeModal);
      document.getElementById('cafassoGiftCancel')?.addEventListener('click', closeModal);
      document.getElementById('cafassoGiftUser')?.addEventListener('change', updateCurrent);
      document.getElementById('cafassoGiftSave')?.addEventListener('click', saveGift);
      updateCurrent();
      setTimeout(() => document.getElementById('cafassoGiftAmount')?.focus(), 60);
    } catch (error) {
      const current = root.querySelector('.cafasso-gift-current');
      if (current) current.innerHTML = `<div class="cafasso-gift-error">${esc(error.message)}</div>`;
    }
  }

  function makeGiftId() {
    return `admin-gift:${Date.now()}:${Math.random().toString(36).slice(2, 9)}`;
  }

  async function saveGift() {
    if (loading) return;
    const userId = String(document.getElementById('cafassoGiftUser')?.value || '');
    const amount = Math.round(Number(document.getElementById('cafassoGiftAmount')?.value || 0));
    const reason = String(document.getElementById('cafassoGiftReason')?.value || '').trim().slice(0, 240);
    const target = (data?.users || []).find(user => String(user?._id || '') === userId);
    const message = document.getElementById('cafassoGiftMessage');
    const save = document.getElementById('cafassoGiftSave');

    if (!target) return alert('Elegí una persona válida.');
    if (!Number.isFinite(amount) || amount <= 0) return alert('Ingresá una cantidad de Almitas mayor a 0.');
    if (amount > 1000000) return alert('La cantidad es demasiado alta. Revisala antes de continuar.');
    if (!confirm(`¿Regalar ${amount} Almitas a ${target.name || target.email}?${reason ? `\n\nMotivo: ${reason}` : ''}`)) return;

    loading = true;
    if (save) { save.disabled = true; save.textContent = 'Regalando…'; }
    if (message) message.innerHTML = '';

    try {
      const fresh = await loadAdminData();
      const row = giftRow(userId, fresh);
      const previous = normalizeState(row?.blockAnswers?.adminGiftState || null);
      const admin = currentUser();
      const gift = {
        id: makeGiftId(),
        amount,
        reason,
        at: new Date().toISOString(),
        byId: String(admin?._id || admin?.id || ''),
        byName: String(admin?.name || 'Administrador')
      };
      const next = {
        version: 1,
        gifts: [gift, ...previous.gifts].slice(0, 250),
        bonusAlmitas: previous.bonusAlmitas + amount,
        updatedAt: gift.at
      };

      const response = await fetch(PROGRESS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          courseId: COURSE_ID,
          moduleId: MODULE_ID,
          completed: false,
          percent: 0,
          completedBlocks: next.gifts.slice(0, 40).map(item => item.id),
          blockAnswers: { adminGiftState: next }
        })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result?.ok === false) throw new Error(result?.error || 'No se pudo acreditar el regalo.');

      data = await loadAdminData();
      updateCurrent();
      const amountInput = document.getElementById('cafassoGiftAmount');
      const reasonInput = document.getElementById('cafassoGiftReason');
      if (amountInput) amountInput.value = '';
      if (reasonInput) reasonInput.value = '';
      if (message) message.innerHTML = `<div class="cafasso-gift-success">✓ ${amount} Almitas acreditadas a ${esc(target.name || target.email)}.${reason ? ` · ${esc(reason)}` : ''}</div>`;
    } catch (error) {
      if (message) message.innerHTML = `<div class="cafasso-gift-error">${esc(error.message)}</div>`;
    } finally {
      loading = false;
      if (save) { save.disabled = false; save.textContent = 'Regalar Almitas'; }
    }
  }

  function makeTrigger() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'cafasso-gift-almitas-trigger';
    button.innerHTML = '✦ Regalar Almitas';
    button.addEventListener('click', openModal);
    return button;
  }

  function mountTrigger() {
    if (!isAdmin()) return false;
    ensureStyles();
    const quick = document.querySelector('.adm2-quick');
    if (quick && !quick.querySelector('.cafasso-gift-almitas-trigger')) {
      const button = makeTrigger();
      button.classList.add('primary');
      quick.insertBefore(button, quick.lastElementChild || null);
      return true;
    }
    const fallback = document.querySelector('.quick-links');
    if (fallback && !fallback.querySelector('.cafasso-gift-almitas-trigger')) {
      const button = makeTrigger();
      button.className += ' quick-link';
      button.innerHTML = '<span class="ico">✦</span><span>Regalar Almitas<small>Asignación manual</small></span>';
      fallback.appendChild(button);
      return true;
    }
    return false;
  }

  function boot() {
    if (!isAdmin()) return;
    ensureStyles();
    let attempts = 0;
    const wait = () => {
      mountTrigger();
      if (attempts++ < 60 && !document.querySelector('.adm2-quick')) setTimeout(wait, 120);
    };
    wait();
    new MutationObserver(() => mountTrigger()).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
