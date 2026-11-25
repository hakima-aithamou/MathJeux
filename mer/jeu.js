/* La mer des requins: the pirate sails his chosen boat towards the treasure island.
   The boat moves forward on its own; the player steers left and right.
   Obstacles: sharks, crocodile-sharks, icebergs, glaciers, islands and mountains.
   Calculation gates: three pairs of buoys carry three answers; sail between the buoys with the right one.
   11 question levels (jeu.html?n=1..11) and 3 seas (p=1 calm, 2 choppy, 3 stormy).
   The 3D engine (three.min.js, r128) is in the ile/ folder: no external site is needed. */
(function () {
"use strict";
const $ = id => document.getElementById(id);
const hasard = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pioche = t => t[Math.floor(Math.random() * t.length)];
const memo = { lire(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
               ecrire(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
const PARAMS = new URLSearchParams(location.search);

/* ---------- Question levels ----------
   Junior goes up by tens (up to 10, 20, 30 … 100), then Expert (× ÷) and Défis.
   Results are saved as "jeu-mer2" (the older "jeu-mer" used another numbering). */
const GROUPES = { junior: "Junior · additions et soustractions", expert: "Expert · multiplications et divisions", defis: "Défis" };
const NB_JUNIOR = 10;
const NIVEAUX = [null,
  ...Array.from({ length: NB_JUNIOR }, (_, i) => ({ g: "junior", nom: "+ et − jusqu’à " + (i + 1) * 10 })),
  { g: "expert", nom: "× et ÷ jusqu’à 10" }, { g: "expert", nom: "× et ÷ jusqu’à 20" }, { g: "expert", nom: "× et ÷ jusqu’à 50" }, { g: "expert", nom: "× et ÷ jusqu’à 100" },
  { g: "defis", nom: "Suites et multiples" }, { g: "defis", nom: "Doubles et moitiés" }, { g: "defis", nom: "Compléments à 10 et à 100" }];
/* old level number -> new level number (saved best scores are moved once) */
const ANCIEN_VERS_NOUVEAU = [0, 1, 2, 5, 10, 11, 12, 13, 14, 15, 16, 17];
const NB = NIVEAUX.length - 1;
const BATEAUX = [
  { nom: "La vedette étoile", img: "img/bateau1.jpg" }, { nom: "Le sous-marin jaune", img: "img/bateau2.jpg" },
  { nom: "Le navire volant", img: "img/bateau3.jpg" }, { nom: "Le galion pirate", img: "img/bateau4.jpg" }];
const MERS = [null,
  { nom: "🌤️ Mer calme", aide: "Peu d’obstacles, le bateau va doucement.", vitesse: 8, obstacles: 3 },
  { nom: "🌊 Mer agitée", aide: "Plus d’obstacles, ça bouge !", vitesse: 10, obstacles: 5 },
  { nom: "⛈️ Mer de tempête", aide: "Beaucoup d’obstacles, ça va vite.", vitesse: 12, obstacles: 7 }];
const NB_PORTES = 8, ECART_PORTES = 70, LARGEUR = 9;   // gates per level, distance between gates, half width of the sea lane
if (!memo.lire("mer-v2", false)) {
  const ancien = memo.lire("mer-meilleur", {}), nouveau = {};
  for (const k in ancien) if (ANCIEN_VERS_NOUVEAU[k]) nouveau[ANCIEN_VERS_NOUVEAU[k]] = ancien[k];
  memo.ecrire("mer-meilleur", nouveau);
  const n0 = memo.lire("mer-niveau", 1); memo.ecrire("mer-niveau", ANCIEN_VERS_NOUVEAU[n0] || 1);
  memo.ecrire("mer-v2", true);
}
let niveau = Math.min(NB, Math.max(1, parseInt(PARAMS.get("n"), 10) || memo.lire("mer-niveau", 1)));
let mer = Math.min(3, Math.max(1, parseInt(PARAMS.get("p"), 10) || memo.lire("mer-mer", 1)));
let bateauChoisi = Math.min(3, Math.max(0, memo.lire("mer-bateau", 3)));
/* The shark and the crocodile-shark the student chose (0 = a different one each time) */
const REQUINS = ["Requin aviateur", "Requin au foulard", "Requin explorateur", "Requin capitaine"];
const CROCOS = ["Croco safari", "Croco ninja", "Croco musicien", "Croco super-héros"];
let requinChoisi = Math.min(4, Math.max(0, memo.lire("mer-requin", 0)));
let crocoChoisi = Math.min(4, Math.max(0, memo.lire("mer-croco", 0)));

/* ---------- Star bank ----------
   The player starts with 10 stars. The boat and the chosen characters cost stars at each departure
   ("Au hasard" is free), and each crash costs one star. Stars won at the treasure island go back in the bank.
   An empty bank means coming back another day: the next day it is filled up to 10 again. */
const BANQUE_DEPART = 10, PRIX_BATEAU = [1, 2, 3, 2], PRIX_PERSO = 1;
const jourLocal = () => { const d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); };
let banque = (() => {
  const bq = memo.lire("mer-banque", null), j = jourLocal();
  let e = bq && typeof bq.etoiles === "number" ? bq.etoiles : BANQUE_DEPART;
  if (!bq || bq.jour !== j) e = Math.max(e, BANQUE_DEPART);
  memo.ecrire("mer-banque", { etoiles: e, jour: j });
  return e;
})();
function changerBanque(delta) { banque = Math.max(0, banque + delta); memo.ecrire("mer-banque", { etoiles: banque, jour: jourLocal() }); }
const coutDepart = () => PRIX_BATEAU[bateauChoisi] + (requinChoisi ? PRIX_PERSO : 0) + (crocoChoisi ? PRIX_PERSO : 0);

function choixAutour(r, ecarts) {
  const s = new Set([r]);
  for (const e of ecarts.map(x => [x, -x]).flat().sort(() => Math.random() - .5)) { if (s.size >= 3) break; if (r + e >= 0) s.add(r + e); }
  while (s.size < 3) s.add(r + s.size + 2);
  return [...s].sort(() => Math.random() - .5);
}
const Q = (texte, voix, r, ecarts) => ({ texte, voix, r, choix: choixAutour(r, ecarts) });
function plusMoins(k, min, max) {
  const m = max > 20 ? 3 : 1;
  if (k % 2 === 0) { const r = hasard(Math.max(2, min), max), a = hasard(m, r - m); return Q(a + " + " + (r - a) + " = ?", a + " plus " + (r - a) + ", combien ?", r, max > 20 ? [1, 2, 10] : [1, 2]); }
  const a = hasard(Math.max(2, min), max), b = hasard(m, a - m); return Q(a + " − " + b + " = ?", a + " moins " + b + ", combien ?", a - b, max > 20 ? [1, 2, 10] : [1, 2]);
}
function foisDivise(k, min, max) {
  const paires = []; for (let a = 2; a <= 10; a++) for (let b = 2; b <= 10; b++) if (a * b >= min && a * b <= max) paires.push([a, b]);
  const [a, b] = pioche(paires), p = a * b;
  if (k % 2 === 0) return Q(a + " × " + b + " = ?", a + " fois " + b + ", combien ?", p, [a, 1, 2]);
  return Q(p + " ÷ " + a + " = ?", p + " divisé par " + a + ", combien ?", b, [1, 2]);
}
/* Every third gate of the Junior levels: the same calculation with sea animals */
const ANIMAUX = [["🦈", "requins"], ["🐊", "crocodiles"], ["🐠", "poissons"]];
function histoire(q, k) {
  if (k % 3 !== 1) return q;
  const m = q.texte.match(/^(\d+) ([+−]) (\d+) = \?$/); if (!m) return q;
  const [ico, mot] = ANIMAUX[Math.floor(k / 3) % ANIMAUX.length];
  q.texte = m[1] + " " + ico + " " + m[2] + " " + m[3] + " " + ico + " = ?";
  q.voix = m[1] + " " + mot + (m[2] === "+" ? " plus " : " moins ") + m[3] + " " + mot + ", combien de " + mot + " ?";
  return q;
}
function nouvelleQuestion(k) {
  if (niveau <= NB_JUNIOR) {
    /* "up to N": answers and numbers stay at most N, and mostly near the top of the range */
    const max = niveau * 10, min = max <= 10 ? 2 : max === 20 ? 11 : max - 20;
    return histoire(plusMoins(k, min, max), k);
  }
  switch (niveau - NB_JUNIOR + 4) {
    case 5: return foisDivise(k, 2, 10);
    case 6: return foisDivise(k, 11, 20);
    case 7: return foisDivise(k, 21, 50);
    case 8: return foisDivise(k, 51, 100);
    case 9: {
      if (k % 3 === 2) { const m = pioche([2, 5, 10]), r = m * hasard(2, 9), faux = new Set();
        while (faux.size < 2) { const x = r + hasard(1, m === 2 ? 1 : m - 1) * (Math.random() < .5 ? 1 : -1); if (x > 0 && x % m) faux.add(x); }
        return { texte: "Un multiple de " + m + " ?", voix: "Lequel est un multiple de " + m + " ?", r, choix: [r, ...faux].sort(() => Math.random() - .5) }; }
      const pas = pioche([2, 5, 10]), descend = k % 3 === 1, d = pas * hasard(descend ? 4 : 1, descend ? 9 : 6), sg = descend ? -1 : 1, r = d + 3 * pas * sg;
      return Q(d + ", " + (d + pas * sg) + ", " + (d + 2 * pas * sg) + ", ?", "Quel nombre vient après " + d + ", " + (d + pas * sg) + ", " + (d + 2 * pas * sg) + " ?", r, [1, pas === 2 ? 4 : pas === 5 ? 2 : 5]);
    }
    case 10: { if (k % 2 === 0) { const n = hasard(2, 25); return Q("Le double de " + n + " ?", "Quel est le double de " + n + " ?", 2 * n, [1, 2, n > 10 ? 10 : 3]); }
      const n = 2 * hasard(2, 25); return Q("La moitié de " + n + " ?", "Quelle est la moitié de " + n + " ?", n / 2, [1, 2, 10]); }
    default: { if (k % 2 === 0) { const a = hasard(1, 9); return Q(a + " + ? = 10", a + " plus combien égale 10 ?", 10 - a, [1, 2]); }
      const a = 5 * hasard(2, 19); return Q(a + " + ? = 100", a + " plus combien égale 100 ?", 100 - a, [5, 10]); }
  }
}

/* ---------- 3D scene ---------- */
const canvas = $("scene");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
const scene = new THREE.Scene();
const CIEL = 0x8fd3f5;
scene.background = new THREE.Color(CIEL);
scene.fog = new THREE.Fog(CIEL, 70, 190);
const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 400);
scene.add(new THREE.HemisphereLight(0xffffff, 0x2a7fb0, 0.9));
const soleil = new THREE.DirectionalLight(0xfff3d6, 0.8); soleil.position.set(30, 50, 20); scene.add(soleil);
const mats = {};
const mat = (c, o) => { const k = c + (o ? JSON.stringify(o) : ""); return mats[k] || (mats[k] = new THREE.MeshLambertMaterial(Object.assign({ color: c }, o || {}))); };
const boite = (w, h, d, c, x, y, z, parent) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c)); m.position.set(x || 0, y || 0, z || 0); (parent || scene).add(m); return m; };
const cone = (r, h, c, x, y, z, parent, cotes) => { const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, cotes || 7), mat(c, { flatShading: true })); m.position.set(x || 0, y || 0, z || 0); (parent || scene).add(m); return m; };

