/* Games · ADVANCED level: Robot programmer, Push the crates · expert, Laser beam,
   Number slide, Target line. Loaded before arcade.js, after intermediaire.js. */
window.ArcadeJeux = window.ArcadeJeux || [];
window.ArcadeJeux.push(O => {
'use strict';
const { W, H, hasard, pioche, melange, rond, etoile, texte, visage, DIRS, moins } = O;
const nb = v => String(v).replace('-', moins).replace('.', ',');
const V4 = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // 0 up, 1 right, 2 down, 3 left
const cle = (x, y) => x + ',' + y;
function accessibles(n, murs, sx, sy) {
  const vu = new Set([cle(sx, sy)]), f = [[sx, sy]];
  while (f.length) { const [x, y] = f.shift(); for (const [dx, dy] of V4) { const a = x + dx, b = y + dy, k = cle(a, b); if (a >= 0 && b >= 0 && a < n && b < n && !murs.has(k) && !vu.has(k)) { vu.add(k); f.push([a, b]); } } }
  return vu;
}
function distances(n, murs, sx, sy) {
  const d = new Map([[cle(sx, sy), 0]]), p = new Map([[cle(sx, sy), null]]), f = [[sx, sy]];
  while (f.length) { const [x, y] = f.shift(); for (const [dx, dy] of V4) { const a = x + dx, b = y + dy, k = cle(a, b); if (a >= 0 && b >= 0 && a < n && b < n && !murs.has(k) && !d.has(k)) { d.set(k, d.get(cle(x, y)) + 1); p.set(k, [x, y]); f.push([a, b]); } } }
  return { d, p };
}

/* ================================================================
   1. ROBOT PROGRAMMER
   ================================================================ */
const ROBOT = [
  { titre: 'Premier programme', description: '5 × 5 · 1 cristal', n: 5, murs: 0, cristaux: 1 },
  { titre: 'Tourner', description: '5 × 5 · 2 cristaux', n: 5, murs: 2, cristaux: 2 },
  { titre: 'Des murs', description: '6 × 6 · 2 cristaux', n: 6, murs: 5, cristaux: 2 },
  { titre: 'Trois cristaux', description: '6 × 6 · 3 cristaux', n: 6, murs: 6, cristaux: 3 },
  { titre: 'Les répétitions', description: '7 × 7 · blocs limités : utilise 🔁', n: 7, murs: 6, cristaux: 3, repeter: true },
  { titre: 'Programme court', description: '7 × 7 · plus de murs, blocs limités', n: 7, murs: 9, cristaux: 3, repeter: true },
  { titre: 'Grand terrain', description: '8 × 8 · 4 cristaux, blocs limités', n: 8, murs: 10, cristaux: 4, repeter: true },
  { titre: 'Ingénieur', description: '8 × 8 · 5 cristaux, blocs limités', n: 8, murs: 12, cristaux: 5, repeter: true }
];
const ICONES = { A: '↑', G: '↶', D: '↷' }, NOMS = { A: 'avancer', G: 'tourner à gauche', D: 'tourner à droite' };
const ZG = 400, ZX = (W - ZG) / 2, ZY = 6; // playing area
const robot = {
  id: 'robot', palier: 'avance', titre: 'Robot programmeur', icone: '🤖', couleur: '#3c4fa8',
  resume: 'Prépare toutes les commandes, puis lance le robot : il doit ramasser tous les cristaux.',
  touches: 'Boutons à la souris · ou ↑ ← → puis Entrée',
  aide: 'Ajoute des blocs avec les boutons ou les flèches (↑ avancer, ← tourner à gauche, → tourner à droite). Chiffres 2 à 9 : répéter le dernier bloc. Retour arrière : effacer. Entrée : lancer.',
  vitesse: true, pad: 'hgd', niveaux: ROBOT,
  boutons: [
    { id: 'A', texte: '↑ Avancer' }, { id: 'G', texte: '↶ Tourner à gauche' }, { id: 'D', texte: '↷ Tourner à droite' },
    { id: 'rep', texte: '🔁 Répéter +1' }, { id: 'effacer', texte: '⌫ Effacer' }, { id: 'vider', texte: '🗑 Tout effacer' },
    { id: 'lancer', texte: '▶ Lancer le robot', principal: true }
  ],
  consigne(nv) { return 'Programme le robot pour qu’il ramasse ' + (nv.cristaux > 1 ? 'les ' + nv.cristaux + ' cristaux 💎' : 'le cristal 💎') + '.'; },
  generer(nv) {
    for (;;) {
      const n = nv.n, murs = new Set(), d = hasard(0, 3), sx = hasard(0, n - 1), sy = hasard(0, n - 1);
      while (murs.size < nv.murs) { const x = hasard(0, n - 1), y = hasard(0, n - 1); if (x !== sx || y !== sy) murs.add(cle(x, y)); }
      const acc = [...accessibles(n, murs, sx, sy)].filter(k => k !== cle(sx, sy)).map(k => k.split(',').map(Number));
      if (acc.length < nv.cristaux + 4) continue;
      const cr = melange(acc).filter(([x, y]) => Math.abs(x - sx) + Math.abs(y - sy) >= 2).slice(0, nv.cristaux);
      if (cr.length < nv.cristaux) continue;
      if (nv.n === 5 && nv.cristaux === 1 && cr[0][0] !== sx && cr[0][1] !== sy) continue; // level 1: in a straight line… or almost
      /* Greedy solution → number of blocks, to set the limit. */
      let pos = [sx, sy], dir = d; const cmds = []; let reste = cr.slice();
      while (reste.length) {
        const { d: dist, p } = distances(n, murs, pos[0], pos[1]);
        reste.sort((a, b) => dist.get(cle(...a)) - dist.get(cle(...b)));
        const c = reste.shift(), ch = []; let q = c;
        while (q && !(q[0] === pos[0] && q[1] === pos[1])) { ch.unshift(q); q = p.get(cle(...q)); }
        let cur = pos;
        for (const nx of ch) {
          const want = V4.findIndex(([dx, dy]) => cur[0] + dx === nx[0] && cur[1] + dy === nx[1]);
          const diff = (want - dir + 4) % 4;
          if (diff === 1) cmds.push('D'); else if (diff === 3) cmds.push('G'); else if (diff === 2) cmds.push('D', 'D');
          cmds.push('A'); dir = want; cur = nx;
        }
        pos = c; reste = reste.filter(r => !(r[0] === c[0] && r[1] === c[1]));
      }
      let blocs = 0; for (let i = 0; i < cmds.length; i++) if (i === 0 || cmds[i] !== cmds[i - 1]) blocs++;
      return { n, murs, depart: { x: sx, y: sy, d }, cristaux: cr.map(([x, y]) => ({ x, y })), limite: nv.repeter ? blocs + 2 : null, longueur: cmds.length };
    }
  },
  init(nv, J) {
    const t = this.generer(nv);
    this.s = { nv, ...t, r: { ...t.depart }, vue: { x: t.depart.x, y: t.depart.y, a: t.depart.d * 90 }, pris: new Set(), prog: [], exec: null, essais: 0, fini: false, c: ZG / t.n };
    J.coeurs(''); J.bouton('rep', { cache: !nv.repeter }); this.maj_score(J);
    J.message(nv.repeter ? 'Tu as droit à ' + t.limite + ' blocs au plus : utilise 🔁 Répéter pour raccourcir ton programme.' : 'Ajoute des blocs, puis appuie sur ▶ Lancer le robot.');
  },
  maj_score(J) { const s = this.s; J.score('Blocs : ' + s.prog.length + (s.limite ? ' / ' + s.limite : '') + ' · Essais : ' + s.essais); },
  ajouter(c, J) {
    const s = this.s; if (s.exec || s.fini) return;
    const der = s.prog[s.prog.length - 1];
    if (s.limite && s.prog.length >= s.limite) { J.message('Tu as déjà ' + s.limite + ' blocs, le maximum. Utilise 🔁 Répéter ou ⌫ Effacer.', 'oups'); return; }
    s.prog.push({ c, n: 1 }); this.maj_score(J); J.message('');
    if (der && der.c === c && s.nv.repeter) J.message('Astuce : 🔁 Répéter peut remplacer deux blocs pareils.');
  },
  repeter(n, J) {
    const s = this.s; if (s.exec || s.fini || !s.nv.repeter) return;
    const b = s.prog[s.prog.length - 1]; if (!b) { J.message('Ajoute d’abord un bloc.'); return; }
    b.n = n ? n : Math.min(9, b.n + 1); this.maj_score(J);
  },
  action(id, J) {
    const s = this.s; if (s.fini) return;
    if (id === 'A' || id === 'G' || id === 'D') this.ajouter(id, J);
    else if (id === 'rep') this.repeter(0, J);
    else if (id === 'effacer') { if (!s.exec) { s.prog.pop(); this.maj_score(J); } }
    else if (id === 'vider') { if (!s.exec) { s.prog = []; this.maj_score(J); } }
    else if (id === 'lancer') this.lancer(J);
  },
  touche(dir, J) { if (dir === 'haut') this.ajouter('A', J); else if (dir === 'gauche') this.ajouter('G', J); else if (dir === 'droite') this.ajouter('D', J); },
  clavier(k, J) {
    if (k === 'Enter') { this.lancer(J); return true; }
    if (k === 'Backspace') { this.action('effacer', J); return true; }
    if (k === 'Delete') { this.action('vider', J); return true; }
    if (/^[2-9]$/.test(k) && this.s.nv.repeter) { this.repeter(+k, J); return true; }
    return false;
  },
  lancer(J) {
    const s = this.s; if (s.exec || s.fini) return;
    if (!s.prog.length) { J.message('Ton programme est vide : ajoute des blocs.', 'oups'); return; }
    const etapes = []; s.prog.forEach((b, i) => { for (let k = 0; k < b.n; k++) etapes.push({ c: b.c, bloc: i }); });
    s.r = { ...s.depart }; s.vue = { x: s.r.x, y: s.r.y, a: s.r.d * 90 }; s.pris = new Set();
    s.exec = { etapes, i: 0, t: 0 }; s.essais++; this.maj_score(J); J.message('Le robot exécute ton programme…');
    J.bouton('lancer', { actif: false });
  },
  arreter(J, gagne, msg) {
    const s = this.s; s.exec = null; J.bouton('lancer', { actif: true });
    if (gagne) { s.fini = true; J.message('Tous les cristaux sont ramassés !', 'bon'); setTimeout(() => J.gagne(s.essais === 1 ? 3 : s.essais <= 3 ? 2 : 1, 'Ton programme a réussi en ' + s.essais + (s.essais > 1 ? ' essais.' : ' essai.')), 500); }
    else { J.message(msg + ' Modifie ton programme et relance.', 'oups'); s.retour = 1.4; }
  },
  maj(dt, J) {
    const s = this.s;
    s.vue.x += (s.r.x - s.vue.x) * Math.min(1, dt * 10); s.vue.y += (s.r.y - s.vue.y) * Math.min(1, dt * 10);
    let ca = s.r.d * 90; while (ca - s.vue.a > 180) ca -= 360; while (s.vue.a - ca > 180) ca += 360; s.vue.a += (ca - s.vue.a) * Math.min(1, dt * 10);
    if (s.retour !== undefined) { s.retour -= dt; if (s.retour <= 0) { s.retour = undefined; s.r = { ...s.depart }; s.pris = new Set(); } }
    const e = s.exec; if (!e) return;
    e.t += dt; const pas = { lent: .55, moyen: .38, rapide: .24 }[J.vitesse()];
    if (e.t < pas) return; e.t = 0;
    if (e.i >= e.etapes.length) {
      const reste = s.cristaux.length - s.pris.size;
      return this.arreter(J, reste === 0, 'Le programme est fini, mais il reste ' + reste + (reste > 1 ? ' cristaux.' : ' cristal.'));
    }
    const st = e.etapes[e.i]; e.courant = st.bloc; e.i++;
    if (st.c === 'G') s.r.d = (s.r.d + 3) % 4;
    else if (st.c === 'D') s.r.d = (s.r.d + 1) % 4;
    else {
      const [dx, dy] = V4[s.r.d], x = s.r.x + dx, y = s.r.y + dy;
      if (x < 0 || y < 0 || x >= s.n || y >= s.n || s.murs.has(cle(x, y))) return this.arreter(J, false, 'Bloc ' + (st.bloc + 1) + ' : le robot s’est cogné ' + (s.murs.has(cle(x, y)) ? 'contre un mur.' : 'au bord.'));
      s.r.x = x; s.r.y = y;
      s.cristaux.forEach((c, i) => { if (c.x === x && c.y === y) s.pris.add(i); });
      if (s.pris.size === s.cristaux.length) return this.arreter(J, true);
    }
  },
  dessin(ctx, t) {
    const s = this.s, c = s.c;
    ctx.fillStyle = '#f2f4fb'; ctx.fillRect(0, 0, W, H);
    for (let y = 0; y < s.n; y++) for (let x = 0; x < s.n; x++) {
      const X = ZX + x * c, Y = ZY + y * c;
      if (s.murs.has(cle(x, y))) { rond(ctx, X + 2, Y + 2, c - 4, c - 4, 6); ctx.fillStyle = '#5b6578'; ctx.fill(); }
      else { ctx.fillStyle = (x + y) % 2 ? '#ffffff' : '#f7f9ff'; ctx.fillRect(X, Y, c, c); ctx.strokeStyle = '#e1e6f2'; ctx.lineWidth = 1; ctx.strokeRect(X, Y, c, c); }
    }
    rond(ctx, ZX + s.depart.x * c + 4, ZY + s.depart.y * c + 4, c - 8, c - 8, 8); ctx.strokeStyle = '#9aa7d8'; ctx.setLineDash([5, 4]); ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]);
    s.cristaux.forEach((k, i) => { if (!s.pris.has(i)) texte(ctx, '💎', ZX + k.x * c + c / 2, ZY + k.y * c + c / 2 + Math.sin(t * 2 + i) * 2, c * .5, '#000'); });
    /* Robot */
    const rx = ZX + s.vue.x * c + c / 2, ry = ZY + s.vue.y * c + c / 2;
    ctx.save(); ctx.translate(rx, ry); ctx.rotate(s.vue.a * Math.PI / 180);
    rond(ctx, -c * .32, -c * .3, c * .64, c * .62, 8); ctx.fillStyle = '#3c4fa8'; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-c * .13, -c * .1, c * .08, 0, 7); ctx.arc(c * .13, -c * .1, c * .08, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, -c * .46); ctx.lineTo(-c * .12, -c * .32); ctx.lineTo(c * .12, -c * .32); ctx.closePath(); ctx.fillStyle = '#f4c152'; ctx.fill();
    ctx.restore();
    /* Program */
    const y0 = ZY + ZG + 14;
    texte(ctx, 'Ton programme', 70, y0 + 6, 15, '#4a6378', 700);
    const bw = 50, gap = 6, parLigne = Math.floor((W - 20) / (bw + gap));
    if (!s.prog.length) texte(ctx, 'Vide : ajoute des blocs avec les boutons ou les flèches', W / 2, y0 + 50, 16, '#8a9bb0', 400);
    s.prog.forEach((b, i) => {
      const X = 12 + (i % parLigne) * (bw + gap), Y = y0 + 22 + Math.floor(i / parLigne) * (bw + gap);
      const actif = s.exec && s.exec.courant === i;
      rond(ctx, X, Y, bw, bw, 9); ctx.fillStyle = actif ? '#f4c152' : b.c === 'A' ? '#dfe5fb' : '#e9f4ec'; ctx.fill(); ctx.strokeStyle = actif ? '#b07a00' : '#9aa7c4'; ctx.lineWidth = 2; ctx.stroke();
      texte(ctx, ICONES[b.c], X + bw / 2, Y + bw / 2 - (b.n > 1 ? 6 : 0), 26, '#16324f', 800);
      if (b.n > 1) texte(ctx, '×' + b.n, X + bw / 2, Y + bw - 11, 15, '#b8540f', 800);
    });
  }
};

