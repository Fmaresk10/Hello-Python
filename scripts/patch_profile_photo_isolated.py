from pathlib import Path

p = Path('cafasso-wix-import/index.html')
s = p.read_text(encoding='utf-8')
tag = '<script src="./profile-photo.js"></script>'

if tag not in s:
    if '</body>' not in s:
        raise SystemExit('No se encontró </body> en index.html')
    s = s.replace('</body>', tag + '\n</body>', 1)
    p.write_text(s, encoding='utf-8')
    print('index.html actualizado')
else:
    print('index.html ya contiene profile-photo.js')
