/* Block island: 3D obstacle course, 3 levels (jeu.html?n=1, 2 or 3).
   The 3D engine (three.min.js, r128) is in this folder: no external site is needed. */
(function () {
"use strict";
const $ = id => document.getElementById(id);
const NIVEAU = Math.min(3, Math.max(1, parseInt(new URLSearchParams(location.search).get("n"), 10) || 1));
const NOMS_NIVEAUX = { 1: "Débutant", 2: "Intermédiaire", 3: "Avancé" };
const memo = { lire(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
               ecrire(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };

/* ---------- Scene ---------- */
const canvas = $("scene");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1b2f4e);
scene.fog = new THREE.Fog(0x1b2f4e, 70, 190);
const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 400);
scene.add(new THREE.HemisphereLight(0xffffff, 0x4a5f80, 0.8));
const soleil = new THREE.DirectionalLight(0xfff4dc, 0.8);
soleil.position.set(20, 40, 15); soleil.castShadow = true;
soleil.shadow.mapSize.set(1024, 1024);
Object.assign(soleil.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 120 });
scene.add(soleil, soleil.target);

/* Calm sea */
const mer = new THREE.Mesh(new THREE.PlaneGeometry(600, 600, 1, 1), new THREE.MeshLambertMaterial({ color: 0x173f63 }));
mer.rotation.x = -Math.PI / 2; mer.position.y = -6; scene.add(mer);
/* Block clouds */
const matNuage = new THREE.MeshLambertMaterial({ color: 0x8fa3c0 });
for (let i = 0; i < 18; i++) {
  const g = new THREE.Group();
  for (let k = 0; k < 4; k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(3 + Math.random() * 3, 1.2, 2 + Math.random() * 2), matNuage); b.position.set(k * 2 - 3, Math.random() * .8, Math.random() * 2 - 1); g.add(b); }
  g.position.set(Math.random() * 160 - 60, 20 + Math.random() * 12, Math.random() * -160 + 40); scene.add(g);
}


/* ---------- The course: blocks aligned on the axes ---------- */
const blocs = [];
const geoBloc = new THREE.BoxGeometry(1, 1, 1);
const mats = {};
const mat = c => mats[c] || (mats[c] = new THREE.MeshLambertMaterial({ color: c }));
/* Pillar: centre (x, z), width w, depth d, from the bottom up to the top "haut" */
function pilier(x, z, w, d, haut, couleur, opts) {
  const bas = -6, h = haut - bas;
  const m = new THREE.Mesh(geoBloc, mat(couleur));
  m.scale.set(w, h, d); m.position.set(x, bas + h / 2, z); m.castShadow = true; m.receiveShadow = true;
  scene.add(m);
  /* light edge on the top */
  const top = new THREE.Mesh(geoBloc, mat(0xffffff)); top.scale.set(w * 1.002, .12, d * 1.002); top.position.set(0, h / 2 - .06, 0); top.scale.divide(m.scale); m.add(top);
  const b = Object.assign({ mesh: m, w, d, h, x, z, y: bas + h / 2, dx: 0, dz: 0, type: "sol" }, opts || {});
  b.mesh.material = mat(couleur); blocs.push(b); return b;
}
function plaque(x, z, w, d, haut, couleur, opts) {
  const ep = .6, m = new THREE.Mesh(geoBloc, mat(couleur));
  m.scale.set(w, ep, d); m.position.set(x, haut - ep / 2, z); m.castShadow = true; m.receiveShadow = true; scene.add(m);
  const b = Object.assign({ mesh: m, w, d, h: ep, x, z, y: haut - ep / 2, x0: x, z0: z, dx: 0, dz: 0, type: "sol" }, opts || {});
  blocs.push(b); return b;
}
const VERT = 0x6cc06f, SABLE = 0xf1d38c, BLEU = 0x5b8fd9, ROSE = 0xe9799b, VIOLET = 0x9b7be0, ORANGE = 0xf29a4a, BOIS = 0xb98352, GRIS = 0x9aa7b4, OR = 0xf4c152;

const sections = [];
const drapeaux = [];
const etoiles = [];
function section(nom) { sections.push({ nom }); }
function drapeau(x, haut, z, n) {
  const g = new THREE.Group();
  const mat1 = new THREE.Mesh(new THREE.BoxGeometry(.18, 3, .18), mat(0xffffff)); mat1.position.y = 1.5; g.add(mat1);
  const tissu = new THREE.Mesh(new THREE.BoxGeometry(1.3, .8, .08), mat(0xe8553d)); tissu.position.set(.72, 2.55, 0); g.add(tissu);
  g.position.set(x, haut, z); g.traverse(o => { if (o.isMesh) o.castShadow = true; }); scene.add(g);
  drapeaux.push({ x, y: haut, z, n, g, tissu, atteint: false });
}
function etoile(x, y, z) {
  const forme = new THREE.Shape();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? .22 : .5; const px = Math.cos(a) * r, py = Math.sin(a) * r; i ? forme.lineTo(px, py) : forme.moveTo(px, py); }
  const geo = new THREE.ExtrudeGeometry(forme, { depth: .16, bevelEnabled: false }); geo.center();
  const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: OR, emissive: 0x6b4a00 })); m.position.set(x, y + 1.1, z); m.castShadow = true; scene.add(m);
  etoiles.push({ m, x, y: y + 1.1, z, prise: false });
}

