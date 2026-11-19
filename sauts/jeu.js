/* Saute-blocs: a 3D obstacle course in the sky.
   Jump from block to block, touch the green flags (checkpoints), avoid the red blocks,
   and climb up to the golden block. Six courses, from beginner to advanced.
   The score is in stars: 3 stars without a fall, 2 stars with 1 to 3 falls, 1 star otherwise. */
"use strict";
(function () {
const $ = id => document.getElementById(id);
const memo = {
  lire(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  ecrire(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
const CLE_MEILLEUR = "saute-blocs-meilleur", ACTIVITE = "jeu-saute-blocs";

/* ---------- The six courses ----------
   Each step is the next block: [gap before it, side shift, rise, width, depth, options].
   Options: f = green flag, fin = golden block, r = red block on the block ("g" left, "c" centre, "d" right),
   rm = red block that slides on the block (amplitude), m = moving block ("x", "y" or "z") with a = amplitude, v = speed. */
const NIVEAUX = [
  { nom: "Premiers sauts", groupe: "Débutant", aide: "De grands blocs, de petits sauts.", pas: [
    [1, 0, 0, 3, 3], [1.2, 0, .3, 3, 3], [1.2, 1, 0, 3, 3], [1.2, -1, .3, 3, 3, { f: 1 }],
    [1.3, 0, .3, 3, 3], [1.3, 1, 0, 3, 3], [1.3, 0, .4, 3, 3], [1.4, 0, .3, 4, 4, { fin: 1 }]] },
  { nom: "Les marches", groupe: "Débutant", aide: "On monte comme dans un escalier.", pas: [
    [1, 0, .6, 3, 3], [1, 0, .7, 3, 3], [1.2, 1.2, .6, 2.6, 2.6], [1.2, -1.2, .7, 2.6, 2.6], [1.3, 0, .6, 3, 3, { f: 1 }],
    [1.3, 1.2, .8, 2.6, 2.6], [1.3, 0, .8, 2.6, 2.6], [1.4, -1.2, .7, 2.6, 2.6], [1.4, 0, .9, 2.6, 2.6], [1.5, 0, .6, 4, 4, { fin: 1 }]] },
  { nom: "Les blocs rouges", groupe: "Intermédiaire", aide: "Saute par-dessus les blocs rouges.", pas: [
    [1.2, 0, .3, 3, 3], [1.3, 0, .3, 3, 3, { r: "c" }], [1.3, 1.4, .4, 2.6, 2.6], [1.3, 0, .4, 3, 3, { r: "g" }], [1.4, -1.4, .5, 2.6, 2.6, { f: 1 }],
    [1.4, 0, .5, 3, 3, { r: "d" }], [1.5, 1.3, .4, 2.4, 2.4], [1.5, 0, .6, 3.2, 3.2, { r: "c" }], [1.5, -1.3, .5, 2.4, 2.4, { f: 1 }],
    [1.6, 0, .6, 3, 3, { r: "g" }], [1.6, 1.2, .6, 2.4, 2.4], [1.6, 0, .6, 4, 4, { fin: 1 }]] },
  { nom: "Ça bouge !", groupe: "Intermédiaire", aide: "Attends que le bloc arrive, puis saute.", pas: [
    [1.2, 0, .4, 3, 3], [1.4, 0, 0, 2.4, 2.4, { m: "x", a: 1.6, v: 1 }], [1.4, 0, .4, 3, 3], [1.4, 0, .4, 2.4, 2.4, { m: "x", a: 1.8, v: 1.2 }],
    [1.4, 0, .3, 3, 3, { f: 1 }], [1.6, 0, .2, 2.4, 2.4, { m: "z", a: .8, v: 1 }], [1.6, 0, .6, 2.6, 2.6, { r: "c" }], [1.4, 1.4, .5, 2.4, 2.4],
    [1.4, -1.4, 0, 2.4, 2.4, { m: "y", a: .8, v: 1 }], [1.4, 0, .6, 3, 3, { f: 1 }], [1.5, 0, .2, 2.4, 2.4, { m: "x", a: 2, v: 1.3 }], [1.5, 0, .6, 4, 4, { fin: 1 }]] },
  { nom: "Petits blocs", groupe: "Avancé", aide: "Des blocs étroits : vise bien le centre.", pas: [
    [1.2, 0, .4, 2, 2], [1.3, 1, .4, 1.6, 1.6], [1.3, -1, .4, 1.6, 1.6], [1.3, 0, .5, 2.6, 2.6, { f: 1 }], [1.4, 0, .3, 1.6, 1.6],
    [1.4, 0, .5, 3.2, 2.6, { rm: 1.1 }], [1.4, 1.2, .4, 1.6, 1.6], [1.4, 0, .5, 2.6, 2.6, { f: 1 }], [1.5, 0, 0, 1.8, 1.8, { m: "x", a: 1.6, v: 1.2 }],
    [1.5, 0, .5, 1.6, 1.6], [1.5, -1.2, .5, 1.6, 1.6], [1.5, 0, .5, 2.6, 2.6, { f: 1 }], [1.6, 0, .6, 1.6, 1.6], [1.6, 0, .6, 4, 4, { fin: 1 }]] },
  { nom: "Jusqu’au ciel", groupe: "Avancé", aide: "Le grand parcours : tout ce que tu as appris.", pas: [
    [1.2, 0, .8, 2.4, 2.4], [1.2, 1.3, .8, 2, 2], [1.3, -1.3, .8, 2, 2], [1.3, 0, .6, 3, 3, { f: 1, r: "g" }], [1.5, 0, 0, 2, 2, { m: "y", a: 1, v: .9 }],
    [1.5, 0, 1, 2.4, 2.4], [1.5, 0, .2, 2, 2, { m: "x", a: 2, v: 1.4 }], [1.5, 0, .6, 3.2, 2.6, { f: 1 }], [1.6, 1.4, .7, 1.6, 1.6], [1.6, -1.4, .7, 1.6, 1.6],
    [1.6, 0, .6, 3.2, 2.6, { rm: 1.1 }], [1.6, 0, .6, 3, 3, { f: 1 }], [1.6, 0, .3, 2, 2, { m: "z", a: .7, v: 1.1 }], [1.6, 1.2, .8, 1.6, 1.6],
    [1.7, -1.2, .8, 1.6, 1.6], [1.7, 0, .6, 4, 4, { fin: 1 }]] }
];
const PARAMS = new URLSearchParams(location.search);
let niveau = Math.min(NIVEAUX.length, Math.max(1, parseInt(PARAMS.get("n"), 10) || memo.lire("saute-blocs-dernier", 1)));

/* ---------- Scene ---------- */
const canvas = $("scene");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8fd0f7);
scene.fog = new THREE.Fog(0xbfe4fb, 40, 120);
const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 300);
scene.add(new THREE.HemisphereLight(0xffffff, 0xb8d8f0, 0.75));
const soleil = new THREE.DirectionalLight(0xfffaf0, 0.7); soleil.position.set(8, 20, 10); scene.add(soleil);
const disque = new THREE.Mesh(new THREE.CircleGeometry(6, 32), new THREE.MeshBasicMaterial({ color: 0xfff1b8, fog: false }));
scene.add(disque);
const mats = {};
const mat = (c, o) => { const k = c + JSON.stringify(o || {}); return mats[k] || (mats[k] = new THREE.MeshLambertMaterial(Object.assign({ color: c }, o || {}))); };
const geoBloc = new THREE.BoxGeometry(1, 1, 1);
function boite(w, h, d, c, x, y, z, parent, o) { const m = new THREE.Mesh(geoBloc, mat(c, o)); m.scale.set(w, h, d); m.position.set(x, y, z); (parent || scene).add(m); return m; }

/* sea of clouds far below, and block clouds around the course */
const mer = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), mat(0xffffff)); mer.rotation.x = -Math.PI / 2; mer.position.y = -14; scene.add(mer);
const nuages = new THREE.Group(); scene.add(nuages);
for (let k = 0; k < 40; k++) {
  const g = new THREE.Group(), x = (Math.random() - .5) * 90, y = -12 + Math.random() * 30, z = 10 - Math.random() * 90;
  if (Math.abs(x) < 7 && y > -6) continue;
  const n = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < n; i++) boite(2 + Math.random() * 2.5, 1 + Math.random(), 2 + Math.random() * 2, 0xffffff, i * 1.6 - n * .8, Math.random() * .6, (Math.random() - .5) * 1.4, g);
  g.position.set(x, y, z); g.userData.v = .2 + Math.random() * .3; nuages.add(g);
}

