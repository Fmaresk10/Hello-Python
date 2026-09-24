(() => {
  if (window.__cafassoParishMobileFinalGeometryInstalled) return;
  window.__cafassoParishMobileFinalGeometryInstalled = true;

  const params = new URLSearchParams(location.search);
  if (params.get('space') !== 'parroquia') return;
  if (!window.matchMedia?.('(max-width:820px), (pointer:coarse)').matches) return;

  const style = document.createElement('style');
  style.id = 'cafassoParishMobileFinalGeometry';
  style.textContent = `
    @media(max-width:820px),(pointer:coarse){
      html.cafasso-mobile body .cafasso-parroquia .cafasso-parish-panorama .cafasso-space-link--parroquia-patio{
        left:calc(50% + 8cm)!important;
        right:auto!important;
        top:47%!important;
        bottom:auto!important;
        transform:translate(-50%,-50%)!important;
      }
      html.cafasso-mobile body .cafasso-parroquia .cafasso-parish-panorama .cafasso-space-link--parroquia-patio:hover{
        transform:translate(-50%,calc(-50% - 2px))!important;
      }
      html.cafasso-mobile body .cafasso-parroquia .cafasso-parish-panorama .cafasso-parish-lectionary{
        left:calc(28.4% - 2cm)!important;
        right:auto!important;
        top:auto!important;
        bottom:53.6%!important;
        width:116px!important;
        height:78px!important;
        transform:perspective(820px) rotateX(3deg) rotateZ(1deg)!important;
        transform-origin:50% 100%!important;
        z-index:14!important;
      }
      html.cafasso-mobile body .cafasso-parroquia .cafasso-parish-panorama .cafasso-parish-lectionary:hover{
        transform:perspective(820px) rotateX(2deg) rotateZ(.6deg) translateY(-3px) scale(1.012)!important;
      }

      html.cafasso-mobile body .cafasso-parroquia .cafasso-parish-panorama .cafasso-parish-songbook{
        left:auto!important;
        right:5.2%!important;
        top:auto!important;
        bottom:calc(9.8% + 8cm)!important;
        width:138px!important;
        height:94px!important;
        transform:perspective(720px) rotateX(7deg) rotateZ(-3deg)!important;
        transform-origin:50% 100%!important;
        z-index:14!important;
      }
      html.cafasso-mobile body .cafasso-parroquia .cafasso-parish-panorama .cafasso-parish-songbook:hover{
        transform:perspective(720px) rotateX(4deg) rotateZ(-2deg) translateY(-3px) scale(1.018)!important;
      }

      html.cafasso-mobile body .cafasso-parroquia .cafasso-parish-panorama .cafasso-parish-candle{
        left:61.2%!important;
        right:auto!important;
        top:auto!important;
        bottom:48.8%!important;
        width:84px!important;
        height:152px!important;
        transform:translateX(-50%) perspective(700px) rotateX(1.6deg) scale(.47)!important;
        transform-origin:50% 100%!important;
        z-index:15!important;
      }
      html.cafasso-mobile body .cafasso-parroquia .cafasso-parish-panorama .cafasso-parish-candle:hover{
        transform:translateX(-50%) perspective(700px) rotateX(1deg) translateY(-2px) scale(.485)!important;
      }
    }
  `;
  document.head.appendChild(style);
})();