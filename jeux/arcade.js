/* Game drawings for the level choice banner */
const ILLUS_JEUX = {"labyrinthe": {"c1": "#4a57c4", "c2": "#a2aaf4", "svg": "<svg viewBox=\"0 0 120 80\"><rect x=\"22\" y=\"8\" width=\"76\" height=\"64\" rx=\"6\" fill=\"none\" stroke=\"#fff\" stroke-width=\"6\"/><path d=\"M42 8 V44 M62 72 V36 H80 M22 54 H42\" stroke=\"#fff\" stroke-width=\"6\" fill=\"none\"/><circle cx=\"32\" cy=\"20\" r=\"6\" fill=\"#e0567a\"/><path d=\"M88 58 l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z\" fill=\"#f4c152\"/></svg>"}, "serpcalc30": {"c1": "#2f8f5b", "c2": "#9ddcb5", "svg": "<svg viewBox=\"0 0 120 80\"><path d=\"M20 56 H60 V30 H92\" stroke=\"#fff\" stroke-width=\"14\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"/><circle cx=\"92\" cy=\"30\" r=\"10\" fill=\"#fff\"/><circle cx=\"95\" cy=\"27\" r=\"2.5\" fill=\"#23714a\"/><rect x=\"74\" y=\"50\" width=\"26\" height=\"22\" rx=\"5\" fill=\"#fff\"/><text x=\"87\" y=\"66\" text-anchor=\"middle\" font-size=\"11\" font-weight=\"700\" font-family=\"Arial\" fill=\"#23714a\">7+5</text></svg>"}, "attrape30": {"c1": "#c2633a", "c2": "#f2b89c", "svg": "<svg viewBox=\"0 0 120 80\"><rect x=\"44\" y=\"10\" width=\"34\" height=\"18\" rx=\"9\" fill=\"#fff\"/><rect x=\"18\" y=\"30\" width=\"30\" height=\"16\" rx=\"8\" fill=\"#fff\" opacity=\".8\"/><path d=\"M34 54 H86 L80 74 H40Z\" fill=\"#fff\"/></svg>"}, "labycalc50": {"c1": "#3d6fb6", "c2": "#9fc0ec", "svg": "<svg viewBox=\"0 0 120 80\"><rect x=\"20\" y=\"10\" width=\"80\" height=\"60\" rx=\"6\" fill=\"none\" stroke=\"#fff\" stroke-width=\"5\"/><path d=\"M45 10V45M75 70V35\" stroke=\"#fff\" stroke-width=\"5\"/><rect x=\"52\" y=\"20\" width=\"18\" height=\"14\" rx=\"3\" fill=\"#fff6d6\"/><text x=\"61\" y=\"31\" text-anchor=\"middle\" font-size=\"10\" font-family=\"Arial\" font-weight=\"700\" fill=\"#5a3d00\">45</text><text x=\"86\" y=\"60\" text-anchor=\"middle\" font-size=\"16\">🔑</text></svg>"}, "serpcalc50": {"c1": "#2a8a6e", "c2": "#9fdcc6", "svg": "<svg viewBox=\"0 0 120 80\"><path d=\"M20 56 H60 V30 H92\" stroke=\"#fff\" stroke-width=\"14\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"/><circle cx=\"92\" cy=\"30\" r=\"10\" fill=\"#fff\"/><circle cx=\"95\" cy=\"27\" r=\"2.5\" fill=\"#23714a\"/><rect x=\"74\" y=\"50\" width=\"26\" height=\"22\" rx=\"5\" fill=\"#fff\"/><text x=\"87\" y=\"66\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" font-family=\"Arial\" fill=\"#23714a\">38</text></svg>"}, "pont50": {"c1": "#b86b2b", "c2": "#f0c191", "svg": "<svg viewBox=\"0 0 120 80\"><rect x=\"0\" y=\"50\" width=\"120\" height=\"30\" fill=\"#7cc4e8\" opacity=\".8\"/><rect x=\"0\" y=\"40\" width=\"22\" height=\"40\" fill=\"#fff\" opacity=\".6\"/><rect x=\"98\" y=\"40\" width=\"22\" height=\"40\" fill=\"#fff\" opacity=\".6\"/><rect x=\"24\" y=\"38\" width=\"22\" height=\"9\" rx=\"2\" fill=\"#fff\"/><rect x=\"74\" y=\"38\" width=\"22\" height=\"9\" rx=\"2\" fill=\"#fff\"/><rect x=\"49\" y=\"36\" width=\"22\" height=\"13\" rx=\"2\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2\" stroke-dasharray=\"4 3\"/><circle cx=\"14\" cy=\"30\" r=\"7\" fill=\"#fff\"/></svg>"}, "attrape50": {"c1": "#b5552f", "c2": "#eda98a", "svg": "<svg viewBox=\"0 0 120 80\"><rect x=\"44\" y=\"10\" width=\"34\" height=\"18\" rx=\"9\" fill=\"#fff\"/><rect x=\"18\" y=\"30\" width=\"30\" height=\"16\" rx=\"8\" fill=\"#fff\" opacity=\".8\"/><path d=\"M34 54 H86 L80 74 H40Z\" fill=\"#fff\"/></svg>"}, "fusee": {"c1": "#2c62ab", "c2": "#9cbcec", "svg": "<svg viewBox=\"0 0 120 80\"><path d=\"M60 8V72M24 40H96\" stroke=\"#fff\" stroke-width=\"3\"/><path d=\"M36 8V72M84 8V72M24 20H96M24 60H96\" stroke=\"#fff\" stroke-width=\"1\" opacity=\".5\"/><text x=\"80\" y=\"30\" text-anchor=\"middle\" font-size=\"20\">🚀</text><circle cx=\"36\" cy=\"60\" r=\"5\" fill=\"#ffd56b\"/></svg>"}, "caisses": {"c1": "#8a5a2b", "c2": "#d9b48a", "svg": "<svg viewBox=\"0 0 120 80\"><rect x=\"28\" y=\"24\" width=\"32\" height=\"32\" rx=\"4\" fill=\"#fff\"/><path d=\"M32 28L56 52M56 28L32 52\" stroke=\"#8a5a2b\" stroke-width=\"3\"/><circle cx=\"88\" cy=\"40\" r=\"11\" fill=\"none\" stroke=\"#fff\" stroke-width=\"4\"/><circle cx=\"88\" cy=\"40\" r=\"4\" fill=\"#fff\"/><path d=\"M64 40H74\" stroke=\"#fff\" stroke-width=\"3\"/></svg>"}, "serpent": {"c1": "#2f8f5b", "c2": "#9ddcb5", "svg": "<svg viewBox=\"0 0 120 80\"><path d=\"M20 56 H60 V30 H92\" stroke=\"#fff\" stroke-width=\"14\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"/><circle cx=\"92\" cy=\"30\" r=\"10\" fill=\"#fff\"/><circle cx=\"95\" cy=\"27\" r=\"2.5\" fill=\"#23714a\"/><rect x=\"74\" y=\"50\" width=\"26\" height=\"22\" rx=\"5\" fill=\"#fff\"/><text x=\"87\" y=\"66\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" font-family=\"Arial\" fill=\"#23714a\">12</text></svg>"}, "attrape": {"c1": "#c2633a", "c2": "#f2b89c", "svg": "<svg viewBox=\"0 0 120 80\"><rect x=\"44\" y=\"10\" width=\"34\" height=\"18\" rx=\"9\" fill=\"#fff\"/><rect x=\"18\" y=\"30\" width=\"30\" height=\"16\" rx=\"8\" fill=\"#fff\" opacity=\".8\"/><path d=\"M34 54 H86 L80 74 H40Z\" fill=\"#fff\"/></svg>"}, "labycalc": {"c1": "#3d6fb6", "c2": "#9fc0ec", "svg": "<svg viewBox=\"0 0 120 80\"><rect x=\"20\" y=\"10\" width=\"80\" height=\"60\" rx=\"6\" fill=\"none\" stroke=\"#fff\" stroke-width=\"5\"/><path d=\"M45 10V45M75 70V35\" stroke=\"#fff\" stroke-width=\"5\"/><rect x=\"52\" y=\"20\" width=\"18\" height=\"14\" rx=\"3\" fill=\"#fff6d6\"/><text x=\"61\" y=\"31\" text-anchor=\"middle\" font-size=\"10\" font-family=\"Arial\" font-weight=\"700\" fill=\"#5a3d00\">56</text><text x=\"86\" y=\"60\" text-anchor=\"middle\" font-size=\"16\">🔑</text></svg>"}, "serpfrac": {"c1": "#2a8a6e", "c2": "#9fdcc6", "svg": "<svg viewBox=\"0 0 120 80\"><path d=\"M18 58H52V32H84\" stroke=\"#fff\" stroke-width=\"13\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"/><circle cx=\"86\" cy=\"32\" r=\"9\" fill=\"#fff\"/><rect x=\"74\" y=\"50\" width=\"30\" height=\"22\" rx=\"5\" fill=\"#fff\"/><text x=\"89\" y=\"66\" text-anchor=\"middle\" font-size=\"12\" font-family=\"Arial\" font-weight=\"700\" fill=\"#1f6b55\">3/4</text></svg>"}, "pont": {"c1": "#b86b2b", "c2": "#f0c191", "svg": "<svg viewBox=\"0 0 120 80\"><rect x=\"0\" y=\"50\" width=\"120\" height=\"30\" fill=\"#7cc4e8\" opacity=\".8\"/><rect x=\"0\" y=\"40\" width=\"22\" height=\"40\" fill=\"#fff\" opacity=\".6\"/><rect x=\"98\" y=\"40\" width=\"22\" height=\"40\" fill=\"#fff\" opacity=\".6\"/><rect x=\"24\" y=\"38\" width=\"22\" height=\"9\" rx=\"2\" fill=\"#fff\"/><rect x=\"74\" y=\"38\" width=\"22\" height=\"9\" rx=\"2\" fill=\"#fff\"/><rect x=\"49\" y=\"36\" width=\"22\" height=\"13\" rx=\"2\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2\" stroke-dasharray=\"4 3\"/><circle cx=\"14\" cy=\"30\" r=\"7\" fill=\"#fff\"/></svg>"}, "robot": {"c1": "#3c4fa8", "c2": "#a6b2ee", "svg": "<svg viewBox=\"0 0 120 80\"><rect x=\"40\" y=\"18\" width=\"40\" height=\"36\" rx=\"8\" fill=\"#fff\"/><circle cx=\"52\" cy=\"34\" r=\"5\" fill=\"#3c4fa8\"/><circle cx=\"68\" cy=\"34\" r=\"5\" fill=\"#3c4fa8\"/><rect x=\"18\" y=\"60\" width=\"18\" height=\"14\" rx=\"3\" fill=\"#fff\"/><rect x=\"40\" y=\"60\" width=\"18\" height=\"14\" rx=\"3\" fill=\"#fff\"/><rect x=\"62\" y=\"60\" width=\"18\" height=\"14\" rx=\"3\" fill=\"#fff\"/><text x=\"27\" y=\"71\" text-anchor=\"middle\" font-size=\"11\" font-family=\"Arial\" font-weight=\"700\" fill=\"#3c4fa8\">↑</text><text x=\"49\" y=\"71\" text-anchor=\"middle\" font-size=\"11\" font-family=\"Arial\" font-weight=\"700\" fill=\"#3c4fa8\">↷</text><text x=\"71\" y=\"71\" text-anchor=\"middle\" font-size=\"9\" font-family=\"Arial\" font-weight=\"700\" fill=\"#3c4fa8\">↑×3</text></svg>"}, "caissesx": {"c1": "#6e4a24", "c2": "#c79c6e", "svg": "<svg viewBox=\"0 0 120 80\"><rect x=\"14\" y=\"30\" width=\"24\" height=\"24\" rx=\"3\" fill=\"#fff\"/><rect x=\"44\" y=\"30\" width=\"24\" height=\"24\" rx=\"3\" fill=\"#fff\"/><rect x=\"74\" y=\"30\" width=\"24\" height=\"24\" rx=\"3\" fill=\"#fff\" opacity=\".7\"/><circle cx=\"104\" cy=\"20\" r=\"7\" fill=\"none\" stroke=\"#fff\" stroke-width=\"3\"/></svg>"}, "laser": {"c1": "#b3366e", "c2": "#ef9fc2", "svg": "<svg viewBox=\"0 0 120 80\"><rect x=\"10\" y=\"32\" width=\"18\" height=\"16\" rx=\"3\" fill=\"#fff\"/><path d=\"M28 40H60V14H96V60\" stroke=\"#ffe0ec\" stroke-width=\"4\" fill=\"none\"/><path d=\"M53 33L67 47M89 7L103 21\" stroke=\"#fff\" stroke-width=\"5\"/><circle cx=\"96\" cy=\"64\" r=\"8\" fill=\"#fff\"/><circle cx=\"96\" cy=\"64\" r=\"3\" fill=\"#b3366e\"/></svg>"}, "glisse": {"c1": "#5b7d1a", "c2": "#c3dd8e", "svg": "<svg viewBox=\"0 0 120 80\"><rect x=\"22\" y=\"10\" width=\"34\" height=\"28\" rx=\"6\" fill=\"#fff\"/><rect x=\"64\" y=\"10\" width=\"34\" height=\"28\" rx=\"6\" fill=\"#fff\" opacity=\".8\"/><rect x=\"22\" y=\"44\" width=\"34\" height=\"28\" rx=\"6\" fill=\"#fff\" opacity=\".8\"/><rect x=\"64\" y=\"44\" width=\"34\" height=\"28\" rx=\"6\" fill=\"#fff\"/><text x=\"39\" y=\"30\" text-anchor=\"middle\" font-size=\"14\" font-family=\"Arial\" font-weight=\"700\" fill=\"#47630f\">8</text><text x=\"81\" y=\"64\" text-anchor=\"middle\" font-size=\"14\" font-family=\"Arial\" font-weight=\"700\" fill=\"#47630f\">16</text></svg>"}, "droite": {"c1": "#0b7480", "c2": "#8fd3da", "svg": "<svg viewBox=\"0 0 120 80\"><path d=\"M60 6V74M14 40H106\" stroke=\"#fff\" stroke-width=\"2\" opacity=\".7\"/><path d=\"M20 70L100 12\" stroke=\"#fff\" stroke-width=\"5\" stroke-linecap=\"round\"/><path d=\"M38 57l2 5 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1z\" fill=\"#ffd56b\"/><path d=\"M76 29l2 5 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1z\" fill=\"#ffd56b\"/></svg>"}, "serpvaleur": {"c1": "#2f8f5b", "c2": "#9ddcb5", "svg": "<svg viewBox=\"0 0 120 80\"><path d=\"M20 56 H60 V30 H92\" stroke=\"#fff\" stroke-width=\"14\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"/><circle cx=\"92\" cy=\"30\" r=\"10\" fill=\"#fff\"/><circle cx=\"95\" cy=\"27\" r=\"2.5\" fill=\"#23714a\"/><rect x=\"74\" y=\"50\" width=\"26\" height=\"22\" rx=\"5\" fill=\"#fff\"/><text x=\"87\" y=\"66\" text-anchor=\"middle\" font-size=\"11\" font-weight=\"700\" font-family=\"Arial\" fill=\"#23714a\">7+5</text></svg>"}, "attrapenb": {"c1": "#c2633a", "c2": "#f2b89c", "svg": "<svg viewBox=\"0 0 120 80\"><rect x=\"44\" y=\"10\" width=\"34\" height=\"18\" rx=\"9\" fill=\"#fff\"/><rect x=\"18\" y=\"30\" width=\"30\" height=\"16\" rx=\"8\" fill=\"#fff\" opacity=\".8\"/><path d=\"M34 54 H86 L80 74 H40Z\" fill=\"#fff\"/></svg>"}, "serpcalc100": {"c1": "#2a8a6e", "c2": "#9fdcc6", "svg": "<svg viewBox=\"0 0 120 80\"><path d=\"M20 56 H60 V30 H92\" stroke=\"#fff\" stroke-width=\"14\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"/><circle cx=\"92\" cy=\"30\" r=\"10\" fill=\"#fff\"/><circle cx=\"95\" cy=\"27\" r=\"2.5\" fill=\"#23714a\"/><rect x=\"74\" y=\"50\" width=\"26\" height=\"22\" rx=\"5\" fill=\"#fff\"/><text x=\"87\" y=\"66\" text-anchor=\"middle\" font-size=\"14\" font-weight=\"700\" font-family=\"Arial\" fill=\"#23714a\">38</text></svg>"}, "labyvaleur": {"c1": "#3d6fb6", "c2": "#9fc0ec", "svg": "<svg viewBox=\"0 0 120 80\"><rect x=\"20\" y=\"10\" width=\"80\" height=\"60\" rx=\"6\" fill=\"none\" stroke=\"#fff\" stroke-width=\"5\"/><path d=\"M45 10V45M75 70V35\" stroke=\"#fff\" stroke-width=\"5\"/><rect x=\"52\" y=\"20\" width=\"18\" height=\"14\" rx=\"3\" fill=\"#fff6d6\"/><text x=\"61\" y=\"31\" text-anchor=\"middle\" font-size=\"10\" font-family=\"Arial\" font-weight=\"700\" fill=\"#5a3d00\">45</text><text x=\"86\" y=\"60\" text-anchor=\"middle\" font-size=\"16\">🔑</text></svg>"}, "pont100": {"c1": "#b86b2b", "c2": "#f0c191", "svg": "<svg viewBox=\"0 0 120 80\"><rect x=\"0\" y=\"50\" width=\"120\" height=\"30\" fill=\"#7cc4e8\" opacity=\".8\"/><rect x=\"0\" y=\"40\" width=\"22\" height=\"40\" fill=\"#fff\" opacity=\".6\"/><rect x=\"98\" y=\"40\" width=\"22\" height=\"40\" fill=\"#fff\" opacity=\".6\"/><rect x=\"24\" y=\"38\" width=\"22\" height=\"9\" rx=\"2\" fill=\"#fff\"/><rect x=\"74\" y=\"38\" width=\"22\" height=\"9\" rx=\"2\" fill=\"#fff\"/><rect x=\"49\" y=\"36\" width=\"22\" height=\"13\" rx=\"2\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2\" stroke-dasharray=\"4 3\"/><circle cx=\"14\" cy=\"30\" r=\"7\" fill=\"#fff\"/></svg>"}, "attrape100": {"c1": "#b5552f", "c2": "#eda98a", "svg": "<svg viewBox=\"0 0 120 80\"><rect x=\"44\" y=\"10\" width=\"34\" height=\"18\" rx=\"9\" fill=\"#fff\"/><rect x=\"18\" y=\"30\" width=\"30\" height=\"16\" rx=\"8\" fill=\"#fff\" opacity=\".8\"/><path d=\"M34 54 H86 L80 74 H40Z\" fill=\"#fff\"/></svg>"}};
/* Calm arcade games: Maze, Multiples snake, Catch the right ones.
   Controls: keyboard arrows (or Z Q S D / W A S D), mouse or finger, on-screen arrows.
   Space or P: pause. No sound. The best results are kept on this device. */
