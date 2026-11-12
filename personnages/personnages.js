/* Characters and accessories shared by all the block games of MathJeux.
   - One star wallet for every game (the same one as Île aux calculs, Splash, Désert, Village and Ville).
   - "Mon personnage" (the avatar of the game) is free; the 12 characters are bought with stars.
   - Each game has its own list of accessories, bought with stars, worn on any character.
   Usage in a game, right after the avatar is built:
     Personnages.init({ jeu: "splash", corps, jambeG, jambeD, brasG, brasD, portefeuille });
   The optional "portefeuille" lets a game that keeps the wallet in memory spend from it. */
(function () {
  "use strict";
  const CLE = "mathjeux-personnages", CLE_ETOILES = "ile-aux-calculs-tirelire";
  const lire = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };
  const ecrire = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const BASE = (document.currentScript && document.currentScript.src.replace(/personnages\.js.*$/, "")) || "../personnages/";
  const etat = Object.assign({ choisi: "defaut", persos: [], acc: {}, outils: [], outil: null }, lire(CLE, {}));
  const sauver = () => ecrire(CLE, etat);

  /* ---------- The 12 characters (portrait + blocky 3D version) ---------- */
  const PEAU = 0xf2c79e;
  const PERSOS = [
    { id: "p01", nom: "Superhéros étoile", prix: 10, d: { chandail: 0x2a4fb8, manches: 0x2a4fb8, pantalon: 0x2a4fb8, chaussures: 0x2a4fb8, cheveux: 0x6b3f1f, pointes: true, cape: 0xd63a2f, etoile: true, ceinture: 0xf4c542, lunettes: 0x4fb3e8 } },
    { id: "p02", nom: "Explorateur", prix: 10, d: { chandail: 0xd9c49a, manches: 0xd9c49a, pantalon: 0x7b7a45, chaussures: 0x7a4a2a, cheveux: 0x6b3f1f, chapeau: 0xc9a46a, sac: 0x5f8a3a, foulard: 0x4caf50 } },
    { id: "p03", nom: "Aventurière rose", prix: 15, d: { chandail: 0xe85d9c, manches: 0xe85d9c, pantalon: 0x4f7fd0, chaussures: 0xf06eaa, cheveux: 0x7a4a2a, longs: true, lunettes: 0xd06ad8, casque: true } },
    { id: "p04", nom: "Renard aventurier", prix: 15, d: { tete: "renard", chandail: 0x2f5fbf, manches: 0x2f5fbf, pantalon: 0xc9a46a, chaussures: 0x2f5fbf, etoile: true, lunettes: 0x4fb3e8, sac: 0x8a5a35, queue: true } },
    { id: "p05", nom: "Robot", prix: 20, d: { tete: "robot", chandail: 0xeef3fa, manches: 0x2f7fe0, pantalon: 0xeef3fa, chaussures: 0x2f7fe0, etoile: true, gants: 0x2f7fe0 } },
    { id: "p06", nom: "Ninja", prix: 20, d: { chandail: 0x22252b, manches: 0x22252b, pantalon: 0x22252b, chaussures: 0x22252b, cheveux: 0x4a2c18, pointes: true, bandeau: 0xc0392b, ceinture: 0xc0392b, katana: true } },
    { id: "p07", nom: "Renard explorateur", prix: 25, d: { tete: "renard", chandail: 0x8a5a35, manches: 0x8a5a35, pantalon: 0x6b4a2a, chaussures: 0xd9a03a, foulard: 0xc0392b, sac: 0x5f8a3a, queue: true } },
    { id: "p08", nom: "Héros bleu", prix: 25, d: { chandail: 0x1f3f9f, manches: 0x1f3f9f, pantalon: 0x1f3f9f, chaussures: 0x3f6fe0, cheveux: 0x6b3f1f, pointes: true, cape: 0xc0392b, etoile: true, ceinture: 0xf4c542, lunettes: 0x4fb3e8 } },
    { id: "p09", nom: "Exploratrice rose", prix: 30, d: { chandail: 0xe85d9c, manches: 0xe85d9c, pantalon: 0xe85d9c, chaussures: 0xf4f4f4, cheveux: 0xd46a8a, longs: true, casquette: 0xd94f8c, sac: 0x8a5a35, ceinture: 0x7a4a2a } },
    { id: "p10", nom: "Explorateur safari", prix: 30, d: { chandail: 0xcbb68a, manches: 0xcbb68a, pantalon: 0xb49a6a, chaussures: 0x6b4426, cheveux: 0x6b3f1f, chapeau: 0xd9b77a, sac: 0x5f7a3a, ceinture: 0x6b4426 } },
    { id: "p11", nom: "Robot à cape", prix: 35, d: { tete: "robot", chandail: 0xeef3fa, manches: 0x2f7fe0, pantalon: 0xeef3fa, chaussures: 0x2f7fe0, etoile: true, gants: 0x2f7fe0, cape: 0x5fb8ff, capeVerre: true, crete: 0x2f7fe0 } },
    { id: "p12", nom: "Aventurier jaune", prix: 40, d: { chandail: 0xf4c542, manches: 0xf4c542, pantalon: 0x2a2f3a, chaussures: 0x2f5fbf, cheveux: 0x6b3f1f, pointes: true, gilet: 0x2f5fbf, lunettes: 0x4fb3e8, sac: 0x2f5fbf } }
  ];

  /* ---------- The 24 accessories; each game sells its own selection ---------- */
  const ACC = {
    a01: { nom: "Couronne royale", place: "tete" }, a02: { nom: "Lunettes de héros", place: "yeux" }, a03: { nom: "Casque audio", place: "oreilles" },
    a04: { nom: "Oreilles de chat", place: "tete" }, a05: { nom: "Lunettes d’explorateur", place: "yeux" }, a06: { nom: "Chapeau de pirate", place: "tete" },
    a07: { nom: "Chapeau de magicien", place: "tete" }, a08: { nom: "Casque viking", place: "tete" }, a09: { nom: "Casque spatial", place: "tete" },
    a10: { nom: "Auréole", place: "aureole" }, a11: { nom: "Corne de licorne", place: "tete" }, a12: { nom: "Capuche de dragon", place: "tete" },
    a13: { nom: "Ailes d’ange", place: "dos" }, a14: { nom: "Ailes de dragon", place: "dos" }, a15: { nom: "Ailes de papillon", place: "dos" },
    a16: { nom: "Jetpack", place: "dos" }, a17: { nom: "Cape de héros", place: "cape" }, a18: { nom: "Cape arc-en-ciel", place: "cape" },
    a19: { nom: "Sac à dos étoilé", place: "dos" }, a20: { nom: "Sac renard", place: "dos" }, a21: { nom: "Bouclier", place: "mainG" },
    a22: { nom: "Épée lumineuse", place: "mainD" }, a23: { nom: "Bâton magique", place: "mainD" }, a24: { nom: "Pioche d’aventurier", place: "mainD" }
  };
  /* All 24 accessories in every game, from the cheapest to the most special (10, 15, 20, … stars) */
  const ORDRE_ACC = ["a04", "a02", "a03", "a05", "a06", "a21", "a24", "a20", "a19", "a11", "a10", "a07", "a08", "a17", "a18", "a23", "a22", "a12", "a09", "a15", "a13", "a14", "a16", "a01"];
  ORDRE_ACC.forEach((id, i) => { ACC[id].prix = 10 + 5 * i; });

  /* ---------- The 12 tools: one at a time, shared by every block game ----------
     Effects never let the player go over a question wall: jumps stay lower than the walls,
     gliders only slow the fall, bridges and the teleporter only help after a fall. */
  const OUTILS = [
    { id: "o01", nom: "Tremplin", prix: 12, effet: "Tu sautes plus haut.", saut: 1.22 },
    { id: "o02", nom: "Pont en bois", prix: 15, effet: "Si tu tombes, un pont en bois te rattrape.", pont: { long: 5, duree: 5, couleur: 0xb07a45 } },
    { id: "o03", nom: "Cape volante", prix: 20, effet: "Tu tombes doucement.", chute: 6.5 },
    { id: "o04", nom: "Hoverboard", prix: 20, effet: "Tu glisses plus vite.", vitesse: 1.2 },
    { id: "o05", nom: "Pont de glace", prix: 20, effet: "Si tu tombes, un long pont de glace te rattrape.", pont: { long: 7, duree: 4, couleur: 0xaee6ff, verre: true } },
    { id: "o06", nom: "Jetpack", prix: 25, effet: "Tu sautes très haut.", saut: 1.3 },
    { id: "o07", nom: "Parachute", prix: 25, effet: "Tu descends en sécurité, tout doucement.", chute: 3.5 },
    { id: "o08", nom: "Ailes magiques", prix: 30, effet: "Tu sautes plus haut et tu tombes doucement.", saut: 1.15, chute: 5 },
    { id: "o09", nom: "Deltaplane", prix: 30, effet: "Tu planes : tu tombes doucement et tu avances vite.", chute: 4, vitesse: 1.1 },
    { id: "o10", nom: "Pont magique", prix: 30, effet: "Si tu tombes, un grand pont arc-en-ciel te rattrape.", pont: { long: 9, duree: 8, arc: true } },
    { id: "o11", nom: "Téléportation", prix: 35, effet: "Si tu tombes, tu reviens tout de suite sur le sol.", tele: true },
    { id: "o12", nom: "Avion", prix: 40, effet: "Tu vas très vite et tu tombes doucement.", vitesse: 1.3, chute: 6 }
  ];
  /* In these games the challenges are about choosing how to cross or climb: tools are only for style */
  const SANS_EFFET = ["ville", "tempete"];

  /* ---------- Star wallet ---------- */
  let P = null, wallet = null;
  const portefeuilleLocal = {
    lire: () => (lire(CLE_ETOILES, {}).etoiles || 0),
    depenser: n => { const t = Object.assign({ etoiles: 0, inv: {}, tenue: {}, porte: {} }, lire(CLE_ETOILES, {})); t.etoiles = Math.max(0, (t.etoiles || 0) - n); ecrire(CLE_ETOILES, t); },
    gagner: n => { const t = Object.assign({ etoiles: 0, inv: {}, tenue: {}, porte: {} }, lire(CLE_ETOILES, {})); t.etoiles = (t.etoiles || 0) + n; ecrire(CLE_ETOILES, t); }
  };

  /* ---------- Blocky 3D builder ---------- */
  const mats = {};
  function mat(c, o) { const k = c + (o ? JSON.stringify(o) : ""); return mats[k] || (mats[k] = new THREE.MeshLambertMaterial(Object.assign({ color: c }, o || {}))); }
  const geo = new THREE.BoxGeometry(1, 1, 1);
  function cube(liste, parent, w, h, d, c, x, y, z, o) { const m = new THREE.Mesh(geo, mat(c, o)); m.scale.set(w, h, d); m.position.set(x, y, z); m.castShadow = true; parent.add(m); liste.push(m); return m; }
  function forme(liste, parent, g, c, x, y, z, o) { const m = new THREE.Mesh(g, mat(c, o)); m.position.set(x, y, z); m.castShadow = true; parent.add(m); liste.push(m); return m; }

  function construirePerso(d, L) {
    const C = P.corps, c = (p, w, h, dd, col, x, y, z, o) => cube(L, p, w, h, dd, col, x, y, z, o);
    const peau = d.peau || PEAU;
    /* legs and shoes */
    for (const jb of [P.jambeG, P.jambeD]) { c(jb, .3, .58, .3, d.pantalon, 0, -.29, 0); c(jb, .32, .18, .38, d.chaussures, 0, -.66, .03); }
    /* arms: sleeve + hand (or glove) */
    for (const br of [P.brasG, P.brasD]) { c(br, .26, .5, .26, d.manches, 0, -.25, 0); c(br, .24, .2, .24, d.gants || peau, 0, -.6, 0); }
    /* torso */
    c(C, .65, .75, .38, d.chandail, 0, 1.12, 0);
    if (d.gilet) { c(C, .2, .74, .4, d.gilet, -.22, 1.12, 0); c(C, .2, .74, .4, d.gilet, .22, 1.12, 0); }
    if (d.ceinture) c(C, .67, .1, .4, d.ceinture, 0, .8, 0);
    if (d.etoile) { c(C, .2, .2, .02, 0xf4c542, 0, 1.2, .2); c(C, .08, .28, .02, 0xf4c542, 0, 1.2, .2); c(C, .28, .08, .02, 0xf4c542, 0, 1.22, .2); }
    if (d.foulard) c(C, .56, .12, .44, d.foulard, 0, 1.5, 0);
    if (d.cape) c(C, .62, 1.15, .05, d.cape, 0, 1.0, -.23, d.capeVerre ? { transparent: true, opacity: .6 } : null);
    if (d.sac) { c(C, .5, .55, .22, d.sac, 0, 1.15, -.3); c(C, .52, .14, .14, 0x7a8a5a, 0, 1.5, -.36); }
    if (d.katana) { const k = c(C, .06, 1.1, .06, 0x9aa5b1, .15, 1.2, -.25); k.rotation.z = .6; const h = c(C, .08, .3, .08, 0x22252b, .38, 1.55, -.25); h.rotation.z = .6; }
    if (d.queue) { const q = c(C, .22, .22, .6, 0xe8742a, 0, .8, -.45); q.rotation.x = -.5; c(C, .2, .2, .2, 0xffffff, 0, .65, -.72); }
    /* head */
    if (d.tete === "renard") {
      c(C, .52, .5, .5, 0xe8742a, 0, 1.78, 0); c(C, .3, .18, .14, 0xffffff, 0, 1.66, .3); c(C, .08, .07, .04, 0x22252b, 0, 1.7, .38);
      c(C, .08, .08, .02, 0x16324f, -.12, 1.84, .26); c(C, .08, .08, .02, 0x16324f, .12, 1.84, .26);
      for (const s of [-1, 1]) { const o = c(C, .16, .22, .1, 0xe8742a, s * .16, 2.12, 0); o.rotation.z = -s * .25; c(C, .08, .12, .11, 0xffffff, s * .16, 2.1, .01); }
    } else if (d.tete === "robot") {
      c(C, .58, .52, .54, 0xeef3fa, 0, 1.8, 0); c(C, .46, .3, .02, 0x14202e, 0, 1.79, .28);
      c(C, .1, .1, .02, 0x5ff0ff, -.1, 1.82, .29, { emissive: 0x2fa0b0 }); c(C, .1, .1, .02, 0x5ff0ff, .1, 1.82, .29, { emissive: 0x2fa0b0 });
      c(C, .08, .08, .3, 0x2f7fe0, -.32, 1.8, 0); c(C, .08, .08, .3, 0x2f7fe0, .32, 1.8, 0);
      c(C, .04, .2, .04, 0x9aa5b1, -.18, 2.15, 0); c(C, .04, .2, .04, 0x9aa5b1, .18, 2.15, 0);
      c(C, .08, .08, .08, 0x5ff0ff, -.18, 2.27, 0, { emissive: 0x2fa0b0 }); c(C, .08, .08, .08, 0x5ff0ff, .18, 2.27, 0, { emissive: 0x2fa0b0 });
      if (d.crete) { c(C, .3, .14, .4, d.crete, 0, 2.12, -.02); const p = c(C, .14, .2, .14, d.crete, 0, 2.24, -.1); p.rotation.x = -.4; }
    } else {
      c(C, .5, .5, .5, peau, 0, 1.78, 0);
      c(C, .08, .08, .02, 0x16324f, -.11, 1.82, .26); c(C, .08, .08, .02, 0x16324f, .11, 1.82, .26); c(C, .18, .04, .02, 0x8a3a2f, 0, 1.68, .26);
      if (d.cheveux) {
        c(C, .54, .14, .54, d.cheveux, 0, 2.06, 0); c(C, .54, .36, .1, d.cheveux, 0, 1.9, -.24);
        if (d.longs) { c(C, .58, .7, .14, d.cheveux, 0, 1.62, -.26); c(C, .1, .5, .3, d.cheveux, -.27, 1.75, -.05); c(C, .1, .5, .3, d.cheveux, .27, 1.75, -.05); }
        if (d.pointes) for (const [x, z, a] of [[-.15, .1, .4], [.12, .12, -.4], [0, -.1, .1], [-.18, -.18, .5], [.18, -.15, -.5]]) { const p = c(C, .16, .26, .16, d.cheveux, x, 2.2, z); p.rotation.z = a; p.rotation.x = -.3; }
      }
      if (d.bandeau) { c(C, .55, .1, .55, d.bandeau, 0, 1.98, 0); c(C, .08, .3, .06, d.bandeau, .1, 1.85, -.3); }
    }
    if (d.chapeau) { c(C, .9, .06, .9, d.chapeau, 0, 2.08, 0); c(C, .5, .26, .5, d.chapeau, 0, 2.22, 0); c(C, .52, .06, .52, 0x7a4a2a, 0, 2.13, 0); }
    if (d.casquette) { c(C, .56, .16, .56, d.casquette, 0, 2.12, 0); c(C, .5, .05, .28, d.casquette, 0, 2.06, .38); }
    if (d.lunettes) { c(C, .56, .06, .56, 0x6b4426, 0, 2.0, 0); c(C, .16, .13, .06, d.lunettes, -.11, 2.02, .27, { emissive: 0x1a3a50 }); c(C, .16, .13, .06, d.lunettes, .11, 2.02, .27, { emissive: 0x1a3a50 }); }
    if (d.casque) { c(C, .62, .08, .14, 0xf4f4f4, 0, 2.12, 0); c(C, .1, .24, .24, 0xf4f4f4, -.3, 1.82, 0); c(C, .1, .24, .24, 0xf4f4f4, .3, 1.82, 0); }
  }

  /* Accessories (built on the head height of the character) */
  function construireAcc(id, L) {
    const C = P.corps, c = (p, w, h, d, col, x, y, z, o) => cube(L, p, w, h, d, col, x, y, z, o), haut = 2.1, OR = 0xf4c542;
    switch (id) {
      case "a01": for (const [w, d, x, z] of [[.6, .06, 0, .28], [.6, .06, 0, -.28], [.06, .6, .28, 0], [.06, .6, -.28, 0]]) c(C, w, .16, d, OR, x, haut + .1, z);
        for (const [x, z] of [[-.26, .26], [.26, .26], [-.26, -.26], [.26, -.26], [0, .28]]) c(C, .1, .16, .1, OR, x, haut + .26, z); c(C, .1, .1, .04, 0xd63a2f, 0, haut + .1, .31); break;
      case "a02": c(C, .5, .14, .04, 0x14202e, 0, 1.83, .28); c(C, .08, .08, .02, 0x5ff0ff, 0, 1.84, .31, { emissive: 0x2fa0b0 }); break;
      case "a03": c(C, .64, .08, .14, 0x6a3fd0, 0, haut + .12, 0); c(C, .12, .28, .28, 0x2f3a8f, -.31, 1.82, 0); c(C, .12, .28, .28, 0x2f3a8f, .31, 1.82, 0); c(C, .04, .12, .12, OR, .38, 1.82, 0); break;
      case "a04": c(C, .62, .07, .12, 0x22252b, 0, haut + .1, 0); for (const s of [-1, 1]) { const o = c(C, .18, .22, .08, 0x22252b, s * .18, haut + .26, 0); o.rotation.z = -s * .3; c(C, .1, .12, .09, 0xff6ec7, s * .18, haut + .25, .01); } break;
      case "a05": c(C, .56, .06, .56, 0x6b4426, 0, 2.0, 0); for (const s of [-1, 1]) { c(C, .2, .17, .08, 0xb08a3a, s * .12, 2.02, .27); c(C, .14, .12, .02, 0x5fd0ff, s * .12, 2.02, .32, { emissive: 0x1a5070 }); } break;
      case "a06": c(C, .86, .08, .62, 0x22252b, 0, haut + .02, 0); c(C, .56, .3, .5, 0x22252b, 0, haut + .2, 0); c(C, .58, .07, .52, 0xc0392b, 0, haut + .08, 0); c(C, .14, .14, .02, 0xf4f1e8, 0, haut + .22, .26); break;
      case "a07": { c(C, .8, .06, .8, 0x2f3f9f, 0, haut + .02, 0); const k = forme(L, C, new THREE.ConeGeometry(.3, .75, 8), 0x2f3f9f, 0, haut + .4, 0); k.rotation.z = .12; c(C, .08, .08, .02, OR, .05, haut + .35, .22); c(C, .06, .06, .02, OR, -.1, haut + .2, .3); break; }
      case "a08": { forme(L, C, new THREE.SphereGeometry(.32, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0x4a5260, 0, haut - .05, 0); c(C, .66, .08, .66, OR, 0, haut, 0);
        for (const s of [-1, 1]) { const h = forme(L, C, new THREE.ConeGeometry(.08, .4, 8), 0xf0e4c4, s * .38, haut + .2, 0); h.rotation.z = -s * .7; } break; }
      case "a09": c(C, .7, .66, .66, 0xf4f6fa, 0, 1.82, 0, { transparent: true, opacity: .55 }); c(C, .5, .34, .04, 0x14202e, 0, 1.82, .34, { transparent: true, opacity: .7 }); c(C, .72, .12, .68, 0xf4f6fa, 0, 1.5, 0); break;
      case "a10": { const t = forme(L, C, new THREE.TorusGeometry(.26, .04, 8, 24), OR, 0, haut + .3, 0, { emissive: 0x8a6a00 }); t.rotation.x = Math.PI / 2; break; }
      case "a11": { const k = forme(L, C, new THREE.ConeGeometry(.08, .4, 8), OR, 0, haut + .18, .14); k.rotation.x = .3;
        for (const s of [-1, 1]) c(C, .12, .14, .06, 0xffb3d9, s * .2, haut + .08, 0); for (const [x, col] of [[-.18, 0xb07ce8], [0, 0xff8fb1], [.18, 0x8fc8ff]]) c(C, .1, .1, .1, col, x, haut, .24); break; }
      case "a12": c(C, .64, .64, .62, 0xd63a2f, 0, 1.86, -.02); c(C, .44, .08, .04, 0xffffff, 0, 2.05, .3); c(C, .48, .44, .02, 0x22252b, 0, 1.8, .3, { transparent: true, opacity: .01 });
        for (const s of [-1, 1]) { const h = forme(L, C, new THREE.ConeGeometry(.07, .26, 8), OR, s * .2, haut + .24, 0); h.rotation.z = -s * .4; } break;
      case "a13": for (const s of [-1, 1]) { const a = c(C, .7, .5, .05, 0xffffff, s * .42, 1.4, -.3); a.rotation.y = s * .45; const b = c(C, .5, .35, .06, 0xeef0ff, s * .55, 1.12, -.36); b.rotation.y = s * .45; } break;
      case "a14": for (const s of [-1, 1]) { const a = c(C, .75, .55, .04, 0xc0392b, s * .45, 1.4, -.3); a.rotation.y = s * .4; a.rotation.z = -s * .2; c(C, .08, .6, .06, 0x22252b, s * .2, 1.45, -.28); } break;
      case "a15": for (const s of [-1, 1]) { const a = c(C, .5, .45, .04, 0x8e5bd6, s * .34, 1.45, -.28); a.rotation.y = s * .4; const b = c(C, .36, .3, .05, 0x5fa8ff, s * .32, 1.05, -.29); b.rotation.y = s * .4; } break;
      case "a16": { c(C, .5, .3, .12, 0x9aa5b1, 0, 1.25, -.26); for (const s of [-1, 1]) { forme(L, C, new THREE.CylinderGeometry(.11, .11, .55, 10), 0xd63a2f, s * .17, 1.2, -.36); forme(L, C, new THREE.ConeGeometry(.11, .16, 10), 0xd63a2f, s * .17, 1.55, -.36);
        const f = forme(L, C, new THREE.ConeGeometry(.08, .28, 8), 0xffa22e, s * .17, .78, -.36, { emissive: 0xa04a00 }); f.rotation.x = Math.PI; } c(C, .12, .12, .02, OR, 0, 1.26, -.19); break; }
      case "a17": c(C, .64, 1.15, .05, 0xd63a2f, 0, 1.0, -.24); c(C, .2, .2, .02, OR, 0, 1.2, -.27); break;
      case "a18": [0xff5a5a, 0xffa53a, 0xffe14a, 0x5ccf6a, 0x4fa8ff, 0x9a6ae0].forEach((col, i) => c(C, .11, 1.15, .05, col, -.275 + i * .11, 1.0, -.24)); break;
      case "a19": c(C, .5, .56, .24, 0x2f4fb8, 0, 1.15, -.31); c(C, .22, .22, .02, OR, 0, 1.18, -.44); break;
      case "a20": c(C, .5, .54, .24, 0xe8742a, 0, 1.15, -.31); c(C, .3, .14, .02, 0xffffff, 0, 1.08, -.44); c(C, .06, .06, .02, 0x22252b, 0, 1.13, -.45);
        for (const s of [-1, 1]) { c(C, .12, .14, .08, 0xe8742a, s * .16, 1.48, -.31); c(C, .06, .06, .02, 0x22252b, s * .1, 1.22, -.44); } break;
      case "a21": c(P.brasG, .08, .5, .42, 0x2f4fb8, -.16, -.45, .05); c(P.brasG, .06, .54, .46, OR, -.14, -.45, .05); c(P.brasG, .04, .16, .16, OR, -.21, -.43, .05); break;
      case "a22": c(P.brasD, .07, .07, 1, 0x7fe9ff, 0, -.68, .62, { emissive: 0x2a8fb0 }); c(P.brasD, .3, .07, .1, OR, 0, -.68, .1); c(P.brasD, .07, .07, .2, 0x2f3a8f, 0, -.68, -.02); break;
      case "a23": c(P.brasD, .06, .06, .8, 0xc254d8, 0, -.68, .4); c(P.brasD, .18, .18, .06, 0xff8fd0, 0, -.68, .84, { emissive: 0x8a2a70 }); c(P.brasD, .08, .08, .08, OR, 0, -.68, .76); break;
      case "a24": c(P.brasD, .07, .07, .85, 0x8a5a35, 0, -.68, .42); { const t = c(P.brasD, .06, .1, .55, 0x3fa0e0, 0, -.58, .82); t.rotation.x = Math.PI / 2; } break;
    }
  }

  /* Tools on the avatar; "anim" keeps the parts that move during the game */
  let anim = {};
  function pivot(parent, x, y, z) { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; }
  function construireOutil(id, L) {
    const C = P.corps, c = (p, w, h, d, col, x, y, z, o) => cube(L, p, w, h, d, col, x, y, z, o), OR = 0xf4c542;
    anim = {};
    switch (id) {
      case "o01": { const t = forme(L, C, new THREE.CylinderGeometry(.26, .26, .08, 16), OR, 0, 1.2, -.3); t.rotation.x = Math.PI / 2;
        forme(L, C, new THREE.CylinderGeometry(.18, .18, .09, 16), 0x2a2f5a, 0, 1.2, -.31).rotation.x = Math.PI / 2; break; }
      case "o02": case "o05": case "o10": {
        const cols = id === "o02" ? [0xb07a45, 0x9a6638, 0xb07a45] : id === "o05" ? [0xaee6ff, 0xd8f4ff, 0xaee6ff] : [0xff5a5a, 0xffe14a, 0x4fa8ff];
        cols.forEach((col, i) => c(C, .6, .12, .14, col, 0, 1.0 + i * .14, -.28, id === "o05" ? { transparent: true, opacity: .8 } : null));
        c(C, .08, .5, .16, 0x7a4a2a, -.2, 1.15, -.27); c(C, .08, .5, .16, 0x7a4a2a, .2, 1.15, -.27); break; }
      case "o03": { const g = pivot(C, 0, 1.48, -.22); L.push(g); c(g, .66, 1.1, .05, 0xd63a2f, 0, -.55, 0); c(g, .24, .24, .02, OR, 0, -.4, -.03); c(g, .7, .08, .08, OR, 0, 0, .02); anim.cape = g; break; }
      case "o04": anim.planche = true; c(C, .62, .08, 1.2, 0x22252b, 0, -.03, 0); c(C, .64, .03, 1.1, 0x4fd8ff, 0, -.06, 0, { emissive: 0x2a8fb0 }); c(C, .2, .02, .2, OR, 0, .015, .38);
        for (const z of [-.42, .42]) c(C, .2, .04, .12, 0xb46aff, 0, -.08, z, { emissive: 0x6a2aa0 }); break;
      case "o06": { c(C, .4, .3, .12, 0x9aa5b1, 0, 1.25, -.25); const fl = [];
        for (const s of [-1, 1]) { forme(L, C, new THREE.CylinderGeometry(.11, .11, .55, 10), 0x8a94a8, s * .17, 1.2, -.36); forme(L, C, new THREE.ConeGeometry(.11, .16, 10), 0xc0392b, s * .17, 1.55, -.36);
          const f = forme(L, C, new THREE.ConeGeometry(.09, .4, 8), s < 0 ? 0xffa22e : 0x5fd0ff, s * .17, .72, -.36, { emissive: s < 0 ? 0xa04a00 : 0x1a6a90 }); f.rotation.x = Math.PI; f.visible = false; fl.push(f); }
        anim.flammes = fl; break; }
      case "o07": { c(C, .46, .5, .2, 0xd63a2f, 0, 1.15, -.3); c(C, .2, .2, .02, OR, 0, 1.2, -.41);
        const v = pivot(C, 0, 3.0, 0); L.push(v);
        for (let k = 0; k < 8; k++) { const m = new THREE.Mesh(new THREE.SphereGeometry(.95, 16, 6, k * Math.PI / 4, Math.PI / 4, 0, Math.PI / 2.2), mat(k % 2 ? 0xffffff : 0xd63a2f, { side: THREE.DoubleSide })); v.add(m); L.push(m); }
        for (const [x, z] of [[-.6, .6], [.6, .6], [-.6, -.6], [.6, -.6]]) { const fil = c(v, .02, 1.3, .02, 0x555555, x * .55, -.45, z * .55); fil.rotation.z = -x * .5; fil.rotation.x = z * .5; }
        v.visible = false; anim.voile = v; break; }
      case "o08": { const ailes = [];
        for (const s of [-1, 1]) { const g = pivot(C, s * .12, 1.4, -.25); L.push(g);
          c(g, .7, .5, .05, 0xffffff, s * .38, .05, 0, { emissive: 0x3a4a80 }); c(g, .5, .35, .06, 0xcfe4ff, s * .48, -.3, 0, { emissive: 0x3a5ab0 }); c(g, .3, .25, .07, 0xb46aff, s * .25, .3, 0, { emissive: 0x6a2aa0 });
          g.userData.s = s; ailes.push(g); }
        anim.ailes = ailes; break; }
      case "o09": { const plie = pivot(C, 0, 1.2, -.3); L.push(plie); c(plie, .12, .9, .12, 0xd63a2f, -.08, 0, 0); c(plie, .12, .9, .12, OR, .08, 0, 0);
        const d = pivot(C, 0, 2.75, 0); L.push(d);
        for (const s of [-1, 1]) { const a = c(d, 1.4, .04, .9, s < 0 ? 0xd63a2f : OR, s * .65, 0, -.1); a.rotation.y = -s * .5; }
        c(d, .05, .05, 1.4, 0x22252b, 0, -.03, -.1); for (const s of [-1, 1]) { const b = c(d, .04, 1.1, .04, 0x22252b, s * .3, -.55, .2); b.rotation.z = s * .35; }
        c(d, .7, .05, .05, 0x22252b, 0, -1.05, .2); d.visible = false; anim.delta = d; anim.deltaPlie = plie; break; }
      case "o11": { c(C, .46, .1, .46, OR, 0, 1.2, -.3); c(C, .34, .02, .34, 0x2f4fb8, 0, 1.2, -.3).rotation.x = 0;
        const r = forme(L, C, new THREE.TorusGeometry(.5, .03, 8, 32), 0x7fe9ff, 0, .05, 0, { emissive: 0x2a8fb0, transparent: true, opacity: .7 }); r.rotation.x = Math.PI / 2; anim.anneau = r; break; }
      case "o12": { const a = pivot(C, 0, .95, 0); L.push(a);
        c(a, .78, .42, 1.5, 0xf4f4f4, 0, 0, .1); c(a, .8, .1, 1.52, 0xd63a2f, 0, .12, .1); c(a, 2.6, .08, .55, 0xd63a2f, 0, -.05, .1); c(a, .9, .06, .3, 0xd63a2f, 0, .1, -.6); c(a, .06, .4, .3, 0xd63a2f, 0, .3, -.6);
        for (const s of [-1, 1]) c(a, .2, .02, .2, OR, s * .9, .0, .1); c(a, .3, .3, .1, 0xd63a2f, 0, 0, .9);
        const h = pivot(a, 0, 0, .97); L.push(h); c(h, .08, .8, .03, 0x5a3a20, 0, 0, 0); c(h, .8, .08, .03, 0x5a3a20, 0, 0, 0); anim.helice = h; break; }
    }
  }

  /* ---------- Tool effects: called by the game on every frame, right after gravity ---------- */
  let horlogeO = 0, solY = null, hist = [], prevVy = 0, recharge = 0, pont = null, ephemeres = [], scene = null;
  function outilActif() { return OUTILS.find(o => o.id === etat.outil && etat.outils.includes(o.id)) || null; }
  const effetsActifs = () => !!P && !SANS_EFFET.includes(P.jeu);
  function ephemere(obj, duree) { scene.add(obj); ephemeres.push({ obj, t: duree, d: duree }); }
  function creerPont(def, j) {
    const sp = Math.hypot(j.vx, j.vz), dir = sp > .5 ? Math.atan2(j.vx, j.vz) : (j.angle || 0), g = new THREE.Group();
    const n = Math.round(def.long / .5), arc = [0xff5a5a, 0xffa53a, 0xffe14a, 0x5ccf6a, 0x4fa8ff, 0x9a6ae0];
    for (let k = 0; k < n; k++) {
      const col = def.arc ? arc[k % arc.length] : def.couleur, m = new THREE.Mesh(geo, mat(col, def.verre ? { transparent: true, opacity: .75, emissive: 0x204a60 } : def.arc ? { emissive: 0x333333 } : null));
      m.scale.set(1.6, .2, .46); m.position.set(0, -.1, -1 + k * .5 + .25); g.add(m);
    }
    if (!def.arc) for (const s of [-1, 1]) { const r = new THREE.Mesh(geo, mat(def.verre ? 0xd8f4ff : 0x7a4a2a, def.verre ? { transparent: true, opacity: .8 } : null)); r.scale.set(.08, .08, def.long); r.position.set(s * .78, .45, -1 + def.long / 2); g.add(r);
      for (let k = 0; k <= def.long; k += 2.5) { const p = new THREE.Mesh(geo, r.material); p.scale.set(.1, .55, .1); p.position.set(s * .78, .17, -1 + Math.min(k, def.long - .05)); g.add(p); } }
    g.position.set(j.x, solY, j.z); g.rotation.y = dir; scene.add(g);
    pont = { g, x: j.x, z: j.z, y: solY, dir, long: def.long, t: def.duree, d: def.duree };
    j.y = solY; j.vy = 0;
  }
  function surPont(j) {
    const dx = j.x - pont.x, dz = j.z - pont.z, le = dx * Math.sin(pont.dir) + dz * Math.cos(pont.dir), co = dx * Math.cos(pont.dir) - dz * Math.sin(pont.dir);
    return le > -1.3 && le < pont.long - .7 && Math.abs(co) < 1.05;
  }
  function physique(j, dt) {
    if (!P) return;
    horlogeO += dt;
    const o = outilActif(), eff = o && effetsActifs(), auSol = !!j.sol;
    if (auSol) { solY = j.y; hist.push([horlogeO, j.x, j.y, j.z]); while (hist.length > 1 && hist[1][0] < horlogeO - .5) hist.shift(); }
    recharge = Math.max(0, recharge - dt);
    /* higher jump (only a normal jump: never a trampoline) */
    if (eff && o.saut && j.vy > 6 && j.vy < 12 && prevVy < 3) {
      j.vy *= o.saut;
      if (o.id === "o01") { const t = new THREE.Group(); const d = new THREE.Mesh(new THREE.CylinderGeometry(.55, .55, .12, 20), mat(0xf4c542)); t.add(d);
        const m = new THREE.Mesh(new THREE.CylinderGeometry(.4, .4, .13, 20), mat(0x2a2f5a)); t.add(m); t.position.set(j.x, (solY === null ? j.y : solY) + .06, j.z); ephemere(t, .6); }
    }
    /* bridge under the feet */
    if (pont) {
      pont.t -= dt;
      if (pont.t < 1) pont.g.visible = Math.floor(pont.t * 8) % 2 === 0;
      if (pont.t <= 0) { scene.remove(pont.g); pont = null; recharge = 2; }
      else if (eff && surPont(j) && j.y <= pont.y + .03 && j.vy <= 0) { j.y = pont.y; j.vy = 0; j.coyote = .14; solY = pont.y; }
    }
    /* help after a fall */
    if (eff && !auSol && !pont && j.vy < 0 && solY !== null && recharge <= 0) {
      if (o.pont && j.y < solY - .8 && j.y > solY - 4) creerPont(o.pont, j);
      else if (o.tele && j.y < solY - 2.5 && hist.length) {
        const h = hist[0]; j.x = h[1]; j.y = h[2] + .02; j.z = h[3]; j.vx = j.vy = j.vz = 0; recharge = 3;
        const r = new THREE.Mesh(new THREE.TorusGeometry(.7, .06, 8, 32), mat(0x7fe9ff, { emissive: 0x2a8fb0, transparent: true, opacity: .9 })); r.rotation.x = Math.PI / 2; r.position.set(j.x, j.y + .05, j.z); ephemere(r, .8);
      }
    }
    /* gentle fall, only for the first metres (a fall into the void ends quickly) */
    if (eff && o.chute && !auSol && !pont && j.vy < -o.chute && (solY === null || j.y > solY - 6)) j.vy = -o.chute;
    prevVy = j.vy;
    /* animations of the tool */
    const enAir = !auSol && !(pont && surPont(j) && Math.abs(j.y - pont.y) < .05);
    if (anim.flammes) for (const f of anim.flammes) { f.visible = enAir && j.vy > .5; f.scale.y = .8 + Math.random() * .5; }
    if (anim.voile) anim.voile.visible = enAir && j.vy < -1;
    if (anim.delta) { anim.delta.visible = enAir && j.vy < -.5; anim.deltaPlie.visible = !anim.delta.visible; }
    if (anim.cape) anim.cape.rotation.x = enAir ? -.6 - Math.sin(horlogeO * 14) * .1 : -.12 - Math.abs(Math.sin(horlogeO * 3)) * .08;
    if (anim.ailes) for (const g of anim.ailes) g.rotation.y = g.userData.s * (.5 + Math.sin(horlogeO * (enAir ? 14 : 3)) * (enAir ? .5 : .12));
    if (anim.helice) anim.helice.rotation.z += dt * (Math.hypot(j.vx, j.vz) > .3 ? 30 : 6);
    /* the hoverboard floats a little above the ground so it can be seen */
    P.corps.position.y = anim.planche ? .26 + Math.sin(horlogeO * 3) * .04 : 0;
    if (anim.anneau) anim.anneau.material.opacity = .4 + Math.sin(horlogeO * 5) * .3;
    for (let k = ephemeres.length - 1; k >= 0; k--) { const e = ephemeres[k]; e.t -= dt; e.obj.scale.setScalar(.6 + .4 * e.t / e.d); if (e.t <= 0) { scene.remove(e.obj); ephemeres.splice(k, 1); } }
  }

  /* ---------- Start of a game: the camera turns around the character to show it from the front ---------- */
  let intro = null;
  const DUREE_INTRO = 2.8, v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), qTmp = new THREE.Quaternion(), visee = new THREE.PerspectiveCamera(); /* a camera: lookAt turns its -z axis to the target */
  function lancerIntro() { if (P && !etat.calme) intro = { debut: performance.now(), sauve: null }; }
  function brancherIntro() {
    scene.onBeforeRender = (r, sc, cam) => {
      if (!intro || !cam.isPerspectiveCamera) return;
      const e = (performance.now() - intro.debut) / 1000;
      if (e > DUREE_INTRO) { intro = null; return; }
      P.corps.getWorldPosition(v1);
      P.corps.getWorldQuaternion(qTmp); v2.set(0, 0, 1).applyQuaternion(qTmp); v2.y = 0;
      if (v2.lengthSq() < 1e-4) v2.set(0, 0, 1); v2.normalize();
      const k0 = Math.min(1, e / (DUREE_INTRO - .6)), k = k0 * k0 * (3 - 2 * k0), a = Math.PI * k;
      const dx = v2.x * Math.cos(a) - v2.z * Math.sin(a), dz = v2.x * Math.sin(a) + v2.z * Math.cos(a), dist = 4.6 + 1.2 * k;
      visee.position.set(v1.x + dx * dist, v1.y + 1.5 + .9 * k, v1.z + dz * dist);
      visee.lookAt(v1.x, v1.y + .8, v1.z);   /* the character stays above the message box */
      intro.sauve = { p: cam.position.clone(), q: cam.quaternion.clone() };
      const w = Math.max(0, (e - (DUREE_INTRO - .6)) / .6);   /* hand the camera back to the game smoothly */
      cam.position.copy(visee.position).lerp(intro.sauve.p, w);
      cam.quaternion.copy(visee.quaternion).slerp(intro.sauve.q, w);
      cam.updateMatrixWorld();
    };
    scene.onAfterRender = (r, sc, cam) => {
      if (intro && intro.sauve) { cam.position.copy(intro.sauve.p); cam.quaternion.copy(intro.sauve.q); cam.updateMatrixWorld(); intro.sauve = null; }
    };
    const acc = document.getElementById("accueil");
    if (acc && window.MutationObserver) {
      let avant = acc.hidden;
      new MutationObserver(() => { if (acc.hidden && !avant) lancerIntro(); avant = acc.hidden; }).observe(acc, { attributes: true, attributeFilter: ["hidden"] });
    }
  }

  /* ---------- Apply the choice to the avatar of the game ---------- */
  let defaut = [], persoMeshes = [], accMeshes = [], outilMeshes = [];
  const liste = () => ORDRE_ACC.map(id => ({ id, nom: ACC[id].nom, place: ACC[id].place, prix: ACC[id].prix }));
  /* Accessories are now shared by all the games: merge what was bought game by game before */
  if (!etat.accs) {
    etat.accs = { achetes: [], portes: [] };
    for (const k in etat.acc) for (const id of etat.acc[k].achetes || []) if (!etat.accs.achetes.includes(id)) etat.accs.achetes.push(id);
  }
  function accJeu() { return etat.accs; }
  function appliquer() {
    if (!P) return;
    for (const m of persoMeshes.concat(accMeshes, outilMeshes)) m.parent && m.parent.remove(m);
    persoMeshes = []; accMeshes = []; outilMeshes = []; anim = {};
    const perso = PERSOS.find(p => p.id === etat.choisi && etat.persos.includes(p.id));
    for (const m of defaut) m.visible = !perso;
    if (perso) construirePerso(perso.d, persoMeshes);
    for (const id of accJeu().portes) if (ACC[id]) construireAcc(id, accMeshes);
    const o = outilActif(); if (o) construireOutil(o.id, outilMeshes);
    if (!anim.planche) P.corps.position.y = 0;
  }

  /* ---------- Soundtracks: 15 loops, one chosen per game ---------- */
  const MUSIQUES = [
    { id: "n12", nom: "Sauts au soleil" }, { id: "n11", nom: "Course dans la prairie" }, { id: "n10", nom: "Encore un saut" },
    { id: "n13", nom: "Course parfaite" }, { id: "n09", nom: "Le réveil des merveilles" }, { id: "n05", nom: "Obby course arcade" },
    { id: "n08", nom: "Course de nuit" }, { id: "n07", nom: "Défi des champions" }, { id: "n06", nom: "Défi des aventuriers" },
    { id: "n01", nom: "Aventure préhistorique" }, { id: "n04", nom: "Safari des dinosaures" }, { id: "n02", nom: "Exploration magique" },
    { id: "n03", nom: "Le jardin des cristaux" }
  ];
  /* music of the menus (main menu, shops and start screen of the game) */
  const MUSIQUE_MENU = "n12";
  const MUSIQUE_DU_JEU = { ile: "n11", tempete: "n07", village: "n03", ville: "n08", "ile-maths": "n09", splash: "n10", desert: "n04", obby: "n05", pirates: "n06", mer: "n13" };
  const CLE_SON = "ile-aux-calculs-musique";
  const musiqueOn = () => lire(CLE_SON, true) !== false;
  /* a choice made with an older list of tracks falls back to the track of the game */
  const pisteChoisie = () => { const c = etat.musique && etat.musique[P.jeu]; return c === "aucune" || MUSIQUES.some(m => m.id === c) ? c : MUSIQUE_DU_JEU[P.jeu] || "n12"; };
  const son = { debloque: false, piste: null, source: null, ecoute: null, finVue: false };
  /* Two <audio> players (they also work when the site is opened from a folder):
     one for the looping music, one for short extracts and the victory tune */
  const lecteurs = { boucle: new Audio(), extrait: new Audio() };
  lecteurs.boucle.loop = true; lecteurs.boucle.preload = "auto"; lecteurs.extrait.preload = "auto";
  const VOLUME = .6;
  /* The browser lets sound start only after a click or a key */
  function audio() { son.debloque = true; return true; }
  function fondu(a, cible, ms, fin) {
    clearInterval(a._fondu); const depart = a.volume, t0 = performance.now();
    a._fondu = setInterval(() => { const k = Math.min(1, (performance.now() - t0) / ms); try { a.volume = depart + (cible - depart) * k; } catch (e) {} if (k >= 1) { clearInterval(a._fondu); fin && fin(); } }, 30);
  }
  function demarrer(id, boucle, duree) {
    const a = boucle ? lecteurs.boucle : lecteurs.extrait, lecture = { a, arrete: false };
    if (a._lecture) a._lecture.arrete = true;
    a._lecture = lecture; clearInterval(a._fondu);
    a.src = BASE + "musiques/" + id + ".mp3"; a.currentTime = 0; try { a.volume = 0; } catch (e) {}
    const pr = a.play();
    const echec = () => { lecture.arrete = true; lecture.echec = true; if (boucle && son.source === lecture) { son.piste = null; son.source = null; } };
    if (pr && pr.catch) pr.catch(echec);
    fondu(a, VOLUME, 600);
    a.onended = () => { lecture.arrete = true; };
    if (duree) setTimeout(() => arreterLecture(lecture), duree * 1000);
    return lecture;
  }
  function arreterLecture(l) {
    if (!l || l.arrete) return; l.arrete = true;
    fondu(l.a, 0, 300, () => { if (l.a._lecture === l) l.a.pause(); });
  }
  const cache = id => { const e = document.getElementById(id); return !e || e.hidden; };
  /* The soundtrack plays only while the game itself is on screen */
  function surveillerMusique() {
    if (!P || !son.debloque) return;
    const enJeuVisible = cache("accueil") && cache("pausePanneau") && cache("fin") && !mp && !voile && !document.hidden;
    const enMenu = (!!mp || !!voile || !cache("accueil")) && cache("pausePanneau") && cache("fin") && !document.hidden;
    const ecoute = son.ecoute && !son.ecoute.arrete;
    const voulu = !musiqueOn() ? null
      : enJeuVisible ? (pisteChoisie() !== "aucune" ? pisteChoisie() : null)
      : enMenu && !ecoute ? MUSIQUE_MENU : null;
    if (voulu !== son.piste) { arreterLecture(son.source); son.source = voulu ? demarrer(voulu, true) : null; son.piste = voulu; }
    const finVue = !cache("fin");
    son.finVue = finVue;
  }
  /* Games without a music button get one in their top bar */
  function boutonMusique() {
    if (document.getElementById("btnMusique")) return;
    const aide = document.getElementById("btnAide"); if (!aide) return;
    const b = el("button", "btn", ""); b.type = "button"; b.id = "btnMusiqueBlocs";
    const maj = () => { const on = musiqueOn(); b.textContent = on ? "🎵 Musique" : "🔇 Musique"; b.setAttribute("aria-pressed", String(on)); b.title = on ? "Couper la musique" : "Remettre la musique"; };
    b.onclick = () => { ecrire(CLE_SON, !musiqueOn()); maj(); audio(); surveillerMusique(); const cv = document.querySelector("canvas"); cv && cv.focus && cv.focus(); };
    b.addEventListener("majson", maj); maj(); aide.parentNode.insertBefore(b, aide);
  }

  /* ---------- 3D preview of the avatar (menus) ---------- */
  const apercus = new Set(); let boucleApercu = false;
  function nouvelApercu(hote) {
    const cv = document.createElement("canvas"); cv.className = "pm-apercu-3d"; hote.append(cv);
    let r; try { r = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true }); } catch (e) { cv.remove(); hote.classList.add("pm-sans-3d"); return null; }
    r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    const sc = new THREE.Scene(); sc.add(new THREE.HemisphereLight(0xffffff, 0x8a9ab0, .95)); const sol = new THREE.DirectionalLight(0xffffff, .7); sol.position.set(2, 4, 5); sc.add(sol);
    const cam = new THREE.PerspectiveCamera(32, 1, .1, 50); cam.position.set(0, 1.55, 6.4); cam.lookAt(0, 1.25, 0);
    const a = { hote, cv, r, sc, cam, modele: null, t: Math.random() * 3 };
    apercus.add(a); majApercu(a); lancerBoucle(); return a;
  }
  function majApercu(a) {
    if (a.modele) a.sc.remove(a.modele);
    const m = P.corps.clone(true); m.position.set(0, 0, 0); m.rotation.set(0, 0, 0);
    a.bras = m.children[P.corps.children.indexOf(P.brasD)]; a.modele = m; a.sc.add(m);
  }
  function lancerBoucle() {
    if (boucleApercu) return; boucleApercu = true;
    let avant = performance.now();
    (function tour(t) {
      for (const a of apercus) if (!a.hote.isConnected) { a.r.dispose(); apercus.delete(a); }
      if (!apercus.size) { boucleApercu = false; return; }
      const dt = Math.min(.05, (t - avant) / 1000); avant = t;
      const calme = !!etat.calme;
      for (const a of apercus) {
        const w = a.hote.clientWidth, h = a.hote.clientHeight; if (!w || !h) continue;
        if (a.cv.width !== Math.round(w * a.r.getPixelRatio())) { a.r.setSize(w, h, false); a.cam.aspect = w / h; a.cam.updateProjectionMatrix(); }
        a.t += dt;
        if (!calme) {
          /* hop + spin + wave: the character greets the player */
          const saut = Math.abs(Math.sin(a.t * 3.2));
          a.modele.position.y = saut * .35; a.modele.scale.set(1 + (1 - saut) * .06, 1 - (1 - saut) * .06, 1);
          a.modele.rotation.y = Math.sin(a.t * .7) * .9;
          if (a.bras) a.bras.rotation.set(0, 0, 2.6 + Math.sin(a.t * 9) * .35);
        }
        a.r.render(a.sc, a.cam);
      }
      requestAnimationFrame(tour);
    })(avant);
  }
  const rafraichirApercus = () => { for (const a of apercus) majApercu(a); };

  /* ---------- Shop dialogs ---------- */
  let voile = null, dernierFocus = null, mp = null;
  function etoiles() { return wallet.lire(); }
  function fermer() {
    if (!voile) return; voile.remove(); voile = null; document.removeEventListener("keydown", clavier, true);
    arreterLecture(son.ecoute); son.ecoute = null; majMenuPrincipal(); dernierFocus && dernierFocus.focus();
  }
  function clavier(e) { if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); fermer(); } }
  function el(tag, cls, txt) { const e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; }
  function eclat(cible) {
    /* small burst of stars on a card after a purchase */
    for (let k = 0; k < 10; k++) { const e = el("span", "pm-eclat", k % 2 ? "⭐" : "✨"); e.style.setProperty("--a", (k * 36) + "deg"); cible.append(e); setTimeout(() => e.remove(), 900); }
  }
  const TITRES = { perso: "👤 Choisis ton personnage", acc: "🎒 Les accessoires", outil: "🛠️ Les outils", musique: "🎵 La musique du jeu" };
  function ouvrir(mode) {
    fermer(); dernierFocus = document.activeElement; audio();
    voile = el("div", "pm-voile"); const boite = el("div", "pm-boite pm-" + mode); boite.setAttribute("role", "dialog"); boite.setAttribute("aria-modal", "true");
    const titre = el("h2", "pm-titre", TITRES[mode]); titre.id = "pmTitre"; boite.setAttribute("aria-labelledby", "pmTitre");
    const solde = el("p", "pm-solde"), msg = el("p", "pm-msg"); msg.setAttribute("aria-live", "polite");
    const fermerB = el("button", "pm-fermer", "✕"); fermerB.type = "button"; fermerB.setAttribute("aria-label", "Fermer"); fermerB.onclick = fermer;
    const grille = el("div", "pm-grille");
    const aide = el("p", "pm-aide", mode === "perso" ? "Gagne des étoiles ⭐ en jouant. Les personnages achetés sont à toi dans tous les jeux de blocs."
      : mode === "outil" ? (effetsActifs() ? "Un outil t’aide à bouger. Tu prends un seul outil à la fois. Il est à toi dans tous les jeux de blocs."
        : "Dans ce jeu, il faut réfléchir pour passer : l’outil est seulement pour le style. Il t’aide dans les autres jeux de blocs.")
      : mode === "musique" ? "Clique sur ▶ pour écouter. Choisis la musique de ce jeu. C’est gratuit !"
      : "24 accessoires, à toi dans tous les jeux de blocs. Tu peux en porter plusieurs : un sur la tête, un dans le dos, un dans chaque main…");
    const tete = el("div", "pm-tete"), textes = el("div", "pm-textes"), vue = el("div", "pm-vue");
    textes.append(titre, solde, aide); tete.append(textes);
    if (mode !== "musique") tete.append(vue);
    boite.append(fermerB, tete, grille, msg); voile.append(boite); document.body.append(voile);
    if (mode !== "musique") nouvelApercu(vue);
    voile.addEventListener("click", e => { if (e.target === voile) fermer(); });
    document.addEventListener("keydown", clavier, true);
    let premier = true;
    function rendre(animer) {
      solde.textContent = mode === "musique" ? "" : "Tes étoiles : " + etoiles() + " ⭐"; grille.textContent = "";
      if (mode === "musique") { rendreMusique(); return; }
      const cartes = mode === "perso" ? [{ id: "defaut", nom: "Mon personnage", prix: 0 }].concat(PERSOS) : mode === "outil" ? OUTILS : liste();
      cartes.forEach((it, rang) => {
        const carte = el("div", "pm-carte"), img = el("div", "pm-image");
        if (animer) { carte.classList.add("pm-entree"); carte.style.animationDelay = (rang * 35) + "ms"; }
        if (it.id === "defaut") { img.textContent = "🙂"; img.classList.add("pm-defaut"); }
        else { const i = el("img"); i.src = BASE + ({ perso: "personnages/", outil: "outils/", acc: "accessoires/" })[mode] + it.id + ".jpg"; i.alt = ""; img.append(i); }
        const nom = el("strong", "pm-nom", it.nom), b = el("button", "pm-bouton"); b.type = "button";
        if (mode === "outil") nom.append(el("span", "pm-effet", it.effet));
        const possede = mode === "perso" ? (it.id === "defaut" || etat.persos.includes(it.id)) : mode === "outil" ? etat.outils.includes(it.id) : accJeu().achetes.includes(it.id);
        const actif = mode === "perso" ? etat.choisi === it.id || (it.id === "defaut" && !etat.persos.includes(etat.choisi)) : mode === "outil" ? etat.outil === it.id : accJeu().portes.includes(it.id);
        if (possede) {
          b.textContent = mode === "perso" ? (actif ? "✓ Choisi" : "Choisir") : mode === "outil" ? (actif ? "✓ Pris · Ranger" : "Prendre") : (actif ? "✓ Porté · Enlever" : "Porter");
          b.classList.toggle("pm-actif", actif); b.setAttribute("aria-pressed", String(actif));
          b.onclick = () => {
            if (mode === "perso") etat.choisi = it.id;
            else if (mode === "outil") etat.outil = actif ? null : it.id;
            else { const a = accJeu(); if (a.portes.includes(it.id)) a.portes = a.portes.filter(x => x !== it.id); else { a.portes = a.portes.filter(x => ACC[x].place !== it.place); a.portes.push(it.id); } }
            sauver(); appliquer(); rendre(false); msg.textContent = mode === "perso" ? it.nom + " est ton personnage." : mode === "outil" && !actif ? "Tu as pris : " + it.nom + "." : "";
            const nv = grille.children[rang]; if (nv) { nv.classList.add("pm-hop"); nv.querySelector(".pm-bouton").focus(); }
          };
        } else {
          const manque = it.prix - etoiles();
          b.textContent = "Acheter · " + it.prix + " ⭐";
          if (manque > 0) { b.disabled = true; carte.classList.add("pm-bloque"); b.title = "Il te manque " + manque + " étoile" + (manque > 1 ? "s" : ""); }
          b.onclick = () => {
            if (etoiles() < it.prix) return;
            wallet.depenser(it.prix);
            if (mode === "perso") { etat.persos.push(it.id); etat.choisi = it.id; } else if (mode === "outil") { etat.outils.push(it.id); etat.outil = it.id; } else { const a = accJeu(); a.achetes.push(it.id); a.portes = a.portes.filter(x => ACC[x].place !== it.place); a.portes.push(it.id); }
            sauver(); appliquer(); rendre(false); msg.textContent = "🎉 " + it.nom + " : c'est à toi !";
            const nv = grille.children[rang]; if (nv) { nv.classList.add("pm-gagne"); eclat(nv); nv.querySelector(".pm-bouton").focus(); }
          };
        }
        carte.classList.toggle("pm-carte-active", actif && possede);
        carte.append(img, nom, b);
        if (!possede && it.prix > etoiles()) carte.append(el("small", "pm-manque", "Il te manque " + (it.prix - etoiles()) + " ⭐"));
        grille.append(carte);
      });
      rafraichirApercus();
    }
    function rendreMusique() {
      const choix = [{ id: "aucune", nom: "Pas de musique" }].concat(MUSIQUES);
      choix.forEach((it, rang) => {
        const carte = el("div", "pm-carte pm-carte-son"); if (premier) { carte.classList.add("pm-entree"); carte.style.animationDelay = (rang * 30) + "ms"; }
        const ico = el("div", "pm-image pm-note"); ico.append(el("span", "pm-barres"));
        for (let k = 0; k < 4; k++) ico.firstChild.append(el("i"));
        if (it.id === "aucune") ico.textContent = "🔇";
        const actif = pisteChoisie() === it.id, nom = el("strong", "pm-nom", it.nom);
        if (it.id === MUSIQUE_DU_JEU[P.jeu]) nom.append(el("span", "pm-effet", "La musique de ce jeu"));
        const ligne = el("div", "pm-boutons");
        if (it.id !== "aucune") {
          const ec = el("button", "pm-bouton pm-ecouter", "▶ Écouter"); ec.type = "button"; ec.setAttribute("aria-label", "Écouter " + it.nom);
          ec.onclick = () => { arreterLecture(son.ecoute); for (const c of grille.querySelectorAll(".pm-joue")) c.classList.remove("pm-joue"); son.ecoute = demarrer(it.id, false, 8); carte.classList.add("pm-joue"); setTimeout(() => carte.classList.remove("pm-joue"), 8000); };
          ligne.append(ec);
        }
        const b = el("button", "pm-bouton" + (actif ? " pm-actif" : ""), actif ? "✓ Choisie" : "Choisir"); b.type = "button"; b.setAttribute("aria-pressed", String(actif));
        b.onclick = () => { etat.musique = etat.musique || {}; etat.musique[P.jeu] = it.id; sauver(); rendre(false); msg.textContent = it.id === "aucune" ? "Pas de musique dans ce jeu." : "La musique sera : " + it.nom + "."; const nv = grille.children[rang]; nv && nv.classList.add("pm-hop"); nv && nv.querySelectorAll("button")[nv.querySelectorAll("button").length - 1].focus(); };
        ligne.append(b); carte.classList.toggle("pm-carte-active", actif); carte.append(ico, nom, ligne); grille.append(carte);
      });
      premier = false;
    }
    rendre(true); premier = false; fermerB.focus();
  }

  /* ---------- Main menu: shown before the start screen of the game ---------- */
  function majMenuPrincipal() {
    if (!mp) return;
    mp.querySelector(".mp-nb").textContent = etoiles();
    const perso = PERSOS.find(p => p.id === etat.choisi && etat.persos.includes(p.id));
    mp.querySelector(".mp-nom-perso").textContent = perso ? perso.nom : "Mon personnage";
    const o = outilActif(); mp.querySelector(".mp-outil").textContent = o ? "🛠️ " + o.nom : "";
    const m = MUSIQUES.find(x => x.id === pisteChoisie()); mp.querySelector(".mp-piste").textContent = m ? "🎵 " + m.nom : "🔇 Pas de musique";
    const nbA = accJeu().portes.length; mp.querySelector(".mp-acc").textContent = nbA ? "🎒 " + nbA + " accessoire" + (nbA > 1 ? "s" : "") : "";
    rafraichirApercus();
  }
  function menuPrincipal() {
    if (mp) return;
    const nomJeu = (document.title.split("·")[0] || "").trim();
    mp = el("div", "mp"); mp.setAttribute("role", "dialog"); mp.setAttribute("aria-modal", "true"); mp.setAttribute("aria-labelledby", "mpTitre");
    const deco = el("div", "mp-deco"); deco.setAttribute("aria-hidden", "true");
    for (let k = 0; k < 3; k++) deco.append(el("span", "mp-nuage mp-n" + k, "☁️"));
    for (let k = 0; k < 9; k++) { const e = el("span", "mp-etoile-tombe", k % 3 ? "⭐" : "✨"); e.style.left = (6 + k * 11) + "%"; e.style.animationDelay = (k * .7) + "s"; e.style.animationDuration = (5 + (k % 4)) + "s"; deco.append(e); }
    const bloc = el("span", "mp-bloc"); deco.append(bloc); const balle = el("span", "mp-balle"); deco.append(balle);
    const boite = el("div", "mp-boite");
    const titre = el("h1", "mp-titre"); titre.id = "mpTitre";
    [...nomJeu].forEach((ch, i) => { const s = el("span", ch === " " ? "mp-espace" : "mp-lettre", ch); s.style.animationDelay = (i * .07) + "s"; titre.append(s); });
    const scene3d = el("div", "mp-scene"), vue = el("div", "mp-vue"), socle = el("div", "mp-socle");
    const infos = el("div", "mp-infos");
    infos.innerHTML = '<p class="mp-solde"><span class="mp-etoile">⭐</span> <span class="mp-nb"></span> étoiles</p><p class="mp-nom-perso"></p><p class="mp-badges"><span class="mp-acc"></span> <span class="mp-outil"></span> <span class="mp-piste"></span></p>';
    scene3d.append(vue, socle, infos);
    const tuiles = el("div", "mp-tuiles");
    const T = [
      ["perso", "Personnages", "12 héros", BASE + "personnages/p01.jpg", "mp-rebond"],
      ["acc", "Accessoires", "24 objets", BASE + "accessoires/a01.jpg", "mp-vacille"],
      ["outil", "Outils", "12 outils", BASE + "outils/o06.jpg", "mp-balance"],
      ["musique", "Musique", "13 musiques", null, "mp-pulse"]
    ];
    T.forEach(([mode, nom, sous, img, anim], i) => {
      const b = el("button", "mp-tuile mp-t-" + mode); b.type = "button"; b.style.animationDelay = (.15 + i * .12) + "s";
      const fig = el("span", "mp-fig " + anim);
      if (img) { const im = el("img"); im.src = img; im.alt = ""; fig.append(im); } else { const br = el("span", "pm-barres mp-barres"); for (let k = 0; k < 5; k++) br.append(el("i")); fig.append(br); }
      b.append(fig, el("span", "mp-tuile-nom", nom), el("span", "mp-tuile-sous", sous));
      b.onclick = () => ouvrir(mode); tuiles.append(b);
    });
    const jouer = el("button", "mp-jouer", "▶ C’est parti !"); jouer.type = "button";
    jouer.onclick = fermerMenuPrincipal;
    /* animations on by default; a calm mode for children who need everything still */
    const calmeB = el("button", "mp-calme-bouton"); calmeB.type = "button";
    const majCalme = () => { document.documentElement.classList.toggle("pm-calme", !!etat.calme); calmeB.textContent = etat.calme ? "🌀 Remettre les animations" : "😌 Mode calme : arrêter les animations"; calmeB.setAttribute("aria-pressed", String(!!etat.calme)); };
    calmeB.onclick = () => { etat.calme = !etat.calme; sauver(); majCalme(); };
    majCalme();
    /* music on / off, right in the menu (music starts at the first click: browsers need one) */
    const sonB = el("button", "mp-calme-bouton"); sonB.type = "button";
    const majSon = () => { const on = musiqueOn(); sonB.textContent = on ? "🎵 Musique : oui" : "🔇 Musique : non"; sonB.setAttribute("aria-pressed", String(on)); };
    sonB.onclick = () => { const bj = document.getElementById("btnMusique"); if (bj) bj.click(); else ecrire(CLE_SON, !musiqueOn()); majSon(); sonB.focus(); audio(); surveillerMusique(); const bm = document.getElementById("btnMusiqueBlocs"); bm && bm.dispatchEvent(new Event("majson")); };
    majSon();
    const reglages = el("div", "mp-reglages"); reglages.append(sonB, calmeB);
    boite.append(titre, scene3d, tuiles, jouer, reglages); mp.append(deco, boite); document.body.append(mp);
    mp.addEventListener("keydown", e => { if (e.key === "Escape" && !voile) { e.preventDefault(); fermerMenuPrincipal(); } });
    nouvelApercu(vue); majMenuPrincipal(); jouer.focus();
  }
  function fermerMenuPrincipal() {
    if (!mp) return; const m = mp; mp = null; m.classList.add("mp-sortie"); setTimeout(() => m.remove(), 380);
    const j = document.getElementById("btnJouer"); if (j && j.offsetParent) j.focus();
  }

  /* ---------- Public API ---------- */
  window.Personnages = {
    init(o) {
      P = o; wallet = o.portefeuille || portefeuilleLocal;
      defaut = [];
      for (const g of [o.corps, o.jambeG, o.jambeD, o.brasG, o.brasD]) for (const m of g.children) if (m.isMesh) defaut.push(m);
      scene = o.corps; while (scene.parent) scene = scene.parent;
      appliquer(); brancherIntro();
      /* a button back to the main menu in the start screen of the game */
      const actions = document.querySelector("#accueil .actions");
      if (actions) { const b = el("button", "pm-ouvrir", "🏠 Menu : personnage, accessoires, outils, musique"); b.type = "button"; b.onclick = menuPrincipal; actions.append(b); }
      boutonMusique();
      /* the audio context can only start after a click or a key */
      const reveil = () => { audio(); surveillerMusique(); };
      document.addEventListener("pointerdown", reveil, true); document.addEventListener("keydown", reveil, true);
      setInterval(surveillerMusique, 300);
      document.addEventListener("visibilitychange", surveillerMusique);
      /* after the game script has finished (its star wallet is ready) */
      setTimeout(menuPrincipal, 0);
    },
    /* called by the game every frame, right after gravity */
    physique,
    /* speed multiplier of the current tool */
    vitesse() { const o = outilActif(); return o && o.vitesse && effetsActifs() ? o.vitesse : 1; },
    /* stars won in a game that has no wallet of its own */
    gagner(n) { if (n > 0) (wallet && wallet.gagner ? wallet : portefeuilleLocal).gagner(n); },
    ouvrir, menuPrincipal,
    /* soundtrack playing now (null when silent) */
    pisteEnCours: () => (son.piste && !lecteurs.boucle.paused ? son.piste : null)
  };
})();
