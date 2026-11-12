/* The village of friends: a 3D block course in a village (path, houses, streams).
   Obstacles: low walls to jump, streams to cross, a "grump" to avoid.
   At each gate, a villager presents an everyday situation:
   the student chooses the best reaction and a bubble explains why.
   Levels: jeu.html?n=1 to 4. 3D engine: ../ile/three.min.js (r128). */
(function () {
"use strict";
const $ = id => document.getElementById(id);
const PARAMS = new URLSearchParams(location.search);
const NIVEAU = Math.min(4, Math.max(1, parseInt(PARAMS.get("n"), 10) || 1));
const NOMS = { 1: "Niveau 1 · Bonjour et écouter", 2: "Niveau 2 · Demander de l’aide et attendre", 3: "Niveau 3 · Les émotions et les amis", 4: "Niveau 4 · Adultes de confiance et sécurité" };
const memo = { lire(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
               ecrire(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };

/* ---------- The situations: [character, name, situation, good reaction, why, [wrong, why not], [wrong, why not]] ---------- */
const SITUATIONS = {
  1: [
    ["👩‍🍳", "La boulangère", "Tu entres à la boulangerie. La boulangère te dit : « Bonjour ! »", "Je la regarde et je dis : « Bonjour madame ! »", "Dire bonjour en regardant la personne, c’est poli et ça lui fait plaisir.", ["Je ne réponds pas.", "Si on ne répond pas, la personne peut penser qu’on ne l’aime pas ou qu’on ne l’a pas entendue."], ["Je crie « SALUT ! » très fort.", "Crier fait sursauter les gens. On dit bonjour avec une voix normale."]],
    ["🧒", "Ton ami Sami", "Sami te donne un autocollant de dinosaure.", "Je dis : « Merci, Sami ! »", "Dire merci montre qu’on est content du cadeau.", ["Je le prends sans rien dire.", "Sami ne saura pas si tu es content. On dit merci."], ["Je dis : « J’en veux un autre ! »", "Demander plus tout de suite, ce n’est pas gentil. D’abord, on dit merci."]],
    ["📮", "Le facteur", "Le facteur parle avec ta maman. Tu veux lui montrer ton dessin.", "J’attends qu’ils aient fini de parler.", "Attendre la fin de la conversation, c’est respecter les personnes qui parlent.", ["Je tire sur le chandail de maman.", "Tirer sur les vêtements dérange. On attend son tour pour parler."], ["Je parle plus fort qu’eux.", "Parler par-dessus les autres, c’est couper la parole. On attend."]],
    ["👩‍🏫", "L’enseignante", "L’enseignante explique les règles du jeu à toute la classe.", "Je la regarde et j’écoute.", "Écouter avec les yeux et les oreilles, c’est comme ça qu’on comprend la consigne.", ["Je joue avec mes lacets.", "Si tu joues avec tes lacets, tu ne vas pas entendre les règles."], ["Je parle à mon voisin.", "Quand on parle, on n’écoute pas, et on empêche les autres d’écouter."]],
    ["👴", "Monsieur Paul", "Tu bouscules Monsieur Paul sans faire exprès.", "Je dis : « Pardon, excusez-moi. »", "Même sans faire exprès, on s’excuse : la personne voit que tu fais attention à elle.", ["Je continue à marcher.", "Monsieur Paul peut penser que tu l’as fait exprès. On s’excuse."], ["Je dis : « C’est votre faute ! »", "Accuser l’autre n’est pas gentil, surtout quand c’est un accident."]],
    ["👵", "Grand-maman", "C’est l’heure de partir de chez grand-maman.", "Je dis : « Au revoir ! » et je lui fais un signe ou un câlin.", "Dire au revoir montre qu’on a aimé la visite.", ["Je pars en courant sans rien dire.", "Grand-maman aimerait que tu lui dises au revoir."], ["Je claque la porte.", "Claquer la porte fait du bruit et peut sembler fâché."]]],
  2: [
    ["🥪", "Le dîner", "Tu n’arrives pas à ouvrir ta boîte à lunch.", "Je lève la main et je dis : « Peux-tu m’aider, s’il te plaît ? »", "Demander de l’aide avec des mots, c’est la meilleure façon d’avoir de l’aide.", ["Je lance ma boîte par terre.", "Lancer la boîte ne l’ouvre pas, et ça peut la briser."], ["Je pleure sans rien dire.", "Les adultes ne peuvent pas deviner : on demande avec des mots."]],
    ["🛝", "Au parc", "Il y a une file d’enfants pour la glissade.", "Je me mets à la fin de la file et j’attends mon tour.", "Chacun son tour : c’est juste pour tout le monde.", ["Je passe devant tout le monde.", "Les autres attendent aussi. Ce n’est pas juste de passer devant."], ["Je pousse l’enfant devant moi.", "Pousser peut faire tomber et faire mal. On attend."]],
    ["⚽", "Les amis au ballon", "Des amis jouent au ballon. Tu aimerais jouer avec eux.", "Je demande : « Est-ce que je peux jouer avec vous ? »", "Demander gentiment, c’est la bonne façon d’entrer dans un jeu.", ["Je prends le ballon.", "Prendre le ballon arrête leur jeu et les fâche."], ["Je boude dans mon coin.", "Tes amis ne savent pas que tu veux jouer. Demande-leur !"]],
    ["📝", "En classe", "Tu ne comprends pas ce qu’il faut faire dans ton cahier.", "Je demande à l’enseignante de m’expliquer encore.", "Poser une question, c’est normal : c’est comme ça qu’on apprend.", ["Je fais n’importe quoi.", "Si tu ne comprends pas, tu risques de devoir tout recommencer."], ["Je copie sur mon voisin.", "Copier ne t’aide pas à comprendre. Demande de l’aide."]],
    ["🖍️", "Le crayon rouge", "Ton ami utilise le crayon rouge. Tu en as besoin aussi.", "Je demande : « Me le prêtes-tu quand tu as fini ? »", "Demander et attendre, c’est respecter l’autre.", ["Je lui arrache le crayon.", "Arracher, c’est prendre sans permission. Ça fâche ton ami."], ["Je cache ses autres crayons.", "Se venger n’arrange rien. On demande."]],
    ["🛒", "À l’épicerie", "Il y a beaucoup de monde à la caisse de l’épicerie.", "J’attends mon tour avec mon adulte.", "Tout le monde attend son tour à la caisse.", ["Je passe devant les gens.", "Les gens étaient là avant toi : on attend son tour."], ["Je crie : « Vite ! »", "Crier ne fait pas avancer la file plus vite et dérange tout le monde."]]],
  3: [
    ["🧒", "Ton ami Noah", "Noah est tombé dans la cour et il pleure.", "Je lui demande : « Ça va ? Veux-tu que j’aille chercher un adulte ? »", "Aider un ami qui a de la peine, c’est être un bon ami.", ["Je ris.", "Rire quand quelqu’un a mal, ça lui fait encore plus de peine."], ["Je continue à jouer.", "Noah a besoin d’aide. Un bon ami s’arrête pour l’aider."]],
    ["🎲", "Le jeu de société", "Tu perds au jeu de société.", "Je dis « Bravo ! » au gagnant et je propose de rejouer.", "Perdre, c’est décevant, mais on peut être fier de bien perdre.", ["Je lance les cartes.", "Lancer les cartes gâche le jeu pour tout le monde."], ["Je dis que le jeu est nul.", "Le jeu n’est pas nul : on est juste déçu. On peut le dire calmement."]],
    ["😠", "Une grosse colère", "Tu sens une grosse colère monter en toi.", "Je respire lentement et je compte jusqu’à 10.", "Respirer calme le corps. Ensuite, on peut dire avec des mots ce qui ne va pas.", ["Je frappe la table.", "Frapper peut te faire mal ou briser quelque chose."], ["Je crie des mots méchants.", "Les mots méchants blessent les autres. On se calme d’abord."]],
    ["🧑", "Le nouvel élève", "Un nouvel élève est tout seul à la récréation.", "Je l’invite à jouer avec moi.", "Inviter quelqu’un qui est seul, ça l’aide à se faire des amis.", ["Je fais semblant de ne pas le voir.", "Il se sent peut-être triste et seul. Tu peux l’aider."], ["Je me moque de lui.", "Se moquer fait de la peine. Ce n’est jamais gentil."]],
    ["🧸", "Le jouet de Lina", "Lina ne veut pas te prêter son jouet.", "J’accepte et je choisis un autre jeu.", "Le jouet est à Lina : elle a le droit de dire non. On peut jouer à autre chose.", ["Je lui prends le jouet.", "Prendre sans permission, ce n’est pas permis."], ["Je la pousse.", "Pousser peut faire mal. On respecte le non."]],
    ["🗯️", "Des mots méchants", "Un enfant dit des mots méchants à ton ami.", "Je dis : « Arrête, ce n’est pas gentil », et je vais voir un adulte si ça continue.", "Défendre un ami avec des mots calmes et demander l’aide d’un adulte, c’est courageux.", ["Je ris avec l’enfant.", "Rire, c’est aider la méchanceté. Ton ami se sentirait seul."], ["Je dis des méchancetés moi aussi.", "Répondre par des méchancetés empire la situation."]]],
  4: [
    ["🍬", "Une personne inconnue", "Une personne que tu ne connais pas t’offre des bonbons et te demande de la suivre.", "Je dis « Non ! », je m’éloigne et je le dis tout de suite à un adulte de confiance.", "On ne suit jamais une personne inconnue. On dit non, on s’éloigne et on le raconte à un adulte de confiance.", ["Je prends les bonbons et je la suis.", "C’est dangereux de suivre une personne inconnue, même si elle est gentille."], ["Je reste à parler avec elle.", "On ne reste pas avec une personne inconnue : on s’éloigne et on avertit un adulte."]],
    ["🏬", "Au centre commercial", "Tu ne vois plus ton adulte au centre commercial. Tu es perdu.", "Je reste où je suis ou je demande de l’aide à un employé du magasin.", "Si on ne bouge pas, ton adulte te retrouve plus vite. Un employé du magasin peut l’appeler.", ["Je sors dehors pour le chercher.", "Dehors, c’est encore plus difficile de te retrouver, et c’est dangereux."], ["Je pars avec la première personne qui me le propose.", "On ne part avec personne. On demande à un employé du magasin."]],
    ["🫂", "Les adultes de confiance", "Qui est un adulte de confiance ?", "Mes parents, mon enseignante, la direction de l’école.", "Un adulte de confiance est une personne que tu connais bien et qui prend soin de toi.", ["Une personne que je vois dans la rue.", "Une personne que tu ne connais pas n’est pas un adulte de confiance."], ["Une personne qui me demande de garder un secret.", "Un adulte de confiance ne te demande pas de garder des secrets qui te mettent mal à l’aise."]],
    ["🤫", "Un secret qui fait peur", "Un adulte te demande de garder un secret qui te rend mal à l’aise.", "J’en parle à un adulte de confiance.", "Un secret qui te rend mal à l’aise, on a le droit et le devoir d’en parler.", ["Je garde le secret.", "Garder ce genre de secret peut être dangereux. Parles-en."], ["Je n’en parle à personne, jamais.", "Tu n’es pas seul : un adulte de confiance peut t’aider."]],
    ["🚪", "On sonne à la porte", "Tu es seul à la maison et une personne inconnue sonne à la porte.", "Je n’ouvre pas et j’appelle un adulte de confiance.", "On n’ouvre pas la porte à une personne inconnue.", ["J’ouvre la porte.", "Ouvrir à une personne inconnue peut être dangereux."], ["Je crie : « Je suis tout seul ! »", "On ne dit jamais à une personne inconnue qu’on est seul."]],
    ["💻", "Sur Internet", "Dans un jeu en ligne, quelqu’un te demande ton adresse.", "Je ne la donne pas et je le dis à un adulte de confiance.", "Ton adresse est une information privée : on ne la donne pas en ligne.", ["Je donne mon adresse.", "Une personne en ligne peut mentir sur qui elle est. On garde son adresse privée."], ["J’envoie une photo de ma maison.", "Une photo peut aussi montrer où tu habites. On ne l’envoie pas."]]]
};
const melanger = l => l.map(x => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
const CHOISIES = melanger(SITUATIONS[NIVEAU]).slice(0, 5);

/* ---------- Scene ---------- */
const canvas = $("scene");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa8dcf7);
scene.fog = new THREE.Fog(0xa8dcf7, 70, 190);
const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 400);
scene.add(new THREE.HemisphereLight(0xffffff, 0x6a8a5a, 0.85));
const soleil = new THREE.DirectionalLight(0xfff4dc, 0.75);
soleil.position.set(20, 40, 15); soleil.castShadow = true; soleil.shadow.mapSize.set(1024, 1024);
Object.assign(soleil.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 120 });
scene.add(soleil, soleil.target);
const fond = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), new THREE.MeshLambertMaterial({ color: 0x3f6f8f }));
fond.rotation.x = -Math.PI / 2; fond.position.y = -7; scene.add(fond);
const matNuage = new THREE.MeshLambertMaterial({ color: 0xffffff });
for (let i = 0; i < 14; i++) {
  const g = new THREE.Group();
  for (let k = 0; k < 4; k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(3 + Math.random() * 3, 1.2, 2 + Math.random() * 2), matNuage); b.position.set(k * 2 - 3, Math.random() * .8, Math.random() * 2 - 1); g.add(b); }
  g.position.set(Math.random() * 200 - 100, 30 + Math.random() * 10, Math.random() * -220 + 30); scene.add(g);
}

