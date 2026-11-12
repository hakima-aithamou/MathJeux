/* The Block Storm: a small island where the student gathers materials (trees and rocks),
   builds walls, floors and ramps, and opens the 5 chests before the storm covers the island.
   - Ramps climb one level (2 m), floors cross the water, walls shelter from the gusts of wind.
   - The storm closes in four steps; outside it the student loses hearts, then starts again in the middle.
   - Score: 3 stars for the 5 chests, 2 for 3 or 4, 1 for 1 or 2 (activity "jeu-tempete", level 1).
   3D engine: ../ile/three.min.js (r128). */
(function () {
"use strict";
const $ = id => document.getElementById(id);
const calme = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Scene ---------- */
const canvas = $("scene");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
const CIEL = new THREE.Color(0x9fd3f5), CIEL_ORAGE = new THREE.Color(0x6a5a9a);
scene.background = CIEL.clone(); scene.fog = new THREE.Fog(0x9fd3f5, 70, 190);
const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 400);
scene.add(new THREE.HemisphereLight(0xffffff, 0x6a7a8a, 0.85));
const soleil = new THREE.DirectionalLight(0xfff4dc, 0.75);
soleil.position.set(25, 45, 20); soleil.castShadow = true; soleil.shadow.mapSize.set(2048, 2048);
Object.assign(soleil.shadow.camera, { left: -50, right: 50, top: 50, bottom: -50, near: 1, far: 140 });
scene.add(soleil, soleil.target);

const geoBloc = new THREE.BoxGeometry(1, 1, 1);
const mats = {};
const mat = c => mats[c] || (mats[c] = new THREE.MeshLambertMaterial({ color: c }));
function boite(c, w, h, d, x, y, z, parent) {
  const m = new THREE.Mesh(geoBloc, mat(c)); m.scale.set(w, h, d); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
  (parent || scene).add(m); return m;
}

/* ---------- The island (a grid of 2 m cells) ---------- */
const C = 2;
const cle = (i, k) => i + "," + k;
const terre = new Set();
const ILES = [{ i: 0, k: 0, r: 14.5 }, { i: 0, k: -19, r: 1.6 }, { i: 18, k: 4, r: 1.6 }];
for (const il of ILES) for (let i = Math.floor(il.i - il.r) - 1; i <= il.i + il.r + 1; i++) for (let k = Math.floor(il.k - il.r) - 1; k <= il.k + il.r + 1; k++)
  if (Math.hypot(i + .5 - (il.i + .5), k + .5 - (il.k + .5)) <= il.r) terre.add(cle(i, k));
const estTerre = (x, z) => terre.has(cle(Math.floor(x / C), Math.floor(z / C)));
const bordure = (i, k) => !terre.has(cle(i + 1, k)) || !terre.has(cle(i - 1, k)) || !terre.has(cle(i, k + 1)) || !terre.has(cle(i, k - 1));
(function dessinerIle() {
  const liste = [...terre].map(s => s.split(",").map(Number));
  const herbe = new THREE.InstancedMesh(geoBloc, new THREE.MeshLambertMaterial({ color: 0xffffff }), liste.length);
  const sous = new THREE.InstancedMesh(geoBloc, mat(0x8a6240), liste.length);
  const m = new THREE.Matrix4(), col = new THREE.Color();
  liste.forEach(([i, k], n) => {
    m.makeScale(C, .5, C); m.setPosition(i * C + 1, -.25, k * C + 1); herbe.setMatrixAt(n, m);
    const sable = bordure(i, k), v = ((i * 7 + k * 13) % 5) / 60;
    col.setHex(sable ? 0xe8d39a : 0x5fae4e); col.offsetHSL(0, 0, sable ? v / 2 : v - .03); herbe.setColorAt(n, col);
    m.makeScale(C, 2.5, C); m.setPosition(i * C + 1, -1.75, k * C + 1); sous.setMatrixAt(n, m);
  });
  herbe.receiveShadow = true; sous.receiveShadow = true; scene.add(herbe, sous);
})();
const eau = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshLambertMaterial({ color: 0x4f9ed8, transparent: true, opacity: .88 }));
eau.rotation.x = -Math.PI / 2; eau.position.y = -.9; scene.add(eau);
const fondMer = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), mat(0x2d6f9e)); fondMer.rotation.x = -Math.PI / 2; fondMer.position.y = -5; scene.add(fondMer);
for (let n = 0; n < 12; n++) {
  const g = new THREE.Group();
  for (let q = 0; q < 4; q++) { const b = new THREE.Mesh(geoBloc, mat(0xffffff)); b.scale.set(3 + (n * 7 + q * 3) % 4, 1.2, 2 + (n + q) % 3); b.position.set(q * 2 - 3, (q % 2) * .6, (q % 3) - 1); g.add(b); }
  const a = n / 12 * Math.PI * 2; g.position.set(Math.cos(a) * (70 + n % 3 * 15), 34 + n % 4 * 3, Math.sin(a) * (70 + n % 3 * 15)); scene.add(g);
}

/* ---------- Solid boxes: rocks, trees, built pieces (aligned boxes, like the other block games) ---------- */
const blocs = [];
function solide(x, z, w, d, bas, haut, info) { const b = Object.assign({ x, z, w, d, y: (bas + haut) / 2, h: haut - bas }, info || {}); blocs.push(b); return b; }
const enlever = b => { const i = blocs.indexOf(b); if (i >= 0) blocs.splice(i, 1); };
const occupe = new Map();   /* "i,k,level" -> what is there */
const cleN = (i, k, n) => i + "," + k + "," + n;

