(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('space') !== 'parroquia') return;
  if (window.__cafassoParishLectionaryRealismInstalled) return;
  window.__cafassoParishLectionaryRealismInstalled = true;

  const STYLE_ID = 'cafassoParishLectionaryRealismStyles';

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-parish-lectionary.is-realistic{
        right:9.25%!important;
        bottom:11.15%!important;
        width:238px!important;
        height:162px!important;
        overflow:visible;
        filter:drop-shadow(0 18px 13px rgba(0,0,0,.46))!important;
        transform:perspective(820px) rotateX(3deg) rotateZ(1.1deg)!important;
        transform-origin:50% 100%;
        transition:transform .22s ease,filter .22s ease!important;
      }
      .cafasso-parish-lectionary.is-realistic:before{
        content:"";
        position:absolute;
        left:37px;
        right:37px;
        bottom:8px;
        height:18px;
        border-radius:50%;
        background:radial-gradient(ellipse at center,rgba(0,0,0,.38),rgba(0,0,0,.13) 54%,transparent 74%);
        filter:blur(4px);
        opacity:.78;
        pointer-events:none;
      }
      .cafasso-parish-lectionary.is-realistic:hover{
        transform:perspective(820px) rotateX(2deg) rotateZ(.65deg) translateY(-3px) scale(1.012)!important;
        filter:drop-shadow(0 21px 16px rgba(0,0,0,.5)) brightness(1.025)!important;
      }

      .cafasso-parish-cover{
        position:absolute;
        left:17px;
        right:17px;
        top:7px;
        height:119px;
        z-index:1;
        border:1px solid rgba(54,16,19,.88);
        border-radius:7px 7px 10px 10px;
        background:
          radial-gradient(circle at 28% 18%,rgba(255,255,255,.09),transparent 21%),
          radial-gradient(circle at 73% 72%,rgba(0,0,0,.16),transparent 25%),
          repeating-linear-gradient(105deg,rgba(255,255,255,.018) 0 1px,rgba(0,0,0,.025) 1px 3px),
          linear-gradient(135deg,#7c2430 0%,#571a24 42%,#42151d 72%,#2f1117 100%);
        box-shadow:
          inset 0 0 0 2px rgba(129,74,55,.24),
          inset 0 0 18px rgba(16,4,7,.34),
          0 8px 8px rgba(0,0,0,.28);
        transform:perspective(420px) rotateX(8deg);
        transform-origin:50% 100%;
      }
      .cafasso-parish-cover:before{
        content:"";
        position:absolute;
        inset:8px 10px;
        border:1px solid rgba(198,151,69,.43);
        border-radius:4px 4px 7px 7px;
        box-shadow:inset 0 0 0 1px rgba(255,226,146,.06);
      }
      .cafasso-parish-cover:after{
        content:"✝";
        position:absolute;
        left:16px;
        bottom:10px;
        color:rgba(205,165,82,.58);
        font:20px/1 Georgia,serif;
        text-shadow:0 1px rgba(255,233,175,.11),0 -1px rgba(0,0,0,.28);
        transform:rotate(-1deg);
      }

      .cafasso-parish-pageblock{
        position:absolute;
        left:25px;
        right:25px;
        top:15px;
        height:104px;
        z-index:2;
        border-radius:6px 6px 8px 8px;
        background:
          repeating-linear-gradient(180deg,#d9c89e 0 2px,#cdb98b 2px 3px,#eadcb9 3px 5px),
          #d4c092;
        box-shadow:0 4px 5px rgba(0,0,0,.22),inset 0 -2px rgba(117,83,36,.22);
        transform:perspective(420px) rotateX(9deg);
        transform-origin:50% 100%;
        clip-path:polygon(3% 7%,49% 1%,51% 1%,97% 7%,100% 92%,52% 100%,48% 100%,0 92%);
      }

      .cafasso-parish-lectionary.is-realistic .cafasso-parish-book{
        left:24px!important;
        right:24px!important;
        top:7px!important;
        height:106px!important;
        z-index:3;
        transform:perspective(460px) rotateX(8.5deg)!important;
        transform-origin:50% 100%;
        filter:drop-shadow(0 2px 2px rgba(55,35,15,.12));
      }
      .cafasso-parish-lectionary.is-realistic .cafasso-parish-page{
        overflow:hidden!important;
        border-color:rgba(105,76,41,.38)!important;
        background:
          repeating-linear-gradient(180deg,transparent 0 11px,rgba(105,77,45,.095) 11px 12px),
          radial-gradient(circle at 50% 18%,rgba(255,255,255,.34),transparent 44%),
          linear-gradient(145deg,#fff7e4 0%,#f0dfbb 68%,#dfc997 100%)!important;
        box-shadow:inset 0 0 15px rgba(83,57,27,.08),inset 0 -2px 2px rgba(106,73,31,.08)!important;
      }
      .cafasso-parish-lectionary.is-realistic .cafasso-parish-page--left{
        border-radius:7px 1px 3px 9px!important;
        transform:skewY(1.2deg)!important;
        clip-path:polygon(0 7%,100% 0,98% 100%,0 94%);
        box-shadow:inset -12px 0 16px rgba(89,59,29,.11),inset 3px 0 rgba(255,255,255,.32)!important;
      }
      .cafasso-parish-lectionary.is-realistic .cafasso-parish-page--right{
        border-radius:1px 7px 9px 3px!important;
        transform:skewY(-1.2deg)!important;
        clip-path:polygon(0 0,100% 7%,100% 94%,2% 100%);
        box-shadow:inset 12px 0 16px rgba(89,59,29,.11),inset -3px 0 rgba(255,255,255,.26)!important;
      }
      .cafasso-parish-lectionary.is-realistic .cafasso-parish-page--left:before{
        left:13px!important;
        top:13px!important;
        color:#7d543a!important;
        font-size:6.5px!important;
        letter-spacing:.18em!important;
      }
      .cafasso-parish-lectionary.is-realistic .cafasso-parish-page--left:after{
        top:37px!important;
        color:#a1773f!important;
        font-size:21px!important;
        text-shadow:0 1px rgba(255,255,255,.5);
      }
      .cafasso-parish-lectionary.is-realistic .cafasso-parish-page--right:before{
        right:13px!important;
        top:13px!important;
        color:#7d543a!important;
        font-size:6.5px!important;
        letter-spacing:.18em!important;
      }
      .cafasso-parish-lectionary.is-realistic .cafasso-parish-page--right:after{
        right:14px!important;
        bottom:13px!important;
        color:#8f6848!important;
        font-size:10px!important;
      }
      .cafasso-parish-lectionary.is-realistic .cafasso-parish-book:after{
        left:calc(50% - 2px)!important;
        top:2px!important;
        bottom:1px!important;
        width:4px!important;
        background:linear-gradient(90deg,rgba(96,64,31,.2),rgba(255,250,229,.7) 48%,rgba(95,61,29,.24))!important;
        box-shadow:0 1px rgba(255,255,255,.24)!important;
        border-radius:99px;
      }
      .cafasso-parish-book__rubric{
        position:absolute;
        z-index:4;
        width:28px;
        height:1px;
        background:rgba(151,65,49,.46);
        box-shadow:0 9px rgba(151,65,49,.18),0 18px rgba(151,65,49,.13);
        pointer-events:none;
      }
      .cafasso-parish-book__rubric--left{left:38px;top:70px;transform:rotate(.5deg)}
      .cafasso-parish-book__rubric--right{right:37px;top:57px;transform:rotate(-.4deg)}

      .cafasso-parish-ribbon{
        position:absolute;
        left:50%;
        top:91px;
        z-index:5;
        width:9px;
        height:45px;
        transform:translateX(-50%) rotate(2deg);
        transform-origin:50% 0;
        background:linear-gradient(90deg,#631623,#9a3040 46%,#57101c 100%);
        box-shadow:1px 2px 2px rgba(0,0,0,.22),inset 1px 0 rgba(255,255,255,.12);
        clip-path:polygon(0 0,100% 0,100% 83%,50% 100%,0 83%);
        pointer-events:none;
      }

      .cafasso-parish-lectionary.is-realistic .cafasso-parish-stand{
        left:47px!important;
        right:47px!important;
        bottom:5px!important;
        height:43px!important;
        z-index:0;
        overflow:visible;
        border-radius:5px 5px 11px 11px!important;
        background:
          repeating-linear-gradient(88deg,rgba(255,255,255,.035) 0 1px,rgba(0,0,0,.025) 1px 5px),
          linear-gradient(90deg,#2d1b12 0%,#5e3b27 18%,#8a5e3c 48%,#68452e 76%,#2b1b13 100%)!important;
        box-shadow:0 9px 11px rgba(0,0,0,.34),inset 0 2px rgba(240,202,140,.1),inset 0 -4px rgba(34,18,10,.18)!important;
        clip-path:polygon(10% 0,90% 0,100% 100%,0 100%)!important;
      }
      .cafasso-parish-lectionary.is-realistic .cafasso-parish-stand:before{
        content:"";
        position:absolute;
        left:5%;
        right:5%;
        top:-4px;
        height:8px;
        border-radius:4px;
        background:linear-gradient(#9a714c,#51351f);
        box-shadow:0 3px 4px rgba(0,0,0,.24),inset 0 1px rgba(255,225,171,.22);
      }
      .cafasso-parish-lectionary.is-realistic .cafasso-parish-stand:after{
        left:18%!important;
        right:18%!important;
        top:7px!important;
        height:2px!important;
        background:rgba(236,198,132,.22)!important;
      }

      @media(max-width:680px){
        .cafasso-parish-lectionary.is-realistic{
          right:3.6%!important;
          bottom:10.1%!important;
          width:166px!important;
          height:116px!important;
        }
        .cafasso-parish-lectionary.is-realistic:before{left:27px;right:27px;bottom:5px;height:13px;filter:blur(3px)}
        .cafasso-parish-cover{left:12px;right:12px;top:5px;height:85px;border-radius:5px 5px 7px 7px}
        .cafasso-parish-cover:before{inset:6px 7px}.cafasso-parish-cover:after{left:11px;bottom:7px;font-size:14px}
        .cafasso-parish-pageblock{left:18px;right:18px;top:10px;height:75px}
        .cafasso-parish-lectionary.is-realistic .cafasso-parish-book{left:17px!important;right:17px!important;top:5px!important;height:76px!important}
        .cafasso-parish-book__rubric{width:20px}.cafasso-parish-book__rubric--left{left:27px;top:50px}.cafasso-parish-book__rubric--right{right:26px;top:41px}
        .cafasso-parish-ribbon{top:65px;width:6px;height:33px}
        .cafasso-parish-lectionary.is-realistic .cafasso-parish-stand{left:33px!important;right:33px!important;bottom:4px!important;height:31px!important}
      }
      @media(prefers-reduced-motion:reduce){
        .cafasso-parish-lectionary.is-realistic{transition:none!important}
      }
    `;
    document.head.appendChild(style);
  }

  function enhance() {
    const lectionary = document.querySelector('.cafasso-parish-lectionary');
    if (!lectionary || lectionary.dataset.realisticLectionary === '1') return false;
    const book = lectionary.querySelector('.cafasso-parish-book');
    if (!book) return false;

    ensureStyles();
    lectionary.dataset.realisticLectionary = '1';
    lectionary.classList.add('is-realistic');

    const cover = document.createElement('span');
    cover.className = 'cafasso-parish-cover';
    cover.setAttribute('aria-hidden', 'true');

    const pageBlock = document.createElement('span');
    pageBlock.className = 'cafasso-parish-pageblock';
    pageBlock.setAttribute('aria-hidden', 'true');

    const ribbon = document.createElement('span');
    ribbon.className = 'cafasso-parish-ribbon';
    ribbon.setAttribute('aria-hidden', 'true');

    const rubricLeft = document.createElement('span');
    rubricLeft.className = 'cafasso-parish-book__rubric cafasso-parish-book__rubric--left';
    rubricLeft.setAttribute('aria-hidden', 'true');

    const rubricRight = document.createElement('span');
    rubricRight.className = 'cafasso-parish-book__rubric cafasso-parish-book__rubric--right';
    rubricRight.setAttribute('aria-hidden', 'true');

    lectionary.insertBefore(cover, book);
    lectionary.insertBefore(pageBlock, book);
    lectionary.appendChild(ribbon);
    lectionary.appendChild(rubricLeft);
    lectionary.appendChild(rubricRight);
    return true;
  }

  let attempts = 0;
  function waitForLectionary() {
    if (enhance()) return;
    if (attempts < 50) {
      attempts += 1;
      setTimeout(waitForLectionary, 80);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', waitForLectionary, { once:true });
  else waitForLectionary();
})();
