'use strict';
/* =====================================================================
   EXERCISE ENGINE — one layout for all the activities.
   How a level runs:
   - up to 15 exercises, a bar of dots shows progress;
   - a mistake → a hint; 3 mistakes → the answer is shown and the student goes on;
   - the score counts the exercises passed on the first try
     ("colorier" levels: the shapes coloured on the first try);
   - time is measured but not shown during the level (less stress);
   - at the end: summary (score, stars, time) and saving in the student account.
   ===================================================================== */
(function () {
const M = window.EC_MATHS;
const el = id => document.getElementById(id);
/* Empties an element, then puts the new children in it (if any). */
const vider = (n, ...enfants) => { n.textContent = ''; n.append(...enfants); };
const NS = 'http://www.w3.org/2000/svg';
const MAX_ESSAIS = 3;
function node(tag, cls, text) { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; }
function svg(tag, attrs) { const n = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs || {})) n.setAttribute(k, v); return n; }
const duree = s => s < 60 ? s + (s > 1 ? ' secondes' : ' seconde') : Math.floor(s / 60) + ' min ' + String(s % 60).padStart(2, '0') + ' s';
const params = new URLSearchParams(location.search);
const act = M.activites[params.get('a')] || M.activites.calculs;
document.title = act.titre + ' · EduCentre';
document.body.dataset.activite = act.id; document.body.style.setProperty('--cat', act.couleur);
/* Activities of the Challenges page: back links and category colour. */
if (act.categorie === 'defis') {
  document.body.classList.remove('cat-mathematiques'); document.body.classList.add('cat-defis');
  document.querySelectorAll('a[href="../mathematiques/index.html"]').forEach(a => { a.href = '../defis/index.html'; a.textContent = a.classList.contains('bouton-retour') ? '⬅ Retour aux défis' : '← Défis'; });
  const st = document.querySelector('#menu .sous-titre'); if (st) st.textContent = 'Choisis ton niveau. Les niveaux vont du plus facile au plus difficile.';
}

/* ---------- level state ---------- */
let niv = 0, qs = [], i = 0, essais = 0, score = 0, debut = 0, resolu = false, etats = [], choixFait = null, sceneTrouves = new Set();
let resultatsServeur = null;
let bonnesFormes = 0; // "colorier" levels: shapes coloured correctly on the first try

/* ======================= LEVEL MENU ======================= */
function memoireLocale() { try { return JSON.parse(sessionStorage.getItem('ec-maths-local') || '{}'); } catch { return {}; } }
const taux = r => r ? r.score / r.total : -1;
function noterLocal(n, sc, tot) { const m = memoireLocale(); const k = act.id + ':' + n; const v = { score: sc, total: tot }; if (typeof m[k] !== 'object' || taux(m[k]) < taux(v)) m[k] = v; try { sessionStorage.setItem('ec-maths-local', JSON.stringify(m)); } catch {} }
function meilleurs() {
  const best = {};
  for (const r of resultatsServeur || []) if (r.activity === act.id) { const k = r.level; if (taux(r) > taux(best[k])) best[k] = { score: r.score, total: r.total || 10 }; }
  const m = memoireLocale();
  for (const [k, v] of Object.entries(m)) { const [a, n] = k.split(':'); if (a === act.id && typeof v === 'object' && taux(v) > taux(best[n])) best[n] = v; }
  return best;
}
function afficherMenu() {
  el('jeu').hidden = true; el('menu').hidden = false;
  el('menuTitre').textContent = act.titre;
  el('invite').hidden = EC.connecte();
  el('lienConnexion').href = EC.lienConnexion();
  if (act.video) { el('video').hidden = false; const v = el('video').querySelector('video'); if (!v.src) v.src = act.video; }
  const best = meilleurs();
  const premierAFaire = act.niveaux.findIndex((_, k) => !best[k + 1]);
  const ol = el('niveaux'); vider(ol);
  act.niveaux.forEach((n, k) => {
    const li = node('li');
    const b = node('button', 'niveau-carte' + (best[k + 1] !== undefined ? ' fait' : '') + (k === premierAFaire ? ' conseille' : ''));
    b.type = 'button'; b.style.setProperty('--c', act.couleur);
    const num = node('span', 'niveau-num', String(k + 1));
    const txt = node('span', 'niveau-texte'); txt.append(node('strong', null, n.titre)); if (n.description) txt.append(node('small', null, n.description));
    const etat = node('span', 'niveau-etat', best[k + 1] !== undefined ? '✓ ' + best[k + 1].score + '/' + best[k + 1].total : k === premierAFaire ? 'À faire ensuite' : '');
    b.append(num, txt, etat);
    b.setAttribute('aria-label', 'Niveau ' + (k + 1) + ' : ' + n.titre + (best[k + 1] !== undefined ? '. Terminé, meilleur score ' + best[k + 1].score + ' sur ' + best[k + 1].total + '.' : ''));
    b.onclick = () => commencer(k + 1);
    li.append(b); ol.append(li);
  });
  const conseil = ol.querySelector('.conseille') || ol.querySelector('button');
  if (conseil && document.activeElement === document.body) conseil.focus({ preventScroll: true });
}

/* ======================= RUNNING A LEVEL ======================= */
function commencer(n) {
  niv = n; qs = act.niveaux[n - 1].questions(); i = 0; score = 0; bonnesFormes = 0; etats = qs.map(() => 'a-faire'); debut = Date.now();
  el('menu').hidden = true; el('jeu').hidden = false; el('bilan').hidden = true;
  el('jeuTitre').textContent = 'Niveau ' + n + ' · ' + act.niveaux[n - 1].titre;
  afficherQuestion();
  window.scrollTo(0, 0);
}
function majProgres() {
  const ol = el('progres'); vider(ol);
  etats.forEach((e, k) => {
    const li = node('li', 'pastille ' + e + (k === i ? ' actuelle' : ''));
    li.textContent = e === 'ok' ? '★' : e === 'essai' ? '✓' : e === 'montre' ? '•' : String(k + 1);
    li.setAttribute('aria-label', 'Exercice ' + (k + 1) + (e === 'ok' ? ', réussi du premier coup' : e === 'essai' ? ', réussi' : e === 'montre' ? ', réponse montrée' : k === i ? ', en cours' : ''));
    ol.append(li);
  });
  el('compteur').textContent = 'Exercice ' + (i + 1) + ' sur ' + qs.length;
}
function afficherQuestion() {
  const q = qs[i]; essais = 0; resolu = false; choixFait = null; sceneTrouves = new Set();
  vider(el('visuel')); vider(el('champ'));
  el('retour').textContent = ''; el('retour').className = 'retour-msg';
  el('verifier').hidden = false; el('verifier').disabled = false; el('suivant').hidden = true;
  majProgres();
  RENDU[q.type](q);
  const lecon = act.niveaux[niv - 1].lecon;
  if (lecon) { const d = node('details', 'lecon'); d.open = i === 0; d.append(node('summary', null, '📘 Explication')); const ul = node('ul'); lecon.forEach(t => ul.append(node('li', null, t))); d.append(ul); el('visuel').prepend(d); }
  const premier = el('champ').querySelector('input:not([readonly]),button') || el('visuel').querySelector('[tabindex="0"],button');
  if (premier) premier.focus({ preventScroll: true });
}
function texteConsigne(t) { el('consigne').textContent = t; }

/* ---------- checking ---------- */
el('formulaire').onsubmit = e => {
  e.preventDefault();
  if (resolu) { suivant(); return; }
  const q = qs[i], r = VERIF[q.type](q);
  if (r === null) return; // incomplete answer: does not count as an attempt
  if (r) reussite(); else erreur();
};
function reussite() {
  resolu = true;
  etats[i] = essais === 0 ? 'ok' : 'essai';
  if (essais === 0) score++;
  el('champ').querySelectorAll('[aria-pressed=true]').forEach(b => b.classList.add('bonne'));
  const bravo = ['Bravo !', 'Super !', 'Excellent !', 'Très bien !', 'Bien joué !'][i % 5];
  message('correct', bravo + (essais === 0 ? ' Bonne réponse du premier coup ⭐' : ' Tu as trouvé la bonne réponse.'));
  finQuestion();
}
function erreur() {
  essais++;
  const q = qs[i];
  if (essais >= MAX_ESSAIS) {
    resolu = true; etats[i] = 'montre';
    message('montre', 'Ce n’est pas grave ! La bonne réponse est : ' + REPONSE[q.type](q) + '. Regarde-la bien, puis continue.');
    MONTRER[q.type] && MONTRER[q.type](q);
    finQuestion();
  } else {
    message('incorrect', 'Essaie encore. ' + (q.type === 'scene' ? 'Ce n’est pas la bonne forme. Regarde le modèle.' : aideDe(q) || '') + (essais === MAX_ESSAIS - 1 ? ' (Dernier essai.)' : ''));
    const champ = el('champ').querySelector('input:not([readonly])'); if (champ) { champ.select(); champ.focus(); }
  }
}
function aideDe(q) { return q.aide || q.explain || ''; }



/* ---------- Fractions written with a bar: "[3/4]" in a text becomes a stacked fraction ---------- */
const RE_FRAC = /\[(\d+|\?)\/(\d+|\?)\]/;
function fracNoeud(n, d) { const f = node('span', 'frac'); f.setAttribute('role', 'img'); f.setAttribute('aria-label', fracMots(+n, +d)); f.append(node('span', 'frac-n', n), node('span', 'frac-d', d)); return f; }
function fracMots(n, d) {
  if (isNaN(n) || isNaN(d)) return (isNaN(n) ? 'combien' : n) + ' sur ' + (isNaN(d) ? 'combien' : d);
  const N = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze'];
  const D = { 2: ['demi', 'demis'], 3: ['tiers', 'tiers'], 4: ['quart', 'quarts'] };
  const nom = D[d] ? D[d][n > 1 ? 1 : 0] : (d === 5 ? 'cinquième' : d === 9 ? 'neuvième' : String(N[d] || d).replace(/e$/, '') + 'ième') + (n > 1 && !D[d] ? 's' : '');
  return (N[n] || n) + ' ' + nom;
}
function fracDansTexte(racine) {
  const w = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT), liste = [];
  while (w.nextNode()) if (RE_FRAC.test(w.currentNode.nodeValue)) liste.push(w.currentNode);
  for (const t of liste) {
    const morceaux = t.nodeValue.split(/(\[(?:\d+|\?)\/(?:\d+|\?)\])/), frag = document.createDocumentFragment();
    for (const m of morceaux) { const x = m.match(/^\[(\d+|\?)\/(\d+|\?)\]$/); frag.append(x ? fracNoeud(x[1], x[2]) : document.createTextNode(m)); }
    t.parentNode.replaceChild(frag, t);
  }
}
new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) { if (n.nodeType === 3 ? RE_FRAC.test(n.nodeValue) : n.nodeType === 1 && RE_FRAC.test(n.textContent)) fracDansTexte(n.nodeType === 3 ? n.parentNode : n); } })
  .observe(document.body, { childList: true, subtree: true });