/* Stone columns (the chests sit on top) */
function colonne(i, k, niveaux) {
  for (let n = 0; n < niveaux; n++) {
    boite(n % 2 ? 0x8f9aa6 : 0x9aa5b1, C, C, C, i * C + 1, n * C + 1, k * C + 1);
    occupe.set(cleN(i, k, n), { type: "roche" });
  }
  solide(i * C + 1, k * C + 1, C, C, -1, niveaux * C, { type: "roche" });
}
colonne(-6, 2, 2);   /* chest 2: 4 m high */
colonne(7, -5, 3);   /* chest 4: 6 m high */
colonne(18, 4, 1);   /* chest 5: on the far islet, 2 m high */

/* Trees and rocks to harvest */
const ressources = [];
function arbre(i, k) {
  const g = new THREE.Group(), x = i * C + 1, z = k * C + 1;
  const sorte = (i * 3 + k * 5) & 1;
  if (sorte) {   /* fir tree: a trunk and three stacked layers of needles */
    boite(0x6b4423, .45, 1.4, .45, 0, .7, 0, g);
    boite(0x2f7d4a, 2.2, .9, 2.2, 0, 1.75, 0, g); boite(0x358a52, 1.6, .9, 1.6, 0, 2.6, 0, g); boite(0x3d9a5c, 1, .9, 1, 0, 3.45, 0, g); boite(0x47a865, .45, .5, .45, 0, 4.1, 0, g);
  } else {       /* leafy tree: a trunk and a round crown, wider in the middle */
    boite(0x7a5130, .5, 2.4, .5, 0, 1.2, 0, g);
    boite(0x3f8f45, 1.8, .6, 1.8, 0, 2.3, 0, g); boite(0x47994c, 2.4, .8, 2.4, 0, 2.95, 0, g); boite(0x52a656, 1.8, .7, 1.8, 0, 3.65, 0, g); boite(0x5cb35f, 1, .4, 1, 0, 4.15, 0, g);
  }
  g.rotation.y = ((i * 7 + k * 11) % 4) * Math.PI / 2; g.position.set(x, 0, z); scene.add(g);
  ressources.push({ type: "arbre", g, x, z, i, k, gain: 3, present: true, b: solide(x, z, .6, .6, 0, 4.2, { type: "arbre" }) });
  occupe.set(cleN(i, k, 0), { type: "arbre" });
}
function rocher(i, k) {
  const g = new THREE.Group(), x = i * C + 1, z = k * C + 1;
  boite(0x8b949e, 1.4, .9, 1.2, 0, .45, 0, g); boite(0xa3acb5, .9, .6, .8, .25, 1.05, .1, g);
  g.position.set(x, 0, z); scene.add(g);
  ressources.push({ type: "rocher", g, x, z, i, k, gain: 3, present: true, b: solide(x, z, 1.4, 1.2, 0, 1.3, { type: "rocher" }) });
  occupe.set(cleN(i, k, 0), { type: "rocher" });
}
[[-3, 6], [3, 9], [-9, 7], [-11, -2], [-4, -7], [3, -9], [10, 3], [11, -1], [-7, 11], [8, 9], [-12, 4], [5, -12], [-2, -12], [12, -6]].forEach(([i, k]) => arbre(i, k));
[[-2, 3], [6, 1], [-8, -5], [1, -5], [9, 7], [-5, 10], [-10, -8]].forEach(([i, k]) => rocher(i, k));

/* The 5 chests */
const coffres = [];
function coffre(i, k, n, aide) {
  const g = new THREE.Group(), x = i * C + 1, z = k * C + 1, y = n * C;
  boite(0x9c5a24, 1.3, .8, .9, 0, .4, 0, g); boite(0xd9a53a, 1.34, .14, .94, 0, .55, 0, g);
  const couvercle = new THREE.Group(); couvercle.position.set(0, .8, -.45); g.add(couvercle);
  boite(0xb06a2c, 1.3, .3, .9, 0, .15, .45, couvercle); boite(0xffd34d, .2, .26, .06, 0, .05, .92, couvercle);
  const signe = new THREE.Mesh(new THREE.OctahedronGeometry(.35), new THREE.MeshLambertMaterial({ color: 0xffd34d, emissive: 0x6b4a00 }));
  signe.position.y = 2.2; g.add(signe);
  g.position.set(x, y, z); scene.add(g);
  coffres.push({ g, couvercle, signe, x, y, z, ouvert: false, aide, b: solide(x, z, 1.3, .9, y, y + .8, { type: "coffre" }) });
}
coffre(2, 3, 0, "Approche-toi et appuie sur E pour ouvrir le coffre.");
coffre(-6, 2, 2, "Ce coffre est en haut du rocher (4 m). Construis une rampe 📐, monte dessus, puis construis une deuxième rampe devant toi.");
coffre(0, -19, 0, "Ce coffre est sur la petite île. Construis des planchers 🟫 sur l’eau pour traverser.");
coffre(7, -5, 3, "Ce coffre est tout en haut de la tour (6 m). Il faut 3 rampes 📐, l’une après l’autre.");
coffre(18, 4, 1, "Ce coffre est sur l’île de l’est, en haut d’un rocher. Des planchers 🟫 pour traverser, puis une rampe 📐 pour monter.");
const TOTAL = coffres.length;

