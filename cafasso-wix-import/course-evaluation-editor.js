(()=>{
  if(typeof data==='undefined'||typeof renderBlock!=='function'||document.getElementById('cafassoEvaluationEditor'))return;
  const $e=id=>document.getElementById(id);

  const style=document.createElement('style');
  style.id='cafassoEvaluationEditor';
  style.textContent=`
    .evaluation-mode{display:none;margin:0 0 14px;padding:13px;border:1px solid #d7c7a9;border-radius:9px;background:#f6eddd}.evaluation-mode.show{display:block}
    .evaluation-mode__head strong{display:block;color:#304a40;font:19px Georgia,serif}.evaluation-mode__head small{display:block;margin-top:3px;color:#746e63;font-size:10px;line-height:1.4}
    .evaluation-mode__choices{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.evaluation-mode__choice{border:1px solid #d6c6a8;border-radius:7px;background:#fff9ed;color:#40564c;padding:10px 11px;text-align:left;cursor:pointer}.evaluation-mode__choice b{display:block;font-size:11px}.evaluation-mode__choice span{display:block;margin-top:3px;color:#766f64;font-size:9px;line-height:1.35}.evaluation-mode__choice.active{background:#314d43;border-color:#314d43;color:#fff}.evaluation-mode__choice.active span{color:#dfe9e3}
    .evaluation-builder{display:none;margin:0 0 15px;padding:14px;border:1px solid #d6c39a;border-radius:9px;background:#f7ecd6}.evaluation-builder.show{display:block}.evaluation-builder__top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:12px}.evaluation-builder__top strong{font:20px Georgia,serif;color:#30483f}.evaluation-builder__top small{display:block;margin-top:3px;color:#766f62;font-size:10px}.evaluation-builder button{border:1px solid #cfbd93;border-radius:6px;background:#fff9ed;color:#3c554a;padding:7px 9px;font-size:10px;font-weight:850;cursor:pointer}
    .evaluation-config{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-bottom:12px;padding:11px;border:1px solid #dfd0b1;border-radius:8px;background:#fff8e9}.evaluation-config label{display:grid;gap:5px;color:#5e5a50;font-size:9px;font-weight:850;text-transform:uppercase;letter-spacing:.04em}.evaluation-config input,.evaluation-config select{width:100%;border:1px solid #d6c5a5;border-radius:6px;background:#fff;padding:8px 9px;color:#334b42;font:inherit}
    .evaluation-question-list{display:grid;gap:10px}.evaluation-question{border:1px solid #d9c8a6;border-radius:9px;background:#fff9ed;overflow:hidden}.evaluation-question__head{display:grid;grid-template-columns:auto minmax(0,1fr) 140px auto;gap:8px;align-items:center;padding:10px 11px;border-bottom:1px solid #e2d5bd;background:#f3e8d4}.evaluation-question__num{display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:#385448;color:#fff;font-size:10px;font-weight:900}.evaluation-question__head select,.evaluation-question__head input{width:100%;border:1px solid #d3c19d;border-radius:6px;background:#fffaf0;padding:7px 8px;color:#354f44;font:inherit}.evaluation-question__actions{display:flex;gap:4px}.evaluation-question__actions button{padding:6px 7px}.evaluation-question__actions .danger{color:#974f43;background:#fff4f0;border-color:#dfb9b0}
    .evaluation-question__body{display:grid;gap:10px;padding:11px}.evaluation-question label{display:grid;gap:5px;color:#5e5a50;font-size:9px;font-weight:850;text-transform:uppercase;letter-spacing:.04em}.evaluation-question textarea,.evaluation-question__body input,.evaluation-question__body select{width:100%;border:1px solid #d6c5a5;border-radius:6px;background:#fff;padding:8px 9px;color:#334b42;font:inherit}.evaluation-question textarea{min-height:58px;resize:vertical}
    .evaluation-options{display:grid;gap:6px}.evaluation-option{display:grid;grid-template-columns:28px minmax(0,1fr) auto;gap:6px;align-items:center}.evaluation-option input[type="radio"]{width:auto}.evaluation-option button{padding:6px 7px}.evaluation-add-option{width:max-content}.evaluation-two{display:grid;grid-template-columns:1fr 1fr;gap:9px}.evaluation-note{padding:10px;border-radius:7px;background:#eee5d5;color:#6b655c;font-size:10px;line-height:1.45}
    @media(max-width:760px){.evaluation-mode__choices,.evaluation-config,.evaluation-two{grid-template-columns:1fr}.evaluation-question__head{grid-template-columns:auto 1fr}.evaluation-question__head>input,.evaluation-question__actions{grid-column:2}.evaluation-builder__top{display:block}.evaluation-builder__top button{margin-top:9px;width:100%}}
  `;
  document.head.appendChild(style);

  const typed=$e('typedSettingsPanel');
  const anchor=typed||$e('typedBlockPreview')||$e('blockBody')?.closest('.field');
  if(!anchor)return;

  const mode=document.createElement('div');
  mode.id='evaluationModePanel';
  mode.className='evaluation-mode';
  mode.innerHTML='<div class="evaluation-mode__head"><strong>Tipo de evaluación</strong><small>Podés mantener una respuesta abierta o construir un cuestionario con autocorrección.</small></div><div class="evaluation-mode__choices"><button type="button" class="evaluation-mode__choice" data-eval-mode="open"><b>✍️ Respuesta abierta</b><span>Una consigna escrita que revisa el formador.</span></button><button type="button" class="evaluation-mode__choice" data-eval-mode="quiz"><b>✅ Cuestionario</b><span>Opción múltiple, verdadero/falso y preguntas abiertas combinables.</span></button></div>';
  anchor.insertAdjacentElement('beforebegin',mode);

  const builder=document.createElement('div');
  builder.id='evaluationBuilder';
  builder.className='evaluation-builder';
  builder.innerHTML='<div class="evaluation-builder__top"><div><strong>Preguntas de la evaluación</strong><small>Las preguntas cerradas se corrigen automáticamente. Si agregás preguntas abiertas, la evaluación queda pendiente de revisión.</small></div><button type="button" data-eval-add>＋ Pregunta</button></div><div class="evaluation-config"><label>Puntaje mínimo (%)<input id="evalPassingScore" type="number" min="0" max="100" step="1"></label><label>Intentos máximos<input id="evalMaxAttempts" type="number" min="0" max="99" step="1"><small style="font-weight:500;text-transform:none">0 = ilimitados</small></label><label>Mostrar respuestas correctas<select id="evalShowAnswers"><option value="after-submit">Al terminar cada intento</option><option value="after-pass">Solo al aprobar</option><option value="never">Nunca</option></select></label></div><div class="evaluation-question-list" id="evaluationQuestionList"></div>';
  mode.insertAdjacentElement('afterend',builder);

  function block(){return data.modules?.[active]?.contents?.[activeBlock]||null}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
  function uid(){return 'q-'+crypto.randomUUID().replace(/-/g,'').slice(0,10)}
  function mark(){
    try{cache()}catch(e){}
    const s=$e('editorSaveState');if(s){s.classList.add('dirty');s.textContent='● Cambios todavía no guardados en Wix'}
    const sync=$e('syncStatus');if(sync&&!String(sync.textContent||'').includes('Nuevo curso')){sync.textContent='Cambios locales · falta guardar en Wix';sync.classList.add('warn')}
  }
  function schema(b=block()){
    if(!b)return null;
    b.settings=b.settings||{};
    let ev=b.settings.evaluation;
    if(!ev||typeof ev!=='object')ev={version:1,passingScore:70,maxAttempts:3,showCorrectAnswers:'after-submit',questions:[]};
    ev.version=1;
    ev.passingScore=Math.max(0,Math.min(100,Number(ev.passingScore??70)));
    ev.maxAttempts=Math.max(0,Math.min(99,Number(ev.maxAttempts??3)));
    ev.showCorrectAnswers=['after-submit','after-pass','never'].includes(ev.showCorrectAnswers)?ev.showCorrectAnswers:'after-submit';
    ev.questions=Array.isArray(ev.questions)?ev.questions:[];
    ev.questions=ev.questions.map(q=>normalizeQuestion(q));
    b.settings.evaluation=ev;
    return ev;
  }
  function normalizeQuestion(q){
    q=q&&typeof q==='object'?q:{};
    const type=['choice','boolean','open'].includes(q.type)?q.type:'choice';
    const out={...q,id:q.id||uid(),type,prompt:String(q.prompt||''),points:Math.max(1,Math.min(100,Number(q.points||1))),explanation:String(q.explanation||'')};
    if(type==='choice'){out.options=Array.isArray(q.options)&&q.options.length>=2?q.options.map(x=>String(x??'')):['Opción 1','Opción 2'];out.correctIndex=Math.max(0,Math.min(out.options.length-1,Number(q.correctIndex||0)));}
    if(type==='boolean')out.correctBoolean=q.correctBoolean===false?false:true;
    if(type==='open'){out.minChars=Math.max(0,Math.min(10000,Number(q.minChars||0)));out.reviewCriteria=String(q.reviewCriteria||'');}
    return out;
  }
  function newQuestion(type='choice'){
    return normalizeQuestion({id:uid(),type,prompt:'',points:1,options:['Opción 1','Opción 2'],correctIndex:0,correctBoolean:true,minChars:0,reviewCriteria:'',explanation:''});
  }
  function isQuiz(){return String(block()?.settings?.evaluationMode||'open')==='quiz'}
  function setMode(next){
    const b=block();if(!b)return;
    b.settings=b.settings||{};
    b.settings.evaluationMode=next==='quiz'?'quiz':'open';
    if(next==='quiz'){const ev=schema(b);if(!ev.questions.length)ev.questions.push(newQuestion('choice'))}
    mark();refresh();
  }
  function qTypeLabel(type){return type==='choice'?'Opción múltiple':type==='boolean'?'Verdadero / falso':'Respuesta abierta'}
  function questionBody(q){
    if(q.type==='choice'){
      return `<div class="evaluation-options">${q.options.map((opt,i)=>`<div class="evaluation-option"><input type="radio" name="correct-${esc(q.id)}" data-q-correct="${esc(q.id)}" value="${i}" ${Number(q.correctIndex)===i?'checked':''} title="Respuesta correcta"><input data-q-option="${esc(q.id)}" data-option-index="${i}" value="${esc(opt)}" placeholder="Opción ${i+1}"><button type="button" data-option-delete="${esc(q.id)}" data-option-index="${i}" ${q.options.length<=2?'disabled':''}>×</button></div>`).join('')}</div><button type="button" class="evaluation-add-option" data-option-add="${esc(q.id)}">＋ Opción</button><label>Explicación después de responder<textarea data-q-field="explanation" data-qid="${esc(q.id)}" placeholder="Opcional: por qué esa respuesta es correcta">${esc(q.explanation||'')}</textarea></label>`;
    }
    if(q.type==='boolean'){
      return `<div class="evaluation-two"><label>Respuesta correcta<select data-q-field="correctBoolean" data-qid="${esc(q.id)}"><option value="true" ${q.correctBoolean!==false?'selected':''}>Verdadero</option><option value="false" ${q.correctBoolean===false?'selected':''}>Falso</option></select></label><label>Explicación<textarea data-q-field="explanation" data-qid="${esc(q.id)}" placeholder="Opcional">${esc(q.explanation||'')}</textarea></label></div>`;
    }
    return `<div class="evaluation-two"><label>Mínimo de caracteres<input type="number" min="0" max="10000" step="10" data-q-field="minChars" data-qid="${esc(q.id)}" value="${Number(q.minChars||0)}"></label><label>Criterio de revisión<textarea data-q-field="reviewCriteria" data-qid="${esc(q.id)}" placeholder="¿Qué debe demostrar la respuesta?">${esc(q.reviewCriteria||'')}</textarea></label></div><div class="evaluation-note">Esta pregunta no se corrige automáticamente. Al enviar la evaluación, queda disponible para el formador en Entregas.</div>`;
  }
  function renderQuestions(){
    const ev=schema(),list=$e('evaluationQuestionList');if(!ev||!list)return;
    list.innerHTML=ev.questions.length?ev.questions.map((q,i)=>`<article class="evaluation-question" data-q-card="${esc(q.id)}"><header class="evaluation-question__head"><span class="evaluation-question__num">${i+1}</span><select data-q-field="type" data-qid="${esc(q.id)}"><option value="choice" ${q.type==='choice'?'selected':''}>Opción múltiple</option><option value="boolean" ${q.type==='boolean'?'selected':''}>Verdadero / falso</option><option value="open" ${q.type==='open'?'selected':''}>Respuesta abierta</option></select><input type="number" min="1" max="100" step="1" data-q-field="points" data-qid="${esc(q.id)}" value="${Number(q.points||1)}" title="Puntos"><div class="evaluation-question__actions"><button type="button" data-q-up="${esc(q.id)}">↑</button><button type="button" data-q-down="${esc(q.id)}">↓</button><button type="button" data-q-duplicate="${esc(q.id)}">⧉</button><button type="button" class="danger" data-q-delete="${esc(q.id)}">×</button></div></header><div class="evaluation-question__body"><label>Pregunta<textarea data-q-field="prompt" data-qid="${esc(q.id)}" placeholder="Escribí la pregunta…">${esc(q.prompt)}</textarea></label>${questionBody(q)}</div></article>`).join(''):'<div class="evaluation-note">Todavía no hay preguntas.</div>';
  }
  function refresh(){
    const b=block(),evaluation=String($e('blockType')?.value||b?.type||'')==='Evaluación';
    mode.classList.toggle('show',!!b&&evaluation);
    if(!b||!evaluation){builder.classList.remove('show');if(typed)typed.style.display='';return}
    const quiz=isQuiz();
    document.querySelectorAll('[data-eval-mode]').forEach(btn=>btn.classList.toggle('active',btn.dataset.evalMode===(quiz?'quiz':'open')));
    builder.classList.toggle('show',quiz);
    if(typed)typed.style.display=quiz?'none':'';
    if(quiz){
      const ev=schema();
      $e('evalPassingScore').value=Number(ev.passingScore??70);
      $e('evalMaxAttempts').value=Number(ev.maxAttempts??3);
      $e('evalShowAnswers').value=ev.showCorrectAnswers||'after-submit';
      renderQuestions();
    }
  }
  function findQuestion(id){return schema()?.questions.find(q=>q.id===id)||null}
  function saveConfig(){
    if(!isQuiz())return;
    const ev=schema();if(!ev)return;
    ev.passingScore=Math.max(0,Math.min(100,Number($e('evalPassingScore')?.value||0)));
    ev.maxAttempts=Math.max(0,Math.min(99,Math.round(Number($e('evalMaxAttempts')?.value||0))));
    ev.showCorrectAnswers=$e('evalShowAnswers')?.value||'after-submit';
  }
  function evaluationProblems(){
    const problems=[];
    (data.modules||[]).forEach((m,mi)=>(m.contents||[]).forEach((b,bi)=>{
      if(String(b.type||'')!=='Evaluación'||String(b.settings?.evaluationMode||'open')!=='quiz')return;
      const ev=b.settings?.evaluation;
      if(!ev||!Array.isArray(ev.questions)||!ev.questions.length){problems.push({mi,bi,message:`La evaluación “${b.title||'Evaluación'}” necesita al menos una pregunta.`});return}
      ev.questions.forEach((q,qi)=>{
        if(!String(q.prompt||'').trim())problems.push({mi,bi,message:`La pregunta ${qi+1} de “${b.title||'Evaluación'}” está vacía.`});
        if(Number(q.points||0)<=0)problems.push({mi,bi,message:`La pregunta ${qi+1} necesita un puntaje mayor que 0.`});
        if(q.type==='choice'){
          const opts=Array.isArray(q.options)?q.options:[];
          if(opts.length<2||opts.some(x=>!String(x||'').trim()))problems.push({mi,bi,message:`Completá todas las opciones de la pregunta ${qi+1}.`});
          if(Number(q.correctIndex)<0||Number(q.correctIndex)>=opts.length)problems.push({mi,bi,message:`Elegí la respuesta correcta de la pregunta ${qi+1}.`});
        }
      });
    }));
    return problems;
  }

  const originalSave=saveBlockFields;
  saveBlockFields=function(){originalSave();saveConfig();};

  const originalRender=renderBlock;
  renderBlock=function(){originalRender();setTimeout(refresh,0)};

  document.addEventListener('click',e=>{
    const m=e.target.closest('[data-eval-mode]');if(m){setMode(m.dataset.evalMode);return}
    if(e.target.closest('[data-eval-add]')){schema().questions.push(newQuestion('choice'));mark();renderQuestions();return}
    const structural=['q-up','q-down','q-duplicate','q-delete'];
    for(const key of structural){
      const btn=e.target.closest('[data-'+key+']');if(!btn)continue;
      const id=btn.getAttribute('data-'+key),ev=schema(),i=ev.questions.findIndex(q=>q.id===id);if(i<0)return;
      if(key==='q-up'&&i>0)[ev.questions[i-1],ev.questions[i]]=[ev.questions[i],ev.questions[i-1]];
      if(key==='q-down'&&i<ev.questions.length-1)[ev.questions[i+1],ev.questions[i]]=[ev.questions[i],ev.questions[i+1]];
      if(key==='q-duplicate'){const copy=JSON.parse(JSON.stringify(ev.questions[i]));copy.id=uid();copy.prompt=(copy.prompt||'Pregunta')+' · copia';ev.questions.splice(i+1,0,copy)}
      if(key==='q-delete'){if(!confirm('¿Eliminar esta pregunta?'))return;ev.questions.splice(i,1)}
      mark();renderQuestions();return;
    }
    const add=e.target.closest('[data-option-add]');if(add){const q=findQuestion(add.dataset.optionAdd);if(!q)return;q.options.push('Opción '+(q.options.length+1));mark();renderQuestions();return}
    const del=e.target.closest('[data-option-delete]');if(del){const q=findQuestion(del.dataset.optionDelete),i=Number(del.dataset.optionIndex);if(!q||q.options.length<=2)return;q.options.splice(i,1);if(q.correctIndex>=q.options.length)q.correctIndex=q.options.length-1;mark();renderQuestions();return}
  });
  document.addEventListener('input',e=>{
    if(e.target.id==='evalPassingScore'||e.target.id==='evalMaxAttempts'){saveConfig();mark();return}
    const id=e.target.dataset.qid,field=e.target.dataset.qField;if(!id||!field)return;
    const q=findQuestion(id);if(!q)return;
    if(field==='points'||field==='minChars')q[field]=Math.max(field==='points'?1:0,Number(e.target.value||0));
    else q[field]=e.target.value;
    mark();
  });
  document.addEventListener('change',e=>{
    if(e.target.id==='evalShowAnswers'){saveConfig();mark();return}
    if(e.target.matches('[data-q-option]')){const q=findQuestion(e.target.dataset.qOption),i=Number(e.target.dataset.optionIndex);if(q&&i>=0){q.options[i]=e.target.value;mark()}return}
    if(e.target.matches('[data-q-correct]')){const q=findQuestion(e.target.dataset.qCorrect);if(q){q.correctIndex=Number(e.target.value);mark()}return}
    const id=e.target.dataset.qid,field=e.target.dataset.qField;if(!id||!field)return;
    const q=findQuestion(id);if(!q)return;
    if(field==='type'){const fresh=newQuestion(e.target.value);Object.assign(q,{...fresh,id:q.id,prompt:q.prompt,points:q.points});}
    else if(field==='correctBoolean')q.correctBoolean=e.target.value==='true';
    else if(field==='points'||field==='minChars')q[field]=Math.max(field==='points'?1:0,Number(e.target.value||0));
    else q[field]=e.target.value;
    mark();if(field==='type')renderQuestions();
  });

  const originalSaveToWix=saveToWix;
  saveToWix=async function(publish=false){
    saveConfig();
    if(publish){
      const problems=evaluationProblems();
      if(problems.length){
        const p=problems[0];active=p.mi;activeBlock=p.bi;render();setTimeout(()=>$e('evaluationBuilder')?.scrollIntoView({behavior:'smooth',block:'center'}),0);
        try{toast(p.message)}catch(_){alert(p.message)}
        return false;
      }
    }
    return originalSaveToWix(publish);
  };

  refresh();
})();