/* The block city: a 3D course in a small city (buildings, streets, canal, building site).
   Obstacles ("challenges") block the street: the student must choose the right item
   (plank, bridge, ladder, jump boots) or understand that none is needed.
   A 💡 hint announces each challenge. The piggy bank and items are the same as in the Calculation island.
   Levels: jeu.html?n=1 (4 challenges), 2 (6 challenges), 3 (8 challenges). 3D engine: ../ile/three.min.js (r128). */
(function () {
"use strict";
const $ = id => document.getElementById(id);
const PARAMS = new URLSearchParams(location.search);
const NIVEAU = Math.min(3, Math.max(1, parseInt(PARAMS.get("n"), 10) || 1));
const NOMS = { 1: "Niveau 1 · Débutant", 2: "Niveau 2 · Intermédiaire", 3: "Niveau 3 · Avancé" };
const memo = { lire(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
               ecrire(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };

/* ---------- Scene ---------- */
const canvas = $("scene");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9fd3f5);
scene.fog = new THREE.Fog(0x9fd3f5, 80, 210);
const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 400);
scene.add(new THREE.HemisphereLight(0xffffff, 0x6a7a8a, 0.85));
const soleil = new THREE.DirectionalLight(0xfff4dc, 0.75);
soleil.position.set(20, 40, 15); soleil.castShadow = true; soleil.shadow.mapSize.set(1024, 1024);
Object.assign(soleil.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 120 });
scene.add(soleil, soleil.target);
/* The ground under the city (only visible through the holes) */
const fond = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), new THREE.MeshLambertMaterial({ color: 0x3a4652 }));
fond.rotation.x = -Math.PI / 2; fond.position.y = -7; scene.add(fond);
const matNuage = new THREE.MeshLambertMaterial({ color: 0xffffff });
for (let i = 0; i < 16; i++) {
  const g = new THREE.Group();
  for (let k = 0; k < 4; k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(3 + Math.random() * 3, 1.2, 2 + Math.random() * 2), matNuage); b.position.set(k * 2 - 3, Math.random() * .8, Math.random() * 2 - 1); g.add(b); }
  g.position.set(Math.random() * 200 - 100, 34 + Math.random() * 12, Math.random() * -220 + 30); scene.add(g);
}

/* ---------- Blocks (can be walked on) ---------- */
const blocs = [];
const geoBloc = new THREE.BoxGeometry(1, 1, 1);
const mats = {};
const mat = c => mats[c] || (mats[c] = new THREE.MeshLambertMaterial({ color: c }));
function pilier(x, z, w, d, haut, couleur, opts) {
  const bas = -6, h = haut - bas;
  const m = new THREE.Mesh(geoBloc, mat(couleur)); m.scale.set(w, h, d); m.position.set(x, bas + h / 2, z); m.castShadow = true; m.receiveShadow = true; scene.add(m);
  const b = Object.assign({ mesh: m, w, d, h, x, z, y: bas + h / 2, type: "sol" }, opts || {}); blocs.push(b); return b;
}
function plaque(x, z, w, d, haut, couleur, opts) {
  const ep = .6, m = new THREE.Mesh(geoBloc, mat(couleur)); m.scale.set(w, ep, d); m.position.set(x, haut - ep / 2, z); m.castShadow = true; m.receiveShadow = true; scene.add(m);
  const b = Object.assign({ mesh: m, w, d, h: ep, x, z, y: haut - ep / 2, type: "sol" }, opts || {}); blocs.push(b); return b;
}
/* Invisible edge: stops the player leaving the street (the sides are sidewalks with a fence) */
function bordInvisible(z, d) {
  for (const x of [-6.3, 6.3]) { blocs.push({ mesh: null, w: .6, d, h: 30, x, z, y: 9, type: "bord" }); }
}
/* Scenery (no collision) */
function boite(c, w, h, d, x, y, z, ombre) { const m = new THREE.Mesh(geoBloc, mat(c)); m.scale.set(w, h, d); m.position.set(x, y, z); m.castShadow = ombre !== false; m.receiveShadow = true; scene.add(m); return m; }

const ROUTE = 0x5b6570, TROTTOIR = 0xc9cdd2, LIGNE = 0xf4f4f4, JAUNE = 0xf2c94c, CHANTIER = 0xf29a4a, BOIS = 0xc9a27e, BETON = 0xa9b1ba, EAU = 0x4f9ed8, OR = 0xe8c774;

/* Windows: a repeated texture on the building fronts */
function texFenetres(fondC, vitre) {
  const t = document.createElement("canvas"); t.width = 64; t.height = 64; const c = t.getContext("2d");
  c.fillStyle = fondC; c.fillRect(0, 0, 64, 64); c.fillStyle = vitre; c.fillRect(14, 12, 36, 34); c.fillStyle = "#ffffff55"; c.fillRect(14, 12, 36, 6);
  const tx = new THREE.CanvasTexture(t); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; return tx;
}
const FACADES = [["#d9c6a5", "#ffe08a"], ["#b9c9d9", "#8fc3ea"], ["#e3b3a6", "#ffe08a"], ["#c7d6c0", "#a9d6f5"], ["#d6cde6", "#ffe8a8"], ["#e8dcc8", "#9cc9ec"]];
let graine = 11; const hasard = () => (graine = (graine * 16807) % 2147483647) / 2147483647;
function immeuble(x, z, w, d, h, cote) {
  const [f, v] = FACADES[Math.floor(hasard() * FACADES.length)];
  const corps = boite(new THREE.Color(f).getHex(), w, h, d, x, h / 2, z);
  const tx = texFenetres(f, v); tx.repeat.set(Math.max(1, Math.round(w / 2)), Math.max(1, Math.round(h / 2.2)));
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w * .96, h * .9), new THREE.MeshLambertMaterial({ map: tx }));
  face.position.set(x + cote * (w / 2 + .02), h * .5, z); face.rotation.y = cote > 0 ? Math.PI / 2 : -Math.PI / 2; face.scale.x = d / w; scene.add(face);
  const face2 = new THREE.Mesh(new THREE.PlaneGeometry(d * .96, h * .9), new THREE.MeshLambertMaterial({ map: tx }));
  face2.position.set(x, h * .5, z + d / 2 + .02); scene.add(face2);
  boite(0x7d8894, w + .4, .5, d + .4, x, h + .25, z);
  if (hasard() < .4) boite(0x9aa6b2, 1.4, 1.4, 1.4, x + (hasard() - .5) * w * .5, h + 1.2, z);
}
function arbre(x, z) { boite(0x7a5130, .4, 1.6, .4, x, .8, z); boite(0x58a85c, 1.8, 1.6, 1.8, x, 2.3, z); boite(0x4b9a50, 1.1, .9, 1.1, x + .2, 3.3, z - .1); }
function lampadaire(x, z) { boite(0x4a5560, .2, 4, .2, x, 2, z); boite(0x4a5560, 1, .15, .2, x - Math.sign(x) * .4, 4, z); boite(0xfff2b0, .45, .2, .3, x - Math.sign(x) * .8, 3.9, z, false); }
const VOITURES = [], NOMS_COUL = { 0xe06b5a: "rouge", 0x5b8fd9: "bleue", 0xf2c94c: "jaune", 0x6fb58e: "verte", 0xffffff: "blanche" };
/* A real-looking parked car: rounded body, glass cabin, wheels with hubcaps, lights, bumpers and mirrors.
   Front faces -z (the direction of the course). Size about 1.9 m wide, 3.6 m long, 1.55 m high. */
