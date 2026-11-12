/* 🏪 The town store: count Canadian money, pay, add, give change, budget. */
(function () {
const A = Atelier.api, { node, svg, hasard, pioche, melange } = A;
const $f = c => (c % 100 ? (Math.floor(c / 100) + ',' + String(c % 100).padStart(2, '0')) : String(c / 100)) + ' $';
const ARGENT = [
  { v: 5, nom: '5 ¢', type: 'piece', coul: '#cfd4da', r: 22 }, { v: 10, nom: '10 ¢', type: 'piece', coul: '#d9dde2', r: 19 }, { v: 25, nom: '25 ¢', type: 'piece', coul: '#c7ccd2', r: 25 },
  { v: 100, nom: '1 $', type: 'piece', coul: '#e2b84a', r: 27 }, { v: 200, nom: '2 $', type: 'piece', coul: '#d7c07a', r: 29, centre: '#e2b84a' },
  { v: 500, nom: '5 $', type: 'billet', coul: '#6fa8dc' }, { v: 1000, nom: '10 $', type: 'billet', coul: '#a77bca' }, { v: 2000, nom: '20 $', type: 'billet', coul: '#6fbf7f' }];
const ARTICLES = [['🍎', 'Pomme', 'f'], ['🧃', 'Jus', 'm'], ['✏️', 'Crayon', 'm'], ['📓', 'Cahier', 'm'], ['🧸', 'Ourson', 'mv'], ['⚽', 'Ballon', 'm'], ['🍪', 'Biscuit', 'm'], ['🧢', 'Casquette', 'f'], ['🎨', 'Peinture', 'f'], ['🍌', 'Banane', 'f'], ['🧦', 'Paire de bas', 'f'], ['🎲', 'Jeu de dés', 'm'], ['🪁', 'Cerf-volant', 'm'], ['🥛', 'Lait', 'm']];
const le = a => (a.g === 'mv' ? 'l’' : a.g === 'f' ? 'la ' : 'le ') + a.nom.toLowerCase(), un = a => (a.g === 'f' ? 'une ' : 'un ') + a.nom.toLowerCase(), Le = a => { const t = le(a); return t[0].toUpperCase() + t.slice(1); };
function dessinArgent(a, petit) {
  const s = petit ? .8 : 1;
  if (a.type === 'billet') { const w = 92 * s, h = 46 * s, el = svg('svg', { viewBox: '0 0 92 46', width: w, height: h, 'aria-hidden': 'true' });
    el.append(svg('rect', { x: 1, y: 1, width: 90, height: 44, rx: 6, fill: a.coul, stroke: '#16324f', 'stroke-width': 2 }), svg('circle', { cx: 66, cy: 23, r: 13, fill: '#ffffff88' }));
    const t = svg('text', { x: 28, y: 30, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 800, fill: '#16324f', 'font-family': 'Arial' }); t.textContent = a.nom; el.append(t); return el; }
  const R = a.r * s, el = svg('svg', { viewBox: '0 0 64 64', width: R * 2 + 4, height: R * 2 + 4, 'aria-hidden': 'true' });
  el.append(svg('circle', { cx: 32, cy: 32, r: 30, fill: a.coul, stroke: '#6b5a2a', 'stroke-width': 2 }));
  if (a.centre) el.append(svg('circle', { cx: 32, cy: 32, r: 17, fill: a.centre }));
  const t = svg('text', { x: 32, y: 38, 'text-anchor': 'middle', 'font-size': a.v >= 100 ? 17 : 15, 'font-weight': 800, fill: '#16324f', 'font-family': 'Arial' }); t.textContent = a.nom; el.append(t); return el;
}
function etalage(montants) { const r = node('div', 'rangee'); montants.forEach(v => { const a = ARGENT.find(x => x.v === v), b = node('span', 'argent'); b.append(dessinArgent(a)); b.setAttribute('role', 'img'); b.setAttribute('aria-label', a.nom); r.append(b); }); return r; }
/* Till: click the money to put it on the tray; click on the tray to remove it. */
function caisse(parent, valeurs, montrerTotal) {
  const choix = ARGENT.filter(a => valeurs.includes(a.v)), plateau = node('div', 'boite-cible'), tot = node('p', 'total'); plateau.dataset.vide = 'Touche l’argent pour le mettre ici';
  const mis = [], maj = () => { tot.textContent = montrerTotal ? 'Dans le plateau : ' + $f(mis.reduce((s, v) => s + v, 0)) : ''; };
  const r = node('div', 'rangee');
  choix.forEach(a => { const b = node('button', 'carte-objet argent-bouton'); b.type = 'button'; b.append(dessinArgent(a, true)); b.setAttribute('aria-label', 'Ajouter ' + a.nom);
    b.onclick = () => { if (A.resolu()) return; mis.push(a.v); const p = node('button', 'argent-mis'); p.type = 'button'; p.append(dessinArgent(a, true)); p.setAttribute('aria-label', 'Enlever ' + a.nom);
      p.onclick = () => { if (A.resolu()) return; mis.splice(mis.indexOf(a.v), 1); p.remove(); maj(); A.son('clic'); }; plateau.append(p); maj(); A.son('clic'); }; r.append(b); });
  parent.append(node('p', 'etiquette', 'Ton argent :'), r, node('p', 'etiquette', 'Le plateau de la caisse :'), plateau, tot); maj();
  return { somme: () => mis.reduce((s, v) => s + v, 0), nb: () => mis.length, montrer(liste) { [...plateau.children].forEach(c => c.remove()); mis.length = 0; liste.forEach(v => { mis.push(v); const p = node('span', 'argent-mis'); p.append(dessinArgent(ARGENT.find(a => a.v === v), true)); plateau.append(p); }); maj(); } };
}
/* Simple way to make an amount with as few coins as possible */
function decomposer(c, valeurs) { const out = []; for (const v of [...valeurs].sort((a, b) => b - a)) while (c >= v) { out.push(v); c -= v; } return out; }
function article(prix) { const [e, n, g] = pioche(ARTICLES), d = node('div', 'carte-objet'); d.style.cursor = 'default'; d.append(node('span', 'emo', e), node('span', null, n), node('span', 'prix', $f(prix))); return { d, nom: n, e, g }; }
const DOLLARS = [100, 200, 500, 1000, 2000], SOUS = [5, 10, 25, 100, 200];
const niveaux = [
  { titre: 'Combien d’argent ?', description: 'Compter les pièces de 1 $ et 2 $ et les billets.', manche(api) {
    const n = hasard(2, 5), l = Array.from({ length: n }, () => pioche(DOLLARS.slice(0, 4))).sort((a, b) => b - a), t = l.reduce((s, v) => s + v, 0);
    api.zone().append(etalage(l)); const i = api.champNombre('Combien de dollars ?');
    return { consigne: 'Combien d’argent y a-t-il ? Écris le nombre de dollars.', indice: 'Commence par les billets, puis ajoute les pièces.', explication: 'Il y a ' + $f(t) + '.',
      verifier: () => !i.value ? { manque: 'Écris le nombre de dollars.' } : Number(i.value) === t / 100, montrer() { i.value = t / 100; i.classList.add('montree'); } }; } },
  { titre: 'Payer le prix exact', description: 'Donner exactement le bon montant.', manche(api) {
    const prix = hasard(3, 18) * 100, a = article(prix); api.zone().append(a.d); const c = caisse(api.champ(), DOLLARS, true);
    return { consigne: Le(a) + ' coûte ' + $f(prix) + '. Mets exactement ' + $f(prix) + ' dans le plateau.', indice: 'Commence par le plus gros billet qui n’est pas trop grand.', explication: 'Par exemple : ' + decomposer(prix, DOLLARS).map(v => $f(v)).join(' + ') + '.',
      verifier: () => !c.nb() ? { manque: 'Touche l’argent pour payer.' } : c.somme() === prix ? true : { aide: c.somme() > prix ? 'C’est trop : enlève de l’argent.' : 'Ce n’est pas assez : ajoute de l’argent.' }, montrer: () => c.montrer(decomposer(prix, DOLLARS)) }; } },
  { titre: 'Compter les sous', description: 'Les pièces de 5 ¢, 10 ¢ et 25 ¢.', manche(api) {
    const n = hasard(3, 6), l = Array.from({ length: n }, () => pioche(SOUS.slice(0, api.hasard(0, 1) ? 3 : 5))).sort((a, b) => b - a), t = l.reduce((s, v) => s + v, 0);
    api.zone().append(etalage(l)); const opts = melange([t, t + pioche([5, 10]), Math.max(5, t - pioche([5, 10, 25]))]); const f = api.choix(opts.map($f));
    return { consigne: 'Combien d’argent y a-t-il ?', indice: 'Compte d’abord les grosses pièces, puis les 10 ¢, puis les 5 ¢.', explication: 'Il y a ' + $f(t) + '.',
      verifier: () => f() === null ? { manque: 'Choisis une réponse.' } : opts[f()] === t, montrer() { f.boutons()[opts.indexOf(t)].classList.add('bonne'); } }; } },
  { titre: 'Payer avec des pièces', description: 'Le prix exact, avec les cents.', manche(api) {
    const prix = hasard(3, 39) * 5 + (api.hasard(0, 1) ? 100 : 0), a = article(prix); api.zone().append(a.d); const c = caisse(api.champ(), SOUS, true);
    return { consigne: Le(a) + ' coûte ' + $f(prix) + '. Mets exactement ' + $f(prix) + ' dans le plateau.', indice: '100 ¢ = 1 $. Utilise d’abord les grosses pièces.', explication: 'Par exemple : ' + decomposer(prix, SOUS).map(v => $f(v)).join(' + ') + '.',
      verifier: () => !c.nb() ? { manque: 'Touche les pièces pour payer.' } : c.somme() === prix ? true : { aide: c.somme() > prix ? 'C’est trop : enlève une pièce.' : 'Ce n’est pas assez : ajoute une pièce.' }, montrer: () => c.montrer(decomposer(prix, SOUS)) }; } },
  { titre: 'Le total des achats', description: 'Additionner les prix.', manche(api, k) {
    const n = k < 3 ? 2 : 3, prix = Array.from({ length: n }, () => hasard(1, 12) * 100 + pioche([0, 0, 50, 25])), t = prix.reduce((s, v) => s + v, 0);
    const r = node('div', 'rangee'); prix.forEach(p => r.append(article(p).d)); api.zone().append(r);
    const opts = melange([t, t + 100, t - pioche([50, 100, 25]) > 0 ? t - pioche([50, 100]) : t + 200]); const f = api.choix(opts.map($f));
    return { consigne: 'Combien coûtent ces ' + n + ' articles ensemble ?', indice: 'Additionne d’abord les dollars, puis les cents.', explication: prix.map($f).join(' + ') + ' = ' + $f(t) + '.',
      verifier: () => f() === null ? { manque: 'Choisis une réponse.' } : opts[f()] === t, montrer() { f.boutons()[opts.indexOf(t)].classList.add('bonne'); } }; } },
  { titre: 'Rendre la monnaie', description: 'Tu es à la caisse : rends la monnaie.', manche(api) {
    const paye = pioche([1000, 2000]), prix = hasard(paye === 1000 ? 2 : 6, paye / 100 - 1) * 100 + pioche([0, 0, 50]), rendu = paye - prix, a = article(prix);
    api.zone().append(a.d, node('p', 'etiquette', 'Le client te donne ' + $f(paye) + '.')); const c = caisse(api.champ(), [25, 100, 200, 500, 1000], true);
    return { consigne: 'Le client achète ' + un(a) + ' à ' + $f(prix) + ' et paie avec ' + $f(paye) + '. Rends-lui la monnaie.', indice: 'Compte à partir du prix jusqu’à ' + $f(paye) + ' : ' + $f(paye) + ' − ' + $f(prix) + '.', explication: $f(paye) + ' − ' + $f(prix) + ' = ' + $f(rendu) + '.',
      verifier: () => !c.nb() ? { manque: 'Touche l’argent à rendre.' } : c.somme() === rendu ? true : { aide: c.somme() > rendu ? 'Tu rends trop d’argent.' : 'Tu ne rends pas assez d’argent.' }, montrer: () => c.montrer(decomposer(rendu, [25, 100, 200, 500, 1000])) }; } },
  { titre: 'Mon budget', description: 'Choisir des articles sans dépasser son argent.', manche(api) {
    const budget = pioche([1000, 1500, 2000]), items = melange(ARTICLES).slice(0, 5).map(([e, n]) => ({ e, n, p: hasard(2, budget / 100 - 2) * 100 + pioche([0, 50]) }));
    if (items.filter(x => x.p <= budget).length < 3) items[0].p = 200, items[1].p = 300;
    const pris = new Set(), r = node('div', 'rangee'), tot = node('p', 'total');
    const maj = () => { const s = [...pris].reduce((a, i) => a + items[i].p, 0); tot.textContent = 'Total choisi : ' + $f(s) + ' sur ' + $f(budget); };
    items.forEach((it, i) => { const b = node('button', 'carte-objet'); b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.append(node('span', 'emo', it.e), node('span', null, it.n), node('span', 'prix', $f(it.p)));
      b.onclick = () => { if (api.resolu()) return; pris.has(i) ? pris.delete(i) : pris.add(i); b.setAttribute('aria-pressed', String(pris.has(i))); maj(); api.son('clic'); }; r.append(b); });
    api.zone().append(node('p', 'grand-texte', 'Tu as ' + $f(budget) + ' 👛'), r, tot); maj();
    const meilleur = () => { let best = []; for (let m = 1; m < 32; m++) { const l = items.map((_, i) => i).filter(i => m >> i & 1), s = l.reduce((a, i) => a + items[i].p, 0); if (l.length === 2 && s <= budget) best = l; } return best; };
    return { consigne: 'Choisis 2 articles que tu peux acheter avec ' + $f(budget) + '.', indice: 'Additionne les deux prix : le total doit être plus petit que ' + $f(budget) + ', ou égal.', explication: 'Le total doit rester dans ton budget.',
      verifier() { const s = [...pris].reduce((a, i) => a + items[i].p, 0); if (pris.size !== 2) return { manque: 'Choisis exactement 2 articles.' }; return s <= budget ? true : { aide: 'Le total, ' + $f(s) + ', dépasse ' + $f(budget) + '.' }; },
      montrer() { const m = meilleur(); r.querySelectorAll('button').forEach((b, i) => { b.setAttribute('aria-pressed', String(m.includes(i))); if (m.includes(i)) b.classList.add('bonne'); }); pris.clear(); m.forEach(i => pris.add(i)); maj(); } }; } }];
Atelier.definir({ id: 'magasin', titre: 'Le magasin de la ville', icone: '🏪', couleur: '#7f5a00', intro: 'Compte l’argent canadien, paie le prix exact, additionne les achats et rends la monnaie. Touche les pièces et les billets pour les utiliser.', niveaux });
})();
