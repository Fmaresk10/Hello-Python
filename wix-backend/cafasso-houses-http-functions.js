// CAFASSO · Casas salesianas (Wix Velo)
// Integrar las funciones siguientes en backend/http-functions.js del sitio Wix existente.
// No reemplazar el archivo http-functions.js completo.
import { ok, badRequest, forbidden, serverError } from 'wix-http-functions';
import wixData from 'wix-data';

const COLLECTION='CafassoSalesianHouses';
const USERS='CafassoUsers';
const SESSIONS='CafassoSessions';
const HEADERS={
  'Content-Type':'application/json',
  'Access-Control-Allow-Origin':'https://fmaresk10.github.io',
  'Access-Control-Allow-Headers':'Content-Type, Authorization, X-Cafasso-Session-Hash',
  'Access-Control-Allow-Methods':'GET, POST, OPTIONS',
  'Cache-Control':'no-store'
};
function response(type,body){return type({headers:HEADERS,body});}
function hashHeader(req){
  const headers=req?.headers||{};
  const key=Object.keys(headers).find(k=>k.toLowerCase()==='x-cafasso-session-hash');
  return String(headers[key]||'').trim().toLowerCase();
}
async function auth(req,requireAdmin){
  const hash=hashHeader(req);
  if(!/^[a-f0-9]{64}$/.test(hash))return null;
  const res=await wixData.query(SESSIONS).eq('tokenHash',hash).limit(1).find({suppressAuth:true});
  const session=res.items?.[0];
  if(!session?.userId||new Date(session.expiresAt||0).getTime()<=Date.now())return null;
  if(!requireAdmin)return session;
  const user=await wixData.get(USERS,String(session.userId),{suppressAuth:true}).catch(()=>null);
  if(!user||String(user.role||'').toLowerCase()!=='administrador')return null;
  return session;
}
export function options_cafassoHouses(){return response(ok,{ok:true});}
export async function get_cafassoHouses(req){
  try{
    if(!await auth(req,false))return response(forbidden,{ok:false,error:'Sesión inválida.'});
    let items=[],skip=0;
    while(true){
      const page=await wixData.query(COLLECTION).skip(skip).limit(100).find({suppressAuth:true});
      items.push(...page.items);
      if(!page.hasNext())break;
      skip+=page.items.length;
      if(skip>3000)break;
    }
    return response(ok,{ok:true,houses:items.map(x=>({
      id:x._id,slug:x.slug,name:x.name,backgrounds:(()=>{try{return JSON.parse(x.backgroundsJson||'{}')}catch(_){return {}}})()
    }))});
  }catch(e){console.error('cafassoHouses GET',e);return response(serverError,{ok:false,error:'No se pudieron obtener las casas.'});}
}
export async function post_cafassoHouses(req){
  try{
    if(!await auth(req,true))return response(forbidden,{ok:false,error:'Solo Administración puede modificar casas.'});
    const body=await req.body.json();
    const name=String(body?.name||'').trim();
    const slug=String(body?.slug||'').trim().toLowerCase();
    if(name.length<3||name.length>90||!/^[a-z0-9][a-z0-9-]{2,49}$/.test(slug))
      return response(badRequest,{ok:false,error:'Nombre o código inválido.'});
    const found=await wixData.query(COLLECTION).eq('slug',slug).limit(1).find({suppressAuth:true});
    if(found.items.length)return response(badRequest,{ok:false,error:'Esa casa ya existe.'});
    const record=await wixData.insert(COLLECTION,{name,slug,backgroundsJson:'{}'},{suppressAuth:true});
    return response(ok,{ok:true,house:{id:record._id,name:record.name,slug:record.slug,backgrounds:{}}});
  }catch(e){console.error('cafassoHouses POST',e);return response(serverError,{ok:false,error:'No se pudo guardar la casa.'});}
}