(() => {
'use strict';
const el = id => document.getElementById(id);
const W = 560, H = 560;
const hasard = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pioche = t => t[Math.floor(Math.random() * t.length)];
const melange = t => { for (let i = t.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [t[i], t[j]] = [t[j], t[i]]; } return t; };
const memoire = {
  lire(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  ecrire(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
const DIRS = { haut: [0, -1], bas: [0, 1], gauche: [-1, 0], droite: [1, 0] };
const TOUCHES = { ArrowUp: 'haut', ArrowDown: 'bas', ArrowLeft: 'gauche', ArrowRight: 'droite', z: 'haut', w: 'haut', s: 'bas', q: 'gauche', a: 'gauche', d: 'droite' };
const fois = '×', moins = '−', divise = '÷';

/* ---------- Shared drawing ---------- */
function rond(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function etoile(ctx, cx, cy, r, couleur) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; ctx.lineTo(cx + rr * Math.cos(a), cy + rr * Math.sin(a)); }
  ctx.closePath(); ctx.fillStyle = couleur || '#f4c152'; ctx.fill(); ctx.strokeStyle = '#c48b12'; ctx.lineWidth = 2; ctx.stroke();
}
function texte(ctx, t, x, y, taille, couleur, poids) { ctx.font = (poids || 700) + ' ' + taille + 'px "Atkinson Hyperlegible", Arial, sans-serif'; ctx.fillStyle = couleur; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(t, x, y); }
function visage(ctx, x, y, r, couleur) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = couleur; ctx.fill();
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x - r * .35, y - r * .2, r * .2, 0, 7); ctx.arc(x + r * .35, y - r * .2, r * .2, 0, 7); ctx.fill();
  ctx.fillStyle = '#16324f'; ctx.beginPath(); ctx.arc(x - r * .35, y - r * .2, r * .1, 0, 7); ctx.arc(x + r * .35, y - r * .2, r * .1, 0, 7); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, y + r * .1, r * .4, .2 * Math.PI, .8 * Math.PI); ctx.stroke();
}

/* ================================================================
   1. MAZE
   ================================================================ */
const labyrinthe = {
  id: 'labyrinthe', titre: 'Labyrinthe aux étoiles', icone: '🌟', couleur: '#4a57c4',
  resume: 'Ramasse toutes les étoiles, puis sors par la porte verte.',
  touches: 'Flèches · ou clic sur une case',
  aide: 'Flèches du clavier pour avancer d’une case. Avec la souris : clique sur une case et ton personnage y va tout seul.',
  vitesse: false,
  niveaux: [
    { titre: 'Petit labyrinthe', description: '5 × 5 cases · 1 étoile', n: 5, etoiles: 1 },
    { titre: 'Un peu plus grand', description: '6 × 6 cases · 2 étoiles', n: 6, etoiles: 2 },
    { titre: 'Des détours', description: '7 × 7 cases · 2 étoiles', n: 7, etoiles: 2 },
    { titre: 'Chemin caché', description: '8 × 8 cases · 3 étoiles', n: 8, etoiles: 3 },
    { titre: 'Grand labyrinthe', description: '9 × 9 cases · 3 étoiles', n: 9, etoiles: 3 },
    { titre: 'Explorateur', description: '11 × 11 cases · 4 étoiles', n: 11, etoiles: 4 },
    { titre: 'Expert', description: '13 × 13 cases · 4 étoiles', n: 13, etoiles: 4 },
    { titre: 'Maître du labyrinthe', description: '15 × 15 cases · 5 étoiles', n: 15, etoiles: 5 }
  ],
  consigne(nv) { return 'Ramasse les ' + nv.etoiles + (nv.etoiles > 1 ? ' étoiles' : ' étoile') + ' ⭐, puis va à la porte verte 🚪.'; },
  init(nv, J) {
    const n = nv.n, c = W / n;
    /* Walls: 1 = north, 2 = east, 4 = south, 8 = west. Carved with a depth-first walk. */
    const murs = Array.from({ length: n }, () => Array(n).fill(15));
    const vu = Array.from({ length: n }, () => Array(n).fill(false));
    const pile = [[0, 0]]; vu[0][0] = true;
    const V = [[0, -1, 1, 4], [1, 0, 2, 8], [0, 1, 4, 1], [-1, 0, 8, 2]];
    while (pile.length) {
      const [x, y] = pile[pile.length - 1];
      const options = V.filter(([dx, dy]) => { const a = x + dx, b = y + dy; return a >= 0 && b >= 0 && a < n && b < n && !vu[b][a]; });
      if (!options.length) { pile.pop(); continue; }
      const [dx, dy, m, mo] = pioche(options);
      murs[y][x] &= ~m; murs[y + dy][x + dx] &= ~mo; vu[y + dy][x + dx] = true; pile.push([x + dx, y + dy]);
    }
    /* A few extra passages: fewer dead ends, less frustration. */
    for (let k = 0; k < Math.floor(n * n / 12); k++) {
      const x = hasard(0, n - 2), y = hasard(0, n - 2);
      if (Math.random() < .5) { murs[y][x] &= ~2; murs[y][x + 1] &= ~8; } else { murs[y][x] &= ~4; murs[y + 1][x] &= ~1; }
    }
    const ouvert = (x, y, dx, dy) => { const m = dx === 1 ? 2 : dx === -1 ? 8 : dy === 1 ? 4 : 1; return !(murs[y][x] & m); };
    const bfs = (sx, sy) => {
      const d = Array.from({ length: n }, () => Array(n).fill(-1)), p = Array.from({ length: n }, () => Array(n).fill(null));
      const f = [[sx, sy]]; d[sy][sx] = 0;
      while (f.length) { const [x, y] = f.shift(); for (const [dx, dy] of V) { const a = x + dx, b = y + dy; if (a < 0 || b < 0 || a >= n || b >= n || d[b][a] >= 0 || !ouvert(x, y, dx, dy)) continue; d[b][a] = d[y][x] + 1; p[b][a] = [x, y]; f.push([a, b]); } }
      return { d, p };
    };
    /* Stars placed far from the start, on different cells. */
    const depart = bfs(0, 0), cases = [];
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!(x === 0 && y === 0) && !(x === n - 1 && y === n - 1) && depart.d[y][x] >= n / 2) cases.push([x, y]);
    const etoiles = melange(cases).slice(0, nv.etoiles).map(([x, y]) => ({ x, y, prise: false }));
    /* "Ideal" number of steps (nearest star each time) to award the end stars. */
    let ideal = 0, pos = [0, 0], reste = etoiles.slice();
    while (reste.length) { const t = bfs(pos[0], pos[1]); reste.sort((a, b) => t.d[a.y][a.x] - t.d[b.y][b.x]); const e = reste.shift(); ideal += t.d[e.y][e.x]; pos = [e.x, e.y]; }
    ideal += bfs(pos[0], pos[1]).d[n - 1][n - 1];
    this.s = { n, c, murs, ouvert, bfs, etoiles, joueur: { x: 0, y: 0 }, vue: { x: 0, y: 0 }, chemin: [], pas: 0, ideal, fini: false, cible: null, attente: 0 };
    J.score('Pas : 0'); J.coeurs(''); J.message('Utilise les flèches, ou clique sur une case pour y aller.');
  },
  bouger(dx, dy, J) {
    const s = this.s, j = s.joueur;
    if (s.fini) return false;
    const nx = j.x + dx, ny = j.y + dy;
    if (nx < 0 || ny < 0 || nx >= s.n || ny >= s.n || !s.ouvert(j.x, j.y, dx, dy)) { s.chemin = []; J.message('Un mur bloque ce chemin.', 'oups'); return false; }
    j.x = nx; j.y = ny; s.pas++; J.score('Pas : ' + s.pas);
    const e = s.etoiles.find(e => !e.prise && e.x === nx && e.y === ny);
    const restantes = () => s.etoiles.filter(e => !e.prise).length;
    if (e) { e.prise = true; const r = restantes(); J.message(r ? 'Une étoile ! Encore ' + r + '.' : 'Toutes les étoiles ! Va à la porte verte 🚪.', 'bon'); }
    if (nx === s.n - 1 && ny === s.n - 1) {
      const r = restantes();
      if (r) J.message('La porte est fermée : il reste ' + r + (r > 1 ? ' étoiles' : ' étoile') + ' à ramasser.', 'oups');
      else {
        s.fini = true; s.chemin = [];
        const note = s.pas <= s.ideal * 1.25 ? 3 : s.pas <= s.ideal * 1.8 ? 2 : 1;
        setTimeout(() => J.gagne(note, 'Tu es sorti en ' + s.pas + ' pas.'), 350);
      }
    }
    return true;
  },
  touche(dir, J) { this.s.chemin = []; const [dx, dy] = DIRS[dir]; this.bouger(dx, dy, J); },
  clic(x, y, J) {
    const s = this.s, cx = Math.floor(x / s.c), cy = Math.floor(y / s.c);
    if (cx < 0 || cy < 0 || cx >= s.n || cy >= s.n || s.fini) return;
    const { p } = s.bfs(s.joueur.x, s.joueur.y), chemin = [];
    let cur = [cx, cy];
    while (cur && !(cur[0] === s.joueur.x && cur[1] === s.joueur.y)) { chemin.unshift(cur); cur = p[cur[1]][cur[0]]; }
    s.chemin = chemin; s.cible = { x: cx, y: cy };
  },
  maj(dt, J) {
    const s = this.s, v = s.vue, j = s.joueur, pas = Math.min(1, dt * 14);
    v.x += (j.x - v.x) * pas; v.y += (j.y - v.y) * pas;
    s.attente -= dt;
    if (s.chemin.length && s.attente <= 0 && Math.abs(v.x - j.x) < .15 && Math.abs(v.y - j.y) < .15) {
      const [x, y] = s.chemin.shift();
      this.bouger(x - j.x, y - j.y, J); s.attente = .09;
      if (!s.chemin.length) s.cible = null;
    }
  },
  dessin(ctx, t) {
    const s = this.s, c = s.c, n = s.n;
    ctx.fillStyle = '#f7f9fc'; ctx.fillRect(0, 0, W, H);
    for (const [x, y] of s.chemin) { ctx.fillStyle = '#dfe3fb'; ctx.fillRect(x * c + c * .3, y * c + c * .3, c * .4, c * .4); }
    /* Door */
    const ouverte = s.etoiles.every(e => e.prise);
    rond(ctx, (n - 1) * c + c * .15, (n - 1) * c + c * .1, c * .7, c * .8, c * .12);
    ctx.fillStyle = ouverte ? '#3aa36b' : '#9aa7b4'; ctx.fill();
    if (!ouverte) texte(ctx, '🔒', (n - 1) * c + c / 2, (n - 1) * c + c / 2, c * .4, '#fff');
    else { ctx.beginPath(); ctx.arc((n - 1) * c + c * .68, (n - 1) * c + c * .52, c * .06, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); }
    /* Stars (light breathing animation) */
    const r = c * (.3 + .02 * Math.sin(t * 2.5));
    for (const e of s.etoiles) if (!e.prise) etoile(ctx, e.x * c + c / 2, e.y * c + c / 2, r);
    /* Walls */
    ctx.strokeStyle = '#3d47a8'; ctx.lineWidth = Math.max(3, c / 9); ctx.lineCap = 'round'; ctx.beginPath();
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const m = s.murs[y][x], X = x * c, Y = y * c;
      if (m & 1) { ctx.moveTo(X, Y); ctx.lineTo(X + c, Y); }
      if (m & 8) { ctx.moveTo(X, Y); ctx.lineTo(X, Y + c); }
      if (y === n - 1 && (m & 4)) { ctx.moveTo(X, Y + c); ctx.lineTo(X + c, Y + c); }
      if (x === n - 1 && (m & 2)) { ctx.moveTo(X + c, Y); ctx.lineTo(X + c, Y + c); }
    }
    ctx.stroke();
    visage(ctx, s.vue.x * c + c / 2, s.vue.y * c + c / 2, c * .32, '#e0567a');
  }
};

