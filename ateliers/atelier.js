/* Hands-on workshops: one shared engine for "manipulate" games.
   The page jeu.html?j=ID loads jeux/ID.js, which calls Atelier.definir({...}).
   Each level offers rounds (6 by default). A round is created by niveau.manche(api, k)
   and returns { consigne, oral, indice, verifier() → true | false | { manque: "…" }, explication, montrer() }.
   The score (rounds passed on the first try) is saved like the other activities. */
(function () {
'use strict';
const $ = id => document.getElementById(id);
const NS = 'http://www.w3.org/2000/svg';
const node = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
const svg = (tag, attrs) => { const n = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs || {})) n.setAttribute(k, v); return n; };
const vider = n => { while (n.firstChild) n.removeChild(n.firstChild); };
const hasard = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pioche = l => l[Math.floor(Math.random() * l.length)];
const melange = l => l.map(x => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
const duree = s => s < 60 ? s + ' s' : Math.floor(s / 60) + ' min ' + String(s % 60).padStart(2, '0') + ' s';

/* Fractions written "[3/4]": displayed with a fraction bar */
const RE_FRAC = /\[(\d+|\?)\/(\d+|\?)\]/;
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
    const frag = document.createDocumentFragment();
    for (const m of t.nodeValue.split(/(\[(?:\d+|\?)\/(?:\d+|\?)\])/)) { const x = m.match(/^\[(\d+|\?)\/(\d+|\?)\]$/);
      if (x) { const f = node('span', 'frac'); f.setAttribute('role', 'img'); f.setAttribute('aria-label', fracMots(+x[1], +x[2])); f.append(node('span', 'frac-n', x[1]), node('span', 'frac-d', x[2])); frag.append(f); } else frag.append(document.createTextNode(m)); }
    t.parentNode.replaceChild(frag, t);
  }
}
new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 3 ? RE_FRAC.test(n.nodeValue) : n.nodeType === 1 && RE_FRAC.test(n.textContent)) fracDansTexte(n.nodeType === 3 ? n.parentNode : n); })
  .observe(document.body, { childList: true, subtree: true });

/* Voice */
let voix = null;
const choisirVoix = () => { if (!window.speechSynthesis) return; const v = speechSynthesis.getVoices(); voix = v.find(x => /^fr[-_]CA/i.test(x.lang)) || v.find(x => /^fr/i.test(x.lang)) || null; };
if (window.speechSynthesis) { choisirVoix(); try { speechSynthesis.addEventListener('voiceschanged', choisirVoix); } catch (e) {} }
function parler(t) {
  if (!window.speechSynthesis || !t) return;
  t = t.replace(/\[(\d+|\?)\/(\d+|\?)\]/g, (_, n, d) => fracMots(+n, +d)).split('−').join(' moins ').split('×').join(' fois ').split('÷').join(' divisé par ').replace(/(\d+),(\d\d) \$/g, '$1 dollars $2').replace(/ \$/g, ' dollars').replace(/¢/g, ' cents');
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); if (voix) { u.voice = voix; u.lang = voix.lang; } else u.lang = 'fr-CA'; u.rate = .9; speechSynthesis.speak(u); } catch (e) {}
}
/* Small sounds */
let actx = null;
function son(type) {
  try { if (!actx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return; actx = new C(); } actx.resume();
    const notes = { bravo: [72, 76, 79], encore: [64, 60], clic: [79] }[type] || [72], t0 = actx.currentTime + .02;
    notes.forEach((m, i) => { const o = actx.createOscillator(), g = actx.createGain(), t = t0 + i * .1; o.type = 'triangle'; o.frequency.value = 440 * Math.pow(2, (m - 69) / 12);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(type === 'clic' ? .04 : .1, t + .02); g.gain.exponentialRampToValueAtTime(.0005, t + .3); o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + .32); });
  } catch (e) {}
}

