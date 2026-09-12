(() => {
  if (window.__cafassoWorldPersistenceInstalled) return;
  window.__cafassoWorldPersistenceInstalled = true;

  const API = 'https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoProgress';
  const COURSE_ID = '__cafasso_world__';
  const MODULE_ID = '__world__';
  const STORAGE_PREFIX = 'cafasso-world-state-';

  const current = () => window.CafassoAnimatorState || {};
  const userId = () => current().session?.user?._id || '';
  const storageKey = () => STORAGE_PREFIX + userId();

  function read() {
    const fromData = (current().data?.progress || []).find(row =>
      row.courseId === COURSE_ID && row.userId === userId()
    );
    const fromRow = fromData?.blockAnswers?.worldState;
    if (fromRow && typeof fromRow === 'object') return fromRow;
    try {
      const local = JSON.parse(localStorage.getItem(storageKey()) || 'null');
      if (local && typeof local === 'object') return local;
    } catch (error) {}
    return { huellas: [], arrivalCompleted: false, updatedAt: '' };
  }

  function writeLocal(state) {
    try { localStorage.setItem(storageKey(), JSON.stringify(state)); } catch (error) {}
  }

  async function persist(state) {
    writeLocal(state);
    const id = userId();
    if (!id) return;
    try {
      const response = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: id,
          courseId: COURSE_ID,
          moduleId: MODULE_ID,
          completed: true,
          percent: 100,
          completedBlocks: state.huellas.map(item => item.id),
          blockAnswers: { worldState: state }
        })
      });
      if (!response.ok) console.warn('CAFASSO: huella guardada localmente; Wix respondió', response.status);
    } catch (error) {
      console.warn('CAFASSO: huella guardada localmente; Wix no respondió.', error);
    }
    const stateRef = current();
    stateRef.data = stateRef.data || {};
    stateRef.data.progress = Array.isArray(stateRef.data.progress) ? stateRef.data.progress : [];
    let row = stateRef.data.progress.find(item => item.courseId === COURSE_ID && item.userId === id);
    if (!row) {
      row = { userId: id, courseId: COURSE_ID };
      stateRef.data.progress.push(row);
    }
    row.blockAnswers = { worldState: state };
    row.completedBlocks = state.huellas.map(item => item.id);
    row.percent = 100;
    window.dispatchEvent(new CustomEvent('cafasso:world-state', { detail: state }));
  }

  function updateHud(state) {
    const hud = document.querySelector('.cafasso-world-stats');
    if (!hud || hud.querySelector('[data-world-persistent-stat]')) return;
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'cafasso-world-stat';
    item.dataset.worldPersistentStat = '1';
    item.innerHTML = '<span>Huellas</span><b data-world-huellas>0</b>';
    hud.appendChild(item);
    const refresh = () => {
      const target = item.querySelector('[data-world-huellas]');
      if (target) target.textContent = String(state.huellas?.length || 0);
    };
    refresh();
    item.addEventListener('click', () => {
      const panel = document.querySelector('.cafasso-world-panel');
      if (!panel) return;
      panel.className = 'cafasso-world-panel show near-casa';
      panel.innerHTML = '<button class="close" type="button" aria-label="Cerrar">×</button><h3>Huellas</h3><p>Tu recorrido queda guardado acá. Cada misión significativa puede dejar una nueva marca.</p><div class="cafasso-ledger">' +
        ((state.huellas || []).length ? state.huellas.slice().reverse().map(row =>
          '<div class="cafasso-ledger-row"><span>✦</span><div><strong>' + row.title + '</strong><small>' + row.date + '</small></div></div>'
        ).join('') : '<div class="cafasso-ledger-empty">Todavía no dejaste huellas.</div>') +
        '</div>';
      panel.querySelector('.close')?.addEventListener('click', () => panel.classList.remove('show'));
    });
  }

  function decorateCasa(state) {
    const panel = document.querySelector('.cafasso-world-panel.show');
    if (!panel || !/^<h3>Casa/i.test(panel.innerHTML.trim()) || panel.querySelector('[data-world-arrival]')) return;
    const box = document.createElement('div');
    box.className = 'cafasso-journey-card';
    box.innerHTML = '<strong>Primera huella</strong><p>Registrá que llegaste al mundo CAFASSO. Después vamos a convertir esta llegada en la Misión 0.</p><button type="button" data-world-arrival>' +
      (state.arrivalCompleted ? 'Llegada registrada ✓' : 'Dejar mi primera huella') + '</button>';
    panel.appendChild(box);
    box.querySelector('[data-world-arrival]')?.addEventListener('click', async () => {
      if (state.arrivalCompleted) return;
      state.arrivalCompleted = true;
      state.updatedAt = new Date().toISOString();
      state.huellas = [...(state.huellas || []), { id: 'arrival', title: 'Llegué con mi historia', date: new Date().toLocaleDateString('es-AR') }];
      box.querySelector('button').textContent = 'Llegada registrada ✓';
      box.querySelector('button').disabled = true;
      await persist(state);
      updateHud(state);
    });
  }

  function installBootSafety() {
    window.setTimeout(() => {
      const app = document.getElementById('app');
      const world = document.querySelector('.cafasso-world');
      if (!app || world) return;
      const hidden = getComputedStyle(app).visibility === 'hidden' || getComputedStyle(app).opacity === '0';
      if (!hidden) return;
      app.classList.add('cafasso-boot-ready');
      app.innerHTML = '<div class="error"><strong>No pudimos preparar tu mundo CAFASSO.</strong><br>La sesión o la conexión con CAFASSO no respondió a tiempo. Recargá una vez la página; si vuelve a ocurrir, revisaremos la conexión de Wix.</div>';
    }, 9000);
  }

  function boot() {
    installBootSafety();
    const state = read();
    const observer = new MutationObserver(() => {
      updateHud(state);
      decorateCasa(state);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    updateHud(state);
    decorateCasa(state);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
