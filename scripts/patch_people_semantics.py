from pathlib import Path

ROOT = Path('cafasso-wix-import')


def replace(path, old, new):
    p = ROOT / path
    s = p.read_text(encoding='utf-8')
    if old not in s:
        raise SystemExit(f'No encontré el bloque esperado en {path}: {old[:80]!r}')
    s = s.replace(old, new)
    p.write_text(s, encoding='utf-8')


# --- Nombre general de la sección: Personas ---
for path in ['admin.html', 'animadores.html']:
    p = ROOT / path
    s = p.read_text(encoding='utf-8')
    s = s.replace('>👥 &nbsp; Animadores<', '>👥 &nbsp; Personas<')
    s = s.replace('<span>Animadores</span>', '<span>Personas</span>')
    s = s.replace('<span>Animadores<small>Usuarios y perfiles</small></span>', '<span>Personas<small>Usuarios y perfiles</small></span>')
    p.write_text(s, encoding='utf-8')

p = ROOT / 'animadores.html'
s = p.read_text(encoding='utf-8')
s = s.replace('<title>CAFASSO · Animadores</title>', '<title>CAFASSO · Personas</title>')
s = s.replace('<h1>Animadores y accesos</h1>', '<h1>Personas y accesos</h1>')
s = s.replace('<div class="eyebrow">Gestión de usuarios</div>', '<div class="eyebrow">Gestión de personas</div>')
s = s.replace('<small>Animadores activos</small><strong id="kActive">0</strong>', '<small>Animadores activos</small><strong id="kActive">0</strong>')
p.write_text(s, encoding='utf-8')

# --- Criterio único: animador = rol Animador; o Formador/Administrador con curso publicado asignado ---
admin_helper = "function isLearningUser(u){const role=String(u.role||'Animador').toLowerCase();if(role.includes('animador'))return true;if(!(role.includes('formador')||role.includes('admin')))return false;const published=new Set((state.courses||[]).filter(c=>c.status==='Publicado').map(c=>String(c._id)));return (state.assignments||[]).some(a=>a.active!==false&&published.has(String(a.courseId))&&((a.targetType==='user'&&String(a.targetId)===String(u._id))||(a.targetType==='group'&&u.groupId&&String(a.targetId)===String(u.groupId))))}"

p = ROOT / 'admin.html'
s = p.read_text(encoding='utf-8')
needle = "function busy(v){$('main').classList.toggle('loading',v)}"
if admin_helper not in s:
    s = s.replace(needle, needle + admin_helper)
s = s.replace("const now=Date.now(),users=(state.users||[]).filter(u=>(u.role||'Animador')==='Animador'&&!['Bloqueado','Inactivo'].includes(u.status));", "const now=Date.now(),users=(state.users||[]).filter(u=>isLearningUser(u)&&!['Bloqueado','Inactivo'].includes(u.status));")
s = s.replace("$('kActive').textContent=s.activeUsers||0;$('kInvited').textContent=`${s.invitedUsers||0} invitados`;", "const learners=(state.users||[]).filter(isLearningUser);$('kActive').textContent=learners.filter(u=>u.status==='Activo').length;$('kInvited').textContent=`${learners.filter(u=>u.status==='Invitado').length} invitados`;")
s = s.replace("$('kProgress').textContent=`${s.averageProgress||0}%`;", "const lp=learners.length?Math.round(learners.reduce((n,u)=>n+(Number(u.progressPercent)||0),0)/learners.length):0;$('kProgress').textContent=`${lp}%`;")
s = s.replace("d:'Animadores sin ingreso en los últimos 14 días.'", "d:'Personas con recorrido asignado sin ingreso en los últimos 14 días.'")
p.write_text(s, encoding='utf-8')

