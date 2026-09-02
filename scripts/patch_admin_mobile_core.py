from pathlib import Path

CREST='https://static.wixstatic.com/media/47bf07_3bf4fe6421f34a05990caa87c98fffc2~mv2.webp'

COMMON='''
/* CAFASSO ADMIN CORE MOBILE */
.core-mobile-head,.core-mobile-nav,.core-mobile-more{display:none}
@media(max-width:700px){
  body{padding-bottom:76px;background:#F8F3EB}
  .core-mobile-head{display:flex;position:sticky;top:0;z-index:45;align-items:center;justify-content:space-between;gap:12px;min-height:66px;padding:10px 14px;background:linear-gradient(135deg,var(--navy),#0A2440);box-shadow:0 5px 18px rgba(10,36,64,.16)}
  .core-mobile-brand{display:flex;align-items:center;gap:10px;color:#fff;text-decoration:none;min-width:0}
  .core-mobile-brand img{width:34px;height:40px;object-fit:contain}.core-mobile-brand b{display:block;font:700 20px Georgia,serif;line-height:1}.core-mobile-brand small{display:block;font-size:9px;letter-spacing:.08em;opacity:.72;margin-top:4px}
  .core-mobile-home{width:40px;height:40px;border:0;border-radius:50%;background:var(--gold);color:var(--navy);font-weight:900;font-size:18px;cursor:pointer}
  .core-mobile-nav{display:grid;grid-template-columns:repeat(4,1fr);position:fixed;left:0;right:0;bottom:0;z-index:65;background:rgba(255,253,249,.97);backdrop-filter:blur(14px);border-top:1px solid var(--line);padding:7px 7px calc(7px + env(safe-area-inset-bottom));box-shadow:0 -8px 24px rgba(15,45,77,.10)}
  .core-mobile-nav a,.core-mobile-nav button{border:0;background:transparent;color:#647284;text-decoration:none;border-radius:13px;min-height:54px;padding:5px 3px;display:grid;place-items:center;gap:1px;font:700 10px Inter,system-ui;cursor:pointer}.core-mobile-nav .ico{font-size:20px;line-height:1}.core-mobile-nav .active{background:#FFF4CC;color:var(--navy)}
  .core-mobile-more{position:fixed;inset:0;z-index:85;background:rgba(10,25,45,.38);align-items:flex-end;padding:14px}.core-mobile-more.show{display:flex}.core-mobile-sheet{width:100%;background:var(--card);border:1px solid var(--line);border-radius:24px;padding:10px 10px calc(10px + env(safe-area-inset-bottom));box-shadow:0 22px 70px rgba(10,25,45,.28)}.core-mobile-sheet-head{display:flex;align-items:center;justify-content:space-between;padding:8px 8px 12px}.core-mobile-sheet-head strong{font:22px Georgia,serif;color:var(--navy)}.core-mobile-sheet-head button{border:0;background:#F2ECE3;border-radius:50%;width:36px;height:36px;font-size:18px}.core-mobile-sheet a{display:flex;width:100%;align-items:center;gap:12px;text-decoration:none;color:var(--navy);padding:14px;border-radius:14px;font:800 14px Inter,system-ui}.core-mobile-sheet a:active{background:#F7F1E8}
}
'''

HEADER='''<header class="core-mobile-head"><a class="core-mobile-brand" href="./" aria-label="Inicio CAFASSO"><img src="'''+CREST+'''" alt="Maturana"><div><b>CAFASSO</b><small>ADMINISTRACIÓN</small></div></a><button class="core-mobile-home" onclick="location.href='./admin.html'" aria-label="Panel de administración">⌂</button></header>'''
MORE='''<div id="coreMobileMore" class="core-mobile-more"><section class="core-mobile-sheet"><div class="core-mobile-sheet-head"><strong>Administración</strong><button id="coreMobileClose" aria-label="Cerrar">×</button></div><a href="./grupos.html">◉ Grupos</a><a href="./asignaciones.html">↗ Asignaciones</a><a href="./entregas.html">📥 Entregas</a><a href="./reportes.html">📊 Reportes</a><a href="./">← Volver a CAFASSO</a></section></div>'''
JS='''<script>(function(){var m=document.getElementById('coreMobileMenu'),w=document.getElementById('coreMobileMore'),c=document.getElementById('coreMobileClose');if(m&&w)m.onclick=function(){w.classList.add('show')};if(c&&w)c.onclick=function(){w.classList.remove('show')};if(w)w.onclick=function(e){if(e.target===w)w.classList.remove('show')};})();</script>'''

