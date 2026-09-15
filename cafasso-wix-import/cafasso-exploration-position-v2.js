(() => {
  if (window.__cafassoExplorationPositionV2Installed) return;
  window.__cafassoExplorationPositionV2Installed = true;

  const style = document.createElement('style');
  style.id = 'cafassoExplorationPositionV2Styles';
  style.textContent = `
    .cafasso-house .cafasso-explore-secret--house{
      left:13.5%!important;
      right:auto!important;
      bottom:8.2%!important;
      width:31px!important;
      height:21px!important;
      transform:rotate(-8deg)!important;
      opacity:.88;
      filter:brightness(.92) saturate(.78);
    }

    .cafasso-house .cafasso-explore-secret--house:hover,
    .cafasso-house .cafasso-explore-secret--house:focus-visible{
      transform:translateY(-3px) rotate(-5deg) scale(1.08)!important;
      opacity:1;
      filter:brightness(1.04) saturate(.92);
    }

    @media(max-width:680px){
      .cafasso-house .cafasso-explore-secret--house{
        left:10%!important;
        bottom:9.2%!important;
        width:27px!important;
        height:18px!important;
      }
    }
  `;
  document.head.appendChild(style);
})();
