from pathlib import Path
p=Path('cafasso-wix-import/animadores.html')
s=p.read_text(encoding='utf-8')
old="<button class=\"tiny\" data-password=\"${u._id}\">Contraseña</button></td></tr>"
new="<button class=\"tiny\" data-password=\"${u._id}\">Contraseña</button> <button class=\"tiny\" data-delete=\"${u._id}\" style=\"color:var(--red);border-color:#ebc7c7\">Eliminar</button></td></tr>"
if old in s:
    s=s.replace(old,new,1)
elif new not in s:
    raise SystemExit('action buttons marker not found')
marker="async function resetPassword(user){"
fn="""async function deleteUser(user){if(!user)return;const ok=confirm(`¿Eliminar definitivamente a ${user.name}?\\n\\nSe borrarán su acceso, progreso, entregas y asignaciones individuales. Esta acción no se puede deshacer.`);if(!ok)return;busy(true);setStatus('Eliminando usuario…');try{const j=await post({action:'deleteUser',id:user._id});state=j;selected.delete(user._id);fillFilters();renderKpis();render();setStatus('Usuario eliminado',true);}catch(e){alert(e.message);setStatus('No se pudo eliminar el usuario')}finally{busy(false)}}\n"""
if 'async function deleteUser(user)' not in s:
    if marker not in s: raise SystemExit('resetPassword function marker not found')
    s=s.replace(marker,fn+marker,1)
oldclick="const pwd=e.target.closest('[data-password]');if(pwd)return resetPassword((state.users||[]).find(u=>u._id===pwd.dataset.password));const cb=e.target.closest('[data-select]');"
newclick="const pwd=e.target.closest('[data-password]');if(pwd)return resetPassword((state.users||[]).find(u=>u._id===pwd.dataset.password));const del=e.target.closest('[data-delete]');if(del)return deleteUser((state.users||[]).find(u=>u._id===del.dataset.delete));const cb=e.target.closest('[data-select]');"
if oldclick in s:
    s=s.replace(oldclick,newclick,1)
elif newclick not in s:
    raise SystemExit('click handler marker not found')
p.write_text(s,encoding='utf-8')
print('CAFASSO delete animator UI added')
