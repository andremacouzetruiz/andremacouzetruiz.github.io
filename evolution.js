import * as THREE from 'three';

// From the first fire to an interplanetary civilization: one planet, eleven chapters.
const ERAS = [
  {era:'Primates',       yr:'−2,000,000', pop:'~100,000',  nrg:'Muscle',          fr:'The trees',            cap:'Apes come down from the trees and stand up'},
  {era:'Fire',           yr:'−300,000',   pop:'~1 million',nrg:'Fire',            fr:'The night',            cap:'Someone keeps a flame alive. The night belongs to us now'},
  {era:'Agriculture',    yr:'−10,000',    pop:'~5 million',nrg:'Sun and soil',    fr:'The river valley',     cap:'We plant, we stay, the first villages appear'},
  {era:'Rome',           yr:'0',          pop:'~300 million',nrg:'Water and wind',fr:'The Mediterranean',    cap:'Forums, baths, roads and a life lived in public'},
  {era:'Renaissance',    yr:'1500',       pop:'~450 million',nrg:'Wind and sail',  fr:'The oceans',           cap:'Beauty, science and ships that cross the world'},
  {era:'Industry',       yr:'1850',       pop:'~1.2 billion',nrg:'Coal and steam', fr:'The factory',          cap:'The machine arrives, and the clock takes our time'},
  {era:'Electric age',   yr:'1950',       pop:'~2.5 billion',nrg:'Oil and power',  fr:'The sky',              cap:'Lights at night, planes overhead, the first satellites'},
  {era:'Intelligence',   yr:'2026',       pop:'~8.2 billion',nrg:'Silicon',        fr:'The network',          cap:'A planet wired together, and machines that think'},
  {era:'Moon',           yr:'2035',       pop:'~8.8 billion',nrg:'Solar',          fr:'The Moon',             cap:'A permanent base. Humanity becomes two-world'},
  {era:'Mars',           yr:'2060',       pop:'~9.5 billion',nrg:'Fusion',         fr:'Mars',                 cap:'The first city on another planet'},
  {era:'Interplanetary', yr:'2100+',      pop:'Many worlds', nrg:'Abundant',       fr:'The solar system',     cap:'Cities among the planets, and purpose back in human hands'},
];

const cv = document.getElementById('gl');
const R = new THREE.WebGLRenderer({canvas: cv, antialias: true, alpha: true});
R.setPixelRatio(Math.min(devicePixelRatio, 2));
const S = new THREE.Scene();
const C = new THREE.PerspectiveCamera(40, 1, .1, 400);
C.position.set(0, 0, 18);
const INK = 0xe9e5dc;

// ---------- helpers ----------
function wireSphere(r, color, op, lat = 12, lon = 16){
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.SphereGeometry(r * .995, 48, 48), new THREE.MeshBasicMaterial({color: 0x000000})));
  const m = new THREE.LineBasicMaterial({color, transparent: true, opacity: op});
  for(let i = 1; i < lat; i++){
    const a = -Math.PI/2 + i*Math.PI/lat, y = Math.sin(a)*r, rr = Math.cos(a)*r, pts = [];
    for(let k = 0; k <= 96; k++){const b = k/96*Math.PI*2; pts.push(new THREE.Vector3(Math.cos(b)*rr, y, Math.sin(b)*rr))}
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), m));
  }
  for(let j = 0; j < lon; j++){
    const b = j/lon*Math.PI*2, pts = [];
    for(let k = 0; k <= 64; k++){const a = -Math.PI/2 + k/64*Math.PI; pts.push(new THREE.Vector3(Math.cos(a)*Math.cos(b)*r, Math.sin(a)*r, Math.cos(a)*Math.sin(b)*r))}
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), m));
  }
  return g;
}
function onSphere(lat, lon, r){ // degrees
  const a = THREE.MathUtils.degToRad(lat), b = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(Math.cos(a)*Math.cos(b)*r, Math.sin(a)*r, Math.cos(a)*Math.sin(b)*r);
}
function glowTex(){
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'), g = x.createRadialGradient(32,32,0,32,32,32);
  g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(.3,'rgba(255,255,255,.6)'); g.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0,0,64,64); return new THREE.CanvasTexture(c);
}
const GLOW = glowTex();

