(() => {
  if (window.__cafassoMobileFoundationInstalled) return;
  window.__cafassoMobileFoundationInstalled = true;

  const STYLE_ID = 'cafassoMobileFoundationStyles';
  const MOBILE_QUERY = '(max-width: 820px), (pointer: coarse)';

  function ensureViewportMeta() {
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      document.head.appendChild(meta);
    }
    meta.content = 'width=device-width,initial-scale=1,viewport-fit=cover,interactive-widget=resizes-content';
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      :root{
        --cafasso-vh:100dvh;
        --cafasso-safe-top:env(safe-area-inset-top,0px);
        --cafasso-safe-right:env(safe-area-inset-right,0px);
        --cafasso-safe-bottom:env(safe-area-inset-bottom,0px);
        --cafasso-safe-left:env(safe-area-inset-left,0px);
        --cafasso-touch:44px;
      }

      html.cafasso-mobile,
      html.cafasso-mobile body,
      html.cafasso-mobile #app{
        width:100%;
        height:var(--cafasso-vh);
        min-height:var(--cafasso-vh);
        overflow:hidden;
        overscroll-behavior:none;
      }

      html.cafasso-mobile body{
        position:fixed;
        inset:0;
        -webkit-text-size-adjust:100%;
        touch-action:manipulation;
      }

      html.cafasso-mobile .cafasso-house,
      html.cafasso-mobile .cafasso-patio,
      html.cafasso-mobile .cafasso-parroquia,
      html.cafasso-mobile .cafasso-escuela,
      html.cafasso-mobile .cafasso-recursos{
        width:100%;
        height:var(--cafasso-vh);
        min-height:var(--cafasso-vh);
        inset:0;
      }

      html.cafasso-mobile button,
      html.cafasso-mobile a,
      html.cafasso-mobile [role="button"]{
        -webkit-tap-highlight-color:transparent;
        touch-action:manipulation;
      }

      html.cafasso-mobile .cafasso-space-link{
        min-width:var(--cafasso-touch);
        min-height:var(--cafasso-touch);
        display:inline-flex;
        align-items:center;
        justify-content:center;
        padding:10px 14px;
        font-size:13px;
        line-height:1.15;
      }

      html.cafasso-mobile .cafasso-admin-home-link{
        min-height:var(--cafasso-touch);
        display:inline-flex;
        align-items:center;
        top:max(12px,calc(var(--cafasso-safe-top) + 8px))!important;
        right:max(12px,calc(var(--cafasso-safe-right) + 8px))!important;
      }

      html.cafasso-mobile .cafasso-ambience-toggle{
        left:max(10px,calc(var(--cafasso-safe-left) + 8px))!important;
        bottom:max(10px,calc(var(--cafasso-safe-bottom) + 8px))!important;
        width:var(--cafasso-touch)!important;
        height:var(--cafasso-touch)!important;
        min-width:var(--cafasso-touch);
        min-height:var(--cafasso-touch);
      }

      html.cafasso-mobile :is(
        .cafasso-profile-panel,
        .cafasso-bitacora-panel,
        .cafasso-bitacora-acompanante-panel,
        .cafasso-parish-panel,
        .cafasso-parish-silence,
        .cafasso-school-map-panel
      ){
        position:fixed!important;
        inset:0!important;
        width:100%!important;
        height:var(--cafasso-vh)!important;
        max-height:var(--cafasso-vh)!important;
        padding:
          max(10px,var(--cafasso-safe-top))
          max(10px,var(--cafasso-safe-right))
          max(10px,var(--cafasso-safe-bottom))
          max(10px,var(--cafasso-safe-left))!important;
        align-items:flex-end!important;
        overflow:hidden!important;
      }

      html.cafasso-mobile :is(
        .cafasso-profile-card,
        .cafasso-bitacora-book,
        .cafasso-bitacora-acompanante-book,
        .cafasso-parish-sheet,
        .cafasso-school-map
      ){
        width:100%!important;
        max-width:none!important;
        max-height:calc(var(--cafasso-vh) - var(--cafasso-safe-top) - 10px)!important;
        min-height:0!important;
        overflow:auto!important;
        overscroll-behavior:contain;
        -webkit-overflow-scrolling:touch;
        border-radius:16px 16px 0 0!important;
        transform:none!important;
      }

      html.cafasso-mobile :is(
        .cafasso-profile-close,
        .cafasso-bitacora-close,
        .cafasso-parish-close,
        .cafasso-school-map__close
      ){
        width:var(--cafasso-touch)!important;
        height:var(--cafasso-touch)!important;
        min-width:var(--cafasso-touch);
        min-height:var(--cafasso-touch);
        display:grid;
        place-items:center;
      }

      html.cafasso-mobile :is(
        input,
        textarea,
        select
      ){
        font-size:16px!important;
      }

      html.cafasso-mobile :is(
        .cafasso-profile-action,
        .cafasso-bitacora-save,
        .cafasso-parish-action,
        .cafasso-school-course,
        .cafasso-school-module
      ){
        min-height:var(--cafasso-touch);
      }

      html.cafasso-mobile.cafasso-keyboard-open :is(
        .cafasso-profile-panel,
        .cafasso-bitacora-panel,
        .cafasso-bitacora-acompanante-panel,
        .cafasso-parish-panel,
        .cafasso-school-map-panel
      ){
        align-items:flex-start!important;
      }

      html.cafasso-mobile.cafasso-keyboard-open :is(
        .cafasso-profile-card,
        .cafasso-bitacora-book,
        .cafasso-bitacora-acompanante-book,
        .cafasso-parish-sheet,
        .cafasso-school-map
      ){
        max-height:100%!important;
        border-radius:12px!important;
      }

      @media(max-width:820px){
        .cafasso-bitacora-panel{
          padding-bottom:max(8px,var(--cafasso-safe-bottom))!important;
        }
        .cafasso-bitacora-book{
          padding-bottom:max(22px,calc(var(--cafasso-safe-bottom) + 14px))!important;
        }
        .cafasso-bitacora-footer{
          gap:12px!important;
        }
        .cafasso-bitacora-save{
          min-width:120px;
          min-height:var(--cafasso-touch);
        }
      }

      @media(max-width:430px){
        html.cafasso-mobile{--cafasso-touch:46px}
        html.cafasso-mobile .cafasso-space-link{
          padding:10px 12px;
          font-size:12px;
        }
      }

      @media(max-height:540px) and (pointer:coarse){
        html.cafasso-mobile :is(
          .cafasso-profile-card,
          .cafasso-bitacora-book,
          .cafasso-bitacora-acompanante-book,
          .cafasso-parish-sheet,
          .cafasso-school-map
        ){
          border-radius:10px!important;
          max-height:100%!important;
        }
      }

      @media(prefers-reduced-motion:reduce){
        html.cafasso-mobile *{
          scroll-behavior:auto!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function mobileLike() {
    return Boolean(window.matchMedia?.(MOBILE_QUERY)?.matches);
  }

  function updateViewport() {
    const vv = window.visualViewport;
    const height = Math.max(320, Math.round(vv?.height || window.innerHeight || document.documentElement.clientHeight || 0));
    document.documentElement.style.setProperty('--cafasso-vh', `${height}px`);

    const root = document.documentElement;
    const isMobile = mobileLike();
    root.classList.toggle('cafasso-mobile', isMobile);

    const portrait = height >= Math.round(vv?.width || window.innerWidth || 0);
    root.classList.toggle('cafasso-mobile-portrait', isMobile && portrait);
    root.classList.toggle('cafasso-mobile-landscape', isMobile && !portrait);

    const layoutHeight = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0);
    const keyboardOpen = isMobile && vv && layoutHeight > 0 && vv.height < layoutHeight * .78;
    root.classList.toggle('cafasso-keyboard-open', Boolean(keyboardOpen));

    window.dispatchEvent(new CustomEvent('cafasso:mobile-layout', {
      detail: {
        mobile: isMobile,
        portrait,
        keyboardOpen: Boolean(keyboardOpen),
        width: Math.round(vv?.width || window.innerWidth || 0),
        height
      }
    }));
  }

  ensureViewportMeta();
  ensureStyles();

  let raf = 0;
  const schedule = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(updateViewport);
  };

  updateViewport();
  window.addEventListener('resize', schedule, { passive:true });
  window.addEventListener('orientationchange', schedule, { passive:true });
  window.visualViewport?.addEventListener('resize', schedule, { passive:true });
  window.visualViewport?.addEventListener('scroll', schedule, { passive:true });

  window.CafassoMobile = {
    refresh: updateViewport,
    get isMobile() { return document.documentElement.classList.contains('cafasso-mobile'); },
    get isPortrait() { return document.documentElement.classList.contains('cafasso-mobile-portrait'); }
  };
})();
