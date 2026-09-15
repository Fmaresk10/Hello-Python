(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('space') !== 'parroquia') return;
  if (window.__cafassoParishLectionaryPositionInstalled) return;
  window.__cafassoParishLectionaryPositionInstalled = true;

  const style = document.createElement('style');
  style.id = 'cafassoParishLectionaryPositionStyles';
  style.textContent = `
    @media (min-width:681px){
      .cafasso-parish-lectionary.is-realistic{
        bottom:calc(11.15% + 3cm)!important;
      }
    }
  `;
  document.head.appendChild(style);
})();