let jeu = null, niv = 0, manches = [], k = 0, man = null, essais = 0, resolu = false, etats = [], score = 0, debut = 0, resultats = null;
const MAX = 3;
const api = { node, svg, vider, hasard, pioche, melange, parler, son, fracMots, zone: () => $('visuel'), champ: () => $('champ'),
  /* small tool: choice buttons; returns a function that gives the chosen index */
  choix(liste, parent, classe) { const g = node('div', 'choix ' + (classe || '')); let pris = null;
    liste.forEach((c, i) => { const b = node('button', 'choix-bouton', c); b.type = 'button'; b.setAttribute('aria-pressed', 'false');
      b.onclick = () => { if (resolu) return; g.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); pris = i; son('clic'); }; g.append(b); });
    (parent || $('champ')).append(g); const f = () => pris; f.boutons = () => [...g.querySelectorAll('button')]; return f; },
  champNombre(label, nom) { const l = node('label', 'champ-nombre'); l.append(node('span', null, label || 'Ta réponse')); const lg = node('span', 'ligne'), i = node('input');
    i.name = nom || 'reponse'; i.inputMode = 'numeric'; i.autocomplete = 'off'; i.maxLength = 8; i.addEventListener('input', () => { i.value = i.value.replace(/[^\d,]/g, ''); }); lg.append(i); l.append(lg); $('champ').append(l); return i; },
  resolu: () => resolu,
  /* Cards (emoji + text) that you touch to put them in order */
  ordre(items, parent) {
    const z = node('div', 'zone'), res = node('div', 'rangee'), rang = node('div', 'rangee ordre-rang'), places = [];
    const carte = (it, cls) => { const b = node('button', 'carte-objet ' + (cls || '')); b.type = 'button'; if (it.e) b.append(node('span', 'emo', it.e)); if (it.t) b.append(node('span', null, it.t)); return b; };
    const boutons = items.map((it, i) => { const b = carte(it); b.dataset.i = i; b.onclick = () => { if (resolu || b.disabled) return; const slot = places.find(p => p.i === undefined); if (!slot) return; slot.i = i; slot.b.replaceChildren(...carte(it).childNodes); slot.b.classList.add('plein'); b.disabled = true; b.classList.add('pris'); son('clic'); }; res.append(b); return b; });
    items.forEach((_, k) => { const b = node('button', 'carte-objet place'); b.type = 'button'; b.append(node('span', 'num', String(k + 1))); const p = { b, i: undefined }; b.onclick = () => { if (resolu || p.i === undefined) return; boutons[p.i].disabled = false; boutons[p.i].classList.remove('pris'); p.i = undefined; b.replaceChildren(node('span', 'num', String(k + 1))); b.classList.remove('plein'); }; places.push(p); rang.append(b); });
    z.append(node('p', 'etiquette', '1. Touche les cartes dans le bon ordre :'), res, node('p', 'etiquette', '2. Elles se placent ici :'), rang, node('p', 'etiquette petit', 'Pour enlever une carte, touche-la dans la rangée.'));
    (parent || $('visuel')).append(z);
    return { valeur: () => places.map(p => p.i), complet: () => places.every(p => p.i !== undefined),
      montrer(ordreBon) { places.forEach((p, k) => { p.i = ordreBon[k]; p.b.replaceChildren(...carte(items[ordreBon[k]]).childNodes); p.b.classList.add('plein', 'bonne'); }); boutons.forEach(b => { b.disabled = true; b.classList.add('pris'); }); } };
  },
  /* Grid of cells to colour: grille(columns, rows, { couleur, fixes: Set("x,y"), axe: 'v'|'h', clic: false }) */
  grille(C, R, o) {
    o = o || {}; const T = Math.min(48, Math.floor(520 / C)), sv = svg('svg', { viewBox: '0 0 ' + (C * T + 4) + ' ' + (R * T + 4), class: 'grille-svg', role: 'group', 'aria-label': 'Quadrillage de ' + C + ' cases sur ' + R });
    const on = new Set(), cel = {}, coul = o.couleur || '#2e9c76';
    for (let y = 0; y < R; y++) for (let x = 0; x < C; x++) {
      const k = x + ',' + y, fixe = o.fixes && o.fixes.has(k), r = svg('rect', { x: 2 + x * T, y: 2 + y * T, width: T, height: T, fill: fixe ? (o.couleurFixe || '#7a5ad8') : '#fff', stroke: '#9aa9b6', 'stroke-width': 1.5 });
      if (!fixe && o.clic !== false) { r.setAttribute('class', 'cel'); r.setAttribute('tabindex', '0'); r.setAttribute('role', 'button'); r.setAttribute('aria-label', 'Case ' + (x + 1) + ', ' + (y + 1));
        const t = () => { if (resolu) return; on.has(k) ? on.delete(k) : on.add(k); r.setAttribute('fill', on.has(k) ? coul : '#fff'); son('clic'); o.change && o.change(on); };
        r.addEventListener('click', t); r.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); t(); } }); }
      cel[k] = r; sv.append(r);
    }
    if (o.axe === 'v') sv.append(svg('line', { x1: 2 + C / 2 * T, y1: 0, x2: 2 + C / 2 * T, y2: R * T + 4, stroke: '#e0573f', 'stroke-width': 4, 'stroke-dasharray': '10 6' }));
    if (o.axe === 'h') sv.append(svg('line', { x1: 0, y1: 2 + R / 2 * T, x2: C * T + 4, y2: 2 + R / 2 * T, stroke: '#e0573f', 'stroke-width': 4, 'stroke-dasharray': '10 6' }));
    (o.parent || $('visuel')).append(sv);
    return { sv, T, on, cel, colorier(k, c) { cel[k] && cel[k].setAttribute('fill', c || coul); }, montrer(ens) { ens.forEach(k => { on.add(k); cel[k] && cel[k].setAttribute('fill', '#9fc9b4'); }); } };
  },
  /* Several cards to choose (more than one can be chosen) */
  multi(items, parent) {
    const r = node('div', 'rangee'), pris = new Set();
    const bs = items.map((it, i) => { const b = node('button', 'carte-objet'); b.type = 'button'; b.setAttribute('aria-pressed', 'false'); if (it.e) b.append(node('span', 'emo', it.e)); b.append(node('span', null, it.t));
      b.onclick = () => { if (resolu) return; pris.has(i) ? pris.delete(i) : pris.add(i); b.setAttribute('aria-pressed', String(pris.has(i))); son('clic'); }; r.append(b); return b; });
    (parent || $('visuel')).append(r);
    return { valeur: () => [...pris].sort((a, b) => a - b), montrer(bons) { bs.forEach((b, i) => { b.setAttribute('aria-pressed', String(bons.includes(i))); if (bons.includes(i)) b.classList.add('bonne'); }); } };
  } };

