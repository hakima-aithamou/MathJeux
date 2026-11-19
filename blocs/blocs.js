'use strict';
/* Colour blocks: 5 block games to count, calculate, follow a pattern and make a symmetry.
   Each round: the student picks their time (1 to 5 min), plays, then earns up to 3 stars:
   1 for finishing, 1 for finishing within the chosen time, 1 for making 2 mistakes or fewer. */
(function () {
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const alea = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const melange = t => t.map(x => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const BRAVO = ['Bravo !', 'Super !', 'Excellent !', 'Bien joué !', 'Parfait !'];

/* Block colours: letter → colour, singular and plural name. */
const C = { R: ['#e8553d', 'rouge', 'rouges'], B: ['#2c62ab', 'bleu', 'bleus'], J: ['#f4c152', 'jaune', 'jaunes'], V: ['#3fa75f', 'vert', 'verts'], O: ['#f08a24', 'orange', 'orange'],
  M: ['#8b5a3c', 'brun', 'bruns'], G: ['#8fa3b3', 'gris', 'gris'], N: ['#27313b', 'noir', 'noirs'], P: ['#ef7fb0', 'rose', 'roses'], L: ['#8a5cd1', 'violet', 'violets'] };
const nomC = (c, n) => n > 1 ? C[c][2] : C[c][1];

/* Models to copy (a letter = a block, a dot = empty cell). */
const MODELES = { 1: [
  { nom: 'la maison', g: ['..R..', '.RRR.', 'RRRRR', '.JBJ.', '.JBJ.'] },
  { nom: 'le sapin', g: ['..V..', '.VVV.', 'VVVVV', '..M..', '..M..'] },
  { nom: 'la fusée', g: ['..R..', '.BBB.', '.BJB.', '.BBB.', 'R.R.R'] },
  { nom: 'le bonhomme', g: ['.JJJ.', '.JJJ.', 'BBBBB', '.BBB.', '.R.R.'] },
  { nom: 'la fleur', g: ['.P.P.', 'PPJPP', '.PPP.', '..V..', '.VV..'] },
  { nom: 'le drapeau', g: ['RRBB.', 'RRBB.', 'JJJJ.', 'M....', 'M....'] }],
 2: [
  { nom: 'le robot', g: ['.GGGG.', '.GBGB.', '.GGGG.', 'RRRRRR', '.RRRR.', '.N..N.'] },
  { nom: 'le château', g: ['G.G.G.', 'GGGGGG', 'GBGGBG', 'GGGGGG', 'GGMMGG', 'GGMMGG'] },
  { nom: 'la voiture', g: ['......', '..RRR.', '.RBBR.', 'RRRRRR', 'RRRRRR', '.N..N.'] },
  { nom: 'le bateau', g: ['...R..', '..RR..', '.RRR..', '...M..', 'MMMMMM', '.MMMM.'] },
  { nom: 'le papillon', g: ['LL..LL', 'LJLLJL', 'LLNNLL', '.LNNL.', 'LJNNJL', 'LL..LL'] },
  { nom: 'la tortue', g: ['......', '..VV..', '.VMMV.', 'VMMMMV', 'VVVVVV', '.V..V.'] }] };
/* Mystery pictures (a letter = a block to find). */
const DESSINS = [
  { nom: 'un chat', g: ['O.....O', 'OO...OO', 'OOOOOOO', 'ONOOONO', 'OOOPOOO', '.OOOOO.', '..O.O..'] },
  { nom: 'une fleur', g: ['..PPP..', '.PPJPP.', '..PPP..', '...V...', '.V.V.V.', '..VVV..', '...V...'] },
  { nom: 'un camion', g: ['.......', 'BBBB...', 'BBBBRR.', 'BBBBRRR', 'BBBBRRR', '.N...N.', '.......'] },
  { nom: 'un cœur', g: ['.RR.RR.', 'RPRRRRR', 'RRRRRRR', '.RRRRR.', '..RRR..', '...R...', '.......'] },
  { nom: 'un poisson', g: ['...OO..', 'O.OOOO.', 'OOOOONO', 'OOOOOOO', 'O.OOOO.', '...OO..', '.......'] },
  { nom: 'une maison', g: ['...R...', '..RRR..', '.RRRRR.', 'RRRRRRR', '.JJBJJ.', '.JJBJJ.', 'VVVVVVV'] }];
/* Symmetric pictures for the mirror: the left half is given, the student makes the right half. */
const MIROIRS = { 1: [
  { nom: 'le papillon', g: ['P....P', 'PP..PP', 'PPJJPP', 'PP..PP', 'P....P'] },
  { nom: 'le cœur', g: ['.R..R.', 'RRRRRR', 'RRRRRR', '.RRRR.', '..RR..'] },
  { nom: 'la maison', g: ['..RR..', '.RRRR.', 'RRRRRR', '.JBBJ.', '.JBBJ.'] },
  { nom: 'le sapin', g: ['..VV..', '.VVVV.', 'VVVVVV', '..MM..', '..MM..'] },
  { nom: 'la fusée', g: ['..RR..', '.BBBB.', '.BJJB.', '.BBBB.', 'R.RR.R'] },
  { nom: 'le champignon', g: ['.RRRR.', 'RJRRJR', 'RRRRRR', '..JJ..', '..JJ..'] }],
 2: [
  { nom: 'le papillon', g: ['LL....LL', 'LJL..LJL', 'LLLNNLLL', '.LLNNLL.', 'LJLNNLJL', 'LL.NN.LL'] },
  { nom: 'le robot', g: ['.GGGGGG.', '.GBGGBG.', '.GGRRGG.', '..GGGG..', 'RRRRRRRR', 'R.RRRR.R', '.NN..NN.'] },
  { nom: 'le château', g: ['G.G..G.G', 'GGGGGGGG', 'GBGGGGBG', 'GGGGGGGG', 'GGGMMGGG', 'GGGMMGGG'] },
  { nom: 'la tortue', g: ['...VV...', '..VMMV..', '.VMMMMV.', 'VMMMMMMV', 'VVVVVVVV', '.VV..VV.'] },
  { nom: 'le hibou', g: ['.M....M.', 'MMMMMMMM', 'MJNMMNJM', 'MMMOOMMM', '.MMMMMM.', '..O..O..'] },
  { nom: 'le masque', g: ['LLLLLLLL', 'LNNLLNNL', 'LLLLLLLL', 'LL.PP.LL', 'LLLLLLLL', '.LLLLLL.'] }] };

/* ---------- State ---------- */
const params = new URLSearchParams(location.search);
let niv = params.get('n') === '2' ? 2 : 1, jeu = 'copie', gen = 0, etoilesTotal = 0, erreurs = 0, rejouer = null;
const suite = (fn, ms) => { const g = gen; setTimeout(() => { if (g === gen) fn(); }, ms); };
const ecran = html => { $('#jeu').innerHTML = html; };
const faute = () => { erreurs++; };

/* ---------- Sound: off at the start, it is turned on with the "Son" button. The 🔊 button always rereads the instruction. ---------- */
let sonActif = false, voixFr = null, derniere = null;
const choisirVoix = () => { if (!window.speechSynthesis) return; const v = speechSynthesis.getVoices(); voixFr = v.find(x => /^fr[-_]CA/i.test(x.lang)) || v.find(x => /^fr/i.test(x.lang)) || null; };
if (window.speechSynthesis) { choisirVoix(); try { speechSynthesis.addEventListener('voiceschanged', choisirVoix); } catch (e) {} }
const pourLaVoix = t => String(t).replace(/−/g, ' moins ').replace(/\+/g, ' plus ').replace(/=/g, ' égale ')
  .replace(/[←-⇿☀-➿⬀-⯿]|[\uD83C-\uDBFF][\uDC00-\uDFFF]|️|[★☆⌫]/g, '').replace(/\s+/g, ' ').trim();
function parler(t, force) {
  if ((!sonActif && !force) || !window.speechSynthesis || !t) return;
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(pourLaVoix(t)); if (voixFr) { u.voice = voixFr; u.lang = voixFr.lang; } else u.lang = 'fr-CA'; u.rate = 0.88; derniere = u; speechSynthesis.speak(u); } catch (e) {}
}
const taire = () => { try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {} };
/* Screen title with the 🔊 button that reads the instruction. */
const tete = (titre, aide, dire) => `<div class="tete"><p class="consigne">${titre}</p><button type="button" class="lire" data-dire="${esc(dire || (titre + '. ' + (aide || '')))}" aria-label="Écouter la consigne">🔊</button></div>${aide ? `<p class="aide">${aide}</p>` : ''}`;
function message(t, ok) { const m = $('#msg'); if (m) { m.textContent = t; m.className = 'msg ' + (ok ? 'ok' : 'oups'); } parler(t); }
const annoncer = () => { const b = $('#jeu .lire'); if (b) parler(b.dataset.dire); };

/* ---------- Timer: the student chooses 1 to 5 minutes to finish a round ---------- */
let minutesChoisies = null; const chrono = { limite: 0, debut: 0, iv: null, fini: false };
const mmss = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
const enMots = s => { const m = Math.floor(s / 60), r = Math.round(s % 60); return (m ? m + ' min' : '') + (m && r ? ' ' : '') + (r ? r + ' s' : (m ? '' : '0 s')); };
function arreterChrono() { clearInterval(chrono.iv); chrono.iv = null; return Math.round((Date.now() - chrono.debut) / 1000); }
function demarrerChrono(minutes) {
  arreterChrono(); chrono.limite = minutes * 60; chrono.debut = Date.now(); chrono.fini = false;
  const el = $('#chrono'); el.hidden = false; el.className = 'chrono';
  const tick = () => { if (chrono.fini) return; const reste = Math.max(0, chrono.limite - (Date.now() - chrono.debut) / 1000);
    $('#chronoTxt').textContent = mmss(Math.ceil(reste)); $('#chronoBar').style.width = (reste / chrono.limite * 100) + '%';
    el.classList.toggle('bas', reste > 0 && reste <= chrono.limite * .25);
    if (reste <= 0) { chrono.fini = true; el.classList.add('fini'); $('#chronoTxt').textContent = 'Temps fini'; $('#chronoBar').style.width = '0%';
      $('#tempsFini').hidden = false; parler('Le temps est fini ! Tu peux recommencer ou continuer.'); } };
  tick(); chrono.iv = setInterval(tick, 500);
}
function cacherChrono() { arreterChrono(); $('#chrono').hidden = true; $('#tempsFini').hidden = true; }
const arrondi = s => Math.max(30, Math.ceil(s / 30) * 30);
const conseil = s => Math.min(5, Math.max(1, Math.ceil(s / 60)));
function choisirTemps(titre, detail, ideal, demarrer) {
  cacherChrono(); const reco = conseil(ideal); let m = minutesChoisies || reco;
  const rendu = () => { ecran(`<div class="temps-choix">${tete(titre, detail, `${titre}. ${detail} Le temps idéal est ${enMots(ideal)}. Combien de temps veux-tu ?`)}
    <div class="ideal"><span>⏱ Temps idéal pour ce jeu :</span><b>${enMots(ideal)}</b></div>
    <p class="consigne" style="font-size:22px">Combien de temps veux-tu ?</p>
    <div class="minutes" role="group" aria-label="Temps pour finir">${[1, 2, 3, 4, 5].map(n => `<button type="button" data-min="${n}" class="${n === m ? 'on' : ''}" aria-pressed="${n === m}">${n}<small>min</small>${n === reco ? '<span class="reco">conseillé</span>' : ''}</button>`).join('')}</div>
    <div class="btns"><button type="button" class="btn vert" id="go">Commencer ▶</button></div></div>`);
    $$('[data-min]').forEach(b => b.onclick = () => { m = +b.dataset.min; rendu(); parler(m + ' minute' + (m > 1 ? 's' : '')); });
    $('#go').onclick = () => { minutesChoisies = m; erreurs = 0; demarrerChrono(m); demarrer(); };
  };
  rendu(); annoncer();
}

/* ---------- End of round: up to 3 stars, and the score is saved on the site ---------- */
function terminer(titre, ideal, extra, encore) {
  const t = arreterChrono(), aTemps = t <= chrono.limite, peu = erreurs <= 2, n = 1 + (aTemps ? 1 : 0) + (peu ? 1 : 0);
  $('#chrono').hidden = true; $('#tempsFini').hidden = true; etoilesTotal += n; $('#etoiles').textContent = '⭐ ' + etoilesTotal;
  ecran(`${tete(titre, '', `${titre} Tu gagnes ${n} étoile${n > 1 ? 's' : ''} sur 3.`)}
    <div class="trois" role="img" aria-label="${n} étoile${n > 1 ? 's' : ''} sur 3">${'★'.repeat(n)}<span class="vide">${'★'.repeat(3 - n)}</span></div>
    <ul class="raisons"><li class="ok">✓ Tu as fini</li><li class="${aTemps ? 'ok' : 'non'}">${aTemps ? '✓ Tu as fini à temps' : '✗ Tu as pris plus de temps'}</li><li class="${peu ? 'ok' : 'non'}">${erreurs === 0 ? '✓ Aucune erreur' : peu ? `✓ Seulement ${erreurs} erreur${erreurs > 1 ? 's' : ''}` : `✗ ${erreurs} erreurs`}</li></ul>
    <div class="bilan"><span>⏱ Ton temps : ${enMots(t)}</span><span>Temps choisi : ${chrono.limite / 60} min</span><span>Temps idéal : ${enMots(ideal)}</span></div>
    ${extra || ''}<p class="sauve" id="sauve"></p>
    <div class="btns"><button type="button" class="btn clair" id="memeJeu">🔄 Rejouer</button><button type="button" class="btn" id="encore">${encore} →</button></div>`);
  $('#memeJeu').onclick = () => { gen++; rejouer(); };
  $('#encore').onclick = () => { gen++; JEUX[jeu].fn(); };
  annoncer();
  if (window.EC && EC.enregistrerNiveau) {
    const s = $('#sauve'); s.textContent = 'Enregistrement…';
    EC.enregistrerNiveau({ activity: 'jeu-blocs-' + jeu, level: niv, score: n, total: 3, seconds: Math.min(86400, t) }).then(r => {
      if (!document.body.contains(s)) return;
      if (r.ok) s.textContent = '✓ Score enregistré dans ton espace.';
      else if (r.raison === 'invite') s.innerHTML = `<a href="${esc(EC.lienConnexion('eleve'))}">Connecte-toi</a> pour garder ton score.`;
      else if (r.raison === 'enseignante') s.textContent = '';
      else s.textContent = 'Score non enregistré : ' + (r.message || 'réessaie plus tard.');
    });
  }
}

/* ---------- Small display helpers ---------- */
function taille(cols, parts, max) { const w = $('#jeu').clientWidth - 40; return Math.max(26, Math.min(max || 46, Math.floor((w / parts - 20) / cols) - 3)); }
const caseBloc = l => l && l !== '.' ? ` bloc" style="background:${C[l][0]}` : '"';
const pastilles = compte => `<div class="compte">${Object.keys(compte).map(c => `<span class="pastille"><i style="background:${C[c][0]}"></i>${compte[c]} ${nomC(c, compte[c])}</span>`).join('')}</div>`;
const compter = g => { const k = {}; g.join('').replace(/\./g, '').split('').forEach(l => { k[l] = (k[l] || 0) + 1; }); return k; };
const petiteGrille = (g, t) => `<div class="grille modele" style="grid-template-columns:repeat(${g[0].length},${t}px);--t:${t}px">${g.map(r => [...r].map(l => `<span class="case${caseBloc(l)}"></span>`).join('')).join('')}</div>`;
const choixDe = r => melange([...new Set([r, r + 1, r > 1 ? r - 1 : r + 2, r + 2])].slice(0, 3));
/* A choice question (3 answers). A wrong answer counts as a mistake. */
function question(entete, texte, r, aideFaux, ensuite) {
  ecran(`${entete}<div class="question">${tete(texte, '')}<div class="choix">${choixDe(r).map(x => `<button type="button" data-r="${x}">${x}</button>`).join('')}</div></div><div class="msg" id="msg"></div>`);
  annoncer();
  $$('[data-r]').forEach(b => b.onclick = () => {
    if (+b.dataset.r === r) { b.classList.add('bon'); $$('[data-r]').forEach(x => { x.disabled = true; }); message(BRAVO[alea(0, 4)], true); suite(ensuite, 1100); }
    else { b.classList.add('faux'); b.disabled = true; faute(); message(aideFaux, false); } });
}

/* ================= 1. Copy the structure ================= */
let dernierModele = null;
function copie(meme) {
  const liste = MODELES[niv]; let m = meme; if (!m) do { m = liste[alea(0, liste.length - 1)]; } while (liste.length > 1 && m === dernierModele); dernierModele = m;
  const W = m.g[0].length, couleurs = [...new Set(m.g.join('').replace(/\./g, ''))];
  const t = taille(W, $('#jeu').clientWidth > 640 ? 2 : 1);
  const construit = m.g.map(() => Array(W).fill('.')); let choix = couleurs[0];
  const nb = m.g.join('').replace(/\./g, '').length, ideal = arrondi(nb * (niv === 1 ? 6 : 5) + 30);
  const grille = (g, modele) => `<div class="grille${modele ? ' modele' : ''}" style="grid-template-columns:repeat(${W},${t}px);--t:${t}px">${g.map((r, y) => [...r].map((l, x) =>
      `<button type="button" class="case${caseBloc(l)}" ${modele ? 'tabindex="-1" aria-hidden="true"' : `data-x="${x}" data-y="${y}" aria-label="Case ${y + 1}, ${x + 1}"`}></button>`).join('')).join('')}</div>`;
  const rendu = () => { ecran(`${tete(`Copie ${m.nom}`, 'Choisis une couleur, puis touche une case pour poser un bloc. Touche un bloc avec la même couleur pour l’enlever.')}
    <div class="duo"><div class="cadre"><h3>Modèle</h3>${grille(m.g, true)}</div><div class="cadre"><h3>Ta structure</h3><div id="zone">${grille(construit, false)}</div></div></div>
    <div class="palette">${couleurs.concat(niv === 2 ? ['J', 'V'].filter(c => !couleurs.includes(c)).slice(0, 1) : []).map(c => `<button type="button" class="coul${c === choix ? ' on' : ''}" data-c="${c}" style="background:${C[c][0]}" aria-label="${C[c][1]}"></button>`).join('')}<button type="button" class="coul gomme${choix === '.' ? ' on' : ''}" data-c="." aria-label="Gomme">⌫</button></div>
    <div class="btns"><button type="button" class="btn vert" id="verif">J'ai fini</button></div><div class="msg" id="msg"></div>`);
    $$('.coul').forEach(b => b.onclick = () => { choix = b.dataset.c; rendu(); });
    $$('#zone [data-x]').forEach(b => b.onclick = () => { const x = +b.dataset.x, y = +b.dataset.y; construit[y][x] = construit[y][x] === choix ? '.' : choix; rendu(); });
    $('#verif').onclick = () => { let faux = 0;
      if (construit.every(r => r.every(l => l === '.'))) { message('Pose d’abord des blocs pour copier le modèle.', false); return; }
      m.g.forEach((r, y) => [...r].forEach((l, x) => { if (construit[y][x] !== l) { faux++; $(`#zone [data-x="${x}"][data-y="${y}"]`).classList.add('faux'); } }));
      if (!faux) { message(BRAVO[alea(0, 4)] + ' Ta structure est pareille au modèle !', true); suite(() => questionsCopie(m, ideal), 1200); }
      else { faute(); message(`Regarde bien : ${faux} case${faux > 1 ? 's' : ''} à corriger (entourée${faux > 1 ? 's' : ''} en orange).`, false); } };
  };
  rejouer = () => copie(m);
  choisirTemps(`Copie ${m.nom}`, `${nb} blocs à poser, puis 3 questions de maths.`, ideal, () => { rendu(); annoncer(); });
}
function questionsCopie(m, ideal) {
  const compte = compter(m.g), cs = Object.keys(compte), total = cs.reduce((a, c) => a + compte[c], 0);
  const qs = [], c1 = cs[alea(0, cs.length - 1)];
  qs.push({ q: `Combien de blocs ${C[c1][2]} ?`, r: compte[c1] });
  if (cs.length > 1) { const c2 = cs.find(c => c !== c1);
    if (niv === 2 && compte[c1] !== compte[c2]) { const [g, p] = compte[c1] > compte[c2] ? [c1, c2] : [c2, c1]; qs.push({ q: `Combien de blocs ${C[g][2]} de plus que de blocs ${C[p][2]} ?`, r: compte[g] - compte[p] }); }
    else qs.push({ q: `Combien de blocs ${C[c1][2]} et ${C[c2][2]} ensemble ?`, r: compte[c1] + compte[c2] }); }
  qs.push({ q: 'Combien de blocs en tout ?', r: total });
  let i = 0;
  const poser = () => question(`<p class="aide">${m.nom.charAt(0).toUpperCase() + m.nom.slice(1)} · question ${i + 1} sur ${qs.length}</p><div class="cadre">${petiteGrille(m.g, 30)}</div>`,
    qs[i].q, qs[i].r, 'Compte encore en touchant chaque bloc avec ton doigt.', () => { i++; if (i < qs.length) poser(); else fin(); });
  const fin = () => terminer(`Bravo, tu as fini ${m.nom} !`, ideal, `${pastilles(compte)}<p class="consigne">${cs.map(c => compte[c]).join(' + ')} = ${total} blocs</p>`, 'Une autre structure');
  poser();
}

/* ================= 2. The mystery picture ================= */
let dernierDessin = null;
function mystere(meme) {
  let d = meme; if (!d) do { d = DESSINS[alea(0, DESSINS.length - 1)]; } while (d === dernierDessin); dernierDessin = d;
  const W = d.g[0].length, couleurs = [...new Set(d.g.join('').replace(/\./g, ''))];
  /* Each colour gets a different number; each block gets a calculation that gives that number. */
  const nombres = melange(niv === 1 ? [3, 4, 5, 6, 7, 8, 9, 10] : [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 25]).slice(0, couleurs.length);
  const cible = {}; couleurs.forEach((c, i) => { cible[c] = nombres[i]; });
  const calcul = n => { if (niv === 2 && Math.random() < .4) { const a = alea(n + 1, Math.min(n + 12, 30)); return { t: `${a}−${a - n}`, n }; } const a = alea(1, n - 1); return { t: `${a}+${n - a}`, n }; };
  const cases = d.g.map(r => [...r].map(l => l === '.' ? null : { l, ...calcul(cible[l]), fait: false }));
  const t = taille(W, 1), fs = Math.max(11, Math.round(t * (niv === 2 ? .3 : .34)));
  let choix = null;
  const nbCases = cases.flat().filter(Boolean).length, ideal = arrondi(nbCases * (niv === 1 ? 6 : 9));
  const reste = c => cases.flat().filter(x => x && x.l === c && !x.fait).length;
  const rendu = () => {
    ecran(`${tete('Le dessin mystère', 'Touche une couleur, puis touche tous les blocs dont la réponse est ce nombre.')}
    <div class="legende">${couleurs.map(c => `<button type="button" class="leg${choix === c ? ' on' : ''}${reste(c) ? '' : ' fini'}" data-c="${c}"><i style="background:${C[c][0]}"></i>${cible[c]}</button>`).join('')}</div>
    <div class="grille myst" style="grid-template-columns:repeat(${W},${t}px);--t:${t}px;--fs:${fs}px">${cases.map((r, y) => r.map((x, i) => !x ? '<span class="case vide"></span>'
      : `<button type="button" class="case${x.fait ? ` bloc" style="background:${C[x.l][0]}"` : '"'} data-x="${i}" data-y="${y}" aria-label="${x.fait ? C[x.l][1] : x.t.replace('−', ' moins ').replace('+', ' plus ')}">${x.t}</button>`).join('')).join('')}</div>
    <div class="msg" id="msg"></div>`);
    $$('.leg').forEach(b => b.onclick = () => { choix = b.dataset.c; rendu(); parler(String(cible[choix])); });
    $$('.myst [data-x]').forEach(b => b.onclick = () => { const x = cases[+b.dataset.y][+b.dataset.x]; if (x.fait) return;
      if (!choix) { message('Touche d’abord une couleur en haut.', false); return; }
      if (x.n === cible[choix]) { x.fait = true;
        if (cases.flat().every(c => !c || c.fait)) { rendu(); message(`C'est ${d.nom} !`, true); suite(() => terminer(`Bravo ! C'est ${d.nom} !`, ideal, `<div class="cadre">${petiteGrille(d.g, 28)}</div>`, 'Un autre dessin'), 1300); return; }
        rendu(); if (!reste(choix)) message(`Tous les blocs du ${cible[choix]} sont trouvés ! Choisis une autre couleur.`, true); }
      else { b.classList.add('secoue'); faute(); message(`${x.t} = ${x.n}, pas ${cible[choix]}. Cherche la couleur du ${x.n}.`, false); } });
  };
  rejouer = () => mystere(d);
  choisirTemps('Le dessin mystère', `${nbCases} blocs à colorier avec des calculs.`, ideal, () => { rendu(); annoncer(); });
}

/* ================= 3. The staircase (patterns) ================= */
/* Beginner: the towers grow by 1 or 2 blocks, one colour only.
   Intermediate: +2, +3 or −1, −2, and the colours follow a pattern (A B A B or A B C A B C). */
function nouvelleSuite() {
  const coul = melange(['R', 'B', 'J', 'V', 'O', 'L']);
  if (niv === 1) { const a = alea(1, 3), d = alea(1, 2); return { h: [0, 1, 2, 3, 4].map(i => a + i * d), d, c: Array(5).fill(coul[0]) }; }
  const monte = Math.random() < .6, d = monte ? alea(2, 3) : -alea(1, 2), a = monte ? alea(1, 3) : alea(10, 12);
  const motif = Math.random() < .5 ? coul.slice(0, 2) : coul.slice(0, 3);
  return { h: [0, 1, 2, 3, 4].map(i => a + i * d), d, c: [0, 1, 2, 3, 4].map(i => motif[i % motif.length]), motif };
}
function escalier(meme) {
  const suites = meme || [nouvelleSuite(), nouvelleSuite(), nouvelleSuite()];
  const ideal = arrondi(suites.length * (niv === 1 ? 25 : 40)), H = niv === 1 ? 10 : 13;
  let i = 0;
  const plusMoins = d => d > 0 ? `${d} bloc${d > 1 ? 's' : ''} de plus` : `${-d} bloc${d < -1 ? 's' : ''} de moins`;
  const etape = () => {
    const s = suites[i]; let h = 0, coul = niv === 1 ? s.c[3] : null;
    const t = Math.min(niv === 1 ? 34 : 28, Math.floor(($('#jeu').clientWidth - 120) / 4) - 10);
    const pile = (n, c) => `<div class="pile" style="--t:${t}px">${Array.from({ length: n }, () => `<span class="case bloc" style="background:${C[c][0]}"></span>`).join('')}</div>`;
    const couleursPossibles = niv === 1 ? [] : melange([...new Set(s.motif.concat(['R', 'B', 'J', 'V', 'O', 'L'].filter(x => !s.motif.includes(x)).slice(0, 1)))]);
    const rendu = () => {
      ecran(`${tete(`Escalier ${i + 1} sur ${suites.length}`, niv === 1 ? 'Regarde comment les tours grandissent. Construis la tour suivante : touche la case du haut de ta tour.' : 'Trouve la règle des tours et l’ordre des couleurs. Choisis une couleur, puis construis la tour suivante.')}
      <div class="tours">${[0, 1, 2].map(k => `<div class="tour">${pile(s.h[k], s.c[k])}<b>${s.h[k]}</b></div>`).join('')}
        <div class="tour vous"><div class="pile" style="--t:${t}px">${Array.from({ length: H }, (_, k) => `<button type="button" class="case${k < h && coul ? ` bloc" style="background:${C[coul][0]}` : '"'} data-k="${k + 1}" aria-label="Tour de ${k + 1} bloc${k ? 's' : ''}"></button>`).join('')}</div><b>${h || '?'}</b></div></div>
      ${niv === 2 ? `<div class="palette">${couleursPossibles.map(c => `<button type="button" class="coul${c === coul ? ' on' : ''}" data-c="${c}" style="background:${C[c][0]}" aria-label="${C[c][1]}"></button>`).join('')}</div>` : ''}
      <div class="btns"><button type="button" class="btn vert" id="verif">J'ai fini</button></div><div class="msg" id="msg"></div>`);
      $$('.coul').forEach(b => b.onclick = () => { coul = b.dataset.c; rendu(); parler(C[coul][1]); });
      $$('.vous [data-k]').forEach(b => b.onclick = () => { if (!coul) { message('Choisis d’abord une couleur.', false); return; } const k = +b.dataset.k; h = k === h ? k - 1 : k; rendu(); });
      $('#verif').onclick = () => {
        if (!h) { message('Construis d’abord ta tour.', false); return; }
        if (h !== s.h[3]) { faute(); message(niv === 1 || erreurs > 1 ? `Pas encore. Chaque tour a ${plusMoins(s.d)}.` : `Pas encore. Compte les blocs : de combien change chaque tour ?`, false); return; }
        if (coul !== s.c[3]) { faute(); message('Le nombre de blocs est bon ! Regarde l’ordre des couleurs.', false); return; }
        message(`${BRAVO[alea(0, 4)]} ${s.h[2]} ${s.d > 0 ? '+' : '−'} ${Math.abs(s.d)} = ${s.h[3]}`, true);
        suite(() => question(`<div class="tours">${[0, 1, 2, 3].map(k => `<div class="tour">${pile(s.h[k], s.c[k])}<b>${s.h[k]}</b></div>`).join('')}</div>`,
          niv === 1 ? 'Combien de blocs de plus à chaque tour ?' : 'Combien de blocs aura la tour suivante ?', niv === 1 ? s.d : s.h[4],
          niv === 1 ? 'Compare deux tours voisines : compte les blocs en plus.' : `Chaque tour a ${plusMoins(s.d)}. Calcule ${s.h[3]} ${s.d > 0 ? '+' : '−'} ${Math.abs(s.d)}.`,
          () => { i++; if (i < suites.length) etape(); else terminer('Bravo, tu as fini les escaliers !', ideal, `<p class="consigne" style="font-size:20px">${suites.map(x => x.h.slice(0, 4).join(', ')).join(' · ')}</p>`, 'D’autres escaliers'); }), 1300);
      };
    };
    rendu(); annoncer();
  };
  rejouer = () => escalier(suites);
  choisirTemps('L’escalier', `${suites.length} suites de tours à continuer.`, ideal, etape);
}

