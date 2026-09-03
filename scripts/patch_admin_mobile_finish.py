from pathlib import Path

FILES = {
    'entregas.html': {
        'title':'Entregas',
        'active':'entregas',
        'extra_css': r'''
/* CAFASSO ADMIN MOBILE FINISH */
.mobile-admin-head,.mobile-admin-nav,.mobile-admin-more{display:none}
@media(max-width:700px){
 body{padding-bottom:76px;background:#F8F3EB}.wrap{padding:18px 14px 28px}.top{display:none!important}
 .mobile-admin-head{display:flex;position:sticky;top:0;z-index:45;align-items:center;justify-content:space-between;gap:12px;min-height:66px;padding:10px 14px;background:linear-gradient(135deg,var(--navy),#0A2440);box-shadow:0 5px 18px rgba(10,36,64,.16)}
 .mobile-admin-brand{display:flex;align-items:center;gap:10px;color:#fff;text-decoration:none}.mobile-admin-brand img{width:34px;height:40px;object-fit:contain}.mobile-admin-brand b{display:block;font:700 20px Georgia,serif;line-height:1}.mobile-admin-brand small{display:block;font-size:9px;letter-spacing:.08em;opacity:.72;margin-top:4px}.mobile-admin-home{width:40px;height:40px;border:0;border-radius:50%;background:var(--gold);color:var(--navy);font-weight:900;font-size:18px}
 .stats{grid-template-columns:1fr 1fr;gap:10px}.stat{padding:14px}.stat strong{font-size:26px}.filters{grid-template-columns:1fr;gap:8px}.filters input,.filters select{min-height:46px;font-size:16px}.table{overflow:visible;border:0;background:transparent}table{display:block;min-width:0;width:100%}thead{display:none}tbody{display:grid;gap:10px}tr{display:block;background:#fff;border:1px solid var(--line);border-radius:17px;padding:8px 14px;box-shadow:0 7px 18px rgba(25,37,54,.05)}td{display:grid;grid-template-columns:104px minmax(0,1fr);gap:10px;align-items:center;padding:9px 0;border-bottom:1px solid #EEE6DB;font-size:13px;overflow-wrap:anywhere}td:last-child{border-bottom:0}td:before{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);font-weight:800}td:nth-child(1):before{content:'Animador'}td:nth-child(2):before{content:'Curso'}td:nth-child(3):before{content:'Tipo'}td:nth-child(4):before{content:'Respuesta'}td:nth-child(5):before{content:'Estado'}td:nth-child(6):before{content:'Actualizada'}td:nth-child(7):before{content:'Acción'}td:nth-child(7){display:flex;justify-content:flex-end}.btn{min-height:42px}.modal-wrap{padding:10px;align-items:end}.modal{border-radius:24px 24px 18px 18px;padding:20px;max-height:90vh}.actions{display:grid;grid-template-columns:1fr;gap:8px}.actions .btn{width:100%;min-height:46px}.answer{font-size:14px;line-height:1.55}
 .mobile-admin-nav{display:grid;grid-template-columns:repeat(4,1fr);position:fixed;left:0;right:0;bottom:0;z-index:65;background:rgba(255,253,249,.97);backdrop-filter:blur(14px);border-top:1px solid var(--line);padding:7px 7px calc(7px + env(safe-area-inset-bottom));box-shadow:0 -8px 24px rgba(15,45,77,.10)}.mobile-admin-nav a,.mobile-admin-nav button{border:0;background:transparent;color:#647284;text-decoration:none;border-radius:13px;min-height:54px;padding:5px 3px;display:grid;place-items:center;gap:1px;font:700 10px Inter,system-ui}.mobile-admin-nav .ico{font-size:20px}.mobile-admin-nav .active{background:#FFF4CC;color:var(--navy)}
 .mobile-admin-more{position:fixed;inset:0;z-index:85;background:rgba(10,25,45,.38);align-items:flex-end;padding:14px}.mobile-admin-more.show{display:flex}.mobile-admin-sheet{width:100%;background:var(--card);border:1px solid var(--line);border-radius:24px;padding:10px 10px calc(10px + env(safe-area-inset-bottom));box-shadow:0 22px 70px rgba(10,25,45,.28)}.mobile-admin-sheet-head{display:flex;align-items:center;justify-content:space-between;padding:8px 8px 12px}.mobile-admin-sheet-head strong{font:22px Georgia,serif;color:var(--navy)}.mobile-admin-sheet-head button{border:0;background:#F2ECE3;border-radius:50%;width:36px;height:36px;font-size:18px}.mobile-admin-sheet a{display:flex;width:100%;align-items:center;gap:12px;text-decoration:none;color:var(--navy);padding:14px;border-radius:14px;font:800 14px Inter,system-ui}
}
'''
    },
    'reportes.html': {
        'title':'Reportes',
        'active':'reportes',
        'extra_css': r'''
/* CAFASSO ADMIN MOBILE FINISH */
.mobile-admin-head,.mobile-admin-nav,.mobile-admin-more{display:none}
@media(max-width:700px){
 body{padding-bottom:76px;background:#F8F3EB}.side{display:none!important}.shell{display:block}.mobile-admin-head{display:flex;position:sticky;top:0;z-index:45;align-items:center;justify-content:space-between;gap:12px;min-height:66px;padding:10px 14px;background:linear-gradient(135deg,var(--navy),#0A2440);box-shadow:0 5px 18px rgba(10,36,64,.16)}
 .mobile-admin-brand{display:flex;align-items:center;gap:10px;color:#fff;text-decoration:none}.mobile-admin-brand img{width:34px;height:40px;object-fit:contain}.mobile-admin-brand b{display:block;font:700 20px Georgia,serif;line-height:1}.mobile-admin-brand small{display:block;font-size:9px;letter-spacing:.08em;opacity:.72;margin-top:4px}.mobile-admin-home{width:40px;height:40px;border:0;border-radius:50%;background:var(--gold);color:var(--navy);font-weight:900;font-size:18px}
 main{padding:18px 14px 28px}.head{gap:10px;margin-bottom:18px}.head h1{font-size:29px;line-height:1.08}.head p{font-size:13px;line-height:1.45}.status{font-size:11px}.filters{grid-template-columns:1fr;gap:8px}.filters input,.filters select,.filters .btn{width:100%;min-height:46px;font-size:16px}.kpis{grid-template-columns:1fr 1fr;gap:10px}.kpi{padding:14px}.kpi strong{font-size:26px}.layout{grid-template-columns:1fr;gap:12px}.box{padding:16px}.title h3{font-size:22px}.table{overflow:visible;border:0;background:transparent}table{display:block;min-width:0;width:100%}thead{display:none}tbody{display:grid;gap:10px}tr{display:block;background:#fff;border:1px solid var(--line);border-radius:17px;padding:8px 14px;box-shadow:0 7px 18px rgba(25,37,54,.05)}td{display:grid;grid-template-columns:104px minmax(0,1fr);gap:10px;align-items:center;padding:9px 0;border-bottom:1px solid #EEE6DB;font-size:13px;overflow-wrap:anywhere}td:last-child{border-bottom:0}td:before{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);font-weight:800}td:nth-child(1):before{content:'Animador'}td:nth-child(2):before{content:'Grupo'}td:nth-child(3):before{content:'Curso'}td:nth-child(4):before{content:'Progreso'}td:nth-child(5):before{content:'Estado'}td:nth-child(6):before{content:'Último acceso'}.progress{min-width:0}.group-row{padding:12px}
 .mobile-admin-nav{display:grid;grid-template-columns:repeat(4,1fr);position:fixed;left:0;right:0;bottom:0;z-index:65;background:rgba(255,253,249,.97);backdrop-filter:blur(14px);border-top:1px solid var(--line);padding:7px 7px calc(7px + env(safe-area-inset-bottom));box-shadow:0 -8px 24px rgba(15,45,77,.10)}.mobile-admin-nav a,.mobile-admin-nav button{border:0;background:transparent;color:#647284;text-decoration:none;border-radius:13px;min-height:54px;padding:5px 3px;display:grid;place-items:center;gap:1px;font:700 10px Inter,system-ui}.mobile-admin-nav .ico{font-size:20px}.mobile-admin-nav .active{background:#FFF4CC;color:var(--navy)}
 .mobile-admin-more{position:fixed;inset:0;z-index:85;background:rgba(10,25,45,.38);align-items:flex-end;padding:14px}.mobile-admin-more.show{display:flex}.mobile-admin-sheet{width:100%;background:var(--card);border:1px solid var(--line);border-radius:24px;padding:10px 10px calc(10px + env(safe-area-inset-bottom));box-shadow:0 22px 70px rgba(10,25,45,.28)}.mobile-admin-sheet-head{display:flex;align-items:center;justify-content:space-between;padding:8px 8px 12px}.mobile-admin-sheet-head strong{font:22px Georgia,serif;color:var(--navy)}.mobile-admin-sheet-head button{border:0;background:#F2ECE3;border-radius:50%;width:36px;height:36px;font-size:18px}.mobile-admin-sheet a{display:flex;width:100%;align-items:center;gap:12px;text-decoration:none;color:var(--navy);padding:14px;border-radius:14px;font:800 14px Inter,system-ui}
}
'''
    }
}