// ---------- Earth ----------
const ER = 2.1;
const earth = new THREE.Group(); S.add(earth);
const earthWire = wireSphere(ER, INK, .5); earth.add(earthWire);
earth.rotation.z = .41;
// start with Africa facing us: a point at longitude L faces the camera when rotation.y = L + 90deg
earth.rotation.y = THREE.MathUtils.degToRad(-35 + 90) * -1 + Math.PI + 1.0;

// human marks on the surface: every point has an era when it appears
// clusters roughly where civilizations grew (Africa, Mediterranean, Asia, Europe, Americas)
const SEEDS = [
  {lat:-3,  lon:-35, from:0}, {lat:9, lon:-38, from:1},          // East Africa
  {lat:30,  lon:-31, from:2}, {lat:33, lon:-44, from:2},          // Nile, Mesopotamia
  {lat:41,  lon:-12, from:3}, {lat:38, lon:-23, from:3},          // Rome, Greece
  {lat:30,  lon:-115,from:2}, {lat:22, lon:-78, from:2},          // China, India
  {lat:48,  lon:-2,  from:4}, {lat:52, lon:0,   from:5},          // Europe
  {lat:40,  lon:75,  from:5}, {lat:19, lon:99,  from:4},          // North America, Mexico
  {lat:-23, lon:46,  from:6}, {lat:35, lon:-139,from:6},          // Brazil, Japan
  {lat:-33, lon:-151,from:7}, {lat:6,  lon:-3,  from:6},          // Australia, West Africa
];
const N = 2600, pos = new Float32Array(N*3), col = new Float32Array(N*3), born = new Float32Array(N);
for(let i = 0; i < N; i++){
  const s = SEEDS[Math.floor(Math.random()*SEEDS.length)];
  const spread = 4 + Math.random()*14;
  const v = onSphere(s.lat + (Math.random()-.5)*spread, s.lon + (Math.random()-.5)*spread*1.4, ER*1.008);
  pos.set([v.x, v.y, v.z], i*3);
  // when this light is born: never before its region's era, later on average as eras pass
  born[i] = s.from + Math.pow(Math.random(), .55) * (10 - s.from);
  const fire = born[i] < 2.2;
  const c = fire ? new THREE.Color(0xff8a3c) : new THREE.Color(0xffe2a8);
  col.set([c.r, c.g, c.b], i*3);
}
// the first fires: their own embers, spread across Africa and Eurasia
for(let i = 0; i < 160; i++){
  const k = N - 1 - i, lat = -20 + Math.random()*60, lon = -60 + Math.random()*120;
  const v = onSphere(lat, lon - 35, ER*1.01); pos.set([v.x, v.y, v.z], k*3);
  born[k] = .55 + Math.random()*1.4; col.set([1, .5, .2], k*3);
}
const lightsGeo = new THREE.BufferGeometry();
lightsGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
lightsGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
lightsGeo.setAttribute('born', new THREE.BufferAttribute(born, 1));
const lightsMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  uniforms: {uEra: {value: 0}, uTime: {value: 0}, uTex: {value: GLOW}, uPx: {value: R.getPixelRatio()}},
  vertexColors: true,
  vertexShader: `attribute float born; uniform float uEra; uniform float uTime; uniform float uPx; varying vec3 vC; varying float vA;
    void main(){ vC = color; float a = clamp((uEra - born) * 1.6, 0., 1.);
      float flick = born < 2.2 ? .7 + .3*sin(uTime*14. + born*90.) : 1.;
      vA = a * flick; vec4 mv = modelViewMatrix * vec4(position, 1.);
      gl_PointSize = (born < 2.2 ? 16. : 5.) * uPx * (16. / -mv.z) * a; gl_Position = projectionMatrix * mv; }`,
  fragmentShader: `uniform sampler2D uTex; varying vec3 vC; varying float vA;
    void main(){ vec4 t = texture2D(uTex, gl_PointCoord); gl_FragColor = vec4(vC, t.a * vA); }`
});
earth.add(new THREE.Points(lightsGeo, lightsMat));