/* ================================================================
   2. MULTIPLES SNAKE
   ================================================================ */
const premier = v => { if (v < 2) return false; for (let d = 2; d * d <= v; d++) if (v % d === 0) return false; return true; };
const diviseur = v => { for (let d = 2; d * d <= v; d++) if (v % d === 0) return d; return 1; };
const regleMultiple = (m, max) => ({
  texte: 'les multiples de ' + m, max, test: v => v % m === 0,
  bien: v => v + ' = ' + m + ' ' + fois + ' ' + v / m + '.',
  pourquoi: v => v + ' n’est pas dans la table de ' + m + ' (' + m + ' ' + fois + ' ' + Math.floor(v / m) + ' = ' + m * Math.floor(v / m) + ').'
});
const reglePremiers = { texte: 'les nombres premiers', max: 50, test: premier, bien: v => v + ' se divise seulement par 1 et par lui-même.', pourquoi: v => v === 1 ? '1 n’est pas un nombre premier.' : v + ' = ' + diviseur(v) + ' ' + fois + ' ' + v / diviseur(v) + ' : il n’est pas premier.' };
const serpent = {
  id: 'serpent', titre: 'Serpent des multiples', icone: '🐍', couleur: '#2f8f5b',
  resume: 'Guide le serpent et mange seulement les bons nombres.',
  touches: 'Flèches · ou clic pour tourner',
  aide: 'Flèches du clavier pour tourner. Avec la souris : clique du côté où le serpent doit aller. Les bords de l’écran te font passer de l’autre côté.',
  vitesse: true,
  niveaux: [
    { titre: 'Nombres pairs', description: 'Multiples de 2 · mange 8 bons nombres', regle: regleMultiple(2, 30) },
    { titre: 'Table de 5', description: 'Multiples de 5 · mange 8 bons nombres', regle: regleMultiple(5, 60) },
    { titre: 'Table de 3', description: 'Multiples de 3 · mange 8 bons nombres', regle: regleMultiple(3, 45) },
    { titre: 'Table de 4', description: 'Multiples de 4 · mange 8 bons nombres', regle: regleMultiple(4, 60) },
    { titre: 'Table de 6', description: 'Multiples de 6 · mange 10 bons nombres', regle: regleMultiple(6, 72), but: 10 },
    { titre: 'Table de 7', description: 'Multiples de 7 · mange 10 bons nombres', regle: regleMultiple(7, 84), but: 10 },
    { titre: 'Table de 9', description: 'Multiples de 9 · mange 10 bons nombres', regle: regleMultiple(9, 99), but: 10 },
    { titre: 'Nombres premiers', description: 'Divisibles seulement par 1 et eux-mêmes · 10 bons nombres', regle: reglePremiers, but: 10 }
  ],
  consigne(nv) { return 'Mange seulement ' + nv.regle.texte + '. Évite les autres nombres.'; },
  G: 14,
  init(nv, J) {
    const m = this.G >> 1;
    this.s = { nv, corps: [{ x: m, y: m }, { x: m - 1, y: m }, { x: m - 2, y: m }], dir: 'droite', file: [], horloge: 0, items: [], manges: 0, but: nv.but || 8, coeurs: 3, attente: true, fini: false, prec: null };
    for (let i = 0; i < 5; i++) this.ajouter();
    J.score('Bons : 0 / ' + this.s.but); J.coeurs(3);
    J.message('Appuie sur une flèche (ou clique) pour démarrer.');
  },
  libre(x, y) { const s = this.s; return !s.corps.some(p => p.x === x && p.y === y) && !s.items.some(i => i.x === x && i.y === y) && !(Math.abs(x - s.corps[0].x) + Math.abs(y - s.corps[0].y) < 3); },
  ajouter() {
    const s = this.s, R = s.nv.regle, bons = s.items.filter(i => i.ok).length;
    const veutBon = bons < 2 || Math.random() < .45;
    const pris = new Set(s.items.map(i => i.v)), choix = [];
    for (let v = 1; v <= R.max; v++) if (R.test(v) === veutBon && !pris.has(v)) choix.push(v);
    if (!choix.length) return;
    let x, y, essais = 0;
    do { x = hasard(0, this.G - 1); y = hasard(0, this.G - 1); } while (!this.libre(x, y) && ++essais < 300);
    s.items.push({ x, y, v: pioche(choix), ok: veutBon });
  },
  oppose: { haut: 'bas', bas: 'haut', gauche: 'droite', droite: 'gauche' },
  touche(dir, J) {
    const s = this.s; if (s.fini) return;
    if (s.attente) { s.attente = false; s.horloge = 0; J.message(''); if (dir === this.oppose[s.dir]) dir = s.dir; }
    const der = s.file.length ? s.file[s.file.length - 1] : s.dir;
    if (dir !== der && dir !== this.oppose[der] && s.file.length < 2) s.file.push(dir);
  },
  clic(x, y, J) {
    const s = this.s, c = W / this.G, t = s.corps[0];
    const dx = x - (t.x + .5) * c, dy = y - (t.y + .5) * c;
    const der = s.file.length ? s.file[s.file.length - 1] : s.dir;
    let dir;
    if (der === 'haut' || der === 'bas') dir = Math.abs(dx) < c / 2 ? der : dx > 0 ? 'droite' : 'gauche';
    else dir = Math.abs(dy) < c / 2 ? der : dy > 0 ? 'bas' : 'haut';
    if (s.attente) dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'droite' : 'gauche') : (dy > 0 ? 'bas' : 'haut');
    this.touche(dir, J);
  },
  tick(J) {
    const s = this.s;
    if (s.file.length) s.dir = s.file.shift();
    const [dx, dy] = DIRS[s.dir], t = s.corps[0], G = this.G;
    const nt = { x: (t.x + dx + G) % G, y: (t.y + dy + G) % G };
    s.prec = s.corps.map(p => ({ ...p }));
    const item = s.items.find(i => i.x === nt.x && i.y === nt.y);
    const grandit = item && item.ok;
    const corpsTest = grandit ? s.corps : s.corps.slice(0, -1);
    if (corpsTest.some(p => p.x === nt.x && p.y === nt.y)) {
      this.perte(J, 'Oups, le serpent s’est touché lui-même. Il redevient petit.');
      const m = G >> 1; s.corps = [{ x: m, y: m }, { x: m - 1, y: m }, { x: m - 2, y: m }]; s.dir = 'droite'; s.file = []; s.prec = null;
      s.items = s.items.filter(i => !s.corps.some(p => p.x === i.x && p.y === i.y));
      while (s.items.length < 5) this.ajouter();
      if (!s.fini) { s.attente = true; J.message('Le serpent s’est touché. Appuie sur une flèche pour repartir.', 'oups'); }
      return;
    }
    s.corps.unshift(nt);
    if (!grandit) s.corps.pop();
    if (item) {
      s.items.splice(s.items.indexOf(item), 1);
      if (item.ok) {
        s.manges++; J.score('Bons : ' + s.manges + ' / ' + s.but); J.message('Bravo ! ' + s.nv.regle.bien(item.v), 'bon');
        if (s.manges >= s.but) { s.fini = true; setTimeout(() => J.gagne(s.coeurs, 'Tu as mangé ' + s.but + ' bons nombres.'), 300); return; }
      } else this.perte(J, s.nv.regle.pourquoi(item.v));
      this.ajouter();
    }
  },
  perte(J, msg) {
    const s = this.s; s.coeurs--; J.coeurs(s.coeurs); J.message(msg, 'oups');
    if (s.coeurs <= 0) { s.fini = true; setTimeout(() => J.perdu('Tu as mangé ' + s.manges + ' bons nombres sur ' + s.but + '.'), 600); }
  },
  maj(dt, J) {
    const s = this.s; if (s.attente || s.fini) return;
    const periode = { lent: .32, moyen: .23, rapide: .16 }[J.vitesse()];
    s.horloge += dt;
    while (s.horloge >= periode && !s.attente && !s.fini) { s.horloge -= periode; this.tick(J); }
    s.avance = s.attente ? 1 : Math.min(1, s.horloge / periode);
  },
  dessin(ctx, t) {
    const s = this.s, G = this.G, c = W / G;
    for (let y = 0; y < G; y++) for (let x = 0; x < G; x++) { ctx.fillStyle = (x + y) % 2 ? '#eef5ef' : '#f7fbf7'; ctx.fillRect(x * c, y * c, c, c); }
    for (const i of s.items) {
      rond(ctx, i.x * c + 3, i.y * c + 3, c - 6, c - 6, 9); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = '#8fa3b5'; ctx.lineWidth = 2; ctx.stroke();
      texte(ctx, String(i.v), i.x * c + c / 2, i.y * c + c / 2 + 1, i.v > 99 ? c * .38 : c * .46, '#16324f', 800);
    }
    /* Smooth movement between two cells (except when crossing an edge). */
    const a = s.avance === undefined ? 1 : s.avance;
    const pos = s.corps.map((p, k) => {
      const q = s.prec && s.prec[k] ? s.prec[k] : (s.prec ? s.prec[s.prec.length - 1] : p);
      if (!q || Math.abs(p.x - q.x) > 1 || Math.abs(p.y - q.y) > 1 || s.attente) return { x: p.x, y: p.y };
      return { x: q.x + (p.x - q.x) * a, y: q.y + (p.y - q.y) * a };
    });
    for (let k = pos.length - 1; k >= 0; k--) {
      const p = pos[k], r = k === 0 ? c * .46 : c * .4 - Math.min(k, 6) * .6;
      ctx.beginPath(); ctx.arc(p.x * c + c / 2, p.y * c + c / 2, r, 0, 7);
      ctx.fillStyle = k === 0 ? '#2f8f5b' : (k % 2 ? '#4fb37c' : '#43a56f'); ctx.fill();
    }
    const h = pos[0], [dx, dy] = DIRS[s.dir], hx = h.x * c + c / 2, hy = h.y * c + c / 2;
    for (const sgn of [-1, 1]) {
      const ex = hx + dx * c * .15 - dy * sgn * c * .18, ey = hy + dy * c * .15 + dx * sgn * c * .18;
      ctx.beginPath(); ctx.arc(ex, ey, c * .1, 0, 7); ctx.fillStyle = '#fff'; ctx.fill();
      ctx.beginPath(); ctx.arc(ex + dx * 2, ey + dy * 2, c * .05, 0, 7); ctx.fillStyle = '#16324f'; ctx.fill();
    }
    if (s.attente) { ctx.fillStyle = '#ffffffb0'; rond(ctx, 90, H / 2 - 34, W - 180, 68, 14); ctx.fill(); texte(ctx, 'Appuie sur une flèche pour partir', W / 2, H / 2, 24, '#16324f'); }
  }
};