const MAT_VOIT = {};
function matV(c, opt) { const k = c + "|" + (opt ? JSON.stringify(opt) : ""); return MAT_VOIT[k] || (MAT_VOIT[k] = new THREE.MeshLambertMaterial(Object.assign({ color: c }, opt || {}))); }
function profil(points) { const s = new THREE.Shape(); points.forEach(([a, b], i) => i ? s.lineTo(a, b) : s.moveTo(a, b)); return s; }
function extrude(shape, larg, bev) {
  const g = new THREE.ExtrudeGeometry(shape, { depth: larg - 2 * bev, bevelEnabled: bev > 0, bevelThickness: bev, bevelSize: bev, bevelSegments: 3, curveSegments: 10 });
  g.translate(0, 0, -(larg - 2 * bev) / 2); return g;
}
const GEO_VOIT = (() => {
  /* Side outline of the body (x = along the car, front at +x), with the two wheel arches. */
  const c = new THREE.Shape(), R = .44, xr = 1.12;
  c.moveTo(-1.78, .26); c.lineTo(-1.8, .62); c.quadraticCurveTo(-1.79, .86, -1.6, .9); c.lineTo(-1.1, .92);
  c.lineTo(1.0, .92); c.quadraticCurveTo(1.55, .86, 1.76, .74); c.quadraticCurveTo(1.82, .6, 1.8, .4); c.lineTo(1.76, .26);
  c.lineTo(xr + R, .26); c.absarc(xr, .26, R, 0, Math.PI, false); c.lineTo(-xr + R, .26); c.absarc(-xr, .26, R, 0, Math.PI, false); c.lineTo(-1.78, .26);
  const verre = profil([[-1.22, .9], [-.82, 1.42], [.38, 1.44], [1.02, .9]]);
  return {
    corps: extrude(c, 1.86, .07),
    verre: extrude(verre, 1.66, .03),
    toit: extrude(profil([[-.86, 1.4], [-.8, 1.5], [.38, 1.52], [.46, 1.42]]), 1.7, .04),
    pneu: new THREE.CylinderGeometry(.38, .38, .3, 20),
    jante: new THREE.CylinderGeometry(.22, .22, .32, 14),
    unite: new THREE.BoxGeometry(1, 1, 1)
  };
})();
function voitureMesh(c) {
  const g = new THREE.Group(), rot = new THREE.Group(); rot.rotation.y = Math.PI / 2; g.add(rot); /* shape +x -> world -z */
  const add = (geo, m, x, y, z, sx, sy, sz, ombre) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); if (sx) o.scale.set(sx, sy, sz); o.castShadow = ombre !== false; o.receiveShadow = true; rot.add(o); return o; };
  const peinture = matV(c), noir = matV(0x1d2126), gris = matV(0xb9c0c8), vitre = matV(0x23384d, { emissive: 0x0b1724 });
  add(GEO_VOIT.corps, peinture, 0, 0, 0);
  add(GEO_VOIT.verre, vitre, 0, 0, 0);
  add(GEO_VOIT.toit, peinture, 0, 0, 0);
  add(GEO_VOIT.unite, peinture, -.24, 1.17, 0, .1, .5, 1.68);              /* middle pillar */
  for (const [x, y] of [[1.12, .38], [-1.12, .38]]) for (const z of [-.8, .8]) {
    const p = add(GEO_VOIT.pneu, noir, x, y, z); p.rotation.x = Math.PI / 2;
    const r = add(GEO_VOIT.jante, gris, x, y, z, 0, 0, 0, false); r.rotation.x = Math.PI / 2;
  }
  add(GEO_VOIT.unite, noir, 1.82, .36, 0, .14, .2, 1.8);                    /* front bumper */
  add(GEO_VOIT.unite, noir, -1.83, .36, 0, .14, .2, 1.8);                   /* rear bumper */
  add(GEO_VOIT.unite, matV(0x2a2f36), 1.84, .58, 0, .06, .16, .9, false);   /* grille */
  for (const z of [-.66, .66]) {
    add(GEO_VOIT.unite, matV(0xfffbe6, { emissive: 0x8a8460 }), 1.86, .66, z, .08, .16, .36, false);  /* headlights */
    add(GEO_VOIT.unite, matV(0xd8312a, { emissive: 0x5a0d0a }), -1.87, .7, z, .06, .14, .34, false);  /* tail lights */
    add(GEO_VOIT.unite, peinture, .74, .98, z * 1.48, .16, .12, .12);       /* mirrors */
    add(GEO_VOIT.unite, gris, -.1, .74, z * 1.43, .22, .04, .03, false);   /* door handles */
  }
  add(GEO_VOIT.unite, matV(0xf4f4f0), -1.91, .5, 0, .03, .14, .44, false);  /* number plate */
  add(GEO_VOIT.unite, matV(0xf4f4f0), 1.9, .4, 0, .03, .12, .4, false);
  return g;
}
function voiture(x, z) { const c = [0xe06b5a, 0x5b8fd9, 0xf2c94c, 0x6fb58e, 0xffffff][Math.floor(hasard() * 5)]; VOITURES.push({ z, couleur: NOMS_COUL[c] }); const v = voitureMesh(c); v.position.set(x, 0, z); scene.add(v); }
function feu(x, z) { boite(0x3a4450, .2, 3.2, .2, x, 1.6, z); boite(0x222a33, .5, 1.3, .4, x, 3.6, z); boite(0xe05a4a, .3, .3, .1, x, 4, z + .22, false); boite(0xf2c94c, .3, .3, .1, x, 3.6, z + .22, false); boite(0x5fd35a, .3, .3, .1, x, 3.2, z + .22, false); }
/* Neighbourhood on both sides of a stretch of street (from z0 to z1, z1 < z0) */
function quartier(z0, z1) {
  const long = z0 - z1, zm = (z0 + z1) / 2;
  for (const s of [-1, 1]) {
    boite(TROTTOIR, 2, .3, long, s * 7, -.15, zm, false);
    boite(0xb2b8bf, 26, 6, long, s * 21, -3.15, zm, false); boite(0xd8dde2, 26, .3, long, s * 21, -.15, zm, false);
    boite(0x8a96a3, .15, 1, long, s * 6.1, .5, zm, false); /* small fence at the edge of the street */
    let z = z0 - 1;
    while (z - 4 > z1) { const w = 5 + hasard() * 4, d = Math.min(z - z1 - 1, 5 + hasard() * 4), h = 6 + hasard() * 18;
      if (d < 3) break; immeuble(s * (11 + w / 2), z - d / 2, w, d, h, -s); z -= d + 1.5; }
    for (let k = z0 - 3; k > z1 + 1; k -= 7) { if (hasard() < .6) arbre(s * 8.2, k); else lampadaire(s * 6.6, k); }
  }
}

/* ---------- The course ---------- */
const etoiles = [], drapeaux = [], sections = [], defis = [];
let zc = 5, nDrapeau = 0;
function etoile(x, y, z) {
  const forme = new THREE.Shape();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? .22 : .5; const px = Math.cos(a) * r, py = Math.sin(a) * r; i ? forme.lineTo(px, py) : forme.moveTo(px, py); }
  const geo = new THREE.ExtrudeGeometry(forme, { depth: .16, bevelEnabled: false }); geo.center();
  const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: OR, emissive: 0x6b4a00 })); m.position.set(x, y + 1.1, z); m.castShadow = true; scene.add(m);
  etoiles.push({ m, x, y: y + 1.1, z, prise: false });
}
function drapeau(x, haut, z) {
  nDrapeau++; const g = new THREE.Group();
  const mt = new THREE.Mesh(new THREE.BoxGeometry(.18, 3, .18), mat(0xffffff)); mt.position.y = 1.5; g.add(mt);
  const tissu = new THREE.Mesh(new THREE.BoxGeometry(1.3, .8, .08), mat(0xe58f7b)); tissu.position.set(.72, 2.55, 0); g.add(tissu);
  g.position.set(x, haut, z); scene.add(g); drapeaux.push({ x, y: haut, z, n: nDrapeau, tissu, atteint: false });
}
function route(long, nEtoiles) {
  const z0 = zc, z1 = zc - long;
  pilier(0, (z0 + z1) / 2, 12, long, 0, ROUTE); bordInvisible((z0 + z1) / 2, long);
  for (let z = z0 - 1.5; z > z1 + 1; z -= 4) boite(LIGNE, .25, .04, 2, 0, .02, z, false);
  for (const s of [-1, 1]) boite(TROTTOIR, 1.6, .06, long, s * 5.2, .03, (z0 + z1) / 2, false);
  quartier(z0, z1);
  for (let k = 0; k < (nEtoiles || 0); k++) etoile([-2.5, 2.5, 0][k % 3], 0, z0 - long * (k + 1) / ((nEtoiles || 0) + 1));
  if (long >= 8 && hasard() < .5) { const zv = z0 - long * .5; voiture(-4.1, zv); blocs.push({ mesh: null, w: 1.8, d: 3.6, h: 1.7, x: -4.1, z: zv, y: .85, type: "sol" }); }
  zc = z1;
}
/* ---------- The challenges ----------
   Measurements in metres (1 block = 1 m). You jump about 5 m far and 2 m high;
   with the jump boots: about 7 m far and 3.5 m high. */
const OBJETS = [
  { id: "planche", ico: "🪵", nom: "Planche", prix: 3, mesure: "Pour traverser un trou. 10 m.", txt: "Pour traverser un trou. Elle fait 10 m." },
  { id: "echelle", ico: "🪜", nom: "Échelle", prix: 5, mesure: "Pour monter. 6 m.", txt: "Pour monter très haut. Elle fait 6 m." },
  { id: "pont", ico: "🌉", nom: "Pont", prix: 6, mesure: "Pour traverser l’eau. 16 m.", txt: "Pour traverser l’eau ou un très grand trou. Il fait 16 m." },
  { id: "bottes", ico: "👟", nom: "Bottes de saut", prix: 8, mesure: "Pour sauter plus loin.", txt: "Pour sauter plus loin et plus haut. Tu les gardes jusqu’à la fin." },
  { id: "casquette", ico: "🧢", nom: "Casquette", prix: 10, txt: "Pour ton personnage. Elle est à toi pour toujours.", tenue: true },
  { id: "cape", ico: "🦸", nom: "Cape", prix: 15, txt: "Pour ton personnage. Elle est à toi pour toujours.", tenue: true }];
const OUTILS = OBJETS.filter(o => !o.tenue);
const nomObj = id => OBJETS.find(o => o.id === id);
const ART = { planche: "la planche", echelle: "l’échelle", pont: "le pont", bottes: "les bottes de saut" };
const leLa = id => ({ planche: "ta planche", echelle: "ton échelle", pont: "ton pont", bottes: "tes bottes" })[id];
const SAIS = "🦘 Tu sautes 5 m de loin et 2 m de haut.";

