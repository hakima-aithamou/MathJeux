/* 📊 The class survey: tally marks, pictographs, bar graphs. */
(function () {
const A = Atelier.api, { node, svg, hasard, pioche, melange } = A;
const SONDAGES = [
  { q: 'Quel est ton fruit préféré ?', cats: [['🍎', 'la pomme'], ['🍌', 'la banane'], ['🍓', 'la fraise'], ['🍇', 'le raisin']] },
  { q: 'Quel est ton animal préféré ?', cats: [['🐶', 'le chien'], ['🐱', 'le chat'], ['🐰', 'le lapin'], ['🐠', 'le poisson']] },
  { q: 'Quel est ton sport préféré ?', cats: [['⚽', 'le soccer'], ['🏒', 'le hockey'], ['🏀', 'le basketball'], ['🏊', 'la natation']] },
  { q: 'Comment viens-tu à l’école ?', cats: [['🚌', 'en autobus'], ['🚗', 'en auto'], ['🚶', 'à pied'], ['🚲', 'à vélo']] }];
const donnees = (min, max) => { const s = pioche(SONDAGES); let v; do { v = s.cats.map(() => hasard(min, max)); } while (new Set(v).size < v.length); return { s, v }; };
const nomCourt = c => c[1].replace(/^(le |la |l’|en |à )/, '');
/* Tally marks: groups of 5 */
function pointage(n) { const sp = node('span', 'pointage'); sp.setAttribute('aria-label', n + ' marques'); let t = ''; for (let i = 0; i < Math.floor(n / 5); i++) t += '卌 '; t += '|'.repeat(n % 5); sp.textContent = t.trim(); return sp; }
function tableau(s, v, rendre) { const t = node('table', 'horaire'); t.innerHTML = '<caption>' + s.q + '</caption>'; const tb = node('tbody'); s.cats.forEach((c, i) => { const tr = node('tr'), a = node('td', null, c[0] + ' ' + nomCourt(c)), b = node('td'); b.append(rendre(v[i])); tr.append(a, b); tb.append(tr); }); t.append(tb); return t; }
/* Bar graph (reading or building) */
function bandes(parent, s, v, max, construire) {
  const n = s.cats.length, U = 30, H = max * U, W = 70 + n * 90, sv = svg('svg', { viewBox: '0 0 ' + W + ' ' + (H + 80), class: 'grille-svg', role: 'group', 'aria-label': 'Diagramme à bandes : ' + s.q });
  const tt = svg('text', { x: W / 2, y: 18, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: '#16324f', 'font-family': 'Arial' }); tt.textContent = s.q; sv.append(tt);
  const Y = h => 30 + H - h * U;
  for (let h = 0; h <= max; h++) { sv.append(svg('line', { x1: 50, y1: Y(h), x2: W - 10, y2: Y(h), stroke: h ? '#dbe5ec' : '#16324f', 'stroke-width': h ? 1.5 : 3 })); const t = svg('text', { x: 40, y: Y(h) + 6, 'text-anchor': 'end', 'font-size': 16, 'font-weight': 700, fill: '#16324f', 'font-family': 'Arial' }); t.textContent = h; sv.append(t); }
  const val = construire ? s.cats.map(() => 0) : v.slice(), barres = [];
  const coul = ['#e0573f', '#f2b134', '#2e9c76', '#2364aa'];
  s.cats.forEach((c, i) => { const x = 70 + i * 90, b = svg('rect', { x, y: Y(val[i]), width: 56, height: val[i] * U, fill: coul[i % 4], rx: 3 }); sv.append(b); barres.push(b);
    const e = svg('text', { x: x + 28, y: Y(0) + 32, 'text-anchor': 'middle', 'font-size': 26 }); e.textContent = c[0]; sv.append(e);
    if (construire) for (let h = 1; h <= max; h++) { const z = svg('rect', { x, y: Y(h), width: 56, height: U, fill: 'transparent', class: 'cel', tabindex: 0, role: 'button', 'aria-label': nomCourt(c) + ' : ' + h });
      const f = () => { if (A.resolu()) return; val[i] = val[i] === h ? h - 1 : h; b.setAttribute('y', Y(val[i])); b.setAttribute('height', val[i] * U); A.son('clic'); };
      z.addEventListener('click', f); z.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); f(); } }); sv.append(z); } });
  parent.append(sv);
  return { val, montrer(w) { w.forEach((h, i) => { val[i] = h; barres[i].setAttribute('y', Y(h)); barres[i].setAttribute('height', h * U); }); } };
}
function choixReponse(api, opts, bon, aides) { const f = api.choix(opts.map(String)); return { f, verifier: () => f() === null ? { manque: 'Choisis une réponse.' } : opts[f()] === bon ? true : { aide: (aides && aides(opts[f()])) || '' }, montrer() { f.boutons()[opts.indexOf(bon)].classList.add('bonne'); } }; }
const prochesDe = (b, n) => melange([...new Set([b, b + 1, b - 1, b + 2, b + 5].filter(x => x >= 0))].slice(0, n || 4));
const niveaux = [
  { titre: 'Les marques de pointage', description: 'Compter par groupes de 5.', manche(api) {
    const { s, v } = donnees(3, 14), i = hasard(0, 3), z = node('div', 'zone'); api.zone().append(z); z.append(tableau(s, v, pointage)); const c = api.champNombre('Nombre d’élèves');
    return { consigne: 'Combien d’élèves ont choisi ' + s.cats[i][0] + ' ' + s.cats[i][1] + ' ?', indice: 'Chaque paquet 卌 vaut 5. Compte de 5 en 5, puis ajoute les petits bâtons.', explication: Math.floor(v[i] / 5) + ' paquet' + (v[i] >= 10 ? 's' : '') + ' de 5 et ' + (v[i] % 5) + ' bâton' + (v[i] % 5 > 1 ? 's' : '') + ' : ' + v[i] + '.',
      verifier: () => !c.value ? { manque: 'Écris un nombre.' } : +c.value === v[i], montrer() { c.value = v[i]; c.classList.add('montree'); } }; } },
  { titre: 'Lire un pictogramme', description: 'Un symbole vaut 1, puis 2.', manche(api, k) {
    const val = k < 3 ? 1 : 2, { s, v } = donnees(1, 8), vv = v.map(x => x * val), i = hasard(0, 3), z = node('div', 'zone'); api.zone().append(z);
    z.append(tableau(s, v, n => node('span', 'picto', '😀'.repeat(n)))); z.append(node('p', 'etiquette', 'Légende : 😀 = ' + val + ' élève' + (val > 1 ? 's' : '')));
    const c = api.champNombre('Nombre d’élèves');
    return { consigne: 'Combien d’élèves ont choisi ' + s.cats[i][0] + ' ' + s.cats[i][1] + ' ?', indice: val === 1 ? 'Compte les visages.' : 'Chaque visage vaut 2 : compte de 2 en 2.', explication: v[i] + ' visage' + (v[i] > 1 ? 's' : '') + (val > 1 ? ' × 2 = ' + vv[i] : '') + ' : ' + vv[i] + ' élève' + (vv[i] > 1 ? 's' : '') + '.',
      verifier: () => !c.value ? { manque: 'Écris un nombre.' } : +c.value === vv[i] ? true : { aide: val > 1 && +c.value === v[i] ? 'Regarde la légende : un visage vaut 2 élèves.' : '' }, montrer() { c.value = vv[i]; c.classList.add('montree'); } }; } },
  { titre: 'Lire un diagramme à bandes', description: 'Le plus, le moins, combien.', manche(api, k) {
    const { s, v } = donnees(1, 10), z = node('div', 'zone'); api.zone().append(z); bandes(z, s, v, 10, false); const t = k % 3;
    if (t === 2) { const i = hasard(0, 3), r = choixReponse(api, prochesDe(v[i]), v[i]); return { consigne: 'Combien d’élèves ont choisi ' + s.cats[i][0] + ' ' + s.cats[i][1] + ' ?', indice: 'Suis le haut de la bande jusqu’aux nombres à gauche.', explication: 'La bande monte jusqu’à ' + v[i] + '.', verifier: r.verifier, montrer: r.montrer }; }
    const m = t === 0 ? Math.max(...v) : Math.min(...v), i = v.indexOf(m), opts = s.cats.map(c => c[0] + ' ' + nomCourt(c)), f = api.choix(opts);
    return { consigne: t === 0 ? 'Quel est le choix le plus populaire ?' : 'Quel choix a reçu le moins de votes ?', indice: t === 0 ? 'Cherche la bande la plus haute.' : 'Cherche la bande la plus basse.', explication: opts[i] + ' : ' + m + ' vote' + (m > 1 ? 's' : '') + '.',
      verifier: () => f() === null ? { manque: 'Choisis une réponse.' } : f() === i, montrer() { f.boutons()[i].classList.add('bonne'); } }; } },
  { titre: 'Construire le diagramme', description: 'Monte les bandes à la bonne hauteur.', manche(api) {
    const { s, v } = donnees(1, 8), z = node('div', 'zone'); api.zone().append(z); z.append(tableau(s, v, n => node('span', null, String(n)))); const b = bandes(z, s, v, 8, true);
    return { consigne: 'Construis le diagramme à bandes avec les résultats du tableau : touche la bonne hauteur pour chaque bande.', indice: 'Pour chaque choix, lis le nombre dans le tableau et touche cette hauteur dans sa colonne.', explication: 'Chaque bande monte jusqu’au nombre du tableau.',
      verifier() { if (b.val.every(x => x === 0)) return { manque: 'Touche les colonnes pour monter les bandes.' }; const faux = b.val.findIndex((x, i) => x !== v[i]); return faux < 0 ? true : { aide: 'Vérifie la bande de ' + s.cats[faux][0] + ' : il faut ' + v[faux] + '.' }; }, montrer: () => b.montrer(v) }; } },
  { titre: 'Combien de plus ?', description: 'Comparer deux bandes.', manche(api) {
    const { s, v } = donnees(1, 10), z = node('div', 'zone'); api.zone().append(z); bandes(z, s, v, 10, false); let i, j; do { i = hasard(0, 3); j = hasard(0, 3); } while (v[i] <= v[j]);
    const d = v[i] - v[j], c = api.champNombre('Différence');
    return { consigne: 'Combien d’élèves de plus ont choisi ' + s.cats[i][0] + ' ' + s.cats[i][1] + ' que ' + s.cats[j][0] + ' ' + s.cats[j][1] + ' ?', indice: 'Lis les deux nombres, puis fais une soustraction : ' + v[i] + ' − ' + v[j] + '.', explication: v[i] + ' − ' + v[j] + ' = ' + d + '.',
      verifier: () => !c.value ? { manque: 'Écris un nombre.' } : +c.value === d ? true : { aide: +c.value === v[i] + v[j] ? 'Tu as additionné. « Combien de plus » : on soustrait.' : '' }, montrer() { c.value = d; c.classList.add('montree'); } }; } },
  { titre: 'Faire l’enquête', description: 'Compter les votes de la classe.', manche(api) {
    const { s, v } = donnees(1, 6), votes = melange(v.flatMap((n, i) => Array(n).fill(s.cats[i][0]))), i = hasard(0, 3), tot = v.reduce((a, b) => a + b), demande = pioche(['une', 'total']);
    const z = node('div', 'zone'); api.zone().append(z); z.append(node('p', 'etiquette', s.q)); const r = node('div', 'votes'); votes.forEach(e => r.append(node('span', 'vote', e))); z.append(r);
    const c = api.champNombre(demande === 'total' ? 'Nombre d’élèves' : 'Nombre de votes');
    return { consigne: demande === 'total' ? 'Chaque dessin est le vote d’un élève. Combien d’élèves ont répondu au sondage ?' : 'Chaque dessin est le vote d’un élève. Combien d’élèves ont choisi ' + s.cats[i][0] + ' ' + s.cats[i][1] + ' ?', indice: demande === 'total' ? 'Compte tous les votes. Tu peux faire des groupes de 5.' : 'Compte seulement les ' + s.cats[i][0] + '. Fais une marque de pointage pour chacun.', explication: demande === 'total' ? v.join(' + ') + ' = ' + tot + ' élèves.' : 'Il y a ' + v[i] + ' fois ' + s.cats[i][0] + '.',
      verifier: () => !c.value ? { manque: 'Écris un nombre.' } : +c.value === (demande === 'total' ? tot : v[i]), montrer() { c.value = demande === 'total' ? tot : v[i]; c.classList.add('montree'); } }; } }];
Atelier.definir({ id: 'enquete', titre: 'L’enquête de la classe', icone: '📊', couleur: '#2364aa', intro: 'Tu fais un sondage dans la classe ! Compte les votes, lis les marques de pointage, les pictogrammes et les diagrammes à bandes, puis construis ton propre diagramme.', niveaux });
})();