/* ---------- Blocs ---------- */
const blocs = [];
const geoBloc = new THREE.BoxGeometry(1, 1, 1);
const mats = {};
const mat = c => mats[c] || (mats[c] = new THREE.MeshLambertMaterial({ color: c }));
function pilier(x, z, w, d, haut, couleur, opts) {
  const bas = -6, h = haut - bas;
  const m = new THREE.Mesh(geoBloc, mat(couleur)); m.scale.set(w, h, d); m.position.set(x, bas + h / 2, z); m.castShadow = true; m.receiveShadow = true; scene.add(m);
  const b = Object.assign({ mesh: m, w, d, h, x, z, y: bas + h / 2, type: "sol" }, opts || {}); blocs.push(b); return b;
}
function bloc(x, z, w, d, bas, haut, couleur) {
  const h = haut - bas, m = new THREE.Mesh(geoBloc, mat(couleur)); m.scale.set(w, h, d); m.position.set(x, bas + h / 2, z); m.castShadow = true; m.receiveShadow = true; scene.add(m);
  const b = { mesh: m, w, d, h, x, z, y: bas + h / 2, type: "sol" }; blocs.push(b); return b;
}
const LARGE = 8;
function bordInvisible(z, d) { for (const x of [-(LARGE / 2 + .3), LARGE / 2 + .3]) blocs.push({ mesh: null, w: .6, d, h: 30, x, z, y: 9, type: "bord" }); }
function boite(c, w, h, d, x, y, z, ombre) { const m = new THREE.Mesh(geoBloc, mat(c)); m.scale.set(w, h, d); m.position.set(x, y, z); m.castShadow = ombre !== false; m.receiveShadow = true; scene.add(m); return m; }

