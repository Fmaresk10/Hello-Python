(()=>{
  if(window.CafassoHologramCutout)return;
  const MODULE='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/+esm';
  const WASM='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm';
  const MODEL='https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite';
  let enginePromise=null;

  async function createEngine(){
    const mod=await import(MODULE);
    const vision=await mod.FilesetResolver.forVisionTasks(WASM);
    let segmenter;
    try{
      segmenter=await mod.ImageSegmenter.createFromOptions(vision,{
        baseOptions:{modelAssetPath:MODEL,delegate:'GPU'},
        runningMode:'VIDEO',
        outputCategoryMask:false,
        outputConfidenceMasks:true
      });
    }catch(error){
      segmenter=await mod.ImageSegmenter.createFromOptions(vision,{
        baseOptions:{modelAssetPath:MODEL,delegate:'CPU'},
        runningMode:'VIDEO',
        outputCategoryMask:false,
        outputConfidenceMasks:true
      });
    }
    const labels=typeof segmenter.getLabels==='function'?segmenter.getLabels():[];
    let personIndex=labels.findIndex(label=>/person|foreground/i.test(String(label||'')));
    if(personIndex<0)personIndex=Math.min(1,Math.max(0,labels.length-1));
    return{segmenter,personIndex,labels};
  }
  function engine(){return enginePromise||(enginePromise=createEngine().catch(error=>{enginePromise=null;throw error}))}
  function smoothAlpha(value){
    const low=.22,high=.72;
    if(value<=low)return 0;
    if(value>=high)return 255;
    const x=(value-low)/(high-low);
    const eased=x*x*(3-2*x);
    return Math.round(eased*255);
  }
  function canvasSize(video){
    const vw=Math.max(1,Number(video.videoWidth||360)),vh=Math.max(1,Number(video.videoHeight||640));
    const max=540,scale=Math.min(1,max/vw);
    return{width:Math.max(1,Math.round(vw*scale)),height:Math.max(1,Math.round(vh*scale))};
  }
  function attach(video,host,config={}){
    return new Promise(async resolve=>{
      let stopped=false,raf=0,busy=false,lastSeg=0,lastVideoTime=-1,maskCanvas=null,maskCtx=null,maskImage=null,frameErrors=0,foregroundConfirmed=false,fallbackTimer=0,goodMasks=0,smoothedAlpha=null;
      const canvas=document.createElement('canvas');
      canvas.className='cafasso-holo-cutout-canvas';
      canvas.setAttribute('aria-hidden','true');
      const ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});
      const loading=document.createElement('span');
      loading.className='cafasso-holo-cutout-loading';
      loading.textContent='Preparando recorte…';
      host.appendChild(canvas);host.appendChild(loading);

      const previousVideoStyle={
        position:video.style.position,
        left:video.style.left,
        top:video.style.top,
        width:video.style.width,
        height:video.style.height,
        maxWidth:video.style.maxWidth,
        maxHeight:video.style.maxHeight,
        opacity:video.style.opacity,
        pointerEvents:video.style.pointerEvents,
        visibility:video.style.visibility
      };
      const restoreVideo=()=>{
        video.style.position=previousVideoStyle.position;
        video.style.left=previousVideoStyle.left;
        video.style.top=previousVideoStyle.top;
        video.style.width=previousVideoStyle.width;
        video.style.height=previousVideoStyle.height;
        video.style.maxWidth=previousVideoStyle.maxWidth;
        video.style.maxHeight=previousVideoStyle.maxHeight;
        video.style.opacity=previousVideoStyle.opacity;
        video.style.pointerEvents=previousVideoStyle.pointerEvents;
        video.style.visibility=previousVideoStyle.visibility;
      };
      const revealOriginal=()=>{
        if(fallbackTimer){clearTimeout(fallbackTimer);fallbackTimer=0}
        restoreVideo();
        video.style.opacity='1';
        canvas.remove();
        loading.remove();
        host.classList.add('cafasso-holo-cutout-fallback');
      };
      let cleanup=()=>{
        stopped=true;
        if(raf)cancelAnimationFrame(raf);
        if(fallbackTimer)clearTimeout(fallbackTimer);
        loading.remove();
        canvas.remove();
        restoreVideo();
      };
      const waitMeta=()=>new Promise(done=>{
        if(video.readyState>=1&&video.videoWidth)return done();
        const finish=()=>{video.removeEventListener('loadedmetadata',finish);done()};
        video.addEventListener('loadedmetadata',finish,{once:true});
        setTimeout(finish,5000);
      });
      try{
        await waitMeta();
        if(stopped)return resolve(cleanup);
        const size=canvasSize(video);canvas.width=size.width;canvas.height=size.height;
        // Keep the original video visible until a real foreground mask exists.
        // This prevents a transparent cutout from making the hologram disappear.
        canvas.style.position='absolute';
        canvas.style.left='50%';
        canvas.style.bottom='0';
        canvas.style.transform='translateX(-50%)';
        canvas.style.zIndex='2';
        canvas.style.pointerEvents='none';
        canvas.style.opacity='0';
        video.style.opacity='0';
        video.style.visibility='visible';
        const e=await engine();
        if(stopped)return resolve(cleanup);
        loading.textContent='Detectando persona…';
        fallbackTimer=setTimeout(()=>{
          if(stopped||foregroundConfirmed)return;
          stopped=true;
          if(raf)cancelAnimationFrame(raf);
          canvas.remove();
          loading.remove();
          restoreVideo();
          video.style.opacity='1';
          host.classList.add('cafasso-holo-cutout-fallback');
        },1800);
        const fps=Math.max(6,Math.min(18,Number(config.cutoutFps||((matchMedia?.('(pointer:coarse)')?.matches)?10:14))));
        const interval=1000/fps;

        const updateMask=result=>{
          try{
            const masks=result?.confidenceMasks||[];
            const mask=masks[e.personIndex]||masks[masks.length-1];
            if(!mask||typeof mask.getAsFloat32Array!=='function')return;
            const data=mask.getAsFloat32Array(),mw=Number(mask.width||256),mh=Number(mask.height||256);
            if(!maskCanvas||maskCanvas.width!==mw||maskCanvas.height!==mh){
              maskCanvas=document.createElement('canvas');maskCanvas.width=mw;maskCanvas.height=mh;
              maskCtx=maskCanvas.getContext('2d');
              maskImage=maskCtx.createImageData(mw,mh);
            }
            const nextAlpha=new Uint8ClampedArray(data.length);
            let opaque=0;
            for(let i=0;i<data.length;i++){
              const a=smoothAlpha(Number(data[i]||0));
              nextAlpha[i]=a;
              if(a>40)opaque+=1;
            }
            const coverage=data.length?opaque/data.length:0;
            const valid=coverage>.015&&coverage<.92;

            if(valid){
              frameErrors=0;
              goodMasks+=1;
              if(!smoothedAlpha||smoothedAlpha.length!==nextAlpha.length){
                smoothedAlpha=nextAlpha.slice();
              }else{
                const blend=foregroundConfirmed?.28:.48;
                for(let i=0;i<nextAlpha.length;i++){
                  smoothedAlpha[i]=Math.round(smoothedAlpha[i]*(1-blend)+nextAlpha[i]*blend);
                }
              }

              const out=maskImage.data;
              for(let i=0,j=0;i<smoothedAlpha.length;i++,j+=4){
                out[j]=255;out[j+1]=255;out[j+2]=255;out[j+3]=smoothedAlpha[i];
              }
              maskCtx.putImageData(maskImage,0,0);

              if(!foregroundConfirmed&&goodMasks>=2){
                foregroundConfirmed=true;
                canvas.style.opacity='1';
                video.style.opacity='0';
                loading.remove();
                if(fallbackTimer){clearTimeout(fallbackTimer);fallbackTimer=0}
              }
            }else if(!foregroundConfirmed){
              goodMasks=0;
            }
            // Once locked, invalid masks are ignored and the last good silhouette stays on screen.
          }finally{
            try{result?.confidenceMasks?.forEach(m=>m?.close?.())}catch(e){}
            try{result?.categoryMask?.close?.()}catch(e){}
            busy=false;
          }
        };
        const draw=()=>{
          if(stopped)return;
          if(video.readyState>=2){
            ctx.clearRect(0,0,canvas.width,canvas.height);
            ctx.globalCompositeOperation='source-over';
            ctx.filter='none';
            ctx.drawImage(video,0,0,canvas.width,canvas.height);
            if(maskCanvas){
              ctx.globalCompositeOperation='destination-in';
              ctx.filter='blur(1.25px)';
              ctx.drawImage(maskCanvas,0,0,canvas.width,canvas.height);
              ctx.filter='none';
              ctx.globalCompositeOperation='source-over';
            }
          }
          const now=performance.now();
          if(!video.paused&&!video.ended&&!busy&&now-lastSeg>=interval&&video.currentTime!==lastVideoTime){
            busy=true;lastSeg=now;lastVideoTime=video.currentTime;
            try{
              const maybe=e.segmenter.segmentForVideo(video,now,updateMask);
              if(maybe&&maybe.confidenceMasks)updateMask(maybe);
            }catch(error){
              busy=false;frameErrors+=1;
              console.warn('CAFASSO cutout frame',error);
              if(!foregroundConfirmed&&frameErrors>=3){
                stopped=true;
                revealOriginal();
                video.style.opacity='1';
                return;
              }
              // After a successful lock, transient segmentation errors never switch
              // back to the full video; the last good mask remains visible.
            }
          }
          raf=requestAnimationFrame(draw);
        };
        draw();
        resolve(cleanup);
      }catch(error){
        console.warn('CAFASSO: no se pudo activar el recorte automático.',error);
        revealOriginal();
        resolve(cleanup);
      }
    });
  }
  window.CafassoHologramCutout={attach,engine};
})();