/* ---------- Course building ---------- */
const COULEURS = [0x5b8fd9, 0xf29a4a, 0x6cc06f, 0xc9b3ff, 0xffd36b, 0xff8fa3, 0x4cc3c9];
const EP = .8;                       /* block thickness */
let monde = null;                    /* group of the current course */
let blocs = [], rouges = [], drapeaux = [], arrivee = null, N = 0;

function numero(texte, x, y, z) {
  const c = document.createElement("canvas"); c.width = 128; c.height = 64;
  const g = c.getContext("2d"); g.fillStyle = "#ffffffd9"; g.beginPath(); g.roundRect ? g.roundRect(8, 6, 112, 52, 18) : g.rect(8, 6, 112, 52); g.fill();
  g.fillStyle = "#16324f"; g.font = "bold 38px Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(texte, 64, 33);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthWrite: false }));
  s.scale.set(.9, .45, 1); s.position.set(x, y, z); monde.add(s); return s;
}
function bloc(x, haut, z, w, d, couleur, type) {
  const b = { x, y: haut - EP / 2, z, w, h: EP, d, x0: x, y0: haut - EP / 2, z0: z, dx: 0, dy: 0, dz: 0, type: type || "plat", mobile: null };
  b.mesh = new THREE.Group(); b.mesh.position.set(x, b.y, z); monde.add(b.mesh);
  boite(w, EP, d, couleur, 0, 0, 0, b.mesh);
  boite(w + .02, .14, d + .02, type === "fin" ? 0xfff1a8 : 0xffffff, 0, EP / 2 - .05, 0, b.mesh, { transparent: true, opacity: type === "fin" ? 1 : .25 });
  blocs.push(b); return b;
}
function rouge(sur, cote, amp) {
  const off = cote === "g" ? -sur.w / 4 : cote === "d" ? sur.w / 4 : 0, t = .9;
  const r = { sur, off, amp: amp || 0, w: t, h: t, d: t, x: sur.x + off, y: sur.y + EP / 2 + t / 2, z: sur.z, phase: Math.random() * 6 };
  r.mesh = boite(t, t, t, 0xe53b3b, r.x, r.y, r.z, monde, { emissive: 0x5a0000 });
  rouges.push(r);
}
function drapeau(b) {
  const g = new THREE.Group(); g.position.set(b.x, b.y + EP / 2, b.z - b.d / 2 + .5); monde.add(g);
  boite(.12, 2.2, .12, 0xffffff, 0, 1.1, 0, g);
  const tissu = boite(.9, .55, .06, 0x9bb7a5, .5, 1.85, 0, g);
  drapeaux.push({ bloc: b, g, tissu, atteint: false });
}
function construire(n) {
  if (monde) scene.remove(monde);
  monde = new THREE.Group(); scene.add(monde);
  blocs = []; rouges = []; drapeaux = []; arrivee = null;
  const def = NIVEAUX[n - 1];
  const depart = bloc(0, 0, 0, 5, 5, 0xf4f7fb, "depart");
  let px = 0, top = 0, bord = -2.5;
  N = def.pas.length;
  def.pas.forEach(([gap, dx, dy, w, d, o], i) => {
    o = o || {};
    px += dx; top += dy;
    const z = bord - gap - d / 2;
    const b = bloc(px, top, z, w, d, o.fin ? 0xf4c542 : o.m ? 0xb084f5 : COULEURS[i % COULEURS.length], o.fin ? "fin" : "plat");
    b.num = i + 1;
    if (o.m) b.mobile = { axe: o.m, amp: o.a || 1, vitesse: o.v || 1, phase: i };
    if (o.r) rouge(b, o.r);
    if (o.rm) rouge(b, "c", o.rm);
    if (o.f) drapeau(b);
    if (o.fin) {
      const t = new THREE.Mesh(new THREE.OctahedronGeometry(.6), mat(0xffd34d, { emissive: 0x7a5a00 }));
      t.position.set(b.x, top + 1.6, z); monde.add(t); arrivee = { bloc: b, mesh: t };
    }
    /* the number floats beside the block, so it never hides the player */
    b.etiq = numero(String(i + 1).padStart(2, "0"), b.x - w / 2 - .45, top + .35, z);
    bord = z - d / 2;
  });
  $("nomNiveau").textContent = def.groupe + " · " + def.nom;
  placerEtiquettes();
  return depart;
}