def patch(path, active):
    p=Path(path); s=p.read_text()
    if 'CAFASSO ADMIN CORE MOBILE' not in s:
        s=s.replace('</style>',COMMON+'\n</style>',1)
    if 'core-mobile-head' not in s.split('<body>',1)[1][:500]:
        s=s.replace('<body>','<body>'+HEADER,1)
    nav=f'''<nav class="core-mobile-nav" aria-label="Administración"><a class="{'active' if active=='resumen' else ''}" href="./admin.html"><span class="ico">▦</span><span>Resumen</span></a><a class="{'active' if active=='animadores' else ''}" href="./animadores.html"><span class="ico">👥</span><span>Animadores</span></a><a class="{'active' if active=='cursos' else ''}" href="./admin.html#cursos"><span class="ico">📚</span><span>Cursos</span></a><button id="coreMobileMenu"><span class="ico">•••</span><span>Más</span></button></nav>'''
    if 'id="coreMobileMenu"' not in s:
        s=s.replace('</body>',nav+MORE+JS+'</body>',1)
    p.write_text(s)

patch('cafasso-wix-import/animadores.html','animadores')
patch('cafasso-wix-import/grupos.html','')
patch('cafasso-wix-import/asignaciones.html','')

# Animadores: convert wide table to cards and stack controls.
p=Path('cafasso-wix-import/animadores.html'); s=p.read_text()
marker='/* CAFASSO ANIMADORES MOBILE CARDS */'
if marker not in s:
    extra='''\n/* CAFASSO ANIMADORES MOBILE CARDS */\n@media(max-width:700px){.side{display:none!important}.shell{display:block}.head{gap:10px}.head h1{font-size:29px;line-height:1.08}.head p{font-size:13px;line-height:1.45}.status{font-size:11px}.actions,.filters{display:grid;grid-template-columns:1fr;gap:8px}.actions .btn,.filters input,.filters select{width:100%;min-width:0;min-height:46px;font-size:16px}.kpis{grid-template-columns:1fr 1fr;gap:10px}.kpi{padding:14px;min-height:92px}.kpi strong{font-size:26px}.bulk.show{display:grid;grid-template-columns:1fr;gap:8px}.bulk select,.bulk .btn{width:100%;min-height:44px}.bulk strong{width:auto}.table{overflow:visible;border:0;background:transparent}table{display:block;min-width:0;width:100%}thead{display:none}tbody{display:grid;gap:10px}tr{display:block;background:#fff;border:1px solid var(--line);border-radius:17px;padding:8px 14px;box-shadow:0 7px 18px rgba(25,37,54,.05)}td{display:grid;grid-template-columns:104px minmax(0,1fr);gap:10px;align-items:center;padding:9px 0;border-bottom:1px solid #EEE6DB;font-size:13px;overflow-wrap:anywhere}td:last-child{border-bottom:0}td:before{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);font-weight:800}td:nth-child(1):before{content:'Seleccionar'}td:nth-child(2):before{content:'Persona'}td:nth-child(3):before{content:'Grupo'}td:nth-child(4):before{content:'Rol'}td:nth-child(5):before{content:'Estado'}td:nth-child(6):before{content:'Progreso'}td:nth-child(7):before{content:'Último acceso'}td:nth-child(8):before{content:'Contraseña'}td:nth-child(9):before{content:'Acciones'}td:nth-child(9){display:flex;flex-wrap:wrap;gap:6px;padding-top:12px}.bar{width:72px}.modal-wrap{padding:10px;align-items:end}.modal{border-radius:24px 24px 18px 18px;padding:20px;max-height:90vh;overflow:auto}.modal-actions{display:grid;grid-template-columns:1fr}.modal-actions .btn{width:100%;min-height:46px}.two{grid-template-columns:1fr}}\n'''
    s=s.replace('</style>',extra+'</style>',1);p.write_text(s)