/* ================================================================
   3. CATCH THE RIGHT ONES
   ================================================================ */
function calcul(cible) {
  /* An operation whose result is "cible". */
  const f = [];
  for (let a = 1; a < cible; a++) f.push([a + ' + ' + (cible - a)]);
  for (let a = 2; a <= cible; a++) if (cible % a === 0 && a !== cible && a !== 1) f.push([a + ' ' + fois + ' ' + cible / a]);
  for (let b = 1; b <= 12; b++) f.push([(cible + b) + ' ' + moins + ' ' + b]);
  for (let b = 2; b <= 6; b++) f.push([(cible * b) + ' ' + divise + ' ' + b]);
  return pioche(f)[0];
}
const valeur = e => Function('return ' + e.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-'))();
function regleCible(cible) {
  return {
    texte: 'les calculs qui donnent ' + cible,
    tirer() {
      if (Math.random() < .5) { const e = calcul(cible); return { label: e, ok: true, info: e + ' = ' + cible }; }
      let r; do { r = cible + pioche([-4, -3, -2, -1, 1, 2, 3, 4, 6]); } while (r < 2);
      const e = calcul(r); return { label: e, ok: false, info: e + ' = ' + valeur(e) + ', pas ' + cible };
    }
  };
}
const ATTRAPE = [
  { titre: 'Nombres pairs', description: 'Attrape 12 nombres pairs', regle: { texte: 'les nombres pairs', tirer() { const v = hasard(1, 80); return { label: String(v), ok: v % 2 === 0, info: v % 2 ? v + ' est impair' : v + ' est pair' }; } } },
  { titre: 'Table de 5', description: 'Attrape 12 multiples de 5', regle: { texte: 'les multiples de 5', tirer() { const v = Math.random() < .5 ? 5 * hasard(1, 20) : hasard(1, 100); return { label: String(v), ok: v % 5 === 0, info: v % 5 ? v + ' n’est pas dans la table de 5' : v + ' = 5 ' + fois + ' ' + v / 5 }; } } },
  { titre: 'Résultat 12', description: 'Des calculs avec + − × ÷', regle: regleCible(12) },
  { titre: 'Plus grand que ½', description: 'Comparer des fractions', regle: { texte: 'les fractions plus grandes que ½', tirer() { let a, b; do { b = hasard(3, 10); a = hasard(1, b - 1); } while (2 * a === b); const ok = 2 * a > b; const moitie = String(b / 2).replace('.', ','); return { label: a + '/' + b, ok, info: a + '/' + b + (ok ? ' est plus grand que ½ : ' + a + ' est plus que la moitié de ' + b + ' (' + moitie + ')' : ' est plus petit que ½ : ' + a + ' est moins que la moitié de ' + b + ' (' + moitie + ')') }; } } },
  { titre: 'Résultat négatif', description: 'Des soustractions sous zéro', regle: { texte: 'les calculs au résultat négatif', tirer() { const a = hasard(1, 15), b = hasard(1, 15); if (a === b) return this.tirer(); const e = Math.random() < .7 ? a + ' ' + moins + ' ' + b : moins + a + ' + ' + b; const v = valeur(e); return { label: e, ok: v < 0, info: e + ' = ' + String(v).replace('-', moins) }; } } },
  { titre: 'Égal à ½', description: 'Fractions, décimaux et pourcentages', regle: { texte: 'ce qui vaut ½ (une demie)', tirer() { const bons = ['1/2', '2/4', '3/6', '4/8', '5/10', '6/12', '0,5', '50 %', '0,50', '10/20'], faux = ['1/5', '2/5', '0,05', '5 %', '1/3', '3/4', '0,2', '25 %', '2/3', '0,25', '5/5', '15 %']; const ok = Math.random() < .5, l = pioche(ok ? bons : faux); return { label: l, ok, info: ok ? l + ' = ½' : l + ' n’est pas égal à ½' }; } } },
  { titre: 'Résultat 24', description: 'Des calculs plus grands', regle: regleCible(24) },
  { titre: 'Nombres premiers', description: 'Divisibles seulement par 1 et eux-mêmes', regle: { texte: 'les nombres premiers', tirer() { const v = Math.random() < .45 ? pioche([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59]) : hasard(4, 60); const ok = premier(v); return { label: String(v), ok, info: ok ? v + ' est premier' : v + ' = ' + diviseur(v) + ' ' + fois + ' ' + v / diviseur(v) }; } } }
];
const attrape = {
  id: 'attrape', titre: 'Attrape les bons', icone: '🧺', couleur: '#c2633a',
  resume: 'Déplace le panier et attrape seulement les bonnes réponses.',
  touches: 'Souris · ou flèches ◀ ▶',
  aide: 'Bouge la souris (ou ton doigt) sur le jeu pour déplacer le panier, ou garde les flèches ◀ ▶ enfoncées. Laisser tomber une bonne réponse ne coûte rien.',
  vitesse: true, pad: 'lr', curseur: 'none',
  niveaux: ATTRAPE,
  consigne(nv) { return 'Attrape seulement ' + nv.regle.texte + '. Laisse tomber les autres.'; },
  init(nv, J) {
    this.s = { nv, panier: W / 2, cibleX: null, items: [], minuteur: .6, pris: 0, but: 12, coeurs: 3, fini: false, gauche: false, droite: false, effets: [] };
    J.score('Attrapés : 0 / 12'); J.coeurs(3);
    J.message('Bouge le panier avec la souris ou les flèches ◀ ▶.');
  },
  touche(dir) { if (dir === 'gauche' || dir === 'droite') { this.s.cibleX = null; this.s.saut = dir; } },
  appui(dir, enBas) { if (dir === 'gauche' || dir === 'droite') { this.s[dir] = enBas; if (enBas) this.s.cibleX = null; } },
  survol(x) { this.s.cibleX = x; },
  clic(x) { this.s.cibleX = x; },
  maj(dt, J) {
    const s = this.s; if (s.fini) return;
    const v = { lent: 55, moyen: 85, rapide: 120 }[J.vitesse()] * (1 + J.niveau * .03);
    /* Basket */
    if (s.saut) { s.panier += s.saut === 'gauche' ? -40 : 40; s.saut = null; }
    if (s.gauche) s.panier -= 420 * dt;
    if (s.droite) s.panier += 420 * dt;
    if (s.cibleX !== null) s.panier += (s.cibleX - s.panier) * Math.min(1, dt * 14);
    s.panier = Math.max(65, Math.min(W - 65, s.panier));
    /* New objects: never too close together */
    s.minuteur -= dt;
    if (s.minuteur <= 0 && s.items.length < 4) {
      const it = s.nv.regle.tirer(); let x, essais = 0;
      do { x = hasard(70, W - 70); } while (s.items.some(o => o.y < 120 && Math.abs(o.x - x) < 130) && ++essais < 30);
      s.items.push({ ...it, x, y: -30 });
      s.minuteur = { lent: 2.1, moyen: 1.6, rapide: 1.2 }[J.vitesse()];
    }
    for (const o of s.items) o.y += v * dt;
    for (const o of s.items.slice()) {
      const dansPanier = o.y > H - 92 && o.y < H - 52 && Math.abs(o.x - s.panier) < 70;
      if (dansPanier) {
        s.items.splice(s.items.indexOf(o), 1);
        s.effets.push({ x: o.x, y: H - 90, t: 0, ok: o.ok });
        if (o.ok) {
          s.pris++; J.score('Attrapés : ' + s.pris + ' / ' + s.but); J.message('Oui ! ' + o.info + '.', 'bon');
          if (s.pris >= s.but) { s.fini = true; setTimeout(() => J.gagne(s.coeurs, 'Tu as attrapé ' + s.but + ' bonnes réponses.'), 300); }
        } else {
          s.coeurs--; J.coeurs(s.coeurs); J.message('Attention : ' + o.info + '.', 'oups');
          if (s.coeurs <= 0) { s.fini = true; setTimeout(() => J.perdu('Tu as attrapé ' + s.pris + ' bonnes réponses sur ' + s.but + '.'), 600); }
        }
      } else if (o.y > H + 30) s.items.splice(s.items.indexOf(o), 1);
    }
    for (const e of s.effets) e.t += dt;
    s.effets = s.effets.filter(e => e.t < .8);
  },
  dessin(ctx) {
    const s = this.s;
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#eaf3fb'); g.addColorStop(1, '#fbf3ea'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#d9ead3'; ctx.fillRect(0, H - 24, W, 24);
    for (const o of s.items) {
      ctx.font = '800 26px "Atkinson Hyperlegible", Arial, sans-serif';
      const w = Math.max(76, ctx.measureText(o.label).width + 32);
      rond(ctx, o.x - w / 2, o.y - 24, w, 48, 24); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = '#8fa3b5'; ctx.lineWidth = 2.5; ctx.stroke();
      texte(ctx, o.label, o.x, o.y + 1, 26, '#16324f', 800);
    }
    for (const e of s.effets) { ctx.globalAlpha = 1 - e.t / .8; texte(ctx, e.ok ? '✓' : '✗', e.x, e.y - e.t * 50, 34, e.ok ? '#1c8a52' : '#b5651d', 800); ctx.globalAlpha = 1; }
    /* Basket */
    const x = s.panier, y = H - 70;
    ctx.fillStyle = '#c2633a'; ctx.beginPath(); ctx.moveTo(x - 62, y); ctx.lineTo(x + 62, y); ctx.lineTo(x + 48, y + 44); ctx.lineTo(x - 48, y + 44); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#a24e2a'; ctx.lineWidth = 3;
    for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(x + k * 22, y + 4); ctx.lineTo(x + k * 17, y + 40); ctx.stroke(); }
    rond(ctx, x - 66, y - 8, 132, 12, 6); ctx.fillStyle = '#d98157'; ctx.fill();
  }
};

