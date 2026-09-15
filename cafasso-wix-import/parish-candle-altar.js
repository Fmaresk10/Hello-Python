(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('space') !== 'parroquia') return;
  if (window.__cafassoParishCandleAltarInstalled) return;
  window.__cafassoParishCandleAltarInstalled = true;

  const STYLE_ID = 'cafassoParishCandleAltarStyles';

  function install() {
    if (document.getElementById(STYLE_ID)) return true;
    const parish = document.querySelector('.cafasso-parroquia');
    if (!parish) return false;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* Vela física: apoyada sobre el lado izquierdo del altar. */
      .cafasso-parroquia .cafasso-parish-candle{
        left:39.2%!important;
        bottom:28.6%!important;
        width:92px!important;
        height:166px!important;
        overflow:visible!important;
        transform:translateX(-50%) perspective(700px) rotateX(1.6deg)!important;
        transform-origin:50% 100%!important;
        filter:drop-shadow(0 13px 8px rgba(0,0,0,.31))!important;
        transition:transform .2s ease,filter .2s ease!important;
      }
      .cafasso-parroquia .cafasso-parish-candle:hover{
        transform:translateX(-50%) perspective(700px) rotateX(1deg) translateY(-2px) scale(1.018)!important;
        filter:drop-shadow(0 15px 10px rgba(0,0,0,.34)) brightness(1.02)!important;
      }
      .cafasso-parroquia .cafasso-parish-candle:before{
        content:"";
        position:absolute;
        left:14px;
        right:14px;
        bottom:1px;
        height:12px;
        border-radius:50%;
        background:radial-gradient(ellipse at center,rgba(0,0,0,.3),rgba(0,0,0,.11) 55%,transparent 75%);
        filter:blur(2px);
        opacity:.72;
        pointer-events:none;
      }

      /* Cera marfil con volumen, desgaste y pequeña caída de cera. */
      .cafasso-parroquia .cafasso-parish-candle__wax{
        left:29px!important;
        bottom:43px!important;
        width:35px!important;
        height:80px!important;
        border:1px solid rgba(111,86,57,.28)!important;
        border-radius:10px 9px 5px 5px!important;
        background:
          radial-gradient(circle at 17% 25%,rgba(255,255,255,.7) 0 3px,transparent 8px),
          radial-gradient(circle at 82% 54%,rgba(178,145,99,.09) 0 5px,transparent 10px),
          linear-gradient(90deg,#d6c29f 0%,#eee1c5 20%,#fff7e5 47%,#f4e7ca 68%,#d7c09a 100%)!important;
        box-shadow:
          inset 4px 0 6px rgba(255,255,255,.26),
          inset -5px 0 8px rgba(93,65,32,.11),
          inset 0 -8px 13px rgba(117,82,41,.04),
          0 4px 5px rgba(31,20,11,.22)!important;
      }
      .cafasso-parroquia .cafasso-parish-candle__wax:before{
        left:3px!important;
        right:3px!important;
        top:-5px!important;
        height:11px!important;
        border-radius:50%!important;
        background:radial-gradient(ellipse at 51% 52%,#b69a76 0 10%,#eadabc 18% 38%,#c9b18d 39% 47%,#f7ecd6 50% 100%)!important;
        box-shadow:inset 0 2px 3px rgba(75,51,29,.15),0 1px rgba(255,255,255,.45)!important;
      }
      .cafasso-parroquia .cafasso-parish-candle__wax:after{
        left:16px!important;
        top:-1px!important;
        width:2px!important;
        height:10px!important;
        background:#3d2b20!important;
        box-shadow:-12px 17px 0 2px rgba(244,231,201,.72)!important;
      }
      .cafasso-parroquia .cafasso-parish-candle.is-lit .cafasso-parish-candle__wax{
        background:
          radial-gradient(circle at 50% 9%,rgba(255,226,159,.34),transparent 28%),
          linear-gradient(90deg,#d6c29f 0%,#f1e4c8 20%,#fff9e8 48%,#f5e8ca 68%,#d7c09a 100%)!important;
        box-shadow:inset 4px 0 6px rgba(255,255,255,.28),inset -5px 0 8px rgba(93,65,32,.09),0 4px 5px rgba(31,20,11,.2),0 0 18px rgba(255,190,90,.08)!important;
      }

      /* Candelero de latón envejecido: base, tallo y copa. */
      .cafasso-parroquia .cafasso-parish-candle__holder{
        left:17px!important;
        right:auto!important;
        bottom:9px!important;
        width:58px!important;
        height:17px!important;
        border:1px solid rgba(70,48,24,.42)!important;
        border-radius:50%!important;
        background:radial-gradient(ellipse at 45% 28%,#d1aa64 0 9%,#9f7740 27%,#6d502f 50%,#473421 72%,#2b2118 100%)!important;
        box-shadow:0 5px 7px rgba(0,0,0,.28),inset 0 2px rgba(255,231,171,.26),inset 0 -3px rgba(45,30,17,.22)!important;
      }
      .cafasso-parroquia .cafasso-parish-candle__holder:before{
        content:"";
        position:absolute;
        left:25px;
        top:-26px;
        width:8px;
        height:29px;
        border-radius:5px 5px 3px 3px;
        background:linear-gradient(90deg,#50391f 0%,#a57b3f 24%,#d1a85f 49%,#806034 72%,#3d2e1d 100%);
        box-shadow:inset 1px 0 rgba(255,225,159,.22),1px 1px 2px rgba(0,0,0,.2);
      }
      .cafasso-parroquia .cafasso-parish-candle__holder:after{
        content:"";
        position:absolute;
        left:11px;
        top:-33px;
        width:36px;
        height:12px;
        border:1px solid rgba(75,51,25,.38);
        border-radius:50%;
        background:radial-gradient(ellipse at 50% 31%,#d7b36d 0 15%,#9a733c 43%,#5c4328 69%,#382a1c 100%);
        box-shadow:0 3px 3px rgba(0,0,0,.2),inset 0 2px rgba(255,233,178,.25);
      }

      /* Llama pequeña, cálida y menos gráfica. */
      .cafasso-parroquia .cafasso-parish-candle__flame{
        left:35px!important;
        bottom:121px!important;
        width:22px!important;
        height:34px!important;
        border-radius:58% 42% 57% 43% / 73% 70% 30% 27%!important;
        background:radial-gradient(ellipse at 50% 70%,#fffbe8 0 14%,#ffe08a 25%,#ffb23e 47%,#ee7d22 63%,rgba(219,91,17,0) 75%)!important;
        filter:drop-shadow(0 0 5px rgba(255,213,116,.78)) drop-shadow(0 0 12px rgba(255,163,56,.28))!important;
      }
      .cafasso-parroquia .cafasso-parish-candle.is-lit .cafasso-parish-candle__flame{
        animation:cafassoCandleRealFlame 2.15s ease-in-out infinite alternate!important;
      }
      .cafasso-parroquia .cafasso-parish-candle__glow{
        left:-14px!important;
        right:-14px!important;
        top:2px!important;
        height:128px!important;
        background:radial-gradient(circle at 50% 42%,rgba(255,218,145,.21),rgba(255,174,64,.065) 43%,transparent 72%)!important;
        filter:blur(.2px);
      }
      .cafasso-parroquia .cafasso-parish-candle.is-lit .cafasso-parish-candle__glow{opacity:.9!important}

      @keyframes cafassoCandleRealFlame{
        0%{transform:scale(.98,1.02) rotate(-1.4deg) translateX(-.35px)}
        38%{transform:scale(1.01,.99) rotate(.8deg) translateX(.2px)}
        72%{transform:scale(.97,1.035) rotate(-.4deg) translateX(.45px)}
        100%{transform:scale(1.015,.985) rotate(1.1deg) translateX(-.1px)}
      }

      @media(max-width:760px){
        .cafasso-parroquia .cafasso-parish-candle{
          left:38.5%!important;
          bottom:24.7%!important;
          width:68px!important;
          height:126px!important;
        }
        .cafasso-parroquia .cafasso-parish-candle__wax{left:21px!important;bottom:34px!important;width:27px!important;height:59px!important}
        .cafasso-parroquia .cafasso-parish-candle__wax:after{left:12px!important;height:8px!important;box-shadow:-9px 13px 0 1px rgba(244,231,201,.7)!important}
        .cafasso-parroquia .cafasso-parish-candle__holder{left:12px!important;bottom:7px!important;width:44px!important;height:13px!important}
        .cafasso-parroquia .cafasso-parish-candle__holder:before{left:18px;top:-20px;width:7px;height:22px}
        .cafasso-parroquia .cafasso-parish-candle__holder:after{left:8px;top:-25px;width:28px;height:9px}
        .cafasso-parroquia .cafasso-parish-candle__flame{left:25px!important;bottom:92px!important;width:18px!important;height:28px!important}
        .cafasso-parroquia .cafasso-parish-candle__glow{left:-9px!important;right:-9px!important;top:0!important;height:96px!important}
      }

      @media(prefers-reduced-motion:reduce){
        .cafasso-parroquia .cafasso-parish-candle,
        .cafasso-parroquia .cafasso-parish-candle__flame{transition:none!important;animation:none!important}
      }
    `;
    document.head.appendChild(style);
    return true;
  }

  let attempts = 0;
  const wait = () => {
    if (install()) return;
    if (attempts < 30) {
      attempts += 1;
      setTimeout(wait, 80);
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wait, { once:true });
  else wait();
})();
