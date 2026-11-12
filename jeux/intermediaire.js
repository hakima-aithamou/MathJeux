/* Games · INTERMEDIATE level: Calculation maze, Fraction snake, Number bridge,
   Coordinate race, Push the crates. Loaded before arcade.js, which provides the tools (O). */
window.ArcadeJeux = window.ArcadeJeux || [];
window.ArcadeJeux.push(O => {
'use strict';
const { W, H, hasard, pioche, melange, rond, etoile, texte, visage, DIRS, fois, moins, divise } = O;
const nb = v => String(v).replace('-', moins).replace('.', ',');
const V4 = [[0, -1], [1, 0], [0, 1], [-1, 0]];

/* ---------- Shared tools ---------- */
/* n × n maze: walls (1 north, 2 east, 4 south, 8 west), open passage?, distances. */
function faireLabyrinthe(n) {
  const murs = Array.from({ length: n }, () => Array(n).fill(15)), vu = Array.from({ length: n }, () => Array(n).fill(false));
  const V = [[0, -1, 1, 4], [1, 0, 2, 8], [0, 1, 4, 1], [-1, 0, 8, 2]], pile = [[0, 0]]; vu[0][0] = true;
  while (pile.length) {
    const [x, y] = pile[pile.length - 1];
    const op = V.filter(([dx, dy]) => { const a = x + dx, b = y + dy; return a >= 0 && b >= 0 && a < n && b < n && !vu[b][a]; });
    if (!op.length) { pile.pop(); continue; }
    const [dx, dy, m, mo] = pioche(op); murs[y][x] &= ~m; murs[y + dy][x + dx] &= ~mo; vu[y + dy][x + dx] = true; pile.push([x + dx, y + dy]);
  }
  for (let k = 0; k < Math.floor(n * n / 10); k++) {
    const x = hasard(0, n - 2), y = hasard(0, n - 2);
    if (Math.random() < .5) { murs[y][x] &= ~2; murs[y][x + 1] &= ~8; } else { murs[y][x] &= ~4; murs[y + 1][x] &= ~1; }
  }
  const ouvert = (x, y, dx, dy) => !(murs[y][x] & (dx === 1 ? 2 : dx === -1 ? 8 : dy === 1 ? 4 : 1));
  /* Shortest path; "evite" = forbidden cells (except the finish). */
  const chemin = (sx, sy, tx, ty, evite) => {
    const p = new Map(), f = [[sx, sy]]; p.set(sx + ',' + sy, null);
    while (f.length) {
      const [x, y] = f.shift();
      if (x === tx && y === ty) break;
      for (const [dx, dy] of V4) {
        const a = x + dx, b = y + dy, k = a + ',' + b;
        if (a < 0 || b < 0 || a >= n || b >= n || p.has(k) || !ouvert(x, y, dx, dy)) continue;
        if (evite && evite(a, b) && !(a === tx && b === ty)) continue;
        p.set(k, [x, y]); f.push([a, b]);
      }
    }
    if (!p.has(tx + ',' + ty)) return null;
    const ch = []; let c = [tx, ty];
    while (c && !(c[0] === sx && c[1] === sy)) { ch.unshift(c); c = p.get(c[0] + ',' + c[1]); }
    return ch;
  };
  return { n, murs, ouvert, chemin };
}
function dessinerMurs(ctx, L, c, couleur) {
  ctx.strokeStyle = couleur; ctx.lineWidth = Math.max(3, c / 9); ctx.lineCap = 'round'; ctx.beginPath();
  for (let y = 0; y < L.n; y++) for (let x = 0; x < L.n; x++) {
    const m = L.murs[y][x], X = x * c, Y = y * c;
    if (m & 1) { ctx.moveTo(X, Y); ctx.lineTo(X + c, Y); }
    if (m & 8) { ctx.moveTo(X, Y); ctx.lineTo(X, Y + c); }
    if (y === L.n - 1 && (m & 4)) { ctx.moveTo(X, Y + c); ctx.lineTo(X + c, Y + c); }
    if (x === L.n - 1 && (m & 2)) { ctx.moveTo(X + c, Y); ctx.lineTo(X + c, Y + c); }
  }
  ctx.stroke();
}
/* Three wrong but close answers. */
function leurres(r, extra, nbr) {
  const c = melange([...(extra || []), r + 1, r - 1, r + 2, r - 2, r + 10, r - 10, r + 3]).filter((v, i, t) => v !== r && t.indexOf(v) === i && (r < 0 || v > 0));
  return c.slice(0, nbr || 3);
}
function etoilesCoeurs(c) { return Math.max(1, c); }

/* ================================================================
   1. CALCULATION MAZE
   ================================================================ */
const CALCULS = [
  { titre: 'Additions', description: 'Jusqu’à 21 · labyrinthe 8 × 8', n: 8, tirer() { const a = hasard(3, 12), b = hasard(3, 9); return { q: a + ' + ' + b, r: a + b }; } },
  { titre: 'Soustractions', description: 'Jusqu’à 30 · labyrinthe 8 × 8', n: 8, tirer() { const a = hasard(11, 30), b = hasard(3, a - 3); return { q: a + ' ' + moins + ' ' + b, r: a - b, x: [a + b] }; } },
  { titre: 'Tables de 2 à 5', description: 'Multiplications · labyrinthe 9 × 9', n: 9, tirer() { const a = hasard(2, 5), b = hasard(3, 10); return { q: a + ' ' + fois + ' ' + b, r: a * b, x: [a * (b + 1), a * (b - 1), a + b] }; } },
  { titre: 'Tables de 6 à 9', description: 'Multiplications · labyrinthe 9 × 9', n: 9, tirer() { const a = hasard(6, 9), b = hasard(3, 10); return { q: a + ' ' + fois + ' ' + b, r: a * b, x: [a * (b + 1), a * (b - 1), (a - 1) * b] }; } },
  { titre: 'Divisions', description: 'Les tables à l’envers · labyrinthe 10 × 10', n: 10, tirer() { const b = hasard(2, 9), r = hasard(2, 10); return { q: b * r + ' ' + divise + ' ' + b, r, x: [r + 1, r - 1, b] }; } },
  { titre: 'Priorité des opérations', description: 'La multiplication d’abord · 10 × 10', n: 10, tirer() { const a = hasard(2, 10), b = hasard(2, 6), c = hasard(2, 6); return { q: a + ' + ' + b + ' ' + fois + ' ' + c, r: a + b * c, x: [(a + b) * c] }; } },
  { titre: 'Parenthèses', description: 'Les parenthèses d’abord · 11 × 11', n: 11, tirer() { const a = hasard(2, 9), b = hasard(2, 6), c = hasard(2, 5); return { q: '(' + a + ' + ' + b + ') ' + fois + ' ' + c, r: (a + b) * c, x: [a + b * c] }; } },
  { titre: 'Fraction d’un nombre', description: 'Par exemple ¾ de 20 · 11 × 11', n: 11, tirer() { const d = pioche([2, 3, 4, 5, 10]), k = hasard(1, d - 1), m = d * hasard(2, 8); return { q: k + '/' + d + ' de ' + m, r: k * m / d, x: [m / d, m - k * m / d] }; } }
];
const labycalc = {
  id: 'labycalc', palier: 'intermediaire', titre: 'Labyrinthe des calculs', icone: '🔑', couleur: '#3d6fb6',
  resume: 'Trouve la clé qui porte la bonne réponse. Trois bonnes clés ouvrent la porte.',
  touches: 'Flèches · ou clic sur une case',
  aide: 'Flèches pour avancer, ou clique sur une case. Marche sur une clé pour la prendre : choisis bien !',
  niveaux: CALCULS,
  consigne() { return ''; },
  init(nv, J) {
    const L = faireLabyrinthe(nv.n);
    this.s = { nv, L, c: W / nv.n, joueur: { x: 0, y: 0 }, vue: { x: 0, y: 0 }, chemin: [], attente: 0, cles: [], trouvees: 0, coeurs: 3, fini: false, ouverte: false, calc: null };
    J.coeurs(3); this.nouvelleQuestion(J);
    J.message('Utilise les flèches, ou clique sur une case pour y aller.');
  },
  nouvelleQuestion(J) {
    const s = this.s, n = s.L.n;
    s.calc = s.nv.tirer();
    const valeurs = [s.calc.r, ...leurres(s.calc.r, s.calc.x)];
    const libres = [];
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!(x === n - 1 && y === n - 1) && Math.abs(x - s.joueur.x) + Math.abs(y - s.joueur.y) >= 3) libres.push([x, y]);
    /* Each key must be reachable without stepping on another key. */
    for (let essai = 0; essai < 300; essai++) {
      s.cles = melange(libres).slice(0, valeurs.length).map(([x, y], i) => ({ x, y, v: valeurs[i], ok: i === 0 }));
      const ok = s.cles.every(k => s.L.chemin(s.joueur.x, s.joueur.y, k.x, k.y, (a, b) => s.cles.some(o => o !== k && o.x === a && o.y === b)));
      if (ok) break;
    }
    J.consigne('Clé ' + (s.trouvees + 1) + ' sur 3 : prends la clé qui vaut  ' + s.calc.q);
    J.score('Clés : ' + s.trouvees + ' / 3');
  },
  bouger(dx, dy, J) {
    const s = this.s, j = s.joueur, n = s.L.n;
    if (s.fini) return;
    const x = j.x + dx, y = j.y + dy;
    if (x < 0 || y < 0 || x >= n || y >= n || !s.L.ouvert(j.x, j.y, dx, dy)) { s.chemin = []; J.message('Un mur bloque ce chemin.', 'oups'); return; }
    j.x = x; j.y = y;
    const cle = s.cles.find(k => k.x === x && k.y === y);
    if (cle) {
      s.chemin = [];
      if (cle.ok) {
        s.trouvees++;
        if (s.trouvees >= 3) { s.cles = []; s.ouverte = true; J.score('Clés : 3 / 3'); J.consigne('Les 3 clés sont trouvées : va à la porte verte 🚪.'); J.message('Oui ! ' + s.calc.q + ' = ' + nb(s.calc.r) + '. La porte est ouverte !', 'bon'); }
        else { J.message('Oui ! ' + s.calc.q + ' = ' + nb(s.calc.r) + '.', 'bon'); this.nouvelleQuestion(J); }
      } else {
        s.cles.splice(s.cles.indexOf(cle), 1); s.coeurs--; J.coeurs(s.coeurs);
        J.message(nb(cle.v) + ' n’est pas la réponse de ' + s.calc.q + '. Cherche une autre clé.', 'oups');
        if (s.coeurs <= 0) { s.fini = true; setTimeout(() => J.perdu('Tu as trouvé ' + s.trouvees + ' bonnes clés sur 3.'), 600); }
      }
    }
    if (x === n - 1 && y === n - 1) {
      if (s.ouverte) { s.fini = true; setTimeout(() => J.gagne(etoilesCoeurs(s.coeurs), 'Tu as trouvé les 3 bonnes clés et ouvert la porte.'), 300); }
      else J.message('La porte est fermée : il faut d’abord ' + (3 - s.trouvees) + ' bonne(s) clé(s).', 'oups');
    }
  },
  touche(dir, J) { this.s.chemin = []; const [dx, dy] = DIRS[dir]; this.bouger(dx, dy, J); },
  clic(x, y) {
    const s = this.s, cx = Math.floor(x / s.c), cy = Math.floor(y / s.c);
    if (s.fini || cx < 0 || cy < 0 || cx >= s.L.n || cy >= s.L.n) return;
    /* Avoid stepping on another key; if that is impossible, go through anyway. */
    s.chemin = s.L.chemin(s.joueur.x, s.joueur.y, cx, cy, (a, b) => s.cles.some(k => k.x === a && k.y === b)) || s.L.chemin(s.joueur.x, s.joueur.y, cx, cy) || [];
  },
  maj(dt, J) {
    const s = this.s, v = s.vue, j = s.joueur, k = Math.min(1, dt * 14);
    v.x += (j.x - v.x) * k; v.y += (j.y - v.y) * k; s.attente -= dt;
    if (s.chemin.length && s.attente <= 0 && Math.abs(v.x - j.x) < .15 && Math.abs(v.y - j.y) < .15) { const [x, y] = s.chemin.shift(); this.bouger(x - j.x, y - j.y, J); s.attente = .09; }
  },
  dessin(ctx) {
    const s = this.s, c = s.c, n = s.L.n;
    ctx.fillStyle = '#f7f9fc'; ctx.fillRect(0, 0, W, H);
    for (const [x, y] of s.chemin) { ctx.fillStyle = '#dce6f6'; ctx.fillRect(x * c + c * .3, y * c + c * .3, c * .4, c * .4); }
    rond(ctx, (n - 1) * c + c * .15, (n - 1) * c + c * .1, c * .7, c * .8, c * .12); ctx.fillStyle = s.ouverte ? '#3aa36b' : '#9aa7b4'; ctx.fill();
    texte(ctx, s.ouverte ? '🚪' : '🔒', (n - 1) * c + c / 2, (n - 1) * c + c / 2, c * .4, '#fff');
    for (const k of s.cles) {
      ctx.font = '800 ' + Math.round(c * .34) + 'px Arial'; const w = Math.min(c * .94, Math.max(c * .7, ctx.measureText(nb(k.v)).width + 14));
      rond(ctx, k.x * c + (c - w) / 2, k.y * c + c * .2, w, c * .6, 8); ctx.fillStyle = '#fff6d6'; ctx.fill(); ctx.strokeStyle = '#c99a2e'; ctx.lineWidth = 2; ctx.stroke();
      texte(ctx, nb(k.v), k.x * c + c / 2, k.y * c + c / 2 + 1, c * .34, '#5a3d00', 800);
      texte(ctx, '🔑', k.x * c + c * .2, k.y * c + c * .2, c * .26, '#000');
    }
    dessinerMurs(ctx, s.L, c, '#2d5592');
    visage(ctx, s.vue.x * c + c / 2, s.vue.y * c + c / 2, c * .3, '#e0567a');
  }
};

/* ================================================================
   2. FRACTION SNAKE (eat in order)
   ================================================================ */
const F = (a, b) => ({ label: a + '/' + b, v: a / b });
const distincts = (t, k) => { const r = []; for (const e of melange(t)) if (!r.some(x => Math.abs(x.v - e.v) < 1e-9)) { r.push(e); if (r.length === k) break; } return r; };
const fracVariees = () => { const t = []; for (let b = 2; b <= 10; b++) for (let a = 1; a < b; a++) t.push(F(a, b)); return distincts(t, 5); };
const POURC = [[.1, '1/10', '0,1', '10 %'], [.2, '1/5', '0,2', '20 %'], [.25, '1/4', '0,25', '25 %'], [.3, '3/10', '0,3', '30 %'], [.4, '2/5', '0,4', '40 %'], [.5, '1/2', '0,5', '50 %'], [.6, '3/5', '0,6', '60 %'], [.75, '3/4', '0,75', '75 %'], [.8, '4/5', '0,8', '80 %'], [.9, '9/10', '0,9', '90 %']];
const ORDRE = [
  { titre: 'Fractions unitaires', description: '1/2, 1/3, 1/4… de la plus petite à la plus grande', tirer: () => distincts([2, 3, 4, 5, 6, 8, 10].map(b => F(1, b)), 5) },
  { titre: 'Même dénominateur', description: 'Comparer les numérateurs', tirer: () => { const d = pioche([6, 8, 10, 12]); return distincts(Array.from({ length: d - 1 }, (_, i) => F(i + 1, d)), 5); } },
  { titre: 'Même numérateur', description: 'Plus le dénominateur est grand, plus c’est petit', tirer: () => { const n = pioche([2, 3]); return distincts(Array.from({ length: 12 - n }, (_, i) => F(n, n + 1 + i)), 5); } },
  { titre: 'Demis, quarts, huitièmes', description: '1/8, 1/4, 3/8, 1/2…', tirer: () => distincts([F(1, 8), F(1, 4), F(3, 8), F(1, 2), F(5, 8), F(3, 4), F(7, 8)], 5) },
  { titre: 'Fractions variées', description: 'Des dénominateurs différents', tirer: fracVariees },
  { titre: 'Nombres décimaux', description: '0,05 · 0,3 · 0,45…', tirer: () => distincts([.05, .1, .25, .3, .45, .5, .6, .75, .8, .95, .09, .4].map(v => ({ label: nb(v), v })), 5) },
  { titre: 'Fractions, décimaux et %', description: 'Trois façons d’écrire un nombre', tirer: () => distincts(POURC.map(p => ({ label: p[hasard(1, 3)], v: p[0] })), 5) },
  { titre: 'Du plus grand au plus petit', description: 'Fractions variées, à l’envers !', tirer: fracVariees, decroissant: true }
];
const serpfrac = {
  id: 'serpfrac', palier: 'intermediaire', titre: 'Serpent des fractions', icone: '🐍', couleur: '#2a8a6e',
  resume: 'Mange les nombres dans l’ordre, du plus petit au plus grand.',
  touches: 'Flèches · ou clic pour tourner',
  aide: 'Flèches pour tourner, ou clique du côté où le serpent doit aller. Les bords te font passer de l’autre côté.',
  vitesse: true, niveaux: ORDRE, G: 12,
  consigne(nv) { return nv.decroissant ? 'Mange les nombres du PLUS GRAND au plus petit.' : 'Mange les nombres du plus petit au plus grand.'; },
  init(nv, J) {
    const m = this.G >> 1;
    this.s = { nv, corps: [{ x: m, y: m }, { x: m - 1, y: m }, { x: m - 2, y: m }], dir: 'droite', file: [], horloge: 0, items: [], manges: 0, but: 10, coeurs: 3, attente: true, fini: false, prec: null, avance: 1 };
    this.remplir(); J.score('Mangés : 0 / 10'); J.coeurs(3); J.message('Appuie sur une flèche (ou clique) pour démarrer.');
  },
  remplir() {
    const s = this.s, G = this.G, t = s.corps[0];
    s.items = [];
    for (const e of s.nv.tirer()) {
      let x, y, k = 0;
      do { x = hasard(0, G - 1); y = hasard(0, G - 1); } while ((s.corps.some(p => p.x === x && p.y === y) || s.items.some(i => i.x === x && i.y === y) || Math.abs(x - t.x) + Math.abs(y - t.y) < 3) && ++k < 300);
      s.items.push({ ...e, x, y });
    }
  },
  attendu() { const t = this.s.items.slice().sort((a, b) => a.v - b.v); return this.s.nv.decroissant ? t[t.length - 1] : t[0]; },
  oppose: { haut: 'bas', bas: 'haut', gauche: 'droite', droite: 'gauche' },
  touche(dir, J) {
    const s = this.s; if (s.fini) return;
    if (s.attente) { s.attente = false; s.horloge = 0; J.message(''); if (dir === this.oppose[s.dir]) dir = s.dir; }
    const der = s.file.length ? s.file[s.file.length - 1] : s.dir;
    if (dir !== der && dir !== this.oppose[der] && s.file.length < 2) s.file.push(dir);
  },
  clic(x, y, J) {
    const s = this.s, c = W / this.G, t = s.corps[0], dx = x - (t.x + .5) * c, dy = y - (t.y + .5) * c;
    const der = s.file.length ? s.file[s.file.length - 1] : s.dir;
    let dir = (der === 'haut' || der === 'bas') ? (Math.abs(dx) < c / 2 ? der : dx > 0 ? 'droite' : 'gauche') : (Math.abs(dy) < c / 2 ? der : dy > 0 ? 'bas' : 'haut');
    if (s.attente) dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'droite' : 'gauche') : (dy > 0 ? 'bas' : 'haut');
    this.touche(dir, J);
  },
  perte(J, msg) { const s = this.s; s.coeurs--; J.coeurs(s.coeurs); J.message(msg, 'oups'); if (s.coeurs <= 0) { s.fini = true; setTimeout(() => J.perdu('Tu as mangé ' + s.manges + ' nombres dans le bon ordre sur ' + s.but + '.'), 600); } },
  tick(J) {
    const s = this.s, G = this.G;
    if (s.file.length) s.dir = s.file.shift();
    const [dx, dy] = DIRS[s.dir], t = s.corps[0], nt = { x: (t.x + dx + G) % G, y: (t.y + dy + G) % G };
    s.prec = s.corps.map(p => ({ ...p }));
    const item = s.items.find(i => i.x === nt.x && i.y === nt.y), bon = item && item === this.attendu();
    if ((bon ? s.corps : s.corps.slice(0, -1)).some(p => p.x === nt.x && p.y === nt.y)) {
      this.perte(J, 'Le serpent s’est touché lui-même. Il redevient petit.');
      const m = G >> 1; s.corps = [{ x: m, y: m }, { x: m - 1, y: m }, { x: m - 2, y: m }]; s.dir = 'droite'; s.file = []; s.prec = null;
      for (const i of s.items) if (s.corps.some(p => p.x === i.x && p.y === i.y)) { i.x = (i.x + 3) % G; }
      if (!s.fini) { s.attente = true; J.message('Le serpent s’est touché. Appuie sur une flèche pour repartir.', 'oups'); }
      return;
    }
    s.corps.unshift(nt); if (!bon) s.corps.pop();
    if (item) {
      if (bon) {
        s.items.splice(s.items.indexOf(item), 1); s.manges++; J.score('Mangés : ' + s.manges + ' / ' + s.but);
        J.message('Oui ! ' + item.label + (s.items.length ? (s.nv.decroissant ? ' était le plus grand.' : ' était le plus petit.') : ' : série terminée !'), 'bon');
        if (s.manges >= s.but) { s.fini = true; setTimeout(() => J.gagne(etoilesCoeurs(s.coeurs), 'Tu as mangé ' + s.but + ' nombres dans le bon ordre.'), 300); return; }
        if (!s.items.length) this.remplir();
      } else this.perte(J, s.nv.decroissant ? item.label + ' n’est pas le plus grand : il reste un nombre plus grand.' : item.label + ' n’est pas le plus petit : il reste un nombre plus petit.');
    }
  },
  maj(dt, J) {
    const s = this.s; if (s.attente || s.fini) return;
    const periode = { lent: .36, moyen: .27, rapide: .19 }[J.vitesse()];
    s.horloge += dt;
    while (s.horloge >= periode && !s.attente && !s.fini) { s.horloge -= periode; this.tick(J); }
    s.avance = Math.min(1, s.horloge / periode);
  },
  dessin(ctx) {
    const s = this.s, G = this.G, c = W / G;
    for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) { ctx.fillStyle = (x + y) % 2 ? '#eaf4f0' : '#f6fbf8'; ctx.fillRect(x * c, y * c, c, c); }
    for (const i of s.items) {
      rond(ctx, i.x * c + 2, i.y * c + 4, c - 4, c - 8, 10); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = '#8fa3b5'; ctx.lineWidth = 2; ctx.stroke();
      texte(ctx, i.label, i.x * c + c / 2, i.y * c + c / 2 + 1, i.label.length > 3 ? c * .3 : c * .38, '#16324f', 800);
    }
    const a = s.avance;
    const pos = s.corps.map((p, k) => { const q = s.prec && s.prec[k]; if (!q || s.attente || Math.abs(p.x - q.x) > 1 || Math.abs(p.y - q.y) > 1) return p; return { x: q.x + (p.x - q.x) * a, y: q.y + (p.y - q.y) * a }; });
    for (let k = pos.length - 1; k >= 0; k--) { const p = pos[k]; ctx.beginPath(); ctx.arc(p.x * c + c / 2, p.y * c + c / 2, k ? c * .38 : c * .44, 0, 7); ctx.fillStyle = k ? (k % 2 ? '#4cb894' : '#40a985') : '#2a8a6e'; ctx.fill(); }
    const h = pos[0], [dx, dy] = DIRS[s.dir], hx = h.x * c + c / 2, hy = h.y * c + c / 2;
    for (const g of [-1, 1]) { const ex = hx + dx * c * .15 - dy * g * c * .17, ey = hy + dy * c * .15 + dx * g * c * .17; ctx.beginPath(); ctx.arc(ex, ey, c * .09, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.beginPath(); ctx.arc(ex + dx * 2, ey + dy * 2, c * .045, 0, 7); ctx.fillStyle = '#16324f'; ctx.fill(); }
    if (s.attente) { ctx.fillStyle = '#ffffffc0'; rond(ctx, 90, H / 2 - 34, W - 180, 68, 14); ctx.fill(); texte(ctx, 'Appuie sur une flèche pour partir', W / 2, H / 2, 24, '#16324f'); }
  }
};