/* ================================================================
   Shared engine
   ================================================================ */
const JEUX = [labyrinthe, serpent, attrape];
JEUX.forEach(g => { g.palier = 'debutant'; });
/* The intermediate and advanced games are in other files; they receive the shared tools. */
const OUTILS = { W, H, hasard, pioche, melange, memoire, rond, etoile, texte, visage, DIRS, premier, diviseur, fois, moins, divise };
(window.ArcadeJeux || []).forEach(f => JEUX.push(...f(OUTILS)));

/* ================================================================
   ADDITION AND SUBTRACTION (no multiplication, division or fractions)
   Beginner: up to 30 · Intermediate: up to 50.
   These games reuse the existing games with other levels.
   ================================================================ */
const variante = (base, props) => Object.assign(Object.create(base), props);
const parId = id => JEUX.find(g => g.id === id);
/* An expression (addition or subtraction) whose result is v; no number goes above max. */
function ecrire(v, max, ops) {
  const sous = ops.includes('-') && v < max && (!ops.includes('+') || v < 2 || Math.random() < .5);
  if (sous) { const b = hasard(1, Math.min(15, max - v)); return (v + b) + ' ' + moins + ' ' + b; }
  const a = hasard(1, v - 1); return a + ' + ' + (v - a);
}
/* Close wrong answers (never negative). */
function prochesDe(r, max, k) {
  const out = [], vu = new Set([r]);
  const essai = v => { if (v >= 0 && v <= max + 10 && !vu.has(v)) { vu.add(v); out.push(v); } };
  melange([1, -1, 2, -2, 10, -10, 3, -3, 5, -5]).forEach(d => essai(r + d));
  for (let i = 0; out.length < k + 6 && i < 200; i++) essai(hasard(0, max));
  return out.slice(0, k);
}
const ADD = (min, max) => () => { const r = hasard(min, max), a = hasard(1, r - 1); return { q: a + ' + ' + (r - a), r }; };
const SOUS = (min, max) => () => { const a = hasard(min, max), b = hasard(1, a - 1); return { q: a + ' ' + moins + ' ' + b, r: a - b }; };
const MELANGE = (...f) => () => pioche(f)();
const DIZAINE = max => () => { const k = 10 * hasard(1, 3), a = hasard(2, max - k); return Math.random() < .5 ? { q: a + ' + ' + k, r: a + k } : { q: (a + k) + ' ' + moins + ' ' + k, r: a }; };
const RETENUE = max => () => { let a, b; do { a = hasard(6, max - 6); b = hasard(3, 9); } while (a % 10 + b < 10 || a + b > max); return { q: a + ' + ' + b, r: a + b }; };
const EMPRUNT = max => () => { let a, b; do { a = hasard(11, max); b = hasard(3, 9); } while (a % 10 >= b); return { q: a + ' ' + moins + ' ' + b, r: a - b }; };
const TROIS = max => () => { let a, b, c; do { a = hasard(5, 30); b = hasard(2, 15); c = hasard(2, 12); } while (a + b > max || a + b - c < 1); return { q: a + ' + ' + b + ' ' + moins + ' ' + c, r: a + b - c }; };

/* --- Calculation snake: a calculation is shown, the snake eats the right answer. --- */
/* Question display: "3 + 4 = ?", "7 + ? = 10" or "right after 39: ?". */
const affQ = q => q.includes('?') ? q : /^[A-Za-zÀ-ÿ]/.test(q) ? q + ' : ?' : q + ' = ?';
const repQ = (q, v) => q.includes('?') ? q.replace('?', v) : /^[A-Za-zÀ-ÿ]/.test(q) ? q + ' : ' + v : q + ' = ' + v;
function serpentCalcul(id, titre, palier, max, niveaux) {
  return variante(serpent, {
    id, titre, palier, niveaux,
    resume: 'Un calcul s’affiche : guide le serpent jusqu’à la bonne réponse.',
    consigne() { return 'Mange le nombre qui répond au calcul. Évite les autres nombres.'; },
    init(nv, J) {
      const jeu = this; this.J = J;
      const regle = { texte: '', max, test: () => false,
        bien(v) { const t = repQ(jeu.s.q.q, v) + '.'; jeu.question(); return t; },
        pourquoi(v) { return v + ' n’est pas la réponse de ' + jeu.s.q.q + '.'; } };
      serpent.init.call(this, { ...nv, but: nv.but || 6, regle }, J);
      this.question();
    },
    question() {
      const s = this.s; s.q = s.nv.tirer(); s.items = [];
      this.placer(s.q.r, true); prochesDe(s.q.r, max, 4).forEach(v => this.placer(v, false));
      this.J.consigne('Mange la réponse de :  ' + affQ(s.q.q));
    },
    placer(v, ok) {
      const s = this.s; let x, y, e = 0;
      do { x = hasard(0, this.G - 1); y = hasard(1, this.G - 1); } while (!this.libre(x, y) && ++e < 300);
      s.items.push({ x, y, v, ok });
    },
    ajouter() {
      const s = this.s; if (!s.q) return;
      if (!s.items.some(i => i.ok)) { this.placer(s.q.r, true); return; }
      const pris = new Set(s.items.map(i => i.v));
      this.placer(prochesDe(s.q.r, max, 12).find(v => !pris.has(v)) ?? hasard(0, max), false);
    },
    dessin(ctx, t) {
      serpent.dessin.call(this, ctx, t);
      const s = this.s; if (!s.q || s.attente) return;
      ctx.font = '800 24px "Atkinson Hyperlegible", Arial, sans-serif';
      const w = ctx.measureText(affQ(s.q.q)).width + 36;
      rond(ctx, W / 2 - w / 2, 3, w, 34, 10); ctx.fillStyle = '#ffffffe6'; ctx.fill(); ctx.strokeStyle = '#2f8f5b'; ctx.lineWidth = 2; ctx.stroke();
      texte(ctx, affQ(s.q.q), W / 2, 21, 24, '#16324f', 800);
    }
  });
}

/* --- Catch: calculations fall, catch those that follow the rule. --- */
const regleResultat = (cible, max, ops) => ({
  texte: 'les calculs qui donnent ' + cible,
  tirer() {
    if (Math.random() < .5) { const e = ecrire(cible, max, ops); return { label: e, ok: true, info: e + ' = ' + cible }; }
    let r; do { r = cible + pioche([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 10, -10]); } while (r < 1 || r > max);
    const e = ecrire(r, max, ops); return { label: e, ok: false, info: e + ' = ' + r + ', pas ' + cible };
  }
});
const regleTest = (texte, test, min, max, ops, explique) => ({
  texte,
  tirer() {
    const veut = Math.random() < .5, choix = [];
    for (let v = Math.max(1, min); v <= max; v++) if (test(v) === veut) choix.push(v);
    const r = pioche(choix), e = ecrire(r, max, ops);
    return { label: e, ok: test(r), info: e + ' = ' + r + (test(r) ? '' : ' : ' + explique) };
  }
});
const attrapeCalcul = (id, titre, palier, niveaux) => variante(attrape, { id, titre, palier, niveaux, resume: 'Des calculs tombent : attrape seulement ceux qui respectent la règle.' });

/* --- Maze and bridge: same games, new calculations. --- */
const labyBase = parId('labycalc'), pontBase = parId('pont');
const pontCalcul = (id, titre, palier, niveaux) => variante(pontBase, {
  id, titre, palier, niveaux,
  question(J) {
    const s = this.s; s.eq = s.nv.tirer();
    const vals = melange([s.eq.r, ...prochesDe(s.eq.r, 50, 3).filter(v => v > 0).slice(0, 3)]);
    s.planches = vals.map((v, i) => ({ v, x0: 28 + i * 130, y0: 452, x: 28 + i * 130, y: 452 }));
    s.choix = 0;
    J.score('Pont ' + s.pont + ' / 2 · trou ' + (s.trou + 1) + ' / 4');
  }
});
/* Missing number: the question hides one of the numbers. */
const MANQUE = (gen, place) => () => {
  const c = gen(), m = c.q.split(' '), signe = m[1];
  const a = +m[0], b = +m[2], r = c.r;
  if (place === 'gauche') return { q: '? ' + signe + ' ' + b + ' = ' + r, r: a };
  return { q: a + ' ' + signe + ' ? = ' + r, r: b };
};
const MANQUE_MIX = (...f) => () => pioche(f)();