/* ---------- Player ---------- */
const avatar = new THREE.Group(); scene.add(avatar);
const corps = new THREE.Group(); avatar.add(corps);
const cube = (w, h, d, c, x, y, z, parent) => boite(c, w, h, d, x, y, z, parent || corps);
const jambeG = new THREE.Group(), jambeD = new THREE.Group(), brasG = new THREE.Group(), brasD = new THREE.Group();
jambeG.position.set(-.17, .75, 0); jambeD.position.set(.17, .75, 0); brasG.position.set(-.45, 1.45, 0); brasD.position.set(.45, 1.45, 0);
corps.add(jambeG, jambeD, brasG, brasD);
cube(.3, .75, .3, 0x2f4f8f, 0, -.375, 0, jambeG); cube(.3, .75, .3, 0x2f4f8f, 0, -.375, 0, jambeD);
cube(.25, .7, .25, 0xf2c79e, 0, -.35, 0, brasG); cube(.25, .7, .25, 0xf2c79e, 0, -.35, 0, brasD);
cube(.65, .75, .38, 0x6f45b8, 0, 1.12, 0); cube(.5, .5, .5, 0xf2c79e, 0, 1.78, 0); cube(.54, .14, .54, 0x6b3f1f, 0, 2.06, 0);
cube(.08, .08, .02, 0x16324f, -.11, 1.82, .26); cube(.08, .08, .02, 0x16324f, .11, 1.82, .26); cube(.18, .04, .02, 0x8a3a2f, 0, 1.68, .26);
const marteau = new THREE.Group(); brasD.add(marteau); marteau.position.set(0, -.7, .1);
cube(.08, .5, .08, 0x7a5130, 0, 0, .15, marteau); cube(.3, .14, .14, 0x9aa5b1, 0, .22, .15, marteau);
/* Characters, accessories and tools bought with stars (shared by the block games) */
Personnages.init({ jeu: "tempete", corps, jambeG, jambeD, brasG, brasD });
const ombre = new THREE.Mesh(new THREE.CircleGeometry(.42, 24), new THREE.MeshBasicMaterial({ color: 0x16324f, transparent: true, opacity: .28, depthWrite: false }));
ombre.rotation.x = -Math.PI / 2; scene.add(ombre);

const DEMI = .32, HAUT = 2.0, DEPART = { x: 1, y: 0, z: 13 };
const j = { x: DEPART.x, y: 0, z: DEPART.z, vx: 0, vy: 0, vz: 0, sol: true, coyote: 0, tampon: 0, angle: Math.PI, marche: 0, sur: { x: DEPART.x, y: 0, z: DEPART.z } };
const lacam = { yaw: 0, pitch: .45, dist: 10 };
let enJeu = false, enPause = false, fini = false, chrono = 0, materiaux = 6, coeurs = 5, nbOuverts = 0, nbPieces = 0, piece = null, lent = true;

