(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('space') !== 'escuela') return;

  const style = document.createElement('style');
  style.id = 'cafassoSchoolResumePosition';
  style.textContent = `
    .cafasso-escuela .cafasso-school-resume{
      left:52.3%!important;
      right:auto!important;
      top:42.5%!important;
      bottom:auto!important;
      width:145px!important;
      height:92px!important;
      transform:translateX(-50%) perspective(760px) rotateX(38deg) rotateZ(-2.2deg)!important;
      transform-origin:50% 100%!important;
      filter:drop-shadow(0 10px 7px rgba(0,0,0,.48))!important;
    }
    .cafasso-escuela .cafasso-school-resume:hover{
      transform:translateX(-50%) translateY(-4px) perspective(760px) rotateX(32deg) rotateZ(-1.4deg) scale(1.035)!important;
      filter:drop-shadow(0 14px 10px rgba(0,0,0,.54))!important;
    }
    .cafasso-escuela .cafasso-school-resume.is-opening{
      transform:translateX(-50%) translateY(-5px) perspective(760px) rotateX(30deg) rotateZ(-1deg) scale(1.04)!important;
      opacity:1!important;
    }
    .cafasso-escuela .cafasso-school-resume__label{
      left:22px!important;
      right:14px!important;
      top:13px!important;
      min-height:55px!important;
      padding:7px 8px 5px!important;
    }
    .cafasso-escuela .cafasso-school-resume__kicker{font-size:6px!important}
    .cafasso-escuela .cafasso-school-resume__title{margin-top:3px!important;font-size:10px!important}
    .cafasso-escuela .cafasso-school-resume__meta{margin-top:4px!important;font-size:6.5px!important}
    .cafasso-escuela .cafasso-school-resume__pencil{right:-3px!important;top:12px!important;width:7px!important;height:72px!important}

    @media(max-width:760px){
      .cafasso-escuela .cafasso-school-resume{
        left:53%!important;
        top:43%!important;
        width:105px!important;
        height:69px!important;
        transform:translateX(-50%) perspective(620px) rotateX(34deg) rotateZ(-2deg)!important;
      }
      .cafasso-escuela .cafasso-school-resume__label{left:16px!important;right:10px!important;top:10px!important;min-height:42px!important;padding:5px 6px 4px!important}
      .cafasso-escuela .cafasso-school-resume__kicker{font-size:5px!important}
      .cafasso-escuela .cafasso-school-resume__title{font-size:8px!important}
      .cafasso-escuela .cafasso-school-resume__meta{font-size:5.5px!important}
      .cafasso-escuela .cafasso-school-resume__pencil{height:54px!important;width:6px!important;top:9px!important}
    }
  `;
  document.head.appendChild(style);
})();