const nouveaux = [
  serpentCalcul('serpcalc30', 'Serpent des calculs', 'debutant', 30, [
    { titre: 'Additions jusqu’à 10', description: '3 + 4 · mange 6 bonnes réponses', tirer: ADD(2, 10) },
    { titre: 'Soustractions jusqu’à 10', description: '9 − 5 · mange 6 bonnes réponses', tirer: SOUS(3, 10) },
    { titre: 'Additions jusqu’à 20', description: '12 + 6 · mange 6 bonnes réponses', tirer: ADD(8, 20) },
    { titre: 'Soustractions jusqu’à 20', description: '17 − 8 · mange 6 bonnes réponses', tirer: SOUS(10, 20) },
    { titre: 'Les deux jusqu’à 20', description: 'Additions et soustractions', tirer: MELANGE(ADD(8, 20), SOUS(10, 20)) },
    { titre: 'Additions jusqu’à 30', description: '18 + 9 · mange 8 bonnes réponses', tirer: ADD(15, 30), but: 8 },
    { titre: 'Soustractions jusqu’à 30', description: '28 − 13 · mange 8 bonnes réponses', tirer: SOUS(15, 30), but: 8 },
    { titre: 'Les deux jusqu’à 30', description: 'Additions et soustractions · 8 bonnes réponses', tirer: MELANGE(ADD(15, 30), SOUS(15, 30)), but: 8 }
  ]),
  attrapeCalcul('attrape30', 'Attrape les bons calculs', 'debutant', [
    { titre: 'Résultat 10', description: 'Des additions qui font 10', regle: regleResultat(10, 30, ['+']) },
    { titre: 'Résultat 12', description: 'Additions et soustractions', regle: regleResultat(12, 30, ['+', '-']) },
    { titre: 'Résultat 15', description: 'Additions et soustractions', regle: regleResultat(15, 30, ['+', '-']) },
    { titre: 'Résultat 20', description: 'Additions et soustractions', regle: regleResultat(20, 30, ['+', '-']) },
    { titre: 'Plus petit que 10', description: 'Calcule avant d’attraper', regle: regleTest('les calculs qui donnent moins de 10', v => v < 10, 1, 20, ['+', '-'], 'c’est 10 ou plus') },
    { titre: 'Plus grand que 15', description: 'Calcule avant d’attraper', regle: regleTest('les calculs qui donnent plus de 15', v => v > 15, 5, 30, ['+', '-'], 'c’est 15 ou moins') },
    { titre: 'Résultat 25', description: 'Additions et soustractions', regle: regleResultat(25, 30, ['+', '-']) },
    { titre: 'Résultat 30', description: 'Additions et soustractions', regle: regleResultat(30, 30, ['+', '-']) }
  ]),
  variante(labyBase, { id: 'labycalc50', titre: 'Labyrinthe des additions', palier: 'intermediaire', niveaux: [
    { titre: 'Additions jusqu’à 30', description: 'Labyrinthe 8 × 8', n: 8, tirer: ADD(12, 30) },
    { titre: 'Soustractions jusqu’à 30', description: 'Labyrinthe 8 × 8', n: 8, tirer: SOUS(12, 30) },
    { titre: 'Ajouter ou enlever des dizaines', description: '27 + 20 · labyrinthe 9 × 9', n: 9, tirer: DIZAINE(50) },
    { titre: 'Additions jusqu’à 50', description: 'Labyrinthe 9 × 9', n: 9, tirer: ADD(25, 50) },
    { titre: 'Soustractions jusqu’à 50', description: 'Labyrinthe 10 × 10', n: 10, tirer: SOUS(25, 50) },
    { titre: 'Additions en regroupant', description: '38 + 7 · labyrinthe 10 × 10', n: 10, tirer: RETENUE(50) },
    { titre: 'Soustractions en regroupant', description: '42 − 6 · labyrinthe 10 × 10', n: 10, tirer: EMPRUNT(50) },
    { titre: 'Trois nombres', description: '25 + 12 − 8 · labyrinthe 11 × 11', n: 11, tirer: TROIS(50) }
  ] }),
  serpentCalcul('serpcalc50', 'Serpent des calculs · 50', 'intermediaire', 50, [
    { titre: 'Ajouter 10, 20, 30', description: '17 + 20 · mange 6 bonnes réponses', tirer: () => { const k = 10 * hasard(1, 3), a = hasard(2, 50 - k); return { q: a + ' + ' + k, r: a + k }; } },
    { titre: 'Enlever 10, 20, 30', description: '46 − 20 · mange 6 bonnes réponses', tirer: () => { const k = 10 * hasard(1, 3), a = hasard(k + 1, 50); return { q: a + ' ' + moins + ' ' + k, r: a - k }; } },
    { titre: 'Additions jusqu’à 40', description: 'Mange 6 bonnes réponses', tirer: ADD(20, 40) },
    { titre: 'Soustractions jusqu’à 40', description: 'Mange 6 bonnes réponses', tirer: SOUS(20, 40) },
    { titre: 'Additions jusqu’à 50', description: 'Mange 8 bonnes réponses', tirer: ADD(25, 50), but: 8 },
    { titre: 'Soustractions jusqu’à 50', description: 'Mange 8 bonnes réponses', tirer: SOUS(25, 50), but: 8 },
    { titre: 'En regroupant', description: '37 + 8 · 43 − 7', tirer: MELANGE(RETENUE(50), EMPRUNT(50)), but: 8 },
    { titre: 'Les deux jusqu’à 50', description: 'Additions et soustractions · 10 bonnes réponses', tirer: MELANGE(ADD(25, 50), SOUS(25, 50)), but: 10 }
  ]),
  pontCalcul('pont50', 'Pont des additions', 'intermediaire', [
    { titre: 'Le nombre manquant (+)', description: '? + 7 = 25', tirer: MANQUE(ADD(10, 30), 'gauche') },
    { titre: 'Le nombre manquant (−)', description: '28 − ? = 15', tirer: MANQUE(SOUS(12, 30), 'droite') },
    { titre: 'Compléter une addition', description: '18 + ? = 40', tirer: MANQUE(ADD(20, 50), 'droite') },
    { titre: 'Compléter une soustraction', description: '? − 9 = 32', tirer: MANQUE(SOUS(20, 50), 'gauche') },
    { titre: 'Les dizaines', description: '? + 20 = 47', tirer: () => { const k = 10 * hasard(1, 3), a = hasard(2, 50 - k); return Math.random() < .5 ? { q: '? + ' + k + ' = ' + (a + k), r: a } : { q: a + ' + ? = ' + (a + k), r: k }; } },
    { titre: 'Addition en regroupant', description: '? + 8 = 43', tirer: MANQUE(RETENUE(50), 'gauche') },
    { titre: 'Soustraction en regroupant', description: '45 − ? = 38', tirer: MANQUE(EMPRUNT(50), 'droite') },
    { titre: 'Un peu de tout', description: 'Additions et soustractions jusqu’à 50', tirer: MANQUE_MIX(MANQUE(ADD(20, 50), 'gauche'), MANQUE(ADD(20, 50), 'droite'), MANQUE(SOUS(20, 50), 'gauche'), MANQUE(SOUS(20, 50), 'droite')) }
  ]),
  attrapeCalcul('attrape50', 'Attrape les calculs · 50', 'intermediaire', [
    { titre: 'Résultat 30', description: 'Additions et soustractions', regle: regleResultat(30, 50, ['+', '-']) },
    { titre: 'Résultat 35', description: 'Additions et soustractions', regle: regleResultat(35, 50, ['+', '-']) },
    { titre: 'Plus grand que 30', description: 'Calcule avant d’attraper', regle: regleTest('les calculs qui donnent plus de 30', v => v > 30, 15, 50, ['+', '-'], 'c’est 30 ou moins') },
    { titre: 'Résultat 40', description: 'Additions et soustractions', regle: regleResultat(40, 50, ['+', '-']) },
    { titre: 'Les dizaines rondes', description: '10, 20, 30, 40, 50', regle: regleTest('les calculs qui donnent 10, 20, 30, 40 ou 50', v => v % 10 === 0, 5, 50, ['+', '-'], 'ce n’est pas une dizaine ronde') },
    { titre: 'Résultat 45', description: 'Additions et soustractions', regle: regleResultat(45, 50, ['+', '-']) },
    { titre: 'Entre 20 et 30', description: 'Calcule avant d’attraper', regle: regleTest('les calculs qui donnent entre 20 et 30', v => v >= 20 && v <= 30, 8, 45, ['+', '-'], 'ce n’est pas entre 20 et 30') },
    { titre: 'Résultat 50', description: 'Additions et soustractions', regle: regleResultat(50, 50, ['+', '-']) }
  ])
];
JEUX.push(...nouveaux);

/* ================================================================
   NEW GAMES: up to 100 and 1,000, place value, kinds of numbers.
   ================================================================ */
