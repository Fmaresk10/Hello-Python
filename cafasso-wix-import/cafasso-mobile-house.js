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
        left:max(18px,calc(var(--cafasso-safe-left) + 12px))!important;
        top:max(78px,calc(var(--cafasso-safe-top) + 58px))!important;
        width:108px!important;
        height:129px!important;
        transform:perspective(560px) rotateY(-2deg) rotateZ(-3.2deg)!important;
        z-index:12!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-animator-sheet:active{
        transform:perspective(560px) rotateY(-1deg) rotateZ(-2deg) scale(.98)!important;
      }

      /* Navegación central: dos destinos reconocibles y cómodos */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-space-link--casa{
        left:50%!important;
        right:auto!important;
        top:29%!important;
        translate:-50% 0;
        z-index:13!important;
        min-width:104px!important;
        min-height:48px!important;
        padding:9px 15px 8px!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-space-link--house-recursos{
        left:auto!important;
        right:max(16px,calc(var(--cafasso-safe-right) + 12px))!important;
        top:max(114px,calc(var(--cafasso-safe-top) + 94px))!important;
        z-index:13!important;
        min-width:96px!important;
        min-height:48px!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-space-link--casa:active,
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-space-link--house-recursos:active{
        filter:brightness(1.08);
      }

      /* Bitácora: objeto principal de la franja inferior */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-bitacora-object{
        left:50%!important;
        right:auto!important;
        bottom:max(70px,calc(var(--cafasso-safe-bottom) + 54px))!important;
        width:132px!important;
        height:116px!important;
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
        bottom:max(144px,calc(var(--cafasso-safe-bottom) + 126px))!important;
        width:70px!important;
        height:70px!important;
        z-index:15!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-world-compass__face{
        inset:13px!important;
      }

      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-world-compass__needle{
        height:33px!important;
      }

      /* Secreto de Casa: sigue escondido, pero conserva un área tocable real */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-explore-secret--house{
        left:max(18px,calc(var(--cafasso-safe-left) + 12px))!important;
        bottom:max(72px,calc(var(--cafasso-safe-bottom) + 55px))!important;
        width:34px!important;
        height:28px!important;
        z-index:15!important;
      }

      /* Corazón salesiano: huella ambiental, no compite con los objetos */
      html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-corazon-huella{
        left:auto!important;
        right:25%!important;
        bottom:max(34px,calc(var(--cafasso-safe-bottom) + 22px))!important;
        width:34px!important;
        height:34px!important;
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
          width:101px!important;
          height:121px!important;
        }
        html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-space-link--house-recursos{
          min-width:88px!important;
        }
        html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-bitacora-object{
          width:122px!important;
          height:108px!important;
        }
        html.cafasso-mobile.cafasso-mobile-portrait .cafasso-house .cafasso-world-compass{
          width:64px!important;
          height:64px!important;
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