const CHEMIN = 0xe3c992, HERBE = 0x7cc06e, HERBE2 = 0x6db160, BOIS = 0xb98a5a, PIERRE = 0xa9a39a, EAU = 0x4f9ed8, OR = 0xe8c774;
let graine = 7; const hasard = () => (graine = (graine * 16807) % 2147483647) / 2147483647;
const TOITS = [0xc8553d, 0x3e6a90, 0x8e5bd6, 0x2e7d4f, 0xd4880f], MURS = [0xf3e2c3, 0xd6e6f5, 0xf6dfe6, 0xe8f2d8, 0xfff1c9];
function maison(x, z, cote) {
  const w = 5 + hasard() * 2, d = 4.5 + hasard() * 2, h = 3 + hasard() * 1.5, mur = MURS[Math.floor(hasard() * MURS.length)], toit = TOITS[Math.floor(hasard() * TOITS.length)];
  boite(mur, w, h, d, x, h / 2, z);
  const t = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * .78, 2.6, 4), mat(toit)); t.rotation.y = Math.PI / 4; t.scale.set(w / Math.max(w, d), 1, d / Math.max(w, d)); t.position.set(x, h + 1.3, z); t.castShadow = true; scene.add(t);
  boite(0x8a5a2a, 1.1, 2, .1, x - cote * (w / 2 + .03), 1, z, false).rotation.y = Math.PI / 2;
  for (const dz of [-d / 4, d / 4]) boite(0xbfe3ff, .1, .9, .9, x - cote * (w / 2 + .03), h * .62, z + dz * 1.6, false);
  if (hasard() < .5) boite(0x9a6a4a, .7, 1.2, .7, x + (hasard() - .5) * w * .4, h + 1.6, z);
}
function arbre(x, z) { boite(0x7a5130, .4, 1.6, .4, x, .8, z); boite(0x58a85c, 1.8, 1.6, 1.8, x, 2.3, z); boite(0x4b9a50, 1.1, .9, 1.1, x + .2, 3.3, z - .1); }
function fleurs(x, z) { const c = [0xf28cb1, 0xffd36b, 0xffffff, 0xe0573f][Math.floor(hasard() * 4)]; for (let i = 0; i < 3; i++) boite(c, .25, .25, .25, x + (hasard() - .5), .25, z + (hasard() - .5), false); }
function cloture(x, z0, z1) { for (let z = z0; z > z1; z -= 1.5) boite(0xf4eadb, .15, .9, .15, x, .45, z, false); boite(0xf4eadb, .08, .12, z0 - z1, x, .7, (z0 + z1) / 2, false); }
/* The sides of the path: grass, houses, trees */
function cotes(z0, z1) {
  const long = z0 - z1, zm = (z0 + z1) / 2;
  for (const s of [-1, 1]) {
    boite(HERBE, 30, 6, long, s * (LARGE / 2 + 15), -3, zm, false);
    cloture(s * (LARGE / 2 + .2), z0, z1);
    let z = z0 - 2;
    while (z - 6 > z1) { if (hasard() < .75) maison(s * (LARGE / 2 + 6.5), z - 3, s); else { arbre(s * (LARGE / 2 + 5), z - 2); arbre(s * (LARGE / 2 + 8), z - 4); } z -= 8 + hasard() * 2; }
    for (let k = z0 - 2; k > z1 + 1; k -= 4) { if (hasard() < .5) fleurs(s * (LARGE / 2 + 1.4), k); else if (hasard() < .4) arbre(s * (LARGE / 2 + 2), k); }
  }
}