/* ================================================================
   3. NUMBER BRIDGE (slide a plank into the gap)
   ================================================================ */
const EQ = {
  plus() { const a = hasard(2, 9), x = hasard(2, 12); return { q: '? + ' + a + ' = ' + (x + a), r: x, x: [x + 2 * a] }; },
  moins() { const a = hasard(9, 20), x = hasard(2, a - 2); return { q: a + ' ' + moins + ' ? = ' + (a - x), r: x, x: [2 * a - x] }; },
  fois() { const a = hasard(2, 9), x = hasard(2, 10); return { q: a + ' ' + fois + ' ? = ' + a * x, r: x, x: [a * x - a] }; },
  divise() { const b = hasard(2, 9), q = hasard(2, 10); return { q: '? ' + divise + ' ' + b + ' = ' + q, r: b * q, x: [b + q, q] }; },
  deux() { const a = hasard(2, 6), x = hasard(2, 9), b = hasard(1, 9); return { q: a + ' ' + fois + ' ? + ' + b + ' = ' + (a * x + b), r: x, x: [x + 1, a * x] }; },
  frac() { const d = pioche([2, 3, 4, 5]), n = hasard(1, d - 1), k = hasard(2, 6); return Math.random() < .5 ? { q: '?/' + d * k + ' = ' + n + '/' + d, r: n * k, x: [n + k, n * k + 1] } : { q: n + '/' + d + ' = ' + n * k + '/?', r: d * k, x: [d + k, d * k + 1] }; },
  negatif() { let x; do { x = hasard(-9, 9); } while (!x); const a = hasard(2, 9); return Math.random() < .5 ? { q: '? + ' + a + ' = ' + nb(x + a), r: x, x: [-x, x + 2 * a] } : { q: a + ' ' + moins + ' ? = ' + nb(a - x), r: x, x: [-x] }; }
};
const PONT = [
  { titre: 'Le nombre manquant (+)', description: '? + 7 = 15', eq: ['plus'] },
  { titre: 'Le nombre manquant (−)', description: '15 − ? = 8', eq: ['moins'] },
  { titre: 'Le facteur manquant', description: '4 × ? = 36', eq: ['fois'] },
  { titre: 'La division à l’envers', description: '? ÷ 6 = 7', eq: ['divise'] },
  { titre: 'Les quatre opérations', description: 'Un peu de tout', eq: ['plus', 'moins', 'fois', 'divise'] },
  { titre: 'Deux opérations', description: '2 × ? + 3 = 11', eq: ['deux'] },
  { titre: 'Fractions équivalentes', description: '?/12 = 3/4', eq: ['frac'] },
  { titre: 'Nombres négatifs', description: '? + 5 = 2', eq: ['negatif'] }
];
const TROUS = 4, PONTS = 2, PX = 70, PY = 262, LT = (W - 2 * PX) / TROUS;
const pont = {
  id: 'pont', palier: 'intermediaire', titre: 'Pont des nombres', icone: '🌉', couleur: '#b86b2b',
  resume: 'Glisse la bonne planche dans le trou du pont pour faire traverser ton personnage.',
  touches: 'Souris (glisser ou cliquer) · ou ◀ ▶ puis ▲',
  aide: 'Avec la souris : glisse une planche dans le trou, ou clique simplement dessus. Au clavier : ◀ ▶ pour choisir, ▲ ou Entrée pour poser.',
  pad: 'hgd', niveaux: PONT,
  consigne() { return 'Trouve le nombre qui manque pour réparer le pont.'; },
  init(nv, J) {
    this.s = { nv, pont: 1, trou: 0, poses: [], coeurs: 3, fini: false, choix: 0, tire: null, marche: -1, perso: PX - 40, erreurs: 0 };
    J.coeurs(3); this.question(J); J.message('Glisse ou clique sur la bonne planche.');
  },
  question(J) {
    const s = this.s; s.eq = EQ[pioche(s.nv.eq)]();
    const vals = melange([s.eq.r, ...leurres(s.eq.r, s.eq.x)]);
    s.planches = vals.map((v, i) => ({ v, x0: 28 + i * 130, y0: 452, x: 28 + i * 130, y: 452 }));
    s.choix = 0;
    J.score('Pont ' + s.pont + ' / ' + PONTS + ' · trou ' + (s.trou + 1) + ' / ' + TROUS);
  },
  planche(x, y) { return this.s.planches.find(p => x >= p.x && x <= p.x + 110 && y >= p.y && y <= p.y + 56); },
  poser(p, J) {
    const s = this.s; if (s.fini || s.marche >= 0) return;
    if (p.v === s.eq.r) {
      s.poses.push(p.v); s.trou++;
      J.message('Oui ! ' + s.eq.q.replace('?', nb(p.v)) + '.', 'bon');
      if (s.trou >= TROUS) { s.planches = []; s.marche = 0; }
      else this.question(J);
    } else {
      p.x = p.x0; p.y = p.y0; s.coeurs--; s.erreurs++; J.coeurs(s.coeurs);
      J.message(nb(p.v) + ' ne va pas : ' + s.eq.q.replace('?', nb(p.v)) + ' est faux. Essaie une autre planche.', 'oups');
      if (s.coeurs <= 0) { s.fini = true; setTimeout(() => J.perdu('Tu as posé ' + ((s.pont - 1) * TROUS + s.trou) + ' planches sur ' + TROUS * PONTS + '.'), 600); }
    }
  },
  clic(x, y) { const s = this.s, p = this.planche(x, y); if (p && s.marche < 0) { s.tire = { p, dx: x - p.x, dy: y - p.y, x0: x, y0: y, bouge: false }; s.choix = s.planches.indexOf(p); } },
  glisse(x, y) { const t = this.s.tire; if (!t) return; if (Math.abs(x - t.x0) + Math.abs(y - t.y0) > 8) t.bouge = true; t.p.x = x - t.dx; t.p.y = y - t.dy; },
  relache(x, y, J) {
    const s = this.s, t = s.tire; if (!t) return; s.tire = null;
    const tx = PX + s.trou * LT, dansTrou = x > tx - 30 && x < tx + LT + 30 && y > PY - 90 && y < PY + 90;
    if (!t.bouge || dansTrou) this.poser(t.p, J); else { t.p.x = t.p.x0; t.p.y = t.p.y0; }
  },
  touche(dir, J) {
    const s = this.s; if (!s.planches.length) return;
    if (dir === 'gauche') s.choix = (s.choix + s.planches.length - 1) % s.planches.length;
    else if (dir === 'droite') s.choix = (s.choix + 1) % s.planches.length;
    else if (dir === 'haut') this.poser(s.planches[s.choix], J);
  },
  clavier(k, J) { if (k === 'Enter') { const s = this.s; if (s.planches.length) this.poser(s.planches[s.choix], J); return true; } return false; },
  maj(dt, J) {
    const s = this.s; if (s.marche < 0 || s.fini) return;
    s.marche += dt; s.perso = PX - 40 + (W - 2 * PX + 80) * Math.min(1, s.marche / 2.2);
    if (s.marche >= 2.6) {
      if (s.pont >= PONTS) { s.fini = true; J.gagne(s.erreurs === 0 ? 3 : s.erreurs === 1 ? 2 : 1, 'Ton personnage a traversé les ' + PONTS + ' ponts.'); return; }
      s.pont++; s.trou = 0; s.poses = []; s.marche = -1; s.perso = PX - 40; J.message('Nouveau pont !'); this.question(J);
    }
  },
  dessin(ctx, t) {
    const s = this.s;
    ctx.fillStyle = '#eaf4fb'; ctx.fillRect(0, 0, W, H);
    /* Equation */
    if (s.eq && s.marche < 0) {
      rond(ctx, 40, 22, W - 80, 86, 18); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = '#b86b2b'; ctx.lineWidth = 3; ctx.stroke();
      texte(ctx, s.eq.q, W / 2, 66, 40, '#16324f', 800);
    } else if (s.marche >= 0) texte(ctx, 'Le pont est réparé ! 🎉', W / 2, 66, 32, '#1c6140', 800);
    /* Banks and river */
    ctx.fillStyle = '#7cc4e8'; ctx.fillRect(0, PY + 30, W, 120);
    ctx.fillStyle = '#5fb1da'; for (let k = 0; k < 6; k++) { ctx.fillRect((k * 110 + t * 20) % (W + 60) - 60, PY + 70 + (k % 3) * 22, 50, 4); }
    ctx.fillStyle = '#7dbb6a'; ctx.fillRect(0, PY, PX, 150); ctx.fillRect(W - PX, PY, PX, 150);
    /* Bridge */
    for (let k = 0; k < TROUS; k++) {
      const x = PX + k * LT;
      if (k < s.trou || s.marche >= 0) { rond(ctx, x + 2, PY, LT - 4, 30, 6); ctx.fillStyle = '#c98b4b'; ctx.fill(); texte(ctx, nb(s.poses[k]), x + LT / 2, PY + 15, 20, '#4a2a0a', 800); }
      else if (k === s.trou) { ctx.setLineDash([8, 6]); ctx.strokeStyle = '#b86b2b'; ctx.lineWidth = 3; rond(ctx, x + 4, PY - 4, LT - 8, 38, 6); ctx.stroke(); ctx.setLineDash([]); texte(ctx, '?', x + LT / 2, PY + 15, 26, '#b86b2b', 800); }
    }
    ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(PX, PY - 30); ctx.lineTo(W - PX, PY - 30); ctx.stroke();
    for (let k = 0; k <= TROUS; k++) { ctx.beginPath(); ctx.moveTo(PX + k * LT, PY - 30); ctx.lineTo(PX + k * LT, PY); ctx.stroke(); }
    visage(ctx, s.perso, PY - 24 - (s.marche >= 0 ? Math.abs(Math.sin(t * 9)) * 6 : 0), 20, '#e0567a');
    /* Planks to place */
    if (s.planches.length) {
      texte(ctx, 'Les planches', W / 2, 430, 17, '#4a6378', 700);
      s.planches.forEach((p, i) => {
        if (s.tire && s.tire.p === p) return;
        this.dessinPlanche(ctx, p, i === s.choix);
      });
      if (s.tire) this.dessinPlanche(ctx, s.tire.p, true);
    }
  },
  dessinPlanche(ctx, p, choisie) {
    rond(ctx, p.x, p.y, 110, 56, 10); ctx.fillStyle = '#d9a066'; ctx.fill();
    ctx.strokeStyle = choisie ? '#16324f' : '#a46a2f'; ctx.lineWidth = choisie ? 4 : 2; ctx.stroke();
    texte(ctx, nb(p.v), p.x + 55, p.y + 29, 28, '#3d2205', 800);
  }
};

