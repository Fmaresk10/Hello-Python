(()=>{
  if(window.__cafassoCourseWorkspaceInstalled)return;
  window.__cafassoCourseWorkspaceInstalled=true;

  const TYPES=[
    ['Texto','📝','Una lectura o explicación breve.'],
    ['Video','🎬','Video de YouTube o Google Drive.'],
    ['Imagen','🖼️','Una imagen con contexto o epígrafe.'],
    ['Documento','📄','Material de Drive, Docs o PDF.'],
    ['Reflexión','💭','Una pregunta para detenerse y pensar.'],
    ['Entrega','📥','Una producción para enviar al formador.'],
    ['Desafío','⭐','Una acción concreta con Almitas.'],
    ['Evaluación','✅','Respuesta abierta o cuestionario.']
  ];
  const $e=id=>document.getElementById(id);
  const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  let refreshQueued=false;

  function installStyles(){
    if($e('cafassoCourseWorkspace'))return;
    const style=document.createElement('style');
    style.id='cafassoCourseWorkspace';
    style.textContent=[
      'body.cafasso-course-workspace{background:linear-gradient(135deg,#e8ddc9,#f6edde 52%,#ece2d1)!important}',
      'body.cafasso-course-workspace .shell{grid-template-columns:178px minmax(0,1fr)!important}',
      'body.cafasso-course-workspace .side{padding:24px 18px!important}',
      'body.cafasso-course-workspace .side h4,body.cafasso-course-workspace .side-tools{display:none!important}',
      'body.cafasso-course-workspace .side .brand{padding-bottom:18px;border-bottom:1px solid rgba(255,255,255,.12)}',
      'body.cafasso-course-workspace .side .brand b{font-size:23px!important}',
      'body.cafasso-course-workspace .side .brand small{font-size:8px!important}',
      'body.cafasso-course-workspace .side .back{left:18px!important;right:18px!important;font-size:11px!important}',
      'body.cafasso-course-workspace main{max-width:1220px!important;padding:26px clamp(20px,3vw,40px) 70px!important}',
      'body.cafasso-course-workspace .top{padding:18px 20px!important;margin-bottom:12px!important;align-items:center!important}',
      'body.cafasso-course-workspace .top h1{font-size:clamp(30px,3vw,40px)!important;margin:4px 0 2px!important}',
      'body.cafasso-course-workspace .top p{font-size:12px!important}',
      'body.cafasso-course-workspace .top .eyebrow{font-size:8px!important}',
      'body.cafasso-course-workspace .editor-shortcuts,body.cafasso-course-workspace .editor-flow{display:none!important}',
      'body.cafasso-course-workspace .save-state,body.cafasso-course-workspace .editor-mobile-actions{display:none!important}',
      'body.cafasso-course-workspace .actions{align-items:center!important;gap:7px!important}',
      'body.cafasso-course-workspace .actions #reloadBtn,body.cafasso-course-workspace .actions #courseTemplateBtn{display:none!important}',
      'body.cafasso-course-workspace .actions .btn{min-height:38px!important;padding:9px 12px!important;font-size:11px!important}',
      '.workspace-top-control{min-height:38px;border:1px solid #d8c9ae;border-radius:7px;background:#fffaf0;color:#365349;padding:9px 11px;font:800 11px Inter,system-ui;cursor:pointer}',
      '.workspace-more-wrap{position:relative}',
      '.workspace-more-menu{position:absolute;right:0;top:calc(100% + 7px);z-index:90;display:none;width:220px;padding:7px;border:1px solid #d7c7aa;border-radius:9px;background:#fffaf0;box-shadow:0 16px 38px rgba(47,42,33,.18)}',
      '.workspace-more-wrap.open .workspace-more-menu{display:grid;gap:3px}',
      '.workspace-more-menu button{border:0;border-radius:6px;background:transparent;color:#3d5148;padding:9px 10px;text-align:left;font:750 11px Inter,system-ui;cursor:pointer}',
      '.workspace-more-menu button:hover{background:#eee3cf}',
      '.workspace-more-menu button.danger{color:#995347}',
      '.workspace-course-strip{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:0 0 13px;padding:10px 13px;border:1px solid rgba(112,84,48,.16);border-radius:8px;background:rgba(255,250,239,.72);color:#536159}',
      '.workspace-course-strip__main{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:11px}',
      '.workspace-course-strip__main strong{color:#314a40;font-weight:850}',
      '.workspace-chip{display:inline-flex;align-items:center;min-height:25px;padding:5px 8px;border:1px solid #d7c8ac;border-radius:999px;background:#fffaf0;color:#625b4f;font:800 9px/1 Inter,system-ui}',
      '.workspace-chip.is-published{background:#e9f2eb;border-color:#bfd5c5;color:#34634c}',
      '.workspace-sync{max-width:360px;color:#766f64;font-size:9px;line-height:1.3;text-align:right}',
      'body.cafasso-course-workspace .layout{display:grid!important;grid-template-columns:1fr!important;gap:13px!important}',
      'body.cafasso-course-workspace .outline,body.cafasso-course-workspace .editor{padding:17px!important;border-radius:10px!important}',
      'body.cafasso-course-workspace .outline{position:relative}',
      'body.cafasso-course-workspace .outline h3{margin-bottom:12px!important;font-size:23px!important}',
      'body.cafasso-course-workspace .outline .drag-hint,body.cafasso-course-workspace .outline .module-jump,body.cafasso-course-workspace .outline .module-actions,body.cafasso-course-workspace .outline #addModule,body.cafasso-course-workspace .outline #deleteModule,body.cafasso-course-workspace .outline .editor-extra-actions,body.cafasso-course-workspace .outline #syncStatus,body.cafasso-course-workspace .outline .danger-zone{display:none!important}',
      'body.cafasso-course-workspace #moduleList{display:grid;gap:7px}',
      'body.cafasso-course-workspace .module{position:relative;margin:0!important;padding:13px 48px 13px 15px!important;border-radius:8px!important;min-height:64px;transition:.15s ease}',
      'body.cafasso-course-workspace .module:hover{transform:translateY(-1px);border-color:#c9b17a!important}',
      'body.cafasso-course-workspace .module.active{box-shadow:inset 4px 0 #b99642,0 5px 14px rgba(70,57,35,.06)!important}',
      'body.cafasso-course-workspace .module strong{font:600 16px/1.2 Georgia,serif!important;color:#30483f!important}',
      'body.cafasso-course-workspace .module small{margin-top:5px!important;font-size:9px!important}',
      '.workspace-module-tag{display:inline-flex;margin-left:7px;padding:3px 6px;border-radius:999px;background:#eee3ca;color:#6c5b36;font:800 7px/1 Inter,system-ui;vertical-align:2px}',
      '.workspace-module-arrow{position:absolute;right:14px;top:50%;transform:translateY(-50%);display:grid;place-items:center;width:28px;height:28px;border:1px solid #d6c7aa;border-radius:50%;background:#fffaf0;color:#536258;font-size:15px}',
      '.workspace-outline-foot{display:flex;align-items:center;justify-content:space-between;gap:9px;margin-top:11px;padding-top:11px;border-top:1px solid #e3d7c4}',
      '.workspace-outline-foot .workspace-add-module{flex:1;min-height:39px;border:1px dashed #bba36e;border-radius:7px;background:#f8eed9;color:#40574d;font:850 11px Inter,system-ui;cursor:pointer}',
      '.workspace-module-actions{position:relative}',
      '.workspace-module-actions>button{width:39px;height:39px;border:1px solid #d6c6a8;border-radius:7px;background:#fffaf0;color:#40564c;font-weight:900;cursor:pointer}',
      '.workspace-module-menu{position:absolute;right:0;bottom:calc(100% + 7px);z-index:30;display:none;width:210px;padding:7px;border:1px solid #d7c6a7;border-radius:8px;background:#fffaf0;box-shadow:0 14px 34px rgba(50,43,31,.16)}',
      '.workspace-module-actions.open .workspace-module-menu{display:grid;gap:3px}',
      '.workspace-module-menu button{border:0;border-radius:5px;background:transparent;padding:9px 10px;color:#40564c;text-align:left;font:750 10px Inter,system-ui;cursor:pointer}',
      '.workspace-module-menu button:hover{background:#eee3cf}',
      '.workspace-module-menu button.danger{color:#995347}',
      'body.cafasso-course-workspace .editor{display:block!important}',
      '#courseCompletenessCheck{display:none!important}',
      'body.workspace-review-open #courseCompletenessCheck{display:block!important;margin:0 0 12px!important}',
      '.workspace-active-module{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:15px;align-items:center;margin-bottom:11px;padding:15px 16px;border:1px solid #d9cbae;border-radius:9px;background:linear-gradient(100deg,#f8efdd,#fffaf0)}',
      '.workspace-active-module__kicker{color:#98752b;font:850 8px/1 Inter,system-ui;letter-spacing:.13em;text-transform:uppercase}',
      '.workspace-active-module h2{margin:5px 0 5px;color:#2f493f;font:500 26px/1 Georgia,serif}',
      '.workspace-active-module__meta{display:flex;gap:6px;flex-wrap:wrap;color:#756d60;font-size:9px;font-weight:750}',
      '.workspace-active-module__actions{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}',
      '.workspace-active-module__actions button{min-height:37px;border:1px solid #d3c2a2;border-radius:7px;background:#fffaf0;color:#3c554a;padding:8px 10px;font:800 10px Inter,system-ui;cursor:pointer}',
      '.workspace-collapsible{margin:0 0 11px!important;padding:0!important;border:1px solid #ded1bc!important;border-radius:9px!important;background:#fbf4e7!important;overflow:hidden}',
      '.workspace-section-toggle{width:100%;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;border:0;background:transparent;padding:13px 15px;color:#344d43;text-align:left;cursor:pointer}',
      '.workspace-section-toggle strong{display:block;font:500 18px/1.1 Georgia,serif}',
      '.workspace-section-toggle small{display:block;margin-top:4px;color:#797267;font:10px/1.35 Inter,system-ui}',
      '.workspace-section-toggle span:last-child{font-size:18px;transition:transform .16s ease}',
      '.workspace-collapsible.workspace-open>.workspace-section-toggle span:last-child{transform:rotate(180deg)}',
      '.workspace-collapsible:not(.workspace-open)>:not(.workspace-section-toggle){display:none!important}',
      '.workspace-collapsible.workspace-open> :not(.workspace-section-toggle){margin-left:15px!important;margin-right:15px!important}',
      '.workspace-collapsible.workspace-open> :last-child{margin-bottom:15px!important}',
      '.workspace-collapsible>.editor-sheet-kicker,.workspace-collapsible>h3{display:none!important}',
      'body.cafasso-course-workspace .editor-contents-sheet{margin:0!important;padding:16px!important;border:1px solid #d8c9ad!important;border-radius:9px!important;background:#fffaf0!important}',
      'body.cafasso-course-workspace .editor-contents-sheet>.editor-sheet-kicker,body.cafasso-course-workspace .editor-contents-sheet>div[style*="display:flex"],body.cafasso-course-workspace .editor-contents-sheet>.drag-hint,body.cafasso-course-workspace .editor-contents-sheet>.quick-content-bar,body.cafasso-course-workspace .editor-contents-sheet>.editor-extra-actions{display:none!important}',
      '.workspace-content-head{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:11px}',
      '.workspace-content-head small{display:block;color:#98752b;font:850 8px/1 Inter,system-ui;letter-spacing:.13em;text-transform:uppercase}',
      '.workspace-content-head h3{margin:4px 0 0!important;color:#2f493f!important;font:500 24px/1 Georgia,serif!important}',
      '.workspace-add-content{min-height:40px;border:0;border-radius:7px;background:#385c4d;color:#fff;padding:10px 14px;font:850 11px Inter,system-ui;cursor:pointer;box-shadow:0 5px 12px rgba(48,82,68,.14)}',
      'body.cafasso-course-workspace .content-list{gap:6px!important;margin-top:0!important}',
      'body.cafasso-course-workspace .content{position:relative;grid-template-columns:36px minmax(0,1fr) 28px!important;gap:10px!important;padding:10px 11px!important;border-radius:7px!important;min-height:56px}',
      'body.cafasso-course-workspace .content .icon{width:36px!important;height:36px!important;border-radius:7px!important;font-size:15px}',
      'body.cafasso-course-workspace .content strong{font-size:12px!important}',
      'body.cafasso-course-workspace .content small{font-size:8px!important;margin-top:3px!important}',
      'body.cafasso-course-workspace .content>.mini{display:none!important}',
      '.workspace-content-open{display:grid;place-items:center;width:26px;height:26px;border:1px solid #d8c9ad;border-radius:50%;background:#fffaf0;color:#52645b;font-size:14px}',
      '.workspace-empty-content{padding:23px 14px;border:1px dashed #cfbd98;border-radius:8px;background:#f8efdd;color:#746b5c;text-align:center;font:11px/1.5 Inter,system-ui}',
      '.workspace-picker{position:fixed;inset:0;z-index:9100;display:none;place-items:center;padding:20px;background:rgba(17,38,33,.68);backdrop-filter:blur(3px)}',
      '.workspace-picker.show{display:grid}',
      '.workspace-picker__card{width:min(720px,96vw);max-height:88vh;overflow:auto;padding:20px;border:1px solid #d2bf99;border-radius:12px;background:#f7eddd;box-shadow:0 28px 80px rgba(20,32,27,.35)}',
      '.workspace-picker__head{display:flex;justify-content:space-between;gap:15px;align-items:flex-start;margin-bottom:15px}',
      '.workspace-picker__head h2{margin:0;color:#2e493e;font:500 28px Georgia,serif}',
      '.workspace-picker__head p{margin:5px 0 0;color:#746f65;font-size:11px}',
      '.workspace-picker__close{width:36px;height:36px;border:0;border-radius:50%;background:#e7dbc6;color:#41564d;font-size:20px;cursor:pointer}',
      '.workspace-picker__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}',
      '.workspace-picker__type{display:grid;grid-template-columns:38px minmax(0,1fr);gap:10px;align-items:center;border:1px solid #d7c6a7;border-radius:8px;background:#fffaf0;padding:11px;text-align:left;color:#3b5148;cursor:pointer}',
      '.workspace-picker__type:hover{border-color:#b79954;background:#fff5df}',
      '.workspace-picker__type i{display:grid;place-items:center;width:38px;height:38px;border-radius:7px;background:#ebe1cd;font-style:normal;font-size:18px}',
      '.workspace-picker__type strong{display:block;font-size:11px}.workspace-picker__type small{display:block;margin-top:3px;color:#777066;font-size:9px;line-height:1.35}',
      '.workspace-block-backdrop{position:fixed;inset:0;z-index:8990;display:none;background:rgba(21,33,29,.38)}',
      '.workspace-block-backdrop.show{display:block}',
      'body.cafasso-course-workspace .editor-block-sheet{position:fixed!important;right:0;top:0;bottom:0;z-index:9000;width:min(610px,94vw);margin:0!important;padding:76px 22px 34px!important;overflow:auto;border:0!important;border-left:1px solid #cdbb99!important;border-radius:0!important;background:#f7eddd!important;box-shadow:-18px 0 54px rgba(28,37,32,.24);transform:translateX(104%);transition:transform .22s ease}',
      'body.cafasso-course-workspace .editor-block-sheet.workspace-drawer-open{transform:translateX(0)}',
      'body.cafasso-course-workspace .editor-block-sheet>.editor-sheet-kicker{display:block!important;color:#98752b!important}',
      'body.cafasso-course-workspace .editor-block-sheet>h3{font-size:28px!important;margin-top:5px!important}',
      '.workspace-drawer-close{position:absolute;right:18px;top:18px;width:38px;height:38px;border:1px solid #d2c19f;border-radius:50%;background:#fffaf0;color:#40564c;font-size:20px;cursor:pointer}',
      'body.cafasso-course-workspace .editor-block-sheet #blockEmpty{display:none!important}',
      'body.cafasso-course-workspace .block-transfer{margin-top:18px!important}',
      '@media(max-width:900px){body.cafasso-course-workspace .shell{grid-template-columns:1fr!important}body.cafasso-course-workspace .side{position:relative!important;top:auto!important;height:auto!important;min-height:0!important;padding:9px 14px!important;display:flex!important;align-items:center!important;justify-content:space-between!important}body.cafasso-course-workspace .side .brand{padding:0!important;border:0!important}body.cafasso-course-workspace .side .brand div{display:none!important}body.cafasso-course-workspace .side .back{position:static!important;border:0!important;padding:9px!important;font-size:10px!important}body.cafasso-course-workspace main{padding-top:14px!important}}',
      '@media(max-width:700px){body.cafasso-course-workspace main{padding:10px 10px 92px!important}body.cafasso-course-workspace .top{padding:14px!important;display:block!important}body.cafasso-course-workspace .top .actions{margin-top:12px!important;display:grid!important;grid-template-columns:1fr 1fr!important}body.cafasso-course-workspace .top .actions .btn,body.cafasso-course-workspace .workspace-top-control{width:100%!important}body.cafasso-course-workspace .workspace-more-wrap{grid-column:2}body.cafasso-course-workspace .workspace-more-wrap>button{width:100%}.workspace-course-strip{align-items:flex-start;display:block}.workspace-sync{text-align:left;margin-top:7px}.workspace-active-module{grid-template-columns:1fr}.workspace-active-module__actions{justify-content:flex-start}.workspace-content-head{align-items:flex-start}.workspace-content-head h3{font-size:22px!important}.workspace-add-content{white-space:nowrap}.workspace-picker__grid{grid-template-columns:1fr}.workspace-picker{padding:10px}.workspace-picker__card{padding:16px}.workspace-picker__head h2{font-size:25px}body.cafasso-course-workspace .editor-block-sheet{width:100vw;padding:68px 14px 110px!important}.workspace-collapsible.workspace-open> :not(.workspace-section-toggle){margin-left:12px!important;margin-right:12px!important}}'
    ].join('\n');
    style.textContent += `
      /* CAFASSO · piel contemporánea 2026 */
      body.cafasso-course-workspace{
        --ws-ink:#21342e;
        --ws-muted:#6f7a74;
        --ws-green:#416b5d;
        --ws-green-strong:#2d5749;
        --ws-green-soft:#dfe9e3;
        --ws-sand:#d4b77c;
        --ws-sand-soft:#f2eadb;
        --ws-line:rgba(63,78,68,.11);
        --ws-surface:rgba(255,255,255,.70);
        --ws-surface-strong:rgba(255,255,255,.88);
        --ws-shadow:0 18px 48px rgba(40,54,46,.08);
        font-family:"Manrope",Inter,system-ui,-apple-system,"Segoe UI",sans-serif!important;
        color:var(--ws-ink)!important;
        background:
          radial-gradient(circle at 9% 8%,rgba(190,211,198,.55),transparent 29%),
          radial-gradient(circle at 88% 6%,rgba(235,214,171,.46),transparent 31%),
          radial-gradient(circle at 68% 92%,rgba(199,218,207,.35),transparent 34%),
          linear-gradient(145deg,#f5f6f1 0%,#f8f3eb 52%,#f2f4ef 100%)!important;
        background-attachment:fixed!important;
      }
      body.cafasso-course-workspace:before{
        content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;
        background:
          linear-gradient(rgba(255,255,255,.22),rgba(255,255,255,.22)),
          radial-gradient(circle at 50% 0%,rgba(255,255,255,.34),transparent 42%);
      }
      body.cafasso-course-workspace,
      body.cafasso-course-workspace button,
      body.cafasso-course-workspace input,
      body.cafasso-course-workspace textarea,
      body.cafasso-course-workspace select{
        font-family:"Manrope",Inter,system-ui,-apple-system,"Segoe UI",sans-serif!important;
      }
      body.cafasso-course-workspace .shell{grid-template-columns:196px minmax(0,1fr)!important}
      body.cafasso-course-workspace .side{
        overflow:hidden!important;padding:24px 17px!important;
        background:
          radial-gradient(circle at 22% 4%,rgba(222,198,137,.18),transparent 29%),
          radial-gradient(circle at 88% 84%,rgba(112,157,135,.19),transparent 34%),
          linear-gradient(165deg,#24483f 0%,#1e3e37 52%,#18342f 100%)!important;
        border-right:1px solid rgba(255,255,255,.10)!important;
        box-shadow:18px 0 58px rgba(36,55,47,.11)!important;
      }
      body.cafasso-course-workspace .side:before{
        content:"";position:absolute;inset:0;pointer-events:none;
        background:linear-gradient(125deg,rgba(255,255,255,.035),transparent 38%,rgba(255,255,255,.015));
      }
      body.cafasso-course-workspace .side .brand{
        position:relative;z-index:1;padding:4px 2px 20px!important;border-bottom:1px solid rgba(255,255,255,.10)!important
      }
      body.cafasso-course-workspace .side .brand a{
        background:rgba(255,255,255,.055)!important;border:1px solid rgba(255,255,255,.11)!important;
        border-radius:15px!important;box-shadow:inset 0 1px rgba(255,255,255,.08)
      }
      body.cafasso-course-workspace .side .brand b{
        font-family:"Manrope",sans-serif!important;font-weight:700!important;letter-spacing:-.035em!important;color:#f8f7ef!important
      }
      body.cafasso-course-workspace .side .brand small{
        font-family:"Manrope",sans-serif!important;font-weight:700!important;letter-spacing:.14em!important;color:rgba(238,224,187,.72)!important
      }
      body.cafasso-course-workspace .side .back{
        color:rgba(243,246,240,.76)!important;border-color:rgba(255,255,255,.09)!important;font-weight:650!important;
        transition:color .18s ease,transform .18s ease
      }
      body.cafasso-course-workspace .side .back:hover{color:#fff!important;transform:translateX(2px)}
      body.cafasso-course-workspace main{max-width:1280px!important;padding:30px clamp(22px,3.5vw,48px) 76px!important}
      body.cafasso-course-workspace .top{
        border:1px solid var(--ws-line)!important;border-radius:20px!important;padding:22px 24px!important;
        background:linear-gradient(135deg,rgba(255,255,255,.80),rgba(255,255,255,.60))!important;
        backdrop-filter:blur(18px) saturate(1.05)!important;-webkit-backdrop-filter:blur(18px) saturate(1.05)!important;
        box-shadow:var(--ws-shadow)!important
      }
      body.cafasso-course-workspace .top .eyebrow{
        color:#8b7446!important;font-size:9px!important;font-weight:800!important;letter-spacing:.16em!important
      }
      body.cafasso-course-workspace .top h1{
        font-family:"Manrope",sans-serif!important;font-weight:650!important;letter-spacing:-.045em!important;
        color:var(--ws-ink)!important;font-size:clamp(32px,3.2vw,44px)!important;line-height:1.02!important
      }
      body.cafasso-course-workspace .top p{color:var(--ws-muted)!important;font-size:12.5px!important;font-weight:500!important}
      body.cafasso-course-workspace .actions{gap:8px!important}
      body.cafasso-course-workspace .actions .btn,
      body.cafasso-course-workspace .workspace-top-control{
        min-height:40px!important;border-radius:12px!important;padding:10px 13px!important;
        border:1px solid rgba(63,82,72,.10)!important;background:rgba(255,255,255,.68)!important;
        color:#355148!important;font-weight:700!important;box-shadow:0 5px 14px rgba(43,61,52,.045)!important;
        backdrop-filter:blur(8px)!important;transition:transform .16s ease,box-shadow .16s ease,background .16s ease!important
      }
      body.cafasso-course-workspace .actions .btn:hover,
      body.cafasso-course-workspace .workspace-top-control:hover{
        transform:translateY(-1px)!important;background:rgba(255,255,255,.92)!important;box-shadow:0 8px 20px rgba(43,61,52,.075)!important
      }
      body.cafasso-course-workspace .actions .btn.green{
        border-color:rgba(45,87,73,.16)!important;
        background:linear-gradient(135deg,#355f50,#4f7767)!important;color:#fff!important;
        box-shadow:0 8px 20px rgba(45,87,73,.20)!important
      }
      body.cafasso-course-workspace .actions .btn.green:hover{
        background:linear-gradient(135deg,#2f584b,#466f60)!important;box-shadow:0 11px 25px rgba(45,87,73,.26)!important
      }
      .workspace-more-menu,.workspace-module-menu{
        border:1px solid var(--ws-line)!important;border-radius:14px!important;
        background:rgba(250,250,246,.94)!important;backdrop-filter:blur(18px)!important;
        box-shadow:0 22px 55px rgba(42,55,48,.16)!important
      }
      .workspace-more-menu button,.workspace-module-menu button{
        border-radius:9px!important;font-weight:650!important;color:#40554c!important
      }
      .workspace-more-menu button:hover,.workspace-module-menu button:hover{background:rgba(67,103,88,.07)!important}
      .workspace-course-strip{
        margin-top:13px!important;border:1px solid var(--ws-line)!important;border-radius:14px!important;
        padding:11px 14px!important;background:rgba(255,255,255,.48)!important;
        backdrop-filter:blur(12px)!important;box-shadow:0 8px 28px rgba(45,59,50,.035)!important
      }
      .workspace-course-strip__main strong{color:#324b42!important;font-weight:750!important}
      .workspace-chip{
        min-height:26px!important;padding:6px 9px!important;border:1px solid rgba(70,89,78,.09)!important;
        background:rgba(255,255,255,.56)!important;color:#69746e!important;
        font:750 9px/1 "Manrope",sans-serif!important;box-shadow:inset 0 1px rgba(255,255,255,.7)!important
      }
      .workspace-chip.is-published{
        background:rgba(216,234,223,.72)!important;border-color:rgba(74,125,98,.12)!important;color:#39644f!important
      }
      .workspace-sync{color:#7b847f!important;font-size:9px!important;font-weight:550!important}
      body.cafasso-course-workspace .outline,
      body.cafasso-course-workspace .editor{
        border:1px solid var(--ws-line)!important;border-radius:18px!important;
        background:linear-gradient(150deg,rgba(255,255,255,.68),rgba(255,255,255,.52))!important;
        backdrop-filter:blur(18px)!important;-webkit-backdrop-filter:blur(18px)!important;
        box-shadow:var(--ws-shadow)!important
      }
      body.cafasso-course-workspace .outline{padding:20px!important}
      body.cafasso-course-workspace .outline h3{
        font-family:"Manrope",sans-serif!important;font-size:24px!important;font-weight:650!important;letter-spacing:-.03em!important;color:#2f493f!important
      }
      body.cafasso-course-workspace #moduleList{gap:8px!important}
      body.cafasso-course-workspace .module{
        min-height:70px!important;padding:14px 52px 14px 16px!important;border:1px solid rgba(70,87,77,.095)!important;
        border-radius:14px!important;background:rgba(255,255,255,.55)!important;
        box-shadow:0 6px 18px rgba(45,58,50,.035)!important;
        transition:transform .17s ease,background .17s ease,border-color .17s ease,box-shadow .17s ease!important
      }
      body.cafasso-course-workspace .module:hover{
        transform:translateY(-2px)!important;background:rgba(255,255,255,.82)!important;
        border-color:rgba(77,111,94,.17)!important;box-shadow:0 12px 28px rgba(45,58,50,.065)!important
      }
      body.cafasso-course-workspace .module.active{
        border-color:rgba(73,112,93,.18)!important;
        background:linear-gradient(135deg,rgba(229,239,232,.82),rgba(255,255,255,.78))!important;
        box-shadow:0 10px 26px rgba(55,80,67,.075),inset 3px 0 #678f7b!important
      }
      body.cafasso-course-workspace .module strong{
        font-family:"Manrope",sans-serif!important;font-size:14px!important;font-weight:720!important;letter-spacing:-.015em!important;color:#2f493f!important
      }
      body.cafasso-course-workspace .module small{color:#7b8580!important;font-size:9px!important;font-weight:560!important}
      .workspace-module-tag{
        margin-left:8px!important;padding:4px 7px!important;border:0!important;border-radius:999px!important;
        background:rgba(223,233,227,.82)!important;color:#587064!important;font:750 7px/1 "Manrope",sans-serif!important
      }
      .workspace-module-arrow{
        width:31px!important;height:31px!important;border:1px solid rgba(66,88,76,.09)!important;
        background:rgba(255,255,255,.62)!important;color:#668077!important;box-shadow:0 4px 12px rgba(44,58,50,.04)!important
      }
      .workspace-outline-foot{border-top:1px solid rgba(65,80,71,.08)!important;padding-top:14px!important;margin-top:14px!important}
      .workspace-outline-foot .workspace-add-module{
        min-height:42px!important;border:1px dashed rgba(67,107,87,.24)!important;border-radius:12px!important;
        background:rgba(226,237,230,.54)!important;color:#416555!important;font:750 11px "Manrope",sans-serif!important;
        transition:background .16s ease,transform .16s ease!important
      }
      .workspace-outline-foot .workspace-add-module:hover{background:rgba(218,232,223,.80)!important;transform:translateY(-1px)}
      .workspace-module-actions>button{
        width:42px!important;height:42px!important;border-radius:12px!important;border:1px solid rgba(69,88,78,.10)!important;
        background:rgba(255,255,255,.60)!important;color:#536d61!important
      }
      .workspace-active-module{
        margin-bottom:12px!important;padding:18px 19px!important;border:1px solid rgba(68,87,76,.10)!important;border-radius:16px!important;
        background:
          radial-gradient(circle at 95% 8%,rgba(220,199,148,.16),transparent 28%),
          linear-gradient(135deg,rgba(244,248,244,.84),rgba(255,255,255,.65))!important;
        box-shadow:0 10px 30px rgba(47,61,52,.045)!important
      }
      .workspace-active-module__kicker,.workspace-content-head small{
        color:#8a7751!important;font-size:8px!important;font-weight:800!important;letter-spacing:.15em!important
      }
      .workspace-active-module h2,
      .workspace-content-head h3,
      .workspace-section-toggle strong,
      .workspace-picker__head h2,
      body.cafasso-course-workspace .editor-block-sheet>h3{
        font-family:"Manrope",sans-serif!important;font-weight:650!important;letter-spacing:-.035em!important;color:#2c473d!important
      }
      .workspace-active-module h2{font-size:27px!important}
      .workspace-active-module__meta{color:#75807a!important}
      .workspace-active-module__actions button{
        min-height:39px!important;border:1px solid rgba(72,91,80,.10)!important;border-radius:11px!important;
        background:rgba(255,255,255,.62)!important;color:#456256!important;font:700 10px "Manrope",sans-serif!important
      }
      .workspace-collapsible{
        border:1px solid rgba(66,83,74,.09)!important;border-radius:14px!important;
        background:rgba(255,255,255,.46)!important;box-shadow:0 6px 20px rgba(45,58,50,.025)!important
      }
      .workspace-section-toggle{padding:14px 16px!important;color:#334f44!important}
      .workspace-section-toggle strong{font-size:16px!important}
      .workspace-section-toggle small{color:#7a847f!important;font:550 10px/1.4 "Manrope",sans-serif!important}
      .workspace-collapsible.workspace-open{background:rgba(255,255,255,.68)!important}
      body.cafasso-course-workspace .editor-contents-sheet{
        padding:18px!important;border:1px solid rgba(64,84,73,.095)!important;border-radius:16px!important;
        background:linear-gradient(145deg,rgba(255,255,255,.72),rgba(249,250,247,.58))!important;
        box-shadow:0 10px 28px rgba(44,58,50,.035)!important
      }
      .workspace-content-head{margin-bottom:14px!important}
      .workspace-content-head h3{font-size:24px!important}
      .workspace-add-content{
        min-height:42px!important;border-radius:12px!important;
        background:linear-gradient(135deg,#3e6959,#557a6b)!important;color:#fff!important;
        padding:10px 15px!important;font:750 11px "Manrope",sans-serif!important;
        box-shadow:0 8px 20px rgba(54,92,76,.18)!important;transition:transform .16s ease,box-shadow .16s ease!important
      }
      .workspace-add-content:hover{transform:translateY(-1px)!important;box-shadow:0 11px 24px rgba(54,92,76,.24)!important}
      body.cafasso-course-workspace .content-list{gap:7px!important}
      body.cafasso-course-workspace .content{
        min-height:60px!important;padding:11px 12px!important;border:1px solid rgba(65,83,73,.085)!important;
        border-radius:13px!important;background:rgba(255,255,255,.56)!important;box-shadow:0 5px 16px rgba(44,57,49,.025)!important;
        transition:background .16s ease,transform .16s ease,border-color .16s ease!important
      }
      body.cafasso-course-workspace .content:hover{
        transform:translateY(-1px)!important;background:rgba(255,255,255,.84)!important;border-color:rgba(73,111,93,.15)!important
      }
      body.cafasso-course-workspace .content.active{
        background:linear-gradient(135deg,rgba(230,239,233,.80),rgba(255,255,255,.78))!important;
        border-color:rgba(73,112,93,.17)!important;box-shadow:inset 3px 0 #6f9582,0 8px 20px rgba(47,65,55,.04)!important
      }
      body.cafasso-course-workspace .content .icon{
        border-radius:10px!important;background:linear-gradient(145deg,rgba(229,235,230,.92),rgba(244,239,226,.92))!important;
        box-shadow:inset 0 0 0 1px rgba(67,85,75,.055)!important
      }
      body.cafasso-course-workspace .content strong{color:#334e43!important;font-size:11.5px!important;font-weight:720!important}
      body.cafasso-course-workspace .content small{color:#828b86!important;font-size:8px!important}
      .workspace-content-open{
        border:1px solid rgba(68,88,77,.08)!important;background:rgba(255,255,255,.65)!important;color:#678076!important
      }
      .workspace-empty-content{
        border:1px dashed rgba(76,105,90,.19)!important;border-radius:13px!important;
        background:rgba(235,241,236,.44)!important;color:#77827c!important;font:550 11px/1.55 "Manrope",sans-serif!important
      }
      body.cafasso-course-workspace input,
      body.cafasso-course-workspace textarea,
      body.cafasso-course-workspace select{
        border:1px solid rgba(66,85,74,.11)!important;border-radius:11px!important;background:rgba(255,255,255,.72)!important;
        color:#30483f!important;box-shadow:inset 0 1px 2px rgba(48,62,54,.025)!important
      }
      body.cafasso-course-workspace input:focus,
      body.cafasso-course-workspace textarea:focus,
      body.cafasso-course-workspace select:focus{
        border-color:rgba(65,108,88,.38)!important;box-shadow:0 0 0 4px rgba(73,113,94,.09)!important;background:rgba(255,255,255,.92)!important
      }
      body.cafasso-course-workspace .field label,
      body.cafasso-course-workspace .check{color:#51655c!important;font-weight:700!important}
      body.cafasso-course-workspace .hint,
      body.cafasso-course-workspace .note,
      body.cafasso-course-workspace .block-help,
      body.cafasso-course-workspace .typed-note,
      body.cafasso-course-workspace .evaluation-note{
        border-radius:11px!important;background:rgba(232,239,234,.55)!important;border-color:rgba(70,101,85,.10)!important;color:#64736c!important
      }
      .workspace-picker{
        background:rgba(28,43,36,.44)!important;backdrop-filter:blur(12px) saturate(.9)!important
      }
      .workspace-picker__card{
        padding:22px!important;border:1px solid rgba(73,91,81,.12)!important;border-radius:20px!important;
        background:linear-gradient(145deg,rgba(250,251,248,.96),rgba(246,244,237,.94))!important;
        box-shadow:0 32px 90px rgba(28,40,34,.24)!important
      }
      .workspace-picker__head h2{font-size:29px!important}
      .workspace-picker__head p{color:#76817b!important;font-size:11px!important}
      .workspace-picker__close,.workspace-drawer-close{
        border:1px solid rgba(68,87,76,.09)!important;background:rgba(255,255,255,.62)!important;color:#557066!important;
        box-shadow:0 5px 14px rgba(44,58,50,.04)!important
      }
      .workspace-picker__grid{gap:10px!important}
      .workspace-picker__type{
        border:1px solid rgba(67,85,75,.09)!important;border-radius:14px!important;background:rgba(255,255,255,.62)!important;
        padding:13px!important;box-shadow:0 6px 18px rgba(45,58,50,.03)!important;
        transition:transform .16s ease,background .16s ease,border-color .16s ease!important
      }
      .workspace-picker__type:hover{
        transform:translateY(-2px)!important;background:rgba(255,255,255,.90)!important;border-color:rgba(77,115,96,.18)!important
      }
      .workspace-picker__type i{
        border-radius:11px!important;background:linear-gradient(145deg,rgba(222,235,226,.95),rgba(240,232,213,.9))!important
      }
      .workspace-picker__type strong{font-size:11.5px!important;font-weight:750!important;color:#375247!important}
      .workspace-picker__type small{color:#7a847f!important;font-size:9px!important}
      .workspace-block-backdrop{background:rgba(30,43,37,.34)!important;backdrop-filter:blur(5px)!important}
      body.cafasso-course-workspace .editor-block-sheet{
        width:min(640px,94vw)!important;border-left:1px solid rgba(71,89,79,.10)!important;
        background:
          radial-gradient(circle at 92% 4%,rgba(228,210,167,.22),transparent 26%),
          linear-gradient(145deg,rgba(249,250,247,.97),rgba(245,247,242,.96))!important;
        backdrop-filter:blur(22px)!important;box-shadow:-24px 0 72px rgba(28,42,35,.17)!important
      }
      body.cafasso-course-workspace .editor-block-sheet>.editor-sheet-kicker{color:#8b754a!important;font-weight:800!important;letter-spacing:.14em!important}
      body.cafasso-course-workspace .editor-block-sheet>h3{font-size:30px!important}
      body.cafasso-course-workspace .typed-block-banner,
      body.cafasso-course-workspace .typed-settings,
      body.cafasso-course-workspace .challenge-config,
      body.cafasso-course-workspace .evaluation-mode,
      body.cafasso-course-workspace .evaluation-builder,
      body.cafasso-course-workspace .experience-mode,
      body.cafasso-course-workspace .mission-builder,
      body.cafasso-course-workspace .mission-assignment,
      body.cafasso-course-workspace .course-source-picker,
      body.cafasso-course-workspace .block-transfer{
        border-color:rgba(68,88,77,.10)!important;border-radius:13px!important;
        background:rgba(255,255,255,.50)!important;box-shadow:0 6px 18px rgba(43,58,49,.025)!important
      }
      body.cafasso-course-workspace .experience-choice,
      body.cafasso-course-workspace .mission-tab,
      body.cafasso-course-workspace .evaluation-mode__choice{
        border-color:rgba(68,88,77,.10)!important;border-radius:11px!important;background:rgba(255,255,255,.62)!important
      }
      body.cafasso-course-workspace .experience-choice.active,
      body.cafasso-course-workspace .evaluation-mode__choice.active{
        background:linear-gradient(135deg,#365f51,#4c7464)!important;border-color:transparent!important
      }
      body.cafasso-course-workspace .mission-tab.active{
        background:linear-gradient(135deg,#e6d6a9,#d2b774)!important;border-color:rgba(166,132,54,.15)!important
      }
      body.cafasso-course-workspace .btn.danger,
      body.cafasso-course-workspace .danger{
        border-color:rgba(165,89,72,.12)!important;background:rgba(255,244,242,.64)!important;color:#9c5e52!important
      }
      body.cafasso-course-workspace .toast{
        border:1px solid rgba(255,255,255,.12)!important;border-radius:13px!important;
        background:rgba(38,63,54,.92)!important;backdrop-filter:blur(12px)!important;box-shadow:0 16px 42px rgba(28,45,38,.22)!important
      }
      @media(max-width:900px){
        body.cafasso-course-workspace .side{background:linear-gradient(120deg,#24483f,#1b3932)!important}
        body.cafasso-course-workspace main{padding-top:16px!important}
      }
      @media(max-width:700px){
        body.cafasso-course-workspace .top{border-radius:16px!important}
        body.cafasso-course-workspace .outline,body.cafasso-course-workspace .editor{border-radius:15px!important}
        body.cafasso-course-workspace .module{border-radius:12px!important}
        .workspace-picker__card{border-radius:17px!important}
      }
`;
    document.head.appendChild(style);
  }

  function currentModule(){
    try{return data.modules&&data.modules[active]||null}catch(e){return null}
  }
  function isMission(module){
    const s=module&&module.settings&&typeof module.settings==='object'?module.settings:{};
    return s.experienceMode==='missions'||(s.experienceMode!=='linear'&&Array.isArray(s.missions)&&s.missions.length>0);
  }
  function contentCount(){
    try{return (data.modules||[]).reduce((sum,m)=>sum+(Array.isArray(m.contents)?m.contents.length:0),0)}catch(e){return 0}
  }

  function makeCollapsible(section,title,copy){
    if(!section||section.dataset.workspaceCollapsible==='1')return;
    section.dataset.workspaceCollapsible='1';
    section.classList.add('workspace-collapsible');
    const button=document.createElement('button');
    button.type='button';
    button.className='workspace-section-toggle';
    button.innerHTML='<span><strong>'+esc(title)+'</strong><small>'+esc(copy)+'</small></span><span>⌄</span>';
    button.addEventListener('click',()=>section.classList.toggle('workspace-open'));
    section.insertAdjacentElement('afterbegin',button);
  }

  function openSection(section){
    if(!section)return;
    section.classList.add('workspace-open');
    setTimeout(()=>section.scrollIntoView({behavior:'smooth',block:'start'}),30);
  }

  function installHeader(){
    const top=document.querySelector('main .top');
    const actions=top&&top.querySelector('.actions');
    if(!top||!actions)return;

    if(!$e('workspaceCourseStrip')){
      const strip=document.createElement('section');
      strip.id='workspaceCourseStrip';
      strip.className='workspace-course-strip';
      strip.innerHTML='<div class="workspace-course-strip__main"><strong data-workspace-summary>Recorrido del curso</strong><span class="workspace-chip" data-workspace-status>Borrador</span><span class="workspace-chip" data-workspace-shape></span></div><div class="workspace-sync" data-workspace-sync></div>';
      top.insertAdjacentElement('afterend',strip);
    }

    if(!$e('workspaceCourseSettings')){
      const settings=document.createElement('button');
      settings.id='workspaceCourseSettings';
      settings.type='button';
      settings.className='workspace-top-control';
      settings.textContent='Datos del curso';
      settings.addEventListener('click',()=>openSection(document.querySelector('.editor-course-sheet')));
      actions.insertAdjacentElement('afterbegin',settings);
    }

    if(!$e('workspaceMore')){
      const wrap=document.createElement('div');
      wrap.className='workspace-more-wrap';
      wrap.id='workspaceMore';
      wrap.innerHTML='<button type="button" class="workspace-top-control" aria-label="Más opciones">•••</button><div class="workspace-more-menu"><button type="button" data-workspace-review>Revisión del curso</button><button type="button" data-workspace-template>Empezar desde plantilla</button><button type="button" data-workspace-reload>Recargar desde Wix</button><button type="button" class="danger" data-workspace-delete-course>Eliminar curso…</button></div>';
      actions.appendChild(wrap);
      wrap.firstElementChild.addEventListener('click',e=>{e.stopPropagation();wrap.classList.toggle('open')});
      wrap.querySelector('[data-workspace-review]').addEventListener('click',()=>{document.body.classList.toggle('workspace-review-open');wrap.classList.remove('open');if(document.body.classList.contains('workspace-review-open'))$e('courseCompletenessCheck')?.scrollIntoView({behavior:'smooth',block:'center'})});
      wrap.querySelector('[data-workspace-template]').addEventListener('click',()=>{$e('courseTemplateBtn')?.click();wrap.classList.remove('open')});
      wrap.querySelector('[data-workspace-reload]').addEventListener('click',()=>{$e('reloadBtn')?.click();wrap.classList.remove('open')});
      wrap.querySelector('[data-workspace-delete-course]').addEventListener('click',()=>{$e('deleteCourseBtn')?.click();wrap.classList.remove('open')});
    }
  }

  function installOutline(){
    const outline=$e('moduleList')?.closest('.outline');
    if(!outline)return;
    if(!outline.querySelector('.workspace-outline-foot')){
      const foot=document.createElement('div');
      foot.className='workspace-outline-foot';
      foot.innerHTML='<button type="button" class="workspace-add-module">＋ Agregar módulo</button><div class="workspace-module-actions"><button type="button" aria-label="Opciones del módulo">•••</button><div class="workspace-module-menu"><button type="button" data-ws-module-up>↑ Mover módulo arriba</button><button type="button" data-ws-module-down>↓ Mover módulo abajo</button><button type="button" data-ws-module-duplicate>⧉ Duplicar módulo</button><button type="button" class="danger" data-ws-module-delete>Eliminar módulo…</button></div></div>';
      outline.appendChild(foot);
      foot.querySelector('.workspace-add-module').addEventListener('click',()=>$e('addModule')?.click());
      const actions=foot.querySelector('.workspace-module-actions');
      actions.firstElementChild.addEventListener('click',e=>{e.stopPropagation();actions.classList.toggle('open')});
      foot.querySelector('[data-ws-module-up]').addEventListener('click',()=>{$e('moduleUp')?.click();actions.classList.remove('open')});
      foot.querySelector('[data-ws-module-down]').addEventListener('click',()=>{$e('moduleDown')?.click();actions.classList.remove('open')});
      foot.querySelector('[data-ws-module-duplicate]').addEventListener('click',()=>{$e('duplicateModuleV2')?.click();actions.classList.remove('open')});
      foot.querySelector('[data-ws-module-delete]').addEventListener('click',()=>{$e('deleteModule')?.click();actions.classList.remove('open')});
    }
  }

  function installActiveModule(){
    const editor=document.querySelector('.editor');
    if(!editor||$e('workspaceActiveModule'))return;
    const bar=document.createElement('section');
    bar.id='workspaceActiveModule';
    bar.className='workspace-active-module';
    bar.innerHTML='<div><div class="workspace-active-module__kicker">Etapa seleccionada</div><h2 data-workspace-module-title>Módulo</h2><div class="workspace-active-module__meta" data-workspace-module-meta></div></div><div class="workspace-active-module__actions"><button type="button" data-workspace-config-module>Configurar módulo</button></div>';
    const courseSection=document.querySelector('.editor-course-sheet');
    editor.insertBefore(bar,courseSection||editor.firstChild);
    bar.querySelector('[data-workspace-config-module]').addEventListener('click',()=>openSection(document.querySelector('.editor-module-sheet')));
  }

  function installContentHeader(){
    const section=document.querySelector('.editor-contents-sheet');
    if(!section||section.querySelector('.workspace-content-head'))return;
    const head=document.createElement('div');
    head.className='workspace-content-head';
    head.innerHTML='<div><small>Contenido del módulo</small><h3>Recorrido de esta etapa</h3></div><button type="button" class="workspace-add-content">＋ Agregar contenido</button>';
    section.insertAdjacentElement('afterbegin',head);
    head.querySelector('.workspace-add-content').addEventListener('click',openPicker);
  }

  function installPicker(){
    if($e('workspaceContentPicker'))return;
    const overlay=document.createElement('div');
    overlay.id='workspaceContentPicker';
    overlay.className='workspace-picker';
    overlay.innerHTML='<section class="workspace-picker__card"><div class="workspace-picker__head"><div><h2>Agregar contenido</h2><p>Elegí qué querés sumar. Después CAFASSO te muestra solo las opciones de ese tipo.</p></div><button type="button" class="workspace-picker__close" aria-label="Cerrar">×</button></div><div class="workspace-picker__grid">'+TYPES.map(item=>'<button type="button" class="workspace-picker__type" data-workspace-type="'+esc(item[0])+'"><i>'+item[1]+'</i><span><strong>'+esc(item[0])+'</strong><small>'+esc(item[2])+'</small></span></button>').join('')+'</div></section>';
    document.body.appendChild(overlay);
    overlay.querySelector('.workspace-picker__close').addEventListener('click',closePicker);
    overlay.addEventListener('click',e=>{if(e.target===overlay)closePicker()});
    overlay.querySelectorAll('[data-workspace-type]').forEach(btn=>btn.addEventListener('click',()=>{
      const original=[...document.querySelectorAll('[data-type]')].find(x=>x.dataset.type===btn.dataset.workspaceType);
      original?.click();
      closePicker();
      setTimeout(()=>{refreshWorkspace();openBlockDrawer()},40);
    }));
  }
  function openPicker(){$e('workspaceContentPicker')?.classList.add('show')}
  function closePicker(){$e('workspaceContentPicker')?.classList.remove('show')}

  function installDrawer(){
    const section=document.querySelector('.editor-block-sheet');
    if(!section)return;
    if(!section.querySelector('.workspace-drawer-close')){
      const close=document.createElement('button');
      close.type='button';close.className='workspace-drawer-close';close.setAttribute('aria-label','Cerrar editor de contenido');close.textContent='×';
      close.addEventListener('click',closeBlockDrawer);section.appendChild(close);
    }
    if(!$e('workspaceBlockBackdrop')){
      const backdrop=document.createElement('div');
      backdrop.id='workspaceBlockBackdrop';backdrop.className='workspace-block-backdrop';
      backdrop.addEventListener('click',closeBlockDrawer);document.body.appendChild(backdrop);
    }
  }
  function openBlockDrawer(){
    let index=-1;try{index=Number(activeBlock)}catch(e){}
    const section=document.querySelector('.editor-block-sheet');
    const open=index>=0&&!!(currentModule()?.contents?.[index]);
    section?.classList.toggle('workspace-drawer-open',open);
    $e('workspaceBlockBackdrop')?.classList.toggle('show',open);
    document.body.style.overflow=open?'hidden':'';
    if(open){
      const b=currentModule()?.contents?.[index];
      const h=section?.querySelector(':scope>h3');
      if(h)h.textContent=b?'Editar · '+String(b.title||b.type||'Contenido'):'Editar contenido';
    }
  }
  function closeBlockDrawer(){
    try{saveBlockFields()}catch(e){}
    try{activeBlock=-1}catch(e){}
    try{renderContents();renderBlock()}catch(e){}
    document.querySelector('.editor-block-sheet')?.classList.remove('workspace-drawer-open');
    $e('workspaceBlockBackdrop')?.classList.remove('show');
    document.body.style.overflow='';
    setTimeout(refreshWorkspace,20);
  }

  function decorateModules(){
    const module=currentModule();
    document.querySelectorAll('#moduleList .module').forEach((row,i)=>{
      const m=data.modules?.[i];
      if(!m)return;
      let tag=row.querySelector('.workspace-module-tag');
      if(!tag){tag=document.createElement('span');tag.className='workspace-module-tag';row.querySelector('strong')?.appendChild(tag)}
      tag.textContent=isMission(m)?'🗺️ Misiones':'📖 Recorrido';
      if(!row.querySelector('.workspace-module-arrow')){
        const arrow=document.createElement('span');arrow.className='workspace-module-arrow';arrow.textContent='›';row.appendChild(arrow);
      }
      row.setAttribute('aria-label','Editar módulo '+(i+1)+': '+String(m.title||'Módulo'));
    });
    if(!module)return;
  }

  function decorateContents(){
    const rows=[...document.querySelectorAll('#contentList .content')];
    rows.forEach(row=>{
      if(!row.querySelector('.workspace-content-open')){
        const arrow=document.createElement('span');arrow.className='workspace-content-open';arrow.textContent='›';row.appendChild(arrow);
      }
    });
    const list=$e('contentList');
    if(list&&!rows.length&&!list.querySelector('.workspace-empty-content')){
      const empty=document.createElement('div');empty.className='workspace-empty-content';empty.textContent='Todavía no hay contenidos en este módulo. Usá “Agregar contenido” para empezar.';list.appendChild(empty);
    }
  }

  function refreshSummary(){
    const course=data.course||{};
    const modules=data.modules||[];
    const blocks=contentCount();
    const missionCount=modules.filter(isMission).length;
    const linearCount=modules.length-missionCount;
    const summary=document.querySelector('[data-workspace-summary]');
    const status=document.querySelector('[data-workspace-status]');
    const shape=document.querySelector('[data-workspace-shape]');
    const sync=document.querySelector('[data-workspace-sync]');
    if(summary)summary.textContent=modules.length+' módulo'+(modules.length===1?'':'s')+' · '+blocks+' contenido'+(blocks===1?'':'s');
    if(status){status.textContent=course.status||'Borrador';status.classList.toggle('is-published',String(course.status)==='Publicado')}
    if(shape)shape.textContent=missionCount&&linearCount?linearCount+' recorrido · '+missionCount+' misiones':missionCount?'🗺️ Misiones':'📖 Recorrido';
    if(sync)sync.textContent=$e('syncStatus')?.textContent||'';
  }

  function refreshActiveModule(){
    const m=currentModule();
    const title=document.querySelector('[data-workspace-module-title]');
    const meta=document.querySelector('[data-workspace-module-meta]');
    if(!m){if(title)title.textContent='Sin módulo';if(meta)meta.textContent='';return}
    if(title)title.textContent=(active+1)+'. '+String(m.title||'Módulo');
    if(meta){
      const bits=[
        isMission(m)?'🗺️ Misiones':'📖 Recorrido',
        String(m.status||'Borrador'),
        (m.contents||[]).length+' contenido'+((m.contents||[]).length===1?'':'s'),
        Number(m.estimatedMinutes||0)>0?Number(m.estimatedMinutes)+' min':null
      ].filter(Boolean);
      meta.innerHTML=bits.map(x=>'<span class="workspace-chip">'+esc(x)+'</span>').join('');
    }
  }

  function refreshWorkspace(){
    if(!document.body.classList.contains('cafasso-course-workspace'))return;
    refreshSummary();
    refreshActiveModule();
    decorateModules();
    decorateContents();
    installDrawer();
    openBlockDrawer();
  }

  function queueRefresh(){
    if(refreshQueued)return;
    refreshQueued=true;
    setTimeout(()=>{refreshQueued=false;refreshWorkspace()},20);
  }

  function patchRenders(){
    if(typeof render==='function'&&!render.__workspaceWrapped){
      const original=render;
      const wrapped=function(){const result=original.apply(this,arguments);queueRefresh();return result};
      wrapped.__workspaceWrapped=true;render=wrapped;
    }
    if(typeof renderContents==='function'&&!renderContents.__workspaceWrapped){
      const original=renderContents;
      const wrapped=function(){const result=original.apply(this,arguments);queueRefresh();return result};
      wrapped.__workspaceWrapped=true;renderContents=wrapped;
    }
    if(typeof renderBlock==='function'&&!renderBlock.__workspaceWrapped){
      const original=renderBlock;
      const wrapped=function(){const result=original.apply(this,arguments);queueRefresh();return result};
      wrapped.__workspaceWrapped=true;renderBlock=wrapped;
    }
  }

  function bindGlobal(){
    document.addEventListener('click',e=>{
      if(!e.target.closest('.workspace-more-wrap'))$e('workspaceMore')?.classList.remove('open');
      if(!e.target.closest('.workspace-module-actions'))document.querySelector('.workspace-module-actions')?.classList.remove('open');
      if(e.target.closest('#contentList .content'))setTimeout(()=>{refreshWorkspace();openBlockDrawer()},30);
      if(e.target.closest('#moduleList .module'))setTimeout(refreshWorkspace,30);
    });
    document.addEventListener('input',queueRefresh);
    document.addEventListener('change',queueRefresh);
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){closePicker();if(document.querySelector('.editor-block-sheet.workspace-drawer-open'))closeBlockDrawer()}});
  }

  function observeLists(){
    const options={childList:true};
    const observer=new MutationObserver(queueRefresh);
    const modules=$e('moduleList'),contents=$e('contentList'),sync=$e('syncStatus');
    if(modules)observer.observe(modules,options);
    if(contents)observer.observe(contents,options);
    if(sync)observer.observe(sync,{childList:true,characterData:true,subtree:true});
  }

  function init(){
    if(typeof data==='undefined'||typeof render!=='function'||!document.querySelector('.editor'))return;
    installStyles();
    document.body.classList.add('cafasso-course-workspace');
    installHeader();
    installOutline();
    installActiveModule();
    makeCollapsible(document.querySelector('.editor-course-sheet'),'Datos del curso','Título, descripción, estado, versión y certificado.');
    makeCollapsible(document.querySelector('.editor-module-sheet'),'Configuración del módulo','Nombre, duración, desbloqueo y tipo de experiencia.');
    installContentHeader();
    installPicker();
    installDrawer();
    bindGlobal();
    patchRenders();
    observeLists();
    refreshWorkspace();
    setTimeout(()=>{patchRenders();refreshWorkspace()},900);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,700),{once:true});
  else setTimeout(init,700);
})();