/* The sea: a moving grid with small waves that follows the boat */
const SEG = 70, TAILLE = 220;
const geoMer = new THREE.PlaneGeometry(TAILLE, TAILLE, SEG, SEG); geoMer.rotateX(-Math.PI / 2);
const merMesh = new THREE.Mesh(geoMer, new THREE.MeshPhongMaterial({ color: 0x1f8fc4, flatShading: true, shininess: 60, specular: 0x66bbee }));
scene.add(merMesh);
const posMer = geoMer.attributes.position;
function vagues(t) {
  const amp = [0, .18, .3, .45][mer];
  for (let i = 0; i < posMer.count; i++) {
    const x = posMer.getX(i) + merMesh.position.x, z = posMer.getZ(i) + merMesh.position.z;
    posMer.setY(i, Math.sin(x * .35 + t * 1.6) * amp + Math.cos(z * .3 + t * 1.3) * amp);
  }
  posMer.needsUpdate = true; geoMer.computeVertexNormals();
}
const hauteurVague = (x, z, t) => { const amp = [0, .18, .3, .45][mer]; return Math.sin(x * .35 + t * 1.6) * amp + Math.cos(z * .3 + t * 1.3) * amp; };
/* Block clouds and far mountains on the horizon */
for (let i = 0; i < 16; i++) {
  const g = new THREE.Group();
  for (let k = 0; k < 4; k++) boite(3 + Math.random() * 3, 1.2, 2 + Math.random() * 2, 0xffffff, k * 2 - 3, Math.random() * .8, Math.random() * 2 - 1, g);
  g.position.set(Math.random() * 200 - 100, 26 + Math.random() * 10, -Math.random() * 180); g.userData.v = .5 + Math.random();
  scene.add(g); (scene.userData.nuages = scene.userData.nuages || []).push(g);
}