# --- Página Personas: progreso solo para quienes son animadores según el criterio ---
p = ROOT / 'animadores.html'
s = p.read_text(encoding='utf-8')
people_helper = "function isLearningUser(u){const role=String(u.role||'Animador').toLowerCase();if(role.includes('animador'))return true;if(!(role.includes('formador')||role.includes('admin')))return false;const published=new Set((state.courses||[]).filter(c=>c.status==='Publicado').map(c=>String(c._id)));return (state.assignments||[]).some(a=>a.active!==false&&published.has(String(a.courseId))&&((a.targetType==='user'&&String(a.targetId)===String(u._id))||(a.targetType==='group'&&u.groupId&&String(a.targetId)===String(u.groupId))))}"
needle = "function progressState(p){p=Number(p)||0;return p>=100?'done':p>0?'doing':'none'}"
if people_helper not in s:
    s = s.replace(needle, needle + people_helper)
s = s.replace("&&(!p||progressState(u.progressPercent)===p))", "&&(!p||(isLearningUser(u)&&progressState(u.progressPercent)===p)))")
s = s.replace("$('kActive').textContent=users.filter(u=>(u.role||'Animador')==='Animador'&&u.status==='Activo').length;", "$('kActive').textContent=users.filter(u=>isLearningUser(u)&&u.status==='Activo').length;")
s = s.replace("$('kNoGroup').textContent=users.filter(u=>!u.groupId&&(u.role||'Animador')==='Animador').length", "$('kNoGroup').textContent=users.filter(u=>!u.groupId&&isLearningUser(u)).length")
s = s.replace("<td><span class=\"bar\"><span style=\"width:${Math.max(0,Math.min(100,Number(u.progressPercent)||0))}%\"></span></span>${Number(u.progressPercent)||0}%</td>", "<td>${isLearningUser(u)?`<span class=\"bar\"><span style=\"width:${Math.max(0,Math.min(100,Number(u.progressPercent)||0))}%\"></span></span>${Number(u.progressPercent)||0}%`:'—'}</td>")
p.write_text(s, encoding='utf-8')

# --- Tablero V2: incluir Formador/Admin con curso asignado ---
p = ROOT / 'admin-dashboard.js'
s = p.read_text(encoding='utf-8')
helper = "\n  function learningUsers(data,users){\n    const published=new Set((data.courses||[]).filter(c=>c.status==='Publicado').map(c=>String(c._id)));\n    const assignments=(data.assignments||[]).filter(a=>a.active!==false&&published.has(String(a.courseId)));\n    return (users||[]).filter(u=>{\n      if(['Bloqueado','Inactivo'].includes(String(u.status||'')))return false;\n      const role=String(u.role||'Animador').toLowerCase();\n      if(role.includes('animador'))return true;\n      if(!(role.includes('formador')||role.includes('admin')))return false;\n      return assignments.some(a=>(a.targetType==='user'&&String(a.targetId)===String(u._id))||(a.targetType==='group'&&u.groupId&&String(a.targetId)===String(u.groupId)));\n    });\n  }\n"
marker = "\n  function assignedPairs(data,animators){"
if 'function learningUsers(data,users)' not in s:
    s = s.replace(marker, helper + marker)
s = s.replace("const animators=users.filter(u=>String(u.role||'').toLowerCase().includes('animador')&&!['Bloqueado','Inactivo'].includes(String(u.status||'')));", "const animators=learningUsers(data,users);")
s = s.replace('＋ Nuevo animador', '＋ Nueva persona')
s = s.replace('Animadores sin primer acceso.', 'Personas con recorrido asignado sin primer acceso.')
s = s.replace('Curso–animador que requieren seguimiento.', 'Curso–persona que requiere seguimiento.')
s = s.replace('Usuarios animadores que nunca registraron acceso.', 'Personas con recorrido asignado que nunca registraron acceso.')
s = s.replace('Todos los animadores ya ingresaron al menos una vez. ✓', 'Todas las personas con recorrido ya ingresaron al menos una vez. ✓')
p.write_text(s, encoding='utf-8')

print('CAFASSO Personas: semántica aplicada')
