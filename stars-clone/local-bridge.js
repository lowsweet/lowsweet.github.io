/* Local hosting and Landing integration. Every upstream rendering JS is unmodified. */
(function(){
 var params=new URLSearchParams(location.search),background=params.get('background')==='1';
 var paused=false,stalled=false,ready=false,intro=background,lastReport=0,lastTick=0;
 var phase=background?'loading':'standalone',phaseElapsed=0,started=false,requestedDistance=1,phaseTrace=[],motionSamples=[],activeElapsed=0;
 function option(name,fallback,min,max){var n=Number(params.get(name));return params.has(name)&&isFinite(n)?Math.max(min,Math.min(max,n)):fallback;}
 var entrance={start:{z:option('startZ',2000,100,2500),rx:option('startRx',Math.PI*.05,-Math.PI/2,Math.PI/2),ry:option('startRy',5.20-.225,-Math.PI*2,Math.PI*2),cameraScaleZ:option('cameraScaleZ',.83,.1,2)},end:{z:option('endZ',50000,10000,79999),rx:Math.PI*.05,ry:option('endRy',5.20,Math.PI/2+.4,Math.PI/2+Math.PI*2)},spinMs:option('spinMs',2500,100,30000),wheelReplayMs:option('wheelReplayMs',1000,1000,30000)};
 var endpoint=Object.assign({},entrance.end),wheelsSent=0;
 var poseTargets=[{distance:1,index:null},{distance:.88,index:7},{distance:.74,index:6},{distance:.60,index:5},{distance:.47,index:4},{distance:.35,index:3},{distance:.25,index:2},{distance:.215,index:1},{distance:.18,index:0}];
 var poseTarget=null,starlight=null;
 function report(type,extra){if(background&&parent!==window)parent.postMessage(Object.assign({source:'stars-galaxy-clone',type:type},extra||{}),location.origin);}
 function setPhase(next){phase=next;phaseElapsed=0;phaseTrace.push({phase:phase,ms:activeElapsed,z:camera.position.z,rx:rotateX,ry:rotateY,wheelInputs:wheelsSent});report('entrance-phase',{phase:phase});}
 function scrollPose(distance){
  // One proportional zoom connects the two opening screens. The old .88
  // intermediate stop braked the camera halfway through this short transition.
  if(background&&distance>=.74){
   var progress=constrain((1-distance)/.26,0,1),eased=Tour.Easing(progress);
   return {z:endpoint.z*Math.pow(GALAXY_TOUR[6].z/endpoint.z,eased),rx:endpoint.rx,ry:endpoint.ry};
  }
  var a=poseTargets[0],b=a;
  for(var i=1;i<poseTargets.length;i++){b=poseTargets[i];if(distance>=b.distance)break;a=b;}
  var t=a===b?0:constrain((a.distance-distance)/(a.distance-b.distance),0,1);
  t=Tour.Easing(t);var from=a.index===null?endpoint:GALAXY_TOUR[a.index],to=b.index===null?endpoint:GALAXY_TOUR[b.index];
  // Scrolling changes scale only. Keep the calibrated entrance orientation
  // instead of applying the Tour's different viewing angles at each distance.
  return {z:from.z+(to.z-from.z)*t,rx:endpoint.rx,ry:endpoint.ry};
 }
 function texturesReady(){
  var loaded=true;
  function inspect(texture){if(!texture||!texture.image)return;var images=Array.isArray(texture.image)?texture.image:[texture.image];images.forEach(function(image){if(image&&image.tagName==='IMG'&&(!image.complete||!image.naturalWidth))loaded=false;});}
  scene.traverse(function(object){if(!object.material)return;var materials=Array.isArray(object.material)?object.material:[object.material];materials.forEach(function(material){inspect(material.map);if(material.uniforms)Object.keys(material.uniforms).forEach(function(key){var value=material.uniforms[key].value;if(value instanceof THREE.Texture)inspect(value);});});});
  return loaded;
 }
 function finishEntrance(){
  // Keep the calibrated pose at the end of the continuous entrance.
  endpoint={z:entrance.end.z,rx:rotateX,ry:rotateY};intro=false;
  setPhase('complete');poseTarget=scrollPose(requestedDistance);
  report('intro-complete',{pose:endpoint});
 }
 function advanceEntrance(dt){
  phaseElapsed+=dt;activeElapsed+=dt;
  initialAutoRotate=false;
  // One uninterrupted rotation timeline spans both the spin and pullback.
  // Its velocity reaches zero only at the final galaxy pose.
  var orbitDuration=entrance.spinMs+entrance.wheelReplayMs;
  var brakeMs=Math.min(250,entrance.wheelReplayMs);
  var elapsed=constrain(activeElapsed,0,orbitDuration);
  var brakeElapsed=Math.max(0,elapsed-(orbitDuration-brakeMs));
  var orbitProgress=(elapsed-brakeElapsed*brakeElapsed/(2*brakeMs))/(orbitDuration-brakeMs*.5);
  rotateVY=entrance.start.ry+(entrance.end.ry-entrance.start.ry)*orbitProgress-rotateY;
  if(phase==='spin'){
   camera.position.z=camera.position.target.z=camera.position.target.pz=entrance.start.z;
   if(activeElapsed>=entrance.spinMs)setPhase('wheel');
  }
  if(phase==='wheel'){
   var progress=constrain((activeElapsed-entrance.spinMs)/entrance.wheelReplayMs,0,1);
   // Quintic easing has zero velocity and acceleration at both endpoints.
   // Apply it to logarithmic distance so the native proportional zoom remains
   // consistent across the very different star-cloud and galaxy scales.
   var easedProgress=progress*progress*progress*(progress*(progress*6-15)+10);
   var distance=entrance.start.z*Math.pow(entrance.end.z/entrance.start.z,easedProgress);
   // Native wheel formula at the current timeline sample. The Landing camera
   // tracks it immediately so a 1s pullback has no extra frame-rate-dependent tail.
   handleMWheel((distance/camera.position.target.z-1)*100);wheelsSent++;
   camera.position.z=camera.position.target.z=camera.position.target.pz=distance;
   if(progress===1){
    camera.position.z=camera.position.target.z=camera.position.target.pz=entrance.end.z;
    rotateY=entrance.end.ry;rotateVX=rotateVY=0;finishEntrance();
   }
  }
 }
 function diagnostics(){
  var root=document.documentElement;
  root.dataset.renderMode='original-stars-full';root.dataset.threeRevision=THREE.REVISION;
  root.dataset.cameraDistance=camera.position.z.toFixed(4);
  root.dataset.cameraRx=rotateX.toFixed(6);root.dataset.cameraRy=rotateY.toFixed(6);
  root.dataset.rotationVelocity=rotateVY.toFixed(8);root.dataset.entranceElapsed=String(activeElapsed);
  root.dataset.scrollMotion=background?'zoom-only':'native';
  root.dataset.renderPixelRatio=(renderer.domElement.width/window.innerWidth).toFixed(3);
  root.dataset.intro=intro?'playing':'complete';root.dataset.entrancePhase=phase;
  root.dataset.entranceTrace=JSON.stringify(phaseTrace);root.dataset.wheelInputs=String(wheelsSent);
  // Capture the short entrance once; inspecting it later does not perturb timing.
  if(background&&ready&&motionSamples.length<64&&(intro||!motionSamples.length||motionSamples[motionSamples.length-1].phase!=='complete')){
   motionSamples.push({ms:activeElapsed,phase:phase,z:camera.position.z,ry:rotateY});
   root.dataset.entranceSamples=JSON.stringify(motionSamples);
  }
  root.dataset.nativeTour=String(!!camera.__tour||tour.touring);
  root.dataset.heatVision=String(pSystem.heatVision);
  if(starlight){var light=starlight.state();root.dataset.starlightCount=String(light.count);root.dataset.starlightTime=light.time.toFixed(3);root.dataset.starlightLevels=JSON.stringify(light.levels);root.dataset.starlightAccentCount=String(light.accentCount);root.dataset.starlightAccentLevels=JSON.stringify(light.accentLevels);root.dataset.starlightStyles=JSON.stringify(light.styles);root.dataset.coreHalo=JSON.stringify(light.coreHalo);root.dataset.warmGlows=JSON.stringify(light.warmGlows);
   var core=new THREE.Vector3().applyMatrix4(pGalacticSystem.matrixWorld).applyMatrix4(camera.matrixWorldInverse);
   core.applyProjection(camera.projectionMatrix);
   root.dataset.coreHaloPose=JSON.stringify({x:(core.x+1)*window.innerWidth/2,y:(1-core.y)*window.innerHeight/2,visible:pGalacticSystem.visible,layer:'galactic-photodisc'});
  }

  root.dataset.sceneScale=camera.position.z<2?'sun':camera.position.z<100?'solar-system':camera.position.z<2500?'nearby-stars':'galaxy';
  if(background)report('frame',{distance:camera.position.z/80000,progress:1-camera.position.z/80000,intro:intro,phase:phase,orbit:rotateY,pose:{z:camera.position.z,rx:rotateX,ry:rotateY},touring:!!camera.__tour||tour.touring,heatVision:pSystem.heatVision});
 }
 // Preserve standalone sound controls; the background is silent.
 document.querySelectorAll('audio').forEach(function(audio){var play=audio.play.bind(audio);audio.play=function(){if(background)return Promise.resolve();var pending=play();return pending&&pending.catch?pending.catch(function(){}):pending;};});
 if(!background)document.addEventListener('click',function(event){if(event.target.closest&&event.target.closest('#volume'))document.getElementById('bgmusicA').play();},true);
 if(background){
  document.documentElement.classList.add('background-mode');
  if(!Detector.webgl)report('error',{message:'WebGL unavailable'});
  initialAutoRotate=false;firstTime=false;displayIntroMessage=function(){};
  var seed=Number(params.get('seed'))||888;
  Math.random=function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
  document.querySelectorAll('audio').forEach(function(audio){audio.volume=0;});
 }
 var sourceAnimate=animate;
 animate=function(){
  if(paused||document.hidden){stalled=true;lastTick=0;return;}
  var now=Date.now(),dt=lastTick?Math.min(100,now-lastTick):0;lastTick=now;
  if(background&&!started){
   started=true;camera.__tour=false;tour.touring=false;
   // r62 already applies renderer.devicePixelRatio in setSize. The upstream
   // resize helper also multiplies by it, shrinking point sprites after resize.
   // Keep the initial native pixel density, with one multiplication at all sizes.
   var nativeSetSize=renderer.setSize;
   renderer.setSize=function(width,height,updateStyle){return nativeSetSize.call(this,window.innerWidth,window.innerHeight,updateStyle);};
   camera.position.z=camera.position.target.z=camera.position.target.pz=entrance.start.z;
   rotateX=entrance.start.rx;rotateY=entrance.start.ry;rotateVX=rotateVY=0;
   camera.scale.z=entrance.start.cameraScaleZ;
   starlight=LinkeAIGalaxyTwinkle.install(pGalacticSystem,{
    seed:Number(params.get('seed'))||888,strength:params.get('twinkle')==='0'?0:option('twinkleStrength',1,0,1),
    coreHalo:{enabled:params.get('coreHalo')!=='0',breathPeriodMs:option('haloBreathMs',7000,1000,60000),radiusAmplitude:option('haloRadius',.03,0,.03),brightnessAmplitude:option('haloBrightness',.04,0,.04),flowPeriodMs:option('haloFlowMs',24000,1000,120000),uvWarp:option('haloWarp',.012,0,.012),seed:option('haloSeed',888,0,65535),warmGlowEnabled:params.get('warmGlow')!=='0',warmGlowRadiusAmplitude:option('warmGlowRadius',.06,0,.1),warmGlowBrightnessAmplitude:option('warmGlowBrightness',.14,0,.2)}
   });
  }
  if(background&&intro&&ready)advanceEntrance(dt);
  if(background&&!intro&&poseTarget){
   rotateX=endpoint.rx;rotateY=endpoint.ry;rotateVX=rotateVY=0;
   camera.position.target.z=camera.position.target.pz=poseTarget.z;
  }
  sourceAnimate();
  // Wait for native texture loads and a rendered frame before showing/starting.
  if(!ready&&(!background||texturesReady())){
   ready=true;renderer.domElement.addEventListener('webglcontextlost',function(){paused=true;report('error',{message:'WebGL context lost'});});
   if(background){
    if(params.get('reference')==='1'){
     camera.position.z=camera.position.target.z=camera.position.target.pz=endpoint.z;
     rotateX=endpoint.rx;rotateY=endpoint.ry;intro=false;poseTarget=scrollPose(1);setPhase('complete');
    }else{setPhase('spin');initialAutoRotate=false;}
   }
   requestAnimationFrame(function(){report('ready',{revision:THREE.REVISION,particles:119617});});
  }
  if(now-lastReport>100){lastReport=now;diagnostics();}
 };
 window.addEventListener('message',function(event){
  if(!background||event.source!==parent||event.origin!==location.origin||!event.data||event.data.source!=='linkeai-galaxy')return;
  var data=event.data;
  if(data.type==='status'&&ready){
   report('ready',{revision:THREE.REVISION,particles:119617});diagnostics();
  }else if(data.type==='distance'&&typeof data.distance==='number'){
   requestedDistance=constrain(data.distance,.18,1);if(!intro)poseTarget=scrollPose(requestedDistance);
  }else if(data.type==='pause'){paused=!!data.paused;if(!paused&&stalled&&camera&&renderer){stalled=false;lastTick=0;animate();}}
 });
 document.addEventListener('visibilitychange',function(){if(!document.hidden&&!paused&&stalled&&camera&&renderer){stalled=false;lastTick=0;animate();}});
 window.addEventListener('error',function(event){report('error',{message:event.message});});
 window.addEventListener('pagehide',function(){paused=true;});
})();