/* ---------- Inputs ---------- */
const touches = { haut: false, bas: false, gauche: false, droite: false };
const CARTE = { ArrowUp: "haut", KeyW: "haut", KeyZ: "haut", ArrowDown: "bas", KeyS: "bas", ArrowLeft: "gauche", KeyA: "gauche", KeyQ: "gauche", ArrowRight: "droite", KeyD: "droite" };
const actif = () => enJeu && !enPause && !fini;
addEventListener("keydown", e => {
  if (e.target && /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
  if (e.code === "KeyP" || e.code === "Escape") { if (enJeu && !fini) basculerPause(); e.preventDefault(); return; }
  if (!actif()) return;
  const p = { Digit1: "mur", Digit2: "plancher", Digit3: "rampe", Numpad1: "mur", Numpad2: "plancher", Numpad3: "rampe" }[e.code];
  if (p) { choisirPiece(p); e.preventDefault(); return; }
  if (e.code === "KeyE") { agir(); e.preventDefault(); return; }
  if (e.code === "KeyB" || e.code === "Enter") { if (e.target && e.target.tagName === "BUTTON" && e.code === "Enter") return; construire(); e.preventDefault(); return; }
  if (e.code === "KeyX" || e.code === "Backspace") { enleverPiece(); e.preventDefault(); return; }
  if (e.code === "Space") { if (e.target && e.target.tagName === "BUTTON") return; j.tampon = .15; e.preventDefault(); return; }
  const k = CARTE[e.code]; if (!k) return; e.preventDefault(); touches[k] = true;
});
addEventListener("keyup", e => { const k = CARTE[e.code]; if (k) touches[k] = false; });
addEventListener("blur", () => { for (const k in touches) touches[k] = false; if (enJeu && !fini && !enPause) basculerPause(true); });
document.querySelectorAll(".pad button").forEach(b => {
  const k = b.dataset.k;
  b.addEventListener("pointerdown", e => { e.preventDefault(); touches[k] = true; b.setPointerCapture(e.pointerId); });
  const lacher = () => { touches[k] = false; }; b.addEventListener("pointerup", lacher); b.addEventListener("pointercancel", lacher); b.addEventListener("lostpointercapture", lacher);
});
let glisse = null;
canvas.addEventListener("pointerdown", e => { canvas.focus(); glisse = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener("pointermove", e => {
  if (!glisse) return;
  lacam.yaw -= (e.clientX - glisse.x) * .006; lacam.pitch = Math.max(.12, Math.min(1.15, lacam.pitch + (e.clientY - glisse.y) * .004)); glisse = { x: e.clientX, y: e.clientY };
});
canvas.addEventListener("pointerup", () => { glisse = null; });
canvas.addEventListener("wheel", e => { e.preventDefault(); lacam.dist = Math.max(5, Math.min(22, lacam.dist + e.deltaY * .01)); }, { passive: false });
document.querySelectorAll(".tp-piece").forEach(b => b.addEventListener("click", () => { if (actif()) choisirPiece(b.dataset.piece); canvas.focus(); }));
$("btnAgir").onclick = () => { if (actif()) agir(); canvas.focus(); };
$("btnConstruire").onclick = () => { if (actif()) construire(); canvas.focus(); };
$("btnEnlever").onclick = () => { if (actif()) enleverPiece(); canvas.focus(); };
$("btnSauter").onclick = () => { if (actif()) j.tampon = .15; canvas.focus(); };

/* ---------- Physics ---------- */
const chevauche = (b, x, y, z) => x + DEMI > b.x - b.w / 2 && x - DEMI < b.x + b.w / 2 && z + DEMI > b.z - b.d / 2 && z - DEMI < b.z + b.d / 2 && y + HAUT > b.y - b.h / 2 && y < b.y + b.h / 2;
const dessus = b => b.y + b.h / 2;
function bougerAxe(axe, pas) {
  if (!pas) return; j[axe] += pas;
  for (const b of blocs) {
    if (!chevauche(b, j.x, j.y, j.z)) continue;
    if (dessus(b) - j.y <= .55 && j.vy <= .01) { j.y = dessus(b); continue; }   /* small step: climb it (ramps are made of steps) */
    const c = axe === "x" ? b.x : b.z, t = (axe === "x" ? b.w : b.d) / 2;
    j[axe] = pas > 0 ? c - t - DEMI - .001 : c + t + DEMI + .001; if (axe === "x") j.vx = 0; else j.vz = 0;
  }
}
function solSous(x, y, z) {
  let s = estTerre(x, z) ? 0 : -50;
  for (const b of blocs) {
    if (x + DEMI * .7 > b.x - b.w / 2 && x - DEMI * .7 < b.x + b.w / 2 && z + DEMI * .7 > b.z - b.d / 2 && z - DEMI * .7 < b.z + b.d / 2) {
      const t = dessus(b); if (t <= y + .05 && t > s) s = t;
    }
  }
  return s;
}
function plafond(x, y, z) {
  for (const b of blocs) if (chevauche(b, x, y, z) && b.y - b.h / 2 > y + .5) return b.y - b.h / 2;
  return Infinity;
}

/* ---------- Storm ---------- */
const ETAPES = [60, 44, 30, 17, 7];
const tempete = { r: ETAPES[0], etape: 0, phase: "attente", t: 0, degat: 0 };
const regle = () => lent ? { attente: 80, retrecit: 35, fin: 40, degat: 3, vent: 55, force: 2.4 } : { attente: 45, retrecit: 22, fin: 25, degat: 2, vent: 36, force: 3.4 };
const murTempete = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 60, 64, 1, true), new THREE.MeshBasicMaterial({ color: 0x8a5ad8, transparent: true, opacity: .33, side: THREE.DoubleSide, depthWrite: false }));
murTempete.position.y = 20; scene.add(murTempete);
const bordTempete = new THREE.Mesh(new THREE.TorusGeometry(1, .012, 6, 96), new THREE.MeshBasicMaterial({ color: 0xe0ccff }));
bordTempete.rotation.x = Math.PI / 2; bordTempete.position.y = .3; scene.add(bordTempete);
function majTempete(dt) {
  const R = regle(); tempete.t += dt;
  if (tempete.phase === "attente" && tempete.t >= R.attente) { tempete.phase = "retrecit"; tempete.t = 0; dire("🌀 La tempête avance ! Reste dans le cercle.", 3000); }
  else if (tempete.phase === "retrecit") {
    const a = ETAPES[tempete.etape], b = ETAPES[tempete.etape + 1], p = Math.min(1, tempete.t / R.retrecit);
    tempete.r = a + (b - a) * p;
    if (p >= 1) { tempete.etape++; tempete.t = 0; tempete.phase = tempete.etape >= ETAPES.length - 1 ? "fin" : "attente"; }
  } else if (tempete.phase === "fin" && tempete.t >= R.fin) { terminer(); return; }
  murTempete.scale.set(tempete.r, 1, tempete.r); bordTempete.scale.set(tempete.r, tempete.r, tempete.r);
  const assombri = tempete.etape / (ETAPES.length - 1); scene.background.copy(CIEL).lerp(CIEL_ORAGE, assombri * .8); scene.fog.color.copy(scene.background);
  /* Outside the circle: lose a heart now and then */
  if (Math.hypot(j.x, j.z) > tempete.r) {
    tempete.degat += dt;
    if (tempete.degat >= R.degat) {
      tempete.degat = 0; coeurs--; majCompteurs(); const c = $("coeurs").parentNode; c.classList.remove("coeur-perdu"); void c.offsetWidth; c.classList.add("coeur-perdu"); son([60, 55], "triangle", .12, .12);
      if (coeurs <= 0) { coeurs = 5; j.x = 0; j.z = 1; j.y = solSous(0, 20, 1); j.vx = j.vz = j.vy = 0; majCompteurs(); dire("La tempête t’a rattrapé ! Tu repars au centre de l’île, avec tes 5 cœurs.", 3500); }
      else dire("Tu es dans la tempête ! Reviens vite dans le cercle ❤️", 1800);
    }
  } else tempete.degat = 0;
  const reste = tempete.phase === "attente" ? Math.ceil(R.attente - tempete.t) : tempete.phase === "fin" ? Math.ceil(R.fin - tempete.t) : 0;
  $("phase").textContent = tempete.phase === "attente" ? "La tempête avance dans " + horlogeTxt(reste) : tempete.phase === "fin" ? "Fin de la tempête dans " + horlogeTxt(reste) : "🌀 La tempête avance !";
}
const horlogeTxt = s => Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");

/* ---------- Wind gusts: a wall (or a rock, a tree) on the windy side protects you ---------- */
const DIRS = [{ x: 0, z: 1 }, { x: 0, z: -1 }, { x: 1, z: 0 }, { x: -1, z: 0 }];
/* White streaks show where the wind comes from */
const traits = [];
for (let n = 0; n < 36; n++) { const m = new THREE.Mesh(geoBloc, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .7 })); m.visible = false; scene.add(m); traits.push({ m, u: Math.random() * 30 - 15, v: Math.random() * 24 - 12, h: .6 + Math.random() * 2.6 }); }
function majTraits(dt) {
  const on = vent.etat !== "calme" && vent.dir;
  for (const s of traits) {
    s.m.visible = !!on; if (!on) continue;
    s.u += dt * (vent.etat === "souffle" ? 16 : 7); if (s.u > 15) { s.u -= 30; s.v = Math.random() * 24 - 12; }
    const d = vent.dir; s.m.scale.set(d.x ? 1.8 : .07, .07, d.z ? 1.8 : .07);
    s.m.position.set(j.x + d.x * s.u - d.z * s.v, j.y + s.h, j.z + d.z * s.u + d.x * s.v); s.m.material.opacity = vent.etat === "souffle" ? .8 : .35;
  }
}
const vent = { t: 0, etat: "calme", dir: null, d: 0 };
function abrite() {
  const i = Math.floor(j.x / C), k = Math.floor(j.z / C), n = Math.max(0, Math.floor((j.y + .3) / C));
  const q = occupe.get(cleN(i - vent.dir.x, k - vent.dir.z, n));
  return !!q && q.type !== "plancher";
}
function majVent(dt) {
  const R = regle(); vent.t += dt;
  if (vent.etat === "calme" && vent.t >= R.vent) { vent.etat = "alerte"; vent.t = 0; vent.dir = DIRS[Math.floor(Math.random() * 4)]; afficherVent("💨 Un coup de vent arrive ! Regarde d’où viennent les traits blancs et cache-toi derrière un mur 🧱, un arbre ou un rocher."); }
  else if (vent.etat === "alerte" && vent.t >= 5) { vent.etat = "souffle"; vent.t = 0; son([50, 52, 50], "sawtooth", .05, .2); }
  else if (vent.etat === "souffle") {
    const ok = abrite();
    afficherVent(ok ? "🧱 Bien abrité ! Le vent ne te pousse pas." : "💨 Le vent te pousse ! Mets-toi derrière un mur.");
    if (!ok) { bougerAxe("x", vent.dir.x * R.force * dt); bougerAxe("z", vent.dir.z * R.force * dt); }
    if (vent.t >= 4) { vent.etat = "calme"; vent.t = 0; $("vent").hidden = true; }
  }
}
function afficherVent(t) { const v = $("vent"); if (v.textContent !== t) v.textContent = t; v.hidden = false; }

