(() => {
  const app = document.getElementById('app');
  if (!app) return;
  document.body.className = 'cafasso-foundation';
  const patio = new URLSearchParams(location.search).get('space') === 'patio';
  if (patio) {
    app.innerHTML = '<main class="cafasso-patio"><img class="cafasso-patio__image" src="https://static.wixstatic.com/media/47bf07_2465a68b3ac64824b43bc20531ce6fd4~mv2.png" alt="Patio salesiano CAFASSO"></main>';
  } else {
    app.innerHTML = '<main class="cafasso-house"><img class="cafasso-house__image" src="./assets/cafasso-casa-interior-v2.jpg" alt="Interior cálido de la Casa CAFASSO"></main>';
  }
})();