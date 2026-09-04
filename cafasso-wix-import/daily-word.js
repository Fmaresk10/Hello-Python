(()=>{
  const WIDGET_ID='cafassoDailyWord';
  const STYLE_ID='cafassoDailyWordStyles';
  let dataPromise=null;

  const books={
    'Genesis':'Génesis','Exodus':'Éxodo','Leviticus':'Levítico','Numbers':'Números','Deuteronomy':'Deuteronomio',
    'Joshua':'Josué','Judges':'Jueces','Ruth':'Rut','1 Samuel':'1 Samuel','2 Samuel':'2 Samuel','1 Kings':'1 Reyes','2 Kings':'2 Reyes',
    '1 Chronicles':'1 Crónicas','2 Chronicles':'2 Crónicas','Ezra':'Esdras','Nehemiah':'Nehemías','Tobit':'Tobías','Judith':'Judit',
    'Esther':'Ester','1 Maccabees':'1 Macabeos','2 Maccabees':'2 Macabeos','Job':'Job','Psalms':'Salmo','Psalm':'Salmo',
    'Proverbs':'Proverbios','Ecclesiastes':'Eclesiastés','Song of Songs':'Cantar de los Cantares','Wisdom':'Sabiduría','Sirach':'Eclesiástico',
    'Isaiah':'Isaías','Jeremiah':'Jeremías','Lamentations':'Lamentaciones','Baruch':'Baruc','Ezekiel':'Ezequiel','Daniel':'Daniel',
    'Hosea':'Oseas','Joel':'Joel','Amos':'Amós','Obadiah':'Abdías','Jonah':'Jonás','Micah':'Miqueas','Nahum':'Nahúm','Habakkuk':'Habacuc',
    'Zephaniah':'Sofonías','Haggai':'Ageo','Zechariah':'Zacarías','Malachi':'Malaquías','Matthew':'Mateo','Mark':'Marcos','Luke':'Lucas','John':'Juan',
    'Acts':'Hechos','Romans':'Romanos','1 Corinthians':'1 Corintios','2 Corinthians':'2 Corintios','Galatians':'Gálatas','Ephesians':'Efesios',
    'Philippians':'Filipenses','Colossians':'Colosenses','1 Thessalonians':'1 Tesalonicenses','2 Thessalonians':'2 Tesalonicenses',
    '1 Timothy':'1 Timoteo','2 Timothy':'2 Timoteo','Titus':'Tito','Philemon':'Filemón','Hebrews':'Hebreos','James':'Santiago',
    '1 Peter':'1 Pedro','2 Peter':'2 Pedro','1 John':'1 Juan','2 John':'2 Juan','3 John':'3 Juan','Jude':'Judas','Revelation':'Apocalipsis'
  };

  const seasons={
    'Ordinary Time':'Tiempo Ordinario','Advent':'Adviento','Christmas':'Navidad','Lent':'Cuaresma','Easter':'Pascua'
  };

  function localDate(){
    const d=new Date();
    const year=d.getFullYear();
    const month=String(d.getMonth()+1).padStart(2,'0');
    const day=String(d.getDate()).padStart(2,'0');
    return {d,year,month,day,key:`${year}-${month}-${day}`};
  }

  function vaticanUrl(){
    const x=localDate();
    return `https://www.vaticannews.va/es/evangelio-de-hoy/${x.year}/${x.month}/${x.day}.html`;
  }

  function translateRef(value){
    let s=String(value||'').trim();
    const names=Object.keys(books).sort((a,b)=>b.length-a.length);
    for(const name of names){
      if(s.startsWith(name+' ')){
        s=books[name]+s.slice(name.length);
        break;
      }
    }
    return s.replace(/(\d):(\d)/,'$1,$2');
  }

  function addStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .cafasso-daily-word{margin-top:14px;background:#0F2D4D;border:1px solid #173E66;border-radius:18px;padding:18px 20px;box-shadow:0 8px 22px rgba(15,45,77,.16);font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif}
      .cafasso-dw-shell{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:16px;align-items:center}
      .cafasso-dw-symbol{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.20);color:#F2C94C;display:grid;place-items:center;font-size:18px;line-height:1;flex:0 0 auto}
      .cafasso-dw-copy{min-width:0}.cafasso-dw-kicker{font-size:9px;letter-spacing:.14em;font-weight:850;color:#F2C94C;text-transform:uppercase;margin-bottom:3px}
      .cafasso-dw-main{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}.cafasso-dw-main strong{font-family:inherit;font-size:21px;line-height:1.12;font-weight:750;letter-spacing:-.01em;color:#FFFFFF}.cafasso-dw-main span{font-size:11px;color:#D5DFE8;text-transform:capitalize}
      .cafasso-dw-readings{display:flex;gap:8px 14px;flex-wrap:wrap;margin-top:7px;color:#D5DFE8;font-size:11.5px}.cafasso-dw-readings b{color:#FFFFFF;font-weight:750}.cafasso-dw-readings em{font-style:normal;color:#F2C94C;font-weight:800}
      .cafasso-dw-action{display:flex;align-items:center;gap:10px}.cafasso-dw-season{font-size:10.5px;color:#D5DFE8;white-space:nowrap}.cafasso-dw-link{display:inline-flex;align-items:center;justify-content:center;background:#F2C94C;color:#0F2D4D;text-decoration:none;font-weight:850;border-radius:10px;padding:8px 11px;min-height:34px;font-size:11px;white-space:nowrap}.cafasso-dw-link:hover{filter:brightness(.985)}
      @media(max-width:760px){.cafasso-daily-word{padding:15px 16px}.cafasso-dw-shell{grid-template-columns:auto 1fr;gap:12px}.cafasso-dw-action{grid-column:1/-1;justify-content:space-between;padding-top:10px;border-top:1px solid rgba(255,255,255,.16)}.cafasso-dw-main strong{font-size:19px}.cafasso-dw-readings{font-size:11px}}
      @media(max-width:520px){.cafasso-dw-action{display:grid;grid-template-columns:1fr}.cafasso-dw-link{width:100%}.cafasso-dw-season{white-space:normal}.cafasso-dw-symbol{width:32px;height:32px;font-size:16px}}
    `;
    document.head.appendChild(style);
  }

  function isHome(){
    const view=(location.hash||'#inicio').replace(/^#/,'');
    return !view||view==='inicio';
  }

  function makeShell(){
    const el=document.createElement('section');
    el.id=WIDGET_ID;
    el.className='cafasso-daily-word';
    el.innerHTML=`<div class="cafasso-dw-shell"><div class="cafasso-dw-symbol" aria-label="Cruz cristiana">✝</div><div class="cafasso-dw-copy"><div class="cafasso-dw-kicker">Palabra del día</div><div class="cafasso-dw-main"><strong>Evangelio de hoy</strong><span>Cargando…</span></div></div></div>`;
    return el;
  }

  function placeWidget(){
    if(!isHome())return null;
    const main=document.getElementById('main');
    if(!main)return null;
    const existing=document.getElementById(WIDGET_ID);
    if(existing)return existing;
    addStyles();
    const el=makeShell();
    const anchor=main.querySelector('.hero')||main.querySelector('.top');
    if(anchor)anchor.insertAdjacentElement('afterend',el);else main.prepend(el);
    return el;
  }

  async function loadData(){
    const x=localDate();
    const cacheKey=`cafasso-daily-word-${x.key}`;
    try{
      const cached=JSON.parse(localStorage.getItem(cacheKey)||'null');
      if(cached&&cached.readings)return cached;
    }catch(e){}
    if(dataPromise)return dataPromise;
    dataPromise=(async()=>{
      const ctrl=new AbortController();
      const timer=setTimeout(()=>ctrl.abort(),4500);
      try{
        const url=`https://cpbjr.github.io/catholic-readings-api/readings/${x.year}/${x.month}-${x.day}.json`;
        const r=await fetch(url,{cache:'force-cache',signal:ctrl.signal});
        if(!r.ok)throw new Error('readings unavailable');
        const j=await r.json();
        try{localStorage.setItem(cacheKey,JSON.stringify(j));}catch(e){}
        return j;
      }finally{clearTimeout(timer);}
    })();
    return dataPromise;
  }

  function renderFallback(el){
    const x=localDate();
    const label=x.d.toLocaleDateString('es-UY',{weekday:'long',day:'numeric',month:'long'});
    el.innerHTML=`<div class="cafasso-dw-shell"><div class="cafasso-dw-symbol" aria-label="Cruz cristiana">✝</div><div class="cafasso-dw-copy"><div class="cafasso-dw-kicker">Palabra del día</div><div class="cafasso-dw-main"><strong>Evangelio de hoy</strong><span>${label}</span></div><div class="cafasso-dw-readings"><span>Hoy no pudimos cargar las referencias.</span></div></div><div class="cafasso-dw-action"><span class="cafasso-dw-season">Liturgia del día</span><a class="cafasso-dw-link" href="${vaticanUrl()}" target="_blank" rel="noopener">Leer →</a></div></div>`;
  }

  function renderData(el,data){
    const x=localDate();
    const label=x.d.toLocaleDateString('es-UY',{weekday:'long',day:'numeric',month:'long'});
    const r=data&&data.readings||{};
    const gospel=translateRef(r.gospel||'');
    const first=translateRef(r.firstReading||'');
    const psalm=translateRef(r.psalm||'');
    const second=translateRef(r.secondReading||'');
    const season=seasons[data.season]||data.season||'Liturgia del día';
    const readings=[
      first&&`<span><em>1ª lectura</em> <b>${first}</b></span>`,
      psalm&&`<span><em>Salmo</em> <b>${psalm}</b></span>`,
      second&&`<span><em>2ª lectura</em> <b>${second}</b></span>`
    ].filter(Boolean).join('');
    el.innerHTML=`<div class="cafasso-dw-shell"><div class="cafasso-dw-symbol" aria-label="Cruz cristiana">✝</div><div class="cafasso-dw-copy"><div class="cafasso-dw-kicker">Palabra del día</div><div class="cafasso-dw-main"><strong>${gospel||'Evangelio de hoy'}</strong><span>${label}</span></div><div class="cafasso-dw-readings">${readings}</div></div><div class="cafasso-dw-action"><span class="cafasso-dw-season">${season}</span><a class="cafasso-dw-link" href="${vaticanUrl()}" target="_blank" rel="noopener">Leer →</a></div></div>`;
  }

  async function inject(){
    try{
      const el=placeWidget();
      if(!el)return;
      const data=await loadData();
      if(!document.body.contains(el)||!isHome())return;
      renderData(el,data);
    }catch(e){
      const el=document.getElementById(WIDGET_ID)||placeWidget();
      if(el)renderFallback(el);
      console.warn('CAFASSO: no se pudieron cargar las lecturas del día.',e);
    }
  }

  function schedule(){setTimeout(inject,30);setTimeout(inject,250);}
  document.addEventListener('click',e=>{if(e.target.closest('[data-view="inicio"]'))schedule();});
  window.addEventListener('popstate',schedule);
  window.addEventListener('load',schedule);

  let tries=0;
  const boot=setInterval(()=>{
    tries++;
    if(document.getElementById('main'))schedule();
    if(document.getElementById(WIDGET_ID)||tries>24)clearInterval(boot);
  },250);
})();

(()=>{
  const STYLE_ID='cafassoLearnerCourseUiStyles';
  function ensureStyles(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .block-type,.optional{display:none!important}
      .cafasso-eval-badge{display:inline-flex;align-items:center;padding:6px 9px;border-radius:999px;background:#0F2D4D;color:#fff;font-size:11px;font-weight:900;letter-spacing:.035em;box-shadow:0 2px 8px rgba(15,45,77,.12)}
      .block-meta{gap:8px}
      .block-meta:empty{display:none}
      @media(max-width:680px){.cafasso-eval-badge{padding:6px 9px;font-size:10.5px}}
    `;
    document.head.appendChild(style);
  }
  function simplifyCourseBlocks(){
    ensureStyles();
    document.querySelectorAll('.block').forEach(card=>{
      const typeEl=card.querySelector('.block-type');
      if(!typeEl)return;
      const type=String(typeEl.textContent||'').trim().toLowerCase();
      if((type==='entrega'||type==='evaluación')&&!card.querySelector('.cafasso-eval-badge')){
        const meta=card.querySelector('.block-meta');
        if(meta){
          const badge=document.createElement('span');
          badge.className='cafasso-eval-badge';
          badge.textContent='A EVALUAR';
          meta.insertBefore(badge,meta.firstChild);
        }
      }
    });
  }
  const observer=new MutationObserver(()=>simplifyCourseBlocks());
  function start(){
    simplifyCourseBlocks();
    const root=document.getElementById('app')||document.body;
    observer.observe(root,{subtree:true,childList:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();