/* ---------- The pirate and the four boats ---------- */
function pirate(parent, y) {
  const p = new THREE.Group();
  /* legs and arms turn around a pivot at the hip / shoulder, so the pirate can move */
  const membre = (x, yPivot, longueur, couleur, epais) => { const piv = new THREE.Group(); piv.position.set(x, yPivot, 0); boite(epais || .2, longueur, epais || .2, couleur, 0, -longueur / 2, 0, piv); p.add(piv); return piv; };
  const jambeG = membre(-.14, .5, .5, 0x2c3e50, .24), jambeD = membre(.14, .5, .5, 0x2c3e50, .24);
  boite(.6, .55, .38, 0xffffff, 0, .78, 0, p);                        // striped shirt
  boite(.62, .12, .4, 0xc0392b, 0, .65, 0, p); boite(.62, .12, .4, 0xc0392b, 0, .9, 0, p);
  const tete = new THREE.Group(); tete.position.y = 1.06; p.add(tete);
  boite(.45, .42, .42, 0xf2c79a, 0, .22, 0, tete);                    // head
  boite(.47, .12, .44, 0xc0392b, 0, .39, 0, tete);                    // bandana
  boite(.8, .1, .55, 0x1b1b1b, 0, .5, 0, tete); boite(.5, .22, .4, 0x1b1b1b, 0, .64, 0, tete);  // pirate hat
  boite(.12, .1, .02, 0x111111, -.1, .26, -.22, tete); boite(.08, .08, .02, 0x111111, .1, .26, -.22, tete); // eye patch and eye
  const brasG = membre(-.38, 1.03, .45, 0xf2c79a, .16), brasD = membre(.38, 1.03, .45, 0xf2c79a, .16);
  p.position.y = y; p.scale.setScalar(1.45); parent.add(p);
  parent.userData.pirate = { p, y, x: 0, jambeG, jambeD, brasG, brasD, tete, saut: 0, vy: 0, fete: 0 };
  return p;
}
function etoileSur(parent, x, y, z, taille, rx) {
  const s = new THREE.Shape(); for (let i = 0; i < 10; i++) { const r = i % 2 ? taille * .45 : taille, a = Math.PI / 2 + i * Math.PI / 5; if (i) s.lineTo(Math.cos(a) * r, Math.sin(a) * r); else s.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
  const m = new THREE.Mesh(new THREE.ShapeGeometry(s), new THREE.MeshBasicMaterial({ color: 0xffd23f, side: THREE.DoubleSide }));
  m.position.set(x, y, z); m.rotation.y = rx || 0; parent.add(m); return m;
}
function faireBateau(k) {
  const g = new THREE.Group(), anim = [];
  if (k === 0) {        // star speedboat
    boite(2, .6, 4, 0xffffff, 0, .3, 0, g); boite(2.02, .25, 4.02, 0xd62f2f, 0, .1, 0, g); boite(2.02, .12, 4.02, 0x2a5bd7, 0, .38, 0, g);
    const nez = boite(1.4, .55, 1.2, 0xffffff, 0, .3, -2.4, g); nez.rotation.x = .2;
    boite(1.8, .5, .1, 0x7fd0ff, 0, .9, -.9, g); boite(.8, .5, .8, 0x333333, 0, .6, 2, g);
    etoileSur(g, 1.03, .4, .4, .35, Math.PI / 2); etoileSur(g, -1.03, .4, .4, .35, -Math.PI / 2);
    boite(.5, .5, .1, 0x333333, 0, .95, .1, g); pirate(g, .55).position.z = .7;
    const fl = boite(.04, .9, .04, 0x999999, .7, 1.2, 1.5, g); void fl; boite(.5, .3, .02, 0xd62f2f, .95, 1.5, 1.5, g);
  } else if (k === 1) { // yellow submarine
    const c = new THREE.Mesh(new THREE.CylinderGeometry(.95, .95, 3.4, 14), mat(0xf6c022)); c.rotation.x = Math.PI / 2; c.position.y = .3; g.add(c);
    const av = new THREE.Mesh(new THREE.SphereGeometry(.95, 14, 10), mat(0x7fd0ff, { transparent: true, opacity: .85 })); av.position.set(0, .3, -1.7); g.add(av);
    const ar = new THREE.Mesh(new THREE.SphereGeometry(.95, 14, 10), mat(0xf6c022)); ar.position.set(0, .3, 1.7); g.add(ar);
    for (const x of [-.6, 0, .6]) { const h = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, .1, 12), mat(0x7fd0ff)); h.rotation.z = Math.PI / 2; h.position.set(.97, .45, x * 1.5); g.add(h); const h2 = h.clone(); h2.position.x = -.97; g.add(h2); }
    boite(.9, .7, 1, 0xf6c022, 0, 1.25, .2, g); boite(.12, 1, .12, 0x555555, .3, 2, -.2, g); boite(.12, .12, .5, 0x555555, .3, 2.45, -.4, g);
    boite(.1, .9, .7, 0xd62f2f, 0, .9, 2.4, g); boite(1.8, .1, .5, 0xd62f2f, 0, .3, 2.3, g);
    const helice = boite(1.2, .15, .1, 0x2a5bd7, 0, .3, 2.7, g); anim.push(t => { helice.rotation.z = t * 12; });
    pirate(g, 1.15).position.z = .2;
  } else if (k === 2) { // flying ship
    boite(1.9, .9, 4, 0x8a5a2b, 0, .4, 0, g); boite(2, .15, 4.05, 0xf2c94c, 0, .9, 0, g); const nez = boite(1.2, .8, 1, 0x8a5a2b, 0, .45, -2.4, g); nez.rotation.x = .25;
    for (const s of [-1, 1]) { const aile = new THREE.Group(); aile.position.set(s * 1, .9, 0); g.add(aile);
      for (let i = 0; i < 4; i++) boite(1.8 - i * .3, .08, .5, i % 2 ? 0x7fd0ff : 0x3d8fe0, s * (1 + i * .1), i * .05, -.6 + i * .5, aile);
      anim.push(t => { aile.rotation.z = s * (.25 + Math.sin(t * 5) * .25); }); }
    boite(.1, 2.4, .1, 0x5b3a1a, 0, 2, .4, g); const voile = boite(1.6, 1.2, .05, 0xfff6e0, 0, 2.2, .4, g); etoileSur(g, 0, 2.2, .37, .4, Math.PI); void voile;
    const helice = boite(.12, 1.2, .12, 0xd0a040, 0, .5, 2.2, g); anim.push(t => { helice.rotation.z = t * 14; });
    pirate(g, .9).position.z = 1.3;
  } else {              // pirate galleon
    boite(2.2, 1.1, 4.4, 0x7a4a22, 0, .45, 0, g); boite(2.25, .15, 4.45, 0xf2c94c, 0, 1, 0, g); boite(2, .35, 1.2, 0x7a4a22, 0, 1.15, 1.6, g); const roue = new THREE.Mesh(new THREE.TorusGeometry(.35, .06, 6, 12), mat(0x5b3a1a)); roue.position.set(0, 1.8, .9); g.add(roue);
    const nez = boite(1.3, .9, 1.1, 0x7a4a22, 0, .55, -2.6, g); nez.rotation.x = .3;
    for (const s of [-1, 1]) for (const z of [-1, 0, 1]) boite(.1, .2, .2, 0x222222, s * 1.12, .5, z, g);
    boite(.12, 3.4, .12, 0x5b3a1a, 0, 2.6, -.5, g); boite(.1, 2.4, .1, 0x5b3a1a, 0, 2.2, 1.4, g);
    boite(1.9, 1.5, .05, 0x1b1b1b, 0, 2.8, -.5, g);                        // black sail
    const crane = new THREE.Mesh(new THREE.CircleGeometry(.35, 16), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })); crane.position.set(0, 2.95, -.53); crane.rotation.y = Math.PI; g.add(crane);
    boite(.7, .08, .02, 0xffffff, 0, 2.5, -.53, g).rotation.z = .6; boite(.7, .08, .02, 0xffffff, 0, 2.5, -.53, g).rotation.z = -.6;
    boite(1.4, 1, .05, 0xd62f2f, 0, 2.3, 1.4, g);
    const dr = boite(.6, .35, .02, 0x1b1b1b, .3, 4.3, -.5, g); anim.push(t => { dr.rotation.y = Math.sin(t * 4) * .3; });
    pirate(g, 1.32).position.z = 1.5;
  }
  g.userData.anim = anim;
  return g;
}

