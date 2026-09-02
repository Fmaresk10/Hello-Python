from pathlib import Path
p=Path('cafasso-wix-import/admin.html')
s=p.read_text()
marker='/* CAFASSO ADMIN MOBILE V1 */'
css='''
/* CAFASSO ADMIN MOBILE V1 */
.admin-mobile-head,.admin-mobile-nav,.admin-mobile-more{display:none}
@media(max-width:700px){
  body{padding-bottom:76px;background:#F8F3EB}
  .shell{display:block;min-height:100vh}
  .side{display:none!important}
  .admin-mobile-head{display:flex;position:sticky;top:0;z-index:45;align-items:center;justify-content:space-between;gap:12px;min-height:66px;padding:10px 14px;background:linear-gradient(135deg,var(--navy),#0A2440);box-shadow:0 5px 18px rgba(10,36,64,.16)}
  .admin-mobile-brand{display:flex;align-items:center;gap:10px;color:#fff;text-decoration:none;min-width:0}
  .admin-mobile-brand img{width:34px;height:40px;object-fit:contain}
  .admin-mobile-brand b{display:block;font:700 20px Georgia,serif;line-height:1}
  .admin-mobile-brand small{display:block;font-size:9px;letter-spacing:.08em;opacity:.72;margin-top:4px}
  .admin-mobile-home{width:40px;height:40px;border:0;border-radius:50%;background:var(--gold);color:var(--navy);font-weight:900;font-size:18px;cursor:pointer}
  main{padding:18px 14px 28px}
  .head{margin-bottom:18px;gap:10px}
  .head h1{font-size:29px;line-height:1.08;margin-top:6px}
  .head p{font-size:13px;line-height:1.45}
  .status{font-size:11px;padding:8px 10px}
  .kpis,.course-summary{grid-template-columns:1fr 1fr;gap:10px}
  .kpi{padding:15px;min-height:108px}
  .kpi strong{font-size:28px}
  .grid{grid-template-columns:1fr;gap:12px;margin-top:12px}
  .box{padding:17px}
  .title{align-items:flex-start;gap:10px}
  .title h3{font-size:23px}
  .title .btn{min-height:44px}
  .alerts{gap:8px}
  .alert{padding:13px}
  .filters{display:grid;grid-template-columns:1fr;gap:8px}
  .filters input,.filters select{width:100%;min-width:0;font-size:16px;min-height:46px}
  .course-chip{padding:13px}
  .course-chip strong{font-size:23px}
  .table{overflow:visible;border:0;background:transparent;border-radius:0}
  table{min-width:0;width:100%;display:block}
  thead{display:none}
  tbody{display:grid;gap:10px}
  tr{display:block;background:#fff;border:1px solid var(--line);border-radius:17px;padding:8px 14px;box-shadow:0 7px 18px rgba(25,37,54,.05)}
  td{display:grid;grid-template-columns:108px minmax(0,1fr);gap:10px;align-items:center;padding:9px 0;border-bottom:1px solid #EEE6DB;font-size:13px;overflow-wrap:anywhere}
  td:last-child{border-bottom:0}
  td:before{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);font-weight:800}
  td:nth-child(1):before{content:'Curso'}td:nth-child(2):before{content:'Estado'}td:nth-child(3):before{content:'Módulos'}td:nth-child(4):before{content:'Asignados'}td:nth-child(5):before{content:'Progreso'}td:nth-child(6):before{content:'Actualizado'}td:nth-child(7):before{content:'Acciones'}
  .course-actions{white-space:normal;display:flex;gap:6px;flex-wrap:wrap}
  .tiny{min-height:38px;padding:9px 10px}
  .note{font-size:12px;line-height:1.5}
  .modal-wrap{padding:10px;align-items:end}
  .modal{border-radius:24px 24px 18px 18px;padding:20px;max-height:90vh;overflow:auto}
  .modal-actions{display:grid;grid-template-columns:1fr;gap:8px}
  .modal-actions .btn{width:100%;min-height:46px}
  .two{grid-template-columns:1fr}
  input,select,textarea,button{touch-action:manipulation}
  .admin-mobile-nav{display:grid;grid-template-columns:repeat(4,1fr);position:fixed;left:0;right:0;bottom:0;z-index:65;background:rgba(255,253,249,.97);backdrop-filter:blur(14px);border-top:1px solid var(--line);padding:7px 7px calc(7px + env(safe-area-inset-bottom));box-shadow:0 -8px 24px rgba(15,45,77,.10)}
  .admin-mobile-nav button,.admin-mobile-nav a{border:0;background:transparent;color:#647284;text-decoration:none;border-radius:13px;min-height:54px;padding:5px 3px;display:grid;place-items:center;gap:1px;font:700 10px Inter,system-ui;cursor:pointer}
  .admin-mobile-nav .ico{font-size:20px;line-height:1}
  .admin-mobile-nav .active{background:#FFF4CC;color:var(--navy)}
  .admin-mobile-more{position:fixed;inset:0;z-index:85;background:rgba(10,25,45,.38);align-items:flex-end;padding:14px}
  .admin-mobile-more.show{display:flex}
  .admin-mobile-sheet{width:100%;background:var(--card);border:1px solid var(--line);border-radius:24px;padding:10px 10px calc(10px + env(safe-area-inset-bottom));box-shadow:0 22px 70px rgba(10,25,45,.28)}
  .admin-mobile-sheet-head{display:flex;align-items:center;justify-content:space-between;padding:8px 8px 12px}
  .admin-mobile-sheet-head strong{font:22px Georgia,serif;color:var(--navy)}
  .admin-mobile-sheet-head button{border:0;background:#F2ECE3;border-radius:50%;width:36px;height:36px;font-size:18px}
  .admin-mobile-sheet a{display:flex;width:100%;align-items:center;gap:12px;text-decoration:none;color:var(--navy);padding:14px;border-radius:14px;font:800 14px Inter,system-ui}
  .admin-mobile-sheet a:active{background:#F7F1E8}
}
'''
if marker not in s:
    s=s.replace('</style>',css+'</style>',1)

