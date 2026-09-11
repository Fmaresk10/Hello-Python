(() => {
  if (window.__cafassoGamifiedCourseInstalled) return;
  window.__cafassoGamifiedCourseInstalled = true;

  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (page !== 'index.html') return;

  const STYLE_ID = 'cafassoGamifiedCourseStylesV3';
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  let pendingBlockCompletion = false;
  let celebrationRunning = false;
  let autoCompletingModule = '';

  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[char]));

  function styles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cafasso-stage-path{display:grid;gap:11px;margin:0 0 24px}
      .cafasso-stage-path .cafasso-stage-kicker{font-size:10px;font-weight:850;letter-spacing:.14em;text-transform:uppercase;color:#A37C27;margin-bottom:2px}
      .cafasso-stage-path .cafasso-stage-badge{display:inline-flex;align-items:center;gap:8px;width:max-content;background:#FFF7D7;border:1px solid rgba(200,155,49,.3);border-radius:999px;padding:7px 11px;color:#6D5200;font-size:11px;font-weight:850}
      .cafasso-stage-path .cafasso-stage-badge span{font-size:16px}
      .cafasso-course-map{position:relative;min-height:calc(100vh - 205px);margin:0 -4px 24px;padding:28px;border-radius:28px;overflow:hidden;background:#173B3B center/cover no-repeat;box-shadow:0 22px 55px rgba(10,36,45,.23);border:1px solid rgba(244,216,137,.58)}
      .cafasso-course-map:after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(6,28,35,.08),rgba(6,28,35,.18) 55%,rgba(6,28,35,.38));pointer-events:none}
      .cafasso-next-module{position:absolute;z-index:4;right:28px;bottom:26px;padding:10px 14px;border:1px solid rgba(244,216,137,.7);border-radius:999px;background:rgba(23,48,47,.72);backdrop-filter:blur(8px);color:#FFF4C7;font:750 11px Inter,system-ui;letter-spacing:.01em;cursor:pointer;box-shadow:0 6px 16px rgba(10,26,27,.24);transition:transform .18s ease,background .18s ease}.cafasso-next-module:hover{background:rgba(241,200,91,.92);color:#17302F;transform:translateY(-2px)}
      .cafasso-course-map-head{position:relative;z-index:2;display:flex;justify-content:space-between;align-items:flex-start;gap:18px;color:#FFF9E8;text-shadow:0 2px 12px rgba(0,0,0,.4)}
      .cafasso-course-map-kicker{font-size:10px;font-weight:850;letter-spacing:.16em;text-transform:uppercase;color:#F4D889;margin-bottom:6px}
      .cafasso-course-map-title{font:400 35px/1.05 Georgia,serif;margin:0}.cafasso-course-map-copy{max-width:460px;margin:8px 0 0;color:#F0F5EC;font-size:13px;line-height:1.45}
      .cafasso-course-map-badge{display:inline-flex;align-items:center;gap:8px;padding:9px 12px;background:rgba(10,34,39,.65);border:1px solid rgba(244,216,137,.56);border-radius:999px;color:#FFF9E8;font-size:11px;font-weight:850;white-space:nowrap}
      .cafasso-map-stations{position:absolute;inset:0;z-index:3}.cafasso-map-station{position:absolute;transform:translate(-50%,-50%);width:164px;min-height:76px;border:1px solid rgba(115,77,39,.52);background:linear-gradient(145deg,#F4E6C8,#D9BE8D);border-radius:8px 8px 5px 5px;padding:10px 10px 9px;color:#3B2B1E;cursor:pointer;box-shadow:0 9px 18px rgba(47,29,15,.3),inset 0 1px rgba(255,255,255,.55);text-align:left}.cafasso-map-station:hover{transform:translate(-50%,-53%);border-color:#A47738}.cafasso-map-station i{display:grid;place-items:center;width:30px;height:30px;margin:-25px 0 5px;border-radius:50%;background:#2B5A50;border:2px solid #F4D889;color:#FFF9E8;font-style:normal;font-size:15px;box-shadow:0 3px 8px rgba(35,35,20,.25)}.cafasso-map-station strong{display:block;font:850 11px/1.15 Inter,system-ui;letter-spacing:.01em}.cafasso-map-station small{display:block;margin-top:4px;color:#6B5137;font-size:9px;line-height:1.25}.cafasso-map-station.active{background:linear-gradient(145deg,#FFE6A0,#D9A83E);border-color:#FFF1BE;color:#2B2619;box-shadow:0 0 0 5px rgba(244,216,137,.3),0 12px 28px rgba(47,29,15,.34)}.cafasso-map-station.active i{background:#17302F;color:#FFF9E8}.cafasso-map-station.active small{color:#554429}.cafasso-map-station.done{background:linear-gradient(145deg,#D6E8D8,#9FC5A7);border-color:#F1F8E9}.cafasso-map-station.done i{background:#2E7D59}.cafasso-map-station.locked{opacity:.72;filter:saturate(.55);cursor:not-allowed}.cafasso-map-station:nth-child(1){left:18%;top:76%}.cafasso-map-station:nth-child(2){left:40%;top:63%}.cafasso-map-station:nth-child(3){left:57%;top:39%}.cafasso-map-station:nth-child(4){left:72%;top:58%}.cafasso-map-station:nth-child(5){left:86%;top:31%}
      body.cafasso-journey-mode{background:#102F35;overflow-x:hidden}body.cafasso-journey-mode .shell{display:block;min-height:100vh}body.cafasso-journey-mode main{max-width:none;width:100%;min-height:100vh;padding:0}body.cafasso-journey-mode main>.top,body.cafasso-journey-mode main>.backline,body.cafasso-journey-mode .cafasso-course-map~*{display:none!important}body.cafasso-journey-mode .side{position:fixed;z-index:20;left:0;top:0;width:230px;height:100vh;padding:27px 16px;background:linear-gradient(90deg,rgba(6,27,33,.86),rgba(6,27,33,.35),transparent);box-shadow:none}body.cafasso-journey-mode .side .brand{opacity:.92;margin-bottom:36px}body.cafasso-journey-mode .side .nav{gap:7px;margin-top:0}body.cafasso-journey-mode .side .nav button:not([data-view="inicio"]){display:none!important}body.cafasso-journey-mode .side .nav button{background:rgba(8,35,39,.42);border:1px solid rgba(244,216,137,.18);backdrop-filter:blur(8px);color:#FFF9E8;text-shadow:0 1px 8px rgba(0,0,0,.4)}body.cafasso-journey-mode .side .nav button.active,body.cafasso-journey-mode .side .nav button:hover{background:rgba(244,216,137,.9);border-color:#FFF0B4;color:#17302F;text-shadow:none}body.cafasso-journey-mode .side .foot{display:none!important}body.cafasso-journey-mode .cafasso-course-map{min-height:100vh;margin:0;border:0;border-radius:0;box-shadow:none;padding:42px 6vw 35px}body.cafasso-journey-mode .cafasso-course-map-head{padding-left:190px}
      body.cafasso-mission-mode{background:#102F35 url('https://static.wixstatic.com/media/47bf07_0d0a5e3ec41543cbb9d6171058171b28~mv2.png') center/cover fixed no-repeat;overflow-x:hidden}body.cafasso-mission-mode .shell{display:block;min-height:100vh}body.cafasso-mission-mode main{max-width:none;width:100%;min-height:100vh;padding:0}body.cafasso-mission-mode main>.top,body.cafasso-mission-mode main>.backline{display:none!important}body.cafasso-mission-mode .side{position:fixed;z-index:20;left:0;top:0;width:230px;height:100vh;padding:27px 16px;background:linear-gradient(90deg,rgba(6,27,33,.86),rgba(6,27,33,.35),transparent);box-shadow:none}body.cafasso-mission-mode .side .brand{opacity:.92;margin-bottom:36px}body.cafasso-mission-mode .side .nav{gap:7px;margin-top:0}body.cafasso-mission-mode .side .nav button:not([data-view="inicio"]){display:none!important}body.cafasso-mission-mode .side .nav button{background:rgba(8,35,39,.42);border:1px solid rgba(244,216,137,.18);backdrop-filter:blur(8px);color:#FFF9E8}body.cafasso-mission-mode .side .nav button.active,body.cafasso-mission-mode .side .nav button:hover{background:rgba(244,216,137,.9);border-color:#FFF0B4;color:#17302F}body.cafasso-mission-mode .side .foot{display:none!important}body.cafasso-mission-mode .module-detail{max-width:none;padding:34px 7vw 60px 250px}body.cafasso-mission-mode .module-detail>section.card:first-of-type{display:none}body.cafasso-mission-mode .module-progress{background:rgba(8,35,39,.78);border:1px solid rgba(244,216,137,.42);border-radius:15px;color:#FFF9E8;box-shadow:0 8px 20px rgba(0,0,0,.2)}body.cafasso-mission-mode .module-progress small{color:#D5E4D8!important}body.cafasso-mission-mode article.block{background:linear-gradient(145deg,rgba(250,238,210,.97),rgba(220,194,148,.96));border:1px solid rgba(115,77,39,.48);border-radius:9px 9px 5px 5px;box-shadow:0 10px 24px rgba(47,29,15,.27),inset 0 1px rgba(255,255,255,.6);padding:20px 22px}body.cafasso-mission-mode article.block .block-type{color:#876020}body.cafasso-mission-mode article.block h4{color:#3B2B1E;font-family:Georgia,serif}body.cafasso-mission-mode article.block .block-text{color:#493A2B}body.cafasso-mission-mode article.block .activity{background:rgba(255,249,232,.66);border:1px solid rgba(115,77,39,.2)}body.cafasso-mission-mode .complete-box{background:rgba(8,35,39,.84);border-color:rgba(244,216,137,.5);color:#FFF9E8}body.cafasso-mission-mode .complete-box p{color:#D5E4D8}
      .cafasso-mission-shell{position:relative;overflow:hidden;margin:0 0 18px;padding:22px;border-radius:24px;background:radial-gradient(circle at 78% 12%,rgba(255,210,105,.24),transparent 22%),linear-gradient(145deg,#0D2A37 0%,#163F43 48%,#245A4B 100%);border:1px solid rgba(230,194,101,.5);box-shadow:0 18px 42px rgba(10,36,45,.2)}
      .cafasso-mission-shell:after{content:'';position:absolute;inset:auto -10% -56% 20%;height:70%;border-radius:50%;background:rgba(228,190,89,.08);transform:rotate(-9deg);pointer-events:none}
      .cafasso-mission-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:15px}
      .cafasso-mission-kicker{font-size:9px;font-weight:850;letter-spacing:.14em;text-transform:uppercase;color:#F4D889;margin-bottom:5px}
      .cafasso-mission-title{font:400 27px/1.1 Georgia,serif;color:#FFF9E8;margin:0}
      .cafasso-mission-objective{margin:6px 0 0;color:#DDE9DF;font-size:12px;line-height:1.45}
      .cafasso-mission-prompt{margin:14px 0 17px;padding:12px 14px;border-radius:13px;background:rgba(4,26,32,.34);border:1px solid rgba(235,209,132,.28);color:#E8F0E6;font-size:11px;line-height:1.45}
      .cafasso-mission-prompt strong{display:block;color:#F4D889;margin-bottom:3px;font-size:10px;letter-spacing:.08em;text-transform:uppercase}
      .cafasso-mission-time{white-space:nowrap;color:#F4D889;font-size:11px;font-weight:800}
      .cafasso-mission-nav{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;position:relative}
      .cafasso-mission-nav:before{content:'';position:absolute;left:7%;right:7%;top:20px;height:3px;background:linear-gradient(90deg,rgba(244,216,137,.85),rgba(244,216,137,.18));z-index:0;border-radius:99px;box-shadow:0 0 12px rgba(244,216,137,.25)}
      .cafasso-mission-node{position:relative;z-index:1;display:grid;justify-items:center;gap:5px;border:1px solid rgba(244,216,137,.36);background:rgba(7,33,40,.64);border-radius:15px;padding:9px 5px;color:#E7EFE5;font:800 10px/1.15 Inter,system-ui;cursor:pointer;min-height:70px;box-shadow:0 6px 15px rgba(0,0,0,.12)}
      .cafasso-mission-node:hover{border-color:#F4D889;color:#FFF9E8;transform:translateY(-2px)}
      .cafasso-mission-node.active{background:#F1C85B;border-color:#FFE5A1;color:#17302F;box-shadow:0 0 0 4px rgba(244,216,137,.18),0 8px 18px rgba(0,0,0,.2)}
      .cafasso-mission-node.done{background:#2E7D59;border-color:#B9DEC8;color:#fff}
      .cafasso-mission-node.locked{opacity:.52;cursor:not-allowed}
      .cafasso-mission-node i{font-style:normal;font-size:19px;line-height:1}
      .cafasso-mission-next{margin:0 0 18px;padding:13px 15px;border:1px solid #D9E7DE;border-radius:14px;background:#F3FAF5;color:#245F48;font-size:12px;line-height:1.45}
      .cafasso-mission-next strong{display:block;margin-bottom:3px}
      .cafasso-ruah-inline{display:flex;align-items:center;gap:9px;margin-top:13px;padding-top:12px;border-top:1px solid rgba(244,216,137,.26);color:#F4D889;font-size:11px;position:relative;z-index:1}
      .cafasso-ruah-inline b{font-size:12px;color:#FFF9E8}
      body.cafasso-mission-mode .complete-box{display:none}
      .cafasso-celebration{position:fixed;inset:0;z-index:200;display:grid;place-items:center;background:rgba(5,25,30,.34);pointer-events:none;animation:cafassoCelebrationIn .2s ease-out both}
      .cafasso-celebration-card{padding:24px 30px;text-align:center;border:1px solid rgba(255,235,165,.8);border-radius:22px;background:linear-gradient(145deg,#123C43,#22634F);color:#FFF9E8;box-shadow:0 18px 60px rgba(0,0,0,.35);animation:cafassoCelebrationPop .45s cubic-bezier(.2,.8,.2,1) both}
      .cafasso-celebration-card strong{display:block;font:400 30px/1.1 Georgia,serif;color:#FFE39A}.cafasso-celebration-card span{display:block;margin-top:8px;color:#E1F0E2;font-size:13px;font-weight:800}.cafasso-celebration-card .cafasso-unlock-title{margin-top:17px;font:850 18px/1.2 Inter,system-ui;color:#FFF4B0}.cafasso-celebration-card .cafasso-unlock-copy{font-size:11px;color:#D5E9D8}
      .cafasso-confetti{position:fixed;left:50%;top:46%;width:10px;height:16px;border-radius:2px;transform:translate(-50%,-50%);animation:cafassoConfetti 1.9s cubic-bezier(.12,.72,.25,1) forwards;animation-delay:var(--delay);background:var(--color);opacity:0}
      .cafasso-world-return{position:fixed;z-index:100;left:auto;right:24px;top:20px;appearance:none;border:1px solid rgba(244,216,137,.55);background:rgba(8,35,39,.82);backdrop-filter:blur(10px);color:#FFF9E8;border-radius:999px;padding:10px 15px;font:850 11px Inter,system-ui;cursor:pointer;box-shadow:0 8px 22px rgba(0,0,0,.24)}.cafasso-world-return:hover{background:#F1C85B;color:#17302F}.cafasso-journey-mode .cafasso-course-map{background-image:url('https://static.wixstatic.com/media/47bf07_0d0a5e3ec41543cbb9d6171058171b28~mv2.png')!important}.cafasso-mission-mode{background-image:url('https://static.wixstatic.com/media/47bf07_0d0a5e3ec41543cbb9d6171058171b28~mv2.png')!important}
      body.cafasso-courses-mode{background:#102F35 url('https://static.wixstatic.com/media/47bf07_0d0a5e3ec41543cbb9d6171058171b28~mv2.png') center/cover fixed no-repeat!important;overflow-x:hidden}body.cafasso-courses-mode .shell{display:block;min-height:100vh}body.cafasso-courses-mode main{max-width:none;width:100%;min-height:100vh;padding:38px 7vw 58px;background:linear-gradient(180deg,rgba(5,27,32,.12),rgba(5,27,32,.36))}body.cafasso-courses-mode .side,body.cafasso-courses-mode .mobilebar,body.cafasso-courses-mode .mobile-nav,body.cafasso-courses-mode .mobile-head{display:none!important}body.cafasso-courses-mode .top{max-width:1100px;margin:0 auto 18px;color:#FFF9E8}body.cafasso-courses-mode .top h1{font:400 42px/1 Georgia,serif;color:#FFF9E8;text-shadow:0 2px 12px rgba(0,0,0,.45)}body.cafasso-courses-mode .top p{color:#DDE9DF}body.cafasso-courses-mode .top .pill{background:rgba(8,35,39,.7);border-color:rgba(244,216,137,.42);color:#FFF9E8}body.cafasso-courses-mode .courses{max-width:1100px;margin:0 auto;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px}body.cafasso-courses-mode .card.course{position:relative;overflow:hidden;background:linear-gradient(145deg,rgba(250,238,210,.97),rgba(220,194,148,.96));border:1px solid rgba(115,77,39,.5);border-radius:10px 10px 5px 5px;box-shadow:0 12px 26px rgba(47,29,15,.3),inset 0 1px rgba(255,255,255,.6);color:#3B2B1E}body.cafasso-courses-mode .card.course:before{content:'◇  ESCUELA';display:block;color:#876020;font:850 9px Inter,system-ui;letter-spacing:.14em;margin-bottom:14px}body.cafasso-courses-mode .card.course h4{color:#3B2B1E;font:400 23px/1.1 Georgia,serif}body.cafasso-courses-mode .card.course p,body.cafasso-courses-mode .card.course small{color:#6B5137}body.cafasso-courses-mode .card.course .mini{background:rgba(107,81,55,.18)}body.cafasso-courses-mode .card.course .mini span{background:#2E7D59}body.cafasso-courses-mode .card.course .btn{background:#17302F;color:#FFF9E8;border-radius:999px}body.cafasso-courses-mode .card.course .badge{background:#2E7D59;color:#fff}body.cafasso-courses-mode .card.empty{max-width:1100px;margin:auto;background:rgba(8,35,39,.82);border-color:rgba(244,216,137,.42);color:#FFF9E8}
      body.cafasso-journey-mode .side .brand,body.cafasso-mission-mode .side .brand{display:grid;grid-template-columns:54px minmax(0,1fr);gap:10px 12px;align-items:center;padding:0 4px}body.cafasso-journey-mode .side .brand img,body.cafasso-mission-mode .side .brand img{width:54px;height:64px;object-fit:contain}body.cafasso-journey-mode .side .brand b,body.cafasso-mission-mode .side .brand b{font-size:27px;line-height:1;color:#FFF9E8}body.cafasso-journey-mode .side .brand small,body.cafasso-mission-mode .side .brand small{display:none}body.cafasso-journey-mode .side .brand:after,body.cafasso-mission-mode .side .brand:after{content:'EDUCAR  ·  TRANSFORMAR  ·  ACOMPAÑAR';grid-column:1/-1;color:#F4D889;font:850 8px/1.5 Inter,system-ui;letter-spacing:.11em;text-align:center;white-space:nowrap}
      @keyframes cafassoCelebrationIn{from{opacity:0}to{opacity:1}}@keyframes cafassoCelebrationPop{from{transform:scale(.72) translateY(12px);opacity:0}to{transform:scale(1) translateY(0);opacity:1}}@keyframes cafassoConfetti{0%{opacity:1;transform:translate(-50%,-50%) rotate(0deg)}100%{opacity:0;transform:translate(calc(-50% + var(--x)),calc(-50% + var(--y))) rotate(var(--r))}}
      @media(max-width:680px){body.cafasso-journey-mode main,body.cafasso-mission-mode main{padding:0}body.cafasso-journey-mode .side .nav button:not([data-view="inicio"]),body.cafasso-mission-mode .side .nav button:not([data-view="inicio"]),body.cafasso-journey-mode .mobilebar button:not([data-view="inicio"]),body.cafasso-mission-mode .mobilebar button:not([data-view="inicio"]),body.cafasso-journey-mode .mobile-nav button:not([data-view="inicio"]),body.cafasso-mission-mode .mobile-nav button:not([data-view="inicio"]){display:none!important}body.cafasso-journey-mode .mobilebar,body.cafasso-mission-mode .mobilebar,body.cafasso-journey-mode .mobile-nav,body.cafasso-mission-mode .mobile-nav{grid-template-columns:1fr!important}body.cafasso-journey-mode .cafasso-course-map{min-height:100svh;padding:24px 14px 20px}body.cafasso-journey-mode .cafasso-course-map-head{padding-left:0;display:block}.cafasso-course-map-title{font-size:29px}.cafasso-course-map-copy{font-size:12px;max-width:300px}.cafasso-course-map-badge{margin-top:12px}.cafasso-map-station{width:132px;min-height:64px;padding:8px;font-size:10px}.cafasso-map-station:nth-child(1){left:22%;top:75%}.cafasso-map-station:nth-child(2){left:42%;top:64%}.cafasso-map-station:nth-child(3){left:59%;top:42%}.cafasso-map-station:nth-child(4){left:73%;top:58%}.cafasso-map-station:nth-child(5){left:84%;top:30%}body.cafasso-mission-mode .module-detail{padding:18px 14px 34px}body.cafasso-mission-mode .cafasso-mission-shell{border-radius:18px;padding:18px 14px}body.cafasso-mission-mode article.block{padding:16px 14px}}
      .cafasso-home-ruah{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:12px;padding:14px 17px;border-radius:17px;background:linear-gradient(110deg,#E8F2ED,#F7F5E9);border:1px solid rgba(46,125,89,.18);color:#173954}
      .cafasso-home-ruah-main{display:flex;align-items:center;gap:11px}.cafasso-home-ruah-icon{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:#2E7D59;color:#fff;font:700 18px Georgia,serif}.cafasso-home-ruah-label{font:850 10px/1.2 Inter,system-ui;letter-spacing:.12em;text-transform:uppercase;color:#2E7D59}.cafasso-home-ruah-total{font:400 24px/1 Georgia,serif;color:#173954;margin-top:3px}.cafasso-home-ruah-note{font-size:11px;line-height:1.4;color:#527064;text-align:right;max-width:250px}.cafasso-home-ruah-note strong{display:block;color:#245F48;margin-bottom:3px}@media(max-width:680px){.cafasso-mission-head{display:block}.cafasso-mission-time{display:block;margin-top:8px}.cafasso-mission-nav{grid-template-columns:repeat(5,minmax(54px,1fr));overflow-x:auto;padding-bottom:4px}.cafasso-mission-node{font-size:9px}.cafasso-home-ruah{align-items:flex-start;flex-direction:column}.cafasso-home-ruah-note{text-align:left;max-width:none}}
      /* Modo escena: la misión ocupa el paisaje y el contenido se integra como un objeto del camino. */
      body.cafasso-mission-mode{background:#102F35 url('https://static.wixstatic.com/media/47bf07_0d0a5e3ec41543cbb9d6171058171b28~mv2.png') center/cover fixed no-repeat!important}
      body.cafasso-mission-mode{padding-top:0!important}
      body.cafasso-mission-mode #cafasso-role-preview-bar,body.cafasso-mission-mode .side,body.cafasso-mission-mode .mobilebar,body.cafasso-mission-mode .mobile-nav,body.cafasso-mission-mode .mobile-head,body.cafasso-mission-mode .top,body.cafasso-mission-mode .backline,body.cafasso-mission-mode #cafassoWorldReturn,body.cafasso-mission-mode .module-detail>section.card{display:none!important}
      body.cafasso-mission-mode .module-detail{padding:0 5vw 70px;max-width:none!important}
      body.cafasso-mission-mode .module-detail>article.block,body.cafasso-mission-mode .module-detail>.complete-box{visibility:hidden!important}
      body.cafasso-mission-mode .module-detail>.cafasso-mission-shell,body.cafasso-mission-mode .cafasso-mission-stage article.block{visibility:visible!important}
      body.cafasso-mission-mode .module-progress{display:none!important}
      body.cafasso-mission-mode .module-progress{position:relative;z-index:12;max-width:720px;margin:16px auto 0!important;background:rgba(8,35,39,.72);backdrop-filter:blur(12px);border-radius:999px;padding:9px 14px!important;font-size:11px}
      body.cafasso-mission-mode .cafasso-mission-shell{min-height:calc(100vh - 20px);margin:0 -5vw 24px;padding:38px 8vw 56px;border:0;border-radius:0;background:linear-gradient(180deg,rgba(5,27,32,.22),rgba(5,27,32,.68)),url('https://static.wixstatic.com/media/47bf07_0d0a5e3ec41543cbb9d6171058171b28~mv2.png') center/cover fixed;box-shadow:none}
      body.cafasso-mission-mode .cafasso-mission-head{max-width:820px;margin:0 auto 22px;align-items:end}
      .cafasso-scene-back{display:inline-flex;align-items:center;gap:7px;margin:0 0 24px;border:1px solid rgba(244,216,137,.52);border-radius:999px;background:rgba(8,35,39,.64);backdrop-filter:blur(10px);color:#FFF9E8;padding:9px 13px;font:850 11px Inter,system-ui;cursor:pointer;box-shadow:0 5px 15px rgba(0,0,0,.22)}
      .cafasso-scene-back:hover{background:#F1C85B;color:#17302F}
      body.cafasso-mission-mode .cafasso-mission-title{font-size:clamp(31px,4vw,52px);text-shadow:0 3px 18px rgba(0,0,0,.42)}
      body.cafasso-mission-mode .cafasso-mission-objective{max-width:620px;font-size:14px}
      body.cafasso-mission-mode .cafasso-mission-prompt{max-width:720px;margin:18px auto 22px;background:rgba(7,33,40,.58);backdrop-filter:blur(10px);font-size:13px}
      body.cafasso-mission-mode .cafasso-mission-nav{max-width:820px;margin:0 auto;grid-template-columns:repeat(5,minmax(58px,1fr));gap:14px}
      body.cafasso-mission-mode .cafasso-mission-nav:before{top:17px;left:8%;right:8%;height:2px}
      body.cafasso-mission-mode .cafasso-mission-node{min-height:42px;padding:4px;border:0;background:transparent;box-shadow:none;border-radius:50%;font-size:0}
      body.cafasso-mission-mode .cafasso-mission-node i{width:32px;height:32px;display:grid;place-items:center;border-radius:50%;background:rgba(8,35,39,.82);border:1px solid rgba(244,216,137,.64);font-size:15px;box-shadow:0 4px 12px rgba(0,0,0,.3)}
      body.cafasso-mission-mode .cafasso-mission-node span{display:block;margin-top:2px;color:#FFF9E8;font-size:10px;line-height:1.1;text-shadow:0 1px 7px rgba(0,0,0,.8)}
      body.cafasso-mission-mode .cafasso-mission-node.active i{background:#F1C85B;color:#17302F;box-shadow:0 0 0 5px rgba(244,216,137,.22),0 5px 15px rgba(0,0,0,.34)}
      body.cafasso-mission-mode .cafasso-mission-node.done i{background:#2E7D59;border-color:#B9DEC8}
      .cafasso-mission-stage{max-width:820px;margin:27px auto 0;position:relative;z-index:2}
      .cafasso-scene-marker{display:flex;align-items:center;gap:9px;width:max-content;margin:0 auto 9px;color:#FFF9E8;text-shadow:0 1px 8px rgba(0,0,0,.6);font:850 10px Inter,system-ui;letter-spacing:.12em;text-transform:uppercase}
      .cafasso-scene-marker span{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#F1C85B;color:#17302F;font-size:16px;box-shadow:0 3px 10px rgba(0,0,0,.3)}
      body.cafasso-mission-mode .cafasso-mission-stage article.block{margin:0 auto 20px;max-width:760px;background:linear-gradient(145deg,rgba(255,249,232,.96),rgba(235,219,183,.94));border:1px solid rgba(244,216,137,.72);border-radius:16px;box-shadow:0 16px 35px rgba(10,28,30,.36),inset 0 1px rgba(255,255,255,.8);padding:25px 28px}
      body.cafasso-mission-mode .cafasso-mission-stage article.block:before{content:'';display:block;width:42px;height:4px;margin:-9px auto 16px;border-radius:99px;background:#C99D3A;opacity:.72}
      body.cafasso-mission-mode .cafasso-mission-stage article.block h4{font-size:25px;margin-bottom:10px}
      body.cafasso-mission-mode .cafasso-mission-stage article.block .block-text{font-size:15px;line-height:1.65}
      body.cafasso-mission-mode .cafasso-mission-stage article.block .activity{border-radius:13px;background:rgba(255,255,255,.52);border:1px solid rgba(115,77,39,.18)}
      body.cafasso-mission-mode .cafasso-mission-stage article.block[data-scene-kind="video"]{background:linear-gradient(145deg,rgba(25,52,57,.97),rgba(17,39,48,.96));color:#FFF9E8}
      body.cafasso-mission-mode .cafasso-mission-stage article.block[data-scene-kind="video"] h4,body.cafasso-mission-mode .cafasso-mission-stage article.block[data-scene-kind="video"] .block-text{color:#FFF9E8}
      body.cafasso-mission-mode .cafasso-mission-stage article.block[data-scene-kind="oracion"]{background:linear-gradient(145deg,rgba(48,73,64,.97),rgba(20,45,46,.96));color:#FFF9E8}
      body.cafasso-mission-mode .cafasso-mission-stage article.block[data-scene-kind="oracion"] h4,body.cafasso-mission-mode .cafasso-mission-stage article.block[data-scene-kind="oracion"] .block-text{color:#FFF9E8}
      @media(max-width:680px){.cafasso-next-module{right:14px;bottom:18px;font-size:10px;padding:9px 12px}body.cafasso-mission-mode .module-detail{padding:0 14px 34px}body.cafasso-mission-mode .cafasso-mission-shell{margin:0 -14px 18px;padding:24px 14px 42px;min-height:100svh}body.cafasso-mission-mode .cafasso-mission-head{display:block}.cafasso-mission-stage{margin-top:22px}body.cafasso-mission-mode .cafasso-mission-stage article.block{padding:19px 16px}.cafasso-scene-marker{font-size:9px}}
    `;
    document.head.appendChild(style);
  }

  function experience() {
    return window.CafassoCourseExperience || null;
  }

  function revealMission() {
    document.getElementById('app')?.classList.add('cafasso-boot-ready');
  }

  function settingsOf(module) {
    return module && module.settings && typeof module.settings === 'object' ? module.settings : {};
  }

  function missionsOf(module) {
    const missions = settingsOf(module).missions;
    return Array.isArray(missions) ? missions.filter(item => item && item.id) : [];
  }

  const introNarrative = {
    m1: { title: 'Entrá al patio', objective: 'Conocé a Juanito y empezá a mirar la historia desde los jóvenes.', prompt: 'Mirá el video de bienvenida y encontrá una primera pregunta que te acompañe.', icon: '🚪' },
    m2: { title: 'Descubrí sus raíces', objective: 'Reconocé las personas y experiencias que fueron formando su corazón.', prompt: 'Armá el mapa de las raíces: una persona, una dificultad y un don.', icon: '🌱' },
    m3: { title: 'Abrí el sueño', objective: 'Escuchá el sueño de los nueve años y encontrá su primera pista.', prompt: 'Leé el sueño y elegí la palabra que más ilumina tu manera de animar.', icon: '✨' },
    m4: { title: 'Elegí cómo acercarte', objective: 'Probá una respuesta salesiana frente a una situación concreta.', prompt: 'Tomá una decisión: ¿cómo te acercarías a este joven con razón, religión y amor?', icon: '🧭' },
    m5: { title: 'Salí al encuentro', objective: 'Realizá un gesto concreto con un joven y compartilo con tu formador.', prompt: 'Hacé el desafío, entregá tu evidencia y esperá la confirmación de tus almitas.', icon: '🤝' }
  };

  function presentationOf(module, mission) {
    const custom = settingsOf(module).narrativeMissions;
    if (custom && custom[mission.id]) return { ...mission, ...custom[mission.id] };
    if (String(module?.title || '').toLowerCase().includes('juanito') && introNarrative[mission.id]) {
      return { ...mission, ...introNarrative[mission.id] };
    }
    return mission;
  }

  function blocksOf(module, missionId) {
    return (module?.contents || []).filter(block => {
      const settings = block.settings || {};
      return settings.missionId === missionId;
    });
  }

  function sceneKindOf(block) {
    const type = String(block?.type || '').toLowerCase();
    if (type.includes('video')) return 'video';
    if (type.includes('oración') || type.includes('oracion')) return 'oracion';
    if (type.includes('reflex')) return 'reflexion';
    if (type.includes('entrega') || type.includes('desaf')) return 'desafio';
    if (type.includes('lectura') || type.includes('document')) return 'lectura';
    return 'texto';
  }

  function doneBlock(block, state) {
    if (block.required === false) return true;
    const settings = block.settings || {};
    const submission = (state.submissions || []).find(item => item.activityId === block._id);
    const type = String(block.type || '').toLowerCase();
    if (/^aprobad/i.test(String(submission?.status || '').trim())) return true;
    if (type === 'desafío' || type === 'desafio') return submission?.status === 'Aprobada';
    if (['reflexión', 'entrega', 'evaluación'].includes(type)) {
      return Boolean(String(submission?.content || state.work?.answers?.[block._id] || '').trim());
    }
    return Boolean(state.work?.done?.[block._id]);
  }

  function missionStep(module, mission, state) {
    const records = blocksOf(module, mission.id);
    const work = state?.work || storedModuleWork(module);
    const firstOpen = records.findIndex(block => !doneBlock(block, { ...state, work }));
    return {
      records,
      index: firstOpen >= 0 ? firstOpen : Math.max(records.length - 1, 0)
    };
  }

  function missionDone(mission, module, state) {
    const required = blocksOf(module, mission.id).filter(block => block.required !== false);
    const work = state?.work || storedModuleWork(module);
    return required.length === 0 || required.every(block => doneBlock(block, { ...state, work }));
  }

  function missionKey(module) {
    const user = window.CafassoAnimatorState?.session?.user?._id || 'local';
    const course = experience()?.course?._id || 'course';
    return `cafasso-mission-${user}-${course}-${module?._id || 'module'}`;
  }

  function storedModuleWork(module) {
    const user = window.CafassoAnimatorState?.session?.user?._id || 'local';
    const course = experience()?.course?._id || 'course';
    try {
      return JSON.parse(localStorage.getItem(`cafasso-module-work-${user}-${course}-${module?._id || 'module'}`) || '{"done":{},"answers":{}}');
    } catch (error) {
      return { done: {}, answers: {} };
    }
  }

  function storedMission(module) {
    try { return localStorage.getItem(missionKey(module)) || ''; } catch (error) { return ''; }
  }

  function setStoredMission(module, id) {
    try { localStorage.setItem(missionKey(module), id); } catch (error) { /* local storage may be unavailable */ }
  }

  function prepareWorldReturnButton() {
    document.querySelectorAll('.side .nav button[data-view="inicio"],.mobilebar button[data-view="inicio"],.mobile-nav button[data-view="inicio"]').forEach(button => {
      const label = button.querySelector('span:last-child') || button;
      label.textContent = 'Volver al mundo';
    });
    let returnButton = document.getElementById('cafassoWorldReturn');
    if (!returnButton) {
      returnButton = document.createElement('button');
      returnButton.id = 'cafassoWorldReturn';
      returnButton.className = 'cafasso-world-return';
      returnButton.type = 'button';
      returnButton.textContent = '← Volver al mundo';
      returnButton.addEventListener('click', () => {
        if (typeof window.CafassoNavigate === 'function') {
          window.CafassoNavigate('inicio');
          return;
        }
        document.querySelector('[data-view="inicio"]')?.click();
      });
      document.body.appendChild(returnButton);
    }
    returnButton.hidden = false;
  }

  function clearWorldReturnButton() {
    document.getElementById('cafassoWorldReturn')?.remove();
  }

  function currentMission(module, missions, state) {
    const saved = storedMission(module);
    if (saved && missions.some(item => item.id === saved)) return saved;
    const firstOpen = missions.find(item => !missionDone(item, module, state));
    return (firstOpen || missions[missions.length - 1]).id;
  }

  function decorateStagePath() {
    const state = experience();
    const course = state?.course;
    if (!course || !document.querySelector('.section')) return;
    document.documentElement.dataset.cafassoHomeV2 = '0';
    const cards = [...document.querySelectorAll('.card.module')];
    if (!cards.length || document.querySelector('.cafasso-course-map')) return;
    const progressRecord = (state.data?.progress || []).find(item => item.courseId === course._id);
    const completedModuleIds = new Set(progressRecord?.completedModules || []);
    // El estado local de las misiones también sirve como respaldo inmediato
    // mientras la respuesta de progreso termina de sincronizarse.
    (course.modules || []).forEach(item => {
      const moduleMissions = missionsOf(item);
      if (moduleMissions.length && moduleMissions.every(mission => missionDone(mission, item, state))) completedModuleIds.add(item._id);
    });
    const nextGamifiedModule = (course.modules || []).find((item, index, modules) => {
      if (!item || !missionsOf(item).length || completedModuleIds.has(item._id)) return false;
      return index === 0 || completedModuleIds.has(modules[index - 1]?._id);
    });
    const gamifiedCard = cards.find(card => {
      const moduleId = card.querySelector('[data-module]')?.getAttribute('data-module');
      const module = (course.modules || []).find(item => item && item._id === moduleId);
      return module?._id === (nextGamifiedModule?._id || module?._id) && missionsOf(module).length > 0;
    }) || cards.find(card => {
      const moduleId = card.querySelector('[data-module]')?.getAttribute('data-module');
      const module = (course.modules || []).find(item => item && item._id === moduleId);
      return missionsOf(module).length > 0;
    });
    const moduleId = gamifiedCard?.querySelector('[data-module]')?.getAttribute('data-module');
    const module = (course.modules || []).find(item => item && item._id === moduleId);
    if (!module) return;
    const settings = settingsOf(module);
    const missions = missionsOf(module);
    const stateNow = experience();
    const doneIds = new Set(missions.filter(item => missionDone(item, module, stateNow)).map(item => item.id));
    if (missions.length && doneIds.size === missions.length && !completedModuleIds.has(module._id) && autoCompletingModule !== module._id && typeof window.CafassoCompleteModule === 'function') {
      autoCompletingModule = module._id;
      window.CafassoCompleteModule(module._id).then(() => {
        autoCompletingModule = '';
        if (typeof window.CafassoNavigate === 'function') window.CafassoNavigate('curso');
      }).catch(() => { autoCompletingModule = ''; });
    }
    const activeId = currentMission(module, missions, stateNow);
    const originalButtons = new Map(cards.map(card => [card.querySelector('[data-module]')?.getAttribute('data-module'), card.querySelector('[data-module]')]));
    const section = gamifiedCard.closest('.section');
    if (!section) return;
    const badge = settings.badge || {};
    const moduleIndex = (course.modules || []).findIndex(item => item && item._id === module._id);
    const nextModule = moduleIndex >= 0 ? (course.modules || [])[moduleIndex + 1] : null;
    const moduleReadyForNext = missions.length > 0 && doneIds.size === missions.length;
    const nextModuleButton = nextModule && moduleReadyForNext ? `<button type="button" class="cafasso-next-module" data-next-module="${esc(nextModule._id)}">Seguir al ${esc(nextModule.title || 'módulo siguiente')} →</button>` : '';
    const map = document.createElement('section');
    map.className = 'cafasso-course-map';
    // El mundo inicial tiene su propio paisaje. El mapa del curso usa el fondo
    // de estaciones/piedras para que el recorrido se distinga visualmente.
    map.style.backgroundImage = "url('https://static.wixstatic.com/media/47bf07_0d0a5e3ec41543cbb9d6171058171b28~mv2.png')";
    map.innerHTML = `<div class="cafasso-course-map-head"><div><div class="cafasso-course-map-kicker">${esc(settings.stageLabel || 'Tu camino')} · ${missions.length} paradas</div><h2 class="cafasso-course-map-title">El camino de Juanito</h2><p class="cafasso-course-map-copy">Avanzá por la historia de Don Bosco. Cada parada se abre con una experiencia, una decisión y un gesto concreto.</p></div>${badge.name ? `<span class="cafasso-course-map-badge"><span>${esc(badge.icon || '✦')}</span>${esc(badge.name)}</span>` : ''}</div>${nextModuleButton}<div class="cafasso-map-stations">${missions.map((mission,index) => { const view=presentationOf(module,mission); const done=doneIds.has(mission.id); const previousDone=index===0||doneIds.has(missions[index-1].id); const locked=!previousDone&&!done; return `<button class="cafasso-map-station ${mission.id===activeId?'active':''} ${done?'done':''} ${locked?'locked':''}" data-map-mission="${esc(mission.id)}" ${locked?'disabled':''}><i>${locked?'🔒':esc(view.icon || '•')}</i><strong>${index+1}. ${esc(view.title)}</strong><small>${esc(view.objective || 'Una nueva parada del camino.')}</small></button>`; }).join('')}</div>`;
    document.body.classList.add('cafasso-journey-mode');
    prepareWorldReturnButton();
    const trackingCard = section.parentElement?.querySelector('.hero');
    if (trackingCard) trackingCard.remove();
    section.replaceWith(map);
    map.querySelectorAll('[data-map-mission]').forEach(button => button.addEventListener('click', () => {
      const target = originalButtons.get(moduleId);
      if (target) { setStoredMission(module, button.dataset.mapMission); target.click(); }
    }));
    map.querySelector('[data-next-module]')?.addEventListener('click', () => {
      if (nextModule?._id && typeof window.CafassoOpenModule === 'function') {
        window.CafassoOpenModule(nextModule._id);
        return;
      }
      const target = originalButtons.get(nextModule?._id);
      if (target) { target.disabled = false; target.removeAttribute('disabled'); target.click(); }
    });
  }

  function decorateModule() {
    const state = experience();
    const module = state?.module;
    const missions = missionsOf(module);
    if (!module || !missions.length) return;
    document.documentElement.dataset.cafassoHomeV2 = '0';
    const root = document.querySelector('.module-detail');
    if (!root) return;
    styles();
    document.body.classList.add('cafasso-mission-mode');
    document.body.classList.remove('cafasso-journey-mode');
    prepareWorldReturnButton();
    const allBlocks = [...root.querySelectorAll('article.block[data-block-card]')];
    if (!allBlocks.length) return;
    const activeId = currentMission(module, missions, state);
    const active = missions.find(item => item.id === activeId) || missions[0];
    const activeView = presentationOf(module, active);
    const activeDone = missionDone(active, module, state);
    if (pendingBlockCompletion && activeDone) {
      pendingBlockCompletion = false;
      celebrateMission(active, module);
      return;
    }
    const existingShell = root.querySelector('.cafasso-mission-shell');
    if (existingShell && existingShell.dataset.activeMission === activeId) {
      revealMission();
      return;
    }
    const doneIds = new Set(missions.filter(item => missionDone(item, module, state)).map(item => item.id));
    const step = missionStep(module, active, state);
    const activeBlockRecords = step.records;
    // Mostramos todos los contenidos de la misión juntos, respetando el
    // orden original. La lógica de avance y aprobación sigue siendo la misma.
    const visibleBlock = activeBlockRecords[step.index] || null;
    const activeBlocks = new Set(activeBlockRecords.map(block => block._id));
    allBlocks.forEach(card => {
      card.style.display = activeBlocks.has(card.dataset.blockCard) ? '' : 'none';
    });
    root.querySelectorAll('.cafasso-mission-shell,.cafasso-mission-next').forEach(node => node.remove());
    const shell = document.createElement('section');
    shell.className = 'cafasso-mission-shell';
    shell.dataset.activeMission = active.id;
    const moduleSettings = settingsOf(module);
    const badge = moduleSettings.badge || {};
    shell.innerHTML = `<button type="button" class="cafasso-scene-back">← Volver al camino</button><div class="cafasso-mission-head"><div><div class="cafasso-mission-kicker">${esc(moduleSettings.stageLabel || 'El camino')} · Parada ${missions.indexOf(active) + 1} de ${missions.length}</div><h3 class="cafasso-mission-title">${esc(activeView.title)}</h3><p class="cafasso-mission-objective">${esc(activeView.objective || 'Avanzá un paso en tu recorrido.')}</p></div><span class="cafasso-mission-time">${Number(active.minutes || 5)} min</span></div>${activeView.prompt ? `<div class="cafasso-mission-prompt"><strong>Tu misión ahora</strong>${esc(activeView.prompt)}</div>` : ''}<div class="cafasso-mission-nav">${missions.map((mission, index) => {
      const view = presentationOf(module, mission);
      const done = doneIds.has(mission.id);
      const previousDone = index === 0 || doneIds.has(missions[index - 1].id);
      const locked = !previousDone && !done;
      return `<button class="cafasso-mission-node ${mission.id === active.id ? 'active' : ''} ${done ? 'done' : ''} ${locked ? 'locked' : ''}" data-mission-id="${esc(mission.id)}" ${locked ? 'disabled' : ''}><i>${esc(view.icon || '•')}</i><span>${esc(view.title)}</span></button>`;
    }).join('')}</div>${active.rewardAlmitas ? `<div class="cafasso-ruah-inline"><span>✦</span><span>Recompensa de esta parada: <b>${Number(active.rewardAlmitas)} almitas</b></span></div>` : ''}${badge.name ? `<div class="cafasso-ruah-inline"><span>🏅</span><span>Logro del camino: <b>${esc(badge.name)}</b></span></div>` : ''}`;
    const stage = document.createElement('div');
    stage.className = 'cafasso-mission-stage';
    stage.innerHTML = `<div class="cafasso-scene-marker"><span>${esc(activeView.icon || '✦')}</span><small>${esc(activeView.sceneLabel || 'Escena de la misión')} · ${activeBlockRecords.length} contenidos</small></div>`;
    shell.appendChild(stage);
    shell.querySelector('.cafasso-scene-back')?.addEventListener('click', () => {
      if (typeof window.CafassoNavigate === 'function') window.CafassoNavigate('curso');
      else document.querySelector('[data-view="curso"]')?.click();
    });
    allBlocks.forEach(card => {
      const record = activeBlockRecords.find(block => block._id === card.dataset.blockCard);
      if (!record || !activeBlocks.has(record._id)) return;
      card.dataset.sceneKind = sceneKindOf(record);
      stage.appendChild(card);
    });
    const progress = root.querySelector('.module-progress');
    if (progress) progress.insertAdjacentElement('afterend', shell);
    else root.prepend(shell);
    shell.querySelectorAll('[data-mission-id]:not([disabled])').forEach(button => {
      button.addEventListener('click', () => {
        setStoredMission(module, button.dataset.missionId);
        decorateModule();
      });
    });
    const next = missions[missions.indexOf(active) + 1];
    if (activeDone && next) {
      const box = document.createElement('div');
      box.className = 'cafasso-mission-next';
      box.innerHTML = `<strong>✓ Parada completada</strong>Podés continuar con <b>${esc(presentationOf(module, next).title)}</b>.`;
      const complete = root.querySelector('.complete-box');
      if (complete) complete.insertAdjacentElement('beforebegin', box);
      else root.appendChild(box);
    }
    revealMission();
  }

  function playMissionSound() {
    if (window.CafassoSoundEnabled && !window.CafassoSoundEnabled()) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const context = new AudioContext();
      const now = context.currentTime;
      [523.25, 659.25, 783.99].forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, now + index * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.16, now + index * 0.09 + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.09 + 0.22);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(now + index * 0.09);
        oscillator.stop(now + index * 0.09 + 0.24);
      });
      setTimeout(() => context.close().catch(() => {}), 900);
    } catch (error) { /* Audio may be blocked until a user gesture. */ }
  }

  function celebrateMission(mission, module) {
    if (celebrationRunning) return;
    celebrationRunning = true;
    // Cuando la última misión queda realmente completa, reutilizamos el
    // guardado nativo del módulo. Así se mantiene la validación existente:
    // los desafíos solo cuentan si el formador los aprobó y el siguiente
    // módulo se desbloquea desde el progreso central de CAFASSO.
    const state = experience();
    const missions = missionsOf(module);
    const moduleReady = missions.length > 0 && missions.every(item => missionDone(item, module, state));
    const courseModules = Array.isArray(state?.course?.modules) ? state.course.modules : [];
    const moduleIndex = courseModules.findIndex(item => item && item._id === module?._id);
    const nextModule = moduleIndex >= 0 ? courseModules[moduleIndex + 1] : null;
    if (moduleReady) {
      document.getElementById('completeModule')?.click();
    }
    playMissionSound();
    const overlay = document.createElement('div');
    overlay.className = 'cafasso-celebration';
    const reward = Number(mission.rewardAlmitas || 0);
    const unlockNotice = moduleReady && nextModule
      ? `<strong class="cafasso-unlock-title">🔓 ¡${esc(nextModule.title || 'Nuevo módulo')} desbloqueado!</strong><span class="cafasso-unlock-copy">Ya podés continuar tu camino de formación.</span>`
      : '';
    overlay.innerHTML = `<div class="cafasso-celebration-card"><strong>¡Misión completada!</strong><span>${reward > 0 ? `✦ +${reward} almitas` : 'Un paso más en tu camino'}</span>${unlockNotice}</div>`;
    const colors = ['#F4D889', '#F28B67', '#8FD0A2', '#A5C9E8', '#FFF9E8'];
    for (let index = 0; index < 72; index += 1) {
      const piece = document.createElement('i');
      piece.className = 'cafasso-confetti';
      piece.style.setProperty('--color', colors[index % colors.length]);
      piece.style.setProperty('--x', `${Math.round((Math.random() - 0.5) * 100)}vw`);
      piece.style.setProperty('--y', `${Math.round(35 + Math.random() * 58)}vh`);
      piece.style.setProperty('--r', `${Math.round((Math.random() - 0.5) * 1100)}deg`);
      piece.style.setProperty('--delay', `${Math.round(Math.random() * 180)}ms`);
      overlay.appendChild(piece);
    }
    document.body.appendChild(overlay);
    setTimeout(() => {
      overlay.remove();
      celebrationRunning = false;
      if (typeof window.CafassoNavigate === 'function') window.CafassoNavigate('curso');
      else { history.pushState({ view: 'curso' }, '', `${location.pathname}${location.search}#curso`); window.dispatchEvent(new PopStateEvent('popstate')); }
    }, 2200);
  }

  function isoWeekKey(value) {
    const date = new Date(value || Date.now());
    if (Number.isNaN(date.getTime())) return '';
    const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const day = utc.getUTCDay() || 7;
    utc.setUTCDate(utc.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((utc - yearStart) / 86400000) + 1) / 7);
    return `${utc.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
  }

  function ruahSummary(state) {
    const weeks = new Set();
    (state?.data?.progress || []).forEach(progress => {
      (progress.ruahWeeks || []).forEach(week => weeks.add(String(week)));
      if (!progress.ruahWeeks?.length && progress.updatedAt) weeks.add(isoWeekKey(progress.updatedAt));
    });
    (state?.data?.submissions || []).forEach(submission => {
      const date = submission._updatedDate || submission._createdDate;
      if (date) weeks.add(isoWeekKey(date));
    });
    const current = isoWeekKey(Date.now());
    return { total: weeks.size, active: weeks.has(current) };
  }

  function decorateHome() {
    if ((location.hash || '#inicio') !== '#inicio') return;
    const almitas = document.querySelector('.cafasso-home-almitas');
    const state = window.CafassoAnimatorState;
    if (!almitas || !state) return;
    styles();
    const summary = ruahSummary(state);
    let card = document.querySelector('.cafasso-home-ruah');
    if (!card) {
      card = document.createElement('section');
      card.className = 'cafasso-home-ruah';
      almitas.insertAdjacentElement('afterend', card);
    }
    const signature = `${summary.total}:${summary.active}`;
    if (card.dataset.ruahSignature === signature) return;
    card.dataset.ruahSignature = signature;
    card.innerHTML = `<div class="cafasso-home-ruah-main"><span class="cafasso-home-ruah-icon">R</span><div><div class="cafasso-home-ruah-label">RUAH · constancia</div><div class="cafasso-home-ruah-total">${summary.total} semana${summary.total === 1 ? '' : 's'} con vida</div></div></div><div class="cafasso-home-ruah-note"><strong>${summary.active ? 'RUAH encendido esta semana' : 'RUAH en espera'}</strong>${summary.active ? 'Seguí caminando con una misión breve.' : 'Realizá una misión esta semana para volver a encenderlo.'}</div>`;
  }

  function decorateCourses() {
    const isCourses = (location.hash || '#inicio') === '#cursos';
    document.body.classList.toggle('cafasso-courses-mode', isCourses);
    if (!isCourses) {
      document.documentElement.removeAttribute('data-cafasso-courses-boot');
      return;
    }
    document.documentElement.dataset.cafassoHomeV2 = '0';
    const main = document.getElementById('main');
    if (!main || !main.querySelector('.courses')) return;
    const heading = main.querySelector('.top h1');
    const subtitle = main.querySelector('.top p');
    if (heading) heading.textContent = 'Escuela';
    if (subtitle) subtitle.textContent = 'Elegí un recorrido y continuá tu camino de formación.';
    document.documentElement.removeAttribute('data-cafasso-courses-boot');
    document.getElementById('app')?.classList.add('cafasso-boot-ready');
  }

  function refresh() {
    styles();
    const state = experience();
    if (state?.view === 'course' || state?.view === 'module') document.documentElement.dataset.cafassoHomeV2 = '0';
    if (state?.view === 'module') decorateModule();
    if (state?.view === 'course') decorateStagePath();
    if (state?.view === 'course' || state?.view === 'module') prepareWorldReturnButton();
    else clearWorldReturnButton();
    if (state?.view !== 'course') document.body.classList.remove('cafasso-journey-mode');
    if (state?.view !== 'module') document.body.classList.remove('cafasso-mission-mode');
    decorateCourses();
    decorateHome();
  }

  window.addEventListener('cafasso:course-experience-ready', refresh);
  window.addEventListener('cafasso:state-ready', refresh);
  window.addEventListener('cafasso:block-completed', () => { pendingBlockCompletion = true; setTimeout(refresh, 60); });
  window.addEventListener('hashchange', () => setTimeout(refresh, 40));
  setInterval(refresh, 1000);
  // No reconstruir la misión automáticamente: volver a crear sus bloques
  // reinicia los iframes de video y provoca pestañeos mientras el animador
  // está leyendo o mirando un contenido.
  setTimeout(refresh, 250);
})();
