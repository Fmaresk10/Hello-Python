from pathlib import Path
import re

root=Path('cafasso-wix-import')
crest='https://static.wixstatic.com/media/47bf07_3bf4fe6421f34a05990caa87c98fffc2~mv2.webp'
changed=[]
for p in root.glob('*.html'):
    s=p.read_text(encoding='utf-8')
    # Wrap the Maturana crest in a home link wherever it appears, unless already linked.
    pattern=rf'(?<!<a href="\./">)(<img\b[^>]*src="{re.escape(crest)}"[^>]*>)'
    ns=re.sub(pattern, r'<a href="./" aria-label="Volver al inicio" title="Volver al inicio">\1</a>', s)
    if ns!=s:
        p.write_text(ns,encoding='utf-8')
        changed.append(str(p))
print('Updated:', ', '.join(changed) if changed else 'none')
