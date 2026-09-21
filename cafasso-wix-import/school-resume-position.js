(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('space') !== 'escuela') return;

  const style = document.createElement('style');
  style.id = 'cafassoSchoolResumePosition';
  style.textContent = `
    .cafasso-escuela .cafasso-school-resume{
      left:52.3%!important;
      right:auto!important;
      top:35.0%!important;
      bottom:auto!important;
      width:150px!important;
      height:100px!important;
      transform:translateX(-50%) rotateZ(-.8deg)!important;
      transform-origin:50% 75%!important;
      filter:drop-shadow(0 9px 7px rgba(0,0,0,.40))!important;
      -webkit-font-smoothing:antialiased!important;
      text-rendering:optimizeLegibility!important;
    }
    .cafasso-escuela .cafasso-school-resume:hover{
      transform:translateX(-50%) translateY(-2px) rotateZ(-.5deg)!important;
      filter:drop-shadow(0 11px 9px rgba(0,0,0,.46))!important;
    }
    .cafasso-escuela .cafasso-school-resume.is-opening{
      transform:translateX(-50%) translateY(-3px) rotateZ(-.4deg)!important;
      opacity:1!important;
    }

    @media(max-width:760px){
      .cafasso-escuela .cafasso-school-resume{
        left:53%!important;
        top:35.7%!important;
        width:108px!important;
        height:74px!important;
        transform:translateX(-50%) rotateZ(-.7deg)!important;
      }
    }
  `;
  document.head.appendChild(style);
})();
