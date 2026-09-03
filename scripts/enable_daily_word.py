from pathlib import Path

p=Path('cafasso-wix-import/index.html')
s=p.read_text(encoding='utf-8')
tag='<script src="./daily-word.js"></script>'

if tag not in s:
    marker='<script src="./profile-photo.js"></script>'
    if marker in s:
        s=s.replace(marker, marker+'\n'+tag, 1)
    else:
        s=s.replace('</body>', tag+'\n</body>', 1)
    p.write_text(s,encoding='utf-8')
    print('Daily Word enabled in index.html')
else:
    print('Daily Word already enabled')
