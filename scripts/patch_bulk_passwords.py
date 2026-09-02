from pathlib import Path

p=Path('cafasso-wix-import/animadores.html')
s=p.read_text()

old='<button class="btn" id="applyBulk">Aplicar</button><button class="btn alt" id="clearSel">Cancelar selección</button>'
new='<button class="btn" id="applyBulk">Aplicar</button><button class="btn alt" id="bulkPasswords">Generar contraseñas</button><button class="btn alt" id="clearSel">Cancelar selección</button>'
if old in s:
    s=s.replace(old,new)

anchor="async function applyBulk(){if(!selected.size)return;"
func="""async function bulkPasswords(){
if(!selected.size)return;
const users=(state.users||[]).filter(u=>selected.has(u._id));
if(!confirm(`Generar nuevas contraseñas temporales para ${users.length} personas? Se cerrarán sus sesiones activas y deberán cambiar la contraseña al ingresar.`))return;
busy(true);setStatus(`Generando ${users.length} contraseñas temporales…`);
try{
 const j=await post({action:'resetPasswords',ids:users.map(u=>u._id)});
 state=j;fillFilters();renderKpis();selected.clear();render();
 setStatus(`${(j.credentials||[]).length} contraseñas temporales generadas`,true);
 const rows=j.credentials||[];
 if(!rows.length)return alert('No se generaron contraseñas.');
 const data=[['Nombre','Correo','Contraseña temporal'],...rows.map(x=>[x.name,x.email,x.temporaryPassword])];
 const csv='\\ufeff'+data.map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(';')).join('\\r\\n');
 const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');
 a.href=URL.createObjectURL(blob);a.download='cafasso-accesos-temporales.csv';a.click();URL.revokeObjectURL(a.href);
 alert(`Listo. Se generaron ${rows.length} contraseñas temporales y se descargó el archivo de accesos.`);
}catch(e){alert(e.message);setStatus('No se pudieron generar las contraseñas')}finally{busy(false)}
}
"""
if 'async function bulkPasswords()' not in s:
    if anchor not in s:
        raise SystemExit('applyBulk anchor not found')
    s=s.replace(anchor,func+anchor)

old_bind="$('applyBulk').onclick=applyBulk;$('clearSel').onclick"
new_bind="$('applyBulk').onclick=applyBulk;$('bulkPasswords').onclick=bulkPasswords;$('clearSel').onclick"
if old_bind in s:
    s=s.replace(old_bind,new_bind)

p.write_text(s)
