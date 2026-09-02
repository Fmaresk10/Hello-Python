from pathlib import Path
p=Path('cafasso-wix-import/admin.html')
s=p.read_text()
s=s.replace('<div class="title"><h3>Situación</h3></div><div class="alerts" id="alerts"></div>','<div class="title"><h3>Seguimiento de animadores</h3><a class="tiny" href="./animadores.html">Ver todos</a></div><div class="alerts" id="alerts"></div>')
old="$('alerts').innerHTML=`<div class=\"alert\"><strong>${s.invitedUsers||0} usuarios invitados</strong><small>Aún no registran actividad.</small></div><div class=\"alert\"><strong>${s.pendingSubmissions||0} entregas pendientes</strong><small>Quedarán disponibles para revisión.</small></div><div class=\"alert\"><strong>${s.draftCourses||0} cursos en borrador</strong><small>No son visibles como publicados.</small></div>`;renderCourses()"
new="""const now=Date.now(),users=(state.users||[]).filter(u=>(u.role||'Animador')==='Animador'&&!['Bloqueado','Inactivo'].includes(u.status));const inactive=users.filter(u=>!u.lastAccess||(now-new Date(u.lastAccess).getTime())>14*86400000);const noProgress=users.filter(u=>(Number(u.progressPercent)||0)===0);const temporary=users.filter(u=>u.mustChangePassword);const attention=[{n:inactive.length,t:'Sin actividad reciente',d:'Animadores sin ingreso en los últimos 14 días.',href:'./animadores.html'},{n:noProgress.length,t:'Sin comenzar',d:'Todavía no registran progreso en sus cursos.',href:'./reportes.html'},{n:temporary.length,t:'Contraseña temporal',d:'Aún deben definir su contraseña personal.',href:'./animadores.html'},{n:s.pendingSubmissions||0,t:'Entregas pendientes',d:'Requieren revisión del equipo formador.',href:'./entregas.html'}];$('alerts').innerHTML=attention.map(a=>`<div class=\"alert\"><strong>${a.n} · ${a.t}</strong><small>${a.d}</small><div style=\"margin-top:9px\"><a class=\"tiny\" href=\"${a.href}\">Revisar</a></div></div>`).join('');renderCourses()"""
if old not in s:
    raise SystemExit('alerts anchor not found')
s=s.replace(old,new)
p.write_text(s)