// roads and routes: arcs between seeds, each with its era
const routes = new THREE.Group(); earth.add(routes);
function arc(a, b, lift, color, era){
  const p0 = onSphere(a[0], a[1], ER), p1 = onSphere(b[0], b[1], ER);
  const mid = p0.clone().add(p1).multiplyScalar(.5).normalize().multiplyScalar(ER * lift);
  const curve = new THREE.QuadraticBezierCurve3(p0, mid, p1);
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(60)), new THREE.LineBasicMaterial({color, transparent: true, opacity: 0}));
  line.userData.era = era; routes.add(line);
}
[[[41,-12],[38,-23]],[[41,-12],[30,-31]],[[41,-12],[48,-2]],[[38,-23],[33,-44]]].forEach(([a,b]) => arc(a,b,1.06,0xffd7a0,3));     // Roman roads
[[[48,-2],[19,99]],[[38,-9],[-23,46]],[[38,-9],[22,-78]]].forEach(([a,b]) => arc(a,b,1.18,0x9fc6ff,4));                            // sail
[[[52,0],[40,75]],[[40,75],[35,-139]],[[52,0],[22,-78]],[[19,99],[-23,46]]].forEach(([a,b]) => arc(a,b,1.3,0xe9e5dc,6));           // flight
[[[40,75],[52,0]],[[35,-139],[-33,-151]],[[22,-78],[6,-3]],[[19,99],[30,-115]],[[-23,46],[6,-3]]].forEach(([a,b]) => arc(a,b,1.45,0x8fd8ff,7)); // network

// satellites
const sats = new THREE.Group(); S.add(sats);
for(let i = 0; i < 70; i++){
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({map: GLOW, color: 0xbfe4ff, transparent: true, opacity: 0, depthWrite: false}));
  sp.scale.setScalar(.12); sp.userData = {r: ER*(1.25 + Math.random()*.5), inc: (Math.random()-.5)*2.2, ph: Math.random()*6.28, sp: .2 + Math.random()*.5, era: i < 6 ? 6 : 7};
  sats.add(sp);
}

// Moon
const moon = wireSphere(.55, INK, .45, 8, 10); S.add(moon); moon.scale.setScalar(.001);
const moonBase = new THREE.Sprite(new THREE.SpriteMaterial({map: GLOW, color: 0xffe2a8, transparent: true, opacity: 0, depthWrite: false}));
moonBase.scale.setScalar(.35); moonBase.position.copy(onSphere(10, 200, .57)); moon.add(moonBase);

// Mars
const mars = wireSphere(1.1, 0xff8a6a, .5, 10, 14); S.add(mars); mars.scale.setScalar(.001);
const marsLights = new THREE.Group(); mars.add(marsLights);
for(let i = 0; i < 90; i++){
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({map: GLOW, color: 0xffe2a8, transparent: true, opacity: 0, depthWrite: false}));
  sp.scale.setScalar(.14); sp.position.copy(onSphere(-10 + (Math.random()-.5)*40, 120 + (Math.random()-.5)*60, 1.12));
  sp.userData.born = 9 + Math.random()*1.6; marsLights.add(sp);
}

// orbital habitats
const rings = new THREE.Group(); S.add(rings);
[[ER*2.1, .3],[3.2, -.5]].forEach(([r, tilt], i) => {
  const t = new THREE.Mesh(new THREE.TorusGeometry(r*.35, .05, 8, 64), new THREE.MeshBasicMaterial({color: INK, wireframe: true, transparent: true, opacity: 0}));
  t.rotation.x = Math.PI/2 + tilt; t.userData.i = i; rings.add(t);
});

