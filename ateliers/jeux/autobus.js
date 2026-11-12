/* 🚌 The bus schedule: read the time, set the clock, compute durations, read a schedule. */
(function () {
const A = Atelier.api, { node, svg, hasard, pioche, melange } = A;
const ecrire = m => { const h = Math.floor(m / 60) % 24, mi = m % 60; return h + ' h' + (mi ? ' ' + String(mi).padStart(2, '0') : ''); };
const dire = m => { const h = Math.floor(m / 60) % 24, mi = m % 60; return h + ' heure' + (h > 1 ? 's' : '') + (mi ? ' ' + mi : ''); };
function horloge(parent, minutes, interactive) {
  const sv = svg('svg', { viewBox: '0 0 240 240', class: 'grille-svg', role: 'img' }); sv.style.maxWidth = '260px';
  sv.append(svg('circle', { cx: 120, cy: 120, r: 110, fill: '#fff', stroke: '#16324f', 'stroke-width': 6 }));
  for (let i = 0; i < 60; i++) { const a = i * Math.PI / 30, l = i % 5 ? 6 : 14; sv.append(svg('line', { x1: 120 + 100 * Math.sin(a), y1: 120 - 100 * Math.cos(a), x2: 120 + (100 - l) * Math.sin(a), y2: 120 - (100 - l) * Math.cos(a), stroke: '#16324f', 'stroke-width': i % 5 ? 1.5 : 3 })); }
  for (let h = 1; h <= 12; h++) { const a = h * Math.PI / 6, t = svg('text', { x: 120 + 72 * Math.sin(a), y: 120 - 72 * Math.cos(a) + 9, 'text-anchor': 'middle', 'font-size': 24, 'font-weight': 800, fill: '#16324f', 'font-family': 'Arial' }); t.textContent = h; sv.append(t); }
  const ah = svg('line', { x1: 120, y1: 120, stroke: '#16324f', 'stroke-width': 8, 'stroke-linecap': 'round' }), am = svg('line', { x1: 120, y1: 120, stroke: '#e0573f', 'stroke-width': 5, 'stroke-linecap': 'round' });
  sv.append(ah, am, svg('circle', { cx: 120, cy: 120, r: 7, fill: '#16324f' }));
  let m = minutes; const maj = () => { const a1 = ((m / 60) % 12) * Math.PI / 6, a2 = (m % 60) * Math.PI / 30; ah.setAttribute('x2', 120 + 52 * Math.sin(a1)); ah.setAttribute('y2', 120 - 52 * Math.cos(a1)); am.setAttribute('x2', 120 + 84 * Math.sin(a2)); am.setAttribute('y2', 120 - 84 * Math.cos(a2)); sv.setAttribute('aria-label', 'Horloge qui indique ' + dire(m)); };
  maj(); parent.append(sv);
  if (interactive) {
    const r = node('div', 'rangee'), aff = node('p', 'grand-texte');
    const majAff = () => { aff.textContent = ecrire(m); };
    [['−1 h', -60], ['−5 min', -5], ['+5 min', 5], ['+1 h', 60]].forEach(([t, d]) => { const b = node('button', 'choix-bouton', t); b.type = 'button'; b.onclick = () => { if (A.resolu()) return; m = (m + d + 24 * 60) % (24 * 60); maj(); majAff(); A.son('clic'); }; r.append(b); });
    parent.append(r, aff); majAff();
  }
  return { valeur: () => m, regler(v) { m = v; maj(); } };
}
const autreHeure = (m, ecarts) => melange([...new Set([m, ...ecarts.map(e => (m + e + 1440) % 1440)])].slice(0, 4));
const niveaux = [
  { titre: 'Les heures et les demies', description: '8 h, 8 h 30…', manche(api) {
    const m = hasard(6, 18) * 60 + pioche([0, 30]), z = node('div', 'zone'); api.zone().append(z); horloge(z, m);
    const opts = melange([...new Set([m, m + 60, m - 60, m % 60 ? m - 30 : m + 30])].map(v => (v + 1440) % 1440)); const f = api.choix(opts.map(ecrire));
    return { consigne: 'Quelle heure l’horloge indique-t-elle ?', indice: 'La petite aiguille montre l’heure. La grande aiguille rouge : en haut, c’est « pile » ; en bas, c’est « et demie » (30 min).', explication: 'Il est ' + ecrire(m) + '.',
      verifier: () => f() === null ? { manque: 'Choisis une réponse.' } : opts[f()] === m, montrer() { f.boutons()[opts.indexOf(m)].classList.add('bonne'); } }; } },
  { titre: 'De 5 en 5 minutes', description: 'Lire la grande aiguille.', manche(api) {
    const m = hasard(6, 18) * 60 + hasard(1, 11) * 5, z = node('div', 'zone'); api.zone().append(z); horloge(z, m); const opts = autreHeure(m, [5, -5, 60, 10]); const f = api.choix(opts.map(ecrire));
    return { consigne: 'Quelle heure l’horloge indique-t-elle ?', indice: 'Compte de 5 en 5 sur chaque nombre où passe la grande aiguille : 1 = 5 min, 2 = 10 min, 3 = 15 min…', explication: 'Il est ' + ecrire(m) + '.',
      verifier: () => f() === null ? { manque: 'Choisis une réponse.' } : opts[f()] === m, montrer() { f.boutons()[opts.indexOf(m)].classList.add('bonne'); } }; } },
  { titre: 'Régler l’horloge', description: 'Mets les aiguilles à la bonne heure.', manche(api) {
    const m = hasard(6, 17) * 60 + hasard(0, 11) * 5, z = node('div', 'zone'); api.zone().append(z); const h = horloge(z, 12 * 60, true);
    return { consigne: 'L’autobus part à ' + ecrire(m) + '. Règle l’horloge à cette heure.', oral: 'L’autobus part à ' + dire(m) + '. Règle l’horloge à cette heure.', indice: 'Règle d’abord l’heure avec +1 h, puis les minutes avec +5 min.', explication: 'L’horloge indique ' + ecrire(m) + '.',
      verifier: () => h.valeur() === m, montrer: () => h.regler(m) }; } },
  { titre: 'À quelle heure arrive l’autobus ?', description: 'Ajouter une durée.', manche(api) {
    const dep = hasard(7, 16) * 60 + hasard(0, 11) * 5, dur = pioche([10, 15, 20, 25, 30, 35, 40, 45]), arr = dep + dur, z = node('div', 'zone'); api.zone().append(z);
    z.append(node('p', 'grand-texte', '🚌 Départ : ' + ecrire(dep) + ' · Trajet : ' + dur + ' min')); const h = horloge(z, dep, true);
    return { consigne: 'L’autobus part à ' + ecrire(dep) + '. Le trajet dure ' + dur + ' minutes. Règle l’horloge à l’heure d’arrivée.', oral: 'L’autobus part à ' + dire(dep) + '. Le trajet dure ' + dur + ' minutes. Règle l’horloge à l’heure d’arrivée.', indice: 'L’horloge est à l’heure du départ : touche +5 min ' + (dur / 5) + ' fois.', explication: ecrire(dep) + ' + ' + dur + ' min = ' + ecrire(arr) + '.',
      verifier: () => h.valeur() === arr % 1440, montrer: () => h.regler(arr) }; } },
  { titre: 'Combien de temps dure le trajet ?', description: 'Calculer une durée.', manche(api) {
    const dep = hasard(7, 16) * 60 + hasard(0, 11) * 5, dur = pioche([10, 15, 20, 25, 30, 35, 40, 45, 50]), arr = dep + dur, z = node('div', 'rangee'); api.zone().append(z);
    const b1 = node('div', 'zone'), b2 = node('div', 'zone'); b1.append(node('p', 'etiquette', '🚌 Départ')); horloge(b1, dep); b2.append(node('p', 'etiquette', '🏫 Arrivée')); horloge(b2, arr); z.append(b1, b2);
    const i = api.champNombre('Durée en minutes');
    return { consigne: 'L’autobus part à ' + ecrire(dep) + ' et arrive à ' + ecrire(arr) + '. Combien de minutes dure le trajet ?', oral: 'L’autobus part à ' + dire(dep) + ' et arrive à ' + dire(arr) + '. Combien de minutes dure le trajet ?', indice: 'Compte de 5 en 5 à partir de ' + ecrire(dep) + ' jusqu’à ' + ecrire(arr) + '.', explication: 'De ' + ecrire(dep) + ' à ' + ecrire(arr) + ', il y a ' + dur + ' minutes.',
      verifier: () => !i.value ? { manque: 'Écris le nombre de minutes.' } : +i.value === dur, montrer() { i.value = dur; i.classList.add('montree'); } }; } },
  { titre: 'Lire l’horaire', description: 'Quel autobus prendre ?', manche(api) {
    const debut = hasard(7, 8) * 60 + pioche([0, 10, 15]), pas = pioche([15, 20, 30]), departs = [0, 1, 2, 3, 4].map(i => debut + i * pas), arrive = departs[hasard(0, 3)] - hasard(1, pas - 1), bon = departs.find(d => d >= arrive);
    const t = node('table', 'horaire'); t.innerHTML = '<caption>Horaire de l’autobus 12</caption><thead><tr><th>Autobus</th><th>Départ</th></tr></thead>'; const tb = node('tbody');
    departs.forEach((d, i) => { const tr = node('tr'); tr.append(node('td', null, '🚌 n° ' + (i + 1)), node('td', null, ecrire(d))); tb.append(tr); }); t.append(tb); api.zone().append(t);
    const opts = departs.map(ecrire), f = api.choix(opts);
    return { consigne: 'Tu arrives à l’arrêt à ' + ecrire(arrive) + '. Quel est le prochain autobus que tu peux prendre ?', oral: 'Tu arrives à l’arrêt à ' + dire(arrive) + '. Quel est le prochain autobus ?', indice: 'Cherche le premier départ qui vient après ' + ecrire(arrive) + '.', explication: 'Le prochain autobus part à ' + ecrire(bon) + '.',
      verifier: () => f() === null ? { manque: 'Choisis une heure.' } : departs[f()] === bon ? true : { aide: departs[f()] < arrive ? 'Cet autobus est déjà parti !' : 'Il y a un autobus plus tôt.' }, montrer() { f.boutons()[departs.indexOf(bon)].classList.add('bonne'); } }; } }];
Atelier.definir({ id: 'autobus', titre: 'L’horaire de l’autobus', icone: '🚌', couleur: '#b07d12', intro: 'Pour ne pas manquer l’autobus de l’école : lis l’heure, règle l’horloge, calcule la durée du trajet et lis l’horaire.', niveaux });
})();
