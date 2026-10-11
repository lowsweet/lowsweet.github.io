/* Host glue for the unmodified upstream Three r62, galaxy, and lens-flare files. */
var shaderList = {};
var camera, renderer, rotating, galacticCentering, translating, pGalacticSystem;
var pSystem, pDustSystem, starData;
Math.TWO_PI = Math.PI * 2;
function map(v, a, b, c, d) { return c + (v-a) / (b-a) * (d-c); }
function attachMarker() {}
var maxAniso = 1;
var starsTextureLoads = [];
function setLoadMessage() {}
function constrain(v, min, max) { if(v < min) v = min; else if(v > max) v = max; return v; }
function random(low, high) { if(low >= high) return low; return Math.random() * (high-low) + low; }
// These source helpers attach measurement labels; the Landing has its own foreground.
function createDistanceMeasurement() { return new THREE.Object3D(); }
function attachLegacyMarker() {}
var loadOriginalTexture = THREE.ImageUtils.loadTexture;
THREE.ImageUtils.loadTexture = function(url, mapping, onLoad, onError) {
 var resolve, reject;
 starsTextureLoads.push(new Promise(function(ok,fail){resolve=ok;reject=fail;}));
 var texture = loadOriginalTexture.call(THREE.ImageUtils, url, mapping, function(texture){
  if(typeof onLoad==='function') onLoad(texture);
  resolve(texture);
 });
 // r62 ImageUtils has no fourth error argument; attach to its Image directly.
 texture.image.addEventListener('error',function(error){if(typeof onError==='function')onError(error);reject(new Error('Missing local Stars texture: '+url));},{once:true});
 return texture;
};
var glowSpanTexture = THREE.ImageUtils.loadTexture('images/glowspan.png');