/* ---------- Building ---------- */
const COUT = { mur: 2, plancher: 1, rampe: 2 }, NOM = { mur: "un mur", plancher: "un plancher", rampe: "une rampe" };
const BOIS = 0xc9a27e, BOIS_FONCE = 0xa97c55;
const matFantome = { ok: new THREE.MeshLambertMaterial({ color: 0x5fd35a, transparent: true, opacity: .45, depthWrite: false }), non: new THREE.MeshLambertMaterial({ color: 0xe05a4a, transparent: true, opacity: .45, depthWrite: false }) };
function formeRampe() {   /* a wedge, 2 m long, 2 m high, rising toward -z */
  const s = new THREE.Shape(); s.moveTo(-C / 2, 0); s.lineTo(C / 2, 0); s.lineTo(-C / 2, C); s.lineTo(-C / 2, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: C, bevelEnabled: false }); g.translate(0, 0, -C / 2); g.rotateY(Math.PI / 2); return g;
}
const GEO = { mur: new THREE.BoxGeometry(C, C, C), plancher: new THREE.BoxGeometry(C, .4, C), rampe: formeRampe() };
const fantome = new THREE.Mesh(GEO.mur, matFantome.ok); fantome.visible = false; scene.add(fantome);
const poses = [];
function devant() {
  const a = Math.round(j.angle / (Math.PI / 2)) & 3;            /* 0: +z, 1: +x, 2: -z, 3: -x */
  const d = [{ x: 0, z: 1 }, { x: 1, z: 0 }, { x: 0, z: -1 }, { x: -1, z: 0 }][a];
  /* the cell you stand on is measured a little behind you, so the top end of a ramp still counts as that ramp */
  return { i: Math.floor((j.x - d.x * .45) / C) + d.x, k: Math.floor((j.z - d.z * .45) / C) + d.z, n: Math.max(0, Math.floor((j.y + .3) / C)), d, a };
}
function placeLibre(p) {
  if (occupe.has(cleN(p.i, p.k, p.n))) return false;
  const x = p.i * C + 1, z = p.k * C + 1;
  for (const c of coffres) if (Math.abs(c.x - x) < 1.5 && Math.abs(c.z - z) < 1.5 && Math.abs(c.y - p.n * C) < 1.5) return false;
  if (Math.hypot(x, z) > 60) return false;
  if (piece === "mur" && Math.abs(j.x - x) < C / 2 + DEMI && Math.abs(j.z - z) < C / 2 + DEMI && j.y < p.n * C + C && j.y + HAUT > p.n * C) return false;   /* not on top of the player */
  return true;
}
function majFantome() {
  if (!piece || !actif()) { fantome.visible = false; return; }
  const p = devant(), x = p.i * C + 1, z = p.k * C + 1, y = p.n * C;
  fantome.geometry = GEO[piece]; fantome.rotation.y = piece === "rampe" ? p.a * Math.PI / 2 : 0;
  fantome.position.set(x, piece === "mur" ? y + C / 2 : piece === "plancher" ? y - .2 : y, z);
  fantome.material = placeLibre(p) && materiaux >= COUT[piece] ? matFantome.ok : matFantome.non; fantome.visible = true;
}
function choisirPiece(p) {
  piece = piece === p ? null : p;
  document.querySelectorAll(".tp-piece").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.piece === piece)));
  if (piece) dire("🔨 " + NOM[piece][0].toUpperCase() + NOM[piece].slice(1) + " : regarde la forme verte devant toi, puis appuie sur B.", 2600);
  majFantome();
}
function construire() {
  if (!piece) { dire("Choisis d’abord une pièce : 1 mur, 2 plancher, 3 rampe.", 2400); return; }
  const p = devant();
  if (!placeLibre(p)) { dire("Il y a déjà quelque chose ici. Tourne-toi ou avance un peu.", 2200); son([50], "square", .06, .1); return; }
  if (materiaux < COUT[piece]) { dire("Pas assez de matériaux 🪵. Récolte un arbre 🌳 ou un rocher 🪨 (touche E).", 2800); son([50], "square", .06, .1); return; }
  materiaux -= COUT[piece]; nbPieces++;
  const x = p.i * C + 1, z = p.k * C + 1, y = p.n * C;
  const m = new THREE.Mesh(GEO[piece], mat(piece === "plancher" ? BOIS_FONCE : BOIS)); m.castShadow = true; m.receiveShadow = true;
  const pose = { type: piece, i: p.i, k: p.k, n: p.n, mesh: m, solides: [] };
  if (piece === "mur") { m.position.set(x, y + C / 2, z); pose.solides.push(solide(x, z, C, C, y, y + C, { type: "mur" })); }
  else if (piece === "plancher") { m.position.set(x, y - .2, z); pose.solides.push(solide(x, z, C, C, y - .4, y, { type: "plancher" })); }
  else {
    m.position.set(x, y, z); m.rotation.y = p.a * Math.PI / 2;
    for (let s = 0; s < 4; s++) {   /* four small steps of 0.5 m that you can walk up */
      const off = -C / 2 + C / 8 + s * C / 4;
      pose.solides.push(solide(x + p.d.x * off, z + p.d.z * off, p.d.x ? C / 4 : C, p.d.z ? C / 4 : C, y - .1, y + (s + 1) * C / 4, { type: "rampe" }));
    }
  }
  scene.add(m); poses.push(pose); occupe.set(cleN(p.i, p.k, p.n), pose);
  son([72, 76], "square", .05, .07); majCompteurs(); majFantome();
}
function enleverPiece() {
  const p = devant();
  let pose = poses.find(q => q.i === p.i && q.k === p.k && q.n === p.n) || poses.find(q => q.i === p.i && q.k === p.k && q.n === p.n - 1);
  if (!pose) { dire("Il n’y a pas de pièce construite devant toi.", 1800); return; }
  scene.remove(pose.mesh); pose.solides.forEach(enlever); occupe.delete(cleN(pose.i, pose.k, pose.n)); poses.splice(poses.indexOf(pose), 1);
  materiaux += COUT[pose.type]; nbPieces--; majCompteurs(); majFantome(); son([76, 72], "square", .05, .07);
}

