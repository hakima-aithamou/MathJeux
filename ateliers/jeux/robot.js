/* 🤖 The delivery robot: write an arrow program to deliver the parcels. */
(function () {
const A = Atelier.api, { node, svg, hasard, pioche, melange } = A;
const DIR = { '↑': [0, -1], '↓': [0, 1], '←': [-1, 0], '→': [1, 0] }, MOT = { '↑': 'monte', '↓': 'descend', '←': 'va à gauche', '→': 'va à droite' };
const k2 = (x, y) => x + ',' + y;
function plan(parent, C, R, robot, objets, murs) {
  const T = 58, sv = svg('svg', { viewBox: '0 0 ' + (C * T + 4) + ' ' + (R * T + 4), class: 'grille-svg', role: 'img', 'aria-label': 'Le plan du robot' });
  for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) sv.append(svg('rect', { x: 2 + x * T, y: 2 + y * T, width: T, height: T, fill: murs.has(k2(x, y)) ? '#b8664a' : (x + y) % 2 ? '#eef3f8' : '#f8fbfd', stroke: '#c6d3de' }));
  const emo = (e, x, y) => { const t = svg('text', { x: 2 + x * T + T / 2, y: 2 + y * T + T / 2 + 13, 'text-anchor': 'middle', 'font-size': 36 }); t.textContent = e; sv.append(t); return t; };
  murs.forEach(k => { const [x, y] = k.split(',').map(Number); emo('🧱', x, y); });
  objets.forEach(([e, x, y]) => emo(e, x, y));
  const trace = svg('polyline', { points: '', fill: 'none', stroke: '#2e9c76', 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': '2 10', opacity: .9 }); sv.append(trace);
  sv.append(svg('circle', { cx: 2 + robot[0] * T + T / 2, cy: 2 + robot[1] * T + T / 2, r: T / 2 - 5, fill: '#fff3c4', stroke: '#e0a800', 'stroke-width': 3, 'stroke-dasharray': '6 4' }));
  const rb = emo('🤖', robot[0], robot[1]); parent.append(sv);
  return { dessiner(chemin) { trace.setAttribute('points', chemin.map(([x, y]) => (2 + x * T + T / 2) + ',' + (2 + y * T + T / 2)).join(' ')); const [x, y] = chemin[chemin.length - 1]; rb.setAttribute('x', 2 + x * T + T / 2); rb.setAttribute('y', 2 + y * T + T / 2 + 13); } };
}
/* Runs a program; stops at the first collision */
function executer(prog, depart, C, R, murs) {
  const ch = [depart.slice()]; let [x, y] = depart;
  for (let i = 0; i < prog.length; i++) { const [dx, dy] = DIR[prog[i]], nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= C || ny >= R) return { ch, choc: 'Le robot sortirait du plan (flèche n° ' + (i + 1) + ').' };
    if (murs.has(k2(nx, ny))) return { ch, choc: 'Boum ! Le robot frappe un mur (flèche n° ' + (i + 1) + ').' };
    x = nx; y = ny; ch.push([x, y]); }
  return { ch };
}
/* Shortest path (breadth-first) through the stops */
function chemin(depart, etapes, C, R, murs) {
  let prog = [], cur = depart;
  for (const but of etapes) { const vu = new Map([[k2(...cur), null]]), file = [cur];
    while (file.length) { const [x, y] = file.shift(); if (x === but[0] && y === but[1]) break;
      for (const [f, [dx, dy]] of Object.entries(DIR)) { const n = [x + dx, y + dy], k = k2(...n); if (n[0] < 0 || n[1] < 0 || n[0] >= C || n[1] >= R || murs.has(k) || vu.has(k)) continue; vu.set(k, [k2(x, y), f]); file.push(n); } }
    if (!vu.has(k2(...but))) return null; const p = []; let k = k2(...but); while (vu.get(k)) { p.unshift(vu.get(k)[1]); k = vu.get(k)[0]; } prog = prog.concat(p); cur = but; }
  return prog;
}
/* Programming keypad */
function clavier(api, max) {
  const prog = [], z = node('div', 'zone'), ligne = node('div', 'programme'), r = node('div', 'rangee');
  const maj = () => { ligne.replaceChildren(...(prog.length ? prog.map((f, i) => { const s = node('span', 'instr', f); s.title = (i + 1) + ' : ' + MOT[f]; return s; }) : [node('span', 'vide', 'Ton programme est vide.')])); };
  Object.keys(DIR).forEach(f => { const b = node('button', 'choix-bouton fleche', f); b.type = 'button'; b.setAttribute('aria-label', MOT[f]); b.onclick = () => { if (api.resolu() || prog.length >= (max || 20)) return; prog.push(f); maj(); api.son('clic'); }; r.append(b); });
  const ef = node('button', 'choix-bouton', '⌫ Effacer'), tout = node('button', 'choix-bouton', '🗑️ Tout effacer'); ef.type = tout.type = 'button';
  ef.onclick = () => { if (!api.resolu()) { prog.pop(); maj(); } }; tout.onclick = () => { if (!api.resolu()) { prog.length = 0; maj(); } }; r.append(ef, tout);
  z.append(node('p', 'etiquette', 'Ton programme :'), ligne, r); api.champ().append(z); maj();
  return { prog, montrer(p) { prog.length = 0; prog.push(...p); maj(); ligne.classList.add('montree'); } };
}
function compresser(p) { const out = []; p.forEach(f => { const d = out[out.length - 1]; d && d[0] === f ? d[1]++ : out.push([f, 1]); }); return out; }
const deplier = t => t.split('  ').flatMap(s => { const [a, n] = s.split(' × '); return Array(+(n || 1)).fill(a); });
const texteRepete = p => compresser(p).map(([f, n]) => n > 1 ? f + ' × ' + n : f).join('  ');
/* A delivery: robot → stops, with walls */
function livraison(api, C, R, nMurs, etapes) {
  let rob, buts, murs, sol;
  do { murs = new Set(); rob = [hasard(0, C - 1), hasard(0, R - 1)]; buts = etapes.map(() => [hasard(0, C - 1), hasard(0, R - 1)]);
    const occ = new Set([k2(...rob), ...buts.map(b => k2(...b))]); if (occ.size < etapes.length + 1) continue;
    while (murs.size < nMurs) { const m = k2(hasard(0, C - 1), hasard(0, R - 1)); if (!occ.has(m)) murs.add(m); }
    sol = chemin(rob, buts, C, R, murs); } while (!sol || sol.length < 2 + etapes.length || sol.length > 6 + 3 * etapes.length);
  return { rob, buts, murs, sol };
}
function jeuLivraison(api, C, R, nMurs, etapes, consigne, indice) {
  const L = livraison(api, C, R, nMurs, etapes), z = node('div', 'zone'); api.zone().append(z);
  const p = plan(z, C, R, L.rob, L.buts.map((b, i) => [etapes[i], ...b]), L.murs), cl = clavier(api);
  return { consigne, indice: indice + ' Un chemin possible a ' + L.sol.length + ' flèches.', explication: 'Un programme qui marche : ' + L.sol.join(' '),
    verifier() { if (!cl.prog.length) return { manque: 'Touche les flèches pour écrire le programme.' }; const r = executer(cl.prog, L.rob, C, R, L.murs); p.dessiner(r.ch); if (r.choc) return { aide: r.choc };
      let i = 0; for (const [x, y] of r.ch) if (i < L.buts.length && x === L.buts[i][0] && y === L.buts[i][1]) i++;
      const fin = r.ch[r.ch.length - 1], dernier = L.buts[L.buts.length - 1];
      if (i === L.buts.length && fin[0] === dernier[0] && fin[1] === dernier[1]) return true;
      return { aide: i < L.buts.length - 1 ? 'Le robot doit d’abord passer par ' + etapes[0] + '.' : 'Le robot ne s’arrête pas sur ' + etapes[etapes.length - 1] + '. Regarde le trajet vert.' }; },
    montrer() { cl.montrer(L.sol); p.dessiner(executer(L.sol, L.rob, C, R, L.murs).ch); } };
}
const niveaux = [
  { titre: 'Premiers pas', description: 'Un petit trajet, sans obstacle.', manche: api => jeuLivraison(api, 4, 4, 0, ['📦'], 'Écris le programme pour que le robot 🤖 aille chercher le colis 📦.', 'Compte les cases vers la droite ou la gauche, puis vers le haut ou le bas.') },
  { titre: 'Un plus grand quartier', description: 'Des trajets plus longs.', manche: api => jeuLivraison(api, 6, 5, 0, ['📦'], 'Écris le programme pour que le robot 🤖 livre le colis 📦.', 'Fais d’abord tous les pas dans un sens, puis dans l’autre.') },
  { titre: 'Attention aux murs !', description: 'Contourne les obstacles.', manche: api => jeuLivraison(api, 6, 5, 6, ['📦'], 'Le robot 🤖 doit aller au colis 📦 sans toucher les murs 🧱.', 'Cherche un passage autour des murs avant d’écrire.') },
  { titre: 'Les répétitions', description: 'Quel programme court est le bon ?', manche(api) {
    const C = 7, R = 5, L = livraison(api, C, R, 3, ['📦']), z = node('div', 'zone'); api.zone().append(z); const p = plan(z, C, R, L.rob, [['📦', ...L.buts[0]]], L.murs);
    const bon = texteRepete(L.sol), faux = new Set();
    const variantes = [L.sol.map(f => ({ '↑': '↓', '↓': '↑', '←': '←', '→': '→' })[f]), L.sol.map(f => ({ '←': '→', '→': '←', '↑': '↑', '↓': '↓' })[f]), L.sol.slice(0, -1), L.sol.concat(L.sol[L.sol.length - 1]), [...L.sol].reverse()];
    variantes.forEach(v => { const t = texteRepete(v); if (t !== bon && v.length) faux.add(t); });
    const opts = melange([bon, ...melange([...faux]).slice(0, 3)]), f = api.choix(opts, null, 'programmes'), i = opts.indexOf(bon);
    return { consigne: 'Quel programme amène le robot 🤖 au colis 📦 ? « → × 3 » veut dire : répète → trois fois.', indice: 'Essaie chaque programme avec ton doigt sur le plan, en partant du robot.', explication: 'Le bon programme : ' + bon + '.',
      verifier() { if (f() === null) return { manque: 'Choisis un programme.' }; if (f() === i) return true; const r = executer(deplier(opts[f()]), L.rob, C, R, L.murs); p.dessiner(r.ch); return { aide: r.choc || 'Regarde le trajet vert : il ne va pas au colis.' }; },
      montrer() { f.boutons()[i].classList.add('bonne'); p.dessiner(executer(L.sol, L.rob, C, R, L.murs).ch); } }; } },
  { titre: 'Trouver l’erreur', description: 'Une flèche est fausse : laquelle ?', manche(api) {
    const C = 6, R = 5, L = livraison(api, C, R, 2, ['📦']); let err, mauvais;
    err = hasard(0, L.sol.length - 1); mauvais = L.sol.slice(); mauvais[err] = pioche(Object.keys(DIR).filter(f => f !== L.sol[err]));
    const z = node('div', 'zone'); api.zone().append(z); const p = plan(z, C, R, L.rob, [['📦', ...L.buts[0]]], L.murs);
    p.dessiner(executer(mauvais, L.rob, C, R, L.murs).ch);
    const g = node('div', 'programme'); let pris = null; const bs = mauvais.map((fl, j) => { const b = node('button', 'instr bouton-instr', fl); b.type = 'button'; b.setAttribute('aria-label', 'Flèche ' + (j + 1) + ' : ' + MOT[fl]); b.onclick = () => { if (api.resolu()) return; bs.forEach(x => x.setAttribute('aria-pressed', String(x === b))); pris = j; api.son('clic'); }; g.append(b); return b; });
    const zz = node('div', 'zone'); zz.append(node('p', 'etiquette', 'Le programme de Sami :'), g); api.champ().append(zz);
    return { consigne: 'Sami a écrit ce programme, mais le robot 🤖, parti du cercle jaune, n’arrive pas au colis 📦. Touche la flèche qui est fausse.', indice: 'Suis le programme flèche par flèche sur le plan. Où le robot part-il dans la mauvaise direction ?', explication: 'La flèche n° ' + (err + 1) + ' devait être ' + L.sol[err] + ' (' + MOT[L.sol[err]] + ').',
      verifier: () => pris === null ? { manque: 'Touche une flèche du programme.' } : pris === err || mauvais[pris] !== L.sol[pris], montrer() { bs[err].classList.add('bonne'); bs[err].textContent = L.sol[err]; p.dessiner(executer(L.sol, L.rob, C, R, L.murs).ch); } }; } },
  { titre: 'Deux arrêts', description: 'Prends le colis, puis livre-le à la maison.', manche: api => jeuLivraison(api, 7, 5, 5, ['📦', '🏠'], 'Le robot 🤖 prend d’abord le colis 📦, puis il le livre à la maison 🏠. Évite les murs 🧱.', 'Fais le programme en deux parties : jusqu’au colis, puis jusqu’à la maison.') }];
Atelier.definir({ id: 'robot', titre: 'Le robot livreur', icone: '🤖', couleur: '#455a75', intro: 'Programme le robot avec des flèches pour qu’il livre les colis. Attention aux murs ! Ensuite, utilise des répétitions et trouve les erreurs dans les programmes.', niveaux });
})();
