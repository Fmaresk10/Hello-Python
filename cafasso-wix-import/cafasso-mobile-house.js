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

      /* Casa Mobile v4: habitación al fondo + primer plano para objetos */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house{
        background:
          radial-gradient(ellipse 110% 58% at 50% 61%,rgba(35,31,25,.23),transparent 58%),
          linear-gradient(180deg,#101817 0%,#101615 45%,#0a1110 63%,#07100f 100%)!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house:before{
        content:"";
        position:absolute;
        left:-8%;
        right:-8%;
        top:48%;
        bottom:-4%;
        z-index:1;
        pointer-events:none;
        background:
          linear-gradient(180deg,rgba(13,17,15,.04),rgba(8,12,11,.28) 28%,rgba(4,8,8,.72) 100%),
          repeating-linear-gradient(84deg,rgba(121,91,58,.035) 0 2px,transparent 2px 58px);
        transform:perspective(560px) rotateX(8deg);
        transform-origin:50% 0;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house__image{
        position:absolute!important;
        z-index:1!important;
        left:50%!important;
        top:max(84px,calc(var(--cafasso-safe-top) + 58px))!important;
        width:184vw!important;
        max-width:none!important;
        height:auto!important;
        object-fit:initial!important;
        object-position:initial!important;
        transform:translateX(-50%)!important;
        transform-origin:50% 0!important;
        filter:brightness(.80) saturate(.86) contrast(1.035);
        -webkit-mask-image:linear-gradient(180deg,#000 0%,#000 84%,rgba(0,0,0,.84) 91%,transparent 100%);
        mask-image:linear-gradient(180deg,#000 0%,#000 84%,rgba(0,0,0,.84) 91%,transparent 100%);
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house:after{
        z-index:2;
        opacity:.25;
      }

      /* Identidad: ficha visible, arriba a la izquierda pero fuera del notch */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-animator-sheet{
        left:max(14px,calc(var(--cafasso-safe-left) + 10px))!important;
        top:max(178px,calc(var(--cafasso-safe-top) + 154px))!important;
        width:84px!important;
        height:101px!important;
        transform:perspective(560px) rotateY(-2deg) rotateZ(-3.2deg)!important;
        z-index:12!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-animator-sheet:active{
        transform:perspective(560px) rotateY(-1deg) rotateZ(-2deg) scale(.98)!important;
      }

      /* En móvil la puerta es la navegación: el botón deja de parecer UI */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-space-link--casa.cafasso-house-door{
        left:45%!important;
        right:auto!important;
        top:25%!important;
        width:38%!important;
        height:25%!important;
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
        bottom:2%;
        transform:translateX(-50%);
        display:block!important;
        width:max-content;
        padding:5px 10px 6px;
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
        font:600 11px/1 Georgia,serif;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-house-door__sub{
        display:none!important;
      }

      /* Recursos vuelve a sentirse parte de la biblioteca */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-space-link--house-recursos{
        left:max(16px,calc(var(--cafasso-safe-left) + 12px))!important;
        right:auto!important;
        top:43%!important;
        z-index:13!important;
        min-width:0!important;
        min-height:36px!important;
        padding:7px 9px!important;
        border-color:rgba(224,190,119,.24)!important;
        border-radius:3px!important;
        background:rgba(24,24,19,.38)!important;
        box-shadow:none!important;
        backdrop-filter:blur(3px);
        color:rgba(255,245,218,.78)!important;
        font-size:10px!important;
        opacity:.84;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-space-link--house-recursos:active{
        transform:scale(.98)!important;
        filter:brightness(1.08);
      }

      /* Bitácora: objeto principal de la franja inferior */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-bitacora-object{
        left:50%!important;
        right:auto!important;
        bottom:max(72px,calc(var(--cafasso-safe-bottom) + 58px))!important;
        width:112px!important;
        height:99px!important;
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
        bottom:max(128px,calc(var(--cafasso-safe-bottom) + 112px))!important;
        width:58px!important;
        height:58px!important;
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
        bottom:max(102px,calc(var(--cafasso-safe-bottom) + 86px))!important;
        width:29px!important;
        height:22px!important;
        z-index:15!important;
      }

      /* Corazón salesiano: huella ambiental, no compite con los objetos */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-corazon-huella{
        left:auto!important;
        right:28%!important;
        bottom:max(35px,calc(var(--cafasso-safe-bottom) + 24px))!important;
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
        position:absolute!important;
        inset:0!important;
        width:100%!important;
        height:100%!important;
        object-fit:cover!important;
        object-position:50% 50%!important;
        transform:none!important;
        filter:none!important;
        -webkit-mask-image:none!important;
        mask-image:none!important;
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
          width:78px!important;
          height:94px!important;
        }
        html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-space-link--house-recursos{
          min-width:72px!important;
        }
        html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-bitacora-object{
          width:104px!important;
          height:92px!important;
        }
        html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-world-compass{
          width:54px!important;
          height:54px!important;
        }
      }

      @media(prefers-reduced-motion:reduce){
        html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house__image{
          transform:translateX(-50%)!important;
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