/* ---------- The course ---------- */
const etoiles = [], drapeaux = [], sections = [], portes = [], grognons = [];
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
function sentier(long, nEtoiles) {
  const z0 = zc, z1 = zc - long;
  pilier(0, (z0 + z1) / 2, LARGE, long, 0, CHEMIN); bordInvisible((z0 + z1) / 2, long);
  for (let z = z0 - 1; z > z1 + .5; z -= 2.2) boite(0xd4b77d, .9 + hasard() * .6, .03, .7, (hasard() - .5) * 5, .015, z, false);
  cotes(z0, z1);
  for (let k = 0; k < (nEtoiles || 0); k++) etoile([-2, 2, 0][k % 3], 0, z0 - long * (k + 1) / ((nEtoiles || 0) + 1));
  zc = z1;
}
/* Obstacles */
function muret(haut) {
  sentier(3, 0); bloc(0, zc - .5, LARGE, 1, 0, haut, PIERRE);
  for (let x = -LARGE / 2 + .5; x < LARGE / 2; x += 1) boite(0x8f897f, .9, .08, 1.02, x, haut - .2, zc - .5, false);
  zc -= 1; sentier(5, 1);
}
function ruisseau(L) {
  sentier(3, 0); const zm = zc - L / 2;
  const eau = new THREE.Mesh(new THREE.BoxGeometry(LARGE + 30, .4, L), new THREE.MeshLambertMaterial({ color: EAU, transparent: true, opacity: .85 })); eau.position.set(0, -1.6, zm); scene.add(eau);
  boite(0x6e8f9e, LARGE + 30, 3, L, 0, -3.4, zm, false);
  for (let i = 0; i < 4; i++) boite(PIERRE, .8, .4, .6, (hasard() - .5) * 20 + (hasard() < .5 ? 12 : -12), -1.3, zm + (hasard() - .5) * L);
  zc -= L; sentier(5, 1);
}
function grognon(zg, vitesse, decal) {
  const g = new THREE.Group(); scene.add(g);
  const c = (w, h, d, col, x, y, z) => { const m = new THREE.Mesh(geoBloc, mat(col)); m.scale.set(w, h, d); m.position.set(x, y, z); m.castShadow = true; g.add(m); };
  c(1.3, 1.1, 1.1, 0x5b3f8a, 0, .75, 0); c(1.5, .3, 1.3, 0x4a3272, 0, .2, 0);
  c(.3, .3, .05, 0xffffff, -.3, 1, .56); c(.3, .3, .05, 0xffffff, .3, 1, .56); c(.12, .14, .06, 0x16324f, -.28, .97, .6); c(.12, .14, .06, 0x16324f, .28, .97, .6);
  c(.36, .08, .06, 0x16324f, -.3, 1.22, .58); c(.36, .08, .06, 0x16324f, .3, 1.22, .58); c(.5, .1, .06, 0x16324f, 0, .6, .58);
  g.children[6].rotation.z = -.35; g.children[7].rotation.z = .35;
  g.position.set(0, 0, zg); grognons.push({ g, z: zg, v: vitesse, decal, x: 0 });
}
function zoneGrognon(nb) {
  sentier(3, 0); const z0 = zc; sentier(6 + 4 * nb, 0);
  for (let i = 0; i < nb; i++) grognon(z0 - 4 - i * 4.5, NIVEAU >= 3 ? 1.25 : 1, i * 2.2);
  sentier(3, 1);
}
function obstacle(k) {
  const types = NIVEAU === 1 ? ["muret", "ruisseau", "grognon", "muret", "ruisseau"] : ["ruisseau", "grognon", "muret", "grognon", "ruisseau"];
  const t = types[k % types.length];
  if (t === "muret") { muret(NIVEAU === 1 ? 1 : 1.4); return "un muret"; }
  if (t === "ruisseau") { ruisseau(NIVEAU === 1 ? 2.5 : 3.5); return "un ruisseau"; }
  zoneGrognon(NIVEAU >= 3 ? 2 : 1); return "le grognon";
}
/* The villager and the gate */
const matVerre = new THREE.MeshLambertMaterial({ color: 0xbfeec0, transparent: true, opacity: .45 });
function villageois(x, z, couleur) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = x < 0 ? .6 : -.6; scene.add(g);
  const c = (w, h, d, col, px, py, pz) => { const m = new THREE.Mesh(geoBloc, mat(col)); m.scale.set(w, h, d); m.position.set(px, py, pz); m.castShadow = true; g.add(m); };
  c(.3, .8, .3, 0x3a4a6a, -.17, .4, 0); c(.3, .8, .3, 0x3a4a6a, .17, .4, 0); c(.7, .8, .4, couleur, 0, 1.2, 0); c(.25, .7, .25, couleur, -.47, 1.2, 0); c(.25, .7, .25, couleur, .47, 1.2, 0);
  c(.52, .52, .52, 0xe8b88f, 0, 1.86, 0); c(.56, .16, .56, 0x5a3a20, 0, 2.15, 0); c(.08, .08, .02, 0x16324f, -.11, 1.9, .27); c(.08, .08, .02, 0x16324f, .11, 1.9, .27); c(.2, .05, .02, 0xb24a3a, 0, 1.75, .27);
  return g;
}
function bulle() {
  const t = document.createElement("canvas"); t.width = 160; t.height = 128; const cx = t.getContext("2d");
  cx.fillStyle = "#ffffff"; cx.strokeStyle = "#16324f"; cx.lineWidth = 7; cx.beginPath(); cx.roundRect ? cx.roundRect(8, 8, 144, 90, 26) : cx.rect(8, 8, 144, 90); cx.fill(); cx.stroke();
  cx.beginPath(); cx.moveTo(50, 96); cx.lineTo(40, 124); cx.lineTo(78, 96); cx.fill(); cx.stroke(); cx.fillStyle = "#ffffff"; cx.fillRect(48, 90, 32, 9);
  cx.fillStyle = "#16324f"; cx.font = "bold 70px Arial"; cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("…", 80, 46);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(t), depthTest: false })); sp.scale.set(2, 1.6, 1); return sp;
}
function porte(sit) {
  sentier(5, 0);
  const zG = zc - 1, mur = pilier(0, zG, LARGE, .5, 4, 0xbfeec0); mur.mesh.material = matVerre; mur.mesh.castShadow = false;
  for (const s of [-1, 1]) boite(BOIS, .5, 4.6, .7, s * (LARGE / 2 - .1), 2.3, zG);
  boite(BOIS, LARGE + .4, .5, .7, 0, 4.5, zG);
  const cote = portes.length % 2 ? 1 : -1, perso = villageois(cote * 2.6, zG + 2, [0xe0573f, 0x2e9c76, 0xf2b134, 0x7a5ad8, 0x2364aa][portes.length % 5]);
  const sp = bulle(); sp.position.set(cote * 2.6, 3.4, zG + 2); scene.add(sp);
  portes.push({ sit, zG, mur, sp, perso, resolue: false, essais: new Set(), choix: null });
  zc -= 1; sentier(2, 0); drapeau(-3, 0, zc + 1);
  sections.push({ nom: "Porte " + portes.length + " · " + sit[1], z: zG + 8 });
}
/* Start */
pilier(0, 1, LARGE, 8, 0, CHEMIN); bordInvisible(1, 8); cotes(5, -3); sections.push({ nom: "Le départ", z: 99 }); zc = -3;
CHOISIES.forEach((sit, k) => { sentier(4, 1); const nom = obstacle(k); sections.push({ nom: "Attention : " + nom, z: zc + 12 }); porte(sit); });
sentier(8, 2);
/* Finish: the village square */
const arrivee = { x: 0, y: .5, z: zc - 5 };
pilier(0, zc - 5, LARGE, 10, 0, 0x9ccb9a); bordInvisible(zc - 5, 10); cotes(zc, zc - 10); bloc(0, zc - 5, 3.2, 3.2, -.1, .5, OR);
{ const g = new THREE.Group(); const m1 = new THREE.Mesh(new THREE.BoxGeometry(.2, 3.6, .2), mat(0xffffff)); m1.position.y = 1.8; g.add(m1);
  const t = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1, .08), new THREE.MeshLambertMaterial({ color: OR, emissive: 0x6b4a00 })); t.position.set(.88, 3.1, 0); g.add(t);
  g.position.set(-.9, .5, zc - 5); scene.add(g); arrivee.drapeau = t; }