function marqueur(x, y, z) {
  const t = document.createElement("canvas"); t.width = 128; t.height = 128; const c = t.getContext("2d");
  c.fillStyle = "#ffd36b"; c.strokeStyle = "#6b4a00"; c.lineWidth = 8; c.beginPath(); c.arc(64, 64, 54, 0, 7); c.fill(); c.stroke();
  c.fillStyle = "#6b4a00"; c.font = "bold 84px Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("!", 64, 70);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(t), depthTest: false })); sp.scale.set(1.8, 1.8, 1); sp.position.set(x, y, z); sp.visible = false; scene.add(sp); return sp;
}
function cone(x, z) { boite(CHANTIER, .6, .9, .6, x, .45, z); boite(0xffffff, .5, .15, .5, x, .55, z, false); }
/* A hole in the street (width L): small hole, building-site hole or canal */
function trou(type, L) {
  const zA = zc, zB = zc - L, zm = (zA + zB) / 2;
  if (type === "canal") { boite(EAU, 40, .3, L, 0, -4.2, zm, false); for (const z of [zA, zB]) boite(BETON, 40, 4.2, .6, 0, -2.1, z + (z === zA ? -.3 : .3), false); }
  else { boite(0x6b5440, 12, .3, L, 0, -5.6, zm, false); for (const x of [-4, -1.3, 1.3, 4]) { cone(x, zA + .6); cone(x, zB - .6); } }
  /* the sidewalks are cut too: the hole is visible from one edge to the other */
  return { zA, zB, zm, L };
}
function defi(type) {
  route(9, 2);
  const d = { type, k: defis.length, resolu: false, choisi: false, essais: new Set() };
  if (type === "petit") { const t = trou("petit", 3); Object.assign(d, t, { besoin: () => null, nom: "Un petit trou", ico: "🕳️",
    texte: "Il fait 3 m." }); zc = t.zB; }
  if (type === "trou") { const t = trou("trou", 8.5); Object.assign(d, t, { besoin: () => "planche", nom: "Un trou de chantier", ico: "🚧",
    texte: "C’est un grand trou.\nIl fait 8 m 50." }); zc = t.zB; }
  if (type === "canal") { const t = trou("canal", 14); Object.assign(d, t, { besoin: () => "pont", nom: "Le canal", ico: "🌊",
    texte: "C’est de l’eau.\nIl fait 14 m." }); zc = t.zB; }
  if (type === "barriere") { const zA = zc; pilier(0, zA - .5, 12, 1, 1.2, JAUNE); bordInvisible(zA - .5, 1);
    for (let x = -5.5; x < 6; x += 1.5) boite(0x222a33, .6, 1.22, 1.02, x, .6, zA - .5, false);
    Object.assign(d, { zA, zB: zA - 1, zm: zA - .5, L: 1, besoin: () => null, nom: "Une barrière", ico: "🚧", texte: "Elle fait 1 m 20 de haut." }); zc = zA - 1; route(4, 0); }
  if (type === "mur") { const zA = zc; pilier(0, zA - 1.5, 12, 3, 5.5, CHANTIER); bordInvisible(zA - 1.5, 3);
    for (const s of [-1, 1]) boite(CHANTIER, 26, 5.5, 3, s * 19, 2.75, zA - 1.5);
    for (let x = -5; x <= 5; x += 2.5) boite(0xffffff, 1, 4.6, .05, x, 2.75, zA + .03, false);
    Object.assign(d, { zA, zB: zA - 3, zm: zA - 1.5, L: 3, haut: 5.5, besoin: () => "echelle", nom: "Le mur du chantier", ico: "🧱", texte: "C’est un très haut mur.\nIl fait 5 m 50 de haut." });
    zc = zA - 3; }
  if (type === "tranchees") { const zA = zc; let z = zA;
    for (let k = 0; k < 3; k++) { trou("petit", 6.2); z -= 6.2; zc = z; if (k < 2) { pilier(0, z - 1.5, 12, 3, 0, BETON); bordInvisible(z - 1.5, 3); z -= 3; zc = z; } }
    Object.assign(d, { zA, zB: zc, zm: (zA + zc) / 2, L: zA - zc, besoin: () => opts.bottes ? null : "bottes", nom: "Trois tranchées", ico: "🦘",
      texte: "3 trous, l’un après l’autre.\nChaque trou fait 6 m 20." }); }
  d.marque = marqueur(0, (d.haut || 0) + 4, d.zm);
  defis.push(d); sections.push({ nom: d.nom, z: d.zA + 9 });
  route(6, 1); drapeau(-3, 0, zc + 3);
  return d;
}
/* Why an item does not fit (or is not needed) */
function pourquoi(d, id) {
  if (!d.besoin()) {
    if (d.type === "tranchees") return "Tu as déjà tes bottes 👟.\nTu peux sauter !";
    if (d.type === "petit") return "3 m, c’est petit.\nTu sautes 5 m.\nTu peux sauter ! Garde ton objet.";
    return "1 m 20, c’est bas.\nTu sautes 2 m de haut.\nTu peux sauter ! Garde ton objet.";
  }
  const T = {
    trou: { sans: "8 m 50, c’est trop loin.\nTu sautes seulement 5 m.", echelle: "L’échelle sert à monter.\nIci, il faut traverser.", bottes: "Avec les bottes : 7 m.\nLe trou fait 8 m 50.\nC’est trop loin.", pont: "Le pont, c’est pour l’eau.\nPour un trou, prends la planche." },
    canal: { sans: "14 m, c’est trop loin.", planche: "La planche fait 10 m.\nLe canal fait 14 m.\nElle est trop courte.", echelle: "L’échelle sert à monter.\nIci, il faut traverser l’eau.", bottes: "Avec les bottes : 7 m.\nLe canal fait 14 m.\nC’est trop loin." },
    mur: { sans: "Le mur fait 5 m 50.\nTu sautes 2 m.\nC’est trop haut.", planche: "La planche sert à traverser.\nIci, il faut monter.", pont: "Le pont sert à traverser.\nIci, il faut monter.", bottes: "Avec les bottes : 3 m 50.\nLe mur fait 5 m 50.\nC’est trop haut." },
    tranchees: { sans: "Chaque trou fait 6 m 20.\nTu sautes 5 m.\nC’est trop loin.", planche: "Il y a 3 trous.\n1 planche ne suffit pas.", pont: "Il y a 3 trous.\nLe pont est trop court.", echelle: "L’échelle sert à monter.\nIci, il faut sauter loin." } };
  return (T[d.type] || {})[id || "sans"] || "Ce n’est pas le bon objet.";
}
/* Place the chosen item in the right spot */
/* Placed items are slightly higher than the street: otherwise the two surfaces mix and the image flickers. */
const ELEVE = .1;
function placerObjet(d, id) {
  if (id === "planche") { const b = plaque(0, d.zm, 2.4, d.L + 1.6, ELEVE, BOIS); poses.push(b); for (let z = d.zA - .4; z > d.zB; z -= 1.2) boite(0xa9805c, 2.42, .04, .12, 0, ELEVE + .02, z, false).userData.pose = true; }
  if (id === "pont") { const b = plaque(0, d.zm, 4, d.L + 2, ELEVE, 0xb98a5e); poses.push(b);
    for (const s of [-1, 1]) { const r = boite(0x8a5a3a, .2, 1, d.L + 2, s * 1.9, ELEVE + .5, d.zm); r.userData.pose = true; } }
  if (id === "echelle") for (let k = 0; k < 5; k++) poses.push(plaque(0, d.zA + .7 + (4 - k) * 1.4, 3, 1.4, 1.1 * (k + 1), [0xeadbb8, 0xe9c49a][k % 2]));
  if (id === "bottes") { opts.bottes = true; majInventaire(); }
}
const poses = [];
function enleverPoses() {
  for (const b of poses) { scene.remove(b.mesh); const i = blocs.indexOf(b); if (i >= 0) blocs.splice(i, 1); }
  poses.length = 0; scene.children.filter(o => o.userData && o.userData.pose).forEach(o => scene.remove(o)); opts.bottes = false;
}

const PARCOURS = { 1: ["petit", "trou", "mur", "canal"], 2: ["barriere", "trou", "tranchees", "mur", "petit", "canal"], 3: ["tranchees", "petit", "trou", "mur", "tranchees", "barriere", "canal", "trou"] };
pilier(0, 1, 12, 8, 0, ROUTE); bordInvisible(1, 8); quartier(5, -3); sections.push({ nom: "Départ", z: 99 }); zc = -3;
/* ---------- The thinking gates: a guard asks a question to open the glass door ---------- */
const reflexions = [];
const matVerre = new THREE.MeshLambertMaterial({ color: 0x9fd8f0, transparent: true, opacity: .4 });
const TYPES_REFL = ["enigme", "observe", "suite", "securite", "chemin"];
const INFOS_REFL = { enigme: ["🦉", "L’énigme du gardien"], observe: ["👀", "Observe la ville"], suite: ["🔢", "Le code de la porte"], securite: ["🚦", "Prudence dans la rue"], chemin: ["🗺️", "Le bon chemin"] };
function gardien(x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  const c = (w, h, d, col, px, py, pz) => { const m = new THREE.Mesh(geoBloc, mat(col)); m.scale.set(w, h, d); m.position.set(px, py, pz); m.castShadow = true; g.add(m); };
  c(.9, 1.1, .7, 0x8a6a4a, 0, .55, 0); c(1, .8, .8, 0x9c7a56, 0, 1.5, 0); c(.25, .25, .05, 0xffffff, -.2, 1.6, .41); c(.25, .25, .05, 0xffffff, .2, 1.6, .41);
  c(.1, .1, .06, 0x16324f, -.2, 1.6, .44); c(.1, .1, .06, 0x16324f, .2, 1.6, .44); c(.15, .15, .1, 0xf2a03c, 0, 1.4, .43); c(.2, .3, .2, 0x9c7a56, -.35, 2, 0); c(.2, .3, .2, 0x9c7a56, .35, 2, 0);
  return g;
}
function porteReflexion(type) {
  route(5, 0);
  const zG = zc - 1, mur = pilier(0, zG, 12, .5, 4.5, 0x9fd8f0, { type: "sol" }); mur.mesh.material = matVerre; mur.mesh.castShadow = false;
  gardien(-4.4, zG + 1.6); const t = document.createElement("canvas"); t.width = 128; t.height = 128; const cx = t.getContext("2d");
  cx.fillStyle = "#7fd0ff"; cx.strokeStyle = "#16324f"; cx.lineWidth = 8; cx.beginPath(); cx.arc(64, 64, 54, 0, 7); cx.fill(); cx.stroke(); cx.fillStyle = "#16324f"; cx.font = "bold 84px Arial"; cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("?", 64, 70);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(t), depthTest: false })); sp.scale.set(1.6, 1.6, 1); sp.position.set(0, 5.6, zG); scene.add(sp);
  reflexions.push({ type, k: reflexions.length, zG, mur, sp, resolue: false, essais: new Set(), q: null });
  route(5, 1);
}
PARCOURS[NIVEAU].forEach((t, i) => { defi(t); porteReflexion(TYPES_REFL[i % TYPES_REFL.length]); });
route(10, 2);
/* Finish: a small square with the golden flag */
const arrivee = { x: 0, y: .5, z: zc - 5 };
pilier(0, zc - 5, 12, 10, 0, 0x9ccb9a); bordInvisible(zc - 5, 10); plaque(0, zc - 5, 3.2, 3.2, .5, OR);
{ const g = new THREE.Group(); const m1 = new THREE.Mesh(new THREE.BoxGeometry(.2, 3.6, .2), mat(0xffffff)); m1.position.y = 1.8; g.add(m1);
  const t = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1, .08), new THREE.MeshLambertMaterial({ color: OR, emissive: 0x6b4a00 })); t.position.set(.88, 3.1, 0); g.add(t);
  g.position.set(-.9, .5, zc - 5); scene.add(g); arrivee.drapeau = t; }
