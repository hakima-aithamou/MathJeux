/* 🍕 The fraction pizzeria: cut the pizzas into equal parts and serve the orders. */
(function () {
const A = Atelier.api, { node, svg, hasard, pioche, melange } = A;
const F = (n, d) => '[' + n + '/' + d + ']';
const GARNITURES = [['au pepperoni', '#c0392b', 'du pepperoni'], ['aux champignons', '#a9805c', 'des champignons'], ['aux poivrons', '#3f9a4a', 'des poivrons'], ['à l’ananas', '#f2c94c', 'de l’ananas']];
/* A pizza cut into d parts; touch the parts to add the topping */
function pizza(parent, d, opts) {
  opts = opts || {}; const R = 120, sv = svg('svg', { viewBox: '0 0 280 280', class: 'grille-svg pizza', role: 'group', 'aria-label': 'Une pizza coupée en ' + d + ' parts' }); sv.style.maxWidth = '300px';
  sv.append(svg('circle', { cx: 140, cy: 140, r: R + 12, fill: '#d99a4e' }));
  const parts = [], on = new Set(), coul = opts.couleur || '#c0392b';
  for (let k = 0; k < d; k++) {
    const a0 = -Math.PI / 2 + k * 2 * Math.PI / d, a1 = a0 + 2 * Math.PI / d, g = svg('g', { class: opts.fixe ? '' : 'cel', tabindex: opts.fixe ? -1 : 0, role: opts.fixe ? 'img' : 'button', 'aria-label': 'Part ' + (k + 1) });
    const chemin = d === 1 ? null : 'M140 140 L' + (140 + R * Math.cos(a0)) + ' ' + (140 + R * Math.sin(a0)) + ' A' + R + ' ' + R + ' 0 0 1 ' + (140 + R * Math.cos(a1)) + ' ' + (140 + R * Math.sin(a1)) + ' Z';
    g.append(chemin ? svg('path', { d: chemin, fill: '#f6d27a', stroke: '#8a5a2a', 'stroke-width': 3 }) : svg('circle', { cx: 140, cy: 140, r: R, fill: '#f6d27a', stroke: '#8a5a2a', 'stroke-width': 3 }));
    const am = (a0 + a1) / 2, gar = svg('g', { opacity: 0 });
    for (const [rr, da] of [[.35, 0], [.65, -.18], [.65, .18], [.85, 0]]) { const a = am + da * (4 / Math.max(4, d)); gar.append(svg('circle', { cx: 140 + R * rr * Math.cos(a), cy: 140 + R * rr * Math.sin(a), r: d > 6 ? 8 : 11, fill: coul, stroke: '#00000033' })); }
    g.append(gar); sv.append(g); parts.push({ g, gar });
    const basculer = (forcer) => { const v = forcer !== undefined ? forcer : !on.has(k); v ? on.add(k) : on.delete(k); gar.setAttribute('opacity', v ? 1 : 0); };
    parts[k].basculer = basculer;
    if (!opts.fixe) { g.style.cursor = 'pointer'; g.addEventListener('click', () => { if (A.resolu()) return; basculer(); A.son('clic'); opts.change && opts.change(on); });
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!A.resolu()) basculer(); } }); }
    if (opts.n !== undefined && k < opts.n) basculer(true);
  }
  parent.append(sv); return { on, parts, sv, montrer(n) { parts.forEach((p, k) => p.basculer(k < n)); } };
}
const commande = (n, d, g) => { const c = node('div', 'commande'); c.append(node('span', 'emo', '🧾'), node('span', null, 'Commande : ' + F(n, d) + ' de pizza ' + g)); return c; };
const niveaux = [
  { titre: 'Un demi, un tiers, un quart', description: 'Une seule part garnie.', manche(api) {
    const d = pioche([2, 3, 4]), [g, c, du] = pioche(GARNITURES), z = node('div', 'zone'); api.zone().append(z); z.append(commande(1, d, g)); const p = pizza(z, d, { couleur: c });
    return { consigne: 'La pizza est coupée en ' + d + ' parts égales. Mets ' + du + ' sur ' + F(1, d) + ' de la pizza.', oral: 'Mets la garniture sur ' + A.fracMots(1, d) + ' de la pizza.', indice: F(1, d) + ' : une part sur ' + d + '.', explication: 'Une part sur ' + d + ' : ' + F(1, d) + '.',
      verifier: () => !p.on.size ? { manque: 'Touche une part de la pizza.' } : p.on.size === 1, montrer: () => p.montrer(1) }; } },
  { titre: 'Servir la commande', description: 'Plusieurs parts garnies.', manche(api) {
    const d = pioche([3, 4, 5, 6, 8]), n = hasard(2, d - 1), [g, c, du] = pioche(GARNITURES), z = node('div', 'zone'); api.zone().append(z); z.append(commande(n, d, g)); const p = pizza(z, d, { couleur: c });
    return { consigne: 'Mets ' + du + ' sur ' + F(n, d) + ' de la pizza.', oral: 'Mets la garniture sur ' + A.fracMots(n, d) + ' de la pizza.', indice: 'La pizza a ' + d + ' parts : garnis-en ' + n + '.', explication: n + ' parts sur ' + d + ' : ' + F(n, d) + '.',
      verifier: () => !p.on.size ? { manque: 'Touche les parts de la pizza.' } : p.on.size === n, montrer: () => p.montrer(n) }; } },
  { titre: 'Couper, puis garnir', description: 'Choisis d’abord en combien de parts couper.', manche(api) {
    const d = pioche([2, 3, 4, 6, 8]), n = hasard(1, d - 1), [g, c, du] = pioche(GARNITURES), z = node('div', 'zone'); api.zone().append(z); z.append(commande(n, d, g));
    const boite = node('div'), rang = node('div', 'rangee'); let p = null, coupe = 0;
    [2, 3, 4, 6, 8].forEach(x => { const b = node('button', 'choix-bouton', 'Couper en ' + x); b.type = 'button'; b.onclick = () => { if (api.resolu()) return; coupe = x; boite.replaceChildren(); p = pizza(boite, x, { couleur: c }); rang.querySelectorAll('button').forEach(o => o.setAttribute('aria-pressed', String(o === b))); api.son('clic'); }; rang.append(b); });
    z.append(node('p', 'etiquette', '1. Coupe la pizza :'), rang, node('p', 'etiquette', '2. Garnis les parts :'), boite); p = pizza(boite, 1, { couleur: c, fixe: true });
    return { consigne: 'Prépare ' + F(n, d) + ' de pizza ' + g + ' : coupe la pizza, puis garnis les bonnes parts.', oral: 'Prépare ' + A.fracMots(n, d) + ' de pizza : coupe la pizza, puis garnis les parts.', indice: 'Le nombre du bas, ' + d + ', dit en combien de parts couper. Le nombre du haut, ' + n + ', dit combien de parts garnir.', explication: 'Coupe en ' + d + ', garnis ' + n + ' parts : ' + F(n, d) + '.',
      verifier() { if (!coupe) return { manque: 'Choisis d’abord en combien de parts couper la pizza.' }; if (!p.on.size) return { manque: 'Touche les parts à garnir.' }; return p.on.size * d === n * coupe ? true : { aide: coupe !== d && (n * coupe) % d ? 'Coupe la pizza en ' + d + ' parts.' : 'Compte les parts garnies.' }; },
      montrer() { boite.replaceChildren(); p = pizza(boite, d, { couleur: c, fixe: true, n }); coupe = d; } }; } },
  { titre: 'Des fractions équivalentes', description: 'La même quantité avec plus de parts.', manche(api) {
    const [n, d, D] = pioche([[1, 2, 4], [1, 2, 6], [1, 2, 8], [1, 3, 6], [2, 3, 6], [1, 4, 8], [3, 4, 8]]), [g, c, du] = pioche(GARNITURES), z = node('div', 'zone'); api.zone().append(z); z.append(commande(n, d, g)); const p = pizza(z, D, { couleur: c }), N = n * D / d;
    return { consigne: 'Le client veut ' + F(n, d) + ' de pizza ' + g + ', mais la pizza est coupée en ' + D + ' parts. Garnis la bonne quantité.', oral: 'Le client veut ' + A.fracMots(n, d) + ', mais la pizza a ' + D + ' parts. Garnis la bonne quantité.', indice: F(n, d) + ' = ' + F(N, D) + ' : chaque part de ' + F(1, d) + ' est coupée en ' + (D / d) + '.', explication: F(n, d) + ' = ' + F(N, D) + ' : il faut ' + N + ' parts sur ' + D + '.',
      verifier: () => !p.on.size ? { manque: 'Touche les parts de la pizza.' } : p.on.size === N, montrer: () => p.montrer(N) }; } },
  { titre: 'Qui en a mangé le plus ?', description: 'Comparer deux fractions.', manche(api) {
    let a, b, c, d; do { if (Math.random() < .5) { c = d = pioche([4, 6, 8]); a = hasard(1, c - 1); b = hasard(1, d - 1); } else { a = b = hasard(1, 2); c = pioche([3, 4, 6, 8]); d = pioche([3, 4, 6, 8]); } } while (a / c === b / d || a >= c || b >= d);
    const z = node('div', 'rangee'); api.zone().append(z);
    const n1 = pioche(['Léa', 'Sami', 'Maya']), n2 = pioche(['Noah', 'Inès', 'Adam']);
    [[n1, a, c], [n2, b, d]].forEach(([nom, n, dd]) => { const box = node('div', 'zone'); box.append(node('p', 'etiquette', nom + ' a mangé ' + F(n, dd))); pizza(box, dd, { fixe: true, n, couleur: '#8a5a2a' }); z.append(box); });
    const f = api.choix([n1, n2]), bon = a / c > b / d ? 0 : 1;
    return { consigne: 'Les parts brunes sont mangées. Qui a mangé le plus de pizza ?', oral: n1 + ' a mangé ' + A.fracMots(a, c) + '. ' + n2 + ' a mangé ' + A.fracMots(b, d) + '. Qui a mangé le plus ?', indice: c === d ? 'Les parts ont la même grandeur : compare le nombre de parts.' : 'Plus la pizza est coupée en beaucoup de parts, plus chaque part est petite.', explication: (bon ? n2 : n1) + ' a mangé le plus : ' + (bon ? F(b, d) + ' > ' + F(a, c) : F(a, c) + ' > ' + F(b, d)) + '.',
      verifier: () => f() === null ? { manque: 'Choisis un nom.' } : f() === bon, montrer() { f.boutons()[bon].classList.add('bonne'); } }; } },
  { titre: 'Partager les pointes', description: 'Une fraction d’un groupe de pointes.', manche(api) {
    const d = pioche([2, 3, 4]), tot = d * hasard(2, 3), n = hasard(1, d - 1), z = node('div', 'zone'); api.zone().append(z); const p = pizza(z, tot, { couleur: '#3f9a4a' }), N = n * tot / d;
    return { consigne: 'La pizza a ' + tot + ' pointes. Donne ' + F(n, d) + ' des pointes à la table 1 : touche les pointes à servir.', oral: 'La pizza a ' + tot + ' pointes. Donne ' + A.fracMots(n, d) + ' des pointes.', indice: tot + ' ÷ ' + d + ' = ' + (tot / d) + (n > 1 ? ', puis ' + (tot / d) + ' × ' + n + ' = ' + N : '') + '.', explication: F(n, d) + ' de ' + tot + ', c’est ' + N + ' pointes.',
      verifier: () => !p.on.size ? { manque: 'Touche les pointes à servir.' } : p.on.size === N, montrer: () => p.montrer(N) }; } }];
Atelier.definir({ id: 'pizzeria', titre: 'La pizzeria des fractions', icone: '🍕', couleur: '#c0392b', intro: 'Tu travailles à la pizzeria ! Lis la commande, coupe la pizza en parts égales et mets la garniture sur les bonnes parts. Toutes les fractions sont écrites avec une barre.', niveaux });
})();
