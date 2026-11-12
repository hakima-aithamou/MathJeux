/* Splash of calculations: a water obby with 11 question levels and 3 courses (jeu.html?n=1..11&p=1..3).
   Floating platforms, bobbing buoys, sliding logs and geysers. At each calculation gate, jump onto the
   platform with the right answer: the water curtain opens. Falling into the water = back to the last flag.
   The 3D engine (three.min.js, r128) is in the ile/ folder: no external site is needed. */
(function () {
"use strict";
const $ = id => document.getElementById(id);
/* Question level (n = 1 to 11) and course (p = 1 easy, 2 medium, 3 hard), chosen separately. */
const PARAMS = new URLSearchParams(location.search);
/* 3 groups: Junior (+ −), Expert (× ÷), Challenges. Each level has a small discreet hint. */
const GROUPES = { junior: { nom: "Junior", signe: "+ −", titre: "Additions et soustractions" }, expert: { nom: "Expert", signe: "× ÷", titre: "Multiplications et divisions" }, defis: { nom: "Défis", signe: "★", titre: "Autres défis" } };
const NIVEAUX = [null,
  { g: "junior", indice: "jusqu’à 10", nom: "+ et − jusqu’à 10", texte: "des additions et des soustractions jusqu'à 10" },
  { g: "junior", indice: "de 10 à 20", nom: "+ et − de 10 à 20", texte: "des additions et des soustractions de 10 à 20" },
  { g: "junior", indice: "jusqu’à 50", nom: "+ et − jusqu’à 50", texte: "des additions et des soustractions jusqu'à 50" },
  { g: "junior", indice: "jusqu’à 100", nom: "+ et − jusqu’à 100", texte: "des additions et des soustractions jusqu'à 100" },
  { g: "expert", indice: "jusqu’à 10", nom: "× et ÷ jusqu’à 10", texte: "des multiplications et des divisions jusqu'à 10" },
  { g: "expert", indice: "jusqu’à 20", nom: "× et ÷ jusqu’à 20", texte: "des multiplications et des divisions jusqu'à 20" },
  { g: "expert", indice: "jusqu’à 50", nom: "× et ÷ jusqu’à 50", texte: "des multiplications et des divisions jusqu'à 50" },
  { g: "expert", indice: "jusqu’à 100", nom: "× et ÷ jusqu’à 100", texte: "des multiplications et des divisions jusqu'à 100" },
  { g: "defis", indice: "suites", nom: "Suites et multiples", texte: "des suites de nombres (bonds de 2, 5 et 10) et des multiples" },
  { g: "defis", indice: "doubles", nom: "Doubles et moitiés", texte: "des doubles et des moitiés" },
  { g: "defis", indice: "compléments", nom: "Compléments à 10 et à 100", texte: "des nombres qui manquent pour faire 10 ou 100" }];
/* Short name of a level: "Junior 2", "Expert 1"… */
const rang = n => NIVEAUX.slice(1, n + 1).filter(x => x.g === NIVEAUX[n].g).length;
const nomCourt = n => GROUPES[NIVEAUX[n].g].nom + " " + rang(n);
const NB_NIVEAUX = NIVEAUX.length - 1;
const NIVEAU = Math.min(NB_NIVEAUX, Math.max(1, parseInt(PARAMS.get("n"), 10) || 1));
/* Without "n" in the address: show the level choice first; with "n": the chosen level and the Play button. */
const CHOIX_FAIT = PARAMS.has("n");
const PAGE_CHOIX = "jeu.html";
const PARC = Math.min(3, Math.max(1, parseInt(PARAMS.get("p"), 10) || 1));
const NOMS_PARCOURS = { 1: "facile", 2: "moyen", 3: "difficile" };
const lien = (n, p) => "jeu.html?n=" + n + "&p=" + p;
const memo = { lire(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
               ecrire(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };

/* ---------- Scene ---------- */
const canvas = $("scene");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
/* Bright summer sky over a turquoise lagoon */
scene.background = new THREE.Color(0x9fd8f2);
scene.fog = new THREE.Fog(0x9fd8f2, 80, 220);
const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 400);
scene.add(new THREE.HemisphereLight(0xffffff, 0x3b8fb0, 0.85));
const soleil = new THREE.DirectionalLight(0xfff6e0, 0.85);
soleil.position.set(20, 40, 15); soleil.castShadow = true;
soleil.shadow.mapSize.set(1024, 1024);
Object.assign(soleil.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 120 });
scene.add(soleil, soleil.target);
/* The lagoon, with small lines of foam that drift slowly */
const mer = new THREE.Mesh(new THREE.PlaneGeometry(600, 600, 1, 1), new THREE.MeshLambertMaterial({ color: 0x23a7cf }));
mer.rotation.x = -Math.PI / 2; mer.position.y = -6; mer.receiveShadow = true; scene.add(mer);
const ecume = [];
{ const m = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .5 });
  for (let i = 0; i < 80; i++) { const e = new THREE.Mesh(new THREE.BoxGeometry(2 + Math.random() * 4, .04, .25), m); e.position.set(Math.random() * 150 - 75, -5.96, Math.random() * -220 + 40); scene.add(e); ecume.push({ e, x: e.position.x, v: .3 + Math.random() * .5, p: Math.random() * 6 }); } }
/* White block clouds */
const matNuage = new THREE.MeshLambertMaterial({ color: 0xffffff });
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
  const b = Object.assign({ mesh: m, w, d, h: ep, x, z, y: haut - ep / 2, x0: x, y0: haut - ep / 2, z0: z, dx: 0, dy: 0, dz: 0, type: "sol" }, opts || {});
  blocs.push(b); return b;
}
/* Soft pastel colours */
/* Bright summer colours: aqua docks, green lily pads, orange rafts */
const VERT = 0x7fd3c3, SABLE = 0xffe08a, BLEU = 0x63c46a, ROSE = 0x8fd86b, VIOLET = 0xffb36b, ORANGE = 0xff9f5a, BOIS = 0xb9844f, GRIS = 0xaab4be, OR = 0xe8c774;
const BOUEES = [0xff7a59, 0xffd34d], SABLE_MOU = 0xd8b06a, COUL_EFFET = [0xffffff, 0x9fe6ff];
/* The gate wall is a water curtain */
const MUR_COULEUR = 0x7fe0ff, MUR_OPACITE = .45, MSG_CHUTE = "💦 Plouf ! On repart du dernier drapeau 🚩";
const GAIN_PORTE = 1, MSG_GAIN = "Tu gagnes une étoile ⭐ !", MSG_SABLE = "", COUL_GEYSER = 0x9fe6ff, COUL_JET = 0xd8f6ff;

