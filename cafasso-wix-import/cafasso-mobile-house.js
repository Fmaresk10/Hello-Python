(() => {
  const params = new URLSearchParams(location.search);
  if ((params.get('space') || 'house') !== 'house') return;
  if (window.__cafassoMobileHouseInstalled) return;
  window.__cafassoMobileHouseInstalled = true;

  const STYLE_ID = 'cafassoMobileHouseStyles';

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      html.cafasso-mobile .cafasso-house{
        background:#1a2926;
        isolation:isolate;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house__image{
        object-fit:cover!important;
        object-position:52% 50%!important;
        transform:scale(1.025);
        transform-origin:50% 50%;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house:before{
        content:"";
        position:absolute;
        inset:0;
        z-index:2;
        pointer-events:none;
        background:
          linear-gradient(180deg,rgba(8,15,14,.18) 0%,transparent 17%,transparent 71%,rgba(5,12,11,.30) 100%),
          radial-gradient(ellipse 80% 54% at 50% 58%,transparent 52%,rgba(3,9,8,.15) 100%);
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house:after{
        z-index:2;
        opacity:.54;
      }

      /* Identidad: ficha visible, arriba a la izquierda pero fuera del notch */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-animator-sheet{
        left:max(14px,calc(var(--cafasso-safe-left) + 10px))!important;
        top:max(126px,calc(var(--cafasso-safe-top) + 108px))!important;
        width:96px!important;
        height:115px!important;
        transform:perspective(560px) rotateY(-2deg) rotateZ(-3.2deg)!important;
        z-index:12!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-animator-sheet:active{
        transform:perspective(560px) rotateY(-1deg) rotateZ(-2deg) scale(.98)!important;
      }

      /* En móvil la puerta es la navegación: el botón deja de parecer UI */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-space-link--casa.cafasso-house-door{
        left:39%!important;
        right:auto!important;
        top:16%!important;
        width:51%!important;
        height:42%!important;
        min-width:0!important;
        min-height:0!important;
        padding:0!important;
        border:0!important;
        border-radius:0!important;
        background:transparent!important;
        box-shadow:none!important;
        backdrop-filter:none!important;
        translate:0 0!important;
        transform:none!important;
        display:block!important;
        z-index:13!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-space-link--casa.cafasso-house-door:hover,
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-space-link--casa.cafasso-house-door:active{
        background:transparent!important;
        box-shadow:none!important;
        transform:none!important;
        filter:none!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-house-door__main{
        position:absolute!important;
        left:50%;
        bottom:9%;
        transform:translateX(-50%);
        display:block!important;
        width:max-content;
        padding:7px 12px 8px;
        border:1px solid rgba(239,201,112,.24);
        border-radius:999px;
        background:rgba(10,29,27,.48);
        box-shadow:0 5px 15px rgba(0,0,0,.18);
        backdrop-filter:blur(5px);
        color:rgba(255,248,229,.86);
        font-size:0!important;
        letter-spacing:.04em;
        text-shadow:0 1px 4px rgba(0,0,0,.45);
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-house-door__main:after{
        content:"Patio  →";
        font:600 12px/1 Georgia,serif;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-house-door__sub{
        display:none!important;
      }

      /* Recursos vuelve a sentirse parte de la biblioteca */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-space-link--house-recursos{
        left:max(14px,calc(var(--cafasso-safe-left) + 10px))!important;
        right:auto!important;
        top:45%!important;
        z-index:13!important;
        min-width:76px!important;
        min-height:42px!important;
        padding:8px 10px!important;
        border-color:rgba(239,195,93,.30)!important;
        background:rgba(10,31,29,.54)!important;
        box-shadow:0 5px 14px rgba(0,0,0,.20)!important;
        backdrop-filter:blur(5px);
        font-size:11px!important;
        opacity:.90;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-space-link--house-recursos:active{
        transform:scale(.98)!important;
        filter:brightness(1.08);
      }

      /* Bitácora: objeto principal de la franja inferior */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-bitacora-object{
        left:50%!important;
        right:auto!important;
        bottom:max(52px,calc(var(--cafasso-safe-bottom) + 38px))!important;
        width:120px!important;
        height:106px!important;
        transform:translateX(-50%) rotate(-5deg)!important;
        z-index:14!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-bitacora-object:active{
        transform:translateX(-50%) rotate(-4deg) scale(.97)!important;
      }

      /* Caminante: brújula separada de Bitácora y del home indicator */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-world-compass{
        left:auto!important;
        right:max(20px,calc(var(--cafasso-safe-right) + 16px))!important;
        bottom:max(112px,calc(var(--cafasso-safe-bottom) + 96px))!important;
        width:64px!important;
        height:64px!important;
        z-index:15!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-world-compass__face{
        inset:12px!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-world-compass__needle{
        height:30px!important;
      }

      /* Secreto de Casa: sigue escondido, pero conserva un área tocable real */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-explore-secret--house{
        left:max(18px,calc(var(--cafasso-safe-left) + 12px))!important;
        bottom:max(88px,calc(var(--cafasso-safe-bottom) + 72px))!important;
        width:31px!important;
        height:24px!important;
        z-index:15!important;
      }

      /* Corazón salesiano: huella ambiental, no compite con los objetos */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-corazon-huella{
        left:auto!important;
        right:27%!important;
        bottom:max(28px,calc(var(--cafasso-safe-bottom) + 18px))!important;
        width:26px!important;
        height:26px!important;
        font-size:19px!important;
        opacity:.64!important;
        z-index:11!important;
      }

      /* Elementos estacionales en Casa se mantienen periféricos */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-season-word{
        left:max(16px,calc(var(--cafasso-safe-left) + 10px))!important;
        top:max(20px,calc(var(--cafasso-safe-top) + 10px))!important;
        font-size:13px!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-salesian-sign{
        bottom:max(18px,calc(var(--cafasso-safe-bottom) + 8px))!important;
        max-width:62vw;
      }

      /* Cabecera móvil: solo información esencial */
      html.cafasso-mobile body.cafasso-mobile-house-active .cafasso-level-pill{
        display:none!important;
      }

      html.cafasso-mobile body.cafasso-mobile-house-active .cafasso-global-counters{
        left:max(8px,calc(var(--cafasso-safe-left) + 6px))!important;
        top:max(8px,calc(var(--cafasso-safe-top) + 6px))!important;
        transform:scale(.92);
        transform-origin:top left;
      }

      html.cafasso-mobile body.cafasso-mobile-house-active .cafasso-admin-home-link{
        min-width:76px!important;
        min-height:40px!important;
        padding:0 11px!important;
        border-color:rgba(242,201,76,.46)!important;
        background:rgba(13,43,65,.72)!important;
        box-shadow:0 5px 15px rgba(0,0,0,.20)!important;
        font-size:0!important;
      }

      html.cafasso-mobile body.cafasso-mobile-house-active .cafasso-admin-home-link:after{
        content:"⚙ Admin";
        font:700 10px/1 Inter,system-ui,sans-serif;
        letter-spacing:.02em;
      }

      html.cafasso-mobile body.cafasso-mobile-house-active .cafasso-calendar-admin-trigger{
        width:38px!important;
        height:38px!important;
        min-width:38px!important;
        min-height:38px!important;
        right:max(10px,calc(var(--cafasso-safe-right) + 7px))!important;
        bottom:max(10px,calc(var(--cafasso-safe-bottom) + 7px))!important;
        opacity:.66!important;
        transform:scale(.92);
        transform-origin:bottom right;
      }

      /* Los diálogos propios de Casa pasan a bottom sheet móvil */
      html.cafasso-mobile :is(
        .cafasso-world-object-layer,
        .cafasso-discovery-layer,
        .cafasso-corazon-layer
      ){
        align-items:flex-end!important;
        justify-content:center!important;
        padding:
          max(10px,var(--cafasso-safe-top))
          max(10px,var(--cafasso-safe-right))
          max(10px,var(--cafasso-safe-bottom))
          max(10px,var(--cafasso-safe-left))!important;
      }

      html.cafasso-mobile :is(
        .cafasso-world-object-note,
        .cafasso-discovery-note,
        .cafasso-corazon-note
      ){
        width:100%!important;
        max-width:none!important;
        max-height:calc(var(--cafasso-vh) - var(--cafasso-safe-top) - 12px)!important;
        overflow:auto!important;
        -webkit-overflow-scrolling:touch;
        border-radius:16px 16px 0 0!important;
        transform:none!important;
        padding-left:24px!important;
        padding-right:24px!important;
        padding-bottom:max(28px,calc(var(--cafasso-safe-bottom) + 18px))!important;
      }

      html.cafasso-mobile :is(
        .cafasso-world-object-close,
        .cafasso-discovery-close,
        .cafasso-corazon-close
      ){
        width:46px!important;
        height:46px!important;
        min-width:46px;
        min-height:46px;
        display:grid!important;
        place-items:center!important;
      }

      html.cafasso-mobile .cafasso-world-unlock-toast,
      html.cafasso-mobile .cafasso-discovery-toast,
      html.cafasso-mobile .cafasso-corazon-toast,
      html.cafasso-mobile .cafasso-acompanante-toast{
        left:50%!important;
        right:auto!important;
        bottom:max(62px,calc(var(--cafasso-safe-bottom) + 48px))!important;
        width:max-content;
        max-width:calc(100vw - 30px)!important;
        text-align:center;
      }

      /* Ficha personal: lectura compacta pero sin achicar tipografía */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-profile-card{
        padding:
          34px
          20px
          max(28px,calc(var(--cafasso-safe-bottom) + 18px))
          20px!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-profile-head{
        grid-template-columns:80px 1fr!important;
        gap:14px!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-profile-avatar{
        width:80px!important;
        height:96px!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-profile-name{
        font-size:clamp(25px,8vw,31px)!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-profile-identity-line{
        font-size:13px!important;
        line-height:1.45!important;
      }

      /* Bitácora: escritura cómoda con teclado abierto */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-bitacora-book{
        padding:
          42px
          20px
          max(26px,calc(var(--cafasso-safe-bottom) + 16px))
          20px!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-bitacora-book h2{
        font-size:32px!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-bitacora-prompt{
        margin-bottom:16px!important;
        font-size:14px!important;
        line-height:1.5!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-bitacora-text{
        height:min(38vh,300px)!important;
        min-height:190px!important;
        font-size:17px!important;
        line-height:28px!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-bitacora-footer{
        align-items:stretch!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-bitacora-save{
        width:100%!important;
        min-height:48px!important;
      }

      /* Paisaje: prioriza visibilidad sin rehacer la escena */
      html.cafasso-mobile.cafasso-mobile-landscape .cafasso-house__image{
        object-position:50% 50%!important;
      }

      html.cafasso-mobile.cafasso-mobile-landscape .cafasso-house .cafasso-animator-sheet{
        left:max(20px,calc(var(--cafasso-safe-left) + 12px))!important;
        top:max(54px,calc(var(--cafasso-safe-top) + 34px))!important;
        transform:scale(.82) rotate(-3deg)!important;
        transform-origin:top left!important;
      }

      html.cafasso-mobile.cafasso-mobile-landscape .cafasso-house .cafasso-bitacora-object{
        bottom:max(18px,calc(var(--cafasso-safe-bottom) + 10px))!important;
        transform:scale(.82) rotate(-5deg)!important;
        transform-origin:bottom center!important;
      }

      @media(max-width:380px){
        html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-animator-sheet{
          width:90px!important;
          height:108px!important;
        }
        html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-space-link--house-recursos{
          min-width:72px!important;
        }
        html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-bitacora-object{
          width:112px!important;
          height:99px!important;
        }
        html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-world-compass{
          width:58px!important;
          height:58px!important;
        }
      }

      @media(prefers-reduced-motion:reduce){
        html.cafasso-mobile .cafasso-house__image{
          transform:none!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function markHouse() {
    const house = document.querySelector('.cafasso-house');
    if (!house) return false;
    house.dataset.mobileHouseReady = '1';
    document.body.classList.add('cafasso-mobile-house-active');
    return true;
  }

  ensureStyles();

  let attempts=0;
  const boot=()=>{
    if (markHouse()) return;
    if (attempts < 40) {
      attempts += 1;
      setTimeout(boot,80);
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