/* ---------- Avatar (same block person as the other games, dressed by personnages.js) ---------- */
const avatar = new THREE.Group(); scene.add(avatar);
const corps = new THREE.Group(); avatar.add(corps);
const jambeG = new THREE.Group(), jambeD = new THREE.Group(), brasG = new THREE.Group(), brasD = new THREE.Group();
jambeG.position.set(-.16, .75, 0); jambeD.position.set(.16, .75, 0); brasG.position.set(-.42, 1.45, 0); brasD.position.set(.42, 1.45, 0);
corps.add(jambeG, jambeD, brasG, brasD);
boite(.3, .75, .3, 0x2f4f8f, 0, -.375, 0, jambeG); boite(.3, .75, .3, 0x2f4f8f, 0, -.375, 0, jambeD);
boite(.22, .7, .22, 0xf2c79e, 0, -.3, 0, brasG); boite(.22, .7, .22, 0xf2c79e, 0, -.3, 0, brasD);
boite(.62, .72, .34, 0x14a3ad, 0, 1.12, 0, corps);
boite(.5, .5, .5, 0xf2c79e, 0, 1.75, 0, corps);
boite(.54, .14, .54, 0x6b3f1f, 0, 2.03, 0, corps);
boite(.08, .08, .02, 0x16324f, -.11, 1.8, .26, corps); boite(.08, .08, .02, 0x16324f, .11, 1.8, .26, corps);
boite(.18, .04, .02, 0x8a3a2f, 0, 1.66, .26, corps);
const ombre = new THREE.Mesh(new THREE.CircleGeometry(.42, 24), new THREE.MeshBasicMaterial({ color: 0x16324f, transparent: true, opacity: .25, depthWrite: false }));
ombre.rotation.x = -Math.PI / 2; scene.add(ombre);
if (window.Personnages) Personnages.init({ jeu: "sauts", corps, jambeG, jambeD, brasG, brasD });

