(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('space') !== 'parroquia') return;
  if (window.__cafassoParishSongbookRealismInstalled) return;
  window.__cafassoParishSongbookRealismInstalled = true;

  const STYLE_ID = 'cafassoParishSongbookRealismStyles';

  function install() {
    if (document.getElementById(STYLE_ID)) return true;
    const songbook = document.querySelector('.cafasso-parish-songbook');
    if (!songbook) return false;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* Cancionero físico: mismo punto de la escena, más volumen y materialidad. */
      .cafasso-parroquia .cafasso-parish-songbook{
        overflow:visible!important;
        filter:drop-shadow(0 15px 11px rgba(0,0,0,.42))!important;
        transform:perspective(720px) rotateX(7deg) rotateZ(-4deg)!important;
        transform-origin:50% 100%!important;
      }
      .cafasso-parroquia .cafasso-parish-songbook:hover{
        transform:perspective(720px) rotateX(4deg) rotateZ(-2.6deg) translateY(-3px) scale(1.018)!important;
        filter:drop-shadow(0 18px 13px rgba(0,0,0,.47)) brightness(1.025)!important;
      }
      .cafasso-parroquia .cafasso-parish-songbook:before{
        content:"";
        position:absolute;
        left:20px;
        right:13px;
        bottom:5px;
        height:15px;
        border-radius:50%;
        background:radial-gradient(ellipse at center,rgba(0,0,0,.34),rgba(0,0,0,.13) 55%,transparent 75%);
        filter:blur(3px);
        opacity:.72;
        pointer-events:none;
      }

      .cafasso-parroquia .cafasso-parish-songbook__book{
        left:12px!important;
        right:9px!important;
        top:8px!important;
        height:91px!important;
        overflow:visible!important;
        border:1px solid rgba(61,28,27,.88)!important;
        border-radius:6px 5px 8px 6px!important;
        background:
          radial-gradient(circle at 24% 17%,rgba(255,255,255,.07),transparent 22%),
          radial-gradient(circle at 76% 72%,rgba(0,0,0,.15),transparent 25%),
          repeating-linear-gradient(103deg,rgba(255,255,255,.016) 0 1px,rgba(0,0,0,.024) 1px 4px),
          linear-gradient(108deg,#4b151a 0%,#762529 25%,#5b191e 53%,#82302e 78%,#431318 100%)!important;
        box-shadow:
          inset 0 0 0 2px rgba(211,166,94,.11),
          inset 8px 0 13px rgba(255,219,166,.045),
          inset -10px 0 16px rgba(31,10,12,.28),
          0 6px 6px rgba(31,18,13,.28)!important;
      }
      .cafasso-parroquia .cafasso-parish-songbook__book:before{
        left:7px!important;
        right:7px!important;
        top:7px!important;
        bottom:7px!important;
        border:1px solid rgba(211,169,93,.38)!important;
        border-radius:4px!important;
        box-shadow:inset 0 0 0 1px rgba(255,232,177,.045)!important;
      }
      .cafasso-parroquia .cafasso-parish-songbook__book:after{
        left:7px!important;
        right:-5px!important;
        bottom:-10px!important;
        height:16px!important;
        border:1px solid rgba(105,82,54,.22)!important;
        border-top:0!important;
        border-radius:0 0 5px 5px!important;
        background:
          repeating-linear-gradient(180deg,#eadfc5 0 1px,#cbb895 1px 2px,#f4ead5 2px 4px)!important;
        box-shadow:0 4px 6px rgba(0,0,0,.24),inset -7px 0 5px rgba(102,77,47,.08)!important;
        transform:skewX(-3deg)!important;
      }

      /* Lomo y cantos, para que deje de parecer una tarjeta plana. */
      .cafasso-parroquia .cafasso-parish-songbook__spine-real{
        position:absolute;
        z-index:3;
        left:6px;
        top:12px;
        width:11px;
        height:76px;
        border-radius:7px 2px 2px 7px;
        background:linear-gradient(90deg,#2e0d11 0%,#5b1b20 35%,#7a292b 60%,#3c1116 100%);
        box-shadow:inset 2px 0 rgba(255,212,147,.06),2px 0 4px rgba(0,0,0,.18);
        pointer-events:none;
      }
      .cafasso-parroquia .cafasso-parish-songbook__spine-real:before,
      .cafasso-parroquia .cafasso-parish-songbook__spine-real:after{
        content:"";
        position:absolute;
        left:1px;
        right:1px;
        height:2px;
        background:rgba(204,157,82,.34);
        box-shadow:0 1px rgba(32,12,13,.35);
      }
      .cafasso-parroquia .cafasso-parish-songbook__spine-real:before{top:11px}
      .cafasso-parroquia .cafasso-parish-songbook__spine-real:after{bottom:11px}

      .cafasso-parroquia .cafasso-parish-songbook__page-edge-real{
        position:absolute;
        z-index:1;
        left:23px;
        right:4px;
        bottom:-8px;
        height:11px;
        border-radius:0 0 5px 4px;
        background:repeating-linear-gradient(180deg,#f3ead7 0 1px,#cdbb99 1px 2px,#e8dcc2 2px 3px);
        transform:skewX(-2deg);
        box-shadow:0 3px 4px rgba(0,0,0,.18);
        pointer-events:none;
      }

      .cafasso-parroquia .cafasso-parish-songbook__cross{
        top:16px!important;
        color:#d2ab62!important;
        font-size:19px!important;
        text-shadow:0 1px rgba(41,17,17,.75),0 0 5px rgba(218,177,97,.09)!important;
      }
      .cafasso-parroquia .cafasso-parish-songbook__title{
        top:47px!important;
        color:#f0d9a7!important;
        font:700 10px/1.05 Georgia,serif!important;
        letter-spacing:.12em!important;
        text-shadow:0 1px 2px rgba(29,10,12,.78)!important;
      }
      .cafasso-parroquia .cafasso-parish-songbook__note{
        right:16px!important;
        bottom:6px!important;
        color:rgba(243,221,175,.72)!important;
        font-size:8px!important;
      }
      .cafasso-parroquia .cafasso-parish-songbook__ribbon{
        left:42px!important;
        bottom:-17px!important;
        width:11px!important;
        height:34px!important;
        background:linear-gradient(90deg,#68151d,#a32d34 48%,#5d1119)!important;
        box-shadow:1px 3px 3px rgba(0,0,0,.22)!important;
      }

      /* Al abrirlo, la interfaz se percibe como un cancionero abierto y no como una hoja/modal. */
      .cafasso-songbook-sheet{
        width:min(940px,95vw)!important;
        border:1px solid rgba(72,39,27,.5)!important;
        border-radius:8px 16px 16px 8px!important;
        background:
          linear-gradient(90deg,rgba(89,57,31,.12) 0,transparent 4%,transparent 48.6%,rgba(84,56,32,.13) 49.7%,rgba(255,255,255,.28) 50%,rgba(82,54,31,.13) 50.3%,transparent 51.4%,transparent 96%,rgba(84,54,29,.08) 100%),
          repeating-linear-gradient(180deg,transparent 0 31px,rgba(111,79,44,.055) 31px 32px),
          linear-gradient(90deg,#ead8b5 0 3%,#f7ecd4 3% 49.8%,#f2e2c1 50.2% 97%,#dfc59a 97% 100%)!important;
        box-shadow:0 34px 90px rgba(0,0,0,.58),inset 17px 0 24px rgba(78,50,29,.09),inset -12px 0 20px rgba(78,50,29,.06)!important;
      }
      .cafasso-songbook-sheet:before{
        left:50%!important;
        top:4%!important;
        bottom:4%!important;
        width:1px!important;
        background:rgba(92,61,35,.19)!important;
        box-shadow:1px 0 rgba(255,255,255,.47)!important;
      }
      .cafasso-songbook-sheet:after{
        content:"";
        position:absolute;
        inset:10px;
        border:1px solid rgba(113,78,42,.08);
        border-radius:5px 12px 12px 5px;
        pointer-events:none;
      }
      .cafasso-songbook-player{
        background:rgba(255,250,238,.18)!important;
        border-color:rgba(111,77,42,.16)!important;
        box-shadow:inset 0 0 18px rgba(94,62,31,.025)!important;
      }

      @media(max-width:760px){
        .cafasso-parroquia .cafasso-parish-songbook__spine-real{left:4px;top:9px;width:8px;height:56px}
        .cafasso-parroquia .cafasso-parish-songbook__page-edge-real{left:17px;right:2px;bottom:-6px;height:8px}
        .cafasso-songbook-sheet{border-radius:13px 13px 0 0!important;background:linear-gradient(145deg,#f7ecd4,#ead8b5 72%,#ddc39a)!important}
        .cafasso-songbook-sheet:before{display:none!important}
      }
    `;
    document.head.appendChild(style);

    const physicalBook = songbook.querySelector('.cafasso-parish-songbook__book');
    if (physicalBook && !physicalBook.querySelector('.cafasso-parish-songbook__spine-real')) {
      const spine = document.createElement('span');
      spine.className = 'cafasso-parish-songbook__spine-real';
      spine.setAttribute('aria-hidden', 'true');
      physicalBook.appendChild(spine);

      const pages = document.createElement('span');
      pages.className = 'cafasso-parish-songbook__page-edge-real';
      pages.setAttribute('aria-hidden', 'true');
      physicalBook.appendChild(pages);
    }

    return true;
  }

  let attempts = 0;
  const wait = () => {
    if (install()) return;
    if (attempts < 40) {
      attempts += 1;
      setTimeout(wait, 80);
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wait, { once:true });
  else wait();
})();