sections.push({ nom: "La place du village", z: zc + 2 });
const TOTAL_ETOILES = etoiles.length;

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
/* Characters, accessories and tools bought with stars (shared by the block games) */
Personnages.init({ jeu: "village", corps, jambeG, jambeD, brasG, brasD, portefeuille: { lire: () => tirelire.etoiles, depenser: n => { tirelire.etoiles = Math.max(0, tirelire.etoiles - n); sauverTirelire(); if (typeof majSoldes === "function") majSoldes(); }, gagner: n => { tirelire.etoiles += n; sauverTirelire(); if (typeof majSoldes === "function") majSoldes(); } } });
const ombre = new THREE.Mesh(new THREE.CircleGeometry(.42, 24), new THREE.MeshBasicMaterial({ color: 0x16324f, transparent: true, opacity: .28, depthWrite: false }));
ombre.rotation.x = -Math.PI / 2; scene.add(ombre);

/* ---------- Player state ---------- */
const DEMI = .32, HAUT = 2.15;
const j = { x: 0, y: 0, z: 3, vx: 0, vy: 0, vz: 0, sol: null, coyote: 0, tampon: 0, angle: Math.PI, marche: 0 };
let horloge = 0, depart = { x: 0, y: 0, z: 3 }, nbEtoiles = 0, enJeu = false, enPause = false, fini = false, chrono = 0, erreurs = 0, premiers = 0, ouvertes = 0, attrape = 0;
const lacam = { yaw: 0, pitch: .4, dist: 9, cible: null };
const opts = { vitesse: 1 };

