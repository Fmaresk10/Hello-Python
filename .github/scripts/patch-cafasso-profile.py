from pathlib import Path

p = Path('cafasso-wix-import/index.html')
s = p.read_text(encoding='utf-8')

admin_line = "var ADMIN_API='https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoAdmin';"
auth_line = "var AUTH_API='https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoAuth';"
if auth_line not in s:
    s = s.replace(admin_line, admin_line + "\n  " + auth_line, 1)

old_logout = "document.getElementById('logout').onclick=function(){localStorage.removeItem('cafassoSession');location.replace('./login.html');};"
if old_logout in s:
    s = s.replace(old_logout, "document.getElementById('logout').onclick=logout;", 1)

marker = "function navigate(view,replace){"
helpers = """function authState(){try{return JSON.parse(localStorage.getItem('cafassoAuth')||'null');}catch(e){return null;}}
  async function logout(){var a=authState();try{if(a&&a.sessionToken)await fetch(AUTH_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'logout'})});}catch(e){}localStorage.removeItem('cafassoSession');localStorage.removeItem('cafassoAuth');location.replace('./login.html');}
  async function changeOwnPassword(){var a=document.getElementById('profilePassword'),b=document.getElementById('profilePassword2'),msg=document.getElementById('passwordMsg'),btn=document.getElementById('savePassword');if(!a||!b)return;var next=a.value,repeat=b.value;if(next.length<10){msg.textContent='La contraseña debe tener al menos 10 caracteres.';msg.style.color='var(--red)';return}if(next!==repeat){msg.textContent='Las dos contraseñas no coinciden.';msg.style.color='var(--red)';return}btn.disabled=true;btn.textContent='Guardando…';try{var r=await fetch(AUTH_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'changePassword',newPassword:next})});var j=await r.json();if(!r.ok||!j.ok)throw new Error(j.error||'No se pudo cambiar la contraseña.');localStorage.setItem('cafassoAuth',JSON.stringify({sessionToken:j.token,expiresAt:new Date(j.expiresAt).getTime()}));session.user=j.user||session.user;localStorage.setItem('cafassoSession',JSON.stringify({authenticated:true,user:session.user,checkedAt:Date.now()}));a.value='';b.value='';msg.textContent='Contraseña actualizada correctamente.';msg.style.color='var(--green)';}catch(e){msg.textContent=e.message||'No se pudo cambiar la contraseña.';msg.style.color='var(--red)';}finally{btn.disabled=false;btn.textContent='Cambiar contraseña';}}
  """
if 'async function changeOwnPassword()' not in s:
    if marker not in s:
        raise SystemExit('navigate marker not found')
    s = s.replace(marker, helpers + marker, 1)

old_profile = "if(view==='perfil'){main.innerHTML=top('Mi perfil','Tu recorrido personal dentro de CAFASSO.')+'<div class=\"card\"><h2 style=\"font-family:Georgia,serif;color:var(--navy)\">'+esc(u.name)+'</h2><p>'+esc(u.role||'Animador')+' · '+esc(u.groupName||'Sin grupo')+'</p><p>'+esc(u.email)+'</p><div class=\"stats\"><div class=\"stat\"><strong>'+myCourses.length+'</strong><span>Cursos</span></div><div class=\"stat\"><strong>'+done.length+'</strong><span>Certificados</span></div><div class=\"stat\"><strong>'+avg+'%</strong><span>Progreso</span></div></div></div>';return;}"
new_profile = "if(view==='perfil'){main.innerHTML=top('Mi perfil','Tu recorrido personal dentro de CAFASSO.')+'<div class=\"card\"><h2 style=\"font-family:Georgia,serif;color:var(--navy)\">'+esc(u.name)+'</h2><p>'+esc(u.role||'Animador')+' · '+esc(u.groupName||'Sin grupo')+'</p><p>'+esc(u.email)+'</p><div class=\"stats\"><div class=\"stat\"><strong>'+myCourses.length+'</strong><span>Cursos</span></div><div class=\"stat\"><strong>'+done.length+'</strong><span>Completados</span></div><div class=\"stat\"><strong>'+avg+'%</strong><span>Progreso</span></div></div></div><div class=\"card\" style=\"margin-top:16px;max-width:680px\"><h2 style=\"font-family:Georgia,serif;color:var(--navy);margin-top:0\">Seguridad</h2><p>Podés cambiar tu contraseña cuando quieras. La nueva debe tener al menos 10 caracteres.</p><div style=\"display:grid;gap:10px;margin-top:16px\"><input id=\"profilePassword\" type=\"password\" autocomplete=\"new-password\" placeholder=\"Nueva contraseña\" style=\"padding:12px 13px;border:1px solid var(--line);border-radius:12px;font:inherit\"><input id=\"profilePassword2\" type=\"password\" autocomplete=\"new-password\" placeholder=\"Repetir contraseña\" style=\"padding:12px 13px;border:1px solid var(--line);border-radius:12px;font:inherit\"><div><button class=\"btn\" id=\"savePassword\">Cambiar contraseña</button></div><div id=\"passwordMsg\" style=\"min-height:20px;font-size:13px;font-weight:700\"></div></div></div>';document.getElementById('savePassword').onclick=changeOwnPassword;return;}"
if old_profile in s:
    s = s.replace(old_profile, new_profile, 1)
elif 'id="savePassword"' not in s:
    raise SystemExit('profile target not found')

p.write_text(s, encoding='utf-8')