/* ---------- Obstacles ---------- */
/* Sharks and crocodile-sharks are the game's own character pictures (personnages.js), shown as billboards that
   always face the camera. The part below the water line is hidden by the sea, so they seem to swim. */
const TEXTURES = {};
function texturePerso(nom) {
  const p = window.MER_PERSONNAGES && window.MER_PERSONNAGES[nom];
  if (!p) return null;
  if (!TEXTURES[nom]) {
    const img = new Image(), t = new THREE.Texture(img);
    img.onload = () => { t.needsUpdate = true; };
    img.src = p.src;
    TEXTURES[nom] = { t, p };
  }
  return TEXTURES[nom];
}
function personnage(nom, haut, enfonce) {
  const x = texturePerso(nom);
  if (!x) return null;
  const g = new THREE.Group();
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: x.t, transparent: true, alphaTest: .2 }));
  const larg = haut * x.p.w / x.p.h;
  sp.scale.set(larg, haut, 1); sp.position.y = haut / 2 - enfonce; g.add(sp);
  // foam ring where the character comes out of the water
  const ecume = new THREE.Mesh(new THREE.RingGeometry(larg * .22, larg * .4, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .6, side: THREE.DoubleSide, depthWrite: false }));
  ecume.rotation.x = -Math.PI / 2; ecume.position.y = .12; g.add(ecume);
  Object.assign(g.userData, { sprite: sp, larg, y0: sp.position.y, ecume, perso: true });
  return g;
}
function requin() { return personnage("requin" + (requinChoisi || hasard(1, 4)), 4.2, 1.35) || requin3D(); }
function crocoRequin() { return personnage("croco" + (crocoChoisi || hasard(1, 4)), 4.4, 1.5) || crocoRequin3D(); }
/* Simple 3D models, used only if the pictures are missing */
function requin3D() {
  const g = new THREE.Group();
  const corps = boite(.9, .6, 2.6, 0x6f8796, 0, -.1, 0, g); void corps;
  const aileron = cone(.5, 1.3, 0x5a7282, 0, .7, .2, g, 3); aileron.rotation.y = Math.PI / 6;
  boite(.85, .2, 1.4, 0xf0f0f0, 0, -.35, -.3, g);
  boite(.1, .7, .5, 0x5a7282, 0, .15, 1.5, g);
  return g;
}
function crocoRequin3D() {
  const g = new THREE.Group();
  boite(1.2, .5, 2.4, 0x3f8f3a, 0, .1, 0, g); boite(1.1, .35, 1.6, 0x4fa64a, 0, .2, -1.8, g);     // body and snout
  const machoire = boite(1.05, .2, 1.5, 0x3a7f36, 0, -.05, -1.8, g);
  for (let i = 0; i < 5; i++) { boite(.1, .15, .1, 0xffffff, -.45, .02, -1.2 - i * .3, g); boite(.1, .15, .1, 0xffffff, .45, .02, -1.2 - i * .3, g); }
  boite(.3, .3, .3, 0xffffff, -.35, .55, -.7, g); boite(.3, .3, .3, 0xffffff, .35, .55, -.7, g);
  boite(.14, .14, .1, 0x111111, -.35, .58, -.86, g); boite(.14, .14, .1, 0x111111, .35, .58, -.86, g);
  const aileron = cone(.45, 1.1, 0x2f6f2b, 0, .8, .5, g, 3); aileron.rotation.y = Math.PI / 6;
  for (let i = 0; i < 4; i++) cone(.15, .3, 0x2f6f2b, 0, .5, -.3 + i * .5, g, 4);
  g.userData.machoire = machoire;
  return g;
}
function iceberg(gros) {
  const g = new THREE.Group(), s = gros ? 1.6 : 1;
  cone(2.2 * s, 5 * s, 0xf4fbff, 0, 2.2 * s, 0, g, 6); cone(1.4 * s, 3.4 * s, 0xdff3ff, 1.4 * s, 1.5 * s, .6 * s, g, 5); cone(1.1 * s, 2.6 * s, 0xcbeaff, -1.3 * s, 1.1 * s, -.4 * s, g, 5);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.6 * s, 3 * s, .8, 8), mat(0xbfe6fa, { flatShading: true })); base.position.y = .1; g.add(base);
  return g;
}
function glacier() {
  const g = new THREE.Group();
  boite(6, 1.6, 3, 0xe8f7ff, 0, .5, 0, g); boite(5.2, .5, 2.6, 0xffffff, 0, 1.5, 0, g); boite(1.4, .9, 1.2, 0xcbeaff, -1.8, 2, .2, g); boite(1, .7, 1, 0xdff3ff, 2, 1.9, -.3, g);
  boite(6.05, .3, 3.05, 0x9ad4f0, 0, -.2, 0, g);
  return g;
}
function ile() {
  const g = new THREE.Group();
  const sable = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 3.2, 1, 9), mat(0xf2d48a, { flatShading: true })); sable.position.y = 0; g.add(sable);
  boite(.25, 3, .25, 0x8a5a2b, .3, 2, 0, g).rotation.z = -.15;
  for (let i = 0; i < 5; i++) { const f = boite(2, .1, .5, 0x2f9e5a, .5, 3.5, 0, g); f.rotation.y = i * Math.PI * 2 / 5; f.rotation.z = -.35; f.position.x = .5 + Math.cos(i * 1.26) * .7; f.position.z = Math.sin(i * 1.26) * .7; }
  boite(.5, .4, .4, 0x8a5a2b, -1.2, .7, .8, g); boite(.55, .1, .45, 0xf2c94c, -1.2, .92, .8, g);   // little treasure chest
  return g;
}
function montagne() {
  const g = new THREE.Group();
  cone(4.2, 9, 0x7d8a96, 0, 4, 0, g, 6); cone(1.7, 3.2, 0xffffff, 0, 7.4, 0, g, 6); cone(2.8, 6, 0x6d7985, 2.6, 2.5, 1, g, 5); cone(1.1, 1.6, 0xffffff, 2.6, 5.3, 1, g, 5);
  return g;
}
const TYPES = [
  { id: "requin", faire: requin, r: 1.3, msg: "🦈 Aïe ! Un requin a mordu le bateau !", bouge: "x" },
  { id: "croco", faire: crocoRequin, r: 1.4, msg: "🐊 Attention au crocodile-requin !", bouge: "saut" },
  { id: "iceberg", faire: () => iceberg(false), r: 2.4, msg: "🧊 Boum ! Un iceberg !" },
  { id: "gros", faire: () => iceberg(true), r: 3.7, msg: "🧊 Un gros iceberg ! Contourne-le." },
  { id: "glacier", faire: glacier, r: 0, w: 3.1, d: 1.6, msg: "❄️ Le bateau a touché le glacier !" },
  { id: "ile", faire: ile, r: 3, msg: "🏝️ Le bateau s’est échoué sur une île !" },
  { id: "montagne", faire: montagne, r: 4.2, msg: "⛰️ Attention à la montagne !" }];

