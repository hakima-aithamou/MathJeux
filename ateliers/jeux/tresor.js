/* 🧭 The treasure hunt: finding your way on a map (cells like A1, moves, coordinates). */
(function () {
const A = Atelier.api, { node, svg, hasard, pioche, melange } = A;
const LET = 'ABCDEFGH';
const DECOR = ['🌳', '🏠', '🌲', '⛲', '🪨', '🌷', '🏫', '🚗'];
/* Grid map: columns A…, rows 1… (1 at the bottom). Returns the cell touched. */
function planCases(parent, C, R, marques, clic) {
  const T = 56, m = 34, sv = svg('svg', { viewBox: '0 0 ' + (C * T + m + 4) + ' ' + (R * T + m + 4), class: 'grille-svg', role: 'group', 'aria-label': 'Un plan de ' + C + ' colonnes et ' + R + ' lignes' });
  let choisie = null, rects = {};
  for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) {
    const nom = LET[x] + (R - y), r = svg('rect', { x: m + x * T, y: 2 + y * T, width: T, height: T, fill: (x + y) % 2 ? '#e9f5e1' : '#f4faef', stroke: '#9fb79a', 'stroke-width': 1.5 }); sv.append(r); rects[nom] = r;
    if (marques[nom]) { const t = svg('text', { x: m + x * T + T / 2, y: 2 + y * T + T / 2 + 12, 'text-anchor': 'middle', 'font-size': 32 }); t.textContent = marques[nom]; t.style.pointerEvents = 'none'; sv.append(t); }
    if (clic) { r.setAttribute('class', 'cel'); r.setAttribute('tabindex', '0'); r.setAttribute('role', 'button'); r.setAttribute('aria-label', 'Case ' + nom);
      const choisir = () => { if (A.resolu()) return; if (choisie) rects[choisie].setAttribute('stroke', '#9fb79a'), rects[choisie].setAttribute('stroke-width', 1.5); choisie = nom; r.setAttribute('stroke', '#e0573f'); r.setAttribute('stroke-width', 5); A.son('clic'); };
      r.addEventListener('click', choisir); r.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choisir(); } }); }
  }
  for (let x = 0; x < C; x++) { const t = svg('text', { x: m + x * T + T / 2, y: R * T + 28, 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: '#2b5d2b', 'font-family': 'Arial' }); t.textContent = LET[x]; sv.append(t); }
  for (let y = 0; y < R; y++) { const t = svg('text', { x: m / 2, y: 2 + y * T + T / 2 + 8, 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: '#2b5d2b', 'font-family': 'Arial' }); t.textContent = R - y; sv.append(t); }
  parent.append(sv);
  return { choisie: () => choisie, montrer(nom) { rects[nom].setAttribute('fill', '#ffd36b'); } };
}
/* Cartesian plane: points at the intersections, from min to max */
function planXY(parent, min, max, marques, clic) {
  const n = max - min, S = Math.min(52, Math.floor(460 / n)), M = 34, W = n * S + 2 * M, sv = svg('svg', { viewBox: '0 0 ' + W + ' ' + W, class: 'grille-svg', role: 'group', 'aria-label': 'Un plan avec des axes de ' + min + ' à ' + max });
  const X = v => M + (v - min) * S, Y = v => M + (max - v) * S; let choisi = null, rond = null;
  for (let v = min; v <= max; v++) { sv.append(svg('line', { x1: X(v), y1: Y(min), x2: X(v), y2: Y(max), stroke: v === 0 ? '#2364aa' : '#dbe5ec', 'stroke-width': v === 0 ? 3 : 1.5 }), svg('line', { x1: X(min), y1: Y(v), x2: X(max), y2: Y(v), stroke: v === 0 ? '#c8372d' : '#dbe5ec', 'stroke-width': v === 0 ? 3 : 1.5 }));
    if (v !== 0 || min === 0) { const a = svg('text', { x: X(v), y: Y(Math.max(min, 0)) + 22, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: '#c8372d', 'font-family': 'Arial' }); a.textContent = v < 0 ? '−' + (-v) : v; sv.append(a);
      if (v !== 0) { const b = svg('text', { x: X(Math.max(min, 0)) - 12, y: Y(v) + 5, 'text-anchor': 'end', 'font-size': 15, 'font-weight': 700, fill: '#2364aa', 'font-family': 'Arial' }); b.textContent = v < 0 ? '−' + (-v) : v; sv.append(b); } } }
  for (const [k, e] of Object.entries(marques)) { const [x, y] = k.split(',').map(Number), t = svg('text', { x: X(x), y: Y(y) + 11, 'text-anchor': 'middle', 'font-size': 30 }); t.textContent = e; t.style.pointerEvents = 'none'; sv.append(t); }
  if (clic) { const zone = svg('rect', { x: 0, y: 0, width: W, height: W, fill: 'transparent' }); sv.prepend(zone);
    sv.addEventListener('click', e => { if (A.resolu()) return; const p = sv.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const q = p.matrixTransform(sv.getScreenCTM().inverse());
      const x = Math.max(min, Math.min(max, Math.round((q.x - M) / S) + min)), y = Math.max(min, Math.min(max, max - Math.round((q.y - M) / S))); choisi = [x, y];
      if (rond) rond.remove(); rond = svg('circle', { cx: X(x), cy: Y(y), r: 10, fill: '#e0573f', stroke: '#16324f', 'stroke-width': 3 }); sv.append(rond); A.son('clic'); }); }
  parent.append(sv);
  return { choisi: () => choisi, montrer([x, y]) { if (rond) rond.remove(); rond = svg('circle', { cx: X(x), cy: Y(y), r: 12, fill: '#ffd36b', stroke: '#16324f', 'stroke-width': 3 }); sv.append(rond); } };
}
const nomCase = (x, y) => LET[x] + y;
const coord = (x, y) => '(' + (x < 0 ? '−' + -x : x) + ', ' + (y < 0 ? '−' + -y : y) + ')';
function decor(C, R, n, eviter) { const m = {}; for (let i = 0; i < n; i++) { const x = hasard(0, C - 1), y = hasard(1, R), k = nomCase(x, y); if (!eviter.includes(k)) m[k] = pioche(DECOR); } return m; }
const niveaux = [
  { titre: 'Trouver une case', description: 'Le trésor est en C4 : touche la case.', manche(api) {
    const C = 6, R = 5, x = hasard(0, C - 1), y = hasard(1, R), cible = nomCase(x, y), z = node('div', 'zone'); api.zone().append(z); const p = planCases(z, C, R, decor(C, R, 6, [cible]), true);
    return { consigne: 'Le trésor est caché dans la case ' + cible + '. Touche cette case.', indice: 'Trouve la lettre ' + LET[x] + ' en bas, puis monte jusqu’au nombre ' + y + '.', explication: 'Le trésor était en ' + cible + ' 💰.',
      verifier: () => !p.choisie() ? { manque: 'Touche une case du plan.' } : p.choisie() === cible, montrer: () => p.montrer(cible) }; } },
  { titre: 'Nommer une case', description: 'Où est le coffre ?', manche(api) {
    const C = 6, R = 5, x = hasard(0, C - 1), y = hasard(1, R), cible = nomCase(x, y), m = decor(C, R, 5, [cible]); m[cible] = '💰';
    const z = node('div', 'zone'); api.zone().append(z); planCases(z, C, R, m, false);
    const opts = melange([cible, nomCase(Math.min(C - 1, x + 1), y), nomCase(x, y === R ? y - 1 : y + 1), y <= C && x < R ? nomCase(y - 1, x + 1) : nomCase(Math.max(0, x - 1), y)].filter((v, i, a) => a.indexOf(v) === i)); const f = api.choix(opts);
    return { consigne: 'Dans quelle case est le coffre 💰 ?', indice: 'D’abord la lettre (en bas), puis le nombre (sur le côté).', explication: 'Le coffre est en ' + cible + '.',
      verifier: () => f() === null ? { manque: 'Choisis une réponse.' } : opts[f()] === cible, montrer() { f.boutons()[opts.indexOf(cible)].classList.add('bonne'); } }; } },
  { titre: 'Suivre les pas', description: '3 cases à droite, 2 cases vers le haut…', manche(api) {
    const C = 7, R = 6, x0 = hasard(0, 2), y0 = hasard(1, 3), dx = hasard(1, C - 1 - x0), dy = hasard(1, R - y0), cible = nomCase(x0 + dx, y0 + dy), m = decor(C, R, 5, [nomCase(x0, y0), cible]); m[nomCase(x0, y0)] = '🧒';
    const z = node('div', 'zone'); api.zone().append(z); const p = planCases(z, C, R, m, true);
    return { consigne: 'Pars de l’enfant 🧒. Avance de ' + dx + ' case' + (dx > 1 ? 's' : '') + ' vers la droite, puis de ' + dy + ' case' + (dy > 1 ? 's' : '') + ' vers le haut. Touche la case où tu arrives.', indice: 'Compte les cases avec ton doigt : d’abord vers la droite, puis vers le haut.', explication: 'Tu arrives en ' + cible + '.',
      verifier: () => !p.choisie() ? { manque: 'Touche la case d’arrivée.' } : p.choisie() === cible, montrer: () => p.montrer(cible) }; } },
  { titre: 'Placer un point (x, y)', description: 'Le premier quadrant, de 0 à 8.', manche(api) {
    const x = hasard(0, 8), y = hasard(0, 8), z = node('div', 'zone'); api.zone().append(z); const p = planXY(z, 0, 8, {}, true);
    return { consigne: 'Le trésor est au point ' + coord(x, y) + '. Touche ce point sur le plan.', indice: 'Le premier nombre : avance de ' + x + ' vers la droite (axe rouge). Le deuxième : monte de ' + y + ' (axe bleu).', explication: 'Le point ' + coord(x, y) + ' : ' + x + ' vers la droite, ' + y + ' vers le haut.',
      verifier() { const c = p.choisi(); if (!c) return { manque: 'Touche un point du plan.' }; return c[0] === x && c[1] === y ? true : { aide: c[0] === y && c[1] === x ? 'Tu as inversé : le premier nombre va vers la droite.' : '' }; }, montrer: () => p.montrer([x, y]) }; } },
  { titre: 'Lire les coordonnées', description: 'Où est le coffre ?', manche(api) {
    const x = hasard(1, 8), y = hasard(1, 8), m = {}; m[x + ',' + y] = '💰'; const z = node('div', 'zone'); api.zone().append(z); planXY(z, 0, 8, m, false);
    const opts = melange([...new Set([coord(x, y), coord(y, x) === coord(x, y) ? coord(x + (x < 8 ? 1 : -1), y) : coord(y, x), coord(x, Math.max(0, y - 1)), coord(Math.max(0, x - 1), y)])]); const f = api.choix(opts);
    return { consigne: 'Quelles sont les coordonnées du coffre 💰 ?', indice: 'Descends tout droit jusqu’à l’axe rouge : c’est le premier nombre.', explication: 'Le coffre est en ' + coord(x, y) + '.',
      verifier: () => f() === null ? { manque: 'Choisis une réponse.' } : opts[f()] === coord(x, y), montrer() { f.boutons()[opts.indexOf(coord(x, y))].classList.add('bonne'); } }; } },
  { titre: 'Les quatre parties du plan', description: 'Avec des nombres négatifs.', manche(api) {
    let x, y; do { x = hasard(-5, 5); y = hasard(-5, 5); } while (x === 0 || y === 0 || (x > 0 && y > 0 && Math.random() < .7));
    const z = node('div', 'zone'); api.zone().append(z); const p = planXY(z, -5, 5, {}, true);
    return { consigne: 'Le trésor est au point ' + coord(x, y) + '. Touche ce point.', oral: 'Le trésor est au point ' + x + ', ' + y + '. Touche ce point.', indice: 'Le signe − veut dire : vers la gauche (pour x) ou vers le bas (pour y). On part du centre (0, 0).', explication: coord(x, y) + ' : ' + Math.abs(x) + (x < 0 ? ' vers la gauche' : ' vers la droite') + ', ' + Math.abs(y) + (y < 0 ? ' vers le bas.' : ' vers le haut.'),
      verifier() { const c = p.choisi(); if (!c) return { manque: 'Touche un point du plan.' }; return c[0] === x && c[1] === y ? true : { aide: c[0] === -x || c[1] === -y ? 'Regarde bien le signe de chaque nombre.' : '' }; }, montrer: () => p.montrer([x, y]) }; } }];
Atelier.definir({ id: 'tresor', titre: 'La chasse au trésor', icone: '🧭', couleur: '#2e7d4f', intro: 'Lis les indices et trouve les trésors cachés sur le plan : des cases comme C4, des pas à suivre, puis des coordonnées (x, y).', niveaux });
})();