HEADER='''<header class="mobile-admin-head"><a class="mobile-admin-brand" href="./" aria-label="Inicio CAFASSO"><img src="https://static.wixstatic.com/media/47bf07_3bf4fe6421f34a05990caa87c98fffc2~mv2.webp" alt="Maturana"><div><b>CAFASSO</b><small>ADMINISTRACIÓN</small></div></a><button class="mobile-admin-home" onclick="location.href='./admin.html'" aria-label="Panel de administración">⌂</button></header>'''
NAV='''<nav class="mobile-admin-nav"><a href="./admin.html"><span class="ico">▦</span><span>Resumen</span></a><a href="./animadores.html"><span class="ico">👥</span><span>Animadores</span></a><a href="./admin.html#cursos"><span class="ico">📚</span><span>Cursos</span></a><button type="button" onclick="document.getElementById('mobileAdminMore').classList.add('show')"><span class="ico">•••</span><span>Más</span></button></nav><div class="mobile-admin-more" id="mobileAdminMore" onclick="if(event.target===this)this.classList.remove('show')"><div class="mobile-admin-sheet"><div class="mobile-admin-sheet-head"><strong>Administración</strong><button type="button" onclick="document.getElementById('mobileAdminMore').classList.remove('show')">×</button></div><a href="./grupos.html">◉ Grupos</a><a href="./asignaciones.html">↗ Asignaciones</a><a href="./entregas.html">📥 Entregas</a><a href="./reportes.html">📊 Reportes</a><a href="./">⌂ Volver a CAFASSO</a></div></div>'''

base=Path('cafasso-wix-import')
for name,cfg in FILES.items():
    p=base/name
    s=p.read_text(encoding='utf-8')
    if 'CAFASSO ADMIN MOBILE FINISH' not in s:
        s=s.replace('</style>', cfg['extra_css']+'\n</style>', 1)
        s=s.replace('<body>', '<body>'+HEADER, 1)
        s=s.replace('</body>', NAV+'</body>', 1)
    if cfg['active']=='entregas':
        s=s.replace('<a href="./entregas.html">📥 Entregas</a>', '<a class="active" href="./entregas.html">📥 Entregas</a>')
    else:
        s=s.replace('<a href="./reportes.html">📊 Reportes</a>', '<a class="active" href="./reportes.html">📊 Reportes</a>')
    p.write_text(s,encoding='utf-8')