/* ================================================================
   4. COORDINATE RACE (Cartesian plane from −5 to 5)
   ================================================================ */
const U = 48, OX = W / 2, OY = H / 2;
const px = x => OX + x * U, py = y => OY - y * U;
const pt = (x, y) => '(' + nb(x) + ', ' + nb(y) + ')';
const FUSEE = [
  { titre: 'Premier quart, cible visible', description: 'x et y positifs · l’étoile montre le point', mode: 'q1', voir: true },
  { titre: 'Premier quart, sans aide', description: 'Seulement les coordonnées', mode: 'q1' },
  { titre: 'Tout le plan, cible visible', description: 'Les nombres négatifs : le signe donne le sens', mode: 'tout', voir: true },
  { titre: 'Tout le plan, sans aide', description: 'Seulement les coordonnées', mode: 'tout' },
  { titre: 'Dessine une forme', description: 'Relie les points : quelle forme apparaît ?', mode: 'forme' },
  { titre: 'Évite les astéroïdes', description: 'Contourne les obstacles', mode: 'asteroides' },
  { titre: 'Trouve y avec une règle', description: 'x = 3 et y = x − 5', mode: 'regle' },
  { titre: 'Les translations', description: 'Pars d’un point et déplace-toi', mode: 'translation' }
];
const FORMES = [
  { nom: 'un triangle', pts: [[-3, -2], [3, -2], [0, 3]] },
  { nom: 'un carré', pts: [[-2, -2], [2, -2], [2, 2], [-2, 2]] },
  { nom: 'un rectangle', pts: [[-4, -1], [3, -1], [3, 3], [-4, 3]] },
  { nom: 'un losange', pts: [[0, -4], [3, 0], [0, 4], [-3, 0]] },
  { nom: 'un parallélogramme', pts: [[-4, -2], [2, -2], [4, 2], [-2, 2]] },
  { nom: 'une flèche', pts: [[-4, -1], [1, -1], [1, -3], [4, 0], [1, 3], [1, 1], [-4, 1]] }
];
const fusee = {
  id: 'fusee', palier: 'intermediaire', titre: 'Course aux coordonnées', icone: '🚀', couleur: '#2c62ab',
  resume: 'Pilote la fusée jusqu’au point demandé sur le plan cartésien.',
  touches: 'Flèches puis Entrée · ou clic sur un point',
  aide: 'Flèches pour avancer d’un pas, puis « Atterrir » (ou Entrée). Avec la souris : clique sur un point et la fusée y atterrit.',
  niveaux: FUSEE,
  boutons: [{ id: 'atterrir', texte: '🛬 Atterrir', principal: true }, { id: 'centre', texte: '⟲ Retour à (0, 0)' }],
  consigne() { return ''; },
  init(nv, J) {
    this.s = { nv, f: { x: 0, y: 0 }, vue: { x: 0, y: 0 }, chemin: [], attente: 0, rang: 0, but: 6, coeurs: 3, fini: false, traces: [], asteroides: [], cible: null, pas: 0 };
    if (nv.mode === 'forme') { this.s.forme = pioche(FORMES); this.s.but = this.s.forme.pts.length; }
    if (nv.mode === 'asteroides') { const a = []; while (a.length < 12) { const x = hasard(-5, 5), y = hasard(-5, 5); if ((x || y) && !a.some(p => p.x === x && p.y === y)) a.push({ x, y }); } this.s.asteroides = a; }
    J.coeurs(3); this.suivante(J);
    J.message('Utilise les flèches, puis « Atterrir ». Ou clique sur le point.');
  },
  libre(x, y) { return x >= -5 && x <= 5 && y >= -5 && y <= 5 && !this.s.asteroides.some(a => a.x === x && a.y === y); },
  suivante(J) {
    const s = this.s, m = s.nv.mode; let x, y, texteC;
    const auHasard = (q1) => { do { x = q1 ? hasard(1, 5) : hasard(-5, 5); y = q1 ? hasard(1, 5) : hasard(-5, 5); } while (!this.libre(x, y) || (x === s.f.x && y === s.f.y) || (!q1 && x * y === 0 && Math.random() < .7)); };
    if (m === 'q1') auHasard(true);
    else if (m === 'tout' || m === 'asteroides') auHasard(false);
    if (m === 'forme') [x, y] = s.forme.pts[s.rang];
    if (m === 'regle') {
      const R = [['x + 2', v => v + 2], ['x ' + moins + ' 3', v => v - 3], ['2x', v => 2 * v], [moins + 'x', v => -v], ['x ' + moins + ' 5', v => v - 5], ['2x ' + moins + ' 1', v => 2 * v - 1], ['x + 4', v => v + 4]];
      let r; do { r = pioche(R); x = hasard(-5, 5); y = r[1](x); } while (y < -5 || y > 5 || (x === s.f.x && y === s.f.y));
      texteC = 'Va au point où x = ' + nb(x) + ' et y = ' + r[0];
    }
    if (m === 'translation') {
      let sx, sy, dx, dy;
      do { sx = hasard(-4, 4); sy = hasard(-4, 4); dx = hasard(-5, 5); dy = hasard(-5, 5); x = sx + dx; y = sy + dy; } while (!dx || !dy || x < -5 || x > 5 || y < -5 || y > 5);
      s.f = { x: sx, y: sy }; s.vue = { x: sx, y: sy }; s.depart = { x: sx, y: sy };
      texteC = 'Tu es à ' + pt(sx, sy) + '. Fais la translation (' + (dx > 0 ? '+' : '') + nb(dx) + ', ' + (dy > 0 ? '+' : '') + nb(dy) + ')';
    }
    s.cible = { x, y };
    if (!texteC) texteC = (m === 'forme' ? 'Point ' + (s.rang + 1) + ' sur ' + s.but + ' : va à ' : 'Va au point ') + pt(x, y);
    J.consigne(texteC); J.score('Points : ' + s.rang + ' / ' + s.but);
  },
  atterrir(J) {
    const s = this.s, f = s.f, c = s.cible; if (s.fini) return;
    if (f.x === c.x && f.y === c.y) {
      s.traces.push({ x: c.x, y: c.y }); s.rang++;
      J.message('Bravo ! Tu es bien à ' + pt(c.x, c.y) + '.', 'bon');
      if (s.rang >= s.but) { s.fini = true; setTimeout(() => J.gagne(etoilesCoeurs(s.coeurs), s.nv.mode === 'forme' ? 'Tu as dessiné ' + s.forme.nom + ' !' : 'Tu as atteint les ' + s.but + ' points.'), s.nv.mode === 'forme' ? 1200 : 400); return; }
      this.suivante(J);
    } else {
      s.coeurs--; J.coeurs(s.coeurs);
      const conseil = (v, cv, axe) => v === cv ? axe + ' est bon' : Math.abs(v) === Math.abs(cv) ? axe + ' : bon nombre de pas, mais pas le bon sens' : axe + ' doit être ' + nb(cv);
      let m = 'Tu es à ' + pt(f.x, f.y) + '. ' + conseil(f.x, c.x, 'x') + ', ' + conseil(f.y, c.y, 'y') + '.';
      if (s.nv.mode === 'regle' || s.nv.mode === 'translation') m = 'Tu es à ' + pt(f.x, f.y) + ' : ce n’est pas le bon point. Recalcule et réessaie.';
      J.message(m, 'oups');
      if (s.coeurs <= 0) { s.fini = true; setTimeout(() => J.perdu('Tu as atteint ' + s.rang + ' points sur ' + s.but + '.'), 700); }
    }
  },
  touche(dir, J) {
    const s = this.s; if (s.fini) return; s.chemin = [];
    const [dx, dy] = DIRS[dir], x = s.f.x + dx, y = s.f.y - dy;
    if (!this.libre(x, y)) { J.message(x < -5 || x > 5 || y < -5 || y > 5 ? 'Bord du plan.' : 'Un astéroïde bloque le passage.', 'oups'); return; }
    s.f = { x, y }; s.pas++;
  },
  clavier(k, J) { if (k === 'Enter') { this.atterrir(J); return true; } return false; },
  action(id, J) { const s = this.s; if (id === 'atterrir') this.atterrir(J); if (id === 'centre' && !s.fini) { s.chemin = []; s.f = s.depart ? { ...s.depart } : { x: 0, y: 0 }; J.message(s.depart ? 'Retour au point de départ.' : 'Retour à l’origine (0, 0).'); } },
  clic(X, Y) {
    const s = this.s; if (s.fini) return;
    const x = Math.round((X - OX) / U), y = Math.round((OY - Y) / U);
    if (Math.abs(X - px(x)) > U * .4 || Math.abs(Y - py(y)) > U * .4 || !this.libre(x, y)) return;
    /* Staircase path, going around the asteroids. */
    const p = new Map([[s.f.x + ',' + s.f.y, null]]), f = [[s.f.x, s.f.y]];
    while (f.length) { const [a, b] = f.shift(); if (a === x && b === y) break; for (const [dx, dy] of V4) { const c = a + dx, d = b + dy, k = c + ',' + d; if (!p.has(k) && this.libre(c, d)) { p.set(k, [a, b]); f.push([c, d]); } } }
    if (!p.has(x + ',' + y)) return;
    const ch = []; let c = [x, y]; while (c && !(c[0] === s.f.x && c[1] === s.f.y)) { ch.unshift(c); c = p.get(c[0] + ',' + c[1]); }
    s.chemin = ch; s.auto = true;
  },
  maj(dt, J) {
    const s = this.s, v = s.vue, k = Math.min(1, dt * 12);
    v.x += (s.f.x - v.x) * k; v.y += (s.f.y - v.y) * k; s.attente -= dt;
    if (s.chemin.length && s.attente <= 0 && Math.abs(v.x - s.f.x) < .12 && Math.abs(v.y - s.f.y) < .12) {
      const [x, y] = s.chemin.shift(); s.f = { x, y }; s.pas++; s.attente = .06;
      if (!s.chemin.length && s.auto) { s.auto = false; s.atterrirBientot = .25; }
    }
    if (s.atterrirBientot !== undefined) { s.atterrirBientot -= dt; if (s.atterrirBientot <= 0) { s.atterrirBientot = undefined; this.atterrir(J); } }
  },
  dessin(ctx) {
    const s = this.s;
    ctx.fillStyle = '#f5f8fd'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#d5e0ee'; ctx.lineWidth = 1;
    for (let k = -5; k <= 5; k++) { ctx.beginPath(); ctx.moveTo(px(k), py(5.4)); ctx.lineTo(px(k), py(-5.4)); ctx.moveTo(px(-5.4), py(k)); ctx.lineTo(px(5.4), py(k)); ctx.stroke(); }
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#c0392b'; ctx.beginPath(); ctx.moveTo(px(-5.6), OY); ctx.lineTo(px(5.6), OY); ctx.stroke();
    ctx.strokeStyle = '#2c62ab'; ctx.beginPath(); ctx.moveTo(OX, py(-5.6)); ctx.lineTo(OX, py(5.6)); ctx.stroke();
    texte(ctx, 'x', px(5.75), OY - 14, 18, '#c0392b'); texte(ctx, 'y', OX + 14, py(5.75), 18, '#2c62ab');
    for (let k = -5; k <= 5; k++) if (k) { texte(ctx, nb(k), px(k), OY + 15, 13, '#c0392b', 700); texte(ctx, nb(k), OX - 15, py(k), 13, '#2c62ab', 700); }
    texte(ctx, '0', OX - 11, OY + 13, 13, '#16324f', 700);
    for (const a of s.asteroides) { ctx.beginPath(); ctx.arc(px(a.x), py(a.y), 15, 0, 7); ctx.fillStyle = '#8d8478'; ctx.fill(); ctx.beginPath(); ctx.arc(px(a.x) - 4, py(a.y) - 3, 4, 0, 7); ctx.fillStyle = '#6f675d'; ctx.fill(); }
    /* Traces (and drawn shape) */
    if (s.traces.length) {
      ctx.strokeStyle = '#6a4cad'; ctx.lineWidth = 3;
      if (s.nv.mode === 'forme' && s.traces.length > 1) { ctx.beginPath(); s.traces.forEach((p, i) => i ? ctx.lineTo(px(p.x), py(p.y)) : ctx.moveTo(px(p.x), py(p.y))); if (s.traces.length === s.but) ctx.closePath(); ctx.stroke(); }
      for (const p of s.traces) { ctx.beginPath(); ctx.arc(px(p.x), py(p.y), 6, 0, 7); ctx.fillStyle = '#6a4cad'; ctx.fill(); }
    }
    if (s.depart && s.nv.mode === 'translation') { ctx.beginPath(); ctx.arc(px(s.depart.x), py(s.depart.y), 8, 0, 7); ctx.strokeStyle = '#16324f'; ctx.lineWidth = 2; ctx.stroke(); }
    if (s.nv.voir && s.cible && !s.fini) { etoile(ctx, px(s.cible.x), py(s.cible.y), 14); texte(ctx, pt(s.cible.x, s.cible.y), px(s.cible.x), py(s.cible.y) - 24, 15, '#7a5300', 800); }
    texte(ctx, '🚀', px(s.vue.x), py(s.vue.y), 30, '#000');
    /* Current position */
    rond(ctx, 8, 8, 132, 34, 10); ctx.fillStyle = '#ffffffe0'; ctx.fill();
    texte(ctx, 'Fusée ' + pt(s.f.x, s.f.y), 74, 26, 16, '#16324f', 800);
  }
};

