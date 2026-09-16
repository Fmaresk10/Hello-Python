(() => {
  const params = new URLSearchParams(location.search);
  if ((params.get('space') || 'house') !== 'house') return;
  if (window.__cafassoWorldUnlockPositionInstalled) return;
  window.__cafassoWorldUnlockPositionInstalled = true;

  const style = document.createElement('style');
  style.id = 'cafassoWorldUnlockPositionStyles';
  style.textContent = `
    @media (min-width:681px){
      html body .cafasso-house .cafasso-world-compass{
        left:calc(61.7% + 4cm)!important;
        width:72px!important;
        height:72px!important;
      }
      html body .cafasso-house .cafasso-world-compass__face{
        inset:14px!important;
      }
      html body .cafasso-house .cafasso-world-compass__needle{
        height:34px!important;
      }
      html body .cafasso-house .cafasso-world-compass__needle:before,
      html body .cafasso-house .cafasso-world-compass__needle:after{
        height:17px!important;
      }
    }
  `;
  document.head.appendChild(style);
})();