/* ---------- Inputs ---------- */
const touches = { haut: false, bas: false, gauche: false, droite: false, saut: false };
const CARTE = { ArrowUp: "haut", KeyW: "haut", KeyZ: "haut", ArrowDown: "bas", KeyS: "bas", ArrowLeft: "gauche", KeyA: "gauche", KeyQ: "gauche", ArrowRight: "droite", KeyD: "droite", Space: "saut" };
addEventListener("keydown", e => {
  if (e.target && /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
  if (e.code === "KeyP" || e.code === "Escape") { if (enJeu && !fini) basculerPause(); e.preventDefault(); return; }
  if (active && !active.resolue && enJeu && !enPause && /^(Digit|Numpad)[1-3]$/.test(e.code)) { repondre(active.choix[+e.code.slice(-1) - 1][0]); e.preventDefault(); return; }
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

/* ---------- Physique ---------- */
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
  const bloque = active && !active.resolue;
  let ix = bloque ? 0 : (touches.droite ? 1 : 0) - (touches.gauche ? 1 : 0), iz = bloque ? 0 : (touches.haut ? 1 : 0) - (touches.bas ? 1 : 0);
  const fx = -Math.sin(lacam.yaw), fz = -Math.cos(lacam.yaw), rx = Math.cos(lacam.yaw), rz = -Math.sin(lacam.yaw);
  let mx = fx * iz + rx * ix, mz = fz * iz + rz * ix; const n = Math.hypot(mx, mz), vmax = 5.6 * opts.vitesse;
  if (n > 0) { mx /= n; mz /= n; j.angle = Math.atan2(mx, mz); }
  const lisse = Math.min(1, dt * (j.sol ? 14 : 5));
  const vOutil = vmax * Personnages.vitesse(); j.vx += (mx * vOutil - j.vx) * lisse; j.vz += (mz * vOutil - j.vz) * lisse;
  j.coyote = j.sol ? .14 : Math.max(0, j.coyote - dt); j.tampon = Math.max(0, j.tampon - dt);
  if (!bloque && j.tampon > 0 && j.coyote > 0) { j.vy = 9.4; j.sol = null; j.coyote = 0; j.tampon = 0; }
  j.vy -= (j.vy < 0 ? 19 : 22) * dt; j.vy = Math.max(j.vy, -24); Personnages.physique(j, dt);
  bougerAxe("x", j.vx * dt); bougerAxe("z", j.vz * dt);
  j.y += j.vy * dt; j.sol = null;
  for (const b of blocs) {
    if (!chevauche(b, j.x, j.y, j.z)) continue;
    if (j.vy <= 0) { j.y = dessus(b); j.sol = b; j.vy = 0; } else { j.y = b.y - b.h / 2 - HAUT - .001; j.vy = 0; }
  }
  if (j.y < -4.5) { reapparaitre("Plouf ! Tu repars du dernier drapeau 🚩. Prends ton élan et saute plus loin."); return; }
  for (const gr of grognons) if (Math.abs(j.x - gr.x) < .95 && Math.abs(j.z - gr.z) < .85 && j.y < 1.6) { attrape++; reapparaitre("Le grognon t’a attrapé ! Attends qu’il s’éloigne, puis passe. 😤"); return; }
  for (const e of etoiles) if (!e.prise && Math.hypot(j.x - e.x, j.z - e.z) < .95 && Math.abs(j.y + 1 - e.y) < 1.4) {
    e.prise = true; e.m.visible = false; nbEtoiles++; tirelire.etoiles++; sauverTirelire(); majCompteurs(); sonEffet("etoile");
    dire("⭐ Une étoile pour ta tirelire ! (" + tirelire.etoiles + " ⭐)", 1600);
  }
  for (const d of drapeaux) if (!d.atteint && Math.abs(j.z - d.z) < 1.5 && Math.abs(j.y - d.y) < 1) { d.atteint = true; d.tissu.material = mat(0x6fb58e); depart = { x: 0, y: d.y, z: d.z }; }
  surveillerPortes();
  for (const p of portes) if (p.descend && p.mur.mesh.visible) { p.mur.mesh.position.y -= dt * 7; if (p.mur.mesh.position.y < p.mur.y - p.mur.h) p.mur.mesh.visible = false; }
  if (!fini && Math.hypot(j.x - arrivee.x, j.z - arrivee.z) < 1.8 && Math.abs(j.y - arrivee.y) < .6) gagner();
  let s = sections[0]; for (const x of sections) if (j.z < x.z) s = x; $("section").textContent = s.nom;
  const v = Math.hypot(j.vx, j.vz); j.marche += dt * v * 2.2; const amp = j.sol ? Math.min(.7, v / 6) : .35;
  jambeG.rotation.x = Math.sin(j.marche) * amp; jambeD.rotation.x = -Math.sin(j.marche) * amp; brasG.rotation.x = -Math.sin(j.marche) * amp; brasD.rotation.x = Math.sin(j.marche) * amp;
}
function bougerGrognons(t) {
  for (const gr of grognons) { gr.x = Math.sin(t * gr.v + gr.decal) * (LARGE / 2 - 1); gr.g.position.x = gr.x; gr.g.rotation.y = Math.cos(t * gr.v + gr.decal) > 0 ? .5 : -.5; gr.g.position.y = Math.abs(Math.sin(t * 4 + gr.decal)) * .15; }
}
function reapparaitre(msg) { j.x = depart.x; j.y = depart.y + .2; j.z = depart.z; j.vx = j.vy = j.vz = 0; j.sol = null; lacam.cible = 0; if (enJeu && msg) dire(msg, 2600); }

/* ---------- The gates: choose the best reaction ---------- */
let active = null;
function preparerPortes() {
  for (const p of portes) {
    const s = p.sit; p.choix = melanger([[s[3], true, s[4]], [s[5][0], false, s[5][1]], [s[6][0], false, s[6][1]]]);
    p.resolue = false; p.essais = new Set(); p.sp.visible = true; p.descend = false;
    if (!blocs.includes(p.mur)) blocs.push(p.mur); p.mur.mesh.visible = true; p.mur.mesh.position.y = p.mur.y;
  }
}
function surveillerPortes() {
  const p = portes.find(x => !x.resolue && j.z < x.zG + 5 && j.z > x.zG);
  if (p && p !== active) ouvrir(p);
}
function ouvrir(p) {
  active = p; const s = p.sit;
  $("reflPerso").textContent = s[0]; $("reflTitre").textContent = s[1]; $("reflTexte").textContent = s[2];
  $("reflRetour").textContent = ""; $("reflRetour").className = "defi-retour"; $("reflIndice").hidden = true; $("reflIndiceBtn").hidden = false;
  const box = $("reflChoix"); box.textContent = "";
  p.choix.forEach((c, i) => { const b = document.createElement("button"); b.type = "button"; b.textContent = (i + 1) + ". " + c[0]; b.dataset.c = c[0]; if (p.essais.has(c[0])) b.classList.add("non"); b.onclick = () => repondre(c[0]); box.append(b); });
  $("reflexion").hidden = false; sonEffet("defi");
  touches.haut = touches.bas = touches.gauche = touches.droite = false;
}
function repondre(texte) {
  const p = active; if (!p || p.resolue) return;
  const c = p.choix.find(x => x[0] === texte); if (!c) return;
  if (c[1]) {
    if (!p.essais.size) premiers++;
    p.resolue = true; p.sp.visible = false; p.descend = true; blocs.splice(blocs.indexOf(p.mur), 1); ouvertes++; majCompteurs();
    sonEffet("bravo");
    $("reflRetour").textContent = "✅ Bonne réaction ! " + c[2] + " La porte s’ouvre."; $("reflRetour").className = "defi-retour bon";
    $("reflChoix").querySelectorAll("button").forEach(b => { b.disabled = true; if (b.dataset.c === texte) b.classList.add("oui"); });
    $("reflIndiceBtn").hidden = true;
    const suite = document.createElement("button"); suite.type = "button"; suite.className = "refl-suite"; suite.textContent = "Continuer ▶";
    suite.onclick = () => fermer(p); $("reflChoix").append(suite); suite.focus();
  } else {
    if (!p.essais.has(texte)) { p.essais.add(texte); erreurs++; }
    $("reflRetour").textContent = "🤔 Pas tout à fait. " + c[2] + " Essaie une autre réaction."; $("reflRetour").className = "defi-retour oups";
    $("reflChoix").querySelectorAll("button").forEach(b => { if (p.essais.has(b.dataset.c)) b.classList.add("non"); }); sonEffet("encore");
  }
}
function fermer(p) { if (active === p) { active = null; $("reflexion").hidden = true; canvas.focus(); } }
$("reflIndiceBtn").onclick = () => { if (active) { $("reflIndice").hidden = false; $("reflIndice").textContent = "💡 Indice : pense à la réaction qui est polie, calme, et qui garde tout le monde en sécurité."; } };
$("reflLire").onclick = () => { if (active) parler(active.sit[2] + " Que fais-tu ? " + active.choix.map((c, i) => (i + 1) + " : " + c[0]).join(" ")); };

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
  if (!enJeu) { tourMenu += dt * .1; const cz = (5 + zc) / 2; camera.position.lerp(new THREE.Vector3(Math.sin(tourMenu) * 55, 34, cz + Math.cos(tourMenu) * 55), Math.min(1, dt * 2)); camera.lookAt(0, 0, cz); }
  else { const cx = j.x + Math.sin(lacam.yaw) * lacam.dist * Math.cos(lacam.pitch), cz = j.z + Math.cos(lacam.yaw) * lacam.dist * Math.cos(lacam.pitch), cy = j.y + 1.4 + lacam.dist * Math.sin(lacam.pitch);
    camera.position.lerp(new THREE.Vector3(cx, cy, cz), Math.min(1, dt * 8)); camera.lookAt(j.x, j.y + 1.3, j.z); }
  soleil.position.set(j.x + 20, j.y + 40, j.z + 15); soleil.target.position.set(j.x, j.y, j.z);
}

/* ---------- Interface ---------- */
let minuterieMessage = null;
function dire(t, ms) { const m = $("message"); m.textContent = t; m.hidden = false; clearTimeout(minuterieMessage); minuterieMessage = setTimeout(() => { m.hidden = true; }, ms || 2000); }
function majCompteurs() { $("etoiles").textContent = nbEtoiles + " / " + TOTAL_ETOILES; $("drapeaux").textContent = ouvertes + " / " + portes.length;
  $("etoiles").parentNode.style.setProperty("--p", Math.round(100 * nbEtoiles / TOTAL_ETOILES) + "%"); $("drapeaux").parentNode.style.setProperty("--p", Math.round(100 * ouvertes / portes.length) + "%"); }
const temps = s => Math.floor(s / 60) + " min " + String(Math.floor(s % 60)).padStart(2, "0") + " s";
function basculerPause(force) {
  enPause = force !== undefined ? force : !enPause;
  $("btnPause").setAttribute("aria-pressed", String(enPause)); $("btnPause").textContent = enPause ? "▶ Reprendre" : "⏸ Pause";
  $("pausePanneau").hidden = !enPause; if (enPause) $("pReprendre").focus(); else { $("message").hidden = true; canvas.focus(); }
}
/* ★★★: all the good reactions on the first try; ★★: one or two mistakes; ★: the village is crossed */
const scoreSur3 = () => erreurs === 0 ? 3 : erreurs <= 2 ? 2 : 1;
function gagner() {
  fini = true; enPause = false; active = null; $("reflexion").hidden = true;
  const sc = scoreSur3(); $("finScore").textContent = "★".repeat(sc) + "☆".repeat(3 - sc);
  $("btnSuivant").hidden = NIVEAU >= 4;
  const sv = $("finSauvegarde"); sv.textContent = "";
  if (window.EC && EC.enregistrerNiveau) {
    sv.textContent = "Enregistrement du score…";
    EC.enregistrerNiveau({ activity: "jeu-village", level: NIVEAU, score: sc, total: 3, seconds: Math.min(86400, Math.round(chrono)) }).then(r => {
      sv.textContent = r.ok ? "✓ Score gardé dans ton espace." : r.raison === "invite" ? "Tu n'es pas connecté : connecte-toi pour garder ton score." : r.raison === "enseignante" ? "Compte enseignante : le score n'est pas enregistré." : "Le score n'a pas pu être enregistré. Réessaie plus tard."; }).catch(() => { sv.textContent = ""; });
  }
  $("finEtoiles").textContent = nbEtoiles + " / " + TOTAL_ETOILES; $("finTemps").textContent = temps(chrono); $("finErreurs").textContent = erreurs; $("finReflexion").textContent = premiers + " / " + portes.length;
  $("texteFin").textContent = (erreurs === 0 ? "Toutes tes réactions étaient les meilleures du premier coup, bravo ! " : "Tu as traversé tout le village. Rejoue pour trouver la meilleure réaction du premier coup. ") + "Dans ta tirelire : " + tirelire.etoiles + " ⭐.";
  sonEffet("bravo"); $("fin").hidden = false; $("btnRejouer").focus();
}
function recommencer() {
  for (const e of etoiles) { e.prise = false; e.m.visible = true; }
  for (const d of drapeaux) { d.atteint = false; d.tissu.material = mat(0xe58f7b); }
  active = null; $("reflexion").hidden = true; preparerPortes();
  nbEtoiles = 0; chrono = 0; fini = false; erreurs = 0; premiers = 0; ouvertes = 0; attrape = 0; depart = { x: 0, y: 0, z: 3 };
  j.angle = Math.PI; lacam.yaw = 0; reapparaitre(); $("message").hidden = true; majCompteurs();
}
$("btnJouer").onclick = () => {
  opts.vitesse = +$("optVitesse").value; $("accueil").hidden = true; enJeu = true; basculerPause(false); canvas.focus();
  dire("Avance sur le sentier avec ▲. Saute les murets et les ruisseaux avec Espace !", 3600);
};
$("btnAide").onclick = () => { $("accueil").hidden = false; $("btnJouer").textContent = "Reprendre"; enJeu = false; $("btnJouer").focus(); };
$("pReprendre").onclick = () => basculerPause(false); $("pFermer").onclick = () => basculerPause(false);
$("pRecommencer").onclick = () => { recommencer(); basculerPause(false); };
$("pAide").onclick = () => { $("pausePanneau").hidden = true; enPause = false; $("btnAide").click(); };
$("btnPause").onclick = () => { if (enJeu && !fini) basculerPause(); };
$("btnRejouer").onclick = () => { $("fin").hidden = true; recommencer(); canvas.focus(); };
$("btnSuivant").onclick = () => { location.href = "jeu.html?n=" + (NIVEAU + 1); };
$("btnRetour").onclick = () => { location.href = "../jeux/village-des-amis.html"; };
$("nomNiveau").textContent = NOMS[NIVEAU];
$("villeNiveau").textContent = NOMS[NIVEAU] + " · " + portes.length + " portes";
$("texteAccueil").textContent = "Traverse le village jusqu’au drapeau d’or. Saute par-dessus les murets et les ruisseaux, et évite le grognon 😤. Devant chaque porte, un villageois te raconte une situation : choisis la meilleure réaction pour ouvrir la porte. Une bulle t’explique pourquoi. Ramasse les étoiles : elles vont dans ta tirelire.";
document.title = "Le village des amis · Niveau " + NIVEAU;

/* ---------- Piggy bank (the same as the Calculation island and the block city) ---------- */
const CLE_TIRELIRE = "ile-aux-calculs-tirelire";
const tirelire = Object.assign({ etoiles: 0, inv: {}, tenue: {}, porte: {} }, memo.lire(CLE_TIRELIRE, {}));
function sauverTirelire() { memo.ecrire(CLE_TIRELIRE, tirelire); }

/* ---------- Petits sons ---------- */
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
  if (t === "etoile") son([84, 88], "triangle", .07, .06);
  if (t === "defi") son([76, 81], "sine", .07, .12);
}