/* ================= 4. The mirror (symmetry) ================= */
let dernierMiroir = null;
function miroir(meme) {
  const liste = MIROIRS[niv]; let m = meme; if (!m) do { m = liste[alea(0, liste.length - 1)]; } while (m === dernierMiroir); dernierMiroir = m;
  const W = m.g[0].length, demi = W / 2, couleurs = [...new Set(m.g.join('').replace(/\./g, ''))];
  const construit = m.g.map(r => [...r].map((l, x) => x < demi ? l : '.')); let choix = couleurs[0];
  const gauche = m.g.reduce((a, r) => a + [...r.slice(0, demi)].filter(l => l !== '.').length, 0);
  const ideal = arrondi(gauche * (niv === 1 ? 7 : 6) + 30), t = taille(W, 1, 44);
  const rendu = () => {
    ecran(`${tete(`Le miroir : ${m.nom}`, 'La ligne bleue est un miroir. Fais la même chose à droite, comme dans un miroir.')}
    <div class="grille" id="zone" style="grid-template-columns:repeat(${demi},${t}px) 6px repeat(${demi},${t}px);--t:${t}px">${construit.map((r, y) => r.map((l, x) =>
      (x === demi ? '<span class="axe" aria-hidden="true"></span>' : '') + (x < demi ? `<span class="case fixe${caseBloc(l)}"></span>` : `<button type="button" class="case${caseBloc(l)}" data-x="${x}" data-y="${y}" aria-label="Case ${y + 1}, ${x + 1}"></button>`)).join('')).join('')}</div>
    <div class="palette">${couleurs.map(c => `<button type="button" class="coul${c === choix ? ' on' : ''}" data-c="${c}" style="background:${C[c][0]}" aria-label="${C[c][1]}"></button>`).join('')}<button type="button" class="coul gomme${choix === '.' ? ' on' : ''}" data-c="." aria-label="Gomme">⌫</button></div>
    <div class="btns"><button type="button" class="btn vert" id="verif">J'ai fini</button></div><div class="msg" id="msg"></div>`);
    $$('.coul').forEach(b => b.onclick = () => { choix = b.dataset.c; rendu(); });
    $$('#zone [data-x]').forEach(b => b.onclick = () => { const x = +b.dataset.x, y = +b.dataset.y; construit[y][x] = construit[y][x] === choix ? '.' : choix; rendu(); });
    $('#verif').onclick = () => { let faux = 0;
      m.g.forEach((r, y) => [...r].forEach((l, x) => { if (x >= demi && construit[y][x] !== l) { faux++; $(`#zone [data-x="${x}"][data-y="${y}"]`).classList.add('faux'); } }));
      if (!faux) { message(BRAVO[alea(0, 4)] + ' Les deux côtés sont pareils !', true); suite(questionsMiroir, 1200); }
      else { faute(); message(`Regarde bien le côté gauche : ${faux} case${faux > 1 ? 's' : ''} à corriger.`, false); } };
  };
  const questionsMiroir = () => {
    const entete = `<div class="cadre">${petiteGrille(m.g, 28)}</div>`;
    question(entete, `Il y a ${gauche} blocs à gauche. Combien de blocs à droite ?`, gauche, 'Dans un miroir, les deux côtés ont le même nombre de blocs.',
      () => question(entete, 'Combien de blocs en tout ?', 2 * gauche, `Additionne les deux côtés : ${gauche} + ${gauche}.`,
        () => terminer(`Bravo, tu as fini ${m.nom} !`, ideal, `<p class="consigne">${gauche} + ${gauche} = ${2 * gauche} blocs</p>`, 'Un autre miroir')));
  };
  rejouer = () => miroir(m);
  choisirTemps(`Le miroir : ${m.nom}`, `${gauche} blocs à poser à droite, puis 2 questions.`, ideal, () => { rendu(); annoncer(); });
}

