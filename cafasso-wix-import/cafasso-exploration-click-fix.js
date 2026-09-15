(() => {
  if (window.__cafassoExplorationClickFixInstalled) return;
  window.__cafassoExplorationClickFixInstalled = true;

  const style = document.createElement('style');
  style.id = 'cafassoExplorationClickFixStyles';
  style.textContent = `
    .cafasso-house .cafasso-explore-secret{
      z-index:12!important;
      pointer-events:auto!important;
      touch-action:manipulation;
    }
  `;
  document.head.appendChild(style);
})();