head='''<header class="admin-mobile-head"><a class="admin-mobile-brand" href="./" aria-label="Inicio CAFASSO"><img src="https://static.wixstatic.com/media/47bf07_3bf4fe6421f34a05990caa87c98fffc2~mv2.webp" alt="Maturana"><div><b>CAFASSO</b><small>ADMINISTRACIÓN</small></div></a><button class="admin-mobile-home" onclick="location.href='./'" aria-label="Volver a CAFASSO">⌂</button></header>'''
nav='''<nav class="admin-mobile-nav" aria-label="Administración"><button id="admMobResumen" class="active"><span class="ico">▦</span><span>Resumen</span></button><a href="./animadores.html"><span class="ico">👥</span><span>Animadores</span></a><button id="admMobCursos"><span class="ico">📚</span><span>Cursos</span></button><button id="admMobMore"><span class="ico">•••</span><span>Más</span></button></nav><div id="admMobMoreWrap" class="admin-mobile-more"><section class="admin-mobile-sheet"><div class="admin-mobile-sheet-head"><strong>Administración</strong><button id="admMobClose" aria-label="Cerrar">×</button></div><a href="./grupos.html">◉ Grupos</a><a href="./asignaciones.html">↗ Asignaciones</a><a href="./entregas.html">📥 Entregas</a><a href="./reportes.html">📊 Reportes</a><a href="./">← Volver a CAFASSO</a></section></div>'''
if 'admin-mobile-head' not in s.split('<body>',1)[1]:
    s=s.replace('<body>','<body>'+head,1)
if 'id="admMobResumen"' not in s:
    s=s.replace('</body>',nav+'''<script>(function(){var r=document.getElementById('admMobResumen'),c=document.getElementById('admMobCursos'),m=document.getElementById('admMobMore'),w=document.getElementById('admMobMoreWrap'),x=document.getElementById('admMobClose');function sel(which){if(r)r.classList.toggle('active',which==='resumen');if(c)c.classList.toggle('active',which==='cursos')}if(r)r.onclick=function(){var b=document.querySelector('.menu [data-tab="resumen"]');if(b)b.click();sel('resumen')};if(c)c.onclick=function(){var b=document.querySelector('.menu [data-tab="cursos"]');if(b)b.click();sel('cursos')};if(m)m.onclick=function(){w.classList.add('show')};if(x)x.onclick=function(){w.classList.remove('show')};if(w)w.onclick=function(e){if(e.target===w)w.classList.remove('show')};})();</script></body>''',1)
p.write_text(s)
