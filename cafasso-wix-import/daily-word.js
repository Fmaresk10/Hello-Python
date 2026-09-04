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
      .cafasso-daily-word{margin-top:12px;background:#FFFDF9;border:1px solid #E8DCCB;border-radius:16px;padding:14px 16px;box-shadow:0 4px 13px rgba(15,45,77,.04)}
      .cafasso-dw-head{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:10px}
      .cafasso-dw-kicker{font-size:8.5px;letter-spacing:.14em;font-weight:850;color:#9A6B16;text-transform:uppercase}
      .cafasso-dw-head h3{margin:1px 0;color:#0F2D4D;font:20px/1.05 Georgia,serif;font-weight:400}
      .cafasso-dw-date{font-size:10.5px;color:#7A8492;text-transform:capitalize}
      .cafasso-dw-symbol{width:30px;height:30px;border-radius:10px;background:#FAF7F1;color:#0F2D4D;display:grid;place-items:center;font-size:16px;line-height:1;flex:0 0 auto;border:1px solid #E8DCCB}
      .cafasso-dw-grid{display:grid;grid-template-columns:minmax(0,1.04fr) minmax(210px,.96fr);gap:9px;align-items:stretch}
      .cafasso-dw-gospel{background:#F7F2E9;border:1px solid #E9DECB;color:#0F2D4D;border-radius:12px;padding:12px 13px}
      .cafasso-dw-gospel small,.cafasso-dw-item small{display:block;font-size:8.5px;letter-spacing:.11em;font-weight:850;text-transform:uppercase;margin-bottom:3px}
      .cafasso-dw-gospel small{color:#9A6B16}.cafasso-dw-gospel strong{font:18px/1.14 Georgia,serif;font-weight:400;display:block}
      .cafasso-dw-gospel p{font-size:11px;color:#66717F;line-height:1.4;margin:5px 0 0;max-width:58ch}
      .cafasso-dw-list{display:grid;gap:6px}
      .cafasso-dw-item{background:#FCFAF6;border:1px solid #EEE5D8;border-radius:10px;padding:8px 10px}.cafasso-dw-item small{color:#8B93A0}.cafasso-dw-item strong{color:#0F2D4D;font-size:12px;font-weight:750}
      .cafasso-dw-foot{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-top:9px;flex-wrap:wrap}
      .cafasso-dw-season{font-size:10.5px;color:#7A8492;font-weight:650}
      .cafasso-dw-link{display:inline-flex;align-items:center;justify-content:center;background:transparent;color:#0F2D4D;text-decoration:none;font-weight:800;border:1px solid #D8C9AF;border-radius:9px;padding:6px 9px;min-height:31px;font-size:10.5px}
      .cafasso-dw-link:hover{background:#FFF7D7;border-color:#E1CB74}
      @media(max-width:680px){.cafasso-daily-word{padding:12px 13px;border-radius:14px;margin-top:10px}.cafasso-dw-head{margin-bottom:8px}.cafasso-dw-head h3{font-size:18px}.cafasso-dw-symbol{width:28px;height:28px;font-size:15px}.cafasso-dw-grid{grid-template-columns:1fr}.cafasso-dw-gospel{padding:11px 12px}.cafasso-dw-gospel strong{font-size:17px}.cafasso-dw-gospel p{font-size:10.8px}.cafasso-dw-foot{display:grid;grid-template-columns:1fr}.cafasso-dw-link{width:100%;min-height:33px}}
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
    el.innerHTML=`<div class="cafasso-dw-head"><div><div class="cafasso-dw-kicker">Palabra del día</div><h3>Evangelio de hoy</h3><div class="cafasso-dw-date">Cargando las lecturas…</div></div><div class="cafasso-dw-symbol" aria-label="Cruz cristiana">✝</div></div>`;
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
    el.innerHTML=`
      <div class="cafasso-dw-head"><div><div class="cafasso-dw-kicker">Palabra del día</div><h3>Evangelio de hoy</h3><div class="cafasso-dw-date">${label}</div></div><div class="cafasso-dw-symbol" aria-label="Cruz cristiana">✝</div></div>
      <div class="cafasso-dw-gospel"><small>Para tu jornada</small><strong>Hacé un espacio para la Palabra</strong><p>La referencia del día no pudo cargarse ahora, pero podés abrir directamente las lecturas y el Evangelio de hoy.</p></div>
      <div class="cafasso-dw-foot"><span class="cafasso-dw-season">Lecturas de la liturgia del día</span><a class="cafasso-dw-link" href="${vaticanUrl()}" target="_blank" rel="noopener">Leer la Palabra completa →</a></div>`;
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
    const items=[
      first&&`<div class="cafasso-dw-item"><small>Primera lectura</small><strong>${first}</strong></div>`,
      psalm&&`<div class="cafasso-dw-item"><small>Salmo</small><strong>${psalm}</strong></div>`,
      second&&`<div class="cafasso-dw-item"><small>Segunda lectura</small><strong>${second}</strong></div>`
    ].filter(Boolean).join('');
    el.innerHTML=`
      <div class="cafasso-dw-head"><div><div class="cafasso-dw-kicker">Palabra del día</div><h3>Evangelio de hoy</h3><div class="cafasso-dw-date">${label}</div></div><div class="cafasso-dw-symbol" aria-label="Cruz cristiana">✝</div></div>
      <div class="cafasso-dw-grid"><div class="cafasso-dw-gospel"><small>Evangelio</small><strong>${gospel||'Lecturas del día'}</strong><p>Una pausa para leer, escuchar y dejar que la Palabra acompañe tu jornada.</p></div><div class="cafasso-dw-list">${items}</div></div>
      <div class="cafasso-dw-foot"><span class="cafasso-dw-season">${season}</span><a class="cafasso-dw-link" href="${vaticanUrl()}" target="_blank" rel="noopener">Leer la Palabra completa →</a></div>`;
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