/* The golden finish flag */
const arrivee = { x: 0, y: 0, z: 0 };
function poserArrivee(x, y, z) {
  Object.assign(arrivee, { x, y, z });
  const g = new THREE.Group();
  const m1 = new THREE.Mesh(new THREE.BoxGeometry(.2, 3.6, .2), mat(0xffffff)); m1.position.y = 1.8; g.add(m1);
  const t = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1, .08), new THREE.MeshLambertMaterial({ color: OR, emissive: 0x6b4a00 })); t.position.set(.88, 3.1, 0); g.add(t);
  g.position.set(x - .9, y, z); g.traverse(o => { if (o.isMesh) o.castShadow = true; }); scene.add(g); arrivee.drapeau = t;
}
/* Suggested camera direction after each flag, and path of the test robot */
let YAW_DRAPEAU = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, CHEMIN = [];
const PARCOURS = {
/* ===== Level 1 · Beginner: short, wide, no traps ===== */
1() {
  pilier(0, 0, 10, 10, 0, VERT);
  section("Départ : le petit escalier");
  for (let k = 0; k < 4; k++) pilier(0, -6 - 2 * k, 4, 2, .5 * (k + 1), [SABLE, ORANGE][k % 2]);
  etoile(0, 1, -8); etoile(0, 2, -12);
  pilier(0, -15, 6, 6, 2, VERT); drapeau(-2, 2, -16, 1);
  section("Étape 2 : les grandes îles");
  [-20.5, -25, -29.5].forEach((z, i) => { pilier(0, z, 3, 3, 2, [BLEU, ROSE][i % 2]); etoile(0, 2, z); });
  pilier(0, -34.5, 6, 6, 2, VERT); drapeau(-2, 2, -35.5, 2);
  section("Étape 3 : le pont de bois");
  pilier(0, -41.5, 2, 8, 2, BOIS); etoile(0, 2, -39.5); etoile(0, 2, -43.5);
  pilier(0, -48.5, 6, 6, 2, VERT); etoile(-2, 2, -47);
  plaque(0, -49.5, 3.2, 3.2, 2.5, OR);
  poserArrivee(0, 2.5, -49.5);
  CHEMIN = [[0, -4], [0, -14], [0, -20.5], [0, -25], [0, -29.5], [0, -34], [0, -39.5], [0, -43.5], [-2, -47], [0, -49.5]];
},
/* ===== Level 2 · Intermediate ===== */
2() {
  /* Start */
  pilier(0, 0, 10, 10, 0, VERT);
  section("Départ : le grand escalier", 6);
  /* 1. The big staircase */
  for (let k = 0; k < 5; k++) pilier(0, -6 - 2 * k, 3, 2, .5 * (k + 1), [SABLE, ORANGE][k % 2]);
  etoile(0, 1.5, -9); etoile(0, 2.5, -13);
  pilier(0, -18, 6, 6, 2.5, VERT); drapeau(-2, 2.5, -19, 1);
  section("Étape 2 : les petites îles", -21);
  /* 2. The small islands */
  [[-1.5, -23.5, 2.5], [1.5, -27, 3], [-1.5, -30.5, 3.5], [1.5, -34, 3]].forEach(([x, z, h], i) => { pilier(x, z, 2, 2, h, [BLEU, ROSE][i % 2]); etoile(x, h, z); });
  pilier(0, -39, 6, 6, 3, VERT); drapeau(-2, 3, -40, 2);
  section("Étape 3 : le pont étroit", -42);
  /* 3. The narrow bridge */
  pilier(0, -48, 1, 12, 3, BOIS); etoile(0, 3, -46); etoile(0, 3, -51);
  pilier(3.5, -54.5, 8, 1, 3, BOIS); etoile(4, 3, -54.5);
  pilier(10, -54.5, 5, 5, 3, VERT); drapeau(10, 3, -56.5, 3);
  section("Étape 4 : les radeaux qui bougent");
  /* 4. Slowly moving platforms */
  [15.5, 19.5, 23.5].forEach((x, i) => { const p = plaque(x, -54.5, 2.6, 2.6, 3, VIOLET, { mobile: { amp: 1.6, vitesse: .55, phase: i * 1.9 } }); p.etoile = etoiles.length; etoile(x, 3, -54.5); });
  pilier(28.5, -54.5, 5, 5, 3, VERT); drapeau(29.5, 3, -53, 4);
  section("Étape 5 : les trampolines", -57);
  /* 5. Trampolines */
  plaque(28.5, -58.2, 2.6, 2.4, 3, ROSE, { type: "trampo" });
  pilier(28.5, -62.5, 3, 4, 7, SABLE); etoile(28.5, 7, -62.5);
  pilier(28.5, -68, 5, 5, 7, VERT); drapeau(29.5, 7, -66, 5);
  section("Étape 6 : la tour finale", -70.5);
  /* 6. The tower: a spiral staircase */
  const C = { x: 28.5, z: -77 };
  pilier(C.x, C.z, 2.2, 2.2, 11.6, GRIS);
  for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3, x = C.x + 3.5 * Math.sin(a) * -1, z = C.z + 3.5 * Math.cos(a), h = 7.8 + .8 * k; plaque(x, z, 2, 2, h, [ORANGE, BLEU, ROSE][k % 3]); if (k % 2) etoile(x, h, z); }
  plaque(C.x, C.z, 3.2, 3.2, 12.6, OR);
  poserArrivee(C.x, 12.6, C.z);
  YAW_DRAPEAU = { 0: 0, 1: 0, 2: 0, 3: -Math.PI / 2, 4: 0, 5: 0 };
  CHEMIN = [[0, -4], [0, -17], [-1.5, -23.5], [1.5, -27], [-1.5, -30.5], [1.5, -34], [0, -38], [0, -44], [0, -54.3], [10, -54.5],
    ["mob", 15.5], ["mob", 19.5], ["mob", 23.5], [28.5, -54.5], [28.5, -56.9], [28.5, -62.5], [28.5, -67], [28.5, -70.3],
    [28.5, -73.5], [25.47, -75.25], [25.47, -78.75], [28.5, -80.5], [31.53, -78.75], [31.53, -75.25], [28.5, -77]];
},
/* ===== Level 3 · Advanced: longer, narrower, higher ===== */
3() {
  pilier(0, 0, 10, 10, 0, VERT);
  section("Départ : l'escalier à trous");
  [[-6.75, .8], [-9.25, 1.6], [-11.75, 2.4], [-14.25, 3.2]].forEach(([z, h], i) => { pilier(0, z, 1.5, 1.5, h, [SABLE, ORANGE][i % 2]); if (i % 2) etoile(0, h, z); });
  pilier(0, -18, 4, 4, 3.2, VERT); drapeau(-1.3, 3.2, -18.5, 1);
  section("Étape 2 : les îlots en zigzag");
  const ilots = [[-1.5, -21.75, 3.6], [1.5, -24.75, 4], [-1.5, -27.75, 4.4], [1.5, -30.75, 4], [-1.5, -33.75, 4.4]];
  ilots.forEach(([x, z, h], i) => { pilier(x, z, 1.5, 1.5, h, [BLEU, ROSE][i % 2]); etoile(x, h, z); });
  pilier(0, -38, 4, 4, 4.4, VERT); drapeau(-1.3, 4.4, -38.5, 2);
  section("Étape 3 : la poutre en zigzag");
  pilier(0, -44, .7, 8, 4.4, BOIS); pilier(2, -48, 4.7, .7, 4.4, BOIS); pilier(4, -52, .7, 8, 4.4, BOIS);
  etoile(0, 4.4, -43); etoile(2, 4.4, -48); etoile(4, 4.4, -53);
  pilier(4, -58.5, 5, 5, 4.4, VERT); drapeau(4, 4.4, -60, 3);
  section("Étape 4 : les radeaux rapides");
  [9.3, 12.8, 16.3, 19.8].forEach((x, i) => { const p = plaque(x, -58.5, 2.4, 2.4, 4.4, VIOLET, { mobile: { amp: 1.7, vitesse: .75, phase: i * 1.6 } }); p.etoile = etoiles.length; etoile(x, 4.4, -58.5); });
  pilier(24.3, -58.5, 5, 5, 4.4, VERT); drapeau(23.3, 4.4, -57, 4);
  section("Étape 5 : les grands rebonds");
  plaque(24.3, -62.2, 2.6, 2.4, 4.4, ROSE, { type: "trampo" });
  pilier(24.3, -66.5, 3, 4, 8.4, SABLE); etoile(24.3, 8.4, -66.5);
  plaque(24.3, -69.7, 2.6, 2.4, 8.4, ROSE, { type: "trampo" });
  pilier(24.3, -74, 3, 4, 12.4, SABLE); etoile(24.3, 12.4, -74);
  pilier(24.3, -79.5, 5, 5, 12.4, VERT); drapeau(23.3, 12.4, -80.5, 5);
  section("Étape 6 : la haute tour");
  const C = { x: 24.3, z: -88 };
  pilier(C.x, C.z, 2.2, 2.2, 19, GRIS);
  const tour = [];
  for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, x = C.x - 3.5 * Math.sin(a), z = C.z + 3.5 * Math.cos(a), h = 13.2 + .8 * k; plaque(x, z, 1.6, 1.6, h, [ORANGE, BLEU, ROSE][k % 3]); if (k % 2) etoile(x, h, z); tour.push([x, z]); }
  plaque(C.x, C.z, 3.2, 3.2, 19.6, OR);
  poserArrivee(C.x, 19.6, C.z);
  YAW_DRAPEAU = { 0: 0, 1: 0, 2: 0, 3: -Math.PI / 2, 4: 0, 5: 0 };
  CHEMIN = [[0, -4], [0, -6.75], [0, -9.25], [0, -11.75], [0, -14.25], [0, -17.5], ...ilots.map(([x, z]) => [x, z]), [0, -37.5], [0, -47.9], [4, -48], [4, -56.5], [4, -58.5],
    ["mob", 9.3], ["mob", 12.8], ["mob", 16.3], ["mob", 19.8], [24.3, -58.5], [24.3, -60.6], [24.3, -66], [24.3, -68.2], [24.3, -74], [24.3, -78], ...tour, [C.x, C.z]];
}
};
PARCOURS[NIVEAU]();
/* ---------- Nature around the course (scenery only: it cannot be walked on) ---------- */
(function () {
  let graine = 7; const hasard = () => (graine = (graine * 16807) % 2147483647) / 2147483647;
  const m = c => new THREE.MeshLambertMaterial({ color: c });
  const M = { herbe: m(0x58a85c), herbe2: m(0x4b9a50), sable: m(0xe3c98a), terre: m(0x8a6440), tronc: m(0x7a5130), feuille: m(0x3f8f45), feuille2: m(0x67b356), sapin: m(0x2f7448),
    roche: m(0x8d96a3), roche2: m(0x6f7987), neige: m(0xf2f5fa), mur: m(0xf3e6cf), mur2: m(0xd9e6ef), toit: m(0xc0533f), toit2: m(0x4f6fa8), porte: m(0x6b4426), fenetre: m(0xffe08a),
    fleurs: [m(0xf06b8e), m(0xffd34d), m(0xffffff), m(0xa98be8)], eau: m(0x6fc3e8) };
  const geo = new THREE.BoxGeometry(1, 1, 1);
  function boite(mat, w, h, d, x, y, z, parent, ombre) { const b = new THREE.Mesh(geo, mat); b.scale.set(w, h, d); b.position.set(x, y, z); b.castShadow = ombre !== false; b.receiveShadow = true; parent.add(b); return b; }
  function arbre(g, x, y, z, t) {
    t = t || .8 + hasard() * .6;
    if (hasard() < .35) { /* tiered fir tree */
      boite(M.tronc, .4 * t, 1.2 * t, .4 * t, x, y + .6 * t, z, g);
      for (let k = 0; k < 3; k++) boite(M.sapin, (2 - k * .55) * t, .8 * t, (2 - k * .55) * t, x, y + (1.4 + k * .75) * t, z, g);
    } else {
      boite(M.tronc, .45 * t, 1.6 * t, .45 * t, x, y + .8 * t, z, g);
      boite(hasard() < .5 ? M.feuille : M.feuille2, 1.9 * t, 1.5 * t, 1.9 * t, x, y + 2.2 * t, z, g);
      boite(M.feuille2, 1.1 * t, .8 * t, 1.1 * t, x + .2 * t, y + 3.2 * t, z - .1 * t, g);
    }
  }
  function roche(g, x, y, z) { const t = .6 + hasard() * 1.2; boite(hasard() < .5 ? M.roche : M.roche2, t * 1.3, t * .8, t, x, y + t * .4, z, g); }
  function fleur(g, x, y, z) { boite(M.fleurs[Math.floor(hasard() * 4)], .25, .25, .25, x, y + .2, z, g, false); }
  function maison(g, x, y, z, rot) {
    const h = new THREE.Group(); h.position.set(x, y, z); h.rotation.y = rot || 0; g.add(h);
    const bleu = hasard() < .5;
    boite(bleu ? M.mur2 : M.mur, 3, 2.2, 2.6, 0, 1.1, 0, h);
    boite(bleu ? M.toit2 : M.toit, 3.4, .5, 3, 0, 2.45, 0, h); boite(bleu ? M.toit2 : M.toit, 2.6, .5, 2.2, 0, 2.95, 0, h); boite(bleu ? M.toit2 : M.toit, 1.6, .5, 1.3, 0, 3.4, 0, h);
    boite(M.porte, .7, 1.2, .1, 0, .6, 1.31, h, false);
    boite(M.fenetre, .55, .5, .1, -.95, 1.4, 1.31, h, false); boite(M.fenetre, .55, .5, .1, .95, 1.4, 1.31, h, false);
    boite(M.terre, .4, .9, .4, .9, 3.2, -.5, h);
  }
  /* A scenery island: sand around, grass on top */
  function ile(x, z, w, d, haut, contenu) {
    const g = new THREE.Group(); scene.add(g);
    boite(M.sable, w + 2, haut + 6 - .3, d + 2, x, -6 + (haut + 6 - .3) / 2, z, g, false);
    boite(M.herbe, w, .6, d, x, haut - .3, z, g, false);
    boite(M.terre, w, haut + 5.4, d, x, -6 + (haut + 5.4) / 2 - .3, z, g, false);
    contenu(g, x, haut, z, w, d);
  }
  const auHasard = (x, z, w, d) => [x + (hasard() - .5) * (w - 1.5), z + (hasard() - .5) * (d - 1.5)];
  function foret(n, rochers, fleurs) { return (g, x, y, z, w, d) => {
    for (let i = 0; i < n; i++) { const [a, b] = auHasard(x, z, w, d); arbre(g, a, y, b); }
    for (let i = 0; i < rochers; i++) { const [a, b] = auHasard(x, z, w, d); roche(g, a, y, b); }
    for (let i = 0; i < fleurs; i++) { const [a, b] = auHasard(x, z, w, d); fleur(g, a, y, b); }
  }; }
  /* Only keep the scenery islands that do not touch the course */
  const libre = (x, z, w, d) => !blocs.some(bl => Math.abs(bl.x - x) < bl.w / 2 + w / 2 + 4 && Math.abs(bl.z - z) < bl.d / 2 + d / 2 + 4);
  const ILES = [[-15, 4, 12, 10, .2, 7, 2, 12], [-17, -22, 10, 14, -.5, 8, 3, 8], [-14, -48, 12, 10, .5, 6, 2, 10], [-6, -70, 10, 10, -1, 5, 4, 6], [-14, -78, 10, 10, 0, 6, 3, 8],
    [45, -48, 12, 12, 0, 9, 2, 8], [46, -78, 12, 12, 1, 7, 4, 6], [44, -20, 10, 12, -.5, 6, 3, 8], [26, -98, 16, 8, -.5, 8, 3, 10], [26, -112, 16, 8, -.5, 8, 3, 10], [18, 6, 10, 8, 0, 5, 2, 8]];
  let places = 0;
  for (const [x, z, w, d, h, n, r, f] of ILES) if (places < 8 && libre(x, z, w + 2, d + 2)) { ile(x, z, w, d, h, foret(n, r, f)); places++; }
  /* The small village */
  const VILLAGE = [[16, -30], [-18, -36], [14, -12]].find(([x, z]) => libre(x, z, 16, 18));
  if (VILLAGE) ile(VILLAGE[0], VILLAGE[1], 14, 16, 0, (g, x, y, z) => {
    maison(g, x - 3.5, y, z - 4, .3); maison(g, x + 3.5, y, z - 3, -.2); maison(g, x, y, z + 4, Math.PI);
    boite(M.sable, 1.6, .05, 14, x, y + .03, z, g, false);
    boite(M.eau, 2, .3, 2, x + 4, y + .15, z + 4, g); boite(M.roche, 2.4, .25, 2.4, x + 4, y + .05, z + 4, g);
    arbre(g, x - 5, y, z + 5); arbre(g, x + 5.5, y, z - 6.5); arbre(g, x - 5.5, y, z + 1);
    for (let i = 0; i < 14; i++) { const [a, b] = auHasard(x, z, 14, 16); fleur(g, a, y, b); }
  });
  /* Mountains in the distance, with snow on top */
  const montM = [m(0x52708f), m(0x5d7a6a), m(0x6b6f8a)];
  let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
  for (const bl of blocs) { x0 = Math.min(x0, bl.x); x1 = Math.max(x1, bl.x); z0 = Math.min(z0, bl.z); z1 = Math.max(z1, bl.z); }
  const mcx = (x0 + x1) / 2, mcz = (z0 + z1) / 2, rayon = Math.max(120, Math.hypot(x1 - x0, z1 - z0) / 2 + 80);
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * Math.PI * 2 + hasard() * .2, r = rayon + hasard() * 40, h = 30 + hasard() * 35, base = 18 + hasard() * 14;
    const cx = mcx + Math.sin(a) * r, cz = mcz + Math.cos(a) * r;
    const mont = new THREE.Mesh(new THREE.ConeGeometry(base, h, 4), montM[i % 3]); mont.position.set(cx, -6 + h / 2, cz); mont.rotation.y = hasard(); scene.add(mont);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(base * .3, h * .3, 4), M.neige); cap.position.set(cx, -6 + h * .85 + .3, cz); cap.rotation.y = mont.rotation.y; scene.add(cap);
  }
})();


