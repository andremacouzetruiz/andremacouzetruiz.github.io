import * as THREE from 'three';

// A looping mission, drawn like a technical drawing: approach a world, land,
// step out, plant a flag, raise a city around a rotunda, depart for the next world.
const CYCLE = 62;
const WORLDS = [
  {world:'Moon',   temp:'−20 °C', day:'27d 7h',  year:'27.3 Earth d', R:55, tint:0x9a9a92},
  {world:'Mars',   temp:'−65 °C', day:'24h 37m', year:'687 Earth d',  R:70, tint:0x9a7a62},
  {world:'Europa', temp:'−160 °C',day:'3d 13h',  year:'4,333 Earth d',R:50, tint:0x9fa4a8},
];
const INK = 0xd6d5c5;

const cv = document.getElementById('gl');
const R = new THREE.WebGLRenderer({canvas: cv, antialias: true, alpha: true});
R.setPixelRatio(Math.min(Math.max(devicePixelRatio, 1.5), 2.5));
const S = new THREE.Scene();
const C = new THREE.PerspectiveCamera(42, 1, .005, 4000);

const edgeMat = new THREE.LineBasicMaterial({color: INK, transparent: true, opacity: .62});
function inkSurface(){
  return new THREE.ShaderMaterial({
    vertexShader: `varying vec3 vN; varying vec3 vV;
      void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = -mv.xyz; gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `varying vec3 vN; varying vec3 vV;
      void main(){ float s = pow(1.-abs(dot(normalize(vN), normalize(vV))), 3.2);
        gl_FragColor = vec4(vec3(.012,.016,.018) + vec3(.72,.74,.68)*s*.6, 1.); }`
  });
}
function drafted(geo, threshold = 24){
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geo, inkSurface()));
  g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, threshold), edgeMat));
  return g;
}
const planetMat = new THREE.ShaderMaterial({
  uniforms: {uTint: {value: new THREE.Color(0x9a9a92)}},
  vertexShader: `varying vec3 vP; varying vec3 vN; varying vec3 vV;
    void main(){ vP = position; vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = -mv.xyz; gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `uniform vec3 uTint; varying vec3 vP; varying vec3 vN; varying vec3 vV;
    float ink(float p){ float w = max(fwidth(p), .0001); return 1. - smoothstep(0., w*1.2, abs(fract(p - .5) - .5)); }
    void main(){ vec3 n = normalize(vP);
      float lat = asin(n.y)*57.2958, lon = atan(n.z, n.x)*57.2958;
      float grid = max(ink(lat/10.), ink(lon/10.)) * .55;
      float h = sin(n.x*9.)+cos(n.y*7.+n.z*11.)+sin(n.x*23.+n.z*17.)*.35;
      float cont = ink(h*3.) * .35;
      float rim = pow(1.-abs(dot(normalize(vN), normalize(vV))), 4.);
      gl_FragColor = vec4(vec3(.01,.012,.014) + uTint*(grid+cont)*.55 + vec3(.8,.82,.76)*rim*.55, 1.); }`
});
const planet = new THREE.Mesh(new THREE.SphereGeometry(1, 160, 100), planetMat); S.add(planet);

const groundMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, uniforms: {uOp: {value: 0}},
  vertexShader: `varying vec2 vG; void main(){ vG = position.xz; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform float uOp; varying vec2 vG;
    float ink(float p){ float w = max(fwidth(p), .0001); return 1. - smoothstep(0., w*1.2, abs(fract(p - .5) - .5)); }
    void main(){ float g = max(ink(vG.x*2.), ink(vG.y*2.))*.22 + max(ink(vG.x*.4), ink(vG.y*.4))*.35;
      float h = sin(vG.x*.7)+cos(vG.y*.55)+sin(vG.x*1.9+vG.y*1.3)*.3; float cont = ink(h*2.5)*.3;
      float fade = 1. - smoothstep(5., 20., length(vG));
      gl_FragColor = vec4(vec3(.84,.83,.77), (g+cont)*fade*uOp); }`
});
const groundBase = new THREE.Mesh(new THREE.PlaneGeometry(60, 60).rotateX(-Math.PI/2), new THREE.MeshBasicMaterial({color: 0x050607, transparent: true, opacity: 0}));
S.add(groundBase);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60).rotateX(-Math.PI/2), groundMat); S.add(ground);