/* Buoys with a number on a board (calculation gate) */
function texteTexture(t, fond, encre) {
  const c = document.createElement("canvas"); c.width = 256; c.height = 128; const x = c.getContext("2d");
  x.fillStyle = fond; x.fillRect(0, 0, 256, 128); x.strokeStyle = "#c98a2c"; x.lineWidth = 10; x.strokeRect(5, 5, 246, 118);
  x.fillStyle = encre; x.font = "900 76px 'Trebuchet MS', Arial, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(t, 128, 68);
  const tx = new THREE.CanvasTexture(c); return tx;
}
function porteReponses(z, choix) {
  const g = new THREE.Group(), xs = [-6, 0, 6], panneaux = [];
  choix.forEach((v, i) => {
    for (const s of [-1, 1]) {
      const b = new THREE.Group(); b.position.set(xs[i] + s * 2.1, 0, 0); g.add(b);
      const c = new THREE.Mesh(new THREE.CylinderGeometry(.35, .45, 1.6, 10), mat(i % 2 ? 0xffffff : 0xe74c3c)); c.position.y = .6; b.add(c);
      boite(.12, 2.2, .12, 0x8a5a2b, 0, 2.2, 0, b);
    }
    const p = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.7), new THREE.MeshBasicMaterial({ map: texteTexture(String(v), "#fff8e1", "#12324a") }));
    p.position.set(xs[i], 3.6, 0); g.add(p); panneaux.push(p);
  });
  g.position.z = z; scene.add(g);
  return { g, z, choix, panneaux, passee: false };
}
function ileTresor(z) {
  const g = new THREE.Group();
  const s = new THREE.Mesh(new THREE.CylinderGeometry(9, 11, 1.4, 12), mat(0xf2d48a, { flatShading: true })); g.add(s);
  for (const [x, zz] of [[-4, -2], [4, -3], [0, -5]]) { boite(.35, 4, .35, 0x8a5a2b, x, 2.5, zz, g); for (let i = 0; i < 5; i++) { const f = boite(2.6, .12, .6, 0x2f9e5a, x, 4.5, zz, g); f.rotation.y = i * 1.26; f.rotation.z = -.3; } }
  boite(2, 1.3, 1.4, 0x8a5a2b, 0, 1.3, 0, g); boite(2.1, .3, 1.5, 0xf2c94c, 0, 2, 0, g); boite(1.6, .4, .1, 0xffd23f, 0, 1.4, -.72, g);
  g.position.z = z - 10; scene.add(g); return g;
}

/* ---------- Game state ---------- */
let bateau = null, enJeu = false, enPause = false, fini = false;
const b = { x: 0, z: 0, vx: 0, inclinaison: 0, invincible: 0, secousse: 0 };
let obstacles = [], portes = [], tresor = null, questionK = 0, question = null, bonnes = 0, chocs = 0, chrono = 0, horloge = 0, zFin = 0;
const touches = { gauche: false, droite: false };

function viderMonde() {
  for (const o of obstacles) scene.remove(o.g);
  for (const p of portes) scene.remove(p.g);
  if (tresor) scene.remove(tresor);
  obstacles = []; portes = []; tresor = null;
}
/* Places obstacles between z0 and z1, never all in the same place, never on the gates */
function semer(z0, z1, n) {
  const pris = [];
  for (let i = 0; i < n; i++) {
    let essai = 0, t, x, z;
    do {
      t = TYPES[pioche(mer === 1 ? [0, 0, 1, 2, 4, 5, 6] : [0, 0, 1, 1, 2, 3, 4, 5, 6])];
      x = hasard(-LARGEUR + 1, LARGEUR - 1); if (t.id === "montagne") x = pioche([-1, 1]) * hasard(13, 16); if (t.id === "gros") x = pioche([-1, 1]) * hasard(10, 13); if (t.id === "ile") x = pioche([-1, 1]) * hasard(4, 11);
      z = z0 - hasard(14, Math.abs(z1 - z0) - 14);
    } while (++essai < 30 && pris.some(p => Math.abs(p.z - z) < 9));
    pris.push({ z });
    const g = t.faire(); g.position.set(x, 0, z); if (t.id === "requin" && !g.userData.perso) g.rotation.y = Math.PI / 2;
    scene.add(g); obstacles.push({ t, g, x, z, x0: x, phase: Math.random() * 6, touche: false });
  }
}
function construire() {
  viderMonde();
  const m = MERS[mer];
  for (let k = 0; k < NB_PORTES; k++) {
    const zp = -(k + 1) * ECART_PORTES;
    semer(k ? zp + ECART_PORTES : -20, zp, m.obstacles);   // the start stays clear
    portes.push(porteReponses(zp, [0, 0, 0]));
  }
  /* scenery on both sides (outside the lane): far mountains and icebergs */
  for (let z = -10; z > -(NB_PORTES + 1) * ECART_PORTES; z -= 28) for (const sg of [-1, 1]) {
    const g = Math.random() < .5 ? montagne() : iceberg(true); g.position.set(sg * hasard(24, 34), 0, z - hasard(0, 14)); g.scale.setScalar(1 + Math.random()); scene.add(g);
    obstacles.push({ t: { id: "decor", r: .01, bouge: null, msg: "" }, g, x: 999, z: 999, x0: 999, phase: 0, decor: true });
  }
  zFin = -(NB_PORTES + 1) * ECART_PORTES + 30;
  semer(-NB_PORTES * ECART_PORTES, zFin + 20, Math.ceil(m.obstacles / 2));
  tresor = ileTresor(zFin);
}
/* The question of gate k is shown, and its answers are written on the buoys */
function poserQuestion(k) {
  questionK = k; question = nouvelleQuestion(k);
  const p = portes[k]; p.choix = question.choix;
  p.panneaux.forEach((pn, i) => { pn.material.map.dispose(); pn.material.map = texteTexture(String(question.choix[i]), "#fff8e1", "#12324a"); pn.material.needsUpdate = true; });
  $("questionTexte").textContent = question.texte;
}
function parler(t) { if (!window.speechSynthesis || !t) return; try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = "fr-CA"; u.rate = .95; speechSynthesis.speak(u); } catch (e) {} }
let minuterie = 0;
function dire(t, genre, ms) { const m = $("message"); m.textContent = t; m.className = "message" + (genre ? " " + genre : ""); m.hidden = false; clearTimeout(minuterie); minuterie = setTimeout(() => { m.hidden = true; }, ms || 1800); }
function majHud() {
  $("hudEtoiles").textContent = bonnes; $("hudTotal").textContent = NB_PORTES;
  $("hudBanque").textContent = banque;
  $("hudBarre").style.width = Math.min(100, Math.max(0, b.z / zFin * 100)) + "%";
}

