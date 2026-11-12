/* 🏗️ The measuring site: measure with a ruler, perimeter, area, build rectangles. */
(function () {
const A = Atelier.api, { node, svg, hasard, pioche, melange } = A;
/* A ruler in centimetres and a plank to measure */
function regle(parent, debut, longueur) {
  const U = 40, W = 13 * U + 20, sv = svg('svg', { viewBox: '0 0 ' + W + ' 150', class: 'grille-svg', role: 'img', 'aria-label': 'Une planche au-dessus d’une règle' });
  sv.append(svg('rect', { x: 10 + debut * U, y: 20, width: longueur * U, height: 40, rx: 4, fill: '#c9a27e', stroke: '#7a5130', 'stroke-width': 3 }));
  for (let x = 10 + debut * U + 15; x < 10 + (debut + longueur) * U - 5; x += 30) sv.append(svg('line', { x1: x, y1: 25, x2: x + 12, y2: 55, stroke: '#a9805c', 'stroke-width': 2 }));
  sv.append(svg('rect', { x: 6, y: 72, width: 12 * U + 8, height: 60, rx: 6, fill: '#ffe08a', stroke: '#a86f00', 'stroke-width': 3 }));
  for (let i = 0; i <= 12; i++) { const x = 10 + i * U; sv.append(svg('line', { x1: x, y1: 72, x2: x, y2: 98, stroke: '#3d2800', 'stroke-width': 3 }));
    if (i < 12) sv.append(svg('line', { x1: x + U / 2, y1: 72, x2: x + U / 2, y2: 86, stroke: '#3d2800', 'stroke-width': 2 }));
    const t = svg('text', { x, y: 122, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 700, fill: '#3d2800', 'font-family': 'Arial' }); t.textContent = i; sv.append(t); }
  const t = svg('text', { x: 10 + 12 * U - 6, y: 92, 'text-anchor': 'end', 'font-size': 15, fill: '#3d2800', 'font-family': 'Arial' }); t.textContent = 'cm'; sv.append(t);
  parent.append(sv);
}
/* A rectangle drawn on a grid, with or without the side lengths */
function rectangle(parent, w, h, cotes, carres) {
  const T = Math.min(40, Math.floor(440 / Math.max(w, h))), m = 40, sv = svg('svg', { viewBox: '0 0 ' + (w * T + 2 * m) + ' ' + (h * T + 2 * m), class: 'grille-svg', role: 'img', 'aria-label': 'Un rectangle' });
  if (carres) for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) sv.append(svg('rect', { x: m + x * T, y: m + y * T, width: T, height: T, fill: '#d9efe4', stroke: '#7fbf9e', 'stroke-width': 1.5 }));
  sv.append(svg('rect', { x: m, y: m, width: w * T, height: h * T, fill: carres ? 'none' : '#e8f4ff', stroke: '#16324f', 'stroke-width': 4 }));
  if (cotes) { const t1 = svg('text', { x: m + w * T / 2, y: m - 10, 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: '#16324f', 'font-family': 'Arial' }); t1.textContent = w + ' m'; sv.append(t1);
    const t2 = svg('text', { x: m - 10, y: m + h * T / 2 + 7, 'text-anchor': 'end', 'font-size': 22, 'font-weight': 800, fill: '#16324f', 'font-family': 'Arial' }); t2.textContent = h + ' m'; sv.append(t2); }
  parent.append(sv);
}
/* Do the coloured cells form a full rectangle? */
function formeRect(on) {
  if (!on.size) return null; const P = [...on].map(k => k.split(',').map(Number)), xs = P.map(p => p[0]), ys = P.map(p => p[1]);
  const w = Math.max(...xs) - Math.min(...xs) + 1, h = Math.max(...ys) - Math.min(...ys) + 1; return w * h === on.size ? { w, h } : null;
}
const niveaux = [
  { titre: 'Mesurer une planche', description: 'La planche commence à 0.', manche(api) {
    const L = hasard(2, 12), z = node('div', 'zone'); api.zone().append(z); regle(z, 0, L); const i = api.champNombre('Longueur en centimètres');
    return { consigne: 'Quelle est la longueur de la planche ?', indice: 'Regarde le nombre de la règle au bout de la planche.', explication: 'La planche mesure ' + L + ' cm.', verifier: () => !i.value ? { manque: 'Écris la longueur.' } : +i.value === L, montrer() { i.value = L; i.classList.add('montree'); } }; } },
  { titre: 'Mesurer à partir d’un autre nombre', description: 'Attention : la planche ne commence pas à 0 !', manche(api) {
    const d = hasard(1, 5), L = hasard(2, 12 - d), z = node('div', 'zone'); api.zone().append(z); regle(z, d, L); const i = api.champNombre('Longueur en centimètres');
    return { consigne: 'Quelle est la longueur de la planche ?', indice: 'Compte les centimètres entre le début et la fin, ou fais ' + (d + L) + ' − ' + d + '.', explication: (d + L) + ' − ' + d + ' = ' + L + ' cm.', verifier: () => !i.value ? { manque: 'Écris la longueur.' } : +i.value === L ? true : { aide: +i.value === d + L ? 'La planche ne commence pas à 0 : enlève ' + d + '.' : '' }, montrer() { i.value = L; i.classList.add('montree'); } }; } },
  { titre: 'Le périmètre de la clôture', description: 'Le tour du jardin.', manche(api) {
    const w = hasard(2, 9), h = hasard(2, 6), P = 2 * (w + h), z = node('div', 'zone'); api.zone().append(z); rectangle(z, w, h, true, false); const i = api.champNombre('Périmètre en mètres');
    return { consigne: 'Il faut une clôture tout autour du jardin. Combien de mètres de clôture faut-il ?', indice: 'Le périmètre, c’est le tour : additionne les 4 côtés.', explication: w + ' + ' + h + ' + ' + w + ' + ' + h + ' = ' + P + ' m.', verifier: () => !i.value ? { manque: 'Écris le périmètre.' } : +i.value === P ? true : { aide: +i.value === w * h ? 'Ça, c’est l’aire. Le périmètre est le tour.' : +i.value === w + h ? 'Tu as additionné seulement 2 côtés : il y en a 4.' : '' }, montrer() { i.value = P; i.classList.add('montree'); } }; } },
  { titre: 'L’aire du plancher', description: 'Compter les carrés.', manche(api) {
    const w = hasard(2, 8), h = hasard(2, 5), z = node('div', 'zone'); api.zone().append(z); rectangle(z, w, h, true, true); const i = api.champNombre('Nombre de carrés');
    return { consigne: 'Combien de carreaux faut-il pour couvrir ce plancher ?', indice: 'Compte les carrés d’une rangée, puis multiplie par le nombre de rangées.', explication: h + ' rangées de ' + w + ' : ' + h + ' × ' + w + ' = ' + (w * h) + ' carreaux.', verifier: () => !i.value ? { manque: 'Écris le nombre de carreaux.' } : +i.value === w * h ? true : { aide: +i.value === 2 * (w + h) ? 'Ça, c’est le périmètre. L’aire, ce sont les carrés à l’intérieur.' : '' }, montrer() { i.value = w * h; i.classList.add('montree'); } }; } },
  { titre: 'Construire avec une aire', description: 'Colorie un rectangle.', manche(api) {
    const cible = pioche([6, 8, 10, 12, 15, 16, 18, 20]), g = api.grille(10, 7);
    const c = node('p', 'total', 'Carrés coloriés : 0'); api.champ().append(c); g.sv.addEventListener('click', () => { c.textContent = 'Carrés coloriés : ' + g.on.size; });
    const sol = (() => { for (let h = 1; h <= 7; h++) if (cible % h === 0 && cible / h <= 10 && cible / h >= h) { const w = cible / h; return [w, h]; } })();
    return { consigne: 'Construis une pièce rectangulaire de ' + cible + ' carrés : colorie un rectangle plein.', indice: 'Trouve deux nombres qui se multiplient pour faire ' + cible + ' : par exemple ' + sol[0] + ' × ' + sol[1] + '.', explication: 'Un rectangle de ' + sol[0] + ' sur ' + sol[1] + ' a ' + cible + ' carrés.',
      verifier() { if (!g.on.size) return { manque: 'Touche les cases pour les colorier.' }; const f = formeRect(g.on); if (!f) return { aide: 'Ce n’est pas un rectangle plein : les cases doivent former un rectangle sans trou.' }; return g.on.size === cible ? true : { aide: 'Ton rectangle a ' + g.on.size + ' carrés, il en faut ' + cible + '.' }; },
      montrer() { const s = []; for (let y = 0; y < sol[1]; y++) for (let x = 0; x < sol[0]; x++) s.push(x + ',' + y); g.montrer(s); } }; } },
  { titre: 'Construire avec un périmètre', description: 'Un rectangle avec un tour donné.', manche(api) {
    const w = hasard(2, 6), h = hasard(1, 4), P = 2 * (w + h), g = api.grille(10, 7);
    const c = node('p', 'total'); api.champ().append(c); const maj = () => { const f = formeRect(g.on); c.textContent = f ? 'Ton rectangle : ' + f.w + ' sur ' + f.h + ', périmètre ' + 2 * (f.w + f.h) : 'Colorie un rectangle plein.'; }; g.sv.addEventListener('click', maj); maj();
    return { consigne: 'Construis un rectangle dont le périmètre est de ' + P + ' cases.', indice: 'La longueur + la largeur doivent faire ' + (P / 2) + ' (la moitié du périmètre).', explication: 'Par exemple ' + w + ' sur ' + h + ' : ' + w + ' + ' + h + ' + ' + w + ' + ' + h + ' = ' + P + '.',
      verifier() { if (!g.on.size) return { manque: 'Touche les cases pour colorier un rectangle.' }; const f = formeRect(g.on); if (!f) return { aide: 'Ce n’est pas un rectangle plein.' }; return 2 * (f.w + f.h) === P ? true : { aide: 'Ton périmètre est ' + 2 * (f.w + f.h) + ', il faut ' + P + '.' }; },
      montrer() { g.on.clear(); const s = []; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) s.push(x + ',' + y); g.montrer(s); } }; } },
  { titre: 'Problèmes du chantier', description: 'Aire ou périmètre ? Réfléchis !', manche(api, k) {
    const w = hasard(3, 9), h = hasard(2, 6), aire = k % 2 === 0, z = node('div', 'zone'); api.zone().append(z); rectangle(z, w, h, true, false); const i = api.champNombre(aire ? 'Nombre de dalles' : 'Mètres de bordure');
    const r = aire ? w * h : 2 * (w + h);
    return { consigne: aire ? 'La terrasse mesure ' + w + ' m sur ' + h + ' m. Combien de dalles de 1 m sur 1 m faut-il pour la couvrir ?' : 'Le bac à sable mesure ' + w + ' m sur ' + h + ' m. Combien de mètres de bordure faut-il pour en faire le tour ?',
      indice: aire ? 'Couvrir une surface : c’est l’aire (longueur × largeur).' : 'Faire le tour : c’est le périmètre (additionne les 4 côtés).', explication: aire ? w + ' × ' + h + ' = ' + r + ' dalles.' : w + ' + ' + h + ' + ' + w + ' + ' + h + ' = ' + r + ' m.',
      verifier: () => !i.value ? { manque: 'Écris ta réponse.' } : +i.value === r, montrer() { i.value = r; i.classList.add('montree'); } }; } }];
Atelier.definir({ id: 'chantier', titre: 'Le chantier des mesures', icone: '🏗️', couleur: '#a35a0b', intro: 'Mesure des planches, calcule le tour d’un jardin (le périmètre) et le nombre de carreaux d’un plancher (l’aire), puis construis toi-même des rectangles.', niveaux });
})();
