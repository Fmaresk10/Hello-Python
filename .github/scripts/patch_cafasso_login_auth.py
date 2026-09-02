from pathlib import Path
p=Path('cafasso-wix-import/login.html')
s=p.read_text()
s=s.replace("const ACCESS_API='https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoAccess';","const ACCESS_API='https://www.wixapis.com/velo/v1/http/invoke/cafassoAccess';")
old="const allowed=await jsonFetch(ACCESS_API+'?email='+encodeURIComponent(email));"
new="const allowed=await jsonFetch(ACCESS_API+'?email='+encodeURIComponent(email),{headers:{'Authorization':accessToken}});"
if old not in s:
    raise SystemExit('No se encontró la llamada de acceso a reemplazar')
s=s.replace(old,new,1)
p.write_text(s)