arbre(-4, zc - 2); arbre(4, zc - 8); arbre(-4, zc - 8); arbre(4, zc - 2); feu(-5.5, 2);
sections.push({ nom: "La place de l’arrivée", z: zc + 2 });
const TOTAL_ETOILES = etoiles.length, TOTAL_DRAPEAUX = drapeaux.length;

/* ---------- Avatar ---------- */
const avatar = new THREE.Group(); scene.add(avatar);
const corps = new THREE.Group(); avatar.add(corps);
function cube(w, h, d, c, x, y, z, parent) { const m = new THREE.Mesh(geoBloc, mat(c)); m.scale.set(w, h, d); m.position.set(x, y, z); m.castShadow = true; (parent || corps).add(m); return m; }
const jambeG = new THREE.Group(), jambeD = new THREE.Group(), brasG = new THREE.Group(), brasD = new THREE.Group();
jambeG.position.set(-.17, .75, 0); jambeD.position.set(.17, .75, 0); brasG.position.set(-.45, 1.45, 0); brasD.position.set(.45, 1.45, 0);
corps.add(jambeG, jambeD, brasG, brasD);
cube(.3, .75, .3, 0x2f4f8f, 0, -.375, 0, jambeG); cube(.3, .75, .3, 0x2f4f8f, 0, -.375, 0, jambeD);
cube(.25, .7, .25, 0xf2c79e, 0, -.35, 0, brasG); cube(.25, .7, .25, 0xf2c79e, 0, -.35, 0, brasD);
cube(.65, .75, .38, 0x14a3ad, 0, 1.12, 0); cube(.5, .5, .5, 0xf2c79e, 0, 1.78, 0); cube(.54, .14, .54, 0x6b3f1f, 0, 2.06, 0);
cube(.08, .08, .02, 0x16324f, -.11, 1.82, .26); cube(.08, .08, .02, 0x16324f, .11, 1.82, .26); cube(.18, .04, .02, 0x8a3a2f, 0, 1.68, .26);
const botteG = cube(.36, .2, .42, 0xf2c94c, 0, -.7, .03, jambeG), botteD = cube(.36, .2, .42, 0xf2c94c, 0, -.7, .03, jambeD);
const casquette = new THREE.Group(); corps.add(casquette); cube(.56, .16, .56, 0x3e6a90, 0, 2.12, 0, casquette); cube(.5, .06, .28, 0x3e6a90, 0, 2.06, .38, casquette);
const cape = new THREE.Group(); corps.add(cape); cube(.62, 1.1, .06, 0xb94a5a, 0, 1.0, -.24, cape);
/* Characters, accessories and tools bought with stars (shared by the block games) */
Personnages.init({ jeu: "ville", corps, jambeG, jambeD, brasG, brasD, portefeuille: { lire: () => tirelire.etoiles, depenser: n => { tirelire.etoiles = Math.max(0, tirelire.etoiles - n); sauverTirelire(); if (typeof majSoldes === "function") majSoldes(); }, gagner: n => { tirelire.etoiles += n; sauverTirelire(); if (typeof majSoldes === "function") majSoldes(); } } });
const ombre = new THREE.Mesh(new THREE.CircleGeometry(.42, 24), new THREE.MeshBasicMaterial({ color: 0x16324f, transparent: true, opacity: .28, depthWrite: false }));
ombre.rotation.x = -Math.PI / 2; scene.add(ombre);

/* ---------- Player state ---------- */
const DEMI = .32, HAUT = 2.15;
const j = { x: 0, y: 0, z: 3, vx: 0, vy: 0, vz: 0, sol: null, coyote: 0, tampon: 0, angle: Math.PI, marche: 0 };
let horloge = 0, depart = { x: 0, y: 0, z: 3 }, dernierDrapeau = 0, nbEtoiles = 0, enJeu = false, enPause = false, fini = false, chrono = 0, erreurs = 0, bonsChoix = 0;
const lacam = { yaw: 0, pitch: .4, dist: 9, cible: null };
const opts = { vitesse: 1, bottes: false };

