(() => {
  const app = document.getElementById('app');
  if (!app) return;
  document.body.className = 'cafasso-foundation';
  const patio = new URLSearchParams(location.search).get('space') === 'patio';
  if (patio) {
    app.innerHTML = '<main class="cafasso-patio"><img class="cafasso-patio__image" src="https://static.wixstatic.com/media/47bf07_2465a68b3ac64824b43bc20531ce6fd4~mv2.png" alt="Patio salesiano CAFASSO"><button class="cafasso-space-link cafasso-space-link--patio" data-space="patio" type="button">Ir al Patio</button></main>';
  } else {
    app.innerHTML = '<main class="cafasso-house"><img class="cafasso-house__image" src="./assets/cafasso-casa-interior-v2.jpg" alt="Interior cálido de la Casa CAFASSO"><button class="cafasso-space-link cafasso-space-link--casa" data-space="patio" type="button">Patio</button></main>';
  }
  app.querySelectorAll('[data-space]').forEach((button) => {
    button.addEventListener('click', () => {
      const next = new URL(location.href);
      next.searchParams.set('space', button.dataset.space);
      location.href = next.toString();
    });
  });
})();