// ship
const ship = new THREE.Group(); S.add(ship);
const hullProf = [[0,.0],[.18,.04],[.28,.14],[.3,.3],[.26,.5],[.16,.66],[0,.74]].map(([x,y]) => new THREE.Vector2(x,y));
const hull = drafted(new THREE.LatheGeometry(hullProf, 28).rotateX(Math.PI/2).translate(0,0,-.35), 20); hull.scale.set(1,.55,1.4); ship.add(hull);
const wingShape = new THREE.Shape(); wingShape.moveTo(.12,-.2); wingShape.lineTo(.95,.25); wingShape.lineTo(.98,.32); wingShape.lineTo(.2,.3); wingShape.lineTo(.12,.15);
const wingGeo = new THREE.ExtrudeGeometry(wingShape, {depth: .025, bevelEnabled: false}).rotateX(-Math.PI/2);
ship.add(drafted(wingGeo));
const wR = drafted(wingGeo); wR.scale.x = -1; ship.add(wR);
const canopy = drafted(new THREE.SphereGeometry(.12, 20, 12, 0, Math.PI*2, 0, Math.PI/2).scale(1,.7,1.8)); canopy.position.set(0,.13,-.1); ship.add(canopy);
const legs = new THREE.Group(); ship.add(legs);
[[-.22,-.25],[.22,-.25],[0,.35]].forEach(([x,z]) => { const l = drafted(new THREE.CylinderGeometry(.012,.012,.22,8)); l.position.set(x,-.15,z); const f = drafted(new THREE.CylinderGeometry(.05,.05,.015,12)); f.position.y = -.11; l.add(f); legs.add(l) });
const flameTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32,32,0,32,32,32); g.addColorStop(0,'rgba(200,230,255,1)'); g.addColorStop(.35,'rgba(140,200,255,.55)'); g.addColorStop(1,'rgba(140,200,255,0)'); x.fillStyle = g; x.fillRect(0,0,64,64); return new THREE.CanvasTexture(c) })();
const glow = () => new THREE.Sprite(new THREE.SpriteMaterial({map: flameTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending}));
const engines = [-.12, .12].map(x => { const s = glow(); s.position.set(x, 0, .62); s.scale.setScalar(.28); ship.add(s); return s });
const jets = [[-.22,-.25],[.22,-.25],[0,.35]].map(([x,z]) => { const s = glow(); s.position.set(x,-.32,z); s.scale.set(.12,.3,1); ship.add(s); return s });

// explorer and flag
const explorer = new THREE.Group(); S.add(explorer);
const torso = drafted(new THREE.CapsuleGeometry(.035,.06,4,10)); torso.position.y = .13; explorer.add(torso);
const helmet = drafted(new THREE.SphereGeometry(.032,14,10)); helmet.position.y = .21; explorer.add(helmet);
const legL = drafted(new THREE.CapsuleGeometry(.014,.06,4,8)); legL.position.set(-.018,.05,0); explorer.add(legL);
const legR = drafted(new THREE.CapsuleGeometry(.014,.06,4,8)); legR.position.set(.018,.05,0); explorer.add(legR);
const flag = new THREE.Group(); S.add(flag);
const pole = drafted(new THREE.CylinderGeometry(.004,.004,.32,6)); pole.position.y = .16; flag.add(pole);
const cloth = drafted(new THREE.PlaneGeometry(.14,.08).translate(.07,0,0)); cloth.position.y = .28; flag.add(cloth);

