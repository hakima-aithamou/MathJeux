/* 🔷 The shapes workshop: shapes on the geoboard, sides and vertices, symmetry, copying, translation. */
(function () {
const A = Atelier.api, { node, svg, hasard, pioche, melange } = A;
const FIGURES = [
  { nom: 'un carré', court: 'carré', c: 4, p: [[0, 0], [2, 0], [2, 2], [0, 2]] },
  { nom: 'un rectangle', court: 'rectangle', c: 4, p: [[0, 0], [3, 0], [3, 2], [0, 2]] },
  { nom: 'un triangle', court: 'triangle', c: 3, p: [[0, 2], [2, 0], [3, 2]] },
  { nom: 'un losange', court: 'losange', c: 4, p: [[1, 0], [2, 1.5], [1, 3], [0, 1.5]] },
  { nom: 'un pentagone', court: 'pentagone', c: 5, p: [[1.5, 0], [3, 1], [2.5, 3], [0.5, 3], [0, 1]] },
  { nom: 'un hexagone', court: 'hexagone', c: 6, p: [[1, 0], [2, 0], [3, 1.5], [2, 3], [1, 3], [0, 1.5]] },
  { nom: 'un trapèze', court: 'trapèze', c: 4, p: [[1, 0], [3, 0], [4, 2], [0, 2]] }];
function geoplan(parent, fig, ech) {
  const N = 6, T = 50, sv = svg('svg', { viewBox: '0 0 ' + (N * T) + ' ' + (N * T), class: 'grille-svg', role: 'img', 'aria-label': 'Un géoplan avec une figure' }); sv.style.maxWidth = '320px';
  sv.append(svg('rect', { x: 0, y: 0, width: N * T, height: N * T, rx: 14, fill: '#f3e6cf' }));
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) sv.append(svg('circle', { cx: T / 2 + x * T, cy: T / 2 + y * T, r: 5, fill: '#8a6a3e' }));
  const k = ech || 1, ox = Math.floor((N - 1 - Math.max(...fig.p.map(p => p[0])) * k) / 2), oy = Math.floor((N - 1 - Math.max(...fig.p.map(p => p[1])) * k) / 2);
  const pts = fig.p.map(([x, y]) => (T / 2 + (ox + x * k) * T) + ',' + (T / 2 + (oy + y * k) * T)).join(' ');
  sv.append(svg('polygon', { points: pts, fill: '#7a5ad833', stroke: '#7a5ad8', 'stroke-width': 6, 'stroke-linejoin': 'round' }));
  fig.p.forEach(([x, y]) => sv.append(svg('circle', { cx: T / 2 + (ox + x * k) * T, cy: T / 2 + (oy + y * k) * T, r: 8, fill: '#e0573f' })));
  parent.append(sv);
}
/* Small shapes on a grid for symmetry, copying and translation */
function figureCases(C, R, n) {
  const s = new Set([hasard(0, C - 1) + ',' + hasard(0, R - 1)]);
  while (s.size < n) { const [x, y] = pioche([...s]).split(',').map(Number), [dx, dy] = pioche([[1, 0], [-1, 0], [0, 1], [0, -1]]), nx = x + dx, ny = y + dy; if (nx >= 0 && nx < C && ny >= 0 && ny < R) s.add(nx + ',' + ny); }
  return s;
}
const egal = (a, b) => a.size === b.size && [...a].every(k => b.has(k));
function verifCases(g, attendu) { if (!g.on.size) return { manque: 'Touche des cases pour les colorier.' }; if (egal(g.on, attendu)) return true;
  const manque = [...attendu].filter(k => !g.on.has(k)).length, trop = [...g.on].filter(k => !attendu.has(k)).length;
  return { aide: (manque ? 'Il manque ' + manque + ' case' + (manque > 1 ? 's' : '') + '. ' : '') + (trop ? trop + ' case' + (trop > 1 ? 's sont' : ' est') + ' de trop.' : '') }; }
function symetrie(api, axe) {
  const C = 8, R = 8, demi = axe === 'v' ? figureCases(4, 8, hasard(4, 7)) : figureCases(8, 4, hasard(4, 7));
  const attendu = new Set([...demi].map(k => { const [x, y] = k.split(',').map(Number); return axe === 'v' ? (C - 1 - x) + ',' + y : x + ',' + (R - 1 - y); }));
  const g = api.grille(C, R, { axe, fixes: demi, couleur: '#7a5ad8' });
  return { consigne: 'Complète la figure pour qu’elle soit symétrique par rapport à la ligne rouge.', indice: axe === 'v' ? 'Chaque case violette a une jumelle de l’autre côté, à la même distance de la ligne rouge, comme dans un miroir.' : 'Chaque case violette a une jumelle en dessous, à la même distance de la ligne rouge, comme le reflet dans un lac.', explication: 'La moitié coloriée est le reflet exact de l’autre moitié.',
    verifier: () => verifCases(g, attendu), montrer: () => { g.on.clear(); g.montrer([...attendu]); } };
}
const niveaux = [
  { titre: 'Reconnaître les figures', description: 'Carré, rectangle, triangle…', manche(api) {
    const f = pioche(FIGURES), z = node('div', 'zone'); api.zone().append(z); geoplan(z, f);
    const opts = melange([f, ...melange(FIGURES.filter(x => x !== f)).slice(0, 3)]), c = api.choix(opts.map(o => o.court)), i = opts.indexOf(f);
    return { consigne: 'Quelle est cette figure ?', indice: 'Compte ses côtés : ' + f.c + '. Regarde aussi si les côtés sont égaux et s’il y a des coins droits.', explication: 'C’est ' + f.nom + ' : ' + f.c + ' côtés.',
      verifier: () => c() === null ? { manque: 'Choisis une réponse.' } : c() === i, montrer() { c.boutons()[i].classList.add('bonne'); } }; } },
  { titre: 'Côtés et sommets', description: 'Compte les côtés et les coins.', manche(api, k) {
    const f = pioche(FIGURES), cotes = k % 2 === 0, z = node('div', 'zone'); api.zone().append(z); geoplan(z, f); const c = api.champNombre(cotes ? 'Nombre de côtés' : 'Nombre de sommets');
    return { consigne: cotes ? 'Combien de côtés cette figure a-t-elle ?' : 'Combien de sommets cette figure a-t-elle ?', indice: cotes ? 'Un côté est un trait droit. Suis le contour avec ton doigt.' : 'Un sommet est un coin : les points rouges.', explication: 'C’est ' + f.nom + ' : ' + f.c + ' côtés et ' + f.c + ' sommets.',
      verifier: () => !c.value ? { manque: 'Écris un nombre.' } : +c.value === f.c, montrer() { c.value = f.c; c.classList.add('montree'); } }; } },
  { titre: 'Le miroir (axe vertical)', description: 'Compléter une figure symétrique.', manche: api => symetrie(api, 'v') },
  { titre: 'Le reflet dans le lac (axe horizontal)', description: 'Symétrie de haut en bas.', manche: api => symetrie(api, 'h') },
  { titre: 'Reproduire la figure', description: 'Copie le modèle case par case.', manche(api) {
    const C = 6, R = 6, fig = figureCases(C, R, hasard(5, 9)), r = node('div', 'rangee'); api.zone().append(r);
    const m = node('div', 'zone'), c = node('div', 'zone'); m.append(node('p', 'etiquette', 'Modèle')); c.append(node('p', 'etiquette', 'Ta copie')); r.append(m, c);
    const gm = api.grille(C, R, { parent: m, clic: false }); fig.forEach(k => gm.colorier(k, '#7a5ad8')); const g = api.grille(C, R, { parent: c, couleur: '#7a5ad8' });
    return { consigne: 'Reproduis exactement la figure du modèle dans ta grille.', indice: 'Commence par une case du modèle : compte sa colonne et sa rangée, puis colorie la même case.', explication: 'La copie a les mêmes cases que le modèle.', verifier: () => verifCases(g, fig), montrer() { g.on.clear(); g.montrer([...fig]); } }; } },
  { titre: 'Glisser la figure (translation)', description: 'Déplace la figure de quelques cases.', manche(api) {
    const C = 9, R = 7, fig = figureCases(4, 3, hasard(3, 5)), dx = hasard(1, 4), dy = hasard(0, 3), dirX = 'vers la droite', dirY = 'vers le bas';
    const attendu = new Set([...fig].map(k => { const [x, y] = k.split(',').map(Number); return (x + dx) + ',' + (y + dy); }));
    const g = api.grille(C, R, { couleur: '#2e9c76', fixes: fig });
    const msg = dx + ' case' + (dx > 1 ? 's' : '') + ' ' + dirX + (dy ? ' et ' + dy + ' case' + (dy > 1 ? 's' : '') + ' ' + dirY : '');
    return { consigne: 'Fais glisser la figure violette de ' + msg + ' : colorie sa nouvelle position.', indice: 'Prends chaque case violette et compte ' + msg + '. La figure garde la même forme.', explication: 'Chaque case a bougé de ' + msg + '.',
      verifier() { const vis = new Set([...g.on, ...[...fig].filter(k => attendu.has(k))]); if (!g.on.size) return { manque: 'Touche des cases pour colorier la nouvelle figure.' }; return egal(vis, attendu) ? true : verifCases({ on: vis }, attendu); },
      montrer() { g.on.clear(); attendu.forEach(k => g.colorier(k, '#9fc9b4')); } }; } }];
Atelier.definir({ id: 'geoplan', titre: 'L’atelier des formes', icone: '🔷', couleur: '#7a5ad8', intro: 'Sur le géoplan et le quadrillage : reconnais les figures, compte leurs côtés et leurs sommets, fais des figures symétriques, reproduis-les et fais-les glisser.', niveaux });
})();
