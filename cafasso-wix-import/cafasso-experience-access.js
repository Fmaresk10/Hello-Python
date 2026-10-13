(()=>{
'use strict';
if(window.CafassoExperienceAccess)return;
const KNOWN=['animadores','educadores'];
const normalize=value=>String(value??'').trim().toLowerCase();
function pushExperience(set,value){
  const v=normalize(value);
  if(!v)return;
  if(v.includes('animador'))set.add('animadores');
  if(v.includes('educador')||v.includes('formador'))set.add('educadores');
  if(v.includes('admin')||v.includes('administrador')){set.add('animadores');set.add('educadores')}
  if(v==='animadores'||v==='educadores')set.add(v);
}
function collectValues(value,out=[]){
  if(value==null)return out;
  if(Array.isArray(value)){value.forEach(v=>collectValues(v,out));return out}
  if(typeof value==='object'){
    Object.entries(value).forEach(([k,v])=>{
      if(v===true||v===1||String(v).toLowerCase()==='true')out.push(k);
      else if(typeof v==='string'||Array.isArray(v))collectValues(v,out);
    });
    return out;
  }
  String(value).split(/[;,|/]+/).map(v=>v.trim()).filter(Boolean).forEach(v=>out.push(v));
  return out;
}
function allowedExperiences(user){
  const set=new Set();
  const explicit=[
    user?.experiences,
    user?.allowedExperiences,
    user?.experiencePermissions,
    user?.experienceAccess
  ];
  explicit.forEach(v=>collectValues(v).forEach(x=>pushExperience(set,x)));
  const roleValues=[];
  collectValues(user?.role,roleValues);
  collectValues(user?.roles,roleValues);
  collectValues(user?.permissions,roleValues);
  roleValues.forEach(x=>pushExperience(set,x));
  if(!set.size)set.add('animadores');
  return KNOWN.filter(x=>set.has(x));
}
function targetFor(mode){return mode==='educadores'?'./educadores.html':'./'}
function normalizedPreference(user){
  const allowed=allowedExperiences(user);
  const pref=normalize(localStorage.getItem('cafassoExperience'));
  return allowed.includes(pref)?pref:'';
}
function routeAfterLogin(user){
  const allowed=allowedExperiences(user);
  if(allowed.length>1)return './experiencia.html';
  const mode=allowed[0]||'animadores';
  localStorage.setItem('cafassoExperience',mode);
  return targetFor(mode);
}
function canUse(user,mode){return allowedExperiences(user).includes(mode)}
window.CafassoExperienceAccess={allowedExperiences,targetFor,normalizedPreference,routeAfterLogin,canUse};
})();