const TOTAL_ETOILES = etoiles.length, TOTAL_DRAPEAUX = drapeaux.length;

/* ---------- The block avatar ---------- */
const avatar = new THREE.Group(); scene.add(avatar);
const corps = new THREE.Group(); avatar.add(corps);
function cube(w, h, d, c, x, y, z, parent) { const m = new THREE.Mesh(geoBloc, mat(c)); m.scale.set(w, h, d); m.position.set(x, y, z); m.castShadow = true; (parent || corps).add(m); return m; }
const jambeG = new THREE.Group(), jambeD = new THREE.Group(), brasG = new THREE.Group(), brasD = new THREE.Group();
jambeG.position.set(-.17, .75, 0); jambeD.position.set(.17, .75, 0); brasG.position.set(-.45, 1.45, 0); brasD.position.set(.45, 1.45, 0);
corps.add(jambeG, jambeD, brasG, brasD);
cube(.3, .75, .3, 0x2f4f8f, 0, -.375, 0, jambeG); cube(.3, .75, .3, 0x2f4f8f, 0, -.375, 0, jambeD);
cube(.25, .7, .25, 0xf2c79e, 0, -.35, 0, brasG); cube(.25, .7, .25, 0xf2c79e, 0, -.35, 0, brasD);
cube(.65, .75, .38, 0x14a3ad, 0, 1.12, 0);
cube(.5, .5, .5, 0xf2c79e, 0, 1.78, 0);
cube(.54, .14, .54, 0x6b3f1f, 0, 2.06, 0);
cube(.08, .08, .02, 0x16324f, -.11, 1.82, .26); cube(.08, .08, .02, 0x16324f, .11, 1.82, .26);
cube(.18, .04, .02, 0x8a3a2f, 0, 1.68, .26);
/* Round shadow under the avatar: helps to aim the jumps */
/* Characters, accessories and tools bought with stars (shared by the block games) */
Personnages.init({ jeu: "ile", corps, jambeG, jambeD, brasG, brasD });
const ombre = new THREE.Mesh(new THREE.CircleGeometry(.42, 24), new THREE.MeshBasicMaterial({ color: 0x16324f, transparent: true, opacity: .28, depthWrite: false }));
ombre.rotation.x = -Math.PI / 2; scene.add(ombre);

