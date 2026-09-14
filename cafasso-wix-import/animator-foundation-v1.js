(() => {
  const app = document.getElementById('app');
  if (!app) return;

  document.body.className = 'cafasso-foundation';

  const space = new URLSearchParams(location.search).get('space') || 'house';
  const PARROQUIA_BG = 'https://static.wixstatic.com/media/47bf07_b411bebc79644a0092920abb58a2f56d~mv2.png';

  if (space === 'patio') {
    app.innerHTML = '<main class="cafasso-patio"><img class="cafasso-patio__image" src="https://static.wixstatic.com/media/47bf07_2465a68b3ac64824b43bc20531ce6fd4~mv2.png" alt="Patio salesiano CAFASSO"><button class="cafasso-space-link cafasso-space-link--patio-home" data-space="house" type="button">Casa</button><button class="cafasso-space-link cafasso-space-link--patio-parroquia" data-space="parroquia" type="button">Parroquia</button></main>';
  } else if (space === 'parroquia') {
    app.innerHTML = `<main class="cafasso-parroquia"><img class="cafasso-parroquia__image" src="${PARROQUIA_BG}" alt="Espacio Parroquia de CAFASSO"><button class="cafasso-space-link cafasso-space-link--parroquia-patio" data-space="patio" type="button">Patio</button></main>`;
  } else {
    app.innerHTML = '<main class="cafasso-house"><img class="cafasso-house__image" src="./assets/cafasso-casa-interior-v2.jpg" alt="Interior cálido de la Casa CAFASSO"><button class="cafasso-space-link cafasso-space-link--casa" data-space="patio" type="button">Patio</button></main>';
  }

  app.querySelectorAll('[data-space]').forEach((button) => {
    button.addEventListener('click', () => {
      const next = new URL(location.href);
      if (button.dataset.space === 'house') next.searchParams.delete('space');
      else next.searchParams.set('space', button.dataset.space);
      location.href = next.toString();
    });
  });
})();