const pl = (n, m) => n + ' ' + (n > 1 ? m + 's' : m);
const DIZ_U = () => { const d = hasard(1, 9), u = hasard(0, 9); return { q: pl(d, 'dizaine') + ' + ' + pl(u, 'unité'), r: d * 10 + u }; };
const CDU = () => { const c = hasard(1, 9), d = hasard(0, 9), u = hasard(0, 9); return { q: c + ' C + ' + d + ' D + ' + u + ' U', r: c * 100 + d * 10 + u }; };
const DECOMP = () => { const c = hasard(1, 9), d = hasard(1, 9), u = hasard(1, 9); return { q: (c * 100) + ' + ' + (d * 10) + ' + ' + u, r: c * 100 + d * 10 + u }; };
const CHIFFRE = () => { const n = hasard(102, 987), k = hasard(0, 2), nom = ['unités', 'dizaines', 'centaines'][k]; return { q: 'le chiffre des ' + nom + ' de ' + n, r: Math.floor(n / 10 ** k) % 10 }; };
const PLUS10 = (max) => () => { const k = pioche([10, 100]), a = hasard(1, max - k); return Math.random() < .5 ? { q: a + ' + ' + k, r: a + k } : { q: (a + k) + ' ' + moins + ' ' + k, r: a }; };
const REG_ADD = (max) => () => { let a, b; do { a = hasard(12, max - 12); b = hasard(12, max - a); } while (a % 10 + b % 10 < 10); return { q: a + ' + ' + b, r: a + b }; };
const REG_SOUS = (max) => () => { let a, b; do { a = hasard(21, max); b = hasard(11, a - 5); } while (a % 10 >= b % 10); return { q: a + ' ' + moins + ' ' + b, r: a - b }; };
const AVANT_APRES = () => { const n = pioche([hasard(10, 99), hasard(1, 9) * 100, hasard(1, 9) * 100 - 1, hasard(100, 999)]); return Math.random() < .5 ? { q: 'juste après ' + n, r: n + 1 } : { q: 'juste avant ' + n, r: n - 1 }; };
const COMPL = (cible) => () => { const a = cible === 10 ? hasard(1, 9) : cible === 100 ? hasard(11, 89) : hasard(11, 89) * 10; return { q: a + ' + ? = ' + cible, r: cible - a }; };
const estPremier = n => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };
const CARRES = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100], TRIS = [1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66, 78, 91];
/* "Catch" rule with numbers only (no calculation). */
const regleNombre = (texte, test, min, max, explique) => ({
  texte,
  tirer() {
    const veut = Math.random() < .5, choix = [];
    for (let v = min; v <= max; v++) if (test(v) === veut) choix.push(v);
    const v = pioche(choix); return { label: String(v), ok: test(v), info: v + (test(v) ? '' : ' : ' + explique) };
  }
});
const pontCalcul100 = (id, titre, palier, max, niveaux) => variante(pontBase, {
  id, titre, palier, niveaux,
  question(J) {
    const s = this.s; s.eq = s.nv.tirer();
    const vals = melange([s.eq.r, ...prochesDe(s.eq.r, max, 3).filter(v => v >= 0).slice(0, 3)]);
    s.planches = vals.map((v, i) => ({ v, x0: 28 + i * 130, y0: 452, x: 28 + i * 130, y: 452 }));
    s.choix = 0;
    J.score('Pont ' + s.pont + ' / 2 · trou ' + (s.trou + 1) + ' / 4');
  }
});
const nouveaux2 = [
  serpentCalcul('serpvaleur', 'Serpent des nombres', 'debutant', 100, [
    { titre: 'Dizaines et unités', description: '3 dizaines + 4 unités · mange 6 réponses', tirer: DIZ_U },
    { titre: 'Juste avant, juste après', description: 'Juste après 39 · mange 6 réponses', tirer: () => { const n = hasard(10, 99); return Math.random() < .5 ? { q: 'juste après ' + n, r: n + 1 } : { q: 'juste avant ' + n, r: n - 1 }; } },
    { titre: 'Compléter à 10', description: '7 + ? = 10', tirer: COMPL(10) },
    { titre: 'Les doubles', description: '6 + 6 · mange 6 réponses', tirer: () => { const a = hasard(1, 20); return { q: a + ' + ' + a, r: 2 * a }; } },
    { titre: 'Ajouter ou enlever 10', description: '47 + 10 · 63 − 10', tirer: () => { const a = hasard(10, 89); return Math.random() < .5 ? { q: a + ' + 10', r: a + 10 } : { q: (a + 10) + ' ' + moins + ' 10', r: a }; } },
    { titre: 'Les moitiés', description: 'La moitié de 16', tirer: () => { const a = hasard(1, 25); return { q: 'la moitié de ' + (2 * a), r: a }; } },
    { titre: 'Compléter à 100', description: '35 + ? = 100 · mange 8 réponses', tirer: COMPL(100), but: 8 },
    { titre: 'Un peu de tout', description: 'Mange 8 bonnes réponses', tirer: MELANGE(DIZ_U, COMPL(10), COMPL(100)), but: 8 }
  ]),
  attrapeCalcul('attrapenb', 'Attrape les nombres', 'debutant', [
    { titre: 'Les nombres pairs', description: '2, 4, 6, 8…', regle: regleNombre('les nombres pairs', v => v % 2 === 0, 1, 30, 'il est impair') },
    { titre: 'Les nombres impairs', description: '1, 3, 5, 7…', regle: regleNombre('les nombres impairs', v => v % 2 === 1, 1, 30, 'il est pair') },
    { titre: 'Plus grands que 50', description: 'Compare avec 50', regle: regleNombre('les nombres plus grands que 50', v => v > 50, 20, 90, 'il est plus petit que 50 ou égal') },
    { titre: 'Entre 30 et 40', description: '31, 32… 39', regle: regleNombre('les nombres entre 30 et 40', v => v > 30 && v < 40, 15, 60, 'il n’est pas entre 30 et 40') },
    { titre: 'Les dizaines rondes', description: '10, 20, 30…', regle: regleNombre('les dizaines rondes', v => v % 10 === 0, 5, 100, 'ce n’est pas une dizaine ronde') },
    { titre: 'Les multiples de 5', description: '5, 10, 15, 20…', regle: regleNombre('les multiples de 5', v => v % 5 === 0, 1, 60, 'ce n’est pas un multiple de 5') },
    { titre: 'Les nombres carrés', description: '1, 4, 9, 16…', regle: regleNombre('les nombres carrés', v => CARRES.includes(v), 1, 100, 'ce n’est pas un nombre carré') },
    { titre: 'Les nombres premiers', description: '2, 3, 5, 7, 11…', regle: regleNombre('les nombres premiers', estPremier, 2, 50, 'il a plus de 2 diviseurs') }
  ]),
  serpentCalcul('serpcalc100', 'Serpent des calculs · 100', 'intermediaire', 100, [
    { titre: 'Ajouter des dizaines', description: '34 + 20 · mange 6 réponses', tirer: () => { const k = 10 * hasard(1, 5), a = hasard(2, 99 - k); return { q: a + ' + ' + k, r: a + k }; } },
    { titre: 'Enlever des dizaines', description: '76 − 30 · mange 6 réponses', tirer: () => { const k = 10 * hasard(1, 5), a = hasard(k + 1, 99); return { q: a + ' ' + moins + ' ' + k, r: a - k }; } },
    { titre: 'Additions jusqu’à 100', description: '45 + 32 · sans regrouper', tirer: () => { let a, b; do { a = hasard(11, 70); b = hasard(11, 99 - a); } while (a % 10 + b % 10 >= 10); return { q: a + ' + ' + b, r: a + b }; } },
    { titre: 'Soustractions jusqu’à 100', description: '87 − 34 · sans regrouper', tirer: () => { let a, b; do { a = hasard(30, 99); b = hasard(11, a - 10); } while (a % 10 < b % 10); return { q: a + ' ' + moins + ' ' + b, r: a - b }; } },
    { titre: 'Additions en regroupant', description: '47 + 38', tirer: REG_ADD(100) },
    { titre: 'Soustractions en regroupant', description: '52 − 27', tirer: REG_SOUS(99) },
    { titre: 'Les deux, en regroupant', description: 'Mange 8 bonnes réponses', tirer: MELANGE(REG_ADD(100), REG_SOUS(99)), but: 8 },
    { titre: 'Un peu de tout', description: 'Mange 10 bonnes réponses', tirer: MELANGE(ADD(30, 100), SOUS(30, 99), REG_ADD(100), REG_SOUS(99)), but: 10 }
  ]),
  variante(labyBase, { id: 'labyvaleur', titre: 'Labyrinthe des centaines', palier: 'intermediaire', niveaux: [
    { titre: 'C, D, U', description: '3 C + 4 D + 5 U · labyrinthe 8 × 8', n: 8, tirer: CDU },
    { titre: 'Décomposer', description: '300 + 40 + 5 · labyrinthe 8 × 8', n: 8, tirer: DECOMP },
    { titre: 'Le chiffre des…', description: 'Chiffre des dizaines de 472', n: 9, tirer: CHIFFRE },
    { titre: 'Avant, après', description: 'Juste avant 400', n: 9, tirer: AVANT_APRES },
    { titre: 'Ajouter 10 ou 100', description: '345 + 100 · labyrinthe 10 × 10', n: 10, tirer: PLUS10(999) },
    { titre: 'Compléter à 100', description: '100 − 64 : ce qui manque à 64 pour faire 100', n: 10, tirer: () => { const a = hasard(11, 89); return { q: '100 ' + moins + ' ' + a, r: 100 - a }; } },
    { titre: 'Compléter à 1 000', description: '1000 − 700 : ce qui manque pour faire 1000', n: 10, tirer: () => { const a = hasard(11, 89) * 10; return { q: '1000 ' + moins + ' ' + a, r: 1000 - a }; } },
    { titre: 'Un peu de tout', description: 'Labyrinthe 11 × 11', n: 11, tirer: MELANGE(CDU, DECOMP, CHIFFRE, AVANT_APRES, PLUS10(999)) }
  ] }),
  pontCalcul100('pont100', 'Pont des nombres manquants · 100', 'intermediaire', 100, [
    { titre: 'Compléter à 100', description: '45 + ? = 100', tirer: COMPL(100) },
    { titre: 'Le nombre manquant (+)', description: '? + 25 = 70', tirer: MANQUE(ADD(30, 100), 'gauche') },
    { titre: 'Le nombre manquant (−)', description: '83 − ? = 41', tirer: MANQUE(SOUS(30, 99), 'droite') },
    { titre: 'Compléter une addition', description: '38 + ? = 91', tirer: MANQUE(REG_ADD(100), 'droite') },
    { titre: 'Compléter une soustraction', description: '? − 27 = 45', tirer: MANQUE(REG_SOUS(99), 'gauche') },
    { titre: 'Les dizaines', description: '? + 40 = 76', tirer: () => { const k = 10 * hasard(1, 6), a = hasard(2, 99 - k); return Math.random() < .5 ? { q: '? + ' + k + ' = ' + (a + k), r: a } : { q: a + ' + ? = ' + (a + k), r: k }; } },
    { titre: 'Les doubles', description: '? + ? = 64', tirer: () => { const a = hasard(5, 49); return { q: '? + ? = ' + (2 * a), r: a }; } },
    { titre: 'Un peu de tout', description: 'Additions et soustractions jusqu’à 100', tirer: MANQUE_MIX(MANQUE(ADD(30, 100), 'gauche'), MANQUE(ADD(30, 100), 'droite'), MANQUE(SOUS(30, 99), 'gauche'), MANQUE(SOUS(30, 99), 'droite')) }
  ]),
  attrapeCalcul('attrape100', 'Attrape les calculs · 100', 'avance', [
    { titre: 'Résultat 60', description: 'Additions et soustractions', regle: regleResultat(60, 100, ['+', '-']) },
    { titre: 'Résultat 75', description: 'Additions et soustractions', regle: regleResultat(75, 100, ['+', '-']) },
    { titre: 'Plus grand que 50', description: 'Calcule avant d’attraper', regle: regleTest('les calculs qui donnent plus de 50', v => v > 50, 20, 100, ['+', '-'], 'c’est 50 ou moins') },
    { titre: 'Résultat 100', description: 'Les compléments à 100', regle: regleResultat(100, 100, ['+', '-']) },
    { titre: 'Les résultats pairs', description: 'Calcule, puis regarde les unités', regle: regleTest('les calculs dont le résultat est pair', v => v % 2 === 0, 10, 100, ['+', '-'], 'le résultat est impair') },
    { titre: 'Les dizaines rondes', description: '40, 50, 60…', regle: regleTest('les calculs qui donnent une dizaine ronde', v => v % 10 === 0, 20, 100, ['+', '-'], 'ce n’est pas une dizaine ronde') },
    { titre: 'Entre 40 et 60', description: 'Calcule avant d’attraper', regle: regleTest('les calculs qui donnent entre 40 et 60', v => v >= 40 && v <= 60, 15, 95, ['+', '-'], 'ce n’est pas entre 40 et 60') },
    { titre: 'Résultat 90', description: 'Additions et soustractions', regle: regleResultat(90, 100, ['+', '-']) }
  ])
];
JEUX.push(...nouveaux2);
/* Multiplication, division and fractions: advanced level. */
for (const id of ['serpent', 'attrape', 'labycalc', 'serpfrac', 'pont']) { const g = parId(id); if (g) g.palier = 'avance'; }
const ORDRE_JEUX = ['labyrinthe', 'serpcalc30', 'attrape30', 'serpvaleur', 'attrapenb', 'labycalc50', 'serpcalc50', 'pont50', 'attrape50', 'serpcalc100', 'labyvaleur', 'pont100', 'fusee', 'caisses', 'serpent', 'attrape', 'labycalc', 'serpfrac', 'pont', 'attrape100', 'robot', 'caissesx', 'laser', 'glisse', 'droite'];
const rangJeu = g => { const i = ORDRE_JEUX.indexOf(g.id); return i < 0 ? 99 : i; };
JEUX.sort((a, b) => rangJeu(a) - rangJeu(b));
// MathJeux has the logic games and the maths games; the four curriculum games (path, sequences, solids, figures) stay on Mathéroute.
for (let i = JEUX.length - 1; i >= 0; i--) if (!['labyrinthe', 'caisses', 'robot', 'caissesx', 'laser', 'serpcalc30', 'attrape30', 'labycalc50', 'serpcalc50', 'pont50', 'attrape50', 'serpcalc100', 'pont100', 'attrape100', 'serpvaleur', 'attrapenb', 'labyvaleur', 'serpent', 'attrape', 'labycalc', 'serpfrac', 'pont', 'glisse', 'fusee', 'droite'].includes(JEUX[i].id)) JEUX.splice(i, 1);
const PALIERS = { debutant: 'Débutant', intermediaire: 'Intermédiaire', avance: 'Avancé' };
let jeu = null, niv = 0, enPause = false, enCours = false, dernier = 0, temps = 0;
const canvas = el('ecran'), ctx = canvas.getContext('2d');
const vitesseSel = el('vitesse');
vitesseSel.value = memoire.lire('arcade-vitesse', 'moyen');
vitesseSel.onchange = () => { memoire.ecrire('arcade-vitesse', vitesseSel.value); canvas.focus({ preventScroll: true }); };

function ajusterEcran() {
  const r = Math.min(3, window.devicePixelRatio || 1);
  canvas.width = W * r; canvas.height = H * r; ctx.setTransform(r, 0, 0, r, 0, 0);
}
ajusterEcran();

const J = {
  message(t, type) { const m = el('message'); m.textContent = t || ''; m.className = 'arc-message' + (type ? ' ' + type : ''); },
  score(t) { el('score').textContent = t; },
  coeurs(n) { const c = el('coeurs'); if (n === '') { c.textContent = ''; c.removeAttribute('aria-label'); return; } c.textContent = '❤️'.repeat(Math.max(0, n)) + '🤍'.repeat(Math.max(0, 3 - n)); c.setAttribute('aria-label', n + ' cœurs sur 3'); },
  vitesse() { return vitesseSel.value; },
  consigne(t) { el('consigne').textContent = t; },
  bouton(id, p) { const b = el('action-' + id); if (!b) return; if ('texte' in p) b.textContent = p.texte; if ('actif' in p) b.disabled = !p.actif; if ('cache' in p) b.hidden = p.cache; },
  get niveau() { return niv; },
  gagne(etoiles, texte) { fin(true, etoiles, texte); },
  perdu(texte) { fin(false, 0, texte); }
};

function montrer(id) { for (const s of ['accueil', 'choixNiveau', 'partie']) el(s).hidden = s !== id; }