# Grupos: mobile app header, full-width actions and cards.
p=Path('cafasso-wix-import/grupos.html'); s=p.read_text()
if 'CAFASSO GRUPOS MOBILE' not in s:
    extra='''\n/* CAFASSO GRUPOS MOBILE */\n@media(max-width:700px){.wrap{padding:18px 14px 26px}.top>.brand{display:none}.top{display:block}.actions{display:grid;grid-template-columns:1fr 1fr}.actions .btn{text-align:center;min-height:44px}h1{font-size:31px;margin:18px 0 5px}.lead{font-size:13px;line-height:1.45}.filters{margin-top:18px}.filters input{width:100%;font-size:16px;min-height:46px}.grid{grid-template-columns:1fr;gap:12px}.card{padding:17px;border-radius:18px}.card h3{font-size:25px}.card p{min-height:0;line-height:1.5}.stats{gap:7px}.stat{padding:10px}.foot{align-items:stretch;flex-direction:column}.foot .btn{text-align:center;min-height:44px}.status{line-height:1.4}}\n'''
    s=s.replace('</style>',extra+'</style>',1);p.write_text(s)

# Asignaciones: cards instead of horizontal table, stacked toolbar/modal.
p=Path('cafasso-wix-import/asignaciones.html'); s=p.read_text()
if 'CAFASSO ASIGNACIONES MOBILE' not in s:
    extra='''\n/* CAFASSO ASIGNACIONES MOBILE */\n@media(max-width:700px){.side{display:none!important}.shell{display:block}main{padding:18px 14px 28px}.head{gap:10px}.head h1{font-size:29px;line-height:1.08}.head p{font-size:13px;line-height:1.45}.status{font-size:11px}.summary{grid-template-columns:1fr 1fr;gap:10px}.chip{padding:14px;min-height:92px}.chip strong{font-size:26px}.toolbar{display:grid;grid-template-columns:1fr;gap:8px}.toolbar input,.toolbar select,.toolbar .btn{width:100%;min-width:0;min-height:46px;font-size:16px}.grid{grid-template-columns:1fr;gap:12px}.box{padding:16px}.title{align-items:flex-start}.table{overflow:visible;border:0;background:transparent}table{display:block;min-width:0;width:100%}thead{display:none}tbody{display:grid;gap:10px}tr{display:block;background:#fff;border:1px solid var(--line);border-radius:17px;padding:8px 14px;box-shadow:0 7px 18px rgba(25,37,54,.05)}td{display:grid;grid-template-columns:96px minmax(0,1fr);gap:10px;align-items:center;padding:9px 0;border-bottom:1px solid #EEE6DB;font-size:13px;overflow-wrap:anywhere}td:last-child{border-bottom:0;display:flex;gap:7px;flex-wrap:wrap;padding-top:12px}td:before{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);font-weight:800}td:nth-child(1):before{content:'Curso'}td:nth-child(2):before{content:'Destino'}td:nth-child(3):before{content:'Tipo'}td:nth-child(4):before{content:'Estado'}td:nth-child(5):before{content:'Acciones'}.tiny{min-height:38px;padding:9px 10px}.course-card{padding:13px}.modal-wrap{padding:10px;align-items:end}.modal{border-radius:24px 24px 18px 18px;padding:20px;max-height:90vh}.target-list{grid-template-columns:1fr}.modal-actions{display:grid;grid-template-columns:1fr}.modal-actions .btn{width:100%;min-height:46px}}\n'''
    s=s.replace('</style>',extra+'</style>',1);p.write_text(s)
