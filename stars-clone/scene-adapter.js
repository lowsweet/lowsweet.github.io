/* Scroll/camera integration only. Upstream galaxy/shaders/textures remain byte-for-byte. */
(function(){
 var frame=0,disposed=false,ready=false,paused=false,dirty=true,lastTime=0;
 var params=new URLSearchParams(location.search);
 var far=Number(params.get('far'))||80000;
 var seed=Number(params.get('seed'))||888;
 var tilt=Number(params.get('tilt'))||-0.35;
 var roll=Number(params.get('roll'))||Math.PI/4;
 var target=1,current=1672.4214873346518/far,firstFrameReported=false;
 // Unchanged public GALAXY_TOUR stops 6–8 and Tour.Easing.
 var stops=[
  {rx:.5522785678088462,ry:1.324151395815386,z:1672.4214873346518},
  {rx:-.4155179986306899,ry:2.5204046098483026,z:31782.290495394205},
  {rx:-.12216429754294249,ry:1.9989722678912,z:79999.99999999994}
 ];
 var introElapsed=0,intro=true,centering=0;
 var rx=stops[0].rx,ry=stops[0].ry;
 function ease(t){return (1-Math.cos(Math.PI*constrain(t,0,1)))/2;}
 function tourPose(time){
  // 4s opening hold, source 5s travel / 5s rest / 5s travel.
  var from=stops[0],to=stops[1],t=(time-4000)/5000;
  if(time>=9000&&time<14000){from=to;t=0;}
  else if(time>=14000){from=stops[1];to=stops[2];t=(time-14000)/5000;}
  t=ease(t);rx=from.rx+(to.rx-from.rx)*t;ry=from.ry+(to.ry-from.ry)*t;
  current=(from.z+(to.z-from.z)*t)/far;
 }
 function report(type,extra){if(parent!==window)parent.postMessage(Object.assign({source:'stars-galaxy-clone',type:type},extra||{}),location.origin);}
 function seededRandom(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}
 function schedule(){dirty=true;if(!frame&&ready&&!paused&&!disposed&&!document.hidden)frame=requestAnimationFrame(render);}
 function setPose(){
  // Same rotating.rotation tween as upstream Tour; no additional pose transforms.
  rotating.rotation.x=rx;rotating.rotation.y=ry;
  galacticCentering.position.copy(pGalacticSystem.position).negate().multiplyScalar(centering);
 }
 function resize(){
  if(!renderer||!camera)return;
  // Match source main.js setSize; r62 applies its own inherited devicePixelRatio.
  renderer.setSize(innerWidth,innerHeight);
  renderer.domElement.style.width='100%';renderer.domElement.style.height='100%';
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();schedule();
 }
 function render(time){
  frame=0;if(disposed||paused||document.hidden||!ready)return;
  var dt=Math.min(64,Math.max(16,time-(lastTime||time-16)));lastTime=time;
  if(intro){
   introElapsed=Math.min(19000,introElapsed+dt);tourPose(introElapsed);
   centering=constrain(Math.pow(current,3),0,1);
   if(introElapsed===19000){intro=false;current=1;centering=1;report('intro-complete');}
  }else{
   current+=(target-current)*(1-Math.pow(.875,dt/(1000/60)));
   centering+=(1-centering)*(1-Math.pow(.875,dt/(1000/60)));
   if(Math.abs(current-target)<.00002)current=target;
  }
  camera.position.z=far*current;
  // Source main.animate() overrides the constructor FOV and preserves camera.scale.z=.83.
  camera.fov=constrain(Math.pow(camera.position.z,2)/100000,.000001,40);
  camera.updateProjectionMatrix();
  pSystem.update();pSystem.traverse(function(obj){if(obj!==pSystem&&obj.update)obj.update();});
  pGalacticSystem.update();setPose();
  renderer.clear();renderer.render(scene,camera);
  if(!firstFrameReported){firstFrameReported=true;report('ready',{revision:THREE.REVISION,particles:pGalacticSystem.geometry.vertices.length});}
  document.documentElement.dataset.distance=current.toFixed(4);
  document.documentElement.dataset.orbit=ry.toFixed(4);
  document.documentElement.dataset.tourTime=introElapsed.toFixed(0);
  document.documentElement.dataset.intro=intro?'playing':'complete';
  document.documentElement.dataset.renderMode='original-stars';
  document.documentElement.dataset.particles=String(pGalacticSystem.geometry.vertices.length);
  report('frame',{distance:current,progress:constrain((1-current)/.82,0,1),intro:intro,orbit:ry});
  dirty=false;
  if(intro||current!==target||centering<.99999)frame=requestAnimationFrame(render);
 }
 function onMessage(event){
  if(event.source!==parent||event.origin!==location.origin||!event.data||event.data.source!=='linkeai-galaxy')return;
  if(event.data.type==='distance'&&typeof event.data.distance==='number')target=constrain(event.data.distance,.18,1);
  else if(event.data.type==='interaction'&&intro){intro=false;report('intro-complete');}
  else if(event.data.type==='pause'){paused=!!event.data.paused;lastTime=0;}
  document.documentElement.dataset.target=target.toFixed(4);
  document.documentElement.dataset.paused=String(paused);
  schedule();
 }
 function onVisibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0;}else{lastTime=0;schedule();}}
 function destroy(){disposed=true;cancelAnimationFrame(frame);window.removeEventListener('message',onMessage);window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',onVisibility);if(scene)scene.traverse(function(obj){if(obj.geometry)obj.geometry.dispose();if(obj.material)obj.material.dispose();});Promise.allSettled(starsTextureLoads).then(function(rows){rows.forEach(function(row){if(row.status==='fulfilled')row.value.dispose();});});if(renderer)renderer.dispose();}
 var scene;
 window.addEventListener('message',onMessage);
 window.addEventListener('resize',resize);
 document.addEventListener('visibilitychange',onVisibility);
 window.addEventListener('pagehide',destroy,{once:true});
 window.addEventListener('error',function(event){report('error',{message:event.message});});
 (async function(){
  try{
   var files=await Promise.all(['shaders/galacticstars.vsh','shaders/galacticstars.fsh','shaders/datastars.vsh','shaders/datastars.fsh'].map(async function(path){var response=await fetch(path);if(!response.ok)throw new Error('Missing local shader: '+path);return response.text();}));
   shaderList.galacticstars={vertex:files[0],fragment:files[1]};
   shaderList.datastars={vertex:files[2],fragment:files[3]};
   var starResponse=await fetch('data/stars_all.json');if(!starResponse.ok)throw new Error('Missing local star catalogue');
   starData=(await starResponse.json()).stars;
   renderer=new THREE.WebGLRenderer({antialias:false});
   renderer.autoClear=false;renderer.sortObjects=false;renderer.generateMipmaps=false;
   maxAniso=renderer.getMaxAnisotropy();document.body.appendChild(renderer.domElement);
   renderer.domElement.addEventListener('webglcontextlost',function(event){event.preventDefault();paused=true;cancelAnimationFrame(frame);report('error',{message:'WebGL context lost'});});
   scene=new THREE.Scene();scene.add(new THREE.AmbientLight(0x505050));
   camera=new THREE.PerspectiveCamera(30,innerWidth/innerHeight,.5,10000000);camera.position.z=far;camera.scale.z=.83;scene.add(camera);
   rotating=new THREE.Object3D();galacticCentering=new THREE.Object3D();translating=new THREE.Object3D();galacticCentering.add(translating);rotating.add(galacticCentering);scene.add(rotating);
   var sourceRandom=Math.random;
   try{Math.random=seededRandom;pGalacticSystem=generateGalaxy();}finally{Math.random=sourceRandom;}
   pSystem=generateHipparcosStars();translating.add(pSystem);
   translating.add(pGalacticSystem);
   // The public main.js has enableDust=false. Its photographed dust lanes are in galactictop.png.
   await Promise.race([Promise.all(starsTextureLoads),new Promise(function(_,reject){setTimeout(function(){reject(new Error('Local Stars assets did not finish loading'));},12000);})]);
   if(disposed)return;
   // Original update fades the photographed disc in over 20 ticks; settle before first display.
   camera.position.z=far*current;
   for(var i=0;i<24;i++)pGalacticSystem.update();
   setPose();resize();ready=true;schedule();
  }catch(error){report('error',{message:error instanceof Error?error.message:String(error)});}
 })();
})();