const sections = [];
const drapeaux = [];
const etoiles = [];
function section(nom) { sections.push({ nom }); }
function drapeau(x, haut, z, n) {
  const g = new THREE.Group();
  const mat1 = new THREE.Mesh(new THREE.BoxGeometry(.18, 3, .18), mat(0xffffff)); mat1.position.y = 1.5; g.add(mat1);
  const tissu = new THREE.Mesh(new THREE.BoxGeometry(1.3, .8, .08), mat(0xe58f7b)); tissu.position.set(.72, 2.55, 0); g.add(tissu);
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
/* Camera direction after each flag: the course goes straight ahead */
const YAW_DRAPEAU = new Array(20).fill(0); let CHEMIN = [];
/* ---------- The calculation gates: one question, 3 answer platforms, a glass wall ---------- */
const portes = [];
const matVerre = new THREE.MeshLambertMaterial({ color: MUR_COULEUR, transparent: true, opacity: MUR_OPACITE });
const VERT_OK = 0x6fb58e, GRIS_NON = 0x9aa3ad;
/* Label always facing the camera (text drawn on a canvas) */
function etiquette(largeur, hauteur, l, h, aPlat) {
  const toile = document.createElement("canvas"); toile.width = largeur; toile.height = hauteur;
  const tex = new THREE.CanvasTexture(toile);
  let sp;
  if (aPlat) { sp = new THREE.Mesh(new THREE.PlaneGeometry(l, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true })); sp.rotation.x = -Math.PI / 2; }
  else { sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true })); sp.scale.set(l, h, 1); }
  scene.add(sp);
  return { sp, ecrire(texte, fond, encre, barre) {
    const c = toile.getContext("2d"); c.clearRect(0, 0, largeur, hauteur);
    const r = hauteur * .22; c.fillStyle = fond || "#ffffff"; c.strokeStyle = "rgba(22,50,79,.55)"; c.lineWidth = 8;
    c.beginPath(); c.moveTo(r, 4); c.arcTo(largeur - 4, 4, largeur - 4, hauteur - 4, r); c.arcTo(largeur - 4, hauteur - 4, 4, hauteur - 4, r); c.arcTo(4, hauteur - 4, 4, 4, r); c.arcTo(4, 4, largeur - 4, 4, r); c.closePath(); c.fill(); c.stroke();
    let taille = hauteur * .62; c.font = "bold " + taille + "px Arial, sans-serif";
    while (c.measureText(texte).width > largeur - 40 && taille > 20) { taille -= 4; c.font = "bold " + taille + "px Arial, sans-serif"; }
    c.fillStyle = encre || "#16324f"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(texte, largeur / 2, hauteur / 2 + 4);
    if (barre) { c.strokeStyle = encre || "#16324f"; c.lineWidth = 12; c.lineCap = "round"; c.beginPath(); c.moveTo(largeur * .22, hauteur * .8); c.lineTo(largeur * .78, hauteur * .2); c.stroke(); }
    tex.needsUpdate = true; } };
}
/* Questions by level. Beginner: + and − up to 30. Intermediate: up to 50. Advanced: sequences, multiples and numbers up to 100. */
const hasardEntre = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
function choixAutour(r, ecarts) {
  const s = new Set([r]);
  for (const e of ecarts.map(x => [x, -x]).flat().sort(() => Math.random() - .5)) { if (s.size >= 3) break; if (r + e >= 0) s.add(r + e); }
  return [...s].sort(() => Math.random() - .5);
}
const Q = (texte, voix, r, ecarts) => ({ texte, voix, r, choix: choixAutour(r, ecarts) });
function plusMoins(k, min, max) {
  const m = max > 20 ? 3 : 1; /* from 50 on: no "+ 1" or "− 1" that are too easy */
  if (k % 2 === 0) { const r = hasardEntre(Math.max(2, min), max), a = hasardEntre(m, r - m); return Q(a + " + " + (r - a) + " = ?", a + " plus " + (r - a) + ", combien ?", r, max > 20 ? [1, 2, 10] : [1, 2]); }
  const a = hasardEntre(Math.max(2, min), max), b = hasardEntre(m, a - m); return Q(a + " − " + b + " = ?", a + " moins " + b + ", combien ?", a - b, max > 20 ? [1, 2, 10] : [1, 2]);
}
/* Multiplications and divisions: the product is between min and max (tables up to 10) */
function foisDivise(k, min, max) {
  const paires = []; for (let a = 2; a <= 10; a++) for (let b = 2; b <= 10; b++) if (a * b >= min && a * b <= max) paires.push([a, b]);
  const [a, b] = paires[hasardEntre(0, paires.length - 1)], p = a * b;
  if (k % 2 === 0) return Q(a + " × " + b + " = ?", a + " fois " + b + ", combien ?", p, [a, 1, 2]);
  return Q(p + " ÷ " + a + " = ?", p + " divisé par " + a + ", combien ?", b, [1, 2]);
}
/* Every third gate of the Junior levels: the same calculation with objects of the world */
const OBJETS_HISTOIRE = [["🐠", "poissons"], ["🐚", "coquillages"], ["🦆", "canards"]];
function histoire(q, k) {
  if (k % 3 !== 1) return q;
  const m = q.texte.match(/^(\d+) ([+−]) (\d+) = \?$/); if (!m) return q;
  const [ico, mot] = OBJETS_HISTOIRE[Math.floor(k / 3) % OBJETS_HISTOIRE.length];
  q.texte = m[1] + " " + ico + " " + m[2] + " " + m[3] + " " + ico + " = ?";
  q.voix = m[1] + " " + mot + (m[2] === "+" ? " plus " : " moins ") + m[3] + " " + mot + ", combien de " + mot + " ?";
  return q;
}
function nouvelleQuestion(k) {
  switch (NIVEAU) {
    case 1: return histoire(plusMoins(k, 2, 10), k);
    case 2: return histoire(plusMoins(k, 11, 20), k);
    case 3: return histoire(plusMoins(k, 21, 50), k);
    case 4: return histoire(plusMoins(k, 51, 100), k);
    case 5: return foisDivise(k, 2, 10);
    case 6: return foisDivise(k, 11, 20);
    case 7: return foisDivise(k, 21, 50);
    case 8: return foisDivise(k, 51, 100);
    case 9: {
      if (k % 3 === 2) { const m = [2, 5, 10][hasardEntre(0, 2)], r = m * hasardEntre(2, 9), faux = new Set();
        while (faux.size < 2) { const x = r + hasardEntre(1, m === 2 ? 1 : m - 1) * (Math.random() < .5 ? 1 : -1); if (x > 0 && x % m) faux.add(x); }
        return { texte: "Multiple de " + m + " ?", voix: "Lequel est un multiple de " + m + " ?", r, choix: [r, ...faux].sort(() => Math.random() - .5) }; }
      const pas = [2, 5, 10][hasardEntre(0, 2)], descend = k % 3 === 1, d = pas * hasardEntre(descend ? 4 : 1, descend ? 9 : 6), sg = descend ? -1 : 1, r = d + 3 * pas * sg;
      return Q(d + ", " + (d + pas * sg) + ", " + (d + 2 * pas * sg) + ", ?", "Quel nombre vient après " + d + ", " + (d + pas * sg) + ", " + (d + 2 * pas * sg) + " ?", r, [1, pas === 2 ? 4 : pas === 5 ? 2 : 5]);
    }
    case 10: { if (k % 2 === 0) { const n = hasardEntre(2, 25); return Q("Double de " + n + " ?", "Quel est le double de " + n + " ?", 2 * n, [1, 2, n > 10 ? 10 : 3]); }
      const n = 2 * hasardEntre(2, 25); return Q("Moitié de " + n + " ?", "Quelle est la moitié de " + n + " ?", n / 2, [1, 2, 10]); }
    default: { if (k % 2 === 0) { const a = hasardEntre(1, 9); return Q(a + " + ? = 10", a + " plus combien égale 10 ?", 10 - a, [1, 2]); }
      const a = 5 * hasardEntre(2, 19); return Q(a + " + ? = 100", a + " plus combien égale 100 ?", 100 - a, [5, 10]); }
  }
}
/* Building the course with a "cursor": front edge (zc) and height (hc) of the last block placed */
let zc = -5, hc = 0, nDrapeau = 0;
/* The 3 answer platforms have the same neutral colour: only the number matters */
const REPONSE = 0xf3e9d4, COUL = [REPONSE, REPONSE, REPONSE];
function marches(n, dh, w) { for (let k = 0; k < n; k++) { hc += dh; pilier(0, zc - 1.6, w || 3, 2, hc, [SABLE, ORANGE][k % 2]); zc -= 2.2; } }
function ilots(n, w, ecart, zig) { for (let k = 0; k < n; k++) { const x = zig ? (k % 2 ? 1.4 : -1.4) : 0, z = zc - ecart - w / 2; pilier(x, z, w, w, hc, [BLEU, ROSE][k % 2]); zc = z - w / 2; } }
function pont(long, w) { pilier(0, zc - .6 - long / 2, w, long, hc, BOIS); zc -= long + .6; }
function radeaux(n, vitesse) { for (let k = 0; k < n; k++) { const z = zc - 3.4; plaque(0, z, 2.6, 2.6, hc, VIOLET, { mobile: { amp: .9, vitesse, phase: k * 1.7 } }); zc = z - 1.3; } }
function porte() {
  const k = portes.length;
  const zq = zc - .8 - 2.5; pilier(0, zq, 9, 5, hc, VERT);
  const zr = zq - 4.8, plats = [-3.2, 0, 3.2].map((x, i) => pilier(x, zr, 2.6, 2.6, hc, COUL[i], { reponse: k, idx: i }));
  const zb = zr - 2.05, mur = pilier(0, zb, 40, .5, hc + 8, 0x9fd8f0); mur.mesh.material = matVerre; mur.mesh.scale.x = 11; /* 11 wide is visible, but the wall blocks across 40 */ mur.mesh.children[0].visible = false; mur.mesh.castShadow = false;
  const zl = zb - 3.25; pilier(0, zl, 9, 5, hc, VERT); nDrapeau++; drapeau(-3, hc, zl - 1, nDrapeau);
  const panneau = etiquette(1024, 230, 6.6, 1.5, true); panneau.sp.rotation.x = 0; panneau.sp.position.set(0, hc + 2.3, zb + .3); /* the question stands on the glass wall, behind the answers: the character does not hide it */
  const nums = plats.map(p => { const e = etiquette(256, 200, 2.3, 1.8, true); e.sp.position.set(p.x, hc + .02, p.z); /* the number is written on the platform */ return e; });
  portes.push({ k, zq, zr, h: hc, plats, mur, panneau, nums, resolu: false, essais: new Set() });
  section("Porte des calculs " + (k + 1));
  zc = zl - 2.5;
}
function arriveeFinale() { pilier(0, zc - 4, 6, 6, hc, VERT); plaque(0, zc - 5, 3.2, 3.2, hc + .5, OR); poserArrivee(0, hc + .5, zc - 5); }
/* Scenery animations and small particle bursts (splash of water or puff of sand) */
const animations = [], particules = [];
function effetChute(x, y, z) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  for (let i = 0; i < 16; i++) {
    const m = new THREE.Mesh(geoBloc, mat(COUL_EFFET[i % 2])), t = .14 + Math.random() * .16; m.scale.set(t, t, t); m.position.set(x, y + .2, z); scene.add(m);
    particules.push({ m, vx: (Math.random() - .5) * 4, vy: 3 + Math.random() * 4, vz: (Math.random() - .5) * 4, vie: 1.1 });
  }
}
function animerDecor(t, dt) {
  for (const f of animations) f(t, dt);
  for (let i = particules.length - 1; i >= 0; i--) { const p = particules[i]; p.vie -= dt; p.vy -= 14 * dt;
    p.m.position.x += p.vx * dt; p.m.position.y += p.vy * dt; p.m.position.z += p.vz * dt;
    if (p.vie <= 0) { scene.remove(p.m); particules.splice(i, 1); } }
}
/* Platforms that slide left and right (log, flying carpet) */
function glisseurs(n, vitesse, couleur) { for (let k = 0; k < n; k++) { const z = zc - 3.4; plaque(0, z, 2.4, 2.4, hc, couleur, { mobile: { axe: "x", amp: 2.2, vitesse, phase: k * 1.9 } }); zc = z - 1.2; } }
/* Platforms that go up and down (buoys) */
function bouees(n, vitesse, couleurs) { for (let k = 0; k < n; k++) { const x = k % 2 ? 1.2 : -1.2, z = zc - 2.4 - 1.1; plaque(x, z, 2.2, 2.2, hc, couleurs[k % couleurs.length], { mobile: { axe: "y", amp: .7, vitesse, phase: k * 1.3 } }); zc = z - 1.1; } }
/* Geyser: a bouncing platform that sends the player up to a higher platform */
function geyser(monte) {
  const z = zc - 2.6, b = plaque(0, z, 2.4, 2.4, hc + .3, 0x9fe6ff, { type: "trampo" });
  const jet = new THREE.Mesh(new THREE.CylinderGeometry(.5, .8, 1, 10, 1, true), new THREE.MeshLambertMaterial({ color: COUL_JET, transparent: true, opacity: .45 }));
  jet.position.set(0, hc + 1, z); scene.add(jet);
  animations.push(t => { const h = 1.6 + Math.sin(t * 5) * .4; jet.scale.y = h; jet.position.y = b.y + .3 + h / 2; });
  zc = z - 1.2; hc += monte; const z2 = zc - 2.2 - 1.5; pilier(0, z2, 3.2, 3, hc, VERT); zc = z2 - 1.5;
}
/* Sinking sand: the platform sinks while the player stands on it, then collapses */
let sableVu = false;
function sableMouvant(n) { for (let k = 0; k < n; k++) { const x = k % 2 ? 1.1 : -1.1, z = zc - 1.6 - 1.2; pilier(x, z, 2.4, 2.4, hc, SABLE_MOU, { coule: { t: 0, s: 0, tombe: 0 } }); zc = z - 1.2; } }
function majSable(b, dt) {
  const c = b.coule; if (c.y0 === undefined) c.y0 = b.y;
  b.dy = 0;
  if (c.tombe > 0) { c.tombe -= dt; if (c.tombe <= 0) { c.s = 0; b.y = c.y0; b.mesh.position.y = c.y0; b.mesh.visible = true; } return; }
  const dessusMoi = j.sol === b;
  if (dessusMoi) { c.t += dt; if (!sableVu) { sableVu = true; dire(MSG_SABLE, 2600); } if (c.t > .4) c.s += dt * .8; }
  else { c.t = 0; c.s = Math.max(0, c.s - dt * .5); }
  if (c.s >= 1.5) { c.tombe = 2.5; effetChute(b.x, b.y + b.h / 2, b.z); b.y = c.y0 - 40; b.mesh.position.y = b.y; b.mesh.visible = false; return; }
  const ny = c.y0 - c.s; b.dy = ny - b.y; b.y = ny; b.mesh.position.y = ny;
  if (dessusMoi) j.y += b.dy;
}
function remettreSable() { for (const b of blocs) if (b.coule) { const c = b.coule; if (c.y0 !== undefined) { b.y = c.y0; b.mesh.position.y = c.y0; } c.s = c.t = c.tombe = 0; b.mesh.visible = true; } }
/* Cactus: touching it sends the player back to the last flag */
const piquants = [];
function cactus(x, y, z) {
  const g = new THREE.Group(), vc = mat(0x4f9a4f), vf = mat(0x3d8043), epine = mat(0xf4ecd0);
  const c = (w, h, d, px, py, pz, m) => { const b = new THREE.Mesh(geoBloc, m); b.scale.set(w, h, d); b.position.set(px, py, pz); b.castShadow = true; g.add(b); };
  c(.5, 1.7, .5, 0, .85, 0, vc); c(.35, .2, .2, -.4, .8, 0, vf); c(.2, .55, .2, -.5, 1.1, 0, vf); c(.35, .2, .2, .4, 1.05, 0, vf); c(.2, .45, .2, .5, 1.3, 0, vf);
  for (let i = 0; i < 6; i++) c(.06, .06, .06, (i % 2 ? .27 : -.27), .35 + i * .22, (i % 3 - 1) * .15, epine);
  g.position.set(x, y, z); scene.add(g); piquants.push({ x, y, z });
}
function allee(long, n) { pilier(0, zc - .6 - long / 2, 4, long, hc, SABLE); for (let i = 0; i < n; i++) cactus(i % 2 ? .6 : -.6, hc, zc - .6 - long * (i + 1) / (n + 1)); zc -= long + .6; }
/* Coins to pick up along the course (they go into the piggy bank) */
const pieces = [];
const matPiece = new THREE.MeshLambertMaterial({ color: 0xffd34d, emissive: 0x6b4a00 });
function piece(x, y, z) {
  const g = new THREE.Group(), m = new THREE.Mesh(new THREE.CylinderGeometry(.34, .34, .09, 18), matPiece); m.rotation.x = Math.PI / 2; m.castShadow = true; g.add(m);
  g.position.set(x, y + 1, z); scene.add(g); pieces.push({ g, x, y: y + 1, z, prise: false });
}
animations.push(t => { for (const c of pieces) if (!c.prise) c.g.rotation.y = t * 2; });
/* Treasure chests: one on the landing of each gate (key k) and a big one at the finish (key -1) */
const coffres = {};
const matOr = new THREE.MeshLambertMaterial({ color: 0xf4c542, emissive: 0x5a4000 });
function coffre(k, x, y, z, taille, gain) {
  const s = taille || 1, g = new THREE.Group(), bois = mat(0x9a5b2e), bois2 = mat(0x7a4420);
  const bx = (m, w, h, d, px, py, pz, p) => { const b = new THREE.Mesh(geoBloc, m); b.scale.set(w * s, h * s, d * s); b.position.set(px * s, py * s, pz * s); b.castShadow = true; (p || g).add(b); return b; };
  bx(bois, 1.3, .7, .85, 0, .35, 0); bx(matOr, 1.34, .1, .89, 0, .68, 0); bx(matOr, .12, .72, .89, -.5, .36, 0); bx(matOr, .12, .72, .89, .5, .36, 0);
  bx(mat(0xffe9a3), 1.15, .05, .7, 0, .7, 0); /* gold coins inside */
  const lid = new THREE.Group(); lid.position.set(0, .7 * s, -.42 * s); g.add(lid);
  bx(bois2, 1.3, .32, .85, 0, .16, .42, lid); bx(matOr, 1.34, .1, .89, 0, .3, .42, lid); bx(matOr, .22, .26, .06, 0, .02, .86, lid);
  g.position.set(x, y, z); scene.add(g); coffres[k] = { g, lid, x, y, z, ouvert: false, gain: gain || 0, a: 0 };
}
function ouvrirCoffre(k) {
  const c = coffres[k]; if (!c || c.ouvert) return; c.ouvert = true;
  if (c.gain) { tirelire.etoiles += c.gain; sauverTirelire(); majSoldes(); }
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) for (let i = 0; i < 14; i++) {
    const m = new THREE.Mesh(geoBloc, matPiece); m.scale.set(.22, .22, .06); m.position.set(c.x, c.y + 1, c.z); scene.add(m);
    particules.push({ m, vx: (Math.random() - .5) * 3, vy: 4 + Math.random() * 3, vz: (Math.random() - .5) * 3, vie: 1.2 }); }
}
animations.push((t, dt) => { for (const k in coffres) { const c = coffres[k], but = c.ouvert ? -1.9 : 0; c.a += (but - c.a) * Math.min(1, dt * 5); c.lid.rotation.x = c.a; } });
function fermerCoffres() { for (const k in coffres) coffres[k].ouvert = false; for (const c of pieces) { c.prise = false; c.g.visible = true; } }
const PARCOURS = {
1() { pilier(0, 0, 10, 10, 0, VERT); section("Départ"); marches(3, .5); porte(); ilots(3, 3, 1.4); porte(); radeaux(2, .5); porte(); bouees(3, .8, BOUEES); porte(); arriveeFinale(); },
2() { pilier(0, 0, 10, 10, 0, VERT); section("Départ"); marches(4, .5); porte(); bouees(4, 1, BOUEES); porte(); geyser(3.5); porte(); glisseurs(3, .6, BOIS); porte(); ilots(4, 2.2, 1.5, true); porte(); arriveeFinale(); },
3() { pilier(0, 0, 10, 10, 0, VERT); section("Départ"); marches(4, .8, 1.6); porte(); geyser(3.5); porte(); bouees(5, 1.2, BOUEES); porte(); glisseurs(4, .8, BOIS); porte(); radeaux(4, .75); porte(); ilots(4, 1.6, 1.7, true); porte(); arriveeFinale(); }
};
PARCOURS[PARC]();
/* Writes the questions on the signs and resets the gates */
function preparerPortes() {
  for (const p of portes) {
    p.q = nouvelleQuestion(p.k); p.resolu = false; p.essais = new Set();
    p.panneau.ecrire(p.q.texte, "#fff3c4", "#16324f"); p.panneau.sp.visible = true;
    p.plats.forEach((b, i) => { b.mesh.material = mat(COUL[i]); p.nums[i].ecrire(String(p.q.choix[i])); });
    if (!blocs.includes(p.mur)) blocs.push(p.mur);
    p.mur.mesh.visible = true; p.mur.mesh.position.y = p.mur.y; p.mur.disparait = 0; p.panneau.sp.position.y = p.h + 2.3;
  }
}
preparerPortes();
let erreurs = 0;
const porteActuelle = () => portes.find(p => !p.resolu) || null;
/* The question and its 3 choices are written on a sign on the avatar's back:
   the camera is behind it, so the student always sees it while playing. It shows the question of the next gate. */