/* ---------- Player and game state ---------- */
const R = .3, HAUT = 1.9, VITESSE = 5.2, GRAVITE = 24, SAUT = 9.4;
const j = { x: 0, y: 0, z: 1, vx: 0, vy: 0, vz: 0, sol: null, coyote: 0, tampon: 0, angle: Math.PI, marche: 0 };
let point = { x: 0, y: 0, z: 1 }, chutes = 0, maxNum = 0, nbDrapeaux = 0, temps = 0, enJeu = false, enPause = false, fini = false, horloge = 0;
const opts = { vitesse: 1, calme: false };
const touches = { haut: false, bas: false, gauche: false, droite: false };


const questionsValidees = new Set();
let questionActive = false;
function fractionQuestion() {
 const r=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
 const d=r(3,8), n=r(1,d-1), f=(a,b)=>a+'/'+b;
 switch(niveau){
 case 1:return {q:'Quelle fraction est coloriée ?',v:Array.from({length:d},(_,i)=>i<n),a:f(n,d),c:[f(n,d),f(d-n,d),f(n,d+1),f(d,n)]};
 case 2:{const haut=Math.random()<.5;return {q:'Quel est le '+(haut?'numérateur':'dénominateur')+' de '+f(n,d)+' ?',a:String(haut?n:d),c:[String(n),String(d),String(d+1)]};}
 case 3:{const m=n===1?2:n-1;return {q:'Quelle fraction est la plus grande ?',a:f(Math.max(n,m),d),c:[f(n,d),f(m,d),f(0,d)]};}
 case 4:return {q:'Quelle fraction est équivalente à '+f(n,d)+' ?',a:f(n*2,d*2),c:[f(n*2,d*2),f(n,d*2),f(n*2,d*2+1)]};
 default:{const b=r(1,niveau===5?d-n:n), moins=niveau===6&&Math.random()<.5, a=moins?n-b:n+b;return {q:f(n,d)+(moins?' − ':' + ')+f(b,d)+' = ?',a:f(a,d),c:[f(a,d),f(a+1,d),f(a,d*2)]};}
 }
}
function poserFraction(b, suite){
 if(questionActive)return;
 questionActive=true; j.vx=j.vz=j.vy=j.tampon=j.coyote=0; for(const k in touches)touches[k]=false;
 const q=fractionQuestion(), panel=$('fractionPanneau'), choix=$('fractionChoix');
 $('fractionTitre').textContent=q.q; $('fractionVisuel').replaceChildren();
 if(q.v)q.v.forEach(v=>{const e=document.createElement('span');e.className=v?'part pleine':'part';$('fractionVisuel').append(e);});
 $('fractionRetour').textContent=''; choix.replaceChildren();
 const options=[...new Set(q.c)].slice(0,3); if(!options.includes(q.a))options[0]=q.a;
 for(let i=options.length-1;i>0;i--){const k=Math.floor(Math.random()*(i+1));[options[i],options[k]]=[options[k],options[i]];}
 options.forEach(v=>{const btn=document.createElement('button');btn.type='button';btn.className='bouton-jeu';btn.textContent=v;btn.onclick=()=>{
 if(v!==q.a){$('fractionRetour').textContent='Essaie encore !';btn.disabled=true;return;}
 questionsValidees.add(b.num); questionActive=false;panel.hidden=true;for(const k in touches)touches[k]=false;canvas.focus();suite();
 };choix.append(btn);});panel.hidden=false;choix.firstElementChild.focus();
}

function placer(p) { j.x = p.x; j.y = p.y; j.z = p.z; j.vx = j.vy = j.vz = 0; j.sol = null; j.angle = Math.PI; }
function nouvellePartie() {
  questionsValidees.clear(); questionActive=false; $("fractionPanneau").hidden=true;
  const depart = construire(niveau);
  point = { x: 0, y: depart.y + EP / 2, z: 1 };
  placer(point); chutes = 0; maxNum = 0; nbDrapeaux = 0; temps = 0; fini = false;
  majHud(); cacherMessage();
  memo.ecrire("saute-blocs-dernier", niveau);
}

/* ---------- Messages and dashboard ---------- */
let minuterieMsg = null;
function message(t, duree) {
  const m = $("message"); m.textContent = t; m.hidden = false;
  clearTimeout(minuterieMsg); minuterieMsg = setTimeout(cacherMessage, duree || 2200);
}
function cacherMessage() { $("message").hidden = true; }
const mmss = s => Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");
function majHud() {
  $("temps").textContent = mmss(temps);
  $("plateforme").textContent = String(maxNum).padStart(2, "0") + " / " + String(N).padStart(2, "0");
  $("drapeaux").textContent = nbDrapeaux + " / " + drapeaux.length;
  $("chutes").textContent = chutes;
}

