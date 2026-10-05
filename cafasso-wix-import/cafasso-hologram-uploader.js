(()=>{
  if(window.CafassoHologramUploader)return;
  const API='https://federicomaresca.wixstudio.com/my-site-1/_functions/cafassoHologramUploadUrl';
  const MAX_BYTES=50*1024*1024;
  const MAX_SECONDS=60;

  function mimeOf(file){
    const direct=String(file?.type||'').toLowerCase();
    if(['video/mp4','video/quicktime','video/webm'].includes(direct))return direct;
    const name=String(file?.name||'').toLowerCase();
    if(name.endsWith('.mp4')||name.endsWith('.m4v'))return'video/mp4';
    if(name.endsWith('.mov'))return'video/quicktime';
    if(name.endsWith('.webm'))return'video/webm';
    return direct;
  }
  function fieldForMime(mime){
    if(mime==='video/webm')return'videoWebm';
    if(mime==='video/quicktime')return'videoMov';
    return'videoMp4';
  }
  function readDuration(file){
    return new Promise(resolve=>{
      const video=document.createElement('video');
      const url=URL.createObjectURL(file);
      video.preload='metadata';
      video.muted=true;
      video.playsInline=true;
      const done=value=>{try{URL.revokeObjectURL(url)}catch(e){}resolve(Number(value||0))};
      video.onloadedmetadata=()=>done(video.duration);
      video.onerror=()=>done(0);
      video.src=url;
    });
  }
  async function validate(file){
    if(!file)throw new Error('Elegí un video.');
    const mimeType=mimeOf(file);
    if(!['video/mp4','video/quicktime','video/webm'].includes(mimeType))throw new Error('Usá un video MP4, MOV o WebM.');
    if(Number(file.size||0)<=0)throw new Error('No pudimos leer el tamaño del video.');
    if(file.size>MAX_BYTES)throw new Error('Para un holograma el video debe pesar hasta 50 MB.');
    const duration=await readDuration(file);
    if(duration&&duration>MAX_SECONDS)throw new Error('Para mantener CAFASSO ágil, cada holograma puede durar hasta 60 segundos.');
    return{mimeType,duration,sizeInBytes:file.size,fileName:file.name||('cafasso-hologram-'+Date.now()+'.mp4')};
  }
  async function upload(file,{onStatus}={}){
    const meta=await validate(file);
    onStatus?.('Preparando subida…',0);
    const signed=await fetch(API,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(meta)
    });
    const signedJson=await signed.json().catch(()=>null);
    if(!signed.ok||!signedJson?.ok||!signedJson?.uploadUrl)throw new Error(signedJson?.error||'No pudimos preparar la subida a Wix.');

    onStatus?.('Subiendo a Wix…',0.12);
    const result=await new Promise((resolve,reject)=>{
      const xhr=new XMLHttpRequest();
      xhr.open('PUT',signedJson.uploadUrl,true);
      xhr.setRequestHeader('Content-Type',meta.mimeType);
      xhr.upload.onprogress=e=>{
        if(e.lengthComputable)onStatus?.('Subiendo a Wix…',0.12+0.82*(e.loaded/e.total));
      };
      xhr.onerror=()=>reject(new Error('Se cortó la subida del video.'));
      xhr.onload=()=>{
        if(xhr.status<200||xhr.status>=300)return reject(new Error('Wix rechazó la subida del video.'));
        try{resolve(JSON.parse(xhr.responseText||'{}'))}catch(e){reject(new Error('Wix respondió con un formato inesperado.'))}
      };
      xhr.send(file);
    });
    const descriptor=result?.file;
    const url=String(descriptor?.url||descriptor?.media?.video?.video?.url||'').trim();
    if(!url)throw new Error('El video subió, pero Wix todavía no devolvió su enlace.');
    onStatus?.(descriptor?.operationStatus==='READY'?'Video listo ✓':'Video subido · Wix lo está procesando…',1);
    return{
      url,
      fileId:String(descriptor?.id||''),
      operationStatus:String(descriptor?.operationStatus||''),
      mimeType:meta.mimeType,
      duration:meta.duration,
      sizeInBytes:meta.sizeInBytes,
      field:fieldForMime(meta.mimeType)
    };
  }
  function assign(config,result){
    if(!config||!result)return config;
    delete config.videoWebm;delete config.videoMov;delete config.videoMp4;
    config[result.field||fieldForMime(result.mimeType)]=result.url;
    config.videoFileId=result.fileId||'';
    config.removeBackground=true;
    config.videoSource='wix-upload';
    return config;
  }
  function localPreviewConfig(config,file){
    const mimeType=mimeOf(file);
    const url=URL.createObjectURL(file);
    const preview={...config,repeat:'always',removeBackground:true};
    delete preview.videoWebm;delete preview.videoMov;delete preview.videoMp4;
    preview[fieldForMime(mimeType)]=url;
    preview.__cafassoObjectUrl=url;
    return preview;
  }
  window.CafassoHologramUploader={upload,assign,validate,localPreviewConfig,mimeOf,fieldForMime,MAX_BYTES,MAX_SECONDS};
})();