/* ---------- Fraction drawings: bar, circle, set, number line, two bars ---------- */
const COUL_FRAC = '#2e9c76', COUL_VIDE = '#ffffff', TRAIT = '#16324f';
function partsBarre(sv, x, y, w, h, d, n, largeurs, coul) {
  const L = largeurs || Array(d).fill(1), tot = L.reduce((a, b) => a + b, 0); let cx = x; const parts = [];
  L.forEach((l, k) => { const pw = w * l / tot, r = svg('rect', { x: cx, y, width: pw, height: h, fill: k < n ? (coul || COUL_FRAC) : COUL_VIDE, stroke: TRAIT, 'stroke-width': 3 }); sv.append(r); parts.push(r); cx += pw; });
  return parts;
}
function partsCercle(sv, cx, cy, r, d, n) {
  const parts = [];
  if (d === 1) { const c = svg('circle', { cx, cy, r, fill: n ? COUL_FRAC : COUL_VIDE, stroke: TRAIT, 'stroke-width': 3 }); sv.append(c); return [c]; }
  for (let k = 0; k < d; k++) {
    const a0 = -Math.PI / 2 + k * 2 * Math.PI / d, a1 = a0 + 2 * Math.PI / d;
    const p = svg('path', { d: 'M' + cx + ' ' + cy + ' L' + (cx + r * Math.cos(a0)) + ' ' + (cy + r * Math.sin(a0)) + ' A' + r + ' ' + r + ' 0 0 1 ' + (cx + r * Math.cos(a1)) + ' ' + (cy + r * Math.sin(a1)) + ' Z', fill: k < n ? COUL_FRAC : COUL_VIDE, stroke: TRAIT, 'stroke-width': 3, 'stroke-linejoin': 'round' });
    sv.append(p); parts.push(p);
  }
  return parts;
}
function dessinFraction(o) {
  const box = node('div', 'frac-visuel'), sv = svg('svg', { role: 'img' }); box.append(sv);
  if (o.forme === 'barre' || o.forme === 'inegal') { sv.setAttribute('viewBox', '0 0 420 90'); partsBarre(sv, 10, 15, 400, 60, o.d, o.n, o.largeurs); sv.setAttribute('aria-label', 'Une bande partagée en ' + o.d + ' parts'); }
  if (o.forme === 'cercle') { sv.setAttribute('viewBox', '0 0 200 200'); partsCercle(sv, 100, 100, 88, o.d, o.n); sv.setAttribute('aria-label', 'Un cercle partagé en ' + o.d + ' parts'); }
  if (o.forme === 'ensemble') {
    const t = o.total, par = Math.min(t, 6), lignes = Math.ceil(t / par); sv.setAttribute('viewBox', '0 0 ' + (par * 60 + 10) + ' ' + (lignes * 60 + 10));
    for (let k = 0; k < t; k++) sv.append(svg('circle', { cx: 35 + (k % par) * 60, cy: 35 + Math.floor(k / par) * 60, r: 24, fill: k < o.n ? '#e0573f' : '#cfd8e3', stroke: TRAIT, 'stroke-width': 3 }));
    sv.setAttribute('aria-label', t + ' billes, dont ' + o.n + ' rouges');
  }
  if (o.forme === 'droite') {
    const max = o.max || 1, d = o.d, W = 440; sv.setAttribute('viewBox', '0 0 ' + (W + 40) + ' 110');
    sv.append(svg('line', { x1: 20, y1: 60, x2: W + 20, y2: 60, stroke: TRAIT, 'stroke-width': 4 }));
    for (let k = 0; k <= d * max; k++) { const x = 20 + W * k / (d * max), entier = k % d === 0;
      sv.append(svg('line', { x1: x, y1: entier ? 44 : 50, x2: x, y2: entier ? 76 : 70, stroke: TRAIT, 'stroke-width': entier ? 4 : 2 }));
      if (entier) { const tx = svg('text', { x, y: 102, 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 700, fill: TRAIT }); tx.textContent = k / d; sv.append(tx); } }
    if (o.n !== undefined) { const x = 20 + W * o.n / (d * max); sv.append(svg('circle', { cx: x, cy: 60, r: 11, fill: '#e0573f', stroke: TRAIT, 'stroke-width': 3 })); const tx = svg('text', { x, y: 30, 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 800, fill: '#e0573f' }); tx.textContent = '?'; sv.append(tx); }
    sv.setAttribute('aria-label', 'Une droite numérique de 0 à ' + max);
  }
  if (o.forme === 'deux') {
    sv.setAttribute('viewBox', '0 0 470 170');
    o.paires.forEach(([n, d], k) => { partsBarre(sv, 60, 15 + k * 85, 400, 60, d, n, null, k ? '#7a5ad8' : COUL_FRAC); const lab = svg('text', { x: 28, y: 52 + k * 85, 'text-anchor': 'middle', 'font-size': 28, 'font-weight': 800, fill: TRAIT }); lab.textContent = k ? 'B' : 'A'; sv.append(lab); });
    sv.setAttribute('aria-label', 'Deux bandes de même longueur, A et B');
  }
  return box;
}
/* ---------- Dot patterns: pairs (even / odd), squares, triangles ---------- */
function motifPoints(m) {
  const NS = 'http://www.w3.org/2000/svg', R = 13, P = 34, pts = [];
  if (m.forme === 'carre') for (let y = 0; y < m.n; y++) for (let x = 0; x < m.n; x++) pts.push([x, y]);
  if (m.forme === 'triangle') for (let y = 0; y < m.n; y++) for (let x = 0; x <= y; x++) pts.push([x + (m.n - 1 - y) / 2, y]);
  if (m.forme === 'paires') for (let k = 0; k < m.n; k++) pts.push([Math.floor(k / 2), k % 2]);
  const w = Math.max(...pts.map(p => p[0])) + 1, h = Math.max(...pts.map(p => p[1])) + 1;
  const sv = document.createElementNS(NS, 'svg'); sv.setAttribute('viewBox', '0 0 ' + (w * P) + ' ' + (h * P)); sv.setAttribute('width', Math.min(w * P, 520)); sv.setAttribute('class', 'motif-points');
  sv.setAttribute('role', 'img'); sv.setAttribute('aria-label', m.n + ' points');
  const seul = m.forme === 'paires' && m.n % 2 === 1;
  pts.forEach((p, k) => { const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', p[0] * P + P / 2); c.setAttribute('cy', p[1] * P + P / 2); c.setAttribute('r', R); c.setAttribute('fill', seul && k === pts.length - 1 ? '#e0573f' : (m.forme === 'carre' ? '#2e9c76' : m.forme === 'triangle' ? '#7a5ad8' : '#3b6fe0')); sv.append(c); });
  const w2 = node('div', 'motif-zone'); w2.append(sv); return w2;
}
/* ---------- "ordre" type: click the numbers in the right order ---------- */
function renduOrdre(q) {
  texteConsigne(q.texte);
  const z = node('div', 'ordre-zone'), rang = node('div', 'ordre-rang'), reserve = node('div', 'choix ordre-reserve');
  rang.setAttribute('aria-label', 'Ta réponse, dans l’ordre');
  const cases = q.nombres.map((_, k) => { const c = node('button', 'ordre-case', ''); c.type = 'button'; c.dataset.k = k; c.setAttribute('aria-label', 'Place ' + (k + 1) + ', vide'); rang.append(c); return c; });
  const boutons = q.nombres.map(n => { const b = node('button', 'choix-bouton ordre-nb', q.affiche ? q.affiche(n) : String(n)); b.type = 'button'; b.dataset.v = n; reserve.append(b); return b; });
  const maj = () => cases.forEach((c, k) => c.setAttribute('aria-label', 'Place ' + (k + 1) + (c.dataset.v ? ', ' + c.dataset.v : ', vide')));
  boutons.forEach(b => b.onclick = () => { if (resolu || b.disabled) return; const c = cases.find(x => !x.dataset.v); if (!c) return; c.dataset.v = b.dataset.v; c.textContent = b.textContent; b.disabled = true; b.classList.add('pris'); maj(); });
  cases.forEach(c => c.onclick = () => { if (resolu || !c.dataset.v) return; const b = boutons.find(x => x.dataset.v === c.dataset.v && x.disabled); b && (b.disabled = false, b.classList.remove('pris')); delete c.dataset.v; c.textContent = ''; maj(); });
  const fl = node('div', 'ordre-sens', q.sens === 'decroissant' ? 'du plus grand → au plus petit' : 'du plus petit → au plus grand');
  z.append(node('p', 'ordre-etape', '1. Clique sur les nombres :'), reserve, node('p', 'ordre-etape', '2. Ils se placent ici, dans l’ordre :'), fl, rang, node('p', 'col-aide', 'Pour enlever un nombre, clique dessus dans la rangée.'));
  el('champ').append(z);
}
/* ---------- Ones, tens, hundreds: base-ten blocks and place-value table ---------- */
const NOMS_POS = ['unités', 'dizaines', 'centaines', 'unités de mille'], LET_POS = ['U', 'D', 'C', 'UM'];
function blocsBaseDix(b) {
  const m = b.m || 0, c = b.c || 0, d = b.d || 0, u = b.u || 0, S = 9, NS = 'http://www.w3.org/2000/svg';
  const mk = (t, a) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); return e; };
  const wrap = node('div', 'blocs-zone'); wrap.setAttribute('role', 'img');
  const mots = [];
  if (m) mots.push(m + (m > 1 ? ' milliers' : ' millier'));
  if (c) mots.push(c + (c > 1 ? ' centaines' : ' centaine')); if (d) mots.push(d + (d > 1 ? ' dizaines' : ' dizaine')); if (u) mots.push(u + (u > 1 ? ' unités' : ' unité'));
  wrap.setAttribute('aria-label', 'Blocs : ' + mots.join(', '));
  const groupe = (titre, cls, w, h, dessin) => { const g = node('div', 'blocs-groupe ' + cls); g.append(node('span', 'blocs-titre', titre)); const sv = mk('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h }); dessin(sv); g.append(sv); wrap.append(g); };
  const carre = (sv, x, y, coul) => sv.append(mk('rect', { x, y, width: S, height: S, fill: coul, stroke: '#28405a', 'stroke-width': .8 }));
  /* A thousand: a big 10 × 10 × 10 cube (gridded front face, top and side in relief) */
  if (m) { const L = 10 * S, P = 36, pas = L + P + 10;
    groupe('Milliers', 'bg-m', Math.min(m, 5) * pas - 10 + 2, (m > 5 ? 2 : 1) * (L + P + 10) + 2, sv => {
      for (let k = 0; k < m; k++) { const ox = 1 + (k % 5) * pas, oy = 1 + P + Math.floor(k / 5) * (L + P + 10);
        sv.append(mk('polygon', { points: [ox, oy, ox + P, oy - P, ox + L + P, oy - P, ox + L, oy].join(' '), fill: '#c4a8ee', stroke: '#28405a', 'stroke-width': .8 }));
        sv.append(mk('polygon', { points: [ox + L, oy, ox + L + P, oy - P, ox + L + P, oy + L - P, ox + L, oy + L].join(' '), fill: '#6a43a8', stroke: '#28405a', 'stroke-width': .8 }));
        for (let a = 0; a < 10; a++) for (let e = 0; e < 10; e++) carre(sv, ox + a * S, oy + e * S, '#8c5fd2'); } }); }
  if (c) groupe('Centaines', 'bg-c', Math.min(c, 5) * (10 * S + 8) - 8 + 2, (c > 5 ? 2 : 1) * (10 * S + 8) + 2, sv => {
    for (let k = 0; k < c; k++) { const ox = 1 + (k % 5) * (10 * S + 8), oy = 1 + Math.floor(k / 5) * (10 * S + 8); for (let a = 0; a < 10; a++) for (let e = 0; e < 10; e++) carre(sv, ox + a * S, oy + e * S, '#5aa877'); }
  });
  if (d) groupe('Dizaines', 'bg-d', d * (S + 5) + 2, 10 * S + 2, sv => { for (let k = 0; k < d; k++) for (let e = 0; e < 10; e++) carre(sv, 1 + k * (S + 5), 1 + e * S, '#f0a03c'); });
  if (u) groupe('Unités', 'bg-u', Math.min(u, 5) * (S + 6) + 2, Math.ceil(u / 5) * (S + 6) + 2, sv => { for (let k = 0; k < u; k++) carre(sv, 1 + (k % 5) * (S + 6), 1 + Math.floor(k / 5) * (S + 6), '#4a86d6'); });
  return wrap;
}
/* ---------- Column calculation (adding or subtracting with regrouping) ---------- */
const NOM_COL = ['unités', 'dizaines', 'centaines', 'unités de mille'], LET_COL = ['U', 'D', 'C', 'M'];
const chiffresDe = (x, n) => String(x).padStart(n, ' ').split('');
/* What is written in the small boxes at the top when regrouping (left to right). */
function regroupements(q) {
  const n = q.n, A = String(q.a).padStart(n, '0').split('').map(Number), B = String(q.b).padStart(n, '0').split('').map(Number), out = Array(n).fill('');
  if (q.op === '+') { let r = 0; for (let i = n - 1; i >= 0; i--) { const t = A[i] + B[i] + r; r = t >= 10 ? 1 : 0; if (r && i > 0) out[i - 1] = '1'; } }
  else { const T = A.slice(); for (let i = n - 1; i >= 0; i--) { if (T[i] < B[i]) { let j = i - 1; while (j >= 0 && T[j] === 0) j--; for (let k = j; k < i; k++) { T[k] -= 1; if (k > j) T[k] += 10; out[k] = String(T[k]); } T[i] += 10; out[i] = String(T[i]); } } }
  return out;
}
function message(type, t) { el('retour').className = 'retour-msg ' + type; el('retour').textContent = t; }
function finQuestion() {
  majProgres();
  el('verifier').hidden = true; el('suivant').hidden = false;
  el('suivant').textContent = i === qs.length - 1 ? 'Voir mon résultat →' : 'Suivant →';
  el('champ').querySelectorAll('input,button').forEach(x => { if (x.tagName === 'INPUT') x.readOnly = true; else x.disabled = true; });
  el('suivant').focus();
}
function suivant() { if (i < qs.length - 1) { i++; afficherQuestion(); } else terminer(); }
el('suivant').onclick = suivant;
el('quitter').onclick = afficherMenu;

/* ---------- end of level: summary ---------- */
async function terminer() {
  const secondes = Math.max(1, Math.round((Date.now() - debut) / 1000));
  /* "colorier" levels: count the shapes coloured correctly on the first try. */
  const parFormes = qs.every(q => q.type === 'colorier');
  const pts = parFormes ? bonnesFormes : score;
  const total = parFormes ? qs.reduce((t, q) => t + q._total, 0) : qs.length;
  noterLocal(niv, pts, total);
  const ratio = pts / total;
  el('bilanNiveau').textContent = act.titre + ' · Niveau ' + niv + ' · ' + act.niveaux[niv - 1].titre;
  el('bilanEtoiles').textContent = ratio >= .9 ? '⭐⭐⭐' : ratio >= .7 ? '⭐⭐' : '⭐';
  el('bilanScore').textContent = pts + ' / ' + total;
  el('bilanScoreTexte').textContent = parFormes ? 'formes bien coloriées' : 'réussis du premier coup';
  el('bilanTemps').textContent = duree(secondes);
  el('bilanMessage').textContent = ratio >= .9 ? 'Magnifique ! Tu maîtrises ce niveau.' : ratio >= .7 ? 'Très bon travail ! Tu peux passer au niveau suivant.' : ratio >= .5 ? 'Beau travail ! Tu peux refaire ce niveau pour gagner plus d’étoiles.' : 'Tu as terminé le niveau, bravo pour tes efforts ! Refais-le pour t’entraîner encore.';
  el('bilanSuivant').hidden = niv >= act.niveaux.length;
  el('bilan').hidden = false; el('bilanTitre').focus();
  const sv = el('bilanSauvegarde'); sv.className = 'bilan-sauvegarde'; vider(sv);
  if (!EC.connecte()) {
    sv.append('Ton score n’est pas enregistré, car tu n’es pas connecté. ');
    const a = node('a', null, 'Me connecter'); a.href = EC.lienConnexion(); sv.append(a);
    return;
  }
  sv.textContent = 'Enregistrement de ton résultat…';
  const envoi = { activity: act.id, level: niv, score: pts, total, seconds: secondes };
  const essayer = async () => {
    const r = await EC.enregistrerNiveau(envoi);
    vider(sv);
    if (r.ok) { sv.className = 'bilan-sauvegarde ok'; sv.textContent = '✓ Résultat enregistré dans ton compte.'; resultatsServeur && resultatsServeur.push({ ...envoi, activity: act.id }); }
    else if (r.raison === 'enseignante') sv.textContent = 'Compte enseignante : les résultats ne sont pas enregistrés pendant les essais.';
    else { sv.className = 'bilan-sauvegarde erreur'; sv.append('Ton résultat n’a pas été enregistré. ' + (r.message || '') + ' '); const b = node('button', 'bouton-doux', 'Réessayer'); b.type = 'button'; b.onclick = () => { sv.textContent = 'Enregistrement…'; essayer(); }; sv.append(b); }
  };
  essayer();
}
el('bilanSuivant').onclick = () => commencer(niv + 1);
el('bilanRefaire').onclick = () => commencer(niv);
el('bilanMenu').onclick = () => { el('bilan').hidden = true; afficherMenu(); };
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !el('bilan').hidden) el('bilanMenu').click(); });

/* ---------- reading the instruction aloud ---------- */
/* Sentence read by the 🔊 button: the instruction + the actual parts of the question
   (items, numbers, choices), so the student does not need to read. */