/* ---------- Physics ---------- */
const chevauche = (b, x, z, r) => Math.abs(x - b.x) < b.w / 2 + r && Math.abs(z - b.z) < b.d / 2 + r;
function bougerBlocs(dt) {
  for (const b of blocs) {
    b.dx = b.dy = b.dz = 0;
    if (!b.mobile) continue;
    const ax = b.mobile.axe, base = b[ax + "0"];
    const nv = base + (opts.calme ? 0 : Math.sin(horloge * b.mobile.vitesse + b.mobile.phase) * b.mobile.amp);
    b["d" + ax] = nv - b[ax]; b[ax] = nv; b.mesh.position[ax] = nv;
  }
  for (const r of rouges) {
    const s = r.sur;
    r.x = s.x + r.off + (r.amp && !opts.calme ? Math.sin(horloge * 1.6 + r.phase) * r.amp : 0);
    r.y = s.y + EP / 2 + r.h / 2; r.z = s.z;
    r.mesh.position.set(r.x, r.y, r.z);
  }
  if (j.sol) { j.x += j.sol.dx; j.y += j.sol.dy; j.z += j.sol.dz; }
}
function collisionsHorizontales(axe, avant) {
  for (const b of blocs) {
    const haut = b.y + b.h / 2, bas = b.y - b.h / 2;
    if (j.y >= haut - .05 || j.y + HAUT <= bas) continue;
    if (!chevauche(b, j.x, j.z, R)) continue;
    /* a small step: the player climbs on it (forgiving when a jump is a little short) */
    if (haut - j.y < .3 && j.vy <= 0) { j.y = haut; j.vy = 0; continue; }
    /* only push back on the axis that just moved into the block */
    const dejaDedans = axe === "x" ? Math.abs(avant - b.x) < b.w / 2 + R : Math.abs(avant - b.z) < b.d / 2 + R;
    if (dejaDedans) continue;
    if (axe === "x") j.x = avant < b.x ? b.x - b.w / 2 - R - .001 : b.x + b.w / 2 + R + .001;
    else j.z = avant < b.z ? b.z - b.d / 2 - R - .001 : b.z + b.d / 2 + R + .001;
  }
}
function physique(dt) {
  bougerBlocs(dt);
  /* walking: side view, the course goes to the right of the screen.
     → forward, ← back, ↑ further from the camera, ↓ closer to the camera */
  let mz = (touches.gauche ? 1 : 0) - (touches.droite ? 1 : 0), mx = (touches.bas ? 1 : 0) - (touches.haut ? 1 : 0);
  /* vertical course (seen from behind): ↑ forward, ↓ back, ← left, → right */
  if (sens === "vertical") { mz = (touches.bas ? 1 : 0) - (touches.haut ? 1 : 0); mx = (touches.droite ? 1 : 0) - (touches.gauche ? 1 : 0); }
  const l = Math.hypot(mx, mz); if (l > 1) { mx /= l; mz /= l; }
  /* the view can be turned: the arrows follow the camera */
  { const d = vue.yaw - SENS[sens].yaw, c = Math.cos(d), sn = Math.sin(d), x2 = mx * c + mz * sn; mz = -mx * sn + mz * c; mx = x2; }
  const vmax = VITESSE * (window.Personnages ? Personnages.vitesse() : 1), lisse = j.sol ? .35 : .12;
  j.vx += (mx * vmax - j.vx) * lisse; j.vz += (mz * vmax - j.vz) * lisse;
  /* jump (a little forgiving: just after leaving a block, or pressed just before landing) */
  j.coyote = j.sol ? .12 : Math.max(0, j.coyote - dt);
  j.tampon = Math.max(0, j.tampon - dt);
  if (j.tampon > 0 && j.coyote > 0) { j.vy = SAUT; j.sol = null; j.coyote = 0; j.tampon = 0; }
  j.vy -= GRAVITE * dt; j.vy = Math.max(j.vy, -24);
  if (window.Personnages) Personnages.physique(j, dt);
  const ax = j.x; j.x += j.vx * dt; collisionsHorizontales("x", ax);
  const az = j.z; j.z += j.vz * dt; collisionsHorizontales("z", az);
  const ay = j.y; j.y += j.vy * dt; j.sol = null;
  for (const b of blocs) {
    if (!chevauche(b, j.x, j.z, R - .08)) continue;
    const haut = b.y + b.h / 2, bas = b.y - b.h / 2;
    if (j.vy <= 0 && ay >= haut - .12 && j.y <= haut) { j.y = haut; j.vy = 0; j.sol = b; }
    else if (j.vy > 0 && ay + HAUT <= bas + .05 && j.y + HAUT > bas) { j.y = bas - HAUT; j.vy = 0; }
  }
  if (j.sol) toucherBloc(j.sol);
  if(questionActive || fini) return;
  /* red blocks: back to the last flag */
  for (const r of rouges) {
    if (Math.abs(j.x - r.x) < r.w / 2 + R - .08 && Math.abs(j.z - r.z) < r.d / 2 + R - .08 && j.y < r.y + r.h / 2 - .05 && j.y + HAUT > r.y - r.h / 2) {
      tomber("🟥 Aïe ! Un bloc rouge. Tu repars du dernier drapeau."); return;
    }
  }
  if (j.y < point.y - 12) tomber("☁️ Pouf ! Tu es tombé. Tu repars du dernier drapeau.");
}
function toucherBloc(b) {
  if (b.num && b.num > maxNum) maxNum = b.num;
  if ((b.type === "fin" || drapeaux.some(d=>d.bloc===b && !d.atteint)) && !questionsValidees.has(b.num)) { poserFraction(b,()=>toucherBloc(b)); return; }
  for (const d of drapeaux) if (d.bloc === b && !d.atteint) {
    d.atteint = true; nbDrapeaux++; d.tissu.material = mat(0x2fc65b, { emissive: 0x0d4a1f });
    point = { x: b.x, y: b.y + EP / 2, z: b.z };
    message("🚩 Drapeau atteint ! Tu repartiras d’ici.");
  }
  if (b.type === "fin" && !fini) gagner();
}
function tomber(t) {
  chutes++; placer(point); message(t, 2600); majHud();
}