/* ================= 5. The recipe ================= */
/* Beginner: 2 colours, total up to 10 (a tray of 10). Intermediate: 3 colours, total up to 20. */
function nouvelleRecette() {
  const cs = melange(['R', 'B', 'J', 'V', 'O', 'L', 'P']).slice(0, niv === 1 ? 2 : 3), k = {};
  do { cs.forEach(c => { k[c] = niv === 1 ? alea(1, 5) : alea(2, 7); }); } while (Object.values(k).reduce((a, b) => a + b, 0) > (niv === 1 ? 10 : 20));
  return k;
}
function recette(meme) {
  const recs = meme || [nouvelleRecette(), nouvelleRecette()], cap = niv === 1 ? 10 : 20;
  const totalDe = k => Object.values(k).reduce((a, b) => a + b, 0);
  const ideal = arrondi(recs.reduce((a, k) => a + totalDe(k) * 3 + 20, 0));
  let i = 0;
  const etape = () => {
    const k = recs[i], cs = Object.keys(k), total = totalDe(k), plateau = [];
    const t = Math.min(40, Math.floor(($('#jeu').clientWidth - 70) / 10) - 3);
    const carte = `<div class="recette-carte"><h3>📋 Recette ${i + 1}</h3>${cs.map(c => `<div class="ingr"><i style="background:${C[c][0]}"></i>${k[c]} ${nomC(c, k[c])}</div>`).join('')}</div>`;
    const lecture = cs.map(c => `${k[c]} ${nomC(c, k[c])}`).join(', ');
    const rendu = () => {
      ecran(`${tete(`La recette ${i + 1} sur ${recs.length}`, 'Lis la recette. Touche une couleur pour ajouter un bloc sur le plateau.', `Recette ${i + 1}. Il faut ${lecture}. Touche une couleur pour ajouter un bloc.`)}
      ${carte}
      <div class="plateau" style="--t:${t}px">${Array.from({ length: cap }, (_, n) => `<span class="case${caseBloc(plateau[n])}"></span>`).join('')}</div>
      <div class="ajout">${cs.map(c => `<button type="button" data-c="${c}"><i style="background:${C[c][0]}"></i>+ ${C[c][1]}</button>`).join('')}<button type="button" class="enlever" id="enlever">⌫ Enlever</button></div>
      <div class="btns"><button type="button" class="btn vert" id="verif">J'ai fini</button></div><div class="msg" id="msg"></div>`);
      $$('.ajout [data-c]').forEach(b => b.onclick = () => { if (plateau.length >= cap) { message('Le plateau est plein.', false); return; } plateau.push(b.dataset.c); rendu(); });
      $('#enlever').onclick = () => { plateau.pop(); rendu(); };
      $('#verif').onclick = () => {
        if (!plateau.length) { message('Ajoute d’abord des blocs.', false); return; }
        const mis = {}; plateau.forEach(c => { mis[c] = (mis[c] || 0) + 1; });
        const faux = cs.find(c => (mis[c] || 0) !== k[c]);
        if (faux) { faute(); message(`Compte encore les blocs ${C[faux][2]} : il en faut ${k[faux]}.`, false); return; }
        message(BRAVO[alea(0, 4)] + ' Ta recette est prête !', true);
        const entete = `${carte}<div class="plateau" style="--t:${Math.min(t, 30)}px">${Array.from({ length: cap }, (_, n) => `<span class="case${caseBloc(plateau[n])}"></span>`).join('')}</div>`;
        const ens = () => { i++; if (i < recs.length) etape(); else terminer('Bravo, tes recettes sont prêtes !', ideal, recs.map(x => `<p class="consigne" style="font-size:22px">${Object.values(x).join(' + ')} = ${totalDe(x)} blocs</p>`).join(''), 'D’autres recettes'); };
        let q = { t: 'Combien de blocs en tout ?', r: total, a: `Additionne : ${Object.values(k).join(' + ')}.` };
        if (niv === 2 && i === 1) { const [a, b] = cs.slice().sort((x, y) => k[y] - k[x]); if (k[a] !== k[b]) q = { t: `Combien de blocs ${C[a][2]} de plus que de blocs ${C[b][2]} ?`, r: k[a] - k[b], a: `Calcule ${k[a]} − ${k[b]}.` }; }
        suite(() => question(entete, q.t, q.r, q.a, ens), 1100);
      };
    };
    rendu(); annoncer();
  };
  rejouer = () => recette(recs);
  choisirTemps('La recette', `${recs.length} recettes : pose les bons blocs, puis calcule.`, ideal, etape);
}

