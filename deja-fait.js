/* "Already played" labels on the activity tiles.
   When a student is signed in, each tile of an activity they have already done gets a small label:
   "✓ Déjà joué · N niveaux faits". The results come from the student's account (same server for all the class sites)
   and, for some games, from the levels kept on this device.
   Tiles that open one precise level (a link with n=) are left alone: their page already shows the level score. */
(function () {
  'use strict';
  /* Game pages whose address gives no activity name: page or folder → activity saved on the server */
  var PAGES = {
    'ile/jeu.html': 'jeu-ile', 'jeux/ile-aux-blocs.html': 'jeu-ile',
    'ile-maths/jeu.html': 'jeu-ile-maths', 'jeux/ile-aux-calculs.html': 'jeu-ile-maths',
    'splash/jeu.html': 'jeu-splash', 'jeux/splash-des-calculs.html': 'jeu-splash',
    'mer/jeu.html': 'jeu-mer2', 'jeux/mer-des-requins.html': 'jeu-mer2',
    'desert/jeu.html': 'jeu-desert', 'jeux/desert-des-calculs.html': 'jeu-desert',
    'obby/jeu.html': 'jeu-math-obby', 'jeux/math-obby.html': 'jeu-math-obby',
    'pirates/jeu.html': 'jeu-pirates', 'jeux/pirates-de-la-logique.html': 'jeu-pirates',
    'village/jeu.html': 'jeu-village', 'jeux/village-des-amis.html': 'jeu-village',
    'ville/jeu.html': 'jeu-ville', 'jeux/ville-en-blocs.html': 'jeu-ville',
    'tempete/jeu.html': 'jeu-tempete', 'jeux/tempete-des-blocs.html': 'jeu-tempete',
    'sauts/jeu.html': 'jeu-saute-blocs', 'jeux/saute-blocs.html': 'jeu-saute-blocs',
    'turbo-maths-racing/index.html': 'jeu-turbo',
    'jeux/blocs-de-couleur.html': 'jeu-blocs-*'
  };
  /* Older activity names that now belong to a merged game */
  var ANCIENS = { 'jeu-serpcalc30': ['jeu-serpcalc50', 'jeu-serpcalc100'], 'jeu-attrape30': ['jeu-attrape50', 'jeu-attrape100'], 'jeu-pont50': ['jeu-pont100'], 'jeu-mer2': ['jeu-mer'] };

  function activiteDe(href) {
    var u; try { u = new URL(href, location.href); } catch (e) { return null; }
    if (u.origin !== location.origin) return null;
    var q = u.searchParams, chemin = u.pathname;
    if (q.get('n')) return null;
    var j = q.get('j'), a = q.get('a');
    if (/\/arcade\.html$/.test(chemin) && j) return 'jeu-' + j;
    if (/\/ateliers\/jeu\.html$/.test(chemin) && j) return 'atelier-' + j;
    if (/\/blocs\/jeu\.html$/.test(chemin) && j) return 'jeu-blocs-' + j;
    if (/\/exercices\/activite\.html$/.test(chemin) && a) return a;
    for (var p in PAGES) if (chemin.slice(-(p.length + 1)) === '/' + p) return PAGES[p];
    return null;
  }

  function style() {
    var s = document.createElement('style');
    s.textContent = '.tuile{position:relative}.deja-fait{position:absolute;top:10px;right:10px;z-index:2;background:#e6f5ec;color:#1d5c37;border:1px solid #9fd3b0;' +
      'border-radius:999px;padding:4px 10px;font:600 13px/1.2 system-ui,sans-serif;box-shadow:0 2px 6px #0000001a;max-width:calc(100% - 20px)}';
    document.head.appendChild(s);
  }

  function marquer(res) {
    if (!res || !res.length) return;
    /* Levels done per activity */
    var faits = {};
    res.forEach(function (r) { (faits[r.activity] = faits[r.activity] || {})[r.level] = true; });
    var tuiles = document.querySelectorAll('a.tuile[href]');
    if (!tuiles.length) return;
    style();
    tuiles.forEach(function (t) {
      var act = activiteDe(t.getAttribute('href'));
      if (!act || t.querySelector('.deja-fait')) return;
      var niveaux = {};
      var noms = [act].concat(ANCIENS[act] || []);
      Object.keys(faits).forEach(function (k) {
        var ok = act.slice(-1) === '*' ? k.indexOf(act.slice(0, -1)) === 0 : noms.indexOf(k) >= 0;
        if (ok) Object.keys(faits[k]).forEach(function (n) { niveaux[k + ':' + n] = true; });
      });
      var n = Object.keys(niveaux).length;
      if (!n) return;
      var b = document.createElement('span');
      b.className = 'deja-fait';
      b.textContent = '✓ Déjà joué · ' + n + (n > 1 ? ' niveaux faits' : ' niveau fait');
      t.appendChild(b);
      var lbl = t.getAttribute('aria-label');
      if (lbl) t.setAttribute('aria-label', lbl + ' (' + b.textContent + ')');
    });
  }

  /* Games that also keep their levels on this device (same site address): read them too,
     so the label shows even without signing in. Key → activity name. */
  var LOCAL = { 'turbo-maths-niveaux': 'jeu-turbo' };
  function locaux() {
    var res = [];
    Object.keys(LOCAL).forEach(function (cle) {
      try {
        var m = JSON.parse(localStorage.getItem(cle)) || {};
        Object.keys(m).forEach(function (n) { res.push({ activity: LOCAL[cle], level: Number(n) }); });
      } catch (e) {}
    });
    return res;
  }

  window.addEventListener('load', function () {
    var serveur = window.EC && EC.mesResultats ? EC.mesResultats().catch(function () { return null; }) : Promise.resolve(null);
    serveur.then(function (res) { marquer((res || []).concat(locaux())); });
  });
})();
