(()=>{
  if(typeof data==='undefined'||typeof render!=='function')return;
  if(document.getElementById('cafassoCourseTemplates'))return;
  const uid=()=>`local-${crypto.randomUUID()}`;
  const block=(type,title,body='',required=false)=>({_id:uid(),type,title,required,content:{body},settings:{notes:''}});
  const module=(title,desc,contents,minutes=20)=>({_id:uid(),title,desc,status:'Borrador',required:true,unlockAfterPrevious:false,estimatedMinutes:minutes,settings:{},contents});
  const mission=(id,title,objective,prompt,icon)=>({id,title,objective,prompt,icon});
  const missionBlock=(missionId,type,title,body,required=true)=>({_id:uid(),type,title,required,content:{body},settings:{notes:'',missionId}});
  const missionModule=(title,desc,missions,blocks,minutes=25,unlockAfterPrevious=true)=>({_id:uid(),title,desc,status:'Borrador',required:true,unlockAfterPrevious,estimatedMinutes:minutes,settings:{missions},contents:blocks});

  const donBoscoMissions=[
    mission('m1','Nacer en I Becchi','Conocé la infancia, la familia y el contexto de Juan Bosco.','Ordená los primeros acontecimientos de su vida y descubrí dónde comenzó el sueño salesiano.','🌱'),
    mission('m2','Mamá Margarita','Reconocé la influencia de Margarita Occhiena en la formación de Juan.','Elegí tres valores que Margarita transmitió a Juan y explicá cuál necesitás cultivar hoy.','🏡'),
    mission('m3','El sueño de los nueve años','Interpretá el sueño que orientó la vocación de Don Bosco.','Leé el sueño y relacioná sus símbolos con la frase: “No con golpes, sino con mansedumbre”.','✨'),
    mission('m4','Aprender para servir','Descubrí cómo las dificultades y el estudio prepararon su misión.','Construí una breve línea de tiempo con cuatro momentos de esfuerzo y aprendizaje.','📚'),
    mission('m5','¿Qué sueño llevás dentro?','Relacioná el camino de Don Bosco con tu propia historia.','Entregá una insignia personal: sueño, dificultad, persona que te acompañó y compromiso concreto.','🤝')
  ];
  const donBoscoMissions2=[
    mission('m1','Chieri: estudiar contra corriente','Conocé los esfuerzos de Juan para estudiar y seguir su vocación.','Identificá dos dificultades que enfrentó y una decisión que le permitió continuar.','🧭'),
    mission('m2','La Sociedad de la Alegría','Descubrí cómo Juan Bosco educaba y animaba a sus compañeros.','Elegí las reglas de una comunidad alegre, responsable y abierta a todos.','😊'),
    mission('m3','Un sacerdote para los jóvenes','Comprendé la opción de Don Bosco por dedicar su vida a los jóvenes.','Relacioná su ordenación sacerdotal con las necesidades de los jóvenes de su tiempo.','⛪'),
    mission('m4','Bartolomé Garelli','Reconstruí el encuentro que dio origen al oratorio.','Escribí cómo recibirías hoy a un joven que llega solo, desconfiado o excluido.','🚪'),
    mission('m5','Encontrar a Garelli','Aplicá el estilo de Don Bosco a una situación concreta.','Presentá una propuesta de primer encuentro para un joven que necesita sentirse esperado.','🫂')
  ];
  const donBoscoMissions3=[
    mission('m1','Un oratorio en movimiento','Conocé las dificultades de los primeros oratorios.','Descubrí qué sostuvo a Don Bosco cuando parecía no tener un lugar estable.','🏃'),
    mission('m2','La casa de Mamá Margarita','Comprendé cómo Valdocco se convirtió en una casa para los jóvenes.','Identificá tres gestos que transforman un espacio en un hogar.','🏠'),
    mission('m3','El Sistema Preventivo','Profundizá en razón, religión y amorevolezza.','Aplicá las tres claves a una situación cotidiana de animación.','💛'),
    mission('m4','Casa, patio, escuela y parroquia','Reconocé las cuatro dimensiones de la experiencia salesiana.','Relacioná cada dimensión con una acción concreta para tu grupo.','🎒'),
    mission('m5','Construir un oratorio','Diseñá una experiencia salesiana para jóvenes de hoy.','Entregá una propuesta con ambiente, actividad, gesto de acompañamiento y misión.','🧱')
  ];
  const donBoscoMissions4=[
    mission('m1','Los primeros salesianos','Conocé cómo Don Bosco compartió el sueño con otros jóvenes y educadores.','Reconocé qué características necesita una comunidad para sostener una misión.','👥'),
    mission('m2','María Auxiliadora','Descubrí el lugar de María en la confianza y la misión de Don Bosco.','Escribí una oración breve de confianza para tu tarea como animador.','🌟'),
    mission('m3','Enviados a la misión','Conocé las primeras expediciones misioneras salesianas.','Ubicá la misión salesiana más allá de Valdocco y relacionála con tu realidad.','🌎'),
    mission('m4','Don Bosco hoy','Reconocé la presencia del carisma de Don Bosco en tu comunidad.','Encontrá tres signos de Don Bosco presentes hoy en Maturana.','🔎'),
    mission('m5','Mi misión salesiana','Formulá un compromiso personal para continuar el sueño.','Entregá tu misión: a quién acompañarás, cómo lo harás y cuál será tu primer gesto concreto.','🔥')
  ];

  const donBosco={
    name:'La vida de Don Bosco',icon:'🔥',desc:'Un recorrido gamificado por la vida, la misión y el estilo educativo de Don Bosco.',modules:[
      missionModule('1 · Las semillas del sueño','Las experiencias familiares, espirituales y educativas que formaron el corazón de Juan Bosco.',donBoscoMissions,[
        missionBlock('m1','Texto','Nacer en I Becchi','Juan Bosco nació en 1815 en I Becchi, una pequeña casa rural cercana a Castelnuovo. Allí creció en una familia sencilla, marcada por el trabajo, la fe y la confianza en Dios. Su infancia no fue fácil, pero esas experiencias fueron preparando su sensibilidad hacia quienes más necesitaban acompañamiento.'),
        missionBlock('m2','Reflexión','Mamá Margarita','Margarita Occhiena fue una presencia decisiva en la vida de Juan. Le enseñó a rezar, trabajar, confiar y mirar a los demás con compasión. Escribí tres valores que reconocés en ella y elegí uno que quieras practicar en tu servicio.'),
        missionBlock('m3','Texto','El sueño de los nueve años','A los nueve años, Juan tuvo un sueño que marcaría su camino. Vio una multitud de muchachos que peleaban y escuchó que no debía corregirlos con golpes, sino con mansedumbre y caridad. Ese sueño se convirtió en una brújula para toda su vida.'),
        missionBlock('m4','Evaluación','Aprender para servir','Ordená estos momentos: trabajo en el campo, deseo de estudiar, salida de casa y encuentro con personas que lo ayudaron. Después explicá por qué las dificultades también pueden convertirse en una escuela de servicio.'),
        missionBlock('m5','Desafío','¿Qué sueño llevás dentro?','Creá una insignia personal con cuatro elementos: mi sueño, una dificultad que debo atravesar, una persona que me acompañó y un compromiso concreto. Esta entrega será revisada por el formador.',true)
      ],35,false),
      missionModule('2 · El sueño toma forma','Chieri, la Sociedad de la Alegría, el sacerdocio y el encuentro con Bartolomé Garelli.',donBoscoMissions2,[
        missionBlock('m1','Texto','Chieri: estudiar contra corriente','Para poder estudiar, Juan Bosco trabajó en distintos oficios y enfrentó dificultades económicas. En Chieri encontró nuevos amigos, aprendió con esfuerzo y fue descubriendo que su formación no era para sí mismo, sino para servir mejor.'),
        missionBlock('m2','Reflexión','La Sociedad de la Alegría','Juan reunió a sus compañeros en la Sociedad de la Alegría. La propuesta unía alegría, responsabilidad, estudio, oración y amistad. Elegí tres reglas para una comunidad juvenil sana y explicá por qué las elegiste.'),
        missionBlock('m3','Texto','Un sacerdote para los jóvenes','Ordenado sacerdote en 1841, Don Bosco comprendió cada vez con mayor claridad que su misión sería estar cerca de los jóvenes, especialmente de quienes estaban solos, pobres o en riesgo.'),
        missionBlock('m4','Reflexión','Bartolomé Garelli','El 8 de diciembre de 1841 Don Bosco se encontró con Bartolomé Garelli en la sacristía de San Francisco de Asís. Antes de enseñarle catecismo, le preguntó su nombre y se acercó con respeto. Escribí cómo recibirías hoy a un joven que llega desconfiado.'),
        missionBlock('m5','Desafío','Encontrar a Garelli','Presentá una propuesta de primer encuentro para un joven que necesita sentirse esperado, escuchado y valorado. La propuesta debe incluir un gesto de bienvenida, una actividad y una forma de acompañamiento.',true)
      ],35,true),
      missionModule('3 · Valdocco: casa, patio, escuela y parroquia','La experiencia de Valdocco y el Sistema Preventivo como estilo de acompañamiento.',donBoscoMissions3,[
        missionBlock('m1','Texto','Un oratorio en movimiento','Los primeros oratorios cambiaron varias veces de lugar. Don Bosco tuvo que sostener el sueño aun cuando todo parecía inestable. La misión no dependía solamente de un edificio, sino de la presencia cercana junto a los jóvenes.'),
        missionBlock('m2','Reflexión','La casa de Mamá Margarita','Cuando llegaron a Valdocco, muchos jóvenes encontraron una casa donde podían sentirse conocidos y queridos. Escribí tres gestos concretos que transforman un espacio del colegio o del oratorio en un hogar.'),
        missionBlock('m3','Texto','El Sistema Preventivo','El Sistema Preventivo se apoya en la razón, la religión y la amorevolezza. No se trata solamente de controlar conductas, sino de acompañar, anticiparse a las dificultades y generar confianza.'),
        missionBlock('m4','Evaluación','Casa, patio, escuela y parroquia','Relacioná cada dimensión con una acción concreta: recibir y cuidar, compartir la vida, ayudar a crecer y abrirse a Dios. Después elegí cuál de las cuatro necesita más atención en tu grupo.'),
        missionBlock('m5','Desafío','Construir un oratorio','Diseñá una experiencia salesiana para jóvenes de hoy. Incluí ambiente, actividad, gesto de acompañamiento, norma sencilla y misión final. La propuesta será revisada por el formador.',true)
      ],40,true),
      missionModule('4 · Un sueño que continúa','La expansión del carisma y la misión personal de cada animador.',donBoscoMissions4,[
        missionBlock('m1','Texto','Los primeros salesianos','Don Bosco comprendió que el sueño no podía sostenerlo solo. Formó una comunidad de jóvenes y educadores capaces de compartir la misión y continuarla con un mismo espíritu.'),
        missionBlock('m2','Reflexión','María Auxiliadora','La confianza en María acompañó toda la obra de Don Bosco. Escribí una oración breve para pedir ayuda en una situación concreta de tu tarea como animador.'),
        missionBlock('m3','Texto','Enviados a la misión','En 1875 partieron los primeros salesianos hacia la Patagonia. El carisma comenzó a cruzar fronteras y a llegar a nuevos pueblos, siempre con la misma preocupación: acompañar a los jóvenes.'),
        missionBlock('m4','Evaluación','Don Bosco hoy','Buscá tres signos del espíritu de Don Bosco presentes hoy en Maturana: una persona, un espacio, una actividad o una forma de acompañar. Explicá brevemente cada elección.'),
        missionBlock('m5','Desafío','Mi misión salesiana','Formulá tu misión personal: a quién querés acompañar, cómo lo vas a hacer y cuál será tu primer gesto concreto. Esta entrega final será revisada por el formador.',true)
      ],40,true)
    ]};
  const templates={donbosco:donBosco,
    
    model:{name:'Curso modelo CAFASSO',icon:'🧭',desc:'Recorrido completo con bienvenida, texto, video, material, reflexión, oración, entrega y evaluación.',modules:[
      module('1 · Bienvenida y sentido','Abrimos el recorrido, presentamos el propósito y ubicamos al animador en la experiencia.',[
        block('Texto','Bienvenida','Bienvenido/a a este recorrido de formación. En este módulo vas a encontrar una breve introducción al tema, un recurso para mirar o leer y una primera invitación a conectar lo trabajado con tu propia experiencia.',true),
        block('Texto','¿Para qué hacemos este curso?','Explicá acá, en pocas líneas, qué queremos que el animador comprenda, viva o pueda llevar a su tarea después de completar este recorrido.'),
        block('Video','Video de apertura','Pegá acá un enlace de YouTube o de un video en Google Drive.',true)
      ],25),
      module('2 · Profundizamos','Desarrollamos el contenido central combinando lectura, material de apoyo y reflexión personal.',[
        block('Texto','Idea central','Desarrollá acá el núcleo de la formación. Conviene usar párrafos breves, ejemplos concretos y lenguaje cercano.'),
        block('Documento','Material para profundizar','Pegá acá un enlace a PDF, Google Docs, Slides o cualquier archivo compartido de Drive.',true),
        block('Reflexión','Para pensar','¿Qué aspecto de lo trabajado te interpela más en tu manera de acompañar a otros? ¿Por qué?',true)
      ],35),
      module('3 · Oración y apropiación','Hacemos lugar al silencio, la oración y la síntesis personal.',[
        block('Texto','Momento de oración','Buscá un lugar tranquilo. Hacé unos minutos de silencio. Podés comenzar con una invocación sencilla: “Señor, ayudame a mirar mi tarea con tus ojos y a acompañar con un corazón disponible”. Después releé aquello que más te resonó del curso.'),
        block('Reflexión','Palabra que me queda','Escribí una palabra, frase o intuición que quieras llevarte de este recorrido.',true)
      ],20),
      module('4 · Llevarlo a la práctica','Cerramos el recorrido con una producción concreta y una evaluación breve.',[
        block('Entrega','Compromiso de acción','Pensá una situación concreta de tu tarea como animador/a. Escribí qué gesto o acción vas a intentar poner en práctica a partir de lo trabajado.',true),
        block('Evaluación','Cierre del recorrido','En pocas líneas: ¿qué aprendiste, qué te resultó más significativo y qué te gustaría seguir profundizando?',true)
      ],25)
    ]},
    short:{name:'Curso breve',icon:'⚡',desc:'Un solo módulo para una formación corta y directa.',modules:[module('Módulo único','Presentación y desarrollo del tema.',[block('Texto','Introducción','Escribí acá una breve introducción.'),block('Texto','Contenido principal','Desarrollá acá el contenido central.')],25)]},
    modules:{name:'Curso por módulos',icon:'📚',desc:'Tres módulos para desarrollar un recorrido progresivo.',modules:[module('1 · Introducción','Presentación del tema y objetivos.',[block('Texto','Bienvenida','Presentá el propósito de este recorrido.')],20),module('2 · Profundización','Desarrollo del contenido central.',[block('Texto','Contenido principal','Desarrollá acá el núcleo de la formación.')],30),module('3 · Cierre','Síntesis y cierre del recorrido.',[block('Texto','Síntesis','Recuperá las ideas principales del curso.')],20)]},
    reflection:{name:'Con reflexión final',icon:'💭',desc:'Contenido formativo y una pregunta personal para cerrar.',modules:[module('1 · Para comenzar','Introducción al tema.',[block('Texto','Introducción','Presentá el tema y por qué es importante.')],20),module('2 · Para profundizar','Desarrollo y reflexión personal.',[block('Texto','Contenido principal','Desarrollá acá el contenido formativo.'),block('Reflexión','Para pensar','¿Qué te resuena personalmente de lo trabajado?',true)],30)]},
    assignment:{name:'Con entrega final',icon:'📥',desc:'Recorrido de formación que termina con una producción revisable.',modules:[module('1 · Formación','Contenido y orientaciones.',[block('Texto','Introducción','Presentá el tema.'),block('Texto','Contenido principal','Desarrollá acá el contenido central.')],30),module('2 · Actividad final','Producción personal para entregar.',[block('Entrega','Entrega final','Realizá la actividad propuesta y compartí tu respuesta.',true)],25)]}
  };
  const style=document.createElement('style');style.id='cafassoCourseTemplates';style.textContent=`
    .template-overlay{position:fixed;inset:0;z-index:210;background:rgba(10,25,45,.52);display:none;place-items:center;padding:18px}.template-overlay.show{display:grid}.template-modal{width:min(860px,100%);max-height:90vh;overflow:auto;background:#FFFDF9;border:1px solid var(--line);border-radius:25px;padding:23px;box-shadow:0 26px 80px rgba(10,25,45,.3)}.template-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;margin-bottom:18px}.template-head h2{font:30px Georgia,serif;color:var(--navy);margin:0}.template-head p{color:var(--muted);margin:6px 0 0}.template-close{border:0;width:38px;height:38px;border-radius:50%;background:#F2ECE3;color:var(--navy);font-size:20px;cursor:pointer}.template-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.template-card{border:1px solid var(--line);background:#fff;border-radius:18px;padding:18px;text-align:left;cursor:pointer;color:var(--ink)}.template-card:hover{border-color:#D8B23A;background:#FFFAE8}.template-card .ico{font-size:28px}.template-card strong{display:block;color:var(--navy);font:21px Georgia,serif;margin:9px 0 5px}.template-card small{color:var(--muted);line-height:1.45}.template-note{margin-top:15px;padding:12px 14px;border-radius:13px;background:#F7F1E8;color:var(--muted);font-size:12px}@media(max-width:650px){.template-grid{grid-template-columns:1fr}.template-modal{padding:18px;border-radius:22px}}
  `;document.head.appendChild(style);
  const overlay=document.createElement('div');overlay.className='template-overlay';overlay.innerHTML=`<div class="template-modal"><div class="template-head"><div><h2>Empezar desde una plantilla</h2><p>Elegí una estructura base y después editá todo a tu manera.</p></div><button class="template-close" aria-label="Cerrar">×</button></div><div class="template-grid">${Object.entries(templates).map(([key,t])=>`<button class="template-card" data-template="${key}"><span class="ico">${t.icon}</span><strong>${t.name}</strong><small>${t.desc}</small></button>`).join('')}</div><div class="template-note">La plantilla reemplaza los módulos y contenidos actuales del editor, pero mantiene los datos generales del curso.</div></div>`;document.body.appendChild(overlay);
  const open=()=>overlay.classList.add('show'),close=()=>overlay.classList.remove('show');overlay.querySelector('.template-close').onclick=close;overlay.onclick=e=>{if(e.target===overlay)close()};
  const actions=document.querySelector('main .top .actions');if(actions){const b=document.createElement('button');b.className='btn alt';b.id='courseTemplateBtn';b.type='button';b.textContent='✨ Plantillas';actions.insertBefore(b,actions.firstChild);b.onclick=open;}
  overlay.addEventListener('click',e=>{const b=e.target.closest('[data-template]');if(!b)return;const t=templates[b.dataset.template];if(!t)return;const hasRealContent=(data.modules||[]).some(m=>(m.contents||[]).some(x=>String(x.content?.body||'').trim()));if(hasRealContent&&!confirm('Esta plantilla reemplazará los módulos y contenidos actuales. ¿Continuar?'))return;try{saveAllFields?.()}catch(_){};data.course={...data.course,status:'Borrador'};data.modules=JSON.parse(JSON.stringify(t.modules));active=0;activeBlock=-1;render();try{cache()}catch(_){};document.getElementById('editorSaveState')?.classList.add('dirty');const ss=document.getElementById('editorSaveState');if(ss)ss.textContent='● Plantilla aplicada · falta guardar en Wix';close();try{toast(`Plantilla “${t.name}” aplicada`)}catch(_){};});
  window.CafassoCourseTemplates={open};
})();