/* ---------- End of a course ---------- */
const etoilesDe = c => c === 0 ? 3 : c <= 3 ? 2 : 1;
async function gagner() {
  fini = true; enJeu = false;
  const et = etoilesDe(chutes), def = NIVEAUX[niveau - 1];
  $("finScore").textContent = "⭐".repeat(et) + "☆".repeat(3 - et);
  $("finTemps").textContent = mmss(temps); $("finChutes").textContent = chutes;
  $("texteFin").textContent = et === 3 ? "Parfait : aucune chute !" : et === 2 ? "Très bien ! Essaie sans tomber pour avoir 3 étoiles." : "Tu as réussi ! Rejoue pour tomber moins souvent.";
  $("btnSuivant").hidden = niveau >= NIVEAUX.length;
  const cle = sens === "horizontal" ? niveau + "h" : niveau;   // each version keeps its own best score
  const m = memo.lire(CLE_MEILLEUR, {}), av = m[cle];
  if (!av || et > av.etoiles || (et === av.etoiles && temps < av.temps)) { m[cle] = { etoiles: et, temps: Math.round(temps) }; memo.ecrire(CLE_MEILLEUR, m); }
  if (window.Personnages) Personnages.gagner(et);
  $("fin").hidden = false; $("titreFin").focus();
  const s = $("finSauvegarde"); s.textContent = "";
  if (window.EC && EC.connecte && EC.connecte()) {
    try { await EC.enregistrerNiveau({ activity: ACTIVITE, level: niveau, score: et, total: 3, seconds: Math.round(temps) }); s.textContent = "✓ Ton score est enregistré."; }
    catch (e) { s.textContent = "Ton score est gardé sur cet appareil."; }
  } else s.textContent = "Tu n’es pas connecté : ton score est gardé sur cet appareil.";
  remplirNiveaux();
  void def;
}

/* ---------- Camera and drawing ---------- */
const cam = { x: 8, y: 5, z: 3 };
/* Orbit view around the player: drag to turn, wheel to zoom, double click to go back to the starting view.
   SENS (below) gives the starting view for each direction of the course. */
/* Three directions for the course on the screen: diagonal (the original view), horizontal (left to right, seen
   from the side) and vertical (towards the top of the screen, seen from behind). */
