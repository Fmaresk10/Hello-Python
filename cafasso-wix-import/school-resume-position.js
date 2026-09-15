(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('space') !== 'escuela') return;

  const style = document.createElement('style');
  style.id = 'cafassoSchoolResumePosition';
  style.textContent = `
    .cafasso-escuela .cafasso-school-resume{
      left:52.3%!important;
      right:auto!important;
      top:35.2%!important;
      bottom:auto!important;
      width:145px!important;
      height:92px!important;
      transform:translateX(-50%) rotateZ(-.7deg)!important;
      transform-origin:50% 100%!important;
      filter:drop-shadow(0 10px 7px rgba(0,0,0,.5))!important;
      -webkit-font-smoothing:auto!important;
      text-rendering:optimizeLegibility!important;
    }
    .cafasso-escuela .cafasso-school-resume:hover{
      transform:translateX(-50%) translateY(-4px) rotateZ(-.4deg)!important;
      filter:drop-shadow(0 14px 10px rgba(0,0,0,.56))!important;
    }
    .cafasso-escuela .cafasso-school-resume.is-opening{
      transform:translateX(-50%) translateY(-5px) rotateZ(-.25deg)!important;
      opacity:1!important;
    }
    .cafasso-escuela .cafasso-school-resume__label{
      left:20px!important;
      right:12px!important;
      top:12px!important;
      min-height:59px!important;
      padding:7px 8px 6px!important;
      background:linear-gradient(145deg,#fff8e7,#ead8b3)!important;
      border:1px solid #8d6a46!important;
      box-shadow:0 2px 3px rgba(35,19,12,.22),inset 0 0 0 1px rgba(255,255,255,.58)!important;
      transform:none!important;
      opacity:1!important;
    }
    .cafasso-escuela .cafasso-school-resume__kicker{
      color:#70482f!important;
      font-family:Arial,Inter,system-ui,sans-serif!important;
      font-size:7px!important;
      font-weight:900!important;
      line-height:1!important;
      letter-spacing:.08em!important;
      text-shadow:none!important;
    }
    .cafasso-escuela .cafasso-school-resume__title{
      margin-top:4px!important;
      color:#211914!important;
      font-family:Arial,Inter,system-ui,sans-serif!important;
      font-size:11.5px!important;
      font-weight:900!important;
      line-height:1.05!important;
      letter-spacing:-.01em!important;
      text-shadow:none!important;
    }
    .cafasso-escuela .cafasso-school-resume__meta{
      margin-top:5px!important;
      color:#563921!important;
      font-family:Arial,Inter,system-ui,sans-serif!important;
      font-size:7.4px!important;
      font-weight:800!important;
      line-height:1.12!important;
      letter-spacing:0!important;
      text-shadow:none!important;
    }
    .cafasso-escuela .cafasso-school-resume__pencil{right:-3px!important;top:12px!important;width:7px!important;height:72px!important}

    @media(max-width:760px){
      .cafasso-escuela .cafasso-school-resume{
        left:53%!important;
        top:36%!important;
        width:105px!important;
        height:69px!important;
        transform:translateX(-50%) rotateZ(-.6deg)!important;
      }
      .cafasso-escuela .cafasso-school-resume__label{left:15px!important;right:8px!important;top:9px!important;min-height:44px!important;padding:5px 6px 4px!important}
      .cafasso-escuela .cafasso-school-resume__kicker{font-size:5.7px!important}
      .cafasso-escuela .cafasso-school-resume__title{margin-top:3px!important;font-size:8.6px!important}
      .cafasso-escuela .cafasso-school-resume__meta{margin-top:3px!important;font-size:5.9px!important}
      .cafasso-escuela .cafasso-school-resume__pencil{height:54px!important;width:6px!important;top:9px!important}
    }
  `;
  document.head.appendChild(style);
})();