const ou = l => l.length < 2 ? (l[0] || '') : l.slice(0, -1).join(', ') + ' ou ' + l[l.length - 1];
const et = l => l.length < 2 ? (l[0] || '') : l.slice(0, -1).join(', ') + ' et ' + l[l.length - 1];
const FEMININ = ['pomme', 'casquette', 'banane', 'boîte de crayons', 'pizza', 'boisson', 'petite voiture'];
const PLURIELS = ['chaussettes', 'frites', 'chaussures', 'écouteurs'];
/* "Ourson" → "l’ourson", "Pomme" → "la pomme", "Frites" → "les frites" (French articles). */
function avecArticle(nom) {
  const n = nom.charAt(0).toLowerCase() + nom.slice(1);
  if (/^(le|la|les|l’|l'|un|une|des) /i.test(n)) return n;
  if (PLURIELS.includes(n)) return 'les ' + n;
  if (/^\d/.test(n)) return n;
  if (/^[aeiouyéèêàâîïô]/i.test(n)) return 'l’' + n;
  return (FEMININ.includes(n) ? 'la ' : 'le ') + n;
}
const dollars = p => p + (p > 1 ? ' dollars' : ' dollar');
/* "2 $ + 1 $" → "2 dollars plus 1 dollar"; "A · B" → "A, B". */
const argent = t => String(t).replace(/(\d+(?:,\d+)?) \$/g, (_, n) => dollars(parseFloat(n.replace(',', '.')))).split(' + ').join(' plus ').split(' · ').join(', ');
const phrase = t => { t = t.trim(); return t ? t.charAt(0).toUpperCase() + t.slice(1) + (/[.?!]$/.test(t) ? '' : '.') : ''; };
const SIGNE = { '+': 'plus', '−': 'moins', '×': 'fois', '÷': 'divisé par' };
const NOM_FORME = { cercle: 'un cercle', triangle: 'un triangle', carre: 'un carré', rectangle: 'un rectangle', pentagone: 'un pentagone', hexagone: 'un hexagone', ovale: 'un ovale', losange: 'un losange' };
const ORAL = {
  fraccolor(q) { return q.texte; },
  reste(q) { return q.oral || q.texte; },
  trous(q) { return 'Trouve les chiffres cachés dans ce calcul en colonnes : une ' + (q.op === '+' ? 'addition' : 'soustraction') + '. Commence par la colonne des unités.'; },
  ordre(q) { return q.oral || (q.texte + ' Les nombres sont : ' + q.nombres.join(', ') + '.'); },
  position(q) { return q.oral || q.texte; },
  colonnes(q) {
    const op = SIGNE[q.op], u = (x) => x % 10;
    return (q.op === '+' ? 'Additionne ' : 'Soustrais ') + 'en colonnes : ' + q.a + ' ' + op + ' ' + q.b + '. Commence par les unités, à droite : ' + u(q.a) + ' ' + op + ' ' + u(q.b) + '. Si tu as besoin, regroupe.';
  },
  quiz(q) { return el('consigne').textContent + ' ' + (q.indices ? q.indices.join(' ') + ' ' : '') + (q.texte ? q.texte + ' ' : '') + (q.suite ? 'Suite : ' + q.suite.join(', ') + ', et ensuite ? ' : '') + (q.equations ? q.equations.join('. ') + '. ' + q.question + ' ' : '') + 'Réponds : ' + ou(q.choix) + '.'; },
  dessin(q) { return oralDessin(q); },
  droite(q) { return oralDroite(q); },
  plan(q) { return el('consigne').textContent + (q.choix ? ' Réponds : ' + ou(q.choix) + '.' : ''); },
  calcul(q) {
    const [a, b, c] = q.v, op = SIGNE[q.op];
    if (q.blank === 2) return 'Combien fait ' + a + ' ' + op + ' ' + b + ' ?';
    if (q.blank === 1) return a + ' ' + op + ' quel nombre fait ' + c + ' ?';
    return 'Quel nombre ' + op + ' ' + b + ' fait ' + c + ' ?';
  },
  finance(q) {
    const morceaux = [phrase(q.title), phrase(argent(q.story || ''))];
    const items = q.items || [];
    // Remind the items and their prices, unless the story already gives them or the student must click on them.
    const dejaDit = items.every(([, , p]) => (q.story || '').includes(p + ' $'));
    if (items.length && !q.cliquer && q.type2 !== 'basket' && !dejaDit) morceaux.push(phrase(et(items.map(([, n, p]) => avecArticle(argent(n)) + ' à ' + dollars(p)))));
    if (q.receipt) morceaux.push(phrase('Sur le reçu : ' + et(q.receipt.map(([n, p]) => n.toLowerCase() + ' à ' + dollars(p))) + '. Total affiché : ' + dollars(q.reportedTotal)));
    if (q.money && !q.cliquer) morceaux.push(phrase(q.money.map(([n, m]) => n + ' : ' + argent(m)).join('. ')));
    const question = argent(q.question).replace(/\s*[.?]$/, ''), interro = /\?$/.test(q.question);
    let fin = '';
    if (q.cliquer && q.money) fin = ' : ' + ou(q.money.map(([n, m]) => n + ', ' + argent(m)));
    else if (q.cliquer) fin = ' parmi ' + ou(items.map(([, n, p], k) => (c => /dollar/.test(c) ? c : c + ' à ' + dollars(p))(avecArticle(argent(q.choices ? q.choices[k] : n)))));
    else if (q.type2 === 'basket') fin = '. Voici les articles : ' + et(items.map(([, n, p]) => avecArticle(n) + ' à ' + dollars(p)));
    morceaux.push(question + fin + (interro && q.type2 !== 'basket' ? ' ?' : '.'));
    if (q.type2 === 'choice' && !q.cliquer) morceaux.push('Réponds : ' + ou(q.choices.map(argent)) + '.');
    return morceaux.filter(Boolean).join(' ');
  },
  choix(q) {
    if (q.oral) return q.oral;
    let t = q.texte;
    if (q.visuel && q.visuel.bandes && q.type === 'choix') t += ' La bande A ou la bande B ?';
    else if (q.visuel && q.visuel.forme && /nom/.test(t)) t += ' Est-ce ' + ou(q.choix.map(c => NOM_FORME[Object.keys(M.formesNoms).find(k => M.formesNoms[k] === c)] || c)) + ' ?';
    else t += ' Réponds : ' + ou(q.choix) + '.';
    return t;
  },
  nombre(q) {
    if (q.oral) return q.oral;
    const v = q.visuel || {};
    if (v.suite) return 'Observe la suite : ' + v.suite.join(', ') + '. Quel nombre vient ensuite ?';
    if (v.bandes && q.unite === 'cm') return 'La bande A mesure ' + v.bandes[0] + ' centimètres. La bande B mesure ' + v.bandes[1] + ' centimètres. ' + q.texte;
    return q.texte;
  },
  colorier(q) {
    const leg = q.legende || M.coloriages[q.dessin].legende;
    return el('consigne').textContent + ' ' + leg.map(t => 'Le ' + M.legende[t][0] + ' pour les ' + PLURIEL[t].toLowerCase()).join('. ') + '.';
  }
};
function texteOral() {
  const q = qs[i], f = q && ORAL[q.type];
  const t = (f ? f(q) : el('consigne').textContent).replace(/\[(\d+|\?)\/(\d+|\?)\]/g, (_, n, d) => fracMots(+n, +d));
  return t.split('−').join(' moins ').split('×').join(' fois ').split('$').join('dollars').replace(/[⬅➡⬆⬇]\uFE0F?\s*/g, '');
}
if ('speechSynthesis' in window) {
  el('ecouter').onclick = () => {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texteOral());
    u.lang = 'fr-CA'; u.rate = .9; speechSynthesis.speak(u);
  };
} else el('ecouter').hidden = true;

/* ======================= DISPLAY OF EACH TYPE ======================= */
function champNombre(label, unite, nom) {
  const l = node('label', 'champ-nombre'); l.append(node('span', null, label));
  const ligne = node('span', 'ligne'); const inp = node('input'); inp.name = nom || 'reponse'; inp.inputMode = 'numeric'; inp.autocomplete = 'off'; inp.maxLength = 6;
  inp.addEventListener('input', () => { inp.value = inp.value.split(/\D/).join(''); });
  ligne.append(inp); if (unite) ligne.append(node('span', 'unite', unite)); l.append(ligne); return l;
}
function boutonsChoix(choix, multiple) {
  const g = node('div', 'choix' + (choix.length > 3 ? ' choix-grille' : ''));
  g.setAttribute('role', 'group');
  choix.forEach((c, k) => {
    const b = node('button', 'choix-bouton', c); b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.dataset.k = k;
    b.onclick = () => {
      if (multiple) { b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); }
      else { g.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); choixFait = k; }
    };
    g.append(b);
  });
  return g;
}
/* Clickable item cards (one answer, or several for the basket). */
function cartesCliquables(liste, remplir, multiple) {
  const g = node('div', 'articles articles-clic'); g.setAttribute('role', 'group');
  liste.forEach((x, k) => {
    const b = node('button', 'article choix-carte'); b.type = 'button'; b.dataset.k = k; b.setAttribute('aria-pressed', 'false');
    remplir(b, x);
    b.onclick = () => {
      if (multiple) b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
      else { g.querySelectorAll('.choix-carte').forEach(o => o.setAttribute('aria-pressed', String(o === b))); choixFait = k; }
    };
    g.append(b);
  });
  return g;
}
const choisis = () => [...el('champ').querySelectorAll('.choix-bouton[aria-pressed=true],.choix-carte[aria-pressed=true]')].map(b => Number(b.dataset.k));
const val = nom => { const x = el('champ').querySelector('[name="' + (nom || 'reponse') + '"]'); return x ? x.value.trim() : ''; };
function manque(t) { message('incorrect', t); return null; }

const FORMES_SVG = { cercle: ['circle', { cx: 120, cy: 95, r: 62 }], triangle: ['polygon', { points: '120,25 35,160 205,160' }], carre: ['rect', { x: 55, y: 30, width: 130, height: 130 }], rectangle: ['rect', { x: 25, y: 50, width: 190, height: 95 }], pentagone: ['polygon', { points: '120,20 200,75 170,160 70,160 40,75' }], hexagone: ['polygon', { points: '70,30 170,30 215,95 170,160 70,160 25,95' }], ovale: ['ellipse', { cx: 120, cy: 95, rx: 95, ry: 50 }], losange: ['polygon', { points: '120,20 215,95 120,170 25,95' }] };
function dessinForme(f, rot, cls) {
  const s = svg('svg', { viewBox: '0 0 240 190', role: 'img', 'aria-label': 'Forme à observer', class: cls || 'forme' });
  const g = svg('g', { transform: 'rotate(' + (rot || 0) + ' 120 95)', fill: '#a8dce1', stroke: '#15576a', 'stroke-width': 5, 'stroke-linejoin': 'round' });
  const [tag, a] = FORMES_SVG[f]; g.append(svg(tag, a)); s.append(g); return s;
}
function horloge(h, m) {
  const d = node('div', 'horloge');
  let marks = ''; for (let k = 0; k < 60; k++) { const a = k * Math.PI / 30, r1 = k % 5 === 0 ? 98 : 106; marks += '<line x1="' + (120 + r1 * Math.sin(a)) + '" y1="' + (120 - r1 * Math.cos(a)) + '" x2="' + (120 + 112 * Math.sin(a)) + '" y2="' + (120 - 112 * Math.cos(a)) + '" stroke="currentColor" stroke-width="' + (k % 5 === 0 ? 3 : 1) + '"/>'; }
  let labels = ''; for (let k = 1; k <= 12; k++) { const a = k * Math.PI / 6; labels += '<text x="' + (120 + 84 * Math.sin(a)) + '" y="' + (120 - 84 * Math.cos(a) + 7) + '" text-anchor="middle" fill="currentColor" font-size="20" font-weight="700">' + k + '</text>'; }
  const ha = (h % 12 + m / 60) * Math.PI / 6, ma = m * Math.PI / 30;
  d.innerHTML = '<svg viewBox="0 0 240 240" role="img" aria-label="Horloge : petite aiguille rouge pour les heures, grande aiguille bleue pour les minutes"><circle cx="120" cy="120" r="116" fill="white" stroke="currentColor" stroke-width="4"/>' + marks + labels + '<line x1="120" y1="120" x2="' + (120 + 52 * Math.sin(ha)) + '" y2="' + (120 - 52 * Math.cos(ha)) + '" stroke="#b3263f" stroke-width="9" stroke-linecap="round"/><line x1="120" y1="120" x2="' + (120 + 82 * Math.sin(ma)) + '" y2="' + (120 - 82 * Math.cos(ma)) + '" stroke="#216aa8" stroke-width="5" stroke-linecap="round"/><circle cx="120" cy="120" r="6" fill="currentColor"/></svg>';
  return d;
}
function visuelCommun(v, q) {
  const box = el('visuel');
  if (!v) return;
  if (v.blocs) box.append(blocsBaseDix(v.blocs));
  if (v.grand) { const g = node('div', 'gros-nombre gros-texte', v.grand); box.append(g); }
  if (v.motif) box.append(motifPoints(v.motif));
  if (v.frac) box.append(dessinFraction(v.frac));
  if (v.liste) {
    const s = node('div', 'suite liste-ordonnee'); v.liste.forEach(x => s.append(x === '?' ? node('span', 'trou', '?') : node('span', null, String(x)))); box.append(s);
  }
  if (v.chiffres) {
    const n = String(v.chiffres.n), k = v.chiffres.pos, w = node('div', 'gros-nombre'); w.setAttribute('aria-label', 'Le nombre ' + n);
    n.split('').forEach((c, i) => w.append(node('span', i === n.length - 1 - k ? 'chiffre-vise' : null, c))); box.append(w);
  }
  if (v.forme) box.append(dessinForme(v.forme, v.rotation));
  if (v.bandes) {
    const [a, b] = v.bandes, max = Math.max(a, b), cm = q.type === 'nombre';
    const wrap = node('div', 'bandes');
    [['A', a, 'bande-a'], ['B', b, 'bande-b']].forEach(([nom, len, cls]) => {
      const ligne = node('div', 'bande-ligne');
      ligne.append(node('strong', null, 'Bande ' + nom + (cm ? ' · ' + len + ' cm' : '')));
      const piste = node('div', 'bande-piste' + (v.regle ? ' regle' : '')); if (v.regle) piste.style.setProperty('--n', max);
      const barre = node('div', 'bande ' + cls); barre.style.width = (100 * len / max) + '%';
      barre.setAttribute('role', 'img'); barre.setAttribute('aria-label', 'Bande ' + nom + (cm ? ', ' + len + ' centimètres' : ''));
      piste.append(barre); ligne.append(piste); wrap.append(ligne);
    });
    box.append(wrap);
  }
  if (v.jetons) {
    const t = node('div', 'jetons'); t.setAttribute('role', 'img'); t.setAttribute('aria-label', v.jetons + ' jetons');
    for (let k = 0; k < v.jetons; k++) t.append(node('span', 'jeton'));
    const p = node('div', 'personnes'); for (let k = 0; k < v.groupes; k++) p.append(node('span', null, '🙂 Personne ' + (k + 1)));
    box.append(t, p);
  }
  if (v.suite) {
    const s = node('div', 'suite'); v.suite.forEach(x => s.append(node('span', null, String(x)))); s.append(node('span', 'trou', '?')); box.append(s);
  }
}

/* ======================= CARTESIAN PLANE ("plan" type) =======================
   Modes: case (click a cell A1…E5), caseLire (name a cell), deplacer (arrows),
   lire / partie (choose an answer), placer and mystere (click a point on the plane).
   Fixed colours: x-axis and first number in red, y-axis and second number in blue. */