const toileDos = document.createElement("canvas"); toileDos.width = 640; toileDos.height = 500;
const texDos = new THREE.CanvasTexture(toileDos);
const pancarte = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.72), new THREE.MeshBasicMaterial({ map: texDos, transparent: true }));
pancarte.position.set(0, 3.85, -1.1); /* behind and above the head: the whole character is visible */ pancarte.rotation.y = Math.PI; pancarte.visible = false; /* added to the avatar further down */
function dessinerDos(p) {
  const c = toileDos.getContext("2d"), W = toileDos.width, H = toileDos.height;
  const boite = (x, y, w, h, r, fond, trait, ep) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); c.fillStyle = fond; c.fill(); if (trait) { c.lineWidth = ep; c.strokeStyle = trait; c.stroke(); } };
  c.clearRect(0, 0, W, H);
  boite(8, 8, W - 16, H - 16, 40, "#1e2b38", "#e8c774", 12);
  c.textAlign = "center"; c.textBaseline = "middle";
  c.fillStyle = "#bccbd6"; c.font = "bold 30px Arial, sans-serif"; c.fillText("Porte " + (p.k + 1) + " / " + portes.length, W / 2, 52);
  let t = 112; c.font = "bold " + t + "px Arial, sans-serif"; while (c.measureText(p.q.texte).width > W - 70 && t > 40) { t -= 6; c.font = "bold " + t + "px Arial, sans-serif"; }
  c.fillStyle = "#ffffff"; c.fillText(p.q.texte, W / 2, 158);
  const lw = 172, gap = 22, x0 = (W - 3 * lw - 2 * gap) / 2;
  p.q.choix.forEach((n, i) => { const x = x0 + i * (lw + gap), barre = p.essais.has(i);
    boite(x, 262, lw, 128, 24, barre ? "#5b6672" : "#ffffff");
    c.fillStyle = barre ? "#c4ccd4" : "#16324f"; c.font = "bold 84px Arial, sans-serif"; c.fillText(String(n), x + lw / 2, 330);
    if (barre) { c.strokeStyle = "#c4ccd4"; c.lineWidth = 10; c.lineCap = "round"; c.beginPath(); c.moveTo(x + 30, 370); c.lineTo(x + lw - 30, 290); c.stroke(); } });
  c.fillStyle = "#e8c774"; c.font = "bold 36px Arial, sans-serif"; c.fillText("Touche la bonne réponse", W / 2, 442);
  texDos.needsUpdate = true;
}
let dosVisible = null;
/* The 3D sign is no longer shown: the question is in the card at the bottom of the screen. The card is updated when the gate or the attempts change. */
function majGrandeQuestion() {
  const p = porteActuelle(), cle = p && enJeu && !fini ? p.k + ":" + p.essais.size + ":" + p.q.texte + ":" + presDeLaPorte(p) : "";
  if (cle === dosVisible) return; dosVisible = cle; pancarte.visible = false; majQuestion();
}
/* Question card, bottom centre under the character: the question and the 3 choices.
   Touch a choice: the character jumps on its own onto that number's platform. The student can also jump there themselves. */