// the city: rotunda, colonnade, rings of blocks that grow by the golden ratio, eight open avenues
const city = new THREE.Group(); S.add(city);
const parts = [];
function addPart(obj, start){ obj.userData.start = start; obj.scale.y = .001; parts.push(obj); city.add(obj) }
const rotunda = new THREE.Group();
const drum = drafted(new THREE.CylinderGeometry(.46,.46,.28,28)); drum.position.y = .14; rotunda.add(drum);
const dome = drafted(new THREE.SphereGeometry(.42, 28, 14, 0, Math.PI*2, 0, Math.PI/2)); dome.position.y = .28; rotunda.add(dome);
addPart(rotunda, 0);
for(let k = 0; k < 16; k++){ const a = k/16*Math.PI*2, col = drafted(new THREE.CylinderGeometry(.025,.025,.3,8).translate(0,.15,0)); col.position.set(Math.cos(a)*.6,0,Math.sin(a)*.6); addPart(col, .25 + k*.02) }
const PHI = 1.618; let n = 0;
for(let ring = 0; ring < 4; ring++){
  const r = 1.15 * Math.pow(PHI, ring), count = 8 * (ring + 1);
  for(let k = 0; k < count; k++){
    const a = (k + .5) / count * Math.PI * 2;
    const toAve = Math.abs(((a / (Math.PI/4)) % 1) - .5);
    if(toAve > .36) continue;
    const s = .22 + ring*.06, h = .1 + Math.random()*.26 + (ring === 0 ? .18 : 0);
    const b = drafted(new THREE.BoxGeometry(s, h, s).translate(0, h/2, 0));
    b.position.set(Math.cos(a)*r, 0, Math.sin(a)*r); b.rotation.y = -a;
    addPart(b, .9 + ring*1.5 + (n++ % 9)*.08);
  }
}
const avenues = [];
for(let k = 0; k < 8; k++){
  const a = k * Math.PI/4;
  const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(Math.cos(a)*.7,.003,Math.sin(a)*.7), new THREE.Vector3(Math.cos(a)*10,.003,Math.sin(a)*10)]), edgeMat);
  l.visible = false; city.add(l); avenues.push(l);
}

// stars
const sg = new THREE.BufferGeometry(), sp = [];
for(let i = 0; i < 2600; i++){ const a = Math.random()*Math.PI*2, y = Math.random()*2-1, s = Math.sqrt(1-y*y); sp.push(Math.cos(a)*s*2500, y*2500, Math.sin(a)*s*2500) }
sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
S.add(new THREE.Points(sg, new THREE.PointsMaterial({color: INK, size: 1.6, sizeAttenuation: false, transparent: true, opacity: .7})));

// timeline
const clamp = v => Math.max(0, Math.min(1, v)), smooth = v => { v = clamp(v); return v*v*(3-2*v) }, mix = THREE.MathUtils.lerp;
function altitude(t){
  if(t < 16) return Math.exp(mix(Math.log(420), Math.log(.18), smooth(t/16)));
  if(t < 52) return .18;
  return mix(.18, 8, smooth((t - 52)/5));
}
function forward(t){ return t < 53 ? 0 : -Math.pow(t - 53, 2.2) * 5 }
const PHASES = [[0,'Approach'],[16,'Landing'],[19,'Explorer exit'],[24,'Flag'],[27,'Building the city'],[52,'Departure']];