function demarrer() {
  const cout = coutDepart();
  if (banque <= 0) { menu(); return; }
  if (cout > banque) { menu(); $("avertBanque").textContent = "Il te manque " + (cout - banque) + " ⭐ pour ce départ. Choisis un bateau moins cher ou « Au hasard »."; return; }
  changerBanque(-cout);
  memo.ecrire("mer-niveau", niveau); memo.ecrire("mer-mer", mer); memo.ecrire("mer-bateau", bateauChoisi); memo.ecrire("mer-requin", requinChoisi); memo.ecrire("mer-croco", crocoChoisi);
  history.replaceState(null, "", "jeu.html?n=" + niveau + "&p=" + mer);
  if (bateau) scene.remove(bateau);
  bateau = faireBateau(bateauChoisi); scene.add(bateau);
  Object.assign(b, { x: 0, z: 0, vx: 0, inclinaison: 0, invincible: 0, secousse: 0 });
  bonnes = 0; chocs = 0; chrono = 0; fini = false; enPause = false;
  construire(); poserQuestion(0);
  for (const id of ["accueil", "fin", "pause"]) $(id).hidden = true;
  $("hud").hidden = false; enJeu = true; majHud(); canvas.focus();
  dire("⛵ En route vers l’île au trésor ! (−" + cout + " ⭐)", "", 2200);
}
/* A small white splash around the boat when it hits something (instead of blinking) */
const gouttes = [];
function eclabousser() {
  for (let i = 0; i < 14; i++) {
    const g = boite(.25, .25, .25, 0xffffff, b.x, .6, b.z - 1); const a = Math.random() * Math.PI * 2, v = 2 + Math.random() * 2;
    gouttes.push({ g, vx: Math.cos(a) * v, vz: Math.sin(a) * v, vy: 3 + Math.random() * 2, vie: .8 });
  }
}
function majGouttes(dt) {
  for (let i = gouttes.length - 1; i >= 0; i--) { const d = gouttes[i]; d.vie -= dt; d.vy -= 9 * dt;
    d.g.position.x += d.vx * dt; d.g.position.y += d.vy * dt; d.g.position.z += d.vz * dt;
    if (d.vie <= 0 || d.g.position.y < -.5) { scene.remove(d.g); gouttes.splice(i, 1); } }
}
function choc(o) {
  if (b.invincible > 0) return;
  chocs++; b.invincible = 1.6; b.secousse = .8; eclabousser();
  changerBanque(-1);
  majHud();
  if (banque <= 0) { banqueVide(); return; }
  dire(o.t.msg + " −1 ⭐", "mauvais");
}
function passerPorte(p) {
  p.passee = true;
  const xs = [-6, 0, 6]; let i = 0; for (let k = 1; k < 3; k++) if (Math.abs(b.x - xs[k]) < Math.abs(b.x - xs[i])) i = k;
  const dedans = Math.abs(b.x - xs[i]) < 2.1;
  if (dedans && p.choix[i] === question.r) { bonnes++; if (bateau && bateau.userData.pirate) bateau.userData.pirate.fete = 1.2; dire("⭐ Bravo ! " + question.texte.replace("?", question.r), "bon"); p.panneaux[i].material.color = new THREE.Color(0x9ff0b8); }
  else dire("Oups ! La bonne réponse était " + question.r + ".", "mauvais", 2400);
  majHud();
  if (questionK + 1 < NB_PORTES) poserQuestion(questionK + 1); else { $("questionTexte").textContent = "🏝️ Cap sur l’île au trésor !"; question = null; }
}
async function terminer() {
  fini = true; enJeu = false;
  const et = bonnes >= NB_PORTES - 1 && chocs <= 2 ? 3 : bonnes >= NB_PORTES / 2 ? 2 : 1;
  $("finEtoiles").textContent = "⭐".repeat(et) + "☆".repeat(3 - et);
  $("finTexte").textContent = bonnes + " bonnes réponses sur " + NB_PORTES + " · " + (chocs ? chocs + (chocs > 1 ? " chocs" : " choc") : "aucun choc") + ".";
  changerBanque(et);
  $("finTexte").textContent += " +" + et + " ⭐ dans ta banque (" + banque + " ⭐).";
  $("finTitre").textContent = "🏝️ L’île au trésor !";
  $("btnRejouer").hidden = false;
  $("btnSuivant").hidden = niveau >= NB;
  const m = memo.lire("mer-meilleur", {}); if (!m[niveau] || et > m[niveau]) { m[niveau] = et; memo.ecrire("mer-meilleur", m); }
  $("hud").hidden = true; $("fin").hidden = false; $("finTitre").focus();
  const s = $("finSauvegarde"); s.textContent = "";
  if (window.EC && EC.connecte && EC.connecte() && EC.enregistrerNiveau) {
    try { const r = await EC.enregistrerNiveau({ activity: "jeu-mer2", level: niveau, score: et, total: 3, seconds: Math.min(86400, Math.round(chrono)) }); s.textContent = r && r.ok === false ? "Ton score est gardé sur cet appareil." : "✓ Ton score est enregistré."; }
    catch (e) { s.textContent = "Ton score est gardé sur cet appareil."; }
  } else s.textContent = "Tu n’es pas connecté : ton score est gardé sur cet appareil.";
}

/* The bank is empty: the game stops and the player comes back another day */
function banqueVide() {
  fini = true; enJeu = false;
  $("finTitre").textContent = "🏦 Ta banque est vide";
  $("finEtoiles").textContent = "☆☆☆";
  $("finTexte").textContent = "Ton bateau a heurté trop d’obstacles : tu n’as plus d’étoiles. Reviens une autre fois ! Demain, ta banque aura de nouveau " + BANQUE_DEPART + " ⭐.";
  $("finSauvegarde").textContent = "";
  $("btnSuivant").hidden = true; $("btnRejouer").hidden = true;
  $("hud").hidden = true; $("fin").hidden = false; $("finTitre").focus();
}