const presDeLaPorte = p => !!p && j.z < p.zq + 3.2;
function majQuestion() {
  const p = porteActuelle(), c = $("carteQuestion");
  if (!p || !enJeu || fini) { c.hidden = true; return; }
  const pres = presDeLaPorte(p);
  c.hidden = false; c.classList.toggle("loin", !pres); $("txtQuestion").textContent = p.q.texte; $("numPorte").textContent = "Porte " + (p.k + 1) + " / " + portes.length;
  $("cqAide").textContent = pres ? "Touche ou saute sur la bonne plateforme" : "Avance jusqu'à la porte ▲";
  /* the choices are no longer in the card: they are written on the platforms */
}
/* Automatic jump to the chosen platform */
let auto = null;
function choisir(i) {
  const p = porteActuelle(); canvas.focus();
  if (!p || !enJeu || enPause || fini || auto || p.essais.has(i)) return;
  if (!presDeLaPorte(p)) { dire("Avance jusqu'à la porte des calculs pour répondre ▲", 2200); return; }
  const b = p.plats[i];
  auto = { x0: j.x, y0: j.y, z0: j.z, x1: b.x, y1: p.h, z1: b.z, t: 0, d: .8, b };
  j.angle = Math.atan2(b.x - j.x, b.z - j.z);
}
/* Reading the question aloud (only when 🔊 is touched) */
let voixFr = null;
const choisirVoix = () => { if (!window.speechSynthesis) return; const v = speechSynthesis.getVoices(); voixFr = v.find(x => /^fr[-_]CA/i.test(x.lang)) || v.find(x => /^fr/i.test(x.lang)) || null; };
if (window.speechSynthesis) { choisirVoix(); try { speechSynthesis.addEventListener("voiceschanged", choisirVoix); } catch (e) {} }
let derniereVoix = null;
function parler(t) { if (!window.speechSynthesis || !t) return; try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); if (voixFr) { u.voice = voixFr; u.lang = voixFr.lang; } else u.lang = "fr-CA"; u.rate = .88; derniereVoix = u; speechSynthesis.speak(u); } catch (e) {} }
/* The student lands on an answer platform */
function repondre(b) {
  const p = portes[b.reponse]; if (!p || p.resolu) return;
  const n = p.q.choix[b.idx];
  if (n === p.q.r) {
    p.resolu = true; ouvrirCoffre(p.k); b.mesh.material = mat(VERT_OK); p.nums[b.idx].ecrire("✓ " + n, "#d9f5df", "#1f6334");
    blocs.splice(blocs.indexOf(p.mur), 1); p.mur.disparait = 1;
    p.panneau.ecrire(p.q.texte.startsWith("Multiple") ? n + " est un multiple !" : p.q.texte.replace("?", n), "#d9f5df");
    nbEtoiles++; tirelire.etoiles += GAIN_PORTE; sauverTirelire(); majCompteurs(); majSoldes();
    dire("✅ Bravo ! La bonne réponse est " + n + ". " + MSG_GAIN, 2600); majQuestion(); sonEffet("bravo");
  } else {
    if (!p.essais.has(b.idx)) { p.essais.add(b.idx); erreurs++; }
    b.mesh.material = mat(GRIS_NON); p.nums[b.idx].ecrire(String(n), "#e5e7eb", "#8a939c", true); /* crossed-out number (no "✗" that looks like "×") */
    j.x = 0; j.y = p.h + .2; j.z = p.zq - 1; j.vx = j.vy = j.vz = 0; j.sol = null; lacam.cible = 0;
    dire("Ce n'est pas " + n + ". Regarde bien la question et essaie encore !", 2800); sonEffet("encore");
  }
}