/* ================================================================
   2. PUSH THE CRATES · EXPERT
   ================================================================ */
const NIV_EXPERT = [{"titre": "Trois caisses", "description": "8 × 8 · réfléchis avant de pousser", "poussees": 16, "carte": ["########", "#.  ..##", "#    # #", "#  $   #", "#      #", "#   $$##", "#   #@##", "########"]}, {"titre": "Le dépôt", "description": "8 × 8 · trois caisses", "poussees": 18, "carte": ["########", "#      #", "#..#  ##", "#  # $##", "#  # $ #", "#  . $ #", "#   # @#", "########"]}, {"titre": "Les couloirs", "description": "9 × 8 · trois caisses", "poussees": 21, "carte": ["#########", "###  .  #", "# $    .#", "# $#    #", "#   ##  #", "# $ ## .#", "# @   # #", "#########"]}, {"titre": "Quatre caisses", "description": "9 × 8 · l’ordre compte", "poussees": 17, "carte": ["#########", "#.    $@#", "# #  $$##", "#    #  #", "#.      #", "# # .#  #", "###   $.#", "#########"]}, {"titre": "Le grand hangar", "description": "9 × 9 · quatre caisses", "poussees": 18, "carte": ["#########", "####    #", "# .     #", "# $  #  #", "#   $ $##", "#  .    #", "#  ## $@#", "# .. #  #", "#########"]}, {"titre": "Maître des caisses", "description": "10 × 9 · quatre caisses", "poussees": 24, "carte": ["##########", "#.  .#   #", "#  $.#   #", "#  # .  ##", "#  ##$#  #", "#      $@#", "#   #  $ #", "###      #", "##########"]}];
const caissesx = O.fabriqueCaisses({ id: 'caissesx', palier: 'avance', titre: 'Pousse les caisses · expert', icone: '🏗️', couleur: '#6e4a24', resume: 'Plus de caisses, plus de murs : il faut planifier plusieurs coups à l’avance.', niveaux: NIV_EXPERT });