/* ---------- Inputs ---------- */
const touches = { haut: false, bas: false, gauche: false, droite: false, saut: false };
const CARTE = { ArrowUp: "haut", KeyW: "haut", KeyZ: "haut", ArrowDown: "bas", KeyS: "bas", ArrowLeft: "gauche", KeyA: "gauche", KeyQ: "gauche", ArrowRight: "droite", KeyD: "droite", Space: "saut" };
addEventListener("keydown", e => {
  if (e.target && /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
  if (e.code === "KeyP" || e.code === "Escape") { if (enJeu && !fini) basculerPause(); e.preventDefault(); return; }
  const n = { Digit1: "planche", Digit2: "echelle", Digit3: "pont", Digit4: "bottes", Digit0: "sans", Numpad1: "planche", Numpad2: "echelle", Numpad3: "pont", Numpad4: "bottes", Numpad0: "sans" }[e.code];
  if (reflActive && !reflActive.resolue && enJeu && !enPause && /^(Digit|Numpad)[1-3]$/.test(e.code)) { repondreRefl(reflActive.q.choix[+e.code.slice(-1) - 1]); e.preventDefault(); return; }
  if (n && enJeu && !enPause) { choisir(n === "sans" ? null : n); e.preventDefault(); return; }
  const k = CARTE[e.code]; if (!k) return;
  if (e.target && e.target.tagName === "BUTTON" && k === "saut") return;
  e.preventDefault(); if (k === "saut" && !touches.saut) j.tampon = .15; touches[k] = true;
});
addEventListener("keyup", e => { const k = CARTE[e.code]; if (k) touches[k] = false; });
addEventListener("blur", () => { for (const k in touches) touches[k] = false; if (enJeu && !fini && !enPause) basculerPause(true); });
document.querySelectorAll(".pad button").forEach(b => {
  const k = b.dataset.k;
  b.addEventListener("pointerdown", e => { e.preventDefault(); touches[k] = true; b.setPointerCapture(e.pointerId); });
  const lacher = () => { touches[k] = false; }; b.addEventListener("pointerup", lacher); b.addEventListener("pointercancel", lacher); b.addEventListener("lostpointercapture", lacher);
});
let glisse = null, toucher = null;
canvas.addEventListener("pointerdown", e => { canvas.focus(); glisse = { x: e.clientX, y: e.clientY }; toucher = { x: e.clientX, y: e.clientY, t: performance.now() }; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener("pointermove", e => {
  if (!glisse) return;
  if (toucher && Math.hypot(e.clientX - toucher.x, e.clientY - toucher.y) > 10) { toucher = null; lacam.cible = null; }
  if (toucher) return;
  lacam.yaw -= (e.clientX - glisse.x) * .006; lacam.pitch = Math.max(.08, Math.min(1.1, lacam.pitch + (e.clientY - glisse.y) * .004)); glisse = { x: e.clientX, y: e.clientY };
});
canvas.addEventListener("pointerup", () => { if (toucher && performance.now() - toucher.t < 350 && enJeu && !enPause) j.tampon = .15; toucher = null; glisse = null; });
canvas.addEventListener("wheel", e => { e.preventDefault(); lacam.dist = Math.max(4.5, Math.min(18, lacam.dist + e.deltaY * .01)); }, { passive: false });

/* ---------- Physics (aligned boxes) ---------- */
const chevauche = (b, x, y, z) => x + DEMI > b.x - b.w / 2 && x - DEMI < b.x + b.w / 2 && z + DEMI > b.z - b.d / 2 && z - DEMI < b.z + b.d / 2 && y + HAUT > b.y - b.h / 2 && y < b.y + b.h / 2;
const dessus = b => b.y + b.h / 2;
function bougerAxe(axe, pas) {
  if (!pas) return; j[axe] += pas;
  for (const b of blocs) {
    if (!chevauche(b, j.x, j.y, j.z)) continue;
    if (b.type !== "bord" && dessus(b) - j.y <= .55 && j.vy <= 0) { j.y = dessus(b); continue; }
    const c = axe === "x" ? b.x : b.z, t = (axe === "x" ? b.w : b.d) / 2;
    j[axe] = pas > 0 ? c - t - DEMI - .001 : c + t + DEMI + .001; if (axe === "x") j.vx = 0; else j.vz = 0;
  }
}
function mettreAJour(dt) {
  chrono += dt; horloge += dt;
  const fenetre = (actif && !replie) || (reflActive && !reflActive.resolue);
  let ix = fenetre ? 0 : (touches.droite ? 1 : 0) - (touches.gauche ? 1 : 0), iz = fenetre ? 0 : (touches.haut ? 1 : 0) - (touches.bas ? 1 : 0);
  const fx = -Math.sin(lacam.yaw), fz = -Math.cos(lacam.yaw), rx = Math.cos(lacam.yaw), rz = -Math.sin(lacam.yaw);
  let mx = fx * iz + rx * ix, mz = fz * iz + rz * ix; const n = Math.hypot(mx, mz), vmax = 5.6 * opts.vitesse;
  if (n > 0) { mx /= n; mz /= n; j.angle = Math.atan2(mx, mz); }
  const lisse = Math.min(1, dt * (j.sol ? 14 : 5));
  const vOutil = vmax * Personnages.vitesse(); j.vx += (mx * vOutil - j.vx) * lisse; j.vz += (mz * vOutil - j.vz) * lisse;
  j.coyote = j.sol ? .14 : Math.max(0, j.coyote - dt); j.tampon = Math.max(0, j.tampon - dt);
  if (!fenetre && j.tampon > 0 && j.coyote > 0) { j.vy = 9.4 + (opts.bottes ? 3.4 : 0); j.sol = null; j.coyote = 0; j.tampon = 0; }
  j.vy -= (j.vy < 0 ? 19 : 22) * dt; j.vy = Math.max(j.vy, -24); Personnages.physique(j, dt);
  bougerAxe("x", j.vx * dt); bougerAxe("z", j.vz * dt);
  j.y += j.vy * dt; j.sol = null;
  for (const b of blocs) {
    if (!chevauche(b, j.x, j.y, j.z)) continue;
    if (j.vy <= 0) { j.y = dessus(b); j.sol = b; j.vy = 0; } else { j.y = b.y - b.h / 2 - HAUT - .001; j.vy = 0; }
  }
  if (j.y < -4.5) { reapparaitre(); return; }
  for (const e of etoiles) if (!e.prise && Math.hypot(j.x - e.x, j.z - e.z) < .95 && Math.abs(j.y + 1 - e.y) < 1.4) {
    e.prise = true; e.m.visible = false; nbEtoiles++; tirelire.etoiles++; sauverTirelire(); majCompteurs(); sonEffet("etoile");
    dire("⭐ Une étoile pour ta tirelire ! (" + tirelire.etoiles + " ⭐)", 1600);
  }
  for (const d of drapeaux) if (!d.atteint && Math.hypot(j.x - d.x, j.z - d.z) < 3 && Math.abs(j.y - d.y) < 1) {
    d.atteint = true; d.tissu.material = mat(0x6fb58e); dernierDrapeau = Math.max(dernierDrapeau, d.n); depart = { x: d.x + .8, y: d.y, z: d.z }; majCompteurs();
    dire("🚩 Drapeau " + d.n + " : si tu tombes, tu repars d'ici.", 2200);
  }
  surveillerDefis(); surveillerReflexions();
  for (const r of reflexions) if (r.descend && r.mur.mesh.visible) { r.mur.mesh.position.y -= dt * 7; if (r.mur.mesh.position.y < r.mur.y - r.mur.h) r.mur.mesh.visible = false; }
  if (!fini && Math.hypot(j.x - arrivee.x, j.z - arrivee.z) < 1.8 && Math.abs(j.y - arrivee.y) < .6) gagner();
  let s = sections[0]; for (const x of sections) if (j.z < x.z) s = x; $("section").textContent = s.nom;
  const v = Math.hypot(j.vx, j.vz); j.marche += dt * v * 2.2; const amp = j.sol ? Math.min(.7, v / 6) : .35;
  jambeG.rotation.x = Math.sin(j.marche) * amp; jambeD.rotation.x = -Math.sin(j.marche) * amp; brasG.rotation.x = -Math.sin(j.marche) * amp; brasD.rotation.x = Math.sin(j.marche) * amp;
}
function reapparaitre() { j.x = depart.x; j.y = depart.y + .2; j.z = depart.z; j.vx = j.vy = j.vz = 0; j.sol = null; lacam.cible = 0; if (enJeu) dire("Oups ! On repart du dernier drapeau 🚩", 2000); }

/* ---------- Challenges: hint, item choice, getting an item ---------- */
let actif = null, replie = false;
function surveillerDefis() {
  for (const d of defis) {
    if (!d.resolu && j.z < d.zB - .5 && j.y > -1) { d.resolu = true; d.marque.visible = false; if (!d.choisi && !d.essais.size) bonsChoix++; if (actif === d) fermerDefi(); }
  }
  const d = defis.find(x => !x.resolu && !x.choisi && j.z < x.zA + 8 && j.z > x.zB);
  if (d && d !== actif) ouvrirDefi(d);
  for (const x of defis) x.marque.visible = enJeu && !x.resolu && !x.choisi && j.z < x.zA + 26;
}
function ouvrirDefi(d) {
  actif = d; replie = false;
  $("defiTitre").textContent = d.ico + " " + d.nom; $("defiTexte").textContent = d.texte;
  $("defiSais").textContent = opts.bottes ? "👟 Avec tes bottes : tu sautes 7 m de loin et 3 m 50 de haut." : SAIS;
  $("defiQuestion").hidden = false; $("defiObjets").hidden = false; $("defiSais").hidden = false;
  $("defiRetour").textContent = ""; $("defiRetour").className = "defi-retour"; $("defiObtenir").hidden = true;
  dessinerChoix(); $("defi").hidden = false; $("defiRappel").hidden = true; $("inventaire").classList.add("brille");
  sonEffet("defi"); $("message").hidden = true; touches.haut = touches.bas = touches.gauche = touches.droite = false;
}
function dessinerChoix() {
  const d = actif, box = $("defiObjets"); box.textContent = "";
  OUTILS.forEach((o, i) => {
    const n = tirelire.inv[o.id] || 0, b = document.createElement("button"); b.type = "button";
    b.innerHTML = '<span class="ico" aria-hidden="true"></span><span><b></b><small></small></span><span class="nb"></span>';
    b.querySelector(".ico").textContent = o.ico; b.querySelector("b").textContent = (i + 1) + ". " + o.nom; b.querySelector("small").textContent = o.mesure;
    const nb = b.querySelector(".nb"); nb.textContent = o.id === "bottes" && opts.bottes ? "aux pieds" : "× " + n; if (!n && !(o.id === "bottes" && opts.bottes)) nb.classList.add("zero");
    if (d.essais.has(o.id)) b.classList.add("non");
    b.setAttribute("aria-label", o.nom + ", " + o.mesure + ", tu en as " + n); b.onclick = () => choisir(o.id); box.append(b);
  });
  const s = document.createElement("button"); s.type = "button"; s.className = "sans" + (d.essais.has("sans") ? " non" : "");
  s.innerHTML = '<span class="ico" aria-hidden="true">🦘</span><b>0. Pas d’objet. Je saute !</b>'; s.onclick = () => choisir(null); box.append(s);
}
function choisir(id) {
  if (!enJeu || enPause || fini) return;
  if (!actif) { dire("Garde ton objet pour un obstacle 💡.", 2400); return; }
  const d = actif, bon = d.besoin(), cle = id || "sans", r = $("defiRetour");
  if (replie) { replie = false; $("defi").hidden = false; $("defiRappel").hidden = true; }
  if (id === bon || (!id && !bon)) {
    if (!d.essais.size) bonsChoix++;
    if (!id) { reussir(d, "🦘 Bon choix ! Saute !"); return; }
    if ((tirelire.inv[id] || 0) > 0) { utiliserObjet(d, id); return; }
    r.textContent = ""; r.className = "defi-retour"; proposerObtenir(d, id); return;
  }
  if (!d.essais.has(cle)) { d.essais.add(cle); erreurs++; }
  r.textContent = "🤔 " + pourquoi(d, id); r.className = "defi-retour oups"; $("defiObtenir").hidden = true; dessinerChoix(); sonEffet("encore");
}
function utiliserObjet(d, id) {
  tirelire.inv[id]--; sauverTirelire(); placerObjet(d, id); majInventaire(); sonEffet("objet");
  const o = nomObj(id);
  reussir(d, o.ico + " " + (id === "bottes" ? "Bottes aux pieds. Saute !" : id === "echelle" ? "L’échelle est posée. Monte !" : (id === "planche" ? "La planche est posée." : "Le pont est posé.") + " Traverse !"));
}
function reussir(d, texte) {
  d.choisi = true; d.marque.visible = false; fermerDefi(); dire(texte, 3200); sonEffet("bravo");
}
function fermerDefi() { actif = null; replie = false; $("defi").hidden = true; $("defiObtenir").hidden = true; $("defiPlusTard").hidden = false; $("defiRappel").hidden = true; $("inventaire").classList.remove("brille"); canvas.focus(); }
/* The right item, but the student does not have it: buy it with stars, or earn it with a calculation */
const hasardEntre = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
function calcul() {
  if (NIVEAU === 1) { if (Math.random() < .5) { const r = hasardEntre(8, 20), a = hasardEntre(2, r - 2); return { t: a + " + " + (r - a), v: a + " plus " + (r - a), r }; } const a = hasardEntre(10, 20), b = hasardEntre(2, a - 2); return { t: a + " − " + b, v: a + " moins " + b, r: a - b }; }
  if (NIVEAU === 2) { if (Math.random() < .5) { const a = hasardEntre(15, 60), b = hasardEntre(12, 99 - a); return { t: a + " + " + b, v: a + " plus " + b, r: a + b }; } const a = hasardEntre(40, 99), b = hasardEntre(12, a - 10); return { t: a + " − " + b, v: a + " moins " + b, r: a - b }; }
  const a = hasardEntre(2, 9), b = hasardEntre(3, 10); return Math.random() < .5 ? { t: a + " × " + b, v: a + " fois " + b, r: a * b } : { t: (a * b) + " ÷ " + a, v: (a * b) + " divisé par " + a, r: b };
}
function proposerObtenir(d, id) {
  const o = nomObj(id), box = $("defiObtenir"), un = { planche: "de planche", echelle: "d’échelle", pont: "de pont", bottes: "de bottes" }[id];
  $("defiObjets").hidden = true; $("defiQuestion").hidden = true; $("defiSais").hidden = true; $("defiPlusTard").hidden = true;
  box.textContent = ""; box.hidden = false; box.className = "defi-obtenir obt";
  const p = document.createElement("p"); p.textContent = "✅ Bonne idée : " + o.ico + " " + o.nom.toLowerCase() + " !\nTu n’as pas " + un + "."; box.append(p);
  const montrerCalcul = () => {
    box.textContent = ""; const q = calcul();
    const t = document.createElement("p"); t.textContent = "Réponds au calcul.\nTu gagnes l’objet."; box.append(t);
    const c = document.createElement("div"); c.className = "obt-calc"; c.textContent = q.t + " = ?"; box.append(c);
    const ch = document.createElement("div"); ch.className = "obt-reponses"; box.append(ch);
    const vals = [q.r]; while (vals.length < 3) { const v = q.r + [1, -1, 2, -2, 10, -10][hasardEntre(0, 5)]; if (v >= 0 && !vals.includes(v)) vals.push(v); }
    vals.sort(() => Math.random() - .5).forEach(v => { const b = document.createElement("button"); b.type = "button"; b.textContent = v;
      b.onclick = () => { if (v === q.r) { tirelire.inv[id] = (tirelire.inv[id] || 0) + 1; sauverTirelire(); utiliserObjet(d, id); }
        else { b.classList.add("barre"); b.disabled = true; $("defiRetour").textContent = "Ce n’est pas " + v + ".\nEssaie encore."; $("defiRetour").className = "defi-retour oups"; sonEffet("encore"); } };
      ch.append(b); });
    $("defiRetour").textContent = ""; parler(q.v + ", combien ?"); const premier = ch.querySelector("button"); if (premier) premier.focus();
  };
  if (tirelire.etoiles >= o.prix) {
    const r = document.createElement("div"); r.className = "obt-boutons";
    const a = document.createElement("button"); a.type = "button"; a.textContent = "🛒 Acheter : " + o.prix + " ⭐";
    a.onclick = () => { tirelire.etoiles -= o.prix; tirelire.inv[id] = (tirelire.inv[id] || 0) + 1; sauverTirelire(); majSoldes(); utiliserObjet(d, id); };
    const g = document.createElement("button"); g.type = "button"; g.textContent = "🧮 Gagner : 1 calcul"; g.onclick = montrerCalcul;
    r.append(a, g); box.append(r);
    const s = document.createElement("p"); s.style.fontSize = "20px"; s.textContent = "Tu as " + tirelire.etoiles + " ⭐."; box.append(s);
  } else setTimeout(montrerCalcul, 1400);
}
$("defiPlusTard").onclick = () => { if (!actif) return; replie = true; $("defi").hidden = true; $("defiRappel").hidden = false; canvas.focus(); };
$("defiRappel").onclick = () => { if (!actif) return; replie = false; $("defi").hidden = false; $("defiRappel").hidden = true; };
$("defiLire").onclick = () => { if (actif) parler(actif.nom + ". " + actif.texte.replace(/\n/g, " ") + " Quel objet t’aide ?"); };

/* ---------- Thinking questions ---------- */
const H = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const PIOCHE = l => l[Math.floor(Math.random() * l.length)];
const PRENOMS = ["Léa", "Sami", "Noah", "Inès", "Adam", "Maya", "Lina", "Tom", "Zoé", "Yanis"];
const que = n => (/^[AEIOUYÉÈÎaeiouyéèî]/.test(n) ? "qu’" : "que ") + n;
const trois = (bon, f1, f2) => ({ bon: String(bon), choix: [String(bon), String(f1), String(f2)].sort(() => Math.random() - .5) });
function qEnigme() {
  /* One idea and one calculation per question, in short sentences */
  const types = NIVEAU === 1 ? [0, 2, 3] : NIVEAU === 2 ? [0, 1, 2, 3, 4] : [0, 1, 2, 3, 4, 5, 6];
  const t = PIOCHE(types), [a, b] = [...PRENOMS].sort(() => Math.random() - .5);
  if (t === 0) { const x = NIVEAU === 1 ? H(3, 8) : H(10, 40), d = H(2, NIVEAU === 1 ? 4 : 9);
    return Object.assign(trois(x + d, x + d + 1, x - d), { texte: a + " a " + x + " ans.\n" + b + " a " + d + " ans de plus.\nQuel âge a " + b + " ?", indice: "« De plus » : on ajoute.", expl: x + " + " + d + " = " + (x + d) + "." }); }
  if (t === 1) { const [x, y, z] = ["bleu", "rouge", "jaune", "vert"].sort(() => Math.random() - .5); return Object.assign(trois("Le " + z, "Le " + x, "Le " + y), { texte: "L’immeuble " + x + " est plus haut que le " + y + ".\nLe " + y + " est plus haut que le " + z + ".\nLequel est le plus petit ?", indice: "Range-les du plus haut au plus petit.", expl: x + ", puis " + y + ", puis " + z + "." }); }
  if (t === 2) { const n = NIVEAU === 1 ? H(5, 10) : H(12, 30), m = H(2, NIVEAU === 1 ? 4 : 9);
    return Object.assign(trois(n - m, n - m + 1, n + m), { texte: n + " personnes sont dans l’autobus.\n" + m + " personnes descendent.\nCombien de personnes restent ?", indice: "Elles descendent : on enlève.", expl: n + " − " + m + " = " + (n - m) + "." }); }
  if (t === 3) { const e = H(1, 4), m = H(2, 5);
    return Object.assign(trois(e + m, e + m + 1, m), { texte: "Tu es à l’étage " + e + ".\nTu montes " + m + " étages.\nÀ quel étage es-tu ?", indice: "Tu montes : on ajoute.", expl: e + " + " + m + " = " + (e + m) + "." }); }
  if (t === 4) return Object.assign(trois("C’est pareil", "Les briques", "Les plumes"), { texte: "1 kg de plumes.\n1 kg de briques.\nLequel est le plus lourd ?", indice: "Regarde bien : 1 kg et 1 kg.", expl: "1 kg = 1 kg. C’est pareil !" });
  if (t === 5) { const A = 2 * H(5, 30) + 1; return Object.assign(trois(A + 1, A, A + 2), { texte: "Je suis entre " + A + " et " + (A + 3) + ".\nJe suis pair.\nQui suis-je ?", indice: "Écris " + (A + 1) + " et " + (A + 2) + ". Lequel est pair ?", expl: (A + 1) + " est pair." }); }
  const p = H(3, 6); return Object.assign(trois(p * 4, p * 2, p + 4), { texte: p + " voitures.\nChaque voiture a 4 roues.\nCombien de roues en tout ?", indice: "4 roues, " + p + " fois.", expl: p + " × 4 = " + (p * 4) + "." });
}
function qObserve(r) {
  const vues = VOITURES.filter(v => v.z > r.zG);
  if (vues.length && Math.random() < .5) { const n = vues.length; return Object.assign(trois(n, n + 1, Math.max(0, n - 1) === n ? n + 2 : Math.max(0, n - 1)), { texte: "Combien de voitures garées as-tu vues ?", indice: "Les voitures sont à gauche de la rue.", expl: "Il y avait " + n + " voiture" + (n > 1 ? "s" : "") + " garée" + (n > 1 ? "s" : "") + " dans la rue." }); }
  if (vues.length) { const d = vues[vues.length - 1].couleur, f = ["rouge", "bleue", "jaune", "verte", "blanche"].filter(x => x !== d).sort(() => Math.random() - .5);
    return Object.assign(trois(d, f[0], f[1]), { texte: "La dernière voiture garée :\nde quelle couleur était-elle ?", indice: "Elle était juste avant l’obstacle.", expl: "La dernière voiture était " + d + "." }); }
  const def = defis.filter(x => x.zA > r.zG).pop(), noms = { petit: "un petit trou", trou: "un trou de chantier", canal: "un canal", mur: "un mur", tranchees: "trois tranchées", barriere: "une barrière" };
  const f = Object.values(noms).filter(x => x !== noms[def.type]).sort(() => Math.random() - .5);
  return Object.assign(trois(noms[def.type], f[0], f[1]), { texte: "Quel obstacle viens-tu de passer ?", indice: "Pense à l’objet que tu as choisi (ou pas).", expl: "Tu viens de passer " + noms[def.type] + "." });
}
function qSuite() {
  let l, r;
  if (NIVEAU === 1) { const p = PIOCHE([2, 5, 10]), d = p * H(0, 4); l = [d, d + p, d + 2 * p]; r = d + 3 * p; }
  else if (NIVEAU === 2) { const p = PIOCHE([3, 4, 25]), desc = Math.random() < .4, d = desc ? p * H(6, 10) : p * H(1, 5); l = desc ? [d, d - p, d - 2 * p] : [d, d + p, d + 2 * p]; r = desc ? d - 3 * p : d + 3 * p; }
  else if (Math.random() < .5) { const a = H(1, 5); l = [a, a * 2, a * 4]; r = a * 8; } else { const a = H(1, 9); l = [a, a + 1, a + 3, a + 6]; r = a + 10; }
  const pas = l[1] - l[0], expl = NIVEAU === 3 && l.length === 3 ? "Chaque nombre est le double du précédent : " + l[2] + " × 2 = " + r + "." : NIVEAU === 3 ? "On ajoute 1, puis 2, puis 3, puis 4 : " + l[3] + " + 4 = " + r + "." : (pas > 0 ? "On ajoute " + pas + " chaque fois : " : "On enlève " + (-pas) + " chaque fois : ") + l[l.length - 1] + (pas > 0 ? " + " + pas : " − " + (-pas)) + " = " + r + ".";
  return Object.assign(trois(r, r + 1, r + (pas > 0 ? pas : -pas) + (NIVEAU === 3 ? 2 : 0) || r + 2), { texte: l.join(", ") + ", ?\nQuel nombre vient après ?", indice: "Regarde de combien on avance.", expl });
}
const SECU = [
  ["Le petit bonhomme du feu est rouge pour les piétons. Que fais-tu ?", "J’attends sur le trottoir", "Je traverse en courant", "Je traverse s’il n’y a pas de voiture", "Bonhomme rouge : on attend. On traverse quand il devient blanc (ou vert)."],
  ["Ton ballon roule dans la rue. Que fais-tu ?", "Je demande à un adulte de m’aider", "Je cours le chercher", "Je le laisse et je pars", "On ne court jamais dans la rue : un adulte peut aller chercher le ballon en sécurité."],
  ["Avant de traverser la rue, que dois-tu faire ?", "Regarder à gauche, à droite, puis encore à gauche", "Regarder seulement devant moi", "Fermer les yeux et courir", "On regarde des deux côtés pour voir si une voiture arrive."],
  ["Où est-il le plus sûr de traverser la rue ?", "Au passage pour piétons", "Entre deux voitures garées", "Au milieu du virage", "Au passage pour piétons, les voitures s’attendent à voir des piétons."],
  ["Tu fais du vélo dans le quartier. Que dois-tu porter ?", "Un casque", "Des lunettes de soleil", "Des écouteurs", "Le casque protège ta tête si tu tombes."],
  ["Un autobus scolaire est arrêté avec ses feux rouges qui clignotent. Que font les voitures ?", "Elles s’arrêtent", "Elles le dépassent vite", "Elles klaxonnent", "Quand les feux rouges de l’autobus clignotent, toutes les voitures doivent s’arrêter : des enfants descendent."],
  ["Il fait noir et tu marches dans la rue. Comment t’aider à être bien vu ?", "Porter des vêtements clairs ou réfléchissants", "Porter des vêtements foncés", "Marcher au milieu de la rue", "Les vêtements clairs ou réfléchissants aident les conducteurs à te voir."]];
function qSecurite() { const [t, b, f1, f2, e] = PIOCHE(SECU); return Object.assign(trois(b, f1, f2), { texte: t, indice: "Pense à ce qui te garde en sécurité.", expl: e }); }
function qChemin() {
  const max = NIVEAU === 1 ? 10 : NIVEAU === 2 ? 50 : 90, a = H(2, max / 2), b = H(2, max / 2);
  return Object.assign(trois(a + b, a + b + 1, Math.max(0, a + b - 1)), { texte: "Pour aller au parc 🌳 :\n" + a + " m, puis " + b + " m.\nCombien de mètres en tout ?", indice: "En tout : on ajoute.", expl: a + " + " + b + " = " + (a + b) + " m." });
}
const GEN = { enigme: qEnigme, observe: qObserve, suite: qSuite, securite: qSecurite, chemin: qChemin };
let reflActive = null, erreursRefl = 0, reflPremier = 0;
function preparerReflexions() {
  for (const r of reflexions) { r.q = GEN[r.type](r); r.resolue = false; r.essais = new Set(); r.sp.visible = true;
    if (!blocs.includes(r.mur)) blocs.push(r.mur); r.mur.mesh.visible = true; r.mur.mesh.position.y = r.mur.y; r.descend = false; }
}
function surveillerReflexions() {
  const r = reflexions.find(x => !x.resolue && j.z < x.zG + 7 && j.z > x.zG - 1);
  if (r && r !== reflActive) ouvrirReflexion(r);
}
function ouvrirReflexion(r) {
  reflActive = r; const [ico, nom] = INFOS_REFL[r.type];
  $("reflTitre").textContent = ico + " " + nom; $("reflTexte").textContent = r.q.texte; $("reflRetour").textContent = ""; $("reflRetour").className = "defi-retour"; $("reflIndice").hidden = true;
  const box = $("reflChoix"); box.textContent = "";
  r.q.choix.forEach((c, i) => { const b = document.createElement("button"); b.type = "button"; b.textContent = (i + 1) + ". " + c; b.dataset.c = c; if (r.essais.has(c)) b.classList.add("non"); b.onclick = () => repondreRefl(c); box.append(b); });
  $("reflIndiceBtn").hidden = false; $("reflexion").hidden = false; sonEffet("defi"); touches.haut = touches.bas = touches.gauche = touches.droite = false;
}
function repondreRefl(c) {
  const r = reflActive; if (!r || r.resolue) return;
  if (c === r.q.bon) {
    if (!r.essais.size) reflPremier++;
    r.resolue = true; r.sp.visible = false; r.descend = true; blocs.splice(blocs.indexOf(r.mur), 1);
    tirelire.etoiles++; sauverTirelire(); majSoldes(); sonEffet("bravo");
    $("reflRetour").textContent = "✅ Bravo ! " + r.q.expl + "\nLa porte s’ouvre. +1 ⭐"; $("reflRetour").className = "defi-retour bon";
    $("reflChoix").querySelectorAll("button").forEach(b => { b.disabled = true; if (b.dataset.c === c) b.classList.add("oui"); });
    $("reflIndiceBtn").hidden = true; $("reflIndice").hidden = true;
    const fermer = () => { if (reflActive === r) { reflActive = null; $("reflexion").hidden = true; canvas.focus(); } };
    const k = document.createElement("button"); k.type = "button"; k.className = "refl-continuer"; k.textContent = "Continuer ▶"; k.onclick = fermer; $("reflChoix").append(k); k.focus();
    setTimeout(fermer, 4500);
  } else {
    if (!r.essais.has(c)) { r.essais.add(c); erreursRefl++; }
    $("reflRetour").textContent = "🤔 Ce n’est pas « " + c + " ».\nEssaie encore."; $("reflRetour").className = "defi-retour oups"; $("reflIndice").hidden = false;
    $("reflChoix").querySelectorAll("button").forEach(b => { if (r.essais.has(b.dataset.c)) b.classList.add("non"); }); sonEffet("encore");
  }
}
$("reflIndiceBtn").onclick = () => { if (reflActive) { $("reflIndice").hidden = false; $("reflIndice").textContent = "💡 Indice : " + reflActive.q.indice; } };
$("reflLire").onclick = () => { if (reflActive) parler(reflActive.q.texte.replace(/\n/g, " ") + " Réponds : " + reflActive.q.choix.join(", ou ") + "."); };

/* ---------- Voix ---------- */
let voixFr = null;
const choisirVoix = () => { if (!window.speechSynthesis) return; const v = speechSynthesis.getVoices(); voixFr = v.find(x => /^fr[-_]CA/i.test(x.lang)) || v.find(x => /^fr/i.test(x.lang)) || null; };
if (window.speechSynthesis) { choisirVoix(); try { speechSynthesis.addEventListener("voiceschanged", choisirVoix); } catch (e) {} }
function parler(t) { if (!window.speechSynthesis || !t) return; try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); if (voixFr) { u.voice = voixFr; u.lang = voixFr.lang; } else u.lang = "fr-CA"; u.rate = .88; speechSynthesis.speak(u); } catch (e) {} }

/* ---------- Camera ---------- */
let tourMenu = 0;
function placer(dt) {
  avatar.position.set(j.x, j.y, j.z);
  let da = j.angle - avatar.rotation.y; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI; avatar.rotation.y += da * Math.min(1, dt * 12);
  let h = -7; for (const b of blocs) if (b.type !== "bord" && Math.abs(j.x - b.x) < b.w / 2 && Math.abs(j.z - b.z) < b.d / 2 && dessus(b) <= j.y + .05) h = Math.max(h, dessus(b));
  ombre.position.set(j.x, h + .03, j.z); ombre.material.opacity = h > -6 ? Math.max(.08, .32 - (j.y - h) * .03) : 0;
  if (lacam.cible !== null) { let dy = lacam.cible - lacam.yaw; while (dy > Math.PI) dy -= 2 * Math.PI; while (dy < -Math.PI) dy += 2 * Math.PI; lacam.yaw += dy * Math.min(1, dt * 3); if (Math.abs(dy) < .01) lacam.cible = null; }
  if (!enJeu) { tourMenu += dt * .1; const cz = (5 + zc) / 2; camera.position.lerp(new THREE.Vector3(Math.sin(tourMenu) * 60, 38, cz + Math.cos(tourMenu) * 60), Math.min(1, dt * 2)); camera.lookAt(0, 0, cz); }
  else { const cx = j.x + Math.sin(lacam.yaw) * lacam.dist * Math.cos(lacam.pitch), cz = j.z + Math.cos(lacam.yaw) * lacam.dist * Math.cos(lacam.pitch), cy = j.y + 1.4 + lacam.dist * Math.sin(lacam.pitch);
    camera.position.lerp(new THREE.Vector3(cx, cy, cz), Math.min(1, dt * 8)); camera.lookAt(j.x, j.y + 1.3, j.z); }
  soleil.position.set(j.x + 20, j.y + 40, j.z + 15); soleil.target.position.set(j.x, j.y, j.z);
}

/* ---------- Interface ---------- */
let minuterieMessage = null;
function dire(t, ms) { const m = $("message"); m.textContent = t; m.hidden = false; clearTimeout(minuterieMessage); minuterieMessage = setTimeout(() => { m.hidden = true; }, ms || 2000); }
function majCompteurs() { $("etoiles").textContent = nbEtoiles + " / " + TOTAL_ETOILES; $("drapeaux").textContent = dernierDrapeau + " / " + TOTAL_DRAPEAUX;
  $("etoiles").parentNode.style.setProperty("--p", Math.round(100 * nbEtoiles / TOTAL_ETOILES) + "%"); $("drapeaux").parentNode.style.setProperty("--p", Math.round(100 * dernierDrapeau / TOTAL_DRAPEAUX) + "%"); }
const temps = s => Math.floor(s / 60) + " min " + String(Math.floor(s % 60)).padStart(2, "0") + " s";
function basculerPause(force) {
  enPause = force !== undefined ? force : !enPause;
  $("btnPause").setAttribute("aria-pressed", String(enPause)); $("btnPause").textContent = enPause ? "▶ Reprendre" : "⏸ Pause";
  $("pausePanneau").hidden = !enPause; if (enPause) $("pReprendre").focus(); else { $("message").hidden = true; canvas.focus(); }
}
const scoreSur3 = () => 1 + (erreurs <= 1 ? 1 : 0) + (erreursRefl <= 1 ? 1 : 0);
function gagner() {
  fini = true; enPause = false; fermerDefi();
  const sc = scoreSur3(); $("finScore").textContent = "★".repeat(sc) + "☆".repeat(3 - sc);
  $("btnSuivant").hidden = NIVEAU >= 3;
  const sv = $("finSauvegarde"); sv.textContent = "";
  if (window.EC && EC.enregistrerNiveau) {
    sv.textContent = "Enregistrement du score…";
    EC.enregistrerNiveau({ activity: "jeu-ville", level: NIVEAU, score: sc, total: 3, seconds: Math.min(86400, Math.round(chrono)) }).then(r => {
      sv.textContent = r.ok ? "✓ Score gardé dans ton espace." : r.raison === "invite" ? "Tu n'es pas connecté : connecte-toi pour garder ton score." : r.raison === "enseignante" ? "Compte enseignante : le score n'est pas enregistré." : "Le score n'a pas pu être enregistré. Réessaie plus tard."; });
  }
  $("finEtoiles").textContent = nbEtoiles + " / " + TOTAL_ETOILES; $("finTemps").textContent = temps(chrono); $("finErreurs").textContent = erreurs; $("finChoix").textContent = bonsChoix + " / " + defis.length; $("finReflexion").textContent = reflPremier + " / " + reflexions.length;
  $("texteFin").textContent = (erreursRefl === 0 ? "Toutes les questions de réflexion du premier coup ! " : "") + (erreurs === 0 ? "Tu as choisi le bon objet à chaque défi, bravo ! " : erreurs <= 1 ? "Presque tous tes choix étaient judicieux, bravo ! " : "Tu as traversé toute la ville. Rejoue pour choisir le bon objet du premier coup. ") + "Dans ta tirelire : " + tirelire.etoiles + " ⭐.";
  majSoldes(); $("inventaire").hidden = true; sonEffet("bravo"); $("fin").hidden = false; $("btnRejouer").focus();
}
function recommencer() {
  for (const e of etoiles) { e.prise = false; e.m.visible = true; }
  for (const d of drapeaux) { d.atteint = false; d.tissu.material = mat(0xe58f7b); }
  for (const d of defis) { d.resolu = false; d.choisi = false; d.essais = new Set(); }
  enleverPoses(); fermerDefi(); reflActive = null; $("reflexion").hidden = true; erreursRefl = 0; reflPremier = 0; preparerReflexions();
  nbEtoiles = 0; dernierDrapeau = 0; chrono = 0; fini = false; erreurs = 0; bonsChoix = 0; depart = { x: 0, y: 0, z: 3 };
  j.angle = Math.PI; lacam.yaw = 0; reapparaitre(); $("message").hidden = true; majCompteurs(); majInventaire();
}
$("btnJouer").onclick = () => {
  opts.vitesse = +$("optVitesse").value; $("accueil").hidden = true; enJeu = true; basculerPause(false); canvas.focus(); majInventaire();
  dire("Avance avec ▲. Saute avec Espace.", 3600);
};
$("btnAide").onclick = () => { $("accueil").hidden = false; $("btnJouer").textContent = "Reprendre"; enJeu = false; fermerDefi(); $("btnJouer").focus(); };
$("pReprendre").onclick = () => basculerPause(false); $("pFermer").onclick = () => basculerPause(false);
$("pRecommencer").onclick = () => { recommencer(); basculerPause(false); };
$("pAide").onclick = () => { $("pausePanneau").hidden = true; enPause = false; $("btnAide").click(); };
$("btnPause").onclick = () => { if (enJeu && !fini) basculerPause(); };
$("btnRejouer").onclick = () => { $("fin").hidden = true; recommencer(); canvas.focus(); };
$("btnSuivant").onclick = () => { location.href = "jeu.html?n=" + (NIVEAU + 1); };
$("btnRetour").onclick = () => { location.href = "../jeux/ville-en-blocs.html"; };
$("titreAccueil").textContent = "La ville en blocs"; $("nomNiveau").textContent = NOMS[NIVEAU];
$("villeNiveau").textContent = NOMS[NIVEAU] + " · " + PARCOURS[NIVEAU].length + " défis";
$("texteAccueil").textContent = "Va jusqu’au drapeau d’or. Un obstacle ? Choisis un objet. Un hibou 🦉 ? Réponds à sa question. Ramasse les étoiles ⭐.";
document.title = "La ville en blocs · Niveau " + NIVEAU;

/* ---------- Piggy bank (the same as the Calculation island), shop and inventory ---------- */
const CLE_TIRELIRE = "ile-aux-calculs-tirelire";
const tirelire = Object.assign({ etoiles: 0, inv: {}, tenue: {}, porte: {} }, memo.lire(CLE_TIRELIRE, {}));
function sauverTirelire() { memo.ecrire(CLE_TIRELIRE, tirelire); }
function majTenue() { casquette.visible = !!(tirelire.tenue.casquette && tirelire.porte.casquette); cape.visible = !!(tirelire.tenue.cape && tirelire.porte.cape); botteG.visible = botteD.visible = !!opts.bottes; }
function ouvrirBoutique() {
  const liste = $("boutiqueListe"); liste.textContent = "";
  for (const o of OBJETS) {
    const li = document.createElement("li"), possede = o.tenue ? !!tirelire.tenue[o.id] : (tirelire.inv[o.id] || 0);
    li.innerHTML = '<span class="b-ico" aria-hidden="true"></span><span class="b-texte"><b></b><small></small></span><span class="b-prix"></span><button type="button" class="bouton-jeu"></button>';
    li.querySelector(".b-ico").textContent = o.ico; li.querySelector("b").textContent = o.nom + (o.tenue ? "" : possede ? " · tu en as " + possede : "");
    li.querySelector("small").textContent = o.txt; li.querySelector(".b-prix").textContent = o.prix + " ⭐";
    const b = li.querySelector("button");
    if (o.tenue && possede) { const on = !!tirelire.porte[o.id]; b.textContent = on ? "Enlever" : "Porter"; b.onclick = () => { tirelire.porte[o.id] = !on; sauverTirelire(); majTenue(); ouvrirBoutique(); }; li.querySelector(".b-prix").textContent = "✓ à toi"; }
    else { b.textContent = "Acheter"; b.className = "bouton-jeu vert"; b.disabled = tirelire.etoiles < o.prix; if (b.disabled) b.title = "Il te manque " + (o.prix - tirelire.etoiles) + " étoile(s).";
      b.onclick = () => { if (tirelire.etoiles < o.prix) return; tirelire.etoiles -= o.prix;
        if (o.tenue) { tirelire.tenue[o.id] = true; tirelire.porte[o.id] = true; majTenue(); } else tirelire.inv[o.id] = (tirelire.inv[o.id] || 0) + 1;
        sauverTirelire(); ouvrirBoutique(); $("boutiqueMsg").textContent = o.ico + " " + o.nom + " acheté" + (["planche", "echelle", "casquette", "cape"].includes(o.id) ? "e" : "") + (o.id === "bottes" ? "s" : "") + " !"; }; }
    liste.append(li);
  }
  $("boutique").hidden = false; $("boutiqueFermer").focus(); majSoldes();
}
function majSoldes() { document.querySelectorAll(".solde-tirelire").forEach(e => { e.textContent = tirelire.etoiles; }); }
$("boutiqueFermer").onclick = () => { $("boutique").hidden = true; $("boutiqueMsg").textContent = ""; majSoldes(); majInventaire(); if (actif) dessinerChoix(); };
$("btnBoutique").onclick = ouvrirBoutique; $("btnBoutiqueFin").onclick = ouvrirBoutique;
function majInventaire() {
  const barre = $("inventaire"); barre.textContent = ""; majTenue();
  OUTILS.forEach((o, i) => { const n = tirelire.inv[o.id] || 0, porte = o.id === "bottes" && opts.bottes; if (!n && !porte) return;
    const b = document.createElement("button"); b.type = "button"; b.dataset.objet = o.id; b.title = o.nom + " (touche " + (i + 1) + ")";
    b.innerHTML = '<span aria-hidden="true"></span><small></small>'; b.firstChild.textContent = o.ico; b.lastChild.textContent = porte ? "✓" : "×" + n;
    b.setAttribute("aria-label", porte ? o.nom + " : aux pieds" : "Choisir : " + o.nom + ", il t'en reste " + n); if (porte) b.classList.add("actif");
    b.onclick = () => choisir(o.id); barre.append(b); });
  barre.hidden = !enJeu || !barre.children.length;
}
majSoldes();

/* ---------- Petits sons (aucun fichier) ---------- */
let actx = null;
function son(notes, type, vol, ecart) {
  try { if (!actx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return; actx = new C(); } actx.resume();
    const t0 = actx.currentTime + .02;
    notes.forEach((m, i) => { const o = actx.createOscillator(), g = actx.createGain(), t = t0 + i * ecart; o.type = type; o.frequency.value = 440 * Math.pow(2, (m - 69) / 12);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .03); g.gain.exponentialRampToValueAtTime(.0005, t + .35); o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + .4); });
  } catch (e) {}
}
function sonEffet(t) {
  if (t === "bravo") son([72, 76, 79, 84], "triangle", .12, .09);
  if (t === "encore") son([64, 60], "sine", .1, .16);
  if (t === "objet") son([67, 72], "triangle", .1, .08);
  if (t === "etoile") son([84, 88], "triangle", .07, .06);
  if (t === "defi") son([76, 81, 76, 81], "sine", .08, .12);
}

