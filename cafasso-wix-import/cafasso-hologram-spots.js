(()=>{
  if(window.CafassoHologramSpots)return;

  const SPACES={
    casa:{
      label:'Casa',
      previewImage:'https://static.wixstatic.com/media/47bf07_9bc5db4bdd144670b58b89d62684b300~mv2.jpg',
      selector:'.cafasso-house',
      sceneSelectors:['.cafasso-house-panorama','.cafasso-house-desktop-scene','.cafasso-house'],
      light:{hue:178,saturation:54,luminosity:62,opacity:.30},
      spots:[
        {id:'casa-centro',label:'Centro de la sala',description:'Aparición principal, de cuerpo entero, apoyada sobre el piso central.',x:50,y:88,scale:.88,depth:'foreground',contact:{width:30,opacity:.25,blur:10},perspective:{rotateY:0,rotateX:0}},
        {id:'casa-tv',label:'Junto al televisor',description:'Presencia cercana a la TV, ideal para bienvenida o explicación.',x:66,y:82,scale:.74,depth:'mid',contact:{width:25,opacity:.22,blur:9},perspective:{rotateY:-2,rotateX:0}},
        {id:'casa-lateral',label:'Rincón izquierdo',description:'Aparición secundaria, más integrada al ambiente.',x:27,y:83,scale:.70,depth:'mid',contact:{width:24,opacity:.20,blur:9},perspective:{rotateY:3,rotateX:0}}
      ]
    },
    patio:{
      label:'Patio',
      previewImage:'https://static.wixstatic.com/media/47bf07_794847b8f87d4577a04e10fb9adf630c~mv2.png',
      selector:'.cafasso-patio',
      sceneSelectors:['.cafasso-patio-panorama','.cafasso-patio-desktop-scene','.cafasso-patio'],
      light:{hue:178,saturation:50,luminosity:66,opacity:.26},
      spots:[
        {id:'patio-centro',label:'Centro del patio',description:'Punto principal de encuentro, con buena lectura de cuerpo entero.',x:50,y:89,scale:.76,depth:'foreground',contact:{width:29,opacity:.22,blur:10},perspective:{rotateY:0,rotateX:0}},
        {id:'patio-izquierda',label:'Lateral izquierdo',description:'Aparición más lejana, útil para ambientación o llamados breves.',x:29,y:84,scale:.64,depth:'mid',contact:{width:23,opacity:.18,blur:8},perspective:{rotateY:3,rotateX:0}},
        {id:'patio-escuela',label:'Cerca del acceso a Escuela',description:'Ideal para invitar a entrar a Escuela o presentar una actividad.',x:72,y:82,scale:.61,depth:'mid',contact:{width:22,opacity:.18,blur:8},perspective:{rotateY:-3,rotateX:0}}
      ]
    },
    escuela:{
      label:'Escuela',
      previewImage:'https://static.wixstatic.com/media/47bf07_3248c27ab7aa4fe5847c319c7e250cc4~mv2.png',
      selector:'.cafasso-escuela',
      sceneSelectors:['.cafasso-school-panorama','.cafasso-school-desktop-scene','.cafasso-escuela'],
      light:{hue:180,saturation:46,luminosity:65,opacity:.26},
      spots:[
        {id:'escuela-pizarra',label:'Frente a la pizarra',description:'Spot docente principal. Ideal para explicaciones del formador.',x:49,y:83,scale:.68,depth:'mid',contact:{width:25,opacity:.22,blur:8},perspective:{rotateY:0,rotateX:0}},
        {id:'escuela-escritorio',label:'Junto al escritorio',description:'Presencia más cercana, apropiada para devoluciones o consignas.',x:67,y:86,scale:.76,depth:'foreground',contact:{width:28,opacity:.24,blur:9},perspective:{rotateY:-2,rotateX:0}},
        {id:'escuela-lateral',label:'Lateral del salón',description:'Aparición secundaria para comentarios breves sin tapar contenidos.',x:29,y:84,scale:.62,depth:'mid',contact:{width:22,opacity:.18,blur:8},perspective:{rotateY:3,rotateX:0}}
      ]
    },
    parroquia:{
      label:'Parroquia',
      previewImage:'https://static.wixstatic.com/media/47bf07_1c9e484e5ec8490781a6e54d6c262e1a~mv2.png',
      selector:'.cafasso-parroquia',
      sceneSelectors:['.cafasso-parish-panorama','.cafasso-parish-desktop-scene','.cafasso-parroquia'],
      light:{hue:174,saturation:42,luminosity:66,opacity:.22},
      spots:[
        {id:'parroquia-nave',label:'Nave central',description:'Punto sobrio de cuerpo entero, sin intervenir la geometría del altar.',x:50,y:88,scale:.64,depth:'foreground',contact:{width:26,opacity:.18,blur:9},perspective:{rotateY:0,rotateX:0}},
        {id:'parroquia-lateral-izq',label:'Lateral izquierdo',description:'Aparición discreta, pensada para acompañamiento o introducciones.',x:34,y:85,scale:.57,depth:'mid',contact:{width:21,opacity:.16,blur:8},perspective:{rotateY:2,rotateX:0}},
        {id:'parroquia-lateral-der',label:'Lateral derecho',description:'Aparición discreta que evita vela, cancionero y leccionario.',x:70,y:84,scale:.56,depth:'mid',contact:{width:21,opacity:.16,blur:8},perspective:{rotateY:-2,rotateX:0}}
      ]
    },
    recursos:{
      label:'Recursos',
      previewImage:'https://static.wixstatic.com/media/47bf07_8451eada7d72451a854df7cae47a80b6~mv2.png',
      selector:'.cafasso-recursos',
      sceneSelectors:['.cafasso-resources-panorama','.cafasso-recursos'],
      light:{hue:176,saturation:44,luminosity:63,opacity:.24},
      spots:[
        {id:'recursos-centro',label:'Pasillo central',description:'Punto principal entre estanterías, pensado para recomendaciones.',x:50,y:88,scale:.72,depth:'foreground',contact:{width:27,opacity:.22,blur:9},perspective:{rotateY:0,rotateX:0}},
        {id:'recursos-izq',label:'Estantería izquierda',description:'Aparición lateral para presentar un recurso o colección.',x:36,y:85,scale:.61,depth:'mid',contact:{width:22,opacity:.18,blur:8},perspective:{rotateY:3,rotateX:0}},
        {id:'recursos-der',label:'Estantería derecha',description:'Aparición lateral para destacar materiales sin bloquear el pasillo.',x:65,y:85,scale:.61,depth:'mid',contact:{width:22,opacity:.18,blur:8},perspective:{rotateY:-3,rotateX:0}}
      ]
    }
  };

  const COURSE_SPOTS=[
    {id:'curso-izquierda',label:'Lado izquierdo',x:24,y:88,scale:.80,description:'Deja libre el contenido principal a la derecha.'},
    {id:'curso-centro',label:'Centro',x:50,y:89,scale:.88,description:'Intervención protagonista o cierre importante.'},
    {id:'curso-derecha',label:'Lado derecho',x:76,y:88,scale:.80,description:'Deja libre el contenido principal a la izquierda.'}
  ];

  const aliases={house:'casa',school:'escuela',parish:'parroquia',resources:'recursos'};
  const normalizeSpace=value=>aliases[String(value||'').toLowerCase()]||String(value||'').toLowerCase();

  function space(value){return SPACES[normalizeSpace(value)]||null}
  function list(value){return space(value)?.spots?.slice()||[]}
  function find(value,spotId){
    const entry=space(value);
    if(!entry)return null;
    return entry.spots.find(item=>item.id===spotId)||entry.spots[0]||null;
  }
  function scene(value){
    const entry=space(value);if(!entry)return null;
    for(const selector of entry.sceneSelectors||[]){
      const node=document.querySelector(selector);
      if(node)return node;
    }
    return document.querySelector(entry.selector)||null;
  }
  function resolve(config={},context={}){
    const spaceName=normalizeSpace(config.space||context.space);
    if(!spaceName)return null;
    const entry=space(spaceName);if(!entry)return null;
    const base=find(spaceName,config.spotId);
    if(!base)return null;
    const dx=Number(config.spotOffsetX||0),dy=Number(config.spotOffsetY||0),scaleAdjust=Number(config.spotScale||1);
    return{
      space:spaceName,
      spaceLabel:entry.label,
      ...base,
      x:Math.max(0,Math.min(100,base.x+dx)),
      y:Math.max(0,Math.min(100,base.y+dy)),
      scale:Math.max(.35,Math.min(1.35,base.scale*scaleAdjust)),
      light:{...entry.light,...(base.light||{})},
      host:scene(spaceName)
    };
  }
  function courseFind(id){return COURSE_SPOTS.find(item=>item.id===id)||COURSE_SPOTS[1]}
  function all(){return Object.fromEntries(Object.entries(SPACES).map(([key,value])=>[key,{...value,spots:value.spots.map(x=>({...x}))}]))}

  window.CafassoHologramSpots={SPACES,COURSE_SPOTS,normalizeSpace,space,list,find,scene,resolve,courseFind,all};
  try{window.dispatchEvent(new CustomEvent('cafasso:hologram-spots-ready'));}catch(error){}
})();