/* ---------- Scenery around the lagoon (scenery only: it cannot be walked on) ---------- */
(function () {
  let graine = 11; const hasard = () => (graine = (graine * 16807) % 2147483647) / 2147483647;
  const m = c => new THREE.MeshLambertMaterial({ color: c });
  const M = { sable: m(0xf3dca2), sable2: m(0xe8c987), tronc: m(0x9a6b3e), palme: m(0x3fae5a), palme2: m(0x5cc46e), coco: m(0x6b4426), blanc: m(0xffffff), rouge: m(0xe5534b),
    jaune: m(0xffd34d), bleu: m(0x3f7fd6), coque: m(0x8a5a35), dauphin: m(0x7f9db5), ventre: m(0xdfe8ee), piscine: m(0x5fd0f0), lampe: new THREE.MeshLambertMaterial({ color: 0xffe08a, emissive: 0x806000 }) };
  const geo = new THREE.BoxGeometry(1, 1, 1);
  function boite(mat, w, h, d, x, y, z, parent, ombre) { const b = new THREE.Mesh(geo, mat); b.scale.set(w, h, d); b.position.set(x, y, z); b.castShadow = ombre !== false; b.receiveShadow = true; parent.add(b); return b; }
  let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
  for (const bl of blocs) { x0 = Math.min(x0, bl.x - bl.w / 2); x1 = Math.max(x1, bl.x + bl.w / 2); z0 = Math.min(z0, bl.z); z1 = Math.max(z1, bl.z); }
  const libre = (x, z, w, d) => !blocs.some(bl => Math.abs(bl.x - x) < bl.w / 2 + w / 2 + 4 && Math.abs(bl.z - z) < bl.d / 2 + d / 2 + 4);
  function palmier(g, x, y, z) {
    const t = .8 + hasard() * .5, pente = (hasard() - .5) * .5;
    for (let k = 0; k < 5; k++) boite(M.tronc, .4 * t, .9 * t, .4 * t, x + pente * k * .35, y + (.45 + k * .85) * t, z, g);
    const hx = x + pente * 1.6, hy = y + 4.5 * t;
    for (let k = 0; k < 5; k++) { const f = new THREE.Mesh(geo, k % 2 ? M.palme : M.palme2); f.scale.set(2.6 * t, .12, .6 * t); f.position.set(hx, hy, z);
      f.rotation.y = k * Math.PI * 2 / 5; f.rotation.z = -.35; f.translateX(1.1 * t); f.castShadow = true; g.add(f); }
    boite(M.coco, .3, .3, .3, hx + .25, hy - .3, z, g); boite(M.coco, .3, .3, .3, hx - .2, hy - .3, z + .2, g);
  }
  function parasol(g, x, y, z, coul) {
    boite(M.blanc, .12, 2.2, .12, x, y + 1.1, z, g);
    const c = new THREE.Mesh(new THREE.ConeGeometry(1.5, .7, 8), coul); c.position.set(x, y + 2.35, z); c.castShadow = true; g.add(c);
    boite(hasard() < .5 ? M.bleu : M.rouge, 1, .05, 2, x + 1.4, y + .03, z, g, false);
  }
  function plage(x, z, w, d) {
    const g = new THREE.Group(); scene.add(g);
    boite(M.sable2, w + 3, 1.6, d + 3, x, -5.4, z, g, false); boite(M.sable, w, 2.6, d, x, -4.3, z, g, false);
    const y = -3;
    for (let i = 0; i < 3 + Math.floor(hasard() * 3); i++) palmier(g, x + (hasard() - .5) * (w - 2), y, z + (hasard() - .5) * (d - 2));
    parasol(g, x + (hasard() - .5) * (w - 4), y, z + (hasard() - .5) * (d - 4), hasard() < .5 ? M.rouge : M.jaune);
  }
  function voilier(x, z, coul) {
    const g = new THREE.Group(); g.position.set(x, -6, z); g.rotation.y = hasard() * Math.PI; scene.add(g);
    boite(M.coque, 3.4, .8, 1.3, 0, .3, 0, g); boite(M.blanc, 3, .1, 1.1, 0, .75, 0, g); boite(M.blanc, .12, 4, .12, .2, 2.7, 0, g);
    const f = new THREE.Shape(); f.moveTo(0, 0); f.lineTo(2.2, 0); f.lineTo(0, 3.4); f.lineTo(0, 0);
    const voile = new THREE.Mesh(new THREE.ExtrudeGeometry(f, { depth: .05, bevelEnabled: false }), coul); voile.position.set(.3, 1, 0); voile.castShadow = true; g.add(voile);
    const ph = hasard() * 6; animations.push(t => { g.position.y = -6 + Math.sin(t * 1.3 + ph) * .15; g.rotation.z = Math.sin(t * 1.1 + ph) * .05; });
  }
  function toboggan(x, z) {
    const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    boite(M.piscine, 9, .3, 9, 0, -5.8, 0, g, false); boite(M.blanc, 9.6, .5, 9.6, 0, -5.95, 0, g, false);
    for (const [a, b] of [[-1.3, -1.3], [1.3, -1.3], [-1.3, 1.3], [1.3, 1.3]]) boite(M.blanc, .3, 18, .3, a, 3, b, g);
    boite(M.bleu, 3.2, .3, 3.2, 0, 12, 0, g); boite(M.rouge, 3.4, .2, 3.4, 0, 14.5, 0, g);
    for (let i = 0; i < 40; i++) { const a = i * .33, r = 3.4, s = new THREE.Mesh(geo, i % 2 ? M.rouge : M.jaune);
      s.scale.set(1.5, .3, 1.2); s.position.set(Math.cos(a) * r, 12 - i * .44, Math.sin(a) * r); s.rotation.y = -a; s.castShadow = true; g.add(s); }
  }
  function phare(x, z) {
    const g = new THREE.Group(); g.position.set(x, -6, z); scene.add(g);
    boite(M.sable2, 6, 2, 6, 0, 1, 0, g, false);
    for (let k = 0; k < 6; k++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(1.4 - k * .1, 1.5 - k * .1, 2, 12), k % 2 ? M.blanc : M.rouge); c.position.y = 3 + k * 2; c.castShadow = true; g.add(c); }
    const l = new THREE.Mesh(new THREE.CylinderGeometry(.8, .8, 1.2, 10), M.lampe); l.position.y = 14.6; g.add(l);
    const toit = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1, 10), M.rouge); toit.position.y = 15.7; g.add(toit);
  }
  function dauphin(x, z, ph) {
    const g = new THREE.Group(); scene.add(g);
    boite(M.dauphin, 1.8, .55, .55, 0, 0, 0, g); boite(M.ventre, 1.4, .2, .5, 0, -.25, 0, g); boite(M.dauphin, .5, .25, .3, 1.1, -.05, 0, g);
    boite(M.dauphin, .3, .45, .12, -.1, .4, 0, g); boite(M.dauphin, .2, .15, .8, -1, 0, 0, g);
    animations.push(t => { const u = ((t + ph) % 6) / 1.4; if (u > 1) { g.visible = false; return; } g.visible = true;
      g.position.set(x - 4 + u * 8, -6.3 + Math.sin(u * Math.PI) * 3.2, z); g.rotation.z = Math.cos(u * Math.PI) * .9; });
  }
  /* Beaches, sailboats, a giant water slide, a lighthouse and dolphins on both sides of the course */
  const gauche = x0 - 16, droite = x1 + 16;
  for (let z = z1 + 6, k = 0; z > z0 - 20; z -= 26, k++) {
    const cote = k % 2 ? gauche : droite, w = 9 + hasard() * 5, d = 8 + hasard() * 5;
    if (libre(cote, z, w, d)) plage(cote + (k % 2 ? -3 : 3), z, w, d);
    const autre = k % 2 ? droite + 6 : gauche - 6;
    if (libre(autre, z - 12, 4, 4)) voilier(autre, z - 12, [M.blanc, M.rouge, M.jaune][k % 3]);
  }
  toboggan(gauche - 8, (z0 + z1) / 2); phare(droite + 10, z0 + 10);
  for (let i = 0; i < 4; i++) dauphin(i % 2 ? gauche - 2 : droite + 2, z1 - 20 - i * 30, i * 1.5);
  animations.push(t => { for (const o of ecume) o.e.position.x = o.x + Math.sin(t * o.v + o.p) * 1.5; });
  /* Green islands far away */
  const montM = [m(0x3f9a63), m(0x56ad6c), m(0x2f8a5a)];
  const mcx = (x0 + x1) / 2, mcz = (z0 + z1) / 2, rayon = Math.max(120, Math.hypot(x1 - x0, z1 - z0) / 2 + 80);
  for (let i = 0; i < 14; i++) {
    const a = i / 14 * Math.PI * 2 + hasard() * .2, r = rayon + hasard() * 40, h = 12 + hasard() * 16, base = 16 + hasard() * 12;
    const cx = mcx + Math.sin(a) * r, cz = mcz + Math.cos(a) * r;
    const mont = new THREE.Mesh(new THREE.ConeGeometry(base, h, 6), montM[i % 3]); mont.position.set(cx, -6 + h / 2, cz); scene.add(mont);
    const bord = new THREE.Mesh(new THREE.CylinderGeometry(base + 3, base + 3, .6, 6), M.sable); bord.position.set(cx, -5.8, cz); scene.add(bord);
  }
})();


/* One star per gate passed */
const TOTAL_ETOILES = portes.length, TOTAL_DRAPEAUX = drapeaux.length;

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
/* Swim ring around the waist */
{ const r = new THREE.Mesh(new THREE.TorusGeometry(.42, .12, 8, 16), mat(0xff7a59)); r.rotation.x = Math.PI / 2; r.position.y = .85; r.castShadow = true; corps.add(r); }
/* Round shadow under the avatar: helps to aim the jumps */
/* Characters, accessories and tools bought with stars (shared by the block games) */
Personnages.init({ jeu: "splash", corps, jambeG, jambeD, brasG, brasD, portefeuille: { lire: () => tirelire.etoiles, depenser: n => { tirelire.etoiles = Math.max(0, tirelire.etoiles - n); sauverTirelire(); if (typeof majSoldes === "function") majSoldes(); }, gagner: n => { tirelire.etoiles += n; sauverTirelire(); if (typeof majSoldes === "function") majSoldes(); } } });
const ombre = new THREE.Mesh(new THREE.CircleGeometry(.42, 24), new THREE.MeshBasicMaterial({ color: 0x16324f, transparent: true, opacity: .28, depthWrite: false }));
ombre.rotation.x = -Math.PI / 2; scene.add(ombre);