/* ---------- Player state ---------- */
const DEMI = .32, HAUT = 2.15;
const j = { x: 0, y: 0, z: 3, vx: 0, vy: 0, vz: 0, sol: null, coyote: 0, tampon: 0, angle: Math.PI, marche: 0 };
let horloge = 0, depart = { x: 0, y: 0, z: 3 }, dernierDrapeau = 0, nbEtoiles = 0, enJeu = false, enPause = false, fini = false, chrono = 0;
let lacam = { yaw: 0, pitch: .38, dist: 8.5, cible: null };
const opts = { vitesse: 1, aide: NIVEAU < 3 };

/* ---------- Inputs ---------- */
const touches = { haut: false, bas: false, gauche: false, droite: false, saut: false };
const CARTE = { ArrowUp: "haut", KeyW: "haut", KeyZ: "haut", ArrowDown: "bas", KeyS: "bas", ArrowLeft: "gauche", KeyA: "gauche", KeyQ: "gauche", ArrowRight: "droite", KeyD: "droite", Space: "saut" };
addEventListener("keydown", e => {
  if (e.code === "KeyP" || e.code === "Escape") { if (enJeu && !fini) basculerPause(); e.preventDefault(); return; }
  const k = CARTE[e.code]; if (!k) return; e.preventDefault();
  if (k === "saut" && !touches.saut) j.tampon = .15;
  touches[k] = true;
});
addEventListener("keyup", e => { const k = CARTE[e.code]; if (k) touches[k] = false; });
addEventListener("blur", () => { for (const k in touches) touches[k] = false; if (enJeu && !fini && !enPause) basculerPause(); });
document.querySelectorAll(".pad button").forEach(b => {
  const k = b.dataset.k;
  b.addEventListener("pointerdown", e => { e.preventDefault(); touches[k] = true; b.setPointerCapture(e.pointerId); });
  const lacher = () => { touches[k] = false; };
  b.addEventListener("pointerup", lacher); b.addEventListener("pointercancel", lacher); b.addEventListener("lostpointercapture", lacher);
});
/* Camera: drag to rotate, wheel to zoom */
let glisse = null;
let toucher = null;
canvas.addEventListener("pointerdown", e => { canvas.focus(); glisse = { x: e.clientX, y: e.clientY }; toucher = { x: e.clientX, y: e.clientY, t: performance.now() }; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener("pointermove", e => {
  if (!glisse) return;
  if (toucher && Math.hypot(e.clientX - toucher.x, e.clientY - toucher.y) > 10) { toucher = null; lacam.cible = null; }
  if (toucher) return;
  lacam.yaw -= (e.clientX - glisse.x) * .006; lacam.pitch = Math.max(.08, Math.min(1.1, lacam.pitch + (e.clientY - glisse.y) * .004));
  glisse = { x: e.clientX, y: e.clientY };
});
/* A short tap (without dragging) on the screen = jump */
canvas.addEventListener("pointerup", () => { if (toucher && performance.now() - toucher.t < 350 && enJeu && !enPause) j.tampon = .15; toucher = null; glisse = null; });
canvas.addEventListener("wheel", e => { e.preventDefault(); lacam.dist = Math.max(4.5, Math.min(16, lacam.dist + e.deltaY * .01)); }, { passive: false });

/* ---------- Simple physics (axis-aligned boxes) ---------- */
const chevauche = (b, x, y, z) => x + DEMI > b.x - b.w / 2 && x - DEMI < b.x + b.w / 2 && z + DEMI > b.z - b.d / 2 && z - DEMI < b.z + b.d / 2 && y + HAUT > b.y - b.h / 2 && y < b.y + b.h / 2;
const dessus = b => b.y + b.h / 2;
function bougerAxe(axe, pas) {
  if (!pas) return;
  j[axe] += pas;
  for (const b of blocs) {
    if (!chevauche(b, j.x, j.y, j.z)) continue;
    /* small step: climb onto it */
    if (dessus(b) - j.y <= .55 && j.vy <= 0) { j.y = dessus(b); continue; }
    const c = axe === "x" ? b.x : b.z, t = (axe === "x" ? b.w : b.d) / 2;
    j[axe] = pas > 0 ? c - t - DEMI - .001 : c + t + DEMI + .001;
    if (axe === "x") j.vx = 0; else j.vz = 0;
  }
}
function mettreAJour(dt) {
  chrono += dt; horloge += dt;
  const t = horloge;
  /* Moving platforms: carry the player standing on them */
  for (const b of blocs) if (b.mobile) {
    const nz = b.z0 + Math.sin(t * b.mobile.vitesse + b.mobile.phase) * b.mobile.amp;
    b.dz = nz - b.z; b.z = nz; b.mesh.position.z = nz;
    if (b.etoile !== undefined && !etoiles[b.etoile].prise) { etoiles[b.etoile].z = nz; etoiles[b.etoile].m.position.z = nz; }
  }
  if (j.sol && j.sol.mobile) j.z += j.sol.dz;
  /* Wanted direction, based on the camera */
  let ix = (touches.droite ? 1 : 0) - (touches.gauche ? 1 : 0), iz = (touches.haut ? 1 : 0) - (touches.bas ? 1 : 0);
  const fx = -Math.sin(lacam.yaw), fz = -Math.cos(lacam.yaw), rx = Math.cos(lacam.yaw), rz = -Math.sin(lacam.yaw);
  let mx = fx * iz + rx * ix, mz = fz * iz + rz * ix; const n = Math.hypot(mx, mz);
  const vmax = 5.6 * opts.vitesse;
  if (n > 0) { mx /= n; mz /= n; j.angle = Math.atan2(mx, mz); }
  const lisse = Math.min(1, dt * (j.sol ? 14 : 5));
  const vOutil = vmax * Personnages.vitesse(); j.vx += (mx * vOutil - j.vx) * lisse; j.vz += (mz * vOutil - j.vz) * lisse;
  /* Jump: a little tolerance at the edge (coyote time) and on the key press (buffer) */
  j.coyote = j.sol ? .14 : Math.max(0, j.coyote - dt); j.tampon = Math.max(0, j.tampon - dt);
  if (j.tampon > 0 && j.coyote > 0) { j.vy = opts.aide ? 9.4 : 8.6; j.sol = null; j.coyote = 0; j.tampon = 0; }
  j.vy -= (opts.aide && j.vy < 0 ? 19 : 22) * dt; j.vy = Math.max(j.vy, -24); Personnages.physique(j, dt);
  bougerAxe("x", j.vx * dt); bougerAxe("z", j.vz * dt);
  /* Vertical */
  j.y += j.vy * dt; j.sol = null;
  for (const b of blocs) {
    if (!chevauche(b, j.x, j.y, j.z)) continue;
    if (j.vy <= 0) {
      j.y = dessus(b); j.sol = b;
      if (b.type === "trampo") { j.vy = 15.5; j.sol = null; b.mesh.scale.y = .35; } else j.vy = 0;
    } else { j.y = b.y - b.h / 2 - HAUT - .001; j.vy = 0; }
  }
  for (const b of blocs) if (b.type === "trampo") b.mesh.scale.y += (.6 - b.mesh.scale.y) * Math.min(1, dt * 8);
  /* Fall: calm return to the last flag */
  if (j.y < -5) { reapparaitre(); return; }
  /* Stars */
  for (const e of etoiles) if (!e.prise && Math.hypot(j.x - e.x, j.z - e.z) < .9 && Math.abs(j.y + 1 - e.y) < 1.4) {
    e.prise = true; e.m.visible = false; nbEtoiles++; majCompteurs(); dire("⭐ Une étoile ! " + nbEtoiles + " / " + TOTAL_ETOILES, 1600);
  }
  /* Flags */
  for (const d of drapeaux) if (!d.atteint && Math.hypot(j.x - d.x, j.z - d.z) < 2.4 && Math.abs(j.y - d.y) < 1) {
    d.atteint = true; d.tissu.material = mat(0x2f8a4b); dernierDrapeau = Math.max(dernierDrapeau, d.n); lacam.cible = YAW_DRAPEAU[d.n]; depart = { x: d.x + .8, y: d.y, z: d.z }; majCompteurs();
    dire("🚩 Drapeau " + d.n + " : si tu tombes, tu repars d'ici.", 2600);
  }
  /* Finish */
  if (!fini && Math.hypot(j.x - arrivee.x, j.z - arrivee.z) < 1.8 && Math.abs(j.y - arrivee.y) < .6) gagner();
  /* Stage name */
  let s = sections[0]; for (const x of sections) if (dernierDrapeau >= sections.indexOf(x)) s = x; $("section").textContent = s.nom;
  /* Walking animation */
  const vitesse = Math.hypot(j.vx, j.vz);
  j.marche += dt * vitesse * 2.2;
  const amp = j.sol ? Math.min(.7, vitesse / 6) : .35;
  jambeG.rotation.x = Math.sin(j.marche) * amp; jambeD.rotation.x = -Math.sin(j.marche) * amp;
  brasG.rotation.x = -Math.sin(j.marche) * amp; brasD.rotation.x = Math.sin(j.marche) * amp;
}
function reapparaitre() {
  j.x = depart.x; j.y = depart.y + .2; j.z = depart.z; j.vx = j.vy = j.vz = 0; j.sol = null;
  lacam.cible = YAW_DRAPEAU[dernierDrapeau];
  dire("Oups ! On repart du dernier drapeau 🚩", 2200);
}
let tourMenu = 0;
const VUE = (() => { let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9, y1 = 0; for (const b of blocs) { x0 = Math.min(x0, b.x); x1 = Math.max(x1, b.x); z0 = Math.min(z0, b.z); z1 = Math.max(z1, b.z); y1 = Math.max(y1, b.y + b.h / 2); }
  const r = Math.max(30, Math.hypot(x1 - x0, z1 - z0) * .75); return { x: (x0 + x1) / 2, z: (z0 + z1) / 2, y: y1 * .4, h: y1 + 16, r }; })();
function placer(dt) {
  avatar.position.set(j.x, j.y, j.z);
  let da = j.angle - avatar.rotation.y; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
  avatar.rotation.y += da * Math.min(1, dt * 12);
  /* Shadow on the highest block under the avatar */
  let h = -6;
  for (const b of blocs) if (Math.abs(j.x - b.x) < b.w / 2 && Math.abs(j.z - b.z) < b.d / 2 && dessus(b) <= j.y + .05) h = Math.max(h, dessus(b));
  ombre.position.set(j.x, h + .02, j.z); ombre.material.opacity = h > -6 ? Math.max(.08, .32 - (j.y - h) * .03) : 0;
  /* Camera behind the avatar; it slowly turns towards the rest of the course */
  if (lacam.cible !== null) { let dy = lacam.cible - lacam.yaw; while (dy > Math.PI) dy -= 2 * Math.PI; while (dy < -Math.PI) dy += 2 * Math.PI; lacam.yaw += dy * Math.min(1, dt * 3); if (Math.abs(dy) < .01) lacam.cible = null; }
  const cx = j.x + Math.sin(lacam.yaw) * lacam.dist * Math.cos(lacam.pitch), cz = j.z + Math.cos(lacam.yaw) * lacam.dist * Math.cos(lacam.pitch), cy = j.y + 1.4 + lacam.dist * Math.sin(lacam.pitch);
  if (!enJeu) { /* menu open: the camera slowly circles the island */
    tourMenu += dt * .12; const rv = VUE.r;
    camera.position.lerp(new THREE.Vector3(VUE.x + Math.sin(tourMenu) * rv, VUE.h, VUE.z + Math.cos(tourMenu) * rv), Math.min(1, dt * 2));
    camera.lookAt(VUE.x, VUE.y, VUE.z);
  } else {
    camera.position.lerp(new THREE.Vector3(cx, cy, cz), Math.min(1, dt * 8));
    camera.lookAt(j.x, j.y + 1.3, j.z);
  }
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
  $("pausePanneau").hidden = !enPause;
  if (enPause) $("pReprendre").focus(); else { $("message").hidden = true; canvas.focus(); }
}
/* Score out of 3: ★★★ all the stars, ★★ at least 60 %, ★ course finished */
const scoreSur3 = () => nbEtoiles === TOTAL_ETOILES ? 3 : nbEtoiles >= TOTAL_ETOILES * .6 ? 2 : 1;
function gagner() {
  fini = true; enPause = false;
  const cle = "ile-aux-blocs-meilleur-" + NIVEAU;
  const meilleur = memo.lire(cle, null);
  const record = !meilleur || chrono < meilleur.temps;
  if (record) memo.ecrire(cle, { temps: chrono, etoiles: nbEtoiles });
  const sc = scoreSur3(); Personnages.gagner(nbEtoiles);
  $("finScore").textContent = "★".repeat(sc) + "☆".repeat(3 - sc);
  $("btnSuivant").hidden = NIVEAU >= 3; if (NIVEAU >= 3) $("btnRejouer").className = "btn-jouer";
  const sv = $("finSauvegarde"); sv.textContent = "";
  if (window.EC && EC.enregistrerNiveau) {
    sv.textContent = "Enregistrement du score…";
    EC.enregistrerNiveau({ activity: "jeu-ile", level: NIVEAU, score: sc, total: 3, seconds: Math.min(86400, Math.round(chrono)) }).then(r => {
      sv.textContent = r.ok ? "✓ Score gardé dans ton espace." : r.raison === "invite" ? "Tu n'es pas connecté : connecte-toi pour garder ton score." : r.raison === "enseignante" ? "Compte enseignante : le score n'est pas enregistré." : "Le score n'a pas pu être enregistré. Réessaie plus tard.";
    });
  }
  $("finEtoiles").textContent = nbEtoiles + " / " + TOTAL_ETOILES; $("finTemps").textContent = temps(chrono);
  $("texteFin").textContent = nbEtoiles === TOTAL_ETOILES ? "Toutes les étoiles sont ramassées. Parcours parfait !" : "Tu peux rejouer pour ramasser toutes les étoiles." + (record && meilleur ? " Nouveau record de temps !" : "");
  $("fin").hidden = false; $("btnRejouer").focus();
}
function recommencer() {
  for (const e of etoiles) { e.prise = false; e.m.visible = true; }
  for (const d of drapeaux) { d.atteint = false; d.tissu.material = mat(0xe8553d); }
  nbEtoiles = 0; dernierDrapeau = 0; chrono = 0; fini = false; depart = { x: 0, y: 0, z: 3 };
  j.angle = Math.PI; lacam.yaw = 0; reapparaitre(); $("message").hidden = true; majCompteurs();
}
$("btnJouer").onclick = () => {
  opts.vitesse = +$("optVitesse").value; opts.aide = $("optAide").checked;
  $("accueil").hidden = true; enJeu = true; basculerPause(false); canvas.focus();
  dire("Avance vers l'escalier avec ▲. Pour sauter : Espace, ou touche l'écran.", 3500);
};
$("btnAide").onclick = () => { $("accueil").hidden = false; $("btnJouer").textContent = "Reprendre"; enJeu = false; $("btnJouer").focus(); };
$("pReprendre").onclick = () => basculerPause(false);
$("pFermer").onclick = () => basculerPause(false);
$("pRecommencer").onclick = () => { recommencer(); basculerPause(false); };
$("pAide").onclick = () => { $("pausePanneau").hidden = true; enPause = false; $("btnAide").click(); };
$("btnPause").onclick = () => { if (enJeu && !fini) basculerPause(); };
$("btnRejouer").onclick = () => { $("fin").hidden = true; recommencer(); canvas.focus(); };
$("btnSuivant").onclick = () => { location.href = "jeu.html?n=" + (NIVEAU + 1); };
$("btnRetour").onclick = () => { location.href = "../jeux/ile-aux-blocs.html"; };
/* Title and instruction by level */
$("titreAccueil").textContent = "Niveau " + NIVEAU + " · " + NOMS_NIVEAUX[NIVEAU];
$("nomNiveau").textContent = "Niveau " + NIVEAU + " · " + NOMS_NIVEAUX[NIVEAU];
$("optAide").checked = opts.aide;
document.querySelectorAll(".choix-niveau a").forEach(a => { if (+a.dataset.n === NIVEAU) a.setAttribute("aria-current", "page"); });
$("texteAccueil").textContent = ["", "Un petit parcours pour bien commencer : un escalier, de grandes îles et un pont de bois jusqu'au drapeau d'or.",
  "Six étapes : escalier, petites îles, pont étroit, radeaux qui bougent, trampoline et tour en spirale jusqu'au drapeau d'or.",
  "Le grand défi : escalier à trous, îlots en zigzag, poutre étroite, radeaux rapides, double trampoline et une très haute tour."][NIVEAU] + " Ramasse les étoiles. Si tu tombes, tu repars calmement du dernier drapeau 🚩.";
document.title = "Île aux blocs · Niveau " + NIVEAU;

/* ---------- Loop ---------- */
function redimensionner() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener("resize", redimensionner); redimensionner();
let avant = performance.now(), gel = false;
const calme = matchMedia("(prefers-reduced-motion: reduce)").matches;
function boucle(maintenant) {
  const dt = Math.min(.05, (maintenant - avant) / 1000); avant = maintenant;
  if (enJeu && !enPause && !gel) mettreAJour(dt);
  const t = maintenant / 1000;
  if (!calme) for (const e of etoiles) if (!e.prise) e.m.rotation.y = t * 1.6;
  for (const d of drapeaux) d.tissu.rotation.y = Math.sin(t * 2 + d.n) * .12;
  if (arrivee.drapeau) arrivee.drapeau.rotation.y = Math.sin(t * 2) * .15;
  placer(dt); renderer.render(scene, camera);
  requestAnimationFrame(boucle);
}
majCompteurs(); reapparaitre(); $("message").hidden = true; $("section").textContent = sections[0].nom; camera.position.set(0, 6, 12);
requestAnimationFrame(boucle);
/* For automatic tests */
window.IleAuxBlocs = { niveau: NIVEAU, chemin: CHEMIN, j, blocs, etoiles, drapeaux, arrivee, cam: lacam, touches, opts, total: TOTAL_ETOILES, pas: mettreAJour, geler: v => { gel = v; }, etat: () => ({ fini, nbEtoiles, dernierDrapeau, enJeu, enPause }) };
})();