// ships
const fill = new THREE.MeshBasicMaterial({color: 0x050505});
const wire = new THREE.LineBasicMaterial({color: INK, transparent: true, opacity: .8});
function wf(geo){const g = new THREE.Group(); g.add(new THREE.Mesh(geo, fill)); g.add(new THREE.LineSegments(new THREE.WireframeGeometry(geo), wire)); return g}
function makeShip(){
  const s = new THREE.Group();
  const prof = [[0,.55],[.5,.52],[.9,.38],[1.2,.18],[1.3,0],[1.2,-.12],[.8,-.22],[0,-.26]].map(([x,y]) => new THREE.Vector2(x,y));
  s.add(wf(new THREE.LatheGeometry(prof, 18)));
  const sh = new THREE.Shape(); sh.moveTo(.6,0); sh.lineTo(4.3,-.15); sh.lineTo(4.4,0); sh.lineTo(1.1,.5); sh.lineTo(.6,.3);
  const wg = new THREE.ExtrudeGeometry(sh, {depth: .08, bevelEnabled: false});
  const l = wf(wg); l.rotation.x = -Math.PI/2; s.add(l);
  const r = wf(wg); r.rotation.x = -Math.PI/2; r.scale.x = -1; s.add(r);
  const flame = new THREE.Sprite(new THREE.SpriteMaterial({map: GLOW, color: 0x9fd2ff, transparent: true, depthWrite: false}));
  flame.scale.set(1.2, 1.2, 1); flame.position.set(0, 0, -1.1); s.add(flame);
  s.scale.setScalar(.13); s.visible = false; S.add(s); return s;
}
const ships = [makeShip(), makeShip(), makeShip()];

// stars
const sg = new THREE.BufferGeometry(), sp = [];
for(let i = 0; i < 1400; i++) sp.push((Math.random()-.5)*220, (Math.random()-.5)*130, -30 - Math.random()*60);
sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
S.add(new THREE.Points(sg, new THREE.PointsMaterial({color: INK, size: .1, transparent: true, opacity: .55})));

// ---------- layout per era ----------
let mobile = false;
function earthHome(){ return mobile ? new THREE.Vector3(0, 3.6, 0) : new THREE.Vector3(0, .6, 0) }
function moonPos(t){ const e = earthHome(); return new THREE.Vector3(e.x + Math.cos(t*.25)*3.4, e.y + Math.sin(t*.25)*1.1, Math.sin(t*.25)*2.2) }
function marsPos(){ const e = earthHome(); return mobile ? new THREE.Vector3(e.x + 3, e.y - 3.8, -6) : new THREE.Vector3(e.x + 6.5, e.y - 1.6, -5) }
function camFor(eraF){
  // zoom out as humanity's frontier grows
  const z = eraF < 7.5 ? 18 - Math.max(0, 1.2 - eraF) * 2.2 : eraF < 8.5 ? 20 : eraF < 9.5 ? 25 : 29;
  const lookX = eraF < 8.5 ? 0 : eraF < 9.5 ? 2.6 : 3;
  return {z, lookX};
}

function size(){
  const w = cv.clientWidth, h = cv.clientHeight; mobile = w < 860;
  R.setSize(w, h, false); C.aspect = w/h; if(!mobile) C.setViewOffset(w, h, -w*.24, 0, w, h); else C.clearViewOffset(); C.updateProjectionMatrix();
}
addEventListener('resize', size); size();

// ---------- UI ----------
const $ = id => document.getElementById(id);
const tl = $('tl');
tl.innerHTML = ERAS.map((e, i) => `<button type="button" data-i="${i}">${e.era}</button>`).join('');
const tlb = [...tl.children];
let era = 0, eraF = 0, paused = false, hold = 0;
const DUR = 3.6;
function setEra(i){
  era = (i + ERAS.length) % ERAS.length; hold = 0;
  const e = ERAS[era];
  $('era').textContent = e.era; $('yr').textContent = e.yr; $('pop').textContent = e.pop; $('nrg').textContent = e.nrg; $('fr').textContent = e.fr; $('cap').textContent = e.cap;
  tlb.forEach((b, k) => { b.classList.toggle('on', k === era); b.style.setProperty('--p', k < era ? '100%' : '0%') });
}
tlb.forEach(b => b.onclick = () => { setEra(+b.dataset.i); if(era === 0) eraF = 0 });
$('pause').onclick = () => { paused = !paused; $('pause').textContent = paused ? 'Play' : 'Pause' };
let mx = 0, my = 0;
addEventListener('pointermove', e => { mx = e.clientX/innerWidth - .5; my = e.clientY/innerHeight - .5 });
setEra(0);