/* ---------- Player state ---------- */
const DEMI = .32, HAUT = 2.15;
const j = { x: 0, y: 0, z: 3, vx: 0, vy: 0, vz: 0, sol: null, coyote: 0, tampon: 0, angle: Math.PI, marche: 0 };
let horloge = 0, depart = { x: 0, y: 0, z: 3 }, dernierDrapeau = 0, nbEtoiles = 0, enJeu = false, enPause = false, fini = false, chrono = 0;
let lacam = { yaw: 0, pitch: .38, dist: 8.5, cible: null };
const opts = { vitesse: 1, aide: PARC < 3 };

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
const viseur = new THREE.Raycaster(), pointeur = new THREE.Vector2();
function plateformeTouchee(e) {
  const p = porteActuelle(); if (!p || !presDeLaPorte(p)) return -1;
  const r = canvas.getBoundingClientRect(); pointeur.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
  viseur.setFromCamera(pointeur, camera);
  const cibles = p.plats.map(b => b.mesh).concat(p.nums.map(n => n.sp));
  const h = viseur.intersectObjects(cibles, false)[0]; if (!h) return -1;
  const i = cibles.indexOf(h.object); return i % 3;
}
canvas.addEventListener("pointerup", e => {
  if (toucher && performance.now() - toucher.t < 350 && enJeu && !enPause) { const i = plateformeTouchee(e); if (i >= 0) choisir(i); else j.tampon = .15; }
  toucher = null; glisse = null; });
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
  if (auto) { /* the character jumps to the chosen answer */
    auto.t += dt; const u = Math.min(1, auto.t / auto.d);
    j.x = auto.x0 + (auto.x1 - auto.x0) * u; j.z = auto.z0 + (auto.z1 - auto.z0) * u; j.y = auto.y0 + (auto.y1 - auto.y0) * u + Math.sin(Math.PI * u) * 1.8;
    j.marche += dt * 8; jambeG.rotation.x = Math.sin(j.marche) * .5; jambeD.rotation.x = -Math.sin(j.marche) * .5;
    if (u >= 1) { const b = auto.b; auto = null; j.vx = j.vy = j.vz = 0; j.y = auto === null ? b.y + b.h / 2 : j.y; j.sol = b; repondre(b); }
    return;
  }
  const t = horloge;
  /* Moving platforms: carry the player standing on them */
  for (const b of blocs) if (b.mobile) {
    const ax = b.mobile.axe || "z", base = b[ax + "0"];
    const nv = base + (opts.calme ? 0 : Math.sin(t * b.mobile.vitesse + b.mobile.phase) * b.mobile.amp);
    b.dx = b.dy = b.dz = 0; b["d" + ax] = nv - b[ax]; b[ax] = nv; b.mesh.position[ax] = nv;
  }
  if (j.sol && j.sol.mobile) { j.x += j.sol.dx; j.y += j.sol.dy; j.z += j.sol.dz; }
  if (!opts.calme) for (const b of blocs) if (b.coule) majSable(b, dt);
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
  if (j.tampon > 0 && j.coyote > 0) { j.vy = (opts.aide ? 9.4 : 8.6) + (opts.bottes ? 2.2 : 0); j.sol = null; j.coyote = 0; j.tampon = 0; }
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
  /* Answer platform: the answer is checked as soon as the player lands on it */
  if (j.sol && j.sol.reponse !== undefined) repondre(j.sol);
  for (const p of portes) if (p.mur.disparait && p.mur.mesh.visible) { p.mur.mesh.position.y -= dt * 7; p.panneau.sp.position.y -= dt * 7; if (p.mur.mesh.position.y < p.mur.y - p.mur.h) { p.mur.mesh.visible = false; p.panneau.sp.visible = false; } }
  /* Fall: calm return to the last flag */
  if (j.y < -5) { effetChute(j.x, -6, j.z); reapparaitre(MSG_CHUTE); return; }
  for (const c of piquants) if (Math.hypot(j.x - c.x, j.z - c.z) < .7 && j.y < c.y + 1.5 && j.y > c.y - .6) { effetChute(j.x, j.y, j.z); reapparaitre("Aïe ! Un cactus 🌵 On repart du dernier drapeau."); return; }
  /* Coins */
  for (const c of pieces) if (!c.prise && Math.hypot(j.x - c.x, j.z - c.z) < 1 && Math.abs(j.y + 1 - c.y) < 1.4) { c.prise = true; c.g.visible = false; tirelire.etoiles++; sauverTirelire(); majSoldes(); }
  /* Stars */
  for (const e of etoiles) if (!e.prise && Math.hypot(j.x - e.x, j.z - e.z) < .9 && Math.abs(j.y + 1 - e.y) < 1.4) {
    e.prise = true; e.m.visible = false; nbEtoiles++; majCompteurs(); dire("⭐ Une étoile ! " + nbEtoiles + " / " + TOTAL_ETOILES, 1600);
  }
  /* Flags */
  for (const d of drapeaux) if (!d.atteint && Math.hypot(j.x - d.x, j.z - d.z) < 2.4 && Math.abs(j.y - d.y) < 1) {
    d.atteint = true; d.tissu.material = mat(0x6fb58e); dernierDrapeau = Math.max(dernierDrapeau, d.n); lacam.cible = YAW_DRAPEAU[d.n]; depart = { x: d.x + .8, y: d.y, z: d.z }; majCompteurs();
    dire("🚩 Drapeau " + d.n + " : si tu tombes, tu repars d'ici.", 2600);
  }
  /* Finish */
  if (!fini && Math.hypot(j.x - arrivee.x, j.z - arrivee.z) < 1.8 && Math.abs(j.y - arrivee.y) < .6) gagner();
  /* Big question at the top of the screen when arriving in front of a gate */
  majGrandeQuestion();
  /* Stage name */
  let s = sections[0]; for (const x of sections) if (dernierDrapeau >= sections.indexOf(x)) s = x; $("section").textContent = s.nom;
  /* Walking animation */
  const vitesse = Math.hypot(j.vx, j.vz);
  j.marche += dt * vitesse * 2.2;
  const amp = j.sol ? Math.min(.7, vitesse / 6) : .35;
  jambeG.rotation.x = Math.sin(j.marche) * amp; jambeD.rotation.x = -Math.sin(j.marche) * amp;
  brasG.rotation.x = -Math.sin(j.marche) * amp; brasD.rotation.x = Math.sin(j.marche) * amp;
}
function reapparaitre(msg) {
  j.x = depart.x; j.y = depart.y + .2; j.z = depart.z; j.vx = j.vy = j.vz = 0; j.sol = null;
  lacam.cible = YAW_DRAPEAU[dernierDrapeau];
  dire(msg || "Oups ! On repart du dernier drapeau 🚩", 2400);
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
  if (enPause) { $("pReprendre").focus(); arreterMusique(); } else { $("message").hidden = true; canvas.focus(); if (enJeu && !fini) lancerMusique(); }
}
/* Score out of 3: ★ finish, ★ 2 mistakes or fewer, ★ no mistakes */
const scoreSur3 = () => 1 + (erreurs <= 2 ? 1 : 0) + (erreurs === 0 ? 1 : 0);
function gagner() {
  fini = true; enPause = false; ouvrirCoffre(-1);
  const cle = "splash-des-calculs-meilleur-" + NIVEAU + "-" + PARC; $("carteQuestion").hidden = true;
  const meilleur = memo.lire(cle, null);
  const record = !meilleur || chrono < meilleur.temps;
  if (record) memo.ecrire(cle, { temps: chrono, etoiles: nbEtoiles });
  const sc = scoreSur3();
  $("finScore").textContent = "★".repeat(sc) + "☆".repeat(3 - sc);
  $("btnSuivant").hidden = NIVEAU >= NB_NIVEAUX; if (NIVEAU >= NB_NIVEAUX) $("btnRejouer").className = "btn-jouer";
  const sv = $("finSauvegarde"); sv.textContent = "";
  if (window.EC && EC.enregistrerNiveau) {
    sv.textContent = "Enregistrement du score…";
    EC.enregistrerNiveau({ activity: "jeu-splash", level: NIVEAU, score: sc, total: 3, seconds: Math.min(86400, Math.round(chrono)) }).then(r => {
      sv.textContent = r.ok ? "✓ Score gardé dans ton espace." : r.raison === "invite" ? "Tu n'es pas connecté : connecte-toi pour garder ton score." : r.raison === "enseignante" ? "Compte enseignante : le score n'est pas enregistré." : "Le score n'a pas pu être enregistré. Réessaie plus tard.";
    });
  }
  $("finEtoiles").textContent = nbEtoiles + " / " + TOTAL_ETOILES; $("finTemps").textContent = temps(chrono);
  $("finErreurs").textContent = erreurs;
  $("texteFin").textContent = (erreurs === 0 ? "Toutes les portes du premier coup, bravo ! " : erreurs <= 2 ? "Très peu d'erreurs, bravo ! " : "Tu as trouvé toutes les réponses. Rejoue pour faire moins d'erreurs. ") + "Tu as gagné " + nbEtoiles + " étoile" + (nbEtoiles > 1 ? "s" : "") + ". Dans ta tirelire : " + tirelire.etoiles + " ⭐. Va voir la boutique !" + (record && meilleur ? " Nouveau record de temps !" : "");
  majSoldes(); $("inventaire").hidden = true; arreterMusique(); sonEffet("bravo"); $("fin").hidden = false; $("btnRejouer").focus();
}
function recommencer() {
  auto = null;
  for (const e of etoiles) { e.prise = false; e.m.visible = true; }
  for (const d of drapeaux) { d.atteint = false; d.tissu.material = mat(0xe58f7b); }
  remettreSable(); fermerCoffres(); nbEtoiles = 0; dernierDrapeau = 0; chrono = 0; fini = false; depart = { x: 0, y: 0, z: 3 }; erreurs = 0; preparerPortes(); majQuestion(); enleverObjets(); majInventaire();
  j.angle = Math.PI; lacam.yaw = 0; reapparaitre(); $("message").hidden = true; majCompteurs();
}
$("btnJouer").onclick = () => {
  opts.vitesse = +$("optVitesse").value; opts.aide = $("optAide").checked; opts.calme = !!($("optCalme") && $("optCalme").checked);
  $("accueil").hidden = true; enJeu = true; basculerPause(false); canvas.focus(); majQuestion(); majInventaire(); lancerMusique();
  dire("Avance jusqu'à la porte des calculs avec ▲. Touche ou saute sur la bonne réponse !", 3500);
};
$("lireQ").onclick = () => { const p = porteActuelle(); if (p) parler(p.q.voix); canvas.focus(); };
$("btnAide").onclick = () => { arreterMusique(); $("carteQuestion").hidden = true; $("accueil").hidden = false; $("btnJouer").textContent = "Reprendre"; enJeu = false; $("btnJouer").focus(); };
$("pReprendre").onclick = () => basculerPause(false);
$("pFermer").onclick = () => basculerPause(false);
$("pRecommencer").onclick = () => { recommencer(); basculerPause(false); };
$("pAide").onclick = () => { $("pausePanneau").hidden = true; enPause = false; $("btnAide").click(); };
$("btnPause").onclick = () => { if (enJeu && !fini) basculerPause(); };
$("btnRejouer").onclick = () => { $("fin").hidden = true; recommencer(); canvas.focus(); lancerMusique(); };
$("btnSuivant").onclick = () => { location.href = lien(NIVEAU + 1, PARC); };
$("btnRetour").onclick = () => { location.href = PAGE_CHOIX; };
/* Title and instruction by level */
$("titreAccueil").textContent = nomCourt(NIVEAU) + " · " + NIVEAUX[NIVEAU].nom;
$("nomNiveau").textContent = nomCourt(NIVEAU) + " · " + NIVEAUX[NIVEAU].nom;
$("optAide").checked = opts.aide;
/* Level menu: 3 main buttons (Junior, Expert, Challenges). Each one opens ITS sub-menu
   (on mouse hover, or by touching the button on a tablet), independently of the others. */