/* ================================================================
   3. LASER BEAM (mirrors to rotate)
   ================================================================ */
const LASER = [
  { titre: 'Deux miroirs', description: '5 × 5', n: 5, m: 2, leurres: 0, murs: 0, cr: 0 },
  { titre: 'Trois miroirs', description: '6 × 6 · un miroir inutile', n: 6, m: 3, leurres: 1, murs: 0, cr: 0 },
  { titre: 'Des murs', description: '6 × 6 · 4 miroirs', n: 6, m: 4, leurres: 2, murs: 2, cr: 0 },
  { titre: 'Plus de détours', description: '7 × 7 · 4 miroirs', n: 7, m: 4, leurres: 3, murs: 3, cr: 0 },
  { titre: 'Le cristal', description: '7 × 7 · le rayon doit traverser le cristal', n: 7, m: 5, leurres: 3, murs: 2, cr: 1 },
  { titre: 'Deux cristaux', description: '8 × 8 · 5 miroirs', n: 8, m: 5, leurres: 4, murs: 4, cr: 2 },
  { titre: 'Labyrinthe de lumière', description: '8 × 8 · 6 miroirs', n: 8, m: 6, leurres: 6, murs: 3, cr: 2 },
  { titre: 'Maître du laser', description: '9 × 9 · 7 miroirs, 3 cristaux', n: 9, m: 7, leurres: 7, murs: 5, cr: 3 }
];
/* "/": right→up, up→right, left→down, down→left. "\": right→down, down→right, left→up, up→left. */
const REFLET = { '/': [1, 0, 3, 2], '\\': [3, 2, 1, 0] };
const laser = {
  id: 'laser', palier: 'avance', titre: 'Rayon laser', icone: '🔦', couleur: '#b3366e',
  resume: 'Tourne les miroirs pour guider le rayon jusqu’à la cible.',
  touches: 'Clic sur un miroir · ou flèches + Entrée',
  aide: 'Clique sur un miroir pour le tourner. Au clavier : flèches pour choisir une case, Entrée pour tourner le miroir.',
  niveaux: LASER,
  boutons: [{ id: 'tourner', texte: '↻ Tourner le miroir choisi' }],
  consigne(nv) { return 'Guide le rayon jusqu’à la cible 🎯' + (nv.cr ? ' en passant par ' + (nv.cr > 1 ? 'les ' + nv.cr + ' cristaux 💎' : 'le cristal 💎') : '') + '.'; },
  generer(nv) {
    const n = nv.n;
    for (let essai = 0; essai < 5000; essai++) {
      const sy = hasard(0, n - 1), chemin = [[0, sy]], vus = new Set([cle(0, sy)]), miroirs = new Map();
      let x = 0, y = sy, d = 1, ok = true;
      for (let m = 0; m <= nv.m && ok; m++) {
        const k = hasard(1, 3);
        for (let i = 0; i < k; i++) { x += V4[d][0]; y += V4[d][1]; if (x < 0 || y < 0 || x >= n || y >= n || vus.has(cle(x, y))) { ok = false; break; } vus.add(cle(x, y)); chemin.push([x, y]); }
        if (!ok) break;
        if (m < nv.m) {
          const nd = pioche([(d + 1) % 4, (d + 3) % 4]);
          const sorte = REFLET['/'][d] === nd ? '/' : '\\';
          miroirs.set(cle(x, y), { x, y, bon: sorte, o: sorte }); d = nd;
        }
      }
      if (!ok || miroirs.has(cle(x, y))) continue;
      const cible = { x, y };
      const libres = []; for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) if (!vus.has(cle(a, b))) libres.push([a, b]);
      melange(libres);
      const murs = new Set(libres.slice(0, nv.murs).map(([a, b]) => cle(a, b)));
      libres.slice(nv.murs, nv.murs + nv.leurres).forEach(([a, b]) => miroirs.set(cle(a, b), { x: a, y: b, o: pioche(['/', '\\']), leurre: true }));
      const droits = chemin.slice(1, -1).filter(([a, b]) => !miroirs.has(cle(a, b)));
      if (droits.length < nv.cr) continue;
      const cristaux = melange(droits).slice(0, nv.cr).map(([a, b]) => ({ x: a, y: b }));
      /* Shuffle: at least half of the correct mirrors are rotated. */
      const bons = [...miroirs.values()].filter(m => !m.leurre);
      let tournes = 0; bons.forEach(m => { if (Math.random() < .65) { m.o = m.o === '/' ? '\\' : '/'; tournes++; } });
      if (tournes < Math.ceil(bons.length / 2)) continue;
      const t = { n, source: { x: 0, y: sy }, cible, murs, miroirs, cristaux, min: tournes };
      if (this.rayon(t).gagne) continue;
      return t;
    }
  },
  rayon(t) {
    let x = t.source.x, y = t.source.y, d = 1; const pts = [[x, y]], passe = new Set(), vus = new Set();
    for (let i = 0; i < 400; i++) {
      const nx = x + V4[d][0], ny = y + V4[d][1];
      if (nx < 0 || ny < 0 || nx >= t.n || ny >= t.n) { pts.push([x + V4[d][0] * .5, y + V4[d][1] * .5]); break; }
      if (t.murs.has(cle(nx, ny))) { pts.push([x + V4[d][0] * .5, y + V4[d][1] * .5]); break; }
      x = nx; y = ny; passe.add(cle(x, y));
      if (x === t.cible.x && y === t.cible.y) { pts.push([x, y]); return { pts, passe, touche: true, gagne: t.cristaux.every(c => passe.has(cle(c.x, c.y))) }; }
      const m = t.miroirs.get(cle(x, y));
      if (m) { pts.push([x, y]); d = REFLET[m.o][d]; }
      const k = cle(x, y) + ':' + d; if (vus.has(k)) break; vus.add(k);
    }
    return { pts, passe, touche: false, gagne: false };
  },
  init(nv, J) {
    const t = this.generer(nv);
    this.s = { nv, ...t, c: W / t.n, tours: 0, fini: false, curseur: { x: 0, y: t.source.y }, anim: {} };
    J.coeurs(''); this.verifier(J); J.message('Clique sur un miroir pour le tourner.');
  },
  verifier(J) {
    const s = this.s, r = this.rayon(s); s.r = r;
    J.score('Tours : ' + s.tours);
    if (r.gagne) { s.fini = true; J.message('Le rayon touche la cible !', 'bon'); setTimeout(() => J.gagne(s.tours <= s.min + 1 ? 3 : s.tours <= 2 * s.min + 2 ? 2 : 1, 'Rayon guidé en ' + s.tours + ' tours de miroir.'), 900); }
    else if (r.touche) J.message('La cible est touchée, mais le rayon doit aussi passer par ' + (s.nv.cr > 1 ? 'tous les cristaux.' : 'le cristal.'), 'oups');
  },
  tourner(x, y, J) {
    const s = this.s, m = s.miroirs.get(cle(x, y)); if (!m || s.fini) return;
    m.o = m.o === '/' ? '\\' : '/'; s.tours++; s.anim[cle(x, y)] = 1; this.verifier(J);
  },
  clic(X, Y, J) { const s = this.s, x = Math.floor(X / s.c), y = Math.floor(Y / s.c); s.curseur = { x, y }; this.tourner(x, y, J); },
  touche(dir, J) { const s = this.s, [dx, dy] = DIRS[dir]; s.curseur = { x: Math.max(0, Math.min(s.n - 1, s.curseur.x + dx)), y: Math.max(0, Math.min(s.n - 1, s.curseur.y + dy)) }; if (s.miroirs.has(cle(s.curseur.x, s.curseur.y))) J.message('Miroir choisi : Entrée pour le tourner.'); },
  clavier(k, J) { if (k === 'Enter') { this.action('tourner', J); return true; } return false; },
  action(id, J) { const s = this.s; if (id === 'tourner') { if (!s.miroirs.has(cle(s.curseur.x, s.curseur.y))) { J.message('Choisis d’abord un miroir (flèches ou clic).'); return; } this.tourner(s.curseur.x, s.curseur.y, J); } },
  maj(dt) { const a = this.s.anim; for (const k in a) { a[k] -= dt * 5; if (a[k] <= 0) delete a[k]; } },
  dessin(ctx, t) {
    const s = this.s, c = s.c, C = (v) => v * c + c / 2;
    ctx.fillStyle = '#1d2433'; ctx.fillRect(0, 0, W, H);
    for (let y = 0; y < s.n; y++) for (let x = 0; x < s.n; x++) { ctx.strokeStyle = '#2c3548'; ctx.lineWidth = 1; ctx.strokeRect(x * c, y * c, c, c); }
    for (const k of s.murs) { const [x, y] = k.split(',').map(Number); rond(ctx, x * c + 3, y * c + 3, c - 6, c - 6, 6); ctx.fillStyle = '#4a5468'; ctx.fill(); }
    /* Beam */
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const [w, col] of [[10, '#ff5a8a40'], [4, '#ff7aa2']]) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); s.r.pts.forEach(([x, y], i) => i ? ctx.lineTo(C(x), C(y)) : ctx.moveTo(C(x), C(y))); ctx.stroke(); }
    ctx.restore();
    s.cristaux.forEach(k => { const on = s.r.passe.has(cle(k.x, k.y)); ctx.globalAlpha = on ? 1 : .55; texte(ctx, '💎', C(k.x), C(k.y), c * .48, '#000'); ctx.globalAlpha = 1; });
    /* Target */
    for (const [r, col] of [[.4, '#f2f2f2'], [.28, '#e0567a'], [.15, '#f2f2f2'], [.06, '#e0567a']]) { ctx.beginPath(); ctx.arc(C(s.cible.x), C(s.cible.y), c * r, 0, 7); ctx.fillStyle = col; ctx.fill(); }
    if (s.r.touche) { ctx.beginPath(); ctx.arc(C(s.cible.x), C(s.cible.y), c * (.45 + .04 * Math.sin(t * 6)), 0, 7); ctx.strokeStyle = '#ffd56b'; ctx.lineWidth = 3; ctx.stroke(); }
    /* Source */
    rond(ctx, s.source.x * c + c * .12, s.source.y * c + c * .25, c * .6, c * .5, 8); ctx.fillStyle = '#f4c152'; ctx.fill();
    ctx.beginPath(); ctx.arc(s.source.x * c + c * .72, C(s.source.y), c * .1, 0, 7); ctx.fillStyle = '#ff5a8a'; ctx.fill();
    /* Mirrors */
    for (const m of s.miroirs.values()) {
      const cx = C(m.x), cy = C(m.y), r = c * .4, a = s.anim[cle(m.x, m.y)] || 0;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fillStyle = '#2f3a52'; ctx.fill(); ctx.strokeStyle = '#7f8aa3'; ctx.lineWidth = 2; ctx.stroke();
      ctx.save(); ctx.translate(cx, cy); ctx.rotate((m.o === '/' ? -Math.PI / 4 : Math.PI / 4) + a * Math.PI / 2);
      ctx.fillStyle = '#cfe8ff'; ctx.fillRect(-r * .95, -3.5, r * 1.9, 7); ctx.restore();
    }
    /* Keyboard cursor */
    ctx.strokeStyle = '#ffd56b'; ctx.lineWidth = 3; ctx.setLineDash([6, 5]); ctx.strokeRect(s.curseur.x * c + 3, s.curseur.y * c + 3, c - 6, c - 6); ctx.setLineDash([]);
  }
};