function accueil() {
  enCours = false; montrer('accueil'); history.replaceState(null, '', location.pathname);
  const liste = el('listeJeux'); liste.textContent = '';
  let palier = null;
  for (const g of JEUX) {
    if (g.palier !== palier) { palier = g.palier; const h = document.createElement('h2'); h.className = 'arc-palier'; h.textContent = PALIERS[palier]; liste.append(h); }
    const b = document.createElement('button'); b.type = 'button'; b.className = 'arc-jeu'; b.style.setProperty('--c', g.couleur);
    const meilleurs = g.niveaux.filter((_, k) => memoire.lire('arcade-' + g.id + '-' + (k + 1), 0) > 0).length;
    b.innerHTML = '<span class="arc-icone" aria-hidden="true"></span><strong></strong><small></small><span class="arc-touches"></span><small class="arc-fait"></small>';
    b.children[0].textContent = g.icone; b.children[1].textContent = g.titre; b.children[2].textContent = g.resume;
    b.children[3].textContent = '🎮 ' + g.touches; b.children[4].textContent = g.niveaux.length + ' niveaux' + (meilleurs ? ' · ' + meilleurs + ' réussis' : '');
    b.onclick = () => choisirJeu(g);
    liste.append(b);
  }
}

function choisirJeu(g) {
  jeu = g; enCours = false; montrer('choixNiveau');
  history.replaceState(null, '', '?j=' + g.id);
  el('niveauxTitre').textContent = g.icone + ' ' + g.titre;
  /* Illustrated banner (same drawings as the tiles of the Games page) */
  const il = ILLUS_JEUX[g.id] || { c1: g.couleur, c2: '#cfd8e3', svg: '' };
  const bn = el('niveauxBanniere'); bn.style.setProperty('--c1', il.c1); bn.style.setProperty('--c2', il.c2);
  el('niveauxIllu').innerHTML = il.svg; el('niveauxBadge').textContent = g.niveaux.length + ' niveaux';
  el('niveauxIntro').textContent = g.resume + ' ' + g.aide;
  const ol = el('niveaux'); ol.textContent = '';
  const premierAFaire = g.niveaux.findIndex((_, k) => !memoire.lire('arcade-' + g.id + '-' + (k + 1), 0));
  g.niveaux.forEach((n, k) => {
    const best = memoire.lire('arcade-' + g.id + '-' + (k + 1), 0);
    const li = document.createElement('li'), b = document.createElement('button');
    b.type = 'button'; b.className = 'niveau-carte' + (best ? ' fait' : '') + (k === premierAFaire ? ' conseille' : '');
    b.style.setProperty('--c', g.couleur);
    b.innerHTML = '<span class="niveau-num"></span><span class="niveau-texte"><strong></strong><small></small></span><span class="niveau-etat"></span>';
    b.querySelector('.niveau-num').textContent = k + 1;
    b.querySelector('strong').textContent = n.titre; b.querySelector('small').textContent = n.description;
    const etat = b.querySelector('.niveau-etat');
    if (best) { etat.textContent = '★'.repeat(best) + '☆'.repeat(3 - best); etat.classList.add('etoiles'); } else if (k === premierAFaire) etat.textContent = 'À faire ensuite';
    b.setAttribute('aria-label', 'Niveau ' + (k + 1) + ' : ' + n.titre + (best ? '. Réussi avec ' + best + ' étoiles sur 3.' : ''));
    b.onclick = () => commencer(k + 1);
    li.append(b); ol.append(li);
  });
  const c = ol.querySelector('.conseille') || ol.querySelector('button'); if (c) c.focus({ preventScroll: true });
}

let debutPartie = 0;
function commencer(n) {
  niv = n; debutPartie = Date.now(); const nv = jeu.niveaux[n - 1];
  history.replaceState(null, '', '?j=' + jeu.id + '&n=' + n);
  montrer('partie'); el('fin').hidden = true;
  el('partieTitre').textContent = jeu.icone + ' ' + jeu.titre + ' · niveau ' + n;
  /* Game-specific buttons (Undo, Launch…) */
  const zone = el('actions'); zone.textContent = '';
  for (const bt of jeu.boutons || []) {
    const b = document.createElement('button'); b.type = 'button'; b.id = 'action-' + bt.id; b.className = bt.principal ? 'bouton-principal' : 'bouton-doux';
    b.textContent = bt.texte; if (bt.titre) b.title = bt.titre;
    b.onclick = () => { if (!enCours) return; if (enPause) mettrePause(false); jeu.action(bt.id, J); canvas.focus({ preventScroll: true }); };
    zone.append(b);
  }
  zone.hidden = !(jeu.boutons || []).length;
  el('consigne').textContent = jeu.consigne(nv);
  el('aide').textContent = jeu.aide + ' Espace ou P : pause.';
  el('vitesse').parentElement.hidden = !jeu.vitesse;
  canvas.style.cursor = jeu.curseur || 'pointer';
  /* On-screen arrows: all, only ◀ ▶ ("lr"), without ▼ ("hgd") or none (false). */
  const pad = jeu.pad === undefined ? 'tout' : jeu.pad;
  document.querySelector('.arc-pad').hidden = !pad;
  document.querySelectorAll('.arc-pad button').forEach(b => { const d = b.dataset.dir; b.hidden = pad === 'lr' ? (d === 'haut' || d === 'bas') : pad === 'hgd' ? d === 'bas' : false; });
  jeu.init(nv, J);
  enCours = true; mettrePause(false);
  canvas.focus({ preventScroll: true });
  window.scrollTo({ top: el('partie').offsetTop - 10, behavior: 'auto' });
}

function mettrePause(p) {
  enPause = p; const b = el('pause');
  b.setAttribute('aria-pressed', String(p)); b.textContent = p ? '▶ Reprendre' : '⏸ Pause';
}

function fin(gagne, etoiles, texte) {
  if (!enCours) return;
  enCours = false;
  const cle = 'arcade-' + jeu.id + '-' + niv;
  if (gagne && etoiles > memoire.lire(cle, 0)) memoire.ecrire(cle, etoiles);
  el('finIcone').textContent = gagne ? '🎉' : '🌱';
  el('finTitre').textContent = gagne ? 'Bravo, niveau réussi !' : 'Pas grave, on réessaie !';
  el('finNiveau').textContent = jeu.titre + ' · niveau ' + niv + ' : ' + jeu.niveaux[niv - 1].titre;
  el('finEtoiles').textContent = gagne ? '★'.repeat(etoiles) + '☆'.repeat(3 - etoiles) : '';
  el('finTexte').textContent = texte + (gagne ? (etoiles === 3 ? ' Parfait !' : ' Tu peux rejouer pour gagner plus d’étoiles.') : (jeu.vitesse ? ' Tu peux choisir la vitesse lente si tu veux.' : ' Prends ton temps, il n’y a pas de minuterie.'));
  const suivant = el('finSuivant'); suivant.hidden = !gagne || niv >= jeu.niveaux.length;
  /* Level passed: the score (stars) is kept in the signed-in student's space. */
  const sv = el('finSauvegarde'); sv.textContent = ''; sv.className = 'bilan-sauvegarde';
  if (gagne && window.EC && EC.enregistrerNiveau) {
    sv.textContent = 'Enregistrement du score…';
    EC.enregistrerNiveau({ activity: 'jeu-' + jeu.id, level: niv, score: etoiles, total: 3, seconds: Math.min(86400, Math.round((Date.now() - debutPartie) / 1000)) }).then(r => {
      sv.textContent = r.ok ? '✓ Score gardé dans ton espace.' : r.raison === 'invite' ? 'Tu n’es pas connecté : connecte-toi pour garder ton score.' : r.raison === 'enseignante' ? 'Compte enseignante : le score n’est pas enregistré.' : 'Le score n’a pas pu être enregistré. Réessaie plus tard.';
    });
  }
  el('fin').hidden = false;
  el('finTitre').focus();
}

el('finSuivant').onclick = () => commencer(niv + 1);
el('finRejouer').onclick = () => commencer(niv);
el('finMenu').onclick = () => { el('fin').hidden = true; choisirJeu(jeu); };
el('retourJeux').onclick = () => { location.href = 'index.html'; };
el('quitterPartie').onclick = () => choisirJeu(jeu);
el('pause').onclick = () => { if (enCours) mettrePause(!enPause); canvas.focus({ preventScroll: true }); };

/* Keyboard */
const tenues = new Set();
window.addEventListener('keydown', e => {
  if (!enCours || !el('fin').hidden) return;
  if (e.target && /^(SELECT|INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
  if (e.key === ' ' || e.key === 'p' || e.key === 'P') { e.preventDefault(); mettrePause(!enPause); return; }
  if (jeu.clavier && jeu.clavier(e.key, J)) { e.preventDefault(); if (enPause) mettrePause(false); return; }
  const dir = TOUCHES[e.key] || TOUCHES[e.key.toLowerCase && e.key.toLowerCase()];
  if (!dir) return;
  e.preventDefault();
  if (enPause) mettrePause(false);
  if (jeu.appui) { jeu.appui(dir, true); tenues.add(dir); return; }
  jeu.touche(dir, J);
});
window.addEventListener('keyup', e => {
  const dir = TOUCHES[e.key] || TOUCHES[e.key.toLowerCase && e.key.toLowerCase()];
  if (dir && jeu && jeu.appui) { jeu.appui(dir, false); tenues.delete(dir); }
});

/* Mouse and finger */
const point = e => { const r = canvas.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
canvas.addEventListener('pointerdown', e => {
  if (!enCours) return; canvas.focus({ preventScroll: true });
  if (enPause) { mettrePause(false); return; }
  const [x, y] = point(e); appuye = true;
  if (jeu.glisse || jeu.relache) { try { canvas.setPointerCapture(e.pointerId); } catch {} }
  if (jeu.clic) jeu.clic(x, y, J);
});
let appuye = false;
canvas.addEventListener('pointermove', e => {
  if (!enCours || enPause) return;
  const [x, y] = point(e);
  if (jeu.survol) jeu.survol(x, y, J);
  if (appuye && jeu.glisse) jeu.glisse(x, y, J);
});
const lacherPointeur = e => { if (!appuye) return; appuye = false; if (enCours && !enPause && jeu.relache) { const [x, y] = point(e); jeu.relache(x, y, J); } };
canvas.addEventListener('pointerup', lacherPointeur); canvas.addEventListener('pointercancel', lacherPointeur);

/* On-screen arrows (held down for the basket) */
document.querySelectorAll('.arc-pad button').forEach(b => {
  const dir = b.dataset.dir;
  b.addEventListener('pointerdown', e => {
    e.preventDefault(); if (!enCours) return;
    if (enPause) mettrePause(false);
    if (jeu.appui) jeu.appui(dir, true); else jeu.touche(dir, J);
  });
  const lacher = () => { if (jeu && jeu.appui) jeu.appui(dir, false); };
  b.addEventListener('pointerup', lacher); b.addEventListener('pointerleave', lacher); b.addEventListener('pointercancel', lacher);
});

/* Automatic pause when leaving the tab */
document.addEventListener('visibilitychange', () => { if (document.hidden && enCours) mettrePause(true); });
window.addEventListener('blur', () => { if (enCours && jeu && jeu.vitesse) mettrePause(true); tenues.forEach(d => jeu && jeu.appui && jeu.appui(d, false)); tenues.clear(); });

/* Animation loop */
function boucle(t) {
  const dt = Math.min(.05, (t - dernier) / 1000 || 0); dernier = t;
  if (jeu && jeu.s && !el('partie').hidden) {
    if (enCours && !enPause) { temps += dt; jeu.maj(dt, J); }
    ctx.save(); jeu.dessin(ctx, temps); ctx.restore();
    if (enPause) {
      ctx.fillStyle = '#16324fa0'; ctx.fillRect(0, 0, W, H);
      texte(ctx, '⏸ Pause', W / 2, H / 2 - 20, 44, '#fff');
      texte(ctx, 'Espace, P ou un clic pour reprendre', W / 2, H / 2 + 30, 22, '#fff', 400);
    }
  }
  requestAnimationFrame(boucle);
}
requestAnimationFrame(boucle);

/* Reading the state (useful to test the games). */
window.ArcadeEtat = () => jeu && { jeu: jeu.id, niveau: niv, enCours, enPause, s: jeu.s };

/* Direct link: arcade.html?j=serpent&n=2 */
const q = new URLSearchParams(location.search), g = JEUX.find(x => x.id === q.get('j'));
if (g) { choisirJeu(g); const n = +q.get('n'); if (n >= 1 && n <= g.niveaux.length) commencer(n); } else accueil();
})();