/* ---------- Harvest and chests ---------- */
function procheCoffre() { return coffres.find(c => !c.ouvert && Math.hypot(c.x - j.x, c.z - j.z) < 2.3 && Math.abs(c.y - j.y) < 1.3); }
function procheRessource() {
  let best = null, dm = 2.6;
  for (const r of ressources) if (r.present && Math.abs(j.y) < 1.5) { const d = Math.hypot(r.x - j.x, r.z - j.z); if (d < dm) { dm = d; best = r; } }
  return best;
}
function agir() {
  const c = procheCoffre();
  if (c) { ouvrir(c); return; }
  const r = procheRessource();
  if (r) {
    r.present = false; r.g.visible = false; enlever(r.b); occupe.delete(cleN(r.i, r.k, 0));
    materiaux += r.gain; majCompteurs(); son([67, 71, 74], "triangle", .08, .06);
    dire("+" + r.gain + " matériaux 🪵 (" + (r.type === "arbre" ? "un arbre" : "un rocher") + ")", 1500);
    setTimeout(() => repousser(r), 40000);
    return;
  }
  dire("Approche-toi d’un arbre 🌳, d’un rocher 🪨 ou d’un coffre 🎁.", 2000);
}
function repousser(r) {
  if (fini || r.present) return;
  if (Math.hypot(r.x - j.x, r.z - j.z) < 1.5 || occupe.has(cleN(r.i, r.k, 0))) { setTimeout(() => repousser(r), 5000); return; }
  r.present = true; r.g.visible = true; blocs.push(r.b); occupe.set(cleN(r.i, r.k, 0), { type: r.type });
}
function ouvrir(c) {
  c.ouvert = true; nbOuverts++; c.signe.visible = false; enlever(c.b);
  c.ouvrant = 0; materiaux += 3; majCompteurs(); son([72, 76, 79, 84], "triangle", .1, .09);
  if (nbOuverts >= TOTAL) { dire("🎁 Les 5 coffres sont ouverts ! Bravo !", 2500); setTimeout(terminer, 1600); }
  else dire("🎁 Coffre ouvert ! (" + nbOuverts + " / " + TOTAL + ") Il contenait 3 matériaux 🪵.", 2600);
}
let dernierConseil = null;
function conseils() {
  const c = coffres.find(q => !q.ouvert && Math.hypot(q.x - j.x, q.z - j.z) < 9);
  if (c && c !== dernierConseil) { dernierConseil = c; dire(c.aide, 5000); }
  if (!c) dernierConseil = null;
  const r = procheCoffre() ? "🎁 Ouvrir" : procheRessource() ? "✋ Récolter" : "✋ Récolter";
  const b = $("btnAgir"); const txt = r + "<small>E</small>"; if (b.innerHTML !== txt) b.innerHTML = txt;
}

