'use strict';
(function () {
const el = id => document.getElementById(id);
/* Empties an element, then puts the new children in it (if any). */
const vider = (n, ...enfants) => { n.textContent = ''; n.append(...enfants); };
const M = window.EC_MATHS;
/* Games: their score is in stars (out of 3). */
const JEUX = [['serpcalc30', 'Serpent des calculs', 8, '#2f8f5b'], ['attrape30', 'Attrape les bons calculs', 8, '#c2633a'], ['labycalc50', 'Labyrinthe des additions', 8, '#3d6fb6'], ['serpcalc50', 'Serpent des calculs · 50', 8, '#2a8a6e'], ['pont50', 'Pont des additions', 8, '#b86b2b'], ['attrape50', 'Attrape les calculs · 50', 8, '#c2633a'], ['serpent', 'Serpent des multiples', 8, '#2f8f5b'], ['attrape', 'Attrape les bons', 8, '#c2633a'], ['labycalc', 'Labyrinthe des calculs', 8, '#3d6fb6'], ['serpfrac', 'Serpent des fractions', 8, '#2a8a6e'], ['pont', 'Pont des nombres', 8, '#b86b2b'], ['glisse', 'Glissière des nombres', 8, '#5b7d1a'], ['fusee', 'Course aux coordonnées', 8, '#2c62ab'], ['droite', 'Droite cible', 8, '#0b7480'],
  ['labyrinthe', 'Labyrinthe aux étoiles', 8, '#4a57c4'], ['caisses', 'Pousse les caisses', 6, '#8a5a2b'],
  ['robot', 'Robot programmeur', 8, '#3c4fa8'], ['caissesx', 'Pousse les caisses · expert', 6, '#6e4a24'], ['laser', 'Rayon laser', 8, '#b3366e'], ['ile', 'Île aux blocs', 3, '#2f8a4b'], ['tempete', 'Tempête des blocs', 1, '#6f45b8'], ['village', 'Le village des amis', 4, '#655596'], ['blocs-copie', 'Blocs · Copie la structure', 2, '#e8553d'], ['blocs-mystere', 'Blocs · Le dessin mystère', 2, '#f08a24'], ['blocs-escalier', 'Blocs · L’escalier', 2, '#2c62ab'], ['blocs-miroir', 'Blocs · Le miroir', 2, '#8a5cd1'], ['blocs-recette', 'Blocs · La recette', 2, '#2f8a4b'], ['ile-maths', 'Île aux calculs', 11, '#3f7a64'], ['splash', 'Splash des calculs', 11, '#2f8fb8'], ['mer', 'La mer des requins', 11, '#1f6f9f'], ['desert', 'Désert des calculs', 11, '#b8742f'], ['math-obby', 'Math Obby', 16, '#c2558f'], ['pirates', 'Pirates de la logique', 12, '#8a5a35']];
const CAT = { ...M.activites }, ORDRE = M.ordre.slice(), IDS_JEUX = [];
for (const [id, titre, n, couleur] of JEUX) { const blocs = id.startsWith('blocs-'); CAT['jeu-' + id] = { titre: (id === 'ile' ? '🏝️ ' : id === 'ile-maths' ? '🔢 ' : id === 'splash' ? '🌊 ' : id === 'mer' ? '🦈 ' : id === 'desert' ? '🏜️ ' : id === 'math-obby' ? '🌈 ' : id === 'pirates' ? '⚓ ' : id === 'village' ? '🏘️ ' : id === 'tempete' ? '🌀 ' : blocs ? '🧱 ' : '🎮 ') + titre, couleur, jeu: true, niveaux: Array.from({ length: n }, (_, i) => ({ titre: blocs ? ['Débutant', 'Intermédiaire'][i] : 'Niveau ' + (i + 1) })) }; ORDRE.push('jeu-' + id); IDS_JEUX.push('jeu-' + id); }
/* Math 9 moved to the MathSkills site: no catalogue here. */
const MATH9 = [];
const IDS_M9 = [];
for (const [id, titre, couleur, lecons] of MATH9) { CAT[id] = { titre: '🔢 ' + titre, couleur, niveaux: lecons.map(t => ({ titre: t })) }; ORDRE.push(id); IDS_M9.push(id); }
const lienDe = (a, n) => a.startsWith('m9-') ? 'math9/module.html?m=' + a + '&l=' + n : a === 'jeu-ile' ? 'ile/jeu.html?n=' + n : a === 'jeu-ile-maths' ? 'ile-maths/jeu.html?n=' + n : a === 'jeu-splash' ? 'splash/jeu.html?n=' + n : a === 'jeu-mer' ? 'mer/jeu.html?n=' + n : a === 'jeu-desert' ? 'desert/jeu.html?n=' + n : a === 'jeu-math-obby' ? 'obby/jeu.html?n=' + n : a === 'jeu-pirates' ? 'pirates/jeu.html?n=' + n : a === 'jeu-village' ? 'village/jeu.html?n=' + n : a === 'jeu-tempete' ? 'tempete/jeu.html' : a.startsWith('jeu-blocs-') ? 'blocs/jeu.html?j=' + a.slice(10) + '&n=' + n : a.startsWith('jeu-') ? 'jeux/arcade.html?j=' + a.slice(4) + '&n=' + n : lienNiveau(a, n);
const scoreTexte = (a, r) => CAT[a] && CAT[a].jeu ? '★'.repeat(r.score) + '☆'.repeat(Math.max(0, r.total - r.score)) : r.score + ' / ' + r.total;
function node(tag, cls, text) { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; }
function bouton(cls, text, fn) { const b = node('button', cls, text); b.type = 'button'; if (fn) b.onclick = fn; return b; }
function dire(t, ok) { const n = el('notice'); n.textContent = t || ''; n.hidden = !t; n.className = 'notice' + (ok ? ' ok' : ''); if (t) n.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
const duree = s => s < 60 ? s + ' s' : Math.floor(s / 60) + ' min ' + String(s % 60).padStart(2, '0') + ' s';
const date = iso => new Date(iso).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' }) + ' ' + new Date(iso).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });
const jour = iso => new Date(iso).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' });
const lienNiveau = (a, n) => 'exercices/activite.html?a=' + a + '&n=' + n;
const etoiles = (score, total) => { const r = score / total; return r >= .9 ? '⭐⭐⭐' : r >= .7 ? '⭐⭐' : '⭐'; };
const nomComplet = s => s.first_name + ' ' + s.last_name;

/* Groups the results: best score, best time, number of attempts, last date. */
function bilan(results) {
  const map = new Map();
  for (const r of results) {
    const k = r.activity + ':' + r.level;
    const b = map.get(k) || { activity: r.activity, level: r.level, essais: 0, score: -1, total: r.total, temps: Infinity, dernier: r.completed_at };
    b.essais++;
    if (r.score / r.total > b.score / b.total || b.score < 0) { b.score = r.score; b.total = r.total; }
    b.temps = Math.min(b.temps, r.seconds);
    if (r.completed_at > b.dernier) b.dernier = r.completed_at;
    map.set(k, b);
  }
  return map;
}

/* ======================== STUDENT VIEW ======================== */
function vueEleve(d) {
  const b = bilan(d.results || []);
  el('titre').textContent = 'Mes progrès';
  const box = el('contenu'); vider(box);
  const resume = node('section', 'resume');
  resume.append(node('h2', null, 'Bonjour ' + d.student.first_name + ' ! 👋'));
  const cl = (d.classes || []).map(c => c.name);
  const pc = node('p', 'mes-classes');
  if (cl.length) { pc.append((cl.length > 1 ? 'Tes classes : ' : 'Ta classe : ')); cl.forEach(n => pc.append(node('span', 'puce-classe', n))); }
  else pc.textContent = 'Tu n’es pas encore dans une classe. Mme Hakima va t’ajouter. Tes scores sont déjà gardés.';
  resume.append(pc);
  /* The student only sees what they have completed. */
  resume.append(node('p', null, b.size ? 'Voici les jeux et activités que tu as réussis (' + b.size + ' niveau' + (b.size > 1 ? 'x' : '') + '). Chaque progrès est une réussite !' : 'Tu n’as encore rien terminé. Quand tu réussis un jeu ou un niveau, il apparaît ici avec ton score.'));
  box.append(resume);
  const grille = node('div', 'grille-activites');
  for (const id of ORDRE) {
    const a = CAT[id];
    const faits = a.niveaux.map((n, i) => ({ n, i, r: b.get(id + ':' + (i + 1)) })).filter(x => x.r);
    if (!faits.length) continue;
    const carte = node('section', 'activite-progres'); carte.style.setProperty('--c', a.couleur);
    carte.append(node('h3', null, a.titre));
    const ul = node('ul', 'niveaux-liste');
    for (const { n, i, r } of faits) {
      const li = node('li', 'fait');
      const lien = node('a', null, '✓ ' + (a.jeu ? n.titre : 'Niveau ' + (i + 1) + ' · ' + n.titre)); lien.href = lienDe(id, i + 1);
      li.append(lien, node('span', 'detail', a.jeu ? scoreTexte(id, r) : etoiles(r.score, r.total) + ' ' + r.score + '/' + r.total));
      ul.append(li);
    }
    carte.append(ul); grille.append(carte);
  }
  box.append(grille);
}

/* ======================== TEACHER VIEW ======================== */
let D = null;                    // data received from the server
let onglet = 'gestion';          // 'gestion' (students and classes) or 'suivi' (results)
let classeSuivi = null, eleveChoisi = null;
let filtre = 'tous';             // 'tous', 'sans', or a class id
const coches = new Set();
let ligneOuverte = null;         // { id, mode: 'modifier' | 'mdp' | 'supprimer' }
let nouveauMdp = null;           // { nom, mdp } shown after a change

const classesDe = id => D.members.filter(m => m.student_id === id).map(m => D.classes.find(c => c.id === m.class_id)).filter(Boolean);
const elevesDe = cid => { const ids = new Set(D.members.filter(m => m.class_id === cid).map(m => m.student_id)); return D.students.filter(s => ids.has(s.id)); };

function vueEnseignante() {
  el('titre').textContent = 'Espace enseignante';
  const box = el('contenu'); vider(box);
  const tabs = node('div', 'onglets'); tabs.setAttribute('role', 'tablist');
  [['gestion', '👥 Élèves et classes'], ['suivi', '📊 Suivi des résultats']].forEach(([id, t]) => {
    const b = bouton(null, t, () => { onglet = id; dire(''); vueEnseignante(); });
    b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(onglet === id)); tabs.append(b);
  });
  box.append(tabs);
  const panneau = node('div', 'panneau'); box.append(panneau);
  if (onglet === 'gestion') gestion(panneau); else suivi(panneau);
}

/* ---------- "Students and classes" tab ---------- */
async function action(body, okMsg) {
  try { await EC.api(body); await recharger(); if (okMsg) dire(okMsg, true); return true; }
  catch (e) { dire(e.message); return false; }
}
function gestion(p) {
  /* Classes */
  const secC = node('section', 'bloc'); secC.append(node('h2', null, 'Mes classes'));
  const liste = node('div', 'liste-classes');
  if (!D.classes.length) liste.append(node('p', 'petit', 'Aucune classe. Crée ta première classe ci-dessous.'));
  for (const c of D.classes) {
    const carte = node('div', 'classe-carte');
    carte.append(node('strong', null, c.name), node('span', 'petit', elevesDe(c.id).length + ' élève(s)'));
    const voir = bouton('lien-petit', 'Voir les élèves', () => { filtre = c.id; vueEnseignante(); });
    const ren = bouton('lien-petit', 'Renommer', () => {
      const f = node('form', 'mini-form'); const i = node('input'); i.value = c.name; i.maxLength = 100; i.setAttribute('aria-label', 'Nouveau nom de la classe');
      f.append(i, bouton('secondaire', 'Annuler', () => vueEnseignante())); const ok = node('button', 'principal', 'Enregistrer'); f.append(ok);
      f.onsubmit = e => { e.preventDefault(); action({ action: 'update_class', class_id: c.id, name: i.value }, 'Classe renommée.'); };
      vider(carte, f); i.focus();
    });
    const sup = bouton('lien-petit danger', 'Supprimer', () => {
      const f = node('div', 'confirmation');
      f.append(node('p', null, 'Supprimer la classe « ' + c.name + ' » ? Les élèves et leurs résultats sont gardés ; ils sont seulement retirés de cette classe. Les puzzles partagés avec cette classe ne le sont plus.'));
      f.append(bouton('danger-plein', 'Oui, supprimer la classe', () => action({ action: 'delete_class', class_id: c.id, confirm_name: c.name }, 'Classe supprimée.')), bouton('secondaire', 'Annuler', () => vueEnseignante()));
      vider(carte, f);
    });
    const actions = node('div', 'actions-ligne'); actions.append(voir, ren, sup); carte.append(actions);
    liste.append(carte);
  }
  secC.append(liste);
  const fc = node('form', 'mini-form'); const ic = node('input'); ic.placeholder = 'Nom de la nouvelle classe'; ic.maxLength = 100; ic.required = true; ic.setAttribute('aria-label', 'Nom de la nouvelle classe');
  fc.append(ic, node('button', 'principal', '+ Créer la classe'));
  fc.onsubmit = e => { e.preventDefault(); action({ action: 'create_class', name: ic.value }, 'Classe « ' + ic.value + ' » créée.'); };
  secC.append(fc);
  p.append(secC);

  /* Students */
  const secE = node('section', 'bloc');
  const sansClasse = D.students.filter(s => !classesDe(s.id).length);
  secE.append(node('h2', null, 'Élèves inscrits (' + D.students.length + ')'));
  if (sansClasse.length) secE.append(node('p', 'alerte-douce', '🆕 ' + sansClasse.length + (sansClasse.length > 1 ? ' élèves ne sont dans aucune classe. Coche-les et ajoute-les à une classe.' : ' élève n’est dans aucune classe. Coche-le et ajoute-le à une classe.')));

  if (nouveauMdp) {
    const n = node('div', 'mdp-affiche'); n.append(node('span', null, 'Nouveau mot de passe de ' + nouveauMdp.nom + ' : '), node('code', null, nouveauMdp.mdp), node('span', 'petit', ' Note-le et donne-le à l’élève : il ne sera plus affiché.'));
    n.append(bouton('lien-petit', 'Fermer', () => { nouveauMdp = null; vueEnseignante(); })); secE.append(n);
  }

  /* Filter */
  const barre = node('div', 'barre-outils');
  const lf = node('label', 'champ-inline', 'Afficher : '); const sf = node('select');
  [['tous', 'Tous les élèves'], ['sans', 'Sans classe (' + sansClasse.length + ')']].concat(D.classes.map(c => [c.id, 'Classe : ' + c.name])).forEach(([v, t]) => { const o = node('option', null, t); o.value = v; sf.append(o); });
  sf.value = D.classes.find(c => c.id === filtre) || filtre === 'sans' ? filtre : 'tous';
  sf.onchange = () => { filtre = sf.value; coches.clear(); vueEnseignante(); };
  lf.append(sf); barre.append(lf);

  /* Add / remove the checked students */
  const lc = node('label', 'champ-inline', 'Classe : '); const sc = node('select'); sc.id = 'classeCible';
  if (!D.classes.length) { const o = node('option', null, '— crée d’abord une classe —'); o.value = ''; sc.append(o); }
  D.classes.forEach(c => { const o = node('option', null, c.name); o.value = c.id; sc.append(o); });
  if (D.classes.find(c => c.id === filtre)) sc.value = filtre;
  lc.append(sc);
  const nb = coches.size;
  const add = bouton('principal', 'Ajouter les élèves cochés (' + nb + ')', () => groupe('add_members'));
  const rem = bouton('secondaire', 'Retirer les élèves cochés (' + nb + ')', () => groupe('remove_members'));
  add.disabled = rem.disabled = !nb || !D.classes.length;
  const g = node('div', 'groupe-actions'); g.append(lc, add, rem); barre.append(g);
  secE.append(barre);
  function groupe(act) {
    const cid = sc.value, c = D.classes.find(x => x.id === cid); if (!c) return;
    const ids = [...coches];
    action({ action: act, class_id: cid, student_ids: ids }, (act === 'add_members' ? ids.length + ' élève(s) ajouté(s) à « ' : ids.length + ' élève(s) retiré(s) de « ') + c.name + ' ».').then(ok => { if (ok) { coches.clear(); vueEnseignante(); } });
  }

  /* Table */
  const visibles = D.students.filter(s => filtre === 'tous' ? true : filtre === 'sans' ? !classesDe(s.id).length : classesDe(s.id).some(c => c.id === filtre));
  const wrap = node('div', 'tableau-wrap'); const t = node('table', 'tableau tableau-eleves');
  const hr = node('tr'); const thc = node('th'); const tout = node('input'); tout.type = 'checkbox'; tout.setAttribute('aria-label', 'Tout cocher');
  tout.checked = visibles.length > 0 && visibles.every(s => coches.has(s.id));
  tout.onchange = () => { visibles.forEach(s => tout.checked ? coches.add(s.id) : coches.delete(s.id)); vueEnseignante(); };
  thc.append(tout); hr.append(thc);
  ['Élève', 'Informations de connexion', 'Classes', 'Inscrit le', 'Actions'].forEach(x => hr.append(node('th', null, x)));
  const th = node('thead'); th.append(hr); t.append(th);
  const tb = node('tbody');
  if (!visibles.length) { const tr = node('tr'); const td = node('td', 'vide', 'Aucun élève dans cette liste.'); td.colSpan = 6; tr.append(td); tb.append(tr); }
  for (const s of visibles) tb.append(ligneEleve(s));
  t.append(tb); wrap.append(t); secE.append(wrap);

  /* Add a student yourself */
  const det = node('details', 'ajout-eleve'); det.append(node('summary', null, '+ Ajouter un élève moi-même'));
  const fa = node('form', 'mini-form colonne');
  const champ = (lab, name, type) => { const l = node('label', null, lab); const i = node('input'); i.name = name; i.required = true; i.maxLength = type === 'password' ? 128 : 100; if (type) i.type = 'text'; l.append(i); return l; };
  fa.append(champ('Prénom', 'first'), champ('Nom', 'last'), champ('Mot de passe (8 caractères ou plus)', 'password', 'password'));
  const mdpI = fa.querySelector('[name=password]'); mdpI.value = suggestion(); mdpI.minLength = 8;
  if (D.classes.length) {
    const fs = node('fieldset'); fs.append(node('legend', null, 'Classes'));
    D.classes.forEach(c => { const l = node('label', 'case'); const i = node('input'); i.type = 'checkbox'; i.value = c.id; i.name = 'classe'; if (c.id === filtre) i.checked = true; l.append(i, ' ' + c.name); fs.append(l); });
    fa.append(fs);
  }
  fa.append(node('button', 'principal', 'Créer le compte'));
  fa.onsubmit = e => {
    e.preventDefault(); const f = new FormData(fa);
    const corps = { action: 'create_student', first: f.get('first'), last: f.get('last'), password: f.get('password'), class_ids: f.getAll('classe') };
    action(corps, 'Compte créé pour ' + corps.first + ' ' + corps.last + '.').then(ok => { if (ok) { nouveauMdp = { nom: corps.first + ' ' + corps.last, mdp: corps.password }; vueEnseignante(); } });
  };
  det.append(fa); secE.append(det);
  p.append(secE);
}
function suggestion() {
  const mots = ['soleil', 'nuage', 'etoile', 'pomme', 'banane', 'lapin', 'tigre', 'fusee', 'jardin', 'ballon', 'castor', 'erable', 'hiver', 'plage', 'orange'];
  const a = new Uint32Array(2); crypto.getRandomValues(a);
  return mots[a[0] % mots.length] + String(10 + a[1] % 90) + '!';
}
function ligneEleve(s) {
  const tr = node('tr'); if (coches.has(s.id)) tr.className = 'cochee';
  const tdc = node('td'); const c = node('input'); c.type = 'checkbox'; c.checked = coches.has(s.id); c.setAttribute('aria-label', 'Cocher ' + nomComplet(s));
  c.onchange = () => { c.checked ? coches.add(s.id) : coches.delete(s.id); vueEnseignante(); };
  tdc.append(c); tr.append(tdc);
  const ouvert = ligneOuverte && ligneOuverte.id === s.id ? ligneOuverte.mode : null;
  const tdN = node('td', 'nom'); tdN.append(node('strong', null, nomComplet(s))); tr.append(tdN);
  const tdI = node('td', 'connexion-info');
  if (ouvert === 'modifier') {
    const f = node('form', 'mini-form colonne'); const i1 = node('input'), i2 = node('input'); i1.value = s.first_name; i2.value = s.last_name; i1.required = i2.required = true; i1.maxLength = i2.maxLength = 100;
    const l1 = node('label', null, 'Prénom'); l1.append(i1); const l2 = node('label', null, 'Nom'); l2.append(i2);
    f.append(l1, l2, node('p', 'petit', 'L’élève se connectera avec ce nouveau prénom et ce nouveau nom. Son mot de passe ne change pas.'));
    const bs = node('div', 'actions-ligne'); bs.append(node('button', 'principal', 'Enregistrer'), bouton('secondaire', 'Annuler', () => { ligneOuverte = null; vueEnseignante(); })); f.append(bs);
    f.onsubmit = e => { e.preventDefault(); action({ action: 'update_student', student_id: s.id, first: i1.value, last: i2.value }, 'Élève modifié.').then(ok => { if (ok) { ligneOuverte = null; vueEnseignante(); } }); };
    tdI.append(f); setTimeout(() => i1.focus());
  } else if (ouvert === 'mdp') {
    const f = node('form', 'mini-form colonne'); const i = node('input'); i.value = suggestion(); i.minLength = 8; i.maxLength = 128; i.required = true;
    const l = node('label', null, 'Nouveau mot de passe'); l.append(i);
    const bs = node('div', 'actions-ligne'); bs.append(node('button', 'principal', 'Enregistrer'), bouton('secondaire', 'Autre suggestion', () => { i.value = suggestion(); }), bouton('secondaire', 'Annuler', () => { ligneOuverte = null; vueEnseignante(); }));
    f.append(l, bs);
    f.onsubmit = e => { e.preventDefault(); const mdp = i.value; action({ action: 'reset_student_password', student_id: s.id, password: mdp }, 'Mot de passe changé pour ' + nomComplet(s) + '.').then(ok => { if (ok) { ligneOuverte = null; nouveauMdp = { nom: nomComplet(s), mdp }; vueEnseignante(); } }); };
    tdI.append(f); setTimeout(() => i.select());
  } else {
    const dl = node('dl', 'identifiants');
    dl.append(node('dt', null, 'Prénom'), node('dd', null, s.first_name), node('dt', null, 'Nom'), node('dd', null, s.last_name), node('dt', null, 'Mot de passe'), node('dd', 'cache', '•••••• (caché)'));
    tdI.append(dl);
  }
  tr.append(tdI);
  const tdC = node('td'); const cl = classesDe(s.id);
  if (cl.length) cl.forEach(x => tdC.append(node('span', 'puce-classe', x.name))); else tdC.append(node('span', 'puce-classe sans', 'Aucune classe'));
  tr.append(tdC);
  tr.append(node('td', 'date', s.created_at ? jour(s.created_at) : '—'));
  const tdA = node('td', 'actions-cell');
  if (ouvert === 'supprimer') {
    const f = node('div', 'confirmation');
    f.append(node('p', null, 'Supprimer définitivement le compte de ' + nomComplet(s) + ' et tous ses résultats (maths et puzzles) ?'));
    f.append(bouton('danger-plein', 'Oui, supprimer', () => action({ action: 'delete_student', student_id: s.id, confirm_name: nomComplet(s) }, 'Le compte de ' + nomComplet(s) + ' est supprimé.').then(ok => { if (ok) { ligneOuverte = null; coches.delete(s.id); vueEnseignante(); } })), bouton('secondaire', 'Annuler', () => { ligneOuverte = null; vueEnseignante(); }));
    tdA.append(f);
  } else {
    const ouvrir = mode => () => { ligneOuverte = { id: s.id, mode }; vueEnseignante(); };
    tdA.append(bouton('lien-petit', '✏️ Modifier', ouvrir('modifier')), bouton('lien-petit', '🔑 Nouveau mot de passe', ouvrir('mdp')), bouton('lien-petit danger', '🗑 Supprimer', ouvrir('supprimer')));
  }
  tr.append(tdA);
  return tr;
}

/* ---------- "Results tracking" tab ---------- */
function suivi(box) {
  if (!D.classes.length) { box.append(node('p', 'carte-form', 'Crée d’abord une classe dans l’onglet « Élèves et classes ».')); return; }
  const sel = node('div', 'barre-outils'); const l = node('label', 'champ-inline', 'Classe : '); const s = node('select');
  D.classes.forEach(c => { const o = node('option', null, c.name); o.value = c.id; s.append(o); });
  if (!classeSuivi || !D.classes.find(c => c.id === classeSuivi)) classeSuivi = D.classes[0].id;
  s.value = classeSuivi; s.onchange = () => { classeSuivi = s.value; eleveChoisi = null; vueEnseignante(); };
  l.append(s); sel.append(l);
  const classe = D.classes.find(c => c.id === classeSuivi);
  const eleves = elevesDe(classe.id);
  const ids = new Set(eleves.map(x => x.id));
  const resultats = D.results.filter(r => ids.has(r.student_id));
  sel.append(bouton('secondaire', '⬇ Télécharger les résultats (Excel / CSV)', () => exporter(classe, eleves, resultats)));
  box.append(sel);
  if (!eleves.length) { box.append(node('p', 'carte-form', 'Aucun élève dans cette classe. Ajoute des élèves dans l’onglet « Élèves et classes ».')); return; }

  const wrap = node('div', 'tableau-wrap');
  const t = node('table', 'tableau'); t.append(node('caption', null, 'Niveaux terminés par activité — clique sur un élève pour voir le détail'));
  const thead = node('thead'), hr = node('tr'); hr.append(node('th', null, 'Élève'));
  for (const id of M.ordre) { const th = node('th', null, M.activites[id].titre); th.scope = 'col'; hr.append(th); }
  { const th = node('th', null, '🎮 Jeux'); th.scope = 'col'; hr.append(th); }
  hr.append(node('th', null, 'Dernière activité')); thead.append(hr); t.append(thead);
  const tb = node('tbody');
  for (const e of eleves) {
    const mine = resultats.filter(r => r.student_id === e.id); const b = bilan(mine);
    const tr = node('tr'); if (e.id === eleveChoisi) tr.className = 'choisi';
    const th = node('th'); th.scope = 'row';
    th.append(bouton('lien-eleve', nomComplet(e), () => { eleveChoisi = e.id; vueEnseignante(); el('detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
    tr.append(th);
    for (const id of M.ordre) {
      const tot = M.activites[id].niveaux.length; let fait = 0;
      for (let i = 1; i <= tot; i++) if (b.has(id + ':' + i)) fait++;
      tr.append(node('td', fait === tot ? 'complet' : fait ? 'partiel' : 'vide', fait + ' / ' + tot));
    }
    { let fait = 0, tot = 0; for (const id of IDS_JEUX) { const n = CAT[id].niveaux.length; tot += n; for (let i = 1; i <= n; i++) if (b.has(id + ':' + i)) fait++; }
      tr.append(node('td', fait === tot ? 'complet' : fait ? 'partiel' : 'vide', fait + ' / ' + tot)); }
    tr.append(node('td', 'date', mine.length ? date(mine[0].completed_at) : '—'));
    tb.append(tr);
  }
  t.append(tb); wrap.append(t); box.append(wrap);
  if (eleveChoisi && ids.has(eleveChoisi)) box.append(detailEleve(eleves.find(x => x.id === eleveChoisi), resultats.filter(r => r.student_id === eleveChoisi)));
  const nomDe = new Map(eleves.map(x => [x.id, nomComplet(x)]));
  const j = node('section', 'journal'); j.append(node('h2', null, 'Derniers niveaux terminés'));
  if (!resultats.length) j.append(node('p', null, 'Aucun résultat pour le moment.'));
  const ul = node('ul');
  for (const r of resultats.slice(0, 15)) { const a = CAT[r.activity]; ul.append(node('li', null, date(r.completed_at) + ' — ' + nomDe.get(r.student_id) + ' · ' + (a ? a.titre : r.activity) + ' · niveau ' + r.level + ' · ' + scoreTexte(r.activity, r) + ' · ' + duree(r.seconds))); }
  j.append(ul); box.append(j);
}
function detailEleve(s, mine) {
  const sec = node('section', 'detail-eleve'); sec.id = 'detail';
  sec.append(node('h2', null, nomComplet(s)));
  if (!mine.length) { sec.append(node('p', null, 'Aucun niveau terminé pour le moment.')); return sec; }
  const b = bilan(mine);
  const t = node('table', 'tableau'); const h = node('tr');
  ['Activité', 'Niveau', 'Meilleur score', 'Meilleur temps', 'Essais', 'Dernière fois'].forEach(x => h.append(node('th', null, x)));
  const thead = node('thead'); thead.append(h); t.append(thead); const tb = node('tbody');
  for (const id of ORDRE) CAT[id].niveaux.forEach((n, i) => {
    const r = b.get(id + ':' + (i + 1)); if (!r) return;
    const tr = node('tr');
    tr.append(node('td', null, CAT[id].titre), node('td', null, CAT[id].jeu ? n.titre : (i + 1) + ' · ' + n.titre), node('td', r.score / r.total >= .7 ? 'complet' : 'partiel', scoreTexte(id, r)), node('td', null, duree(r.temps)), node('td', null, String(r.essais)), node('td', 'date', date(r.dernier)));
    tb.append(tr);
  });
  t.append(tb); const w = node('div', 'tableau-wrap'); w.append(t); sec.append(w);
  return sec;
}
function exporter(classe, eleves, resultats) {
  const nom = new Map(eleves.map(s => [s.id, [s.first_name, s.last_name]]));
  const lignes = [['Prénom', 'Nom', 'Activité', 'Niveau', 'Titre du niveau', 'Score', 'Sur', 'Temps (secondes)', 'Date']];
  for (const r of resultats) {
    const a = CAT[r.activity], n = a && a.niveaux[r.level - 1], d = new Date(r.completed_at);
    lignes.push([...(nom.get(r.student_id) || ['', '']), a ? a.titre : r.activity, r.level, n ? n.titre : '', r.score, r.total, r.seconds, d.toLocaleDateString('fr-CA') + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')]);
  }
  const csv = '﻿' + lignes.map(l => l.map(v => '"' + String(v).split('"').join('""') + '"').join(';')).join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = 'resultats-' + classe.name.split(/[^\p{L}\p{N}]+/u).join('-') + '.csv';
  document.body.append(a); a.click(); a.remove();
}

/* ======================== LOADING ======================== */
async function recharger() {
  const d = await EC.chargerProfil();
  if (d.role === 'teacher') { D = { classes: d.classes || [], students: d.students || [], members: d.members || [], results: d.results || [] }; vueEnseignante(); }
  else vueEleve(d);
  return d;
}
async function charger() {
  dire('');
  if (!EC.connecte()) { location.href = ('connexion.html?role=eleve&retour=' + encodeURIComponent(location.href)); return; }
  vider(el('contenu'), node('p', 'chargement', 'Chargement…'));
  try { await recharger(); }
  catch (e) {
    if (!EC.connecte()) { location.href = ('connexion.html?role=eleve&retour=' + encodeURIComponent(location.href)); return; }
    vider(el('contenu')); dire(e.message);
  }
}
el('actualiser').onclick = charger;
el('deconnexion').onclick = async () => { await EC.deconnexion(); location.href = 'index.html'; };
charger();
})();