function memoire() { try { return JSON.parse(localStorage.getItem('ec-ateliers') || '{}'); } catch (e) { return {}; } }
function noter(n, sc, tot) { const m = memoire(), c = jeu.id + ':' + n; if (!m[c] || m[c].score / m[c].total < sc / tot) m[c] = { score: sc, total: tot }; try { localStorage.setItem('ec-ateliers', JSON.stringify(m)); } catch (e) {} }
function meilleurs() {
  const best = {}, t = r => r ? r.score / r.total : -1;
  for (const r of resultats || []) if (r.activity === 'atelier-' + jeu.id && t(r) > t(best[r.level])) best[r.level] = { score: r.score, total: r.total };
  for (const [c, v] of Object.entries(memoire())) { const [a, n] = c.split(':'); if (a === jeu.id && t(v) > t(best[n])) best[n] = v; }
  return best;
}
function menu() {
  $('jeu').hidden = true; $('menu').hidden = false; $('bilan').hidden = true;
  $('menuTitre').textContent = jeu.icone + ' ' + jeu.titre; $('menuIntro').textContent = jeu.intro || 'Choisis ton niveau.';
  $('invite').hidden = !window.EC || EC.connecte(); if (window.EC) $('lienConnexion').href = EC.lienConnexion();
  if (jeu.video) { $('video').hidden = false; const v = $('video').querySelector('video'); if (!v.src) v.src = jeu.video; }
  const best = meilleurs(), ol = $('niveaux'); vider(ol);
  const prochain = jeu.niveaux.findIndex((_, i) => !best[i + 1]);
  jeu.niveaux.forEach((n, i) => {
    const li = node('li'), b = node('button', 'niveau-carte' + (best[i + 1] ? ' fait' : '') + (i === prochain ? ' conseille' : '')); b.type = 'button'; b.style.setProperty('--c', jeu.couleur);
    const t = node('span', 'niveau-texte'); t.append(node('strong', null, n.titre)); if (n.description) t.append(node('small', null, n.description));
    b.append(node('span', 'niveau-num', String(i + 1)), t, node('span', 'niveau-etat', best[i + 1] ? '✓ ' + best[i + 1].score + '/' + best[i + 1].total : i === prochain ? 'À faire ensuite' : ''));
    b.onclick = () => commencer(i + 1); li.append(b); ol.append(li);
  });
  document.title = jeu.titre + ' · MathJeux';
}
function commencer(n) {
  niv = n; const nv = jeu.niveaux[n - 1]; manches = Array.from({ length: nv.manches || jeu.manches || 6 }, (_, i) => i);
  k = 0; score = 0; etats = manches.map(() => ''); debut = Date.now();
  $('menu').hidden = true; $('jeu').hidden = false; $('jeuTitre').textContent = 'Niveau ' + n + ' · ' + nv.titre; afficher();
}
function majProgres() {
  const ol = $('progres'); vider(ol);
  etats.forEach((e, i) => { const li = node('li', 'pastille ' + e + (i === k ? ' actuelle' : '')); li.textContent = e === 'ok' ? '★' : e === 'essai' ? '✓' : e === 'montre' ? '•' : String(i + 1); ol.append(li); });
  $('compteur').textContent = 'Manche ' + (k + 1) + ' sur ' + manches.length;
}
function afficher() {
  essais = 0; resolu = false; vider($('visuel')); vider($('champ')); $('retour').textContent = ''; $('retour').className = 'retour-msg';
  $('verifier').hidden = false; $('verifier').disabled = false; $('suivant').hidden = true; $('indice').hidden = false; majProgres();
  man = jeu.niveaux[niv - 1].manche(api, k, niv);
  $('consigne').textContent = man.consigne; $('verifier').textContent = man.bouton || 'Vérifier';
  const f = $('visuel').querySelector('button,input,[tabindex="0"]') || $('champ').querySelector('button,input'); f && setTimeout(() => f.focus({ preventScroll: true }), 30);
}
function message(type, t) { $('retour').className = 'retour-msg ' + type; $('retour').textContent = t; }
function verifier() {
  if (resolu) { suivant(); return; }
  const r = man.verifier();
  if (r && r.manque) { message('info', r.manque); return; }
  essais++;
  if (r === true) {
    resolu = true; etats[k] = essais === 1 ? 'ok' : 'essai'; if (essais === 1) score++; son('bravo');
    message('correct', (essais === 1 ? pioche(['Bravo !', 'Excellent !', 'Super !', 'Très bien !']) + ' ' : 'Bien joué ! ') + (man.explication || ''));
    fin();
  } else if (essais >= MAX) {
    resolu = true; etats[k] = 'montre'; man.montrer && man.montrer(); son('encore');
    message('montre', 'Ce n’est pas grave ! Voici la réponse. ' + (man.explication || '') + ' Regarde-la bien, puis continue.'); fin();
  } else { son('encore'); message('incorrect', 'Essaie encore. ' + ((r && r.aide) || man.indice || '') + (essais === MAX - 1 ? ' (Dernier essai.)' : '')); }
}
function fin() { $('verifier').hidden = true; $('indice').hidden = true; $('suivant').hidden = false; $('suivant').textContent = k === manches.length - 1 ? 'Voir mon résultat →' : 'Suivant →'; $('suivant').focus(); majProgres(); man.fini && man.fini(); }
function suivant() { if (k < manches.length - 1) { k++; afficher(); } else terminer(); }
async function terminer() {
  const s = Math.max(1, Math.round((Date.now() - debut) / 1000)), tot = manches.length, ratio = score / tot; noter(niv, score, tot);
  $('bilanNiveau').textContent = jeu.titre + ' · Niveau ' + niv + ' · ' + jeu.niveaux[niv - 1].titre;
  $('bilanEtoiles').textContent = ratio >= .9 ? '⭐⭐⭐' : ratio >= .6 ? '⭐⭐' : '⭐'; $('bilanScore').textContent = score + ' / ' + tot; $('bilanTemps').textContent = duree(s);
  $('bilanMessage').textContent = ratio >= .9 ? 'Magnifique ! Tu maîtrises ce niveau.' : ratio >= .6 ? 'Très bon travail ! Tu peux passer au niveau suivant.' : 'Tu as terminé le niveau, bravo pour tes efforts ! Refais-le pour t’entraîner encore.';
  $('bilanSuivant').hidden = niv >= jeu.niveaux.length; $('bilan').hidden = false; $('bilanTitre').focus(); son('bravo');
  const sv = $('bilanSauvegarde'); sv.className = 'bilan-sauvegarde'; vider(sv);
  if (!window.EC || !EC.connecte()) { sv.textContent = 'Ton score est gardé sur cet appareil. Connecte-toi pour le garder dans ton compte.'; return; }
  sv.textContent = 'Enregistrement de ton résultat…';
  const r = await EC.enregistrerNiveau({ activity: 'atelier-' + jeu.id, level: niv, score, total: tot, seconds: s });
  sv.textContent = r.ok ? '✓ Résultat enregistré dans ton compte.' : r.raison === 'enseignante' ? 'Compte enseignante : les résultats ne sont pas enregistrés pendant les essais.' : 'Le résultat n’a pas pu être enregistré.';
}
$('formulaire').onsubmit = e => { e.preventDefault(); verifier(); };
$('suivant').onclick = suivant;
$('indice').onclick = () => { if (man && man.indice) { message('info', '💡 ' + man.indice); parler(man.indice); } };
$('ecouter').onclick = () => parler(man ? (man.oral || man.consigne) : '');
$('quitter').onclick = menu;
$('bilanSuivant').onclick = () => { $('bilan').hidden = true; commencer(niv + 1); };
$('bilanRefaire').onclick = () => { $('bilan').hidden = true; commencer(niv); };
$('bilanMenu').onclick = menu;

window.Atelier = { definir(def) { jeu = def; menu();
  if (window.EC && EC.mesResultats) EC.mesResultats().then(r => { resultats = r || []; if (!$('menu').hidden) menu(); }).catch(() => {}); }, api };
const id = (new URLSearchParams(location.search).get('j') || '').replace(/[^a-z0-9-]/g, '');
if (id) { const sc = document.createElement('script'); sc.src = 'jeux/' + id + '.js'; sc.onerror = () => { $('menu').hidden = false; $('menuTitre').textContent = 'Atelier introuvable'; }; document.body.append(sc); }
else location.href = '../mathematiques/index.html';
})();