/* ================================================================
   5. PUSH THE CRATES (builder shared with the expert level)
   ================================================================ */
function fabriqueCaisses(def) {
  return {
    ...def,
    touches: 'Flèches · ou clic',
    aide: 'Flèches pour marcher et pousser. Avec la souris : clique sur une case pour y aller, ou sur une caisse à côté de toi pour la pousser. ↶ Annuler (ou U) si tu te trompes.',
    boutons: [{ id: 'annuler', texte: '↶ Annuler' }, { id: 'recommencer', texte: '↺ Recommencer' }],
    consigne() { return 'Pousse chaque caisse 📦 sur une cible ◎. Tu peux pousser, mais pas tirer.'; },
    init(nv, J) {
      const murs = new Set(), cibles = new Set(), caisses = []; let joueur;
      nv.carte.forEach((ligne, y) => [...ligne].forEach((ch, x) => {
        const k = x + ',' + y;
        if (ch === '#') murs.add(k);
        if (ch === '.' || ch === '*' || ch === '+') cibles.add(k);
        if (ch === '$' || ch === '*') caisses.push({ x, y });
        if (ch === '@' || ch === '+') joueur = { x, y };
      }));
      const lignes = nv.carte.length, cols = Math.max(...nv.carte.map(l => l.length)), c = Math.floor(Math.min(W / cols, H / lignes));
      this.s = { nv, murs, cibles, caisses, joueur, vue: { ...joueur }, histoire: [], pas: 0, poussees: 0, c, ox: (W - cols * c) / 2, oy: (H - lignes * c) / 2, chemin: [], attente: 0, fini: false, cols, lignes };
      J.coeurs(''); this.maj_score(J); J.message('Pousse les caisses sur les cibles.');
    },
    maj_score(J) { const s = this.s, n = s.caisses.filter(b => s.cibles.has(b.x + ',' + b.y)).length; J.score('Caisses : ' + n + ' / ' + s.caisses.length + ' · Poussées : ' + s.poussees); },
    caisse(x, y) { return this.s.caisses.find(b => b.x === x && b.y === y); },
    bloque(x, y) { return this.s.murs.has(x + ',' + y); },
    bouger(dx, dy, J) {
      const s = this.s, j = s.joueur, x = j.x + dx, y = j.y + dy;
      if (s.fini || this.bloque(x, y)) return false;
      const b = this.caisse(x, y);
      if (b) {
        if (this.bloque(x + dx, y + dy) || this.caisse(x + dx, y + dy)) { J.message('Cette caisse ne peut pas avancer par là.', 'oups'); return false; }
        s.histoire.push({ j: { ...j }, c: s.caisses.map(k => ({ ...k })), p: s.poussees, n: s.pas });
        b.x += dx; b.y += dy; s.poussees++;
      } else s.histoire.push({ j: { ...j }, c: s.caisses.map(k => ({ ...k })), p: s.poussees, n: s.pas });
      j.x = x; j.y = y; s.pas++; this.maj_score(J);
      if (b) {
        if (s.caisses.every(k => s.cibles.has(k.x + ',' + k.y))) {
          s.fini = true; s.chemin = [];
          const o = s.nv.poussees, e = s.poussees <= o + 2 ? 3 : s.poussees <= o * 1.6 + 2 ? 2 : 1;
          setTimeout(() => J.gagne(e, 'Toutes les caisses sont rangées en ' + s.poussees + ' poussées (le minimum est ' + o + ').'), 400);
        } else if (!s.cibles.has(b.x + ',' + b.y) && this.coin(b.x, b.y)) J.message('Oups : cette caisse est coincée dans un coin. Utilise ↶ Annuler.', 'oups');
        else J.message(s.cibles.has(b.x + ',' + b.y) ? 'Une caisse est sur une cible !' : '', s.cibles.has(b.x + ',' + b.y) ? 'bon' : '');
      }
      return true;
    },
    coin(x, y) { const m = (a, b) => this.bloque(a, b); return (m(x - 1, y) || m(x + 1, y)) && (m(x, y - 1) || m(x, y + 1)); },
    touche(dir, J) { this.s.chemin = []; const [dx, dy] = DIRS[dir]; this.bouger(dx, dy, J); },
    clavier(k, J) {
      if (k === 'u' || k === 'U' || k === 'Backspace') { this.action('annuler', J); return true; }
      if (k === 'r' || k === 'R') { this.action('recommencer', J); return true; }
      return false;
    },
    action(id, J) {
      const s = this.s; if (s.fini) return; s.chemin = [];
      if (id === 'annuler') { const h = s.histoire.pop(); if (!h) { J.message('Rien à annuler.'); return; } s.joueur = h.j; s.caisses = h.c; s.poussees = h.p; s.pas = h.n; s.vue = { ...h.j }; this.maj_score(J); J.message('Dernier pas annulé.'); }
      if (id === 'recommencer') { this.init(s.nv, J); J.message('On recommence.'); }
    },
    clic(X, Y, J) {
      const s = this.s; if (s.fini) return;
      const x = Math.floor((X - s.ox) / s.c), y = Math.floor((Y - s.oy) / s.c), j = s.joueur;
      if (this.bloque(x, y)) return;
      if (Math.abs(x - j.x) + Math.abs(y - j.y) === 1) { s.chemin = []; this.bouger(x - j.x, y - j.y, J); return; }
      if (this.caisse(x, y)) { J.message('Place-toi juste à côté de la caisse pour la pousser.'); return; }
      const p = new Map([[j.x + ',' + j.y, null]]), f = [[j.x, j.y]];
      while (f.length) { const [a, b] = f.shift(); if (a === x && b === y) break; for (const [dx, dy] of V4) { const c = a + dx, d = b + dy, k = c + ',' + d; if (!p.has(k) && c >= 0 && d >= 0 && c < s.cols && d < s.lignes && !this.bloque(c, d) && !this.caisse(c, d)) { p.set(k, [a, b]); f.push([c, d]); } } }
      if (!p.has(x + ',' + y)) return;
      const ch = []; let c = [x, y]; while (c && !(c[0] === j.x && c[1] === j.y)) { ch.unshift(c); c = p.get(c[0] + ',' + c[1]); }
      s.chemin = ch;
    },
    maj(dt, J) {
      const s = this.s, v = s.vue, k = Math.min(1, dt * 16);
      v.x += (s.joueur.x - v.x) * k; v.y += (s.joueur.y - v.y) * k; s.attente -= dt;
      if (s.chemin.length && s.attente <= 0 && Math.abs(v.x - s.joueur.x) < .15 && Math.abs(v.y - s.joueur.y) < .15) { const [x, y] = s.chemin.shift(); this.bouger(x - s.joueur.x, y - s.joueur.y, J); s.attente = .07; }
    },
    dessin(ctx) {
      const s = this.s, c = s.c;
      ctx.fillStyle = '#eef1f4'; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.translate(s.ox, s.oy);
      s.nv.carte.forEach((l, y) => [...l].forEach((ch, x) => {
        if (ch === '#') { rond(ctx, x * c + 1, y * c + 1, c - 2, c - 2, 6); ctx.fillStyle = '#4b5d73'; ctx.fill(); }
        else { ctx.fillStyle = '#f7efe1'; ctx.fillRect(x * c, y * c, c, c); }
      }));
      for (const k of s.cibles) { const [x, y] = k.split(',').map(Number); ctx.beginPath(); ctx.arc(x * c + c / 2, y * c + c / 2, c * .26, 0, 7); ctx.strokeStyle = '#d4553a'; ctx.lineWidth = 3; ctx.stroke(); ctx.beginPath(); ctx.arc(x * c + c / 2, y * c + c / 2, c * .09, 0, 7); ctx.fillStyle = '#d4553a'; ctx.fill(); }
      for (const [x, y] of s.chemin) { ctx.fillStyle = '#d9e4f2'; ctx.fillRect(x * c + c * .38, y * c + c * .38, c * .24, c * .24); }
      for (const b of s.caisses) {
        const ok = s.cibles.has(b.x + ',' + b.y);
        rond(ctx, b.x * c + c * .1, b.y * c + c * .1, c * .8, c * .8, 6); ctx.fillStyle = ok ? '#4caf7a' : '#c98b4b'; ctx.fill();
        ctx.strokeStyle = ok ? '#2d7a52' : '#8a5a2b'; ctx.lineWidth = 3; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(b.x * c + c * .2, b.y * c + c * .2); ctx.lineTo(b.x * c + c * .8, b.y * c + c * .8); ctx.moveTo(b.x * c + c * .8, b.y * c + c * .2); ctx.lineTo(b.x * c + c * .2, b.y * c + c * .8); ctx.stroke();
        if (ok) texte(ctx, '✓', b.x * c + c / 2, b.y * c + c / 2, c * .4, '#fff', 800);
      }
      visage(ctx, s.vue.x * c + c / 2, s.vue.y * c + c / 2, c * .32, '#e0567a');
      ctx.restore();
    }
  };
}
O.fabriqueCaisses = fabriqueCaisses;
const NIV_CAISSES = [
  { titre: 'Une caisse', description: 'Pour apprendre à pousser', poussees: 5, carte: ['######', '##   #', '#@$  #', '##   #', '#.   #', '######'] },
  { titre: 'Contourner', description: 'Une caisse, un mur au milieu', poussees: 6, carte: ['#######', '#   . #', '#   #@#', '#   $ #', '#  # ##', '#######'] },
  { titre: 'Deux caisses', description: 'Dans le bon ordre', poussees: 8, carte: ['#######', '# #   #', '#  #$ #', '#+$   #', '# #.  #', '#######'] },
  { titre: 'Le couloir', description: 'Deux caisses, plus de place', poussees: 10, carte: ['#######', '#.    #', '## #  #', '###   #', '# $ $ #', '#@   .#', '#######'] },
  { titre: 'Le grand entrepôt', description: 'Deux caisses, bien réfléchir', poussees: 12, carte: ['########', '#      #', '# $ #  #', '#  # . #', '#@$    #', '# ###. #', '########'] },
  { titre: 'Trois caisses', description: 'Le défi du niveau intermédiaire', poussees: 17, carte: ['########', '#  #  ##', '#.#  $ #', '#   #$ #', '# .  $ #', '#  . @ #', '########'] }
];
const caisses = fabriqueCaisses({ id: 'caisses', palier: 'intermediaire', titre: 'Pousse les caisses', icone: '📦', couleur: '#8a5a2b', resume: 'Pousse chaque caisse sur une cible, sans la coincer.', niveaux: NIV_CAISSES });

return [labycalc, serpfrac, pont, fusee, caisses];
});