// ---------- loop ----------
let last = performance.now(), t = 0;
const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();
function shipAlong(s, from, to, lift, u){
  const mid = from.clone().add(to).multiplyScalar(.5); mid.y += lift; mid.z += lift*.6;
  const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
  const p = curve.getPoint(u), q = curve.getPoint(Math.min(1, u + .01));
  s.position.copy(p); s.lookAt(q); s.visible = true;
}
(function frame(now){
  const dt = Math.min(.05, (now - last)/1000); last = now; t += dt;
  if(!paused){
    hold += dt;
    tlb[era].style.setProperty('--p', Math.min(100, hold/DUR*100) + '%');
    if(hold > DUR){ if(era === ERAS.length - 1){ setEra(0); eraF = 0 } else setEra(era + 1) }
  }
  eraF += (era - eraF) * Math.min(1, dt*2.2);
  lightsMat.uniforms.uEra.value = eraF + .4; lightsMat.uniforms.uTime.value = t;

  const eh = earthHome();
  earth.position.lerp(eh, .06);
  earth.rotation.y += dt * .12;
  routes.children.forEach(l => l.material.opacity += ((eraF + .3 > l.userData.era ? .55 : 0) - l.material.opacity) * .05);

  sats.children.forEach(s => {
    const u = s.userData, a = t*u.sp + u.ph;
    s.position.set(earth.position.x + Math.cos(a)*u.r, earth.position.y + Math.sin(a)*Math.sin(u.inc)*u.r*.5, earth.position.z + Math.sin(a)*u.r*.7);
    s.material.opacity += ((eraF + .3 > u.era ? .9 : 0) - s.material.opacity) * .05;
  });

  const showMoon = eraF > 7.6;
  moon.position.copy(moonPos(t)); moon.rotation.y += dt*.2;
  moon.scale.setScalar(THREE.MathUtils.lerp(moon.scale.x, showMoon ? 1 : .001, .06));
  moonBase.material.opacity += ((eraF > 7.8 ? 1 : 0) - moonBase.material.opacity) * .05;

  const showMars = eraF > 8.6;
  mars.position.copy(marsPos()); mars.rotation.y += dt*.1;
  mars.scale.setScalar(THREE.MathUtils.lerp(mars.scale.x, showMars ? 1 : .001, .05));
  marsLights.children.forEach(s => s.material.opacity += ((eraF + .4 > s.userData.born ? .95 : 0) - s.material.opacity) * .05);

  rings.children.forEach(r => {
    const i = r.userData.i; r.material.opacity += ((eraF > 9.7 ? .55 : 0) - r.material.opacity) * .04;
    r.position.copy(i === 0 ? earth.position : mars.position); r.rotation.z += dt * (.2 + i*.1);
  });

  // ships: Earth to Moon in the Moon chapter, Earth to Mars after, a fleet at the end
  const cyc = (t*.16) % 1;
  ships[0].visible = ships[1].visible = ships[2].visible = false;
  if(eraF > 7.7 && eraF < 8.7) shipAlong(ships[0], earth.position.clone(), moon.position.clone(), 1.2, cyc);
  if(eraF > 8.7){
    shipAlong(ships[0], earth.position.clone(), mars.position.clone(), 2.6, cyc);
    if(eraF > 9.7){
      shipAlong(ships[1], mars.position.clone(), earth.position.clone(), -2, (cyc + .5) % 1);
      shipAlong(ships[2], earth.position.clone(), moon.position.clone(), 1.2, (t*.3) % 1);
    }
  }

  const cam = camFor(eraF);
  C.position.x += (mx*1.2 + (mobile ? 0 : cam.lookX) - C.position.x) * .03;
  C.position.y += (-my*.8 - C.position.y) * .03;
  C.position.z += ((mobile ? cam.z + 6 : cam.z) - C.position.z) * .03;
  C.lookAt(mobile ? 0 : cam.lookX, mobile ? 1 : 0, 0);
  R.render(S, C);
  requestAnimationFrame(frame);
})(last);