/* ---------- Main loop ---------- */
function maj(dt) {
  const m = MERS[mer];
  chrono += dt;
  const dir = (touches.droite ? 1 : 0) - (touches.gauche ? 1 : 0) + glisseDir;
  b.vx += (dir * 9 - b.vx) * Math.min(1, dt * 5);
  b.x = Math.max(-LARGEUR - 2, Math.min(LARGEUR + 2, b.x + b.vx * dt));
  b.z -= m.vitesse * dt;
  b.inclinaison += (-b.vx * .03 - b.inclinaison) * Math.min(1, dt * 6);
  b.invincible = Math.max(0, b.invincible - dt); b.secousse = Math.max(0, b.secousse - dt);
  /* moving obstacles */
  for (const o of obstacles) {
    /* once passed, an obstacle disappears so it never hides the boat */
    if (!o.decor) o.g.visible = o.z < b.z + 8;
    const u = o.g.userData;
    if (o.t.bouge === "x") {
      const v = Math.cos(horloge * .9 + o.phase);   // swimming speed: + goes right, - goes left
      o.x = o.x0 + Math.sin(horloge * .9 + o.phase) * 4; o.g.position.x = o.x;
      if (u.perso) {
        o.g.rotation.y = 0;
        u.sprite.scale.x = u.larg * (v > 0 ? 1 : -1);                 // looks where it swims
        u.sprite.material.rotation = -v * .12;                         // leans into the turn
        u.sprite.position.y = u.y0 + Math.sin(horloge * 3 + o.phase) * .12;
        o.g.position.y = hauteurVague(o.x, o.z, horloge) * .6;
      } else { o.g.rotation.y = v > 0 ? Math.PI / 2 : -Math.PI / 2; o.g.position.y = hauteurVague(o.x, o.z, horloge) - .1; }
    }
    else if (o.t.bouge === "saut") {
      const s = Math.max(0, Math.sin(horloge * 1.6 + o.phase));
      if (u.perso) {
        // hides under the water, then jumps out of it
        u.sprite.position.y = u.y0 - 1.1 + s * 1.9;
        u.sprite.material.rotation = Math.sin(horloge * 3.2 + o.phase) * .08 * s;
        u.ecume.scale.setScalar(1 + s * .6); u.ecume.material.opacity = .35 + s * .45;
        o.g.position.y = hauteurVague(o.x, o.z, horloge) * .5;
      } else { o.g.position.y = -0.4 + s * 1.4; o.g.rotation.x = -s * .4; u.machoire.rotation.x = s * .5; }
    }
    else o.g.position.y = hauteurVague(o.x, o.z, horloge) * .3;
    /* collision (circle, or rectangle for the glacier) */
    const dz = b.z - o.z, dx = b.x - o.x;
    if (Math.abs(dz) > 6) continue;
    const touche = o.t.r ? Math.hypot(dx, dz) < o.t.r + 1.1 : Math.abs(dx) < o.t.w + 1 && Math.abs(dz) < o.t.d + 1.6;
    if (touche) choc(o);
  }
  for (const p of portes) if (!p.passee && b.z < p.z) passerPorte(p);
  if (b.z < zFin) terminer();
}
/* The pirate keeps his boat on course: small hops, runs to the side the boat turns to, leans, looks ahead,
   waves his arms; a big jump when he finds the right answer, he stumbles when the boat hits something. */
