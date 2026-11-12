/* Side bar sub-menus (Mathematics by domain, and Games): groups, and on hover the list of activities.
   Links are built from the folder of this script, so the menu works from every folder of the site.
   One file for every page: edit the lists below to add an activity or a game.
   Each menu keeps the colour of its category (site palette). */
(function () {
  'use strict';
  var moi = document.currentScript, BASE = moi ? moi.src.slice(0, moi.src.lastIndexOf('menu-lateral.js')) : '';
  var J = 'jeux/arcade.html?j=', T = 'ateliers/jeu.html?j=', M = 'mathematiques/index.html', G = 'jeux/';
  var MENUS = [
    { parent: M, couleur: 'mathematiques', page: M, groupes: [
      { id: 'dom-nombres-calculs', icone: '➕', nom: 'Additions, soustractions', titre: 'Nombres · Additions et soustractions', liens: [[J + 'serpcalc30', '🟢 Serpent des calculs'], [J + 'attrape30', '🟢 Attrape les bons calculs'], [J + 'labycalc50', '🟡 Labyrinthe des additions'], [J + 'serpcalc50', '🟡 Serpent des calculs · 50'], [J + 'pont50', '🟡 Pont des additions'], [J + 'attrape50', '🟡 Attrape les calculs · 50'], [J + 'serpcalc100', '🟡 Serpent des calculs · 100'], [J + 'pont100', '🟡 Pont des nombres manquants · 100'], [J + 'attrape100', '🔴 Attrape les calculs · 100']] },
      { id: 'dom-nombres-valeur', icone: '🔢', nom: 'Valeur de position', titre: 'Nombres · Valeur de position', liens: [[J + 'serpvaleur', '🟢 Serpent des nombres'], [J + 'attrapenb', '🟢 Attrape les nombres'], [J + 'labyvaleur', '🟡 Labyrinthe des centaines']] },
      { id: 'dom-nombres-mult', icone: '✖️', nom: 'Multiplier, fractions', titre: 'Nombres · Multiplication, division et fractions', liens: [[T + 'pizzeria', '🍕 La pizzeria des fractions'], [J + 'serpent', '🔴 Serpent des multiples'], [J + 'attrape', '🔴 Attrape les bons'], [J + 'labycalc', '🔴 Labyrinthe des calculs'], [J + 'serpfrac', '🔴 Serpent des fractions'], [J + 'pont', '🔴 Pont des nombres'], [J + 'glisse', '🔴 Glissière des nombres']] },
      { id: 'dom-algebre', icone: '🤖', nom: 'Algèbre', titre: 'Algèbre · Codage', liens: [[T + 'robot', '🤖 Le robot livreur'], [J + 'robot', '🔴 Robot programmeur']] },
      { id: 'dom-donnees', icone: '📊', nom: 'Données', liens: [[T + 'enquete', '📊 L’enquête de la classe']] },
      { id: 'dom-espace', icone: '📐', nom: 'Sens de l’espace', titre: 'Sens de l’espace · Géométrie, mesure, repérage', liens: [[T + 'geoplan', '🔷 L’atelier des formes'], [T + 'chantier', '🏗️ Le chantier des mesures'], [T + 'autobus', '🚌 L’horaire de l’autobus'], [T + 'tresor', '🧭 La chasse au trésor'], [J + 'fusee', '🟡 Course aux coordonnées'], [J + 'droite', '🔴 Droite cible']] },
      { id: 'dom-finances', icone: '💵', nom: 'Finances', titre: 'Littératie financière', liens: [[T + 'magasin', '🛒 Le magasin de la ville']] }
    ] },
    { parent: G + 'index.html', couleur: 'jeux', page: G + 'index.html', groupes: [
      { id: 'jeux-calculs3d', icone: '🏃', nom: 'Calculs en 3D', titre: 'Parcours de calculs en 3D', liens: [[G + 'math-obby.html', '🌈 Math Obby'], [G + 'ile-aux-calculs.html', '🔢 Île aux calculs'], [G + 'splash-des-calculs.html', '🌊 Splash des calculs'], [G + 'mer-des-requins.html', '🦈 La mer des requins'], [G + 'desert-des-calculs.html', '🏜️ Désert des calculs']] },
      { id: 'jeux-blocs3d', icone: '🧊', nom: 'Blocs en 3D', titre: 'Aventures en blocs 3D', liens: [[G + 'ile-aux-blocs.html', '🏝️ Île aux blocs'], [G + 'tempete-des-blocs.html', '🌀 Tempête des blocs'], [G + 'village-des-amis.html', '🏘️ Village des amis'], [G + 'ville-en-blocs.html', '🏙️ La ville en blocs'], [G + 'blocs-de-couleur.html', '🧱 Blocs de couleur']] },
      { id: 'jeux-logique', icone: '🧩', nom: 'Logique', titre: 'Logique et stratégie', liens: [[G + 'pirates-de-la-logique.html', '⚓ Pirates de la logique'], [J + 'labyrinthe', '🟢 Labyrinthe aux étoiles'], [J + 'caisses', '🟡 Pousse les caisses'], [J + 'caissesx', '🔴 Pousse les caisses · expert'], [J + 'laser', '🔴 Rayon laser']] }
    ] }
  ];
  var tr = function (s) { return window.EC_TRADUIRE ? window.EC_TRADUIRE(s) : s; };
  var ouverts = [];
  function toutFermer(sauf) { ouverts.slice().forEach(function (f) { if (f !== sauf) f(); }); }
  function construire(M) {
    var cible = new URL(BASE + M.parent, location.href).href, parent = null;
    document.querySelectorAll('.menu-activites a:not(.ml-entree)').forEach(function (x) { if (x.href === cible) parent = x; });
    if (!parent || parent.dataset.sousMenu) return; parent.dataset.sousMenu = '1';
    var ici = location.href.split('#')[0].split('?')[0] === cible || (location.href.split('#')[0].split('?')[0] + 'index.html') === cible, C = 'var(--' + M.couleur + ')', P = 'var(--' + M.couleur + '-pale)';
    var bloc = document.createElement('div'); bloc.className = 'ml-sous'; bloc.style.setProperty('--mc', C); bloc.style.setProperty('--mp', P);
    M.groupes.forEach(function (d) {
      var g = document.createElement('div'); g.className = 'ml-groupe';
      var a = document.createElement('a'); a.className = 'sous-onglet ml-entree';
      a.href = d.href ? BASE + d.href : ((ici ? '' : BASE + M.page) + '#' + d.id);
      a.style.setProperty('--c', C); a.setAttribute('aria-haspopup', 'true'); a.setAttribute('aria-expanded', 'false');
      a.innerHTML = '<span class="menu-icone" aria-hidden="true">' + d.icone + '</span><span class="ml-nom"></span><span class="ml-compte"></span><span class="ml-fleche" aria-hidden="true">›</span>';
      a.querySelector('.ml-nom').textContent = tr(d.nom); a.querySelector('.ml-compte').textContent = d.liens.length;
      var v = document.createElement('div'); v.className = 'ml-volant'; v.setAttribute('role', 'menu'); v.style.setProperty('--mc', C); v.style.setProperty('--mp', P);
      var t = document.createElement('p'); t.className = 'ml-volant-titre'; t.textContent = d.icone + ' ' + tr(d.titre || d.nom); v.appendChild(t);
      var grille = document.createElement('div'); grille.className = 'ml-liste' + (d.liens.length > 8 ? ' deux' : '');
      d.liens.forEach(function (x) { var l = document.createElement('a'); l.href = BASE + x[0]; l.setAttribute('role', 'menuitem'); l.textContent = tr(x[1]); grille.appendChild(l); });
      v.appendChild(grille);
      g.appendChild(a); bloc.appendChild(g); document.body.appendChild(v);
      var minuterie = null;
      var fermer = function () { g.classList.remove('ouvert'); v.classList.remove('ouvert'); a.setAttribute('aria-expanded', 'false'); var k = ouverts.indexOf(fermer); if (k >= 0) ouverts.splice(k, 1); };
      var ouvrir = function () {
        if (window.matchMedia('(max-width: 900px)').matches) return;
        clearTimeout(minuterie); toutFermer(fermer);
        var r = a.getBoundingClientRect(); v.style.left = (r.right + 6) + 'px';
        g.classList.add('ouvert'); v.classList.add('ouvert'); a.setAttribute('aria-expanded', 'true'); if (ouverts.indexOf(fermer) < 0) ouverts.push(fermer);
        var h = v.offsetHeight; v.style.top = Math.max(80, Math.min(r.top - 8, window.innerHeight - h - 12)) + 'px';
      };
      var plusTard = function () { minuterie = setTimeout(fermer, 200); };
      [g, v].forEach(function (z) {
        z.addEventListener('mouseenter', function () { clearTimeout(minuterie); if (z === g) ouvrir(); });
        z.addEventListener('mouseleave', plusTard);
        z.addEventListener('focusout', function (e) { if (!g.contains(e.relatedTarget) && !v.contains(e.relatedTarget)) fermer(); });
        z.addEventListener('keydown', function (e) { if (e.key === 'Escape') { fermer(); a.focus(); } });
      });
      g.addEventListener('focusin', ouvrir);
      a.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); ouvrir(); var p = v.querySelector('.ml-liste a'); p && p.focus(); } });
    });
    parent.insertAdjacentElement('afterend', bloc);
  }
  function lienJeuxEnHaut() {
    var nav = document.querySelector('.menu-general'); if (!nav || nav.querySelector('.lien-jeux')) return;
    var a = document.createElement('a'); a.href = BASE + 'jeux/index.html'; a.className = 'lien-jeux'; a.textContent = '🎮 ' + tr('Jeux');
    if (/\/jeux\/(index\.html)?$/.test(location.pathname)) a.setAttribute('aria-current', 'page');
    var acc = nav.querySelector('a[href="index.html"]'); acc ? acc.insertAdjacentElement('afterend', a) : nav.appendChild(a);
  }
  /* Keep the menu scroll position from one page to the next (otherwise it jumps to the top on every click) */
  var CLE = 'ec-menu-defilement';
  function memoriserDefilement(bl) {
    var garder = function () { try { sessionStorage.setItem(CLE, String(bl.scrollTop)); } catch (e) {} };
    bl.addEventListener('scroll', garder, { passive: true });
    window.addEventListener('pagehide', garder);
    document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a')) garder(); }, true);
    var y = null; try { y = sessionStorage.getItem(CLE); } catch (e) {}
    if (y !== null && !isNaN(+y)) bl.scrollTop = +y;
    var ici = bl.querySelector('a[aria-current="page"]');
    if (ici) { var r = ici.getBoundingClientRect(), rb = bl.getBoundingClientRect(); if (r.top < rb.top || r.bottom > rb.bottom) bl.scrollTop += r.top - rb.top - rb.height / 3; }
  }
  function poser() { MENUS.forEach(construire); lienJeuxEnHaut(); var bm = document.querySelector('.barre-laterale'); if (bm) memoriserDefilement(bm); var bl = document.querySelector('.barre-laterale'), y0 = bl ? bl.scrollTop : 0; bl && bl.addEventListener('scroll', function () { if (Math.abs(bl.scrollTop - y0) > 4) toutFermer(); y0 = bl.scrollTop; }); }
  var css = document.createElement('style');
  css.textContent = [
    '.ml-sous{display:flex;flex-direction:column;gap:2px}',
    '.barre-laterale{overflow-x:hidden}','.menu-activites a.ml-entree{gap:8px;padding-right:6px!important}','.ml-entree .ml-nom{flex:1;min-width:0}',
    '.ml-compte{font-size:12px;font-weight:800;color:var(--mc);background:var(--mp);border-radius:999px;padding:1px 8px}',
    '.ml-fleche{font-size:20px;line-height:1;color:var(--mc);opacity:.6;transition:transform .15s}',
    '.ml-groupe.ouvert>.ml-entree{background:var(--mp);color:var(--mc)}',
    '.ml-groupe.ouvert .ml-fleche{opacity:1;transform:translateX(3px)}',
    '.ml-volant{display:none;position:fixed;z-index:1000;min-width:270px;max-width:560px;background:#fff;border:1px solid var(--surface-3,#dde6ea);border-left:5px solid var(--mc);border-radius:14px;box-shadow:0 14px 34px rgba(20,40,60,.18);padding:10px}',
    '.ml-volant.ouvert{display:block}',
    '.ml-volant-titre{margin:2px 8px 8px;font-size:13px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:var(--mc)}',
    '.ml-liste.deux{display:grid;grid-template-columns:1fr 1fr;column-gap:6px}',
    '.ml-volant a{display:block;padding:9px 12px;border-radius:10px;text-decoration:none;color:var(--encre);font-size:16px;font-weight:600}',
    '.ml-volant a:hover,.ml-volant a:focus{background:var(--mp);color:var(--mc);outline:none}',
    '.menu-general .lien-jeux{font-weight:800;color:var(--jeux)!important;background:var(--jeux-pale)}',
    '.menu-general .lien-jeux:hover{background:var(--jeux)!important;color:#fff!important}',
    '@media(max-width:900px){.ml-sous,.ml-volant{display:none!important}}'
  ].join('');
  document.head.appendChild(css);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', poser); else poser();
})();