(function () {
  const boite = $("listeNiveaux");
  Object.entries(GROUPES).forEach(([g, G]) => {
    const bloc = document.createElement("div"); bloc.className = "groupe-menu " + g;
    const b = document.createElement("button"); b.type = "button"; b.className = "groupe"; b.setAttribute("aria-expanded", "false"); b.title = G.titre;
    b.innerHTML = '<span class="signe"></span><span class="nom-groupe"></span>'; b.firstChild.textContent = G.signe; b.lastChild.textContent = G.nom;
    const sous = document.createElement("div"); sous.className = "sous-menu"; sous.setAttribute("aria-label", G.titre);
    NIVEAUX.forEach((nv, n) => { if (!nv || nv.g !== g) return;
      const a = document.createElement("a"); a.href = lien(n, PARC); a.dataset.n = n; if (n === NIVEAU) a.setAttribute("aria-current", "page");
      a.innerHTML = '<b></b><small></small>'; a.firstChild.textContent = nomCourt(n); a.lastChild.textContent = nv.indice; a.title = nv.nom; sous.append(a); });
    b.onclick = () => { const ouvert = !bloc.classList.contains("ouvert");
      boite.querySelectorAll(".groupe-menu").forEach(x => { x.classList.remove("ouvert"); x.firstChild.setAttribute("aria-expanded", "false"); });
      bloc.classList.toggle("ouvert", ouvert); b.setAttribute("aria-expanded", String(ouvert)); };
    if (g === NIVEAUX[NIVEAU].g) bloc.classList.add("actuel");
    bloc.append(b, sous); boite.append(bloc);
  });
  document.addEventListener("click", e => { if (!e.target.closest(".groupe-menu")) boite.querySelectorAll(".groupe-menu").forEach(x => { x.classList.remove("ouvert"); x.firstChild.setAttribute("aria-expanded", "false"); }); });
})();
/* Two screens in the menu: choose the level, then get the game ready */
$("corpsAccueil").classList.add(CHOIX_FAIT ? "vue-jeu" : "vue-choix");
{ const nv = NIVEAUX[NIVEAU], G = GROUPES[nv.g]; $("ncSigne").textContent = G.signe; $("ncNom").textContent = nomCourt(NIVEAU); $("ncIndice").textContent = nv.nom; $("niveauChoisi").className = "niveau-choisi " + nv.g; }
$("ncChanger").href = PAGE_CHOIX;
if (!CHOIX_FAIT) { $("titreAccueil").textContent = "Choisis ton niveau"; }
$("optParcours").value = String(PARC);
$("optParcours").onchange = e => { location.href = lien(NIVEAU, e.target.value); };
$("texteAccueil").textContent = !CHOIX_FAIT ? "Touche Junior, Expert ou Défis, puis choisis ton niveau." : "Questions : " + NIVEAUX[NIVEAU].texte + ". Parcours " + NOMS_PARCOURS[PARC] + " : " + [0, 4, 5, 6][PARC] + " portes des calculs. À chaque porte, saute sur la plateforme qui porte la bonne réponse : le rideau d'eau s'ouvre. Attention : les bouées montent et descendent, les troncs glissent, les geysers te font sauter très haut. Le bouton 🔊 lit la question.";
document.title = "Splash des calculs · Niveau " + NIVEAU;

/* ---------- Piggy bank, shop and items ----------
   The stars earned go into a piggy bank kept on this device. With them, the student buys items
   to use in the next games, or an outfit for the avatar. */
const CLE_TIRELIRE = "ile-aux-calculs-tirelire";
const tirelire = Object.assign({ etoiles: 0, inv: {}, tenue: {}, porte: {} }, memo.lire(CLE_TIRELIRE, {}));
function sauverTirelire() { memo.ecrire(CLE_TIRELIRE, tirelire); }
const OBJETS = [
  { id: "planche", ico: "🪵", nom: "Planche", prix: 3, txt: "Pose une planche devant toi pour traverser un petit trou." },
  { id: "echelle", ico: "🪜", nom: "Échelle", prix: 5, txt: "Pose des marches devant toi pour monter facilement." },
  { id: "pont", ico: "🌉", nom: "Pont", prix: 6, txt: "Pose un long pont devant toi pour traverser un grand trou." },
  { id: "bottes", ico: "👟", nom: "Bottes de saut", prix: 8, txt: "Tu sautes plus haut pendant toute une partie." },
  { id: "casquette", ico: "🧢", nom: "Casquette", prix: 10, txt: "Une casquette pour ton avatar. Elle est à toi pour toujours.", tenue: true },
  { id: "cape", ico: "🦸", nom: "Cape", prix: 15, txt: "Une cape de héros pour ton avatar. Elle est à toi pour toujours.", tenue: true }];
/* Avatar outfit */
corps.add(pancarte);
const casquette = new THREE.Group(); corps.add(casquette);
cube(.56, .16, .56, 0x3e6a90, 0, 2.12, 0, casquette); cube(.5, .06, .28, 0x3e6a90, 0, 2.06, .38, casquette);
const cape = new THREE.Group(); corps.add(cape);
cube(.62, 1.1, .06, 0xb94a5a, 0, 1.0, -.24, cape);
function majTenue() { casquette.visible = !!(tirelire.tenue.casquette && tirelire.porte.casquette); cape.visible = !!(tirelire.tenue.cape && tirelire.porte.cape); }
majTenue();
/* Shop */
function ouvrirBoutique() {
  const liste = $("boutiqueListe"); liste.textContent = "";
  for (const o of OBJETS) {
    const li = document.createElement("li"), possede = o.tenue ? !!tirelire.tenue[o.id] : (tirelire.inv[o.id] || 0);
    li.innerHTML = '<span class="b-ico" aria-hidden="true"></span><span class="b-texte"><b></b><small></small></span><span class="b-prix"></span><button type="button" class="bouton-jeu"></button>';
    li.querySelector(".b-ico").textContent = o.ico; li.querySelector("b").textContent = o.nom + (o.tenue ? "" : possede ? " · tu en as " + possede : "");
    li.querySelector("small").textContent = o.txt; li.querySelector(".b-prix").textContent = o.prix + " ⭐";
    const b = li.querySelector("button");
    if (o.tenue && possede) { const on = !!tirelire.porte[o.id]; b.textContent = on ? "Enlever" : "Porter"; b.onclick = () => { tirelire.porte[o.id] = !on; sauverTirelire(); majTenue(); ouvrirBoutique(); }; li.querySelector(".b-prix").textContent = "✓ à toi"; }
    else { b.textContent = "Acheter"; b.className = "bouton-jeu vert"; b.disabled = tirelire.etoiles < o.prix;
      if (b.disabled) b.title = "Il te manque " + (o.prix - tirelire.etoiles) + " étoile(s).";
      b.onclick = () => { if (tirelire.etoiles < o.prix) return; tirelire.etoiles -= o.prix;
        if (o.tenue) { tirelire.tenue[o.id] = true; tirelire.porte[o.id] = true; majTenue(); } else tirelire.inv[o.id] = (tirelire.inv[o.id] || 0) + 1;
        sauverTirelire(); ouvrirBoutique(); $("boutiqueMsg").textContent = o.ico + " " + o.nom + " acheté" + (o.id === "planche" || o.id === "echelle" || o.id === "casquette" || o.id === "cape" ? "e" : "") + " !"; }; }
    liste.append(li);
  }
  $("boutique").hidden = false; $("boutiqueFermer").focus();
  majSoldes();
}
function majSoldes() { document.querySelectorAll(".solde-tirelire").forEach(e => { e.textContent = tirelire.etoiles; }); }
$("boutiqueFermer").onclick = () => { $("boutique").hidden = true; $("boutiqueMsg").textContent = ""; majSoldes(); majInventaire(); };
$("btnBoutique").onclick = ouvrirBoutique; $("btnBoutiqueFin").onclick = ouvrirBoutique;
majSoldes();
/* Items placed during the game (removed on restart) */
const objetsPoses = [];
function poser(b) { objetsPoses.push(b); }
function enleverObjets() { for (const b of objetsPoses) { scene.remove(b.mesh); const i = blocs.indexOf(b); if (i >= 0) blocs.splice(i, 1); } objetsPoses.length = 0; opts.bottes = false; }
function utiliser(id) {
  if (!enJeu || enPause || fini || !(tirelire.inv[id] > 0)) return;
  if (id === "bottes") { if (opts.bottes) { dire("Tu as déjà tes bottes de saut 👟", 1800); return; } opts.bottes = true; }
  else {
    if (!j.sol) { dire("Pose les pieds sur le sol pour utiliser cet objet.", 2000); return; }
    /* Direction: the axis closest to where the avatar is looking */
    const sx = Math.sin(j.angle), sz = Math.cos(j.angle), surX = Math.abs(sx) > Math.abs(sz), dx = surX ? Math.sign(sx) : 0, dz = surX ? 0 : Math.sign(sz), h = j.y;
    const devant = (dist, larg, long, haut, couleur) => { const cx = j.x + dx * dist, cz = j.z + dz * dist; return surX ? plaque(cx, cz, long, larg, haut, couleur) : plaque(cx, cz, larg, long, haut, couleur); };
    if (id === "planche") poser(devant(DEMI + 1.6, 1.4, 3.2, h + .1, BOIS)); /* a little above the ground: the image does not flicker */
    if (id === "pont") poser(devant(DEMI + 3.1, 1.8, 6.2, h + .1, 0xc9a27e));
    if (id === "echelle") for (let k = 0; k < 4; k++) poser(devant(DEMI + .7 + k * 1.2, 1.6, 1.2, h + .5 * (k + 1), [SABLE, ORANGE][k % 2]));
  }
  tirelire.inv[id]--; sauverTirelire(); majInventaire(); sonEffet("objet");
  const o = OBJETS.find(x => x.id === id); dire(o.ico + " " + o.nom + (id === "bottes" ? " : tu sautes plus haut !" : " posé" + (id === "pont" ? "" : "e") + " devant toi !"), 2000); canvas.focus();
}
function majInventaire() {
  const barre = $("inventaire"); barre.textContent = "";
  OBJETS.filter(o => !o.tenue).forEach((o, i) => { const n = tirelire.inv[o.id] || 0; if (!n) return;
    const b = document.createElement("button"); b.type = "button"; b.dataset.objet = o.id; b.title = o.nom + " (touche " + (i + 1) + ")";
    b.innerHTML = '<span aria-hidden="true"></span><small></small>'; b.firstChild.textContent = o.ico; b.lastChild.textContent = "×" + n;
    b.setAttribute("aria-label", "Utiliser : " + o.nom + ", il t'en reste " + n);
    if (o.id === "bottes" && opts.bottes) b.classList.add("actif");
    b.onclick = () => utiliser(o.id); barre.append(b); });
  barre.hidden = !enJeu || !barre.children.length;
}
addEventListener("keydown", e => { const k = { Digit1: "planche", Digit2: "echelle", Digit3: "pont", Digit4: "bottes" }[e.code]; if (k) utiliser(k); });