function animerPirate(pi, dt) {
  if (!pi) return;
  const dir = Math.max(-1, Math.min(1, b.vx / 9)), t = horloge;
  pi.x += (dir * .45 - pi.x) * Math.min(1, dt * 4);                    // runs towards the turning side
  /* hop: a little one every second, a big one to celebrate */
  if (pi.saut <= 0 && pi.vy === 0 && (pi.fete > 0 || (t % 1.4) < dt)) pi.vy = pi.fete > 0 ? 3.2 : 1.6;
  pi.vy -= 9 * dt; pi.saut = Math.max(0, pi.saut + pi.vy * dt); if (pi.saut === 0 && pi.vy < 0) pi.vy = 0;
  pi.fete = Math.max(0, pi.fete - dt);
  const trebuche = b.secousse > 0;
  pi.p.position.set(pi.x, pi.y + pi.saut, pi.p.position.z);
  pi.p.rotation.z = -dir * .28 + (trebuche ? Math.sin(t * 10) * .2 : 0);   // leans into the turn
  /* he looks ahead most of the time; when an obstacle comes close, he turns towards it */
  let vise = null, dMin = 26;
  for (const o of obstacles) { if (o.decor) continue; const dz = o.z - b.z, dx = o.x - b.x; if (dz < -1 && dz > -26 && Math.abs(dx) < 12) { const d = Math.hypot(dx, dz); if (d < dMin) { dMin = d; vise = Math.atan2(-dx, -dz); } } }
  const corps = (vise === null ? 0 : vise * .5) - dir * .25, tete = vise === null ? Math.sin(t * .8) * .12 : vise * .6;
  pi.p.rotation.y += (corps - pi.p.rotation.y) * Math.min(1, dt * 5);
  pi.tete.rotation.y += (Math.max(-1.1, Math.min(1.1, tete)) - pi.tete.rotation.y) * Math.min(1, dt * 6);
  const pas = Math.sin(t * 9) * (Math.abs(dir) > .2 || pi.saut > 0 ? .6 : .15);
  pi.jambeG.rotation.x = pas; pi.jambeD.rotation.x = -pas;
  if (pi.fete > 0) { pi.brasG.rotation.z = -2.6; pi.brasD.rotation.z = 2.6; pi.brasG.rotation.x = pi.brasD.rotation.x = 0; }
  else { pi.brasG.rotation.z = -.2 - Math.max(0, -dir) * 1.2; pi.brasD.rotation.z = .2 + Math.max(0, dir) * 1.2; pi.brasG.rotation.x = -pas * .8; pi.brasD.rotation.x = pas * .8 - (trebuche ? 1.5 : 0); }
}
function dessiner(dt) {
  if (bateau) {
    const y = hauteurVague(b.x, b.z, horloge) + (bateauChoisi === 1 ? -.15 : bateauChoisi === 2 ? .6 + Math.sin(horloge * 2) * .2 : .05);
    bateau.position.set(b.x, y, b.z);
    bateau.rotation.z = b.inclinaison + (b.secousse > 0 ? Math.sin(b.secousse * 14) * .12 * b.secousse : 0); bateau.rotation.x = Math.sin(horloge * 1.7) * .03 * mer;
    for (const f of bateau.userData.anim) f(horloge);
    animerPirate(bateau.userData.pirate, dt);
    camera.position.set(b.x * .6, 6.5, b.z + 11); camera.lookAt(b.x * .8, 1.2, b.z - 12);
  }
  majGouttes(dt);
  merMesh.position.set(Math.round(b.x / 4) * 4, 0, Math.round(b.z / 4) * 4 - 60);
  vagues(horloge);
  for (const g of scene.userData.nuages) { g.position.x += g.userData.v * dt; if (g.position.x > 110) g.position.x = -110; if (g.position.z > b.z + 30) g.position.z -= 200; }
  renderer.render(scene, camera);
}
let avant = performance.now();
function boucle(t) {
  const dt = Math.min(.05, (t - avant) / 1000); avant = t; horloge += dt;
  if (enJeu && !enPause && !fini) { maj(dt); majHud(); }
  dessiner(dt);
  requestAnimationFrame(boucle);
}
function redimensionner() { const w = window.innerWidth, h = window.innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
window.addEventListener("resize", redimensionner); redimensionner();

/* ---------- Controls ---------- */
const CLES = { ArrowLeft: "gauche", KeyA: "gauche", KeyQ: "gauche", ArrowRight: "droite", KeyD: "droite" };
document.addEventListener("keydown", e => {
  if (CLES[e.code]) { touches[CLES[e.code]] = true; if (enJeu) e.preventDefault(); }
  else if ((e.code === "KeyP" || e.key === "Escape") && enJeu) { pause(!enPause); e.preventDefault(); }
});
document.addEventListener("keyup", e => { if (CLES[e.code]) touches[CLES[e.code]] = false; });
window.addEventListener("blur", () => { touches.gauche = touches.droite = false; });
document.querySelectorAll(".pad button").forEach(bt => {
  const k = bt.dataset.dir;
  bt.addEventListener("pointerdown", e => { e.preventDefault(); touches[k] = true; bt.setPointerCapture(e.pointerId); });
  for (const ev of ["pointerup", "pointercancel", "pointerleave"]) bt.addEventListener(ev, () => { touches[k] = false; });
});
/* Mouse or finger: slide left or right on the sea */
let glisseX = null, glisseDir = 0;
canvas.addEventListener("pointerdown", e => { glisseX = e.clientX; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener("pointermove", e => { if (glisseX === null) return; const d = e.clientX - glisseX; glisseDir = Math.max(-1, Math.min(1, d / 60)); });
for (const ev of ["pointerup", "pointercancel"]) canvas.addEventListener(ev, () => { glisseX = null; glisseDir = 0; });
function pause(p) { if (!enJeu) return; enPause = p; $("pause").hidden = !p; if (p) $("btnReprendre").focus(); else canvas.focus(); }
$("btnPause").onclick = () => pause(true);
$("btnReprendre").onclick = () => pause(false);
$("btnEcouter").onclick = () => question && parler(question.voix);
function menu() { enJeu = false; fini = false; for (const id of ["fin", "pause", "hud"]) $(id).hidden = true; remplirMenu(); $("accueil").hidden = false; }
$("btnMenu").onclick = menu; $("btnMenuFin").onclick = menu;
$("btnRejouer").onclick = demarrer;
$("btnSuivant").onclick = () => { niveau = Math.min(NB, niveau + 1); demarrer(); };
$("btnJouer").onclick = demarrer;

/* ---------- Start menu ---------- */
function remplirMenu() {
  const cb = $("choixBateau"); cb.textContent = "";
  BATEAUX.forEach((bt, i) => {
    const x = document.createElement("button"); x.type = "button"; x.className = "bateau"; x.setAttribute("role", "radio"); x.setAttribute("aria-checked", String(i === bateauChoisi));
    x.innerHTML = '<img alt=""><span></span><em class="prix"></em>'; x.querySelector("img").src = bt.img; x.querySelector("span").textContent = bt.nom;
    x.querySelector(".prix").textContent = PRIX_BATEAU[i] + " ⭐";
    x.onclick = () => { bateauChoisi = i; if (bateau) scene.remove(bateau); bateau = faireBateau(i); scene.add(bateau); remplirMenu(); }; cb.append(x);
  });
  /* Shark and crocodile-shark: "Au hasard" or one of the four characters */
  const choixPerso = (id, prefixe, noms, choisi, choisir) => {
    const c = $(id); c.textContent = "";
    for (let i = 0; i <= 4; i++) {
      const x = document.createElement("button"); x.type = "button"; x.className = "bateau"; x.setAttribute("role", "radio"); x.setAttribute("aria-checked", String(i === choisi));
      const p = i && window.MER_PERSONNAGES && window.MER_PERSONNAGES[prefixe + i];
      x.innerHTML = (i ? '<img alt="">' : '<div class="hasard" aria-hidden="true">🎲</div>') + "<span></span>";
      if (p) x.querySelector("img").src = p.src;
      x.querySelector("span").textContent = i ? noms[i - 1] : "Au hasard";
      x.insertAdjacentHTML("beforeend", '<em class="prix">' + (i ? PRIX_PERSO + " ⭐" : "gratuit") + "</em>");
      x.onclick = () => { choisir(i); remplirMenu(); }; c.append(x);
    }
  };
  choixPerso("choixRequin", "requin", REQUINS, requinChoisi, i => { requinChoisi = i; });
  choixPerso("choixCroco", "croco", CROCOS, crocoChoisi, i => { crocoChoisi = i; });
  /* With ?n= in the address (coming from the levels page), the question level is already chosen */
  const viaPage = PARAMS.has("n");
  $("blocNiveaux").hidden = viaPage; $("numMer").textContent = viaPage ? "3" : "4";
  const cn = $("choixNiveau"); cn.textContent = ""; const best = memo.lire("mer-meilleur", {}); let g0 = null;
  for (let n = 1; n <= NB; n++) {
    const nv = NIVEAUX[n];
    if (nv.g !== g0) { g0 = nv.g; const h = document.createElement("p"); h.className = "groupe"; h.textContent = GROUPES[g0]; cn.append(h); }
    const x = document.createElement("button"); x.type = "button"; x.className = "niveau"; x.setAttribute("aria-pressed", String(n === niveau));
    x.innerHTML = "<b></b><small></small>"; x.querySelector("b").textContent = n + ". " + nv.nom;
    x.querySelector("small").innerHTML = best[n] ? '<span class="et">' + "★".repeat(best[n]) + "☆".repeat(3 - best[n]) + "</span>" : "À découvrir";
    x.onclick = () => { niveau = n; remplirMenu(); }; cn.append(x);
  }
  const cm = $("choixMer"); cm.textContent = "";
  for (let p = 1; p <= 3; p++) {
    const x = document.createElement("button"); x.type = "button"; x.className = "mer"; x.setAttribute("role", "radio"); x.setAttribute("aria-checked", String(p === mer));
    x.innerHTML = "<span></span><small></small>"; x.querySelector("span").textContent = MERS[p].nom; x.querySelector("small").textContent = MERS[p].aide;
    x.onclick = () => { mer = p; remplirMenu(); }; cm.append(x);
  }
  $("resume").textContent = BATEAUX[bateauChoisi].nom + " · niveau " + niveau + " : " + NIVEAUX[niveau].nom + " · " + MERS[mer].nom;
  /* star bank: cost of this departure */
  const cout = coutDepart();
  $("banque").textContent = banque;
  $("coutDepart").textContent = cout;
  const vide = banque <= 0, manque = cout > banque;
  $("btnJouer").disabled = vide || manque;
  $("avertBanque").textContent = vide ? "Tu n’as plus d’étoiles. Reviens une autre fois : demain, ta banque aura de nouveau " + BANQUE_DEPART + " ⭐."
    : manque ? "Il te manque " + (cout - banque) + " ⭐ pour ce départ. Choisis un bateau moins cher ou « Au hasard »." : "";
}
/* Scenery behind the menu: the chosen boat sails on its own */
bateau = faireBateau(bateauChoisi); scene.add(bateau);
construire();
remplirMenu();
requestAnimationFrame(boucle);
})();