/* ---------- Loop ---------- */
function redimensionner() { const w = innerWidth, h = innerHeight; lacam.dist = w / h < .8 ? 13 : 9; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener("resize", redimensionner); redimensionner();
let avant = performance.now(), gel = false, tGrognon = 0;
const calme = matchMedia("(prefers-reduced-motion: reduce)").matches;
function boucle(maintenant) {
  const dt = Math.min(.05, (maintenant - avant) / 1000); avant = maintenant;
  if (enJeu && !enPause && !gel) { tGrognon += dt; bougerGrognons(tGrognon); mettreAJour(dt); }
  else if (!enJeu) { tGrognon += dt; bougerGrognons(tGrognon); }
  const t = maintenant / 1000;
  if (!calme) for (const e of etoiles) if (!e.prise) e.m.rotation.y = t * 1.6;
  for (const p of portes) if (p.sp.visible) p.sp.position.y = 3.4 + (calme ? 0 : Math.sin(t * 2.5 + p.zG) * .15);
  for (const d of drapeaux) d.tissu.rotation.y = Math.sin(t * 2 + d.n) * .12;
  if (arrivee.drapeau) arrivee.drapeau.rotation.y = Math.sin(t * 2) * .15;
  placer(dt); renderer.render(scene, camera); requestAnimationFrame(boucle);
}
preparerPortes(); majCompteurs(); reapparaitre(); $("message").hidden = true; $("section").textContent = sections[0].nom; camera.position.set(0, 30, 40);
requestAnimationFrame(boucle);
/* For automatic tests */
window.VillageDesAmis = { j, portes, grognons, blocs, touches, repondre, etat: () => ({ fini, enJeu, enPause, erreurs, premiers, ouvertes, nbEtoiles, attrape, active: active && active.sit[1] }), geler: v => { gel = v; }, pas: mettreAJour, bougerGrognons };
})();