/* ---------- Soft music (made by the browser, no file) and small sounds ----------
   A calm loop: C – A minor – F – G chords, arpeggios in the pentatonic scale, low volume.
   "🎵" button to mute or unmute; the choice is kept on the device. */
const musique = { on: memo.lire("ile-aux-calculs-musique", true), ctx: null, maitre: null, prochain: 0, pas: 0, minuterie: null };
const freq = m => 440 * Math.pow(2, (m - 69) / 12); /* MIDI notes */
function note(m, debut, duree, type, vol, dest) {
  const c = musique.ctx, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.value = freq(m);
  g.gain.setValueAtTime(0, debut); g.gain.linearRampToValueAtTime(vol, debut + Math.min(.04, duree / 3)); g.gain.exponentialRampToValueAtTime(.0005, debut + duree);
  o.connect(g); g.connect(dest || musique.maitre); o.start(debut); o.stop(debut + duree + .05);
}
function preparerAudio() {
  if (musique.ctx) return true;
  const C = window.AudioContext || window.webkitAudioContext; if (!C) return false;
  musique.ctx = new C(); musique.maitre = musique.ctx.createGain(); musique.maitre.gain.value = 1; musique.maitre.connect(musique.ctx.destination);
  musique.fond = musique.ctx.createGain(); musique.fond.gain.value = 1.4; musique.fond.connect(musique.maitre);
  return true;
}
/* One "challenge" track per level: Junior cheerful (C major), Expert adventure (A minor, drums),
   Challenges epic (D minor, fast bass). The higher the level in its group, the faster the tempo. */
const STYLES = {
  junior: { bpm: 96, pas: 4, accords: [[48, 55, 60, 64], [43, 50, 55, 59], [45, 52, 57, 60], [41, 48, 53, 57]], lead: "square", vLead: .022, motif: [0, 1, 2, 3, 2, 1, 2, null], basse: [0, 4], batterie: { kick: [0, 4], caisse: [], charley: [2, 6], v: .5 } },
  expert: { bpm: 112, pas: 4, accords: [[45, 52, 57, 60], [41, 48, 53, 57], [48, 55, 60, 64], [43, 50, 55, 59]], lead: "triangle", vLead: .05, motif: [0, null, 2, 3, null, 2, 1, 3], basse: [0, 3, 4, 6], batterie: { kick: [0, 3, 4], caisse: [2, 6], charley: [0, 1, 2, 3, 4, 5, 6, 7], v: .75 } },
  defis: { bpm: 120, pas: 4, accords: [[50, 57, 62, 65], [46, 53, 58, 62], [41, 48, 53, 57], [48, 55, 60, 64]], lead: "triangle", vLead: .055, motif: [3, 2, 0, 2, 3, null, 1, 2], basse: [0, 1, 2, 3, 4, 5, 6, 7], batterie: { kick: [0, 2, 4, 6], caisse: [2, 6], charley: [1, 3, 5, 7], v: .85 } } };
const STYLE = STYLES[NIVEAUX[NIVEAU].g], TEMPS = 60 / (STYLE.bpm + STYLE.pas * (rang(NIVEAU) - 1) + (PARC - 1) * 4) / 2; /* eighth notes */
let bruit = null;
function percussion(type, t, vol) {
  const c = musique.ctx;
  if (type === "kick") { const o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(45, t + .12);
    g.gain.setValueAtTime(.32 * vol, t); g.gain.exponentialRampToValueAtTime(.001, t + .2); o.connect(g); g.connect(musique.fond); o.start(t); o.stop(t + .22); return; }
  if (!bruit) { bruit = c.createBuffer(1, c.sampleRate * .3, c.sampleRate); const d = bruit.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  const src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), duree = type === "caisse" ? .14 : .04;
  src.buffer = bruit; f.type = type === "caisse" ? "bandpass" : "highpass"; f.frequency.value = type === "caisse" ? 1800 : 7000;
  g.gain.setValueAtTime((type === "caisse" ? .12 : .045) * vol, t); g.gain.exponentialRampToValueAtTime(.001, t + duree);
  src.connect(f); f.connect(g); g.connect(musique.fond); src.start(t); src.stop(t + duree + .02);
}
function programmer() {
  const c = musique.ctx, S = STYLE;
  while (musique.prochain < c.currentTime + .4) {
    const t = musique.prochain, k = musique.pas, i = k % 8, mesure = Math.floor(k / 8) % 4, acc = S.accords[mesure];
    if (i === 0) acc.slice(1).forEach(m => note(m, t, TEMPS * 8.2, "triangle", .018, musique.fond));
    if (S.basse.includes(i)) note(acc[0] - 12, t, TEMPS * (S.basse.length > 4 ? .9 : 1.8), "sine", .085, musique.fond);
    const m = S.motif[(i + (mesure === 3 ? 4 : 0)) % 8];
    if (m !== null) note(acc[m] + 12, t, TEMPS * 1.4, S.lead, S.vLead, musique.fond);
    const B = S.batterie;
    if (B.kick.includes(i)) percussion("kick", t, B.v);
    if (B.caisse.includes(i)) percussion("caisse", t, B.v);
    if (B.charley.includes(i)) percussion("charley", t, B.v);
    musique.prochain += TEMPS; musique.pas++;
  }
}
function lancerMusique() {
  if (!musique.on || !preparerAudio()) return;
  if (window.Personnages) return; /* the chosen soundtrack is played by personnages.js */
  musique.ctx.resume(); if (musique.minuterie) return;
  musique.prochain = musique.ctx.currentTime + .1; musique.fond.gain.setTargetAtTime(1.4, musique.ctx.currentTime, .4);
  musique.minuterie = setInterval(programmer, 120); programmer();
}
function arreterMusique() { clearInterval(musique.minuterie); musique.minuterie = null; if (musique.fond) musique.fond.gain.setTargetAtTime(0, musique.ctx.currentTime, .15); }
/* Small sounds: right answer (rising notes), try again (two soft notes), item placed */
function sonEffet(type) {
  if (!musique.on || !preparerAudio()) return; const t = musique.ctx.currentTime + .02;
  if (type === "bravo") [72, 76, 79, 84].forEach((m, i) => note(m, t + i * .09, .35, "triangle", .12));
  if (type === "encore") [64, 60].forEach((m, i) => note(m, t + i * .16, .3, "sine", .1));
  if (type === "objet") [67, 72].forEach((m, i) => note(m, t + i * .08, .25, "triangle", .1));
}
function majBoutonMusique() { const b = $("btnMusique"); b.setAttribute("aria-pressed", String(musique.on)); b.innerHTML = (musique.on ? "🎵" : "🔇") + '<span class="txt-btn"> Musique</span>'; b.title = musique.on ? "Couper la musique" : "Remettre la musique"; }
$("btnMusique").onclick = () => { musique.on = !musique.on; memo.ecrire("ile-aux-calculs-musique", musique.on); majBoutonMusique(); if (musique.on && enJeu) lancerMusique(); else arreterMusique(); canvas.focus(); };
majBoutonMusique();
document.addEventListener("visibilitychange", () => { if (document.hidden) arreterMusique(); else if (enJeu && !enPause && !fini) lancerMusique(); });

/* ---------- Loop ---------- */
function redimensionner() { const w = innerWidth, h = innerHeight; lacam.dist = w / h < .8 ? 13 : 8.5; /* tall screen (phone): camera further away to see the 3 answers */ pancarte.position.y = w < 620 ? 3.5 : 3.85; /* small screen: a bit lower, under the dashboard */ renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
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
  animerDecor(t, dt); majGrandeQuestion(); placer(dt); renderer.render(scene, camera);
  requestAnimationFrame(boucle);
}
majCompteurs(); reapparaitre(); $("message").hidden = true; $("section").textContent = sections[0].nom; camera.position.set(0, 6, 12);
requestAnimationFrame(boucle);
/* For automatic tests */
window.JeuCalculs = { pieces, coffres,  camera, musique, pancarte, tirelire, utiliser, objetsPoses, ouvrirBoutique, portes, erreurs: () => erreurs, repondre, niveau: NIVEAU, parcours: PARC, chemin: CHEMIN, j, blocs, etoiles, drapeaux, arrivee, cam: lacam, touches, opts, total: TOTAL_ETOILES, pas: mettreAJour, geler: v => { gel = v; }, etat: () => ({ fini, nbEtoiles, dernierDrapeau, enJeu, enPause }) };
})();