const SENS = {
  diagonale: { nom: "↗️ En diagonale", yaw: Math.atan2(8.5, 5.6), pitch: Math.atan2(3, Math.hypot(8.5, 5.6)), dist: Math.hypot(8.5, 3, 5.6) },
  horizontal: { nom: "➡️ Horizontal", yaw: Math.PI / 2, pitch: Math.atan2(4, 12), dist: Math.hypot(12, 4) },
  vertical: { nom: "⬆️ Vertical", yaw: 0, pitch: Math.atan2(4.6, 7.5), dist: Math.hypot(7.5, 4.6) }
};
/* each level is offered in two versions: diagonal and horizontal */
const ORDRE_SENS = ["diagonale", "horizontal"];
let sens = ORDRE_SENS.includes(PARAMS.get("s")) ? PARAMS.get("s") : ORDRE_SENS.includes(memo.lire("saute-blocs-sens", "diagonale")) ? memo.lire("saute-blocs-sens", "diagonale") : "diagonale";
const vue = { yaw: SENS[sens].yaw, pitch: SENS[sens].pitch, dist: SENS[sens].dist };
/* Block numbers float on the side of the block that faces the camera */
function placerEtiquettes() {
  for (const b of blocs) if (b.etiq) {
    if (sens === "horizontal") b.etiq.position.set(b.x, b.y + EP / 2 + .55, b.z + b.d / 2 - .35);
    else b.etiq.position.set(b.x - b.w / 2 - .45, b.y + EP / 2 + .35, b.z);
  }
}
function changerSens(nouveau, annoncer) {
  sens = ORDRE_SENS.includes(nouveau) ? nouveau : "diagonale";
  memo.ecrire("saute-blocs-sens", sens);
  vue.yaw = SENS[sens].yaw; vue.pitch = SENS[sens].pitch; vue.dist = SENS[sens].dist;
  placerEtiquettes();
  if ($("listeNiveaux")) remplirNiveaux();
  if ($("btnSens")) $("btnSens").textContent = SENS[sens].nom.split(" ")[0] + " Sens";
  /* touch pad labels follow the direction */
  const lab = sens === "vertical" ? { haut: "Avancer", bas: "Reculer", gauche: "Aller à gauche", droite: "Aller à droite" } : { haut: "Aller vers le fond", bas: "Venir devant", gauche: "Reculer", droite: "Avancer" };
  document.querySelectorAll(".pad button[data-k]").forEach(x => x.setAttribute("aria-label", lab[x.dataset.k]));
  if (annoncer) message(SENS[sens].nom + (sens === "vertical" ? " : ↑ pour avancer" : " : → pour avancer"), 1800);
}
let glisseVue = null;
canvas.addEventListener("pointerdown", e => { canvas.focus(); glisseVue = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener("pointermove", e => {
  if (!glisseVue) return;
  vue.yaw -= (e.clientX - glisseVue.x) * .006;
  vue.pitch = Math.max(.08, Math.min(1.2, vue.pitch + (e.clientY - glisseVue.y) * .004));
  glisseVue = { x: e.clientX, y: e.clientY };
});
for (const ev of ["pointerup", "pointercancel"]) canvas.addEventListener(ev, () => { glisseVue = null; });
canvas.addEventListener("wheel", e => { e.preventDefault(); vue.dist = Math.max(5, Math.min(18, vue.dist + e.deltaY * .01)); }, { passive: false });
canvas.addEventListener("dblclick", () => { vue.yaw = SENS[sens].yaw; vue.pitch = SENS[sens].pitch; vue.dist = SENS[sens].dist; });
function dessiner(dt) {
  /* avatar */
  avatar.position.set(j.x, j.y, j.z);
  const v = Math.hypot(j.vx, j.vz);
  if (v > .4) { const cible = Math.atan2(j.vx, j.vz); let d = cible - j.angle; d = Math.atan2(Math.sin(d), Math.cos(d)); j.angle += d * Math.min(1, dt * 12); }
  avatar.rotation.y = j.angle;
  j.marche += dt * v * 2.2;
  const bal = j.sol ? Math.sin(j.marche) * Math.min(1, v / 3) * .7 : .5;
  jambeG.rotation.x = bal; jambeD.rotation.x = j.sol ? -bal : -.3; brasG.rotation.x = -bal; brasD.rotation.x = j.sol ? bal : -.9;
  /* shadow on the block below */
  let solY = -100;
  for (const b of blocs) if (chevauche(b, j.x, j.z, 0) && b.y + b.h / 2 <= j.y + .05) solY = Math.max(solY, b.y + b.h / 2);
  ombre.visible = solY > -100; ombre.position.set(j.x, solY + .02, j.z);
  /* course details */
  if (arrivee) { arrivee.mesh.rotation.y += dt * 1.5; arrivee.mesh.position.y = arrivee.bloc.y + EP / 2 + 1.6 + Math.sin(horloge * 2) * .15; }
  for (const r of rouges) r.mesh.scale.setScalar(opts.calme ? 1 : 1 + Math.sin(horloge * 4 + r.phase) * .04);
  for (const d of drapeaux) d.tissu.rotation.y = Math.sin(horloge * 3) * .25;
  for (const g of nuages.children) { g.position.x += g.userData.v * dt * (opts.calme ? 0 : 1); if (g.position.x > 50) g.position.x = -50; }
  /* camera: on the side of the course (turned 90° to the right), a little above and behind, smooth */
  const k = Math.min(1, dt * 4);
  const hz = vue.dist * Math.cos(vue.pitch), ox = hz * Math.sin(vue.yaw), oy = vue.dist * Math.sin(vue.pitch), oz = hz * Math.cos(vue.yaw);
  cam.x += (j.x + ox - cam.x) * k; cam.y += (j.y + 1.2 + oy - cam.y) * k; cam.z += (j.z - 3 + oz - cam.z) * k;
  camera.position.set(cam.x, cam.y, cam.z); camera.lookAt(j.x, j.y + 1.2, j.z - 3);
  disque.position.set(camera.position.x - 90, camera.position.y + 22, camera.position.z - 40); disque.lookAt(camera.position);
  renderer.render(scene, camera);
}
function redimensionner() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
}
window.addEventListener("resize", redimensionner); redimensionner();

let avant = performance.now();
function boucle(t) {
  const reel = Math.min(.05, (t - avant) / 1000); avant = t;
  if (enJeu && !enPause && !questionActive) {
    const dt = reel * opts.vitesse;
    horloge += dt; temps += reel;
    physique(dt);
    majHud();
  }
  dessiner(reel);
  requestAnimationFrame(boucle);
}

/* ---------- Menus ---------- */
function remplirNiveaux() {
  const nav = $("listeNiveaux"); nav.textContent = "";
  const m = memo.lire(CLE_MEILLEUR, {});
  NIVEAUX.forEach((def, i) => {
    const n = i + 1;
    /* two versions of the same course, side by side */
    for (const sv of ORDRE_SENS) {
      const cle = sv === "horizontal" ? n + "h" : n, r = m[cle];
      const b = document.createElement("button"); b.type = "button";
      b.setAttribute("aria-pressed", n === niveau && sv === sens ? "true" : "false");
      const e = r ? "★".repeat(r.etoiles) + "☆".repeat(3 - r.etoiles) : "☆☆☆";
      b.innerHTML = "<span></span><small></small><span class=\"etoiles-niv\"></span>";
      b.children[0].textContent = n + ". " + def.nom + " " + SENS[sv].nom.split(" ")[0];
      b.children[1].textContent = (sv === "horizontal" ? "Horizontal" : "En diagonale") + " · " + (n <= 2 ? "🟢 " : n <= 4 ? "🟡 " : "🔴 ") + def.groupe + " · " + def.pas.length + " blocs";
      b.children[2].textContent = e;
      b.title = def.aide;
      b.onclick = () => { niveau = n; if (sv !== sens) changerSens(sv); remplirNiveaux(); nouvellePartie(); };
      nav.append(b);
    }
  });
}
function jouer() {
  opts.vitesse = parseFloat($("optVitesse").value) || 1; opts.calme = $("optCalme").checked;
  $("accueil").hidden = true; $("fin").hidden = true;
  enJeu = true; enPause = false; canvas.focus();
  message("🟦 " + NIVEAUX[niveau - 1].nom + " : " + NIVEAUX[niveau - 1].aide, 3000);
}
function pause(oui) {
  if (!enJeu || questionActive) return;
  enPause = oui; $("pausePanneau").hidden = !oui; $("btnPause").setAttribute("aria-pressed", oui ? "true" : "false");
  if (oui) $("pReprendre").focus(); else canvas.focus();
}
$("btnJouer").onclick = jouer;
$("btnPause").onclick = () => pause(!enPause);
$("pReprendre").onclick = $("pFermer").onclick = () => pause(false);
$("pDrapeau").onclick = () => { placer(point); pause(false); };
$("pRecommencer").onclick = () => { nouvellePartie(); pause(false); };
$("btnRejouer").onclick = () => { nouvellePartie(); jouer(); };
$("btnSuivant").onclick = () => { niveau = Math.min(NIVEAUX.length, niveau + 1); remplirNiveaux(); nouvellePartie(); jouer(); };

/* ---------- Keyboard and touch ---------- */
const CLES = { ArrowUp: "haut", KeyW: "haut", ArrowDown: "bas", KeyS: "bas", ArrowLeft: "gauche", KeyA: "gauche", ArrowRight: "droite", KeyD: "droite" };
document.addEventListener("keydown", e => {
  if(questionActive) return;
  if (e.target.closest && e.target.closest("select, input")) return;
  if (CLES[e.code]) { touches[CLES[e.code]] = true; if (enJeu) e.preventDefault(); }
  else if (e.code === "Space") { if (enJeu && !enPause && !questionActive) { j.tampon = .15; e.preventDefault(); } }
  else if (e.code === "KeyP" || e.key === "Escape") { if (enJeu && !document.querySelector(".mp, .pm-voile")) { pause(!enPause); e.preventDefault(); } }
});
document.addEventListener("keyup", e => { if (CLES[e.code]) touches[CLES[e.code]] = false; });
window.addEventListener("blur", () => { for (const k in touches) touches[k] = false; });
document.querySelectorAll(".pad button").forEach(b => {
  const k = b.dataset.k;
  b.addEventListener("pointerdown", e => { e.preventDefault(); touches[k] = true; b.setPointerCapture(e.pointerId); });
  for (const ev of ["pointerup", "pointercancel", "pointerleave"]) b.addEventListener(ev, () => { touches[k] = false; });
});
$("btnSaut").addEventListener("pointerdown", e => { e.preventDefault(); if (enJeu && !enPause) j.tampon = .15; });

$("btnSens").onclick = () => { changerSens(ORDRE_SENS[(ORDRE_SENS.indexOf(sens) + 1) % ORDRE_SENS.length], true); canvas.focus(); };

/* ---------- Start ---------- */
changerSens(sens);
remplirNiveaux();
nouvellePartie();
requestAnimationFrame(boucle);
})();
