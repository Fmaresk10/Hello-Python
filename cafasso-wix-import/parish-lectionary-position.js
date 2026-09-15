(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('space') !== 'parroquia') return;
  if (window.__cafassoParishLectionaryPositionInstalled) return;
  window.__cafassoParishLectionaryPositionInstalled = true;

  const style = document.createElement('style');
  style.id = 'cafassoParishLectionaryPositionStyles';
  style.textContent = `
    /* Posición final aplicada antes de crear el objeto: evita el salto al recargar. */
    @media (min-width:681px){
      html body .cafasso-parroquia .cafasso-parish-lectionary{
        right:9.25%!important;
        bottom:calc(11.15% + 3cm)!important;
        width:238px!important;
        height:162px!important;
        transform:perspective(820px) rotateX(3deg) rotateZ(1.1deg)!important;
        transform-origin:50% 100%!important;
      }
      html body .cafasso-parroquia .cafasso-parish-lectionary:hover{
        transform:perspective(820px) rotateX(2deg) rotateZ(.65deg) translateY(-3px) scale(1.012)!important;
      }
    }
    @media (max-width:680px){
      html body .cafasso-parroquia .cafasso-parish-lectionary{
        right:3.6%!important;
        bottom:10.1%!important;
        width:166px!important;
        height:116px!important;
        transform:perspective(820px) rotateX(3deg) rotateZ(1.1deg)!important;
        transform-origin:50% 100%!important;
      }
    }
  `;
  document.head.appendChild(style);
})();