/* ---------- The 5 games ---------- */
const ico = c => `<svg viewBox="0 0 38 38" aria-hidden="true">${c}</svg>`;
const JEUX = {
  copie: { nom: 'Copie la structure', sous: 'Reconstruis le modèle, puis compte', ico: ico('<rect x="2" y="12" width="15" height="15" rx="3" fill="#e8553d"/><rect x="2" y="2" width="7" height="9" rx="2" fill="#2c62ab"/><rect x="21" y="12" width="15" height="15" rx="3" fill="none" stroke="#1f5f7a" stroke-width="2" stroke-dasharray="3 2"/>'), fn: copie },
  mystere: { nom: 'Le dessin mystère', sous: 'Calcule pour trouver la couleur', ico: ico('<rect x="2" y="2" width="10" height="10" rx="2" fill="#f08a24"/><rect x="14" y="2" width="10" height="10" rx="2" fill="#f08a24"/><rect x="26" y="2" width="10" height="10" rx="2" fill="none" stroke="#c3d3dd" stroke-width="2"/><rect x="14" y="14" width="10" height="10" rx="2" fill="#27313b"/><text x="19" y="35" font-size="9" font-family="Arial" font-weight="700" text-anchor="middle" fill="#1f5f7a">4+3</text>'), fn: mystere },
  escalier: { nom: 'L’escalier', sous: 'Continue la suite de tours', ico: ico('<rect x="2" y="28" width="9" height="8" rx="2" fill="#2c62ab"/><rect x="14" y="20" width="9" height="16" rx="2" fill="#2c62ab"/><rect x="26" y="12" width="9" height="24" rx="2" fill="none" stroke="#1f5f7a" stroke-width="2" stroke-dasharray="3 2"/>'), fn: escalier },
  miroir: { nom: 'Le miroir', sous: 'Fais la même chose de l’autre côté', ico: ico('<rect x="3" y="6" width="10" height="10" rx="2" fill="#8a5cd1"/><rect x="3" y="20" width="10" height="10" rx="2" fill="#f4c152"/><path d="M19 2v34" stroke="#1f5f7a" stroke-width="3"/><rect x="25" y="6" width="10" height="10" rx="2" fill="#8a5cd1"/><rect x="25" y="20" width="10" height="10" rx="2" fill="none" stroke="#1f5f7a" stroke-width="2" stroke-dasharray="3 2"/>'), fn: miroir },
  recette: { nom: 'La recette', sous: 'Pose les bons blocs, puis additionne', ico: ico('<rect x="4" y="2" width="20" height="26" rx="3" fill="#fff" stroke="#1f5f7a" stroke-width="2"/><rect x="8" y="7" width="5" height="5" rx="1" fill="#e8553d"/><rect x="8" y="16" width="5" height="5" rx="1" fill="#3fa75f"/><path d="M15 9.5h6M15 18.5h6" stroke="#1f5f7a" stroke-width="2"/><rect x="18" y="28" width="8" height="8" rx="2" fill="#e8553d"/><rect x="28" y="28" width="8" height="8" rx="2" fill="#3fa75f"/>'), fn: recette }
};
if (JEUX[params.get('j')]) jeu = params.get('j');
function onglets() { $('#onglets').innerHTML = Object.entries(JEUX).map(([k, j]) => `<button type="button" class="onglet${k === jeu ? ' on' : ''}" data-jeu="${k}" aria-pressed="${k === jeu}">${j.ico}<span>${j.nom}<small>${j.sous}</small></span></button>`).join(''); }
function lancer() { gen++; taire(); cacherChrono(); onglets(); $$('[data-niv]').forEach(b => { b.classList.toggle('on', +b.dataset.niv === niv); b.setAttribute('aria-pressed', +b.dataset.niv === niv); });
  try { history.replaceState(null, '', '?j=' + jeu + '&n=' + niv); } catch (e) {}
  JEUX[jeu].fn(); }
document.addEventListener('click', e => {
  const o = e.target.closest('[data-jeu]'); if (o) { jeu = o.dataset.jeu; lancer(); return; }
  const n = e.target.closest('[data-niv]'); if (n) { niv = +n.dataset.niv; lancer(); return; }
  const l = e.target.closest('.lire'); if (l) parler(l.dataset.dire, true);
});
$('#son').onclick = () => { sonActif = !sonActif; $('#son').setAttribute('aria-pressed', sonActif); $('#son').textContent = sonActif ? '🔊 Son : oui' : '🔇 Son : non'; if (sonActif) annoncer(); else taire(); };
$('#recommencer').onclick = () => { gen++; taire(); if (rejouer) rejouer(); };
$('#continuer').onclick = () => { $('#tempsFini').hidden = true; };
lancer();
})();
