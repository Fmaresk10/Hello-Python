(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('space') !== 'escuela') return;
  if (window.__cafassoSchoolEntryInstalled) return;
  window.__cafassoSchoolEntryInstalled = true;

  const STYLE_ID = 'cafassoSchoolEntryStyles';
  const NAV_KEY = 'cafassoSpaceTransition';

  function cameFromPatio() {
    try {
      const nav = JSON.parse(sessionStorage.getItem(NAV_KEY) || 'null');
      const age = Date.now() - Number(nav?.at || 0);
      if (nav?.from === 'patio' && nav?.to === 'escuela' && age >= 0 && age < 30000) return true;
    } catch (error) {}

    try {
      if (!document.referrer) return false;
      const previous = new URL(document.referrer);
      return previous.origin === location.origin &&
        previous.pathname === location.pathname &&
        previous.searchParams.get('space') === 'patio';
    } catch (error) {
      return false;
    }
  }

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-escuela.cafasso-school-entering .cafasso-escuela__image{
        transform:scale(1.018);
        filter:brightness(.72) saturate(.92);
        transition:transform 1.08s cubic-bezier(.2,.72,.2,1),filter 1.08s ease;
      }
      .cafasso-escuela.cafasso-school-entering.cafasso-school-entering--open .cafasso-escuela__image{
        transform:scale(1);
        filter:brightness(1) saturate(1);
      }
      .cafasso-school-entry-curtain{
        position:absolute;
        inset:0;
        z-index:90;
        pointer-events:none;
        opacity:1;
        background:
          radial-gradient(ellipse 72% 70% at 52% 43%,rgba(15,36,34,.18),rgba(5,16,16,.64) 76%),
          linear-gradient(180deg,rgba(3,13,14,.86),rgba(7,23,23,.76));
        transition:opacity .92s cubic-bezier(.22,.68,.28,1);
      }
      .cafasso-school-entry-curtain.is-opening{opacity:0}
      @media(prefers-reduced-motion:reduce){
        .cafasso-escuela.cafasso-school-entering .cafasso-escuela__image{transition:none!important;transform:none!important;filter:none!important}
        .cafasso-school-entry-curtain{transition:none!important;opacity:0!important}
      }
    `;
    document.head.appendChild(style);
  }

  function playEntry(school) {
    if (!cameFromPatio()) return;
    installStyles();

    school.classList.add('cafasso-school-entering');
    const curtain = document.createElement('div');
    curtain.className = 'cafasso-school-entry-curtain';
    curtain.setAttribute('aria-hidden', 'true');
    school.appendChild(curtain);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        school.classList.add('cafasso-school-entering--open');
        curtain.classList.add('is-opening');
      });
    });

    setTimeout(() => {
      curtain.remove();
      school.classList.remove('cafasso-school-entering', 'cafasso-school-entering--open');
    }, 1150);
  }

  function boot() {
    const school = document.querySelector('.cafasso-escuela');
    if (!school) return false;
    playEntry(school);
    return true;
  }

  let tries = 0;
  const wait = () => {
    if (boot()) return;
    if (tries++ < 30) setTimeout(wait, 60);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wait, { once:true });
  else wait();
})();