const PL = { x: '#c8372d', y: '#2364aa', grille: '#dbe5ec', choix: '#e08a1e', bon: '#2c8a55', encre: '#16324f' };
const planNeg = v => v < 0 ? '−' + (-v) : String(v);
const planCoord = (x, y) => '(' + planNeg(x) + ', ' + planNeg(y) + ')';
const memePoint = (a, b) => !!a && !!b && a[0] === b[0] && a[1] === b[1];
let planEtat = {};
function badgeCoord(x, y, avant) {
  const b = node('p', 'plan-cible'); if (avant) b.append(node('span', 'plan-cible-mot', avant));
  const cx = node('b', 'plan-x', planNeg(x)), cy = node('b', 'plan-y', planNeg(y));
  b.append('( ', cx, ' , ', cy, ' )'); return b;
}
function txtSvg(parent, x, y, s, attrs) { const t = svg('text', Object.assign({ x, y, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, attrs || {})); t.textContent = s; parent.append(t); return t; }
/* Draws a plane from min to max (labels written every "pas"). */
function planSVG(o) {
  const min = o.min || 0, max = o.max || 6, pas = o.pas || 1, n = max - min, S = Math.min(56, 440 / n), M = 46, W = n * S + 2 * M;
  const s = svg('svg', { viewBox: '0 0 ' + W + ' ' + W, class: 'plan-svg', role: 'img', 'aria-label': 'Plan de ' + planNeg(min) + ' à ' + max });
  const X = v => M + (v - min) * S, Y = v => M + (max - v) * S, a0 = min < 0 ? 0 : min;
  s.append(svg('rect', { x: 0, y: 0, width: W, height: W, fill: '#fff', rx: 14 }));
  for (let v = min; v <= max; v++) { s.append(svg('line', { x1: X(v), y1: Y(min), x2: X(v), y2: Y(max), stroke: PL.grille, 'stroke-width': 1.5 })); s.append(svg('line', { x1: X(min), y1: Y(v), x2: X(max), y2: Y(v), stroke: PL.grille, 'stroke-width': 1.5 })); }
  s.append(svg('line', { x1: X(min), y1: Y(a0), x2: X(max) + 14, y2: Y(a0), stroke: PL.x, 'stroke-width': 3.5 }), svg('path', { d: 'M' + (X(max) + 24) + ',' + Y(a0) + ' l-11,-7 v14 z', fill: PL.x }));
  s.append(svg('line', { x1: X(a0), y1: Y(min), x2: X(a0), y2: Y(max) - 14, stroke: PL.y, 'stroke-width': 3.5 }), svg('path', { d: 'M' + X(a0) + ',' + (Y(max) - 24) + ' l-7,11 h14 z', fill: PL.y }));
  txtSvg(s, X(max) + 18, Y(a0) + 20, 'x', { fill: PL.x, 'font-weight': 700, 'font-size': 19 });
  txtSvg(s, X(a0) + 20, Y(max) - 22, 'y', { fill: PL.y, 'font-weight': 700, 'font-size': 19 });
  for (let v = min; v <= max; v++) {
    if (v % pas) continue;
    if (v === 0) { txtSvg(s, X(0) - (min < 0 ? 12 : 0), Y(0) + (min < 0 ? 16 : 20), '0', { fill: min < 0 ? '#5b6b78' : PL.x, 'font-weight': 700, 'font-size': 15 }); continue; }
    txtSvg(s, X(v), Y(a0) + 20, planNeg(v), { fill: PL.x, 'font-weight': 700, 'font-size': 15 });
    txtSvg(s, X(a0) - 18, Y(v), planNeg(v), { fill: PL.y, 'font-weight': 700, 'font-size': 15 });
  }
  /* Direction cues: the sign gives the direction (+ right and up, − left and down). */
  if (o.sens && min < 0) {
    const pastille = (x, y, t, c) => { const w = 46; s.append(svg('rect', { x: x - w / 2, y: y - 13, width: w, height: 26, rx: 13, fill: '#fff', stroke: c, 'stroke-width': 2 })); txtSvg(s, x, y + 1, t, { fill: c, 'font-weight': 700, 'font-size': 17 }); };
    pastille(X(max) - S * 0.9, Y(0) - 22, '+ →', PL.x); pastille(X(min) + S * 0.9, Y(0) - 22, '← −', PL.x);
    pastille(X(0) + 34, Y(max) + S * 0.6, '↑ +', PL.y); pastille(X(0) + 34, Y(min) - S * 0.6, '↓ −', PL.y);
  }
  const g = svg('g'); s.append(g);
  const api = {
    s, X, Y, min, max,
    point(x, y, couleur, r, cls) { const c = svg('circle', { cx: X(x), cy: Y(y), r: r || 9, fill: couleur || PL.encre }); if (cls) c.setAttribute('class', cls); g.append(c); return c; },
    nom(x, y, t) { txtSvg(g, X(x) + 15, Y(y) - 15, t, { fill: PL.encre, 'font-weight': 700, 'font-size': 17 }); },
    emoji(x, y, e, t) { txtSvg(g, X(x), Y(y), e, { 'font-size': t || 26 }); },
    lignes(x, y) {
      g.append(svg('line', { x1: X(x), y1: Y(a0), x2: X(x), y2: Y(y), stroke: PL.x, 'stroke-width': 3, 'stroke-dasharray': '6 5' }));
      g.append(svg('line', { x1: X(a0), y1: Y(y), x2: X(x), y2: Y(y), stroke: PL.y, 'stroke-width': 3, 'stroke-dasharray': '6 5' }));
    },
    trait(a, b, couleur, ep) { g.append(svg('line', { x1: X(a[0]), y1: Y(a[1]), x2: X(b[0]), y2: Y(b[1]), stroke: couleur || PL.encre, 'stroke-width': ep || 4, 'stroke-linecap': 'round' })); },
    poly(pts, couleur) { g.append(svg('polygon', { points: pts.map(p => X(p[0]) + ',' + Y(p[1])).join(' '), fill: couleur, 'fill-opacity': .2 })); },
    cliquable(choisir) {
      const vise = svg('circle', { r: 11, fill: 'none', stroke: '#5b6b78', 'stroke-width': 2, visibility: 'hidden' }); s.append(vise);
      const val = e => { const p = s.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const q = p.matrixTransform(s.getScreenCTM().inverse()); const c = v => Math.max(min, Math.min(max, v)); return [c(Math.round((q.x - M) / S) + min), c(max - Math.round((q.y - M) / S))]; };
      s.classList.add('plan-actif'); s.setAttribute('tabindex', '0'); s.setAttribute('role', 'application');
      s.setAttribute('aria-label', 'Plan : clique sur un point, ou utilise les flèches du clavier pour déplacer ton point');
      s.addEventListener('pointermove', e => { const [x, y] = val(e); vise.setAttribute('cx', X(x)); vise.setAttribute('cy', Y(y)); vise.setAttribute('visibility', 'visible'); });
      s.addEventListener('pointerleave', () => vise.setAttribute('visibility', 'hidden'));
      s.addEventListener('click', e => { if (!resolu) choisir(val(e)); });
      s.addEventListener('keydown', e => {
        if (planEtat.multi && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); if (!resolu && planEtat.curseur) choisir(planEtat.curseur); return; }
        const d = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key]; if (!d || resolu) return; e.preventDefault();
        if (planEtat.multi) { const c = planEtat.curseur || [a0, a0]; planEtat.curseur = [Math.max(min, Math.min(max, c[0] + d[0])), Math.max(min, Math.min(max, c[1] + d[1]))]; planEtat.dessiner(); const m = el('visuel').querySelector('.plan-actif'); m && m.focus(); return; }
        const p = planEtat.sel || [a0, a0]; choisir([Math.max(min, Math.min(max, p[0] + d[0])), Math.max(min, Math.min(max, p[1] + d[1]))]);
        const n = el('visuel').querySelector('.plan-actif'); n && n.focus();
      });
    }
  };
  return api;
}
/* Level 1 grid: columns A to E at the bottom, rows 1 to 5 on the side. */
function grilleCases(q) {
  const S = 66, M = 52, W = 5 * S + M + 20, s = svg('svg', { viewBox: '0 0 ' + W + ' ' + W, class: 'plan-svg', role: 'group', 'aria-label': 'Grille : colonnes A à E, rangées 1 à 5' });
  const X = c => M + c * S, Y = l => 16 + (4 - l) * S;
  for (let c = 0; c < 5; c++) for (let l = 0; l < 5; l++) {
    const nom = 'ABCDE'[c] + (l + 1), choisi = planEtat.sel === nom, bonne = planEtat.montrer && nom === q.reponse;
    const r = svg('rect', { x: X(c), y: Y(l), width: S, height: S, fill: bonne ? '#d9f2e4' : choisi ? '#fde7c8' : '#fff', stroke: bonne ? PL.bon : choisi ? PL.choix : '#c3d3dd', 'stroke-width': choisi || bonne ? 4 : 2 });
    if (q.mode === 'case') {
      r.setAttribute('class', 'plan-case'); r.setAttribute('tabindex', '0'); r.setAttribute('role', 'button'); r.setAttribute('aria-label', 'Case ' + nom);
      const prendre = () => { if (resolu) return; planEtat.sel = nom; choixFait = nom; planEtat.dessiner(); const n = el('visuel').querySelector('[aria-label="Case ' + nom + '"]'); n && n.focus(); };
      r.addEventListener('click', prendre); r.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); prendre(); } });
    }
    s.append(r);
  }
  for (let c = 0; c < 5; c++) txtSvg(s, X(c) + S / 2, Y(0) + S + 20, 'ABCDE'[c], { fill: PL.x, 'font-weight': 700, 'font-size': 22 });
  for (let l = 0; l < 5; l++) txtSvg(s, M - 22, Y(l) + S / 2, String(l + 1), { fill: PL.y, 'font-weight': 700, 'font-size': 22 });
  if (q.emoji) txtSvg(s, X(q.cible[0]) + S / 2, Y(q.cible[1]) + S / 2, q.emoji, { 'font-size': 32, 'pointer-events': 'none' });
  return s;
}
function dessinerPlan(q) {
  const zone = planEtat.zone; zone.textContent = '';
  if (q.mode === 'case' || q.mode === 'caseLire') { zone.append(grilleCases(q)); return; }
  const p = planSVG(q), fin = resolu, montrer = planEtat.montrer;
  (q.deco || []).forEach(([x, y, e]) => p.emoji(x, y, e));
  if (q.donnes) {
    const c = q.donnes.map(d => [d[1], d[2]]); p.trait(c[0], c[1], '#8aa0b2', 3); p.trait(c[1], c[2], '#8aa0b2', 3);
    if (fin && !montrer) { p.trait(c[2], q.cible, PL.bon, 3); p.trait(q.cible, c[0], PL.bon, 3); }
    q.donnes.forEach(([n, x, y]) => { p.point(x, y, PL.encre, 8); p.nom(x, y, n); });
  }
  if (q.mode === 'mystere') {
    const faits = q.pts.slice(0, q.k + (fin && !montrer ? 1 : 0));
    for (let k = 1; k < faits.length; k++) p.trait(faits[k - 1], faits[k], 'var(--cat,#1f7350)', 4);
    if (planEtat.termine) { p.trait(q.pts[q.pts.length - 1], q.pts[0], 'var(--cat,#1f7350)', 4); p.poly(q.pts, '#1f7350'); }
    faits.forEach(([x, y]) => p.point(x, y, 'var(--cat,#1f7350)', 7));
  }
  if (q.mode === 'lire' || q.mode === 'partie') {
    const [x, y] = q.pt;
    if (q.mode === 'partie' && (fin || montrer)) { const X0 = p.X(0), Y0 = p.Y(0), x1 = x > 0 ? p.X(q.max) : p.X(q.min), y1 = y > 0 ? p.Y(q.max) : p.Y(q.min); p.s.querySelector('g').prepend(svg('rect', { x: Math.min(X0, x1), y: Math.min(Y0, y1), width: Math.abs(x1 - X0), height: Math.abs(y1 - Y0), fill: PL.bon, 'fill-opacity': .14 })); }
    if (q.mode === 'lire' && (planEtat.aide || fin)) p.lignes(x, y);
    if (q.emoji) p.emoji(x, y, q.emoji, 30); else { p.point(x, y, PL.encre, 10); p.nom(x, y, 'P'); }
  }
  if (q.mode === 'deplacer') {
    const ch = planEtat.chemin; for (let k = 1; k < ch.length; k++) p.trait(ch[k - 1], ch[k], ch[k][1] === ch[k - 1][1] ? PL.x : PL.y, 5);
    p.point(0, 0, '#8aa0b2', 6);
    if (montrer) { p.lignes(q.cible[0], q.cible[1]); p.point(q.cible[0], q.cible[1], PL.bon, 10, 'plan-clignote'); }
    const [x, y] = planEtat.pos, rb = svg('g', { transform: 'translate(' + p.X(x) + ',' + p.Y(y) + ')' });
    rb.append(svg('rect', { x: -15, y: -15, width: 30, height: 30, rx: 8, fill: 'var(--cat,#1f7350)' }), svg('circle', { cx: -5, cy: -3, r: 3.2, fill: '#fff' }), svg('circle', { cx: 5, cy: -3, r: 3.2, fill: '#fff' }), svg('path', { d: 'M-6 6 q6 5 12 0', stroke: '#fff', 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' }));
    p.s.querySelector('g').append(rb);
  }
  if (q.mode === 'placer' || q.mode === 'mystere') {
    if (planEtat.aide && !fin) p.lignes(q.cible[0], q.cible[1]);
    const s = planEtat.sel;
    if (s && !(fin && !montrer && q.mode === 'mystere')) { p.lignes(s[0], s[1]); p.point(s[0], s[1], fin && !montrer ? PL.bon : PL.choix, 10); }
    if (montrer) p.point(q.cible[0], q.cible[1], PL.bon, 11, 'plan-clignote');
    if (q.tresor && fin && !montrer) p.emoji(q.cible[0], q.cible[1], '💰', 30);
    if (!fin) p.cliquable(([x, y]) => { planEtat.sel = [x, y]; choixFait = x + ',' + y; dessinerPlan(q); });
  }
  zone.append(p.s);
}
function boutonAide(q) {
  const b = node('button', 'bouton-doux plan-aide', '💡 Montrer les lignes'); b.type = 'button'; b.setAttribute('aria-pressed', 'false');
  b.onclick = () => { planEtat.aide = !planEtat.aide; b.setAttribute('aria-pressed', String(planEtat.aide)); b.textContent = planEtat.aide ? '💡 Cacher les lignes' : '💡 Montrer les lignes'; dessinerPlan(q); };
  return b;
}
function consignePlan(q) {
  if (q.texte) return q.texte;
  if (q.mode === 'placer') return 'Place le point ' + planCoord(q.cible[0], q.cible[1]) + ' : clique sur le plan, puis sur Vérifier.';
  if (q.mode === 'lire') return 'Quelle est la position du point P ?';
  if (q.mode === 'mystere') return 'Dessin mystère : place le point ' + (q.k + 1) + ' sur ' + q.pts.length + ', ' + planCoord(q.cible[0], q.cible[1]) + '. Clique sur le plan, puis sur Vérifier.';
  return '';
}
function renduPlan(q) {
  if (q._aide) q.aide = q._aide; else q._aide = q.aide;
  planEtat = { zone: node('div', 'plan-zone'), sel: null, aide: false, montrer: false, termine: false, pos: [0, 0], chemin: [[0, 0]] };
  planEtat.dessiner = () => dessinerPlan(q);
  texteConsigne(consignePlan(q));
  const v = el('visuel'), champ = el('champ');
  if ((q.mode === 'placer' && !q.donnes && !q.tresor) || q.mode === 'mystere') v.append(badgeCoord(q.cible[0], q.cible[1], 'Place le point'));
  if (q.mode === 'deplacer' && /^Va au point/.test(q.texte)) v.append(badgeCoord(q.cible[0], q.cible[1], 'Va au point'));
  if (q.mode === 'mystere') {
    const l = node('p', 'plan-liste'); l.append(node('span', null, 'Points du dessin : '));
    q.pts.forEach((p, k) => { const s = node('span', k < q.k ? 'fait' : k === q.k ? 'actuel' : null, planCoord(p[0], p[1])); l.append(s); if (k < q.pts.length - 1) l.append(' → '); });
    v.append(l);
  }
  v.append(planEtat.zone); dessinerPlan(q);
  if (q.mode === 'case') champ.append(node('p', 'indice-clic', '👆 Clique sur une case de la grille.'));
  if (q.mode === 'caseLire' || q.mode === 'lire' || q.mode === 'partie') champ.append(boutonsChoix(q.choix));
  if (q.mode === 'lire') champ.append(boutonAide(q));
  if ((q.mode === 'placer' || q.mode === 'mystere') && !q.donnes) champ.append(boutonAide(q));
  if (q.mode === 'deplacer') {
    const pad = node('div', 'plan-pad'); pad.setAttribute('role', 'group'); pad.setAttribute('aria-label', 'Flèches pour déplacer le robot');
    [['haut', '⬆', 0, 1, 'Monter'], ['gauche', '⬅', -1, 0, 'Aller à gauche'], ['bas', '⬇', 0, -1, 'Descendre'], ['droite', '➡', 1, 0, 'Aller à droite']].forEach(([c, t, dx, dy, nom]) => {
      const b = node('button', 'plan-fleche ' + c, t); b.type = 'button'; b.setAttribute('aria-label', nom);
      b.onclick = () => { if (resolu) return; const x = planEtat.pos[0] + dx, y = planEtat.pos[1] + dy; if (x < (q.min || 0) || y < (q.min || 0) || x > q.max || y > q.max) return; planEtat.pos = [x, y]; planEtat.chemin.push([x, y]); dessinerPlan(q); };
      pad.append(b);
    });
    const raz = node('button', 'bouton-doux', '↺ Recommencer'); raz.type = 'button';
    raz.onclick = () => { if (resolu) return; planEtat.pos = [0, 0]; planEtat.chemin = [[0, 0]]; dessinerPlan(q); };
    const ligne = node('div', 'plan-commandes'); ligne.append(pad, raz); champ.append(ligne);
  }
}
function verifPlan(q) {
  if (q.mode === 'case') { if (!choixFait) return manque('Clique sur une case de la grille.'); return choixFait === q.reponse; }
  if (q.mode === 'caseLire' || q.mode === 'lire' || q.mode === 'partie') { if (choixFait === null) return manque('Clique sur une réponse.'); const ok = choixFait === q.reponse; if (ok && q.mode !== 'caseLire') dessinerApres(q); return ok; }
  if (q.mode === 'deplacer') {
    if (planEtat.chemin.length < 2) return manque('Utilise les flèches pour déplacer le robot.');
    const ok = memePoint(planEtat.pos, q.cible);
    if (!ok) q.aide = 'Le robot est en ' + planCoord(planEtat.pos[0], planEtat.pos[1]) + '. ' + q._aide;
    return ok;
  }
  if (!planEtat.sel) return manque('Clique sur le plan pour placer ton point.');
  const ok = memePoint(planEtat.sel, q.cible);
  if (!ok) q.aide = 'Ton point est en ' + planCoord(planEtat.sel[0], planEtat.sel[1]) + '. ' + q._aide;
  else {
    dessinerApres(q);
    if (q.mode === 'mystere' && q.k === q.pts.length - 1) setTimeout(() => { planEtat.termine = true; dessinerPlan(q); el('retour').textContent += ' Le dessin est terminé : c’est ' + q.forme + ' !'; }, 0);
  }
  return ok;
}
/* Redraws the plane right after the right answer (the engine then sets "resolu" to true). */
function dessinerApres(q) { setTimeout(() => dessinerPlan(q), 0); }

/* ======================= DRAWING A LINE ("droite" type) =======================
   Modes: tableLire, completer, pointTable, placerTous, completerTracer, lireDroite, regle. */
const nombreSigne = v => Number(String(v).split('−').join('-'));
/* Box for a whole number, which accepts a minus sign at the start. */
function caseNombre(nom, etiquette) {
  const inp = node('input', 'case-valeur'); inp.name = nom; inp.inputMode = 'text'; inp.autocomplete = 'off'; inp.maxLength = 4; inp.setAttribute('aria-label', etiquette);
  inp.addEventListener('input', () => { inp.value = [...inp.value].filter((c, k) => /\d/.test(c) || (k === 0 && (c === '-' || c === '−'))).join(''); inp.classList.remove('a-revoir'); });
  return inp;
}
function tableValeurs(q, opts) {
  const t = q.table, trous = opts.trous || [], tab = node('table', 'table-valeurs');
  const cap = node('caption', null, opts.titre || 'Table de valeurs'); tab.append(cap);
  [['x', t.xs, 'tv-x'], ['y', t.ys, 'tv-y']].forEach(([nom, vals, cls]) => {
    const tr = node('tr', cls); const th = node('th', null, nom); th.scope = 'row'; tr.append(th);
    vals.forEach((v, k) => {
      const td = node('td', k === opts.surligne ? 'tv-colonne' : null);
      if (nom === 'y' && trous.includes(k)) td.append(caseNombre('y' + k, 'Valeur de y quand x = ' + planNeg(t.xs[k])));
      else td.textContent = planNeg(v);
      tr.append(td);
    });
    tab.append(tr);
  });
  const w = node('div', 'table-defile'); w.append(tab); return w;
}
function traceDroite(p, a, b, couleur, etiquette) {
  const lo = Math.max(p.min, (p.min - b) / a), hi = Math.min(p.max, (p.max - b) / a);
  p.trait([lo, a * lo + b], [hi, a * hi + b], couleur, 4);
  if (etiquette) { const x = hi, y = a * hi + b; txtSvg(p.s.querySelector('g'), p.X(x) - 10, p.Y(y) + 4, etiquette, { fill: couleur, 'font-weight': 700, 'font-size': 17, 'text-anchor': 'end', 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 5 }); }
}
function dessinerDroite(q) {
  const zone = planEtat.zone; zone.textContent = '';
  const p = planSVG(q), t = q.table, fin = resolu, montrer = planEtat.montrer, ok = fin && !montrer;
  if (q.mode === 'lireDroite') {
    traceDroite(p, t.a, t.b, 'var(--cat,#46610f)');
    if (planEtat.aide || fin) p.lignes(q.x, q.reponse);
    if (fin) p.point(q.x, q.reponse, PL.bon, 9);
    zone.append(p.s); return;
  }
  if (ok || montrer) traceDroite(p, t.a, t.b, ok ? 'var(--cat,#46610f)' : PL.bon, t.regle);
  if (montrer) q.cibles.forEach(([x, y]) => p.point(x, y, PL.bon, 10, 'plan-clignote'));
  const sels = planEtat.sels;
  sels.forEach(([x, y]) => p.point(x, y, ok ? 'var(--cat,#46610f)' : PL.choix, 9));
  if (planEtat.curseur && !fin) p.s.querySelector('g').append(svg('circle', { cx: p.X(planEtat.curseur[0]), cy: p.Y(planEtat.curseur[1]), r: 13, fill: 'none', stroke: '#2364aa', 'stroke-width': 3 }));
  if (!fin) p.cliquable(([x, y]) => {
    const k = sels.findIndex(s => s[0] === x && s[1] === y);
    if (q.mode === 'pointTable') planEtat.sels = k >= 0 ? [] : [[x, y]];
    else if (k >= 0) sels.splice(k, 1); else sels.push([x, y]);
    planEtat.curseur = [x, y]; dessinerDroite(q);
    const n = el('visuel').querySelector('.plan-actif'); n && document.activeElement && document.activeElement.tagName === 'svg' && n.focus();
  });
  zone.append(p.s);
}
function renduDroite(q) {
  if (q._aide) q.aide = q._aide; else q._aide = q.aide;
  planEtat = { zone: node('div', 'plan-zone'), sels: [], aide: false, montrer: false, multi: true, curseur: null };
  planEtat.dessiner = () => dessinerDroite(q);
  const v = el('visuel'), champ = el('champ'), t = q.table;
  const textes = { completer: 'Complète la table de valeurs avec la règle ' + t.regle + ', puis clique sur Vérifier.', lireDroite: q.texte };
  texteConsigne(q.texte || textes[q.mode] || '');
  if (['completer', 'completerTracer'].includes(q.mode)) v.append(node('p', 'regle-badge', 'Règle : ' + t.regle));
  if (q.mode === 'tableLire' || q.mode === 'regle') v.append(tableValeurs(q, {}));
  if (q.mode === 'pointTable' || q.mode === 'placerTous') v.append(tableValeurs(q, { surligne: q.k }));
  if (q.mode === 'completer') champ.append(tableValeurs(q, { trous: q.trous }));
  if (q.mode === 'completerTracer') { champ.append(tableValeurs(q, { trous: q.trous, titre: '1. Complète la table' }), node('p', 'etape-titre', '2. Place les points sur le plan'), planEtat.zone); dessinerDroite(q); }
  if (['pointTable', 'placerTous', 'lireDroite'].includes(q.mode)) { v.append(planEtat.zone); dessinerDroite(q); }
  if (q.mode === 'tableLire' || q.mode === 'lireDroite') { const c = node('label', 'champ-nombre'); c.append(node('span', null, 'Ta réponse'), caseNombre('reponse', 'Ta réponse')); champ.append(c); }
  if (q.mode === 'lireDroite') champ.append(boutonAideDroite(q));
  if (q.mode === 'regle') champ.append(boutonsChoix(q.choix));
  if (q.mode === 'placerTous' || q.mode === 'completerTracer') champ.append(node('p', 'indice-clic', '👆 Clique sur le plan pour placer un point. Clique encore dessus pour l’enlever.'));
}
function boutonAideDroite(q) {
  const b = node('button', 'bouton-doux plan-aide', '💡 Montrer les lignes'); b.type = 'button';
  b.onclick = () => { planEtat.aide = !planEtat.aide; b.textContent = planEtat.aide ? '💡 Cacher les lignes' : '💡 Montrer les lignes'; dessinerDroite(q); };
  return b;
}
function lireCases(q) { return q.trous.map(k => { const x = el('champ').querySelector('[name=y' + k + ']'); return [k, x, x.value.trim()]; }); }
function verifTable(q) {
  const cases = lireCases(q);
  if (cases.some(c => !c[2] || c[2] === '-' || c[2] === '−')) return manque('Écris un nombre dans chaque case vide de la table.');
  const faux = cases.filter(([k, , val]) => nombreSigne(val) !== q.table.ys[k]);
  cases.forEach(([k, x]) => x.classList.toggle('a-revoir', faux.some(f => f[0] === k)));
  if (faux.length) q.aide = (faux.length === 1 ? 'Une case est à revoir (en orange). ' : faux.length + ' cases sont à revoir (en orange). ') + q._aide;
  return !faux.length;
}
function verifDroite(q) {
  if (q.mode === 'tableLire' || q.mode === 'lireDroite') {
    const x = el('champ').querySelector('[name=reponse]').value.trim(); if (!x || x === '-' || x === '−') return manque('Écris ta réponse dans la case.');
    const ok = nombreSigne(x) === q.reponse; if (ok && q.mode === 'lireDroite') setTimeout(() => dessinerDroite(q), 0); return ok;
  }
  if (q.mode === 'regle') { if (choixFait === null) return manque('Clique sur une règle.'); return choixFait === q.reponse; }
  if (q.mode === 'completer') return verifTable(q);
  if (q.mode === 'completerTracer') { const t = verifTable(q); if (t !== true) return t; }
  const sels = planEtat.sels;
  if (!sels.length) return manque(q.mode === 'completerTracer' ? 'La table est juste ! Place maintenant les points sur le plan.' : 'Clique sur le plan pour placer ' + (q.cibles.length > 1 ? 'les points.' : 'le point.'));
  const bons = sels.filter(s => q.cibles.some(c => memePoint(s, c))).length;
  const ok = bons === q.cibles.length && sels.length === q.cibles.length;
  if (!ok) q.aide = (q.cibles.length > 1 ? bons + ' point' + (bons > 1 ? 's' : '') + ' sur ' + q.cibles.length + ' bien placé' + (bons > 1 ? 's' : '') + (sels.length > q.cibles.length ? ', et il y a trop de points' : '') + '. ' : 'Ton point est en ' + planCoord(sels[0][0], sels[0][1]) + '. ') + q._aide;
  else setTimeout(() => { dessinerDroite(q); if (q.cibles.length > 1) el('retour').textContent += ' Les points sont alignés : voici la droite ' + q.table.regle + '.'; }, 0);
  return ok;
}
function montrerDroite(q) {
  planEtat.montrer = true;
  if (q.trous) q.trous.forEach(k => { const x = el('champ').querySelector('[name=y' + k + ']'); if (x) { x.value = planNeg(q.table.ys[k]); x.classList.remove('a-revoir'); x.classList.add('montree'); } });
  if (q.mode === 'tableLire' || q.mode === 'lireDroite') { const x = el('champ').querySelector('[name=reponse]'); x.value = planNeg(q.reponse); x.classList.add('montree'); }
  if (q.mode === 'regle') { const b = el('champ').querySelectorAll('.choix-bouton')[q.reponse]; b && b.classList.add('bonne'); }
  if (planEtat.zone.isConnected) dessinerDroite(q);
}
function reponseDroite(q) {
  if (q.mode === 'tableLire' || q.mode === 'lireDroite') return planNeg(q.reponse);
  if (q.mode === 'regle') return q.choix[q.reponse];
  if (q.mode === 'completer') return q.trous.map(k => 'y = ' + planNeg(q.table.ys[k]) + ' quand x = ' + planNeg(q.table.xs[k])).join(', ');
  return (q.trous ? q.trous.map(k => 'y = ' + planNeg(q.table.ys[k])).join(', ') + ' ; ' : '') + 'les points ' + q.cibles.map(c => planCoord(c[0], c[1])).join(', ');
}
function oralDroite(q) {
  const t = q.table; let s = el('consigne').textContent.split(t.regle).join(t.regleOrale);
  if (t.xs.length && q.mode !== 'lireDroite') s += ' Table : ' + t.xs.map((x, k) => 'x = ' + planNeg(x) + ', y = ' + ((q.trous || []).includes(k) ? 'case vide' : planNeg(t.ys[k]))).join(' ; ') + '.';
  if (q.choix) s += ' Réponds : ' + ou(q.choix.map(c => c.split(t.regle).join(t.regleOrale))) + '.';
  return s;
}

/* ======================= DRAWING ON A PLANE ("dessin" type) =======================
   A shape is drawn on the plane; next to it, a "Point | x | y" table to complete.
   Animated demo: point A moves step by step (x in red, then y in blue)
   and its numbers are written in the table. */
const lentement = !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const NOMS_POINTS = 'ABCDEFGHIJ'.split('');
const nomsDe = q => q.noms || NOMS_POINTS.slice(0, q.pts.length);
/* Animates the steps of a point: first horizontal (x), then vertical (y). */
function animerPas(api, x, y, vivant, quand) {
  const g = svg('g'); api.s.append(g);
  const a0 = api.min < 0 ? 0 : api.min, attente = lentement ? 420 : 0;
  const compteur = txtSvg(g, api.X(a0), api.Y(a0) - 26, '', { fill: PL.x, 'font-weight': 700, 'font-size': 20, 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 6 });
  return new Promise(fin => {
    let k = 0; const sx = Math.sign(x), sy = Math.sign(y);
    const pasX = () => {
      if (!vivant()) return;
      if (k < Math.abs(x)) {
        k++; const px = a0 + sx * k;
        g.append(svg('line', { x1: api.X(px - sx), y1: api.Y(a0), x2: api.X(px), y2: api.Y(a0), stroke: PL.x, 'stroke-width': 12, 'stroke-opacity': .45, 'stroke-linecap': 'round' }));
        g.append(svg('circle', { cx: api.X(px), cy: api.Y(a0), r: 7, fill: '#fff', stroke: PL.x, 'stroke-width': 3.5 }));
        compteur.setAttribute('x', api.X(px)); compteur.setAttribute('y', api.Y(a0) - 18); compteur.textContent = sx < 0 ? '← −' + k : k + ' →';
        setTimeout(pasX, attente);
      } else { quand && quand('x'); k = 0; compteur.setAttribute('fill', PL.y); setTimeout(pasY, attente); }
    };
    const pasY = () => {
      if (!vivant()) return;
      if (k < Math.abs(y)) {
        k++; const py = a0 + sy * k;
        g.append(svg('line', { x1: api.X(x), y1: api.Y(py - sy), x2: api.X(x), y2: api.Y(py), stroke: PL.y, 'stroke-width': 12, 'stroke-opacity': .45, 'stroke-linecap': 'round' }));
        g.append(svg('circle', { cx: api.X(x), cy: api.Y(py), r: 7, fill: '#fff', stroke: PL.y, 'stroke-width': 3.5 }));
        compteur.setAttribute('x', api.X(x) + 34); compteur.setAttribute('y', api.Y(py)); compteur.textContent = sy < 0 ? '↓ −' + k : '↑ ' + k;
        setTimeout(pasY, attente);
      } else { quand && quand('y'); compteur.textContent = ''; fin(); }
    };
    setTimeout(pasX, attente);
  });
}
const phrasePas = (v, axe) => v === 0 ? 'aucun pas ' + (axe === 'x' ? 'horizontal' : 'vertical') + ', donc ' + axe + ' = 0'
  : Math.abs(v) + ' pas ' + (axe === 'x' ? (v > 0 ? 'vers la droite' : 'vers la gauche') : (v > 0 ? 'vers le haut' : 'vers le bas')) + (v < 0 ? ' : le signe − montre ce sens, donc ' : ', donc ') + axe + ' = ' + planNeg(v);
/* Shape + named points on the plane. */
function dessinerForme(q) {
  const zone = planEtat.zone; zone.textContent = '';
  const p = planSVG(Object.assign({}, q, { sens: true })), noms = nomsDe(q), pts = q.pts, fin = resolu;
  if (pts.length >= 3) { p.poly(pts, '#2f6f3a'); for (let k = 0; k < pts.length; k++) p.trait(pts[k], pts[(k + 1) % pts.length], '#2f6f3a', 4); }
  else if (pts.length === 2) p.trait(pts[0], pts[1], '#2f6f3a', 4);
  const cx = pts.reduce((s, p2) => s + p2[0], 0) / pts.length, cy = pts.reduce((s, p2) => s + p2[1], 0) / pts.length;
  pts.forEach(([x, y], k) => {
    const actif = planEtat.focus === k;
    if (actif) p.s.querySelector('g').append(svg('circle', { cx: p.X(x), cy: p.Y(y), r: 16, fill: '#fde7c8', stroke: PL.choix, 'stroke-width': 3 }));
    p.point(x, y, fin ? PL.bon : PL.encre, 8);
    let dx = x - cx, dy = y - cy; const n = Math.hypot(dx, dy) || 1; dx /= n; dy /= n;
    if (pts.length === 1) { dx = .7; dy = .7; }
    txtSvg(p.s.querySelector('g'), p.X(x) + dx * 22, p.Y(y) - dy * 22, noms[k], { fill: actif ? '#a35a00' : PL.encre, 'font-weight': 700, 'font-size': 20, 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 5 });
  });
  planEtat.api = p; zone.append(p.s);
}
function tablePoints(q) {
  const noms = nomsDe(q), t = node('table', 'table-points');
  t.append(node('caption', null, 'Table de valeurs'));
  const h = node('tr'); [['Point', '', ''], ['x', 'tp-x', '→ +   ← −'], ['y', 'tp-y', '↑ +   ↓ −']].forEach(([s, c, sens]) => { const th = node('th', c, s); th.scope = 'col'; if (sens) { th.append(node('small', 'tp-sens', sens)); } h.append(th); }); t.append(h);
  q.pts.forEach((pt, k) => {
    const tr = node('tr'); tr.dataset.k = k; const th = node('th', null, noms[k]); th.scope = 'row'; tr.append(th);
    ['x', 'y'].forEach(a => { const td = node('td'); const inp = caseNombre(a + k, a + ' du point ' + noms[k]); inp.addEventListener('focus', () => { if (planEtat.focus !== k && !planEtat.anim) { planEtat.focus = k; dessinerForme(q); } }); td.append(inp); tr.append(td); });
    t.append(tr);
  });
  return t;
}
/* Demo on point A: animation, then the numbers are written in the table. */
async function demonstration(q, k) {
  const [x, y] = q.pts[k], nom = nomsDe(q)[k], jeton = Symbol('demo');
  planEtat.jeton = jeton; planEtat.anim = true; planEtat.focus = k; dessinerForme(q);
  const ix = el('champ').querySelector('[name=x' + k + ']'), iy = el('champ').querySelector('[name=y' + k + ']'), txt = planEtat.texteDemo;
  txt.hidden = false; txt.textContent = 'Démonstration avec le point ' + nom + ' : je pars de 0 et je compte les pas horizontaux (x)…';
  [ix, iy].forEach(i => { i.value = ''; i.readOnly = true; i.classList.add('demo'); });
  await animerPas(planEtat.api, x, y, () => jeton === planEtat.jeton, axe => {
    if (axe === 'x') { ix.value = planNeg(x); ix.classList.add('ecrit'); txt.textContent = nom + ' : ' + phrasePas(x, 'x') + '. Puis je compte les pas verticaux (y)…'; }
    else { iy.value = planNeg(y); iy.classList.add('ecrit'); txt.textContent = nom + ' : ' + phrasePas(x, 'x') + ', puis ' + phrasePas(y, 'y') + '. On écrit ' + nom + planCoord(x, y) + ' dans la table. À toi pour les autres points !'; }
  });
  if (jeton !== planEtat.jeton) return;
  planEtat.anim = false; planEtat.demoFaite = k;
  const suivant = el('champ').querySelector('[name=x' + (k + 1) + ']'); if (suivant) suivant.focus({ preventScroll: true });
}
/* Interactive explanation of the plane (levels 1 and 9). */
function introPlan(type) {
  const d = node('details', 'lecon intro-plan'); d.open = i === 0;
  d.append(node('summary', null, '📘 Comprendre le plan cartésien'));
  const etapes = [
    ['Voici un plan cartésien : deux axes qui se croisent au point 0. Ils sont gradués des deux côtés : en positif et en négatif.', null],
    ['L’axe horizontal (de gauche à droite) s’appelle x. Vers la droite, les pas horizontaux sont positifs : 4 pas, c’est x = 4.', [4, 0]],
    ['Vers la gauche, les pas horizontaux sont négatifs : 3 pas vers la gauche, c’est x = −3.', [-3, 0]],
    ['L’axe vertical (de bas en haut) s’appelle y. Vers le haut, les pas verticaux sont positifs : 3 pas, c’est y = 3.', [0, 3]],
    ['Vers le bas, les pas verticaux sont négatifs : 2 pas vers le bas, c’est y = −2.', [0, -2]],
    ['Le nombre dit combien de pas. Le signe dit dans quel sens : + vers la droite ou vers le haut, − vers la gauche ou vers le bas.', 'sens'],
    ['Pour aller au point P : d’abord les pas horizontaux, puis les pas verticaux. 3 pas à droite, puis 2 pas en haut : P(3, 2).', [3, 2], 'P'],
    ['Pour le point Q : 4 pas à gauche, puis 3 pas en bas : Q(−4, −3).', [-4, -3], 'Q'],
    ['Dans la table de valeurs, on écrit le nom du point, son x et son y.', 'table']
  ];
  const corps = node('div', 'intro-corps'), texte = node('p', 'intro-texte'), zone = node('div', 'intro-zone'), nav = node('div', 'intro-nav');
  const prec = node('button', 'bouton-doux', '◀ Retour'), rejouer = node('button', 'bouton-doux', '↻ Rejouer'), suiv = node('button', 'bouton-principal', 'Suivant ▶');
  [prec, rejouer, suiv].forEach(b => { b.type = 'button'; nav.append(b); });
  const num = node('span', 'intro-num'); nav.prepend(num);
  let e = 0, jeton = null;
  const montrer = () => {
    const [t, cible, nomPt] = etapes[e]; texte.textContent = t; num.textContent = 'Étape ' + (e + 1) + ' sur ' + etapes.length;
    prec.disabled = e === 0; suiv.disabled = e === etapes.length - 1;
    jeton = null; zone.textContent = '';
    const p = planSVG({ min: -5, max: 5, sens: true }); zone.append(p.s);
    if (cible === 'table') {
      p.point(3, 2, PL.encre, 9); p.nom(3, 2, 'P'); p.point(-4, -3, PL.encre, 9); p.nom(-4, -3, 'Q');
      const t2 = node('table', 'table-points petite'); t2.innerHTML = '<tr><th>Point</th><th class="tp-x">x</th><th class="tp-y">y</th></tr><tr><th>P</th><td class="tp-x">3</td><td class="tp-y">2</td></tr><tr><th>Q</th><td class="tp-x">−4</td><td class="tp-y">−3</td></tr>'; zone.append(t2);
      return;
    }
    if (cible === 'sens') {
      [[3, 0, '+3', PL.x], [-3, 0, '−3', PL.x], [0, 3, '+3', PL.y], [0, -3, '−3', PL.y]].forEach(([x, y, t, c], k) => {
        setTimeout(() => { if (!zone.isConnected) return; p.trait([0, 0], [x, y], c, 6); p.point(x, y, '#fff', 7); txtSvg(p.s.querySelector('g'), p.X(x) + (x ? 0 : 26), p.Y(y) + (y ? 0 : -20), t, { fill: c, 'font-weight': 700, 'font-size': 20, 'paint-order': 'stroke', stroke: '#fff', 'stroke-width': 5 }); }, lentement ? 500 * k : 0);
      });
      return;
    }
    if (!cible) { p.s.querySelectorAll('line').forEach(l => { if (l.getAttribute('stroke') === PL.x || l.getAttribute('stroke') === PL.y) l.setAttribute('stroke-width', 6); }); return; }
    const [x, y] = cible; if (nomPt) { p.point(x, y, PL.encre, 9); p.nom(x, y, nomPt); }
    const moi = jeton = Symbol('intro'); animerPas(p, x, y, () => moi === jeton && zone.isConnected);
  };
  prec.onclick = () => { if (e > 0) { e--; montrer(); } };
  suiv.onclick = () => { if (e < etapes.length - 1) { e++; montrer(); } };
  rejouer.onclick = montrer;
  corps.append(texte, zone, nav); d.append(corps);
  if (act.video) { const vd = node('details', 'video-box'); vd.append(node('summary', null, '🎬 Regarder la vidéo explicative')); const v = node('video'); v.controls = true; v.preload = 'metadata'; v.setAttribute('playsinline', ''); v.src = act.video; vd.append(v); d.append(vd); }
  d.addEventListener('toggle', () => { if (d.open) montrer(); });
  if (d.open) setTimeout(montrer, 0);
  return d;
}
function renduDessin(q) {
  if (q._aide) q.aide = q._aide; else q._aide = q.aide;
  planEtat = { zone: node('div', 'plan-zone'), focus: null, anim: false, jeton: null, demoFaite: null };
  const lv = act.niveaux[niv - 1];
  texteConsigne(q.texte);
  if (lv.intro) el('visuel').append(introPlan(lv.intro));
  const cote = node('div', 'dessin-cote'), droite = node('div', 'dessin-table');
  planEtat.texteDemo = node('p', 'demo-texte'); planEtat.texteDemo.hidden = true; planEtat.texteDemo.setAttribute('aria-live', 'polite');
  droite.append(tablePoints(q), planEtat.texteDemo);
  if (q.pts.length > 1 && !q.demo) {
    const b = node('button', 'bouton-doux bouton-demo', '▶ Voir la démonstration avec le point ' + nomsDe(q)[0]); b.type = 'button';
    b.onclick = () => { if (!resolu && !planEtat.anim) demonstration(q, 0); }; droite.append(b);
  }
  cote.append(planEtat.zone, droite); el('champ').append(cote);
  dessinerForme(q);
  if (q.demo && q.pts.length > 1) setTimeout(() => demonstration(q, 0), lentement ? 500 : 0);
}
function verifDessin(q) {
  if (planEtat.anim) return manque('Attends la fin de la démonstration.');
  const noms = nomsDe(q), cases = [];
  q.pts.forEach((pt, k) => ['x', 'y'].forEach((a, j) => { const inp = el('champ').querySelector('[name=' + a + k + ']'); cases.push({ k, a, inp, v: inp.value.trim(), bon: pt[j] }); }));
  if (cases.some(c => !c.v || c.v === '-' || c.v === '−')) return manque('Écris un nombre dans chaque case de la table (x et y pour chaque point).');
  const faux = cases.filter(c => nombreSigne(c.v) !== c.bon);
  cases.forEach(c => c.inp.classList.toggle('a-revoir', faux.includes(c)));
  if (faux.length) {
    const f = faux[0], pt = q.pts[f.k], signe = faux.find(c => Math.abs(nombreSigne(c.v)) === Math.abs(c.bon) && c.bon !== 0);
    if (signe) {
      const sens = signe.a === 'x' ? (signe.bon < 0 ? 'vers la gauche, donc x est négatif (−)' : 'vers la droite, donc x est positif (sans signe −)') : (signe.bon < 0 ? 'vers le bas, donc y est négatif (−)' : 'vers le haut, donc y est positif (sans signe −)');
      q.aide = 'Point ' + noms[signe.k] + ' : le nombre de pas est bon, mais regarde le sens. Les pas vont ' + sens + '. Le signe, c’est le sens !';
    } else q.aide = 'Regarde le point ' + noms[f.k] + ' (' + (f.a === 'x' ? 'x : les pas horizontaux' : 'y : les pas verticaux') + '). ' + q._aide;
    planEtat.focus = f.k; dessinerForme(q);
    return false;
  }
  setTimeout(() => dessinerForme(q), 0);
  return true;
}
function montrerDessin(q) {
  planEtat.jeton = null; planEtat.anim = false;
  q.pts.forEach((pt, k) => ['x', 'y'].forEach((a, j) => { const inp = el('champ').querySelector('[name=' + a + k + ']'); if (inp && nombreSigne(inp.value) !== pt[j]) { inp.value = planNeg(pt[j]); inp.classList.remove('a-revoir'); inp.classList.add('montree'); } }));
  dessinerForme(q);
}
const reponseDessin = q => nomsDe(q).map((n, k) => n + planCoord(q.pts[k][0], q.pts[k][1])).join(', ');
const oralDessin = q => el('consigne').textContent + ' Les points sont ' + et(nomsDe(q)) + '.';

/* ======================= CHALLENGES ("quiz", "memo", "simon" types) ======================= */
function renduQuiz(q) {
  texteConsigne(q.titre);
  const v = el('visuel');
  if (q.indices) { const ul = node('ul', 'quiz-indices'); q.indices.forEach(t => ul.append(node('li', null, '💡 ' + t))); v.append(ul); }
  if (q.texte) v.append(node('p', 'quiz-texte', q.texte));
  if (q.suite) { const s = node('div', 'suite'); q.suite.forEach(x => s.append(node('span', null, x))); s.append(node('span', 'trou', '?')); v.append(s); }
  if (q.equations) { const b = node('div', 'quiz-equations'); q.equations.forEach(t => b.append(node('div', null, t))); const d = node('div', 'quiz-question'); d.append(node('strong', null, q.question)); b.append(d); v.append(b); }
  const g = boutonsChoix(q.choix); g.classList.add('quiz-choix'); el('champ').append(g);
}
function verifQuiz(q) {
  if (choixFait === null) return manque('Clique sur une réponse.');
  const ok = choixFait === q.reponse;
  if (ok && q.expl) setTimeout(() => { el('retour').textContent += ' ' + q.expl; }, 0);
  return ok;
}
/* Memory game: match each calculation with its result. Passed "on the first try"
   if the number of moves is at most the number of pairs + 2. */
function renduMemo(q) {
  texteConsigne('Retourne deux cartes qui ont la même valeur, par exemple un calcul et son résultat.');
  el('verifier').hidden = true;
  const cartes = q.paires.flatMap((p, k) => p.map(t => ({ t, k }))).map((c, i) => [((i * 7919) % 13) + Math.random(), c]).sort((a, b) => a[0] - b[0]).map(a => a[1]);
  let ouvertes = [], trouvees = 0, coups = 0, bloque = false;
  const g = node('div', 'memo-grille'); g.setAttribute('role', 'group'); g.setAttribute('aria-label', 'Cartes');
  cartes.forEach((c, i) => {
    const b = node('button', 'memo-carte', '?'); b.type = 'button'; b.setAttribute('aria-label', 'Carte ' + (i + 1) + ', cachée');
    b.onclick = () => {
      if (resolu || bloque || b.classList.contains('vue') || b.classList.contains('trouve')) return;
      b.classList.add('vue'); b.textContent = c.t; b.setAttribute('aria-label', 'Carte ' + (i + 1) + ', ' + c.t); ouvertes.push([b, c]);
      if (ouvertes.length < 2) return;
      coups++; const [a, d] = ouvertes; ouvertes = [];
      if (a[1].k === d[1].k) {
        [a, d].forEach(x => { x[0].classList.remove('vue'); x[0].classList.add('trouve'); });
        trouvees++;
        if (trouvees === q.paires.length) { essais = coups <= q.paires.length + 2 ? 0 : 1; reussite(); el('retour').textContent += ' Toutes les paires en ' + coups + ' coups.'; }
        else message('correct', 'Même valeur : ' + a[1].t + ' = ' + d[1].t + '. Continue.');
      } else {
        bloque = true; message('incorrect', a[1].t + ' et ' + d[1].t + ' n’ont pas la même valeur. Retiens où elles sont.');
        setTimeout(() => { [a, d].forEach(x => { x[0].classList.remove('vue'); x[0].textContent = '?'; }); bloque = false; }, 1300);
      }
    };
    g.append(b);
  });
  el('champ').append(g);
}
/* Colour sequence: watch the sequence light up, then repeat it (forwards or backwards). */
const SIMON = { rouge: ['🔴', 'Rouge'], bleu: ['🔵', 'Bleu'], vert: ['🟢', 'Vert'], jaune: ['🟡', 'Jaune'] };
let simonRep = [], simonJeton = 0;
function renduSimon(q) {
  simonRep = []; const jeton = ++simonJeton;
  texteConsigne('Appuie sur « Regarder ». Retiens la suite de ' + q.suite.length + ' couleurs, puis refais-la' + (q.envers ? ' à l’envers, en commençant par la dernière.' : '.'));
  const pads = node('div', 'simon-pads'), trace = node('div', 'simon-trace'); trace.setAttribute('aria-label', 'Ta suite');
  const boutons = {};
  const flash = (c, ms) => { boutons[c].classList.add('allume'); setTimeout(() => boutons[c].classList.remove('allume'), ms); };
  let libre = false;
  Object.entries(SIMON).forEach(([c, [e, n]]) => {
    const b = node('button', 'simon-pad'); b.type = 'button'; b.dataset.c = c; b.append(node('span', 'e', e), node('span', null, n)); boutons[c] = b;
    b.onclick = () => { if (!libre || resolu) return; simonRep.push(c); trace.append(node('span', null, e)); flash(c, 250); };
    pads.append(b);
  });
  const regarder = node('button', 'bouton-principal', '▶ Regarder'); regarder.type = 'button';
  const effacer = node('button', 'bouton-doux', '↺ Effacer'); effacer.type = 'button';
  regarder.onclick = () => {
    libre = false; simonRep = []; trace.textContent = ''; let k = 0; const vite = Math.max(500, 850 - q.suite.length * 40);
    const pas = () => { if (jeton !== simonJeton) return; if (k < q.suite.length) { flash(q.suite[k], vite * 0.7); k++; setTimeout(pas, vite); } else libre = true; };
    setTimeout(pas, 400);
  };
  effacer.onclick = () => { simonRep = []; trace.textContent = ''; };
  const outils = node('div', 'simon-outils'); outils.append(regarder, effacer);
  el('visuel').append(pads);
  el('champ').append(outils, trace);
}
function verifSimon(q) {
  if (!simonRep.length) return manque('Appuie sur « Regarder », puis refais la suite avec les boutons de couleur.');
  const attendu = q.envers ? [...q.suite].reverse() : q.suite;
  const ok = simonRep.length === attendu.length && simonRep.every((c, i) => c === attendu[i]);
  if (!ok) { q.aide = 'Appuie sur « Regarder » pour revoir la suite' + (q.envers ? ', puis refais-la à l’envers.' : '.'); simonRep = []; el('champ').querySelector('.simon-trace').textContent = ''; }
  return ok;
}
function montrerSimon(q) { const t = el('champ').querySelector('.simon-trace'); t.textContent = ''; (q.envers ? [...q.suite].reverse() : q.suite).forEach(c => t.append(node('span', null, SIMON[c][0]))); }

const RENDU = {
  fraccolor(q) {
    texteConsigne(q.texte);
    const box = node('div', 'frac-visuel frac-colorier'), sv = svg('svg', { role: 'group', 'aria-label': 'Touche les parts pour les colorier' }); box.append(sv);
    let parts;
    if (q.forme === 'cercle') { sv.setAttribute('viewBox', '0 0 200 200'); parts = partsCercle(sv, 100, 100, 88, q.d, 0); }
    else { sv.setAttribute('viewBox', '0 0 420 90'); parts = partsBarre(sv, 10, 15, 400, 60, q.d, 0); }
    const compte = node('p', 'frac-compte', 'Parts coloriées : 0 sur ' + q.d);
    parts.forEach((p, k) => { p.setAttribute('tabindex', '0'); p.setAttribute('role', 'button'); p.setAttribute('aria-pressed', 'false'); p.setAttribute('aria-label', 'Part ' + (k + 1));
      const basculer = () => { if (resolu) return; const on = p.getAttribute('aria-pressed') !== 'true'; p.setAttribute('aria-pressed', String(on)); p.setAttribute('fill', on ? COUL_FRAC : COUL_VIDE);
        compte.textContent = 'Parts coloriées : ' + parts.filter(x => x.getAttribute('aria-pressed') === 'true').length + ' sur ' + q.d; };
      p.addEventListener('click', basculer); p.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); basculer(); } }); });
    el('visuel').append(box); el('champ').append(compte);
  },
  reste(q) {
    texteConsigne(q.texte); visuelCommun(q.visuel, q);
    const l = node('div', 'heure-champs'); l.append(champNombre('Quotient', '', 'q'), champNombre('Reste', '', 'r')); el('champ').append(l);
  },
  trous(q) {
    texteConsigne('Trouve les chiffres cachés. Commence par la colonne des unités, à droite.');
    const n = q.n, g = node('div', 'colonnes'); g.style.setProperty('--n', n); g.setAttribute('role', 'group'); g.setAttribute('aria-label', 'Calcul en colonnes avec des chiffres cachés');
    const cell = (cls, t) => { const c = node('div', 'col-cell ' + (cls || ''), t); g.append(c); return c; };
    const colCls = i => 'col-' + LET_COL[n - 1 - i];
    const caches = new Set(q.cache.map(([r, i]) => r + ':' + i));
    cell('col-signe');
    for (let i = 0; i < n; i++) { const c = cell('col-titre ' + colCls(i), LET_COL[n - 1 - i]); c.title = NOM_COL[n - 1 - i]; }
    const ligne = (r, num, signe) => {
      cell('col-signe' + (r === 1 ? ' col-op' : ''), signe);
      chiffresDe(num, n).forEach((d, i) => {
        if (caches.has(r + ':' + i)) { const w = cell('col-rep-zone ' + colCls(i)), inp = node('input', 'col-rep trou-rep'); inp.inputMode = 'numeric'; inp.maxLength = 1; inp.dataset.v = d.trim(); inp.setAttribute('aria-label', 'Chiffre caché des ' + NOM_COL[n - 1 - i]); inp.addEventListener('input', () => { inp.value = inp.value.replace(/\D/g, '').slice(-1); }); w.append(inp); }
        else cell('col-chiffre ' + colCls(i), d.trim());
      });
    };
    ligne(0, q.a, ''); ligne(1, q.b, q.op); g.append(node('div', 'col-barre')); ligne(2, q.r, '=');
    el('champ').append(g);
    const f = g.querySelector('.trou-rep'); f && setTimeout(() => f.focus({ preventScroll: true }), 50);
  },
  ordre(q) { renduOrdre(q); },
  position(q) {
    texteConsigne(q.texte); visuelCommun(q.visuel, q);
    const n = q.n, t = node('div', 'tab-pos'); t.style.setProperty('--n', n); t.setAttribute('role', 'group'); t.setAttribute('aria-label', 'Tableau de position');
    for (let i = n - 1; i >= 0; i--) { const h = node('div', 'tp-tete tp-' + LET_POS[i], LET_POS[i]); h.title = NOMS_POS[i]; t.append(h); }
    for (let i = n - 1; i >= 0; i--) { const h = node('div', 'tp-nom tp-' + LET_POS[i], NOMS_POS[i]); t.append(h); }
    for (let i = n - 1; i >= 0; i--) {
      const w = node('div', 'tp-case tp-' + LET_POS[i]), inp = node('input', 'tp-rep'); inp.inputMode = 'numeric'; inp.maxLength = 1; inp.dataset.i = i;
      inp.setAttribute('aria-label', 'Chiffre des ' + NOMS_POS[i]);
      inp.addEventListener('input', () => { inp.value = inp.value.replace(/\D/g, '').slice(-1); if (inp.value && i > 0) { const s = t.querySelector('.tp-rep[data-i="' + (i - 1) + '"]'); s && s.focus(); } });
      w.append(inp); t.append(w);
    }
    el('champ').append(t);
  },
  colonnes(q) {
    texteConsigne(q.op === '+' ? 'Additionne en colonnes. Commence par les unités, à droite. Si la somme est 10 ou plus, regroupe 10 unités en 1 dizaine.' : 'Soustrais en colonnes. Commence par les unités, à droite. Si le chiffre du haut est plus petit, regroupe : défais 1 dizaine en 10 unités.');
    const n = q.n, g = node('div', 'colonnes'); g.style.setProperty('--n', n); g.setAttribute('role', 'group'); g.setAttribute('aria-label', 'Calcul en colonnes');
    const cell = (cls, t) => { const c = node('div', 'col-cell ' + (cls || ''), t); g.append(c); return c; };
    const colCls = i => 'col-' + LET_COL[n - 1 - i];
    cell('col-signe');
    for (let i = 0; i < n; i++) { const c = cell('col-titre ' + colCls(i), LET_COL[n - 1 - i]); c.title = NOM_COL[n - 1 - i]; }
    cell('col-signe col-petit', '');
    for (let i = 0; i < n; i++) { const w = cell('col-regroup-zone ' + colCls(i)); const inp = node('input', 'col-regroup'); inp.inputMode = 'numeric'; inp.maxLength = 2; inp.dataset.i = i; inp.setAttribute('aria-label', 'Case pour regrouper, ' + NOM_COL[n - 1 - i] + ' (facultatif)'); inp.addEventListener('input', () => { inp.value = inp.value.split(/\D/).join(''); }); w.append(inp); }
    cell('col-signe');
    chiffresDe(q.a, n).forEach((d, i) => cell('col-chiffre ' + colCls(i), d.trim()));
    cell('col-signe col-op', q.op);
    chiffresDe(q.b, n).forEach((d, i) => cell('col-chiffre ' + colCls(i), d.trim()));
    const barre = node('div', 'col-barre'); g.append(barre);
    cell('col-signe', '=');
    for (let i = 0; i < n; i++) {
      const w = cell('col-rep-zone ' + colCls(i)), inp = node('input', 'col-rep'); inp.inputMode = 'numeric'; inp.maxLength = 1; inp.name = 'chiffre'; inp.dataset.i = i;
      inp.setAttribute('aria-label', 'Chiffre des ' + NOM_COL[n - 1 - i]);
      inp.addEventListener('input', () => { inp.value = inp.value.replace(/\D/g, '').slice(-1); if (inp.value && i > 0) { const p = g.querySelector('.col-rep[data-i="' + (i - 1) + '"]'); p && p.focus(); } });
      inp.addEventListener('keydown', e => { if (e.key === 'Backspace' && !inp.value && i < n - 1) { const p = g.querySelector('.col-rep[data-i="' + (i + 1) + '"]'); p && p.focus(); } });
      w.append(inp);
    }
    el('champ').append(g, node('p', 'col-aide', '✏️ Les petites cases du haut servent à écrire tes regroupements. Elles ne sont pas corrigées.'));
    const u = g.querySelector('.col-rep[data-i="' + (n - 1) + '"]'); u && setTimeout(() => u.focus({ preventScroll: true }), 50);
  },
  plan(q) { renduPlan(q); },
  quiz(q) { renduQuiz(q); },
  memo(q) { renduMemo(q); },
  simon(q) { renduSimon(q); },
  dessin(q) { renduDessin(q); },
  droite(q) { renduDroite(q); },
  calcul(q) {
    texteConsigne(act.consigne);
    if (q.dessin) { const d = node('div', 'dessin', q.dessin); d.setAttribute('aria-hidden', 'true'); el('visuel').append(d); }
    const eq = node('div', 'equation');
    q.v.forEach((x, k) => {
      const inp = node('input', 'case' + (k === q.blank ? ' a-remplir' : '')); inp.inputMode = 'numeric'; inp.maxLength = 4;
      if (k === q.blank) { inp.name = 'reponse'; inp.setAttribute('aria-label', 'Nombre à trouver'); inp.addEventListener('input', () => { inp.value = inp.value.split(/\D/).join(''); }); }
      else { inp.value = String(x); inp.readOnly = true; inp.tabIndex = -1; inp.setAttribute('aria-label', String(x)); }
      eq.append(inp);
      if (k === 0) eq.append(node('span', 'signe', q.op)); if (k === 1) eq.append(node('span', 'signe', '='));
    });
    el('champ').append(eq);
  },
  nombre(q) { texteConsigne(q.texte); visuelCommun(q.visuel, q); el('champ').append(champNombre('Ta réponse', q.unite)); },
  choix(q) { texteConsigne(q.texte); visuelCommun(q.visuel, q); const g = boutonsChoix(q.choix); if (q.choix.every(c => String(c).length <= 2)) g.classList.add('choix-court'); el('champ').append(g); },
  heure(q) {
    texteConsigne(act.consigne); el('visuel').append(horloge(q.h, q.m));
    const l = node('div', 'heure-champs'); l.append(champNombre('Heures', 'h', 'h'), champNombre('Minutes', 'min', 'm')); el('champ').append(l);
  },
  grille(q) {
    const etapes = q.deplacements.map(([d, k]) => ({ droite: '➡️', gauche: '⬅️', haut: '⬆️', bas: '⬇️' })[d] + ' ' + k + ' case' + (k > 1 ? 's' : '') + ' ' + ({ droite: 'à droite', gauche: 'à gauche', haut: 'vers le haut', bas: 'vers le bas' })[d]);
    texteConsigne('Départ : case ' + q.depart + '. ' + etapes.join(', puis ') + '. Clique sur la case d’arrivée.');
    const liste = node('ol', 'etapes'); liste.append(node('li', 'depart', '● Départ en ' + q.depart)); etapes.forEach(t => liste.append(node('li', null, t))); el('visuel').append(liste);
    const g = node('div', 'grille'); g.style.setProperty('--n', q.n); g.setAttribute('role', 'group'); g.setAttribute('aria-label', 'Quadrillage');
    for (let y = q.n; y >= 1; y--) for (let x = 0; x < q.n; x++) {
      const c = 'ABCDE'[x] + y, b = node('button', 'case-grille' + (c === q.depart ? ' depart' : ''), (c === q.depart ? '● ' : '') + c);
      b.type = 'button'; b.dataset.c = c; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', 'Case ' + c + (c === q.depart ? ', départ' : ''));
      b.onclick = () => { g.querySelectorAll('button').forEach(o => o.setAttribute('aria-pressed', String(o === b))); choixFait = c; };
      g.append(b);
    }
    el('champ').append(g);
  },
  finance(q) {
    texteConsigne(q.question);
    const v = el('visuel'); v.append(node('h2', 'histoire-titre', q.title)); if (q.story) v.append(node('p', 'histoire', q.story));
    /* Items become buttons when the student must click on them to answer. */
    const clic = q.cliquer || q.type2 === 'basket';
    const contenuArticle = (it, [e, n, p]) => { const em = node('span', 'emoji', e); em.setAttribute('aria-hidden', 'true'); it.append(em, node('span', null, n), node('strong', 'prix', p + ' $')); };
    const contenuArgent = (it, [n, m]) => { it.append(node('strong', null, n), node('span', null, m)); };
    if (q.items && !clic) { const row = node('div', 'articles'); q.items.forEach(x => { const it = node('div', 'article'); contenuArticle(it, x); row.append(it); }); v.append(row); }
    if (q.receipt) { const r = node('div', 'recu'); r.setAttribute('aria-label', 'Reçu'); q.receipt.forEach(([n, p]) => { const l = node('div'); l.append(node('span', null, n), node('span', null, p + ' $')); r.append(l); }); const t = node('div', 'total'); t.append(node('span', null, 'TOTAL AFFICHÉ'), node('span', null, q.reportedTotal + ' $')); r.append(t); v.append(r); }
    if (q.money && !clic) { const row = node('div', 'articles'); q.money.forEach(x => { const c = node('div', 'article'); contenuArgent(c, x); row.append(c); }); v.append(row); }
    if (q.type2 === 'number') el('champ').append(champNombre('Ta réponse', '$'));
    else if (q.type2 === 'basket') el('champ').append(node('p', 'indice-clic', '👆 Clique sur ' + q.count + ' articles pour les mettre dans ton panier.'), cartesCliquables(q.items, contenuArticle, true));
    else if (q.cliquer) el('champ').append(node('p', 'indice-clic', '👆 Clique directement sur ta réponse.'), cartesCliquables(q.items || q.money, q.items ? contenuArticle : contenuArgent, false));
    else el('champ').append(boutonsChoix(q.choices));
  },
  scene(q) {
    const nom = M.formesNoms[q.cible];
    texteConsigne('Clique sur tous les ' + (q.cible === 'carre' ? 'carrés' : nom.toLowerCase() + 's') + ' du dessin.');
    el('verifier').hidden = true;
    const s = M.scenes[q.scene], parts = q.decor ? s.parts.concat(M.decor) : s.parts;
    const modele = node('div', 'modele'); modele.append(node('span', null, 'Je cherche :'), dessinForme(q.cible, 0, 'forme-modele'), node('strong', null, nom)); el('visuel').append(modele);
    const d = svg('svg', { viewBox: '0 0 520 360', class: 'scene', role: 'group', 'aria-label': s.name + ' : dessin fait de formes' });
    const total = parts.filter(p => p.type === q.cible).length;
    parts.forEach((p, k) => {
      const n = svg(p.tag, Object.assign({}, p.a, { class: 'piece', tabindex: 0, role: 'button', 'aria-label': 'Forme ' + (k + 1) }));
      const choisir = () => {
        if (resolu || sceneTrouves.has(k)) return;
        if (p.type === q.cible) {
          sceneTrouves.add(k); n.classList.add('trouve');
          if (sceneTrouves.size === total) reussite(); else message('correct', 'Oui ! ' + sceneTrouves.size + ' sur ' + total + ' trouvé' + (sceneTrouves.size > 1 ? 's' : '') + '. Continue.');
        } else { n.classList.add('rate'); setTimeout(() => n.classList.remove('rate'), 700); erreur(); }
      };
      n.addEventListener('click', choisir); n.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choisir(); } });
      n.dataset.type = p.type; d.append(n);
    });
    q._total = total; el('visuel').append(d);
  },
  /* Count the shapes in a colour picture (triangles, squares, rectangles, circles). */
  compter(q) {
    const f = M.figures[q.figure];
    texteConsigne('Combien de formes de chaque sorte vois-tu dans ce dessin ? Écris un nombre dans chaque case.');
    el('visuel').append(dessinPieces(f, 'compter', (n) => { n.classList.toggle('compte'); n.setAttribute('aria-pressed', String(n.classList.contains('compte'))); }));
    el('visuel').append(node('p', 'astuce', '💡 Astuce : clique sur une forme quand tu l’as comptée, elle devient pâle. Clique encore pour l’enlever.'));
    q._attendu = {}; SORTES_COMPTER.forEach(t => { q._attendu[t] = f.parts.filter(p => p.type === t).length; });
    const g = node('div', 'compter-champs');
    SORTES_COMPTER.forEach(t => {
      const l = node('label', 'champ-compter'); l.dataset.t = t;
      const ic = svg('svg', { viewBox: '0 0 240 190', class: 'icone-forme', 'aria-hidden': 'true' });
      const [tag, a] = FORMES_SVG[t]; ic.append(svg(tag, Object.assign({}, a, { fill: ICONES[t], stroke: '#23384e', 'stroke-width': 8 })));
      const inp = node('input'); inp.name = t; inp.inputMode = 'numeric'; inp.autocomplete = 'off'; inp.maxLength = 2;
      inp.addEventListener('input', () => { inp.value = inp.value.split(/\D/).join(''); l.classList.remove('a-revoir'); });
      l.append(ic, node('span', null, PLURIEL[t]), inp); g.append(l);
    });
    el('champ').append(g);
  },
  /* Colour according to the key: the student picks a colour, then clicks on the shapes.
     Right shape → it takes the colour. Wrong shape → error sound, it stays white.
     A shape counts in the score only if it is coloured without a mistake. */
  colorier(q) {
    const c = M.coloriages[q.dessin], leg = q.legende || c.legende; let pinceau = null;
    texteConsigne('Choisis une couleur dans la légende, puis clique sur les formes qui vont avec cette couleur.');
    el('verifier').hidden = true;
    const pieces = c.parts.filter(p => leg.includes(p.type));
    const fautes = new Set(); let faites = 0;
    q._total = pieces.length;
    el('visuel').append(dessinPieces(c, 'colorier', (n, k, p) => {
      if (n.classList.contains('coloriee')) return;
      if (!pinceau) { message('incorrect', 'Choisis d’abord une couleur dans la légende, sous le dessin.'); return; }
      if (pinceau !== p.type) {
        sonErreur(); fautes.add(k);
        n.classList.remove('rate'); void n.getBBox(); n.classList.add('rate');
        clearTimeout(n._minuterie); n._minuterie = setTimeout(() => n.classList.remove('rate'), 550);
        message('incorrect', 'Ce n’est pas la bonne forme pour le ' + M.legende[pinceau][0] + '. Le ' + M.legende[pinceau][0] + ' est pour les ' + PLURIEL[pinceau].toLowerCase() + '.');
        return;
      }
      n.classList.remove('rate'); n.classList.add('coloriee'); n.style.fill = M.legende[p.type][1];
      n.setAttribute('aria-label', PLURIEL[p.type].slice(0, -1) + ', colorié en ' + M.legende[p.type][0]);
      faites++; if (!fautes.has(k)) bonnesFormes++;
      const reste = q._total - faites;
      if (!reste) { resolu = true; etats[i] = fautes.size ? 'essai' : 'ok'; message('correct', (fautes.size ? 'Bravo, le dessin est terminé !' : 'Bravo, aucune erreur ! ⭐') + ' ' + (q._total - fautes.size) + ' forme' + (q._total - fautes.size > 1 ? 's' : '') + ' sur ' + q._total + ' bien coloriée' + (q._total - fautes.size > 1 ? 's' : '') + ' du premier coup.'); finQuestion(); }
      else message('correct', 'Oui ! Encore ' + reste + (reste > 1 ? ' formes' : ' forme') + ' à colorier.');
    }, leg));
    const pal = node('div', 'palette'); pal.setAttribute('role', 'group'); pal.setAttribute('aria-label', 'Légende : choisis une couleur');
    pal.append(node('strong', 'palette-titre', 'Légende : clique sur une couleur'));
    leg.forEach(t => {
      const b = node('button', 'pinceau'); b.type = 'button'; b.setAttribute('aria-pressed', 'false');
      const ic = svg('svg', { viewBox: '0 0 240 190', class: 'icone-forme', 'aria-hidden': 'true' });
      const [tag, a] = FORMES_SVG[t]; ic.append(svg(tag, Object.assign({}, a, { fill: M.legende[t][1], stroke: '#23384e', 'stroke-width': 8 })));
      const tx = node('span', 'pinceau-texte'); tx.append(node('span', null, PLURIEL[t]), node('b', null, '= ' + M.legende[t][0].toUpperCase())); tx.lastChild.style.color = t === 'triangle' ? '#a77d00' : M.legende[t][1];
      b.append(ic, tx);
      b.onclick = () => { pinceau = t; pal.querySelectorAll('.pinceau').forEach(x => x.setAttribute('aria-pressed', String(x === b))); el('visuel').querySelector('.scene').style.setProperty('--pinceau', M.legende[t][1]); };
      pal.append(b);
    });
    el('champ').append(pal);
  }
};
/* Small error sound (two low notes, soft volume). */
let audio = null;
function sonErreur() {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const t = audio.currentTime;
    [[0, 330], [0.16, 220]].forEach(([d, f]) => {
      const o = audio.createOscillator(), g = audio.createGain();
      o.type = 'triangle'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t + d); g.gain.exponentialRampToValueAtTime(0.35, t + d + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.15);
      o.connect(g); g.connect(audio.destination); o.start(t + d); o.stop(t + d + 0.16);
    });
  } catch { /* no sound available */ }
}
const SORTES_COMPTER = ['triangle', 'carre', 'rectangle', 'cercle'];
const PLURIEL = { triangle: 'Triangles', carre: 'Carrés', rectangle: 'Rectangles', cercle: 'Cercles', ovale: 'Ovales', hexagone: 'Hexagones' };
const ICONES = { triangle: '#5aa832', carre: '#1e63c6', rectangle: '#f7c843', cercle: '#7e57c2' };
/* Draws a picture made of pieces; the decoration pieces (lines) are not clickable. */
function dessinPieces(dessin, mode, auClic, legende) {
  const d = svg('svg', { viewBox: mode === 'colorier' ? '0 0 600 400' : '0 0 520 360', class: 'scene scene-' + mode, role: 'group', 'aria-label': dessin.nom + ' : dessin fait de formes' });
  let num = 0;
  dessin.parts.forEach((p, k) => {
    if (!p.type || (legende && !legende.includes(p.type))) { d.append(svg(p.tag, Object.assign({}, p.a, { class: 'decor' }))); return; }
    num++;
    const attrs = Object.assign({}, p.a, { class: 'piece', tabindex: 0, role: 'button', 'aria-label': 'Forme ' + num + (mode === 'colorier' ? ', pas encore coloriée' : '') });
    const n = svg(p.tag, attrs); if (p.f) n.style.fill = p.f;
    n.dataset.k = k; n.dataset.type = p.type;
    const agir = () => { if (!resolu) auClic(n, k, p); };
    n.addEventListener('click', agir); n.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); agir(); } });
    d.append(n);
  });
  return d;
}
/* Returns true (right), false (wrong) or null (incomplete answer). */
const VERIF = {
  fraccolor(q) { const n = el('visuel').querySelectorAll('.frac-colorier [aria-pressed="true"]').length; if (!n) return manque('Touche les parts pour les colorier.'); return n === q.n; },
  reste(q) { const a = val('q'), b = val('r'); if (!a || !b) return manque('Écris le quotient et le reste. S’il n’y a pas de reste, écris 0.'); return Number(a) === q.q && Number(b) === q.r; },
  trous(q) { const c = [...el('champ').querySelectorAll('.trou-rep')]; if (c.some(x => x.value === '')) return manque('Écris un chiffre dans chaque case jaune.'); return c.every(x => x.value === x.dataset.v); },
  ordre(q) { const c = [...el('champ').querySelectorAll('.ordre-case')]; if (c.some(x => !x.dataset.v)) return manque('Place tous les nombres dans la rangée.'); return c.every((x, k) => Number(x.dataset.v) === q.reponse[k]); },
  position(q) {
    const c = [...el('champ').querySelectorAll('.tp-rep')];
    if (c.some(x => x.value === '')) return manque('Écris un chiffre dans chaque case. S’il n’y a rien, écris 0.');
    return c.every(x => Number(x.value) === Math.floor(q.v / 10 ** Number(x.dataset.i)) % 10);
  },
  colonnes(q) {
    const d = [...el('champ').querySelectorAll('.col-rep')].map(x => x.value.trim());
    const premier = d.findIndex(x => x !== '');
    if (premier < 0) return manque('Écris ta réponse dans les cases du bas, en commençant par les unités.');
    if (d.slice(premier).some(x => x === '')) return manque('Écris un chiffre dans chaque case, jusqu’aux unités.');
    return Number(d.slice(premier).join('')) === q.r;
  },
  quiz(q) { return verifQuiz(q); },
  memo() { return null; },
  simon(q) { return verifSimon(q); },
  dessin(q) { return verifDessin(q); },
  droite(q) { return verifDroite(q); },
  plan(q) { return verifPlan(q); },
  calcul(q) { const v = val(); if (!v) return manque('Écris un nombre dans la case jaune.'); return Number(v) === q.v[q.blank]; },
  nombre(q) { const v = val(); if (!v) return manque('Écris ta réponse dans la case.'); return Number(v) === q.reponse; },
  choix(q) { if (choixFait === null) return manque('Clique sur une réponse.'); return choixFait === q.reponse; },
  heure(q) { const h = val('h'), m = val('m'); if (!h || !m) return manque('Écris les heures et les minutes.'); return (Number(h) % 12) === (q.h % 12) && Number(m) === q.m; },
  grille(q) { if (!choixFait) return manque('Clique sur une case de la grille.'); return choixFait === q.reponse; },
  finance(q) {
    if (q.type2 === 'number') { const v = val(); if (!v) return manque('Écris un montant.'); return Number(v) === q.answer; }
    if (q.type2 === 'basket') { const c = choisis(); if (c.length !== q.count) return manque('Clique sur exactement ' + q.count + ' articles. Tu en as choisi ' + c.length + '.'); return c.reduce((s, k) => s + q.items[k][2], 0) <= q.budget; }
    if (choixFait === null) return manque(q.cliquer ? 'Clique sur une image pour répondre.' : 'Clique sur une réponse.'); return choixFait === q.answer;
  },
  scene() { return null; },
  compter(q) {
    if (SORTES_COMPTER.some(t => !val(t))) return manque('Écris un nombre dans chaque case. S’il n’y a aucune forme de cette sorte, écris 0.');
    const faux = SORTES_COMPTER.filter(t => Number(val(t)) !== q._attendu[t]);
    el('champ').querySelectorAll('.champ-compter').forEach(l => l.classList.toggle('a-revoir', faux.includes(l.dataset.t)));
    if (!faux.length) return true;
    const noms = faux.map(t => PLURIEL[t].toLowerCase());
    q.aide = 'Recompte ' + (noms.length > 1 ? noms.slice(0, -1).map(x => 'les ' + x).join(', ') + ' et les ' + noms[noms.length - 1] : 'les ' + noms[0]) + ' (case' + (noms.length > 1 ? 's' : '') + ' en orange). Pose ton doigt sur chaque forme.';
    const premier = el('champ').querySelector('.a-revoir input'); if (premier) setTimeout(() => { premier.select(); premier.focus(); });
    return false;
  },
  colorier() { return null; }
};
const REPONSE = {
  fraccolor: q => q.n + ' parts sur ' + q.d,
  reste: q => q.q + ' reste ' + q.r,
  trous: q => q.a + ' ' + q.op + ' ' + q.b + ' = ' + q.r,
  ordre: q => q.reponse.map(n => q.affiche ? q.affiche(n) : n).join(q.sens === 'decroissant' ? ' > ' : ' < '),
  position: q => String(q.v),
  colonnes: q => String(q.r),
  quiz: q => q.choix[q.reponse] + (q.expl ? '. ' + q.expl : ''),
  memo: () => '',
  simon: q => (q.envers ? [...q.suite].reverse() : q.suite).map(c => SIMON[c][1].toLowerCase()).join(', '),
  dessin: q => reponseDessin(q),
  droite: q => reponseDroite(q),
  plan: q => q.mode === 'case' ? 'la case ' + q.reponse : q.choix ? q.choix[q.reponse] : 'le point ' + planCoord(q.cible[0], q.cible[1]),
  calcul: q => String(q.v[q.blank]),
  nombre: q => q.reponse + (q.unite ? ' ' + q.unite : ''),
  choix: q => q.choix[q.reponse],
  heure: q => q.h + ' h ' + String(q.m).padStart(2, '0'),
  grille: q => 'la case ' + q.reponse,
  finance: q => q.type2 === 'number' ? q.answer + ' $' : q.type2 === 'basket' ? panierValide(q) : q.choices[q.answer],
  scene: q => 'les formes en vert',
  compter: q => SORTES_COMPTER.map(t => q._attendu[t] + ' ' + PLURIEL[t].toLowerCase()).join(', '),
  colorier: () => ''
};
function panierValide(q) {
  const n = q.items.length;
  for (let m = 0; m < 1 << n; m++) { const ks = [...Array(n).keys()].filter(k => m >> k & 1); if (ks.length === q.count && ks.reduce((s, k) => s + q.items[k][2], 0) <= q.budget) return ks.map(k => q.items[k][1]).join(', '); }
  return '';
}
const MONTRER = {
  fraccolor(q) { el('visuel').querySelectorAll('.frac-colorier [role=button]').forEach((p, k) => { const on = k < q.n; p.setAttribute('aria-pressed', String(on)); p.setAttribute('fill', on ? '#9fc9b4' : COUL_VIDE); }); },
  reste(q) { const a = el('champ').querySelector('[name=q]'), b = el('champ').querySelector('[name=r]'); a.value = q.q; b.value = q.r; a.classList.add('montree'); b.classList.add('montree'); },
  trous() { el('champ').querySelectorAll('.trou-rep').forEach(x => { x.value = x.dataset.v; x.classList.add('montree'); }); },
  ordre(q) { el('champ').querySelectorAll('.ordre-case').forEach((x, k) => { x.dataset.v = q.reponse[k]; x.textContent = q.affiche ? q.affiche(q.reponse[k]) : q.reponse[k]; x.classList.add('montree'); }); },
  position(q) { el('champ').querySelectorAll('.tp-rep').forEach(x => { x.value = Math.floor(q.v / 10 ** Number(x.dataset.i)) % 10; x.classList.add('montree'); }); },
  colonnes(q) {
    const c = el('champ'), r = String(q.r).padStart(q.n, ' ').split(''), reg = regroupements(q);
    c.querySelectorAll('.col-rep').forEach((x, i) => { x.value = r[i].trim(); x.classList.add('montree'); });
    c.querySelectorAll('.col-regroup').forEach((x, i) => { x.value = reg[i]; if (reg[i]) x.classList.add('montree'); });
  },
  quiz(q) { const b = el('champ').querySelectorAll('.choix-bouton')[q.reponse]; b && b.classList.add('bonne'); },
  simon(q) { montrerSimon(q); },
  dessin(q) { montrerDessin(q); },
  droite(q) { montrerDroite(q); },
  plan(q) { planEtat.montrer = true; if (q.choix) { const b = el('champ').querySelectorAll('.choix-bouton')[q.reponse]; b && b.classList.add('bonne'); } dessinerPlan(q); },
  calcul(q) { const x = el('champ').querySelector('[name=reponse]'); x.value = q.v[q.blank]; x.classList.add('montree'); },
  nombre(q) { const x = el('champ').querySelector('[name=reponse]'); x.value = q.reponse; x.classList.add('montree'); },
  choix(q) { const b = el('champ').querySelectorAll('.choix-bouton')[q.reponse]; b && b.classList.add('bonne'); },
  finance(q) { if (q.type2 === 'number') { const x = el('champ').querySelector('[name=reponse]'); x.value = q.answer; x.classList.add('montree'); } else if (q.type2 === 'choice') { const b = el('champ').querySelectorAll('.choix-bouton,.choix-carte')[q.answer]; b && b.classList.add('bonne'); } },
  heure(q) { const h = el('champ').querySelector('[name=h]'), m = el('champ').querySelector('[name=m]'); h.value = q.h; m.value = q.m; h.classList.add('montree'); m.classList.add('montree'); },
  grille(q) { const b = el('champ').querySelector('[data-c="' + q.reponse + '"]'); b && b.classList.add('bonne'); },
  scene(q) { el('visuel').querySelectorAll('.piece').forEach(p => { if (p.dataset.type === q.cible) p.classList.add('trouve'); }); },
  compter(q) { SORTES_COMPTER.forEach(t => { const x = el('champ').querySelector('[name=' + t + ']'); x.value = q._attendu[t]; x.classList.add('montree'); x.parentNode.classList.remove('a-revoir'); }); }
};

/* Read only, useful for automatic tests. */
window.ECMoteur = { question: () => qs[i], niveau: () => niv, oral: () => texteOral() };

/* ======================= STARTUP ======================= */
const nParam = Number(params.get('n'));
if (Number.isInteger(nParam) && nParam >= 1 && nParam <= act.niveaux.length) commencer(nParam); else afficherMenu();
EC.mesResultats().then(r => { resultatsServeur = r; if (!el('menu').hidden) afficherMenu(); });
})();