/* ================================================================
   4. NUMBER SLIDE (a gentle 2048)
   ================================================================ */
const GLISSE = [
  { titre: 'Jusqu’à 32', description: '2 + 2 = 4, 4 + 4 = 8…', base: 2, but: 5 },
  { titre: 'Jusqu’à 64', description: 'Les doubles', base: 2, but: 6 },
  { titre: 'Jusqu’à 128', description: 'Les doubles', base: 2, but: 7 },
  { titre: 'Jusqu’à 256', description: 'Pour les patients', base: 2, but: 8 },
  { titre: 'Table de 3 : jusqu’à 96', description: '3, 6, 12, 24, 48…', base: 3, but: 6 },
  { titre: 'Table de 3 : jusqu’à 192', description: '3, 6, 12, 24, 48, 96…', base: 3, but: 7 },
  { titre: 'Fractions : jusqu’à 1', description: '1/16 + 1/16 = 1/8…', frac: 16, but: 5 },
  { titre: 'Fractions : jusqu’à 2', description: '1/32 + 1/32 = 1/16…', frac: 32, but: 7 }
];
const COUL = ['#eef3f8', '#dbeafe', '#c7f0dc', '#fde7b0', '#fbd0a8', '#f9b8b0', '#e6c4f2', '#c9c4f7', '#a9d8f5', '#9be3c9', '#f6d365', '#f2a65a'];
const glisse = {
  id: 'glisse', palier: 'avance', titre: 'Glissière des nombres', icone: '🔢', couleur: '#5b7d1a',
  resume: 'Fais glisser les tuiles : deux tuiles pareilles s’additionnent. Atteins l’objectif !',
  touches: 'Flèches · ou glisser avec la souris',
  aide: 'Flèches pour faire glisser toutes les tuiles. Avec la souris (ou le doigt) : glisse dans une direction. Pas de minuterie : prends ton temps. ↶ Annuler si tu te trompes.',
  niveaux: GLISSE,
  boutons: [{ id: 'annuler', texte: '↶ Annuler' }, { id: 'recommencer', texte: '↺ Recommencer' }],
  consigne(nv) { return 'Additionne les tuiles pareilles pour obtenir ' + this.etiquette(nv, nv.but) + '.'; },
  etiquette(nv, e) {
    if (nv.frac) { const num = 2 ** (e - 1), den = nv.frac; if (num >= den) return String(num / den); return '1/' + den / num; }
    return String(nv.base * 2 ** (e - 1));
  },
  init(nv, J) {
    this.s = { nv, g: Array.from({ length: 4 }, () => Array(4).fill(0)), histoire: [], annulations: 0, fini: false, neuf: new Map(), bloque: false };
    this.ajouter(); this.ajouter(); J.coeurs(''); this.maj_score(J); J.message('Utilise les flèches, ou glisse avec la souris.');
  },
  ajouter() {
    const s = this.s, v = []; for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) if (!s.g[y][x]) v.push([x, y]);
    if (!v.length) return; const [x, y] = pioche(v); s.g[y][x] = Math.random() < .9 ? 1 : 2; s.neuf.set(cle(x, y), 1);
  },
  max() { return Math.max(...this.s.g.flat()); },
  maj_score(J) { const s = this.s; J.score('Plus grande : ' + this.etiquette(s.nv, this.max()) + ' · Objectif : ' + this.etiquette(s.nv, s.nv.but)); },
  glisser(dir) {
    const s = this.s, g = s.g; let bouge = false; const fus = [];
    const [dx, dy] = DIRS[dir];
    for (let i = 0; i < 4; i++) {
      const ligne = [];
      for (let j = 0; j < 4; j++) { const x = dx ? (dx > 0 ? 3 - j : j) : i, y = dy ? (dy > 0 ? 3 - j : j) : i; ligne.push([x, y]); }
      const vals = ligne.map(([x, y]) => g[y][x]).filter(Boolean), res = [];
      for (let k = 0; k < vals.length; k++) { if (vals[k] === vals[k + 1]) { res.push(vals[k] + 1); fus.push(res.length - 1 + i * 10); k++; } else res.push(vals[k]); }
      ligne.forEach(([x, y], j) => { const v = res[j] || 0; if (g[y][x] !== v) bouge = true; g[y][x] = v; if (fus.includes(j + i * 10) && v) s.neuf.set(cle(x, y), 1); });
    }
    return bouge;
  },
  peutBouger() { const g = this.s.g; for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { if (!g[y][x]) return true; if (x < 3 && g[y][x] === g[y][x + 1]) return true; if (y < 3 && g[y][x] === g[y + 1][x]) return true; } return false; },
  touche(dir, J) {
    const s = this.s; if (s.fini) return;
    const avant = s.g.map(l => l.slice());
    if (!this.glisser(dir)) { J.message('Rien ne bouge dans ce sens.'); return; }
    s.histoire.push(avant); if (s.histoire.length > 200) s.histoire.shift();
    this.ajouter(); this.maj_score(J); J.message('');
    if (this.max() >= s.nv.but) { s.fini = true; const a = s.annulations; setTimeout(() => J.gagne(a === 0 ? 3 : a <= 5 ? 2 : 1, 'Tu as obtenu ' + this.etiquette(s.nv, s.nv.but) + (a ? ' avec ' + a + ' annulation(s).' : ' sans annuler !')), 500); return; }
    if (!this.peutBouger()) J.message('Plus aucun mouvement possible. Utilise ↶ Annuler ou ↺ Recommencer.', 'oups');
  },
  clavier(k, J) { if (k === 'u' || k === 'U' || k === 'Backspace') { this.action('annuler', J); return true; } return false; },
  action(id, J) {
    const s = this.s; if (s.fini) return;
    if (id === 'annuler') { const h = s.histoire.pop(); if (!h) { J.message('Rien à annuler.'); return; } s.g = h; s.annulations++; this.maj_score(J); J.message('Dernier coup annulé.'); }
    if (id === 'recommencer') { this.init(s.nv, J); J.message('Nouvelle partie.'); }
  },
  clic(x, y) { this.s.depart = [x, y]; },
  relache(x, y, J) {
    const d = this.s.depart; if (!d) return; this.s.depart = null;
    const dx = x - d[0], dy = y - d[1]; if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return;
    this.touche(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'droite' : 'gauche') : (dy > 0 ? 'bas' : 'haut'), J);
  },
  maj(dt) { const n = this.s.neuf; for (const [k, v] of n) { const r = v - dt * 5; if (r <= 0) n.delete(k); else n.set(k, r); } },
  dessin(ctx) {
    const s = this.s, m = 20, gap = 12, c = (W - 2 * m - 3 * gap) / 4;
    ctx.fillStyle = '#e7ece0'; ctx.fillRect(0, 0, W, H);
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
      const e = s.g[y][x], X = m + x * (c + gap), Y = m + y * (c + gap), p = s.neuf.get(cle(x, y)) || 0, k = 1 - p * .15;
      rond(ctx, X, Y, c, c, 14); ctx.fillStyle = '#d6ddcc'; ctx.fill();
      if (!e) continue;
      ctx.save(); ctx.translate(X + c / 2, Y + c / 2); ctx.scale(k, k);
      rond(ctx, -c / 2, -c / 2, c, c, 14); ctx.fillStyle = COUL[Math.min(e, COUL.length - 1)]; ctx.fill();
      if (e === s.nv.but) { ctx.strokeStyle = '#b07a00'; ctx.lineWidth = 5; ctx.stroke(); }
      const lab = this.etiquette(s.nv, e); texte(ctx, lab, 0, 2, lab.length > 3 ? 34 : 44, '#16324f', 800);
      ctx.restore();
    }
  }
};