/* ---------- Update ---------- */
function mettreAJour(dt) {
  chrono += dt;
  let ix = (touches.droite ? 1 : 0) - (touches.gauche ? 1 : 0), iz = (touches.haut ? 1 : 0) - (touches.bas ? 1 : 0);
  const fx = -Math.sin(lacam.yaw), fz = -Math.cos(lacam.yaw), rx = Math.cos(lacam.yaw), rz = -Math.sin(lacam.yaw);
  let mx = fx * iz + rx * ix, mz = fz * iz + rz * ix; const n = Math.hypot(mx, mz), vmax = 5.2;
  if (n > 0) { mx /= n; mz /= n; j.angle = Math.atan2(mx, mz); }
  const lisse = Math.min(1, dt * (j.sol ? 14 : 5));
  const vOutil = vmax * Personnages.vitesse(); j.vx += (mx * vOutil - j.vx) * lisse; j.vz += (mz * vOutil - j.vz) * lisse;
  j.coyote = j.sol ? .12 : Math.max(0, j.coyote - dt); j.tampon = Math.max(0, j.tampon - dt);
  if (j.tampon > 0 && j.coyote > 0) { j.vy = 8.2; j.sol = false; j.coyote = 0; j.tampon = 0; son([67, 72], "triangle", .04, .05); }
  const ax = j.x, az = j.z;
  bougerAxe("x", j.vx * dt); bougerAxe("z", j.vz * dt);
  /* Walking does not make you fall off a ledge (top of a ramp, a rock, the shore): to go down, jump. */
  if (j.sol && j.tampon <= 0 && solSous(j.x, j.y + .05, j.z) < j.y - 1) { j.x = ax; j.z = az; j.vx = j.vz = 0; }
  j.vy -= 24 * dt; Personnages.physique(j, dt); const ny = j.y + j.vy * dt;
  if (j.vy > 0) { const p = plafond(j.x, j.y, j.z); if (ny + HAUT > p) { j.vy = 0; } else j.y = ny; }
  else {
    const s = solSous(j.x, j.y, j.z);
    if (ny <= s) { j.y = s; j.vy = 0; j.sol = true; } else { j.y = ny; j.sol = false; }
  }
  if (j.sol && j.y >= -.01 && Math.hypot(j.x, j.z) < tempete.r + 4) j.sur = { x: j.x, y: j.y, z: j.z };
  if (j.y < -1.4) { j.x = j.sur.x; j.y = j.sur.y + .1; j.z = j.sur.z; j.vx = j.vz = j.vy = 0; dire("Plouf ! 💦 Tu reviens au bord. Construis des planchers 🟫 pour traverser l’eau.", 2600); son([55, 50], "sine", .08, .1); }
  j.marche += Math.hypot(j.vx, j.vz) * dt * 2.2;
  majTempete(dt); if (fini) return; majVent(dt); majTraits(dt); conseils(); majFantome();
}
function placer(dt, t) {
  avatar.position.set(j.x, j.y, j.z);
  let da = j.angle - avatar.rotation.y; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI; avatar.rotation.y += da * Math.min(1, dt * 12);
  const bal = calme ? 0 : Math.sin(j.marche) * Math.min(1, Math.hypot(j.vx, j.vz) / 3) * .7;
  jambeG.rotation.x = bal; jambeD.rotation.x = -bal; brasG.rotation.x = -bal; brasD.rotation.x = bal;
  ombre.position.set(j.x, solSous(j.x, j.y + .01, j.z) + .03, j.z); ombre.visible = ombre.position.y > -10;
  for (const c of coffres) {
    if (!calme && !c.ouvert) { c.signe.rotation.y = t * 1.8; c.signe.position.y = 2.2 + Math.sin(t * 2.5) * .15; }
    if (c.ouvrant !== undefined && c.ouvrant < 1) { c.ouvrant = Math.min(1, c.ouvrant + dt * 2); c.couvercle.rotation.x = -c.ouvrant * 1.7; }
  }
  if (!enJeu) {
    const a = t * .08; camera.position.lerp(new THREE.Vector3(Math.sin(a) * 55, 34, Math.cos(a) * 55), Math.min(1, dt * 2)); camera.lookAt(0, 0, 0);
  } else {
    const cx = j.x + Math.sin(lacam.yaw) * lacam.dist * Math.cos(lacam.pitch), cz = j.z + Math.cos(lacam.yaw) * lacam.dist * Math.cos(lacam.pitch), cy = j.y + 1.4 + lacam.dist * Math.sin(lacam.pitch);
    camera.position.lerp(new THREE.Vector3(cx, cy, cz), Math.min(1, dt * 8)); camera.lookAt(j.x, j.y + 1.3, j.z);
  }
  soleil.position.set(j.x + 25, 45, j.z + 20); soleil.target.position.set(j.x, 0, j.z);
}
let avant = performance.now();
function boucle(maintenant) {
  const dt = Math.min(.05, (maintenant - avant) / 1000); avant = maintenant;
  if (actif()) mettreAJour(dt);
  if (!calme) eau.position.y = -.9 + Math.sin(maintenant / 900) * .05;
  placer(dt, maintenant / 1000); renderer.render(scene, camera); requestAnimationFrame(boucle);
}

