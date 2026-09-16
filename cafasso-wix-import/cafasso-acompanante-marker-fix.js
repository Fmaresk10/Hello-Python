(() => {
  const STYLE_ID = 'cafassoAcompananteMarkerFixStyles';
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .cafasso-acompanante-ribbon{
      right:34%!important;
      top:auto!important;
      bottom:-9px!important;
      width:12px!important;
      height:48px!important;
      border-radius:1px!important;
      background:
        linear-gradient(90deg,rgba(255,236,205,.16),transparent 26% 72%,rgba(56,25,11,.22)),
        linear-gradient(180deg,#7b4b32 0%,#8f5b3d 58%,#68402c 100%)!important;
      box-shadow:0 4px 5px rgba(0,0,0,.28),inset 1px 0 rgba(255,232,199,.16)!important;
      transform:rotate(-2deg)!important;
      clip-path:polygon(0 0,100% 0,100% 84%,50% 100%,0 84%)!important;
      opacity:.92!important;
    }
    .cafasso-acompanante-ribbon:after{content:none!important}
    .cafasso-acompanante-ribbon.is-arriving{animation:cafassoAcompananteRibbonNatural .85s cubic-bezier(.2,.8,.2,1) both!important}
    @keyframes cafassoAcompananteRibbonNatural{
      0%{opacity:0;transform:translateY(-16px) rotate(-2deg)}
      72%{opacity:.96;transform:translateY(3px) rotate(-2deg)}
      100%{opacity:.92;transform:translateY(0) rotate(-2deg)}
    }
    @media(max-width:680px){
      .cafasso-acompanante-ribbon{right:33%!important;bottom:-7px!important;width:9px!important;height:36px!important}
    }
  `;
  document.head.appendChild(style);
})();