/* ---------- Loop ---------- */
function redimensionner() { const w = innerWidth, h = innerHeight; lacam.dist = w / h < .8 ? 13 : 9; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener("resize", redimensionner); redimensionner();
let avant = performance.now(), gel = false;
const calme = matchMedia("(prefers-reduced-motion: reduce)").matches;
function boucle(maintenant) {
  const dt = Math.min(.05, (maintenant - avant) / 1000); avant = maintenant;
  if (enJeu && !enPause && !gel) mettreAJour(dt);
  const t = maintenant / 1000;
  if (!calme) for (const e of etoiles) if (!e.prise) e.m.rotation.y = t * 1.6;
  for (const d of defis) if (d.marque.visible) d.marque.position.y = (d.haut || 0) + 4 + (calme ? 0 : Math.sin(t * 3) * .3);
  for (const d of drapeaux) d.tissu.rotation.y = Math.sin(t * 2 + d.n) * .12;
  if (arrivee.drapeau) arrivee.drapeau.rotation.y = Math.sin(t * 2) * .15;
  placer(dt); renderer.render(scene, camera); requestAnimationFrame(boucle);
}
preparerReflexions(); majCompteurs(); reapparaitre(); $("message").hidden = true; $("section").textContent = sections[0].nom; camera.position.set(0, 30, 40); majTenue();
requestAnimationFrame(boucle);
/* For automatic tests */
window.VilleEnBlocs = { j, defis, blocs, tirelire, choisir, opts, touches, reflexions, repondreRefl, etat: () => ({ fini, enJeu, enPause, erreurs, bonsChoix, nbEtoiles, erreursRefl, reflPremier, refl: reflActive && reflActive.type, actif: actif && actif.type }), geler: v => { gel = v; }, pas: mettreAJour, sauver: sauverTirelire };
})();