/* ---------- Interface ---------- */
let minuterieMessage = null;
function dire(t, ms) { const m = $("message"); m.textContent = t; m.hidden = false; clearTimeout(minuterieMessage); minuterieMessage = setTimeout(() => { m.hidden = true; }, ms || 2000); }
function majCompteurs() {
  $("coffres").textContent = nbOuverts + " / " + TOTAL; $("materiaux").textContent = materiaux; $("coeurs").textContent = Math.max(0, coeurs) + " / 5";
  $("coffres").parentNode.style.setProperty("--p", Math.round(100 * nbOuverts / TOTAL) + "%"); $("coeurs").parentNode.style.setProperty("--p", coeurs * 20 + "%");
}
const temps = s => Math.floor(s / 60) + " min " + String(Math.floor(s % 60)).padStart(2, "0") + " s";
function basculerPause(force) {
  enPause = force !== undefined ? force : !enPause;
  $("btnPause").setAttribute("aria-pressed", String(enPause)); $("btnPause").textContent = enPause ? "▶ Reprendre" : "⏸ Pause";
  $("pausePanneau").hidden = !enPause; document.body.classList.toggle("en-pause", enPause); if (enPause) $("pReprendre").focus(); else { canvas.focus(); }
  for (const k in touches) touches[k] = false; majFantome();
}
const etoilesDe = n => n >= 5 ? 3 : n >= 3 ? 2 : n >= 1 ? 1 : 0;
function terminer() {
  if (fini) return;
  fini = true; enPause = false; $("vent").hidden = true; fantome.visible = false; document.body.classList.remove("en-jeu");
  const sc = etoilesDe(nbOuverts); Personnages.gagner(sc);
  $("plaqueFin").textContent = nbOuverts >= TOTAL ? "Bravo !" : "Fin de la tempête";
  $("titreFin").textContent = nbOuverts >= TOTAL ? "Tu as ouvert les 5 coffres !" : nbOuverts ? "La tempête est passée. Tu as ouvert " + nbOuverts + " coffre" + (nbOuverts > 1 ? "s" : "") + "." : "La tempête est passée.";
  $("finScore").textContent = "★".repeat(sc) + "☆".repeat(3 - sc);
  $("finCoffres").textContent = nbOuverts + " / " + TOTAL; $("finPieces").textContent = nbPieces; $("finTemps").textContent = temps(chrono);
  $("texteFin").textContent = nbOuverts >= TOTAL ? "Tu as récolté, construit et battu la tempête. Super travail !" : "Rejoue pour ouvrir les autres coffres : les rampes 📐 font monter, les planchers 🟫 font traverser l’eau." + (lent ? "" : " Tu peux aussi choisir la tempête lente 🐢.");
  const sv = $("finSauvegarde"); sv.textContent = "";
  if (sc > 0 && window.EC && EC.enregistrerNiveau) {
    sv.textContent = "Enregistrement du score…";
    EC.enregistrerNiveau({ activity: "jeu-tempete", level: 1, score: sc, total: 3, seconds: Math.min(86400, Math.round(chrono)) }).then(r => {
      sv.textContent = r && r.ok ? "✓ Score gardé dans ton espace." : r && r.raison === "invite" ? "Tu n'es pas connecté : connecte-toi pour garder ton score." : r && r.raison === "enseignante" ? "Compte enseignante : le score n'est pas enregistré." : "Le score n'a pas pu être enregistré. Réessaie plus tard.";
    }).catch(() => { sv.textContent = "Le score n'a pas pu être enregistré. Réessaie plus tard."; });
  }
  son([72, 76, 79, 84, 88], "triangle", .1, .12); $("fin").hidden = false; $("btnRejouer").focus();
}
function recommencer() {
  for (const p of poses.slice()) { scene.remove(p.mesh); p.solides.forEach(enlever); occupe.delete(cleN(p.i, p.k, p.n)); }
  poses.length = 0;
  for (const r of ressources) if (!r.present) { r.present = true; r.g.visible = true; blocs.push(r.b); occupe.set(cleN(r.i, r.k, 0), { type: r.type }); }
  for (const c of coffres) { if (c.ouvert) blocs.push(c.b); c.ouvert = false; c.signe.visible = true; c.ouvrant = undefined; c.couvercle.rotation.x = 0; }
  Object.assign(tempete, { r: ETAPES[0], etape: 0, phase: "attente", t: 0, degat: 0 }); Object.assign(vent, { t: 0, etat: "calme", dir: null }); traits.forEach(s => { s.m.visible = false; });
  materiaux = 6; coeurs = 5; nbOuverts = 0; nbPieces = 0; chrono = 0; fini = false; piece = null; dernierConseil = null;
  document.querySelectorAll(".tp-piece").forEach(b => b.setAttribute("aria-pressed", "false"));
  Object.assign(j, { x: DEPART.x, y: 0, z: DEPART.z, vx: 0, vy: 0, vz: 0, angle: Math.PI, sur: { ...DEPART } }); lacam.yaw = 0;
  scene.background.copy(CIEL); $("vent").hidden = true; $("message").hidden = true; $("fin").hidden = true; majCompteurs();
}
$("btnJouer").onclick = () => {
  lent = $("optTempete").value === "lente"; $("accueil").hidden = true; enJeu = true; document.body.classList.add("en-jeu"); basculerPause(false); canvas.focus();
  if (chrono === 0) dire("Le premier coffre 🎁 est juste devant toi. Avance avec ▲, puis appuie sur E.", 4500);
};
$("btnAide").onclick = () => { document.body.classList.remove("en-jeu"); $("accueil").hidden = false; $("btnJouer").textContent = "Reprendre"; enJeu = false; $("btnJouer").focus(); };
$("btnPause").onclick = () => { if (enJeu && !fini) basculerPause(); };
$("pReprendre").onclick = $("pFermer").onclick = () => basculerPause(false);
$("pRecommencer").onclick = () => { recommencer(); basculerPause(false); };
$("pAide").onclick = () => { basculerPause(false); $("btnAide").onclick(); };
$("btnRejouer").onclick = () => { recommencer(); enJeu = true; document.body.classList.add("en-jeu"); enPause = false; canvas.focus(); };

/* ---------- Sounds (short notes, only after a key or a click) ---------- */
let actx = null;
function son(notes, type, vol, ecart) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const t0 = actx.currentTime;
    notes.forEach((m, i) => { const o = actx.createOscillator(), g = actx.createGain(), t = t0 + i * ecart; o.type = type; o.frequency.value = 440 * Math.pow(2, (m - 69) / 12);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + ecart + .12); o.connect(g).connect(actx.destination); o.start(t); o.stop(t + ecart + .15); });
  } catch (e) {}
}

function redimensionner() { const w = innerWidth, h = innerHeight; lacam.dist = w / h < .8 ? 14 : 10; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener("resize", redimensionner); redimensionner();
majCompteurs(); murTempete.scale.set(tempete.r, 1, tempete.r); bordTempete.scale.set(tempete.r, tempete.r, tempete.r);
camera.position.set(0, 34, 55);
requestAnimationFrame(boucle);

/* For automatic tests */
window.TempeteDesBlocs = { j, coffres, ressources, poses, tempete, vent, touches, choisirPiece, construire, enleverPiece, agir, terminer, recommencer,
  etat: () => ({ enJeu, enPause, fini, materiaux, coeurs, nbOuverts, nbPieces, piece, lent, r: tempete.r, phase: tempete.phase }), sauterTemps: s => { tempete.t += s; }, pas: (s, n) => { for (let q = 0; q < (n || 1); q++) mettreAJour(s); } };
})();