/* ================================================================
   5. TARGET LINE (y = ax + b)
   ================================================================ */
const DROITE = [
  { titre: 'Droites horizontales', description: 'y = b : change seulement b', a: [0], b: [-8, 8], seulB: true },
  { titre: 'Par l’origine', description: 'y = ax : change seulement a', a: [-3, -2, -1, 1, 2, 3], b: [0, 0], seulA: true },
  { titre: 'Pente positive', description: 'y = ax + b avec a positif', a: [1, 2, 3], b: [-5, 5] },
  { titre: 'Pente négative', description: 'a négatif : la droite descend', a: [-1, -2, -3], b: [-5, 5] },
  { titre: 'Des demis', description: 'a = ½, 1½, −½…', a: [-1.5, -.5, .5, 1.5], b: [-5, 5], pas: .5 },
  { titre: 'Deux étoiles seulement', description: 'Deux points suffisent pour une droite', a: [-3, -2, -1, 1, 2, 3], b: [-6, 6], points: 2 },
  { titre: 'Évite les nuages', description: 'Passe par les étoiles, pas par les nuages', a: [-2, -1, 1, 2], b: [-5, 5], nuages: 2 },
  { titre: 'Expert', description: 'Pentes entières ou en demis, deux étoiles', a: [-3, -2, -1.5, -1, -.5, .5, 1, 1.5, 2, 3], b: [-8, 8], pas: .5, points: 2 }
];
const DU = 24, DOX = W / 2, DOY = H / 2 + 10;
const dpx = x => DOX + x * DU, dpy = y => DOY - y * DU;
const eqTexte = (a, b) => {
  const fa = a === 0 ? '' : a === 1 ? 'x' : a === -1 ? moins + 'x' : nb(a) + 'x';
  const fb = b === 0 ? (a === 0 ? '0' : '') : (a === 0 ? nb(b) : (b > 0 ? ' + ' + b : ' ' + moins + ' ' + -b));
  return 'y = ' + fa + fb;
};
const droite = {
  id: 'droite', palier: 'avance', titre: 'Droite cible', icone: '📈', couleur: '#0b7480',
  resume: 'Règle la pente a et l’ordonnée à l’origine b pour que la droite passe par toutes les étoiles.',
  touches: 'Boutons ou flèches · ou glisser les poignées',
  aide: '← → changent a (la pente), ↑ ↓ changent b (où la droite coupe l’axe des y). Avec la souris : boutons, ou glisse les poignées rondes sur la droite.',
  niveaux: DROITE,
  boutons: [{ id: 'amoins', texte: 'a −' }, { id: 'aplus', texte: 'a +' }, { id: 'bmoins', texte: 'b −' }, { id: 'bplus', texte: 'b +' }],
  consigne(nv) { return nv.seulB ? 'Monte ou descends la droite (b) pour toucher toutes les étoiles.' : nv.seulA ? 'Change la pente (a) pour que la droite passe par toutes les étoiles.' : 'Trouve a et b : la droite doit passer par toutes les étoiles' + (nv.nuages ? ', sans toucher les nuages.' : '.'); },
  init(nv, J) {
    this.s = { nv, manche: 0, but: 5, changements: 0, minimum: 0, fini: false, a: 0, b: 0, tire: null, pause: 0 };
    J.coeurs(''); J.bouton('amoins', { cache: !!nv.seulB }); J.bouton('aplus', { cache: !!nv.seulB }); J.bouton('bmoins', { cache: !!nv.seulA }); J.bouton('bplus', { cache: !!nv.seulA });
    this.manche(J);
  },
  manche(J) {
    const s = this.s, nv = s.nv;
    let a, b, xs;
    for (;;) {
      a = pioche(nv.a); b = hasard(nv.b[0], nv.b[1]);
      const cand = []; for (let x = -9; x <= 9; x++) { const y = a * x + b; if (Number.isInteger(y) && y >= -9 && y <= 9) cand.push(x); }
      const k = nv.points || 3; if (cand.length < k) continue;
      xs = melange(cand).slice(0, k).sort((p, q) => p - q);
      if (k === 2 && xs[1] - xs[0] < 3) continue;
      if (a === (nv.seulB ? 0 : 1) && b === 0) continue;
      break;
    }
    s.cibleA = a; s.cibleB = b; s.points = xs.map(x => ({ x, y: a * x + b }));
    s.nuages = [];
    if (nv.nuages) { while (s.nuages.length < nv.nuages) { const p = pioche(s.points), dy = pioche([-2, -1, 1, 2]), x = p.x + pioche([-2, -1, 1, 2]), y = a * x + b + dy; if (Number.isInteger(y) && Math.abs(y) <= 9 && Math.abs(x) <= 9) s.nuages.push({ x, y }); } }
    s.a = nv.seulB ? 0 : 1; s.b = 0; s.depA = s.a;
    s.minimum += Math.round(Math.abs(a - s.a) / (nv.pas || 1)) + Math.abs(b);
    J.score('Droite ' + (s.manche + 1) + ' / ' + s.but); this.verifier(J, true);
  },
  sur(p) { const s = this.s; return Math.abs(s.a * p.x + s.b - p.y) < 1e-9; },
  verifier(J, debut) {
    const s = this.s; if (s.pause) return;
    const toutes = s.points.every(p => this.sur(p)), nuage = s.nuages.some(p => this.sur(p));
    if (toutes && !nuage) {
      s.manche++; J.message('Bravo ! ' + eqTexte(s.a, s.b) + ' passe par toutes les étoiles.', 'bon');
      if (s.manche >= s.but) { s.fini = true; const e = s.changements <= s.minimum + 5 ? 3 : s.changements <= 2 * s.minimum + 8 ? 2 : 1; setTimeout(() => J.gagne(e, 'Tu as trouvé les ' + s.but + ' droites.'), 900); return; }
      s.pause = 1.2;
    } else if (toutes && nuage) J.message('Toutes les étoiles sont touchées, mais la droite traverse un nuage ☁️.', 'oups');
    else if (!debut) J.message(eqTexte(s.a, s.b) + ' · étoiles touchées : ' + s.points.filter(p => this.sur(p)).length + ' / ' + s.points.length);
  },
  changer(da, db, J) {
    const s = this.s, nv = s.nv; if (s.fini || s.pause) return;
    if (nv.seulB) da = 0; if (nv.seulA) db = 0; if (!da && !db) return;
    const pas = nv.pas || 1, a = Math.max(-5, Math.min(5, s.a + da * pas)), b = Math.max(-10, Math.min(10, s.b + db));
    if (a === s.a && b === s.b) return;
    s.a = a; s.b = b; s.changements++; this.verifier(J);
  },
  touche(dir, J) { this.changer(dir === 'droite' ? 1 : dir === 'gauche' ? -1 : 0, dir === 'haut' ? 1 : dir === 'bas' ? -1 : 0, J); },
  action(id, J) { this.changer(id === 'aplus' ? 1 : id === 'amoins' ? -1 : 0, id === 'bplus' ? 1 : id === 'bmoins' ? -1 : 0, J); },
  clic(X, Y) {
    const s = this.s; if (s.fini) return;
    if (!s.nv.seulA && Math.hypot(X - dpx(0), Y - dpy(s.b)) < 22) s.tire = 'b';
    else if (!s.nv.seulB && Math.hypot(X - dpx(2), Y - dpy(2 * s.a + s.b)) < 22) s.tire = 'a';
  },
  glisse(X, Y, J) {
    const s = this.s; if (!s.tire || s.pause) return;
    const y = (DOY - Y) / DU;
    if (s.tire === 'b') { const b = Math.round(y); if (b !== s.b && Math.abs(b) <= 10) { s.b = b; s.changements++; this.verifier(J); } }
    else { const pas = s.nv.pas || 1, a = Math.round((y - s.b) / 2 / pas) * pas; if (a !== s.a && Math.abs(a) <= 5) { s.a = a; s.changements++; this.verifier(J); } }
  },
  relache() { this.s.tire = null; },
  maj(dt, J) { const s = this.s; if (s.pause) { s.pause -= dt; if (s.pause <= 0) { s.pause = 0; this.manche(J); } } },
  dessin(ctx, t) {
    const s = this.s;
    ctx.fillStyle = '#f5fafb'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#dcebee'; ctx.lineWidth = 1;
    for (let k = -10; k <= 10; k++) { ctx.beginPath(); ctx.moveTo(dpx(k), dpy(10.5)); ctx.lineTo(dpx(k), dpy(-10.5)); ctx.moveTo(dpx(-10.5), dpy(k)); ctx.lineTo(dpx(10.5), dpy(k)); ctx.stroke(); }
    ctx.lineWidth = 2.5; ctx.strokeStyle = '#c0392b'; ctx.beginPath(); ctx.moveTo(dpx(-10.8), DOY); ctx.lineTo(dpx(10.8), DOY); ctx.stroke();
    ctx.strokeStyle = '#2c62ab'; ctx.beginPath(); ctx.moveTo(DOX, dpy(-10.8)); ctx.lineTo(DOX, dpy(10.8)); ctx.stroke();
    for (let k = -10; k <= 10; k += 2) if (k) { texte(ctx, nb(k), dpx(k), DOY + 12, 11, '#c0392b', 700); texte(ctx, nb(k), DOX - 13, dpy(k), 11, '#2c62ab', 700); }
    /* Clouds and stars */
    for (const p of s.nuages) texte(ctx, '☁️', dpx(p.x), dpy(p.y), 26, '#000');
    for (const p of s.points) { const on = this.sur(p); etoile(ctx, dpx(p.x), dpy(p.y), on ? 13 + Math.sin(t * 5) : 11, on ? '#f4c152' : '#fff3c4'); }
    /* Current line */
    ctx.save(); ctx.beginPath(); ctx.rect(dpx(-10.5), dpy(10.5), DU * 21, DU * 21); ctx.clip();
    ctx.strokeStyle = '#6a4cad'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(dpx(-11), dpy(s.a * -11 + s.b)); ctx.lineTo(dpx(11), dpy(s.a * 11 + s.b)); ctx.stroke();
    /* Slope triangle: 1 to the right, a upwards */
    if (s.a) { ctx.setLineDash([5, 4]); ctx.strokeStyle = '#b8540f'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(dpx(0), dpy(s.b)); ctx.lineTo(dpx(1), dpy(s.b)); ctx.lineTo(dpx(1), dpy(s.a + s.b)); ctx.stroke(); ctx.setLineDash([]); }
    ctx.restore();
    if (!s.nv.seulA) { ctx.beginPath(); ctx.arc(dpx(0), dpy(s.b), 9, 0, 7); ctx.fillStyle = '#2c62ab'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); }
    if (!s.nv.seulB) { ctx.beginPath(); ctx.arc(dpx(2), dpy(2 * s.a + s.b), 9, 0, 7); ctx.fillStyle = '#6a4cad'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); }
    /* Equation */
    rond(ctx, 10, 8, 200, 44, 12); ctx.fillStyle = '#ffffffeb'; ctx.fill(); ctx.strokeStyle = '#6a4cad'; ctx.lineWidth = 2; ctx.stroke();
    texte(ctx, eqTexte(s.a, s.b), 110, 31, 22, '#16324f', 800);
    texte(ctx, 'a = ' + nb(s.a) + '   b = ' + nb(s.b), W - 92, 26, 15, '#4a6378', 700);
  }
};

return [robot, caissesx, laser, glisse, droite];
});
