/* Landing-only starlight. Upstream shader files and particle positions stay intact. */
(function(){
 function hash(index,seed){var n=Math.sin(index*127.1+seed*17.7)*43758.5453123;return n-Math.floor(n);}
 function accentBrightness(seed,time){
  var period=2.2+3*(seed*5.83-Math.floor(seed*5.83));
  var wave=.5+.5*Math.sin(time*6.28318530718/period+seed*29.73);
  return .025+3.2*Math.pow(wave,4);
 }
 function smoothStep(a,b,x){var t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);}
 function spatialNoise(x,y,seed){
  var ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;
  fx=fx*fx*fx*(fx*(fx*6-15)+10);fy=fy*fy*fy*(fy*(fy*6-15)+10);
  var a=hash(ix*157+iy*269,seed),b=hash((ix+1)*157+iy*269,seed);
  var c=hash(ix*157+(iy+1)*269,seed),d=hash((ix+1)*157+(iy+1)*269,seed);
  return (a+(b-a)*fx)*(1-fy)+(c+(d-c)*fx)*fy;
 }
 function extendWarmGlows(galaxy,config){
  if(!config.enabled||!config.warmGlowEnabled)return null;
  var material=galaxy.material,vertices=galaxy.geometry.vertices,colors=material.attributes.customColor.value;
  var main=/void\s+main\s*\(\s*\)\s*\{/;
  var sharp=/texture2D\(texture0,\s*vec2\(gl_PointCoord\.x,\s*gl_PointCoord\.y\)\s*\)/;
  var blur=/texture2D\(texture1,\s*gl_PointCoord\s*\)/;
  if(!main.test(material.vertexShader)||!sharp.test(material.fragmentShader)||!blur.test(material.fragmentShader))throw new Error('Warm glows: native shader differs from the local reference');
  var weights=[],phases=[],count=0,samples=[];
  for(var i=0;i<vertices.length;i++){
   var p=vertices[i],color=colors[i];
   // Keep the true central bulge fixed and fade into existing warm-colored stars.
   var coreDistance=p.length();
   var weight=smoothStep(.04,.22,color.r-color.b)*smoothStep(900,3500,coreDistance);
   var phase=(.7*spatialNoise(p.x/7000,p.z/7000,config.seed+83)+.3*spatialNoise(p.x/3000+5,p.z/3000-3,config.seed+97))*Math.PI*2;
   weights.push(weight);phases.push(phase);
   if(weight>.01){count++;if(samples.length<8&&weight>.8&&p.size>500)samples.push({index:i,phase:phase,weight:weight,size:p.size});}
  }
  material.attributes.localWarmWeight={type:'f',value:weights};
  material.attributes.localWarmPhase={type:'f',value:phases};
  var uniforms={
   localWarmTime:{type:'f',value:0},
   localWarmPeriod:{type:'f',value:config.breathPeriodMs/1000},
   localWarmRadius:{type:'f',value:config.warmGlowRadiusAmplitude},
   localWarmBrightness:{type:'f',value:config.warmGlowBrightnessAmplitude}
  };
  Object.keys(uniforms).forEach(function(key){material.uniforms[key]=uniforms[key];});
  material.vertexShader=[
   'attribute float localWarmWeight;',
   'attribute float localWarmPhase;',
   'uniform float localWarmTime;',
   'uniform float localWarmPeriod;',
   'varying float vLocalWarmBreath;'
  ].join('\n')+'\n'+material.vertexShader.replace(main,'void main() {\n vLocalWarmBreath = sin(localWarmTime * 6.28318530718 / localWarmPeriod + localWarmPhase) * localWarmWeight;');
  var sample=[
   'void main() {',
   ' vec2 warmFromCentre = gl_PointCoord - vec2(0.5);',
   ' float warmRadius = length(warmFromCentre) * 2.0;',
   ' float warmOuter = smoothstep(0.045, 0.18, warmRadius) * (1.0 - smoothstep(0.78, 0.99, warmRadius));',
   ' vec2 localWarmUv = vec2(0.5) + warmFromCentre / (1.0 + vLocalWarmBreath * localWarmRadius * warmOuter);',
   ' float localWarmGain = 1.0 + vLocalWarmBreath * localWarmBrightness * warmOuter;'
  ].join('\n');
  material.fragmentShader='varying float vLocalWarmBreath;\nuniform float localWarmRadius;\nuniform float localWarmBrightness;\n'+material.fragmentShader.replace(main,sample)
   .replace(sharp,'texture2D(texture0, localWarmUv)')
   .replace(blur,'texture2D(texture1, localWarmUv)')
   .replace('gl_FragColor = particleColor * diffuse;','diffuse.rgb *= localWarmGain;\n gl_FragColor = particleColor * diffuse;');
  material.needsUpdate=true;
  return {uniforms:uniforms,count:count,samples:samples,config:config};
 }
 function extendCoreHalo(galaxy,config){
  if(!config.enabled)return null;
  // Native index 0 is a scattered, GPU-clipped point, not the broad golden haze.
  // Extend the actual photodisc in memory; the white lens flare stays untouched.
  var disc=null;
  for(var i=0;i<galaxy.children.length;i++){
   var child=galaxy.children[i],map=child.material&&child.material.map;
   if(child instanceof THREE.Mesh&&map&&map.image&&/galactictop\.png(?:$|\?)/.test(map.image.src)){disc=child;break;}
  }
  if(!disc)throw new Error('Core halo: native galactic photodisc not found');
  var sourceMaterial=disc.material,shader=THREE.ShaderLib.basic;
  var sample='vec4 texelColor = texture2D( map, vUv );';
  if(shader.fragmentShader.indexOf(sample)<0)throw new Error('Core halo: native map shader differs from the local reference');
  var uniforms=THREE.UniformsUtils.clone(shader.uniforms);
  uniforms.map.value=sourceMaterial.map;
  uniforms.diffuse.value.copy(sourceMaterial.color);
  var haloUniforms={
   localHaloTime:{type:'f',value:0},
   localHaloBreathPeriod:{type:'f',value:config.breathPeriodMs/1000},
   localHaloRadius:{type:'f',value:config.radiusAmplitude},
   localHaloBrightness:{type:'f',value:config.brightnessAmplitude},
   localHaloFlowPeriod:{type:'f',value:config.flowPeriodMs/1000},
   localHaloWarp:{type:'f',value:config.uvWarp},
   localHaloSeed:{type:'v2',value:new THREE.Vector2(hash(0,config.seed)*64,hash(1,config.seed)*64)}
  };
  Object.keys(haloUniforms).forEach(function(key){uniforms[key]=haloUniforms[key];});
  var haloShader=[
   'uniform float localHaloTime;',
   'uniform float localHaloBreathPeriod;',
   'uniform float localHaloRadius;',
   'uniform float localHaloBrightness;',
   'uniform float localHaloFlowPeriod;',
   'uniform float localHaloWarp;',
   'uniform vec2 localHaloSeed;',
   'float localHaloHash(vec2 p) {',
   ' return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);',
   '}',
   'float localHaloNoise(vec2 p) {',
   ' vec2 cell = floor(p);',
   ' vec2 f = fract(p);',
   ' vec2 ease = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);',
   ' return mix(mix(localHaloHash(cell), localHaloHash(cell + vec2(1.0, 0.0)), ease.x),',
   '            mix(localHaloHash(cell + vec2(0.0, 1.0)), localHaloHash(cell + vec2(1.0)), ease.x), ease.y);',
   '}',
   'vec2 localHaloFlow(vec2 p) {',
   ' return vec2(localHaloNoise(p), localHaloNoise(p + vec2(19.17, 7.83))) * 2.0 - 1.0;',
   '}'
  ].join('\n');
  var haloSample=[
   sample,
   '  vec2 fromCore = vUv - vec2(0.5);',
   '  float radius = length(fromCore) * 2.0;',
   '  float warmTint = smoothstep(0.015, 0.12, texelColor.r - texelColor.b);',
   '  float outerHalo = smoothstep(0.055, 0.14, radius) * (1.0 - smoothstep(0.34, 0.64, radius)) * warmTint;',
   '  float breath = sin(localHaloTime * 6.28318530718 / localHaloBreathPeriod);',
   '  float flowTime = localHaloTime / localHaloFlowPeriod;',
   // Two continuously translated noise fields; no time modulo or cycle reset.
   '  vec2 flowA = localHaloFlow(vUv * 8.0 + localHaloSeed + vec2(1.8, 0.9) * flowTime);',
   '  vec2 flowB = localHaloFlow(vUv * 15.0 + localHaloSeed.yx + vec2(-0.75, 1.25) * flowTime + vec2(5.31, 31.73));',
   '  vec2 flow = flowA * 0.65 + flowB * 0.35;',
   '  flow /= max(1.0, length(flow));',
   '  vec2 localHaloUv = vec2(0.5) + fromCore / (1.0 + breath * localHaloRadius * outerHalo) + flow * localHaloWarp * outerHalo;',
   '  vec4 flowingHalo = texture2D(map, localHaloUv);',
   '  texelColor = mix(texelColor, flowingHalo, outerHalo);',
   '  texelColor.rgb *= 1.0 + breath * localHaloBrightness * outerHalo;'
  ].join('\n');
  var material=new THREE.ShaderMaterial({
   uniforms:uniforms,vertexShader:shader.vertexShader,
   fragmentShader:haloShader+'\n'+shader.fragmentShader.replace(sample,haloSample),
   blending:sourceMaterial.blending,depthTest:sourceMaterial.depthTest,
   depthWrite:sourceMaterial.depthWrite,side:sourceMaterial.side,transparent:true
  });
  material.map=sourceMaterial.map;
  disc.material=material;
  return {uniforms:uniforms,config:config,disc:disc,sourceMaterial:sourceMaterial};
 }
 function createAccents(galaxy,seed,strength){
  // Reuse a sparse selection of source stars. No screen-space dots or new positions.
  // The static photodisc can mask tiny RGB changes; these stars have a distinct
  // dim state, luminous centre and soft halo, all driven by the same GPU clock.
  var geometry=new THREE.Geometry(),seeds=[],sizes=[],colors=[],halos=[],luminosities=[],occupied={},styles=[];
  var vertices=galaxy.geometry.vertices,candidates=[];
  for(var i=1;i<vertices.length;i++){
   var p=vertices[i],radius=Math.sqrt(p.x*p.x+p.z*p.z);
   if(radius>7000&&radius<34000&&Math.abs(p.y)<2200)candidates.push({index:i,order:hash(i,seed+11)});
  }
  candidates.sort(function(a,b){return a.order-b.order;});
  for(var n=0;n<candidates.length&&geometry.vertices.length<240;n++){
   var index=candidates[n].index,position=vertices[index];
   var cell=Math.floor(position.x/1500)+':'+Math.floor(position.z/1500);
   if(occupied[cell])continue;
   occupied[cell]=true;geometry.vertices.push(position.clone());
   var pulseSeed=hash(index,seed+23),sizeRoll=hash(index,seed+37),detailRoll=hash(index,seed+41);
   // Three size bands keep most lights small, with fewer medium and large stars.
   var size=sizeRoll<.60?150+detailRoll*220:sizeRoll<.90?480+detailRoll*320:950+detailRoll*500;
   var radius=Math.sqrt(position.x*position.x+position.z*position.z);
   var warmChance=.55-.30*Math.min(1,(radius-7000)/27000),tintRoll=hash(index,seed+47);
   var tint=tintRoll<warmChance?(detailRoll<.45?0xffb573:0xffdea6):tintRoll<warmChance+.22?0xeafaFF:detailRoll<.78?0x89bdff:0xbfa8ff;
   var color=new THREE.Color(tint),halo=.65+hash(index,seed+53)*1.1,luminosity=.65+hash(index,seed+59)*.70;
   seeds.push(pulseSeed);sizes.push(size);colors.push(color);halos.push(halo);luminosities.push(luminosity);
   if(styles.length<8)styles.push({size:Math.round(size),color:color.getHexString(),halo:halo.toFixed(2),luminosity:luminosity.toFixed(2)});
  }
  var uniforms={
   localStarlightTime:{type:'f',value:0},
   localStarlightStrength:{type:'f',value:strength},
   localVisibility:{type:'f',value:0},
   localScale:{type:'f',value:1}
  };
  var material=new THREE.ShaderMaterial({
   attributes:{localPulseSeed:{type:'f',value:seeds},localStarSize:{type:'f',value:sizes},localStarColor:{type:'c',value:colors},localStarHalo:{type:'f',value:halos},localStarLuminosity:{type:'f',value:luminosities}},
   uniforms:uniforms,
   vertexShader:[
    'attribute float localPulseSeed;',
    'attribute float localStarSize;',
    'attribute vec3 localStarColor;',
    'attribute float localStarHalo;',
    'attribute float localStarLuminosity;',
    'uniform float localStarlightTime;',
    'uniform float localScale;',
    'varying vec3 vLocalColor;',
    'varying float vLocalPulse;',
    'varying float vLocalHalo;',
    'void main() {',
    ' float period = 2.2 + 3.0 * fract(localPulseSeed * 5.83);',
    ' float wave = 0.5 + 0.5 * sin(localStarlightTime * 6.28318530718 / period + localPulseSeed * 29.73);',
    ' vLocalPulse = (0.025 + 3.2 * pow(wave, 4.0)) * localStarLuminosity;',
    ' vLocalColor = localStarColor;',
    ' vLocalHalo = localStarHalo;',
    ' vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);',
    ' float diameter = clamp(localScale * localStarSize / max(length(viewPosition.xyz), 1.0), 3.0, 48.0);',
    ' gl_PointSize = diameter * (0.86 + 0.14 * wave);',
    ' gl_Position = projectionMatrix * viewPosition;',
    '}'
   ].join('\n'),
   fragmentShader:[
    'uniform float localStarlightStrength;',
    'uniform float localVisibility;',
    'varying vec3 vLocalColor;',
    'varying float vLocalPulse;',
    'varying float vLocalHalo;',
    'void main() {',
    ' float radius = length(gl_PointCoord - vec2(0.5)) * 2.0;',
    ' float r2 = radius * radius;',
    ' float edge = 1.0 - smoothstep(0.75, 1.0, radius);',
    ' float centre = exp(-r2 * 80.0);',
    ' float glow = (0.9 * centre + 0.55 * exp(-r2 * 9.0 / vLocalHalo) + 0.08 * exp(-r2 * 3.0)) * edge;',
    ' vec3 tint = mix(vLocalColor, vec3(1.0), centre * 0.65);',
    ' gl_FragColor = vec4(tint, glow * vLocalPulse * localStarlightStrength * localVisibility);',
    '}'
   ].join('\n'),
   blending:THREE.AdditiveBlending,depthTest:false,depthWrite:false,transparent:true
  });
  var accents=new THREE.ParticleSystem(geometry,material);
  accents.frustumCulled=false;galaxy.add(accents);
  return {uniforms:uniforms,seeds:seeds,count:geometry.vertices.length,luminosities:luminosities,styles:styles};
 }
 window.LinkeAIGalaxyTwinkle={install:function(galaxy,options){
  var material=galaxy.material,vertices=galaxy.geometry.vertices;
  var halo=extendCoreHalo(galaxy,options.coreHalo);
  var warmGlows=extendWarmGlows(galaxy,options.coreHalo);
  // Warm source-star halos join the haze; native positions and the white flare stay fixed.
  var strength=options.strength,accents=createAccents(galaxy,options.seed,strength);
  var nativeUpdate=galaxy.update,time=0,previousTick=0;
  galaxy.update=function(){
   nativeUpdate.call(this);
   var now=Date.now();
   if(previousTick)time+=Math.min(.1,(now-previousTick)/1000);
   previousTick=now;
   if(halo){
    halo.uniforms.localHaloTime.value=time;
    // The upstream update still owns the original material's fade/visibility.
    halo.uniforms.opacity.value=halo.sourceMaterial.opacity;
    halo.disc.material.opacity=halo.sourceMaterial.opacity;
   }
   if(warmGlows)warmGlows.uniforms.localWarmTime.value=time;
   accents.uniforms.localStarlightTime.value=time;
   accents.uniforms.localScale.value=material.uniforms.scale.value;
   accents.uniforms.localVisibility.value=Math.max(0,Math.min(1,material.opacity));
  };
  return {state:function(){
   // Sparse diagnostics; no per-frame CPU updates to the 100,000 particle values.
   var accentLevels=[];
   for(var n=0;n<8;n++){
    accentLevels.push((accentBrightness(accents.seeds[n],time)*accents.luminosities[n]).toFixed(3));
   }
   var breath=halo?Math.sin(time*Math.PI*2/(halo.config.breathPeriodMs/1000)):0;
   var glowLevels=warmGlows?warmGlows.samples.map(function(sample){var wave=Math.sin(time*Math.PI*2/(warmGlows.config.breathPeriodMs/1000)+sample.phase)*sample.weight;return {index:sample.index,radiusScale:1+wave*warmGlows.config.warmGlowRadiusAmplitude,brightnessScale:1+wave*warmGlows.config.warmGlowBrightnessAmplitude};}):[];
   return {count:vertices.length,time:time,strength:strength,levels:accentLevels,accentCount:accents.count,accentLevels:accentLevels,styles:accents.styles,
    warmGlows:warmGlows?{enabled:true,affectedParticles:warmGlows.count,breathPeriodMs:warmGlows.config.breathPeriodMs,radiusAmplitude:warmGlows.config.warmGlowRadiusAmplitude,brightnessAmplitude:warmGlows.config.warmGlowBrightnessAmplitude,samples:glowLevels}: {enabled:false},
    coreHalo:halo?{enabled:true,layer:'galactic-photodisc',affectedParticles:0,seed:halo.config.seed,breathPeriodMs:halo.config.breathPeriodMs,flowPeriodMs:halo.config.flowPeriodMs,uvWarp:halo.config.uvWarp,radiusScale:1+breath*halo.config.radiusAmplitude,brightnessScale:1+breath*halo.config.brightnessAmplitude}: {enabled:false}};
  }};
 }};
})();