// UI
const $ = id => document.getElementById(id);
let time = 0, index = 0, paused = false, last = performance.now(), yaw = 0, pitch = 0, drag = null, mx = 0, my = 0;
$('pause').onclick = () => { paused = !paused; $('pause').textContent = paused ? 'Play' : 'Pause' };
cv.addEventListener('pointerdown', e => { drag = {x: e.clientX, y: e.clientY, yaw, pitch}; cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing' });
cv.addEventListener('pointermove', e => { if(drag){ yaw = drag.yaw + (e.clientX - drag.x)*.005; pitch = Math.max(-.4, Math.min(.8, drag.pitch + (e.clientY - drag.y)*.004)) } });
cv.addEventListener('pointerup', () => { drag = null; cv.style.cursor = 'grab' });
addEventListener('pointermove', e => { mx = e.clientX/innerWidth - .5; my = e.clientY/innerHeight - .5 });
cv.style.cursor = 'grab';

window.__seek = v => { time = v };
let mobile = false;
function size(){
  const w = cv.clientWidth, h = cv.clientHeight; mobile = w < 860;
  R.setSize(w, h, false); C.aspect = w/h;
  if(!mobile) C.setViewOffset(w, h, -w*.22, 0, w, h); else C.clearViewOffset();
  C.updateProjectionMatrix();
}
addEventListener('resize', size); size();

const fmt = v => v.toLocaleString('en-US', {minimumFractionDigits: 1, maximumFractionDigits: 1});
let lastKey = '';
function readout(t, w, alt, dist){
  const key = index + ':' + Math.floor(t*4); if(key === lastKey) return; lastKey = key;
  const a = Math.max(0, t - .05), b = Math.min(CYCLE, t + .05);
  const speed = Math.hypot(altitude(b) - altitude(a), forward(b) - forward(a)) / (b - a) * 9;
  $('world').textContent = w.world; $('temp').textContent = w.temp; $('day').textContent = w.day; $('year').textContent = w.year;
  $('speed').textContent = fmt(speed) + ' km/s';
  $('pos').textContent = 'X 0.0 · Y ' + fmt((w.R + alt) * 48) + ' · Z ' + fmt(-dist * 48);
  $('phase').textContent = PHASES.filter(p => t >= p[0]).pop()[1];
}

(function frame(now){
  const dt = Math.min(.05, (now - last)/1000); last = now;
  if(!paused){ time += dt; if(time >= CYCLE){ time -= CYCLE; index = (index + 1) % WORLDS.length } }
  const w = WORLDS[index], Rp = w.R, alt = altitude(time), dist = forward(time);
  planetMat.uniforms.uTint.value.setHex(w.tint);
  planet.scale.setScalar(Rp); planet.position.set(0, -Rp - alt, dist); planet.rotation.y += dt*.01;
  const near = 1 - smooth((Math.log(Math.max(alt, .18)) - Math.log(.18)) / (Math.log(30) - Math.log(.18)));
  const gOp = near * (time < 55 ? 1 : 1 - smooth((time - 55)/2));
  ground.position.set(0, -alt + .001, dist); groundMat.uniforms.uOp.value = gOp;
  groundBase.position.set(0, -alt, dist); groundBase.material.opacity = gOp * .85;

  ship.rotation.x = time < 16 ? mix(-.12, 0, near) : time >= 52 ? -.12*smooth((time-52)/2) : 0;
  const landed = time >= 16 && time < 52;
  engines.forEach(e => { e.visible = !landed && (time >= 52 || near < .7); e.material.opacity = .7 + Math.random()*.3 });
  jets.forEach(j => { j.visible = !landed && near >= .7 && time < 52; j.scale.y = .25 + Math.random()*.1 });
  legs.scale.y = mix(.05, 1, smooth(near)); legs.position.y = (1 - legs.scale.y) * .1;

  const out = smooth((time - 19)/4);
  explorer.visible = time >= 19 && time < 52;
  explorer.position.set(.35 + out*.4, -alt, .2 + out*.15);
  const step = Math.sin(time*9) * .3 * (time > 19 && time < 23.5 ? 1 : 0);
  legL.rotation.x = step; legR.rotation.x = -step;
  flag.visible = time >= 24 && time < 55;
  flag.position.set(.86, -alt, .38); flag.scale.y = Math.max(.001, smooth((time - 24)/1.2));
  cloth.rotation.y = Math.sin(time*2)*.25;

  city.visible = time >= 26 && time < 57; city.position.set(-2.4, -alt, -3 + dist);
  const ct = (time - 27) * .27;
  parts.forEach(p => p.scale.y = Math.max(.001, smooth((ct - p.userData.start) / .6)));
  avenues.forEach(l => l.visible = ct > .5);

  const surface = smooth((time - 16)/5) * (1 - smooth((time - 50)/3));
  const build = smooth((time - 27)/8) * (1 - smooth((time - 50)/3));
  const d0 = mix(4.6, 3.4, near) + build*4.2;
  const height = mix(1.4, .8, near) + build*1.6 + surface*.1;
  const yawT = yaw + mx*.35 + build*.9 + time*.004;
  const target = new THREE.Vector3(mix(0, -1.5, build), mix(0, -alt + .3, build), mix(0, -2.1, build));
  C.position.set(target.x + Math.sin(yawT)*d0, target.y + height + pitch + my*.3, target.z + Math.cos(yawT)*d0);
  if(C.position.y < -alt + .05) C.position.y = -alt + .05;
  C.lookAt(target);

  readout(time, w, alt, dist);
  R.render(S, C);
  requestAnimationFrame(frame);
})(last);
